# Referências externas

Documentos oficiais guardados aqui para consulta enquanto se escreve conteúdo.
**Não são servidos pelo site** — nada em `docs/` é publicado, e estes ficheiros
não estão ligados a partir de nenhuma página. Se algum dia forem precisos no
site, têm de ser copiados para `public/`.

---

## Os dois níveis da CEPT, e onde Portugal encaixa

A CEPT define **dois** níveis de exame, e Portugal mapeia em ambos com
categorias diferentes. Isto é o que decide contra que programa se mede cada
parte do conteúdo:

| Nível CEPT | Documento | Programa de exame | Categoria portuguesa |
| :--- | :--- | :--- | :--- |
| **HAREC** | Recomendação T/R 61-02 | Anexo 6 da própria recomendação | **Categoria 1** (Anexo 2: «1, A 5 e B») |
| **Novice** | Recomendação ECC (05)06 | ERC Report 32, Anexo 2 | **Categoria 2** (Anexo 2: prefixos CS7, CS8, CS9) |

A **Categoria 3 não tem equivalente na CEPT**: está abaixo do nível Novice e é
puramente nacional. Medi-la contra qualquer um destes programas não faz sentido.

---

## `cept-tr61-02-harec.pdf` — CEPT Recomendação T/R 61-02

*Harmonised Amateur Radio Examination Certificate* (HAREC). 24 páginas, em
inglês. Versão descarregada de <https://docdb.cept.org/download/2569> em
2026-09-24 (aprovada em Chester 1990, alterada em Vilnius 2004; Anexo 2 revisto
em junho de 2020, Anexo 6 em fevereiro de 2018).

`sha256 54814664d695c230913563f85c07a53ebde41a42eb2a01cb6b271ef9c0c261a7`

**Porque interessa à Categoria 1:** o Anexo 2 lista as classes nacionais
equivalentes ao nível de exame CEPT, e para Portugal são as classes **«1, A 5 e
B»**. Ou seja, o programa do Anexo 6 é o programa recomendado para a nossa
Categoria 1, e é a referência contra a qual se verifica se falta matéria.

**O que está onde, no PDF:**

| Páginas | Conteúdo |
|---|---|
| 12 | Anexo 6: programa e requisitos do exame |
| 13–14 | Programa resumido — os capítulos e as secções |
| 14–24 | Programa detalhado — o que cada secção exige, com as fórmulas |

O programa divide-se em três partes: **a)** conteúdo técnico (10 capítulos),
**b)** regras e procedimentos de operação, **c)** regulamentação nacional e
internacional.

### Como o programa mapeia no nosso conteúdo

`app/aprender/` segue esta estrutura de perto — os capítulos técnicos 1 a 10 são
praticamente os nossos títulos:

| T/R 61-02 | Páginas em `app/aprender/` |
|---|---|
| 1. Teoria eléctrica, electromagnética e de rádio | `teoria-electrica-e-radio`, `campo-electromagnetico`, `corrente-alternada` |
| 2. Componentes | `componentes`, `transistores`, `codigo-de-cores` |
| 3. Circuitos | `circuitos`, `circuitos-rl-rc`, `ressonancia-e-fator-q`, `amplificadores-operacionais` |
| 4. Receptores | `recetores` |
| 5. Emissores | `emissores` |
| 6. Antenas e linhas de transmissão | `antenas` |
| 7. Propagação | `propagacao` |
| 8. Medidas | `medidas`, `figuras-de-lissajous` |
| 9. Interferências e imunidade | `interferencias` |
| 10. Segurança | `seguranca` |
| b) Regras de operação | `alfabeto-fonetico`, `codigo-q`, `abreviaturas-de-operacao`, `prefixos-ic` |
| c) Regulamentação | `definicoes`, `entidades` (ver também `docs/alteracoes-legislacao.md`) |

**Lacunas encontradas na comparação.** Três delas foram escritas a partir das
perguntas que o banco já tinha sobre o assunto (2026-09-24):

