// @ts-check
import { DB, PITCH_CLASSES_24 } from "../core/database.js";
import { getActiveStructure, evaluateShapeAndFinger, selectBestChordVoicingPerCourse, MAX_NECK_Q } from "../core/modalEngine.js";
import { t } from "../core/i18n.js";
import { playPluckedNote } from "../audio/synthEngine.js";

/**
 * Mapeia cada um dos 24 quartos de tom (0..23) para:
 * - stepInOctave: 0=C, 1=D, 2=E, 3=F, 4=G, 5=A, 6=B
 * - acc: "" | "b-" (meio-bemol) | "b" (bemol) | "+" (meio-sustenido) | "#" (sustenido)
 * @param {number} pitchClassQ
 * @param {string} [degreeHint=""]
 * @returns {{ stepInOctave: number, acc: string, letter: string }}
 */
export function resolveStaffSpelling(pitchClassQ, degreeHint = "") {
  const q = ((pitchClassQ % 24) + 24) % 24;
  const preferSharp = degreeHint.includes("#") || degreeHint.includes("+");

  /** @type {Record<number, { stepInOctave: number, acc: string, letter: string }>} */
  const map = {
    0:  { stepInOctave: 0, acc: "",   letter: "C" },
    1:  { stepInOctave: 1, acc: "b-", letter: "D" },
    2:  preferSharp ? { stepInOctave: 0, acc: "#", letter: "C" } : { stepInOctave: 1, acc: "b", letter: "D" },
    3:  { stepInOctave: 1, acc: "b-", letter: "D" },
    4:  { stepInOctave: 1, acc: "",   letter: "D" },
    5:  { stepInOctave: 2, acc: "b-", letter: "E" }, // Sikah (Eb-)
    6:  preferSharp ? { stepInOctave: 1, acc: "#", letter: "D" } : { stepInOctave: 2, acc: "b", letter: "E" },
    7:  { stepInOctave: 2, acc: "b-", letter: "E" }, // Tik Kurdi / E-
    8:  { stepInOctave: 2, acc: "",   letter: "E" },
    9:  { stepInOctave: 3, acc: "b-", letter: "F" },
    10: { stepInOctave: 3, acc: "",   letter: "F" },
    11: { stepInOctave: 3, acc: "+",  letter: "F" }, // Nim Hijaz (F+)
    12: degreeHint.includes("b") ? { stepInOctave: 4, acc: "b", letter: "G" } : { stepInOctave: 3, acc: "#", letter: "F" },
    13: { stepInOctave: 3, acc: "+",  letter: "F" }, // Tik Hijaz (F#+)
    14: { stepInOctave: 4, acc: "",   letter: "G" },
    15: { stepInOctave: 5, acc: "b-", letter: "A" },
    16: preferSharp ? { stepInOctave: 4, acc: "#", letter: "G" } : { stepInOctave: 5, acc: "b", letter: "A" },
    17: { stepInOctave: 5, acc: "b-", letter: "A" }, // A-
    18: { stepInOctave: 5, acc: "",   letter: "A" },
    19: { stepInOctave: 6, acc: "b-", letter: "B" }, // Awj / Iraq (Bb-)
    20: { stepInOctave: 6, acc: "b",  letter: "B" }, // Ajam (Bb)
    21: { stepInOctave: 6, acc: "b-", letter: "B" }, // Tik Ajam (B-)
    22: { stepInOctave: 6, acc: "",   letter: "B" },
    23: { stepInOctave: 6, acc: "+",  letter: "B" }
  };

  return map[q] || { stepInOctave: 0, acc: "", letter: "C" };
}

/**
 * Converte um índice absoluto em quartos de tom (`absQ`, onde C2 = 0) para
 * o degrau diatônico na pauta (onde C2 = 0, E3 [1ª linha da Clave de Sol 8vb] = 9, F4 [5ª linha] = 17).
 * @param {number} absQ
 * @param {string} [degreeHint=""]
 */
export function getStaffVerticalGeometry(absQ, degreeHint = "") {
  const octaveFromC2 = Math.floor(absQ / 24);
  const pitchClassQ = ((absQ % 24) + 24) % 24;
  const spelling = resolveStaffSpelling(pitchClassQ, degreeHint);
  const totalStep = octaveFromC2 * 7 + spelling.stepInOctave;
  return {
    totalStep,
    pitchClassQ,
    acc: spelling.acc,
    letter: spelling.letter,
    octaveNumber: octaveFromC2 + 2
  };
}

