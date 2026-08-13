# CLAUDE.md

## Commands

```bash
bun install          # Install dependencies (bun is the package manager, not npm)
bun run dev          # Start dev server (Next.js 16)
bun run build        # Production build
bun run start        # Start production server
bun run lint         # ESLint
bun run test         # Vitest (unit + integration)
bun run test:watch   # Vitest in watch mode
bun run test:coverage # Vitest with V8 coverage
bun run type-check   # tsc --noEmit
bun run content:build # Compile content/questions/** into shipped artifacts
bun run content:check # Verify artifacts match their source (writes nothing)
./deploy.sh          # Pull, install, build, PM2 restart (app name: radioescola)
```

## Architecture

Next.js 16 App Router with React 19, TypeScript (strict), Tailwind CSS v4.

**Routing**: `/app/` with dynamic `[category]` segments (values: `'3'`, `'2'`, `'1'`).

**Key routes**:
- `/browse/[category]` - Question browser (+ `/flash`, `/smart-practice` sub-routes)
- `/exam/[category]` - Timed 40-question exam simulation
- `/drill` - Quick 10-question drill
- `/dashboard` - Progress with gamification
- `/study` - Study materials index

**API routes**: `/api/data`, `/api/notes/[category]/[id]`, `/api/study-items`, `/api/submit-exam`

**Provider chain** (in root layout): Theme → Progress → Calculator → PWA

**Data flow**: Static JSON in `/public/data/cat{1,2,3}.json` → `loadData()` fetches all 3 in parallel. All user progress stored in localStorage (key: `hamradio_progress`). No backend database.

## Content pipeline

**cat3 is migrated; cat1 and cat2 are not.** Know which you are editing.

- **cat3**: source of truth is `content/questions/cat3/` — one `{id}.mdx` per
  question (zero-padded filename, YAML frontmatter, explanation as the body),
  plus `category.json` holding `anacomFile` and the question `order`.
  `public/data/cat3.json` and `content/notes/cat3/**` are **generated** — do not
  hand-edit them; edit the source and run `bun run content:build`.
- **cat1 / cat2**: still hand-maintained JSON + `content/notes/cat{1,2}/`. The
  build skips categories with no source directory, so they are unaffected.

`bun run content:check` fails if a generated file was hand-edited or the source
no longer compiles to what is committed. Run `scripts/content-migrate.ts <cat>`
to migrate a category (refuses to overwrite an existing source dir).

Why `order` lives in `category.json`: the legacy array order is **editorial,
not id order** (questions 210-213 sit at positions 8, 10, 19, 31, grouped by
subject) and it drives the browse sequence, so it must survive the migration.

The canonical model (`lib/content/schema.ts`) differs from the shipped JSON on
purpose: answers carry a `correct` flag instead of a 1-indexed `correctIndex`,
absent values are consistently `null`/`[]`/`{}`, and `topic` exists as a real
field. `lib/content/legacy.ts` adapts between the two, so the runtime keeps
fetching the same shape it always has.

## Key Directories

```
app/             # Next.js App Router pages and API routes
components/      # ui/, providers/, calculators/, gamification/, shared/, settings/
lib/             # Core logic: i18n/, types/, config/, storage/, gamification/, spaced-repetition/, utils/
content/questions/ # Question SOURCE, one MDX per question (cat3/ only so far)
content/notes/   # GENERATED for cat3; still source for cat1/cat2
messages/        # i18n JSON: en.json, pt.json
hooks/           # React hooks: useProgress, useGamification, useExamTimer, etc.
public/data/     # Question bank JSON + notes-index.json
public/exams/    # PDF exam papers (cat1/, cat2/, cat3/)
specs/           # Feature specifications
__tests__/       # unit/, integration/, contracts/
next.config.js   # Next.js configuration
tailwind.config.js # Tailwind CSS v4 config
```

## i18n

Uses `next-intl` v4. Default locale is **Portuguese (pt)**, also supports English (en).
- Messages in `messages/{en,pt}.json`
- Locale config in `lib/i18n/config.ts`
- Proxy (`proxy.ts`) sets locale cookie from Accept-Language header
- Use `useTranslations('SectionName')` in components

## Gotchas

- **Question correctIndex is 1-indexed** in JSON data, converted to 0-indexed in code: `(qObj.correctIndex ?? 1) - 1`
- **Category order is 3→2→1** (not ascending). Category 3 = beginner, 1 = advanced (Portuguese licensing progression)
- **Exam scoring penalty**: -0.25 per wrong answer (hardcoded in `lib/config/exam.ts`)
- **Image paths**: Questions store the `img` field as a full public-relative path (`images/cat{id}/file.png`). `normalizeImg()` in `lib/data.ts` makes it absolute (`/images/...`); it also handles bare filenames and already-absolute paths. Consumers (`QuestionCard`, exam page) use the normalized `question.img` directly, so don't re-prepend the path
- **Progress version migration**: Auto-migrates localStorage on load if version < `PROGRESS_VERSION` (currently V3)
- **Exam replay via URL params**: `q=` (question IDs), `a=` (base36-encoded answers), `t=` (time remaining) — no server storage needed
- **Calculator is a modal context**, not a route — opening calculators doesn't change URL

## Code Style

- TypeScript strict mode with `noUncheckedIndexedAccess` and `noImplicitReturns`
- Path alias: `@/*` maps to project root
- Components use `"use client"` directive where needed
- Radix UI primitives in `components/ui/`
- Tailwind CSS v4 with `dark:` prefix for dark mode (`darkMode: 'class'`)

## Testing

- **Framework**: Vitest + React Testing Library + jsdom
- **Location**: `__tests__/{unit,integration,contracts}/`
- **Pattern**: `*.test.{ts,tsx}`
- **Setup**: `vitest.setup.ts` (excluded from tsconfig)

## Environment Variables

```
RESEND_API_KEY=           # Email service for exam PDF submissions
EXAM_SUBMISSION_EMAIL=    # Recipient for submitted exams
RESEND_FROM_EMAIL=        # Sender email (default: onboarding@resend.dev)
```

Only needed for the `/submit-exam` feature. The app runs fully without them.

### Feature flags

```
NEXT_PUBLIC_GAMIFICATION=  # "true" enables gamification; anything else disables it
```

Build-time flags live in `lib/config/features.ts`. Next inlines `NEXT_PUBLIC_*`
at build time, so the constants collapse to literals — **changing a flag needs a
rebuild, not just a restart**. Keep the `process.env.X` access written out
literally; destructuring defeats the inlining. The flags gate behaviour, not
bundle size: disabling gamification does not measurably shrink the client
bundle, since `useGamification` runs on every page and imports the achievement
data unconditionally.

Gamification is **off by default**. It is gated at two choke points —
`isEnabled` in `hooks/useGamification.ts` (drives all UI) and `runGamification`
in `ProgressProvider` (drives all XP/achievement writes) — plus the dashboard
blocks. `lib/gamification/engine.ts` is deliberately not gated, so its tests run
independently of the flag. Existing localStorage progress is preserved while
off.
