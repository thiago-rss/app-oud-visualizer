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

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Cache leve da geometria do último render do braço para atualizar o
 * #live-pitch-layer a ~22 fps sem reconstruir o SVG do Oud.
 * @type {{
 *   isVert: boolean,
 *   isLeftHanded: boolean,
 *   isLight: boolean,
 *   isEn: boolean,
 *   shapeMode: string,
 *   boxAnchorQ: number,
 *   tuning: any,
 *   nutCoord: number,
 *   neckLengthPx: number,
 *   coursePositions: Map<number, number>,
 *   activeJewelsByAbsQ: Map<number, { x: number, y: number, course: number, qFromNut: number, inBox: boolean, absQ: number }[]>
 * } | null}
 */
let lastNeckRenderContext = null;

/** @type {import("../audio/pitchEngine.js").PitchDetectionResult | null} */
let lastLiveDetection = null;

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

  const rect = document.createElementNS(SVG_NS, "rect");
  rect.setAttribute("x", String(cx - approxWidth / 2));
  rect.setAttribute("y", String(cy - height / 2));
  rect.setAttribute("width", String(approxWidth));
  rect.setAttribute("height", String(height));
  rect.setAttribute("rx", String(height / 2));
  rect.setAttribute("fill", bgColor);
  rect.setAttribute("stroke", strokeColor);
  rect.setAttribute("stroke-width", "1.4");
  parent.appendChild(rect);

  const lbl = document.createElementNS(SVG_NS, "text");
  lbl.setAttribute("x", String(cx));
  lbl.setAttribute("y", String(cy + fontSize * 0.35));
  lbl.setAttribute("text-anchor", "middle");
  lbl.setAttribute("fill", textColor);
  lbl.setAttribute("font-size", String(fontSize));
  lbl.setAttribute("font-weight", "800");
  lbl.textContent = text;
  parent.appendChild(lbl);

  return { width: approxWidth, height };
}

/**
 * Limpa imediatamente a camada de detecção de afinação ao vivo no espelho.
 */
export function clearLivePitchOverlayOnNeck() {
  lastLiveDetection = null;
  const layer = document.getElementById("live-pitch-layer");
  if (layer) layer.innerHTML = "";
}

/**
 * Atualiza a camada leve `#live-pitch-layer` no espelho SVG sem recriar o instrumento.
 * Chamado em tempo real pelo motor YIN (`pitchEngine.js`).
 *
 * @param {import("../audio/pitchEngine.js").PitchDetectionResult | null} detection
 */
export function updateLivePitchOverlayOnNeck(detection) {
  lastLiveDetection = detection && detection.active ? detection : null;

  const layer = document.getElementById("live-pitch-layer");
  if (!layer) return;
  layer.innerHTML = "";

  if (!lastLiveDetection || !lastNeckRenderContext) return;

  const ctx = lastNeckRenderContext;
  const det = lastLiveDetection;
  const { isVert, isLeftHanded, isLight, shapeMode, boxAnchorQ, tuning, nutCoord, neckLengthPx, coursePositions } = ctx;

  // Paleta contida (Latão = afinado, Ameixa = próximo, Rubi = fora)
  let strokeColor = isLight ? "#b92b2b" : "#e06c6c";
  let softFill = "rgba(224, 108, 108, 0.22)";
  let badgeBg = isLight ? "#fcfaf6" : "#211212";

  if (det.status === "IN_TUNE") {
    strokeColor = isLight ? "#8f5e1c" : "#e2b963";
    softFill = "rgba(201, 154, 73, 0.28)";
    badgeBg = isLight ? "#fcfaf6" : "#1f180e";
  } else if (det.status === "CLOSE") {
    strokeColor = isLight ? "#6b3f8c" : "#c49be0";
    softFill = "rgba(196, 155, 224, 0.24)";
    badgeBg = isLight ? "#fcfaf6" : "#1e1426";
  }

  const rootG = document.createElementNS(SVG_NS, "g");
  rootG.setAttribute("opacity", det.isHolding ? "0.52" : "1");

  const roundedCents = Math.round(det.centsOff);
  const signedCents = `${roundedCents > 0 ? "+" : ""}${roundedCents}¢`;

  // Seta física de correção coerente com orientação e destro/canhoto
  let dirArrow = "";
  if (det.direction === "FLAT") {
    dirArrow = isVert ? "↓" : (isLeftHanded ? "←" : "→");
  } else if (det.direction === "SHARP") {
    dirArrow = isVert ? "↑" : (isLeftHanded ? "→" : "←");
  }

  const clampPillX = (/** @type {number} */ x) => {
    const maxW = isVert ? 460 : 1120;
    return Math.max(46, Math.min(maxW - 46, x));
  };
  const clampPillY = (/** @type {number} */ y) => {
    const maxH = isVert ? 1085 : 430;
    return Math.max(16, Math.min(maxH - 16, y));
  };

  // =========================================================================
  // MODO AFINADOR DAS 6 ORDENS: destaca a corda solta alvo
  // =========================================================================
  if (det.mode === "TUNER" && det.courseNumber !== null) {
    const perp = coursePositions.get(det.courseNumber);
    if (perp === undefined) return;

    const openAxis = getPhysicalX(0, nutCoord, neckLengthPx, isVert ? false : isLeftHanded);
    const tx = isVert ? perp : openAxis;
    const ty = isVert ? openAxis : perp;

    const outerHalo = document.createElementNS(SVG_NS, "circle");
    outerHalo.setAttribute("cx", String(tx));
    outerHalo.setAttribute("cy", String(ty));
    outerHalo.setAttribute("r", "23");
    outerHalo.setAttribute("fill", softFill);
    outerHalo.setAttribute("stroke", strokeColor);
    outerHalo.setAttribute("stroke-width", "2.6");
    rootG.appendChild(outerHalo);

    const innerRing = document.createElementNS(SVG_NS, "circle");
    innerRing.setAttribute("cx", String(tx));
    innerRing.setAttribute("cy", String(ty));
    innerRing.setAttribute("r", "16.5");
    innerRing.setAttribute("fill", "none");
    innerRing.setAttribute("stroke", "#ffffff");
    innerRing.setAttribute("stroke-width", "1.4");
    innerRing.setAttribute("stroke-dasharray", det.status === "IN_TUNE" ? "none" : "3,2");
    rootG.appendChild(innerRing);

    const tunerBadgeText = det.status === "IN_TUNE"
      ? `✓ ${det.noteName} (${signedCents})`
      : `${det.noteName} ${signedCents} ${det.direction === "FLAT" ? "↑" : "↓"}`;

    const px = clampPillX(isVert ? tx : tx + (isLeftHanded ? -44 : 44));
    const py = clampPillY(isVert ? ty - 30 : ty - 24);
    appendPillLabel(rootG, px, py, tunerBadgeText, strokeColor, strokeColor, badgeBg, 9.8, 8, 20);

    layer.appendChild(rootG);
    return;
  }

  // =========================================================================
  // MODO INTONAÇÃO 24-TET (MAQAM / CROMÁTICO): halo no alvo + ponto vivo do dedo
  // =========================================================================
  const bounds = getPositionBounds(shapeMode, boxAnchorQ);
  const centerQ = (bounds.startQ + bounds.endQ) / 2;

  /** @type {{ x: number, y: number, course: number, qFromNut: number, inBox: boolean, courseAbsQ: number }[]} */
  let candidates = [];

  const renderedMatches = ctx.activeJewelsByAbsQ.get(det.targetAbsQ);
  if (renderedMatches && renderedMatches.length) {
    candidates = renderedMatches.map(m => {
      const cObj = tuning.courses.find((/** @type {any} */ c) => c.course === m.course);
      return {
        x: m.x,
        y: m.y,
        course: m.course,
        qFromNut: m.qFromNut,
        inBox: m.inBox,
        courseAbsQ: cObj ? cObj.abs_q : det.targetAbsQ - m.qFromNut
      };
    });
  } else if (tuning && Array.isArray(tuning.courses)) {
    // Fallback físico para notas cromáticas ou fora da escala atual
    tuning.courses.forEach((/** @type {any} */ cObj) => {
      const qFromNut = det.targetAbsQ - cObj.abs_q;
      if (qFromNut < 0 || qFromNut > MAX_NECK_Q) return;
      const perp = coursePositions.get(cObj.course);
      if (perp === undefined) return;
      const axis = getPhysicalX(qFromNut, nutCoord, neckLengthPx, isVert ? false : isLeftHanded);
      const shapeEval = evaluateShapeAndFinger(qFromNut, shapeMode, boxAnchorQ);
      candidates.push({
        x: isVert ? perp : axis,
        y: isVert ? axis : perp,
        course: cObj.course,
        qFromNut,
        inBox: shapeEval.inBox,
        courseAbsQ: cObj.abs_q
      });
    });
  }

  if (!candidates.length) return;

  // Ordena priorizando notas dentro da posição ativa e mais próximas do centro da mão
  candidates.sort((a, b) => {
    if (a.inBox !== b.inBox) return a.inBox ? -1 : 1;
    const distA = Math.abs(a.qFromNut - centerQ) + (a.qFromNut > 10 ? 4 : 0);
    const distB = Math.abs(b.qFromNut - centerQ) + (b.qFromNut > 10 ? 4 : 0);
    return distA - distB;
  });

  const primary = candidates[0];

  // Halos secundários sutis em uníssonos equivalentes na mesma oitava
  for (let i = 1; i < candidates.length; i++) {
    const sec = candidates[i];
    const secRing = document.createElementNS(SVG_NS, "circle");
    secRing.setAttribute("cx", String(sec.x));
    secRing.setAttribute("cy", String(sec.y));
    secRing.setAttribute("r", "17.5");
    secRing.setAttribute("fill", "none");
    secRing.setAttribute("stroke", strokeColor);
    secRing.setAttribute("stroke-width", "1.6");
    secRing.setAttribute("stroke-dasharray", "3,3");
    secRing.setAttribute("opacity", "0.55");
    rootG.appendChild(secRing);
  }

  // Halo principal sobre a joia-alvo
  const targetHalo = document.createElementNS(SVG_NS, "circle");
  targetHalo.setAttribute("cx", String(primary.x));
  targetHalo.setAttribute("cy", String(primary.y));
  targetHalo.setAttribute("r", det.status === "IN_TUNE" ? "21.5" : "19.5");
  targetHalo.setAttribute("fill", softFill);
  targetHalo.setAttribute("stroke", strokeColor);
  targetHalo.setAttribute("stroke-width", det.status === "IN_TUNE" ? "3" : "2.2");
  if (!det.inScale) {
    targetHalo.setAttribute("stroke-dasharray", "4,3");
  }
  rootG.appendChild(targetHalo);

  // Ponto vivo contínuo no espelho sem trastes (mostra exatamente onde o dedo está soando)
  const actualQ = det.continuousAbsQ - primary.courseAbsQ;
  if (primary.qFromNut > 0 && actualQ >= 0.15 && actualQ <= MAX_NECK_Q + 0.35) {
    const clampedQ = Math.max(0.15, Math.min(MAX_NECK_Q, actualQ));
    const liveAxis = getPhysicalX(clampedQ, nutCoord, neckLengthPx, isVert ? false : isLeftHanded);
    const lx = isVert ? primary.x : liveAxis;
    const ly = isVert ? liveAxis : primary.y;
    const pxDist = Math.hypot(lx - primary.x, ly - primary.y);

    if (pxDist > 2.2) {
      const guideConnector = document.createElementNS(SVG_NS, "line");
      guideConnector.setAttribute("x1", String(lx));
      guideConnector.setAttribute("y1", String(ly));
      guideConnector.setAttribute("x2", String(primary.x));
      guideConnector.setAttribute("y2", String(primary.y));
      guideConnector.setAttribute("stroke", strokeColor);
      guideConnector.setAttribute("stroke-width", "2");
      guideConnector.setAttribute("stroke-dasharray", "3,2");
      rootG.appendChild(guideConnector);
    }

    const fingerDot = document.createElementNS(SVG_NS, "circle");
    fingerDot.setAttribute("cx", String(lx));
    fingerDot.setAttribute("cy", String(ly));
    fingerDot.setAttribute("r", det.status === "IN_TUNE" ? "4.8" : "5.8");
    fingerDot.setAttribute("fill", strokeColor);
    fingerDot.setAttribute("stroke", "#ffffff");
    fingerDot.setAttribute("stroke-width", "1.6");
    rootG.appendChild(fingerDot);
  }

  // Cápsula compacta de leitura de cents + direção acima da joia principal
  const labelText = det.status === "IN_TUNE"
    ? `✓ ${det.noteName} ${signedCents}`
    : (!det.inScale
      ? `${dirArrow} ${det.noteName} (${signedCents})`
      : `${dirArrow} ${signedCents}`);

  const pillX = clampPillX(primary.x);
  const pillY = clampPillY(primary.y - 28);
  appendPillLabel(rootG, pillX, pillY, labelText, strokeColor, strokeColor, badgeBg, 9.5, 7, 19);

  layer.appendChild(rootG);
}

