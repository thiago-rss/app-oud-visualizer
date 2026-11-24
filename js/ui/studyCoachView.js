// @ts-check
/**
 * Tutor Ativo do Guia de Estudos (v3.16.0):
 * - 3 Estágios de Domínio (Iniciado · Em Prática · Dominado) persistidos em localStorage
 * - Caderno de Anotações Pessoais por Lição (salvo em localStorage)
 * - Rotina de Aquecimento Diário (10 min: 3m Afinação/Escala · 4m Posição/Técnica · 3m Sayr/Improviso)
 * - Checkpoints Práticos ao Vivo via detector YIN 24-TET (Mic / Linha DI)
 * - Comparador Auditivo A/B (Intervalos / Microtons) na lição ativa
 */

import { showToast } from "./toastView.js";

export const MASTERY_STORAGE_KEY = "oud_study_mastery_v1";
export const NOTES_STORAGE_KEY = "oud_study_lesson_notes_v1";

export const MASTERY_STAGES = Object.freeze({
  STARTED: "STARTED",
  PRACTICING: "PRACTICING",
  MASTERED: "MASTERED"
});

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

function saveJsonMap(key, mapObj) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(mapObj));
    }
  } catch {
    // ignore quota
  }
}

/**
 * @param {any} deps
 */
export function createStudyCoachController(deps) {
  let masteryMap = loadJsonMap(MASTERY_STORAGE_KEY);
  let notesMap = loadJsonMap(NOTES_STORAGE_KEY);

  /** @type {string | null} */
  let checkpointLessonId = null;
  let checkpointStep = 0;
  let lastCheckpointHitTs = 0;

  /** @type {{ active: boolean, remainingSec: number, phaseIdx: number, timerId: number | null }} */
  let warmup = { active: false, remainingSec: 600, phaseIdx: 0, timerId: null };

  const isEn = () => deps.getState?.()?.lang === "en";

  /**
   * @param {string} lessonId
   */
  function getMastery(lessonId) {
    if (!lessonId) return MASTERY_STAGES.STARTED;
    const v = masteryMap[lessonId];
    if (v === MASTERY_STAGES.PRACTICING || v === MASTERY_STAGES.MASTERED) return v;
    return MASTERY_STAGES.STARTED;
  }

  /**
   * @param {string} lessonId
   * @param {string} stage
   */
  function setMastery(lessonId, stage) {
    if (!lessonId) return;
    masteryMap[lessonId] = stage;
    saveJsonMap(MASTERY_STORAGE_KEY, masteryMap);
    renderCoachStrip();
    showToast(
      isEn() ? `Mastery updated: ${stage}` : `Domínio atualizado: ${stage === "MASTERED" ? "Dominado" : stage === "PRACTICING" ? "Em Prática" : "Iniciado"}`,
      { type: "success", icon: "✦", durationMs: 1600 }
    );
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

  function getRootFreqHz() {
    const st = deps.getState?.() || {};
    const rq = ((Number(st.rootQ) || 0) % 24 + 24) % 24;
    return 130.81278 * Math.pow(2, rq / 24);
  }

  /**
   * @param {"A" | "B"} kind
   */
  function playContrastAB(kind) {
    const rootHz = getRootFreqHz();
    const qDelta = kind === "A" ? 6 : 7;
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
   * @param {string} lessonId
   */
  function toggleLiveCheckpoint(lessonId) {
    if (checkpointLessonId === lessonId) {
      checkpointLessonId = null;
      checkpointStep = 0;
      renderCoachStrip();
      return;
    }
    checkpointLessonId = lessonId;
    checkpointStep = 0;
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
    if (!checkpointLessonId || !detection || !detection.active) return;
    if (detection.status !== "IN_TUNE" && detection.status !== "CLOSE") return;

    const now = Date.now();
    if (now - lastCheckpointHitTs < 650) return;
    lastCheckpointHitTs = now;

    if (checkpointStep < 3) {
      checkpointStep += 1;
      if (checkpointStep >= 3) {
        masteryMap[checkpointLessonId] = MASTERY_STAGES.PRACTICING;
        saveJsonMap(MASTERY_STORAGE_KEY, masteryMap);
        showToast(
          isEn()
            ? "Lesson checkpoints completed! Marked as Practicing."
            : "Checkpoints concluídos! Lição marcada como Em Prática.",
          { type: "success", icon: "✓", durationMs: 2400 }
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
      const elapsed = 600 - warmup.remainingSec;
      warmup.phaseIdx = elapsed < 180 ? 0 : (elapsed < 420 ? 1 : 2);
      if (warmup.remainingSec === 0) {
        warmup.active = false;
        if (warmup.timerId !== null) {
          window.clearInterval(warmup.timerId);
          warmup.timerId = null;
        }
        showToast(isEn() ? "10-min practice routine complete!" : "Rotina de aquecimento de 10 min concluída!", { type: "success", icon: "⏱" });
      }
      renderCoachStrip();
    }, 1000);

    renderCoachStrip();
    showToast(isEn() ? "10-min warm-up timer started" : "Rotina de aquecimento (10 min) iniciada", { type: "info", icon: "⏱", durationMs: 1800 });
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
      host.appendChild(strip);
    }

    const en = isEn();
    const lesson = resolveCurrentLesson();
    const lesId = lesson.id || "les_01";
    const lesTitle = en ? (lesson.titleEn || lesson.title_en || lesson.title || lesId) : (lesson.titlePt || lesson.title || lesId);
    const stage = getMastery(lesId);
    const noteText = getLessonNote(lesId);
    const cpArmed = checkpointLessonId === lesId;

    const phasesPt = ["1/3 Afinação & Escala (3m)", "2/3 Posição & Técnica (4m)", "3/3 Sayr & Improviso (3m)"];
    const phasesEn = ["1/3 Tuning & Scale (3m)", "2/3 Position & Technique (4m)", "3/3 Sayr & Improvisation (3m)"];
    const phaseLbl = en ? phasesEn[warmup.phaseIdx] : phasesPt[warmup.phaseIdx];

    const cpLabelsPt = ["Qarar", "Microtom / 3ª", "Frase / Cadência"];
    const cpLabelsEn = ["Qarar", "Microtone / 3rd", "Phrase / Cadence"];
    const cpLabels = en ? cpLabelsEn : cpLabelsPt;

    const cpChipsHtml = cpLabels
      .map((lbl, idx) => {
        const done = cpArmed && checkpointStep > idx;
        const cur = cpArmed && checkpointStep === idx;
        return `<span class="sa-cp-chip ${done ? "is-done" : (cur ? "is-cur" : "")}">${done ? "✓" : "○"} ${lbl}</span>`;
      })
      .join("");

    strip.innerHTML = `
      <div class="sa-coach-top">
        <div class="sa-coach-lesson-info">
          <span class="sa-toolbar-label">${en ? "Active Lesson" : "Lição"}</span>
          <strong class="sa-coach-title">${lesTitle}</strong>
        </div>

        <div class="sa-coach-mastery-group" role="group" aria-label="${en ? "Mastery stage" : "Estágio de domínio"}">
          <button type="button" class="sa-mini-chip ${stage === MASTERY_STAGES.STARTED ? "is-active" : ""}" data-sa-mastery="STARTED">${en ? "Started" : "Iniciado"}</button>
          <button type="button" class="sa-mini-chip ${stage === MASTERY_STAGES.PRACTICING ? "is-active" : ""}" data-sa-mastery="PRACTICING">${en ? "Practicing" : "Em Prática"}</button>
          <button type="button" class="sa-mini-chip ${stage === MASTERY_STAGES.MASTERED ? "is-active" : ""}" data-sa-mastery="MASTERED">${en ? "Mastered" : "Dominado"}</button>
        </div>

        <div class="sa-coach-tools">
          <button type="button" class="sa-mini-chip" data-sa-ab="A">A · b3</button>
          <button type="button" class="sa-mini-chip" data-sa-ab="B">B · 3-</button>
          <button type="button" id="sa-btn-cp-live" class="sa-mini-chip ${cpArmed ? "is-active" : ""}">🎯 ${en ? "YIN Check" : "Checar YIN"}</button>
          <button type="button" id="sa-btn-warmup-10" class="sa-mini-chip ${warmup.active ? "is-active" : ""}">
            ⏱ ${warmup.active ? `${formatMmSs(warmup.remainingSec)} · ${phaseLbl}` : (en ? "10m Warm-up" : "10m Aquecer")}
          </button>
        </div>
      </div>

      ${cpArmed ? `<div class="sa-cp-bar">${cpChipsHtml}</div>` : ""}

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

    strip.querySelector("#sa-btn-cp-live")?.addEventListener("click", () => toggleLiveCheckpoint(lesId));
    strip.querySelector("#sa-btn-warmup-10")?.addEventListener("click", startWarmup10Min);

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
    getMastery,
    setMastery
  };
}
