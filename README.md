# App Oud Visualizer — v3.21.0 Studio & PWA

Estúdio interativo 24-TET para Oud com guia de estudos progressivo (17 capítulos, 51 lições, 51 dossiês bilíngues, estudos técnicos procedurais e tutor ativo), detector de intonação em tempo real (microfone e modo linha DI), afinador de 6 ordens, diapasão A4 configurável (415–446 Hz), estabilizador de graves e modo estroboscópico (±4¢).

Acesso online (GitHub Pages): https://thiago-rss.github.io/app-oud-visualizer/

## Principais Recursos (v3.21.0)

### 1. Guia de Estudos, Dossiês, Estudos Técnicos e Tutor Ativo (PT / EN)
- Trilha com 5 filtros rápidos (Todos, Base, Intermediário, Avançado, Mestre e Mundo & Fusão) e progresso salvo em localStorage:
  1. Base (Cap. 1–2 · Lições 1–6): cordas soltas, 1ª posição, Maqam Ajam, Nahawand/Kurd, blocos Ajnas e primeiros quartos de tom (Jins Rast e Jins Bayati).
  2. Intermediário (Cap. 3–4 · Lições 7–12): fraseado (Sayr) em Rast, salto b2–3 em Hijaz, Qafla sobre Iqa' Maqsum, pontes de uníssono (=1ª..3ª), mudanças de posição (II e III) e modulação pelo Ghammaz.
  3. Avançado (Cap. 5–8 · Lições 13–24): bariolage, Zahfa em Sikah, escolas Síria vs. Egípcia, modos compostos (Saba, Huzam + Sama'i Thaqil 10/8, Nawa Athar + Malfuf), harmonia modal, 3ª posição no tampo (Jawab), Maqam Nikriz e transposição (Taswir) sobre Iqa' Ayyub.
  4. Mestre (Cap. 9–10 · Lições 25–30): escolas históricas (Cairo/Egípcia, Istambul/Turca, Bagdá/Mounir Bashir), arquitetura do Taqsim em 4 atos, modulação encadeada e recital final em Modo Imersivo (Zen Stage).
  5. Mundo & Fusão (Cap. 11–17 · Lições 31–51): modos ocidentais e folk, blues e blue notes microtonais (3- e 7-), Mediterrâneo/Andaluzia/Flamenco/Rebetiko, jazz modal e Oud Trio, música brasileira (Nordestino Lídio b7 / Baião, Choro e Bossa Nova), música antiga e integração estilística multiestilo.
- Presets de 1 clique (js/core/studyResolver.js) configurando afinação, tradição visual, modalidade, Qarar, posição, rótulos, guias, pauta, ritmo Iqa' e timbre.
- Dossiês teóricos bilíngues (js/core/studyDossiers.js) com análise modal, nuances de intonação, armadilhas comuns e escuta guiada.
- Estudos técnicos procedurais (js/core/technicalEtudes.js) com padrões por lição, setas de Risha (↓/↑), controle de velocidade e modo Loop.
- Tutor Ativo (js/ui/studyCoachView.js) com 3 estágios de domínio (Iniciado, Em Prática, Dominado), comparação auditiva A/B, checkpoints ao vivo via YIN, rotina de aquecimento de 10 minutos e caderno de anotações por lição.

### 2. Detector de Intonação, Modo Linha (DI), Afinador 6 Ordens, PitchStabilizer e Estrobo
- Modos em tempo real (js/audio/pitchEngine.js): Maqam 24-TET, 24-TET Puro e Afinador 6 Ordens.
- PitchStabilizer (js/core/pitchStabilizer.js): mediana adaptativa em bordões graves (< 115 Hz), snap em saltos > 70¢, histerese de troca de alvo, modo estroboscópico (±4¢) e rastro das últimas 5 notas.
- Diapasão global A4 (415–446 Hz) com presets rápidos (415, 432, 440, 442 Hz) e ajuste fino recalculando síntese, drone e detecção.
- Modo Linha (DI) para interface de áudio USB com seleção de dispositivo, roteamento de canal (Auto, Ch 1, Ch 2), filtro anti-piezo, noise gate e medidor VU em dBFS com alerta de CLIP.

### 3. Modelagem Física do Oud, Ritmos (Iqa'at) e Melógrafo / Raio-X
- Síntese física (js/audio/synthEngine.js) baseada em Karplus-Strong estendido com atraso fracionário allpass, transiente de Risha e convolução de caixa acústica, com perfis Sírio (seco/articulado) e Egípcio (encorpado/ressonante).
- Motor rítmico de Iqa'at com controle de BPM (50–175), grade visual de tempos e drone contínuo na tônica (Qarar).
- Melógrafo e Raio-X de Taqsim (js/ui/melographView.js): curva contínua de desvio em cents, mapa de calor por pitch class 24-TET e métricas de precisão.

### 4. Clareza do Braço, Hierarquia em 3 Camadas, Braço Vivo, Pranchas e Treinador Auditivo
- 4 modos de clareza (js/core/neckClarity.js): Livre (espelho cromático 24-TET clicável sem viés de Maqam), Posição (janela anatômica com pontos-fantasma fora da posição), 1ª Oitava (0–12q) e Espelho Todo (0–24q).
- Hierarquia em 3 camadas (js/ui/neckRenderer.js) e Braço Vivo (js/ui/liveNeckFx.js): tônica sólida, Ghammaz/microtons destacados, demais graus em anel, escala adaptativa no Jawab, ripple ao tocar, ressonância de oitavas no hover e barra inspetora no rodapé.
- Exportação de pranchas PNG (2x Retina) e SVG (js/core/plateExporter.js), snapshots de sessão e backup/importação JSON unificado (js/core/sessionSnapshots.js) + afinações customizadas salvas de 6 ordens (js/core/customTunings.js).
- Treinador Auditivo 24-TET (js/ui/earTrainerView.js) para terças (b3, 3-, 3), microtons e assinatura de Ajnas.

### 5. Paleta de Comandos, Guardião Mobile e PWA Offline
- Paleta de comandos (Cmd+K / Ctrl+K / /), modal de atalhos (?) e mini-dock flutuante de áudio com parada geral (Esc) em js/ui/commandPaletteView.js.
- Guardião mobile (js/core/mobileAudioGuard.js) com Screen Wake Lock, recuperação ao voltar da visibilidade/bloqueio e botão de reativação rápida de áudio.
- Service Worker (sw.js) com cache versionado (oud-visualizer-v3.21.0) e script de validação pré-commit (scripts/check.mjs).


## Novidades da v3.21.0 (Studio & PWA)
- **Prática Deliberada no Instrumento (`studyCoachView.js`, `studyGuideView.js`):** trava de afinação física no Guia (`🔒 Afinação Travada`), modo *Call & Response* em 3 velocidades (`0.65×`, `0.85×`, `1.0×`) com avaliação YIN ao vivo e Checkpoints YIN com precisão média em *cents*.
- **Retenção & Fluxo de Aula (`spacedReview.js`, `urlState.js`, `stringAtlasBridge.js`):** fila de Revisão Espaçada (`↻ Revisar`) baseada no histórico prático, Link Direto de Lição (`#les=...`) e 4 Perfis de Estúdio (*Afinação & Luthieria*, *Improviso / Taqsim*, *Ritmo & Ouvido*, *Palco / Zen*).
- **Engenharia & Observabilidade (`diagnostics.js`, `synthEngine.js`, `main.js`, `scripts/check.mjs`):** coalescência `requestAnimationFrame` com `FrameBudgetTracker`, Painel de Diagnóstico Local (`🩺` / `⌘K`) e suíte unitária core + auditoria das 51 lições e dossiês.
- **Acabamento, `a11y` & PWA (`onboardingView.js`, `toastView.js`, `sw.js`):** anéis `:focus-visible`, suporte a `prefers-reduced-motion` e teclado, Tour Rápido de 3 Passos e atualização controlada do Service Worker (`oud-visualizer-v3.21.0`) via toast interativo.

## Execução Local e Validação

```bash
node scripts/check.mjs
python3 -m http.server 8000
