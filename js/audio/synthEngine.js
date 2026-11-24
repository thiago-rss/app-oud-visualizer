// @ts-check
import { clampA4Hz, scaleFreqToA4, loadSavedA4Hz } from "../core/pitchStabilizer.js";
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

/** @type {number | undefined} */
let idleSuspendTimer;
/** @type {boolean} */
let isMicSessionActive = false;
/** @type {boolean} */
let needsContextRebuild = false;
/** @type {number} */
let lastUnlockTs = 0;
/** @type {number} */
let lastClockVerifiedTs = 0;
/** @type {number} */
let lastClockRecoveryTs = 0;
/** @type {boolean} */
let clockCheckPending = false;

/** @type {number[]} */
let sequenceTimers = [];
/** @type {number | null} */
let iqaIntervalId = null;

/** @type {{ osc1: OscillatorNode, osc2: OscillatorNode, filter: BiquadFilterNode, gain: GainNode } | null} */
let droneNodes = null;
/** @type {number} */
let lastDroneRootQ = 0;

/**
 * Limpa metadados e estado da MediaSession para impedir exibição de player
 * na tela de bloqueio e na Central de Controle do iOS.
 */
function clearMediaSession() {
  try {
    if (typeof navigator !== "undefined" && "mediaSession" in navigator && navigator.mediaSession) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    }
  } catch {
    // Navegadores sem MediaSession ignoram com segurança
  }
}

/**
 * Configura a sessão de áudio do iOS (WebKit AudioSession API):
 * - "play-and-record" quando o microfone estiver ativo
 * - "playback" durante a reprodução em primeiro plano (habilita A2DP em AirPods e contorna o silencioso)
 * - "ambient" em repouso/segundo plano (evita sequestro do player da tela de bloqueio)
 *
 * @param {"playback"|"play-and-record"|"ambient"} [overrideType]
 */
function configureIosAudioSession(overrideType) {
  try {
    const navAny = /** @type {any} */ (navigator);
    if (!navAny || !navAny.audioSession) return;
    const desiredType = overrideType || (isMicSessionActive ? "play-and-record" : "playback");
    if (navAny.audioSession.type !== desiredType) {
      navAny.audioSession.type = desiredType;
    }
  } catch {
    // Navegadores sem AudioSession API ignoram com segurança
  }
}

/**
 * Libera a sessão de áudio quando o app vai para segundo plano ou a tela é bloqueada,
 * impedindo que o iOS exiba controles de mídia na tela de bloqueio.
 */
function releaseAudioSessionForBackground() {
  window.clearTimeout(idleSuspendTimer);
  clearMediaSession();

  if (!isMicSessionActive) {
    configureIosAudioSession("ambient");
  }

  if (audioCtx && audioCtx.state === "running") {
    audioCtx.suspend().catch(() => {});
  }
}

/**
 * Agenda suspensão silenciosa do AudioContext após 5 s de inatividade
 * (quando Drone, Iqa' e sequências estiverem parados), economizando bateria
 * e garantindo que nenhum player apareça caso o usuário bloqueie a tela em seguida.
 */
function scheduleIdleSuspend() {
  window.clearTimeout(idleSuspendTimer);
  if (isMicSessionActive || droneNodes !== null || iqaIntervalId !== null) return;

  idleSuspendTimer = window.setTimeout(() => {
    if (isMicSessionActive || droneNodes !== null || iqaIntervalId !== null || sequenceTimers.length > 0) return;
    clearMediaSession();
    configureIosAudioSession("ambient");
    if (audioCtx && audioCtx.state === "running") {
      audioCtx.suspend().catch(() => {});
    }
  }, 5000);
}

/**
 * Sinaliza ao motor de áudio quando o microfone/afinador está ativo no iOS,
 * alternando entre "play-and-record" e "playback" e marcando o AudioContext
 * para reconstrução ao retornar de HFP para A2DP (AirPods/Bluetooth).
 *
 * @param {boolean} active
 */
