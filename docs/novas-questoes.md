# Adicionar perguntas ao banco de questões

A fonte de verdade é `content/questions/cat{n}/` — **um ficheiro MDX por
pergunta**, com os campos estruturados no frontmatter YAML e a explicação no
corpo do documento. Tudo o resto é gerado a partir daí.

Há duas maneiras de acrescentar uma: com a ferramenta, ou à mão. A ferramenta é a
recomendada — faz as mesmas alterações e verifica, **antes de escrever**, o que
mais nada no projeto verifica. O resto do documento descreve o formato que ela
escreve, e continua a valer para quem edite os ficheiros diretamente.

# A ferramenta: `bun run content:new`

```bash
bun run content:new                                  # interativo, campo a campo
bun run content:new --from rascunho.mdx              # a partir de um ficheiro
bun run content:new --from rascunho.mdx --dry-run    # mostra o que escreveria
```

Escreve os quatro ficheiros de uma vez — a pergunta, a linha do `order` e os
dois artefactos gerados — e deixa a árvore no estado que o `content:check`
espera.

O rascunho do `--from` é **um ficheiro de pergunta com o `id` omitido**: o
mesmo formato do destino, para não haver um segundo formato a aprender e para
que um rascunho rejeitado se corrija e volte a submeter tal como está. A
categoria vem de `--cat 3` ou de um `category: 3` no frontmatter, que é
descartado ao escrever. Com `--from -` lê do stdin.

