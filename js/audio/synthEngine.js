// @ts-check
import { PITCH_CLASSES_24 } from "../core/database.js";

/** @type {AudioContext | null} */
let audioCtx = null;
/** @type {GainNode | null} */
let masterGain = null;
/** @type {GainNode | null} */
let oudBodyInput = null;
/** @type {AudioBuffer | null} */
let rishaNoiseBuffer = null;

/** @type {HTMLAudioElement | null} */
let iosKeepAliveAudio = null;
/** @type {string | null} */
let iosSilentBlobUrl = null;
/** @type {number | undefined} */
let iosIdlePauseTimer;

/** @type {number[]} */
let sequenceTimers = [];
/** @type {number | null} */
let iqaIntervalId = null;

/** @type {{ osc1: OscillatorNode, osc2: OscillatorNode, filter: BiquadFilterNode, gain: GainNode } | null} */
let droneNodes = null;

/**
 * Gera um WAV PCM silencioso de 0,5 segundo em Blob URL (sem peso de base64)
 * para manter a categoria AVAudioSessionCategoryPlayback ativa no iOS/WKWebView.
 */
function getSilentWavBlobUrl() {
  if (iosSilentBlobUrl) return iosSilentBlobUrl;

  const sampleRate = 22050;
  const numSamples = 11025; // 0.5s
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (/** @type {number} */ offset, /** @type {string} */ str) => {
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

  const blob = new Blob([buffer], { type: "audio/wav" });
  iosSilentBlobUrl = URL.createObjectURL(blob);
  return iosSilentBlobUrl;
}

/**
 * Garante o elemento HTML5 <audio loop playsinline> anexado ao DOM (exigência do WKWebView).
 * IMPORTANTE: muted DEVE ser false e volume > 0 para o iOS ativar a rota Playback.
 */
function ensureIosKeepAliveElement() {
  if (typeof document === "undefined") return null;
  if (iosKeepAliveAudio) return iosKeepAliveAudio;

  const audioEl = document.createElement("audio");
  audioEl.setAttribute("playsinline", "");
  audioEl.setAttribute("webkit-playsinline", "");
  audioEl.setAttribute("x-webkit-airplay", "deny");
  audioEl.preload = "auto";
  audioEl.loop = true;
  audioEl.muted = false;
  audioEl.volume = 1;
  /** @type {any} */ (audioEl).disableRemotePlayback = true;
  audioEl.src = getSilentWavBlobUrl();

  audioEl.style.position = "fixed";
  audioEl.style.width = "0";
  audioEl.style.height = "0";
  audioEl.style.opacity = "0";
  audioEl.style.pointerEvents = "none";
  audioEl.setAttribute("aria-hidden", "true");

  if (document.body) {
    document.body.appendChild(audioEl);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.body && !audioEl.parentNode) {
        document.body.appendChild(audioEl);
      }
    }, { once: true });
  }

  iosKeepAliveAudio = audioEl;
  return audioEl;
}

/**
 * Agenda a pausa do loop silencioso após 12 s sem atividade (se Drone e Iqa' estiverem desligados),
 * evitando gasto de bateria em repouso.
 */
function scheduleIosKeepAlivePause() {
  window.clearTimeout(iosIdlePauseTimer);
  if (droneNodes !== null || iqaIntervalId !== null) return;

  iosIdlePauseTimer = window.setTimeout(() => {
    if (droneNodes !== null || iqaIntervalId !== null) return;
    if (iosKeepAliveAudio && !iosKeepAliveAudio.paused) {
      try {
        iosKeepAliveAudio.pause();
      } catch {
        // Ignora
      }
    }
  }, 12000);
}

/**
 * Configura a sessão de áudio do iOS 17+ para Playback (Safari nativo).
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
 * Monta o barramento compartilhado de Formantes da Caixa Acústica do Oud:
 * - Rota direta suavizada (clareza do ataque da risha)
 * - 4 formantes paralelos (roseta Helmholtz, modo principal do tampo, madeira média e presença)
 * - 2 reflexões internas curtas do bojo de madeira (sem cauda longa para não embolar Taqsim)
 *
 * @param {AudioContext} ctx
 * @param {AudioNode} dest
 * @returns {GainNode}
 */
