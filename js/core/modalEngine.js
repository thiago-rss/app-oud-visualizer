// @ts-check
import { DB } from "./database.js";

export const MAX_NECK_Q = 16;

/**
 * Calcula a posição física ao longo do braço (Horizontal ou Vertical) separando:
 * - q === 0 (Corda Solta): posicionada no trilho dedicado ANTES da pestana (recuo de 26px),
 *   deixando a barra de osso da pestana (Anf) 100% livre como marco zero físico.
 * - q >= 1 (Notas Pressionadas): distribuídas logaritmicamente sobre o espelho de ébano
 *   a partir da borda interna da pestana (+6px de margem física após o centro do osso).
 *
 * @param {number} q - Distância da pestana em quartos de tom (0 a 16)
 * @param {number} nutCoord - Coordenada X (horizontal) ou Y (vertical) do centro da pestana
 * @param {number} neckLengthPx - Comprimento visual do espelho em pixels
 * @param {boolean} isReversed - true quando canhoto no modo horizontal
 * @returns {number} Coordenada física exata no SVG
 */
export function getPhysicalX(q, nutCoord, neckLengthPx, isReversed) {
  const dir = isReversed ? -1 : 1;

  // Trilho de Cordas Soltas (q = 0) posicionado ANTES da pestana (na transição do cravelhal)
  if (q <= 0) {
    return nutCoord - dir * 26;
  }

  // Escala acústica logarítmica 24-TET: d(q) = L * (1 - 2^(-q/24))
  // Normalizada em MAX_NECK_Q com leve offset inicial (+8px da linha central da pestana)
  const fingerboardStart = nutCoord + dir * 8;
  const usableLength = neckLengthPx - 8;
  const maxRatio = 1 - Math.pow(2, -MAX_NECK_Q / 24);
  const currentRatio = 1 - Math.pow(2, -q / 24);
  const offsetPx = usableLength * (currentRatio / maxRatio);

  return fingerboardStart + dir * offsetPx;
}

/**
 * Avalia se uma posição qFromNut pertence ao Shape de mão esquerda selecionado
 * e calcula o dedo ergonômico correspondente (0 = Solta, 1 = Indicador, 2 = Médio, 3 = Anelar, 4 = Mínimo).
 *
 * @param {number} qFromNut
 * @param {"FULL_NECK"|"OPEN_FIRST_POS"|"CLOSED_BOX"} shapeMode
 * @param {number} boxAnchorQ
 * @returns {{ inBox: boolean, finger: number }}
 */
export function evaluateShapeAndFinger(qFromNut, shapeMode, boxAnchorQ) {
  if (qFromNut === 0) {
    const inBox = shapeMode !== "CLOSED_BOX";
    return { inBox, finger: 0 };
  }

  if (shapeMode === "OPEN_FIRST_POS") {
    // 1ª Posição Clássica (Ancorada em S1 / q=2, abrangendo de 1q até 8q)
    const inBox = qFromNut >= 1 && qFromNut <= 8;
    let finger = 1;
    if (qFromNut <= 3) finger = 1;      // 1q (Db-), 2q (C#/Db), 3q (D-)
    else if (qFromNut <= 5) finger = 2; // 4q (D), 5q (Eb-)
    else if (qFromNut <= 6) finger = 3; // 6q (Eb)
    else finger = 4;                    // 7q (E-), 8q (E)
    return { inBox, finger };
  }

  if (shapeMode === "CLOSED_BOX") {
    // Shape Móvel Fechado (Sem cordas soltas, janela de 7 quartos de tom a partir de boxAnchorQ)
    const relQ = qFromNut - boxAnchorQ;
    const inBox = relQ >= -1 && relQ <= 6 && qFromNut >= 1;
    let finger = 1;
    if (relQ <= 1) finger = 1;
    else if (relQ <= 3) finger = 2;
    else if (relQ <= 4) finger = 3;
    else finger = 4;
    return { inBox, finger };
  }

  // FULL_NECK: Espelho completo ativo, dedilhado de referência por região
  let finger = 1;
  if (qFromNut <= 3) finger = 1;
  else if (qFromNut <= 5) finger = 2;
  else if (qFromNut <= 6) finger = 3;
  else if (qFromNut <= 8) finger = 4;
  else finger = Math.min(4, Math.max(1, Math.ceil((qFromNut - 8) / 2)));

  return { inBox: true, finger };
}

/**
 * Seleciona a melhor nota (1 nota ergonômica por ordem) para montar o Voicing de um Acorde ou passo de Qafla.
 *
 * @param {any} tuning
 * @param {Map<number, { degree: string, centsDev: number, rawInterval?: number }>} activeOffsetMap
 * @param {number} effectiveRootQ
 * @param {"FULL_NECK"|"OPEN_FIRST_POS"|"CLOSED_BOX"} shapeMode
 * @param {number} boxAnchorQ
 * @returns {Record<number, number | null>} Mapa { [courseNumber]: qFromNut | null }
 */
