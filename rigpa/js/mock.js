// ────────────────────────────────────────────────────────────────────────────
// Дзогчен — База знаний (собрана из rigpawiki.org, lotsawahouse.org, Wikipedia)
// 68 узлов, связи строятся автоматически из relatedTo
// ────────────────────────────────────────────────────────────────────────────

const _NODES_DATA = [

  // ── Корневые учения ────────────────────────────────────────────────────────
  {
    id: 'dzogchen', label: 'Дзогпа Ченпо', tibetan: 'rdzogs pa chen po',
    category: 'core_teaching', weight: 6, color: '#ffd740',
    relatedTo: ['rigpa','gzhi','kadak','lhundrup','trekcho','togal','atiyoga','nyingma','semde','longde','mennagde','garab_dorje']
  },
  {
    id: 'atiyoga', label: 'Атийога', tibetan: 'a ti yo ga',
    category: 'core_teaching', weight: 4, color: '#ffc400',
    relatedTo: ['dzogchen','nyingma','nine_yanas','rigpa']
  },

  // ── Ключевые концепции ─────────────────────────────────────────────────────
  {
    id: 'rigpa', label: 'Ригпа', tibetan: 'rig pa',
    category: 'core_concept', weight: 6, color: '#ffe082',
    relatedTo: ['ma_rigpa','sems','gzhi','yeshe','pointing_out','dharmakaya','buddha_nature','osel','nonduality','rangdrol']
  },
  {
    id: 'ma_rigpa', label: 'Ма Ригпа — Неведение', tibetan: 'ma rig pa',
    category: 'core_concept', weight: 3, color: '#ef9a9a',
    relatedTo: ['rigpa','gzhi','sems']
  },
  {
    id: 'gzhi', label: 'Основание — Гжи', tibetan: 'gzhi',
    category: 'core_concept', weight: 5, color: '#ffe082',
    relatedTo: ['kadak','lhundrup','thugje','rigpa','dharmakaya','kuntuzangpo','buddha_nature']
  },
  {
    id: 'kadak', label: 'Изначальная чистота — Кадаг', tibetan: 'ka dag',
    category: 'core_concept', weight: 5, color: '#fff9c4',
    relatedTo: ['lhundrup','gzhi','trekcho','dharmakaya']
  },
  {
    id: 'lhundrup', label: 'Спонтанное присутствие — Лхундруп', tibetan: 'lhun grub',
    category: 'core_concept', weight: 5, color: '#fff9c4',
    relatedTo: ['kadak','gzhi','togal','sambhogakaya','nirmanakaya']
  },
  {
    id: 'thugje', label: 'Сострадательная энергия — Тугдже', tibetan: 'thugs rje',
    category: 'core_concept', weight: 3, color: '#ffccbc',
    relatedTo: ['gzhi','nirmanakaya','kadak','lhundrup']
  },
  {
    id: 'osel', label: 'Ясный свет — Өсэл', tibetan: "'od gsal",
    category: 'core_concept', weight: 5, color: '#fff9c4',
    relatedTo: ['ground_luminosity','bardo','rigpa','dharmata','togal']
  },
  {
    id: 'ground_luminosity', label: 'Светоносность Основания', tibetan: "gzhi'i 'od gsal",
    category: 'core_concept', weight: 4, color: '#fff176',
    relatedTo: ['osel','bardo','dharmata','rigpa','trekcho']
  },
  {
    id: 'dharmata', label: 'Дхармата — Чёньид', tibetan: 'chos nyid',
    category: 'core_concept', weight: 4, color: '#e8eaf6',
    relatedTo: ['osel','ground_luminosity','bardo','five_wisdoms','rigpa']
  },
  {
    id: 'rangdrol', label: 'Само-освобождение — Рангдрол', tibetan: 'rang grol',
    category: 'core_concept', weight: 5, color: '#b2dfdb',
    relatedTo: ['rigpa','trekcho','three_liberation_modes','sems']
  },
  {
    id: 'nonduality', label: 'Недвойственность — Ньи мед', tibetan: 'gnyis med',
    category: 'core_concept', weight: 4, color: '#f8bbd0',
    relatedTo: ['rigpa','gzhi','kadak','lhundrup','rangdrol']
  },
  {
    id: 'yeshe', label: 'Изначальная мудрость — Еше', tibetan: 'ye shes',
    category: 'core_concept', weight: 4, color: '#ffe082',
    relatedTo: ['rigpa','five_wisdoms','sems','dharmakaya']
  },
  {
    id: 'sems', label: 'Обычный ум — Сем', tibetan: 'sems',
    category: 'core_concept', weight: 3, color: '#b0bec5',
    relatedTo: ['rigpa','yeshe','ma_rigpa','pointing_out']
  },
  {
    id: 'buddha_nature', label: 'Природа Будды', tibetan: "bde bar gshegs pa'i snying po",
    category: 'core_concept', weight: 4, color: '#ffe082',
    relatedTo: ['rigpa','dharmakaya','gzhi','sems']
  },

  // ── Практики ───────────────────────────────────────────────────────────────
  {
    id: 'trekcho', label: 'Трекчо', tibetan: 'khregs chod',
    category: 'practice', weight: 5, color: '#80cbc4',
    relatedTo: ['togal','kadak','rigpa','mennagde','pointing_out','rangdrol','sky_gazing','ground_luminosity']
  },
  {
    id: 'togal', label: 'Тогал', tibetan: 'thod rgal',
    category: 'practice', weight: 5, color: '#4fc3f7',
    relatedTo: ['trekcho','lhundrup','four_visions','rainbow_body','dark_retreat','sky_gazing','mennagde','three_kayas','lamps','thigle']
  },
  {
    id: 'pointing_out', label: 'Прямое введение', tibetan: 'ngo sprod pa',
    category: 'practice', weight: 5, color: '#80cbc4',
    relatedTo: ['rigpa','garab_dorje','three_statements','transmission']
  },
  {
    id: 'three_statements', label: 'Три утверждения Гараба Дордже', tibetan: 'tshig gsum gnad du brdeg pa',
    category: 'practice', weight: 4, color: '#80deea',
    relatedTo: ['garab_dorje','pointing_out','rigpa','rangdrol']
  },
  {
    id: 'four_visions', label: 'Четыре видения', tibetan: 'snang ba bzhi',
    category: 'practice', weight: 4, color: '#80deea',
    relatedTo: ['togal','rainbow_body','sambhogakaya','thigle','lamps']
  },
  {
    id: 'sky_gazing', label: 'Созерцание неба', tibetan: 'nam mkha la lta ba',
    category: 'practice', weight: 3, color: '#b2dfdb',
    relatedTo: ['trekcho','togal','lamps','rigpa']
  },
  {
    id: 'dark_retreat', label: 'Тёмный ретрит', tibetan: 'mun mtshams',
    category: 'practice', weight: 3, color: '#7986cb',
    relatedTo: ['togal','lamps','four_visions','osel']
  },
  {
    id: 'lamps', label: 'Лампы Тогала — Дрёнма', tibetan: 'sgron ma',
    category: 'practice', weight: 3, color: '#b2dfdb',
    relatedTo: ['togal','four_visions','thigle','sky_gazing','dark_retreat']
  },
  {
    id: 'tsa_lung', label: 'Тса-Лунг (Каналы и Ветры)', tibetan: 'rtsa rlung',
    category: 'practice', weight: 3, color: '#b2dfdb',
    relatedTo: ['togal','thigle','trulkhor','namkhai_norbu']
  },
  {
    id: 'trulkhor', label: 'Трулкхор — Янтра-йога', tibetan: "'phrul 'khor",
    category: 'practice', weight: 3, color: '#b2dfdb',
    relatedTo: ['tsa_lung','togal','namkhai_norbu']
  },
  {
    id: 'three_liberation_modes', label: 'Три способа освобождения', tibetan: 'grol lugs gsum',
    category: 'practice', weight: 3, color: '#b2dfdb',
    relatedTo: ['rangdrol','rigpa','trekcho']
  },
  {
    id: 'integration', label: 'Интеграция — Ньямлен', tibetan: 'nyams len',
    category: 'practice', weight: 3, color: '#b2dfdb',
    relatedTo: ['trekcho','rangdrol','rigpa']
  },
  {
    id: 'transmission', label: 'Передача — Лунг/Вэнг', tibetan: 'lung / dbang',
    category: 'practice', weight: 3, color: '#80cbc4',
    relatedTo: ['pointing_out','garab_dorje','rigpa']
  },
  {
    id: 'nyam', label: 'Медитативные переживания — Ньям', tibetan: 'nyams',
    category: 'experience', weight: 3, color: '#81d4fa',
    relatedTo: ['rigpa','trekcho','togal']
  },

  // ── Три Каи ────────────────────────────────────────────────────────────────
  {
    id: 'three_kayas', label: 'Три Каи — Трикая', tibetan: 'sku gsum',
    category: 'three_kayas', weight: 4, color: '#ce93d8',
    relatedTo: ['dharmakaya','sambhogakaya','nirmanakaya','gzhi','kadak','lhundrup','thugje']
  },
  {
    id: 'dharmakaya', label: 'Дхармакая', tibetan: 'chos sku',
    category: 'three_kayas', weight: 4, color: '#b39ddb',
    relatedTo: ['sambhogakaya','nirmanakaya','three_kayas','kadak','trekcho','rigpa']
  },
  {
    id: 'sambhogakaya', label: 'Самбхогакая', tibetan: 'longs sku',
    category: 'three_kayas', weight: 3, color: '#b39ddb',
    relatedTo: ['dharmakaya','nirmanakaya','three_kayas','lhundrup','togal','five_wisdoms']
  },
  {
    id: 'nirmanakaya', label: 'Нирманакая', tibetan: 'sprul sku',
    category: 'three_kayas', weight: 3, color: '#b39ddb',
    relatedTo: ['dharmakaya','sambhogakaya','three_kayas','thugje']
  },

  // ── Другие учения ──────────────────────────────────────────────────────────
  {
    id: 'five_wisdoms', label: 'Пять мудростей', tibetan: 'ye shes lnga',
    category: 'teaching', weight: 4, color: '#ce93d8',
    relatedTo: ['yeshe','five_pure_lights','five_buddha_families','sambhogakaya','dharmata']
  },
  {
    id: 'five_pure_lights', label: 'Пять чистых светов', tibetan: "'od lnga",
    category: 'teaching', weight: 3, color: '#e1bee7',
    relatedTo: ['five_wisdoms','five_buddha_families','togal','four_visions','dharmata']
  },
  {
    id: 'five_buddha_families', label: 'Пять семейств будд', tibetan: 'rigs lnga',
    category: 'teaching', weight: 3, color: '#e1bee7',
    relatedTo: ['five_wisdoms','five_pure_lights','sambhogakaya','bardo','dharmata']
  },
  {
    id: 'bardo', label: 'Бардо', tibetan: 'bar do',
    category: 'teaching', weight: 4, color: '#9575cd',
    relatedTo: ['osel','ground_luminosity','dharmata','rainbow_body']
  },
  {
    id: 'thigle', label: 'Тигле — Сферы/Капли', tibetan: 'thig le',
    category: 'teaching', weight: 3, color: '#80deea',
    relatedTo: ['togal','four_visions','lamps','tsa_lung']
  },
  {
    id: 'rainbow_body', label: 'Тело Радуги — Джалю', tibetan: "'ja' lus",
    category: 'realization', weight: 4, color: '#fff9c4',
    relatedTo: ['togal','trekcho','four_visions','bardo']
  },

  // ── Три серии ──────────────────────────────────────────────────────────────
  {
    id: 'semde', label: 'Семде — Серия Ума', tibetan: 'sems sde',
    category: 'three_series', weight: 3, color: '#a5d6a7',
    relatedTo: ['longde','mennagde','manjushrimitra','rigpa']
  },
  {
    id: 'longde', label: 'Лонгде — Серия Пространства', tibetan: 'klong sde',
    category: 'three_series', weight: 3, color: '#a5d6a7',
    relatedTo: ['semde','mennagde','manjushrimitra']
  },
  {
    id: 'mennagde', label: 'Менагде — Тайные Наставления', tibetan: 'man ngag sde',
    category: 'three_series', weight: 4, color: '#69f0ae',
    relatedTo: ['semde','longde','trekcho','togal','shri_singha','nyingtik']
  },

  // ── Ньингтиг-циклы ─────────────────────────────────────────────────────────
  {
    id: 'nyingtik', label: 'Ньингтиг — Сердечная Сущность', tibetan: 'snying thig',
    category: 'teaching', weight: 4, color: '#ce93d8',
    relatedTo: ['mennagde','longchenpa','jigme_lingpa','vimalamitra','longchen_nyingthig']
  },
  {
    id: 'longchen_nyingthig', label: 'Лонгчен Ньингтиг', tibetan: 'klong chen snying thig',
    category: 'teaching', weight: 4, color: '#ce93d8',
    relatedTo: ['jigme_lingpa','longchenpa','nyingtik','terma','vimalamitra']
  },
  {
    id: 'terma', label: 'Терма — Скрытые Сокровища', tibetan: 'gter ma',
    category: 'teaching', weight: 4, color: '#ffab91',
    relatedTo: ['padmasambhava','yeshe_tsogyal','jigme_lingpa','dudjom_rinpoche','longchen_nyingthig']
  },
  {
    id: 'nine_yanas', label: 'Девять Ян', tibetan: 'theg pa dgu',
    category: 'teaching', weight: 3, color: '#e1bee7',
    relatedTo: ['atiyoga','nyingma']
  },

  // ── Традиции ───────────────────────────────────────────────────────────────
  {
    id: 'nyingma', label: 'Ньингма', tibetan: 'rnying ma',
    category: 'lineage', weight: 4, color: '#ff8a65',
    relatedTo: ['padmasambhava','atiyoga','nine_yanas','terma','dudjom_rinpoche','dilgo_khyentse']
  },
  {
    id: 'bon', label: 'Бон', tibetan: 'bon',
    category: 'lineage', weight: 3, color: '#ffb74d',
    relatedTo: ['zhang_zhung','tenzin_wangyal','dzogchen']
  },
  {
    id: 'zhang_zhung', label: 'Чжан Жунг', tibetan: 'zhang zhung',
    category: 'lineage', weight: 3, color: '#ffcc80',
    relatedTo: ['bon']
  },

  // ── Изначальные Будды ──────────────────────────────────────────────────────
  {
    id: 'kuntuzangpo', label: 'Кунтузангпо — Самантабхадра', tibetan: 'kun tu bzang po',
    category: 'master', weight: 4, color: '#4dd0e1',
    relatedTo: ['dzogchen','gzhi','dharmakaya','garab_dorje','vajrasattva']
  },
  {
    id: 'vajrasattva', label: 'Ваджрасаттва', tibetan: "rdo rje sems dpa'",
    category: 'master', weight: 3, color: '#80deea',
    relatedTo: ['kuntuzangpo','garab_dorje']
  },

  // ── Мастера линии передачи ─────────────────────────────────────────────────
  {
    id: 'garab_dorje', label: 'Гараб Дордже', tibetan: "dga' rab rdo rje",
    category: 'master', weight: 5, color: '#ffd54f',
    relatedTo: ['vajrasattva','manjushrimitra','three_statements','pointing_out','kuntuzangpo']
  },
  {
    id: 'manjushrimitra', label: 'Манджушримитра', tibetan: "'jam dpal bshes gnyen",
    category: 'master', weight: 3, color: '#ffb74d',
    relatedTo: ['garab_dorje','shri_singha','semde','longde','mennagde']
  },
  {
    id: 'shri_singha', label: 'Шри Сингха', tibetan: 'shri sing ha',
    category: 'master', weight: 3, color: '#ffb74d',
    relatedTo: ['manjushrimitra','jnanasutra','vimalamitra','mennagde']
  },
  {
    id: 'jnanasutra', label: 'Джнянасутра', tibetan: 'dz+nyA na sU tra',
    category: 'master', weight: 3, color: '#ffe0b2',
    relatedTo: ['shri_singha','vimalamitra','mennagde']
  },
  {
    id: 'vimalamitra', label: 'Вималамитра', tibetan: 'bi ma la mi tra',
    category: 'master', weight: 4, color: '#ffb74d',
    relatedTo: ['shri_singha','jnanasutra','padmasambhava','nyingtik','jigme_lingpa']
  },
  {
    id: 'padmasambhava', label: 'Падмасамбхава — Гуру Ринпоче', tibetan: "pad ma 'byung gnas",
    category: 'master', weight: 5, color: '#ff8f00',
    relatedTo: ['yeshe_tsogyal','vimalamitra','nyingma','terma','longchenpa']
  },
  {
    id: 'yeshe_tsogyal', label: 'Еше Цогьял', tibetan: 'ye shes mtsho rgyal',
    category: 'master', weight: 3, color: '#f8bbd0',
    relatedTo: ['padmasambhava','terma','nyingma']
  },
  {
    id: 'longchenpa', label: 'Лонгченпа', tibetan: 'klong chen rab byams pa',
    category: 'master', weight: 5, color: '#ff6d00',
    relatedTo: ['jigme_lingpa','nyingtik','longchen_nyingthig','padmasambhava','vimalamitra']
  },
  {
    id: 'jigme_lingpa', label: 'Джигме Лингпа', tibetan: "'jigs med gling pa",
    category: 'master', weight: 4, color: '#ffb74d',
    relatedTo: ['longchenpa','longchen_nyingthig','vimalamitra','terma','nyingtik']
  },
  {
    id: 'patrul_rinpoche', label: 'Патрул Ринпоче', tibetan: 'dpal sprul rin po che',
    category: 'master', weight: 3, color: '#ffe0b2',
    relatedTo: ['longchen_nyingthig','nyingma','mipham_rinpoche']
  },
  {
    id: 'mipham_rinpoche', label: 'Мипам Ринпоче', tibetan: 'mi pham rgya mtsho',
    category: 'master', weight: 3, color: '#ffe0b2',
    relatedTo: ['longchenpa','nyingma','patrul_rinpoche']
  },
  {
    id: 'dudjom_rinpoche', label: 'Дуджом Ринпоче', tibetan: "bdud 'joms rin po che",
    category: 'master', weight: 4, color: '#ffb74d',
    relatedTo: ['nyingma','terma','longchen_nyingthig','dilgo_khyentse']
  },
  {
    id: 'dilgo_khyentse', label: 'Дилго Кхьенце Ринпоче', tibetan: 'dil mgo mkhyen brtse',
    category: 'master', weight: 4, color: '#ffb74d',
    relatedTo: ['nyingma','dudjom_rinpoche','longchen_nyingthig','sogyal_rinpoche']
  },
  {
    id: 'namkhai_norbu', label: 'Намкай Норбу', tibetan: "nam mkha'i nor bu",
    category: 'master', weight: 3, color: '#ffe0b2',
    relatedTo: ['dzogchen','nyingma','trulkhor','longchen_nyingthig']
  },
  {
    id: 'sogyal_rinpoche', label: 'Согьял Ринпоче', tibetan: 'bsod nams rgyal po',
    category: 'master', weight: 3, color: '#ffe0b2',
    relatedTo: ['dzogchen','nyingma','bardo','dilgo_khyentse']
  },
  {
    id: 'tenzin_wangyal', label: 'Тензин Вангьял Ринпоче', tibetan: "bstan 'dzin dbang rgyal",
    category: 'master', weight: 3, color: '#ffcc80',
    relatedTo: ['bon','zhang_zhung']
  },
];

