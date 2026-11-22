// @ts-check

const memoryStorage = new Map();

/**
 * Escapa caracteres especiais HTML para interpolação segura.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Lê chave do localStorage com fallback seguro em memória.
 * @param {string} key
 * @param {string | null} [fallback=null]
 * @returns {string | null}
 */
export function safeStorageGet(key, fallback = null) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const val = window.localStorage.getItem(key);
      return val !== null ? val : fallback;
    }
  } catch (_) {
    // Fallback para memória quando localStorage está bloqueado ou indisponível
  }
  return memoryStorage.has(key) ? /** @type {string} */ (memoryStorage.get(key)) : fallback;
}

/**
 * Grava chave no localStorage com fallback seguro em memória.
 * @param {string} key
 * @param {string} value
 * @returns {boolean}
 */
export function safeStorageSet(key, value) {
  const strVal = String(value);
  memoryStorage.set(key, strVal);
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, strVal);
      return true;
    }
  } catch (_) {
    // Mantém valor no fallback em memória
  }
  return false;
}

/**
 * Remove chave do localStorage e do fallback em memória.
 * @param {string} key
 * @returns {void}
 */
export function safeStorageRemove(key) {
  memoryStorage.delete(key);
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (_) {
    // Ignora falhas de acesso em modos restritos
  }
}

/**
 * Cria um registro isolado de timers de UI para evitar vazamentos.
 */
export function createUiTimerRegistry() {
  /** @type {Map<string, ReturnType<typeof setTimeout>>} */
  const timers = new Map();

  /**
   * @param {string} key
   * @returns {void}
   */
  function clear(key) {
    const existing = timers.get(key);
    if (existing !== undefined) {
      clearTimeout(existing);
      timers.delete(key);
    }
  }

  /**
   * @param {string} key
   * @param {() => void} fn
   * @param {number} delayMs
   * @returns {void}
   */
  function schedule(key, fn, delayMs) {
    clear(key);
    const id = setTimeout(() => {
      timers.delete(key);
      fn();
    }, Math.max(0, Number(delayMs) || 0));
    timers.set(key, id);
  }

  /**
   * @returns {void}
   */
  function clearAll() {
    for (const id of timers.values()) {
      clearTimeout(id);
    }
    timers.clear();
  }

  return { schedule, clear, clearAll };
}
