// @ts-check
import { PITCH_CLASSES_24 } from "../core/database.js";
import { getActiveStructure } from "../core/modalEngine.js";
import { playPluckedNote } from "../audio/synthEngine.js";

/**
 * Mapeamento de cada uma das 24 classes de altura para degrau diatônico (0=C..6=B)
 * e tipo de acidente na pauta 24-TET.
 */
const STAFF_PITCH_MAP_24 = [
  { step: 0, acc: "" },           // 0: C
  { step: 0, acc: "half-sharp" }, // 1: C+
  { step: 1, acc: "flat" },       // 2: Db
  { step: 1, acc: "half-flat" },  // 3: D-
  { step: 1, acc: "" },           // 4: D
  { step: 1, acc: "half-sharp" }, // 5: D+
  { step: 2, acc: "flat" },       // 6: Eb
  { step: 2, acc: "half-flat" },  // 7: E-
  { step: 2, acc: "" },           // 8: E
  { step: 3, acc: "half-flat" },  // 9: F-
  { step: 3, acc: "" },           // 10: F
  { step: 3, acc: "half-sharp" }, // 11: F+
  { step: 3, acc: "sharp" },      // 12: F#
  { step: 4, acc: "half-flat" },  // 13: G-
  { step: 4, acc: "" },           // 14: G
  { step: 4, acc: "half-sharp" }, // 15: G+
  { step: 5, acc: "flat" },       // 16: Ab
  { step: 5, acc: "half-flat" },  // 17: A-
  { step: 5, acc: "" },           // 18: A
  { step: 5, acc: "half-sharp" }, // 19: A+
  { step: 6, acc: "flat" },       // 20: Bb
  { step: 6, acc: "half-flat" },  // 21: B-
  { step: 6, acc: "" },           // 22: B
  { step: 6, acc: "half-sharp" }  // 23: B+
];

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Converte absQ (onde 0 = C2 soando, escrito C3 na Clave de Sol 8vb) em índice diatônico.
 * Written E4 (1ª linha inferior da clave de sol) = diatonicIndex 30 (sounding E3, absQ = 32).
 *
 * @param {number} absQ
 */
function getWrittenDiatonicIndex(absQ) {
  const safeAbsQ = Math.max(0, absQ);
  const soundingOct = Math.floor(safeAbsQ / 24) + 2;
  const writtenOct = soundingOct + 1; // Clave de Sol 8vb (padrão Oud)
  const pcQ = ((safeAbsQ % 24) + 24) % 24;
  const info = STAFF_PITCH_MAP_24[pcQ] || STAFF_PITCH_MAP_24[0];
  return {
    diatIndex: writtenOct * 7 + info.step,
    acc: info.acc,
    pcQ,
    soundingOct
  };
}

/**
 * Calcula coordenada Y na pauta.
 * 5 linhas: F5 (38)=36, D5 (36)=46.5, B4 (34)=57, G4 (32)=67.5, E4 (30)=78.
 *
 * @param {number} diatIndex
 */
function diatonicToY(diatIndex) {
  const bottomLineDiat = 30; // E4 escrito
  const bottomLineY = 78;
  const halfStepPx = 5.25;
  return bottomLineY - (diatIndex - bottomLineDiat) * halfStepPx;
}

/**
 * Desenha o acidente vetorial (bemol, sustenido, meio-bemol ou meio-sustenido) à esquerda da cabeça da nota.
 */
