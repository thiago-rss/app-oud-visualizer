// @ts-check

/**
 * @typedef {Object} OudAppState
 * @property {"pt"|"en"} lang - Idioma ativo da interface e do banco de dados
 * @property {string} tradition - Escola estética de luthieria ("damascus" | "cairo" | "istanbul")
 * @property {"HORIZONTAL"|"VERTICAL"} orientation - Orientação do espelho do instrumento
 * @property {string} tuningId - ID da afinação ativa das 6 ordens
 * @property {"MAQAM"|"JINS"|"SCALE"|"CHORD"|"CADENCE"} mode - Categoria teórica ativa
 * @property {string} entityId - ID do Maqam, Jins, Modo, Acorde ou Cadência selecionado
 * @property {number} rootQ - Índice da Tônica / Qarar na grade 24-TET (0 a 23)
 * @property {number} cadenceStepIndex - Passo ativo no sequenciador de cadências Qafla
 * @property {"ASC"|"DESC"} direction - Direção melódica do Maqam (Subida ou Descida)
 * @property {boolean} showSayr - Exibir/Ocultar trilhas vetoriais do trajeto melódico (Sayr)
 * @property {number} sayrPhraseIndex - Índice da frase de Taqsim (0: Istihlal, 1: Ghammaz, 2: Qafla)
 * @property {boolean} showStaff - Exibir/Ocultar o módulo de Partitura Interativa 24-TET
 * @property {"SCALE"|"SAYR"} staffMode - Conteúdo exibido na pauta (Escala/Voicing ou Frase Sayr)
 * @property {string} iqaId - ID do ciclo rítmico ativo no motor de Iqa'at
 * @property {number} bpm - Andamento do ciclo rítmico em batidas por minuto (50 a 175)
 * @property {boolean} chordVoicingOnly - Limitar acordes a 1 nota ergonômica por ordem
 * @property {"FULL_NECK"|"OPEN_FIRST_POS"|"CLOSED_BOX"} shapeMode - Modo de mapeamento da mão esquerda
 * @property {number} boxAnchorQ - Posição de ancoragem do Dedo 1 no Shape Fechado (1 a 10 quartos de tom)
 * @property {"ALL"|"LOWER"|"UPPER"} jinsFilter - Filtro de isolamento de tetracordes no Maqam
 * @property {"NOTE_NAME"|"DEGREE"|"FINGER"|"ARABIC"} labelMode - Tipo de inscrição exibida nas joias
 * @property {boolean} showSemiGuides - Exibir linhas-guia de semitom (12-TET)
 * @property {boolean} showMicroGuides - Exibir linhas-guia de quarto de tom (24-TET)
 * @property {boolean} showGhostNotes - Exibir notas fora do shape ativo de forma translúcida
 * @property {boolean} leftHanded - Inverter espelho para canhoto
 * @property {boolean} droneActive - Estado em tempo de execução do bordão contínuo (Qarar)
 */

/**
 * Converte um parâmetro numérico da URL com proteção contra NaN e limites (clamp).
 * @param {string | null} rawVal
 * @param {number} fallback
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function parseClampedInt(rawVal, fallback, min, max) {
  if (rawVal === null || rawVal.trim() === "") return fallback;
  const parsed = parseInt(rawVal, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Lê o hash da URL (`#lang=pt&tr=damascus...`) e reconstrói o estado completo da aplicação.
 * Detecta automaticamente o idioma do navegador e a orientação vertical em telas móveis.
 * @returns {OudAppState}
 */
