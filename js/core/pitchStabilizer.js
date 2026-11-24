// @ts-check
/**
 * PitchStabilizer, Diapasão Global A4 (415–446 Hz), Estrobo (±4¢) e Rastro de Notas (Trail)
 * Adaptado dos conceitos do String Atlas v8.8–v8.10 para o App Oud Visualizer (24-TET).
 */

export const MIN_A4_HZ = 415;
export const MAX_A4_HZ = 446;
export const DEFAULT_A4_HZ = 440;
export const A4_PRESETS = Object.freeze([415, 432, 440, 442]);
export const A4_STORAGE_KEY = "oud_reference_a4_hz";
export const STROBE_STORAGE_KEY = "oud_tuner_strobe_mode";

export const STROBE_LOCK_CENTS = 4;
export const LOW_FREQ_MEDIAN_THRESHOLD_HZ = 115;
export const JUMP_SNAP_CENTS = 70;

/**
 * Normaliza e restringe o diapasão de referência A4 ao intervalo [415, 446] Hz.
 * @param {number | string | null | undefined} value
 * @returns {number}
 */
export function clampA4Hz(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_A4_HZ;
  return Math.min(MAX_A4_HZ, Math.max(MIN_A4_HZ, Math.round(num * 10) / 10));
}

/**
 * Carrega o diapasão A4 salvo no localStorage com fallback seguro para 440 Hz.
 * @returns {number}
 */
export function loadSavedA4Hz() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return DEFAULT_A4_HZ;
    const raw = window.localStorage.getItem(A4_STORAGE_KEY);
    if (raw === null) return DEFAULT_A4_HZ;
    return clampA4Hz(raw);
  } catch {
    return DEFAULT_A4_HZ;
  }
}

/**
 * Persiste o diapasão A4 no localStorage.
 * @param {number} a4Hz
 * @returns {number}
 */
export function saveA4Hz(a4Hz) {
  const clamped = clampA4Hz(a4Hz);
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(A4_STORAGE_KEY, String(clamped));
    }
  } catch {
    // Ignora falha de quota/privacidade
  }
  return clamped;
}

/**
 * Converte uma frequência calibrada em A4 = 440 Hz para o diapasão A4 escolhido.
 * @param {number} freqAt440Hz
 * @param {number} [a4Hz=440]
 * @returns {number}
 */
export function scaleFreqToA4(freqAt440Hz, a4Hz = DEFAULT_A4_HZ) {
  if (!Number.isFinite(freqAt440Hz) || freqAt440Hz <= 0) return 0;
  return freqAt440Hz * (clampA4Hz(a4Hz) / DEFAULT_A4_HZ);
}

/**
 * Converte uma frequência medida no diapasão A4 ativo de volta para a base A4 = 440 Hz.
 * @param {number} measuredFreqHz
 * @param {number} [a4Hz=440]
 * @returns {number}
 */
export function normalizeFreqFromA4To440(measuredFreqHz, a4Hz = DEFAULT_A4_HZ) {
  if (!Number.isFinite(measuredFreqHz) || measuredFreqHz <= 0) return 0;
  return measuredFreqHz * (DEFAULT_A4_HZ / clampA4Hz(a4Hz));
}

/**
 * Calcula a frequência em Hz de uma altura absoluta em 24-TET (onde C4 = 96, A4 = 114).
 * @param {number} absQ24
 * @param {number} [a4Hz=440]
 * @returns {number}
 */
export function absQ24ToFreqHz(absQ24, a4Hz = DEFAULT_A4_HZ) {
  const deltaQuarterTones = absQ24 - 114;
  return clampA4Hz(a4Hz) * Math.pow(2, deltaQuarterTones / 48);
}

/**
 * Calcula a telemetria óptica do Modo Estroboscópico (±4¢).
 * Quando |cents| <= 4¢, as faixas ópticas travam imóveis em destaque de afinação perfeita.
 * @param {number} cents
 * @param {number} [lockThreshold=STROBE_LOCK_CENTS]
 */
export function computeStrobeTelemetry(cents, lockThreshold = STROBE_LOCK_CENTS) {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  const absCents = Math.abs(safeCents);
  const locked = absCents <= lockThreshold;
  const bandSpeed = locked ? 0 : Math.min(1, (absCents - lockThreshold) / 46);
  const driftDirection = locked ? 0 : (safeCents > 0 ? 1 : -1);
  return {
    locked,
    lockThreshold,
    cents: safeCents,
    absCents,
    bandSpeed,
    driftDirection
  };
}

/**
 * @param {number[]} values
 * @returns {number | null}
 */
