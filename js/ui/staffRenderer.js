// @ts-check
import { DB, PITCH_CLASSES_24 } from "../core/database.js";
import { getActiveStructure } from "../core/modalEngine.js";
import { t } from "../core/i18n.js";
import { playPluckedNote } from "../audio/synthEngine.js";

/** @type {Record<number, { step: number, acc: "" | "b" | "#" | "hb" | "hs" }>} */
const PITCH_CLASS_TO_STAFF = {
  0:  { step: 0, acc: ""   },
  1:  { step: 1, acc: "hb" },
  2:  { step: 1, acc: "b"  },
  3:  { step: 2, acc: "hb" },
  4:  { step: 2, acc: ""   },
  5:  { step: 3, acc: "hb" },
  6:  { step: 3, acc: "b"  },
  7:  { step: 4, acc: "hb" },
  8:  { step: 4, acc: ""   },
  9:  { step: 5, acc: "hb" },
  10: { step: 5, acc: ""   },
  11: { step: 6, acc: "hb" },
  12: { step: 5, acc: "#"  },
  13: { step: 6, acc: "hb" },
  14: { step: 6, acc: ""   },
  15: { step: 7, acc: "hb" },
  16: { step: 7, acc: "b"  },
  17: { step: 8, acc: "hb" },
  18: { step: 8, acc: ""   },
  19: { step: 9, acc: "hb" },
  20: { step: 9, acc: "b"  },
  21: { step: 10, acc: "hb" },
  22: { step: 10, acc: ""  },
  23: { step: 11, acc: "hb" }
};

function absQToStaffGeometry(absQ, topLineY, halfStepPx) {
  const octaveOffset = Math.floor(absQ / 24);
  const pcQ = ((absQ % 24) + 24) % 24;
  const mapping = PITCH_CLASS_TO_STAFF[pcQ];
  const diatonicStepFromC2 = octaveOffset * 12 + mapping.step;
  const f3DiatonicStep = 23;
  const stepsBelowF3 = f3DiatonicStep - diatonicStepFromC2;
  const y = topLineY + stepsBelowF3 * halfStepPx;
  return { y, diatonicStep: diatonicStepFromC2, acc: mapping.acc, pcQ };
}

function drawMicrotonalAccidental(svg, x, y, acc, color) {
  if (!acc) return;
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("stroke", color);
  g.setAttribute("fill", "none");
  g.setAttribute("stroke-linecap", "round");

  if (acc === "b") {
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", String(x - 16));
    txt.setAttribute("y", String(y + 4));
    txt.setAttribute("fill", color);
    txt.setAttribute("stroke", "none");
    txt.setAttribute("font-size", "14");
    txt.setAttribute("font-weight", "700");
    txt.textContent = "♭";
    g.appendChild(txt);
  } else if (acc === "#") {
    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", String(x - 16));
    txt.setAttribute("y", String(y + 4));
    txt.setAttribute("fill", color);
    txt.setAttribute("stroke", "none");
    txt.setAttribute("font-size", "13");
    txt.setAttribute("font-weight", "700");
    txt.textContent = "♯";
    g.appendChild(txt);
  } else if (acc === "hb") {
    const stem = document.createElementNS("http://www.w3.org/2000/svg", "line");
    stem.setAttribute("x1", String(x - 12));
    stem.setAttribute("y1", String(y - 10));
    stem.setAttribute("x2", String(x - 12));
    stem.setAttribute("y2", String(y + 4));
    stem.setAttribute("stroke-width", "1.4");
    g.appendChild(stem);

    const bowl = document.createElementNS("http://www.w3.org/2000/svg", "path");
    bowl.setAttribute("d", `M ${x - 12},${y - 1} C ${x - 18},${y - 3} ${x - 18},${y + 4} ${x - 12},${y + 4}`);
    bowl.setAttribute("stroke-width", "1.4");
    g.appendChild(bowl);
  }

  svg.appendChild(g);
}

