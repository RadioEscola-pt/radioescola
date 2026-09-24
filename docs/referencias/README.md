# Referências externas

Documentos oficiais guardados aqui para consulta enquanto se escreve conteúdo.
**Não são servidos pelo site** — nada em `docs/` é publicado, e estes ficheiros
não estão ligados a partir de nenhuma página. Se algum dia forem precisos no
site, têm de ser copiados para `public/`.

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
Categoria 1 — é a referência contra a qual se verifica se falta matéria.

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
