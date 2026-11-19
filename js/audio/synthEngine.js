// @ts-check
import { PITCH_CLASSES_24 } from "../core/database.js";

/** @type {AudioContext | null} */
let audioCtx = null;
/** @type {GainNode | null} */
let masterGain = null;
/** @type {HTMLAudioElement | null} */
let iosUnlockAudioEl = null;
let iosAudioUnlocked = false;

/** @type {number[]} */
let sequenceTimers = [];
/** @type {number | null} */
let iqaIntervalId = null;

/** @type {{ osc1: OscillatorNode, osc2: OscillatorNode, filter: BiquadFilterNode, gain: GainNode } | null} */
let droneNodes = null;

/**
 * Gera um WAV PCM silencioso mínimo (10ms) em memória para forçar o iOS/WKWebView
 * a migrar a sessão de áudio de "Ambient" (mutado pela chave lateral) para "Playback".
 */
function createSilentWavDataUrl() {
  const sampleRate = 22050;
  const numSamples = 220;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, numSamples * 2, true);

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

/**
 * Configura a sessão de áudio do iOS 17+ para Playback (ignora chave de silencioso).
 */
function configureIosAudioSession() {
  try {
    const navAny = /** @type {any} */ (navigator);
    if (navAny && navAny.audioSession && navAny.audioSession.type !== "playback") {
      navAny.audioSession.type = "playback";
    }
  } catch {
    // Navegadores sem AudioSession API ignoram com segurança
  }
}

/**
 * Garante que o AudioContext e o barramento master existam.
 * @returns {AudioContext | null}
 */
function ensureAudioContext() {
  if (typeof window === "undefined") return null;

  configureIosAudioSession();

  if (!audioCtx) {
    const AudioCtxCtor = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    if (!AudioCtxCtor) return null;
    audioCtx = new AudioCtxCtor();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.85, audioCtx.currentTime);

    // Compressor suave para proteger alto-falantes de celular sem distorcer acordes/drone
    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-10, audioCtx.currentTime);
    limiter.knee.setValueAtTime(14, audioCtx.currentTime);
    limiter.ratio.setValueAtTime(6, audioCtx.currentTime);
    limiter.attack.setValueAtTime(0.004, audioCtx.currentTime);
    limiter.release.setValueAtTime(0.12, audioCtx.currentTime);

    masterGain.connect(limiter);
    limiter.connect(audioCtx.destination);
  }

  return audioCtx;
}

/**
 * Executa o desbloqueio síncrono exigido pelo WebKit / Chrome no iPhone.
 * Deve ser chamado diretamente dentro de um evento de gesto do usuário.
 */
export function unlockAudioEngine() {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  configureIosAudioSession();

  // 1. Retoma AudioContext se estiver suspended ou interrupted (estado exclusivo do iOS)
  if (ctx.state !== "running") {
    ctx.resume().catch(() => {
      // Ignora caso chamado fora de gesto válido
    });
  }

  // 2. Toca um buffer silencioso de 1 sample no Web Audio para destravar o hardware no WKWebView
  try {
    const silentBuf = ctx.createBuffer(1, 1, ctx.sampleRate || 22050);
    const src = ctx.createBufferSource();
    src.buffer = silentBuf;
    src.connect(ctx.destination);
    src.start(0);
  } catch {
    // Ignora
  }

  // 3. Dispara elemento HTML5 <audio playsinline> silencioso para habilitar som mesmo com a chave de silencioso ligada
  if (!iosAudioUnlocked) {
    try {
      if (!iosUnlockAudioEl) {
        iosUnlockAudioEl = document.createElement("audio");
        iosUnlockAudioEl.setAttribute("playsinline", "");
        iosUnlockAudioEl.setAttribute("webkit-playsinline", "");
        iosUnlockAudioEl.preload = "auto";
        iosUnlockAudioEl.src = createSilentWavDataUrl();
      }
      const playPromise = iosUnlockAudioEl.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            iosAudioUnlocked = true;
          })
          .catch(() => {
            // Tenta novamente no próximo toque
          });
      }
    } catch {
      // Ignora
    }
  }
}

