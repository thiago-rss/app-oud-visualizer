// @ts-check
import { DB } from "./database.js";

export const MAX_NECK_Q = 16;

/**
 * Converte a distância microtonal `qFromNut` (0 a 16 quartos de tom)
 * na coordenada física sobre o braço do Oud.
 *
 * @param {number} qFromNut
 * @param {number} nutX
 * @param {number} neckLengthPx
 * @param {boolean} isLeftHanded
 */
export function getPhysicalX(qFromNut, nutX, neckLengthPx, isLeftHanded) {
  const dir = isLeftHanded ? -1 : 1;
  if (qFromNut === 0) {
    return nutX - dir * 32;
  }
  const scaleLength = neckLengthPx / (1 - Math.pow(2, -MAX_NECK_Q / 24));
  const distFromNut = scaleLength * (1 - Math.pow(2, -qFromNut / 24));
  return nutX + dir * distFromNut;
}

/**
 * Retorna os limites (`startQ`, `endQ`, `thumbQ`, `anchorFinger1Q`) da posição anatômica selecionada.
 *
 * @param {string} shapeMode
 * @param {number} boxAnchorQ
 */
export function getPositionBounds(shapeMode, boxAnchorQ) {
  if (shapeMode === "OPEN_FIRST_POS") {
    return {
      startQ: 0,
      endQ: 8,
      anchorFinger1Q: 2,
      thumbQ: 3,
      labelPt: "I • 1ª Posição (0q–8q)",
      labelEn: "I • 1st Position (0q–8q)"
    };
  }
  if (shapeMode === "POS_SECOND") {
    return {
      startQ: 4,
      endQ: 10,
      anchorFinger1Q: 4,
      thumbQ: 5,
      labelPt: "II • 2ª Posição Média (4q–10q)",
      labelEn: "II • 2nd Mid Position (4q–10q)"
    };
  }
  if (shapeMode === "POS_THIRD_BODY") {
    return {
      startQ: 8,
      endQ: MAX_NECK_Q,
      anchorFinger1Q: 9,
      thumbQ: 10,
      labelPt: "III • 3ª Posição / Tampo (8q–16q)",
      labelEn: "III • 3rd Body Position (8q–16q)"
    };
  }
  if (shapeMode === "CLOSED_BOX") {
    const endQ = Math.min(MAX_NECK_Q, boxAnchorQ + 6);
    return {
      startQ: boxAnchorQ,
      endQ,
      anchorFinger1Q: boxAnchorQ,
      thumbQ: Math.min(MAX_NECK_Q, boxAnchorQ + 1),
      labelPt: `Shape Móvel (${boxAnchorQ}q–${endQ}q)`,
      labelEn: `Movable Box (${boxAnchorQ}q–${endQ}q)`
    };
  }
  return {
    startQ: 0,
    endQ: MAX_NECK_Q,
    anchorFinger1Q: 2,
    thumbQ: 3,
    labelPt: "Espelho Completo",
    labelEn: "Full Fingerboard"
  };
}

/**
 * Avalia se uma nota na posição `qFromNut` pertence à janela da posição ativa
 * e qual dedo da mão esquerda (`0`, `1`, `2`, `3`, `4`) a executa.
 *
 * @param {number} qFromNut
 * @param {string} shapeMode
 * @param {number} boxAnchorQ
 */
export function evaluateShapeAndFinger(qFromNut, shapeMode, boxAnchorQ) {
  if (qFromNut === 0) {
    const openAllowed = shapeMode === "FULL_NECK" || shapeMode === "OPEN_FIRST_POS";
    return { inBox: openAllowed, finger: 0 };
  }

  let anchorQ = 2;
  let inBox = true;

  if (shapeMode === "OPEN_FIRST_POS") {
    inBox = qFromNut <= 8;
    anchorQ = 2;
  } else if (shapeMode === "POS_SECOND") {
    inBox = qFromNut >= 4 && qFromNut <= 10;
    anchorQ = 4;
  } else if (shapeMode === "POS_THIRD_BODY") {
    inBox = qFromNut >= 8 && qFromNut <= MAX_NECK_Q;
    anchorQ = 9;
  } else if (shapeMode === "CLOSED_BOX") {
    inBox = qFromNut >= boxAnchorQ && qFromNut <= boxAnchorQ + 6;
    anchorQ = boxAnchorQ;
  } else {
    if (qFromNut <= 8) anchorQ = 2;
    else if (qFromNut <= 11) anchorQ = 6;
    else anchorQ = 10;
  }

  const relQ = qFromNut - anchorQ;
  let finger = 1;
  if (relQ <= 1) finger = 1;
  else if (relQ <= 3) finger = 2;
  else if (relQ <= 5) finger = 3;
  else finger = 4;

  return { inBox, finger };
}

/**
 * Identifica se uma nota sobre uma ordem funciona como Nota-Pivô de Mudança de Região
 * ou Uníssono de Cruzamento com a Ordem Aguda Adjacente.
 *
 * @param {number} qFromNut
 * @param {number} courseIdx
 * @param {any} tuning
 */
