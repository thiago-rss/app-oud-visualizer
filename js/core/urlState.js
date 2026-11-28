// @ts-check
import { DB } from "./database.js";

/**
* @typedef {Object} OudAppState
* @property {"pt"|"en"} lang
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
* @property {"FULL_NECK"|"OPEN_FIRST_POS"|"POS_SECOND"|"POS_THIRD_BODY"|"CLOSED_BOX"} shapeMode
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

const VALID_TRADITIONS = new Set(["damascus", "cairo", "istanbul"]);
const VALID_ORIENTATIONS = new Set(["HORIZONTAL", "VERTICAL"]);
const VALID_MODES = new Set(["MAQAM", "JINS", "SCALE", "CHORD", "CADENCE"]);
const VALID_DIRS = new Set(["ASC", "DESC"]);
const VALID_SHAPES = new Set(["FULL_NECK", "OPEN_FIRST_POS", "POS_SECOND", "POS_THIRD_BODY", "CLOSED_BOX"]);
const VALID_JINS_FILTERS = new Set(["ALL", "LOWER", "UPPER"]);
const VALID_LABEL_MODES = new Set(["NOTE_NAME", "DEGREE", "FINGER", "ARABIC"]);
const VALID_STAFF_MODES = new Set(["SCALE", "SAYR"]);

/**
* Converte um valor em inteiro limitado ao intervalo [min, max].
* @param {string | null} raw
* @param {number} fallback
* @param {number} min
* @param {number} max
* @returns {number}
*/
function parseBoundedInt(raw, fallback, min, max) {
if (raw === null || raw.trim() === "") return fallback;
const num = Number(raw);
if (!Number.isFinite(num)) return fallback;
const truncated = Math.trunc(num);
return Math.min(max, Math.max(min, truncated));
}

/**
* Verifica se um ID existe em uma coleção do banco de dados.
* @param {Array<{ id?: string }> | undefined} list
* @param {string | null} candidate
* @param {string} fallback
* @returns {string}
*/
function sanitizeCatalogId(list, candidate, fallback) {
if (!candidate || typeof candidate !== "string") return fallback;
const clean = candidate.trim();
if (!clean || clean.length > 80) return fallback;
if (!Array.isArray(list) || list.length === 0) return clean;
return list.some(item => item && item.id === clean) ? clean : fallback;
}

