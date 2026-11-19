// @ts-check
import { DB, PITCH_CLASSES_24 } from "./core/database.js";
import { getActiveStructure, computeAnchoredOctavePath } from "./core/modalEngine.js";
import { getInitialStateFromUrl, syncStateToUrl } from "./core/urlState.js";
import { GLOSSARY_ENTRIES } from "./core/glossary.js";
import {
  t,
  localizeEntity,
  localizeGlossaryEntry,
  applyStaticTranslations
} from "./core/i18n.js";
import {
  clearSequenceTimers,
  playPluckedNote,
  strumChordVoicing,
  arpeggiateChordVoicing,
  playScaleSequence,
  playTaqsimPhrase,
  scheduleCadenceSequence,
  toggleDroneAudio,
  updateDronePitch,
  startIqaEngine,
  stopIqaEngine
} from "./audio/synthEngine.js";
import { renderOudNeckSVG } from "./ui/neckRenderer.js";
import { renderMusicalStaffSVG } from "./ui/staffRenderer.js";

const state = getInitialStateFromUrl();

let userOverrodeSidebar = false;
let desktopPreferredOrientation = state.orientation;

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth <= 768;
}

if (isMobileViewport()) {
  state.orientation = "VERTICAL";
}

try {
  const savedTheme = localStorage.getItem("oud_theme_pref");
  if (!window.location.hash.includes("th=") && (savedTheme === "light" || savedTheme === "dark")) {
    state.theme = savedTheme;
  }
} catch {
  // Ignora se localStorage estiver bloqueado
}

if (state.theme !== "light" && state.theme !== "dark") state.theme = "dark";
if (typeof state.rootQ !== "number" || Number.isNaN(state.rootQ) || state.rootQ < 0 || state.rootQ >= 24) state.rootQ = 0;
if (typeof state.anchorAbsQ !== "number" || Number.isNaN(state.anchorAbsQ)) state.anchorAbsQ = null;
if (typeof state.octavePathOnly !== "boolean") state.octavePathOnly = false;
if (state.octavePathDir !== "ASC" && state.octavePathDir !== "DESC") state.octavePathDir = "ASC";
if (typeof state.showStaff !== "boolean") state.showStaff = true;
if (state.staffMode !== "SCALE" && state.staffMode !== "SAYR") state.staffMode = "SCALE";
if (typeof state.showPositionsMap !== "boolean") state.showPositionsMap = true;

/** @type {{ course: number, freq: number }[]} */
let currentChordVoicingFreqs = [];
let highlightedSequenceStep = -1;
/** @type {{ absQ: number | null, pitchClassQ: number | null, qFromNut?: number, course?: number, finger?: string | number, freq?: number } | null} */
let selectedStaffOrNeckPitch = null;
let isIqaPlaying = false;
let activeIqaBeatIdx = -1;
let glossaryCategory = "ALL";
let glossaryQuery = "";

let isZenMode = false;
let isSidebarCollapsed = isMobileViewport();
/** @type {number | null} */
let activePopoverIdx = null;
/** @type {"theory"|"modulation"} */
let activeDeckTab = "theory";
/** @type {number | undefined} */
let loupeHideTimer;

/** @type {{ mode: any, entityId: string, rootQ: number, anchorAbsQ: number | null, label: string } | null} */
let modulationOrigin = null;

/**
 * Busca chave de tradução com fallback seguro em PT/EN.
 * @param {string} key
 * @param {string} fallbackPt
 * @param {string} fallbackEn
 */
function safeT(key, fallbackPt, fallbackEn) {
  const val = t(state.lang, /** @type {any} */ (key));
  if (val && val !== key) return val;
  return state.lang === "en" ? fallbackEn : fallbackPt;
}

/** @type {Record<string, { targetMode: "MAQAM"|"JINS", targetId: string, offsetQ: number, isGhammaz?: boolean, pivotPt: string, pivotEn: string, reasonPt: string, reasonEn: string }[]>} */
const MODULATION_RADAR_MAP = {
  maqam_rast: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Converte o 2º Jins em Hijaz sobre o Ghammaz, criando a célebre sonoridade de Maqam Suznak.",
      reasonEn: "Converts the upper Jins into Hijaz on the Ghammaz, creating the classic Maqam Suznak color."
    },
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Inflexão descendente natural do Rast introduzindo o 7º grau menor (Ajam) rumo à resolução.",
      reasonEn: "Natural descending inflection of Rast introducing the minor 7th (Ajam) toward resolution."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_bayati",
      offsetQ: 4,
      pivotPt: "2º Grau (Dukah +1 Tom)",
      pivotEn: "2nd Degree (Dukah +1 Tone)",
      reasonPt: "Modulação lírica para o 2º grau aproveitando as notas comuns da família Rast/Bayati.",
      reasonEn: "Lyrical modulation to the 2nd degree sharing the core pitches of the Rast/Bayati family."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_sikah",
      offsetQ: 7,
      pivotPt: "3º Grau Neutro (Sikah)",
      pivotEn: "Neutral 3rd (Sikah)",
      reasonPt: "Ancora temporariamente o repouso sobre a terça neutra microtonal (3-) do próprio Rast.",
      reasonEn: "Temporarily anchors the tonic directly on Rast's microtonal neutral third (3-)."
    }
  ],
  maqam_bayati: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Transforma o 4º grau em Jins Hijaz (caminho de Bayati Shuri / Karjighar), muito frequente no Taqsim.",
      reasonEn: "Turns the 4th degree into Jins Hijaz (Bayati Shuri / Karjighar pathway), a staple in Taqsim."
    },
    {
      targetMode: "JINS",
      targetId: "jins_rast",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Abre o registro superior com Jins Rast sobre a 4ª justa, iluminando o fraseado ascendente.",
      reasonEn: "Opens the upper register with Jins Rast on the 4th degree, brightening ascending phrases."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_saba",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Bemoliza o 4º grau (b4 diminuta) mantendo a mesma tônica, mergulhando na tensão do Saba.",
      reasonEn: "Lowers the 4th degree (diminished b4) on the same tonic, shifting into the tension of Saba."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_rast",
      offsetQ: 20,
      pivotPt: "7º Grau Subtônico (-1 Tom)",
      pivotEn: "Subtonic b7 (-1 Whole Tone)",
      reasonPt: "Desce 1 tom inteiro abaixo do Qarar para repousar na matriz fundamental do Maqam Rast.",
      reasonEn: "Steps down 1 whole tone below the Qarar to rest on the foundational Maqam Rast matrix."
    }
  ],
  maqam_saba: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 6,
      isGhammaz: true,
      pivotPt: "3º Grau Menor (Ghammaz b3)",
      pivotEn: "Minor 3rd (Ghammaz b3)",
      reasonPt: "Isola o Jins Hijaz superposto no 3º grau onde o Saba constrói seu clímax melódico.",
      reasonEn: "Isolates the overlapping Jins Hijaz on the 3rd degree where Saba builds its melodic climax."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_bayati",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Relaxa a 4ª diminuta de volta para a 4ª justa, dissolvendo a tensão do Saba em Bayati.",
      reasonEn: "Relaxes the diminished 4th back to a perfect 4th, resolving Saba's tension into Bayati."
    },
    {
      targetMode: "JINS",
      targetId: "jins_ajam",
      offsetQ: 16,
      pivotPt: "6º Grau Menor (b6)",
      pivotEn: "Minor 6th Degree (b6)",
      reasonPt: "Janela luminosa em modo maior (Jins Ajam) sobre o 6º grau antes da descida final.",
      reasonEn: "Bright major window (Jins Ajam) on the 6th degree before the final cadential descent."
    }
  ],
  maqam_hijaz: [
    {
      targetMode: "JINS",
      targetId: "jins_rast",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Rota ascendente clássica do Hijaz introduzindo o 6º grau neutro microtonal.",
      reasonEn: "Classic ascending pathway of Hijaz introducing the microtonal neutral 6th."
    },
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Estabelece repouso menor suave sobre o Ghammaz preparando a descida pelo b6.",
      reasonEn: "Establishes a gentle minor rest on the Ghammaz preparing the descent through b6."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_bayati",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Suaviza a tônica convertendo o salto de 2ª aumentada do Hijaz na 2ª neutra do Bayati.",
      reasonEn: "Softens the tonic by converting Hijaz's augmented 2nd leap into Bayati's neutral 2nd."
    },
    {
      targetMode: "JINS",
      targetId: "jins_nikriz",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Desloca o salto de 2ª aumentada dos graus b2–3 para os graus b3–#4 na mesma tônica.",
      reasonEn: "Shifts the augmented 2nd leap from degrees b2–3 to degrees b3–#4 on the same tonic."
    }
  ],
  maqam_nahawand: [
    {
      targetMode: "JINS",
      targetId: "jins_ajam",
      offsetQ: 6,
      pivotPt: "3º Grau (Relativo Maior b3)",
      pivotEn: "3rd Degree (Relative Major b3)",
      reasonPt: "Modulação clássica para o Jins Ajam relativo maior sobre a mediante.",
      reasonEn: "Classic modulation to the relative major Jins Ajam on the mediant."
    },
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Ativa a sensível (7º grau maior) no tetracorde superior para impulsionar a resolução.",
      reasonEn: "Activates the leading tone (major 7th) in the upper tetrachord to drive resolution."
    },
    {
      targetMode: "JINS",
      targetId: "jins_bayati",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Introduz inflexão microtonal sobre a dominante (6º grau neutro).",
      reasonEn: "Introduces a microtonal inflection on the dominant (neutral 6th degree)."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_nikriz",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Eleva o 4º grau (#4) sobre a mesma base menor para criar tensão cromática.",
      reasonEn: "Raises the 4th degree (#4) over the same minor base to create chromatic pull."
    }
  ],
  maqam_kurd: [
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 10,
      isGhammaz: true,
      pivotPt: "4º Grau (Ghammaz)",
      pivotEn: "4th Degree (Ghammaz)",
      reasonPt: "Expande o desenvolvimento melódico sobre o tetracorde menor do 4º grau.",
      reasonEn: "Expands melodic development over the minor tetrachord on the 4th degree."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_hijaz",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Eleva a 3ª menor para 3ª maior mantendo o b2, transformando Kurd em Hijaz.",
      reasonEn: "Raises the minor 3rd to a major 3rd while keeping b2, transforming Kurd into Hijaz."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_bayati",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Eleva o b2 em 1 quarto de tom (2-), transitando do mundo 12-TET para o Bayati.",
      reasonEn: "Raises b2 by a quarter tone (2-), transitioning from 12-TET Phrygian into Bayati."
    }
  ],
  maqam_sikah: [
    {
      targetMode: "JINS",
      targetId: "jins_rast",
      offsetQ: 7,
      isGhammaz: true,
      pivotPt: "3º Grau (Ghammaz)",
      pivotEn: "3rd Degree (Ghammaz)",
      reasonPt: "Desenvolve o Jins Rast sobre a nota natural 7 quartos de tom acima da tônica Sikah.",
      reasonEn: "Develops Jins Rast on the natural pitch 7 quarter tones above the Sikah tonic."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_huzam",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Converte o 2º Jins em Hijaz mantendo a mesma tônica microtonal Sikah.",
      reasonEn: "Converts the upper Jins into Hijaz while keeping the same microtonal Sikah tonic."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_rast",
      offsetQ: 17,
      pivotPt: "Base Rast (-3ª Neutra)",
      pivotEn: "Rast Matrix (-Neutral 3rd)",
      reasonPt: "Resolve descendentemente na fundamental Rast situada uma terça neutra abaixo.",
      reasonEn: "Resolves downward onto the underlying Rast tonic a neutral third below."
    }
  ],
  maqam_huzam: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 7,
      isGhammaz: true,
      pivotPt: "3º Grau (Ghammaz)",
      pivotEn: "3rd Degree (Ghammaz)",
      reasonPt: "Isola o brilho do Jins Hijaz ancorado no 3º grau do Huzam.",
      reasonEn: "Isolates the bright Jins Hijaz anchored on Huzam's 3rd degree."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_sikah",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Suaviza o tetracorde superior trocando Hijaz por Jins Rast.",
      reasonEn: "Softens the upper tetrachord by replacing Hijaz with Jins Rast."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_rast",
      offsetQ: 17,
      pivotPt: "Base Rast (-3ª Neutra)",
      pivotEn: "Rast Matrix (-Neutral 3rd)",
      reasonPt: "Conecta o Huzam à sua matriz Rast subjacente.",
      reasonEn: "Connects Huzam to its underlying Rast parent scale."
    }
  ],
  maqam_nikriz: [
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Explora o tetracorde menor superior a partir do Ghammaz de 5ª justa.",
      reasonEn: "Explores the upper minor tetrachord starting on the perfect 5th Ghammaz."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_nawa_athar",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Troca o 2º Jins por Hijaz, criando dois saltos de 2ª aumentada na mesma oitava.",
      reasonEn: "Replaces the upper Jins with Hijaz, creating two augmented 2nd leaps in one octave."
    },
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 4,
      pivotPt: "2º Grau (+1 Tom)",
      pivotEn: "2nd Degree (+1 Tone)",
      reasonPt: "Pivô interno: o pentacorde Nikriz contém exatamente um Jins Hijaz a partir do 2º grau.",
      reasonEn: "Internal pivot: the Nikriz pentachord embeds a complete Jins Hijaz starting on its 2nd degree."
    }
  ],
  maqam_nawa_athar: [
    {
      targetMode: "JINS",
      targetId: "jins_hijaz",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Isola o Jins Hijaz superior responsável pela sensível dramática rumo à oitava.",
      reasonEn: "Isolates the upper Jins Hijaz responsible for the dramatic leading tone to the octave."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_nikriz",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Relaxa o registro superior convertendo o 2º Jins em Nahawand.",
      reasonEn: "Relaxes the upper register by converting the 2nd Jins into Nahawand."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_nahawand",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Resolve o #4 de volta para a 4ª justa mantendo a tônica e a dominante.",
      reasonEn: "Resolves #4 back to a perfect 4th while keeping the same tonic and dominant."
    }
  ],
  maqam_ajam: [
    {
      targetMode: "MAQAM",
      targetId: "maqam_nahawand",
      offsetQ: 18,
      pivotPt: "6º Grau (Relativo Menor)",
      pivotEn: "6th Degree (Relative Minor)",
      reasonPt: "Modulação clássica para o Maqam Nahawand relativo menor.",
      reasonEn: "Classic modulation to the relative minor Maqam Nahawand."
    },
    {
      targetMode: "JINS",
      targetId: "jins_nahawand",
      offsetQ: 14,
      isGhammaz: true,
      pivotPt: "5º Grau (Ghammaz)",
      pivotEn: "5th Degree (Ghammaz)",
      reasonPt: "Inflexão descendente com b7 menor (caminho Mixolídio de fechamento do Ajam).",
      reasonEn: "Descending inflection with minor b7 (Mixolydian cadential path of Ajam)."
    },
    {
      targetMode: "MAQAM",
      targetId: "maqam_rast",
      offsetQ: 0,
      pivotPt: "1º Grau (Mesmo Qarar)",
      pivotEn: "1st Degree (Same Qarar)",
      reasonPt: "Inflexiona a 3ª e a 7ª maiores em 1 quarto de tom para baixo, entrando em Rast.",
      reasonEn: "Inflects the major 3rd and 7th down by a quarter tone, entering Maqam Rast."
    }
  ]
};