export function evaluateShiftPivot(qFromNut, courseIdx, tuning) {
  if (qFromNut <= 0) {
    return { isPivot: false, type: null, badge: "" };
  }

  if (courseIdx > 0 && tuning && Array.isArray(tuning.courses)) {
    const curCourse = tuning.courses[courseIdx];
    const nextHigherCourse = tuning.courses[courseIdx - 1];
    if (curCourse && nextHigherCourse) {
      const intervalToNextCourseQ = nextHigherCourse.abs_q - curCourse.abs_q;
      if (intervalToNextCourseQ > 0 && qFromNut === intervalToNextCourseQ) {
        return {
          isPivot: true,
          type: "UNISON_BRIDGE",
          badge: `=${nextHigherCourse.course}ª`
        };
      }
    }
  }

  if (qFromNut === 4) {
    return {
      isPivot: true,
      type: "SHIFT_POS2",
      badge: "⇄P2"
    };
  }
  if (qFromNut === 10) {
    return {
      isPivot: true,
      type: "SHIFT_POS3",
      badge: "⇄P3"
    };
  }

  return { isPivot: false, type: null, badge: "" };
}

/**
 * Seleciona o voicing mais ergonômico (1 nota por ordem) para acordes e Qaflat.
 *
 * @param {any} tuning
 * @param {Map<number, any>} activeOffsetMap
 * @param {number} effectiveRootQ
 * @param {string} shapeMode
 * @param {number} boxAnchorQ
 */
export function selectBestChordVoicingPerCourse(tuning, activeOffsetMap, effectiveRootQ, shapeMode, boxAnchorQ) {
  /** @type {Record<number, number | null>} */
  const voicing = {};
  const bounds = getPositionBounds(shapeMode, boxAnchorQ);
  const centerTargetQ = shapeMode === "CLOSED_BOX"
    ? boxAnchorQ + 2.5
    : (shapeMode === "POS_SECOND" ? 6.5 : (shapeMode === "POS_THIRD_BODY" ? 11 : 3.0));

  tuning.courses.forEach((/** @type {any} */ cObj) => {
    /** @type {{ qFromNut: number, score: number }[]} */
    const candidates = [];

    for (let qFromNut = bounds.startQ; qFromNut <= bounds.endQ; qFromNut++) {
      const absQ = cObj.abs_q + qFromNut;
      const pitchClassQ = ((absQ % 24) + 24) % 24;
      const offsetFromRoot = ((pitchClassQ - effectiveRootQ) % 24 + 24) % 24;
      if (!activeOffsetMap.has(offsetFromRoot)) continue;

      let score = 100 - Math.abs(qFromNut - centerTargetQ) * 6;
      if (offsetFromRoot === 0) score += 18;
      if (offsetFromRoot === 14) score += 10;
      if (qFromNut === 0 && bounds.startQ === 0) score += 14;
      candidates.push({ qFromNut, score });
    }

    candidates.sort((a, b) => b.score - a.score);
    voicing[cObj.course] = candidates.length > 0 ? candidates[0].qFromNut : null;
  });

  return voicing;
}

/**
 * Resolve a estrutura modal/harmônica ativa a partir do estado.
 *
 * @param {import("./urlState.js").OudAppState} state
 */
export function getActiveStructure(state) {
  const safeRootQ = ((state.rootQ % 24) + 24) % 24;

  if (state.mode === "JINS") {
    const entity = DB.ajnas.find(x => x.id === state.entityId) || DB.ajnas[0];
    /** @type {Record<number, number>} */
    const centsMap = {};
    entity.intervals_q.forEach((intQ, idx) => {
      centsMap[intQ] = entity.cents_dev[idx] || 0;
    });
    return {
      entity,
      effectiveRootQ: safeRootQ,
      intervals: entity.intervals_q,
      degrees: entity.degrees,
      ghammazOffsets: [entity.ghammaz_q],
      centsMap
    };
  }

  if (state.mode === "SCALE") {
    const entity = DB.scales.find(x => x.id === state.entityId) || DB.scales[0];
    return {
      entity,
      effectiveRootQ: safeRootQ,
      intervals: entity.intervals_q,
      degrees: entity.degrees,
      ghammazOffsets: entity.ghammaz_q || [],
      centsMap: /** @type {Record<number, number>} */ ({})
    };
  }

  if (state.mode === "CHORD") {
    const entity = DB.chords.find(x => x.id === state.entityId) || DB.chords[0];
    return {
      entity,
      effectiveRootQ: safeRootQ,
      intervals: entity.intervals_q,
      degrees: entity.degrees,
      ghammazOffsets: [14],
      centsMap: entity.cents_dev || /** @type {Record<number, number>} */ ({})
    };
  }

  if (state.mode === "CADENCE") {
    const entity = DB.cadences.find(x => x.id === state.entityId) || DB.cadences[0];
    const stepIdx = Math.max(0, Math.min(entity.steps.length - 1, state.cadenceStepIndex));
    const stepObj = entity.steps[stepIdx];
    const chordObj = DB.chords.find(c => c.id === stepObj.chord_id) || DB.chords[0];
    const effectiveRootQ = ((safeRootQ + stepObj.offset_q) % 24 + 24) % 24;
    return {
      entity,
      stepObj,
      chordObj,
      effectiveRootQ,
      intervals: chordObj.intervals_q,
      degrees: chordObj.degrees,
      ghammazOffsets: [14],
      centsMap: chordObj.cents_dev || /** @type {Record<number, number>} */ ({})
    };
  }

  const entity = DB.maqamat.find(x => x.id === state.entityId) || DB.maqamat[0];
  let rawIntervals = state.direction === "ASC" ? entity.intervals_asc : entity.intervals_desc;
  let rawDegrees = state.direction === "ASC" ? entity.degrees_asc : entity.degrees_desc;

  if (state.jinsFilter === "LOWER") {
    const splitIdx = rawIntervals.findIndex(q => q >= entity.ghammaz_q);
    const limit = splitIdx > 0 ? splitIdx + 1 : 4;
    rawIntervals = rawIntervals.slice(0, limit);
    rawDegrees = rawDegrees.slice(0, limit);
  } else if (state.jinsFilter === "UPPER") {
    const splitIdx = rawIntervals.findIndex(q => q >= entity.ghammaz_q);
    const start = splitIdx >= 0 ? splitIdx : 3;
    rawIntervals = rawIntervals.slice(start);
    rawDegrees = rawDegrees.slice(start);
  }

  return {
    entity,
    effectiveRootQ: safeRootQ,
    intervals: rawIntervals,
    degrees: rawDegrees,
    ghammazOffsets: [entity.ghammaz_q],
    centsMap: entity.cents_dev || /** @type {Record<number, number>} */ ({})
  };
}

