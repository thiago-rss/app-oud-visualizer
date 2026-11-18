// @ts-check

/**
 * @typedef {Object} OudAppState
 * @property {"pt"|"en"} lang
 * @property {"dark"|"light"} theme
 * @property {string} tradition
 * @property {"HORIZONTAL"|"VERTICAL"} orientation
 * @property {string} tuningId
 * @property {"MAQAM"|"JINS"|"SCALE"|"CHORD"|"CADENCE"} mode
 * @property {string} entityId
 * @property {number} rootQ
 * @property {number | null} anchorAbsQ
 * @property {boolean} octavePathOnly
 * @property {"ASC"|"DESC"} octavePathDir
 * @property {"ASC"|"DESC"} direction
 * @property {"FULL_NECK"|"OPEN_FIRST_POS"|"CLOSED_BOX"} shapeMode
 * @property {number} boxAnchorQ
 * @property {"ALL"|"LOWER"|"UPPER"} jinsFilter
 * @property {"NOTE_NAME"|"DEGREE"|"FINGER"|"ARABIC"} labelMode
 * @property {boolean} showSemiGuides
 * @property {boolean} showMicroGuides
 * @property {boolean} showGhostNotes
 * @property {boolean} showSayr
 * @property {number} sayrPhraseIndex
 * @property {boolean} chordVoicingOnly
 * @property {number} cadenceStepIndex
 * @property {string} iqaId
 * @property {number} bpm
 * @property {boolean} showStaff
 * @property {"SCALE"|"SAYR"} staffMode
 * @property {boolean} droneActive
 * @property {boolean} leftHanded
 */

/** @returns {OudAppState} */
export function getDefaultState() {
  return {
    lang: "pt",
    theme: "dark",
    tradition: "damascus",
    orientation: "HORIZONTAL",
    tuningId: "syrian_arabic_c_c",
    mode: "MAQAM",
    entityId: "maqam_rast",
    rootQ: 0,
    anchorAbsQ: null,
    octavePathOnly: false,
    octavePathDir: "ASC",
    direction: "ASC",
    shapeMode: "FULL_NECK",
    boxAnchorQ: 2,
    jinsFilter: "ALL",
    labelMode: "NOTE_NAME",
    showSemiGuides: true,
    showMicroGuides: true,
    showGhostNotes: true,
    showSayr: true,
    sayrPhraseIndex: 0,
    chordVoicingOnly: true,
    cadenceStepIndex: 0,
    iqaId: "iqa_maqsum",
    bpm: 96,
    showStaff: true,
    staffMode: "SCALE",
    droneActive: false,
    leftHanded: false
  };
}

