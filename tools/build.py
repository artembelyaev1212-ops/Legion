#!/usr/bin/env python3
"""Генератор страниц сайта группы компаний «Легион».
Запуск: python3 tools/build.py  (из корня репозитория). Пишет index.html и папки страниц."""
import html, json, os, datetime
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SITE = 'https://artembelyaev1212-ops.github.io/Legion/'
V = str(int(datetime.datetime.now().timestamp()))
e = html.escape

GROUP = ['ООО «ГОЛТ»', 'ООО «Стройтехнологии»', 'ООО «Рубикон-ТИ»', 'ООО «Артстрой69»', 'ИП Беляев Артём Алексеевич']
PHONE, PHONE_RAW, TG = '8 999 440-75-27', '+79994407527', 'https://t.me/+79994407527'

# ---------------------------------------------------------------- направления
DIRS = [
  dict(slug='stroitelstvo', no='01', short='Строительство и реконструкция', nav='Строительство',
       title='Строительство и реконструкция зданий в Москве и МО',
       desc='Реконструкция и перепланировка зданий, усиление конструкций, кладка, фасадные работы и подготовка объекта под отделку. Москва и Московская область, работа по договору.',
       h1='Строительство <em>и реконструкция</em>', img='7952', card='7911',
       lead='Перестраиваем здания и помещения под новую задачу: от демонтажа и усиления конструкций до фасада и сдачи объекта под чистовую отделку.',
       teaser='Перепланировка, усиление конструкций, кладка, фасады и подготовка под отделку.',
       scope=[('Конструктив', ['Демонтаж и разборка', 'Устройство и закладка проёмов', 'Усиление стен и проёмов металлом', 'Кладка из кирпича и блоков', 'Перегородки']),
              ('Реконструкция', ['Перепланировка помещений', 'Приспособление исторических зданий', 'Лестницы и ограждения', 'Подготовка под инженерные системы']),
              ('Фасады', ['Ремонт фасадов', 'Утепление', 'Облицовка', 'Работа с лесов', 'Ремонт исторических фасадов'])],
       answers=[('Работаем по проекту и без него', 'Если проект есть, считаем по нему. Если нет, выезжаем на объект, делаем замеры и согласуем объём работ до подписания договора.'),
                ('Сдаём под отделку или под ключ', 'Можем остановиться на конструктиве или сразу продолжить отделкой, инженерией и мебелью. Тогда объект ведёт одна команда без передачи между подрядчиками.')],
       gallery=['7952', '7911', '7920', '7909'], cases=['office']),
  dict(slug='otdelka', no='02', short='Ремонт и отделка', nav='Отделка',
       title='Ремонт и отделка коммерческих и жилых помещений — Москва и МО',
       desc='Черновая и чистовая отделка офисов, кабинетов, ресторанов, медицинских и жилых помещений: стены, потолки, полы, декоративные покрытия. Под ключ, по договору.',
       h1='Ремонт <em>и отделка</em>', img='7940', card='7966',
       lead='Черновая и чистовая отделка офисов, кабинетов, ресторанов и жилых помещений. Сначала ровная основа и тишина, потом фактура, которую видно.',
       teaser='Стены, потолки и полы: от стяжки и штукатурки до шпона, камня и декоративных покрытий.',
       scope=[('Стены', ['Штукатурка и выравнивание', 'Перегородки из ГКЛ и блоков', 'Шумоизоляция', 'Покраска', 'Декоративная штукатурка', 'Микроцемент', 'Стеновые панели', 'Плитка и керамогранит', 'Рейки']),
              ('Потолки', ['Выравнивание и покраска', 'ГКЛ и многоуровневые', 'Натяжные', 'Реечные', '«Армстронг»', '«Грильято»', 'Теневой профиль', 'Скрытая подсветка']),
              ('Полы', ['Демонтаж и стяжка', 'Наливной пол', 'Гидро- и шумоизоляция', 'Тёплый пол', 'Паркет и инженерная доска', 'Ламинат и кварцвинил', 'Керамогранит', 'Ковролин', 'Промышленные полы'])],
       answers=[('Отдельные работы или весь комплекс', 'Возьмём только полы или только стены, а можем вести всю отделку целиком. Объём фиксируем в договоре и смете.'),
                ('Каждый слой принимаем отдельно', 'Скрытые работы фотографируем и закрываем актами до того, как их закроет следующий слой.')],
       gallery=['7940', '7919', '7966', '7944', '7914', '7971'], cases=['office', 'restaurant', 'admin']),
  dict(slug='inzhenernye-sistemy', no='03', short='Инженерные системы', nav='Инженерия',
       title='Инженерные системы: электрика, вентиляция, отопление, водоснабжение',
       desc='Монтаж инженерных систем при ремонте и реконструкции: электрика и освещение, слаботочные сети, вентиляция и кондиционирование, отопление, водоснабжение и канализация.',
       h1='Инженерные <em>системы</em>', img='7927', card='7927',
       lead='Всё, что потом скроют потолок и стены: электрика, слаботочка, вентиляция, отопление и вода. Монтируем аккуратно, потому что здание обслуживают годами.',
       teaser='Электрика и свет, слаботочка, вентиляция, отопление, водоснабжение и канализация.',
       scope=[('Электрика', ['Щиты и разводка', 'Кабельные лотки', 'Освещение и светильники', 'Розеточные группы', 'Слаботочные сети']),
              ('Климат', ['Вентиляция', 'Кондиционирование', 'Воздуховоды и решётки', 'Короба под отделку', 'Отопление']),
              ('Вода', ['Водоснабжение', 'Канализация', 'Сантехника', 'Санузлы под ключ'])],
       answers=[('Инженерия и отделка в одних руках', 'Сети прокладываем с учётом будущих потолков, панелей и мебели. Не приходится переделывать отделку под розетку или решётку.'),
                ('Фотофиксация до закрытия', 'Перед тем как закрыть потолок или стену, снимаем трассы и узлы. Фото остаются у заказчика.')],
       gallery=['7927', '7928', '7931', '7917'], cases=['admin']),
  dict(slug='dizajn-interera', no='04', short='Дизайн интерьеров', nav='Дизайн',
       title='Дизайн интерьеров кабинетов, офисов и жилых пространств',
       desc='Дизайн-проект интерьера: планировка, концепция, 3D-визуализации, подбор материалов и рабочая документация. Реализуем проект своими силами.',
       h1='Дизайн <em>интерьеров</em>', img='d2', card='d2',
       lead='Проектируем то, что потом сами строим. Поэтому в проекте нет красивых, но невыполнимых узлов, а визуализация совпадает с готовым интерьером.',
       teaser='Планировка, концепция, 3D-визуализации и рабочая документация, которую мы же и реализуем.',
       scope=[('Проект', ['Обмеры', 'Планировочное решение', 'Концепция', '3D-визуализации']),
              ('Документация', ['Рабочие чертежи', 'Развёртки стен', 'Планы потолков и полов', 'Схемы освещения', 'Узлы']),
              ('Комплектация', ['Подбор материалов', 'Мебель на заказ', 'Свет', 'Текстиль и декор'])],
       answers=[('Проект, который можно построить', 'Узлы и материалы проверяет та же команда, которая будет их монтировать. Смета считается по проекту сразу.'),
                ('Визуализация = результат', 'Реализуем интерьер сами, поэтому отвечаем за совпадение готового объекта с картинкой.')],
       gallery=['d2', 'n1', 'n3', 'd5', 'n4', 'd1'], cases=['design']),
  dict(slug='mebel-na-zakaz', no='05', short='Мебель на заказ', nav='Мебель',
       title='Мебель на заказ по индивидуальным проектам — собственное производство',
       desc='Мебель на заказ: кабинеты, столы, шкафы, стеллажи, ресепшен, кухни, гардеробные. Массив, шпон, МДФ, камень, металл. Замер, проект, производство, монтаж.',
       h1='Мебель <em>на заказ</em>', img='n4', card='n6',
       lead='Кабинеты, столы, шкафы, стеллажи, ресепшен, кухни и гардеробные по индивидуальным проектам. Собственное производство и свои поставщики материалов.',
       teaser='Своё производство: кабинеты, шкафы, стеллажи, ресепшен, кухни и гардеробные по вашим размерам.',
       scope=[('Что делаем', ['Кабинеты руководителя', 'Столы и переговорные', 'Шкафы и стеллажи', 'Витрины с подсветкой', 'Ресепшен', 'Кухни', 'Гардеробные', 'Стеновые панели']),
              ('Материалы', ['Массив', 'Шпон', 'МДФ', 'Камень', 'Металл', 'Стекло', 'Фурнитура']),
              ('Процесс', ['Замер', 'Дизайн-проект', 'Производство', 'Доставка', 'Монтаж'])],
       answers=[('Под ваши размеры, а не под каталог', 'Мебель встраивается в помещение миллиметр в миллиметр: ниши, колонны, откосы, подсветка, розетки.'),
                ('Отделка и мебель согласованы', 'Шпон панелей, фасадов и столешниц подбираем в одной партии и одном тоне, потому что делаем и то, и другое.')],
       gallery=['n4', 'n6', 'n2', 'd9', 'n1', 'd7'], cases=['design']),
  dict(slug='kompleksnoe-osnashchenie', no='06', short='Комплексное оснащение', nav='Оснащение',
       title='Комплексное оснащение помещений мебелью и интерьерными решениями',
       desc='Комплектация объекта под ключ: мебель на заказ и серийная, свет, текстиль, декор. Свои поставщики и производство, одна смета и один срок.',
       h1='Комплексное <em>оснащение</em>', img='n5', card='d4',
       lead='Помещение сдаём не пустым, а готовым к работе: мебель, свет, текстиль и декор подобраны под проект и привезены к сроку.',
       teaser='Мебель, свет, текстиль и декор от своих поставщиков. Одна смета и один срок на весь объект.',
       scope=[('Мебель', ['Мебель на заказ', 'Серийная мебель', 'Мягкая мебель', 'Переговорные зоны']),
              ('Интерьер', ['Свет и светильники', 'Портьеры и текстиль', 'Ковры', 'Декор']),
              ('Логистика', ['Подбор и согласование', 'Закупка у своих поставщиков', 'Доставка', 'Сборка и расстановка'])],
       answers=[('Одна смета вместо десяти счетов', 'Не нужно искать мебельщиков, светотехников и текстильщиков по отдельности: комплектуем объект целиком.'),
                ('Свои поставщики', 'Работаем напрямую с производителями материалов и мебели, поэтому контролируем сроки и цену.')],
       gallery=['n5', 'd4', 'd3', 'n6'], cases=['design']),
]

