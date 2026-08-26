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
bun run content:new  # Add a question: review, then write all four files
bun run qbank <cmd>  # Inspect the question bank (search, dupes, coverage, …)
```

## Deployment

Tag-triggered, via GitHub Actions → GHCR → the VPS at `server.radioescola.pt`:

```bash
git tag -a v2.0.0 -m "Release 2.0.0" && git push origin v2.0.0
```

`.github/workflows/release.yml` runs the checks, builds `Dockerfile`, pushes
`ghcr.io/radioescola-pt/radioescola:2.0.0`, then calls `deploy.yml` to roll it out.

`deploy.yml` also runs on its own from **Actions → Deploy → Run workflow**,
taking an image tag — that is how you redeploy or roll back, and it beats
running `release.sh` over SSH because CI supplies the registry credentials the
box deliberately does not keep. Full runbook in `docs/deployment.md`.

- **The image tag has no leading `v`** — `docker/metadata-action` strips it, so
  the tag `v2.0.0` publishes `2.0.0`
- **`NEXT_PUBLIC_*` is baked into the image**, so a feature-flag change needs a
  new tag, not an edit to the server's `app.env`
- **Two API routes read source files at request time** (`/api/notes/*` from
  `content/notes/`, `/api/study-items` from `app/study/`) using paths built from
  `process.cwd()`, which file tracing cannot follow. They are kept in the
  standalone output by `outputFileTracingIncludes` in `next.config.js` — a new
  route that reads from disk needs an entry there or it will answer empty in
  production only
- `deploy.sh` (builds on the box, PM2) and `deploy-remote.sh` (builds on your
  laptop, rsync) are the superseded predecessors

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
`order`. 1,016 questions total.

**Generated — never hand-edit:**
- `public/data/cat{n}.json` — what the client fetches, already in the shape
  `loadData()` returns
- `content/notes/cat{n}/{id}.mdx` — what `/api/notes` serves

`bun run content:build` regenerates them; `bun run content:check` verifies they
match and is wired into `bun run build`, so a hand-edit or a stale artifact
fails the build. It also fails on any `sources` entry pointing at an exam PDF
that is not in `public/exams/`. Papers we genuinely do not have are baselined in
`content/missing-exams.json` — a ratchet, so anything new fails while the known
69 references do not break the build; the check also reports baseline entries
that have become unnecessary. `scripts/content-migrate.ts <cat>` performs a migration and
refuses to overwrite an existing source directory.

`bun run content:new` is the way to add a question — interactive, or `--from
draft.mdx` where the draft is a question file with the `id` left out (the same
format it writes, so there is no second schema). It assigns the id, reviews the
draft against the whole bank, and then writes all four files. The rules live in
`lib/content/author.ts` as pure functions; the script is I/O and prompting,
the same split as `qbank`.

- **It refuses on `error`, asks on `warning`.** A duplicate is not
  automatically a defect, so a `contradiction` (same options, different correct
  answer) blocks while an `exact` match in another category only prompts
- **The topic is picked from a list, never typed.** `topic` is free text in the
  schema on purpose, which makes a typo the one mistake here that nothing
  anywhere reports — the card silently loses its label and the browse filter
  silently stops matching. This is the only place it can be made
  unrepresentable rather than merely detectable
- **The `order` position stays a human decision** — it is editorial, not
  numeric. Interactively it shows the same-topic neighbourhood and asks;
  otherwise `--after`/`--before`/`--end`. It never appends silently

Adding a question by hand is still documented in `docs/novas-questoes.md`
(pt-PT); the topic taxonomy in `docs/topicos.md` (pt-PT).

**Linking questions to exam PDFs**: `bun run data:ocr-exams` OCRs the scanned
papers in `public/exams/` and matches them back to the bank (needs `poppler`
and `tesseract`; install `tesseract-data-por` for accented text). With
`--apply` it fills the `page` of references that already exist. It never invents
a `sources` entry, because that needs the question number read off the scan,
which is the least reliable part — those are proposed in the report for a human
to confirm. `bun run data:fonte-pages` is the manual equivalent.

## Inspecting the bank

`bun run qbank` is a read-only developer tool over `content/questions/**` —
`search`, `show`, `dupes`, `pairs`, `coverage`, `topics`, `paper`, `answers`.
Analysis lives in `lib/content/analysis.ts` as pure functions; the script is
I/O and formatting. Full guide, in English and Portuguese, in `docs/qbank.md`.

It is deliberately **not** wired into CI. `content:check` owns per-file
validity, and duplicating that here would create a second source of truth that
drifts. What `qbank` reports is the class of problem no per-file rule can see:
two files that are each valid but disagree with each other.

- **A duplicate is not automatically a defect.** The same regulatory question is
  legitimately examined at all three levels, so groups are *classified*, not
  condemned — `contradiction` (same options, disagreeing on which is right),
  `typo`, `divergent`, `shared-answers`, `exact`, worst first
- **Every fuzzy finder also requires the answers to agree.** Stem similarity
  alone is useless: "Qual das seguintes afirmações é incorreta?" is a template
  shared by dozens of unrelated questions, and its nearest neighbour by string
  distance is the *opposite* question. Without the answer check, `pairs`
  reports hundreds of unrelated matches
- **`canonical()` is for prose, not for options.** It strips punctuation, which
  makes `10 dB` and `-10 dB`, or `0,01 µF` and `0,01 F`, compare equal — the
  within-question duplicate-option check therefore compares raw text. Morse
  answers canonicalise to the empty string entirely, which is what
  `comparisonKey()` guards against
- `--new` against `content/qbank-baseline.json` (written by
  `dupes --update-baseline`) is the same ratchet as `content/missing-exams.json`.
  No baseline is committed: the findings currently in the bank are real and
  unfixed, and baselining them would mark them accepted

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
- **Portuguese unless the visitor actively picks otherwise.** `Accept-Language`
  is deliberately not consulted: `resolveLocale` in `lib/i18n/config.ts` reads
  the `locale` cookie and falls back to `pt`. Only `setLocale` (the language
  switcher) ever writes that cookie, so its presence means a real choice
- Use `useTranslations('SectionName')` in components

## Gotchas

- **`correctIndex` is 0-indexed everywhere.** It was 1-indexed in the old hand-maintained JSON and decremented at runtime; the compiler now resolves it, and source files mark the right answer with `correct: true` instead of an index at all
- **Category order is 3→2→1** (not ascending). Category 3 = beginner, 1 = advanced (Portuguese licensing progression)
- **Exam scoring penalty**: -0.25 per wrong answer (hardcoded in `lib/config/exam.ts`)
- **A source reference nests its parts**: `sources: [{ pdf, question, page }]`.
  `question` is the pergunta number printed in the paper, `page` is the PDF page
  — unrelated numbers, since a paper carries ~4 questions per page. `page` is
  absent until somebody resolves it. Never use the pergunta number as a page
- **Image paths are already absolute** in the shipped JSON (`/images/cat{id}/file.png`); source files store them public-relative (`images/...`) and the compiler resolves them. Consumers use `question.img` directly — don't re-prepend
- **`lib/data.ts` does no normalization.** If question data looks wrong, fix the source and rebuild; don't add a runtime coercion. Malformed data should fail `content:check`, not be patched per visitor
- **Progress version migration**: Auto-migrates localStorage on load if version < `PROGRESS_VERSION` (currently V5)
- **Streaks are derived, never incremented.** `UserProgress.activeDays` is the
  set of local days the user studied; `currentStreak`/`longestStreak`/
  `lastStudyDate` fall out of it via `lib/streaks.ts`. `longestStreak` is kept
  monotonic because pre-V5 users have a real longest run whose days were never
  recorded. Never bump a streak counter in place — it cannot be merged between
  two devices and cannot be recomputed once it drifts
- **`examHistory` is capped** at `EXAM_HISTORY_LIMIT` (300, newest-first) with
  the overflow folded into `archivedExams`. Anything counting exams from the
  array alone is approximate for very heavy users
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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
