// @ts-check
/**
 * Treinador Auditivo Modal & Microtonal 24-TET (Ear Training Lab)
 * Migrado dos conceitos do String Atlas (earTrainer.js / earLabView.js) para o App Oud Visualizer (v3.14.0).
 * Treina reconhecimento de terças (b3 / 3- / 3), quartos de tom e Ajnas com áudio Web Audio.
 */

import { showToast } from "./toastView.js";

const EAR_DRILLS = Object.freeze([
  {
    id: "thirds_quality",
    titlePt: "Terças: Menor (b3) · Neutra (3-) · Maior (3)",
    titleEn: "Thirds: Minor (b3) · Neutral (3-) · Major (3)",
    descPt: "Ouça o Qarar seguido da terça e identifique o caráter (b3 = 6q / 300¢, 3- = 7q / 350¢ Sikah/Bayati, 3 = 8q / 400¢).",
    descEn: "Hear Qarar then the third and identify the quality (b3 = 6q / 300¢, 3- = 7q / 350¢ Sikah/Bayati, 3 = 8q / 400¢).",
    options: [
      { id: "m3", intervalQ: 6, labelPt: "Terça Menor (b3 · 300¢)", labelEn: "Minor Third (b3 · 300¢)" },
      { id: "n3", intervalQ: 7, labelPt: "Terça Neutra (3- · 350¢)", labelEn: "Neutral Third (3- · 350¢)" },
      { id: "M3", intervalQ: 8, labelPt: "Terça Maior (3 · 400¢)", labelEn: "Major Third (3 · 400¢)" }
    ]
  },
  {
    id: "quarter_tone_colors",
    titlePt: "Microtons 24-TET: 2ª Neutra (3q) · 4ª · 6ª Neutra (17q)",
    titleEn: "24-TET Microtones: Neutral 2nd (3q) · 4th · Neutral 6th (17q)",
    descPt: "Diferencie intervalos neutros característicos do Maqam frente a graus diatônicos estáveis.",
    descEn: "Distinguish characteristic neutral Maqam intervals from stable diatonic degrees.",
    options: [
      { id: "n2", intervalQ: 3, labelPt: "2ª Neutra (3q · 150¢)", labelEn: "Neutral 2nd (3q · 150¢)" },
      { id: "p4", intervalQ: 10, labelPt: "4ª Justa (10q · 500¢)", labelEn: "Perfect 4th (10q · 500¢)" },
      { id: "n6", intervalQ: 17, labelPt: "6ª Neutra (17q · 850¢)", labelEn: "Neutral 6th (17q · 850¢)" }
    ]
  },
  {
    id: "ajnas_signature",
    titlePt: "Assinatura de Jins: Bayati · Hijaz · Rast",
    titleEn: "Jins Signature: Bayati · Hijaz · Rast",
    descPt: "Reconheça o perfil intervalar de abertura do Jins a partir do Qarar.",
    descEn: "Recognize the opening intervallic signature of each Jins from Qarar.",
    options: [
      { id: "jins_bayati", motifQ: [0, 3, 6, 10], labelPt: "Jins Bayati (3q – 3q – 4q)", labelEn: "Jins Bayati (3q – 3q – 4q)" },
      { id: "jins_hijaz", motifQ: [0, 2, 8, 10], labelPt: "Jins Hijaz (2q – 6q – 2q)", labelEn: "Jins Hijaz (2q – 6q – 2q)" },
      { id: "jins_rast", motifQ: [0, 4, 7, 10], labelPt: "Jins Rast (4q – 3q – 3q)", labelEn: "Jins Rast (4q – 3q – 3q)" }
    ]
  }
]);

const BASE_C3_HZ = 130.81278;

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * @param {any} deps
 */
