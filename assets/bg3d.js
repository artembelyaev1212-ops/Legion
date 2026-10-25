/* Живой фон всей страницы: полированное золото и чёрный мрамор в глубине.
   При прокрутке камера проплывает вниз сквозь сцену, ближние детали движутся быстрее дальних. */
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/three/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from './vendor/three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/three/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './vendor/three/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/three/jsm/postprocessing/OutputPass.js';

const canvas = document.getElementById('bg3d');
const BASE = window.BASE || '';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 760px)').matches;

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070708);
  scene.fog = new THREE.Fog(0x070708, 9, 30);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(40, 1, .1, 80);
  camera.position.set(0, 0, 10);

  /* свет: два блуждающих блика делают золото «живым» */
  scene.add(new THREE.AmbientLight(0xffffff, .05));
  const g1 = new THREE.PointLight(0xffe0a0, 40, 18, 1.6); scene.add(g1);
  const g2 = new THREE.PointLight(0xffffff, 25, 16, 1.6); scene.add(g2);
  const dir = new THREE.DirectionalLight(0xfff2d8, .6); dir.position.set(3, 5, 6); scene.add(dir);

  /* материалы */
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xffc35a, metalness: 1, roughness: .16, clearcoat: .6, clearcoatRoughness: .1, envMapIntensity: 1.6 });
  const goldSatin = new THREE.MeshPhysicalMaterial({ color: 0xe9b450, metalness: 1, roughness: .32, envMapIntensity: 1.3 });
  const tex = new THREE.TextureLoader().load(BASE + 'img/tex/marble.jpg');
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const tex2 = new THREE.TextureLoader().load(BASE + 'img/tex/marble2.jpg');
  tex2.colorSpace = THREE.SRGBColorSpace;
  const marble = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .22, metalness: 0, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: .55 });
  const marble2 = new THREE.MeshPhysicalMaterial({ map: tex2, roughness: .28, metalness: 0, clearcoat: .8, clearcoatRoughness: .12, envMapIntensity: .5 });

  const LEN = 70;               // длина «шахты» по вертикали
  const items = [];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const side = () => (Math.random() < .5 ? -1 : 1);
  function add(mesh, opt) { mesh.userData = Object.assign({ rs: new THREE.Vector3(rnd(-.15, .15), rnd(-.2, .2), rnd(-.1, .1)), bob: Math.random() * 6 }, opt || {}); scene.add(mesh); items.push(mesh); return mesh; }

  /* мраморные плиты с золотой кромкой — дальний план по бокам */
  const nSlab = mobile ? 10 : 18;
  for (let i = 0; i < nSlab; i++) {
    const w = rnd(2.2, 4.2), h = rnd(3, 6), d = .14;
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), i % 2 ? marble : marble2));
    const e = .035;
    [[0, h / 2, w + e * 2, e], [0, -h / 2, w + e * 2, e], [w / 2, 0, e, h], [-w / 2, 0, e, h]].forEach(([x, y, ww, hh]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, d + .02), gold); m.position.set(x, y, 0); g.add(m);
    });
    g.position.set(side() * rnd(5, 9), -i * (LEN / nSlab) + rnd(-1, 1), rnd(-12, -6));
    g.rotation.set(rnd(-.3, .3), rnd(-.9, .9), rnd(-.25, .25));
    add(g, { rs: new THREE.Vector3(0, rnd(-.05, .05), 0) });
  }
  /* золотые кольца */
  const nRing = mobile ? 9 : 16;
  for (let i = 0; i < nRing; i++) {
    const R = rnd(.6, 2.2);
    const m = new THREE.Mesh(new THREE.TorusGeometry(R, rnd(.025, .07), 24, 160), Math.random() < .6 ? gold : goldSatin);
    m.position.set(side() * rnd(2.5, 7.5), -rnd(0, LEN), rnd(-9, -1));
    m.rotation.set(rnd(0, 3), rnd(0, 3), 0);
    add(m);
  }
  /* стержни и рейки */
  const nRod = mobile ? 10 : 20;
  for (let i = 0; i < nRod; i++) {
    const L = rnd(2, 6);
    const m = Math.random() < .5
      ? new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, L, 16), gold)
      : new THREE.Mesh(new THREE.BoxGeometry(.06, L, .06), goldSatin);
    m.position.set(side() * rnd(3, 9), -rnd(0, LEN), rnd(-10, -2));
    m.rotation.set(rnd(-1, 1), rnd(-1, 1), rnd(-1.2, 1.2));
    add(m);
  }
  /* квадратные рамы */
  const nFrame = mobile ? 6 : 12;
  for (let i = 0; i < nFrame; i++) {
    const s = rnd(1, 2.4), t = .05, g = new THREE.Group();
    [[0, s / 2, s + t, t], [0, -s / 2, s + t, t], [s / 2, 0, t, s], [-s / 2, 0, t, s]].forEach(([x, y, w, h]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), gold); m.position.set(x, y, 0); g.add(m); });
    g.position.set(side() * rnd(3, 8), -rnd(0, LEN), rnd(-8, -2));
    g.rotation.set(rnd(-.6, .6), rnd(-1, 1), rnd(0, .8));
    add(g);
  }
  /* ближний план: мелкие золотые и мраморные элементы — сильный параллакс */
  const nNear = mobile ? 18 : 36;
  const geos = [new THREE.IcosahedronGeometry(.12, 0), new THREE.BoxGeometry(.18, .18, .18), new THREE.OctahedronGeometry(.14), new THREE.BoxGeometry(.5, .04, .3)];
  for (let i = 0; i < nNear; i++) {
    const m = new THREE.Mesh(geos[i % geos.length], i % 4 === 3 ? marble : gold);
    m.position.set(side() * rnd(1.8, 5), -rnd(0, LEN), rnd(2, 6));
    m.scale.setScalar(rnd(.7, 1.4));
    add(m, { rs: new THREE.Vector3(rnd(-.8, .8), rnd(-.8, .8), rnd(-.5, .5)) });
  }
  /* золотая пыль */
  const N = mobile ? 500 : 1200, pos = new Float32Array(N * 3), sd = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = rnd(-12, 12); pos[i * 3 + 1] = rnd(-LEN - 8, 8); pos[i * 3 + 2] = rnd(-14, 6); sd[i] = Math.random(); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('sd', new THREE.BufferAttribute(sd, 1));
  const dust = new THREE.Points(pg, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { t: { value: 0 }, px: { value: renderer.getPixelRatio() } },
    vertexShader: `attribute float sd;uniform float t,px;varying float a;void main(){vec3 p=position;p.x+=sin(t*.2+sd*30.)*.3;p.y+=sin(t*.15+sd*12.)*.3;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(1.+sd*2.4)*px*(9./-mv.z);a=.2+.8*pow(.5+.5*sin(t*(1.+sd*2.)+sd*40.),3.);}`,
    fragmentShader: `varying float a;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(1.,.82,.45)*a*smoothstep(.5,0.,d),1.);}`
  }));
  scene.add(dust);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .55, .5, .78);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.fov = w / h < 1 ? 55 : 40; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; }, { passive: true });
  let camY = 0, vel = 0, lastY = scrollY;
  const clock = new THREE.Clock(); let t = 0, shown = false;

  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), .05); t += dt;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const target = -(scrollY / max) * LEN;
    const v = scrollY - lastY; lastY = scrollY; vel += (v - vel) * .08;
    camY += (target - camY) * (reduce ? 1 : .07);
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    camera.position.set(mouse.x * 1.2, camY - mouse.y * .6, 10);
    camera.rotation.set(-mouse.y * .04 + Math.max(-.12, Math.min(.12, vel * -.004)), -mouse.x * .06, 0);

    g1.position.set(Math.sin(t * .5) * 6, camY + Math.cos(t * .37) * 4, 3 + Math.sin(t * .23) * 3);
    g2.position.set(Math.cos(t * .41) * -7, camY + Math.sin(t * .29) * 5, 2);
    const spin = 1 + Math.abs(vel) * .04;
    for (const m of items) {
      const u = m.userData;
      if (!reduce) { m.rotation.x += u.rs.x * dt * spin; m.rotation.y += u.rs.y * dt * spin; m.rotation.z += u.rs.z * dt * spin; }
      m.position.y += Math.sin(t * .6 + u.bob) * .0015;
    }
    dust.material.uniforms.t.value = t;

    /* пока видна обложка со своей 3D-сценой, фон не рисуем */
    if (scrollY < innerHeight * .35 && shown) return;
    composer.render();
    if (!shown) { shown = true; canvas.classList.add('on'); }
  }
  frame();
}

if (canvas) { try { start(); } catch (e) { console.warn(e); canvas.remove(); } }
