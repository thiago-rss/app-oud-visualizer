// @ts-check

/**
 * Converte nível RMS de gate em porcentagem visual do medidor VU.
 * @param {number} gateRms
 * @returns {number}
 */
export function gateRmsToVuPct(gateRms) {
  const db = 20 * Math.log10(Math.max(1e-5, gateRms));
  return Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
}

/**
 * Cria controlador de interface e leitura do afinador ao vivo.
 * @param {any} deps
 */
export function createTunerController(deps) {
  let clipHoldTimer = 0;

  /**
   * @param {string} code
   * @returns {string}
   */
  function getTunerErrorText(code) {
    const isEn = deps.getState().lang === "en";
    const errDetail = deps.getTunerErrorDetail ? deps.getTunerErrorDetail() : "";
    if (code === "PERMISSION_DENIED") {
      return isEn
        ? "Audio input permission denied. Allow microphone access in browser settings and try again."
        : "Permissão de entrada de áudio negada. Libere o acesso nas configurações do navegador e tente novamente.";
    }
    if (code === "NO_MICROPHONE") {
      return isEn
        ? "No microphone or USB audio interface detected on this device."
        : "Nenhum microfone ou interface de áudio USB foi encontrado neste dispositivo.";
    }
    if (code === "INSECURE_CONTEXT") {
      return isEn
        ? "Audio capture requires HTTPS (GitHub Pages) or localhost."
        : "A captura de áudio exige conexão segura HTTPS (GitHub Pages) ou localhost.";
    }
    if (code === "UNSUPPORTED") {
      return isEn
        ? "This browser does not support Web Audio input capture."
        : "Este navegador não oferece suporte à captura de áudio pela Web Audio API.";
    }
    const suffix = errDetail ? ` (${errDetail})` : "";
    return (
      (isEn
        ? "Could not start the audio input. Check your USB interface connection or browser mic permissions."
        : "Não foi possível iniciar a entrada de áudio. Verifique a conexão da interface USB ou a permissão nos Ajustes.") +
      suffix
    );
  }

  function renderAudioInputDeviceOptions() {
    const sel = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-tuner-device"));
    if (!sel) return;

    const isEn = deps.getState().lang === "en";
    const currentId = deps.getPitchInputDeviceId();
    const devices = deps.getAvailableInputDevices() || [];
    sel.innerHTML = "";

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = isEn ? "System Default Input" : "Entrada Padrão do Sistema";
    sel.appendChild(defaultOpt);

    let foundSaved = currentId === "";
    devices.forEach((/** @type {any} */ dev, /** @type {number} */ idx) => {
      if (!dev.deviceId) return;
      const opt = document.createElement("option");
      opt.value = dev.deviceId;
      opt.textContent = dev.label || (isEn ? `Audio Input ${idx + 1}` : `Entrada de Áudio ${idx + 1}`);
      sel.appendChild(opt);
      if (dev.deviceId === currentId) {
        foundSaved = true;
      }
    });

    sel.value = foundSaved ? currentId : "";
  }

  function refreshAudioInputDevices() {
    deps
      .listAudioInputDevices()
      .then((/** @type {any[]} */ devs) => {
        deps.setAvailableInputDevices(devs);
        renderAudioInputDeviceOptions();
      })
      .catch(() => {
        // Ignora em navegadores restritos
      });
  }

  /**
   * @param {any} level
   */
  function renderLiveInputLevel(level) {
    const fillEl = document.getElementById("tuner-vu-fill");
    const gateMarkEl = document.getElementById("tuner-vu-gate-mark");
    const dbEl = document.getElementById("tuner-vu-db");
    const clipEl = document.getElementById("tuner-clip-badge");
    if (!fillEl || !dbEl || !clipEl) return;

    if (gateMarkEl) {
      const pct = level ? level.gatePct : gateRmsToVuPct(deps.getPitchNoiseGate());
      gateMarkEl.style.left = `${pct.toFixed(1)}%`;
    }

    if (!level || !deps.isPitchListening()) {
      fillEl.style.width = "0%";
      dbEl.textContent = "-∞ dB";
      window.clearTimeout(clipHoldTimer);
      clipEl.classList.remove("is-clipping");
      clipEl.setAttribute("aria-hidden", "true");
      return;
    }

    fillEl.style.width = `${level.pct.toFixed(1)}%`;
    dbEl.textContent = level.db <= -58 ? "-∞ dB" : `${Math.round(level.db)} dB`;

    if (level.clipping) {
      clipEl.classList.add("is-clipping");
      clipEl.setAttribute("aria-hidden", "false");
      window.clearTimeout(clipHoldTimer);
      clipHoldTimer = window.setTimeout(() => {
        clipEl.classList.remove("is-clipping");
        clipEl.setAttribute("aria-hidden", "true");
      }, 650);
    }
  }

  function syncMobileMicButton() {
    const btnMobMic = document.getElementById("btn-mob-mic");
    if (!btnMobMic) return;
    const listeningNow = deps.isPitchListening();
    const isLine = deps.getPitchInputProfile() === "LINE";
    const isEn = deps.getState().lang === "en";

    btnMobMic.classList.toggle("active-toggle", listeningNow);
    btnMobMic.setAttribute("aria-pressed", listeningNow ? "true" : "false");

    if (isLine) {
      const lineWord = isEn ? "Line" : "Linha";
      btnMobMic.textContent = listeningNow ? `🔌 ${lineWord}: ON` : `🔌 ${lineWord}: OFF`;
    } else {
      btnMobMic.textContent = listeningNow ? "🎙 Mic: ON" : "🎙 Mic: OFF";
    }
  }

  function renderTunerCoursesList() {
    const container = document.getElementById("tuner-courses-list");
    if (!container) return;
    container.innerHTML = "";

    const st = deps.getState();
    const isEn = st.lang === "en";
    const tunings = deps.getTunings();
    const tuning = tunings.find((/** @type {any} */ x) => x.id === st.tuningId) || tunings[0];
    if (!tuning) return;

    const lockedCourse = deps.getLockedTunerCourse();
    const latestDet = deps.getLatestPitchDetection ? deps.getLatestPitchDetection() : null;

    const autoBtn = document.createElement("button");
    autoBtn.type = "button";
    autoBtn.className = `tuner-course-btn ${lockedCourse === null ? "is-locked" : ""}`;
    autoBtn.dataset.courseLock = "AUTO";
    autoBtn.textContent = isEn ? "Auto" : "Auto";
    autoBtn.title = isEn ? "Automatically detect the nearest open course" : "Detectar automaticamente a ordem mais próxima";
    container.appendChild(autoBtn);

    const orderedCourses = [...tuning.courses].sort((a, b) => b.course - a.course);
    orderedCourses.forEach((cObj) => {
      const isLocked = lockedCourse === cObj.course;
      const isDetected = latestDet?.mode === "TUNER" && latestDet.courseNumber === cObj.course;
      const isInTune = isDetected && latestDet?.status === "IN_TUNE";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = ["tuner-course-btn", isLocked ? "is-locked" : "", isDetected ? "is-detected" : "", isInTune ? "is-in-tune" : ""]
        .filter(Boolean)
        .join(" ");
      btn.dataset.courseLock = String(cObj.course);
      btn.textContent = cObj.label;
      btn.title = isEn
        ? `Lock ${cObj.label} (${cObj.freq_hz.toFixed(1)} Hz) and hear reference`
        : `Travar ${cObj.label} (${cObj.freq_hz.toFixed(1)} Hz) e ouvir referência`;
      container.appendChild(btn);
    });
  }

  /**
   * @param {any} det
   */
  function renderLiveTunerReadout(det) {
    const bar = document.getElementById("live-tuner-bar");
    const noteMain = document.getElementById("tuner-note-main");
    const noteSub = document.getElementById("tuner-note-sub");
    const dirHint = document.getElementById("tuner-direction-hint");
    const centsEl = document.getElementById("tuner-cents-readout");
    const hzEl = document.getElementById("tuner-hz-readout");
    const needle = document.getElementById("tuner-meter-needle");
    if (!bar || !noteMain || !noteSub || !dirHint || !centsEl || !hzEl || !needle) return;

    const st = deps.getState();
    const isEn = st.lang === "en";
    const listeningNow = deps.isPitchListening();
    const mode = deps.getPitchDetectionMode();
    const isLine = deps.getPitchInputProfile() === "LINE";

    if (!det || !det.active) {
      bar.removeAttribute("data-tuner-status");
      noteMain.textContent = "—";
      centsEl.textContent = "0¢";
      hzEl.textContent = "— Hz";
      needle.style.left = "50%";
      needle.classList.remove("is-active", "is-holding");

      if (!listeningNow) {
        noteSub.textContent = isLine
          ? (isEn ? "Line input paused" : "Entrada de linha pausada")
          : (isEn ? "Microphone paused" : "Microfone pausado");
        dirHint.textContent = isLine
          ? (isEn ? "Click 'Start Line' to listen" : "Clique em 'Ligar Linha' para escutar")
          : (isEn ? "Click 'Start Mic' to listen" : "Clique em 'Ligar Microfone' para escutar");
      } else if (mode === "TUNER") {
        const locked = deps.getLockedTunerCourse();
        const tunings = deps.getTunings();
        const tuning = tunings.find((/** @type {any} */ x) => x.id === st.tuningId) || tunings[0];
        const lockedObj = locked !== null && tuning ? tuning.courses.find((/** @type {any} */ c) => c.course === locked) : null;
        noteSub.textContent = lockedObj
          ? (isEn ? `Target: ${lockedObj.label} (${lockedObj.freq_hz.toFixed(1)} Hz)` : `Alvo: ${lockedObj.label} (${lockedObj.freq_hz.toFixed(1)} Hz)`)
          : (isEn ? "Pluck any open course" : "Toque qualquer corda solta");
        dirHint.textContent = isEn ? "Listening..." : "Aguardando sinal...";
      } else {
        noteSub.textContent = isEn ? "Play a note on your Oud" : "Toque uma nota no Oud";
        dirHint.textContent = isLine
          ? (isEn ? "Listening via Interface (24-TET)..." : "Escutando via Interface (24-TET)...")
          : (isEn ? "Listening in 24-TET..." : "Escutando em 24-TET...");
      }

      if (mode === "TUNER") {
        document.querySelectorAll(".tuner-course-btn").forEach((el) => {
          el.classList.remove("is-detected", "is-in-tune");
        });
      }
      return;
    }

    let statusAttr = "off";
    if (det.status === "IN_TUNE") statusAttr = "in-tune";
    else if (det.status === "CLOSE") statusAttr = "close";
    else if (det.status === "OUT_OF_SCALE") statusAttr = "out-of-scale";
    bar.setAttribute("data-tuner-status", statusAttr);

    const roundedCents = Math.round(det.centsOff);
    const signedCents = `${roundedCents > 0 ? "+" : ""}${roundedCents}¢`;
    const needlePct = 50 + Math.max(-50, Math.min(50, det.meterCents));

    noteMain.textContent = `${det.noteName}`;
    centsEl.textContent = signedCents;
    hzEl.textContent = `${det.freqHz.toFixed(1)} Hz`;
    needle.style.left = `${needlePct.toFixed(1)}%`;
    needle.classList.add("is-active");
    needle.classList.toggle("is-holding", det.isHolding);

    if (det.mode === "TUNER") {
      noteSub.textContent = `${det.courseLabel} • ${det.arabicName} (${det.targetFreqHz.toFixed(1)} Hz)`;
    } else {
      const degPart = det.degree ? ` • ${isEn ? "Deg" : "Grau"} ${det.degree}` : "";
      const tradPart = det.traditionalCentsDev !== 0
        ? ` (${det.traditionalCentsDev > 0 ? "+" : ""}${det.traditionalCentsDev}¢ ${isEn ? "trad." : "trad."})`
        : "";
      noteSub.textContent = `${det.noteName}${det.octave} • ${det.arabicName}${degPart}${tradPart}`;
    }

    const isVert = st.orientation === "VERTICAL";
    if (det.mode === "TUNER") {
      if (det.direction === "OK") {
        dirHint.textContent = isEn ? "✓ Course in tune" : "✓ Ordem afinada";
      } else if (det.direction === "FLAT") {
        dirHint.textContent = isEn ? "↑ Tune up (tighten peg)" : "↑ Subir afinação (apertar cravelha)";
      } else {
        dirHint.textContent = isEn ? "↓ Tune down (loosen peg)" : "↓ Descer afinação (afrouxar cravelha)";
      }
    } else if (!det.inScale) {
      dirHint.textContent = isEn
        ? `Outside active mode • Nearest ${det.noteName}`
        : `Fora do modo ativo • Mais próxima: ${det.noteName}`;
    } else if (det.direction === "OK") {
      dirHint.textContent = isEn ? "✓ In tune" : "✓ Afinado";
    } else if (det.direction === "FLAT") {
      if (isVert) {
        dirHint.textContent = isEn ? "↓ Move finger down (sharper)" : "↓ Descer dedo (mais agudo)";
      } else {
        dirHint.textContent = st.leftHanded
          ? (isEn ? "← Move finger toward body (sharper)" : "← Avançar dedo ao tampo (mais agudo)")
          : (isEn ? "Move finger forward → (sharper)" : "Avançar dedo → (mais agudo)");
      }
    } else {
      if (isVert) {
        dirHint.textContent = isEn ? "↑ Move finger up (flatter)" : "↑ Subir dedo à pestana (mais grave)";
      } else {
        dirHint.textContent = st.leftHanded
          ? (isEn ? "Move finger to nut → (flatter)" : "Recuar dedo à pestana → (mais grave)")
          : (isEn ? "← Move finger back (flatter)" : "← Recuar dedo (mais grave)");
      }
    }

    if (det.mode === "TUNER") {
      document.querySelectorAll(".tuner-course-btn").forEach((el) => {
        const btn = /** @type {HTMLElement} */ (el);
        const isMatch = btn.dataset.courseLock === String(det.courseNumber);
        btn.classList.toggle("is-detected", isMatch);
        btn.classList.toggle("is-in-tune", isMatch && det.status === "IN_TUNE");
      });
    }
  }

  function syncLiveTunerUI() {
    const st = deps.getState();
    const isEn = st.lang === "en";
    const listeningNow = deps.isPitchListening();
    const mode = deps.getPitchDetectionMode();
    const profile = deps.getPitchInputProfile();
    const channel = deps.getPitchInputChannel();
    const isLine = profile === "LINE";
    const errCode = deps.getTunerErrorCode ? deps.getTunerErrorCode() : null;
    const isBarOpen = deps.isTunerBarOpen ? deps.isTunerBarOpen() : false;
    const isIqaPlaying = deps.isIqaPlaying ? deps.isIqaPlaying() : false;
    const latestDet = deps.getLatestPitchDetection ? deps.getLatestPitchDetection() : null;

    const bar = document.getElementById("live-tuner-bar");
    if (bar) {
      bar.style.display = isBarOpen ? "flex" : "none";
    }

    const micDot = document.getElementById("menu-mic-dot");
    if (micDot) {
      micDot.style.display = listeningNow ? "block" : "none";
    }

    syncMobileMicButton();

    const btnMenuTuner = document.getElementById("btn-open-live-tuner");
    if (btnMenuTuner) {
      btnMenuTuner.classList.toggle("active-toggle", listeningNow || isBarOpen);
      btnMenuTuner.textContent = listeningNow
        ? (isLine
          ? (isEn ? "🔌 Line Input: ON" : "🔌 Escuta Linha: ATIVA")
          : (isEn ? "🎙 Live Tuner: ON" : "🎙 Escuta 24-TET: ATIVA"))
        : (isEn ? "🎙 24-TET Listener & Tuner" : "🎙 Escuta 24-TET & Afinador");
    }

    const btnPopoverTuner = document.getElementById("btn-popover-open-tuner");
    if (btnPopoverTuner) {
      btnPopoverTuner.textContent = listeningNow && mode === "TUNER"
        ? (isEn ? "🎙 Tuner Active" : "🎙 Afinador Ativo")
        : (isEn ? "🎙 Tune 6 Courses" : "🎙 Afinar 6 Ordens");
    }

    const lblPopoverTuner = document.querySelector('[data-i18n="lblPopoverTuner"]');
    if (lblPopoverTuner) {
      lblPopoverTuner.textContent = isEn ? "Tuner & Live Pitch" : "Afinador & Escuta";
    }

    const statusPill = document.getElementById("tuner-status-pill");
    if (statusPill) {
      statusPill.classList.toggle("is-listening", listeningNow);
      statusPill.classList.toggle("is-error", Boolean(errCode));
      if (errCode) {
        statusPill.textContent = isEn ? "● Input unavailable" : "● Entrada indisponível";
      } else if (listeningNow) {
        statusPill.textContent = isLine
          ? (isEn ? `● Listening (Line • ${channel})` : `● Escutando (Linha • ${channel})`)
          : (isEn ? "● Listening (Mic ON)" : "● Escutando (Mic ON)");
      } else {
        statusPill.textContent = isLine
          ? (isEn ? "● Line paused" : "● Linha pausada")
          : (isEn ? "● Mic paused" : "● Microfone pausado");
      }
    }

    const btnMicToggle = document.getElementById("btn-tuner-mic-toggle");
    if (btnMicToggle) {
      btnMicToggle.className = listeningNow ? "danger-ghost compact-btn" : "primary compact-btn";
      if (listeningNow) {
        btnMicToggle.textContent = isLine
          ? (isEn ? "⏹ Stop Line" : "⏹ Pausar Linha")
          : (isEn ? "⏹ Stop Mic" : "⏹ Pausar Microfone");
      } else {
        btnMicToggle.textContent = isLine
          ? (isEn ? "🔌 Start Line" : "🔌 Ligar Linha")
          : (isEn ? "🎙 Start Mic" : "🎙 Ligar Microfone");
      }
    }

    document.querySelectorAll(".tuner-mode-btn").forEach((el) => {
      const btn = /** @type {HTMLElement} */ (el);
      const btnMode = btn.dataset.tunerMode;
      btn.classList.toggle("selected", btnMode === mode);
      if (btnMode === "MAQAM_24TET") {
        btn.textContent = isEn ? "🎯 Active Maqam" : "🎯 Maqam 24-TET";
      } else if (btnMode === "CHROMATIC_24TET") {
        btn.textContent = isEn ? "📏 Pure 24-TET" : "📏 24-TET Puro";
      } else if (btnMode === "TUNER") {
        btn.textContent = isEn ? "🪕 6-Course Tuner" : "🪕 Afinador 6 Ordens";
      }
    });

    document.querySelectorAll(".tuner-profile-btn").forEach((el) => {
      const btn = /** @type {HTMLElement} */ (el);
      const p = btn.dataset.inputProfile;
      btn.classList.toggle("selected", p === profile);
      if (p === "MIC") {
        btn.textContent = "🎙 Mic";
      } else if (p === "LINE") {
        btn.textContent = isEn ? "🔌 Line (DI)" : "🔌 Linha (DI)";
      }
    });

    document.querySelectorAll(".tuner-channel-btn").forEach((el) => {
      const btn = /** @type {HTMLElement} */ (el);
      btn.classList.toggle("selected", btn.dataset.inputChannel === channel);
    });

    const gateSel = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-tuner-gate"));
    if (gateSel) {
      const curGate = deps.getPitchNoiseGate();
      const opts = gateSel.options;
      if (opts.length >= 3) {
        opts[0].textContent = isEn ? "Sens: High (Low Line)" : "Sens: Alta (Linha baixa)";
        opts[1].textContent = isEn ? "Sens: Medium (Default)" : "Sens: Média (Padrão)";
        opts[2].textContent = isEn ? "Sens: Low (Noisy Room)" : "Sens: Baixa (Ambiente)";
      }
      const closest = curGate <= 0.006 ? "0.004" : (curGate >= 0.013 ? "0.018" : "0.008");
      gateSel.value = closest;
    }

    const gateMarkEl = document.getElementById("tuner-vu-gate-mark");
    if (gateMarkEl) {
      gateMarkEl.style.left = `${gateRmsToVuPct(deps.getPitchNoiseGate()).toFixed(1)}%`;
    }

    renderAudioInputDeviceOptions();

    const coursesStrip = document.getElementById("tuner-courses-strip");
    if (coursesStrip) {
      coursesStrip.style.display = mode === "TUNER" ? "flex" : "none";
    }
    if (mode === "TUNER") {
      renderTunerCoursesList();
    }

    const btnRefTone = document.getElementById("btn-tuner-ref-tone");
    if (btnRefTone) {
      btnRefTone.textContent = isEn ? "🔊 Reference Tone" : "🔊 Ouvir Referência";
    }

    const feedbackEl = document.getElementById("tuner-feedback-msg");
    if (feedbackEl) {
      feedbackEl.classList.toggle("is-error", Boolean(errCode));
      if (errCode) {
        feedbackEl.textContent = `⚠ ${getTunerErrorText(errCode)}`;
      } else if (listeningNow && isLine) {
        feedbackEl.textContent = isEn
          ? "🔌 Line (Interface) mode: piezo sidechain filter active and continuous tracking over Drone & Iqa'."
          : "🔌 Modo Linha (Interface): filtro anti-piezo ativo e leitura contínua sobre Drone e Iqa' (use fones na interface).";
      } else if (listeningNow && (st.droneActive || isIqaPlaying)) {
        feedbackEl.textContent = isEn
          ? "🎧 Tip: use headphones (or switch to Line DI with an interface) when combining Drone/Iqa' with pitch detection."
          : "🎧 Dica: use fones de ouvido (ou mude para Linha DI com interface) ao combinar Drone/Iqa' com a escuta.";
      } else if (listeningNow && mode === "MAQAM_24TET") {
        feedbackEl.textContent = isEn
          ? "Target follows the active Maqam/Jins intervals including traditional microtonal deviations (cents_dev)."
          : "Alvo calibrado pelo Maqam/Jins ativo, incluindo desvios microtonais tradicionais (cents_dev).";
      } else {
        feedbackEl.textContent = "";
      }
    }

    if (!listeningNow) {
      renderLiveInputLevel(null);
    }
    renderLiveTunerReadout(latestDet);
  }

  return {
    getTunerErrorText,
    renderAudioInputDeviceOptions,
    refreshAudioInputDevices,
    renderLiveInputLevel,
    syncMobileMicButton,
    renderTunerCoursesList,
    renderLiveTunerReadout,
    syncLiveTunerUI,
  };
}
