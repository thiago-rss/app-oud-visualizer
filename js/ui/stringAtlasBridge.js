// @ts-check
/**
 * String Atlas Bridge para o App Oud Visualizer (v3.8+)
 * Integra de forma não-invasiva e modular:
 * - Diapasão Global A4 (415–446 Hz + presets 415/432/440/442 Hz)
 * - Modo Estroboscópico (±4¢) + Rastro das últimas 5 notas (Trail) no HUD do afinador
 * - Seletor de Clareza do Braço (Livre / Posição / 1ª Oitava / Espelho Todo)
 * - Gerenciador de Afinações Customizadas Salvas (Scordaturas de 6 ordens)
 * - Feedback global via Toast (toastView.js)
 */

import {
  A4_PRESETS,
  MIN_A4_HZ,
  MAX_A4_HZ,
  STROBE_STORAGE_KEY,
  clampA4Hz,
  loadSavedA4Hz,
  saveA4Hz,
  computeStrobeTelemetry,
  NoteTrailTracker
} from "../core/pitchStabilizer.js";
import {
  NECK_CLARITY_LIST,
  NECK_CLARITY_MODES,
  loadNeckClarityMode,
  saveNeckClarityMode
} from "../core/neckClarity.js";
import {
  loadCustomTunings,
  saveCustomTuning,
  deleteCustomTuning,
  mergeCustomTuningsIntoDb,
  calcFreq440FromAbsQ,
  formatAbsQ24Label
} from "../core/customTunings.js";
import { showToast } from "./toastView.js";

/**
 * @typedef {{
 *   getState: () => any,
 *   DB: any,
 *   onA4Changed?: (a4Hz: number) => void,
 *   onClarityChanged?: (mode: string) => void,
 *   onCustomTuningsChanged?: (selectedTuningId?: string) => void
 * }} BridgeDeps
 */

/**
 * Inicializa o conjunto de recursos migrados do String Atlas no DOM do Oud Visualizer.
 * @param {BridgeDeps} deps
 */