function renderShamsiyyaRosette(svg, cx, cy, radius, palette, onRosetteClick) {
  const g = document.createElementNS(SVG_NS, "g");
  g.style.cursor = "pointer";
  g.addEventListener("click", onRosetteClick);

  const outerRing = document.createElementNS(SVG_NS, "circle");
  outerRing.setAttribute("cx", String(cx));
  outerRing.setAttribute("cy", String(cy));
  outerRing.setAttribute("r", String(radius + 6));
  outerRing.setAttribute("fill", palette.ebony);
  outerRing.setAttribute("stroke", palette.rosetteRing);
  outerRing.setAttribute("stroke-width", "2");
  g.appendChild(outerRing);

  const pearlRing = document.createElementNS(SVG_NS, "circle");
  pearlRing.setAttribute("cx", String(cx));
  pearlRing.setAttribute("cy", String(cy));
  pearlRing.setAttribute("r", String(radius + 3));
  pearlRing.setAttribute("fill", "none");
  pearlRing.setAttribute("stroke", "#e2d9c8");
  pearlRing.setAttribute("stroke-width", "1.2");
  pearlRing.setAttribute("stroke-dasharray", "3,2");
  g.appendChild(pearlRing);

  const hole = document.createElementNS(SVG_NS, "circle");
  hole.setAttribute("cx", String(cx));
  hole.setAttribute("cy", String(cy));
  hole.setAttribute("r", String(radius));
  hole.setAttribute("fill", "#0b0806");
  hole.setAttribute("stroke", palette.rosetteRing);
  hole.setAttribute("stroke-width", "1.4");
  g.appendChild(hole);

  for (let a = 0; a < 180; a += 15) {
    const rect = document.createElementNS(SVG_NS, "rect");
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

  const innerStar = document.createElementNS(SVG_NS, "polygon");
  innerStar.setAttribute("points", createOctagramStarPath(cx, cy, radius * 0.52, radius * 0.28));
  innerStar.setAttribute("fill", "rgba(201, 154, 73, 0.18)");
  innerStar.setAttribute("stroke", "#e2d9c8");
  innerStar.setAttribute("stroke-width", "1");
  g.appendChild(innerStar);

  svg.appendChild(g);
}

/**
 * Desenha as faixas translúcidas de pré-visualização no hover das regiões anatômicas (atrás das notas).
 */
function renderRegionHoverZones(svg, state, nutCoord, neckLengthPx, edgeStart, edgeEnd, isVert, isLight) {
  if (!state.showPositionsMap) return;

  const hoverGroup = document.createElementNS(SVG_NS, "g");
  hoverGroup.setAttribute("class", "region-hover-layer");
  hoverGroup.setAttribute("pointer-events", "none");

  const defs = [
    { id: "OPEN_FIRST_POS", q1: 0, q2: 8, color: isLight ? "#5c4e3c" : "#e2d9c8" },
    { id: "POS_SECOND", q1: 4, q2: 10, color: isLight ? "#9a6515" : "#d4a84f" },
    { id: "POS_THIRD_BODY", q1: 8, q2: MAX_NECK_Q, color: isLight ? "#6b3f8c" : "#c49be0" }
  ];

  defs.forEach(reg => {
    const c1 = getPhysicalX(reg.q1, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const c2 = getPhysicalX(reg.q2, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const minC = Math.min(c1, c2) - 14;
    const span = Math.abs(c2 - c1) + 28;

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("id", `hover-zone-${reg.id}`);
    rect.setAttribute("class", "region-hover-zone");
    if (isVert) {
      rect.setAttribute("x", String(edgeStart - 15));
      rect.setAttribute("y", String(minC));
      rect.setAttribute("width", String((edgeEnd - edgeStart) + 30));
      rect.setAttribute("height", String(span));
    } else {
      rect.setAttribute("x", String(minC));
      rect.setAttribute("y", String(edgeStart + 4));
      rect.setAttribute("width", String(span));
      rect.setAttribute("height", String((edgeEnd - edgeStart) - 8));
    }
    rect.setAttribute("rx", "8");
    rect.setAttribute("fill", reg.color);
    rect.setAttribute("fill-opacity", "0");
    rect.setAttribute("stroke", reg.color);
    rect.setAttribute("stroke-opacity", "0");
    rect.setAttribute("stroke-width", "1.6");
    rect.setAttribute("stroke-dasharray", "4,3");
    hoverGroup.appendChild(rect);
  });

  svg.appendChild(hoverGroup);
}

/**
 * Desenha os Colchetes de Região Anatômica interativos (I, II, III com toggle, hover e botão ▶),
 * a linha divisória da Junta do Corpo (10q) e o indicador do Polegar (Ibham).
 */
function renderPositionRegionsOverlay(svg, state, nutCoord, neckLengthPx, edgeStart, edgeEnd, isVert, isLight, interactions) {
  if (!state.showPositionsMap) return;

  const g = document.createElementNS(SVG_NS, "g");
  g.setAttribute("class", "region-overlay");

  const isEn = state.lang === "en";
  const posBounds = getPositionBounds(state.shapeMode, state.boxAnchorQ);
  const pillBg = isLight ? "#fcfaf6" : "#17120f";

  const regions = [
    {
      id: "OPEN_FIRST_POS",
      q1: 1,
      q2: 7,
      color: isLight ? "#5c4e3c" : "#e2d9c8",
      activeFill: isLight ? "#f0e7d8" : "#2a231d",
      labelHoriz: isEn ? "I · 1st Pos (Nut)" : "I · 1ª Pos (Pestana)",
      labelVert: isEn ? "I · 1st Pos" : "I · 1ª Pos"
    },
    {
      id: "POS_SECOND",
      q1: 4,
      q2: 10,
      color: isLight ? "#9a6515" : "#d4a84f",
      activeFill: isLight ? "#fbf2de" : "#2d2111",
      labelHoriz: isEn ? "II · 2nd Pos (Mid)" : "II · 2ª Pos (Média)",
      labelVert: isEn ? "II · 2nd Pos" : "II · 2ª Pos"
    },
    {
      id: "POS_THIRD_BODY",
      q1: 9,
      q2: 16,
      color: isLight ? "#6b3f8c" : "#c49be0",
      activeFill: isLight ? "#f4eafb" : "#281933",
      labelHoriz: isEn ? "III · 3rd Pos (Body)" : "III · 3ª Pos (Tampo)",
      labelVert: isEn ? "III · Body" : "III · Tampo"
    }
  ];

  // Linha divisória da Junta do Corpo (10q)
  const jointCoord = getPhysicalX(10, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
  const jointLine = document.createElementNS(SVG_NS, "line");
  jointLine.setAttribute("pointer-events", "none");
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
  jointLine.setAttribute("stroke", isLight ? "#8f5e1c" : "#c99a49");
  jointLine.setAttribute("stroke-width", "1.6");
  jointLine.setAttribute("stroke-dasharray", "5,3");
  jointLine.setAttribute("opacity", "0.8");
  g.appendChild(jointLine);

  const toggleHoverZone = (regionId, visible) => {
    const zone = svg.querySelector(`#hover-zone-${regionId}`);
    if (!zone) return;
    zone.setAttribute("fill-opacity", visible ? "0.14" : "0");
    zone.setAttribute("stroke-opacity", visible ? "0.68" : "0");
  };

  regions.forEach((reg, idx) => {
    const isFocusedRegion = state.shapeMode === reg.id;
    const isPlayingThisRegion = interactions?.playingRegionId === reg.id;
    const c1 = getPhysicalX(reg.q1, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const c2 = getPhysicalX(reg.q2, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    const midC = (minC + maxC) / 2;

    const regGroup = document.createElementNS(SVG_NS, "g");
    regGroup.setAttribute("class", `region-pill-btn ${isFocusedRegion ? "is-active-region" : ""}`);

    const pillTitle = document.createElementNS(SVG_NS, "title");
    pillTitle.textContent = isFocusedRegion
      ? (isEn ? "Click to return to Full Fingerboard" : "Clique para voltar ao Espelho Completo")
      : (isEn ? "Click to isolate this anatomical position" : "Clique para isolar esta posição anatômica");
    regGroup.appendChild(pillTitle);

    let playBtnX = 0;
    let playBtnY = 0;

    if (isVert) {
      const railX = idx === 1 ? edgeEnd + 44 : edgeEnd + 32;
      const bracket = document.createElementNS(SVG_NS, "path");
      bracket.setAttribute("pointer-events", "none");
      bracket.setAttribute(
        "d",
        `M ${railX - 6},${minC} L ${railX},${minC} L ${railX},${maxC} L ${railX - 6},${maxC}`
      );
      bracket.setAttribute("fill", "none");
      bracket.setAttribute("stroke", reg.color);
      bracket.setAttribute("stroke-width", isFocusedRegion ? "2.6" : "1.6");
      bracket.setAttribute("opacity", isFocusedRegion ? "1" : "0.78");
      regGroup.appendChild(bracket);

      const pillY = idx === 0
        ? minC + (maxC - minC) * 0.28
        : (idx === 1 ? minC + (maxC - minC) * 0.66 : midC);
      const pillCenterX = isFocusedRegion ? edgeEnd + 86 : edgeEnd + 92;

      const connector = document.createElementNS(SVG_NS, "line");
      connector.setAttribute("pointer-events", "none");
      connector.setAttribute("x1", String(railX));
      connector.setAttribute("y1", String(pillY));
      connector.setAttribute("x2", String(pillCenterX - 36));
      connector.setAttribute("y2", String(pillY));
      connector.setAttribute("stroke", reg.color);
      connector.setAttribute("stroke-width", isFocusedRegion ? "1.8" : "1.3");
      connector.setAttribute("opacity", "0.88");
      regGroup.appendChild(connector);

      const metrics = appendPillLabel(
        regGroup,
        pillCenterX,
        pillY,
        reg.labelVert,
        reg.color,
        reg.color,
        isFocusedRegion ? reg.activeFill : pillBg,
        isFocusedRegion ? 10.2 : 9.6,
        7,
        22
      );

      playBtnX = Math.min(446, pillCenterX + metrics.width / 2 + 11);
      playBtnY = pillY;
    } else {
      const railY = idx === 1 ? 52 : 24;
      const bracket = document.createElementNS(SVG_NS, "path");
      bracket.setAttribute("pointer-events", "none");
      bracket.setAttribute(
        "d",
        `M ${minC},${railY + 7} L ${minC},${railY} L ${maxC},${railY} L ${maxC},${railY + 7}`
      );
      bracket.setAttribute("fill", "none");
      bracket.setAttribute("stroke", reg.color);
      bracket.setAttribute("stroke-width", isFocusedRegion ? "2.6" : "1.6");
      bracket.setAttribute("opacity", isFocusedRegion ? "1" : "0.82");
      regGroup.appendChild(bracket);

      const pillShiftX = isFocusedRegion ? -9 : 0;
      const pillCenterX = midC + pillShiftX;

      const metrics = appendPillLabel(
        regGroup,
        pillCenterX,
        railY,
        reg.labelHoriz,
        reg.color,
        reg.color,
        isFocusedRegion ? reg.activeFill : pillBg,
        isFocusedRegion ? 10.5 : 9.8,
        9,
        21
      );

      playBtnX = pillCenterX + metrics.width / 2 + 12;
      playBtnY = railY;
    }

    regGroup.addEventListener("mouseenter", () => toggleHoverZone(reg.id, true));
    regGroup.addEventListener("mouseleave", () => toggleHoverZone(reg.id, false));
    regGroup.addEventListener("click", (ev) => {
      ev.stopPropagation();
      interactions?.onToggleRegion?.(reg.id);
    });

    g.appendChild(regGroup);

    if (isFocusedRegion) {
      const playG = document.createElementNS(SVG_NS, "g");
      playG.setAttribute("class", "region-play-btn");

      const pTitle = document.createElementNS(SVG_NS, "title");
      pTitle.textContent = isPlayingThisRegion
        ? (isEn ? "Stop region playback" : "Parar audição da região")
        : (isEn ? "Play notes inside this position" : "Ouvir notas desta posição");
      playG.appendChild(pTitle);

      const pCircle = document.createElementNS(SVG_NS, "circle");
      pCircle.setAttribute("cx", String(playBtnX));
      pCircle.setAttribute("cy", String(playBtnY));
      pCircle.setAttribute("r", "10");
      pCircle.setAttribute("fill", isPlayingThisRegion ? (isLight ? "#6b3f8c" : "#8755ab") : (isLight ? "#8f5e1c" : "#c99a49"));
      pCircle.setAttribute("stroke", isLight ? "#fcfaf6" : "#17120f");
      pCircle.setAttribute("stroke-width", "1.6");
      playG.appendChild(pCircle);

      if (isPlayingThisRegion) {
        const stopSq = document.createElementNS(SVG_NS, "rect");
        stopSq.setAttribute("x", String(playBtnX - 3.4));
        stopSq.setAttribute("y", String(playBtnY - 3.4));
        stopSq.setAttribute("width", "6.8");
        stopSq.setAttribute("height", "6.8");
        stopSq.setAttribute("rx", "1");
        stopSq.setAttribute("fill", "#ffffff");
        playG.appendChild(stopSq);
      } else {
        const playTri = document.createElementNS(SVG_NS, "polygon");
        playTri.setAttribute(
          "points",
          `${playBtnX - 2.6},${playBtnY - 4.2} ${playBtnX + 4.4},${playBtnY} ${playBtnX - 2.6},${playBtnY + 4.2}`
        );
        playTri.setAttribute("fill", isLight ? "#ffffff" : "#16100a");
        playG.appendChild(playTri);
      }

      playG.addEventListener("click", (ev) => {
        ev.stopPropagation();
        interactions?.onPlayRegion?.(reg.id);
      });

      g.appendChild(playG);
    }
  });

  if (state.shapeMode !== "FULL_NECK") {
    const thumbCoord = getPhysicalX(posBounds.thumbQ, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const thumbColor = isLight ? "#6b3f8c" : "#c49be0";
    const thumbText = isEn ? `▲ Thumb (${posBounds.thumbQ}q)` : `▲ Polegar (${posBounds.thumbQ}q)`;

    const thumbG = document.createElementNS(SVG_NS, "g");
    thumbG.setAttribute("pointer-events", "none");

    if (isVert) {
      const tx = edgeStart - 22;
      const poly = document.createElementNS(SVG_NS, "polygon");
      poly.setAttribute("points", `${tx - 5},${thumbCoord - 5.5} ${tx + 5},${thumbCoord} ${tx - 5},${thumbCoord + 5.5}`);
      poly.setAttribute("fill", thumbColor);
      thumbG.appendChild(poly);

      appendPillLabel(
        thumbG,
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
        thumbG,
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

    g.appendChild(thumbG);
  }

  svg.appendChild(g);
}

/**
 * Renderiza a visualização vetorial da transição de mão (SHIFT) ou ponte de uníssono (UNISON).
 */
function renderHandShiftOverlay(svg, state, shiftOverlay, coordLookup, nutCoord, neckLengthPx, edgeStart, edgeEnd, isVert, isLight) {
  if (!shiftOverlay) return;

  const overlayG = document.createElementNS(SVG_NS, "g");
  overlayG.setAttribute("class", "region-overlay shift-vector-overlay");
  overlayG.setAttribute("pointer-events", "none");

  const isEn = state.lang === "en";
  const plumStroke = isLight ? "#6b3f8c" : "#c49be0";
  const pillBg = isLight ? "#fcfaf6" : "#1a1220";

  if (shiftOverlay.type === "UNISON") {
    const pFrom = coordLookup.get(`${shiftOverlay.fromCourse}:${shiftOverlay.fromQ}`);
    const pTo = coordLookup.get(`${shiftOverlay.toCourse}:${shiftOverlay.toQ}`);
    if (!pFrom || !pTo) return;

    const midX = (pFrom.x + pTo.x) / 2;
    const midY = (pFrom.y + pTo.y) / 2;
    const dx = pTo.x - pFrom.x;
    const dy = pTo.y - pFrom.y;
    const dist = Math.hypot(dx, dy) || 1;
    const curveLift = isVert ? -32 : -28;
    const ctrlX = midX - (dy / dist) * curveLift;
    const ctrlY = midY + (dx / dist) * curveLift;

    const arc = document.createElementNS(SVG_NS, "path");
    arc.setAttribute(
      "d",
      `M ${pFrom.x.toFixed(1)},${pFrom.y.toFixed(1)} Q ${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${pTo.x.toFixed(1)},${pTo.y.toFixed(1)}`
    );
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", plumStroke);
    arc.setAttribute("stroke-width", "3");
    arc.setAttribute("stroke-dasharray", "6,3");
    arc.setAttribute("marker-end", "url(#sayrArrowActive)");
    overlayG.appendChild(arc);

    [pFrom, pTo].forEach(pt => {
      const ring = document.createElementNS(SVG_NS, "circle");
      ring.setAttribute("cx", String(pt.x));
      ring.setAttribute("cy", String(pt.y));
      ring.setAttribute("r", "19.5");
      ring.setAttribute("fill", "rgba(196, 155, 224, 0.22)");
      ring.setAttribute("stroke", plumStroke);
      ring.setAttribute("stroke-width", "2.4");
      overlayG.appendChild(ring);
    });

    const lblX = (pFrom.x + 2 * ctrlX + pTo.x) / 4;
    const lblY = (pFrom.y + 2 * ctrlY + pTo.y) / 4;
    const txt = isEn
      ? `Unison = ${shiftOverlay.toCourse}th Open`
      : `Uníssono = ${shiftOverlay.toCourse}ª Solta`;
    appendPillLabel(overlayG, lblX, lblY, txt, plumStroke, plumStroke, pillBg, 9.6, 8, 20);

    svg.appendChild(overlayG);
    return;
  }

  if (shiftOverlay.type === "SHIFT") {
    const cFrom = getPhysicalX(shiftOverlay.fromThumbQ, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const cTo = getPhysicalX(shiftOverlay.toThumbQ, nutCoord, neckLengthPx, isVert ? false : state.leftHanded);
    const midC = (cFrom + cTo) / 2;

    if (isVert) {
      const railX = edgeStart - 24;
      const ctrlX = railX - 24;
      const arc = document.createElementNS(SVG_NS, "path");
      arc.setAttribute(
        "d",
        `M ${railX},${cFrom.toFixed(1)} Q ${ctrlX},${midC.toFixed(1)} ${railX},${cTo.toFixed(1)}`
      );
      arc.setAttribute("fill", "none");
      arc.setAttribute("stroke", plumStroke);
      arc.setAttribute("stroke-width", "2.8");
      arc.setAttribute("marker-end", "url(#sayrArrowActive)");
      overlayG.appendChild(arc);

      appendPillLabel(
        overlayG,
        edgeEnd + 92,
        136,
        shiftOverlay.badgeText,
        plumStroke,
        plumStroke,
        pillBg,
        9.4,
        7,
        20
      );
    } else {
      const baseY = edgeEnd + 36;
      const ctrlY = baseY + 18;
      const arc = document.createElementNS(SVG_NS, "path");
      arc.setAttribute(
        "d",
        `M ${cFrom.toFixed(1)},${baseY} Q ${midC.toFixed(1)},${ctrlY} ${cTo.toFixed(1)},${baseY}`
      );
      arc.setAttribute("fill", "none");
      arc.setAttribute("stroke", plumStroke);
      arc.setAttribute("stroke-width", "2.8");
      arc.setAttribute("marker-end", "url(#sayrArrowActive)");
      overlayG.appendChild(arc);

      const pivotPt = coordLookup.get(`${shiftOverlay.course}:${shiftOverlay.pivotQ}`);
      if (pivotPt) {
        const pRing = document.createElementNS(SVG_NS, "circle");
        pRing.setAttribute("cx", String(pivotPt.x));
        pRing.setAttribute("cy", String(pivotPt.y));
        pRing.setAttribute("r", "20");
        pRing.setAttribute("fill", "rgba(196, 155, 224, 0.22)");
        pRing.setAttribute("stroke", plumStroke);
        pRing.setAttribute("stroke-width", "2.4");
        overlayG.appendChild(pRing);

        appendPillLabel(
          overlayG,
          pivotPt.x,
          pivotPt.y - 28,
          shiftOverlay.badgeText,
          plumStroke,
          plumStroke,
          pillBg,
          9.6,
          8,
          20
        );
      }
    }

    svg.appendChild(overlayG);
  }
}

function renderConnectedVectorTrail(svg, orderedPoints, highlightedStepIdx, baseColor = "#e2b963") {
  if (orderedPoints.length < 2) return;

  const trailGroup = document.createElementNS(SVG_NS, "g");
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

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", `M ${p1.x.toFixed(1)},${p1.y.toFixed(1)} Q ${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", isCurrentSegment ? "#c49be0" : baseColor);
    path.setAttribute("stroke-width", isCurrentSegment ? "3.2" : "2.2");
    path.setAttribute("stroke-opacity", isCurrentSegment ? "0.98" : "0.84");
    path.setAttribute("marker-end", isCurrentSegment ? "url(#sayrArrowActive)" : "url(#sayrArrow)");
    trailGroup.appendChild(path);
  }

  orderedPoints.forEach((pt, idx) => {
    const isHighlighted = highlightedStepIdx === pt.stepIdx;
    const badgeX = pt.x + 12;
    const badgeY = pt.y - 12;

    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", String(badgeX));
    circle.setAttribute("cy", String(badgeY));
    circle.setAttribute("r", isHighlighted ? "9.5" : "7.5");
    circle.setAttribute("fill", isHighlighted ? "#7e4ca3" : "#17120f");
    circle.setAttribute("stroke", isHighlighted ? "#f5ebfc" : baseColor);
    circle.setAttribute("stroke-width", "1.4");
    trailGroup.appendChild(circle);

    const num = document.createElementNS(SVG_NS, "text");
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

  renderConnectedVectorTrail(svg, resolvedPathNodes, highlightedStepIdx, "#e2b963");
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
  isEn,
  displayText,
  labelMode,
  noteFreq,
  palette,
  selectedPitch,
  onNeckJewelSelect,
  onPivotAction
) {
  let fillGrad = "url(#fixedGem)";
  let strokeColor = "#cbd5e1";
  if (isRoot) {
    fillGrad = "url(#rootGem)";
    strokeColor = "#f5deb3";
  } else if (isGhammaz) {
    fillGrad = "url(#ghammazGem)";
    strokeColor = "#fde68a";
  } else if (isMicroNote) {
    fillGrad = "url(#microGem)";
    strokeColor = "#e9d5ff";
  }

  const isExactStaffMatch = (selectedPitch !== null && selectedPitch.absQ === absQ) || isPlaybackStepHit;
  const isOctaveStaffMatch = selectedPitch !== null && !isExactStaffMatch && selectedPitch.pitchClassQ === pitchClassQ;

  let nodeOpacity = isSelectedActiveNote ? "1.0" : "0.18";
  if (selectedPitch !== null && isSelectedActiveNote) {
    nodeOpacity = (isExactStaffMatch || isOctaveStaffMatch) ? "1.0" : "0.35";
  }

  const group = document.createElementNS(SVG_NS, "g");
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

  if (showPositionsMap && isSelectedActiveNote && pivotInfo && pivotInfo.isPivot) {
    const isUnisonBridge = pivotInfo.type === "UNISON_BRIDGE";
    const pivotRing = document.createElementNS(SVG_NS, "circle");
    pivotRing.setAttribute("cx", String(nx));
    pivotRing.setAttribute("cy", String(ny));
    pivotRing.setAttribute("r", "16.2");
    pivotRing.setAttribute("fill", isUnisonBridge ? "rgba(196, 155, 224, 0.16)" : "rgba(212, 168, 79, 0.14)");
    pivotRing.setAttribute("stroke", isUnisonBridge ? "#c49be0" : "#d4a84f");
    pivotRing.setAttribute("stroke-width", "1.6");
    pivotRing.setAttribute("stroke-dasharray", isUnisonBridge ? "4,2" : "2,2");
    group.appendChild(pivotRing);
  }

  if (isExactStaffMatch || isOctaveStaffMatch) {
    const halo = document.createElementNS(SVG_NS, "circle");
    halo.setAttribute("cx", String(nx));
    halo.setAttribute("cy", String(ny));
    halo.setAttribute("r", isExactStaffMatch ? "20" : "18");
    halo.setAttribute("fill", isExactStaffMatch ? "rgba(196, 155, 224, 0.28)" : "rgba(212, 168, 79, 0.14)");
    halo.setAttribute("stroke", isExactStaffMatch ? (isLight ? "#6b3f8c" : "#c49be0") : "#d4a84f");
    halo.setAttribute("stroke-width", isExactStaffMatch ? "2.6" : "1.8");
    if (isOctaveStaffMatch) halo.setAttribute("stroke-dasharray", "3,2");
    group.appendChild(halo);
  }

  if (qFromNut === 0 && isSelectedActiveNote) {
    const openHalo = document.createElementNS(SVG_NS, "circle");
    openHalo.setAttribute("cx", String(nx));
    openHalo.setAttribute("cy", String(ny));
    openHalo.setAttribute("r", "15.5");
    openHalo.setAttribute("fill", "none");
    openHalo.setAttribute("stroke", "#e2d9c8");
    openHalo.setAttribute("stroke-width", "1.1");
    openHalo.setAttribute("stroke-dasharray", "2,2");
    openHalo.setAttribute("opacity", "0.75");
    group.appendChild(openHalo);
  }

  if (isMicroNote) {
    const outerR = isRoot ? 15.5 : 13.8;
    const innerR = isRoot ? 11.2 : 9.8;
    const star = document.createElementNS(SVG_NS, "polygon");
    star.setAttribute("points", createOctagramStarPath(nx, ny, outerR, innerR));
    star.setAttribute("fill", fillGrad);
    star.setAttribute("stroke", isExactStaffMatch ? "#ffffff" : strokeColor);
    star.setAttribute("stroke-width", isExactStaffMatch ? "2.6" : (isRoot ? "2.2" : "1.4"));
    group.appendChild(star);
  } else {
    const radius = isRoot ? 13.5 : (isGhammaz ? 12.6 : 11.5);
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", String(nx));
    circle.setAttribute("cy", String(ny));
    circle.setAttribute("r", String(radius));
    circle.setAttribute("fill", fillGrad);
    circle.setAttribute("stroke", isExactStaffMatch ? "#ffffff" : strokeColor);
    circle.setAttribute("stroke-width", isExactStaffMatch ? "2.8" : (isRoot ? "2.4" : "1.4"));
    group.appendChild(circle);

    if (isRoot || isGhammaz) {
      const innerRing = document.createElementNS(SVG_NS, "circle");
      innerRing.setAttribute("cx", String(nx));
      innerRing.setAttribute("cy", String(ny));
      innerRing.setAttribute("r", String(radius - 3));
      innerRing.setAttribute("fill", "none");
      innerRing.setAttribute("stroke", "rgba(255,255,255,0.42)");
      innerRing.setAttribute("stroke-width", "0.8");
      group.appendChild(innerRing);
    }
  }

  const textEl = document.createElementNS(SVG_NS, "text");
  textEl.setAttribute("x", String(nx));
  textEl.setAttribute("y", String(ny + 3.6));
  textEl.setAttribute("text-anchor", "middle");
  textEl.setAttribute("fill", "#ffffff");
  textEl.setAttribute("font-size", labelMode === "ARABIC" ? "8.2" : "10");
  textEl.setAttribute("font-weight", "700");
  textEl.setAttribute("pointer-events", "none");
  textEl.textContent = displayText;
  group.appendChild(textEl);

  if (showPositionsMap && isSelectedActiveNote && pivotInfo && pivotInfo.isPivot) {
    const isUnisonBridge = pivotInfo.type === "UNISON_BRIDGE";
    const bx = nx - 14;
    const by = ny - 13;
    const bw = Math.max(24, pivotInfo.badge.length * 6.4 + 6);
    const bh = 14;

    const pillBg = isLight
      ? (isUnisonBridge ? "#f5eefb" : "#fbf5e6")
      : (isUnisonBridge ? "#24172e" : "#261b0e");
    const pillStroke = isLight
      ? (isUnisonBridge ? "#6b3f8c" : "#9a6515")
      : (isUnisonBridge ? "#c49be0" : "#d4a84f");

    const pivotBtnG = document.createElementNS(SVG_NS, "g");
    pivotBtnG.setAttribute("class", "pivot-pill-btn");

    const pTip = document.createElementNS(SVG_NS, "title");
    pTip.textContent = isUnisonBridge
      ? (isEn ? `Click to preview unison bridge with ${pivotInfo.targetCourse}th open course` : `Clique para ver ponte de uníssono com a ${pivotInfo.targetCourse}ª ordem solta`)
      : (isEn ? `Click to shift hand via ${pivotInfo.badge}` : `Clique para mover a posição da mão via ${pivotInfo.badge}`);
    pivotBtnG.appendChild(pTip);

    const pRect = document.createElementNS(SVG_NS, "rect");
    pRect.setAttribute("x", String(bx - bw / 2));
    pRect.setAttribute("y", String(by - bh / 2));
    pRect.setAttribute("width", String(bw));
    pRect.setAttribute("height", String(bh));
    pRect.setAttribute("rx", "4.5");
    pRect.setAttribute("fill", pillBg);
    pRect.setAttribute("stroke", pillStroke);
    pRect.setAttribute("stroke-width", "1.2");
    pivotBtnG.appendChild(pRect);

    const pTag = document.createElementNS(SVG_NS, "text");
    pTag.setAttribute("x", String(bx));
    pTag.setAttribute("y", String(by + 3));
    pTag.setAttribute("text-anchor", "middle");
    pTag.setAttribute("fill", pillStroke);
    pTag.setAttribute("font-size", "8.3");
    pTag.setAttribute("font-weight", "800");
    pTag.setAttribute("pointer-events", "none");
    pTag.textContent = pivotInfo.badge;
    pivotBtnG.appendChild(pTag);

    pivotBtnG.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (onPivotAction) {
        onPivotAction({
          type: pivotInfo.type,
          badge: pivotInfo.badge,
          targetCourse: pivotInfo.targetCourse,
          targetPosId: pivotInfo.targetPosId,
          course: courseNumber,
          qFromNut,
          absQ,
          pitchClassQ,
          freq: noteFreq
        });
      }
    });

    group.appendChild(pivotBtnG);
  }

  svg.appendChild(group);
}

/**
 * Anexa a camada dedicada `#live-pitch-layer` no topo do SVG e reaplica o último frame
 * caso a escuta pelo microfone esteja ativa durante um redesenho do espelho.
 */
function finalizeLivePitchLayer(svg, contextSnapshot) {
  lastNeckRenderContext = contextSnapshot;

  const liveLayer = document.createElementNS(SVG_NS, "g");
  liveLayer.setAttribute("id", "live-pitch-layer");
  liveLayer.setAttribute("pointer-events", "none");
  svg.appendChild(liveLayer);

  if (lastLiveDetection && lastLiveDetection.active) {
    updateLivePitchOverlayOnNeck(lastLiveDetection);
  }
}

/**
 * @param {import("../core/urlState.js").OudAppState} state
 * @param {() => void} onRosetteClick
 * @param {number} [highlightedStep=-1]
 * @param {{ absQ: number | null, pitchClassQ: number | null } | null} [selectedPitch=null]
 * @param {(noteInfo: { absQ: number, pitchClassQ: number, qFromNut: number, course: number, finger: string | number, freq: number, makeRoot?: boolean }) => void} [onNeckJewelSelect]
 * @param {ReturnType<import("../core/modalEngine.js").computeAnchoredOctavePath>} [octavePathNodes=[]]
 * @param {{ onToggleRegion?: (regionId: string) => void, onPlayRegion?: (regionId: string) => void, onPivotAction?: (payload: any) => void, playingRegionId?: string | null, highlightedRegionNodeKey?: string | null, activeShiftOverlay?: any }} [regionInteractions]
 * @returns {{ course: number, freq: number }[]}
 */
export function renderOudNeckSVG(
  state,
  onRosetteClick,
  highlightedStep = -1,
  selectedPitch = null,
  onNeckJewelSelect,
  octavePathNodes = [],
  regionInteractions = {}
) {
  const svg = /** @type {SVGElement} */ (/** @type {unknown} */ (document.getElementById("oud-neck")));
  svg.innerHTML = "";
  /** @type {{ course: number, freq: number }[]} */
  const currentChordVoicingFreqs = [];
  /** @type {{ x: number, y: number, absQ: number, modOffsetQ: number }[]} */
  const visibleActiveNodes = [];
  /** @type {Map<number, number>} */
  const coursePositions = new Map();
  /** @type {Map<number, { x: number, y: number, course: number, qFromNut: number, inBox: boolean, absQ: number }[]>} */
  const activeJewelsByAbsQ = new Map();

  const registerLiveJewel = (
    /** @type {number} */ absQ,
    /** @type {{ x: number, y: number, course: number, qFromNut: number, inBox: boolean, absQ: number }} */ entry
  ) => {
    const list = activeJewelsByAbsQ.get(absQ);
    if (list) list.push(entry);
    else activeJewelsByAbsQ.set(absQ, [entry]);
  };

  const isVert = state.orientation === "VERTICAL";
  const isEn = state.lang === "en";
  const isLight = state.theme === "light";

  const extColors = {
    courseLabel: isLight ? "#2b1e14" : "#efe6d8",
    pegboxCourseLabel: "#f3e7d3",
    semiLabel: isLight ? "#7a5320" : "#d4a84f",
    microLabel: isLight ? "#6b3f8c" : "#c49be0",
    nutTag: isLight ? "#8f5e1c" : "#c99a49",
    inlayFixed: isLight ? "#5c4e3c" : "#e2d9c8",
    inlayMicro: isLight ? "#6b3f8c" : "#c49be0"
  };

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

  const activeShift = regionInteractions?.activeShiftOverlay || null;
  const highlightedRegionKey = regionInteractions?.highlightedRegionNodeKey || null;

  const defs = document.createElementNS(SVG_NS, "defs");
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
      <stop offset="0%" stop-color="#ef6b6b" />
      <stop offset="60%" stop-color="#b92b2b" />
      <stop offset="100%" stop-color="#6e1616" />
    </radialGradient>
    <radialGradient id="ghammazGem" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#f3c969" />
      <stop offset="60%" stop-color="#c6831c" />
      <stop offset="100%" stop-color="#6d4309" />
    </radialGradient>
    <radialGradient id="fixedGem" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#7692b8" />
      <stop offset="60%" stop-color="#3b5984" />
      <stop offset="100%" stop-color="#1e3250" />
    </radialGradient>
    <radialGradient id="microGem" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#d8b4f8" />
      <stop offset="55%" stop-color="#8b4db8" />
      <stop offset="100%" stop-color="#481e6b" />
    </radialGradient>
    <marker id="sayrArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#e2b963" />
    </marker>
    <marker id="sayrArrowActive" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#c49be0" />
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
  // MODO VERTICAL (460 x 1085)
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

    const sbPath = document.createElementNS(SVG_NS, "path");
    sbPath.setAttribute(
      "d",
      `M ${leftX - 20},${bodyJointY} Q 12,${bodyJointY + 50} 12,${bodyJointY + 145} L 12,${soundboardFarY} L 446,${soundboardFarY} L 446,${bodyJointY + 145} Q 446,${bodyJointY + 50} ${rightX + 20},${bodyJointY} Z`
    );
    sbPath.setAttribute("fill", "url(#soundboardGrad)");
    sbPath.setAttribute("stroke", palette.rosetteRing);
    sbPath.setAttribute("stroke-width", "3");
    svg.appendChild(sbPath);

    const rosetteCenterY = 998;
    const raqma = document.createElementNS(SVG_NS, "path");
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

    const pegbox = document.createElementNS(SVG_NS, "polygon");
    pegbox.setAttribute("points", `${leftX - 14},${nutY} ${leftX + 4},34 ${rightX - 4},34 ${rightX + 14},${nutY}`);
    pegbox.setAttribute("fill", "#1a1310");
    pegbox.setAttribute("stroke", palette.rosetteRing);
    pegbox.setAttribute("stroke-width", "1.5");
    svg.appendChild(pegbox);

    const openRailY = getPhysicalX(0, nutY, neckLengthPx, false);
    const openZoneRect = document.createElementNS(SVG_NS, "rect");
    openZoneRect.setAttribute("x", String(leftX - 12));
    openZoneRect.setAttribute("y", String(openRailY - 17));
    openZoneRect.setAttribute("width", String((rightX - leftX) + 24));
    openZoneRect.setAttribute("height", "34");
    openZoneRect.setAttribute("rx", "6");
    openZoneRect.setAttribute("fill", "rgba(226, 217, 200, 0.06)");
    openZoneRect.setAttribute("stroke", "rgba(226, 217, 200, 0.24)");
    openZoneRect.setAttribute("stroke-dasharray", "3,3");
    svg.appendChild(openZoneRect);

    const openLbl = document.createElementNS(SVG_NS, "text");
    openLbl.setAttribute("x", String(leftX - 44));
    openLbl.setAttribute("y", String(openRailY + 3.5));
    openLbl.setAttribute("text-anchor", "middle");
    openLbl.setAttribute("fill", extColors.courseLabel);
    openLbl.setAttribute("font-size", "9.5");
    openLbl.setAttribute("font-weight", "800");
    openLbl.textContent = isEn ? "OPEN" : "SOLTA";
    svg.appendChild(openLbl);

    const neckPolygon = document.createElementNS(SVG_NS, "polygon");
    neckPolygon.setAttribute("points", `${leftX - 14},${nutY} ${rightX + 14},${nutY} ${rightX + 20},${neckEndY} ${leftX - 20},${neckEndY}`);
    neckPolygon.setAttribute("fill", "url(#ebonyGrad)");
    neckPolygon.setAttribute("stroke", palette.rosetteRing);
    neckPolygon.setAttribute("stroke-width", "2");
    svg.appendChild(neckPolygon);

    [
      { x1: leftX - 11, x2: leftX - 17 },
      { x1: rightX + 11, x2: rightX + 17 }
    ].forEach(strip => {
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", String(strip.x1));
      line.setAttribute("y1", String(nutY));
      line.setAttribute("x2", String(strip.x2));
      line.setAttribute("y2", String(neckEndY));
      line.setAttribute("stroke", "#e2d9c8");
      line.setAttribute("stroke-width", "1.8");
      line.setAttribute("stroke-dasharray", "8,4,2,4");
      line.setAttribute("opacity", "0.65");
      svg.appendChild(line);
    });

    renderRegionHoverZones(svg, state, nutY, neckLengthPx, leftX, rightX, true, isLight);

    if (state.shapeMode !== "FULL_NECK" || isChordVoicingActive) {
      const y1 = getPhysicalX(posBounds.startQ, nutY, neckLengthPx, false);
      const y2 = getPhysicalX(posBounds.endQ, nutY, neckLengthPx, false);

      const boxRect = document.createElementNS(SVG_NS, "rect");
      boxRect.setAttribute("x", String(leftX - 15));
      boxRect.setAttribute("y", String(y1 - 16));
      boxRect.setAttribute("width", String((rightX - leftX) + 30));
      boxRect.setAttribute("height", String((y2 - y1) + 32));
      boxRect.setAttribute("rx", "8");
      boxRect.setAttribute("fill", "rgba(201, 154, 73, 0.11)");
      boxRect.setAttribute("stroke", palette.rosetteRing);
      boxRect.setAttribute("stroke-width", "1.8");
      boxRect.setAttribute("stroke-dasharray", "6,4");
      svg.appendChild(boxRect);
    }

    const nutLine = document.createElementNS(SVG_NS, "line");
    nutLine.setAttribute("x1", String(leftX - 15));
    nutLine.setAttribute("y1", String(nutY));
    nutLine.setAttribute("x2", String(rightX + 15));
    nutLine.setAttribute("y2", String(nutY));
    nutLine.setAttribute("stroke", "#f5ebd8");
    nutLine.setAttribute("stroke-width", "9");
    svg.appendChild(nutLine);

    const nutBorder = document.createElementNS(SVG_NS, "line");
    nutBorder.setAttribute("x1", String(leftX - 15));
    nutBorder.setAttribute("y1", String(nutY + 4.5));
    nutBorder.setAttribute("x2", String(rightX + 15));
    nutBorder.setAttribute("y2", String(nutY + 4.5));
    nutBorder.setAttribute("stroke", "#78350f");
    nutBorder.setAttribute("stroke-width", "1.5");
    svg.appendChild(nutBorder);

    const nutTag = document.createElementNS(SVG_NS, "text");
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
      const gLine = document.createElementNS(SVG_NS, "line");
      gLine.setAttribute("x1", String(leftX - 12));
      gLine.setAttribute("y1", String(gy));
      gLine.setAttribute("x2", String(rightX + 12));
      gLine.setAttribute("y2", String(gy));
      gLine.setAttribute("stroke", isMicro ? "rgba(196, 155, 224, 0.24)" : "rgba(212, 168, 79, 0.24)");
      gLine.setAttribute("stroke-width", isMicro ? "1" : "1.4");
      if (isMicro) gLine.setAttribute("stroke-dasharray", "3,4");
      svg.appendChild(gLine);

      if (keySemitones.includes(q)) {
        const inlayDiamond = document.createElementNS(SVG_NS, "polygon");
        const ix = rightX + 23;
        inlayDiamond.setAttribute("points", `${ix},${gy - 4} ${ix + 4},${gy} ${ix},${gy + 4} ${ix - 4},${gy}`);
        inlayDiamond.setAttribute("fill", isMicro ? extColors.inlayMicro : extColors.inlayFixed);
        svg.appendChild(inlayDiamond);
      }

      if (!isMicro || state.showMicroGuides) {
        const lbl = document.createElementNS(SVG_NS, "text");
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

    renderPositionRegionsOverlay(svg, state, nutY, neckLengthPx, leftX, rightX, true, isLight, regionInteractions);

    const courseSpacingX = (rightX - leftX) / 5;
    /** @type {Map<string, { x: number, y: number }>} */
    const coordLookup = new Map();

    tuning.courses.forEach((cObj, cIdx) => {
      const posIndex = state.leftHanded ? cIdx : (5 - cIdx);
      const cx = leftX + posIndex * courseSpacingX;
      coursePositions.set(cObj.course, cx);

      const cText = document.createElementNS(SVG_NS, "text");
      cText.setAttribute("x", String(cx));
      cText.setAttribute("y", "22");
      cText.setAttribute("text-anchor", "middle");
      cText.setAttribute("fill", extColors.courseLabel);
      cText.setAttribute("font-size", "11");
      cText.setAttribute("font-weight", "800");
      cText.textContent = cObj.label.replace(" ", "");
      svg.appendChild(cText);

      if (isChordVoicingActive && chordVoicingMap && chordVoicingMap[cObj.course] === null) {
        const mText = document.createElementNS(SVG_NS, "text");
        mText.setAttribute("x", String(cx));
        mText.setAttribute("y", String(openRailY + 5));
        mText.setAttribute("text-anchor", "middle");
        mText.setAttribute("fill", "#ef6b6b");
        mText.setAttribute("font-size", "14");
        mText.setAttribute("font-weight", "800");
        mText.textContent = "✕";
        svg.appendChild(mText);
      }

      const isWoundBass = cIdx >= 3;
      [-1.5, 1.5].forEach((offsetX) => {
        const pegString = document.createElementNS(SVG_NS, "line");
        pegString.setAttribute("x1", String(cx + offsetX));
        pegString.setAttribute("y1", "34");
        pegString.setAttribute("x2", String(cx + offsetX));
        pegString.setAttribute("y2", String(nutY));
        pegString.setAttribute("stroke", isWoundBass ? "#92400e" : "#94a3b8");
        pegString.setAttribute("stroke-width", "1.1");
        pegString.setAttribute("opacity", "0.55");
        svg.appendChild(pegString);

        const sLine = document.createElementNS(SVG_NS, "line");
        sLine.setAttribute("x1", String(cx + offsetX));
        sLine.setAttribute("y1", String(nutY));
        sLine.setAttribute("x2", String(cx + offsetX));
        sLine.setAttribute("y2", String(soundboardFarY));
        sLine.setAttribute("stroke", isWoundBass ? "#c98b3c" : "#e2e8f0");
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

        const nodeKey = `${cObj.course}:${qFromNut}`;
        const isUnisonTarget = activeShift && activeShift.type === "UNISON" &&
          ((activeShift.toCourse === cObj.course && activeShift.toQ === qFromNut) ||
           (activeShift.fromCourse === cObj.course && activeShift.fromQ === qFromNut));

        const octMatch = octaveNodeMap.get(nodeKey);
        let isSelectedActiveNote = shapeEval.inBox || Boolean(isUnisonTarget);
        if (isOctaveFilterActive) {
          isSelectedActiveNote = Boolean(octMatch) || Boolean(isUnisonTarget);
        } else if (isChordVoicingActive && chordVoicingMap) {
          isSelectedActiveNote = (chordVoicingMap[cObj.course] === qFromNut) || Boolean(isUnisonTarget);
        }
        if (!isSelectedActiveNote && !state.showGhostNotes) continue;

        const noteFreq = cObj.freq_hz * Math.pow(2, (qFromNut * 50 + noteInfo.centsDev) / 1200);
        if (isChordVoicingActive && isSelectedActiveNote) {
          currentChordVoicingFreqs.push({ course: cObj.course, freq: noteFreq });
        }

        const ny = getPhysicalX(qFromNut, nutY, neckLengthPx, false);
        coordLookup.set(nodeKey, { x: cx, y: ny });
        registerLiveJewel(absQ, {
          x: cx,
          y: ny,
          course: cObj.course,
          qFromNut,
          inBox: isSelectedActiveNote,
          absQ
        });

        if (isSelectedActiveNote) {
          visibleActiveNodes.push({ x: cx, y: ny, absQ, modOffsetQ: offsetFromRoot });
        }

        const isRoot = offsetFromRoot === 0;
        const isGhammaz = activeStruct.ghammazOffsets.includes(offsetFromRoot);
        const isPlaybackStepHit = (isOctaveFilterActive && octMatch && highlightedStep === octMatch.stepIndex) ||
          (highlightedRegionKey === nodeKey);

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
          isEn,
          displayText,
          state.labelMode,
          noteFreq,
          palette,
          selectedPitch,
          onNeckJewelSelect,
          regionInteractions?.onPivotAction
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
      renderConnectedVectorTrail(svg, /** @type {any} */ (octPoints), highlightedStep, "#c49be0");
    } else if (state.mode === "MAQAM" && state.showSayr) {
      const entity = /** @type {any} */ (activeStruct.entity);
      const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
      if (phrase) renderSayrMelodicPaths(svg, visibleActiveNodes, phrase.steps, highlightedStep);
    }

    renderHandShiftOverlay(svg, state, activeShift, coordLookup, nutY, neckLengthPx, leftX, rightX, true, isLight);

    finalizeLivePitchLayer(svg, {
      isVert: true,
      isLeftHanded: state.leftHanded,
      isLight,
      isEn,
      shapeMode: state.shapeMode,
      boxAnchorQ: state.boxAnchorQ,
      tuning,
      nutCoord: nutY,
      neckLengthPx,
      coursePositions,
      activeJewelsByAbsQ
    });

    currentChordVoicingFreqs.sort((a, b) => b.course - a.course);
    return currentChordVoicingFreqs;
  }

  // =========================================================================
  // MODO HORIZONTAL (1120 x 430) — Centralizado (centerY = 220)
  // =========================================================================
  const nutX = state.leftHanded ? 945 : 175;
  const neckEndX = state.leftHanded ? 155 : 965;
  const neckLengthPx = Math.abs(neckEndX - nutX);
  const topY = 106;
  const bottomY = 334;
  const centerY = (topY + bottomY) / 2;

  const bodyJointX = getPhysicalX(10, nutX, neckLengthPx, state.leftHanded);
  const soundboardFarX = state.leftHanded ? 15 : 1105;

  const dir = state.leftHanded ? -1 : 1;
  const curveCtrlX = bodyJointX + dir * 55;
  const sbTopY = 70;
  const sbBotY = 370;

  const sbPath = document.createElementNS(SVG_NS, "path");
  sbPath.setAttribute(
    "d",
    `M ${bodyJointX},${topY - 22} Q ${curveCtrlX},${sbTopY} ${bodyJointX + dir * 160},${sbTopY} L ${soundboardFarX},${sbTopY} L ${soundboardFarX},${sbBotY} L ${bodyJointX + dir * 160},${sbBotY} Q ${curveCtrlX},${sbBotY} ${bodyJointX},${bottomY + 22} Z`
  );
  sbPath.setAttribute("fill", "url(#soundboardGrad)");
  sbPath.setAttribute("stroke", palette.rosetteRing);
  sbPath.setAttribute("stroke-width", "3");
  svg.appendChild(sbPath);

  const sbInlay = document.createElementNS(SVG_NS, "path");
  sbInlay.setAttribute(
    "d",
    `M ${bodyJointX + dir * 5},${topY - 18} Q ${curveCtrlX + dir * 4},${sbTopY + 6} ${bodyJointX + dir * 160},${sbTopY + 6} L ${soundboardFarX - dir * 6},${sbTopY + 6} L ${soundboardFarX - dir * 6},${sbBotY - 6} L ${bodyJointX + dir * 160},${sbBotY - 6} Q ${curveCtrlX + dir * 4},${sbBotY - 6} ${bodyJointX + dir * 5},${bottomY + 18}`
  );
  sbInlay.setAttribute("fill", "none");
  sbInlay.setAttribute("stroke", "#e2d9c8");
  sbInlay.setAttribute("stroke-width", "1.4");
  sbInlay.setAttribute("stroke-dasharray", "6,3");
  sbInlay.setAttribute("opacity", "0.7");
  svg.appendChild(sbInlay);

  const rosetteCenterX = state.leftHanded ? 75 : 1045;
  const raqmaStartX = neckEndX - dir * 18;
  const raqmaEndX = rosetteCenterX - dir * 48;

  const raqma = document.createElementNS(SVG_NS, "path");
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
  const pegbox = document.createElementNS(SVG_NS, "polygon");
  pegbox.setAttribute("points", `${nutX},${nutTopY} ${pegboxEndX},${topY + 4} ${pegboxEndX},${bottomY - 4} ${nutX},${nutBotY}`);
  pegbox.setAttribute("fill", "#1a1310");
  pegbox.setAttribute("stroke", palette.rosetteRing);
  pegbox.setAttribute("stroke-width", "1.5");
  svg.appendChild(pegbox);

  const openRailX = getPhysicalX(0, nutX, neckLengthPx, state.leftHanded);
  const openZoneRect = document.createElementNS(SVG_NS, "rect");
  openZoneRect.setAttribute("x", String(openRailX - 17));
  openZoneRect.setAttribute("y", String(nutTopY + 2));
  openZoneRect.setAttribute("width", "34");
  openZoneRect.setAttribute("height", String(nutBotY - nutTopY - 4));
  openZoneRect.setAttribute("rx", "6");
  openZoneRect.setAttribute("fill", "rgba(226, 217, 200, 0.06)");
  openZoneRect.setAttribute("stroke", "rgba(226, 217, 200, 0.24)");
  openZoneRect.setAttribute("stroke-dasharray", "3,3");
  svg.appendChild(openZoneRect);

  const openLbl = document.createElementNS(SVG_NS, "text");
  openLbl.setAttribute("x", String(openRailX));
  openLbl.setAttribute("y", String(bodyBotY + 28));
  openLbl.setAttribute("text-anchor", "middle");
  openLbl.setAttribute("fill", extColors.courseLabel);
  openLbl.setAttribute("font-size", "9.5");
  openLbl.setAttribute("font-weight", "800");
  openLbl.textContent = isEn ? "OPEN (0)" : "SOLTA (0)";
  svg.appendChild(openLbl);

  const neckPolygon = document.createElementNS(SVG_NS, "polygon");
  neckPolygon.setAttribute("points", `${nutX},${nutTopY} ${neckEndX},${bodyTopY} ${neckEndX},${bodyBotY} ${nutX},${nutBotY}`);
  neckPolygon.setAttribute("fill", "url(#ebonyGrad)");
  neckPolygon.setAttribute("stroke", palette.rosetteRing);
  neckPolygon.setAttribute("stroke-width", "2");
  svg.appendChild(neckPolygon);

  [
    { y1: nutTopY + 3, y2: bodyTopY + 3 },
    { y1: nutBotY - 3, y2: bodyBotY - 3 }
  ].forEach(strip => {
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", String(nutX));
    line.setAttribute("y1", String(strip.y1));
    line.setAttribute("x2", String(neckEndX));
    line.setAttribute("y2", String(strip.y2));
    line.setAttribute("stroke", "#e2d9c8");
    line.setAttribute("stroke-width", "1.8");
    line.setAttribute("stroke-dasharray", "8,4,2,4");
    line.setAttribute("opacity", "0.65");
    svg.appendChild(line);
  });

  renderRegionHoverZones(svg, state, nutX, neckLengthPx, bodyTopY, bodyBotY, false, isLight);

  if (state.shapeMode !== "FULL_NECK" || isChordVoicingActive) {
    const x1 = getPhysicalX(posBounds.startQ, nutX, neckLengthPx, state.leftHanded);
    const x2 = getPhysicalX(posBounds.endQ, nutX, neckLengthPx, state.leftHanded);
    const rectX = Math.min(x1, x2) - 16;
    const rectW = Math.abs(x2 - x1) + 32;

    const boxRect = document.createElementNS(SVG_NS, "rect");
    boxRect.setAttribute("x", String(rectX));
    boxRect.setAttribute("y", String(bodyTopY + 5));
    boxRect.setAttribute("width", String(rectW));
    boxRect.setAttribute("height", String(bodyBotY - bodyTopY - 10));
    boxRect.setAttribute("rx", "8");
    boxRect.setAttribute("fill", "rgba(201, 154, 73, 0.11)");
    boxRect.setAttribute("stroke", palette.rosetteRing);
    boxRect.setAttribute("stroke-width", "1.8");
    boxRect.setAttribute("stroke-dasharray", "6,4");
    svg.appendChild(boxRect);
  }

  const nutLine = document.createElementNS(SVG_NS, "line");
  nutLine.setAttribute("x1", String(nutX));
  nutLine.setAttribute("y1", String(nutTopY - 2));
  nutLine.setAttribute("x2", String(nutX));
  nutLine.setAttribute("y2", String(nutBotY + 2));
  nutLine.setAttribute("stroke", "#f5ebd8");
  nutLine.setAttribute("stroke-width", "9");
  svg.appendChild(nutLine);

  const nutInnerEdge = document.createElementNS(SVG_NS, "line");
  nutInnerEdge.setAttribute("x1", String(nutX + dir * 4.5));
  nutInnerEdge.setAttribute("y1", String(nutTopY - 2));
  nutInnerEdge.setAttribute("x2", String(nutX + dir * 4.5));
  nutInnerEdge.setAttribute("y2", String(nutBotY + 2));
  nutInnerEdge.setAttribute("stroke", "#78350f");
  nutInnerEdge.setAttribute("stroke-width", "1.6");
  svg.appendChild(nutInnerEdge);

  const nutTag = document.createElementNS(SVG_NS, "text");
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
    const gLine = document.createElementNS(SVG_NS, "line");
    gLine.setAttribute("x1", String(gx));
    gLine.setAttribute("y1", String(nutTopY + 6));
    gLine.setAttribute("x2", String(gx));
    gLine.setAttribute("y2", String(nutBotY - 6));
    gLine.setAttribute("stroke", isMicro ? "rgba(196, 155, 224, 0.24)" : "rgba(212, 168, 79, 0.24)");
    gLine.setAttribute("stroke-width", isMicro ? "1" : "1.4");
    if (isMicro) gLine.setAttribute("stroke-dasharray", "3,4");
    svg.appendChild(gLine);

    if (keySemitones.includes(q)) {
      const inlayDiamond = document.createElementNS(SVG_NS, "polygon");
      const iy = bodyTopY - 5;
      inlayDiamond.setAttribute("points", `${gx},${iy - 4} ${gx + 4},${iy} ${gx},${iy + 4} ${gx - 4},${iy}`);
      inlayDiamond.setAttribute("fill", isMicro ? extColors.inlayMicro : extColors.inlayFixed);
      svg.appendChild(inlayDiamond);
    }

    if (!isMicro || state.showMicroGuides) {
      const lbl = document.createElementNS(SVG_NS, "text");
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

  renderPositionRegionsOverlay(svg, state, nutX, neckLengthPx, bodyTopY, bodyBotY, false, isLight, regionInteractions);

  const courseSpacing = (bottomY - topY) / 5;
  /** @type {Map<string, { x: number, y: number }>} */
  const coordLookup = new Map();

  tuning.courses.forEach((cObj, cIdx) => {
    const cy = topY + cIdx * courseSpacing;
    coursePositions.set(cObj.course, cy);
    const courseLabelX = state.leftHanded ? nutX + 92 : nutX - 92;

    const cText = document.createElementNS(SVG_NS, "text");
    cText.setAttribute("x", String(courseLabelX));
    cText.setAttribute("y", String(cy + 4));
    cText.setAttribute("text-anchor", "middle");
    cText.setAttribute("fill", extColors.pegboxCourseLabel);
    cText.setAttribute("stroke", "#120c08");
    cText.setAttribute("stroke-width", "2.2");
    cText.setAttribute("paint-order", "stroke");
    cText.setAttribute("font-size", "11.5");
    cText.setAttribute("font-weight", "800");
    cText.textContent = cObj.label;
    svg.appendChild(cText);

    if (isChordVoicingActive && chordVoicingMap && chordVoicingMap[cObj.course] === null) {
      const mText = document.createElementNS(SVG_NS, "text");
      mText.setAttribute("x", String(openRailX));
      mText.setAttribute("y", String(cy + 5));
      mText.setAttribute("text-anchor", "middle");
      mText.setAttribute("fill", "#ef6b6b");
      mText.setAttribute("font-size", "14");
      mText.setAttribute("font-weight", "800");
      mText.textContent = "✕";
      svg.appendChild(mText);
    }

    const isWoundBass = cIdx >= 3;
    [-1.6, 1.6].forEach((offsetY) => {
      const pegString = document.createElementNS(SVG_NS, "line");
      pegString.setAttribute("x1", String(openRailX - dir * 18));
      pegString.setAttribute("y1", String(cy + offsetY));
      pegString.setAttribute("x2", String(nutX));
      pegString.setAttribute("y2", String(cy + offsetY));
      pegString.setAttribute("stroke", isWoundBass ? "#92400e" : "#94a3b8");
      pegString.setAttribute("stroke-width", "1.1");
      pegString.setAttribute("opacity", "0.55");
      svg.appendChild(pegString);

      const sLine = document.createElementNS(SVG_NS, "line");
      sLine.setAttribute("x1", String(nutX));
      sLine.setAttribute("y1", String(cy + offsetY));
      sLine.setAttribute("x2", String(soundboardFarX));
      sLine.setAttribute("y2", String(cy + offsetY));
      sLine.setAttribute("stroke", isWoundBass ? "#c98b3c" : "#e2e8f0");
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

      const nodeKey = `${cObj.course}:${qFromNut}`;
      const isUnisonTarget = activeShift && activeShift.type === "UNISON" &&
        ((activeShift.toCourse === cObj.course && activeShift.toQ === qFromNut) ||
         (activeShift.fromCourse === cObj.course && activeShift.fromQ === qFromNut));

      const octMatch = octaveNodeMap.get(nodeKey);
      let isSelectedActiveNote = shapeEval.inBox || Boolean(isUnisonTarget);
      if (isOctaveFilterActive) {
        isSelectedActiveNote = Boolean(octMatch) || Boolean(isUnisonTarget);
      } else if (isChordVoicingActive && chordVoicingMap) {
        isSelectedActiveNote = (chordVoicingMap[cObj.course] === qFromNut) || Boolean(isUnisonTarget);
      }
      if (!isSelectedActiveNote && !state.showGhostNotes) continue;

      const noteFreq = cObj.freq_hz * Math.pow(2, (qFromNut * 50 + noteInfo.centsDev) / 1200);
      if (isChordVoicingActive && isSelectedActiveNote) {
        currentChordVoicingFreqs.push({ course: cObj.course, freq: noteFreq });
      }

      const nx = getPhysicalX(qFromNut, nutX, neckLengthPx, state.leftHanded);
      coordLookup.set(nodeKey, { x: nx, y: cy });
      registerLiveJewel(absQ, {
        x: nx,
        y: cy,
        course: cObj.course,
        qFromNut,
        inBox: isSelectedActiveNote,
        absQ
      });

      if (isSelectedActiveNote) {
        visibleActiveNodes.push({ x: nx, y: cy, absQ, modOffsetQ: offsetFromRoot });
      }

      const isRoot = offsetFromRoot === 0;
      const isGhammaz = activeStruct.ghammazOffsets.includes(offsetFromRoot);
      const isPlaybackStepHit = (isOctaveFilterActive && octMatch && highlightedStep === octMatch.stepIndex) ||
        (highlightedRegionKey === nodeKey);

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
        isEn,
        displayText,
        state.labelMode,
        noteFreq,
        palette,
        selectedPitch,
        onNeckJewelSelect,
        regionInteractions?.onPivotAction
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
    renderConnectedVectorTrail(svg, /** @type {any} */ (octPoints), highlightedStep, "#c49be0");
  } else if (state.mode === "MAQAM" && state.showSayr) {
    const entity = /** @type {any} */ (activeStruct.entity);
    const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
    if (phrase) renderSayrMelodicPaths(svg, visibleActiveNodes, phrase.steps, highlightedStep);
  }

  renderHandShiftOverlay(svg, state, activeShift, coordLookup, nutX, neckLengthPx, bodyTopY, bodyBotY, false, isLight);

  finalizeLivePitchLayer(svg, {
    isVert: false,
    isLeftHanded: state.leftHanded,
    isLight,
    isEn,
    shapeMode: state.shapeMode,
    boxAnchorQ: state.boxAnchorQ,
    tuning,
    nutCoord: nutX,
    neckLengthPx,
    coursePositions,
    activeJewelsByAbsQ
  });

  currentChordVoicingFreqs.sort((a, b) => b.course - a.course);
  return currentChordVoicingFreqs;
}