// ── Автосборка графа ─────────────────────────────────────────────────────────
const KNOWLEDGE_GRAPH = (() => {
  const nodeIds = new Set(_NODES_DATA.map(n => n.id));
  const nodes = _NODES_DATA.map(({ relatedTo, ...n }) => n);

  const seen = new Set();
  const links = [];
  _NODES_DATA.forEach(node => {
    (node.relatedTo || []).forEach(targetId => {
      if (!nodeIds.has(targetId)) return;
      const key = [node.id, targetId].sort().join('|');
      if (!seen.has(key)) {
        seen.add(key);
        links.push({ source: node.id, target: targetId });
      }
    });
  });

  return { nodes, links };
})();

// ── Mock ответы ──────────────────────────────────────────────────────────────
const MOCK_RESPONSES = [

  {
    keywords: ['дзогчен', 'великое совершенств', 'высшее учение', 'атийога', 'dzogchen', 'что такое'],
    targetNode: 'dzogchen',
    trail: ['atiyoga', 'rigpa', 'dzogchen'],
    title: 'Дзогпа Ченпо — Великое Совершенство',
    thinking: ['Высшая яна...', 'Ати-йога...', 'Уже пробуждён...', 'Ничего добавлять...'],
    content: 'Дзогчен («Великое Совершенство») — учение, стоящее на вершине девяти ян традиции Ньингма. Его суть: природа ума изначально совершенна и пробуждена — ничего не нужно добавлять и ничего устранять. Вместо постепенного создания пробуждения Дзогчен прямо указывает на уже присутствующую ригпу — чистое недвойственное осознавание. Хотя традиционно ассоциируется с Ньингма, практиковали Дзогчен мастера всех тибетских школ как сокровеннейшую практику.',
    images: [
      { url: 'https://picsum.photos/seed/dzogchen01/600/375', caption: 'Тибетские горы — место передачи учений' },
      { url: 'https://picsum.photos/seed/dzogchen02/600/375', caption: 'Три серии Дзогчен' },
    ],
    relatedNodes: ['rigpa', 'gzhi', 'atiyoga', 'trekcho', 'togal', 'garab_dorje']
  },

  {
    keywords: ['ригпа', 'rigpa', 'осознавани', 'природа ума', 'чистое осознавани'],
    targetNode: 'rigpa',
    trail: ['sems', 'ma_rigpa', 'rigpa'],
    title: 'Ригпа — чистое осознавание',
    thinking: ['За пределами сема...', 'Уже присутствует...', 'Ищущий и искомое едины...', 'Небо за облаками...'],
    content: 'Ригпа (тиб. rig pa) — центральный термин Дзогчена: чистое недвойственное осознавание, природа ума в её изначальном состоянии. Ригпа противопоставляется сему — обычному двойственному уму, захваченному мыслями. Как XIV Далай-лама описывает: сем «временно омрачён двойственными мыслями», ригпа — «чистое осознавание, свободное от этих искажений». Ригпа не создаётся в медитации — она узнаётся как то, чем ум всегда уже является.',
    images: [
      { url: 'https://picsum.photos/seed/rigpa01/600/375', caption: 'Небо — метафора природы ума' },
      { url: 'https://picsum.photos/seed/rigpa02/600/375', caption: 'Само-светящееся осознавание' },
    ],
    relatedNodes: ['sems', 'ma_rigpa', 'pointing_out', 'nonduality', 'buddha_nature', 'gzhi']
  },

  {
    keywords: ['сем ', 'обычный ум', 'ум и ригпа', 'разница ум', 'семс'],
    targetNode: 'sems',
    trail: ['rigpa', 'ma_rigpa', 'sems'],
    title: 'Сем и Ригпа — два лица ума',
    thinking: ['Облака и небо...', 'Субъект и объект...', 'Временное омрачение...', 'Узнать за пределами...'],
    content: 'Сем (тиб. sems) — обычный двойственный ум: он цепляется, отвергает, блуждает в концепциях. Ригпа — природа этого же ума, его изначальное незапятнанное измерение. По аналогии: сем — это облака, ригпа — небо за ними. Облака появляются и исчезают, небо неизменно. Ма ригпа — «не-ригпа», неведение — это не нечто иное, а просто ригпа, не узнающая саму себя. Цель Дзогчена — прямое введение в ригпу за пределами сема.',
    images: [
      { url: 'https://picsum.photos/seed/sems01/600/375', caption: 'Движущийся ум — сем' },
      { url: 'https://picsum.photos/seed/sems02/600/375', caption: 'Природа ума — неподвижное небо' },
    ],
    relatedNodes: ['rigpa', 'ma_rigpa', 'yeshe', 'pointing_out', 'nonduality']
  },

  {
    keywords: ['три серии', 'семде', 'лонгде', 'менагде', 'серия ума', 'серия пространств'],
    targetNode: 'mennagde',
    trail: ['semde', 'longde', 'mennagde'],
    title: 'Три серии Дзогчена',
    thinking: ['Серия ума...', 'Серия пространства...', 'Тайные наставления...', 'Манджушримитра...'],
    content: 'Три серии систематизированы Манджушримитрой. Семде («Серия Ума») знакомит с природой ума через прямое переживание пустотности; главный текст — «Кунджед Гьялпо». Лонгде («Серия Пространства») работает с изначальным измерением пустоты — это наиболее эзотерическая серия. Менагде («Серия Тайных Наставлений») — наиболее распространённая; именно здесь находятся практики Трекчо и Тогал. Все три серии ведут к одной цели — полной реализации ригпы.',
    images: [
      { url: 'https://picsum.photos/seed/series01/600/375', caption: 'Кунджед Гьялпо — главный текст Семде' },
      { url: 'https://picsum.photos/seed/series02/600/375', caption: 'Менагде — Тайные Наставления' },
    ],
    relatedNodes: ['semde', 'longde', 'manjushrimitra', 'trekcho', 'togal', 'garab_dorje']
  },

  {
    keywords: ['трекчо', 'прямое срезани', 'прорыв', 'khreg', 'тхрекчо'],
    targetNode: 'trekcho',
    trail: ['kadak', 'gzhi', 'trekcho'],
    title: 'Трекчо — прорубить насквозь',
    thinking: ['Кадаг — изначальная чистота...', 'Срезать концепции...', 'Что остаётся?', 'Простое пребывание...'],
    content: 'Трекчо (тиб. khregs chod, «полное срезание») — первая из двух главных практик Менагде. Цель — узнавание и устойчивое пребывание в изначальной чистоте (кадаг) ума, за пределами концептуального усложнения. Практика не добавляет ничего нового — она обнажает то, что всегда уже было. Трекчо ведёт к реализации дхармакаи и является необходимым основанием перед Тогалом.',
    images: [
      { url: 'https://picsum.photos/seed/trekcho01/600/375', caption: 'Трекчо — прямой путь сквозь иллюзию' },
      { url: 'https://picsum.photos/seed/trekcho02/600/375', caption: 'Кадаг — изначальная чистота' },
    ],
    relatedNodes: ['togal', 'kadak', 'rigpa', 'rangdrol', 'dharmakaya', 'sky_gazing']
  },

  {
    keywords: ['тогал', 'прямое пересечени', 'прыжок', 'lhundrup', 'тхогал'],
    targetNode: 'togal',
    trail: ['trekcho', 'lhundrup', 'togal'],
    title: 'Тогал — прямое пересечение',
    thinking: ['Лхундруп...', 'Спонтанное присутствие...', 'Свет изнутри...', 'Четыре видения...'],
    content: 'Тогал (тиб. thod rgal, «прыжок через вершину») — вторая главная практика Менагде, доступная только после устойчивости в Трекчо. Работает со спонтанным присутствием (лхундруп) через особые позы тела, созерцание неба и тёмные ретриты, вызывая прямое переживание самосветящегося света ригпы. Практикующий проходит четыре видения и в итоге может реализовать Тело Радуги — растворение физического тела в чистом свете.',
    images: [
      { url: 'https://picsum.photos/seed/togal01/600/375', caption: 'Тогал — игра со светом' },
      { url: 'https://picsum.photos/seed/togal02/600/375', caption: 'Четыре видения — нарастающий свет' },
    ],
    relatedNodes: ['trekcho', 'four_visions', 'lhundrup', 'rainbow_body', 'dark_retreat', 'lamps']
  },

  {
    keywords: ['четыре видени', 'видени тогала', 'нангва жи', 'четыре стадии'],
    targetNode: 'four_visions',
    trail: ['togal', 'lamps', 'four_visions'],
    title: 'Четыре видения Тогала',
    thinking: ['Световые сферы...', 'Нарастание...', 'Будда-поля...', 'Растворение в дхармате...'],
    content: 'Четыре видения — прогрессивная последовательность в практике Тогал. Первое: «Прямое восприятие дхарматы» — появляются световые шары (тигле) и лучи. Второе: «Возрастание переживания» — нарастание пятицветного света и форм. Третье: «Достижение осознавания» — полное развёртывание самбхогакаических будда-полей. Четвёртое: «Исчерпание явлений в дхармате» — всё растворяется в пространстве, реализуется Тело Радуги.',
    images: [
      { url: 'https://picsum.photos/seed/visions01/600/375', caption: 'Первое видение — тигле и лучи' },
      { url: 'https://picsum.photos/seed/visions02/600/375', caption: 'Четвёртое видение — растворение' },
    ],
    relatedNodes: ['togal', 'rainbow_body', 'thigle', 'lamps', 'sambhogakaya', 'dharmata']
  },

  {
    keywords: ['тело радуги', 'джалю', 'растворяется тело', 'радужное тело', "ja' lus"],
    targetNode: 'rainbow_body',
    trail: ['four_visions', 'togal', 'rainbow_body'],
    title: 'Тело Радуги — Джалю',
    thinking: ['Исчерпание кармы...', 'Тело уменьшается...', 'Только волосы и ногти...', 'Свет навсегда...'],
    content: 'Тело Радуги (тиб. ja lus) — высшая реализация Дзогчена: в момент смерти тело растворяется в радужном свете, оставляя лишь волосы и ногти. Это происходит, когда все кармические загрязнения полностью исчерпаны. Через Трекчо достигается «малое» Тело Радуги — тело уменьшается и растворяется. Через Тогал — «Тело Радуги Великого Переноса»: практикующий становится телом света ещё при жизни, сохраняя способность являться ученикам.',
    images: [
      { url: 'https://picsum.photos/seed/rainbow01/600/375', caption: 'Растворение в радужном свете' },
      { url: 'https://picsum.photos/seed/rainbow02/600/375', caption: 'Тело Радуги — финал пути' },
    ],
    relatedNodes: ['togal', 'trekcho', 'four_visions', 'bardo', 'rigpa']
  },

  {
    keywords: ['гараб', 'три утвержден', 'цик сум', 'первый мастер линии', 'гараб дордже'],
    targetNode: 'garab_dorje',
    trail: ['three_statements', 'pointing_out', 'garab_dorje'],
    title: 'Гараб Дордже и Три Утверждения',
    thinking: ['Прямое указание...', 'Нет сомнений...', 'Мысли само-освобождаются...', 'Завещание при уходе...'],
    content: 'Гараб Дордже — первый человеческий мастер Дзогчена, воплощение Ваджрасаттвы. При своём уходе в Тело Радуги он передал Манджушримитре «Три Утверждения» (Цик Сум не Дек): 1) Прямое введение в собственную природу; 2) Не оставаться ни в малейшем сомнении; 3) Уверенность в самоосвобождении возникающих мыслей. Эти три утверждения считаются квинтэссенцией всего пути Дзогчена — от введения до полного освобождения.',
    images: [
      { url: 'https://picsum.photos/seed/garab01/600/375', caption: 'Гараб Дордже — первый держатель учений' },
      { url: 'https://picsum.photos/seed/garab02/600/375', caption: 'Три Утверждения — суть пути' },
    ],
    relatedNodes: ['three_statements', 'pointing_out', 'vajrasattva', 'manjushrimitra', 'rigpa', 'rangdrol']
  },

  {
    keywords: ['лонгченпа', 'всезнающ', 'семь сокровищн', 'дримей эзер', 'лонгчен рабджам'],
    targetNode: 'longchenpa',
    trail: ['nyingtik', 'jigme_lingpa', 'longchenpa'],
    title: 'Лонгченпа — Всезнающий',
    thinking: ['Семь Сокровищниц...', '250 текстов...', 'Систематизация Дзогчен...', 'Видения через 400 лет...'],
    content: 'Лонгченпа (1308–1364), известный как «Всезнающий», — величайший систематизатор Дзогчена. Его «Семь Сокровищниц» (Дзод Дун) охватывают всю дзогченовскую философию; трилогии «Свободы» и «Покоя» дают детальные наставления по медитации. Лонгченпа синтезировал Вима Ньингтиг и Кхандро Ньингтиг в «Ньингтиг Ябжи». Джигме Лингпа получил его передачу в видениях спустя 400 лет — линия живёт.',
    images: [
      { url: 'https://picsum.photos/seed/longchenpa01/600/375', caption: 'Семь Сокровищниц — Дзод Дун' },
      { url: 'https://picsum.photos/seed/longchenpa02/600/375', caption: 'Лонгченпа — Всезнающий мастер' },
    ],
    relatedNodes: ['nyingtik', 'longchen_nyingthig', 'jigme_lingpa', 'padmasambhava', 'vimalamitra']
  },

  {
    keywords: ['лонгчен ньингтиг', 'ньингтиг', 'джигме лингпа', 'сердечная сущность', 'longchen nyingthig'],
    targetNode: 'longchen_nyingthig',
    trail: ['longchenpa', 'jigme_lingpa', 'longchen_nyingthig'],
    title: 'Лонгчен Ньингтиг',
    thinking: ['Сердечная Сущность...', 'Терма из видений...', 'Ретрит в Чимпу...', 'Вима + Кхандро...'],
    content: 'Лонгчен Ньингтиг («Сердечная Сущность Безграничного Пространства») — цикл учений, открытый Джигме Лингпой (1730–1798) через серию видений Лонгченпы в трёхлетнем ретрите в Чимпу. Этот цикл объединяет две главные линии Ньингтига — Вима Ньингтиг (Вималамитры) и Кхандро Ньингтиг (Падмасамбхавы). С XVIII века — наиболее распространённый дзогченовский цикл; его нгондро используют практикующие по всему миру.',
    images: [
      { url: 'https://picsum.photos/seed/nyingthig01/600/375', caption: 'Джигме Лингпа получает передачу' },
      { url: 'https://picsum.photos/seed/nyingthig02/600/375', caption: 'Монастырь Чимпу — место ретрита' },
    ],
    relatedNodes: ['jigme_lingpa', 'longchenpa', 'nyingtik', 'terma', 'vimalamitra', 'padmasambhava']
  },

  {
    keywords: ['бардо', 'промежуточное состоян', 'после смерт', 'смерт', 'умирани', 'смерти'],
    targetNode: 'bardo',
    trail: ['osel', 'ground_luminosity', 'bardo'],
    title: 'Бардо — промежуточные состояния',
    thinking: ['Шесть бардо...', 'Материнский свет...', 'Встреча матери и дочери...', 'Узнать или нет...'],
    content: 'В Дзогчене выделяют шесть бардо: бодрствования, сновидений, медитации, момента смерти, дхарматы и становления. В момент смерти вспыхивает Светоносность Основания — «Материнский свет». Если практикующий узнаёт его (благодаря тому, что при жизни узнавал «дочерний свет» в практике), происходит освобождение — «встреча матери с дочерью». «Тибетская книга мёртвых» (Бардо Тходол) является дзогченовской термой, открытой тертоном Кармой Лингпой.',
    images: [
      { url: 'https://picsum.photos/seed/bardo01/600/375', caption: 'Чикай Бардо — Ясный свет в момент смерти' },
      { url: 'https://picsum.photos/seed/bardo02/600/375', caption: 'Чёньид Бардо — видения дхарматы' },
    ],
    relatedNodes: ['osel', 'ground_luminosity', 'dharmata', 'five_wisdoms', 'togal', 'rainbow_body']
  },

  {
    keywords: ['самоосвобожден', 'рангдрол', 'само освобожд', 'мысли освобожд', 'rang grol'],
    targetNode: 'rangdrol',
    trail: ['rigpa', 'trekcho', 'rangdrol'],
    title: 'Само-освобождение — Рангдрол',
    thinking: ['Как волна в море...', 'Не подавлять...', 'Не следовать...', 'Само уходит...'],
    content: 'Рангдрол («само собой освобождается») — ключевой принцип Дзогчена: мысли и эмоции при узнавании их природы освобождаются сами, без усилий и без отвержения. Три уровня самоосвобождения: как рисунок на воде (исчезает едва возникнув), как змея, распутывающая собственный узел, как вор в пустом доме (ни пользы, ни вреда). В состоянии ригпы любое переживание — боль, страх, гнев — само-освобождается, не оставляя следа.',
    images: [
      { url: 'https://picsum.photos/seed/rangdrol01/600/375', caption: 'Волна сама возвращается в море' },
      { url: 'https://picsum.photos/seed/rangdrol02/600/375', caption: 'Три уровня само-освобождения' },
    ],
    relatedNodes: ['rigpa', 'three_liberation_modes', 'trekcho', 'sems', 'nonduality']
  },

  {
    keywords: ['бон', 'чжан жунг', 'тонпа шенраб', 'бон дзогч', 'bon dzogchen'],
    targetNode: 'bon',
    trail: ['zhang_zhung', 'tenzin_wangyal', 'bon'],
    title: 'Дзогчен традиции Бон',
    thinking: ['Тонпа Шенраб...', 'Чжан Жунг Нянгьюд...', 'Параллельная линия...', 'Тапихрица...'],
    content: 'Бон — коренная духовная традиция Тибета с собственной линией Дзогчена. Бонский Дзогчен называется «Чжан Жунг Нянгьюд» (Устная Передача Чжан Жунга) и возводит линию к первобудде Тонпа Шенрабу, а не к Гарабу Дордже. Терминология и практика Бон-Дзогчена и буддийского Дзогчена почти идентичны. Современный мастер — Тензин Вангьял Ринпоче, основатель Ligmincha International.',
    images: [
      { url: 'https://picsum.photos/seed/bon01/600/375', caption: 'Традиция Бон — Тибет до буддизма' },
      { url: 'https://picsum.photos/seed/bon02/600/375', caption: 'Чжан Жунг — колыбель Бон-Дзогчена' },
    ],
    relatedNodes: ['zhang_zhung', 'tenzin_wangyal', 'nyingma', 'dzogchen', 'trekcho', 'togal']
  },

  {
    keywords: ['основани', 'гжи', 'три аспекта основ', 'почва бытия', 'gzhi'],
    targetNode: 'gzhi',
    trail: ['kadak', 'lhundrup', 'gzhi'],
    title: 'Основание — Гжи',
    thinking: ['До сансары и нирваны...', 'Три аспекта...', 'Нейтральная почва...', 'Узнать или нет...'],
    content: 'Основание (гжи) — изначальное состояние бытия, предшествующее как сансаре, так и нирване. Оно характеризуется тремя нераздельными аспектами: Сущность — изначальная чистота (кадаг), соответствующая дхармакае; Природа — спонтанное присутствие (лхундруп), соответствующее самбхогакае; Энергия — сострадание (тугдже), соответствующее нирманакае. Разница между буддой и существом в сансаре — только в том, узнали ли они Основание как своё изначальное лицо.',
    images: [
      { url: 'https://picsum.photos/seed/gzhi01/600/375', caption: 'Жи — почва всего бытия' },
      { url: 'https://picsum.photos/seed/gzhi02/600/375', caption: 'Три аспекта Основания' },
    ],
    relatedNodes: ['kadak', 'lhundrup', 'thugje', 'three_kayas', 'rigpa', 'dharmakaya']
  },

  {
    keywords: ['прямое введени', 'нгопрод', 'нготрод', 'указани на природу', 'pointing out'],
    targetNode: 'pointing_out',
    trail: ['garab_dorje', 'three_statements', 'pointing_out'],
    title: 'Прямое введение — Нгопрод',
    thinking: ['Мастер пребывает в ригпе...', 'Показать, не объяснить...', 'Первое утверждение...', 'Узнать прямо сейчас...'],
    content: 'Прямое введение (нго спрод па) — сердцевина дзогченовской передачи: реализованный мастер непосредственно указывает ученику на ригпу так, что тот её узнаёт. Это не теоретическое объяснение, а живая демонстрация — подобно тому как человеку, ищущему золото, просто показывают золото. Первое из Трёх Утверждений Гараба Дордже: «Прямое введение в собственную природу». После узнавания — второе утверждение: «Не оставаться ни в малейшем сомнении».',
    images: [
      { url: 'https://picsum.photos/seed/pointing01/600/375', caption: 'Учитель указывает на природу ума' },
      { url: 'https://picsum.photos/seed/pointing02/600/375', caption: 'Живая передача — ум к уму' },
    ],
    relatedNodes: ['garab_dorje', 'three_statements', 'rigpa', 'transmission', 'trekcho']
  },

  {
    keywords: ['кадаг', 'лхундруп', 'изначальная чистот', 'спонтанное присутств', 'ka dag', 'lhun grub'],
    targetNode: 'kadak',
    trail: ['gzhi', 'lhundrup', 'kadak'],
    title: 'Кадаг и Лхундруп — два аспекта ума',
    thinking: ['Пустота и ясность...', 'Два неразделимых аспекта...', 'Огонь и его тепло...', 'Трекчо и Тогал...'],
    content: 'Ка даг (изначальная чистота) и лхун груб (спонтанное присутствие) — два нераздельных аспекта Основания. Кадаг — пустотный аспект: природа ума изначально чиста и не может быть загрязнена. Лхундруп — ясностный аспект: все благие качества пробуждения нерукотворно присутствуют в этой самой пустоте. Нельзя разделить их — как огонь и его тепло. Трекчо работает с кадагом, Тогал работает с лхундрупом.',
    images: [
      { url: 'https://picsum.photos/seed/kadak01/600/375', caption: 'Кадаг — изначальная чистота' },
      { url: 'https://picsum.photos/seed/lhundrup01/600/375', caption: 'Лхундруп — спонтанное присутствие' },
    ],
    relatedNodes: ['gzhi', 'trekcho', 'togal', 'dharmakaya', 'sambhogakaya']
  },

  {
    keywords: ['падмасамбхав', 'гуру ринпоче', 'второй будда', 'padmasambhava', 'пема джунгне'],
    targetNode: 'padmasambhava',
    trail: ['vimalamitra', 'nyingma', 'padmasambhava'],
    title: 'Падмасамбхава — Гуру Ринпоче',
    thinking: ['Рождённый из Лотоса...', 'Второй Будда...', 'Тысячи терм...', 'Самье — первый монастырь...'],
    content: 'Падмасамбхава («Рождённый из Лотоса», Гуру Ринпоче) — «Второй Будда», принёсший тантрические учения и Дзогчен в Тибет в VIII веке. Он основал монастырь Самье и установил традицию Ньингма. Получив учения непосредственно от Шри Сингхи и Вималамитры, Падмасамбхава и его супруга Еше Цогьял спрятали тысячи терм по всему Тибету для раскрытия в нужное время. Дзогченовская линия его терм — «Кхандро Ньингтиг».',
    images: [
      { url: 'https://picsum.photos/seed/padma01/600/375', caption: 'Падмасамбхава — Гуру Ринпоче' },
      { url: 'https://picsum.photos/seed/padma02/600/375', caption: 'Монастырь Самье — первый в Тибете' },
    ],
    relatedNodes: ['yeshe_tsogyal', 'terma', 'nyingma', 'vimalamitra', 'longchen_nyingthig']
  },

  {
    keywords: ['пять мудрост', 'пять яд', 'пять клеш', 'еше нга', 'five wisdoms'],
    targetNode: 'five_wisdoms',
    trail: ['yeshe', 'dharmata', 'five_wisdoms'],
    title: 'Пять Мудростей и пять ядов',
    thinking: ['Пять клеш...', 'Трансформация...', 'Яды в мудрость...', 'Пять будд-дхьяни...'],
    content: 'Пять Мудростей (еше нга) возникают при очищении пяти клеш: неведение → Мудрость дхармадхату; гнев → Зерцалоподобная мудрость; гордость → Уравнивающая; страсть → Различающая; зависть → Всесвершающая. В дзогченовском понимании яды не уничтожаются, но узнаются как искажённые проявления мудростей — при узнавании ригпы они само-освобождаются обратно. Пять мудростей связаны с пятью буддами-дхьяни, пятью чистыми светами и пятью элементами.',
    images: [
      { url: 'https://picsum.photos/seed/wisdoms01/600/375', caption: 'Пять семейств будд — мандала' },
      { url: 'https://picsum.photos/seed/wisdoms02/600/375', caption: 'Пять ядов трансформируются в мудрость' },
    ],
    relatedNodes: ['yeshe', 'five_pure_lights', 'five_buddha_families', 'sambhogakaya', 'rangdrol', 'bardo']
  },

  {
    keywords: ['терма', 'скрытые сокровищ', 'тертон', 'учения-сокровищ', 'gter ma'],
    targetNode: 'terma',
    trail: ['padmasambhava', 'jigme_lingpa', 'terma'],
    title: 'Терма — скрытые сокровища',
    thinking: ['Спрятаны для будущего...', 'Тертоны — открыватели...', 'Земные и умственные...', 'Послание прошлых мастеров...'],
    content: 'Терма (тиб. gter ma) — духовные тексты и объекты, спрятанные Падмасамбхавой и Еше Цогьял для открытия в подходящее время тертонами («открывателями сокровищ»). Существуют земные термы (в физических местах) и умственные термы (раскрываются в уме тертона в медитации). Почти все крупные дзогченовские циклы являются термами: Лонгчен Ньингтиг (Джигме Лингпа), практики Дуджома Ринпоче, Бардо Тходол (Карма Лингпа). Традиция терма позволяет учениям оставаться живыми, а не архивными.',
    images: [
      { url: 'https://picsum.photos/seed/terma01/600/375', caption: 'Тертон открывает скрытые учения' },
      { url: 'https://picsum.photos/seed/terma02/600/375', caption: 'Терма — послание через века' },
    ],
    relatedNodes: ['padmasambhava', 'jigme_lingpa', 'longchen_nyingthig', 'bardo', 'dudjom_rinpoche']
  },

  {
    keywords: ['намкай норбу', 'дуджом', 'дилго', 'согьял', 'современн мастер', 'запад', 'западный'],
    targetNode: 'namkhai_norbu',
    trail: ['dilgo_khyentse', 'dudjom_rinpoche', 'namkhai_norbu'],
    title: 'Дзогчен на Западе',
    thinking: ['1976 год...', 'Дзогченовская Община...', 'Янтра-йога для Запада...', 'Три великих мастера...'],
    content: 'Три мастера принесли Дзогчен на Запад. Дуджом Ринпоче (1904–1987) — первый Верховный Глава Ньингмы в изгнании, санкционировал преподавание западным студентам. Дилго Кхьенце Ринпоче (1910–1991) — главный дзогченовский учитель XIV Далай-ламы, провёл 13 лет в пещерных ретритах. Намкай Норбу (1938–2018) с 1976 года систематически преподавал Дзогчен западным ученикам, создав мировую Дзогченовскую Общину и введя Янтра-йогу (трулкхор).',
    images: [
      { url: 'https://picsum.photos/seed/west01/600/375', caption: 'Намкай Норбу — первый учитель Запада' },
      { url: 'https://picsum.photos/seed/west02/600/375', caption: 'Дзогченовская Община по всему миру' },
    ],
    relatedNodes: ['dudjom_rinpoche', 'dilgo_khyentse', 'sogyal_rinpoche', 'nyingma', 'trulkhor']
  },

  {
    keywords: ['природа будды', 'татхагатагарбха', 'сугатагарбха', 'будда природа', 'tathagata'],
    targetNode: 'buddha_nature',
    trail: ['rigpa', 'gzhi', 'buddha_nature'],
    title: 'Природа Будды — Сугатагарбха',
    thinking: ['Уже присутствует...', 'Не нужно создавать...', 'Тождественна ригпе...', 'Снять покров неведения...'],
    content: 'Природа Будды (татхагатагарбха/сугатагарбха) в Дзогчене непосредственно тождественна ригпе — чистому недвойственному осознаванию. В отличие от ряда школ Махаяны, рассматривающих природу Будды как потенцию, Дзогчен утверждает: ригпа уже полностью пробуждена в потоке сознания каждого существа. Путь Дзогчена — не «строительство» пробуждения, но снятие покрова ма ригпа (неведения) с уже присутствующей природы будды через прямое введение и самоосвобождение.',
    images: [
      { url: 'https://picsum.photos/seed/buddhanature01/600/375', caption: 'Природа Будды — изначально присутствует' },
      { url: 'https://picsum.photos/seed/buddhanature02/600/375', caption: 'Ригпа тождественна природе будды' },
    ],
    relatedNodes: ['rigpa', 'gzhi', 'dharmakaya', 'ma_rigpa', 'pointing_out']
  },

];

const DEFAULT_RESPONSE = {
  targetNode: null,
  trail: [],
  title: 'Нить не найдена',
  thinking: ['Обхожу паутину...', 'Ищу нити...', 'Может, спросить иначе?'],
  content: 'Этот вопрос ведёт за пределы текущей паутины. Попробуй спросить: о Дзогчен, Ригпа, Трекчо, Тогал, Гараб Дордже, Лонгченпа, Бардо, Само-освобождении, Теле Радуги, Падмасамбхаве, Ясном свете или Природе Будды.',
  images: [],
  relatedNodes: ['dzogchen', 'rigpa', 'trekcho', 'garab_dorje']
};