/** @returns {OudAppState} */
export function getInitialStateFromUrl() {
  const state = getDefaultState();
  try {
    const savedTheme = localStorage.getItem("oud_theme_pref");
    if (savedTheme === "light" || savedTheme === "dark") {
      state.theme = savedTheme;
    }
  } catch {
    // Ignora se localStorage estiver indisponível
  }

  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return state;

  const p = new URLSearchParams(rawHash);
  if (p.get("lang") === "en" || p.get("lang") === "pt") state.lang = /** @type {"pt"|"en"} */ (p.get("lang"));
  if (p.get("th") === "light" || p.get("th") === "dark") state.theme = /** @type {"dark"|"light"} */ (p.get("th"));
  if (p.has("tr")) state.tradition = p.get("tr") || state.tradition;
  if (p.get("or") === "VERTICAL" || p.get("or") === "HORIZONTAL") state.orientation = /** @type {"HORIZONTAL"|"VERTICAL"} */ (p.get("or"));
  if (p.has("t")) state.tuningId = p.get("t") || state.tuningId;
  if (p.has("m")) state.mode = /** @type {any} */ (p.get("m"));
  if (p.has("id")) state.entityId = p.get("id") || state.entityId;

  if (p.has("r")) {
    const rVal = Number(p.get("r"));
    state.rootQ = (!Number.isNaN(rVal) && rVal >= 0 && rVal < 24) ? rVal : 0;
  }

  if (p.has("anc")) {
    const rawAnc = p.get("anc");
    if (rawAnc !== null && rawAnc.trim() !== "") {
      const ancVal = Number(rawAnc);
      if (!Number.isNaN(ancVal) && ancVal >= 0) {
        state.anchorAbsQ = ancVal;
      }
    }
  }

  if (p.has("oct")) state.octavePathOnly = p.get("oct") === "1";
  if (p.get("odir") === "DESC" || p.get("odir") === "ASC") state.octavePathDir = /** @type {"ASC"|"DESC"} */ (p.get("odir"));
  if (p.get("d") === "DESC" || p.get("d") === "ASC") state.direction = /** @type {"ASC"|"DESC"} */ (p.get("d"));
  if (p.has("sh")) state.shapeMode = /** @type {any} */ (p.get("sh"));
  if (p.has("bx")) state.boxAnchorQ = Number(p.get("bx")) || 2;
  if (p.has("jf")) state.jinsFilter = /** @type {any} */ (p.get("jf"));
  if (p.has("lb")) state.labelMode = /** @type {any} */ (p.get("lb"));
  if (p.has("gs")) state.showSemiGuides = p.get("gs") === "1";
  if (p.has("gm")) state.showMicroGuides = p.get("gm") === "1";
  if (p.has("gh")) state.showGhostNotes = p.get("gh") === "1";
  if (p.has("sy")) state.showSayr = p.get("sy") === "1";
  if (p.has("sp")) state.sayrPhraseIndex = Number(p.get("sp")) || 0;
  if (p.has("cv")) state.chordVoicingOnly = p.get("cv") === "1";
  if (p.has("cs")) state.cadenceStepIndex = Number(p.get("cs")) || 0;
  if (p.has("iq")) state.iqaId = p.get("iq") || state.iqaId;
  if (p.has("bpm")) state.bpm = Number(p.get("bpm")) || 96;
  if (p.has("st")) state.showStaff = p.get("st") === "1";
  if (p.get("sm") === "SAYR" || p.get("sm") === "SCALE") state.staffMode = /** @type {"SCALE"|"SAYR"} */ (p.get("sm"));
  if (p.get("lh") === "1") state.leftHanded = true;

  return state;
}

/** @param {OudAppState} state */
export function syncStateToUrl(state) {
  const p = new URLSearchParams();
  p.set("lang", state.lang);
  p.set("th", state.theme || "dark");
  p.set("tr", state.tradition);
  p.set("or", state.orientation);
  p.set("t", state.tuningId);
  p.set("m", state.mode);
  p.set("id", state.entityId);
  p.set("r", String(state.rootQ));
  if (typeof state.anchorAbsQ === "number" && !Number.isNaN(state.anchorAbsQ)) {
    p.set("anc", String(state.anchorAbsQ));
  }
  if (state.octavePathOnly) p.set("oct", "1");
  if (state.octavePathDir === "DESC") p.set("odir", "DESC");
  p.set("d", state.direction);
  p.set("sh", state.shapeMode);
  p.set("bx", String(state.boxAnchorQ));
  p.set("jf", state.jinsFilter);
  p.set("lb", state.labelMode);
  p.set("gs", state.showSemiGuides ? "1" : "0");
  p.set("gm", state.showMicroGuides ? "1" : "0");
  p.set("gh", state.showGhostNotes ? "1" : "0");
  p.set("sy", state.showSayr ? "1" : "0");
  p.set("sp", String(state.sayrPhraseIndex));
  p.set("cv", state.chordVoicingOnly ? "1" : "0");
  p.set("cs", String(state.cadenceStepIndex));
  p.set("iq", state.iqaId);
  p.set("bpm", String(state.bpm));
  p.set("st", state.showStaff ? "1" : "0");
  p.set("sm", state.staffMode);
  if (state.leftHanded) p.set("lh", "1");

  const fullHash = `#${p.toString()}`;
  try {
    window.history.replaceState(null, "", fullHash);
  } catch {
    // Ignora em ambientes sandboxed
  }
  return `${window.location.origin}${window.location.pathname}${fullHash}`;
}
