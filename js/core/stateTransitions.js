// @ts-check

const VALID_MODES = new Set(["MAQAM", "JINS", "SCALE", "CHORD", "CADENCE"]);
const VALID_SHAPES = new Set([
  "FULL_NECK",
  "OPEN_FIRST_POS",
  "POS_SECOND",
  "POS_THIRD_BODY",
  "CLOSED_BOX",
]);
const VALID_DIRS = new Set(["ASC", "DESC"]);
const VALID_STAFF_MODES = new Set(["SCALE", "SAYR"]);
const VALID_LABEL_MODES = new Set(["NOTE", "DEGREE", "FINGER", "CENTS"]);
const VALID_JINS_FILTERS = new Set(["ALL", "LOWER", "UPPER"]);

const BOOLEAN_STATE_KEYS = [
  "chordVoicingOnly",
  "showSemiGuides",
  "showMicroGuides",
  "showGhostNotes",
  "showSayr",
  "showStaff",
  "showPositionsMap",
  "octavePathOnly",
];

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

  if (patch.mode !== undefined) {
    if (typeof patch.mode === "string" && VALID_MODES.has(patch.mode)) {
      next.mode = patch.mode;
    } else {
      next.mode = VALID_MODES.has(prevState?.mode) ? prevState.mode : "MAQAM";
    }

    if (next.mode !== "MAQAM") {
      next.sayrPhraseIndex = 0;
      next.staffMode = "SCALE";
      next.octavePathOnly = false;
    }
    if ((next.mode === "CHORD" || next.mode === "CADENCE") && next.shapeMode === "FULL_NECK") {
      next.shapeMode = "OPEN_FIRST_POS";
    }
    if (next.mode !== "CADENCE") {
      next.cadenceStepIndex = 0;
    }
  }

  if (patch.shapeMode !== undefined) {
    if (typeof patch.shapeMode === "string" && VALID_SHAPES.has(patch.shapeMode)) {
      next.shapeMode = patch.shapeMode;
    } else {
      next.shapeMode = VALID_SHAPES.has(prevState?.shapeMode) ? prevState.shapeMode : "FULL_NECK";
    }

    if ((next.mode === "CHORD" || next.mode === "CADENCE") && next.shapeMode === "FULL_NECK") {
      next.shapeMode = "OPEN_FIRST_POS";
    }

    if (
      next.shapeMode === "CLOSED_BOX" ||
      next.shapeMode === "POS_SECOND" ||
      next.shapeMode === "POS_THIRD_BODY"
    ) {
      next.labelMode = "FINGER";
    }
  }

  if (patch.direction !== undefined) {
    next.direction =
      typeof patch.direction === "string" && VALID_DIRS.has(patch.direction)
        ? patch.direction
        : VALID_DIRS.has(prevState?.direction)
          ? prevState.direction
          : "ASC";
  }

  if (patch.octavePathDir !== undefined) {
    next.octavePathDir =
      typeof patch.octavePathDir === "string" && VALID_DIRS.has(patch.octavePathDir)
        ? patch.octavePathDir
        : VALID_DIRS.has(prevState?.octavePathDir)
          ? prevState.octavePathDir
          : "ASC";
  }

  if (patch.staffMode !== undefined) {
    const candidateStaff =
      typeof patch.staffMode === "string" && VALID_STAFF_MODES.has(patch.staffMode)
        ? patch.staffMode
        : "SCALE";
    next.staffMode = next.mode === "MAQAM" ? candidateStaff : "SCALE";
  }

  if (patch.labelMode !== undefined) {
    next.labelMode =
      typeof patch.labelMode === "string" && VALID_LABEL_MODES.has(patch.labelMode)
        ? patch.labelMode
        : VALID_LABEL_MODES.has(prevState?.labelMode)
          ? prevState.labelMode
          : "NOTE";
  }

  if (patch.jinsFilter !== undefined) {
    next.jinsFilter =
      typeof patch.jinsFilter === "string" && VALID_JINS_FILTERS.has(patch.jinsFilter)
        ? patch.jinsFilter
        : "ALL";
  }

  if (patch.entityId !== undefined) {
    if (typeof patch.entityId === "string" && patch.entityId.trim().length > 0) {
      next.entityId = patch.entityId.trim();
    } else {
      next.entityId = prevState?.entityId;
    }
  }

  if (patch.iqaId !== undefined) {
    if (typeof patch.iqaId === "string" && patch.iqaId.trim().length > 0) {
      next.iqaId = patch.iqaId.trim();
    } else {
      next.iqaId = prevState?.iqaId;
    }
  }

  for (const key of BOOLEAN_STATE_KEYS) {
    if (patch[key] !== undefined) {
      next[key] = Boolean(patch[key]);
    }
  }

  next.rootQ = clampInt(next.rootQ, 0, 0, 23);
  next.boxAnchorQ = clampInt(next.boxAnchorQ, 2, 1, 10);
  next.sayrPhraseIndex = next.mode === "MAQAM" ? clampInt(next.sayrPhraseIndex, 0, 0, 4) : 0;
  next.cadenceStepIndex =
    next.mode === "CADENCE" ? Math.max(0, clampInt(next.cadenceStepIndex, 0, 0, 99)) : 0;
  next.bpm = clampInt(next.bpm, 96, 50, 175);

  if (next.anchorAbsQ !== null && next.anchorAbsQ !== undefined) {
    const anc = Number(next.anchorAbsQ);
    next.anchorAbsQ = Number.isFinite(anc) && anc >= 0 ? Math.trunc(anc) : null;
  } else {
    next.anchorAbsQ = null;
  }

  return next;
}
