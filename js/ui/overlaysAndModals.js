// @ts-check

/**
 * Cria controlador de menus, popovers, loupe de toque e gaveta de glossário.
 * @param {any} deps
 */
export function createOverlaysAndModals(deps) {
  /**
   * @param {"main" | null} menuKey
   */
  function setActiveHeaderMenu(menuKey) {
    const curMenu = deps.getActiveHeaderMenu();
    const nextMenu = curMenu === menuKey ? null : menuKey;
    deps.setActiveHeaderMenu(nextMenu);

    const isMainOpen = nextMenu === "main";
    const mainDrop = document.getElementById("header-main-dropdown");
    const mainBtn = document.getElementById("btn-header-main-menu");
    if (mainDrop) {
      mainDrop.classList.toggle("open", isMainOpen);
      mainDrop.setAttribute("aria-hidden", isMainOpen ? "false" : "true");
    }
    if (mainBtn) {
      mainBtn.classList.toggle("active-menu-btn", isMainOpen);
      mainBtn.setAttribute("aria-expanded", isMainOpen ? "true" : "false");
    }
  }

  /**
   * @param {number | null} idx
   */
  function setActivePopover(idx) {
    deps.setActivePopoverIdx(idx);
    if (idx !== null && deps.getActiveHeaderMenu() !== null) {
      setActiveHeaderMenu(null);
    }

    const backdrop = document.getElementById("popover-backdrop");
    document.querySelectorAll(".cmd-popover").forEach((el) => {
      const panel = /** @type {HTMLElement} */ (el);
      const isOpen = idx !== null && Number(panel.dataset.panelId) === idx;
      panel.classList.toggle("open", isOpen);
      panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
    });

    document.querySelectorAll(".cmd-trigger").forEach((el) => {
      const btn = /** @type {HTMLElement} */ (el);
      const isActive = idx !== null && Number(btn.dataset.panel) === idx;
      btn.classList.toggle("active-trigger", isActive);
      btn.setAttribute("aria-expanded", isActive ? "true" : "false");
    });

    if (backdrop) {
      backdrop.classList.toggle("open", idx !== null);
    }
  }

  /**
   * @param {any} noteInfo
   */
  function showTouchLoupeFeedback(noteInfo) {
    const loupe = document.getElementById("touch-loupe-badge");
    if (!loupe || noteInfo?.pitchClassQ === null || noteInfo?.pitchClassQ === undefined) return;

    const pitchClasses = deps.getPitchClasses24();
    const pcIdx = ((noteInfo.pitchClassQ % 24) + 24) % 24;
    const pc = pitchClasses[pcIdx] || pitchClasses[0];
    const isEn = deps.getState().lang === "en";
    const quarterToneLabel = deps.t(deps.getState().lang, "quarterToneLabel");

    const microTag = pc.micro ? ` · ${quarterToneLabel}` : "";
    const degTag = noteInfo.degree ? ` · ${isEn ? "Deg" : "Grau"} ${noteInfo.degree}` : "";
    const centsVal = typeof noteInfo.centsDev === "number" && noteInfo.centsDev !== 0
      ? ` (${noteInfo.centsDev > 0 ? "+" : ""}${noteInfo.centsDev}¢)`
      : "";

    loupe.textContent = `${pc.flat} (${pc.arabic})${centsVal}${microTag}${degTag}`;
    loupe.classList.add("visible");

    if (deps.scheduleUiTimeout) {
      deps.scheduleUiTimeout("touchLoupeHide", () => {
        loupe.classList.remove("visible");
      }, 1100);
    }
  }

  /**
   * @param {string | undefined} [focusTermId]
   */
  function renderGlossaryList(focusTermId) {
    const listEl = document.getElementById("glossary-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    const st = deps.getState();
    const query = deps.getGlossaryQuery() || "";
    const category = deps.getGlossaryCategory() || "ALL";
    const entries = deps.getGlossaryEntries() || [];

    const normalize = (/** @type {string} */ str) =>
      str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const qNorm = normalize(query.trim());

    const filtered = entries.filter((/** @type {any} */ rawEntry) => {
      const matchCat = category === "ALL" || rawEntry.category === category;
      if (!matchCat) return false;
      if (!qNorm) return true;
      const locEntry = deps.localizeGlossaryEntry(st.lang, rawEntry);
      const haystack = normalize(
        `${rawEntry.term} ${rawEntry.literal} ${rawEntry.definition} ${locEntry.term} ${locEntry.literal} ${locEntry.definition} ${locEntry.oudApplication}`
      ) + " " + rawEntry.arabic;
      return haystack.includes(qNorm);
    });

    if (!filtered.length) {
      listEl.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:24px; font-size:0.84rem;">${deps.escapeHtml(deps.t(st.lang, "glossaryEmpty"))} "${deps.escapeHtml(query)}".</div>`;
      return;
    }

    filtered.forEach((/** @type {any} */ rawEntry) => {
      const entry = deps.localizeGlossaryEntry(st.lang, rawEntry);
      const card = document.createElement("article");
      const isFocused = focusTermId === entry.id;
      card.className = `glossary-item ${isFocused ? "highlighted" : ""}`;
      card.id = `gloss-entry-${entry.id}`;
      card.innerHTML = `
        <div class="glossary-item-top">
          <span class="glossary-term-title">${deps.escapeHtml(entry.term)}</span>
          <span class="glossary-arabic" lang="ar">${deps.escapeHtml(entry.arabic)}</span>
        </div>
        <div class="glossary-meta-row">
          <span class="glossary-literal">${deps.escapeHtml(deps.t(st.lang, "glossaryTranslationLbl"))}: "${deps.escapeHtml(entry.literal)}"</span>
          <span class="glossary-cat-tag">${deps.escapeHtml(entry.categoryLabel)}</span>
        </div>
        <p class="glossary-def">${deps.escapeHtml(entry.definition)}</p>
        <div class="glossary-app-note">🪕 <strong>${deps.escapeHtml(deps.t(st.lang, "glossaryAppLbl"))}:</strong> ${deps.escapeHtml(entry.oudApplication)}</div>
      `;
      listEl.appendChild(card);
    });

    if (focusTermId) {
      requestAnimationFrame(() => {
        document.getElementById(`gloss-entry-${focusTermId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  /**
   * @param {string | undefined} [termId]
   */
  function openGlossary(termId) {
    setActivePopover(null);
    setActiveHeaderMenu(null);
    const drawer = document.getElementById("glossary-drawer");
    const backdrop = document.getElementById("glossary-backdrop");
    if (!drawer || !backdrop) return;

    if (termId) {
      deps.setGlossaryCategory("ALL");
      deps.setGlossaryQuery("");
      const searchInput = /** @type {HTMLInputElement | null} */ (document.getElementById("glossary-search-input"));
      if (searchInput) searchInput.value = "";
      document.querySelectorAll(".gloss-cat-btn").forEach((b) => {
        b.classList.toggle("selected", /** @type {HTMLElement} */ (b).dataset.cat === "ALL");
      });
    }

    renderGlossaryList(termId);
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.classList.add("open");
  }

  function closeGlossary() {
    const drawer = document.getElementById("glossary-drawer");
    const backdrop = document.getElementById("glossary-backdrop");
    drawer?.classList.remove("open");
    drawer?.setAttribute("aria-hidden", "true");
    backdrop?.classList.remove("open");
  }

  return {
    setActiveHeaderMenu,
    setActivePopover,
    showTouchLoupeFeedback,
    renderGlossaryList,
    openGlossary,
    closeGlossary,
  };
}