function drawLedgerLines(svg, x, diatonicStep, topLineY, halfStepPx, ledgerStroke) {
  const f3Step = 23;
  const e2Step = 14;

  if (diatonicStep < e2Step) {
    for (let s = e2Step - 2; s >= diatonicStep; s -= 2) {
      const ly = topLineY + (f3Step - s) * halfStepPx;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(x - 13));
      line.setAttribute("y1", String(ly));
      line.setAttribute("x2", String(x + 13));
      line.setAttribute("y2", String(ly));
      line.setAttribute("stroke", ledgerStroke);
      line.setAttribute("stroke-width", "1.2");
      svg.appendChild(line);
    }
  } else if (diatonicStep > f3Step) {
    for (let s = f3Step + 2; s <= diatonicStep; s += 2) {
      const ly = topLineY + (f3Step - s) * halfStepPx;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(x - 13));
      line.setAttribute("y1", String(ly));
      line.setAttribute("x2", String(x + 13));
      line.setAttribute("y2", String(ly));
      line.setAttribute("stroke", ledgerStroke);
      line.setAttribute("stroke-width", "1.2");
      svg.appendChild(line);
    }
  }
}

/**
 * Renderiza a Pauta Interativa 24-TET (Clave de Sol 8vb) com paleta adaptativa para Modo Escuro e Modo Claro (Pergaminho).
 *
 * @param {import("../core/urlState.js").OudAppState} state
 * @param {{ absQ: number | null, pitchClassQ: number | null, course?: number, finger?: string | number, freq?: number } | null} selectedPitch
 * @param {number} highlightedStep
 * @param {(selection: { absQ: number | null, pitchClassQ: number | null } | null) => void} onStaffNoteSelect
 * @param {ReturnType<import("../core/modalEngine.js").computeAnchoredOctavePath>} [octavePathNodes=[]]
 */