/**
 * Calcula a coordenada Y na pauta a partir do `totalStep`.
 * Linha 1 (E3, step 9) fica em `line1Y`. Cada degrau diatônico (linha->espaço) = `stepHalfSpacePx` (6px).
 * @param {number} totalStep
 * @param {number} line1Y
 * @param {number} [stepHalfSpacePx=6]
 */
function stepToY(totalStep, line1Y, stepHalfSpacePx = 6) {
  return line1Y - (totalStep - 9) * stepHalfSpacePx;
}

/**
 * Desenha um acidente vetorial (Bemol, Meio-Bemol Árabe Cortado, Sustenido ou Meio-Sustenido)
 * @param {SVGElement} parent
 * @param {string} acc - "" | "b" | "b-" | "#" | "+"
 * @param {number} x
 * @param {number} y
 * @param {string} color
 */
function drawAccidentalGlyph(parent, acc, x, y, color) {
  if (!acc) return;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  if (acc === "b" || acc === "b-") {
    // Haste vertical e barriga do bemol
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x - 3},${y - 12} L ${x - 3},${y + 4} Q ${x + 4.5},${y + 1} ${x + 3.5},${y - 3.5} Q ${x + 2.5},${y - 6.5} ${x - 3},${y - 3.5}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "1.65");
    path.setAttribute("stroke-linecap", "round");
    g.appendChild(path);

    // Traço diagonal característico do Meio-Bemol Árabe (Nim / Sikah)
    if (acc === "b-") {
      const slash = document.createElementNS("http://www.w3.org/2000/svg", "line");
      slash.setAttribute("x1", String(x - 6));
      slash.setAttribute("y1", String(y - 6));
      slash.setAttribute("x2", String(x + 2));
      slash.setAttribute("y2", String(y - 10));
      slash.setAttribute("stroke", "#f0abfc");
      slash.setAttribute("stroke-width", "1.8");
      slash.setAttribute("stroke-linecap", "round");
      g.appendChild(slash);
    }
  } else if (acc === "#") {
    // Sustenido padrão (2 hastes verticais + 2 barras inclinadas)
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute(
      "d",
      `M ${x - 2.5},${y - 9} L ${x - 2.5},${y + 7} M ${x + 2.5},${y - 10} L ${x + 2.5},${y + 6}
       M ${x - 5.5},${y - 2} L ${x + 5.5},${y - 4.5} M ${x - 5.5},${y + 3} L ${x + 5.5},${y + 0.5}`
    );
    p.setAttribute("stroke", color);
    p.setAttribute("stroke-width", "1.5");
    p.setAttribute("stroke-linecap", "round");
    g.appendChild(p);
  } else if (acc === "+") {
    // Meio-Sustenido (Tik — 1 haste vertical central + 2 barras inclinadas)
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute(
      "d",
      `M ${x},${y - 9.5} L ${x},${y + 7.5}
       M ${x - 4.8},${y - 2} L ${x + 4.8},${y - 4.5} M ${x - 4.8},${y + 3} L ${x + 4.8},${y + 0.5}`
    );
    p.setAttribute("stroke", "#f0abfc");
    p.setAttribute("stroke-width", "1.65");
    p.setAttribute("stroke-linecap", "round");
    g.appendChild(p);
  }

  parent.appendChild(g);
}

/**
 * Desenha as linhas suplementares (ledger lines) inferiores ou superiores para um dado `totalStep`.
 * @param {SVGElement} parent
 * @param {number} cx
 * @param {number} totalStep
 * @param {number} line1Y
 */