- **1.1 Leis de Kirchhoff** → `leis-de-kirchhoff`, cat 2 e 1
- **3.7 PLL** → `malha-de-captura-de-fase`, cat 2 e 1
- **1.10 / 3.8 DSP** → `processamento-digital-de-sinal`, cat 3 e 1. Não confundir
  com `modos-digitais-e-fec`, que trata dos modos digitais, não do processamento
  de sinal
- **1.8 Sinais modulados** → `modulacao-am` (o que é modular, espectro AM,
  profundidade de modulação, classes de emissão UIT, modulação por impulsos),
  `banda-lateral-unica` (BLU/SSB e CW, e a convenção de banda lateral por faixa,
  que não estava em parte nenhuma) e `modulacao-de-frequencia` (desvio, índice,
  regra de Carson, limitador, FSK e PSK). Antes disto, as ~119 perguntas de
  modulação tinham como cobertura uma secção de `teoria-electrica-e-radio`
- **3.4 Amplificador** → `amplificadores-e-classes` (ganho, polarização, classes
  A/AB/B/C), cat 2 e 1, e `distorcao-e-intermodulacao` (o que a não linearidade
  faz ao sinal), cat 3, 2 e 1. O guia `amplificadores-operacionais`, que já
  existia, cobre só os op-amps

Continua em falta:

- **b) 6. Planos de banda da IARU** — só uma menção em `entidades`
- **Débito binário, débito de símbolos e largura de banda** (`cat1#25`, `#28`,
  `#29`) — não é um item isolado do programa, mas nenhuma página os cobre: caem
  entre `processamento-digital-de-sinal` e `modos-digitais-e-fec`

O programa CEPT é a recomendação, não a fonte do exame: quem define as questões
é a ANACOM. Uma lacuna aqui é um sinal para investigar, não um defeito provado —
confirma-se contra o banco (`bun run qbank topics --cat 1`) e contra as provas em
`public/exams/cat1/`.

Para contexto, as 414 perguntas de cat1 no banco distribuem-se assim, e o peso
não acompanha o programa — `circuitos`, `componentes` e `teoria` são 239 das 414,
enquanto `seguranca` (capítulo 10) tem **1** pergunta e `operacao` (parte b) tem
**4**:

```
circuitos 95 · componentes 80 · teoria 64 · antenas 41 · propagacao 38
medidas 28 · recetores 21 · interferencias 18 · emissores 13
regulamentacao 11 · operacao 4 · seguranca 1
```

---

## `cept-erc-report-32-novice.pdf` — ERC Report 32

*Amateur Radio Novice Examination Syllabus and Certificate*. 12 páginas, em
inglês, revisto em setembro de 2005. Descarregado de
<https://docdb.cept.org/download/2817>.

`sha256 a1d497b6fba59f8f10c0f95aa44cfcd58f70fc117756549316020d62decc7e6a`

É o programa do nível **Novice**, o irmão mais baixo do HAREC: nasceu porque
várias administrações acharam o T/R 61-02 demasiado exigente para uma licença
de entrada. O Anexo 2 tem o programa; o corpo do relatório tem o certificado e
os critérios do exame nacional.

### A descoberta: os guias seguem este programa, não o HAREC

A numeração das secções dos guias é a do ERC Report 32, verificável linha a
linha:

| Guia | Secções | Novice | HAREC |
| :--- | :--- | :--- | :--- |
| `teoria-electrica-e-radio` | 1.1 a 1.6 | 1.1 a 1.6 ✔ | 1.1 a 1.10 |
| `componentes` | 2.7 «Circuitos sintonizados» | 2.7 *Tuned circuits* ✔ | 2.7 *Miscellaneous* |
| `circuitos` | 3.1 Filtros, 3.2 Circuitos sintonizados | 3.1 *Filters* ✔ | 3.1 a 3.8 |
| `recetores` | 4.1 a 4.3 | 4.1 a 4.3 ✔ | 4.1 a 4.4 |
| `emissores` | 5.1 diagramas, 5.2 andares, 5.3 características | igual ✔ | 5.1 *Types*, e mais um |
| `antenas` | 6.1 tipos, 6.2 alimentação, 6.3 adaptação | igual ✔ | 6.2 *characteristics*, 6.3 *transmission lines* |
| `seguranca` | 10.1 corpo humano, 10.2 rede, 10.3 perigos, 10.4 trovoadas | igual ✔ | sem subsecções |

