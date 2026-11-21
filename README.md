# 🪕 App Oud Visualizer — v3.6 Studio & PWA

**Tratado Interativo 24-TET para Oud: Guia de Estudos Progressivo de 16 Capítulos (48 Lições & 48 Dossiês Bilíngues — Tradição Árabe + Mundo & Fusão), Detector de Intonação Microtonal (Mic & Modo Linha DI), Afinador 6 Ordens, Síntese Física Karplus-Strong Estendida (Sírio/Egípcio), Cabeçote (*Banjak*) Interativo, Partitura Sincronizada, Radar de Modulação (*Intiqal*), Motor Rítmico (*Iqa'at*) e PWA Offline.**

🔗 **Acesso Online (GitHub Pages):** [thiago-rss.github.io/app-oud-visualizer/](https://thiago-rss.github.io/app-oud-visualizer/)

---

## ✨ Principais Recursos (v3.6)

### 🎓 Guia de Estudos Progressivo — 16 Capítulos, 48 Lições & 48 Dossiês (PT / EN)
* **Trilha estruturada em 5 filtros rápidos** com progresso salvo no `localStorage`:
  1. **🌱 Base (Cap. 1–2 · Lições 1–6):** Cordas soltas, 1ª Posição, *Maqam Ajam*, *Nahawand/Kurd*, blocos *Ajnas* e primeiros quartos de tom (*Jins Rast* e *Jins Bayati*).
  2. **✨ Intermediário (Cap. 3–4 · Lições 7–12):** Fraseado (*Sayr*) em *Rast*, salto `b2–3` em *Hijaz*, *Qafla* sobre *Iqa' Maqsum*, pontes de uníssono (`=1ª..3ª`), mudanças de posição (`II` e `III`) e modulação pelo *Ghammaz* (*Rast → Suznak*).
  3. **🪶 Avançado (Cap. 5–8 · Lições 13–24):** *Bariolage*, *Zahfa* em *Sikah*, escolas Síria vs. Egípcia, modos compostos (*Saba*, *Huzam + Sama'i Thaqil 10/8*, *Nawa Athar + Malfuf*), harmonia modal (acordes 1 nota/ordem, tríade neutra *Rast* arpejada e cadências *Qaflat*), 3ª Posição no tampo (*Jawab*), *Maqam Nikriz* e transposição (*Taswir*) sobre *Iqa' Ayyub*.
  4. **👑 Mestre (Cap. 9–10 · Lições 25–30):** Escolas e afinações históricas (**Cairo / Egípcia**, **Istambul / Turca**, **Bagdá / Mounir Bashir**), arquitetura do *Taqsim* em 4 atos, modulação encadeada (*Bayati → Hijaz → Saba*) e Recital Final em **Modo Imersivo (*Zen Stage*)**.
  5. **🌍 Mundo & Fusão (Cap. 11–16 · Lições 31–48):**
     * **Cap. 11 (Modos Ocidentais & Folk):** Dórico/Eólio, Lídio/Mixolídio e *Power Voicings* (`1–5`) em *Shapes* móveis 12-TET.
     * **Cap. 12 (Blues & *Blue Notes* Microtonais):** Pentatônicas no braço sem trastes, *blue notes* neutras reais (`3-` e `7-`) em 24-TET com *Zahfa* e *Call & Response*.
     * **Cap. 13 (Mediterrâneo, Andaluzia & Flamenco):** De *Ziryab* a Córdoba (Cadência Andaluza), *Frígio Dominante* & *picado* de *Risha*, e *Rebetiko* grego (*Dromoi* & *Tsifteteli* 8/4).
     * **Cap. 14 (Jazz Modal & *Oud Trio*):** Centros modais (*Dórico / Lídio*), tétrades (`Maj7`, `m7`, `7`) e estética de *Oud Trio* (*Menor Melódica*).
     * **Cap. 15 (Música Brasileira no Oud):** Modo Nordestino (`Lídio b7`) & *Baião/Zabumba*, baixarias de *Choro* e harmonia aberta da *Bossa Nova*.
     * **Cap. 16 (Música Antiga / Alaúde & Síntese Global):** Contraponto a 2 vozes, prelúdios polifônicos e síntese livre entre *Maqam*, *Iqa'* e estilos globais.
* **Presets de 1 clique & Dossiês Teóricos (`js/core/studyDossiers.js`):** Cada lição aplica o cenário completo no espelho e acompanha um dossiê bilíngue recolhível com *chips* conceituais, *Arquitetura & Gravidade Modal*, *Intonação, Escolas & Acústica*, *Armadilha Comum & Correção* e *Escuta Guiada*.

### 🎙️ Detector de Intonação 24-TET, Modo Linha (DI) & Afinador 6 Ordens
* **3 Modos de Leitura em Tempo Real (`js/audio/pitchEngine.js`):** **🎯 Maqam 24-TET** (com desvios tradicionais `cents_dev`), **📏 24-TET Puro** (`-50¢` a `+50¢` com orientação de dedo) e **🪕 Afinador 6 Ordens** (automático ou travado com tom de referência e destaque no cabeçote).
* **🔌 Modo Linha (Interface de Áudio USB / DI):** Alternância entre **🎙 Mic** e **🔌 Linha (DI)**, seletor de dispositivo, roteamento de canal (**Auto / Ch 1 / Ch 2**), filtro *sidechain* anti-piezo, *Noise Gate* e medidor **VU em dBFS com alerta de CLIP**, mantendo leitura contínua sobre *Drone* e *Iqa'*.

### 🪕 Modelagem Física do Oud & Motor Rítmico (*Iqa'at*)
* **Motor Físico Karplus-Strong Estendido + IR Modal de Caixa (`js/audio/synthEngine.js`):** Síntese procedural de cordas duplas com alternância instantânea entre **Timbre Sírio (Seco)** e **Timbre Egípcio (Encorpado)**, compatível com iOS/Chrome (`WKWebView`) e fones Bluetooth.
* **Motor Rítmico & Drone:** Ciclos orientais (*Maqsum, Baladi, Sa'idi, Malfuf, Ayyub, Sama'i Thaqil 10/8*) e universais (*Chiftetelli/Tsifteteli 8/4, Tangos/Rumba Flamenca 4/4, Baião/Zabumba 2/4, Pulso Ternário/Valsa 3/4*) com controle de BPM, grade de tempos e *Drone* contínuo.

### 🧭 Espelho Paramétrico, Cabeçote (*Banjak*), Pauta 24-TET & Modulação
* Cabeçote artesanal (*Banjak*) com 6 cravelhas interativas (exibível ou ocultável), posições anatômicas (`I · 1ª Pos`, `II · 2ª Pos`, `III · Tampo`, `Shape Móvel`), pivôs (`⇄P2`, `⇄P3`) e pontes de uníssono (`=1ª..5ª`), pauta interativa 24-TET (`8vb`), caminho de 1 oitava ancorado e Radar de Modulação (*Intiqal*).
* Temas *Layl* (Escuro) e *Nahar* (Claro), **Modo Imersivo (*Zen Stage* — tecla `F`)**, ergonomia Mobile (`<= 768px`), compartilhamento por link (`#hash`) e **PWA 100% offline** (`v3.6.0`).

---

## 🗂️ Arquitetura do Projeto

```text
app-oud-visualizer/
├── index.html                 # Estrutura semântica, Barra Única, Deck e metadados PWA
├── manifest.json              # Manifesto de instalação Standalone (PWA)
├── sw.js                      # Service Worker para cache e uso 100% offline (v3.6.0)
├── README.md                  # Documentação do projeto
├── assets/
│   └── icon-oud.svg           # Ícone vetorial geométrico (Shamsiyya & Octagrama)
├── styles/
│   └── main.css               # Design System responsivo (Layl/Nahar, Zen, Tuner, Dossiê, Mundo & Mobile)
└── js/
    ├── main.js                # Controlador principal, Guia de Estudos, Dossiês, Popovers, Tuner e HUD
    ├── core/
    │   ├── database.js        # Base 24-TET: Maqamat, Ajnas, escalas universais, acordes, Qaflat e ritmos
    │   ├── modalEngine.js     # Motor intervalar, posições anatômicas, pivôs e caminho de 1 oitava
    │   ├── studyGuide.js      # Trilha progressiva bilíngue: 16 capítulos e 48 lições com presets
    │   ├── studyDossiers.js   # 48 dossiês bilíngues: arquitetura, intonação, armadilhas e escuta guiada
    │   ├── urlState.js        # Serialização de estado na URL (#hash) e restauração
    │   ├── glossary.js        # Glossário bilíngue de teoria modal e luthieria (Al-Mu'jam)
    │   └── i18n.js            # Internacionalização completa Português / Inglês
    ├── audio/
    │   ├── synthEngine.js     # Síntese física Karplus-Strong Estendida (Sírio/Egípcio), Drone e ritmos
    │   └── pitchEngine.js     # Detector YIN 24-TET, Modo Linha (DI), canais, Noise Gate e medidor VU
    └── ui/
        ├── neckRenderer.js    # SVG paramétrico do braço, cabeçote Banjak, posições, Sayr e overlay ao vivo
        └── staffRenderer.js   # SVG da pauta interativa 24-TET 8vb e Compasso Inspetor
