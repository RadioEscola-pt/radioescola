#!/usr/bin/env bun
/**
 * Uma porta de entrada para o banco de questões.
 *
 *   bun run banco
 *
 * Não é uma terceira ferramenta: é um menu por cima das duas que já existem.
 * Cada opção recolhe o que falta, em português, e depois corre o
 * `content:new` ou o `qbank` tal como se tivessem sido escritos à mão — as
 * duas continuam a funcionar sozinhas, e quem souber os comandos não perde
 * nada por não passar por aqui.
 *
 * Corre-os como subprocessos em vez de os importar. Carregar o banco inteiro
 * custa cerca de 150 ms, por isso não há nada a ganhar em partilhar o
 * processo, e há a perder: o `qbank` decide o que fazer no topo do módulo, e
 * importá-lo obrigaria a reescrevê-lo à volta de um `main()`.
 */
import { spawnSync } from "node:child_process";
import { join } from "path";
import {
  dim,
  red,
  askText,
  askChoice,
  closePrompts,
  interactive,
} from "./prompt";

const ROOT = process.cwd();
const QBANK = join("scripts", "qbank.ts");
const CONTENT_NEW = join("scripts", "content-new.ts");

/* -------------------------------------------------------------------------- */
/* Correr as ferramentas                                                       */
/* -------------------------------------------------------------------------- */

/**
 * A interface de leitura é fechada antes de entregar o terminal.
 *
 * O filho herda o stdin — o `content:new` faz as suas próprias perguntas, e o
 * `$EDITOR` que ele abre faz as dele. Dois leitores no mesmo stdin disputam as
 * teclas, e o que se perde são as primeiras que se escrevem.
 */
function run(script: string, args: readonly string[]): void {
  closePrompts();
  const result = spawnSync("bun", ["run", script, ...args], {
    stdio: "inherit",
    cwd: ROOT,
  });
  if (result.error) {
    console.error(`\n${red("✗")} não foi possível correr ${script}: ${result.error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Perguntas comuns                                                            */
/* -------------------------------------------------------------------------- */

/** `--cat` aceita uma lista, mas escolher uma ou todas cobre o uso real. */
async function askCategories(): Promise<string[]> {
  const chosen = await askChoice<string | null>("Categorias", [
    { value: null, label: "Todas" },
    { value: "1", label: "Categoria 1" },
    { value: "2", label: "Categoria 2" },
    { value: "3", label: "Categoria 3" },
  ]);
  return chosen === null || chosen === undefined ? [] : ["--cat", chosen];
}

/* -------------------------------------------------------------------------- */
/* As entradas do menu                                                         */
/* -------------------------------------------------------------------------- */

type Entry = {
  label: string;
  hint: string;
  /** Devolve os argumentos, ou `null` para voltar ao menu sem correr nada. */
  build: () => Promise<{ script: string; args: string[] } | null>;
};

const ENTRIES: Entry[] = [
  {
    label: "Acrescentar uma pergunta",
    hint: "content:new",
    build: async () => ({ script: CONTENT_NEW, args: [] }),
  },
  {
    label: "Procurar uma pergunta",
    hint: "por texto",
    build: async () => {
      const term = await askText("Termo a procurar", { required: false });
      if (term.length === 0) return null;
      const field = await askChoice<string | null>("Onde procurar", [
        { value: null, label: "Em tudo" },
        { value: "stem", label: "No enunciado" },
        { value: "options", label: "Nas opções" },
        { value: "explanation", label: "Na explicação" },
      ]);
      return {
        script: QBANK,
        args: [
          "search",
          term,
          ...(field === null || field === undefined ? [] : ["--field", field]),
          ...(await askCategories()),
        ],
      };
    },
  },
  {
    label: "Ver uma pergunta",
    hint: "ex.: cat3#12",
    build: async () => {
      const refs = await askText("Referência(s), separadas por espaços", { required: false });
      if (refs.length === 0) return null;
      return { script: QBANK, args: ["show", ...refs.split(/\s+/)] };
    },
  },
  {
    label: "Duplicados",
    hint: "grupos que discordam entre si",
    build: async () => {
      const tier = await askChoice<string | null>("Que tipo", [
        { value: null, label: "Todos", hint: "o pior primeiro" },
        { value: "contradiction", label: "Contradição", hint: "mesmas opções, resposta diferente" },
        { value: "typo", label: "Gralha" },
        { value: "divergent", label: "Divergente" },
        { value: "shared-answers", label: "Respostas partilhadas" },
        { value: "exact", label: "Exato" },
      ]);
      return {
        script: QBANK,
        args: [
          "dupes",
          ...(tier === null || tier === undefined ? [] : ["--tier", tier]),
          ...(await askCategories()),
        ],
      };
    },
  },
  {
    label: "Pares parecidos",
    hint: "enunciados próximos e polaridade invertida",
    build: async () => {
      const kind = await askChoice<string | null>("Que tipo", [
        { value: null, label: "Todos" },
        { value: "polarity", label: "Polaridade invertida", hint: "perguntam o contrário" },
        { value: "near-stem", label: "Enunciado parecido" },
      ]);
      return {
        script: QBANK,
        args: ["pairs", ...(kind === null || kind === undefined ? [] : ["--kind", kind])],
      };
    },
  },
  {
    label: "Cobertura",
    hint: "fontes, explicações, imagens, órfãs",
    build: async () => ({ script: QBANK, args: ["coverage", ...(await askCategories())] }),
  },
  {
    label: "Matérias",
    hint: "distribuição da taxonomia",
    build: async () => ({ script: QBANK, args: ["topics", ...(await askCategories())] }),
  },
  {
    label: "Provas",
    hint: "o que cita cada prova oficial",
    build: async () => {
      const pdf = await askText("Prova (Enter para a lista de todas)", { required: false });
      return { script: QBANK, args: ["paper", ...(pdf.length > 0 ? [pdf] : [])] };
    },
  },
  {
    label: "Auditoria das respostas",
    hint: "posição da certa, opções repetidas",
    build: async () => ({ script: QBANK, args: ["answers", ...(await askCategories())] }),
  },
];

/* -------------------------------------------------------------------------- */
/* Correr                                                                      */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  if (!interactive) {
    console.error(`\n${red("✗")} o menu precisa de um terminal`);
    console.error(`  Sem terminal, use as ferramentas diretamente:`);
    console.error(`    bun run qbank <comando>`);
    console.error(`    bun run content:new --from rascunho.mdx --yes`);
    process.exit(1);
  }

  for (;;) {
    const chosen = await askChoice<Entry | null>(
      "Banco de questões",
      ENTRIES.map((e) => ({ value: e, label: e.label, hint: e.hint })),
      { allowNone: true, noneLabel: "Enter para sair" }
    );
    // Enter sai: é a mesma tecla que cancela cada uma das perguntas lá dentro,
    // por isso não há nenhuma sequência a decorar para voltar atrás.
    if (chosen === null || chosen === undefined) {
      closePrompts();
      return;
    }

    const plan = await chosen.build();
    if (plan === null) continue;

    console.log(dim(`\n  ${`bun run ${plan.script} ${plan.args.join(" ")}`.trim()}\n`));
    run(plan.script, plan.args);
    console.log(dim(`\n${"─".repeat(60)}`));
  }
}

main()
  .then(() => closePrompts())
  .catch((error: unknown) => {
    console.error(`\n${red("✗")} ${error instanceof Error ? error.message : String(error)}`);
    closePrompts();
    process.exit(1);
  });
