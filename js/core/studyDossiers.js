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
les_01_open_first_pos: {
tagsPt: ["Ordens em 4ªs (C–F–A–d–g–c)", "Pestana (Anf)", "Polegar em 3q", "Dedos 1–2–3"],
tagsEn: ["4ths Layout (C–F–A–d–g–c)", "Nut (Anf)", "Thumb at 3q", "Fingers 1–2–3"],
structurePt: "O braço do Oud funciona como um mapa de quartas justas empilhadas (A→d→g→c e C→F), com uma única quebra de terça maior entre a 5ª ordem (F) e a 4ª ordem (A). Isso significa que qualquer padrão de 4 notas aprendido em uma ordem repete a mesma geometria nas ordens agudas vizinhas.",
structureEn: "The Oud neck is mapped in stacked perfect fourths (A→d→g→c and C–F), with a single major-third break between the 5th course (F) and 4th course (A). Any 4-note pattern learned on one course mirrors identically across the upper courses.",
temperamentPt: "Em um instrumento de ordens duplas sem trastes, o dedo esquerdo precisa pressionar as duas cordas do par com pressão idêntica e perpendicular ao espelho. Se o dedo inclinar lateralmente, uma corda do par afina mais alto que a outra, criando batimento metálico. Ao tocar em conjuntos de outros estilos, alternar entre cordas soltas e notas presas ajuda a equilibrar ressonância natural com controle rítmico e clareza harmônica.",
temperamentEn: "On a fretless double-course instrument, the left fingertip must press both strings of the pair evenly and perpendicularly. Tilting the finger stretches one string slightly sharper than its twin, causing a harsh beat. In cross-style ensembles, balancing open courses against stopped notes helps pair natural resonance with rhythmic control and harmonic clarity.",
pitfallPt: "Pressionar o braço com excesso de força no polegar ou dobrar o pulso para dentro. Solução: mantenha o polegar leve como um ponto de apoio em 3q e use o peso natural do braço esquerdo, sem esmagar o espelho. Evite deixar as cordas soltas soarem de forma descontrolada quando outros instrumentos já sustentam os graves do arranjo.",
pitfallEn: "Squeezing the neck with the thumb or collapsing the left wrist. Fix: keep the thumb resting lightly opposite 3q and let the natural weight of the arm stop the courses. Avoid letting open courses ring unchecked when bass or chording instruments already anchor the low end.",
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
temperamentPt: "Embora o Ajam pertença ao grupo 12-TET (sem quartos de tom), músicos árabes tradicionais frequentemente tocam a 3ª maior (E) alguns cents mais baixa que no piano (próxima da terça justa 5:4, -14¢), tornando a ressonância contra a corda solta C mais doce e calma. Em contextos de música global, folk ou acompanhamento harmônico, o modo maior em 12-TET aproxima o Oud de referências temperadas sem exigir que você abra mão do fraseado cantado.",
temperamentEn: "Although Ajam belongs to the 12-TET group (no quarter tones), traditional players often color the major 3rd (E) slightly flatter than a piano (closer to a pure 5:4 just third, -14¢), yielding a warmer blend against open C. In global folk or harmonic accompaniment, 12-TET major aligns the Oud with tempered references without giving up vocal phrasing.",
pitfallPt: "Deixar o F (4º grau) baixo demais por acomodar o dedo 3 perto do dedo 2. Solução: confira o F preso na 3ª ordem com a oitava da 5ª ordem solta (F2) para calibrar o semitom E–F. Não trate o Ajam como mera escala de exercício; explore pausas, repetições de motivo e apoio na 5ª justa.",
pitfallEn: "Playing F (4th degree) too flat by crowding finger 3 next to finger 2. Fix: check stopped F on the 3rd course against the open 5th course (F2) to lock the E–F semitone. Do not treat Ajam merely as a scale drill; shape pauses, motif repetition, and rests on the fifth.",
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
temperamentPt: "No Nahawand, a distância entre Eb (b3) e F (4) é um tom inteiro amplo, enquanto D–Eb é um semitom estreito. Na descida, trocar B natural por Bb dissolve a tensão harmônica e devolve a melancolia modal típica do Oriente Médio. As cores menor e frígia em 12-TET dialogam diretamente com repertórios mediterrâneos, balcânicos, latinos e modais, permitindo transições suaves entre harmonia temperada e inflexão oriental.",
temperamentEn: "In Nahawand, D–Eb is a tight semitone while Eb–F is a wide whole tone. On the descent, swapping natural B for Bb softens the pull and restores classic Middle Eastern modal lyricism. Minor and Phrygian colors in 12-TET connect naturally with Mediterranean, Balkan, Latin, and modal repertoires, easing bridges between tempered harmony and modal inflection.",
pitfallPt: "Subir e descer usando sempre a mesma escala menor natural (sem a sensível B na subida) ou manter o B natural na descida, deixando o fraseado mecânico. Solução: suba puxando B → C e desça relaxando C → Bb → Ab → G. Evite aplicar a mesma subida e descida mecânica em todo trecho; deixe o contexto melódico guiar a escolha entre sensível e grau menor.",
pitfallEn: "Ascending and descending with an unchanging minor scale, losing modal nuance. Fix: ascend pulling B → C and descend releasing C → Bb → Ab → G. Avoid mechanical up-and-down scale habits; let musical context guide leading-tone vs. natural-degree choices.",
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

les_04_what_is_jins: {
tagsPt: ["Jins (Raiz / Gênero)", "Tetracorde & Pentacorde", "Ghammaz (Dobradiça)", "Improviso em Bloco"],
tagsEn: ["Jins (Root / Genus)", "Tetrachord & Pentachord", "Ghammaz (Hinge)", "Block Improvisation"],
structurePt: "O termo árabe Jins significa 'gênero' ou 'família'. Na teoria modal clássica (desde al-Kindi e al-Farabi), a oitava não é a unidade primária de pensamento: o músico improvisa dentro de um Jins (3, 4 ou 5 notas) e só muda de cor quando pivota pelo Ghammaz para um segundo Jins.",
structureEn: "The Arabic word Jins means 'genus' or 'kind'. Since medieval theorists like al-Kindi and al-Farabi, the octave has not been the primary mental unit: musicians improvise inside one 3-to-5 note Jins and shift color by pivoting through the Ghammaz into another.",
temperamentPt: "Cada Jins carrega seu próprio 'sabor' emocional (Taba') definido pelas micro-proporções internas entre seus 4 ou 5 graus. Dominar 9 Ajnas fundamentais equivale a dominar o vocabulário inteiro de dezenas de Maqamat compostos. Pensar em blocos curtos de 3 a 5 notas facilita improvisar sobre grooves, pedais ou acompanhamentos repetitivos em qualquer estilo, mantendo o foco no desenho melódico.",
temperamentEn: "Each Jins carries a distinct emotional flavor (Taba') shaped by the subtle spacing of its 3–5 pitches. Mastering 9 foundational Ajnas unlocks the vocabulary of dozens of full Maqamat. Thinking in 3-to-5 note blocks makes it easier to improvise over grooves, drones, or repeating vamps in any style while keeping melodic shape clear.",
pitfallPt: "Subir e descer a escala completa de 8 notas do começo ao fim sem construir motivos. Solução: limite-se durante 2 minutos a apenas 4 notas do Jins, variando ritmo, pausas e repetições antes de avançar. Não tente cobrir toda a extensão do braço de uma só vez; aprofunde primeiro o caráter do bloco curto.",
pitfallEn: "Running up and down full 8-note scales mechanically. Fix: restrict yourself for 2 full minutes to just 4 notes of one Jins, varying rhythm, rests, and direction. Do not rush across the full neck at once; explore the character of the short block first.",
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
temperamentPt: "Em 24-TET teórico, E- fica exatamente a 350 cents acima de C (50¢ abaixo de E natural). Na prática viva: no Cairo (escola egípcia) o E- de Rast tende a soar ligeiramente mais alto (~355–360¢, mais brilhante), enquanto na escola síria/levantina fica bem próximo dos 350¢. Ao transitar entre microtonalidade e estilos temperados, o grau neutro 3- ganha força expressiva quando contrastado com referências estáveis de tônica e quinta.",
temperamentEn: "In theoretical 24-TET, E- sits at exactly 350 cents above C (50¢ below E natural). In living practice, Cairo players often lean slightly brighter (~355–360¢), whereas Syrian/Levantine players sit close to 350¢. Moving between microtonality and tempered styles, the neutral 3rd shines when framed against clear tonic and fifth anchors.",
pitfallPt: "Aproximar E- demais de Eb (soando como Nahawand) ou de E natural (soando como Ajam). Solução: com o Drone em C e a Escuta 24-TET ativos, toque D → F e procure o ponto exato no meio geométrico entre os dois. Evite deixar a terça neutra oscilar sem direção; mire a altura com firmeza auditiva.",
pitfallEn: "Drifting E- too close to Eb (turning into Nahawand) or E natural (turning into Ajam). Fix: with the C Drone and Live Pitch 24-TET on, play D → F and place E- right in the acoustic midpoint. Avoid letting the neutral third drift aimlessly; aim for the pitch with steady ear control.",
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
temperamentPt: "Um segredo fundamental da intonação árabe: o E- no Bayati costuma ser tocado 10 a 20 cents MAIS BAIXO do que o E- no Rast (cerca de 130–140¢ acima de D, em vez de 150¢ exatos). Esse 'peso' gravitacional em direção ao D é o que dá ao Bayati sua doçura melancólica. A segunda neutra 2- dá lirismo e proximidade vocal que funcionam tanto em solos intimistas quanto em diálogos modais com cordas, sopros ou percussão.",
temperamentEn: "A vital secret of Arabic intonation: E- in Bayati is typically played 10–20 cents FLATTER than E- in Rast (around 130–140¢ above D instead of a strict 150¢). That downward gravity toward D creates Bayati's signature tenderness. The neutral 2nd brings vocal intimacy that works in solo reflections as well as modal dialogue with strings, winds, or percussion.",
pitfallPt: "Tocar o E- de Bayati alto demais (ficando 'duro' ou parecido com escala menor/dórica) ou baixo demais até virar Eb (Kurd). Solução: toque D–F e deslize suavemente do F para o D passando por um E- relaxado e ligeiramente grave. Não deixe o 2- soar duro ou impreciso contra o bordão; ouça a resolução suave em direção à tônica.",
pitfallEn: "Playing Bayati's E- too sharp (sounding stiff/Dorian) or too flat until it collapses into Eb (Kurd). Fix: anchor D–F and descend softly from F to D through a slightly low, relaxed E-. Do not let the neutral 2nd sound harsh or vague against the drone; listen for its gentle pull home.",
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

les_07_maqam_rast: {
tagsPt: ["Sayr (Caminho Melódico)", "B- ↑ (Awj) vs Bb ↓ (Ajam)", "Istihlal → Ghammaz → Qafla"],
tagsEn: ["Sayr (Melodic Path)", "B- ↑ (Awj) vs Bb ↓ (Ajam)", "Istihlal → Ghammaz → Qafla"],
structurePt: "O Maqam Rast clássico ilustra por que Maqam ≠ escala: na subida do Ghammaz (G) ao Jawab (c), usa Jins Rast superior (G–A–B-–c, com 7º grau neutro Awj); na descida cadencial rumo ao Qarar, substitui B- por Bb (Jins Nahawand em G: c–Bb–A–G), suavizando o fechamento.",
structureEn: "Classical Maqam Rast proves why Maqam ≠ scale: ascending from Ghammaz (G) to Jawab (c) uses upper Jins Rast (G–A–B-–c, neutral 7th Awj); descending toward the cadence replaces B- with Bb (Jins Nahawand on G: c–Bb–A–G).",
temperamentPt: "Note o espelhamento microtonal do Rast: E- (3-) no 1º Jins e B- (7-) no 2º Jins formam uma quinta justa exata entre si (E- → B-). Afinar o B- ouvindo a 5ª justa a partir de E- garante coerência perfeita nos dois registros. A diferença de percurso entre subida e descida no Sayr ensina a dar direção narrativa à frase mesmo quando você adapta o material a outros andamentos ou ritmos.",
temperamentEn: "Notice Rast's microtonal symmetry: E- (3-) in the lower Jins and B- (7-) in the upper Jins stand a pure perfect fifth apart (E- → B-). Tuning B- as a pure fifth above E- locks both registers together. Contrasting ascending and descending Sayr paths teaches narrative direction even when adapting material to other tempos or grooves.",
pitfallPt: "Descer com B- (ou subir com Bb) de forma aleatória, apagando a assinatura clássica do Sayr. Solução: associe B- à energia ascendente em direção ao c agudo, e Bb ao gesto relaxado de descida para a Qafla. Evite repetir a mesma sequência de notas em todas as frases; varie o ponto de partida e a chegada.",
pitfallEn: "Mixing B- and Bb randomly on ascent and descent, blurring Rast's classic Sayr. Fix: associate B- with upward lift toward high c, and Bb with the relaxed cadential descent. Avoid repeating the exact same note sequence every time; vary phrase entry and arrival points.",
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
temperamentPt: "Diferença crucial entre o Hijaz árabe e a 'escala cigana/espanhola' no piano: na tradição do Levante e do Egito, o salto de 2ª aumentada (300¢ em 12-TET) é ligeiramente COMPRIMIDO — o Eb sobe ~10–15¢ e o F# desce ~10–15¢ (~270–280¢ no total), soando muito mais orgânico e vocal. A cor do Hijaz aparece em tradições árabes, otomanas, balcânicas, klezmer e ibéricas, exigindo ajuste fino de timbre e articulação conforme o sotaque do estilo.",
temperamentEn: "Crucial distinction between Arabic Hijaz and a piano's 'Phrygian dominant': traditional players subtly COMPRESS the augmented 2nd (300¢ in 12-TET) by raising Eb ~10–15¢ and lowering F# ~10–15¢ (~270–280¢), giving it a fluid, vocal sound. Hijaz color appears across Arabic, Ottoman, Balkan, klezmer, and Iberian traditions, calling for tailored tone and articulation to match the style's accent.",
pitfallPt: "Exagerar a 2ª aumentada deixando o Eb baixo demais e o F# alto demais, o que cria um som caricaturado. Solução: use o dedo 1 bem relaxado no Eb e aproxime levemente o dedo 3 do F# sem forçar a abertura. Evite soar artificial ou apressado no intervalo característico; dê tempo para a frase respirar.",
pitfallEn: "Over-stretching the augmented 2nd (flat Eb + sharp F#), producing a clichéd sound. Fix: nudge Eb slightly higher and let F# sit gently relaxed beneath G. Avoid sounding contrived or rushed across the signature step; give the phrase room to breathe.",
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
temperamentPt: "Na técnica de mão direita (Risha), a regra de ouro é alinhar os golpes descendentes (↓ Sadda) com os pulsos principais (especialmente os DUMs) e usar golpes ascendentes (↑ Radda) nos contratempos e notas de passagem rápidas. Praticar a chegada da frase (Qafla) sobre o pulso do Maqsum treina o senso de groove e resolução rítmica que sustenta o Oud em qualquer ciclo rítmico.",
temperamentEn: "In right-hand Risha technique, align downstrokes (↓ Sadda) with strong beats (especially DUM strokes) and reserve upstrokes (↑ Radda) for offbeats and swift passing notes. Practicing phrase arrival (Qafla) over Maqsum builds groove awareness and rhythmic resolution that carry over to any rhythmic cycle.",
pitfallPt: "Tocar a frase inteira sem ouvir o segundo DUM do Maqsum ou terminar a Qafla fora do tempo 1. Solução: comece marcando apenas o Qarar D em cada DUM da darbuka por 4 ciclos antes de preencher a melodia. Não deixe o final da frase atropelar o tempo forte; ouça o apoio rítmico antes de concluir.",
pitfallEn: "Ignoring the mid-bar DUM or landing the final Qafla off beat 1. Fix: pluck only the Qarar D on every DUM for 4 cycles to internalize the pocket before adding melody. Do not rush phrase endings past the downbeat; feel the rhythmic anchor before resolving.",
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

les_10_unison_bridges: {
tagsPt: ["Pontes de Uníssono (=1ª..3ª)", "Timbre Preso vs. Solto", "Vibrato", "Checagem Acústica"],
tagsEn: ["Unison Bridges (=1st..3rd)", "Stopped vs. Open Tone", "Vibrato", "Acoustic Check"],
structurePt: "Cada corda solta das ordens agudas (c, g, d, A) existe também como nota presa em 10q (quarta justa, 5 semitons) na ordem imediatamente mais grave — exceto entre a 5ª (F) e a 4ª (A), onde o uníssono ocorre em 8q (terça maior, 4 semitons).",
structureEn: "Each upper open course (c, g, d, A) also exists as a stopped note at 10q (perfect fourth, 5 semitones) on the adjacent lower course — except between 5th (F) and 4th (A), where the unison sits at 8q (major third).",
temperamentPt: "Embora tenham a mesma frequência fundamental, a corda solta soa mais brilhante, longa e aberta, enquanto a mesma nota presa na ordem vizinha possui timbre mais escuro, aveludado e permite vibrato (Hazzah) e portamento (Zahfa). Dominar os uníssonos entre cordas soltas e presas permite mudar de timbre e sustento sem quebrar a continuidade da linha em arranjos de câmara ou fusão.",
temperamentEn: "Though sharing the same fundamental pitch, an open string rings brighter and longer, while the stopped unison on the lower course sounds warmer, darker, and allows vibrato (Hazzah) and glides (Zahfa). Mastering open-to-stopped unisons lets you shift tone and sustain seamlessly in chamber or fusion arrangements.",
pitfallPt: "Usar cordas soltas no meio de uma frase lírica lenta onde todas as outras notas têm vibrato, criando um 'salto de timbre' brusco. Solução: substitua a corda solta pelo uníssono preso na ordem grave quando buscar continuidade vocal. Evite alternar uníssonos sem intenção musical; use a troca de timbre para destacar frases ou respostas.",
pitfallEn: "Letting an un-vibrated open string interrupt a lyrical stopped phrase, causing an abrupt tone jump. Fix: use the stopped unison on the lower course whenever you want vocal continuity. Avoid swapping unisons randomly; use timbre shifts purposefully to highlight phrases or echoes.",
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
temperamentPt: "À medida que você sobe para a 2ª e 3ª posições, o comprimento vibrante da corda diminui logaritmicamente: cada semitom e cada quarto de tom ficam fisicamente mais próximos entre si. A memória auditiva precisa assumir o comando sobre a distância fixa da 1ª posição. Subir para a 2ª e a 3ª posições amplia o alcance melódico do Oud e permite tocar melodias em registros mais altos sem depender de cordas soltas graves.",
temperamentEn: "As you climb into 2nd and 3rd positions, vibrating string length shrinks logarithmically: semitones and quarter tones lie physically closer together, requiring your ear to guide finger spacing. Shifting into 2nd and 3rd positions expands melodic range and lets you play higher lines without relying on open bass courses.",
pitfallPt: "Deixar o polegar 'esquecido' atrás da 1ª posição enquanto estica os dedos para alcançar a 2ª posição. Solução: mova o polegar e o dedo 1 juntos como um bloco único durante os pivôs ⇄P2 e ⇄P3. Não perca a estabilidade do polegar ao deslocar a mão; mantenha o movimento calmo e contínuo.",
pitfallEn: "Leaving the thumb stuck behind 1st position while stretching fingers up into 2nd. Fix: glide thumb and finger 1 together as a single relaxed unit at the ⇄P2 and ⇄P3 pivots. Do not lose thumb stability during shifts; keep the motion calm and continuous.",
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
temperamentPt: "Note a sutileza do retorno (Qafla): após explorar o drama de Ab e B natural no Suznak, restaurar o A natural e o Bb/E- na descida devolve ao ouvinte a sensação física de 'voltar para casa' no Rast original. Modular pelo Ghammaz mostra como renovar a cor de uma improvisação sem perder o centro de gravidade — um recurso valioso em solos longos e arranjos modais.",
temperamentEn: "Notice the magic of the return (Qafla): after exploring the tension of Ab and natural B in Suznak, restoring natural A and E- on the way down creates an unmistakable feeling of homecoming. Modulating via the Ghammaz shows how to refresh color during improvisation without losing tonal gravity — useful in long solos and modal arrangements.",
pitfallPt: "Modular para o novo Jins e esquecer de voltar ao modo de origem, perdendo a unidade do Taqsim. Solução: trate toda modulação como uma visita temporária — estabeleça o Ghammaz, apresente a nova cor em 2 ou 3 frases e retorne ao Qarar. Não mude de direção harmônica ou modal sem preparar o ouvinte; conecte as frases com clareza.",
pitfallEn: "Modulating into a new Jins and failing to resolve back to the home mode. Fix: treat every modulation as a round-trip visit — anchor Ghammaz, color 2–3 phrases, then return home to Qarar. Do not shift color abruptly without guiding the ear; link phrases with clear intent.",
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

les_13_bariolage_pedal: {
tagsPt: ["Bariolage", "Pedal de Corda Solta", "Palhetada Alternada ↓↑", "Escola Iraquiana"],
tagsEn: ["Bariolage", "Open-Course Pedal", "Alternate Picking ↓↑", "Iraqi School"],
structurePt: "O Bariolage cria a ilusão de duas vozes simultâneas no Oud: uma linha melódica móvel em uma ordem (por exemplo, C–Bb–A–G na 2ª ordem) dialoga com uma nota fixa constante (o pedal de D solto na 3ª ordem), gerando textura hipnótica e riqueza harmônica sem exigir acordes.",
structureEn: "Bariolage creates the illusion of two simultaneous voices on the Oud: a moving melodic line on one course (e.g., C–Bb–A–G on the 2nd course) alternates with a fixed open-string pedal (open D on the 3rd course), creating rich counterpoint without full chords.",
temperamentPt: "A dinâmica da mão direita define a clareza do Bariolage: a melodia precisa soar em primeiro plano (golpe descendente ↓ firme) enquanto o pedal na corda solta responde em segundo plano (~50% do volume, golpe ascendente ↑ leve), evitando embolar a caixa acústica. O bariolage cria textura polifônica sugestiva no Oud e funciona muito bem em passagens ostinato, acompanhamentos modais e diálogos rítmicos.",
temperamentEn: "Right-hand dynamics make or break Bariolage: project the moving melody in front (firm ↓ downstroke) while keeping the open pedal softer (~50% volume, light ↑ upstroke) so it supports without masking the line. Bariolage creates a rich two-voice illusion on the Oud that shines in ostinatos, modal vamps, and rhythmic interplay.",
pitfallPt: "Tocar a corda solta pedal no mesmo volume (ou mais forte) que a melodia, ou tocar ambas com palhetada apenas para baixo, perdendo velocidade. Solução: treine devagar em ↓ (melodia) – ↑ (pedal) exagerando a diferença de volume. Evite deixar o pedal abafar a melodia principal ou quebrar a regularidade da palhetada.",
pitfallEn: "Plucking the open pedal as loudly as the melody or using all downstrokes. Fix: practice slowly with strict ↓ (melody) – ↑ (pedal), deliberately keeping the pedal whisper-soft. Avoid letting the pedal mask the melody or disrupting even picking rhythm.",
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
temperamentPt: "A Zahfa (deslize rápido de 1 ou 2 quartos de tom com o mesmo dedo) é o que conecta o Oud à voz humana no canto árabe. Em Sikah, abordar o E- deslizando discretamente de baixo (D# → E-) reforça a percepção do quarto de tom sem soar desafinado. A zahfa aproxima o Oud da expressividade vocal e ajuda a dar vida a inflexões microtonais ou slides sutis em estilos líricos e interculturais.",
temperamentEn: "Zahfa (a brisk 1- or 2-quarter-tone glide with one finger) links the Oud to Arabic vocal ornamentation. Approaching Sikah's E- with a subtle upward nudge (D# → E-) clarifies its microtonal identity. Zahfa brings vocal expressiveness to the Oud and gives life to subtle microtonal inflections or slides across lyrical and cross-cultural styles.",
pitfallPt: "Fazer um deslize lento e contínuo demais (estilo slide-guitar), deixando o ouvinte sem saber onde a nota realmente pousou. Solução: inicie o deslize logo após o ataque da Risha e trave o dedo com firmeza imediata no centro do E-. Evite deslizes longos e imprecisos que tirem a clareza da nota de chegada.",
pitfallEn: "Gliding too slowly so the destination pitch feels vague. Fix: execute the glide right after the Risha attack and lock the fingertip still on the exact center of E-. Avoid long, aimless slides that blur the arrival pitch.",
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
temperamentPt: "Acusticamente, palhetar próximo ao cavalete (estética Síria/Levantina) excita harmônicos agudos e médios definidos, com decaimento mais seco ideal para passagens velozes; palhetar próximo à roseta (estética Egípcia) reforça a fundamental e os graves do bojo, favorecendo frases longas e cantadas (Tarab). Variar o ponto de palhetada entre cavalete e roseta é um recurso direto para adaptar a presença do Oud a arranjos mais secos/percussivos ou mais quentes/cantados.",
temperamentEn: "Acoustically, plucking near the bridge (Syrian/Levantine aesthetic) emphasizes upper midrange harmonics and dry articulation ideal for agile runs; plucking near the main rosette (Egyptian aesthetic) boosts fundamental warmth for lyrical Tarab singing lines. Shifting strike position between bridge and rosette is a direct way to adapt Oud presence for drier/percussive or warmer/singing arrangements.",
pitfallPt: "Manter a mão direita sempre travada no mesmo ponto do tampo em todas as frases. Solução: experimente tocar a abertura (Istihlal) perto da roseta (timbre quente) e mover gradualmente 3 cm em direção ao cavalete nos clímax rítmicos. Não deixe a escolha de timbre desligada do espaço do arranjo; ajuste o ataque ao que a música pede.",
pitfallEn: "Locking the right hand in one static spot for every phrase. Fix: play intimate openings near the rosette for warmth, then drift 3 cm toward the bridge when building rhythmic intensity. Do not separate tone choice from ensemble space; tailor attack to what the arrangement needs.",
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

les_16_maqam_saba: {
tagsPt: ["4ª Diminuta (Gb / b4)", "Tetracorde Sobreposto", "Jins Hijaz em F (b3)", "Pungência (Huzn)"],
tagsEn: ["Diminished 4th (Gb / b4)", "Overlapping Ajnas", "Jins Hijaz on F (b3)", "Pathos (Huzn)"],
structurePt: "O Maqam Saba é estruturalmente fascinante porque NÃO fecha uma oitava tradicional de 1º + 2º Jins em 4ª ou 5ª justa: sua base é Jins Saba (D–E-–F–Gb), sobreposto imediatamente por Jins Hijaz no 3º grau (F–Gb–A–Bb) e Jins Nikriz ou Ajam no 6º grau (Bb). A 4ª justa (G) praticamente desaparece!",
structureEn: "Maqam Saba is structurally unique because it breaks the standard 4th/5th octave split: lower Jins Saba (D–E-–F–Gb) overlaps immediately with Jins Hijaz on the 3rd degree (F–Gb–A–Bb), followed by Ajam/Nikriz on Bb. The perfect 4th (G) vanishes.",
temperamentPt: "No Saba, o E- tende a ser ainda mais íntimo/baixo que no Bayati, e o Gb (Hijaz) aproxima-se fortemente do F (3º grau), criando um semitom muito estreito e doloroso (Gb → F). É esse atrito microtonal que torna o Saba o modo máximo da saudade e do lamento. A intensidade expressiva do Saba pede controle fino de afinação e espaço dinâmico para que sua tensão característica emocione sem perder clareza.",
temperamentEn: "In Saba, E- leans even lower than in Bayati, while Gb pulls tightly downward into F (3rd degree), forming an intensely narrow semitone (Gb → F). That microtonal friction defines Saba's poignant emotional depth. Saba's poignant intensity calls for careful pitch control and dynamic breathing room so its tension moves the listener cleanly.",
pitfallPt: "Tocar acidentalmente a 2ª ordem solta (G natural), o que quebra imediatamente o feitiço do Saba e soa como Bayati. Solução: mantenha o foco total em Gb preso na 3ª ordem (ou 2ª ordem a partir de A) e descanse bastante no 3º grau F. Não apresse os momentos de suspensão e resolução; deixe o peso emocional do modo se firmar.",
pitfallEn: "Accidentally striking open 2nd course (G natural), which instantly breaks Saba's spell and reverts to Bayati. Fix: anchor on stopped Gb and linger expressively on degree 3 (F). Do not rush moments of tension and release; let the mode's emotional weight settle.",
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
temperamentPt: "A respiração do 10/8 clássico divide-se em 3 + 2 + 2 + 3 colcheias: DUM (1–2–3) · ess–TAK (4–5) · DUM–DUM (6–7) · TAK–ess–ess (8–9–10). A leve expansão expressiva sobre o último bloco de 3 colcheias dá nobreza ao fraseado. Trabalhar compassos assimétricos como o 10/8 amplia a escuta rítmica e prepara o Oud para ritmos compostos de outras tradições do Mediterrâneo e do mundo.",
temperamentEn: "Classical 10/8 breathes in 3 + 2 + 2 + 3 eighth notes: DUM (1–2–3) · rest–TAK (4–5) · DUM–DUM (6–7) · TAK–rest–rest (8–9–10). Letting the closing 3-eighth block breathe unhurriedly gives the groove aristocratic poise. Working with asymmetric meters like 10/8 broadens rhythmic listening and prepares the Oud for compound grooves across Mediterranean and world traditions.",
pitfallPt: "Contar 10/8 de forma apressada como se fosse um 4/4 truncado, comendo a pausa dos tempos 9 e 10. Solução: fale em voz alta 'DUM (2-3) · es-TAK · DUM-DUM · TAK (9-10)' batendo o pé apenas nos 4 blocos principais. Evite forçar uma leitura quadrada dentro do 10/8; sinta a divisão interna dos grupos rítmicos.",
pitfallEn: "Rushing beats 9 and 10 until 10/8 collapses into a hurried 4/4. Fix: vocalize 'DUM (2-3) · rest-TAK · DUM-DUM · TAK (9-10)' while feeling only the 4 asymmetric macro-beats. Avoid forcing square four-beat phrasing onto 10/8; feel its internal rhythmic groupings.",
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
temperamentPt: "O Iqa' Malfuf (também chamado Laff) é um ciclo ágil em 2/4 acentuado em 3 + 3 + 2 semicolcheias (DUM · · TAK · · TAK ·). Muito usado em aberturas virtuosísticas e danças folclóricas, exige pulso firme de Risha alternada. A energia dramática do Nawa Athar sobre pulsos ágeis como o Malfuf favorece temas marcantes, danças e passagens rítmicas de forte impulso.",
temperamentEn: "Iqa' Malfuf (also called Laff) is a brisk 2/4 cycle accented 3 + 3 + 2 sixteenths (DUM · · TAK · · TAK ·). Widely used in energetic overtures and folkloric dances, it rewards tight alternating Risha. Nawa Athar's dramatic punch over brisk cycles like Malfuf suits bold themes, dances, and high-energy rhythmic passages.",
pitfallPt: "Deixar o F# (4º grau aumentado) baixo demais na 3ª ordem dentro do Shape Móvel fechado. Solução: confira o F# ouvindo sua atração imediata de semitom contra o G (Ghammaz). Mantenha a afinação firme mesmo quando o andamento acelera e o fraseado ganha impulso.",
pitfallEn: "Playing #4 (F#) flat inside the closed Movable Box. Fix: tune F# directly against its tight semitone pull into the Ghammaz (G). Keep intonation steady even as tempo picks up and phrasing builds drive.",
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

les_19_modal_chords_voicing: {
tagsPt: ["Voicing (1 Nota/Ordem)", "Heterofonia vs. Polifonia", "Oud Contemporâneo", "Rasgueio Controlado"],
tagsEn: ["1-Note/Course Voicing", "Heterophony vs. Polyphony", "Modern Oud", "Controlled Strum"],
structurePt: "Na tradição árabe clássica, todos os instrumentos tocam variações da mesma linha melódica (heterofonia). A partir do século XX, compositores e alaudistas modernos introduziram acordes abertos de 3 a 4 ordens — privilegiando quartas, quintas e intervalos vazios que preservam o caráter modal sem soar como violão pop.",
structureEn: "Classical Arabic music is heterophonic (ensemble variations of one melody). Since the 20th century, modern Oud composers introduced open 3-to-4 course voicings — favoring fourths, fifths, and airy intervals that preserve modal space.",
temperamentPt: "Em um instrumento de 11 ou 12 cordas afinadas em pares, acordes densos de 5 ou 6 ordens facilmente ficam turvos. Os melhores voicings no Oud usam 3 ou 4 ordens contíguas, aproveitando ao menos uma corda solta para manter a ressonância cristalina. Voicings abertos e econômicos evitam o choque harmônico das cordas duplas e permitem que o Oud acompanhe ou pontue a harmonia sem pesar a textura.",
temperamentEn: "On an 11- or 12-string double-course instrument, dense 5- or 6-course chords easily turn muddy. The finest Oud voicings span 3 or 4 adjacent courses, incorporating at least one open course for clarity. Open, economical voicings avoid double-course muddiness and let the Oud support or punctuate harmony lightly.",
pitfallPt: "Rasguear o acorde rápido e forte demais com a Risha dura, gerando ruído de palheta que encobre as notas. Solução: incline a Risha em ~30° e atravesse as ordens lentamente, deixando cada corda florescer. Evite acordes fechados e densos demais no registro grave quando outros instrumentos já ocupam essa faixa.",
pitfallEn: "Strumming too fast and hard with a stiff Risha, causing pick clatter. Fix: angle the Risha ~30° and sweep across the courses slowly so each pitch blooms. Avoid thick, closed low-register chords when other instruments already fill that range.",
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
temperamentPt: "Como a terça neutra não coincide com os primeiros harmônicos naturais do baixo C, a tríade neutra soa mais transparente quando arpejada (nota após nota) ou tocada com a 3- uma oitava acima do bordão grave (voicing aberto). A sonoridade neutra da tríade de Rast oferece um caminho harmônico singular para músicas modais e fusões que fogem do contraste estrito entre maior e menor.",
temperamentEn: "Because a neutral third sits between pure overtone ratios of the bass C, neutral triads sound clearest when arpeggiated or spaced openly with the 3- an octave above the bass root. The neutral Rast triad offers a distinctive harmonic color for modal pieces and fusions beyond strict major/minor contrasts.",
pitfallPt: "Instintivamente puxar o E- para Eb ou E natural ao ouvir a quinta C–G soar junto. Solução: arpeje devagar C → G → E- olhando o ponteiro da Escuta 24-TET para treinar seu cérebro a aceitar o repouso neutro. Ouça com atenção o equilíbrio entre as notas para que o acorde soe intencional e transparente.",
pitfallEn: "Subconsciously pulling E- toward Eb or E natural when hearing it against C–G. Fix: slowly arpeggiate C → G → E- with Live Pitch 24-TET active until your ear accepts the neutral rest. Listen carefully to balance across voices so the chord sounds intentional and clear.",
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
temperamentPt: "Em progressões como Eb Maior → D Maior (bII → I no Hijaz em D), o movimento paralelo de semitom para baixo cria forte atração modal sem introduzir notas estrangeiras ao Maqam. Compreender cadências modais ajuda a construir fechamentos naturais em peças modais e a dialogar com progressões de outros gêneros sem perder o centro tonal.",
temperamentEn: "In progressions like Eb Major → D Major (bII → I in D Hijaz), downward semitone motion creates compelling resolution without borrowing foreign pitches outside the Maqam. Understanding modal cadences helps craft natural endings in modal pieces and bridge into other genres without losing tonal center.",
pitfallPt: "Tocar cada acorde da cadência como um bloco isolado, levantando todos os dedos a cada troca. Solução: identifique qual dedo permanece próximo (ou na mesma ordem) entre um passo e o seguinte do sequenciador. Não encadeie acordes sem pensar na condução das vozes e no destino da frase.",
pitfallEn: "Lifting all fingers off the neck between every chord step. Fix: spot guide fingers that stay on the same course or slide by one semitone between adjacent sequencer steps. Avoid stringing chords together without thinking about voice leading and phrase destination.",
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

les_22_pos_third_body: {
tagsPt: ["Registro Jawab (Oitava Aguda)", "3ª Posição no Tampo", "Espaçamento Logarítmico", "Clímax do Taqsim"],
tagsEn: ["Jawab Register (High Octave)", "3rd Position Over Body", "Logarithmic Spacing", "Taqsim Climax"],
structurePt: "Na teoria árabe, a oitava grave chama-se Qarar, o registro médio chama-se Wasat e a oitava aguda chama-se Jawab ('resposta'). No Oud, o Jawab habita a 3ª Posição sobre o tampo (acima de 10q na 1ª e 2ª ordens), onde a música atinge seu ápice emocional.",
structureEn: "In Arabic theory, the low octave is Qarar, the middle register is Wasat, and the high octave is Jawab ('answer'). On the Oud, Jawab lives in 3rd Position over the soundboard (past 10q on courses 1–2), where solos reach their peak.",
temperamentPt: "Acima de 10q, a distância física de 1 quarto de tom cai para menos de metade do que era junto à pestana! Além disso, a altura das cordas sobre o tampo (ação) é ligeiramente maior — exigindo dedos firmes bem na ponta e ajuste microscópico de intonação. Explorar a região sobre o tampo abre um registro agudo brilhante que ajuda a destacar melodias ou respostas sobre acompanhamentos mais densos.",
temperamentEn: "Past 10q, the physical width of a quarter tone shrinks to less than half its width near the nut, while string action rises slightly — demanding upright fingertips and micro-precise ear control. Exploring the body register opens a bright treble range that helps melodies or answers cut through fuller accompaniments.",
pitfallPt: "Subir o ombro esquerdo ou inclinar o instrumento para tentar enxergar o tampo, perdendo a estabilidade do polegar na curva do braço. Solução: mantenha o Oud estável no colo e apoie a lateral do polegar na junta do braço como âncora fixa. Cuide da afinação e do ataque nos agudos para que o som continue limpo e cantado.",
pitfallEn: "Hunching the left shoulder or tilting the Oud to stare at the soundboard. Fix: keep the Oud stable in your lap and rest the side of your thumb against the neck heel as a fixed anchor. Watch pitch and attack in the upper register so notes stay clean and singing.",
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
temperamentPt: "Na metade superior (a partir do Ghammaz G), o Nikriz tradicional usa Jins Nahawand (G–A–Bb–c) ou Jins Rast (G–A–B-–c), o que suaviza o drama da base — diferenciando-o do Nawa Athar (que empilha um segundo Hijaz no topo). O contraste entre a base marcante do Nikriz e sua parte superior abre caminhos expressivos tanto para improvisos modais quanto para temas de caráter dramático.",
temperamentEn: "In its upper half (from Ghammaz G), traditional Nikriz uses Jins Nahawand (G–A–Bb–c) or Jins Rast (G–A–B-–c), softening the lower drama — distinguishing it from Nawa Athar (which stacks a second Hijaz on top). The contrast between Nikriz's bold lower block and its upper color opens expressive paths for modal improvisations and dramatic themes.",
pitfallPt: "Confundir o centro tonal do Nikriz em C com o Hijaz em D por compartilharem as mesmas notas D–Eb–F#–G. Solução: enfatize sempre a queda Eb → D → C e o apoio grave no Qarar C. Evite perder o centro de gravidade da tônica ao explorar os saltos e acidentes característicos.",
pitfallEn: "Letting C Nikriz drift into sounding like D Hijaz since they share D–Eb–F#–G. Fix: repeatedly anchor the low Qarar C and highlight the Eb → D → C cadence. Avoid losing tonal gravity while exploring signature leaps and accidentals.",
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
temperamentPt: "O Iqa' Ayyub (ou Zar, em 2/4: DUM · · KAH · DUM · TAK ·) tem pulso pendular hipnótico associado às cerimônias sufis (Zikr) e danças tradicionais. Começa lento e costuma acelerar organicamente ao longo da peça. Transpor (taswir) sobre pulsos rítmicos contínuos é essencial para acompanhar vozes, adaptar arranjos a outras formações e ganhar fluência em todo o braço.",
temperamentEn: "Iqa' Ayyub (or Zar, 2/4: DUM · · KAH · DUM · TAK ·) has a hypnotic swaying pulse tied to Sufi Zikr ceremonies and folk dances, often accelerating gradually from meditative to ecstatic. Transposing (taswir) over steady rhythmic cycles is essential for accompanying singers, adapting arrangements, and gaining full-neck fluency.",
pitfallPt: "Depender exclusivamente das digitações com cordas soltas da 1ª Posição e travar quando precisa acompanhar um cantor em outro tom. Solução: pratique o Shape Móvel fechado sem nenhuma corda solta para ganhar liberdade de transposição em 360°. Não dependa apenas de uma digitação fixa; treine reconhecer os intervalos em novas tônicas.",
pitfallEn: "Relying exclusively on 1st-position open-string fingerings and freezing when a singer asks for a different key. Fix: drill the closed Movable Box without open strings to gain effortless transposition. Do not rely on a single fingering shape; practice recognizing intervals from new roots.",
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

les_25_egyptian_cairo_school: {
tagsPt: ["Afinação Egípcia (D–G–A–d–g–c)", "Escola do Cairo", "Tarab & Legato", "Bordões em D e G"],
tagsEn: ["Egyptian Tuning (D–G–A–d–g–c)", "Cairo School", "Tarab & Legato", "D & G Bass Courses"],
structurePt: "A afinação Egípcia (D–G–A–d–g–c) substitui o C grave por D na 6ª ordem e o F por G na 5ª ordem. O resultado é imediato: os dois bordões graves passam a coincidir exatamente com o Qarar (D) e o Ghammaz (G) dos Maqamat mais tocados no Egito (Bayati, Hijaz, Saba e Kurd).",
structureEn: "Egyptian tuning (D–G–A–d–g–c) replaces low C with D on the 6th course and F with G on the 5th. Instantly, both bass courses resonate on the exact Qarar (D) and Ghammaz (G) of Egypt's core Maqamat (Bayati, Hijaz, Saba, Kurd).",
temperamentPt: "Os Ouds egípcios tradicionalmente têm corpo ligeiramente maior, tampo mais robusto e som quente, grave e sustentado. A escola do Cairo (Mohamed al-Qasabgi, Riyad al-Sunbati, Farid al-Atrash) privilegia fraseado cantável, vibrato generoso e forte carga dramática (Tarab). A estética mais quente e cantada associada à tradição do Cairo inspira fraseados expressivos e acompanhamentos de grande ressonância em contextos líricos.",
temperamentEn: "Egyptian Ouds traditionally feature a slightly larger bowl and warm, deep sustain. The Cairo school (al-Qasabgi, al-Sunbati, Farid al-Atrash) champions vocal phrasing, rich vibrato, and emotional Tarab. The warmer, singing aesthetic tied to Cairo tradition inspires lyrical phrasing and resonant support in expressive settings.",
pitfallPt: "Esquecer que a 5ª ordem agora é G (e não F) e tocar padrões antigos de 1ª posição na 5ª e 6ª ordens sem ajustar o ouvido. Solução: use os bordões D e G soltos como pontuação grave nas pausas do Sayr. Evite exagerar no vibrato ou na sustentação a ponto de tirar a clareza rítmica do conjunto.",
pitfallEn: "Forgetting that the 5th course is now G (not F) and playing Syrian bass fingerings out of habit. Fix: use open low D and G deliberately as resonant bass punctuation at phrase endings. Avoid overdoing vibrato or sustain so much that rhythmic clarity with the group blurs.",
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
temperamentPt: "Na teoria clássica otomana (sistema Arel–Ezgi–Uzdilek), a oitava divide-se em 53 comas de Holder (~22,6¢ por coma), não em 24 quartos de tom. Por isso, o 2º grau do Makam Uşşak (irmão do Bayati) soa mais alto (~1–2 comas abaixo de E natural) do que o 2- do Bayati árabe, conferindo um sotaque inconfundível à escola de Istambul. A articulação ágil e a clareza da escola de Istambul oferecem ótimas referências para ornamentos precisos, melodias ornamentadas e diálogos rítmicos.",
temperamentEn: "Classical Ottoman theory (Arel–Ezgi–Uzdilek) divides the octave into 53 Holderian commas (~22.6¢ each) rather than 24 quarter tones. Consequently, Makam Uşşak's 2nd degree sits subtly different from Arabic Bayati, giving Istanbul its unmistakable accent. The agile articulation and clarity of Istanbul tradition offer strong cues for crisp ornaments, ornate melodies, and rhythmic interplay.",
pitfallPt: "Aplicar a mesma força pesada de Risha do Oud egípcio sobre o timbre agudo da afinação turca. Solução: alivie o punho direito e explore golpes curtos e leves com ornamentos ágeis de mão esquerda. Não sacrifique a precisão da afinação e da pulsação ao buscar agilidade nos ornamentos.",
pitfallEn: "Using heavy Egyptian Risha pressure on the brighter Turkish tuning. Fix: lighten the right wrist and favor nimble, crisp ornaments and clean staccato clarity. Do not sacrifice pitch accuracy or steady pulse when chasing ornament speed.",
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
temperamentPt: "Muitos Ouds iraquianos utilizam cavalete flutuante (preso por cordal na base, semelhante ao violoncelo) e rosetas ovais sem madeira sob o cavalete, produzindo um ataque focado, límpido e meditativo onde cada nota pode decair no silêncio com precisão cirúrgica. A clareza espacial e o uso consciente do silêncio da escola de Bagdá são fundamentais em formações acústicas, solos e fusões onde cada nota precisa falar.",
temperamentEn: "Many Iraqi Ouds use a floating bridge with a tailpiece and oval soundholes, producing a focused, crystalline, meditative sustain where every single note decays cleanly into silence. Baghdad tradition's spatial clarity and purposeful silence shine in acoustic ensembles, solos, and fusions where every note matters.",
pitfallPt: "Preencher todos os segundos com notas rápidas sem deixar espaço acústico. Solução: adote a disciplina de Bagdá — após cada frase de 4 a 6 notas, conte 2 tempos de silêncio absoluto ouvindo a caixa ressoar. Evite preencher todos os espaços com notas; deixe o silêncio e a ressonância cumprirem seu papel.",
pitfallEn: "Filling every beat with nonstop notes. Fix: adopt Baghdad discipline — after every 4-to-6 note phrase, leave 2 beats of total silence to hear the instrument's decay. Avoid filling every gap with notes; let silence and resonance do their work.",
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

les_28_taqsim_architecture: {
tagsPt: ["Dramaturgia em 4 Atos", "Istihlal (Ato 1)", "Ghammaz (Ato 2)", "Jawab (Ato 3) & Qafla (Ato 4)"],
tagsEn: ["4-Act Dramatic Arc", "Istihlal (Act 1)", "Ghammaz (Act 2)", "Jawab (Act 3) & Qafla (Act 4)"],
structurePt: "Um grande Taqsim não é um fluxo aleatório de notas, mas uma narrativa arquitetônica: (1) Istihlal — apresenta o 1º Jins no registro médio-grave sem pressa; (2) Ghammaz — desenvolve o 2º Jins e abre espaço para modulações; (3) Jawab — atinge o ápice emocional na oitava aguda; (4) Qafla — desce em arco controlado até repousar no Qarar.",
structureEn: "A great Taqsim is not random noodling but an architectural story: (1) Istihlal — calmly establishes the lower Jins; (2) Ghammaz — develops the upper Jins and modulations; (3) Jawab — peaks in the high octave; (4) Qafla — descends gracefully home to Qarar.",
temperamentPt: "Nos minutos iniciais (Istihlal), o foco está em cravar a afinação exata das notas características (como E- no Rast) para 'afinar o ouvido do público' no Maqam escolhido antes de qualquer virtuosismo. Pensar em começo, desenvolvimento, ponto alto e fechamento ajuda a estruturar solos em qualquer estilo, evitando improvisações soltas ou sem destino.",
temperamentEn: "During the opening Istihlal, your job is to lock the intonation of signature pitches (like Rast's E-) so the listener's ear settles into the Maqam before any virtuosity appears. Thinking in opening, development, peak, and closure helps shape solos in any style, avoiding aimless rambling.",
pitfallPt: "Subir logo nos primeiros 10 segundos para as notas mais agudas e rápidas, deixando o restante do Taqsim sem curva dramática. Solução: respeite o mapa de alturas — guarde a 1ª corda aguda e a 3ª Posição exclusivamente para o Ato 3. Não queime todo o registro e a intensidade logo no início; construa o arco aos poucos.",
pitfallEn: "Jumping to your highest, fastest notes in the first 10 seconds, flattening the dramatic arc. Fix: honor register discipline — save the high 1st course and 3rd Position strictly for Act 3. Do not spend full range and intensity right at the start; build the arc gradually.",
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
temperamentPt: "Em modulações encadeadas, a chave é a transição suave do grau que muda: por exemplo, ao passar de Bayati para Saba, reforce o 3º grau F antes de abaixar G para Gb; ao voltar do Saba para o Bayati, celebre o retorno da 4ª justa G com firmeza. Encadear modulações com propósito mantém o interesse ao longo de uma peça ou improviso, desde que cada parada tenha clareza e retorno coerente.",
temperamentEn: "In chained modulations, spotlight the exact changing pitch: when entering Saba from Bayati, linger on F before dropping G to Gb; when returning home, highlight the restoration of natural G clearly. Chaining modulations with purpose sustains interest across a piece or solo when each stop is clear and resolves coherently.",
pitfallPt: "Trocar de Maqam a cada 3 segundos sem deixar o ouvinte absorver a cor de cada parada. Solução: dedique pelo menos 2 frases completas (pergunta e resposta) a cada Jins visitado antes de seguir para o próximo. Evite trocar de modo ou cor sem objetivo melódico; dê tempo para cada mudança se firmar.",
pitfallEn: "Switching Maqamat every 3 seconds before the listener absorbs each color. Fix: give every visited Jins at least 2 full call-and-response phrases before moving on. Avoid shifting colors without melodic purpose; give each change time to settle.",
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
temperamentPt: "No palco limpo do Modo Imersivo (Zen), reduza o apoio visual ao mínimo e confie na triangulação que você treinou ao longo dos 10 capítulos: ouvido interno (cantar a frase mentalmente), ressonância acústica da madeira e feedback pontual da Escuta 24-TET. Unir escuta, afinação, articulação e senso de forma é o que mantém a identidade do Oud viva em qualquer repertório, do clássico às fusões contemporâneas.",
temperamentEn: "Inside Zen Stage, rely less on visual labels and trust the triangle you trained across all 10 chapters: inner ear (singing phrases mentally), natural wood resonance, and occasional Live Pitch 24-TET checks. Uniting listening, intonation, articulation, and sense of form keeps the Oud's identity alive across any repertoire, from classical to fusion.",
pitfallPt: "Encerrar o estudo achando que é preciso tocar todas as técnicas ao mesmo tempo. Solução: a maestria no Oud mede-se pela clareza da intonação, pela beleza do timbre e pela sinceridade de cada pausa. Evite tocar no automático; ouça o som produzido e a música ao redor a cada frase.",
pitfallEn: "Trying to cram every technique into a single solo. Fix: mastery on the Oud is measured by pure intonation, resonant tone, and the musical truth of every pause. Avoid playing on autopilot; listen to your tone and the surrounding music in every phrase.",
repertoire: [
  {
    piece: "Wasla Completa / Concerto Solo de Oud (Taqsim + Sama'i)",
    artist: "Munir Bashir / Simon Shaheen / Naseer Shamma",
    query: "Oud Solo Recital Taqsim Samai",
    listenForPt: "Aprecie a transição orgânica entre a improvisação livre inicial e a entrada pulsada do Sama'i, inspirando sua própria apresentação no Modo Imersivo.",
    listenForEn: "Enjoy the seamless bridge from free rubato improvisation into the pulsed Sama'i, inspiring your own Zen Stage recital."
  }
]
},

les_31_dorian_aeolian_folk: {
tagsPt: ["Modo Dórico (1–2–b3–4–5–6–b7)", "6ª Maior Característica", "Folk Celta & Modal", "Bordão em D"],
tagsEn: ["Dorian Mode (1–2–b3–4–5–6–b7)", "Signature Major 6th", "Celtic & Modal Folk", "Open D Drone"],
structurePt: "O Modo Dórico compartilha 6 das 7 notas da escala menor natural (Eólio), trocando apenas a 6ª menor (b6) pela 6ª maior (6). No Oud em D, essa nota é o B natural na 2ª ordem (4q) — que cria um contraste luminoso imediato contra a 3ª menor (F).",
structureEn: "Dorian shares 6 of 7 pitches with Natural Minor (Aeolian), raising only b6 to a natural 6th. On a D-rooted Oud, that pitch is B natural on the 2nd course (4q) — creating an instant bright lift against minor 3rd F.",
temperamentPt: "Em contextos de Folk europeu, Rock modal e trilhas sonoras, todas as notas seguem 12-TET limpo. Ainda assim, o timbre amadeirado de cordas duplas do Oud e a ausência de trastes permitem glissandos sutis na 6ª maior e na 7ª menor que lembram a gaita de foles e o bouzouki irlandês. Na integração com Folk e Rock modal, os bordões soltos (especialmente D e A) funcionam como chão contínuo enquanto a melodia circula entre a 3ª e a 2ª ordens com Risha alternada leve.",
temperamentEn: "In European Folk, modal Rock, and film scoring, pitches follow clean 12-TET. Yet the Oud's double-course wood resonance and fretless glides on the 6th and b7 evoke Celtic bouzouki and uilleann pipes naturally. In Folk and modal Rock settings, open courses (especially D and A) serve as a steady pedal while melodies weave across the 3rd and 2nd courses with light alternating Risha.",
pitfallPt: "Cair no hábito do Maqam Nahawand/Kurd tocando Bb em vez de B natural por reflexo da mão esquerda. Solução: destaque deliberadamente o salto F → B → A nas primeiras frases para gravar o brilho Dórico no ouvido. Evite cadências tonais fechadas demais que quebrem o caráter modal aberto do acompanhamento.",
pitfallEn: "Slipping back into Bb out of Nahawand/Kurd muscle memory. Fix: deliberately emphasize F → B → A in your opening phrases to lock Dorian's brightness into your ear. Avoid overly tonal cadential clichés that flatten the open modal feel of the accompaniment.",
repertoire: [
  {
    piece: "Scarborough Fair / Folk Modal em Dórico no Oud",
    artist: "Tradição Celta / Interpretações em Oud & Alaúde",
    query: "Oud Dorian Folk Celtic improvisation",
    listenForPt: "Repare como a 6ª maior (B natural em D) ilumina a frase principal sem jamais perder o clima ancestral do modo menor.",
    listenForEn: "Hear how the natural 6th (B in D Dorian) brightens the melody while keeping its ancient minor gravity."
  }
]
},

les_32_lydian_mixolydian_open: {
tagsPt: ["Modo Lídio (#4)", "Atmosfera Cinematográfica", "Mixolídio (b7)", "Sustentação na Roseta"],
tagsEn: ["Lydian Mode (#4)", "Cinematic Atmosphere", "Mixolydian (b7)", "Rosette Sustain"],
structurePt: "O Modo Lídio (C–D–E–F#–G–A–B) elimina a tensão descendente da 4ª justa (F → E) e a substitui por uma 4ª aumentada ascendente (F# → G). Já o Mixolídio (C–D–E–F–G–A–Bb) rebaixa a 7ª para b7, espelhando a descida clássica do Maqam Ajam.",
structureEn: "Lydian (C–D–E–F#–G–A–B) replaces the downward pull of the perfect 4th (F → E) with an upward-floating #4 (F# → G). Mixolydian (C–D–E–F–G–A–Bb) lowers the 7th to b7, mirroring the descending path of Maqam Ajam.",
temperamentPt: "Em música de cinema e fusão acústica, tocar Lídio no Oud com o perfil Egípcio próximo à roseta produz sobretons aveludados que se misturam perfeitamente a violoncelo, piano e sintetizadores ambientes. Em arranjos cinematográficos e ambientes, tocar próximo à roseta com o perfil Egípcio valoriza a sustentação das notas abertas e o contraste entre o #4 do Lídio e a b7 do Mixolídio.",
temperamentEn: "In film scoring and acoustic fusion, playing Lydian on the Oud with the warm Egyptian profile near the rosette yields velvety overtones that blend seamlessly with cello, piano, and ambient pads. In cinematic and ambient settings, plucking near the rosette with the Egyptian profile highlights open sustain and contrasts Lydian's #4 against Mixolydian's b7.",
pitfallPt: "Deixar o F# (#4) soar isolado sem resolver no G ou no E, fazendo o ouvido perder a tônica C. Solução: use o Drone em C e ancore os finais de frase na tríade C–E–G antes de flutuar pelo F#. Se houver outros instrumentos harmônicos na gravação, evite repetir a tônica em excesso e prefira notas longas com espaço.",
pitfallEn: "Letting #4 (F#) wander without anchoring C, making the ear drift into G Major. Fix: keep the C Drone on and ground phrase endings on C–E–G before floating over F#. When chording instruments are present, avoid over-repeating the root and favor sustained tones with generous space.",
repertoire: [
  {
    piece: "Astrakan Café / Paisagens Modais em Oud",
    artist: "Anouar Brahem / Ara Dinkjian",
    query: "Anouar Brahem Oud Lydian ambient",
    listenForPt: "Observe o uso de intervalos abertos de 5ª, 7ª maior e #4 deixando o bojo do Oud soar como um instrumento camerístico.",
    listenForEn: "Notice the spacious 5ths, major 7ths, and #4 colors letting the Oud sing like a chamber instrument."
  }
]
},

les_33_power_voicings_box: {
tagsPt: ["Power Chord (1–5)", "Quartas Justas (A–d–g–c)", "Shape Móvel Fechado", "Palm Mute de Risha"],
tagsEn: ["Power Chord (1–5)", "Perfect Fourths (A–d–g–c)", "Closed Movable Box", "Risha Palm Mute"],
structurePt: "Um Power Voicing (1–5, ex.: D–A) omite a terça — por isso funciona igualmente bem sobre modos maiores, menores ou microtonais! Nas 4 ordens agudas afinadas em quartas (A–d–g–c), a quinta justa fica sempre 1 tom (4q) à frente na ordem mais aguda vizinha.",
structureEn: "A Power Voicing (1–5, e.g. D–A) omits the 3rd — making it compatible with major, minor, or microtonal melodies alike! Across the four fourth-tuned upper courses (A–d–g–c), the perfect 5th always sits 1 whole tone (4q) forward on the next higher course.",
temperamentPt: "A quinta justa pura (razão 3:2) é o intervalo mais consonante depois da oitava. No braço sem trastes, quando dedo 1 e dedo 3 cravam a quinta exata, o batimento acústico desaparece e o tampo do Oud vibra com o dobro de projeção. Quando o Oud acompanha guitarra, baixo ou percussão em 12-TET, os voicings de quinta justa (1–5) e sus4 evitam atritos de terça e oferecem pulso rítmico direto.",
temperamentEn: "A pure perfect fifth (3:2 ratio) is the most resonant interval after the octave. On a fretless neck, locking finger 1 and finger 3 on a pure fifth makes beating vanish and doubles soundboard projection. Alongside guitar, bass, or percussion in 12-TET, open fifth (1–5) and sus4 voicings avoid third clashes and lock in direct rhythmic pulse.",
pitfallPt: "Deixar o dedo 3 cair um pouco baixo na corda vizinha, criando uma quinta 'murcha' fora de afinação. Solução: confira o Power Chord devagar nota por nota antes de rasguear as duas ordens juntas. Não deixe o acorde soar duro ou exageradamente alto quando o objetivo for apenas sustentar o groove do conjunto.",
pitfallEn: "Letting finger 3 slip slightly flat on the adjacent course, turning the fifth dull. Fix: check both notes individually before strumming them together. Avoid harsh or overly loud strums when your role is simply to lock the groove with the ensemble.",
repertoire: [
  {
    piece: "Oud Rock & Fusão Progressiva (Power Voicings & Riffs)",
    artist: "Rabih Abou-Khalil / Le Trio Joubran / Dhafir Youssef",
    query: "Rabih Abou-Khalil Oud fusion groove",
    listenForPt: "Repare na precisão rítmica da mão direita alternando riffs graves com acordes abertos de quinta e quarta.",
    listenForEn: "Hear the razor-sharp right-hand groove alternating low riffs with open fifth and fourth voicings."
  }
]
},

les_34_pentatonics_fretless: {
tagsPt: ["Pentatônica Menor", "Desert Blues (Sahel)", "Agrupamentos de 3 Notas", "Sem Semitons"],
tagsEn: ["Minor Pentatonic", "Desert Blues (Sahel)", "3-Note Groupings", "No Semitones"],
structurePt: "A Pentatônica Menor (1–b3–4–5–b7) remove o 2º e o 6º graus da escala menor, eliminando todos os semitons. No Oud, ela cria uma ponte natural entre o Blues americano e a música tuaregue/saheliana (Mali e Níger), historicamente parente dos alaúdes africanos (ngoni e tidinit).",
structureEn: "Minor Pentatonic (1–b3–4–5–b7) removes degrees 2 and 6, eliminating all semitones. On the Oud, it naturally bridges American Blues with Tuareg/Sahelian music (Mali & Niger), historic cousins of West African lutes (ngoni and tidinit).",
temperamentPt: "Como todos os saltos da pentatônica são de 1 tom (4q) ou 1,5 tom (6q), a mão esquerda ganha fluidez imediata para fraseados rápidos sem o risco de embolar dedos em semitons apertados. Na fusão com grooves africanos e Blues, a repetição rítmica de células curtas em pentatônica menor cria hipnose e diálogo natural com percussão e cordas graves.",
temperamentEn: "Because every step is either a whole tone (4q) or minor third (6q), the left hand moves briskly without cramped semitone fingerings. In African grooves and Blues fusion, repeating short minor-pentatonic cells builds hypnotic momentum alongside percussion and bass.",
pitfallPt: "Tocar a pentatônica apenas subindo e descendo em ordem linear. Solução: quebre o desenho em saltos de quarta (D→G, F→A, G→C) e repita motivos rítmicos curtos de 3 notas. Não trate a pentatônica apenas como escala de aquecimento: trabalhe acentos deslocados e pausas curtas entre motivos.",
pitfallEn: "Running pentatonic notes straight up and down. Fix: break patterns into fourth leaps (D→G, F→A, G→C) and repeat hypnotic 3-note rhythmic cells. Do not treat the pentatonic only as a warm-up pattern: shape offbeat accents and brief rests between motifs.",
repertoire: [
  {
    piece: "Desert Blues & Pentatônica em Alaúdes (Ali Farka Touré / Oud Fusion)",
    artist: "Ali Farka Touré / Toumani Diabaté / Oud Blues",
    query: "Oud Desert Blues pentatonic",
    listenForPt: "Sinta o pulso hipnótico das frases curtas em pentatônica menor apoiadas nos graves repetitivos.",
    listenForEn: "Feel the hypnotic pulse of short minor-pentatonic phrases anchored over repeating low bass notes."
  }
]
},

les_35_microtonal_blue_notes: {
tagsPt: ["Blue Note Real (3- & 7-)", "Zahfa no Lugar do Bend", "Ponte Delta Blues ↔ Rast", "Escuta 24-TET"],
tagsEn: ["True Blue Note (3- & 7-)", "Zahfa Instead of Bend", "Delta Blues ↔ Rast Bridge", "Live Pitch 24-TET"],
structurePt: "Etnomusicólogos demonstram há décadas que a 'blue note' original do canto do Delta do Mississipi e do Sahel não é uma terça menor fixa nem maior fixa, mas uma TERÇA NEUTRA (~350¢) — exatamente a mesma altura do grau Sikah (E-) do Maqam Rast!",
structureEn: "Ethnomusicologists have long documented that the original vocal 'blue note' of the Mississippi Delta and Sahel is neither a strict minor 3rd nor major 3rd, but a NEUTRAL THIRD (~350¢) — the exact same pitch as Sikah (E-) in Maqam Rast!",
temperamentPt: "Em vez de forçar a corda lateralmente (bend) como na guitarra de aço, o alaudista desliza o dedo longitudinalmente sobre o espelho (Zahfa), entrando em E- (3-) por baixo (Eb → E-) e descansando no ponto exato entre tristeza e brilho. Ao integrar blue notes neutras (3- e 7-) em contextos de Blues ou fusão, o deslize longitudinal suave (Zahfa) entrega cor expressiva sem desafinar o par de cordas do Oud.",
temperamentEn: "Instead of pushing strings sideways (bending) like on a steel-string guitar, an Oud player glides smoothly along the fingerboard (Zahfa), entering E- (3-) from Eb and resting cleanly between dark and bright. When blending neutral blue notes (3- and 7-) into Blues or fusion, a smooth longitudinal glide (Zahfa) adds expressive color without throwing paired Oud strings out of tune.",
pitfallPt: "Tentar fazer 'bend' puxando as cordas duplas do Oud para cima/baixo — isso desafina o par de cordas e pode deslocar o cavalete. Solução: use sempre deslize longitudinal (Zahfa) ao longo do braço. Evite oscilar o dedo sem direção clara; chegue à nota neutra com intenção definida para que ela soe como cor estilística e não imprecisão.",
pitfallEn: "Attempting guitar-style string bends on double Oud courses, which throws pairs out of tune. Fix: always use smooth longitudinal slides (Zahfa) along the neck. Avoid aimless pitch wavering; land on the neutral pitch with clear intent so it reads as stylistic color rather than inaccuracy.",
repertoire: [
  {
    piece: "Blue Maqams / Blues Microtonal no Oud",
    artist: "Anouar Brahem / Rabih Abou-Khalil / Rahim AlHaj",
    query: "Oud Blues microtonal improvisation",
    listenForPt: "Preste atenção nos deslizes expressivos sobre a terça neutra e o trítono (b5), fundindo a alma do Blues ao fraseado do Oud.",
    listenForEn: "Listen for expressive glides across the neutral third and b5 tritone, fusing Blues soul with Oud articulation."
  }
]
},

les_36_blues_shuffle_bass: {
tagsPt: ["Call & Response", "Trítono b5 (Blue Note)", "Bordões Graves (D & A)", "Swing / Shuffle"],
tagsEn: ["Call & Response", "b5 Tritone (Blue Note)", "Bass Courses (D & A)", "Swing / Shuffle"],
structurePt: "O Blues acústico organiza-se em conversa: uma frase cantada nas cordas agudas (Call) seguida de uma resposta grave e percussiva nos bordões (Response). Esse diálogo espelha perfeitamente a estrutura de pergunta-e-resposta de um Taqsim clássico.",
structureEn: "Acoustic Blues is built as a conversation: a vocal phrase on treble courses (Call) answered by a percussive low bass phrase (Response) — mirroring the call-and-response logic of a classical Taqsim.",
temperamentPt: "Ao contrário do rock reto, o Blues balança em subdivisão ternária (shuffle: longa–curta). Na Risha, isso significa golpe descendente (↓) ligeiramente mais longo e golpe ascendente (↑) mais atrasado e relaxado. Em formações acústicas enxutas, usar os bordões graves como resposta rítmica às frases agudas substitui o acompanhamento harmônico tradicional e mantém o swing.",
temperamentEn: "Rather than straight eighth notes, Blues swings in triplet subdivision (long–short). On the Risha, give downstrokes (↓) a slightly longer weight and lay back gently on upstrokes (↑). In lean acoustic settings, using low courses to answer treble phrases supplies rhythmic weight and keeps the shuffle swinging.",
pitfallPt: "Abusar da nota b5 (Ab em D) parando muito tempo sobre ela. Solução: trate a b5 como nota de tempero rápido (passagem entre G e A ou A e G) para manter o groove irresistível. Cuidado para não perder o swing ternário (shuffle) deixando o pulso rígido ou apressado sobre o b5.",
pitfallEn: "Camping too long on the b5 (Ab in D). Fix: treat b5 as a spicy passing inflection between G and A so the groove stays infectious. Be careful not to stiffen or rush the triplet shuffle feel around the b5.",
repertoire: [
  {
    piece: "Oud Blues & Grooves Acústicos",
    artist: "Joseph Tawadros / Dhafer Youssef / Oud Blues",
    query: "Joseph Tawadros Oud Blues",
    listenForPt: "Observe como as notas graves sustentam o pulso enquanto a mão esquerda brinca com ligados e deslizes nas cordas agudas.",
    listenForEn: "Notice how low bass strokes lock the groove while the left hand plays slurs and glides on the treble courses."
  }
]
},

les_37_ziryab_andalusian: {
tagsPt: ["Ziryab (Córdoba, séc. IX)", "Cadência Andaluza (iv–bIII–bII–I)", "Al-Andalus", "Rumba / Tangos"],
tagsEn: ["Ziryab (Córdoba, 9th c.)", "Andalusian Cadence (iv–bIII–bII–I)", "Al-Andalus", "Rumba / Tangos"],
structurePt: "A Cadência Andaluza (em D: Gm – F – Eb – D) é o elo vivo entre o Oud medieval de Al-Andalus e o violão flamenco moderno. Ela desce grau por grau no baixo (G → F → Eb → D) concluindo com a queda magnética de semitom bII → I.",
structureEn: "The Andalusian Cadence (in D: Gm – F – Eb – D) is the living link between medieval Al-Andalus Oud music and modern Flamenco guitar. The bass walks stepwise downward (G → F → Eb → D), ending with the magnetic bII → I half-step drop.",
temperamentPt: "Em Al-Andalus (e na música andaluza preservada hoje no Marrocos, Argélia e Tunísia — a Nuba), o Oud frequentemente acompanha melodias corais com rasgueios rítmicos firmes e arpejos que antecipam a estética do compás espanhol. Ao tocar a cadência andaluza em diálogo com violão, percussão ou voz, a clareza do baixo descendente (G–F–Eb–D) e a firmeza rítmica sustentam toda a tensão da frase.",
temperamentEn: "In the Andalusian Nuba preserved across Morocco, Algeria, and Tunisia, the Oud drives vocal ensembles with rhythmic strums and arpeggios closely related to Spanish compás. When playing the Andalusian cadence alongside guitar, percussion, or voice, a clear descending bass line (G–F–Eb–D) and firm pulse carry the harmonic tension.",
pitfallPt: "Perder o pulso do 4/4 durante a troca dos acordes no sequenciador. Solução: pratique primeiro apenas o baixo descendente (G – F – Eb – D) sobre a Rumba Flamenca antes de preencher os acordes inteiros. Não perca o pulso do compasso ao mudar de acorde; mantenha a continuidade rítmica mesmo nas passagens mais expressivas.",
pitfallEn: "Losing the 4/4 groove while switching chords in the sequencer. Fix: first pluck only the descending bass line (G – F – Eb – D) over Rumba Flamenca before adding full voicings. Do not drop the pulse across chord changes; keep rhythmic continuity even through expressive turns.",
repertoire: [
  {
    piece: "Zyriab (Encontro entre Flamenco & Tradição do Oud)",
    artist: "Paco de Lucía / Eduardo Paniagua / Nuba Andaluza",
    query: "Paco de Lucia Zyriab Oud Flamenco",
    listenForPt: "Escute o diálogo histórico entre o compás andaluz, a cadência descendente e o colorido modal do Hijaz/Frígio.",
    listenForEn: "Listen to the historic dialogue between Andalusian compás, the descending cadence, and Hijaz/Phrygian modal fire."
  }
]
},

les_38_phrygian_dom_picado: {
tagsPt: ["Frígio Dominante (Por Medio)", "Picado de Risha (↓↑)", "Timbre Sírio Seco", "Corridas Descendentes"],
tagsEn: ["Phrygian Dominant (Por Medio)", "Risha Picado (↓↑)", "Crisp Syrian Tone", "Descending Runs"],
structurePt: "Enquanto o Maqam Hijaz tradicional comprime levemente a segunda aumentada (Eb mais alto, F# mais baixo) e sobe pelo 6º grau neutro (B-), o Frígio Dominante do Flamenco trabalha em 12-TET brilhante com b6 (Bb) e b7 (C), valorizando corridas rápidas e finais incisivos no tempo forte.",
structureEn: "While traditional Maqam Hijaz subtly compresses its augmented 2nd and often ascends with a neutral 6th, Flamenco Phrygian Dominant operates in razor-sharp 12-TET with b6 (Bb) and b7 (C), favoring blazing runs and incisive downbeat landings.",
temperamentPt: "Para atingir velocidade de 'picado' no Oud, mantenha a Risha bem curta entre os dedos (pouca ponta sobrando), toque próximo ao cavalete e reduza o movimento do pulso ao mínimo possível — economia de gesto gera clareza e velocidade. No Frígio Dominante com ataque próximo ao cavalete e perfil Sírio, a articulação rápida em ↓↑ destaca a agilidade rítmica sem perder a definição de cada nota.",
temperamentEn: "To achieve flamenco 'picado' speed on the Oud, choke up slightly on the Risha, pluck nearer the bridge, and minimize wrist travel — economy of motion unlocks crisp velocity. In Phrygian Dominant with bridge-side attack and Syrian tone, brisk ↓↑ picking highlights rhythmic drive while keeping every pitch distinct.",
pitfallPt: "Acelerar antes de sincronizar mão esquerda e direita, gerando notas abafadas. Solução: comece a 76 BPM com cada nota articulada com clareza cristalina e só suba para 108 BPM quando a alternância ↓↑ estiver automática. Não sacrifique a clareza de cada nota em busca de velocidade; a precisão do picado vem da economia do movimento.",
pitfallEn: "Speeding up before left and right hands sync, causing muted notes. Fix: start at 76 BPM with crystal-clear articulation and raise tempo to 108 BPM only once ↓↑ feels automatic. Do not sacrifice note clarity for speed; crisp picado comes from small, economical motion.",
repertoire: [
  {
    piece: "Encuentro Flamenco & Oud (Tangos / Bulerías / Rumba)",
    artist: "Nino Josele / Naseer Shamma / Amir ElSaffar / Oud Flamenco",
    query: "Oud Flamenco Hijaz Phrygian Dominant",
    listenForPt: "Note o ataque incisivo perto do cavalete e as frases curtas que explodem em corridas descendentes até a tônica.",
    listenForEn: "Notice the biting bridge-side attack and tight motifs exploding into rapid descending runs to the tonic."
  }
]
},

les_39_rebetiko_tsifteteli: {
tagsPt: ["Rebetiko & Smyrneika", "Dromoi (Hitzaz / Ousak)", "Tsifteteli (8/4)", "Afinação Turca/Grega (D–a)"],
tagsEn: ["Rebetiko & Smyrneika", "Dromoi (Hitzaz / Ousak)", "Tsifteteli (8/4)", "Turkish/Greek Tuning (D–a)"],
structurePt: "Os 'Dromoi' (caminhos) do Rebetiko grego são primos diretos dos Maqamat árabes e Makamlar otomanos — Hitzaz (Hijaz), Ousak (Bayati/Uşşak), Sabah (Saba), Rast e Houzam. Na tradição de Esmirna (Smyrneika), o Outi (Oud grego) abre a canção com um Taximi improvisado antes da entrada do ritmo Tsifteteli (8/4).",
structureEn: "The 'Dromoi' (roads) of Greek Rebetiko are direct cousins of Arabic Maqamat and Ottoman Makamlar — Hitzaz (Hijaz), Ousak (Bayati/Uşşak), Sabah (Saba), Rast, and Houzam. In Smyrneika music, the Outi opens with a free Taximi before the swaying Tsifteteli (8/4) enters.",
temperamentPt: "O ciclo Tsifteteli (Chiftetelli em 8/4: DUM · · TAK · · TAK · DUM · DUM · TAK · · ·) tem um balanço amplo e sensual. Os dois DUMs na segunda metade do compasso funcionam como um trampolim para frases melódicas ornamentadas com mordentes rápidos. Na integração com repertórios gregos e do Mediterrâneo oriental, o fraseado cantado sobre o Tsifteteli (8/4) pede espaço entre as frases e ornamentos discretos no momento certo.",
temperamentEn: "Tsifteteli (Chiftetelli in 8/4: DUM · · TAK · · TAK · DUM · DUM · TAK · · ·) has a wide, swaying groove. The twin DUM strokes in the second half act as a springboard for ornamented melodic turns. In Greek and Eastern Mediterranean repertoires, singing phrases over Tsifteteli (8/4) calls for breathing room and well-placed ornaments.",
pitfallPt: "Tocar frases cheias demais sem respeitar os espaços longos do 8/4. Solução: deixe respirar após o primeiro DUM e entre com a melodia respondendo aos dois TAKs sincopados. Evite encher todos os tempos do 8/4 com notas contínuas; deixe o balanço do ritmo respirar.",
pitfallEn: "Overplaying through the spacious rests of 8/4. Fix: let the first DUM breathe and weave your melodic answer around the syncopated TAKs. Avoid filling every eighth note of 8/4 nonstop; let the swaying groove breathe.",
repertoire: [
  {
    piece: "Smyrneika Taximi & Tsifteteli (Outi / Rebetiko)",
    artist: "Roza Eskenazi / Haig Yazdjian / Nikos Saragoudas",
    query: "Outi Taximi Hitzaz Tsifteteli Greek",
    listenForPt: "Aprecie o diálogo entre a afinação brilhante (D–a), os trêmulos curtos e o balanço inconfundível do Tsifteteli.",
    listenForEn: "Enjoy the interplay of bright D–a tuning, brief tremolo accents, and the unmistakable Tsifteteli sway."
  }
]
},

les_40_modal_jazz_dorian: {
tagsPt: ["Jazz Modal", "Centro Modal Dórico", "Quartas & 6ª Maior", "Espaço & Silêncio"],
tagsEn: ["Modal Jazz", "Dorian Modal Center", "Fourths & Major 6th", "Space & Silence"],
structurePt: "No Jazz modal, uma única escala/modo sustenta vários compassos ou uma seção inteira (como D Dórico em 'So What'). A harmonia evita cadências resolutivas óbvias e prioriza melodias construídas com intervalos de quarta justa e sexta maior.",
structureEn: "In Modal Jazz, a single mode anchors extended sections (like D Dorian in 'So What'). Harmony avoids obvious V–I closures and favors melodies built from fourths and natural sixths.",
temperamentPt: "Em contextos de Jazz modal, o Oud traz uma cor híbrida única: pode soar com afinação 12-TET limpa para dialogar com piano e contrabaixo, ou introduzir micro-inflexões de quarto de tom quando o solista busca proximidade com o Maqam. Em contextos de Jazz modal, o Oud ganha espaço quando trabalha motivos rítmicos variados, intervalos abertos e silêncios em diálogo com baixo, piano ou sopros.",
temperamentEn: "In Modal Jazz, the Oud offers a rare dual voice: clean 12-TET to lock with piano and bass, or subtle quarter-tone inflections when blending modal jazz with Maqam color. In Modal Jazz contexts, the Oud shines by shaping varied rhythmic motifs, open intervals, and space in conversation with bass, piano, or horns.",
pitfallPt: "Tocar frases de Jazz cheias de cromatismos rápidos que 'fogem' do centro modal Dórico. Solução: fique fiel às 7 notas do Dórico e trabalhe variações de ritmo e articulação. Evite recorrer a frases automáticas ou cromatismos excessivos que tirem o foco da cor modal da seção.",
pitfallEn: "Adding excessive chromatic runs that blur the Dorian modal center. Fix: stay inside the 7 Dorian notes and vary rhythm, register, and phrasing. Avoid autopilot licks or excessive chromaticism that pull focus away from the section's modal color.",
repertoire: [
  {
    piece: "So What / Modal Jazz em Alaúde & Oud",
    artist: "Miles Davis / Anouar Brahem / Rabih Abou-Khalil",
    query: "Oud Modal Jazz Dorian improvisation",
    listenForPt: "Observe como longos trechos permanecem sobre a mesma tônica ganhando vida por meio de ritmo, timbre e respiro.",
    listenForEn: "Notice how long stretches over one tonic stay fresh through rhythm, tone color, and breathing room."
  }
]
},

les_41_seventh_chords_arpeggios: {
tagsPt: ["Tétrades (Maj7 · m7 · 7)", "Guide Tones (3ª & 7ª)", "Arpejo Legato", "Cor Harmônica"],
tagsEn: ["Seventh Chords (Maj7 · m7 · 7)", "Guide Tones (3rd & 7th)", "Legato Arpeggio", "Harmonic Color"],
structurePt: "Enquanto tríades têm 3 notas, as tétrades acrescentam a 7ª (maior no Maj7, menor no m7 e na Dominante 7). A 3ª e a 7ª funcionam como 'guide tones': basta ouvir a passagem entre elas para reconhecer imediatamente a função harmônica.",
structureEn: "Beyond 3-note triads, seventh chords add a 7th (major on Maj7, minor on m7 and Dominant 7). The 3rd and 7th act as 'guide tones' that immediately define harmonic character.",
temperamentPt: "Ao arpejar tétrades no Oud sem trastes, o intervalo de 7ª maior (11 semitons) e a 7ª menor (10 semitons) precisam de atenção auditiva para não soarem baixos ou altos demais em relação à tônica. Ao integrar tétrades (Maj7, m7, 7) em arranjos de Jazz ou fusão, o arpejo legato ajuda a destacar a 3ª e a 7ª com clareza harmônica no braço sem trastes.",
temperamentEn: "When arpeggiating seventh chords on a fretless Oud, major 7ths (11 semitones) and minor 7ths (10 semitones) require careful ear check so they do not sag or pull sharp against the root. When blending seventh chords (Maj7, m7, 7) into Jazz or fusion arrangements, legato arpeggios bring out the 3rd and 7th clearly on a fretless neck.",
pitfallPt: "Arpejar depressa demais sem deixar a ressonância da nota anterior se somar à seguinte. Solução: reduza o andamento e mantenha os dedos no braço enquanto as notas ressoam. Não apresse os arpejos a ponto de perder a afinação exata da 7ª ou a ressonância natural das cordas.",
pitfallEn: "Rushing arpeggios so notes cut off abruptly. Fix: slow down and keep left-hand fingers planted so pitches overlap naturally. Do not rush arpeggios at the expense of accurate 7th intonation or natural string resonance.",
repertoire: [
  {
    piece: "Arpejos & Harmonia em Oud Contemporâneo",
    artist: "Anouar Brahem / Simon Shaheen / Oud Jazz",
    query: "Anouar Brahem arpeggio Oud solo",
    listenForPt: "Escute como os arpejos desenhados em sequência criam transparência harmônica sem pesar a textura.",
    listenForEn: "Hear how rolled arpeggios create harmonic shimmer without weighing down the texture."
  }
]
},

les_42_contemporary_oud_trio: {
tagsPt: ["Oud Trio", "Menor Melódica", "Diálogo Camerístico", "Dinâmica & Timbre"],
tagsEn: ["Oud Trio", "Melodic Minor", "Chamber Dialogue", "Dynamics & Tone"],
structurePt: "A escala Menor Melódica (1–2–b3–4–5–6–7) une a base menor à subida luminosa com 6ª e 7ª maiores, tornando-se uma ponte natural entre o Jazz contemporâneo, a música erudita moderna e o fraseado modal.",
structureEn: "Melodic Minor (1–2–b3–4–5–6–7) pairs a minor base with a bright ascending 6th and 7th, bridging contemporary Jazz, modern chamber music, and modal phrasing.",
temperamentPt: "Em um trio com baixo e percussão, o Oud ganha espaço para explorar nuances de timbre — alternando ataque macio próximo à roseta e articulação mais presente quando o motivo pede destaque. Em formações de trio ou câmara, o equilíbrio entre ataque suave na roseta, contraponto leve e silêncio permite que o Oud converse de igual para igual com os demais instrumentos.",
temperamentEn: "In a trio with bass and percussion, the Oud has room for subtle tone shifts — moving smoothly between warm rosette strokes and more articulate attack when a motif leads. In trio or chamber settings, balancing soft rosette plucking, light counterpoint, and silence lets the Oud converse naturally with fellow players.",
pitfallPt: "Tocar o tempo todo no mesmo volume médio ('parede sonora') sem altos e baixos expressivos. Solução: trabalhe contrastes entre frases sussurradas e picos cantados. Evite tocar sempre no mesmo nível dinâmico; varie entre frases íntimas e momentos de maior projeção.",
pitfallEn: "Playing at one flat volume throughout. Fix: shape phrases with soft hushed openings and singing dynamic peaks. Avoid staying at one dynamic level; shift naturally between intimate phrases and fuller projection.",
repertoire: [
  {
    piece: "Blue Maqams / Chamber Oud Trio",
    artist: "Anouar Brahem Trio",
    query: "Anouar Brahem Blue Maqams Oud",
    listenForPt: "Repare na escuta mútua entre os instrumentos e na elegância com que cada frase começa e termina.",
    listenForEn: "Notice the intimate ensemble listening and the poise of every phrase entrance and release."
  }
]
},

les_43_nordestino_lydian_b7_baiao: {
tagsPt: ["Modo Nordestino (Lídio b7)", "Baião & Zabumba (2/4)", "Rabeca & Viola", "Swing Brasileiro"],
tagsEn: ["Northeastern Mode (Lydian b7)", "Baião & Zabumba (2/4)", "Rabeca & Viola", "Brazilian Swing"],
structurePt: "O Lídio b7 (1–2–3–#4–5–6–b7) combina a #4 característica da escala acústica/nordestina com a b7 do modo mixolídio. No Oud, essa combinação soa surpreendentemente natural tanto no Baião e no forró quanto em diálogos com modos orientais.",
structureEn: "Lydian b7 (1–2–3–#4–5–6–b7) pairs the acoustic/Northeastern #4 with a Mixolydian b7. On the Oud, it feels remarkably at home in Baião and Northeastern folk while echoing modal colors.",
temperamentPt: "O ritmo de Baião / Zabumba (2/4) pede ginga e clareza rítmica: os graves marcam o chão com firmeza enquanto os acentos intermediários dão impulso para a frase melódica. Ao integrar o Lídio b7 ao Baião e a ritmos nordestinos, a leveza rítmica da Risha e o respeito à acentuação do 2/4 mantêm o balanço idiomático do estilo.",
temperamentEn: "Baião / Zabumba (2/4) thrives on rhythmic bounce and clarity: low strokes ground the floor while intermediate accents propel the melody forward. When pairing Lydian b7 with Baião and Northeastern rhythms, light Risha feel and respect for 2/4 accents keep the groove idiomatic.",
pitfallPt: "Tocar a melodia de forma quadrada ou dura em cima de um ritmo que pede ginga. Solução: cante o swing do Baião antes de tocar e acentue os encontros com os tempos graves. Evite tocar com rigidez métrica que mate o balanço característico do Baião e da zabumba.",
pitfallEn: "Playing stiff, square phrasing over a bouncy rhythm. Fix: sing the Baião swing first and lock accents naturally onto the low pulse. Avoid rigid metric stiffness that flattens the characteristic bounce of Baião and zabumba.",
repertoire: [
  {
    piece: "Asa Branca / Baião & Lídio b7 (Adaptações Instrumentais)",
    artist: "Luiz Gonzaga / Dominguinhos / Música Instrumental Brasileira",
    query: "Baiao Lydian b7 instrumental acoustic",
    listenForPt: "Sinta o balanço característico do 2/4 nordestino e o brilho particular do #4 e da b7 na melodia.",
    listenForEn: "Feel the unmistakable Northeastern 2/4 bounce and the warm lift of #4 and b7 in the melody."
  }
]
},

les_44_choro_bass_counterpoint: {
tagsPt: ["Choro Brasileiro", "Baixarias nos Bordões", "Articulação em Colcheias", "Espelho Completo"],
tagsEn: ["Brazilian Choro", "Bass Counterpoint", "Eighth-Note Clarity", "Full Fingerboard"],
structurePt: "O Choro apoia-se em linhas melódicas articuladas, contraponto de baixo (baixarias) e fluência entre registros. No Oud, usar as ordens graves e o espelho completo permite conectar graves cantantes às frases agudas.",
structureEn: "Choro relies on articulate melodic lines, singing bass counterpoint (baixarias), and smooth register links. On the Oud, low courses and full-neck reach connect expressive bass lines to upper phrases.",
temperamentPt: "Em frases rápidas de Choro, a precisão do ponto de contato no braço sem trastes e a sincronia exata entre Risha e mão esquerda evitam notas 'emboladas'. No diálogo com o Choro, a articulação limpa em colcheias e o uso musical das cordas graves permitem conectar linhas de baixo expressivas às frases agudas.",
temperamentEn: "In brisk Choro passages, accurate fretless finger placement and tight left/right-hand coordination keep fast eighth notes clean and singing. In Choro settings, clean eighth-note articulation and expressive use of low courses link singing bass lines with upper melodies.",
pitfallPt: "Perder a afinação ao cruzar rapidamente das cordas graves para as agudas. Solução: estude trechos curtos em andamento lento, ouvindo cada nota antes de acelerar. Não deixe as passagens rápidas em colcheias perderem a precisão de afinação ou o pulso regular.",
pitfallEn: "Drifting out of tune when crossing fast from bass to treble courses. Fix: practice short cells slowly, hearing each pitch clearly before increasing tempo. Do not let brisk eighth-note passages lose pitch accuracy or steady pulse.",
repertoire: [
  {
    piece: "Carinhoso / Pixinguinha & Choro Instrumental",
    artist: "Pixinguinha / Jacob do Bandolim / Raphael Rabello",
    query: "Pixinguinha Choro baixaria violao Oud",
    listenForPt: "Observe como as linhas de baixo caminham com intenção melódica própria em vez de apenas marcar acordes.",
    listenForEn: "Notice how bass lines walk with their own singing melody rather than merely marking roots."
  }
]
},

les_45_bossa_nova_open_harmony: {
tagsPt: ["Bossa Nova", "Acordes Maj7 & m7", "Dinâmica Contida", "Toque na Roseta"],
tagsEn: ["Bossa Nova", "Maj7 & m7 Chords", "Understated Touch", "Rosette Plucking"],
structurePt: "A Bossa Nova combina melodias suaves com acordes ricos em sétimas e tensão contida. No Oud, arpejos abertos e notas escolhidas com parcimônia valorizam o timbre quente da madeira.",
structureEn: "Bossa Nova pairs gentle melodies with seventh-rich harmonies and understated tension. On the Oud, open arpeggios and sparse, well-chosen notes highlight the warm wood tone.",
temperamentPt: "A afinação limpa em 12-TET permite que as sétimas maiores e menores ressoem com nitidez sobre a tônica sem batimentos indesejados. Na integração com a Bossa Nova, o toque contido próximo à roseta e a ressonância natural das cordas valorizam a harmonia com sétimas sem pesar o andamento.",
temperamentEn: "Clean 12-TET tuning lets major and minor sevenths ring clearly over the root without unwanted beating. In Bossa Nova settings, understated plucking near the rosette and natural string resonance highlight seventh chords without weighing down the groove.",
pitfallPt: "Exagerar no volume ou na velocidade da Risha, tirando a leveza da Bossa Nova. Solução: toque com leveza e deixe as notas respirarem. Evite atacar forte ou acelerar demais; a Bossa Nova depende de leveza, contenção e espaço.",
pitfallEn: "Overplaying volume or Risha speed and losing Bossa Nova's ease. Fix: play with light touch and let notes breathe naturally. Avoid heavy attack or rushing; Bossa Nova relies on lightness, restraint, and space.",
repertoire: [
  {
    piece: "Garota de Ipanema / Chega de Saudade (Bossa Nova)",
    artist: "João Gilberto / Antônio Carlos Jobim",
    query: "Joao Gilberto Bossa Nova acoustic guitar",
    listenForPt: "Repare na contenção rítmica, no equilíbrio entre baixo e harmonia e na naturalidade da pulsação.",
    listenForEn: "Listen to the rhythmic restraint, balance between bass and harmony, and effortless pulse."
  }
]
},

les_46_oud_to_renaissance_lute: {
tagsPt: ["Oud → Alaúde", "Contraponto a 2 Vozes", "Pulso Ternário (3/4)", "Independência de Vozes"],
tagsEn: ["Oud → Lute", "2-Voice Counterpoint", "Triple Pulse (3/4)", "Voice Independence"],
structurePt: "O contraponto a duas vozes organiza uma linha grave mais estável e uma voz superior mais móvel. No Oud, essa escrita dialoga diretamente com a história comum entre o Oud e o alaúde europeu.",
structureEn: "Two-voice counterpoint balances a steadier bass line against a more mobile upper voice. On the Oud, this texture connects directly to the shared history of the Oud and European lute.",
temperamentPt: "Manter duas vozes audíveis no Oud exige controle de timbre e duração: o baixo sustenta o compasso enquanto a voz aguda articula o desenho melódico. Ao transitar entre a estética do Oud e a escrita contrapontística do alaúde, diferenciar o peso do baixo da agilidade da voz superior deixa ambas as linhas claras.",
temperamentEn: "Keeping two voices clear on the Oud takes touch and duration control: the bass anchors the meter while the upper voice shapes the melody. Bridging Oud aesthetics and lute counterpoint, differentiating bass weight from upper-voice agility keeps both lines clear.",
pitfallPt: "Deixar a voz aguda abafar o baixo ou cortar o baixo cedo demais. Solução: segure o baixo no tempo 1 e toque os tempos seguintes com leveza. Evite que a linha melódica superior abafe o baixo ou que os dois planos soem indistintos.",
pitfallEn: "Letting the upper voice drown out the bass or cutting the bass short. Fix: sustain beat 1's bass and articulate following beats lightly. Avoid letting the upper line drown out the bass or blending the two voices into an indistinct wash.",
repertoire: [
  {
    piece: "Danças & Peças Renascentistas para Alaúde / Oud",
    artist: "Julian Bream / Hopkinson Smith / Jordi Savall",
    query: "Renaissance lute prelude counterpoint",
    listenForPt: "Observe como duas linhas independentes se entrelaçam mantendo clareza melódica em ambas.",
    listenForEn: "Notice how two independent lines weave together while keeping both melodies clear."
  }
]
},

les_47_polyphonic_preludes: {
tagsPt: ["Prelúdios Polifônicos", "Arpejos Sobrepostos", "Sustentação", "Precisão Sem Trastes"],
tagsEn: ["Polyphonic Preludes", "Overlapping Arpeggios", "Sustain", "Fretless Precision"],
structurePt: "Prelúdios arpejados desenvolvem fluidez harmônica e controle de mão direita ao desdobrar acordes (como Sus4 e Maj7) em linhas contínuas ascendentes e descendentes.",
structureEn: "Arpeggiated preludes build harmonic fluency and right-hand poise by unfolding chords (such as Sus4 and Maj7) into smooth ascending and descending lines.",
temperamentPt: "A ressonância contínua do Oud faz com que notas de um mesmo arpejo soem juntas no ar — exigindo afinação precisa de cada dedo no espelho. Em prelúdios arpejados, sustentar os dedos da mão esquerda enquanto as cordas ressoam cria o efeito polifônico característico da escrita para alaúde e Oud solo.",
temperamentEn: "The Oud's natural sustain lets arpeggio notes ring together in the air — demanding accurate finger placement on every pitch. In arpeggiated preludes, holding left-hand fingers down while strings ring creates the overlapping polyphonic texture of lute and solo Oud.",
pitfallPt: "Acelerar o arpejo e perder a regularidade rítmica entre as cordas. Solução: mantenha um pulso constante e uniforme em cada nota do arpejo. Não levante os dedos apressadamente entre notas do mesmo acorde, o que corta a ressonância sobreposta.",
pitfallEn: "Rushing arpeggios and losing even timing across courses. Fix: keep a steady, even pulse on every arpeggiated note. Do not lift fingers hastily between notes of a chord, which cuts off overlapping resonance.",
repertoire: [
  {
    piece: "Prelúdios para Alaúde & Oud Solo",
    artist: "John Dowland / Sylvius Leopold Weiss / Oud Solo",
    query: "Lute prelude arpeggio solo",
    listenForPt: "Escute como o arpejo desenha a harmonia de fundo enquanto a nota mais aguda sugere uma linha de canto.",
    listenForEn: "Hear how the arpeggio outlines harmony while top notes suggest a singing melody."
  }
]
},

les_48_universal_oud_synthesis: {
tagsPt: ["Síntese das 48 Lições", "Maqam + Groove + Mundo", "Zen Stage", "Autoria no Oud"],
tagsEn: ["48-Lesson Synthesis", "Maqam + Groove + World", "Zen Stage", "Personal Oud Voice"],
structurePt: "A lição 48 convida você a unir tudo o que construiu: modos árabes e seus Ajnas, modulação pelo Ghammaz, ciclos rítmicos diversos, harmonia aberta e a liberdade microtonal do braço sem trastes.",
structureEn: "Lesson 48 brings together everything you have built: Arabic modes and Ajnas, Ghammaz modulation, varied rhythmic cycles, open harmony, and fretless microtonal freedom.",
temperamentPt: "Independentemente do estilo escolhido — árabe clássico, blues, mediterrâneo, jazz ou brasileiro — o segredo no Oud continua sendo ouvir com atenção, afinar com intenção e tocar com alma. Na síntese entre Maqam, ritmo e estilos globais, manter a intenção de afinação, a qualidade de timbre e o sentido claro de fraseado unifica qualquer improvisação no Oud.",
temperamentEn: "Whatever style you explore — classical Arabic, blues, Mediterranean, jazz, or Brazilian — the heart of the Oud remains deep listening, intentional pitch, and honest expression. In uniting Maqam, rhythm, and global styles, steady pitch intent, tone quality, and clear phrasing unify any Oud improvisation.",
pitfallPt: "Achar que existe uma única 'forma certa' de tocar o Oud fora da tradição estrita. Solução: conheça bem as raízes e use esse domínio como base para a sua própria voz musical. Evite misturar elementos sem intenção musical; deixe que cada mudança de cor, ritmo ou posição tenha propósito.",
pitfallEn: "Thinking there is only one rigid way to play the Oud. Fix: honor the roots deeply and use that mastery as a springboard for your own voice. Avoid combining ideas without musical purpose; let every shift in color, rhythm, or position serve the phrase.",
repertoire: [
  {
    piece: "Improvisação Livre & Fusão Global no Oud",
    artist: "Munir Bashir / Anouar Brahem / Rabih Abou-Khalil / Simon Shaheen",
    query: "Oud solo improvisation world fusion",
    listenForPt: "Observe como grandes músicos transitam entre rigor técnico, escuta e liberdade expressiva sem perder identidade.",
    listenForEn: "Notice how seasoned players balance technical rigor, listening, and expressive freedom with unmistakable identity."
  }
]
},

les_49_timbre_textural_role_by_style: {
tagsPt: ["Heterofonia vs. Conjunto", "Espaço Harmônico", "Bordões & Articulação", "Dinâmica Multiestilo"],
tagsEn: ["Heterophony vs. Ensemble", "Harmonic Space", "Drones & Articulation", "Multi-Style Dynamics"],
structurePt: "Em repertórios tradicionais do Oriente Médio, a heterofonia permite que várias vozes ornamentem o mesmo percurso melódico com liberdade microtonal. Quando o Oud entra em formações de música global, jazz, folk ou música brasileira ao lado de instrumentos harmônicos (violão, piano, guitarra) ou graves (baixo, zabumba), definir sua função textural — melodia principal, contraponto leve, bordão ou acorde aberto — evita sobreposição de frequências e valoriza a madeira do instrumento.",
structureEn: "In traditional Middle Eastern settings, heterophony lets voices ornament a shared melodic path with microtonal freedom. In global fusion, jazz, folk, or Brazilian ensembles alongside chording or bass instruments, choosing a clear textural role — lead line, light counterpoint, drone, or open voicing — prevents frequency crowding and lets the Oud's wood speak.",
temperamentPt: "A acústica do Oud combina ataque percussivo de Risha com ressonância contínua do bojo. Em arranjos densos, aproximar o ataque levemente do cavalete ajuda a definição rítmica e melódica; em espaços mais abertos ou intimistas, tocar próximo à roseta amplia o corpo grave e o legato.",
temperamentEn: "The Oud pairs a crisp Risha transient with sustained soundboard resonance. In denser arrangements, plucking slightly closer to the bridge aids rhythmic and melodic clarity; in open or intimate settings, moving toward the rosette deepens warmth and legato.",
pitfallPt: "Tentar 'competir' em volume ou preencher todos os compassos com acordes e notas rápidas sobre um acompanhamento já completo. Solução: ouça o conjunto e use silêncios, notas longas ou bordões pontuais para criar respiro.",
pitfallEn: "Trying to out-volume the ensemble or filling every bar with busy notes and chords over an already full accompaniment. Fix: listen to the group and use space, sustained notes, or sparse drones to create lift.",
repertoire: [
  {
    piece: "Diálogos de Oud em Formações Globais & de Câmara",
    artist: "Anouar Brahem / Rabih Abou-Khalil / Dhafer Youssef",
    query: "Oud ensemble chamber fusion improvisation",
    listenForPt: "Observe como o Oud alterna momentos de protagonismo melódico com escuta atenta e apoio discreto enquanto outros solistas se expressam.",
    listenForEn: "Notice how the Oud alternates melodic leadership with attentive listening and understated support while other voices speak."
  }
]
},

les_50_microtones_vs_tempered_contexts: {
tagsPt: ["24-TET & Desvios Tradicionais", "Diálogo com 12-TET", "Intenção Microtonal", "Resolução Clara"],
tagsEn: ["24-TET & Traditional Inflections", "Dialogue with 12-TET", "Microtonal Intent", "Clear Resolution"],
structurePt: "O braço sem trastes permite transitar entre graus neutros (como 2- e 3-) e notas temperadas de 12-TET. Ao integrar o Oud a estilos temperados, a clareza harmônica depende de saber quando a microtonalidade atua como cor expressiva intencional e quando a afinação temperada sustenta melhor a harmonia do grupo.",
structureEn: "A fretless neck lets you move between neutral degrees (like 2- and 3-) and 12-TET pitches. When blending the Oud into tempered styles, harmonic clarity comes from knowing when microtonality serves as deliberate color and when tempered tuning best supports the group harmony.",
temperamentPt: "Em contextos de fusão, o ouvido do instrumentista é a ponte entre os sistemas: notas estáveis de repouso ou cadência precisam ser afinadas com firmeza, enquanto inflexões expressivas ganham sentido quando contrastam com pontos de referência claros.",
temperamentEn: "In fusion contexts, the player's ear bridges tuning systems: cadential and resting pitches need firm pitch placement, while expressive inflections shine when framed against clear tonal anchors.",
pitfallPt: "Deixar graus neutros soarem imprecisos ou oscilantes por falta de referência auditiva contra a tônica ou contra a harmonia ao redor. Solução: cante mentalmente a nota-alvo antes de apoiar o dedo no espelho.",
pitfallEn: "Letting neutral pitches sound vague or unsteady for lack of an inner reference against the tonic or surrounding harmony. Fix: hear the target pitch inwardly before placing the finger down.",
repertoire: [
  {
    piece: "Fusão Modal & Microtonal com Instrumentos Acústicos",
    artist: "Amir ElSaffar / Simon Shaheen / Oud World Fusion",
    query: "Amir ElSaffar Oud modal fusion",
    listenForPt: "Repare como a intenção de afinação permanece clara mesmo quando o fraseado cruza fronteiras entre tradições modais e harmonia moderna.",
    listenForEn: "Hear how pitch intent stays clear even as phrasing crosses between modal traditions and modern harmony."
  }
]
},

les_51_bridging_maqam_and_world_grooves: {
tagsPt: ["Sayr & Qafla em Novos Estilos", "Ciclos Rítmicos Globais", "Identidade do Oud", "Improvisação Consciente"],
tagsEn: ["Sayr & Qafla in New Styles", "Global Rhythmic Cycles", "Oud Identity", "Mindful Improvisation"],
structurePt: "Integrar a sonoridade do Oud a múltiplos estilos não significa abandonar sua gramática expressiva: princípios como o desenvolvimento gradual de um motivo (semelhante ao Sayr), o diálogo entre regiões/gravidades e o fechamento intencional da frase (Qafla) dão profundidade a qualquer estilo, de ritmos mediterrâneos e brasileiros a grooves modais e contemporâneos.",
structureEn: "Integrating the Oud across styles does not mean dropping its expressive grammar: gradual motif development (akin to Sayr), register and tonal gravity, and purposeful phrase closure (Qafla) bring depth to Mediterranean, Brazilian, modal, or contemporary grooves.",
temperamentPt: "A identidade sonora do Oud emerge da soma de postura, ângulo e peso da Risha, escolha de cordas soltas vs. presas e escuta do decaimento natural. Preservar esses fundamentos mantém o instrumento reconhecível em qualquer contexto musical.",
temperamentEn: "The Oud's sound comes from posture, Risha angle and weight, open vs. stopped course choices, and listening to natural decay. Keeping those core habits keeps the instrument unmistakably itself in any setting.",
pitfallPt: "Imitar superficialmente clichês de outro instrumento (como 'tocar como guitarra' ou 'tocar como violão') abrindo mão da própria sonoridade e respiração do Oud. Solução: absorva o ritmo e a harmonia do estilo, mas fraseie e respire como Oud.",
pitfallEn: "Superficially copying another instrument's clichés (playing like a guitar or lute) and losing the Oud's own voice and breath. Fix: absorb the style's groove and harmony, yet phrase and breathe like an Oud.",
repertoire: [
  {
    piece: "Oud Contemporâneo & Repertório Intercultural",
    artist: "Anouar Brahem / Rabih Abou-Khalil / Naseer Shamma / Munir Bashir",
    query: "Oud contemporary world music repertoire",
    listenForPt: "Observe como cada artista mantém uma assinatura sonora própria ao transitar por diferentes andamentos, harmonias e formações.",
    listenForEn: "Notice how each player preserves a personal sonic signature across varied tempos, harmonies, and ensemble formats."
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