O `id` não se escolhe: é o máximo atual mais um, nunca uma lacuna abaixo dele
(a razão está em [§1](#1-escolher-a-categoria-e-o-id)).

## O que verifica antes de escrever

| Verificação | O que mais apanha isto |
| --- | --- |
| `topic` fora da taxonomia | **nada** — falha em silêncio para sempre |
| contradiz uma pergunta noutra categoria | `qbank dupes`, se alguém se lembrar de o correr |
| enunciado quase igual a outro, ou invertido | `qbank pairs`, idem |
| `page` igual ao número da pergunta | nada |
| `id` já usado | nada — mas é atribuído automaticamente |
| duas opções com o mesmo texto | `qbank answers` |
| PDF de `sources` que não existe | `content:check`, já depois de escrito |
| imagem que não existe | `content:check`, já depois de escrito |
| sem explicação, sem fonte, sem matéria, matéria acima do nível | avisos |

Os **erros** impedem a escrita. Os **avisos** pedem confirmação, porque um
duplicado não é automaticamente um defeito — a mesma pergunta de regulamentação
é legitimamente examinada nos três níveis. `--force` escreve apesar dos avisos;
`--yes` responde sim a todas as perguntas, e é obrigatório quando o stdin é um
pipe.

A matéria é escolhida de uma lista, não escrita: um slug mal escrito passa em
todos os outros lados e depois não mostra etiqueta nenhuma, por isso aqui é
impossível de representar em vez de meramente detetável.

## A posição no `order`

É a única decisão que a ferramenta não toma — a ordem é temática, não numérica.
No modo interativo mostra a vizinhança (as últimas perguntas da mesma matéria,
com a posição de cada uma) e pergunta depois de que `id` inserir; Enter põe no
fim. Sem terminal usa-se `--after 107`, `--before 108` ou `--end`.

# Fazer à mão

O que se segue é o que a ferramenta faz — o formato dos ficheiros e a ordem
das alterações. São dois ficheiros a editar.

## Antes de começar: a pergunta já existe?

O banco tem 1016 perguntas e muitas repetem-se legitimamente entre categorias.
Vale sempre a pena procurar primeiro:

```bash
bun run qbank search "carga artificial"     # procura no enunciado, opções e explicação
bun run qbank search "toróide" --cat 1      # restringe a uma categoria
```

A procura ignora acentos e maiúsculas, por isso `propagacao` encontra
"propagação". Guia completo do `qbank` em [`qbank.md`](qbank.md).

O `content:new` faz esta comparação sozinho, contra as três categorias, antes
de escrever seja o que for.

## O que muda, e o que é gerado

| Ficheiro | Quem escreve |
| --- | --- |
| `content/questions/cat{n}/{id}.mdx` | **você** — a pergunta |
| `content/questions/cat{n}/category.json` | **você** — uma linha no `order` |
| `public/data/cat{n}.json` | gerado por `content:build` |
| `content/notes/cat{n}/{id}.mdx` | gerado por `content:build` |

**Nunca editar à mão os dois últimos.** O `content:check` recompila a partir da
origem e falha se um artefacto tiver sido alterado, e está ligado ao
`bun run build` (`package.json:8`), por isso uma edição manual parte a
compilação.

O commit [#31](https://github.com/RadioEscola-pt/radioescola/pull/31) é o
exemplo real: adicionou uma pergunta e tocou exatamente nestes quatro ficheiros.

## 1. Escolher a categoria e o `id`

As categorias são `3` (iniciado), `2` e `1` (avançado) — a progressão
portuguesa de licenciamento, por isso a ordem habitual é 3 → 2 → 1.

O `id` é único **dentro da categoria**, não em todo o banco. A regra é usar o
**máximo atual mais um**:

| Categoria | Perguntas | `id` mais alto | Próximo `id` |
| --- | --- | --- | --- |
| cat3 | 209 | 213 | 214 |
| cat2 | 418 | 422 | 423 |
| cat1 | 389 | 390 | 391 |

Há lacunas na numeração — `id` 352 em cat1, por exemplo, está livre. **Não se
reaproveitam.** A razão está no commit que adicionou a última pergunta:

> Given id 390 rather than 352, the one free slot below the maximum: recycling a
> retired id would silently change the meaning of any stale reference to it.

Uma ligação antiga para `cat1#352` passaria a mostrar uma pergunta diferente,
sem erro nenhum.

Para confirmar o máximo atual antes de escolher:

```bash
python3 -c "import json;print(max(json.load(open('content/questions/cat3/category.json'))['order']))"
```

## 2. Criar o ficheiro da pergunta

O nome do ficheiro é o `id` **preenchido com zeros até quatro dígitos**:
`id: 390` → `0390.mdx` (`lib/content/source.ts:19-21`). O `id` no frontmatter
tem de coincidir com o nome do ficheiro, ou a compilação falha.

```yaml
---
id: 390
question: Num amplificador de classe AB
answers:
  - text: o transístor conduz durante menos de meio período
  - text: o transístor conduz durante meio período
  - text: o transístor conduz durante mais de meio período
    correct: true
  - text: o transístor conduz durante todo o período
topic: circuitos
---
Num amplificador de classe AB, **o transístor conduz durante mais de meio
período**, mas não durante o período completo.

A classe de funcionamento é definida pelo ângulo de condução…
```

### Campos do frontmatter

| Campo | Tipo | Obrigatório | Se omitido |
| --- | --- | --- | --- |
| `id` | inteiro positivo | **sim** | erro |
| `question` | texto não vazio | **sim** | erro |
| `answers` | lista, mínimo 2 | **sim** | erro |
| `topic` | slug da taxonomia | não | `null` |
| `sources` | lista de referências | não | `[]` |
| `image` | caminho relativo a `public/` | não | `null` |
| `tutorial` | slug de um guia de estudo | não | `null` |
| `calc` | código de calculadora | não | `null` |

O texto é sempre aparado (`trim`), e uma cadeia vazia num campo opcional é
tratada como `null` (`lib/content/schema.ts:22,30-37`).

### As respostas

Cada resposta é `- text: …`, e a certa leva `correct: true` por baixo. As
erradas não levam nada — o valor por omissão é `false`. **Tem de haver
exatamente uma correta**, senão:

```
question 214 must have exactly one correct answer, found 2
```

O schema aceita a partir de duas opções, mas **as 1016 perguntas do banco têm
todas exatamente quatro**, tal como as provas oficiais — convém não abrir
exceção. Não se escreve índice nenhum: o `correctIndex` (base 0) é calculado na
compilação a partir do `correct: true`.

### A explicação

É o corpo MDX, tudo o que vem depois do `---` de fecho. Um corpo vazio significa
"ainda sem explicação" e é perfeitamente válido — 260 perguntas estão assim.
Aceita Markdown, incluindo `**negrito**` e `<img>`.

## 3. Campos opcionais

### `topic` — a matéria

Um dos 12 slugs de `lib/config/topics.ts`: `teoria`, `componentes`, `circuitos`,
`recetores`, `emissores`, `antenas`, `propagacao`, `medidas`, `interferencias`,
`seguranca`, `operacao`, `regulamentacao`. Correspondem aos capítulos do
programa CEPT/ANACOM.

⚠️ **O schema não valida este campo** — é texto livre. Um slug mal escrito passa
no `content:check` e depois falha *de forma silenciosa*: a etiqueta não aparece
no cartão e o filtro do browse ignora a pergunta. Confirmar sempre com:

```bash
bun run qbank topics    # lista os inválidos e os sem etiqueta
```

### `sources` — a prova oficial

```yaml
sources:
  - pdf: cat3/2023_08_18
    question: 29
    page: 9
  - pdf: cat3/2023_09_21
    question: 35
```

- `pdf` — pasta e nome do ficheiro sob `public/exams/`, sem extensão
- `question` — o número da **pergunta impresso na prova**
- `page` — a **página do PDF**. Omite-se enquanto não for conhecida; nunca se
  escreve `page: null`

⚠️ **`question` e `page` são números diferentes e sem relação.** As provas têm
cerca de quatro perguntas por página, por isso a pergunta 29 está na página 9.
Usar o número da pergunta como página é o erro mais fácil de cometer aqui.

Citar a mesma prova e a mesma pergunta duas vezes é rejeitado:

```
question 214 cites cat3/2023_08_18 pergunta 29 more than once
```

### `image` — figuras

No ficheiro de origem o caminho é **relativo a `public/`, sem barra inicial**:

```yaml
image: images/cat3/sinusoidal.png
```

O compilador reescreve-o para `/images/cat3/sinusoidal.png` no JSON publicado,
sob a chave `img`. Nos componentes usa-se `question.img` diretamente — não se
volta a prefixar.

O ficheiro tem de existir em `public/images/cat{n}/`, senão a compilação
**falha**. Isto vale também para `<img src>` dentro da explicação.

### `tutorial` e `calc`

`tutorial` liga a pergunta a um guia de estudo pelo slug (ex.: `codigo-q`);
`calc` associa uma calculadora (`OHMCALC`, `COPADDER`). Ambos opcionais e não
validados pelo schema — um valor desconhecido simplesmente não mostra nada.

## 4. Inserir no `category.json`

O manifesto tem três campos: `id`, `anacomFile` e `order`. Só o `order` muda.

```diff
     106,
     107,
     108,
+    390,
     109,
```

**A ordem é editorial, não numérica.** Em cat3 as perguntas 210-213 estão nas
posições 8, 10, 19 e 31, agrupadas por assunto, e é esta sequência que o
utilizador vê ao navegar. O `id` novo entra onde a pergunta faz sentido
tematicamente, não no fim.

É por isso que o `order` vive num manifesto: inserir uma pergunta é uma
alteração de uma linha, em vez de renumerar todos os ficheiros seguintes.

A validação é feita nos dois sentidos. Ficheiro sem entrada no `order`:

```
content/questions/cat3: manifest and files disagree
  file but not in order: 214
```

Entrada no `order` sem ficheiro:

```
content/questions/cat3: manifest and files disagree
  in order but no file: 214
```

E ids repetidos: `content/questions/cat3: duplicate ids in order: 214`.

## 5. Compilar

```bash
bun run content:build
```

Gera `public/data/cat{n}.json` e `content/notes/cat{n}/{id}.mdx`. Repare-se que
**o ficheiro de notas não leva zeros à esquerda**: a origem é `0390.mdx`, a nota
gerada é `390.mdx`.

Na compilação acontecem as transformações que explicam porque não se edita o
JSON à mão:

| Origem | JSON publicado |
| --- | --- |
| `correct: true` numa resposta | `correctIndex` (base 0) |
| `topic` | `materia` |
| `image: images/…` | `img: /images/…` |
| corpo MDX presente | `hasNotesMdx: true` |
| `pdf` sem ficheiro em `public/exams/` | `unavailable: true` na referência |

Ambos os artefactos gerados têm de ser incluídos no commit.

## 6. Verificar

```bash
bun run content:check     # os artefactos correspondem à origem?
bun run qbank dupes --tier contradiction,typo   # criou um duplicado?
bun run build             # inclui o content:check
```

O `qbank dupes` é o que apanha uma pergunta que já existe noutra categoria com
uma resposta diferente — nada no schema consegue ver isso, porque cada ficheiro
é válido isoladamente.

## Erros comuns

| Mensagem | Causa | Solução |
| --- | --- | --- |
| `manifest and files disagree` / `file but not in order` | ficheiro criado, `order` não atualizado | acrescentar o `id` ao `order` |
| `manifest and files disagree` / `in order but no file` | `id` no `order` sem ficheiro | criar o ficheiro ou remover a entrada |
| `frontmatter id 214 does not match filename id 215` | nome do ficheiro e `id` divergem | corrigir um dos dois |
| `must have exactly one correct answer, found 2` | zero ou mais de um `correct: true` | deixar exatamente um |
| `cites … pergunta … more than once` | referência duplicada em `sources` | remover a repetida |
| `referenced image(s) missing from public/` | `image` aponta para ficheiro inexistente | acrescentar o ficheiro ou remover a referência |
| `References point at N exam PDF(s) that are not on disk` | `pdf` sem ficheiro em `public/exams/` | ver a secção seguinte |
| `content check failed … differs from compiled output` | artefacto gerado editado à mão, ou esquecimento do `content:build` | executar `bun run content:build` |

## Citar uma prova que não está no repositório

Se o `sources[].pdf` apontar para um PDF ausente de `public/exams/`, a
compilação **falha**. Há três saídas, por ordem de preferência:

1. Acrescentar o PDF em `public/exams/cat{n}/`, com o nome no formato
   `AAAA_MM_DD.pdf` (usa-se `00` para componentes desconhecidos, ex.:
   `2023_08_00.pdf`)
2. Corrigir o prefixo — a mensagem de erro diz se o mesmo ficheiro existe noutra
   pasta de categoria, que é a causa mais frequente
3. Se a prova é genuinamente inacessível, acrescentar a entrada a
   `content/missing-exams.json`

Esta última é a última opção, não a primeira. A política está escrita no próprio
ficheiro:

> This is a ratchet, not a permission slip: content:check fails on any dangling
> reference NOT listed here, and reports entries that have become unnecessary so
> they can be removed. **Shrink it, never grow it.**

### Resolver as páginas

O campo `page` fica por preencher até alguém o resolver — 1080 das 1253
referências ainda estão assim. Duas ferramentas ajudam:

- `bun run data:ocr-exams` — faz OCR das provas digitalizadas e propõe páginas.
  Precisa de `poppler` e `tesseract` (e de `tesseract-data-por` para o texto
  acentuado). Com `--apply` preenche o `page` de referências **já existentes**
- `bun run data:fonte-pages` — o equivalente manual: abre o PDF e pergunta a
  página, uma referência de cada vez

Nenhuma das duas inventa entradas em `sources`. O motivo está no código do
script de OCR:

> `--apply` never invents a new `sources` entry, because that would require
> trusting an OCR'd question number.

Ler o número da pergunta na digitalização é a parte menos fiável do processo
(`39` lido como `35`), por isso referências novas são apenas propostas no
relatório, para confirmação humana.

## Lista de verificação

Com `bun run content:new`, os primeiros seis pontos são a própria ferramenta;
sobram o último e a decisão da posição no `order`.

- [ ] Procurei com `qbank search` e a pergunta ainda não existe
- [ ] `id` = máximo atual + 1, sem reaproveitar lacunas
- [ ] Nome do ficheiro com quatro dígitos e igual ao `id` do frontmatter
- [ ] Exatamente uma resposta com `correct: true`
- [ ] `topic` é um dos 12 slugs válidos (confirmado com `qbank topics`)
- [ ] `sources` distingue o número da pergunta da página do PDF
- [ ] `id` inserido no `order` do `category.json`, na posição temática certa
- [ ] `bun run content:build` executado e artefactos gerados incluídos no commit
- [ ] `bun run content:check` e `bun run qbank dupes` passam
