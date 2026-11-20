// @ts-check
import { DB, PITCH_CLASSES_24 } from "../core/database.js";
import { getActiveStructure } from "../core/modalEngine.js";
import { setMicSessionActive } from "./synthEngine.js";

/**
 * @typedef {"MAQAM_24TET"|"CHROMATIC_24TET"|"TUNER"} PitchDetectionMode
 */

/**
 * @typedef {"IN_TUNE"|"CLOSE"|"OFF"|"OUT_OF_SCALE"} IntonationStatus
 */

/**
 * @typedef {Object} PitchDetectionResult
 * @property {boolean} active              - true quando há som válido ou em hold breve
 * @property {boolean} isHolding           - true quando o som caiu abaixo do gate e está em hold visual
 * @property {PitchDetectionMode} mode     - modo de detecção ativo
 * @property {number} freqHz               - frequência detectada estabilizada (Hz)
 * @property {number} targetFreqHz         - frequência alvo exata (Hz)
 * @property {number} rms                  - nível de sinal (0..1)
 * @property {number} clarity              - confiança do YIN (0..1)
 * @property {number} continuousAbsQ       - posição contínua em quartos de tom a partir de C2 (0 = C2)
 * @property {number} targetAbsQ           - posição inteira em quartos de tom do alvo (0 = C2)
 * @property {number} pitchClassQ          - classe de altura 24-TET do alvo (0..23)
 * @property {number} playedPitchClassQ    - classe de altura 24-TET mais próxima do que realmente soou
 * @property {number} playedAbsQ           - absQ 24-TET mais próximo do que realmente soou
 * @property {number} octave               - oitava soando do alvo (C2 = 2)
 * @property {string} noteName             - cifra ocidental do alvo (ex: "E-", "D", "F#")
 * @property {string} arabicName           - nome árabe histórico (ex: "Sikah", "Dukah")
 * @property {boolean} isMicro             - se o alvo é quarto de tom
 * @property {string} degree               - grau no Maqam/Jins ativo (ou "" fora do modo Maqam)
 * @property {number} traditionalCentsDev  - desvio tradicional aplicado ao alvo (cents_dev)
 * @property {number} centsOff             - desvio real em cents (negativo = baixo/flat, positivo = alto/sharp)
 * @property {number} meterCents           - desvio limitado a [-50, +50] para renderização da agulha
 * @property {boolean} inScale             - true se pertence ao Maqam/Jins dentro da janela de captura
 * @property {IntonationStatus} status     - estado de afinação para cor da UI
 * @property {"FLAT"|"SHARP"|"OK"} direction - direção corretiva (FLAT = subir/avançar dedo, SHARP = descer/recuar)
 * @property {number | null} courseNumber  - número da ordem (1..6) no modo TUNER
 * @property {string} courseLabel          - rótulo da ordem (ex: "6ª C") no modo TUNER
 */

const C2_REF_HZ = 65.40639132514966; // C2 em A4 = 440 Hz
const MIN_OUD_HZ = 52;               // Margem abaixo do bordão C2 (65.41 Hz)
const MAX_OUD_HZ = 780;              // Margem acima do registro agudo no tampo
const FFT_SIZE = 4096;               // >5 ciclos completos mesmo em 65.41 Hz
const YIN_WINDOW = 1536;             // Janela otimizada (~32 ms a 48 kHz) para <1.5 ms no mobile
const YIN_THRESHOLD = 0.15;          // Limiar principal de clareza para ordens duplas
const YIN_FALLBACK_MAX = 0.26;       // Limiar secundário para decaimento de corda
const FRAME_INTERVAL_MS = 44;        // ~22 fps (suave e leve para bateria no iOS)
const HOLD_MS = 720;                 // Tempo de retenção visual após a nota decair

