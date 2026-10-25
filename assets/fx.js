/* Обложка «Отделка собирается»: голая коробка → разметка светом → пол → стены → потолок → свет.
   Нарисованные мастера работают у текущего фронта. Сцены дизайн-проекта идут по кругу. */
(function () {
  const cv = document.getElementById('fx');
  if (!cv) return;
  const stageEl = document.getElementById('fxStage');
  const fallback = document.getElementById('fxFallback');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { cv.remove(); return; }
  const ctx = cv.getContext('2d');
  const BASE = window.BASE || '';
  const W = 1280, H = 853;

  /* границы зон в координатах картинки 1280×853 */
  const SCENES = [
    { id: 'd2', label: 'Переговорная зона', ceil: 300, floor: 600 },
    { id: 'd1', label: 'Рабочая зона', ceil: 250, floor: 590 },
    { id: 'd10', label: 'Переговорная у окна', ceil: 230, floor: 640 }
  ];
  const DUR = 15;
  const T = { lines: [0.6, 2.6], floor: [2.4, 5.8], walls: [5.2, 8.8], ceil: [8.2, 11.4], light: [11.2, 12.4], out: [14.3, 15] };
  const LABELS = [[0, '01 · Разметка'], [2.4, '02 · Полы'], [5.2, '03 · Стены и панели'], [8.2, '04 · Потолок'], [11.2, '05 · Свет'], [12.2, 'Готово']];

  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const back = t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const ph = (t, r) => clamp((t - r[0]) / (r[1] - r[0]));
  const rnd = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

  /* ---------- куски отделки ---------- */
  function buildPieces(sc) {
    const P = [];
    const fr = 4, fc = 10, fh = (H - sc.floor) / fr, fw = W / fc;
    for (let r = 0; r < fr; r++) for (let c = 0; c < fc; c++) {
      const row = fr - 1 - r;
      P.push({ z: 'floor', x: c * fw, y: sc.floor + r * fh, w: fw, h: fh,
        at: lerp(T.floor[0], T.floor[1] - .6, (row / fr) * .55 + (c / fc) * .35 + rnd(r * 31 + c) * .1) });
    }
    const wc = 14, ww = W / wc;
    for (let c = 0; c < wc; c++) {
      P.push({ z: 'wall', x: c * ww, y: sc.ceil, w: ww, h: sc.floor - sc.ceil,
        at: lerp(T.walls[0], T.walls[1] - .7, (c / wc) * .9 + rnd(c, 3) * .1) });
    }
    const cr = 3, cc = 8, ch = sc.ceil / cr, cw = W / cc;
    for (let r = 0; r < cr; r++) for (let c = 0; c < cc; c++) {
      const d = Math.hypot((c + .5) / cc - .5, ((r + .5) / cr - .9) * .6);
      P.push({ z: 'ceil', x: c * cw, y: r * ch, w: cw, h: ch,
        at: lerp(T.ceil[0], T.ceil[1] - .6, clamp(d / .6) * .85 + rnd(r * 17 + c, 5) * .15) });
    }
    return P;
  }

  /* ---------- мастер ---------- */
  const C = { vest: '#D2A15A', vestD: '#9A6A22', helm: '#F3C46A', skin: '#E9D3B8', dark: '#1B1712', pants: '#3B342C', tool: '#EFE9E0' };
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function limb(x1, y1, len, ang, w, col) {
    const x2 = x1 + Math.sin(ang) * len, y2 = y1 + Math.cos(ang) * len;
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return [x2, y2];
  }
  /* x,y — точка опоры (стопы); s — масштаб (рост ≈ 100*s) */
  function worker(x, y, s, pose, t, flip) {
    ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(0, 2, 26, 6, 0, 0, 7); ctx.fill();
    const k = t * 7;
    let hipY = -46, lean = 0, legA = 0, legB = 0, armA = .2, armB = -.2, kneel = false;
    if (pose === 'walk' || pose === 'carry') { legA = Math.sin(k) * .55; legB = -legA; armA = -legA * .8; armB = legA * .8; hipY = -46 - Math.abs(Math.cos(k)) * 2; }
    if (pose === 'carry') { armA = Math.PI - .35; armB = Math.PI + .35; }
    if (pose === 'roll') { armA = Math.PI - .25 + Math.sin(t * 5) * .45; armB = Math.PI - .5 + Math.sin(t * 5) * .45; }
    if (pose === 'kneel') { kneel = true; hipY = -30; lean = .35; armA = .9 + Math.sin(t * 6) * .25; armB = 1.1 + Math.sin(t * 6 + 1) * .25; }
    if (pose === 'reach') { armA = Math.PI - .1 + Math.sin(t * 6) * .12; armB = Math.PI + .25 + Math.sin(t * 6 + 2) * .12; }
    if (kneel) {
      const [k1x, k1y] = limb(-6, hipY, 20, -1.2, 9, C.pants); limb(k1x, k1y, 18, 0, 9, C.pants);
      const [k2x, k2y] = limb(6, hipY, 20, .25, 9, C.pants); limb(k2x, k2y, 18, -1.55, 9, C.pants);
    } else {
      const [a1x, a1y] = limb(-5, hipY, 24, legA, 9, C.pants); const [a2x] = limb(a1x, a1y, 22, legA * .4, 9, C.pants);
      const [b1x, b1y] = limb(5, hipY, 24, legB, 9, C.pants); const [b2x] = limb(b1x, b1y, 22, legB * .4, 9, C.pants);
      ctx.fillStyle = C.dark; ctx.fillRect(a2x - 4, -4, 12, 5); ctx.fillRect(b2x - 4, -4, 12, 5);
    }
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(lean);
    const bh = 36;
    ctx.fillStyle = C.vest; roundRect(-12, -bh, 24, bh, 6); ctx.fill();
    ctx.fillStyle = C.vestD; ctx.fillRect(-12, -bh + 16, 24, 4);
    ctx.fillStyle = '#EFE9E0'; ctx.fillRect(-12, -bh + 22, 24, 2);
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, -bh - 10, 9, 0, 7); ctx.fill();
    ctx.fillStyle = C.helm; ctx.beginPath(); ctx.arc(0, -bh - 12, 10.5, Math.PI, 0); ctx.fill();
    ctx.fillRect(-13, -bh - 13, 26, 3);
    const sh = -bh + 4;
    const [ax, ay] = limb(-9, sh, 18, armA, 7, C.vest); const [hx, hy] = limb(ax, ay, 16, armA * .95, 6, C.skin);
    const [bx, by] = limb(9, sh, 18, armB, 7, C.vest); const [gx, gy] = limb(bx, by, 16, armB * .95, 6, C.skin);
    ctx.lineWidth = 3;
    if (pose === 'roll') { ctx.strokeStyle = C.tool; ctx.fillStyle = C.tool; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx, hy - 26); ctx.stroke(); roundRect(hx - 11, hy - 34, 22, 9, 3); ctx.fill(); }
    if (pose === 'carry') { const py = Math.min(hy, gy) - 8; ctx.fillStyle = 'rgba(214,170,104,.95)'; roundRect(-40, py, 80, 9, 2); ctx.fill(); ctx.strokeStyle = '#8F6420'; ctx.lineWidth = 1.5; ctx.strokeRect(-40, py, 80, 9); }
    if (pose === 'kneel') { ctx.fillStyle = '#C9C2B6'; ctx.fillRect(gx - 2, gy - 3, 16, 6); }
    if (pose === 'reach') {
      ctx.fillStyle = '#6B6258'; roundRect(hx - 4, hy - 14, 8, 14, 2); ctx.fill();
      ctx.strokeStyle = '#D9D2C6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx, hy - 14); ctx.lineTo(hx, hy - 22); ctx.stroke();
      if (Math.sin(t * 40) > .2) { ctx.fillStyle = '#FFE2A8'; ctx.beginPath(); ctx.arc(hx + rnd(Math.floor(t * 30)) * 6 - 3, hy - 24, 2.4, 0, 7); ctx.fill(); }
    }
    ctx.restore(); ctx.restore();
  }
  function ladder(x, y, s, h) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 2, 34, 6, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#B9B1A5'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-7, -h); ctx.moveTo(24, 0); ctx.lineTo(7, -h); ctx.stroke();
    ctx.lineWidth = 3;
    for (let i = 1; i < 6; i++) { const yy = -h * i / 6, dx = lerp(24, 7, i / 6); ctx.beginPath(); ctx.moveTo(-dx, yy); ctx.lineTo(dx, yy); ctx.stroke(); }
    ctx.restore();
  }

  /* ---------- загрузка ---------- */
  const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const cache = [];
  function prep(i) {
    if (cache[i]) return Promise.resolve(cache[i]);
    if (prep[i]) return prep[i];
    const s = SCENES[i];
    return prep[i] = Promise.all([load(BASE + 'img/' + s.id + '.jpg'), load(BASE + 'img/fx/' + s.id + '_shell.jpg'), load(BASE + 'img/fx/' + s.id + '_lines.png')])
      .then(([photo, shell, lines]) => cache[i] = { s, photo, shell, lines, pieces: buildPieces(s), sx: photo.naturalWidth / W, sy: photo.naturalHeight / H });
  }

  /* ---------- кадр ---------- */
  let cw = 0, chh = 0;
  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    cw = w; chh = h;
  }

  function drawScene(S, t) {
    const { s, photo, shell, lines, pieces, sx, sy } = S;
    const zoom = 1.04 + .07 * (t / DUR);
    const sc = Math.max(cw / W, chh / H) * zoom;
    const focusX = cw / chh < 1 ? .62 : .5;
    ctx.setTransform(sc, 0, 0, sc, (cw - W * sc) * focusX, (chh - H * sc) * .5);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(shell, 0, 0, W, H);

    const gl = ph(t, T.lines) * (1 - ph(t, [11, 12]));
    if (gl > 0) {
      ctx.strokeStyle = `rgba(210,161,90,${.07 * gl})`; ctx.lineWidth = 1;
      ctx.beginPath(); for (let x = 0; x <= W; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y <= H; y += 40) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
    }
    const lp = ph(t, T.lines), lineFade = 1 - ph(t, [10.8, 12.2]);
    if (lp > 0 && lineFade > 0) {
      const cut = H * (1 - ease(lp));
      ctx.save(); ctx.beginPath(); ctx.rect(0, cut, W, H - cut); ctx.clip();
      ctx.globalAlpha = .85 * lineFade; ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(lines, 0, 0, W, H);
      ctx.restore();
      if (lp < 1) {
        const g = ctx.createLinearGradient(0, cut - 30, 0, cut + 30);
        g.addColorStop(0, 'rgba(255,200,120,0)'); g.addColorStop(.5, 'rgba(255,210,140,.4)'); g.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = g; ctx.fillRect(0, cut - 30, W, 60);
      }
    }
    for (const p of pieces) {
      const q = clamp((t - p.at) / .7);
      if (q <= 0) continue;
      const e = back(q);
      let dx = p.x, dy = p.y, w = p.w, h = p.h, rot = 0;
      if (p.z === 'floor') { dy += (1 - e) * 46; const k = lerp(.7, 1, e); dx += p.w * (1 - k) / 2; w *= k; }
      if (p.z === 'wall') { h = p.h * clamp(e); dy = p.y + p.h - h; }
      if (p.z === 'ceil') { dy -= (1 - e) * 70; rot = (1 - e) * (rnd(p.x, p.y) - .5) * .25; }
      ctx.save(); ctx.globalAlpha = clamp(q * 2.2);
      if (rot) { ctx.translate(dx + w / 2, dy + h / 2); ctx.rotate(rot); ctx.translate(-(dx + w / 2), -(dy + h / 2)); }
      if (p.z === 'wall') ctx.drawImage(photo, p.x * sx, dy * sy, p.w * sx, Math.max(1, h * sy), dx, dy, w + .6, h);
      else ctx.drawImage(photo, p.x * sx, p.y * sy, p.w * sx, p.h * sy, dx, dy, w + .6, h + .6);
      ctx.restore();
      if (q > .5 && q < 1) {
        ctx.strokeStyle = `rgba(255,205,130,${(1 - (q - .5) / .5) * .9})`; ctx.lineWidth = 2;
        ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
      }
      const after = t - p.at - .7;
      if (after > 0 && after < .9) { ctx.strokeStyle = `rgba(210,161,90,${(1 - after / .9) * .35})`; ctx.lineWidth = 1; ctx.strokeRect(p.x + .5, p.y + .5, p.w - 1, p.h - 1); }
    }
    const L = ph(t, T.light);
    if (L > 0) {
      ctx.globalAlpha = ease(L); ctx.drawImage(photo, 0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.sin(L * Math.PI) * .25;
      const g = ctx.createRadialGradient(W * .5, H * .25, 10, W * .5, H * .3, W * .7);
      g.addColorStop(0, 'rgba(255,214,150,1)'); g.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    const swp = ph(t, [12.2, 13.8]);
    if (swp > 0 && swp < 1) {
      const x = lerp(-300, W + 300, ease(swp));
      const g = ctx.createLinearGradient(x - 160, 0, x + 160, 0);
      g.addColorStop(0, 'rgba(255,220,170,0)'); g.addColorStop(.5, 'rgba(255,220,170,.16)'); g.addColorStop(1, 'rgba(255,220,170,0)');
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';
    }
    const ca = 1 - ph(t, [11, 11.8]);
    if (ca > 0) { ctx.globalAlpha = ca; crew(s, t); }
    ctx.globalAlpha = 1;
    const fade = ph(t, [0, .5]) * (1 - ph(t, T.out));
    if (fade < 1) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(14,12,9,${1 - fade})`; ctx.fillRect(0, 0, cw, chh); }
  }

  /* бригада: позиции следуют за фронтом работ */
  function crew(s, t) {
    const S = 1.75;
    if (t < T.floor[1]) worker(lerp(1180, 700, ph(t, [0.4, T.floor[1]])), H - 30, S, 'walk', t, true);
    if (t > T.floor[0] - .4 && t < T.walls[1]) { const p = ph(t, T.floor); worker(lerp(1160, 640, p), lerp(H - 14, s.floor + 80, p * .7), S * lerp(1.1, .85, p), 'kneel', t, true); }
    if (t > T.floor[0] + .6 && t < T.ceil[1]) worker(lerp(1340, 560, ph(t, [T.floor[0] + .6, T.walls[1]])), H - 40, S * 1.05, 'carry', t, true);
    if (t > T.walls[0] - .3 && t < T.light[0]) { const p = ph(t, T.walls); worker(lerp(620, 1180, p), s.floor + 40, S * .85, 'roll', t, false); }
    if (t > T.ceil[0] - .6 && t < T.light[1]) {
      const p = ph(t, T.ceil), x = 900 + Math.sin(p * Math.PI * 2) * 220, y = s.floor + 60;
      ladder(x, y, S * .9, 110); worker(x, y - 92 * S * .9, S * .85, 'reach', t, false);
    }
  }

  let idx = 0, start = null, paused = 0, pauseAt = 0, visible = true, lastLabel = '';
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(cv);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { if (!pauseAt) pauseAt = now; return; }
    if (pauseAt) { paused += now - pauseAt; pauseAt = 0; }
    if (start === null) start = now;
    let t = (now - start - paused) / 1000;
    if (t >= DUR) {
      const n = (idx + 1) % SCENES.length;
      if (cache[n]) { idx = n; start = now; paused = 0; t = 0; } else { prep(n); t = DUR - .001; }
    }
    if (t > DUR * .4) prep((idx + 1) % SCENES.length);
    size(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawScene(cache[idx], t);
    if (stageEl) {
      let l = LABELS[0][1]; for (const [a, b] of LABELS) if (t >= a) l = b;
      const txt = l + ' — ' + SCENES[idx].label;
      if (txt !== lastLabel) { lastLabel = txt; stageEl.textContent = txt; }
    }
  }
  prep(0).then(() => { cv.classList.add('on'); if (fallback) fallback.style.opacity = 0; requestAnimationFrame(frame); }).catch(() => cv.remove());
})();