**Isto reenquadra a comparação com o HAREC feita em 2026-09-24.** As lacunas
encontradas nessa comparação (PLL, leis de Kirchhoff, DSP, classes de
amplificação, distorção e intermodulação, modulação em profundidade) são
exatamente o que o HAREC tem a mais do que o Novice: o capítulo 3 do Novice
tem **uma** secção, filtros, enquanto o do HAREC tem oito, e é lá que vivem o
amplificador (3.4), o oscilador (3.6), a PLL (3.7) e o DSP (3.8). Os guias não
estavam incompletos: estavam completos para o nível errado, o de Categoria 2.

Consequência prática: os guias novos escritos nesse dia são conteúdo de
**Categoria 1**, e é por isso que quase todos declaram `categories: [2, 1]` ou
`[1]`.

### A medição inversa: o Novice está coberto para a Categoria 2?

Feita em 2026-09-25, com `medir-novice.py` nesta pasta: sonda os 40 itens do
Anexo 2 por palavras-chave, mas só no texto dos guias que **declaram categoria
2**, que é o que um candidato dessa categoria vê quando filtra a biblioteca.

**Resultado: 40 de 40 itens com conteúdo.** Nenhuma matéria do Novice falta.
Vários itens estão cobertos muito acima do exigido, porque o mesmo texto serve
os três níveis: o Novice pede filtros «uso e aplicação apenas» e há oito guias
de circuitos; pede antenas «só construção física, direcionalidade e
polarização» e há ERP, EIRP e linhas de transmissão.

**O furo que a medição destapou não era de matéria, era de etiqueta.** A parte
c) do programa (Regulamento das Radiocomunicações da UIT, regulamentação CEPT,
lei nacional) só existe no guia `entidades`, e esse declarava `categories: [3]`.
Um candidato à Categoria 2 que filtrasse pela sua categoria perdia o único guia
que cobre um terço do seu programa. Corrigido: `entidades` e `getting-started`
passaram a `[3, 2, 1]`.

Duas armadilhas de quem repetir isto:

- **A sonda é de palavras, não de sentido.** Três itens deram falso negativo à
  primeira porque o texto usa outra forma da palavra: `componentes` escreve
  «dissipa potência», não «dissipação», e `seguranca` escreve «tensões
  elevadas», não «altas tensões». Confirme à mão tudo o que der em falta antes
  de escrever que falta
- **A medição é dos guias, não do banco.** Não diz nada sobre haver perguntas de
  categoria 2 sobre cada item; para esse lado existe `bun run qbank topics`

---

## `cept-ecc-rec-0506-novice.pdf` — Recomendação ECC (05)06

*CEPT Novice Radio Amateur Licence*. 10 páginas, edição 16 de fevereiro de
2024. Descarregado de <https://docdb.cept.org/download/4413>.

`sha256 30f2b55b5d3b30289b6e4ca847dbb3623435592512e99d2ad4a8e748615155d3`

Trata da licença, não do exame: define a «CEPT Novice Licence», as condições de
utilização no estrangeiro e, no **Anexo 2**, a tabela de equivalências. É de lá
que sai a linha que interessa a este projeto:

> Portugal — CS7 — 2 &nbsp;&nbsp; (Açores CS8, Madeira CS9)

Ou seja, a **Categoria 2 portuguesa é a licença Novice da CEPT**. Está aqui
porque é a fonte dessa afirmação; o programa de exame correspondente é o do
ERC Report 32, acima.
