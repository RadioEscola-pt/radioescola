# Alterar perguntas do banco de questões

Para **acrescentar** uma pergunta, veja [`novas-questoes.md`](novas-questoes.md).
Este documento é sobre mudar uma que já existe.

```bash
bun run content:edit cat3#86                     # interativo, campo a campo
bun run content:edit cat3#86 --editor            # o ficheiro inteiro no $EDITOR
bun run content:edit cat3#86 --from correcao.mdx # substitui a partir de um ficheiro
bun run content:edit --sem-explicacao --cat 2    # percorre a fila
bun run content:edit cat3#86 --disable "motivo"  # retira do site sem apagar
```

## Porque existe

Havia o `content:new` e não havia nada para o outro lado. Alterar uma pergunta
era abrir o MDX à mão: sem revisão de duplicados, sem escolha da matéria a
partir da lista, sem validação nenhuma até ao `content:build` seguinte.

Isso pesa sobretudo nas **260 perguntas sem explicação**, quase todas da
categoria 2 — a maior lacuna que resta no banco, e um trabalho inteiramente de
edição.

## O que faz por si

Cada gravação passa pela mesma revisão que o `content:new` corre:

- **duplicados e contradições** contra as três categorias — se a alteração
  fizer a pergunta colidir com outra, é dito antes de escrever
- **matéria escolhida de uma lista**, nunca escrita à mão
- **fontes verificadas** contra `public/exams/`
- **imagens verificadas** contra `public/`
- o **schema** — um campo inventado ou mal escrito dá erro com o nome do campo

E, ao gravar, escreve tudo o que a pergunta possui e recompila os artefactos da
categoria, deixando a árvore no estado que o `content:check` espera:

```
✓ cat3#86
  content/questions/cat3/0086.mdx
  content/questions/cat3/category.json
  public/data/cat3.json
  content/notes/cat3/86.mdx
```

Se a explicação for apagada, ou a pergunta desativada, a nota gerada é
**removida** — a `/api/notes` lê do disco sem consultar o banco e continuaria a
servi-la.

## O que **não** faz

**Não mexe na posição no `order`.** Mudar uma pergunta de lugar é uma decisão
editorial sobre a sequência de navegação, não uma alteração à pergunta. Para
isso veja onde a matéria vive e escolha os vizinhos:

```bash
bun run qbank order --cat 3 --topic regulamentacao
bun run qbank order --around cat3#161
```

e depois edite o `order` no `category.json` à mão. A validação é feita nos dois
sentidos, por isso um engano não passa despercebido.

## As alterações são mostradas antes de gravar

```
Alterações
  enunciado  Qua a validade das licenças de amador de uso comum?
             → Qual a validade das licenças de amador de uso comum?
```

As opções são comparadas uma a uma, e não em bloco: uma correção de uma palavra
na opção 3 lê-se como uma correção de uma palavra, não como quatro opções
reescritas.

Duas alterações aparecem **a vermelho** e pedem confirmação à parte:

| Alteração | Porquê |
| --- | --- |
| `resposta certa` | torna certa uma resposta que estava errada, para toda a gente que consulta |
| `desativada` | retira a pergunta do site inteiro |

A explicação é resumida em número de caracteres em vez de impressa — um corpo
de 2000 caracteres enterrava todas as outras linhas, e o editor já a mostrou.
Uma reescrita que por acaso mantenha o comprimento diz `(texto alterado)`, para
não se ler como se nada tivesse acontecido.

## Modos

### Interativo — campo a campo

```bash
bun run content:edit cat3#86
```

Um menu, não uma sequência fixa: quase todas as alterações mexem num campo só, e
percorrer todos para corrigir uma gralha no enunciado é o que leva as pessoas a
editar o MDX à mão.

```
O que alterar?
   1  enunciado      Qual a validade das licenças de amador de uso comum?
   2  opções         4 opções, certa: 3
   3  matéria        regulamentacao
   4  explicação     261 caracteres
   5  fontes         1 referência(s)
   6  imagem         sem imagem
   7  desativação    publicada
   8  terminar       rever e gravar
```

Pode alterar vários campos seguidos; a revisão e o resumo só acontecem no fim.

Nas **opções**, Enter mantém a que já lá está — só escreve as que quer mudar. A
opção correta atual aparece marcada `(atual)`.

Na **explicação**, abre o `$EDITOR` já com o texto que existe. Sem `$EDITOR`
definido, escreve-se no terminal e uma linha só com `=` mantém a atual.