# ---------------------------------------------------------------- проекты (только реальные данные)
CASES = [
  dict(slug='office', t='Офис · историческое здание', name='Бизнес-центр в историческом здании', cover='7919',
       task='', area='', term='', address='',
       text='Полная отделка офисов в старинном доме: сохранили и открыли кирпич, обшили кабинеты дубовыми панелями, уложили паркет, собрали арочные стеклянные перегородки, лестницы с керамогранитом и коваными ограждениями.',
       done=['Расчистка и защита исторической кирпичной кладки', 'Обшивка кабинетов панелями и рейкой из дуба', 'Паркет и инженерная доска, модульный паркет', 'Арочные и прямые стеклянные перегородки в металлическом профиле', 'Лестницы: облицовка керамогранитом, кованые ограждения', 'Санузлы: восьмиугольная плитка, шестигранная мозаика'],
       img=['7919', '7911', '7914', '7920', '7909', '7918', '7907', '7915', '7922', '7921', '7913', '7916']),
  dict(slug='restaurant', t='Ресторан', name='Ресторан грузинской кухни', cover='7966',
       task='', area='', term='', address='',
       text='Зал и открытая кухня с характером: роспись потолка, фактурная штукатурка, кирпич «ёлочкой», барная стойка из массива с плиткой-пэчворк, деревянные перегородки и керамогранит под паркет.',
       done=['Художественная роспись потолка и фризов', 'Фактурная штукатурка стен под глину', 'Декоративная кирпичная кладка «ёлочкой» с подсветкой', 'Барная стойка из массива с облицовкой плиткой', 'Перегородки из деревянного бруса', 'Керамогранит под паркет укладкой «ёлочка»'],
       img=['7966', '7971', '7967', '7970', '7965', '7964']),
  dict(slug='admin', t='Административное здание', name='Кабинеты, коридоры и лестницы', cover='7940',
       task='', area='', term='', address='',
       text='Отделка административного здания: венецианская штукатурка в коридорах и на лестницах, стеновые панели в кабинетах, подвесные потолки с кабельными лотками, керамогранит, замена дверей.',
       done=['Венецианская штукатурка в коридорах и на лестницах', 'Стеновые панели с отбойником в кабинетах', 'Подвесные потолки «Армстронг» и кабельные лотки', 'Керамогранит в коридорах и на лестничных маршах', 'Замена дверей и наличников', 'Короба вентиляции под штукатурку'],
       img=['7940', '7944', '7947', '7928', '7931', '7929'], ba=('7927', '7928')),
  dict(slug='design', t='Дизайн-проект · визуализации', name='Кабинеты руководителей', cover='n1', note='3D-визуализации проекта, не фото готового объекта',
       task='', area='', term='', address='',
       text='Дизайн-проекты кабинетов руководителей с переговорными и зонами отдыха у панорамных окон: кессонные потолки с подсветкой, панели и колонны в шпоне, встроенные витрины, аквариумы в мебельных стенках, мраморные столешницы.',
       done=['Планировка: рабочая зона, переговорная, зона отдыха', 'Кессонный потолок с LED-подсветкой по контуру', 'Стеновые панели и обшивка колонн шпоном', 'Встроенная мебель: витрины, медиастена, аквариум', 'Сценарии освещения', 'Подбор камня, текстиля и ковровых покрытий'],
       img=['n1', 'n3', 'n2', 'n4', 'n5', 'n6', 'd2', 'd1', 'd4', 'd5', 'd9', 'd7', 'd3', 'd10']),
]
CASE = {c['slug']: c for c in CASES}

