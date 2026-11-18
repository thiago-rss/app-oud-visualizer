// @ts-check
import { DB } from "./database.js";

export const MAX_NECK_Q = 16;

/**
 * Calcula a posição física ao longo do braço (Horizontal ou Vertical) separando:
 * - q === 0 (Corda Solta): posicionada no trilho dedicado ANTES da pestana (recuo de 26px),
 *   deixando a barra de osso da pestana (Anf) 100% livre como marco zero físico.
 * - q >= 1 (Notas Pressionadas): distribuídas logaritmicamente sobre o espelho de ébano
 *   a partir da borda interna da pestana (+8px de margem física após o centro do osso).
 *
 * @param {number} q
 * @param {number} nutCoord
 * @param {number} neckLengthPx
 * @param {boolean} isReversed
 * @returns {number}
 */
export function getPhysicalX(q, nutCoord, neckLengthPx, isReversed) {
  const dir = isReversed ? -1 : 1;

  if (q <= 0) {
    return nutCoord - dir * 26;
  }

  const fingerboardStart = nutCoord + dir * 8;
  const usableLength = neckLengthPx - 8;
  const maxRatio = 1 - Math.pow(2, -MAX_NECK_Q / 24);
  const currentRatio = 1 - Math.pow(2, -q / 24);
  const offsetPx = usableLength * (currentRatio / maxRatio);

  return fingerboardStart + dir * offsetPx;
}

/**
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
    const inBox = qFromNut >= 1 && qFromNut <= 8;
    let finger = 1;
    if (qFromNut <= 3) finger = 1;
    else if (qFromNut <= 5) finger = 2;
    else if (qFromNut <= 6) finger = 3;
    else finger = 4;
    return { inBox, finger };
  }

  if (shapeMode === "CLOSED_BOX") {
    const relQ = qFromNut - boxAnchorQ;
    const inBox = relQ >= -1 && relQ <= 6 && qFromNut >= 1;
    let finger = 1;
    if (relQ <= 1) finger = 1;
    else if (relQ <= 3) finger = 2;
    else if (relQ <= 4) finger = 3;
    else finger = 4;
    return { inBox, finger };
  }

  let finger = 1;
  if (qFromNut <= 3) finger = 1;
  else if (qFromNut <= 5) finger = 2;
  else if (qFromNut <= 6) finger = 3;
  else if (qFromNut <= 8) finger = 4;
  else finger = Math.min(4, Math.max(1, Math.ceil((qFromNut - 8) / 2)));

  return { inBox: true, finger };
}

/**
 * @param {any} tuning
 * @param {Map<number, { degree: string, centsDev: number, rawInterval?: number }>} activeOffsetMap
 * @param {number} effectiveRootQ
 * @param {"FULL_NECK"|"OPEN_FIRST_POS"|"CLOSED_BOX"} shapeMode
 * @param {number} boxAnchorQ
 * @returns {Record<number, number | null>}
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
      if (offsetFromRoot === 0) score += 18;
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

/**
 * Calcula o percurso melódico e ergonômico de 1 Oitava completa (ascendente +24q ou descendente -24q)
 * ancorado exatamente na nota física (`anchorAbsQ`) escolhida pelo músico no braço do Oud.
 *
 * @param {import("./urlState.js").OudAppState} state
 * @returns {{
 *   stepIndex: number,
 *   absQ: number,
 *   pitchClassQ: number,
 *   course: number,
 *   qFromNut: number,
 *   finger: number,
 *   degree: string,
 *   freq: number,
 *   intervalQ: number
 * }[]}
 */
