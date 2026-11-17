// @ts-check

/**
 * @typedef {Object} PitchClass24
 * @property {number} q - Índice 0..23 na grade de 24 quartos de tom
 * @property {string} sharp
 * @property {string} flat
 * @property {string} arabic
 * @property {boolean} micro
 */

/**
 * @typedef {Object} SayrPhrase
 * @property {string} title
 * @property {string} summary
 * @property {{ interval_q: number, dur_ms: number, accent?: boolean }[]} steps
 */

/** @type {PitchClass24[]} */
export const PITCH_CLASSES_24 = [
  { q: 0,  sharp: "C",   flat: "C",   arabic: "Rast",       micro: false },
  { q: 1,  sharp: "C+",  flat: "Db-", arabic: "Nim Rahawi", micro: true  },
  { q: 2,  sharp: "C#",  flat: "Db",  arabic: "Zirgulah",   micro: false },
  { q: 3,  sharp: "C#+", flat: "D-",  arabic: "Tik Zirg.",  micro: true  },
  { q: 4,  sharp: "D",   flat: "D",   arabic: "Dukah",      micro: false },
  { q: 5,  sharp: "D+",  flat: "Eb-", arabic: "Sikah",      micro: true  },
  { q: 6,  sharp: "D#",  flat: "Eb",  arabic: "Kurdi",      micro: false },
  { q: 7,  sharp: "D#+", flat: "E-",  arabic: "Tik Kurdi",  micro: true  },
  { q: 8,  sharp: "E",   flat: "E",   arabic: "Busalik",    micro: false },
  { q: 9,  sharp: "E+",  flat: "F-",  arabic: "Tik Bus.",   micro: true  },
  { q: 10, sharp: "F",   flat: "F",   arabic: "Jaharkah",   micro: false },
  { q: 11, sharp: "F+",  flat: "Gb-", arabic: "Nim Hijaz",  micro: true  },
  { q: 12, sharp: "F#",  flat: "Gb",  arabic: "Hijaz",      micro: false },
  { q: 13, sharp: "F#+", flat: "G-",  arabic: "Tik Hijaz",  micro: true  },
  { q: 14, sharp: "G",   flat: "G",   arabic: "Nawa",       micro: false },
  { q: 15, sharp: "G+",  flat: "Ab-", arabic: "Nim Hisar",  micro: true  },
  { q: 16, sharp: "G#",  flat: "Ab",  arabic: "Hisar",      micro: false },
  { q: 17, sharp: "G#+", flat: "A-",  arabic: "Tik Hisar",  micro: true  },
  { q: 18, sharp: "A",   flat: "A",   arabic: "Husayni",    micro: false },
  { q: 19, sharp: "A+",  flat: "Bb-", arabic: "Awj / Iraq", micro: true  },
  { q: 20, sharp: "A#",  flat: "Bb",  arabic: "Ajam",       micro: false },
  { q: 21, sharp: "A#+", flat: "B-",  arabic: "Tik Ajam",   micro: true  },
  { q: 22, sharp: "B",   flat: "B",   arabic: "Mahur",      micro: false },
  { q: 23, sharp: "B+",  flat: "C-",  arabic: "Tik Mahur",  micro: true  }
];

export const TRADITION_PALETTES = {
  damascus: {
    soundboard: "#9e6336",
    soundboardEdge: "#5c3418",
    ebony: "#13100e",
    raqma: "#33120a",
    rosetteRing: "#d4af37",
    sadaf: "#e0f2fe",
    inlayStripe: "#67e8f9"
  },
  cairo: {
    soundboard: "#b86b35",
    soundboardEdge: "#703814",
    ebony: "#1a110d",
    raqma: "#4f140a",
    rosetteRing: "#eab308",
    sadaf: "#fef3c7",
    inlayStripe: "#f59e0b"
  },
  istanbul: {
    soundboard: "#dfc295",
    soundboardEdge: "#9c7a49",
    ebony: "#12151a",
    raqma: "#2b1712",
    rosetteRing: "#cda349",
    sadaf: "#f8fafc",
    inlayStripe: "#94a3b8"
  }
};

