# 🪕 App Oud Visualizer — v3.1 Studio & PWA

**Método interativo 24-TET para Oud (Alaúde Árabe)** desenvolvido em HTML5, CSS3 modular, JavaScript (ESM) e SVG — sem dependências externas, instalável como PWA e pronto para uso offline em Desktop e Mobile.

🔗 **Acesso Online:** [https://thiago-rss.github.io/app-oud-visualizer/](https://thiago-rss.github.io/app-oud-visualizer/)

---

## ✨ Destaques da Versão 3.1

* **🎙 Detector de Intonação 24-TET em Tempo Real:** Escuta o instrumento físico pelo microfone, captador interno ou interface de áudio usando o algoritmo **YIN com interpolação parabólica** e filtro de mediana estabilizado para ordens duplas (desde o bordão `C2 / 65,41 Hz`).
  * **🎯 Modo Maqam 24-TET (Padrão):** Valida sua afinação diretamente contra os intervalos e desvios microtonais tradicionais (`cents_dev`) do *Maqam* ou *Jins* ativo, exibindo um **ponteiro contínuo no espelho sem trastes** e orientações físicas de dedo (*avançar / recuar* adaptadas a destro/canhoto e orientação horizontal/vertical).
  * **📏 Modo 24-TET Puro:** Grade cromática exata de 24 quartos de tom (`50¢` por degrau) para treino de precisão microtonal.
  * **🪕 Afinador das 6 Ordens:** Reconhece automaticamente a corda solta tocada em qualquer uma das 5 afinações do catálogo (ou trava manualmente em uma ordem específica com botão de tom de referência **`🔊`**).
  * **🔒 100% Local & Baixa Latência:** Nenhum áudio sai do dispositivo; o SVG atualiza apenas a camada leve `#live-pitch-layer` sem redesenhar o braço e libera o microfone automaticamente ao trocar de aba ou fechar a faixa.
* **🎓 Guia de Estudos Progressivo (`Do Zero ao Taqsim`):** 4 módulos e 12 lições bilíngues (`PT` / `EN`) no Deck Horizontal com aplicação em 1 clique (**`▶ Aplicar no Oud`**), atalho direto para checar afinação pelo microfone, exemplo sonoro e progresso persistido em `localStorage`.
* **🖐 Posições Anatômicas & Pivôs Interativos:** Cápsulas clicáveis sobre o braço (**`I · 1ª Pos`**, **`II · 2ª Pos`**, **`III · Tampo`**) com pré-visualização no *hover*, alternância para *Espelho Completo*, botão **`▶`** integrado para ouvir a região, pivôs de mudança de mão (**`⇄P2`**, **`⇄P3`**) e pontes de uníssono (**`=1ª`**, **`=2ª`**, **`=3ª`**).
* **🔊 Motor Web Audio compatível com iOS / Chrome:** Síntese de corda dedilhada de ordem dupla, *Drone* contínuo e percussão *Iqa'* com desbloqueio automático no `WKWebView` (contornando a chave física de silencioso do iPhone).

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
* **Ergonomia e Luthieria:** Cabeçalho enxuto com **Cápsula de Áudio (`▶ Tocar ▾`)** + menu **`⋯`**, Barra Única de Comando (*Popovers* no Desktop / *Bottom Sheets* no Mobile), temas Escuro (*Layl*) e Claro (*Nahar*), modo Horizontal/Vertical, inversão para **Canhotos**, guias 12-TET e 1/4 de tom, *Ghost Notes*, 4 inscrições (*Cifra, Grau, Dedos, Nome Árabe*) e 3 escolas visuais (*Damasco, Cairo/Bagdá, Istambul*).

### Áudio, Escuta, Ritmo & Estudo
* **Escuta 24-TET & Afinador 6 Ordens:** Acessível pelo menu **`⋯`**, pelo Popover **`Afinação & Qarar`** ou diretamente nos cartões do **Guia de Estudos**, com suspensão automática de eco quando você dispara notas de referência no app.
* **Motor Rítmico (*Iqa'at*):** *Maqsum, Baladi, Sa'idi, Malfuf, Ayyub* e *Sama'i Thaqil (10/8)* sintetizados em Darbuka & Riq com controle de BPM (50–175) e grade visual de tempos (*DUM / TAK / KAH*).
* **Drone Contínuo:** Pedal em tônica + quinta justa sincronizado automaticamente ao *Qarar*.
* **Glossário (*Al-Mu'jam al-Musiqi*):** Busca instantânea, filtro por categoria e botões contextuais `ⓘ` espalhados pela interface.
* **Compartilhamento & PWA:** Todo o estado da aula/estudo é serializado na URL (`#...`) para compartilhamento imediato. Funciona 100% offline após a primeira visita.

---

## ⌨️ Atalhos & Gestos Rápidos

| Ação | Como ativar |
| :--- | :--- |
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
├── index.html              # Estrutura semântica (Cabeçalho, Barra Única, Faixa de Escuta, Palco e Deck)
├── manifest.json           # Metadados PWA (instalação e ícones)
├── sw.js                   # Service Worker offline (cache v3.1.0)
├── README.md               # Documentação do projeto
├── assets/
│   └── icon-oud.svg        # Ícone vetorial Shamsiyya (paleta Latão & Ameixa)
├── styles/
│   └── main.css            # Design System (temas Layl/Nahar, Escuta 24-TET, Popovers, Bottom Sheets e Deck)
└── js/
    ├── main.js             # Orquestração de estado, eventos, Escuta/Afinador, Deck e Guia de Estudos
    ├── audio/
    │   ├── synthEngine.js  # Síntese Web Audio (Oud, Drone, Iqa'at e desbloqueio iOS)
    │   └── pitchEngine.js  # Detector YIN 24-TET em tempo real, filtro de mediana e Afinador 6 Ordens
    ├── core/
    │   ├── database.js     # Base 24-TET (afinações, Maqamat, Ajnas, acordes, Qaflat e Iqa'at)
    │   ├── modalEngine.js  # Cálculo físico do braço, posições, pivôs e caminhos de 1 oitava
    │   ├── studyGuide.js   # Currículo v3.0 (4 módulos, 12 lições bilíngues e presets)
    │   ├── glossary.js     # Glossário Al-Mu'jam al-Musiqi
    │   ├── i18n.js         # Internacionalização PT / EN
    │   └── urlState.js     # Serialização e restauração de estado via hash de URL
    └── ui/
        ├── neckRenderer.js # Renderizador SVG do espelho, rosetas, regiões, pivôs e camada #live-pitch-layer
        └── staffRenderer.js# Pauta interativa 24-TET e Compasso Inspetor em SVG