# ---------------------------------------------------------------- общие куски
def head(title, desc, path, img='og', extra=''):
    pre = '../' * path.count('/')
    return pre, f'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#070708">
<link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website">
<meta property="og:locale" content="ru_RU">
<meta property="og:site_name" content="Группа компаний «Легион»">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{SITE}img/{img}.jpg">
<link rel="icon" href="{pre}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap">
<link rel="stylesheet" href="{pre}assets/g.css?v={V}">
<script>document.documentElement.classList.add('js');window.BASE="{pre}"</script>
{extra}</head>
<body>
'''

def header(pre, cur=''):
    dd = ''.join(f'<a href="{pre}{d["slug"]}/">{e(d["short"])}</a>' for d in DIRS)
    mdirs = ''.join(f'<a href="{pre}{d["slug"]}/">{e(d["short"])}</a>' for d in DIRS)
    ac = lambda k: ' aria-current="page"' if cur == k else ''
    return f'''<header class="top" id="top">
  <div class="wrap">
    <a class="brand" href="{pre}" aria-label="Группа компаний «Легион» — на главную"><b>ЛЕГИОН</b><small>группа компаний</small></a>
    <nav class="nav" aria-label="Основное меню">
      <div class="dd"><button type="button" aria-haspopup="true">Направления</button><div class="dd-menu">{dd}</div></div>
      <a href="{pre}proekty/"{ac('proekty')}>Проекты</a>
      <a href="{pre}o-gruppe/"{ac('o-gruppe')}>О группе</a>
      <a href="{pre}partners/"{ac('partners')}>Дизайн-студиям</a>
      <a href="{pre}kontakty/"{ac('kontakty')}>Контакты</a>
    </nav>
    <a class="tel" href="tel:{PHONE_RAW}">{PHONE}</a>
    <a class="btn sm head-cta" href="#zayavka">Обсудить объект</a>
    <button class="burger" id="burger" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="mnav"><span></span></button>
  </div>
</header>
<nav class="mnav" id="mnav" aria-label="Меню">
  <small>Направления</small>{mdirs}
  <small>Компания</small><a href="{pre}proekty/">Проекты</a><a href="{pre}o-gruppe/">О группе</a><a href="{pre}partners/">Дизайн-студиям</a><a href="{pre}kontakty/">Контакты</a>
  <a class="btn gold" href="tel:{PHONE_RAW}">{PHONE}</a>
</nav>
'''

def form(page, dir_default=''):
    opts = ''.join(f'<option{" selected" if d["short"] == dir_default else ""}>{e(d["short"])}</option>' for d in DIRS) + '<option>Под ключ: всё вместе</option><option>Другое</option>'
    return f'''<section class="contact" id="zayavka">
  <div class="wrap">
    <div class="sec-head">
      <div><span class="kicker rv">Заявка</span><h2 class="display rv d1">Обсудим <em>ваш объект</em></h2></div>
      <p class="lead rv d2">Пришлите задачу, проект, ТЗ, ведомость объёмов или просто фото помещения. Подъедем на осмотр, посчитаем смету и предложим сроки.</p>
    </div>
    <div class="c-grid">
      <div class="rv">
        <div class="person"><small>Руководитель</small><b>Артём Беляев</b></div>
        <a class="phone g" href="tel:{PHONE_RAW}">{PHONE}</a>
        <div class="msg">
          <a class="btn gold" href="{TG}" target="_blank" rel="noopener">Telegram</a>
          <button class="btn" type="button" data-max>Max</button>
          <a class="btn" href="tel:{PHONE_RAW}">Позвонить</a>
        </div>
        <p class="note" aria-live="polite"></p>
        <dl class="req">
          <dt>Группа</dt><dd>{'<br>'.join(e(g) for g in GROUP)}</dd>
          <dt>География</dt><dd>Москва и Московская область</dd>
          <dt>Условия</dt><dd>Договор, безналичный расчёт. Оформляем через ООО или ИП</dd>
        </dl>
      </div>
      <form class="lead-form rv d1" novalidate data-page="{e(page)}">
        <div class="f"><label for="fName-{page}">Имя</label><input id="fName-{page}" name="name" autocomplete="name" placeholder="Как к вам обращаться"></div>
        <div class="f"><label for="fPhone-{page}">Телефон</label><input id="fPhone-{page}" name="phone" type="tel" autocomplete="tel" placeholder="+7" required></div>
        <div class="f"><label for="fDir-{page}">Направление</label><select id="fDir-{page}" name="dir">{opts}</select></div>
        <div class="f"><label for="fArea">Площадь, м²</label><input id="fArea" name="area" inputmode="numeric" placeholder="например, 300"></div>
        <div class="f full"><label for="fMsg">Задача</label><textarea id="fMsg" name="msg" placeholder="Адрес или район, что нужно сделать, сроки, есть ли проект"></textarea></div>
        <div class="f full"><span class="lab">Фото и документация</span>
          <label class="file"><input type="file" name="files" multiple accept="image/*,.pdf,.dwg,.dxf,.xls,.xlsx,.doc,.docx,.zip"><b>Прикрепить файлы</b><span>Фото помещения, проект, ТЗ или ведомость объёмов</span></label>
          <ul class="files"></ul></div>
        <button class="btn gold" type="submit">Отправить заявку в Telegram <span class="ar">→</span></button>
        <p class="fine">Заявка соберётся в сообщение и откроется чат с Артёмом в Telegram. Выбранные файлы прикрепите в этом чате.</p>
        <p class="out" hidden aria-live="polite"></p>
      </form>
    </div>
  </div>