/** @type {AudioContext | null} */
let micAudioCtx = null;
/** @type {MediaStream | null} */
let micStream = null;
/** @type {MediaStreamAudioSourceNode | null} */
let micSource = null;
/** @type {AnalyserNode | null} */
let analyser = null;
/** @type {GainNode | null} */
let silentSinkGain = null;
/** @type {Float32Array | null} */
let timeDomainBuf = null;
/** @type {Float32Array | null} */
let yinDiffBuf = null;
/** @type {Float32Array | null} */
let yinCmndfBuf = null;

let listening = false;
let starting = false;
/** @type {number | null} */
let rafId = null;
let lastFrameTs = 0;
let lastResumeAttemptTs = 0;
let suspendedUntilTs = 0;
let noiseGateRms = 0.008;

/** @type {PitchDetectionMode} */
let detectionMode = "MAQAM_24TET";
/** @type {number | null} */
let lockedTunerCourse = null;

/** @type {number[]} */
let recentFreqWindow = [];
let smoothedFreqHz = 0;
/** @type {PitchDetectionResult | null} */
let lastValidResult = null;
let lastValidTs = 0;

/** @type {(() => import("../core/urlState.js").OudAppState) | null} */
let stateGetter = null;
/** @type {((result: PitchDetectionResult | null) => void) | null} */
let detectionCallback = null;
/** @type {((active: boolean) => void) | null} */
let stateChangeCallback = null;

/**
 * Converte frequência (Hz) em cents acumulados a partir de C2 (65.41 Hz).
 * @param {number} freqHz
 */
function freqToCentsFromC2(freqHz) {
  return 1200 * Math.log2(freqHz / C2_REF_HZ);
}

/**
 * Converte cents acumulados a partir de C2 em frequência (Hz).
 * @param {number} centsFromC2
 */
function centsFromC2ToFreq(centsFromC2) {
  return C2_REF_HZ * Math.pow(2, centsFromC2 / 1200);
}

/**
 * Retorna a mediana de uma lista numérica pequena (imune a picos de batimento de ordens duplas).
 * @param {number[]} values
 */
