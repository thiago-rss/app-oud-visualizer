# 🪕 App Oud Visualizer — v3.3 Studio & PWA

**Estúdio Interativo 24-TET para Oud: Guia de Estudos Progressivo (10 Capítulos / 30 Lições), Detector de Intonação Microtonal (Mic & Interface DI), Afinador 6 Ordens, Síntese Física (Sírio/Egípcio), Partitura Sincronizada, Radar de Modulação (*Intiqal*), Motor Rítmico (*Iqa'at*) e Luthieria Árabe.**

🔗 **Acesso Online (GitHub Pages):** [thiago-rss.github.io/app-oud-visualizer/](https://thiago-rss.github.io/app-oud-visualizer/)

---

## ✨ Principais Recursos (v3.3)

### 🎓 Guia de Estudos Progressivo — 10 Capítulos & 30 Lições (PT / EN)
* **Trilha estruturada em 4 níveis** com filtro rápido na barra do guia e progresso persistente no `localStorage`:
  1. **🌱 Base (Cap. 1–2):** Cordas soltas, 1ª Posição, *Ajam*, *Nahawand*, blocos *Ajnas* e primeiros quartos de tom (*Jins Rast* e *Jins Bayati*).
  2. **✨ Intermediário (Cap. 3–4):** Fraseado (*Sayr*), *Maqam Hijaz*, *Qafla* sobre *Iqa' Maqsum*, pontes de uníssono (`=1ª..3ª`), mudanças de posição (`II` e `III`) e modulação pelo *Ghammaz*.
  3. **🪶 Avançado (Cap. 5–8):** *Bariolage*, *Zahfa* em *Sikah*, contraste Sírio vs. Egípcio, modos compostos (*Saba*, *Huzam + Sama'i Thaqil 10/8*, *Nawa Athar + Malfuf*), harmonia modal (acordes, tríade neutra *Rast* e cadências *Qaflat*), 3ª Posição no tampo (*Jawab*), *Nikriz* e transposição (*Taswir*) sobre *Iqa' Ayyub*.
  4. **👑 Mestre (Cap. 9–10):** Escolas e afinações históricas (**Cairo / Egípcia**, **Istambul / Turca**, **Bagdá / Mounir Bashir**), arquitetura do *Taqsim* em 4 atos, modulação encadeada (*Bayati → Hijaz → Saba*) e Recital Final em **Modo Imersivo (*Zen Stage*)**.
* **Presets de 1 clique:** cada lição configura automaticamente afinação, escola visual, modalidade, posição, rótulos, pauta, ritmo *Iqa'* e perfil sonoro, com atalhos diretos para exemplo em áudio, Escuta 24-TET, Drone, Timbre, Radar de Modulação e Glossário.

### 🎙️ Detector de Intonação 24-TET, Modo Linha (DI) & Afinador 6 Ordens
* **3 Modos de Leitura em Tempo Real (`pitchEngine.js`):**
  * **🎯 Maqam 24-TET:** valida a afinação das notas tocadas no Oud real respeitando os desvios microtonais tradicionais (`cents_dev`) do *Maqam* ou *Jins* ativo, com projeção ao vivo sobre o braço.
  * **📏 24-TET Puro:** leitura cromática em quartos de tom com agulha de precisão em *cents* (`-50¢` a `+50¢`) e indicação de direção do dedo.
  * **🪕 Afinador 6 Ordens:** detecção automática ou travada por ordem (6ª → 1ª) com tom de referência e iluminação nas cravelhas do cabeçote.
* **🔌 Modo Linha (Interface de Áudio USB / DI):**
  * Alternância instantânea entre **🎙 Mic** e **🔌 Linha (DI)** com seletor de dispositivo de entrada, roteamento de canal (**Auto / Ch 1 / Ch 2**), filtro *sidechain* anti-piezo, controle de sensibilidade (*Noise Gate*) e medidor **VU em dBFS com alerta de CLIP**.
  * Rastreamento contínuo mesmo com **Drone** e **Iqa'** ligados simultaneamente (recomendado o uso de fones conectados à interface).

### 🪕 Modelagem Física do Oud & Motor Rítmico (*Iqa'at*)
* **Síntese Física Web Audio (`synthEngine.js`):** cordas duplas com resposta de palheta (*Risha*), formantes de caixa acústica e alternância instantânea entre **Timbre Sírio (Seco/Articulado)** e **Timbre Egípcio (Encorpado/Ressonante)**.
* **Motor Rítmico & Drone:** ciclos tradicionais (*Maqsum*, *Baladi*, *Sa'idi*, *Malfuf*, *Ayyub*, *Sama'i Thaqil 10/8*) sintetizados em *Darbuka* e *Riq* com controle de BPM e grade visual de tempos (*Dum / Tak / Kah*), além de Drone contínuo na tônica (*Qarar*).

### 🧭 Espelho Paramétrico, Cabeçote (*Banjak*), Pauta 24-TET & Modulação
* **Cabeçote Artesanal (*Banjak*) Interativo:** 6 cravelhas (*Mafatih*) clicáveis para ouvir a referência de cada ordem, com brilho sincronizado ao afinador e opção de exibir/ocultar.
* **Posições Anatômicas & Pivôs:** regiões clicáveis (**I · 1ª Pos**, **II · 2ª Pos**, **III · Tampo**, **Shape Móvel**), marcador de polegar, audição por região, pivôs de deslocamento (`⇄P2`, `⇄P3`) e pontes de uníssono (`=1ª..5ª`).
* **Partitura Interativa 24-TET (Clave de Sol 8vb):** acidentes de meio-bemol (`𝄳`), sincronização bidirecional entre pauta e braço, exibição de escala/acorde ou frase *Sayr* e botão retrátil.
* **Traçador de Caminho de 1 Oitava Ancorado:** duplo clique em qualquer joia (ou **`🎯 Definir Tônica`**) transpõe a modalidade e traça o caminho ergonômico ascendente (`+8ª`) ou descendente (`-8ª`).
* **Radar de Modulação (*Intiqal*):** rotas tradicionais sobre o *Ghammaz* e graus-pivô com prévia sonora (**`🔊 Ouvir`**), modulação em 1 clique (**`⚡ Modular`**) e retorno imediato (**`↩ Voltar à Origem`**).
* **5 Afinações & 3 Escolas Visuais:** *Síria (C–c)*, *Árabe Clássica (F–f)*, *Egípcia (D–c)*, *Turca/Grega (D–a)* e *Iraquiana (Mounir Bashir)*; tradições de **Damasco**, **Cairo/Bagdá** e **Istambul**; suporte a **Destro e Canhoto**.

### 🌙 Interface Estúdio, Ergonomia Mobile & PWA Offline
* **Arquitetura Limpa:** cabeçalho com Cápsula de Áudio (`▶ Tocar ▾`) + Menu Unificado (`⋯`), Barra Única de Comando com 4 *Popovers* (Desktop) / *Bottom Sheets* (Mobile) e Deck Horizontal com 3 abas (*Teoria & Sayr · Radar de Modulação · Guia de Estudos*).
* **Temas *Layl* (Escuro) & *Nahar* (Claro — Pergaminho Iluminado):** contenção cromática em latão, ameixa e madrepérola + **Modo Imersivo (*Zen Stage* — tecla `F`)** com HUD flutuante.
* **Mobile (`<= 768px`) & iOS:** braço vertical automático (*Auto-Portrait*), barra inferior fixa de 4 botões (**▶ Tocar · 🎶 Taqsim · 🎙 Mic/Linha · 📖 Estudo**), lupa microtonal flutuante e gerenciamento limpo de sessão de áudio no iOS.
* **PWA 100% Offline & Compartilhamento:** instalável via `manifest.json` + `sw.js` e exportação instantânea de estado completo por link (`#hash`).

---

## 🗂️ Arquitetura do Projeto

```text
app-oud-visualizer/
├── index.html                 # Estrutura semântica, Barra Única, Deck e metadados PWA
├── manifest.json              # Manifesto de instalação Standalone (PWA)
├── sw.js                      # Service Worker para cache e uso 100% offline
├── README.md                  # Documentação do projeto
├── assets/
│   └── icon-oud.svg           # Ícone vetorial geométrico (Shamsiyya & Octagrama)
├── styles/
│   └── main.css               # Design System responsivo (Layl/Nahar, Zen Stage, Tuner & Mobile)
└── js/
    ├── main.js                # Controlador principal, Guia de Estudos, Popovers, Tuner e HUD
    ├── core/
    │   ├── database.js        # Base 24-TET: 11 Maqamat, Ajnas, Modos, Acordes, Qaflat, Iqa'at e Afinações
    │   ├── modalEngine.js     # Motor intervalar, posições anatômicas, pivôs e caminho de 1 oitava
    │   ├── studyGuide.js      # Trilha progressiva bilíngue: 10 capítulos e 30 lições com presets
    │   ├── urlState.js        # Serialização de estado na URL (#hash) e restauração
    │   ├── glossary.js        # Glossário bilíngue de teoria modal e luthieria (Al-Mu'jam)
    │   └── i18n.js            # Internacionalização completa Português / Inglês
    ├── audio/
    │   ├── synthEngine.js     # Modelagem física de Oud (Sírio/Egípcio), Drone e percussão Darbuka/Riq
    │   └── pitchEngine.js     # Detector YIN 24-TET, Modo Linha (DI), roteamento de canais, Gate e VU
    └── ui/
        ├── neckRenderer.js    # SVG paramétrico do braço, cabeçote Banjak, posições, Sayr e overlay ao vivo
        └── staffRenderer.js   # SVG da pauta interativa 24-TET 8vb e Compasso Inspetor
