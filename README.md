# 🪕 App Oud Visualizer — v2.7 Studio & PWA

**Método Interativo 24-TET, Partitura Sincronizada, Traçador de Oitava Ancorado, Radar de Modulação (*Intiqal*), Motor Rítmico (*Iqa'at*) e Luthieria Árabe.**

🔗 **Acesso Online (GitHub Pages):** [thiago-rss.github.io/app-oud-visualizer/](https://thiago-rss.github.io/app-oud-visualizer/)

---

## ✨ Principais Recursos (v2.7)

* **Sistema Microtonal 24-TET & Luthieria Comparada:**
  * Suporte às escolas de **Damasco** (*Nogueira & Sadaf*), **Cairo / Bagdá** (*Cedro & Raqma*) e **Istambul** (*Abeto & Ébano*), respeitando desvios tradicionais em *cents*.
  * 5 afinações históricas pré-configuradas (*Síria C–F–A–d–g–c*, *Árabe Clássica F–f*, *Egípcia D–c*, *Turca/Grega D–a* e *Iraquiana / Mounir Bashir*), suporte a **Destro e Canhoto** e orientações **Horizontal** e **Vertical**.
* **Partitura Interativa 24-TET (Clave de Sol 8vb):**
  * Notação microtonal com acidentes de meio-bemol (`𝄳`), exibição de escalas, acordes ou frases de *Taqsim* (*Sayr*), *Compasso Inspetor* em tempo real e botão retrátil (**`— Ocultar Pauta`**).
* **Definir Tônica & Traçador de Caminho de 1 Oitava (`Anchored Octave Path`):**
  * Selecione qualquer joia no braço ou na pauta e clique em **`🎯 Definir Tônica`** (ou dê duplo clique) para transpor instantaneamente toda a modalidade e traçar o caminho ergonômico numerado (`1 → 8`) em **1 oitava Ascendente (`+8ª`) ou Descendente (`-8ª`)** com áudio sincronizado.
* **Radar de Modulação & Ajnas Vizinhos (`Intiqal / Tahwil`):**
  * Mapeia rotas tradicionais de transição modal sobre o *Ghammaz* e graus-pivô com audição prévia (**`🔊 Ouvir`**), modulação em 1 clique (**`⚡ Modular`**) e retorno imediato à tônica de origem (**`↩ Voltar à Origem`**).
* **Temas *Layl* (Modo Escuro) & *Nahar* (Modo Claro — Pergaminho Iluminado):**
  * Alternância estética inspirada nos tratados musicais clássicos, adaptando cartões, partitura e rótulos externos.
* **Compartimentalização Desktop (*Zen Stage*) & Ergonomia Mobile (*PWA Offline*):**
  * **Desktop:** Modo Imersivo (**`🪷 Modo Imersivo` / tecla `F`**) com HUD flutuante, painel lateral teórico retrátil e cartões sanfonados no *Diwan*.
  * **Mobile (`<= 768px`):** Braço vertical nativo (*Auto-Portrait*), 4 pílulas compactas acionando gavetas inferiores (*Bottom Sheets*), barra de transporte inferior fixa (*Thumb-Zone Dock*) e lupa flutuante de precisão microtonal (*Touch Loupe*).
  * **PWA Instalável 100% Offline:** Manifesto Web e *Service Worker* (`sw.js`) para instalação direta em iOS, Android e Desktop sem depender de conexão com a internet.

---

## 🗂️ Arquitetura do Projeto

```text
app-oud-visualizer/
├── index.html                 # Estrutura semântica e metadados PWA
├── manifest.json              # Manifesto de instalação Standalone (PWA)
├── sw.js                      # Service Worker para cache e uso 100% offline
├── README.md                  # Documentação do projeto
├── assets/
│   └── icon-oud.svg           # Ícone vetorial geométrico (Shamsiyya & Octagrama)
├── styles/
│   └── main.css               # Design System responsivo (Layl/Nahar, Zen Stage & Mobile)
└── js/
    ├── main.js                # Controlador de estado, eventos, HUD e orquestração
    ├── core/
    │   ├── database.js        # Banco de dados 24-TET: Maqamat, Ajnas, Modos, Acordes, Qaflat e Iqa'at
    │   ├── modalEngine.js     # Motor intervalar, digitação ergonômica e traçador de 1 oitava
    │   ├── urlState.js        # Serialização de estado na URL (#hash) e persistência local
    │   ├── glossary.js        # Glossário bilíngue de teoria modal e luthieria (Al-Mu'jam)
    │   └── i18n.js            # Internacionalização completa Português / Inglês
    ├── audio/
    │   └── synthEngine.js     # Síntese Web Audio API: Oud duplo, Drone contínuo e Darbuka/Riq
    └── ui/
        ├── neckRenderer.js    # Renderizador SVG paramétrico do braço do Oud e trilhas Sayr
        └── staffRenderer.js   # Renderizador SVG da pauta 24-TET 8vb e Compasso Inspetor
