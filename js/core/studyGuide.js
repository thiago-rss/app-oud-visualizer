// @ts-check

/**
 * @typedef {Object} StudyLessonPreset
 * @property {string} [tuningId]
 * @property {"MAQAM"|"JINS"|"SCALE"|"CHORD"|"CADENCE"} mode
 * @property {string} entityId
 * @property {number} rootQ
 * @property {"ASC"|"DESC"} [direction]
 * @property {"FULL_NECK"|"OPEN_FIRST_POS"|"POS_SECOND"|"POS_THIRD_BODY"|"CLOSED_BOX"} shapeMode
 * @property {number} [boxAnchorQ]
 * @property {"NOTE_NAME"|"DEGREE"|"FINGER"|"ARABIC"} labelMode
 * @property {"ALL"|"LOWER"|"UPPER"} [jinsFilter]
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
 * @property {"SCALE"|"TAQSIM"|"REGION"} audioAction
 * @property {boolean} [suggestDrone]
 * @property {boolean} [suggestIqa]
 * @property {boolean} [suggestLivePitch]
 * @property {boolean} [suggestTimbreCompare]
 * @property {boolean} [openRadarHint]
 * @property {StudyLessonPreset} preset
 */

/**
 * @typedef {Object} StudyModule
 * @property {string} id
 * @property {number} order
 * @property {"foundation"|"intermediate"|"advanced"} level
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
  // MÓDULO 1 — FUNDAÇÃO & 12-TET
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
  // MÓDULO 2 — O UNIVERSO DOS AJNAS (BLOCOS & 1/4 DE TOM)
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
  // MÓDULO 3 — FRASEADO (SAYR) & RITMO (IQA')
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
  // MÓDULO 4 — MOBILIDADE & MODULAÇÃO (INTIQAL)
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
  // MÓDULO 5 — EXPRESSÃO, ORNAMENTAÇÃO & TIMBRE (AVANÇADO)
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
  // MÓDULO 6 — MAQAMAT COMPOSTOS & RITMOS ASSIMÉTRICOS (AVANÇADO)
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
        earTipPt: "Para consolidar toda a trilha, abra o Radar de Modulação a partir de Nawa Athar e crie um mini-Taqsim de 1 minuto passando por Nahawand ou Hijaz antes da Qafla final.",
        earTipEn: "To cap off the entire curriculum, open the Modulation Radar from Nawa Athar and weave a 1-minute Taqsim visiting Nahawand or Hijaz before your closing Qafla.",
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
 * Calcula estatísticas de progresso global e por trilha (Base vs. Avançado).
 * @param {Set<string>} completedIds
 */
export function getStudyProgressStats(completedIds) {
  const all = getAllStudyLessons();
  const advancedIds = STUDY_MODULES
    .filter(m => m.level === "advanced")
    .flatMap(m => m.lessons.map(l => l.id));

  const doneTotal = all.filter(l => completedIds.has(l.id)).length;
  const doneAdvanced = advancedIds.filter(id => completedIds.has(id)).length;

  return {
    total: all.length,
    doneTotal,
    pctTotal: all.length > 0 ? Math.round((doneTotal / all.length) * 100) : 0,
    advancedTotal: advancedIds.length,
    doneAdvanced
  };
}

/**
 * Localiza os textos de um módulo para o idioma ativo ("pt" | "en").
 * @param {string} lang
 * @param {StudyModule} mod
 */
export function localizeStudyModule(lang, mod) {
  const isEn = lang === "en";
  return {
    ...mod,
    title: isEn ? mod.titleEn : mod.titlePt,
    subtitle: isEn ? mod.subtitleEn : mod.subtitlePt,
    levelLabel: mod.level === "advanced"
      ? (isEn ? "Advanced" : "Avançado")
      : mod.level === "intermediate"
        ? (isEn ? "Intermediate" : "Intermediário")
        : (isEn ? "Foundation" : "Base")
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