export const DB = {
  tunings: [
    {
      id: "syrian_arabic_c_c",
      name: "Árabe / Síria Padrão (C - F - A - d - g - c)",
      description: "Quatro ordens agudas em Quartas Justas (A-d-g-c), salto de Terça Maior entre F e A, e bordão grave em C.",
      courses: [
        { course: 1, label: "1ª (c4)", abs_q: 48, freq_hz: 261.63 },
        { course: 2, label: "2ª (g3)", abs_q: 38, freq_hz: 196.00 },
        { course: 3, label: "3ª (d3)", abs_q: 28, freq_hz: 146.83 },
        { course: 4, label: "4ª (A2)", abs_q: 18, freq_hz: 110.00 },
        { course: 5, label: "5ª (F2)", abs_q: 10, freq_hz: 87.31 },
        { course: 6, label: "6ª (C2)", abs_q: 0,  freq_hz: 65.41 }
      ]
    },
    {
      id: "arabic_classic_f_f",
      name: "Árabe Clássica (F - A - d - g - c - f)",
      description: "Afinação tradicional com 1ª corda aguda em F4 e 6ª corda em F2.",
      courses: [
        { course: 1, label: "1ª (f4)", abs_q: 58, freq_hz: 349.23 },
        { course: 2, label: "2ª (c4)", abs_q: 48, freq_hz: 261.63 },
        { course: 3, label: "3ª (g3)", abs_q: 38, freq_hz: 196.00 },
        { course: 4, label: "4ª (d3)", abs_q: 28, freq_hz: 146.83 },
        { course: 5, label: "5ª (A2)", abs_q: 18, freq_hz: 110.00 },
        { course: 6, label: "6ª (F2)", abs_q: 10, freq_hz: 87.31 }
      ]
    },
    {
      id: "arabic_d_c",
      name: "Árabe Egípcia (D - G - A - d - g - c)",
      description: "Bordões graves em D2 e G2 para ressonância simpática em Maqamat com tônica em D (Bayati, Saba, Hijaz, Kurd).",
      courses: [
        { course: 1, label: "1ª (c4)", abs_q: 48, freq_hz: 261.63 },
        { course: 2, label: "2ª (g3)", abs_q: 38, freq_hz: 196.00 },
        { course: 3, label: "3ª (d3)", abs_q: 28, freq_hz: 146.83 },
        { course: 4, label: "4ª (A2)", abs_q: 18, freq_hz: 110.00 },
        { course: 5, label: "5ª (G2)", abs_q: 14, freq_hz: 98.00 },
        { course: 6, label: "6ª (D2)", abs_q: 4,  freq_hz: 73.42 }
      ]
    },
    {
      id: "turkish_d_a",
      name: "Turca / Grega Padrão (D - E - A - B - e - a)",
      description: "Afinação 1 tom acima do padrão clássico, com intervalo de 2ª Maior entre B-A e E-D nas graves.",
      courses: [
        { course: 1, label: "1ª (a3)", abs_q: 42, freq_hz: 220.00 },
        { course: 2, label: "2ª (e3)", abs_q: 32, freq_hz: 164.81 },
        { course: 3, label: "3ª (B2)", abs_q: 22, freq_hz: 123.47 },
        { course: 4, label: "4ª (A2)", abs_q: 18, freq_hz: 110.00 },
        { course: 5, label: "5ª (E2)", abs_q: 8,  freq_hz: 82.41 },
        { course: 6, label: "6ª (D2)", abs_q: 4,  freq_hz: 73.42 }
      ]
    },
    {
      id: "iraqi_bashir",
      name: "Iraquiana / Mounir Bashir (C - D - G - c - f - f')",
      description: "Foco em quartas justas da 5ª à 2ª corda e oitava aguda ressonante em F4.",
      courses: [
        { course: 1, label: "1ª (f4)", abs_q: 58, freq_hz: 349.23 },
        { course: 2, label: "2ª (f3)", abs_q: 34, freq_hz: 174.61 },
        { course: 3, label: "3ª (c3)", abs_q: 24, freq_hz: 130.81 },
        { course: 4, label: "4ª (G2)", abs_q: 14, freq_hz: 98.00 },
        { course: 5, label: "5ª (D2)", abs_q: 4,  freq_hz: 73.42 },
        { course: 6, label: "6ª (C2)", abs_q: 0,  freq_hz: 65.41 }
      ]
    }
  ],

  ajnas: [
    { id: "jins_rast", name: "Jins Rast (Tetracorde)", traditional_root_q: 0, intervals_q: [0, 4, 7, 10], cents_dev: [0, 0, -15, 0], degrees: ["1", "2", "3-", "4"], ghammaz_q: 10, description: "Tetracorde fundamental da família Rast, caracterizado pela 3ª neutra (Sikah ~335 cents)." },
    { id: "jins_bayati", name: "Jins Bayati (Tetracorde)", traditional_root_q: 4, intervals_q: [0, 3, 6, 10], cents_dev: [0, -15, 0, 0], degrees: ["1", "2-", "b3", "4"], ghammaz_q: 10, description: "Tetracorde lírico e central na música árabe, iniciando com intervalo de 3/4 de tom." },
    { id: "jins_sikah", name: "Jins Sikah (Tricorde)", traditional_root_q: 5, intervals_q: [0, 3, 7], cents_dev: [+15, 0, 0], degrees: ["1", "2", "3"], ghammaz_q: 7, description: "Tricorde cuja própria tônica repousa sobre uma nota microtonal (Eb-)." },
    { id: "jins_hijaz", name: "Jins Hijaz (Tetracorde)", traditional_root_q: 4, intervals_q: [0, 2, 8, 10], cents_dev: [0, +10, -10, 0], degrees: ["1", "b2", "3", "4"], ghammaz_q: 10, description: "Tetracorde com salto expressivo de 2ª aumentada (6 quartos de tom) entre o 2º e 3º graus." },
    { id: "jins_saba", name: "Jins Saba (Tetracorde Diminuto)", traditional_root_q: 4, intervals_q: [0, 3, 6, 8], cents_dev: [0, -15, 0, 0], degrees: ["1", "2-", "b3", "b4"], ghammaz_q: 6, description: "Tetracorde comprimido (4ª diminuta no 4º grau), com Ghammaz no 3º grau." },
    { id: "jins_kurd", name: "Jins Kurd (Tetracorde)", traditional_root_q: 4, intervals_q: [0, 2, 6, 10], cents_dev: [0, 0, 0, 0], degrees: ["1", "b2", "b3", "4"], ghammaz_q: 10, description: "Tetracorde sem quartos de tom (Semitom - Tom - Tom), idêntico ao tetracorde Frígio." },
    { id: "jins_nahawand", name: "Jins Nahawand (Tetracorde)", traditional_root_q: 0, intervals_q: [0, 4, 6, 10], cents_dev: [0, 0, 0, 0], degrees: ["1", "2", "b3", "4"], ghammaz_q: 10, description: "Tetracorde menor ocidental (Tom - Semitom - Tom)." },
    { id: "jins_ajam", name: "Jins Ajam (Tetracorde)", traditional_root_q: 20, intervals_q: [0, 4, 8, 10], cents_dev: [0, 0, 0, 0], degrees: ["1", "2", "3", "4"], ghammaz_q: 10, description: "Tetracorde maior ocidental (Tom - Tom - Semitom)." },
    { id: "jins_nikriz", name: "Jins Nikriz (Pentacorde)", traditional_root_q: 0, intervals_q: [0, 4, 6, 12, 14], cents_dev: [0, 0, 0, 0, 0], degrees: ["1", "2", "b3", "#4", "5"], ghammaz_q: 14, description: "Pentacorde menor com salto de 2ª aumentada entre b3 e #4." },
    { id: "jins_athar_kurd", name: "Jins Athar Kurd (Pentacorde)", traditional_root_q: 0, intervals_q: [0, 2, 6, 12, 14], cents_dev: [0, 0, 0, 0, 0], degrees: ["1", "b2", "b3", "#4", "5"], ghammaz_q: 14, description: "Combinação híbrida de Jins Kurd na base com salto de #4 do Nikriz." }
  ],

  maqamat: [
    {
      id: "maqam_rast", name: "Maqam Rast", traditional_root_q: 0, linked_cadence: "cad_rast",
      lower_jins: "Jins Rast (no 1º grau)", upper_jins_asc: "Jins Rast (no 5º grau)", upper_jins_desc: "Jins Nahawand (no 5º grau)",
      intervals_asc: [0, 4, 7, 10, 14, 18, 21, 24], intervals_desc: [0, 4, 7, 10, 14, 18, 20, 24],
      degrees_asc: ["1", "2", "3-", "4", "5", "6", "7-", "8"], degrees_desc: ["1", "2", "3-", "4", "5", "6", "b7", "8"],
      cents_dev: { 7: -15, 21: -15 }, ghammaz_q: 14, lower_limit_q: 10,
      description: "O pilar central do sistema de Maqamat. Usa 7ª neutra (Awj) na subida e 7ª menor (Ajam) na descida.",
      sayr_phrases: [
        {
          title: "1. Istihlal — Afirmação do Qarar e 3ª Neutra (Sikah)",
          summary: "Inicia no Qarar (1), sobe até o 5º grau (Ghammaz) passando pelo Sikah (3-) e repousa na tônica.",
          steps: [
            { interval_q: 0, dur_ms: 420 }, { interval_q: 4, dur_ms: 280 }, { interval_q: 7, dur_ms: 360 },
            { interval_q: 10, dur_ms: 260 }, { interval_q: 14, dur_ms: 520, accent: true },
            { interval_q: 10, dur_ms: 260 }, { interval_q: 7, dur_ms: 340 }, { interval_q: 4, dur_ms: 260 }, { interval_q: 0, dur_ms: 750, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Desenvolvimento no 5º Grau (Nawa) e Awj (7-)",
          summary: "Explora o Jins Rast superior atingindo a 7ª neutra (7-) e a oitava antes de apoiar no Ghammaz (5).",
          steps: [
            { interval_q: 14, dur_ms: 400, accent: true }, { interval_q: 18, dur_ms: 280 }, { interval_q: 21, dur_ms: 360 },
            { interval_q: 24, dur_ms: 520, accent: true }, { interval_q: 21, dur_ms: 280 }, { interval_q: 18, dur_ms: 280 },
            { interval_q: 14, dur_ms: 680, accent: true }
          ]
        },
        {
          title: "3. Qafla — Cadência Descendente com b7 (Ajam)",
          summary: "Substitui a 7ª neutra pela 7ª menor (b7 / Jins Nahawand) na descida e crava a resolução via 3- → 2 → 1.",
          steps: [
            { interval_q: 20, dur_ms: 420, accent: true }, { interval_q: 18, dur_ms: 260 }, { interval_q: 14, dur_ms: 360 },
            { interval_q: 10, dur_ms: 260 }, { interval_q: 7, dur_ms: 380 }, { interval_q: 4, dur_ms: 280 },
            { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_bayati", name: "Maqam Bayati", traditional_root_q: 4, linked_cadence: "cad_bayati",
      lower_jins: "Jins Bayati (no 1º grau)", upper_jins_asc: "Jins Nahawand (no 4º grau)", upper_jins_desc: "Jins Nahawand (no 4º grau)",
      intervals_asc: [0, 3, 6, 10, 14, 16, 20, 24], intervals_desc: [0, 3, 6, 10, 14, 16, 20, 24],
      degrees_asc: ["1", "2-", "b3", "4", "5", "b6", "b7", "8"], degrees_desc: ["1", "2-", "b3", "4", "5", "b6", "b7", "8"],
      cents_dev: { 3: -15 }, ghammaz_q: 10, lower_limit_q: 10,
      description: "Maqam profundamente expressivo baseado em D (Dukah), com 2º grau microtonal (Eb-) e Ghammaz no 4º grau (G).",
      sayr_phrases: [
        {
          title: "1. Istihlal — Assinatura do 2º Grau Neutro (2-)",
          summary: "Flutua entre a tônica (1), a 2ª neutra (2-) e a 3ª menor (b3), afirmando a intimidade do Jins Bayati.",
          steps: [
            { interval_q: 0, dur_ms: 400 }, { interval_q: 3, dur_ms: 360 }, { interval_q: 6, dur_ms: 340 },
            { interval_q: 3, dur_ms: 280 }, { interval_q: 6, dur_ms: 280 }, { interval_q: 10, dur_ms: 480, accent: true },
            { interval_q: 6, dur_ms: 260 }, { interval_q: 3, dur_ms: 320 }, { interval_q: 0, dur_ms: 750, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Pivô no 4º Grau (Jins Nahawand)",
          summary: "Salta para o Ghammaz (4), desenvolve o tetracorde menor superior até b7 e retorna ao 4º grau.",
          steps: [
            { interval_q: 10, dur_ms: 420, accent: true }, { interval_q: 14, dur_ms: 300 }, { interval_q: 16, dur_ms: 340 },
            { interval_q: 20, dur_ms: 460, accent: true }, { interval_q: 16, dur_ms: 280 }, { interval_q: 14, dur_ms: 300 },
            { interval_q: 10, dur_ms: 680, accent: true }
          ]
        },
        {
          title: "3. Qafla — Resolução Tradicional de Bayati",
          summary: "Desce do 5º grau pelo Ghammaz (4), toca b3 e 2- com leve rubato e repousa no Qarar.",
          steps: [
            { interval_q: 14, dur_ms: 380 }, { interval_q: 10, dur_ms: 340, accent: true }, { interval_q: 6, dur_ms: 300 },
            { interval_q: 3, dur_ms: 420 }, { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_saba", name: "Maqam Saba", traditional_root_q: 4, linked_cadence: "cad_saba",
      lower_jins: "Jins Saba (no 1º grau)", upper_jins_asc: "Jins Hijaz (no 3º grau)", upper_jins_desc: "Jins Hijaz (no 3º grau)",
      intervals_asc: [0, 3, 6, 8, 14, 16, 20, 22], intervals_desc: [0, 3, 6, 8, 14, 16, 20, 22],
      degrees_asc: ["1", "2-", "b3", "b4", "5", "b6", "b7", "b8"], degrees_desc: ["1", "2-", "b3", "b4", "5", "b6", "b7", "b8"],
      cents_dev: { 3: -15 }, ghammaz_q: 6, lower_limit_q: 8,
      description: "Conhecido pela atmosfera melancólica e espiritual; não fecha na oitava justa no primeiro tetracorde (possui 4ª diminuta).",
      sayr_phrases: [
        {
          title: "1. Istihlal — Tensão da 4ª Diminuta (b4)",
          summary: "Expõe o núcleo comprimido 1 – 2- – b3 – b4, destacando a sensível descendente b4 sobre o Ghammaz b3.",
          steps: [
            { interval_q: 0, dur_ms: 420 }, { interval_q: 3, dur_ms: 340 }, { interval_q: 6, dur_ms: 420, accent: true },
            { interval_q: 8, dur_ms: 460 }, { interval_q: 6, dur_ms: 360, accent: true }, { interval_q: 3, dur_ms: 340 },
            { interval_q: 0, dur_ms: 780, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Jins Hijaz no 3º Grau (b3)",
          summary: "A partir do Ghammaz (b3), sobe pelo salto característico b4 → 5 → b6.",
          steps: [
            { interval_q: 6, dur_ms: 420, accent: true }, { interval_q: 8, dur_ms: 280 }, { interval_q: 14, dur_ms: 420, accent: true },
            { interval_q: 16, dur_ms: 360 }, { interval_q: 14, dur_ms: 300 }, { interval_q: 8, dur_ms: 280 },
            { interval_q: 6, dur_ms: 660, accent: true }
          ]
        },
        {
          title: "3. Qafla — Repouso Dramático no Qarar",
          summary: "Contorna o Ghammaz (b3) e desliza pela 2ª neutra (2-) até a tônica.",
          steps: [
            { interval_q: 8, dur_ms: 420 }, { interval_q: 6, dur_ms: 360, accent: true }, { interval_q: 3, dur_ms: 420 },
            { interval_q: 0, dur_ms: 850, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_hijaz", name: "Maqam Hijaz", traditional_root_q: 4, linked_cadence: "cad_hijaz",
      lower_jins: "Jins Hijaz (no 1º grau)", upper_jins_asc: "Jins Rast (no 4º grau)", upper_jins_desc: "Jins Nahawand (no 4º grau)",
      intervals_asc: [0, 2, 8, 10, 14, 17, 20, 24], intervals_desc: [0, 2, 8, 10, 14, 16, 20, 24],
      degrees_asc: ["1", "b2", "3", "4", "5", "6-", "b7", "8"], degrees_desc: ["1", "b2", "3", "4", "5", "b6", "b7", "8"],
      cents_dev: { 17: -15 }, ghammaz_q: 10, lower_limit_q: 10,
      description: "Combina Jins Hijaz inferior com Jins Rast na subida (com 6ª neutra) e Jins Nahawand na descida.",
      sayr_phrases: [
        {
          title: "1. Istihlal — O Salto de 2ª Aumentada (b2 ↔ 3)",
          summary: "Enfatiza a tensão expressiva entre b2 e a 3ª maior, resolvendo no Ghammaz (4) e voltando ao Qarar.",
          steps: [
            { interval_q: 0, dur_ms: 400 }, { interval_q: 2, dur_ms: 300 }, { interval_q: 8, dur_ms: 420, accent: true },
            { interval_q: 10, dur_ms: 520, accent: true }, { interval_q: 8, dur_ms: 300 }, { interval_q: 2, dur_ms: 320 },
            { interval_q: 0, dur_ms: 760, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Subida com Jins Rast (6ª Neutra)",
          summary: "Do Ghammaz (4), sobe para o 5º grau e toca a 6ª neutra (6-) rumo ao b7.",
          steps: [
            { interval_q: 10, dur_ms: 400, accent: true }, { interval_q: 14, dur_ms: 300 }, { interval_q: 17, dur_ms: 380 },
            { interval_q: 20, dur_ms: 480, accent: true }, { interval_q: 17, dur_ms: 300 }, { interval_q: 14, dur_ms: 300 },
            { interval_q: 10, dur_ms: 660, accent: true }
          ]
        },
        {
          title: "3. Qafla — Descida com b6 (Nahawand) → b2 → 1",
          summary: "Usa b6 na descida, atravessa o intervalo característico 3 → b2 e fecha na tônica.",
          steps: [
            { interval_q: 16, dur_ms: 380 }, { interval_q: 14, dur_ms: 300 }, { interval_q: 10, dur_ms: 360, accent: true },
            { interval_q: 8, dur_ms: 300 }, { interval_q: 2, dur_ms: 380 }, { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_nahawand", name: "Maqam Nahawand", traditional_root_q: 0, linked_cadence: "cad_nahawand",
      lower_jins: "Jins Nahawand (no 1º grau)", upper_jins_asc: "Jins Hijaz (no 5º grau)", upper_jins_desc: "Jins Kurd (no 5º grau)",
      intervals_asc: [0, 4, 6, 10, 14, 16, 22, 24], intervals_desc: [0, 4, 6, 10, 14, 16, 20, 24],
      degrees_asc: ["1", "2", "b3", "4", "5", "b6", "7", "8"], degrees_desc: ["1", "2", "b3", "4", "5", "b6", "b7", "8"],
      cents_dev: {}, ghammaz_q: 14, lower_limit_q: 10,
      description: "Isento de quartos de tom; alterna entre Menor Harmônica (ascendente) e Eólio/Menor Natural (descendente).",
      sayr_phrases: [
        {
          title: "1. Istihlal — Clareza do Tetracorde Menor",
          summary: "Desenha o arpejo lírico 1 – b3 – 5 e repousa sobre a 3ª menor e a tônica.",
          steps: [
            { interval_q: 0, dur_ms: 380 }, { interval_q: 4, dur_ms: 260 }, { interval_q: 6, dur_ms: 360 },
            { interval_q: 10, dur_ms: 280 }, { interval_q: 14, dur_ms: 520, accent: true }, { interval_q: 10, dur_ms: 260 },
            { interval_q: 6, dur_ms: 320 }, { interval_q: 4, dur_ms: 260 }, { interval_q: 0, dur_ms: 750, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Jins Hijaz no 5º Grau (Sensível 7)",
          summary: "A partir do 5º grau, destaca o salto b6 → 7 resolvendo brilhantemente na oitava.",
          steps: [
            { interval_q: 14, dur_ms: 400, accent: true }, { interval_q: 16, dur_ms: 280 }, { interval_q: 22, dur_ms: 380 },
            { interval_q: 24, dur_ms: 560, accent: true }, { interval_q: 22, dur_ms: 280 }, { interval_q: 16, dur_ms: 300 },
            { interval_q: 14, dur_ms: 660, accent: true }
          ]
        },
        {
          title: "3. Qafla — Descida Natural com b7",
          summary: "Relaxa a sensível para b7 na descida e encerra no Qarar.",
          steps: [
            { interval_q: 20, dur_ms: 380 }, { interval_q: 16, dur_ms: 280 }, { interval_q: 14, dur_ms: 360, accent: true },
            { interval_q: 10, dur_ms: 260 }, { interval_q: 6, dur_ms: 320 }, { interval_q: 4, dur_ms: 260 },
            { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_kurd", name: "Maqam Kurd", traditional_root_q: 4, linked_cadence: "cad_kurd",
      lower_jins: "Jins Kurd (no 1º grau)", upper_jins_asc: "Jins Nahawand (no 4º grau)", upper_jins_desc: "Jins Nahawand (no 4º grau)",
      intervals_asc: [0, 2, 6, 10, 14, 16, 20, 24], intervals_desc: [0, 2, 6, 10, 14, 16, 20, 24],
      degrees_asc: ["1", "b2", "b3", "4", "5", "b6", "b7", "8"], degrees_desc: ["1", "b2", "b3", "4", "5", "b6", "b7", "8"],
      cents_dev: {}, ghammaz_q: 10, lower_limit_q: 10,
      description: "Equivalente estrutural ao Modo Frígio, articulado entre Jins Kurd (D) e Jins Nahawand (G).",
      sayr_phrases: [
        {
          title: "1. Istihlal — Apojatura Frígia (b2 → 1)",
          summary: "Inicia afirmando o 4º grau (Ghammaz) e desce pelo b3 e b2 (Kurdi) até a tônica.",
          steps: [
            { interval_q: 0, dur_ms: 360 }, { interval_q: 6, dur_ms: 320 }, { interval_q: 10, dur_ms: 500, accent: true },
            { interval_q: 6, dur_ms: 280 }, { interval_q: 2, dur_ms: 380 }, { interval_q: 0, dur_ms: 760, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Expansão no 4º Grau",
          summary: "Desenvolve melodicamente o Jins Nahawand superior até o b7.",
          steps: [
            { interval_q: 10, dur_ms: 400, accent: true }, { interval_q: 14, dur_ms: 300 }, { interval_q: 16, dur_ms: 340 },
            { interval_q: 20, dur_ms: 480, accent: true }, { interval_q: 16, dur_ms: 280 }, { interval_q: 14, dur_ms: 300 },
            { interval_q: 10, dur_ms: 660, accent: true }
          ]
        },
        {
          title: "3. Qafla — Cadência Kurdi Característica",
          summary: "Repousa no grau b2 antes de resolver definitivamente na tônica.",
          steps: [
            { interval_q: 10, dur_ms: 360, accent: true }, { interval_q: 6, dur_ms: 300 }, { interval_q: 2, dur_ms: 440 },
            { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_sikah", name: "Maqam Sikah", traditional_root_q: 5, linked_cadence: "cad_sikah",
      lower_jins: "Jins Sikah (no 1º grau)", upper_jins_asc: "Jins Rast (no 3º grau)", upper_jins_desc: "Jins Rast (no 3º grau)",
      intervals_asc: [0, 3, 7, 11, 14, 17, 21, 24], intervals_desc: [0, 3, 7, 11, 14, 17, 21, 24],
      degrees_asc: ["1", "2", "3", "4", "5-", "6", "7", "8"], degrees_desc: ["1", "2", "3", "4", "5-", "6", "7", "8"],
      cents_dev: { 0: +15 }, ghammaz_q: 7, lower_limit_q: 7,
      description: "Tônica posicionada sobre o quarto de tom Sikah (Eb-). O Ghammaz fica na 3ª (G natural).",
      sayr_phrases: [
        {
          title: "1. Istihlal — Afirmação da Tônica Microtonal",
          summary: "Circunda a tônica em 1/4 de tom (1) e apoia no Ghammaz (3).",
          steps: [
            { interval_q: 0, dur_ms: 460, accent: true }, { interval_q: 3, dur_ms: 300 }, { interval_q: 7, dur_ms: 520, accent: true },
            { interval_q: 3, dur_ms: 300 }, { interval_q: 0, dur_ms: 780, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Jins Rast sobre o 3º Grau",
          summary: "A partir do 3º grau, sobe pelo 4º e 5º graus microtonais.",
          steps: [
            { interval_q: 7, dur_ms: 420, accent: true }, { interval_q: 11, dur_ms: 300 }, { interval_q: 14, dur_ms: 380 },
            { interval_q: 17, dur_ms: 480, accent: true }, { interval_q: 14, dur_ms: 300 }, { interval_q: 11, dur_ms: 280 },
            { interval_q: 7, dur_ms: 660, accent: true }
          ]
        },
        {
          title: "3. Qafla — Retorno ao Sikah",
          summary: "Resolve suavemente 3 → 2 → 1 sobre a nota microtonal.",
          steps: [
            { interval_q: 7, dur_ms: 400, accent: true }, { interval_q: 3, dur_ms: 360 }, { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_huzam", name: "Maqam Huzam", traditional_root_q: 5, linked_cadence: "cad_sikah",
      lower_jins: "Jins Sikah (no 1º grau)", upper_jins_asc: "Jins Hijaz (no 3º grau)", upper_jins_desc: "Jins Rast (no 3º grau)",
      intervals_asc: [0, 3, 7, 9, 15, 17, 21, 24], intervals_desc: [0, 3, 7, 9, 15, 17, 19, 24],
      degrees_asc: ["1", "2", "3", "b4", "5", "6", "7", "8"], degrees_desc: ["1", "2", "3", "b4", "5", "6", "b7", "8"],
      cents_dev: { 0: +15 }, ghammaz_q: 7, lower_limit_q: 7,
      description: "Membro mais popular da família Sikah; une a tônica microtonal em Eb- ao Jins Hijaz sobre G.",
      sayr_phrases: [
        {
          title: "1. Istihlal — Tricorde Sikah Luminoso",
          summary: "Estabelece a tônica microtonal e o pivô no 3º grau (G).",
          steps: [
            { interval_q: 0, dur_ms: 440, accent: true }, { interval_q: 3, dur_ms: 300 }, { interval_q: 7, dur_ms: 520, accent: true },
            { interval_q: 3, dur_ms: 300 }, { interval_q: 0, dur_ms: 760, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Salto Hijaz no 3º Grau",
          summary: "Explora o salto característico b4 → 5 → 6 a partir do Ghammaz.",
          steps: [
            { interval_q: 7, dur_ms: 400, accent: true }, { interval_q: 9, dur_ms: 280 }, { interval_q: 15, dur_ms: 420, accent: true },
            { interval_q: 17, dur_ms: 380 }, { interval_q: 15, dur_ms: 300 }, { interval_q: 9, dur_ms: 280 },
            { interval_q: 7, dur_ms: 660, accent: true }
          ]
        },
        {
          title: "3. Qafla — Cadência Clássica Huzam",
          summary: "Desce do 5º grau passando pelo Ghammaz (3) até o repouso final.",
          steps: [
            { interval_q: 15, dur_ms: 380 }, { interval_q: 9, dur_ms: 280 }, { interval_q: 7, dur_ms: 400, accent: true },
            { interval_q: 3, dur_ms: 340 }, { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_nikriz", name: "Maqam Nikriz", traditional_root_q: 0, linked_cadence: "cad_nikriz",
      lower_jins: "Jins Nikriz (no 1º grau)", upper_jins_asc: "Jins Nahawand (no 5º grau)", upper_jins_desc: "Jins Nahawand (no 5º grau)",
      intervals_asc: [0, 4, 6, 12, 14, 18, 20, 24], intervals_desc: [0, 4, 6, 12, 14, 18, 20, 24],
      degrees_asc: ["1", "2", "b3", "#4", "5", "6", "b7", "8"], degrees_desc: ["1", "2", "b3", "#4", "5", "6", "b7", "8"],
      cents_dev: {}, ghammaz_q: 14, lower_limit_q: 14,
      description: "Equivalente ao modo Dórico #4 (4º grau da Menor Harmônica), com pentacorde Nikriz na base.",
      sayr_phrases: [
        {
          title: "1. Istihlal — Pentacorde Nikriz (b3 ↔ #4)",
          summary: "Destaca o salto de 2ª aumentada entre b3 e #4 resolvendo no Ghammaz (5).",
          steps: [
            { interval_q: 0, dur_ms: 380 }, { interval_q: 4, dur_ms: 260 }, { interval_q: 6, dur_ms: 340 },
            { interval_q: 12, dur_ms: 380 }, { interval_q: 14, dur_ms: 540, accent: true }, { interval_q: 12, dur_ms: 280 },
            { interval_q: 6, dur_ms: 320 }, { interval_q: 4, dur_ms: 260 }, { interval_q: 0, dur_ms: 760, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Jins Nahawand no 5º Grau",
          summary: "Do 5º grau, sobe pelo 6º grau maior e b7 até a oitava.",
          steps: [
            { interval_q: 14, dur_ms: 400, accent: true }, { interval_q: 18, dur_ms: 300 }, { interval_q: 20, dur_ms: 360 },
            { interval_q: 24, dur_ms: 500, accent: true }, { interval_q: 20, dur_ms: 300 }, { interval_q: 18, dur_ms: 280 },
            { interval_q: 14, dur_ms: 660, accent: true }
          ]
        },
        {
          title: "3. Qafla — Resolução via #4 e b3",
          summary: "Retorna do Ghammaz (5) articulando a sensível #4 → b3 → 2 → 1.",
          steps: [
            { interval_q: 14, dur_ms: 380, accent: true }, { interval_q: 12, dur_ms: 300 }, { interval_q: 6, dur_ms: 340 },
            { interval_q: 4, dur_ms: 280 }, { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_nawa_athar", name: "Maqam Nawa Athar", traditional_root_q: 0, linked_cadence: "cad_nawa_athar",
      lower_jins: "Jins Nikriz (no 1º grau)", upper_jins_asc: "Jins Hijaz (no 5º grau)", upper_jins_desc: "Jins Hijaz (no 5º grau)",
      intervals_asc: [0, 4, 6, 12, 14, 16, 22, 24], intervals_desc: [0, 4, 6, 12, 14, 16, 22, 24],
      degrees_asc: ["1", "2", "b3", "#4", "5", "b6", "7", "8"], degrees_desc: ["1", "2", "b3", "#4", "5", "b6", "7", "8"],
      cents_dev: {}, ghammaz_q: 14, lower_limit_q: 14,
      description: "Dois saltos de 2ª aumentada na mesma oitava (Nikriz + Hijaz). Idêntico à Escala Menor Húngara.",
      sayr_phrases: [
        {
          title: "1. Istihlal — Tensão Cromática Dupla",
          summary: "Sobe pelo pentacorde Nikriz (1 – 2 – b3 – #4 – 5) criando forte magnetismo sobre o Ghammaz.",
          steps: [
            { interval_q: 0, dur_ms: 380 }, { interval_q: 4, dur_ms: 260 }, { interval_q: 6, dur_ms: 340 },
            { interval_q: 12, dur_ms: 380 }, { interval_q: 14, dur_ms: 540, accent: true }, { interval_q: 12, dur_ms: 300 },
            { interval_q: 6, dur_ms: 320 }, { interval_q: 0, dur_ms: 760, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Segundo Salto (b6 ↔ 7)",
          summary: "No 5º grau, articula o segundo intervalo aumentado (b6 → 7) fechando na oitava.",
          steps: [
            { interval_q: 14, dur_ms: 400, accent: true }, { interval_q: 16, dur_ms: 280 }, { interval_q: 22, dur_ms: 400 },
            { interval_q: 24, dur_ms: 560, accent: true }, { interval_q: 22, dur_ms: 280 }, { interval_q: 16, dur_ms: 300 },
            { interval_q: 14, dur_ms: 660, accent: true }
          ]
        },
        {
          title: "3. Qafla — Descida Simétrica Dramática",
          summary: "Encadeia os dois saltos na descida até o repouso final.",
          steps: [
            { interval_q: 16, dur_ms: 340 }, { interval_q: 14, dur_ms: 380, accent: true }, { interval_q: 12, dur_ms: 300 },
            { interval_q: 6, dur_ms: 360 }, { interval_q: 4, dur_ms: 280 }, { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_ajam", name: "Maqam Ajam", traditional_root_q: 20, linked_cadence: "cad_ajam",
      lower_jins: "Jins Ajam (no 1º grau)", upper_jins_asc: "Jins Ajam (no 5º grau)", upper_jins_desc: "Jins Nahawand (no 5º grau)",
      intervals_asc: [0, 4, 8, 10, 14, 18, 22, 24], intervals_desc: [0, 4, 8, 10, 14, 18, 20, 24],
      degrees_asc: ["1", "2", "3", "4", "5", "6", "7", "8"], degrees_desc: ["1", "2", "3", "4", "5", "6", "b7", "8"],
      cents_dev: {}, ghammaz_q: 14, lower_limit_q: 10,
      description: "Equivalente à Escala Maior (Jônio) na subida, flexionando a 7ª menor (Mixolídio) em cadências descendentes.",
      sayr_phrases: [
        {
          title: "1. Istihlal — Brilho da Tríade Ajam (1 - 3 - 5)",
          summary: "Estabelece o caráter jubiloso do Jins Ajam apoiando na 3ª maior e no 5º grau (Ghammaz).",
          steps: [
            { interval_q: 0, dur_ms: 380 }, { interval_q: 4, dur_ms: 260 }, { interval_q: 8, dur_ms: 360 },
            { interval_q: 10, dur_ms: 260 }, { interval_q: 14, dur_ms: 520, accent: true }, { interval_q: 8, dur_ms: 300 },
            { interval_q: 4, dur_ms: 260 }, { interval_q: 0, dur_ms: 760, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Ascensão com 7ª Maior (7)",
          summary: "Alcança a oitava com energia através da sensível (7) sobre o 5º grau.",
          steps: [
            { interval_q: 14, dur_ms: 400, accent: true }, { interval_q: 18, dur_ms: 280 }, { interval_q: 22, dur_ms: 360 },
            { interval_q: 24, dur_ms: 560, accent: true }, { interval_q: 22, dur_ms: 280 }, { interval_q: 18, dur_ms: 280 },
            { interval_q: 14, dur_ms: 660, accent: true }
          ]
        },
        {
          title: "3. Qafla — Flexão Descendente com b7",
          summary: "Suaviza a descida tocando a 7ª menor (b7) antes de fechar no Qarar.",
          steps: [
            { interval_q: 20, dur_ms: 400, accent: true }, { interval_q: 18, dur_ms: 280 }, { interval_q: 14, dur_ms: 360 },
            { interval_q: 10, dur_ms: 260 }, { interval_q: 8, dur_ms: 320 }, { interval_q: 4, dur_ms: 260 },
            { interval_q: 0, dur_ms: 820, accent: true }
          ]
        }
      ]
    }
  ],

  scales: [
    { id: "mode_ionian", name: "[Modo Grego] Jônio (Maior Natural)", traditional_root_q: 0, intervals_q: [0, 4, 8, 10, 14, 18, 22, 24], degrees: ["1", "2", "3", "4", "5", "6", "7", "8"], ghammaz_q: 10, bridge_maqam: "maqam_ajam", bridge_text: "Maqam Ajam (Subida)", description: "Modo Maior padrão. Nota característica: 4ª Justa." },
    { id: "mode_dorian", name: "[Modo Grego] Dórico", traditional_root_q: 4, intervals_q: [0, 4, 6, 10, 14, 18, 20, 24], degrees: ["1", "2", "b3", "4", "5", "6", "b7", "8"], ghammaz_q: 18, bridge_maqam: "maqam_nahawand", bridge_text: "Maqam Nahawand (Variante 6M)", description: "Modo menor com 6ª Maior característica (18q)." },
    { id: "mode_phrygian", name: "[Modo Grego] Frígio", traditional_root_q: 4, intervals_q: [0, 2, 6, 10, 14, 16, 20, 24], degrees: ["1", "b2", "b3", "4", "5", "b6", "b7", "8"], ghammaz_q: 2, bridge_maqam: "maqam_kurd", bridge_text: "Maqam Kurd (Idêntico)", description: "Modo menor com 2ª menor (b2) característica. Espelho exato do Maqam Kurd." },
    { id: "mode_lydian", name: "[Modo Grego] Lídio", traditional_root_q: 10, intervals_q: [0, 4, 8, 12, 14, 18, 22, 24], degrees: ["1", "2", "3", "#4", "5", "6", "7", "8"], ghammaz_q: 12, bridge_maqam: "maqam_nikriz", bridge_text: "Maqam Nikriz (compartilha #4)", description: "Modo maior com 4ª aumentada (#4) característica." },
    { id: "mode_mixolydian", name: "[Modo Grego] Mixolídio", traditional_root_q: 14, intervals_q: [0, 4, 8, 10, 14, 18, 20, 24], degrees: ["1", "2", "3", "4", "5", "6", "b7", "8"], ghammaz_q: 20, bridge_maqam: "maqam_ajam", bridge_text: "Maqam Ajam (Descendente)", description: "Modo maior com 7ª menor (b7). Corresponde ao caminho descendente do Maqam Ajam." },
    { id: "mode_aeolian", name: "[Modo Grego] Eólio (Menor Natural)", traditional_root_q: 0, intervals_q: [0, 4, 6, 10, 14, 16, 20, 24], degrees: ["1", "2", "b3", "4", "5", "b6", "b7", "8"], ghammaz_q: 16, bridge_maqam: "maqam_nahawand", bridge_text: "Maqam Nahawand (Descendente)", description: "Escala menor natural com b6 característica." },
    { id: "mode_locrian", name: "[Modo Grego] Lócrio", traditional_root_q: 4, intervals_q: [0, 2, 6, 10, 12, 16, 20, 24], degrees: ["1", "b2", "b3", "4", "b5", "b6", "b7", "8"], ghammaz_q: 12, bridge_maqam: "maqam_saba", bridge_text: "Maqam Saba (afim pela 4ª dim / b5)", description: "Modo meio-diminuto com b2 e b5." },
    { id: "scale_harmonic_minor", name: "[Menor Alterada] Menor Harmônica", traditional_root_q: 0, intervals_q: [0, 4, 6, 10, 14, 16, 22, 24], degrees: ["1", "2", "b3", "4", "5", "b6", "7", "8"], ghammaz_q: 22, bridge_maqam: "maqam_nahawand", bridge_text: "Maqam Nahawand (Ascendente)", description: "Idêntica ao Maqam Nahawand ascendente (Jins Nahawand + Jins Hijaz)." },
    { id: "scale_phrygian_dom", name: "[Menor Alterada] Frígio Dominante", traditional_root_q: 4, intervals_q: [0, 2, 8, 10, 14, 16, 20, 24], degrees: ["1", "b2", "3", "4", "5", "b6", "b7", "8"], ghammaz_q: 8, bridge_maqam: "maqam_hijaz", bridge_text: "Maqam Hijaz (Descendente)", description: "5º modo da Menor Harmônica. Estrutura exata do Maqam Hijaz sem quarto de tom." },
    { id: "scale_double_harmonic", name: "[Menor Alterada] Dupla Harmônica (Bizantina)", traditional_root_q: 0, intervals_q: [0, 2, 8, 10, 14, 16, 22, 24], degrees: ["1", "b2", "3", "4", "5", "b6", "7", "8"], ghammaz_q: 22, bridge_maqam: "maqam_hijaz", bridge_text: "Maqam Hijaz Kar (Hijaz + Hijaz)", description: "Dois tetracordes Hijaz simétricos (1 - b2 - 3 - 4 - 5 - b6 - 7)." },
    { id: "scale_hungarian_minor", name: "[Menor Alterada] Menor Húngara", traditional_root_q: 0, intervals_q: [0, 4, 6, 12, 14, 16, 22, 24], degrees: ["1", "2", "b3", "#4", "5", "b6", "7", "8"], ghammaz_q: 12, bridge_maqam: "maqam_nawa_athar", bridge_text: "Maqam Nawa Athar (Idêntico)", description: "Menor harmônica com #4. Equivalente exato do Maqam Nawa Athar." },
    { id: "sym_whole_tone", name: "[Simétrica] Tons Inteiros (Hexatônica)", traditional_root_q: 0, intervals_q: [0, 4, 8, 12, 16, 20, 24], degrees: ["1", "2", "3", "#4", "#5", "b7", "8"], symmetry_step_q: 4, description: "Simetria contínua a cada 1 tom (4 quartos de tom). Gera shapes diagonais uniformes nas ordens em 4ª justa." },
    { id: "sym_dim_wh", name: "[Simétrica] Diminuta (Tom - Semitom)", traditional_root_q: 0, intervals_q: [0, 4, 6, 10, 12, 16, 18, 22, 24], degrees: ["1", "2", "b3", "4", "b5", "b6", "6", "7", "8"], symmetry_step_q: 6, description: "Escala octatônica simétrica a cada 1,5 tom (6 quartos de tom = 3ª menor). Eixos destacados em dourado." },
    { id: "sym_dim_hw", name: "[Simétrica] Diminuta Dom. (Semitom - Tom)", traditional_root_q: 4, intervals_q: [0, 2, 6, 8, 12, 14, 18, 20, 24], degrees: ["1", "b2", "#2", "3", "#4", "5", "6", "b7", "8"], symmetry_step_q: 6, bridge_maqam: "maqam_saba", bridge_text: "Jins Saba Zamzama (primeiros 4 graus)", description: "Octatônica dominante. Os 4 primeiros graus formam o Jins Saba Zamzama." },
    { id: "sym_augmented", name: "[Simétrica] Aumentada (Hexatônica)", traditional_root_q: 0, intervals_q: [0, 6, 8, 14, 16, 22, 24], degrees: ["1", "#2", "3", "5", "b6", "7", "8"], symmetry_step_q: 8, description: "Simétrica a cada 3ª Maior (8 quartos de tom). Excelente para explorar o salto F-A entre a 5ª e 4ª cordas." },
    { id: "sym_chromatic_12", name: "[Simétrica] Cromática Ocidental (12-TET)", traditional_root_q: 0, intervals_q: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24], degrees: ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7", "8"], symmetry_step_q: 24, description: "Todas as 12 notas fixas temperadas para treino mecânico de 4 dedos por corda." },
    { id: "sym_arab_24", name: "[Simétrica] Grade Microtonal Completa (24-TET)", traditional_root_q: 0, intervals_q: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24], degrees: ["1","1+","b2","2-","2","2+","b3","3-","3","4-","4","4+","b5","5-","5","5+","b6","6-","6","6+","b7","7-","7","8-","8"], symmetry_step_q: 24, description: "Mapa completo com todos os 24 quartos de tom por oitava." }
  ],

  chords: [
    { id: "chord_oud_power", short_symbol: "5", name: "[Modal Oud] Quinta Aberta / Bordão (1 - 5 - 8)", traditional_root_q: 0, intervals_q: [0, 14], degrees: ["1", "5"], cents_dev: [0, 0], ghammaz_q: 14, bridge_maqam: "maqam_rast", bridge_text: "Universal (Todos os Maqamat)", description: "Voicing tradicional de acompanhamento no Oud (sem terça), preservando a pureza microtonal da melodia." },
    { id: "chord_rast_triad", short_symbol: "Rast", name: "[Microtonal] Acorde Rast Neutro (1 - 3- - 5)", traditional_root_q: 0, intervals_q: [0, 7, 14], degrees: ["1", "3-", "5"], cents_dev: [0, -15, 0], ghammaz_q: 7, bridge_maqam: "maqam_rast", bridge_text: "Maqam Rast / Jins Rast", description: "Tríade com Terça Neutra (Sikah em 7q / ~335 cents). Nem maior nem menor — sonoridade autêntica do Maqam Rast." },
    { id: "chord_rast_7", short_symbol: "Rast7-", name: "[Microtonal] Rast com 7ª Neutra (1 - 3- - 5 - 7-)", traditional_root_q: 0, intervals_q: [0, 7, 14, 21], degrees: ["1", "3-", "5", "7-"], cents_dev: [0, -15, 0, -15], ghammaz_q: 7, bridge_maqam: "maqam_rast", bridge_text: "Maqam Rast (Subida com Awj)", description: "Tétrade microtonal unindo a 3ª neutra (Sikah) e a 7ª neutra (Awj)." },
    { id: "chord_bayati_modal", short_symbol: "Bayati", name: "[Microtonal] Cluster Modal Bayati (1 - 2- - 4 - 5)", traditional_root_q: 4, intervals_q: [0, 3, 10, 14], degrees: ["1", "2-", "4", "5"], cents_dev: [0, -15, 0, 0], ghammaz_q: 10, bridge_maqam: "maqam_bayati", bridge_text: "Maqam Bayati", description: "Voicing suspenso com 2ª neutra (3q) e 4ª justa (Ghammaz), ideal para cadências em Bayati." },
    { id: "chord_hijaz_modal", short_symbol: "Hijaz", name: "[Modal Oud] Acorde Hijaz (1 - b2 - 3 - 5)", traditional_root_q: 4, intervals_q: [0, 2, 8, 14], degrees: ["1", "b2", "3", "5"], cents_dev: [0, +10, -10, 0], ghammaz_q: 8, bridge_maqam: "maqam_hijaz", bridge_text: "Maqam Hijaz", description: "Tríade Maior adicionada da 2ª menor (b2), destacando o intervalo de 2ª aumentada característico do Hijaz." },
    { id: "chord_saba_modal", short_symbol: "Saba", name: "[Microtonal] Acorde Saba Diminuto (1 - 2- - b3 - b4)", traditional_root_q: 4, intervals_q: [0, 3, 6, 8], degrees: ["1", "2-", "b3", "b4"], cents_dev: [0, -15, 0, 0], ghammaz_q: 6, bridge_maqam: "maqam_saba", bridge_text: "Maqam Saba", description: "Voicing dramático contendo a 2ª neutra (3q), 3ª menor (6q) e a 4ª diminuta (8q = Ghammaz)." },
    { id: "chord_sikah_modal", short_symbol: "Sikah", name: "[Microtonal] Acorde Sikah / Huzam (1 - 3- - 5-)", traditional_root_q: 5, intervals_q: [0, 7, 14], degrees: ["1", "3", "5"], cents_dev: [+15, 0, 0], ghammaz_q: 7, bridge_maqam: "maqam_huzam", bridge_text: "Maqam Sikah / Huzam", description: "Acorde construído sobre a tônica microtonal Sikah (Eb-) com G natural (7q) e Bb natural (14q)." },
    { id: "chord_sus4", short_symbol: "sus4", name: "[Modal Oud] Suspenso Sus4 (1 - 4 - 5)", traditional_root_q: 4, intervals_q: [0, 10, 14], degrees: ["1", "4", "5"], cents_dev: [0, 0, 0], ghammaz_q: 10, bridge_maqam: "maqam_kurd", bridge_text: "Acompanhamento neutro p/ Bayati, Kurd e Rast", description: "Substitui a terça pela 4ª justa, evitando choque com os quartos de tom da melodia." },
    { id: "chord_sus2", short_symbol: "sus2", name: "[Modal Oud] Suspenso Sus2 (1 - 2 - 5)", traditional_root_q: 0, intervals_q: [0, 4, 14], degrees: ["1", "2", "5"], cents_dev: [0, 0, 0], ghammaz_q: 4, bridge_maqam: "maqam_nahawand", bridge_text: "Acompanhamento aberto p/ Nahawand e Rast", description: "Sonoridade aberta em quintas e segundas, muito idiomática nas cordas soltas do Oud." },
    { id: "chord_quartal", short_symbol: "4tal", name: "[Modal Oud] Quartal (1 - 4 - b7)", traditional_root_q: 4, intervals_q: [0, 10, 20], degrees: ["1", "4", "b7"], cents_dev: [0, 0, 0], ghammaz_q: 10, description: "Empilhamento de quartas justas; aproveita a simetria natural das ordens do Oud." },
    { id: "chord_maj", short_symbol: "", name: "[Tríade] Maior (1 - 3 - 5)", traditional_root_q: 0, intervals_q: [0, 8, 14], degrees: ["1", "3", "5"], cents_dev: [0, 0, 0], ghammaz_q: 8, bridge_maqam: "maqam_ajam", bridge_text: "Maqam Ajam / Jins Ajam", description: "Tríade maior fundamental (Tônica, 3ª Maior em 8q e 5ª Justa em 14q)." },
    { id: "chord_min", short_symbol: "m", name: "[Tríade] Menor (1 - b3 - 5)", traditional_root_q: 0, intervals_q: [0, 6, 14], degrees: ["1", "b3", "5"], cents_dev: [0, 0, 0], ghammaz_q: 6, bridge_maqam: "maqam_nahawand", bridge_text: "Maqam Nahawand / Kurd", description: "Tríade menor fundamental (Tônica, 3ª Menor em 6q e 5ª Justa em 14q)." },
    { id: "chord_dim", short_symbol: "dim", name: "[Tríade] Diminuta (1 - b3 - b5)", traditional_root_q: 4, intervals_q: [0, 6, 12], degrees: ["1", "b3", "b5"], cents_dev: [0, 0, 0], ghammaz_q: 12, bridge_maqam: "maqam_saba", bridge_text: "Jins Saba Zamzama / Lócrio", description: "Tríade simétrica de terças menores (0q, 6q, 12q)." },
    { id: "chord_aug", short_symbol: "aug", name: "[Tríade] Aumentada (1 - 3 - #5)", traditional_root_q: 0, intervals_q: [0, 8, 16], degrees: ["1", "3", "#5"], cents_dev: [0, 0, 0], ghammaz_q: 16, description: "Tríade simétrica de terças maiores (0q, 8q, 16q)." },
    { id: "chord_dom7", short_symbol: "7", name: "[Tétrade] 7ª Dominante — 7 (1 - 3 - 5 - b7)", traditional_root_q: 4, intervals_q: [0, 8, 14, 20], degrees: ["1", "3", "5", "b7"], cents_dev: [0, 0, 0, 0], ghammaz_q: 8, bridge_maqam: "maqam_hijaz", bridge_text: "Maqam Hijaz (Harmonia da Tônica)", description: "Tétrade dominante maior com 7ª menor. Base harmônica direta para o Jins Hijaz." },
    { id: "chord_maj7", short_symbol: "maj7", name: "[Tétrade] 7ª Maior — Maj7 (1 - 3 - 5 - 7)", traditional_root_q: 0, intervals_q: [0, 8, 14, 22], degrees: ["1", "3", "5", "7"], cents_dev: [0, 0, 0, 0], ghammaz_q: 22, bridge_maqam: "maqam_ajam", bridge_text: "Maqam Ajam", description: "Tétrade maior com 7ª maior (22q)." },
    { id: "chord_min7", short_symbol: "m7", name: "[Tétrade] Menor com 7ª — m7 (1 - b3 - 5 - b7)", traditional_root_q: 0, intervals_q: [0, 6, 14, 20], degrees: ["1", "b3", "5", "b7"], cents_dev: [0, 0, 0, 0], ghammaz_q: 6, bridge_maqam: "maqam_nahawand", bridge_text: "Maqam Nahawand (Descendente) / Kurd", description: "Tétrade menor com 7ª menor." },
    { id: "chord_m7b5", short_symbol: "m7b5", name: "[Tétrade] Meio-Diminuto — m7b5 (1 - b3 - b5 - b7)", traditional_root_q: 4, intervals_q: [0, 6, 12, 20], degrees: ["1", "b3", "b5", "b7"], cents_dev: [0, 0, 0, 0], ghammaz_q: 12, bridge_maqam: "maqam_saba", bridge_text: "Maqam Lami / Saba", description: "Acorde meio-diminuto, ideal para harmonizar cadências em Saba e Lami." }
  ],

  cadences: [
    {
      id: "cad_rast",
      name: "Qafla Maqam Rast (I - IV - V - bVII - I)",
      traditional_root_q: 0,
      bridge_maqam: "maqam_rast",
      bridge_text: "Maqam Rast",
      description: "Cadência modal clássica do Maqam Rast: parte da tríade neutra na tônica (Rast), passa pelo 4º grau (Jaharkah), toca o Ghammaz no 5º grau (Nawa) e utiliza o acorde Maior da 7ª menor descendente (Ajam) para resolver no Qarar.",
      steps: [
        { roman: "I (Qarar)", offset_q: 0, chord_id: "chord_rast_triad", role: "Tônica c/ 3ª Neutra" },
        { roman: "IV", offset_q: 10, chord_id: "chord_maj", role: "Subdominante (Jaharkah)" },
        { roman: "V (Ghammaz)", offset_q: 14, chord_id: "chord_rast_triad", role: "Pivô Modal (Nawa)" },
        { roman: "bVII (Desc.)", offset_q: 20, chord_id: "chord_maj", role: "Subtônica (Ajam)" },
        { roman: "I (Qafla)", offset_q: 0, chord_id: "chord_rast_triad", role: "Resolução Final" }
      ]
    },
    {
      id: "cad_bayati",
      name: "Qafla Maqam Bayati (I - iv - bVII - v - I)",
      traditional_root_q: 4,
      bridge_maqam: "maqam_bayati",
      bridge_text: "Maqam Bayati",
      description: "Cadência tradicional do Bayati: afirma o cluster microtonal na tônica (Dukah), sobe para o Jins Nahawand no 4º grau (Ghammaz em G), apoia na subtônica maior um tom abaixo (C) e resolve com suspensão modal.",
      steps: [
        { roman: "I (Qarar)", offset_q: 0, chord_id: "chord_bayati_modal", role: "Tônica Bayati" },
        { roman: "iv (Ghammaz)", offset_q: 10, chord_id: "chord_min", role: "2º Jins (Nahawand)" },
        { roman: "bVII (Rast)", offset_q: 20, chord_id: "chord_maj", role: "Apoio Subtônico" },
        { roman: "v (Sus4)", offset_q: 14, chord_id: "chord_sus4", role: "Suspensão Dominante" },
        { roman: "I (Qafla)", offset_q: 0, chord_id: "chord_bayati_modal", role: "Repouso (Dukah)" }
      ]
    },
    {
      id: "cad_hijaz",
      name: "Qafla Maqam Hijaz / Andaluza (I - iv - bIII - bII - I)",
      traditional_root_q: 4,
      bridge_maqam: "maqam_hijaz",
      bridge_text: "Maqam Hijaz",
      description: "Progressão descendente icônica da família Hijaz e do repertório Mediterrâneo/Andaluz: desce em graus conjuntos a partir do Ghammaz (4º grau menor) passando pelo bII Napolitano até repousar na tônica Maior/Hijaz.",
      steps: [
        { roman: "I (Estab.)", offset_q: 0, chord_id: "chord_hijaz_modal", role: "Centro Hijaz" },
        { roman: "iv (Ghammaz)", offset_q: 10, chord_id: "chord_min", role: "Pivô no 4º Grau" },
        { roman: "bIII", offset_q: 6, chord_id: "chord_maj", role: "Descida Modal" },
        { roman: "bII", offset_q: 2, chord_id: "chord_maj", role: "Tensão b2 (Frígia)" },
        { roman: "I (Qafla)", offset_q: 0, chord_id: "chord_maj", role: "Resolução Maior/Hijaz" }
      ]
    },
    {
      id: "cad_saba",
      name: "Qafla Maqam Saba (i° - bIII - bVII - bII - i°)",
      traditional_root_q: 4,
      bridge_maqam: "maqam_saba",
      bridge_text: "Maqam Saba",
      description: "Reflete a tensão única do Maqam Saba: parte do tetracorde comprimido (com 4ª diminuta), ilumina o Ghammaz no 3º grau menor (Jins Hijaz em F) e retorna pelo bII para o acorde Saba na tônica.",
      steps: [
        { roman: "i° (Saba)", offset_q: 0, chord_id: "chord_saba_modal", role: "Tônica Saba" },
        { roman: "bIII (Ghammaz)", offset_q: 6, chord_id: "chord_hijaz_modal", role: "Jins Hijaz no 3º Grau" },
        { roman: "bVII", offset_q: 20, chord_id: "chord_min", role: "Passagem Grave" },
        { roman: "bII", offset_q: 2, chord_id: "chord_maj", role: "Aproximação Semitonal" },
        { roman: "i° (Qafla)", offset_q: 0, chord_id: "chord_saba_modal", role: "Resolução Saba" }
      ]
    },
    {
      id: "cad_nahawand",
      name: "Qafla Maqam Nahawand (i - iv - bVI - V7 - i)",
      traditional_root_q: 0,
      bridge_maqam: "maqam_nahawand",
      bridge_text: "Maqam Nahawand",
      description: "Cadência dramática do Maqam Nahawand: explora a subdominante menor, o grau bVI e utiliza o Jins Hijaz no 5º grau (acorde V7 com sensível) para cravar a resolução na tônica menor.",
      steps: [
        { roman: "i (Qarar)", offset_q: 0, chord_id: "chord_min", role: "Tônica Nahawand" },
        { roman: "iv", offset_q: 10, chord_id: "chord_min", role: "Subdominante Menor" },
        { roman: "bVI", offset_q: 16, chord_id: "chord_maj", role: "Expansão Lírica" },
        { roman: "V7 (Ghammaz)", offset_q: 14, chord_id: "chord_dom7", role: "Jins Hijaz Dominante" },
        { roman: "i (Qafla)", offset_q: 0, chord_id: "chord_min", role: "Resolução Menor" }
      ]
    },
    {
      id: "cad_kurd",
      name: "Qafla Maqam Kurd / Frígia (i - iv - bVII - bII - i)",
      traditional_root_q: 4,
      bridge_maqam: "maqam_kurd",
      bridge_text: "Maqam Kurd",
      description: "Cadência suave sem quartos de tom caracterizada pelo movimento do acorde bII Maior (um semitom acima da tônica) resolvendo sobre o acorde menor/sus4 do Qarar.",
      steps: [
        { roman: "i (Qarar)", offset_q: 0, chord_id: "chord_min", role: "Tônica Kurd" },
        { roman: "iv (Ghammaz)", offset_q: 10, chord_id: "chord_min", role: "Pivô no 4º Grau" },
        { roman: "bVII", offset_q: 20, chord_id: "chord_maj", role: "Apoio Modal" },
        { roman: "bII (Kurdi)", offset_q: 2, chord_id: "chord_maj", role: "Cadência b2 → 1" },
        { roman: "i (Qafla)", offset_q: 0, chord_id: "chord_min", role: "Repouso Kurd" }
      ]
    },
    {
      id: "cad_sikah",
      name: "Qafla Maqam Sikah / Huzam (I- - III - II - bVII- - I-)",
      traditional_root_q: 5,
      bridge_maqam: "maqam_huzam",
      bridge_text: "Maqam Sikah / Huzam",
      description: "Cadência com tônica sobre quarto de tom (Eb-): articula o Ghammaz na 3ª (G natural com Jins Hijaz/Rast), passa pelo grau inteiro F maior (Dukah/Jaharkah) e resolve na tônica microtonal Sikah.",
      steps: [
        { roman: "I- (Sikah)", offset_q: 0, chord_id: "chord_sikah_modal", role: "Tônica em 1/4 de Tom" },
        { roman: "III (Ghammaz)", offset_q: 7, chord_id: "chord_hijaz_modal", role: "Pivô em G (Nawa)" },
        { roman: "II", offset_q: 3, chord_id: "chord_maj", role: "Apoio F Maior" },
        { roman: "bVII-", offset_q: 19, chord_id: "chord_oud_power", role: "Subtônica Grave" },
        { roman: "I- (Qafla)", offset_q: 0, chord_id: "chord_sikah_modal", role: "Resolução Sikah" }
      ]
    },
    {
      id: "cad_nikriz",
      name: "Qafla Maqam Nikriz (i - II7 - v - bVII - i)",
      traditional_root_q: 0,
      bridge_maqam: "maqam_nikriz",
      bridge_text: "Maqam Nikriz",
      description: "Destaca a 4ª aumentada (#4) característica do pentacorde Nikriz por meio do acorde Maior/Dominante sobre o 2º grau (II7) combinado ao Ghammaz menor no 5º grau.",
      steps: [
        { roman: "i (Qarar)", offset_q: 0, chord_id: "chord_min", role: "Tônica Nikriz" },
        { roman: "II7 (#4)", offset_q: 4, chord_id: "chord_dom7", role: "Destaque da #4" },
        { roman: "v (Ghammaz)", offset_q: 14, chord_id: "chord_min", role: "Jins Nahawand no 5º" },
        { roman: "bVII", offset_q: 20, chord_id: "chord_maj", role: "Cadência Descendente" },
        { roman: "i (Qafla)", offset_q: 0, chord_id: "chord_min", role: "Repouso Final" }
      ]
    },
    {
      id: "cad_nawa_athar",
      name: "Qafla Maqam Nawa Athar (i - #iv° - V - bVI - i)",
      traditional_root_q: 0,
      bridge_maqam: "maqam_nawa_athar",
      bridge_text: "Maqam Nawa Athar",
      description: "Explora a dupla segunda aumentada (Nikriz + Hijaz): cria forte atração cromática entre o #4 diminuto e o 5º grau com Jins Hijaz antes de resolver na tônica menor.",
      steps: [
        { roman: "i (Qarar)", offset_q: 0, chord_id: "chord_min", role: "Tônica Nawa Athar" },
        { roman: "#iv°", offset_q: 12, chord_id: "chord_dim", role: "Sensível do Ghammaz" },
        { roman: "V (Ghammaz)", offset_q: 14, chord_id: "chord_hijaz_modal", role: "Jins Hijaz no 5º Grau" },
        { roman: "bVI", offset_q: 16, chord_id: "chord_maj", role: "Engano Modal (Hisar)" },
        { roman: "i (Qafla)", offset_q: 0, chord_id: "chord_min", role: "Resolução Dramática" }
      ]
    },
    {
      id: "cad_ajam",
      name: "Qafla Maqam Ajam (I - IV - bVII - V7 - I)",
      traditional_root_q: 20,
      bridge_maqam: "maqam_ajam",
      bridge_text: "Maqam Ajam",
      description: "Combina o brilho do modo maior com a flexão característica da 7ª menor descendente (acorde bVII) antes da preparação dominante final.",
      steps: [
        { roman: "I (Qarar)", offset_q: 0, chord_id: "chord_maj", role: "Tônica Ajam" },
        { roman: "IV", offset_q: 10, chord_id: "chord_maj", role: "Subdominante" },
        { roman: "bVII (Desc.)", offset_q: 20, chord_id: "chord_maj", role: "Flexão Descendente" },
        { roman: "V7 (Ghammaz)", offset_q: 14, chord_id: "chord_dom7", role: "Dominante (5º Grau)" },
        { roman: "I (Qafla)", offset_q: 0, chord_id: "chord_maj", role: "Resolução Maior" }
      ]
    }
  ],

  iqaat: [
    {
      id: "iqa_maqsum",
      name: "Maqsum (4/4) — O Pilar da Música Árabe",
      meter: "4/4",
      default_bpm: 96,
      subdivision_factor: 2,
      description: "O ciclo rítmico mais fundamental do repertório árabe clássico e folclórico (DUM TAK - TAK DUM - TAK -).",
      pattern: [
        { stroke: "DUM",  label: "DUM",  accent: true  },
        { stroke: "TAK",  label: "TAK",  accent: false },
        { stroke: "ES",   label: "·",    accent: false },
        { stroke: "TAK",  label: "TAK",  accent: false },
        { stroke: "DUM",  label: "DUM",  accent: true  },
        { stroke: "ES",   label: "·",    accent: false },
        { stroke: "TAK",  label: "TAK",  accent: false },
        { stroke: "ZILL", label: "zill", accent: false }
      ]
    },
    {
      id: "iqa_baladi",
      name: "Baladi / Masmoudi Saghir (4/4)",
      meter: "4/4",
      default_bpm: 88,
      subdivision_factor: 2,
      description: "Caracterizado pelos dois DUMs graves consecutivos na abertura (DUM DUM - TAK DUM - TAK -).",
      pattern: [
        { stroke: "DUM", label: "DUM", accent: true  },
        { stroke: "DUM", label: "DUM", accent: true  },
        { stroke: "ES",  label: "·",   accent: false },
        { stroke: "TAK", label: "TAK", accent: false },
        { stroke: "DUM", label: "DUM", accent: true  },
        { stroke: "ES",  label: "·",   accent: false },
        { stroke: "TAK", label: "TAK", accent: false },
        { stroke: "ES",  label: "·",   accent: false }
      ]
    },
    {
      id: "iqa_samai_thaqil",
      name: "Samai Thaqil (10/8 — 3 + 2 + 2 + 3)",
      meter: "10/8",
      default_bpm: 112,
      subdivision_factor: 2,
      description: "Ciclo assimétrico nobre em 10/8 (agrupado em 3+2+2+3), base das formas instrumentais Samai.",
      pattern: [
        { stroke: "DUM",  label: "1:DUM", accent: true  },
        { stroke: "ES",   label: "2:·",   accent: false },
        { stroke: "ES",   label: "3:·",   accent: false },
        { stroke: "TAK",  label: "4:TAK", accent: false },
        { stroke: "KAH",  label: "5:kah", accent: false },
        { stroke: "DUM",  label: "6:DUM", accent: true  },
        { stroke: "DUM",  label: "7:DUM", accent: true  },
        { stroke: "TAK",  label: "8:TAK", accent: false },
        { stroke: "ES",   label: "9:·",   accent: false },
        { stroke: "ZILL", label: "10:·",  accent: false }
      ]
    },
    {
      id: "iqa_aqsaq",
      name: "Aqsaq (9/8 — 2 + 2 + 2 + 3)",
      meter: "9/8",
      default_bpm: 116,
      subdivision_factor: 2,
      description: "Ciclo assimétrico em 9/8 com passo alongado no último grupo de 3 colcheias (DUM - TAK - DUM - TAK TAK -).",
      pattern: [
        { stroke: "DUM", label: "1:DUM", accent: true  },
        { stroke: "ES",  label: "2:·",   accent: false },
        { stroke: "TAK", label: "3:TAK", accent: false },
        { stroke: "ES",  label: "4:·",   accent: false },
        { stroke: "DUM", label: "5:DUM", accent: true  },
        { stroke: "ES",  label: "6:·",   accent: false },
        { stroke: "TAK", label: "7:TAK", accent: false },
        { stroke: "TAK", label: "8:TAK", accent: false },
        { stroke: "ES",  label: "9:·",   accent: false }
      ]
    },
    {
      id: "iqa_saidi",
      name: "Saidi (4/4) — Alto Egito",
      meter: "4/4",
      default_bpm: 98,
      subdivision_factor: 2,
      description: "Variação energética do Maqsum com dois DUMs no centro do compasso (DUM TAK - DUM DUM - TAK -).",
      pattern: [
        { stroke: "DUM",  label: "DUM",  accent: true  },
        { stroke: "TAK",  label: "TAK",  accent: false },
        { stroke: "ES",   label: "·",    accent: false },
        { stroke: "DUM",  label: "DUM",  accent: true  },
        { stroke: "DUM",  label: "DUM",  accent: true  },
        { stroke: "ES",   label: "·",    accent: false },
        { stroke: "TAK",  label: "TAK",  accent: false },
        { stroke: "ZILL", label: "zill", accent: false }
      ]
    },
    {
      id: "iqa_jurjina",
      name: "Jurjina (10/16 — 3 + 2 + 2 + 3)",
      meter: "10/16",
      default_bpm: 132,
      subdivision_factor: 2,
      description: "Ciclo rápido em 10 pulsos tradicional da escola iraquiana e levantina.",
      pattern: [
        { stroke: "DUM", label: "1:DUM", accent: true  },
        { stroke: "ES",  label: "2:·",   accent: false },
        { stroke: "TAK", label: "3:TAK", accent: false },
        { stroke: "DUM", label: "4:DUM", accent: true  },
        { stroke: "ES",  label: "5:·",   accent: false },
        { stroke: "TAK", label: "6:TAK", accent: false },
        { stroke: "ES",  label: "7:·",   accent: false },
        { stroke: "DUM", label: "8:DUM", accent: true  },
        { stroke: "TAK", label: "9:TAK", accent: false },
        { stroke: "ES",  label: "10:·",  accent: false }
      ]
    },
    {
      id: "iqa_malfuf",
      name: "Malfuf / Laff (2/4)",
      meter: "2/4",
      default_bpm: 115,
      subdivision_factor: 2,
      description: "Ciclo binário circular usado em introduções rápidas e transições de Taqsim.",
      pattern: [
        { stroke: "DUM", label: "DUM", accent: true  },
        { stroke: "ES",  label: "·",   accent: false },
        { stroke: "ES",  label: "·",   accent: false },
        { stroke: "TAK", label: "TAK", accent: false },
        { stroke: "ES",  label: "·",   accent: false },
        { stroke: "ES",  label: "·",   accent: false },
        { stroke: "TAK", label: "TAK", accent: false },
        { stroke: "ES",  label: "·",   accent: false }
      ]
    }
  ]
};
