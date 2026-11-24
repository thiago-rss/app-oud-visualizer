// @ts-check
/**
 * Modos de Clareza do Braço (4 níveis) & Hierarquia Visual em 3 Camadas para o Oud.
 * Inspirado em String Atlas v8.9 (fretClarity.js + hierarquia em 3 tiers com escala adaptativa).
 */

export const NECK_CLARITY_MODES = Object.freeze({
  FREE: "FREE",
  POSITION: "POSITION",
  FIRST_OCTAVE: "FIRST_OCTAVE",
  FULL_NECK: "FULL_NECK"
});

export const NECK_CLARITY_STORAGE_KEY = "oud_neck_clarity_mode_v2";

export const NECK_CLARITY_LIST = Object.freeze([
  {
    id: NECK_CLARITY_MODES.FREE,
    labelPt: "Livre",
    labelEn: "Clean",
    hintPt: "Espelho limpo para afinar, explorar ou acompanhar ao vivo.",
    hintEn: "Clean fingerboard for tuning, free exploration, or live tracking.",
    shapeMode: "OPEN_FIRST_POS",
    showGhostNotes: false,
    hideScaleJewels: true
  },
  {
    id: NECK_CLARITY_MODES.POSITION,
    labelPt: "Posição",
    labelEn: "Position",
    hintPt: "Destaca a posição anatômica ativa com notas-fantasma discretas fora da janela.",
    hintEn: "Highlights the active anatomical position with subtle ghost dots outside the window.",
    shapeMode: "OPEN_FIRST_POS",
    showGhostNotes: true,
    hideScaleJewels: false
  },
  {
    id: NECK_CLARITY_MODES.FIRST_OCTAVE,
    labelPt: "1ª Oitava",
    labelEn: "1st Octave",
    hintPt: "Exibe até a região média do espelho (0–12 quartos de tom por corda).",
    hintEn: "Focuses on the lower/middle fingerboard (0–12 quarter-tones per course).",
    shapeMode: "FULL_NECK",
    maxDisplayQ: 12,
    showGhostNotes: false,
    hideScaleJewels: false
  },
  {
    id: NECK_CLARITY_MODES.FULL_NECK,
    labelPt: "Espelho Todo",
    labelEn: "Full Neck",
    hintPt: "Mapeamento completo do espelho, incluindo a 3ª Posição sobre o tampo (Jawab).",
    hintEn: "Full fingerboard mapping including 3rd Position over the soundboard (Jawab).",
    shapeMode: "FULL_NECK",
    maxDisplayQ: 24,
    showGhostNotes: false,
    hideScaleJewels: false
  }
]);

/**
 * Normaliza o modo de clareza.
 * @param {string | null | undefined} value
 * @returns {"FREE"|"POSITION"|"FIRST_OCTAVE"|"FULL_NECK"}
 */
export function normalizeNeckClarityMode(value) {
  if (
    value === NECK_CLARITY_MODES.FREE ||
    value === NECK_CLARITY_MODES.POSITION ||
    value === NECK_CLARITY_MODES.FIRST_OCTAVE ||
    value === NECK_CLARITY_MODES.FULL_NECK
  ) {
    return value;
  }
  return NECK_CLARITY_MODES.POSITION;
}

/**
 * Carrega o modo de clareza salvo no localStorage.
 * @returns {"FREE"|"POSITION"|"FIRST_OCTAVE"|"FULL_NECK"}
 */
export function loadNeckClarityMode() {
  const hash = (typeof window !== "undefined" && typeof window.location?.hash === "string")
    ? window.location.hash
    : "";
  const idMatch = hash.match(/(?:^|[#&])id=([^&]+)/);
  const hasExplicitNonDefaultEntity = Boolean(idMatch && idMatch[1] && idMatch[1] !== "maqam_rast");
  const defaultMode = hasExplicitNonDefaultEntity ? NECK_CLARITY_MODES.POSITION : NECK_CLARITY_MODES.FREE;
  try {
    if (typeof window === "undefined" || !window.localStorage) return defaultMode;
    const saved = window.localStorage.getItem(NECK_CLARITY_STORAGE_KEY);
    if (!saved) return defaultMode;
    return normalizeNeckClarityMode(saved);
  } catch {
    return defaultMode;
  }
}

/**
 * Salva o modo de clareza no localStorage.
 * @param {string} mode
 * @returns {"FREE"|"POSITION"|"FIRST_OCTAVE"|"FULL_NECK"}
 */
export function saveNeckClarityMode(mode) {
  const normalized = normalizeNeckClarityMode(mode);
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(NECK_CLARITY_STORAGE_KEY, normalized);
    }
  } catch {
    // Ignora storage bloqueado
  }
  return normalized;
}

/**
 * Calcula a hierarquia gráfica em 3 camadas para cada joia do braço do Oud:
 * - Tier 1 (Qarar / Tônica): raio maior (13px), sólido, anel único limpo.
 * - Tier 2 (Ghammaz / Microtom / Grau Característico): raio médio (10.9px), sólido.
 * - Tier 3 (Demais graus estruturais): raio compacto (9.2px), centro translúcido + anel nítido.
 *
 * Também aplica escala adaptativa nas regiões agudas (qFromNut >= 12) para evitar colisão visual.
 *
 * @param {{
 *   isRoot?: boolean,
 *   isGhammaz?: boolean,
 *   isMicrotone?: boolean,
 *   isCharacteristic?: boolean,
 *   inBox?: boolean,
 *   qFromNut?: number,
 *   clarityMode?: string
 * }} params
 */
export function computeJewelVisualTier(params) {
  const clarity = normalizeNeckClarityMode(params?.clarityMode);
  const qFromNut = Number.isFinite(params?.qFromNut) ? Number(params.qFromNut) : 0;
  const inBox = params?.inBox !== false;

  const highNeckScale = qFromNut >= 16 ? 0.84 : (qFromNut >= 12 ? 0.92 : 1.0);

  if (clarity === NECK_CLARITY_MODES.FREE) {
    return {
      visible: false,
      tier: 0,
      radius: 0,
      fillOpacity: 0,
      strokeWidth: 0,
      isGhost: false,
      ringOnly: false
    };
  }

  if (clarity === NECK_CLARITY_MODES.FIRST_OCTAVE && qFromNut > 12) {
    return {
      visible: false,
      tier: 0,
      radius: 0,
      fillOpacity: 0,
      strokeWidth: 0,
      isGhost: false,
      ringOnly: false
    };
  }

  if (clarity === NECK_CLARITY_MODES.POSITION && !inBox) {
    return {
      visible: true,
      tier: 0,
      radius: Number((4.2 * highNeckScale).toFixed(2)),
      fillOpacity: 0.24,
      strokeWidth: 1,
      isGhost: true,
      ringOnly: false
    };
  }

  if (params?.isRoot) {
    return {
      visible: true,
      tier: 1,
      radius: Number((13.0 * highNeckScale).toFixed(2)),
      fillOpacity: 1.0,
      strokeWidth: 1.8,
      isGhost: false,
      ringOnly: false
    };
  }

  if (params?.isGhammaz || params?.isMicrotone || params?.isCharacteristic) {
    return {
      visible: true,
      tier: 2,
      radius: Number((10.9 * highNeckScale).toFixed(2)),
      fillOpacity: 0.96,
      strokeWidth: 1.6,
      isGhost: false,
      ringOnly: false
    };
  }

  return {
    visible: true,
    tier: 3,
    radius: Number((9.2 * highNeckScale).toFixed(2)),
    fillOpacity: 0.26,
    strokeWidth: 2.0,
    isGhost: false,
    ringOnly: true
  };
}
