import { createTunerController } from "./ui/tunerController.js";
import { createOverlaysAndModals } from "./ui/overlaysAndModals.js";
// @ts-check
import { DB, PITCH_CLASSES_24 } from "./core/database.js";
import {
  getActiveStructure,
  getPositionBounds,
  computePositionRegionSequence,
  computeAnchoredOctavePath
} from "./core/modalEngine.js";
import { getInitialStateFromUrl, syncStateToUrl } from "./core/urlState.js";
import {
  normalizeStudyKey,
  normalizeDeckTab,
  resolveStudyIqaId as resolveStudyIqaIdFromDb,
  resolveStudyTuningId as resolveStudyTuningIdFromDb,
  resolveStudyEntityId as resolveStudyEntityIdFromDb
} from "./core/studyResolver.js";
import {
  escapeHtml,
  safeStorageGet,
  safeStorageSet,
  safeStorageRemove,
  createUiTimerRegistry
} from "./core/uiRuntime.js";
import { GLOSSARY_ENTRIES } from "./core/glossary.js";
import {
  t,
  localizeEntity,
  localizeGlossaryEntry,
  applyStaticTranslations
} from "./core/i18n.js";
import {
  STUDY_MODULES,
  getAllStudyLessons,
  getStudyLessonById,
  getNextStudyLesson,
  localizeStudyModule,
  localizeStudyLesson
} from "./core/studyGuide.js";
import { getLocalizedStudyDossier } from "./core/studyDossiers.js";
import { getAvailableEtudeKinds, generateTechnicalEtude } from "./core/technicalEtudes.js";
import {
  setOudTimbreProfile,
  getOudTimbreProfile,
  clearSequenceTimers,
  playPluckedNote,
  strumChordVoicing,
  arpeggiateChordVoicing,
  playScaleSequence,
  playTaqsimPhrase,
  scheduleCadenceSequence,
  toggleDroneAudio,
  updateDronePitch,
  startIqaEngine,
  stopIqaEngine
} from "./audio/synthEngine.js";
import {
  startPitchListening,
  stopPitchListening,
  isPitchListening,
  setPitchDetectionMode,
  getPitchDetectionMode,
  setPitchInputProfile,
  getPitchInputProfile,
  setPitchInputChannel,
  getPitchInputChannel,
  setPitchInputDeviceId,
  getPitchInputDeviceId,
  listAudioInputDevices,
  setPitchNoiseGate,
  getPitchNoiseGate,
  setLockedTunerCourse,
  getLockedTunerCourse,
  suspendPitchDetection
} from "./audio/pitchEngine.js";
import {
  renderOudNeckSVG,
  updateLivePitchOverlayOnNeck,
  clearLivePitchOverlayOnNeck
} from "./ui/neckRenderer.js";
import { renderMusicalStaffSVG } from "./ui/staffRenderer.js";
import { applyStatePatch } from "./core/stateTransitions.js";

const state = getInitialStateFromUrl();

let userOverrodeSidebar = false;
let desktopPreferredOrientation = state.orientation;

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth <= 768;
}

if (isMobileViewport()) {
  commitStatePatch({ orientation: "VERTICAL" }, { syncControls: false, refresh: false });
}

try {
  const savedTheme = localStorage.getItem("oud_theme_pref");
  if (!window.location.hash.includes("th=") && (savedTheme === "light" || savedTheme === "dark")) {
    commitStatePatch({ theme: savedTheme }, { syncControls: false, refresh: false });
  }
} catch {
  // Ignora se localStorage estiver bloqueado
}

try {
  const savedTimbre = localStorage.getItem("oud_timbre_pref");
  if (savedTimbre === "syrian" || savedTimbre === "egyptian") {
    setOudTimbreProfile(savedTimbre);
  }
} catch {
  // Ignora se localStorage estiver bloqueado
}

/** @type {any} */ (state).showPegbox = true;
try {
  const savedPegbox = localStorage.getItem("oud_show_pegbox_pref");
  if (savedPegbox === "0") /** @type {any} */ (state).showPegbox = false;
} catch {
  // Ignora se localStorage estiver bloqueado
}

// Restaura preferências do Modo Linha / Interface de Áudio
try {
  const savedInputProfile = localStorage.getItem("oud_input_profile_pref");
  if (savedInputProfile === "MIC" || savedInputProfile === "LINE") {
    setPitchInputProfile(savedInputProfile);
  }
  const savedInputChannel = localStorage.getItem("oud_input_channel_pref");
  if (savedInputChannel === "AUTO" || savedInputChannel === "CH1" || savedInputChannel === "CH2") {
    setPitchInputChannel(savedInputChannel);
  }
  const savedInputDevice = localStorage.getItem("oud_input_device_pref");
  if (typeof savedInputDevice === "string") {
    setPitchInputDeviceId(savedInputDevice);
  }
  const savedGate = parseFloat(localStorage.getItem("oud_input_gate_pref") || "");
  if (Number.isFinite(savedGate) && savedGate >= 0.002 && savedGate <= 0.08) {
    setPitchNoiseGate(savedGate);
  }
} catch {
  // Ignora se localStorage estiver bloqueado
}

if (state.theme !== "light" && state.theme !== "dark") state.theme = "dark";
if (typeof state.rootQ !== "number" || Number.isNaN(state.rootQ) || state.rootQ < 0 || state.rootQ >= 24) state.rootQ = 0;
if (typeof state.anchorAbsQ !== "number" || Number.isNaN(state.anchorAbsQ)) state.anchorAbsQ = null;
if (typeof state.octavePathOnly !== "boolean") state.octavePathOnly = false;
if (state.octavePathDir !== "ASC" && state.octavePathDir !== "DESC") state.octavePathDir = "ASC";
if (typeof state.showStaff !== "boolean") state.showStaff = true;
if (state.staffMode !== "SCALE" && state.staffMode !== "SAYR") state.staffMode = "SCALE";
if (typeof state.showPositionsMap !== "boolean") state.showPositionsMap = true;

/** @type {{ course: number, freq: number }[]} */
let currentChordVoicingFreqs = [];
let highlightedSequenceStep = -1;
/** @type {{ absQ: number | null, pitchClassQ: number | null, qFromNut?: number, course?: number, finger?: string | number, freq?: number } | null} */
let selectedStaffOrNeckPitch = null;
let isIqaPlaying = false;
let activeIqaBeatIdx = -1;
let glossaryCategory = "ALL";
let glossaryQuery = "";

let isZenMode = false;
let isSidebarCollapsed = isMobileViewport();
/** @type {number | null} */
let activePopoverIdx = null;
/** @type {"audio"|"main"|null} */
let activeHeaderMenu = null;
/** @type {"theory"|"modulation"|"study"} */
let activeDeckTab = "theory";
/** @type {number | undefined} */
let loupeHideTimer;

// Estados dos Níveis 2 e 3 (Audição da Região & Transição pelos Pivôs)
/** @type {string | null} */
let playingRegionId = null;
/** @type {string | null} */
let highlightedRegionNodeKey = null;
/** @type {number[]} */
let regionPlaybackTimers = [];
/** @type {any} */
let activeShiftOverlay = null;
/** @type {number | undefined} */
let shiftOverlayTimer;

/** @type {{ mode: any, entityId: string, rootQ: number, anchorAbsQ: number | null, label: string } | null} */
let modulationOrigin = null;

// ==========================================================================
// Estado do Detector de Intonação 24-TET, Modo Linha & Afinador 6 Ordens
// ==========================================================================
let isTunerBarOpen = false;
/** @type {import("./audio/pitchEngine.js").PitchDetectionResult | null} */
let latestPitchDetection = null;
/** @type {import("./audio/pitchEngine.js").AudioInputDeviceInfo[]} */
let availableInputDevices = [];
/** @type {string | null} */
let tunerErrorCode = null;
/** @type {string | null} */
let tunerErrorDetail = null;
/** @type {number | null} */
let lastDetectedTunerCourse = null;
/** @type {number | undefined} */
let clipHoldTimer;

// ==========================================================================
// Estado e Persistência do Guia de Estudos (v3.3 — 10 Capítulos / 30 Lições)
// ==========================================================================
const STORAGE_STUDY_DONE = "oud_study_completed_v3";
const STORAGE_STUDY_ACTIVE = "oud_study_active_v3";
const STORAGE_STUDY_VISITED = "oud_study_visited_v3";

/** @type {Set<string>} */
let completedStudyLessons = new Set();
let activeStudyModuleId = STUDY_MODULES[0]?.id || "mod_foundation";
let activeStudyLessonId = STUDY_MODULES[0]?.lessons[0]?.id || "les_01_open_first_pos";
/** @type {string | null} */
let appliedStudyLessonId = null;
/** @type {"ALL"|"foundation"|"intermediate"|"advanced"|"mastery"|"world"} */
let activeStudyLevelFilter = "ALL";
let isStudyDossierOpen = false;
/** @type {import("./core/technicalEtudes.js").TechnicalEtudeKind} */
let activeEtudeKind = "BROKEN_THIRDS";
let activeEtudeSpeed = 0.85;
let isEtudeLoopPlaying = false;
/** @type {number[]} */
let etudePlaybackTimers = [];

function loadStudyProgress() {
  const allLessons = getAllStudyLessons();
  try {
    const rawDone = localStorage.getItem(STORAGE_STUDY_DONE);
    if (rawDone) {
      const parsed = JSON.parse(rawDone);
      if (Array.isArray(parsed)) {
        const validIds = new Set(allLessons.map(l => l.id));
        completedStudyLessons = new Set(parsed.filter(id => typeof id === "string" && validIds.has(id)));
      }
    }

    const savedActive = localStorage.getItem(STORAGE_STUDY_ACTIVE);
    const savedLesson = savedActive ? getStudyLessonById(savedActive) : null;
    if (savedLesson) {
      activeStudyLessonId = savedLesson.id;
      activeStudyModuleId = savedLesson.moduleId;
    } else {
      const firstPending = allLessons.find(l => !completedStudyLessons.has(l.id)) || allLessons[0];
      if (firstPending) {
        activeStudyLessonId = firstPending.id;
        activeStudyModuleId = firstPending.moduleId;
      }
    }

    // Na primeira visita sem link compartilhado, abre o Deck diretamente no Guia de Estudos
    const alreadyVisited = localStorage.getItem(STORAGE_STUDY_VISITED);
    if (!alreadyVisited && !window.location.hash) {
      activeDeckTab = "study";
      localStorage.setItem(STORAGE_STUDY_VISITED, "1");
    }
  } catch {
    // Ignora se localStorage não estiver disponível
  }
}

function saveStudyProgress() {
  try {
    localStorage.setItem(STORAGE_STUDY_DONE, JSON.stringify(Array.from(completedStudyLessons)));
    localStorage.setItem(STORAGE_STUDY_ACTIVE, activeStudyLessonId);
    localStorage.setItem(STORAGE_STUDY_VISITED, "1");
  } catch {
    // Ignora
  }
}

/**
 * Busca chave de tradução com fallback seguro em PT/EN.
 * @param {string} key
 * @param {string} fallbackPt
 * @param {string} fallbackEn
 */
function safeT(key, fallbackPt, fallbackEn) {
  const val = t(state.lang, /** @type {any} */ (key));
  if (val && val !== key) return val;
  return state.lang === "en" ? fallbackEn : fallbackPt;
}

/**
 * Normaliza o identificador de aba do Deck (aceita "guide" como alias de "study").
 * @param {string | undefined} rawTab
 * @returns {"theory"|"modulation"|"study"}
 */
function stopRegionPlayback(shouldRefresh = false) {
  regionPlaybackTimers.forEach(id => window.clearTimeout(id));
  regionPlaybackTimers = [];
  const hadPlayback = playingRegionId !== null || highlightedRegionNodeKey !== null;
  playingRegionId = null;
  highlightedRegionNodeKey = null;
  if (shouldRefresh && hadPlayback) {
    refreshAll();
  }
}

function clearShiftOverlay(shouldRefresh = false) {
  window.clearTimeout(shiftOverlayTimer);
  const hadOverlay = activeShiftOverlay !== null;
  activeShiftOverlay = null;
  if (shouldRefresh && hadOverlay) {
    refreshAll();
  }
}

function clearAllActivePlayback() {
  clearSequenceTimers();
  stopRegionPlayback(false);
  highlightedSequenceStep = -1;
}

// ==========================================================================
// Controlador do Detector 24-TET, Modo Linha (Interface) & Afinador 6 Ordens
// ==========================================================================

/**
 * Converte valor linear de Noise Gate na posição visual (0..100%) sobre a barra VU (-60..0 dBFS).
 * @param {number} gateRms
 */
function gateRmsToVuPct(gateRms) {
  const db = 20 * Math.log10(Math.max(1e-5, gateRms));
  return Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
}

/**
 * Traduz códigos de erro de entrada de áudio para mensagens claras ao músico.
 * @param {string} code
 */
/**
 * Atualiza a lista de dispositivos no seletor `#select-tuner-device`.
 */
/**
 * Consulta dispositivos disponíveis no sistema e atualiza o seletor.
 */
/**
 * Atualiza a barra VU, dBFS, marcador de Gate e alerta de CLIP em tempo real (~22 fps).
 * @param {import("./audio/pitchEngine.js").PitchInputLevelInfo | null} level
 */
/**
 * Sincroniza o botão de entrada ON/OFF da barra inferior mobile (#btn-mob-mic).
 */
/**
 * Renderiza a fileira clicável das 6 ordens da afinação atual (6ª grave → 1ª aguda) no modo Afinador.
 */
/**
 * Atualiza a leitura em tempo real da faixa de escuta (nota, cents, Hz, direção e agulha).
 * Chamado a ~22 fps sem reconstruir o restante da interface.
 *
 * @param {import("./audio/pitchEngine.js").PitchDetectionResult | null} det
 */
/**
 * Sincroniza controles da faixa de escuta, Modo Linha (Interface), Menu ⋯, Popover 0 e Dock Mobile.
 */
/**
 * Callback disparado em tempo real pelo motor YIN (~22 fps).
 * @param {import("./audio/pitchEngine.js").PitchDetectionResult | null} detection
 */

const tunerController = createTunerController({
  getState: () => state,
  getTunings: () => DB.tunings,
  getTunerErrorCode: () => tunerErrorCode,
  getTunerErrorDetail: () => tunerErrorDetail,
  getAvailableInputDevices: () => availableInputDevices,
  setAvailableInputDevices: (devs) => { availableInputDevices = devs; },
  getLatestPitchDetection: () => latestPitchDetection,
  isTunerBarOpen: () => isTunerBarOpen,
  isIqaPlaying: () => isIqaPlaying,
  listAudioInputDevices,
  getPitchInputDeviceId,
  getPitchNoiseGate,
  isPitchListening,
  getPitchInputProfile,
  getPitchDetectionMode,
  getPitchInputChannel,
  getLockedTunerCourse,
});

const {
  getTunerErrorText,
  renderAudioInputDeviceOptions,
  refreshAudioInputDevices,
  renderLiveInputLevel,
  syncMobileMicButton,
  renderTunerCoursesList,
  renderLiveTunerReadout,
  syncLiveTunerUI,
} = tunerController;

function handleLivePitchDetection(detection) {
  latestPitchDetection = detection;
  if (detection && detection.courseNumber !== null) {
    lastDetectedTunerCourse = detection.courseNumber;
  }
  updateLivePitchOverlayOnNeck(detection);
  renderLiveTunerReadout(detection);
}

async function startLiveMicCapture() {
  tunerErrorCode = null;
  tunerErrorDetail = null;
  syncLiveTunerUI();

  await startPitchListening({
    getState: () => state,
    onDetection: handleLivePitchDetection,
    onLevel: renderLiveInputLevel,
    onDevicesChange: (devs) => {
      availableInputDevices = devs;
      renderAudioInputDeviceOptions();
    },
    onError: (code, rawErr) => {
      tunerErrorCode = code;
      tunerErrorDetail = rawErr?.name ? String(rawErr.name) : null;
      latestPitchDetection = null;
      clearLivePitchOverlayOnNeck();
      renderLiveInputLevel(null);
      syncLiveTunerUI();
    },
    onStateChange: (active) => {
      if (!active) {
        latestPitchDetection = null;
        clearLivePitchOverlayOnNeck();
        renderLiveInputLevel(null);
      }
      syncLiveTunerUI();
      renderStudyGuidePane();
    }
  });
}

/**
 * Abre a faixa de Escuta/Afinador no modo desejado e opcionalmente liga a entrada.
 * @param {import("./audio/pitchEngine.js").PitchDetectionMode} [preferredMode]
 * @param {boolean} [autoStartMic=true]
 */
function openLiveTunerBar(preferredMode, autoStartMic = true) {
  setActiveHeaderMenu(null);
  setActivePopover(null);
  isTunerBarOpen = true;
  tunerErrorCode = null;
  tunerErrorDetail = null;

  if (preferredMode) {
    setPitchDetectionMode(preferredMode);
  }

  refreshAudioInputDevices();
  syncLiveTunerUI();

  if (autoStartMic && !isPitchListening()) {
    startLiveMicCapture();
  }
}

function closeLiveTunerBar() {
  stopPitchListening();
  isTunerBarOpen = false;
  latestPitchDetection = null;
  tunerErrorCode = null;
  tunerErrorDetail = null;
  clearLivePitchOverlayOnNeck();
  renderLiveInputLevel(null);
  syncLiveTunerUI();
}

function playActiveTunerCourseReference() {
  const tuning = DB.tunings.find(x => x.id === state.tuningId) || DB.tunings[0];
  const targetNum = getLockedTunerCourse() ?? lastDetectedTunerCourse ?? 6;
  const courseObj = tuning.courses.find(c => c.course === targetNum) || tuning.courses[tuning.courses.length - 1];
  if (!courseObj) return;

  suspendPitchDetection(1250);
  playPluckedNote(courseObj.freq_hz, 1.55, 0.36);
}

/**
 * Nível 1: Clique direto nas cápsulas I, II, III — isola a posição ou volta ao Espelho Completo.
 * @param {string} regionId
 */
function handleTogglePositionRegion(regionId) {
  clearAllActivePlayback();
  clearShiftOverlay(false);

  if (state.shapeMode === regionId) {
    commitStatePatch({ shapeMode: "FULL_NECK" }, { syncControls: false, refresh: false });
  } else {
    commitStatePatch({ shapeMode: /** @type {any} */ (regionId) }, { syncControls: false, refresh: false });
  }

  syncControlsWithState();
  refreshAll();
}

/**
 * Nível 2: Clique no botão ▶ da cápsula ativa — executa em sequência as notas daquela posição.
 * @param {string} regionId
 */
function handlePlayPositionRegion(regionId) {
  if (playingRegionId === regionId) {
    stopRegionPlayback(true);
    return;
  }

  clearAllActivePlayback();
  clearShiftOverlay(false);

  const notes = computePositionRegionSequence(state, regionId);
  if (!notes.length) return;

  playingRegionId = regionId;
  const stepMs = 310;
  suspendPitchDetection(notes.length * stepMs + 500);

  notes.forEach((n, idx) => {
    const tId = window.setTimeout(() => {
      highlightedRegionNodeKey = `${n.course}:${n.qFromNut}`;
      selectedStaffOrNeckPitch = {
        absQ: n.absQ,
        pitchClassQ: n.pitchClassQ,
        qFromNut: n.qFromNut,
        course: n.course,
        finger: n.finger,
        freq: n.freq
      };
      playPluckedNote(n.freq, 0.85);
      refreshAll();
    }, idx * stepMs);
    regionPlaybackTimers.push(tId);
  });

  const endId = window.setTimeout(() => {
    playingRegionId = null;
    highlightedRegionNodeKey = null;
    selectedStaffOrNeckPitch = null;
    refreshAll();
  }, notes.length * stepMs + 320);
  regionPlaybackTimers.push(endId);

  refreshAll();
}