export function renderMusicalStaffSVG(state, selectedPitch, highlightedStep, onStaffNoteSelect, octavePathNodes = []) {
  const svg = /** @type {SVGElement | null} */ (/** @type {unknown} */ (document.getElementById("oud-staff")));
  if (!svg) return;
  svg.innerHTML = "";

  const isLight = state.theme === "light";
  const staffColors = {
    bgFill: isLight ? "#faf3e3" : "rgba(15, 9, 6, 0.88)",
    bgStroke: isLight ? "rgba(138, 90, 25, 0.45)" : "rgba(212, 175, 55, 0.35)",
    lineStroke: isLight ? "rgba(75, 54, 33, 0.48)" : "rgba(254, 243, 199, 0.36)",
    ledgerStroke: isLight ? "rgba(75, 54, 33, 0.68)" : "rgba(254, 243, 199, 0.55)",
    clefFill: isLight ? "#7c4d12" : "#d4af37",
    sub8Fill: isLight ? "#9a5b13" : "#fde68a",
    noteTextMain: isLight ? "#23160c" : "#fef3c7",
    noteTextHighlight: isLight ? "#0e7490" : "#67e8f9",
    degreeText: isLight ? "#654d38" : "#a89882",
    inspectorAccent: isLight ? "#0e7490" : "#67e8f9",
    inspectorSub: isLight ? "#9a5b13" : "#fde047"
  };

  const W = 1120;
  const H = 158;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const topLineY = 44;
  const lineGap = 11;
  const halfStepPx = lineGap / 2;
  const bottomLineY = topLineY + 4 * lineGap;
  const staffLeftX = 24;
  const inspectorX = 875;
  const staffRightX = inspectorX - 16;

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("x", "8");
  bg.setAttribute("y", "6");
  bg.setAttribute("width", String(W - 16));
  bg.setAttribute("height", String(H - 12));
  bg.setAttribute("rx", "10");
  bg.setAttribute("fill", staffColors.bgFill);
  bg.setAttribute("stroke", staffColors.bgStroke);
  bg.setAttribute("stroke-width", "1.2");
  svg.appendChild(bg);

  for (let i = 0; i < 5; i++) {
    const y = topLineY + i * lineGap;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(staffLeftX));
    line.setAttribute("y1", String(y));
    line.setAttribute("x2", String(staffRightX));
    line.setAttribute("y2", String(y));
    line.setAttribute("stroke", staffColors.lineStroke);
    line.setAttribute("stroke-width", "1.1");
    svg.appendChild(line);
  }

  const clef = document.createElementNS("http://www.w3.org/2000/svg", "text");
  clef.setAttribute("x", String(staffLeftX + 6));
  clef.setAttribute("y", String(bottomLineY - 5));
  clef.setAttribute("fill", staffColors.clefFill);
  clef.setAttribute("font-size", "46");
  clef.setAttribute("font-family", "serif");
  clef.textContent = "𝄞";
  svg.appendChild(clef);

  const sub8 = document.createElementNS("http://www.w3.org/2000/svg", "text");
  sub8.setAttribute("x", String(staffLeftX + 22));
  sub8.setAttribute("y", String(bottomLineY + 13));
  sub8.setAttribute("fill", staffColors.sub8Fill);
  sub8.setAttribute("font-size", "10");
  sub8.setAttribute("font-weight", "800");
  sub8.textContent = "8vb";
  svg.appendChild(sub8);

  const activeStruct = getActiveStructure(state);
  const baseOctaveQ = state.rootQ < 12 ? 24 : 12;

  /** @type {{ absQ: number, degree: string, centsDev: number, isGhammaz: boolean, isRoot: boolean, stepIdx: number, sublabel?: string }[]} */
  const sequenceToDraw = [];

  const isOctaveFilterActive = state.octavePathOnly && state.anchorAbsQ !== null && octavePathNodes.length > 0;

  if (isOctaveFilterActive) {
    octavePathNodes.forEach((n, idx) => {
      const modOffset = ((n.pitchClassQ - activeStruct.effectiveRootQ) % 24 + 24) % 24;
      sequenceToDraw.push({
        absQ: n.absQ,
        degree: n.degree,
        centsDev: activeStruct.centsMap[n.intervalQ] || 0,
        isGhammaz: activeStruct.ghammazOffsets.includes(modOffset),
        isRoot: modOffset === 0,
        stepIdx: idx,
        sublabel: `C${n.course}·${n.qFromNut === 0 ? "0" : "D" + n.finger}`
      });
    });
  } else if (state.mode === "MAQAM" && state.staffMode === "SAYR") {
    const entity = /** @type {any} */ (activeStruct.entity);
    const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
    if (phrase) {
      phrase.steps.forEach((/** @type {any} */ st, /** @type {number} */ idx) => {
        const modQ = ((st.interval_q % 24) + 24) % 24;
        const degIdx = activeStruct.intervals.indexOf(modQ);
        sequenceToDraw.push({
          absQ: baseOctaveQ + state.rootQ + st.interval_q,
          degree: degIdx >= 0 ? activeStruct.degrees[degIdx] : "",
          centsDev: activeStruct.centsMap[modQ] || 0,
          isGhammaz: activeStruct.ghammazOffsets.includes(modQ),
          isRoot: modQ === 0,
          stepIdx: idx
        });
      });
    }
  } else {
    activeStruct.intervals.forEach((intQ, idx) => {
      sequenceToDraw.push({
        absQ: baseOctaveQ + activeStruct.effectiveRootQ + intQ,
        degree: activeStruct.degrees[idx] || "",
        centsDev: activeStruct.centsMap[intQ] || 0,
        isGhammaz: activeStruct.ghammazOffsets.includes(intQ % 24),
        isRoot: (intQ % 24) === 0,
        stepIdx: idx
      });
    });
  }

  const startX = staffLeftX + 74;
  const usableW = staffRightX - startX - 24;
  const count = Math.max(1, sequenceToDraw.length);
  const stepX = count > 1 ? Math.min(82, usableW / (count - 1)) : 0;

  sequenceToDraw.forEach((item, idx) => {
    const nx = startX + idx * stepX;
    const geom = absQToStaffGeometry(item.absQ, topLineY, halfStepPx);
    const pcData = PITCH_CLASSES_24[geom.pcQ];

    drawLedgerLines(svg, nx, geom.diatonicStep, topLineY, halfStepPx, staffColors.ledgerStroke);

    let fillColor = isLight ? "#1d4ed8" : "#3b82f6";
    let strokeColor = isLight ? "#1e3a8a" : "#bfdbfe";
    if (item.isRoot) {
      fillColor = "#dc2626";
      strokeColor = isLight ? "#7f1d1d" : "#fde68a";
    } else if (item.isGhammaz) {
      fillColor = "#d97706";
      strokeColor = isLight ? "#78350f" : "#fef08a";
    } else if (pcData.micro) {
      fillColor = "#7e22ce";
      strokeColor = isLight ? "#0e7490" : "#67e8f9";
    }

    const isHighlighted = (highlightedStep === item.stepIdx) ||
      (selectedPitch !== null && (selectedPitch.absQ === item.absQ || selectedPitch.pitchClassQ === geom.pcQ));

    if (isHighlighted) {
      const aura = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      aura.setAttribute("cx", String(nx));
      aura.setAttribute("cy", String(geom.y));
      aura.setAttribute("r", "14");
      aura.setAttribute("fill", isLight ? "rgba(14, 116, 144, 0.18)" : "rgba(103, 232, 249, 0.24)");
      aura.setAttribute("stroke", staffColors.inspectorAccent);
      aura.setAttribute("stroke-width", "1.6");
      svg.appendChild(aura);
    }

    drawMicrotonalAccidental(svg, nx, geom.y, geom.acc, isHighlighted ? staffColors.inspectorAccent : strokeColor);

    const noteGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    noteGroup.style.cursor = "pointer";

    const head = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    head.setAttribute("cx", String(nx));
    head.setAttribute("cy", String(geom.y));
    head.setAttribute("rx", "6.8");
    head.setAttribute("ry", "4.8");
    head.setAttribute("transform", `rotate(-18 ${nx} ${geom.y})`);
    head.setAttribute("fill", fillColor);
    head.setAttribute("stroke", isHighlighted ? (isLight ? "#0e7490" : "#ffffff") : strokeColor);
    head.setAttribute("stroke-width", isHighlighted ? "2.2" : "1.3");
    noteGroup.appendChild(head);

    const stemUp = geom.diatonicStep < 19;
    const stem = document.createElementNS("http://www.w3.org/2000/svg", "line");
    stem.setAttribute("x1", String(stemUp ? nx + 6 : nx - 6));
    stem.setAttribute("y1", String(geom.y));
    stem.setAttribute("x2", String(stemUp ? nx + 6 : nx - 6));
    stem.setAttribute("y2", String(stemUp ? geom.y - 24 : geom.y + 24));
    stem.setAttribute("stroke", isHighlighted ? staffColors.inspectorAccent : strokeColor);
    stem.setAttribute("stroke-width", "1.3");
    noteGroup.appendChild(stem);

    const nameLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    nameLbl.setAttribute("x", String(nx));
    nameLbl.setAttribute("y", String(H - 22));
    nameLbl.setAttribute("text-anchor", "middle");
    nameLbl.setAttribute("fill", isHighlighted ? staffColors.noteTextHighlight : staffColors.noteTextMain);
    nameLbl.setAttribute("font-size", "9.5");
    nameLbl.setAttribute("font-weight", "700");
    nameLbl.textContent = pcData.flat;
    noteGroup.appendChild(nameLbl);

    const degLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    degLbl.setAttribute("x", String(nx));
    degLbl.setAttribute("y", String(H - 10));
    degLbl.setAttribute("text-anchor", "middle");
    degLbl.setAttribute("fill", item.sublabel ? staffColors.inspectorAccent : staffColors.degreeText);
    degLbl.setAttribute("font-size", "8.2");
    degLbl.setAttribute("font-weight", item.sublabel ? "700" : "600");
    degLbl.textContent = item.sublabel || item.degree;
    noteGroup.appendChild(degLbl);

    noteGroup.addEventListener("click", () => {
      const freq = 65.41 * Math.pow(2, (item.absQ * 50 + item.centsDev) / 1200);
      playPluckedNote(freq, 1.3);
      const alreadySelected = selectedPitch && selectedPitch.pitchClassQ === geom.pcQ;
      onStaffNoteSelect(alreadySelected ? null : { absQ: item.absQ, pitchClassQ: geom.pcQ });
    });

    svg.appendChild(noteGroup);
  });

  // Compasso Inspetor (Espelho -> Pauta)
  const sep = document.createElementNS("http://www.w3.org/2000/svg", "line");
  sep.setAttribute("x1", String(inspectorX - 6));
  sep.setAttribute("y1", "18");
  sep.setAttribute("x2", String(inspectorX - 6));
  sep.setAttribute("y2", String(H - 18));
  sep.setAttribute("stroke", staffColors.bgStroke);
  sep.setAttribute("stroke-width", "1.5");
  sep.setAttribute("stroke-dasharray", "4,3");
  svg.appendChild(sep);

  const inspTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
  inspTitle.setAttribute("x", String(inspectorX + 112));
  inspTitle.setAttribute("y", "22");
  inspTitle.setAttribute("text-anchor", "middle");
  inspTitle.setAttribute("fill", staffColors.inspectorAccent);
  inspTitle.setAttribute("font-size", "9.5");
  inspTitle.setAttribute("font-weight", "800");
  inspTitle.textContent = t(state.lang, "staffInspectorTitle");
  svg.appendChild(inspTitle);

  for (let i = 0; i < 5; i++) {
    const y = topLineY + i * lineGap;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(inspectorX + 10));
    line.setAttribute("y1", String(y));
    line.setAttribute("x2", String(W - 22));
    line.setAttribute("y2", String(y));
    line.setAttribute("stroke", staffColors.lineStroke);
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
  }

  if (selectedPitch && selectedPitch.absQ !== null) {
    const geom = absQToStaffGeometry(selectedPitch.absQ, topLineY, halfStepPx);
    const pcData = PITCH_CLASSES_24[geom.pcQ];
    const inspNoteX = inspectorX + 76;

    drawLedgerLines(svg, inspNoteX, geom.diatonicStep, topLineY, halfStepPx, staffColors.ledgerStroke);
    drawMicrotonalAccidental(svg, inspNoteX, geom.y, geom.acc, staffColors.inspectorAccent);

    const head = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    head.setAttribute("cx", String(inspNoteX));
    head.setAttribute("cy", String(geom.y));
    head.setAttribute("rx", "7.2");
    head.setAttribute("ry", "5");
    head.setAttribute("transform", `rotate(-18 ${inspNoteX} ${geom.y})`);
    head.setAttribute("fill", "#0891b2");
    head.setAttribute("stroke", isLight ? "#164e63" : "#ffffff");
    head.setAttribute("stroke-width", "1.8");
    svg.appendChild(head);

    const octaveNum = Math.floor(selectedPitch.absQ / 24) + 2;
    const infoTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    infoTxt.setAttribute("x", String(inspectorX + 155));
    infoTxt.setAttribute("y", String(topLineY + 14));
    infoTxt.setAttribute("text-anchor", "middle");
    infoTxt.setAttribute("fill", staffColors.noteTextMain);
    infoTxt.setAttribute("font-size", "12");
    infoTxt.setAttribute("font-weight", "800");
    infoTxt.textContent = `${pcData.flat}${octaveNum}`;
    svg.appendChild(infoTxt);

    const subTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    subTxt.setAttribute("x", String(inspectorX + 155));
    subTxt.setAttribute("y", String(topLineY + 28));
    subTxt.setAttribute("text-anchor", "middle");
    subTxt.setAttribute("fill", staffColors.inspectorSub);
    subTxt.setAttribute("font-size", "9");
    subTxt.setAttribute("font-weight", "700");
    subTxt.textContent = selectedPitch.course
      ? `${selectedPitch.course}ª (${pcData.arabic})`
      : pcData.arabic;
    svg.appendChild(subTxt);

    if (selectedPitch.freq) {
      const hzTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      hzTxt.setAttribute("x", String(inspectorX + 155));
      hzTxt.setAttribute("y", String(topLineY + 41));
      hzTxt.setAttribute("text-anchor", "middle");
      hzTxt.setAttribute("fill", staffColors.degreeText);
      hzTxt.setAttribute("font-size", "8.5");
      hzTxt.textContent = `${selectedPitch.freq.toFixed(1)} Hz`;
      svg.appendChild(hzTxt);
    }
  } else {
    const emptyTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    emptyTxt.setAttribute("x", String(inspectorX + 112));
    emptyTxt.setAttribute("y", String(topLineY + 25));
    emptyTxt.setAttribute("text-anchor", "middle");
    emptyTxt.setAttribute("fill", staffColors.degreeText);
    emptyTxt.setAttribute("font-size", "9");
    emptyTxt.textContent = t(state.lang, "staffInspectorEmpty");
    svg.appendChild(emptyTxt);
  }
}
