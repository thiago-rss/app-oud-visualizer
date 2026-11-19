// @ts-check
import { PITCH_CLASSES_24 } from "../core/database.js";

/** @typedef {"syrian"|"egyptian"} OudTimbreProfile */

/** @type {OudTimbreProfile} */
let activeTimbreProfile = "syrian";

const TIMBRE_PROFILES = {
  syrian: {
    pluckPosMin: 0.118,
    pluckPosRange: 0.024,
    pluckPairOffset: 0.011,
    combDepth: 0.78,
    lpG: { bass: 0.28, mid: 0.33, high: 0.38 },
    smoothCoeff: { bass: 0.54, mid: 0.48, high: 0.42 },
    triWeight: { bass: 0.36, other: 0.26 },
    decayMult: 0.96,
    rishaLevel: 0.32,
    rishaFreqMult: 6.2,
    rishaFreqMin: 1500,
    rishaFreqMax: 2850,
    rishaQ: 1.35,
    dryGain: 0.48,
    wetGain: 0.62,
    highpassHz: 56,
    lowWarmthHz: 210,
    lowWarmthQ: 1.2,
    lowWarmthGain: 1.1,
    nasalHz: 920,
    nasalQ: 1.7,
    nasalGain: 3.2,
    harshTrimHz: 5200
  },
  egyptian: {
    pluckPosMin: 0.205,
    pluckPosRange: 0.035,
    pluckPairOffset: 0.015,
    combDepth: 0.62,
    lpG: { bass: 0.36, mid: 0.43, high: 0.49 },
    smoothCoeff: { bass: 0.65, mid: 0.58, high: 0.50 },
    triWeight: { bass: 0.48, other: 0.36 },
    decayMult: 1.12,
    rishaLevel: 0.24,
    rishaFreqMult: 4.8,
    rishaFreqMin: 1050,
    rishaFreqMax: 2150,
    rishaQ: 1.1,
    dryGain: 0.32,
    wetGain: 0.86,
    highpassHz: 48,
    lowWarmthHz: 205,
    lowWarmthQ: 1.05,
    lowWarmthGain: 3.2,
    nasalHz: 780,
    nasalQ: 1.2,
    nasalGain: 0.4,
    harshTrimHz: 4100
  }
};

/** @type {AudioContext | null} */
let audioCtx = null;
/** @type {GainNode | null} */
let masterGain = null;
/** @type {GainNode | null} */
let oudBodyInput = null;
/** @type {AudioBuffer | null} */
let rishaThumpBuffer = null;

/**
 * Referências do barramento de corpo para chavear instantaneamente entre Sírio e Egípcio.
 * @type {{
 *   input: GainNode,
 *   dryGain: GainNode,
 *   wetGain: GainNode,
 *   convolverSyrian: ConvolverNode,
 *   convolverEgyptian: ConvolverNode,
 *   connectedConvolver: ConvolverNode,
 *   highpass: BiquadFilterNode,
 *   lowWarmth: BiquadFilterNode,
 *   nasalPresence: BiquadFilterNode,
 *   harshTrim: BiquadFilterNode
 * } | null}
 */
let bodyBusNodes = null;

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
 * Sintetiza uma Impulse Response (IR) modal de caixa acústica de Oud
 * calibrada para o perfil "syrian" (seca e anasalada) ou "egyptian" (redonda e encorpada).
 *
 * @param {AudioContext} ctx
 * @param {OudTimbreProfile} profile
 * @returns {AudioBuffer}
 */