/**
 * Garante que o contexto esteja rodando antes de agendar a síntese.
 * @param {(ctx: AudioContext, dest: AudioNode) => void} fn
 */
function withReadyAudio(fn) {
  const ctx = ensureAudioContext();
  if (!ctx || !masterGain) return;
  const dest = masterGain;

  if (ctx.state === "running") {
    fn(ctx, dest);
    return;
  }

  unlockAudioEngine();
  ctx.resume()
    .then(() => {
      if (audioCtx && masterGain) {
        fn(audioCtx, masterGain);
      }
    })
    .catch(() => {
      // Fallback caso o navegador não permita resume sem novo gesto
    });
}

// Registra desbloqueio automático na fase de captura para qualquer toque/clique no iPhone
if (typeof window !== "undefined") {
  const handleFirstInteraction = () => {
    unlockAudioEngine();
  };

  window.addEventListener("touchstart", handleFirstInteraction, { capture: true, passive: true });
  window.addEventListener("touchend", handleFirstInteraction, { capture: true, passive: true });
  window.addEventListener("pointerdown", handleFirstInteraction, { capture: true, passive: true });
  window.addEventListener("click", handleFirstInteraction, { capture: true, passive: true });
  window.addEventListener("keydown", handleFirstInteraction, { capture: true, passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && audioCtx && audioCtx.state !== "running") {
      iosAudioUnlocked = false;
      audioCtx.resume().catch(() => {});
    }
  });
}

export function clearSequenceTimers() {
  sequenceTimers.forEach(id => window.clearTimeout(id));
  sequenceTimers = [];
}

/**
 * Síntese de corda dedilhada de Oud (timbre amadeirado com presença de 2º/3º harmônico
 * para projeção clara em alto-falantes de celular).
 *
 * @param {number} freq
 * @param {number} [duration=1.35]
 * @param {number} [volume=0.34]
 */
export function playPluckedNote(freq, duration = 1.35, volume = 0.34) {
  if (!Number.isFinite(freq) || freq <= 20) return;

  withReadyAudio((ctx, dest) => {
    const now = ctx.currentTime + 0.004;
    const safeDur = Math.max(0.2, duration);

    // Par de cordas (ordem dupla do Oud com leve desafinação orgânica)
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const oscHarm = ctx.createOscillator();

    oscA.type = "triangle";
    oscB.type = "sawtooth";
    oscHarm.type = "sine";

    oscA.frequency.setValueAtTime(freq, now);
    oscB.frequency.setValueAtTime(freq * 1.0018, now);
    oscHarm.frequency.setValueAtTime(freq * 2, now);

    const mixA = ctx.createGain();
    const mixB = ctx.createGain();
    const mixHarm = ctx.createGain();

    mixA.gain.setValueAtTime(0.68, now);
    mixB.gain.setValueAtTime(0.24, now);
    // Reforço sutil da oitava superior para notas graves (C2/F2) soarem bem no iPhone
    mixHarm.gain.setValueAtTime(freq < 140 ? 0.32 : 0.14, now);

    // Filtro passa-baixa simulando o ataque da Risha e o amortecimento da madeira
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = "lowpass";
    const peakCutoff = Math.min(5200, Math.max(1400, freq * 7.5));
    const tailCutoff = Math.min(1300, Math.max(420, freq * 2.2));
    bodyFilter.frequency.setValueAtTime(peakCutoff, now);
    bodyFilter.frequency.exponentialRampToValueAtTime(tailCutoff, now + safeDur * 0.65);
    bodyFilter.Q.setValueAtTime(1.2, now);

    // Envelope de amplitude (sempre >= 0.0001 para compatibilidade estrita com WebKit)
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(volume, now + 0.012);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.35), now + safeDur * 0.32);
    env.gain.exponentialRampToValueAtTime(0.0001, now + safeDur);

    oscA.connect(mixA);
    oscB.connect(mixB);
    oscHarm.connect(mixHarm);

    mixA.connect(bodyFilter);
    mixB.connect(bodyFilter);
    mixHarm.connect(bodyFilter);

    bodyFilter.connect(env);
    env.connect(dest);

    oscA.start(now);
    oscB.start(now);
    oscHarm.start(now);

    const stopAt = now + safeDur + 0.04;
    oscA.stop(stopAt);
    oscB.stop(stopAt);
    oscHarm.stop(stopAt);
  });
}

