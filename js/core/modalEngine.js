// @ts-check
import { DB } from "./database.js";

export const MAX_NECK_Q = 16;

/**
 * Calcula a posição física X no espelho em pixels usando progressão logarítmica 24-TET.
 * @param {number} qFromNut
 * @param {number} nutX
 * @param {number} neckLengthPx
 * @param {boolean} isLeftHanded
 * @returns {number}
 */
export function getPhysicalX(qFromNut, nutX, neckLengthPx, isLeftHanded) {
  if (qFromNut === 0) return nutX;
  const ratio = (q) => 1 - Math.pow(2, -q / 24);
  const norm = ratio(qFromNut) / ratio(MAX_NECK_Q);
  return isLeftHanded ? (nutX - norm * neckLengthPx) : (nutX + norm * neckLengthPx);
}

/**
 * Resolve de forma pura e imutável a estrutura ativa com base no estado atual.
 * @param {import("./urlState.js").OudAppState} state
 */
export function getActiveStructure(state) {
  if (state.mode === "MAQAM") {
    const m = DB.maqamat.find(x => x.id === state.entityId) || DB.maqamat[0];
    const rawIntervals = state.direction === "ASC" ? m.intervals_asc : m.intervals_desc;
    const rawDegrees = state.direction === "ASC" ? m.degrees_asc : m.degrees_desc;

    let filteredIndices = rawIntervals.map((_, i) => i);
    if (state.jinsFilter === "LOWER") {
      filteredIndices = filteredIndices.filter(i => rawIntervals[i] <= m.lower_limit_q);
    } else if (state.jinsFilter === "UPPER") {
      filteredIndices = filteredIndices.filter(i => rawIntervals[i] >= m.ghammaz_q);
    }

    return {
      entity: m,
      effectiveRootQ: state.rootQ,
      intervals: filteredIndices.map(i => rawIntervals[i]),
      degrees: filteredIndices.map(i => rawDegrees[i]),
      centsMap: m.cents_dev || {},
      ghammazOffsets: [m.ghammaz_q]
    };
  }

  if (state.mode === "JINS") {
    const j = DB.ajnas.find(x => x.id === state.entityId) || DB.ajnas[0];
    /** @type {Record<number, number>} */
    const centsMap = {};
    j.intervals_q.forEach((intQ, idx) => {
      if (j.cents_dev[idx]) centsMap[intQ] = j.cents_dev[idx];
    });
    return {
      entity: j,
      effectiveRootQ: state.rootQ,
      intervals: j.intervals_q,
      degrees: j.degrees,
      centsMap,
      ghammazOffsets: [j.ghammaz_q]
    };
  }

  if (state.mode === "CHORD") {
    const c = DB.chords.find(x => x.id === state.entityId) || DB.chords[0];
    /** @type {Record<number, number>} */
    const centsMap = {};
    c.intervals_q.forEach((intQ, idx) => {
      if (c.cents_dev && c.cents_dev[idx]) centsMap[intQ] = c.cents_dev[idx];
    });
    return {
      entity: c,
      effectiveRootQ: state.rootQ,
      intervals: c.intervals_q,
      degrees: c.degrees,
      centsMap,
      ghammazOffsets: c.ghammaz_q !== undefined ? [c.ghammaz_q] : []
    };
  }

  if (state.mode === "CADENCE") {
    const cad = DB.cadences.find(x => x.id === state.entityId) || DB.cadences[0];
    const stepIdx = Math.min(state.cadenceStepIndex, cad.steps.length - 1);
    const stepObj = cad.steps[stepIdx];
    const chordObj = DB.chords.find(c => c.id === stepObj.chord_id) || DB.chords[0];
    const effectiveRootQ = (state.rootQ + stepObj.offset_q) % 24;

    /** @type {Record<number, number>} */
    const centsMap = {};
    chordObj.intervals_q.forEach((intQ, idx) => {
      if (chordObj.cents_dev && chordObj.cents_dev[idx]) centsMap[intQ] = chordObj.cents_dev[idx];
    });

    return {
      entity: cad,
      stepObj,
      chordObj,
      effectiveRootQ,
      intervals: chordObj.intervals_q,
      degrees: chordObj.degrees,
      centsMap,
      ghammazOffsets: chordObj.ghammaz_q !== undefined ? [chordObj.ghammaz_q] : []
    };
  }

  const s = DB.scales.find(x => x.id === state.entityId) || DB.scales[0];
  /** @type {number[]} */
  let ghammazOffsets = [];
  if (s.symmetry_step_q && s.symmetry_step_q < 24) {
    for (let q = s.symmetry_step_q; q < 24; q += s.symmetry_step_q) {
      ghammazOffsets.push(q);
    }
  } else if (s.ghammaz_q !== undefined) {
    ghammazOffsets = [s.ghammaz_q];
  }
  return {
    entity: s,
    effectiveRootQ: state.rootQ,
    intervals: s.intervals_q,
    degrees: s.degrees,
    centsMap: {},
    ghammazOffsets
  };
}

