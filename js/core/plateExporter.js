// @ts-check
/**
 * Exportação Editorial de Pranchas Didáticas (PNG 2x Retina & SVG Vetorial)
 * Migrado do String Atlas (plateExporter.js) para o App Oud Visualizer (v3.13.0).
 */

const SVG_NS = "http://www.w3.org/2000/svg";

function slugify(str) {
  return String(str || "oud-prancha")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "oud-prancha";
}

function escapeXml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Constrói uma prancha SVG editorial autocontida envolvendo o #oud-neck atual.
 * @param {{
 *   title: string,
 *   subtitle: string,
 *   footerNote?: string,
 *   isLight?: boolean
 * }} meta
 */
export function buildEditorialPlateSvg(meta) {
  const neckSvg = document.getElementById("oud-neck");
  if (!neckSvg) {
    throw new Error("SVG #oud-neck não encontrado no DOM.");
  }

  const vbRaw = (neckSvg.getAttribute("viewBox") || "0 0 1120 430").trim().split(/[\s,]+/).map(Number);
  const neckW = Number.isFinite(vbRaw[2]) && vbRaw[2] > 0 ? vbRaw[2] : 1120;
  const neckH = Number.isFinite(vbRaw[3]) && vbRaw[3] > 0 ? vbRaw[3] : 430;

  const padX = 36;
  const headerH = 74;
  const footerH = 44;
  const totalW = Math.round(neckW + padX * 2);
  const totalH = Math.round(neckH + headerH + footerH + 18);

  const isLight = Boolean(meta.isLight);
  const bg = isLight ? "#f6efe2" : "#120c09";
  const cardBg = isLight ? "#fcfaf6" : "#1a120d";
  const border = isLight ? "#a67c42" : "#6f5328";
  const titleCol = isLight ? "#7a4e16" : "#e2b963";
  const subCol = isLight ? "#5e4935" : "#c5b39c";

  const clone = /** @type {SVGElement} */ (neckSvg.cloneNode(true));
  clone.querySelector("#sa-live-fx-layer")?.remove();
  clone.setAttribute("x", String(padX));
  clone.setAttribute("y", String(headerH));
  clone.setAttribute("width", String(neckW));
  clone.setAttribute("height", String(neckH));

  const wrapper = document.createElementNS(SVG_NS, "svg");
  wrapper.setAttribute("xmlns", SVG_NS);
  wrapper.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  wrapper.setAttribute("viewBox", `0 0 ${totalW} ${totalH}`);
  wrapper.setAttribute("width", String(totalW));
  wrapper.setAttribute("height", String(totalH));

  const titleSafe = escapeXml(meta.title || "App Oud Visualizer");
  const subSafe = escapeXml(meta.subtitle || "24-TET Studio");
  const footSafe = escapeXml(meta.footerNote || "App Oud Visualizer · 24-TET Studio & Luthierie");

  const chrome = document.createElementNS(SVG_NS, "g");
  chrome.innerHTML = `
    <rect x="0" y="0" width="${totalW}" height="${totalH}" fill="${bg}" />
    <rect x="14" y="14" width="${totalW - 28}" height="${totalH - 28}" rx="18" fill="${cardBg}" stroke="${border}" stroke-width="1.4" opacity="0.96" />
    <text x="${padX}" y="44" fill="${titleCol}" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700">${titleSafe}</text>
    <text x="${padX}" y="64" fill="${subCol}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12.5" font-weight="600">${subSafe}</text>
    <line x1="${padX}" y1="${totalH - footerH}" x2="${totalW - padX}" y2="${totalH - footerH}" stroke="${border}" stroke-width="0.9" opacity="0.55" />
    <text x="${padX}" y="${totalH - 19}" fill="${subCol}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="600">${footSafe}</text>
    <text x="${totalW - padX}" y="${totalH - 19}" text-anchor="end" fill="${titleCol}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="700">● Qarar  ·  ● Ghammaz / 1/4 Tom  ·  ○ Demais Graus</text>
  `;

  wrapper.appendChild(chrome);
  wrapper.appendChild(clone);

  const serializer = new XMLSerializer();
  const svgString = `<?xml version="1.0" encoding="UTF-8"?>
${serializer.serializeToString(wrapper)}`;
  const fileStem = `oud-prancha-${slugify(meta.title)}`;

  return { svgString, width: totalW, height: totalH, fileStem };
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Baixa a prancha atual em formato vetorial SVG.
 * @param {{ title: string, subtitle: string, footerNote?: string, isLight?: boolean }} meta
 */
export function exportPlateAsSvg(meta) {
  const { svgString, fileStem } = buildEditorialPlateSvg(meta);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  triggerBlobDownload(blob, `${fileStem}.svg`);
  return `${fileStem}.svg`;
}

/**
 * Baixa a prancha atual em formato PNG 2x Retina.
 * @param {{ title: string, subtitle: string, footerNote?: string, isLight?: boolean }} meta
 * @param {number} [scale=2]
 * @returns {Promise<string>}
 */
export async function exportPlateAsPng(meta, scale = 2) {
  const { svgString, width, height, fileStem } = buildEditorialPlateSvg(meta);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Falha ao rasterizar SVG da prancha."));
      image.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D indisponível.");

    ctx.scale(scale, scale);
    ctx.drawImage(/** @type {HTMLImageElement} */ (img), 0, 0, width, height);

    const pngBlob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar PNG."))), "image/png");
    });

    triggerBlobDownload(/** @type {Blob} */ (pngBlob), `${fileStem}.png`);
    return `${fileStem}.png`;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
