// @ts-check
import { DB, PITCH_CLASSES_24, TRADITION_PALETTES } from "../core/database.js";
import {
  MAX_NECK_Q,
  getPhysicalX,
  getPositionBounds,
  getActiveStructure,
  evaluateShapeAndFinger,
  evaluateShiftPivot,
  selectBestChordVoicingPerCourse
} from "../core/modalEngine.js";
import { playPluckedNote } from "../audio/synthEngine.js";

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
 * Desenha uma cápsula opaca com borda e texto centralizado para leitura nítida em qualquer fundo.
 */
function appendPillLabel(parent, cx, cy, text, strokeColor, textColor, bgColor, fontSize = 10, padX = 8, height = 19) {
  const approxWidth = Math.max(36, text.length * (fontSize * 0.62) + padX * 2);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", String(cx - approxWidth / 2));
  rect.setAttribute("y", String(cy - height / 2));
  rect.setAttribute("width", String(approxWidth));
  rect.setAttribute("height", String(height));
  rect.setAttribute("rx", String(height / 2));
  rect.setAttribute("fill", bgColor);
  rect.setAttribute("stroke", strokeColor);
  rect.setAttribute("stroke-width", "1.4");
  parent.appendChild(rect);

  const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
  lbl.setAttribute("x", String(cx));
  lbl.setAttribute("y", String(cy + fontSize * 0.35));
  lbl.setAttribute("text-anchor", "middle");
  lbl.setAttribute("fill", textColor);
  lbl.setAttribute("font-size", String(fontSize));
  lbl.setAttribute("font-weight", "800");
  lbl.textContent = text;
  parent.appendChild(lbl);
}

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
 * Desenha os Colchetes de Região Anatômica (I · 1ª Pos, II · 2ª Pos, III · Tampo),
 * a linha divisória da Junta do Corpo (10q) e o indicador do Polegar (Ibham) com cápsulas legíveis.
 */
