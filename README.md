# 🪕 App Oud Visualizer — 24-TET Fretless Engine, Chords & Modal Cadences

![Version](https://img.shields.io/badge/version-1.2.0-amber.svg)
![Architecture](https://img.shields.io/badge/tuning_engine-24--TET_%2B_Cents-purple.svg)
![Harmony](https://img.shields.io/badge/harmony-Modal_Chords_%26_Qafla_Sequencer-emerald.svg)
![Tech](https://img.shields.io/badge/stack-Vanilla_JS_%7C_SVG_%7C_Web_Audio_API-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

O **App Oud Visualizer** é uma aplicação web interativa e sem dependências externas projetada para o estudo avançado, mapeamento mecânico, harmonia modal e visualização no espelho (braço sem trastes) do **Oud** (alaúde árabe/sírio, turco e iraquiano).

O sistema combina geometria logarítmica de precisão em **24 divisões por oitava (24-TET)** com síntese sonora microtonal em tempo real (**Web Audio API** com compensação em *cents*), permitindo visualizar e ouvir **Maqamat**, **Ajnas** (tricordes, tetracordes e pentacordes), **Modos Gregos**, **Escalas Simétricas**, **Dicionário de Acordes Ergonômicos** e **Cadências Modais (*Qafla*)** em diferentes afinações e posições da mão esquerda.

🔗 **[Acessar Demonstração Online (GitHub Pages)](https://SEU-USUARIO.github.io/app-oud-visualizer/)**

---

## ✨ Principais Funcionalidades (v1.2.0)

* **Geometria Fretless Realista (SVG):** Cálculo exato da posição física de semitons e quartos de tom na mensura da corda seguindo a progressão logarítmica acústica $d(q) = L \cdot (1 - 2^{-q/24})$.
* **Diferenciação Visual Dupla (Cor + Forma):** Identificação imediata entre notas temperadas fixas (**círculos**) e notas microtonais de quarto de tom (**losangos/diamantes**), garantindo leitura rápida durante o estudo e improviso (*Taqsim*).
* **Dicionário de Acordes para Oud (Voicings & Arpejos):** 18 estruturas harmônicas divididas entre **Acordes Modais/Microtonais** (Rast com 3ª neutra, Bayati Cluster, Hijaz, Saba, Sikah, Quartal, Sus2/Sus4 e Power Chords de bordão), **Tríades** e **Tétrades 12-TET**, com cálculo automático de *voicing* ergonômico (1 nota tocável por corda e indicação `✕` para cordas abafadas).
* **Sequenciador de Cadências Modais (*Qafla*):** 10 progressões harmônico-modais completas para finalizar os principais *Maqamat*, com transposição automática em 24-TET, visualização passo a passo no espelho e execução sequencial com rasgueado de *risha*.
* **Múltiplas Afinações com Recálculo Automático:** Suporte nativo às afinações Síria/Árabe (`C-F-A-d-g-c`), Árabe Clássica (`F-A-d-g-c-f`), Egípcia (`D-G-A-d-g-c`), Turca/Grega (`D-E-A-B-e-a`) e Iraquiana/Mounir Bashir (`C-D-G-c-f-f'`).
* **Sistema de Shapes Fechados (Closed-Position Box):** Filtro que oculta as cordas soltas e cria uma caixa ergonômica móvel de 4 dedos (cobrindo 4 semitons / 8 quartos de tom), facilitando a transposição mecânica pelas 6 ordens do instrumento.
* **Ponte Modal e Cadencial Interativa:** Conexão direta entre Maqamat, Modos Gregos, Acordes e suas respectivas Cadências (*Qafla*).
* **Sintetizador Microtonal & Bordão (Drone):** Reprodução de notas individuais ao clicar no espelho, rasgueado de acordes (*strum*), arpejos e gerador de **Drone contínuo na Tônica (*Qarar*)**.

---

## 📖 Manual de Instruções do Usuário

A interface do aplicativo é dividida em **4 Cartões de Controle** no topo, a **Barra de Sequenciamento de Cadências** (quando ativa), o **Espelho Interativo** no centro e o **Painel Analítico** na base.

### 1. Barra Superior de Áudio e Orientação
Localizada no cabeçalho do aplicativo:
* **`▶ Tocar Escala / Rasguear Acorde / Tocar Cadência Completa`:** O botão principal adapta sua função automaticamente ao modo selecionado:
  * Nos modos *Maqamat*, *Ajnas* e *Modos*: executa a escala melodicamente respeitando os desvios em *cents*.
  * No modo *Acordes*: simula o **rasgueado da risha** (da 6ª à 1ª ordem) tocando apenas as notas ativas do *voicing* atual.
  * No modo *Cadências*: executa todos os acordes da progressão em sequência temporal, atualizando o desenho no espelho do Oud em tempo real.
* **`🎵 Arpejar Acorde Atual`:** Visível nos modos *Acordes* e *Cadências*; toca as notas do *voicing* ativo corda por corda.
* **`🔊 Drone na Tônica (ON/OFF)`:** Ativa ou desativa um bordão contínuo afinado na **Tônica (*Qarar*)** global.
* **`⇄ Mão: Destro / Canhoto`:** Espelha horizontalmente o braço do instrumento.

---

### 2. Cartão 1: Afinação & Tônica (Qarar)
* **Afinação do Oud (6ª → 1ª):** Escolha a configuração das 6 ordens de cordas. Ao alterar a afinação, todos os shapes de escalas e *voicings* de acordes são recalculados instantaneamente.
* **Tônica / Centro Modal (Qarar):** Permite transpor qualquer *Maqam*, *Jins*, *Modo*, *Acorde* ou *Cadência* para qualquer um dos **24 quartos de tom** da oitava.
* **Atalho `Tônica Tradicional`:** Retorna a estrutura selecionada para o seu grau de repouso histórico tradicional no Oud (ex: `C` para *Rast/Nahawand*, `D` para *Bayati/Hijaz/Saba/Kurd*, `Eb-` para *Sikah/Huzam*, `Bb` para *Ajam*).

---

### 3. Cartão 2: Estrutura Modal / Harmonia (5 Abas)
Utilize as 5 abas para alternar o motor musical:
1. **`Maqamat`:** Escalas completas com suporte a caminho **`↑ Ascendente`** e **`↓ Descendente`** (*Sayr*) e botão direto no painel inferior para abrir a **Cadência Modal (*Qafla*)** daquele Maqam.
2. **`Ajnas`:** Tricordes, tetracordes e pentacordes fundamentais isolados para treino de vocabulário e modulação.
3. **`Modos`:** Modos Gregos, Escalas Menores Alteradas (Harmônica, Frígio Dominante, Dupla Harmônica, Húngara) e Escalas Simétricas.
4. **`Acordes`:** Dicionário com 18 tipos de acordes. Oferece dois submodos de visualização:
   * **`1 Nota / Corda (Voicing)`:** Seleciona ergonomicamente uma única nota por ordem dentro da posição atual da mão esquerda e exibe **`✕`** vermelho nas ordens que devem ser abafadas/evitadas.
   * **`Todas as Notas (Arpejo)`:** Exibe todas as ocorrências das notas do acorde ao longo de todo o espelho.
5. **`Cadências`:** Abre a **Barra do Sequenciador de Cadências Modais (*Qafla*)** logo acima do espelho. Clique em qualquer passo da progressão (`Passo 1: I`, `Passo 2: IV`, etc.) para inspecionar e ouvir o acorde correspondente no braço do instrumento.

---

### 4. Cartão 3: Mapeamento de Shapes & Posição da Mão Esquerda
* **`Espelho Completo (0q a 16q)`:** Mostra todas as notas válidas da corda solta até o 8º semitom.
* **`1ª Posição Aberta (Com Cordas Soltas)`:** Prioriza a região próxima à pestana ($q=0$ a $q=8$), utilizando cordas soltas (`Dedo 0`) sempre que pertencerem à escala ou ao acorde.
* **`Posição Móvel Fechada (Sem Cordas Soltas)`:** Oculta as cordas soltas e ativa uma janela móvel de **4 semitons (8 quartos de tom)**. Use o controle deslizante (`q=1` a `q=10`) para gerar *voicings* de acordes e shapes de escalas fechados em qualquer região do braço.
* **`Isolar Regiões do Maqam` (`Completo` | `1º Jins` | `2º Jins`):** Permite focar separadamente no *Jins* inferior ou superior.

---

### 5. Cartão 4: Rótulos & Guias do Espelho
* **Texto dentro das Notas:** Alterne entre `Nome da Nota` (`C`, `Eb-`, `F#`), `Grau / Intervalo` (`1`, `3-`, `5`, `b7`), `Dedo Sugerido` (`0` a `4`) ou `Nome Árabe` (*Rast, Dukah, Sikah...*).
* **Linhas-Guia Visuais:** Ligue ou desligue individualmente as `Guias 12-TET` (semitons pares), `Guias 1/4 Tom` (quartos de tom ímpares) e `Ghost Notes` (notas fora da caixa atual exibidas em baixa opacidade).

---

## 🎨 Legenda de Cores e Formas no Espelho

| Símbolo / Cor | Formato Geométrico | Significado Musical |
| :--- | :---: | :--- |
| 🔴 **Vermelho Coral (Borda Branca)** | **Círculo** (se fixa) ou **Losango** (se 1/4 de tom) | **Tônica / Fundamental Atual (`1`):** Nota raiz do Maqam, Jins, Modo ou do Acorde atualmente ativo na Cadência. |
| 🟡 **Dourado / Âmbar** | **Círculo** ou **Losango** | **Ghammaz / 3ª do Acorde / Nota Característica:** Ponto de pivô modal (nos Maqamat), nota que define a qualidade modal do acorde (ex: 3ª neutra no acorde Rast) ou eixo simétrico. |
| 🔵 **Azul Royal** | **Círculo** (`●`) | **Nota Fixa (12-TET):** Nota temperada padrão (semitons pares). |
| 🟣 **Roxo / Violeta** | **Losango / Diamante** (`◆`) | **Nota Microtonal (24-TET):** Quarto de tom (meio-bemol `-` ou meio-sustenido `+`, passos ímpares na grade de 24 divisões). |
| ❌ **`✕` Vermelho na Pestana** | **Cruz na Ordem** | **Ordem Abafada / Omitida:** Indica que a corda não possui nota ergonomicamente acessível para o *voicing* fechado atual. |

---

## 🚀 Como Executar Localmente

1. Clone este repositório:
   ```bash
   git clone [https://github.com/SEU-USUARIO/app-oud-visualizer.git](https://github.com/SEU-USUARIO/app-oud-visualizer.git)
