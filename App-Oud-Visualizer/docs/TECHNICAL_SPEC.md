# 📐 Especificação Técnica e Modelagem Acústica — App Oud Visualizer

Este documento detalha os fundamentos matemáticos, acústicos e algorítmicos utilizados na construção do motor **24-TET Fretless Engine** do **App Oud Visualizer**.

---

## 1. Modelagem Matemática do Espelho Sem Trastes (Geometria Fretless)

Diferente de instrumentos trastados onde a posição visual pode ser aproximada linearmente em diagramas simplificados, o estudo do **Oud** exige precisão geométrica proporcional: a distância física entre intervalos iguais diminui logaritmicamente à medida que a mão avança da pestana (*nut*) em direção à roseta (*shamsiyya*) e ao cavalete (*bridge*).

### 1.1. Proporção da Mensura e Espelho Visível
* **Mensura Padrão ($L$):** No Oud árabe/sírio (mensura típica entre $600\text{ mm}$ e $615\text{ mm}$) e no Oud turco ($585\text{ mm}$), o comprimento vibrante total da corda solta vai da pestana ao cavalete ($100\%$).
* **Janela do Espelho ($q_{\max} = 16$):** O aplicativo renderiza os primeiros **16 quartos de tom** ($8\text{ semitons}$, equivalentes a uma Quarta Aumentada / Quinta Diminuta por corda), cobrindo toda a extensão útil do braço antes da junção com o bojo.

### 1.2. Equação de Posicionamento Logarítmico (24-TET)
Adotando a divisão da oitava em **24 quartos de tom geometricamente iguais** (cada passo $q = 50\text{ cents}$), a distância física $d(q)$ da pestana até o quarto de tom $q$ em uma corda de comprimento total $L$ é dada por:

$$d(q) = L \cdot \left(1 - 2^{-\frac{q}{24}}\right)$$

Para normalizar essa curva dentro da largura útil do componente gráfico SVG ($W_{\text{neck}}$) considerando o limite visível $q_{\max} = 16$:

$$X(q) = X_{\text{nut}} \pm W_{\text{neck}} \cdot \left( \frac{1 - 2^{-\frac{q}{24}}}{1 - 2^{-\frac{q_{\max}}{24}}} \right)$$

*(Onde o sinal $+$ é aplicado para a visualização de Destro e o sinal $-$ para a visualização espelhada de Canhoto).*

---

## 2. Sistema de Índices Pitch Class (Grade 24-TET + Desvio em Cents)

Toda a aritmética de transposição, mudança de afinação e sobreposição de *Ajnas* utiliza inteiros em **Aritmética Modular de Base 24** ($\mathbb{Z}_{24}$), onde:
* $1\text{ quarto de tom} = 1q\ (50\text{ cents})$
* $1\text{ semitom temperado} = 2q\ (100\text{ cents})$
* $1\text{ intervalo de 3/4 de tom (neutro)} = 3q\ (150\text{ cents})$
* $1\text{ tom inteiro} = 4q\ (200\text{ cents})$
* $1\text{ segunda aumentada (Hijaz)} = 6q\ (300\text{ cents})$
* $1\text{ oitava justa} = 24q\ (1200\text{ cents})$

### 2.1. Tabela de Mapeamento de Classes de Altura ($q \in [0, 23]$)

| Índice ($q$) | Notação Sustenido (+) | Notação Bemol (-) | Natureza | Grau Histórico (Oitava Central) |
| :---: | :---: | :---: | :--- | :--- |
| **0** | `C` | `C` | 12-TET Fixa (Par) | Rast (C3) / Kirdan (C4) |
| **1** | `C+` | `Db-` | Microtonal (Ímpar) | Nim Rahawi |
| **2** | `C#` | `Db` | 12-TET Fixa (Par) | Zirgulah |
| **3** | `C#+` | `D-` | Microtonal (Ímpar) | Tik Zirgulah |
| **4** | `D` | `D` | 12-TET Fixa (Par) | Dukah (D3) / Muhayyar (D4) |
| **5** | `D+` | `Eb-` | **Microtonal (Ímpar)** | **Sikah** |
| **6** | `D#` | `Eb` | 12-TET Fixa (Par) | Kurdi / Nahawand |
| **7** | `D#+` | `E-` | Microtonal (Ímpar) | Tik Kurdi |
| **8** | `E` | `E` | 12-TET Fixa (Par) | Busalik |
| **9** | `E+` | `F-` | Microtonal (Ímpar) | Tik Busalik |
| **10** | `F` | `F` | 12-TET Fixa (Par) | Jaharkah |
| **11** | `F+` | `Gb-` | **Microtonal (Ímpar)** | **Nim Hijaz / Saba** |
| **12** | `F#` | `Gb` | 12-TET Fixa (Par) | Hijaz |
| **13** | `F#+` | `G-` | Microtonal (Ímpar) | Tik Hijaz |
| **14** | `G` | `G` | 12-TET Fixa (Par) | Nawa |
| **15** | `G+` | `Ab-` | Microtonal (Ímpar) | Nim Hisar |
| **16** | `G#` | `Ab` | 12-TET Fixa (Par) | Hisar |
| **17** | `G#+` | `A-` | **Microtonal (Ímpar)** | **Tik Hisar** |
| **18** | `A` | `A` | 12-TET Fixa (Par) | Husayni (A3) / Ashiran (A2) |
| **19** | `A+` | `Bb-` | **Microtonal (Ímpar)** | **Awj (Bb3-) / Iraq (Bb2-)** |
| **20** | `A#` | `Bb` | 12-TET Fixa (Par) | Ajam |
| **21** | `A#+` | `B-` | Microtonal (Ímpar) | Tik Ajam |
| **22** | `B` | `B` | 12-TET Fixa (Par) | Mahur |
| **23** | `B+` | `C-` | Microtonal (Ímpar) | Tik Mahur |

