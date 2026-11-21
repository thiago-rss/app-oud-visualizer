// @ts-check

/**
 * @typedef {Object} StudyRepertoireRef
 * @property {string} piece
 * @property {string} artist
 * @property {string} query
 * @property {string} listenForPt
 * @property {string} listenForEn
 */

/**
 * @typedef {Object} StudyDossierRaw
 * @property {string[]} tagsPt
 * @property {string[]} tagsEn
 * @property {string} structurePt
 * @property {string} structureEn
 * @property {string} temperamentPt
 * @property {string} temperamentEn
 * @property {string} pitfallPt
 * @property {string} pitfallEn
 * @property {StudyRepertoireRef[]} repertoire
 */

/** @type {Record<string, StudyDossierRaw>} */
export const STUDY_DOSSIERS = {
  // =========================================================================
  // CAPÍTULO 1 — FUNDAÇÃO & 12-TET
  // =========================================================================
  les_01_open_first_pos: {
    tagsPt: ["Ordens em 4ªs (C–F–A–d–g–c)", "Pestana (Anf)", "Polegar em 3q", "Dedos 1–2–3"],
    tagsEn: ["4ths Layout (C–F–A–d–g–c)", "Nut (Anf)", "Thumb at 3q", "Fingers 1–2–3"],
    structurePt: "O braço do Oud funciona como um mapa de quartas justas empilhadas (A→d→g→c e C→F), com uma única quebra de terça maior entre a 5ª ordem (F) e a 4ª ordem (A). Isso significa que qualquer padrão de 4 notas aprendido em uma ordem repete a mesma geometria nas ordens agudas vizinhas.",
    structureEn: "The Oud neck is mapped in stacked perfect fourths (A→d→g→c and C–F), with a single major-third break between the 5th course (F) and 4th course (A). Any 4-note pattern learned on one course mirrors identically across the upper courses.",
    temperamentPt: "Em um instrumento de ordens duplas sem trastes, o dedo esquerdo precisa pressionar as duas cordas do par com pressão idêntica e perpendicular ao espelho. Se o dedo inclinar lateralmente, uma corda do par afina mais alto que a outra, criando batimento metálico.",
    temperamentEn: "On a fretless double-course instrument, the left fingertip must press both strings of the pair evenly and perpendicularly. Tilting the finger stretches one string slightly sharper than its twin, causing a harsh beat.",
    pitfallPt: "Pressionar o braço com excesso de força no polegar ou dobrar o pulso para dentro. Solução: mantenha o polegar leve como um ponto de apoio em 3q e use o peso natural do braço esquerdo, sem esmagar o espelho.",
    pitfallEn: "Squeezing the neck with the thumb or collapsing the left wrist. Fix: keep the thumb resting lightly opposite 3q and let the natural weight of the arm stop the courses.",
    repertoire: [
      {
        piece: "Taqsim & Exercícios de Cordas Soltas (Método Clássico)",
        artist: "Jamil Bashir / Escola de Bagdá",
        query: "Jamil Bashir Oud Taqsim",
        listenForPt: "Observe a clareza de ataque em cada corda solta e o equilíbrio de volume entre os bordões graves e as ordens agudas.",
        listenForEn: "Notice the crisp attack on open courses and the balanced volume between low bass strings and treble courses."
      }
    ]
  },

  les_02_ajam_major: {
    tagsPt: ["Jins Ajam (C–D–E–F–G)", "Qarar C", "Ghammaz G", "12-TET"],
    tagsEn: ["Jins Ajam (C–D–E–F–G)", "Qarar C", "Ghammaz G", "12-TET"],
    structurePt: "Maqam Ajam constrói-se com Jins Ajam na base (1–2–3–4–5, pentacorde maior) e Jins Ajam ou Nahawand no registro superior. Diferente do modo maior tonal ocidental, o Ajam árabe evita cadências V7–I rígidas e frequentemente repousa no 3º grau (E) ou desce pelo 7º grau menor (b7 / Bb) antes de voltar ao Qarar.",
    structureEn: "Maqam Ajam pairs a lower Jins Ajam pentachord (1–2–3–4–5) with an upper Jins Ajam or Nahawand. Unlike Western tonal major, Arabic Ajam avoids rigid V7–I cadences and often lingers on degree 3 (E) or descends via b7 (Bb) before resolving.",
    temperamentPt: "Embora o Ajam pertença ao grupo 12-TET (sem quartos de tom), músicos árabes tradicionais frequentemente tocam a 3ª maior (E) alguns cents mais baixa que no piano (próxima da terça justa 5:4, -14¢), tornando a ressonância contra a corda solta C mais doce e calma.",
    temperamentEn: "Although Ajam belongs to the 12-TET group (no quarter tones), traditional players often color the major 3rd (E) slightly flatter than a piano (closer to a pure 5:4 just third, -14¢), yielding a warmer blend against open C.",
    pitfallPt: "Deixar o F (4º grau) baixo demais por acomodar o dedo 3 perto do dedo 2. Solução: confira o F preso na 3ª ordem com a oitava da 5ª ordem solta (F2) para calibrar o semitom E–F.",
    pitfallEn: "Playing F (4th degree) too flat by crowding finger 3 next to finger 2. Fix: check stopped F on the 3rd course against the open 5th course (F2) to lock the E–F semitone.",
    repertoire: [
      {
        piece: "Zourouni Kulli Sana Marra (Maqam Ajam)",
        artist: "Sayyid Darwish / Fairuz",
        query: "Zourouni Maqam Ajam Oud",
        listenForPt: "Repare no caráter luminoso e cantável do pentacorde C–D–E–F–G e nos repousos expressivos sobre o 5º grau (G).",
        listenForEn: "Listen to the bright, songful phrasing inside C–D–E–F–G and the expressive rests on the 5th degree (G)."
      }
    ]
  },

  les_03_nahawand_kurd: {
    tagsPt: ["Jins Nahawand (1–2–b3–4–5)", "Sensível B ↑ vs Bb ↓", "Jins Kurd (1–b2–b3–4)"],
    tagsEn: ["Jins Nahawand (1–2–b3–4–5)", "Leading B ↑ vs Bb ↓", "Jins Kurd (1–b2–b3–4)"],
    structurePt: "O Maqam Nahawand combina Jins Nahawand (C–D–Eb–F–G) com Jins Hijaz no 5º grau (G–Ab–B–C) na subida e Jins Kurd (G–Ab–Bb–C) na descida. Já o Maqam Kurd substitui a 2ª maior por uma 2ª menor (D–Eb–F–G), criando uma gravidade imediata de b2 → 1 sem precisar de quartos de tom.",
    structureEn: "Maqam Nahawand pairs lower Jins Nahawand (C–D–Eb–F–G) with upper Jins Hijaz on G (G–Ab–B–C) ascending and Jins Kurd (G–Ab–Bb–C) descending. Maqam Kurd lowers the 2nd degree to b2 (D–Eb–F–G), generating strong b2 → 1 gravity in pure 12-TET.",
    temperamentPt: "No Nahawand, a distância entre Eb (b3) e F (4) é um tom inteiro amplo, enquanto D–Eb é um semitom estreito. Na descida, trocar B natural por Bb dissolve a tensão harmônica e devolve a melancolia modal típica do Oriente Médio.",
    temperamentEn: "In Nahawand, D–Eb is a tight semitone while Eb–F is a wide whole tone. On the descent, swapping natural B for Bb softens the pull and restores classic Middle Eastern modal lyricism.",
    pitfallPt: "Subir e descer usando sempre a mesma escala menor natural (sem a sensível B na subida) ou manter o B natural na descida, deixando o fraseado mecânico. Solução: suba puxando B → C e desça relaxando C → Bb → Ab → G.",
    pitfallEn: "Ascending and descending with an unchanging minor scale, losing modal nuance. Fix: ascend pulling B → C and descend releasing C → Bb → Ab → G.",
    repertoire: [
      {
        piece: "Longa Nahawand (Longa Riyad)",
        artist: "Riyad al-Sunbati",
        query: "Longa Nahawand Riyad al-Sunbati Oud",
        listenForPt: "Perceba como o tema alterna o brilho da sensível B natural com passagens descendentes fluidas sobre Bb e Ab.",
        listenForEn: "Notice how the melody contrasts the bright leading tone B with flowing descents through Bb and Ab."
      },
      {
        piece: "Lamma Bada Yatathanna (Muwashshah em Nahawand)",
        artist: "Repertório Andaluz / Fairuz / Simon Shaheen",
        query: "Lamma Bada Yatathanna Oud",
        listenForPt: "Observe a clareza do pentacorde de Nahawand (1–2–b3–4–5) e o retorno constante ao Ghammaz.",
        listenForEn: "Hear how clearly the Nahawand pentachord (1–2–b3–4–5) frames every phrase around the Ghammaz."
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 2 — O UNIVERSO DOS AJNAS
  // =========================================================================
  les_04_what_is_jins: {
    tagsPt: ["Jins (Raiz / Gênero)", "Tetracorde & Pentacorde", "Ghammaz (Dobradiça)", "Improviso em Bloco"],
    tagsEn: ["Jins (Root / Genus)", "Tetrachord & Pentachord", "Ghammaz (Hinge)", "Block Improvisation"],
    structurePt: "O termo árabe Jins significa 'gênero' ou 'família'. Na teoria modal clássica (desde al-Kindi e al-Farabi), a oitava não é a unidade primária de pensamento: o músico improvisa dentro de um Jins (3, 4 ou 5 notas) e só muda de cor quando pivota pelo Ghammaz para um segundo Jins.",
    structureEn: "The Arabic word Jins means 'genus' or 'kind'. Since medieval theorists like al-Kindi and al-Farabi, the octave has not been the primary mental unit: musicians improvise inside one 3-to-5 note Jins and shift color by pivoting through the Ghammaz into another.",
    temperamentPt: "Cada Jins carrega seu próprio 'sabor' emocional (Taba') definido pelas micro-proporções internas entre seus 4 ou 5 graus. Dominar 9 Ajnas fundamentais equivale a dominar o vocabulário inteiro de dezenas de Maqamat compostos.",
    temperamentEn: "Each Jins carries a distinct emotional flavor (Taba') shaped by the subtle spacing of its 3–5 pitches. Mastering 9 foundational Ajnas unlocks the vocabulary of dozens of full Maqamat.",
    pitfallPt: "Subir e descer a escala completa de 8 notas do começo ao fim sem construir motivos. Solução: limite-se durante 2 minutos a apenas 4 notas do Jins, variando ritmo, pausas e repetições antes de avançar.",
    pitfallEn: "Running up and down full 8-note scales mechanically. Fix: restrict yourself for 2 full minutes to just 4 notes of one Jins, varying rhythm, rests, and direction.",
    repertoire: [
      {
        piece: "Taqsim Nahawand (Exploração do 1º Jins)",
        artist: "Farid al-Atrash",
        query: "Farid al-Atrash Taqsim Nahawand Oud",
        listenForPt: "Repare quanto tempo o solista permanece explorando apenas as 5 notas do Jins inferior antes de abrir a oitava.",
        listenForEn: "Notice how long the soloist lingers inside just the 5 lower Jins notes before opening the upper register."
      }
    ]
  },

  les_05_jins_rast: {
    tagsPt: ["3ª Neutra (E- / Sikah)", "350¢ (24-TET)", "Desvio Regional (-10¢ a +5¢)", "Gravidade D–E-–F"],
    tagsEn: ["Neutral 3rd (E- / Sikah)", "350¢ (24-TET)", "Regional Nuance (-10¢ to +5¢)", "D–E-–F Gravity"],
    structurePt: "Jins Rast (C–D–E-–F–G) é a pedra fundamental da música árabe: um pentacorde onde os intervalos são [Tom (4q) · 3/4 de tom (3q) · 3/4 de tom (3q) · Tom (4q)]. A simetria dos dois passos de 3/4 de tom (D→E- e E-→F) cria uma sensação nobre, serena e solar.",
    structureEn: "Jins Rast (C–D–E-–F–G) is the cornerstone of Arabic music: a pentachord spaced [Whole (4q) · 3/4-tone (3q) · 3/4-tone (3q) · Whole (4q)]. The twin 3/4-tone steps (D→E- and E-→F) create a noble, luminous balance.",
    temperamentPt: "Em 24-TET teórico, E- fica exatamente a 350 cents acima de C (50¢ abaixo de E natural). Na prática viva: no Cairo (escola egípcia) o E- de Rast tende a soar ligeiramente mais alto (~355–360¢, mais brilhante), enquanto na escola síria/levantina fica bem próximo dos 350¢.",
    temperamentEn: "In theoretical 24-TET, E- sits at exactly 350 cents above C (50¢ below E natural). In living practice, Cairo players often lean slightly brighter (~355–360¢), whereas Syrian/Levantine players sit close to 350¢.",
    pitfallPt: "Aproximar E- demais de Eb (soando como Nahawand) ou de E natural (soando como Ajam). Solução: com o Drone em C e a Escuta 24-TET ativos, toque D → F e procure o ponto exato no meio geométrico entre os dois.",
    pitfallEn: "Drifting E- too close to Eb (turning into Nahawand) or E natural (turning into Ajam). Fix: with the C Drone and Live Pitch 24-TET on, play D → F and place E- right in the acoustic midpoint.",
    repertoire: [
      {
        piece: "Sama'i Rast (Tatyos Efendi / Tradição Árabe)",
        artist: "Simon Shaheen / Al-Kindi Ensemble",
        query: "Samai Rast Oud Simon Shaheen",
        listenForPt: "Escute a estabilidade solar da terça neutra E- sempre que a melodia sobe de C para G e pousa no E- antes de resolver.",
        listenForEn: "Listen to the radiant stability of the neutral third E- whenever the line rises from C to G and leans on E-."
      }
    ]
  },

  les_06_jins_bayati: {
    tagsPt: ["2ª Neutra (E- / 150¢)", "Qarar D (Dukah)", "E- mais baixo que no Rast", "Lirismo"],
    tagsEn: ["Neutral 2nd (E- / 150¢)", "Qarar D (Dukah)", "Lower E- than Rast", "Lyricism"],
    structurePt: "Jins Bayati (D–E-–F–G) é um tetracorde [3/4 tom (3q) · 3/4 tom (3q) · Tom (4q)]. Embora escreva-se com a mesma nota E- (Sikah) do Jins Rast, sua função intervalar muda totalmente: agora E- atua como 2º grau neutro de passagem e atração descendente para o Qarar D.",
    structureEn: "Jins Bayati (D–E-–F–G) is a tetrachord spaced [3/4-tone (3q) · 3/4-tone (3q) · Whole (4q)]. Though written with the same E- (Sikah) as Rast, its modal function shifts completely: E- now acts as a tender neutral 2nd pulling downward to Qarar D.",
    temperamentPt: "Um segredo fundamental da intonação árabe: o E- no Bayati costuma ser tocado 10 a 20 cents MAIS BAIXO do que o E- no Rast (cerca de 130–140¢ acima de D, em vez de 150¢ exatos). Esse 'peso' gravitacional em direção ao D é o que dá ao Bayati sua doçura melancólica.",
    temperamentEn: "A vital secret of Arabic intonation: E- in Bayati is typically played 10–20 cents FLATTER than E- in Rast (around 130–140¢ above D instead of a strict 150¢). That downward gravity toward D creates Bayati's signature tenderness.",
    pitfallPt: "Tocar o E- de Bayati alto demais (ficando 'duro' ou parecido com escala menor/dórica) ou baixo demais até virar Eb (Kurd). Solução: toque D–F e deslize suavemente do F para o D passando por um E- relaxado e ligeiramente grave.",
    pitfallEn: "Playing Bayati's E- too sharp (sounding stiff/Dorian) or too flat until it collapses into Eb (Kurd). Fix: anchor D–F and descend softly from F to D through a slightly low, relaxed E-.",
    repertoire: [
      {
        piece: "Sama'i Bayati al-Aryan",
        artist: "Ibrahim al-Aryan (versões de Oud solo)",
        query: "Samai Bayati Ibrahim al-Aryan Oud",
        listenForPt: "Repare na 1ª Khana como o motivo gira em torno de D–E-–F–G com o E- sutilmente atraído para baixo na resolução.",
        listenForEn: "In the 1st Khana, hear how the motif pivots around D–E-–F–G with E- gently pulled downward into D."
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 3 — FRASEADO (SAYR) & RITMO (IQA')
  // =========================================================================
  les_07_maqam_rast: {
    tagsPt: ["Sayr (Caminho Melódico)", "B- ↑ (Awj) vs Bb ↓ (Ajam)", "Istihlal → Ghammaz → Qafla"],
    tagsEn: ["Sayr (Melodic Path)", "B- ↑ (Awj) vs Bb ↓ (Ajam)", "Istihlal → Ghammaz → Qafla"],
    structurePt: "O Maqam Rast clássico ilustra por que Maqam ≠ escala: na subida do Ghammaz (G) ao Jawab (c), usa Jins Rast superior (G–A–B-–c, com 7º grau neutro Awj); na descida cadencial rumo ao Qarar, substitui B- por Bb (Jins Nahawand em G: c–Bb–A–G), suavizando o fechamento.",
    structureEn: "Classical Maqam Rast proves why Maqam ≠ scale: ascending from Ghammaz (G) to Jawab (c) uses upper Jins Rast (G–A–B-–c, neutral 7th Awj); descending toward the cadence replaces B- with Bb (Jins Nahawand on G: c–Bb–A–G).",
    temperamentPt: "Note o espelhamento microtonal do Rast: E- (3-) no 1º Jins e B- (7-) no 2º Jins formam uma quinta justa exata entre si (E- → B-). Afinar o B- ouvindo a 5ª justa a partir de E- garante coerência perfeita nos dois registros.",
    temperamentEn: "Notice Rast's microtonal symmetry: E- (3-) in the lower Jins and B- (7-) in the upper Jins stand a pure perfect fifth apart (E- → B-). Tuning B- as a pure fifth above E- locks both registers together.",
    pitfallPt: "Descer com B- (ou subir com Bb) de forma aleatória, apagando a assinatura clássica do Sayr. Solução: associe B- à energia ascendente em direção ao c agudo, e Bb ao gesto relaxado de descida para a Qafla.",
    pitfallEn: "Mixing B- and Bb randomly on ascent and descent, blurring Rast's classic Sayr. Fix: associate B- with upward lift toward high c, and Bb with the relaxed cadential descent.",
    repertoire: [
      {
        piece: "Dulab & Taqsim Maqam Rast",
        artist: "Riyad al-Sunbati / Naseer Shamma",
        query: "Taqsim Maqam Rast Riyad al-Sunbati Oud",
        listenForPt: "Acompanhe o momento exato em que a melodia atinge o c agudo passando por B- e imediatamente troca para Bb na volta ao G.",
        listenForEn: "Listen for the exact moment the line reaches high c via B- and immediately switches to Bb when turning back down to G."
      }
    ]
  },

  les_08_maqam_hijaz: {
    tagsPt: ["Salto b2–3 (Eb–F#)", "Jins Hijaz (2q–6q–2q)", "Ghammaz G", "Intonação Tradicional"],
    tagsEn: ["b2–3 Leap (Eb–F#)", "Jins Hijaz (2q–6q–2q)", "Ghammaz G", "Traditional Intonation"],
    structurePt: "Maqam Hijaz em D une Jins Hijaz na base (D–Eb–F#–G) com Jins Nahawand (G–A–Bb–c–d) ou Jins Rast (G–A–B-–c) sobre o Ghammaz G. Na prática clássica, o Sayr do Hijaz raramente pula direto de D para F# sem apoiar primeiro o Ghammaz (G) ou descer de G → F# → Eb → D.",
    structureEn: "Maqam Hijaz in D joins lower Jins Hijaz (D–Eb–F#–G) with upper Jins Nahawand (G–A–Bb–c–d) or Jins Rast (G–A–B-–c) on Ghammaz G. Traditional Sayr often enters from Ghammaz G descending G → F# → Eb → D rather than jumping harshly upward.",
    temperamentPt: "Diferença crucial entre o Hijaz árabe e a 'escala cigana/espanhola' no piano: na tradição do Levante e do Egito, o salto de 2ª aumentada (300¢ em 12-TET) é ligeiramente COMPRIMIDO — o Eb sobe ~10–15¢ e o F# desce ~10–15¢ (~270–280¢ no total), soando muito mais orgânico e vocal.",
    temperamentEn: "Crucial distinction between Arabic Hijaz and a piano's 'Phrygian dominant': traditional players subtly COMPRESS the augmented 2nd (300¢ in 12-TET) by raising Eb ~10–15¢ and lowering F# ~10–15¢ (~270–280¢), giving it a fluid, vocal sound.",
    pitfallPt: "Exagerar a 2ª aumentada deixando o Eb baixo demais e o F# alto demais, o que cria um som caricaturado. Solução: use o dedo 1 bem relaxado no Eb e aproxime levemente o dedo 3 do F# sem forçar a abertura.",
    pitfallEn: "Over-stretching the augmented 2nd (flat Eb + sharp F#), producing a clichéd sound. Fix: nudge Eb slightly higher and let F# sit gently relaxed beneath G.",
    repertoire: [
      {
        piece: "Fog el-Nakhal / Qadduka al-Mayyas (Maqam Hijaz)",
        artist: "Nazem al-Ghazali / Sabah Fakhri (arranjos de Oud)",
        query: "Qadduka al-Mayyas Oud Hijaz",
        listenForPt: "Repare como a segunda aumentada Eb–F# é cantada e tocada de forma fluida e suavizada, nunca rígida ou mecânica.",
        listenForEn: "Hear how smoothly the Eb–F# interval flows in classic Levantine phrasing without sounding rigid."
      }
    ]
  },

  les_09_sayr_maqsum: {
    tagsPt: ["Iqa' Maqsum (4/4)", "D–T · T D · T ·", "Risha no DUM (↓)", "Qafla no Tempo 1"],
    tagsEn: ["Iqa' Maqsum (4/4)", "D–T · T D · T ·", "Risha on DUM (↓)", "Qafla on Beat 1"],
    structurePt: "O Iqa' Maqsum (DUM–TAK · pausa · TAK–DUM · pausa · TAK · pausa) estrutura um ciclo de 8 subdivisões (4/4). A sua síncope central — o segundo DUM no tempo 3 após um TAK antecipado — é o motor de balanço que diferencia a música árabe de um 4/4 quadrado.",
    structureEn: "Iqa' Maqsum (DUM–TAK · rest · TAK–DUM · rest · TAK · rest) organizes an 8-subdivision (4/4) cycle. Its central syncopation — the second DUM on beat 3 preceded by an offbeat TAK — gives Arabic rhythm its characteristic lift.",
    temperamentPt: "Na técnica de mão direita (Risha), a regra de ouro é alinhar os golpes descendentes (↓ Sadda) com os pulsos principais (especialmente os DUMs) e usar golpes ascendentes (↑ Radda) nos contratempos e notas de passagem rápidas.",
    temperamentEn: "In right-hand Risha technique, align downstrokes (↓ Sadda) with strong beats (especially DUM strokes) and reserve upstrokes (↑ Radda) for offbeats and swift passing notes.",
    pitfallPt: "Tocar a frase inteira sem ouvir o segundo DUM do Maqsum ou terminar a Qafla fora do tempo 1. Solução: comece marcando apenas o Qarar D em cada DUM da darbuka por 4 ciclos antes de preencher a melodia.",
    pitfallEn: "Ignoring the mid-bar DUM or landing the final Qafla off beat 1. Fix: pluck only the Qarar D on every DUM for 4 cycles to internalize the pocket before adding melody.",
    repertoire: [
      {
        piece: "Bint el-Shalabiyya / Ya Rayah (Iqa' Maqsum)",
        artist: "Fairuz / Repertório Clássico Levantino",
        query: "Bint el Shalabiyya Oud Maqsum",
        listenForPt: "Observe como as frases melódicas respiram sobre o espaço após o segundo DUM e aterrissam com peso no primeiro DUM do compasso seguinte.",
        listenForEn: "Notice how melodic phrases breathe over the space after the second DUM and land squarely on the next bar's downbeat."
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 4 — MOBILIDADE & MODULAÇÃO (INTIQAL)
  // =========================================================================
  les_10_unison_bridges: {
    tagsPt: ["Pontes de Uníssono (=1ª..3ª)", "Timbre Preso vs. Solto", "Vibrato", "Checagem Acústica"],
    tagsEn: ["Unison Bridges (=1st..3rd)", "Stopped vs. Open Tone", "Vibrato", "Acoustic Check"],
    structurePt: "Cada corda solta das ordens agudas (c, g, d, A) existe também como nota presa em 10q (quarta justa, 5 semitons) na ordem imediatamente mais grave — exceto entre a 5ª (F) e a 4ª (A), onde o uníssono ocorre em 8q (terça maior, 4 semitons).",
    structureEn: "Each upper open course (c, g, d, A) also exists as a stopped note at 10q (perfect fourth, 5 semitones) on the adjacent lower course — except between 5th (F) and 4th (A), where the unison sits at 8q (major third).",
    temperamentPt: "Embora tenham a mesma frequência fundamental, a corda solta soa mais brilhante, longa e aberta, enquanto a mesma nota presa na ordem vizinha possui timbre mais escuro, aveludado e permite vibrato (Hazzah) e portamento (Zahfa).",
    temperamentEn: "Though sharing the same fundamental pitch, an open string rings brighter and longer, while the stopped unison on the lower course sounds warmer, darker, and allows vibrato (Hazzah) and glides (Zahfa).",
    pitfallPt: "Usar cordas soltas no meio de uma frase lírica lenta onde todas as outras notas têm vibrato, criando um 'salto de timbre' brusco. Solução: substitua a corda solta pelo uníssono preso na ordem grave quando buscar continuidade vocal.",
    pitfallEn: "Letting an un-vibrated open string interrupt a lyrical stopped phrase, causing an abrupt tone jump. Fix: use the stopped unison on the lower course whenever you want vocal continuity.",
    repertoire: [
      {
        piece: "Taqsim Rast (Diálogo de Timbres em Uníssono)",
        artist: "Munir Bashir",
        query: "Munir Bashir Taqsim Rast Oud",
        listenForPt: "Repare como Munir Bashir alterna propositalmente a mesma altura entre a corda solta e a corda presa para criar efeito de eco e pergunta-e-resposta.",
        listenForEn: "Hear how Munir Bashir deliberately alternates the exact same pitch between open and stopped courses for a call-and-response echo."
      }
    ]
  },

  les_11_hand_shifts: {
    tagsPt: ["Posições I · II · III", "Junta do Tampo (10q)", "Pivôs ⇄P2 e ⇄P3", "Deslocamento em Bloco"],
    tagsEn: ["Positions I · II · III", "Body Joint (10q)", "⇄P2 & ⇄P3 Pivots", "Unit Shifting"],
    structurePt: "A divisão do braço em 1ª Posição (0–8q), 2ª Posição (4–12q) e 3ª Posição/Tampo (9–16q+) acompanha a anatomia do instrumento: a linha tracejada em 10q marca a junção do braço com o bojo (Tampo), onde a mão muda de ângulo de apoio.",
    structureEn: "Dividing the neck into 1st Position (0–8q), 2nd Position (4–12q), and 3rd Position/Body (9–16q+) follows the instrument's anatomy: the dashed 10q line marks the neck-to-body joint where left-hand posture adapts.",
    temperamentPt: "À medida que você sobe para a 2ª e 3ª posições, o comprimento vibrante da corda diminui logaritmicamente: cada semitom e cada quarto de tom ficam fisicamente mais próximos entre si. A memória auditiva precisa assumir o comando sobre a distância fixa da 1ª posição.",
    temperamentEn: "As you climb into 2nd and 3rd positions, vibrating string length shrinks logarithmically: semitones and quarter tones lie physically closer together, requiring your ear to guide finger spacing.",
    pitfallPt: "Deixar o polegar 'esquecido' atrás da 1ª posição enquanto estica os dedos para alcançar a 2ª posição. Solução: mova o polegar e o dedo 1 juntos como um bloco único durante os pivôs ⇄P2 e ⇄P3.",
    pitfallEn: "Leaving the thumb stuck behind 1st position while stretching fingers up into 2nd. Fix: glide thumb and finger 1 together as a single relaxed unit at the ⇄P2 and ⇄P3 pivots.",
    repertoire: [
      {
        piece: "Sama'i Nahawand (Passagens em 2ª e 3ª Posições)",
        artist: "Mesut Cemil / Simon Shaheen",
        query: "Samai Nahawand Mesut Cemil Oud",
        listenForPt: "Observe a limpeza das mudanças de posição na 2ª e 3ª Khanas quando a melodia atravessa a junta do tampo sem perda de fluidez.",
        listenForEn: "Notice the seamless position shifts in the 2nd and 3rd Khanas as the line crosses the body joint smoothly."
      }
    ]
  },

  les_12_modulation_ghammaz: {
    tagsPt: ["Intiqal (Modulação)", "Ghammaz como Pivô", "Rast + Hijaz = Suznak", "Retorno ao Qarar"],
    tagsEn: ["Intiqal (Modulation)", "Ghammaz Pivot", "Rast + Hijaz = Suznak", "Return to Qarar"],
    structurePt: "A modulação clássica árabe (Intiqal ou Tahwil) nasce da troca do 2º Jins mantendo o Ghammaz intacto. No Maqam Rast em C, o 5º grau G é o Ghammaz: trocar Jins Rast (G–A–B-–c) por Jins Hijaz (G–Ab–B–c) sobre o mesmo G cria instantaneamente o Maqam Suznak, um dos modos mais dramáticos do repertório.",
    structureEn: "Classic Arabic modulation (Intiqal / Tahwil) swaps the upper Jins while keeping the Ghammaz anchored. In Maqam Rast on C, swapping upper Jins Rast (G–A–B-–c) for Jins Hijaz (G–Ab–B–c) on G instantly produces Maqam Suznak.",
    temperamentPt: "Note a sutileza do retorno (Qafla): após explorar o drama de Ab e B natural no Suznak, restaurar o A natural e o Bb/E- na descida devolve ao ouvinte a sensação física de 'voltar para casa' no Rast original.",
    temperamentEn: "Notice the magic of the return (Qafla): after exploring the tension of Ab and natural B in Suznak, restoring natural A and E- on the way down creates an unmistakable feeling of homecoming.",
    pitfallPt: "Modular para o novo Jins e esquecer de voltar ao modo de origem, perdendo a unidade do Taqsim. Solução: trate toda modulação como uma visita temporária — estabeleça o Ghammaz, apresente a nova cor em 2 ou 3 frases e retorne ao Qarar.",
    pitfallEn: "Modulating into a new Jins and failing to resolve back to the home mode. Fix: treat every modulation as a round-trip visit — anchor Ghammaz, color 2–3 phrases, then return home to Qarar.",
    repertoire: [
      {
        piece: "Taqsim Rast modulando para Suznak",
        artist: "Mohamed Abdel Wahab / Farid al-Atrash",
        query: "Taqsim Maqam Suznak Oud",
        listenForPt: "Identifique o exato instante em que surge o Ab e o B natural sobre o Ghammaz G, acendendo o drama do Suznak antes da resolução em C.",
        listenForEn: "Catch the exact moment Ab and natural B appear over Ghammaz G, igniting the Suznak color before resolving to C."
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 5 — EXPRESSÃO, ORNAMENTAÇÃO & TIMBRE
  // =========================================================================
  les_13_bariolage_pedal: {
    tagsPt: ["Bariolage", "Pedal de Corda Solta", "Palhetada Alternada ↓↑", "Escola Iraquiana"],
    tagsEn: ["Bariolage", "Open-Course Pedal", "Alternate Picking ↓↑", "Iraqi School"],
    structurePt: "O Bariolage cria a ilusão de duas vozes simultâneas no Oud: uma linha melódica móvel em uma ordem (por exemplo, C–Bb–A–G na 2ª ordem) dialoga com uma nota fixa constante (o pedal de D solto na 3ª ordem), gerando textura hipnótica e riqueza harmônica sem exigir acordes.",
    structureEn: "Bariolage creates the illusion of two simultaneous voices on the Oud: a moving melodic line on one course (e.g., C–Bb–A–G on the 2nd course) alternates with a fixed open-string pedal (open D on the 3rd course), creating rich counterpoint without full chords.",
    temperamentPt: "A dinâmica da mão direita define a clareza do Bariolage: a melodia precisa soar em primeiro plano (golpe descendente ↓ firme) enquanto o pedal na corda solta responde em segundo plano (~50% do volume, golpe ascendente ↑ leve), evitando embolar a caixa acústica.",
    temperamentEn: "Right-hand dynamics make or break Bariolage: project the moving melody in front (firm ↓ downstroke) while keeping the open pedal softer (~50% volume, light ↑ upstroke) so it supports without masking the line.",
    pitfallPt: "Tocar a corda solta pedal no mesmo volume (ou mais forte) que a melodia, ou tocar ambas com palhetada apenas para baixo, perdendo velocidade. Solução: treine devagar em ↓ (melodia) – ↑ (pedal) exagerando a diferença de volume.",
    pitfallEn: "Plucking the open pedal as loudly as the melody or using all downstrokes. Fix: practice slowly with strict ↓ (melody) – ↑ (pedal), deliberately keeping the pedal whisper-soft.",
    repertoire: [
      {
        piece: "Improvisações em Maqam Kurd & Hijaz (Bariolage)",
        artist: "Munir Bashir / Naseer Shamma",
        query: "Munir Bashir Oud Maqam Kurd",
        listenForPt: "Escute como as cordas soltas sustentam um tapete contínuo enquanto a melodia caminha livremente acima delas.",
        listenForEn: "Listen to how open courses weave a continuous shimmering drone underneath the moving melodic line."
      }
    ]
  },

  les_14_zahfa_microtonal: {
    tagsPt: ["Zahfa (Portamento)", "Maqam Sikah (Qarar E-)", "Tricorde E-–F–G", "Inflexão Vocal"],
    tagsEn: ["Zahfa (Glide)", "Maqam Sikah (Qarar E-)", "E-–F–G Trichord", "Vocal Inflection"],
    structurePt: "O Maqam Sikah é único por apoiar sua própria tônica (Qarar) em uma nota microtonal (E-). Seu bloco base é um tricorde de apenas 3 notas (Jins Sikah: E-–F–G), seguido por Jins Rast superior em G (G–A–B-–c). O 1º grau não tem corda solta de referência direta — o ouvido carrega o centro tonal.",
    structureEn: "Maqam Sikah is unique in grounding its tonic (Qarar) directly on a microtonal pitch (E-). Its core is a 3-note trichord (Jins Sikah: E-–F–G), followed by upper Jins Rast on G (G–A–B-–c). Because no open string equals E-, your ear sustains the tonal center.",
    temperamentPt: "A Zahfa (deslize rápido de 1 ou 2 quartos de tom com o mesmo dedo) é o que conecta o Oud à voz humana no canto árabe. Em Sikah, abordar o E- deslizando discretamente de baixo (D# → E-) reforça a percepção do quarto de tom sem soar desafinado.",
    temperamentEn: "Zahfa (a brisk 1- or 2-quarter-tone glide with one finger) links the Oud to Arabic vocal ornamentation. Approaching Sikah's E- with a subtle upward nudge (D# → E-) clarifies its microtonal identity.",
    pitfallPt: "Fazer um deslize lento e contínuo demais (estilo slide-guitar), deixando o ouvinte sem saber onde a nota realmente pousou. Solução: inicie o deslize logo após o ataque da Risha e trave o dedo com firmeza imediata no centro do E-.",
    pitfallEn: "Gliding too slowly so the destination pitch feels vague. Fix: execute the glide right after the Risha attack and lock the fingertip still on the exact center of E-.",
    repertoire: [
      {
        piece: "Taqsim Maqam Sikah / Ya Shadi al-Alhan",
        artist: "Abdu Dagher / Farid al-Atrash / Repertório Sikah",
        query: "Taqsim Maqam Sikah Oud",
        listenForPt: "Perceba como o solista 'esculpe' a nota E- com micro-deslizes rápidos e vibrato estreito para dar estabilidade à tônica microtonal.",
        listenForEn: "Hear how the player sculpts E- with crisp upward glides and narrow vibrato to make a microtonal tonic feel rock-solid."
      }
    ]
  },

  les_15_syrian_vs_egyptian: {
    tagsPt: ["Ponto de Ataque da Risha", "Escola Síria (Seca/Articulada)", "Escola Egípcia (Roseta/Legato)", "2ª Posição"],
    tagsEn: ["Risha Strike Point", "Syrian School (Crisp)", "Egyptian School (Rosette/Legato)", "2nd Position"],
    structurePt: "O mesmo Maqam Bayati em D muda completamente de personalidade ao migrar da 1ª Posição (muitas cordas soltas, ataque direto) para a 2ª Posição (cordas presas com vibrato e ligados) e ao deslocar o ponto de palhetada entre o cavalete e a roseta central.",
    structureEn: "The exact same Maqam Bayati in D transforms completely when moving from 1st Position (open strings, direct attack) to 2nd Position (stopped courses with vibrato and slurs) and shifting right-hand strike position between bridge and rosette.",
    temperamentPt: "Acusticamente, palhetar próximo ao cavalete (estética Síria/Levantina) excita harmônicos agudos e médios definidos, com decaimento mais seco ideal para passagens velozes; palhetar próximo à roseta (estética Egípcia) reforça a fundamental e os graves do bojo, favorecendo frases longas e cantadas (Tarab).",
    temperamentEn: "Acoustically, plucking near the bridge (Syrian/Levantine aesthetic) emphasizes upper midrange harmonics and dry articulation ideal for agile runs; plucking near the main rosette (Egyptian aesthetic) boosts fundamental warmth for lyrical Tarab singing lines.",
    pitfallPt: "Manter a mão direita sempre travada no mesmo ponto do tampo em todas as frases. Solução: experimente tocar a abertura (Istihlal) perto da roseta (timbre quente) e mover gradualmente 3 cm em direção ao cavalete nos clímax rítmicos.",
    pitfallEn: "Locking the right hand in one static spot for every phrase. Fix: play intimate openings near the rosette for warmth, then drift 3 cm toward the bridge when building rhythmic intensity.",
    repertoire: [
      {
        piece: "Taqsim Bayati (Contraste de Escolas: Cairo vs. Damasco)",
        artist: "Riyad al-Sunbati (Egípcia) vs. Farid al-Atrash / Amer Ammouri (Levantina)",
        query: "Riyad al-Sunbati Taqsim Bayati Oud",
        listenForPt: "Compare o bojo redondo, os ligados e o vibrato amplo de Sunbati com a nitidez rítmica e o ataque seco da escola síria.",
        listenForEn: "Contrast Sunbati's round resonance and singing slurs against the crisp, articulate attack of Syrian-school masters."
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 6 — MAQAMAT COMPOSTOS & RITMOS ASSIMÉTRICOS
  // =========================================================================
  les_16_maqam_saba: {
    tagsPt: ["4ª Diminuta (Gb / b4)", "Tetracorde Sobreposto", "Jins Hijaz em F (b3)", "Pungência (Huzn)"],
    tagsEn: ["Diminished 4th (Gb / b4)", "Overlapping Ajnas", "Jins Hijaz on F (b3)", "Pathos (Huzn)"],
    structurePt: "O Maqam Saba é estruturalmente fascinante porque NÃO fecha uma oitava tradicional de 1º + 2º Jins em 4ª ou 5ª justa: sua base é Jins Saba (D–E-–F–Gb), sobreposto imediatamente por Jins Hijaz no 3º grau (F–Gb–A–Bb) e Jins Nikriz ou Ajam no 6º grau (Bb). A 4ª justa (G) praticamente desaparece!",
    structureEn: "Maqam Saba is structurally unique because it breaks the standard 4th/5th octave split: lower Jins Saba (D–E-–F–Gb) overlaps immediately with Jins Hijaz on the 3rd degree (F–Gb–A–Bb), followed by Ajam/Nikriz on Bb. The perfect 4th (G) vanishes.",
    temperamentPt: "No Saba, o E- tende a ser ainda mais íntimo/baixo que no Bayati, e o Gb (Hijaz) aproxima-se fortemente do F (3º grau), criando um semitom muito estreito e doloroso (Gb → F). É esse atrito microtonal que torna o Saba o modo máximo da saudade e do lamento.",
    temperamentEn: "In Saba, E- leans even lower than in Bayati, while Gb pulls tightly downward into F (3rd degree), forming an intensely narrow semitone (Gb → F). That microtonal friction defines Saba's poignant emotional depth.",
    pitfallPt: "Tocar acidentalmente a 2ª ordem solta (G natural), o que quebra imediatamente o feitiço do Saba e soa como Bayati. Solução: mantenha o foco total em Gb preso na 3ª ordem (ou 2ª ordem a partir de A) e descanse bastante no 3º grau F.",
    pitfallEn: "Accidentally striking open 2nd course (G natural), which instantly breaks Saba's spell and reverts to Bayati. Fix: anchor on stopped Gb and linger expressively on degree 3 (F).",
    repertoire: [
      {
        piece: "Al-Atlal (Seções em Saba) / Taqsim Maqam Saba",
        artist: "Riyad al-Sunbati / Simon Shaheen",
        query: "Taqsim Maqam Saba Oud Simon Shaheen",
        listenForPt: "Observe como o solista constrói a tensão descendo de A → Gb → F e suspende o tempo antes de finalmente cair em D.",
        listenForEn: "Hear how the player builds aching tension descending A → Gb → F, suspending time before finally resolving down to D."
      }
    ]
  },

  les_17_maqam_huzam_samai: {
    tagsPt: ["Maqam Huzam (E-)", "Jins Sikah + Jins Hijaz (G)", "Sama'i Thaqil (10/8)", "Agrupamento 3+2+2+3"],
    tagsEn: ["Maqam Huzam (E-)", "Jins Sikah + Jins Hijaz (G)", "Sama'i Thaqil (10/8)", "3+2+2+3 Grouping"],
    structurePt: "O Maqam Huzam é o irmão mais teatral do Sikah: mantém o tricorde luminoso Jins Sikah na base (E-–F–G) mas instala Jins Hijaz sobre o 3º grau G (G–Ab–B–c). Já o Iqa' Sama'i Thaqil (10/8) é a moldura da principal forma instrumental clássica otomano-árabe (o Sama'i, dividido em 4 Khanas e um refrão Taslim).",
    structureEn: "Maqam Huzam is Sikah's dramatic sibling: it keeps the airy lower Jins Sikah trichord (E-–F–G) but places Jins Hijaz on the 3rd degree G (G–Ab–B–c). Iqa' Sama'i Thaqil (10/8) frames the premier classical instrumental form (the Sama'i, built of 4 Khanas plus a Taslim refrain).",
    temperamentPt: "A respiração do 10/8 clássico divide-se em 3 + 2 + 2 + 3 colcheias: DUM (1–2–3) · ess–TAK (4–5) · DUM–DUM (6–7) · TAK–ess–ess (8–9–10). A leve expansão expressiva sobre o último bloco de 3 colcheias dá nobreza ao fraseado.",
    temperamentEn: "Classical 10/8 breathes in 3 + 2 + 2 + 3 eighth notes: DUM (1–2–3) · rest–TAK (4–5) · DUM–DUM (6–7) · TAK–rest–rest (8–9–10). Letting the closing 3-eighth block breathe unhurriedly gives the groove aristocratic poise.",
    pitfallPt: "Contar 10/8 de forma apressada como se fosse um 4/4 truncado, comendo a pausa dos tempos 9 e 10. Solução: fale em voz alta 'DUM (2-3) · es-TAK · DUM-DUM · TAK (9-10)' batendo o pé apenas nos 4 blocos principais.",
    pitfallEn: "Rushing beats 9 and 10 until 10/8 collapses into a hurried 4/4. Fix: vocalize 'DUM (2-3) · rest-TAK · DUM-DUM · TAK (9-10)' while feeling only the 4 asymmetric macro-beats.",
    repertoire: [
      {
        piece: "Sama'i Huzam / Ya Masaharny (Trechos em Huzam)",
        artist: "Repertório Clássico Árabe / George Michel",
        query: "Samai Huzam Oud 10/8",
        listenForPt: "Sinta como o salto Ab–B do Jins Hijaz encaixa-se sobre os DUMs duplos (tempos 6 e 7) antes de relaxar para o E- no tempo 1.",
        listenForEn: "Feel how the Hijaz Ab–B leap rides over the twin DUMs (beats 6–7) before resolving onto E- on beat 1."
      }
    ]
  },

  les_18_nawa_athar_finale: {
    tagsPt: ["Dupla 2ª Aumentada", "Jins Nikriz + Jins HijazKar", "Iqa' Malfuf (2/4 · 3+3+2)", "Shape Móvel"],
    tagsEn: ["Double Augmented 2nd", "Jins Nikriz + Jins HijazKar", "Iqa' Malfuf (2/4 · 3+3+2)", "Movable Box"],
    structurePt: "O Maqam Nawa Athar (C–D–Eb–F#–G–Ab–B–c) é um dos modos mais simétricos e intensos da família 12-TET: une Jins Nikriz na base (com 2ª aumentada Eb–F#) e Jins HijazKar no topo (com 2ª aumentada Ab–B), gerando duas sensíveis fortes (F#→G e B→c).",
    structureEn: "Maqam Nawa Athar (C–D–Eb–F#–G–Ab–B–c) is among the most dramatic 12-TET modes: it stacks lower Jins Nikriz (augmented 2nd Eb–F#) with upper Jins HijazKar (augmented 2nd Ab–B), creating twin leading tones (F#→G and B→c).",
    temperamentPt: "O Iqa' Malfuf (também chamado Laff) é um ciclo ágil em 2/4 acentuado em 3 + 3 + 2 semicolcheias (DUM · · TAK · · TAK ·). Muito usado em aberturas virtuosísticas e danças folclóricas, exige pulso firme de Risha alternada.",
    temperamentEn: "Iqa' Malfuf (also called Laff) is a brisk 2/4 cycle accented 3 + 3 + 2 sixteenths (DUM · · TAK · · TAK ·). Widely used in energetic overtures and folkloric dances, it rewards tight alternating Risha.",
    pitfallPt: "Deixar o F# (4º grau aumentado) baixo demais na 3ª ordem dentro do Shape Móvel fechado. Solução: confira o F# ouvindo sua atração imediata de semitom contra o G (Ghammaz).",
    pitfallEn: "Playing #4 (F#) flat inside the closed Movable Box. Fix: tune F# directly against its tight semitone pull into the Ghammaz (G).",
    repertoire: [
      {
        piece: "Longa Nawa Athar / Gamil Gamal (Maqam Nawa Athar)",
        artist: "Farid al-Atrash / Mohamed Abdel Wahab",
        query: "Farid al-Atrash Nawa Athar Oud",
        listenForPt: "Repare no impacto dramático das duas segundas aumentadas (Eb–F# e Ab–B) brilhando sobre a condução sincopada do ritmo.",
        listenForEn: "Notice the dramatic punch of both augmented seconds (Eb–F# and Ab–B) slicing over the syncopated groove."
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 7 — HARMONIA MODAL, ACORDES & QAFLAT
  // =========================================================================
  les_19_modal_chords_voicing: {
    tagsPt: ["Voicing (1 Nota/Ordem)", "Heterofonia vs. Polifonia", "Oud Contemporâneo", "Rasgueio Controlado"],
    tagsEn: ["1-Note/Course Voicing", "Heterophony vs. Polyphony", "Modern Oud", "Controlled Strum"],
    structurePt: "Na tradição árabe clássica, todos os instrumentos tocam variações da mesma linha melódica (heterofonia). A partir do século XX, compositores e alaudistas modernos introduziram acordes abertos de 3 a 4 ordens — privilegiando quartas, quintas e intervalos vazios que preservam o caráter modal sem soar como violão pop.",
    structureEn: "Classical Arabic music is heterophonic (ensemble variations of one melody). Since the 20th century, modern Oud composers introduced open 3-to-4 course voicings — favoring fourths, fifths, and airy intervals that preserve modal space.",
    temperamentPt: "Em um instrumento de 11 ou 12 cordas afinadas em pares, acordes densos de 5 ou 6 ordens facilmente ficam turvos. Os melhores voicings no Oud usam 3 ou 4 ordens contíguas, aproveitando ao menos uma corda solta para manter a ressonância cristalina.",
    temperamentEn: "On an 11- or 12-string double-course instrument, dense 5- or 6-course chords easily turn muddy. The finest Oud voicings span 3 or 4 adjacent courses, incorporating at least one open course for clarity.",
    pitfallPt: "Rasguear o acorde rápido e forte demais com a Risha dura, gerando ruído de palheta que encobre as notas. Solução: incline a Risha em ~30° e atravesse as ordens lentamente, deixando cada corda florescer.",
    pitfallEn: "Strumming too fast and hard with a stiff Risha, causing pick clatter. Fix: angle the Risha ~30° and sweep across the courses slowly so each pitch blooms.",
    repertoire: [
      {
        piece: "Le Conte de l'Incroyable Amour / Astrakan Café",
        artist: "Anouar Brahem",
        query: "Anouar Brahem Oud chords Astrakan Cafe",
        listenForPt: "Observe como Anouar Brahem intercala acordes abertos esparsos com linhas melódicas solo, usando o silêncio para valorizar a harmonia.",
        listenForEn: "Notice how Anouar Brahem weaves sparse open chords between single-note melodies, using silence to let the harmony breathe."
      }
    ]
  },

  les_20_neutral_rast_triad: {
    tagsPt: ["Tríade Neutra (1–3-–5)", "C–E-–G", "Acústica 24-TET", "Harmonia Microtonal"],
    tagsEn: ["Neutral Triad (1–3-–5)", "C–E-–G", "24-TET Acoustics", "Microtonal Harmony"],
    structurePt: "A tríade neutra de Rast (1 – 3- – 5, ex.: C – E- – G) divide a quinta justa (700¢) exatamente ao meio em dois intervalos iguais de terça neutra (350¢ + 350¢). Por não ser maior nem menor, ela elimina a dualidade alegre/triste da harmonia tonal ocidental.",
    structureEn: "The neutral Rast triad (1 – 3- – 5, e.g. C – E- – G) splits the perfect fifth (700¢) cleanly in half into two equal neutral thirds (350¢ + 350¢). Neither major nor minor, it transcends the Western happy/sad binary.",
    temperamentPt: "Como a terça neutra não coincide com os primeiros harmônicos naturais do baixo C, a tríade neutra soa mais transparente quando arpejada (nota após nota) ou tocada com a 3- uma oitava acima do bordão grave (voicing aberto).",
    temperamentEn: "Because a neutral third sits between pure overtone ratios of the bass C, neutral triads sound clearest when arpeggiated or spaced openly with the 3- an octave above the bass root.",
    pitfallPt: "Instintivamente puxar o E- para Eb ou E natural ao ouvir a quinta C–G soar junto. Solução: arpeje devagar C → G → E- olhando o ponteiro da Escuta 24-TET para treinar seu cérebro a aceitar o repouso neutro.",
    pitfallEn: "Subconsciously pulling E- toward Eb or E natural when hearing it against C–G. Fix: slowly arpeggiate C → G → E- with Live Pitch 24-TET active until your ear accepts the neutral rest.",
    repertoire: [
      {
        piece: "Composições Modais Contemporâneas em Rast",
        artist: "Marcel Khalife / Trio Joubran",
        query: "Trio Joubran Oud Rast harmony",
        listenForPt: "Preste atenção nos momentos de arpejo onde a terça neutra soa sobre um bordão grave, criando cor modal única.",
        listenForEn: "Listen for arpeggiated passages where a neutral third rings over an open bass pedal for unmistakable modal color."
      }
    ]
  },

  les_21_cadence_qafla_seq: {
    tagsPt: ["Cadência Modal (Qafla)", "Movimento bII → I / bVII → I", "Condução de Vozes", "Gravidade por Grau Conjunto"],
    tagsEn: ["Modal Cadence (Qafla)", "bII → I / bVII → I Motion", "Voice Leading", "Stepwise Gravity"],
    structurePt: "Enquanto a harmonia tonal europeia resolve pela quinta descendente (V → I), as cadências modais árabes (Qaflat) apoiam-se fortemente em acordes vizinhos de semitom ou tom (bII → I no Hijaz/Kurd; bVII → I no Bayati/Rast/Nahawand), preservando intacto o caráter do Jins principal.",
    structureEn: "While European tonal harmony resolves via falling fifths (V → I), Arabic modal cadences (Qaflat) rely on neighbor-step chords (bII → I in Hijaz/Kurd; bVII → I in Bayati/Rast/Nahawand), keeping the core Jins intact.",
    temperamentPt: "Em progressões como Eb Maior → D Maior (bII → I no Hijaz em D), o movimento paralelo de semitom para baixo cria forte atração modal sem introduzir notas estrangeiras ao Maqam.",
    temperamentEn: "In progressions like Eb Major → D Major (bII → I in D Hijaz), downward semitone motion creates compelling resolution without borrowing foreign pitches outside the Maqam.",
    pitfallPt: "Tocar cada acorde da cadência como um bloco isolado, levantando todos os dedos a cada troca. Solução: identifique qual dedo permanece próximo (ou na mesma ordem) entre um passo e o seguinte do sequenciador.",
    pitfallEn: "Lifting all fingers off the neck between every chord step. Fix: spot guide fingers that stay on the same course or slide by one semitone between adjacent sequencer steps.",
    repertoire: [
      {
        piece: "Mawal & Canções em Hijaz / Kurd com Acompanhamento Harmônico",
        artist: "Marcel Khalife / Charbel Rouhana",
        query: "Charbel Rouhana Oud Hijaz",
        listenForPt: "Perceba como o acompanhamento usa ciclos curtos de bII → I e iv → bIII → bII → I (cadência andaluza) para sustentar o fraseado do Oud.",
        listenForEn: "Hear how modern Levantine Oud accompaniment uses bII → I and Andalusian iv → bIII → bII → I cadences to frame modal solos."
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 8 — REGISTRO AGUDO (JAWAB) & NIKRIZ
  // =========================================================================
  les_22_pos_third_body: {
    tagsPt: ["Registro Jawab (Oitava Aguda)", "3ª Posição no Tampo", "Espaçamento Logarítmico", "Clímax do Taqsim"],
    tagsEn: ["Jawab Register (High Octave)", "3rd Position Over Body", "Logarithmic Spacing", "Taqsim Climax"],
    structurePt: "Na teoria árabe, a oitava grave chama-se Qarar, o registro médio chama-se Wasat e a oitava aguda chama-se Jawab ('resposta'). No Oud, o Jawab habita a 3ª Posição sobre o tampo (acima de 10q na 1ª e 2ª ordens), onde a música atinge seu ápice emocional.",
    structureEn: "In Arabic theory, the low octave is Qarar, the middle register is Wasat, and the high octave is Jawab ('answer'). On the Oud, Jawab lives in 3rd Position over the soundboard (past 10q on courses 1–2), where solos reach their peak.",
    temperamentPt: "Acima de 10q, a distância física de 1 quarto de tom cai para menos de metade do que era junto à pestana! Além disso, a altura das cordas sobre o tampo (ação) é ligeiramente maior — exigindo dedos firmes bem na ponta e ajuste microscópico de intonação.",
    temperamentEn: "Past 10q, the physical width of a quarter tone shrinks to less than half its width near the nut, while string action rises slightly — demanding upright fingertips and micro-precise ear control.",
    pitfallPt: "Subir o ombro esquerdo ou inclinar o instrumento para tentar enxergar o tampo, perdendo a estabilidade do polegar na curva do braço. Solução: mantenha o Oud estável no colo e apoie a lateral do polegar na junta do braço como âncora fixa.",
    pitfallEn: "Hunching the left shoulder or tilting the Oud to stare at the soundboard. Fix: keep the Oud stable in your lap and rest the side of your thumb against the neck heel as a fixed anchor.",
    repertoire: [
      {
        piece: "Clímax em Jawab (Maqam Rast / Nahawand)",
        artist: "Naseer Shamma / Farid al-Atrash",
        query: "Naseer Shamma Oud Taqsim Rast",
        listenForPt: "Note o brilho penetrante das notas sobre o tampo e como o solista utiliza trêmulo rápido (Risha dupla) para sustentar notas agudas que decaem mais depressa.",
        listenForEn: "Hear the luminous ring of high soundboard notes and how rapid tremolo (Risha) sustains treble pitches whose natural decay is shorter."
      }
    ]
  },

  les_23_maqam_nikriz: {
    tagsPt: ["Jins Nikriz (1–2–b3–#4–5)", "Pivô Interno Hijaz no 2º Grau", "Ghammaz G", "12-TET Dramático"],
    tagsEn: ["Jins Nikriz (1–2–b3–#4–5)", "Hidden Hijaz on Degree 2", "Ghammaz G", "Dramatic 12-TET"],
    structurePt: "O pentacorde Jins Nikriz (C–D–Eb–F#–G) possui uma propriedade geométrica preciosa: se você começar a cantar a partir do 2º grau (D–Eb–F#–G), obtém exatamente um Jins Hijaz completo! Por isso, Nikriz e Hijaz são parceiros naturais de modulação no Taqsim.",
    structureEn: "The Jins Nikriz pentachord (C–D–Eb–F#–G) hides a geometric gem: starting from its 2nd degree (D–Eb–F#–G) yields a complete Jins Hijaz! That shared DNA makes Nikriz and Hijaz natural modulation partners.",
    temperamentPt: "Na metade superior (a partir do Ghammaz G), o Nikriz tradicional usa Jins Nahawand (G–A–Bb–c) ou Jins Rast (G–A–B-–c), o que suaviza o drama da base — diferenciando-o do Nawa Athar (que empilha um segundo Hijaz no topo).",
    temperamentEn: "In its upper half (from Ghammaz G), traditional Nikriz uses Jins Nahawand (G–A–Bb–c) or Jins Rast (G–A–B-–c), softening the lower drama — distinguishing it from Nawa Athar (which stacks a second Hijaz on top).",
    pitfallPt: "Confundir o centro tonal do Nikriz em C com o Hijaz em D por compartilharem as mesmas notas D–Eb–F#–G. Solução: enfatize sempre a queda Eb → D → C e o apoio grave no Qarar C.",
    pitfallEn: "Letting C Nikriz drift into sounding like D Hijaz since they share D–Eb–F#–G. Fix: repeatedly anchor the low Qarar C and highlight the Eb → D → C cadence.",
    repertoire: [
      {
        piece: "Longa Nikriz / Sama'i Nikriz",
        artist: "Repertório Clássico Otomano-Árabe / Simon Shaheen",
        query: "Samai Nikriz Oud",
        listenForPt: "Escute a elegância da transição entre o salto Eb–F# na base e o tetracorde suave sobre G na região média.",
        listenForEn: "Listen to the elegant contrast between the tense Eb–F# leap below and the smooth upper tetrachord on G."
      }
    ]
  },

  les_24_transposition_ayyub: {
    tagsPt: ["Taswir (Transposição)", "Hijaz 'ala Nawa (em G)", "Shape Móvel Fechado", "Iqa' Ayyub (2/4)"],
    tagsEn: ["Taswir (Transposition)", "Hijaz 'ala Nawa (on G)", "Closed Movable Box", "Iqa' Ayyub (2/4)"],
    structurePt: "Na musicologia árabe, executar um Maqam em uma tônica diferente da sua posição histórica (como Hijaz em G — Hijaz 'ala Nawa — em vez de D) chama-se Taswir. Além de adaptar peças à tessitura de cantores, o Taswir revela novas combinações de cordas soltas e timbres no braço.",
    structureEn: "Performing a Maqam on a non-traditional tonic (such as Hijaz on G — Hijaz 'ala Nawa — instead of D) is called Taswir. Beyond fitting vocal ranges, Taswir unlocks fresh timbres and movable-box agility across the neck.",
    temperamentPt: "O Iqa' Ayyub (ou Zar, em 2/4: DUM · · KAH · DUM · TAK ·) tem pulso pendular hipnótico associado às cerimônias sufis (Zikr) e danças tradicionais. Começa lento e costuma acelerar organicamente ao longo da peça.",
    temperamentEn: "Iqa' Ayyub (or Zar, 2/4: DUM · · KAH · DUM · TAK ·) has a hypnotic swaying pulse tied to Sufi Zikr ceremonies and folk dances, often accelerating gradually from meditative to ecstatic.",
    pitfallPt: "Depender exclusivamente das digitações com cordas soltas da 1ª Posição e travar quando precisa acompanhar um cantor em outro tom. Solução: pratique o Shape Móvel fechado sem nenhuma corda solta para ganhar liberdade de transposição em 360°.",
    pitfallEn: "Relying exclusively on 1st-position open-string fingerings and freezing when a singer asks for a different key. Fix: drill the closed Movable Box without open strings to gain effortless transposition.",
    repertoire: [
      {
        piece: "Zikr / Dança em Iqa' Ayyub (Transe Rítmico)",
        artist: "Ensemble Al-Kindi / Repertório Sufi de Alepo",
        query: "Iqa Ayyub Oud Aleppo Sufi",
        listenForPt: "Sinta o balanço sincopado do KAH antes do segundo DUM e como frases curtas de 2 compassos constroem intensidade crescente.",
        listenForEn: "Feel the swaying KAH anticipation before the second DUM and how tight 2-bar motifs build hypnotic momentum."
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 9 — ESCOLAS & AFINAÇÕES HISTÓRICAS (MESTRE)
  // =========================================================================
  les_25_egyptian_cairo_school: {
    tagsPt: ["Afinação Egípcia (D–G–A–d–g–c)", "Escola do Cairo", "Tarab & Legato", "Bordões em D e G"],
    tagsEn: ["Egyptian Tuning (D–G–A–d–g–c)", "Cairo School", "Tarab & Legato", "D & G Bass Courses"],
    structurePt: "A afinação Egípcia (D–G–A–d–g–c) substitui o C grave por D na 6ª ordem e o F por G na 5ª ordem. O resultado é imediato: os dois bordões graves passam a coincidir exatamente com o Qarar (D) e o Ghammaz (G) dos Maqamat mais tocados no Egito (Bayati, Hijaz, Saba e Kurd).",
    structureEn: "Egyptian tuning (D–G–A–d–g–c) replaces low C with D on the 6th course and F with G on the 5th. Instantly, both bass courses resonate on the exact Qarar (D) and Ghammaz (G) of Egypt's core Maqamat (Bayati, Hijaz, Saba, Kurd).",
    temperamentPt: "Os Ouds egípcios tradicionalmente têm corpo ligeiramente maior, tampo mais robusto e som quente, grave e sustentado. A escola do Cairo (Mohamed al-Qasabgi, Riyad al-Sunbati, Farid al-Atrash) privilegia fraseado cantável, vibrato generoso e forte carga dramática (Tarab).",
    temperamentEn: "Egyptian Ouds traditionally feature a slightly larger bowl and warm, deep sustain. The Cairo school (al-Qasabgi, al-Sunbati, Farid al-Atrash) champions vocal phrasing, rich vibrato, and emotional Tarab.",
    pitfallPt: "Esquecer que a 5ª ordem agora é G (e não F) e tocar padrões antigos de 1ª posição na 5ª e 6ª ordens sem ajustar o ouvido. Solução: use os bordões D e G soltos como pontuação grave nas pausas do Sayr.",
    pitfallEn: "Forgetting that the 5th course is now G (not F) and playing Syrian bass fingerings out of habit. Fix: use open low D and G deliberately as resonant bass punctuation at phrase endings.",
    repertoire: [
      {
        piece: "Al-Rabi' / Taqsim Bayati & Hijaz (Escola do Cairo)",
        artist: "Farid al-Atrash / Riyad al-Sunbati",
        query: "Farid al-Atrash Al-Rabi Oud",
        listenForPt: "Observe o peso majestoso dos bordões em D e G respondendo às frases líricas da região média.",
        listenForEn: "Hear the majestic weight of the low D and G bass courses answering lyrical mid-register phrases."
      }
    ]
  },

  les_26_turkish_istanbul_school: {
    tagsPt: ["Afinação Turca (D–E–A–B–e–a)", "Escola de Istambul", "Sistema 53-TET (Comas)", "Risha Ágil"],
    tagsEn: ["Turkish Tuning (D–E–A–B–e–a)", "Istanbul School", "53-TET Comma System", "Agile Risha"],
    structurePt: "O Ud turco possui braço mais curto (escala ~58,5 cm contra ~60–62 cm do Oud árabe) e afinação um tom acima (D–E–A–B–e–a, ou C#–F#–B–e–a–d). A tensão mais brilhante e a escala curta favorecem trinados velozes, saltos amplos e articulação cristalina.",
    structureEn: "The Turkish Ud has a shorter scale (~58.5 cm vs. ~60–62 cm Arabic) tuned a whole step higher (D–E–A–B–e–a). Its brighter tension and compact reach favor swift trills, wide leaps, and crystalline articulation.",
    temperamentPt: "Na teoria clássica otomana (sistema Arel–Ezgi–Uzdilek), a oitava divide-se em 53 comas de Holder (~22,6¢ por coma), não em 24 quartos de tom. Por isso, o 2º grau do Makam Uşşak (irmão do Bayati) soa mais alto (~1–2 comas abaixo de E natural) do que o 2- do Bayati árabe, conferindo um sotaque inconfundível à escola de Istambul.",
    temperamentEn: "Classical Ottoman theory (Arel–Ezgi–Uzdilek) divides the octave into 53 Holderian commas (~22.6¢ each) rather than 24 quarter tones. Consequently, Makam Uşşak's 2nd degree sits subtly different from Arabic Bayati, giving Istanbul its unmistakable accent.",
    pitfallPt: "Aplicar a mesma força pesada de Risha do Oud egípcio sobre o timbre agudo da afinação turca. Solução: alivie o punho direito e explore golpes curtos e leves com ornamentos ágeis de mão esquerda.",
    pitfallEn: "Using heavy Egyptian Risha pressure on the brighter Turkish tuning. Fix: lighten the right wrist and favor nimble, crisp ornaments and clean staccato clarity.",
    repertoire: [
      {
        piece: "Hicaz Taksim (Escola Clássica de Istambul)",
        artist: "Yorgo Bacanos / Cinuçen Tanrıkorur",
        query: "Yorgo Bacanos Hicaz Taksim Ud",
        listenForPt: "Repare na velocidade quase sem esforço dos trinados, no timbre brilhante e na transparência de cada nota articulada.",
        listenForEn: "Listen to the effortless speed of trills, bright woody timbre, and sparkling note-to-note separation."
      }
    ]
  },

  les_27_iraqi_baghdad_school: {
    tagsPt: ["Afinação Iraquiana (F–C–d–g–c–f)", "Ponte Flutuante", "Escola de Bagdá", "Espaço & Silêncio"],
    tagsEn: ["Iraqi Tuning (F–C–d–g–c–f)", "Floating Bridge", "Baghdad School", "Space & Silence"],
    structurePt: "Consagrada por Sharif Muhiddin Haydar, Jamil Bashir e Munir Bashir, a escola de Bagdá eleva a 1ª ordem aguda para F (F–C–d–g–c–f), ampliando imediatamente o registro agudo sem exigir mudanças extremas no tampo e oferecendo bordões em quinta/oitava (F–C) de grande projeção.",
    structureEn: "Pioneered by Sharif Muhiddin Haydar, Jamil Bashir, and Munir Bashir, the Baghdad school raises the 1st course to high F (F–C–d–g–c–f), extending treble reach effortlessly while pairing open-fifth F–C bass resonance.",
    temperamentPt: "Muitos Ouds iraquianos utilizam cavalete flutuante (preso por cordal na base, semelhante ao violoncelo) e rosetas ovais sem madeira sob o cavalete, produzindo um ataque focado, límpido e meditativo onde cada nota pode decair no silêncio com precisão cirúrgica.",
    temperamentEn: "Many Iraqi Ouds use a floating bridge with a tailpiece and oval soundholes, producing a focused, crystalline, meditative sustain where every single note decays cleanly into silence.",
    pitfallPt: "Preencher todos os segundos com notas rápidas sem deixar espaço acústico. Solução: adote a disciplina de Bagdá — após cada frase de 4 a 6 notas, conte 2 tempos de silêncio absoluto ouvindo a caixa ressoar.",
    pitfallEn: "Filling every beat with nonstop notes. Fix: adopt Baghdad discipline — after every 4-to-6 note phrase, leave 2 beats of total silence to hear the instrument's decay.",
    repertoire: [
      {
        piece: "Meditations / Taqsim em Maqam Kurd & Lami",
        artist: "Munir Bashir",
        query: "Munir Bashir Meditations Oud",
        listenForPt: "Observe o uso magistral do silêncio, dos graves em F/C e da clareza quase camerística da escola de Bagdá.",
        listenForEn: "Hear the masterful use of silence, open F/C bass resonance, and chamber-like clarity of the Baghdad school."
      }
    ]
  },

  // =========================================================================
  // CAPÍTULO 10 — A ARTE DO TAQSIM & RECITAL FINAL (MESTRE)
  // =========================================================================
  les_28_taqsim_architecture: {
    tagsPt: ["Dramaturgia em 4 Atos", "Istihlal (Ato 1)", "Ghammaz (Ato 2)", "Jawab (Ato 3) & Qafla (Ato 4)"],
    tagsEn: ["4-Act Dramatic Arc", "Istihlal (Act 1)", "Ghammaz (Act 2)", "Jawab (Act 3) & Qafla (Act 4)"],
    structurePt: "Um grande Taqsim não é um fluxo aleatório de notas, mas uma narrativa arquitetônica: (1) Istihlal — apresenta o 1º Jins no registro médio-grave sem pressa; (2) Ghammaz — desenvolve o 2º Jins e abre espaço para modulações; (3) Jawab — atinge o ápice emocional na oitava aguda; (4) Qafla — desce em arco controlado até repousar no Qarar.",
    structureEn: "A great Taqsim is not random noodling but an architectural story: (1) Istihlal — calmly establishes the lower Jins; (2) Ghammaz — develops the upper Jins and modulations; (3) Jawab — peaks in the high octave; (4) Qafla — descends gracefully home to Qarar.",
    temperamentPt: "Nos minutos iniciais (Istihlal), o foco está em cravar a afinação exata das notas características (como E- no Rast) para 'afinar o ouvido do público' no Maqam escolhido antes de qualquer virtuosismo.",
    temperamentEn: "During the opening Istihlal, your job is to lock the intonation of signature pitches (like Rast's E-) so the listener's ear settles into the Maqam before any virtuosity appears.",
    pitfallPt: "Subir logo nos primeiros 10 segundos para as notas mais agudas e rápidas, deixando o restante do Taqsim sem curva dramática. Solução: respeite o mapa de alturas — guarde a 1ª corda aguda e a 3ª Posição exclusivamente para o Ato 3.",
    pitfallEn: "Jumping to your highest, fastest notes in the first 10 seconds, flattening the dramatic arc. Fix: honor register discipline — save the high 1st course and 3rd Position strictly for Act 3.",
    repertoire: [
      {
        piece: "Taqsim Rast (Estrutura Clássica Completa)",
        artist: "Riyad al-Sunbati / Simon Shaheen",
        query: "Simon Shaheen Taqsim Rast Oud",
        listenForPt: "Mapeie no relógio cada uma das 4 fases: abertura calma no 1º Jins, diálogo no Ghammaz G, clímax agudo no Jawab e descida final via Bb.",
        listenForEn: "Track all 4 acts in real time: calm lower-Jins opening, dialogue on Ghammaz G, soaring Jawab peak, and final descent through Bb."
      }
    ]
  },

  les_29_chained_modulation: {
    tagsPt: ["Cadeia de Intiqal", "Bayati → Hijaz → Saba → Bayati", "Pivô Comum (D & G)", "Coesão Modal"],
    tagsEn: ["Chained Intiqal", "Bayati → Hijaz → Saba → Bayati", "Shared Pivots (D & G)", "Modal Cohesion"],
    structurePt: "O encadeamento Bayati (D) → Jins Hijaz no Ghammaz (G) → Maqam Saba (D) → retorno ao Bayati (D) é uma das jornadas emocionais mais poderosas da música árabe: parte do lirismo equilibrado, acende a dramaticidade no registro agudo (Bayati Shuri), mergulha na dor íntima da 4ª diminuta (Gb) e finalmente devolve a paz da 4ª justa (G).",
    structureEn: "The chain Bayati (D) → Jins Hijaz on Ghammaz (G) → Maqam Saba (D) → return to Bayati (D) is one of Arabic music's richest emotional arcs: balanced lyricism, upper-register drama (Bayati Shuri), poignant diminished-4th depth (Gb), and the relief of restoring natural G.",
    temperamentPt: "Em modulações encadeadas, a chave é a transição suave do grau que muda: por exemplo, ao passar de Bayati para Saba, reforce o 3º grau F antes de abaixar G para Gb; ao voltar do Saba para o Bayati, celebre o retorno da 4ª justa G com firmeza.",
    temperamentEn: "In chained modulations, spotlight the exact changing pitch: when entering Saba from Bayati, linger on F before dropping G to Gb; when returning home, highlight the restoration of natural G clearly.",
    pitfallPt: "Trocar de Maqam a cada 3 segundos sem deixar o ouvinte absorver a cor de cada parada. Solução: dedique pelo menos 2 frases completas (pergunta e resposta) a cada Jins visitado antes de seguir para o próximo.",
    pitfallEn: "Switching Maqamat every 3 seconds before the listener absorbs each color. Fix: give every visited Jins at least 2 full call-and-response phrases before moving on.",
    repertoire: [
      {
        piece: "Taqsim Bayati com Modulações para Shuri, Hijaz e Saba",
        artist: "Farid al-Atrash / Mohamed al-Qasabgi",
        query: "Taqsim Bayati modulation Saba Hijaz Oud",
        listenForPt: "Perceba o arrepio harmônico no instante em que o Gb do Saba cede lugar novamente ao G natural do Bayati na volta para casa.",
        listenForEn: "Feel the emotional release the instant Saba's Gb yields back to Bayati's natural G on the way home."
      }
    ]
  },

  les_30_master_recital: {
    tagsPt: ["Síntese Completa", "Taqsim Livre + Iqa' 10/8", "Zen Stage", "Voz Pessoal no Oud"],
    tagsEn: ["Complete Synthesis", "Free Taqsim + 10/8 Iqa'", "Zen Stage", "Personal Voice on Oud"],
    structurePt: "No repertório tradicional (Wasla ou concerto solo), o Taqsim livre sem pulso funciona como um portal meditativo que prepara o ouvido para a entrada do ciclo rítmico (como o Sama'i Thaqil 10/8). Conectar a liberdade do tempo rubato à precisão do pulso composto representa a maturidade completa no instrumento.",
    structureEn: "In a traditional Wasla or solo recital, an unmetered Taqsim serves as a meditative portal introducing a rhythmic cycle (such as Sama'i Thaqil 10/8). Bridging rubato freedom into compound-meter precision marks true maturity on the Oud.",
    temperamentPt: "No palco limpo do Modo Imersivo (Zen), reduza o apoio visual ao mínimo e confie na triangulação que você treinou ao longo dos 10 capítulos: ouvido interno (cantar a frase mentalmente), ressonância acústica da madeira e feedback pontual da Escuta 24-TET.",
    temperamentEn: "Inside Zen Stage, rely less on visual labels and trust the triangle you trained across all 10 chapters: inner ear (singing phrases mentally), natural wood resonance, and occasional Live Pitch 24-TET checks.",
    pitfallPt: "Encerrar o estudo achando que é preciso tocar todas as técnicas ao mesmo tempo. Solução: a maestria no Oud mede-se pela clareza da intonação, pela beleza do timbre e pela sinceridade de cada pausa.",
    pitfallEn: "Trying to cram every technique into a single solo. Fix: mastery on the Oud is measured by pure intonation, resonant tone, and the musical truth of every pause.",
    repertoire: [
      {
        piece: "Wasla Completa / Concerto Solo de Oud (Taqsim + Sama'i)",
        artist: "Munir Bashir / Simon Shaheen / Naseer Shamma",
        query: "Oud Solo Recital Taqsim Samai",
        listenForPt: "Aprecie a transição orgânica entre a improvisação livre inicial e a entrada pulsada do Sama'i, inspirando sua própria apresentação no Modo Imersivo.",
        listenForEn: "Enjoy the seamless bridge from free rubato improvisation into the pulsed Sama'i, inspiring your own Zen Stage recital."
      }
    ]
  }
};

/**
 * Retorna o dossiê teórico localizado ("pt" | "en") para uma lição específica.
 * @param {string} lang
 * @param {string} lessonId
 */
export function getLocalizedStudyDossier(lang, lessonId) {
  const raw = STUDY_DOSSIERS[lessonId];
  if (!raw) return null;
  const isEn = lang === "en";

  return {
    tags: isEn ? raw.tagsEn : raw.tagsPt,
    structure: isEn ? raw.structureEn : raw.structurePt,
    temperament: isEn ? raw.temperamentEn : raw.temperamentPt,
    pitfall: isEn ? raw.pitfallEn : raw.pitfallPt,
    repertoire: raw.repertoire.map(item => ({
      piece: item.piece,
      artist: item.artist,
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.query)}`,
      listenFor: isEn ? item.listenForEn : item.listenForPt
    }))
  };
}
