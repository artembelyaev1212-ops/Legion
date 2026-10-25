/* Общий скрипт всех страниц «Легиона». Каждый блок срабатывает, только если он есть на странице. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const BASE = window.BASE || '';
  const P = window.PROJECTS || [];
  const IMG = f => BASE + 'img/' + f + '.jpg';
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');

  /* ---------- шапка, плавающие кнопки, прогресс ---------- */
  const top = $('#top'), fab = $('#fab'), bar = $('#progress');
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    top && top.classList.toggle('solid', y > 40 || document.body.classList.contains('page-sub'));
    fab && fab.classList.toggle('show', y > innerHeight * .8);
    bar && (bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')');
    parallax(); sweep();
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- меню ---------- */
  const burger = $('#burger');
  const setMenu = o => {
    if (!burger) return;
    document.body.classList.toggle('menu-open', o);
    burger.setAttribute('aria-expanded', o);
    burger.setAttribute('aria-label', o ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = o ? 'hidden' : '';
  };
  burger && (burger.onclick = () => setMenu(!document.body.classList.contains('menu-open')));
  $$('#mnav a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ---------- обложка ---------- */
  const hero = $('.hero');
  hero && requestAnimationFrame(() => setTimeout(() => hero.classList.add('go'), 80));
  const slides = $$('#slides img'), dots = $('#dots'), cap = $('#slideCap');
  let si = 0, timer;
  if (slides.length && dots) {
    slides.forEach((_, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Фото ' + (i + 1)); b.onclick = () => go(i); dots.appendChild(b); });
    const go = i => {
      if (cap) { cap.style.opacity = 0; setTimeout(() => { cap.textContent = slides[i].dataset.cap || ''; cap.style.opacity = .85; }, 350); }
      slides[si].classList.remove('on'); dots.children[si].classList.remove('on');
      si = i; slides[si].classList.add('on');
      const d = dots.children[si]; d.classList.remove('on'); void d.offsetWidth; d.classList.add('on');
      clearTimeout(timer); timer = setTimeout(() => go((si + 1) % slides.length), 6000);
    };
    window.__go = go; go(0);
  }

  /* ---------- появление при прокрутке ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  function sweep() { const lim = innerHeight * .94; $$('.rv:not(.in), .steps li:not(.in), .tl:not(.in), .split-line:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < lim) el.classList.add('in'); }); }
  const watch = () => $$('.rv:not(.in), .steps li, .tl, .split-line').forEach(el => io.observe(el));

  /* ---------- счётчики ---------- */
  $$('[data-count]').forEach(el => {
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (!e.isIntersecting) return; o.disconnect();
      const to = +el.dataset.count;
      if (reduce) { el.textContent = to; return; }
      let t0; const f = t => { t0 ??= t; const p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }), { threshold: .5 }).observe(el);
  });

  /* ---------- услуги ---------- */
  const view = $('#svcView');
  if (view) {
    view.querySelector('img').dataset.k = $('#svcList .svc-item').dataset.img;
    $$('#svcList .svc-item').forEach(it => {
      const act = () => {
        $$('#svcList .svc-item').forEach(x => x.classList.toggle('act', x === it));
        let img = view.querySelector('img[data-k="' + it.dataset.img + '"]');
        if (!img) { img = document.createElement('img'); img.src = IMG(it.dataset.img); img.alt = ''; img.dataset.k = it.dataset.img; view.appendChild(img); }
        requestAnimationFrame(() => view.querySelectorAll('img').forEach(x => x.classList.toggle('on', x === img)));
      };
      it.addEventListener('mouseenter', act); it.addEventListener('click', act);
    });
  }

  /* ---------- объекты на главной ---------- */
  const list = $('#projList');
  if (list) {
    let vis = 0;
    P.forEach((p, i) => {
      if (p.hide) return;
      const el = document.createElement('article');
      el.className = 'proj' + (vis++ % 2 ? ' rev' : '');
      el.innerHTML = `<a class="proj-img rv" href="${BASE}projects/${p.slug}.html" aria-label="${p.name}"><img src="${IMG(p.img[0])}" alt="${p.name}" loading="lazy"><span class="cnt">${p.img.length} фото</span><span class="go">Смотреть объект →</span></a>
      <div class="proj-txt"><span class="k rv">${p.k}</span><h3 class="rv d1"><a href="${BASE}projects/${p.slug}.html">${p.name}</a></h3><p class="rv d2">${p.text}</p>
      <div class="chips rv d2">${p.chips.map(c => `<span>${c}</span>`).join('')}</div>
      <div class="thumbs rv d3">${p.img.slice(1, 5).map((f, k) => `<button type="button" data-p="${i}" data-k="${k + 1}" aria-label="Открыть фото ${k + 2}"><img src="${IMG(f)}" alt="" loading="lazy"></button>`).join('')}</div>
      <a class="btn ghost rv d3" href="${BASE}projects/${p.slug}.html"><span>Подробнее об объекте</span><span class="ar">→</span></a></div>`;
      list.appendChild(el);
    });
  }
  /* любые кнопки с data-p / data-k открывают просмотр */
  document.addEventListener('click', e => {
    const b = e.target.closest('button[data-p]');
    if (b) openLb(+b.dataset.p, +b.dataset.k);
  });

  /* ---------- параллакс ---------- */
  function parallax() {
    if (reduce) return;
    const h = innerHeight;
    $$('.proj-img img, .px img').forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      img.style.transform = `translateY(${((r.top + r.height / 2 - h / 2) / h) * -8}%)`;
    });
  }

  /* ---------- до / после ---------- */
  const ba = $('#baBox'), rng = $('#baRange');
  if (ba && rng) {
    const setX = v => ba.style.setProperty('--x', v + '%');
    rng.addEventListener('input', () => setX(rng.value));
    new IntersectionObserver((es, o) => es.forEach(e => {
      if (!e.isIntersecting || reduce) return; o.disconnect();
      let t0; const f = t => { t0 ??= t; const p = Math.min((t - t0) / 2200, 1); const v = 50 + Math.sin(p * Math.PI * 2) * 28 * (1 - p); setX(v); rng.value = v; if (p < 1) requestAnimationFrame(f); };
      setTimeout(() => requestAnimationFrame(f), 500);
    }), { threshold: .5 }).observe(ba);
  }

  /* ---------- просмотр фото ---------- */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let cp = 0, ci = 0, lastFocus = null;
  function openLb(p, i) { if (!lb || !P[p]) return; cp = p; ci = i; draw(); lastFocus = document.activeElement; lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbX').focus(); }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus && lastFocus.focus(); }
  function draw() { const a = P[cp].img; lbImg.src = IMG(a[ci]); lbImg.alt = P[cp].name + ', фото ' + (ci + 1); lbCap.textContent = P[cp].name + ' · ' + (ci + 1) + ' / ' + a.length; lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = ''; }
  function step(d) { const n = P[cp].img.length; ci = (ci + d + n) % n; draw(); }
  if (lb) {
    $('#lbX').onclick = closeLb; $('#lbP').onclick = () => step(-1); $('#lbN').onclick = () => step(1);
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
    let tx = 0;
    lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
    lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); });
  }
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
    if (!lb || lb.hidden) return;
    if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- копирование ---------- */
  async function copy(t) {
    try { await navigator.clipboard.writeText(t); return true; }
    catch (e) { const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok; }
  }
  $$('[data-copy-phone]').forEach(b => b.addEventListener('click', async () => {
    const t = b.textContent; b.textContent = (await copy('+7 999 440-75-27')) ? 'Скопировано' : 'Номер: +7 999 440-75-27'; setTimeout(() => b.textContent = t, 2000);
  }));

  /* ---------- калькулятор ---------- */
  const calc = $('#calc'), PR = window.PRICES;
  if (calc && PR) {
    const st = { type: 'office', level: 'turnkey', area: 300, mat: false };
    const typeBox = $('#cType'), lvlBox = $('#cLevel');
    Object.entries(PR.types).forEach(([k, v]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = v.name; b.dataset.v = k; b.setAttribute('aria-pressed', k === st.type); typeBox.appendChild(b); });
    Object.entries(PR.levels).forEach(([k, v]) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.v = k; b.setAttribute('aria-pressed', k === st.level); b.innerHTML = `<b>${v.name}</b><span>${v.desc}</span>`; lvlBox.appendChild(b); });
    const pick = (box, key) => box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st[key] = b.dataset.v; [...box.children].forEach(x => x.setAttribute('aria-pressed', x === b)); render(); });
    pick(typeBox, 'type'); pick(lvlBox, 'level');
    const range = $('#cArea'), num = $('#cAreaNum'), mat = $('#cMat');
    const setArea = v => { st.area = Math.max(20, Math.min(10000, +v || 0)); range.value = Math.min(st.area, +range.max); num.value = st.area; range.style.setProperty('--p', ((range.value - range.min) / (range.max - range.min) * 100) + '%'); render(); };
    range.addEventListener('input', () => setArea(range.value));
    num.addEventListener('input', () => setArea(num.value));
    mat.addEventListener('change', () => { st.mat = mat.checked; render(); });
    const outMin = $('#cMin'), outMax = $('#cMax'), outM2 = $('#cM2'), outT = $('#cTerm');
    let shown = [0, 0], anim;
    function tween(a, b) {
      cancelAnimationFrame(anim);
      if (reduce) { outMin.textContent = fmt(b[0]); outMax.textContent = fmt(b[1]); shown = b; return; }
      let t0; const from = shown.slice();
      const f = t => { t0 ??= t; const p = Math.min((t - t0) / 500, 1), e = 1 - Math.pow(1 - p, 3);
        shown = [from[0] + (b[0] - from[0]) * e, from[1] + (b[1] - from[1]) * e];
        outMin.textContent = fmt(shown[0]); outMax.textContent = fmt(shown[1]);
        if (p < 1) anim = requestAnimationFrame(f); };
      anim = requestAnimationFrame(f);
    }
    function render() {
      const L = PR.levels[st.level], T = PR.types[st.type];
      let k = T.k * (st.mat ? PR.materials : 1);
      const d = PR.discounts.find(([a]) => st.area >= a); if (d) k *= d[1];
      const m2 = [L.min * k, L.max * k];
      tween(shown, [m2[0] * st.area, m2[1] * st.area]);
      outM2.textContent = fmt(m2[0]) + ' – ' + fmt(m2[1]) + ' ₽/м²';
      const w = Math.max(2, Math.round(st.area / L.pace));
      outT.textContent = w < 9 ? `${w}–${w + 2} нед.` : `${Math.round(w / 4.3)}–${Math.round(w / 4.3) + 1} мес.`;
    }
    $('#cSend').addEventListener('click', () => {
      const L = PR.levels[st.level], T = PR.types[st.type];
      const msg = $('#fMsg'), area = $('#fArea'), type = $('#fType');
      if (msg) msg.value = `Расчёт с сайта: ${T.name}, ${st.area} м², ${L.name}${st.mat ? ', с материалами' : ', только работы'}. Ориентир: ${outMin.textContent} – ${outMax.textContent} ₽.`;
      if (area) area.value = st.area;
      const map = { office: 'Офис', restaurant: 'Ресторан / кафе', medical: 'Медицинский объект', admin: 'Административное здание', retail: 'Торговое / производственное', home: 'Жилой объект' };
      if (type && map[st.type]) type.value = map[st.type];
    });
    setArea(st.area);
  }

  /* ---------- форма ---------- */
  const form = $('#form');
  if (form) {
    let who = 'Заказчик';
    $$('#seg button').forEach(b => b.onclick = () => { who = b.dataset.v; $$('#seg button').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    $$('[data-type="partner"]').forEach(a => a.addEventListener('click', () => { const b = $('#seg button[data-v="Дизайн-студия"]'); b && b.click(); }));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const v = id => ($(id) ? $(id).value.trim() : '');
      const lines = ['Здравствуйте, Артём! Заявка с сайта «Легион».', 'Кто: ' + who];
      if (v('#fName')) lines.push('Имя: ' + v('#fName'));
      if (v('#fPhone')) lines.push('Телефон: ' + v('#fPhone'));
      if ($('#fType')) lines.push('Объект: ' + $('#fType').value + (v('#fArea') ? ', ' + v('#fArea') + ' м²' : ''));
      if (v('#fMsg')) lines.push('Задача: ' + v('#fMsg'));
      const text = lines.join('\n'); const ok = await copy(text); const out = $('#out');
      out.hidden = false;
      out.textContent = (ok ? 'Текст заявки скопирован. Вставьте его в чат с Артёмом в Telegram, он уже открывается.\n\n' : 'Скопируйте текст ниже и отправьте Артёму в Telegram или по номеру 8 999 440-75-27.\n\n') + text;
      window.open('https://t.me/+79994407527', '_blank', 'noopener');
    });
  }

  /* ---------- магнитные кнопки и свечение за курсором ---------- */
  if (fine && !reduce) {
    $$('.btn.primary, .magnet').forEach(b => {
      b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; });
      b.addEventListener('mouseleave', () => b.style.transform = '');
    });
    $$('.glow').forEach(el => el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
  }

  onScroll(); watch();
})();
