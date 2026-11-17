// @ts-check

/**
 * @typedef {Object} GlossaryEntry
 * @property {string} id
 * @property {string} term
 * @property {string} arabic
 * @property {string} literal
 * @property {"Teoria Modal" | "Fraseado & Forma" | "Ritmo (Iqa'at)" | "Anatomia & Luthieria" | "Graus Históricos"} category
 * @property {string} definition
 * @property {string} oudApplication
 */

/** @type {GlossaryEntry[]} */
export const GLOSSARY_ENTRIES = [
  // --- TEORIA MODAL ---
  {
    id: "maqam",
    term: "Maqam (pl. Maqamat)",
    arabic: "مَقَام",
    literal: "Posição, lugar ou estação",
    category: "Teoria Modal",
    definition: "Sistema modal da música clássica árabe, turca e do Oriente Médio. Vai além de uma simples escala: define um conjunto de notas (incluindo quartos de tom), hierarquia de repouso, pontos de modulação e comportamento melódico (Sayr).",
    oudApplication: "Mapeado no aplicativo com diferenciação entre subida (ascendente) e descida (descendente), respeitando os desvios tradicionais em cents."
  },
  {
    id: "jins",
    term: "Jins (pl. Ajnas)",
    arabic: "جِنْس",
    literal: "Gênero, espécie ou raiz",
    category: "Teoria Modal",
    definition: "Célula modal fundamental de 3 (tricorde), 4 (tetracorde) ou 5 notas (pentacorde). Os Maqamat são construídos encadeando dois ou mais Ajnas.",
    oudApplication: "Use a 'Lente de Tetracordes' no painel modal para isolar o 1º Jins (base) e o 2º Jins (superior) e treinar modulações."
  },
  {
    id: "qarar",
    term: "Qarar",
    arabic: "قَرَار",
    literal: "Repouso, estabilidade, fundo",
    category: "Teoria Modal",
    definition: "A nota tônica ou centro gravitacional de repouso final de um Maqam ou Jins. Também designa a oitava grave de uma nota.",
    oudApplication: "Representado pelos medalhões em rubi no espelho e sustentado continuamente quando você ativa o botão 'Drone'."
  },
  {
    id: "ghammaz",
    term: "Ghammaz",
    arabic: "غَمَّاز",
    literal: "Piscadela, sinalizador, pivô",
    category: "Teoria Modal",
    definition: "A nota dominante secundária e principal ponto de articulação onde termina o 1º Jins e começa o 2º Jins (geralmente o 4º ou 5º grau do Maqam).",
    oudApplication: "Destacado em âmbar/ouro no espelho; serve como trampolim para modular para outros Maqamat durante o improviso."
  },
  {
    id: "sikah_interval",
    term: "Quarto de Tom (Rub' al-Ton)",
    arabic: "رُبْع التُّون",
    literal: "Quarto de tom / Nota neutra",
    category: "Teoria Modal",
    definition: "Microtonalidade característica situada entre o semitom e o tom inteiro (aproximadamente 50 cents, frequentemente ajustada entre -15 e +15 cents conforme a escola regional).",
    oudApplication: "Representado pelas estrelas octogonais em ametista e madrepérola (Sadaf) nas posições ímpares da grade 24-TET."
  },

  // --- FRASEADO & FORMA ---
  {
    id: "sayr",
    term: "Sayr",
    arabic: "سَيْر",
    literal: "Caminho, marcha, percurso",
    category: "Fraseado & Forma",
    definition: "O roteiro melódico tradicional de um Maqam: por qual grau ele costuma começar, quais notas enfatiza, como contorna os microtons e como desce até o repouso.",
    oudApplication: "Visualizado pelas trilhas vetoriais douradas (① → ② → ③) que conectam as notas diretamente no braço do Oud."
  },
  {
    id: "taqsim",
    term: "Taqsim (pl. Taqasim)",
    arabic: "تَقْسِيم",
    literal: "Divisão, distribuição",
    category: "Fraseado & Forma",
    definition: "Improvisação instrumental solo, geralmente sem pulso métrico rígido (rubato), na qual o músico explora a alma de um Maqam, modula por diferentes Ajnas e retorna à tônica.",
    oudApplication: "O botão 'Ouvir Taqsim' executa exemplos fraseológicos com dinâmica e rubato característicos de cada Maqam."
  },
  {
    id: "istihlal",
    term: "Istihlal",
    arabic: "اِسْتِهْلَال",
    literal: "Abertura, aparição da lua nova",
    category: "Fraseado & Forma",
    definition: "A frase introdutória de um Taqsim ou composição, responsável por apresentar imediatamente a identidade sonora e o 1º Jins do Maqam ao ouvinte.",
    oudApplication: "Corresponde à 'Frase 1 (Istihlal)' no seletor de frases de Sayr."
  },
  {
    id: "qafla",
    term: "Qafla",
    arabic: "قَفْلَة",
    literal: "Fechadura, fechamento, cadência",
    category: "Fraseado & Forma",
    definition: "Fórmula cadencial melódica ou harmônica que encerra uma frase musical ou todo um Taqsim, trazendo sensação definitiva de resolução no Qarar.",
    oudApplication: "Dá nome à aba 'Cadências (Qafla)', onde você pode estudar e rasguear progressões modais de resolução passo a passo."
  },

  // --- RITMO (IQA'AT) ---
  {
    id: "iqa",
    term: "Iqa' (pl. Iqa'at)",
    arabic: "إِيقَاع",
    literal: "Cadência rítmica, ciclo",
    category: "Ritmo (Iqa'at)",
    definition: "Sistema de ciclos rítmicos da música árabe e otomana, estruturado pela alternância entre batidas graves (Dum), agudas (Tak) e pausas (Es).",
    oudApplication: "Controlado no painel 'Mizan al-Iqa', com síntese de Darbuka e Riq para acompanhar seus estudos."
  },
  {
    id: "dum_tak",
    term: "Dum, Tak & Es",
    arabic: "دُمّ • تَكّ • إِسّ",
    literal: "Grave • Agudo • Silêncio",
    category: "Ritmo (Iqa'at)",
    definition: "Dum é o golpe profundo no centro da pele (marca os tempos estruturais); Tak é o golpe seco e estalado na borda; Es representa a pausa que dá respiro e balanço (swing) ao ciclo.",
    oudApplication: "Exibidos na grade luminosa do motor rítmico: vermelho para Dum, turquesa para Tak/Kah e pontos para Es."
  },
  {
    id: "samai_aqsaq",
    term: "Samai Thaqil & Aqsaq",
    arabic: "سَمَاعِي ثَقِيل • أَقْصَق",
    literal: "Samai pesado (10/8) • Mancando (9/8)",
    category: "Ritmo (Iqa'at)",
    definition: "Ciclos rítmicos assimétricos clássicos do repertório instrumental levantino e turco. O Samai divide 10 tempos em (3+2+2+3) e o Aqsaq divide 9 tempos em (2+2+2+3).",
    oudApplication: "Disponíveis no seletor de Iqa'at para treinar independência rítmica e fraseado assimétrico no Oud."
  },

  // --- ANATOMIA & LUTHIERIA ---
  {
    id: "risha",
    term: "Risha",
    arabic: "رِيشَة",
    literal: "Pena (originalmente de águia)",
    category: "Anatomia & Luthieria",
    definition: "Palheta longa e flexível utilizada para tanger as cordas duplas do Oud, permitindo ataques precisos, trêmulos (fard) e nuances dinâmicas.",
    oudApplication: "Simulada no motor de áudio ao rasguear acordes e executar os ataques de corda dupla."
  },
  {
    id: "shamsiyya",
    term: "Shamsiyya",
    arabic: "شَمْسِيَّة",
    literal: "Solar, pequeno sol",
    category: "Anatomia & Luthieria",
    definition: "A roseta acústica esculpida no tampo harmônico do Oud com padrões geométricos entrelaçados, projetada tanto para projeção sonora quanto para beleza estética.",
    oudApplication: "Renderizada no bojo do instrumento; clicar sobre ela dispara a execução da escala ou acorde ativo."
  },
  {
    id: "raqma",
    term: "Raqma",
    arabic: "رَقْمَة",
    literal: "Placa, escudo protetor",
    category: "Anatomia & Luthieria",
    definition: "Lâmina de madeira dura, casco ou madrepérola incrustada no tampo logo abaixo das cordas para proteger o abeto/cedro contra o atrito da Risha.",
    oudApplication: "Visível entre o final do espelho e a roseta central, variando de cor conforme a tradição (Damasco, Cairo ou Istambul)."
  },
  {
    id: "sadaf_khatem",
    term: "Sadaf & Khatem",
    arabic: "صَدَف • خَاتَم",
    literal: "Madrepérola • Anel / Marchetaria",
    category: "Anatomia & Luthieria",
    definition: "Sadaf é a madrepérola iridescente usada nas incrustações; Khatem são os filetes geométricos de madeira e osso que emolduram o bojo e o espelho.",
    oudApplication: "Inspiram as bordas tracejadas da interface e os marcadores de quarto de tom no espelho."
  },
  {
    id: "anf_bajak",
    term: "Anf & Bajak",
    arabic: "أَنْف • بَنْجَق",
    literal: "Nariz (Pestana) • Cravelhal",
    category: "Anatomia & Luthieria",
    definition: "Anf é a pestana (geralmente de osso ou marfim) que delimita o comprimento vibrante das cordas; Bajak é o cravelhal inclinado para trás que abriga as cravelhas de fricção.",
    oudApplication: "Representados no início do braço (ponto 0q), onde ficam os rótulos das afinações e os sinais '✕' de cordas abafadas."
  },

  // --- GRAUS HISTÓRICOS ---
  {
    id: "arabic_degrees",
    term: "Nomes Persa-Árabes das Notas",
    arabic: "رَاسْت • دُوكَاه • سِيكَاه • نَوَى",
    literal: "Rast (C), Dukah (D), Sikah (Eb-), Nawa (G)",
    category: "Graus Históricos",
    definition: "Nomenclatura tradicional de cada grau da escala fundamental: Rast (C), Dukah (D), Sikah (Eb-), Jaharkah (F), Nawa (G), Husayni (A), Awj (Bb-) e Mahur (B).",
    oudApplication: "Selecione 'Nome Árabe' no menu 'Inscrição' da barra do instrumento para exibir esses nomes dentro das joias."
  }
];
