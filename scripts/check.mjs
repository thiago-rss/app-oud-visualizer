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

await runUnitChecks();

console.log("");
if (failures > 0) {
  console.error(`❌ Validação falhou com ${failures} erro(s).`);
  process.exit(1);
} else {
  console.log("✅ Todos os testes de integridade do App Oud Visualizer passaram!");
}
