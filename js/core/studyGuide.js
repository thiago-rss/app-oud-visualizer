// @ts-check

/**
 * @typedef {Object} StudyLessonPreset
 * @property {string} [tuningId]
 * @property {string[]} [tuningKeywords]
 * @property {"damascus"|"cairo"|"istanbul"} [tradition]
 * @property {"MAQAM"|"JINS"|"SCALE"|"CHORD"|"CADENCE"} mode
 * @property {string} [entityId]
 * @property {string[]} [entityKeywords]
 * @property {number} rootQ
 * @property {"ASC"|"DESC"} [direction]
 * @property {"FULL_NECK"|"OPEN_FIRST_POS"|"POS_SECOND"|"POS_THIRD_BODY"|"CLOSED_BOX"} shapeMode
 * @property {number} [boxAnchorQ]
 * @property {"NOTE_NAME"|"DEGREE"|"FINGER"|"ARABIC"} labelMode
 * @property {"ALL"|"LOWER"|"UPPER"} [jinsFilter]
 * @property {boolean} [chordVoicingOnly]
 * @property {boolean} showSemiGuides
 * @property {boolean} showMicroGuides
 * @property {boolean} showGhostNotes
 * @property {boolean} showSayr
 * @property {number} [sayrPhraseIndex]
 * @property {boolean} showStaff
 * @property {"SCALE"|"SAYR"} [staffMode]
 * @property {boolean} showPositionsMap
 * @property {string} [iqaId]
 * @property {string} [iqaKeyword]
 * @property {number} [bpm]
 * @property {"syrian"|"egyptian"} [soundChar]
 */

/**
 * @typedef {Object} StudyLesson
 * @property {string} id
 * @property {string} moduleId
 * @property {number} number
 * @property {string} duration
 * @property {string} glossaryTerm
 * @property {string} titlePt
 * @property {string} titleEn
 * @property {string} summaryPt
 * @property {string} summaryEn
 * @property {string} taskPt
 * @property {string} taskEn
 * @property {string} earTipPt
 * @property {string} earTipEn
 * @property {"SCALE"|"TAQSIM"|"REGION"|"ARPEGGIO"} audioAction
 * @property {boolean} [suggestDrone]
 * @property {boolean} [suggestIqa]
 * @property {boolean} [suggestLivePitch]
 * @property {boolean} [suggestTimbreCompare]
 * @property {boolean} [suggestZenMode]
 * @property {boolean} [openRadarHint]
 * @property {StudyLessonPreset} preset
 */

/**
 * @typedef {"foundation"|"intermediate"|"advanced"|"mastery"|"world"} StudyLevel
 */

/**
 * @typedef {Object} StudyModule
 * @property {string} id
 * @property {number} order
 * @property {StudyLevel} level
 * @property {string} icon
 * @property {string} titlePt
 * @property {string} titleEn
 * @property {string} subtitlePt
 * @property {string} subtitleEn
 * @property {StudyLesson[]} lessons
 */