function createAcousticOudBodyIR(ctx, profile) {
  const sampleRate = ctx.sampleRate || 44100;
  const isSyrian = profile === "syrian";
  const durationSec = isSyrian ? 0.155 : 0.195;
  const length = Math.floor(sampleRate * durationSec);
  const irBuffer = ctx.createBuffer(1, length, sampleRate);
  const data = irBuffer.getChannelData(0);

  data[0] = isSyrian ? 0.44 : 0.34;
  data[1] = isSyrian ? 0.22 : 0.25;
  data[2] = isSyrian ? 0.08 : 0.13;

  const modes = isSyrian
    ? [
        { freq: 102,  decay: 0.068, amp: 0.21, phase: 0.20 },
        { freq: 122,  decay: 0.058, amp: 0.16, phase: 1.45 },
        { freq: 205,  decay: 0.082, amp: 0.30, phase: 0.65 },
        { freq: 262,  decay: 0.078, amp: 0.31, phase: 2.10 },
        { freq: 345,  decay: 0.070, amp: 0.28, phase: 3.80 },
        { freq: 448,  decay: 0.066, amp: 0.34, phase: 1.15 },
        { freq: 560,  decay: 0.062, amp: 0.44, phase: 4.50 },
        { freq: 710,  decay: 0.058, amp: 0.42, phase: 2.75 },
        { freq: 910,  decay: 0.054, amp: 0.46, phase: 0.90 },
        { freq: 1140, decay: 0.048, amp: 0.38, phase: 5.10 },
        { freq: 1420, decay: 0.041, amp: 0.28, phase: 1.95 },
        { freq: 1780, decay: 0.034, amp: 0.20, phase: 3.30 },
        { freq: 2240, decay: 0.027, amp: 0.13, phase: 0.40 },
        { freq: 2820, decay: 0.021, amp: 0.08, phase: 2.55 },
        { freq: 3520, decay: 0.015, amp: 0.05, phase: 4.20 }
      ]
    : [
        { freq: 94,   decay: 0.110, amp: 0.36, phase: 0.20 },
        { freq: 112,  decay: 0.095, amp: 0.26, phase: 1.45 },
        { freq: 192,  decay: 0.128, amp: 0.48, phase: 0.65 },
        { freq: 238,  decay: 0.118, amp: 0.45, phase: 2.10 },
        { freq: 312,  decay: 0.102, amp: 0.34, phase: 3.80 },
        { freq: 408,  decay: 0.090, amp: 0.34, phase: 1.15 },
        { freq: 525,  decay: 0.078, amp: 0.33, phase: 4.50 },
        { freq: 660,  decay: 0.068, amp: 0.25, phase: 2.75 },
        { freq: 825,  decay: 0.058, amp: 0.20, phase: 0.90 },
        { freq: 1030, decay: 0.050, amp: 0.17, phase: 5.10 },
        { freq: 1290, decay: 0.042, amp: 0.13, phase: 1.95 },
        { freq: 1610, decay: 0.035, amp: 0.10, phase: 3.30 },
        { freq: 2020, decay: 0.028, amp: 0.07, phase: 0.40 },
        { freq: 2560, decay: 0.022, amp: 0.04, phase: 2.55 },
        { freq: 3200, decay: 0.016, amp: 0.03, phase: 4.20 }
      ];

  let seed = isSyrian ? 133791 : 271828;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 1073741823.5) - 1;
  };

  let woodNoiseLP = 0;
  const twoPi = Math.PI * 2;
  const noiseAlpha = isSyrian ? 0.26 : 0.18;
  const noiseLevel = isSyrian ? 0.065 : 0.090;
  const noiseDecay = isSyrian ? 0.022 : 0.032;

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    let sum = data[i];

    for (let m = 0; m < modes.length; m++) {
      const mode = modes[m];
      const env = Math.exp(-t / mode.decay);
      sum += mode.amp * env * Math.sin(twoPi * mode.freq * t + mode.phase);
    }

    const rawN = nextRand();
    woodNoiseLP = woodNoiseLP * (1 - noiseAlpha) + rawN * noiseAlpha;
    sum += woodNoiseLP * noiseLevel * Math.exp(-t / noiseDecay);

    data[i] = sum;
  }

  let sumSq = 0;
  for (let i = 0; i < length; i++) {
    sumSq += data[i] * data[i];
  }
  const rms = Math.sqrt(sumSq / length) || 1;
  const normGain = (isSyrian ? 0.052 : 0.056) / rms;
  for (let i = 0; i < length; i++) {
    data[i] *= normGain;
  }

  return irBuffer;
}

/**
 * Aplica os parâmetros de EQ, ganho seco/molhado e Convolver ativo no barramento do Oud.
 */