</section>
'''

def footer(pre):
    dirs = ''.join(f'<li><a href="{pre}{d["slug"]}/">{e(d["short"])}</a></li>' for d in DIRS)
    grp = ''.join(f'<li>{e(g)}</li>' for g in GROUP)
    return f'''<footer>
  <div class="wrap foot">
    <div><a class="brand" href="{pre}"><b>ЛЕГИОН</b><small>группа компаний</small></a><p>Строительство, отделка, инженерные системы, дизайн и мебель на заказ. Москва и Московская область.</p></div>
    <div><h4>Направления</h4><ul>{dirs}</ul></div>
    <div><h4>Группа</h4><ul>{grp}</ul></div>
    <div><h4>Связь</h4><ul><li><a href="tel:{PHONE_RAW}">{PHONE}</a></li><li><a href="{TG}" target="_blank" rel="noopener">Telegram</a></li><li><a href="{pre}proekty/">Проекты</a></li><li><a href="{pre}partners/">Дизайн-студиям</a></li></ul></div>
  </div>
  <div class="wrap copy-row"><span>© Группа компаний «Легион»</span><span>Работаем по договору · безналичный расчёт</span></div>
</footer>
<div class="fab" id="fab">
  <a class="tg" href="{TG}" target="_blank" rel="noopener" aria-label="Написать в Telegram"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.2 13 1.4 11.5c-1-.3-1-1 .2-1.5L20.5 2.8c.9-.3 1.6.2 1.4 1.5Z"/></svg></a>
  <a href="tel:{PHONE_RAW}" aria-label="Позвонить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg></a>
</div>
<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Просмотр фото">
  <img id="lbImg" alt="">
  <button class="x" id="lbX" type="button" aria-label="Закрыть">✕</button>
  <button class="pv" id="lbP" type="button" aria-label="Предыдущее фото">←</button>
  <button class="nx" id="lbN" type="button" aria-label="Следующее фото">→</button>
  <div class="cap" id="lbCap"></div>
</div>
<script src="{pre}assets/site-data.js?v={V}"></script>
<script src="{pre}assets/g.js?v={V}"></script>
'''

ORG = {"@context": "https://schema.org", "@type": "Organization", "name": "Группа компаний «Легион»", "url": SITE, "telephone": "+7-999-440-75-27",
       "logo": SITE + "favicon.svg", "image": SITE + "img/og.jpg", "areaServed": ["Москва", "Московская область"],
       "subOrganization": [{"@type": "Organization", "name": g} for g in GROUP[:4]],
       "member": [{"@type": "Person", "name": "Беляев Артём Алексеевич", "jobTitle": "Индивидуальный предприниматель"}],
       "knowsAbout": [d['short'] for d in DIRS]}

def ld(obj): return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False) + '</script>\n'
def crumbs(pre, items):
    lis = f'<li><a href="{pre}">Главная</a></li>' + ''.join(f'<li><a href="{pre}{u}">{e(n)}</a></li>' if u else f'<li aria-current="page">{e(n)}</li>' for n, u in items)
    data = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Главная", "item": SITE}] +
            [{"@type": "ListItem", "position": i + 2, "name": n, **({"item": SITE + u} if u else {})} for i, (n, u) in enumerate(items)]}
    return f'<ol class="crumbs">{lis}</ol>', ld(data)

def page(path, html_):
    full = R + path + ('index.html' if path.endswith('/') or path == '' else '')
    os.makedirs(os.path.dirname(full) or R, exist_ok=True)
    open(full, 'w').write(html_)

def gallery(imgs, gal, alt, pre, cls='mosaic'):
    return f'<div class="{cls}">' + ''.join(f'<button type="button" class="rv" data-gal="{gal}" aria-label="Открыть фото {k + 1}"><img src="{pre}img/{f}.jpg" alt="{e(alt)}, фото {k + 1}" loading="lazy"></button>' for k, f in enumerate(imgs)) + '</div>'

def case_cards(pre, slugs):
    return '<div class="cases">' + ''.join(f'<a class="case-card rv" href="{pre}proekty/#{c}"><img src="{pre}img/{CASE[c]["cover"]}.jpg" alt="{e(CASE[c]["name"])}" loading="lazy"><span class="t">{e(CASE[c]["t"])}</span><h3>{e(CASE[c]["name"])}</h3></a>' for c in slugs) + '</div>'

STEPS = [('День 1', 'Задача', 'Звонок или заявка. Присылаете ТЗ, проект, ведомость объёмов или фото помещения.'),
         ('1–3 дня', 'Осмотр и смета', 'Выезжаем на объект, делаем замеры, считаем смету и сроки.'),
         ('Договор', 'Условия', 'Фиксируем стоимость, график и порядок оплаты. ООО или ИП, безнал.'),
         ('Работы', 'Объект', 'Свои бригады и производство. Фотоотчёты, акты по каждому этапу.'),
         ('Сдача', 'Результат', 'Приёмка, исполнительная документация, гарантийные обязательства.')]
def steps():
    return '<ol class="steps">' + ''.join(f'<li><span class="k">{e(a)}</span><b>{e(b)}</b><span>{e(c)}</span></li>' for a, b, c in STEPS) + '</ol>'

FAQ = [('С какими объектами вы работаете?', 'Офисы и кабинеты руководителей, коммерческие и административные здания, рестораны, медицинские помещения, квартиры и дома. Москва и Московская область.'),
       ('Можно заказать только часть работ?', 'Да. Берём отдельные направления (например, только мебель или только полы) или весь объект под ключ: от конструктива до расстановки мебели.'),
       ('Как считается стоимость?', 'По проекту, ТЗ или ведомости объёмов. Если документов нет, приезжаем на осмотр и делаем замеры. Итоговую стоимость и сроки фиксируем в договоре.'),
       ('Зачем группа компаний, а не одна фирма?', 'В группу входят четыре ООО и ИП. Договор заключаем от того лица, которое подходит заказчику по виду работ и форме расчётов. Управление и ответственность при этом общие.'),
       ('Вы делаете мебель сами?', 'Да, у нас собственное производство мебели и свои поставщики материалов. Поэтому отделку и мебель можно заказать в одной смете и с одним сроком.')]
def faq():
    return '<div class="faq rv">' + ''.join(f'<details{" open" if i == 0 else ""}><summary>{e(q)}<i></i></summary><p>{e(a)}</p></details>' for i, (q, a) in enumerate(FAQ)) + '</div>'

STRIP = ''.join(f'<span>{e(d["short"])}</span>' for d in DIRS) * 2

# ---------------------------------------------------------------- главная
def build_home():
    pre, h = head('Группа компаний «Легион» — строительство, отделка, инженерия и мебель на заказ', 'Группа компаний «Легион»: строительство и реконструкция, ремонт и отделка, инженерные системы, дизайн интерьеров и мебель на заказ под ключ. Москва и Московская область.', '',
                  extra='<link rel="preload" as="image" href="img/hero-group.jpg">\n' + ld(ORG))
    cards = ''.join(f'''<a class="dir rv{' wide' if d.get('wide') else ''}" href="{d['slug']}/"><img src="img/{d['card']}.jpg" alt="{e(d['short'])}" loading="lazy"><span class="no">{d['no']}</span><h3>{e(d['short'])}</h3><p>{e(d['teaser'])}</p><span class="more">Подробнее</span></a>''' for d in DIRS)
    co = ''.join(f'<li><span class="n">0{i + 1}</span><b>{e(g)}</b><span class="t">{"Индивидуальный предприниматель" if g.startswith("ИП") else "Общество с ограниченной ответственностью"}</span></li>' for i, g in enumerate(GROUP))
    hd = ''.join(f'<a href="{d["slug"]}/">{e(d["nav"])}</a>' for d in DIRS)
    body = header('') + f'''<main>
