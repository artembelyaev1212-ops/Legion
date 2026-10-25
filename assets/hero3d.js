/* Живая 3D-обложка «Легиона»: парящая каменная плита с окном в дизайн-проект,
   кольца света, луч сверху и кружащие элементы отделки. Реагирует на мышь и прокрутку. */
import * as THREE from 'three';
import { EffectComposer } from './vendor/three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/three/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/three/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/three/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from './vendor/three/jsm/environments/RoomEnvironment.js';

const canvas = document.getElementById('hero3d');
const hero = document.getElementById('hero');
const fallback = document.getElementById('fxFallback');
const label = document.getElementById('fxStage');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BASE = window.BASE || '';

const SHOTS = [
  { f: 'd2', name: 'Переговорная зона' },
  { f: 'n3', name: 'Переговорная, вид от окна' },
  { f: 'd1', name: 'Рабочая зона' },
  { f: 'n4', name: 'Встроенная мебель' },
  { f: 'd10', name: 'Переговорная у окна' }
];

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070708);
  scene.fog = new THREE.FogExp2(0x070708, 0.05);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.7, 10);

  /* ---------- свет ---------- */
  scene.add(new THREE.AmbientLight(0xffe8cc, 0.18));
  const key = new THREE.SpotLight(0xffd29a, 60, 30, 0.42, 0.6, 1.6);
  key.position.set(0.3, 9, 1.5); scene.add(key); scene.add(key.target);
  const rim = new THREE.PointLight(0xd2a15a, 18, 12, 1.8); rim.position.set(-2.5, 1.5, -2.5); scene.add(rim);
  const fill = new THREE.PointLight(0x8aa0c8, 4, 14, 2); fill.position.set(4, 0, 5); scene.add(fill);

  const stage = new THREE.Group(); scene.add(stage);
  key.target = stage;

  /* ---------- процедурные текстуры ---------- */
  function noiseTex(base, spread, size = 256, veins = false) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'); const img = g.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const x = i % size, y = (i / size) | 0;
      let v = (Math.random() - .5) * spread;
      if (veins) v += Math.sin((x * .045 + Math.sin(y * .03) * 3) + y * .01) * spread * .8;
      img.data[i * 4] = base[0] + v; img.data[i * 4 + 1] = base[1] + v; img.data[i * 4 + 2] = base[2] + v; img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function woodTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#7a5032'; g.fillRect(0, 0, 256, 64);
    for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(${40 + Math.random() * 30},${22 + Math.random() * 15},10,${.25 + Math.random() * .3})`; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); const y = Math.random() * 64; g.moveTo(0, y); for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x * .05 + i) * 2); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  /* ---------- плита ---------- */
  const mtex = new THREE.TextureLoader().load(BASE + 'img/tex/marble.jpg'); mtex.colorSpace = THREE.SRGBColorSpace; mtex.anisotropy = 4;
  const stoneMat = new THREE.MeshPhysicalMaterial({ map: mtex, roughness: .2, metalness: 0, clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: .6 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.9, .62, 2.3, 1, 1, 1), stoneMat);
  plinth.position.y = -1.05; stage.add(plinth);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(4.06, .06, 2.46), new THREE.MeshPhysicalMaterial({ color: 0xffc35a, metalness: 1, roughness: .16, envMapIntensity: 1.6 }));
  lip.position.y = -0.72; stage.add(lip);
  /* обломки под плитой — «кусок здания» */
  for (let i = 0; i < 9; i++) {
    const s = .25 + Math.random() * .45;
    const m = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), stoneMat);
    m.position.set((Math.random() - .5) * 3, -1.5 - Math.random() * .5, (Math.random() - .5) * 1.6);
    m.rotation.set(Math.random() * 3, Math.random() * 3, 0); m.scale.y = .6; stage.add(m);
  }

  /* ---------- окно в дизайн-проект ---------- */
  const loader = new THREE.TextureLoader();
  const texs = SHOTS.map(s => { const t = loader.load(BASE + 'img/' + s.f + '.jpg'); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; });
  const pw = 3.2, phh = 2.13;
  const portalMat = new THREE.ShaderMaterial({
    uniforms: { a: { value: texs[0] }, b: { value: texs[1] }, mixv: { value: 0 }, t: { value: 0 }, intro: { value: 0 } },
    vertexShader: `varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform sampler2D a,b;uniform float mixv,t,intro;varying vec2 v;
      float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){
        vec2 uv=v; vec2 c=uv-.5; uv=.5+c*(1.-.03*sin(t*.2));
        float n=h(floor(v*vec2(32.,22.)));
        float m=smoothstep(n-.15,n+.15,mixv*1.3-.15);
        vec3 col=mix(texture2D(a,uv).rgb,texture2D(b,uv).rgb,m);
        float edge=smoothstep(.0,.06,mixv*1.3-.15-n+.15)*(1.-smoothstep(.06,.14,mixv*1.3-.15-n+.15));
        col+=vec3(1.,.75,.4)*edge*1.4*step(.001,mixv)*step(mixv,.999);
        col=pow(col,vec3(2.2));
        float rev=smoothstep(0.,1.,intro*1.25-(1.-v.y)*.25);
        col*=rev; col+=vec3(1.,.7,.35)*exp(-pow((v.y-(1.-intro*1.2))*18.,2.))*(1.-step(1.,intro))*.8;
        gl_FragColor=vec4(col*1.08,1.);
      }`
  });
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(pw, phh), portalMat);
  portal.position.set(0, .4, 0); stage.add(portal);
  const back = new THREE.Mesh(new THREE.BoxGeometry(pw + .12, phh + .12, .08), new THREE.MeshStandardMaterial({ color: 0x15110d, roughness: .6 }));
  back.position.set(0, .4, -.06); stage.add(back);
  const brass = new THREE.MeshPhysicalMaterial({ color: 0xffc35a, metalness: 1, roughness: .14, clearcoat: .6, envMapIntensity: 1.6 });
  const fw = .07;
  [[0, phh / 2 + fw / 2, pw + fw * 2, fw], [0, -phh / 2 - fw / 2, pw + fw * 2, fw], [pw / 2 + fw / 2, 0, fw, phh], [-pw / 2 - fw / 2, 0, fw, phh]].forEach(([x, y, w, h]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .1), brass); m.position.set(x, .4 + y, .01); stage.add(m);
  });
  /* стойки, которыми окно стоит на плите */
  [-1.1, 1.1].forEach(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(.06, .5, .06), brass); m.position.set(x, -.92 + .45, 0); stage.add(m); });

  /* ---------- кольца света ---------- */
  const glowMat = (k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4 * k, 1.75 * k, 1.0 * k), toneMapped: false });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.1, .014, 8, 256), glowMat(1.15));
  ring1.position.y = 2.25; ring1.rotation.x = Math.PI / 2 - .32; stage.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.55, .012, 8, 256), glowMat(.95));
  ring2.position.y = -1.55; ring2.rotation.x = Math.PI / 2 - .22; stage.add(ring2);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.7, .006, 6, 256), glowMat(.5));
  ring3.position.y = .4; ring3.rotation.x = Math.PI / 2 - .5; ring3.rotation.y = .3; stage.add(ring3);
  /* бегущая искра по кольцу */
  const spark = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 12), glowMat(3));
  ring1.add(spark);

  /* ---------- луч сверху ---------- */
  const beamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { t: { value: 0 }, op: { value: 0 } },
    vertexShader: `varying vec2 v;varying vec3 n;varying vec3 vp;void main(){v=uv;n=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);vp=p.xyz;gl_Position=projectionMatrix*p;}`,
    fragmentShader: `uniform float t,op;varying vec2 v;varying vec3 n;varying vec3 vp;
      void main(){float f=pow(1.-abs(dot(normalize(-vp),n)),1.5);float fall=smoothstep(0.,.35,v.y)*smoothstep(1.,.55,v.y);
      float flick=.85+.15*sin(t*1.7+v.y*6.);
      gl_FragColor=vec4(vec3(1.,.78,.5)*(1.-f)*fall*.17*flick*op,1.);}`
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.12, 1.7, 8, 48, 1, true), beamMat);
  beam.position.y = 4.4; stage.add(beam);

  /* ---------- кружащие элементы отделки ---------- */
  const dummy = new THREE.Object3D();
  const kinds = [
    { geo: new THREE.BoxGeometry(.38, .045, .38), mat: stoneMat, n: 26 },
    { geo: new THREE.BoxGeometry(1.0, .07, .17), mat: new THREE.MeshStandardMaterial({ map: woodTex(), roughness: .6 }), n: 18 },
    { geo: new THREE.BoxGeometry(.3, .3, .025), mat: new THREE.MeshPhysicalMaterial({ color: 0xffc35a, metalness: 1, roughness: .15, envMapIntensity: 1.7 }), n: 18 },
    { geo: new THREE.BoxGeometry(.55, .55, .04), mat: new THREE.MeshStandardMaterial({ color: 0xe9e2d6, roughness: .9 }), n: 12 },
    { geo: new THREE.DodecahedronGeometry(.12, 0), mat: stoneMat, n: 30 }
  ];
  const debris = [];
  kinds.forEach(k => {
    const im = new THREE.InstancedMesh(k.geo, k.mat, k.n); stage.add(im);
    const items = [];
    for (let i = 0; i < k.n; i++) items.push({
      r: 2.6 + Math.random() * 2.9, a: Math.random() * Math.PI * 2, sp: (.05 + Math.random() * .09) * (Math.random() < .85 ? 1 : -1),
      y: -1.8 + Math.random() * 4.6, bob: Math.random() * 6, ax: new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(),
      rs: .2 + Math.random() * .6, s: .7 + Math.random() * .6, far: 8 + Math.random() * 8
    });
    debris.push({ im, items });
  });

  /* ---------- пыль ---------- */
  const N = 700, pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 16; pos[i * 3 + 1] = (Math.random() - .5) * 9; pos[i * 3 + 2] = (Math.random() - .5) * 10 - 1; seed[i] = Math.random(); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); dg.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const dust = new THREE.Points(dg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { t: { value: 0 }, px: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float seed;uniform float t,px;varying float a;void main(){vec3 p=position;p.y=mod(p.y+t*(.08+seed*.12)+4.5,9.)-4.5;p.x+=sin(t*.3+seed*20.)*.2;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(1.+seed*2.2)*px*(8./-mv.z);a=.25+.75*fract(seed*7.+t*.1);}`,
    fragmentShader: `varying float a;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(1.,.8,.5)*a*smoothstep(.5,0.,d),1.);}`
  }));
  scene.add(dust);

  /* ---------- пост-обработка ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .85, .55, .82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- размеры и раскладка ---------- */
  let narrow = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    narrow = w / h < 1;
    if (narrow) { stage.position.set(0, .15, 0); stage.scale.setScalar(.95); camera.fov = 46; }
    else if (w / h < 1.45) { stage.position.set(1.5, .55, 0); stage.scale.setScalar(.8); camera.fov = 36; }
    else { stage.position.set(2.35, .35, 0); stage.scale.setScalar(.92); camera.fov = 34; }
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  /* ---------- взаимодействие ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = (e.clientX / innerWidth - .5) * 2; mouse.ty = (e.clientY / innerHeight - .5) * 2; }, { passive: true });
  let scrollK = 0;
  addEventListener('scroll', () => { scrollK = Math.min(1, scrollY / (innerHeight || 1)); }, { passive: true });

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);

  /* ---------- смена ракурсов ---------- */
  let cur = 0, next = 1, mixStart = -1;
  const HOLD = 6.5, MIX = 1.6;
  if (label) label.textContent = 'Дизайн-проект · ' + SHOTS[0].name;

  const clock = new THREE.Clock();
  let t = 0, lastShot = 0;
  const ease = x => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

  function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), .05); t += dt;
    const intro = reduce ? 1 : ease(t / 2.6);

    mouse.x += (mouse.tx - mouse.x) * .04; mouse.y += (mouse.ty - mouse.y) * .04;
    const sway = narrow ? Math.sin(t * .25) * .35 : 0;
    stage.rotation.y = -.32 + mouse.x * .28 + sway + scrollK * .6 + (1 - intro) * -1.2;
    stage.rotation.x = .05 + mouse.y * .07 - scrollK * .15;
    const baseY = narrow ? .15 : (stage.scale.x < .85 ? .55 : .35);
    stage.position.y = baseY + Math.sin(t * .8) * .08 - (1 - intro) * 1.5 - scrollK * 1.2;
    camera.position.x = mouse.x * .35; camera.position.y = .7 - mouse.y * .2;
    camera.lookAt(stage.position.x * .55, stage.position.y * .6, 0);

    ring1.rotation.z = t * .12; ring2.rotation.z = -t * .09; ring3.rotation.z = t * .05;
    ring1.scale.setScalar(.2 + .8 * intro); ring2.scale.setScalar(.2 + .8 * ease((t - .3) / 2.4)); ring3.scale.setScalar(.2 + .8 * ease((t - .6) / 2.4));
    ring1.rotation.x = Math.PI / 2 - .32 + Math.sin(t * .4) * .05;
    spark.position.set(Math.cos(t * 1.3) * 3.1, Math.sin(t * 1.3) * 3.1, 0);
    beamMat.uniforms.t.value = t; beamMat.uniforms.op.value = ease((t - .8) / 1.8);
    dust.material.uniforms.t.value = t;
    portalMat.uniforms.t.value = t; portalMat.uniforms.intro.value = reduce ? 1 : Math.min(1, ease((t - .6) / 2.2));

    /* смена картинки в окне */
    if (t - lastShot > HOLD && mixStart < 0 && texs[next].image) mixStart = t;
    if (mixStart >= 0) {
      const m = (t - mixStart) / MIX;
      portalMat.uniforms.mixv.value = Math.min(1, m);
      if (m >= 1) {
        cur = next; next = (next + 1) % SHOTS.length;
        portalMat.uniforms.a.value = texs[cur]; portalMat.uniforms.b.value = texs[next]; portalMat.uniforms.mixv.value = 0;
        mixStart = -1; lastShot = t;
        if (label) label.textContent = 'Дизайн-проект · ' + SHOTS[cur].name;
      }
    }

    /* элементы отделки */
    debris.forEach(({ im, items }) => {
      items.forEach((d, i) => {
        d.a += d.sp * dt * (1 + scrollK * 2);
        const r = d.r + (1 - intro) * d.far;
        dummy.position.set(Math.cos(d.a) * r, d.y + Math.sin(t * .6 + d.bob) * .18, Math.sin(d.a) * r * .75);
        dummy.quaternion.setFromAxisAngle(d.ax, t * d.rs + d.bob);
        dummy.scale.setScalar(d.s);
        dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix);
      });
      im.instanceMatrix.needsUpdate = true;
    });

    composer.render();
  }

  let shown = false;
  const showWhenReady = () => {
    if (shown) return;
    if (!texs[0].image) { setTimeout(showWhenReady, 60); return; }
    shown = true; canvas.classList.add('on'); if (fallback) fallback.style.opacity = 0;
    hero && hero.classList.add('has3d');
  };
  showWhenReady();
  frame();
}

if (canvas) {
  try { start(); } catch (e) { console.warn(e); canvas.remove(); }
}