function applyTimbreProfileToBodyBus() {
  if (!audioCtx || !bodyBusNodes) return;
  const cfg = TIMBRE_PROFILES[activeTimbreProfile] || TIMBRE_PROFILES.syrian;
  const now = audioCtx.currentTime;

  bodyBusNodes.dryGain.gain.setTargetAtTime(cfg.dryGain, now, 0.02);
  bodyBusNodes.wetGain.gain.setTargetAtTime(cfg.wetGain, now, 0.02);

  bodyBusNodes.highpass.frequency.setTargetAtTime(cfg.highpassHz, now, 0.02);
  bodyBusNodes.lowWarmth.frequency.setTargetAtTime(cfg.lowWarmthHz, now, 0.02);
  bodyBusNodes.lowWarmth.Q.setTargetAtTime(cfg.lowWarmthQ, now, 0.02);
  bodyBusNodes.lowWarmth.gain.setTargetAtTime(cfg.lowWarmthGain, now, 0.02);

  bodyBusNodes.nasalPresence.frequency.setTargetAtTime(cfg.nasalHz, now, 0.02);
  bodyBusNodes.nasalPresence.Q.setTargetAtTime(cfg.nasalQ, now, 0.02);
  bodyBusNodes.nasalPresence.gain.setTargetAtTime(cfg.nasalGain, now, 0.02);

  bodyBusNodes.harshTrim.frequency.setTargetAtTime(cfg.harshTrimHz, now, 0.02);

  const desiredConvolver = activeTimbreProfile === "egyptian"
    ? bodyBusNodes.convolverEgyptian
    : bodyBusNodes.convolverSyrian;

  if (bodyBusNodes.connectedConvolver !== desiredConvolver) {
    try {
      bodyBusNodes.input.disconnect(bodyBusNodes.connectedConvolver);
    } catch {
      // Ignora
    }
    bodyBusNodes.input.connect(desiredConvolver);
    bodyBusNodes.connectedConvolver = desiredConvolver;
  }
}

/**
 * Define o caráter sonoro do Oud ("syrian" = seco/anasaldo, "egyptian" = redondo/encorpado).
 * @param {OudTimbreProfile} profile
 * @returns {OudTimbreProfile}
 */
export function setOudTimbreProfile(profile) {
  activeTimbreProfile = profile === "egyptian" ? "egyptian" : "syrian";
  applyTimbreProfileToBodyBus();
  return activeTimbreProfile;
}

/**
 * Retorna o caráter sonoro ativo ("syrian" | "egyptian").
 * @returns {OudTimbreProfile}
 */
export function getOudTimbreProfile() {
  return activeTimbreProfile;
}

/**
 * Monta o barramento acústico do Oud com 2 ConvolverNodes pré-carregados (Sírio & Egípcio)
 * + rota seca + EQ paramétrico de tampo.
 * @param {AudioContext} ctx
 * @param {AudioNode} dest
 * @returns {GainNode}
 */
function createOudAcousticBodyBus(ctx, dest) {
  const cfg = TIMBRE_PROFILES[activeTimbreProfile] || TIMBRE_PROFILES.syrian;
  const now = ctx.currentTime;

  const input = ctx.createGain();
  input.gain.setValueAtTime(1.0, now);

  const busOut = ctx.createGain();
  busOut.gain.setValueAtTime(1.02, now);

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.setValueAtTime(cfg.highpassHz, now);
  highpass.Q.setValueAtTime(0.7, now);

  const lowWarmth = ctx.createBiquadFilter();
  lowWarmth.type = "peaking";
  lowWarmth.frequency.setValueAtTime(cfg.lowWarmthHz, now);
  lowWarmth.Q.setValueAtTime(cfg.lowWarmthQ, now);
  lowWarmth.gain.setValueAtTime(cfg.lowWarmthGain, now);

  const nasalPresence = ctx.createBiquadFilter();
  nasalPresence.type = "peaking";
  nasalPresence.frequency.setValueAtTime(cfg.nasalHz, now);
  nasalPresence.Q.setValueAtTime(cfg.nasalQ, now);
  nasalPresence.gain.setValueAtTime(cfg.nasalGain, now);

  const harshTrim = ctx.createBiquadFilter();
  harshTrim.type = "lowpass";
  harshTrim.frequency.setValueAtTime(cfg.harshTrimHz, now);
  harshTrim.Q.setValueAtTime(0.65, now);

  busOut.connect(highpass);
  highpass.connect(lowWarmth);
  lowWarmth.connect(nasalPresence);
  nasalPresence.connect(harshTrim);
  harshTrim.connect(dest);

  const dryGain = ctx.createGain();
  dryGain.gain.setValueAtTime(cfg.dryGain, now);
  input.connect(dryGain);
  dryGain.connect(busOut);

  const convolverSyrian = ctx.createConvolver();
  convolverSyrian.normalize = false;
  convolverSyrian.buffer = createAcousticOudBodyIR(ctx, "syrian");

  const convolverEgyptian = ctx.createConvolver();
  convolverEgyptian.normalize = false;
  convolverEgyptian.buffer = createAcousticOudBodyIR(ctx, "egyptian");

  const wetGain = ctx.createGain();
  wetGain.gain.setValueAtTime(cfg.wetGain, now);

  convolverSyrian.connect(wetGain);
  convolverEgyptian.connect(wetGain);
  wetGain.connect(busOut);

  const initialConvolver = activeTimbreProfile === "egyptian" ? convolverEgyptian : convolverSyrian;
  input.connect(initialConvolver);

  bodyBusNodes = {
    input,
    dryGain,
    wetGain,
    convolverSyrian,
    convolverEgyptian,
    connectedConvolver: initialConvolver,
    highpass,
    lowWarmth,
    nasalPresence,
    harshTrim
  };

  return input;
}