function createOudBodyFormantBus(ctx, dest) {
  const input = ctx.createGain();
  input.gain.setValueAtTime(1.0, ctx.currentTime);

  const busOut = ctx.createGain();
  busOut.gain.setValueAtTime(0.95, ctx.currentTime);

  // Limpeza sub-grave abaixo de 52 Hz para manter o bordão C2 (65.41 Hz) firme no celular
  const subCleanup = ctx.createBiquadFilter();
  subCleanup.type = "highpass";
  subCleanup.frequency.setValueAtTime(52, ctx.currentTime);
  subCleanup.Q.setValueAtTime(0.7, ctx.currentTime);
  busOut.connect(subCleanup);
  subCleanup.connect(dest);

  // 1. Rota direta quente (preserva definição do ataque e articulação rápida)
  const dryLp = ctx.createBiquadFilter();
  dryLp.type = "lowpass";
  dryLp.frequency.setValueAtTime(4200, ctx.currentTime);
  dryLp.Q.setValueAtTime(0.7, ctx.currentTime);

  const dryGain = ctx.createGain();
  dryGain.gain.setValueAtTime(0.54, ctx.currentTime);

  input.connect(dryLp);
  dryLp.connect(dryGain);
  dryGain.connect(busOut);

  // 2. Banco de 4 Formantes do Corpo do Oud (Bojo + Tampo + Roseta)
  const formants = [
    { freq: 112, q: 3.1, gain: 0.36 },  // Ressonância de ar da roseta (Helmholtz)
    { freq: 255, q: 2.7, gain: 0.46 },  // Modo principal do tampo (abeto / cedro)
    { freq: 540, q: 2.3, gain: 0.34 },  // Corpo médio amadeirado
    { freq: 1180, q: 1.9, gain: 0.21 }  // Projeção nasal típica do Oud acústico
  ];

  formants.forEach(f => {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(f.freq, ctx.currentTime);
    bp.Q.setValueAtTime(f.q, ctx.currentTime);

    const g = ctx.createGain();
    g.gain.setValueAtTime(f.gain, ctx.currentTime);

    input.connect(bp);
    bp.connect(g);
    g.connect(busOut);
  });

  // 3. Micro-reflexões internas da caixa acústica (7 ms e 13 ms filtradas)
  const chamberFilter = ctx.createBiquadFilter();
  chamberFilter.type = "lowpass";
  chamberFilter.frequency.setValueAtTime(1650, ctx.currentTime);
  chamberFilter.Q.setValueAtTime(0.6, ctx.currentTime);

  const tap1 = ctx.createDelay(0.05);
  tap1.delayTime.setValueAtTime(0.0073, ctx.currentTime);
  const tap1Gain = ctx.createGain();
  tap1Gain.gain.setValueAtTime(0.12, ctx.currentTime);

  const tap2 = ctx.createDelay(0.05);
  tap2.delayTime.setValueAtTime(0.0137, ctx.currentTime);
  const tap2Gain = ctx.createGain();
  tap2Gain.gain.setValueAtTime(0.08, ctx.currentTime);

  input.connect(chamberFilter);
  chamberFilter.connect(tap1);
  chamberFilter.connect(tap2);
  tap1.connect(tap1Gain);
  tap2.connect(tap2Gain);
  tap1Gain.connect(busOut);
  tap2Gain.connect(busOut);

  return input;
}

/**
 * Pré-gera o buffer de ruído curto (35 ms) usado para o clique da palheta (risha de celuloide).
 * @param {AudioContext} ctx
 * @returns {AudioBuffer}
 */
function createRishaNoiseBuffer(ctx) {
  const sampleRate = ctx.sampleRate || 44100;
  const length = Math.max(256, Math.floor(sampleRate * 0.035));
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  let prev = 0;
  for (let i = 0; i < length; i++) {
    const t = i / length;
    const white = Math.random() * 2 - 1;
    // Ruído levemente diferenciado (ênfase no estalo de celuloide) com envelope rápido
    const crisp = white - 0.35 * prev;
    prev = white;
    const env = Math.pow(1 - t, 2.4);
    data[i] = crisp * env;
  }

  return buffer;
}

