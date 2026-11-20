# 🪕 App Oud Visualizer — v3.1.9 Studio & PWA

**Método interativo 24-TET para Oud (Alaúde Árabe)** desenvolvido em HTML5, CSS3 modular, JavaScript (ESM) e SVG — sem dependências externas, instalável como PWA, compatível com **interfaces de áudio USB em linha** e pronto para uso offline em Desktop e Mobile.

🔗 **Acesso Online:** [https://thiago-rss.github.io/app-oud-visualizer/](https://thiago-rss.github.io/app-oud-visualizer/)

---

## ✨ Destaques da Versão 3.1.9

* **🔌 Modo Linha / Interface de Áudio USB (DI):** Suporte nativo para conectar o Oud por cabo P10 via interface de áudio USB no Mac ou iPhone, com roteamento profissional integrado à faixa de escuta:
  * **Seletor de Perfil (`🎙 Mic` vs. `🔌 Linha (DI)`):** Alterna o condicionamento do sinal em tempo real sem derrubar a captura. No modo **Linha (DI)**, aplica um filtro *sidechain* dedicado (`HPF 55 Hz` + `LPF 1.350 Hz`) exclusivo para o motor YIN — removendo impactos de tampo/cabo e amaciando o estalo de captadores piezo — e mantém **leitura contínua sobre *Drone* e *Iqa'*** sem pausas anti-eco.
  * **Dispositivo & Roteamento de Canal (`Auto` · `Ch 1` · `Ch 2`):** Lista automaticamente todas as entradas de áudio conectadas (`enumerateDevices` com atualização ao vivo em `devicechange`) e isola o canal desejado via `ChannelSplitterNode` para interfaces multicanal.
  * **Medidor VU Pré-Filtro, Alerta `CLIP` & *Noise Gate*:** Barra de nível em `dBFS` com marcador visual do limiar de sensibilidade (*Alta / Média / Baixa*) e indicador **`CLIP`** para calibrar o ganho do pré-amplificador sem distorção. Todas as preferências ficam salvas em `localStorage`.
* **📱 Barra Inferior Mobile Reorganizada & Estabilidade de Áudio no iOS:**
  * **Novo Transporte Mobile (4 Botões):** **`▶ Tocar` · `🎶 Taqsim` · `🎙 Mic / 🔌 Linha: ON/OFF` · `📖 Estudo`**, colocando a escuta 24-TET e o afinador a um toque do polegar.
  * **Microfone & Captura no iPhone (Chrome / WebKit):** Gestão automática de `navigator.audioSession` (`"play-and-record"` durante captura), criação síncrona de `AudioContext` no gesto do usuário, *fallback* de *constraints* e grafo ativo para evitar silêncio no WebKit.
  * **AirPods & Fones Bluetooth (A2DP) + Tela de Bloqueio Limpa:** Motor 100% Web Audio em estéreo explícito com `latencyHint: "playback"`, recuperação automática em trocas de rota (`devicechange` / *watchdog* de relógio congelado) e remoção do elemento HTML5 de *keep-alive*, mantendo a tela de bloqueio e a Central de Controle livres de player fantasma.
* **🪕 Cabeçote Artesanal (*Banjak*) & 6 Cravelhas Interativas (*Mafatih*):**
  * **Arquitetura em Camadas & Coroa *Mihrab*:** Laterais em madeira com gradiente e filete contínuo de madrepérola (*sadaf*), câmara interna rebaixada com sombra atrás da pestana (*Anf*), pinos alternados, enrolamento helicoidal das cordas e ponta esculpida com medalhão incrustado — adaptada às **3 escolas de luthieria** (*Damasco, Cairo/Bagdá e Istambul*).
  * **Botões Integrados às Cabeças das Cravelhas:** As 6 cravelhas (*3 por lado*) trazem o rótulo da ordem (`6ª C` … `1ª c`) sempre reto e legível embutido na própria cabeça torneada; clique em qualquer cravelha para soar a corda solta.
  * **Integração Viva com o Afinador 6 Ordens:** Durante a afinação, o contorno elíptico da cravelha correspondente acende na camada `#live-pitch-layer` junto à seta de ajuste (`↑` apertar / `↓` afrouxar / `✓` afinada).
  * **Opção de Ocultar o Cabeçote (`Espelho & Guias` → `🪕 Cabeçote`):** Preferência salva em `localStorage`; ao ocultar o *banjak*, os 6 cartuchos clicáveis das ordens retornam automaticamente para junto da faixa `SOLTA (0)` com contraste adaptado aos temas claro e escuro.
* **🎻 Motor Físico de Oud (Karplus-Strong Estendido + IR de Caixa Acústica):** Síntese física 100% procedural (0 KB de *samples* externos) modelada para a acústica real do instrumento:
  * **Ordem Dupla & Afinação Sub-Cent:** Simula o par de cordas com ataque escalonado (~2–3 ms, reproduzindo a passagem da *risha* pelo par), desafinação simétrica (preservando o centro exato de frequência 24-TET + `cents_dev`) e atraso fracionário *Allpass* (precisão abaixo de `0,1 cent`).
  * **Palhetada & Caixa Convoluída (`ConvolverNode`):** Combina filtro pente de posição da palheta, micro-queda de tensão no ataque, golpe orgânico de *risha* de celuloide e *Impulse Response* (IR) modal de 15 modos acústicos (rosetas *Helmholtz*, tampo de abeto e bojo).
  * **Seletor de Caráter Sonoro (`⋯` → `🪕 Timbre`):** Alternância instantânea entre **Sírio (Seco)** — palhetada próxima ao cavalete, caixa de `155 ms` e médios anasalados (`560–1.420 Hz`) — e **Egípcio (Encorpado)** — palhetada mais perto da roseta, bojo cheio de `195 ms` e graves redondos (`100–420 Hz`), com nota de prévia na tônica ativa e preferência salva em `localStorage`.
* **🎙 Detector de Intonação 24-TET em Tempo Real & Afinador 6 Ordens:** Escuta o instrumento pelo microfone, captador interno ou interface USB usando o algoritmo **YIN com interpolação parabólica** e filtro de mediana estabilizado para ordens duplas (desde o bordão `C2 / 65,41 Hz`):
  * **🎯 Modo Maqam 24-TET (Padrão):** Valida sua afinação contra os intervalos e desvios microtonais tradicionais (`cents_dev`) do *Maqam* ou *Jins* ativo, exibindo um **ponteiro contínuo no espelho sem trastes** e orientações físicas de dedo (*avançar / recuar* adaptadas a destro/canhoto e orientação horizontal/vertical).
  * **📏 Modo 24-TET Puro:** Grade cromática exata de 24 quartos de tom (`50¢` por degrau) para treino de precisão microtonal.
  * **🪕 Afinador das 6 Ordens:** Reconhece automaticamente a corda solta tocada em qualquer uma das 5 afinações do catálogo (ou trava manualmente em uma ordem específica com botão de tom de referência **`🔊`**).
  * **🔒 100% Local & Baixa Latência:** Nenhum áudio sai do dispositivo; o SVG atualiza apenas a camada leve `#live-pitch-layer` sem redesenhar o braço e libera o hardware de entrada ao fechar a faixa ou ocultar a aba.
* **🎓 Guia de Estudos Progressivo (`Do Zero ao Taqsim`):** 4 módulos e 12 lições bilíngues (`PT` / `EN`) no Deck Horizontal com aplicação em 1 clique (**`▶ Aplicar no Oud`**), atalho direto para checar afinação (Mic/Linha), exemplo sonoro e progresso persistido em `localStorage`.
* **🖐 Posições Anatômicas & Pivôs Interativos:** Cápsulas clicáveis sobre o braço (**`I · 1ª Pos`**, **`II · 2ª Pos`**, **`III · Tampo`**) com pré-visualização no *hover*, alternância para *Espelho Completo*, botão **`▶`** integrado para ouvir a região, pivôs de mudança de mão (**`⇄P2`**, **`⇄P3`**) e pontes de uníssono (**`=1ª`**, **`=2ª`**, **`=3ª`**).

---

## 🔌 Conectando o Oud em Linha (Interface USB)

1. Conecte sua interface de áudio USB *Class-Compliant* ao Mac ou iPhone (via USB-C direto ou adaptador *Lightning–USB Camera*) e plugue seus fones na saída da própria interface para monitoração sem latência.
2. No app, abra **`⋯ → Escuta 24-TET & Afinador`** (ou toque em **`🎙 Mic`** na barra inferior mobile) e mude o perfil para **`🔌 Linha (DI)`**.
3. Escolha a interface no seletor de entrada e isole **`Ch 1`** ou **`Ch 2`** conforme o canal utilizado.
4. Ajuste o ganho do pré da interface observando a barra **`IN` (VU)** para atingir a zona verde/latão (`-18` a `-6 dB`) sem acender **`CLIP`**.
5. Se o seu Oud possuir captador híbrido (*piezo + microfone interno com blend*), priorize o lado do piezo para isolar completamente o sinal ao tocar junto com **Drone** e **Iqa'**.

---

## 🎼 Recursos Principais

### Teoria Modal Árabe & Sistema 24-TET
* **11 Maqamat completos:** *Rast, Bayati, Hijaz, Nahawand, Kurd, Saba, Sikah, Huzam, Nikriz, Nawa Athar* e *Ajam*, com diferenciação entre **Subida (`↑`) e Descida (`↓`)** e desvios microtonais em *cents*.
* **9 Ajnas isolados:** Prática em blocos de 3 a 5 notas (*Rast, Bayati, Hijaz, Nahawand, Kurd, Ajam, Sikah, Saba, Nikriz*).
* **Fraseado Melódico (*Sayr* & *Taqsim*):** 3 etapas por *Maqam* (*1. Istihlal*, *2. Ghammaz*, *3. Qafla*) com setas numeradas (`①→②→③`) desenhadas no braço e sincronizadas com o áudio e a pauta.
* **Radar de Modulação (*Intiqal*):** Sugestões de rotas tradicionais sobre o *Ghammaz* e graus-pivô com prévia sonora, modulação em 1 clique e botão **`↩ Voltar à Origem`**.
* **Modos, Acordes & Cadências (*Qafla*):** 6 modos ocidentais, 7 acordes (incluindo tríade neutra *Rast* com *voicing* de 1 nota por ordem e arpejo) e 6 progressões cadenciais clicáveis.

### Espelho SVG & Pauta Interativa 24-TET
* **5 Afinações tradicionais:** Síria / Árabe Moderna (`C–F–A–d–g–c`), Árabe Clássica (`F–A–d–g–c–f`), Egípcia (`D–G–A–d–g–c`), Turca / Grega (`D–E–A–B–e–a`) e Iraquiana / Mounir Bashir (`F–C–d–g–c–f`).
* **Pauta Interativa 24-TET (Clave de Sol 8vb):** Acidentes microtonais vetoriais (meio-bemol e meio-sustenido) + **Compasso Inspetor** sincronizado bidirecionalmente com o braço.
* **Caminho de 1 Oitava Ancorado:** Dê **duplo clique** (ou `Shift + clique`) em qualquer nota do braço para defini-la como tônica física e traçar o trajeto ergonômico de 1 oitava ascendente ou descendente.
* **Ergonomia e Luthieria:** Cabeçalho enxuto com **Cápsula de Áudio (`▶ Tocar ▾`)** + menu **`⋯`**, Barra Única de Comando (*Popovers* no Desktop / *Bottom Sheets* no Mobile), barra inferior mobile de 4 botões, temas Escuro (*Layl*) e Claro (*Nahar*), modo Horizontal/Vertical, inversão para **Canhotos**, cabeçote (*Banjak*) exibível ou ocultável, guias 12-TET e 1/4 de tom, *Ghost Notes*, 4 inscrições (*Cifra, Grau, Dedos, Nome Árabe*) e 3 escolas visuais (*Damasco, Cairo/Bagdá, Istambul*).

### Áudio, Escuta, Ritmo & Estudo
* **Síntese Física Dual (Sírio & Egípcio):** Dois `ConvolverNode` pré-carregados com IRs modais dedicadas + parâmetros independentes de posição de palhetada, amortecimento e EQ de tampo.
* **Escuta 24-TET, Modo Linha & Afinador 6 Ordens:** Acessível pelo menu **`⋯`**, pelo Popover **`Afinação & Qarar`**, pela barra inferior mobile ou pelos cartões do **Guia de Estudos**, com feedback visual nas joias e nas cravelhas do *banjak*.
* **Motor Rítmico (*Iqa'at*):** *Maqsum, Baladi, Sa'idi, Malfuf, Ayyub* e *Sama'i Thaqil (10/8)* sintetizados em Darbuka & Riq com controle de BPM (50–175) e grade visual de tempos (*DUM / TAK / KAH*).
* **Drone Contínuo:** Pedal em tônica + quinta justa sincronizado automaticamente ao *Qarar*.
* **Glossário (*Al-Mu'jam al-Musiqi*):** Busca instantânea, filtro por categoria e botões contextuais `ⓘ` espalhados pela interface.
* **Compartilhamento & PWA:** Todo o estado da aula/estudo é serializado na URL (`#...`) para compartilhamento imediato. Funciona 100% offline após a primeira visita.

---

## ⌨️ Atalhos & Gestos Rápidos

| Ação | Como ativar |
| :--- | :--- |
| **Ouvir Corda Solta da Ordem** | Clique direto em qualquer uma das **6 cravelhas (*mafatih*)** ou nos cartuchos (quando o *banjak* estiver oculto) |
| **Ligar / Desligar Escuta (Mobile)** | Botão **`🎙 Mic: OFF/ON`** (ou **`🔌 Linha: OFF/ON`**) na barra inferior mobile |
| **Alternar Microfone vs. Interface (DI)** | Na faixa de escuta aberta, clique em **`🎙 Mic`** ou **`🔌 Linha (DI)`**, escolha a interface e o canal (`Auto` / `Ch 1` / `Ch 2`) |
| **Exibir / Ocultar Cabeçote (*Banjak*)** | Popover **`Espelho & Guias`** → **`🪕 Cabeçote (Banjak)`** |
| **Alternar Caráter Sonoro (Sírio / Egípcio)** | Menu **`⋯`** → *Timbre: Sírio (Seco) / Egípcio (Encorpado)* |
| **Abrir Escuta 24-TET / Afinador 6 Ordens** | Menu **`⋯`** → *Escuta 24-TET & Afinador* ou Popover **`Afinação & Qarar`** → *Afinar 6 Ordens* |
| **Definir Tônica + Caminho de 1 Oitava** | Duplo clique (ou `Shift + clique`) em qualquer joia no braço |
| **Isolar / Alternar Posição (`I`, `II`, `III`)** | Clique direto na cápsula da região acima do braço |
| **Ouvir Notas da Posição Ativa** | Clique no botão `▶` acoplado à cápsula ativa |
| **Testar Uníssono / Mudança de Mão** | Clique nas microcápsulas `=1ª`, `=2ª`, `=3ª`, `⇄P2` ou `⇄P3` |
| **Modo Imersivo (*Zen Stage*)** | Tecla `F` (Desktop) ou menu `⋯` |
| **Fechar Popovers / Parar Região / Sair do Zen** | Tecla `Esc` |

---

## 🗂️ Arquitetura do Projeto

```text
app-oud-visualizer/
├── index.html              # Estrutura semântica (Cabeçalho, Barra Única, Faixa de Escuta/Linha, Palco, Deck e Dock Mobile)
├── manifest.json           # Metadados PWA (instalação e ícones)
├── sw.js                   # Service Worker offline (cache v3.1.9)
├── README.md               # Documentação do projeto
├── assets/
│   └── icon-oud.svg        # Ícone vetorial Shamsiyya (paleta Latão & Ameixa)
├── styles/
│   └── main.css            # Design System (temas Layl/Nahar, Modo Linha & VU, cravelhas, Popovers, Bottom Sheets e Deck)
└── js/
    ├── main.js             # Orquestração de estado, eventos, Escuta/Modo Linha, Timbre, Banjak, Deck e Guia de Estudos
    ├── audio/
    │   ├── synthEngine.js  # Síntese física Karplus-Strong Estendida (ordem dupla), IR modal (Sírio/Egípcio), Drone, Iqa' e roteamento iOS/A2DP
    │   └── pitchEngine.js  # Detector YIN 24-TET, Modo Linha (DI), ChannelSplitter (Auto/Ch1/Ch2), filtro anti-piezo, VU/Clip e Afinador 6 Ordens
    ├── core/
    │   ├── database.js     # Base 24-TET (afinações, Maqamat, Ajnas, acordes, Qaflat e Iqa'at)
    │   ├── modalEngine.js  # Cálculo físico do braço, posições, pivôs e caminhos de 1 oitava
    │   ├── studyGuide.js   # Currículo v3.0 (4 módulos, 12 lições bilíngues e presets)
    │   ├── glossary.js     # Glossário Al-Mu'jam al-Musiqi
    │   ├── i18n.js         # Internacionalização PT / EN
    │   └── urlState.js     # Serialização e restauração de estado via hash de URL
    └── ui/
        ├── neckRenderer.js # Renderizador SVG do Banjak/cravelhas, espelho, rosetas, regiões, pivôs e #live-pitch-layer
        └── staffRenderer.js# Pauta interativa 24-TET e Compasso Inspetor em SVG
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

* **v3.1.9:** Novo **Modo Linha / Interface de Áudio USB (DI)** na faixa de escuta: chave `🎙 Mic` / `🔌 Linha (DI)`, seletor de dispositivo USB (`enumerateDevices` + `devicechange`), isolamento de canal (`Auto` / `Ch 1` / `Ch 2`) via `ChannelSplitterNode`, filtro *sidechain* anti-piezo (`HPF 55 Hz` + `LPF 1.350 Hz`), ajuste de sensibilidade (*Noise Gate*), medidor VU em `dBFS` com alerta **`CLIP`** e leitura contínua sobre *Drone* e *Iqa'* com persistência em `localStorage`.
* **v3.1.8:** Reorganização da barra inferior mobile para 4 botões essenciais: **`▶ Tocar` · `🎶 Taqsim` · `🎙 Mic: OFF/ON` · `📖 Estudo`**.
* **v3.1.7:** Remoção do elemento HTML5 `audio` em loop, limpeza da `MediaSession` e suspensão inteligente em segundo plano, eliminando a exibição de player de mídia na tela de bloqueio do iOS.
* **v3.1.6:** Suporte estável a **AirPods e fones Bluetooth (A2DP)** no iOS com barramento estéreo explícito, `latencyHint: "playback"`, recuperação em `devicechange` e *watchdog* contra relógio congelado no WebKit.
* **v3.1.5:** Correção da captura de microfone no Chrome/WebKit do iPhone com alternância para sessão `"play-and-record"`, `AudioContext` síncrono no gesto do usuário, *fallback* de *constraints* e grafo ativo via `GainNode(0)`.
* **v3.1.4:** Redesenho artesanal do cabeçote (**Banjak**) com coroa em arco *Mihrab*, filetes de madrepérola, pinos escalonados com bobinas metálicas e **6 cravelhas esculpidas (*Mafatih*)** com botões de corda solta integrados às cabeças, destaque vivo no modo Afinador 6 Ordens e botão para exibir/ocultar o cabeçote (`Espelho & Guias`).
* **v3.1.3:** Correção de contraste dos rótulos de ordem sobre o cabeçote no tema claro (*Nahar*).
* **v3.1.2:** Novo motor físico de Oud (**Karplus-Strong Estendido** de ordem dupla com atraso fracionário *Allpass* e transiente de *risha*), **IR modal de caixa acústica** em `ConvolverNode` e seletor de caráter sonoro **Sírio (Seco)** vs. **Egípcio (Encorpado)** no menu `⋯` com persistência em `localStorage`.
* **v3.1.0:** Detector de Intonação **24-TET em tempo real** pelo microfone/interface (algoritmo YIN com `cents_dev` do *Maqam* ativo), camada vetorial leve `#live-pitch-layer` com ponteiro contínuo no braço sem trastes e **Afinador das 6 Ordens** integrado.
* **v3.0.0:** Novo **Guia de Estudos Progressivo** (4 módulos / 12 lições com *presets* em 1 clique e persistência de progresso).
* **v2.9.2:** Desbloqueio de áudio em modo *Playback* para Chrome no iOS (`WKWebView`).
* **v2.9.0:** Cápsulas de posição (`I`, `II`, `III`) interativas com *hover*, *toggle*, botão `▶` de audição da região e pivôs clicáveis (`⇄P2`, `⇄P3`, `=nª`).
* **v2.8.2:** Cabeçalho ultralimpo com Cápsula de Áudio (`▶ Tocar ▾`) + menu unificado `⋯`.
* **v2.8.1:** Palco em largura total (100%) com Deck Horizontal por abas abaixo do espelho.
* **v2.8.0:** Barra Única de Comando com *Popovers* / *Bottom Sheets* e contenção cromática em latão e ameixa.
* **v2.7.0:** Suporte completo a PWA offline, Pauta Interativa 24-TET, Radar de Modulação e Modo Imersivo (*Zen*).
