// @ts-check
/**
 * Paleta de Comandos (⌘K / Ctrl+K / /), Modal de Atalhos (?) e
 * Mini-Dock Global de Transporte de Áudio (Esc = Parar Tudo / Panic)
 * Migrado dos conceitos do String Atlas v7.8–v8.10 para o App Oud Visualizer (v3.10.0).
 */

import { showToast } from "./toastView.js";

function foldText(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Cria e conecta a Paleta de Comandos (⌘K), Modal de Atalhos (?) e Mini-Dock de Áudio.
 * @param {any} deps
 */
export function createCommandPaletteController(deps) {
  let paletteOpen = false;
  let shortcutsOpen = false;
  let activeIndex = 0;
  /** @type {any[]} */
  let filteredCommands = [];
  /** @type {number | null} */
  let dockPollTimer = null;

  const isEn = () => deps.getState?.()?.lang === "en";

  function isEditableTarget(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }

  function buildCommandCatalog() {
    const en = isEn();
    const DB = deps.DB || {};
    /** @type {any[]} */
    const list = [];

    const catAct = en ? "Studio Actions" : "Ações do Estúdio";
    list.push(
      {
        id: "act_stop_all",
        category: catAct,
        icon: "⏹",
        title: en ? "Stop All Audio (Panic)" : "Parar Todo Áudio (Panic)",
        subtitle: "Esc",
        keywords: "stop parar silencio mute panic drone iqa",
        run: () => triggerPanicStop()
      },
      {
        id: "act_toggle_drone",
        category: catAct,
        icon: "🔊",
        title: en ? "Toggle Drone (Qarar)" : "Alternar Drone (Qarar)",
        subtitle: "D",
        keywords: "drone pedal qarar tonica",
        run: () => deps.onToggleDrone?.()
      },
      {
        id: "act_toggle_iqa",
        category: catAct,
        icon: "🥁",
        title: en ? "Start / Stop Rhythm (Iqa')" : "Ligar / Parar Ritmo (Iqa')",
        subtitle: "R",
        keywords: "ritmo iqa darbuka riq percussion",
        run: () => deps.onToggleIqa?.()
      },
      {
        id: "act_toggle_mic",
        category: catAct,
        icon: "🎙",
        title: en ? "Toggle Live Mic / Line Tuner" : "Ligar / Parar Mic / Linha (Afinador)",
        subtitle: "L",
        keywords: "mic microfone linha di interface afinador tuner strobe estrobo",
        run: () => deps.onToggleMic?.()
      },
      {
        id: "act_toggle_theme",
        category: catAct,
        icon: "🌗",
        title: en ? "Switch Theme (Layl Dark / Nahar Light)" : "Alternar Tema (Layl Escuro / Nahar Claro)",
        subtitle: "Layl ↔ Nahar",
        keywords: "tema claro escuro dark light layl nahar pergaminho",
        run: () => deps.onToggleTheme?.()
      },
      {
        id: "act_toggle_timbre",
        category: catAct,
        icon: "🎻",
        title: en ? "Switch Oud Tone (Syrian / Egyptian)" : "Alternar Timbre do Oud (Sírio / Egípcio)",
        subtitle: en ? "Dry vs. Warm" : "Seco vs. Encorpado",
        keywords: "timbre som sirio egipcio syrian egyptian karplus",
        run: () => deps.onToggleTimbre?.()
      },
      {
        id: "act_toggle_zen",
        category: catAct,
        icon: "🪷",
        title: en ? "Toggle Immersive Mode (Zen Stage)" : "Alternar Modo Imersivo (Zen Stage)",
        subtitle: "F",
        keywords: "zen imersivo palco fullscreen foco",
        run: () => deps.onToggleZen?.()
      },
      {
        id: "act_export_png",
        category: catAct,
        icon: "🖼",
        title: en ? "Export Fingerboard Plate (PNG 2× Retina)" : "Exportar Prancha do Braço (PNG 2× Retina)",
        subtitle: "PNG 2×",
        keywords: "exportar prancha imagem png foto download",
        run: () => deps.onExportPng?.()
      },
      {
        id: "act_export_svg",
        category: catAct,
        icon: "📐",
        title: en ? "Export Fingerboard Plate (Vector SVG)" : "Exportar Prancha do Braço (SVG Vetorial)",
        subtitle: "SVG",
        keywords: "exportar prancha vetor svg download",
        run: () => deps.onExportSvg?.()
      },
      {
        id: "act_snapshots",
        category: catAct,
        icon: "💾",
        title: en ? "Session Snapshots & JSON Backup" : "Snapshots de Sessão & Backup .json",
        subtitle: "JSON",
        keywords: "snapshot sessao backup json salvar restaurar",
        run: () => deps.onOpenExportSnapshots?.()
      },
      {
        id: "act_ear_trainer",
        category: catAct,
        icon: "🎧",
        title: en ? "Open 24-TET Ear Training Lab" : "Abrir Treinador Auditivo 24-TET",
        subtitle: "b3 · 3- · 3 · Ajnas",
        keywords: "ear ouvido treino auditivo terca neutra sikah bayati hijaz rast",
        run: () => deps.onOpenEarTrainer?.()
      },
      {
        id: "act_custom_tunings",
        category: catAct,
        icon: "✦",
        title: en ? "Manage Saved Custom Tunings (Scordaturas)" : "Gerenciar Afinações Customizadas Salvas",
        subtitle: "6 ordens · 24-TET",
        keywords: "scordatura afinacao custom salvar tuning",
        run: () => deps.onOpenCustomTunings?.()
      },
      {
        id: "act_clarity_free",
        category: catAct,
        icon: "◎",
        title: en ? "Clarity: Free Exploration (24-TET Chromatic)" : "Clareza: Modo Livre (24-TET Cromático)",
        subtitle: en ? "Clean fingerboard" : "Espelho limpo clicável",
        keywords: "clareza livre free clean cromatico",
        run: () => deps.onSetClarity?.("FREE")
      },
      {
        id: "act_clarity_pos",
        category: catAct,
        icon: "◎",
        title: en ? "Clarity: Active Position (3-Tier Hierarchy)" : "Clareza: Posição Ativa (Hierarquia 3 Camadas)",
        subtitle: en ? "Focused window + ghost dots" : "Janela focada + pontos-fantasma",
        keywords: "clareza posicao position janela",
        run: () => deps.onSetClarity?.("POSITION")
      },
      {
        id: "act_clarity_oct",
        category: catAct,
        icon: "◎",
        title: en ? "Clarity: 1st Octave (0–12q)" : "Clareza: 1ª Oitava (0–12q)",
        subtitle: "0–12q",
        keywords: "clareza oitava octave 12",
        run: () => deps.onSetClarity?.("FIRST_OCTAVE")
      },
      {
        id: "act_clarity_full",
        category: catAct,
        icon: "◎",
        title: en ? "Clarity: Full Neck (Jawab)" : "Clareza: Espelho Todo (Jawab)",
        subtitle: "0–24q",
        keywords: "clareza completo full neck espelho todo",
        run: () => deps.onSetClarity?.("FULL_NECK")
      },
      {
        id: "act_shortcuts",
        category: catAct,
        icon: "⌨",
        title: en ? "Open Keyboard Shortcuts Guide" : "Abrir Guia de Atalhos de Teclado",
        subtitle: "?",
        keywords: "atalhos shortcuts teclado ajuda help",
        run: () => openShortcutsModal()
      }
    );

    (DB.maqamat || []).forEach((m) => {
      list.push({
        id: `maqam_${m.id}`,
        category: "Maqam",
        icon: "🎼",
        title: m.name,
        subtitle: m.lower_jins ? `${m.lower_jins}` : "Maqam 24-TET",
        keywords: `maqam ${m.id} ${m.lower_jins || ""} ${m.description || ""}`,
        run: () => deps.onApplyEntity?.("MAQAM", m.id)
      });
    });

    (DB.ajnas || []).forEach((j) => {
      list.push({
        id: `jins_${j.id}`,
        category: "Jins",
        icon: "🧩",
        title: j.name,
        subtitle: "Jins 24-TET",
        keywords: `jins ajnas ${j.id} ${j.description || ""}`,
        run: () => deps.onApplyEntity?.("JINS", j.id)
      });
    });

    (DB.scales || []).forEach((s) => {
      list.push({
        id: `scale_${s.id}`,
        category: en ? "Scales & Modes" : "Escalas & Modos",
        icon: "🌐",
        title: s.name,
        subtitle: s.bridge_text || "Scale",
        keywords: `escala scale modo mode ${s.id} ${s.bridge_text || ""} ${s.description || ""}`,
        run: () => deps.onApplyEntity?.("SCALE", s.id)
      });
    });

    (DB.chords || []).forEach((c) => {
      list.push({
        id: `chord_${c.id}`,
        category: en ? "Chords" : "Acordes",
        icon: "◈",
        title: c.name,
        subtitle: c.short_symbol ? `(${c.short_symbol})` : "Voicing",
        keywords: `acorde chord voicing ${c.id} ${c.description || ""}`,
        run: () => deps.onApplyEntity?.("CHORD", c.id)
      });
    });

    (DB.tunings || []).forEach((tu) => {
      const courseStr = Array.isArray(tu.courses)
        ? tu.courses.map((c) => c.label).join("–")
        : "";
      list.push({
        id: `tuning_${tu.id}`,
        category: en ? "Tunings (Mizan)" : "Afinações (Mizan)",
        icon: tu.isCustom ? "✦" : "🪕",
        title: tu.name,
        subtitle: courseStr,
        keywords: `afinacao tuning mizan scordatura ${tu.id} ${courseStr}`,
        run: () => deps.onApplyTuning?.(tu.id)
      });
    });

    (DB.iqaat || []).forEach((iq) => {
      list.push({
        id: `iqa_${iq.id}`,
        category: en ? "Rhythms (Iqa'at)" : "Ritmos (Iqa'at)",
        icon: "🥁",
        title: iq.name,
        subtitle: iq.default_bpm ? `${iq.default_bpm} BPM` : "Iqa'",
        keywords: `ritmo iqa iqaat groove ${iq.id}`,
        run: () => deps.onApplyIqa?.(iq.id)
      });
    });

    const lessons = typeof deps.getAllStudyLessons === "function" ? deps.getAllStudyLessons() : [];
    lessons.forEach((les, idx) => {
      const title = en ? (les.title_en || les.title || les.id) : (les.title || les.id);
      const sub = en
        ? `Lesson ${idx + 1}${les.level ? ` · ${les.level}` : ""}`
        : `Lição ${idx + 1}${les.level ? ` · ${les.level}` : ""}`;
      list.push({
        id: `lesson_${les.id}`,
        category: en ? "Study Guide" : "Guia de Estudos",
        icon: "🎓",
        title,
        subtitle: sub,
        keywords: `licao lesson aula estudo capitulo ${idx + 1} ${les.id} ${les.summary || ""}`,
        run: () => deps.onApplyLesson?.(les.id)
      });
    });

    const glossary = typeof deps.getGlossaryEntries === "function" ? deps.getGlossaryEntries() : [];
    glossary.forEach((g) => {
      const term = en ? (g.term_en || g.term || "") : (g.term || "");
      list.push({
        id: `gloss_${g.id || term}`,
        category: en ? "Glossary" : "Glossário",
        icon: "📖",
        title: term,
        subtitle: g.arabic || g.category || "Al-Mu'jam",
        keywords: `glossario glossary termo ${term} ${g.arabic || ""} ${g.category || ""}`,
        run: () => deps.onOpenGlossary?.(term)
      });
    });

    return list;
  }

  function triggerPanicStop() {
    deps.onPanicStopAll?.();
    updateAudioTransportDock();
    showToast(
      isEn() ? "All audio stopped (Esc)" : "Todo áudio interrompido (Esc)",
      { type: "info", icon: "⏹", durationMs: 1800 }
    );
  }

  function openPalette() {
    if (typeof document === "undefined") return;
    closeShortcutsModal();
    paletteOpen = true;
    activeIndex = 0;

    let root = document.getElementById("sa-command-palette-modal");
    if (!root) {
      root = document.createElement("div");
      root.id = "sa-command-palette-modal";
      root.className = "sa-modal-backdrop sa-palette-backdrop";
      document.body.appendChild(root);
    }

    const en = isEn();
    root.innerHTML = `
      <div class="sa-palette-card" role="dialog" aria-modal="true" aria-label="${en ? "Command Palette" : "Paleta de Comandos"}">
        <div class="sa-palette-input-row">
          <span class="sa-palette-search-icon" aria-hidden="true">⌘</span>
          <input
            type="text"
            id="sa-palette-input"
            class="sa-palette-input"
            placeholder="${en ? "Search Maqam, Jins, tuning, lesson, rhythm, glossary or action..." : "Buscar Maqam, Jins, afinação, lição, ritmo, glossário ou ação..."}"
            autocomplete="off"
            spellcheck="false"
          />
          <kbd class="sa-kbd">Esc</kbd>
        </div>
        <div id="sa-palette-results" class="sa-palette-results" role="listbox"></div>
        <div class="sa-palette-footer">
          <span><kbd class="sa-kbd">↑↓</kbd> ${en ? "navigate" : "navegar"}</span>
          <span><kbd class="sa-kbd">↵</kbd> ${en ? "run" : "aplicar"}</span>
          <span><kbd class="sa-kbd">?</kbd> ${en ? "shortcuts" : "atalhos"}</span>
        </div>
      </div>
    `;

    root.addEventListener("click", (ev) => {
      if (ev.target === root) closePalette();
    });

    const input = /** @type {HTMLInputElement | null} */ (document.getElementById("sa-palette-input"));
    const allCommands = buildCommandCatalog();

    const highlightActiveItem = () => {
      const resultsEl = document.getElementById("sa-palette-results");
      if (!resultsEl) return;
      resultsEl.querySelectorAll("[data-pal-idx]").forEach((el) => {
        const idx = Number(el.getAttribute("data-pal-idx"));
        const isSel = idx === activeIndex;
        el.classList.toggle("is-selected", isSel);
        el.setAttribute("aria-selected", isSel ? "true" : "false");
        if (isSel) el.scrollIntoView({ block: "nearest" });
      });
    };

    const executeCommandAt = (idx) => {
      const cmd = filteredCommands[idx];
      if (!cmd) return;
      closePalette();
      cmd.run();
    };

    const renderList = (queryText) => {
      const q = foldText(queryText);
      const tokens = q ? q.split(/\s+/).filter(Boolean) : [];
      filteredCommands = tokens.length
        ? allCommands.filter((cmd) => {
            const hay = foldText(`${cmd.category} ${cmd.title} ${cmd.subtitle || ""} ${cmd.keywords || ""}`);
            return tokens.every((tok) => hay.includes(tok));
          })
        : allCommands.slice(0, 42);

      filteredCommands = filteredCommands.slice(0, 50);
      if (activeIndex >= filteredCommands.length) activeIndex = 0;

      const resultsEl = document.getElementById("sa-palette-results");
      if (!resultsEl) return;

      if (!filteredCommands.length) {
        resultsEl.innerHTML = `<div class="sa-palette-empty">${en ? "No matching commands found." : "Nenhum resultado encontrado."}</div>`;
        return;
      }

      resultsEl.innerHTML = filteredCommands
        .map((cmd, idx) => {
          const selected = idx === activeIndex ? "is-selected" : "";
          return `
            <button type="button" class="sa-palette-item ${selected}" data-pal-idx="${idx}" role="option" aria-selected="${idx === activeIndex ? "true" : "false"}">
              <span class="sa-palette-item__icon" aria-hidden="true">${cmd.icon}</span>
              <span class="sa-palette-item__main">
                <span class="sa-palette-item__title">${escHtml(cmd.title)}</span>
                ${cmd.subtitle ? `<span class="sa-palette-item__sub">${escHtml(cmd.subtitle)}</span>` : ""}
              </span>
              <span class="sa-palette-item__cat">${escHtml(cmd.category)}</span>
            </button>
          `;
        })
        .join("");

      resultsEl.querySelectorAll("[data-pal-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          executeCommandAt(Number(btn.getAttribute("data-pal-idx")));
        });
        btn.addEventListener("mouseenter", () => {
          const idx = Number(btn.getAttribute("data-pal-idx"));
          if (Number.isFinite(idx) && idx !== activeIndex) {
            activeIndex = idx;
            highlightActiveItem();
          }
        });
      });
    };

    if (input) {
      input.addEventListener("input", () => {
        activeIndex = 0;
        renderList(input.value);
      });
      input.addEventListener("keydown", (ev) => {
        if (ev.key === "ArrowDown") {
          ev.preventDefault();
          if (filteredCommands.length) {
            activeIndex = (activeIndex + 1) % filteredCommands.length;
            highlightActiveItem();
          }
        } else if (ev.key === "ArrowUp") {
          ev.preventDefault();
          if (filteredCommands.length) {
            activeIndex = (activeIndex - 1 + filteredCommands.length) % filteredCommands.length;
            highlightActiveItem();
          }
        } else if (ev.key === "Enter") {
          ev.preventDefault();
          executeCommandAt(activeIndex);
        } else if (ev.key === "Escape") {
          ev.preventDefault();
          ev.stopPropagation();
          closePalette();
        }
      });
      renderList("");
      window.requestAnimationFrame(() => input.focus());
    }
  }

  function closePalette() {
    paletteOpen = false;
    document.getElementById("sa-command-palette-modal")?.remove();
  }

  function openShortcutsModal() {
    if (typeof document === "undefined") return;
    closePalette();
    shortcutsOpen = true;

    let modal = document.getElementById("sa-shortcuts-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "sa-shortcuts-modal";
      modal.className = "sa-modal-backdrop";
      document.body.appendChild(modal);
    }

    const en = isEn();
    const rows = [
      ["⌘K / Ctrl+K / /", en ? "Open Command Palette (search everything)" : "Abrir Paleta de Comandos (busca rápida)"],
      ["?", en ? "Open / Close Keyboard Shortcuts" : "Abrir / Fechar Guia de Atalhos"],
      ["Esc", en ? "Close modal or Stop All Audio (Panic)" : "Fechar modal ou Parar Todo Áudio (Panic)"],
      ["Space", en ? "Play active scale / structure" : "Tocar escala / estrutura ativa"],
      ["D", en ? "Toggle Drone (Qarar)" : "Alternar Drone (Qarar)"],
      ["R", en ? "Start / Stop Rhythm (Iqa')" : "Ligar / Parar Ritmo (Iqa')"],
      ["L", en ? "Toggle Live Mic / Line Tuner" : "Ligar / Parar Escuta Mic / Linha"],
      ["F", en ? "Toggle Immersive Mode (Zen Stage)" : "Alternar Modo Imersivo (Zen Stage)"],
      [en ? "Double-click note" : "Duplo clique na nota", en ? "Set Qarar (Root) + 1-Octave Path" : "Definir Tônica (Qarar) + Caminho de 1 Oitava"]
    ];

    const rowsHtml = rows
      .map(
        ([k, desc]) => `
        <div class="sa-shortcut-row">
          <kbd class="sa-kbd sa-kbd--wide">${escHtml(k)}</kbd>
          <span>${escHtml(desc)}</span>
        </div>`
      )
      .join("");

    modal.innerHTML = `
      <div class="sa-modal-card sa-shortcuts-card" role="dialog" aria-modal="true" aria-label="${en ? "Keyboard Shortcuts" : "Atalhos de Teclado"}">
        <div class="sa-modal-header">
          <h3>⌨ ${en ? "Studio Keyboard Shortcuts" : "Atalhos de Teclado do Estúdio"}</h3>
          <button type="button" id="sa-close-shortcuts" class="sa-mini-chip">✕</button>
        </div>
        <div class="sa-shortcuts-list">${rowsHtml}</div>
      </div>
    `;

    modal.querySelector("#sa-close-shortcuts")?.addEventListener("click", closeShortcutsModal);
    modal.addEventListener("click", (ev) => {
      if (ev.target === modal) closeShortcutsModal();
    });
  }

  function closeShortcutsModal() {
    shortcutsOpen = false;
    document.getElementById("sa-shortcuts-modal")?.remove();
  }

  function updateAudioTransportDock() {
    if (typeof document === "undefined" || !document.body) return;
    const act = deps.getAudioActivity?.() || { drone: false, iqa: false, mic: false };
    const hasAny = Boolean(act.drone || act.iqa || act.mic);

    let dock = document.getElementById("sa-audio-transport-dock");
    if (!hasAny) {
      if (dock) dock.hidden = true;
      return;
    }

    if (!dock) {
      dock = document.createElement("div");
      dock.id = "sa-audio-transport-dock";
      dock.className = "sa-audio-dock";
      dock.setAttribute("role", "region");
      dock.setAttribute("aria-label", isEn() ? "Active audio transport" : "Transporte de áudio ativo");
      document.body.appendChild(dock);
    }

    const en = isEn();
    const badges = [];
    if (act.drone) {
      badges.push(`<button type="button" class="sa-dock-pill is-on" data-dock-act="drone">🔊 Drone</button>`);
    }
    if (act.iqa) {
      badges.push(`<button type="button" class="sa-dock-pill is-on" data-dock-act="iqa">🥁 Iqa'</button>`);
    }
    if (act.mic) {
      badges.push(`<button type="button" class="sa-dock-pill is-live" data-dock-act="mic">● ${en ? "Live" : "Escuta"}</button>`);
    }

    dock.hidden = false;
    dock.innerHTML = `
      <div class="sa-dock-pills">${badges.join("")}</div>
      <button type="button" class="sa-dock-panic" id="sa-dock-panic-btn" title="Esc">
        ⏹ ${en ? "Stop All" : "Parar Tudo"} <kbd class="sa-kbd">Esc</kbd>
      </button>
    `;

    dock.querySelector("[data-dock-act='drone']")?.addEventListener("click", () => {
      deps.onToggleDrone?.();
      window.setTimeout(updateAudioTransportDock, 40);
    });
    dock.querySelector("[data-dock-act='iqa']")?.addEventListener("click", () => {
      deps.onToggleIqa?.();
      window.setTimeout(updateAudioTransportDock, 40);
    });
    dock.querySelector("[data-dock-act='mic']")?.addEventListener("click", () => {
      deps.onToggleMic?.();
      window.setTimeout(updateAudioTransportDock, 70);
    });
    dock.querySelector("#sa-dock-panic-btn")?.addEventListener("click", triggerPanicStop);
  }

  function bindGlobalShortcuts() {
    if (typeof document === "undefined" || document.body?.dataset.saShortcutsBound === "1") return;
    if (document.body) document.body.dataset.saShortcutsBound = "1";

    document.addEventListener("keydown", (ev) => {
      const key = ev.key;
      const lower = key.toLowerCase();

      if ((ev.metaKey || ev.ctrlKey) && lower === "k") {
        ev.preventDefault();
        if (paletteOpen) closePalette();
        else openPalette();
        return;
      }

      if (key === "Escape") {
        if (paletteOpen) {
          ev.preventDefault();
          closePalette();
          return;
        }
        if (shortcutsOpen) {
          ev.preventDefault();
          closeShortcutsModal();
          return;
        }
        const earModal = document.getElementById("sa-ear-trainer-modal");
        if (earModal) {
          ev.preventDefault();
          earModal.remove();
          return;
        }
        const exportModal = document.getElementById("sa-export-snapshots-modal");
        if (exportModal) {
          ev.preventDefault();
          exportModal.remove();
          return;
        }
        const customModal = document.getElementById("sa-custom-tunings-modal");
        if (customModal) {
          ev.preventDefault();
          customModal.remove();
          return;
        }
        const act = deps.getAudioActivity?.() || { drone: false, iqa: false, mic: false };
        if (act.drone || act.iqa || act.mic) {
          triggerPanicStop();
        }
        return;
      }

      if (isEditableTarget(ev.target) || ev.metaKey || ev.ctrlKey || ev.altKey) {
        return;
      }

      if (key === "/") {
        ev.preventDefault();
        openPalette();
        return;
      }

      if (key === "?") {
        ev.preventDefault();
        if (shortcutsOpen) closeShortcutsModal();
        else openShortcutsModal();
        return;
      }

      if (paletteOpen || shortcutsOpen) return;

      if (key === " ") {
        if (ev.target instanceof HTMLElement && ev.target.tagName === "BUTTON") return;
        ev.preventDefault();
        deps.onPlayActive?.();
      } else if (lower === "d") {
        ev.preventDefault();
        deps.onToggleDrone?.();
        window.setTimeout(updateAudioTransportDock, 40);
      } else if (lower === "r") {
        ev.preventDefault();
        deps.onToggleIqa?.();
        window.setTimeout(updateAudioTransportDock, 40);
      } else if (lower === "l") {
        ev.preventDefault();
        deps.onToggleMic?.();
        window.setTimeout(updateAudioTransportDock, 80);
      }
    });
  }

  bindGlobalShortcuts();
  updateAudioTransportDock();

  if (typeof window !== "undefined") {
    dockPollTimer = window.setInterval(updateAudioTransportDock, 600);
  }

  return {
    openPalette,
    closePalette,
    openShortcutsModal,
    closeShortcutsModal,
    triggerPanicStop,
    updateAudioTransportDock,
    destroy: () => {
      if (dockPollTimer !== null) window.clearInterval(dockPollTimer);
    }
  };
}
