// @ts-check

/**
 * Cria view de renderização dos painéis do Deck, cadência, Iqa'at, radar de modulação e resumos.
 * @param {any} deps
 */
export function createDeckPanelsView(deps) {
  const {
    getState,
    getDb,
    getPitchClasses24,
    getActiveIqaBeatIdx,
    setActiveIqaBeatIdx,
    getModulationOrigin,
    setModulationOrigin,
    getCurrentChordVoicingFreqs,
    getSelectedStaffOrNeckPitch,
    setSelectedStaffOrNeckPitch,
    getIsIqaPlaying,
    getIsSidebarCollapsed,
    getCompletedStudyLessons,
    getAllStudyLessons,
    getActiveStructure,
    getModulationRoutesForCurrentState,
    hasValidAnchor,
    resolvePitchClassQ,
    localizeEntity,
    t,
    safeT,
    escapeHtml,
    commitStatePatch,
    refreshAll,
    clearAllActivePlayback,
    clearShiftOverlay,
    suspendPitchDetection,
    strumChordVoicing,
    playScaleSequence,
    setActivePopover,
    setActiveDeckTab,
  } = deps;
  const renderStudyGuidePane = typeof deps?.renderStudyGuidePane === "function" ? deps.renderStudyGuidePane : () => {};
  const handlePlayTaqsim = typeof deps?.handlePlayTaqsim === "function" ? deps.handlePlayTaqsim : () => {};
  const syncMobileMicButton = typeof deps?.syncMobileMicButton === "function" ? deps.syncMobileMicButton : () => {};
  const syncControlsWithState = typeof deps?.syncControlsWithState === "function" ? deps.syncControlsWithState : () => {};
  const playPluckedNote = typeof deps?.playPluckedNote === "function" ? deps.playPluckedNote : () => {};

  const state = new Proxy({}, {
    get(_, prop) {
      return getState()[prop];
    },
    set(_, prop, val) {
      getState()[prop] = val;
      return true;
    },
  });

  const DB = new Proxy({}, {
    get(_, prop) {
      return getDb()[prop];
    },
  });

  const PITCH_CLASSES_24 = new Proxy([], {
    get(_, prop) {
      return getPitchClasses24()[prop];
    },
  });

  // Estado dinâmico lido sempre sob demanda via getters de deps

function renderIqaBeatGrid() {
  const grid = document.getElementById("iqa-beat-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const activeIqaBeatIdx = getActiveIqaBeatIdx ? getActiveIqaBeatIdx() : -1;
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
      setSelectedStaffOrNeckPitch(null);
      commitStatePatch({ cadenceStepIndex: idx }, { syncControls: false, refresh: false });
      refreshAll();
      suspendPitchDetection(950);
      strumChordVoicing(getCurrentChordVoicingFreqs ? getCurrentChordVoicingFreqs() : []);
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

  const modulationOrigin = getModulationOrigin ? getModulationOrigin() : null;
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
        const curOrigin = getModulationOrigin ? getModulationOrigin() : null;
        if (!curOrigin) return;
        clearAllActivePlayback();
        clearShiftOverlay(false);
        setSelectedStaffOrNeckPitch(null);
        commitStatePatch({
          mode: curOrigin.mode,
          entityId: curOrigin.entityId,
          rootQ: curOrigin.rootQ,
          anchorAbsQ: curOrigin.anchorAbsQ,
          octavePathOnly: Boolean(curOrigin.anchorAbsQ !== null),
        }, { syncControls: false, refresh: false });
        setModulationOrigin(null);
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
      setSelectedStaffOrNeckPitch(null);
      if (!(getModulationOrigin && getModulationOrigin())) {
        const curStruct = getActiveStructure(state);
        const curLoc = localizeEntity(state.lang, curStruct.entity);
        const curRootName = PITCH_CLASSES_24[((state.rootQ % 24) + 24) % 24]?.flat || "C";
        setModulationOrigin({
          mode: state.mode,
          entityId: state.entityId,
          rootQ: state.rootQ,
          anchorAbsQ: state.anchorAbsQ,
          label: `${curLoc.name} (${curRootName})`
        });
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
        setSelectedStaffOrNeckPitch(null);
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
        setSelectedStaffOrNeckPitch(null);
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

function syncCommandBarSummaries() {
  const isIqaPlaying = Boolean(getIsIqaPlaying && getIsIqaPlaying());
  const isSidebarCollapsed = Boolean(getIsSidebarCollapsed && getIsSidebarCollapsed());
  const completedStudyLessons = (getCompletedStudyLessons && getCompletedStudyLessons()) || new Set();
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
    : state.shapeMode === "OPEN_FIRST_POS"
      ? (state.lang === "en" ? "I · 1st Pos" : "I · 1ª Pos")
      : state.shapeMode === "POS_SECOND"
        ? (state.lang === "en" ? "II · 2nd Pos" : "II · 2ª Pos")
        : state.shapeMode === "POS_THIRD_BODY"
          ? (state.lang === "en" ? "III · Body" : "III · Tampo")
          : (state.lang === "en" ? "Box" : "Móvel");
  const lblShort = state.labelMode === "NOTE_NAME"
    ? (state.lang === "en" ? "Notes" : "Cifra")
    : state.labelMode === "DEGREE"
      ? (state.lang === "en" ? "Deg" : "Grau")
      : state.labelMode === "FINGER"
        ? (state.lang === "en" ? "Fingers" : "Dedos")
        : (state.lang === "en" ? "Arabic" : "Árabe");


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

  return {
    renderIqaBeatGrid,
    renderCadenceBar,
    renderModulationRadarCard,
    updateInfoPanel,
    syncCommandBarSummaries,
  };
}
