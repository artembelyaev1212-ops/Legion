/* Главная: зал из тёмного керамогранита с золотыми вставками.
   Золото «течёт»: по вставкам бегут волны расплава, в центре парит капля жидкого золота,
   вокруг неё по орбите идут компании группы, по внешнему кольцу — направления работ. */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from './vendor/three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/three/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/three/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/three/jsm/postprocessing/OutputPass.js';

const canvas = document.getElementById('heroGL');
const hero = document.getElementById('hero');
const BASE = window.BASE || '';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;
const COMPANIES = (window.GROUP || []).map(c => c.short);
const DIRECTIONS = ['Строительство', 'Реконструкция', 'Отделка', 'Инженерные системы', 'Дизайн интерьеров', 'Мебель на заказ', 'Оснащение'];

/* общий шум для «расплава» */
const NOISE = `
vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);}vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
i=m289(i);vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
`;

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.4 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050506);
  scene.fog = new THREE.Fog(0x050506, 9, 26);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.03).texture;
  scene.environmentIntensity = .7;

  const camera = new THREE.PerspectiveCamera(38, 1, .1, 80);
  const uTime = { value: 0 };

  /* ---------- текущее золото ---------- */
  function liquidGold(opts = {}) {
    const m = new THREE.MeshPhysicalMaterial({ color: 0xffc766, metalness: 1, roughness: .14, clearcoat: .7, clearcoatRoughness: .08, envMapIntensity: 1.9, ...opts });
    m.onBeforeCompile = sh => {
      sh.uniforms.uTime = uTime;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW=(modelMatrix*vec4(transformed,1.)).xyz;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vW;uniform float uTime;' + NOISE)
        .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
          float fl=snoise(vec3(vW.x*1.6-uTime*.55,vW.y*1.6+vW.z*1.6,uTime*.25));
          float fl2=snoise(vec3(vW.x*5.+uTime*.9,vW.z*5.-uTime*.7,vW.y*5.));
          roughnessFactor=clamp(roughnessFactor+fl*.08+fl2*.04,.04,.5);`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          float wave=pow(max(0.,sin((vW.x+vW.z*.6)*2.2-uTime*1.6+fl*2.)),14.);
          totalEmissiveRadiance+=vec3(1.,.66,.25)*(wave*.32+max(fl2,0.)*.03);
          diffuseColor.rgb*=.86+.24*fl;`);
    };
    return m;
  }
  const gold = liquidGold();

  /* ---------- зал из керамогранита ---------- */
  const tex = new THREE.TextureLoader().load(BASE + 'img/tex/porcelain.jpg');
  tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.anisotropy = 8;
  const slabMat = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .2, metalness: 0, clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: .55 });
  /* у каждой плиты свой фрагмент рисунка камня: сдвигаем UV, текстура одна */
  const slabGeo = (w, h, sx, sy) => { const g = new THREE.PlaneGeometry(w, h); const uv = g.attributes.uv, ox = Math.random() * (1 - sx), oy = Math.random() * (1 - sy);
    for (let i = 0; i < uv.count; i++) uv.setXY(i, ox + uv.getX(i) * sx, oy + uv.getY(i) * sy); return g; };
  const room = new THREE.Group(); scene.add(room);
  const TILE = 2.4, NX = 14, NZ = 8, FLOOR_Y = -1.2, WALL_Z = -7;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const m = new THREE.Mesh(slabGeo(TILE - .05, TILE - .05, .5, .5), slabMat);
    m.rotation.x = -Math.PI / 2; m.position.set((i - NX / 2 + .5) * TILE, FLOOR_Y, WALL_Z + (j + .5) * TILE); room.add(m);
  }
  for (let i = 0; i < NX; i++) for (let j = 0; j < 4; j++) {
    const m = new THREE.Mesh(slabGeo(TILE - .05, TILE * 1.5 - .05, .5, .75), slabMat);
    m.position.set((i - NX / 2 + .5) * TILE, FLOOR_Y + (j + .5) * TILE * 1.5, WALL_Z); room.add(m);
  }
  /* золотые вставки в швах */
  const inlay = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), gold); m.position.set(x, y, z); room.add(m); };
  const fw = NX * TILE, fd = NZ * TILE;
  for (let i = 0; i <= NX; i++) {
    const x = (i - NX / 2) * TILE;
    inlay(.05, .012, fd, x, FLOOR_Y, WALL_Z + fd / 2);
    inlay(.05, TILE * 6, .02, x, FLOOR_Y + TILE * 3, WALL_Z + .01);
  }
  for (let j = 0; j <= NZ; j++) inlay(fw, .012, .05, 0, FLOOR_Y, WALL_Z + j * TILE);
  for (let j = 1; j <= 3; j++) inlay(fw, .02, .05, 0, FLOOR_Y + j * TILE * 1.5, WALL_Z + .01);

  /* ---------- капля жидкого золота ---------- */
  const blobGeo = new THREE.IcosahedronGeometry(1, small ? 40 : 72);
  const blobMat = liquidGold({ roughness: .1, color: 0xf2a93b, envMapIntensity: 1.4 });
  const prevCompile = blobMat.onBeforeCompile;
  blobMat.onBeforeCompile = sh => {
    prevCompile(sh);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;' + NOISE + `
        float dsp(vec3 p){return snoise(p*1.0+vec3(0.,uTime*.3,uTime*.18))*.16+snoise(p*2.2-vec3(uTime*.45,0.,uTime*.25))*.035;}`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        vec3 nn=normalize(position);vec3 tg=normalize(cross(nn,abs(nn.y)<.99?vec3(0.,1.,0.):vec3(1.,0.,0.)));vec3 bt=cross(nn,tg);
        float e=.03;float d0=dsp(nn);
        vec3 pa=(nn+tg*e)*(1.+dsp(normalize(nn+tg*e)));vec3 pb=(nn+bt*e)*(1.+dsp(normalize(nn+bt*e)));vec3 p0=nn*(1.+d0);
        objectNormal=normalize(cross(pa-p0,pb-p0));if(dot(objectNormal,nn)<0.)objectNormal=-objectNormal;`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed=normalize(position)*(1.+dsp(normalize(position)));');
  };
  const blob = new THREE.Mesh(blobGeo, blobMat);
  blob.position.set(0, 1.0, 0); blob.scale.setScalar(1.05);
  scene.add(blob);
  /* отражение-лужа под каплей */
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.25, 96), liquidGold({ roughness: .05 }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(0, FLOOR_Y + .015, 0); pool.scale.set(1, 1, 1);
  scene.add(pool);
  const poolRing = new THREE.Mesh(new THREE.TorusGeometry(1.32, .03, 12, 160), gold);
  poolRing.rotation.x = Math.PI / 2; poolRing.position.y = FLOOR_Y + .02; scene.add(poolRing);

  /* ---------- орбиты ---------- */
  const orbitTilt = new THREE.Group(); orbitTilt.rotation.x = -.22; orbitTilt.position.copy(blob.position); scene.add(orbitTilt);
  const R1 = 2.35, R2 = 3.3;
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.15, .6), toneMapped: false, transparent: true, opacity: .55 });
  const r1 = new THREE.Mesh(new THREE.TorusGeometry(R1, .006, 6, 256), ringMat); r1.rotation.x = Math.PI / 2; orbitTilt.add(r1);
  const r2 = new THREE.Mesh(new THREE.TorusGeometry(R2, .004, 6, 256), ringMat.clone()); r2.material.opacity = .3; r2.rotation.x = Math.PI / 2; orbitTilt.add(r2);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3, 1.6), toneMapped: false }));
  orbitTilt.add(spark);

  function label(text, size, opts = {}) {
    const pad = 30, c = document.createElement('canvas'), g = c.getContext('2d');
    const font = `${opts.italic ? 'italic ' : ''}${opts.weight || 400} ${size}px ${opts.family || '"Cormorant Garamond", Georgia, serif'}`;
    g.font = font; const w = Math.ceil(g.measureText(text).width) + pad * 2 + (opts.mark ? size : 0), h = Math.ceil(size * 1.5);
    c.width = w; c.height = h; g.font = font; g.textBaseline = 'middle';
    const grad = g.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#b8903c'); grad.addColorStop(.35, '#fbe7ad'); grad.addColorStop(.55, '#d9ae52'); grad.addColorStop(1, '#f5dc98');
    g.fillStyle = opts.color || grad; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 14;
    let x = pad;
    if (opts.mark) { g.save(); g.translate(pad + size * .25, h / 2); g.rotate(Math.PI / 4); g.fillRect(-size * .13, -size * .13, size * .26, size * .26); g.restore(); x += size * .7; }
    g.fillText(text, x, h / 2 + size * .04);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false }));
    const k = opts.k || .0029; sp.scale.set(w * k, h * k, 1); sp.userData.base = sp.scale.clone();
    return sp;
  }
  const comp = [], dirs = [];
  function buildLabels() {
    COMPANIES.forEach(n => { const s = label(n, 64, { mark: true, weight: 500 }); orbitTilt.add(s); comp.push(s); });
    DIRECTIONS.forEach(n => { const s = label(n.toUpperCase(), 40, { family: '"JetBrains Mono", monospace', color: 'rgba(236,226,206,.85)', k: .0023 }); orbitTilt.add(s); dirs.push(s); });
  }
  (document.fonts && document.fonts.load ? Promise.all([document.fonts.load('500 64px "Cormorant Garamond"'), document.fonts.load('40px "JetBrains Mono"')]).catch(() => {}) : Promise.resolve())
    .then(() => setTimeout(buildLabels, 0));

  /* ---------- золотая пыль ---------- */
  const N = small ? 350 : 900, pos = new Float32Array(N * 3), sd = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 18; pos[i * 3 + 1] = Math.random() * 8 - 1; pos[i * 3 + 2] = Math.random() * -10 + 4; sd[i] = Math.random(); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('sd', new THREE.BufferAttribute(sd, 1));
  const dust = new THREE.Points(pg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { t: uTime, px: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float sd;uniform float t,px;varying float a;void main(){vec3 p=position;p.y=mod(p.y+t*(.05+sd*.08)+1.,8.)-1.;p.x+=sin(t*.25+sd*30.)*.25;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(1.+sd*2.)*px*(7./-mv.z);a=.25+.75*pow(.5+.5*sin(t*(1.+sd)+sd*40.),3.);}`,
    fragmentShader: `varying float a;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(1.,.8,.45)*a*smoothstep(.5,0.,d),1.);}`
  }));
  scene.add(dust);

  /* ---------- свет ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, .04));
  const key = new THREE.SpotLight(0xfff0d8, 26, 30, .38, .8, 1.4); key.position.set(0, 9, 4); key.target = blob; scene.add(key);
  const l1 = new THREE.PointLight(0xffd59a, 9, 12, 1.6); scene.add(l1);
  const l2 = new THREE.PointLight(0xffe2b8, 5, 10, 1.8); scene.add(l2);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), small ? .32 : .42, .45, .9));
  composer.addPass(new OutputPass());

  let narrow = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; narrow = w / h < 1; camera.fov = narrow ? 58 : 38; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; }, { passive: true });
  let visible = true; new IntersectionObserver(es => visible = es[0].isIntersecting).observe(canvas);

  const tmp = new THREE.Vector3(), clock = new THREE.Clock(); let t = 0, shown = false;
  function place(list, R, speed, phase, lift) {
    list.forEach((s, i) => {
      const a = phase + t * speed + i / list.length * Math.PI * 2;
      s.position.set(Math.cos(a) * R, lift, Math.sin(a) * R);
      s.getWorldPosition(tmp); const front = (tmp.z - blob.position.z) / R; // -1 сзади … 1 спереди
      const k = .55 + .45 * (front * .5 + .5);
      s.scale.copy(s.userData.base).multiplyScalar(k * (narrow ? .82 : 1));
      s.material.opacity = .22 + .78 * Math.pow(front * .5 + .5, 1.4);
      s.renderOrder = 10 + Math.round(front * 10);
    });
  }
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05);
    if (!visible || document.hidden) return;
    t += reduce ? dt * .15 : dt; uTime.value = t;
    mouse.x += (mouse.tx - mouse.x) * .04; mouse.y += (mouse.ty - mouse.y) * .04;
    const sc = Math.min(1, scrollY / (innerHeight || 1));
    const camZ = narrow ? 12 : 9.8, camX = narrow ? 0 : -2.9;
    camera.position.set(camX + mouse.x * 1.1 + Math.sin(t * .12) * .25, 1.35 - mouse.y * .5 + sc * .8, camZ - sc * 1.5);
    camera.lookAt(narrow ? 0 : -2.0, narrow ? -1.6 : .75, 0);
    blob.rotation.y = t * .15; blob.position.y = 1.0 + Math.sin(t * .8) * .08;
    orbitTilt.position.y = blob.position.y; orbitTilt.rotation.z = Math.sin(t * .2) * .04;
    spark.position.set(Math.cos(-t * .9) * R1, 0, Math.sin(-t * .9) * R1);
    place(comp, R1, -.16, 0, 0); place(dirs, R2, .07, .4, -.05);
    l1.position.set(Math.sin(t * .5) * 4, 2.5 + Math.cos(t * .4), 2 + Math.cos(t * .33) * 2);
    l2.position.set(Math.cos(t * .37) * -5, 1.5, -2 + Math.sin(t * .29) * 3);
    composer.render();
    if (!shown) { shown = true; requestAnimationFrame(() => { canvas.classList.add('on'); hero && hero.classList.add('gl'); }); }
  }
  frame();
}
if (canvas) { try { start(); } catch (e) { console.warn(e); canvas.remove(); } }
