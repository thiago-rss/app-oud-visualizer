// @ts-check

/**
 * Cria view de renderização do Guia de Estudos, dossiês teóricos e estudos técnicos.
 * @param {any} deps
 */
export function createStudyGuideView(deps) {
  const {
    getState,
    getActiveStudyModuleId,
    setActiveStudyModuleId,
    getActiveStudyLessonId,
    setActiveStudyLessonId,
    getAppliedStudyLessonId,
    getCompletedStudyLessons,
    getEtudePlaybackTimers,
    setEtudePlaybackTimers,
    getStudyModules,
    getAllStudyLessons,
    getStudyLessonById,
    getNextStudyLesson,
    localizeStudyModule,
    localizeStudyLesson,
    getLocalizedStudyDossier,
    getAvailableEtudeKinds,
    generateTechnicalEtude,
    getEtudeKindFilter,
    setEtudeKindFilter,
    getEtudeRootOverrideQ,
    setEtudeRootOverrideQ,
    applyStudyLessonPreset,
    playStudyLessonExample,
    toggleStudyLessonComplete,
    saveStudyProgress,
    syncCommandBarSummaries,
    syncLiveTunerUI,
    openLiveTunerBar,
    toggleDroneAudio,
    toggleIqaPlayback,
    setActiveDeckTab,
    openGlossary,
    playPluckedNote,
    clearSequenceTimers,
    suspendPitchDetection,
    escapeHtml,
    safeT,
  } = deps;
  let activeEtudeKind = typeof deps?.getActiveEtudeKind === "function" ? deps.getActiveEtudeKind() : (deps?.activeEtudeKind ?? "ALL");
  let activeStudyLevelFilter = typeof deps?.getActiveStudyLevelFilter === "function" ? deps.getActiveStudyLevelFilter() : (deps?.activeStudyLevelFilter ?? "ALL");
  const STUDY_MODULES = typeof deps?.getStudyModules === "function" ? deps.getStudyModules() : (deps?.STUDY_MODULES || []);

  const state = new Proxy({}, {
    get(_, prop) {
      const cur = getState();
      return cur[prop];
    },
    set(_, prop, val) {
      const cur = getState();
      cur[prop] = val;
      return true;
    },
  });

  let activeStudyModuleId = getActiveStudyModuleId();
  let activeStudyLessonId = getActiveStudyLessonId();
  let appliedStudyLessonId = getAppliedStudyLessonId();
  let completedStudyLessons = getCompletedStudyLessons();
  let etudeKindFilter = getEtudeKindFilter ? getEtudeKindFilter() : "ALL";
  let etudeRootOverrideQ = getEtudeRootOverrideQ ? getEtudeRootOverrideQ() : null;

  
  let _localHighlightedSequenceStep = typeof deps?.getHighlightedSequenceStep === "function" ? deps.getHighlightedSequenceStep() : -1;
  const readHighlightedStep = () =>
    typeof deps?.getHighlightedSequenceStep === "function"
      ? deps.getHighlightedSequenceStep()
      : _localHighlightedSequenceStep;
  const writeHighlightedStep = (v) => {
    _localHighlightedSequenceStep = v;
    if (typeof deps?.setHighlightedSequenceStep === "function") {
      deps.setHighlightedSequenceStep(v);
    }
  };
  let isEtudeLoopPlaying = typeof deps?.getIsEtudeLoopPlaying === "function" ? deps.getIsEtudeLoopPlaying() : false;
  let activeEtudeSpeed = typeof deps?.getActiveEtudeSpeed === "function" ? deps.getActiveEtudeSpeed() : 0.85;

  const isPitchListening = typeof deps?.isPitchListening === "function" ? deps.isPitchListening : () => false;
  const getOudTimbreProfile = typeof deps?.getOudTimbreProfile === "function" ? deps.getOudTimbreProfile : () => "syrian";
  const toggleOudTimbreProfileWithPreview = typeof deps?.toggleOudTimbreProfileWithPreview === "function" ? deps.toggleOudTimbreProfileWithPreview : () => {};
  const commitStatePatch = typeof deps?.commitStatePatch === "function" ? deps.commitStatePatch : () => {};
  const toggleZenMode = typeof deps?.toggleZenMode === "function" ? deps.toggleZenMode : () => {};
  const refreshAll = typeof deps?.refreshAll === "function" ? deps.refreshAll : () => {};
  const syncControlsWithState = typeof deps?.syncControlsWithState === "function" ? deps.syncControlsWithState : () => {};
  const clearAllActivePlayback = typeof deps?.clearAllActivePlayback === "function" ? deps.clearAllActivePlayback : () => {};
  const setAppliedStudyLessonId = typeof deps?.setAppliedStudyLessonId === "function"
    ? deps.setAppliedStudyLessonId
    : (v) => { appliedStudyLessonId = v; };

    let isStudyDossierOpen = typeof deps?.getIsStudyDossierOpen === "function" ? Boolean(deps.getIsStudyDossierOpen()) : Boolean(deps?.isStudyDossierOpen ?? false);
  function getStudyPaneElement() {
    return /** @type {HTMLElement | null} */ (
      document.getElementById("deck-pane-study") ||
      document.querySelector('[data-deck-pane="study"]') ||
      document.getElementById("deck-pane-guide") ||
      document.querySelector('[data-deck-pane="guide"]')
    );
  }

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
  const activeTimers = getEtudePlaybackTimers() || [];
  activeTimers.forEach(id => window.clearTimeout(id));
  setEtudePlaybackTimers([]);
  const hadStep = readHighlightedStep() !== -1 || isEtudeLoopPlaying;
  isEtudeLoopPlaying = false;
  writeHighlightedStep(-1);
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

  if (getAppliedStudyLessonId() !== lesson.id) {
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
    const prevTimers = getEtudePlaybackTimers() || [];
    prevTimers.forEach(id => window.clearTimeout(id));
    const nextTimers = [];
    setEtudePlaybackTimers(nextTimers);
    let elapsedMs = 0;
    spec.steps.forEach((st, idx) => {
      const dur = Math.max(150, Math.round(st.baseDurMs / speedFactor));
      const tId = window.setTimeout(() => {
        writeHighlightedStep(idx);
        const freq = 65.41 * Math.pow(2, (st.absQ * 50 + st.centsDev) / 1200);
        const vel = st.risha === "UP" ? 0.24 : 0.34;
        playPluckedNote(freq, Math.max(0.55, dur / 320), vel);
        refreshAll();
      }, elapsedMs);
      nextTimers.push(tId);
      elapsedMs += dur;
    });

    const totalMs = elapsedMs + 180;
    suspendPitchDetection(totalMs + 350);

    const endId = window.setTimeout(() => {
      if (isEtudeLoopPlaying) {
        runCycle();
      } else {
        writeHighlightedStep(-1);
        refreshAll();
      }
    }, totalMs);
    nextTimers.push(endId);
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
    const isHi = readHighlightedStep() === idx;
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

  if (typeof deps?.getActiveStudyModuleId === "function") activeStudyModuleId = deps.getActiveStudyModuleId();
  if (typeof deps?.getActiveStudyLessonId === "function") activeStudyLessonId = deps.getActiveStudyLessonId();
  if (typeof deps?.getAppliedStudyLessonId === "function") appliedStudyLessonId = deps.getAppliedStudyLessonId();
  completedStudyLessons = getCompletedStudyLessons();
  const isIqaPlaying = typeof deps?.getIsIqaPlaying === "function" ? Boolean(deps.getIsIqaPlaying()) : false;

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
    if (currentLesson) {
      activeStudyLessonId = currentLesson.id;
      setActiveStudyLessonId(currentLesson.id);
    }
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
    if (typeof deps?.setIsStudyDossierOpen === "function") deps.setIsStudyDossierOpen(isStudyDossierOpen);
    renderStudyGuidePane();
  });

  pane.querySelectorAll(".study-level-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      const lvl = /** @type {any} */ (/** @type {HTMLElement} */ (btn).dataset.studyLevel || "ALL");
      activeStudyLevelFilter = lvl
      if (typeof deps?.setActiveStudyLevelFilter === "function") deps.setActiveStudyLevelFilter(activeStudyLevelFilter);
      const matchingMods = lvl === "ALL"
        ? STUDY_MODULES
        : STUDY_MODULES.filter(m => m.level === lvl);
      if (matchingMods.length && !matchingMods.some(m => m.id === activeStudyModuleId)) {
        const nextMod = matchingMods[0];
        activeStudyModuleId = nextMod.id;
        setActiveStudyModuleId(nextMod.id);
        const firstPending = nextMod.lessons.find(l => !completedStudyLessons.has(l.id)) || nextMod.lessons[0];
        if (firstPending) {
          activeStudyLessonId = firstPending.id;
          setActiveStudyLessonId(firstPending.id);
        }
        saveStudyProgress();
      }
      renderStudyGuidePane();
    });
  });

  pane.querySelectorAll(".study-mod-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const modId = /** @type {HTMLElement} */ (btn).dataset.studyModule;
      if (!modId) return;
      setActiveStudyModuleId(modId);
      const foundMod = STUDY_MODULES.find(m => m.id === modId);
      if (foundMod && foundMod.lessons.length) {
        const firstUnfinished = foundMod.lessons.find(l => !completedStudyLessons.has(l.id)) || foundMod.lessons[0];
        setActiveStudyLessonId(firstUnfinished.id);
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
      setActiveStudyLessonId(lesId);
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
    if (currentLesson && getAppliedStudyLessonId() !== currentLesson.id) {
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
    if (currentLesson && getAppliedStudyLessonId() !== currentLesson.id) {
      applyStudyLessonPreset(currentLesson.id, { playConfirmTone: false, scrollToStage: false });
    }
    toggleIqaPlayback();
    syncLiveTunerUI();
    renderStudyGuidePane();
  });

  pane.querySelector(".btn-study-zen")?.addEventListener("click", () => {
    if (currentLesson && getAppliedStudyLessonId() !== currentLesson.id) {
      applyStudyLessonPreset(currentLesson.id, { playConfirmTone: false, scrollToStage: false });
    }
    toggleZenMode(true);
  });

  pane.querySelector(".btn-study-open-radar")?.addEventListener("click", () => {
    if (currentLesson && getAppliedStudyLessonId() !== currentLesson.id) {
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
    activeStudyLevelFilter = "ALL"
    if (typeof deps?.setActiveStudyLevelFilter === "function") deps.setActiveStudyLevelFilter(activeStudyLevelFilter);
    setActiveStudyModuleId(STUDY_MODULES[0]?.id || "mod_foundation");
    setActiveStudyLessonId(STUDY_MODULES[0]?.lessons[0]?.id || "les_01_open_first_pos");
    setAppliedStudyLessonId(null);
    saveStudyProgress();
    syncCommandBarSummaries();
    renderStudyGuidePane();
  });
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

  return {
    getStudyPaneElement,
    buildStudyDossierHtml,
    stopTechnicalEtudePlayback,
    getEtudeKindLabel,
    playTechnicalEtudeSequence,
    buildTechnicalEtudesHtml,
    renderStudyGuidePane,
    ensureStudyGuideScaffold,
  };
}
