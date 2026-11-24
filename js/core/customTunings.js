// @ts-check
/**
 * Gerenciador de Afinações Customizadas Salvas (Scordaturas do Oud)
 * Permite criar, editar, persistir em localStorage, importar/exportar JSON
 * e mesclar afinações de 6 ordens (12-TET ou 24-TET) com DB.tunings.
 */

export const CUSTOM_TUNINGS_STORAGE_KEY = "oud_custom_tunings_v1";

const PC24_NAMES = [
  "C", "C+", "C#", "Db-", "D", "D+", "Eb", "Eb+",
  "E", "E+", "F", "F+", "F#", "Gb-", "G", "G+",
  "Ab", "Ab+", "A", "A+", "Bb", "Bb+", "B", "B+"
];

/**
 * Calcula a frequência em A4=440 Hz a partir de nota absoluta 24-TET (C4 = 96, A4 = 114).
 * @param {number} absQ24
 * @returns {number}
 */
export function calcFreq440FromAbsQ(absQ24) {
  return Number((440 * Math.pow(2, (absQ24 - 114) / 48)).toFixed(3));
}

/**
 * Formata rótulo curto de uma ordem (ex.: "C2", "F2", "D3").
 * @param {number} absQ24
 * @returns {string}
 */
export function formatAbsQ24Label(absQ24) {
  const octave = Math.floor(absQ24 / 24);
  const pc = ((absQ24 % 24) + 24) % 24;
  return `${PC24_NAMES[pc]}${octave}`;
}

/**
 * Normaliza um objeto de afinação customizada no formato nativo de DB.tunings do Oud Visualizer.
 * @param {any} raw
 */
export function normalizeCustomTuning(raw) {
  if (!raw || typeof raw !== "object") return null;
  const name = String(raw.name || "").trim().slice(0, 60);
  if (!name) return null;

  if (!Array.isArray(raw.courses) || raw.courses.length !== 6) return null;

  const courses = raw.courses.map((c, idx) => {
    const courseNum = Number.isFinite(Number(c.course)) ? Number(c.course) : idx + 1;
    const openQ = Number.isFinite(Number(c.open_q)) ? Math.round(Number(c.open_q)) : 48;
    const clampedOpenQ = Math.min(144, Math.max(24, openQ));
    const freqHz = Number.isFinite(Number(c.freq_hz)) && Number(c.freq_hz) > 25
      ? Number(Number(c.freq_hz).toFixed(3))
      : calcFreq440FromAbsQ(clampedOpenQ);
    const label = String(c.label || formatAbsQ24Label(clampedOpenQ)).trim().slice(0, 12);
    return {
      course: courseNum,
      label,
      open_q: clampedOpenQ,
      freq_hz: freqHz
    };
  });

  const safeId = typeof raw.id === "string" && raw.id.startsWith("custom_tuning_")
    ? raw.id
    : `custom_tuning_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  return {
    id: safeId,
    name,
    isCustom: true,
    tradition: typeof raw.tradition === "string" ? raw.tradition : "damascus",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    courses
  };
}

/**
 * Carrega todas as afinações customizadas do localStorage.
 */
export function loadCustomTunings() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = window.localStorage.getItem(CUSTOM_TUNINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeCustomTuning)
      .filter((x) => Boolean(x));
  } catch {
    return [];
  }
}

/**
 * @param {any[]} list
 */
function persistCustomTunings(list) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(CUSTOM_TUNINGS_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignora falha de quota
  }
}

/**
 * Salva (cria ou atualiza) uma afinação customizada de Oud.
 * @param {any} tuningInput
 */
export function saveCustomTuning(tuningInput) {
  const normalized = normalizeCustomTuning(tuningInput);
  if (!normalized) {
    throw new Error("Afinação customizada inválida (exige nome e 6 ordens válidas).");
  }
  const existing = loadCustomTunings();
  const idx = existing.findIndex((t) => t.id === normalized.id);
  if (idx >= 0) {
    existing[idx] = normalized;
  } else {
    existing.unshift(normalized);
  }
  persistCustomTunings(existing);
  return normalized;
}

/**
 * Remove uma afinação customizada pelo ID.
 * @param {string} id
 * @returns {boolean}
 */
export function deleteCustomTuning(id) {
  const existing = loadCustomTunings();
  const next = existing.filter((t) => t.id !== id);
  if (next.length === existing.length) return false;
  persistCustomTunings(next);
  return true;
}

/**
 * Sincroniza as afinações customizadas dentro de DB.tunings sem duplicatas.
 * @param {any[]} dbTuningsArray
 */
export function mergeCustomTuningsIntoDb(dbTuningsArray) {
  if (!Array.isArray(dbTuningsArray)) return;
  for (let i = dbTuningsArray.length - 1; i >= 0; i--) {
    if (dbTuningsArray[i]?.isCustom) {
      dbTuningsArray.splice(i, 1);
    }
  }
  const customList = loadCustomTunings();
  customList.forEach((ct) => dbTuningsArray.push(ct));
}

/**
 * Exporta todas as afinações customizadas em JSON formatado para backup.
 * @returns {string}
 */
export function exportCustomTuningsJson() {
  return JSON.stringify(
    {
      schema: "oud-visualizer-custom-tunings/v1",
      exportedAt: new Date().toISOString(),
      tunings: loadCustomTunings()
    },
    null,
    2
  );
}

/**
 * Importa afinações a partir de uma string JSON de backup.
 * @param {string} jsonText
 * @returns {number}
 */
export function importCustomTuningsJson(jsonText) {
  const parsed = JSON.parse(jsonText);
  const rawList = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.tunings) ? parsed.tunings : []);
  let count = 0;
  for (const item of rawList) {
    const norm = normalizeCustomTuning(item);
    if (norm) {
      saveCustomTuning(norm);
      count += 1;
    }
  }
  return count;
}