<section class="hero" id="hero">
  <div class="hero-bg"><img src="img/hero-group.jpg" alt="" aria-hidden="true"><canvas id="heroGL" aria-hidden="true"></canvas></div>
  <div class="wrap">
    <span class="kicker">Группа компаний · Москва и МО</span>
    <h1 class="display">Строим, отделываем <em>и обставляем</em> под ключ</h1>
    <p class="lead">Пять компаний под одним управлением: строительство и реконструкция, вся внутренняя отделка, инженерные системы, дизайн и мебель на заказ. Один договор на весь объект.</p>
    <div class="cta"><a class="btn gold" href="#zayavka">Обсудить объект <span class="ar">→</span></a><a class="btn" href="#calc">Рассчитать стоимость</a></div>
    <nav class="hero-dirs" aria-label="Направления">{hd}</nav>
  </div>
  <div class="scroll-cue" aria-hidden="true"><span>Листайте</span><i></i></div>
</section>
<div class="strip" aria-hidden="true"><div class="strip-in">{STRIP}</div></div>

<section id="napravleniya">
  <div class="wrap">
    <div class="sec-head">
      <div><span class="kicker rv">Что мы делаем</span><h2 class="display rv d1">Шесть направлений, <em>один подрядчик</em></h2></div>
      <p class="lead rv d2">Можно заказать одно направление или собрать объект целиком: от усиления стен до последнего стеллажа. Тогда отделка, инженерия и мебель с самого начала проектируются вместе.</p>
    </div>
    <div class="dirs">{cards}</div>
  </div>
</section>

<section class="group" id="gruppa">
  <div class="wrap split">
    <div>
      <span class="kicker rv">Группа компаний</span>
      <h2 class="display rv d1" style="margin-top:18px">Пять юрлиц. <em>Одна ответственность.</em></h2>
      <p class="lead rv d2" style="margin-top:24px">Договор заключаем от той компании группы, которая подходит под вид работ и форму расчётов заказчика. Объект при этом ведёт одна команда, по одной смете и одному графику.</p>
      <div class="cta rv d3" style="margin-top:30px"><a class="btn" href="o-gruppe/">О группе <span class="ar">→</span></a></div>
    </div>
    <ul class="co-list">{co}</ul>
  </div>
</section>

<section id="pochemu">
  <div class="wrap">
    <div class="sec-head">
      <div><span class="kicker rv">Почему с нами проще</span><h2 class="display rv d1">Ответы на вопросы, <em>которые</em> задают заказчики</h2></div>
    </div>
    <div class="facts">
      <div class="rv"><span class="q">Кто отвечает за результат?</span><h3>Одна команда на весь объект</h3><p>Не нужно стыковать строителей, отделочников, инженеров и мебельщиков. Все работы в одном договоре.</p></div>
      <div class="rv d1"><span class="q">Совпадёт ли с проектом?</span><h3>Работаем строго по проекту</h3><p>Узлы и материалы согласуем до начала работ. Замены только письменно и с согласия заказчика.</p></div>
      <div class="rv d2"><span class="q">Откуда мебель?</span><h3>Собственное производство</h3><p>Кабинеты, шкафы, стеллажи и ресепшен делаем сами, под размеры помещения и в тон отделки.</p></div>
      <div class="rv"><span class="q">Откуда материалы?</span><h3>Свои поставщики</h3><p>Работаем напрямую с производителями материалов и мебели. Контролируем сроки поставок и цену.</p></div>
      <div class="rv d1"><span class="q">Как оформляем?</span><h3>Договор и безнал</h3><p>ООО или ИП, как удобнее заказчику. Акты по каждому этапу, смета по ведомости объёмов.</p></div>
      <div class="rv d2"><span class="q">Как быстро начнёте?</span><h3>Выезд в ближайшие дни</h3><p>Осмотр, замеры и смета за 1–3 дня после обращения, старт работ сразу после договора.</p></div>
    </div>
  </div>
