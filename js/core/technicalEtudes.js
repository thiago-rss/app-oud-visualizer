// @ts-check
import { PITCH_CLASSES_24 } from "./database.js";
import { getActiveStructure, computePositionRegionSequence } from "./modalEngine.js";

/**
 * @typedef {"BROKEN_THIRDS"|"GROUPS_OF_3"|"BARIOLAGE_PEDAL"|"MICRO_FOCUS"} TechnicalEtudeKind
 */

/**
 * @typedef {Object} TechnicalEtudeStep
 * @property {number} absQ
 * @property {number} pitchClassQ
 * @property {number} intervalQ
 * @property {number} centsDev
 * @property {string} degree
 * @property {string} noteName
 * @property {"DOWN"|"UP"} risha
 * @property {number} baseDurMs
 * @property {boolean} accent
 * @property {number} [course]
 * @property {string|number} [finger]
 */

/**
 * @typedef {Object} TechnicalEtudeSpec
 * @property {TechnicalEtudeKind} kind
 * @property {string} title
 * @property {string} subtitle
 * @property {string} focusTip
 * @property {TechnicalEtudeStep[]} steps
 */

/**
 * Constrói uma lista base de notas (com `absQ`, `intervalQ`, `degree`, `centsDev`)
 * a partir da posição ativa quando possível, ou de uma oitava ancorada na tônica efetiva.
 * @param {any} state
 * @param {ReturnType<typeof getActiveStructure>} activeStruct
 */
function buildPoolNotes(state, activeStruct) {
  const effRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;
  const baseOctaveQ = effRootQ < 12 ? 24 : 12;
  const rootAbsQ = baseOctaveQ + effRootQ;

  const regionNotes = computePositionRegionSequence(state, state.shapeMode || "OPEN_FIRST_POS");
  const validSet = new Set(activeStruct.intervals.map((/** @type {number} */ q) => ((q % 24) + 24) % 24));

  /** @type {{ absQ: number, pitchClassQ: number, intervalQ: number, centsDev: number, degree: string, course?: number, finger?: string|number }[]} */
  const filteredRegion = [];
  if (Array.isArray(regionNotes) && regionNotes.length > 0) {
    regionNotes.forEach((/** @type {any} */ rn) => {
      const pcQ = ((rn.pitchClassQ % 24) + 24) % 24;
      const modQ = ((pcQ - effRootQ) % 24 + 24) % 24;
      if (validSet.has(modQ)) {
        const idx = activeStruct.intervals.indexOf(modQ);
        filteredRegion.push({
          absQ: rn.absQ,
          pitchClassQ: pcQ,
          intervalQ: rn.absQ - rootAbsQ,
          centsDev: activeStruct.centsMap?.[modQ] ?? activeStruct.centsMap?.[rn.absQ - rootAbsQ] ?? 0,
          degree: idx >= 0 ? (activeStruct.degrees[idx] || "") : "",
          course: rn.course,
          finger: rn.finger
        });
      }
    });
  }

  if (filteredRegion.length >= 5) {
    return filteredRegion.slice(0, 12);
  }

  /** @type {{ absQ: number, pitchClassQ: number, intervalQ: number, centsDev: number, degree: string }[]} */
  const fallback = [];
  const rawIntervals = activeStruct.intervals.slice(0, 8);
  rawIntervals.forEach((/** @type {number} */ intQ, /** @type {number} */ idx) => {
    const absQ = rootAbsQ + intQ;
    const pcQ = ((absQ % 24) + 24) % 24;
    fallback.push({
      absQ,
      pitchClassQ: pcQ,
      intervalQ: intQ,
      centsDev: activeStruct.centsMap?.[intQ] ?? 0,
      degree: activeStruct.degrees[idx] || ""
    });
  });

  // Se houver apenas 1 oitava curta, estende 3 notas para permitir terças e grupos de 3
  if (fallback.length > 0 && fallback.length < 6) {
    const secondOctStart = rootAbsQ + 24;
    rawIntervals.slice(0, 4).forEach((/** @type {number} */ intQ, /** @type {number} */ idx) => {
      const absQ = secondOctStart + intQ;
      const pcQ = ((absQ % 24) + 24) % 24;
      fallback.push({
        absQ,
        pitchClassQ: pcQ,
        intervalQ: absQ - rootAbsQ,
        centsDev: activeStruct.centsMap?.[intQ] ?? 0,
        degree: activeStruct.degrees[idx] || ""
      });
    });
  }

  return fallback;
}

