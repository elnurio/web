const KNOWLEDGE_GRAPH = {
  nodes: [
    { id: 'cosmos',        label: 'Космос',          category: 'science',     weight: 5, color: '#4fc3f7' },
    { id: 'gravity',       label: 'Гравитация',      category: 'physics',     weight: 4, color: '#81d4fa' },
    { id: 'blackhole',     label: 'Чёрные дыры',     category: 'physics',     weight: 4, color: '#9c6fff' },
    { id: 'consciousness', label: 'Сознание',         category: 'mind',        weight: 5, color: '#f48fb1' },
    { id: 'quantum',       label: 'Квантовый мир',   category: 'physics',     weight: 4, color: '#80cbc4' },
    { id: 'time',          label: 'Время',            category: 'philosophy',  weight: 5, color: '#ffe082' },
    { id: 'life',          label: 'Жизнь',            category: 'biology',     weight: 5, color: '#a5d6a7' },
    { id: 'dna',           label: 'ДНК',              category: 'biology',     weight: 3, color: '#69f0ae' },
    { id: 'evolution',     label: 'Эволюция',         category: 'biology',     weight: 4, color: '#c8e6c9' },
    { id: 'language',      label: 'Язык',             category: 'mind',        weight: 4, color: '#ff80ab' },
    { id: 'mathematics',   label: 'Математика',      category: 'science',     weight: 5, color: '#ce93d8' },
    { id: 'infinity',      label: 'Бесконечность',   category: 'philosophy',  weight: 3, color: '#b39ddb' },
    { id: 'dreams',        label: 'Сны',              category: 'mind',        weight: 3, color: '#9fa8da' },
    { id: 'ocean',         label: 'Океан',            category: 'nature',      weight: 4, color: '#29b6f6' },
    { id: 'entropy',       label: 'Энтропия',         category: 'physics',     weight: 3, color: '#ff8a65' },
    { id: 'music',         label: 'Музыка',           category: 'art',         weight: 4, color: '#ffa726' },
    { id: 'memory',        label: 'Память',           category: 'mind',        weight: 4, color: '#f48fb1' },
    { id: 'light',         label: 'Свет',             category: 'physics',     weight: 4, color: '#fff59d' },
    { id: 'stars',         label: 'Звёзды',           category: 'science',     weight: 4, color: '#fffde7' },
    { id: 'brain',         label: 'Мозг',             category: 'biology',     weight: 5, color: '#ff8a65' },
  ],

  links: [
    { source: 'cosmos',        target: 'stars' },
    { source: 'cosmos',        target: 'gravity' },
    { source: 'cosmos',        target: 'time' },
    { source: 'gravity',       target: 'blackhole' },
    { source: 'gravity',       target: 'quantum' },
    { source: 'blackhole',     target: 'time' },
    { source: 'blackhole',     target: 'entropy' },
    { source: 'quantum',       target: 'light' },
    { source: 'quantum',       target: 'mathematics' },
    { source: 'quantum',       target: 'consciousness' },
    { source: 'consciousness', target: 'brain' },
    { source: 'consciousness', target: 'dreams' },
    { source: 'consciousness', target: 'memory' },
    { source: 'consciousness', target: 'language' },
    { source: 'brain',         target: 'memory' },
    { source: 'brain',         target: 'language' },
    { source: 'brain',         target: 'music' },
    { source: 'life',          target: 'dna' },
    { source: 'life',          target: 'evolution' },
    { source: 'life',          target: 'ocean' },
    { source: 'evolution',     target: 'brain' },
    { source: 'evolution',     target: 'consciousness' },
    { source: 'dna',           target: 'mathematics' },
    { source: 'mathematics',   target: 'music' },
    { source: 'mathematics',   target: 'infinity' },
    { source: 'infinity',      target: 'time' },
    { source: 'stars',         target: 'light' },
    { source: 'ocean',         target: 'entropy' },
    { source: 'language',      target: 'music' },
    { source: 'dreams',        target: 'memory' },
    { source: 'time',          target: 'entropy' },
    { source: 'light',         target: 'cosmos' },
  ]
};

