# 🪕 App Oud Visualizer — v3.13.0 Studio & PWA

**Tratado e Estúdio Interativo 24-TET para Oud (Alaúde Árabe): Guia de Estudos Progressivo (17 Capítulos, 51 Lições, 51 Dossiês Bilíngues & Estudos Técnicos Procedurais), Detector de Intonação Microtonal em Tempo Real (Mic & Modo Linha DI), Afinador 6 Ordens, Síntese Física Karplus-Strong Estendida (Sírio/Egípcio), Cabeçote (*Banjak*) Interativo, Partitura Sincronizada, Radar de Modulação (*Intiqal*), Motor Rítmico (*Iqa'at*) e PWA 100% Offline.**

🔗 **Acesso Online (GitHub Pages):** [thiago-rss.github.io/app-oud-visualizer/](https://thiago-rss.github.io/app-oud-visualizer/)

---

## ✨ Principais Recursos (v3.13.0)

### 🎓 Guia de Estudos Progressivo — 17 Capítulos, 51 Lições & 51 Dossiês (PT / EN)
* **Trilha estruturada em 5 filtros rápidos** (*Todos · Base · Interm. · Avanç. · Mestre · Mundo & Fusão*) com progresso persistido em `localStorage`:
  1. **🌱 Base (Cap. 1–2 · Lições 1–6):** Cordas soltas, 1ª Posição, *Maqam Ajam*, *Nahawand/Kurd*, blocos *Ajnas* e primeiros quartos de tom (*Jins Rast* e *Jins Bayati*).
  2. **✨ Intermediário (Cap. 3–4 · Lições 7–12):** Fraseado (*Sayr*) em *Rast*, salto `b2–3` em *Hijaz*, *Qafla* sobre *Iqa' Maqsum*, pontes de uníssono (`=1ª..3ª`), mudanças de posição (`II` e `III`) e modulação pelo *Ghammaz* (*Rast → Suznak*).
  3. **🪶 Avançado (Cap. 5–8 · Lições 13–24):** *Bariolage*, *Zahfa* em *Sikah*, escolas Síria vs. Egípcia, modos compostos (*Saba*, *Huzam + Sama'i Thaqil 10/8*, *Nawa Athar + Malfuf*), harmonia modal (acordes 1 nota/ordem, tríade neutra *Rast* arpejada e cadências *Qaflat*), 3ª Posição no tampo (*Jawab*), *Maqam Nikriz* e transposição (*Taswir*) sobre *Iqa' Ayyub*.
  4. **👑 Mestre (Cap. 9–10 · Lições 25–30):** Escolas e afinações históricas (**Cairo / Egípcia**, **Istambul / Turca**, **Bagdá / Mounir Bashir**), arquitetura do *Taqsim* em 4 atos, modulação encadeada (*Bayati → Hijaz → Saba*) e Recital Final em **Modo Imersivo (*Zen Stage*)**.
  5. **🌍 Mundo & Fusão (Cap. 11–17 · Lições 31–51):**
     * **Cap. 11 (Modos Ocidentais & Folk):** Dórico/Eólio, Lídio/Mixolídio e *Power Voicings* (`1–5`) em *Shapes* móveis 12-TET.
     * **Cap. 12 (Blues & *Blue Notes* Microtonais):** Pentatônicas no braço sem trastes, *blue notes* neutras reais (`3-` e `7-`) em 24-TET com *Zahfa* e *Call & Response*.
     * **Cap. 13 (Mediterrâneo, Andaluzia & Flamenco):** De *Ziryab* a Córdoba (Cadência Andaluza), *Frígio Dominante* & *picado* de *Risha*, e *Rebetiko* grego (*Dromoi* & *Tsifteteli* 8/4).
     * **Cap. 14 (Jazz Modal & *Oud Trio*):** Centros modais (*Dórico / Lídio*), tétrades (`Maj7`, `m7`, `7`) e estética de *Oud Trio* (*Menor Melódica*).
     * **Cap. 15 (Música Brasileira no Oud):** Modo Nordestino (`Lídio b7`) & *Baião/Zabumba*, baixarias de *Choro* e harmonia aberta da *Bossa Nova*.
     * **Cap. 16 (Música Antiga / Alaúde & Síntese Global):** Contraponto a 2 vozes, prelúdios polifônicos e síntese livre entre *Maqam*, *Iqa'* e estilos globais.
     * **Cap. 17 (Integração Estilística & Sonoridade Multiestilo · Lições 49–51):** Função textural & timbre em conjuntos multiestilo, microtonalidade (24-TET / desvios do *Maqam*) vs. contextos temperados (12-TET) e integração de *Sayr*, *Qafla* e *grooves* globais.
* **Presets de 1 clique (`js/core/studyResolver.js`):** cada lição resolve e aplica automaticamente afinação, escola visual, modalidade, tônica (*Qarar*), posição anatômica, rótulos, guias, pauta, ritmo *Iqa'* e perfil sonoro, com atalhos diretos para exemplo em áudio, Escuta 24-TET, Drone, Timbre, Modo Imersivo, Radar de Modulação e Glossário.
* **📚 Dossiê Teórico, Intonação & Repertório (`js/core/studyDossiers.js`):** 51 dossiês bilíngues recolhíveis com *chips* conceituais, *Arquitetura & Gravidade Modal*, *Intonação, Escolas & Acústica*, *Armadilha Comum & Correção* e *Escuta Guiada* (gravações de referência com orientação de escuta).
* **🎯 Estudos Técnicos Procedurais (`js/core/technicalEtudes.js`):** geração dinâmica de padrões técnicos adaptados à lição ativa (**Terças Quebradas 1-3-2**, **Grupos de 3**, **Pedal & Risha / Bariolage** e **Foco Microtonal**), com indicação de palhetada (*Risha* `↓`/`↑`), controle de velocidade, reprodução em loop e destaque sincronizado em tempo real no braço e na pauta 24-TET.

### 🎙️ Detector de Intonação 24-TET, Modo Linha (DI) & Afinador 6 Ordens
* **3 Modos de Leitura em Tempo Real (`js/audio/pitchEngine.js`):**
  * **🎯 Maqam 24-TET:** valida a afinação das notas tocadas no Oud físico respeitando os desvios microtonais tradicionais (`cents_dev`) do *Maqam* ou *Jins* ativo, projetando um ponteiro contínuo na camada leve `#live-pitch-layer` do braço.
  * **📏 24-TET Puro:** leitura cromática em quartos de tom (`50¢` por degrau) com agulha de precisão em *cents* (`-50¢` a `+50¢`) e orientação de dedo adaptada a destro/canhoto e horizontal/vertical.
  * **🪕 Afinador 6 Ordens:** detecção automática ou travada por ordem (`6ª → 1ª`) para qualquer uma das 5 afinações do catálogo, com tom de referência (`🔊`) e destaque luminoso nas cravelhas do cabeçote (*Banjak*).
* **🔌 Modo Linha (Interface de Áudio USB / DI):**
  * Alternância instantânea entre **🎙 Mic** e **🔌 Linha (DI)** com seletor de dispositivo de entrada (`enumerateDevices` + atualização automática em `devicechange`), roteamento de canal (**Auto / Ch 1 / Ch 2**) via `ChannelSplitterNode`, filtro *sidechain* anti-piezo (`HPF 55 Hz` + `LPF 1.350 Hz`), ajuste de *Noise Gate* e medidor **VU em dBFS com alerta de `CLIP`**.
  * Mantém rastreamento contínuo mesmo com **Drone** e **Iqa'** ligados simultaneamente (recomendado o uso de fones conectados à interface).

### 🎻 Modelagem Física do Oud & Motor Rítmico (*Iqa'at*)
* **Motor Físico Karplus-Strong Estendido + IR Modal de Caixa (`js/audio/synthEngine.js`):** síntese 100% procedural (0 KB de *samples* externos) de ordens duplas com atraso fracionário *Allpass* (sub-cent), transiente de *Risha* e convolução de caixa acústica (`ConvolverNode`), com alternância instantânea entre **Timbre Sírio (Seco/Articulado)** e **Timbre Egípcio (Encorpado/Ressonante)** e compatibilidade estável com iOS/Chrome (`WKWebView`) e fones Bluetooth (A2DP).
* **Motor Rítmico & Drone:** ciclos orientais (*Maqsum, Baladi, Sa'idi, Malfuf, Ayyub, Sama'i Thaqil 10/8*) e universais (*Chiftetelli/Tsifteteli 8/4, Tangos/Rumba Flamenca 4/4, Baião/Zabumba 2/4, Pulso Ternário/Valsa 3/4*) sintetizados em *Darbuka* e *Riq* com controle de BPM (`50–175`), grade visual de tempos (*DUM / TAK / KAH*) sincronizada ao vivo e *Drone* contínuo na tônica (*Qarar*).

### 🧭 Espelho Paramétrico, Cabeçote (*Banjak*), Pauta 24-TET & Modulação
* **Cabeçote Artesanal (*Banjak*) Interativo:** coroa *Mihrab*, filetes de madrepérola (*sadaf*) e 6 cravelhas (*Mafatih*) clicáveis para soar a referência de cada ordem, com brilho sincronizado ao afinador e opção de exibir/ocultar (`Espelho & Guias`).
* **Posições Anatômicas & Pivôs:** cápsulas clicáveis (**I · 1ª Pos**, **II · 2ª Pos**, **III · Tampo**, **Shape Móvel**), marcador de polegar, audição por região (`▶`), pivôs de deslocamento (`⇄P2`, `⇄P3`) e pontes de uníssono (`=1ª..5ª`) com arco visual.
* **Partitura Interativa 24-TET (Clave de Sol 8vb):** acidentes vetoriais de meio-bemol (`𝄳`) e meio-sustenido, *Compasso Inspetor* sincronizado bidirecionalmente com o braço, alternância entre Escala/Acorde e *Sayr* e exibição retrátil.
* **Traçador de Caminho de 1 Oitava Ancorado:** duplo clique em qualquer joia (ou **`🎯 Definir Tônica`**) transpõe a modalidade e traça o caminho ergonômico ascendente (`+8ª`) ou descendente (`-8ª`).
* **Radar de Modulação (*Intiqal*):** rotas tradicionais sobre o *Ghammaz* e graus-pivô com prévia sonora (**`🔊 Ouvir`**), modulação em 1 clique (**`⚡ Modular`**) e retorno imediato (**`↩ Voltar à Origem`**).
* **5 Afinações & 3 Escolas Visuais:** *Síria (C–c)*, *Árabe Clássica (F–f)*, *Egípcia (D–c)*, *Turca/Grega (D–a)* e *Iraquiana (Mounir Bashir)*; estéticas de luthieria de **Damasco**, **Cairo/Bagdá** e **Istambul**; suporte completo a **Destro e Canhoto**.

### 🌙 Interface Estúdio, Ergonomia Mobile & PWA Offline
* **Arquitetura Limpa:** cabeçalho com Cápsula de Áudio (`▶ Tocar ▾`) + Menu Unificado (`⋯`), Barra Única de Comando com 4 *Popovers* (Desktop) / *Bottom Sheets* (Mobile) e Deck Horizontal com 3 abas (*Teoria & Sayr · Radar de Modulação · Guia de Estudos*).
* **Temas *Layl* (Escuro) & *Nahar* (Claro — Pergaminho Iluminado):** contenção cromática em latão, ameixa e madrepérola + **Modo Imersivo (*Zen Stage* — tecla `F`)** com HUD flutuante.
* **Mobile (`<= 768px`) & iOS:** braço vertical automático (*Auto-Portrait*), barra inferior fixa de 4 botões (**▶ Tocar · 🎶 Taqsim · 🎙 Mic/Linha · 📖 Estudo**), lupa microtonal flutuante (*Touch Loupe*) e gestão limpa de sessão de áudio sem player fantasma na tela de bloqueio do iOS.
* **PWA 100% Offline & Compartilhamento:** instalável via `manifest.json` + `sw.js` (`v3.8.0`) e exportação instantânea do estado completo por link (`#hash`).

---

## 🔌 Conectando o Oud em Linha (Interface USB / DI)

1. Conecte sua interface de áudio USB *Class-Compliant* ao Mac ou iPhone (via USB-C direto ou adaptador *Lightning–USB Camera*) e plugue seus fones na saída da própria interface para monitoração sem latência.
2. No app, abra **`⋯ → Escuta 24-TET & Afinador`** (ou toque em **`🎙 Mic`** na barra inferior mobile) e mude o perfil para **`🔌 Linha (DI)`**.
3. Escolha a interface no seletor de entrada e isole **`Ch 1`** ou **`Ch 2`** conforme o canal utilizado.
4. Ajuste o ganho do pré da interface observando a barra **`IN` (VU)** para atingir a zona útil (`-18` a `-6 dB`) sem acender **`CLIP`**.
5. Em Ouds com captador híbrido (*piezo + microfone interno com blend*), priorize o lado do piezo para manter isolamento total ao tocar junto com **Drone** e **Iqa'**.

---

## ⌨️ Atalhos & Gestos Rápidos

| Ação | Como ativar |
| :--- | :--- |
| **Ouvir Corda Solta da Ordem** | Clique direto em qualquer uma das **6 cravelhas (*mafatih*)** ou nos cartuchos (quando o *banjak* estiver oculto) |
| **Ligar / Desligar Escuta (Mobile)** | Botão **`🎙 Mic: OFF/ON`** (ou **`🔌 Linha: OFF/ON`**) na barra inferior mobile |
| **Alternar Microfone vs. Interface (DI)** | Na faixa de escuta aberta, selecione **`🎙 Mic`** ou **`🔌 Linha (DI)`**, escolha a interface e o canal (`Auto` / `Ch 1` / `Ch 2`) |
| **Exibir / Ocultar Cabeçote (*Banjak*)** | Popover **`Espelho & Guias`** → **`🪕 Cabeçote (Banjak)`** |
| **Alternar Caráter Sonoro (Sírio / Egípcio)** | Menu **`⋯`** → *Timbre: Sírio (Seco) / Egípcio (Encorpado)* |
| **Abrir Escuta 24-TET / Afinador 6 Ordens** | Menu **`⋯`** → *Escuta 24-TET & Afinador* ou Popover **`Afinação & Qarar`** → *Afinar 6 Ordens* |
| **Definir Tônica + Caminho de 1 Oitava** | Duplo clique (ou `Shift + clique`) em qualquer joia no braço |
| **Isolar / Alternar Posição (`I`, `II`, `III`)** | Clique direto na cápsula da região acima do braço |
| **Ouvir Notas da Posição Ativa** | Clique no botão `▶` acoplado à cápsula ativa |
| **Testar Uníssono / Mudança de Mão** | Clique nas microcápsulas `=1ª`, `=2ª`, `=3ª`, `⇄P2` ou `⇄P3` |
| **Modo Imersivo (*Zen Stage*)** | Tecla `F` (Desktop) ou menu `⋯` |
| **Fechar Menus / Popovers / Sair do Zen** | Tecla `Esc` |

---

## 🗂️ Arquitetura do Projeto

```text
app-oud-visualizer/
├── index.html                    # Estrutura semântica (Cabeçalho, Barra Única, Faixa de Escuta, Palco, Deck e Dock Mobile)
├── manifest.json                 # Manifesto de instalação Standalone (PWA)
├── sw.js                         # Service Worker offline (cache oud-visualizer-v3.13.0)
├── README.md                     # Documentação do projeto
├── assets/
│   └── icon-oud.svg              # Ícone vetorial geométrico (Shamsiyya & Octagrama)
├── styles/
│   └── main.css                  # Design System responsivo (Layl/Nahar, Zen, Tuner/VU, Dossiês, Estudos & Mobile)
└── js/
    ├── main.js                   # Orquestrador central de estado, ciclo de vida, eventos e integração dos módulos
    ├── audio/
    │   ├── synthEngine.js        # Síntese física Karplus-Strong Estendida (Sírio/Egípcio), Drone, ritmos e iOS/A2DP
    │   └── pitchEngine.js        # Detector YIN 24-TET, Modo Linha (DI), ChannelSplitter, filtro anti-piezo, VU e Afinador
    ├── core/
    │   ├── database.js           # Base 24-TET: Maqamat, Ajnas, escalas universais, acordes, Qaflat, ritmos e afinações
    │   ├── modalEngine.js        # Motor intervalar, posições anatômicas, pivôs e caminho de 1 oitava ancorado
    │   ├── stateTransitions.js   # Normalização de estado (applyStatePatch), validação de enums/booleanos e invariantes
    │   ├── uiRuntime.js          # Helpers de runtime (escapeHtml, armazenamento local seguro e registro de timers)
    │   ├── studyGuide.js         # Currículo bilíngue: 17 capítulos e 51 lições com presets pedagógicos
    │   ├── studyDossiers.js      # 51 dossiês teóricos bilíngues: arquitetura, intonação, armadilhas e escuta guiada
    │   ├── studyResolver.js      # Resolvedor determinístico de presets de lições contra o catálogo musical
    │   ├── technicalEtudes.js    # Gerador procedural de estudos técnicos e padrões de Risha por lição
    │   ├── urlState.js           # Serialização e restauração de estado via hash de URL (#...)
    │   ├── glossary.js           # Glossário bilíngue Al-Mu'jam al-Musiqi
    │   └── i18n.js               # Internacionalização completa Português / Inglês
    └── ui/
        ├── neckRenderer.js       # SVG paramétrico do braço, cabeçote Banjak/cravelhas, posições, Sayr e #live-pitch-layer
        ├── staffRenderer.js      # SVG da pauta interativa 24-TET (8vb) e Compasso Inspetor
        ├── overlaysAndModals.js  # Controlador dos menus do cabeçalho (⋯ / ▾), popovers da Barra Única, loupe e glossário
        ├── tunerController.js    # Controlador da faixa de escuta 24-TET, Modo Linha (DI), dispositivos e medidor VU
        ├── deckPanelsView.js     # Renderização dos painéis do Deck, grade Iqa', cadências, Radar de Modulação e HUD
        └── studyGuideView.js     # Renderização do Guia de Estudos, dossiês teóricos e reprodução de Estudos Técnicos
```

---

## 💻 Executando Localmente

Como o projeto utiliza módulos ES (`type="module"`) e captura de áudio/interface (que exige contexto seguro), execute-o através de um servidor HTTP em `localhost` (o Service Worker é ignorado automaticamente em `localhost`):

```bash
# Python 3
python3 -m http.server 8000
```

Acesse **`http://localhost:8000`** no navegador (ou utilize a extensão *Live Server* no VS Code).

---

## 📌 Histórico de Versões

* **v3.7.10:** Restauração dos controles interativos da aba de **Estudo Técnico Procedural** (`studyGuideView.js` e `main.js`): seleção de padrão, velocidades (`0.65× / 0.85× / 1.0×`), `▶ Tocar Estudo`, `🔁 Loop` / `⏹ Parar Loop` e realce em tempo real nos chips de *Risha* (`↓`/`↑`).
* **v3.7.9:** Correção dos controladores extraídos de UI (`overlaysAndModals.js`, `deckPanelsView.js` e `studyGuideView.js`): restauração completa dos menus do cabeçalho (`⋯` e `▾`) com fechamento mútuo de popovers, remoção de *snapshots* de estado congelados (*Iqa'* ao vivo, Modo Zen, colapso do Deck, barra de cadências e Radar de Modulação), correção do botão **`↩ Voltar à Origem`** e sincronização em tempo real do destaque de passos nos Estudos Técnicos.
* **v3.7.0–v3.7.8:** Refatoração arquitetural completa em módulos desacoplados (`stateTransitions.js`, `uiRuntime.js`, `studyResolver.js`, `overlaysAndModals.js`, `tunerController.js`, `deckPanelsView.js`, `studyGuideView.js`), centralização das mutações via `applyStatePatch` e expansão do currículo para **17 capítulos, 51 lições e 51 dossiês** com o **Capítulo 17 — Integração Estilística & Sonoridade Multiestilo** + gerador de **Estudos Técnicos Procedurais** (`technicalEtudes.js`).
* **v3.6.0:** Lançamento da **Parte II — Mundo & Fusão (Capítulos 11–16 · Lições 31–48)** com escalas universais, *blue notes* 24-TET, Mediterrâneo/Flamenco/Rebetiko, Jazz Modal, Música Brasileira, Música Antiga e novos ritmos globais.
* **v3.4.0:** Adição dos **Dossiês Teóricos, Intonação & Repertório** (`studyDossiers.js`) bilíngues em todas as lições, com análise modal, nuances regionais, armadilhas comuns e escuta guiada.
* **v3.3.0:** Expansão do Guia de Estudos Progressivo para **10 capítulos e 30 lições** em 4 níveis de proficiência (*Base · Intermediário · Avançado · Mestre*).
* **v3.1.9:** Novo **Modo Linha / Interface de Áudio USB (DI)** com seletor de dispositivo, isolamento de canal (`Auto / Ch 1 / Ch 2`), filtro *sidechain* anti-piezo, *Noise Gate*, medidor VU em `dBFS` com alerta `CLIP` e leitura contínua sobre *Drone* e *Iqa'*.
* **v3.1.5–v3.1.8:** Estabilização de áudio no iOS (microfone no Chrome/WebKit, AirPods/Bluetooth A2DP, remoção de player fantasma na tela de bloqueio) e reorganização da barra inferior mobile em 4 botões essenciais.
* **v3.1.4:** Cabeçote artesanal (**Banjak**) com coroa *Mihrab*, filetes de madrepérola e **6 cravelhas interativas (*Mafatih*)** integradas ao Afinador 6 Ordens.
* **v3.1.2:** Motor físico de Oud (**Karplus-Strong Estendido** + IR modal de caixa acústica) com seletor de caráter sonoro **Sírio (Seco)** vs. **Egípcio (Encorpado)**.
* **v3.1.0:** Detector de Intonação **24-TET em tempo real** (algoritmo YIN com `cents_dev` do *Maqam*), camada `#live-pitch-layer` e **Afinador 6 Ordens**.
* **v3.0.0:** Lançamento do **Guia de Estudos Progressivo** com presets em 1 clique e progresso salvo em `localStorage`.
* **v2.7.0–v2.9.2:** PWA 100% offline, Barra Única de Comando com *Popovers/Bottom Sheets*, Deck Horizontal, posições anatômicas clicáveis, pivôs/pontes de uníssono, Pauta Interativa 24-TET, Radar de Modulação e Modo Imersivo (*Zen*).