/**
 * Converte uma nota base em `TechnicalEtudeStep` com direção de Risha (`↓` / `↑`).
 * @param {any} n
 * @param {number} stepIndex
 * @param {"DOWN"|"UP"} [forcedRisha]
 * @param {number} [baseDurMs=320]
 * @returns {TechnicalEtudeStep}
 */
function toEtudeStep(n, stepIndex, forcedRisha, baseDurMs = 320) {
  const pc = PITCH_CLASSES_24[((n.pitchClassQ % 24) + 24) % 24] || PITCH_CLASSES_24[0];
  /** @type {"DOWN"|"UP"} */
  const risha = forcedRisha || (stepIndex % 2 === 0 ? "DOWN" : "UP");
  return {
    absQ: n.absQ,
    pitchClassQ: n.pitchClassQ,
    intervalQ: n.intervalQ,
    centsDev: n.centsDev || 0,
    degree: n.degree || "",
    noteName: pc.flat,
    risha,
    baseDurMs,
    accent: stepIndex === 0 || risha === "DOWN",
    course: n.course,
    finger: n.finger
  };
}

/**
 * Retorna os tipos de estudo técnico recomendados para a lição atual.
 * @param {any} lesson
 * @returns {TechnicalEtudeKind[]}
 */
export function getAvailableEtudeKinds(lesson) {
  /** @type {TechnicalEtudeKind[]} */
  const base = ["BROKEN_THIRDS", "GROUPS_OF_3", "BARIOLAGE_PEDAL"];
  const p = lesson?.preset || {};
  const hasMicro =
    Boolean(p.showMicroGuides) ||
    Boolean(lesson?.suggestLivePitch) ||
    (typeof p.entityId === "string" && (p.entityId.includes("sikah") || p.entityId.includes("bayati") || p.entityId.includes("rast") || p.entityId.includes("saba") || p.entityId.includes("huzam") || p.entityId.includes("blues_micro")));

  if (hasMicro) {
    return ["MICRO_FOCUS", "BROKEN_THIRDS", "GROUPS_OF_3", "BARIOLAGE_PEDAL"];
  }
  return base;
}

/**
 * Gera um estudo técnico procedural específico para a lição, estado atual e tipo escolhido.
 * @param {any} state
 * @param {any} lesson
 * @param {TechnicalEtudeKind} kind
 * @returns {TechnicalEtudeSpec}
 */
