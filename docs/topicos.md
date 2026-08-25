# Matérias: acrescentar e reclassificar

A taxonomia vive num único ficheiro, `lib/config/topics.ts`. Mudar uma pergunta
de matéria é editar o campo `topic:` no ficheiro MDX dessa pergunta.

Estes são dois trabalhos diferentes, com riscos diferentes:

| | Onde se mexe | O que corre mal |
| --- | --- | --- |
| **Reclassificar perguntas** | `topic:` no MDX | um slug mal escrito falha **em silêncio** |
| **Acrescentar uma matéria** | `lib/config/topics.ts` | o TypeScript apanha os erros |

Para criar perguntas de raiz, ver [`novas-questoes.md`](novas-questoes.md).

## As 12 matérias atuais

| Slug | Capítulo | A partir de |
| --- | --- | --- |
| `teoria` | PARTE A / 1 | cat 3 |
| `componentes` | PARTE A / 2 | cat 3 |
| `circuitos` | PARTE A / 3 | cat 2 |
| `recetores` | PARTE A / 4 | cat 2 |
| `emissores` | PARTE A / 5 | cat 2 |
| `antenas` | PARTE A / 6 | cat 2 |
| `propagacao` | PARTE A / 7 | cat 2 |
| `medidas` | PARTE A / 8 | cat 2 |
| `interferencias` | PARTE A / 9 | cat 3 |
| `seguranca` | PARTE A / 10 | cat 3 |
| `operacao` | PARTE B | cat 3 |
| `regulamentacao` | PARTE C | cat 3 |

Para ver a distribuição atual:

```bash
bun run qbank topics
```

---

# Parte 1 — Mudar perguntas de matéria

## Encontrar as perguntas

```bash
bun run qbank topics                  # distribuição por matéria e categoria
bun run qbank search "dipolo"         # por texto
bun run qbank dupes                   # grupos que discordam na matéria
```

O `dupes` é útil aqui por uma razão específica: **12 grupos de perguntas
duplicadas estão classificados em matérias diferentes**. A mesma pergunta em
cat 1 e cat 3 com `topic` diferente é, quase sempre, uma das duas errada.

## Fazer a mudança

Editar o campo no ficheiro de origem e recompilar:

```diff
-topic: circuitos
+topic: antenas
```

```bash
bun run content:build
```

O `topic` da origem é publicado como `materia` em `public/data/cat{n}.json` — é
a mesma coisa com dois nomes, herdados do formato antigo. **Não editar o JSON**;
é gerado.

## ⚠️ Um slug mal escrito não dá erro nenhum

Este é o risco todo desta operação. O schema tipa `topic` como texto livre
(`lib/content/schema.ts:81`), por isso um engano ortográfico:

```yaml
topic: antena      # falta o "s"
```

…compila sem uma única queixa:

```
$ bun run content:build
content build complete — 1 of 759 artifacts written
$ bun run content:check
content check passed — 759 artifacts match their source
```

E depois falha onde ninguém está a olhar: `topicShortLabel` devolve `null`, o
cartão da pergunta deixa de mostrar a etiqueta, e o filtro do browse ignora
aquela pergunta. Nenhum erro, nenhum aviso — a pergunta apenas desaparece do
filtro.

**A única coisa que apanha isto é o `qbank`:**

```bash
$ bun run qbank topics
1 question(s) with a topic that is not a slug in lib/config/topics.ts:
  cat3#167 = antena  content/questions/cat3/0167.mdx:4
```

Executar sempre depois de reclassificar seja o que for.

## Onde encaixa cada pergunta

O `lib/config/topics.ts` traz, em cada matéria, dois campos escritos
precisamente para esta decisão:

- **`scope`** — o que pertence ali
- **`boundary`** — o critério de desempate contra a matéria com que mais se
  confunde

São regras, não opiniões, e existem porque sem elas duas passagens pelo mesmo
banco classificam de maneira diferente. Exemplos reais do ficheiro:

> **teoria vs componentes** — "Uma grandeza ou um princípio físico pertence
> aqui; um objeto que se compra pertence a componentes."

> **componentes vs circuitos** — "Um componente sozinho, e as suas
> características, pertence aqui. Vários componentes combinados para
> desempenhar uma função pertencem a circuitos."

> **regulamentação** — "Se a resposta muda quando a lei muda, é
> regulamentação."

Se uma pergunta obriga a inventar um critério novo, esse critério deve ser
escrito no `boundary` da matéria, senão perde-se.

## Verificar

```bash
bun run content:check                 # os artefactos batem certo com a origem
bun run qbank topics                  # nenhum slug inválido, distribuição sã
bun run qbank dupes --tier typo       # duplicados continuam coerentes
```

---

# Parte 2 — Acrescentar uma matéria

## Primeiro: é mesmo preciso?

As 12 matérias **não são etiquetas arbitrárias** — são os capítulos do programa
oficial: PARTE A capítulos 1 a 10, PARTE B (operação) e PARTE C
(regulamentação), do Anexo 1 da ANACOM e dos relatórios CEPT correspondentes.
Estão todas representadas.

Por isso uma 13.ª matéria não tem `ceptRef` nem `anacomRef` honestos para
apontar — e esses campos são obrigatórios justamente para forçar esta pergunta.

Antes de acrescentar, considerar:

- **Dividir uma matéria grande?** A `teoria` tem 232 perguntas (23% do banco).
  Se o objetivo é tornar o filtro mais útil, uma subdivisão mantém a
  correspondência com o programa; uma matéria nova quebra-a.
