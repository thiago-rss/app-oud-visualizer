// @ts-check

/**
 * Paletas de luthieria por tradição — v2.8 (Contenção Cromática: Madrepérola, Latão & Ameixa, sem ciano)
 */
export const TRADITION_PALETTES = {
  damascus: {
    soundboard: "#b98a55",
    soundboardEdge: "#7a532b",
    ebony: "#17120f",
    rosetteRing: "#c99a49",
    inlayStripe: "#e2d9c8",
    sadaf: "#e2d9c8",
    raqma: "#2c1e16"
  },
  cairo: {
    soundboard: "#c48447",
    soundboardEdge: "#82491d",
    ebony: "#1c130e",
    rosetteRing: "#d49b42",
    inlayStripe: "#f0e3cc",
    sadaf: "#e8d9be",
    raqma: "#3a2114"
  },
  istanbul: {
    soundboard: "#d6b98c",
    soundboardEdge: "#96784e",
    ebony: "#141214",
    rosetteRing: "#c5a467",
    inlayStripe: "#e6e0d6",
    sadaf: "#c49be0",
    raqma: "#231d21"
  }
};

/**
 * Grade cromática microtonal 24-TET (0 a 23 quartos de tom, base C = 0).
 */
export const PITCH_CLASSES_24 = [
  { q: 0, flat: "C", arabic: "Rast", micro: false },
  { q: 1, flat: "C+", arabic: "Nim Zirkulah", micro: true },
  { q: 2, flat: "Db", arabic: "Zirkulah", micro: false },
  { q: 3, flat: "D-", arabic: "Tik Zirkulah", micro: true },
  { q: 4, flat: "D", arabic: "Dukah", micro: false },
  { q: 5, flat: "D+", arabic: "Nim Kurdi", micro: true },
  { q: 6, flat: "Eb", arabic: "Kurd", micro: false },
  { q: 7, flat: "E-", arabic: "Sikah", micro: true },
  { q: 8, flat: "E", arabic: "Buselik", micro: false },
  { q: 9, flat: "F-", arabic: "Tik Buselik", micro: true },
  { q: 10, flat: "F", arabic: "Jaharkah", micro: false },
  { q: 11, flat: "F+", arabic: "Nim Hijaz", micro: true },
  { q: 12, flat: "F#", arabic: "Hijaz", micro: false },
  { q: 13, flat: "G-", arabic: "Tik Hijaz", micro: true },
  { q: 14, flat: "G", arabic: "Nawa", micro: false },
  { q: 15, flat: "G+", arabic: "Nim Hisar", micro: true },
  { q: 16, flat: "Ab", arabic: "Hisar", micro: false },
  { q: 17, flat: "A-", arabic: "Tik Hisar", micro: true },
  { q: 18, flat: "A", arabic: "Husayni", micro: false },
  { q: 19, flat: "A+", arabic: "Nim Ajam", micro: true },
  { q: 20, flat: "Bb", arabic: "Ajam", micro: false },
  { q: 21, flat: "B-", arabic: "Awj", micro: true },
  { q: 22, flat: "B", arabic: "Mahur", micro: false },
  { q: 23, flat: "B+", arabic: "Tik Mahur", micro: true }
];

