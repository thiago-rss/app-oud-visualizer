// @ts-check
/**
 * Sistema Global de Notificações (Toasts) para o App Oud Visualizer.
 * Respeita os temas Layl (Escuro) e Nahar (Claro) e acessibilidade (aria-live="polite").
 */

const CONTAINER_ID = "oud-toast-stack";
const MAX_VISIBLE_TOASTS = 4;

/**
 * Garante a existência do container de toasts no DOM.
 * @returns {HTMLElement | null}
 */
function ensureToastContainer() {
  if (typeof document === "undefined" || !document.body) return null;
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.className = "oud-toast-stack";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "false");
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Exibe uma notificação discreta e temática.
 * @param {string} message
 * @param {{
 *   type?: "info" | "success" | "warn" | "error",
 *   durationMs?: number,
 *   icon?: string
 * }} [options]
 */
export function showToast(message, options = {}) {
  const container = ensureToastContainer();
  if (!container || !message) return;

  const type = options.type || "info";
  const durationMs = Number.isFinite(options.durationMs) ? Number(options.durationMs) : 2600;
  const defaultIcons = {
    info: "✦",
    success: "✓",
    warn: "△",
    error: "✕"
  };
  const icon = options.icon ?? defaultIcons[type] ?? "✦";

  while (container.children.length >= MAX_VISIBLE_TOASTS) {
    container.firstElementChild?.remove();
  }

  const toast = document.createElement("div");
  toast.className = `oud-toast oud-toast--${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const iconEl = document.createElement("span");
  iconEl.className = "oud-toast__icon";
  iconEl.setAttribute("aria-hidden", "true");
  iconEl.textContent = icon;

  const textEl = document.createElement("span");
  textEl.className = "oud-toast__text";
  textEl.textContent = String(message);

  toast.appendChild(iconEl);
  toast.appendChild(textEl);

  const dismiss = () => {
    if (!toast.isConnected || toast.classList.contains("is-leaving")) return;
    toast.classList.add("is-leaving");
    window.setTimeout(() => toast.remove(), 220);
  };

  toast.addEventListener("click", dismiss);
  container.appendChild(toast);

  window.requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  if (durationMs > 0) {
    window.setTimeout(dismiss, durationMs);
  }
}

/**
 * Limpa todas as notificações ativas.
 */
export function clearAllToasts() {
  if (typeof document === "undefined") return;
  const container = document.getElementById(CONTAINER_ID);
  if (container) container.innerHTML = "";
}