- **Matéria realmente nova?** Se a ANACOM passar a examinar algo que o Anexo 1
  não cobre, então sim — e nesse caso os campos de referência devem dizê-lo
  explicitamente.

## O que editar

**Só `lib/config/topics.ts`.** Confirmado por ensaio: acrescentar uma matéria e
correr `type-check`, `test` e `content:build` passa sem tocar em mais nada.

Duas alterações no mesmo ficheiro:

### 1. O tipo `TopicSlug`

```diff
   | 'operacao' | 'regulamentacao';
+  | 'operacao' | 'regulamentacao' | 'satelite';
```

### 2. A entrada em `TOPICS`

```ts
{
  slug: 'satelite', ceptRef: '—',
  anacomRef: '— (matéria fora do Anexo 1)', examinedFrom: '2',
  pt: 'Serviço de amador por satélite',
  en: 'Amateur satellite service',
  shortPt: 'Satélite', shortEn: 'Satellite',
  scope: 'O que pertence a esta matéria.',
  boundary: 'Critério de desempate contra a matéria vizinha.',
},
```

Repare-se nos dois primeiros campos. Os capítulos 1 a 10 já estão todos
ocupados — o 8 é `medidas` — por isso uma matéria nova não pode reclamar um
número de capítulo sem passar a mentir sobre a sua origem. Preencher com `—` e
dizer porquê é a forma honesta; é para isto que os campos são obrigatórios.

| Campo | Obrigatório | Para que serve |
| --- | --- | --- |
| `slug` | sim | identificador usado no `topic:` das perguntas |
| `ceptRef` | sim | capítulo tal como impresso no ERC 32 / T/R 61-02 |
| `anacomRef` | sim | capítulo tal como impresso no Anexo 1 |
| `examinedFrom` | sim | categoria mais baixa em que é examinável (**indicativo**) |
| `pt` / `en` | sim | título completo, comprimento de página de referência |
| `shortPt` / `shortEn` | sim | etiqueta do cartão — tem de caber num *chip* |
| `scope` | sim | o que pertence aqui |
| `boundary` | não | desempate contra a matéria vizinha |

Notas sobre dois deles:

- **`shortPt`/`shortEn` são escritos à mão, não derivados.** "Regulamentação
  nacional e internacional relevante para os serviços de amador e amador por
  satélite" é um cabeçalho, não uma etiqueta, e cortar com CSS daria
  "Regulamentação nacional e intern…".
- **`examinedFrom` é indicativo, não uma restrição.** O Anexo 1 é de 2009 e a
  prática mudou: seis perguntas do banco de cat 3 estão em capítulos marcados
  "a partir da categoria 2" e vêm de provas reais de cat 3 de 2023. Uma
  divergência merece um segundo olhar, nunca é um erro por si só.

## Não é preciso mexer em mais nada

Tudo o resto é derivado automaticamente da lista `TOPICS`:

| Derivado | Onde |
| --- | --- |
| `TOPIC_BY_SLUG`, `TOPIC_SLUGS` | `lib/config/topics.ts` |
| `isTopicSlug()` | validação do parâmetro do browse |
| `ABOVE_ENTRY_LEVEL` | calculado a partir de `examinedFrom` |
| `topicShortLabel()` | etiqueta do cartão, por idioma |
| Filtros do browse | `QuestionFilters.tsx` percorre `TOPICS` |

Em particular:

- **Não há chaves de i18n a acrescentar.** Os títulos vivem na própria entrada
  (`pt`, `en`, `shortPt`, `shortEn`), não em `messages/*.json`.
- **Não há acoplamento aos guias de estudo.** O campo `tutorial` das perguntas é
  independente da matéria.
- **Nenhum teste fixa o número de matérias.** Os testes usam slugs concretos,
  que sobrevivem a uma adição.

## Se faltar metade

Acrescentar à lista `TOPICS` sem acrescentar ao tipo `TopicSlug` **dá erro de
compilação** — este é o caso feliz, porque é barulhento:

```
lib/config/topics.ts(183,5): error TS2322:
  Type '"satelite"' is not assignable to type 'TopicSlug'.
```

O contrário — slug no tipo mas sem entrada em `TOPICS` — compila, e a matéria
simplesmente não existe em lado nenhum: não aparece nos filtros e
`topicShortLabel` devolve `null` para ela. Mesmo sintoma silencioso do slug mal
escrito.

## Verificar

```bash
bun run type-check    # apanha tipo e lista dessincronizados
bun run lint
bun run test
bun run qbank topics  # a matéria nova aparece assim que tiver perguntas
```

Uma matéria sem perguntas **não aparece** na distribuição do `qbank topics` — a
tabela é construída a partir das perguntas existentes, não da lista de matérias.
Não é sinal de erro.

## Lista de verificação

**Reclassificar perguntas**

- [ ] `topic:` alterado no ficheiro MDX de origem, não no JSON
- [ ] A decisão respeita o `scope`/`boundary` da matéria de destino
- [ ] `bun run content:build` executado e artefactos incluídos no commit
- [ ] `bun run qbank topics` não reporta slugs inválidos
- [ ] Se o critério foi novo, ficou escrito no `boundary`

**Acrescentar uma matéria**

- [ ] Verificado que não é antes uma subdivisão de uma matéria existente
- [ ] `ceptRef` e `anacomRef` apontam para capítulos que existem mesmo
- [ ] Slug acrescentado **ao tipo `TopicSlug` e à lista `TOPICS`**
- [ ] `shortPt`/`shortEn` cabem numa etiqueta de cartão
- [ ] `scope` preenchido; `boundary` escrito se houver confusão possível
- [ ] `type-check`, `lint` e `test` passam
