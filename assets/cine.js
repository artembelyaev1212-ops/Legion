/* ООО «Легион»: камера по кадрам кабинета, управляется прокруткой. */
(function () {
  /* ====== ДАННЫЕ КОМПАНИИ: заполните — и строки появятся на сайте ====== */
  const COMPANY = {
    email: '',            // например: 'info@legion.ru'
    inn: '',              // ИНН
    ogrn: '',             // ОГРН
    address: '',          // юридический или фактический адрес
    stats: [              // цифры в финальном кадре; пустые значения не показываются
      { value: '', label: 'лет опыта' },
      { value: '', label: 'объектов сдано' },
      { value: '', label: 'м² отделки' }
    ]
  };
  /* ==================================================================== */

  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const sm = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* кадры: интервал прокрутки и движение камеры (масштаб и точка, к которой подъезжаем) */
  const SHOTS = [
    { a: 0, b: .12, from: [1.0, .5, .55], to: [1.16, .42, .62] },
    { a: .10, b: .31, from: [1.04, .5, .5], to: [1.55, .30, .46] },
    { a: .29, b: .50, from: [1.04, .5, .5], to: [1.5, .82, .45] },
    { a: .48, b: .69, from: [1.3, .5, .2], to: [1.7, .56, .04] },
    { a: .67, b: .88, from: [1.08, .5, .5], to: [1.6, .45, .86] },
    { a: .86, b: 1.0, from: [1.62, .40, .66], to: [1.0, .5, .5] }
  ];
  const GO = [0, .21, .40, .59, .775, .985];
  const FADE = .03;

  const cine = $('#cine'), stage = $('#stage');
  const shots = $$('.shot'), imgs = shots.map(s => s.querySelector('img'));
  const panels = $$('.panel'), side = $('#side'), prog = $('#prog'), hint = $('#hint'), top = $('#top');
  const chap = $$('#chap button');

  /* реквизиты и цифры */
  const req = $('#req');
  const addReq = (k, v) => { if (!v) return; const dt = document.createElement('dt'); dt.textContent = k; const dd = document.createElement('dd'); dd.textContent = v; req.append(dt, dd); };
  if (COMPANY.email) { const dt = document.createElement('dt'); dt.textContent = 'Почта'; const dd = document.createElement('dd'); const a = document.createElement('a'); a.href = 'mailto:' + COMPANY.email; a.textContent = COMPANY.email; dd.append(a); req.append(dt, dd); }
  addReq('ИНН', COMPANY.inn); addReq('ОГРН', COMPANY.ogrn); addReq('Адрес', COMPANY.address);
  const st = COMPANY.stats.filter(s => s.value);
  if (st.length) { const box = $('#stats'); box.hidden = false; st.forEach(s => { const d = document.createElement('div'); d.innerHTML = `<b>${s.value}</b><span>${s.label}</span>`; box.append(d); }); }

  let target = 0, p = 0, W = innerWidth, H = innerHeight;
  function measure() { W = stage.clientWidth; H = stage.clientHeight; }
  function readScroll() {
    const r = cine.getBoundingClientRect();
    target = clamp(-r.top / Math.max(1, cine.offsetHeight - innerHeight));
  }

  function cam(img, s, fx, fy) {
    // подъезд к точке (fx, fy): точка тянется к центру, края кадра не открываются
    const dx = (.5 - fx) * W * s, dy = (.5 - fy) * H * s;
    const mx = (s - 1) * W / 2, my = (s - 1) * H / 2;
    const tx = clamp(dx, -mx, mx), ty = clamp(dy, -my, my);
    img.style.transform = `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
  }

  let lastActive = -1;
  function render() {
    SHOTS.forEach((S, i) => {
      const fin = i === 0 ? 1 : sm((p - S.a) / FADE);
      const fout = i === SHOTS.length - 1 ? 1 : 1 - sm((p - (S.b - FADE)) / FADE);
      const o = fin * fout;
      shots[i].style.opacity = o.toFixed(3);
      shots[i].style.visibility = o > .001 ? 'visible' : 'hidden';
      if (o > .001) {
        const t = ease((p - S.a) / (S.b - S.a));
        const s = S.from[0] + (S.to[0] - S.from[0]) * t;
        const fx = S.from[1] + (S.to[1] - S.from[1]) * t;
        const fy = S.from[2] + (S.to[2] - S.from[2]) * t;
        cam(imgs[i], reduce ? S.to[0] : s, fx, fy);
      }
    });
    let sideOn = 0, flip = false;
    panels.forEach(el => {
      const a = +el.dataset.a, b = +el.dataset.b;
      const o = sm((p - a) / .025) * (1 - sm((p - b) / .025));
      el.style.opacity = o.toFixed(3);
      const y = (1 - sm((p - a) / .025)) * 30 - sm((p - b) / .025) * 30;
      el.style.transform = (el.classList.contains('stop') && innerWidth > 860 ? 'translateY(-50%) ' : '') + `translateY(${y.toFixed(1)}px)`;
      el.classList.toggle('on', o > .5);
      if (el.classList.contains('stop') && o > sideOn) { sideOn = o; flip = el.classList.contains('r'); }
    });
    side.style.opacity = sideOn.toFixed(3);
    side.style.transform = flip ? 'scaleX(-1)' : 'none';
    prog.style.transform = `scaleX(${p.toFixed(4)})`;
    hint.style.opacity = p > .015 ? 0 : 1;
    let act = 0; GO.forEach((g, i) => { if (p >= (i ? (GO[i - 1] + g) / 2 : 0)) act = i; });
    if (act !== lastActive) { lastActive = act; chap.forEach((b, i) => b.classList.toggle('on', i === act)); $$('.nav a[data-go]').forEach(a => a.classList.toggle('on', +a.dataset.go === act)); }
  }

  function loop() {
    readScroll();
    const d = target - p;
    p = Math.abs(d) < .0004 ? target : p + d * (reduce ? 1 : .11);
    render();
    top.classList.toggle('solid', scrollY > cine.offsetHeight - innerHeight - 10);
    requestAnimationFrame(loop);
  }
  addEventListener('resize', () => { measure(); readScroll(); });
  measure(); readScroll(); p = target; render(); requestAnimationFrame(loop);

  /* переходы по главам */
  const goTo = i => scrollTo({ top: cine.offsetTop + GO[i] * (cine.offsetHeight - innerHeight), behavior: reduce ? 'auto' : 'smooth' });
  chap.forEach(b => b.addEventListener('click', () => goTo(+b.dataset.go)));
  $$('[data-go]').forEach(a => { if (a.tagName === 'A') a.addEventListener('click', e => { e.preventDefault(); goTo(+a.dataset.go); }); });
  $('.brand').addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });

  /* появление блоков контактов */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  $$('.rv').forEach(el => io.observe(el));

  /* копирование */
  async function copy(t) {
    try { await navigator.clipboard.writeText(t); return true; }
    catch (e) { const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (_) {} ta.remove(); return ok; }
  }
  $('#maxBtn').addEventListener('click', async () => {
    const ok = await copy('+79994407527');
    $('#maxNote').textContent = ok ? 'Номер +7 999 440-75-27 скопирован. Найдите Артёма в Max по номеру.' : 'Найдите Артёма в Max по номеру +7 999 440-75-27.';
  });

  /* заявка: собираем текст и открываем Telegram */
  $('#form').addEventListener('submit', async e => {
    e.preventDefault();
    const v = id => $(id).value.trim();
    const lines = ['Здравствуйте, Артём! Заявка с сайта «Легион».'];
    if (v('#fName')) lines.push('Имя: ' + v('#fName'));
    if (v('#fPhone')) lines.push('Телефон: ' + v('#fPhone'));
    lines.push('Объект: ' + $('#fType').value + (v('#fArea') ? ', ' + v('#fArea') + ' м²' : ''));
    const text = lines.join('\n');
    const ok = await copy(text);
    const out = $('#out'); out.hidden = false;
    out.textContent = (ok ? 'Текст заявки скопирован. Вставьте его в чат с Артёмом в Telegram, он откроется сейчас.\n\n' : 'Отправьте этот текст Артёму в Telegram или позвоните: 8 999 440-75-27.\n\n') + text;
    window.open('https://t.me/+79994407527', '_blank', 'noopener');
  });
})();