export function setMicSessionActive(active) {
  const prevActive = isMicSessionActive;
  isMicSessionActive = Boolean(active);

  if (isMicSessionActive) {
    window.clearTimeout(idleSuspendTimer);
  } else if (prevActive && audioCtx) {
    needsContextRebuild = true;
  }

  configureIosAudioSession();
  clearMediaSession();
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
 * Cria o AudioContext com latencyHint "playback" (mais estável para fones Bluetooth / AirPods A2DP).
 * @returns {AudioContext | null}
 */
function createAudioContextSafe() {
  const AudioCtxCtor = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
  if (!AudioCtxCtor) return null;

  try {
    return new AudioCtxCtor({ latencyHint: "playback" });
  } catch {
    return new AudioCtxCtor();
  }
}

/**
 * Reconstrói o AudioContext e o barramento do Oud na rota de áudio atual
 * (recupera de troca de fones Bluetooth/AirPods, estado "interrupted" ou relógio congelado no iOS).
 * @returns {AudioContext | null}
 */
function rebuildAudioContext() {
  const wasDroneActive = droneNodes !== null;
  const savedRootQ = lastDroneRootQ;

  if (droneNodes) {
    try {
      droneNodes.osc1.stop();
      droneNodes.osc2.stop();
    } catch {
      // Ignora
    }
    droneNodes = null;
  }

  const oldCtx = audioCtx;
  audioCtx = null;
  masterGain = null;
  oudBodyInput = null;
  bodyBusNodes = null;
  rishaThumpBuffer = null;
  needsContextRebuild = false;

  if (oldCtx) {
    try {
      oldCtx.close().catch(() => {});
    } catch {
      // Ignora
    }
  }

  const freshCtx = ensureAudioContext();
  if (wasDroneActive && freshCtx) {
    startDroneNodes(savedRootQ);
  }
  return freshCtx;
}

/**
 * Garante que o AudioContext, o barramento master estéreo e a caixa convoluída do Oud existam.
 * @returns {AudioContext | null}
 */
function ensureAudioContext() {
  if (typeof window === "undefined") return null;

  configureIosAudioSession();

  if (audioCtx && /** @type {string} */ (audioCtx.state) === "closed") {
    audioCtx = null;
    masterGain = null;
    oudBodyInput = null;
    bodyBusNodes = null;
    rishaThumpBuffer = null;
  }

  if (!audioCtx) {
    const ctx = createAudioContextSafe();
    if (!ctx) return null;
    audioCtx = ctx;

    ctx.addEventListener("statechange", () => {
      if (ctx !== audioCtx) return;
      const st = /** @type {string} */ (ctx.state);
      if (st === "interrupted") {
        needsContextRebuild = true;
      }
    });

    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.92, ctx.currentTime);
    try {
      // Upmix explícito para estéreo (formato nativo de Bluetooth A2DP / AirPods)
      masterGain.channelCount = 2;
      masterGain.channelCountMode = "explicit";
      masterGain.channelInterpretation = "speakers";
    } catch {
      // Ignora em implementações restritas
    }

    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.setValueAtTime(-8, ctx.currentTime);
    limiter.knee.setValueAtTime(14, ctx.currentTime);
    limiter.ratio.setValueAtTime(5.5, ctx.currentTime);
    limiter.attack.setValueAtTime(0.003, ctx.currentTime);
    limiter.release.setValueAtTime(0.11, ctx.currentTime);

    masterGain.connect(limiter);
    limiter.connect(ctx.destination);

    oudBodyInput = createOudAcousticBodyBus(ctx, masterGain);
    rishaThumpBuffer = createRishaThumpBuffer(ctx);
  }

  return audioCtx;
}

/**
 * Watchdog para bug clássico do iOS WebKit com AirPods/Bluetooth:
 * o AudioContext relata state === "running", mas currentTime congela em 0 ou no instante da troca de rota.
 * Se detectado em primeiro plano, reconstrói o contexto na rota ativa e reexecuta a nota.
 *
 * @param {AudioContext} ctx
 * @param {(ctx: AudioContext, masterDest: AudioNode, bodyDest: AudioNode) => void} retryFn
 */
