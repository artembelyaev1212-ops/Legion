/* Обложка «Пирог отделки»: премиальный кабинет в чёрном мраморе и золоте.
   При прокрутке слои стен, пола и потолка разлетаются с подписями, мебель взлетает. */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from './vendor/three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/three/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/three/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/three/jsm/postprocessing/OutputPass.js';

const wrap = document.querySelector('.explode');
const canvas = document.getElementById('exCanvas');
const labelsBox = document.getElementById('exLabels');
const BASE = window.BASE || '';
const mobile = matchMedia('(max-width: 760px)').matches;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070708);
  scene.fog = new THREE.Fog(0x070708, 14, 32);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  scene.environmentIntensity = .55;

  const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);

  /* ---------- текстуры ---------- */
  const cnv = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; };
  const ctex = (c, rx = 1, ry = 1, srgb = true) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const noise = (g, w, h, a) => { const d = g.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { const n = (Math.random() - .5) * a; d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n; } g.putImageData(d, 0, 0); };
  function planks(base, dark, w = 1024, h = 1024, rows = 8) {
    return cnv(w, h, (g) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      const rh = h / rows;
      for (let r = 0; r < rows; r++) {
        const off = (r % 3) * w / 3;
        for (let k = 0; k < 90; k++) { g.strokeStyle = `rgba(${dark},${.08 + Math.random() * .18})`; g.lineWidth = .6 + Math.random() * 1.6; g.beginPath(); const y = r * rh + Math.random() * rh; g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * .01 + k) * 1.4); g.stroke(); }
        g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, r * rh, w, 2);
        for (let s = 0; s < 3; s++) g.fillRect((off + s * w / 3) % w, r * rh, 2, rh);
      }
      noise(g, w, h, 10);
    });
  }
  const gridCanvas = (n, fill, line, lw, w = 1024) => cnv(w, w, g => { g.fillStyle = fill; g.fillRect(0, 0, w, w); g.fillStyle = line; for (let i = 0; i <= n; i++) { const p = i * w / n; g.fillRect(p - lw / 2, 0, lw, w); g.fillRect(0, p - lw / 2, w, lw); } });

  const loader = new THREE.TextureLoader();
  const M = {};
  M.concrete = new THREE.MeshStandardMaterial({ map: ctex(cnv(512, 512, (g, w, h) => { g.fillStyle = '#4a4a4c'; g.fillRect(0, 0, w, h); noise(g, w, h, 40); }), 3, 3), roughness: .95 });
  M.drywall = new THREE.MeshStandardMaterial({ color: 0xb8bcb6, roughness: .9 });
  M.plaster = new THREE.MeshStandardMaterial({ map: ctex(cnv(512, 512, (g, w, h) => { g.fillStyle = '#8f8b84'; g.fillRect(0, 0, w, h); noise(g, w, h, 34); }), 4, 2), roughness: .95 });
  M.putty = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: .8 });
  M.paint = new THREE.MeshPhysicalMaterial({ color: 0x18181b, roughness: .55, clearcoat: .2 });
  M.gold = new THREE.MeshPhysicalMaterial({ color: 0xffc35a, metalness: 1, roughness: .15, clearcoat: .5, envMapIntensity: 1.8 });
  M.goldSatin = new THREE.MeshPhysicalMaterial({ color: 0xe5b04e, metalness: 1, roughness: .3, envMapIntensity: 1.5 });
  M.lacquer = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, roughness: .18, clearcoat: 1, clearcoatRoughness: .05 });
  M.leather = new THREE.MeshPhysicalMaterial({ color: 0x141210, roughness: .5, sheen: .6, sheenColor: new THREE.Color(0x3a2c1a) });
  M.leatherCream = new THREE.MeshPhysicalMaterial({ color: 0xd9cfbf, roughness: .65, sheen: .4 });
  M.glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.9, 1.05), toneMapped: false });
  M.board = new THREE.MeshPhysicalMaterial({ map: ctex(planks('#4a2f1d', '20,10,4'), 2, 2), roughness: .4, clearcoat: .5 });
  M.laminate = new THREE.MeshStandardMaterial({ map: ctex(planks('#6e6457', '35,28,20', 1024, 1024, 10), 2, 2), roughness: .55 });
  M.armstrong = new THREE.MeshStandardMaterial({ map: ctex(gridCanvas(4, '#e9e7e1', '#9a9690', 10), 2, 2), roughness: .9 });
  M.cassette = new THREE.MeshPhysicalMaterial({ map: ctex(gridCanvas(4, '#b8913f', '#2a2010', 8), 2, 2), metalness: .9, roughness: .3, envMapIntensity: 1.4 });
  M.stretch = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0b, roughness: .04, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 1.2 });
  M.ceilDry = new THREE.MeshStandardMaterial({ color: 0xc9ccc6, roughness: .9 });

  /* мраморная плитка с золотыми швами: цвет + карта металла для швов */
  const tileMat = (rx, ry) => {
    const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .14, clearcoat: 1, clearcoatRoughness: .05, metalness: 0 });
    const img = new Image();
    img.onload = () => {
      const S = 1024;
      const c = cnv(S, S, g => { g.drawImage(img, 0, 0, S, S); g.fillStyle = '#c9a13b'; const n = 2, lw = 7; for (let i = 0; i <= n; i++) { const p = i * S / n; g.fillRect(p - lw / 2, 0, lw, S); g.fillRect(0, p - lw / 2, S, lw); } });
      const mm = gridCanvas(2, '#000', '#fff', 7, S);
      m.map = ctex(c, rx, ry); m.metalnessMap = ctex(mm, rx, ry, false); m.metalness = 1;
      m.roughnessMap = ctex(gridCanvas(2, '#262626', '#404040', 7, S), rx, ry, false); m.roughness = 1;
      m.needsUpdate = true;
    };
    img.src = BASE + 'img/tex/marble.jpg';
    return m;
  };
  const marbleTop = new THREE.MeshPhysicalMaterial({ map: loader.load(BASE + 'img/tex/marble2.jpg', t => t.colorSpace = THREE.SRGBColorSpace), roughness: .12, clearcoat: 1 });

  /* ---------- комната ---------- */
  const W = 8, D = 6, H = 3.3, T = .07;
  const X0 = -W / 2, Z0 = -D / 2;
  const layers = [];   // { mesh, dir(Vector3), dist, a, b, label, anchor(Vector3 локально) }
  const room = new THREE.Group(); scene.add(room);

  function wallStack(axis) {
    // axis 'back' — стена в плоскости z=Z0, слои к зрителю; 'left' — x=X0
    const names = [['Основание', M.concrete], ['Гипсокартон', M.drywall], ['Штукатурка', M.plaster], ['Шпаклёвка', M.putty], ['Покраска', M.paint], ['Плитка', null]];
    const len = axis === 'back' ? W : D;
    names.forEach(([name, mat], i) => {
      const m = mat || tileMat(axis === 'back' ? 4 : 3, 1.6);
      const geo = new THREE.BoxGeometry(axis === 'back' ? len : T, H, axis === 'back' ? T : len);
      const mesh = new THREE.Mesh(geo, m); mesh.receiveShadow = true;
      const off = i * T;
      if (axis === 'back') mesh.position.set(0, H / 2, Z0 - (names.length - 1 - i) * T + T / 2);
      else mesh.position.set(X0 - (names.length - 1 - i) * T + T / 2, H / 2, 0);
      room.add(mesh);
      const k = names.length - 1 - i; // 0 = верхний слой (плитка)
      const dir = axis === 'back' ? new THREE.Vector3(.5, .08, -1).normalize() : new THREE.Vector3(-1, .08, .5).normalize();
      const anchor = axis === 'back' ? new THREE.Vector3(W / 2 - .2, H - .25, 0) : new THREE.Vector3(0, H - .25, -D / 2 + .3);
      if (i === names.length - 1) {
        // LED-профили на плитке
        for (let s = 0; s < (axis === 'back' ? 3 : 2); s++) {
          const strip = new THREE.Mesh(new THREE.BoxGeometry(axis === 'back' ? .025 : .03, H - .5, axis === 'back' ? .03 : .025), M.glow);
          if (axis === 'back') strip.position.set(-2.6 + s * 2.6, 0, T / 2 + .015); else strip.position.set(T / 2 + .015, 0, -1.4 + s * 2.8);
          mesh.add(strip);
        }
      }
      layers.push({ mesh, base: mesh.position.clone(), dir, dist: k === 5 ? 0 : 0, k, group: axis, name, anchor, show: name !== 'Основание' || false });
    });
  }
  wallStack('back'); wallStack('left');

  function slabStack(kind) {
    const isFloor = kind === 'floor';
    const list = isFloor
      ? [['Основание', M.concrete, .12], ['Инженерная доска', M.board, .04], ['Ламинат', M.laminate, .04], ['Плитка', tileMat(4, 3), .045]]
      : [['Перекрытие', M.concrete, .12], ['Гипсокартон', M.ceilDry, .04], ['Натяжной потолок', M.stretch, .03], ['Кассетный потолок', M.cassette, .04], ['Армстронг', M.armstrong, .04]];
    let y = isFloor ? 0 : H;
    // строим от конструкции к отделке
    const stack = isFloor ? list : list;
    let acc = 0;
    const meshes = [];
    stack.forEach(([name, mat, th], i) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(W, th, D), mat); mesh.receiveShadow = true;
      meshes.push([name, mesh, th]);
    });
    // укладка: пол — снизу вверх, потолок — сверху вниз
    let cur = isFloor ? -meshes.reduce((s, m) => s + m[2], 0) : H + meshes.reduce((s, m) => s + m[2], 0);
    meshes.forEach(([name, mesh, th], i) => {
      if (isFloor) { mesh.position.set(0, cur + th / 2, 0); cur += th; }
      else { mesh.position.set(0, cur - th / 2, 0); cur -= th; }
      room.add(mesh);
      const k = meshes.length - 1 - i;
      layers.push({ mesh, base: mesh.position.clone(), dir: new THREE.Vector3(.3, isFloor ? -1 : 1, .5).normalize(), k, group: kind, name, anchor: new THREE.Vector3(W / 2 - .1, 0, D / 2 - .1), show: true });
    });
  }
  slabStack('floor'); slabStack('ceil');

  /* ---------- мебель ---------- */
  const furniture = [];
  const box = (w, h, d, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
  const cyl = (r, h, mat, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };

  // рабочий стол
  const desk = new THREE.Group();
  box(2.4, .07, 1.05, marbleTop, 0, .76, 0, desk);
  box(2.32, .04, 1.0, M.gold, 0, .715, 0, desk);
  [-1.08, 1.08].forEach(x => { box(.05, .7, .05, M.gold, x, .35, -.45, desk); box(.05, .7, .05, M.gold, x, .35, .45, desk); box(.05, .05, .95, M.gold, x, .03, 0, desk); });
  box(.8, .52, .9, M.lacquer, .62, .44, 0, desk);
  box(.5, .02, .02, M.gold, .62, .55, .455, desk);
  box(.5, .02, .02, M.gold, .62, .35, .455, desk);
  const lamp = new THREE.Group(); cyl(.05, .4, M.gold, 0, .2, 0, lamp); const shade = new THREE.Mesh(new THREE.CylinderGeometry(.13, .16, .17, 24, 1, true), M.leatherCream); shade.position.y = .45; lamp.add(shade); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 12), M.glow); bulb.position.y = .42; lamp.add(bulb); lamp.position.set(-.85, .8, -.25); desk.add(lamp);
  box(.34, .02, .24, M.lacquer, -.2, .8, .1, desk);
  desk.position.set(-.6, 0, -.7);
  furniture.push({ g: desk, name: 'Рабочий стол', to: new THREE.Vector3(-.4, 2.4, 1.2), rot: new THREE.Euler(-.25, .35, .08), a: .14, b: .5 });

  // кресло руководителя
  function execChair() {
    const g = new THREE.Group();
    box(.62, .12, .6, M.leather, 0, .5, 0, g); box(.62, .85, .12, M.leather, 0, .98, -.28, g);
    box(.08, .25, .5, M.gold, -.34, .66, 0, g); box(.08, .25, .5, M.gold, .34, .66, 0, g);
    cyl(.035, .38, M.gold, 0, .26, 0, g);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const s = box(.34, .03, .05, M.gold, Math.cos(a) * .17, .05, Math.sin(a) * .17, g); s.rotation.y = -a; }
    return g;
  }
  const chair = execChair(); chair.position.set(-.6, 0, -1.6); chair.rotation.y = 0;
  furniture.push({ g: chair, name: 'Кресло', to: new THREE.Vector3(-1.4, 3.4, -1.0), rot: new THREE.Euler(.3, -.6, -.2), a: .1, b: .46 });

  function guestChair(mat) {
    const g = new THREE.Group();
    box(.52, .09, .52, mat, 0, .47, 0, g); box(.52, .55, .08, mat, 0, .78, -.23, g);
    [[-.22, -.22], [.22, -.22], [-.22, .22], [.22, .22]].forEach(([x, z]) => cyl(.018, .45, M.gold, x, .22, z, g));
    return g;
  }
  const gc1 = guestChair(M.leatherCream); gc1.position.set(-1.25, 0, .55); gc1.rotation.y = Math.PI + .25;
  const gc2 = guestChair(M.leatherCream); gc2.position.set(.1, 0, .55); gc2.rotation.y = Math.PI - .25;
  furniture.push({ g: gc1, name: 'Стулья', to: new THREE.Vector3(-1.9, 2.0, 2.4), rot: new THREE.Euler(.5, .8, .2), a: .18, b: .54 });
  furniture.push({ g: gc2, name: null, to: new THREE.Vector3(.9, 2.6, 2.6), rot: new THREE.Euler(-.4, -.7, -.3), a: .2, b: .56 });

  // шкаф-витрина
  const cab = new THREE.Group();
  box(1.6, 2.6, .5, M.lacquer, 0, 1.3, 0, cab);
  box(1.66, .04, .54, M.gold, 0, 2.62, 0, cab); box(1.66, .04, .54, M.gold, 0, .02, 0, cab);
  box(.04, 2.6, .54, M.gold, -.81, 1.3, 0, cab); box(.04, 2.6, .54, M.gold, .81, 1.3, 0, cab);
  for (let s = 0; s < 4; s++) {
    const y = .6 + s * .55;
    box(1.5, .025, .42, M.goldSatin, 0, y, .03, cab);
    box(1.48, .012, .02, M.glow, 0, y - .02, .23, cab);
    for (let b = 0; b < 7; b++) if (Math.random() < .8) box(.06 + Math.random() * .05, .28 + Math.random() * .12, .26, [M.leatherCream, M.leather, M.lacquer][b % 3], -.6 + b * .18, y + .17, 0, cab);
  }
  box(.02, .5, .03, M.gold, -.05, 1.3, .27, cab); box(.02, .5, .03, M.gold, .05, 1.3, .27, cab);
  cab.position.set(2.4, 0, Z0 + .3);
  furniture.push({ g: cab, name: 'Шкаф на заказ', to: new THREE.Vector3(2.2, 3.0, .6), rot: new THREE.Euler(.2, -.5, .12), a: .12, b: .5 });

  // диван
  const sofa = new THREE.Group();
  box(2.1, .38, .85, M.leather, 0, .3, 0, sofa); box(2.1, .5, .18, M.leather, 0, .7, -.34, sofa);
  box(.18, .55, .85, M.leather, -1.0, .45, 0, sofa); box(.18, .55, .85, M.leather, 1.0, .45, 0, sofa);
  box(2.0, .03, .03, M.gold, 0, .1, .43, sofa);
  sofa.position.set(X0 + .6, 0, 1.0); sofa.rotation.y = Math.PI / 2;
  furniture.push({ g: sofa, name: 'Диван', to: new THREE.Vector3(-3.0, 2.2, 2.0), rot: new THREE.Euler(.3, .9, .2), a: .16, b: .52 });

  // люстра-кольцо
  const chand = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.75, .035, 16, 120), M.gold); ring.rotation.x = Math.PI / 2; chand.add(ring);
  const ringG = new THREE.Mesh(new THREE.TorusGeometry(.72, .012, 8, 120), M.glow); ringG.rotation.x = Math.PI / 2; ringG.position.y = -.03; chand.add(ringG);
  [0, 1, 2].forEach(i => { const a = i / 3 * Math.PI * 2; const r = cyl(.006, .7, M.gold, Math.cos(a) * .7, .35, Math.sin(a) * .7, chand); });
  chand.position.set(-.6, H - .8, -.7);
  furniture.push({ g: chand, name: 'Свет', to: new THREE.Vector3(-.6, 5.6, -.4), rot: new THREE.Euler(.35, 0, .2), a: .08, b: .44 });

  // ковёр
  const rug = box(3.6, .015, 2.6, new THREE.MeshStandardMaterial({ map: ctex(cnv(512, 512, (g, w, h) => { g.fillStyle = '#2a2724'; g.fillRect(0, 0, w, h); noise(g, w, h, 18); g.strokeStyle = '#a8842f'; g.lineWidth = 6; g.strokeRect(24, 24, w - 48, h - 48); }), 1, 1), roughness: 1 }), 0, .008, 0, new THREE.Group());
  const rugG = rug.parent; rugG.position.set(-.6, 0, -.4);
  furniture.push({ g: rugG, name: null, to: new THREE.Vector3(-.6, 1.0, -.2), rot: new THREE.Euler(-.2, .2, 0), a: .1, b: .5 });

  furniture.forEach(f => { scene.add(f.g); f.base = f.g.position.clone(); f.baseRot = f.g.rotation.clone(); });

  /* ---------- свет ---------- */
  scene.add(new THREE.AmbientLight(0xfff1dc, .12));
  const key = new THREE.SpotLight(0xffd9a3, 90, 22, .6, .55, 1.5);
  key.position.set(1.5, H - .1, 1.5); key.target.position.set(-.6, 0, -.7); key.castShadow = !mobile; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -.0004;
  scene.add(key, key.target);
  const warm = new THREE.PointLight(0xffc06a, 10, 8, 2); warm.position.set(-.6, H - .9, -.7); scene.add(warm);
  const cabL = new THREE.PointLight(0xffc888, 6, 4, 2); cabL.position.set(2.4, 1.6, Z0 + 1); scene.add(cabL);
  const rim = new THREE.DirectionalLight(0xbfd2ff, .35); rim.position.set(6, 6, 8); scene.add(rim);
  const glint = new THREE.PointLight(0xffffff, 14, 12, 1.6); scene.add(glint);

  /* ---------- пост ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .55, .45, .85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  /* ---------- подписи ---------- */
  const labelData = [];
  const mk = (text, cls) => { const el = document.createElement('div'); el.className = 'ex-label ' + (cls || ''); el.innerHTML = `<i></i><span>${text}</span>`; labelsBox.appendChild(el); return el; };
  layers.forEach(L => {
    if (L.name === 'Основание' || L.name === 'Перекрытие') return;
    if (L.group === 'left') return; // подписи стен — только на дальней стене
    L.el = mk(L.name, 'l-' + L.group);
  });
  furniture.forEach(f => { if (f.name) f.el = mk(f.name, 'l-furn'); });

  /* ---------- раскладка ---------- */
  let narrow = false;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; narrow = w / h < 1; camera.fov = narrow ? 52 : 36; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; }, { passive: true });

  const camA = new THREE.Vector3(4.9, 1.75, 6.6), lookA = new THREE.Vector3(-.9, 1.35, -.9);
  const camB = new THREE.Vector3(10.5, 5.2, 14.5), lookB = new THREE.Vector3(-1.2, 1.6, -1.8);
  const camAm = new THREE.Vector3(5.2, 2.0, 8.8), camBm = new THREE.Vector3(12, 6.5, 19);
  const tmpV = new THREE.Vector3(), look = new THREE.Vector3();

  let prog = 0, sp = 0, t = 0, visible = true;
  new IntersectionObserver(es => visible = es[0].isIntersecting).observe(wrap);
  const steps = [...document.querySelectorAll('.ex-step')];
  const clock = new THREE.Clock();

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05); t += dt;
    if (!visible || document.hidden) return;
    const r = wrap.getBoundingClientRect();
    prog = clamp(-r.top / Math.max(1, r.height - innerHeight));
    sp += (prog - sp) * .09;
    const p = sp;

    // камера
    const e = seg(p, .05, .75);
    tmpV.lerpVectors(narrow ? camAm : camA, narrow ? camBm : camB, e);
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    camera.position.set(tmpV.x + mouse.x * .8 + Math.sin(t * .2) * .08, tmpV.y - mouse.y * .4, tmpV.z);
    look.lerpVectors(lookA, lookB, e); camera.lookAt(look);

    // слои
    const GAP = { back: .62, left: .62, floor: .55, ceil: .55 };
    const RANGE = { back: [.14, .62], left: [.18, .66], floor: [.22, .66], ceil: [.16, .62] };
    layers.forEach(L => {
      const [a, b] = RANGE[L.group];
      const q = seg(p, a + L.k * .015, b);
      const d = L.k * GAP[L.group] * q * (L.group === 'floor' || L.group === 'ceil' ? 1.15 : 1);
      L.mesh.position.copy(L.base).addScaledVector(L.dir, d);
      if (L.el) {
        tmpV.copy(L.anchor);
        if (L.group === 'back') tmpV.set(L.mesh.position.x + W / 2 + .05, L.mesh.position.y + H / 2 - .25, L.mesh.position.z);
        else tmpV.set(L.mesh.position.x + W / 2 + .05, L.mesh.position.y, L.mesh.position.z + D / 2);
        place(L.el, tmpV, seg(p, a + .12, a + .26) * (1 - seg(p, .9, .98)));
      }
    });
    // мебель
    furniture.forEach((f, i) => {
      const q = seg(p, f.a, f.b);
      f.g.position.lerpVectors(f.base, f.to, q);
      f.g.position.y += Math.sin(t * .9 + i) * .04 * q;
      f.g.rotation.set(f.baseRot.x + f.rot.x * q + Math.sin(t * .5 + i) * .03 * q, f.baseRot.y + f.rot.y * q, f.baseRot.z + f.rot.z * q);
      if (f.el) { tmpV.copy(f.g.position); tmpV.y += f.name === 'Свет' ? .3 : (f.name === 'Шкаф на заказ' ? 2.8 : 1.2); place(f.el, tmpV, seg(p, f.b - .08, f.b + .06) * (1 - seg(p, .9, .98))); }
    });
    glint.position.set(Math.sin(t * .6) * 5, 2.5 + Math.cos(t * .4) * 1.5, 3 + Math.cos(t * .5) * 2);

    // тексты-шаги
    steps.forEach(s => { const a = +s.dataset.a, b = +s.dataset.b; const o = clamp((p - a) / .05) * (1 - clamp((p - b) / .05)); s.style.opacity = o; s.style.transform = `translateY(${(1 - o) * 24}px)`; s.style.pointerEvents = o > .5 ? 'auto' : 'none'; });

    composer.render();
  }
  function place(el, v, o) {
    if (o <= .01) { if (el.style.opacity !== '0') el.style.opacity = '0'; return; }
    const pr = v.clone().project(camera);
    const x = (pr.x * .5 + .5) * canvas.clientWidth, y = (-pr.y * .5 + .5) * canvas.clientHeight;
    el.style.opacity = o; el.style.transform = `translate(${x}px,${y}px)`;
  }
  canvas.classList.add('on');
  frame();
}

if (canvas) { try { start(); } catch (e) { console.warn(e); document.getElementById('exFallback')?.removeAttribute('hidden'); canvas.remove(); } }
