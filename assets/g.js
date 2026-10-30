/* Общий скрипт сайта группы компаний «Легион». Каждый блок работает, только если он есть на странице. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const C = window.CONTACT || {};
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');

  /* шапка и плавающие кнопки */
  const top = $('#top'), fab = $('#fab');
  const onScroll = () => {
    top && top.classList.toggle('solid', scrollY > 40);
    fab && fab.classList.toggle('show', scrollY > innerHeight * .9);
    sweep();
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* мобильное меню */
  const burger = $('#burger');
  const setMenu = o => { document.body.classList.toggle('menu-open', o); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Закрыть меню' : 'Открыть меню'); document.body.style.overflow = o ? 'hidden' : ''; };
  if (burger) { burger.onclick = () => setMenu(!document.body.classList.contains('menu-open')); $$('#mnav a').forEach(a => a.addEventListener('click', () => setMenu(false))); }

  /* появление при прокрутке */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  const watch = '.rv:not(.in), .co-list li:not(.in), .steps li:not(.in)';
  function sweep() { const lim = innerHeight * .95; $$(watch).forEach(el => { if (el.getBoundingClientRect().top < lim) el.classList.add('in'); }); }
  $$(watch).forEach(el => io.observe(el));

  /* просмотр фото: кнопки с data-gal="имя" собираются в общую галерею */
  const lb = $('#lb');
  if (lb) {
    const img = $('#lbImg'), cap = $('#lbCap'); let set = [], i = 0, last = null;
    const draw = () => { img.src = set[i].src; img.alt = set[i].alt; cap.textContent = (set[i].alt ? set[i].alt + ' · ' : '') + (i + 1) + ' / ' + set.length; };
    const open = (g, el) => { set = $$(`[data-gal="${g}"]`).map(b => ({ src: b.dataset.full || b.querySelector('img').src, alt: b.querySelector('img').alt })); i = $$(`[data-gal="${g}"]`).indexOf(el); draw(); last = document.activeElement; lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbX').focus(); };
    const close = () => { lb.hidden = true; document.body.style.overflow = ''; last && last.focus(); };
    const step = d => { i = (i + d + set.length) % set.length; draw(); };
    document.addEventListener('click', e => { const b = e.target.closest('[data-gal]'); if (b) { e.preventDefault(); open(b.dataset.gal, b); } });
    $('#lbX').onclick = close; $('#lbP').onclick = () => step(-1); $('#lbN').onclick = () => step(1);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
    let tx = 0; lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true }); lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) step(d < 0 ? 1 : -1); });
  }
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });

  /* до/после */
  $$('.ba').forEach(ba => {
    const r = ba.querySelector('input'); const set = v => ba.style.setProperty('--x', v + '%');
    r.addEventListener('input', () => set(r.value));
    if (!reduce) new IntersectionObserver((es, o) => es.forEach(e => { if (!e.isIntersecting) return; o.disconnect(); let t0; const f = t => { t0 ??= t; const p = Math.min((t - t0) / 2200, 1); const v = 50 + Math.sin(p * Math.PI * 2) * 26 * (1 - p); set(v); r.value = v; if (p < 1) requestAnimationFrame(f); }; setTimeout(() => requestAnimationFrame(f), 400); }), { threshold: .5 }).observe(ba);
  });

  /* копирование */
  async function copy(t) {
    try { await navigator.clipboard.writeText(t); return true; }
    catch (e) { const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok; }
  }
  $$('[data-max]').forEach(b => b.addEventListener('click', async () => {
    const ok = await copy(C.phoneRaw || '+79994407527'); const n = b.closest('.msg') && b.closest('.msg').parentElement.querySelector('.note');
    if (n) n.textContent = ok ? `Номер ${C.phone || '+7 999 440-75-27'} скопирован. Найдите Артёма в Max по номеру.` : `Найдите Артёма в Max по номеру ${C.phone || '+7 999 440-75-27'}.`;
  }));

  /* калькулятор */
  const PR = window.PRICES, calc = $('#calc');
  if (calc && PR) {
    const st = { type: Object.keys(PR.types)[0], level: 'turnkey', area: 300, mat: false };
    const tBox = $('#cType'), lBox = $('#cLevel');
    Object.entries(PR.types).forEach(([k, v]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = v.name; b.dataset.v = k; b.setAttribute('aria-pressed', k === st.type); tBox.appendChild(b); });
    Object.entries(PR.levels).forEach(([k, v]) => { const b = document.createElement('button'); b.type = 'button'; b.dataset.v = k; b.setAttribute('aria-pressed', k === st.level); b.innerHTML = `<b>${v.name}</b><span>${v.desc}</span>`; lBox.appendChild(b); });
    const pick = (box, key) => box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st[key] = b.dataset.v; [...box.children].forEach(x => x.setAttribute('aria-pressed', x === b)); render(); });
    pick(tBox, 'type'); pick(lBox, 'level');
    const rg = $('#cArea'), num = $('#cAreaNum'), mat = $('#cMat');
    const setA = v => { st.area = Math.max(20, Math.min(20000, +v || 0)); rg.value = Math.min(st.area, +rg.max); num.value = st.area; rg.style.setProperty('--p', ((rg.value - rg.min) / (rg.max - rg.min) * 100) + '%'); render(); };
    rg.addEventListener('input', () => setA(rg.value)); num.addEventListener('input', () => setA(num.value)); mat.addEventListener('change', () => { st.mat = mat.checked; render(); });
    const oMin = $('#cMin'), oMax = $('#cMax'), oM2 = $('#cM2'), oT = $('#cTerm'); let shown = [0, 0], an;
    function tween(b) { cancelAnimationFrame(an); if (reduce) { oMin.textContent = fmt(b[0]); oMax.textContent = fmt(b[1]); shown = b; return; } let t0; const a = shown.slice(); const f = t => { t0 ??= t; const p = Math.min((t - t0) / 500, 1), e = 1 - Math.pow(1 - p, 3); shown = [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]; oMin.textContent = fmt(shown[0]); oMax.textContent = fmt(shown[1]); if (p < 1) an = requestAnimationFrame(f); }; an = requestAnimationFrame(f); }
    function render() {
      const L = PR.levels[st.level], T = PR.types[st.type]; let k = T.k * (st.mat ? PR.materials : 1);
      const d = PR.discounts.find(([a]) => st.area >= a); if (d) k *= d[1];
      const m2 = [L.min * k, L.max * k]; tween([m2[0] * st.area, m2[1] * st.area]);
      oM2.textContent = fmt(m2[0]) + ' – ' + fmt(m2[1]) + ' ₽/м²';
      const w = Math.max(2, Math.round(st.area / L.pace)); oT.textContent = w < 9 ? `${w}–${w + 2} нед.` : `${Math.round(w / 4.3)}–${Math.round(w / 4.3) + 1} мес.`;
    }
    $('#cSend').addEventListener('click', () => {
      const L = PR.levels[st.level], T = PR.types[st.type];
      const m = $('#fMsg'), a = $('#fArea'); if (a) a.value = st.area;
      if (m) m.value = `Расчёт с сайта: ${T.name}, ${st.area} м², ${L.name}${st.mat ? ', с материалами' : ', только работы'}. Ориентир: ${oMin.textContent} – ${oMax.textContent} ₽.`;
    });
    setA(st.area);
  }

  /* заявка: файлы показываем списком; текст копируем и открываем Telegram */
  $$('.lead-form').forEach(form => {
    const fi = form.querySelector('input[type=file]'), list = form.querySelector('.files');
    if (fi) fi.addEventListener('change', () => { list.innerHTML = ''; [...fi.files].forEach(f => { const li = document.createElement('li'); li.textContent = '◆ ' + f.name + ' · ' + Math.max(1, Math.round(f.size / 1024)) + ' КБ'; list.appendChild(li); }); });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const v = n => { const el = form.querySelector(`[name="${n}"]`); return el ? el.value.trim() : ''; };
      const phone = form.querySelector('[name="phone"]');
      if (phone && !v('phone')) { phone.focus(); phone.setAttribute('aria-invalid', 'true'); form.querySelector('.out').hidden = false; form.querySelector('.out').textContent = 'Укажите телефон, чтобы мы могли перезвонить.'; return; }
      const lines = [`Здравствуйте, Артём! Заявка с сайта${form.dataset.page ? ' (' + form.dataset.page + ')' : ''}.`];
      if (v('name')) lines.push('Имя: ' + v('name'));
      if (v('phone')) lines.push('Телефон: ' + v('phone'));
      if (v('dir')) lines.push('Направление: ' + v('dir'));
      if (v('area')) lines.push('Площадь: ' + v('area') + ' м²');
      if (v('msg')) lines.push('Задача: ' + v('msg'));
      const files = fi ? [...fi.files].map(f => f.name) : [];
      if (files.length) lines.push('Файлы (пришлю в чат): ' + files.join(', '));
      const text = lines.join('\n'); const ok = await copy(text); const out = form.querySelector('.out'); out.hidden = false;
      out.textContent = (ok ? 'Текст заявки скопирован. В Telegram вставьте его в чат с Артёмом' : 'Отправьте этот текст Артёму в Telegram или позвоните: ' + (C.phone || '8 999 440-75-27')) + (files.length ? ' и прикрепите выбранные файлы.' : '.') + '\n\n' + text;
      window.open(C.tg || 'https://t.me/+79994407527', '_blank', 'noopener');
    });
  });

  onScroll();
})();
