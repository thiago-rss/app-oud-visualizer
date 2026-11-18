// @ts-check
import { DB, PITCH_CLASSES_24, TRADITION_PALETTES } from "../core/database.js";
import {
  MAX_NECK_Q,
  getPhysicalX,
  getActiveStructure,
  evaluateShapeAndFinger,
  selectBestChordVoicingPerCourse
} from "../core/modalEngine.js";
import { playPluckedNote } from "../audio/synthEngine.js";

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} outerR
 * @param {number} innerR
 */
function createOctagramStarPath(cx, cy, outerR, innerR) {
  const points = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    points.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return points.join(" ");
}

/**
 * @param {SVGElement} svg
 * @param {number} cx
 * @param {number} cy
 * @param {number} radius
 * @param {any} palette
 * @param {() => void} onRosetteClick
 */
function renderShamsiyyaRosette(svg, cx, cy, radius, palette, onRosetteClick) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.style.cursor = "pointer";
  g.addEventListener("click", onRosetteClick);

  const outerRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  outerRing.setAttribute("cx", String(cx));
  outerRing.setAttribute("cy", String(cy));
  outerRing.setAttribute("r", String(radius + 6));
  outerRing.setAttribute("fill", palette.ebony);
  outerRing.setAttribute("stroke", palette.rosetteRing);
  outerRing.setAttribute("stroke-width", "2");
  g.appendChild(outerRing);

  const pearlRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  pearlRing.setAttribute("cx", String(cx));
  pearlRing.setAttribute("cy", String(cy));
  pearlRing.setAttribute("r", String(radius + 3));
  pearlRing.setAttribute("fill", "none");
  pearlRing.setAttribute("stroke", palette.inlayStripe);
  pearlRing.setAttribute("stroke-width", "1.2");
  pearlRing.setAttribute("stroke-dasharray", "3,2");
  g.appendChild(pearlRing);

  const hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  hole.setAttribute("cx", String(cx));
  hole.setAttribute("cy", String(cy));
  hole.setAttribute("r", String(radius));
  hole.setAttribute("fill", "#090604");
  hole.setAttribute("stroke", palette.rosetteRing);
  hole.setAttribute("stroke-width", "1.4");
  g.appendChild(hole);

  for (let a = 0; a < 180; a += 15) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const side = radius * 1.32;
    rect.setAttribute("x", String(cx - side / 2));
    rect.setAttribute("y", String(cy - side / 2));
    rect.setAttribute("width", String(side));
    rect.setAttribute("height", String(side));
    rect.setAttribute("rx", "3");
    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke", palette.rosetteRing);
    rect.setAttribute("stroke-width", "0.8");
    rect.setAttribute("opacity", "0.75");
    rect.setAttribute("transform", `rotate(${a} ${cx} ${cy})`);
    g.appendChild(rect);
  }

  const innerStar = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  innerStar.setAttribute("points", createOctagramStarPath(cx, cy, radius * 0.52, radius * 0.28));
  innerStar.setAttribute("fill", "rgba(212, 175, 55, 0.18)");
  innerStar.setAttribute("stroke", palette.sadaf);
  innerStar.setAttribute("stroke-width", "1");
  g.appendChild(innerStar);

  svg.appendChild(g);
}

/**
 * @param {SVGElement} svg
 * @param {{ x: number, y: number, absQ: number, modOffsetQ: number }[]} visibleActiveNodes
 * @param {{ interval_q: number, dur_ms: number, accent?: boolean }[]} sayrSteps
 * @param {number} highlightedStepIdx
 */
function renderSayrMelodicPaths(svg, visibleActiveNodes, sayrSteps, highlightedStepIdx) {
  if (!visibleActiveNodes.length || !sayrSteps || !sayrSteps.length) return;

  /** @type {{ x: number, y: number, absQ: number, stepIdx: number }[]} */
  const resolvedPathNodes = [];
  /** @type {number | null} */
  let prevAbsQ = null;

  sayrSteps.forEach((step, stepIdx) => {
    const targetModQ = ((step.interval_q % 24) + 24) % 24;
    const candidates = visibleActiveNodes.filter(n => n.modOffsetQ === targetModQ);
    if (!candidates.length) return;

    let chosen = candidates[0];
    if (prevAbsQ !== null) {
      const expectedDelta = step.interval_q - (sayrSteps[stepIdx - 1]?.interval_q ?? 0);
      const idealTargetAbsQ = prevAbsQ + expectedDelta;
      candidates.sort((a, b) => Math.abs(a.absQ - idealTargetAbsQ) - Math.abs(b.absQ - idealTargetAbsQ));
      chosen = candidates[0];
    } else {
      candidates.sort((a, b) => a.absQ - b.absQ);
      chosen = candidates[0];
    }

    prevAbsQ = chosen.absQ;
    resolvedPathNodes.push({ x: chosen.x, y: chosen.y, absQ: chosen.absQ, stepIdx });
  });

  if (resolvedPathNodes.length < 2) return;

  const trailGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  trailGroup.setAttribute("pointer-events", "none");

  for (let i = 0; i < resolvedPathNodes.length - 1; i++) {
    const p1 = resolvedPathNodes[i];
    const p2 = resolvedPathNodes[i + 1];
    if (p1.x === p2.x && p1.y === p2.y) continue;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const normOffset = (i % 2 === 0 ? -1 : 1) * 16;
    const dist = Math.hypot(dx, dy) || 1;
    const ctrlX = midX - (dy / dist) * normOffset;
    const ctrlY = midY + (dx / dist) * normOffset;

    const isCurrentSegment = highlightedStepIdx === i || highlightedStepIdx === i + 1;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} Q ${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", isCurrentSegment ? "#67e8f9" : "#fde047");
    path.setAttribute("stroke-width", isCurrentSegment ? "3.2" : "2.1");
    path.setAttribute("stroke-opacity", isCurrentSegment ? "0.95" : "0.78");
    path.setAttribute("marker-end", isCurrentSegment ? "url(#sayrArrowActive)" : "url(#sayrArrow)");
    trailGroup.appendChild(path);
  }

  resolvedPathNodes.forEach((pt, idx) => {
    const isHighlighted = highlightedStepIdx === pt.stepIdx;
    const badgeX = pt.x + 11;
    const badgeY = pt.y - 11;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(badgeX));
    circle.setAttribute("cy", String(badgeY));
    circle.setAttribute("r", isHighlighted ? "9" : "7");
    circle.setAttribute("fill", isHighlighted ? "#06b6d4" : "#140c08");
    circle.setAttribute("stroke", isHighlighted ? "#ffffff" : "#fde047");
    circle.setAttribute("stroke-width", "1.3");
    trailGroup.appendChild(circle);

    const num = document.createElementNS("http://www.w3.org/2000/svg", "text");
    num.setAttribute("x", String(badgeX));
    num.setAttribute("y", String(badgeY + 2.8));
    num.setAttribute("text-anchor", "middle");
    num.setAttribute("fill", isHighlighted ? "#ffffff" : "#fde047");
    num.setAttribute("font-size", "8");
    num.setAttribute("font-weight", "800");
    num.textContent = String(idx + 1);
    trailGroup.appendChild(num);
  });

  svg.appendChild(trailGroup);
}