function getModulationRoutesForCurrentState() {
  const activeStruct = getActiveStructure(state);
  const effRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;

  if (state.mode === "MAQAM" && MODULATION_RADAR_MAP[state.entityId]) {
    return MODULATION_RADAR_MAP[state.entityId].map(r => ({
      ...r,
      absTargetRootQ: (effRootQ + r.offsetQ) % 24
    }));
  }

  const entityObj = /** @type {any} */ (activeStruct.entity);
  const ghammazQ = activeStruct.ghammazOffsets?.[0] ?? 14;
  /** @type {any[]} */
  const fallbackRoutes = [];

  if (entityObj.bridge_maqam && MODULATION_RADAR_MAP[entityObj.bridge_maqam]) {
    fallbackRoutes.push({
      targetMode: "MAQAM",
      targetId: entityObj.bridge_maqam,
      offsetQ: 0,
      pivotPt: "1º Grau (Matriz Modal Completa)",
      pivotEn: "1st Degree (Full Modal Matrix)",
      reasonPt: "Expande o estudo atual para o Maqam completo correspondente na mesma tônica.",
      reasonEn: "Expands the current study into its full parent Maqam on the same tonic.",
      absTargetRootQ: effRootQ
    });
    MODULATION_RADAR_MAP[entityObj.bridge_maqam].slice(0, 2).forEach(r => {
      fallbackRoutes.push({
        ...r,
        absTargetRootQ: (effRootQ + r.offsetQ) % 24
      });
    });
    return fallbackRoutes;
  }

  const parentMaqam = DB.maqamat.find(m => m.id.replace("maqam_", "") === state.entityId.replace("jins_", "")) || DB.maqamat[0];
  fallbackRoutes.push({
    targetMode: "MAQAM",
    targetId: parentMaqam.id,
    offsetQ: 0,
    pivotPt: "1º Grau (Maqam Completo)",
    pivotEn: "1st Degree (Full Maqam)",
    reasonPt: "Conecta este Jins ao Maqam completo para praticar o 1º e 2º tetracordes encadeados.",
    reasonEn: "Connects this Jins to its full Maqam to practice the lower and upper tetrachords together.",
    absTargetRootQ: effRootQ
  });

  fallbackRoutes.push({
    targetMode: "JINS",
    targetId: "jins_rast",
    offsetQ: ghammazQ,
    isGhammaz: true,
    pivotPt: `Pivô Ghammaz (+${ghammazQ}q)`,
    pivotEn: `Ghammaz Pivot (+${ghammazQ}q)`,
    reasonPt: "Abre um Jins Rast sobre a nota-pivô (Ghammaz) para desenvolver o registro agudo.",
    reasonEn: "Opens a Jins Rast on the Ghammaz pivot note to develop the upper register.",
    absTargetRootQ: (effRootQ + ghammazQ) % 24
  });

  fallbackRoutes.push({
    targetMode: "JINS",
    targetId: "jins_hijaz",
    offsetQ: ghammazQ,
    isGhammaz: true,
    pivotPt: `Pivô Ghammaz (+${ghammazQ}q)`,
    pivotEn: `Ghammaz Pivot (+${ghammazQ}q)`,
    reasonPt: "Introduz tensão de 2ª aumentada (Jins Hijaz) sobre o Ghammaz antes de retornar à tônica.",
    reasonEn: "Introduces augmented 2nd tension (Jins Hijaz) on the Ghammaz before returning to the tonic.",
    absTargetRootQ: (effRootQ + ghammazQ) % 24
  });

  return fallbackRoutes;
}

function hasValidAnchor() {
  return typeof state.anchorAbsQ === "number" && !Number.isNaN(state.anchorAbsQ) && state.anchorAbsQ >= 0;
}

function resolvePitchClassQ(targetPitch) {
  if (!targetPitch) return null;
  if (typeof targetPitch.pitchClassQ === "number" && !Number.isNaN(targetPitch.pitchClassQ)) {
    return ((targetPitch.pitchClassQ % 24) + 24) % 24;
  }
  if (typeof targetPitch.absQ === "number" && !Number.isNaN(targetPitch.absQ)) {
    return ((targetPitch.absQ % 24) + 24) % 24;
  }
  return null;
}

/**
 * Abre ou fecha um dos 4 painéis da Barra Única (Popover no Desktop / Bottom Sheet no Mobile).
 * @param {number | null} idx
 */
function setActivePopover(idx) {
  activePopoverIdx = idx;
  const backdrop = document.getElementById("popover-backdrop");

  document.querySelectorAll(".cmd-popover").forEach(el => {
    const panel = /** @type {HTMLElement} */ (el);
    const isOpen = idx !== null && Number(panel.dataset.panelId) === idx;
    panel.classList.toggle("open", isOpen);
    panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  });

  document.querySelectorAll(".cmd-trigger").forEach(el => {
    const btn = /** @type {HTMLElement} */ (el);
    const isActive = idx !== null && Number(btn.dataset.panel) === idx;
    btn.classList.toggle("active-trigger", isActive);
    btn.setAttribute("aria-expanded", isActive ? "true" : "false");
  });

  if (backdrop) {
    backdrop.classList.toggle("open", idx !== null);
  }
}

function toggleAppTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  try {
    localStorage.setItem("oud_theme_pref", state.theme);
  } catch {
    // Ignora
  }
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", state.theme === "light" ? "#f4eee4" : "#100d0b");
  }
  syncControlsWithState();
  refreshAll();
}

function toggleZenMode(forceVal) {
  setActivePopover(null);
  isZenMode = typeof forceVal === "boolean" ? forceVal : !isZenMode;
  document.body.setAttribute("data-zen", isZenMode ? "true" : "false");
  syncControlsWithState();
  refreshAll();
}

function toggleSidebarCollapsed(forceVal) {
  userOverrodeSidebar = true;
  isSidebarCollapsed = typeof forceVal === "boolean" ? forceVal : !isSidebarCollapsed;
  document.body.setAttribute("data-sidebar", isSidebarCollapsed ? "collapsed" : "expanded");
  syncControlsWithState();
}

/** @param {"theory"|"modulation"} tabName */
function setActiveDeckTab(tabName) {
  activeDeckTab = tabName;
  if (isSidebarCollapsed) {
    isSidebarCollapsed = false;
    userOverrodeSidebar = true;
    document.body.setAttribute("data-sidebar", "expanded");
  }

  document.querySelectorAll(".deck-tab-btn").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    const isAct = el.dataset.deckTab === tabName;
    el.classList.toggle("active", isAct);
    el.setAttribute("aria-selected", isAct ? "true" : "false");
  });

  document.querySelectorAll(".deck-pane").forEach(pane => {
    const el = /** @type {HTMLElement} */ (pane);
    el.classList.toggle("active-pane", el.dataset.deckPane === tabName);
  });

  syncControlsWithState();
}