/**
 * Rasgueia um voicing de acorde (da corda mais grave para a mais aguda).
 * @param {{ course: number, freq: number }[]} voicingFreqs
 */
export function strumChordVoicing(voicingFreqs) {
  if (!Array.isArray(voicingFreqs) || !voicingFreqs.length) return;
  unlockAudioEngine();

  voicingFreqs.forEach((item, idx) => {
    const id = window.setTimeout(() => {
      playPluckedNote(item.freq, 1.55, 0.25);
    }, idx * 42);
    sequenceTimers.push(id);
  });
}

/**
 * Arpeja um voicing de acorde nota por nota.
 * @param {{ course: number, freq: number }[]} voicingFreqs
 */
export function arpeggiateChordVoicing(voicingFreqs) {
  if (!Array.isArray(voicingFreqs) || !voicingFreqs.length) return;
  clearSequenceTimers();
  unlockAudioEngine();

  voicingFreqs.forEach((item, idx) => {
    const id = window.setTimeout(() => {
      playPluckedNote(item.freq, 1.35, 0.3);
    }, idx * 210);
    sequenceTimers.push(id);
  });
}

/**
 * Executa uma sequência de escala / Maqam / Jins a partir da tônica `rootQ`.
 * @param {number} rootQ
 * @param {number[]} intervals
 * @param {Record<number, number>} [centsMap={}]
 */
export function playScaleSequence(rootQ, intervals, centsMap = {}) {
  if (!Array.isArray(intervals) || !intervals.length) return;
  clearSequenceTimers();
  unlockAudioEngine();

  const safeRootQ = ((rootQ % 24) + 24) % 24;
  const baseRootFreq = 130.81278 * Math.pow(2, safeRootQ / 24);

  intervals.forEach((intQ, idx) => {
    const centsDev = centsMap[intQ] || 0;
    const freq = baseRootFreq * Math.pow(2, (intQ * 50 + centsDev) / 1200);
    const id = window.setTimeout(() => {
      playPluckedNote(freq, idx === intervals.length - 1 ? 1.5 : 0.9, 0.33);
    }, idx * 320);
    sequenceTimers.push(id);
  });
}

/**
 * Executa uma frase de Taqsim (Sayr) ou caminho de 1 oitava com callback de destaque visual.
 * @param {number} rootQ
 * @param {{ interval_q: number, dur_ms?: number, accent?: boolean }[]} steps
 * @param {Record<number, number>} [centsMap={}]
 * @param {(stepIdx: number) => void} [onStepHighlight]
 */
