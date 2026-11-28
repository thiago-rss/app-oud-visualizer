// @ts-check
/**
 * studyCoachView.js — Tutor Ativo de Prática para o Guia de Estudos (v3.18.0)
 *
 * Funcionalidades:
 * - 3 Estágios de Domínio por lição (Iniciado · Em Prática · Dominado)
 * - Caderno de Anotações Pessoais por Lição (salvo em localStorage)
 * - Rotina de Aquecimento Diário (10 min: 3m Afinação/Escala · 4m Posição/Técnica · 3m Sayr/Improviso)
 * - Checkpoints Práticos ao Vivo via detector YIN 24-TET (Mic / Linha DI) com precisão média em cents
 * - Modo Call & Response em 3 velocidades (0.65x · 0.85x · 1.0x) com avaliação YIN ao vivo
 * - Comparador Auditivo A/B (Intervalos / Microtons) calibrado pelo Diapasão A4 global
 */

import { showToast } from "./toastView.js";

export const MASTERY_STORAGE_KEY = "oud_study_mastery_v1";
export const NOTES_STORAGE_KEY = "oud_study_lesson_notes_v1";
export const PRACTICE_STATS_STORAGE_KEY = "oud_study_practice_stats_v1";

export const MASTERY_STAGES = Object.freeze({
  STARTED: "STARTED",
  PRACTICING: "PRACTICING",
  MASTERED: "MASTERED"
});

const CALL_RESP_SPEEDS = [0.65, 0.85, 1.0];

function loadJsonMap(key) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return {};
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveJsonMap(key, obj) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(obj));
  } catch {
    // quota / modo privado
  }
}

/**
 * @param {any} deps
 */
