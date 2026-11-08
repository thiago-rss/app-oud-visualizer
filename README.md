# 🪕 App Oud Visualizer — 24-TET Fretless Engine

![Version](https://img.shields.io/badge/version-1.0.0-amber.svg)
![Architecture](https://img.shields.io/badge/tuning_engine-24--TET_%2B_Cents-purple.svg)
![Tech](https://img.shields.io/badge/stack-Vanilla_JS_%7C_SVG_%7C_Web_Audio_API-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

O **App Oud Visualizer** é uma aplicação web interativa e sem dependências externas projetada para o estudo avançado, mapeamento mecânico e visualização modal no espelho (braço sem trastes) do **Oud** (alaúde árabe/sírio, turco e iraquiano).

O sistema combina geometria logarítmica de precisão em **24 divisões por oitava (24-TET)** com síntese sonora microtonal em tempo real (**Web Audio API** com compensação em *cents*), permitindo visualizar e ouvir **Maqamat**, **Ajnas** (tricordes, tetracordes e pentacordes), **Modos Gregos**, **Escalas Menores Alteradas** e **Escalas Simétricas** em diferentes afinações e posições da mão esquerda.

🔗 **[Acessar Demonstração Online (GitHub Pages)](https://thiago-rss.github.io/app-oud-visualizer/)**

---

## ✨ Principais Funcionalidades

* **Geometria Fretless Realista (SVG):** Cálculo exato da posição física de semitons e quartos de tom na mensura da corda seguindo a progressão logarítmica acústica $d(q) = L \cdot (1 - 2^{-q/24})$.
* **Diferenciação Visual Dupla (Cor + Forma):** Identificação imediata entre notas temperadas fixas (**círculos**) e notas microtonais de quarto de tom (**losangos/diamantes**), garantindo acessibilidade e leitura rápida durante a prática e improviso (*Taqsim*).
* **Múltiplas Afinações com Recálculo Automático:** Suporte nativo às afinações Síria/Árabe (`C-F-A-d-g-c`), Árabe Clássica (`F-A-d-g-c-f`), Egípcia (`D-G-A-d-g-c`), Turca/Grega (`D-E-A-B-e-a`) e Iraquiana/Mounir Bashir (`C-D-G-c-f-f'`).
* **Sistema de Shapes Fechados (Closed-Position Box):** Filtro que oculta as cordas soltas e cria uma caixa ergonômica móvel de 4 dedos (cobindo 4 semitons / 8 quartos de tom), facilitando a transposição mecânica de *Ajnas* e escalas pelas 6 ordens do instrumento.
* **Ponte Modal Interativa (Oriente ↔ Ocidente):** Conexão analítica direta entre Modos Gregos / Escalas Simétricas e seus equivalentes no sistema de *Maqamat* (ex: *Frígio* ↔ *Maqam Kurd*; *Menor Húngara* ↔ *Maqam Nawa Athar*).
* **Sintetizador Microtonal & Bordão (Drone):** Reprodução de notas individuais ao clicar no espelho, execução sequencial da escala/Maqam e gerador de **Drone contínuo na Tônica (*Qarar*)** para treino auditivo de entonação.
* **Modo Destro e Canhoto:** Inversão horizontal instantânea de todo o espelho e das guias de referência.

---

## 📖 Manual de Instruções do Usuário

A interface do aplicativo é dividida em **4 Cartões de Controle** no topo, o **Espelho Interativo** no centro e o **Painel Analítico** na base.

### 1. Barra Superior de Áudio e Orientação
Localizada no cabeçalho do aplicativo:
* **`▶ Tocar Escala / Maqam`:** Executa em sequência (arpejo melódico) todas as notas da estrutura atualmente selecionada, respeitando os desvios microtonais em *cents* (ex: a terça neutra do *Rast* ou o segundo grau do *Bayati*).
* **`🔊 Drone na Tônica (ON/OFF)`:** Ativa ou desativa um som de bordão contínuo afinado exatamente na nota **Tônica (*Qarar*)** selecionada. Ideal para deixar soando ao fundo enquanto você pratica a entonação dos quartos de tom no seu Oud físico.
* **`⇄ Mão: Destro / Canhoto`:** Espelha horizontalmente o braço do instrumento (pestana à esquerda para destros; pestana à direita para canhotos).

---

### 2. Cartão 1: Afinação & Tônica (Qarar)
* **Afinação do Oud (6ª → 1ª):** Escolha a configuração das 6 ordens de cordas. Ao alterar a afinação, todas as notas do espelho e o painel de intervalos entre cordas são recalculados automaticamente.
  * *Destaque para a afinação Síria (`C - F - A - d - g - c`):* Observe no painel inferior como o aplicativo sinaliza o salto de **Terça Maior (`F2 → A2`)** entre a 5ª e a 4ª corda, enquanto os demais pares seguem em **Quartas Justas**.
* **Nota Tônica (Root):** Permite transpor qualquer *Maqam*, *Jins* ou escala para qualquer um dos **24 quartos de tom** da oitava (incluindo tônicas microtonais como `Eb-` para a família *Sikah/Huzam*).
* **Link `Usar Tônica Tradicional`:** Ao clicar neste atalho, o aplicativo retorna a estrutura selecionada para o seu grau de repouso histórico tradicional no Oud (ex: `C` para *Rast/Nahawand*, `D` para *Bayati/Hijaz/Saba/Kurd*, `Eb-` para *Sikah/Huzam*, `Bb` para *Ajam*).

---

### 3. Cartão 2: Estrutura Modal / Escala
Utilize as 3 abas para alternar o motor de busca musical:
1. **Aba `Maqamat`:** Exibe a escala completa do Maqam.
   * **Botões `↑ Ascendente` e `↓ Descendente`:** Muitos Maqamat alteram seu *Jins* superior dependendo da direção melódica (*Sayr*). Por exemplo, no *Maqam Rast* em Dó, o 7º grau é `Bb-` (*Awj*) na subida e se transforma em `Bb` natural (*Ajam*) na descida; no *Maqam Nahawand*, usa-se o *Jins Hijaz* na subida (7M) e o *Jins Kurd* na descida (b7).
2. **Aba `Ajnas`:** Isola os blocos construtores fundamentais de 3, 4 ou 5 notas (*Tricordes, Tetracordes e Pentacordes*). Essencial para estudar a mecânica pura e a modulação entre pequenos fragmentos no *Taqsim*.
3. **Aba `Modos & Sim.`:** Contém os 7 Modos Gregos, escalas menores alteradas (Harmônica, Frígio Dominante, Dupla Harmônica, Húngara) e escalas simétricas (Tons Inteiros, Diminutas `T-S` e `S-T`, Aumentada e Grades Cromáticas 12-TET / 24-TET).

---

### 4. Cartão 3: Mapeamento de Shapes & Posição da Mão Esquerda
Este módulo controla como as notas são filtradas no braço:
* **`Espelho Completo (Todas as Notas)`:** Mostra todas as ocorrências válidas da escala da corda solta ($q=0$) até o 8º semitom ($q=16$).
* **`1ª Posição Clássica (Com Cordas Soltas)`:** Destaca a região tradicional próxima à pestana ($q=0$ a $q=8$), utilizando cordas soltas (`Dedo 0`) sempre que pertencerem à escala.
* **`Shape Móvel Fechado (Sem Cordas Soltas)`:** Oculta as cordas soltas e ativa uma janela móvel de **4 semitons (8 quartos de tom)** para estudo de padrões fechados e transponíveis nas 6 cordas:
  * **Controle Deslizante (`Posição do Dedo 1`):** Arraste o controle de `q=1` a `q=10` para deslocar a caixa amarela tracejada ao longo do braço do Oud. O aplicativo calculará automaticamente qual dedo da mão esquerda (`1`, `2`, `3` ou `4`) deve tocar cada nota dentro daquela posição.
* **`Isolar Regiões do Maqam` (`Completo` | `1º Jins` | `2º Jins`):** Visível quando a aba *Maqamat* está ativa. Permite apagar temporariamente a metade superior ou inferior da escala para focar apenas no *Jins* da base ou no *Jins* a partir do *Ghammaz*.

---

### 5. Cartão 4: Rótulos & Guias do Espelho
* **Texto dentro das Notas:**
  * `Nome da Nota`: Exibe a cifra com acidentes ocidentais e microtonais (`C`, `Eb-` para meio-bemol, `F#+` para meio-sustenido).
  * `Grau / Intervalo`: Exibe a função intervalar em relação à tônica (`1`, `2-`, `b3`, `#4`, `5`).
  * `Dedo Sugerido`: Exibe a digitação da mão esquerda (`0` = corda solta, `1` = indicador, `2` = médio, `3` = anelar, `4` = mínimo).
  * `Nome Árabe`: Exibe a nomenclatura histórica persa/árabe de cada grau (*Rast, Dukah, Sikah, Jaharkah, Nawa, Husayni, Awj, Mahur...*).
* **Linhas-Guia Visuais (Fretless):**
  * `Guias 12-TET`: Liga/desliga as linhas verticais contínuas equivalentes aos semitons temperados (`S1`, `S2`, `S3`...).
  * `Guias 1/4 Tom`: Liga/desliga as linhas tracejadas roxas indicando as posições exatas dos quartos de tom (`1q`, `3q`, `5q`...).
  * `Ghost Notes`: Quando em modo de *1ª Posição* ou *Shape Fechado*, mantém as notas fora da posição visíveis em baixa opacidade (translúcidas) para que você não perca a referência global do braço.

---

## 🎨 Legenda de Cores e Formas no Espelho

| Símbolo / Cor | Formato Geométrico | Significado Musical |
| :--- | :---: | :--- |
| 🔴 **Vermelho Coral (Borda Branca)** | **Círculo** (se fixa) ou **Losango** (se 1/4 de tom) | **Tônica (*Qarar* / *Jawab*):** Nota fundamental de resolução do Maqam, Jins ou Escala. |
| 🟡 **Dourado / Âmbar** | **Círculo** ou **Losango** | **Ghammaz / Nota Característica / Eixo Simétrico:** Ponto de pivô modal onde se inicia o 2º *Jins* (nos Maqamat), nota característica (nos Modos Gregos) ou eixo de simetria (nas Escalas Simétricas). |
| 🔵 **Azul Royal** | **Círculo** (`●`) | **Nota Fixa (12-TET):** Nota pertencente ao sistema temperado padrão (semitons pares). |
| 🟣 **Roxo / Violeta** | **Losango / Diamante** (`◆`) | **Nota Microtonal (24-TET):** Quarto de tom (meio-bemol `-` ou meio-sustenido `+`, passos ímpares na grade de 24 divisões). |

---

## 🚀 Como Executar Localmente

O projeto foi construído em arquitetura *Zero-Dependency* (HTML5 + CSS3 + Vanilla JavaScript em arquivo único), garantindo máxima velocidade e portabilidade.

1. Clone este repositório:
   ```bash
   git clone [https://github.com/thiago-rss/app-oud-visualizer.git](https://github.com/thiago-rss/app-oud-visualizer.git)
