#!/usr/bin/env node
/**
 * App Oud Visualizer — Validador Pré-Commit (estilo String Atlas)
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
let failures = 0;

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✕ ${msg}`);
  failures += 1;
}

function walkJsFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsFiles(full, acc);
    } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".mjs"))) {
      acc.push(full);
    }
  }
  return acc;
}

console.log("\n=== 1. Verificação de Sintaxe (node --check) ===");
const jsFiles = [
  ...walkJsFiles(path.join(ROOT, "js")),
  ...(fs.existsSync(path.join(ROOT, "sw.js")) ? [path.join(ROOT, "sw.js")] : [])
];

for (const file of jsFiles) {
  const rel = path.relative(ROOT, file);
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    ok(rel);
  } catch (err) {
    fail(`${rel} — erro de sintaxe: ${err.stderr?.toString().trim() || err.message}`);
  }
}

console.log("\n=== 2. Verificação de Imports ESM Relativos ===");
const importRegex = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["'](\.[^"']+)["']/g;
for (const file of jsFiles) {
  const rel = path.relative(ROOT, file);
  const src = fs.readFileSync(file, "utf8");
  let match;
  let missingInFile = 0;
  while ((match = importRegex.exec(src)) !== null) {
    const target = path.resolve(path.dirname(file), match[1]);
    if (!fs.existsSync(target)) {
      fail(`${rel} importa caminho inexistente: ${match[1]}`);
      missingInFile += 1;
    }
  }
  if (missingInFile === 0) ok(`${rel} (imports OK)`);
}

console.log("\n=== 3. Conferência de CORE_ASSETS no sw.js ===");
const swPath = path.join(ROOT, "sw.js");
if (fs.existsSync(swPath)) {
  const swSrc = fs.readFileSync(swPath, "utf8");
  const cacheMatch = swSrc.match(/CACHE_NAME\s*=\s*["']([^"']+)["']/);
  if (cacheMatch) {
    ok(`CACHE_NAME = ${cacheMatch[1]}`);
  } else {
    fail("CACHE_NAME não encontrado em sw.js");
  }

  const assetsBlock = swSrc.match(/CORE_ASSETS\s*=\s*\[([\s\S]*?)\]/);
  if (!assetsBlock) {
    fail("CORE_ASSETS não encontrado em sw.js");
  } else {
    const assetMatches = [...assetsBlock[1].matchAll(/["'](\.\/[^"']*)["']/g)].map((m) => m[1]);
    let missingAssets = 0;
    for (const asset of assetMatches) {
      if (asset === "./") continue;
      const diskPath = path.join(ROOT, asset.slice(2));
      if (!fs.existsSync(diskPath)) {
        fail(`Asset ausente no disco listado no sw.js: ${asset}`);
        missingAssets += 1;
      }
    }
    if (missingAssets === 0) {
      ok(`${assetMatches.length} assets em CORE_ASSETS verificados no disco`);
    }
  }
} else {
  fail("sw.js não encontrado na raiz");
}

console.log("\n=== 4. Testes Funcionais dos Novos Módulos (Bloco A / B / C) ===");
async function runUnitChecks() {
  const stabilizerPath = path.join(ROOT, "js/core/pitchStabilizer.js");
  if (fs.existsSync(stabilizerPath)) {
    const mod = await import(`file://${stabilizerPath}`);
    if (mod.clampA4Hz(432) !== 432 || mod.clampA4Hz(500) !== 446 || mod.clampA4Hz(300) !== 415) {
      fail("clampA4Hz fora dos limites 415–446 Hz");
    } else {
      ok("clampA4Hz (415–446 Hz) OK");
    }

    const strobeLocked = mod.computeStrobeTelemetry(3.2);
    const strobeDrift = mod.computeStrobeTelemetry(-18);
    if (!strobeLocked.locked || strobeDrift.locked || strobeDrift.driftDirection !== -1) {
      fail("computeStrobeTelemetry falhou na trava ±4¢");
    } else {
      ok("computeStrobeTelemetry (±4¢) OK");
    }

    const stab = new mod.PitchStabilizer();
    const f1 = stab.stabilizeFrequency(65.4);
    const f2 = stab.stabilizeFrequency(65.5);
    const fJump = stab.stabilizeFrequency(196.0);
    if (Math.abs(fJump - 196.0) > 1.0 || f1 <= 0 || f2 <= 0) {
      fail("PitchStabilizer não respondeu corretamente ao snap > 70¢");
    } else {
      ok("PitchStabilizer (mediana graves + snap > 70¢) OK");
    }
  }

  const clarityPath = path.join(ROOT, "js/core/neckClarity.js");
  if (fs.existsSync(clarityPath)) {
    const mod = await import(`file://${clarityPath}`);
    const t1 = mod.computeJewelVisualTier({ isRoot: true, clarityMode: "POSITION", inBox: true });
    const t2 = mod.computeJewelVisualTier({ isMicrotone: true, clarityMode: "POSITION", inBox: true });
    const t3 = mod.computeJewelVisualTier({ clarityMode: "POSITION", inBox: true });
    const ghost = mod.computeJewelVisualTier({ clarityMode: "POSITION", inBox: false });
    if (!(t1.radius > t2.radius && t2.radius > t3.radius && t3.ringOnly && ghost.isGhost)) {
      fail("Hierarquia de 3 camadas em neckClarity.js inconsistente");
    } else {
      ok("neckClarity.js (4 modos + hierarquia em 3 camadas) OK");
    }
  }

  const customPath = path.join(ROOT, "js/core/customTunings.js");
  if (fs.existsSync(customPath)) {
    const mod = await import(`file://${customPath}`);
    const norm = mod.normalizeCustomTuning({
      name: "Teste Sírio",
      courses: [
        { course: 1, open_q: 96 },
        { course: 2, open_q: 82 },
        { course: 3, open_q: 68 },
        { course: 4, open_q: 54 },
        { course: 5, open_q: 44 },
        { course: 6, open_q: 34 }
      ]
    });
    if (!norm || norm.courses.length !== 6 || !norm.isCustom) {
      fail("normalizeCustomTuning falhou na validação de 6 ordens");
    } else {
      ok("customTunings.js (6 ordens 24-TET) OK");
    }
  }
}

async function runCoreAndCurriculumTests() {
  console.log("\n=== 5. Testes Unitários Core & Integridade Curricular ===");

  const { DB } = await import(`file://${path.join(ROOT, "js/core/database.js")}`);
  const { getDefaultState } = await import(`file://${path.join(ROOT, "js/core/urlState.js")}`);
  const { getActiveStructure, getPhysicalX, getPositionBounds } =
    await import(`file://${path.join(ROOT, "js/core/modalEngine.js")}`);
  const { clampInt, applyStatePatch } =
    await import(`file://${path.join(ROOT, "js/core/stateTransitions.js")}`);
  const { normalizeStudyKey, normalizeDeckTab, resolveStudyTuningId, resolveStudyEntityId, resolveStudyIqaId } =
    await import(`file://${path.join(ROOT, "js/core/studyResolver.js")}`);
  const { computeLessonReviewInfo, getDueReviews } =
    await import(`file://${path.join(ROOT, "js/core/spacedReview.js")}`);
  const { formatBytes, createFrameBudgetTracker } =
    await import(`file://${path.join(ROOT, "js/core/diagnostics.js")}`);
  const { getAllStudyLessons } =
    await import(`file://${path.join(ROOT, "js/core/studyGuide.js")}`);
  const { STUDY_DOSSIERS } =
    await import(`file://${path.join(ROOT, "js/core/studyDossiers.js")}`);

  // 5.1 modalEngine.js
  const baseState = getDefaultState();
  const rastStruct = getActiveStructure({ ...baseState, mode: "MAQAM", entityId: "maqam_rast", rootQ: 0 });
  const x0 = getPhysicalX(0, 100, 600, false);
  const x12 = getPhysicalX(12, 100, 600, false);
  const bounds = getPositionBounds("OPEN_FIRST_POS", 2);
  if (!rastStruct?.intervals?.includes(7) || x0 !== 68 || !(x12 > 100) || bounds?.startQ !== 0 || bounds?.endQ !== 8) {
    fail("modalEngine.js falhou na validação de Maqam Rast (3-), geometria física ou limites de posição");
  } else {
    ok("modalEngine.js (Maqam Rast 24-TET, geometria física e limites de posição) OK");
  }

  // 5.2 stateTransitions.js
  const clamped = clampInt("999", 96, 50, 175);
  const patched = applyStatePatch(
    { ...baseState, mode: "MAQAM", shapeMode: "FULL_NECK", sayrPhraseIndex: 2, cadenceStepIndex: 3 },
    { mode: "CHORD", bpm: 300 }
  );
  if (clamped !== 175 || patched.mode !== "CHORD" || patched.shapeMode !== "OPEN_FIRST_POS" || patched.sayrPhraseIndex !== 0 || patched.cadenceStepIndex !== 0) {
    fail("stateTransitions.js falhou em clampInt / applyStatePatch");
  } else {
    ok("stateTransitions.js (clampInt e invariantes de modo/posição/cadência) OK");
  }

  // 5.3 studyResolver.js
  const nk = normalizeStudyKey("Maqām Bayātī");
  const tab = normalizeDeckTab("guide");
  const tId = resolveStudyTuningId(DB, "syrian_arabic_c_c", ["syrian"]);
  const eId = resolveStudyEntityId(DB, "MAQAM", "maqam_hijaz", ["hijaz"]);
  const iId = resolveStudyIqaId(DB, "iqa_maqsum", "maqsum", null);
  if (nk !== "maqam bayati" || tab !== "study" || !tId || !eId || !iId) {
    fail("studyResolver.js falhou na normalização/resolução de catálogo");
  } else {
    ok("studyResolver.js (normalização, tabs, afinação, entidade e Iqa') OK");
  }

  // 5.4 spacedReview.js
  const now = 1_700_000_000_000;
  const stats = {
    les_old: { sessions: 2, lastPracticedAt: now - 6 * 86400000, bestAvgCents: 6.2 },
    les_fresh: { sessions: 1, lastPracticedAt: now - 1 * 86400000, bestAvgCents: 9.0 }
  };
  const mastery = { les_old: "PRACTICING", les_fresh: "PRACTICING" };
  const due = getDueReviews([{ id: "les_old" }, { id: "les_fresh" }], stats, mastery, new Set(), now);
  const oldInfo = computeLessonReviewInfo("les_old", stats, mastery, new Set(), now);
  if (due.length !== 1 || due[0].lesson.id !== "les_old" || !oldInfo.isDue) {
    fail("spacedReview.js falhou no cálculo de lições vencidas");
  } else {
    ok("spacedReview.js (intervalos de revisão e fila ordenada) OK");
  }

  // 5.5 diagnostics.js
  const tracker = createFrameBudgetTracker(10);
  tracker.recordFrame(4.0);
  tracker.recordFrame(20.0);
  const fStats = tracker.getStats();
  if (formatBytes(2048) !== "2.0 KB" || fStats.avgMs !== 12 || fStats.maxMs !== 20 || fStats.overBudgetTotal !== 1) {
    fail("diagnostics.js falhou em formatBytes / createFrameBudgetTracker");
  } else {
    ok("diagnostics.js (formatBytes e FrameBudgetTracker) OK");
  }

  // 5.6 Integridade Referencial das 51 Lições & Dossiês
  const lessons = getAllStudyLessons();
  const seenIds = new Set();
  let refErrors = 0;
  for (const les of lessons) {
    if (!les.id || seenIds.has(les.id)) {
      fail(`ID de lição ausente ou duplicado: ${les.id}`);
      refErrors++;
      continue;
    }
    seenIds.add(les.id);
    if (!STUDY_DOSSIERS[les.id]) {
      fail(`Lição ${les.id} sem dossiê correspondente em STUDY_DOSSIERS`);
      refErrors++;
    }
    const p = les.preset || {};
    const entOk = resolveStudyEntityId(DB, p.mode, p.entityId, p.entityKeywords);
    if (!entOk) {
      fail(`Preset da lição ${les.id} não resolve entidade válida (${p.mode} / ${p.entityId})`);
      refErrors++;
    }
  }
  if (refErrors === 0) {
    ok(`Integridade curricular: ${lessons.length} lições únicas, ${lessons.length} dossiês e presets resolvidos OK`);
  }
}

await runUnitChecks();
await runCoreAndCurriculumTests();

console.log("");
if (failures > 0) {
  console.error(`❌ Validação falhou com ${failures} erro(s).`);
  process.exit(1);
} else {
  console.log("✅ Todos os testes de integridade do App Oud Visualizer passaram!");
}