export function getInitialStateFromUrl() {
  const isMobileViewport = typeof window !== "undefined" && window.innerWidth < 768;
  const browserLang = (typeof navigator !== "undefined" && navigator.language)
    ? (navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en")
    : "pt";

  /** @type {OudAppState} */
  const defaults = {
    lang: browserLang,
    tradition: "damascus",
    orientation: isMobileViewport ? "VERTICAL" : "HORIZONTAL",
    tuningId: "syrian_arabic_c_c",
    mode: "MAQAM",
    entityId: "maqam_rast",
    rootQ: 0,
    cadenceStepIndex: 0,
    direction: "ASC",
    showSayr: true,
    sayrPhraseIndex: 0,
    showStaff: true,
    staffMode: "SCALE",
    iqaId: "iqa_maqsum",
    bpm: 96,
    chordVoicingOnly: true,
    shapeMode: "FULL_NECK",
    boxAnchorQ: 2,
    jinsFilter: "ALL",
    labelMode: "NOTE_NAME",
    showSemiGuides: true,
    showMicroGuides: true,
    showGhostNotes: true,
    leftHanded: false,
    droneActive: false
  };

  try {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return defaults;
    const params = new URLSearchParams(hash);

    // 1. Idioma e Estética de Luthieria
    const lg = params.get("lang");
    if (lg === "pt" || lg === "en") defaults.lang = lg;

    const tr = params.get("tr");
    if (tr === "damascus" || tr === "cairo" || tr === "istanbul") {
      defaults.tradition = tr;
    }

    // 2. Orientação e Mão (Destro/Canhoto)
    const or = params.get("or");
    if (or === "HORIZONTAL" || or === "VERTICAL") {
      defaults.orientation = or;
    }
    if (params.has("lh")) {
      defaults.leftHanded = params.get("lh") === "1";
    }

    // 3. Afinação, Modalidade, Entidade e Qarar
    const t = params.get("t");
    if (t) defaults.tuningId = t;

    const m = params.get("m");
    if (m === "MAQAM" || m === "JINS" || m === "SCALE" || m === "CHORD" || m === "CADENCE") {
      defaults.mode = m;
    }

    const id = params.get("id");
    if (id) defaults.entityId = id;

    defaults.rootQ = parseClampedInt(params.get("r"), defaults.rootQ, 0, 23);
    defaults.cadenceStepIndex = parseClampedInt(params.get("cs"), defaults.cadenceStepIndex, 0, 16);

    // 4. Subcontroles de Maqam, Sayr e Acordes
    const d = params.get("d");
    if (d === "ASC" || d === "DESC") defaults.direction = d;

    if (params.has("sy")) defaults.showSayr = params.get("sy") === "1";
    defaults.sayrPhraseIndex = parseClampedInt(params.get("sp"), defaults.sayrPhraseIndex, 0, 2);

    const jf = params.get("jf");
    if (jf === "ALL" || jf === "LOWER" || jf === "UPPER") {
      defaults.jinsFilter = jf;
    }

    if (params.has("cv")) defaults.chordVoicingOnly = params.get("cv") === "1";

    // 5. Módulo de Partitura Interativa 24-TET
    if (params.has("st")) defaults.showStaff = params.get("st") === "1";
    const sm = params.get("sm");
    if (sm === "SCALE" || sm === "SAYR") defaults.staffMode = sm;

    // 6. Motor Rítmico Iqa'at
    const iq = params.get("iq");
    if (iq) defaults.iqaId = iq;
    defaults.bpm = parseClampedInt(params.get("bpm"), defaults.bpm, 50, 175);

    // 7. Posição, Shapes, Rótulos e Guias Fretless
    const s = params.get("s");
    if (s === "FULL_NECK" || s === "OPEN_FIRST_POS" || s === "CLOSED_BOX") {
      defaults.shapeMode = s;
    }
    defaults.boxAnchorQ = parseClampedInt(params.get("b"), defaults.boxAnchorQ, 1, 10);

    const l = params.get("l");
    if (l === "NOTE_NAME" || l === "DEGREE" || l === "FINGER" || l === "ARABIC") {
      defaults.labelMode = l;
    }

    if (params.has("sg")) defaults.showSemiGuides = params.get("sg") === "1";
    if (params.has("mg")) defaults.showMicroGuides = params.get("mg") === "1";
    if (params.has("gn")) defaults.showGhostNotes = params.get("gn") === "1";
  } catch (err) {
    console.warn("Falha ao deserializar estado da URL:", err);
  }

  return defaults;
}

/**
 * Serializa o estado atual no hash da URL sem recarregar a página e retorna o link completo.
 * @param {OudAppState} state
 * @returns {string} URL completa pronta para compartilhamento
 */
export function syncStateToUrl(state) {
  const params = new URLSearchParams();

  params.set("lang", state.lang);
  params.set("tr", state.tradition);
  params.set("or", state.orientation);
  params.set("t", state.tuningId);
  params.set("m", state.mode);
  params.set("id", state.entityId);
  params.set("r", String(state.rootQ));

  // Partitura 24-TET
  params.set("st", state.showStaff ? "1" : "0");
  params.set("sm", state.staffMode);

  // Motor Rítmico Iqa'at
  params.set("iq", state.iqaId);
  params.set("bpm", String(state.bpm));

  // Parâmetros específicos por modo
  if (state.mode === "CADENCE") {
    params.set("cs", String(state.cadenceStepIndex));
  }
  if (state.mode === "MAQAM") {
    params.set("d", state.direction);
    params.set("sy", state.showSayr ? "1" : "0");
    params.set("sp", String(state.sayrPhraseIndex));
    params.set("jf", state.jinsFilter);
  }
  if (state.mode === "CHORD" || state.mode === "CADENCE") {
    params.set("cv", state.chordVoicingOnly ? "1" : "0");
  }

  // Ergonomia, Inscrições e Guias
  params.set("s", state.shapeMode);
  if (state.shapeMode === "CLOSED_BOX") {
    params.set("b", String(state.boxAnchorQ));
  }
  params.set("l", state.labelMode);

  if (!state.showSemiGuides) params.set("sg", "0");
  if (!state.showMicroGuides) params.set("mg", "0");
  if (!state.showGhostNotes) params.set("gn", "0");
  if (state.leftHanded) params.set("lh", "1");

  const newHash = `#${params.toString()}`;
  if (typeof window !== "undefined" && window.history?.replaceState) {
    window.history.replaceState(null, "", newHash);
    return window.location.href;
  }

  return newHash;
}
