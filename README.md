# 🪕 App Oud Visualizer — 24-TET Fretless Engine, Luthieria & Harmonia Modal

![Version](https://img.shields.io/badge/version-1.3.0_Luthier_Edition-amber.svg)
![Architecture](https://img.shields.io/badge/tuning_engine-24--TET_%2B_Cents-purple.svg)
![Harmony](https://img.shields.io/badge/harmony-Modal_Chords_%26_Qafla_Sequencer-emerald.svg)
![Tech](https://img.shields.io/badge/stack-Vanilla_JS_%7C_SVG_%7C_Web_Audio_API-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

O **App Oud Visualizer** é uma aplicação web interativa e sem dependências externas projetada para o estudo avançado, mapeamento mecânico, harmonia modal e visualização no espelho (braço sem trastes) do **Oud** (alaúde árabe/sírio, egípcio, iraquiano e turco).

O sistema combina geometria logarítmica de precisão em **24 divisões por oitava (24-TET)** com síntese sonora microtonal em tempo real (**Web Audio API** com compensação em *cents*) e uma interface inspirada nas escolas tradicionais de luthieria do Oriente Médio e Anatólia.

🔗 **[Acessar Demonstração Online (GitHub Pages)](https://thiago-rss.github.io/app-oud-visualizer/)**

---

## ✨ Novidades e Funcionalidades (v1.3.0 — Luthier Edition)

* **Seletor de Tradições de Luthieria (3 Escolas Visuais):** Alterne em tempo real a paleta de madeiras, filetes de marchetaria (*khatem*) e incrustações de madrepérola (*sadaf*) do instrumento:
  * **Damasco (Síria):** Nogueira escura, tampo em cedro tostado, filetes geométricos e incrustações iridescentes de madrepérola (*sadaf*).
  * **Cairo / Bagdá (Egito & Iraque):** Tampo em cedro quente (*wajh*), escudo protetor (*raqma*) em tom jacarandá/tartaruga e acabamentos em ouro envelhecido.
  * **Istambul (Turquia & Grécia):** Tampo em abeto claro (*spruce*) de alto contraste com espelho em ébano profundo e roseta geométrica clássica.
* **Anatomia Realista do Oud em SVG:**
  * **Junção com o Bojo (*Wajh*) e Rosetas (*Shamsiyya*):** Renderização da curvatura da caixa acústica a partir do 5º semitom ($q=10$), roseta central de 12 pétalas entrelaçadas, duas rosetas menores auxiliares (*shamsiyyat*) e o escudo de proteção da palheta (*raqma*).
  * **Cravelhal (*Bajak*), Pestana (*Anf*) e Ordens Duplas:** Diferenciação visual entre as ordens agudas (nylon perolado) e os bordões graves (revestidos em cobre/bronze), além de losangos laterais de madrepérola nos semitons-chave.
* **Incrustações de Notas (Joalheria & Estrelas Árabes):**
  * **Notas Microtonais (24-TET):** Exibidas como **Estrelas Octogonais Árabes (*Rub el Hizb* / *Khatam*)** em ametista e madrepérola.
  * **Notas Fixas (12-TET), Tônica (*Qarar*) e *Ghammaz*:** Medalhões lapidados em rubi, âmbar dourado e lápis-lazúli.
* **Dicionário de Acordes para Oud (Voicings & Arpejos):** 18 estruturas harmônicas divididas entre **Acordes Modais/Microtonais** (Rast com 3ª neutra, Bayati Cluster, Hijaz, Saba, Sikah, Quartal, Sus2/Sus4 e Power Chords de bordão), **Tríades** e **Tétrades 12-TET**, com cálculo automático de *voicing* ergonômico (1 nota tocável por corda e indicação `✕` para ordens abafadas).
* **Sequenciador de Cadências Modais (*Qafla*):** 10 progressões harmônico-modais completas para finalizar os principais *Maqamat*, com transposição automática em 24-TET, visualização passo a passo no espelho e execução sequencial com rasgueado de *risha*.
* **Sistema de Shapes Fechados (Closed-Position Box):** Filtro que oculta as cordas soltas e cria uma caixa ergonômica móvel de 4 dedos (cobrindo 4 semitons / 8 quartos de tom), facilitando a transposição mecânica pelas 6 ordens do instrumento.
* **Sintetizador Microtonal & Bordão (Drone):** Reprodução de notas individuais ao clicar no espelho, rasgueado de acordes (*strum*), arpejos, clique interativo na própria roseta (*Shamsiyya*) e gerador de **Drone contínuo na Tônica (*Qarar*)**.

---

## 📖 Manual de Instruções do Usuário

A interface do aplicativo é dividida no **Cabeçalho (Tradição & Áudio)**, **4 Cartões de Controle**, a **Barra de Sequenciamento de Cadências** (quando ativa), o **Espelho Interativo** no centro e o **Painel Analítico** na base.

### 1. Cabeçalho: Escola de Luthieria e Controles Sonoros
* **`🏺 Tradição`:** Seletor visual que alterna a estética do instrumento e da interface entre **Damasco**, **Cairo / Bagdá** e **Istambul**.
* **`▶ Tocar Escala / Rasguear Acorde / Tocar Qafla Completa`:** O botão principal adapta sua ação ao modo selecionado (arpejo melódico microtonal, rasgueado de *risha* nos acordes ou execução sequencial da cadência). *Dica: clicar diretamente sobre a roseta central (`Shamsiyya`) no tampo do Oud também dispara esta ação.*
* **`🎵 Arpejar Acorde`:** Visível nos modos *Acordes* e *Cadências*; toca as notas do *voicing* ativo corda por corda.
* **`🔊 Drone (Qarar) ON/OFF`:** Ativa ou desativa um bordão contínuo afinado na **Tônica (*Qarar*)** global para treino de entonação.
* **`⇄ Destro / Canhoto`:** Espelha horizontalmente toda a anatomia do instrumento (cravelhal, espelho e bojo).

---

### 2. Cartão 1: Afinação & Qarar (Tônica)
* **Ordens do Oud (6ª Grave → 1ª Aguda):** Suporte nativo às afinações **Árabe / Síria Padrão** (`C - F - A - d - g - c`), **Árabe Clássica** (`F - A - d - g - c - f`), **Árabe Egípcia** (`D - G - A - d - g - c`), **Turca / Grega** (`D - E - A - B - e - a`) e **Iraquiana / Mounir Bashir** (`C - D - G - c - f - f'`).
* **Centro Modal / Tônica (Qarar):** Permite transpor qualquer estrutura para qualquer um dos **24 quartos de tom** da oitava.
* **Atalho `↺ Tônica Tradicional`:** Retorna a estrutura selecionada para o seu grau de repouso histórico tradicional no Oud (ex: `C` para *Rast/Nahawand*, `D` para *Bayati/Hijaz/Saba/Kurd*, `Eb-` para *Sikah/Huzam*, `Bb` para *Ajam*).

---

### 3. Cartão 2: Modalidade & Harmonia (5 Abas)
1. **`Maqamat`:** Escalas completas com suporte a caminho **`↑ Ascendente`** e **`↓ Descendente`** (*Sayr*) e atalho direto no painel inferior para abrir a **Cadência Modal (*Qafla*)** correspondente.
2. **`Ajnas`:** Tricordes, tetracordes e pentacordes fundamentais isolados para treino de vocabulário e modulação no *Taqsim*.
3. **`Modos`:** Modos Gregos, Escalas Menores Alteradas (Harmônica, Frígio Dominante, Dupla Harmônica, Húngara) e Escalas Simétricas.
4. **`Acordes`:** Dicionário com 18 tipos de acordes, permitindo alternar entre **`1 Nota / Ordem (Voicing)`** (digitação real executável) e **`Mapa Completo (Arpejo)`**.
5. **`Cadências`:** Abre o **Sequenciador de Cadências Modais (*Qafla*)** acima do espelho para estudar e ouvir progressões de resolução passo a passo.

---

### 4. Cartão 3: Posição & Shapes no Espelho
* **`Espelho Completo (0q a 16q)`:** Mostra todas as ocorrências válidas da corda solta até o 8º semitom.
* **`1ª Posição Clássica (Com Cordas Soltas)`:** Prioriza a região próxima à pestana ($q=0$ a $q=8$), utilizando cordas soltas (`Dedo 0`).
* **`Shape Móvel Fechado (Sem Cordas Soltas)`:** Oculta as cordas soltas e cria uma janela móvel de **4 semitons (8 quartos de tom)**. Arraste o controle deslizante (`q=1` a `q=10`) para gerar *shapes* e *voicings* fechados em qualquer região do braço.
* **`Isolar Tetracordes (Ajnas)`:** Permite exibir o `Maqam Completo`, apenas o `1º Jins (Base)` ou apenas o `2º Jins (Ghammaz)`.

---

### 5. Cartão 4: Inscrições & Guias de Mensura
* **Inscrição nas Notas:** Alterne entre `Cifra & Acidente` (`C`, `Eb-`, `F#`), `Grau Modal` (`1`, `3-`, `5`, `b7`), `Dedilhado` (`0` a `4`) ou `Grau Histórico` (*Rast, Dukah, Sikah...*).
* **Incrustações de Referência:** Ligue ou desligue as `Guias 12-TET`, `Guias 1/4 Tom` e `Ghost Notes`.

---

## 🎨 Legenda de Joias e Incrustações no Espelho

| Símbolo / Acabamento | Forma Geométrica | Significado Musical |
| :--- | :---: | :--- |
| 🔴 **Medalhão Rubi (Anel Dourado)** | **Círculo** (se fixa) ou **Estrela** (se 1/4 de tom) | **Qarar / Tônica (`1`):** Nota fundamental de resolução do Maqam, Jins, Modo ou do Acorde ativo na Cadência. |
| 🟡 **Medalhão Âmbar / Ouro** | **Círculo** ou **Estrela** | **Ghammaz / Nota Característica:** Ponto de pivô modal (início do 2º *Jins*), nota que define a qualidade modal do acorde ou eixo simétrico. |
| 🔵 **Medalhão Lápis-Lazúli** | **Círculo** (`●`) | **Nota Fixa (12-TET):** Nota temperada padrão (semitons pares). |
| 🟣 **Estrela Ametista & Sadaf** | **Estrela Octogonal Árabe** (`۞`) | **Quarto de Tom Microtonal (24-TET):** Meio-bemol (`-`) ou meio-sustenido (`+`), passos ímpares na grade de 24 divisões. |
| ❌ **`✕` Vermelho na Pestana** | **Cruz na Ordem** | **Ordem Abafada / Omitida:** Indica que a corda não deve ser tocada no *voicing* fechado atual. |

---

## 🚀 Como Executar Localmente

1. Clone este repositório:
   ```bash
   git clone [https://github.com/thiago-rss/app-oud-visualizer.git](https://github.com/thiago-rss/app-oud-visualizer.git)