/**
 * Desenha a joia de uma nota no espelho, distinguindo visualmente notas soltas (antes da pestana)
 * com um anel externo pontilhado sutil quando qFromNut === 0.
 */
function appendNoteJewel(
  svg,
  nx,
  ny,
  qFromNut,
  absQ,
  pitchClassQ,
  courseNumber,
  fingerLabel,
  isRoot,
  isGhammaz,
  isMicroNote,
  isSelectedActiveNote,
  displayText,
  labelMode,
  noteFreq,
  palette,
  selectedPitch,
  onNeckJewelSelect
) {
  let fillGrad = "url(#fixedGem)";
  let strokeColor = "#bfdbfe";
  if (isRoot) {
    fillGrad = "url(#rootGem)";
    strokeColor = "#fde68a";
  } else if (isGhammaz) {
    fillGrad = "url(#ghammazGem)";
    strokeColor = "#fef08a";
  } else if (isMicroNote) {
    fillGrad = "url(#microGem)";
    strokeColor = palette.inlayStripe;
  }

  const isExactStaffMatch = selectedPitch !== null && selectedPitch.absQ === absQ;
  const isOctaveStaffMatch = selectedPitch !== null && !isExactStaffMatch && selectedPitch.pitchClassQ === pitchClassQ;

  let nodeOpacity = isSelectedActiveNote ? "1.0" : "0.18";
  if (selectedPitch !== null && isSelectedActiveNote) {
    nodeOpacity = (isExactStaffMatch || isOctaveStaffMatch) ? "1.0" : "0.35";
  }

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("class", "note-node");
  group.setAttribute("opacity", nodeOpacity);

  group.addEventListener("click", () => {
    playPluckedNote(noteFreq, 1.35);
    if (onNeckJewelSelect) {
      onNeckJewelSelect({
        absQ,
        pitchClassQ,
        course: courseNumber,
        finger: fingerLabel,
        freq: noteFreq
      });
    }
  });

  // Halo de Sincronização Pauta <-> Espelho
  if (isExactStaffMatch || isOctaveStaffMatch) {
    const halo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    halo.setAttribute("cx", String(nx));
    halo.setAttribute("cy", String(ny));
    halo.setAttribute("r", isExactStaffMatch ? "20" : "18");
    halo.setAttribute("fill", isExactStaffMatch ? "rgba(103, 232, 249, 0.28)" : "rgba(253, 224, 71, 0.14)");
    halo.setAttribute("stroke", isExactStaffMatch ? "#67e8f9" : "#fde047");
    halo.setAttribute("stroke-width", isExactStaffMatch ? "2.6" : "1.8");
    if (isOctaveStaffMatch) halo.setAttribute("stroke-dasharray", "3,2");
    group.appendChild(halo);
  }

  // Anel indicador de Corda Solta (qFromNut === 0) antes da pestana
  if (qFromNut === 0 && isSelectedActiveNote) {
    const openHalo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    openHalo.setAttribute("cx", String(nx));
    openHalo.setAttribute("cy", String(ny));
    openHalo.setAttribute("r", "15.5");
    openHalo.setAttribute("fill", "none");
    openHalo.setAttribute("stroke", "#fef3c7");
    openHalo.setAttribute("stroke-width", "1.1");
    openHalo.setAttribute("stroke-dasharray", "2,2");
    openHalo.setAttribute("opacity", "0.75");
    group.appendChild(openHalo);
  }

  if (isMicroNote) {
    const outerR = isRoot ? 15.5 : 13.8;
    const innerR = isRoot ? 11.2 : 9.8;
    const star = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    star.setAttribute("points", createOctagramStarPath(nx, ny, outerR, innerR));
    star.setAttribute("fill", fillGrad);
    star.setAttribute("stroke", isExactStaffMatch ? "#ffffff" : strokeColor);
    star.setAttribute("stroke-width", isExactStaffMatch ? "2.6" : (isRoot ? "2.2" : "1.4"));
    group.appendChild(star);
  } else {
    const radius = isRoot ? 13.5 : (isGhammaz ? 12.6 : 11.5);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(nx));
    circle.setAttribute("cy", String(ny));
    circle.setAttribute("r", String(radius));
    circle.setAttribute("fill", fillGrad);
    circle.setAttribute("stroke", isExactStaffMatch ? "#ffffff" : strokeColor);
    circle.setAttribute("stroke-width", isExactStaffMatch ? "2.8" : (isRoot ? "2.4" : "1.4"));
    group.appendChild(circle);

    if (isRoot || isGhammaz) {
      const innerRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      innerRing.setAttribute("cx", String(nx));
      innerRing.setAttribute("cy", String(ny));
      innerRing.setAttribute("r", String(radius - 3));
      innerRing.setAttribute("fill", "none");
      innerRing.setAttribute("stroke", "rgba(255,255,255,0.45)");
      innerRing.setAttribute("stroke-width", "0.8");
      group.appendChild(innerRing);
    }
  }

  const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textEl.setAttribute("x", String(nx));
  textEl.setAttribute("y", String(ny + 3.6));
  textEl.setAttribute("text-anchor", "middle");
  textEl.setAttribute("fill", "#ffffff");
  textEl.setAttribute("font-size", labelMode === "ARABIC" ? "8.2" : "10");
  textEl.setAttribute("font-weight", "700");
  textEl.setAttribute("pointer-events", "none");
  textEl.textContent = displayText;
  group.appendChild(textEl);

  svg.appendChild(group);
}

