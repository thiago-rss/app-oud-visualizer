// @ts-check

const VALID_MODES = new Set(["MAQAM", "JINS", "SCALE", "CHORD", "CADENCE"]);
const VALID_SHAPES = new Set(["FULL_NECK", "OPEN_FIRST_POS", "POS_SECOND", "POS_THIRD_BODY", "CLOSED_BOX"]);
const VALID_DIRS = new Set(["ASC", "DESC"]);
const VALID_STAFF_MODES = new Set(["SCALE", "SAYR"]);

/**
* Garante inteiro dentro de [min, max] com fallback seguro.
* @param {unknown} value
* @param {number} fallback
* @param {number} min
* @param {number} max
* @returns {number}
*/
export function clampInt(value, fallback, min, max) {
const num = Number(value);
if (!Number.isFinite(num)) return fallback;
const intVal = Math.trunc(num);
return Math.min(max, Math.max(min, intVal));
}

/**
* Aplica patch e normaliza invariantes de estado de forma pura.
* @param {any} prevState
* @param {Record<string, any>} patch
* @returns {any}
*/
export function applyStatePatch(prevState, patch) {
const next = { ...prevState, ...patch };

if (patch.mode && VALID_MODES.has(patch.mode)) {
next.mode = patch.mode;
if (patch.mode !== "MAQAM") {
  next.sayrPhraseIndex = 0;
  next.staffMode = "SCALE";
  next.octavePathOnly = false;
}
if ((patch.mode === "CHORD" || patch.mode === "CADENCE") && next.shapeMode === "FULL_NECK") {
  next.shapeMode = "OPEN_FIRST_POS";
}
if (patch.mode !== "CADENCE") {
  next.cadenceStepIndex = 0;
}
}

if (patch.shapeMode && VALID_SHAPES.has(patch.shapeMode)) {
next.shapeMode = patch.shapeMode;
if (
  patch.shapeMode === "CLOSED_BOX" ||
  patch.shapeMode === "POS_SECOND" ||
  patch.shapeMode === "POS_THIRD_BODY"
) {
  next.labelMode = "FINGER";
}
}

if (patch.direction && VALID_DIRS.has(patch.direction)) {
next.direction = patch.direction;
}

if (patch.octavePathDir && VALID_DIRS.has(patch.octavePathDir)) {
next.octavePathDir = patch.octavePathDir;
}

if (patch.staffMode && VALID_STAFF_MODES.has(patch.staffMode)) {
next.staffMode = patch.staffMode;
}

next.rootQ = clampInt(next.rootQ, 0, 0, 23);
next.boxAnchorQ = clampInt(next.boxAnchorQ, 2, 1, 10);
next.sayrPhraseIndex = clampInt(next.sayrPhraseIndex, 0, 0, 4);
next.cadenceStepIndex = Math.max(0, clampInt(next.cadenceStepIndex, 0, 0, 99));
next.bpm = clampInt(next.bpm, 96, 50, 175);

if (next.anchorAbsQ !== null && next.anchorAbsQ !== undefined) {
const anc = Number(next.anchorAbsQ);
next.anchorAbsQ = Number.isFinite(anc) && anc >= 0 ? Math.trunc(anc) : null;
}

return next;
}