function drawLedgerLines(parent, cx, totalStep, line1Y) {
  // Abaixo da 1ª linha (step 9): linhas suplementares em 7 (C3), 5 (A2), 3 (F2), 1 (D2), -1
  if (totalStep <= 7) {
    for (let s = 7; s >= totalStep; s -= 2) {
      const ly = stepToY(s, line1Y);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(cx - 12));
      line.setAttribute("y1", String(ly));
      line.setAttribute("x2", String(cx + 12));
      line.setAttribute("y2", String(ly));
      line.setAttribute("stroke", "rgba(245, 235, 230, 0.55)");
      line.setAttribute("stroke-width", "1.3");
      parent.appendChild(line);
    }
  }
  // Acima da 5ª linha (step 17): linhas suplementares em 19 (A4), 21 (C5), 23 (E5)
  if (totalStep >= 19) {
    for (let s = 19; s <= totalStep; s += 2) {
      const ly = stepToY(s, line1Y);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(cx - 12));
      line.setAttribute("y1", String(ly));
      line.setAttribute("x2", String(cx + 12));
      line.setAttribute("y2", String(ly));
      line.setAttribute("stroke", "rgba(245, 235, 230, 0.55)");
      line.setAttribute("stroke-width", "1.3");
      parent.appendChild(line);
    }
  }
}

/**
 * Encontra em quais ordens/dedos do Oud uma altura absoluta `targetAbsQ` pode ser tocada dentro do shape atual.
 * @param {any} tuning
 * @param {number} targetAbsQ
 * @param {string} shapeMode
 * @param {number} boxAnchorQ
 * @returns {string} Ex: "3ª:D0 | 4ª:D3"
 */
function findPlayableLocationsForPitch(tuning, targetAbsQ, shapeMode, boxAnchorQ) {
  /** @type {string[]} */
  const matches = [];
  tuning.courses.forEach((/** @type {any} */ cObj) => {
    const qFromNut = targetAbsQ - cObj.abs_q;
    if (qFromNut >= 0 && qFromNut <= MAX_NECK_Q) {
      const shapeEval = evaluateShapeAndFinger(qFromNut, shapeMode, boxAnchorQ);
      if (shapeEval.inBox) {
        matches.push(`${cObj.course}ª:D${shapeEval.finger}`);
      }
    }
  });

  if (matches.length === 0) {
    // Fallback fora do box caso não haja no shape fechado atual
    tuning.courses.forEach((/** @type {any} */ cObj) => {
      const qFromNut = targetAbsQ - cObj.abs_q;
      if (qFromNut >= 0 && qFromNut <= MAX_NECK_Q) {
        const finger = qFromNut === 0 ? 0 : Math.min(4, Math.ceil(qFromNut / 2));
        matches.push(`${cObj.course}ª:D${finger}`);
      }
    });
  }

  return matches.slice(0, 2).join(" · ") || "—";
}

/**
 * Renderiza a Pauta Musical Interativa 24-TET (Clave de Sol 8vb para Oud).
 * @param {import("../core/urlState.js").OudAppState} state
 * @param {{ absQ: number | null, pitchClassQ: number | null, course?: number, finger?: string | number, freq?: number } | null} selectedPitch
 * @param {number} highlightedSayrStep
 * @param {(pitchSelection: { absQ: number, pitchClassQ: number, freq: number } | null) => void} onStaffNoteSelect
 */
