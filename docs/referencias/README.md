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

---

## `anacom-anexo1-materias-exame.pdf` — Anexo 1 da ANACOM

*Matérias dos exames de aptidão para as categorias de amador 1, 2 e 3*, anexo
aos «Procedimentos aprovados pelo ICP-ANACOM». 13 páginas, criado em maio de
2009. Descarregado da página dos procedimentos
(<https://www.anacom.pt/render.jsp?contentId=954649>), ficheiro
`/streaming/ANEXO1.pdf?contentId=954743`.

`sha256 26404a001bcba8a67f66c070d941a9c333d6151c9bdf55f088d06f36610a9567`

**É esta a autoridade, não a CEPT.** Uma tabela item a item com três colunas,
uma por categoria, e um X na categoria mais baixa que exige a matéria,
cumulativo para cima porque a progressão é 3 → 2 → 1. Onde os documentos da
CEPT obrigam a inferir («cat 1 = HAREC, cat 2 = Novice»), este marca. A
verificação de que o X é cumulativo: «Leis de Kirchhoff» tem X só na coluna 1,
e as perguntas de Kirchhoff no banco são todas de cat 1.

Em vigor à data desta escrita, apesar da **Lei n.º 22/2026**: a página dos
procedimentos continua a ligar este anexo, e a nota da ANACOM sobre a lei nova
diz apenas que o quadro de 2009 se manteve **até** 25 de agosto de 2026, sem
anunciar matérias novas. Vale a pena reconfirmar antes de medir outra vez.

### Cobertura dos guias, medida contra este anexo (2026-09-25)

`medir-anexo1.py` nesta pasta: lê a tabela do PDF, atribui a categoria pela
coluna onde cai o X, e sonda os guias que declaram cada categoria.

| Categoria | Itens exigidos | Primeira medição | Depois de fechadas as lacunas |
| :--- | ---: | ---: | ---: |
| 3 | 46 | 46 (100%) | **46 (100%)** |
| 2 | 166 | 163 (98%) | **166 (100%)** |
| 1 | 295 | 288 (97%) | **295 (100%)** |

A primeira medição encontrou seis itens sem cobertura nenhuma, todos fora da
categoria 3, que já estava completa. Foram escritos no mesmo dia, como secções
dentro dos guias que já tratavam do capítulo, e não como guias novos: um guia de
duzentas palavras sobre válvulas seria a página mais fina do site.

| Item | Exigido desde | Onde ficou |
| :--- | :--- | :--- |
| 2.7 a) Conceito de válvula termoiónica | cat 2 | `componentes` § 2.8 |
| 7.2 a) Recomendação T/R 61-01 | cat 1 | `entidades`, «As recomendações que dão a licença» |
| 7.2 b) Recomendação ECC/REC (05)06 | cat 2 | a mesma secção |
| 7.2 d), e) Países não-CEPT que subscrevem as recomendações | cat 1 e 2 | a mesma secção |
| 6.3 r) Dispersão boreal (aurora) | cat 1 | `propagacao` § 7.6 |
| 6.3 s) Dispersão em meteoritos | cat 1 | `propagacao` § 7.6 |

Duas ironias que a medição deixou à vista: as recomendações em falta eram
precisamente os PDF que estão nesta pasta, e o `entidades` falava da CEPT sem
nunca nomear as recomendações que dão a licença.

**Uma armadilha de vocabulário, que custou uma afirmação errada:** o Anexo 1 diz
«dispersão em **meteoritos**» e o banco diz «dispersão de **meteoros**». Uma
procura por `meteorit` devolve zero e leva a escrever que o banco nunca
perguntou pelo assunto, quando tem `cat2#219` a perguntar a gama de frequências.
Procure pelas duas grafias.

**Cinco «faltas» eram falso negativo da sonda** e estão registadas em
`VERIFICADOS`, dentro do script, com o sítio onde a matéria está: separação de
antenas e TVI em `interferencias`, planos da IARU em `entidades`, mistura
recíproca em `malha-de-captura-de-fase`, potência de pico em
`amplificadores-e-classes`. A sonda é de palavras, não de sentido: confirme
sempre à mão antes de escrever que falta.

---

## `anacom-questoes-categoria3.pdf` — exemplos oficiais da categoria 3

*Exemplos de questões de exame de aptidão para a categoria 3*, 20 páginas, 91
questões, cerca de metade da base de exame. Descarregado de
`/streaming/QuestoesCategoria3.pdf?contentId=1383817`.

`sha256 a1cbb3f3012a86b7551289482affb7c89660206b22d8864c9a43d0ec5604acf8`

A análise pergunta a pergunta, e o que ela implica para o banco depois da Lei
22/2026, está em `docs/alteracoes-legislacao.md`, que até aqui só a citava por
ligação.

> **As ligações da ANACOM devolvem 403 a um `curl` simples.** É preciso um
> cabeçalho `User-Agent` de browser para as descarregar, e foi por isso que
> estes ficheiros passaram a estar guardados aqui em vez de referidos por URL.