### `--editor` — o ficheiro inteiro

```bash
bun run content:edit cat3#86 --editor
```

Abre o ficheiro no formato em que está guardado, com o frontmatter todo. É o
modo mais rápido para quem já conhece o formato, e o resultado é validado ao
gravar — ao contrário de abrir o ficheiro no editor diretamente.

### `--from` — a partir de um ficheiro

```bash
bun run content:edit cat3#86 --from correcao.mdx
cat correcao.mdx | bun run content:edit cat3#86 --from - --yes
```

O formato é o mesmo dos ficheiros do banco, tal como no `content:new`. Serve
para alterações preparadas noutro lado, ou para repetir a mesma correção em
várias perguntas a partir de um guião.

### Desativar e reativar

```bash
bun run content:edit cat3#161 --disable "Duplica a cat3#162."
bun run content:edit cat3#161 --enable
```

A pergunta sai do site mas fica no ficheiro, no `order` e nas comparações do
`qbank` — os detalhes estão em [`novas-questoes.md`](novas-questoes.md#desativar-uma-pergunta-sem-a-apagar).

O motivo é obrigatório. `--disable ""` dá erro em vez de passar: o schema
converte texto vazio em `null`, por isso um motivo em branco **publicaria** a
pergunta em vez de a retirar — o contrário do que foi pedido, comunicado como
sucesso.

## Filas de trabalho

O `qbank coverage` conta as lacunas; estas opções transformam a contagem numa
lista para percorrer:

```bash
bun run content:edit --sem-explicacao --cat 2 --limit 10
bun run content:edit --sem-fonte --cat 3
bun run content:edit --desativadas
```

Entre perguntas pergunta se quer continuar, por isso pode parar a meio sem
perder o que já gravou. Cada pergunta é revista contra o que a anterior
escreveu, não contra o banco no início da execução.

Combinam-se: `--sem-explicacao --sem-fonte` seleciona as que não têm nem uma
coisa nem outra.

## Opções

| Opção | O que faz |
| --- | --- |
| `--editor` | abre o ficheiro inteiro no `$EDITOR` |
| `--from <ficheiro>` | substitui a partir de um ficheiro (`-` para stdin) |
| `--disable <motivo>` | retira a pergunta do site sem a apagar |
| `--enable` | volta a publicá-la |
| `--sem-explicacao` | seleciona as perguntas sem explicação |
| `--sem-fonte` | seleciona as que não citam prova |
| `--desativadas` | seleciona as desativadas |
| `--cat 3` | restringe a seleção a uma categoria |
| `--limit 10` | quantas perguntas da fila percorrer |
| `--dry-run` | mostra o que escreveria, sem escrever nada |
| `--yes` | não pergunta (obrigatório quando o stdin é um pipe) |
| `--force` | escreve apesar dos avisos |

O `--yes` cobre também a confirmação das alterações a vermelho. Torná-la
impossível de saltar inutilizaria `--disable "motivo" --yes` num guião; a
segurança está em a alteração ser dita antes de acontecer, não em prender
alguém a uma pergunta. Sem `--yes` e sem terminal, falha fechado.

## Erros comuns

| Mensagem | Causa | Solução |
| --- | --- | --- |
| `não existe a pergunta cat3#999` | referência inexistente | `bun run qbank search` para a encontrar |
| `cat3#86 não é uma referência` | formato errado | `cat3#86`, `3#86` ou `cat3/86` |
| `--disable precisa de um motivo em texto` | `--disable ""` | escrever o motivo |
| `nada selecionado` | sem referência nem filtro | passar `cat3#86` ou `--sem-explicacao` |
| `stdin não é um terminal e não foi passado --from…` | corrido num pipe sem modo não interativo | `--from`, `--editor`, `--disable` ou `--enable` |
| `nada alterado` | a edição não mudou nada | nenhuma — não foi escrito |

## Onde está o código

| Caminho | O que é |
| --- | --- |
| `lib/content/author.ts` | As regras: `reviewDraft`, `diffQuestions`. Puras, testadas |
| `scripts/content-io.ts` | Leitura, escrita e perguntas, partilhadas com o `content:new` |
| `scripts/content-edit.ts` | O ciclo e os menus |
| `__tests__/unit/test-content-author.test.ts` | O que a revisão recusa e o que a comparação relata |

A separação é a mesma do resto do repositório: o que uma pergunta *é* e o que é
*permitido* vivem em `lib/content/`; os scripts são terminal e ficheiros.