/**
 * Garante que o AudioContext, o barramento master e o ressonador de caixa existam.
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
    masterGain.gain.setValueAtTime(0.88, audioCtx.currentTime);

    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-9, audioCtx.currentTime);
    limiter.knee.setValueAtTime(14, audioCtx.currentTime);
    limiter.ratio.setValueAtTime(6, audioCtx.currentTime);
    limiter.attack.setValueAtTime(0.003, audioCtx.currentTime);
    limiter.release.setValueAtTime(0.11, audioCtx.currentTime);

    masterGain.connect(limiter);
    limiter.connect(audioCtx.destination);

    oudBodyInput = createOudBodyFormantBus(audioCtx, masterGain);
    rishaNoiseBuffer = createRishaNoiseBuffer(audioCtx);
  }

  return audioCtx;
}

/**
 * Executa o desbloqueio síncrono e ativa o keep-alive de Playback no iPhone/Chrome.
 * Deve ser chamado diretamente dentro de um evento de gesto do usuário (touchend / click).
 */
export function unlockAudioEngine() {
  const ctx = ensureAudioContext();
  configureIosAudioSession();

  // 1. Mantém o <audio loop> silencioso rodando para ignorar a chave física de silencioso no iOS
  const keepAlive = ensureIosKeepAliveElement();
  if (keepAlive && keepAlive.paused) {
    try {
      const p = keepAlive.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Será tentado novamente no próximo touchend/click válido
        });
      }
    } catch {
      // Ignora
    }
  }
  scheduleIosKeepAlivePause();

  if (!ctx) return;

  // 2. Retoma AudioContext se estiver suspended ou interrupted (estado exclusivo do iOS)
  if (ctx.state !== "running") {
    ctx.resume().catch(() => {
      // Ignora fora de gesto válido
    });
  }

  // 3. Dispara buffer silencioso de 1 sample no Web Audio para acordar o hardware no WKWebView
  try {
    const silentBuf = ctx.createBuffer(1, 1, ctx.sampleRate || 22050);
    const src = ctx.createBufferSource();
    src.buffer = silentBuf;
    src.connect(ctx.destination);
    src.start(0);
  } catch {
    // Ignora
  }
}

/**
 * Garante que o contexto esteja rodando antes de agendar a síntese.
 * @param {(ctx: AudioContext, dest: AudioNode, bodyDest: AudioNode) => void} fn
 */
function withReadyAudio(fn) {
  const ctx = ensureAudioContext();
  if (!ctx || !masterGain || !oudBodyInput) return;

  scheduleIosKeepAlivePause();

  if (ctx.state === "running") {
    fn(ctx, masterGain, oudBodyInput);
    return;
  }

  unlockAudioEngine();
  ctx.resume()
    .then(() => {
      if (audioCtx && masterGain && oudBodyInput) {
        fn(audioCtx, masterGain, oudBodyInput);
      }
    })
    .catch(() => {
      // Fallback caso o navegador exija novo gesto
    });
}

// Registra desbloqueio na fase de captura (touchend + click garantem ativação no Chrome iOS)
if (typeof window !== "undefined") {
  const handleUserGesture = () => {
    unlockAudioEngine();
  };

  window.addEventListener("touchend", handleUserGesture, { capture: true, passive: true });
  window.addEventListener("click", handleUserGesture, { capture: true, passive: true });
  window.addEventListener("pointerup", handleUserGesture, { capture: true, passive: true });
  window.addEventListener("keydown", handleUserGesture, { capture: true, passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (iosKeepAliveAudio && !iosKeepAliveAudio.paused && droneNodes === null && iqaIntervalId === null) {
        try {
          iosKeepAliveAudio.pause();
        } catch {
          // Ignora
        }
      }
    } else if (document.visibilityState === "visible" && audioCtx && audioCtx.state !== "running") {
      audioCtx.resume().catch(() => {});
    }
  });
}

export function clearSequenceTimers() {
  sequenceTimers.forEach(id => window.clearTimeout(id));
  sequenceTimers = [];
}

/**
 * Síntese FM Acústica de Oud com Corda Dupla + Transiente de Risha + Formantes de Caixa.
 * Preserva o centro exato de frequência (24-TET + cents_dev) via desafinação simétrica.
 *
 * @param {number} freq
 * @param {number} [duration=1.45]
 * @param {number} [volume=0.34]
 */
