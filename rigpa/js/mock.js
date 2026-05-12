const KNOWLEDGE_GRAPH = {
  nodes: [
    { id: 'rigpa',          label: 'Ригпа',               category: 'core',       weight: 6, color: '#ffe082' },
    { id: 'dzogchen',       label: 'Дзогпа Ченпо',        category: 'core',       weight: 5, color: '#ffd54f' },
    { id: 'trekcho',        label: 'Трекчо',              category: 'practice',   weight: 4, color: '#80cbc4' },
    { id: 'togal',          label: 'Тогал',               category: 'practice',   weight: 4, color: '#4fc3f7' },
    { id: 'base',           label: 'Основа — Жи',         category: 'ground',     weight: 5, color: '#a5d6a7' },
    { id: 'luminosity',     label: 'Ясный свет — Өсэл',  category: 'core',       weight: 5, color: '#fff9c4' },
    { id: 'emptiness',      label: 'Пустотность',         category: 'philosophy', weight: 5, color: '#e8eaf6' },
    { id: 'threekaya',      label: 'Три кая',             category: 'philosophy', weight: 4, color: '#ce93d8' },
    { id: 'nonduality',     label: 'Недвойственность',    category: 'core',       weight: 4, color: '#f48fb1' },
    { id: 'selfliberation', label: 'Само-освобождение',   category: 'practice',   weight: 4, color: '#b2dfdb' },
    { id: 'mind',           label: 'Природа ума',         category: 'core',       weight: 5, color: '#ffcc80' },
    { id: 'guru',           label: 'Учитель — передача',  category: 'lineage',    weight: 4, color: '#ff8a65' },
    { id: 'recognition',    label: 'Узнавание',           category: 'practice',   weight: 4, color: '#81d4fa' },
    { id: 'visions',        label: 'Четыре видения',      category: 'practice',   weight: 3, color: '#80deea' },
    { id: 'appearances',    label: 'Явления — Нанг',      category: 'ground',     weight: 3, color: '#c5cae9' },
    { id: 'samsara',        label: 'Сансара',             category: 'condition',  weight: 4, color: '#ef9a9a' },
    { id: 'karma',          label: 'Карма',               category: 'condition',  weight: 3, color: '#ffab91' },
    { id: 'groundlight',    label: 'Основной ясный свет', category: 'ground',     weight: 4, color: '#fff176' },
    { id: 'primordial',     label: 'Изначальная чистота', category: 'core',       weight: 4, color: '#f0f4c3' },
    { id: 'garab',          label: 'Гараб Дордже',        category: 'lineage',    weight: 3, color: '#ffccbc' },
  ],

  links: [
    { source: 'rigpa',          target: 'dzogchen' },
    { source: 'rigpa',          target: 'mind' },
    { source: 'rigpa',          target: 'recognition' },
    { source: 'rigpa',          target: 'nonduality' },
    { source: 'rigpa',          target: 'luminosity' },
    { source: 'rigpa',          target: 'selfliberation' },
    { source: 'dzogchen',       target: 'base' },
    { source: 'dzogchen',       target: 'guru' },
    { source: 'dzogchen',       target: 'garab' },
    { source: 'trekcho',        target: 'rigpa' },
    { source: 'trekcho',        target: 'emptiness' },
    { source: 'trekcho',        target: 'primordial' },
    { source: 'togal',          target: 'luminosity' },
    { source: 'togal',          target: 'visions' },
    { source: 'togal',          target: 'trekcho' },
    { source: 'base',           target: 'groundlight' },
    { source: 'base',           target: 'emptiness' },
    { source: 'base',           target: 'appearances' },
    { source: 'luminosity',     target: 'groundlight' },
    { source: 'luminosity',     target: 'threekaya' },
    { source: 'emptiness',      target: 'nonduality' },
    { source: 'threekaya',      target: 'rigpa' },
    { source: 'nonduality',     target: 'samsara' },
    { source: 'nonduality',     target: 'selfliberation' },
    { source: 'selfliberation', target: 'appearances' },
    { source: 'mind',           target: 'nonduality' },
    { source: 'guru',           target: 'recognition' },
    { source: 'guru',           target: 'garab' },
    { source: 'recognition',    target: 'selfliberation' },
    { source: 'appearances',    target: 'luminosity' },
    { source: 'samsara',        target: 'karma' },
    { source: 'karma',          target: 'mind' },
    { source: 'groundlight',    target: 'primordial' },
    { source: 'visions',        target: 'groundlight' },
    { source: 'primordial',     target: 'base' },
  ]
};

