// @ts-check
/**
 * onboardingView.js — Tour Opcional de 3 Passos na Primeira Visita (v3.21.0)
 *
 * Apresenta os 3 fluxos centrais do Estúdio 24-TET sem poluir a tela inicial:
 * 1. Braço Vivo, Cravelhas & 4 Modos de Clareza
 * 2. Escuta 24-TET (Mic / Linha DI), Estrobo ±4¢ & Call & Response
 * 3. Guia de Estudos (51 lições), Perfis de Estúdio & Busca ⌘K
 */

export const ONBOARDING_STORAGE_KEY = "oud_onboarding_done_v1";

function hasCompletedOnboarding() {
  try {
    return typeof window !== "undefined" && window.localStorage?.getItem(ONBOARDING_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

function markOnboardingCompleted() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
    }
  } catch {
    // modo privado
  }
}

/**
 * @param {{
 *   getState: () => any,
 *   onOpenLivePitch?: () => void,
 *   onOpenStudyTab?: () => void,
 *   onOpenPalette?: () => void
 * }} deps
 */
export function createOnboardingController(deps) {
  let stepIdx = 0;

  const isEn = () => deps.getState?.()?.lang === "en";

  function getSteps() {
    const en = isEn();
    return [
      {
        icon: "🪕",
        title: en ? "1/3 · Interactive Neck & Clarity" : "1/3 · Braço Vivo & Clareza",
        body: en
          ? "Click any string or peg on the Oud to hear 24-TET physical synthesis. Double-click a note to set it as your new Qarar (tonic) and switch between Free, Position, 1st Octave and Full Neck."
          : "Clique em qualquer ponto do braço ou nas cravelhas do cabeçote para ouvir a síntese física 24-TET. Dê duplo clique em uma nota para defini-la como tônica (Qarar) e alterne entre Livre, Posição, 1ª Oitava e Espelho Todo.",
        ctaLabel: null,
        ctaAction: null
      },
      {
        icon: "🎙",
        title: en ? "2/3 · Live 24-TET Pitch, Line DI & Call & Response" : "2/3 · Escuta 24-TET, Linha DI & Call & Response",
        body: en
          ? "Play your real Oud via microphone or USB interface (Line DI). Track quarter-tones with the ±4¢ Strobe, low-string stabilizer, and live YIN Checkpoints + Call & Response."
          : "Toque seu Oud real pelo microfone ou interface USB (Modo Linha DI). Valide quartos de tom no Estrobo ±4¢ com estabilizador de bordões, Checkpoints YIN e Call & Response em 3 velocidades.",
        ctaLabel: en ? "Open Live Pitch / Tuner" : "Abrir Escuta 24-TET",
        ctaAction: () => deps.onOpenLivePitch?.()
      },
      {
        icon: "🎓",
        title: en ? "3/3 · 51-Lesson Study Guide, Studio Profiles & ⌘K" : "3/3 · Guia (51 Lições), Perfis de Estúdio & ⌘K",
        body: en
          ? "Follow the 17-chapter progressive curriculum with physical tuning lock, spaced review and direct lesson links. Press ⌘K (or /) anytime to jump to any Maqam, profile, or diagnostics."
          : "Explore os 17 capítulos progressivos com trava de afinação física, revisão espaçada e links diretos de aula. Use ⌘K (ou /) a qualquer momento para saltar para qualquer Maqam, Perfil de Estúdio ou Diagnóstico.",
        ctaLabel: en ? "Open Study Guide" : "Ir para o Guia de Estudos",
        ctaAction: () => deps.onOpenStudyTab?.()
      }
    ];
  }

  function close(markDone = true) {
    if (markDone) markOnboardingCompleted();
    document.getElementById("sa-onboarding-modal")?.remove();
  }

  function open(startAt = 0) {
    if (typeof document === "undefined" || !document.body) return;
    stepIdx = Math.max(0, Math.min(2, startAt));
    document.getElementById("sa-onboarding-modal")?.remove();

    const modal = document.createElement("div");
    modal.id = "sa-onboarding-modal";
    modal.className = "sa-modal-backdrop";
    document.body.appendChild(modal);

    const render = () => {
      const en = isEn();
      const steps = getSteps();
      const step = steps[stepIdx];
      const dotsHtml = steps
        .map((_, idx) => `<span class="sa-onb-dot ${idx === stepIdx ? "is-active" : ""}" aria-hidden="true"></span>`)
        .join("");

      modal.innerHTML = `
        <div class="sa-modal-card sa-onb-card" role="dialog" aria-modal="true" aria-labelledby="sa-onb-title">
          <div class="sa-modal-header">
            <h3 id="sa-onb-title">${step.icon} ${step.title}</h3>
            <button type="button" class="sa-modal-close" id="sa-onb-close" aria-label="${en ? "Close" : "Fechar"}">✕</button>
          </div>
          <div class="sa-modal-body sa-onb-body">
            <p class="sa-onb-text">${step.body}</p>
            ${step.ctaLabel ? `
              <div class="sa-onb-quick">
                <button type="button" class="sa-pill-btn" id="sa-onb-cta">${step.ctaLabel}</button>
              </div>
            ` : ""}
            <div class="sa-onb-footer">
              <div class="sa-onb-dots">${dotsHtml}</div>
              <div class="sa-onb-nav">
                <button type="button" class="sa-mini-chip" id="sa-onb-skip">${en ? "Skip" : "Pular"}</button>
                ${stepIdx > 0 ? `<button type="button" class="sa-mini-chip" id="sa-onb-prev">← ${en ? "Back" : "Voltar"}</button>` : ""}
                <button type="button" class="sa-pill-btn is-active" id="sa-onb-next">
                  ${stepIdx < steps.length - 1 ? (en ? "Next →" : "Próximo →") : (en ? "Start Playing" : "Começar a Tocar")}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      modal.querySelector("#sa-onb-close")?.addEventListener("click", () => close(true));
      modal.querySelector("#sa-onb-skip")?.addEventListener("click", () => close(true));
      modal.querySelector("#sa-onb-prev")?.addEventListener("click", () => {
        stepIdx = Math.max(0, stepIdx - 1);
        render();
      });
      modal.querySelector("#sa-onb-next")?.addEventListener("click", () => {
        if (stepIdx < steps.length - 1) {
          stepIdx += 1;
          render();
        } else {
          close(true);
        }
      });
      modal.querySelector("#sa-onb-cta")?.addEventListener("click", () => {
        const fn = step.ctaAction;
        close(true);
        fn?.();
      });

      const primaryBtn = /** @type {HTMLElement | null} */ (modal.querySelector("#sa-onb-next"));
      primaryBtn?.focus();
    };

    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) close(true);
    });

    render();
  }

  function maybeAutoShow() {
    if (hasCompletedOnboarding()) return;
    // Evita interromper quando o usuário chega por link direto de aula (#les=...)
    if (typeof window !== "undefined" && window.location.hash.includes("les=")) {
      markOnboardingCompleted();
      return;
    }
    window.setTimeout(() => {
      if (!hasCompletedOnboarding()) {
        open(0);
      }
    }, 900);
  }

  return {
    open,
    close,
    maybeAutoShow
  };
}
