# Rádio Escola v2

Plataforma de estudo para os exames de radioamador em Portugal, em [radioescola.pt](https://radioescola.pt). Cobre as três categorias de licença (3, 2 e 1), com consulta de questões, simulação de exame, repetição espaçada e acompanhamento do progresso.

Feita com Next.js 16, React 19, TypeScript e Tailwind CSS v4.

## Funcionalidades

- **Explorar questões** — percorre e filtra todo o banco de questões por categoria
- **Simulação de exame** — exames cronometrados de 40 questões com pontuação realista (incluindo a penalização de -0,25 por resposta errada)
- **Prática Inteligente** — repetição espaçada que insiste nos teus pontos fracos
- **Flashcards** — modo de revisão rápida para memorizar
- **Treino Rápido** — sessões de 10 questões para praticar num instante
- **Progresso** — acompanha o teu estudo, com gamificação
- **Materiais de estudo** — notas em MDX ligadas a cada questão
- **Calculadoras** — calculadoras de RF e electrónica integradas
- **PWA** — instalável como aplicação em telemóvel ou computador, funciona offline
- **Bilingue** — português (por omissão) e inglês, através do next-intl

## Começar

### Requisitos
- [Bun](https://bun.sh/) (gestor de pacotes e runtime)

### Instalação

```bash
git clone https://github.com/RadioEscola-pt/radioescola.git
cd radioescola
bun install
bun run dev
```

Abre http://localhost:3000

### Comandos

```bash
bun run dev           # Arranca o servidor de desenvolvimento
bun run build         # Compila para produção
bun run start         # Arranca o servidor de produção
bun run lint          # ESLint
bun run test          # Corre os testes (Vitest)
bun run test:watch    # Testes em modo watch
bun run type-check    # Verificação de tipos do TypeScript
```

Cada commit no `main` vai para o ar automaticamente, através do GitHub Actions. Uma tag corta uma versão com nome. O guia completo está em [`docs/deployment.md`](docs/deployment.md).

## Arquitectura

- **Rotas**: App Router do Next.js, com segmentos dinâmicos `[category]`
- **Dados**: bancos de questões em JSON estático, em `public/data/`
- **Armazenamento**: todo o progresso do utilizador fica em localStorage (sem base de dados no servidor)
- **i18n**: next-intl v4, com as mensagens em `messages/{en,pt}.json`
- **Testes**: Vitest + React Testing Library

## Licença

Todos os direitos reservados.
