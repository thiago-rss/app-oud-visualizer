# 🪕 App Oud Visualizer — v3.1.4 Studio & PWA

**Método interativo 24-TET para Oud (Alaúde Árabe)** desenvolvido em HTML5, CSS3 modular, JavaScript (ESM) e SVG — sem dependências externas, instalável como PWA e pronto para uso offline em Desktop e Mobile.

🔗 **Acesso Online:** [https://thiago-rss.github.io/app-oud-visualizer/](https://thiago-rss.github.io/app-oud-visualizer/)

---

## ✨ Destaques da Versão 3.1.4

* **🪕 Cabeçote Artesanal (*Banjak*) & 6 Cravelhas Interativas (*Mafatih*):** Redesenho completo da região das cravelhas em SVG em diálogo com as rosetas *Shamsiyya*, a *raqma* e os filetes de madrepérola (*sadaf*):
  * **Arquitetura em Camadas & Coroa *Mihrab*:** Laterais em madeira com gradiente e filete contínuo de madrepérola, câmara interna rebaixada com sombra atrás da pestana (*Anf*), pinos alternados, enrolamento helicoidal das cordas e ponta esculpida com medalhão incrustado — adaptada às **3 escolas de luthieria** (*Damasco, Cairo/Bagdá e Istambul*).
  * **Botões Integrados às Cabeças das Cravelhas:** As 6 cravelhas (*3 por lado*) trazem o rótulo da ordem (`6ª C` … `1ª c`) sempre reto e legível embutido na própria cabeça torneada; clique em qualquer cravelha para soar a corda solta (com suspensão automática de eco no microfone).
  * **Integração Viva com o Afinador 6 Ordens:** Durante a afinação pelo microfone, o contorno elíptico da cravelha correspondente acende na camada `#live-pitch-layer` junto à seta de ajuste (`↑` apertar / `↓` afrouxar / `✓` afinada).
  * **Opção de Ocultar o Cabeçote (`Espelho & Guias` → `🪕 Cabeçote`):** Preferência salva em `localStorage`; ao ocultar o *banjak*, os 6 cartuchos clicáveis das ordens retornam automaticamente para junto da faixa `SOLTA (0)` com contraste adaptado aos temas claro e escuro.
* **🎻 Motor Físico de Oud (Karplus-Strong Estendido + IR de Caixa Acústica):** Síntese física 100% procedural (0 KB de samples externos) modelada para a acústica real do instrumento:
  * **Ordem Dupla & Afinação Sub-Cent:** Simula o par de cordas com ataque escalonado (~2–3 ms, reproduzindo a passagem da *risha* pelo par), desafinação simétrica (preservando o centro exato de frequência 24-TET + `cents_dev`) e atraso fracionário *Allpass* (precisão abaixo de `0,1 cent`).
  * **Palhetada & Caixa Convoluída (`ConvolverNode`):** Combina filtro pente de posição da palheta, micro-queda de tensão no ataque, golpe orgânico de *risha* de celuloide e *Impulse Response* (IR) modal de 15 modos acústicos (rosetas *Helmholtz*, tampo de abeto e bojo).
  * **Seletor de Caráter Sonoro (`⋯` → `🪕 Timbre`):** Alternância instantânea entre **Sírio (Seco)** — palhetada próxima ao cavalete, caixa de `155 ms` e médios anasalados (`560–1.420 Hz`) — e **Egípcio (Encorpado)** — palhetada mais perto da roseta, bojo cheio de `195 ms` e graves redondos (`100–420 Hz`), com nota de prévia na tônica ativa e preferência salva em `localStorage`.
  * **Compatibilidade iOS / Chrome (`WKWebView`):** Desbloqueio automático em modo *Playback*, contornando a chave física de silencioso do iPhone para notas, *Drone*, *Taqsim* e *Iqa'*.
* **🎙 Detector de Intonação 24-TET em Tempo Real & Afinador 6 Ordens:** Escuta o instrumento físico pelo microfone, captador interno ou interface de áudio usando o algoritmo **YIN com interpolação parabólica** e filtro de mediana estabilizado para ordens duplas (desde o bordão `C2 / 65,41 Hz`):
  * **🎯 Modo Maqam 24-TET (Padrão):** Valida sua afinação contra os intervalos e desvios microtonais tradicionais (`cents_dev`) do *Maqam* ou *Jins* ativo, exibindo um **ponteiro contínuo no espelho sem trastes** e orientações físicas de dedo (*avançar / recuar* adaptadas a destro/canhoto e orientação horizontal/vertical).
  * **📏 Modo 24-TET Puro:** Grade cromática exata de 24 quartos de tom (`50¢` por degrau) para treino de precisão microtonal.
  * **🪕 Afinador das 6 Ordens:** Reconhece automaticamente a corda solta tocada em qualquer uma das 5 afinações do catálogo (ou trava manualmente em uma ordem específica com botão de tom de referência **`🔊`**).
  * **🔒 100% Local & Baixa Latência:** Nenhum áudio sai do dispositivo; o SVG atualiza apenas a camada leve `#live-pitch-layer` sem redesenhar o braço, pausa a detecção brevemente quando o app emite som (evitando eco) e libera o microfone ao fechar a faixa ou trocar de aba.
* **🎓 Guia de Estudos Progressivo (`Do Zero ao Taqsim`):** 4 módulos e 12 lições bilíngues (`PT` / `EN`) no Deck Horizontal com aplicação em 1 clique (**`▶ Aplicar no Oud`**), atalho direto para checar afinação pelo microfone, exemplo sonoro e progresso persistido em `localStorage`.
* **🖐 Posições Anatômicas & Pivôs Interativos:** Cápsulas clicáveis sobre o braço (**`I · 1ª Pos`**, **`II · 2ª Pos`**, **`III · Tampo`**) com pré-visualização no *hover*, alternância para *Espelho Completo*, botão **`▶`** integrado para ouvir a região, pivôs de mudança de mão (**`⇄P2`**, **`⇄P3`**) e pontes de uníssono (**`=1ª`**, **`=2ª`**, **`=3ª`**).

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
* **Ergonomia e Luthieria:** Cabeçalho enxuto com **Cápsula de Áudio (`▶ Tocar ▾`)** + menu **`⋯`**, Barra Única de Comando (*Popovers* no Desktop / *Bottom Sheets* no Mobile), temas Escuro (*Layl*) e Claro (*Nahar*), modo Horizontal/Vertical, inversão para **Canhotos**, cabeçote (*Banjak*) exibível ou ocultável, guias 12-TET e 1/4 de tom, *Ghost Notes*, 4 inscrições (*Cifra, Grau, Dedos, Nome Árabe*) e 3 escolas visuais (*Damasco, Cairo/Bagdá, Istambul*).

### Áudio, Escuta, Ritmo & Estudo
* **Síntese Física Dual (Sírio & Egípcio):** Dois `ConvolverNode` pré-carregados com IRs modais dedicadas + parâmetros independentes de posição de palhetada, amortecimento e EQ de tampo.
* **Escuta 24-TET & Afinador 6 Ordens:** Acessível pelo menu **`⋯`**, pelo Popover **`Afinação & Qarar`** ou diretamente nos cartões do **Guia de Estudos**, com feedback visual nas joias e nas cravelhas do *banjak*.
* **Motor Rítmico (*Iqa'at*):** *Maqsum, Baladi, Sa'idi, Malfuf, Ayyub* e *Sama'i Thaqil (10/8)* sintetizados em Darbuka & Riq com controle de BPM (50–175) e grade visual de tempos (*DUM / TAK / KAH*).
* **Drone Contínuo:** Pedal em tônica + quinta justa sincronizado automaticamente ao *Qarar*.
* **Glossário (*Al-Mu'jam al-Musiqi*):** Busca instantânea, filtro por categoria e botões contextuais `ⓘ` espalhados pela interface.
* **Compartilhamento & PWA:** Todo o estado da aula/estudo é serializado na URL (`#...`) para compartilhamento imediato. Funciona 100% offline após a primeira visita.

---

## ⌨️ Atalhos & Gestos Rápidos

| Ação | Como ativar |
| :--- | :--- |
| **Ouvir Corda Solta da Ordem** | Clique direto em qualquer uma das **6 cravelhas (*mafatih*)** ou nos cartuchos (quando o *banjak* estiver oculto) |
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
├── index.html              # Estrutura semântica (Cabeçalho, Barra Única, Faixa de Escuta, Palco e Deck)
├── manifest.json           # Metadados PWA (instalação e ícones)
├── sw.js                   # Service Worker offline (cache v3.1.4)
├── README.md               # Documentação do projeto
├── assets/
│   └── icon-oud.svg        # Ícone vetorial Shamsiyya (paleta Latão & Ameixa)
├── styles/
│   └── main.css            # Design System (temas Layl/Nahar, Escuta 24-TET, cravelhas, Popovers, Bottom Sheets e Deck)
└── js/
    ├── main.js             # Orquestração de estado, eventos, Escuta/Afinador, Timbre, Banjak, Deck e Guia de Estudos
    ├── audio/
    │   ├── synthEngine.js  # Síntese física Karplus-Strong Estendida (ordem dupla), IR modal (Sírio/Egípcio), Drone, Iqa' e iOS Playback
    │   └── pitchEngine.js  # Detector YIN 24-TET em tempo real, filtro de mediana e Afinador 6 Ordens
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

Como o projeto utiliza módulos ES (`type="module"`) e captura de microfone (que exige contexto seguro), execute-o através de um servidor HTTP em `localhost` (o Service Worker é ignorado automaticamente em `localhost`):

```bash
# Python 3
python3 -m http.server 8000
```

Acesse **`http://localhost:8000`** no navegador (ou utilize a extensão *Live Server* no VS Code).

---

## 📌 Histórico de Versões

* **v3.1.4:** Redesenho artesanal do cabeçote (**Banjak**) com coroa em arco *Mihrab*, filetes de madrepérola, pinos escalonados com bobinas metálicas e **6 cravelhas esculpidas (*Mafatih*)** com botões de corda solta integrados às cabeças, destaque vivo no modo Afinador 6 Ordens e botão para exibir/ocultar o cabeçote (`Espelho & Guias`).
* **v3.1.3:** Correção de contraste dos rótulos de ordem sobre o cabeçote no tema claro (*Nahar*).
* **v3.1.2:** Novo motor físico de Oud (**Karplus-Strong Estendido** de ordem dupla com atraso fracionário *Allpass* e transiente de *risha*), **IR modal de caixa acústica** em `ConvolverNode` e seletor de caráter sonoro **Sírio (Seco)** vs. **Egípcio (Encorpado)** no menu `⋯` com persistência em `localStorage`.
* **v3.1.0:** Detector de Intonação **24-TET em tempo real** pelo microfone/interface (algoritmo YIN com `cents_dev` do *Maqam* ativo), camada vetorial leve `#live-pitch-layer` com ponteiro contínuo no braço sem trastes e **Afinador das 6 Ordens** integrado.
* **v3.0.0:** Novo **Guia de Estudos Progressivo** (4 módulos / 12 lições com *presets* em 1 clique e persistência de progresso).
* **v2.9.2:** Desbloqueio de áudio em modo *Playback* para Chrome no iOS (`WKWebView`), contornando a chave física de silencioso.
* **v2.9.0:** Cápsulas de posição (`I`, `II`, `III`) interativas com *hover*, *toggle*, botão `▶` de audição da região e pivôs clicáveis (`⇄P2`, `⇄P3`, `=nª`).
* **v2.8.2:** Cabeçalho ultralimpo com Cápsula de Áudio (`▶ Tocar ▾`) + menu unificado `⋯`.
* **v2.8.1:** Palco em largura total (100%) com Deck Horizontal por abas abaixo do espelho.
* **v2.8.0:** Barra Única de Comando com *Popovers* / *Bottom Sheets* e contenção cromática em latão e ameixa (remoção total de ciano).
* **v2.7.0:** Suporte completo a PWA offline, Pauta Interativa 24-TET, Radar de Modulação e Modo Imersivo (*Zen*).
