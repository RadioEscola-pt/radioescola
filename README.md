# Radio Escola v2

A study platform for Portuguese ham radio licensing exams at [radioescola.pt](https://radioescola.pt). Covers all three license categories (3, 2, and 1) with question browsing, exam simulation, spaced repetition, and progress tracking.

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Features

- **Question Browser** - Browse and filter the full question bank by category
- **Exam Simulation** - Timed 40-question exams with realistic scoring (including -0.25 penalty for wrong answers)
- **Smart Practice** - Spaced repetition that focuses on your weak areas
- **Flash Cards** - Quick review mode for memorization
- **Quick Drill** - 10-question drills for fast practice sessions
- **Progress Dashboard** - Track your study progress with gamification
- **Study Notes** - MDX-based notes linked to individual questions
- **Calculators** - Built-in RF and electronics calculators
- **PWA** - Installable as a mobile/desktop app, works offline
- **Bilingual** - Portuguese (default) and English via next-intl

## Quickstart

### Prerequisites
- [Bun](https://bun.sh/) (package manager and runtime)

### Setup

```bash
git clone https://github.com/jcalado/hamradiostudy.git
cd hamradiostudy
bun install
bun run dev
```

Open http://localhost:3000

### Commands

```bash
bun run dev           # Start dev server
bun run build         # Production build
bun run start         # Start production server
bun run lint          # ESLint
bun run test          # Run tests (Vitest)
bun run test:watch    # Tests in watch mode
bun run type-check    # TypeScript type checking
./deploy.sh           # Deploy (pull, install, build, PM2 restart)
```

## Architecture

- **Routing**: Next.js App Router with dynamic `[category]` segments
- **Data**: Static JSON question banks in `public/data/`
- **Storage**: All user progress in localStorage (no backend database)
- **i18n**: next-intl v4 with messages in `messages/{en,pt}.json`
- **Testing**: Vitest + React Testing Library

## License

All rights reserved.
