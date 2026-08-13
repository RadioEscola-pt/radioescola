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

**Data flow**: `content/questions/**` → compiled by `content:build` → static JSON in `/public/data/cat{1,2,3}.json` → `loadData()` fetches all 3 in parallel and copies fields, doing **no** transformation. All user progress stored in localStorage (key: `hamradio_progress`). No backend database.

## Content pipeline

All three categories are migrated. **Source of truth is `content/questions/cat{n}/`** —
one `{id}.mdx` per question (zero-padded filename, YAML frontmatter, explanation
as the MDX body), plus `category.json` holding `anacomFile` and the question
`order`. 1,015 questions total.

**Generated — never hand-edit:**
- `public/data/cat{n}.json` — what the client fetches, already in the shape
  `loadData()` returns
- `content/notes/cat{n}/{id}.mdx` — what `/api/notes` serves

`bun run content:build` regenerates them; `bun run content:check` verifies they
match and is wired into `bun run build`, so a hand-edit or a stale artifact
fails the build. `scripts/content-migrate.ts <cat>` performs a migration and
refuses to overwrite an existing source directory.

Why `order` lives in `category.json`: the question order is **editorial, not id
order** (in cat3, questions 210-213 sit at positions 8, 10, 19 and 31, grouped
by subject) and it drives the browse sequence. A manifest keeps inserting a
question a one-line diff instead of renumbering every file after it, and it is
validated against the files present in both directions.

The canonical model (`lib/content/schema.ts`) is the single definition of a
question, with types inferred from the Zod schema. `lib/content/legacy.ts` is
import-only, kept for re-running a migration from an archived JSON file.

## Key Directories

```
app/             # Next.js App Router pages and API routes
components/      # ui/, providers/, calculators/, gamification/, shared/, settings/
lib/             # Core logic: i18n/, types/, config/, storage/, gamification/, spaced-repetition/, utils/
content/questions/ # Question SOURCE of truth, one MDX per question (cat1/, cat2/, cat3/)
content/notes/   # GENERATED explanation files (do not hand-edit)
messages/        # i18n JSON: en.json, pt.json
hooks/           # React hooks: useProgress, useGamification, useExamTimer, etc.
public/data/     # GENERATED question bank JSON (do not hand-edit)
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

- **`correctIndex` is 0-indexed everywhere.** It was 1-indexed in the old hand-maintained JSON and decremented at runtime; the compiler now resolves it, and source files mark the right answer with `correct: true` instead of an index at all
- **Category order is 3→2→1** (not ascending). Category 3 = beginner, 1 = advanced (Portuguese licensing progression)
- **Exam scoring penalty**: -0.25 per wrong answer (hardcoded in `lib/config/exam.ts`)
- **Image paths are already absolute** in the shipped JSON (`/images/cat{id}/file.png`); source files store them public-relative (`images/...`) and the compiler resolves them. Consumers use `question.img` directly — don't re-prepend
- **`lib/data.ts` does no normalization.** If question data looks wrong, fix the source and rebuild; don't add a runtime coercion. Malformed data should fail `content:check`, not be patched per visitor
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