function verifyAudioClockProgress(ctx, retryFn) {
  const nowPerf = performance.now();
  if (clockCheckPending || nowPerf - lastClockVerifiedTs < 1500) return;

  clockCheckPending = true;
  const t0 = ctx.currentTime;

  window.setTimeout(() => {
    clockCheckPending = false;
    if (ctx !== audioCtx || ctx.state !== "running") return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

    if (ctx.currentTime > t0 + 0.001) {
      lastClockVerifiedTs = performance.now();
      return;
    }

    const recoveryPerf = performance.now();
    if (recoveryPerf - lastClockRecoveryTs < 2000) return;
    lastClockRecoveryTs = recoveryPerf;

    const rebuilt = rebuildAudioContext();
    if (!rebuilt) return;
    rebuilt.resume()
      .then(() => {
        if (audioCtx === rebuilt && masterGain && oudBodyInput) {
          retryFn(rebuilt, masterGain, oudBodyInput);
        }
      })
      .catch(() => {});
  }, 220);
}

/**
 * Executa o desbloqueio síncrono via Web Audio puro + AudioSession API
 * (sem elemento HTML5 audio, evitando qualquer player na tela de bloqueio).
 */
export function unlockAudioEngine() {
  const nowPerf = performance.now();
  const ctxNeedsKick = !audioCtx || needsContextRebuild || audioCtx.state !== "running";

  // Evita disparos triplos (pointerup + touchend + click) no mesmo toque quando já está saudável
  if (!ctxNeedsKick && nowPerf - lastUnlockTs < 140) {
    scheduleIdleSuspend();
    return;
  }
  lastUnlockTs = nowPerf;

  window.clearTimeout(idleSuspendTimer);
  configureIosAudioSession();
  clearMediaSession();

  const ctx = needsContextRebuild ? rebuildAudioContext() : ensureAudioContext();
  if (!ctx) return;

  if (ctx.state !== "running") {
    ctx.resume().catch(() => {
      // Ignora fora de gesto válido
    });
  }

  try {
    const silentBuf = ctx.createBuffer(2, 1, ctx.sampleRate || 44100);
    const src = ctx.createBufferSource();
    src.buffer = silentBuf;
    src.connect(ctx.destination);
    src.start(0);
  } catch {
    // Ignora
  }

  scheduleIdleSuspend();
}

/**
 * Garante que o contexto esteja rodando na rota ativa antes de agendar a síntese.
 * @param {(ctx: AudioContext, masterDest: AudioNode, bodyDest: AudioNode) => void} fn
 */
function withReadyAudio(fn) {
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return;
  }

  window.clearTimeout(idleSuspendTimer);
  configureIosAudioSession();
  clearMediaSession();

  if (needsContextRebuild) {
    rebuildAudioContext();
  }

  const ctx = ensureAudioContext();
  if (!ctx || !masterGain || !oudBodyInput) return;

  if (ctx.state === "running") {
    fn(ctx, masterGain, oudBodyInput);
    verifyAudioClockProgress(ctx, fn);
    scheduleIdleSuspend();
    return;
  }

  unlockAudioEngine();
  const activeCtx = audioCtx;
  if (!activeCtx) return;

  activeCtx.resume()
    .then(() => {
      if (audioCtx === activeCtx && masterGain && oudBodyInput) {
        fn(activeCtx, masterGain, oudBodyInput);
        verifyAudioClockProgress(activeCtx, fn);
        scheduleIdleSuspend();
      }
    })
    .catch(() => {
      // Fallback caso o navegador exija novo gesto
    });
}