function computeMedian(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Executa o algoritmo YIN (CMNDF + interpolação parabólica) sobre um buffer temporal.
 *
 * @param {Float32Array} buf
 * @param {number} sampleRate
 * @returns {{ freqHz: number, clarity: number, rms: number } | null}
 */
function detectPitchYIN(buf, sampleRate) {
  const len = buf.length;
  let sumSq = 0;
  for (let i = 0; i < len; i++) {
    const v = buf[i];
    sumSq += v * v;
  }
  const rms = Math.sqrt(sumSq / len);
  if (rms < noiseGateRms) return null;

  const tauMin = Math.max(2, Math.floor(sampleRate / MAX_OUD_HZ));
  const maxSafeTau = Math.max(tauMin + 2, len - YIN_WINDOW - 1);
  const tauMax = Math.min(maxSafeTau, Math.ceil(sampleRate / MIN_OUD_HZ));
  if (tauMax <= tauMin + 2) return null;

  if (!yinDiffBuf || yinDiffBuf.length < tauMax + 2) {
    yinDiffBuf = new Float32Array(tauMax + 2);
    yinCmndfBuf = new Float32Array(tauMax + 2);
  }
  const diff = yinDiffBuf;
  const cmndf = /** @type {Float32Array} */ (yinCmndfBuf);

  diff[0] = 0;
  cmndf[0] = 1;
  let runningSum = 0;

  for (let tau = 1; tau <= tauMax; tau++) {
    let acc = 0;
    for (let j = 0; j < YIN_WINDOW; j++) {
      const delta = buf[j] - buf[j + tau];
      acc += delta * delta;
    }
    diff[tau] = acc;
    runningSum += acc;
    cmndf[tau] = runningSum > 0 ? (acc * tau) / runningSum : 1;
  }

  // Busca o primeiro vale abaixo do limiar YIN dentro da tessitura do Oud
  let bestTau = -1;
  for (let tau = tauMin; tau <= tauMax; tau++) {
    if (cmndf[tau] < YIN_THRESHOLD) {
      while (tau + 1 <= tauMax && cmndf[tau + 1] < cmndf[tau]) {
        tau++;
      }
      bestTau = tau;
      break;
    }
  }

  // Fallback suave para o mínimo global caso o sinal esteja decaindo
  if (bestTau === -1) {
    let minVal = 1;
    let minIdx = -1;
    for (let tau = tauMin; tau <= tauMax; tau++) {
      if (cmndf[tau] < minVal) {
        minVal = cmndf[tau];
        minIdx = tau;
      }
    }
    if (minIdx !== -1 && minVal <= YIN_FALLBACK_MAX) {
      bestTau = minIdx;
    }
  }

  if (bestTau === -1) return null;

  // Interpolação parabólica para precisão sub-cent
  let refinedTau = bestTau;
  if (bestTau > tauMin && bestTau < tauMax) {
    const s0 = cmndf[bestTau - 1];
    const s1 = cmndf[bestTau];
    const s2 = cmndf[bestTau + 1];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (Math.abs(denom) > 1e-9) {
      const shift = Math.max(-0.5, Math.min(0.5, (s2 - s0) / denom));
      refinedTau = bestTau + shift;
    }
  }

  const freqHz = sampleRate / refinedTau;
  if (!Number.isFinite(freqHz) || freqHz < MIN_OUD_HZ || freqHz > MAX_OUD_HZ) {
    return null;
  }

  const clarity = Math.max(0, Math.min(1, 1 - cmndf[bestTau]));
  return { freqHz, clarity, rms };
}

/**
 * Resolve o alvo musical (Afinador 6 Ordens, Maqam/Jins com cents_dev ou 24-TET puro)
 * a partir de uma frequência estabilizada em Hz.
 *
 * @param {number} freqHz
 * @param {import("../core/urlState.js").OudAppState} state
 * @param {PitchDetectionMode} [mode=detectionMode]
 * @param {number | null} [courseLock=lockedTunerCourse]
 * @param {number} [rms=0.05]
 * @param {number} [clarity=0.9]
 * @returns {PitchDetectionResult}
 */
export function resolvePitchTarget(
  freqHz,
  state,
  mode = detectionMode,
  courseLock = lockedTunerCourse,
  rms = 0.05,
  clarity = 0.9
) {
  const detectedCentsFromC2 = freqToCentsFromC2(freqHz);
  const continuousAbsQ = detectedCentsFromC2 / 50;
  const playedAbsQ = Math.round(continuousAbsQ);
  const playedPitchClassQ = ((playedAbsQ % 24) + 24) % 24;

  // =========================================================================
  // MODO 1: AFINADOR DAS 6 ORDENS (DB.tunings)
  // =========================================================================
  if (mode === "TUNER") {
    const tuning = DB.tunings.find(x => x.id === state.tuningId) || DB.tunings[0];
    let targetCourse = courseLock !== null
      ? tuning.courses.find(c => c.course === courseLock) || null
      : null;

    if (!targetCourse) {
      let minAbsDiff = Infinity;
      for (const cObj of tuning.courses) {
        const diff = Math.abs(1200 * Math.log2(freqHz / cObj.freq_hz));
        if (diff < minAbsDiff) {
          minAbsDiff = diff;
          targetCourse = cObj;
        }
      }
    }

    const chosen = targetCourse || tuning.courses[0];
    const centsOff = 1200 * Math.log2(freqHz / chosen.freq_hz);
    const absOff = Math.abs(centsOff);
    const pcQ = ((chosen.abs_q % 24) + 24) % 24;
    const pc = PITCH_CLASSES_24[pcQ] || PITCH_CLASSES_24[0];

    /** @type {IntonationStatus} */
    let status = "OFF";
    if (absOff <= 5) status = "IN_TUNE";
    else if (absOff <= 18) status = "CLOSE";

    return {
      active: true,
      isHolding: false,
      mode,
      freqHz,
      targetFreqHz: chosen.freq_hz,
      rms,
      clarity,
      continuousAbsQ,
      targetAbsQ: chosen.abs_q,
      pitchClassQ: pcQ,
      playedPitchClassQ,
      playedAbsQ,
      octave: Math.floor(chosen.abs_q / 24) + 2,
      noteName: pc.flat,
      arabicName: pc.arabic,
      isMicro: pc.micro,
      degree: "",
      traditionalCentsDev: 0,
      centsOff,
      meterCents: Math.max(-50, Math.min(50, centsOff)),
      inScale: true,
      status,
      direction: absOff <= 5 ? "OK" : (centsOff < 0 ? "FLAT" : "SHARP"),
      courseNumber: chosen.course,
      courseLabel: chosen.label
    };
  }

  // =========================================================================
  // MODO 2: CROMÁTICO 24-TET PURO (50 cents exatos por quarto de tom)
  // =========================================================================
  if (mode === "CHROMATIC_24TET") {
    const targetAbsQ = playedAbsQ;
    const targetCents = targetAbsQ * 50;
    const centsOff = detectedCentsFromC2 - targetCents;
    const absOff = Math.abs(centsOff);
    const pc = PITCH_CLASSES_24[playedPitchClassQ] || PITCH_CLASSES_24[0];

    /** @type {IntonationStatus} */
    let status = "OFF";
    if (absOff <= 7) status = "IN_TUNE";
    else if (absOff <= 20) status = "CLOSE";

    return {
      active: true,
      isHolding: false,
      mode,
      freqHz,
      targetFreqHz: centsFromC2ToFreq(targetCents),
      rms,
      clarity,
      continuousAbsQ,
      targetAbsQ,
      pitchClassQ: playedPitchClassQ,
      playedPitchClassQ,
      playedAbsQ,
      octave: Math.floor(targetAbsQ / 24) + 2,
      noteName: pc.flat,
      arabicName: pc.arabic,
      isMicro: pc.micro,
      degree: "",
      traditionalCentsDev: 0,
      centsOff,
      meterCents: Math.max(-50, Math.min(50, centsOff)),
      inScale: true,
      status,
      direction: absOff <= 7 ? "OK" : (centsOff < 0 ? "FLAT" : "SHARP"),
      courseNumber: null,
      courseLabel: ""
    };
  }

  // =========================================================================
  // MODO 3 (PADRÃO): INTONAÇÃO NO MAQAM / JINS ATIVO (COM cents_dev)
  // =========================================================================
  const activeStruct = getActiveStructure(state);
  const effRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;

  // Monta mapa único de graus válidos dentro da oitava
  /** @type {Map<number, { pcQ: number, degree: string, centsDev: number }>} */
  const scaleDegreesByPc = new Map();
  activeStruct.intervals.forEach((intQ, idx) => {
    const modQ = ((intQ % 24) + 24) % 24;
    const pcQ = (effRootQ + modQ) % 24;
    if (!scaleDegreesByPc.has(pcQ)) {
      const dev = activeStruct.centsMap[intQ] ?? activeStruct.centsMap[modQ] ?? 0;
      scaleDegreesByPc.set(pcQ, {
        pcQ,
        degree: activeStruct.degrees[idx] || "",
        centsDev: dev
      });
    }
  });

  // Encontra o alvo válido mais próximo dentre todas as oitavas do Oud (C2..C6)
  let bestTarget = {
    absQ: playedAbsQ,
    pcQ: playedPitchClassQ,
    degree: "",
    centsDev: 0,
    targetCents: playedAbsQ * 50,
    diffCents: 9999
  };

  for (let oct = 0; oct <= 4; oct++) {
    scaleDegreesByPc.forEach((info) => {
      const candAbsQ = oct * 24 + info.pcQ;
      const candTargetCents = candAbsQ * 50 + info.centsDev;
      const diff = detectedCentsFromC2 - candTargetCents;
      if (Math.abs(diff) < Math.abs(bestTarget.diffCents)) {
        bestTarget = {
          absQ: candAbsQ,
          pcQ: info.pcQ,
          degree: info.degree,
          centsDev: info.centsDev,
          targetCents: candTargetCents,
          diffCents: diff
        };
      }
    });
  }

  const centsOff = bestTarget.diffCents;
  const absOff = Math.abs(centsOff);
  const inScale = absOff <= 32;
  const pc = PITCH_CLASSES_24[bestTarget.pcQ] || PITCH_CLASSES_24[0];

  /** @type {IntonationStatus} */
  let status = "OUT_OF_SCALE";
  if (inScale) {
    if (absOff <= 7) status = "IN_TUNE";
    else if (absOff <= 22) status = "CLOSE";
    else status = "OFF";
  }

  return {
    active: true,
    isHolding: false,
    mode,
    freqHz,
    targetFreqHz: centsFromC2ToFreq(bestTarget.targetCents),
    rms,
    clarity,
    continuousAbsQ,
    targetAbsQ: bestTarget.absQ,
    pitchClassQ: bestTarget.pcQ,
    playedPitchClassQ,
    playedAbsQ,
    octave: Math.floor(bestTarget.absQ / 24) + 2,
    noteName: pc.flat,
    arabicName: pc.arabic,
    isMicro: pc.micro,
    degree: bestTarget.degree,
    traditionalCentsDev: bestTarget.centsDev,
    centsOff,
    meterCents: Math.max(-50, Math.min(50, centsOff)),
    inScale,
    status,
    direction: absOff <= 7 ? "OK" : (centsOff < 0 ? "FLAT" : "SHARP"),
    courseNumber: null,
    courseLabel: ""
  };
}

/**
 * Loop de captura e análise em tempo real (~22 fps).
 * @param {number} nowTs
 */
function tickAnalysisLoop(nowTs) {
  if (!listening) return;
  rafId = window.requestAnimationFrame(tickAnalysisLoop);

  if (nowTs - lastFrameTs < FRAME_INTERVAL_MS) return;
  lastFrameTs = nowTs;

  if (!analyser || !timeDomainBuf || !micAudioCtx || !stateGetter) return;

  // Recupera o AudioContext caso o iOS o coloque em "suspended" ou "interrupted"
  if (micAudioCtx.state !== "running") {
    if (nowTs - lastResumeAttemptTs > 450) {
      lastResumeAttemptTs = nowTs;
      micAudioCtx.resume().catch(() => {});
    }
    return;
  }

  // Pausa temporária (ex: usuário clicou em uma joia para ouvir referência)
  if (nowTs < suspendedUntilTs) return;

  analyser.getFloatTimeDomainData(timeDomainBuf);
  const raw = detectPitchYIN(timeDomainBuf, micAudioCtx.sampleRate);

  if (!raw) {
    recentFreqWindow = [];
    if (lastValidResult && nowTs - lastValidTs <= HOLD_MS) {
      if (!lastValidResult.isHolding) {
        lastValidResult = { ...lastValidResult, isHolding: true };
        detectionCallback?.(lastValidResult);
      }
    } else if (lastValidResult !== null) {
      lastValidResult = null;
      smoothedFreqHz = 0;
      detectionCallback?.(null);
    }
    return;
  }

  // Se houve salto melódico > 70 cents (~1.4 quarto de tom), reinicia a janela de mediana para resposta instantânea
  if (smoothedFreqHz > 0) {
    const jumpCents = Math.abs(1200 * Math.log2(raw.freqHz / smoothedFreqHz));
    if (jumpCents > 70) {
      recentFreqWindow = [];
      smoothedFreqHz = raw.freqHz;
    }
  }

  recentFreqWindow.push(raw.freqHz);
  if (recentFreqWindow.length > 4) {
    recentFreqWindow.shift();
  }

  const medianFreq = computeMedian(recentFreqWindow);
  smoothedFreqHz = smoothedFreqHz > 0
    ? smoothedFreqHz * 0.35 + medianFreq * 0.65
    : medianFreq;

  const currentState = stateGetter();
  const resolved = resolvePitchTarget(
    smoothedFreqHz,
    currentState,
    detectionMode,
    lockedTunerCourse,
    raw.rms,
    raw.clarity
  );

  lastValidResult = resolved;
  lastValidTs = nowTs;
  detectionCallback?.(resolved);
}

/**
 * Solicita acesso ao microfone com fallback automático para { audio: true }
 * caso o Chrome iOS / WKWebView rejeite constraints detalhadas de DSP.
 */
async function requestMicrophoneStream() {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      },
      video: false
    });
  } catch (firstErr) {
    const name = /** @type {any} */ (firstErr)?.name || "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
      throw firstErr;
    }
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
  }
}

