// @ts-check
import { DB, PITCH_CLASSES_24 } from "./core/database.js";
import { getActiveStructure, computeAnchoredOctavePath } from "./core/modalEngine.js";
import { getInitialStateFromUrl, syncStateToUrl } from "./core/urlState.js";
import { GLOSSARY_ENTRIES } from "./core/glossary.js";
import {
  t,
  localizeEntity,
  localizeGlossaryEntry,
  applyStaticTranslations
} from "./core/i18n.js";
import {
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
import { renderOudNeckSVG } from "./ui/neckRenderer.js";
import { renderMusicalStaffSVG } from "./ui/staffRenderer.js";

const state = getInitialStateFromUrl();

// Inicializa o tema a partir do estado, localStorage ou padrão "dark"
try {
  const savedTheme = localStorage.getItem("oud_theme_pref");
  if (!window.location.hash.includes("th=") && (savedTheme === "light" || savedTheme === "dark")) {
    state.theme = savedTheme;
  }
} catch {
  // Ignora se localStorage estiver bloqueado
}
if (state.theme !== "light" && state.theme !== "dark") {
  state.theme = "dark";
}
if (typeof state.rootQ !== "number" || Number.isNaN(state.rootQ) || state.rootQ < 0 || state.rootQ >= 24) {
  state.rootQ = 0;
}
if (typeof state.anchorAbsQ !== "number" || Number.isNaN(state.anchorAbsQ)) {
  state.anchorAbsQ = null;
}
if (typeof state.octavePathOnly !== "boolean") {
  state.octavePathOnly = false;
}
if (state.octavePathDir !== "ASC" && state.octavePathDir !== "DESC") {
  state.octavePathDir = "ASC";
}
if (typeof state.showStaff !== "boolean") {
  state.showStaff = true;
}
if (state.staffMode !== "SCALE" && state.staffMode !== "SAYR") {
  state.staffMode = "SCALE";
}

/** @type {{ course: number, freq: number }[]} */
let currentChordVoicingFreqs = [];
let highlightedSequenceStep = -1;
/** @type {{ absQ: number | null, pitchClassQ: number | null, qFromNut?: number, course?: number, finger?: string | number, freq?: number } | null} */
let selectedStaffOrNeckPitch = null;
let isIqaPlaying = false;
let activeIqaBeatIdx = -1;
let glossaryCategory = "ALL";
let glossaryQuery = "";

/**
 * Injeta as regras de tema Claro (Nahar — Pergaminho Iluminado) e Escuro (Layl — Majlis)
 * diretamente no <head>, garantindo funcionamento imediato mesmo com cache de CSS do navegador.
 */
function ensureThemeStyleEngine() {
  if (document.getElementById("oud-theme-engine")) return;
  const styleEl = document.createElement("style");
  styleEl.id = "oud-theme-engine";
  styleEl.textContent = `
    html[data-theme="light"],
    body[data-theme="light"] {
      --bg-deep: #f3ead8 !important;
      --bg-card: #fcf8ef !important;
      --bg-card-elevated: #efe4ce !important;
      --bg-stage: radial-gradient(circle at 50% 35%, #fffdf9 0%, #e5d6b8 92%) !important;
      --bg-dock: #ebe0c9 !important;
      --bg-input: #f7efe0 !important;
      --text-main: #23160c !important;
      --text-muted: #5e4630 !important;
      --accent: #8c5811 !important;
      --accent-soft: rgba(140, 88, 17, 0.15) !important;
      --sadaf-cyan: #0e7490 !important;
      --sadaf-bg: rgba(14, 116, 144, 0.12) !important;
      --border-gold: rgba(140, 88, 17, 0.42) !important;
      --shadow-card: 0 8px 24px rgba(58, 36, 14, 0.12) !important;
      background: linear-gradient(180deg, #f6efe0 0%, #e8d8b9 100%) !important;
      color: #23160c !important;
    }
    body[data-theme="light"][data-tradition="cairo"] {
      --bg-deep: #f6ebd4 !important;
      --bg-card: #fdf8ec !important;
      --accent: #9a3412 !important;
      --sadaf-cyan: #b45309 !important;
    }
    body[data-theme="light"][data-tradition="istanbul"] {
      --bg-deep: #edf1f5 !important;
      --bg-card: #fbfcfe !important;
      --bg-stage: radial-gradient(circle at 50% 35%, #ffffff 0%, #dbe3ec 92%) !important;
      --bg-dock: #e4eaf1 !important;
      --bg-input: #f1f5f9 !important;
      --accent: #7c5816 !important;
      --sadaf-cyan: #1d4ed8 !important;
      background: linear-gradient(180deg, #f3f6f9 0%, #dfe6ef 100%) !important;
    }
    body[data-theme="light"] .khatem-border,
    body[data-theme="light"] .astrolabe-header,
    body[data-theme="light"] .mihrab-card,
    body[data-theme="light"] .sanctuary-card,
    body[data-theme="light"] .iqa-card,
    body[data-theme="light"] .neck-showcase,
    body[data-theme="light"] .info-card,
    body[data-theme="light"] .cadence-bar,
    body[data-theme="light"] .glossary-drawer {
      background: var(--bg-card) !important;
      border-color: var(--border-gold) !important;
      box-shadow: var(--shadow-card) !important;
      color: var(--text-main) !important;
    }
    body[data-theme="light"] .inlay-dock-top,
    body[data-theme="light"] .inlay-dock-bottom,
    body[data-theme="light"] .staff-stage-box {
      background: var(--bg-dock) !important;
      border-color: var(--border-gold) !important;
      color: var(--text-main) !important;
    }
    body[data-theme="light"] .svg-stage-container {
      background: var(--bg-stage) !important;
    }
    body[data-theme="light"] button,
    body[data-theme="light"] select,
    body[data-theme="light"] .tradition-pill,
    body[data-theme="light"] .meta-pill,
    body[data-theme="light"] .iqa-beat-cell,
    body[data-theme="light"] .cadence-step-card,
    body[data-theme="light"] .glossary-item,
    body[data-theme="light"] .glossary-search-box input {
      background-color: var(--bg-input) !important;
      color: var(--text-main) !important;
      border-color: var(--border-gold) !important;
    }
    body[data-theme="light"] .tradition-pill select {
      background: transparent !important;
      border: none !important;
    }
    body[data-theme="light"] button.primary {
      background: linear-gradient(135deg, #9a6515, #6c4309) !important;
      color: #ffffff !important;
      border-color: #6c4309 !important;
    }
    body[data-theme="light"] button.sadaf-btn,
    body[data-theme="light"] .term-help-btn {
      background: var(--sadaf-bg) !important;
      color: var(--sadaf-cyan) !important;
      border-color: var(--sadaf-cyan) !important;
    }
    body[data-theme="light"] button.selected,
    body[data-theme="light"] .tab-btn.active,
    body[data-theme="light"] button.active-toggle,
    body[data-theme="light"] .cadence-step-card.active-step {
      background: var(--accent-soft) !important;
      color: var(--accent) !important;
      border-color: var(--accent) !important;
      font-weight: 700 !important;
    }
    body[data-theme="light"] h1,
    body[data-theme="light"] h2,
    body[data-theme="light"] h3,
    body[data-theme="light"] .staff-title-group strong {
      color: var(--accent) !important;
    }
    body[data-theme="light"] .brand-subtitle,
    body[data-theme="light"] .info-description,
    body[data-theme="light"] .tuning-description,
    body[data-theme="light"] .staff-subhint,
    body[data-theme="light"] .dock-title,
    body[data-theme="light"] .ribbon-label,
    body[data-theme="light"] .touch-hint,
    body[data-theme="light"] .field-block label {
      color: var(--text-muted) !important;
    }
  `;
  document.head.appendChild(styleEl);
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

function toggleAppTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  try {
    localStorage.setItem("oud_theme_pref", state.theme);
  } catch {
    // Ignora
  }
  syncControlsWithState();
  refreshAll();
}

function applySelectedPitchAsRoot(targetPitch) {
  const newRootQ = resolvePitchClassQ(targetPitch);
  if (newRootQ === null) return;

  clearSequenceTimers();
  highlightedSequenceStep = -1;
  state.rootQ = newRootQ;

  if (targetPitch && typeof targetPitch.absQ === "number" && !Number.isNaN(targetPitch.absQ)) {
    state.anchorAbsQ = targetPitch.absQ;
    state.octavePathOnly = true;
    state.octavePathDir = "ASC";
  } else {
    state.anchorAbsQ = null;
    state.octavePathOnly = false;
  }

  if (state.mode === "CADENCE") {
    state.cadenceStepIndex = 0;
  }

  const selRoot = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-root"));
  if (selRoot) {
    selRoot.value = String(state.rootQ);
  }

  if (state.shapeMode === "CLOSED_BOX" && targetPitch && typeof targetPitch.qFromNut === "number" && targetPitch.qFromNut >= 1) {
    state.boxAnchorQ = Math.max(1, Math.min(10, targetPitch.qFromNut));
    const sliderBox = /** @type {HTMLInputElement | null} */ (document.getElementById("slider-box"));
    const labelBoxPos = document.getElementById("label-box-pos");
    if (sliderBox) sliderBox.value = String(state.boxAnchorQ);
    if (labelBoxPos) {
      const semiApprox = (state.boxAnchorQ / 2).toFixed(1).replace(".0", "");
      labelBoxPos.textContent = `S${semiApprox} (q=${state.boxAnchorQ})`;
    }
  }

  const feedbackFreq = (targetPitch && typeof targetPitch.freq === "number")
    ? targetPitch.freq
    : 130.81 * Math.pow(2, state.rootQ / 24);
  playPluckedNote(feedbackFreq, 1.4);

  selectedStaffOrNeckPitch = null;
  syncControlsWithState();
  refreshAll();
}

function handlePlayAnchoredOctavePath() {
  if (!hasValidAnchor()) return;
  const pathNodes = computeAnchoredOctavePath(state);
  if (!pathNodes.length) return;

  clearSequenceTimers();
  highlightedSequenceStep = -1;

  if (!state.octavePathOnly) {
    state.octavePathOnly = true;
    syncControlsWithState();
  }

  const steps = pathNodes.map(n => ({
    interval_q: n.absQ - state.rootQ,
    dur_ms: 360,
    accent: n.degree === "1" || n.degree === "8" || n.degree === "5"
  }));

  playTaqsimPhrase(state.rootQ, steps, {}, (stepIdx) => {
    highlightedSequenceStep = stepIdx;
    refreshAll();
  });
}

function ensureDynamicTonicControlsExist() {
  ensureThemeStyleEngine();

  const medallions = document.querySelector(".action-medallions");
  let themeBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById("btn-theme"));
  if (medallions && !themeBtn) {
    themeBtn = document.createElement("button");
    themeBtn.id = "btn-theme";
    themeBtn.type = "button";
    themeBtn.className = "sadaf-btn";
    const langBtn = document.getElementById("btn-lang");
    if (langBtn) {
      medallions.insertBefore(themeBtn, langBtn);
    } else {
      medallions.appendChild(themeBtn);
    }
  }
  if (themeBtn && !themeBtn.dataset.boundTheme) {
    themeBtn.dataset.boundTheme = "1";
    themeBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      toggleAppTheme();
    });
  }

  const staffPills = document.querySelector(".staff-toolbar .brass-pills");
  if (staffPills && !document.getElementById("btn-set-root-from-selection")) {
    const btn = document.createElement("button");
    btn.id = "btn-set-root-from-selection";
    btn.type = "button";
    btn.className = "primary";
    btn.style.display = "none";
    btn.textContent = t(state.lang, "btnSetRootFromNote");
    staffPills.insertBefore(btn, document.getElementById("btn-clear-staff-filter"));
  }

  const dockPills = document.querySelector(".inlay-dock-top .brass-pills");
  if (dockPills && !document.getElementById("btn-dock-set-tonic")) {
    const dockBtn = document.createElement("button");
    dockBtn.id = "btn-dock-set-tonic";
    dockBtn.type = "button";
    dockBtn.className = "primary";
    dockBtn.style.display = "none";
    dockBtn.textContent = t(state.lang, "btnSetRootFromNote");
    dockPills.insertBefore(dockBtn, dockPills.firstChild);
  }

  const neckShowcase = document.querySelector(".neck-showcase");
  const svgContainer = document.querySelector(".svg-stage-container");
  if (neckShowcase && svgContainer && !document.getElementById("octave-path-bar")) {
    const bar = document.createElement("div");
    bar.id = "octave-path-bar";
    bar.style.cssText = [
      "display:none",
      "flex-wrap:wrap",
      "align-items:center",
      "justify-content:space-between",
      "gap:8px",
      "padding:8px 14px",
      "background:linear-gradient(90deg, rgba(6,182,212,0.12), rgba(212,175,55,0.12))",
      "border-bottom:1px solid rgba(103,232,249,0.35)"
    ].join(";");

    bar.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <strong id="octave-bar-label" style="color:var(--sadaf-cyan); font-size:0.82rem;">📍 Caminho da Tônica</strong>
        <div class="brass-pills compact-pills">
          <button type="button" id="btn-oct-mode-all">🌐 Todas as Oitavas</button>
          <button type="button" id="btn-oct-mode-single" class="selected">🎯 Caminho 1 Oitava</button>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <div class="brass-pills compact-pills">
          <button type="button" id="btn-oct-dir-asc" class="selected">↑ Ascendente (+8ª)</button>
          <button type="button" id="btn-oct-dir-desc">↓ Descendente (-8ª)</button>
        </div>
        <button type="button" id="btn-play-octave-path" class="sadaf-btn" style="padding:4px 12px; font-size:0.78rem;">▶ Ouvir Caminho</button>
        <button type="button" id="btn-close-octave-bar" style="padding:4px 9px; font-size:0.78rem;">✕</button>
      </div>
    `;
    neckShowcase.insertBefore(bar, svgContainer);
  }
}

function renderGlossaryList(focusTermId) {
  const listEl = document.getElementById("glossary-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  const normalize = (/** @type {string} */ str) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const qNorm = normalize(glossaryQuery.trim());

  const filtered = GLOSSARY_ENTRIES.filter(rawEntry => {
    const matchCat = glossaryCategory === "ALL" || rawEntry.category === glossaryCategory;
    if (!matchCat) return false;
    if (!qNorm) return true;
    const locEntry = localizeGlossaryEntry(state.lang, rawEntry);
    const haystack = normalize(
      `${rawEntry.term} ${rawEntry.literal} ${rawEntry.definition} ${locEntry.term} ${locEntry.literal} ${locEntry.definition} ${locEntry.oudApplication}`
    ) + " " + rawEntry.arabic;
    return haystack.includes(qNorm);
  });

  if (!filtered.length) {
    listEl.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:24px; font-size:0.84rem;">${t(state.lang, "glossaryEmpty")} "${glossaryQuery}".</div>`;
    return;
  }

  filtered.forEach(rawEntry => {
    const entry = localizeGlossaryEntry(state.lang, rawEntry);
    const card = document.createElement("article");
    const isFocused = focusTermId === entry.id;
    card.className = `glossary-item ${isFocused ? "highlighted" : ""}`;
    card.id = `gloss-entry-${entry.id}`;
    card.innerHTML = `
      <div class="glossary-item-top">
        <span class="glossary-term-title">${entry.term}</span>
        <span class="glossary-arabic" lang="ar">${entry.arabic}</span>
      </div>
      <div class="glossary-meta-row">
        <span class="glossary-literal">${t(state.lang, "glossaryTranslationLbl")}: "${entry.literal}"</span>
        <span class="glossary-cat-tag">${entry.categoryLabel}</span>
      </div>
      <p class="glossary-def">${entry.definition}</p>
      <div class="glossary-app-note">🪕 <strong>${t(state.lang, "glossaryAppLbl")}:</strong> ${entry.oudApplication}</div>
    `;
    listEl.appendChild(card);
  });

  if (focusTermId) {
    requestAnimationFrame(() => {
      document.getElementById(`gloss-entry-${focusTermId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
}

function openGlossary(termId) {
  const drawer = document.getElementById("glossary-drawer");
  const backdrop = document.getElementById("glossary-backdrop");
  if (!drawer || !backdrop) return;

  if (termId) {
    glossaryCategory = "ALL";
    glossaryQuery = "";
    const searchInput = /** @type {HTMLInputElement | null} */ (document.getElementById("glossary-search-input"));
    if (searchInput) searchInput.value = "";
    document.querySelectorAll(".gloss-cat-btn").forEach(b => {
      b.classList.toggle("selected", /** @type {HTMLElement} */ (b).dataset.cat === "ALL");
    });
  }

  renderGlossaryList(termId);
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  backdrop.classList.add("open");
}

function closeGlossary() {
  const drawer = document.getElementById("glossary-drawer");
  const backdrop = document.getElementById("glossary-backdrop");
  drawer?.classList.remove("open");
  drawer?.setAttribute("aria-hidden", "true");
  backdrop?.classList.remove("open");
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
      clearSequenceTimers();
      selectedStaffOrNeckPitch = null;
      state.cadenceStepIndex = idx;
      refreshAll();
      strumChordVoicing(currentChordVoicingFreqs);
    });

    container.appendChild(card);
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
          <strong style="color:var(--sadaf-cyan);">✨ ${phrase.title}</strong>
          <div style="margin-top:3px; color:var(--text-muted);">${phrase.summary}</div>
          <div style="margin-top:4px; font-size:0.78rem; color:var(--accent);"><strong>${t(state.lang, "pillNotes")}:</strong> ${phraseNotes}</div>
        </div>
        <button id="btn-inline-taqsim" class="sadaf-btn" style="padding:5px 12px; font-size:0.78rem;">${t(state.lang, "btnPlayPhraseInline")}</button>
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
        <button id="btn-jump-cadence" class="primary" style="padding:5px 12px; font-size:0.78rem;">${t(state.lang, "btnOpenQafla")}</button>
      `;
      bridgeContainer.appendChild(box);
      document.getElementById("btn-jump-cadence")?.addEventListener("click", () => {
        clearSequenceTimers();
        highlightedSequenceStep = -1;
        selectedStaffOrNeckPitch = null;
        state.mode = "CADENCE";
        state.entityId = entity.linked_cadence;
        state.cadenceStepIndex = 0;
        if (state.shapeMode === "FULL_NECK") {
          state.shapeMode = "OPEN_FIRST_POS";
          const selShape = /** @type {HTMLSelectElement} */ (document.getElementById("select-shape"));
          if (selShape) selShape.value = "OPEN_FIRST_POS";
        }
        syncControlsWithState();
        refreshAll();
      });
    }

    if ((state.mode === "SCALE" || state.mode === "CHORD" || state.mode === "CADENCE") && entity.bridge_maqam) {
      const box = document.createElement("div");
      box.className = "bridge-box";
      box.innerHTML = `
        <span>${t(state.lang, "bridgeMatrixPrefix")} <strong>${entity.bridge_text}</strong></span>
        <button id="btn-jump-maqam" style="padding:4px 10px; font-size:0.78rem;">${t(state.lang, "btnSeeMaqam")}</button>
      `;
      bridgeContainer.appendChild(box);
      document.getElementById("btn-jump-maqam")?.addEventListener("click", () => {
        clearSequenceTimers();
        selectedStaffOrNeckPitch = null;
        state.mode = "MAQAM";
        state.entityId = entity.bridge_maqam;
        syncControlsWithState();
        refreshAll();
      });
    }
  }

  const rawTuning = DB.tunings.find(x => x.id === state.tuningId) || DB.tunings[0];
  const tuning = localizeEntity(state.lang, rawTuning);
  const tuningDescEl = document.getElementById("tuning-desc");
  const listEl = document.getElementById("tuning-intervals-list");
  if (tuningDescEl && listEl) {
    tuningDescEl.textContent = tuning.description;
    listEl.innerHTML = "";
    for (let i = 5; i > 0; i--) {
      const lowC = tuning.courses[i];
      const highC = tuning.courses[i - 1];
      const diffQ = highC.abs_q - lowC.abs_q;
      let intName = `${diffQ / 2} ${t(state.lang, "intSemitones")}`;
      if (diffQ === 10) intName = t(state.lang, "intPerfect4th");
      else if (diffQ === 8) intName = t(state.lang, "intMajor3rd");
      else if (diffQ === 4) intName = t(state.lang, "intMajor2nd");
      else if (diffQ === 24) intName = t(state.lang, "intOctave");

      const item = document.createElement("div");
      item.style.padding = "4px 8px";
      item.style.background = diffQ === 8 ? "var(--accent-soft)" : "rgba(128,128,128,0.08)";
      item.style.borderRadius = "4px";
      item.innerHTML = `<strong>${lowC.label} → ${highC.label}:</strong> ${intName}`;
      listEl.appendChild(item);
    }
  }
}

function handlePrimaryAudioAction() {
  clearSequenceTimers();
  highlightedSequenceStep = -1;

  if (state.octavePathOnly && hasValidAnchor()) {
    handlePlayAnchoredOctavePath();
    return;
  }

  if (state.mode === "CADENCE") {
    const cad = DB.cadences.find(x => x.id === state.entityId) || DB.cadences[0];
    scheduleCadenceSequence(cad.steps.length, (stepIdx) => {
      state.cadenceStepIndex = stepIdx;
      refreshAll();
      strumChordVoicing(currentChordVoicingFreqs);
    });
    return;
  }

  if (state.mode === "CHORD" && currentChordVoicingFreqs.length > 0) {
    strumChordVoicing(currentChordVoicingFreqs);
    return;
  }

  const activeStruct = getActiveStructure(state);
  playScaleSequence(activeStruct.effectiveRootQ, activeStruct.intervals, activeStruct.centsMap);
}

function handlePlayTaqsim() {
  if (state.mode !== "MAQAM") return;
  const activeStruct = getActiveStructure(state);
  const entity = /** @type {any} */ (activeStruct.entity);
  const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
  if (!phrase) return;

  state.octavePathOnly = false;
  state.showSayr = true;
  state.staffMode = "SAYR";
  document.getElementById("btn-toggle-sayr")?.classList.add("selected");
  syncControlsWithState();

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
    state.entityId = list[0].id;
  }
  sel.value = state.entityId;
}