function drawAccidental(parent, x, y, accType, color) {
  if (!accType) return;

  if (accType === "flat") {
    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", String(x));
    txt.setAttribute("y", String(y + 4.5));
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("fill", color);
    txt.setAttribute("font-size", "14");
    txt.setAttribute("font-weight", "700");
    txt.textContent = "♭";
    parent.appendChild(txt);
    return;
  }

  if (accType === "sharp") {
    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", String(x));
    txt.setAttribute("y", String(y + 4.5));
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("fill", color);
    txt.setAttribute("font-size", "13");
    txt.setAttribute("font-weight", "700");
    txt.textContent = "♯";
    parent.appendChild(txt);
    return;
  }

  // Meio-bemol (bemol cortado / d estilizado em vetor — 100% legível em qualquer OS)
  if (accType === "half-flat") {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("stroke", color);
    g.setAttribute("fill", "none");
    g.setAttribute("stroke-linecap", "round");

    const stem = document.createElementNS(SVG_NS, "line");
    stem.setAttribute("x1", String(x + 2));
    stem.setAttribute("y1", String(y - 10));
    stem.setAttribute("x2", String(x + 2));
    stem.setAttribute("y2", String(y + 4));
    stem.setAttribute("stroke-width", "1.4");
    g.appendChild(stem);

    const belly = document.createElementNS(SVG_NS, "path");
    belly.setAttribute("d", `M ${x + 2},${y - 1.5} C ${x - 4.5},${y - 2} ${x - 4.5},${y + 4.5} ${x + 2},${y + 3.5}`);
    belly.setAttribute("stroke-width", "1.4");
    g.appendChild(belly);

    const slash = document.createElementNS(SVG_NS, "line");
    slash.setAttribute("x1", String(x - 1.5));
    slash.setAttribute("y1", String(y - 5.5));
    slash.setAttribute("x2", String(x + 5));
    slash.setAttribute("y2", String(y - 8));
    slash.setAttribute("stroke-width", "1.2");
    g.appendChild(slash);

    parent.appendChild(g);
    return;
  }

  // Meio-sustenido (haste vertical única cortada por duas barras)
  if (accType === "half-sharp") {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("stroke", color);
    g.setAttribute("stroke-width", "1.3");
    g.setAttribute("stroke-linecap", "round");

    const v = document.createElementNS(SVG_NS, "line");
    v.setAttribute("x1", String(x));
    v.setAttribute("y1", String(y - 7.5));
    v.setAttribute("x2", String(x));
    v.setAttribute("y2", String(y + 7.5));
    g.appendChild(v);

    [-2.5, 2.5].forEach(dy => {
      const h = document.createElementNS(SVG_NS, "line");
      h.setAttribute("x1", String(x - 3.8));
      h.setAttribute("y1", String(y + dy + 1));
      h.setAttribute("x2", String(x + 3.8));
      h.setAttribute("y2", String(y + dy - 1));
      g.appendChild(h);
    });

    parent.appendChild(g);
  }
}

/**
 * Desenha linhas suplementares superiores ou inferiores para notas fora das 5 linhas.
 */
function drawLedgerLines(parent, cx, diatIndex, lineColor) {
  // Abaixo da 1ª linha (E4 = 30): C4 (28), A3 (26), F3 (24), D3 (22)
  if (diatIndex <= 28) {
    for (let d = 28; d >= diatIndex; d -= 2) {
      const ly = diatonicToY(d);
      const ln = document.createElementNS(SVG_NS, "line");
      ln.setAttribute("x1", String(cx - 11));
      ln.setAttribute("y1", String(ly));
      ln.setAttribute("x2", String(cx + 11));
      ln.setAttribute("y2", String(ly));
      ln.setAttribute("stroke", lineColor);
      ln.setAttribute("stroke-width", "1.2");
      parent.appendChild(ln);
    }
  }
  // Acima da 5ª linha (F5 = 38): A5 (40), C6 (42)
  if (diatIndex >= 40) {
    for (let d = 40; d <= diatIndex; d += 2) {
      const ly = diatonicToY(d);
      const ln = document.createElementNS(SVG_NS, "line");
      ln.setAttribute("x1", String(cx - 11));
      ln.setAttribute("y1", String(ly));
      ln.setAttribute("x2", String(cx + 11));
      ln.setAttribute("y2", String(ly));
      ln.setAttribute("stroke", lineColor);
      ln.setAttribute("stroke-width", "1.2");
      parent.appendChild(ln);
    }
  }
}