/**
 * Nível 3: Clique nos pivôs ⇄P2, ⇄P3 (mudança de posição) ou =1ª..5ª (ponte de uníssono).
 * @param {{ type: string, badge: string, targetCourse: number | null, targetPosId: string | null, course: number, qFromNut: number, absQ: number, pitchClassQ: number, freq: number }} payload
 */
function handlePivotAction(payload) {
  clearAllActivePlayback();
  clearShiftOverlay(false);

  const isEn = state.lang === "en";

  if (payload.type === "UNISON_BRIDGE" && payload.targetCourse !== null) {
    suspendPitchDetection(950);
    playPluckedNote(payload.freq, 1.1);
    const tId = window.setTimeout(() => {
      playPluckedNote(payload.freq, 1.4);
    }, 280);
    regionPlaybackTimers.push(tId);

    selectedStaffOrNeckPitch = {
      absQ: payload.absQ,
      pitchClassQ: payload.pitchClassQ,
      qFromNut: payload.qFromNut,
      course: payload.course,
      freq: payload.freq
    };

    activeShiftOverlay = {
      type: "UNISON",
      fromCourse: payload.course,
      fromQ: payload.qFromNut,
      toCourse: payload.targetCourse,
      toQ: 0,
      absQ: payload.absQ,
      pitchClassQ: payload.pitchClassQ
    };

    shiftOverlayTimer = window.setTimeout(() => {
      clearShiftOverlay(true);
    }, 4500);

    refreshAll();
    return;
  }

  if (payload.type === "SHIFT_POS2" || payload.type === "SHIFT_POS3") {
    const prevMode = state.shapeMode;
    const prevBounds = getPositionBounds(prevMode, state.boxAnchorQ);

    let nextMode = payload.targetPosId || "POS_SECOND";
    if (payload.type === "SHIFT_POS2" && prevMode === "POS_SECOND") {
      nextMode = "OPEN_FIRST_POS";
    } else if (payload.type === "SHIFT_POS3" && prevMode === "POS_THIRD_BODY") {
      nextMode = "POS_SECOND";
    }

    const nextBounds = getPositionBounds(nextMode, state.boxAnchorQ);
    const shortName = (/** @type {string} */ m) => {
      if (m === "OPEN_FIRST_POS") return "I";
      if (m === "POS_SECOND") return "II";
      if (m === "POS_THIRD_BODY") return "III";
      return isEn ? "Full" : "I";
    };

    commitStatePatch({ shapeMode: /** @type {any} */ (nextMode) }, { syncControls: false, refresh: false });
    suspendPitchDetection(700);
    playPluckedNote(payload.freq, 1.35);

    activeShiftOverlay = {
      type: "SHIFT",
      fromPosId: prevMode,
      toPosId: nextMode,
      fromThumbQ: prevBounds.thumbQ,
      toThumbQ: nextBounds.thumbQ,
      course: payload.course,
      pivotQ: payload.qFromNut,
      badgeText: isEn
        ? `⇄ Shift ${shortName(prevMode)} → ${shortName(nextMode)} (${prevBounds.thumbQ}q→${nextBounds.thumbQ}q)`
        : `⇄ Pos ${shortName(prevMode)} → ${shortName(nextMode)} (${prevBounds.thumbQ}q→${nextBounds.thumbQ}q)`
    };

    shiftOverlayTimer = window.setTimeout(() => {
      clearShiftOverlay(true);
    }, 4500);

    syncControlsWithState();
    refreshAll();
  }
}

/**
 * Normaliza texto para busca segura sem acentos.
 * @param {string} str
 */
/**
 * Resolve o ID real de um Iqa' a partir de DB.iqaat (ou do <select> no DOM como fallback),
 * garantindo compatibilidade mesmo se o ID em database.js variar (ex.: iqa_samai vs iqa_samai_thaqil).
 * @param {string | undefined} preferredId
 * @param {string | undefined} keyword
 * @returns {string | null}
 */
/**
 * Resolve o ID real de uma afinação em DB.tunings por ID exato ou palavras-chave.
 * @param {string | undefined} preferredId
 * @param {string[] | undefined} keywords
 * @returns {string | null}
 */
/**
 * Resolve o ID real de um Maqam, Jins, Escala, Acorde ou Cadência em DB.
 * @param {"MAQAM"|"JINS"|"SCALE"|"CHORD"|"CADENCE"} mode
 * @param {string | undefined} preferredId
 * @param {string[] | undefined} keywords
 * @returns {string | null}
 */
/**
 * Alterna o caráter sonoro Sírio/Egípcio, persiste a preferência e toca uma prévia na tônica ativa.
 */

function resolveStudyIqaId(preferredId, keyword) {
  return resolveStudyIqaIdFromDb(DB, preferredId, keyword, document);
}

function resolveStudyTuningId(preferredId, keywords) {
  return resolveStudyTuningIdFromDb(DB, preferredId, keywords);
}

function resolveStudyEntityId(mode, preferredId, keywords) {
  return resolveStudyEntityIdFromDb(DB, mode, preferredId, keywords);
}

function toggleOudTimbreProfileWithPreview() {
  const nextProfile = getOudTimbreProfile() === "syrian" ? "egyptian" : "syrian";
  setOudTimbreProfile(nextProfile);
  try {
    localStorage.setItem("oud_timbre_pref", nextProfile);
  } catch {
    // Ignora
  }
  syncControlsWithState();
  renderStudyGuidePane();
  suspendPitchDetection(750);
  const previewFreq = 130.81278 * Math.pow(2, ((state.rootQ % 24) + 24) % 24 / 24);
  playPluckedNote(previewFreq, 1.35, 0.36);
}

/**
 * Aplica o preset completo de uma lição do Guia de Estudos no espelho do Oud.
 * @param {string} lessonId
 * @param {{ playConfirmTone?: boolean, scrollToStage?: boolean }} [opts]
 */