function syncSelectionActionButtons() {
  ensureDynamicTonicControlsExist();
  const btnClearFilter = document.getElementById("btn-clear-staff-filter");
  const btnSetRoot = document.getElementById("btn-set-root-from-selection");
  const btnDockSetTonic = document.getElementById("btn-dock-set-tonic");

  const pcQ = resolvePitchClassQ(selectedStaffOrNeckPitch);

  if (selectedStaffOrNeckPitch !== null && pcQ !== null && PITCH_CLASSES_24[pcQ]) {
    const pc = PITCH_CLASSES_24[pcQ];
    const labelText = `${t(state.lang, "btnSetRootFromNote")}: ${pc.flat} (${pc.arabic})`;

    if (btnClearFilter) btnClearFilter.style.display = "inline-flex";
    if (btnSetRoot) {
      btnSetRoot.style.display = "inline-flex";
      btnSetRoot.textContent = labelText;
    }
    if (btnDockSetTonic) {
      btnDockSetTonic.style.display = state.showStaff ? "none" : "inline-flex";
      btnDockSetTonic.textContent = labelText;
    }
  } else {
    if (btnClearFilter) btnClearFilter.style.display = "none";
    if (btnSetRoot) btnSetRoot.style.display = "none";
    if (btnDockSetTonic) btnDockSetTonic.style.display = "none";
  }

  const octBar = document.getElementById("octave-path-bar");
  if (octBar) {
    if (hasValidAnchor() && typeof state.anchorAbsQ === "number") {
      octBar.style.display = "flex";
      const pcIdx = ((state.anchorAbsQ % 24) + 24) % 24;
      const pc = PITCH_CLASSES_24[pcIdx] || PITCH_CLASSES_24[0];
      const octNum = Math.floor(state.anchorAbsQ / 24) + 2;
      const lbl = document.getElementById("octave-bar-label");
      const titlePrefix = state.lang === "en" ? "📍 Tonic Path:" : "📍 Caminho da Tônica:";
      if (lbl) lbl.textContent = `${titlePrefix} ${pc.flat}${octNum} (${pc.arabic})`;

      const btnAll = document.getElementById("btn-oct-mode-all");
      const btnSingle = document.getElementById("btn-oct-mode-single");
      const btnAsc = document.getElementById("btn-oct-dir-asc");
      const btnDesc = document.getElementById("btn-oct-dir-desc");
      const btnPlayOct = document.getElementById("btn-play-octave-path");

      if (btnAll) {
        btnAll.textContent = state.lang === "en" ? "🌐 All Octaves" : "🌐 Todas as Oitavas";
        btnAll.classList.toggle("selected", !state.octavePathOnly);
      }
      if (btnSingle) {
        btnSingle.textContent = state.lang === "en" ? "🎯 1-Octave Path" : "🎯 Caminho 1 Oitava";
        btnSingle.classList.toggle("selected", state.octavePathOnly);
      }
      if (btnAsc) {
        btnAsc.textContent = state.lang === "en" ? "↑ Ascending (+8ve)" : "↑ Ascendente (+8ª)";
        btnAsc.classList.toggle("selected", state.octavePathDir === "ASC");
      }
      if (btnDesc) {
        btnDesc.textContent = state.lang === "en" ? "↓ Descending (-8ve)" : "↓ Descendente (-8ª)";
        btnDesc.classList.toggle("selected", state.octavePathDir === "DESC");
      }
      if (btnPlayOct) {
        btnPlayOct.textContent = state.lang === "en" ? "▶ Play Path" : "▶ Ouvir Caminho";
      }
    } else {
      octBar.style.display = "none";
    }
  }
}

