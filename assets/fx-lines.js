/* Обложка: «отделка из света». Светящиеся линии прорисовывают интерьер дизайн-проекта,
   затем из них проявляется готовая отделка. Сцены идут по кругу. */
(function () {
  const cv = document.getElementById('fx');
  if (!cv) return;
  const stage = document.getElementById('fxStage');
  const fallback = document.getElementById('fxFallback');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const BASE = window.BASE || '';
  const SCENES = [
    { photo: 'd2', label: 'Переговорная зона' },
    { photo: 'd1', label: 'Рабочая зона' },
    { photo: 'd10', label: 'Переговорная у окна' }
  ];
  const DUR = 11.5; // секунд на сцену
  const STAGES = [[0, '01 · Разметка'], [.22, '02 · Каркас'], [.40, '03 · Отделка'], [.80, '04 · Готово']];

  const gl = !reduce && (cv.getContext('webgl', { antialias: false, premultipliedAlpha: false, alpha: false }) || cv.getContext('experimental-webgl'));
  if (!gl) { cv.remove(); return; }

  const vs = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
  const fs = `precision mediump float;
varying vec2 v;
uniform sampler2D uPhoto,uMap;
uniform vec2 uRes,uImg;
uniform float uT;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float ss(float a,float b,float x){return smoothstep(a,b,x);}
void main(){
  /* cover-fit + медленный наезд камеры */
  float ra=uRes.x/uRes.y, ia=uImg.x/uImg.y;
  vec2 uv=v; uv.y=1.-uv.y;
  vec2 sc=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);
  float zoom=1.08-.06*uT;
  uv=(uv-.5)*sc/zoom+.5;
  vec3 photo=texture2D(uPhoto,uv).rgb;
  vec3 m=texture2D(uMap,uv).rgb; /* r=линия g=порядок b=свечение */
  float L=clamp((uT-.02)/.40,0.,1.)*1.03;
  float drawn=step(m.g,L)*step(.001,m.g+m.r);
  float tip=exp(-pow((L-m.g)*26.,2.))*step(m.g,L+.02);
  /* проявление отделки: снизу вверх с «живым» фронтом */
  float field=(1.-uv.y)*.68+n(uv*vec2(5.,4.))*.32;
  float R=ss(.38,.80,uT)*1.12-.06;
  float rev=1.-ss(R-.06,R,field);
  float seam=exp(-pow((field-R)*22.,2.))*step(.38,uT)*(1.-ss(.80,.86,uT));
  /* фон: тёмный «чертёж» с сеткой и тенью пространства */
  vec2 gp=v*uRes/42.;
  float grid=max(ss(.96,1.,fract(gp.x)),ss(.96,1.,fract(gp.y)))*.05;
  float lum=dot(photo,vec3(.3,.59,.11));
  vec3 dark=vec3(.05,.04,.035)+vec3(.9,.65,.35)*grid+vec3(lum)*.07*ss(.0,.3,uT);
  /* готовая картинка: сначала тёплая и приглушённая, потом полный цвет */
  vec3 warm=mix(vec3(lum)*vec3(1.1,.9,.7),photo,.55);
  vec3 fin=mix(photo,warm,(1.-ss(.6,.9,uT))*.35);
  vec3 col=mix(dark,fin,rev);
  /* световая волна по готовому интерьеру */
  float sweep=exp(-pow((uv.x+uv.y*.6-(-.4+ss(.82,.96,uT)*2.2))*6.,2.))*ss(.82,.86,uT)*(1.-ss(.94,.97,uT));
  col+=vec3(1.,.8,.55)*sweep*.12;
  /* линии */
  vec3 gold=vec3(1.,.70,.36);
  float fadeL=(1.-rev*.88)*(1.-ss(.84,.95,uT));
  float line=m.r*drawn, halo=m.b*drawn;
  col+=gold*(line*.85+halo*.22)*fadeL;
  col+=vec3(1.,.92,.75)*tip*(m.r*1.8+m.b*.6)*(1.-rev);
  col+=gold*seam*(.35+halo*.8)*.9;
  col+=gold*seam*.12;
  /* затухание перед следующей сценой и при старте */
  col*=ss(.0,.03,uT)*(1.-ss(.965,1.,uT));
  gl_FragColor=vec4(col,1.);
}`;
  function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
  let prog;
  try { prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog); gl.useProgram(prog); }
  catch (e) { console.warn(e); cv.remove(); return; }
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = k => gl.getUniformLocation(prog, k);
  const uT = U('uT'), uRes = U('uRes'), uImg = U('uImg');
  gl.uniform1i(U('uPhoto'), 0); gl.uniform1i(U('uMap'), 1);

  function tex(img) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); return t;
  }
  const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const scenes = [];
  async function prep(i) {
    if (scenes[i]) return scenes[i];
    const s = SCENES[i];
    const [ph, mp] = await Promise.all([load(BASE + 'img/' + s.photo + '.jpg'), load(BASE + 'img/fx/' + s.photo + '.png')]);
    scenes[i] = { ph: tex(ph), mp: tex(mp), w: ph.naturalWidth, h: ph.naturalHeight, label: s.label };
    return scenes[i];
  }

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(uRes, w, h);
  }
  addEventListener('resize', size);

  let idx = 0, t0 = null, running = true, visible = true, lastStage = '', paused = 0, pauseAt = 0;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(cv);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAt = performance.now(); else if (pauseAt) { paused += performance.now() - pauseAt; pauseAt = 0; } });

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { if (!pauseAt) pauseAt = now; return; }
    if (pauseAt) { paused += now - pauseAt; pauseAt = 0; }
    const s = scenes[idx]; if (!s) return;
    if (t0 === null) t0 = now;
    let t = (now - t0 - paused) / 1000 / DUR;
    if (t >= 1) {
      const next = (idx + 1) % SCENES.length;
      if (!scenes[next]) { t = .999; prep(next); }
      else { idx = next; t0 = now; paused = 0; t = 0; }
    }
    if (t > .5) prep((idx + 1) % SCENES.length);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, scenes[idx].ph);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, scenes[idx].mp);
    gl.uniform2f(uImg, s.w, s.h);
    gl.uniform1f(uT, Math.min(t, .999));
    size();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (stage) {
      let lab = STAGES[0][1]; for (const [at, l] of STAGES) if (t >= at) lab = l;
      const txt = lab + ' — ' + scenes[idx].label;
      if (txt !== lastStage) { lastStage = txt; stage.textContent = txt; }
    }
  }
  prep(0).then(() => { cv.classList.add('on'); fallback && (fallback.style.opacity = 0); requestAnimationFrame(frame); }).catch(() => cv.remove());
})();
