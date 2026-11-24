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
import { createCommandPaletteController } from "./commandPaletteView.js";
import { createEarTrainerController } from "./earTrainerView.js";
import { createLiveNeckFxController } from "./liveNeckFx.js";
import { exportPlateAsPng, exportPlateAsSvg } from "../core/plateExporter.js";
import { loadSnapshots, saveSnapshot, deleteSnapshot, buildFullBackupJson, importFullBackupJson } from "../core/sessionSnapshots.js";

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
  /** @type {any} */
  let paletteCtrl = null;
  /** @type {any} */
  let earCtrl = null;
  /** @type {any} */
  let liveFxCtrl = null;
  let a4PopoverOpen = false;
  let controlsDrawerOpen = false;
  /** @type {boolean | null} */
  let staffUserOverride = null;

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

  /**
   * Padrão String Atlas v8.9 — Zero Menus Permanentes Acima do Braço:
   * - Recolhe .command-bar-shell por padrão (abre via ⚙ Controles ou clicando no título da escala no palco).
   * - No Modo Livre (FREE), recolhe #staff-stage-box até o usuário clicar em 🎼 Pauta ou escolher um Maqam/Lição.
   */
  function syncFocusedStageLayout() {
    if (typeof document === "undefined" || !document.body) return;
    document.body.setAttribute("data-sa-controls-open", controlsDrawerOpen ? "true" : "false");

    const cmdShell = document.querySelector(".command-bar-shell");
    if (cmdShell) {
      cmdShell.classList.toggle("sa-controls-collapsed", !controlsDrawerOpen);
    }

    const headerBtn = document.getElementById("sa-btn-header-controls");
    if (headerBtn) {
      headerBtn.classList.toggle("is-active", controlsDrawerOpen);
      headerBtn.setAttribute("aria-expanded", controlsDrawerOpen ? "true" : "false");
    }

    const stagePicker = document.getElementById("sa-stage-scale-trigger");
    if (stagePicker) {
      stagePicker.classList.toggle("is-open", controlsDrawerOpen);
    }

    const shouldHideStaff =
      staffUserOverride !== null
        ? !staffUserOverride
        : currentClarity === NECK_CLARITY_MODES.FREE;
    document.body.setAttribute("data-sa-staff-hidden", shouldHideStaff ? "true" : "false");

    const btnStaff = document.getElementById("sa-btn-staff-toggle");
    if (btnStaff) {
      btnStaff.classList.toggle("is-active", !shouldHideStaff);
    }
  }

  function toggleControlsDrawer(forceState) {
    controlsDrawerOpen = typeof forceState === "boolean" ? forceState : !controlsDrawerOpen;
    syncFocusedStageLayout();
  }

  /**
   * Injeta o botão compacto "⚙ Controles" diretamente em .header-actions (modelo String Atlas v8.9).
   */
  function mountHeaderControlsButton() {
    if (typeof document === "undefined") return;
    const actions = document.querySelector(".studio-header .header-actions") || document.querySelector(".header-actions");
    if (!actions) return;

    let btn = document.getElementById("sa-btn-header-controls");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.id = "sa-btn-header-controls";
      btn.className = "sa-header-controls-btn";
      btn.setAttribute("aria-expanded", controlsDrawerOpen ? "true" : "false");
      btn.addEventListener("click", () => toggleControlsDrawer());
      actions.prepend(btn);
    }
    const en = isEn();
    btn.textContent = en ? "⚙ Controls" : "⚙ Controles";
    btn.title = en ? "Show or hide instrument controls" : "Exibir ou ocultar controles do instrumento";
    btn.classList.toggle("is-active", controlsDrawerOpen);
  }

  function getStageHeaderLabels() {
    const en = isEn();
    const st = deps.getState?.() || {};
    const tuning = deps.DB?.tunings?.find((x) => x.id === st.tuningId) || deps.DB?.tunings?.[0];
    const tuningShort = tuning?.name
      ? String(tuning.name).split("—")[0].split("(")[0].trim().slice(0, 18)
      : "Oud 6c";

    if (currentClarity === NECK_CLARITY_MODES.FREE) {
      return {
        title: en ? "Free Exploration · 24-TET" : "Exploração Livre · 24-TET",
        tuning: tuningShort
      };
    }

    const pools = {
      MAQAM: deps.DB?.maqamat || [],
      JINS: deps.DB?.ajnas || [],
      SCALE: deps.DB?.scales || [],
      CHORD: deps.DB?.chords || [],
      CADENCE: deps.DB?.cadences || []
    };
    const pool = pools[st.mode] || pools.MAQAM;
    const ent = pool.find((x) => x.id === st.entityId) || pool[0];
    const pcs = deps.getPitchClasses24?.() || [];
    const rootName = pcs[((Number(st.rootQ) || 0) % 24 + 24) % 24]?.flat || "C";
    const entName = ent?.name ? String(ent.name).replace(/^\[.*?\]\s*/, "") : "Maqam";
    return {
      title: `${entName} (${rootName})`,
      tuning: tuningShort
    };
  }

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
      <div class="sa-toolbar-group sa-a4-popover-wrap" role="group" aria-label="${en ? "Reference pitch A4" : "Diapasão A4"}">
        <button type="button" id="sa-btn-a4-toggle" class="sa-pill-btn ${a4PopoverOpen ? "is-active" : ""}" aria-expanded="${a4PopoverOpen ? "true" : "false"}">
          A4 · <span id="sa-a4-readout">${currentA4.toFixed(1).replace(/\.0$/, "")} Hz</span> ▾
        </button>
        <div id="sa-a4-popover" class="sa-a4-popover" ${a4PopoverOpen ? "" : "hidden"}>
          <div class="sa-a4-popover-title">${en ? "Concert Pitch (A4)" : "Diapasão Global (A4)"}</div>
          <div class="sa-a4-presets">${a4PresetsHtml}</div>
          <div class="sa-a4-slider-row">
            <input type="range" id="sa-a4-slider" class="sa-a4-slider" min="${MIN_A4_HZ}" max="${MAX_A4_HZ}" step="0.5" value="${currentA4}" aria-label="A4 Hz" />
            <strong id="sa-a4-pop-val">${currentA4.toFixed(1).replace(/\.0$/, "")} Hz</strong>
          </div>
        </div>
      </div>
      <div class="sa-toolbar-group">
        <button type="button" id="sa-btn-save-tuning" class="sa-pill-btn" title="${en ? "Save or manage custom Oud tunings" : "Salvar ou gerenciar afinações customizadas do Oud"}">
          ✦ ${en ? "Scordaturas" : "Afinações Salvas"}
        </button>
        <button type="button" id="sa-btn-palette" class="sa-mini-chip" title="${en ? "Quick Search (⌘K / /)" : "Busca Rápida (⌘K / /)"}">⌘K</button>
        <button type="button" id="sa-btn-shortcuts" class="sa-mini-chip" title="${en ? "Keyboard Shortcuts (?)" : "Atalhos de Teclado (?)"}">?</button>
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
        mountTierMicroLegend();
        syncFocusedStageLayout();
        window.setTimeout(syncFreeModeSummary, 25);
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
      const hzTxt = `${currentA4.toFixed(1).replace(/\.0$/, "")} Hz`;
      if (readout) readout.textContent = hzTxt;
      const popVal = document.getElementById("sa-a4-pop-val");
      if (popVal) popVal.textContent = hzTxt;
      liveFxCtrl?.renderInspectorStrip?.();
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
    const btnEarLab = document.getElementById("sa-btn-ear-trainer");
    if (btnEarLab) {
      btnEarLab.addEventListener("click", () => earCtrl?.openModal());
    }
    const btnExportSess = document.getElementById("sa-btn-export-sessions");
    if (btnExportSess) {
      btnExportSess.addEventListener("click", openExportAndSnapshotsModal);
    }
    const btnStageTrigger = document.getElementById("sa-stage-scale-trigger");
    if (btnStageTrigger) {
      btnStageTrigger.addEventListener("click", () => toggleControlsDrawer());
    }
    const btnStaffToggle = document.getElementById("sa-btn-staff-toggle");
    if (btnStaffToggle) {
      btnStaffToggle.addEventListener("click", () => {
        const currentlyVisible = document.body?.getAttribute("data-sa-staff-hidden") !== "true";
        staffUserOverride = !currentlyVisible;
        syncFocusedStageLayout();
        showToast(
          staffUserOverride
            ? (isEn() ? "24-TET Staff visible" : "Pauta 24-TET visível")
            : (isEn() ? "24-TET Staff hidden" : "Pauta 24-TET oculta"),
          { type: "info", durationMs: 1500 }
        );
      });
    }
    const btnPalette = document.getElementById("sa-btn-palette");
    if (btnPalette) {
      btnPalette.addEventListener("click", () => paletteCtrl?.openPalette());
    }
    const btnShortcuts = document.getElementById("sa-btn-shortcuts");
    if (btnShortcuts) {
      btnShortcuts.addEventListener("click", () => paletteCtrl?.openShortcutsModal());
    }
    const btnA4Toggle = document.getElementById("sa-btn-a4-toggle");
    const popA4 = document.getElementById("sa-a4-popover");
    if (btnA4Toggle && popA4) {
      btnA4Toggle.addEventListener("click", (ev) => {
        ev.stopPropagation();
        a4PopoverOpen = !a4PopoverOpen;
        popA4.hidden = !a4PopoverOpen;
        btnA4Toggle.classList.toggle("is-active", a4PopoverOpen);
        btnA4Toggle.setAttribute("aria-expanded", a4PopoverOpen ? "true" : "false");
      });
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

  function buildCurrentPlateMeta() {
    const lbl = getStageHeaderLabels();
    const st = deps.getState?.() || {};
    const tradMap = { damascus: "Damasco", cairo: "Cairo / Bagdá", istanbul: "Istambul" };
    const tradName = tradMap[st.tradition] || st.tradition || "Damasco";
    return {
      title: lbl.title,
      subtitle: `${lbl.tuning} · A4 = ${currentA4} Hz · ${tradName}`,
      footerNote: `App Oud Visualizer · ${new Date().toLocaleDateString(isEn() ? "en-US" : "pt-BR")}`,
      isLight: st.theme === "light"
    };
  }

  async function triggerExportPng() {
    try {
      const fname = await exportPlateAsPng(buildCurrentPlateMeta(), 2);
      showToast(isEn() ? `PNG exported: ${fname}` : `Prancha PNG (2×) salva: ${fname}`, { type: "success", icon: "📸" });
    } catch (err) {
      showToast(String(err?.message || err), { type: "error" });
    }
  }

  function triggerExportSvg() {
    try {
      const fname = exportPlateAsSvg(buildCurrentPlateMeta());
      showToast(isEn() ? `SVG exported: ${fname}` : `Prancha SVG salva: ${fname}`, { type: "success", icon: "📐" });
    } catch (err) {
      showToast(String(err?.message || err), { type: "error" });
    }
  }

  function openExportAndSnapshotsModal() {
    if (typeof document === "undefined") return;
    let modal = document.getElementById("sa-export-snapshots-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "sa-export-snapshots-modal";
      modal.className = "sa-modal-backdrop";
      document.body.appendChild(modal);
    }

    const renderBody = () => {
      const en = isEn();
      const lbl = getStageHeaderLabels();
      const snaps = loadSnapshots();

      const snapsHtml = snaps.length
        ? snaps
            .map(
              (s) => `
          <div class="sa-saved-tuning-row">
            <div>
              <strong>${s.name}</strong>
              <div class="sa-saved-tuning-sub">${s.state.mode} · A4 ${s.a4Hz} Hz · ${s.state.bpm} BPM</div>
            </div>
            <div class="sa-saved-tuning-actions">
              <button type="button" class="sa-mini-chip" data-sa-load-snap="${s.id}">${en ? "Load" : "Carregar"}</button>
              <button type="button" class="sa-mini-chip sa-danger-chip" data-sa-del-snap="${s.id}">✕</button>
            </div>
          </div>`
            )
            .join("")
        : `<p class="sa-empty-hint">${en ? "No saved session snapshots yet." : "Nenhum snapshot de sessão salvo ainda."}</p>`;

      modal.innerHTML = `
        <div class="sa-modal-card" role="dialog" aria-modal="true" aria-label="${en ? "Editorial Plates & Session Snapshots" : "Pranchas Didáticas & Snapshots de Sessão"}">
          <div class="sa-modal-header">
            <h3>📸 ${en ? "Editorial Plates & Session Snapshots" : "Pranchas Didáticas & Snapshots de Sessão"}</h3>
            <button type="button" id="sa-close-export-modal" class="sa-mini-chip">✕</button>
          </div>

          <div class="sa-modal-section">
            <div class="sa-toolbar-label">${en ? "Export Fingerboard Plate" : "Exportar Prancha do Braço"} · ${lbl.title}</div>
            <div class="sa-export-btn-row">
              <button type="button" id="sa-do-export-png" class="sa-pill-btn is-active">🖼 ${en ? "Download PNG (2× Retina)" : "Baixar PNG (2× Retina)"}</button>
              <button type="button" id="sa-do-export-svg" class="sa-pill-btn">📐 ${en ? "Download Vector SVG" : "Baixar SVG Vetorial"}</button>
            </div>
          </div>

          <div class="sa-modal-section">
            <div class="sa-toolbar-label">${en ? "Session Snapshots" : "Snapshots da Sessão Atual"}</div>
            <div class="sa-snap-create-row">
              <input type="text" id="sa-new-snap-name" placeholder="${en ? "e.g. Hijaz D · Aleppo Practice" : "ex.: Hijaz D · Estudo Alepo"}" maxlength="64" />
              <button type="button" id="sa-btn-save-snap" class="sa-pill-btn is-active">＋ ${en ? "Save" : "Salvar"}</button>
            </div>
            <div class="sa-saved-tuning-list">${snapsHtml}</div>
          </div>

          <div class="sa-modal-section">
            <div class="sa-toolbar-label">${en ? "Full Studio Backup (.json)" : "Backup Completo do Estúdio (.json)"}</div>
            <div class="sa-export-btn-row">
              <button type="button" id="sa-btn-backup-json" class="sa-pill-btn">⬇ ${en ? "Export Backup .json" : "Exportar Backup .json"}</button>
              <label class="sa-pill-btn sa-file-label">
                ⬆ ${en ? "Import .json" : "Importar .json"}
                <input type="file" id="sa-input-import-json" accept="application/json,.json" hidden />
              </label>
            </div>
          </div>
        </div>
      `;

      modal.querySelector("#sa-close-export-modal")?.addEventListener("click", () => modal.remove());
      modal.addEventListener("click", (ev) => {
        if (ev.target === modal) modal.remove();
      });

      modal.querySelector("#sa-do-export-png")?.addEventListener("click", triggerExportPng);
      modal.querySelector("#sa-do-export-svg")?.addEventListener("click", triggerExportSvg);

      modal.querySelector("#sa-btn-save-snap")?.addEventListener("click", () => {
        const inp = /** @type {HTMLInputElement | null} */ (modal.querySelector("#sa-new-snap-name"));
        const name = (inp?.value || "").trim() || lbl.title;
        saveSnapshot({
          name,
          state: deps.getState?.() || {},
          a4Hz: currentA4,
          clarityMode: currentClarity
        });
        showToast(en ? `Snapshot saved: ${name}` : `Snapshot salvo: ${name}`, { type: "success", icon: "💾" });
        renderBody();
      });

      modal.querySelectorAll("[data-sa-load-snap]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-sa-load-snap");
          const snap = loadSnapshots().find((x) => x.id === id);
          if (!snap) return;
          currentA4 = saveA4Hz(clampA4Hz(snap.a4Hz));
          deps.onA4Changed?.(currentA4);
          setClarityProgrammatically(snap.clarityMode || NECK_CLARITY_MODES.POSITION);
          deps.onRestoreSnapshotState?.(snap.state);
          showToast(en ? `Loaded: ${snap.name}` : `Sessão carregada: ${snap.name}`, { type: "success", icon: "✦" });
          modal.remove();
        });
      });

      modal.querySelectorAll("[data-sa-del-snap]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-sa-del-snap") || "";
          deleteSnapshot(id);
          showToast(en ? "Snapshot deleted" : "Snapshot removido", { type: "info" });
          renderBody();
        });
      });

      modal.querySelector("#sa-btn-backup-json")?.addEventListener("click", () => {
        const json = buildFullBackupJson();
        const blob = new Blob([json], { type: "application/json;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `oud-visualizer-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
        showToast(en ? "Backup JSON exported" : "Backup .json exportado!", { type: "success", icon: "⬇" });
      });

      modal.querySelector("#sa-input-import-json")?.addEventListener("change", async (ev) => {
        const file = /** @type {HTMLInputElement} */ (ev.target).files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const res = importFullBackupJson(text);
          if (deps.DB?.tunings) mergeCustomTuningsIntoDb(deps.DB.tunings);
          deps.onCustomTuningsChanged?.();
          showToast(
            en
              ? `Imported ${res.snapshotsImported} snapshots & ${res.tuningsImported} tunings`
              : `Importados: ${res.snapshotsImported} snapshots e ${res.tuningsImported} afinações`,
            { type: "success", icon: "⬆" }
          );
          renderBody();
        } catch {
          showToast(en ? "Invalid JSON backup file" : "Arquivo JSON inválido", { type: "error" });
        }
      });
    };

    renderBody();
  }

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


  /**
   * Monta uma micro-legenda contextual das 3 camadas visuais no rodapé do espelho.
   */
  function mountTierMicroLegend() {
    if (typeof document === "undefined") return;
    const host =
      document.querySelector(".neck-showcase") ||
      document.querySelector(".fretboard-panel") ||
      document.querySelector("main");
    if (!host) return;

    let leg = document.getElementById("sa-tier-micro-legend");
    if (!leg) {
      leg = document.createElement("div");
      leg.id = "sa-tier-micro-legend";
      leg.className = "sa-tier-micro-legend";
      host.appendChild(leg);
    }

    const en = isEn();
    if (currentClarity === NECK_CLARITY_MODES.FREE) {
      leg.innerHTML = `
        <span class="sa-legend-item"><i class="sa-dot sa-dot--free-semi"></i>${en ? "Free 24-TET · Semitones (click any note)" : "Livre 24-TET · Semitons (clique em qualquer nota)"}</span>
        <span class="sa-legend-item"><i class="sa-dot sa-dot--free-micro"></i>${en ? "Quarter-tones (50¢)" : "Quartos de tom (50¢)"}</span>
        <span class="sa-legend-item">${en ? "Pick a Maqam/Lesson or click Position to map a mode" : "Escolha um Maqam/Lição ou clique em Posição para mapear um modo"}</span>
      `;
      return;
    }
    const showGhostItem = currentClarity === NECK_CLARITY_MODES.POSITION;
    leg.innerHTML = `
      <span class="sa-legend-item"><i class="sa-dot sa-dot--t1"></i>${en ? "Tier 1 · Qarar (Root)" : "Nível 1 · Qarar (Tônica)"}</span>
      <span class="sa-legend-item"><i class="sa-dot sa-dot--t2"></i>${en ? "Tier 2 · Ghammaz / Microtone" : "Nível 2 · Ghammaz / Microtom"}</span>
      <span class="sa-legend-item"><i class="sa-dot sa-dot--t3"></i>${en ? "Tier 3 · Scale Degrees" : "Nível 3 · Demais Graus"}</span>
      ${showGhostItem ? `<span class="sa-legend-item"><i class="sa-dot sa-dot--ghost"></i>${en ? "Outside Position" : "Fora da Posição"}</span>` : ""}
    `;
  }


  /**
   * Enquanto estiver no Modo Livre (FREE), exibe rótulos neutros ("Livre · 24-TET")
   * na Barra de Comando, Deck e Zen HUD para não parecer que Maqam Rast C está selecionado.
   */
  function syncFreeModeSummary() {
    if (typeof document === "undefined") return;
    if (currentClarity !== NECK_CLARITY_MODES.FREE) return;
    const en = isEn();
    const shortFree = en ? "Free · 24-TET" : "Livre · 24-TET";
    const fullFree = en ? "Free Exploration • 24-TET" : "Exploração Livre • 24-TET";

    const v1 = document.getElementById("cmd-val-1");
    if (v1) v1.textContent = shortFree;

    const v2 = document.getElementById("cmd-val-2");
    if (v2) v2.textContent = en ? "Clean • 24-TET" : "Livre • 24-TET";

    const deckStatus = document.getElementById("deck-mini-status");
    if (deckStatus) deckStatus.textContent = fullFree;

    const zenEntity = document.getElementById("zen-badge-entity");
    if (zenEntity) zenEntity.textContent = fullFree;
  }

  /**
   * Sai automaticamente do Modo Livre para "Posição" quando o usuário escolhe
   * explicitamente um Maqam, Jins, Escala, Acorde, Modulação ou Lição do Guia.
   */
  function bindAutoExitFreeMode() {
    if (typeof document === "undefined" || document.body?.dataset.saAutoExitBound === "1") return;
    if (document.body) document.body.dataset.saAutoExitBound = "1";

    const exitToPosition = () => {
      if (currentClarity !== NECK_CLARITY_MODES.FREE) return;
      currentClarity = saveNeckClarityMode(NECK_CLARITY_MODES.POSITION);
      applyClarityToDom(currentClarity);
      mountStageClarityBar();
      mountTierMicroLegend();
      if (typeof deps.onClarityChanged === "function") {
        deps.onClarityChanged(currentClarity);
      }
    };

    document.addEventListener("change", (ev) => {
      const target = /** @type {HTMLElement | null} */ (ev.target);
      if (!target) return;
      if (target.id === "select-entity" || target.id === "select-root") {
        window.setTimeout(exitToPosition, 0);
      }
    });

    document.addEventListener("click", (ev) => {
      const target = /** @type {HTMLElement | null} */ (ev.target);
      if (!target) return;
      if (
        target.closest(".tab-btn") ||
        target.closest(".btn-apply-mod") ||
        target.closest(".study-apply-btn") ||
        target.closest("[data-lesson-apply]") ||
        target.closest("#btn-play-taqsim") ||
        target.closest("#btn-set-root-from-selection") ||
        target.closest("#btn-dock-set-tonic")
      ) {
        window.setTimeout(exitToPosition, 0);
      }
    });
  }


  function setClarityProgrammatically(nextMode) {
    currentClarity = saveNeckClarityMode(nextMode);
    applyClarityToDom(currentClarity);
    if (typeof deps.onClarityChanged === "function") {
      deps.onClarityChanged(currentClarity);
    }
    mountStageClarityBar();
    mountTierMicroLegend();
    window.setTimeout(syncFreeModeSummary, 25);
  }


  earCtrl = createEarTrainerController({
    getState: deps.getState,
    getPitchClasses24: deps.getPitchClasses24,
    playFreq: (freqHz, durSec = 0.8) => deps.onPlayFreq?.(freqHz, durSec)
  });

  paletteCtrl = createCommandPaletteController({
    getState: deps.getState,
    DB: deps.DB,
    getAllStudyLessons: deps.getAllStudyLessons,
    getGlossaryEntries: deps.getGlossaryEntries,
    onApplyEntity: (mode, entityId) => {
      if (currentClarity === NECK_CLARITY_MODES.FREE) {
        currentClarity = saveNeckClarityMode(NECK_CLARITY_MODES.POSITION);
        applyClarityToDom(currentClarity);
      }
      deps.onApplyEntity?.(mode, entityId);
      mountStageClarityBar();
      mountTierMicroLegend();
    },
    onApplyTuning: (tuningId) => deps.onApplyTuning?.(tuningId),
    onApplyIqa: (iqaId) => deps.onApplyIqa?.(iqaId),
    onApplyLesson: (lessonId) => {
      if (currentClarity === NECK_CLARITY_MODES.FREE) {
        currentClarity = saveNeckClarityMode(NECK_CLARITY_MODES.POSITION);
        applyClarityToDom(currentClarity);
      }
      deps.onApplyLesson?.(lessonId);
      mountStageClarityBar();
      mountTierMicroLegend();
    },
    onOpenGlossary: (q) => deps.onOpenGlossary?.(q),
    onSetClarity: (mode) => {
      setClarityProgrammatically(mode);
      showToast(isEn() ? `Clarity: ${mode}` : `Clareza: ${mode}`, { type: "info", durationMs: 1600 });
    },
    onOpenCustomTunings: openCustomTuningsDrawer,
    onOpenExportSnapshots: openExportAndSnapshotsModal,
    onOpenEarTrainer: () => earCtrl?.openModal(),
    onExportPng: triggerExportPng,
    onExportSvg: triggerExportSvg,
    onPanicStopAll: deps.onPanicStopAll,
    onToggleDrone: deps.onToggleDrone,
    onToggleIqa: deps.onToggleIqa,
    onToggleMic: deps.onToggleMic,
    onPlayActive: deps.onPlayActive,
    onToggleTheme: deps.onToggleTheme,
    onToggleTimbre: deps.onToggleTimbre,
    onToggleZen: deps.onToggleZen,
    getAudioActivity: deps.getAudioActivity
  });


  function bindNativeToastsAndFocusStage() {
    if (typeof document === "undefined" || document.body?.dataset.saUxBound === "1") return;
    if (document.body) document.body.dataset.saUxBound = "1";

    document.addEventListener("click", (ev) => {
      const target = /** @type {HTMLElement | null} */ (ev.target);
      if (a4PopoverOpen && !target?.closest?.(".sa-a4-popover-wrap")) {
        a4PopoverOpen = false;
        const pop = document.getElementById("sa-a4-popover");
        const btn = document.getElementById("sa-btn-a4-toggle");
        if (pop) pop.hidden = true;
        if (btn) {
          btn.classList.remove("is-active");
          btn.setAttribute("aria-expanded", "false");
        }
      }

      if (!target) return;
      if (target.closest("#btn-share") || target.closest("#btn-copy-link")) {
        showToast(isEn() ? "Study link copied to clipboard" : "Link do estudo copiado!", { type: "success", icon: "🔗" });
      } else if (target.closest("#btn-toggle-timbre")) {
        window.setTimeout(() => {
          showToast(isEn() ? "Oud tone profile switched" : "Timbre do Oud alternado (Sírio / Egípcio)", { type: "info", icon: "🎻", durationMs: 2000 });
        }, 40);
      } else if (target.closest("#btn-theme-toggle") || target.closest("#btn-toggle-theme")) {
        window.setTimeout(() => {
          const isL = deps.getState?.()?.theme === "light";
          showToast(isL ? "Nahar · Pergaminho" : "Layl · Modo Escuro", { type: "info", icon: "🌗", durationMs: 1800 });
        }, 40);
      } else if (target.closest(".study-apply-btn") || target.closest("[data-lesson-apply]")) {
        showToast(isEn() ? "Lesson preset applied to Oud" : "Preset da lição aplicado no Oud", { type: "success", icon: "🎓", durationMs: 2000 });
      }
    });

    // Foco inicial limpo (String Atlas v8.9): recolhe o Deck inferior ao abrir em Modo Livre
    if (currentClarity === NECK_CLARITY_MODES.FREE) {
      window.setTimeout(() => {
        const collapseBtn = document.getElementById("btn-deck-collapse");
        if (collapseBtn && collapseBtn.getAttribute("aria-expanded") === "true") {
          collapseBtn.click();
        }
      }, 90);
    }
  }

  liveFxCtrl = createLiveNeckFxController({
    getState: deps.getState,
    getPitchClasses24: deps.getPitchClasses24,
    getA4Hz: () => currentA4,
    onPlayFreq: (freq) => deps.onPlayFreq?.(freq),
    onMakeRoot: (info) => {
      if (currentClarity === NECK_CLARITY_MODES.FREE) {
        currentClarity = saveNeckClarityMode(NECK_CLARITY_MODES.POSITION);
        applyClarityToDom(currentClarity);
        mountStageClarityBar();
        mountTierMicroLegend();
      }
      deps.onMakeRootFromInspector?.(info);
      showToast(isEn() ? "New Qarar (Root) set" : "Nova Tônica (Qarar) definida", { type: "success", icon: "🎯", durationMs: 1800 });
    },
    onClearSelection: () => deps.onClearSelection?.()
  });

  mountHeaderControlsButton();
  mountStageClarityBar();
  mountTierMicroLegend();
  syncFocusedStageLayout();
  ensureTunerAddonBar();
  liveFxCtrl?.renderInspectorStrip?.();
  bindNativeToastsAndFocusStage();
  bindAutoExitFreeMode();
  window.setTimeout(syncFreeModeSummary, 40);

  return {
    getA4Hz: () => currentA4,
    getClarityMode: () => currentClarity,
    isStrobeEnabled: () => strobeEnabled,
    updateLiveTelemetry,
    clearTrail: () => {
      trail.clear();
      renderTrailChips(document.getElementById("sa-note-trail"), []);
    },
    syncFreeModeSummary,
    refreshUi: () => {
      mountStageClarityBar();
      mountTierMicroLegend();
      ensureTunerAddonBar();
      mountHeaderControlsButton();
      mountStageClarityBar();
      syncFocusedStageLayout();
      syncFreeModeSummary();
      liveFxCtrl?.renderInspectorStrip?.();
    },
    showToast
  };
}