export function playPluckedNote(freq, duration = 1.45, volume = 0.34) {
  if (!Number.isFinite(freq) || freq <= 20) return;

  withReadyAudio((ctx, _masterDest, bodyDest) => {
    const now = ctx.currentTime + 0.004;
    const safeDur = Math.max(0.24, duration);

    // Micro-variação orgânica apenas de timbre/dinâmica (NUNCA altera o centro de afinação)
    const timbreJitter = 0.94 + Math.random() * 0.12;
    const volJitter = 0.96 + Math.random() * 0.08;
    const safeVol = Math.max(0.02, volume * volJitter);

    // Registro grave (ordens 6ª e 5ª) tem ataque mais encorpado e corda menos desafinada
    const isBassCourse = freq < 125;
    const isHighCourse = freq > 310;
    const symDetuneRatio = isBassCourse ? 0.00055 : 0.00105;

    // 1. Par de portadores simétricos (ordem dupla de Oud com centro de pitch exato = freq)
    const carrierA = ctx.createOscillator();
    const carrierB = ctx.createOscillator();
    carrierA.type = "sine";
    carrierB.type = "sine";
    carrierA.frequency.setValueAtTime(freq * (1 - symDetuneRatio), now);
    carrierB.frequency.setValueAtTime(freq * (1 + symDetuneRatio), now);

    // Leve ganho de 2º harmônico puro nos bordões para projeção clara em alto-falantes de celular
    const bassHarmOsc = ctx.createOscillator();
    bassHarmOsc.type = "sine";
    bassHarmOsc.frequency.setValueAtTime(freq * 2, now);
    const bassHarmGain = ctx.createGain();
    bassHarmGain.gain.setValueAtTime(isBassCourse ? 0.24 : 0.08, now);
    bassHarmGain.gain.exponentialRampToValueAtTime(0.0001, now + safeDur * 0.65);

    // 2. Modulador FM Principal (razão 2:1 — calor amadeirado de corda dedilhada)
    const modPrimary = ctx.createOscillator();
    modPrimary.type = "sine";
    modPrimary.frequency.setValueAtTime(freq * 2, now);

    // Índice de modulação decai rápido: brilho de ataque → corpo quente
    const baseModDepth = isBassCourse ? freq * 2.55 : (isHighCourse ? freq * 1.15 : freq * 1.75);
    const peakModHz = Math.min(1850, baseModDepth * timbreJitter);
    const sustainModHz = Math.max(8, peakModHz * 0.16);

    const modPrimaryGain = ctx.createGain();
    modPrimaryGain.gain.setValueAtTime(peakModHz, now);
    modPrimaryGain.gain.exponentialRampToValueAtTime(sustainModHz, now + 0.042);
    modPrimaryGain.gain.exponentialRampToValueAtTime(Math.max(1.5, sustainModHz * 0.25), now + safeDur * 0.45);
    modPrimaryGain.gain.exponentialRampToValueAtTime(0.001, now + safeDur);

    // 3. Sub-modulador de ataque curto (razão 3.004 — mordida percussiva da palheta no início)
    const modBite = ctx.createOscillator();
    modBite.type = "sine";
    modBite.frequency.setValueAtTime(freq * 3.004, now);

    const bitePeakHz = Math.min(920, freq * (isHighCourse ? 0.55 : 0.92) * timbreJitter);
    const modBiteGain = ctx.createGain();
    modBiteGain.gain.setValueAtTime(bitePeakHz, now);
    modBiteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.026);

    // Conecta moduladores à frequência dos dois portadores
    modPrimary.connect(modPrimaryGain);
    modPrimaryGain.connect(carrierA.frequency);
    modPrimaryGain.connect(carrierB.frequency);

    modBite.connect(modBiteGain);
    modBiteGain.connect(carrierA.frequency);
    modBiteGain.connect(carrierB.frequency);

    // Mistura dos portadores + filtro dinâmico de amortecimento natural da corda
    const stringMix = ctx.createGain();
    stringMix.gain.setValueAtTime(0.56, now);

    const carrierBGain = ctx.createGain();
    // 6ª ordem costuma soar mais focada (par de menor batimento)
    carrierBGain.gain.setValueAtTime(isBassCourse ? 0.45 : 0.85, now);

    const stringDampFilter = ctx.createBiquadFilter();
    stringDampFilter.type = "lowpass";
    const startCutoff = Math.min(5400, Math.max(1500, freq * 8.2 * timbreJitter));
    const endCutoff = Math.min(1350, Math.max(380, freq * 2.1));
    stringDampFilter.frequency.setValueAtTime(startCutoff, now);
    stringDampFilter.frequency.exponentialRampToValueAtTime(endCutoff, now + safeDur * 0.72);
    stringDampFilter.Q.setValueAtTime(0.9, now);

    // Envelope acústico de amplitude (ataque rápido de 4 ms + queda dupla natural)
    const ampEnv = ctx.createGain();
    ampEnv.gain.setValueAtTime(0.0001, now);
    ampEnv.gain.linearRampToValueAtTime(safeVol * 1.18, now + 0.0045);
    ampEnv.gain.exponentialRampToValueAtTime(Math.max(0.0001, safeVol * 0.46), now + Math.min(0.28, safeDur * 0.24));
    ampEnv.gain.exponentialRampToValueAtTime(Math.max(0.0001, safeVol * 0.12), now + safeDur * 0.68);
    ampEnv.gain.exponentialRampToValueAtTime(0.0001, now + safeDur);

    carrierA.connect(stringMix);
    carrierB.connect(carrierBGain);
    carrierBGain.connect(stringMix);
    bassHarmOsc.connect(bassHarmGain);
    bassHarmGain.connect(stringMix);

    stringMix.connect(stringDampFilter);
    stringDampFilter.connect(ampEnv);
    ampEnv.connect(bodyDest);

    // 4. Transiente de Risha (palheta de celuloide) pré-alocado
    if (rishaNoiseBuffer) {
      const rishaSrc = ctx.createBufferSource();
      rishaSrc.buffer = rishaNoiseBuffer;
      // Variação leve de taxa de leitura dá textura diferente a cada toque
      rishaSrc.playbackRate.setValueAtTime(0.92 + Math.random() * 0.18, now);

      const rishaFilter = ctx.createBiquadFilter();
      rishaFilter.type = "bandpass";
      const clickFreq = Math.min(3700, Math.max(1450, freq * 6.8 * timbreJitter));
      rishaFilter.frequency.setValueAtTime(clickFreq, now);
      rishaFilter.Q.setValueAtTime(1.75, now);

      const rishaGain = ctx.createGain();
      const clickLevel = safeVol * (isBassCourse ? 0.42 : 0.34);
      rishaGain.gain.setValueAtTime(Math.max(0.0001, clickLevel), now);
      rishaGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.017);

      rishaSrc.connect(rishaFilter);
      rishaFilter.connect(rishaGain);
      rishaGain.connect(bodyDest);

      rishaSrc.start(now);
      rishaSrc.stop(now + 0.025);
    }

    carrierA.start(now);
    carrierB.start(now);
    bassHarmOsc.start(now);
    modPrimary.start(now);
    modBite.start(now);

    const stopAt = now + safeDur + 0.04;
    carrierA.stop(stopAt);
    carrierB.stop(stopAt);
    bassHarmOsc.stop(stopAt);
    modPrimary.stop(stopAt);
    modBite.stop(now + 0.045);
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
      playPluckedNote(item.freq, 1.6, 0.25);
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
      playPluckedNote(item.freq, 1.4, 0.3);
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
      playPluckedNote(freq, idx === intervals.length - 1 ? 1.55 : 0.95, 0.33);
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
      playPluckedNote(freq, Math.max(0.75, (durMs / 1000) * 1.95), step.accent ? 0.37 : 0.30);
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
  scheduleIosKeepAlivePause();
}

function startDroneNodes(rootQ) {
  stopDroneNodes();
  const safeRootQ = ((rootQ % 24) + 24) % 24;
  const rootFreq = 130.81278 * Math.pow(2, safeRootQ / 24);
  const fifthFreq = rootFreq * 1.498307;

  withReadyAudio((ctx, masterDest) => {
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
    gain.connect(masterDest);

    osc1.start(now);
    osc2.start(now);

    droneNodes = { osc1, osc2, filter, gain };
    window.clearTimeout(iosIdlePauseTimer);
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

  withReadyAudio((ctx, masterDest) => {
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
      env.connect(masterDest);
      osc.start(now);
      osc.stop(now + 0.26);
      return;
    }

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
    toneEnv.connect(masterDest);
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
    nGain.connect(masterDest);
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
  window.clearTimeout(iosIdlePauseTimer);

  const safeBpm = Math.max(40, Math.min(200, bpm || 96));
  const stepMs = Math.round((60000 / safeBpm) / 2);
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
  scheduleIosKeepAlivePause();
}