function toggleIqaPlayback() {
  const btnToggleIqa = document.getElementById("btn-toggle-iqa");
  if (isIqaPlaying) {
    stopIqaEngine();
    isIqaPlaying = false;
    activeIqaBeatIdx = -1;
    if (btnToggleIqa) {
      btnToggleIqa.textContent = safeT("btnStartIqa", "▶ Iniciar Iqa'", "▶ Start Iqa'");
      btnToggleIqa.classList.remove("active-toggle");
    }
    renderIqaBeatGrid();
  } else {
    isIqaPlaying = true;
    if (btnToggleIqa) {
      btnToggleIqa.textContent = safeT("btnStopIqa", "⏹ Parar Iqa'", "⏹ Stop Iqa'");
      btnToggleIqa.classList.add("active-toggle");
    }
    restartIqaIfPlaying();
  }
  syncCommandBarSummaries();
}

function showTouchLoupeFeedback(noteInfo) {
  const loupe = document.getElementById("touch-loupe-badge");
  if (!loupe || noteInfo.pitchClassQ === null) return;

  const pcIdx = ((noteInfo.pitchClassQ % 24) + 24) % 24;
  const pc = PITCH_CLASSES_24[pcIdx] || PITCH_CLASSES_24[0];
  const isEn = state.lang === "en";

  const courseTxt = noteInfo.course
    ? (isEn ? `${noteInfo.course}th Course` : `${noteInfo.course}ª Ordem`)
    : "";
  const fingerTxt = noteInfo.qFromNut === 0
    ? (isEn ? "Open" : "Solta")
    : (noteInfo.finger !== undefined ? (isEn ? `F${noteInfo.finger}` : `Dedo ${noteInfo.finger}`) : "");

  loupe.innerHTML = `
    <span style="color:var(--accent);">${pc.flat} (${pc.arabic})</span>
    ${courseTxt ? `<span style="color:var(--plum);">• ${courseTxt}</span>` : ""}
    ${fingerTxt ? `<span style="color:var(--text-muted); font-size:0.74rem;">• ${fingerTxt}</span>` : ""}
  `;
  loupe.classList.add("visible");

  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(10);
    } catch {
      // Ignora
    }
  }

  window.clearTimeout(loupeHideTimer);
  loupeHideTimer = window.setTimeout(() => {
    loupe.classList.remove("visible");
  }, 2400);
}

function applySelectedPitchAsRoot(targetPitch) {
  const newRootQ = resolvePitchClassQ(targetPitch);
  if (newRootQ === null) return;

  clearSequenceTimers();
  highlightedSequenceStep = -1;
  state.rootQ = newRootQ;

  if (targetPitch && typeof targetPitch.absQ === "number" && !Number.isNaN(targetPitch.absQ)) {
    state.anchorAbsQ = targetPitch.absQ;
    state.octavePathOnly = true;
    state.octavePathDir = "ASC";
  } else {
    state.anchorAbsQ = null;
    state.octavePathOnly = false;
  }

  if (state.mode === "CADENCE") {
    state.cadenceStepIndex = 0;
  }

  const selRoot = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-root"));
  if (selRoot) selRoot.value = String(state.rootQ);

  if (state.shapeMode === "CLOSED_BOX" && targetPitch && typeof targetPitch.qFromNut === "number" && targetPitch.qFromNut >= 1) {
    state.boxAnchorQ = Math.max(1, Math.min(10, targetPitch.qFromNut));
    const sliderBox = /** @type {HTMLInputElement | null} */ (document.getElementById("slider-box"));
    const labelBoxPos = document.getElementById("label-box-pos");
    if (sliderBox) sliderBox.value = String(state.boxAnchorQ);
    if (labelBoxPos) {
      const semiApprox = (state.boxAnchorQ / 2).toFixed(1).replace(".0", "");
      labelBoxPos.textContent = `S${semiApprox} (q=${state.boxAnchorQ})`;
    }
  }

  const feedbackFreq = (targetPitch && typeof targetPitch.freq === "number")
    ? targetPitch.freq
    : 130.81 * Math.pow(2, state.rootQ / 24);
  playPluckedNote(feedbackFreq, 1.4);

  selectedStaffOrNeckPitch = null;
  syncControlsWithState();
  refreshAll();
}

function handlePlayAnchoredOctavePath() {
  if (!hasValidAnchor()) return;
  const pathNodes = computeAnchoredOctavePath(state);
  if (!pathNodes.length) return;

  clearSequenceTimers();
  highlightedSequenceStep = -1;

  if (!state.octavePathOnly) {
    state.octavePathOnly = true;
    syncControlsWithState();
  }

  const steps = pathNodes.map(n => ({
    interval_q: n.absQ - state.rootQ,
    dur_ms: 360,
    accent: n.degree === "1" || n.degree === "8" || n.degree === "5"
  }));

  playTaqsimPhrase(state.rootQ, steps, {}, (stepIdx) => {
    highlightedSequenceStep = stepIdx;
    refreshAll();
  });
}

function syncCommandBarSummaries() {
  const activeStruct = getActiveStructure(state);
  const entity = localizeEntity(state.lang, activeStruct.entity);
  const safeRootQ = ((state.rootQ % 24) + 24) % 24;
  const safeEffRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;
  const rootName = PITCH_CLASSES_24[safeRootQ]?.flat || "C";
  const effRootName = PITCH_CLASSES_24[safeEffRootQ]?.flat || "C";

  const rawTuning = DB.tunings.find(x => x.id === state.tuningId) || DB.tunings[0];
  const tuning = localizeEntity(state.lang, rawTuning);
  const rawIqa = DB.iqaat.find(x => x.id === state.iqaId) || DB.iqaat[0];
  const iqa = localizeEntity(state.lang, rawIqa);

  const shortTuning = tuning.name.split("(")[0].trim();
  const shortIqa = iqa.name.split("(")[0].split("—")[0].trim();
  const dirArrow = state.mode === "MAQAM" ? (state.direction === "ASC" ? " ↑" : " ↓") : "";

  const shapeShort = state.shapeMode === "FULL_NECK"
    ? (state.lang === "en" ? "Full" : "Completo")
    : (state.shapeMode === "OPEN_FIRST_POS"
      ? (state.lang === "en" ? "I · 1st Pos" : "I · 1ª Pos")
      : (state.shapeMode === "POS_SECOND"
        ? (state.lang === "en" ? "II · 2nd Pos" : "II · 2ª Pos")
        : (state.shapeMode === "POS_THIRD_BODY"
          ? (state.lang === "en" ? "III · Body" : "III · Tampo")
          : (state.lang === "en" ? "Box" : "Móvel"))));

  const lblShort = state.labelMode === "NOTE_NAME"
    ? (state.lang === "en" ? "Notes" : "Cifra")
    : (state.labelMode === "DEGREE"
      ? (state.lang === "en" ? "Deg" : "Grau")
      : (state.labelMode === "FINGER"
        ? (state.lang === "en" ? "Fingers" : "Dedos")
        : (state.lang === "en" ? "Arabic" : "Árabe")));

  const v0 = document.getElementById("cmd-val-0");
  const v1 = document.getElementById("cmd-val-1");
  const v2 = document.getElementById("cmd-val-2");
  const v3 = document.getElementById("cmd-val-3");

  if (v0) v0.textContent = `${shortTuning} • ${rootName}`;
  if (v1) v1.textContent = `${entity.name.replace(/^\[.*?\]\s*/, "")} (${effRootName})${dirArrow}`;
  if (v2) v2.textContent = `${shapeShort} • ${lblShort}`;
  if (v3) v3.textContent = `${shortIqa} • ${state.bpm} BPM${isIqaPlaying ? " ●" : ""}`;

  // Traduções dinâmicas da Barra Única e do Deck
  const setKicker = (sel, pt, en) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = state.lang === "en" ? en : pt;
  };
  setKicker('[data-i18n="cmdKickerMizan"]', "Afinação & Qarar", "Tuning & Qarar");
  setKicker('[data-i18n="cmdKickerMode"]', "Modalidade", "Mode / Maqam");
  setKicker('[data-i18n="cmdKickerNeck"]', "Espelho & Guias", "Fingerboard & Guides");
  setKicker('[data-i18n="cmdKickerIqa"]', "Ritmo (Iqa')", "Rhythm (Iqa')");
  setKicker('[data-i18n="popoverNeckTitle"]', "Espelho, Posições & Visualização", "Fingerboard, Positions & View");
  setKicker('[data-i18n="lblTradition"]', "Escola de Luthieria", "Luthierie Tradition");
  setKicker('[data-i18n="lblVisualLayers"]', "Camadas & Ergonomia", "Layers & Ergonomics");
  setKicker('[data-i18n="deckTabTheory"]', "Teoria & Sayr", "Theory & Sayr");
  setKicker('[data-i18n="deckTabModulation"]', "Radar de Modulação", "Modulation Radar");

  const deckStatus = document.getElementById("deck-mini-status");
  if (deckStatus) {
    deckStatus.textContent = `${entity.name.replace(/^\[.*?\]\s*/, "")} • ${effRootName}${dirArrow}`;
  }

  const btnDeckCollapse = document.getElementById("btn-deck-collapse");
  if (btnDeckCollapse) {
    btnDeckCollapse.setAttribute("aria-expanded", isSidebarCollapsed ? "false" : "true");
    btnDeckCollapse.textContent = isSidebarCollapsed
      ? (state.lang === "en" ? "▸ Expand" : "▸ Expandir")
      : (state.lang === "en" ? "▾ Collapse" : "▾ Recolher");
  }

  document.querySelectorAll(".btn-close-popover").forEach(btn => {
    btn.textContent = safeT("btnMobileDone", "✓ Concluir", "✓ Done");
  });

  // Botões da barra mobile inferior
  const btnMobPlay = document.getElementById("btn-mob-play");
  const btnMobTaqsim = document.getElementById("btn-mob-taqsim");
  const btnMobDrone = document.getElementById("btn-mob-drone");
  const btnMobIqa = document.getElementById("btn-mob-iqa");
  const btnMobTheory = document.getElementById("btn-mob-theory");

  if (btnMobPlay) btnMobPlay.textContent = safeT("mobileDockPlay", "▶ Tocar", "▶ Play");
  if (btnMobTaqsim) {
    btnMobTaqsim.textContent = safeT("mobileDockTaqsim", "🎶 Taqsim", "🎶 Taqsim");
    btnMobTaqsim.style.opacity = state.mode === "MAQAM" ? "1" : "0.45";
  }
  if (btnMobDrone) {
    btnMobDrone.classList.toggle("active-toggle", state.droneActive);
    btnMobDrone.textContent = state.droneActive ? `🔊 ${rootName}` : safeT("mobileDockDrone", "🔊 Drone", "🔊 Drone");
  }
  if (btnMobIqa) {
    btnMobIqa.classList.toggle("active-toggle", isIqaPlaying);
    btnMobIqa.textContent = isIqaPlaying ? "⏹ Iqa'" : safeT("mobileDockIqa", "🥁 Iqa'", "🥁 Iqa'");
  }
  if (btnMobTheory) {
    btnMobTheory.classList.toggle("active-toggle", !isSidebarCollapsed);
    btnMobTheory.textContent = isSidebarCollapsed
      ? (state.lang === "en" ? "📖 Theory" : "📖 Teoria")
      : (state.lang === "en" ? "✕ Theory" : "✕ Teoria");
  }

  // HUD do Modo Imersivo (Zen)
  const zenEntity = document.getElementById("zen-badge-entity");
  const zenTuning = document.getElementById("zen-badge-tuning");
  const zenIqa = document.getElementById("zen-badge-iqa");
  if (zenEntity) zenEntity.textContent = `${entity.name} (${effRootName})`;
  if (zenTuning) zenTuning.textContent = shortTuning;
  if (zenIqa) zenIqa.textContent = `${shortIqa} • ${state.bpm} BPM`;

  const btnZenTaqsim = document.getElementById("btn-zen-taqsim");
  if (btnZenTaqsim) btnZenTaqsim.style.display = state.mode === "MAQAM" ? "inline-flex" : "none";

  const btnZenDrone = document.getElementById("btn-zen-drone");
  if (btnZenDrone) {
    btnZenDrone.classList.toggle("active-toggle", state.droneActive);
    btnZenDrone.textContent = state.droneActive ? `🔊 Drone: ${rootName}` : "🔊 Drone: OFF";
  }

  const btnZenIqa = document.getElementById("btn-zen-iqa");
  if (btnZenIqa) {
    btnZenIqa.classList.toggle("active-toggle", isIqaPlaying);
    btnZenIqa.textContent = isIqaPlaying ? "⏹ Iqa'" : "▶ Iqa'";
  }

  const btnZenExit = document.getElementById("btn-zen-exit");
  if (btnZenExit) {
    btnZenExit.textContent = state.lang === "en" ? "✕ Exit Zen (Esc / F)" : "✕ Sair Imersivo (Esc / F)";
  }

  const btnInstall = document.getElementById("btn-install-pwa");
  if (btnInstall) {
    btnInstall.textContent = state.lang === "en" ? "📲 Install App" : "📲 Instalar App";
  }
}