/** @type {StudyModule[]} */
export const STUDY_MODULES = [
  // =========================================================================
  // CAPÍTULO 1 — FUNDAÇÃO & 12-TET
  // =========================================================================
  {
    id: "mod_foundation",
    order: 1,
    level: "foundation",
    icon: "🌱",
    titlePt: "1. Fundação & 12-TET",
    titleEn: "1. Foundation & 12-TET",
    subtitlePt: "Domine as cordas soltas, a 1ª Posição e os modos sem quartos de tom antes de entrar na microtonalidade.",
    subtitleEn: "Master open courses, 1st Position, and 12-TET modes before diving into quarter tones.",
    lessons: [
      {
        id: "les_01_open_first_pos",
        moduleId: "mod_foundation",
        number: 1,
        duration: "4 min",
        glossaryTerm: "anf_bajak",
        titlePt: "Cordas Soltas & 1ª Posição",
        titleEn: "Open Courses & 1st Position",
        summaryPt: "O braço do Oud não tem trastes, mas suas 6 ordens seguem uma lógica simples de quartas justas (C–F–A–d–g–c) com terça maior entre F e A.",
        summaryEn: "The Oud neck is fretless, yet its 6 courses follow a clear layout of perfect fourths (C–F–A–d–g–c) with a major third between F and A.",
        taskPt: "Aplique o cenário e toque apenas as joias marcadas com dedo 0 (Solta) na borda da pestana (ANF). Depois, suba nota a nota usando os dedos 1, 2 e 3 dentro da caixa da 1ª Posição.",
        taskEn: "Apply this preset and pluck only the jewels marked finger 0 (Open) at the nut (ANF). Then ascend note by note using fingers 1, 2, and 3 inside the 1st Position box.",
        earTipPt: "Mantenha o polegar atrás do braço alinhado à marca ▲ Polegar (3q) e escute a ressonância das cordas soltas como referência de afinação.",
        earTipEn: "Keep your thumb behind the neck aligned with the ▲ Thumb (3q) marker and use open strings as your pitch anchor.",
        audioAction: "REGION",
        suggestDrone: false,
        suggestIqa: false,
        preset: {
          tuningId: "syrian_arabic_c_c",
          tradition: "damascus",
          mode: "JINS",
          entityId: "jins_ajam",
          rootQ: 0,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "FINGER",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_02_ajam_major",
        moduleId: "mod_foundation",
        number: 2,
        duration: "4 min",
        glossaryTerm: "qarar",
        titlePt: "Maqam Ajam (O Modo Maior Árabe)",
        titleEn: "Maqam Ajam (The Arabic Major Mode)",
        summaryPt: "O Maqam Ajam equivale à escala maior ocidental (12-TET). Ele permite calibrar a distância entre tons e semitons sem a dificuldade extra dos quartos de tom.",
        summaryEn: "Maqam Ajam corresponds to the Western major scale (12-TET). It lets you calibrate whole and half steps without the extra challenge of quarter tones.",
        taskPt: "Toque a escala completa na 1ª Posição observando as joias em Rubi (Qarar / Tônica C) e Âmbar (Ghammaz / Dominante G). Experimente clicar nas notas da pauta para confirmar onde cada altura aparece no braço.",
        taskEn: "Play the full scale in 1st Position noticing the Ruby (Qarar / Tonic C) and Amber (Ghammaz / Dominant G) jewels. Click notes on the staff to confirm their positions on the neck.",
        earTipPt: "Toque o botão ▶ na cápsula 'I · 1ª Pos' para ouvir a extensão inteira que cabe sem mover a mão esquerda.",
        earTipEn: "Click the ▶ button on the 'I · 1st Pos' pill to hear the full range reachable without shifting your left hand.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: false,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_ajam",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "NOTE_NAME",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_03_nahawand_kurd",
        moduleId: "mod_foundation",
        number: 3,
        duration: "5 min",
        glossaryTerm: "maqam",
        titlePt: "Maqam Nahawand & Universo Menor",
        titleEn: "Maqam Nahawand & Minor Universe",
        summaryPt: "Nahawand (menor harmônico/natural) e Kurd (frígio) são os dois pilares menores em 12-TET. No Nahawand, o 7º grau sobe com sensível maior (7) e desce natural (b7).",
        summaryEn: "Nahawand (harmonic/natural minor) and Kurd (Phrygian) are the two 12-TET minor pillars. In Nahawand, the 7th degree ascends with a leading tone (7) and descends flat (b7).",
        taskPt: "Pratique os graus 1 – 2 – b3 – 4 – 5 em C na 1ª Posição. Depois, abra 'Modalidade' na Barra Única e alterne entre ↑ Subida e ↓ Descida para notar a mudança de B para Bb.",
        taskEn: "Practice degrees 1 – 2 – b3 – 4 – 5 in C in 1st Position. Then open 'Mode / Maqam' in the Command Bar and toggle ↑ Ascending vs ↓ Descending to see B change to Bb.",
        earTipPt: "Dica extra: após dominar Nahawand em C, teste Maqam Kurd em D — ambos usam apenas guias de semitom (12-TET).",
        earTipEn: "Bonus tip: once comfortable with Nahawand in C, try Maqam Kurd in D — both rely strictly on 12-TET semitone guides.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: false,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_nahawand",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "DEGREE",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 2 — O UNIVERSO DOS AJNAS (BLOCOS & 1/4 DE TOM)
  // =========================================================================
  {
    id: "mod_ajnas",
    order: 2,
    level: "foundation",
    icon: "۞",
    titlePt: "2. O Universo dos Ajnas",
    titleEn: "2. The World of Ajnas",
    subtitlePt: "Pare de decorar escalas longas: aprenda a pensar em blocos de 3 a 5 notas e afine seus primeiros quartos de tom.",
    subtitleEn: "Stop memorizing long scales: learn to think in 3-to-5 note blocks and tune your first quarter tones.",
    lessons: [
      {
        id: "les_04_what_is_jins",
        moduleId: "mod_ajnas",
        number: 4,
        duration: "4 min",
        glossaryTerm: "jins",
        titlePt: "O que é um Jins? (Pensando em Blocos)",
        titleEn: "What Is a Jins? (Thinking in Blocks)",
        summaryPt: "Na música árabe, todo Maqam nasce da soma de dois ou mais blocos chamados Ajnas (plural de Jins). Dominar um Jins de 4 ou 5 notas destrava dezenas de Maqamat.",
        summaryEn: "In Arabic music, every Maqam is built by combining two or more blocks called Ajnas (plural of Jins). Mastering a 4- or 5-note Jins unlocks dozens of Maqamat.",
        taskPt: "Observe o Jins Nahawand (1 – 2 – b3 – 4 – 5) isolado no espelho. Em vez de tocar a oitava inteira, improvise frases curtas usando apenas essas 5 notas e repousando sempre no 1 (Rubi) ou no 5 (Âmbar).",
        taskEn: "Inspect Jins Nahawand (1 – 2 – b3 – 4 – 5) isolated on the neck. Instead of playing a full octave, improvise short motifs using only these 5 notes, resting on 1 (Ruby) or 5 (Amber).",
        earTipPt: "Cante cada grau enquanto toca: sentir a gravidade do bloco reduz a confusão ao improvisar.",
        earTipEn: "Sing each degree as you play: internalizing the gravity of the block removes guesswork during improvisation.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: false,
        preset: {
          mode: "JINS",
          entityId: "jins_nahawand",
          rootQ: 0,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "DEGREE",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_05_jins_rast",
        moduleId: "mod_ajnas",
        number: 5,
        duration: "6 min",
        glossaryTerm: "sikah_interval",
        titlePt: "Jins Rast — A Terça Neutra (3-)",
        titleEn: "Jins Rast — The Neutral Third (3-)",
        summaryPt: "Bem-vindo ao sistema 24-TET. A estrela ameixa (۞) marca o grau 3- (E-, Sikah): uma nota posicionada exatamente entre o Eb (menor) e o E natural (maior).",
        summaryEn: "Welcome to 24-TET. The plum star (۞) marks degree 3- (E-, Sikah): a pitch sitting right between Eb (minor) and E natural (major).",
        taskPt: "Ligue o Drone em C (no menu ⋯ ou na barra inferior mobile) e alterne lentamente entre D (corda 3ª solta), E- (estrela na 3ª ordem, guia 3q) e F. Ouça o acidente de meio-bemol na pauta.",
        taskEn: "Turn on the C Drone (in the ⋯ menu or mobile dock) and slowly alternate between D (open 3rd course), E- (star on 3rd course, 3q guide), and F. Notice the half-flat accidental on the staff.",
        earTipPt: "Se soar triste como menor, avance o dedo 1 alguns milímetros; se soar alegre demais como maior, recue ligeiramente.",
        earTipEn: "If it sounds sad like minor, nudge finger 1 slightly forward; if it sounds too bright like major, pull slightly back.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: false,
        suggestLivePitch: true,
        preset: {
          mode: "JINS",
          entityId: "jins_rast",
          rootQ: 0,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "DEGREE",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_06_jins_bayati",
        moduleId: "mod_ajnas",
        number: 6,
        duration: "6 min",
        glossaryTerm: "sikah_interval",
        titlePt: "Jins Bayati — A Segunda Neutra (2-)",
        titleEn: "Jins Bayati — The Neutral Second (2-)",
        summaryPt: "O Jins mais popular da música árabe usa a mesma nota microtonal E-, mas agora como 2º grau neutro (2-) acima da tônica D (Dukah), criando um lirismo intimista.",
        summaryEn: "The most beloved Jins in Arabic music uses the same microtonal pitch E-, now acting as a neutral 2nd (2-) above tonic D (Dukah), creating an intimate, lyrical pull.",
        taskPt: "Ancore a 3ª ordem solta (D) como tônica e toque a célula 1 – 2- – b3 – 4 (D – E- – F – G) com os dedos 0 – 1 – 2 – 0 (2ª ordem solta). Repare que E- em Bayati tende a ser ligeiramente mais baixo que em Rast.",
        taskEn: "Anchor open 3rd course (D) as tonic and play 1 – 2- – b3 – 4 (D – E- – F – G) with fingers 0 – 1 – 2 – 0 (open 2nd course). Notice that E- in Bayati leans slightly lower than in Rast.",
        earTipPt: "Com o Drone em D ligado, repouse sobre o F (b3) e desça para o D passando sem pressa pelo E- (2-).",
        earTipEn: "With the D Drone on, lean on F (b3) and descend to D passing gently through E- (2-).",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: false,
        suggestLivePitch: true,
        preset: {
          mode: "JINS",
          entityId: "jins_bayati",
          rootQ: 4,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "FINGER",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 3 — FRASEADO (SAYR) & RITMO (IQA')
  // =========================================================================
  {
    id: "mod_sayr_rhythm",
    order: 3,
    level: "intermediate",
    icon: "✨",
    titlePt: "3. Fraseado (Sayr) & Ritmo",
    titleEn: "3. Phrasing (Sayr) & Rhythm",
    subtitlePt: "Transforme escalas em música: conecte 1º e 2º Ajnas, siga o caminho melódico (Sayr) e toque sobre o pulso do Iqa'.",
    subtitleEn: "Turn scales into music: connect lower and upper Ajnas, follow the melodic path (Sayr), and lock into an Iqa' groove.",
    lessons: [
      {
        id: "les_07_maqam_rast",
        moduleId: "mod_sayr_rhythm",
        number: 7,
        duration: "6 min",
        glossaryTerm: "sayr",
        titlePt: "Maqam Rast — Subida, Descida & Sayr",
        titleEn: "Maqam Rast — Ascent, Descent & Sayr",
        summaryPt: "Um Maqam não é só um conjunto de notas, mas um comportamento melódico (Sayr). O Rast sobe com 7º grau neutro (B-) e desce trocando-o por 7º grau menor (Bb).",
        summaryEn: "A Maqam is not just a scale, but a melodic path (Sayr). Rast ascends with a neutral 7th (B-) and descends replacing it with a flat 7th (Bb).",
        taskPt: "Observe as setas numeradas ①→②→③ desenhadas no espelho (frase 1. Istihlal). Clique em '▶ Ouvir Exemplo' para acompanhar a frase nota a nota na pauta e no braço.",
        taskEn: "Follow the numbered arrows ①→②→③ drawn on the neck (phrase 1. Istihlal). Click '▶ Play Example' to follow the phrase step by step on both staff and neck.",
        earTipPt: "Abra 'Modalidade' na Barra Única e explore as 3 etapas do Sayr: 1. Istihlal (abertura), 2. Ghammaz (clímax no 5º grau) e 3. Qafla (descida final).",
        earTipEn: "Open 'Mode / Maqam' in the Command Bar and explore all 3 Sayr stages: 1. Istihlal (opening), 2. Ghammaz (5th-degree climax), and 3. Qafla (closing descent).",
        audioAction: "TAQSIM",
        suggestDrone: false,
        suggestIqa: false,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_rast",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "NOTE_NAME",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      },
      {
        id: "les_08_maqam_hijaz",
        moduleId: "mod_sayr_rhythm",
        number: 8,
        duration: "6 min",
        glossaryTerm: "taqsim",
        titlePt: "Maqam Hijaz — O Salto b2–3",
        titleEn: "Maqam Hijaz — The b2–3 Leap",
        summaryPt: "O Maqam Hijaz em D destaca-se pela segunda aumentada entre Eb (b2) e F# (3). Na tradição clássica, o Eb soa um pouco mais alto e o F# um pouco mais baixo que no piano.",
        summaryEn: "Maqam Hijaz in D is defined by the augmented second between Eb (b2) and F# (3). Traditionally, Eb leans slightly sharp and F# slightly flat compared to a piano.",
        taskPt: "Com os dedos visíveis no braço, treine a abertura entre o dedo 1 (Eb em 2q) e o dedo 3 (F# em 8q) na 3ª ordem (d), apoiando sempre no 4º grau G (Ghammaz, 2ª ordem solta).",
        taskEn: "With finger numbers visible, practice the stretch between finger 1 (Eb at 2q) and finger 3 (F# at 8q) on the 3rd course (d), anchoring on the 4th degree G (Ghammaz, open 2nd course).",
        earTipPt: "Não estique o pulso: relaxe o polegar e use o dedo 3 em vez do 2 para alcançar o F# com firmeza.",
        earTipEn: "Avoid wrist strain: relax your thumb and use finger 3 instead of finger 2 to reach F# cleanly.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: false,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_hijaz",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "FINGER",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      },
      {
        id: "les_09_sayr_maqsum",
        moduleId: "mod_sayr_rhythm",
        number: 9,
        duration: "7 min",
        glossaryTerm: "iqa",
        titlePt: "Qafla sobre o Iqa' Maqsum (4/4)",
        titleEn: "Qafla Over Iqa' Maqsum (4/4)",
        summaryPt: "O Iqa' Maqsum (D–T · T D · T ·) é o ritmo mais essencial do repertório árabe. Treinar frases cadenciais (Qafla) sobre o ciclo rítmico desenvolve senso de repouso no tempo forte.",
        summaryEn: "Iqa' Maqsum (D–T · T D · T ·) is the quintessential rhythm of Arabic music. Practicing cadential phrases (Qafla) over the cycle builds rhythmic resolution onto beat 1.",
        taskPt: "Inicie o ritmo Maqsum a 86 BPM (em 'Ritmo Iqa'' na Barra Única ou botão 🥁 no mobile) e toque a frase 3. Qafla do Maqam Bayati fazendo a nota final D (Qarar) cair exatamente no primeiro DUM.",
        taskEn: "Start the Maqsum rhythm at 86 BPM (in 'Rhythm Iqa'' in the Command Bar or 🥁 on mobile) and play Bayati's phrase 3. Qafla, landing the final D (Qarar) right on the downbeat DUM.",
        earTipPt: "Use palhetada para baixo (Risha) nos golpes graves (DUM) e alternada nas passagens rápidas.",
        earTipEn: "Align downstrokes (Risha) with heavy DUM beats and alternate picking on faster connecting notes.",
        audioAction: "TAQSIM",
        suggestDrone: false,
        suggestIqa: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_bayati",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "DEGREE",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 2,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_maqsum",
          iqaKeyword: "maqsum",
          bpm: 86
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 4 — MOBILIDADE & MODULAÇÃO (INTIQAL)
  // =========================================================================
  {
    id: "mod_mobility_mod",
    order: 4,
    level: "intermediate",
    icon: "🧭",
    titlePt: "4. Mobilidade & Modulação",
    titleEn: "4. Mobility & Modulation",
    subtitlePt: "Saia da 1ª Posição usando uníssonos e pivôs anatômicos, e aprenda a modular de cor sobre o Ghammaz.",
    subtitleEn: "Move beyond 1st Position using unisons and shift pivots, and learn to modulate colors via the Ghammaz.",
    lessons: [
      {
        id: "les_10_unison_bridges",
        moduleId: "mod_mobility_mod",
        number: 10,
        duration: "5 min",
        glossaryTerm: "anf_bajak",
        titlePt: "Pontes de Uníssono (=1ª, =2ª, =3ª)",
        titleEn: "Unison Bridges (=1st, =2nd, =3rd)",
        summaryPt: "Uma mesma nota pode ser tocada solta em uma ordem ou presa na ordem mais grave vizinha. Esses pontos de uníssono servem para conferir afinação e trocar de timbre.",
        summaryEn: "The same pitch can be played open on one course or stopped on the adjacent lower course. These unison bridges double as tuning checks and timbre shifts.",
        taskPt: "No espelho completo, clique diretamente nas microcápsulas ameixa '=1ª', '=2ª' ou '=3ª' sobre as joias. O app tocará as duas notas em sequência e desenhará o arco ligando a nota presa à corda solta equivalente.",
        taskEn: "On the full neck, click directly on the plum '=1ª', '=2ª', or '=3ª' badges on the jewels. The app plays both notes back-to-back and draws an arc linking the stopped note to its open equivalent.",
        earTipPt: "Tocar a nota presa na 2ª ordem em vez da 1ª solta entrega um timbre mais aveludado e permite vibrato.",
        earTipEn: "Playing the stopped note on the 2nd course instead of the open 1st yields a warmer tone and allows vibrato.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: false,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_rast",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "NOTE_NAME",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_11_hand_shifts",
        moduleId: "mod_mobility_mod",
        number: 11,
        duration: "6 min",
        glossaryTerm: "qafla",
        titlePt: "Mudança de Posição (II Média & III Tampo)",
        titleEn: "Position Shifts (II Mid & III Body)",
        summaryPt: "Ao subir além da 1ª Posição (até a junta do tampo em 10q), a mão desliza em bloco para a 2ª Posição (II) e 3ª Posição (III), mantendo a ergonomia dos 4 dedos.",
        summaryEn: "Moving past 1st Position (toward the body joint at 10q), the hand shifts as a unit into 2nd Position (II) and 3rd Position (III), keeping a relaxed 4-finger span.",
        taskPt: "Clique nos pivôs dourados '⇄P2' e '⇄P3' nas joias (ou nas cápsulas 'II · 2ª Pos' e 'III · Tampo' no topo do braço) para visualizar o arco de deslocamento do polegar. Use o ▶ da cápsula ativa para ouvir a escala na nova região.",
        taskEn: "Click the brass '⇄P2' and '⇄P3' pivots on the jewels (or the 'II · 2nd Pos' and 'III · Body' pills above the neck) to see the thumb shift arc. Use the active pill's ▶ button to hear the scale in the new region.",
        earTipPt: "Deslize o polegar junto com o dedo 1 sem apertar o braço durante o trajeto até a linha tracejada da junta (10q).",
        earTipEn: "Glide your thumb smoothly alongside finger 1 without squeezing the neck as you cross the dashed body-joint line (10q).",
        audioAction: "REGION",
        suggestDrone: false,
        suggestIqa: false,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_nahawand",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "POS_SECOND",
          labelMode: "FINGER",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_12_modulation_ghammaz",
        moduleId: "mod_mobility_mod",
        number: 12,
        duration: "7 min",
        glossaryTerm: "ghammaz",
        titlePt: "Modulação pelo Ghammaz (Rast → Suznak)",
        titleEn: "Modulating via Ghammaz (Rast → Suznak)",
        summaryPt: "O Ghammaz (nota âmbar) é a dobradiça onde o 1º Jins encontra o 2º Jins. Ao trocar o Jins superior de Rast para Hijaz sobre o 5º grau (G), você cria o célebre Maqam Suznak.",
        summaryEn: "The Ghammaz (amber note) is the hinge where the lower Jins meets the upper Jins. Swapping the upper Jins of Rast to Hijaz on the 5th degree (G) creates the famous Maqam Suznak color.",
        taskPt: "Aplique o Maqam Rast em C, escute a frase 2. Ghammaz (que repousa em G) e clique em '🧭 Abrir Radar de Modulação' abaixo. No Radar, ouça e aplique 'Jins Hijaz em G' e depois use '↩ Voltar à Origem' para resolver em C.",
        taskEn: "Apply Maqam Rast in C, hear phrase 2. Ghammaz (resting on G), then click '🧭 Open Modulation Radar' below. In the Radar, preview and apply 'Jins Hijaz in G', then hit '↩ Return to Origin' to resolve back to C.",
        earTipPt: "Essa ida e volta (Qarar → Ghammaz → novo Jins → Qarar) é a espinha dorsal de qualquer Taqsim tradicional.",
        earTipEn: "This round-trip arc (Qarar → Ghammaz → new Jins → Qarar) is the structural backbone of any traditional Taqsim.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: false,
        openRadarHint: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_rast",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "DEGREE",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 1,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 5 — EXPRESSÃO, ORNAMENTAÇÃO & TIMBRE (AVANÇADO)
  // =========================================================================
  {
    id: "mod_expression_timbre",
    order: 5,
    level: "advanced",
    icon: "🪶",
    titlePt: "5. Expressão, Risha & Timbre",
    titleEn: "5. Expression, Risha & Timbre",
    subtitlePt: "Refine a mão direita (Risha), explore cordas soltas como pedal (Bariolage), deslizes microtonais (Zahfa) e o contraste entre as escolas Síria e Egípcia.",
    subtitleEn: "Refine your right hand (Risha), use open-course pedals (Bariolage), microtonal slides (Zahfa), and the tonal contrast between Syrian and Egyptian schools.",
    lessons: [
      {
        id: "les_13_bariolage_pedal",
        moduleId: "mod_expression_timbre",
        number: 13,
        duration: "7 min",
        glossaryTerm: "taqsim",
        titlePt: "Bariolage & Pedal de Corda Solta",
        titleEn: "Bariolage & Open-Course Pedal",
        summaryPt: "No Bariolage (recurso central em Munir Bashir e na escola iraquiana/levantina), a melodia caminha em uma ordem enquanto a corda solta vizinha responde continuamente como pedal rítmico e harmônico.",
        summaryEn: "In Bariolage (a signature of Munir Bashir and Levantine/Iraqi playing), the melody moves on one course while the adjacent open course rings continuously as a rhythmic-harmonic pedal.",
        taskPt: "Em Maqam Kurd (D), mantenha o dedo 0 da 3ª ordem (D solto) ou 2ª ordem (G solto) como pivô. Toque a linha descendente C – Bb – A – G na 2ª ordem intercalando cada nota com um golpe leve para cima (Radd) na 3ª ordem solta (D).",
        taskEn: "In Maqam Kurd (D), use open 3rd course (D) or open 2nd course (G) as a pivot. Play the descending line C – Bb – A – G on the 2nd course while alternating every note with a light upstroke (Radd) on open D.",
        earTipPt: "Use palhetada alternada rigorosa: golpe descendente (↓) nas notas da melodia e ascendente suave (↑) na corda solta pedal, sem abafar a ressonância.",
        earTipEn: "Keep strict alternating Risha: downstrokes (↓) on melody notes and soft upstrokes (↑) on the open pedal course without muting its ring.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_kurd",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "FINGER",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: true,
          sayrPhraseIndex: 1,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_baladi",
          iqaKeyword: "baladi",
          bpm: 82
        }
      },
      {
        id: "les_14_zahfa_microtonal",
        moduleId: "mod_expression_timbre",
        number: 14,
        duration: "7 min",
        glossaryTerm: "sikah_interval",
        titlePt: "Zahfa & Inflexões Microtonais (Sikah)",
        titleEn: "Zahfa & Microtonal Inflections (Sikah)",
        summaryPt: "A Zahfa é o portamento característico do Oud sem trastes: um deslize controlado do mesmo dedo por 1 ou 2 quartos de tom que dá voz humana aos graus neutros.",
        summaryEn: "Zahfa is the signature fretless Oud glide: a controlled slide of the same finger across 1 or 2 quarter tones that gives neutral degrees a vocal quality.",
        taskPt: "Aplique Maqam Sikah (tônica diretamente no quarto de tom E-!) e ligue a Escuta 24-TET. Ataque a nota D# (2q) ou D e deslize o dedo 1 suavemente até estabilizar exatamente sobre a estrela E- (3q), observando o ponteiro ao vivo travar no alvo.",
        taskEn: "Apply Maqam Sikah (tonic directly on quarter-tone E-!) and enable Live Pitch 24-TET. Pluck D# (2q) or D and glide finger 1 smoothly until the live pointer locks right onto the E- star (3q).",
        earTipPt: "Evite deslizar devagar demais como glissando de slide-guitar: a Zahfa árabe é rápida na partida e pousa com firmeza e silêncio no centro da nota.",
        earTipEn: "Avoid slow guitar-like slides: Arabic Zahfa launches briskly and settles with clean stillness right at the pitch center.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: false,
        suggestLivePitch: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_sikah",
          rootQ: 7,
          direction: "ASC",
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "DEGREE",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      },
      {
        id: "les_15_syrian_vs_egyptian",
        moduleId: "mod_expression_timbre",
        number: 15,
        duration: "8 min",
        glossaryTerm: "sayr",
        titlePt: "Escolas Síria vs. Egípcia (Timbre & Posição)",
        titleEn: "Syrian vs. Egyptian Schools (Timbre & Position)",
        summaryPt: "O ponto onde a Risha toca a corda e a escolha de posição transformam o fraseado: a escola Síria privilegia ataque seco perto do cavalete; a Egípcia busca bojo cheio, notas ligadas e vibrato perto da roseta.",
        summaryEn: "Where the Risha strikes and which position you choose reshape your phrasing: the Syrian school favors crisp attack near the bridge; the Egyptian school seeks warm resonance, legato, and vibrato near the rosette.",
        taskPt: "Com Bayati em D na 2ª Posição (menos cordas soltas, mais controle de vibrato) e nomes árabes visíveis, ouça o exemplo alternando o botão '🪕 Alternar Timbre (Sírio / Egípcio)' abaixo. Depois reproduza os dois ataques no seu Oud real.",
        taskEn: "With Bayati in D in 2nd Position (fewer open strings, deeper vibrato control) and Arabic note names on, play the example while toggling '🪕 Switch Timbre (Syrian / Egyptian)' below. Then mirror both right-hand positions on your real Oud.",
        earTipPt: "No ataque Egípcio, incline levemente a Risha e desloque a mão direita em direção à roseta central; no Sírio, recue 3 a 4 cm em direção ao cavalete para destacar os médios.",
        earTipEn: "For Egyptian tone, angle the Risha slightly and move toward the main rosette; for Syrian clarity, shift 3–4 cm toward the bridge to bring out crisp midrange definition.",
        audioAction: "TAQSIM",
        suggestDrone: false,
        suggestIqa: true,
        suggestTimbreCompare: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_bayati",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "POS_SECOND",
          labelMode: "ARABIC",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: true,
          showSayr: true,
          sayrPhraseIndex: 1,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_saidi",
          iqaKeyword: "saidi",
          bpm: 92,
          soundChar: "egyptian"
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 6 — MAQAMAT COMPOSTOS & RITMOS ASSIMÉTRICOS (AVANÇADO)
  // =========================================================================
  {
    id: "mod_compound_asymmetric",
    order: 6,
    level: "advanced",
    icon: "☪️",
    titlePt: "6. Maqamat Compostos & Ritmos Ímpares",
    titleEn: "6. Compound Maqamat & Odd Rhythms",
    subtitlePt: "Domine os modos de maior carga expressiva do repertório clássico (Saba, Huzam e Nawa Athar) e a respiração em ciclos compostos.",
    subtitleEn: "Master the most expressive classical modes (Saba, Huzam, and Nawa Athar) alongside compound rhythmic cycles.",
    lessons: [
      {
        id: "les_16_maqam_saba",
        moduleId: "mod_compound_asymmetric",
        number: 16,
        duration: "8 min",
        glossaryTerm: "maqam",
        titlePt: "Maqam Saba — O 4º Grau Diminuto (b4)",
        titleEn: "Maqam Saba — The Diminished 4th (b4)",
        summaryPt: "Considerado o Maqam mais pungente da música árabe, o Saba nasce de um tetracorde sobreposto onde o 4º grau (Gb / b4) cai meio tom abaixo da quarta justa, abrindo um Jins Hijaz oculto a partir do 3º grau (F).",
        summaryEn: "Regarded as the most poignant Arabic Maqam, Saba features an overlapping structure where the 4th degree (Gb / b4) drops a semitone below the perfect fourth, unlocking a hidden Jins Hijaz starting on the 3rd degree (F).",
        taskPt: "Com o Drone em D e a Escuta 24-TET ativa, pratique a célula D – E- – F – Gb na 3ª ordem (evite tocar a 2ª ordem solta G!). Depois suba pelo Jins Hijaz em F (F – Gb – A – Bb) e explore o Radar de Modulação.",
        taskEn: "With the D Drone and Live Pitch 24-TET active, practice D – E- – F – Gb on the 3rd course (avoid open 2nd course G!). Then ascend through Jins Hijaz on F (F – Gb – A – Bb) and inspect the Modulation Radar.",
        earTipPt: "O coração emocional do Saba está na queda íntima de Gb para F: repouse bastante no F (3º grau) antes de resolver no Qarar D.",
        earTipEn: "The emotional core of Saba lies in the tender drop from Gb down to F: linger on F (3rd degree) before resolving to Qarar D.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: false,
        suggestLivePitch: true,
        openRadarHint: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_saba",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "DEGREE",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      },
      {
        id: "les_17_maqam_huzam_samai",
        moduleId: "mod_compound_asymmetric",
        number: 17,
        duration: "9 min",
        glossaryTerm: "iqa",
        titlePt: "Maqam Huzam & Sama'i Thaqil (10/8)",
        titleEn: "Maqam Huzam & Sama'i Thaqil (10/8)",
        summaryPt: "O Huzam combina o brilho suspenso do tricorde Jins Sikah (E- – F – G) com o drama do Jins Hijaz sobre o Ghammaz G (G – Ab – B – C). Associado ao ciclo Sama'i Thaqil (10/8), introduz a forma clássica instrumental Sama'i.",
        summaryEn: "Huzam pairs the suspended lift of tricord Jins Sikah (E- – F – G) with the drama of Jins Hijaz on Ghammaz G (G – Ab – B – C). Paired with Sama'i Thaqil (10/8), it unlocks the classical Sama'i form.",
        taskPt: "Inicie o Iqa' Sama'i Thaqil a 74 BPM e conte o ciclo em 4 grupos desiguais: (1-2-3) · (4-5) · (6-7) · (8-9-10). Toque a frase de abertura do Huzam destacando o salto Ab–B na 2ª ordem e resolvendo no Qarar E- sobre o tempo 1 (DUM).",
        taskEn: "Start Iqa' Sama'i Thaqil at 74 BPM and feel the cycle in 4 uneven groups: (1-2-3) · (4-5) · (6-7) · (8-9-10). Play Huzam's opening phrase emphasizing the Ab–B leap on the 2nd course and landing on Qarar E- on beat 1 (DUM).",
        earTipPt: "Não apresse o último bloco de 3 colcheias (tempos 8-9-10): é a pausa respirada antes do próximo DUM que dá elegância ao Sama'i.",
        earTipEn: "Never rush the final 3-eighth block (beats 8-9-10): that unhurried breath before the next DUM gives Sama'i its poise.",
        audioAction: "TAQSIM",
        suggestDrone: false,
        suggestIqa: true,
        openRadarHint: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_huzam",
          rootQ: 7,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "NOTE_NAME",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_samai_thaqil",
          iqaKeyword: "samai",
          bpm: 74
        }
      },
      {
        id: "les_18_nawa_athar_finale",
        moduleId: "mod_compound_asymmetric",
        number: 18,
        duration: "9 min",
        glossaryTerm: "qafla",
        titlePt: "Nawa Athar — Dupla 2ª Aumentada & Shape Móvel",
        titleEn: "Nawa Athar — Double Augmented 2nd & Movable Box",
        summaryPt: "O Maqam Nawa Athar (C – D – Eb – F# – G – Ab – B – c) empilha duas segundas aumentadas (Eb–F# e Ab–B), unindo Jins Nikriz na base e Jins HijazKar no topo — um teste completo de abertura e virtuosismo.",
        summaryEn: "Maqam Nawa Athar (C – D – Eb – F# – G – Ab – B – c) stacks two augmented seconds (Eb–F# and Ab–B), joining Jins Nikriz below with Jins HijazKar above — a complete workout for hand stretch and virtuosity.",
        taskPt: "Treine o modo dentro do Shape Móvel fechado (sem depender de cordas soltas), depois acione o ritmo Malfuf a 108 BPM (acentuação sincopada 3+3+2) e encaixe a frase 3. Qafla em direção ao C agudo e de volta ao Qarar.",
        taskEn: "Practice the mode inside the closed Movable Box (without relying on open courses), then launch Iqa' Malfuf at 108 BPM (syncopated 3+3+2 pulse) and lock phrase 3. Qafla up to high C and back to Qarar.",
        earTipPt: "Para aprofundar a simetria do modo, abra o Radar de Modulação a partir de Nawa Athar e compare os saltos com Nahawand e Hijaz antes da Qafla final.",
        earTipEn: "To internalize the mode's symmetry, open the Modulation Radar from Nawa Athar and compare its leaps against Nahawand and Hijaz before your closing Qafla.",
        audioAction: "TAQSIM",
        suggestDrone: false,
        suggestIqa: true,
        openRadarHint: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_nawa_athar",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "CLOSED_BOX",
          boxAnchorQ: 2,
          labelMode: "FINGER",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: true,
          sayrPhraseIndex: 2,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_malfuf",
          iqaKeyword: "malfuf",
          bpm: 108
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 7 — HARMONIA MODAL, ACORDES & QAFLAT (AVANÇADO)
  // =========================================================================
  {
    id: "mod_harmony_qafla",
    order: 7,
    level: "advanced",
    icon: "❖",
    titlePt: "7. Harmonia Modal, Acordes & Qaflat",
    titleEn: "7. Modal Harmony, Chords & Qaflat",
    subtitlePt: "Explore a polifonia idiomática do Oud moderno: voicings limpos de 1 nota por ordem, tríades microtonais neutras e cadências modais (Qaflat).",
    subtitleEn: "Explore idiomatic polyphony on the modern Oud: clean 1-note-per-course voicings, microtonal neutral triads, and modal cadences (Qaflat).",
    lessons: [
      {
        id: "les_19_modal_chords_voicing",
        moduleId: "mod_harmony_qafla",
        number: 19,
        duration: "6 min",
        glossaryTerm: "qarar",
        titlePt: "Acordes no Oud & Voicing (1 Nota/Ordem)",
        titleEn: "Oud Chords & Voicing (1 Note/Course)",
        summaryPt: "Embora a música árabe clássica seja essencialmente melódica (heterofônica), mestres contemporâneos como Anouar Brahem e Marcel Khalife usam acordes abertos de 3 a 4 ordens para criar paisagens harmônicas.",
        summaryEn: "Although classical Arabic music is primarily melodic (heterophonic), modern masters like Anouar Brahem and Marcel Khalife use open 3-to-4 course voicings for lush harmonic color.",
        taskPt: "Com o filtro '1 Nota/Ordem' ativo na 1ª Posição, posicione os dedos exatamente nas joias indicadas e toque um rasgueio suave (Risha descendente lenta). Em seguida, abra 'Modalidade' e alterne para 'Arpejo Completo' para ver todas as extensões do acorde.",
        taskEn: "With '1 Note/Course' active in 1st Position, place your fingers on the highlighted jewels and strum slowly downward with the Risha. Then open 'Mode / Maqam' and switch to 'Full Arpeggio' to reveal every chord tone across the neck.",
        earTipPt: "No Oud sem trastes, mantenha os dedos curvados e em pé para evitar abafar a ordem vizinha — se uma corda soar surda, ajuste o ângulo do punho esquerdo.",
        earTipEn: "On a fretless Oud, keep fingertips arched upright so adjacent courses ring freely — if a course buzzes or mutes, rotate your left wrist slightly forward.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: false,
        preset: {
          mode: "CHORD",
          entityKeywords: ["minor", "menor", "nahawand", "min"],
          rootQ: 0,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "FINGER",
          chordVoicingOnly: true,
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_20_neutral_rast_triad",
        moduleId: "mod_harmony_qafla",
        number: 20,
        duration: "7 min",
        glossaryTerm: "sikah_interval",
        titlePt: "A Tríade Neutra Rast (1 – 3- – 5) & Arpejos",
        titleEn: "The Neutral Rast Triad (1 – 3- – 5) & Arpeggios",
        summaryPt: "Um dos acordes mais singulares do Oud é a tríade neutra de Rast (C – E- – G): sem ser maior nem menor, ela produz uma sonoridade suspensa e luminosa impossível em instrumentos de traste fixo 12-TET.",
        summaryEn: "One of the most unique chords on the Oud is the neutral Rast triad (C – E- – G): neither major nor minor, it yields a luminous, suspended resonance impossible on standard 12-TET fretted instruments.",
        taskPt: "Clique em '🔊 Ouvir Exemplo' para escutar o arpejo nota a nota (C – E- – G). Ligue a Escuta 24-TET e toque o arpejo lentamente no seu Oud, validando se a terça neutra E- (estrela ameixa) sustenta limpa contra o C grave e o G solto.",
        taskEn: "Click '🔊 Play Example' to hear the chord arpeggiated (C – E- – G). Enable Live Pitch 24-TET and arpeggiate slowly on your Oud, checking that the neutral third E- (plum star) rings cleanly between low C and open G.",
        earTipPt: "Toque primeiro o intervalo de quinta justa (C–G) para estabilizar a moldura acústica e só então adicione a terça neutra E- no meio.",
        earTipEn: "Pluck the open fifth (C–G) first to establish a pure acoustic frame, then gently introduce the neutral third E- in the center.",
        audioAction: "ARPEGGIO",
        suggestDrone: true,
        suggestIqa: false,
        suggestLivePitch: true,
        preset: {
          mode: "CHORD",
          entityKeywords: ["rast", "neutral", "neutr"],
          rootQ: 0,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "DEGREE",
          chordVoicingOnly: true,
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_21_cadence_qafla_seq",
        moduleId: "mod_harmony_qafla",
        number: 21,
        duration: "7 min",
        glossaryTerm: "qafla",
        titlePt: "Cadências Modais (Sequenciador de Qafla)",
        titleEn: "Modal Cadences (Qafla Sequencer)",
        summaryPt: "Ao contrário da cadência tonal ocidental (V7 → I), as cadências modais árabes (Qaflat) apoiam-se em movimentos de grau vizinho (como bII → I no Hijaz/Kurd ou bVII → I no Bayati/Nahawand).",
        summaryEn: "Unlike Western V7 → I resolution, Arabic modal cadences (Qaflat) thrive on stepwise neighbor gravity (such as bII → I in Hijaz/Kurd or bVII → I in Bayati/Nahawand).",
        taskPt: "Observe a barra 'Sequenciador de Cadência Modal' logo acima do espelho. Clique em cada cartão (Passo 1, 2, 3...) para estudar a troca mínima de dedos entre os acordes e depois clique em '▶ Executar Qafla Completa'.",
        taskEn: "Look at the 'Modal Cadence Sequencer' bar right above the fingerboard. Click each card (Step 1, 2, 3...) to inspect minimal left-hand finger transitions, then hit '▶ Play Full Qafla'.",
        earTipPt: "Tente improvisar uma pequena melodia sobre a última nota de cada passo da cadência antes de mudar para o acorde seguinte.",
        earTipEn: "Try weaving a short 3-note melodic link out of each cadence step before resolving onto the next chord.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: true,
        preset: {
          mode: "CADENCE",
          entityKeywords: ["hijaz", "kurd", "nahawand", "rast"],
          rootQ: 4,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "NOTE_NAME",
          chordVoicingOnly: true,
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          iqaId: "iqa_baladi",
          iqaKeyword: "baladi",
          bpm: 78
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 8 — REGISTRO AGUDO (JAWAB) & MAQAM NIKRIZ (AVANÇADO)
  // =========================================================================
  {
    id: "mod_high_register_nikriz",
    order: 8,
    level: "advanced",
    icon: "⛰️",
    titlePt: "8. Registro Agudo (Jawab) & Nikriz",
    titleEn: "8. Upper Register (Jawab) & Nikriz",
    subtitlePt: "Conquiste a 3ª Posição sobre o tampo (Jawab), domine o pentacorde simétrico de Nikriz e transponha modos livremente com o Shape Móvel.",
    subtitleEn: "Conquer 3rd Position over the soundboard (Jawab), master the symmetrical Nikriz pentachord, and transpose modes freely using the Movable Box.",
    lessons: [
      {
        id: "les_22_pos_third_body",
        moduleId: "mod_high_register_nikriz",
        number: 22,
        duration: "7 min",
        glossaryTerm: "anf_bajak",
        titlePt: "3ª Posição no Tampo (Jawab Agudo)",
        titleEn: "3rd Position Over Body (High Jawab)",
        summaryPt: "Acima da junta do tampo (10q), as distâncias entre semitons ficam mais curtas e o polegar esquerdo apoia na borda lateral do braço. É aqui que o Taqsim atinge seu clímax agudo (Jawab / Kardan).",
        summaryEn: "Past the body joint (10q), semitone spacing tightens and the left thumb anchors along the neck shoulder. This is where a Taqsim reaches its soaring upper climax (Jawab / Kardan).",
        taskPt: "Com a cápsula 'III · Tampo' isolada em Maqam Rast (C), toque lentamente a extensão aguda na 1ª e 2ª ordens com a Escuta 24-TET ligada. Note como 1 quarto de tom exige um deslocamento de dedo bem menor do que na 1ª Posição.",
        taskEn: "With the 'III · Body' pill isolated in Maqam Rast (C), slowly play the upper range on the 1st and 2nd courses with Live Pitch 24-TET on. Notice how a quarter tone requires a much finer finger spacing here than in 1st Position.",
        earTipPt: "Aproxime a ponta dos dedos sem tensionar o ombro e use a corda solta da 1ª ordem (c) como referência constante de oitava.",
        earTipEn: "Keep your fingers close together without raising your shoulder, checking your intonation against open 1st course (c) as an octave reference.",
        audioAction: "REGION",
        suggestDrone: true,
        suggestIqa: false,
        suggestLivePitch: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_rast",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "POS_THIRD_BODY",
          labelMode: "FINGER",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_23_maqam_nikriz",
        moduleId: "mod_high_register_nikriz",
        number: 23,
        duration: "8 min",
        glossaryTerm: "ghammaz",
        titlePt: "Maqam Nikriz & O Pivô Interno Hijaz",
        titleEn: "Maqam Nikriz & The Hidden Hijaz Pivot",
        summaryPt: "O Maqam Nikriz (C – D – Eb – F# – G) constrói uma tensão teatral com a 2ª aumentada entre o 3º e o 4º graus (Eb–F#). Seu segredo estrutural: começando no 2º grau (D), revela instantaneamente um Jins Hijaz completo!",
        summaryEn: "Maqam Nikriz (C – D – Eb – F# – G) builds theatrical tension via the augmented 2nd between degrees b3 and #4 (Eb–F#). Its structural secret: starting on degree 2 (D) instantly reveals a complete Jins Hijaz!",
        taskPt: "Ouça a frase 1. Istihlal do Nikriz em C, focando na resolução F# → G (Ghammaz). Depois abra o Radar de Modulação e teste o pivô '2º Grau (+1 Tom) → Jins Hijaz em D', voltando ao Qarar C em seguida.",
        taskEn: "Listen to Nikriz's phrase 1. Istihlal in C, emphasizing the F# → G (Ghammaz) pull. Then open the Modulation Radar and test the '2nd Degree (+1 Tone) → Jins Hijaz in D' pivot before returning to Qarar C.",
        earTipPt: "Treine o salto Eb–F# com os dedos 2 e 4 (ou 1 e 3 em 2ª posição) mantendo o F# bem colado no G para maximizar a atração para a dominante.",
        earTipEn: "Practice the Eb–F# stretch with fingers 2 and 4 (or 1 and 3 in 2nd position), keeping F# close to G to sharpen its pull into the dominant.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: false,
        openRadarHint: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_nikriz",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "DEGREE",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      },
      {
        id: "les_24_transposition_ayyub",
        moduleId: "mod_high_register_nikriz",
        number: 24,
        duration: "8 min",
        glossaryTerm: "iqa",
        titlePt: "Transposição (Taswir) & Iqa' Ayyub (2/4)",
        titleEn: "Transposition (Taswir) & Iqa' Ayyub (2/4)",
        summaryPt: "Na música árabe, transpor um Maqam para outra tônica chama-se Taswir (ex.: Hijaz em G — Hijaz 'ala Nawa — em vez do tradicional D). O Shape Móvel fechado permite levar a mesma digitação para qualquer ponto do braço.",
        summaryEn: "In Arabic theory, transposing a Maqam to a new tonic is called Taswir (e.g. Hijaz on G — Hijaz 'ala Nawa — instead of traditional D). The closed Movable Box lets you carry one fingering anywhere on the neck.",
        taskPt: "Aplique Maqam Hijaz transposto para G (rootQ=14) dentro do Shape Móvel (ancorado em 4q). Inicie o Iqa' Ayyub (2/4 hipnótico, base do transe Zikr/Sufi) a 112 BPM e toque frases curtas repetitivas acelerando gradualmente o fraseado.",
        taskEn: "Apply Maqam Hijaz transposed to G (rootQ=14) inside the Movable Box (anchored at 4q). Launch Iqa' Ayyub (hypnotic 2/4 Sufi/Zikr pulse) at 112 BPM and lock short repeating motifs into the groove.",
        earTipPt: "Para testar a autonomia da sua mão esquerda, abra 'Espelho & Guias' e deslize o controle 'Dedo 1' do Shape Móvel para 2q ou 6q — o desenho dos dedos continua idêntico!",
        earTipEn: "To test left-hand independence, open 'Fingerboard & Guides' and drag the Movable Box 'Finger 1' slider to 2q or 6q — the exact finger geometry stays intact!",
        audioAction: "TAQSIM",
        suggestDrone: false,
        suggestIqa: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_hijaz",
          rootQ: 14,
          direction: "ASC",
          shapeMode: "CLOSED_BOX",
          boxAnchorQ: 4,
          labelMode: "FINGER",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: true,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_ayyub",
          iqaKeyword: "ayyub",
          bpm: 112
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 9 — ESCOLAS & AFINAÇÕES HISTÓRICAS (MESTRE)
  // =========================================================================
  {
    id: "mod_schools_tunings",
    order: 9,
    level: "mastery",
    icon: "🏺",
    titlePt: "9. Escolas & Afinações Históricas",
    titleEn: "9. Historical Schools & Tunings",
    subtitlePt: "Compare as três grandes escolas do mundo do Oud — Cairo, Istambul e Bagdá — adaptando digitação, ressonância e afinação das 6 ordens.",
    subtitleEn: "Compare the three major Oud worlds — Cairo, Istanbul, and Baghdad — adapting fingering, resonance, and 6-course tunings.",
    lessons: [
      {
        id: "les_25_egyptian_cairo_school",
        moduleId: "mod_schools_tunings",
        number: 25,
        duration: "8 min",
        glossaryTerm: "sadaf_khatem",
        titlePt: "Escola do Cairo & Afinação Egípcia (D–c)",
        titleEn: "Cairo School & Egyptian Tuning (D–c)",
        summaryPt: "Na afinação Egípcia (D–G–A–d–g–c), os bordões graves em D e G funcionam como ressoadores perfeitos para o repertório clássico de Farid al-Atrash, Mohamed Abdel Wahab e Riyad al-Sunbati.",
        summaryEn: "In Egyptian tuning (D–G–A–d–g–c), the low D and G bass courses act as sympathetic drones ideally matched to the classical repertoire of Farid al-Atrash, Abdel Wahab, and Riyad al-Sunbati.",
        taskPt: "Observe como a 6ª ordem agora soa em D (oitava grave do Qarar de Bayati!) e a 5ª em G (oitava grave do Ghammaz). Toque a frase 2. Ghammaz intercalando notas graves na 6ª e 5ª ordens soltas para dar peso orquestral.",
        taskEn: "Notice the 6th course is now D (low octave of Bayati's Qarar!) and the 5th is G (low octave of the Ghammaz). Play phrase 2. Ghammaz punctuating rests with open 6th and 5th bass strokes for orchestral depth.",
        earTipPt: "Use o perfil sonoro Egípcio (Encorpado) e privilegie ligados de mão esquerda (martelados e puxados) para imitar a fluidez vocal do Tarab do Cairo.",
        earTipEn: "Keep the Egyptian (Warm) tone profile active and emphasize left-hand hammer-ons and pull-offs to mirror the vocal flow of Cairo Tarab.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: true,
        suggestTimbreCompare: true,
        preset: {
          tradition: "cairo",
          tuningKeywords: ["egip", "egypt", "cairo"],
          soundChar: "egyptian",
          mode: "MAQAM",
          entityId: "maqam_bayati",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "ARABIC",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 1,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_maqsum",
          iqaKeyword: "maqsum",
          bpm: 84
        }
      },
      {
        id: "les_26_turkish_istanbul_school",
        moduleId: "mod_schools_tunings",
        number: 26,
        duration: "8 min",
        glossaryTerm: "sikah_interval",
        titlePt: "Escola de Istambul & Afinação Turca (D–a)",
        titleEn: "Istanbul School & Turkish Tuning (D–a)",
        summaryPt: "O Ud turco possui escala ligeiramente mais curta, afinação um tom acima (D–E–A–B–e–a), ataque percussivo ágil e uso marcante de comas (microtons mais estreitos) em modos como Hicaz e Ussak.",
        summaryEn: "The Turkish Ud features a shorter scale length, tuning a whole step higher (D–E–A–B–e–a), agile percussive picking, and tighter comma inflections in modes like Hicaz and Ussak.",
        taskPt: "Observe como o mapa de casas do Maqam Hijaz em D se reorganiza na afinação Turca/Grega (D–E–A–B–e–a): a 6ª ordem vira a tônica grave D e a 3ª ordem vira B. Explore as novas digitações com o timbre Sírio (seco e articulado).",
        taskEn: "See how Maqam Hijaz in D remaps onto Turkish/Greek tuning (D–E–A–B–e–a): the 6th course becomes low tonic D and the 3rd becomes B. Explore these bright, brisk fingerings with the crisp Syrian tone profile.",
        earTipPt: "Na estética de Istambul (Yorgo Bacanos / Cinuçen Tanrıkorur), o ataque da Risha é mais leve e rápido, com ornamentos curtos (trinados e mordentes) sem pesar a mão direita.",
        earTipEn: "In the Istanbul aesthetic (Yorgo Bacanos / Cinuçen Tanrıkorur), keep the Risha feather-light and fast, favoring crisp trills and grace notes.",
        audioAction: "TAQSIM",
        suggestDrone: false,
        suggestIqa: false,
        suggestLivePitch: true,
        preset: {
          tradition: "istanbul",
          tuningKeywords: ["turk", "turc", "istanb", "greg"],
          soundChar: "syrian",
          mode: "MAQAM",
          entityId: "maqam_hijaz",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "NOTE_NAME",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      },
      {
        id: "les_27_iraqi_baghdad_school",
        moduleId: "mod_schools_tunings",
        number: 27,
        duration: "8 min",
        glossaryTerm: "shamsiyya",
        titlePt: "Escola de Bagdá / Mounir Bashir (F–f)",
        titleEn: "Baghdad School / Mounir Bashir (F–f)",
        summaryPt: "A escola iraquiana (Jamil & Mounir Bashir, Naseer Shamma) usa ponte flutuante, afinação F–C–d–g–c–f (com 1ª ordem aguda em F e bordões em quintas/oitavas) e prioriza silêncio, espaço meditativo e clareza polifônica.",
        summaryEn: "The Iraqi school (Jamil & Mounir Bashir, Naseer Shamma) favors a floating bridge, F–C–d–g–c–f tuning (high F 1st course and open-fifth bass), and spacious, meditative phrasing with crystalline clarity.",
        taskPt: "Com a afinação Iraquiana ativa em Maqam Kurd (D), observe a extensão extra alcançada na 1ª ordem aguda (f) e o bordão grave em F/C. Pratique a frase 3. Qafla deixando pausas longas (respiração) entre cada motivo.",
        taskEn: "With Iraqi tuning active in Maqam Kurd (D), notice the expanded upper range on the high 1st course (f) and deep F/C bass. Play phrase 3. Qafla leaving generous silences between motifs.",
        earTipPt: "Na estética de Mounir Bashir, o silêncio depois da nota tem o mesmo peso musical que a nota tocada — deixe a caixa acústica ressoar até o fim.",
        earTipEn: "In Mounir Bashir's aesthetic, the silence after a note carries as much musical weight as the note itself — let the soundboard decay naturally.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: false,
        preset: {
          tradition: "cairo",
          tuningKeywords: ["iraq", "mounir", "munir", "bagd"],
          soundChar: "syrian",
          mode: "MAQAM",
          entityId: "maqam_kurd",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "FINGER",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: true,
          sayrPhraseIndex: 2,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 10 — A ARTE DO TAQSIM & RECITAL FINAL (MESTRE)
  // =========================================================================
  {
    id: "mod_taqsim_mastery",
    order: 10,
    level: "mastery",
    icon: "👑",
    titlePt: "10. A Arte do Taqsim & Recital",
    titleEn: "10. The Art of Taqsim & Recital",
    subtitlePt: "Reúna toda a jornada em improvisação livre (Taqsim): dramaturgia em 4 atos, cadeias de modulação e concerto em Modo Imersivo.",
    subtitleEn: "Bring the entire journey together in free improvisation (Taqsim): 4-act dramatic arc, chained modulations, and a Zen Stage recital.",
    lessons: [
      {
        id: "les_28_taqsim_architecture",
        moduleId: "mod_taqsim_mastery",
        number: 28,
        duration: "9 min",
        glossaryTerm: "taqsim",
        titlePt: "Arquitetura do Taqsim em 4 Atos",
        titleEn: "Taqsim Architecture in 4 Acts",
        summaryPt: "Um Taqsim clássico conta uma história em 4 atos claros: 1) Istihlal (apresentação calma no 1º Jins grave), 2) Ghammaz (tensão e diálogo no 2º Jins), 3) Jawab (clímax na oitava aguda / 3ª Posição) e 4) Qafla (descida cadencial ao Qarar).",
        summaryEn: "A classical Taqsim tells a story in 4 clear acts: 1) Istihlal (calm opening in the lower Jins), 2) Ghammaz (tension on the upper Jins), 3) Jawab (octave climax in 3rd Position), and 4) Qafla (cadential descent home).",
        taskPt: "Restaurando a afinação Síria (C–c) em Maqam Rast com nomes árabes, ligue o Drone em C e improvise 20 segundos em cada ato: comece apenas entre C–G (1ª Pos), suba para G–c (2ª Pos), visite o agudo c–g (3ª Pos) e desça trocando B- por Bb até o Qarar C.",
        taskEn: "Back in Syrian tuning (C–c) on Maqam Rast with Arabic names, turn on the C Drone and spend 20 seconds per act: stay within C–G (1st Pos), expand to G–c (2nd Pos), peak in c–g (3rd Pos), then descend via Bb back to Qarar C.",
        earTipPt: "Não entregue a nota mais aguda logo no início: guarde o registro de 3ª Posição para o terceiro ato para criar verdadeira curva dramática.",
        earTipEn: "Resist revealing your highest note too early: save 3rd Position for Act 3 to build genuine dramatic momentum.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: false,
        openRadarHint: true,
        preset: {
          tuningId: "syrian_arabic_c_c",
          tradition: "damascus",
          mode: "MAQAM",
          entityId: "maqam_rast",
          rootQ: 0,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "ARABIC",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      },
      {
        id: "les_29_chained_modulation",
        moduleId: "mod_taqsim_mastery",
        number: 29,
        duration: "10 min",
        glossaryTerm: "ghammaz",
        titlePt: "Modulação Encadeada (Bayati → Hijaz → Saba)",
        titleEn: "Chained Modulation (Bayati → Hijaz → Saba)",
        summaryPt: "O ápice do domínio modal (Intiqal) é encadear múltiplas cores dentro de um único Taqsim sem perder o fio condutor do Qarar original — viajando do lirismo do Bayati ao drama do Hijaz e à pungência do Saba.",
        summaryEn: "The pinnacle of modal command (Intiqal) is chaining multiple colors inside one Taqsim without losing your original Qarar — traveling from Bayati's lyricism to Hijaz's drama and Saba's poignancy.",
        taskPt: "Ligue o Drone em D e estabeleça Maqam Bayati. Abra o Radar de Modulação e faça o percurso completo em 3 paradas: 1) Jins Hijaz no Ghammaz G (Bayati Shuri) → 2) Volte e entre em Maqam Saba em D (b4) → 3) Use '↩ Voltar à Origem' para encerrar no Bayati em D.",
        taskEn: "Turn on the D Drone and establish Maqam Bayati. Open the Modulation Radar for a 3-stop journey: 1) Jins Hijaz on Ghammaz G (Bayati Shuri) → 2) Shift into Maqam Saba on D (b4) → 3) Hit '↩ Return to Origin' to close on Bayati in D.",
        earTipPt: "Ao retornar para a tônica original, enfatize bem o grau característico que diferencia o retorno (a 4ª justa G depois do Gb do Saba) para o ouvinte sentir o alívio da volta para casa.",
        earTipEn: "On the way home, highlight the exact pitch that restores the home mode (natural G after Saba's Gb) so the listener feels the emotional release.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: false,
        openRadarHint: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_bayati",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "DEGREE",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 1,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true
        }
      },
      {
        id: "les_30_master_recital",
        moduleId: "mod_taqsim_mastery",
        number: 30,
        duration: "10 min",
        glossaryTerm: "qafla",
        titlePt: "Recital Final — Saba, Sama'i & Zen Stage",
        titleEn: "Final Recital — Saba, Sama'i & Zen Stage",
        summaryPt: "Parabéns por chegar à lição 30! Este recital final reúne tudo o que você dominou: microtonalidade expressiva (Maqam Saba), pulso assimétrico (Sama'i Thaqil 10/8), escuta 24-TET ao vivo e palco limpo em Modo Imersivo (Zen).",
        summaryEn: "Congratulations on reaching Lesson 30! This final recital unites everything you mastered: expressive microtonality (Maqam Saba), asymmetric groove (Sama'i Thaqil 10/8), Live Pitch 24-TET, and distraction-free Zen Stage.",
        taskPt: "1) Comece livremente sem ritmo fazendo um Istihlal em Maqam Saba (D) com a Escuta 24-TET ligada; 2) Clique em '🪷 Entrar no Modo Imersivo (Zen)' para limpar a tela; 3) Dispare o Iqa' Sama'i Thaqil (10/8) a 78 BPM no HUD flutuante e improvise 2 minutos concluindo com a Qafla.",
        taskEn: "1) Open freely without rhythm playing an Istihlal in Maqam Saba (D) with Live Pitch 24-TET on; 2) Click '🪷 Enter Zen Stage' to clear the screen; 3) Launch Iqa' Sama'i Thaqil (10/8) at 78 BPM from the floating HUD and improvise for 2 minutes ending on the Qafla.",
        earTipPt: "A partir daqui, o aplicativo é o seu estúdio pessoal: combine livremente o Radar de Modulação, o Caminho de 1 Oitava (duplo clique em qualquer joia) e o Modo Linha (DI) para gravar e refinar sua própria voz no Oud.",
        earTipEn: "From here on, the app is your personal studio: freely combine the Modulation Radar, 1-Octave Path (double-click any jewel), and Line (DI) mode to refine your own voice on the Oud.",
        audioAction: "TAQSIM",
        suggestDrone: false,
        suggestIqa: true,
        suggestLivePitch: true,
        suggestZenMode: true,
        openRadarHint: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_saba",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "NOTE_NAME",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 2,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_samai_thaqil",
          iqaKeyword: "samai",
          bpm: 78
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 11 — MODOS OCIDENTAIS, FOLK & ROCK MODAL (MUNDO & FUSÃO)
  // =========================================================================
  {
    id: "mod_world_modes_folk",
    order: 11,
    level: "world",
    icon: "🌍",
    titlePt: "11. Modos Ocidentais, Folk & Rock Modal",
    titleEn: "11. Western Modes, Folk & Modal Rock",
    subtitlePt: "Leve o Oud para além do Oriente Médio: domine Dórico, Eólio, Lídio, Mixolídio e Power Voicings usando cordas soltas e shapes móveis 12-TET.",
    subtitleEn: "Take the Oud beyond the Middle East: master Dorian, Aeolian, Lydian, Mixolydian, and Power Voicings using open courses and 12-TET movable shapes.",
    lessons: [
      {
        id: "les_31_dorian_aeolian_folk",
        moduleId: "mod_world_modes_folk",
        number: 31,
        duration: "6 min",
        glossaryTerm: "maqam",
        titlePt: "Modo Dórico & Folk Celta / Modal",
        titleEn: "Dorian Mode & Celtic / Modal Folk",
        summaryPt: "O Modo Dórico em D (D–E–F–G–A–B–C) é o modo menor mais versátil do Folk celta, Rock modal e trilhas cinematográficas. A 6ª maior (B natural) ilumina o modo sem perder a força melancólica.",
        summaryEn: "D Dorian (D–E–F–G–A–B–C) is the most versatile minor mode in Celtic folk, modal rock, and film scoring. Its natural 6th (B) brightens the minor frame without losing depth.",
        taskPt: "Com D Dórico na 1ª Posição e o Drone em D ligado, alterne frases entre a 3ª ordem (D solto) e a 2ª ordem (G solto), destacando o salto expressivo F → B (6ª maior). Experimente usar a 4ª ordem (A) como bordão rítmico.",
        taskEn: "With D Dorian in 1st Position and the D Drone active, weave phrases across open 3rd (D) and 2nd (G) courses, spotlighting the expressive F → B (major 6th) color. Use open 4th course (A) as a rhythmic drone.",
        earTipPt: "Para soar idiomático no Folk/Rock modal, use palhetada alternada constante (colcheias em ↓↑) deixando a corda D solta ressoar junto com a melodia.",
        earTipEn: "For idiomatic Folk/modal Rock drive, keep steady alternating eighth-note Risha (↓↑) while letting open D ring sympathetically underneath.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: true,
        preset: {
          tuningId: "syrian_arabic_c_c",
          mode: "SCALE",
          entityKeywords: ["dorian", "dorico"],
          rootQ: 4,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "DEGREE",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          iqaId: "iqa_waltz_34",
          iqaKeyword: "waltz",
          bpm: 102
        }
      },
      {
        id: "les_32_lydian_mixolydian_open",
        moduleId: "mod_world_modes_folk",
        number: 32,
        duration: "6 min",
        glossaryTerm: "qarar",
        titlePt: "Lídio (#4) & Mixolídio — Paisagens Abertas",
        titleEn: "Lydian (#4) & Mixolydian — Open Soundscapes",
        summaryPt: "O Modo Lídio (1–2–3–#4–5–6–7) cria atmosferas cinematográficas e etéreas no Oud. A 4ª aumentada (F# em C) evita a gravidade fechada da escala maior e flutua com naturalidade sobre bordões abertos.",
        summaryEn: "The Lydian Mode (1–2–3–#4–5–6–7) creates cinematic, weightless atmospheres on the Oud. Its raised 4th (F# in C) lifts away from standard major gravity and floats effortlessly over open drones.",
        taskPt: "Ligue o Drone em C e toque lentamente o arpejo C – E – G – B – F# no espelho completo. Depois abra 'Modalidade → Modos' e troque para Mixolídio para comparar a #4 luminosa do Lídio com a b7 terrosa do Mixolídio.",
        taskEn: "Enable the C Drone and slowly arpeggiate C – E – G – B – F# across the full neck. Then open 'Mode / Maqam → Modes' and switch to Mixolydian to contrast Lydian's soaring #4 against Mixolydian's earthy b7.",
        earTipPt: "Use o timbre Egípcio (Encorpado) e ataque próximo à roseta para maximizar a sustentação das notas longas e harmônicos abertos.",
        earTipEn: "Use the Egyptian (Warm) tone profile and pluck near the main rosette to maximize sustain on long ringing notes.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: false,
        suggestTimbreCompare: true,
        preset: {
          mode: "SCALE",
          entityKeywords: ["lydian", "lidio"],
          rootQ: 0,
          shapeMode: "FULL_NECK",
          labelMode: "NOTE_NAME",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          soundChar: "egyptian"
        }
      },
      {
        id: "les_33_power_voicings_box",
        moduleId: "mod_world_modes_folk",
        number: 33,
        duration: "7 min",
        glossaryTerm: "anf_bajak",
        titlePt: "Power Voicings (1–5) & Shapes Móveis 12-TET",
        titleEn: "Power Voicings (1–5) & 12-TET Movable Shapes",
        summaryPt: "Como as 4 ordens agudas do Oud (A–d–g–c) são afinadas em quartas justas (como um baixo ou as cordas graves da guitarra), qualquer Power Chord (1–5) ou Sus4 forma um desenho geométrico fixo e transportável pelo braço.",
        summaryEn: "Because the Oud's upper four courses (A–d–g–c) are tuned in perfect fourths (like a bass or lower guitar strings), any Power Chord (1–5) or Sus4 forms a clean movable shape across the entire neck.",
        taskPt: "Com o voicing aberto (1–5) no Shape Móvel (Dedo 1 em 4q), pratique o rasgueio curto de 2 ordens e deslize o mesmo desenho para frente e para trás no braço mantendo a distância exata entre o dedo 1 (tônica) e o dedo 3 (quinta justa).",
        taskEn: "With the open 1–5 voicing in the Movable Box (Finger 1 at 4q), practice tight 2-course strums and slide the exact same shape up and down the neck keeping finger 1 (root) and finger 3 (fifth) locked.",
        earTipPt: "Abafe levemente a caixa com a lateral da palma direita (palm mute suave) para criar grooves rítmicos de Folk/Rock sem perder a clareza das cordas duplas.",
        earTipEn: "Apply a light right-hand palm mute near the bridge for punchy Folk/Rock rhythmic grooves without muddying the double courses.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: true,
        preset: {
          mode: "CHORD",
          entityId: "chord_power_5",
          entityKeywords: ["power", "5", "sus4"],
          rootQ: 4,
          shapeMode: "CLOSED_BOX",
          boxAnchorQ: 4,
          labelMode: "FINGER",
          chordVoicingOnly: true,
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          iqaId: "iqa_baladi",
          iqaKeyword: "baladi",
          bpm: 96
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 12 — BLUES, PENTATÔNICAS & BLUE NOTES MICROTONAIS
  // =========================================================================
  {
    id: "mod_world_blues_micro",
    order: 12,
    level: "world",
    icon: "🎸",
    titlePt: "12. Blues, Pentatônicas & Blue Notes",
    titleEn: "12. Blues, Pentatonics & Blue Notes",
    subtitlePt: "Descubra o superpoder do Oud sem trastes no Blues: pentatônicas ágeis, blue notes microtonais autênticas (sem precisar de bend) e diálogo de pergunta-e-resposta.",
    subtitleEn: "Unlock the fretless Oud's superpower in Blues: agile pentatonics, authentic microtonal blue notes (no bending required), and call-and-response phrasing.",
    lessons: [
      {
        id: "les_34_pentatonics_fretless",
        moduleId: "mod_world_blues_micro",
        number: 34,
        duration: "6 min",
        glossaryTerm: "anf_bajak",
        titlePt: "Pentatônica Menor no Braço Sem Trastes",
        titleEn: "Minor Pentatonic on the Fretless Neck",
        summaryPt: "Sem semitons para gerar conflito harmônico, a Pentatônica Menor (1–b3–4–5–b7) é a porta mais imediata para improvisar sobre Blues, Rock, Pop ou grooves africanos (como o Desert Blues do Mali).",
        summaryEn: "With no semitones to clash harmonically, the Minor Pentatonic (1–b3–4–5–b7) is the fastest gateway into Blues, Rock, Pop, and Saharan grooves (like Malian Desert Blues).",
        taskPt: "Em D Pentatônica Menor (D–F–G–A–C) na 1ª Posição, toque padrões de 3 notas subindo (D–F–G, F–G–A, G–A–C) aproveitando as cordas soltas D, G, A e c. Depois teste o mesmo desenho no Shape Móvel fechado.",
        taskEn: "In D Minor Pentatonic (D–F–G–A–C) in 1st Position, play 3-note ascending groupings (D–F–G, F–G–A, G–A–C) leveraging open D, G, A, and c. Then test the exact same pattern inside the closed Movable Box.",
        earTipPt: "Para soar como Blues do Sahel (Ali Farka Touré / Tinariwen), acentue os contratempos com golpes ascendentes (↑) bem definidos na Risha.",
        earTipEn: "For a Sahel Desert Blues feel (Ali Farka Touré / Tinariwen), accent offbeats with crisp upstrokes (↑) on the Risha.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: false,
        preset: {
          mode: "SCALE",
          entityId: "scale_pentatonic_minor",
          entityKeywords: ["pentatonic_minor", "pentatonica menor"],
          rootQ: 4,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "FINGER",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_35_microtonal_blue_notes",
        moduleId: "mod_world_blues_micro",
        number: 35,
        duration: "7 min",
        glossaryTerm: "sikah_interval",
        titlePt: "Blue Notes Reais (Terça & Sétima Neutras 24-TET)",
        titleEn: "True Blue Notes (Neutral 3rd & 7th 24-TET)",
        summaryPt: "Na guitarra com trastes, o músico precisa esticar a corda (bend) para buscar a blue note entre b3 e 3. No Oud sem trastes, você toca a terça neutra (3-) e a sétima neutra (7-) diretamente — conectando o Delta Blues à raiz microtonal do Maqam Rast e da África Ocidental!",
        summaryEn: "On a fretted guitar, players must bend strings to reach the blue note between b3 and 3. On a fretless Oud, you stop the neutral 3rd (3-) and neutral 7th (7-) directly — bridging Delta Blues with Maqam Rast and West African traditions!",
        taskPt: "Aplique a escala Blues Microtonal 24-TET em C, ligue o Drone em C e a Escuta 24-TET. Pratique deslizar suavemente (Zahfa) de Eb para E- (3-) e de Gb (b5) para G (5), observando o ponteiro travar no centro da estrela ameixa.",
        taskEn: "Apply Microtonal Blues 24-TET in C, turn on the C Drone and Live Pitch 24-TET. Glide smoothly (Zahfa) from Eb into E- (3-) and from Gb (b5) into G (5), watching the live pointer lock onto the plum star.",
        earTipPt: "Toque um riff lento em C usando apenas 4 notas: C – E- – F – Gb – G. Sinta como o E- neutro entrega o lamento autêntico do Blues acústico sem esforço mecânico.",
        earTipEn: "Play a slow riff in C using just C – E- – F – Gb – G. Feel how the neutral E- delivers authentic acoustic Blues grit effortlessly.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: false,
        suggestLivePitch: true,
        preset: {
          mode: "SCALE",
          entityId: "scale_blues_micro",
          entityKeywords: ["blues_micro", "microtonal"],
          rootQ: 0,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "DEGREE",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_36_blues_shuffle_bass",
        moduleId: "mod_world_blues_micro",
        number: 36,
        duration: "7 min",
        glossaryTerm: "iqa",
        titlePt: "Blues — Call & Response & Bordões Graves",
        titleEn: "Blues — Call & Response & Bass Courses",
        summaryPt: "A forma tradicional do Blues nasce do diálogo entre uma 'chamada' melódica nas cordas agudas e uma 'resposta' percussiva nos bordões graves (C–F–A). No Oud, os bordões graves substituem o polegar do violão fingerstyle.",
        summaryEn: "Traditional Blues phrasing thrives on a 'call' in the treble courses answered by a gritty 'response' on the bass courses (C–F–A). On the Oud, open bass strokes anchor the groove like a fingerstyle blues thumb.",
        taskPt: "Em D Blues (D–F–G–Ab–A–C) no espelho completo, inicie o pulso rítmico a 84 BPM. Toque uma frase curta de 3 notas na 2ª/1ª ordens (chamada) e responda com um golpe grave firme na 3ª ordem (D) ou 4ª ordem (A) no tempo forte.",
        taskEn: "In D Blues (D–F–G–Ab–A–C) on the full neck, launch the rhythm at 84 BPM. Play a short 3-note treble motif (call) and answer with a resonant low strike on open D or A on the downbeat.",
        earTipPt: "Explore o contraste de dinâmica: deixe o Ab (b5) soar curto e picado antes de cair no G ou subir com deslize para o A.",
        earTipEn: "Play with dynamics: keep the Ab (b5) crisp and staccato before dropping to G or sliding up into A.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: true,
        preset: {
          mode: "SCALE",
          entityId: "scale_blues",
          entityKeywords: ["scale_blues", "blues"],
          rootQ: 4,
          shapeMode: "FULL_NECK",
          labelMode: "NOTE_NAME",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          iqaId: "iqa_baladi",
          iqaKeyword: "baladi",
          bpm: 84
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 13 — MEDITERRÂNEO, ANDALUZIA & FLAMENCO
  // =========================================================================
  {
    id: "mod_world_med_flamenco",
    order: 13,
    level: "world",
    icon: "💃",
    titlePt: "13. Mediterrâneo, Andaluzia & Flamenco",
    titleEn: "13. Mediterranean, Andalusia & Flamenco",
    subtitlePt: "Viaje de Córdoba ao Mar Egeu: a herança de Ziryab na Cadência Andaluza, Frígio Dominante com ataque percussivo e os dromoi gregos do Rebetiko sobre Tsifteteli.",
    subtitleEn: "Journey from Córdoba to the Aegean: Ziryab's legacy in the Andalusian Cadence, Phrygian Dominant percussive attack, and Greek Rebetiko dromoi over Tsifteteli.",
    lessons: [
      {
        id: "les_37_ziryab_andalusian",
        moduleId: "mod_world_med_flamenco",
        number: 37,
        duration: "7 min",
        glossaryTerm: "qafla",
        titlePt: "De Ziryab a Córdoba — Cadência Andaluza",
        titleEn: "From Ziryab to Córdoba — Andalusian Cadence",
        summaryPt: "No século IX, o mestre Ziryab levou o Oud de Bagdá a Córdoba (Al-Andalus), adicionou a 5ª ordem e plantou as sementes da música andaluza e do Flamenco. A célebre Cadência Andaluza (iv – bIII – bII – I) é irmã direta da Qafla de Hijaz/Kurd.",
        summaryEn: "In the 9th century, master Ziryab brought the Oud from Baghdad to Córdoba (Al-Andalus), adding the 5th course and sowing the seeds of Andalusian music and Flamenco. The famous Andalusian Cadence (iv – bIII – bII – I) mirrors the Hijaz/Kurd Qafla.",
        taskPt: "Aplique a Cadência de Hijaz/Andaluza em D sobre o ciclo Tangos/Rumba Flamenca (104 BPM). Clique em cada passo do Sequenciador acima do braço para treinar a descida G–F–Eb–D e depois dispare a Qafla completa com rasgueios firmes.",
        taskEn: "Apply the Hijaz/Andalusian Cadence in D over Tangos/Rumba Flamenca (104 BPM). Click each Sequencer step above the neck to drill the G–F–Eb–D descent, then launch the full Qafla with crisp strums.",
        earTipPt: "No último acorde (I Maior), acentue a chegada do Eb (bII) para o D (I) deixando a 3ª ordem solta ressoar como fechamento dramático.",
        earTipEn: "On the final resolution (bII → I), emphasize the half-step drop from Eb down to D letting open D ring out boldly.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: true,
        preset: {
          mode: "CADENCE",
          entityKeywords: ["hijaz", "kurd"],
          rootQ: 4,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "NOTE_NAME",
          chordVoicingOnly: true,
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          iqaId: "iqa_rumba_flamenca",
          iqaKeyword: "rumba",
          bpm: 100
        }
      },
      {
        id: "les_38_phrygian_dom_picado",
        moduleId: "mod_world_med_flamenco",
        number: 38,
        duration: "7 min",
        glossaryTerm: "risha",
        titlePt: "Frígio Dominante & Picado de Risha",
        titleEn: "Phrygian Dominant & Risha Picado",
        summaryPt: "O Modo Frígio Dominante (1–b2–3–4–5–b6–b7) é a face 12-TET do Maqam Hijaz no Flamenco (onde é chamado Modo Flamenco / Por Medio). Ele exige ataque percussivo rápido de Risha (equivalente ao picado do violão flamenco).",
        summaryEn: "Phrygian Dominant (1–b2–3–4–5–b6–b7) is Maqam Hijaz's 12-TET twin in Flamenco (Por Medio). It thrives on brisk, percussive alternating Risha picking akin to flamenco guitar picado.",
        taskPt: "Com Frígio Dominante em D (D–Eb–F#–G–A–Bb–C) e timbre Sírio (seco e articulado), ligue o ritmo Rumba Flamenca a 108 BPM. Pratique corridas descendentes rápidas (A–G–F#–Eb–D) em palhetada estritamente alternada (↓↑↓↑).",
        taskEn: "With D Phrygian Dominant (D–Eb–F#–G–A–Bb–C) and the crisp Syrian tone profile, launch Rumba Flamenca at 108 BPM. Drill brisk descending runs (A–G–F#–Eb–D) using strict alternating Risha (↓↑↓↑).",
        earTipPt: "Para imitar a energia do Flamenco no Oud, aproxime a Risha do cavalete e acentue o 3º tempo de cada grupo de 4 semicolcheias.",
        earTipEn: "To channel Flamenco fire on the Oud, pluck closer to the bridge and accent the offbeats inside fast 16th-note runs.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: true,
        preset: {
          mode: "SCALE",
          entityId: "scale_phrygian_dominant",
          entityKeywords: ["phrygian_dominant", "frigio dominante"],
          rootQ: 4,
          shapeMode: "FULL_NECK",
          labelMode: "FINGER",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          soundChar: "syrian",
          iqaId: "iqa_rumba_flamenca",
          iqaKeyword: "rumba",
          bpm: 108
        }
      },
      {
        id: "les_39_rebetiko_tsifteteli",
        moduleId: "mod_world_med_flamenco",
        number: 39,
        duration: "8 min",
        glossaryTerm: "iqa",
        titlePt: "Rebetiko Grego, Dromoi & Tsifteteli (8/4)",
        titleEn: "Greek Rebetiko, Dromoi & Tsifteteli (8/4)",
        summaryPt: "Nos portos de Esmirna e do Pireu (Atenas), o Oud (Outi) foi peça central do Rebetiko e da música Smyrneika. Os modos gregos (Dromoi, como Hitzaz e Ousak) compartilham a mesma família modal do Oriente Médio, pulsando sobre o ciclo lento Tsifteteli (8/4).",
        summaryEn: "In the port cities of Smyrna and Piraeus (Athens), the Oud (Outi) anchored Rebetiko and Smyrneika music. Greek modes (Dromoi like Hitzaz and Ousak) share Eastern modal DNA, swaying over the slow Tsifteteli (8/4) cycle.",
        taskPt: "Com a afinação Turca/Grega (D–E–A–B–e–a) em Hitzaz/Hijaz (D) e o ritmo Chiftetelli/Tsifteteli a 86 BPM, toque frases longas e arrastadas (Taximi) com ornamentos curtos na mão esquerda, repousando sempre no tempo 1 (DUM longo).",
        taskEn: "With Turkish/Greek tuning (D–E–A–B–e–a) in Hitzaz/Hijaz (D) and Chiftetelli/Tsifteteli at 86 BPM, weave unhurried Taximi phrases with crisp grace notes, landing cleanly on beat 1 (long DUM).",
        earTipPt: "No estilo Smyrneika, use trêmulo curto (Risha rápida) apenas nas notas de chegada mais longas para sustentar a emoção sobre o balanço lento do 8/4.",
        earTipEn: "In the Smyrneika style, add brief tremolo bursts only on long arrival notes to sustain emotion over the slow 8/4 sway.",
        audioAction: "TAQSIM",
        suggestDrone: false,
        suggestIqa: true,
        openRadarHint: true,
        preset: {
          tradition: "istanbul",
          tuningKeywords: ["turk", "turc", "greg"],
          soundChar: "syrian",
          mode: "MAQAM",
          entityId: "maqam_hijaz",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "NOTE_NAME",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: false,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_chiftetelli",
          iqaKeyword: "chiftetelli",
          bpm: 86
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 14 — JAZZ MODAL, HARMONIA ESTENDIDA & OUD TRIO (MUNDO & FUSÃO)
  // =========================================================================
  {
    id: "mod_world_jazz_modal",
    order: 14,
    level: "world",
    icon: "🎷",
    titlePt: "14. Jazz Modal & Oud Trio Contemporâneo",
    titleEn: "14. Modal Jazz & Contemporary Oud Trio",
    subtitlePt: "Aplique a linguagem do Jazz modal e do Oud Trio moderno: centros modais prolongados, tétrades (maj7, m7, 7) e condução de vozes expressiva.",
    subtitleEn: "Apply Modal Jazz and modern Oud Trio aesthetics: extended modal centers, seventh chords (maj7, m7, 7), and singing voice leading.",
    lessons: [
      {
        id: "les_40_modal_jazz_dorian",
        moduleId: "mod_world_jazz_modal",
        number: 40,
        duration: "7 min",
        glossaryTerm: "maqam",
        titlePt: "Jazz Modal (So What / Dórico & Lídio no Oud)",
        titleEn: "Modal Jazz (So What / Dorian & Lydian on Oud)",
        summaryPt: "No Jazz modal (Miles Davis / Bill Evans / Wayne Shorter), em vez de correr por cadências rápidas II–V–I, o solista permanece por longos trechos sobre um único centro modal (como D Dórico ou C Lídio), explorando cor, espaço e timbre.",
        summaryEn: "In Modal Jazz (Miles Davis / Bill Evans / Wayne Shorter), rather than rushing through rapid II–V–I changes, soloists dwell over a single modal center (like D Dorian or C Lydian), sculpting space, color, and tone.",
        taskPt: "Com o Drone em D ligado e D Dórico ativo na 1ª Posição, improvise frases de 2 a 4 compassos usando intervalos de 4ª justa e 6ª maior (B natural). Evite resolver no semitom e deixe os finais de frase pairarem no ar.",
        taskEn: "With the D Drone on and D Dorian active in 1st Position, improvise 2-to-4 bar phrases highlighting fourths and natural 6th (B). Avoid tonal clichés and let phrase endings hang in open space.",
        earTipPt: "No Jazz modal, o espaço entre as frases é tão importante quanto as notas — respire por 1 ou 2 tempos após cada ideia melódica.",
        earTipEn: "In Modal Jazz, space between phrases matters as much as the notes — breathe for 1 or 2 beats after each melodic idea.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: false,
        preset: {
          mode: "SCALE",
          entityKeywords: ["dorian", "dorico"],
          rootQ: 4,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "NOTE_NAME",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_41_seventh_chords_arpeggios",
        moduleId: "mod_world_jazz_modal",
        number: 41,
        duration: "7 min",
        glossaryTerm: "qarar",
        titlePt: "Tétrades (Maj7, m7, 7) & Arpejos Expressivos",
        titleEn: "Seventh Chords (Maj7, m7, 7) & Arpeggios",
        summaryPt: "As tétrades com sétima (1–3–5–7 no Maj7; 1–b3–5–b7 no m7 e Dominante 7) adicionam cor sofisticada ao Oud. Arpejar essas notas em sequência destaca a 3ª e a 7ª — os 'guide tones' que definem a qualidade do acorde.",
        summaryEn: "Seventh chords (1–3–5–7 on Maj7; 1–b3–5–b7 on m7 and Dominant 7) bring rich harmonic color to the Oud. Arpeggiating them highlights the 3rd and 7th — the guide tones that define chord quality.",
        taskPt: "Aplique o acorde Maj7 em C (1–3–5–7) e clique em '🔊 Ouvir Exemplo' para ouvir o arpejo. Depois abra 'Modalidade → Acordes' e compare m7 e Dominante 7 ouvindo como a mudança da 3ª e da 7ª transforma o clima.",
        taskEn: "Apply C Maj7 (1–3–5–7) and click '🔊 Play Example' to hear the arpeggio. Then open 'Mode / Maqam → Chords' and compare m7 and Dominant 7 to hear how the 3rd and 7th shift the harmonic mood.",
        earTipPt: "Ao tocar arpejos no Oud, sustente a nota anterior pelo máximo de tempo possível (legato de mão esquerda) para criar um efeito de harpa ou piano.",
        earTipEn: "When arpeggiating on the Oud, hold each finger down as long as possible (legato) to create a flowing harp- or piano-like shimmer.",
        audioAction: "ARPEGGIO",
        suggestDrone: false,
        suggestIqa: false,
        preset: {
          mode: "CHORD",
          entityId: "chord_maj7",
          entityKeywords: ["maj7", "m7", "dom7"],
          rootQ: 0,
          shapeMode: "FULL_NECK",
          labelMode: "DEGREE",
          chordVoicingOnly: false,
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_42_contemporary_oud_trio",
        moduleId: "mod_world_jazz_modal",
        number: 42,
        duration: "8 min",
        glossaryTerm: "taqsim",
        titlePt: "Oud Trio Contemporâneo (Estética Brahem & Fusão)",
        titleEn: "Contemporary Oud Trio (Brahem & Fusion Aesthetic)",
        summaryPt: "Na formação de Oud Trio (Oud, contrabaixo acústico e percussão/sopros), o Oud assume papel híbrido: ora acompanha com voicings abertos e bordões, ora canta melodias líricas próximas ao Jazz, à música de câmara e ao Maqam.",
        summaryEn: "In an Oud Trio (Oud, upright bass, and percussion/winds), the Oud plays a dual role: accompanying with open voicings and bass pedals while singing lyrical melodies bridging Jazz, chamber music, and Maqam.",
        taskPt: "Com a escala Menor Melódica em C e o timbre Egípcio ativo, toque motivos melódicos cantáveis na 2ª posição alternando intervalos de terça, sexta e oitava, imaginando um contrabaixo sustentando a fundamental.",
        taskEn: "With C Melodic Minor and the warm Egyptian tone active, play singing motifs in 2nd Position weaving thirds, sixths, and octaves as if an upright bass were anchoring the root below.",
        earTipPt: "Equilibre o volume da Risha como se estivesse tocando em um trio acústico intimista — a sutileza dinâmica aproxima o Oud do Jazz de câmara.",
        earTipEn: "Balance your Risha dynamics as in an intimate acoustic trio — subtle touch brings the Oud right into chamber Jazz territory.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: true,
        suggestTimbreCompare: true,
        preset: {
          mode: "SCALE",
          entityId: "scale_melodic_minor",
          entityKeywords: ["melodic_minor", "melodica"],
          rootQ: 0,
          shapeMode: "POS_SECOND",
          labelMode: "NOTE_NAME",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          soundChar: "egyptian",
          iqaId: "iqa_waltz_34",
          iqaKeyword: "waltz",
          bpm: 92
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 15 — MÚSICA BRASILEIRA NO OUD: NORDESTE, CHORO & BOSSA
  // =========================================================================
  {
    id: "mod_world_brazilian_oud",
    order: 15,
    level: "world",
    icon: "🇧🇷",
    titlePt: "15. Música Brasileira no Oud (Nordeste, Choro & Bossa)",
    titleEn: "15. Brazilian Music on Oud (Northeast, Choro & Bossa)",
    subtitlePt: "Faça o diálogo entre o Oud e a música brasileira: o Lídio b7 do Nordeste/Baião, o contraponto grave do Choro e a harmonia aberta da Bossa Nova.",
    subtitleEn: "Bridge the Oud with Brazilian music: Northeastern Lydian b7 & Baião, Choro bass counterpoint, and open Bossa Nova harmony.",
    lessons: [
      {
        id: "les_43_nordestino_lydian_b7_baiao",
        moduleId: "mod_world_brazilian_oud",
        number: 43,
        duration: "7 min",
        glossaryTerm: "iqa",
        titlePt: "Modo Nordestino (Lídio b7) & Pulso do Baião",
        titleEn: "Northeastern Mode (Lydian b7) & Baião Groove",
        summaryPt: "O Modo Nordestino (Lídio b7: 1–2–3–#4–5–6–b7) une a #4 luminosa do Lídio à b7 terrosa do Mixolídio, dialogando com a rabeca, a viola caipira e o forró/baião — e aproximando-se surpreendentemente de certos perfis modais do Oriente Médio.",
        summaryEn: "The Northeastern Mode (Lydian b7: 1–2–3–#4–5–6–b7) pairs Lydian's bright #4 with Mixolydian's earthy b7, resonating with Brazilian rabeca, viola, and Baião while sharing striking modal cousins with Middle Eastern scales.",
        taskPt: "Aplique Lídio b7 em C e ligue o ritmo Baião / Zabumba (2/4) a 102 BPM. Toque frases rítmicas e dançantes destacando o F# (#4) e o Bb (b7) sobre o balanço sincopado da zabumba.",
        taskEn: "Apply C Lydian b7 and start Baião / Zabumba (2/4) at 102 BPM. Play buoyant, danceable motifs highlighting F# (#4) and Bb (b7) over the syncopated zabumba pulse.",
        earTipPt: "Para dar 'molejo' brasileiro na Risha, evite rigidez de metrônomo militar: acentue os tempos graves e deixe o contratempos do Baião pulsar com swing.",
        earTipEn: "For Brazilian Risha swing, avoid stiff mechanical picking: anchor the low beats and let the Baião syncopations dance lightly.",
        audioAction: "SCALE",
        suggestDrone: true,
        suggestIqa: true,
        preset: {
          mode: "SCALE",
          entityId: "scale_lydian_b7",
          entityKeywords: ["lydian_b7", "nordestino"],
          rootQ: 0,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "NOTE_NAME",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          iqaId: "iqa_baiao",
          iqaKeyword: "baiao",
          bpm: 102
        }
      },
      {
        id: "les_44_choro_bass_counterpoint",
        moduleId: "mod_world_brazilian_oud",
        number: 44,
        duration: "7 min",
        glossaryTerm: "anf_bajak",
        titlePt: "Choro & Baixarias nos Bordões do Oud",
        titleEn: "Choro & Bass Counterpoint on Oud Courses",
        summaryPt: "No Choro brasileiro (Pixinguinha, Jacob do Bandolim, Waldir Azevedo), o violão de 7 cordas tece baixarias cantantes que respondem à melodia. No Oud, as ordens graves (C–F–A) e o espelho completo permitem conduzir linhas de baixo melódicas e síncopas ágeis.",
        summaryEn: "In Brazilian Choro (Pixinguinha, Jacob do Bandolim, Waldir Azevedo), the 7-string guitar weaves singing bass lines that converse with the melody. On the Oud, low courses (C–F–A) and full-neck reach support nimble bass runs and syncopation.",
        taskPt: "Em Modo Jônio (Maior) em C no espelho completo, treine escalas ascendentes e descendentes fluentes em colcheias, ligando a 6ª ordem (C2) até a 1ª ordem (c4) com articulação clara.",
        taskEn: "In C Ionian (Major) across the full neck, practice smooth ascending and descending eighth-note lines connecting low 6th course (C2) up to high 1st course (c4) with clean articulation.",
        earTipPt: "No Choro, a clareza rítmica e a fluidez de ligação entre cordas são essenciais: pratique devagar até cada nota sair limpa e cantada.",
        earTipEn: "In Choro, rhythmic clarity and smooth string crossings are essential: practice slowly until every note sings cleanly without stumbles.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: true,
        preset: {
          mode: "SCALE",
          entityKeywords: ["ionian", "jonio"],
          rootQ: 0,
          shapeMode: "FULL_NECK",
          labelMode: "NOTE_NAME",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          iqaId: "iqa_maqsum",
          iqaKeyword: "maqsum",
          bpm: 96
        }
      },
      {
        id: "les_45_bossa_nova_open_harmony",
        moduleId: "mod_world_brazilian_oud",
        number: 45,
        duration: "7 min",
        glossaryTerm: "qarar",
        titlePt: "Bossa Nova & Harmonia Aberta sem Pestana",
        titleEn: "Bossa Nova & Open Fretless Harmony",
        summaryPt: "A Bossa Nova (João Gilberto, Tom Jobim) valoriza acordes com sétima, ressonância suave e baixo econômico. Sem trastes para limitar voicings, o Oud pode explorar acordes Maj7 e m7 com timbre aveludado e batida contida.",
        summaryEn: "Bossa Nova (João Gilberto, Tom Jobim) prizes seventh chords, warm resonance, and understated bass movement. Free of frets, the Oud can explore Maj7 and m7 voicings with velvety tone and gentle groove.",
        taskPt: "Aplique o acorde Maj7 em C (ou m7 em D) com timbre Egípcio e toque arpejos suaves alternando o bordão grave com as notas agudas em dinâmica contida e relaxada.",
        taskEn: "Apply C Maj7 (or D m7) with the Egyptian tone profile and play gentle arpeggios alternating the low bass note with upper chord tones in a relaxed, understated dynamic.",
        earTipPt: "Na Bossa Nova, menos força na Risha significa mais bossa: deixe a madeira respirar sem forçar o volume.",
        earTipEn: "In Bossa Nova, lighter Risha touch equals deeper groove: let the wood breathe without forcing volume.",
        audioAction: "ARPEGGIO",
        suggestDrone: false,
        suggestIqa: false,
        suggestTimbreCompare: true,
        preset: {
          mode: "CHORD",
          entityId: "chord_maj7",
          entityKeywords: ["maj7", "m7"],
          rootQ: 0,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "NOTE_NAME",
          chordVoicingOnly: false,
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          soundChar: "egyptian"
        }
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 16 — MÚSICA ANTIGA (ALAÚDE) & COMPOSIÇÃO GLOBAL (MUNDO & FUSÃO)
  // =========================================================================
  {
    id: "mod_world_lute_synthesis",
    order: 16,
    level: "world",
    icon: "🎼",
    titlePt: "16. Música Antiga (Alaúde) & Síntese Global",
    titleEn: "16. Early Music (Lute) & Global Synthesis",
    subtitlePt: "Feche o tratado unindo história e criação: do Oud ao Alaúde europeu a 2 vozes, prelúdios polifônicos e síntese livre entre Maqam, ritmo e mundo.",
    subtitleEn: "Close the treatise uniting history and creation: from Oud to European 2-voice Lute, polyphonic preludes, and free synthesis across Maqam, groove, and world styles.",
    lessons: [
      {
        id: "les_46_oud_to_renaissance_lute",
        moduleId: "mod_world_lute_synthesis",
        number: 46,
        duration: "8 min",
        glossaryTerm: "sadaf_khatem",
        titlePt: "Do Oud ao Alaúde — Contraponto a 2 Vozes",
        titleEn: "From Oud to Lute — 2-Voice Counterpoint",
        summaryPt: "O alaúde europeu medieval e renascentista nasceu diretamente do Al-'Ud árabe levado à Europa. Quando o Oud toca uma linha de baixo lenta enquanto outra voz canta acima, nasce o contraponto a duas vozes da música antiga.",
        summaryEn: "The medieval and Renaissance European lute evolved directly from the Arabic Al-'Ud carried into Europe. When the Oud pairs a slow bass line with an upper singing voice, two-voice early-music counterpoint emerges.",
        taskPt: "Com o ritmo Ternário / Valsa (3/4) a 90 BPM em Modo Jônio ou Dórico, toque uma nota longa no tempo 1 (como baixo) e responda com duas notas leves nos tempos 2 e 3 na ordem vizinha.",
        taskEn: "With Triple Pulse / Waltz (3/4) at 90 BPM in Ionian or Dorian, play a sustained bass note on beat 1 and answer with two nimble notes on beats 2 and 3 on an adjacent course.",
        earTipPt: "Ouça as duas linhas como personagens distintos: o baixo sustenta o chão e a voz superior dança com leveza.",
        earTipEn: "Hear the two lines as distinct voices: the bass anchors the ground while the upper voice dances lightly above.",
        audioAction: "SCALE",
        suggestDrone: false,
        suggestIqa: true,
        preset: {
          mode: "SCALE",
          entityKeywords: ["ionian", "dorian"],
          rootQ: 0,
          shapeMode: "OPEN_FIRST_POS",
          labelMode: "NOTE_NAME",
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: true,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true,
          iqaId: "iqa_waltz_34",
          iqaKeyword: "waltz",
          bpm: 90
        }
      },
      {
        id: "les_47_polyphonic_preludes",
        moduleId: "mod_world_lute_synthesis",
        number: 47,
        duration: "8 min",
        glossaryTerm: "taqsim",
        titlePt: "Prelúdios Polifônicos & Arpejos de Estilo Antigo",
        titleEn: "Polyphonic Preludes & Early-Style Arpeggios",
        summaryPt: "Prelúdios históricos para alaúde e Oud solo exploram arpejos encadeados que revelam harmonia e melodia ao mesmo tempo — um exercício excelente para independência da mão direita e precisão sem trastes.",
        summaryEn: "Historical lute and solo Oud preludes weave cascading arpeggios that unfold harmony and melody simultaneously — a prime workout for right-hand independence and fretless accuracy.",
        taskPt: "Aplique o acorde Sus4 (1–4–5) ou Maj7 em C e pratique arpejar do grave ao agudo e voltar, mantendo o polegar estável e deixando as notas soarem sobrepostas no bojo do instrumento.",
        taskEn: "Apply C Sus4 (1–4–5) or Maj7 and practice rolling arpeggios up and down, keeping your thumb poised and letting pitches overlap cleanly inside the Oud's resonance.",
        earTipPt: "Não apague os dedos da mão esquerda cedo demais: deixar as notas se sobreporem cria o efeito polifônico característico dos prelúdios.",
        earTipEn: "Avoid lifting left-hand fingers prematurely: letting pitches ring together creates the overlapping polyphonic texture of classic preludes.",
        audioAction: "ARPEGGIO",
        suggestDrone: false,
        suggestIqa: false,
        preset: {
          mode: "CHORD",
          entityId: "chord_sus4",
          entityKeywords: ["sus4", "maj7"],
          rootQ: 0,
          shapeMode: "FULL_NECK",
          labelMode: "FINGER",
          chordVoicingOnly: false,
          showSemiGuides: true,
          showMicroGuides: false,
          showGhostNotes: false,
          showSayr: false,
          showStaff: true,
          staffMode: "SCALE",
          showPositionsMap: true
        }
      },
      {
        id: "les_48_universal_oud_synthesis",
        moduleId: "mod_world_lute_synthesis",
        number: 48,
        duration: "10 min",
        glossaryTerm: "maqam",
        titlePt: "Síntese Universal — Maqam, Ritmo & Mundo",
        titleEn: "Universal Synthesis — Maqam, Rhythm & World",
        summaryPt: "Parabéns por concluir todas as 48 lições do método! Agora você tem a chave das tradições modais do Oriente Médio (Maqamat, Ajnas, Sayr, Intiqal e Iqa'at) e da linguagem universal do Oud sem trastes em qualquer estilo musical.",
        summaryEn: "Congratulations on completing all 48 lessons! You now hold the keys to Middle Eastern modal traditions (Maqamat, Ajnas, Sayr, Intiqal, and Iqa'at) and the universal voice of the fretless Oud across global styles.",
        taskPt: "Faça uma improvisação livre de 3 minutos combinando o que mais marcou sua jornada: abra com um trecho modal em Maqam Hijaz ou Bayati, module pelo Radar, teste um groove em 10/8, 8/4 ou 2/4 e encerre em Modo Imersivo (Zen).",
        taskEn: "Play a 3-minute free synthesis uniting your favorite breakthroughs: open modally in Hijaz or Bayati, explore the Modulation Radar, lock into a 10/8, 8/4, or 2/4 groove, and close in Zen Stage.",
        earTipPt: "Seu estilo próprio nasce no cruzamento entre disciplina técnica, escuta atenta e liberdade criativa — o Oud é um instrumento para a vida inteira.",
        earTipEn: "Your personal voice lives where disciplined technique, deep listening, and creative freedom meet — the Oud is a lifelong companion.",
        audioAction: "TAQSIM",
        suggestDrone: true,
        suggestIqa: true,
        suggestLivePitch: true,
        suggestZenMode: true,
        openRadarHint: true,
        preset: {
          mode: "MAQAM",
          entityId: "maqam_hijaz",
          rootQ: 4,
          direction: "ASC",
          shapeMode: "FULL_NECK",
          labelMode: "NOTE_NAME",
          jinsFilter: "ALL",
          showSemiGuides: true,
          showMicroGuides: true,
          showGhostNotes: true,
          showSayr: true,
          sayrPhraseIndex: 0,
          showStaff: true,
          staffMode: "SAYR",
          showPositionsMap: true,
          iqaId: "iqa_chiftetelli",
          iqaKeyword: "chiftetelli",
          bpm: 88
        }
      }
    ]
  }
];

/**
 * Retorna a lista plana de todas as lições em ordem progressiva.
 * @returns {StudyLesson[]}
 */
export function getAllStudyLessons() {
  return STUDY_MODULES.flatMap(mod => mod.lessons);
}

/**
 * Localiza uma lição pelo ID.
 * @param {string} lessonId
 * @returns {StudyLesson | null}
 */
export function getStudyLessonById(lessonId) {
  return getAllStudyLessons().find(l => l.id === lessonId) || null;
}

/**
 * Retorna a próxima lição na trilha após `lessonId` (ou `null` se for a última).
 * @param {string} lessonId
 * @returns {StudyLesson | null}
 */
export function getNextStudyLesson(lessonId) {
  const all = getAllStudyLessons();
  const idx = all.findIndex(l => l.id === lessonId);
  if (idx < 0 || idx >= all.length - 1) return null;
  return all[idx + 1];
}

/**
 * Calcula estatísticas de progresso global e por nível.
 * @param {Set<string>} completedIds
 */
export function getStudyProgressStats(completedIds) {
  const all = getAllStudyLessons();
  const doneTotal = all.filter(l => completedIds.has(l.id)).length;
  /** @type {Record<StudyLevel, { total: number, done: number }>} */
  const byLevel = {
    foundation: { total: 0, done: 0 },
    intermediate: { total: 0, done: 0 },
    advanced: { total: 0, done: 0 },
    mastery: { total: 0, done: 0 },
    world: { total: 0, done: 0 }
  };

  STUDY_MODULES.forEach(mod => {
    mod.lessons.forEach(l => {
      byLevel[mod.level].total += 1;
      if (completedIds.has(l.id)) byLevel[mod.level].done += 1;
    });
  });

  return {
    total: all.length,
    doneTotal,
    pctTotal: all.length > 0 ? Math.round((doneTotal / all.length) * 100) : 0,
    byLevel
  };
}

/**
 * Localiza os textos de um módulo para o idioma ativo ("pt" | "en").
 * @param {string} lang
 * @param {StudyModule} mod
 */
export function localizeStudyModule(lang, mod) {
  const isEn = lang === "en";
  /** @type {Record<StudyLevel, string>} */
  const levelMap = isEn
    ? { foundation: "Base", intermediate: "Interm.", advanced: "Adv.", mastery: "Master", world: "World" }
    : { foundation: "Base", intermediate: "Interm.", advanced: "Avanç.", mastery: "Mestre", world: "Mundo" };

  return {
    ...mod,
    title: isEn ? mod.titleEn : mod.titlePt,
    subtitle: isEn ? mod.subtitleEn : mod.subtitlePt,
    levelLabel: levelMap[mod.level]
  };
}

/**
 * Localiza os textos de uma lição para o idioma ativo ("pt" | "en").
 * @param {string} lang
 * @param {StudyLesson} lesson
 */
export function localizeStudyLesson(lang, lesson) {
  const isEn = lang === "en";
  return {
    ...lesson,
    title: isEn ? lesson.titleEn : lesson.titlePt,
    summary: isEn ? lesson.summaryEn : lesson.summaryPt,
    task: isEn ? lesson.taskEn : lesson.taskPt,
    earTip: isEn ? lesson.earTipEn : lesson.earTipPt
  };
}