export function createEarTrainerController(deps) {
  let drillId = EAR_DRILLS[0].id;
  /** @type {any} */
  let currentQuestion = null;
  let scoreCorrect = 0;
  let scoreTotal = 0;
  let streak = 0;
  /** @type {{ ok: boolean, text: string, pickedId?: string } | null} */
  let lastFeedback = null;
  let isPlayingPrompt = false;

  const isEn = () => deps.getState?.()?.lang === "en";

  function getRootFreqHz() {
    const st = deps.getState?.() || {};
    const rq = ((Number(st.rootQ) || 0) % 24 + 24) % 24;
    return BASE_C3_HZ * Math.pow(2, rq / 24);
  }

  function pickNextQuestion() {
    const drill = EAR_DRILLS.find((d) => d.id === drillId) || EAR_DRILLS[0];
    const opt = drill.options[Math.floor(Math.random() * drill.options.length)];
    currentQuestion = {
      drillId: drill.id,
      optionId: opt.id,
      intervalQ: /** @type {any} */ (opt).intervalQ ?? null,
      motifQ: /** @type {any} */ (opt).motifQ ?? null,
      labelPt: opt.labelPt,
      labelEn: opt.labelEn,
      answered: false
    };
    lastFeedback = null;
  }

  async function playCurrentPrompt() {
    if (!currentQuestion) pickNextQuestion();
    if (isPlayingPrompt || !currentQuestion) return;
    isPlayingPrompt = true;
    try {
      const rootHz = getRootFreqHz();
      deps.playFreq?.(rootHz, 0.75);
      await sleep(520);
      if (Array.isArray(currentQuestion.motifQ)) {
        for (const stepQ of currentQuestion.motifQ) {
          deps.playFreq?.(rootHz * Math.pow(2, stepQ / 24), 0.55);
          await sleep(360);
        }
      } else if (typeof currentQuestion.intervalQ === "number") {
        deps.playFreq?.(rootHz * Math.pow(2, currentQuestion.intervalQ / 24), 0.85);
      }
    } finally {
      isPlayingPrompt = false;
    }
  }

  /**
   * @param {string} chosenId
   */
  function submitAnswer(chosenId) {
    if (!currentQuestion) return;
    const drill = EAR_DRILLS.find((d) => d.id === drillId) || EAR_DRILLS[0];
    const chosenOpt = drill.options.find((o) => o.id === chosenId);
    const correctOpt = drill.options.find((o) => o.id === currentQuestion.optionId);
    const en = isEn();

    if (!currentQuestion.answered) {
      scoreTotal += 1;
      currentQuestion.answered = true;
      if (chosenId === currentQuestion.optionId) {
        scoreCorrect += 1;
        streak += 1;
        lastFeedback = {
          ok: true,
          pickedId: chosenId,
          text: en
            ? `Correct! ${correctOpt?.labelEn || ""}`
            : `Correto! ${correctOpt?.labelPt || ""}`
        };
        showToast(lastFeedback.text, { type: "success", icon: "✓", durationMs: 1800 });
      } else {
        streak = 0;
        const rightLbl = en ? correctOpt?.labelEn : correctOpt?.labelPt;
        const pickedLbl = en ? chosenOpt?.labelEn : chosenOpt?.labelPt;
        lastFeedback = {
          ok: false,
          pickedId: chosenId,
          text: en
            ? `You picked "${pickedLbl}" — answer: ${rightLbl}`
            : `Você marcou "${pickedLbl}" — resposta: ${rightLbl}`
        };
        showToast(lastFeedback.text, { type: "warn", icon: "△", durationMs: 2400 });
      }
    }
    renderModal();
  }

  function openModal() {
    if (typeof document === "undefined") return;
    if (!currentQuestion) pickNextQuestion();

    let modal = document.getElementById("sa-ear-trainer-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "sa-ear-trainer-modal";
      modal.className = "sa-modal-backdrop";
      document.body.appendChild(modal);
    }
    renderModal();
  }

  function renderModal() {
    const modal = document.getElementById("sa-ear-trainer-modal");
    if (!modal) return;

    const en = isEn();
    const drill = EAR_DRILLS.find((d) => d.id === drillId) || EAR_DRILLS[0];
    const pcs = deps.getPitchClasses24?.() || [];
    const st = deps.getState?.() || {};
    const rq = ((Number(st.rootQ) || 0) % 24 + 24) % 24;
    const rootName = pcs[rq]?.flat || "C";

    const drillTabsHtml = EAR_DRILLS.map((d) => {
      const active = d.id === drillId ? "is-active" : "";
      const title = en ? d.titleEn : d.titlePt;
      const shortTitle = title.split(":")[0];
      return `<button type="button" class="sa-mini-chip ${active}" data-sa-ear-drill="${d.id}">${shortTitle}</button>`;
    }).join("");

    const optionsHtml = drill.options
      .map((opt) => {
        const lbl = en ? opt.labelEn : opt.labelPt;
        let extraCls = "";
        if (currentQuestion?.answered) {
          if (opt.id === currentQuestion.optionId) extraCls = "is-correct";
          else if (opt.id === lastFeedback?.pickedId) extraCls = "is-wrong";
        }
        return `<button type="button" class="sa-ear-opt-btn ${extraCls}" data-sa-ear-ans="${opt.id}">${lbl}</button>`;
      })
      .join("");

    const accPct = scoreTotal > 0 ? Math.round((scoreCorrect / scoreTotal) * 100) : 0;

    modal.innerHTML = `
      <div class="sa-modal-card" role="dialog" aria-modal="true" aria-label="${en ? "24-TET Ear Trainer" : "Treinador Auditivo 24-TET"}">
        <div class="sa-modal-header">
          <h3>🎧 ${en ? "24-TET Ear Training Lab" : "Treinador Auditivo 24-TET"}</h3>
          <button type="button" id="sa-close-ear-modal" class="sa-mini-chip">✕</button>
        </div>

        <div class="sa-ear-stats-bar">
          <span>${en ? "Score" : "Pontuação"}: <strong>${scoreCorrect}/${scoreTotal}</strong> (${accPct}%)</span>
          <span>🔥 ${en ? "Streak" : "Sequência"}: <strong>${streak}</strong></span>
          <span>Qarar: <strong>${rootName}</strong></span>
        </div>

        <div class="sa-ear-drill-pills">${drillTabsHtml}</div>

        <div class="sa-modal-section">
          <div class="sa-ear-drill-title">${en ? drill.titleEn : drill.titlePt}</div>
          <p class="sa-empty-hint">${en ? drill.descEn : drill.descPt}</p>

          <div class="sa-export-btn-row">
            <button type="button" id="sa-ear-play-btn" class="sa-pill-btn is-active">▶ ${en ? "Play Prompt" : "Ouvir Pergunta"}</button>
            <button type="button" id="sa-ear-next-btn" class="sa-pill-btn">↻ ${en ? "Next & Play" : "Próxima e Ouvir"}</button>
          </div>

          <div class="sa-ear-options-grid">${optionsHtml}</div>

          ${lastFeedback ? `<div class="sa-ear-feedback ${lastFeedback.ok ? "is-ok" : "is-err"}">${lastFeedback.text}</div>` : ""}
        </div>
      </div>
    `;

    modal.querySelector("#sa-close-ear-modal")?.addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) modal.remove();
    });

    modal.querySelectorAll("[data-sa-ear-drill]").forEach((btn) => {
      btn.addEventListener("click", () => {
        drillId = btn.getAttribute("data-sa-ear-drill") || EAR_DRILLS[0].id;
        pickNextQuestion();
        renderModal();
        playCurrentPrompt();
      });
    });

    modal.querySelector("#sa-ear-play-btn")?.addEventListener("click", playCurrentPrompt);
    modal.querySelector("#sa-ear-next-btn")?.addEventListener("click", () => {
      pickNextQuestion();
      renderModal();
      playCurrentPrompt();
    });

    modal.querySelectorAll("[data-sa-ear-ans]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const ans = btn.getAttribute("data-sa-ear-ans") || "";
        submitAnswer(ans);
      });
    });
  }

  function closeModal() {
    document.getElementById("sa-ear-trainer-modal")?.remove();
  }

  return {
    openModal,
    closeModal,
    playCurrentPrompt
  };
}