function syncControlsWithState() {
  ensureDynamicTonicControlsExist();
  applyStaticTranslations(state.lang);
  populateAllLocalizedSelects();

  document.documentElement.setAttribute("data-theme", state.theme);
  document.body.setAttribute("data-theme", state.theme);
  document.body.setAttribute("data-tradition", state.tradition);
  document.body.setAttribute("data-orientation", state.orientation);

  const btnTheme = document.getElementById("btn-theme");
  if (btnTheme) {
    if (state.theme === "light") {
      btnTheme.textContent = state.lang === "en" ? "🌙 Dark Mode (Majlis)" : "🌙 Modo Escuro (Majlis)";
    } else {
      btnTheme.textContent = state.lang === "en" ? "☀️ Light Mode (Parchment)" : "☀️ Modo Claro (Pergaminho)";
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
    btnLang.textContent = state.lang === "en" ? "🌐 EN | PT" : "🌐 PT | EN";
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

  const btnPlay = document.getElementById("btn-play-scale");
  const btnTaqsim = document.getElementById("btn-play-taqsim");
  const btnArp = document.getElementById("btn-arp-chord");
  if (btnPlay && btnArp && btnTaqsim) {
    btnTaqsim.style.display = state.mode === "MAQAM" ? "inline-flex" : "none";
    if (state.mode === "CADENCE") {
      btnPlay.textContent = t(state.lang, "btnPlayQafla");
      btnArp.style.display = "inline-flex";
    } else if (state.mode === "CHORD") {
      btnPlay.textContent = t(state.lang, "btnPlayChord");
      btnArp.style.display = "inline-flex";
    } else {
      btnPlay.textContent = t(state.lang, "btnPlayScale");
      btnArp.style.display = "none";
    }
  }

  renderGlossaryList();
}

/**
 * Pós-processador visual de segurança para os SVGs da Pauta e do Espelho no Modo Claro,
 * garantindo contraste perfeito mesmo que submódulos antigos estejam em cache.
 */
function applySvgThemePolish() {
  const isLight = state.theme === "light";
  const staffSvg = document.getElementById("oud-staff");
  if (staffSvg && isLight) {
    const firstRect = staffSvg.querySelector("rect");
    if (firstRect) {
      firstRect.setAttribute("fill", "#faf3e3");
      firstRect.setAttribute("stroke", "rgba(138, 90, 25, 0.45)");
    }
    staffSvg.querySelectorAll("line").forEach(ln => {
      const st = ln.getAttribute("stroke") || "";
      if (st.includes("254, 243, 199")) {
        ln.setAttribute("stroke", "rgba(75, 54, 33, 0.52)");
      }
    });
    staffSvg.querySelectorAll("text").forEach(tx => {
      const fl = tx.getAttribute("fill") || "";
      if (fl === "#fef3c7" || fl === "#ffffff") {
        tx.setAttribute("fill", "#23160c");
      } else if (fl === "#fde68a" || fl === "#fde047") {
        tx.setAttribute("fill", "#8c5811");
      } else if (fl === "#67e8f9") {
        tx.setAttribute("fill", "#0e7490");
      }
    });
  }

  const neckSvg = document.getElementById("oud-neck");
  if (neckSvg && isLight) {
    neckSvg.querySelectorAll("text").forEach(tx => {
      if (tx.closest(".note-node")) return; // Mantém o texto branco dentro das joias
      const fl = tx.getAttribute("fill") || "";
      if (fl === "#fef3c7") {
        tx.setAttribute("fill", "#2c1d11");
      } else if (fl === "#fde68a") {
        tx.setAttribute("fill", "#78350f");
      } else if (fl === "#d8b4fe") {
        tx.setAttribute("fill", "#6b21a8");
      }
    });
  }
}

function refreshAll() {
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
        selectedStaffOrNeckPitch = staffSelection;
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
      selectedStaffOrNeckPitch = neckNoteInfo;
      if (neckNoteInfo.makeRoot) {
        applySelectedPitchAsRoot(neckNoteInfo);
      } else {
        refreshAll();
      }
    },
    octavePathNodes
  );

  applySvgThemePolish();
  updateInfoPanel();
  const droneBtn = document.getElementById("btn-drone");
  if (droneBtn) updateDronePitch(state.droneActive, state.rootQ, droneBtn);
  syncStateToUrl(state);
}

