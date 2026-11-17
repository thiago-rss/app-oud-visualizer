# 🪕 App Oud Visualizer — 24-TET Fretless Studio, Interactive Staff & Modal Method

![Version](https://img.shields.io/badge/version-2.6.0_Studio_Edition-amber.svg)
![Tuning Engine](https://img.shields.io/badge/tuning_engine-24--TET_%2B_Cents-purple.svg)
![Notation](https://img.shields.io/badge/notation-Interactive_24--TET_Staff_8vb-cyan.svg)
![Architecture](https://img.shields.io/badge/stack-Native_ES_Modules_%7C_JSDoc_%7C_SVG_%7C_Web_Audio-blue.svg)
![Bilingual](https://img.shields.io/badge/i18n-Portugu%C3%AAs_%7C_English-emerald.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**[🇧🇷 Português](#-português) | [🇺🇸 English](#-english)**

🔗 **[Acessar Aplicação Online / Live Demo (GitHub Pages)](https://thiago-rss.github.io/app-oud-visualizer/)**

---

## 🇧🇷 Português

O **App Oud Visualizer (v2.6)** é um estúdio web interativo, modular e sem dependências externas projetado para o estudo aprofundado, leitura musical, mapeamento mecânico e improvisação modal (*Taqsim*) no **Oud** (alaúde árabe/sírio, egípcio, iraquiano e turco).

A plataforma une geometria logarítmica de precisão em **24 divisões por oitava (24-TET)**, síntese sonora microtonal em tempo real (**Web Audio API** com compensação em *cents*), **partitura interativa sincronizada com o espelho**, motor rítmico de **Iqa'at** (Darbuka & Riq), glossário terminológico (*Al-Mu'jam*) e compartilhamento direto por URL.

### ✨ Principais Recursos (v2.6)

* **Partitura Interativa 24-TET (`js/ui/staffRenderer.js`):**
  * **Clave de Sol Transpositora ($G_2^{8vb}$ — Padrão Oud):** Escrita na Clave de Sol soando uma oitava abaixo, com glifos vetoriais para acidentes árabes (**Meio-Bemol / Nim-Sikah** $\flat\!\!\!/$ e **Meio-Sustenido / Tik**) e armaduras modais (*Maqam Key Signatures*).
  * **Sincronização Bidirecional (Pauta ↔ Espelho):** Clicar em qualquer nota da pauta ilumina todas as posições equivalentes no braço do Oud (com indicação de corda e dedo); clicar em qualquer joia no braço exibe sua altura exata no **Compasso Inspetor** da pauta.
* **Visualizador de Trajeto Melódico (*Sayr*) & Frases de *Taqsim*:**
  * Trilhas vetoriais curvas em fio de ouro (`① → ② → ③`) conectando as notas tocáveis dentro da posição ativa para **Istihlal** (abertura), **Ghammaz** (desenvolvimento) e **Qafla** (resolução), com execução em *rubato* e iluminação passo a passo.
* **Motor Rítmico Árabe (*Iqa'at Engine*):**
  * Síntese percussiva de **Darbuka** (*Dum*, *Tak*, *Kah*) e **Riq** (*Zill*) com visor luminoso de subdivisões para **Maqsum (4/4)**, **Baladi (4/4)**, **Saidi (4/4)**, **Samai Thaqil (10/8 — `3+2+2+3`)**, **Aqsaq (9/8 — `2+2+2+3`)**, **Jurjina (10/16)** e **Malfuf (2/4)**.
* **Dicionário de Acordes & Sequenciador de Cadências (*Qafla*):**
  * 18 estruturas harmônicas (incluindo tríades e tétrades microtonais de *Rast*, *Bayati*, *Hijaz*, *Saba* e *Sikah*) com cálculo ergonômico de *voicing* (1 nota por ordem) e 10 cadências modais completas.
* **3 Tradições de Luthieria & Modo Vertical Mobile:**
  * Paletas históricas de **Damasco** (Nogueira & Sadaf), **Cairo / Bagdá** (Cedro & Raqma) e **Istambul** (Abeto & Ébano), com anatomia completa (*Shamsiyya*, *Raqma*, *Bajak*, *Anf*), modo **Destro / Canhoto** e alternância automática/manual entre **Espelho Horizontal** e **Espelho Vertical** (otimizado para celulares e estantes).
* **Glossário Modal & Luthieria (*Al-Mu'jam al-Musiqi*) & Sistema Bilíngue (`PT | EN`):**
  * Gaveta lateral pesquisável com 18 verbetes em árabe, transliteração, tradução literal e aplicação prática, além de troca instantânea de idioma e compartilhamento completo do estudo via hash da URL.

---

## 🇺🇸 English

**App Oud Visualizer (v2.6)** is a zero-dependency, modular web studio designed for advanced study, sight-reading, mechanical fingerboard mapping, and modal improvisation (*Taqsim*) on the **Oud** (Syrian/Arabic, Egyptian, Iraqi, and Turkish traditions).

It combines logarithmic **24-tone equal temperament (24-TET)** geometry, real-time microtonal **Web Audio API** synthesis (with exact *cents* inflection), an **interactive 24-TET musical staff synchronized with the neck**, an **Iqa'at rhythm engine** (Darbuka & Riq), a searchable Arabic music glossary (*Al-Mu'jam*), and instant URL-state study sharing.

### ✨ Key Features (v2.6)

* **Interactive 24-TET Musical Staff (`js/ui/staffRenderer.js`):**
  * **Oud-Standard Transposing Treble Clef ($G_2^{8vb}$):** Written in Treble Clef sounding one octave lower, featuring custom vector glyphs for Arabic microtonal accidentals (**Half-Flat / Nim-Sikah** and **Half-Sharp / Tik**) and modal key signatures.
  * **Bidirectional Sync (Staff ↔ Fingerboard):** Clicking any note on the staff highlights all playable locations across the Oud courses (displaying course & finger coordinates); clicking any jewel on the fingerboard displays its exact pitch and ledger lines in the staff's **Inspector Measure**.
* **Melodic Path (*Sayr*) Visualizer & *Taqsim* Phrases:**
  * Curved golden vector trails (`① → ② → ③`) mapping idiomatic phrasing across the active hand shape for **Istihlal** (opening), **Ghammaz** (pivot development), and **Qafla** (cadential resolution), complete with rubato playback and live note illumination.
* **Arabic Rhythm Engine (*Iqa'at* — Darbuka & Riq):**
  * Synthesized **Darbuka** (*Dum*, *Tak*, *Kah*) and **Riq** (*Zill*) percussion with a live beat grid for **Maqsum (4/4)**, **Baladi (4/4)**, **Saidi (4/4)**, **Samai Thaqil (10/8 — `3+2+2+3`)**, **Aqsaq (9/8 — `2+2+2+3`)**, **Jurjina (10/16)**, and **Malfuf (2/4)**.
* **Oud Chord Dictionary & *Qafla* Cadence Sequencer:**
  * 18 harmonic structures (including microtonal *Rast*, *Bayati*, *Hijaz*, *Saba*, and *Sikah* voicings) with ergonomic 1-note-per-course calculation and 10 step-by-step modal cadences.
* **3 Luthierie Traditions & Mobile Vertical Mode:**
  * Visual palettes for **Damascus** (Walnut & Sadaf), **Cairo / Baghdad** (Cedar & Raqma), and **Istanbul** (Spruce & Ebony), featuring realistic Oud anatomy (*Shamsiyya* rosettes, *Raqma* pickguard, *Bajak* pegbox, *Anf* nut), **Right/Left-Handed** mirroring, and **Horizontal / Vertical** orientation switching.
* **Bilingual Interface (`PT | EN`) & *Al-Mu'jam* Glossary:**
  * Instant language switching, searchable 18-entry Arabic music & luthierie glossary with contextual `ⓘ` triggers, and zero-backend study sharing via URL hash serialization.

---

## 🏗️ Arquitetura Modular / Modular Architecture (`v2.6`)

O projeto utiliza **ES Modules nativos** com verificação estrita de tipos via **JSDoc (`// @ts-check`)**, dispensando etapas de compilação (*zero-build*) para publicação direta no GitHub Pages:

```text
app-oud-visualizer/
├── index.html                  # Estrutura semântica bilíngue, Pauta SVG, Espelho SVG e Gaveta Al-Mu'jam
├── README.md                   # Documentação bilíngue (PT / EN)
├── LICENSE                     # Licença MIT
├── styles/
│   └── main.css                # Temas de Luthieria, layout Diwan, Pauta 24-TET e responsividade Vertical
├── js/
│   ├── main.js                 # Orquestrador reativo e sincronização bidirecional Pauta ↔ Espelho
│   ├── core/
│   │   ├── database.js         # Banco 24-TET, Afinações, Ajnas, Maqamat, Sayr, Acordes, Qafla e Iqa'at
│   │   ├── modalEngine.js      # Funções puras: geometria d(q), aritmética Z_24 e solver de voicings
│   │   ├── urlState.js         # Serialização/Deserialização completa do estado na URL (Deep Linking)
│   │   ├── glossary.js         # Acervo terminológico Al-Mu'jam al-Musiqi (18 verbetes)
│   │   └── i18n.js             # Motor bilíngue (Português / Inglês) para UI, banco de dados e glossário
│   ├── audio/
│   │   └── synthEngine.js      # Web Audio API: cordas duplas, rubato Taqsim, drone Qarar e Darbuka/Riq
│   └── ui/
│       ├── neckRenderer.js     # Renderizador vetorial do espelho do Oud (Horizontal & Vertical)
│       └── staffRenderer.js    # Renderizador vetorial da Pauta 24-TET (Clave de Sol 8vb + glifos árabes)
└── docs/
    ├── TECHNICAL_SPEC.md       # Especificação matemática e acústica
    └── oud_database.json       # Espelho JSON estruturado