export function playTaqsimPhrase(rootQ, steps, centsMap = {}, onStepHighlight) {
  if (!Array.isArray(steps) || !steps.length) return;
  clearSequenceTimers();
  unlockAudioEngine();

  const safeRootQ = ((rootQ % 24) + 24) % 24;
  const minInterval = Math.min(...steps.map(s => s.interval_q));
  // Se todos os intervalos forem >= 24 (caminho ancorado em oitava aguda), usa C2 como base para manter altura real
  const baseC = minInterval >= 24 ? 65.40639 : 130.81278;
  const baseRootFreq = baseC * Math.pow(2, safeRootQ / 24);

  let elapsedMs = 0;
  steps.forEach((step, idx) => {
    const durMs = step.dur_ms || 360;
    const modQ = ((step.interval_q % 24) + 24) % 24;
    const centsDev = centsMap[step.interval_q] ?? centsMap[modQ] ?? 0;
    const freq = baseRootFreq * Math.pow(2, (step.interval_q * 50 + centsDev) / 1200);

    const id = window.setTimeout(() => {
      if (onStepHighlight) onStepHighlight(idx);
      playPluckedNote(freq, Math.max(0.7, (durMs / 1000) * 1.9), step.accent ? 0.38 : 0.30);
    }, elapsedMs);
    sequenceTimers.push(id);
    elapsedMs += durMs;
  });

  const endId = window.setTimeout(() => {
    if (onStepHighlight) onStepHighlight(-1);
  }, elapsedMs + 280);
  sequenceTimers.push(endId);
}

/**
 * Agenda a reprodução sequencial dos passos de uma Cadência Modal (Qafla).
 * @param {number} stepCount
 * @param {(stepIdx: number) => void} onStep
 */
export function scheduleCadenceSequence(stepCount, onStep) {
  if (!stepCount || stepCount <= 0) return;
  clearSequenceTimers();
  unlockAudioEngine();

  for (let i = 0; i < stepCount; i++) {
    const id = window.setTimeout(() => {
      onStep(i);
    }, i * 1150);
    sequenceTimers.push(id);
  }
}

function stopDroneNodes() {
  if (!droneNodes) return;
  try {
    const ctx = audioCtx;
    if (ctx) {
      const now = ctx.currentTime;
      droneNodes.gain.gain.cancelScheduledValues(now);
      droneNodes.gain.gain.setValueAtTime(Math.max(0.0001, droneNodes.gain.gain.value), now);
      droneNodes.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      droneNodes.osc1.stop(now + 0.1);
      droneNodes.osc2.stop(now + 0.1);
    } else {
      droneNodes.osc1.stop();
      droneNodes.osc2.stop();
    }
  } catch {
    // Ignora
  }
  droneNodes = null;
}

function startDroneNodes(rootQ) {
  stopDroneNodes();
  const safeRootQ = ((rootQ % 24) + 24) % 24;
  // Base em C3/D3 (oitava audível mesmo em alto-falante de celular) + quinta justa sutil
  const rootFreq = 130.81278 * Math.pow(2, safeRootQ / 24);
  const fifthFreq = rootFreq * 1.498307;

  withReadyAudio((ctx, dest) => {
    const now = ctx.currentTime + 0.01;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "sawtooth";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(rootFreq, now);
    osc2.frequency.setValueAtTime(fifthFreq, now);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(480, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.25);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc1.start(now);
    osc2.start(now);

    droneNodes = { osc1, osc2, filter, gain };
  });
}

function updateDroneButtonUI(isActive, rootQ, btnEl) {
  if (!btnEl) return;
  const safeRootQ = ((rootQ % 24) + 24) % 24;
  const rootName = PITCH_CLASSES_24[safeRootQ]?.flat || "C";
  btnEl.classList.toggle("active-toggle", isActive);
  btnEl.textContent = isActive ? `🔊 Drone: ${rootName}` : "🔊 Drone: OFF";
}

/**
 * Liga ou desliga o Drone contínuo (Qarar + 5ª) e atualiza o botão.
 * @param {boolean} currentlyActive
 * @param {number} rootQ
 * @param {HTMLElement | null} btnEl
 * @returns {boolean}
 */
export function toggleDroneAudio(currentlyActive, rootQ, btnEl) {
  unlockAudioEngine();
  const nextActive = !currentlyActive;
  if (nextActive) {
    startDroneNodes(rootQ);
  } else {
    stopDroneNodes();
  }
  updateDroneButtonUI(nextActive, rootQ, btnEl);
  return nextActive;
}

/**
 * Atualiza a altura do Drone caso esteja ativo.
 * @param {boolean} isActive
 * @param {number} rootQ
 * @param {HTMLElement | null} btnEl
 */