/**
 * Renderiza o espelho completo com trilho dedicado de cordas soltas antes da pestana (Anf)
 * e retorna as frequências do voicing ativo.
 *
 * @param {import("../core/urlState.js").OudAppState} state
 * @param {() => void} onRosetteClick
 * @param {number} [highlightedSayrStep=-1]
 * @param {{ absQ: number | null, pitchClassQ: number | null } | null} [selectedPitch=null]
 * @param {(noteInfo: { absQ: number, pitchClassQ: number, course: number, finger: string | number, freq: number }) => void} [onNeckJewelSelect]
 * @returns {{ course: number, freq: number }[]}
 */
export function renderOudNeckSVG(state, onRosetteClick, highlightedSayrStep = -1, selectedPitch = null, onNeckJewelSelect) {
  const svg = /** @type {SVGElement} */ (/** @type {unknown} */ (document.getElementById("oud-neck")));
  svg.innerHTML = "";
  /** @type {{ course: number, freq: number }[]} */
  const currentChordVoicingFreqs = [];
  /** @type {{ x: number, y: number, absQ: number, modOffsetQ: number }[]} */
  const visibleActiveNodes = [];

  const isVert = state.orientation === "VERTICAL";
  const isEn = state.lang === "en";
  svg.setAttribute("viewBox", isVert ? "0 0 410 1065" : "0 0 1120 370");

  const palette = TRADITION_PALETTES[/** @type {"damascus"|"cairo"|"istanbul"} */ (state.tradition)] || TRADITION_PALETTES.damascus;
  const tuning = DB.tunings.find(t => t.id === state.tuningId) || DB.tunings[0];
  const activeStruct = getActiveStructure(state);
  const effectiveRootQ = activeStruct.effectiveRootQ;

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = `
    <linearGradient id="soundboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.soundboard}" />
      <stop offset="100%" stop-color="${palette.soundboardEdge}" />
    </linearGradient>
    <linearGradient id="ebonyGrad" x1="0%" y1="0%" x2="${isVert ? "100%" : "0%"}" y2="${isVert ? "0%" : "100%"}">
      <stop offset="0%" stop-color="#24201d" />
      <stop offset="50%" stop-color="${palette.ebony}" />
      <stop offset="100%" stop-color="#0b0908" />
    </linearGradient>
    <radialGradient id="rootGem" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#f87171" />
      <stop offset="60%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </radialGradient>
    <radialGradient id="ghammazGem" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="60%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#78350f" />
    </radialGradient>
    <radialGradient id="fixedGem" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="60%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </radialGradient>
    <radialGradient id="microGem" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#f0abfc" />
      <stop offset="55%" stop-color="#9333ea" />
      <stop offset="100%" stop-color="#4c1d95" />
    </radialGradient>
    <marker id="sayrArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#fde047" />
    </marker>
    <marker id="sayrArrowActive" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#67e8f9" />
    </marker>
  `;
  svg.appendChild(defs);

  const activeOffsetMap = new Map();
  activeStruct.intervals.forEach((intQ, idx) => {
    const modQ = ((intQ % 24) + 24) % 24;
    if (!activeOffsetMap.has(modQ)) {
      activeOffsetMap.set(modQ, {
        degree: activeStruct.degrees[idx],
        centsDev: activeStruct.centsMap[intQ] || 0,
        rawInterval: intQ
      });
    }
  });

  const isChordLikeMode = state.mode === "CHORD" || state.mode === "CADENCE";
  const isChordVoicingActive = isChordLikeMode && state.chordVoicingOnly;
  const chordVoicingMap = isChordVoicingActive
    ? selectBestChordVoicingPerCourse(tuning, activeOffsetMap, effectiveRootQ, state.shapeMode, state.boxAnchorQ)
    : null;

  const keySemitones = [2, 4, 5, 7, 9, 10, 12, 14];

  // =========================================================================
  // MODO VERTICAL (Bajak / Soltas no Topo -> Pestana -> Braço -> Corpo na Base)
  // =========================================================================
  if (isVert) {
    const nutY = 148;
    const neckEndY = 905;
    const neckLengthPx = neckEndY - nutY;
    const leftX = 82;
    const rightX = 328;
    const centerX = (leftX + rightX) / 2;

    const bodyJointY = getPhysicalX(10, nutY, neckLengthPx, false);
    const soundboardFarY = 1052;

    const sbPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    sbPath.setAttribute(
      "d",
      `M ${leftX - 20},${bodyJointY} Q 10,${bodyJointY + 50} 10,${bodyJointY + 145} L 10,${soundboardFarY} L 400,${soundboardFarY} L 400,${bodyJointY + 145} Q 400,${bodyJointY + 50} ${rightX + 20},${bodyJointY} Z`
    );
    sbPath.setAttribute("fill", "url(#soundboardGrad)");
    sbPath.setAttribute("stroke", palette.rosetteRing);
    sbPath.setAttribute("stroke-width", "3");
    svg.appendChild(sbPath);

    const rosetteCenterY = 985;
    const raqma = document.createElementNS("http://www.w3.org/2000/svg", "path");
    raqma.setAttribute(
      "d",
      `M ${leftX - 6},${neckEndY - 12} Q ${leftX - 24},${neckEndY + 25} ${centerX - 46},${rosetteCenterY - 38} L ${centerX + 46},${rosetteCenterY - 38} Q ${rightX + 24},${neckEndY + 25} ${rightX + 6},${neckEndY - 12} Z`
    );
    raqma.setAttribute("fill", palette.raqma);
    raqma.setAttribute("stroke", palette.rosetteRing);
    raqma.setAttribute("stroke-width", "1.2");
    raqma.setAttribute("opacity", "0.88");
    svg.appendChild(raqma);

    renderShamsiyyaRosette(svg, centerX, rosetteCenterY, 38, palette, onRosetteClick);
    renderShamsiyyaRosette(svg, leftX - 28, rosetteCenterY - 62, 14, palette, onRosetteClick);
    renderShamsiyyaRosette(svg, rightX + 28, rosetteCenterY - 62, 14, palette, onRosetteClick);

    // Cravelhal (Bajak) acomodando o trilho de Cordas Soltas antes da Pestana
    const pegbox = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    pegbox.setAttribute("points", `${leftX - 14},${nutY} ${leftX + 4},34 ${rightX - 4},34 ${rightX + 14},${nutY}`);
    pegbox.setAttribute("fill", "#1a110b");
    pegbox.setAttribute("stroke", palette.rosetteRing);
    pegbox.setAttribute("stroke-width", "1.5");
    svg.appendChild(pegbox);

    // Faixa destacada do Trilho de Cordas Soltas (0q) antes da pestana
    const openRailY = getPhysicalX(0, nutY, neckLengthPx, false);
    const openZoneRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    openZoneRect.setAttribute("x", String(leftX - 12));
    openZoneRect.setAttribute("y", String(openRailY - 17));
    openZoneRect.setAttribute("width", String((rightX - leftX) + 24));
    openZoneRect.setAttribute("height", "34");
    openZoneRect.setAttribute("rx", "6");
    openZoneRect.setAttribute("fill", "rgba(254, 243, 199, 0.06)");
    openZoneRect.setAttribute("stroke", "rgba(254, 243, 199, 0.22)");
    openZoneRect.setAttribute("stroke-dasharray", "3,3");
    svg.appendChild(openZoneRect);

    const openLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    openLbl.setAttribute("x", String(leftX - 32));
    openLbl.setAttribute("y", String(openRailY + 3.5));
    openLbl.setAttribute("text-anchor", "middle");
    openLbl.setAttribute("fill", "#fef3c7");
    openLbl.setAttribute("font-size", "9.5");
    openLbl.setAttribute("font-weight", "800");
    openLbl.textContent = isEn ? "OPEN" : "SOLTA";
    svg.appendChild(openLbl);

    const neckPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    neckPolygon.setAttribute("points", `${leftX - 14},${nutY} ${rightX + 14},${nutY} ${rightX + 22},${neckEndY} ${leftX - 22},${neckEndY}`);
    neckPolygon.setAttribute("fill", "url(#ebonyGrad)");
    neckPolygon.setAttribute("stroke", palette.rosetteRing);
    neckPolygon.setAttribute("stroke-width", "2");
    svg.appendChild(neckPolygon);

    [
      { x1: leftX - 11, x2: leftX - 19 },
      { x1: rightX + 11, x2: rightX + 19 }
    ].forEach(strip => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(strip.x1));
      line.setAttribute("y1", String(nutY));
      line.setAttribute("x2", String(strip.x2));
      line.setAttribute("y2", String(neckEndY));
      line.setAttribute("stroke", palette.inlayStripe);
      line.setAttribute("stroke-width", "2");
      line.setAttribute("stroke-dasharray", "8,4,2,4");
      line.setAttribute("opacity", "0.75");
      svg.appendChild(line);
    });

    // Caixa de Shape da Mão Esquerda (só começa APÓS a pestana no CLOSED_BOX, ou abrange o trilho 0q na 1ª Posição)
    if (state.shapeMode !== "FULL_NECK" || isChordVoicingActive) {
      const startQ = state.shapeMode === "CLOSED_BOX" ? state.boxAnchorQ : 0;
      const endQ = state.shapeMode === "CLOSED_BOX" ? Math.min(MAX_NECK_Q, state.boxAnchorQ + 7) : 8;
      const y1 = getPhysicalX(startQ, nutY, neckLengthPx, false);
      const y2 = getPhysicalX(endQ, nutY, neckLengthPx, false);

      const boxRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      boxRect.setAttribute("x", String(leftX - 16));
      boxRect.setAttribute("y", String(y1 - 16));
      boxRect.setAttribute("width", String((rightX - leftX) + 32));
      boxRect.setAttribute("height", String((y2 - y1) + 32));
      boxRect.setAttribute("rx", "8");
      boxRect.setAttribute("fill", "rgba(212, 175, 55, 0.08)");
      boxRect.setAttribute("stroke", palette.rosetteRing);
      boxRect.setAttribute("stroke-width", "1.6");
      boxRect.setAttribute("stroke-dasharray", "6,4");
      svg.appendChild(boxRect);
    }

    // Pestana de Osso (Anf) — 100% desobstruída como marco divisor
    const nutLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    nutLine.setAttribute("x1", String(leftX - 15));
    nutLine.setAttribute("y1", String(nutY));
    nutLine.setAttribute("x2", String(rightX + 15));
    nutLine.setAttribute("y2", String(nutY));
    nutLine.setAttribute("stroke", "#fef3c7");
    nutLine.setAttribute("stroke-width", "9");
    svg.appendChild(nutLine);

    const nutBorder = document.createElementNS("http://www.w3.org/2000/svg", "line");
    nutBorder.setAttribute("x1", String(leftX - 15));
    nutBorder.setAttribute("y1", String(nutY + 4.5));
    nutBorder.setAttribute("x2", String(rightX + 15));
    nutBorder.setAttribute("y2", String(nutY + 4.5));
    nutBorder.setAttribute("stroke", "#78350f");
    nutBorder.setAttribute("stroke-width", "1.5");
    svg.appendChild(nutBorder);

    const nutTag = document.createElementNS("http://www.w3.org/2000/svg", "text");
    nutTag.setAttribute("x", String(leftX - 32));
    nutTag.setAttribute("y", String(nutY + 3.5));
    nutTag.setAttribute("text-anchor", "middle");
    nutTag.setAttribute("fill", "#d4af37");
    nutTag.setAttribute("font-size", "8.5");
    nutTag.setAttribute("font-weight", "800");
    nutTag.textContent = "ANF";
    svg.appendChild(nutTag);

    for (let q = 1; q <= MAX_NECK_Q; q++) {
      const isMicro = q % 2 !== 0;
      if (isMicro && !state.showMicroGuides) continue;
      if (!isMicro && !state.showSemiGuides) continue;

      const gy = getPhysicalX(q, nutY, neckLengthPx, false);
      const gLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      gLine.setAttribute("x1", String(leftX - 12));
      gLine.setAttribute("y1", String(gy));
      gLine.setAttribute("x2", String(rightX + 12));
      gLine.setAttribute("y2", String(gy));
      gLine.setAttribute("stroke", isMicro ? "rgba(192, 132, 252, 0.22)" : "rgba(212, 175, 55, 0.24)");
      gLine.setAttribute("stroke-width", isMicro ? "1" : "1.4");
      if (isMicro) gLine.setAttribute("stroke-dasharray", "3,4");
      svg.appendChild(gLine);

      if (keySemitones.includes(q)) {
        const inlayDiamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        const ix = rightX + 28;
        inlayDiamond.setAttribute("points", `${ix},${gy - 4} ${ix + 4},${gy} ${ix},${gy + 4} ${ix - 4},${gy}`);
        inlayDiamond.setAttribute("fill", isMicro ? "#d8b4fe" : palette.sadaf);
        svg.appendChild(inlayDiamond);
      }

      if (!isMicro || state.showMicroGuides) {
        const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lbl.setAttribute("x", String(leftX - 32));
        lbl.setAttribute("y", String(gy + 3.5));
        lbl.setAttribute("text-anchor", "middle");
        lbl.setAttribute("fill", isMicro ? "#d8b4fe" : "#fde68a");
        lbl.setAttribute("font-size", isMicro ? "9.5" : "10.5");
        lbl.setAttribute("font-weight", "600");
        lbl.textContent = isMicro ? `${q}q` : `S${q / 2}`;
        svg.appendChild(lbl);
      }
    }

    const courseSpacingX = (rightX - leftX) / 5;
    tuning.courses.forEach((cObj, cIdx) => {
      const posIndex = state.leftHanded ? cIdx : (5 - cIdx);
      const cx = leftX + posIndex * courseSpacingX;

      // Rótulo da Ordem posicionado acima do trilho de corda solta
      const cText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      cText.setAttribute("x", String(cx));
      cText.setAttribute("y", "22");
      cText.setAttribute("text-anchor", "middle");
      cText.setAttribute("fill", "#fef3c7");
      cText.setAttribute("font-size", "11");
      cText.setAttribute("font-weight", "700");
      cText.textContent = cObj.label.replace(" ", "");
      svg.appendChild(cText);

      if (isChordVoicingActive && chordVoicingMap && chordVoicingMap[cObj.course] === null) {
        const mText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        mText.setAttribute("x", String(cx));
        mText.setAttribute("y", String(openRailY + 5));
        mText.setAttribute("text-anchor", "middle");
        mText.setAttribute("fill", "#f87171");
        mText.setAttribute("font-size", "14");
        mText.setAttribute("font-weight", "800");
        mText.textContent = "✕";
        svg.appendChild(mText);
      }

      const isWoundBass = cIdx >= 3;
      [-1.5, 1.5].forEach((offsetX) => {
        // Corda no cravelhal (mais escura/tensa) até a pestana
        const pegString = document.createElementNS("http://www.w3.org/2000/svg", "line");
        pegString.setAttribute("x1", String(cx + offsetX));
        pegString.setAttribute("y1", "34");
        pegString.setAttribute("x2", String(cx + offsetX));
        pegString.setAttribute("y2", String(nutY));
        pegString.setAttribute("stroke", isWoundBass ? "#92400e" : "#94a3b8");
        pegString.setAttribute("stroke-width", "1.1");
        pegString.setAttribute("opacity", "0.55");
        svg.appendChild(pegString);

        // Corda vibrante da Pestana até o Cavalete
        const sLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        sLine.setAttribute("x1", String(cx + offsetX));
        sLine.setAttribute("y1", String(nutY));
        sLine.setAttribute("x2", String(cx + offsetX));
        sLine.setAttribute("y2", String(soundboardFarY));
        sLine.setAttribute("stroke", isWoundBass ? "#d97706" : "#e2e8f0");
        sLine.setAttribute("stroke-width", isWoundBass ? "1.6" : "1.1");
        sLine.setAttribute("opacity", isWoundBass ? "0.85" : "0.72");
        svg.appendChild(sLine);
      });

      for (let qFromNut = 0; qFromNut <= MAX_NECK_Q; qFromNut++) {
        const absQ = cObj.abs_q + qFromNut;
        const pitchClassQ = ((absQ % 24) + 24) % 24;
        const offsetFromRoot = ((pitchClassQ - effectiveRootQ) % 24 + 24) % 24;
        if (!activeOffsetMap.has(offsetFromRoot)) continue;

        const noteInfo = activeOffsetMap.get(offsetFromRoot);
        const pcData = PITCH_CLASSES_24[pitchClassQ];
        const shapeEval = evaluateShapeAndFinger(qFromNut, state.shapeMode, state.boxAnchorQ);

        let isSelectedActiveNote = shapeEval.inBox;
        if (isChordVoicingActive && chordVoicingMap) {
          isSelectedActiveNote = (chordVoicingMap[cObj.course] === qFromNut);
        }
        if (!isSelectedActiveNote && !state.showGhostNotes) continue;

        const noteFreq = cObj.freq_hz * Math.pow(2, (qFromNut * 50 + noteInfo.centsDev) / 1200);
        if (isChordVoicingActive && isSelectedActiveNote) {
          currentChordVoicingFreqs.push({ course: cObj.course, freq: noteFreq });
        }

        const ny = getPhysicalX(qFromNut, nutY, neckLengthPx, false);
        if (isSelectedActiveNote) {
          visibleActiveNodes.push({ x: cx, y: ny, absQ, modOffsetQ: offsetFromRoot });
        }

        const isRoot = offsetFromRoot === 0;
        const isGhammaz = activeStruct.ghammazOffsets.includes(offsetFromRoot);

        let displayText = pcData.flat;
        if (state.labelMode === "DEGREE") displayText = noteInfo.degree;
        else if (state.labelMode === "FINGER") displayText = String(shapeEval.finger);
        else if (state.labelMode === "ARABIC") displayText = pcData.arabic.slice(0, 5);

        appendNoteJewel(
          svg,
          cx,
          ny,
          qFromNut,
          absQ,
          pitchClassQ,
          cObj.course,
          shapeEval.finger,
          isRoot,
          isGhammaz,
          pcData.micro,
          isSelectedActiveNote,
          displayText,
          state.labelMode,
          noteFreq,
          palette,
          selectedPitch,
          onNeckJewelSelect
        );
      }
    });

    if (state.mode === "MAQAM" && state.showSayr) {
      const entity = /** @type {any} */ (activeStruct.entity);
      const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
      if (phrase) renderSayrMelodicPaths(svg, visibleActiveNodes, phrase.steps, highlightedSayrStep);
    }

    currentChordVoicingFreqs.sort((a, b) => b.course - a.course);
    return currentChordVoicingFreqs;
  }

  // =========================================================================
  // MODO HORIZONTAL (Cravelhal + Trilho 0q ANTES da Pestana -> Espelho -> Roseta)
  // =========================================================================
  const nutX = state.leftHanded ? 945 : 175;
  const neckEndX = state.leftHanded ? 155 : 965;
  const neckLengthPx = Math.abs(neckEndX - nutX);
  const topY = 54;
  const bottomY = 294;
  const centerY = (topY + bottomY) / 2;

  const bodyJointX = getPhysicalX(10, nutX, neckLengthPx, state.leftHanded);
  const soundboardFarX = state.leftHanded ? 15 : 1105;

  const dir = state.leftHanded ? -1 : 1;
  const curveCtrlX = bodyJointX + dir * 55;
  const sbPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  sbPath.setAttribute(
    "d",
    `M ${bodyJointX},${topY - 22} Q ${curveCtrlX},6 ${bodyJointX + dir * 160},6 L ${soundboardFarX},6 L ${soundboardFarX},340 L ${bodyJointX + dir * 160},340 Q ${curveCtrlX},340 ${bodyJointX},${bottomY + 22} Z`
  );
  sbPath.setAttribute("fill", "url(#soundboardGrad)");
  sbPath.setAttribute("stroke", palette.rosetteRing);
  sbPath.setAttribute("stroke-width", "3");
  svg.appendChild(sbPath);

  const sbInlay = document.createElementNS("http://www.w3.org/2000/svg", "path");
  sbInlay.setAttribute(
    "d",
    `M ${bodyJointX + dir * 5},${topY - 18} Q ${curveCtrlX + dir * 4},12 ${bodyJointX + dir * 160},12 L ${soundboardFarX - dir * 6},12 L ${soundboardFarX - dir * 6},334 L ${bodyJointX + dir * 160},334 Q ${curveCtrlX + dir * 4},334 ${bodyJointX + dir * 5},${bottomY + 18}`
  );
  sbInlay.setAttribute("fill", "none");
  sbInlay.setAttribute("stroke", palette.sadaf);
  sbInlay.setAttribute("stroke-width", "1.4");
  sbInlay.setAttribute("stroke-dasharray", "6,3");
  sbInlay.setAttribute("opacity", "0.75");
  svg.appendChild(sbInlay);

  const rosetteCenterX = state.leftHanded ? 75 : 1045;
  const raqmaStartX = neckEndX - dir * 18;
  const raqmaEndX = rosetteCenterX - dir * 48;

  const raqma = document.createElementNS("http://www.w3.org/2000/svg", "path");
  raqma.setAttribute(
    "d",
    `M ${raqmaStartX},${topY - 8} Q ${(raqmaStartX + raqmaEndX) / 2},${topY - 30} ${raqmaEndX},${centerY - 50} L ${raqmaEndX},${centerY + 50} Q ${(raqmaStartX + raqmaEndX) / 2},${bottomY + 30} ${raqmaStartX},${bottomY + 8} Z`
  );
  raqma.setAttribute("fill", palette.raqma);
  raqma.setAttribute("stroke", palette.rosetteRing);
  raqma.setAttribute("stroke-width", "1.2");
  raqma.setAttribute("opacity", "0.88");
  svg.appendChild(raqma);

  renderShamsiyyaRosette(svg, rosetteCenterX, centerY, 44, palette, onRosetteClick);
  renderShamsiyyaRosette(svg, rosetteCenterX - dir * 70, topY - 12, 16, palette, onRosetteClick);
  renderShamsiyyaRosette(svg, rosetteCenterX - dir * 70, bottomY + 12, 16, palette, onRosetteClick);

  const nutTopY = topY - 14;
  const nutBotY = bottomY + 14;
  const bodyTopY = topY - 24;
  const bodyBotY = bottomY + 24;

  // Cravelhal (Bajak) acomodando o Trilho de Cordas Soltas antes da Pestana
  const pegboxEndX = state.leftHanded ? 1105 : 15;
  const pegbox = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  pegbox.setAttribute("points", `${nutX},${nutTopY} ${pegboxEndX},${topY + 4} ${pegboxEndX},${bottomY - 4} ${nutX},${nutBotY}`);
  pegbox.setAttribute("fill", "#1a110b");
  pegbox.setAttribute("stroke", palette.rosetteRing);
  pegbox.setAttribute("stroke-width", "1.5");
  svg.appendChild(pegbox);

  // Faixa vertical do Trilho de Cordas Soltas (q = 0) posicionada ANTES da Pestana
  const openRailX = getPhysicalX(0, nutX, neckLengthPx, state.leftHanded);
  const openZoneRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  openZoneRect.setAttribute("x", String(openRailX - 17));
  openZoneRect.setAttribute("y", String(nutTopY + 2));
  openZoneRect.setAttribute("width", "34");
  openZoneRect.setAttribute("height", String(nutBotY - nutTopY - 4));
  openZoneRect.setAttribute("rx", "6");
  openZoneRect.setAttribute("fill", "rgba(254, 243, 199, 0.06)");
  openZoneRect.setAttribute("stroke", "rgba(254, 243, 199, 0.24)");
  openZoneRect.setAttribute("stroke-dasharray", "3,3");
  svg.appendChild(openZoneRect);

  const openLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
  openLbl.setAttribute("x", String(openRailX));
  openLbl.setAttribute("y", String(bodyBotY + 21));
  openLbl.setAttribute("text-anchor", "middle");
  openLbl.setAttribute("fill", "#fef3c7");
  openLbl.setAttribute("font-size", "9.5");
  openLbl.setAttribute("font-weight", "800");
  openLbl.textContent = isEn ? "OPEN (0)" : "SOLTA (0)";
  svg.appendChild(openLbl);

  const neckPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  neckPolygon.setAttribute("points", `${nutX},${nutTopY} ${neckEndX},${bodyTopY} ${neckEndX},${bodyBotY} ${nutX},${nutBotY}`);
  neckPolygon.setAttribute("fill", "url(#ebonyGrad)");
  neckPolygon.setAttribute("stroke", palette.rosetteRing);
  neckPolygon.setAttribute("stroke-width", "2");
  svg.appendChild(neckPolygon);

  [
    { y1: nutTopY + 3, y2: bodyTopY + 3 },
    { y1: nutBotY - 3, y2: bodyBotY - 3 }
  ].forEach(strip => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(nutX));
    line.setAttribute("y1", String(strip.y1));
    line.setAttribute("x2", String(neckEndX));
    line.setAttribute("y2", String(strip.y2));
    line.setAttribute("stroke", palette.inlayStripe);
    line.setAttribute("stroke-width", "2.2");
    line.setAttribute("stroke-dasharray", "8,4,2,4");
    line.setAttribute("opacity", "0.75");
    svg.appendChild(line);
  });

  if (state.shapeMode !== "FULL_NECK" || isChordVoicingActive) {
    const startQ = state.shapeMode === "CLOSED_BOX" ? state.boxAnchorQ : 0;
    const endQ = state.shapeMode === "CLOSED_BOX" ? Math.min(MAX_NECK_Q, state.boxAnchorQ + 7) : 8;
    const x1 = getPhysicalX(startQ, nutX, neckLengthPx, state.leftHanded);
    const x2 = getPhysicalX(endQ, nutX, neckLengthPx, state.leftHanded);
    const rectX = Math.min(x1, x2) - 16;
    const rectW = Math.abs(x2 - x1) + 32;

    const boxRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    boxRect.setAttribute("x", String(rectX));
    boxRect.setAttribute("y", String(bodyTopY + 5));
    boxRect.setAttribute("width", String(rectW));
    boxRect.setAttribute("height", String(bodyBotY - bodyTopY - 10));
    boxRect.setAttribute("rx", "8");
    boxRect.setAttribute("fill", "rgba(212, 175, 55, 0.08)");
    boxRect.setAttribute("stroke", palette.rosetteRing);
    boxRect.setAttribute("stroke-width", "1.6");
    boxRect.setAttribute("stroke-dasharray", "6,4");
    svg.appendChild(boxRect);
  }

  // Pestana de Osso (Anf) — 100% livre de notas por cima, separando nitidamente Soltas (0) e Braço (1q..16q)
  const nutLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  nutLine.setAttribute("x1", String(nutX));
  nutLine.setAttribute("y1", String(nutTopY - 2));
  nutLine.setAttribute("x2", String(nutX));
  nutLine.setAttribute("y2", String(nutBotY + 2));
  nutLine.setAttribute("stroke", "#fef3c7");
  nutLine.setAttribute("stroke-width", "9");
  svg.appendChild(nutLine);

  const nutInnerEdge = document.createElementNS("http://www.w3.org/2000/svg", "line");
  nutInnerEdge.setAttribute("x1", String(nutX + dir * 4.5));
  nutInnerEdge.setAttribute("y1", String(nutTopY - 2));
  nutInnerEdge.setAttribute("x2", String(nutX + dir * 4.5));
  nutInnerEdge.setAttribute("y2", String(nutBotY + 2));
  nutInnerEdge.setAttribute("stroke", "#78350f");
  nutInnerEdge.setAttribute("stroke-width", "1.6");
  svg.appendChild(nutInnerEdge);

  const nutTag = document.createElementNS("http://www.w3.org/2000/svg", "text");
  nutTag.setAttribute("x", String(nutX));
  nutTag.setAttribute("y", String(nutTopY - 8));
  nutTag.setAttribute("text-anchor", "middle");
  nutTag.setAttribute("fill", "#d4af37");
  nutTag.setAttribute("font-size", "9");
  nutTag.setAttribute("font-weight", "800");
  nutTag.textContent = isEn ? "NUT (ANF)" : "PESTANA (ANF)";
  svg.appendChild(nutTag);

  for (let q = 1; q <= MAX_NECK_Q; q++) {
    const isMicro = q % 2 !== 0;
    if (isMicro && !state.showMicroGuides) continue;
    if (!isMicro && !state.showSemiGuides) continue;

    const gx = getPhysicalX(q, nutX, neckLengthPx, state.leftHanded);
    const gLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    gLine.setAttribute("x1", String(gx));
    gLine.setAttribute("y1", String(nutTopY + 6));
    gLine.setAttribute("x2", String(gx));
    gLine.setAttribute("y2", String(nutBotY - 6));
    gLine.setAttribute("stroke", isMicro ? "rgba(192, 132, 252, 0.22)" : "rgba(212, 175, 55, 0.24)");
    gLine.setAttribute("stroke-width", isMicro ? "1" : "1.4");
    if (isMicro) gLine.setAttribute("stroke-dasharray", "3,4");
    svg.appendChild(gLine);

    if (keySemitones.includes(q)) {
      const inlayDiamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      const iy = bodyTopY - 6;
      inlayDiamond.setAttribute("points", `${gx},${iy - 4} ${gx + 4},${iy} ${gx},${iy + 4} ${gx - 4},${iy}`);
      inlayDiamond.setAttribute("fill", isMicro ? "#d8b4fe" : palette.sadaf);
      svg.appendChild(inlayDiamond);
    }

    if (!isMicro || state.showMicroGuides) {
      const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      lbl.setAttribute("x", String(gx));
      lbl.setAttribute("y", String(bodyBotY + 21));
      lbl.setAttribute("text-anchor", "middle");
      lbl.setAttribute("fill", isMicro ? "#d8b4fe" : "#fde68a");
      lbl.setAttribute("font-size", isMicro ? "9.5" : "10.5");
      lbl.setAttribute("font-weight", "600");
      lbl.textContent = isMicro ? `${q}q` : `S${q / 2}`;
      svg.appendChild(lbl);
    }
  }

  const courseSpacing = (bottomY - topY) / 5;
  tuning.courses.forEach((cObj, cIdx) => {
    const cy = topY + cIdx * courseSpacing;
    // Rótulo da Ordem posicionado na extremidade do cravelhal, antes do trilho de corda solta
    const courseLabelX = state.leftHanded ? nutX + 92 : nutX - 92;

    const cText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    cText.setAttribute("x", String(courseLabelX));
    cText.setAttribute("y", String(cy + 4));
    cText.setAttribute("text-anchor", "middle");
    cText.setAttribute("fill", "#fef3c7");
    cText.setAttribute("font-size", "11.5");
    cText.setAttribute("font-weight", "700");
    cText.textContent = cObj.label;
    svg.appendChild(cText);

    if (isChordVoicingActive && chordVoicingMap && chordVoicingMap[cObj.course] === null) {
      const mText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      mText.setAttribute("x", String(openRailX));
      mText.setAttribute("y", String(cy + 5));
      mText.setAttribute("text-anchor", "middle");
      mText.setAttribute("fill", "#f87171");
      mText.setAttribute("font-size", "14");
      mText.setAttribute("font-weight", "800");
      mText.textContent = "✕";
      svg.appendChild(mText);
    }

    const isWoundBass = cIdx >= 3;
    [-1.6, 1.6].forEach((offsetY) => {
      // Trecho da corda no cravelhal (antes da pestana)
      const pegString = document.createElementNS("http://www.w3.org/2000/svg", "line");
      pegString.setAttribute("x1", String(openRailX - dir * 18));
      pegString.setAttribute("y1", String(cy + offsetY));
      pegString.setAttribute("x2", String(nutX));
      pegString.setAttribute("y2", String(cy + offsetY));
      pegString.setAttribute("stroke", isWoundBass ? "#92400e" : "#94a3b8");
      pegString.setAttribute("stroke-width", "1.1");
      pegString.setAttribute("opacity", "0.55");
      svg.appendChild(pegString);

      // Corda vibrante da Pestana até o Cavalete
      const sLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
      sLine.setAttribute("x1", String(nutX));
      sLine.setAttribute("y1", String(cy + offsetY));
      sLine.setAttribute("x2", String(soundboardFarX));
      sLine.setAttribute("y2", String(cy + offsetY));
      sLine.setAttribute("stroke", isWoundBass ? "#d97706" : "#e2e8f0");
      sLine.setAttribute("stroke-width", isWoundBass ? "1.6" : "1.1");
      sLine.setAttribute("opacity", isWoundBass ? "0.85" : "0.72");
      svg.appendChild(sLine);
    });

    for (let qFromNut = 0; qFromNut <= MAX_NECK_Q; qFromNut++) {
      const absQ = cObj.abs_q + qFromNut;
      const pitchClassQ = ((absQ % 24) + 24) % 24;
      const offsetFromRoot = ((pitchClassQ - effectiveRootQ) % 24 + 24) % 24;
      if (!activeOffsetMap.has(offsetFromRoot)) continue;

      const noteInfo = activeOffsetMap.get(offsetFromRoot);
      const pcData = PITCH_CLASSES_24[pitchClassQ];
      const shapeEval = evaluateShapeAndFinger(qFromNut, state.shapeMode, state.boxAnchorQ);

      let isSelectedActiveNote = shapeEval.inBox;
      if (isChordVoicingActive && chordVoicingMap) {
        isSelectedActiveNote = (chordVoicingMap[cObj.course] === qFromNut);
      }
      if (!isSelectedActiveNote && !state.showGhostNotes) continue;

      const noteFreq = cObj.freq_hz * Math.pow(2, (qFromNut * 50 + noteInfo.centsDev) / 1200);
      if (isChordVoicingActive && isSelectedActiveNote) {
        currentChordVoicingFreqs.push({ course: cObj.course, freq: noteFreq });
      }

      const nx = getPhysicalX(qFromNut, nutX, neckLengthPx, state.leftHanded);
      if (isSelectedActiveNote) {
        visibleActiveNodes.push({ x: nx, y: cy, absQ, modOffsetQ: offsetFromRoot });
      }

      const isRoot = offsetFromRoot === 0;
      const isGhammaz = activeStruct.ghammazOffsets.includes(offsetFromRoot);

      let displayText = pcData.flat;
      if (state.labelMode === "DEGREE") displayText = noteInfo.degree;
      else if (state.labelMode === "FINGER") displayText = String(shapeEval.finger);
      else if (state.labelMode === "ARABIC") displayText = pcData.arabic.slice(0, 5);

      appendNoteJewel(
        svg,
        nx,
        cy,
        qFromNut,
        absQ,
        pitchClassQ,
        cObj.course,
        shapeEval.finger,
        isRoot,
        isGhammaz,
        pcData.micro,
        isSelectedActiveNote,
        displayText,
        state.labelMode,
        noteFreq,
        palette,
        selectedPitch,
        onNeckJewelSelect
      );
    }
  });

  if (state.mode === "MAQAM" && state.showSayr) {
    const entity = /** @type {any} */ (activeStruct.entity);
    const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
    if (phrase) renderSayrMelodicPaths(svg, visibleActiveNodes, phrase.steps, highlightedSayrStep);
  }

  currentChordVoicingFreqs.sort((a, b) => b.course - a.course);
  return currentChordVoicingFreqs;
}
