# 📐 Especificação Técnica e Modelagem Acústica — App Oud Visualizer (v1.2)

Este documento detalha os fundamentos matemáticos, acústicos e algorítmicos utilizados na construção do motor **24-TET Fretless Engine**, do **Dicionário de Acordes Ergonômicos** e do **Sequenciador de Cadências Modais (*Qafla*)** do **App Oud Visualizer**.

---

## 1. Modelagem Matemática do Espelho Sem Trastes (Geometria Fretless)

A distância física entre intervalos iguais no braço sem trastes do Oud obedece a uma progressão logarítmica proporcional à mensura ($L$):

$$d(q) = L \cdot \left(1 - 2^{-\frac{q}{24}}\right)$$

Onde $q$ representa a distância em quartos de tom a partir da pestana (*nut*). Para o espelho renderizado de $q_{\max} = 16$ quartos de tom (8 semitons):

$$X(q) = X_{\text{nut}} \pm W_{\text{neck}} \cdot \left( \frac{1 - 2^{-\frac{q}{24}}}{1 - 2^{-\frac{q_{\max}}{24}}} \right)$$

---

## 2. Sistema de Classes de Altura (Grade 24-TET + $\Delta\text{cents}$)

A aritmética modal opera em aritmética modular $\mathbb{Z}_{24}$ (24 divisões por oitava). Para respeitar a entonação tradicional síria/egípcia, o motor aplica vetores de compensação microtonal (`cents_dev`), como:
* **Terça Neutra do Rast:** $\Delta\text{cents} = -15\text{ cents}$ (situando o Sikah próximo a $335\text{ cents}$).
* **Tônica Sikah / Huzam:** $\Delta\text{cents} = +15\text{ cents}$ sobre a nota base em Eb-.

---

## 3. Algoritmo Heurístico de Seleção de Voicings de Acordes (1 Nota por Ordem)

Como o Oud possui cordas duplas sem trastes e exige digitações fisicamente executáveis pela mão esquerda, a exibição de acordes no modo **`Voicing (1 Nota / Corda)`** utiliza uma função de pontuação heurística para cada corda $c$ dentro da janela ativa de digitação $[q_{\min}, q_{\max}]$:

$$\text{Score}(c, q_{\text{nut}}) = 100 - (3 \cdot q_{\text{nut}}) + \text{Bonus}_{\text{root}} + \text{Bonus}_{\text{interval}}$$

* **Critérios de Seleção:**
  1. **Proximidade da Pestana:** Prefere notas mais próximas do início do braço (penalizando posições muito altas).
  2. **Cordas Soltas:** Recebe bônus de ressonância quando $q_{\text{nut}} = 0$ (exceto em caixas móveis fechadas).
  3. **Baixo Fundamental:** Garante que a corda mais grave tocada ressoe preferencialmente na Fundamental (Tônica do acorde), somando um bônus expressivo de prioridade (`+60`).
  4. **Tétrades e Terças:** Prioriza a distribuição de terças e sétimas nas ordens intermediárias e agudas.
* **Cordas Abafadas (`✕`):** Se nenhuma nota do acorde puder ser encaixada de forma ergonômica em determinada ordem, a corda recebe o status `null` e é marcada visualmente com um **`✕` vermelho** na pestana, indicando que deve ser abafada pelo músico durante o rasgueado da *risha*.

---

## 4. Transposição Dinâmica de Cadências Modais (*Qafla*)

As cadências modais são armazenadas na coleção `cadences` como vetores de passos relativas à tônica global ($Q_{\text{root}}$). A altura absoluta $Q_{\text{chord}}$ de cada acorde da progressão é calculada por transposição modular:

$$Q_{\text{chord}} = \left( Q_{\text{root}} + \text{offset}_q \right) \bmod 24$$

Isso permite que o usuário altere a tônica global para qualquer uma das 24 posições da oitava e o sequenciador transponha automaticamente todos os acordes da cadência (*Qafla*) para o novo centro modal.