/**
 * Pré-gera o golpe percussivo curto da risha de celuloide (~17 ms).
 * @param {AudioContext} ctx
 * @returns {AudioBuffer}
 */
function createRishaThumpBuffer(ctx) {
  const sampleRate = ctx.sampleRate || 44100;
  const len = Math.max(256, Math.floor(sampleRate * 0.017));
  const buf = ctx.createBuffer(1, len, sampleRate);
  const data = buf.getChannelData(0);

  let prev = 0;
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const norm = i / len;
    const white = Math.random() * 2 - 1;
    const crisp = white - 0.25 * prev;
    prev = white;
    const click = crisp * Math.pow(1 - norm, 3.0);
    const bridgeTap = Math.sin(2 * Math.PI * 290 * t) * Math.exp(-t / 0.0042) * 0.25;
    data[i] = click * 0.78 + bridgeTap;
  }

  return buf;
}

/**
 * Garante que o AudioContext, o barramento master e a caixa convoluída do Oud existam.
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
    masterGain.gain.setValueAtTime(0.92, audioCtx.currentTime);

    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-8, audioCtx.currentTime);
    limiter.knee.setValueAtTime(14, audioCtx.currentTime);
    limiter.ratio.setValueAtTime(5.5, audioCtx.currentTime);
    limiter.attack.setValueAtTime(0.003, audioCtx.currentTime);
    limiter.release.setValueAtTime(0.11, audioCtx.currentTime);

    masterGain.connect(limiter);
    limiter.connect(audioCtx.destination);

    oudBodyInput = createOudAcousticBodyBus(audioCtx, masterGain);
    rishaThumpBuffer = createRishaThumpBuffer(audioCtx);
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

  if (ctx.state !== "running") {
    ctx.resume().catch(() => {
      // Ignora fora de gesto válido
    });
  }

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
 * @param {(ctx: AudioContext, masterDest: AudioNode, bodyDest: AudioNode) => void} fn
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
 * Renderiza uma única corda física de Oud usando Karplus-Strong Estendido
 * parametrizado pelo perfil ativo ("syrian" ou "egyptian").
 *
 * @param {Float32Array} out
 * @param {number} sampleRate
 * @param {number} freq
 * @param {number} startOffsetSamples
 * @param {number} gainScale
 * @param {number} pluckPosRatio
 * @param {number} decayTimeSec
 * @param {typeof TIMBRE_PROFILES.syrian} cfg
 */
