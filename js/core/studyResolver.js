// @ts-check

/**
 * Normaliza texto para comparação resiliente sem acentos e em caixa baixa.
 * @param {string | undefined | null} str
 * @returns {string}
 */
export function normalizeStudyKey(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Normaliza o identificador de aba do Deck (aceita "guide" como alias de "study").
 * @param {string | undefined | null} rawTab
 * @returns {"theory"|"modulation"|"study"}
 */
export function normalizeDeckTab(rawTab) {
  if (rawTab === "modulation") return "modulation";
  if (rawTab === "study" || rawTab === "guide") return "study";
  return "theory";
}

/**
 * Resolve o ID real de um Iqa' a partir de DB.iqaat (ou do <select> no DOM como fallback).
 * @param {any} db
 * @param {string | undefined} preferredId
 * @param {string | undefined} keyword
 * @param {Document | null | undefined} [doc=typeof document !== "undefined" ? document : null]
 * @returns {string | null}
 */
export function resolveStudyIqaId(db, preferredId, keyword, doc = typeof document !== "undefined" ? document : null) {
  const iqaat = db?.iqaat;
  if (Array.isArray(iqaat)) {
    if (preferredId && iqaat.some((/** @type {any} */ x) => x.id === preferredId)) {
      return preferredId;
    }
    if (keyword) {
      const normKey = normalizeStudyKey(keyword);
      const found = iqaat.find((/** @type {any} */ x) =>
        normalizeStudyKey(x.id).includes(normKey) ||
        normalizeStudyKey(x.name || "").includes(normKey)
      );
      if (found) return found.id;
    }
  }

  const selectIqa = doc ? /** @type {HTMLSelectElement | null} */ (doc.getElementById("select-iqa")) : null;
  if (selectIqa) {
    const options = Array.from(selectIqa.options);
    if (preferredId && options.some((opt) => opt.value === preferredId)) {
      return preferredId;
    }
    if (keyword) {
      const normKey = normalizeStudyKey(keyword);
      const match = options.find((opt) =>
        normalizeStudyKey(opt.value).includes(normKey) ||
        normalizeStudyKey(opt.textContent || "").includes(normKey)
      );
      if (match) return match.value;
    }
  }

  return preferredId || null;
}

/**
 * Resolve o ID real de uma afinação em DB.tunings por ID exato ou palavras-chave.
 * @param {any} db
 * @param {string | undefined} preferredId
 * @param {string[] | undefined} keywords
 * @returns {string | null}
 */
export function resolveStudyTuningId(db, preferredId, keywords) {
  const tunings = db?.tunings;
  if (!Array.isArray(tunings) || !tunings.length) return preferredId || null;
  if (preferredId && tunings.some((/** @type {any} */ x) => x.id === preferredId)) return preferredId;
  if (Array.isArray(keywords) && keywords.length) {
    const normKeys = keywords.map(normalizeStudyKey);
    const found = tunings.find((/** @type {any} */ x) => {
      const hay = normalizeStudyKey(`${x.id} ${x.name || ""} ${x.name_en || ""}`);
      return normKeys.some((k) => hay.includes(k));
    });
    if (found) return found.id;
  }
  return preferredId || null;
}

/**
 * Resolve o ID real de um Maqam, Jins, Escala, Acorde ou Cadência em DB.
 * @param {any} db
 * @param {"MAQAM"|"JINS"|"SCALE"|"CHORD"|"CADENCE"} mode
 * @param {string | undefined} preferredId
 * @param {string[] | undefined} keywords
 * @returns {string | null}
 */
export function resolveStudyEntityId(db, mode, preferredId, keywords) {
  /** @type {any[]} */
  let list = Array.isArray(db?.maqamat) ? db.maqamat : [];
  if (mode === "JINS") list = Array.isArray(db?.ajnas) ? db.ajnas : [];
  else if (mode === "SCALE") list = Array.isArray(db?.scales) ? db.scales : [];
  else if (mode === "CHORD") list = Array.isArray(db?.chords) ? db.chords : [];
  else if (mode === "CADENCE") list = Array.isArray(db?.cadences) ? db.cadences : [];

  if (!Array.isArray(list) || !list.length) return preferredId || null;
  if (preferredId && list.some((x) => x.id === preferredId)) return preferredId;
  if (Array.isArray(keywords) && keywords.length) {
    const normKeys = keywords.map(normalizeStudyKey);
    const found = list.find((x) => {
      const hay = normalizeStudyKey(`${x.id} ${x.name || ""} ${x.name_en || ""} ${x.short_symbol || ""}`);
      return normKeys.some((k) => hay.includes(k));
    });
    if (found) return found.id;
  }
  return list[0].id;
}