export function updateDronePitch(isActive, rootQ, btnEl) {
  updateDroneButtonUI(isActive, rootQ, btnEl);
  if (!isActive || !droneNodes || !audioCtx) return;

  const safeRootQ = ((rootQ % 24) + 24) % 24;
  const rootFreq = 130.81278 * Math.pow(2, safeRootQ / 24);
  const fifthFreq = rootFreq * 1.498307;
  const now = audioCtx.currentTime;

  droneNodes.osc1.frequency.setTargetAtTime(rootFreq, now, 0.04);
  droneNodes.osc2.frequency.setTargetAtTime(fifthFreq, now, 0.04);
}

/**
 * Síntese percussiva de Darbuka & Riq (DUM grave, TAK agudo, KAH suave).
 * @param {"DUM"|"TAK"|"KAH"|"REST"} stroke
 */
function playIqaStroke(stroke) {
  if (stroke === "REST") return;

  withReadyAudio((ctx, dest) => {
    const now = ctx.currentTime + 0.004;

    if (stroke === "DUM") {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(78, now + 0.16);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(0.48, now + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

      osc.connect(env);
      env.connect(dest);
      osc.start(now);
      osc.stop(now + 0.26);
      return;
    }

    // TAK / KAH: transiente percussivo de borda de pele + ruído filtrado curto
    const isTak = stroke === "TAK";
    const toneOsc = ctx.createOscillator();
    const toneEnv = ctx.createGain();
    toneOsc.type = "triangle";
    toneOsc.frequency.setValueAtTime(isTak ? 520 : 390, now);
    toneOsc.frequency.exponentialRampToValueAtTime(isTak ? 290 : 220, now + 0.055);

    toneEnv.gain.setValueAtTime(0.0001, now);
    toneEnv.gain.linearRampToValueAtTime(isTak ? 0.26 : 0.15, now + 0.003);
    toneEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    toneOsc.connect(toneEnv);
    toneEnv.connect(dest);
    toneOsc.start(now);
    toneOsc.stop(now + 0.085);

    const noiseLen = Math.floor(ctx.sampleRate * 0.055);
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseLen * 0.28));
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const hp = ctx.createBiquadFilter();
    hp.type = "bandpass";
    hp.frequency.setValueAtTime(isTak ? 2600 : 1750, now);
    hp.Q.setValueAtTime(1.6, now);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(isTak ? 0.22 : 0.12, now);
    nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    noiseSrc.connect(hp);
    hp.connect(nGain);
    nGain.connect(dest);
    noiseSrc.start(now);
  });
}

/**
 * Inicia o motor rítmico Iqa' (Darbuka & Riq).
 * @param {{ pattern: { stroke: "DUM"|"TAK"|"KAH"|"REST", label: string }[] }} iqaObj
 * @param {number} bpm
 * @param {(beatIdx: number) => void} [onBeat]
 */
export function startIqaEngine(iqaObj, bpm, onBeat) {
  stopIqaEngine();
  if (!iqaObj || !Array.isArray(iqaObj.pattern) || !iqaObj.pattern.length) return;
  unlockAudioEngine();

  const safeBpm = Math.max(40, Math.min(200, bpm || 96));
  const stepMs = Math.round((60000 / safeBpm) / 2); // Colcheia por passo da grade
  let stepIdx = 0;

  const triggerStep = () => {
    const step = iqaObj.pattern[stepIdx];
    if (step) {
      playIqaStroke(step.stroke);
      if (onBeat) onBeat(stepIdx);
    }
    stepIdx = (stepIdx + 1) % iqaObj.pattern.length;
  };

  triggerStep();
  iqaIntervalId = window.setInterval(triggerStep, stepMs);
}

export function stopIqaEngine() {
  if (iqaIntervalId !== null) {
    window.clearInterval(iqaIntervalId);
    iqaIntervalId = null;
  }
}