</section>

<section id="etapy" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="kicker rv">Как мы работаем</span><h2 class="display rv d1">От звонка <em>до сдачи</em></h2></div></div>
    {steps()}
  </div>
</section>

<section id="calc-sec">
  <div class="wrap">
    <div class="sec-head">
      <div><span class="kicker rv">Калькулятор</span><h2 class="display rv d1">Сколько <em>это стоит</em></h2></div>
      <p class="lead rv d2">Ориентир по стоимости работ и срокам. Точную смету считаем после осмотра или по ведомости объёмов.</p>
    </div>
    <div class="calc rv" id="calc">
      <div class="calc-in">
        <div><span class="cl">Тип объекта</span><div class="chips" id="cType"></div></div>
        <div><span class="cl">Площадь</span><div class="area"><input type="range" id="cArea" min="50" max="3000" step="10" value="300" aria-label="Площадь, м²"><label class="num"><input type="number" id="cAreaNum" min="20" max="20000" value="300" aria-label="Площадь в м²"><span>м²</span></label></div></div>
        <div><span class="cl">Уровень отделки</span><div class="levels" id="cLevel"></div></div>
        <label class="sw"><input type="checkbox" id="cMat"><span class="tr"></span><span>Посчитать вместе с материалами</span></label>
      </div>
      <div class="calc-out">
        <span class="cl">Ориентир по стоимости</span>
        <div class="sum"><span id="cMin" class="g">0</span><i>–</i><span id="cMax" class="g">0</span><small>₽</small></div>
        <div class="kv"><div><span>За м²</span><b id="cM2">—</b></div><div><span>Срок работ</span><b id="cTerm">—</b></div></div>
        <a class="btn gold" href="#zayavka" id="cSend">Получить точную смету <span class="ar">→</span></a>
        <p class="fine">Цена ориентировочная, не оферта. Мебель на заказ и инженерные системы считаются отдельно по проекту.</p>
      </div>
    </div>
  </div>
</section>

<section id="proekty" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head">
      <div><span class="kicker rv">Проекты</span><h2 class="display rv d1">Что мы <em>уже сделали</em></h2></div>
      <p class="lead rv d2">Офис в историческом здании, ресторан, административное здание и дизайн-проекты кабинетов. Каждый объект разобран как кейс: что сделали и как.</p>
    </div>
    {case_cards('', ['office', 'restaurant', 'admin', 'design'])}
    <div class="cta rv" style="margin-top:32px"><a class="btn" href="proekty/">Все проекты <span class="ar">→</span></a></div>
  </div>
</section>

<section id="voprosy" style="padding-top:0">
  <div class="wrap split">
    <div><span class="kicker rv">Вопросы</span><h2 class="display rv d1" style="margin-top:18px">Коротко <em>о главном</em></h2>
      <p class="lead rv d2" style="margin-top:22px">Работаете с дизайн-студией или сами дизайнер? У нас есть <a href="partners/" style="color:var(--gold2)">партнёрская программа</a>.</p></div>
    {faq()}
  </div>
</section>
{form('главная')}
</main>
''' + footer('') + '<script type="importmap">{"imports":{"three":"./assets/vendor/three/build/three.module.min.js"}}</script>\n<script type="module" src="assets/hero-gold.js?v=' + V + '"></script>\n</body>\n</html>\n'
    page('', h + body)

# ---------------------------------------------------------------- направления
def build_dirs():
    for i, d in enumerate(DIRS):
        path = d['slug'] + '/'
        cr, crld = crumbs('../', [(d['short'], '')])
        svc = {"@context": "https://schema.org", "@type": "Service", "name": d['short'], "description": d['desc'], "areaServed": ["Москва", "Московская область"], "provider": {"@type": "Organization", "name": "Группа компаний «Легион»", "url": SITE}}
        pre, h = head(d['title'], d['desc'], path, img=d['img'], extra=crld + ld(svc))
        scope = ''.join(f'<div class="rv{" d" + str(k) if k else ""}"><h3>{e(t)}</h3><ul>{"".join(f"<li>{e(x)}</li>" for x in items)}</ul></div>' for k, (t, items) in enumerate(d['scope']))
        ans = ''.join(f'<div class="rv"><b>{e(a)}</b><p>{e(b)}</p></div>' for a, b in d['answers'])
        other = [x for x in DIRS if x['slug'] != d['slug']]
        rel = ''.join(f'<a class="btn sm" href="../{x["slug"]}/">{e(x["short"])}</a>' for x in other)
        body = header(pre) + f'''<main>
<section class="page-hero">
  <img src="../img/{d['img']}.jpg" alt="{e(d['short'])}: пример работ" fetchpriority="high">
  <div class="wrap">
    <nav aria-label="Навигация">{cr}</nav>
    <span class="kicker">{d['no']} · Направление</span>
    <h1 class="display">{d['h1']}</h1>
    <p class="lead">{e(d['lead'])}</p>
    <div class="cta"><a class="btn gold" href="#zayavka">Обсудить объект <span class="ar">→</span></a><a class="btn" href="../#calc">Рассчитать стоимость</a></div>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="sec-head"><div><span class="kicker rv">Состав работ</span><h2 class="display rv d1">Что входит <em>в направление</em></h2></div><p class="lead rv d2">Берём отдельные виды работ или всё направление целиком. Объём и стоимость фиксируем в договоре.</p></div>
    <div class="scope">{scope}</div>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    <div class="answers">{ans}</div>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="kicker rv">Фото</span><h2 class="display rv d1">Как это <em>выглядит</em></h2></div></div>
    {gallery(d['gallery'], d['slug'], d['short'], pre)}
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="kicker rv">Проекты</span><h2 class="display rv d1">Объекты <em>по направлению</em></h2></div></div>
    {case_cards(pre, d['cases'])}
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="kicker rv">Порядок работы</span><h2 class="display rv d1">Как будем <em>работать</em></h2></div></div>
    {steps()}
    <div style="margin-top:64px"><span class="kicker rv">Другие направления</span><div class="related rv" style="margin-top:20px">{rel}</div></div>
  </div>