/**
 * Renderiza a Pauta Interativa 24-TET (Clave de Sol 8vb) + Compasso Inspetor.
 *
 * @param {import("../core/urlState.js").OudAppState} state
 * @param {{ absQ: number | null, pitchClassQ: number | null, course?: number, finger?: string | number, qFromNut?: number } | null} selectedPitch
 * @param {number} highlightedStep
 * @param {(selection: { absQ: number, pitchClassQ: number, freq: number } | null) => void} onStaffNoteSelect
 * @param {ReturnType<import("../core/modalEngine.js").computeAnchoredOctavePath>} [octavePathNodes=[]]
 */
export function renderMusicalStaffSVG(state, selectedPitch, highlightedStep, onStaffNoteSelect, octavePathNodes = []) {
  const svg = /** @type {SVGElement | null} */ (/** @type {unknown} */ (document.getElementById("oud-staff")));
  if (!svg) return;
  svg.innerHTML = "";
  svg.setAttribute("viewBox", "0 0 1120 158");

  const isLight = state.theme === "light";
  const isEn = state.lang === "en";

  // Paleta v2.8 — Contenção cromática: Ébano/Pergaminho, Latão e Ameixa (zero ciano)
  const theme = {
    bg: isLight ? "#faf5ec" : "#15100d",
    border: isLight ? "rgba(143, 94, 28, 0.34)" : "rgba(201, 154, 73, 0.28)",
    staffLine: isLight ? "rgba(82, 60, 38, 0.42)" : "rgba(226, 217, 200, 0.32)",
    clef: isLight ? "#8f5e1c" : "#d4a84f",
    textMain: isLight ? "#2b1e14" : "#efe6d8",
    textMuted: isLight ? "#6b5540" : "#b5a694",
    gold: isLight ? "#8f5e1c" : "#d4a84f",
    plum: isLight ? "#6b3f8c" : "#c49be0",
    plumSoft: isLight ? "rgba(107, 63, 140, 0.11)" : "rgba(196, 155, 224, 0.14)",
    plumSolid: isLight ? "#6b3f8c" : "#7e4ca3",
    rootFill: "#c53030",
    ghammazFill: "#c6831c",
    fixedFill: isLight ? "#3b5984" : "#7692b8",
    microFill: isLight ? "#6b3f8c" : "#b278db",
    stemColor: isLight ? "rgba(43, 30, 20, 0.65)" : "rgba(239, 230, 216, 0.68)",
    inspBg: isLight ? "#f3ebdd" : "#1d1612"
  };

  // Fundo principal da partitura
  const bgRect = document.createElementNS(SVG_NS, "rect");
  bgRect.setAttribute("x", "2");
  bgRect.setAttribute("y", "2");
  bgRect.setAttribute("width", "1116");
  bgRect.setAttribute("height", "154");
  bgRect.setAttribute("rx", "10");
  bgRect.setAttribute("fill", theme.bg);
  bgRect.setAttribute("stroke", theme.border);
  bgRect.setAttribute("stroke-width", "1.4");
  svg.appendChild(bgRect);

  const staffLeftX = 24;
  const staffRightX = 852;

  // 5 linhas do pentagrama
  for (let i = 0; i < 5; i++) {
    const ly = 36 + i * 10.5;
    const ln = document.createElementNS(SVG_NS, "line");
    ln.setAttribute("x1", String(staffLeftX));
    ln.setAttribute("y1", String(ly));
    ln.setAttribute("x2", String(staffRightX));
    ln.setAttribute("y2", String(ly));
    ln.setAttribute("stroke", theme.staffLine);
    ln.setAttribute("stroke-width", "1.1");
    svg.appendChild(ln);
  }

  // Barra inicial e barra dupla de separação
  [staffLeftX, staffRightX - 5, staffRightX].forEach((bx, idx) => {
    const bar = document.createElementNS(SVG_NS, "line");
    bar.setAttribute("x1", String(bx));
    bar.setAttribute("y1", "36");
    bar.setAttribute("x2", String(bx));
    bar.setAttribute("y2", "78");
    bar.setAttribute("stroke", idx === 2 ? theme.gold : theme.staffLine);
    bar.setAttribute("stroke-width", idx === 2 ? "2.4" : "1.2");
    svg.appendChild(bar);
  });

  // Clave de Sol 8vb
  const clefTxt = document.createElementNS(SVG_NS, "text");
  clefTxt.setAttribute("x", "44");
  clefTxt.setAttribute("y", "75");
  clefTxt.setAttribute("text-anchor", "middle");
  clefTxt.setAttribute("fill", theme.clef);
  clefTxt.setAttribute("font-size", "48");
  clefTxt.setAttribute("font-family", "serif");
  clefTxt.textContent = "𝄞";
  svg.appendChild(clefTxt);

  const oct8 = document.createElementNS(SVG_NS, "text");
  oct8.setAttribute("x", "44");
  oct8.setAttribute("y", "93");
  oct8.setAttribute("text-anchor", "middle");
  oct8.setAttribute("fill", theme.gold);
  oct8.setAttribute("font-size", "10");
  oct8.setAttribute("font-weight", "800");
  oct8.textContent = "8vb";
  svg.appendChild(oct8);

  // Monta a lista de notas a exibir na pauta
  const activeStruct = getActiveStructure(state);
  const effRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;
  const baseRootAbsQ = 24 + effRootQ; // Oitava central do Oud (C3..B3 soando)

  /** @type {{ absQ: number, pcQ: number, degree: string, isRoot: boolean, isGhammaz: boolean, centsDev: number, stepIdx: number, showStepBadge: boolean }[]} */
  let notesToRender = [];

  const isOctaveMode = state.octavePathOnly && state.anchorAbsQ !== null && octavePathNodes.length > 0;
  const entityAny = /** @type {any} */ (activeStruct.entity);
  const isSayrMode = !isOctaveMode && state.mode === "MAQAM" && state.staffMode === "SAYR" && entityAny.sayr_phrases?.[state.sayrPhraseIndex];

  if (isOctaveMode) {
    notesToRender = octavePathNodes.map((n, idx) => {
      const modOffset = ((n.pitchClassQ - effRootQ) % 24 + 24) % 24;
      return {
        absQ: n.absQ,
        pcQ: n.pitchClassQ,
        degree: n.degree,
        isRoot: modOffset === 0,
        isGhammaz: activeStruct.ghammazOffsets.includes(modOffset),
        centsDev: activeStruct.centsMap[modOffset] || 0,
        stepIdx: idx,
        showStepBadge: true
      };
    });
  } else if (isSayrMode) {
    const phrase = entityAny.sayr_phrases[state.sayrPhraseIndex];
    notesToRender = phrase.steps.map((/** @type {any} */ st, /** @type {number} */ idx) => {
      const absQ = baseRootAbsQ + st.interval_q;
      const modOffset = ((st.interval_q % 24) + 24) % 24;
      const degIdx = activeStruct.intervals.findIndex(iq => ((iq % 24) + 24) % 24 === modOffset);
      return {
        absQ,
        pcQ: ((absQ % 24) + 24) % 24,
        degree: degIdx >= 0 ? activeStruct.degrees[degIdx] : "",
        isRoot: modOffset === 0,
        isGhammaz: activeStruct.ghammazOffsets.includes(modOffset),
        centsDev: activeStruct.centsMap[modOffset] || 0,
        stepIdx: idx,
        showStepBadge: true
      };
    });
  } else {
    notesToRender = activeStruct.intervals.map((intQ, idx) => {
      const absQ = baseRootAbsQ + intQ;
      const modOffset = ((intQ % 24) + 24) % 24;
      return {
        absQ,
        pcQ: ((absQ % 24) + 24) % 24,
        degree: activeStruct.degrees[idx] || "",
        isRoot: modOffset === 0,
        isGhammaz: activeStruct.ghammazOffsets.includes(modOffset),
        centsDev: activeStruct.centsMap[intQ] || 0,
        stepIdx: idx,
        showStepBadge: false
      };
    });
  }

  // Distribui horizontalmente as notas na pauta
  const usableStartX = 112;
  const usableEndX = 812;
  const count = notesToRender.length;
  const spacing = count > 1 ? Math.min(82, (usableEndX - usableStartX) / (count - 1)) : 0;
  const totalSpan = spacing * Math.max(0, count - 1);
  const offsetStartX = usableStartX + Math.max(0, (usableEndX - usableStartX - totalSpan) / 2);

  notesToRender.forEach((nObj, idx) => {
    const cx = count === 1 ? (usableStartX + usableEndX) / 2 : offsetStartX + idx * spacing;
    const pitchInfo = getWrittenDiatonicIndex(nObj.absQ);
    const cy = Math.max(18, Math.min(130, diatonicToY(pitchInfo.diatIndex)));
    const pcData = PITCH_CLASSES_24[nObj.pcQ] || PITCH_CLASSES_24[0];
    const freq = 65.40639 * Math.pow(2, (nObj.absQ * 50 + nObj.centsDev) / 1200);

    const isPlaybackHit = (isSayrMode || isOctaveMode) && highlightedStep === nObj.stepIdx;
    const isExactSelected = selectedPitch !== null && selectedPitch.absQ === nObj.absQ;
    const isClassSelected = selectedPitch !== null && !isExactSelected && selectedPitch.pitchClassQ === nObj.pcQ;

    const noteGroup = document.createElementNS(SVG_NS, "g");
    noteGroup.style.cursor = "pointer";

    noteGroup.addEventListener("click", () => {
      playPluckedNote(freq, 1.35);
      if (onStaffNoteSelect) {
        if (isExactSelected) {
          onStaffNoteSelect(null);
        } else {
          onStaffNoteSelect({ absQ: nObj.absQ, pitchClassQ: nObj.pcQ, freq });
        }
      }
    });

    // Linhas suplementares
    drawLedgerLines(noteGroup, cx, pitchInfo.diatIndex, theme.staffLine);

    // Halo de seleção ou reprodução (Ameixa / Latão)
    if (isExactSelected || isPlaybackHit || isClassSelected) {
      const halo = document.createElementNS(SVG_NS, "circle");
      halo.setAttribute("cx", String(cx));
      halo.setAttribute("cy", String(cy));
      halo.setAttribute("r", isExactSelected || isPlaybackHit ? "14" : "12");
      halo.setAttribute("fill", isExactSelected || isPlaybackHit ? theme.plumSoft : "rgba(212, 168, 79, 0.14)");
      halo.setAttribute("stroke", isExactSelected || isPlaybackHit ? theme.plum : theme.gold);
      halo.setAttribute("stroke-width", isExactSelected || isPlaybackHit ? "2" : "1.4");
      if (isClassSelected) halo.setAttribute("stroke-dasharray", "3,2");
      noteGroup.appendChild(halo);
    }

    // Cor da cabeça da nota
    let headFill = theme.fixedFill;
    if (nObj.isRoot) headFill = theme.rootFill;
    else if (nObj.isGhammaz) headFill = theme.ghammazFill;
    else if (pcData.micro) headFill = theme.microFill;

    // Acidente vetorial à esquerda
    drawAccidental(noteGroup, cx - 15, cy, pitchInfo.acc, pcData.micro ? theme.plum : theme.textMain);

    // Haste (para cima se abaixo da linha central B4=34, para baixo se acima)
    const stemUp = pitchInfo.diatIndex < 34;
    const stem = document.createElementNS(SVG_NS, "line");
    const stemX = stemUp ? cx + 5.8 : cx - 5.8;
    stem.setAttribute("x1", String(stemX));
    stem.setAttribute("y1", String(cy));
    stem.setAttribute("x2", String(stemX));
    stem.setAttribute("y2", String(stemUp ? cy - 26 : cy + 26));
    stem.setAttribute("stroke", isPlaybackHit || isExactSelected ? theme.plum : theme.stemColor);
    stem.setAttribute("stroke-width", "1.4");
    noteGroup.appendChild(stem);

    // Cabeça elíptica inclinada da nota
    const head = document.createElementNS(SVG_NS, "ellipse");
    head.setAttribute("cx", String(cx));
    head.setAttribute("cy", String(cy));
    head.setAttribute("rx", "6.4");
    head.setAttribute("ry", "4.6");
    head.setAttribute("transform", `rotate(-18 ${cx} ${cy})`);
    head.setAttribute("fill", headFill);
    head.setAttribute("stroke", isExactSelected || isPlaybackHit ? "#ffffff" : "rgba(0,0,0,0.28)");
    head.setAttribute("stroke-width", isExactSelected || isPlaybackHit ? "1.6" : "0.9");
    noteGroup.appendChild(head);

    // Grau ou número do passo no topo da pauta
    const topLbl = document.createElementNS(SVG_NS, "text");
    topLbl.setAttribute("x", String(cx));
    topLbl.setAttribute("y", "19");
    topLbl.setAttribute("text-anchor", "middle");
    topLbl.setAttribute("fill", nObj.isRoot ? theme.rootFill : (nObj.showStepBadge ? theme.plum : theme.gold));
    topLbl.setAttribute("font-size", "9.5");
    topLbl.setAttribute("font-weight", "800");
    topLbl.textContent = nObj.showStepBadge ? `${idx + 1}·${nObj.degree}` : nObj.degree;
    noteGroup.appendChild(topLbl);

    // Cifra da nota na base
    const noteLbl = document.createElementNS(SVG_NS, "text");
    noteLbl.setAttribute("x", String(cx));
    noteLbl.setAttribute("y", "145");
    noteLbl.setAttribute("text-anchor", "middle");
    noteLbl.setAttribute("fill", isExactSelected || isPlaybackHit ? theme.plum : (pcData.micro ? theme.plum : theme.textMain));
    noteLbl.setAttribute("font-size", "10.5");
    noteLbl.setAttribute("font-weight", isExactSelected || nObj.isRoot ? "800" : "700");
    noteLbl.textContent = pcData.flat;
    noteGroup.appendChild(noteLbl);

    svg.appendChild(noteGroup);
  });

  // =========================================================================
  // COMPASSO INSPETOR (Direita: x = 868..1106) — Paleta Ameixa & Latão
  // =========================================================================
  const inspBox = document.createElementNS(SVG_NS, "rect");
  inspBox.setAttribute("x", "868");
  inspBox.setAttribute("y", "10");
  inspBox.setAttribute("width", "238");
  inspBox.setAttribute("height", "138");
  inspBox.setAttribute("rx", "8");
  inspBox.setAttribute("fill", theme.inspBg);
  inspBox.setAttribute("stroke", selectedPitch ? theme.plum : theme.border);
  inspBox.setAttribute("stroke-width", selectedPitch ? "1.6" : "1.1");
  svg.appendChild(inspBox);

  const inspHeader = document.createElementNS(SVG_NS, "text");
  inspHeader.setAttribute("x", "987");
  inspHeader.setAttribute("y", "28");
  inspHeader.setAttribute("text-anchor", "middle");
  inspHeader.setAttribute("fill", theme.gold);
  inspHeader.setAttribute("font-size", "9.5");
  inspHeader.setAttribute("font-weight", "800");
  inspHeader.setAttribute("letter-spacing", "0.6");
  inspHeader.textContent = isEn ? "NOTE INSPECTOR (24-TET)" : "COMPASSO INSPETOR (24-TET)";
  svg.appendChild(inspHeader);

  if (selectedPitch && (typeof selectedPitch.pitchClassQ === "number" || typeof selectedPitch.absQ === "number")) {
    const selPcQ = typeof selectedPitch.pitchClassQ === "number"
      ? ((selectedPitch.pitchClassQ % 24) + 24) % 24
      : ((/** @type {number} */ (selectedPitch.absQ) % 24) + 24) % 24;
    const selAbsQ = typeof selectedPitch.absQ === "number" ? selectedPitch.absQ : (24 + selPcQ);
    const pcData = PITCH_CLASSES_24[selPcQ] || PITCH_CLASSES_24[0];
    const octNum = Math.floor(selAbsQ / 24) + 2;
    const modOffset = ((selPcQ - effRootQ) % 24 + 24) % 24;
    const degIdx = activeStruct.intervals.findIndex(iq => ((iq % 24) + 24) % 24 === modOffset);
    const degTxt = degIdx >= 0 ? activeStruct.degrees[degIdx] : "—";

    const pitchBig = document.createElementNS(SVG_NS, "text");
    pitchBig.setAttribute("x", "987");
    pitchBig.setAttribute("y", "66");
    pitchBig.setAttribute("text-anchor", "middle");
    pitchBig.setAttribute("fill", pcData.micro ? theme.plum : theme.textMain);
    pitchBig.setAttribute("font-size", "26");
    pitchBig.setAttribute("font-weight", "800");
    pitchBig.textContent = `${pcData.flat}${octNum}`;
    svg.appendChild(pitchBig);

    const arabicLbl = document.createElementNS(SVG_NS, "text");
    arabicLbl.setAttribute("x", "987");
    arabicLbl.setAttribute("y", "88");
    arabicLbl.setAttribute("text-anchor", "middle");
    arabicLbl.setAttribute("fill", theme.plum);
    arabicLbl.setAttribute("font-size", "12");
    arabicLbl.setAttribute("font-weight", "700");
    arabicLbl.textContent = `${pcData.arabic} • ${isEn ? "Deg" : "Grau"} ${degTxt}`;
    svg.appendChild(arabicLbl);

    const detailLine = document.createElementNS(SVG_NS, "text");
    detailLine.setAttribute("x", "987");
    detailLine.setAttribute("y", "112");
    detailLine.setAttribute("text-anchor", "middle");
    detailLine.setAttribute("fill", theme.textMuted);
    detailLine.setAttribute("font-size", "10.2");
    detailLine.setAttribute("font-weight", "600");
    if (selectedPitch.course) {
      const fTxt = selectedPitch.qFromNut === 0
        ? (isEn ? "Open" : "Solta")
        : `${isEn ? "Finger" : "Dedo"} ${selectedPitch.finger ?? ""}`;
      detailLine.textContent = `${selectedPitch.course}ª ${isEn ? "Course" : "Ordem"} • ${fTxt}`;
    } else {
      detailLine.textContent = pcData.micro
        ? (isEn ? "Quarter-tone (Microtonal 24-TET)" : "Quarto de Tom (Microtonal 24-TET)")
        : (isEn ? "Fixed pitch (12-TET)" : "Altura Fixa (12-TET)");
    }
    svg.appendChild(detailLine);

    const hintLine = document.createElementNS(SVG_NS, "text");
    hintLine.setAttribute("x", "987");
    hintLine.setAttribute("y", "134");
    hintLine.setAttribute("text-anchor", "middle");
    hintLine.setAttribute("fill", theme.gold);
    hintLine.setAttribute("font-size", "9");
    hintLine.setAttribute("font-weight", "700");
    hintLine.textContent = isEn ? "Double-click neck jewel to set Tonic" : "Duplo clique no braço define Tônica";
    svg.appendChild(hintLine);
  } else {
    const empty1 = document.createElementNS(SVG_NS, "text");
    empty1.setAttribute("x", "987");
    empty1.setAttribute("y", "72");
    empty1.setAttribute("text-anchor", "middle");
    empty1.setAttribute("fill", theme.textMuted);
    empty1.setAttribute("font-size", "11");
    empty1.setAttribute("font-weight", "600");
    empty1.textContent = isEn ? "Click a note on the staff" : "Toque uma nota na pauta";
    svg.appendChild(empty1);

    const empty2 = document.createElementNS(SVG_NS, "text");
    empty2.setAttribute("x", "987");
    empty2.setAttribute("y", "92");
    empty2.setAttribute("text-anchor", "middle");
    empty2.setAttribute("fill", theme.textMuted);
    empty2.setAttribute("font-size", "11");
    empty2.setAttribute("font-weight", "600");
    empty2.textContent = isEn ? "or on the Oud fingerboard" : "ou no espelho do Oud";
    svg.appendChild(empty2);
  }
}
