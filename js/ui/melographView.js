// @ts-check
/**
 * Melógrafo ao Vivo & Raio-X de Taqsim (v3.17.0)
 * Inspirado no String Atlas: analisa a performance em tempo real via detector YIN,
 * registra um rastro contínuo de cents/alturas, monta um Heatmap por Pitch Class 24-TET
 * e exibe estatísticas de desvio médio em cents por grau.
 */

import { showToast } from "./toastView.js";

/**
 * @param {any} deps
 */
export function createMelographController(deps) {
  let recording = false;
  let startedAt = 0;
  let lastRecordTs = 0;
  /** @type {{ ts: number, pcq: number, label: string, cents: number, status: string, freqHz: number }[]} */
  let samples = [];
  /** @type {Map<number, { count: number, sumCents: number, inTuneCount: number, label: string, micro: boolean }>} */
  const heatMap = new Map();

  const isEn = () => deps.getState?.()?.lang === "en";

  function resetSession() {
    samples = [];
    heatMap.clear();
    startedAt = Date.now();
    lastRecordTs = 0;
  }

  function toggleRecording() {
    if (!recording) {
      recording = true;
      resetSession();
      renderMelographBar();
      showToast(
        isEn()
          ? "Taqsim X-Ray recording started — play on your Oud!"
          : "Raio-X de Taqsim gravando — improvise no Oud!",
        { type: "success", icon: "📈", durationMs: 1900 }
      );
    } else {
      recording = false;
      renderMelographBar();
      const total = samples.length;
      showToast(
        isEn()
          ? `X-Ray paused (${total} pitch samples captured)`
          : `Raio-X pausado (${total} amostras capturadas)`,
        { type: "info", icon: "■", durationMs: 2000 }
      );
    }
  }

  function clearSession() {
    recording = false;
    resetSession();
    renderMelographBar();
    showToast(isEn() ? "X-Ray data cleared" : "Dados do Raio-X limpos", { type: "info", durationMs: 1400 });
  }

  /**
   * @param {any} detection
   */
  function onLiveDetection(detection) {
    if (!recording || !detection || !detection.active) return;
    if (detection.status === "OUT_OF_SCALE") return;

    const now = Date.now();
    if (now - lastRecordTs < 110) return;
    lastRecordTs = now;

    const pcs = deps.getPitchClasses24?.() || [];
    const pcqRaw = Number.isFinite(detection.pitchClassQ)
      ? Number(detection.pitchClassQ)
      : (Number.isFinite(detection.absQ) ? ((Number(detection.absQ) % 24) + 24) % 24 : 0);
    const pcq = ((Math.round(pcqRaw) % 24) + 24) % 24;
    const pcObj = pcs[pcq] || {};
    const label = detection.noteName || pcObj.flat || String(pcq);
    const cents = Number.isFinite(detection.centsOff)
      ? Number(detection.centsOff)
      : (Number.isFinite(detection.cents) ? Number(detection.cents) : 0);
    const freqHz = Number.isFinite(detection.freqHz) ? Number(detection.freqHz) : 0;

    samples.push({
      ts: now,
      pcq,
      label,
      cents: Math.round(cents * 10) / 10,
      status: detection.status || "CLOSE",
      freqHz
    });
    if (samples.length > 240) {
      samples = samples.slice(-240);
    }

    const prev = heatMap.get(pcq) || {
      count: 0,
      sumCents: 0,
      inTuneCount: 0,
      label,
      micro: Boolean(pcObj.micro)
    };
    prev.count += 1;
    prev.sumCents += cents;
    if (detection.status === "IN_TUNE") prev.inTuneCount += 1;
    prev.label = label;
    prev.micro = Boolean(pcObj.micro);
    heatMap.set(pcq, prev);

    renderMelographBar();
  }

  function buildSparklineSvg() {
    if (samples.length < 2) {
      return `<div class="sa-melo-empty">${isEn() ? "Play notes with Mic / Line on to draw the real-time pitch curve..." : "Ligue Mic / Linha e toque no Oud para traçar a curva contínua em cents..."}</div>`;
    }

    const w = 360;
    const h = 54;
    const midY = h / 2;
    const slice = samples.slice(-64);
    const stepX = w / Math.max(1, slice.length - 1);

    const pts = slice.map((s, idx) => {
      const clampedC = Math.max(-50, Math.min(50, s.cents));
      const x = idx * stepX;
      const y = midY - (clampedC / 50) * (h * 0.42);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `
      <svg class="sa-melo-svg" viewBox="0 0 ${w} ${h}" aria-hidden="true">
        <line x1="0" y1="${midY}" x2="${w}" y2="${midY}" stroke="rgba(226,185,99,0.28)" stroke-dasharray="3,3" stroke-width="1" />
        <polyline fill="none" stroke="#e2b963" stroke-width="2" points="${pts.join(" ")}" />
      </svg>
    `;
  }

  function buildHeatmapChipsHtml() {
    if (!heatMap.size) return "";
    const en = isEn();
    const sorted = Array.from(heatMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);

    return sorted
      .map(([, info]) => {
        const avgCents = Math.round(info.sumCents / Math.max(1, info.count));
        const signed = avgCents > 0 ? `+${avgCents}¢` : `${avgCents}¢`;
        const microCls = info.micro ? "is-micro" : "";
        return `<span class="sa-heat-chip ${microCls}" title="${en ? "Hits" : "Toques"}: ${info.count} · ${en ? "Avg drift" : "Média"}: ${signed}">
          <strong>${info.label}</strong> <small>${signed} (${info.count}×)</small>
        </span>`;
      })
      .join("");
  }

  function renderMelographBar() {
    if (typeof document === "undefined") return;
    const host =
      document.querySelector(".neck-showcase") ||
      document.querySelector(".fretboard-panel") ||
      document.querySelector("main");
    if (!host) return;

    let bar = document.getElementById("sa-melograph-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "sa-melograph-bar";
      bar.className = "sa-melograph-bar";
      host.appendChild(bar);
    }

    const en = isEn();
    const elapsedSec = recording && startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 0;
    const totalHits = samples.length;
    const inTuneHits = samples.filter((s) => s.status === "IN_TUNE").length;
    const accPct = totalHits > 0 ? Math.round((inTuneHits / totalHits) * 100) : 0;
    const avgAbsCents = totalHits > 0
      ? (samples.reduce((acc, s) => acc + Math.abs(s.cents), 0) / totalHits).toFixed(1)
      : "0.0";

    bar.innerHTML = `
      <div class="sa-melo-header">
        <div class="sa-melo-title-group">
          <span class="sa-toolbar-label">📈 ${en ? "Taqsim X-Ray & Melograph" : "Raio-X de Taqsim & Melógrafo"}</span>
          <span class="sa-melo-metrics">
            ${en ? "Samples" : "Amostras"}: <strong>${totalHits}</strong> ·
            ${en ? "In-tune" : "Na afinação"}: <strong>${accPct}%</strong> ·
            ${en ? "Mean |¢|" : "Média |¢|"}: <strong>${avgAbsCents}¢</strong>
            ${recording ? ` · <strong>${elapsedSec}s</strong>` : ""}
          </span>
        </div>
        <div class="sa-melo-actions">
          <button type="button" id="sa-btn-melo-rec" class="sa-mini-chip ${recording ? "is-active" : ""}">
            ${recording ? (en ? "■ Stop X-Ray" : "■ Pausar Raio-X") : (en ? "● Record X-Ray" : "● Gravar Raio-X")}
          </button>
          <button type="button" id="sa-btn-melo-clear" class="sa-mini-chip">✕</button>
        </div>
      </div>

      <div class="sa-melo-body">
        ${buildSparklineSvg()}
        <div class="sa-melo-heatmap">${buildHeatmapChipsHtml()}</div>
      </div>
    `;

    bar.querySelector("#sa-btn-melo-rec")?.addEventListener("click", toggleRecording);
    bar.querySelector("#sa-btn-melo-clear")?.addEventListener("click", clearSession);
  }

  renderMelographBar();

  return {
    renderMelographBar,
    onLiveDetection,
    toggleRecording,
    clearSession
  };
}
