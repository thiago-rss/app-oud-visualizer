// @ts-check
import { PITCH_CLASSES_24 } from "../core/database.js";

/** @type {AudioContext | null} */
let audioCtx = null;
/** @type {OscillatorNode | null} */
let droneOsc = null;
/** @type {number[]} */
let sequenceTimers = [];
/** @type {number | null} */
let iqaIntervalTimer = null;
let iqaStepCounter = 0;

export function initAudio() {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

export function clearSequenceTimers() {
  sequenceTimers.forEach(t => clearTimeout(t));
  sequenceTimers = [];
}

/**
 * Síntese percussiva de Darbuka e Riq para o motor de Iqa'at.
 * @param {string} stroke - "DUM" | "TAK" | "KAH" | "ZILL" | "ES"
 */
export function playPercussionStroke(stroke) {
  if (stroke === "ES") return;
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  if (stroke === "DUM") {
    // Membrana grave da Darbuka com queda rápida de pitch
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + 0.14);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  } else if (stroke === "TAK" || stroke === "KAH") {
    // Golpe seco na borda da pele + transiente filtrado
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    const startFreq = stroke === "TAK" ? 440 : 340;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.065);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(stroke === "TAK" ? 1600 : 1100, now);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(stroke === "TAK" ? 0.32 : 0.22, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (stroke === "ZILL") {
    // Platinelas metálicas sutis do Riq
    const bufferSize = Math.floor(audioCtx.sampleRate * 0.06);
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(6800, now);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  }
}

export function stopIqaEngine() {
  if (iqaIntervalTimer !== null) {
    clearInterval(iqaIntervalTimer);
    iqaIntervalTimer = null;
  }
  iqaStepCounter = 0;
}

/**
 * Inicia ou reinicia o loop rítmico de um Iqa'.
 * @param {any} iqaObj
 * @param {number} bpm
 * @param {(beatIdx: number) => void} onBeatTick
 */
export function startIqaEngine(iqaObj, bpm, onBeatTick) {
  initAudio();
  stopIqaEngine();

  const subFactor = iqaObj.subdivision_factor || 2;
  const stepIntervalMs = (60 / bpm / subFactor) * 1000;

  const tick = () => {
    const idx = iqaStepCounter % iqaObj.pattern.length;
    const step = iqaObj.pattern[idx];
    playPercussionStroke(step.stroke);
    onBeatTick(idx);
    iqaStepCounter++;
  };

  tick();
  iqaIntervalTimer = window.setInterval(tick, stepIntervalMs);
}

/**
 * @param {number} freqHz
 * @param {number} [duration=1.3]
 * @param {number} [gainLevel=0.24]
 */
export function playPluckedNote(freqHz, duration = 1.3, gainLevel = 0.24) {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc1.type = "triangle";
  osc2.type = "sawtooth";

  osc1.frequency.setValueAtTime(freqHz, now);
  osc2.frequency.setValueAtTime(freqHz * Math.pow(2, 1.6 / 1200), now);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(freqHz * 6.2, now);
  filter.frequency.exponentialRampToValueAtTime(freqHz * 1.35, now + duration * 0.72);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(gainLevel, now + 0.011);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
}

/**
 * @param {{ course: number, freq: number }[]} voicingFreqs
 */
export function strumChordVoicing(voicingFreqs) {
  initAudio();
  voicingFreqs.forEach((item, idx) => {
    setTimeout(() => playPluckedNote(item.freq, 1.8), idx * 55);
  });
}

/**
 * @param {{ course: number, freq: number }[]} voicingFreqs
 */
export function arpeggiateChordVoicing(voicingFreqs) {
  initAudio();
  voicingFreqs.forEach((item, idx) => {
    setTimeout(() => playPluckedNote(item.freq, 1.3), idx * 250);
  });
}

/**
 * @param {number} effectiveRootQ
 * @param {number[]} intervals
 * @param {Record<number, number>} centsMap
 */
export function playScaleSequence(effectiveRootQ, intervals, centsMap) {
  initAudio();
  const baseRootFreq = 130.81 * Math.pow(2, (effectiveRootQ * 50) / 1200);
  intervals.forEach((intQ, idx) => {
    const centsDev = centsMap[intQ] || 0;
    const freq = baseRootFreq * Math.pow(2, (intQ * 50 + centsDev) / 1200);
    const t = setTimeout(() => playPluckedNote(freq, 0.9), idx * 280);
    sequenceTimers.push(t);
  });
}

/**
 * @param {number} effectiveRootQ
 * @param {{ interval_q: number, dur_ms: number, accent?: boolean }[]} steps
 * @param {Record<number, number>} centsMap
 * @param {(stepIdx: number) => void} [onStepHighlight]
 */
export function playTaqsimPhrase(effectiveRootQ, steps, centsMap, onStepHighlight) {
  initAudio();
  clearSequenceTimers();
  const baseRootFreq = 130.81 * Math.pow(2, (effectiveRootQ * 50) / 1200);
  let elapsedMs = 0;

  steps.forEach((st, idx) => {
    const intQ = st.interval_q;
    const centsDev = centsMap[intQ] || centsMap[intQ % 24] || 0;
    const freq = baseRootFreq * Math.pow(2, (intQ * 50 + centsDev) / 1200);
    const noteDurSec = Math.max(0.7, (st.dur_ms / 1000) * 1.45);
    const gain = st.accent ? 0.28 : 0.21;

    const t = setTimeout(() => {
      playPluckedNote(freq, noteDurSec, gain);
      if (onStepHighlight) onStepHighlight(idx);
    }, elapsedMs);

    sequenceTimers.push(t);
    elapsedMs += st.dur_ms;
  });

  const endTimer = setTimeout(() => {
    if (onStepHighlight) onStepHighlight(-1);
  }, elapsedMs + 400);
  sequenceTimers.push(endTimer);
}

/**
 * @param {number} stepCount
 * @param {(stepIdx: number) => void} onStepTrigger
 */
export function scheduleCadenceSequence(stepCount, onStepTrigger) {
  initAudio();
  clearSequenceTimers();
  for (let idx = 0; idx < stepCount; idx++) {
    const t = setTimeout(() => onStepTrigger(idx), idx * 1450);
    sequenceTimers.push(t);
  }
}

/**
 * @param {boolean} currentDroneState
 * @param {number} rootQ
 * @param {HTMLElement} btnElement
 * @returns {boolean}
 */
export function toggleDroneAudio(currentDroneState, rootQ, btnElement) {
  initAudio();
  if (!audioCtx) return false;

  if (currentDroneState) {
    if (droneOsc) {
      droneOsc.stop();
      droneOsc.disconnect();
      droneOsc = null;
    }
    btnElement.textContent = "🔊 Drone: OFF";
    btnElement.classList.remove("active-toggle");
    return false;
  } else {
    const rootFreq = 65.41 * Math.pow(2, (rootQ * 50) / 1200) * 2;
    droneOsc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const droneGain = audioCtx.createGain();

    droneOsc.type = "sawtooth";
    droneOsc.frequency.setValueAtTime(rootFreq, audioCtx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(rootFreq * 2.5, audioCtx.currentTime);

    droneGain.gain.setValueAtTime(0.10, audioCtx.currentTime);

    droneOsc.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(audioCtx.destination);
    droneOsc.start();

    btnElement.textContent = `🔊 Drone (${PITCH_CLASSES_24[rootQ].flat}): ON`;
    btnElement.classList.add("active-toggle");
    return true;
  }
}

/**
 * @param {boolean} isDroneActive
 * @param {number} rootQ
 * @param {HTMLElement} btnElement
 */
export function updateDronePitch(isDroneActive, rootQ, btnElement) {
  if (isDroneActive && droneOsc && audioCtx) {
    const rootFreq = 65.41 * Math.pow(2, (rootQ * 50) / 1200) * 2;
    droneOsc.frequency.setValueAtTime(rootFreq, audioCtx.currentTime);
    btnElement.textContent = `🔊 Drone (${PITCH_CLASSES_24[rootQ].flat}): ON`;
  }
}