export function renderMusicalStaffSVG(state, selectedPitch, highlightedSayrStep, onStaffNoteSelect) {
  const svg = /** @type {SVGElement | null} */ (/** @type {unknown} */ (document.getElementById("oud-staff")));
  if (!svg) return;
  svg.innerHTML = "";

  const tuning = DB.tunings.find(t => t.id === state.tuningId) || DB.tunings[0];
  const activeStruct = getActiveStructure(state);
  const effectiveRootQ = activeStruct.effectiveRootQ;

  const line1Y = 104; // 1ª linha (E3 real / E4 escrito)
  const line5Y = line1Y - 8 * 6; // 5ª linha (F4 real / F5 escrito) = 56
  const staffLeftX = 24;
  const staffRightX = 1096;
  const inspectorDividerX = 915;

  // 1. Fundo sutil de pergaminho escuro e as 5 linhas da pauta
  for (let i = 0; i < 5; i++) {
    const ly = line1Y - i * 12;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(staffLeftX));
    line.setAttribute("y1", String(ly));
    line.setAttribute("x2", String(staffRightX));
    line.setAttribute("y2", String(ly));
    line.setAttribute("stroke", "rgba(212, 175, 55, 0.34)");
    line.setAttribute("stroke-width", "1.2");
    svg.appendChild(line);
  }

  // Barra dupla inicial e barra divisória do Compasso Inspetor
  [staffLeftX, inspectorDividerX, staffRightX].forEach((bx, idx) => {
    const bLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    bLine.setAttribute("x1", String(bx));
    bLine.setAttribute("y1", String(line5Y));
    bLine.setAttribute("x2", String(bx));
    bLine.setAttribute("y2", String(line1Y));
    bLine.setAttribute("stroke", idx === 1 ? "#67e8f9" : "#d4af37");
    bLine.setAttribute("stroke-width", idx === 1 ? "2" : "2.4");
    if (idx === 1) bLine.setAttribute("stroke-dasharray", "4,3");
    svg.appendChild(bLine);
  });

  // 2. Clave de Sol Oitavada (G2 8vb — Padrão Oud)
  const clefText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  clefText.setAttribute("x", String(staffLeftX + 12));
  clefText.setAttribute("y", String(line1Y - 8));
  clefText.setAttribute("fill", "#d4af37");
  clefText.setAttribute("font-size", "48");
  clefText.setAttribute("font-family", "serif");
  clefText.textContent = "𝄞";
  svg.appendChild(clefText);

  const octaveSub = document.createElementNS("http://www.w3.org/2000/svg", "text");
  octaveSub.setAttribute("x", String(staffLeftX + 26));
  octaveSub.setAttribute("y", String(line1Y + 18));
  octaveSub.setAttribute("text-anchor", "middle");
  octaveSub.setAttribute("fill", "#67e8f9");
  octaveSub.setAttribute("font-size", "9.5");
  octaveSub.setAttribute("font-weight", "800");
  octaveSub.textContent = "8vb";
  svg.appendChild(octaveSub);

  // 3. Armadura de Clave Modal (Maqam Key Signature)
  let keySigX = staffLeftX + 58;
  const uniqueAccs = new Map();
  activeStruct.intervals.forEach((intQ, idx) => {
    if (intQ >= 24) return;
    const pcQ = (effectiveRootQ + intQ) % 24;
    const deg = activeStruct.degrees[idx] || "";
    const sp = resolveStaffSpelling(pcQ, deg);
    if (sp.acc && !uniqueAccs.has(sp.letter)) {
      uniqueAccs.set(sp.letter, { acc: sp.acc, stepInOctave: sp.stepInOctave });
    }
  });

  // Posiciona os acidentes da armadura na oitava padrão da pauta
  uniqueAccs.forEach((val) => {
    const sigStep = val.stepInOctave >= 2 ? (7 + val.stepInOctave) : (14 + val.stepInOctave);
    const sigY = stepToY(sigStep, line1Y);
    drawAccidentalGlyph(svg, val.acc, keySigX, sigY, "#fde68a");
    keySigX += 14;
  });

  // Linha tracejada sutil após a armadura
  const sigEndX = Math.max(staffLeftX + 75, keySigX + 6);
  const sigSep = document.createElementNS("http://www.w3.org/2000/svg", "line");
  sigSep.setAttribute("x1", String(sigEndX));
  sigSep.setAttribute("y1", String(line5Y));
  sigSep.setAttribute("x2", String(sigEndX));
  sigSep.setAttribute("y2", String(line1Y));
  sigSep.setAttribute("stroke", "rgba(212, 175, 55, 0.22)");
  sigSep.setAttribute("stroke-dasharray", "2,3");
  svg.appendChild(sigSep);

  // 4. Construir a lista de notas a exibir na pauta
  /**
   * @type {{
   *   absQ: number,
   *   pitchClassQ: number,
   *   degree: string,
   *   freq: number,
   *   isRoot: boolean,
   *   isGhammaz: boolean,
   *   isMicro: boolean,
   *   stepIndex: number
   * }[]}
   */
  const staffNotes = [];

  // Escolhe a oitava base ideal para leitura na pauta (C3 = 24q, exceto se a tônica for de A a B onde começa em 18q..23q)
  const baseOctaveStartQ = effectiveRootQ >= 18 ? effectiveRootQ : (24 + effectiveRootQ);

  const entity = /** @type {any} */ (activeStruct.entity);
  const useSayrSequence = state.mode === "MAQAM" && state.staffMode === "SAYR" && entity.sayr_phrases?.[state.sayrPhraseIndex];

  if (useSayrSequence) {
    const phrase = entity.sayr_phrases[state.sayrPhraseIndex];
    phrase.steps.forEach((/** @type {any} */ st, /** @type {number} */ idx) => {
      const intQ = st.interval_q;
      const absQ = baseOctaveStartQ + intQ;
      const pitchClassQ = ((absQ % 24) + 24) % 24;
      const modOffset = ((intQ % 24) + 24) % 24;
      const centsDev = activeStruct.centsMap[intQ] || activeStruct.centsMap[modOffset] || 0;
      const freq = 65.41 * Math.pow(2, (absQ * 50 + centsDev) / 1200);
      const degIdx = activeStruct.intervals.findIndex(x => (x % 24) === modOffset);
      const degree = degIdx >= 0 ? activeStruct.degrees[degIdx] : String(idx + 1);

      staffNotes.push({
        absQ,
        pitchClassQ,
        degree: `#${idx + 1}`,
        freq,
        isRoot: modOffset === 0,
        isGhammaz: activeStruct.ghammazOffsets.includes(modOffset),
        isMicro: PITCH_CLASSES_24[pitchClassQ].micro,
        stepIndex: idx
      });
    });
  } else if ((state.mode === "CHORD" || state.mode === "CADENCE") && state.chordVoicingOnly) {
    // Exibe as notas reais do Voicing ativo (da corda mais grave para a mais aguda)
    const activeOffsetMap = new Map();
    activeStruct.intervals.forEach((intQ, idx) => {
      const modQ = ((intQ % 24) + 24) % 24;
      if (!activeOffsetMap.has(modQ)) {
        activeOffsetMap.set(modQ, {
          degree: activeStruct.degrees[idx],
          centsDev: activeStruct.centsMap[intQ] || 0
        });
      }
    });
    const voicingMap = selectBestChordVoicingPerCourse(tuning, activeOffsetMap, effectiveRootQ, state.shapeMode, state.boxAnchorQ);

    for (let cIdx = 5; cIdx >= 0; cIdx--) {
      const cObj = tuning.courses[cIdx];
      const qFromNut = voicingMap[cObj.course];
      if (qFromNut === null || qFromNut === undefined) continue;
      const absQ = cObj.abs_q + qFromNut;
      const pitchClassQ = ((absQ % 24) + 24) % 24;
      const modOffset = ((pitchClassQ - effectiveRootQ) % 24 + 24) % 24;
      const info = activeOffsetMap.get(modOffset) || { degree: "1", centsDev: 0 };
      const freq = cObj.freq_hz * Math.pow(2, (qFromNut * 50 + info.centsDev) / 1200);

      staffNotes.push({
        absQ,
        pitchClassQ,
        degree: `${cObj.course}ª (${info.degree})`,
        freq,
        isRoot: modOffset === 0,
        isGhammaz: activeStruct.ghammazOffsets.includes(modOffset),
        isMicro: PITCH_CLASSES_24[pitchClassQ].micro,
        stepIndex: staffNotes.length
      });
    }
  } else {
    // Escala / Maqam / Jins / Modo linear
    activeStruct.intervals.forEach((intQ, idx) => {
      const absQ = baseOctaveStartQ + intQ;
      const pitchClassQ = ((absQ % 24) + 24) % 24;
      const modOffset = ((intQ % 24) + 24) % 24;
      const centsDev = activeStruct.centsMap[intQ] || 0;
      const freq = 65.41 * Math.pow(2, (absQ * 50 + centsDev) / 1200);

      staffNotes.push({
        absQ,
        pitchClassQ,
        degree: activeStruct.degrees[idx] || "",
        freq,
        isRoot: modOffset === 0,
        isGhammaz: activeStruct.ghammazOffsets.includes(modOffset),
        isMicro: PITCH_CLASSES_24[pitchClassQ].micro,
        stepIndex: idx
      });
    });
  }

  // 5. Renderizar cada nota da sequência na pauta
  const usableWidth = (inspectorDividerX - 24) - (sigEndX + 28);
  const noteSpacing = staffNotes.length > 1 ? usableWidth / (staffNotes.length - 1) : 0;

  staffNotes.forEach((nObj, idx) => {
    const nx = staffNotes.length === 1
      ? sigEndX + usableWidth / 2
      : sigEndX + 26 + idx * noteSpacing;

    const geom = getStaffVerticalGeometry(nObj.absQ, nObj.degree);
    const ny = stepToY(geom.totalStep, line1Y);

    drawLedgerLines(svg, nx, geom.totalStep, line1Y);

    const isExactSelected = selectedPitch !== null && selectedPitch.absQ === nObj.absQ;
    const isPitchClassSelected = selectedPitch !== null && selectedPitch.pitchClassQ === nObj.pitchClassQ;
    const isSayrActive = useSayrSequence && highlightedSayrStep === nObj.stepIndex;

    const noteGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    noteGroup.setAttribute("class", "note-node");

    // Clicar na nota da pauta toca o som e ilumina todas as posições equivalentes no espelho do Oud
    noteGroup.addEventListener("click", () => {
      playPluckedNote(nObj.freq, 1.35);
      if (isExactSelected) {
        onStaffNoteSelect(null);
      } else {
        onStaffNoteSelect({
          absQ: nObj.absQ,
          pitchClassQ: nObj.pitchClassQ,
          freq: nObj.freq
        });
      }
    });

    // Halo de seleção ativa (Sincronizado com o espelho)
    if (isExactSelected || isPitchClassSelected || isSayrActive) {
      const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      halo.setAttribute("cx", String(nx));
      halo.setAttribute("cy", String(ny));
      halo.setAttribute("r", "13");
      halo.setAttribute("fill", "rgba(103, 232, 249, 0.18)");
      halo.setAttribute("stroke", isExactSelected || isSayrActive ? "#67e8f9" : "#fde047");
      halo.setAttribute("stroke-width", "2");
      if (!isExactSelected && !isSayrActive) halo.setAttribute("stroke-dasharray", "3,2");
      noteGroup.appendChild(halo);
    }

    // Haste da nota (Stem)
    const stemUp = geom.totalStep < 13;
    const stem = document.createElementNS("http://www.w3.org/2000/svg", "line");
    stem.setAttribute("x1", String(stemUp ? nx + 6.5 : nx - 6.5));
    stem.setAttribute("y1", String(ny));
    stem.setAttribute("x2", String(stemUp ? nx + 6.5 : nx - 6.5));
    stem.setAttribute("y2", String(stemUp ? ny - 30 : ny + 30));
    stem.setAttribute("stroke", "#e2e8f0");
    stem.setAttribute("stroke-width", "1.5");
    noteGroup.appendChild(stem);

    // Acidente junto à nota
    drawAccidentalGlyph(noteGroup, geom.acc, nx - 15, ny, nObj.isMicro ? "#f0abfc" : "#fde68a");

    // Cabeça de nota inclinada (Notehead)
    let fillGrad = "url(#fixedGem)";
    let strokeCol = "#bfdbfe";
    if (nObj.isRoot) {
      fillGrad = "url(#rootGem)";
      strokeCol = "#fde68a";
    } else if (nObj.isGhammaz) {
      fillGrad = "url(#ghammazGem)";
      strokeCol = "#fef08a";
    } else if (nObj.isMicro) {
      fillGrad = "url(#microGem)";
      strokeCol = "#67e8f9";
    }

    const head = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    head.setAttribute("cx", String(nx));
    head.setAttribute("cy", String(ny));
    head.setAttribute("rx", "7.4");
    head.setAttribute("ry", "5.4");
    head.setAttribute("transform", `rotate(-18 ${nx} ${ny})`);
    head.setAttribute("fill", fillGrad);
    head.setAttribute("stroke", strokeCol);
    head.setAttribute("stroke-width", "1.5");
    noteGroup.appendChild(head);

    // Rótulo superior: Cifra + Grau
    const pcName = PITCH_CLASSES_24[nObj.pitchClassQ].flat;
    const topLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    topLbl.setAttribute("x", String(nx));
    topLbl.setAttribute("y", "22");
    topLbl.setAttribute("text-anchor", "middle");
    topLbl.setAttribute("fill", isExactSelected || isPitchClassSelected ? "#67e8f9" : "#fef3c7");
    topLbl.setAttribute("font-size", "10.5");
    topLbl.setAttribute("font-weight", "700");
    topLbl.textContent = `${pcName} (${nObj.degree})`;
    noteGroup.appendChild(topLbl);

    // Rótulo inferior: Mapa de Corda:Dedo no Oud para esta altura exata
    const locText = findPlayableLocationsForPitch(tuning, nObj.absQ, state.shapeMode, state.boxAnchorQ);
    const botLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    botLbl.setAttribute("x", String(nx));
    botLbl.setAttribute("y", "146");
    botLbl.setAttribute("text-anchor", "middle");
    botLbl.setAttribute("fill", "#bda699");
    botLbl.setAttribute("font-size", "9.2");
    botLbl.setAttribute("font-weight", "600");
    botLbl.textContent = locText;
    noteGroup.appendChild(botLbl);

    svg.appendChild(noteGroup);
  });

  // 6. COMPASSO INSPETOR (À direita da barra tracejada: mostra qualquer nota clicada no braço em sua oitava real)
  const inspCenterX = (inspectorDividerX + staffRightX) / 2;
  const inspTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
  inspTitle.setAttribute("x", String(inspCenterX));
  inspTitle.setAttribute("y", "20");
  inspTitle.setAttribute("text-anchor", "middle");
  inspTitle.setAttribute("fill", "#67e8f9");
  inspTitle.setAttribute("font-size", "10");
  inspTitle.setAttribute("font-weight", "700");
  inspTitle.textContent = t(state.lang, "staffInspectorTitle");
  svg.appendChild(inspTitle);

  if (selectedPitch && selectedPitch.absQ !== null) {
    const geom = getStaffVerticalGeometry(selectedPitch.absQ);
    const iy = stepToY(geom.totalStep, line1Y);
    const pcData = PITCH_CLASSES_24[geom.pitchClassQ];

    drawLedgerLines(svg, inspCenterX, geom.totalStep, line1Y);
    drawAccidentalGlyph(svg, geom.acc, inspCenterX - 16, iy, pcData.micro ? "#f0abfc" : "#fde68a");

    const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    glow.setAttribute("cx", String(inspCenterX));
    glow.setAttribute("cy", String(iy));
    glow.setAttribute("r", "12");
    glow.setAttribute("fill", "rgba(103, 232, 249, 0.22)");
    glow.setAttribute("stroke", "#67e8f9");
    glow.setAttribute("stroke-width", "1.8");
    svg.appendChild(glow);

    const head = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    head.setAttribute("cx", String(inspCenterX));
    head.setAttribute("cy", String(iy));
    head.setAttribute("rx", "7.8");
    head.setAttribute("ry", "5.6");
    head.setAttribute("transform", `rotate(-18 ${inspCenterX} ${iy})`);
    head.setAttribute("fill", pcData.micro ? "url(#microGem)" : "url(#rootGem)");
    head.setAttribute("stroke", "#ffffff");
    head.setAttribute("stroke-width", "1.6");
    svg.appendChild(head);

    const metaLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    metaLbl.setAttribute("x", String(inspCenterX));
    metaLbl.setAttribute("y", "145");
    metaLbl.setAttribute("text-anchor", "middle");
    metaLbl.setAttribute("fill", "#fde047");
    metaLbl.setAttribute("font-size", "10");
    metaLbl.setAttribute("font-weight", "700");
    const courseInfo = selectedPitch.course ? ` • ${selectedPitch.course}ª:D${selectedPitch.finger ?? "-"}` : "";
    metaLbl.textContent = `${pcData.flat}${geom.octaveNumber} (${pcData.arabic})${courseInfo}`;
    svg.appendChild(metaLbl);
  } else {
    const emptyHint = document.createElementNS("http://www.w3.org/2000/svg", "text");
    emptyHint.setAttribute("x", String(inspCenterX));
    emptyHint.setAttribute("y", "145");
    emptyHint.setAttribute("text-anchor", "middle");
    emptyHint.setAttribute("fill", "rgba(189, 166, 153, 0.75)");
    emptyHint.setAttribute("font-size", "9.2");
    emptyHint.textContent = t(state.lang, "staffInspectorEmpty");
    svg.appendChild(emptyHint);
  }
}
