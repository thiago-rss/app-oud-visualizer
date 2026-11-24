// @ts-check
/**
 * Snapshots de Sessão & Backup JSON Unificado (Snapshots + Afinações Customizadas)
 * Migrado do String Atlas (sessionCodec / snapshotsView) para o App Oud Visualizer (v3.13.0).
 */

import { loadCustomTunings, importCustomTuningsJson } from "./customTunings.js";

export const SNAPSHOTS_STORAGE_KEY = "oud_studio_snapshots_v1";

/**
 * @param {any} raw
 */
export function normalizeSnapshot(raw) {
  if (!raw || typeof raw !== "object") return null;
  const name = String(raw.name || "").trim().slice(0, 64);
  if (!name || !raw.state || typeof raw.state !== "object") return null;

  const id = typeof raw.id === "string" && raw.id.startsWith("snap_")
    ? raw.id
    : `snap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  return {
    id,
    name,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    a4Hz: Number.isFinite(Number(raw.a4Hz)) ? Number(raw.a4Hz) : 440,
    clarityMode: typeof raw.clarityMode === "string" ? raw.clarityMode : "POSITION",
    state: {
      tradition: raw.state.tradition || "damascus",
      tuningId: raw.state.tuningId || "syrian_arabic_c_c",
      mode: raw.state.mode || "MAQAM",
      entityId: raw.state.entityId || "maqam_rast",
      rootQ: Number.isFinite(Number(raw.state.rootQ)) ? Number(raw.state.rootQ) : 0,
      direction: raw.state.direction === "DESC" ? "DESC" : "ASC",
      shapeMode: raw.state.shapeMode || "OPEN_FIRST_POS",
      labelMode: raw.state.labelMode || "NOTE_NAME",
      iqaId: raw.state.iqaId || "iqa_maqsum",
      bpm: Number.isFinite(Number(raw.state.bpm)) ? Number(raw.state.bpm) : 96
    }
  };
}

export function loadSnapshots() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = window.localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeSnapshot).filter((x) => Boolean(x));
  } catch {
    return [];
  }
}

function persistSnapshots(list) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore quota error
  }
}

/**
 * @param {{ name: string, state: any, a4Hz?: number, clarityMode?: string }} input
 */
export function saveSnapshot(input) {
  const norm = normalizeSnapshot(input);
  if (!norm) throw new Error("Snapshot inválido (informe um nome).");
  const list = loadSnapshots();
  list.unshift(norm);
  persistSnapshots(list.slice(0, 40));
  return norm;
}

/**
 * @param {string} id
 */
export function deleteSnapshot(id) {
  const list = loadSnapshots();
  const next = list.filter((s) => s.id !== id);
  if (next.length === list.length) return false;
  persistSnapshots(next);
  return true;
}

export function buildFullBackupJson() {
  return JSON.stringify(
    {
      schema: "oud-visualizer-studio-backup/v1",
      exportedAt: new Date().toISOString(),
      snapshots: loadSnapshots(),
      customTunings: loadCustomTunings()
    },
    null,
    2
  );
}

/**
 * @param {string} jsonText
 */
export function importFullBackupJson(jsonText) {
  const parsed = JSON.parse(jsonText);
  let snapshotsImported = 0;
  let tuningsImported = 0;

  if (Array.isArray(parsed?.snapshots)) {
    const existing = loadSnapshots();
    const byId = new Map(existing.map((s) => [s.id, s]));
    for (const raw of parsed.snapshots) {
      const norm = normalizeSnapshot(raw);
      if (norm) {
        byId.set(norm.id, norm);
        snapshotsImported += 1;
      }
    }
    persistSnapshots(Array.from(byId.values()).slice(0, 40));
  }

  if (Array.isArray(parsed?.customTunings)) {
    tuningsImported = importCustomTuningsJson(JSON.stringify({ tunings: parsed.customTunings }));
  } else if (Array.isArray(parsed?.tunings)) {
    tuningsImported = importCustomTuningsJson(JSON.stringify({ tunings: parsed.tunings }));
  }

  return { snapshotsImported, tuningsImported };
}