// Registra desbloqueio na fase de captura e libera sessão ao bloquear tela ou trocar de rota Bluetooth
if (typeof window !== "undefined") {
  const MIC_TRIGGER_SELECTOR = "#btn-open-live-tuner, #btn-popover-open-tuner, #btn-tuner-mic-toggle, #btn-mob-mic, .btn-study-live-pitch";

  const handleUserGesture = (/** @type {Event} */ ev) => {
    const rawTarget = ev?.target;
    const el = rawTarget instanceof Element ? rawTarget : null;
    if (el && el.closest(MIC_TRIGGER_SELECTOR)) {
      setMicSessionActive(true);
      return;
    }
    unlockAudioEngine();
  };

  window.addEventListener("touchend", handleUserGesture, { capture: true, passive: true });
  window.addEventListener("click", handleUserGesture, { capture: true, passive: true });
  window.addEventListener("pointerup", handleUserGesture, { capture: true, passive: true });
  window.addEventListener("keydown", handleUserGesture, { capture: true, passive: true });

  // Detecta conexão/desconexão de AirPods ou fones Bluetooth em tempo real
  if (navigator.mediaDevices && typeof navigator.mediaDevices.addEventListener === "function") {
    navigator.mediaDevices.addEventListener("devicechange", () => {
      if (!audioCtx) return;
      needsContextRebuild = true;
      lastClockVerifiedTs = 0;

      if ((droneNodes !== null || iqaIntervalId !== null) && document.visibilityState === "visible") {
        const rebuilt = rebuildAudioContext();
        rebuilt?.resume().catch(() => {});
      }
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      releaseAudioSessionForBackground();
    } else if (document.visibilityState === "visible") {
      configureIosAudioSession();
      clearMediaSession();
      if (audioCtx) {
        const st = /** @type {string} */ (audioCtx.state);
        if (st === "interrupted") {
          needsContextRebuild = true;
        } else if (st !== "running" && (droneNodes !== null || iqaIntervalId !== null)) {
          audioCtx.resume().catch(() => {});
        }
      }
    }
  });

  window.addEventListener("pagehide", releaseAudioSessionForBackground);
}

export function clearSequenceTimers() {
  sequenceTimers.forEach(id => window.clearTimeout(id));
  sequenceTimers = [];
  scheduleIdleSuspend();
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
  freq = scaleFreqToA4(freq, currentReferenceA4Hz);
  if (!Number.isFinite(freq) || freq <= 20) return;

  withReadyAudio((ctx, _masterDest, bodyDest) => {
    const cfg = TIMBRE_PROFILES[activeTimbreProfile] || TIMBRE_PROFILES.syrian;
    const now = ctx.currentTime + 0.015;
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
      if (idx === intervals.length - 1) {
        sequenceTimers = [];
        scheduleIdleSuspend();
      }
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
    sequenceTimers = [];
    scheduleIdleSuspend();
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
      if (i === stepCount - 1) {
        sequenceTimers = [];
        scheduleIdleSuspend();
      }
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
  scheduleIdleSuspend();
}

function startDroneNodes(rootQ) {
  stopDroneNodes();
  const safeRootQ = ((rootQ % 24) + 24) % 24;
  lastDroneRootQ = safeRootQ;
  const rootFreq = 130.81278 * Math.pow(2, safeRootQ / 24);
  const fifthFreq = rootFreq * 1.498307;

  withReadyAudio((ctx, masterDest) => {
    const now = ctx.currentTime + 0.015;
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
    window.clearTimeout(idleSuspendTimer);
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
  isActive = scaleFreqToA4(isActive, currentReferenceA4Hz);
  updateDroneButtonUI(isActive, rootQ, btnEl);
  if (!isActive || !droneNodes || !audioCtx) return;

  const safeRootQ = ((rootQ % 24) + 24) % 24;
  lastDroneRootQ = safeRootQ;
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
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

  withReadyAudio((ctx, masterDest) => {
    const now = ctx.currentTime + 0.015;

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
  window.clearTimeout(idleSuspendTimer);

  const safeBpm = Math.max(40, Math.min(200, bpm || 96));
  const stepMs = Math.round((60000 / safeBpm) / 2);
  let stepIdx = 0;

  const triggerStep = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
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
  scheduleIdleSuspend();
}

// --- Diapasão Global A4 (415–446 Hz) ---
let currentReferenceA4Hz = loadSavedA4Hz();
export function setReferenceA4Hz(a4Hz) {
  currentReferenceA4Hz = clampA4Hz(a4Hz);
  return currentReferenceA4Hz;
}
export function getReferenceA4Hz() {
  return currentReferenceA4Hz;
}