export function createStudyCoachController(deps) {
  let masteryMap = loadJsonMap(MASTERY_STORAGE_KEY);
  let notesMap = loadJsonMap(NOTES_STORAGE_KEY);
  let statsMap = loadJsonMap(PRACTICE_STATS_STORAGE_KEY);

  /** @type {string | null} */
  let checkpointLessonId = null;
  let checkpointStep = 0;
  let lastCheckpointHitTs = 0;
  /** @type {number[]} */
  let checkpointErrors = [];

  /** @type {{ active: boolean, remainingSec: number, phaseIdx: number, timerId: number | null }} */
  let warmup = { active: false, remainingSec: 600, phaseIdx: 0, timerId: null };

  /**
   * Estado do Modo Call & Response (3 velocidades + validação YIN opcional)
   * @type {{
   *   active: boolean,
   *   speed: number,
   *   phase: "IDLE" | "CALL" | "RESPONSE",
   *   motif: { pcQ: number, absQ: number, label: string, freqHz: number }[],
   *   activeCallIdx: number,
   *   matchedIndices: Set<number>,
   *   responseErrors: number[],
   *   lastHitTs: number,
   *   lastHitPcQ: number | null,
   *   phaseStartTs: number,
   *   phaseDurationMs: number,
   *   lastSummary: { hits: number, total: number, avgCents: number | null } | null,
   *   timers: number[],
   *   progressIntervalId: number | null
   * }}
   */
  let callResp = {
    active: false,
    speed: 0.85,
    phase: "IDLE",
    motif: [],
    activeCallIdx: -1,
    matchedIndices: new Set(),
    responseErrors: [],
    lastHitTs: 0,
    lastHitPcQ: null,
    phaseStartTs: 0,
    phaseDurationMs: 0,
    lastSummary: null,
    timers: [],
    progressIntervalId: null
  };

  const isEn = () => deps.getState?.()?.lang === "en";

  /**
   * @param {string} lessonId
   */
  function getMastery(lessonId) {
    if (!lessonId) return MASTERY_STAGES.STARTED;
    return masteryMap[lessonId] || MASTERY_STAGES.STARTED;
  }

  /**
   * @param {string} lessonId
   * @param {"STARTED"|"PRACTICING"|"MASTERED"} stage
   */
  function setMastery(lessonId, stage) {
    if (!lessonId) return;
    masteryMap[lessonId] = stage;
    saveJsonMap(MASTERY_STORAGE_KEY, masteryMap);
    renderCoachStrip();
    showToast(
      isEn()
        ? `Mastery updated: ${stage}`
        : `Domínio atualizado: ${stage === "MASTERED" ? "Dominado" : stage === "PRACTICING" ? "Em Prática" : "Iniciado"}`,
      { type: "success", icon: "✦", durationMs: 1600 }
    );
  }

  /**
   * Registra estatística de prática (timestamp + precisão média em cents) por lição.
   * @param {string} lessonId
   * @param {number | null} avgCents
   */
  function recordPracticeSession(lessonId, avgCents) {
    if (!lessonId) return;
    const prev = statsMap[lessonId] || { sessions: 0, lastPracticedAt: 0, bestAvgCents: null, lastAvgCents: null };
    const cleanAvg = typeof avgCents === "number" && Number.isFinite(avgCents) ? Number(avgCents.toFixed(1)) : null;
    const nextBest = cleanAvg === null
      ? prev.bestAvgCents
      : (prev.bestAvgCents === null ? cleanAvg : Math.min(prev.bestAvgCents, cleanAvg));
    statsMap[lessonId] = {
      sessions: (prev.sessions || 0) + 1,
      lastPracticedAt: Date.now(),
      lastAvgCents: cleanAvg,
      bestAvgCents: nextBest
    };
    saveJsonMap(PRACTICE_STATS_STORAGE_KEY, statsMap);
  }

  /**
   * @param {string} lessonId
   */
  function getLessonNote(lessonId) {
    if (!lessonId) return "";
    return String(notesMap[lessonId] || "");
  }

  /**
   * @param {string} lessonId
   * @param {string} text
   */
  function setLessonNote(lessonId, text) {
    if (!lessonId) return;
    notesMap[lessonId] = String(text || "").slice(0, 400);
    saveJsonMap(NOTES_STORAGE_KEY, notesMap);
  }

  function resolveCurrentLesson() {
    const lessons = typeof deps.getAllStudyLessons === "function" ? deps.getAllStudyLessons() : [];
    const activeId = typeof deps.getActiveLessonId === "function" ? deps.getActiveLessonId() : null;
    if (activeId) {
      const found = lessons.find((l) => l.id === activeId);
      if (found) return found;
    }
    return lessons[0] || { id: "les_01", titlePt: "Fundação", titleEn: "Foundation" };
  }

  function getA4Scale() {
    const a4 = Number(deps.getA4Hz?.());
    return Number.isFinite(a4) && a4 >= 400 && a4 <= 460 ? a4 / 440 : 1;
  }

  function getRootFreqHz() {
    const st = deps.getState?.() || {};
    const rq = ((Number(st.rootQ) || 0) % 24 + 24) % 24;
    return 130.81278265 * getA4Scale() * Math.pow(2, rq / 24);
  }

  /**
   * @param {"A" | "B"} kind
   */
  function playContrastAB(kind) {
    const rootHz = getRootFreqHz();
    const qDelta = kind === "A" ? 6 : 7;
    deps.onSuspendPitch?.(1150);
    deps.playFreq?.(rootHz, 0.55);
    window.setTimeout(() => {
      deps.playFreq?.(rootHz * Math.pow(2, qDelta / 24), 0.85);
    }, 340);
    showToast(
      isEn()
        ? (kind === "A" ? "Playing A: Minor / Reference (300¢)" : "Playing B: Neutral Quarter-Tone (350¢)")
        : (kind === "A" ? "Tocando A: Terça Menor / Referência (300¢)" : "Tocando B: Terça Neutra 24-TET (350¢)"),
      { type: "info", icon: kind === "A" ? "A" : "B", durationMs: 1600 }
    );
  }

  /**
   * Monta um motivo de 4 notas derivado da estrutura modal ativa (ou fallback 24-TET).
   */
  function buildMotifForActiveState() {
    if (typeof deps.getActiveMotif === "function") {
      const custom = deps.getActiveMotif();
      if (Array.isArray(custom) && custom.length >= 2) {
        return custom.slice(0, 5);
      }
    }
    const st = deps.getState?.() || {};
    const rq = ((Number(st.rootQ) || 0) % 24 + 24) % 24;
    const pcs = typeof deps.getPitchClasses24 === "function" ? deps.getPitchClasses24() : [];
    const scale = getA4Scale();
    const steps = [0, 4, 7, 10];
    return steps.map((q) => {
      const pcQ = (rq + q) % 24;
      const absQ = 24 + rq + q;
      const pc = pcs[pcQ] || { flat: `Q${pcQ}` };
      return {
        pcQ,
        absQ,
        label: pc.flat || `Q${pcQ}`,
        freqHz: 65.406391325 * scale * Math.pow(2, absQ / 24)
      };
    });
  }

  function clearCallResponseTimers() {
    callResp.timers.forEach((id) => window.clearTimeout(id));
    callResp.timers = [];
    if (callResp.progressIntervalId !== null) {
      window.clearInterval(callResp.progressIntervalId);
      callResp.progressIntervalId = null;
    }
  }

  function updateCallRespProgressDom() {
    if (typeof document === "undefined" || !callResp.active) return;
    const barFill = document.getElementById("sa-cr-progress-fill");
    const timerLbl = document.getElementById("sa-cr-timer");
    if (!barFill && !timerLbl) return;
    const elapsed = Math.max(0, performance.now() - callResp.phaseStartTs);
    const dur = Math.max(1, callResp.phaseDurationMs);
    const pct = Math.min(100, (elapsed / dur) * 100);
    if (barFill) barFill.style.width = `${pct.toFixed(1)}%`;
    if (timerLbl) {
      const remSec = Math.max(0, (dur - elapsed) / 1000);
      timerLbl.textContent = `${remSec.toFixed(1)}s`;
    }
  }

  function runCallResponseCycle() {
    if (!callResp.active) return;
    clearCallResponseTimers();

    callResp.motif = buildMotifForActiveState();
    callResp.phase = "CALL";
    callResp.activeCallIdx = -1;
    callResp.matchedIndices = new Set();
    callResp.responseErrors = [];
    callResp.lastHitTs = 0;
    callResp.lastHitPcQ = null;

    const sp = Math.max(0.5, Math.min(1.25, callResp.speed || 0.85));
    const stepMs = Math.round(460 / sp);
    const noteDurSec = Math.max(0.32, Math.min(0.85, (stepMs * 0.9) / 1000));
    const callTotalMs = callResp.motif.length * stepMs + 220;
    const respTotalMs = Math.max(2200, Math.round(callTotalMs * 1.25));

    callResp.phaseStartTs = performance.now();
    callResp.phaseDurationMs = callTotalMs;

    // Suspende detecção YIN durante o CALL no modo microfone para evitar eco
    deps.onSuspendPitch?.(callTotalMs + 140);
    renderCoachStrip();

    callResp.motif.forEach((note, idx) => {
      const tId = window.setTimeout(() => {
        if (!callResp.active) return;
        callResp.activeCallIdx = idx;
        deps.playFreq?.(note.freqHz, noteDurSec);
        renderCoachStrip();
      }, idx * stepMs + 60);
      callResp.timers.push(tId);
    });

    // Inicia fase RESPONSE ("Sua vez no Oud")
    const toRespId = window.setTimeout(() => {
      if (!callResp.active) return;
      callResp.phase = "RESPONSE";
      callResp.activeCallIdx = -1;
      callResp.phaseStartTs = performance.now();
      callResp.phaseDurationMs = respTotalMs;
      renderCoachStrip();

      callResp.progressIntervalId = window.setInterval(updateCallRespProgressDom, 80);

      const finishId = window.setTimeout(() => {
        if (!callResp.active) return;
        const listeningNow = Boolean(deps.isPitchListening?.());
        if (listeningNow) {
          const hits = callResp.matchedIndices.size;
          const total = callResp.motif.length;
          const avgCents = callResp.responseErrors.length
            ? callResp.responseErrors.reduce((a, b) => a + b, 0) / callResp.responseErrors.length
            : null;
          callResp.lastSummary = { hits, total, avgCents };
          const curLes = resolveCurrentLesson();
          if (hits > 0 && curLes?.id) {
            recordPracticeSession(curLes.id, avgCents);
          }
        }
        runCallResponseCycle();
      }, respTotalMs);
      callResp.timers.push(finishId);
    }, callTotalMs);

    callResp.timers.push(toRespId);
    callResp.progressIntervalId = window.setInterval(updateCallRespProgressDom, 80);
  }

  /**
   * @param {number} [speed]
   */
  function startCallResponse(speed) {
    if (typeof speed === "number" && Number.isFinite(speed)) {
      callResp.speed = speed;
    }
    callResp.active = true;
    callResp.lastSummary = null;
    runCallResponseCycle();
    showToast(
      isEn()
        ? `Call & Response started (${callResp.speed}×) — listen, then reply on your Oud`
        : `Call & Response iniciado (${callResp.speed}×) — ouça e responda no Oud`,
      { type: "info", icon: "🔁", durationMs: 2000 }
    );
  }

  function stopCallResponse(silent = false) {
    if (!callResp.active && callResp.phase === "IDLE") return;
    clearCallResponseTimers();
    callResp.active = false;
    callResp.phase = "IDLE";
    callResp.activeCallIdx = -1;
    renderCoachStrip();
    if (!silent) {
      showToast(
        isEn() ? "Call & Response stopped" : "Call & Response pausado",
        { type: "info", icon: "⏹", durationMs: 1400 }
      );
    }
  }

  /**
   * @param {string} lessonId
   */
  function toggleLiveCheckpoint(lessonId) {
    if (checkpointLessonId === lessonId) {
      checkpointLessonId = null;
      checkpointStep = 0;
      checkpointErrors = [];
      renderCoachStrip();
      return;
    }
    checkpointLessonId = lessonId;
    checkpointStep = 0;
    checkpointErrors = [];
    renderCoachStrip();
    showToast(
      isEn()
        ? "Live YIN Checkpoints armed — play on your Oud!"
        : "Checkpoints ao vivo (YIN) armados — toque no Oud!",
      { type: "success", icon: "🎯", durationMs: 2000 }
    );
  }

  /**
   * @param {any} detection
   */
  function onLiveDetection(detection) {
    if (!detection || !detection.active || detection.isHolding) return;
    const absOff = Math.abs(Number(detection.centsOff) || 0);
    const now = Date.now();

    // 1) Validação ao vivo na fase RESPONSE do Call & Response
    if (callResp.active && callResp.phase === "RESPONSE" && callResp.motif.length) {
      if (absOff <= 22 && detection.inScale !== false) {
        const detPcQ = typeof detection.playedPitchClassQ === "number"
          ? detection.playedPitchClassQ
          : detection.pitchClassQ;
        const matchIdx = callResp.motif.findIndex(
          (n, idx) => !callResp.matchedIndices.has(idx) && n.pcQ === detPcQ
        );
        if (matchIdx !== -1 && (now - callResp.lastHitTs >= 240 || callResp.lastHitPcQ !== detPcQ)) {
          callResp.matchedIndices.add(matchIdx);
          callResp.responseErrors.push(absOff);
          callResp.lastHitTs = now;
          callResp.lastHitPcQ = detPcQ;
          renderCoachStrip();
        }
      }
    }

    // 2) Validação dos Checkpoints YIN da lição
    if (!checkpointLessonId) return;
    if (detection.status !== "IN_TUNE" && detection.status !== "CLOSE") return;
    if (absOff > 20) return;

    if (now - lastCheckpointHitTs < 650) return;
    lastCheckpointHitTs = now;

    if (checkpointStep < 3) {
      checkpointStep += 1;
      checkpointErrors.push(absOff);
      if (checkpointStep >= 3) {
        const avg = checkpointErrors.reduce((a, b) => a + b, 0) / checkpointErrors.length;
        recordPracticeSession(checkpointLessonId, avg);
        if (masteryMap[checkpointLessonId] !== MASTERY_STAGES.MASTERED) {
          masteryMap[checkpointLessonId] = MASTERY_STAGES.PRACTICING;
          saveJsonMap(MASTERY_STORAGE_KEY, masteryMap);
        }
        showToast(
          isEn()
            ? `Checkpoints done! Avg precision ±${avg.toFixed(1)}¢`
            : `Checkpoints concluídos! Precisão média ±${avg.toFixed(1)}¢`,
          { type: "success", icon: "✓", durationMs: 2600 }
        );
      }
      renderCoachStrip();
    }
  }

  function startWarmup10Min() {
    if (warmup.timerId !== null) {
      window.clearInterval(warmup.timerId);
      warmup.timerId = null;
    }
    if (warmup.active) {
      warmup.active = false;
      renderCoachStrip();
      return;
    }

    warmup = { active: true, remainingSec: 600, phaseIdx: 0, timerId: null };
    const lesson = resolveCurrentLesson();
    if (lesson?.id && typeof deps.onApplyLesson === "function") {
      deps.onApplyLesson(lesson.id);
    }

    warmup.timerId = window.setInterval(() => {
      if (!warmup.active) return;
      warmup.remainingSec = Math.max(0, warmup.remainingSec - 1);
      if (warmup.remainingSec > 420) warmup.phaseIdx = 0;
      else if (warmup.remainingSec > 180) warmup.phaseIdx = 1;
      else warmup.phaseIdx = 2;

      if (warmup.remainingSec === 0) {
        warmup.active = false;
        if (warmup.timerId !== null) window.clearInterval(warmup.timerId);
        warmup.timerId = null;
        if (lesson?.id) recordPracticeSession(lesson.id, null);
        showToast(
          isEn() ? "10-min practice routine complete!" : "Rotina de aquecimento de 10 min concluída!",
          { type: "success", icon: "⏱" }
        );
      }
      renderCoachStrip();
    }, 1000);

    renderCoachStrip();
    showToast(
      isEn() ? "10-min warm-up timer started" : "Rotina de aquecimento (10 min) iniciada",
      { type: "info", icon: "⏱", durationMs: 1800 }
    );
  }

  /**
   * @param {number} sec
   */
  function formatMmSs(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }

  function renderCoachStrip() {
    if (typeof document === "undefined") return;
    const host =
      document.querySelector(".neck-showcase") ||
      document.querySelector(".fretboard-panel") ||
      document.querySelector("main");
    if (!host) return;

    let strip = document.getElementById("sa-study-coach-strip");
    if (!strip) {
      strip = document.createElement("div");
      strip.id = "sa-study-coach-strip";
      strip.className = "sa-study-coach-strip";
      host.insertAdjacentElement("afterend", strip);
    }

    const en = isEn();
    const lesson = resolveCurrentLesson();
    const lesId = lesson.id;
    const lesTitle = en ? (lesson.titleEn || lesson.title || lesId) : (lesson.titlePt || lesson.title || lesId);
    const stage = getMastery(lesId);
    const noteText = getLessonNote(lesId);
    const cpArmed = checkpointLessonId === lesId;
    const listeningNow = Boolean(deps.isPitchListening?.());
    const savedStat = statsMap[lesId] || null;

    const phasesPt = ["1/3 Afinação & Escala (3m)", "2/3 Posição & Técnica (4m)", "3/3 Sayr & Improviso (3m)"];
    const phasesEn = ["1/3 Tuning & Scale (3m)", "2/3 Position & Technique (4m)", "3/3 Sayr & Improvisation (3m)"];
    const phaseLbl = en ? phasesEn[warmup.phaseIdx] : phasesPt[warmup.phaseIdx];

    const cpLabelsPt = ["Qarar", "Microtom / 3ª", "Frase / Cadência"];
    const cpLabelsEn = ["Qarar", "Microtone / 3rd", "Phrase / Cadence"];
    const cpLabels = en ? cpLabelsEn : cpLabelsPt;

    const cpAvg = checkpointErrors.length
      ? checkpointErrors.reduce((a, b) => a + b, 0) / checkpointErrors.length
      : null;

    const cpChipsHtml = cpLabels
      .map((lbl, idx) => {
        const done = cpArmed && checkpointStep > idx;
        const cur = cpArmed && checkpointStep === idx;
        return `<span class="sa-cp-chip ${done ? "is-done" : (cur ? "is-cur" : "")}">${done ? "✓" : "○"} ${lbl}</span>`;
      })
      .join("");

    const cpMetaHtml = cpAvg !== null
      ? `<span class="sa-cp-metric">±${cpAvg.toFixed(1)}¢ ${en ? "avg" : "méd."}</span>`
      : (!listeningNow
        ? `<button type="button" id="sa-btn-open-mic-from-cp" class="sa-mini-chip">🎙 ${en ? "Enable YIN" : "Ligar YIN"}</button>`
        : "");

    const speedButtonsHtml = CALL_RESP_SPEEDS.map((sp) => `
      <button type="button" class="sa-mini-chip sa-cr-speed-btn ${callResp.speed === sp ? "is-active" : ""}" data-sa-cr-speed="${sp}">
        ${sp.toFixed(2).replace(/0$/, "")}×
      </button>
    `).join("");

    let callRespBarHtml = "";
    if (callResp.active) {
      const isCall = callResp.phase === "CALL";
      const phaseBadge = isCall
        ? (en ? "🎧 Listen to motif" : "🎧 Ouça o motivo")
        : (en ? "🪕 Your turn on the Oud" : "🪕 Sua vez no Oud");
      const motifHtml = callResp.motif.map((n, idx) => {
        const isPlayingNow = isCall && callResp.activeCallIdx === idx;
        const isMatched = !isCall && callResp.matchedIndices.has(idx);
        return `<span class="sa-cr-note ${isPlayingNow ? "is-playing" : ""} ${isMatched ? "is-matched" : ""}">${isMatched ? "✓ " : ""}${n.label}</span>`;
      }).join("");

      const summaryHtml = callResp.lastSummary
        ? `<span class="sa-cp-metric">${en ? "Last" : "Último"}: ${callResp.lastSummary.hits}/${callResp.lastSummary.total}${callResp.lastSummary.avgCents !== null ? ` · ±${callResp.lastSummary.avgCents.toFixed(1)}¢` : ""}</span>`
        : (!listeningNow
          ? `<button type="button" id="sa-btn-open-mic-from-cr" class="sa-mini-chip">🎙 ${en ? "Score with YIN" : "Pontuar c/ YIN"}</button>`
          : "");

      callRespBarHtml = `
        <div class="sa-cr-bar ${isCall ? "is-call" : "is-response"}">
          <div class="sa-cr-head">
            <span class="sa-cr-phase-badge">${phaseBadge}</span>
            <div class="sa-cr-motif">${motifHtml}</div>
            <div class="sa-cr-speeds" role="group" aria-label="${en ? "Call and Response speed" : "Velocidade Call & Response"}">
              ${speedButtonsHtml}
              <span id="sa-cr-timer" class="sa-cr-timer">0.0s</span>
              ${summaryHtml}
            </div>
          </div>
          <div class="sa-cr-progress-track">
            <div id="sa-cr-progress-fill" class="sa-cr-progress-fill" style="width:0%"></div>
          </div>
        </div>
      `;
    }

    const statBadgeHtml = savedStat && savedStat.bestAvgCents !== null
      ? `<span class="sa-coach-stat-pill" title="${en ? "Best YIN average precision on this lesson" : "Melhor precisão média YIN nesta lição"}">🎯 ±${savedStat.bestAvgCents}¢</span>`
      : "";

    strip.innerHTML = `
      <div class="sa-coach-top">
        <div class="sa-coach-lesson-info">
          <span class="sa-toolbar-label">${en ? "Active Lesson" : "Lição"}</span>
          <strong class="sa-coach-title">${lesTitle}</strong>
          ${statBadgeHtml}
        </div>

        <div class="sa-coach-mastery-group" role="group" aria-label="${en ? "Mastery stage" : "Estágio de domínio"}">
          <button type="button" class="sa-mini-chip ${stage === MASTERY_STAGES.STARTED ? "is-active" : ""}" data-sa-mastery="STARTED">${en ? "Started" : "Iniciado"}</button>
          <button type="button" class="sa-mini-chip ${stage === MASTERY_STAGES.PRACTICING ? "is-active" : ""}" data-sa-mastery="PRACTICING">${en ? "Practicing" : "Em Prática"}</button>
          <button type="button" class="sa-mini-chip ${stage === MASTERY_STAGES.MASTERED ? "is-active" : ""}" data-sa-mastery="MASTERED">${en ? "Mastered" : "Dominado"}</button>
        </div>

        <div class="sa-coach-tools">
          <button type="button" class="sa-mini-chip" data-sa-ab="A">A · b3</button>
          <button type="button" class="sa-mini-chip" data-sa-ab="B">B · 3-</button>
          <button type="button" id="sa-btn-call-resp" class="sa-mini-chip ${callResp.active ? "is-active" : ""}" aria-pressed="${callResp.active ? "true" : "false"}">
            ${callResp.active ? (en ? "⏹ Stop C&R" : "⏹ Parar C&R") : "🔁 Call & Resp."}
          </button>
          <button type="button" id="sa-btn-cp-live" class="sa-mini-chip ${cpArmed ? "is-active" : ""}" aria-pressed="${cpArmed ? "true" : "false"}">🎯 ${en ? "YIN Check" : "Checar YIN"}</button>
          <button type="button" id="sa-btn-warmup-10" class="sa-mini-chip ${warmup.active ? "is-active" : ""}" aria-pressed="${warmup.active ? "true" : "false"}">
            ⏱ ${warmup.active ? `${formatMmSs(warmup.remainingSec)} · ${phaseLbl}` : (en ? "10m Warm-up" : "10m Aquecer")}
          </button>
        </div>
      </div>

      ${callRespBarHtml}

      ${cpArmed ? `<div class="sa-cp-bar">${cpChipsHtml}${cpMetaHtml}</div>` : ""}

      <div class="sa-coach-note-row">
        <input
          type="text"
          id="sa-lesson-note-input"
          class="sa-coach-note-input"
          maxlength="400"
          value="${String(noteText).replace(/"/g, "&quot;")}"
          placeholder="${en ? "Personal practice note for this lesson (e.g. comfortable BPM, finger relaxation)..." : "Anotação pessoal desta lição (ex.: BPM confortável, relaxar dedo 2 no quarto de tom)..."}"
        />
      </div>
    `;

    strip.querySelectorAll("[data-sa-mastery]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = /** @type {any} */ (btn.getAttribute("data-sa-mastery") || MASTERY_STAGES.STARTED);
        setMastery(lesId, m);
      });
    });

    strip.querySelectorAll("[data-sa-ab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const kind = btn.getAttribute("data-sa-ab") === "B" ? "B" : "A";
        playContrastAB(kind);
      });
    });

    strip.querySelector("#sa-btn-call-resp")?.addEventListener("click", () => {
      if (callResp.active) {
        stopCallResponse(false);
      } else {
        startCallResponse(callResp.speed);
      }
    });

    strip.querySelectorAll("[data-sa-cr-speed]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sp = parseFloat(btn.getAttribute("data-sa-cr-speed") || "0.85");
        if (!Number.isFinite(sp)) return;
        callResp.speed = sp;
        if (callResp.active) {
          runCallResponseCycle();
        } else {
          renderCoachStrip();
        }
      });
    });

    strip.querySelector("#sa-btn-cp-live")?.addEventListener("click", () => toggleLiveCheckpoint(lesId));
    strip.querySelector("#sa-btn-warmup-10")?.addEventListener("click", startWarmup10Min);

    strip.querySelector("#sa-btn-open-mic-from-cp")?.addEventListener("click", () => {
      deps.onOpenLivePitch?.();
    });
    strip.querySelector("#sa-btn-open-mic-from-cr")?.addEventListener("click", () => {
      deps.onOpenLivePitch?.();
    });

    const noteInp = /** @type {HTMLInputElement | null} */ (strip.querySelector("#sa-lesson-note-input"));
    if (noteInp) {
      noteInp.addEventListener("change", () => {
        setLessonNote(lesId, noteInp.value);
        showToast(isEn() ? "Lesson note saved" : "Anotação salva", { type: "info", icon: "✎", durationMs: 1400 });
      });
    }
  }

  renderCoachStrip();

  return {
    renderCoachStrip,
    onLiveDetection,
    startWarmup10Min,
    startCallResponse,
    stopCallResponse,
    getMastery,
    setMastery
  };
}