</section>
{form(d['short'], d['short'])}
</main>
''' + footer(pre) + '</body>\n</html>\n'
        page(path, h + body)

# ---------------------------------------------------------------- проекты
def build_projects():
    path = 'proekty/'
    cr, crld = crumbs('../', [('Проекты', '')])
    pre, h = head('Реализованные проекты группы компаний «Легион»', 'Кейсы: офис в историческом здании, ресторан грузинской кухни, административное здание и дизайн-проекты кабинетов руководителей. Фото, состав работ, до и после.', path, img='7919', extra=crld)
    secs = ''
    for c in CASES:
        meta = [('Объект', c['t'])] + [(k, c[f]) for k, f in [('Задача', 'task'), ('Площадь', 'area'), ('Срок', 'term'), ('Адрес', 'address')] if c.get(f)]
        meta_html = ''.join(f'<dt>{e(a)}</dt><dd>{e(b)}</dd>' for a, b in meta)
        note = f'<span class="tag-note">{e(c["note"])}</span>' if c.get('note') else ''
        ba = ''
        if c.get('ba'):
            b0, b1 = c['ba']
            ba = f'''<div class="split" style="margin-top:56px;align-items:center"><div><span class="kicker rv">До и после</span><h3 class="rv d1" style="margin-top:16px;font-size:34px">Сначала то, что потом скроет потолок</h3><p class="muted rv d2" style="margin-top:14px">Один коридор: кабельные лотки и подвесная система до закрытия, затем готовая отделка. Потяните ползунок.</p></div>
<div class="ba rv"><img src="../img/{b0}.jpg" alt="Коридор в процессе работ" loading="lazy"><img class="after" src="../img/{b1}.jpg" alt="Коридор после отделки" loading="lazy"><span class="l1">До</span><span class="l2">После</span><div class="bar"></div><div class="knob"></div><input type="range" min="0" max="100" value="50" aria-label="Сравнение до и после"></div></div>'''
        secs += f'''<article class="case" id="{c['slug']}">
  <div class="wrap">
    <div class="case-top">
      <div><span class="kicker rv">{e(c['t'])}</span><h2 class="display rv d1">{e(c['name'])}</h2>{note}<p class="lead rv d2" style="margin-top:22px">{e(c['text'])}</p></div>
      <div class="rv d1"><dl class="meta">{meta_html}</dl><ul class="done">{''.join(f"<li>{e(x)}</li>" for x in c['done'])}</ul></div>
    </div>
    {gallery(c['img'], c['slug'], c['name'], pre, 'gal')}
    {ba}
  </div>
</article>
'''
    nav = ''.join(f'<a class="btn sm" href="#{c["slug"]}">{e(c["name"])}</a>' for c in CASES)
    body = header(pre, 'proekty') + f'''<main>
<section class="page-hero" style="min-height:min(70svh,680px)">
  <img src="../img/7919.jpg" alt="Кабинет в историческом здании после отделки" fetchpriority="high">
  <div class="wrap">
    <nav aria-label="Навигация">{cr}</nav>
    <span class="kicker">Реализованные проекты</span>
    <h1 class="display">Объекты, <em>которые мы сдали</em></h1>
    <p class="lead">Реальные фото наших объектов и отдельно визуализации дизайн-проектов. Нажмите на фото, чтобы открыть галерею.</p>
    <div class="related" style="margin-top:28px">{nav}</div>
  </div>
</section>
{secs}
{form('проекты')}
</main>
''' + footer(pre) + '</body>\n</html>\n'
    page(path, h + body)

# ---------------------------------------------------------------- о группе
def build_about():
    path = 'o-gruppe/'
    cr, crld = crumbs('../', [('О группе', '')])
    pre, h = head('О группе компаний «Легион»: ГОЛТ, Стройтехнологии, Рубикон-ТИ, Артстрой69', 'Группа компаний «Легион»: ООО «ГОЛТ», ООО «Стройтехнологии», ООО «Рубикон-ТИ», ООО «Артстрой69», ИП Беляев А. А. Строительство, отделка, инженерия, дизайн и мебель.', path, img='n1', extra=crld + ld(ORG))
    co = ''.join(f'<li><span class="n">0{i + 1}</span><b>{e(g)}</b><span class="t">{"ИП" if g.startswith("ИП") else "ООО"}</span></li>' for i, g in enumerate(GROUP))
    body = header(pre, 'o-gruppe') + f'''<main>
<section class="page-hero" style="min-height:min(76svh,720px)">
  <img src="../img/n1.jpg" alt="Дизайн-проект кабинета руководителя" fetchpriority="high">
  <div class="wrap">
    <nav aria-label="Навигация">{cr}</nav>
    <span class="kicker">О группе</span>
    <h1 class="display">Группа компаний <em>«Легион»</em></h1>
    <p class="lead">Строительство, отделка, инженерные системы, дизайн интерьеров и собственное мебельное производство. Москва и Московская область.</p>
  </div>
</section>
<section class="group">
  <div class="wrap split">
    <div><span class="kicker rv">Состав группы</span><h2 class="display rv d1" style="margin-top:18px">Пять компаний, <em>один подход</em></h2>
      <p class="lead rv d2" style="margin-top:24px">Договор заключаем от той компании группы, которая подходит под вид работ и форму расчётов заказчика. Реквизиты нужной компании пришлём по запросу.</p></div>
    <ul class="co-list">{co}</ul>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="kicker rv">Принципы</span><h2 class="display rv d1">На чём <em>держится</em> работа</h2></div></div>
    <div class="answers">
      <div class="rv"><b>Работаем по проекту</b><p>Узлы, материалы и раскладку согласуем с заказчиком и автором проекта до начала работ. Замены только письменно.</p></div>
      <div class="rv"><b>Свои бригады и производство</b><p>Большая собственная команда и мебельное производство. Не перепродаём объект субподрядчикам по цепочке.</p></div>
      <div class="rv"><b>Прозрачная смета</b><p>Считаем по ведомости объёмов, фиксируем стоимость в договоре, закрываем этапы актами.</p></div>
      <div class="rv"><b>Скрытые работы на виду</b><p>Инженерию и черновые слои фотографируем до закрытия. Заказчик видит то, что потом спрячет отделка.</p></div>
    </div>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="kicker rv">Направления</span><h2 class="display rv d1">Чем <em>занимаемся</em></h2></div></div>
    <div class="related rv">{''.join(f'<a class="btn" href="../{d["slug"]}/">{e(d["short"])}</a>' for d in DIRS)}</div>
  </div>