/**
 * Avalia se a nota pertence à caixa de digitação atual e retorna o dedo sugerido (0..4).
 * @param {number} qFromNut
 * @param {string} shapeMode
 * @param {number} boxAnchorQ
 */
export function evaluateShapeAndFinger(qFromNut, shapeMode, boxAnchorQ) {
  if (shapeMode === "FULL_NECK") {
    const defaultFinger = qFromNut === 0 ? 0 : Math.min(4, Math.ceil(qFromNut / 2));
    return { inBox: true, finger: defaultFinger };
  }
  if (shapeMode === "OPEN_FIRST_POS") {
    const inBox = qFromNut >= 0 && qFromNut <= 8;
    const finger = qFromNut === 0 ? 0 : Math.ceil(qFromNut / 2);
    return { inBox, finger };
  }
  const minQ = boxAnchorQ;
  const maxQ = minQ + 7;
  const inBox = qFromNut >= minQ && qFromNut <= maxQ;
  const finger = inBox ? Math.min(4, Math.floor((qFromNut - minQ) / 2) + 1) : "-";
  return { inBox, finger };
}

/**
 * Algoritmo heurístico que escolhe 1 nota ergonômica por ordem para acordes.
 * @param {any} tuning
 * @param {Map<number, any>} activeOffsetMap
 * @param {number} effectiveRootQ
 * @param {string} shapeMode
 * @param {number} boxAnchorQ
 * @returns {Record<number, number | null>}
 */
export function selectBestChordVoicingPerCourse(tuning, activeOffsetMap, effectiveRootQ, shapeMode, boxAnchorQ) {
  /** @type {Record<number, number | null>} */
  const selectedByCourse = {};
  const minQ = shapeMode === "CLOSED_BOX" ? boxAnchorQ : 0;
  const maxQ = shapeMode === "CLOSED_BOX" ? (boxAnchorQ + 7) : 8;

  let lowestNoteFound = false;

  for (let cIdx = 5; cIdx >= 0; cIdx--) {
    const cObj = tuning.courses[cIdx];
    const candidates = [];

    for (let qFromNut = minQ; qFromNut <= maxQ; qFromNut++) {
      const absQ = cObj.abs_q + qFromNut;
      const pitchClassQ = ((absQ % 24) + 24) % 24;
      const offsetFromRoot = ((pitchClassQ - effectiveRootQ) % 24 + 24) % 24;

      if (activeOffsetMap.has(offsetFromRoot)) {
        let score = 100 - qFromNut * 3;
        if (qFromNut === 0 && shapeMode !== "CLOSED_BOX") score += 25;
        if (!lowestNoteFound && offsetFromRoot === 0) score += 60;
        if (cIdx <= 3 && offsetFromRoot !== 0 && offsetFromRoot !== 14) score += 20;

        candidates.push({ qFromNut, offsetFromRoot, score });
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      selectedByCourse[cObj.course] = candidates[0].qFromNut;
      if (candidates[0].offsetFromRoot === 0) lowestNoteFound = true;
    } else {
      selectedByCourse[cObj.course] = null;
    }
  }

  return selectedByCourse;
}