function applyStudyLessonPreset(lessonId, opts = {}) {
  const lesson = getStudyLessonById(lessonId);
  if (!lesson) return;

  clearAllActivePlayback();
  clearShiftOverlay(false);
  selectedStaffOrNeckPitch = null;
  modulationOrigin = null;

  const p = lesson.preset;
  const resolvedTuning = (typeof resolveStudyTuningId === "function" && (p.tuningId || p.tuningKeywords))
    ? resolveStudyTuningId(p.tuningId, p.tuningKeywords)
    : p.tuningId;
  if (resolvedTuning && typeof setLockedTunerCourse === "function") {
    setLockedTunerCourse(null);
  }

  const resolvedEntity = typeof resolveStudyEntityId === "function"
    ? resolveStudyEntityId(p.mode, p.entityId, p.entityKeywords)
    : p.entityId;

  /** @type {Record<string, any>} */
  const patch = {
    anchorAbsQ: null,
    octavePathOnly: false,
    mode: p.mode,
    rootQ: p.rootQ,
    direction: p.direction || "ASC",
    shapeMode: p.shapeMode,
    labelMode: p.labelMode,
    jinsFilter: p.jinsFilter || "ALL",
    showSemiGuides: p.showSemiGuides,
    showMicroGuides: p.showMicroGuides,
    showGhostNotes: p.showGhostNotes,
    showSayr: p.showSayr,
    sayrPhraseIndex: typeof p.sayrPhraseIndex === "number" ? p.sayrPhraseIndex : 0,
    showStaff: p.showStaff,
    staffMode: p.staffMode || "SCALE",
    showPositionsMap: p.showPositionsMap,
    cadenceStepIndex: 0,
  };

  if (resolvedTuning) patch.tuningId = resolvedTuning;
  if (p.tradition) patch.tradition = p.tradition;
  if (resolvedEntity) patch.entityId = resolvedEntity;
  if (typeof p.chordVoicingOnly === "boolean") patch.chordVoicingOnly = p.chordVoicingOnly;
  if (typeof p.boxAnchorQ === "number") patch.boxAnchorQ = p.boxAnchorQ;
  if (p.iqaId) patch.iqaId = p.iqaId;
  if (typeof p.bpm === "number") patch.bpm = p.bpm;

  commitStatePatch(patch, { syncControls: false, refresh: false });

  if (p.tradition) {
    document.body.setAttribute("data-tradition", state.tradition);
  }

  if (typeof p.bpm === "number") {
    const sliderBpm = /** @type {HTMLInputElement | null} */ (document.getElementById("slider-bpm"));
    const labelBpm = document.getElementById("label-bpm");
    if (sliderBpm) sliderBpm.value = String(state.bpm);
    if (labelBpm) labelBpm.textContent = String(state.bpm);
    if (typeof restartIqaIfPlaying === "function") restartIqaIfPlaying();
  }

  activeStudyLessonId = lesson.id;
  activeStudyModuleId = lesson.moduleId;
  appliedStudyLessonId = lesson.id;
  saveStudyProgress();
  syncControlsWithState();
  refreshAll();

  if (opts.playConfirmTone !== false) {
    suspendPitchDetection(650);
    const confirmFreq = 130.81278 * Math.pow(2, (((state.rootQ % 24) + 24) % 24) / 24);
    playPluckedNote(confirmFreq, 1.15, 0.28);
  }

  if (opts.scrollToStage && isMobileViewport()) {
    requestAnimationFrame(() => {
      document.querySelector(".neck-showcase")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

/**
 * Executa o exemplo sonoro recomendado pela lição ativa (Escala, Taqsim, Arpejo ou Posição).
 * @param {string} lessonId
 */
function playStudyLessonExample(lessonId) {
  const lesson = getStudyLessonById(lessonId);
  if (!lesson) return;

  if (appliedStudyLessonId !== lesson.id) {
    applyStudyLessonPreset(lesson.id, { playConfirmTone: false, scrollToStage: false });
  }

  if (lesson.audioAction === "REGION") {
    handlePlayPositionRegion(lesson.preset.shapeMode);
    return;
  }

  if (lesson.audioAction === "ARPEGGIO" && currentChordVoicingFreqs.length > 0) {
    suspendPitchDetection(currentChordVoicingFreqs.length * 220 + 500);
    arpeggiateChordVoicing(currentChordVoicingFreqs);
    return;
  }

  if (lesson.audioAction === "TAQSIM" && state.mode === "MAQAM") {
    handlePlayTaqsim();
    return;
  }

  handlePrimaryAudioAction();
}

/**
 * Marca ou desmarca uma lição como concluída e persiste no localStorage.
 * @param {string} lessonId
 */
function toggleStudyLessonComplete(lessonId) {
  if (completedStudyLessons.has(lessonId)) {
    completedStudyLessons.delete(lessonId);
  } else {
    completedStudyLessons.add(lessonId);
  }
  saveStudyProgress();
  syncCommandBarSummaries();
  renderStudyGuidePane();
}

function getStudyPaneElement() {
  return (
    document.getElementById("deck-pane-study") ||
    document.querySelector('[data-deck-pane="study"]') ||
    document.getElementById("deck-pane-guide") ||
    document.querySelector('[data-deck-pane="guide"]')
  );
}

/**
 * Renderiza toda a aba "Guia de Estudos" (barra de progresso, filtro por nível, 10 capítulos, cartões e missão ativa).
 */
/**
 * Monta o HTML do bloco recolhível "Dossiê Teórico, Intonação & Repertório" para a lição ativa.
 * @param {string} lessonId
 * @param {boolean} isEn
 */
function buildStudyDossierHtml(lessonId, isEn) {
  const dossier = getLocalizedStudyDossier(state.lang, lessonId);
  if (!dossier) return "";

  const tagsHtml = dossier.tags
    .map(tag => `<span class="study-dossier-chip">${tag}</span>`)
    .join("");

  const repertoireHtml = dossier.repertoire.map(ref => `
    <div class="study-rep-card">
      <div class="study-rep-head">
        <div>
          <div class="study-rep-piece">${ref.piece}</div>
          <div class="study-rep-artist">${ref.artist}</div>
        </div>
        <a class="ghost-btn compact-btn study-rep-link" href="${ref.searchUrl}" target="_blank" rel="noopener noreferrer" title="${isEn ? "Search reference recording on YouTube" : "Buscar gravação de referência no YouTube"}">
          ▶ ${isEn ? "Listen Ref" : "Buscar Áudio"}
        </a>
      </div>
      <div class="study-rep-note">
        <strong>${isEn ? "What to listen for:" : "O que observar na gravação:"}</strong> ${ref.listenFor}
      </div>
    </div>
  `).join("");

  return `
    <div class="study-dossier-shell ${isStudyDossierOpen ? "is-open" : ""}">
      <button type="button" class="study-dossier-toggle" aria-expanded="${isStudyDossierOpen ? "true" : "false"}">
        <span class="study-dossier-toggle-left">
          <span>📚</span>
          <span>${isEn ? "Theoretical Dossier, Intonation & Repertoire" : "Dossiê Teórico, Intonação & Repertório"}</span>
        </span>
        <span class="study-dossier-toggle-right">
          ${isStudyDossierOpen
            ? (isEn ? "▾ Hide Dossier" : "▾ Recolher Dossiê")
            : (isEn ? "▸ Deep Dive" : "▸ Aprofundar")}
        </span>
      </button>

      ${isStudyDossierOpen ? `
        <div class="study-dossier-body">
          <div class="study-dossier-chips">${tagsHtml}</div>

          <div class="study-dossier-grid">
            <div class="study-dossier-card">
              <div class="study-dossier-card-title">📐 ${isEn ? "Architecture & Modal Gravity" : "Arquitetura & Gravidade Modal"}</div>
              <p>${dossier.structure}</p>
            </div>
            <div class="study-dossier-card">
              <div class="study-dossier-card-title">🎚️ ${isEn ? "Intonation, Schools & Acoustics" : "Intonação, Escolas & Acústica"}</div>
              <p>${dossier.temperament}</p>
            </div>
            <div class="study-dossier-card is-pitfall">
              <div class="study-dossier-card-title">⚠️ ${isEn ? "Common Pitfall & Fix" : "Armadilha Comum & Correção"}</div>
              <p>${dossier.pitfall}</p>
            </div>
          </div>

          <div class="study-rep-section">
            <div class="study-rep-section-title">🎧 ${isEn ? "Guided Listening — Classic Repertoire & Masters" : "Escuta Guiada — Repertório & Mestres"}</div>
            <div class="study-rep-list">
              ${repertoireHtml}
            </div>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

function stopTechnicalEtudePlayback(shouldRefresh = false) {
  etudePlaybackTimers.forEach(id => window.clearTimeout(id));
  etudePlaybackTimers = [];
  const hadStep = highlightedSequenceStep !== -1 || isEtudeLoopPlaying;
  isEtudeLoopPlaying = false;
  highlightedSequenceStep = -1;
  if (shouldRefresh && hadStep) {
    refreshAll();
  }
}

function getEtudeKindLabel(kind, isEn) {
  if (kind === "BROKEN_THIRDS") return isEn ? "Broken 3rds" : "Terças (1-3-2)";
  if (kind === "GROUPS_OF_3") return isEn ? "3-Note Groups" : "Grupos de 3";
  if (kind === "BARIOLAGE_PEDAL") return isEn ? "Pedal & Risha" : "Pedal & Risha";
  return isEn ? "Microtonal Focus" : "Foco Microtonal";
}

function playTechnicalEtudeSequence(lessonId, loop = false) {
  const lesson = getStudyLessonById(lessonId);
  if (!lesson) return;

  if (appliedStudyLessonId !== lesson.id) {
    applyStudyLessonPreset(lesson.id, { playConfirmTone: false, scrollToStage: false });
  }

  clearAllActivePlayback();
  stopTechnicalEtudePlayback(false);

  const avail = getAvailableEtudeKinds(lesson);
  const chosenKind = avail.includes(activeEtudeKind) ? activeEtudeKind : avail[0];
  const spec = generateTechnicalEtude(state, lesson, chosenKind);
  if (!spec.steps.length) return;

  isEtudeLoopPlaying = Boolean(loop);
  const speedFactor = Math.max(0.4, Math.min(1.5, activeEtudeSpeed || 0.85));

  const runCycle = () => {
    etudePlaybackTimers.forEach(id => window.clearTimeout(id));
    etudePlaybackTimers = [];

    let elapsedMs = 0;
    spec.steps.forEach((st, idx) => {
      const dur = Math.max(150, Math.round(st.baseDurMs / speedFactor));
      const tId = window.setTimeout(() => {
        highlightedSequenceStep = idx;
        const freq = 65.41 * Math.pow(2, (st.absQ * 50 + st.centsDev) / 1200);
        const vel = st.risha === "UP" ? 0.24 : 0.34;
        playPluckedNote(freq, Math.max(0.55, dur / 320), vel);
        refreshAll();
      }, elapsedMs);
      etudePlaybackTimers.push(tId);
      elapsedMs += dur;
    });

    const totalMs = elapsedMs + 180;
    suspendPitchDetection(totalMs + 350);

    const endId = window.setTimeout(() => {
      if (isEtudeLoopPlaying) {
        runCycle();
      } else {
        highlightedSequenceStep = -1;
        refreshAll();
      }
    }, totalMs);
    etudePlaybackTimers.push(endId);
  };

  syncControlsWithState();
  renderStudyGuidePane();
  runCycle();
}

function buildTechnicalEtudesHtml(lesson, isEn) {
  if (!lesson) return "";
  const avail = getAvailableEtudeKinds(lesson);
  const chosenKind = avail.includes(activeEtudeKind) ? activeEtudeKind : avail[0];
  const spec = generateTechnicalEtude(state, lesson, chosenKind);

  const kindBtnsHtml = avail.map(k => `
    <button type="button" class="study-etude-kind-btn ${k === chosenKind ? "selected" : ""}" data-etude-kind="${k}">
      ${getEtudeKindLabel(k, isEn)}
    </button>
  `).join("");

  const speeds = [0.65, 0.85, 1.0];
  const speedBtnsHtml = speeds.map(sp => `
    <button type="button" class="study-etude-speed-btn ${Math.abs(activeEtudeSpeed - sp) < 0.02 ? "selected" : ""}" data-etude-speed="${sp}">
      ${sp.toFixed(2).replace(/\.00$/, ".0")}×
    </button>
  `).join("");

  const stepsStripHtml = spec.steps.slice(0, 12).map((st, idx) => {
    const arrow = st.risha === "DOWN" ? "↓" : "↑";
    const isHi = highlightedSequenceStep === idx;
    return `
      <span class="study-etude-step-chip ${st.risha === "DOWN" ? "is-down" : "is-up"} ${isHi ? "is-playing" : ""}">
        <span class="risha-arrow">${arrow}</span>
        <strong>${st.noteName}</strong>
        ${st.degree ? `<small>${st.degree}</small>` : ""}
      </span>
    `;
  }).join("");

  return `
    <div class="study-etude-box">
      <div class="study-etude-top">
        <div>
          <div class="study-etude-kicker">🏋️ ${isEn ? "Procedural Technical Etude" : "Estudo Técnico Procedural"} · ${spec.title}</div>
          <div class="study-etude-sub">${spec.subtitle}</div>
        </div>
        <div class="segmented-pills">
          <div class="segmented-pills" role="group" aria-label="${isEn ? "Tempo speed" : "Velocidade"}">
            ${speedBtnsHtml}
          </div>
          <button type="button" class="plum-btn compact-btn btn-etude-play">
            ${isEn ? "▶ Play Etude" : "▶ Tocar Estudo"}
          </button>
          <button type="button" class="ghost-btn compact-btn btn-etude-loop ${isEtudeLoopPlaying ? "active-toggle" : ""}">
            ${isEtudeLoopPlaying ? (isEn ? "⏹ Stop Loop" : "⏹ Parar Loop") : "🔁 Loop"}
          </button>
        </div>
      </div>

      <div class="segmented-pills" style="margin-top:8px;">
        ${kindBtnsHtml}
      </div>

      ${stepsStripHtml ? `<div class="study-etude-steps">${stepsStripHtml}</div>` : ""}

      ${spec.focusTip ? `
        <div class="study-etude-tip">
          <strong>Risha &amp; ${isEn ? "Mechanics:" : "Mecânica:"}</strong> ${spec.focusTip}
        </div>
      ` : ""}
    </div>
  `;
}

function renderStudyGuidePane() {
  const pane = getStudyPaneElement();
  if (!pane) return;

  const isEn = state.lang === "en";
  const allLessons = getAllStudyLessons();
  const totalCount = allLessons.length;
  const doneCount = completedStudyLessons.size;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const studyCountBadge =
    document.getElementById("deck-study-count") ||
    document.getElementById("deck-guide-count");
  if (studyCountBadge) {
    studyCountBadge.textContent = `${doneCount}/${totalCount}`;
  }

  const currentMod = STUDY_MODULES.find(m => m.id === activeStudyModuleId) || STUDY_MODULES[0];
  const locMod = localizeStudyModule(state.lang, currentMod);

  let currentLesson = getStudyLessonById(activeStudyLessonId);
  if (!currentLesson || currentLesson.moduleId !== currentMod.id) {
    currentLesson = currentMod.lessons[0];
    if (currentLesson) activeStudyLessonId = currentLesson.id;
  }
  const locLesson = currentLesson ? localizeStudyLesson(state.lang, currentLesson) : null;
  const nextLesson = currentLesson ? getNextStudyLesson(currentLesson.id) : null;
  const isCurrentDone = currentLesson ? completedStudyLessons.has(currentLesson.id) : false;
  const isCurrentApplied = currentLesson ? appliedStudyLessonId === currentLesson.id : false;

  const visibleModules = activeStudyLevelFilter === "ALL"
    ? STUDY_MODULES
    : STUDY_MODULES.filter(m => m.level === activeStudyLevelFilter);

  const levelFilters = [
    { id: "ALL", pt: `Todos (${STUDY_MODULES.length})`, en: `All (${STUDY_MODULES.length})` },
    { id: "foundation", pt: "🌱 Base (1–2)", en: "🌱 Base (1–2)" },
    { id: "intermediate", pt: "✨ Interm. (3–4)", en: "✨ Interm. (3–4)" },
    { id: "advanced", pt: "🪶 Avanç. (5–8)", en: "🪶 Adv. (5–8)" },
    { id: "mastery", pt: "👑 Mestre (9–10)", en: "👑 Master (9–10)" },
    { id: "world", pt: "🌍 Mundo & Fusão (11–16)", en: "🌍 World & Fusion (11–16)" }
  ];

  const levelFilterHtml = levelFilters.map(lf => `
    <button type="button" class="study-level-pill ${activeStudyLevelFilter === lf.id ? "selected" : ""}" data-study-level="${lf.id}">
      ${isEn ? lf.en : lf.pt}
    </button>
  `).join("");

  const modulesTabsHtml = visibleModules.map(rawMod => {
    const m = localizeStudyModule(state.lang, rawMod);
    const modDone = rawMod.lessons.filter(l => completedStudyLessons.has(l.id)).length;
    const isAct = rawMod.id === currentMod.id;
    const isAdv = rawMod.level === "advanced";
    const isMaster = rawMod.level === "mastery";
    const isWorld = rawMod.level === "world";
    return `
      <button type="button" class="study-mod-btn ${isAct ? "selected" : ""} ${isAdv ? "is-advanced-mod" : ""} ${isMaster ? "is-mastery-mod" : ""} ${isWorld ? "is-world-mod" : ""}" data-study-module="${rawMod.id}">
        <span>${m.icon} ${m.title}</span>
        ${isAdv ? `<span class="study-adv-tag">${isEn ? "Adv" : "Avanç."}</span>` : ""}
        ${isMaster ? `<span class="study-master-tag">${isEn ? "Master" : "Mestre"}</span>` : ""}
        ${isWorld ? `<span class="study-world-tag">${isEn ? "World" : "Mundo"}</span>` : ""}
        <span class="deck-tab-count">${modDone}/${rawMod.lessons.length}</span>
      </button>
    `;
  }).join("");

  const lessonCardsHtml = currentMod.lessons.map(rawLes => {
    const les = localizeStudyLesson(state.lang, rawLes);
    const isSelected = currentLesson && rawLes.id === currentLesson.id;
    const isDone = completedStudyLessons.has(rawLes.id);
    const isApplied = appliedStudyLessonId === rawLes.id;

    return `
      <article class="mod-route-card study-lesson-card ${isSelected ? "is-selected-lesson" : ""} ${isDone ? "is-done-lesson" : ""}" data-study-select="${rawLes.id}">
        <div class="mod-route-top" style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
          <span class="mod-pivot-badge ${isDone ? "is-ghammaz-pivot" : ""}">
            ${isDone ? "✓" : `#${les.number}`} · ${les.duration}
          </span>
          ${isApplied ? `<span class="badge">${isEn ? "Active on Neck" : "Ativa no Braço"}</span>` : ""}
        </div>
        <div class="mod-target-title">${les.title}</div>
        <div class="mod-route-desc">${les.summary}</div>
        <div class="mod-route-actions">
          <button type="button" class="${isSelected ? "primary" : "plum-btn"} btn-study-apply" data-lesson-id="${rawLes.id}">
            ${isApplied ? (isEn ? "↺ Reapply" : "↺ Reaplicar") : (isEn ? "▶ Apply to Oud" : "▶ Aplicar no Oud")}
          </button>
          <button type="button" class="ghost-btn btn-study-toggle-done" data-lesson-id="${rawLes.id}" title="${isEn ? "Mark completed" : "Marcar como concluída"}">
            ${isDone ? (isEn ? "✓ Done" : "✓ Feita") : (isEn ? "○ Complete" : "○ Concluir")}
          </button>
        </div>
      </article>
    `;
  }).join("");

  const etudesHtml = currentLesson ? buildTechnicalEtudesHtml(currentLesson, isEn) : "";
  const dossierHtml = currentLesson ? buildStudyDossierHtml(currentLesson.id, isEn) : "";

  const activeDetailHtml = locLesson && currentLesson ? `
    <div class="bridge-box sayr-highlight-box study-active-detail" style="margin-top:12px; align-items:flex-start; flex-direction:column; gap:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; width:100%; gap:10px; flex-wrap:wrap;">
        <div>
          <span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:var(--plum);">
            ${isEn ? `Step ${locLesson.number} of ${totalCount} • Practical Mission` : `Passo ${locLesson.number} de ${totalCount} • Missão Prática`}
          </span>
          <div style="font-size:0.96rem; font-weight:800; color:var(--text-main); margin-top:2px;">
            ${locLesson.title}
          </div>
        </div>
        <div class="segmented-pills">
          <button type="button" class="primary compact-btn btn-study-apply" data-lesson-id="${currentLesson.id}">
            ${isCurrentApplied ? (isEn ? "↺ Reapply Preset" : "↺ Reaplicar no Oud") : (isEn ? "▶ Apply to Oud" : "▶ Aplicar no Oud")}
          </button>
          <button type="button" class="plum-btn compact-btn btn-study-audio" data-lesson-id="${currentLesson.id}">
            ${isEn ? "🔊 Play Example" : "🔊 Ouvir Exemplo"}
          </button>
          <button type="button" class="ghost-btn compact-btn btn-study-toggle-done ${isCurrentDone ? "selected" : ""}" data-lesson-id="${currentLesson.id}">
            ${isCurrentDone ? (isEn ? "✓ Completed" : "✓ Concluída") : (isEn ? "✓ Mark Done" : "✓ Concluir Lição")}
          </button>
          ${nextLesson ? `
            <button type="button" class="ghost-btn compact-btn btn-study-next" data-next-id="${nextLesson.id}">
              ${isEn ? "Next →" : "Próxima →"}
            </button>
          ` : ""}
        </div>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:10px; width:100%;">
        <div class="meta-pill" style="margin:0;">
          <strong>🪕 ${isEn ? "What to do on the Oud:" : "O que praticar no espelho:"}</strong>
          <div style="margin-top:3px; color:var(--text-secondary);">${locLesson.task}</div>
        </div>
        <div class="meta-pill" style="margin:0;">
          <strong>👂 ${isEn ? "Ear & Technique Tip:" : "Dica de Ouvido & Técnica:"}</strong>
          <div style="margin-top:3px; color:var(--text-secondary);">${locLesson.earTip}</div>
        </div>
      </div>

      ${etudesHtml}

      ${dossierHtml}

      <div class="segmented-pills" style="width:100%; padding-top:4px; border-top:1px solid var(--border-subtle);">
        <button type="button" class="${currentLesson.suggestLivePitch && !isPitchListening() ? "plum-btn" : "ghost-btn"} compact-btn btn-study-live-pitch ${isPitchListening() ? "active-toggle" : ""}">
          ${isPitchListening()
            ? (isEn ? "🎙 Live Pitch: ON" : "🎙 Escuta 24-TET: ATIVA")
            : (isEn ? "🎙 Check Intonation (Mic / Line)" : "🎙 Checar Afinação (Mic / Linha)")}
        </button>
        ${currentLesson.suggestTimbreCompare ? `
          <button type="button" class="plum-btn compact-btn btn-study-timbre">
            ${getOudTimbreProfile() === "egyptian"
              ? (isEn ? "🪕 Tone: Egyptian → Syrian" : "🪕 Timbre: Egípcio → Sírio")
              : (isEn ? "🪕 Tone: Syrian → Egyptian" : "🪕 Timbre: Sírio → Egípcio")}
          </button>
        ` : ""}
        ${currentLesson.suggestDrone ? `
          <button type="button" class="ghost-btn compact-btn btn-study-drone ${state.droneActive ? "active-toggle" : ""}">
            ${state.droneActive
              ? (isEn ? "🔊 Drone: ON" : "🔊 Drone: LIGADO")
              : (isEn ? "🔊 Turn on Drone" : "🔊 Ligar Drone")}
          </button>
        ` : ""}
        ${currentLesson.suggestIqa ? `
          <button type="button" class="ghost-btn compact-btn btn-study-iqa ${isIqaPlaying ? "active-toggle" : ""}">
            ${isIqaPlaying
              ? (isEn ? "⏹ Stop Iqa'" : "⏹ Parar Iqa'")
              : (isEn ? `🥁 Start Iqa' (${currentLesson.preset.bpm || 86} BPM)` : `🥁 Iniciar Iqa' (${currentLesson.preset.bpm || 86} BPM)`)}
          </button>
        ` : ""}
        ${currentLesson.suggestZenMode ? `
          <button type="button" class="plum-btn compact-btn btn-study-zen">
            ${isEn ? "🪷 Enter Zen Stage (F)" : "🪷 Entrar no Modo Imersivo (Zen)"}
          </button>
        ` : ""}
        ${currentLesson.openRadarHint ? `
          <button type="button" class="plum-btn compact-btn btn-study-open-radar">
            ${isEn ? "🧭 Open Modulation Radar" : "🧭 Abrir Radar de Modulação"}
          </button>
        ` : ""}
        <button type="button" class="ghost-btn compact-btn btn-study-glossary" data-term="${currentLesson.glossaryTerm}">
          ${isEn ? "📖 Related Glossary Term" : "📖 Ver Termo no Glossário"}
        </button>
      </div>
    </div>
  ` : "";

  pane.innerHTML = `
    <div class="deck-mod-top study-guide-top">
      <div class="deck-mod-heading">
        <h2 class="info-subhead">${isEn ? "🎓 Guided Oud Study Path — From Zero to Taqsim" : "🎓 Guia de Estudos Progressivo — Do Zero ao Taqsim"}</h2>
        <p class="tuning-description">${locMod.subtitle}</p>
      </div>
      <div class="study-progress-wrap" style="display:flex; align-items:center; gap:10px; min-width:220px; flex-wrap:wrap;">
        <div style="flex:1; min-width:130px;">
          <div style="display:flex; justify-content:space-between; font-size:0.73rem; font-weight:700; color:var(--text-secondary); margin-bottom:4px;">
            <span>${isEn ? "Progress" : "Progresso"}</span>
            <span style="color:var(--accent);">${doneCount}/${totalCount} (${pct}%)</span>
          </div>
          <div style="height:7px; border-radius:999px; background:var(--bg-input); border:1px solid var(--border-subtle); overflow:hidden;">
            <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, var(--accent), var(--plum)); transition:width 0.25s ease;"></div>
          </div>
        </div>
        ${doneCount > 0 ? `
          <button type="button" class="ghost-btn compact-btn btn-study-reset" title="${isEn ? "Reset progress" : "Reiniciar progresso"}">
            ↺ ${isEn ? "Reset" : "Zerar"}
          </button>
        ` : ""}
      </div>
    </div>

    <div class="study-level-bar" role="group" aria-label="${isEn ? "Filter chapters by level" : "Filtrar capítulos por nível"}">
      ${levelFilterHtml}
    </div>

    <div class="segmented-pills study-modules-bar" style="margin-bottom:12px;">
      ${modulesTabsHtml}
    </div>

    <div class="mod-routes-grid study-lessons-grid">
      ${lessonCardsHtml}
    </div>

    ${activeDetailHtml}
  `;

  pane.querySelector(".study-dossier-toggle")?.addEventListener("click", () => {
    isStudyDossierOpen = !isStudyDossierOpen;
    renderStudyGuidePane();
  });

  pane.querySelectorAll(".study-level-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      const lvl = /** @type {any} */ (/** @type {HTMLElement} */ (btn).dataset.studyLevel || "ALL");
      activeStudyLevelFilter = lvl;
      const matchingMods = lvl === "ALL"
        ? STUDY_MODULES
        : STUDY_MODULES.filter(m => m.level === lvl);
      if (matchingMods.length && !matchingMods.some(m => m.id === activeStudyModuleId)) {
        const nextMod = matchingMods[0];
        activeStudyModuleId = nextMod.id;
        const firstPending = nextMod.lessons.find(l => !completedStudyLessons.has(l.id)) || nextMod.lessons[0];
        if (firstPending) activeStudyLessonId = firstPending.id;
        saveStudyProgress();
      }
      renderStudyGuidePane();
    });
  });

  pane.querySelectorAll(".study-mod-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const modId = /** @type {HTMLElement} */ (btn).dataset.studyModule;
      if (!modId) return;
      activeStudyModuleId = modId;
      const foundMod = STUDY_MODULES.find(m => m.id === modId);
      if (foundMod && foundMod.lessons.length) {
        const firstUnfinished = foundMod.lessons.find(l => !completedStudyLessons.has(l.id)) || foundMod.lessons[0];
        activeStudyLessonId = firstUnfinished.id;
      }
      saveStudyProgress();
      renderStudyGuidePane();
    });
  });

  pane.querySelectorAll(".study-lesson-card").forEach(card => {
    card.addEventListener("click", (ev) => {
      const targetEl = ev.target instanceof Element ? ev.target : null;
      if (targetEl?.closest("button")) return;
      const lesId = /** @type {HTMLElement} */ (card).dataset.studySelect;
      if (!lesId) return;
      activeStudyLessonId = lesId;
      saveStudyProgress();
      renderStudyGuidePane();
    });
  });

  pane.querySelectorAll(".btn-study-apply").forEach(btn => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const lesId = /** @type {HTMLElement} */ (btn).dataset.lessonId;
      if (lesId) applyStudyLessonPreset(lesId, { playConfirmTone: true, scrollToStage: true });
    });
  });

  pane.querySelectorAll(".btn-study-audio").forEach(btn => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const lesId = /** @type {HTMLElement} */ (btn).dataset.lessonId;
      if (lesId) playStudyLessonExample(lesId);
    });
  });

  pane.querySelectorAll(".btn-study-toggle-done").forEach(btn => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const lesId = /** @type {HTMLElement} */ (btn).dataset.lessonId;
      if (lesId) toggleStudyLessonComplete(lesId);
    });
  });

  pane.querySelector(".btn-study-next")?.addEventListener("click", (ev) => {
    const nextId = /** @type {HTMLElement | null} */ (ev.currentTarget)?.dataset.nextId;
    if (nextId) {
      applyStudyLessonPreset(nextId, { playConfirmTone: true, scrollToStage: false });
    }
  });

  pane.querySelector(".btn-study-live-pitch")?.addEventListener("click", () => {
    if (currentLesson && appliedStudyLessonId !== currentLesson.id) {
      applyStudyLessonPreset(currentLesson.id, { playConfirmTone: false, scrollToStage: false });
    }
    openLiveTunerBar("MAQAM_24TET", true);
    renderStudyGuidePane();
  });

  pane.querySelector(".btn-study-timbre")?.addEventListener("click", () => {
    toggleOudTimbreProfileWithPreview();
  });

  pane.querySelector(".btn-study-drone")?.addEventListener("click", () => {
    const droneBtn = document.getElementById("btn-drone");
    if (droneBtn) {
      commitStatePatch({ droneActive: toggleDroneAudio(state.droneActive, state.rootQ, droneBtn) }, { syncControls: false, refresh: false });
    }
    syncCommandBarSummaries();
    syncLiveTunerUI();
    renderStudyGuidePane();
  });

  pane.querySelector(".btn-study-iqa")?.addEventListener("click", () => {
    if (currentLesson && appliedStudyLessonId !== currentLesson.id) {
      applyStudyLessonPreset(currentLesson.id, { playConfirmTone: false, scrollToStage: false });
    }
    toggleIqaPlayback();
    syncLiveTunerUI();
    renderStudyGuidePane();
  });

  pane.querySelector(".btn-study-zen")?.addEventListener("click", () => {
    if (currentLesson && appliedStudyLessonId !== currentLesson.id) {
      applyStudyLessonPreset(currentLesson.id, { playConfirmTone: false, scrollToStage: false });
    }
    toggleZenMode(true);
  });

  pane.querySelector(".btn-study-open-radar")?.addEventListener("click", () => {
    if (currentLesson && appliedStudyLessonId !== currentLesson.id) {
      applyStudyLessonPreset(currentLesson.id, { playConfirmTone: false, scrollToStage: false });
    }
    setActiveDeckTab("modulation");
  });

  pane.querySelector(".btn-study-glossary")?.addEventListener("click", (ev) => {
    const termId = /** @type {HTMLElement | null} */ (ev.currentTarget)?.dataset.term;
    openGlossary(termId);
  });

  pane.querySelector(".btn-study-reset")?.addEventListener("click", () => {
    const msg = isEn
      ? "Reset all completed lessons in the Study Guide?"
      : "Deseja zerar o progresso de todas as lições do Guia de Estudos?";
    if (!window.confirm(msg)) return;
    completedStudyLessons.clear();
    activeStudyLevelFilter = "ALL";
    activeStudyModuleId = STUDY_MODULES[0]?.id || "mod_foundation";
    activeStudyLessonId = STUDY_MODULES[0]?.lessons[0]?.id || "les_01_open_first_pos";
    appliedStudyLessonId = null;
    saveStudyProgress();
    syncCommandBarSummaries();
    renderStudyGuidePane();
  });
}

/** @type {Record<string, { targetMode: "MAQAM"|"JINS", targetId: string, offsetQ: number, isGhammaz?: boolean, pivotPt: string, pivotEn: string, reasonPt: string, reasonEn: string }[]>} */
const MODULATION_RADAR_MAP = {
  maqam_rast: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Converte o 2º Jins em Hijaz sobre o Ghammaz, criando a célebre sonoridade de Maqam Suznak.",
      reasonEn: "Converts the upper Jins into Hijaz on the Ghammaz, creating the classic Maqam Suznak color."
    },
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Inflexão descendente natural do Rast introduzindo o 7º grau menor (Ajam) rumo à resolução.",
      reasonEn: "Natural descending inflection of Rast introducing the minor 7th (Ajam) toward resolution."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_bayati",
      offsetQ: 4,
      pivotPt: "2º Grau (Dukah +1 Tom)",
      pivotEn: "2nd Degree (Dukah +1 Tone)",
      reasonPt: "Modulação lírica para o 2º grau aproveitando as notas comuns da família Rast/Bayati.",
      reasonEn: "Lyrical modulation to the 2nd degree sharing the core pitches of the Rast/Bayati family."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_sikah",
      offsetQ: 7,
      pivotPt: "3º Grau Neutro (Sikah)",
      pivotEn: "Neutral 3rd (Sikah)",
      reasonPt: "Ancora temporariamente o repouso sobre a terça neutra microtonal (3-) do próprio Rast.",
      reasonEn: "Temporarily anchors the tonic directly on Rast's microtonal neutral third (3-)."
    }
  ],
  maqam_bayati: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Transforma o 4º grau em Jins Hijaz (caminho de Bayati Shuri / Karjighar), muito frequente no Taqsim.",
      reasonEn: "Turns the 4th degree into Jins Hijaz (Bayati Shuri / Karjighar pathway), a staple in Taqsim."
    },
    {
      targetMode: "JINS",
      targetId: "jins_rast",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Abre o registro superior com Jins Rast sobre a 4ª justa, iluminando o fraseado ascendente.",
      reasonEn: "Opens the upper register with Jins Rast on the 4th degree, brightening ascending phrases."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_saba",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Bemoliza o 4º grau (b4 diminuta) mantendo a mesma tônica, mergulhando na tensão do Saba.",
      reasonEn: "Lowers the 4th degree (diminished b4) on the same tonic, shifting into the tension of Saba."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_rast",
      offsetQ: 20,
      pivotPt: "7º Grau Subtônico (-1 Tom)",
      pivotEn: "Subtonic b7 (-1 Whole Tone)",
      reasonPt: "Desce 1 tom inteiro abaixo do Qarar para repousar na matriz fundamental do Maqam Rast.",
      reasonEn: "Steps down 1 whole tone below the Qarar to rest on the foundational Maqam Rast matrix."
    }
  ],
  maqam_saba: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 6,
      isGhammaz: true,
      pivotPt: "3º Grau Menor (Ghammaz b3)",
      pivotEn: "Minor 3rd (Ghammaz b3)",
      reasonPt: "Isola o Jins Hijaz superposto no 3º grau onde o Saba constrói seu clímax melódico.",
      reasonEn: "Isolates the overlapping Jins Hijaz on the 3rd degree where Saba builds its melodic climax."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_bayati",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Relaxa a 4ª diminuta de volta para a 4ª justa, dissolvendo a tensão do Saba em Bayati.",
      reasonEn: "Relaxes the diminished 4th back to a perfect 4th, resolving Saba's tension into Bayati."
    },
    {
      targetMode: "JINS",
      targetId: "jins_ajam",
      offsetQ: 16,
      pivotPt: "6º Grau Menor (b6)",
      pivotEn: "Minor 6th Degree (b6)",
      reasonPt: "Janela luminosa em modo maior (Jins Ajam) sobre o 6º grau antes da descida final.",
      reasonEn: "Bright major window (Jins Ajam) on the 6th degree before the final cadential descent."
    }
  ],
  maqam_hijaz: [
    {
      targetMode: "JINS",
      targetId: "jins_rast",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Rota ascendente clássica do Hijaz introduzindo o 6º grau neutro microtonal.",
      reasonEn: "Classic ascending pathway of Hijaz introducing the microtonal neutral 6th."
    },
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Estabelece repouso menor suave sobre o Ghammaz preparando a descida pelo b6.",
      reasonEn: "Establishes a gentle minor rest on the Ghammaz preparing the descent through b6."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_bayati",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Suaviza a tônica convertendo o salto de 2ª aumentada do Hijaz na 2ª neutra do Bayati.",
      reasonEn: "Softens the tonic by converting Hijaz's augmented 2nd leap into Bayati's neutral 2nd."
    },
    {
      targetMode: "JINS",
      targetId: "jins_nikriz",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Desloca o salto de 2ª aumentada dos graus b2–3 para os graus b3–#4 na mesma tônica.",
      reasonEn: "Shifts the augmented 2nd leap from degrees b2–3 to degrees b3–#4 on the same tonic."
    }
  ],
  maqam_nahawand: [
    {
      targetMode: "JINS",
      targetId: "jins_ajam",
      offsetQ: 6,
      pivotPt: "3º Grau (Relativo Maior b3)",
      pivotEn: "3rd Degree (Relative Major b3)",
      reasonPt: "Modulação clássica para o Jins Ajam relativo maior sobre a mediante.",
      reasonEn: "Classic modulation to the relative major Jins Ajam on the mediant."
    },
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Ativa a sensível (7º grau maior) no tetracorde superior para impulsionar a resolução.",
      reasonEn: "Activates the leading tone (major 7th) in the upper tetrachord to drive resolution."
    },
    {
      targetMode: "JINS",
      targetId: "jins_bayati",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Introduz inflexão microtonal sobre a dominante (6º grau neutro).",
      reasonEn: "Introduces a microtonal inflection on the dominant (neutral 6th degree)."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_nikriz",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Eleva o 4º grau (#4) sobre a mesma base menor para criar tensão cromática.",
      reasonEn: "Raises the 4th degree (#4) over the same minor base to create chromatic pull."
    }
  ],
  maqam_kurd: [
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Expande o desenvolvimento melódico sobre o tetracorde menor do 4º grau.",
      reasonEn: "Expands melodic development over the minor tetrachord on the 4th degree."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_hijaz",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Eleva a 3ª menor para 3ª maior mantendo o b2, transformando Kurd em Hijaz.",
      reasonEn: "Raises the minor 3rd to a major 3rd while keeping b2, transforming Kurd into Hijaz."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_bayati",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Eleva o b2 em 1 quarto de tom (2-), transitando do mundo 12-TET para o Bayati.",
      reasonEn: "Raises b2 by a quarter tone (2-), transitioning from 12-TET Phrygian into Bayati."
    }
  ],
  maqam_sikah: [
    {
      targetMode: "JINS",
      targetId: "jins_rast",
      offsetQ: 7,
      isGhammaz: true,
      pivotPt: "3º Grau (Ghammaz)",
      pivotEn: "3rd Degree (Ghammaz)",
      reasonPt: "Desenvolve o Jins Rast sobre a nota natural 7 quartos de tom acima da tônica Sikah.",
      reasonEn: "Develops Jins Rast on the natural pitch 7 quarter tones above the Sikah tonic."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_huzam",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Converte o 2º Jins em Hijaz mantendo a mesma tônica microtonal Sikah.",
      reasonEn: "Converts the upper Jins into Hijaz while keeping the same microtonal Sikah tonic."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_rast",
      offsetQ: 17,
      pivotPt: "Base Rast (-3ª Neutra)",
      pivotEn: "Rast Matrix (-Neutral 3rd)",
      reasonPt: "Resolve descendentemente na fundamental Rast situada uma terça neutra abaixo.",
      reasonEn: "Resolves downward onto the underlying Rast tonic a neutral third below."
    }
  ],
  maqam_huzam: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 7,
      isGhammaz: true,
      pivotPt: "3º Grau (Ghammaz)",
      pivotEn: "3rd Degree (Ghammaz)",
      reasonPt: "Isola o brilho do Jins Hijaz ancorado no 3º grau do Huzam.",
      reasonEn: "Isolates the bright Jins Hijaz anchored on Huzam's 3rd degree."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_sikah",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Suaviza o tetracorde superior trocando Hijaz por Jins Rast.",
      reasonEn: "Softens the upper tetrachord by replacing Hijaz with Jins Rast."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_rast",
      offsetQ: 17,
      pivotPt: "Base Rast (-3ª Neutra)",
      pivotEn: "Rast Matrix (-Neutral 3rd)",
      reasonPt: "Conecta o Huzam à sua matriz Rast subjacente.",
      reasonEn: "Connects Huzam to its underlying Rast parent scale."
    }
  ],
  maqam_nikriz: [
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Explora o tetracorde menor superior a partir do Ghammaz de 5ª justa.",
      reasonEn: "Explores the upper minor tetrachord starting on the perfect 5th Ghammaz."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_nawa_athar",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Troca o 2º Jins por Hijaz, criando dois saltos de 2ª aumentada na mesma oitava.",
      reasonEn: "Replaces the upper Jins with Hijaz, creating two augmented 2nd leaps in one octave."
    },
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 4,
      pivotPt: "2º Grau (+1 Tom)",
      pivotEn: "2nd Degree (+1 Tone)",
      reasonPt: "Pivô interno: o pentacorde Nikriz contém exatamente um Jins Hijaz a partir do 2º grau.",
      reasonEn: "Internal pivot: the Nikriz pentachord embeds a complete Jins Hijaz starting on its 2nd degree."
    }
  ],
  maqam_nawa_athar: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Isola o Jins Hijaz superior responsável pela sensível dramática rumo à oitava.",
      reasonEn: "Isolates the upper Jins Hijaz responsible for the dramatic leading tone to the octave."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_nikriz",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Relaxa o registro superior convertendo o 2º Jins em Nahawand.",
      reasonEn: "Relaxes the upper register by converting the 2nd Jins into Nahawand."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_nahawand",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Resolve o #4 de volta para a 4ª justa mantendo a tônica e a dominante.",
      reasonEn: "Resolves #4 back to a perfect 4th while keeping the same tonic and dominant."
    }
  ],
  maqam_ajam: [
    {
      targetMode: "MAQAM",
      targetId: "maqam_nahawand",
      offsetQ: 18,
      pivotPt: "6º Grau (Relativo Menor)",
      pivotEn: "6th Degree (Relative Minor)",
      reasonPt: "Modulação clássica para o Maqam Nahawand relativo menor.",
      reasonEn: "Classic modulation to the relative minor Maqam Nahawand."
    },
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Inflexão descendente com b7 menor (caminho Mixolídio de fechamento do Ajam).",
      reasonEn: "Descending inflection with minor b7 (Mixolydian cadential path of Ajam)."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_rast",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Inflexiona a 3ª e a 7ª maiores em 1 quarto de tom para baixo, entrando em Rast.",
      reasonEn: "Inflects the major 3rd and 7th down by a quarter tone, entering Maqam Rast."
    }
  ]
};

function getModulationRoutesForCurrentState() {
  const activeStruct = getActiveStructure(state);
  const effRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;

  if (state.mode === "MAQAM" && MODULATION_RADAR_MAP[state.entityId]) {
    return MODULATION_RADAR_MAP[state.entityId].map(r => ({
      ...r,
      absTargetRootQ: (effRootQ + r.offsetQ) % 24
    }));
  }

  const entityObj = /** @type {any} */ (activeStruct.entity);
  const ghammazQ = activeStruct.ghammazOffsets?.[0] ?? 14;
  /** @type {any[]} */
  const fallbackRoutes = [];

  if (entityObj.bridge_maqam && MODULATION_RADAR_MAP[entityObj.bridge_maqam]) {
    fallbackRoutes.push({
      targetMode: "MAQAM",
      targetId: entityObj.bridge_maqam,
      offsetQ: 0,
      pivotPt: "1º Grau (Matriz Modal Completa)",
      pivotEn: "1st Degree (Full Modal Matrix)",
      reasonPt: "Expande o estudo atual para o Maqam completo correspondente na mesma tônica.",
      reasonEn: "Expands the current study into its full parent Maqam on the same tonic.",
      absTargetRootQ: effRootQ
    });
    MODULATION_RADAR_MAP[entityObj.bridge_maqam].slice(0, 2).forEach(r => {
      fallbackRoutes.push({
        ...r,
        absTargetRootQ: (effRootQ + r.offsetQ) % 24
      });
    });
    return fallbackRoutes;
  }

  const parentMaqam = DB.maqamat.find(m => m.id.replace("maqam_", "") === state.entityId.replace("jins_", "")) || DB.maqamat[0];
  fallbackRoutes.push({
    targetMode: "MAQAM",
    targetId: parentMaqam.id,
    offsetQ: 0,
    pivotPt: "1º Grau (Maqam Completo)",
    pivotEn: "1st Degree (Full Maqam)",
    reasonPt: "Conecta este Jins ao Maqam completo para praticar o 1º e 2º tetracordes encadeados.",
    reasonEn: "Connects this Jins to its full Maqam to practice the lower and upper tetrachords together.",
    absTargetRootQ: effRootQ
  });

  fallbackRoutes.push({
    targetMode: "JINS",
    targetId: "jins_rast",
    offsetQ: ghammazQ,
    isGhammaz: true,
    pivotPt: `Pivô Ghammaz (+${ghammazQ}q)`,
    pivotEn: `Ghammaz Pivot (+${ghammazQ}q)`,
    reasonPt: "Abre um Jins Rast sobre a nota-pivô (Ghammaz) para desenvolver o registro agudo.",
    reasonEn: "Opens a Jins Rast on the Ghammaz pivot note to develop the upper register.",
    absTargetRootQ: (effRootQ + ghammazQ) % 24
  });

  fallbackRoutes.push({
    targetMode: "JINS",
    targetId: "jins_hijaz",
    offsetQ: ghammazQ,
    isGhammaz: true,
    pivotPt: `Pivô Ghammaz (+${ghammazQ}q)`,
    pivotEn: `Ghammaz Pivot (+${ghammazQ}q)`,
    reasonPt: "Introduz tensão de 2ª aumentada (Jins Hijaz) sobre o Ghammaz antes de retornar à tônica.",
    reasonEn: "Introduces augmented 2nd tension (Jins Hijaz) on the Ghammaz before returning to the tonic.",
    absTargetRootQ: (effRootQ + ghammazQ) % 24
  });

  return fallbackRoutes;
}

function hasValidAnchor() {
  return typeof state.anchorAbsQ === "number" && !Number.isNaN(state.anchorAbsQ) && state.anchorAbsQ >= 0;
}

function resolvePitchClassQ(targetPitch) {
  if (!targetPitch) return null;
  if (typeof targetPitch.pitchClassQ === "number" && !Number.isNaN(targetPitch.pitchClassQ)) {
    return ((targetPitch.pitchClassQ % 24) + 24) % 24;
  }
  if (typeof targetPitch.absQ === "number" && !Number.isNaN(targetPitch.absQ)) {
    return ((targetPitch.absQ % 24) + 24) % 24;
  }
  return null;
}

/**
 * Abre ou fecha os menus flutuantes do cabeçalho ("audio" | "main" | null).
 * @param {"audio"|"main"|null} which
 */
/**
 * Abre ou fecha um dos 4 painéis da Barra Única (Popover no Desktop / Bottom Sheet no Mobile).
 * @param {number | null} idx
 */

const overlaysAndModals = createOverlaysAndModals({
  getState: () => state,
  getPitchClasses24: () => PITCH_CLASSES_24,
  getGlossaryEntries: () => GLOSSARY_ENTRIES,
  getActiveHeaderMenu: () => activeHeaderMenu,
  setActiveHeaderMenu: (val) => { activeHeaderMenu = val; },
  getActivePopoverIdx: () => activePopoverIdx,
  setActivePopoverIdx: (val) => { activePopoverIdx = val; },
  getGlossaryQuery: () => glossaryQuery,
  setGlossaryQuery: (val) => { glossaryQuery = val; },
  getGlossaryCategory: () => glossaryCategory,
  setGlossaryCategory: (val) => { glossaryCategory = val; },
  localizeGlossaryEntry,
  t,
  escapeHtml,
  scheduleUiTimeout,
});

const {
  setActiveHeaderMenu,
  setActivePopover,
  showTouchLoupeFeedback,
  renderGlossaryList,
  openGlossary,
  closeGlossary,
} = overlaysAndModals;

function toggleAppTheme() {
  commitStatePatch({ theme: state.theme === "light" ? "dark" : "light" }, { syncControls: false, refresh: false });
  try {
    localStorage.setItem("oud_theme_pref", state.theme);
  } catch {
    // Ignora
  }
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", state.theme === "light" ? "#f4eee4" : "#100d0b");
  }
  syncControlsWithState();
  refreshAll();
}

function toggleZenMode(forceVal) {
  setActivePopover(null);
  setActiveHeaderMenu(null);
  isZenMode = typeof forceVal === "boolean" ? forceVal : !isZenMode;
  document.body.setAttribute("data-zen", isZenMode ? "true" : "false");
  syncControlsWithState();
  refreshAll();
}

function toggleSidebarCollapsed(forceVal) {
  userOverrodeSidebar = true;
  isSidebarCollapsed = typeof forceVal === "boolean" ? forceVal : !isSidebarCollapsed;
  document.body.setAttribute("data-sidebar", isSidebarCollapsed ? "collapsed" : "expanded");
  syncControlsWithState();
}

/** @param {"theory"|"modulation"|"study"} tabName */
function setActiveDeckTab(tabName) {
  activeDeckTab = normalizeDeckTab(tabName);
  if (isSidebarCollapsed) {
    isSidebarCollapsed = false;
    userOverrodeSidebar = true;
    document.body.setAttribute("data-sidebar", "expanded");
  }

  document.querySelectorAll(".deck-tab-btn").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    const isAct = normalizeDeckTab(el.dataset.deckTab) === activeDeckTab;
    el.classList.toggle("active", isAct);
    el.setAttribute("aria-selected", isAct ? "true" : "false");
  });

  document.querySelectorAll(".deck-pane").forEach(pane => {
    const el = /** @type {HTMLElement} */ (pane);
    el.classList.toggle("active-pane", normalizeDeckTab(el.dataset.deckPane) === activeDeckTab);
  });

  syncControlsWithState();
}

function toggleIqaPlayback() {
  const btnToggleIqa = document.getElementById("btn-toggle-iqa");
  if (isIqaPlaying) {
    stopIqaEngine();
    isIqaPlaying = false;
    activeIqaBeatIdx = -1;
    if (btnToggleIqa) {
      btnToggleIqa.textContent = safeT("btnStartIqa", "▶ Iniciar Iqa'", "▶ Start Iqa'");
      btnToggleIqa.classList.remove("active-toggle");
    }
    renderIqaBeatGrid();
  } else {
    isIqaPlaying = true;
    if (btnToggleIqa) {
      btnToggleIqa.textContent = safeT("btnStopIqa", "⏹ Parar Iqa'", "⏹ Stop Iqa'");
      btnToggleIqa.classList.add("active-toggle");
    }
    restartIqaIfPlaying();
  }
  syncCommandBarSummaries();
  syncLiveTunerUI();
}

function applySelectedPitchAsRoot(targetPitch) {
  const newRootQ = resolvePitchClassQ(targetPitch);
  if (newRootQ === null) return;

  clearAllActivePlayback();
  clearShiftOverlay(false);

  if (targetPitch && typeof targetPitch.absQ === "number" && !Number.isNaN(targetPitch.absQ)) {
    commitStatePatch({ octavePathDir: "ASC" }, { syncControls: false, refresh: false });
  } else {
  }

  if (state.mode === "CADENCE") {
  }

  const selRoot = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-root"));
  if (selRoot) selRoot.value = String(state.rootQ);

  if (state.shapeMode === "CLOSED_BOX" && targetPitch && typeof targetPitch.qFromNut === "number" && targetPitch.qFromNut >= 1) {
    commitStatePatch({ boxAnchorQ: Math.max(1, Math.min(10, targetPitch.qFromNut)) }, { syncControls: false, refresh: false });
    const sliderBox = /** @type {HTMLInputElement | null} */ (document.getElementById("slider-box"));
    const labelBoxPos = document.getElementById("label-box-pos");
    if (sliderBox) sliderBox.value = String(state.boxAnchorQ);
    if (labelBoxPos) {
      const semiApprox = (state.boxAnchorQ / 2).toFixed(1).replace(".0", "");
      labelBoxPos.textContent = `S${semiApprox} (q=${state.boxAnchorQ})`;
    }
  }

  suspendPitchDetection(700);
  const feedbackFreq = (targetPitch && typeof targetPitch.freq === "number")
    ? targetPitch.freq
    : 130.81 * Math.pow(2, state.rootQ / 24);
  playPluckedNote(feedbackFreq, 1.4);

  selectedStaffOrNeckPitch = null;
  syncControlsWithState();
  refreshAll();
  commitStatePatch({
    rootQ: newRootQ,
    anchorAbsQ: targetPitch.absQ,
    octavePathOnly: true,
    anchorAbsQ: null,
    octavePathOnly: false,
    cadenceStepIndex: 0,
  }, { syncControls: false, refresh: false });
}

function handlePlayAnchoredOctavePath() {
  if (!hasValidAnchor()) return;
  const pathNodes = computeAnchoredOctavePath(state);
  if (!pathNodes.length) return;

  clearAllActivePlayback();
  clearShiftOverlay(false);

  if (!state.octavePathOnly) {
    commitStatePatch({ octavePathOnly: true }, { syncControls: false, refresh: false });
    syncControlsWithState();
  }

  const steps = pathNodes.map(n => ({
    interval_q: n.absQ - state.rootQ,
    dur_ms: 360,
    accent: n.degree === "1" || n.degree === "8" || n.degree === "5"
  }));

  suspendPitchDetection(steps.length * 360 + 500);
  playTaqsimPhrase(state.rootQ, steps, {}, (stepIdx) => {
    highlightedSequenceStep = stepIdx;
    refreshAll();
  });
}

function syncCommandBarSummaries() {
  const activeStruct = getActiveStructure(state);
  const entity = localizeEntity(state.lang, activeStruct.entity);
  const safeRootQ = ((state.rootQ % 24) + 24) % 24;
  const safeEffRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;
  const rootName = PITCH_CLASSES_24[safeRootQ]?.flat || "C";
  const effRootName = PITCH_CLASSES_24[safeEffRootQ]?.flat || "C";

  const rawTuning = DB.tunings.find(x => x.id === state.tuningId) || DB.tunings[0];
  const tuning = localizeEntity(state.lang, rawTuning);
  const rawIqa = DB.iqaat.find(x => x.id === state.iqaId) || DB.iqaat[0];
  const iqa = localizeEntity(state.lang, rawIqa);

  const shortTuning = tuning.name.split("(")[0].trim();
  const shortIqa = iqa.name.split("(")[0].split("—")[0].trim();
  const dirArrow = state.mode === "MAQAM" ? (state.direction === "ASC" ? " ↑" : " ↓") : "";

  const shapeShort = state.shapeMode === "FULL_NECK"
    ? (state.lang === "en" ? "Full" : "Completo")
    : (state.shapeMode === "OPEN_FIRST_POS"
      ? (state.lang === "en" ? "I · 1st Pos" : "I · 1ª Pos")
      : (state.shapeMode === "POS_SECOND"
        ? (state.lang === "en" ? "II · 2nd Pos" : "II · 2ª Pos")
        : (state.shapeMode === "POS_THIRD_BODY"
          ? (state.lang === "en" ? "III · Body" : "III · Tampo")
          : (state.lang === "en" ? "Box" : "Móvel"))));

  const lblShort = state.labelMode === "NOTE_NAME"
    ? (state.lang === "en" ? "Notes" : "Cifra")
    : (state.labelMode === "DEGREE"
      ? (state.lang === "en" ? "Deg" : "Grau")
      : (state.labelMode === "FINGER"
        ? (state.lang === "en" ? "Fingers" : "Dedos")
        : (state.lang === "en" ? "Arabic" : "Árabe")));

  const v0 = document.getElementById("cmd-val-0");
  const v1 = document.getElementById("cmd-val-1");
  const v2 = document.getElementById("cmd-val-2");
  const v3 = document.getElementById("cmd-val-3");

  if (v0) v0.textContent = `${shortTuning} • ${rootName}`;
  if (v1) v1.textContent = `${entity.name.replace(/^\[.*?\]\s*/, "")} (${effRootName})${dirArrow}`;
  if (v2) v2.textContent = `${shapeShort} • ${lblShort}`;
  if (v3) v3.textContent = `${shortIqa} • ${state.bpm} BPM${isIqaPlaying ? " ●" : ""}`;

  const droneDot = document.getElementById("menu-drone-dot");
  if (droneDot) {
    droneDot.style.display = state.droneActive ? "block" : "none";
  }

  const setKicker = (sel, pt, en) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = state.lang === "en" ? en : pt;
  };
  setKicker('[data-i18n="menuSecStudy"]', "Áudio & Estudo", "Audio & Study");
  setKicker('[data-i18n="menuSecPrefs"]', "Preferências", "Preferences");
  setKicker('[data-i18n="menuSecApp"]', "Aplicativo", "App");
  setKicker('[data-i18n="cmdKickerMizan"]', "Afinação & Qarar", "Tuning & Qarar");
  setKicker('[data-i18n="cmdKickerMode"]', "Modalidade", "Mode / Maqam");
  setKicker('[data-i18n="cmdKickerNeck"]', "Espelho & Guias", "Fingerboard & Guides");
  setKicker('[data-i18n="cmdKickerIqa"]', "Ritmo (Iqa')", "Rhythm (Iqa')");
  setKicker('[data-i18n="popoverNeckTitle"]', "Espelho, Posições & Visualização", "Fingerboard, Positions & View");
  setKicker('[data-i18n="lblTradition"]', "Escola de Luthieria", "Luthierie Tradition");
  setKicker('[data-i18n="lblVisualLayers"]', "Camadas & Ergonomia", "Layers & Ergonomics");
  setKicker('[data-i18n="deckTabTheory"]', "Teoria & Sayr", "Theory & Sayr");
  setKicker('[data-i18n="deckTabModulation"]', "Radar de Modulação", "Modulation Radar");
  setKicker('[data-i18n="deckTabStudy"]', "Guia de Estudos", "Study Guide");
  setKicker('[data-i18n="deckTabGuide"]', "Guia de Estudos", "Study Guide");

  const studyCountBadge =
    document.getElementById("deck-study-count") ||
    document.getElementById("deck-guide-count");
  if (studyCountBadge) {
    studyCountBadge.textContent = `${completedStudyLessons.size}/${getAllStudyLessons().length}`;
  }

  const deckStatus = document.getElementById("deck-mini-status");
  if (deckStatus) {
    deckStatus.textContent = `${entity.name.replace(/^\[.*?\]\s*/, "")} • ${effRootName}${dirArrow}`;
  }

  const btnDeckCollapse = document.getElementById("btn-deck-collapse");
  if (btnDeckCollapse) {
    btnDeckCollapse.setAttribute("aria-expanded", isSidebarCollapsed ? "false" : "true");
    btnDeckCollapse.textContent = isSidebarCollapsed
      ? (state.lang === "en" ? "▸ Expand" : "▸ Expandir")
      : (state.lang === "en" ? "▾ Collapse" : "▾ Recolher");
  }

  document.querySelectorAll(".btn-close-popover").forEach(btn => {
    btn.textContent = safeT("btnMobileDone", "✓ Concluir", "✓ Done");
  });

  const btnMobPlay = document.getElementById("btn-mob-play");
  const btnMobTaqsim = document.getElementById("btn-mob-taqsim");
  const btnMobTheory = document.getElementById("btn-mob-theory");

  if (btnMobPlay) btnMobPlay.textContent = safeT("mobileDockPlay", "▶ Tocar", "▶ Play");
  if (btnMobTaqsim) {
    btnMobTaqsim.textContent = safeT("mobileDockTaqsim", "🎶 Taqsim", "🎶 Taqsim");
    btnMobTaqsim.style.opacity = state.mode === "MAQAM" ? "1" : "0.45";
  }
  syncMobileMicButton();
  if (btnMobTheory) {
    btnMobTheory.classList.toggle("active-toggle", !isSidebarCollapsed);
    btnMobTheory.textContent = isSidebarCollapsed
      ? (state.lang === "en" ? "📖 Study" : "📖 Estudo")
      : (state.lang === "en" ? "✕ Study" : "✕ Estudo");
  }

  const zenEntity = document.getElementById("zen-badge-entity");
  const zenTuning = document.getElementById("zen-badge-tuning");
  const zenIqa = document.getElementById("zen-badge-iqa");
  if (zenEntity) zenEntity.textContent = `${entity.name} (${effRootName})`;
  if (zenTuning) zenTuning.textContent = shortTuning;
  if (zenIqa) zenIqa.textContent = `${shortIqa} • ${state.bpm} BPM`;

  const btnZenTaqsim = document.getElementById("btn-zen-taqsim");
  if (btnZenTaqsim) btnZenTaqsim.style.display = state.mode === "MAQAM" ? "inline-flex" : "none";

  const btnZenDrone = document.getElementById("btn-zen-drone");
  if (btnZenDrone) {
    btnZenDrone.classList.toggle("active-toggle", state.droneActive);
    btnZenDrone.textContent = state.droneActive ? `🔊 Drone: ${rootName}` : "🔊 Drone: OFF";
  }

  const btnZenIqa = document.getElementById("btn-zen-iqa");
  if (btnZenIqa) {
    btnZenIqa.classList.toggle("active-toggle", isIqaPlaying);
    btnZenIqa.textContent = isIqaPlaying ? "⏹ Iqa'" : "▶ Iqa'";
  }

  const btnZenExit = document.getElementById("btn-zen-exit");
  if (btnZenExit) {
    btnZenExit.textContent = state.lang === "en" ? "✕ Exit Zen (Esc / F)" : "✕ Sair Imersivo (Esc / F)";
  }

  const btnInstall = document.getElementById("btn-install-pwa");
  if (btnInstall) {
    btnInstall.textContent = state.lang === "en" ? "📲 Install App" : "📲 Instalar App";
  }
}

function renderIqaBeatGrid() {
  const grid = document.getElementById("iqa-beat-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const iqa = DB.iqaat.find(x => x.id === state.iqaId) || DB.iqaat[0];
  iqa.pattern.forEach((step, idx) => {
    const cell = document.createElement("div");
    let strokeClass = "";
    if (step.stroke === "DUM") strokeClass = "stroke-dum";
    else if (step.stroke === "TAK") strokeClass = "stroke-tak";
    else if (step.stroke === "KAH") strokeClass = "stroke-kah";

    cell.className = `iqa-beat-cell ${strokeClass} ${idx === activeIqaBeatIdx ? "active-beat" : ""}`;
    cell.textContent = step.label;
    grid.appendChild(cell);
  });
}

function renderCadenceBar() {
  const bar = document.getElementById("cadence-bar");
  const container = document.getElementById("cadence-steps-container");
  if (!bar || !container) return;

  if (state.mode !== "CADENCE") {
    bar.style.display = "none";
    return;
  }

  bar.style.display = "flex";
  container.innerHTML = "";

  const rawCad = DB.cadences.find(x => x.id === state.entityId) || DB.cadences[0];
  const cad = localizeEntity(state.lang, rawCad);

  cad.steps.forEach((/** @type {any} */ step, /** @type {number} */ idx) => {
    const chordObj = DB.chords.find(c => c.id === step.chord_id) || DB.chords[0];
    const chordRootQ = ((state.rootQ + step.offset_q) % 24 + 24) % 24;
    const rootName = PITCH_CLASSES_24[chordRootQ]?.flat || "C";

    const card = document.createElement("div");
    card.className = `cadence-step-card ${idx === state.cadenceStepIndex ? "active-step" : ""}`;
    card.innerHTML = `
      <div class="step-roman">
        <span>${t(state.lang, "stepWord")} ${idx + 1}: ${step.roman}</span>
        <span>${idx === state.cadenceStepIndex ? t(state.lang, "activeWord") : ""}</span>
      </div>
      <div class="step-chord-name">${rootName}${chordObj.short_symbol ? " " + chordObj.short_symbol : t(state.lang, "majorWord")}</div>
      <div class="step-role">${step.role}</div>
    `;

    card.addEventListener("click", () => {
      clearAllActivePlayback();
      clearShiftOverlay(false);
      selectedStaffOrNeckPitch = null;
      commitStatePatch({ cadenceStepIndex: idx }, { syncControls: false, refresh: false });
      refreshAll();
      suspendPitchDetection(950);
      strumChordVoicing(currentChordVoicingFreqs);
    });

    container.appendChild(card);
  });
}

function renderModulationRadarCard() {
  const radarHeaderEl = document.querySelector('[data-i18n="symmetryCardTitle"]');
  const radarDescEl = document.getElementById("tuning-desc");
  const radarListEl = document.getElementById("tuning-intervals-list");
  const originSlotEl = document.getElementById("mod-origin-slot");
  const modCountEl = document.getElementById("deck-mod-count");
  if (!radarDescEl || !radarListEl) return;

  const isEn = state.lang === "en";
  if (radarHeaderEl) {
    radarHeaderEl.textContent = safeT("symmetryCardTitle", "🧭 Radar de Modulação & Ajnas (Intiqal)", "🧭 Modulation & Ajnas Radar (Intiqal)");
  }

  radarDescEl.textContent = safeT(
    "modRadarSubtitle",
    "Rotas tradicionais sobre o Ghammaz e graus-pivô. Ouça a prévia ou module em 1 clique.",
    "Traditional routes via the Ghammaz and pivot degrees. Preview or modulate in 1 click."
  );
  radarListEl.innerHTML = "";
  if (originSlotEl) originSlotEl.innerHTML = "";

  if (modulationOrigin) {
    const isSameAsOrigin = modulationOrigin.mode === state.mode &&
      modulationOrigin.entityId === state.entityId &&
      modulationOrigin.rootQ === state.rootQ;

    if (!isSameAsOrigin) {
      const originBanner = document.createElement("div");
      originBanner.className = "mod-origin-banner";
      originBanner.innerHTML = `
        <div class="mod-origin-text">
          <span style="color:var(--text-muted); font-size:0.69rem;">${safeT("modOriginPrefix", "Origem anterior:", "Previous origin:")}</span>
          <strong>${modulationOrigin.label}</strong>
        </div>
        <button type="button" class="primary compact-btn" id="btn-return-mod-origin">
          ${safeT("btnReturnOrigin", "↩ Voltar à Origem", "↩ Return to Origin")}
        </button>
      `;
      (originSlotEl || radarListEl).appendChild(originBanner);

      originBanner.querySelector("#btn-return-mod-origin")?.addEventListener("click", () => {
        if (!modulationOrigin) return;
        clearAllActivePlayback();
        clearShiftOverlay(false);
        selectedStaffOrNeckPitch = null;
        commitStatePatch({
          mode: modulationOrigin.mode,
          entityId: modulationOrigin.entityId,
          rootQ: modulationOrigin.rootQ,
          anchorAbsQ: modulationOrigin.anchorAbsQ,
          octavePathOnly: Boolean(modulationOrigin.anchorAbsQ !== null),
        }, { syncControls: false, refresh: false });
        modulationOrigin = null;
        suspendPitchDetection(700);
        playPluckedNote(130.81 * Math.pow(2, state.rootQ / 24), 1.4);
        syncControlsWithState();
        refreshAll();
      });
    }
  }

  const routes = getModulationRoutesForCurrentState();
  if (modCountEl) modCountEl.textContent = String(routes.length);

  routes.forEach((route) => {
    const rawTarget = route.targetMode === "MAQAM"
      ? DB.maqamat.find(m => m.id === route.targetId)
      : DB.ajnas.find(j => j.id === route.targetId);
    if (!rawTarget) return;

    const locTarget = localizeEntity(state.lang, rawTarget);
    const targetPitch = PITCH_CLASSES_24[route.absTargetRootQ] || PITCH_CLASSES_24[0];
    const pivotLabel = isEn ? route.pivotEn : route.pivotPt;
    const reasonText = isEn ? route.reasonEn : route.reasonPt;

    const card = document.createElement("div");
    card.className = "mod-route-card";
    card.innerHTML = `
      <div class="mod-route-top">
        <span class="mod-pivot-badge ${route.isGhammaz ? "is-ghammaz-pivot" : ""}">
          ${pivotLabel} → ${targetPitch.flat} (${targetPitch.arabic})
        </span>
      </div>
      <div class="mod-target-title">
        ${locTarget.name} <span style="color:var(--accent); font-weight:700;">${isEn ? "in" : "em"} ${targetPitch.flat}</span>
      </div>
      <div class="mod-route-desc">${reasonText}</div>
      <div class="mod-route-actions">
        <button type="button" class="ghost-btn btn-preview-mod">
          ${safeT("btnPreviewMod", "🔊 Ouvir", "🔊 Preview")}
        </button>
        <button type="button" class="plum-btn btn-apply-mod">
          ${safeT("btnApplyMod", "⚡ Modular", "⚡ Modulate")}
        </button>
      </div>
    `;

    card.querySelector(".btn-preview-mod")?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      clearAllActivePlayback();
      const targetIntervals = route.targetMode === "MAQAM"
        ? /** @type {any} */ (rawTarget).intervals_asc
        : /** @type {any} */ (rawTarget).intervals_q;
      /** @type {Record<number, number>} */
      const centsMap = {};
      if (route.targetMode === "MAQAM" && /** @type {any} */ (rawTarget).cents_dev) {
        Object.assign(centsMap, /** @type {any} */ (rawTarget).cents_dev);
      } else if (Array.isArray(/** @type {any} */ (rawTarget).cents_dev)) {
        targetIntervals.forEach((/** @type {number} */ intQ, /** @type {number} */ idx) => {
          centsMap[intQ] = /** @type {any} */ (rawTarget).cents_dev[idx] || 0;
        });
      }
      suspendPitchDetection(targetIntervals.length * 320 + 600);
      playScaleSequence(route.absTargetRootQ, targetIntervals, centsMap);
    });

    card.querySelector(".btn-apply-mod")?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      clearAllActivePlayback();
      clearShiftOverlay(false);
      selectedStaffOrNeckPitch = null;

      if (!modulationOrigin) {
        const curStruct = getActiveStructure(state);
        const curLoc = localizeEntity(state.lang, curStruct.entity);
        const curRootName = PITCH_CLASSES_24[((state.rootQ % 24) + 24) % 24]?.flat || "C";
        modulationOrigin = {
          mode: state.mode,
          entityId: state.entityId,
          rootQ: state.rootQ,
          anchorAbsQ: state.anchorAbsQ,
          label: `${curLoc.name} (${curRootName})`
        };
      }

      commitStatePatch({
        mode: route.targetMode,
        entityId: route.targetId,
        rootQ: route.absTargetRootQ,
        anchorAbsQ: null,
        octavePathOnly: false,
      }, { syncControls: false, refresh: false });

      suspendPitchDetection(700);
      playPluckedNote(130.81 * Math.pow(2, state.rootQ / 24), 1.4);
      syncControlsWithState();
      refreshAll();
    });

    radarListEl.appendChild(card);
  });
}

function updateInfoPanel() {
  const activeStruct = getActiveStructure(state);
  const entity = localizeEntity(state.lang, activeStruct.entity);
  const safeRootQ = ((state.rootQ % 24) + 24) % 24;
  const safeEffRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;
  const globalRootName = PITCH_CLASSES_24[safeRootQ]?.flat || "C";
  const effectiveRootName = PITCH_CLASSES_24[safeEffRootQ]?.flat || "C";

  const titleEl = document.getElementById("info-title");
  const descEl = document.getElementById("info-desc");
  const pillsEl = document.getElementById("info-pills");
  if (!titleEl || !descEl || !pillsEl) return;

  titleEl.textContent = state.mode === "CADENCE"
    ? `${entity.name} — ${t(state.lang, "qararIn")} ${globalRootName}`
    : `${entity.name} — ${t(state.lang, "rootIn")} ${effectiveRootName}`;
  descEl.textContent = entity.description;

  pillsEl.innerHTML = "";
  const addPill = (/** @type {string} */ label, /** @type {string} */ val) => {
    const div = document.createElement("div");
    div.className = "meta-pill";
    div.innerHTML = `<strong>${label}:</strong> ${val}`;
    pillsEl.appendChild(div);
  };

  if (state.mode === "CADENCE" && activeStruct.chordObj && activeStruct.stepObj) {
    const locChord = localizeEntity(state.lang, activeStruct.chordObj);
    const stepRole = entity.steps?.[state.cadenceStepIndex]?.role || activeStruct.stepObj.role;
    addPill(t(state.lang, "pillActiveChord"), `${effectiveRootName} (${locChord.name})`);
    addPill(t(state.lang, "pillQaflaRole"), `${activeStruct.stepObj.roman} — ${stepRole}`);
  }

  const noteNamesList = activeStruct.intervals.map(intQ => PITCH_CLASSES_24[((safeEffRootQ + intQ) % 24 + 24) % 24]?.flat || "");
  addPill(t(state.lang, "pillNotes"), noteNamesList.join(" – "));
  addPill(t(state.lang, "pillDegrees"), activeStruct.degrees.join(" · "));

  if (state.mode === "MAQAM") {
    addPill(t(state.lang, "pillLowerJins"), entity.lower_jins);
    addPill(t(state.lang, "pillUpperJins"), state.direction === "ASC" ? entity.upper_jins_asc : entity.upper_jins_desc);
  }

  const sayrBox = document.getElementById("sayr-detail-box");
  if (sayrBox) {
    if (state.mode === "MAQAM" && entity.sayr_phrases?.[state.sayrPhraseIndex]) {
      const phrase = entity.sayr_phrases[state.sayrPhraseIndex];
      const phraseNotes = phrase.steps.map((/** @type {any} */ s) => PITCH_CLASSES_24[((safeEffRootQ + s.interval_q) % 24 + 24) % 24]?.flat || "").join(" → ");
      sayrBox.style.display = "flex";
      sayrBox.innerHTML = `
        <div>
          <strong style="color:var(--plum);">✨ ${phrase.title}</strong>
          <div style="margin-top:3px; color:var(--text-muted);">${phrase.summary}</div>
          <div style="margin-top:4px; font-size:0.76rem; color:var(--accent);"><strong>${t(state.lang, "pillNotes")}:</strong> ${phraseNotes}</div>
        </div>
        <button type="button" id="btn-inline-taqsim" class="plum-btn compact-btn">${t(state.lang, "btnPlayPhraseInline")}</button>
      `;
      document.getElementById("btn-inline-taqsim")?.addEventListener("click", handlePlayTaqsim);
    } else {
      sayrBox.style.display = "none";
    }
  }

  const bridgeContainer = document.getElementById("bridge-container");
  if (bridgeContainer) {
    bridgeContainer.innerHTML = "";
    if (state.mode === "MAQAM" && entity.linked_cadence) {
      const box = document.createElement("div");
      box.className = "bridge-box";
      box.innerHTML = `
        <span>${t(state.lang, "bridgeQaflaPrefix")} <strong>${entity.name}</strong></span>
        <button type="button" id="btn-jump-cadence" class="primary compact-btn">${t(state.lang, "btnOpenQafla")}</button>
      `;
      bridgeContainer.appendChild(box);
      document.getElementById("btn-jump-cadence")?.addEventListener("click", () => {
        clearAllActivePlayback();
        clearShiftOverlay(false);
        selectedStaffOrNeckPitch = null;
        commitStatePatch({
          mode: "CADENCE",
          entityId: entity.linked_cadence,
          cadenceStepIndex: 0,
        }, { syncControls: false, refresh: false });
        syncControlsWithState();
        refreshAll();
      });
    }

    if ((state.mode === "SCALE" || state.mode === "CHORD" || state.mode === "CADENCE") && entity.bridge_maqam) {
      const box = document.createElement("div");
      box.className = "bridge-box";
      box.innerHTML = `
        <span>${t(state.lang, "bridgeMatrixPrefix")} <strong>${entity.bridge_text}</strong></span>
        <button type="button" id="btn-jump-maqam" class="ghost-btn compact-btn">${t(state.lang, "btnSeeMaqam")}</button>
      `;
      bridgeContainer.appendChild(box);
      document.getElementById("btn-jump-maqam")?.addEventListener("click", () => {
        clearAllActivePlayback();
        clearShiftOverlay(false);
        selectedStaffOrNeckPitch = null;
        commitStatePatch({
          mode: "MAQAM",
          entityId: entity.bridge_maqam,
        }, { syncControls: false, refresh: false });
        syncControlsWithState();
        refreshAll();
      });
    }
  }

  renderModulationRadarCard();
  renderStudyGuidePane();
}

function handlePrimaryAudioAction() {
  setActiveHeaderMenu(null);
  clearAllActivePlayback();

  if (state.octavePathOnly && hasValidAnchor()) {
    handlePlayAnchoredOctavePath();
    return;
  }

  if (state.mode === "CADENCE") {
    const cad = DB.cadences.find(x => x.id === state.entityId) || DB.cadences[0];
    suspendPitchDetection(cad.steps.length * 1150 + 500);
    scheduleCadenceSequence(cad.steps.length, (stepIdx) => {
      commitStatePatch({ cadenceStepIndex: stepIdx }, { syncControls: false, refresh: false });
      refreshAll();
      strumChordVoicing(currentChordVoicingFreqs);
    });
    return;
  }

  if (state.mode === "CHORD" && currentChordVoicingFreqs.length > 0) {
    suspendPitchDetection(1000);
    strumChordVoicing(currentChordVoicingFreqs);
    return;
  }

  const activeStruct = getActiveStructure(state);
  suspendPitchDetection(activeStruct.intervals.length * 320 + 600);
  playScaleSequence(activeStruct.effectiveRootQ, activeStruct.intervals, activeStruct.centsMap);
}

function handlePlayTaqsim() {
  setActiveHeaderMenu(null);
  clearAllActivePlayback();
  if (state.mode !== "MAQAM") return;
  const activeStruct = getActiveStructure(state);
  const entity = /** @type {any} */ (activeStruct.entity);
  const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
  if (!phrase) return;

  commitStatePatch({ octavePathOnly: false }, { syncControls: false, refresh: false });
  commitStatePatch({ showSayr: true }, { syncControls: false, refresh: false });
  commitStatePatch({ staffMode: "SAYR" }, { syncControls: false, refresh: false });
  syncControlsWithState();

  const totalDur = phrase.steps.reduce((/** @type {number} */ acc, /** @type {any} */ st) => acc + (st.dur_ms || 360), 0);
  suspendPitchDetection(totalDur + 550);

  playTaqsimPhrase(activeStruct.effectiveRootQ, phrase.steps, activeStruct.centsMap, (stepIdx) => {
    highlightedSequenceStep = stepIdx;
    refreshAll();
  });
}

function restartIqaIfPlaying() {
  if (!isIqaPlaying) {
    renderIqaBeatGrid();
    return;
  }
  const iqa = DB.iqaat.find(x => x.id === state.iqaId) || DB.iqaat[0];
  startIqaEngine(iqa, state.bpm, (beatIdx) => {
    activeIqaBeatIdx = beatIdx;
    renderIqaBeatGrid();
  });
}

function populateAllLocalizedSelects() {
  const selTuning = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-tuning"));
  if (selTuning) {
    selTuning.innerHTML = "";
    DB.tunings.forEach(rawT => {
      const trT = localizeEntity(state.lang, rawT);
      const opt = document.createElement("option");
      opt.value = rawT.id;
      opt.textContent = trT.name;
      selTuning.appendChild(opt);
    });
    selTuning.value = state.tuningId;
  }

  const selRoot = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-root"));
  if (selRoot) {
    selRoot.innerHTML = "";
    const qLbl = t(state.lang, "quarterToneLabel");
    PITCH_CLASSES_24.forEach(pc => {
      const opt = document.createElement("option");
      opt.value = String(pc.q);
      opt.textContent = `${pc.flat} ${pc.micro ? `(${qLbl} - ${pc.arabic})` : `(${pc.arabic})`}`;
      selRoot.appendChild(opt);
    });
    selRoot.value = String(state.rootQ);
  }

  const selIqa = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-iqa"));
  if (selIqa) {
    selIqa.innerHTML = "";
    DB.iqaat.forEach(rawIq => {
      const trIq = localizeEntity(state.lang, rawIq);
      const opt = document.createElement("option");
      opt.value = rawIq.id;
      opt.textContent = trIq.name;
      selIqa.appendChild(opt);
    });
    selIqa.value = state.iqaId;
  }

  populateEntitySelect();
}

function populateEntitySelect() {
  const sel = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-entity"));
  if (!sel) return;
  sel.innerHTML = "";

  /** @type {any[]} */
  let list = DB.maqamat;
  if (state.mode === "JINS") list = DB.ajnas;
  else if (state.mode === "SCALE") list = DB.scales;
  else if (state.mode === "CHORD") list = DB.chords;
  else if (state.mode === "CADENCE") list = DB.cadences;

  list.forEach(rawItem => {
    const item = localizeEntity(state.lang, rawItem);
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = item.name;
    sel.appendChild(opt);
  });

  if (!list.some(x => x.id === state.entityId)) {
    commitStatePatch({ entityId: list[0].id }, { syncControls: false, refresh: false });
  }
  sel.value = state.entityId;
}

function syncSelectionActionButtons() {
  const ribbon = document.getElementById("stage-selection-ribbon");
  const ribbonStatus = document.getElementById("selection-ribbon-status");
  const btnInlineStaff = document.getElementById("btn-inline-toggle-staff");
  const btnDockSetTonic = document.getElementById("btn-dock-set-tonic");
  const btnDockClear = document.getElementById("btn-dock-clear-note");
  const btnClearFilter = document.getElementById("btn-clear-staff-filter");
  const btnSetRoot = document.getElementById("btn-set-root-from-selection");

  const pcQ = resolvePitchClassQ(selectedStaffOrNeckPitch);
  const hasSelection = selectedStaffOrNeckPitch !== null && pcQ !== null && Boolean(PITCH_CLASSES_24[pcQ]);

  if (btnInlineStaff) {
    btnInlineStaff.textContent = state.showStaff
      ? (state.lang === "en" ? "🎼 Hide Staff" : "🎼 Ocultar Pauta")
      : (state.lang === "en" ? "🎼 Show Staff" : "🎼 Exibir Pauta");
  }

  if (hasSelection && pcQ !== null) {
    const pc = PITCH_CLASSES_24[pcQ];
    const labelText = `${safeT("btnSetRootFromNote", "🎯 Definir Tônica", "🎯 Set Tonic")}: ${pc.flat} (${pc.arabic})`;

    if (btnClearFilter) btnClearFilter.style.display = "inline-flex";
    if (btnSetRoot) {
      btnSetRoot.style.display = "inline-flex";
      btnSetRoot.textContent = labelText;
    }
    if (btnDockSetTonic) {
      btnDockSetTonic.style.display = "inline-flex";
      btnDockSetTonic.textContent = labelText;
    }
    if (btnDockClear) btnDockClear.style.display = "inline-flex";
    if (ribbonStatus) {
      ribbonStatus.textContent = `${pc.flat} (${pc.arabic})`;
    }
  } else {
    if (btnClearFilter) btnClearFilter.style.display = "none";
    if (btnSetRoot) btnSetRoot.style.display = "none";
    if (btnDockSetTonic) btnDockSetTonic.style.display = "none";
    if (btnDockClear) btnDockClear.style.display = "none";
    if (ribbonStatus) ribbonStatus.textContent = "";
  }

  if (ribbon) {
    const showRibbonDesktop = !state.showStaff && hasSelection;
    ribbon.classList.toggle("visible", showRibbonDesktop);
  }

  const octBar = document.getElementById("octave-path-bar");
  if (octBar) {
    if (hasValidAnchor() && typeof state.anchorAbsQ === "number") {
      octBar.style.display = "flex";
      const pcIdx = ((state.anchorAbsQ % 24) + 24) % 24;
      const pc = PITCH_CLASSES_24[pcIdx] || PITCH_CLASSES_24[0];
      const octNum = Math.floor(state.anchorAbsQ / 24) + 2;
      const lbl = document.getElementById("octave-bar-label");
      const titlePrefix = safeT("octaveBarTitle", "📍 Caminho da Tônica:", "📍 Tonic Path:");
      if (lbl) lbl.textContent = `${titlePrefix} ${pc.flat}${octNum} (${pc.arabic})`;

      const btnAll = document.getElementById("btn-oct-mode-all");
      const btnSingle = document.getElementById("btn-oct-mode-single");
      const btnAsc = document.getElementById("btn-oct-dir-asc");
      const btnDesc = document.getElementById("btn-oct-dir-desc");
      const btnPlayOct = document.getElementById("btn-play-octave-path");

      if (btnAll) {
        btnAll.textContent = safeT("btnOctaveAll", "🌐 Todas as Oitavas", "🌐 All Octaves");
        btnAll.classList.toggle("selected", !state.octavePathOnly);
      }
      if (btnSingle) {
        btnSingle.textContent = safeT("btnOctaveSingle", "🎯 Caminho 1 Oitava", "🎯 1-Octave Path");
        btnSingle.classList.toggle("selected", state.octavePathOnly);
      }
      if (btnAsc) {
        btnAsc.textContent = safeT("btnOctaveAsc", "↑ Ascendente (+8ª)", "↑ Ascending (+8ve)");
        btnAsc.classList.toggle("selected", state.octavePathDir === "ASC");
      }
      if (btnDesc) {
        btnDesc.textContent = safeT("btnOctaveDesc", "↓ Descendente (-8ª)", "↓ Descending (-8ve)");
        btnDesc.classList.toggle("selected", state.octavePathDir === "DESC");
      }
      if (btnPlayOct) {
        btnPlayOct.textContent = safeT("btnPlayOctavePath", "▶ Ouvir Caminho", "▶ Play Path");
      }
    } else {
      octBar.style.display = "none";
    }
  }
}

function syncControlsWithState() {
  applyStaticTranslations(state.lang);
  populateAllLocalizedSelects();

  if (isMobileViewport()) {
    commitStatePatch({ orientation: "VERTICAL" }, { syncControls: false, refresh: false });
  }

  document.documentElement.setAttribute("data-theme", state.theme);
  document.body.setAttribute("data-theme", state.theme);
  document.body.setAttribute("data-tradition", state.tradition);
  document.body.setAttribute("data-orientation", state.orientation);
  document.body.setAttribute("data-zen", isZenMode ? "true" : "false");
  document.body.setAttribute("data-sidebar", isSidebarCollapsed ? "collapsed" : "expanded");

  document.querySelectorAll(".deck-tab-btn").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    const isAct = normalizeDeckTab(el.dataset.deckTab) === activeDeckTab;
    el.classList.toggle("active", isAct);
    el.setAttribute("aria-selected", isAct ? "true" : "false");
  });
  document.querySelectorAll(".deck-pane").forEach(pane => {
    const el = /** @type {HTMLElement} */ (pane);
    el.classList.toggle("active-pane", normalizeDeckTab(el.dataset.deckPane) === activeDeckTab);
  });

  const selTrad = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-tradition"));
  if (selTrad) selTrad.value = state.tradition;

  const selShape = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-shape"));
  if (selShape) selShape.value = state.shapeMode;

  const selLabel = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-label"));
  if (selLabel) selLabel.value = state.labelMode;

  const btnPosMap = document.getElementById("btn-pos-map");
  if (btnPosMap) {
    btnPosMap.textContent = safeT("btnPosMap", "📐 Regiões & Pivôs", "📐 Regions & Pivots");
    btnPosMap.classList.toggle("selected", state.showPositionsMap);
  }

  const legendPivot = document.getElementById("legend-pivot-item");
  if (legendPivot) {
    legendPivot.style.display = state.showPositionsMap ? "inline-flex" : "none";
  }

  document.getElementById("btn-guide-semi")?.classList.toggle("selected", state.showSemiGuides);
  document.getElementById("btn-guide-micro")?.classList.toggle("selected", state.showMicroGuides);
  document.getElementById("btn-ghost-notes")?.classList.toggle("selected", state.showGhostNotes);

  const btnPegbox = document.getElementById("btn-toggle-pegbox");
  if (btnPegbox) {
    const isPegboxOn = /** @type {any} */ (state).showPegbox !== false;
    btnPegbox.textContent = state.lang === "en" ? "🪕 Pegbox (Banjak)" : "🪕 Cabeçote (Banjak)";
    btnPegbox.classList.toggle("selected", isPegboxOn);
  }

  document.getElementById("btn-toggle-sayr")?.classList.toggle("selected", state.showSayr);
  document.getElementById("btn-dir-asc")?.classList.toggle("selected", state.direction === "ASC");
  document.getElementById("btn-dir-desc")?.classList.toggle("selected", state.direction === "DESC");
  document.getElementById("btn-chord-voicing")?.classList.toggle("selected", state.chordVoicingOnly);
  document.getElementById("btn-chord-all")?.classList.toggle("selected", !state.chordVoicingOnly);

  const btnTheme = document.getElementById("btn-theme");
  if (btnTheme) {
    btnTheme.textContent = state.theme === "light"
      ? safeT("btnThemeDark", "🌙 Tema Escuro", "🌙 Dark Theme")
      : safeT("btnThemeLight", "☀️ Tema Claro", "☀️ Light Theme");
  }

  const btnTimbre = document.getElementById("btn-timbre-profile");
  if (btnTimbre) {
    const isEgyptian = getOudTimbreProfile() === "egyptian";
    btnTimbre.textContent = isEgyptian
      ? (state.lang === "en" ? "🪕 Tone: Egyptian (Warm)" : "🪕 Timbre: Egípcio (Encorpado)")
      : (state.lang === "en" ? "🪕 Tone: Syrian (Dry)" : "🪕 Timbre: Sírio (Seco)");
  }

  const btnZen = document.getElementById("btn-zen-mode");
  if (btnZen) {
    btnZen.textContent = state.lang === "en" ? "🪷 Zen Stage (F)" : "🪷 Modo Imersivo (F)";
    btnZen.classList.toggle("selected", isZenMode);
  }

  const btnSidebar = document.getElementById("btn-toggle-sidebar");
  if (btnSidebar) {
    if (isSidebarCollapsed) {
      btnSidebar.textContent = safeT("btnShowSidebar", "◧ Exibir Teoria", "◧ Show Theory");
      btnSidebar.classList.remove("selected");
    } else {
      btnSidebar.textContent = safeT("btnHideSidebar", "◧ Ocultar Teoria", "◧ Hide Theory");
      btnSidebar.classList.add("selected");
    }
  }

  const btnOrientation = document.getElementById("btn-orientation");
  if (btnOrientation) {
    btnOrientation.textContent = state.orientation === "VERTICAL"
      ? t(state.lang, "btnOrientVert")
      : t(state.lang, "btnOrientHoriz");
  }

  const btnHand = document.getElementById("btn-hand");
  if (btnHand) {
    btnHand.textContent = state.leftHanded
      ? t(state.lang, "btnHandLeft")
      : t(state.lang, "btnHandRight");
  }

  const btnLang = document.getElementById("btn-lang");
  if (btnLang) {
    btnLang.textContent = state.lang === "en" ? "🌐 Language: EN → PT" : "🌐 Idioma: PT → EN";
  }

  const btnToggleIqa = document.getElementById("btn-toggle-iqa");
  if (btnToggleIqa) {
    btnToggleIqa.textContent = isIqaPlaying
      ? t(state.lang, "btnStopIqa")
      : t(state.lang, "btnStartIqa");
  }

  const staffBox = document.getElementById("staff-stage-box");
  if (staffBox) staffBox.style.display = state.showStaff ? "flex" : "none";
  document.getElementById("btn-toggle-staff")?.classList.toggle("selected", state.showStaff);

  const btnHideStaffInline = document.getElementById("btn-hide-staff-inline");
  if (btnHideStaffInline) {
    btnHideStaffInline.textContent = state.lang === "en" ? "— Hide Staff" : "— Ocultar Pauta";
  }

  const btnStaffScale = document.getElementById("btn-staff-mode-scale");
  const btnStaffSayr = document.getElementById("btn-staff-mode-sayr");
  if (btnStaffSayr) {
    btnStaffSayr.style.display = state.mode === "MAQAM" ? "inline-flex" : "none";
    btnStaffSayr.classList.toggle("selected", state.mode === "MAQAM" && state.staffMode === "SAYR");
  }
  if (btnStaffScale) {
    btnStaffScale.classList.toggle("selected", state.mode !== "MAQAM" || state.staffMode === "SCALE");
  }

  syncSelectionActionButtons();

  document.querySelectorAll(".tab-btn").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    el.classList.toggle("active", el.dataset.mode === state.mode);
  });

  const isChordLike = state.mode === "CHORD" || state.mode === "CADENCE";
  const maqamSub = document.getElementById("maqam-subcontrols");
  const sayrBar = document.getElementById("sayr-phrase-bar");
  const jinsFilter = document.getElementById("jins-filter-group");
  const chordSub = document.getElementById("chord-subcontrols");
  const boxSlider = document.getElementById("box-slider-group");

  if (maqamSub) maqamSub.style.display = state.mode === "MAQAM" ? "flex" : "none";
  if (sayrBar) sayrBar.style.display = state.mode === "MAQAM" ? "flex" : "none";
  if (jinsFilter) jinsFilter.style.display = state.mode === "MAQAM" ? "flex" : "none";
  if (chordSub) chordSub.style.display = isChordLike ? "flex" : "none";
  if (boxSlider) boxSlider.style.display = state.shapeMode === "CLOSED_BOX" ? "flex" : "none";

  document.querySelectorAll(".sayr-phrase-btn").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    el.classList.toggle("selected", Number(el.dataset.phrase) === state.sayrPhraseIndex);
  });

  document.querySelectorAll(".jins-filter").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    el.classList.toggle("selected", el.dataset.filter === state.jinsFilter);
  });

  const btnPlay = document.getElementById("btn-play-scale");
  const btnTaqsim = document.getElementById("btn-play-taqsim");
  const btnArp = document.getElementById("btn-arp-chord");
  const btnAudioCaret = document.getElementById("btn-audio-menu");
  const audioCapsule = document.getElementById("audio-split-capsule");

  if (btnPlay && btnArp && btnTaqsim) {
    const hasSecondaryAudio = state.mode === "MAQAM" || state.mode === "CHORD" || state.mode === "CADENCE";
    btnTaqsim.style.display = state.mode === "MAQAM" ? "flex" : "none";

    if (state.mode === "CADENCE") {
      btnPlay.textContent = t(state.lang, "btnPlayQafla");
      btnArp.style.display = "flex";
    } else if (state.mode === "CHORD") {
      btnPlay.textContent = t(state.lang, "btnPlayChord");
      btnArp.style.display = "flex";
    } else {
      btnPlay.textContent = t(state.lang, "btnPlayScale");
      btnArp.style.display = "none";
    }

    if (btnAudioCaret) btnAudioCaret.style.display = hasSecondaryAudio ? "inline-flex" : "none";
    if (audioCapsule) audioCapsule.classList.toggle("is-single-action", !hasSecondaryAudio);
    if (!hasSecondaryAudio && activeHeaderMenu === "audio") {
      setActiveHeaderMenu(null);
    }
  }

  syncCommandBarSummaries();
  syncLiveTunerUI();
  renderGlossaryList();
}

function refreshAll() {
  if (isMobileViewport()) {
    commitStatePatch({ orientation: "VERTICAL" }, { syncControls: false, refresh: false });
    document.body.setAttribute("data-orientation", "VERTICAL");
  }

  renderCadenceBar();
  renderIqaBeatGrid();
  syncSelectionActionButtons();

  const octavePathNodes = hasValidAnchor() ? computeAnchoredOctavePath(state) : [];

  if (state.showStaff) {
    renderMusicalStaffSVG(
      state,
      selectedStaffOrNeckPitch,
      highlightedSequenceStep,
      (staffSelection) => {
        suspendPitchDetection(650);
        selectedStaffOrNeckPitch = staffSelection;
        clearShiftOverlay(false);
        refreshAll();
      },
      octavePathNodes
    );
  }

  currentChordVoicingFreqs = renderOudNeckSVG(
    state,
    handlePrimaryAudioAction,
    highlightedSequenceStep,
    selectedStaffOrNeckPitch,
    (neckNoteInfo) => {
      suspendPitchDetection(650);
      clearShiftOverlay(false);
      selectedStaffOrNeckPitch = neckNoteInfo;
      if (isMobileViewport()) {
        showTouchLoupeFeedback(neckNoteInfo);
      }
      if (neckNoteInfo.makeRoot) {
        applySelectedPitchAsRoot(neckNoteInfo);
      } else {
        refreshAll();
      }
    },
    octavePathNodes,
    {
      onToggleRegion: handleTogglePositionRegion,
      onPlayRegion: handlePlayPositionRegion,
      onPivotAction: handlePivotAction,
      onPegPluck: () => {
        suspendPitchDetection(1100);
      },
      playingRegionId,
      highlightedRegionNodeKey,
      activeShiftOverlay
    }
  );

  updateInfoPanel();
  syncCommandBarSummaries();
  syncLiveTunerUI();
  const droneBtn = document.getElementById("btn-drone");
  if (droneBtn) updateDronePitch(state.droneActive, state.rootQ, droneBtn);
  syncStateToUrl(state);
}

function ensureStudyGuideScaffold() {
  const deckTabs = document.querySelector(".deck-tabs");
  const deckBody = document.getElementById("deck-body") || document.querySelector(".deck-body");

  if (deckTabs && !deckTabs.querySelector('[data-deck-tab="study"], [data-deck-tab="guide"]')) {
    const tabBtn = document.createElement("button");
    tabBtn.type = "button";
    tabBtn.className = "deck-tab-btn";
    tabBtn.id = "tab-deck-study";
    tabBtn.dataset.deckTab = "study";
    tabBtn.setAttribute("role", "tab");
    tabBtn.setAttribute("aria-selected", "false");
    tabBtn.innerHTML = `
      <span>🎓</span>
      <span data-i18n="deckTabStudy">Guia de Estudos</span>
      <span class="deck-tab-count" id="deck-study-count">0/${getAllStudyLessons().length}</span>
    `;
    deckTabs.appendChild(tabBtn);
  }

  if (deckBody && !getStudyPaneElement()) {
    const pane = document.createElement("div");
    pane.className = "deck-pane";
    pane.id = "deck-pane-study";
    pane.dataset.deckPane = "study";
    pane.setAttribute("role", "tabpanel");
    deckBody.appendChild(pane);
  }
}

function initApp() {
  loadStudyProgress();
  ensureStudyGuideScaffold();

  if (isMobileViewport()) {
    commitStatePatch({ orientation: "VERTICAL" }, { syncControls: false, refresh: false });
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", state.theme === "light" ? "#f4eee4" : "#100d0b");
  }

  let wasMobile = isMobileViewport();
  window.addEventListener("resize", () => {
    const nowMobile = isMobileViewport();
    if (nowMobile && !wasMobile) {
      setActivePopover(null);
      setActiveHeaderMenu(null);
      commitStatePatch({ orientation: "VERTICAL" }, { syncControls: false, refresh: false });
      if (!userOverrodeSidebar) isSidebarCollapsed = true;
      syncControlsWithState();
      refreshAll();
    } else if (!nowMobile && wasMobile) {
      setActivePopover(null);
      setActiveHeaderMenu(null);
      commitStatePatch({ orientation: desktopPreferredOrientation }, { syncControls: false, refresh: false });
      if (!userOverrodeSidebar) isSidebarCollapsed = false;
      syncControlsWithState();
      refreshAll();
    }
    wasMobile = nowMobile;
  });

  document.addEventListener("click", (e) => {
    const rawTarget = e.target;
    const target = rawTarget instanceof Element ? rawTarget : (rawTarget && /** @type {Node} */ (rawTarget).parentElement);
    if (!target) return;

    if (target.closest("#btn-audio-menu")) {
      e.preventDefault();
      setActiveHeaderMenu(activeHeaderMenu === "audio" ? null : "audio");
      return;
    }

    if (target.closest("#btn-header-menu")) {
      e.preventDefault();
      setActiveHeaderMenu(activeHeaderMenu === "main" ? null : "main");
      return;
    }

    if (
      activeHeaderMenu !== null &&
      !target.closest("#audio-split-capsule") &&
      !target.closest("#header-menu-shell")
    ) {
      setActiveHeaderMenu(null);
    }

    // Gatilho no Menu ⋯: abre/fecha Escuta 24-TET & Afinador
    if (target.closest("#btn-open-live-tuner")) {
      e.preventDefault();
      if (isTunerBarOpen) {
        closeLiveTunerBar();
      } else {
        openLiveTunerBar("MAQAM_24TET", true);
      }
      setActiveHeaderMenu(null);
      return;
    }

    // Gatilho na barra inferior Mobile: alterna Modo Microfone / Linha ON/OFF
    if (target.closest("#btn-mob-mic")) {
      e.preventDefault();
      if (isPitchListening()) {
        closeLiveTunerBar();
      } else {
        openLiveTunerBar(undefined, true);
        requestAnimationFrame(() => {
          document.getElementById("live-tuner-bar")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
      renderStudyGuidePane();
      return;
    }

    // Gatilho no Popover 0 (Afinação & Qarar): abre direto no Afinador das 6 Ordens
    if (target.closest("#btn-popover-open-tuner")) {
      e.preventDefault();
      openLiveTunerBar("TUNER", true);
      return;
    }

    if (target.closest("#btn-tuner-mic-toggle")) {
      e.preventDefault();
      if (isPitchListening()) {
        stopPitchListening();
      } else {
        startLiveMicCapture();
      }
      return;
    }

    if (target.closest("#btn-close-tuner-bar")) {
      e.preventDefault();
      closeLiveTunerBar();
      return;
    }

    const tunerModeBtn = /** @type {HTMLElement | null} */ (target.closest(".tuner-mode-btn"));
    if (tunerModeBtn) {
      e.preventDefault();
      const nextMode = /** @type {import("./audio/pitchEngine.js").PitchDetectionMode} */ (tunerModeBtn.dataset.tunerMode || "MAQAM_24TET");
      setPitchDetectionMode(nextMode);
      latestPitchDetection = null;
      clearLivePitchOverlayOnNeck();
      syncLiveTunerUI();
      return;
    }

    // Alterna entre 🎙 Mic e 🔌 Linha (DI / Interface de Áudio) em tempo real
    const profileBtn = /** @type {HTMLElement | null} */ (target.closest(".tuner-profile-btn"));
    if (profileBtn) {
      e.preventDefault();
      const nextProfile = /** @type {import("./audio/pitchEngine.js").PitchInputProfile} */ (profileBtn.dataset.inputProfile || "MIC");
      setPitchInputProfile(nextProfile);
      try {
        localStorage.setItem("oud_input_profile_pref", nextProfile);
      } catch {
        // Ignora
      }
      syncLiveTunerUI();
      return;
    }

    // Alterna canal da interface (Auto / Ch 1 / Ch 2) em tempo real
    const channelBtn = /** @type {HTMLElement | null} */ (target.closest(".tuner-channel-btn"));
    if (channelBtn) {
      e.preventDefault();
      const nextChannel = /** @type {import("./audio/pitchEngine.js").PitchInputChannel} */ (channelBtn.dataset.inputChannel || "AUTO");
      setPitchInputChannel(nextChannel);
      try {
        localStorage.setItem("oud_input_channel_pref", nextChannel);
      } catch {
        // Ignora
      }
      syncLiveTunerUI();
      return;
    }

    const courseBtn = /** @type {HTMLElement | null} */ (target.closest(".tuner-course-btn"));
    if (courseBtn) {
      e.preventDefault();
      const rawVal = courseBtn.dataset.courseLock;
      if (rawVal === "AUTO") {
        setLockedTunerCourse(null);
      } else {
        const cNum = Number(rawVal);
        if (Number.isFinite(cNum)) {
          const nextLock = getLockedTunerCourse() === cNum ? null : cNum;
          setLockedTunerCourse(nextLock);
          const tuning = DB.tunings.find(x => x.id === state.tuningId) || DB.tunings[0];
          const cObj = tuning.courses.find(c => c.course === cNum);
          if (cObj) {
            suspendPitchDetection(1000);
            playPluckedNote(cObj.freq_hz, 1.45, 0.34);
          }
        }
      }
      syncLiveTunerUI();
      return;
    }

    if (target.closest("#btn-tuner-ref-tone")) {
      e.preventDefault();
      playActiveTunerCourseReference();
      return;
    }

    const triggerBtn = /** @type {HTMLElement | null} */ (target.closest(".cmd-trigger"));
    if (triggerBtn) {
      e.preventDefault();
      const idx = Number(triggerBtn.dataset.panel);
      setActivePopover(activePopoverIdx === idx ? null : idx);
      return;
    }

    if (target.closest("#popover-backdrop, .popover-close-btn, .btn-close-popover")) {
      e.preventDefault();
      setActivePopover(null);
      return;
    }

    if (target.closest("#btn-theme, #btn-zen-theme")) {
      e.preventDefault();
      toggleAppTheme();
      return;
    }

    if (target.closest("#btn-timbre-profile")) {
      e.preventDefault();
      toggleOudTimbreProfileWithPreview();
      return;
    }

    if (target.closest("#btn-zen-mode")) {
      e.preventDefault();
      toggleZenMode();
      return;
    }

    if (target.closest("#btn-zen-exit")) {
      e.preventDefault();
      toggleZenMode(false);
      return;
    }

    if (target.closest("#btn-zen-play, #btn-mob-play")) {
      e.preventDefault();
      handlePrimaryAudioAction();
      return;
    }

    if (target.closest("#btn-zen-taqsim, #btn-mob-taqsim")) {
      e.preventDefault();
      handlePlayTaqsim();
      return;
    }

    if (target.closest("#btn-zen-drone")) {
      e.preventDefault();
      const droneBtn = document.getElementById("btn-drone");
      if (droneBtn) state.droneActive = toggleDroneAudio(state.droneActive, state.rootQ, droneBtn);
      syncCommandBarSummaries();
      syncLiveTunerUI();
      renderStudyGuidePane();
      return;
    }

    if (target.closest("#btn-zen-iqa")) {
      e.preventDefault();
      toggleIqaPlayback();
      renderStudyGuidePane();
      return;
    }

    if (target.closest("#btn-mob-theory")) {
      e.preventDefault();
      setActivePopover(null);
      setActiveHeaderMenu(null);
      toggleSidebarCollapsed();
      if (!isSidebarCollapsed) {
        requestAnimationFrame(() => {
          document.getElementById("studio-deck")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      return;
    }

    const deckTabBtn = /** @type {HTMLElement | null} */ (target.closest(".deck-tab-btn"));
    if (deckTabBtn) {
      e.preventDefault();
      setActiveDeckTab(normalizeDeckTab(deckTabBtn.dataset.deckTab));
      return;
    }

    if (target.closest("#btn-deck-collapse") || target.closest("#btn-toggle-sidebar")) {
      e.preventDefault();
      toggleSidebarCollapsed();
      return;
    }

    if (target.closest("#btn-hide-staff-inline, #btn-inline-toggle-staff")) {
      e.preventDefault();
      commitStatePatch({ showStaff: !state.showStaff }, { syncControls: false, refresh: false });
      syncControlsWithState();
      refreshAll();
      return;
    }

    if (target.closest("#btn-pos-map")) {
      e.preventDefault();
      commitStatePatch({ showPositionsMap: !state.showPositionsMap }, { syncControls: false, refresh: false });
      clearShiftOverlay(false);
      syncControlsWithState();
      refreshAll();
      return;
    }

    if (target.closest("#btn-set-root-from-selection, #btn-dock-set-tonic")) {
      e.preventDefault();
      applySelectedPitchAsRoot(selectedStaffOrNeckPitch);
      return;
    }

    if (target.closest("#btn-dock-clear-note")) {
      e.preventDefault();
      selectedStaffOrNeckPitch = null;
      clearShiftOverlay(false);
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-mode-all")) {
      e.preventDefault();
      clearAllActivePlayback();
      commitStatePatch({ octavePathOnly: false }, { syncControls: false, refresh: false });
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-mode-single")) {
      e.preventDefault();
      clearAllActivePlayback();
      commitStatePatch({ octavePathOnly: true }, { syncControls: false, refresh: false });
      commitStatePatch({ staffMode: "SCALE" }, { syncControls: false, refresh: false });
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-dir-asc")) {
      e.preventDefault();
      clearAllActivePlayback();
      commitStatePatch({ octavePathDir: "ASC" }, { syncControls: false, refresh: false });
      commitStatePatch({ octavePathOnly: true }, { syncControls: false, refresh: false });
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-dir-desc")) {
      e.preventDefault();
      clearAllActivePlayback();
      commitStatePatch({ octavePathDir: "DESC" }, { syncControls: false, refresh: false });
      commitStatePatch({ octavePathOnly: true }, { syncControls: false, refresh: false });
      refreshAll();
      return;
    }

    if (target.closest("#btn-play-octave-path")) {
      e.preventDefault();
      handlePlayAnchoredOctavePath();
      return;
    }

    if (target.closest("#btn-close-octave-bar")) {
      e.preventDefault();
      clearAllActivePlayback();
      commitStatePatch({ anchorAbsQ: null }, { syncControls: false, refresh: false });
      commitStatePatch({ octavePathOnly: false }, { syncControls: false, refresh: false });
      refreshAll();
    }
  });

  // Seletor de dispositivo de entrada (Interface USB / Microfone)
  document.getElementById("select-tuner-device")?.addEventListener("change", async (e) => {
    const newDeviceId = /** @type {HTMLSelectElement} */ (e.target).value;
    setPitchInputDeviceId(newDeviceId);
    try {
      localStorage.setItem("oud_input_device_pref", newDeviceId);
    } catch {
      // Ignora
    }
    if (isPitchListening()) {
      stopPitchListening();
      await startLiveMicCapture();
    } else {
      syncLiveTunerUI();
    }
  });

  // Seletor de sensibilidade (Noise Gate)
  document.getElementById("select-tuner-gate")?.addEventListener("change", (e) => {
    const val = parseFloat(/** @type {HTMLSelectElement} */ (e.target).value);
    if (!Number.isFinite(val)) return;
    setPitchNoiseGate(val);
    try {
      localStorage.setItem("oud_input_gate_pref", String(val));
    } catch {
      // Ignora
    }
    syncLiveTunerUI();
  });

  const selTradition = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-tradition"));
  selTradition?.addEventListener("change", (e) => {
    commitStatePatch({ tradition: /** @type {HTMLSelectElement} */ (e.target).value }, { syncControls: false, refresh: false });
    document.body.setAttribute("data-tradition", state.tradition);
    refreshAll();
  });

  document.getElementById("btn-lang")?.addEventListener("click", () => {
    commitStatePatch({ lang: state.lang === "pt" ? "en" : "pt" }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-orientation")?.addEventListener("click", () => {
    if (isMobileViewport()) return;
    desktopPreferredOrientation = state.orientation === "HORIZONTAL" ? "VERTICAL" : "HORIZONTAL";
    commitStatePatch({ orientation: desktopPreferredOrientation }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-toggle-staff")?.addEventListener("click", () => {
    commitStatePatch({ showStaff: !state.showStaff }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-staff-mode-scale")?.addEventListener("click", () => {
    commitStatePatch({ staffMode: "SCALE" }, { syncControls: false, refresh: false });
    selectedStaffOrNeckPitch = null;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-staff-mode-sayr")?.addEventListener("click", () => {
    commitStatePatch({ staffMode: "SAYR" }, { syncControls: false, refresh: false });
    commitStatePatch({ octavePathOnly: false }, { syncControls: false, refresh: false });
    selectedStaffOrNeckPitch = null;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-clear-staff-filter")?.addEventListener("click", () => {
    selectedStaffOrNeckPitch = null;
    clearShiftOverlay(false);
    refreshAll();
  });

  document.getElementById("select-tuning")?.addEventListener("change", (e) => {
    clearAllActivePlayback();
    clearShiftOverlay(false);
    commitStatePatch({ tuningId: /** @type {HTMLSelectElement} */ (e.target).value }, { syncControls: false, refresh: false });
    selectedStaffOrNeckPitch = null;
    setLockedTunerCourse(null);
    refreshAll();
  });

  const selRoot = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-root"));
  selRoot?.addEventListener("change", (e) => {
    clearAllActivePlayback();
    clearShiftOverlay(false);
    selectedStaffOrNeckPitch = null;
    modulationOrigin = null;
    commitStatePatch({ anchorAbsQ: null }, { syncControls: false, refresh: false });
    commitStatePatch({ octavePathOnly: false }, { syncControls: false, refresh: false });
    commitStatePatch({ rootQ: parseInt(/** @type {HTMLSelectElement} */ (e.target).value, 10) || 0 }, { syncControls: false, refresh: false });
    refreshAll();
  });

  document.getElementById("btn-trad-root")?.addEventListener("click", (e) => {
    e.preventDefault();
    clearAllActivePlayback();
    clearShiftOverlay(false);
    selectedStaffOrNeckPitch = null;
    modulationOrigin = null;
    commitStatePatch({ anchorAbsQ: null }, { syncControls: false, refresh: false });
    commitStatePatch({ octavePathOnly: false }, { syncControls: false, refresh: false });
    const active = /** @type {any} */ (getActiveStructure(state).entity);
    if (active.traditional_root_q !== undefined) {
      commitStatePatch({ rootQ: active.traditional_root_q }, { syncControls: false, refresh: false });
      if (selRoot) selRoot.value = String(state.rootQ);
      refreshAll();
    }
  });

  const selIqa = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-iqa"));
  const sliderBpm = /** @type {HTMLInputElement | null} */ (document.getElementById("slider-bpm"));
  const labelBpm = document.getElementById("label-bpm");
  if (sliderBpm) sliderBpm.value = String(state.bpm);
  if (labelBpm) labelBpm.textContent = String(state.bpm);

  selIqa?.addEventListener("change", (e) => {
    commitStatePatch({ iqaId: /** @type {HTMLSelectElement} */ (e.target).value }, { syncControls: false, refresh: false });
    const found = DB.iqaat.find(x => x.id === state.iqaId);
    if (found) {
      commitStatePatch({ bpm: found.default_bpm }, { syncControls: false, refresh: false });
      if (sliderBpm) sliderBpm.value = String(state.bpm);
      if (labelBpm) labelBpm.textContent = String(state.bpm);
    }
    activeIqaBeatIdx = -1;
    restartIqaIfPlaying();
    syncCommandBarSummaries();
    syncStateToUrl(state);
  });

  sliderBpm?.addEventListener("input", (e) => {
    commitStatePatch({ bpm: parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10) }, { syncControls: false, refresh: false });
    if (labelBpm) labelBpm.textContent = String(state.bpm);
    restartIqaIfPlaying();
    syncCommandBarSummaries();
    syncStateToUrl(state);
  });

  document.getElementById("btn-toggle-iqa")?.addEventListener("click", () => {
    toggleIqaPlayback();
    renderStudyGuidePane();
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      clearAllActivePlayback();
      clearShiftOverlay(false);
      selectedStaffOrNeckPitch = null;
      modulationOrigin = null;
      commitStatePatch({ mode: /** @type {any} */ (/** @type {HTMLElement} */ (btn).dataset.mode) }, { syncControls: false, refresh: false });
      commitStatePatch({ cadenceStepIndex: 0 }, { syncControls: false, refresh: false });
      if ((state.mode === "CHORD" || state.mode === "CADENCE") && state.shapeMode === "FULL_NECK") {
        commitStatePatch({ shapeMode: "OPEN_FIRST_POS" }, { syncControls: false, refresh: false });
      }
      syncControlsWithState();
      if (!hasValidAnchor()) {
        const active = /** @type {any} */ (getActiveStructure(state).entity);
        if (active.traditional_root_q !== undefined) {
          commitStatePatch({ rootQ: active.traditional_root_q }, { syncControls: false, refresh: false });
          if (selRoot) selRoot.value = String(state.rootQ);
        }
      }
      refreshAll();
    });
  });

  document.getElementById("select-entity")?.addEventListener("change", (e) => {
    clearAllActivePlayback();
    clearShiftOverlay(false);
    selectedStaffOrNeckPitch = null;
    modulationOrigin = null;
    commitStatePatch({ entityId: /** @type {HTMLSelectElement} */ (e.target).value }, { syncControls: false, refresh: false });
    commitStatePatch({ cadenceStepIndex: 0 }, { syncControls: false, refresh: false });
    if (!hasValidAnchor()) {
      const active = /** @type {any} */ (getActiveStructure(state).entity);
      if (active.traditional_root_q !== undefined) {
        commitStatePatch({ rootQ: active.traditional_root_q }, { syncControls: false, refresh: false });
        if (selRoot) selRoot.value = String(state.rootQ);
      }
    }
    refreshAll();
  });

  document.getElementById("btn-toggle-sayr")?.addEventListener("click", () => {
    commitStatePatch({ showSayr: !state.showSayr }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.querySelectorAll(".sayr-phrase-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      clearAllActivePlayback();
      clearShiftOverlay(false);
      selectedStaffOrNeckPitch = null;
      commitStatePatch({ octavePathOnly: false }, { syncControls: false, refresh: false });
      commitStatePatch({ sayrPhraseIndex: Number(/** @type {HTMLElement} */ (btn).dataset.phrase) }, { syncControls: false, refresh: false });
      commitStatePatch({ showSayr: true }, { syncControls: false, refresh: false });
      commitStatePatch({ staffMode: "SAYR" }, { syncControls: false, refresh: false });
      syncControlsWithState();
      refreshAll();
    });
  });

  document.getElementById("btn-chord-voicing")?.addEventListener("click", () => {
    commitStatePatch({ chordVoicingOnly: true }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-chord-all")?.addEventListener("click", () => {
    commitStatePatch({ chordVoicingOnly: false }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-dir-asc")?.addEventListener("click", () => {
    commitStatePatch({ direction: "ASC" }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-dir-desc")?.addEventListener("click", () => {
    commitStatePatch({ direction: "DESC" }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  const selShape = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-shape"));
  selShape?.addEventListener("change", (e) => {
    clearAllActivePlayback();
    clearShiftOverlay(false);
    commitStatePatch({ shapeMode: /** @type {any} */ (/** @type {HTMLSelectElement} */ (e.target).value) }, { syncControls: false, refresh: false });
    if (
      state.shapeMode === "CLOSED_BOX" ||
      state.shapeMode === "POS_SECOND" ||
      state.shapeMode === "POS_THIRD_BODY"
    ) {
      commitStatePatch({ labelMode: "FINGER" }, { syncControls: false, refresh: false });
    }
    syncControlsWithState();
    refreshAll();
  });

  const sliderBox = /** @type {HTMLInputElement | null} */ (document.getElementById("slider-box"));
  const labelBoxPos = document.getElementById("label-box-pos");
  if (sliderBox) sliderBox.value = String(state.boxAnchorQ);
  if (labelBoxPos) {
    const semiApprox = (state.boxAnchorQ / 2).toFixed(1).replace(".0", "");
    labelBoxPos.textContent = `S${semiApprox} (q=${state.boxAnchorQ})`;
  }
  sliderBox?.addEventListener("input", (e) => {
    commitStatePatch({ boxAnchorQ: parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10) }, { syncControls: false, refresh: false });
    if (labelBoxPos) {
      const semiApprox = (state.boxAnchorQ / 2).toFixed(1).replace(".0", "");
      labelBoxPos.textContent = `S${semiApprox} (q=${state.boxAnchorQ})`;
    }
    refreshAll();
  });

  document.querySelectorAll(".jins-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      commitStatePatch({ jinsFilter: /** @type {any} */ (/** @type {HTMLElement} */ (btn).dataset.filter) }, { syncControls: false, refresh: false });
      syncControlsWithState();
      refreshAll();
    });
  });

  document.getElementById("select-label")?.addEventListener("change", (e) => {
    commitStatePatch({ labelMode: /** @type {any} */ (/** @type {HTMLSelectElement} */ (e.target).value) }, { syncControls: false, refresh: false });
    refreshAll();
  });

  document.getElementById("btn-guide-semi")?.addEventListener("click", () => {
    commitStatePatch({ showSemiGuides: !state.showSemiGuides }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-guide-micro")?.addEventListener("click", () => {
    commitStatePatch({ showMicroGuides: !state.showMicroGuides }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-ghost-notes")?.addEventListener("click", () => {
    commitStatePatch({ showGhostNotes: !state.showGhostNotes }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-toggle-pegbox")?.addEventListener("click", () => {
    const nextVal = /** @type {any} */ (state).showPegbox === false;
    /** @type {any} */ (state).showPegbox = nextVal;
    try {
      localStorage.setItem("oud_show_pegbox_pref", nextVal ? "1" : "0");
    } catch {
      // Ignora
    }
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-play-scale")?.addEventListener("click", handlePrimaryAudioAction);
  document.getElementById("btn-play-taqsim")?.addEventListener("click", handlePlayTaqsim);
  document.getElementById("btn-arp-chord")?.addEventListener("click", () => {
    setActiveHeaderMenu(null);
    suspendPitchDetection(currentChordVoicingFreqs.length * 210 + 500);
    arpeggiateChordVoicing(currentChordVoicingFreqs);
  });
  document.getElementById("btn-strum-step")?.addEventListener("click", () => {
    suspendPitchDetection(950);
    strumChordVoicing(currentChordVoicingFreqs);
  });
  document.getElementById("btn-play-cadence-seq")?.addEventListener("click", handlePrimaryAudioAction);

  const btnDrone = document.getElementById("btn-drone");
  btnDrone?.addEventListener("click", () => {
    commitStatePatch({ droneActive: toggleDroneAudio(state.droneActive, state.rootQ, btnDrone) }, { syncControls: false, refresh: false });
    syncCommandBarSummaries();
    syncLiveTunerUI();
    renderStudyGuidePane();
  });

  const btnShare = document.getElementById("btn-share");
  btnShare?.addEventListener("click", async () => {
    const shareUrl = syncStateToUrl(state);
    try {
      await navigator.clipboard.writeText(shareUrl);
      btnShare.textContent = t(state.lang, "btnShareCopied");
      setTimeout(() => { btnShare.textContent = t(state.lang, "btnShare"); }, 2200);
    } catch {
      window.prompt(t(state.lang, "sharePrompt"), shareUrl);
    }
  });

  document.getElementById("btn-hand")?.addEventListener("click", () => {
    commitStatePatch({ leftHanded: !state.leftHanded }, { syncControls: false, refresh: false });
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-open-glossary")?.addEventListener("click", () => openGlossary());
  document.getElementById("btn-close-glossary")?.addEventListener("click", closeGlossary);
  document.getElementById("glossary-backdrop")?.addEventListener("click", closeGlossary);

  document.getElementById("glossary-search-input")?.addEventListener("input", (e) => {
    glossaryQuery = /** @type {HTMLInputElement} */ (e.target).value;
    renderGlossaryList();
  });

  document.querySelectorAll(".gloss-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      glossaryCategory = /** @type {HTMLElement} */ (btn).dataset.cat || "ALL";
      document.querySelectorAll(".gloss-cat-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      renderGlossaryList();
    });
  });

  document.querySelectorAll(".term-help-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const termId = /** @type {HTMLElement} */ (btn).dataset.term;
      openGlossary(termId);
    });
  });

  window.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement?.tagName.toLowerCase();
    const isTyping = activeTag === "input" || activeTag === "textarea" || activeTag === "select";

    if (e.key === "Escape") {
      if (playingRegionId !== null) {
        stopRegionPlayback(true);
        return;
      }
      if (activeShiftOverlay !== null) {
        clearShiftOverlay(true);
        return;
      }
      if (activeHeaderMenu !== null) {
        setActiveHeaderMenu(null);
        return;
      }
      if (activePopoverIdx !== null) {
        setActivePopover(null);
        return;
      }
      const drawer = document.getElementById("glossary-drawer");
      if (drawer?.classList.contains("open")) {
        closeGlossary();
      } else if (isZenMode) {
        toggleZenMode(false);
      }
      return;
    }

    if (!isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === "f" || e.key === "F")) {
      e.preventDefault();
      toggleZenMode();
    }
  });

  refreshAudioInputDevices();
  syncControlsWithState();
  refreshAll();
}

window.addEventListener("DOMContentLoaded", initApp);

// ==========================================================================
// PWA: Service Worker Offline (ativo em produção, ignorado em localhost)
// ==========================================================================
const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
if ("serviceWorker" in navigator && !isLocalhost) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Ignora em ambientes sem suporte a Service Worker
    });
  });
}

/** @type {any} */
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  const pwaSlot = document.getElementById("header-menu-pwa-slot");
  if (pwaSlot && !document.getElementById("btn-install-pwa")) {
    const installBtn = document.createElement("button");
    installBtn.id = "btn-install-pwa";
    installBtn.type = "button";
    installBtn.className = "menu-item-btn";
    installBtn.setAttribute("role", "menuitem");
    installBtn.textContent = state.lang === "en" ? "📲 Install App" : "📲 Instalar App";
    installBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      setActiveHeaderMenu(null);
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.remove();
    });
    pwaSlot.appendChild(installBtn);
  }
});


// --- Reforço de UI: Escape HTML, Timers de Interface e Visibilidade ---
/**
 * Escapa caracteres especiais para interpolação segura em strings HTML.
 * @param {unknown} value
 * @returns {string}
 */
/** @type {Set<number>} */
const uiTimeouts = new Set();

/**
 * Agenda um timer de interface rastreado para limpeza centralizada.
 * @param {() => void} fn
 * @param {number} delayMs
 * @returns {number}
 */
function scheduleUiTimeout(fn, delayMs) {
  const id = window.setTimeout(() => {
    uiTimeouts.delete(id);
    fn();
  }, delayMs);
  uiTimeouts.add(id);
  return id;
}

function clearUiTimeouts() {
  uiTimeouts.forEach((id) => window.clearTimeout(id));
  uiTimeouts.clear();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearUiTimeouts();
      if (typeof setActivePopover === "function") {
        try { setActivePopover(null); } catch (_) {}
      }
      if (typeof setActiveHeaderMenu === "function") {
        try { setActiveHeaderMenu(null); } catch (_) {}
      }
    }
  });
}


// --- Helpers Centralizados de localStorage (Seguro & Tolerante a Falhas) ---
/**
 * Lê uma chave do localStorage com proteção contra bloqueio/quota.
 * @param {string} key
 * @param {string | null} [fallback=null]
 * @returns {string | null}
 */
/**
 * Grava uma chave no localStorage com proteção contra bloqueio/quota.
 * @param {string} key
 * @param {string} value
 * @returns {boolean}
 */
/**
 * Remove uma chave do localStorage com proteção contra bloqueio.
 * @param {string} key
 * @returns {boolean}
 */
// --- Despachante Centralizado de Transições de Estado ---
/**
 * Atualiza o estado global aplicando normalização pura e sincronizando UI/URL.
 * @param {Record<string, any>} patch
 * @param {{ syncControls?: boolean, refresh?: boolean }} [options]
 */
function commitStatePatch(patch, options = {}) {
  const normalized = applyStatePatch(state, patch);
  Object.assign(state, normalized);
  if (options.syncControls) {
    syncControlsWithState();
  }
  if (options.refresh !== false) {
    refreshAll();
  }
}
