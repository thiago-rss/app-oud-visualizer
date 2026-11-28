// @ts-check
/**
 * diagnostics.js — Telemetria Local de Estúdio & Orçamento de Quadro (v3.20.0)
 *
 * 100% local (zero rede externa). Fornece:
 * - FrameBudgetTracker para atualizações de alta frequência (SVG / estrobo / afinador)
 * - Medição de uso do localStorage (chaves oud_*)
 * - Coleta consolidada de AudioContext, Service Worker, Cache Storage e Viewport
 */

export const FRAME_BUDGET_MS = 16.67;

/**
 * Formata bytes em representação legível (B / KB / MB).
 * @param {number} bytes
 */
export function formatBytes(bytes) {
  const safe = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
  if (safe < 1024) return `${Math.round(safe)} B`;
  if (safe < 1024 * 1024) return `${(safe / 1024).toFixed(1)} KB`;
  return `${(safe / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Monitor deslizante de orçamento de renderização em milissegundos.
 * @param {number} [windowSize=40]
 */
export function createFrameBudgetTracker(windowSize = 40) {
  const maxSamples = Math.max(5, Math.min(240, Math.trunc(windowSize) || 40));
  /** @type {number[]} */
  const samples = [];
  let totalRecorded = 0;
  let overBudgetTotal = 0;

  /**
   * @param {number} durationMs
   */
  function recordFrame(durationMs) {
    if (!Number.isFinite(durationMs) || durationMs < 0) return;
    samples.push(durationMs);
    if (samples.length > maxSamples) samples.shift();
    totalRecorded += 1;
    if (durationMs > FRAME_BUDGET_MS) overBudgetTotal += 1;
  }

  function getStats() {
    if (!samples.length) {
      return {
        samples: 0,
        totalRecorded,
        avgMs: 0,
        maxMs: 0,
        overBudgetTotal,
        budgetMs: FRAME_BUDGET_MS
      };
    }
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const v = samples[i];
      sum += v;
      if (v > peak) peak = v;
    }
    return {
      samples: samples.length,
      totalRecorded,
      avgMs: Number((sum / samples.length).toFixed(2)),
      maxMs: Number(peak.toFixed(2)),
      overBudgetTotal,
      budgetMs: FRAME_BUDGET_MS
    };
  }

  function reset() {
    samples.length = 0;
    totalRecorded = 0;
    overBudgetTotal = 0;
  }

  return { recordFrame, getStats, reset };
}

/**
 * Mede chaves e bytes aproximados (UTF-16) armazenados em localStorage.
 */
export function measureLocalStorageUsage() {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return { available: false, totalKeys: 0, oudKeys: 0, totalBytes: 0, oudBytes: 0 };
    }
    let totalBytes = 0;
    let oudBytes = 0;
    let oudKeys = 0;
    const totalKeys = window.localStorage.length;
    for (let i = 0; i < totalKeys; i++) {
      const key = window.localStorage.key(i) || "";
      const val = window.localStorage.getItem(key) || "";
      const entryBytes = (key.length + val.length) * 2;
      totalBytes += entryBytes;
      if (key.startsWith("oud_") || key.startsWith("sa_")) {
        oudKeys += 1;
        oudBytes += entryBytes;
      }
    }
    return { available: true, totalKeys, oudKeys, totalBytes, oudBytes };
  } catch {
    return { available: false, totalKeys: 0, oudKeys: 0, totalBytes: 0, oudBytes: 0 };
  }
}

/**
 * Coleta diagnóstico completo do ambiente de execução local.
 * @param {{
 *   getAudioDiag?: () => any,
 *   getFrameStats?: () => any,
 *   getState?: () => any,
 *   isPitchListening?: () => boolean
 * }} [providers]
 */
export async function collectStudioDiagnostics(providers = {}) {
  const audio = typeof providers.getAudioDiag === "function"
    ? providers.getAudioDiag()
    : { state: "unavailable" };

  const frameBudget = typeof providers.getFrameStats === "function"
    ? providers.getFrameStats()
    : { samples: 0, totalRecorded: 0, avgMs: 0, maxMs: 0, overBudgetTotal: 0, budgetMs: FRAME_BUDGET_MS };

  const storage = measureLocalStorageUsage();
  const state = typeof providers.getState === "function" ? providers.getState() : null;

  /** @type {string[]} */
  let cacheKeys = [];
  let swStatus = "unsupported";
  let swScript = "";

  try {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      const ctrl = navigator.serviceWorker.controller;
      if (ctrl) {
        swStatus = ctrl.state || "activated";
        swScript = ctrl.scriptURL || "";
      } else {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.active) {
          swStatus = reg.active.state || "active";
          swScript = reg.active.scriptURL || "";
        } else if (reg?.waiting) {
          swStatus = "waiting-update";
        } else {
          swStatus = "not-registered";
        }
      }
    }
  } catch {
    swStatus = "error";
  }

  try {
    if (typeof caches !== "undefined" && typeof caches.keys === "function") {
      cacheKeys = await caches.keys();
    }
  } catch {
    cacheKeys = [];
  }

  return {
    collectedAt: new Date().toISOString(),
    online: typeof navigator !== "undefined" ? Boolean(navigator.onLine) : true,
    viewport: typeof window !== "undefined"
      ? `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio || 1}x`
      : "headless",
    audio: {
      ...audio,
      pitchListening: Boolean(providers.isPitchListening?.())
    },
    frameBudget,
    storage: {
      ...storage,
      oudBytesLabel: formatBytes(storage.oudBytes),
      totalBytesLabel: formatBytes(storage.totalBytes)
    },
    pwa: {
      swStatus,
      swScript: swScript ? swScript.split("/").pop() : "",
      cacheKeys
    },
    session: state
      ? {
          mode: state.mode,
          entityId: state.entityId,
          tuningId: state.tuningId,
          tradition: state.tradition,
          lang: state.lang
        }
      : null
  };
}