</section>
{form('о группе')}
</main>
''' + footer(pre) + '</body>\n</html>\n'
    page(path, h + body)

# ---------------------------------------------------------------- контакты
def build_contacts():
    path = 'kontakty/'
    cr, crld = crumbs('../', [('Контакты', '')])
    lb = {"@context": "https://schema.org", "@type": "GeneralContractor", "name": "Группа компаний «Легион»", "telephone": "+7-999-440-75-27", "url": SITE, "image": SITE + "img/og.jpg", "areaServed": ["Москва", "Московская область"], "address": {"@type": "PostalAddress", "addressLocality": "Москва", "addressCountry": "RU"}}
    pre, h = head('Контакты группы компаний «Легион»', 'Телефон 8 999 440-75-27, Telegram и Max. Москва и Московская область, работа по договору, безналичный расчёт.', path, extra=crld + ld(lb))
    body = header(pre, 'kontakty') + f'''<main>
<section style="padding-bottom:0;padding-top:150px">
  <div class="wrap"><nav aria-label="Навигация">{cr}</nav><span class="kicker">Контакты</span><h1 class="display" style="margin-top:20px">Свяжитесь <em>с нами</em></h1></div>
</section>
{form('контакты')}
</main>
''' + footer(pre) + '</body>\n</html>\n'
    page(path, h + body)

# ---------------------------------------------------------------- дизайн-студиям
def build_partners():
    path = 'partners/'
    cr, crld = crumbs('../', [('Дизайн-студиям', '')])
    pre, h = head('Партнёрская программа для дизайн-студий — группа компаний «Легион»', 'Реализуем дизайн-проекты строго по проекту: отделка, инженерия, мебель на заказ. Студии получают 10% от нашей прибыли по объекту.', path, img='n3', extra=crld)
    body = header(pre, 'partners') + f'''<main>
<section class="page-hero">
  <img src="../img/n3.jpg" alt="Дизайн-проект переговорной" fetchpriority="high">
  <div class="wrap">
    <nav aria-label="Навигация">{cr}</nav>
    <span class="kicker">Дизайн-студиям и архитектурным бюро</span>
    <h1 class="display">Ваш проект. <em>Наша реализация.</em> 10% вам.</h1>
    <p class="lead">Рекомендуете нас заказчику, мы реализуем проект без отступлений: отделка, инженерия и мебель на заказ. Студии выплачиваем 10% от нашей прибыли по объекту.</p>
    <div class="cta"><a class="btn gold" href="#zayavka">Стать партнёром <span class="ar">→</span></a><a class="btn" href="{TG}" target="_blank" rel="noopener">Написать в Telegram</a></div>
  </div>
</section>
<section>
  <div class="wrap">
    <div class="sec-head"><div><span class="kicker rv">Как это работает</span><h2 class="display rv d1"><em>10%</em> от прибыли по объекту</h2></div><p class="lead rv d2">Выплата в течение 10 рабочих дней после окончательного расчёта с заказчиком, с отчётом по расчёту.</p></div>
    <ol class="steps">
      <li><span class="k">Шаг 1</span><b>Рекомендация</b><span>Рекомендуете нас заказчику и сообщаете нам об объекте.</span></li>
      <li><span class="k">Шаг 2</span><b>Договор</b><span>Заключаем договор на работы напрямую с заказчиком.</span></li>
      <li><span class="k">Шаг 3</span><b>Реализация</b><span>На связи с вами, согласуем каждый узел и замену.</span></li>
      <li><span class="k">Шаг 4</span><b>Расчёт</b><span>После оплаты считаем прибыль по объекту.</span></li>
      <li><span class="k">Шаг 5</span><b>Выплата 10%</b><span>В течение 10 рабочих дней с отчётом.</span></li>
    </ol>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap">
    <div class="answers">
      <div class="rv"><b>Реализация без отступлений</b><p>Узлы и материалы согласуем с автором проекта до начала работ, замены только письменно.</p></div>
      <div class="rv"><b>Мебель тоже наша</b><p>Собственное производство: мебель по чертежам дизайнера, в тон отделки и в одном графике с ней.</p></div>
      <div class="rv"><b>Фотоотчёты</b><p>Присылаем отчёты по этапам и зовём на ключевые приёмки.</p></div>
      <div class="rv"><b>Любой масштаб</b><p>Кабинет, офис, ресторан, административное здание. Отдельные работы или весь объект.</p></div>
    </div>
  </div>
</section>
<section style="padding-top:0">
  <div class="wrap"><div class="sec-head"><div><span class="kicker rv">Проекты</span><h2 class="display rv d1">Что мы <em>реализовали</em></h2></div></div>{case_cards(pre, ['design', 'office', 'restaurant', 'admin'])}</div>
</section>
{form('дизайн-студиям')}
</main>
''' + footer(pre) + '</body>\n</html>\n'
    page(path, h + body)

def build_meta():
    urls = [''] + [d['slug'] + '/' for d in DIRS] + ['proekty/', 'o-gruppe/', 'kontakty/', 'partners/']
    today = datetime.date.today().isoformat()
    open(R + 'sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{today}</lastmod></url>\n' for u in urls) + '</urlset>\n')
    open(R + 'robots.txt', 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}sitemap.xml\n')
    nf = head('Страница не найдена — группа компаний «Легион»', 'Такой страницы нет.', '404.html')[1].replace('href="favicon', 'href="/Legion/favicon').replace('href="assets', 'href="/Legion/assets').replace('window.BASE=""', 'window.BASE="/Legion/"')
    open(R + '404.html', 'w').write(nf + header('/Legion/') + '<main><section style="padding-top:180px;min-height:70vh"><div class="wrap"><span class="kicker">404</span><h1 class="display" style="margin-top:20px">Такой страницы <em>нет</em></h1><div class="cta" style="margin-top:30px"><a class="btn gold" href="/Legion/">На главную</a></div></div></section></main>' + footer('/Legion/') + '</body></html>')

build_home(); build_dirs(); build_projects(); build_about(); build_contacts(); build_partners(); build_meta()
print('ok', V)