function renderPositionRegionsOverlay(svg, state, nutCoord, neckLengthPx, edgeStart, edgeEnd, isVert, isLight) {
  if (!state.showPositionsMap) return;

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "region-overlay");
  g.setAttribute("pointer-events", "none");

  const isEn = state.lang === "en";
  const posBounds = getPositionBounds(state.shapeMode, state.boxAnchorQ);
  const pillBg = isLight ? "#fffdf8" : "#140c08";

  const regions = [
    {
      id: "OPEN_FIRST_POS",
      q1: 1,
      q2: 7,
      color: isLight ? "#0e7490" : "#67e8f9",
      labelHoriz: isEn ? "I · 1st Pos (Nut)" : "I · 1ª Pos (Pestana)",
      labelVert: isEn ? "I · 1st Pos" : "I · 1ª Pos"
    },
    {
      id: "POS_SECOND",
      q1: 4,
      q2: 10,
      color: isLight ? "#9a6515" : "#fbbf24",
      labelHoriz: isEn ? "II · 2nd Pos (Mid)" : "II · 2ª Pos (Média)",
      labelVert: isEn ? "II · 2nd Pos" : "II · 2ª Pos"
    },
    {
      id: "POS_THIRD_BODY",
      q1: 9,
      q2: 16,
      color: isLight ? "#7e22ce" : "#e879f9",
      labelHoriz: isEn ? "III · 3rd Pos (Body)" : "III · 3ª Pos (Tampo)",
      labelVert: isEn ? "III · Body" : "III · Tampo"
    }
  ];

  // Linha divisória da Junta do Corpo (10q)
  const jointCoord = getPhysicalX(10, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
  const jointLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  if (isVert) {
    jointLine.setAttribute("x1", String(edgeStart - 16));
    jointLine.setAttribute("y1", String(jointCoord));
    jointLine.setAttribute("x2", String(edgeEnd + 22));
    jointLine.setAttribute("y2", String(jointCoord));
  } else {
    jointLine.setAttribute("x1", String(jointCoord));
    jointLine.setAttribute("y1", String(edgeStart - 18));
    jointLine.setAttribute("x2", String(jointCoord));
    jointLine.setAttribute("y2", String(edgeEnd + 16));
  }
  jointLine.setAttribute("stroke", isLight ? "#b45309" : "#f59e0b");
  jointLine.setAttribute("stroke-width", "1.8");
  jointLine.setAttribute("stroke-dasharray", "5,3");
  jointLine.setAttribute("opacity", "0.85");
  g.appendChild(jointLine);

  // Desenha os colchetes e cápsulas em faixas dedicadas sem colisão
  regions.forEach((reg, idx) => {
    const isFocusedRegion = state.shapeMode === reg.id;
    const c1 = getPhysicalX(reg.q1, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const c2 = getPhysicalX(reg.q2, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    const midC = (minC + maxC) / 2;

    if (isVert) {
      // Trilhas verticais na margem direita com cápsulas HORIZONTAIS (leitura direta sem girar o celular)
      const railX = idx === 1 ? edgeEnd + 46 : edgeEnd + 34;
      const bracket = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bracket.setAttribute(
        "d",
        `M ${railX - 6},${minC} L ${railX},${minC} L ${railX},${maxC} L ${railX - 6},${maxC}`
      );
      bracket.setAttribute("fill", "none");
      bracket.setAttribute("stroke", reg.color);
      bracket.setAttribute("stroke-width", isFocusedRegion ? "2.6" : "1.6");
      bracket.setAttribute("opacity", isFocusedRegion ? "1" : "0.78");
      g.appendChild(bracket);

      // Posições Y livres de cruzamento para cada cápsula
      const pillY = idx === 0
        ? minC + (maxC - minC) * 0.28
        : (idx === 1 ? minC + (maxC - minC) * 0.66 : midC);
      const pillCenterX = edgeEnd + 92;

      const connector = document.createElementNS("http://www.w3.org/2000/svg", "line");
      connector.setAttribute("x1", String(railX));
      connector.setAttribute("y1", String(pillY));
      connector.setAttribute("x2", String(pillCenterX - 38));
      connector.setAttribute("y2", String(pillY));
      connector.setAttribute("stroke", reg.color);
      connector.setAttribute("stroke-width", "1.4");
      connector.setAttribute("opacity", "0.85");
      g.appendChild(connector);

      appendPillLabel(
        g,
        pillCenterX,
        pillY,
        reg.labelVert,
        reg.color,
        reg.color,
        pillBg,
        isFocusedRegion ? 10.5 : 9.8,
        8,
        21
      );
    } else {
      // Modo Horizontal: duas faixas limpas acima do instrumento (Track 1: I & III em y=20; Track 2: II em y=48)
      const railY = idx === 1 ? 52 : 24;
      const bracket = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bracket.setAttribute(
        "d",
        `M ${minC},${railY + 7} L ${minC},${railY} L ${maxC},${railY} L ${maxC},${railY + 7}`
      );
      bracket.setAttribute("fill", "none");
      bracket.setAttribute("stroke", reg.color);
      bracket.setAttribute("stroke-width", isFocusedRegion ? "2.5" : "1.6");
      bracket.setAttribute("opacity", isFocusedRegion ? "1" : "0.82");
      g.appendChild(bracket);

      appendPillLabel(
        g,
        midC,
        railY,
        reg.labelHoriz,
        reg.color,
        reg.color,
        pillBg,
        isFocusedRegion ? 10.5 : 9.8,
        9,
        20
      );
    }
  });

  // Indicador de Apoio do Polegar Esquerdo (Ibham) quando uma posição específica está selecionada
  if (state.shapeMode !== "FULL_NECK") {
    const thumbCoord = getPhysicalX(posBounds.thumbQ, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const thumbColor = isLight ? "#0e7490" : "#67e8f9";
    const thumbText = isEn ? `▲ Thumb (${posBounds.thumbQ}q)` : `▲ Polegar (${posBounds.thumbQ}q)`;

    if (isVert) {
      // Ponteiro triangular na borda esquerda do braço + cápsula de legenda limpa acima das regiões
      const tx = edgeStart - 22;
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("points", `${tx - 5},${thumbCoord - 5.5} ${tx + 5},${thumbCoord} ${tx - 5},${thumbCoord + 5.5}`);
      poly.setAttribute("fill", thumbColor);
      g.appendChild(poly);

      appendPillLabel(
        g,
        edgeEnd + 92,
        166,
        isEn ? `▶ Thumb ${posBounds.thumbQ}q` : `▶ Polegar ${posBounds.thumbQ}q`,
        thumbColor,
        thumbColor,
        pillBg,
        9.6,
        7,
        20
      );
    } else {
      appendPillLabel(
        g,
        thumbCoord,
        edgeEnd + 54,
        thumbText,
        thumbColor,
        thumbColor,
        pillBg,
        10,
        9,
        20
      );
    }
  }

  svg.appendChild(g);
}

function renderConnectedVectorTrail(svg, orderedPoints, highlightedStepIdx, baseColor = "#fde047") {
  if (orderedPoints.length < 2) return;

  const trailGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  trailGroup.setAttribute("pointer-events", "none");

  for (let i = 0; i < orderedPoints.length - 1; i++) {
    const p1 = orderedPoints[i];
    const p2 = orderedPoints[i + 1];
    if (p1.x === p2.x && p1.y === p2.y) continue;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const normOffset = (i % 2 === 0 ? -1 : 1) * 14;
    const dist = Math.hypot(dx, dy) || 1;
    const ctrlX = midX - (dy / dist) * normOffset;
    const ctrlY = midY + (dx / dist) * normOffset;

    const isCurrentSegment = highlightedStepIdx === i || highlightedStepIdx === i + 1;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} Q ${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", isCurrentSegment ? "#67e8f9" : baseColor);
    path.setAttribute("stroke-width", isCurrentSegment ? "3.2" : "2.2");
    path.setAttribute("stroke-opacity", isCurrentSegment ? "0.96" : "0.82");
    path.setAttribute("marker-end", isCurrentSegment ? "url(#sayrArrowActive)" : "url(#sayrArrow)");
    trailGroup.appendChild(path);
  }

  orderedPoints.forEach((pt, idx) => {
    const isHighlighted = highlightedStepIdx === pt.stepIdx;
    const badgeX = pt.x + 12;
    const badgeY = pt.y - 12;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(badgeX));
    circle.setAttribute("cy", String(badgeY));
    circle.setAttribute("r", isHighlighted ? "9.5" : "7.5");
    circle.setAttribute("fill", isHighlighted ? "#06b6d4" : "#140c08");
    circle.setAttribute("stroke", isHighlighted ? "#ffffff" : baseColor);
    circle.setAttribute("stroke-width", "1.4");
    trailGroup.appendChild(circle);

    const num = document.createElementNS("http://www.w3.org/2000/svg", "text");
    num.setAttribute("x", String(badgeX));
    num.setAttribute("y", String(badgeY + 2.8));
    num.setAttribute("text-anchor", "middle");
    num.setAttribute("fill", isHighlighted ? "#ffffff" : baseColor);
    num.setAttribute("font-size", "8.2");
    num.setAttribute("font-weight", "800");
    num.textContent = String(idx + 1);
    trailGroup.appendChild(num);
  });

  svg.appendChild(trailGroup);
}

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

  renderConnectedVectorTrail(svg, resolvedPathNodes, highlightedStepIdx, "#fde047");
}

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
  isPlaybackStepHit,
  pivotInfo,
  showPositionsMap,
  isLight,
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

  const isExactStaffMatch = (selectedPitch !== null && selectedPitch.absQ === absQ) || isPlaybackStepHit;
  const isOctaveStaffMatch = selectedPitch !== null && !isExactStaffMatch && selectedPitch.pitchClassQ === pitchClassQ;

  let nodeOpacity = isSelectedActiveNote ? "1.0" : "0.18";
  if (selectedPitch !== null && isSelectedActiveNote) {
    nodeOpacity = (isExactStaffMatch || isOctaveStaffMatch) ? "1.0" : "0.35";
  }

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("class", "note-node");
  group.setAttribute("opacity", nodeOpacity);

  group.addEventListener("click", (ev) => {
    playPluckedNote(noteFreq, 1.35);
    if (onNeckJewelSelect) {
      onNeckJewelSelect({
        absQ,
        pitchClassQ,
        qFromNut,
        course: courseNumber,
        finger: fingerLabel,
        freq: noteFreq,
        makeRoot: Boolean(ev.shiftKey)
      });
    }
  });

  group.addEventListener("dblclick", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    playPluckedNote(noteFreq, 1.5);
    if (onNeckJewelSelect) {
      onNeckJewelSelect({
        absQ,
        pitchClassQ,
        qFromNut,
        course: courseNumber,
        finger: fingerLabel,
        freq: noteFreq,
        makeRoot: true
      });
    }
  });

  // Halo da Nota-Pivô / Uníssono de Ordem (atrás da joia)
  if (showPositionsMap && isSelectedActiveNote && pivotInfo && pivotInfo.isPivot) {
    const isUnisonBridge = pivotInfo.type === "UNISON_BRIDGE";
    const pivotRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    pivotRing.setAttribute("cx", String(nx));
    pivotRing.setAttribute("cy", String(ny));
    pivotRing.setAttribute("r", "16.2");
    pivotRing.setAttribute("fill", isUnisonBridge ? "rgba(103, 232, 249, 0.14)" : "rgba(251, 191, 36, 0.14)");
    pivotRing.setAttribute("stroke", isUnisonBridge ? "#67e8f9" : "#fbbf24");
    pivotRing.setAttribute("stroke-width", "1.6");
    pivotRing.setAttribute("stroke-dasharray", isUnisonBridge ? "4,2" : "2,2");
    group.appendChild(pivotRing);
  }

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

  // Microcápsula legível do Pivô/Uníssono no canto superior esquerdo (oposto ao número do Sayr)
  if (showPositionsMap && isSelectedActiveNote && pivotInfo && pivotInfo.isPivot) {
    const isUnisonBridge = pivotInfo.type === "UNISON_BRIDGE";
    const bx = nx - 14;
    const by = ny - 13;
    const bw = Math.max(22, pivotInfo.badge.length * 6.2 + 6);
    const bh = 13;

    const pillBg = isLight
      ? (isUnisonBridge ? "#ecfeff" : "#fffbeb")
      : (isUnisonBridge ? "#082f49" : "#271806");
    const pillStroke = isLight
      ? (isUnisonBridge ? "#0e7490" : "#b45309")
      : (isUnisonBridge ? "#67e8f9" : "#fbbf24");

    const pRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    pRect.setAttribute("x", String(bx - bw / 2));
    pRect.setAttribute("y", String(by - bh / 2));
    pRect.setAttribute("width", String(bw));
    pRect.setAttribute("height", String(bh));
    pRect.setAttribute("rx", "4");
    pRect.setAttribute("fill", pillBg);
    pRect.setAttribute("stroke", pillStroke);
    pRect.setAttribute("stroke-width", "1.1");
    pRect.setAttribute("pointer-events", "none");
    group.appendChild(pRect);

    const pTag = document.createElementNS("http://www.w3.org/2000/svg", "text");
    pTag.setAttribute("x", String(bx));
    pTag.setAttribute("y", String(by + 3));
    pTag.setAttribute("text-anchor", "middle");
    pTag.setAttribute("fill", pillStroke);
    pTag.setAttribute("font-size", "8.2");
    pTag.setAttribute("font-weight", "800");
    pTag.setAttribute("pointer-events", "none");
    pTag.textContent = pivotInfo.badge;
    group.appendChild(pTag);
  }

  svg.appendChild(group);
}

