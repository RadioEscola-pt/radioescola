# qbank

*[English](#qbank) · [Português](#qbank-em-português)*

A read-only developer tool for inspecting the question bank.

```
bun run qbank <command> [args] [--cat 3,2] [--limit N] [--json]
```

It reads `content/questions/**` directly — the MDX sources, not
`public/data/cat{n}.json`. That is the whole point: a finding has to name the
file you would edit, and the JSON is a build artifact that goes stale between
`content:build` runs.

## Why it exists

`content:check` already validates every question file and verifies the shipped
artifacts match their source. It works one file at a time, which is exactly
right for a build gate — and it is structurally blind to the problem that
matters most in a bank of 1,016 transcribed exam questions:

> Two files that are each perfectly valid, and disagree with each other.

Nothing in the schema can catch a question that appears in cat 1 and cat 3 with
a different correct answer, or an option transcribed as "fero" in one copy and
"ferro" in another, or two questions both claiming to be pergunta 17 of the same
paper. Each file passes on its own. Only comparing them finds it.

```
content/questions/**/*.mdx
        │
        ├─ content:check ──▶ is each file valid?           (a build gate, in CI)
        │
        └─ qbank ─────────▶ do the files agree with each   (a tool you run
                            other, and with the papers?     when you are
                                                            editing content)
```

`qbank` is deliberately **not** wired into CI. Duplicating the per-file rules
here would create a second source of truth that drifts from the first, and most
of what it reports needs an editorial judgement rather than a pass/fail — a
duplicate question is often entirely legitimate.

## Commands

| Command | What it answers |
| --- | --- |
| `search <term>` | Which questions mention this? |
| `show <ref…>` | What is this question, and what else looks like it? |
| `dupes` | Which questions duplicate each other, and do they agree? |
| `pairs` | Which questions are *nearly* the same, and which are traps? |
| `coverage` | What is missing — sources, pages, explanations, images? |
| `topics` | How is the taxonomy distributed, and what is misfiled? |
| `paper [pdf]` | What cites this exam paper, and what is unclaimed? |
| `answers` | Is the bank guessable? Are any options malformed? |

Global flags: `--cat 3,2` to restrict categories, `--limit N` for how many
findings to print, `--json` for machine-readable output.

A question is addressed as `cat3#12`; `3#12` and `cat3/12` also parse.

## search and show

```
$ bun run qbank search "carga artificial"
5 question(s) matching carga artificial

cat3#93  Medições  content/questions/cat3/0093.mdx:4
  Porque se deve utilizar uma carga artificial quando estamos a testar um emissor?
   · Para diminuir de forma significativa o consumo de energia
   ✓ Para evitar que eventuais emissões espúrias do emissor em teste sejam radiadas…
  no sources
```

Matching folds accents and case, so `propagacao` finds "propagação" and
`electrico` finds "eléctrico" — the bank mixes pre- and post-1990 orthography
and neither spelling should be a dead end. `--field stem|options|explanation`
narrows the search; `--regex` switches to a regular expression.

Every result carries `file:line`, which is clickable in most terminals. Long
stems are written as YAML folded scalars and wrap across lines, so the lookup
falls back to shortening prefixes until it finds the line the question starts
on.

`show` prints one question in full with its explanation, and — the useful part —
inlines every duplicate group it belongs to, with the fields those group members
disagree on.

## dupes

The core command. As of August 2026:

```
126 group(s): 4 typo, 33 divergent, 64 shared-answers, 25 exact
```

**A duplicate is not automatically a defect.** The same regulatory question is
legitimately examined at all three levels — 36 of those groups span categories —
so the tool classifies rather than condemns. Tiers are ordered by how likely
they are to be a real bug:

| Tier | Means | Read as |
| --- | --- | --- |
| `contradiction` | Same question, same options, **disagreeing on which is correct** | One of them is simply wrong |
| `typo` | Same question, options differ below an edit-distance threshold | Usually a transcription slip; sometimes a wording variant |
| `divergent` | Same stem, materially different options | A real variant, or a stem that needs disambiguating |
| `shared-answers` | Different stems over an identical option set | A rephrasing, or options pasted onto the wrong question |
| `exact` | Identical throughout | Benign across categories; redundant within one |

Beyond the tier, each group reports what its members disagree on. Across the
bank: 52 groups where one copy is sourced and its twin is not, 37 where one has
an explanation and the other does not, 12 that disagree on `topic`, 3 on
`image`, and 14 that differ only in accents, spacing or punctuation.

That first number is the most actionable thing in the report. A same-category
pair where one copy has no provenance is usually one question entered twice.

`--tier contradiction,typo` narrows to the tiers worth acting on.

## pairs

Fuzzy matching, for near-duplicates that share no exact key.

```
77 pair(s): 0 polarity flip, 77 near-stem
```

A **polarity flip** is two near-identical questions asking for opposite answers
— one wants the true statement, the other the false one. These are traps to
verify, never to merge, so they are reported as their own kind rather than
folded in with the duplicates.

The design constraint here is noise, and it is worth understanding before
loosening any threshold:

> "Qual das seguintes afirmações é incorreta?" is a template shared by dozens of
> unrelated questions, and its nearest neighbour by every string metric is "Qual
> das seguintes afirmações está correta?" — the *opposite* question.

So **every fuzzy finder also requires the answers to agree**, not just the stem.
Without that check the report was 248 pairs of unrelated questions that happen
to share a sentence pattern; with it, 77. Pairs already covered by a duplicate
group are suppressed too, since `dupes` says more about them — `--all` keeps
them.

Thresholds are `--stem-min` (default 0.7) and `--answer-min` (default 0.3), both
Jaccard over tokens.

## coverage

```
      total  sourced  refs  with page  explained  images  topic
cat3  209    60 29%   75    75 100%    209 100%   15      209 100%
cat2  418    317 76%  893   0 0%       158 38%    8       418 100%
cat1  389    194 50%  285   98 34%     389 100%   15      389 100%
all   1016   571 56%  1253  173 14%    756 74%    38      1016 100%
```

Reads as: 445 questions cite no exam paper at all, 1,080 of the 1,253 source
references still have no resolved `page` (`data:ocr-exams` is what chips at
that), and 260 questions have no explanation — every one of them in cat 2.

It also lists images on disk that no question references. Category covers are
excluded, since those are referenced from `lib/config/categories.ts` rather than
from a question. The reverse check — references with no file — belongs to
`content:check` and is not repeated here.

## topics

Distribution across the taxonomy in `lib/config/topics.ts`, plus three kinds of
outlier:

- **invalid** — `topic` set to something that is not a slug. Worth knowing
  because `schema.ts` types the field as free text, so a misspelled slug passes
  `content:check` and then fails *invisibly*: `topicShortLabel` returns null,
  the card renders no chip, and the browse filter ignores the question
- **untagged** — `topic: null`
- **above entry level** — 29 category 3 questions in a chapter ANACOM's Anexo 1
  marks as starting at category 2. Strictly advisory: the annex is from 2009 and
  real 2023 category 3 papers do examine antennas, receivers and propagation.
  See `examinedFrom` in `lib/config/topics.ts`

## paper

```
$ bun run qbank paper
36 paper(s) cited by the bank

cat1/2011_12_13           39 cited  39 with page  2 unclaimed  1 collisions
cat1/2014_12_19           37 cited   0 with page  4 unclaimed  3 collisions  PDF absent
```

Naming a paper lists its perguntas in order with the question that claims each
one, which is the view you want when working through a scan by hand.

Two things it surfaces that nothing else does. **Unclaimed** perguntas are gaps
between 1 and the highest number cited — either the question is not in the bank
yet, or it is there without a source reference. **Collisions** are two questions
both claiming the same pergunta of the same paper; at most one can be right, and
there are 50 across the bank.

## answers

Test-construction audit. The current numbers are healthy, which is worth keeping
as a regression baseline rather than a one-off check:

```
correct-answer position
  a   239  24%
  b   264  26%
  c   269  26%
  d   244  24%

longest option is correct  267/1016 (26%)   chance is about 25%
```

A spike in either would mean the bank is guessable without knowing the material.
It also reports options duplicated within one question and catch-all options
("todas as anteriores") that are not in last position.

## Normalisation, and where it bites

Three different comparison forms exist, and using the wrong one produces
confident nonsense:

| Form | Does | Used for |
| --- | --- | --- |
| `canonical()` | Folds case and accents, strips punctuation | Stems, similarity, grouping |
| `comparisonKey()` | `canonical()`, or raw text when that leaves nothing | Group keys |
| raw text | Whitespace collapsed only | Duplicate options within one question |

`canonical()` is built for prose. Applied to options it is actively wrong:
`10 dB` and `-10 dB` compare equal, so do `0,01 µF` and `0,01 F`, and Morse
answers (`. . . - - - . . .`) reduce to the empty string entirely — which would
make all four options of cat3 #109 identical to each other *and* to every other
telegraphy question in the bank. The first version of the duplicate-option check
reported 17 findings; 15 were false positives from exactly this. Both cases are
pinned by tests in `__tests__/unit/test-content-analysis.test.ts`.

Folding also drops accents but **not** the pre-1990 silent consonant, so
`directa` and `direta` stay distinct. That is deliberate: it surfaces a spelling
inconsistency as a `typo`-tier group instead of silently treating the two
spellings as the same string.

## The baseline ratchet

```
bun run qbank dupes --update-baseline   # accept everything currently reported
bun run qbank dupes --new               # show only what has appeared since
bun run qbank pairs --new
```

Same pattern as `content/missing-exams.json`, and for the same reason: a report
of 126 groups is read once and then ignored forever. `--new` against
`content/qbank-baseline.json` is the form that stays useful as the bank grows.

**No baseline is committed.** The findings currently in the bank are real and
unfixed, and baselining them now would mark them accepted. Write one when you
have triaged what is there. Shrink it when you fix something, rather than
letting it grow.

## Worked example

The three corrections in [#39](https://github.com/RadioEscola-pt/radioescola/pull/39)
came out of `dupes --tier typo`, which reported seven groups. Triaging them is
a fair picture of how the tool is meant to be used — it narrows, it does not
decide:

- **Three were real transcription errors**, each confirmed by reading the cited
  paper: `cat3#12` said "fundamenta**lmente e** discordância" where
  `cat3/2023_08_18` pergunta 29 says "fundamenta**damente a**"; `cat1#36` had
  "toróides de **fero**" in all four options; `cat1#210` said "Atinge **o**
  máximo" where the paper it cites says "**um** máximo"
- **One was likely but unverifiable** — its only source is the one paper listed
  in `content/missing-exams.json`
- **One had no arbiter** — both copies unsourced, each carrying its own defect
- **Two were not errors at all** — `de um edificio`/`dum edificio` and `No
  plano`/`Nos planos` are genuine wording differences between different papers

Note the second finding there: `cat1#210` is the *sourced* member of its pair and
diverges from the paper it cites, while its unsourced twin had it right. Being
sourced is not the same as being faithful.

The general shape: the `typo` tier is really "options differ below an
edit-distance threshold", which catches misspellings *and* minor rewordings. It
is a filter that turns 1,016 questions into seven worth reading, not a verdict.

## Where the code lives

| Path | What |
| --- | --- |
| `lib/content/analysis.ts` | Pure functions — normalisation, tiers, audits. No I/O |
| `scripts/qbank.ts` | CLI: argument handling, file lookup, formatting |
| `__tests__/unit/test-content-analysis.test.ts` | 23 tests over the parts that are easy to get wrong |

The split is what makes the finders testable without a fixture tree on disk. If
you add a check, put the logic in `analysis.ts` with a test and keep
`scripts/qbank.ts` to presentation.

---

# qbank em Português

*[English](#qbank) · [Português](#qbank-em-português)*

Uma ferramenta de leitura apenas, para programadores inspecionarem o banco de
perguntas.

```
bun run qbank <comando> [args] [--cat 3,2] [--limit N] [--json]
```

Lê diretamente `content/questions/**` — os ficheiros MDX de origem, não
`public/data/cat{n}.json`. É esse o objetivo: um resultado tem de indicar o
ficheiro que se vai editar, e o JSON é um artefacto de compilação que fica
desatualizado entre execuções de `content:build`.

## Porque existe

O `content:check` já valida cada ficheiro de pergunta e verifica se os
artefactos publicados correspondem à origem. Funciona um ficheiro de cada vez, o
que é exatamente o correto para um portão de compilação — e é estruturalmente
cego ao problema que mais importa num banco de 1016 perguntas de exame
transcritas:

> Dois ficheiros individualmente válidos, que discordam um do outro.

Nada no schema deteta uma pergunta que aparece na categoria 1 e na 3 com uma
resposta certa diferente, ou uma opção transcrita como "fero" numa cópia e
"ferro" noutra, ou duas perguntas a reclamarem ambas ser a pergunta 17 da mesma
prova. Cada ficheiro passa isoladamente. Só a comparação revela o problema.

```
content/questions/**/*.mdx
        │
        ├─ content:check ──▶ cada ficheiro é válido?        (portão de
        │                                                    compilação, no CI)
        │
        └─ qbank ─────────▶ os ficheiros concordam entre    (ferramenta que se
                            si, e com as provas?             corre ao editar
                                                             conteúdo)
```

O `qbank` **não** está ligado ao CI, deliberadamente. Duplicar aqui as regras
por ficheiro criaria uma segunda fonte de verdade que se afasta da primeira, e a
maior parte do que reporta exige um juízo editorial em vez de um passa/não
passa — uma pergunta duplicada é muitas vezes perfeitamente legítima.

## Comandos

| Comando | A que responde |
| --- | --- |
| `search <termo>` | Que perguntas mencionam isto? |
| `show <ref…>` | O que é esta pergunta, e o que se parece com ela? |
| `dupes` | Que perguntas se duplicam, e concordam entre si? |
| `pairs` | Que perguntas são *quase* iguais, e quais são armadilhas? |
| `coverage` | O que falta — fontes, páginas, explicações, imagens? |
| `topics` | Como está distribuída a taxonomia, e o que está mal classificado? |
| `paper [pdf]` | O que cita esta prova, e o que ficou por atribuir? |
| `answers` | O banco é adivinhável? Há opções malformadas? |

Opções globais: `--cat 3,2` para restringir categorias, `--limit N` para o
número de resultados a imprimir, `--json` para saída legível por máquina.

Uma pergunta identifica-se por `cat3#12`; `3#12` e `cat3/12` também são aceites.

## search e show

```
$ bun run qbank search "carga artificial"
5 question(s) matching carga artificial

cat3#93  Medições  content/questions/cat3/0093.mdx:4
  Porque se deve utilizar uma carga artificial quando estamos a testar um emissor?
   · Para diminuir de forma significativa o consumo de energia
   ✓ Para evitar que eventuais emissões espúrias do emissor em teste sejam radiadas…
  no sources
```

A correspondência ignora acentos e maiúsculas, por isso `propagacao` encontra
"propagação" e `electrico` encontra "eléctrico" — o banco mistura ortografia
anterior e posterior a 1990, e nenhuma das grafias deve ser um beco sem saída.
`--field stem|options|explanation` restringe a pesquisa; `--regex` passa a
expressão regular.

Cada resultado traz `ficheiro:linha`, clicável na maioria dos terminais. Os
enunciados longos são escritos como *folded scalars* de YAML e quebram em várias
linhas, por isso a procura recua para prefixos cada vez mais curtos até
encontrar a linha onde a pergunta começa.

O `show` imprime uma pergunta completa com a sua explicação e — o mais útil —
inclui todos os grupos de duplicados a que pertence, com os campos em que os
membros desses grupos discordam.

## dupes

O comando central. Em agosto de 2026:

```
126 group(s): 4 typo, 33 divergent, 64 shared-answers, 25 exact
```

**Um duplicado não é automaticamente um defeito.** A mesma pergunta
regulamentar é legitimamente examinada nas três categorias — 36 destes grupos
atravessam categorias — por isso a ferramenta classifica em vez de condenar. Os
níveis estão ordenados pela probabilidade de serem um erro real:

| Nível | Significa | Lê-se como |
| --- | --- | --- |
| `contradiction` | Mesma pergunta, mesmas opções, **a discordar sobre qual está certa** | Uma delas está simplesmente errada |
| `typo` | Mesma pergunta, opções que diferem abaixo de um limiar de distância de edição | Normalmente um lapso de transcrição; por vezes uma variante de redação |
| `divergent` | Mesmo enunciado, opções materialmente diferentes | Uma variante real, ou um enunciado que precisa de ser desambiguado |
| `shared-answers` | Enunciados diferentes sobre um conjunto de opções idêntico | Uma reformulação, ou opções coladas na pergunta errada |
| `exact` | Idênticas em tudo | Inofensivo entre categorias; redundante dentro da mesma |

Além do nível, cada grupo reporta em que é que os seus membros discordam. Em
todo o banco: 52 grupos em que uma cópia tem fonte e a gémea não, 37 em que uma
tem explicação e a outra não, 12 que discordam no `topic`, 3 na `image`, e 14
que diferem apenas em acentos, espaços ou pontuação.

Esse primeiro número é o mais acionável do relatório. Um par na mesma categoria
em que uma das cópias não tem proveniência é normalmente uma pergunta inserida
duas vezes.

`--tier contradiction,typo` restringe aos níveis que vale a pena tratar.

## pairs

Correspondência aproximada, para quase-duplicados que não partilham nenhuma
chave exata.

```
77 pair(s): 0 polarity flip, 77 near-stem
```

Uma **inversão de polaridade** (`polarity flip`) são duas perguntas quase
idênticas que pedem respostas opostas — uma quer a afirmação verdadeira, a
outra a falsa. São armadilhas a verificar, nunca a fundir, por isso são
reportadas como categoria própria em vez de misturadas com os duplicados.

A restrição de desenho aqui é o ruído, e vale a pena compreendê-la antes de
alargar qualquer limiar:

> "Qual das seguintes afirmações é incorreta?" é um modelo partilhado por
> dezenas de perguntas sem relação entre si, e o seu vizinho mais próximo por
> qualquer métrica de texto é "Qual das seguintes afirmações está correta?" — a
> pergunta *oposta*.

Por isso **todos os detetores aproximados exigem também que as respostas
concordem**, não apenas o enunciado. Sem essa verificação o relatório tinha 248
pares de perguntas sem relação que apenas partilham um padrão de frase; com ela,
77. Os pares já cobertos por um grupo de duplicados também são suprimidos, uma
vez que o `dupes` diz mais sobre eles — `--all` mantém-nos.

Os limiares são `--stem-min` (0,7 por omissão) e `--answer-min` (0,3), ambos
Jaccard sobre tokens.

## coverage

```
      total  sourced  refs  with page  explained  images  topic
cat3  209    60 29%   75    75 100%    209 100%   15      209 100%
cat2  418    317 76%  893   0 0%       158 38%    8       418 100%
cat1  389    194 50%  285   98 34%     389 100%   15      389 100%
all   1016   571 56%  1253  173 14%    756 74%    38      1016 100%
```

Lê-se: 445 perguntas não citam nenhuma prova, 1080 das 1253 referências de fonte
continuam sem `page` resolvida (é nisso que o `data:ocr-exams` vai trabalhando),
e 260 perguntas não têm explicação — todas elas na categoria 2.

Também lista imagens em disco que nenhuma pergunta referencia. As capas de
categoria ficam de fora, por serem referenciadas a partir de
`lib/config/categories.ts` e não de uma pergunta. A verificação inversa —
referências sem ficheiro — pertence ao `content:check` e não é repetida aqui.

## topics

Distribuição pela taxonomia de `lib/config/topics.ts`, mais três tipos de
anomalia:

- **inválido** — `topic` definido com algo que não é um slug. Vale a pena saber
  porque o `schema.ts` tipa o campo como texto livre, por isso um slug mal
  escrito passa no `content:check` e depois falha *de forma invisível*:
  `topicShortLabel` devolve null, o cartão não mostra etiqueta, e o filtro do
  browse ignora a pergunta
- **sem etiqueta** — `topic: null`
- **acima do nível de entrada** — 29 perguntas de categoria 3 num capítulo que o
  Anexo 1 da ANACOM marca como começando na categoria 2. Estritamente
  indicativo: o anexo é de 2009 e as provas reais de categoria 3 de 2023 examinam
  antenas, recetores e propagação. Ver `examinedFrom` em `lib/config/topics.ts`

## paper

```
$ bun run qbank paper
36 paper(s) cited by the bank

cat1/2011_12_13           39 cited  39 with page  2 unclaimed  1 collisions
cat1/2014_12_19           37 cited   0 with page  4 unclaimed  3 collisions  PDF absent
```

Indicar uma prova lista as suas perguntas por ordem, com a pergunta do banco que
reclama cada número — a vista que se quer quando se percorre um digitalizado à
mão.

Revela duas coisas que mais nada revela. As perguntas **por atribuir**
(`unclaimed`) são lacunas entre 1 e o número mais alto citado — ou a pergunta
ainda não está no banco, ou está lá sem referência de fonte. As **colisões** são
duas perguntas a reclamarem a mesma pergunta da mesma prova; no máximo uma pode
estar certa, e há 50 em todo o banco.

## answers

Auditoria à construção do teste. Os números atuais são saudáveis, o que vale
mais como linha de base contra regressões do que como verificação única:

```
correct-answer position
  a   239  24%
  b   264  26%
  c   269  26%
  d   244  24%

longest option is correct  267/1016 (26%)   chance is about 25%
```

Um pico em qualquer dos dois significaria que o banco é adivinhável sem saber a
matéria. Também reporta opções duplicadas dentro da mesma pergunta e opções
abrangentes ("todas as anteriores") que não estão em último lugar.

## Normalização, e onde ela morde

Existem três formas de comparação diferentes, e usar a errada produz disparates
convincentes:

| Forma | O que faz | Usada para |
| --- | --- | --- |
| `canonical()` | Ignora maiúsculas e acentos, remove pontuação | Enunciados, semelhança, agrupamento |
| `comparisonKey()` | `canonical()`, ou o texto cru quando aquele não deixa nada | Chaves de grupo |
| texto cru | Apenas espaços colapsados | Opções duplicadas dentro da mesma pergunta |

O `canonical()` foi feito para prosa. Aplicado a opções está ativamente errado:
`10 dB` e `-10 dB` ficam iguais, `0,01 µF` e `0,01 F` também, e as respostas em
Morse (`. . . - - - . . .`) reduzem-se por completo à cadeia vazia — o que
tornaria as quatro opções da cat3 #109 idênticas entre si *e* a todas as outras
perguntas de telegrafia do banco. A primeira versão da verificação de opções
duplicadas reportou 17 resultados; 15 eram falsos positivos exatamente por isto.
Ambos os casos estão fixados por testes em
`__tests__/unit/test-content-analysis.test.ts`.

A normalização remove os acentos mas **não** a consoante muda anterior a 1990,
por isso `directa` e `direta` mantêm-se distintas. Isso é deliberado: faz com
que uma inconsistência ortográfica apareça como um grupo de nível `typo`, em vez
de tratar silenciosamente as duas grafias como a mesma cadeia.

## A linha de base

```
bun run qbank dupes --update-baseline   # aceitar tudo o que está reportado
bun run qbank dupes --new               # mostrar só o que apareceu desde então
bun run qbank pairs --new
```

O mesmo padrão de `content/missing-exams.json`, e pela mesma razão: um relatório
de 126 grupos lê-se uma vez e depois é ignorado para sempre. O `--new` contra
`content/qbank-baseline.json` é a forma que se mantém útil à medida que o banco
cresce.

**Não há nenhuma linha de base no repositório.** Os resultados atualmente no
banco são reais e não corrigidos, e aceitá-los agora marcá-los-ia como
resolvidos. Cria-se uma quando o que lá está tiver sido triado. Encolhe-se
quando se corrige algo, em vez de a deixar crescer.

## Exemplo prático

As três correções do [#39](https://github.com/RadioEscola-pt/radioescola/pull/39)
saíram de `dupes --tier typo`, que reportou sete grupos. A triagem deles é um
retrato justo de como a ferramenta deve ser usada — ela restringe, não decide:

- **Três eram erros de transcrição reais**, cada um confirmado lendo a prova
  citada: a `cat3#12` dizia "fundamenta**lmente e** discordância" onde a
  `cat3/2023_08_18` pergunta 29 diz "fundamenta**damente a**"; a `cat1#36` tinha
  "toróides de **fero**" nas quatro opções; a `cat1#210` dizia "Atinge **o**
  máximo" onde a prova que cita diz "**um** máximo"
- **Um era provável mas não verificável** — a sua única fonte é a prova listada
  em `content/missing-exams.json`
- **Um não tinha árbitro** — ambas as cópias sem fonte, cada uma com o seu
  próprio defeito
- **Dois não eram erros de todo** — `de um edificio`/`dum edificio` e `No
  plano`/`Nos planos` são diferenças genuínas de redação entre provas diferentes

Repare-se no segundo caso: a `cat1#210` é o membro *com fonte* do seu par e
diverge da prova que cita, enquanto a gémea sem fonte estava certa. Ter fonte
não é o mesmo que ser fiel.

A forma geral: o nível `typo` é na verdade "opções que diferem abaixo de um
limiar de distância de edição", o que apanha erros ortográficos *e*
reformulações menores. É um filtro que transforma 1016 perguntas em sete que
vale a pena ler, não um veredicto.

## Onde está o código

| Caminho | O que é |
| --- | --- |
| `lib/content/analysis.ts` | Funções puras — normalização, níveis, auditorias. Sem I/O |
| `scripts/qbank.ts` | CLI: tratamento de argumentos, localização de ficheiros, formatação |
| `__tests__/unit/test-content-analysis.test.ts` | 23 testes sobre as partes fáceis de errar |

Esta separação é o que torna os detetores testáveis sem uma árvore de fixtures em
disco. Ao acrescentar uma verificação, ponha-se a lógica em `analysis.ts` com um
teste e deixe-se `scripts/qbank.ts` para a apresentação.