function medianOf(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Estabilizador adaptativo de altura com foco nos bordões graves do Oud (< 115 Hz: C2, D2, F2, G2),
 * snap imediato em saltos melódicos > 70¢ e histerese contra oscilação entre notas vizinhas.
 */
export class PitchStabilizer {
  /**
   * @param {{
   *   lowFreqThresholdHz?: number,
   *   lowFreqWindow?: number,
   *   midFreqWindow?: number,
   *   jumpSnapCents?: number,
   *   smoothingAlpha?: number,
   *   switchHysteresisFrames?: number
   * }} [options]
   */
  constructor(options = {}) {
    this.lowFreqThresholdHz = options.lowFreqThresholdHz ?? LOW_FREQ_MEDIAN_THRESHOLD_HZ;
    this.lowFreqWindow = options.lowFreqWindow ?? 7;
    this.midFreqWindow = options.midFreqWindow ?? 4;
    this.jumpSnapCents = options.jumpSnapCents ?? JUMP_SNAP_CENTS;
    this.smoothingAlpha = options.smoothingAlpha ?? 0.34;
    this.switchHysteresisFrames = options.switchHysteresisFrames ?? 3;

    /** @type {number[]} */
    this._freqHistory = [];
    /** @type {number | null} */
    this._smoothedHz = null;
    /** @type {string | null} */
    this._activeCandidateKey = null;
    /** @type {string | null} */
    this._pendingCandidateKey = null;
    this._pendingFrames = 0;
  }

  reset() {
    this._freqHistory = [];
    this._smoothedHz = null;
    this._activeCandidateKey = null;
    this._pendingCandidateKey = null;
    this._pendingFrames = 0;
  }

  /**
   * Suaviza a frequência bruta detectada pelo algoritmo YIN.
   * @param {number} rawHz
   * @returns {number}
   */
  stabilizeFrequency(rawHz) {
    if (!Number.isFinite(rawHz) || rawHz <= 0) {
      return this._smoothedHz ?? 0;
    }

    if (this._smoothedHz === null || this._smoothedHz <= 0) {
      this._smoothedHz = rawHz;
      this._freqHistory = [rawHz];
      return rawHz;
    }

    // Verifica salto intencional (> 70¢) ANTES do filtro de mediana para resposta imediata na troca de corda
    const rawJumpCents = Math.abs(1200 * Math.log2(rawHz / this._smoothedHz));
    if (rawJumpCents > this.jumpSnapCents) {
      this._smoothedHz = rawHz;
      this._freqHistory = [rawHz];
      return rawHz;
    }

    const isLow = rawHz < this.lowFreqThresholdHz;
    const maxLen = isLow ? this.lowFreqWindow : this.midFreqWindow;

    this._freqHistory.push(rawHz);
    while (this._freqHistory.length > maxLen) {
      this._freqHistory.shift();
    }

    const medHz = medianOf(this._freqHistory) ?? rawHz;
    const alpha = isLow ? Math.min(this.smoothingAlpha, 0.24) : this.smoothingAlpha;
    this._smoothedHz = this._smoothedHz + alpha * (medHz - this._smoothedHz);
    return this._smoothedHz;
  }

  /**
   * Aplica histerese de quadros para evitar troca prematura de alvo em leituras limítrofes.
   * @param {string | null} candidateKey
   * @returns {string | null}
   */
  stabilizeCandidateKey(candidateKey) {
    if (!candidateKey) {
      this._pendingCandidateKey = null;
      this._pendingFrames = 0;
      this._activeCandidateKey = null;
      return null;
    }

    if (this._activeCandidateKey === null) {
      this._activeCandidateKey = candidateKey;
      this._pendingCandidateKey = null;
      this._pendingFrames = 0;
      return this._activeCandidateKey;
    }

    if (candidateKey === this._activeCandidateKey) {
      this._pendingCandidateKey = null;
      this._pendingFrames = 0;
      return this._activeCandidateKey;
    }

    if (this._pendingCandidateKey === candidateKey) {
      this._pendingFrames += 1;
    } else {
      this._pendingCandidateKey = candidateKey;
      this._pendingFrames = 1;
    }

    if (this._pendingFrames >= this.switchHysteresisFrames) {
      this._activeCandidateKey = candidateKey;
      this._pendingCandidateKey = null;
      this._pendingFrames = 0;
    }

    return this._activeCandidateKey;
  }
}

/**
 * Rastro das últimas N alturas tocadas (Trail) para feedback melódico/Sayr em tempo real.
 */
export class NoteTrailTracker {
  /**
   * @param {number} [maxItems=5]
   * @param {number} [holdMs=4800]
   */
  constructor(maxItems = 5, holdMs = 4800) {
    this.maxItems = maxItems;
    this.holdMs = holdMs;
    /** @type {{ key: string, label: string, cents: number, status: string, absQ?: number | null, timestamp: number }[]} */
    this.items = [];
  }

  clear() {
    this.items = [];
  }

  /**
   * @param {{ key: string, label: string, cents: number, status: string, absQ?: number | null }} entry
   * @param {number} [now=Date.now()]
   */
  push(entry, now = Date.now()) {
    if (!entry || !entry.key) return this.items;
    this.prune(now);
    const top = this.items[0];
    if (top && top.key === entry.key && now - top.timestamp < 360) {
      top.cents = entry.cents;
      top.status = entry.status;
      top.timestamp = now;
      return this.items;
    }
    this.items = [
      { ...entry, timestamp: now },
      ...this.items.filter((item) => item.key !== entry.key)
    ].slice(0, this.maxItems);
    return this.items;
  }

  prune(now = Date.now()) {
    this.items = this.items.filter((item) => now - item.timestamp <= this.holdMs);
    return this.items;
  }

  getAll(now = Date.now()) {
    return this.prune(now);
  }
}