function initApp() {
  ensureDynamicTonicControlsExist();
  document.documentElement.setAttribute("data-theme", state.theme);
  document.body.setAttribute("data-theme", state.theme);
  document.body.setAttribute("data-tradition", state.tradition);
  document.body.setAttribute("data-orientation", state.orientation);

  document.addEventListener("click", (e) => {
    const rawTarget = e.target;
    const target = rawTarget instanceof Element ? rawTarget : (rawTarget && /** @type {Node} */ (rawTarget).parentElement);
    if (!target) return;

    if (target.closest("#btn-set-root-from-selection, #btn-dock-set-tonic")) {
      e.preventDefault();
      applySelectedPitchAsRoot(selectedStaffOrNeckPitch);
      return;
    }

    if (target.closest("#btn-oct-mode-all")) {
      e.preventDefault();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.octavePathOnly = false;
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-mode-single")) {
      e.preventDefault();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.octavePathOnly = true;
      state.staffMode = "SCALE";
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-dir-asc")) {
      e.preventDefault();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.octavePathDir = "ASC";
      state.octavePathOnly = true;
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-dir-desc")) {
      e.preventDefault();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.octavePathDir = "DESC";
      state.octavePathOnly = true;
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
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.anchorAbsQ = null;
      state.octavePathOnly = false;
      refreshAll();
    }
  });

  const selTradition = /** @type {HTMLSelectElement} */ (document.getElementById("select-tradition"));
  selTradition.value = state.tradition;
  selTradition.addEventListener("change", (e) => {
    state.tradition = /** @type {HTMLSelectElement} */ (e.target).value;
    document.body.setAttribute("data-tradition", state.tradition);
    refreshAll();
  });

  document.getElementById("btn-lang")?.addEventListener("click", () => {
    state.lang = state.lang === "pt" ? "en" : "pt";
    syncControlsWithState();
    refreshAll();
  });

  const btnOrientation = document.getElementById("btn-orientation");
  btnOrientation?.addEventListener("click", () => {
    state.orientation = state.orientation === "HORIZONTAL" ? "VERTICAL" : "HORIZONTAL";
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-toggle-staff")?.addEventListener("click", () => {
    state.showStaff = !state.showStaff;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-staff-mode-scale")?.addEventListener("click", () => {
    state.staffMode = "SCALE";
    selectedStaffOrNeckPitch = null;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-staff-mode-sayr")?.addEventListener("click", () => {
    state.staffMode = "SAYR";
    state.octavePathOnly = false;
    selectedStaffOrNeckPitch = null;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-clear-staff-filter")?.addEventListener("click", () => {
    selectedStaffOrNeckPitch = null;
    refreshAll();
  });

  const selTuning = /** @type {HTMLSelectElement} */ (document.getElementById("select-tuning"));
  selTuning.addEventListener("change", (e) => {
    state.tuningId = /** @type {HTMLSelectElement} */ (e.target).value;
    selectedStaffOrNeckPitch = null;
    refreshAll();
  });

  const selRoot = /** @type {HTMLSelectElement} */ (document.getElementById("select-root"));
  selRoot.addEventListener("change", (e) => {
    clearSequenceTimers();
    highlightedSequenceStep = -1;
    selectedStaffOrNeckPitch = null;
    state.anchorAbsQ = null;
    state.octavePathOnly = false;
    state.rootQ = parseInt(/** @type {HTMLSelectElement} */ (e.target).value, 10) || 0;
    refreshAll();
  });

  document.getElementById("btn-trad-root")?.addEventListener("click", (e) => {
    e.preventDefault();
    clearSequenceTimers();
    highlightedSequenceStep = -1;
    selectedStaffOrNeckPitch = null;
    state.anchorAbsQ = null;
    state.octavePathOnly = false;
    const active = /** @type {any} */ (getActiveStructure(state).entity);
    if (active.traditional_root_q !== undefined) {
      state.rootQ = active.traditional_root_q;
      selRoot.value = String(state.rootQ);
      refreshAll();
    }
  });

  const selIqa = /** @type {HTMLSelectElement} */ (document.getElementById("select-iqa"));
  const sliderBpm = /** @type {HTMLInputElement} */ (document.getElementById("slider-bpm"));
  const labelBpm = document.getElementById("label-bpm");
  sliderBpm.value = String(state.bpm);
  if (labelBpm) labelBpm.textContent = String(state.bpm);

  selIqa.addEventListener("change", (e) => {
    state.iqaId = /** @type {HTMLSelectElement} */ (e.target).value;
    const found = DB.iqaat.find(x => x.id === state.iqaId);
    if (found) {
      state.bpm = found.default_bpm;
      sliderBpm.value = String(state.bpm);
      if (labelBpm) labelBpm.textContent = String(state.bpm);
    }
    activeIqaBeatIdx = -1;
    restartIqaIfPlaying();
    syncStateToUrl(state);
  });

  sliderBpm.addEventListener("input", (e) => {
    state.bpm = parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10);
    if (labelBpm) labelBpm.textContent = String(state.bpm);
    restartIqaIfPlaying();
    syncStateToUrl(state);
  });

  const btnToggleIqa = document.getElementById("btn-toggle-iqa");
  btnToggleIqa?.addEventListener("click", () => {
    if (isIqaPlaying) {
      stopIqaEngine();
      isIqaPlaying = false;
      activeIqaBeatIdx = -1;
      btnToggleIqa.textContent = t(state.lang, "btnStartIqa");
      btnToggleIqa.classList.remove("active-toggle");
      renderIqaBeatGrid();
    } else {
      isIqaPlaying = true;
      btnToggleIqa.textContent = t(state.lang, "btnStopIqa");
      btnToggleIqa.classList.add("active-toggle");
      restartIqaIfPlaying();
    }
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      selectedStaffOrNeckPitch = null;
      state.mode = /** @type {any} */ (/** @type {HTMLElement} */ (btn).dataset.mode);
      state.cadenceStepIndex = 0;
      if ((state.mode === "CHORD" || state.mode === "CADENCE") && state.shapeMode === "FULL_NECK") {
        state.shapeMode = "OPEN_FIRST_POS";
        /** @type {HTMLSelectElement} */ (document.getElementById("select-shape")).value = "OPEN_FIRST_POS";
      }
      syncControlsWithState();
      if (!hasValidAnchor()) {
        const active = /** @type {any} */ (getActiveStructure(state).entity);
        if (active.traditional_root_q !== undefined) {
          state.rootQ = active.traditional_root_q;
          selRoot.value = String(state.rootQ);
        }
      }
      refreshAll();
    });
  });

  document.getElementById("select-entity")?.addEventListener("change", (e) => {
    clearSequenceTimers();
    highlightedSequenceStep = -1;
    selectedStaffOrNeckPitch = null;
    state.entityId = /** @type {HTMLSelectElement} */ (e.target).value;
    state.cadenceStepIndex = 0;
    if (!hasValidAnchor()) {
      const active = /** @type {any} */ (getActiveStructure(state).entity);
      if (active.traditional_root_q !== undefined) {
        state.rootQ = active.traditional_root_q;
        selRoot.value = String(state.rootQ);
      }
    }
    refreshAll();
  });

  const btnToggleSayr = document.getElementById("btn-toggle-sayr");
  btnToggleSayr?.classList.toggle("selected", state.showSayr);
  btnToggleSayr?.addEventListener("click", () => {
    state.showSayr = !state.showSayr;
    btnToggleSayr.classList.toggle("selected", state.showSayr);
    refreshAll();
  });

  document.querySelectorAll(".sayr-phrase-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      selectedStaffOrNeckPitch = null;
      state.octavePathOnly = false;
      state.sayrPhraseIndex = Number(/** @type {HTMLElement} */ (btn).dataset.phrase);
      state.showSayr = true;
      state.staffMode = "SAYR";
      btnToggleSayr?.classList.add("selected");
      syncControlsWithState();
      refreshAll();
    });
  });

  const btnVoicing = document.getElementById("btn-chord-voicing");
  const btnChordAll = document.getElementById("btn-chord-all");
  btnVoicing?.classList.toggle("selected", state.chordVoicingOnly);
  btnChordAll?.classList.toggle("selected", !state.chordVoicingOnly);

  btnVoicing?.addEventListener("click", () => {
    state.chordVoicingOnly = true;
    btnVoicing.classList.add("selected");
    btnChordAll?.classList.remove("selected");
    refreshAll();
  });
  btnChordAll?.addEventListener("click", () => {
    state.chordVoicingOnly = false;
    btnChordAll.classList.add("selected");
    btnVoicing?.classList.remove("selected");
    refreshAll();
  });

  const btnAsc = document.getElementById("btn-dir-asc");
  const btnDesc = document.getElementById("btn-dir-desc");
  btnAsc?.classList.toggle("selected", state.direction === "ASC");
  btnDesc?.classList.toggle("selected", state.direction === "DESC");

  btnAsc?.addEventListener("click", () => {
    state.direction = "ASC";
    btnAsc.classList.add("selected");
    btnDesc?.classList.remove("selected");
    refreshAll();
  });
  btnDesc?.addEventListener("click", () => {
    state.direction = "DESC";
    btnDesc.classList.add("selected");
    btnAsc?.classList.remove("selected");
    refreshAll();
  });

  const selShape = /** @type {HTMLSelectElement} */ (document.getElementById("select-shape"));
  selShape.value = state.shapeMode;
  selShape.addEventListener("change", (e) => {
    state.shapeMode = /** @type {any} */ (/** @type {HTMLSelectElement} */ (e.target).value);
    if (state.shapeMode === "CLOSED_BOX") {
      state.labelMode = "FINGER";
      /** @type {HTMLSelectElement} */ (document.getElementById("select-label")).value = "FINGER";
    }
    syncControlsWithState();
    refreshAll();
  });

  const sliderBox = /** @type {HTMLInputElement} */ (document.getElementById("slider-box"));
  const labelBoxPos = document.getElementById("label-box-pos");
  sliderBox.value = String(state.boxAnchorQ);
  if (labelBoxPos) {
    const semiApprox = (state.boxAnchorQ / 2).toFixed(1).replace(".0", "");
    labelBoxPos.textContent = `S${semiApprox} (q=${state.boxAnchorQ})`;
  }
  sliderBox.addEventListener("input", (e) => {
    state.boxAnchorQ = parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10);
    if (labelBoxPos) {
      const semiApprox = (state.boxAnchorQ / 2).toFixed(1).replace(".0", "");
      labelBoxPos.textContent = `S${semiApprox} (q=${state.boxAnchorQ})`;
    }
    refreshAll();
  });

  document.querySelectorAll(".jins-filter").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    el.classList.toggle("selected", el.dataset.filter === state.jinsFilter);
    el.addEventListener("click", () => {
      state.jinsFilter = /** @type {any} */ (el.dataset.filter);
      document.querySelectorAll(".jins-filter").forEach(b => b.classList.remove("selected"));
      el.classList.add("selected");
      refreshAll();
    });
  });

  const selLabel = /** @type {HTMLSelectElement} */ (document.getElementById("select-label"));
  selLabel.value = state.labelMode;
  selLabel.addEventListener("change", (e) => {
    state.labelMode = /** @type {any} */ (/** @type {HTMLSelectElement} */ (e.target).value);
    refreshAll();
  });

  const btnSemi = document.getElementById("btn-guide-semi");
  btnSemi?.addEventListener("click", () => {
    state.showSemiGuides = !state.showSemiGuides;
    btnSemi.classList.toggle("selected", state.showSemiGuides);
    refreshAll();
  });

  const btnMicro = document.getElementById("btn-guide-micro");
  btnMicro?.addEventListener("click", () => {
    state.showMicroGuides = !state.showMicroGuides;
    btnMicro.classList.toggle("selected", state.showMicroGuides);
    refreshAll();
  });

  const btnGhost = document.getElementById("btn-ghost-notes");
  btnGhost?.addEventListener("click", () => {
    state.showGhostNotes = !state.showGhostNotes;
    btnGhost.classList.toggle("selected", state.showGhostNotes);
    refreshAll();
  });

  document.getElementById("btn-play-scale")?.addEventListener("click", handlePrimaryAudioAction);
  document.getElementById("btn-play-taqsim")?.addEventListener("click", handlePlayTaqsim);
  document.getElementById("btn-arp-chord")?.addEventListener("click", () => arpeggiateChordVoicing(currentChordVoicingFreqs));
  document.getElementById("btn-strum-step")?.addEventListener("click", () => strumChordVoicing(currentChordVoicingFreqs));
  document.getElementById("btn-play-cadence-seq")?.addEventListener("click", handlePrimaryAudioAction);

  const btnDrone = document.getElementById("btn-drone");
  btnDrone?.addEventListener("click", () => {
    state.droneActive = toggleDroneAudio(state.droneActive, state.rootQ, btnDrone);
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

  const btnHand = document.getElementById("btn-hand");
  btnHand?.addEventListener("click", () => {
    state.leftHanded = !state.leftHanded;
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
    if (e.key === "Escape") closeGlossary();
  });

  syncControlsWithState();
  refreshAll();
}

window.addEventListener("DOMContentLoaded", initApp);
