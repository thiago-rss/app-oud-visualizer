// @ts-check
/**
 * Guardião de Sessão Mobile & Controle de Tela/Áudio
 * Migrado dos conceitos do String Atlas v8.3 para o App Oud Visualizer (v3.15.0).
 * - Gerencia navigator.audioSession ("playback" vs "play-and-record") com segurança
 * - Mantém Screen Wake Lock enquanto Drone, Ritmo Iqa' ou Escuta estiverem ativos
 * - Protege contra rajadas de áudio ("anti-burst") ao retomar após bloqueio/visibilidade
 */

export const MOBILE_WAKE_LOCK_STORAGE_KEY = "oud_mobile_wake_lock";

/**
 * Configura a sessão de áudio do navegador (quando suportada) de forma limpa.
 * @param {"playback" | "play-and-record"} sessionType
 */
export function applyAudioSessionType(sessionType) {
  try {
    if (typeof navigator === "undefined") return;
    const navAny = /** @type {any} */ (navigator);
    if (navAny.audioSession && navAny.audioSession.type !== sessionType) {
      navAny.audioSession.type = sessionType;
    }
  } catch {
    // Ignora em ambientes sem AudioSession API
  }
}

/**
 * Cria controlador de Wake Lock de tela para sessões contínuas de estudo (Drone / Iqa' / Escuta).
 */
export function createMobileSessionGuard() {
  /** @type {any} */
  let wakeLockSentinel = null;
  let lastResumeTs = 0;

  function isWakeLockEnabled() {
    try {
      if (typeof window === "undefined" || !window.localStorage) return true;
      const v = window.localStorage.getItem(MOBILE_WAKE_LOCK_STORAGE_KEY);
      return v === null ? true : v === "1";
    } catch {
      return true;
    }
  }

  function setWakeLockEnabled(enabled) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(MOBILE_WAKE_LOCK_STORAGE_KEY, enabled ? "1" : "0");
      }
    } catch {
      // ignore
    }
    if (!enabled) releaseWakeLock();
  }

  async function requestWakeLockIfNeeded(shouldKeepAwake) {
    if (!shouldKeepAwake || !isWakeLockEnabled()) {
      await releaseWakeLock();
      return;
    }
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    if (wakeLockSentinel) return;

    try {
      wakeLockSentinel = await /** @type {any} */ (navigator).wakeLock.request("screen");
      wakeLockSentinel?.addEventListener?.("release", () => {
        wakeLockSentinel = null;
      });
    } catch {
      // Ignora caso o SO ou modo de economia impeça Wake Lock
    }
  }

  async function releaseWakeLock() {
    if (!wakeLockSentinel) return;
    try {
      await wakeLockSentinel.release();
    } catch {
      // ignore
    }
    wakeLockSentinel = null;
  }

  /**
   * Janela anti-burst curta (~260 ms) ao voltar da tela bloqueada / aba oculta.
   */
  function markResumedNow(nowTs = performance.now()) {
    lastResumeTs = nowTs;
  }

  function isInAntiBurstWindow(nowTs = performance.now(), windowMs = 260) {
    return lastResumeTs > 0 && (nowTs - lastResumeTs) < windowMs;
  }

  return {
    applyAudioSessionType,
    isWakeLockEnabled,
    setWakeLockEnabled,
    requestWakeLockIfNeeded,
    releaseWakeLock,
    markResumedNow,
    isInAntiBurstWindow
  };
}
