// @ts-check
/**
 * Braço Vivo (Ripple luminoso, ressonância de oitavas no hover e vibração tátil)
 * + Faixa Inspetora Viva no Rodapé do Braço (modelo String Atlas v7.8 / v8.9).
 *
 * Usa captura (capture: true) para ler os data-attrs ANTES de ev.stopPropagation()
 * e ANTES de refreshAll() reconstruir o SVG, desenhando o ripple no próximo frame.
 */

import { scaleFreqToA4, loadSavedA4Hz } from "../core/pitchStabilizer.js";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * @param {any} deps
 */
export function createLiveNeckFxController(deps) {
  /** @type {{ absQ: number, pitchClassQ: number, qFromNut: number, course: number, freq: number, label: string } | null} */
  let inspectedNote = null;
  let boundSvg = false;

  const isEn = () => deps.getState?.()?.lang === "en";

  function ensureFxLayer(svg) {
    let layer = svg.querySelector("#sa-live-fx-layer");
    if (!layer) {
      layer = document.createElementNS(SVG_NS, "g");
      layer.setAttribute("id", "sa-live-fx-layer");
      layer.setAttribute("pointer-events", "none");
      svg.appendChild(layer);
    }
    return layer;
  }

  function spawnPluckRipple(cx, cy, isMicro = false) {
    const svg = /** @type {SVGElement | null} */ (/** @type {unknown} */ (document.getElementById("oud-neck")));
    if (!svg || !Number.isFinite(cx) || !Number.isFinite(cy)) return;
    const layer = ensureFxLayer(svg);

    const color = isMicro ? "#c49be0" : "#e2b963";
    const ring = document.createElementNS(SVG_NS, "circle");
    ring.setAttribute("class", "sa-pluck-ripple");
    ring.setAttribute("cx", String(cx));
    ring.setAttribute("cy", String(cy));
    ring.setAttribute("r", "10");
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", color);
    ring.setAttribute("stroke-width", "3");
    layer.appendChild(ring);

    const halo = document.createElementNS(SVG_NS, "circle");
    halo.setAttribute("class", "sa-pluck-flash");
    halo.setAttribute("cx", String(cx));
    halo.setAttribute("cy", String(cy));
    halo.setAttribute("r", "13");
    halo.setAttribute("fill", isMicro ? "rgba(196, 155, 224, 0.36)" : "rgba(226, 185, 99, 0.36)");
    layer.appendChild(halo);

    window.setTimeout(() => {
      ring.remove();
      halo.remove();
    }, 560);
  }

  function setHoverOctaveResonance(pcq) {
    const svg = document.getElementById("oud-neck");
    if (!svg) return;
    svg.querySelectorAll(".note-node.is-octave-hover").forEach((el) => {
      el.classList.remove("is-octave-hover");
    });
    if (pcq === null || pcq === "") return;
    svg.querySelectorAll(`.note-node[data-pcq="${pcq}"]`).forEach((el) => {
      el.classList.add("is-octave-hover");
    });
  }

  function renderInspectorStrip() {
    if (typeof document === "undefined") return;
    const host =
      document.querySelector(".neck-showcase") ||
      document.querySelector(".fretboard-panel") ||
      document.querySelector("main");
    if (!host) return;

    let footerBar = document.getElementById("sa-stage-footer-bar");
    if (!footerBar) {
      footerBar = document.createElement("div");
      footerBar.id = "sa-stage-footer-bar";
      footerBar.className = "sa-stage-footer-bar";
      host.appendChild(footerBar);
    }

    const microLeg = document.getElementById("sa-tier-micro-legend");
    if (microLeg && microLeg.parentElement !== footerBar) {
      footerBar.appendChild(microLeg);
    }

    let strip = document.getElementById("sa-inspector-strip");
    if (!strip) {
      strip = document.createElement("div");
      strip.id = "sa-inspector-strip";
      strip.className = "sa-inspector-strip";
      footerBar.prepend(strip);
    }

    const en = isEn();
    if (!inspectedNote) {
      strip.innerHTML = `<span class="sa-inspector-hint">${
        en
          ? "Click any note on the fingerboard to hear and inspect · Hover highlights octaves"
          : "Toque em qualquer nota no espelho para ouvir e inspecionar · Passar o mouse revela oitavas"
      }</span>`;
      return;
    }

    const pcs = deps.getPitchClasses24?.() || [];
    const pcObj = pcs[inspectedNote.pitchClassQ] || {};
    const noteLatin = pcObj.flat || inspectedNote.label || "—";
    const noteArabic = pcObj.arabic || "";
    const a4 = deps.getA4Hz?.() || loadSavedA4Hz();
    const calibratedHz = scaleFreqToA4(inspectedNote.freq, a4);
    const microTag = pcObj.micro
      ? `<span class="sa-insp-badge sa-insp-badge--micro">¼ ${en ? "tone" : "tom"}</span>`
      : "";
    const posTag = inspectedNote.qFromNut === 0
      ? (en ? "Open" : "Solta")
      : `q=${inspectedNote.qFromNut}`;

    strip.innerHTML = `
      <div class="sa-insp-main">
        <strong class="sa-insp-note">${noteLatin}</strong>
        ${noteArabic ? `<span class="sa-insp-arabic">${noteArabic}</span>` : ""}
        ${microTag}
        <span class="sa-insp-meta">${inspectedNote.course}ª ${en ? "Course" : "Ordem"} · ${posTag} · ${calibratedHz.toFixed(1)} Hz <small>(A4=${a4})</small></span>
      </div>
      <div class="sa-insp-actions">
        <button type="button" id="sa-insp-play" class="sa-mini-chip">🔊 ${en ? "Play" : "Ouvir"}</button>
        <button type="button" id="sa-insp-root" class="sa-mini-chip">🎯 ${en ? "Set Qarar" : "Definir Tônica"}</button>
        <button type="button" id="sa-insp-clear" class="sa-mini-chip" title="${en ? "Clear" : "Limpar"}">✕</button>
      </div>
    `;

    strip.querySelector("#sa-insp-play")?.addEventListener("click", () => {
      if (!inspectedNote) return;
      deps.onPlayFreq?.(inspectedNote.freq);
    });
    strip.querySelector("#sa-insp-root")?.addEventListener("click", () => {
      if (!inspectedNote) return;
      deps.onMakeRoot?.(inspectedNote);
    });
    strip.querySelector("#sa-insp-clear")?.addEventListener("click", () => {
      inspectedNote = null;
      renderInspectorStrip();
      deps.onClearSelection?.();
    });
  }

  function bindDeckDelegation() {
    if (boundSvg || typeof document === "undefined") return;
    boundSvg = true;

    // CAPTURE = true: dispara ANTES de ev.stopPropagation() e ANTES de refreshAll() limpar o SVG!
    document.addEventListener(
      "click",
      (ev) => {
        const target = /** @type {Element | null} */ (ev.target);
        const node = target?.closest?.("#oud-neck .note-node");
        if (!node) return;

        const nx = Number(node.getAttribute("data-nx"));
        const ny = Number(node.getAttribute("data-ny"));
        const absQ = Number(node.getAttribute("data-absq"));
        const pcq = Number(node.getAttribute("data-pcq"));
        const course = Number(node.getAttribute("data-course"));
        const qFromNut = Number(node.getAttribute("data-q"));
        const freq = Number(node.getAttribute("data-freq"));
        const isMicro =
          node.getAttribute("data-micro") === "1" ||
          node.getAttribute("data-free-micro") === "1";

        if (Number.isFinite(absQ) && Number.isFinite(pcq) && Number.isFinite(freq)) {
          inspectedNote = {
            absQ,
            pitchClassQ: pcq,
            qFromNut: Number.isFinite(qFromNut) ? qFromNut : 0,
            course: Number.isFinite(course) ? course : 1,
            freq,
            label: node.querySelector("text")?.textContent || ""
          };
          renderInspectorStrip();
        }

        // Desenha o ripple no próximo frame para sobreviver ao re-render do SVG disparado pelo clique
        if (Number.isFinite(nx) && Number.isFinite(ny)) {
          window.requestAnimationFrame(() => {
            spawnPluckRipple(nx, ny, isMicro);
          });
        }
      },
      true
    );

    document.addEventListener("pointerover", (ev) => {
      const target = /** @type {Element | null} */ (ev.target);
      const node = target?.closest?.("#oud-neck .note-node");
      if (!node) return;
      const pcq = node.getAttribute("data-pcq");
      if (pcq !== null) setHoverOctaveResonance(pcq);
    });

    document.addEventListener("pointerout", (ev) => {
      const target = /** @type {Element | null} */ (ev.target);
      const node = target?.closest?.("#oud-neck .note-node");
      if (!node) return;
      const related = /** @type {Element | null} */ (ev.relatedTarget);
      if (related && node.contains(related)) return;
      setHoverOctaveResonance(null);
    });
  }

  bindDeckDelegation();
  renderInspectorStrip();

  return {
    spawnPluckRipple,
    renderInspectorStrip,
    clearInspection: () => {
      inspectedNote = null;
      renderInspectorStrip();
    }
  };
}