/**
 * Calcula o caminho ergonômico de 1 oitava ancorado na nota `state.anchorAbsQ`.
 *
 * @param {import("./urlState.js").OudAppState} state
 */
export function computeAnchoredOctavePath(state) {
  if (typeof state.anchorAbsQ !== "number" || Number.isNaN(state.anchorAbsQ)) return [];

  const tuning = DB.tunings.find(t => t.id === state.tuningId) || DB.tunings[0];
  const activeStruct = getActiveStructure(state);
  const anchorAbsQ = state.anchorAbsQ;
  const isDesc = state.octavePathDir === "DESC";

  const baseIntervals = [...activeStruct.intervals];
  const baseDegrees = [...activeStruct.degrees];
  if (!baseIntervals.includes(24)) {
    baseIntervals.push(24);
    baseDegrees.push("8");
  }

  /** @type {{ targetAbsQ: number, intervalQ: number, degree: string }[]} */
  const targets = [];

  if (!isDesc) {
    baseIntervals.forEach((intQ, idx) => {
      if (intQ <= 24) {
        targets.push({
          targetAbsQ: anchorAbsQ + intQ,
          intervalQ: intQ % 24,
          degree: baseDegrees[idx] || String(idx + 1)
        });
      }
    });
  } else {
    const descList = [...baseIntervals].reverse();
    const descDegs = [...baseDegrees].reverse();
    descList.forEach((intQ, idx) => {
      if (intQ <= 24) {
        targets.push({
          targetAbsQ: anchorAbsQ - (24 - intQ),
          intervalQ: intQ % 24,
          degree: descDegs[idx] || ""
        });
      }
    });
  }

  /** @type {{ stepIndex: number, absQ: number, pitchClassQ: number, course: number, qFromNut: number, finger: number | string, degree: string, intervalQ: number }[]} */
  const resolvedNodes = [];
  let prevQFromNut = 3;

  targets.forEach((tObj, stepIndex) => {
    /** @type {{ course: number, qFromNut: number, cost: number }[]} */
    const candidates = [];

    tuning.courses.forEach(cObj => {
      const qFromNut = tObj.targetAbsQ - cObj.abs_q;
      if (qFromNut < 0 || qFromNut > MAX_NECK_Q) return;

      const shapeEval = evaluateShapeAndFinger(qFromNut, state.shapeMode, state.boxAnchorQ);
      let cost = Math.abs(qFromNut - prevQFromNut) * 2.2;
      if (!shapeEval.inBox) cost += 25;
      if (qFromNut > 10) cost += (qFromNut - 10) * 4;
      if (qFromNut === 0 && (state.shapeMode === "FULL_NECK" || state.shapeMode === "OPEN_FIRST_POS")) cost -= 3;

      candidates.push({ course: cObj.course, qFromNut, cost });
    });

    if (!candidates.length) return;
    candidates.sort((a, b) => a.cost - b.cost);
    const best = candidates[0];
    prevQFromNut = best.qFromNut > 0 ? best.qFromNut : prevQFromNut;

    const fingerEval = evaluateShapeAndFinger(best.qFromNut, state.shapeMode, state.boxAnchorQ);
    resolvedNodes.push({
      stepIndex,
      absQ: tObj.targetAbsQ,
      pitchClassQ: ((tObj.targetAbsQ % 24) + 24) % 24,
      course: best.course,
      qFromNut: best.qFromNut,
      finger: fingerEval.finger,
      degree: tObj.degree,
      intervalQ: tObj.intervalQ
    });
  });

  return resolvedNodes;
}