const MOCK_RESPONSES = [
  {
    keywords: ['чёрн', 'дыр', 'black'],
    targetNode: 'blackhole',
    trail: ['cosmos', 'gravity', 'blackhole'],
    title: 'Чёрные дыры',
    thinking: ['Кривизна пространства...', 'Горизонт событий...', 'Время замирает...', 'Сингулярность...'],
    content: 'Чёрная дыра — область пространства-времени с настолько мощным гравитационным полем, что даже свет не может её покинуть. На горизонте событий время для внешнего наблюдателя замирает. Внутри скрывается сингулярность — точка бесконечной плотности, где законы физики перестают работать. Стивен Хокинг показал, что они всё же медленно излучают — «испарение Хокинга».',
    images: [
      { url: 'https://picsum.photos/seed/blackhole1/600/375', caption: 'Горизонт событий' },
      { url: 'https://picsum.photos/seed/cosmos42/600/375', caption: 'Аккреционный диск' },
    ],
    relatedNodes: ['gravity', 'time', 'entropy', 'quantum']
  },
  {
    keywords: ['сознан', 'разум', 'мышлен', 'я', 'опыт'],
    targetNode: 'consciousness',
    trail: ['brain', 'memory', 'consciousness'],
    title: 'Сознание',
    thinking: ['Субъективный опыт...', 'Квалиа...', '86 млрд нейронов...', 'Кто смотрит?'],
    content: 'Сознание — одна из величайших загадок науки. Это субъективное переживание «я есть», которое невозможно объяснить только через нейронные процессы. Философы называют это «трудной проблемой сознания». Одни считают его продуктом работы мозга, другие — фундаментальным свойством вселенной, как пространство или время.',
    images: [
      { url: 'https://picsum.photos/seed/mind11/600/375', caption: 'Нейронная активность' },
      { url: 'https://picsum.photos/seed/brain77/600/375', caption: 'Квалиа — субъективное «красное»' },
    ],
    relatedNodes: ['brain', 'quantum', 'dreams', 'language', 'memory']
  },
  {
    keywords: ['врем', 'time', 'будущ', 'прошл', 'настоящ'],
    targetNode: 'time',
    trail: ['cosmos', 'blackhole', 'time'],
    title: 'Время',
    thinking: ['Стрела времени...', 'Энтропия растёт...', 'Относительность...', 'Прошлое реально?'],
    content: 'Время — самое загадочное измерение реальности. По Эйнштейну, оно гибкое: вблизи массивных объектов течёт медленнее. По термодинамике — необратимо, потому что энтропия всегда растёт. Но в уравнениях квантовой механики нет принципиальной разницы между прошлым и будущим.',
    images: [
      { url: 'https://picsum.photos/seed/time99/600/375', caption: 'Искривление пространства-времени' },
      { url: 'https://picsum.photos/seed/clock88/600/375', caption: 'Замедление времени у чёрных дыр' },
    ],
    relatedNodes: ['blackhole', 'entropy', 'quantum', 'infinity']
  },
  {
    keywords: ['кванто', 'квант', 'quantum', 'частиц'],
    targetNode: 'quantum',
    trail: ['mathematics', 'light', 'quantum'],
    title: 'Квантовый мир',
    thinking: ['Суперпозиция...', 'Запутанность...', 'Неопределённость Гейзенберга...', 'Коллапс волны...'],
    content: 'Квантовая механика описывает мир на уровне атомов и меньше. Частица может находиться в нескольких состояниях одновременно — до момента измерения. Две частицы могут быть «запутаны» мгновенно через любое расстояние. Реальность на самом глубоком уровне — вероятностная, а не детерминированная.',
    images: [
      { url: 'https://picsum.photos/seed/quantum33/600/375', caption: 'Суперпозиция состояний' },
      { url: 'https://picsum.photos/seed/wave55/600/375', caption: 'Волновая функция' },
    ],
    relatedNodes: ['consciousness', 'mathematics', 'gravity', 'light']
  },
  {
    keywords: ['жизн', 'живо', 'клетк', 'биолог'],
    targetNode: 'life',
    trail: ['ocean', 'dna', 'life'],
    title: 'Жизнь',
    thinking: ['РНК-мир...', 'Самоорганизация...', 'Первая клетка...', '3.8 млрд лет назад...'],
    content: 'Жизнь возникла на Земле около 3.8 миллиарда лет назад — возможно, у гидротермальных жерл на дне океана. Ключ к жизни — способность молекул хранить информацию и воспроизводить себя. Всё живое объединяет одна молекула: ДНК.',
    images: [
      { url: 'https://picsum.photos/seed/life22/600/375', caption: 'Гидротермальные жерла — колыбель жизни' },
      { url: 'https://picsum.photos/seed/cell44/600/375', caption: 'Первые клетки' },
    ],
    relatedNodes: ['dna', 'ocean', 'evolution', 'mathematics']
  },
  {
    keywords: ['свет', 'фотон', 'лазер', 'цвет'],
    targetNode: 'light',
    trail: ['stars', 'quantum', 'light'],
    title: 'Свет',
    thinking: ['Электромагнитная волна...', 'Фотон без массы...', '299 792 458 м/с...', 'Константа вселенной...'],
    content: 'Свет — электромагнитная волна и одновременно поток фотонов без массы. Он всегда движется с одной скоростью — 299 792 458 м/с — независимо от скорости наблюдателя. Именно это постоянство легло в основу специальной теории относительности. Вся информация о вселенной приходит к нам именно в виде света.',
    images: [
      { url: 'https://picsum.photos/seed/light66/600/375', caption: 'Дифракция' },
      { url: 'https://picsum.photos/seed/prism77/600/375', caption: 'Спектр' },
    ],
    relatedNodes: ['quantum', 'stars', 'mathematics', 'cosmos']
  },
  {
    keywords: ['звёзд', 'звезд', 'солнц', 'сверхнов'],
    targetNode: 'stars',
    trail: ['cosmos', 'stars'],
    title: 'Звёзды',
    thinking: ['Ядерный синтез...', 'Водород → Гелий...', 'Жизненный цикл...', 'Мы — звёздная пыль...'],
    content: 'Звёзды — гигантские плазменные шары, удерживаемые гравитацией и раздуваемые давлением от ядерного синтеза. В их ядрах водород превращается в гелий. Все тяжёлые элементы — углерод, железо, золото — созданы внутри звёзд и разлетелись со взрывами сверхновых. Мы буквально состоим из звёздного вещества.',
    images: [
      { url: 'https://picsum.photos/seed/stars11/600/375', caption: 'Рождение звезды в туманности' },
      { url: 'https://picsum.photos/seed/nebula22/600/375', caption: 'Сверхновая — финал и начало' },
    ],
    relatedNodes: ['cosmos', 'gravity', 'light', 'entropy']
  },
  {
    keywords: ['мозг', 'нейрон', 'мысл'],
    targetNode: 'brain',
    trail: ['evolution', 'consciousness', 'brain'],
    title: 'Мозг',
    thinking: ['86 млрд нейронов...', '100 трлн синапсов...', 'Паттерны...', 'Пластичность...'],
    content: 'Человеческий мозг содержит около 86 миллиардов нейронов, образующих более 100 триллионов синапсов. Он весит 1.4 кг и потребляет 20% энергии тела. Каждая мысль, воспоминание и чувство — это уникальный паттерн электрических сигналов. Мозг способен перестраивать себя — это называется нейропластичностью.',
    images: [
      { url: 'https://picsum.photos/seed/brain55/600/375', caption: 'Карта связей мозга' },
      { url: 'https://picsum.photos/seed/synapse11/600/375', caption: 'Синаптические связи' },
    ],
    relatedNodes: ['consciousness', 'memory', 'language', 'evolution']
  },
  {
    keywords: ['матем', 'числ', 'форму', 'геоме'],
    targetNode: 'mathematics',
    trail: ['infinity', 'mathematics'],
    title: 'Математика',
    thinking: ['Язык вселенной...', 'Теорема Гёделя...', 'Бесконечности разных размеров...', 'Придумана или открыта?'],
    content: 'Математика — единственный язык, на котором написаны законы природы. Удивительно, что структуры, придуманные математиками из чистого любопытства, через столетия оказываются точным описанием физической реальности. Гёдель доказал, что любая достаточно богатая система содержит утверждения, которые нельзя ни доказать, ни опровергнуть.',
    images: [
      { url: 'https://picsum.photos/seed/math33/600/375', caption: 'Фракталы — математика природы' },
      { url: 'https://picsum.photos/seed/prime44/600/375', caption: 'Простые числа — нерешённая загадка' },
    ],
    relatedNodes: ['quantum', 'music', 'infinity', 'dna']
  },
  {
    keywords: ['памят', 'воспомин', 'забыт'],
    targetNode: 'memory',
    trail: ['brain', 'dreams', 'memory'],
    title: 'Память',
    thinking: ['Где хранится прошлое?...', 'Реконструкция...', 'Гиппокамп...', 'Каждое воспоминание меняется...'],
    content: 'Память — не запись, а реконструкция. Каждый раз, когда мы вспоминаем что-то, мы немного изменяем это воспоминание. Гиппокамп переводит кратковременную память в долговременную во время сна. Интересно, что эмоционально значимые события запоминаются в разы лучше — за это отвечает миндалевидное тело.',
    images: [
      { url: 'https://picsum.photos/seed/memory77/600/375', caption: 'Гиппокамп — центр памяти' },
      { url: 'https://picsum.photos/seed/dream88/600/375', caption: 'Консолидация памяти во сне' },
    ],
    relatedNodes: ['brain', 'dreams', 'consciousness', 'language']
  },
];

const DEFAULT_RESPONSE = {
  targetNode: null,
  trail: [],
  title: 'Неизведанное',
  thinking: ['Ищу нити...', 'Обхожу паутину...', 'Нет прямого пути...'],
  content: 'Этот вопрос ведёт за пределы моих нитей. Попробуй спросить о чёрных дырах, сознании, времени, квантовом мире, жизни, свете, звёздах, мозге, математике или памяти.',
  images: [],
  relatedNodes: ['cosmos', 'consciousness', 'mathematics', 'life']
};