export function selectBestChordVoicingPerCourse(tuning, activeOffsetMap, effectiveRootQ, shapeMode, boxAnchorQ) {
  /** @type {Record<number, number | null>} */
  const voicing = {};

  tuning.courses.forEach((/** @type {any} */ cObj) => {
    /** @type {{ q: number, score: number }[]} */
    const candidates = [];

    for (let qFromNut = 0; qFromNut <= MAX_NECK_Q; qFromNut++) {
      const absQ = cObj.abs_q + qFromNut;
      const pitchClassQ = ((absQ % 24) + 24) % 24;
      const offsetFromRoot = ((pitchClassQ - effectiveRootQ) % 24 + 24) % 24;
      if (!activeOffsetMap.has(offsetFromRoot)) continue;

      const shapeEval = evaluateShapeAndFinger(qFromNut, shapeMode, boxAnchorQ);
      if (shapeMode === "CLOSED_BOX" && !shapeEval.inBox) continue;
      if (shapeMode === "OPEN_FIRST_POS" && qFromNut > 8) continue;

      let score = 100 - qFromNut * 4;
      if (qFromNut === 0 && shapeMode !== "CLOSED_BOX") score += 25;
      if (offsetFromRoot === 0) score += 18; // Prioriza a fundamental nas ordens disponíveis
      if (shapeEval.inBox) score += 30;

      candidates.push({ q: qFromNut, score });
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      voicing[cObj.course] = candidates[0].q;
    } else {
      voicing[cObj.course] = null;
    }
  });

  return voicing;
}

/**
 * Resolve a estrutura teórica ativa (Maqam, Jins, Modo, Acorde ou Passo de Cadência Qafla)
 * retornando intervalos em quartos de tom, graus, desvios em cents e Ghammaz.
 *
 * @param {import("./urlState.js").OudAppState} state
 * @returns {{
 *   entity: any,
 *   effectiveRootQ: number,
 *   intervals: number[],
 *   degrees: string[],
 *   centsMap: Record<number, number>,
 *   ghammazOffsets: number[],
 *   chordObj?: any,
 *   stepObj?: any
 * }}
 */
export function getActiveStructure(state) {
  if (state.mode === "CADENCE") {
    const cad = DB.cadences.find(x => x.id === state.entityId) || DB.cadences[0];
    const stepIdx = Math.max(0, Math.min(cad.steps.length - 1, state.cadenceStepIndex));
    const stepObj = cad.steps[stepIdx];
    const chordObj = DB.chords.find(c => c.id === stepObj.chord_id) || DB.chords[0];
    const effectiveRootQ = (state.rootQ + stepObj.offset_q) % 24;

    /** @type {Record<number, number>} */
    const centsMap = {};
    chordObj.intervals_q.forEach((intQ, idx) => {
      centsMap[intQ] = chordObj.cents_dev?.[idx] || 0;
    });

    return {
      entity: cad,
      effectiveRootQ,
      intervals: chordObj.intervals_q,
      degrees: chordObj.degrees,
      centsMap,
      ghammazOffsets: chordObj.ghammaz_q !== undefined ? [chordObj.ghammaz_q] : [],
      chordObj,
      stepObj
    };
  }

  if (state.mode === "CHORD") {
    const ch = DB.chords.find(x => x.id === state.entityId) || DB.chords[0];
    /** @type {Record<number, number>} */
    const centsMap = {};
    ch.intervals_q.forEach((intQ, idx) => {
      centsMap[intQ] = ch.cents_dev?.[idx] || 0;
    });

    return {
      entity: ch,
      effectiveRootQ: state.rootQ,
      intervals: ch.intervals_q,
      degrees: ch.degrees,
      centsMap,
      ghammazOffsets: ch.ghammaz_q !== undefined ? [ch.ghammaz_q] : []
    };
  }

  if (state.mode === "JINS") {
    const jins = DB.ajnas.find(x => x.id === state.entityId) || DB.ajnas[0];
    /** @type {Record<number, number>} */
    const centsMap = {};
    jins.intervals_q.forEach((intQ, idx) => {
      centsMap[intQ] = jins.cents_dev?.[idx] || 0;
    });

    return {
      entity: jins,
      effectiveRootQ: state.rootQ,
      intervals: jins.intervals_q,
      degrees: jins.degrees,
      centsMap,
      ghammazOffsets: jins.ghammaz_q !== undefined ? [jins.ghammaz_q] : []
    };
  }

  if (state.mode === "SCALE") {
    const sc = DB.scales.find(x => x.id === state.entityId) || DB.scales[0];
    /** @type {number[]} */
    const ghammazOffsets = [];
    if (sc.ghammaz_q !== undefined) ghammazOffsets.push(sc.ghammaz_q);
    if (sc.symmetry_step_q) {
      for (let q = sc.symmetry_step_q; q < 24; q += sc.symmetry_step_q) {
        ghammazOffsets.push(q);
      }
    }

    return {
      entity: sc,
      effectiveRootQ: state.rootQ,
      intervals: sc.intervals_q,
      degrees: sc.degrees,
      centsMap: {},
      ghammazOffsets
    };
  }

  // Modo padrão: MAQAM
  const maq = DB.maqamat.find(x => x.id === state.entityId) || DB.maqamat[0];
  const rawIntervals = state.direction === "ASC" ? maq.intervals_asc : maq.intervals_desc;
  const rawDegrees = state.direction === "ASC" ? maq.degrees_asc : maq.degrees_desc;

  /** @type {number[]} */
  const filteredIntervals = [];
  /** @type {string[]} */
  const filteredDegrees = [];

  rawIntervals.forEach((intQ, idx) => {
    if (state.jinsFilter === "LOWER" && intQ > maq.lower_limit_q) return;
    if (state.jinsFilter === "UPPER" && intQ < maq.ghammaz_q) return;
    filteredIntervals.push(intQ);
    filteredDegrees.push(rawDegrees[idx]);
  });

  return {
    entity: maq,
    effectiveRootQ: state.rootQ,
    intervals: filteredIntervals,
    degrees: filteredDegrees,
    centsMap: maq.cents_dev || {},
    ghammazOffsets: maq.ghammaz_q !== undefined ? [maq.ghammaz_q] : []
  };
}