function renderGlossaryList(focusTermId) {
  const listEl = document.getElementById("glossary-list");
  if (!listEl) return;
  listEl.innerHTML = "";

  const normalize = (/** @type {string} */ str) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const qNorm = normalize(glossaryQuery.trim());

  const filtered = GLOSSARY_ENTRIES.filter(rawEntry => {
    const matchCat = glossaryCategory === "ALL" || rawEntry.category === glossaryCategory;
    if (!matchCat) return false;
    if (!qNorm) return true;
    const locEntry = localizeGlossaryEntry(state.lang, rawEntry);
    const haystack = normalize(
      `${rawEntry.term} ${rawEntry.literal} ${rawEntry.definition} ${locEntry.term} ${locEntry.literal} ${locEntry.definition} ${locEntry.oudApplication}`
    ) + " " + rawEntry.arabic;
    return haystack.includes(qNorm);
  });

  if (!filtered.length) {
    listEl.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:24px; font-size:0.84rem;">${t(state.lang, "glossaryEmpty")} "${glossaryQuery}".</div>`;
    return;
  }

  filtered.forEach(rawEntry => {
    const entry = localizeGlossaryEntry(state.lang, rawEntry);
    const card = document.createElement("article");
    const isFocused = focusTermId === entry.id;
    card.className = `glossary-item ${isFocused ? "highlighted" : ""}`;
    card.id = `gloss-entry-${entry.id}`;
    card.innerHTML = `
      <div class="glossary-item-top">
        <span class="glossary-term-title">${entry.term}</span>
        <span class="glossary-arabic" lang="ar">${entry.arabic}</span>
      </div>
      <div class="glossary-meta-row">
        <span class="glossary-literal">${t(state.lang, "glossaryTranslationLbl")}: "${entry.literal}"</span>
        <span class="glossary-cat-tag">${entry.categoryLabel}</span>
      </div>
      <p class="glossary-def">${entry.definition}</p>
      <div class="glossary-app-note">🪕 <strong>${t(state.lang, "glossaryAppLbl")}:</strong> ${entry.oudApplication}</div>
    `;
    listEl.appendChild(card);
  });

  if (focusTermId) {
    requestAnimationFrame(() => {
      document.getElementById(`gloss-entry-${focusTermId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
}

function openGlossary(termId) {
  setActivePopover(null);
  const drawer = document.getElementById("glossary-drawer");
  const backdrop = document.getElementById("glossary-backdrop");
  if (!drawer || !backdrop) return;

  if (termId) {
    glossaryCategory = "ALL";
    glossaryQuery = "";
    const searchInput = /** @type {HTMLInputElement | null} */ (document.getElementById("glossary-search-input"));
    if (searchInput) searchInput.value = "";
    document.querySelectorAll(".gloss-cat-btn").forEach(b => {
      b.classList.toggle("selected", /** @type {HTMLElement} */ (b).dataset.cat === "ALL");
    });
  }

  renderGlossaryList(termId);
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  backdrop.classList.add("open");
}

function closeGlossary() {
  const drawer = document.getElementById("glossary-drawer");
  const backdrop = document.getElementById("glossary-backdrop");
  drawer?.classList.remove("open");
  drawer?.setAttribute("aria-hidden", "true");
  backdrop?.classList.remove("open");
}

function renderIqaBeatGrid() {
  const grid = document.getElementById("iqa-beat-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const iqa = DB.iqaat.find(x => x.id === state.iqaId) || DB.iqaat[0];
  iqa.pattern.forEach((step, idx) => {
    const cell = document.createElement("div");
    let strokeClass = "";
    if (step.stroke === "DUM") strokeClass = "stroke-dum";
    else if (step.stroke === "TAK") strokeClass = "stroke-tak";
    else if (step.stroke === "KAH") strokeClass = "stroke-kah";

    cell.className = `iqa-beat-cell ${strokeClass} ${idx === activeIqaBeatIdx ? "active-beat" : ""}`;
    cell.textContent = step.label;
    grid.appendChild(cell);
  });
}

function renderCadenceBar() {
  const bar = document.getElementById("cadence-bar");
  const container = document.getElementById("cadence-steps-container");
  if (!bar || !container) return;

  if (state.mode !== "CADENCE") {
    bar.style.display = "none";
    return;
  }

  bar.style.display = "flex";
  container.innerHTML = "";

  const rawCad = DB.cadences.find(x => x.id === state.entityId) || DB.cadences[0];
  const cad = localizeEntity(state.lang, rawCad);

  cad.steps.forEach((/** @type {any} */ step, /** @type {number} */ idx) => {
    const chordObj = DB.chords.find(c => c.id === step.chord_id) || DB.chords[0];
    const chordRootQ = ((state.rootQ + step.offset_q) % 24 + 24) % 24;
    const rootName = PITCH_CLASSES_24[chordRootQ]?.flat || "C";

    const card = document.createElement("div");
    card.className = `cadence-step-card ${idx === state.cadenceStepIndex ? "active-step" : ""}`;
    card.innerHTML = `
      <div class="step-roman">
        <span>${t(state.lang, "stepWord")} ${idx + 1}: ${step.roman}</span>
        <span>${idx === state.cadenceStepIndex ? t(state.lang, "activeWord") : ""}</span>
      </div>
      <div class="step-chord-name">${rootName}${chordObj.short_symbol ? " " + chordObj.short_symbol : t(state.lang, "majorWord")}</div>
      <div class="step-role">${step.role}</div>
    `;

    card.addEventListener("click", () => {
      clearSequenceTimers();
      selectedStaffOrNeckPitch = null;
      state.cadenceStepIndex = idx;
      refreshAll();
      strumChordVoicing(currentChordVoicingFreqs);
    });

    container.appendChild(card);
  });
}

function renderModulationRadarCard() {
  const radarHeaderEl = document.querySelector('[data-i18n="symmetryCardTitle"]');
  const radarDescEl = document.getElementById("tuning-desc");
  const radarListEl = document.getElementById("tuning-intervals-list");
  const originSlotEl = document.getElementById("mod-origin-slot");
  const modCountEl = document.getElementById("deck-mod-count");
  if (!radarDescEl || !radarListEl) return;

  const isEn = state.lang === "en";
  if (radarHeaderEl) {
    radarHeaderEl.textContent = safeT("symmetryCardTitle", "🧭 Radar de Modulação & Ajnas (Intiqal)", "🧭 Modulation & Ajnas Radar (Intiqal)");
  }

  radarDescEl.textContent = safeT(
    "modRadarSubtitle",
    "Rotas tradicionais sobre o Ghammaz e graus-pivô. Ouça a prévia ou module em 1 clique.",
    "Traditional routes via the Ghammaz and pivot degrees. Preview or modulate in 1 click."
  );
  radarListEl.innerHTML = "";
  if (originSlotEl) originSlotEl.innerHTML = "";

  if (modulationOrigin) {
    const isSameAsOrigin = modulationOrigin.mode === state.mode &&
      modulationOrigin.entityId === state.entityId &&
      modulationOrigin.rootQ === state.rootQ;

    if (!isSameAsOrigin) {
      const originBanner = document.createElement("div");
      originBanner.className = "mod-origin-banner";
      originBanner.innerHTML = `
        <div class="mod-origin-text">
          <span style="color:var(--text-muted); font-size:0.69rem;">${safeT("modOriginPrefix", "Origem anterior:", "Previous origin:")}</span>
          <strong>${modulationOrigin.label}</strong>
        </div>
        <button type="button" class="primary compact-btn" id="btn-return-mod-origin">
          ${safeT("btnReturnOrigin", "↩ Voltar à Origem", "↩ Return to Origin")}
        </button>
      `;
      (originSlotEl || radarListEl).appendChild(originBanner);

      originBanner.querySelector("#btn-return-mod-origin")?.addEventListener("click", () => {
        if (!modulationOrigin) return;
        clearSequenceTimers();
        highlightedSequenceStep = -1;
        selectedStaffOrNeckPitch = null;
        state.mode = modulationOrigin.mode;
        state.entityId = modulationOrigin.entityId;
        state.rootQ = modulationOrigin.rootQ;
        state.anchorAbsQ = modulationOrigin.anchorAbsQ;
        state.octavePathOnly = Boolean(modulationOrigin.anchorAbsQ !== null);
        modulationOrigin = null;
        playPluckedNote(130.81 * Math.pow(2, state.rootQ / 24), 1.4);
        syncControlsWithState();
        refreshAll();
      });
    }
  }

  const routes = getModulationRoutesForCurrentState();
  if (modCountEl) modCountEl.textContent = String(routes.length);

  routes.forEach((route) => {
    const rawTarget = route.targetMode === "MAQAM"
      ? DB.maqamat.find(m => m.id === route.targetId)
      : DB.ajnas.find(j => j.id === route.targetId);
    if (!rawTarget) return;

    const locTarget = localizeEntity(state.lang, rawTarget);
    const targetPitch = PITCH_CLASSES_24[route.absTargetRootQ] || PITCH_CLASSES_24[0];
    const pivotLabel = isEn ? route.pivotEn : route.pivotPt;
    const reasonText = isEn ? route.reasonEn : route.reasonPt;

    const card = document.createElement("div");
    card.className = "mod-route-card";
    card.innerHTML = `
      <div class="mod-route-top">
        <span class="mod-pivot-badge ${route.isGhammaz ? "is-ghammaz-pivot" : ""}">
          ${pivotLabel} → ${targetPitch.flat} (${targetPitch.arabic})
        </span>
      </div>
      <div class="mod-target-title">
        ${locTarget.name} <span style="color:var(--accent); font-weight:700;">${isEn ? "in" : "em"} ${targetPitch.flat}</span>
      </div>
      <div class="mod-route-desc">${reasonText}</div>
      <div class="mod-route-actions">
        <button type="button" class="ghost-btn btn-preview-mod">
          ${safeT("btnPreviewMod", "🔊 Ouvir", "🔊 Preview")}
        </button>
        <button type="button" class="plum-btn btn-apply-mod">
          ${safeT("btnApplyMod", "⚡ Modular", "⚡ Modulate")}
        </button>
      </div>
    `;

    card.querySelector(".btn-preview-mod")?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      clearSequenceTimers();
      const targetIntervals = route.targetMode === "MAQAM"
        ? /** @type {any} */ (rawTarget).intervals_asc
        : /** @type {any} */ (rawTarget).intervals_q;
      /** @type {Record<number, number>} */
      const centsMap = {};
      if (route.targetMode === "MAQAM" && /** @type {any} */ (rawTarget).cents_dev) {
        Object.assign(centsMap, /** @type {any} */ (rawTarget).cents_dev);
      } else if (Array.isArray(/** @type {any} */ (rawTarget).cents_dev)) {
        targetIntervals.forEach((/** @type {number} */ intQ, /** @type {number} */ idx) => {
          centsMap[intQ] = /** @type {any} */ (rawTarget).cents_dev[idx] || 0;
        });
      }
      playScaleSequence(route.absTargetRootQ, targetIntervals, centsMap);
    });

    card.querySelector(".btn-apply-mod")?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      selectedStaffOrNeckPitch = null;

      if (!modulationOrigin) {
        const curStruct = getActiveStructure(state);
        const curLoc = localizeEntity(state.lang, curStruct.entity);
        const curRootName = PITCH_CLASSES_24[((state.rootQ % 24) + 24) % 24]?.flat || "C";
        modulationOrigin = {
          mode: state.mode,
          entityId: state.entityId,
          rootQ: state.rootQ,
          anchorAbsQ: state.anchorAbsQ,
          label: `${curLoc.name} (${curRootName})`
        };
      }

      state.mode = route.targetMode;
      state.entityId = route.targetId;
      state.rootQ = route.absTargetRootQ;
      state.anchorAbsQ = null;
      state.octavePathOnly = false;

      playPluckedNote(130.81 * Math.pow(2, state.rootQ / 24), 1.4);
      syncControlsWithState();
      refreshAll();
    });

    radarListEl.appendChild(card);
  });
}

function updateInfoPanel() {
  const activeStruct = getActiveStructure(state);
  const entity = localizeEntity(state.lang, activeStruct.entity);
  const safeRootQ = ((state.rootQ % 24) + 24) % 24;
  const safeEffRootQ = ((activeStruct.effectiveRootQ % 24) + 24) % 24;
  const globalRootName = PITCH_CLASSES_24[safeRootQ]?.flat || "C";
  const effectiveRootName = PITCH_CLASSES_24[safeEffRootQ]?.flat || "C";

  const titleEl = document.getElementById("info-title");
  const descEl = document.getElementById("info-desc");
  const pillsEl = document.getElementById("info-pills");
  if (!titleEl || !descEl || !pillsEl) return;

  titleEl.textContent = state.mode === "CADENCE"
    ? `${entity.name} — ${t(state.lang, "qararIn")} ${globalRootName}`
    : `${entity.name} — ${t(state.lang, "rootIn")} ${effectiveRootName}`;
  descEl.textContent = entity.description;

  pillsEl.innerHTML = "";
  const addPill = (/** @type {string} */ label, /** @type {string} */ val) => {
    const div = document.createElement("div");
    div.className = "meta-pill";
    div.innerHTML = `<strong>${label}:</strong> ${val}`;
    pillsEl.appendChild(div);
  };

  if (state.mode === "CADENCE" && activeStruct.chordObj && activeStruct.stepObj) {
    const locChord = localizeEntity(state.lang, activeStruct.chordObj);
    const stepRole = entity.steps?.[state.cadenceStepIndex]?.role || activeStruct.stepObj.role;
    addPill(t(state.lang, "pillActiveChord"), `${effectiveRootName} (${locChord.name})`);
    addPill(t(state.lang, "pillQaflaRole"), `${activeStruct.stepObj.roman} — ${stepRole}`);
  }

  const noteNamesList = activeStruct.intervals.map(intQ => PITCH_CLASSES_24[((safeEffRootQ + intQ) % 24 + 24) % 24]?.flat || "");
  addPill(t(state.lang, "pillNotes"), noteNamesList.join(" – "));
  addPill(t(state.lang, "pillDegrees"), activeStruct.degrees.join(" · "));

  if (state.mode === "MAQAM") {
    addPill(t(state.lang, "pillLowerJins"), entity.lower_jins);
    addPill(t(state.lang, "pillUpperJins"), state.direction === "ASC" ? entity.upper_jins_asc : entity.upper_jins_desc);
  }

  const sayrBox = document.getElementById("sayr-detail-box");
  if (sayrBox) {
    if (state.mode === "MAQAM" && entity.sayr_phrases?.[state.sayrPhraseIndex]) {
      const phrase = entity.sayr_phrases[state.sayrPhraseIndex];
      const phraseNotes = phrase.steps.map((/** @type {any} */ s) => PITCH_CLASSES_24[((safeEffRootQ + s.interval_q) % 24 + 24) % 24]?.flat || "").join(" → ");
      sayrBox.style.display = "flex";
      sayrBox.innerHTML = `
        <div>
          <strong style="color:var(--plum);">✨ ${phrase.title}</strong>
          <div style="margin-top:3px; color:var(--text-muted);">${phrase.summary}</div>
          <div style="margin-top:4px; font-size:0.76rem; color:var(--accent);"><strong>${t(state.lang, "pillNotes")}:</strong> ${phraseNotes}</div>
        </div>
        <button type="button" id="btn-inline-taqsim" class="plum-btn compact-btn">${t(state.lang, "btnPlayPhraseInline")}</button>
      `;
      document.getElementById("btn-inline-taqsim")?.addEventListener("click", handlePlayTaqsim);
    } else {
      sayrBox.style.display = "none";
    }
  }

  const bridgeContainer = document.getElementById("bridge-container");
  if (bridgeContainer) {
    bridgeContainer.innerHTML = "";
    if (state.mode === "MAQAM" && entity.linked_cadence) {
      const box = document.createElement("div");
      box.className = "bridge-box";
      box.innerHTML = `
        <span>${t(state.lang, "bridgeQaflaPrefix")} <strong>${entity.name}</strong></span>
        <button type="button" id="btn-jump-cadence" class="primary compact-btn">${t(state.lang, "btnOpenQafla")}</button>
      `;
      bridgeContainer.appendChild(box);
      document.getElementById("btn-jump-cadence")?.addEventListener("click", () => {
        clearSequenceTimers();
        highlightedSequenceStep = -1;
        selectedStaffOrNeckPitch = null;
        state.mode = "CADENCE";
        state.entityId = entity.linked_cadence;
        state.cadenceStepIndex = 0;
        if (state.shapeMode === "FULL_NECK") {
          state.shapeMode = "OPEN_FIRST_POS";
        }
        syncControlsWithState();
        refreshAll();
      });
    }

    if ((state.mode === "SCALE" || state.mode === "CHORD" || state.mode === "CADENCE") && entity.bridge_maqam) {
      const box = document.createElement("div");
      box.className = "bridge-box";
      box.innerHTML = `
        <span>${t(state.lang, "bridgeMatrixPrefix")} <strong>${entity.bridge_text}</strong></span>
        <button type="button" id="btn-jump-maqam" class="ghost-btn compact-btn">${t(state.lang, "btnSeeMaqam")}</button>
      `;
      bridgeContainer.appendChild(box);
      document.getElementById("btn-jump-maqam")?.addEventListener("click", () => {
        clearSequenceTimers();
        selectedStaffOrNeckPitch = null;
        state.mode = "MAQAM";
        state.entityId = entity.bridge_maqam;
        syncControlsWithState();
        refreshAll();
      });
    }
  }

  renderModulationRadarCard();
}

function handlePrimaryAudioAction() {
  clearSequenceTimers();
  highlightedSequenceStep = -1;

  if (state.octavePathOnly && hasValidAnchor()) {
    handlePlayAnchoredOctavePath();
    return;
  }

  if (state.mode === "CADENCE") {
    const cad = DB.cadences.find(x => x.id === state.entityId) || DB.cadences[0];
    scheduleCadenceSequence(cad.steps.length, (stepIdx) => {
      state.cadenceStepIndex = stepIdx;
      refreshAll();
      strumChordVoicing(currentChordVoicingFreqs);
    });
    return;
  }

  if (state.mode === "CHORD" && currentChordVoicingFreqs.length > 0) {
    strumChordVoicing(currentChordVoicingFreqs);
    return;
  }

  const activeStruct = getActiveStructure(state);
  playScaleSequence(activeStruct.effectiveRootQ, activeStruct.intervals, activeStruct.centsMap);
}

function handlePlayTaqsim() {
  if (state.mode !== "MAQAM") return;
  const activeStruct = getActiveStructure(state);
  const entity = /** @type {any} */ (activeStruct.entity);
  const phrase = entity.sayr_phrases?.[state.sayrPhraseIndex];
  if (!phrase) return;

  state.octavePathOnly = false;
  state.showSayr = true;
  state.staffMode = "SAYR";
  syncControlsWithState();

  playTaqsimPhrase(activeStruct.effectiveRootQ, phrase.steps, activeStruct.centsMap, (stepIdx) => {
    highlightedSequenceStep = stepIdx;
    refreshAll();
  });
}

function restartIqaIfPlaying() {
  if (!isIqaPlaying) {
    renderIqaBeatGrid();
    return;
  }
  const iqa = DB.iqaat.find(x => x.id === state.iqaId) || DB.iqaat[0];
  startIqaEngine(iqa, state.bpm, (beatIdx) => {
    activeIqaBeatIdx = beatIdx;
    renderIqaBeatGrid();
  });
}

function populateAllLocalizedSelects() {
  const selTuning = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-tuning"));
  if (selTuning) {
    selTuning.innerHTML = "";
    DB.tunings.forEach(rawT => {
      const trT = localizeEntity(state.lang, rawT);
      const opt = document.createElement("option");
      opt.value = rawT.id;
      opt.textContent = trT.name;
      selTuning.appendChild(opt);
    });
    selTuning.value = state.tuningId;
  }

  const selRoot = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-root"));
  if (selRoot) {
    selRoot.innerHTML = "";
    const qLbl = t(state.lang, "quarterToneLabel");
    PITCH_CLASSES_24.forEach(pc => {
      const opt = document.createElement("option");
      opt.value = String(pc.q);
      opt.textContent = `${pc.flat} ${pc.micro ? `(${qLbl} - ${pc.arabic})` : `(${pc.arabic})`}`;
      selRoot.appendChild(opt);
    });
    selRoot.value = String(state.rootQ);
  }

  const selIqa = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-iqa"));
  if (selIqa) {
    selIqa.innerHTML = "";
    DB.iqaat.forEach(rawIq => {
      const trIq = localizeEntity(state.lang, rawIq);
      const opt = document.createElement("option");
      opt.value = rawIq.id;
      opt.textContent = trIq.name;
      selIqa.appendChild(opt);
    });
    selIqa.value = state.iqaId;
  }

  populateEntitySelect();
}

function populateEntitySelect() {
  const sel = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-entity"));
  if (!sel) return;
  sel.innerHTML = "";

  /** @type {any[]} */
  let list = DB.maqamat;
  if (state.mode === "JINS") list = DB.ajnas;
  else if (state.mode === "SCALE") list = DB.scales;
  else if (state.mode === "CHORD") list = DB.chords;
  else if (state.mode === "CADENCE") list = DB.cadences;

  list.forEach(rawItem => {
    const item = localizeEntity(state.lang, rawItem);
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = item.name;
    sel.appendChild(opt);
  });

  if (!list.some(x => x.id === state.entityId)) {
    state.entityId = list[0].id;
  }
  sel.value = state.entityId;
}

function syncSelectionActionButtons() {
  const ribbon = document.getElementById("stage-selection-ribbon");
  const ribbonStatus = document.getElementById("selection-ribbon-status");
  const btnInlineStaff = document.getElementById("btn-inline-toggle-staff");
  const btnDockSetTonic = document.getElementById("btn-dock-set-tonic");
  const btnDockClear = document.getElementById("btn-dock-clear-note");
  const btnClearFilter = document.getElementById("btn-clear-staff-filter");
  const btnSetRoot = document.getElementById("btn-set-root-from-selection");

  const pcQ = resolvePitchClassQ(selectedStaffOrNeckPitch);
  const hasSelection = selectedStaffOrNeckPitch !== null && pcQ !== null && Boolean(PITCH_CLASSES_24[pcQ]);

  if (btnInlineStaff) {
    btnInlineStaff.textContent = state.showStaff
      ? (state.lang === "en" ? "🎼 Hide Staff" : "🎼 Ocultar Pauta")
      : (state.lang === "en" ? "🎼 Show Staff" : "🎼 Exibir Pauta");
  }

  if (hasSelection && pcQ !== null) {
    const pc = PITCH_CLASSES_24[pcQ];
    const labelText = `${safeT("btnSetRootFromNote", "🎯 Definir Tônica", "🎯 Set Tonic")}: ${pc.flat} (${pc.arabic})`;

    if (btnClearFilter) btnClearFilter.style.display = "inline-flex";
    if (btnSetRoot) {
      btnSetRoot.style.display = "inline-flex";
      btnSetRoot.textContent = labelText;
    }
    if (btnDockSetTonic) {
      btnDockSetTonic.style.display = "inline-flex";
      btnDockSetTonic.textContent = labelText;
    }
    if (btnDockClear) btnDockClear.style.display = "inline-flex";
    if (ribbonStatus) {
      ribbonStatus.textContent = `${pc.flat} (${pc.arabic})`;
    }
  } else {
    if (btnClearFilter) btnClearFilter.style.display = "none";
    if (btnSetRoot) btnSetRoot.style.display = "none";
    if (btnDockSetTonic) btnDockSetTonic.style.display = "none";
    if (btnDockClear) btnDockClear.style.display = "none";
    if (ribbonStatus) ribbonStatus.textContent = "";
  }

  if (ribbon) {
    const showRibbonDesktop = !state.showStaff && hasSelection;
    ribbon.classList.toggle("visible", showRibbonDesktop);
  }

  const octBar = document.getElementById("octave-path-bar");
  if (octBar) {
    if (hasValidAnchor() && typeof state.anchorAbsQ === "number") {
      octBar.style.display = "flex";
      const pcIdx = ((state.anchorAbsQ % 24) + 24) % 24;
      const pc = PITCH_CLASSES_24[pcIdx] || PITCH_CLASSES_24[0];
      const octNum = Math.floor(state.anchorAbsQ / 24) + 2;
      const lbl = document.getElementById("octave-bar-label");
      const titlePrefix = safeT("octaveBarTitle", "📍 Caminho da Tônica:", "📍 Tonic Path:");
      if (lbl) lbl.textContent = `${titlePrefix} ${pc.flat}${octNum} (${pc.arabic})`;

      const btnAll = document.getElementById("btn-oct-mode-all");
      const btnSingle = document.getElementById("btn-oct-mode-single");
      const btnAsc = document.getElementById("btn-oct-dir-asc");
      const btnDesc = document.getElementById("btn-oct-dir-desc");
      const btnPlayOct = document.getElementById("btn-play-octave-path");

      if (btnAll) {
        btnAll.textContent = safeT("btnOctaveAll", "🌐 Todas as Oitavas", "🌐 All Octaves");
        btnAll.classList.toggle("selected", !state.octavePathOnly);
      }
      if (btnSingle) {
        btnSingle.textContent = safeT("btnOctaveSingle", "🎯 Caminho 1 Oitava", "🎯 1-Octave Path");
        btnSingle.classList.toggle("selected", state.octavePathOnly);
      }
      if (btnAsc) {
        btnAsc.textContent = safeT("btnOctaveAsc", "↑ Ascendente (+8ª)", "↑ Ascending (+8ve)");
        btnAsc.classList.toggle("selected", state.octavePathDir === "ASC");
      }
      if (btnDesc) {
        btnDesc.textContent = safeT("btnOctaveDesc", "↓ Descendente (-8ª)", "↓ Descending (-8ve)");
        btnDesc.classList.toggle("selected", state.octavePathDir === "DESC");
      }
      if (btnPlayOct) {
        btnPlayOct.textContent = safeT("btnPlayOctavePath", "▶ Ouvir Caminho", "▶ Play Path");
      }
    } else {
      octBar.style.display = "none";
    }
  }
}

function syncControlsWithState() {
  applyStaticTranslations(state.lang);
  populateAllLocalizedSelects();

  if (isMobileViewport()) {
    state.orientation = "VERTICAL";
  }

  document.documentElement.setAttribute("data-theme", state.theme);
  document.body.setAttribute("data-theme", state.theme);
  document.body.setAttribute("data-tradition", state.tradition);
  document.body.setAttribute("data-orientation", state.orientation);
  document.body.setAttribute("data-zen", isZenMode ? "true" : "false");
  document.body.setAttribute("data-sidebar", isSidebarCollapsed ? "collapsed" : "expanded");

  // Sincroniza estado visual das abas do Deck Horizontal
  document.querySelectorAll(".deck-tab-btn").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    const isAct = el.dataset.deckTab === activeDeckTab;
    el.classList.toggle("active", isAct);
    el.setAttribute("aria-selected", isAct ? "true" : "false");
  });
  document.querySelectorAll(".deck-pane").forEach(pane => {
    const el = /** @type {HTMLElement} */ (pane);
    el.classList.toggle("active-pane", el.dataset.deckPane === activeDeckTab);
  });

  const selTrad = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-tradition"));
  if (selTrad) selTrad.value = state.tradition;

  const selShape = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-shape"));
  if (selShape) selShape.value = state.shapeMode;

  const selLabel = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-label"));
  if (selLabel) selLabel.value = state.labelMode;

  const btnPosMap = document.getElementById("btn-pos-map");
  if (btnPosMap) {
    btnPosMap.textContent = safeT("btnPosMap", "📐 Regiões & Pivôs", "📐 Regions & Pivots");
    btnPosMap.classList.toggle("selected", state.showPositionsMap);
  }

  const legendPivot = document.getElementById("legend-pivot-item");
  if (legendPivot) {
    legendPivot.style.display = state.showPositionsMap ? "inline-flex" : "none";
  }

  document.getElementById("btn-guide-semi")?.classList.toggle("selected", state.showSemiGuides);
  document.getElementById("btn-guide-micro")?.classList.toggle("selected", state.showMicroGuides);
  document.getElementById("btn-ghost-notes")?.classList.toggle("selected", state.showGhostNotes);
  document.getElementById("btn-toggle-sayr")?.classList.toggle("selected", state.showSayr);
  document.getElementById("btn-dir-asc")?.classList.toggle("selected", state.direction === "ASC");
  document.getElementById("btn-dir-desc")?.classList.toggle("selected", state.direction === "DESC");
  document.getElementById("btn-chord-voicing")?.classList.toggle("selected", state.chordVoicingOnly);
  document.getElementById("btn-chord-all")?.classList.toggle("selected", !state.chordVoicingOnly);

  const btnTheme = document.getElementById("btn-theme");
  if (btnTheme) {
    btnTheme.textContent = state.theme === "light"
      ? safeT("btnThemeDark", "🌙 Escuro", "🌙 Dark")
      : safeT("btnThemeLight", "☀️ Claro", "☀️ Light");
  }

  const btnZen = document.getElementById("btn-zen-mode");
  if (btnZen) {
    btnZen.textContent = safeT("btnZenEnter", "🪷 Imersivo", "🪷 Zen Stage");
    btnZen.classList.toggle("selected", isZenMode);
  }

  const btnSidebar = document.getElementById("btn-toggle-sidebar");
  if (btnSidebar) {
    if (isSidebarCollapsed) {
      btnSidebar.textContent = safeT("btnShowSidebar", "◧ Exibir Teoria", "◧ Show Theory");
      btnSidebar.classList.remove("selected");
    } else {
      btnSidebar.textContent = safeT("btnHideSidebar", "◧ Ocultar Teoria", "◧ Hide Theory");
      btnSidebar.classList.add("selected");
    }
  }

  const btnOrientation = document.getElementById("btn-orientation");
  if (btnOrientation) {
    btnOrientation.textContent = state.orientation === "VERTICAL"
      ? t(state.lang, "btnOrientVert")
      : t(state.lang, "btnOrientHoriz");
  }

  const btnHand = document.getElementById("btn-hand");
  if (btnHand) {
    btnHand.textContent = state.leftHanded
      ? t(state.lang, "btnHandLeft")
      : t(state.lang, "btnHandRight");
  }

  const btnLang = document.getElementById("btn-lang");
  if (btnLang) {
    btnLang.textContent = state.lang === "en" ? "🌐 EN | PT" : "🌐 PT | EN";
  }

  const btnToggleIqa = document.getElementById("btn-toggle-iqa");
  if (btnToggleIqa) {
    btnToggleIqa.textContent = isIqaPlaying
      ? t(state.lang, "btnStopIqa")
      : t(state.lang, "btnStartIqa");
  }

  const staffBox = document.getElementById("staff-stage-box");
  if (staffBox) staffBox.style.display = state.showStaff ? "flex" : "none";
  document.getElementById("btn-toggle-staff")?.classList.toggle("selected", state.showStaff);

  const btnHideStaffInline = document.getElementById("btn-hide-staff-inline");
  if (btnHideStaffInline) {
    btnHideStaffInline.textContent = state.lang === "en" ? "— Hide Staff" : "— Ocultar Pauta";
  }

  const btnStaffScale = document.getElementById("btn-staff-mode-scale");
  const btnStaffSayr = document.getElementById("btn-staff-mode-sayr");
  if (btnStaffSayr) {
    btnStaffSayr.style.display = state.mode === "MAQAM" ? "inline-flex" : "none";
    btnStaffSayr.classList.toggle("selected", state.mode === "MAQAM" && state.staffMode === "SAYR");
  }
  if (btnStaffScale) {
    btnStaffScale.classList.toggle("selected", state.mode !== "MAQAM" || state.staffMode === "SCALE");
  }

  syncSelectionActionButtons();

  document.querySelectorAll(".tab-btn").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    el.classList.toggle("active", el.dataset.mode === state.mode);
  });

  const isChordLike = state.mode === "CHORD" || state.mode === "CADENCE";
  const maqamSub = document.getElementById("maqam-subcontrols");
  const sayrBar = document.getElementById("sayr-phrase-bar");
  const jinsFilter = document.getElementById("jins-filter-group");
  const chordSub = document.getElementById("chord-subcontrols");
  const boxSlider = document.getElementById("box-slider-group");

  if (maqamSub) maqamSub.style.display = state.mode === "MAQAM" ? "flex" : "none";
  if (sayrBar) sayrBar.style.display = state.mode === "MAQAM" ? "flex" : "none";
  if (jinsFilter) jinsFilter.style.display = state.mode === "MAQAM" ? "flex" : "none";
  if (chordSub) chordSub.style.display = isChordLike ? "flex" : "none";
  if (boxSlider) boxSlider.style.display = state.shapeMode === "CLOSED_BOX" ? "flex" : "none";

  document.querySelectorAll(".sayr-phrase-btn").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    el.classList.toggle("selected", Number(el.dataset.phrase) === state.sayrPhraseIndex);
  });

  document.querySelectorAll(".jins-filter").forEach(btn => {
    const el = /** @type {HTMLElement} */ (btn);
    el.classList.toggle("selected", el.dataset.filter === state.jinsFilter);
  });

  const btnPlay = document.getElementById("btn-play-scale");
  const btnTaqsim = document.getElementById("btn-play-taqsim");
  const btnArp = document.getElementById("btn-arp-chord");
  if (btnPlay && btnArp && btnTaqsim) {
    btnTaqsim.style.display = state.mode === "MAQAM" ? "inline-flex" : "none";
    if (state.mode === "CADENCE") {
      btnPlay.textContent = t(state.lang, "btnPlayQafla");
      btnArp.style.display = "inline-flex";
    } else if (state.mode === "CHORD") {
      btnPlay.textContent = t(state.lang, "btnPlayChord");
      btnArp.style.display = "inline-flex";
    } else {
      btnPlay.textContent = t(state.lang, "btnPlayScale");
      btnArp.style.display = "none";
    }
  }

  syncCommandBarSummaries();
  renderGlossaryList();
}

function refreshAll() {
  if (isMobileViewport()) {
    state.orientation = "VERTICAL";
    document.body.setAttribute("data-orientation", "VERTICAL");
  }

  renderCadenceBar();
  renderIqaBeatGrid();
  syncSelectionActionButtons();

  const octavePathNodes = hasValidAnchor() ? computeAnchoredOctavePath(state) : [];

  if (state.showStaff) {
    renderMusicalStaffSVG(
      state,
      selectedStaffOrNeckPitch,
      highlightedSequenceStep,
      (staffSelection) => {
        selectedStaffOrNeckPitch = staffSelection;
        refreshAll();
      },
      octavePathNodes
    );
  }

  currentChordVoicingFreqs = renderOudNeckSVG(
    state,
    handlePrimaryAudioAction,
    highlightedSequenceStep,
    selectedStaffOrNeckPitch,
    (neckNoteInfo) => {
      selectedStaffOrNeckPitch = neckNoteInfo;
      if (isMobileViewport()) {
        showTouchLoupeFeedback(neckNoteInfo);
      }
      if (neckNoteInfo.makeRoot) {
        applySelectedPitchAsRoot(neckNoteInfo);
      } else {
        refreshAll();
      }
    },
    octavePathNodes
  );

  updateInfoPanel();
  syncCommandBarSummaries();
  const droneBtn = document.getElementById("btn-drone");
  if (droneBtn) updateDronePitch(state.droneActive, state.rootQ, droneBtn);
  syncStateToUrl(state);
}

function initApp() {
  if (isMobileViewport()) {
    state.orientation = "VERTICAL";
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", state.theme === "light" ? "#f4eee4" : "#100d0b");
  }

  let wasMobile = isMobileViewport();
  window.addEventListener("resize", () => {
    const nowMobile = isMobileViewport();
    if (nowMobile && !wasMobile) {
      setActivePopover(null);
      state.orientation = "VERTICAL";
      if (!userOverrodeSidebar) isSidebarCollapsed = true;
      syncControlsWithState();
      refreshAll();
    } else if (!nowMobile && wasMobile) {
      setActivePopover(null);
      state.orientation = desktopPreferredOrientation;
      if (!userOverrodeSidebar) isSidebarCollapsed = false;
      syncControlsWithState();
      refreshAll();
    }
    wasMobile = nowMobile;
  });

  // Delegação de eventos globais para Barra Única, Popovers, Deck, Zen e Mobile Dock
  document.addEventListener("click", (e) => {
    const rawTarget = e.target;
    const target = rawTarget instanceof Element ? rawTarget : (rawTarget && /** @type {Node} */ (rawTarget).parentElement);
    if (!target) return;

    const triggerBtn = /** @type {HTMLElement | null} */ (target.closest(".cmd-trigger"));
    if (triggerBtn) {
      e.preventDefault();
      const idx = Number(triggerBtn.dataset.panel);
      setActivePopover(activePopoverIdx === idx ? null : idx);
      return;
    }

    if (target.closest("#popover-backdrop, .popover-close-btn, .btn-close-popover")) {
      e.preventDefault();
      setActivePopover(null);
      return;
    }

    if (target.closest("#btn-theme, #btn-zen-theme")) {
      e.preventDefault();
      toggleAppTheme();
      return;
    }

    if (target.closest("#btn-zen-mode")) {
      e.preventDefault();
      toggleZenMode();
      return;
    }

    if (target.closest("#btn-zen-exit")) {
      e.preventDefault();
      toggleZenMode(false);
      return;
    }

    if (target.closest("#btn-zen-play, #btn-mob-play")) {
      e.preventDefault();
      handlePrimaryAudioAction();
      return;
    }

    if (target.closest("#btn-zen-taqsim, #btn-mob-taqsim")) {
      e.preventDefault();
      handlePlayTaqsim();
      return;
    }

    if (target.closest("#btn-zen-drone, #btn-mob-drone")) {
      e.preventDefault();
      const droneBtn = document.getElementById("btn-drone");
      if (droneBtn) state.droneActive = toggleDroneAudio(state.droneActive, state.rootQ, droneBtn);
      syncCommandBarSummaries();
      return;
    }

    if (target.closest("#btn-zen-iqa, #btn-mob-iqa")) {
      e.preventDefault();
      toggleIqaPlayback();
      return;
    }

    if (target.closest("#btn-mob-theory")) {
      e.preventDefault();
      setActivePopover(null);
      toggleSidebarCollapsed();
      if (!isSidebarCollapsed) {
        requestAnimationFrame(() => {
          document.getElementById("studio-deck")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      return;
    }

    const deckTabBtn = /** @type {HTMLElement | null} */ (target.closest(".deck-tab-btn"));
    if (deckTabBtn) {
      e.preventDefault();
      const tab = deckTabBtn.dataset.deckTab === "modulation" ? "modulation" : "theory";
      setActiveDeckTab(tab);
      return;
    }

    if (target.closest("#btn-deck-collapse") || target.closest("#btn-toggle-sidebar")) {
      e.preventDefault();
      toggleSidebarCollapsed();
      return;
    }

    if (target.closest("#btn-hide-staff-inline, #btn-inline-toggle-staff")) {
      e.preventDefault();
      state.showStaff = !state.showStaff;
      syncControlsWithState();
      refreshAll();
      return;
    }

    if (target.closest("#btn-pos-map")) {
      e.preventDefault();
      state.showPositionsMap = !state.showPositionsMap;
      syncControlsWithState();
      refreshAll();
      return;
    }

    if (target.closest("#btn-set-root-from-selection, #btn-dock-set-tonic")) {
      e.preventDefault();
      applySelectedPitchAsRoot(selectedStaffOrNeckPitch);
      return;
    }

    if (target.closest("#btn-dock-clear-note")) {
      e.preventDefault();
      selectedStaffOrNeckPitch = null;
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-mode-all")) {
      e.preventDefault();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.octavePathOnly = false;
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-mode-single")) {
      e.preventDefault();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.octavePathOnly = true;
      state.staffMode = "SCALE";
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-dir-asc")) {
      e.preventDefault();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.octavePathDir = "ASC";
      state.octavePathOnly = true;
      refreshAll();
      return;
    }

    if (target.closest("#btn-oct-dir-desc")) {
      e.preventDefault();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.octavePathDir = "DESC";
      state.octavePathOnly = true;
      refreshAll();
      return;
    }

    if (target.closest("#btn-play-octave-path")) {
      e.preventDefault();
      handlePlayAnchoredOctavePath();
      return;
    }

    if (target.closest("#btn-close-octave-bar")) {
      e.preventDefault();
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      state.anchorAbsQ = null;
      state.octavePathOnly = false;
      refreshAll();
    }
  });

  // Listeners diretos dos controles
  const selTradition = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-tradition"));
  selTradition?.addEventListener("change", (e) => {
    state.tradition = /** @type {HTMLSelectElement} */ (e.target).value;
    document.body.setAttribute("data-tradition", state.tradition);
    refreshAll();
  });

  document.getElementById("btn-lang")?.addEventListener("click", () => {
    state.lang = state.lang === "pt" ? "en" : "pt";
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-orientation")?.addEventListener("click", () => {
    if (isMobileViewport()) return;
    desktopPreferredOrientation = state.orientation === "HORIZONTAL" ? "VERTICAL" : "HORIZONTAL";
    state.orientation = desktopPreferredOrientation;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-toggle-staff")?.addEventListener("click", () => {
    state.showStaff = !state.showStaff;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-staff-mode-scale")?.addEventListener("click", () => {
    state.staffMode = "SCALE";
    selectedStaffOrNeckPitch = null;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-staff-mode-sayr")?.addEventListener("click", () => {
    state.staffMode = "SAYR";
    state.octavePathOnly = false;
    selectedStaffOrNeckPitch = null;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-clear-staff-filter")?.addEventListener("click", () => {
    selectedStaffOrNeckPitch = null;
    refreshAll();
  });

  document.getElementById("select-tuning")?.addEventListener("change", (e) => {
    state.tuningId = /** @type {HTMLSelectElement} */ (e.target).value;
    selectedStaffOrNeckPitch = null;
    refreshAll();
  });

  const selRoot = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-root"));
  selRoot?.addEventListener("change", (e) => {
    clearSequenceTimers();
    highlightedSequenceStep = -1;
    selectedStaffOrNeckPitch = null;
    modulationOrigin = null;
    state.anchorAbsQ = null;
    state.octavePathOnly = false;
    state.rootQ = parseInt(/** @type {HTMLSelectElement} */ (e.target).value, 10) || 0;
    refreshAll();
  });

  document.getElementById("btn-trad-root")?.addEventListener("click", (e) => {
    e.preventDefault();
    clearSequenceTimers();
    highlightedSequenceStep = -1;
    selectedStaffOrNeckPitch = null;
    modulationOrigin = null;
    state.anchorAbsQ = null;
    state.octavePathOnly = false;
    const active = /** @type {any} */ (getActiveStructure(state).entity);
    if (active.traditional_root_q !== undefined) {
      state.rootQ = active.traditional_root_q;
      if (selRoot) selRoot.value = String(state.rootQ);
      refreshAll();
    }
  });

  const selIqa = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-iqa"));
  const sliderBpm = /** @type {HTMLInputElement | null} */ (document.getElementById("slider-bpm"));
  const labelBpm = document.getElementById("label-bpm");
  if (sliderBpm) sliderBpm.value = String(state.bpm);
  if (labelBpm) labelBpm.textContent = String(state.bpm);

  selIqa?.addEventListener("change", (e) => {
    state.iqaId = /** @type {HTMLSelectElement} */ (e.target).value;
    const found = DB.iqaat.find(x => x.id === state.iqaId);
    if (found) {
      state.bpm = found.default_bpm;
      if (sliderBpm) sliderBpm.value = String(state.bpm);
      if (labelBpm) labelBpm.textContent = String(state.bpm);
    }
    activeIqaBeatIdx = -1;
    restartIqaIfPlaying();
    syncCommandBarSummaries();
    syncStateToUrl(state);
  });

  sliderBpm?.addEventListener("input", (e) => {
    state.bpm = parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10);
    if (labelBpm) labelBpm.textContent = String(state.bpm);
    restartIqaIfPlaying();
    syncCommandBarSummaries();
    syncStateToUrl(state);
  });

  document.getElementById("btn-toggle-iqa")?.addEventListener("click", () => {
    toggleIqaPlayback();
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      selectedStaffOrNeckPitch = null;
      modulationOrigin = null;
      state.mode = /** @type {any} */ (/** @type {HTMLElement} */ (btn).dataset.mode);
      state.cadenceStepIndex = 0;
      if ((state.mode === "CHORD" || state.mode === "CADENCE") && state.shapeMode === "FULL_NECK") {
        state.shapeMode = "OPEN_FIRST_POS";
      }
      syncControlsWithState();
      if (!hasValidAnchor()) {
        const active = /** @type {any} */ (getActiveStructure(state).entity);
        if (active.traditional_root_q !== undefined) {
          state.rootQ = active.traditional_root_q;
          if (selRoot) selRoot.value = String(state.rootQ);
        }
      }
      refreshAll();
    });
  });

  document.getElementById("select-entity")?.addEventListener("change", (e) => {
    clearSequenceTimers();
    highlightedSequenceStep = -1;
    selectedStaffOrNeckPitch = null;
    modulationOrigin = null;
    state.entityId = /** @type {HTMLSelectElement} */ (e.target).value;
    state.cadenceStepIndex = 0;
    if (!hasValidAnchor()) {
      const active = /** @type {any} */ (getActiveStructure(state).entity);
      if (active.traditional_root_q !== undefined) {
        state.rootQ = active.traditional_root_q;
        if (selRoot) selRoot.value = String(state.rootQ);
      }
    }
    refreshAll();
  });

  document.getElementById("btn-toggle-sayr")?.addEventListener("click", () => {
    state.showSayr = !state.showSayr;
    syncControlsWithState();
    refreshAll();
  });

  document.querySelectorAll(".sayr-phrase-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      clearSequenceTimers();
      highlightedSequenceStep = -1;
      selectedStaffOrNeckPitch = null;
      state.octavePathOnly = false;
      state.sayrPhraseIndex = Number(/** @type {HTMLElement} */ (btn).dataset.phrase);
      state.showSayr = true;
      state.staffMode = "SAYR";
      syncControlsWithState();
      refreshAll();
    });
  });

  document.getElementById("btn-chord-voicing")?.addEventListener("click", () => {
    state.chordVoicingOnly = true;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-chord-all")?.addEventListener("click", () => {
    state.chordVoicingOnly = false;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-dir-asc")?.addEventListener("click", () => {
    state.direction = "ASC";
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-dir-desc")?.addEventListener("click", () => {
    state.direction = "DESC";
    syncControlsWithState();
    refreshAll();
  });

  const selShape = /** @type {HTMLSelectElement | null} */ (document.getElementById("select-shape"));
  selShape?.addEventListener("change", (e) => {
    state.shapeMode = /** @type {any} */ (/** @type {HTMLSelectElement} */ (e.target).value);
    if (
      state.shapeMode === "CLOSED_BOX" ||
      state.shapeMode === "POS_SECOND" ||
      state.shapeMode === "POS_THIRD_BODY"
    ) {
      state.labelMode = "FINGER";
    }
    syncControlsWithState();
    refreshAll();
  });

  const sliderBox = /** @type {HTMLInputElement | null} */ (document.getElementById("slider-box"));
  const labelBoxPos = document.getElementById("label-box-pos");
  if (sliderBox) sliderBox.value = String(state.boxAnchorQ);
  if (labelBoxPos) {
    const semiApprox = (state.boxAnchorQ / 2).toFixed(1).replace(".0", "");
    labelBoxPos.textContent = `S${semiApprox} (q=${state.boxAnchorQ})`;
  }
  sliderBox?.addEventListener("input", (e) => {
    state.boxAnchorQ = parseInt(/** @type {HTMLInputElement} */ (e.target).value, 10);
    if (labelBoxPos) {
      const semiApprox = (state.boxAnchorQ / 2).toFixed(1).replace(".0", "");
      labelBoxPos.textContent = `S${semiApprox} (q=${state.boxAnchorQ})`;
    }
    refreshAll();
  });

  document.querySelectorAll(".jins-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      state.jinsFilter = /** @type {any} */ (/** @type {HTMLElement} */ (btn).dataset.filter);
      syncControlsWithState();
      refreshAll();
    });
  });

  document.getElementById("select-label")?.addEventListener("change", (e) => {
    state.labelMode = /** @type {any} */ (/** @type {HTMLSelectElement} */ (e.target).value);
    refreshAll();
  });

  document.getElementById("btn-guide-semi")?.addEventListener("click", () => {
    state.showSemiGuides = !state.showSemiGuides;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-guide-micro")?.addEventListener("click", () => {
    state.showMicroGuides = !state.showMicroGuides;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-ghost-notes")?.addEventListener("click", () => {
    state.showGhostNotes = !state.showGhostNotes;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-play-scale")?.addEventListener("click", handlePrimaryAudioAction);
  document.getElementById("btn-play-taqsim")?.addEventListener("click", handlePlayTaqsim);
  document.getElementById("btn-arp-chord")?.addEventListener("click", () => arpeggiateChordVoicing(currentChordVoicingFreqs));
  document.getElementById("btn-strum-step")?.addEventListener("click", () => strumChordVoicing(currentChordVoicingFreqs));
  document.getElementById("btn-play-cadence-seq")?.addEventListener("click", handlePrimaryAudioAction);

  const btnDrone = document.getElementById("btn-drone");
  btnDrone?.addEventListener("click", () => {
    state.droneActive = toggleDroneAudio(state.droneActive, state.rootQ, btnDrone);
    syncCommandBarSummaries();
  });

  const btnShare = document.getElementById("btn-share");
  btnShare?.addEventListener("click", async () => {
    const shareUrl = syncStateToUrl(state);
    try {
      await navigator.clipboard.writeText(shareUrl);
      btnShare.textContent = t(state.lang, "btnShareCopied");
      setTimeout(() => { btnShare.textContent = t(state.lang, "btnShare"); }, 2200);
    } catch {
      window.prompt(t(state.lang, "sharePrompt"), shareUrl);
    }
  });

  document.getElementById("btn-hand")?.addEventListener("click", () => {
    state.leftHanded = !state.leftHanded;
    syncControlsWithState();
    refreshAll();
  });

  document.getElementById("btn-open-glossary")?.addEventListener("click", () => openGlossary());
  document.getElementById("btn-close-glossary")?.addEventListener("click", closeGlossary);
  document.getElementById("glossary-backdrop")?.addEventListener("click", closeGlossary);

  document.getElementById("glossary-search-input")?.addEventListener("input", (e) => {
    glossaryQuery = /** @type {HTMLInputElement} */ (e.target).value;
    renderGlossaryList();
  });

  document.querySelectorAll(".gloss-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      glossaryCategory = /** @type {HTMLElement} */ (btn).dataset.cat || "ALL";
      document.querySelectorAll(".gloss-cat-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      renderGlossaryList();
    });
  });

  document.querySelectorAll(".term-help-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const termId = /** @type {HTMLElement} */ (btn).dataset.term;
      openGlossary(termId);
    });
  });

  window.addEventListener("keydown", (e) => {
    const activeTag = document.activeElement?.tagName.toLowerCase();
    const isTyping = activeTag === "input" || activeTag === "textarea" || activeTag === "select";

    if (e.key === "Escape") {
      if (activePopoverIdx !== null) {
        setActivePopover(null);
        return;
      }
      const drawer = document.getElementById("glossary-drawer");
      if (drawer?.classList.contains("open")) {
        closeGlossary();
      } else if (isZenMode) {
        toggleZenMode(false);
      }
      return;
    }

    if (!isTyping && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === "f" || e.key === "F")) {
      e.preventDefault();
      toggleZenMode();
    }
  });

  syncControlsWithState();
  refreshAll();
}

window.addEventListener("DOMContentLoaded", initApp);

// ==========================================================================
// PWA: Service Worker Offline (ativo em produção, ignorado em localhost)
// ==========================================================================
const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
if ("serviceWorker" in navigator && !isLocalhost) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Ignora em ambientes sem suporte a Service Worker
    });
  });
}

/** @type {any} */
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  const medallions = document.querySelector(".action-medallions");
  if (medallions && !document.getElementById("btn-install-pwa")) {
    const installBtn = document.createElement("button");
    installBtn.id = "btn-install-pwa";
    installBtn.type = "button";
    installBtn.className = "plum-btn";
    installBtn.textContent = state.lang === "en" ? "📲 Install App" : "📲 Instalar App";
    installBtn.addEventListener("click", async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.remove();
    });
    medallions.appendChild(installBtn);
  }
});