/**
 * @param {import("../core/urlState.js").OudAppState} state
 * @param {() => void} onRosetteClick
 * @param {number} [highlightedStep=-1]
 * @param {{ absQ: number | null, pitchClassQ: number | null } | null} [selectedPitch=null]
 * @param {(noteInfo: { absQ: number, pitchClassQ: number, qFromNut: number, course: number, finger: string | number, freq: number, makeRoot?: boolean }) => void} [onNeckJewelSelect]
 * @param {ReturnType<import("../core/modalEngine.js").computeAnchoredOctavePath>} [octavePathNodes=[]]
 * @returns {{ course: number, freq: number }[]}
 */
export function renderOudNeckSVG(state, onRosetteClick, highlightedStep = -1, selectedPitch = null, onNeckJewelSelect, octavePathNodes = []) {
  const svg = /** @type {SVGElement} */ (/** @type {unknown} */ (document.getElementById("oud-neck")));
  svg.innerHTML = "";
  /** @type {{ course: number, freq: number }[]} */
  const currentChordVoicingFreqs = [];
  /** @type {{ x: number, y: number, absQ: number, modOffsetQ: number }[]} */
  const visibleActiveNodes = [];

  const isVert = state.orientation === "VERTICAL";
  const isEn = state.lang === "en";
  const isLight = state.theme === "light";

  const extColors = {
    courseLabel: isLight ? "#2c1d11" : "#fef3c7",
    semiLabel: isLight ? "#78350f" : "#fde68a",
    microLabel: isLight ? "#6b21a8" : "#d8b4fe",
    nutTag: isLight ? "#9a6515" : "#d4af37",
    inlayFixed: isLight ? "#0e7490" : undefined,
    inlayMicro: isLight ? "#7e22ce" : "#d8b4fe"
  };

  // ViewBoxes ampliados e simétricos para abrigar as faixas de Posições sem desalinhar o instrumento
  svg.setAttribute("viewBox", isVert ? "0 0 460 1085" : "0 0 1120 430");

  const palette = TRADITION_PALETTES[/** @type {"damascus"|"cairo"|"istanbul"} */ (state.tradition)] || TRADITION_PALETTES.damascus;
  const tuning = DB.tunings.find(t => t.id === state.tuningId) || DB.tunings[0];
  const activeStruct = getActiveStructure(state);
  const effectiveRootQ = activeStruct.effectiveRootQ;

  const isOctaveFilterActive = state.octavePathOnly && state.anchorAbsQ !== null && octavePathNodes.length > 0;
  const octaveNodeMap = new Map();
  if (isOctaveFilterActive) {
    octavePathNodes.forEach(n => {
      octaveNodeMap.set(`${n.course}:${n.qFromNut}`, n);
    });
  }

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
  const isChordVoicingActive = isChordLikeMode && state.chordVoicingOnly && !isOctaveFilterActive;
  const chordVoicingMap = isChordVoicingActive
    ? selectBestChordVoicingPerCourse(tuning, activeOffsetMap, effectiveRootQ, state.shapeMode, state.boxAnchorQ)
    : null;

  const keySemitones = [2, 4, 5, 7, 9, 10, 12, 14];
  const posBounds = getPositionBounds(state.shapeMode, state.boxAnchorQ);

  // =========================================================================
  // MODO VERTICAL (460 x 1085) — Com margem direita limpa para cápsulas horizontais
  // =========================================================================
  if (isVert) {
    const nutY = 148;
    const neckEndY = 905;
    const neckLengthPx = neckEndY - nutY;
    const leftX = 82;
    const rightX = 302;
    const centerX = (leftX + rightX) / 2;

    const bodyJointY = getPhysicalX(10, nutY, neckLengthPx, false);
    const soundboardFarY = 1070;

    const sbPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    sbPath.setAttribute(
      "d",
      `M ${leftX - 20},${bodyJointY} Q 12,${bodyJointY + 50} 12,${bodyJointY + 145} L 12,${soundboardFarY} L 446,${soundboardFarY} L 446,${bodyJointY + 145} Q 446,${bodyJointY + 50} ${rightX + 20},${bodyJointY} Z`
    );
    sbPath.setAttribute("fill", "url(#soundboardGrad)");
    sbPath.setAttribute("stroke", palette.rosetteRing);
    sbPath.setAttribute("stroke-width", "3");
    svg.appendChild(sbPath);

    const rosetteCenterY = 998;
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
    renderShamsiyyaRosette(svg, leftX - 24, rosetteCenterY - 62, 14, palette, onRosetteClick);
    renderShamsiyyaRosette(svg, rightX + 24, rosetteCenterY - 62, 14, palette, onRosetteClick);

    const pegbox = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    pegbox.setAttribute("points", `${leftX - 14},${nutY} ${leftX + 4},34 ${rightX - 4},34 ${rightX + 14},${nutY}`);
    pegbox.setAttribute("fill", "#1a110b");
    pegbox.setAttribute("stroke", palette.rosetteRing);
    pegbox.setAttribute("stroke-width", "1.5");
    svg.appendChild(pegbox);

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
    openLbl.setAttribute("x", String(leftX - 44));
    openLbl.setAttribute("y", String(openRailY + 3.5));
    openLbl.setAttribute("text-anchor", "middle");
    openLbl.setAttribute("fill", extColors.courseLabel);
    openLbl.setAttribute("font-size", "9.5");
    openLbl.setAttribute("font-weight", "800");
    openLbl.textContent = isEn ? "OPEN" : "SOLTA";
    svg.appendChild(openLbl);

    const neckPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    neckPolygon.setAttribute("points", `${leftX - 14},${nutY} ${rightX + 14},${nutY} ${rightX + 20},${neckEndY} ${leftX - 20},${neckEndY}`);
    neckPolygon.setAttribute("fill", "url(#ebonyGrad)");
    neckPolygon.setAttribute("stroke", palette.rosetteRing);
    neckPolygon.setAttribute("stroke-width", "2");
    svg.appendChild(neckPolygon);

    [
      { x1: leftX - 11, x2: leftX - 17 },
      { x1: rightX + 11, x2: rightX + 17 }
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

    if (state.shapeMode !== "FULL_NECK" || isChordVoicingActive) {
      const y1 = getPhysicalX(posBounds.startQ, nutY, neckLengthPx, false);
      const y2 = getPhysicalX(posBounds.endQ, nutY, neckLengthPx, false);

      const boxRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      boxRect.setAttribute("x", String(leftX - 15));
      boxRect.setAttribute("y", String(y1 - 16));
      boxRect.setAttribute("width", String((rightX - leftX) + 30));
      boxRect.setAttribute("height", String((y2 - y1) + 32));
      boxRect.setAttribute("rx", "8");
      boxRect.setAttribute("fill", "rgba(212, 175, 55, 0.11)");
      boxRect.setAttribute("stroke", palette.rosetteRing);
      boxRect.setAttribute("stroke-width", "1.8");
      boxRect.setAttribute("stroke-dasharray", "6,4");
      svg.appendChild(boxRect);
    }

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
    nutTag.setAttribute("x", String(leftX - 44));
    nutTag.setAttribute("y", String(nutY + 3.5));
    nutTag.setAttribute("text-anchor", "middle");
    nutTag.setAttribute("fill", extColors.nutTag);
    nutTag.setAttribute("font-size", "9");
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
        const ix = rightX + 23;
        inlayDiamond.setAttribute("points", `${ix},${gy - 4} ${ix + 4},${gy} ${ix},${gy + 4} ${ix - 4},${gy}`);
        inlayDiamond.setAttribute("fill", isMicro ? extColors.inlayMicro : (extColors.inlayFixed || palette.sadaf));
        svg.appendChild(inlayDiamond);
      }

      if (!isMicro || state.showMicroGuides) {
        const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lbl.setAttribute("x", String(leftX - 44));
        lbl.setAttribute("y", String(gy + 3.5));
        lbl.setAttribute("text-anchor", "middle");
        lbl.setAttribute("fill", isMicro ? extColors.microLabel : extColors.semiLabel);
        lbl.setAttribute("font-size", isMicro ? "9.5" : "10.5");
        lbl.setAttribute("font-weight", "700");
        lbl.textContent = isMicro ? `${q}q` : `S${q / 2}`;
        svg.appendChild(lbl);
      }
    }

    renderPositionRegionsOverlay(svg, state, nutY, neckLengthPx, leftX, rightX, true, isLight);

    const courseSpacingX = (rightX - leftX) / 5;
    /** @type {Map<string, { x: number, y: number }>} */
    const coordLookup = new Map();

    tuning.courses.forEach((cObj, cIdx) => {
      const posIndex = state.leftHanded ? cIdx : (5 - cIdx);
      const cx = leftX + posIndex * courseSpacingX;

      const cText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      cText.setAttribute("x", String(cx));
      cText.setAttribute("y", "22");
      cText.setAttribute("text-anchor", "middle");
      cText.setAttribute("fill", extColors.courseLabel);
      cText.setAttribute("font-size", "11");
      cText.setAttribute("font-weight", "800");
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
        const pegString = document.createElementNS("http://www.w3.org/2000/svg", "line");
        pegString.setAttribute("x1", String(cx + offsetX));
        pegString.setAttribute("y1", "34");
        pegString.setAttribute("x2", String(cx + offsetX));
        pegString.setAttribute("y2", String(nutY));
        pegString.setAttribute("stroke", isWoundBass ? "#92400e" : "#94a3b8");
        pegString.setAttribute("stroke-width", "1.1");
        pegString.setAttribute("opacity", "0.55");
        svg.appendChild(pegString);

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
        const pivotInfo = evaluateShiftPivot(qFromNut, cIdx, tuning);

        const octMatch = octaveNodeMap.get(`${cObj.course}:${qFromNut}`);
        let isSelectedActiveNote = shapeEval.inBox;
        if (isOctaveFilterActive) {
          isSelectedActiveNote = Boolean(octMatch);
        } else if (isChordVoicingActive && chordVoicingMap) {
          isSelectedActiveNote = (chordVoicingMap[cObj.course] === qFromNut);
        }
        if (!isSelectedActiveNote && !state.showGhostNotes) continue;

        const noteFreq = cObj.freq_hz * Math.pow(2, (qFromNut * 50 + noteInfo.centsDev) / 1200);
        if (isChordVoicingActive && isSelectedActiveNote) {
          currentChordVoicingFreqs.push({ course: cObj.course, freq: noteFreq });
        }

        const ny = getPhysicalX(qFromNut, nutY, neckLengthPx, false);
        coordLookup.set(`${cObj.course}:${qFromNut}`, { x: cx, y: ny });

        if (isSelectedActiveNote) {
          visibleActiveNodes.push({ x: cx, y: ny, absQ, modOffsetQ: offsetFromRoot });
        }

        const isRoot = offsetFromRoot === 0;
        const isGhammaz = activeStruct.ghammazOffsets.includes(offsetFromRoot);
        const isPlaybackStepHit = isOctaveFilterActive && octMatch && highlightedStep === octMatch.stepIndex;

        let displayText = pcData.flat;
        if (state.labelMode === "DEGREE") displayText = octMatch ? octMatch.degree : noteInfo.degree;
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
          Boolean(isPlaybackStepHit),
          pivotInfo,
          state.showPositionsMap,
          isLight,
          displayText,
          state.labelMode,
          noteFreq,
          palette,
          selectedPitch,
          onNeckJewelSelect
        );
      }
    });

    if (isOctaveFilterActive) {
      const octPoints = octavePathNodes
        .map(n => {
          const pt = coordLookup.get(`${n.course}:${n.qFromNut}`);
          return pt ? { x: pt.x, y: pt.y, stepIdx: n.stepIndex } : null;
        })
        .filter(Boolean);
      renderConnectedVectorTrail(svg, /** @type {any} */ (octPoints), highlightedStep, "#67e8f9");
    } else if (state.mode === "MAQAM" && state.showSayr) {
      const entity = /** @type {any} */ (activeStruct.entity);
      const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
      if (phrase) renderSayrMelodicPaths(svg, visibleActiveNodes, phrase.steps, highlightedStep);
    }

    currentChordVoicingFreqs.sort((a, b) => b.course - a.course);
    return currentChordVoicingFreqs;
  }

  // =========================================================================
  // MODO HORIZONTAL (1120 x 430) — Centralizado com faixas dedicadas no topo e base
  // =========================================================================
  const nutX = state.leftHanded ? 945 : 175;
  const neckEndX = state.leftHanded ? 155 : 965;
  const neckLengthPx = Math.abs(neckEndX - nutX);
  const topY = 106;
  const bottomY = 334;
  const centerY = (topY + bottomY) / 2; // 220 (centro exato dentro de 430)

  const bodyJointX = getPhysicalX(10, nutX, neckLengthPx, state.leftHanded);
  const soundboardFarX = state.leftHanded ? 15 : 1105;

  const dir = state.leftHanded ? -1 : 1;
  const curveCtrlX = bodyJointX + dir * 55;
  const sbTopY = 70;
  const sbBotY = 370;

  const sbPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  sbPath.setAttribute(
    "d",
    `M ${bodyJointX},${topY - 22} Q ${curveCtrlX},${sbTopY} ${bodyJointX + dir * 160},${sbTopY} L ${soundboardFarX},${sbTopY} L ${soundboardFarX},${sbBotY} L ${bodyJointX + dir * 160},${sbBotY} Q ${curveCtrlX},${sbBotY} ${bodyJointX},${bottomY + 22} Z`
  );
  sbPath.setAttribute("fill", "url(#soundboardGrad)");
  sbPath.setAttribute("stroke", palette.rosetteRing);
  sbPath.setAttribute("stroke-width", "3");
  svg.appendChild(sbPath);

  const sbInlay = document.createElementNS("http://www.w3.org/2000/svg", "path");
  sbInlay.setAttribute(
    "d",
    `M ${bodyJointX + dir * 5},${topY - 18} Q ${curveCtrlX + dir * 4},${sbTopY + 6} ${bodyJointX + dir * 160},${sbTopY + 6} L ${soundboardFarX - dir * 6},${sbTopY + 6} L ${soundboardFarX - dir * 6},${sbBotY - 6} L ${bodyJointX + dir * 160},${sbBotY - 6} Q ${curveCtrlX + dir * 4},${sbBotY - 6} ${bodyJointX + dir * 5},${bottomY + 18}`
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
    `M ${raqmaStartX},${topY - 8} Q ${(raqmaStartX + raqmaEndX) / 2},${topY - 26} ${raqmaEndX},${centerY - 48} L ${raqmaEndX},${centerY + 48} Q ${(raqmaStartX + raqmaEndX) / 2},${bottomY + 26} ${raqmaStartX},${bottomY + 8} Z`
  );
  raqma.setAttribute("fill", palette.raqma);
  raqma.setAttribute("stroke", palette.rosetteRing);
  raqma.setAttribute("stroke-width", "1.2");
  raqma.setAttribute("opacity", "0.88");
  svg.appendChild(raqma);

  renderShamsiyyaRosette(svg, rosetteCenterX, centerY, 44, palette, onRosetteClick);
  renderShamsiyyaRosette(svg, rosetteCenterX - dir * 70, topY - 10, 15, palette, onRosetteClick);
  renderShamsiyyaRosette(svg, rosetteCenterX - dir * 70, bottomY + 10, 15, palette, onRosetteClick);

  const nutTopY = topY - 14;
  const nutBotY = bottomY + 14;
  const bodyTopY = topY - 22;
  const bodyBotY = bottomY + 22;

  const pegboxEndX = state.leftHanded ? 1105 : 15;
  const pegbox = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  pegbox.setAttribute("points", `${nutX},${nutTopY} ${pegboxEndX},${topY + 4} ${pegboxEndX},${bottomY - 4} ${nutX},${nutBotY}`);
  pegbox.setAttribute("fill", "#1a110b");
  pegbox.setAttribute("stroke", palette.rosetteRing);
  pegbox.setAttribute("stroke-width", "1.5");
  svg.appendChild(pegbox);

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
  openLbl.setAttribute("y", String(bodyBotY + 28));
  openLbl.setAttribute("text-anchor", "middle");
  openLbl.setAttribute("fill", extColors.courseLabel);
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
    const x1 = getPhysicalX(posBounds.startQ, nutX, neckLengthPx, state.leftHanded);
    const x2 = getPhysicalX(posBounds.endQ, nutX, neckLengthPx, state.leftHanded);
    const rectX = Math.min(x1, x2) - 16;
    const rectW = Math.abs(x2 - x1) + 32;

    const boxRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    boxRect.setAttribute("x", String(rectX));
    boxRect.setAttribute("y", String(bodyTopY + 5));
    boxRect.setAttribute("width", String(rectW));
    boxRect.setAttribute("height", String(bodyBotY - bodyTopY - 10));
    boxRect.setAttribute("rx", "8");
    boxRect.setAttribute("fill", "rgba(212, 175, 55, 0.11)");
    boxRect.setAttribute("stroke", palette.rosetteRing);
    boxRect.setAttribute("stroke-width", "1.8");
    boxRect.setAttribute("stroke-dasharray", "6,4");
    svg.appendChild(boxRect);
  }

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
  nutTag.setAttribute("y", String(nutTopY - 11));
  nutTag.setAttribute("text-anchor", "middle");
  nutTag.setAttribute("fill", extColors.nutTag);
  nutTag.setAttribute("font-size", "9.2");
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
      const iy = bodyTopY - 5;
      inlayDiamond.setAttribute("points", `${gx},${iy - 4} ${gx + 4},${iy} ${gx},${iy + 4} ${gx - 4},${iy}`);
      inlayDiamond.setAttribute("fill", isMicro ? extColors.inlayMicro : (extColors.inlayFixed || palette.sadaf));
      svg.appendChild(inlayDiamond);
    }

    if (!isMicro || state.showMicroGuides) {
      const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      lbl.setAttribute("x", String(gx));
      lbl.setAttribute("y", String(bodyBotY + 28));
      lbl.setAttribute("text-anchor", "middle");
      lbl.setAttribute("fill", isMicro ? extColors.microLabel : extColors.semiLabel);
      lbl.setAttribute("font-size", isMicro ? "9.5" : "10.5");
      lbl.setAttribute("font-weight", "700");
      lbl.textContent = isMicro ? `${q}q` : `S${q / 2}`;
      svg.appendChild(lbl);
    }
  }

  renderPositionRegionsOverlay(svg, state, nutX, neckLengthPx, bodyTopY, bodyBotY, false, isLight);

  const courseSpacing = (bottomY - topY) / 5;
  /** @type {Map<string, { x: number, y: number }>} */
  const coordLookup = new Map();

  tuning.courses.forEach((cObj, cIdx) => {
    const cy = topY + cIdx * courseSpacing;
    const courseLabelX = state.leftHanded ? nutX + 92 : nutX - 92;

    const cText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    cText.setAttribute("x", String(courseLabelX));
    cText.setAttribute("y", String(cy + 4));
    cText.setAttribute("text-anchor", "middle");
    cText.setAttribute("fill", extColors.courseLabel);
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
      const pegString = document.createElementNS("http://www.w3.org/2000/svg", "line");
      pegString.setAttribute("x1", String(openRailX - dir * 18));
      pegString.setAttribute("y1", String(cy + offsetY));
      pegString.setAttribute("x2", String(nutX));
      pegString.setAttribute("y2", String(cy + offsetY));
      pegString.setAttribute("stroke", isWoundBass ? "#92400e" : "#94a3b8");
      pegString.setAttribute("stroke-width", "1.1");
      pegString.setAttribute("opacity", "0.55");
      svg.appendChild(pegString);

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
      const pivotInfo = evaluateShiftPivot(qFromNut, cIdx, tuning);

      const octMatch = octaveNodeMap.get(`${cObj.course}:${qFromNut}`);
      let isSelectedActiveNote = shapeEval.inBox;
      if (isOctaveFilterActive) {
        isSelectedActiveNote = Boolean(octMatch);
      } else if (isChordVoicingActive && chordVoicingMap) {
        isSelectedActiveNote = (chordVoicingMap[cObj.course] === qFromNut);
      }
      if (!isSelectedActiveNote && !state.showGhostNotes) continue;

      const noteFreq = cObj.freq_hz * Math.pow(2, (qFromNut * 50 + noteInfo.centsDev) / 1200);
      if (isChordVoicingActive && isSelectedActiveNote) {
        currentChordVoicingFreqs.push({ course: cObj.course, freq: noteFreq });
      }

      const nx = getPhysicalX(qFromNut, nutX, neckLengthPx, state.leftHanded);
      coordLookup.set(`${cObj.course}:${qFromNut}`, { x: nx, y: cy });

      if (isSelectedActiveNote) {
        visibleActiveNodes.push({ x: nx, y: cy, absQ, modOffsetQ: offsetFromRoot });
      }

      const isRoot = offsetFromRoot === 0;
      const isGhammaz = activeStruct.ghammazOffsets.includes(offsetFromRoot);
      const isPlaybackStepHit = isOctaveFilterActive && octMatch && highlightedStep === octMatch.stepIndex;

      let displayText = pcData.flat;
      if (state.labelMode === "DEGREE") displayText = octMatch ? octMatch.degree : noteInfo.degree;
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
        Boolean(isPlaybackStepHit),
        pivotInfo,
        state.showPositionsMap,
        isLight,
        displayText,
        state.labelMode,
        noteFreq,
        palette,
        selectedPitch,
        onNeckJewelSelect
      );
    }
  });

  if (isOctaveFilterActive) {
    const octPoints = octavePathNodes
      .map(n => {
        const pt = coordLookup.get(`${n.course}:${n.qFromNut}`);
        return pt ? { x: pt.x, y: pt.y, stepIdx: n.stepIndex } : null;
      })
      .filter(Boolean);
    renderConnectedVectorTrail(svg, /** @type {any} */ (octPoints), highlightedStep, "#67e8f9");
  } else if (state.mode === "MAQAM" && state.showSayr) {
    const entity = /** @type {any} */ (activeStruct.entity);
    const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
    if (phrase) renderSayrMelodicPaths(svg, visibleActiveNodes, phrase.steps, highlightedStep);
  }

  currentChordVoicingFreqs.sort((a, b) => b.course - a.course);
  return currentChordVoicingFreqs;
}