export function generateTechnicalEtude(state, lesson, kind) {
  const isEn = state?.lang === "en";
  const activeStruct = getActiveStructure(state);
  const pool = buildPoolNotes(state, activeStruct);
  const effRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;
  const rootAbsQ = (effRootQ < 12 ? 24 : 12) + effRootQ;

  if (!pool.length) {
    return {
      kind,
      title: isEn ? "Technical Etude" : "Estudo Técnico",
      subtitle: "",
      focusTip: "",
      steps: []
    };
  }

  if (kind === "BROKEN_THIRDS") {
    // Padrão 0 -> +2 -> +1 -> +3 (terças quebradas / ziguezague intervalar)
    /** @type {TechnicalEtudeStep[]} */
    const steps = [];
    const maxStart = Math.max(0, pool.length - 3);
    for (let i = 0; i < maxStart; i++) {
      const a = pool[i];
      const b = pool[Math.min(pool.length - 1, i + 2)];
      const c = pool[Math.min(pool.length - 1, i + 1)];
      steps.push(toEtudeStep(a, steps.length, "DOWN", 300));
      steps.push(toEtudeStep(b, steps.length, "UP", 300));
      steps.push(toEtudeStep(c, steps.length, "DOWN", 300));
    }
    if (steps.length < 3 && pool.length >= 2) {
      steps.push(toEtudeStep(pool[0], 0, "DOWN", 320));
      steps.push(toEtudeStep(pool[pool.length - 1], 1, "UP", 320));
      steps.push(toEtudeStep(pool[0], 2, "DOWN", 380));
    }

    return {
      kind,
      title: isEn ? "Broken Thirds (Interval Zigzag)" : "Terças Quebradas (Ziguezague)",
      subtitle: isEn
        ? "Alternates leaps and steps inside the active mode to build left-hand independence and clean string crossings."
        : "Alterna saltos e graus conjuntos dentro do modo ativo para desenvolver independência dos dedos e troca limpa entre cordas.",
      focusTip: isEn
        ? "Keep ↓ on the lower/anchor pitch and ↑ on the answering note without lifting unused fingers early."
        : "Mantenha ↓ no apoio/grave e ↑ na resposta sem levantar os dedos anteriores antes da hora.",
      steps
    };
  }

  if (kind === "GROUPS_OF_3") {
    // Grupos de 3 notas avançando de grau em grau
    /** @type {TechnicalEtudeStep[]} */
    const steps = [];
    const limit = Math.min(Math.max(1, pool.length - 2), 6);
    for (let i = 0; i < limit; i++) {
      for (let g = 0; g < 3; g++) {
        const note = pool[Math.min(pool.length - 1, i + g)];
        const risha = g === 0 ? "DOWN" : (g === 1 ? "UP" : "DOWN");
        steps.push(toEtudeStep(note, steps.length, risha, 290));
      }
    }

    return {
      kind,
      title: isEn ? "3-Note Grouping Cells" : "Grupos de 3 Notas",
      subtitle: isEn
        ? "Shifts 3-note cells step-by-step so phrases do not collapse into monotonous scale runs."
        : "Desloca células de 3 notas grau a grau para quebrar o automatismo de subir e descer escalas por inteiro.",
      focusTip: isEn
        ? "Accent the first note of each 3-note cell slightly with ↓ Risha while keeping the 2nd and 3rd notes even."
        : "Acentue de leve a 1ª nota de cada grupo de 3 com Risha ↓ e mantenha as duas seguintes equilibradas.",
      steps
    };
  }

  if (kind === "BARIOLAGE_PEDAL") {
    // Alterna notas da célula com o Qarar / tônica efetiva como pedal
    /** @type {TechnicalEtudeStep[]} */
    const steps = [];
    const pedalNote = {
      absQ: rootAbsQ,
      pitchClassQ: effRootQ,
      intervalQ: 0,
      centsDev: activeStruct.centsMap?.[0] ?? 0,
      degree: activeStruct.degrees[0] || "1"
    };

    const melodySlice = pool.slice(1, Math.min(pool.length, 6));
    const targetSeq = melodySlice.length ? melodySlice : pool.slice(0, Math.min(pool.length, 4));
    targetSeq.forEach((melNote) => {
      steps.push(toEtudeStep(melNote, steps.length, "DOWN", 310));
      steps.push(toEtudeStep(pedalNote, steps.length, "UP", 310));
    });

    return {
      kind,
      title: isEn ? "Pedal & Risha Alternation (↓ / ↑)" : "Pedal de Tônica & Risha Alternada (↓ / ↑)",
      subtitle: isEn
        ? "Pairs moving pitches with the tonic pedal using strict ↓ (down) and ↑ (up) Risha strokes."
        : "Intercala notas móveis com o pedal da tônica usando palhetada rigorosamente alternada ↓ (descendente) e ↑ (ascendente).",
      focusTip: isEn
        ? "Keep the tonic pedal softer than the moving melody notes so two distinct layers stay audible."
        : "Mantenha o pedal em volume mais contido que a melodia para que as duas camadas soem nítidas.",
      steps
    };
  }

  // MICRO_FOCUS: destaca graus microtonais (pitchClass.micro ou |centsDev| > 0) intercalados com a tônica
  /** @type {TechnicalEtudeStep[]} */
  const steps = [];
  const microCandidates = pool.filter(n => {
    const pc = PITCH_CLASSES_24[((n.pitchClassQ % 24) + 24) % 24];
    return Boolean(pc?.micro) || Math.abs(n.centsDev || 0) > 0;
  });
  const targets = microCandidates.length ? microCandidates.slice(0, 4) : pool.slice(1, Math.min(pool.length, 4));
  const tonicRef = pool[0];

  targets.forEach((tNote) => {
    steps.push(toEtudeStep(tonicRef, steps.length, "DOWN", 340));
    steps.push(toEtudeStep(tNote, steps.length, "UP", 460));
    steps.push(toEtudeStep(tNote, steps.length, "DOWN", 380));
  });

  return {
    kind: "MICRO_FOCUS",
    title: isEn ? "Microtonal & Quarter-Tone Drill" : "Foco Microtonal & Quartos de Tom",
    subtitle: isEn
      ? "Isolates neutral and inflection degrees against the tonic so your ear locks pitch center before adding speed."
      : "Isola graus neutros e inflexões contra a tônica para treinar o centro de afinação antes de ganhar velocidade.",
    focusTip: isEn
      ? "Listen closely to the second pluck of each target pitch: settle still without sliding past the center."
      : "Ouça com atenção o segundo toque em cada nota-alvo: estabilize sem ultrapassar o centro microtonal.",
    steps
  };
}