export const DB = {
  tunings: [
    {
      id: "syrian_arabic_c_c",
      name: "Síria / Árabe Moderna (C–F–A–d–g–c)",
      description: "Afinação padrão contemporânea do Levante: quartas justas nas ordens agudas e terça maior F–A entre a 5ª e a 4ª ordens, com bordão grave em C.",
      courses: [
        { course: 1, label: "1ª c", abs_q: 48, freq_hz: 261.63 },
        { course: 2, label: "2ª g", abs_q: 38, freq_hz: 196.0 },
        { course: 3, label: "3ª d", abs_q: 28, freq_hz: 146.83 },
        { course: 4, label: "4ª A", abs_q: 18, freq_hz: 110.0 },
        { course: 5, label: "5ª F", abs_q: 10, freq_hz: 87.31 },
        { course: 6, label: "6ª C", abs_q: 0, freq_hz: 65.41 }
      ]
    },
    {
      id: "arabic_classic_f_f",
      name: "Árabe Clássica (F–A–d–g–c–f)",
      description: "Afinação clássica com ordem aguda extra em f4 (Jawab Jaharkah), privilegiando o registro brilhante no Taqsim.",
      courses: [
        { course: 1, label: "1ª f", abs_q: 58, freq_hz: 349.23 },
        { course: 2, label: "2ª c", abs_q: 48, freq_hz: 261.63 },
        { course: 3, label: "3ª g", abs_q: 38, freq_hz: 196.0 },
        { course: 4, label: "4ª d", abs_q: 28, freq_hz: 146.83 },
        { course: 5, label: "5ª A", abs_q: 18, freq_hz: 110.0 },
        { course: 6, label: "6ª F", abs_q: 10, freq_hz: 87.31 }
      ]
    },
    {
      id: "egyptian_d_c",
      name: "Egípcia Tradicional (D–G–A–d–g–c)",
      description: "Substitui o F grave por G (segunda maior G–A) e usa bordão em D, ideal para ressonância direta em Maqam Bayati e Hijaz.",
      courses: [
        { course: 1, label: "1ª c", abs_q: 48, freq_hz: 261.63 },
        { course: 2, label: "2ª g", abs_q: 38, freq_hz: 196.0 },
        { course: 3, label: "3ª d", abs_q: 28, freq_hz: 146.83 },
        { course: 4, label: "4ª A", abs_q: 18, freq_hz: 110.0 },
        { course: 5, label: "5ª G", abs_q: 14, freq_hz: 98.0 },
        { course: 6, label: "6ª D", abs_q: 4, freq_hz: 73.42 }
      ]
    },
    {
      id: "turkish_greek_d_a",
      name: "Turca / Grega (D–E–A–B–e–a)",
      description: "Afinação de Istambul (escala mais curta e tensão brilhante), centrada em A e D para o repertório otomano e grego.",
      courses: [
        { course: 1, label: "1ª a", abs_q: 42, freq_hz: 220.0 },
        { course: 2, label: "2ª e", abs_q: 32, freq_hz: 164.81 },
        { course: 3, label: "3ª B", abs_q: 22, freq_hz: 123.47 },
        { course: 4, label: "4ª A", abs_q: 18, freq_hz: 110.0 },
        { course: 5, label: "5ª E", abs_q: 8, freq_hz: 82.41 },
        { course: 6, label: "6ª D", abs_q: 4, freq_hz: 73.42 }
      ]
    },
    {
      id: "iraqi_munir_bashir",
      name: "Iraquiana / Mounir Bashir (F–C–d–g–c–f)",
      description: "Afinação da escola de Bagdá com salto de oitava/quinta nos graves, favorecendo pedais meditativos e contraponto solo.",
      courses: [
        { course: 1, label: "1ª f", abs_q: 58, freq_hz: 349.23 },
        { course: 2, label: "2ª c", abs_q: 48, freq_hz: 261.63 },
        { course: 3, label: "3ª g", abs_q: 38, freq_hz: 196.0 },
        { course: 4, label: "4ª d", abs_q: 28, freq_hz: 146.83 },
        { course: 5, label: "5ª C", abs_q: 24, freq_hz: 130.81 },
        { course: 6, label: "6ª F", abs_q: 10, freq_hz: 87.31 }
      ]
    }
  ],

  maqamat: [
    {
      id: "maqam_rast",
      name: "Maqam Rast",
      description: "Matriz fundamental do sistema árabe. Possui caráter nobre e equilibrado, definido pela terça neutra (3-) na subida e pelo 7º grau menor (b7) na descida.",
      traditional_root_q: 0,
      ghammaz_q: 14,
      lower_jins: "Jins Rast (1 – 2 – 3- – 4 – 5)",
      upper_jins_asc: "Jins Rast Superior (5 – 6 – 7- – 8)",
      upper_jins_desc: "Jins Nahawand (5 – 6 – b7 – 8)",
      intervals_asc: [0, 4, 7, 10, 14, 18, 21, 24],
      degrees_asc: ["1", "2", "3-", "4", "5", "6", "7-", "8"],
      intervals_desc: [0, 4, 7, 10, 14, 18, 20, 24],
      degrees_desc: ["1", "2", "3-", "4", "5", "6", "b7", "8"],
      cents_dev: { 7: -8, 21: -8 },
      linked_cadence: "cad_rast_classic",
      sayr_phrases: [
        {
          title: "1. Istihlal — Afirmação do Jins Rast",
          summary: "Apresenta o Qarar tocando a subtônica b7 inferior e repousando sobre a terça neutra Sikah (3-).",
          steps: [
            { interval_q: 0, dur_ms: 480, accent: true },
            { interval_q: 4, dur_ms: 340 },
            { interval_q: 7, dur_ms: 440, accent: true },
            { interval_q: 10, dur_ms: 320 },
            { interval_q: 7, dur_ms: 360 },
            { interval_q: 4, dur_ms: 340 },
            { interval_q: 0, dur_ms: 620, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Ascensão à Dominante Nawa (5)",
          summary: "Estabelece o 5º grau como novo centro de gravidade e insinua o 7º grau neutro (7-) rumo à oitava.",
          steps: [
            { interval_q: 14, dur_ms: 460, accent: true },
            { interval_q: 18, dur_ms: 320 },
            { interval_q: 21, dur_ms: 420 },
            { interval_q: 24, dur_ms: 520, accent: true },
            { interval_q: 21, dur_ms: 320 },
            { interval_q: 18, dur_ms: 320 },
            { interval_q: 14, dur_ms: 580, accent: true }
          ]
        },
        {
          title: "3. Qafla — Descida com b7 (Ajam) ao Qarar",
          summary: "Usa o 7º grau abaixado (b7) na descida clássica, atravessando o 3- até a resolução definitiva no 1º grau.",
          steps: [
            { interval_q: 24, dur_ms: 420, accent: true },
            { interval_q: 20, dur_ms: 360 },
            { interval_q: 18, dur_ms: 320 },
            { interval_q: 14, dur_ms: 420, accent: true },
            { interval_q: 10, dur_ms: 320 },
            { interval_q: 7, dur_ms: 400 },
            { interval_q: 4, dur_ms: 320 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_bayati",
      name: "Maqam Bayati",
      description: "Um dos maqamat mais populares e líricos do repertório árabe. Sua assinatura é o 2º grau neutro (2-), criando uma abertura íntima e expressiva.",
      traditional_root_q: 4,
      ghammaz_q: 10,
      lower_jins: "Jins Bayati (1 – 2- – b3 – 4)",
      upper_jins_asc: "Jins Nahawand / Rast (4 – 5 – b6 – b7 – 8)",
      upper_jins_desc: "Jins Nahawand (4 – 5 – b6 – b7 – 8)",
      intervals_asc: [0, 3, 6, 10, 14, 16, 20, 24],
      degrees_asc: ["1", "2-", "b3", "4", "5", "b6", "b7", "8"],
      intervals_desc: [0, 3, 6, 10, 14, 16, 20, 24],
      degrees_desc: ["1", "2-", "b3", "4", "5", "b6", "b7", "8"],
      cents_dev: { 3: -12 },
      linked_cadence: "cad_bayati_classic",
      sayr_phrases: [
        {
          title: "1. Istihlal — Abertura no Tetracorde Bayati",
          summary: "Expõe o intervalo característico 1 – 2- – b3 com apoio suave no 4º grau (Ghammaz).",
          steps: [
            { interval_q: 0, dur_ms: 460, accent: true },
            { interval_q: 3, dur_ms: 360 },
            { interval_q: 6, dur_ms: 380 },
            { interval_q: 10, dur_ms: 520, accent: true },
            { interval_q: 6, dur_ms: 340 },
            { interval_q: 3, dur_ms: 360 },
            { interval_q: 0, dur_ms: 620, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Desenvolvimento no 4º Grau",
          summary: "Pivota sobre a 4ª justa (G) abrindo o Jins Nahawand rumo ao 5º e b6º graus.",
          steps: [
            { interval_q: 10, dur_ms: 460, accent: true },
            { interval_q: 14, dur_ms: 360 },
            { interval_q: 16, dur_ms: 420 },
            { interval_q: 20, dur_ms: 400 },
            { interval_q: 16, dur_ms: 320 },
            { interval_q: 14, dur_ms: 340 },
            { interval_q: 10, dur_ms: 560, accent: true }
          ]
        },
        {
          title: "3. Qafla — Cadência Lírica pelo b3 e 2-",
          summary: "Resolve do 5º grau descendo com calma sobre o 2º grau neutro antes de pousar no Qarar.",
          steps: [
            { interval_q: 14, dur_ms: 420, accent: true },
            { interval_q: 10, dur_ms: 360 },
            { interval_q: 6, dur_ms: 360 },
            { interval_q: 3, dur_ms: 440 },
            { interval_q: 6, dur_ms: 280 },
            { interval_q: 3, dur_ms: 340 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_hijaz",
      name: "Maqam Hijaz",
      description: "Imediatamente reconhecível pelo salto de segunda aumentada entre o b2 e a terça maior (3), combinando misticismo, deserto e dramatismo.",
      traditional_root_q: 4,
      ghammaz_q: 10,
      lower_jins: "Jins Hijaz (1 – b2 – 3 – 4)",
      upper_jins_asc: "Jins Rast (4 – 5 – 6- – b7 – 8)",
      upper_jins_desc: "Jins Nahawand (4 – 5 – b6 – b7 – 8)",
      intervals_asc: [0, 2, 8, 10, 14, 17, 20, 24],
      degrees_asc: ["1", "b2", "3", "4", "5", "6-", "b7", "8"],
      intervals_desc: [0, 2, 8, 10, 14, 16, 20, 24],
      degrees_desc: ["1", "b2", "3", "4", "5", "b6", "b7", "8"],
      cents_dev: { 2: 10, 8: -10, 17: -8 },
      linked_cadence: "cad_hijaz_classic",
      sayr_phrases: [
        {
          title: "1. Istihlal — Salto Característico b2–3",
          summary: "Destaca o coração do Jins Hijaz entre o 4º grau (Ghammaz) e o Qarar.",
          steps: [
            { interval_q: 10, dur_ms: 480, accent: true },
            { interval_q: 8, dur_ms: 420 },
            { interval_q: 2, dur_ms: 440 },
            { interval_q: 0, dur_ms: 560, accent: true },
            { interval_q: 2, dur_ms: 320 },
            { interval_q: 8, dur_ms: 360 },
            { interval_q: 10, dur_ms: 540, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Extensão Rast sobre o 4º Grau",
          summary: "Sobe além do Ghammaz revelando a sexta neutra (6-) antes de atingir a oitava.",
          steps: [
            { interval_q: 10, dur_ms: 420, accent: true },
            { interval_q: 14, dur_ms: 360 },
            { interval_q: 17, dur_ms: 420 },
            { interval_q: 20, dur_ms: 380 },
            { interval_q: 24, dur_ms: 520, accent: true },
            { interval_q: 20, dur_ms: 340 },
            { interval_q: 14, dur_ms: 480 }
          ]
        },
        {
          title: "3. Qafla — Resolução Descendente (b6 → 3 → b2 → 1)",
          summary: "Fecha com o b6 menor na descida, recaindo sobre o salto b2–3 até o repouso final.",
          steps: [
            { interval_q: 16, dur_ms: 400 },
            { interval_q: 14, dur_ms: 360 },
            { interval_q: 10, dur_ms: 420, accent: true },
            { interval_q: 8, dur_ms: 400 },
            { interval_q: 2, dur_ms: 420 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_nahawand",
      name: "Maqam Nahawand",
      description: "Correspondente árabe do universo menor harmônico/natural (12-TET). Combina lirismo ocidental com fraseado cadencial oriental sobre a 5ª justa.",
      traditional_root_q: 0,
      ghammaz_q: 14,
      lower_jins: "Jins Nahawand (1 – 2 – b3 – 4 – 5)",
      upper_jins_asc: "Jins Hijaz (5 – b6 – 7 – 8)",
      upper_jins_desc: "Jins Kurd (5 – b6 – b7 – 8)",
      intervals_asc: [0, 4, 6, 10, 14, 16, 22, 24],
      degrees_asc: ["1", "2", "b3", "4", "5", "b6", "7", "8"],
      intervals_desc: [0, 4, 6, 10, 14, 16, 20, 24],
      degrees_desc: ["1", "2", "b3", "4", "5", "b6", "b7", "8"],
      cents_dev: {},
      linked_cadence: "cad_nahawand_classic",
      sayr_phrases: [
        {
          title: "1. Istihlal — Pentacorde Menor",
          summary: "Desenha a base 1 – 2 – b3 – 4 – 5 afirmando a doçura melancólica do Nahawand.",
          steps: [
            { interval_q: 0, dur_ms: 460, accent: true },
            { interval_q: 4, dur_ms: 320 },
            { interval_q: 6, dur_ms: 420, accent: true },
            { interval_q: 10, dur_ms: 340 },
            { interval_q: 14, dur_ms: 520, accent: true },
            { interval_q: 10, dur_ms: 320 },
            { interval_q: 6, dur_ms: 380 },
            { interval_q: 0, dur_ms: 600, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Tensão Hijaz no 5º Grau",
          summary: "Introduz a sensível (7º grau maior) no tetracorde superior impulsionando até a oitava.",
          steps: [
            { interval_q: 14, dur_ms: 460, accent: true },
            { interval_q: 16, dur_ms: 380 },
            { interval_q: 22, dur_ms: 440 },
            { interval_q: 24, dur_ms: 540, accent: true },
            { interval_q: 22, dur_ms: 320 },
            { interval_q: 16, dur_ms: 360 },
            { interval_q: 14, dur_ms: 540, accent: true }
          ]
        },
        {
          title: "3. Qafla — Descida Natural pelo b7",
          summary: "Retorna de forma fluida usando o 7º grau menor (b7) até o repouso na tônica.",
          steps: [
            { interval_q: 24, dur_ms: 400, accent: true },
            { interval_q: 20, dur_ms: 360 },
            { interval_q: 16, dur_ms: 340 },
            { interval_q: 14, dur_ms: 420, accent: true },
            { interval_q: 10, dur_ms: 320 },
            { interval_q: 6, dur_ms: 360 },
            { interval_q: 4, dur_ms: 320 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_kurd",
      name: "Maqam Kurd",
      description: "Escala sem quartos de tom (equivalente ao modo Frígio), muito presente na música moderna, contemporânea e em canções líricas do Oriente Médio.",
      traditional_root_q: 4,
      ghammaz_q: 10,
      lower_jins: "Jins Kurd (1 – b2 – b3 – 4)",
      upper_jins_asc: "Jins Nahawand (4 – 5 – b6 – b7 – 8)",
      upper_jins_desc: "Jins Nahawand (4 – 5 – b6 – b7 – 8)",
      intervals_asc: [0, 2, 6, 10, 14, 16, 20, 24],
      degrees_asc: ["1", "b2", "b3", "4", "5", "b6", "b7", "8"],
      intervals_desc: [0, 2, 6, 10, 14, 16, 20, 24],
      degrees_desc: ["1", "b2", "b3", "4", "5", "b6", "b7", "8"],
      cents_dev: {},
      linked_cadence: "cad_kurd_classic",
      sayr_phrases: [
        {
          title: "1. Istihlal — Gravidade do Semitom b2",
          summary: "Expõe o contraste entre o 4º grau (Ghammaz) e o b2 que puxa para a tônica.",
          steps: [
            { interval_q: 0, dur_ms: 440, accent: true },
            { interval_q: 2, dur_ms: 340 },
            { interval_q: 6, dur_ms: 420 },
            { interval_q: 10, dur_ms: 520, accent: true },
            { interval_q: 6, dur_ms: 340 },
            { interval_q: 2, dur_ms: 380 },
            { interval_q: 0, dur_ms: 620, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Extensão no 4º e 5º Graus",
          summary: "Constrói um arco lírico no registro superior através do Jins Nahawand.",
          steps: [
            { interval_q: 10, dur_ms: 440, accent: true },
            { interval_q: 14, dur_ms: 380 },
            { interval_q: 16, dur_ms: 420 },
            { interval_q: 20, dur_ms: 380 },
            { interval_q: 16, dur_ms: 320 },
            { interval_q: 14, dur_ms: 480, accent: true }
          ]
        },
        {
          title: "3. Qafla — Fechamento Frígio",
          summary: "Desce do b6 até repousar na resolução típica b2 → 1.",
          steps: [
            { interval_q: 14, dur_ms: 400, accent: true },
            { interval_q: 10, dur_ms: 360 },
            { interval_q: 6, dur_ms: 380 },
            { interval_q: 2, dur_ms: 440 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_saba",
      name: "Maqam Saba",
      description: "Expressão máxima de saudade e intensidade emocional. Sua quarta diminuta (b4) gera uma escala assimétrica que não repete a mesma tônica na oitava.",
      traditional_root_q: 4,
      ghammaz_q: 6,
      lower_jins: "Jins Saba (1 – 2- – b3 – b4)",
      upper_jins_asc: "Jins Hijaz no b3 (b3 – b4 – 5 – b6)",
      upper_jins_desc: "Jins Hijaz no b3 (b3 – b4 – 5 – b6)",
      intervals_asc: [0, 3, 6, 8, 14, 16, 20, 22],
      degrees_asc: ["1", "2-", "b3", "b4", "5", "b6", "b7", "b8"],
      intervals_desc: [0, 3, 6, 8, 14, 16, 20, 22],
      degrees_desc: ["1", "2-", "b3", "b4", "5", "b6", "b7", "b8"],
      cents_dev: { 3: -12, 8: -6 },
      sayr_phrases: [
        {
          title: "1. Istihlal — Tensão da Quarta Diminuta (b4)",
          summary: "Apresenta a célula central do Saba apoiada no b3 e na nota dolorosa b4.",
          steps: [
            { interval_q: 0, dur_ms: 460, accent: true },
            { interval_q: 3, dur_ms: 360 },
            { interval_q: 6, dur_ms: 460, accent: true },
            { interval_q: 8, dur_ms: 480 },
            { interval_q: 6, dur_ms: 360 },
            { interval_q: 3, dur_ms: 380 },
            { interval_q: 0, dur_ms: 640, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Clímax Hijaz sobre o b3",
          summary: "Expande o Jins Hijaz superposto entre b3, b4, 5 e b6.",
          steps: [
            { interval_q: 6, dur_ms: 440, accent: true },
            { interval_q: 8, dur_ms: 380 },
            { interval_q: 14, dur_ms: 460, accent: true },
            { interval_q: 16, dur_ms: 420 },
            { interval_q: 14, dur_ms: 360 },
            { interval_q: 8, dur_ms: 380 },
            { interval_q: 6, dur_ms: 560, accent: true }
          ]
        },
        {
          title: "3. Qafla — Recolhimento ao Qarar",
          summary: "Retorna do b4 suspirando sobre b3 e 2- até repousar no 1º grau.",
          steps: [
            { interval_q: 14, dur_ms: 400 },
            { interval_q: 8, dur_ms: 420 },
            { interval_q: 6, dur_ms: 400, accent: true },
            { interval_q: 3, dur_ms: 440 },
            { interval_q: 0, dur_ms: 740, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_sikah",
      name: "Maqam Sikah",
      description: "Baseado diretamente em uma tônica microtonal (E- / Sikah). Seu primeiro Jins é um tricorde luminoso de caráter contemplativo e ritualístico.",
      traditional_root_q: 7,
      ghammaz_q: 7,
      lower_jins: "Jins Sikah (1 – 2 – 3)",
      upper_jins_asc: "Jins Rast Superior (3 – 4 – 5 – 6 – 7)",
      upper_jins_desc: "Jins Rast (3 – 4 – 5 – 6 – 7)",
      intervals_asc: [0, 3, 7, 11, 14, 17, 21, 24],
      degrees_asc: ["1", "2", "3", "4", "5", "6", "7", "8"],
      intervals_desc: [0, 3, 7, 11, 14, 17, 21, 24],
      degrees_desc: ["1", "2", "3", "4", "5", "6", "7", "8"],
      cents_dev: { 0: -8, 14: -8 },
      sayr_phrases: [
        {
          title: "1. Istihlal — Tricorde Sikah",
          summary: "Estabelece a nota microtonal E- como centro estável com apoio no 3º grau (G).",
          steps: [
            { interval_q: 0, dur_ms: 520, accent: true },
            { interval_q: 3, dur_ms: 360 },
            { interval_q: 7, dur_ms: 480, accent: true },
            { interval_q: 3, dur_ms: 360 },
            { interval_q: 0, dur_ms: 620, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Abertura Rast no 3º Grau",
          summary: "Sobe pelo 4º e 5º graus explorando o brilho do registro superior.",
          steps: [
            { interval_q: 7, dur_ms: 460, accent: true },
            { interval_q: 11, dur_ms: 360 },
            { interval_q: 14, dur_ms: 460, accent: true },
            { interval_q: 17, dur_ms: 380 },
            { interval_q: 14, dur_ms: 360 },
            { interval_q: 7, dur_ms: 540, accent: true }
          ]
        },
        {
          title: "3. Qafla — Repouso em Sikah",
          summary: "Desce serenamente sobre o 3º e 2º graus até pousar na tônica microtonal.",
          steps: [
            { interval_q: 14, dur_ms: 400 },
            { interval_q: 11, dur_ms: 340 },
            { interval_q: 7, dur_ms: 420, accent: true },
            { interval_q: 3, dur_ms: 380 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_huzam",
      name: "Maqam Huzam",
      description: "O representante mais célebre da família Sikah: une o tricorde inicial microtonal ao Jins Hijaz no 3º grau, gerando grande magnetismo melódico.",
      traditional_root_q: 7,
      ghammaz_q: 7,
      lower_jins: "Jins Sikah (1 – 2 – 3)",
      upper_jins_asc: "Jins Hijaz (3 – b4 – 5 – 6)",
      upper_jins_desc: "Jins Hijaz (3 – b4 – 5 – 6)",
      intervals_asc: [0, 3, 7, 9, 15, 17, 21, 24],
      degrees_asc: ["1", "2", "3", "b4", "5", "6", "7", "8"],
      intervals_desc: [0, 3, 7, 9, 15, 17, 21, 24],
      degrees_desc: ["1", "2", "3", "b4", "5", "6", "7", "8"],
      cents_dev: { 0: -8 },
      sayr_phrases: [
        {
          title: "1. Istihlal — Base Sikah",
          summary: "Ancora o tricorde inicial antes de revelar o colorido Hijaz.",
          steps: [
            { interval_q: 0, dur_ms: 480, accent: true },
            { interval_q: 3, dur_ms: 360 },
            { interval_q: 7, dur_ms: 500, accent: true },
            { interval_q: 3, dur_ms: 340 },
            { interval_q: 0, dur_ms: 580, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Brilho Hijaz no 3º Grau",
          summary: "Expõe o salto de segunda aumentada entre o 4º grau bemol e o 5º grau.",
          steps: [
            { interval_q: 7, dur_ms: 440, accent: true },
            { interval_q: 9, dur_ms: 400 },
            { interval_q: 15, dur_ms: 460, accent: true },
            { interval_q: 17, dur_ms: 480 },
            { interval_q: 15, dur_ms: 360 },
            { interval_q: 9, dur_ms: 360 },
            { interval_q: 7, dur_ms: 540, accent: true }
          ]
        },
        {
          title: "3. Qafla — Descida ao Qarar Microtonal",
          summary: "Dissolve a tensão do Hijaz no repouso luminoso de Sikah.",
          steps: [
            { interval_q: 15, dur_ms: 400 },
            { interval_q: 9, dur_ms: 380 },
            { interval_q: 7, dur_ms: 440, accent: true },
            { interval_q: 3, dur_ms: 380 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_nikriz",
      name: "Maqam Nikriz",
      description: "Combina pentacorde menor com quarta aumentada (#4), gerando um salto de segunda aumentada interno entre b3 e #4 (equivalente ao Dórico #4).",
      traditional_root_q: 0,
      ghammaz_q: 14,
      lower_jins: "Jins Nikriz (1 – 2 – b3 – #4 – 5)",
      upper_jins_asc: "Jins Nahawand (5 – 6 – b7 – 8)",
      upper_jins_desc: "Jins Nahawand (5 – 6 – b7 – 8)",
      intervals_asc: [0, 4, 6, 12, 14, 18, 20, 24],
      degrees_asc: ["1", "2", "b3", "#4", "5", "6", "b7", "8"],
      intervals_desc: [0, 4, 6, 12, 14, 18, 20, 24],
      degrees_desc: ["1", "2", "b3", "#4", "5", "6", "b7", "8"],
      cents_dev: {},
      sayr_phrases: [
        {
          title: "1. Istihlal — Salto b3–#4 do Nikriz",
          summary: "Destaca a tensão cromática entre a terça menor e a quarta aumentada.",
          steps: [
            { interval_q: 0, dur_ms: 460, accent: true },
            { interval_q: 4, dur_ms: 340 },
            { interval_q: 6, dur_ms: 420 },
            { interval_q: 12, dur_ms: 440 },
            { interval_q: 14, dur_ms: 540, accent: true },
            { interval_q: 12, dur_ms: 340 },
            { interval_q: 6, dur_ms: 380 },
            { interval_q: 0, dur_ms: 600, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Registro Superior em Nawa (5)",
          summary: "Desenvolve o 6º grau maior e o b7 sobre a dominante.",
          steps: [
            { interval_q: 14, dur_ms: 440, accent: true },
            { interval_q: 18, dur_ms: 360 },
            { interval_q: 20, dur_ms: 420 },
            { interval_q: 24, dur_ms: 500, accent: true },
            { interval_q: 20, dur_ms: 340 },
            { interval_q: 18, dur_ms: 340 },
            { interval_q: 14, dur_ms: 520, accent: true }
          ]
        },
        {
          title: "3. Qafla — Cadência pelo #4",
          summary: "Resolve a dominante atravessando #4 e b3 até o Qarar.",
          steps: [
            { interval_q: 14, dur_ms: 420, accent: true },
            { interval_q: 12, dur_ms: 400 },
            { interval_q: 6, dur_ms: 400 },
            { interval_q: 4, dur_ms: 360 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_nawa_athar",
      name: "Maqam Nawa Athar",
      description: "Maqam dramático e simétrico da família Nikriz com dois saltos de segunda aumentada (b3–#4 e b6–7), célebre em obras instrumentais virtuosas.",
      traditional_root_q: 0,
      ghammaz_q: 14,
      lower_jins: "Jins Nikriz (1 – 2 – b3 – #4 – 5)",
      upper_jins_asc: "Jins Hijaz (5 – b6 – 7 – 8)",
      upper_jins_desc: "Jins Hijaz (5 – b6 – 7 – 8)",
      intervals_asc: [0, 4, 6, 12, 14, 16, 22, 24],
      degrees_asc: ["1", "2", "b3", "#4", "5", "b6", "7", "8"],
      intervals_desc: [0, 4, 6, 12, 14, 16, 22, 24],
      degrees_desc: ["1", "2", "b3", "#4", "5", "b6", "7", "8"],
      cents_dev: {},
      sayr_phrases: [
        {
          title: "1. Istihlal — Pentacorde Nikriz",
          summary: "Apresenta a base incisiva com #4 apontando para o 5º grau.",
          steps: [
            { interval_q: 0, dur_ms: 460, accent: true },
            { interval_q: 4, dur_ms: 320 },
            { interval_q: 6, dur_ms: 400 },
            { interval_q: 12, dur_ms: 420 },
            { interval_q: 14, dur_ms: 540, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Segundo Salto Aumentado (b6–7)",
          summary: "Explora o Jins Hijaz no registro agudo com forte atração para a oitava.",
          steps: [
            { interval_q: 14, dur_ms: 440, accent: true },
            { interval_q: 16, dur_ms: 380 },
            { interval_q: 22, dur_ms: 460 },
            { interval_q: 24, dur_ms: 540, accent: true },
            { interval_q: 22, dur_ms: 340 },
            { interval_q: 16, dur_ms: 360 },
            { interval_q: 14, dur_ms: 520, accent: true }
          ]
        },
        {
          title: "3. Qafla — Descida Duplamente Aumentada",
          summary: "Encadeia os dois saltos característicos na descida até a tônica.",
          steps: [
            { interval_q: 22, dur_ms: 380 },
            { interval_q: 16, dur_ms: 380 },
            { interval_q: 14, dur_ms: 420, accent: true },
            { interval_q: 12, dur_ms: 380 },
            { interval_q: 6, dur_ms: 380 },
            { interval_q: 4, dur_ms: 340 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    },
    {
      id: "maqam_ajam",
      name: "Maqam Ajam",
      description: "Correspondente árabe do modo Maior (12-TET), luminoso e festivo, tradicionalmente estruturado sobre Bb ou C com inflexão eventual de b7 na descida.",
      traditional_root_q: 20,
      ghammaz_q: 14,
      lower_jins: "Jins Ajam (1 – 2 – 3 – 4 – 5)",
      upper_jins_asc: "Jins Ajam Superior (5 – 6 – 7 – 8)",
      upper_jins_desc: "Jins Nahawand (5 – 6 – b7 – 8)",
      intervals_asc: [0, 4, 8, 10, 14, 18, 22, 24],
      degrees_asc: ["1", "2", "3", "4", "5", "6", "7", "8"],
      intervals_desc: [0, 4, 8, 10, 14, 18, 20, 24],
      degrees_desc: ["1", "2", "3", "4", "5", "6", "b7", "8"],
      cents_dev: {},
      linked_cadence: "cad_ajam_classic",
      sayr_phrases: [
        {
          title: "1. Istihlal — Clareza do Pentacorde Ajam",
          summary: "Afirma a terça maior (3) e a quinta justa (5) com caráter solar e direto.",
          steps: [
            { interval_q: 0, dur_ms: 460, accent: true },
            { interval_q: 4, dur_ms: 320 },
            { interval_q: 8, dur_ms: 420, accent: true },
            { interval_q: 10, dur_ms: 320 },
            { interval_q: 14, dur_ms: 520, accent: true },
            { interval_q: 8, dur_ms: 360 },
            { interval_q: 0, dur_ms: 580, accent: true }
          ]
        },
        {
          title: "2. Ghammaz — Ascensão à Oitava",
          summary: "Estende o fraseado a partir do 5º grau pela sensível maior (7).",
          steps: [
            { interval_q: 14, dur_ms: 440, accent: true },
            { interval_q: 18, dur_ms: 340 },
            { interval_q: 22, dur_ms: 400 },
            { interval_q: 24, dur_ms: 540, accent: true },
            { interval_q: 22, dur_ms: 320 },
            { interval_q: 18, dur_ms: 340 },
            { interval_q: 14, dur_ms: 520, accent: true }
          ]
        },
        {
          title: "3. Qafla — Descida Clássica ao Qarar",
          summary: "Desce do registro agudo apoiando na terça maior antes do repouso final.",
          steps: [
            { interval_q: 24, dur_ms: 400, accent: true },
            { interval_q: 20, dur_ms: 360 },
            { interval_q: 18, dur_ms: 320 },
            { interval_q: 14, dur_ms: 420, accent: true },
            { interval_q: 10, dur_ms: 320 },
            { interval_q: 8, dur_ms: 380 },
            { interval_q: 4, dur_ms: 320 },
            { interval_q: 0, dur_ms: 720, accent: true }
          ]
        }
      ]
    }
  ],

  ajnas: [
    {
      id: "jins_rast",
      name: "Jins Rast (Pentacorde)",
      description: "Bloco fundamental de 5 notas com terça neutra microtonal (1 – 2 – 3- – 4 – 5).",
      traditional_root_q: 0,
      ghammaz_q: 14,
      intervals_q: [0, 4, 7, 10, 14],
      degrees: ["1", "2", "3-", "4", "5"],
      cents_dev: [0, 0, -8, 0, 0]
    },
    {
      id: "jins_bayati",
      name: "Jins Bayati (Tetracorde)",
      description: "Tetracorde lírico definido pela segunda neutra (1 – 2- – b3 – 4).",
      traditional_root_q: 4,
      ghammaz_q: 10,
      intervals_q: [0, 3, 6, 10],
      degrees: ["1", "2-", "b3", "4"],
      cents_dev: [0, -12, 0, 0]
    },
    {
      id: "jins_hijaz",
      name: "Jins Hijaz (Tetracorde)",
      description: "Tetracorde com salto de segunda aumentada entre o 2º e o 3º graus (1 – b2 – 3 – 4).",
      traditional_root_q: 4,
      ghammaz_q: 10,
      intervals_q: [0, 2, 8, 10],
      degrees: ["1", "b2", "3", "4"],
      cents_dev: [0, 10, -10, 0]
    },
    {
      id: "jins_nahawand",
      name: "Jins Nahawand (Pentacorde)",
      description: "Pentacorde menor puro (1 – 2 – b3 – 4 – 5), base para modulações suaves.",
      traditional_root_q: 0,
      ghammaz_q: 14,
      intervals_q: [0, 4, 6, 10, 14],
      degrees: ["1", "2", "b3", "4", "5"],
      cents_dev: [0, 0, 0, 0, 0]
    },
    {
      id: "jins_kurd",
      name: "Jins Kurd (Tetracorde)",
      description: "Tetracorde frígio em 12-TET (1 – b2 – b3 – 4).",
      traditional_root_q: 4,
      ghammaz_q: 10,
      intervals_q: [0, 2, 6, 10],
      degrees: ["1", "b2", "b3", "4"],
      cents_dev: [0, 0, 0, 0]
    },
    {
      id: "jins_ajam",
      name: "Jins Ajam (Pentacorde)",
      description: "Pentacorde maior luminoso (1 – 2 – 3 – 4 – 5).",
      traditional_root_q: 20,
      ghammaz_q: 14,
      intervals_q: [0, 4, 8, 10, 14],
      degrees: ["1", "2", "3", "4", "5"],
      cents_dev: [0, 0, 0, 0, 0]
    },
    {
      id: "jins_sikah",
      name: "Jins Sikah (Tricorde)",
      description: "Tricorde ancorado em nota microtonal de 3 quartos de tom (1 – 2 – 3).",
      traditional_root_q: 7,
      ghammaz_q: 7,
      intervals_q: [0, 3, 7],
      degrees: ["1", "2", "3"],
      cents_dev: [-8, 0, 0]
    },
    {
      id: "jins_saba",
      name: "Jins Saba (Tetracorde Diminuto)",
      description: "Tetracorde expressivo com segunda neutra e quarta diminuta (1 – 2- – b3 – b4).",
      traditional_root_q: 4,
      ghammaz_q: 6,
      intervals_q: [0, 3, 6, 8],
      degrees: ["1", "2-", "b3", "b4"],
      cents_dev: [0, -12, 0, -6]
    },
    {
      id: "jins_nikriz",
      name: "Jins Nikriz (Pentacorde)",
      description: "Pentacorde menor com quarta aumentada (1 – 2 – b3 – #4 – 5).",
      traditional_root_q: 0,
      ghammaz_q: 14,
      intervals_q: [0, 4, 6, 12, 14],
      degrees: ["1", "2", "b3", "#4", "5"],
      cents_dev: [0, 0, 0, 0, 0]
    }
  ],

  scales: [
    {
      id: "scale_ionian",
      name: "Modo Jônio (Maior)",
      description: "Escala maior diatônica (12-TET), correspondente estrutural ao Maqam Ajam.",
      traditional_root_q: 0,
      intervals_q: [0, 4, 8, 10, 14, 18, 22, 24],
      degrees: ["1", "2", "3", "4", "5", "6", "7", "8"],
      ghammaz_q: [14],
      bridge_maqam: "maqam_ajam",
      bridge_text: "Maqam Ajam"
    },
    {
      id: "scale_dorian",
      name: "Modo Dórico",
      description: "Modo menor com 6ª maior natural, muito usado na fusão entre Oud e jazz modal.",
      traditional_root_q: 4,
      intervals_q: [0, 4, 6, 10, 14, 18, 20, 24],
      degrees: ["1", "2", "b3", "4", "5", "6", "b7", "8"],
      ghammaz_q: [14],
      bridge_maqam: "maqam_nahawand",
      bridge_text: "Maqam Nahawand"
    },
    {
      id: "scale_phrygian",
      name: "Modo Frígio",
      description: "Escala menor com 2ª menor (b2), idêntica em alturas ao Maqam Kurd.",
      traditional_root_q: 4,
      intervals_q: [0, 2, 6, 10, 14, 16, 20, 24],
      degrees: ["1", "b2", "b3", "4", "5", "b6", "b7", "8"],
      ghammaz_q: [10],
      bridge_maqam: "maqam_kurd",
      bridge_text: "Maqam Kurd"
    },
    {
      id: "scale_phrygian_dom",
      name: "Frígio Dominante (5º Modo Menor Harmônica)",
      description: "Equivalente temperado do Maqam Hijaz (1 – b2 – 3 – 4 – 5 – b6 – b7).",
      traditional_root_q: 4,
      intervals_q: [0, 2, 8, 10, 14, 16, 20, 24],
      degrees: ["1", "b2", "3", "4", "5", "b6", "b7", "8"],
      ghammaz_q: [10],
      bridge_maqam: "maqam_hijaz",
      bridge_text: "Maqam Hijaz"
    },
    {
      id: "scale_aeolian",
      name: "Modo Eólio (Menor Natural)",
      description: "Corresponde à descida do Maqam Nahawand (1 – 2 – b3 – 4 – 5 – b6 – b7).",
      traditional_root_q: 0,
      intervals_q: [0, 4, 6, 10, 14, 16, 20, 24],
      degrees: ["1", "2", "b3", "4", "5", "b6", "b7", "8"],
      ghammaz_q: [14],
      bridge_maqam: "maqam_nahawand",
      bridge_text: "Maqam Nahawand"
    },
    {
      id: "scale_harmonic_minor",
      name: "Menor Harmônica",
      description: "Corresponde à subida clássica do Maqam Nahawand com sensível maior (7).",
      traditional_root_q: 0,
      intervals_q: [0, 4, 6, 10, 14, 16, 22, 24],
      degrees: ["1", "2", "b3", "4", "5", "b6", "7", "8"],
      ghammaz_q: [14],
      bridge_maqam: "maqam_nahawand",
      bridge_text: "Maqam Nahawand"
    }
  ],

  chords: [
    {
      id: "chord_maj",
      name: "Tríade Maior",
      short_symbol: "",
      description: "Tríade maior estável (1 – 3 – 5), usada em cadências de Ajam e Hijaz.",
      traditional_root_q: 0,
      intervals_q: [0, 8, 14],
      degrees: ["1", "3", "5"],
      cents_dev: {},
      bridge_maqam: "maqam_ajam",
      bridge_text: "Maqam Ajam"
    },
    {
      id: "chord_min",
      name: "Tríade Menor",
      short_symbol: "m",
      description: "Tríade menor (1 – b3 – 5), base harmônica para Nahawand e Kurd.",
      traditional_root_q: 0,
      intervals_q: [0, 6, 14],
      degrees: ["1", "b3", "5"],
      cents_dev: {},
      bridge_maqam: "maqam_nahawand",
      bridge_text: "Maqam Nahawand"
    },
    {
      id: "chord_neutral",
      name: "Tríade Neutra (Rast)",
      short_symbol: "n",
      description: "Tríade microtonal característica do Oud com terça neutra (1 – 3- – 5).",
      traditional_root_q: 0,
      intervals_q: [0, 7, 14],
      degrees: ["1", "3-", "5"],
      cents_dev: { 7: -8 },
      bridge_maqam: "maqam_rast",
      bridge_text: "Maqam Rast"
    },
    {
      id: "chord_power5",
      name: "Quinta Aberta (Drone / Power 5)",
      short_symbol: "5",
      description: "Intervalo puro de tônica e quinta (1 – 5), compatível com qualquer Maqam sem conflito microtonal.",
      traditional_root_q: 0,
      intervals_q: [0, 14],
      degrees: ["1", "5"],
      cents_dev: {},
      bridge_maqam: "maqam_bayati",
      bridge_text: "Maqam Bayati"
    },
    {
      id: "chord_sus4",
      name: "Acorde Suspenso (sus4)",
      short_symbol: "sus4",
      description: "Suspensão modal (1 – 4 – 5) que preserva a ambiguidade da terça em passagens microtonais.",
      traditional_root_q: 0,
      intervals_q: [0, 10, 14],
      degrees: ["1", "4", "5"],
      cents_dev: {},
      bridge_maqam: "maqam_rast",
      bridge_text: "Maqam Rast"
    },
    {
      id: "chord_dom7",
      name: "Sétima da Dominante (7)",
      short_symbol: "7",
      description: "Tétrade dominante (1 – 3 – 5 – b7) para condução resolutiva em Nahawand e Hijaz.",
      traditional_root_q: 14,
      intervals_q: [0, 8, 14, 20],
      degrees: ["1", "3", "5", "b7"],
      cents_dev: {},
      bridge_maqam: "maqam_nahawand",
      bridge_text: "Maqam Nahawand"
    },
    {
      id: "chord_min7",
      name: "Menor com Sétima (m7)",
      short_symbol: "m7",
      description: "Tétrade menor suave (1 – b3 – 5 – b7), amplamente utilizada em acompanhamentos contemporâneos.",
      traditional_root_q: 4,
      intervals_q: [0, 6, 14, 20],
      degrees: ["1", "b3", "5", "b7"],
      cents_dev: {},
      bridge_maqam: "maqam_kurd",
      bridge_text: "Maqam Kurd"
    }
  ],

  cadences: [
    {
      id: "cad_rast_classic",
      name: "Qafla em Maqam Rast",
      description: "Progressão modal que respeita a terça neutra (3-) do Rast e utiliza a subtônica b7 antes da resolução final.",
      traditional_root_q: 0,
      bridge_maqam: "maqam_rast",
      bridge_text: "Maqam Rast",
      steps: [
        { roman: "I (n)", chord_id: "chord_neutral", offset_q: 0, role: "Abertura no Qarar com terça neutra (3-)" },
        { roman: "IV", chord_id: "chord_maj", offset_q: 10, role: "Afastamento luminoso no 4º grau (Jaharkah)" },
        { roman: "v (5)", chord_id: "chord_power5", offset_q: 14, role: "Apoio aberto no Ghammaz (Nawa)" },
        { roman: "bVII", chord_id: "chord_maj", offset_q: 20, role: "Subtônica descendente (Ajam)" },
        { roman: "I (n)", chord_id: "chord_neutral", offset_q: 0, role: "Repouso definitivo no Qarar" }
      ]
    },
    {
      id: "cad_bayati_classic",
      name: "Qafla em Maqam Bayati",
      description: "Acompanhamento aberto evitando choques com o 2º grau neutro (2-), valorizando o 4º grau (Ghammaz) e o b7.",
      traditional_root_q: 4,
      bridge_maqam: "maqam_bayati",
      bridge_text: "Maqam Bayati",
      steps: [
        { roman: "i (5)", chord_id: "chord_power5", offset_q: 0, role: "Base aberta sem terça sobre o Qarar" },
        { roman: "iv", chord_id: "chord_min", offset_q: 10, role: "Repouso expressivo no Ghammaz (4º grau)" },
        { roman: "bVII", chord_id: "chord_maj", offset_q: 20, role: "Preparação cadencial pela subtônica" },
        { roman: "i", chord_id: "chord_min", offset_q: 0, role: "Fechamento lírico no Qarar" }
      ]
    },
    {
      id: "cad_hijaz_classic",
      name: "Qafla em Maqam Hijaz",
      description: "Alternância magnética entre a tônica maior (I) e o acorde napolitano maior sobre o b2 (bII).",
      traditional_root_q: 4,
      bridge_maqam: "maqam_hijaz",
      bridge_text: "Maqam Hijaz",
      steps: [
        { roman: "I", chord_id: "chord_maj", offset_q: 0, role: "Afirmação da terça maior do Hijaz" },
        { roman: "bII", chord_id: "chord_maj", offset_q: 2, role: "Tensão característica do 2º grau bemol" },
        { roman: "iv", chord_id: "chord_min", offset_q: 10, role: "Desenvolvimento sobre o Ghammaz" },
        { roman: "bII", chord_id: "chord_maj", offset_q: 2, role: "Retorno tenso preparando a resolução" },
        { roman: "I", chord_id: "chord_maj", offset_q: 0, role: "Resolução no Qarar" }
      ]
    },
    {
      id: "cad_nahawand_classic",
      name: "Qafla em Maqam Nahawand",
      description: "Cadência menor clássica com dominante V7 ativando a sensível maior no tetracorde superior.",
      traditional_root_q: 0,
      bridge_maqam: "maqam_nahawand",
      bridge_text: "Maqam Nahawand",
      steps: [
        { roman: "i", chord_id: "chord_min", offset_q: 0, role: "Tônica menor (Qarar)" },
        { roman: "iv", chord_id: "chord_min", offset_q: 10, role: "Subdominante menor" },
        { roman: "V7", chord_id: "chord_dom7", offset_q: 14, role: "Dominante no Ghammaz com sensível (7)" },
        { roman: "i", chord_id: "chord_min", offset_q: 0, role: "Resolução definitiva" }
      ]
    },
    {
      id: "cad_kurd_classic",
      name: "Qafla Andaluza / Kurd",
      description: "Descida modal clássica iv – bIII – bII – i, ponte entre o Maqam Kurd e a tradição mediterrânea.",
      traditional_root_q: 4,
      bridge_maqam: "maqam_kurd",
      bridge_text: "Maqam Kurd",
      steps: [
        { roman: "i", chord_id: "chord_min", offset_q: 0, role: "Tônica Kurd" },
        { roman: "bVII", chord_id: "chord_maj", offset_q: 20, role: "Passagem pelo 7º grau menor" },
        { roman: "bVI", chord_id: "chord_maj", offset_q: 16, role: "Expansão no b6" },
        { roman: "bII", chord_id: "chord_maj", offset_q: 2, role: "Tensão frígia no b2" },
        { roman: "i", chord_id: "chord_min", offset_q: 0, role: "Resolução no Qarar" }
      ]
    },
    {
      id: "cad_ajam_classic",
      name: "Qafla em Maqam Ajam",
      description: "Progressão solar no modo maior árabe (I – IV – V7 – I).",
      traditional_root_q: 20,
      bridge_maqam: "maqam_ajam",
      bridge_text: "Maqam Ajam",
      steps: [
        { roman: "I", chord_id: "chord_maj", offset_q: 0, role: "Tônica maior Ajam" },
        { roman: "IV", chord_id: "chord_maj", offset_q: 10, role: "Subdominante" },
        { roman: "V7", chord_id: "chord_dom7", offset_q: 14, role: "Dominante no Ghammaz" },
        { roman: "I", chord_id: "chord_maj", offset_q: 0, role: "Resolução no Qarar" }
      ]
    }
  ],

  iqaat: [
    {
      id: "iqa_maqsum",
      name: "Maqsum (4/4) — Clássico",
      default_bpm: 96,
      pattern: [
        { stroke: "DUM", label: "D" },
        { stroke: "TAK", label: "T" },
        { stroke: "REST", label: "·" },
        { stroke: "TAK", label: "T" },
        { stroke: "DUM", label: "D" },
        { stroke: "REST", label: "·" },
        { stroke: "TAK", label: "T" },
        { stroke: "REST", label: "·" }
      ]
    },
    {
      id: "iqa_baladi",
      name: "Baladi / Masmudi Saghir (4/4)",
      default_bpm: 92,
      pattern: [
        { stroke: "DUM", label: "D" },
        { stroke: "DUM", label: "D" },
        { stroke: "REST", label: "·" },
        { stroke: "TAK", label: "T" },
        { stroke: "DUM", label: "D" },
        { stroke: "REST", label: "·" },
        { stroke: "TAK", label: "T" },
        { stroke: "REST", label: "·" }
      ]
    },
    {
      id: "iqa_saidi",
      name: "Sa'idi (4/4) — Alto Egito",
      default_bpm: 100,
      pattern: [
        { stroke: "DUM", label: "D" },
        { stroke: "TAK", label: "T" },
        { stroke: "REST", label: "·" },
        { stroke: "DUM", label: "D" },
        { stroke: "DUM", label: "D" },
        { stroke: "REST", label: "·" },
        { stroke: "TAK", label: "T" },
        { stroke: "REST", label: "·" }
      ]
    },
    {
      id: "iqa_malfuf",
      name: "Malfuf (2/4) — Energético",
      default_bpm: 118,
      pattern: [
        { stroke: "DUM", label: "D" },
        { stroke: "REST", label: "·" },
        { stroke: "REST", label: "·" },
        { stroke: "TAK", label: "T" },
        { stroke: "REST", label: "·" },
        { stroke: "REST", label: "·" },
        { stroke: "TAK", label: "T" },
        { stroke: "REST", label: "·" }
      ]
    },
    {
      id: "iqa_ayyub",
      name: "Ayyub / Zar (2/4) — Hipnótico",
      default_bpm: 112,
      pattern: [
        { stroke: "DUM", label: "D" },
        { stroke: "REST", label: "·" },
        { stroke: "REST", label: "·" },
        { stroke: "KAH", label: "K" },
        { stroke: "DUM", label: "D" },
        { stroke: "REST", label: "·" },
        { stroke: "TAK", label: "T" },
        { stroke: "REST", label: "·" }
      ]
    },
    {
      id: "iqa_samai_thaqil",
      name: "Sama'i Thaqil (10/8) — Clássico",
      default_bpm: 84,
      pattern: [
        { stroke: "DUM", label: "D" },
        { stroke: "REST", label: "·" },
        { stroke: "REST", label: "·" },
        { stroke: "TAK", label: "T" },
        { stroke: "REST", label: "·" },
        { stroke: "DUM", label: "D" },
        { stroke: "DUM", label: "D" },
        { stroke: "TAK", label: "T" },
        { stroke: "KAH", label: "k" },
        { stroke: "REST", label: "·" }
      ]
    }
  ]
};