export function initStringAtlasBridge(deps) {
  const trail = new NoteTrailTracker(5, 4800);
  let currentA4 = loadSavedA4Hz();
  let currentClarity = loadNeckClarityMode();
  let strobeEnabled = false;

  try {
    strobeEnabled = window.localStorage.getItem(STROBE_STORAGE_KEY) === "1";
  } catch {
    strobeEnabled = false;
  }

  let strobePhase = 0;

  const isEn = () => deps.getState?.()?.lang === "en";

  if (deps.DB?.tunings) {
    mergeCustomTuningsIntoDb(deps.DB.tunings);
  }

  if (typeof deps.onA4Changed === "function") {
    deps.onA4Changed(currentA4);
  }

  applyClarityToDom(currentClarity);
  if (typeof deps.onClarityChanged === "function") {
    deps.onClarityChanged(currentClarity);
  }

  /**
   * @param {string} mode
   */
  function applyClarityToDom(mode) {
    if (typeof document !== "undefined" && document.body) {
      document.body.setAttribute("data-neck-clarity", mode);
    }
  }

  /**
   * Monta ou atualiza a barra compacta de Clareza do Braço + Diapasão A4 acima do espelho.
   */
  function mountStageClarityBar() {
    if (typeof document === "undefined") return;
    const host =
      document.querySelector(".neck-showcase") ||
      document.querySelector(".fretboard-panel") ||
      document.querySelector("main");
    if (!host) return;

    let bar = document.getElementById("sa-stage-toolbar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "sa-stage-toolbar";
      bar.className = "sa-stage-toolbar";
      host.prepend(bar);
    }

    const en = isEn();
    const clarityButtonsHtml = NECK_CLARITY_LIST.map((item) => {
      const active = item.id === currentClarity ? "is-active" : "";
      const label = en ? item.labelEn : item.labelPt;
      const hint = en ? item.hintEn : item.hintPt;
      return `<button type="button" class="sa-pill-btn ${active}" data-sa-clarity="${item.id}" title="${hint}">${label}</button>`;
    }).join("");

    const a4PresetsHtml = A4_PRESETS.map((hz) => {
      const active = Math.abs(currentA4 - hz) < 0.05 ? "is-active" : "";
      return `<button type="button" class="sa-mini-chip ${active}" data-sa-a4-preset="${hz}">${hz}</button>`;
    }).join("");

    bar.innerHTML = `
      <div class="sa-toolbar-group" role="group" aria-label="${en ? "Fingerboard clarity" : "Clareza do braço"}">
        <span class="sa-toolbar-label">${en ? "Clarity" : "Clareza"}</span>
        <div class="sa-segmented">${clarityButtonsHtml}</div>
      </div>
      <div class="sa-toolbar-group sa-a4-group" role="group" aria-label="${en ? "Reference pitch A4" : "Diapasão A4"}">
        <span class="sa-toolbar-label">A4</span>
        <div class="sa-a4-presets">${a4PresetsHtml}</div>
        <input type="range" id="sa-a4-slider" class="sa-a4-slider" min="${MIN_A4_HZ}" max="${MAX_A4_HZ}" step="0.5" value="${currentA4}" aria-label="A4 Hz" />
        <span id="sa-a4-readout" class="sa-a4-readout">${currentA4.toFixed(1).replace(/\.0$/, "")} Hz</span>
      </div>
      <div class="sa-toolbar-group">
        <button type="button" id="sa-btn-save-tuning" class="sa-pill-btn" title="${en ? "Save or manage custom Oud tunings" : "Salvar ou gerenciar afinações customizadas do Oud"}">
          ✦ ${en ? "Scordaturas" : "Afinações Salvas"}
        </button>
      </div>
    `;

    bar.querySelectorAll("[data-sa-clarity]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextMode = btn.getAttribute("data-sa-clarity") || NECK_CLARITY_MODES.POSITION;
        currentClarity = saveNeckClarityMode(nextMode);
        applyClarityToDom(currentClarity);
        if (typeof deps.onClarityChanged === "function") {
          deps.onClarityChanged(currentClarity);
        }
        mountStageClarityBar();
        const item = NECK_CLARITY_LIST.find((x) => x.id === currentClarity);
        showToast(
          en
            ? `Clarity: ${item?.labelEn || currentClarity}`
            : `Clareza do braço: ${item?.labelPt || currentClarity}`,
          { type: "info", durationMs: 1800 }
        );
      });
    });

    const commitA4 = (hzValue, silent = false) => {
      currentA4 = saveA4Hz(clampA4Hz(hzValue));
      const readout = document.getElementById("sa-a4-readout");
      const slider = /** @type {HTMLInputElement | null} */ (document.getElementById("sa-a4-slider"));
      if (readout) readout.textContent = `${currentA4.toFixed(1).replace(/\.0$/, "")} Hz`;
      if (slider) slider.value = String(currentA4);
      bar.querySelectorAll("[data-sa-a4-preset]").forEach((el) => {
        const val = Number(el.getAttribute("data-sa-a4-preset"));
        el.classList.toggle("is-active", Math.abs(currentA4 - val) < 0.05);
      });
      if (typeof deps.onA4Changed === "function") {
        deps.onA4Changed(currentA4);
      }
      if (!silent) {
        showToast(`Diapasão A4 = ${currentA4} Hz`, { type: "success", durationMs: 1800 });
      }
    };

    bar.querySelectorAll("[data-sa-a4-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        commitA4(Number(btn.getAttribute("data-sa-a4-preset")));
      });
    });

    const a4Slider = /** @type {HTMLInputElement | null} */ (document.getElementById("sa-a4-slider"));
    if (a4Slider) {
      a4Slider.addEventListener("input", () => commitA4(Number(a4Slider.value), true));
      a4Slider.addEventListener("change", () => commitA4(Number(a4Slider.value), false));
    }

    const btnSaveTuning = document.getElementById("sa-btn-save-tuning");
    if (btnSaveTuning) {
      btnSaveTuning.addEventListener("click", openCustomTuningsDrawer);
    }
  }

  /**
   * Injeta a faixa de Estrobo (±4¢) e Rastro de Notas (Trail) dentro do #live-tuner-bar.
   */
  function ensureTunerAddonBar() {
    if (typeof document === "undefined") return null;
    const tunerBar = document.getElementById("live-tuner-bar");
    if (!tunerBar) return null;

    let addon = document.getElementById("sa-tuner-addon");
    if (!addon) {
      addon = document.createElement("div");
      addon.id = "sa-tuner-addon";
      addon.className = "sa-tuner-addon";
      tunerBar.appendChild(addon);
    }

    const en = isEn();
    if (!addon.dataset.mounted) {
      addon.dataset.mounted = "1";
      addon.innerHTML = `
        <div class="sa-strobe-row">
          <button type="button" id="sa-btn-strobe-toggle" class="sa-mini-chip ${strobeEnabled ? "is-active" : ""}">
            ◎ ${en ? "Strobe ±4¢" : "Estrobo ±4¢"}
          </button>
          <div id="sa-strobe-track" class="sa-strobe-track ${strobeEnabled ? "" : "is-hidden"}" aria-hidden="true">
            <div id="sa-strobe-bands" class="sa-strobe-bands"></div>
            <span id="sa-strobe-status" class="sa-strobe-status">±4¢</span>
          </div>
          <div id="sa-note-trail" class="sa-note-trail" aria-label="${en ? "Recent notes trail" : "Rastro de notas recentes"}"></div>
        </div>
      `;

      const toggleBtn = document.getElementById("sa-btn-strobe-toggle");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          strobeEnabled = !strobeEnabled;
          try {
            window.localStorage.setItem(STROBE_STORAGE_KEY, strobeEnabled ? "1" : "0");
          } catch {
            // ignore
          }
          toggleBtn.classList.toggle("is-active", strobeEnabled);
          document.getElementById("sa-strobe-track")?.classList.toggle("is-hidden", !strobeEnabled);
          showToast(
            strobeEnabled
              ? (isEn() ? "Strobe mode (±4¢) enabled" : "Modo Estrobo (±4¢) ativado")
              : (isEn() ? "Strobe mode disabled" : "Modo Estrobo desativado"),
            { type: "info", durationMs: 1600 }
          );
        });
      }
    }
    return addon;
  }

  /**
   * Atualiza o Estrobo (±4¢) e o Rastro de Notas a cada frame de detecção do pitchEngine.js.
   * @param {any} detection
   */
  function updateLiveTelemetry(detection) {
    ensureTunerAddonBar();

    const track = document.getElementById("sa-strobe-track");
    const bands = document.getElementById("sa-strobe-bands");
    const statusEl = document.getElementById("sa-strobe-status");
    const trailEl = document.getElementById("sa-note-trail");

    if (!detection || !detection.active) {
      if (track) track.classList.remove("is-locked", "is-drifting");
      if (statusEl) statusEl.textContent = "±4¢";
      renderTrailChips(trailEl, trail.getAll());
      return;
    }

    const cents = Number.isFinite(detection.centsOff)
      ? detection.centsOff
      : (Number.isFinite(detection.cents) ? detection.cents : 0);

    const strobe = detection.strobe || computeStrobeTelemetry(cents);

    if (strobeEnabled && track && bands && statusEl) {
      track.classList.toggle("is-locked", strobe.locked);
      track.classList.toggle("is-drifting", !strobe.locked);
      if (!strobe.locked) {
        strobePhase = (strobePhase + strobe.driftDirection * (2 + strobe.bandSpeed * 12) + 360) % 360;
        bands.style.backgroundPosition = `${strobePhase.toFixed(1)}px 0`;
        statusEl.textContent = strobe.driftDirection > 0 ? "♯ +" : "♭ −";
      } else {
        statusEl.textContent = isEn() ? "LOCKED ±4¢" : "TRAVADO ±4¢";
      }
    }

    if (detection.status === "IN_TUNE" || detection.status === "CLOSE") {
      const label = detection.noteName || detection.courseLabel || "—";
      const key = `${label}_${detection.absQ ?? ""}`;
      trail.push({
        key,
        label,
        cents: Math.round(cents),
        status: detection.status,
        absQ: detection.absQ ?? null
      });
    }

    renderTrailChips(trailEl, trail.getAll());
  }

  /**
   * @param {HTMLElement | null} container
   * @param {{ label: string, cents: number, status: string }[]} items
   */
  function renderTrailChips(container, items) {
    if (!container) return;
    if (!items.length) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = items
      .map((item, idx) => {
        const opacity = Math.max(0.35, 1 - idx * 0.16).toFixed(2);
        const signed = item.cents > 0 ? `+${item.cents}¢` : `${item.cents}¢`;
        return `<span class="sa-trail-chip sa-trail-chip--${item.status.toLowerCase()}" style="opacity:${opacity}">${item.label} <small>${signed}</small></span>`;
      })
      .join("");
  }

  /**
   * Abre o modal leve de gerenciamento de Afinações Customizadas (6 ordens).
   */
  function openCustomTuningsDrawer() {
    if (typeof document === "undefined") return;
    let modal = document.getElementById("sa-custom-tunings-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "sa-custom-tunings-modal";
      modal.className = "sa-modal-backdrop";
      document.body.appendChild(modal);
    }

    const state = deps.getState?.() || {};
    const activeTuning =
      deps.DB?.tunings?.find((t) => t.id === state.tuningId) || deps.DB?.tunings?.[0];
    const baseCourses = activeTuning?.courses || [
      { course: 1, label: "C4", open_q: 96, freq_hz: 261.63 },
      { course: 2, label: "G3", open_q: 82, freq_hz: 196.0 },
      { course: 3, label: "D3", open_q: 68, freq_hz: 146.83 },
      { course: 4, label: "A2", open_q: 54, freq_hz: 110.0 },
      { course: 5, label: "F2", open_q: 44, freq_hz: 87.31 },
      { course: 6, label: "C2", open_q: 34, freq_hz: 65.41 }
    ];

    const renderModalBody = () => {
      const en = isEn();
      const saved = loadCustomTunings();

      const savedListHtml = saved.length
        ? saved
            .map(
              (t) => `
          <div class="sa-saved-tuning-row">
            <div>
              <strong>${t.name}</strong>
              <div class="sa-saved-tuning-sub">${t.courses.map((c) => c.label).join(" – ")}</div>
            </div>
            <div class="sa-saved-tuning-actions">
              <button type="button" class="sa-mini-chip" data-sa-apply-tuning="${t.id}">${en ? "Apply" : "Aplicar"}</button>
              <button type="button" class="sa-mini-chip sa-danger-chip" data-sa-del-tuning="${t.id}">✕</button>
            </div>
          </div>`
            )
            .join("")
        : `<p class="sa-empty-hint">${en ? "No custom tunings saved yet." : "Nenhuma afinação customizada salva ainda."}</p>`;

      const courseInputsHtml = baseCourses
        .map(
          (c, idx) => `
        <label class="sa-course-edit-cell">
          <span>${idx + 1}ª ${en ? "Course" : "Ordem"}</span>
          <input type="number" min="24" max="144" step="1" data-sa-course-q="${idx}" value="${c.open_q}" />
          <small data-sa-course-lbl="${idx}">${c.label}</small>
        </label>`
        )
        .join("");

      modal.innerHTML = `
        <div class="sa-modal-card" role="dialog" aria-modal="true" aria-label="${en ? "Saved Oud Tunings" : "Afinações Salvas do Oud"}">
          <div class="sa-modal-header">
            <h3>✦ ${en ? "Custom Oud Tunings (6 Courses · 24-TET)" : "Afinações Customizadas do Oud (6 Ordens · 24-TET)"}</h3>
            <button type="button" id="sa-close-tunings-modal" class="sa-mini-chip">✕</button>
          </div>
          <div class="sa-modal-section">
            <label class="sa-field-label">
              <span>${en ? "Tuning Name" : "Nome da Afinação"}</span>
              <input type="text" id="sa-new-tuning-name" placeholder="${en ? "e.g. Aleppo Low B / C-F-A-d-g-c" : "ex.: Alepo Grave B / C-F-A-d-g-c"}" maxlength="60" />
            </label>
            <div class="sa-course-edit-grid">${courseInputsHtml}</div>
            <button type="button" id="sa-btn-create-tuning" class="sa-pill-btn is-active">
              ＋ ${en ? "Save Custom Tuning" : "Salvar Afinação Customizada"}
            </button>
          </div>
          <div class="sa-modal-section">
            <h4>${en ? "Saved Library" : "Biblioteca Salva"}</h4>
            <div class="sa-saved-tuning-list">${savedListHtml}</div>
          </div>
        </div>
      `;

      modal.querySelector("#sa-close-tunings-modal")?.addEventListener("click", () => {
        modal.remove();
      });

      modal.addEventListener("click", (ev) => {
        if (ev.target === modal) modal.remove();
      });

      modal.querySelectorAll("[data-sa-course-q]").forEach((inp) => {
        inp.addEventListener("input", () => {
          const idx = inp.getAttribute("data-sa-course-q");
          const q = Number(/** @type {HTMLInputElement} */ (inp).value);
          const lbl = modal.querySelector(`[data-sa-course-lbl="${idx}"]`);
          if (lbl && Number.isFinite(q)) {
            lbl.textContent = formatAbsQ24Label(q);
          }
        });
      });

      modal.querySelector("#sa-btn-create-tuning")?.addEventListener("click", () => {
        const nameInput = /** @type {HTMLInputElement | null} */ (modal.querySelector("#sa-new-tuning-name"));
        const name = (nameInput?.value || "").trim();
        if (!name) {
          showToast(en ? "Enter a name for the tuning." : "Informe um nome para a afinação.", { type: "warn" });
          return;
        }
        const courses = Array.from(modal.querySelectorAll("[data-sa-course-q]")).map((el, idx) => {
          const openQ = Math.round(Number(/** @type {HTMLInputElement} */ (el).value));
          return {
            course: idx + 1,
            open_q: openQ,
            label: formatAbsQ24Label(openQ),
            freq_hz: calcFreq440FromAbsQ(openQ)
          };
        });

        const created = saveCustomTuning({ name, courses, tradition: state.tradition || "damascus" });
        if (deps.DB?.tunings) mergeCustomTuningsIntoDb(deps.DB.tunings);
        if (typeof deps.onCustomTuningsChanged === "function") {
          deps.onCustomTuningsChanged(created.id);
        }
        showToast(en ? `Saved: ${created.name}` : `Afinação salva: ${created.name}`, { type: "success" });
        renderModalBody();
      });

      modal.querySelectorAll("[data-sa-apply-tuning]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-sa-apply-tuning") || "";
          if (deps.DB?.tunings) mergeCustomTuningsIntoDb(deps.DB.tunings);
          if (typeof deps.onCustomTuningsChanged === "function") {
            deps.onCustomTuningsChanged(id);
          }
          showToast(en ? "Custom tuning applied" : "Afinação customizada aplicada", { type: "success" });
          modal.remove();
        });
      });

      modal.querySelectorAll("[data-sa-del-tuning]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-sa-del-tuning") || "";
          deleteCustomTuning(id);
          if (deps.DB?.tunings) mergeCustomTuningsIntoDb(deps.DB.tunings);
          if (typeof deps.onCustomTuningsChanged === "function") {
            deps.onCustomTuningsChanged();
          }
          showToast(en ? "Tuning deleted" : "Afinação removida", { type: "info" });
          renderModalBody();
        });
      });
    };

    renderModalBody();
  }

  mountStageClarityBar();
  ensureTunerAddonBar();

  return {
    getA4Hz: () => currentA4,
    getClarityMode: () => currentClarity,
    isStrobeEnabled: () => strobeEnabled,
    updateLiveTelemetry,
    clearTrail: () => {
      trail.clear();
      renderTrailChips(document.getElementById("sa-note-trail"), []);
    },
    refreshUi: () => {
      mountStageClarityBar();
      ensureTunerAddonBar();
    },
    showToast
  };
}