function renderPhysicalOudStringInto(
  out,
  sampleRate,
  freq,
  startOffsetSamples,
  gainScale,
  pluckPosRatio,
  decayTimeSec,
  cfg
) {
  const totalSamples = out.length;
  if (startOffsetSamples >= totalSamples || freq < 35) return;

  const isBass = freq < 115;
  const isHigh = freq > 290;

  const lpG = isBass ? cfg.lpG.bass : (isHigh ? cfg.lpG.high : cfg.lpG.mid);

  const omega = (2 * Math.PI * freq) / sampleRate;
  const re = (1 - lpG) + lpG * Math.cos(omega);
  const im = -lpG * Math.sin(omega);
  const lpDelay = -Math.atan2(im, re) / omega;
  const lpMag = Math.hypot(re, im);

  const period = sampleRate / freq;
  const delayNeeded = period - lpDelay;
  const N = Math.max(4, Math.floor(delayNeeded - 0.5));
  const delta = delayNeeded - N;
  const allpassC = (1 - delta) / (1 + delta);

  const totalCycles = Math.max(12, decayTimeSec * freq);
  const targetCycleGain = Math.pow(0.02, 1 / totalCycles);
  const rho = Math.min(0.9988, targetCycleGain / Math.max(0.5, lpMag));

  const rawExc = new Float32Array(N);
  const smoothCoeff = isBass ? cfg.smoothCoeff.bass : (isHigh ? cfg.smoothCoeff.high : cfg.smoothCoeff.mid);
  let lpState = 0;
  const pickPointIdx = Math.max(1, Math.min(N - 1, Math.round(N * pluckPosRatio)));

  for (let i = 0; i < N; i++) {
    const white = Math.random() * 2 - 1;
    lpState = lpState * smoothCoeff + white * (1 - smoothCoeff);

    const tri = i < pickPointIdx
      ? (i / pickPointIdx)
      : (1 - (i - pickPointIdx) / Math.max(1, N - pickPointIdx));
    const triBipolar = (tri * 2 - 1) * (isBass ? cfg.triWeight.bass : cfg.triWeight.other);

    rawExc[i] = lpState * 0.76 + triBipolar;
  }

  const delayBuf = new Float32Array(N);
  let mean = 0;
  for (let i = 0; i < N; i++) {
    const delayedIdx = i >= pickPointIdx ? i - pickPointIdx : i - pickPointIdx + N;
    const v = rawExc[i] - cfg.combDepth * rawExc[delayedIdx];
    delayBuf[i] = v;
    mean += v;
  }
  mean /= N;

  let maxAbs = 0;
  for (let i = 0; i < N; i++) {
    delayBuf[i] -= mean;
    const a = Math.abs(delayBuf[i]);
    if (a > maxAbs) maxAbs = a;
  }
  const invPeak = maxAbs > 1e-6 ? 1 / maxAbs : 1;
  for (let i = 0; i < N; i++) {
    delayBuf[i] *= invPeak;
  }

  let idx = 0;
  let prevSample = delayBuf[N - 1];
  let apPrevIn = 0;
  let apPrevOut = 0;
  let dcX = 0;
  let dcY = 0;
  const oneMinusG = 1 - lpG;
  const fadeInSamples = Math.min(68, Math.floor(sampleRate * 0.0015));

  for (let s = startOffsetSamples; s < totalSamples; s++) {
    const cur = delayBuf[idx];

    const lpOut = oneMinusG * cur + lpG * prevSample;
    prevSample = cur;

    const apOut = allpassC * lpOut + apPrevIn - allpassC * apPrevOut;
    apPrevIn = lpOut;
    apPrevOut = apOut;

    const nextVal = apOut * rho;
    delayBuf[idx] = nextVal;

    const outSample = nextVal - dcX + 0.996 * dcY;
    dcX = nextVal;
    dcY = outSample;

    const localIdx = s - startOffsetSamples;
    const envIn = localIdx < fadeInSamples ? localIdx / fadeInSamples : 1;
    out[s] += outSample * gainScale * envIn;

    idx++;
    if (idx >= N) idx = 0;
  }
}

/**
 * Sintetiza o par de cordas (ordem dupla do Oud) em um AudioBuffer pronto para reprodução.
 * @param {AudioContext} ctx
 * @param {number} freq
 * @param {number} durationSec
 * @returns {AudioBuffer}
 */