const MOCK_RESPONSES = [
  {
    keywords: ['ригпа', 'rigpa', 'осознавани', 'пробуждённост'],
    targetNode: 'rigpa',
    trail: ['dzogchen', 'mind', 'rigpa'],
    title: 'Ригпа — чистое осознавание',
    thinking: ['Изначальная природа...', 'За пределами мысли...', 'Ищущий и искомое...', 'Всегда уже здесь...'],
    content: 'Ригпа (тиб. རིག་པ་) — это не просто «осознанность», это изначальная пробуждённость, которая всегда уже присутствует. Её не нужно создавать или достигать. Ригпа — основа всего опыта, само-светящееся и пустотное одновременно. Когда практикующий узнаёт Ригпа, он видит: ищущий и искомое были одним с самого начала. Всё, что казалось препятствием, было его же украшением.',
    images: [
      { url: 'https://picsum.photos/seed/dzogchen1/600/375', caption: 'Природа ума — как небо без облаков' },
      { url: 'https://picsum.photos/seed/light88/600/375', caption: 'Само-светящееся присутствие' },
    ],
    relatedNodes: ['trekcho', 'recognition', 'luminosity', 'mind', 'nonduality']
  },
  {
    keywords: ['дзогчен', 'дзогпа', 'великое совершенств', 'dzogchen'],
    targetNode: 'dzogchen',
    trail: ['garab', 'guru', 'dzogchen'],
    title: 'Дзогпа Ченпо — Великое Совершенство',
    thinking: ['Высшее учение...', 'Ати-йога...', 'Три серии...', 'Нингма...'],
    content: 'Дзогпа Ченпо (тиб. རྫོགས་པ་ཆེན་པོ་) — «Великое Совершенство» — высочайшее учение тибетского буддизма в традиции Ньингма. Оно состоит из трёх серий: Семде (серия ума), Лонгде (серия пространства) и Менгагде (серия тайных наставлений). Дзогчен утверждает: пробуждение — не то, что нужно достигать, это то, чем ты всегда уже являешься. Все явления совершенны с самого начала.',
    images: [
      { url: 'https://picsum.photos/seed/tibet22/600/375', caption: 'Тибетские горы — место передачи учений' },
      { url: 'https://picsum.photos/seed/mandala33/600/375', caption: 'Три серии Дзогчен' },
    ],
    relatedNodes: ['rigpa', 'base', 'trekcho', 'togal', 'garab']
  },
  {
    keywords: ['трекчо', 'trekcho', 'прорубить', 'изначальна чистот', 'кадаг'],
    targetNode: 'trekcho',
    trail: ['primordial', 'emptiness', 'trekcho'],
    title: 'Трекчо — прорубить насквозь',
    thinking: ['Кадаг — изначальная чистота...', 'Рубить цепочку мысли...', 'Что остаётся?', 'Ничего лишнего...'],
    content: 'Трекчо (тиб. ཁྲེགས་ཆོད་, «прорубить насквозь») — прямое введение в изначальную чистоту через перерубание концептуального мышления. Как острый меч, Трекчо рассекает иллюзию отдельного «я», обнажая первозданную пустотность Ригпа. Практика не добавляет ничего нового — она убирает искусственные наслоения. Ключевое понятие — Кадаг: изначальная чистота, присутствующая до любого опыта.',
    images: [
      { url: 'https://picsum.photos/seed/mountain55/600/375', caption: 'Трекчо — прямой путь сквозь иллюзию' },
      { url: 'https://picsum.photos/seed/sky77/600/375', caption: 'Кадаг — изначальная чистота' },
    ],
    relatedNodes: ['rigpa', 'primordial', 'emptiness', 'togal', 'base']
  },
  {
    keywords: ['тогал', 'togal', 'прыжок', 'четыре видени', 'лхундруп'],
    targetNode: 'togal',
    trail: ['trekcho', 'luminosity', 'togal'],
    title: 'Тогал — прыжок через вершину',
    thinking: ['Спонтанное присутствие...', 'Лхундруп...', 'Свет в глазах...', 'Четыре видения...'],
    content: 'Тогал (тиб. ཐོད་རྒལ་, «прыжок через вершину») следует за Трекчо и работает со спонтанным присутствием — Лхундруп. Включает особые практики с положением тела, взглядом и игрой со светом. Практикующий проходит четыре видения (Нанг ши): переживание дхармадхату, переживание нарастания, достижение Ригпа и исчерпание явлений. Итог — растворение всего грубого восприятия в чистом свете Дхармакайи.',
    images: [
      { url: 'https://picsum.photos/seed/light99/600/375', caption: 'Тогал — игра со светом' },
      { url: 'https://picsum.photos/seed/dawn44/600/375', caption: 'Четыре видения — нарастающий свет' },
    ],
    relatedNodes: ['visions', 'luminosity', 'groundlight', 'trekcho', 'selfliberation']
  },
  {
    keywords: ['основа', 'жи', 'основани', 'база знани', 'откуда'],
    targetNode: 'base',
    trail: ['dzogchen', 'primordial', 'base'],
    title: 'Основа — Жи',
    thinking: ['Изначальное состояние...', 'Ни сансара, ни нирвана...', 'Три качества Жи...', 'Почва для всего...'],
    content: 'Основа (тиб. གཞི་, Жи) — изначальное состояние бытия, из которого возникают как сансара, так и нирвана. Жи описывается тремя качествами: пустотность (Стонпа), ясность (Гсал) и непрерывное присутствие осознавания (Ригпа). Разница между существами в сансаре и буддами — лишь в том, узнали ли они Основу как своё изначальное лицо. Это не «ничто» и не «что-то» — нераздельное пространство потенциальности.',
    images: [
      { url: 'https://picsum.photos/seed/ground11/600/375', caption: 'Жи — почва бытия' },
      { url: 'https://picsum.photos/seed/horizon22/600/375', caption: 'До сансары и нирваны' },
    ],
    relatedNodes: ['rigpa', 'primordial', 'groundlight', 'emptiness', 'appearances']
  },
  {
    keywords: ['ясный свет', 'өсэл', 'свечени', 'люминозност', 'осэл'],
    targetNode: 'luminosity',
    trail: ['base', 'groundlight', 'luminosity'],
    title: 'Ясный свет — Өсэл',
    thinking: ['Само-светящееся...', 'Без внешнего источника...', 'Основной свет в смерти...', 'Нераздельно с пустотой...'],
    content: 'Ясный свет (тиб. འོད་གསལ་, Өсэл) — светоносная природа ума, неотделимая от его пустотности. Это не метафора. В Дзогчен различают: «Основной ясный свет» — переживаемый в момент смерти (Пхова) и в глубоком сне, и «ясный свет практики» — открываемый через Тогал. Өсэл само-светящееся: оно не освещается чем-то снаружи — оно само и есть свет. Пустотность и ясность — не два, а единая природа.',
    images: [
      { url: 'https://picsum.photos/seed/lightray11/600/375', caption: 'Өсэл — само-светящаяся природа' },
      { url: 'https://picsum.photos/seed/sunrise33/600/375', caption: 'Основной ясный свет в момент смерти' },
    ],
    relatedNodes: ['groundlight', 'togal', 'threekaya', 'rigpa', 'visions']
  },
  {
    keywords: ['природа ума', 'ум', 'мысл', 'семс', 'сознани'],
    targetNode: 'mind',
    trail: ['karma', 'nonduality', 'mind'],
    title: 'Природа ума',
    thinking: ['Семс против Ригпа...', 'Обычный ум движется...', 'Природа ума — неподвижна...', 'Кто думает?'],
    content: 'В Дзогчен различают обычный ум (тиб. སེམས་, Семс) — дискурсивный, омрачённый — и природу ума (тиб. སེམས་ཉིད་, Семсньид), которая идентична Ригпа. Семс создаёт сансару через непрерывное движение мысли. Семсньид — это пространство, в котором движется Семс, но само оно не движется. Медитация в Дзогчен — это не остановка мысли, а узнавание того, кто думает.',
    images: [
      { url: 'https://picsum.photos/seed/mind55/600/375', caption: 'Семс — движущийся ум' },
      { url: 'https://picsum.photos/seed/still44/600/375', caption: 'Семсньид — неподвижная природа' },
    ],
    relatedNodes: ['rigpa', 'nonduality', 'recognition', 'samsara', 'karma']
  },
  {
    keywords: ['учитель', 'гуру', 'передача', 'линия', 'наставник', 'лама'],
    targetNode: 'guru',
    trail: ['garab', 'dzogchen', 'guru'],
    title: 'Учитель и передача',
    thinking: ['Три вида передачи...', 'Прямое указание...', 'Линия Гараба Дордже...', 'Указание на природу...'],
    content: 'В Дзогчен передача учения от учителя критична — без живой передачи текст останется мёртвой буквой. Существуют три вида передачи: символическая (через жест или объект), устная (Лунг) и прямое введение (Нготрод) — когда учитель прямо указывает ученику на его собственную природу Ригпа. Линия передачи восходит к Гарабу Дордже — первому человеческому держателю учений Дзогчен.',
    images: [
      { url: 'https://picsum.photos/seed/guru11/600/375', caption: 'Учитель указывает на природу ума' },
      { url: 'https://picsum.photos/seed/lineage22/600/375', caption: 'Непрерывная линия передачи' },
    ],
    relatedNodes: ['recognition', 'garab', 'dzogchen', 'rigpa']
  },
  {
    keywords: ['узнавани', 'нготрод', 'прямое введени', 'указани'],
    targetNode: 'recognition',
    trail: ['guru', 'rigpa', 'recognition'],
    title: 'Узнавание — Нгошепа',
    thinking: ['Нготрод — прямое указание...', 'Три завета Гараба...', 'Ничего, что нужно искать...', 'Уже здесь...'],
    content: 'Узнавание (тиб. ངོ་ཤེས་པ་, Нгошепа) — центральное событие в Дзогчен. Три завета Гараба Дордже: первое — прямое введение в собственную природу; второе — отсутствие сомнений; третье — продолжение в состоянии не-блуждания. Узнавание — это не переживание, которое появляется и исчезает. Это признание того, что всегда уже присутствовало. После узнавания практика становится не достижением, а поддержанием.',
    images: [
      { url: 'https://picsum.photos/seed/recognize11/600/375', caption: 'Момент узнавания — Нготрод' },
      { url: 'https://picsum.photos/seed/open22/600/375', caption: 'Три завета Гараба Дордже' },
    ],
    relatedNodes: ['guru', 'rigpa', 'selfliberation', 'mind', 'trekcho']
  },
  {
    keywords: ['недвойственност', 'нондуальност', 'единств', 'субъект объект'],
    targetNode: 'nonduality',
    trail: ['emptiness', 'mind', 'nonduality'],
    title: 'Недвойственность — Гнис мед',
    thinking: ['Субъект и объект...', 'Разделение — иллюзия...', 'Один вкус...', 'Всё — украшение Ригпа...'],
    content: 'Недвойственность (тиб. གཉིས་མེད་, Гнис мед) — не философская позиция, а прямое переживание в Дзогчен. Обычное восприятие разделяет мир на воспринимающего и воспринимаемое, субъект и объект. В состоянии Ригпа это разделение растворяется — не потому что всё сливается в «одно», а потому что видно: деление никогда не было реальным. Это называют «один вкус» (Ро Гьючик) — всё явления имеют вкус Ригпа.',
    images: [
      { url: 'https://picsum.photos/seed/nondual11/600/375', caption: 'Один вкус — Ро Гьючик' },
      { url: 'https://picsum.photos/seed/mirror22/600/375', caption: 'Зеркало не отделено от отражения' },
    ],
    relatedNodes: ['rigpa', 'emptiness', 'selfliberation', 'samsara', 'mind']
  },
  {
    keywords: ['само-освобожден', 'самоосвобожден', 'ранг дрол', 'rang grol'],
    targetNode: 'selfliberation',
    trail: ['rigpa', 'appearances', 'selfliberation'],
    title: 'Само-освобождение — Рангдрол',
    thinking: ['Мысли освобождаются сами...', 'Как волна уходит в море...', 'Не подавлять, не следовать...', 'Рангдрол...'],
    content: 'Само-освобождение (тиб. རང་གྲོལ་, Рангдрол) — ключевой принцип Дзогчен. Мысли и эмоции не нужно подавлять или трансформировать — они само-освобождаются, если их не подпитывать вниманием. Как волна в океане: поднявшись, она сама уходит обратно в воду. В состоянии Ригпа любое явление — боль, страх, гнев — узнаётся как энергия осознавания и само-освобождается, не оставляя следа.',
    images: [
      { url: 'https://picsum.photos/seed/wave11/600/375', caption: 'Волна сама возвращается в море' },
      { url: 'https://picsum.photos/seed/free22/600/375', caption: 'Рангдрол — нет нужды в подавлении' },
    ],
    relatedNodes: ['rigpa', 'appearances', 'recognition', 'nonduality', 'trekcho']
  },
  {
    keywords: ['гараб', 'garab', 'дордже', 'первый учитель', 'праджнябхава'],
    targetNode: 'garab',
    trail: ['dzogchen', 'garab'],
    title: 'Гараб Дордже',
    thinking: ['Первый человеческий держатель...', 'Три завета...', 'Ваджра смеха...', 'Сострадание без усилия...'],
    content: 'Гараб Дордже (тиб. དགའ་རབ་རྡོ་རྗེ་) — первый человеческий держатель учений Дзогчен, живший, по преданию, в Уддияне. Он систематизировал учения в три завета: прямое введение в природу ума, отсутствие сомнений, продолжение без отвлечения. Когда умирал, он явился своему ученику Манджушримитре в форме маленького светового тела и передал последнее наставление. Его имя означает «Высшая ваджра радости».',
    images: [
      { url: 'https://picsum.photos/seed/vajra11/600/375', caption: 'Гараб Дордже — первый держатель учений' },
      { url: 'https://picsum.photos/seed/thanka22/600/375', caption: 'Три завета Гараба Дордже' },
    ],
    relatedNodes: ['dzogchen', 'guru', 'recognition', 'rigpa']
  },
];

const DEFAULT_RESPONSE = {
  targetNode: null,
  trail: [],
  title: 'Нить не найдена',
  thinking: ['Ищу нити...', 'Обхожу паутину...', 'Может, спросить иначе?'],
  content: 'Этот вопрос ведёт в ещё не раскрытые части паутины. Попробуй спросить о Ригпа, Трекчо, Тогал, Основе, Ясном свете, Природе ума, Учителе, Узнавании, Недвойственности или Само-освобождении.',
  images: [],
  relatedNodes: ['rigpa', 'dzogchen', 'trekcho', 'base']
};