export function computeAnchoredOctavePath(state) {
  if (state.anchorAbsQ === null || state.anchorAbsQ === undefined) return [];

  const tuning = DB.tunings.find(t => t.id === state.tuningId) || DB.tunings[0];
  const activeStruct = getActiveStructure(state);

  // Para MAQAM na direção DESC do caminho de 1 oitava, usa intervalos descendentes autênticos (ex: b7 em Rast)
  let intervals = [...activeStruct.intervals];
  let degrees = [...activeStruct.degrees];
  if (state.mode === "MAQAM" && state.octavePathDir === "DESC") {
    const maq = /** @type {any} */ (activeStruct.entity);
    if (maq.intervals_desc && maq.degrees_desc) {
      intervals = [];
      degrees = [];
      maq.intervals_desc.forEach((/** @type {number} */ intQ, /** @type {number} */ idx) => {
        if (state.jinsFilter === "LOWER" && intQ > maq.lower_limit_q) return;
        if (state.jinsFilter === "UPPER" && intQ < maq.ghammaz_q) return;
        intervals.push(intQ);
        degrees.push(maq.degrees_desc[idx]);
      });
    }
  }

  // Garante fechamento na oitava (24q) para escalas/maqamat completos
  if (intervals.length > 1 && intervals[0] === 0 && intervals[intervals.length - 1] < 24 && state.jinsFilter === "ALL" && state.mode !== "JINS" && state.mode !== "CHORD" && state.mode !== "CADENCE") {
    intervals.push(24);
    degrees.push("8");
  }

  const orderedPairs = intervals.map((intQ, idx) => ({
    intQ,
    degree: degrees[idx] || "",
    centsDev: activeStruct.centsMap[intQ] || 0
  }));

  /** @type {{ absQ: number, intQ: number, degree: string, centsDev: number }[]} */
  const targetNotes = [];

  if (state.octavePathDir === "ASC") {
    orderedPairs.forEach(p => {
      targetNotes.push({
        absQ: state.anchorAbsQ + p.intQ,
        intQ: p.intQ,
        degree: p.degree,
        centsDev: p.centsDev
      });
    });
  } else {
    // Descendente: começa na nota âncora (anchorAbsQ) e desce 1 oitava (anchorAbsQ - 24)
    const rev = [...orderedPairs].reverse();
    rev.forEach(p => {
      const offsetDown = p.intQ - 24;
      targetNotes.push({
        absQ: state.anchorAbsQ + offsetDown,
        intQ: p.intQ,
        degree: p.degree,
        centsDev: p.centsDev
      });
    });
  }

  /** @type {ReturnType<typeof computeAnchoredOctavePath>} */
  const resolvedPath = [];
  let prevCourse = -1;
  let prevQFromNut = -1;

  targetNotes.forEach((tNote, stepIndex) => {
    /** @type {{ course: number, qFromNut: number, finger: number, freq: number, score: number }[]} */
    const candidates = [];

    tuning.courses.forEach(cObj => {
      const qFromNut = tNote.absQ - cObj.abs_q;
      if (qFromNut < 0 || qFromNut > MAX_NECK_Q) return;

      const shapeEval = evaluateShapeAndFinger(qFromNut, state.shapeMode, state.boxAnchorQ);
      if (state.shapeMode === "CLOSED_BOX" && !shapeEval.inBox) return;

      let score = 100 - qFromNut * 2.5;
      // Bônus forte para cordas soltas na 1ª posição ou espelho completo
      if (qFromNut === 0 && state.shapeMode !== "CLOSED_BOX") score += 28;
      // Mantém continuidade na mesma ordem ou avança para a ordem vizinha sem saltos bruscos
      if (prevCourse !== -1) {
        const courseDiff = Math.abs(cObj.course - prevCourse);
        if (courseDiff === 0) score += 16;
        else if (courseDiff === 1) score += 12;
        else score -= courseDiff * 14;

        if (qFromNut > 0 && prevQFromNut > 0) {
          score -= Math.abs(qFromNut - prevQFromNut) * 3;
        }
      }
      if (shapeEval.inBox) score += 20;

      const freq = cObj.freq_hz * Math.pow(2, (qFromNut * 50 + tNote.centsDev) / 1200);
      candidates.push({
        course: cObj.course,
        qFromNut,
        finger: shapeEval.finger,
        freq,
        score
      });
    });

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      const best = candidates[0];
      prevCourse = best.course;
      prevQFromNut = best.qFromNut;

      resolvedPath.push({
        stepIndex,
        absQ: tNote.absQ,
        pitchClassQ: ((tNote.absQ % 24) + 24) % 24,
        course: best.course,
        qFromNut: best.qFromNut,
        finger: best.finger,
        degree: tNote.degree,
        freq: best.freq,
        intervalQ: tNote.intQ
      });
    }
  });

  return resolvedPath;
}