function synthesizeDoubleCourseOudBuffer(ctx, freq, durationSec) {
  const cfg = TIMBRE_PROFILES[activeTimbreProfile] || TIMBRE_PROFILES.syrian;
  const sampleRate = ctx.sampleRate || 44100;
  const safeDur = Math.max(0.28, Math.min(1.9, durationSec));
  const length = Math.floor(sampleRate * safeDur);
  const audioBuf = ctx.createBuffer(1, length, sampleRate);
  const out = audioBuf.getChannelData(0);

  const isLowBass = freq < 105;
  const isHigh = freq > 290;

  const baseDecay = isLowBass
    ? Math.min(safeDur * 1.12, 1.8)
    : (isHigh ? Math.min(safeDur * 0.84, 0.98) : Math.min(safeDur * 0.98, 1.38));
  const naturalDecay = Math.min(1.9, baseDecay * cfg.decayMult);

  const pluckPosA = cfg.pluckPosMin + Math.random() * cfg.pluckPosRange;
  const pluckPosB = pluckPosA + cfg.pluckPairOffset;
  const detuneRatio = isLowBass ? 0.0007 : 0.0012;

  renderPhysicalOudStringInto(
    out,
    sampleRate,
    freq * (1 - detuneRatio),
    0,
    isLowBass ? 0.72 : 0.56,
    pluckPosA,
    naturalDecay,
    cfg
  );

  const staggerMs = isLowBass ? 1.8 : (2.3 + Math.random() * 1.3);
  const staggerSamples = Math.floor((staggerMs / 1000) * sampleRate);
  renderPhysicalOudStringInto(
    out,
    sampleRate,
    freq * (1 + detuneRatio),
    staggerSamples,
    isLowBass ? 0.34 : 0.50,
    pluckPosB,
    naturalDecay * 0.96,
    cfg
  );

  const fadeOutSamples = Math.min(Math.floor(sampleRate * 0.075), Math.floor(length * 0.25));
  const fadeStart = length - fadeOutSamples;
  for (let i = fadeStart; i < length; i++) {
    const remain = (length - i) / fadeOutSamples;
    out[i] *= remain * remain;
  }

  return audioBuf;
}

/**
 * Toca uma nota dedilhada no motor físico de Oud (Ordem Dupla + Risha + Caixa Convoluída).
 *
 * @param {number} freq
 * @param {number} [duration=1.45]
 * @param {number} [volume=0.38]
 */
export function playPluckedNote(freq, duration = 1.45, volume = 0.38) {
  if (!Number.isFinite(freq) || freq <= 20) return;

  withReadyAudio((ctx, _masterDest, bodyDest) => {
    const cfg = TIMBRE_PROFILES[activeTimbreProfile] || TIMBRE_PROFILES.syrian;
    const now = ctx.currentTime + 0.004;
    const safeDur = Math.max(0.28, Math.min(1.9, duration));
    const volJitter = 0.95 + Math.random() * 0.10;
    const safeVol = Math.max(0.02, volume * volJitter);

    // 1. Corda física dupla (Extended Karplus-Strong)
    const stringBuf = synthesizeDoubleCourseOudBuffer(ctx, freq, safeDur);
    const stringSrc = ctx.createBufferSource();
    stringSrc.buffer = stringBuf;

    // Micro-queda de tensão no ataque (corda de baixa tensão puxada pela risha)
    const tensionOvershoot = freq < 115 ? 1.0065 : 1.0050;
    stringSrc.playbackRate.setValueAtTime(tensionOvershoot, now);
    stringSrc.playbackRate.exponentialRampToValueAtTime(1.0, now + 0.030);

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(safeVol * 1.12, now);

    stringSrc.connect(noteGain);
    noteGain.connect(bodyDest);

    stringSrc.start(now);
    stringSrc.stop(now + safeDur + 0.02);

    // 2. Golpe da risha de celuloide no ataque
    if (rishaThumpBuffer) {
      const rishaSrc = ctx.createBufferSource();
      rishaSrc.buffer = rishaThumpBuffer;
      rishaSrc.playbackRate.setValueAtTime(0.92 + Math.random() * 0.18, now);

      const rishaBP = ctx.createBiquadFilter();
      rishaBP.type = "bandpass";
      rishaBP.frequency.setValueAtTime(
        Math.min(cfg.rishaFreqMax, Math.max(cfg.rishaFreqMin, freq * cfg.rishaFreqMult)),
        now
      );
      rishaBP.Q.setValueAtTime(cfg.rishaQ, now);

      const rishaGain = ctx.createGain();
      rishaGain.gain.setValueAtTime(safeVol * cfg.rishaLevel, now);
      rishaGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.017);

      rishaSrc.connect(rishaBP);
      rishaBP.connect(rishaGain);
      rishaGain.connect(bodyDest);

      rishaSrc.start(now);
      rishaSrc.stop(now + 0.024);
    }
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
      playPluckedNote(item.freq, 1.55, 0.28);
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
      playPluckedNote(item.freq, 1.4, 0.34);
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
      playPluckedNote(freq, idx === intervals.length - 1 ? 1.6 : 0.95, 0.36);
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
      playPluckedNote(freq, Math.max(0.75, (durMs / 1000) * 1.9), step.accent ? 0.40 : 0.33);
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