### 2.2. Compensação Microtonal Acústica ($\Delta\text{cents}$)
Na prática tradicional síria e egípcia, os quartos de tom não são estáticos em $50\text{ cents}$ exatos:
* No **Jins Rast** e **Jins Bayati**, a nota microtonal (*Sikah*) possui entonação levemente mais baixa (cerca de $-15\text{ cents}$ em relação à grade 24-TET, situando a 3ª neutra do Rast próxima a $335\text{ cents}$ em vez de $350\text{ cents}$).
* No **Jins Sikah / Maqam Huzam**, a nota tônica `Eb-` é entoada ligeiramente mais alta ($+15\text{ cents}$).
* O motor de áudio do aplicativo aplica um vetor `cents_dev` sobre a frequência base 24-TET para reproduzir a entonação autêntica de cada Jins.

---

## 3. Topologia das Cordas e o "Salto de Terça Maior" (`F2 → A2`)

Cada ordem (*course*) $i \in \{1, \dots, 6\}$ possui uma altura absoluta $Q_{\text{open}}(i)$ em quartos de tom a partir de `C2 = 0`. A nota produzida na posição $q_{\text{nut}}$ da ordem $i$ tem classe de altura:

$$\text{PitchClass}(i, q_{\text{nut}}) = \left( Q_{\text{open}}(i) + q_{\text{nut}} \right) \bmod 24$$

### Assimetria Inter-Cordas na Afinação Síria (`C2 - F2 - A2 - d3 - g3 - c4`)
* Ordens `6 → 5` (`C2 → F2`): $\Delta Q = 10q$ (**Quarta Justa**)
* Ordens `5 → 4` (`F2 → A2`): $\Delta Q = 8q$ (**Terça Maior — Eixo de Deslocamento de Shape**)
* Ordens `4 → 3` (`A2 → d3`): $\Delta Q = 10q$ (**Quarta Justa**)
* Ordens `3 → 2` (`d3 → g3`): $\Delta Q = 10q$ (**Quarta Justa**)
* Ordens `2 → 1` (`g3 → c4`): $\Delta Q = 10q$ (**Quarta Justa**)

Qualquer shape fechado (*Closed-Position Box*) que atravesse da 5ª ordem (`F2`) para a 4ª ordem (`A2`) sofre um deslocamento horizontal de **$+2q$ ($1\text{ semitom}$ em direção ao bojo)** em comparação aos pares de cordas afinados em quartas justas. O painel inferior do aplicativo calcula e alerta dinamicamente sobre esses saltos para qualquer afinação selecionada.

---

## 4. Algoritmo de Filtragem de Shapes Fechados (Closed-Position Box)

Para permitir a prática de digitações móveis sem depender de cordas soltas:
1. O usuário define a âncora da mão esquerda `boxAnchorQ` ($q_{\text{anchor}} \in [1, 10]$), que representa a linha onde repousa o **Dedo 1 (Indicador)**.
2. A janela ativa da mão esquerda cobre exatamente **8 quartos de tom ($4\text{ semitons}$)**:
   $$\text{Janela Ativa} = \left[ q_{\text{anchor}},\ q_{\text{anchor}} + 7 \right]$$
3. A atribuição ergonômica do dedo da mão esquerda ($1\text{ a }4$) para qualquer nota dentro da janela é determinada pela função:
   $$\text{Dedo}(q_{\text{nut}}) = \min\left(4,\ \left\lfloor \frac{q_{\text{nut}} - q_{\text{anchor}}}{2} \right\rfloor + 1\right)$$
4. Notas pertencentes à escala que caem fora do intervalo $[q_{\text{anchor}}, q_{\text{anchor}} + 7]$ recebem `opacity: 0.18` (*Ghost Notes*), preservando o contexto visual do braço sem poluir o desenho mecânico da posição.

---

## 5. Síntese de Áudio (Web Audio API)

A síntese sonora de cada nota clicada no espelho utiliza modelagem subtrativa de corda dupla dedilhada:
* **Frequência Fundamental:**
  $$f(q_{\text{nut}}, \Delta\text{cents}) = f_{\text{open}} \cdot 2^{\left(\frac{50 \cdot q_{\text{nut}} + \Delta\text{cents}}{1200}\right)}$$
* **Simulação de Ordem Dupla (Par de Cordas):** Dois osciladores simultâneos (`triangle` + `sawtooth`) com *detune* de $+1.5\text{ cents}$ no segundo oscilador, recriando o batimento acústico natural das ordens duplas do Oud.
* **Modelagem do Ataque de Risha e Bojo:** Filtro Biquad `lowpass` com corte inicial em $6 \times f_0$ decaindo exponencialmente para $1.4 \times f_0$, combinado a um envelope de ganho com ataque de $12\text{ ms}$.