/**
 * Mapeia erros de permissão/dispositivo do navegador para códigos padronizados.
 * @param {any} err
 * @returns {"PERMISSION_DENIED"|"NO_MICROPHONE"|"INSECURE_CONTEXT"|"UNSUPPORTED"|"UNKNOWN"}
 */
function classifyMicError(err) {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "INSECURE_CONTEXT";
  }
  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    return "UNSUPPORTED";
  }
  const name = err?.name || "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
    return "PERMISSION_DENIED";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
    return "NO_MICROPHONE";
  }
  return "UNKNOWN";
}

/**
 * Inicia a captura do microfone/captador e o loop de detecção 24-TET.
 * Deve ser chamado diretamente dentro de um clique/toque do usuário.
 *
 * @param {{
 *   getState: () => import("../core/urlState.js").OudAppState,
 *   onDetection: (result: PitchDetectionResult | null) => void,
 *   onError?: (code: "PERMISSION_DENIED"|"NO_MICROPHONE"|"INSECURE_CONTEXT"|"UNSUPPORTED"|"UNKNOWN", rawErr?: any) => void,
 *   onStateChange?: (active: boolean) => void
 * }} config
 * @returns {Promise<boolean>}
 */
export async function startPitchListening(config) {
  stateGetter = config.getState;
  detectionCallback = config.onDetection;
  stateChangeCallback = config.onStateChange || null;

  if (listening || starting) return true;

  if (typeof window !== "undefined" && !window.isSecureContext) {
    config.onError?.("INSECURE_CONTEXT");
    return false;
  }

  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
    config.onError?.("UNSUPPORTED");
    return false;
  }

  const AudioCtxCtor = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
  if (!AudioCtxCtor) {
    config.onError?.("UNSUPPORTED");
    return false;
  }

  starting = true;

  try {
    // 1. Libera imediatamente a sessão de Playback do iOS para "play-and-record"
    //    e pausa o <audio loop> silencioso ANTES do getUserMedia()
    setMicSessionActive(true);

    // 2. Cria e acorda o AudioContext SINCRONAMENTE dentro do gesto do usuário (exigência do iOS)
    micAudioCtx = new AudioCtxCtor();
    if (micAudioCtx.state !== "running") {
      micAudioCtx.resume().catch(() => {});
    }

    // 3. Solicita o stream de microfone (com fallback { audio: true } no WKWebView/Chrome iOS)
    micStream = await requestMicrophoneStream();

    // Caso o usuário tenha fechado a barra enquanto aguardava a permissão
    if (!starting || !micAudioCtx) {
      stopPitchListening();
      return false;
    }

    // 4. Retoma o AudioContext novamente após a abertura do microfone (o iOS pode marcar "interrupted")
    if (micAudioCtx.state !== "running") {
      await micAudioCtx.resume();
    }

    micSource = micAudioCtx.createMediaStreamSource(micStream);
    analyser = micAudioCtx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0;

    // 5. Mantém o grafo ativo no WebKit/iOS ligando a saída ao destination com ganho 0 (sem feedback)
    silentSinkGain = micAudioCtx.createGain();
    silentSinkGain.gain.setValueAtTime(0, micAudioCtx.currentTime);

    micSource.connect(analyser);
    analyser.connect(silentSinkGain);
    silentSinkGain.connect(micAudioCtx.destination);

    timeDomainBuf = new Float32Array(FFT_SIZE);

    starting = false;
    listening = true;
    recentFreqWindow = [];
    smoothedFreqHz = 0;
    lastValidResult = null;
    lastFrameTs = 0;
    lastResumeAttemptTs = 0;

    stateChangeCallback?.(true);
    rafId = window.requestAnimationFrame(tickAnalysisLoop);
    return true;
  } catch (err) {
    starting = false;
    stopPitchListening();
    config.onError?.(classifyMicError(err), err);
    return false;
  }
}