/** @returns {OudAppState} */
export function getDefaultState() {
return {
lang: "pt",
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
const rawHash = window.location.hash.replace(/^#/, "");
if (!rawHash) return state;

const p = new URLSearchParams(rawHash);
const langParam = p.get("lang");
if (langParam === "en" || langParam === "pt") state.lang = langParam;

const trParam = p.get("tr");
if (trParam && VALID_TRADITIONS.has(trParam)) state.tradition = trParam;

const orParam = p.get("or");
if (orParam && VALID_ORIENTATIONS.has(orParam)) {
state.orientation = /** @type {"HORIZONTAL"|"VERTICAL"} */ (orParam);
}

state.tuningId = sanitizeCatalogId(DB.tunings, p.get("t"), state.tuningId);

const modeParam = p.get("m");
if (modeParam && VALID_MODES.has(modeParam)) {
state.mode = /** @type {"MAQAM"|"JINS"|"SCALE"|"CHORD"|"CADENCE"} */ (modeParam);
}

const entParam = p.get("id");
if (entParam && typeof entParam === "string" && entParam.trim().length > 0 && entParam.trim().length <= 80) {
state.entityId = entParam.trim();
}

state.rootQ = parseBoundedInt(p.get("r"), state.rootQ, 0, 23);

if (p.has("anc")) {
const ancVal = Number(p.get("anc"));
if (Number.isFinite(ancVal)) {
  state.anchorAbsQ = Math.min(240, Math.max(-48, Math.trunc(ancVal)));
}
}

if (p.has("oct")) state.octavePathOnly = p.get("oct") === "1";

const odirParam = p.get("odir");
if (odirParam && VALID_DIRS.has(odirParam)) {
state.octavePathDir = /** @type {"ASC"|"DESC"} */ (odirParam);
}

const dirParam = p.get("d");
if (dirParam && VALID_DIRS.has(dirParam)) {
state.direction = /** @type {"ASC"|"DESC"} */ (dirParam);
}

const shapeParam = p.get("sh");
if (shapeParam && VALID_SHAPES.has(shapeParam)) {
state.shapeMode = /** @type {"FULL_NECK"|"OPEN_FIRST_POS"|"POS_SECOND"|"POS_THIRD_BODY"|"CLOSED_BOX"} */ (shapeParam);
}

state.boxAnchorQ = parseBoundedInt(p.get("bx"), state.boxAnchorQ, 1, 10);

const jfParam = p.get("jf");
if (jfParam && VALID_JINS_FILTERS.has(jfParam)) {
state.jinsFilter = /** @type {"ALL"|"LOWER"|"UPPER"} */ (jfParam);
}

const lbParam = p.get("lb");
if (lbParam && VALID_LABEL_MODES.has(lbParam)) {
state.labelMode = /** @type {"NOTE_NAME"|"DEGREE"|"FINGER"|"ARABIC"} */ (lbParam);
}

if (p.has("gs")) state.showSemiGuides = p.get("gs") === "1";
if (p.has("gm")) state.showMicroGuides = p.get("gm") === "1";
if (p.has("gh")) state.showGhostNotes = p.get("gh") === "1";
if (p.has("sy")) state.showSayr = p.get("sy") === "1";

state.sayrPhraseIndex = parseBoundedInt(p.get("sp"), state.sayrPhraseIndex, 0, 4);
if (p.has("cv")) state.chordVoicingOnly = p.get("cv") === "1";
state.cadenceStepIndex = parseBoundedInt(p.get("cs"), state.cadenceStepIndex, 0, 24);

state.iqaId = sanitizeCatalogId(DB.iqaat, p.get("iq"), state.iqaId);
state.bpm = parseBoundedInt(p.get("bpm"), state.bpm, 50, 175);

if (p.has("st")) state.showStaff = p.get("st") === "1";

const smParam = p.get("sm");
if (smParam && VALID_STAFF_MODES.has(smParam)) {
state.staffMode = /** @type {"SCALE"|"SAYR"} */ (smParam);
}

if (p.has("lh")) state.leftHanded = p.get("lh") === "1";

return state;
}

/**
 * Extrai o identificador de lição (?/#les=...) do hash atual, se presente.
 * @returns {string | null}
 */
export function getStudyLessonIdFromHash() {
  if (typeof window === "undefined" || !window.location?.hash) return null;
  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return null;
  const p = new URLSearchParams(rawHash);
  const les = p.get("les");
  if (!les) return null;
  const clean = les.trim();
  return clean.length > 0 && clean.length <= 80 ? clean : null;
}

/**
 * @param {OudAppState} state
 * @param {{ lessonId?: string | null }} [opts]
 */
export function syncStateToUrl(state, opts = {}) {
const p = new URLSearchParams();
p.set("lang", state.lang);
p.set("tr", state.tradition);
p.set("or", state.orientation);
p.set("t", state.tuningId);
p.set("m", state.mode);
p.set("id", state.entityId);
p.set("r", String(parseBoundedInt(String(state.rootQ), 0, 0, 23)));
if (state.anchorAbsQ !== null && Number.isFinite(state.anchorAbsQ)) {
p.set("anc", String(Math.trunc(state.anchorAbsQ)));
}
if (state.octavePathOnly) p.set("oct", "1");
if (state.octavePathDir !== "ASC") p.set("odir", state.octavePathDir);
p.set("d", state.direction);
p.set("sh", state.shapeMode);
p.set("bx", String(parseBoundedInt(String(state.boxAnchorQ), 2, 1, 10)));
p.set("jf", state.jinsFilter);
p.set("lb", state.labelMode);
p.set("gs", state.showSemiGuides ? "1" : "0");
p.set("gm", state.showMicroGuides ? "1" : "0");
p.set("gh", state.showGhostNotes ? "1" : "0");
p.set("sy", state.showSayr ? "1" : "0");
p.set("sp", String(parseBoundedInt(String(state.sayrPhraseIndex), 0, 0, 4)));
p.set("cv", state.chordVoicingOnly ? "1" : "0");
p.set("cs", String(parseBoundedInt(String(state.cadenceStepIndex), 0, 0, 24)));
p.set("iq", state.iqaId);
p.set("bpm", String(parseBoundedInt(String(state.bpm), 96, 50, 175)));
p.set("st", state.showStaff ? "1" : "0");
p.set("sm", state.staffMode);
if (state.leftHanded) p.set("lh", "1");
if (opts?.lessonId && typeof opts.lessonId === "string" && opts.lessonId.trim().length > 0) {
  p.set("les", opts.lessonId.trim().slice(0, 80));
}

const fullHash = `#${p.toString()}`;
try {
window.history.replaceState(null, "", fullHash);
} catch {
// Ignora em ambientes sandboxed
}
return `${window.location.origin}${window.location.pathname}${fullHash}`;
}
