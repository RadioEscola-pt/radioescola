# Guia de testes

A Rádio Escola tem duas suítes, e a diferença entre elas é o que cada uma
consegue ver:

| Suíte | Comando | O que cobre |
|---|---|---|
| **Vitest** | `bun run test` | Física (`lib/utils/electrical.ts`), lógica pura e componentes isolados em jsdom |
| **Playwright** | `bun run test:e2e` | A aplicação real num browser: navegação, cadeia de providers, mensagens i18n |

O gestor de pacotes é o **bun**. Não há comandos `npm` neste projeto.

---

## Vitest

```bash
bun run test              # corre tudo uma vez
bun run test:watch        # modo watch
bun run test:coverage     # com cobertura V8
bun run test -- __tests__/unit/test-calculator-wavelength.test.tsx   # um ficheiro
```

Ficam em `__tests__/{unit,integration,contracts}/`, padrão `*.test.{ts,tsx}`.
Configuração em `vitest.config.ts`, ambiente jsdom, setup em `vitest.setup.ts`.

Nos testes de componente o `next-intl` está *mockado* para devolver a própria
chave (`useTranslations: () => (key) => key`). Isso tem uma consequência que
poupa meia hora de confusão: **strings construídas por `t()` com interpolação
não aparecem no DOM** — só se vê a chave. Portanto só se pode afirmar sobre
valores que o componente compõe directamente (por exemplo o `result` do
`WavelengthCalculator`, `λ = 21.19 m`), nunca sobre os que passam por
`t("computedDimensions", { ... })`. Esses verificam-se no Playwright.

---

## Playwright

```bash
bun run test:e2e          # corre a suíte
bun run test:e2e:ui       # modo UI interactivo do Playwright
bunx playwright install chromium   # primeira vez, instala o browser
```

Os testes vivem em `e2e/`, a configuração em `playwright.config.ts`.

O `webServer` da configuração arranca `bun run dev` sozinho; se já tiveres um
servidor de desenvolvimento a correr na porta 3000, ele reutiliza-o
(`reuseExistingServer` fora de CI). Para apontar a outro sítio:

```bash
E2E_BASE_URL=http://localhost:3001 bun run test:e2e
```

### O que pertence aqui

Esta suíte é curta de propósito. Só entra aquilo que **não se consegue afirmar
sem browser**: que a calculadora abre a partir do menu real, dentro da cadeia
de providers real, com as strings do `messages/pt.json` real. A física não
entra — já está coberta em `__tests__/unit/test-electrical.test.ts`, e duplicá-la
aqui só torna a suíte lenta sem cobrir mais nada.

A regra prática: se o teste passaria contra uma cópia da aplicação, não é um
teste end-to-end e pertence ao Vitest.

### Detalhes que dão jeito saber

- **O locale por omissão é `pt`** e os testes não põem cookie nenhum, por isso
  as strings verificadas são as portuguesas que o visitante vê.
- **O menu usa `shortTitle`, a janela usa `title`**, e em quatro calculadoras
  esses valores diferem (`Soma Componentes` / `Soma de Componentes`). A tabela
  `CALCULATORS` no topo de `e2e/calculators.spec.ts` guarda os dois.
- **As descrições no menu mencionam nomes de outras calculadoras** — a de
  `Circuito RLC` fala em "fator Q" — por isso o localizador filtra pelo nó de
  título do item, não pelo nome acessível do item inteiro.
- **`next dev` faz cache do JSON de mensagens.** Uma chave nova em
  `messages/*.json` exige reiniciar o servidor; um reload não chega, e o
  sintoma é o browser mostrar a chave literal (`Calculators.common.close`).

---

## Em CI

`.github/workflows/ci.yml` corre os dois em jobs separados e em paralelo:
`check` faz `type-check`, `lint`, `test` e `content:check`; `e2e` instala o
Chromium e corre `test:e2e`. Em caso de falha, o relatório HTML do Playwright
fica anexado à execução como artefacto `playwright-report`.

O ficheiro é chamado por `main.yml` e por `release.yml`, por isso um push para
`main` e uma tag passam exactamente pelas mesmas verificações que um PR.

---

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `browserType.launch: Executable doesn't exist` | Falta `bunx playwright install chromium` |
| A UI mostra `Calculators.common.close` | Chave nova em `messages/`; reinicia o `next dev` |
| `strict mode violation: resolved to 2 elements` | O localizador apanha também a descrição de outro item; filtra pelo nó de título |
| `bun install --frozen-lockfile` falha | `package.json` mudou sem actualizar o `bun.lock` — corre `bun install` e faz commit do lockfile |