/**
 * Encerra imediatamente o microfone e libera hardware/bateria do sistema operacional.
 */
export function stopPitchListening() {
  const wasListening = listening;
  listening = false;
  starting = false;

  if (rafId !== null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (micSource) {
    try {
      micSource.disconnect();
    } catch {
      // Ignora
    }
    micSource = null;
  }

  if (analyser) {
    try {
      analyser.disconnect();
    } catch {
      // Ignora
    }
    analyser = null;
  }

  if (silentSinkGain) {
    try {
      silentSinkGain.disconnect();
    } catch {
      // Ignora
    }
    silentSinkGain = null;
  }

  timeDomainBuf = null;

  if (micStream) {
    micStream.getTracks().forEach(track => {
      try {
        track.stop();
      } catch {
        // Ignora
      }
    });
    micStream = null;
  }

  if (micAudioCtx) {
    try {
      micAudioCtx.close();
    } catch {
      // Ignora
    }
    micAudioCtx = null;
  }

  // Devolve o iOS para a sessão de Playback normal
  setMicSessionActive(false);

  recentFreqWindow = [];
  smoothedFreqHz = 0;
  lastValidResult = null;

  detectionCallback?.(null);
  if (wasListening) {
    stateChangeCallback?.(false);
  }
}

export function isPitchListening() {
  return listening;
}

/** @param {PitchDetectionMode} mode */
export function setPitchDetectionMode(mode) {
  detectionMode = mode;
  recentFreqWindow = [];
  lastValidResult = null;
}

/** @returns {PitchDetectionMode} */
export function getPitchDetectionMode() {
  return detectionMode;
}

/**
 * Trava o modo Afinador em uma ordem específica (1..6) ou volta para detecção automática (`null`).
 * @param {number | null} courseNum
 */
export function setLockedTunerCourse(courseNum) {
  lockedTunerCourse = courseNum;
}

/** @returns {number | null} */
export function getLockedTunerCourse() {
  return lockedTunerCourse;
}

/**
 * Ajusta o limiar do Noise Gate (ex: 0.008 para captação baixa, 0.025 para ambiente ruidoso).
 * @param {number} rmsThreshold
 */
export function setPitchNoiseGate(rmsThreshold) {
  noiseGateRms = Math.max(0.003, Math.min(0.08, rmsThreshold));
}

/**
 * Suspende brevemente a detecção para evitar que um som reproduzido pelo próprio app
 * (ex: clicar numa corda de referência) seja recapturado pelo microfone.
 * @param {number} [durationMs=380]
 */
export function suspendPitchDetection(durationMs = 380) {
  if (!listening) return;
  suspendedUntilTs = performance.now() + durationMs;
  recentFreqWindow = [];
}

// Encerra o microfone automaticamente ao trocar de aba ou bloquear a tela do celular
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && listening) {
      stopPitchListening();
    }
  });
}
