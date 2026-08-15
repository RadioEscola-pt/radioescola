# Product

> Inferred from the repo (README, CLAUDE.md, existing UI) during an impeccable critique run.
> Edit freely — future design commands read this file as ground truth.

## Register

product

## Users

People in Portugal preparing for the ANACOM amateur-radio licensing exams
(categories 3 → 2 → 1, beginner → advanced). Mostly adults studying in spare
moments — on the phone, on the train, in short evening sessions. Portuguese is
the default language; English is secondary. Their job: pass the next exam with
confidence, focusing effort on their weak areas.

## Product Purpose

Radio Escola (radioescola.pt) is a free study platform for the Portuguese ham
radio exams: question browsing, timed exam simulation with real ANACOM scoring
(-0.25 per wrong answer), spaced repetition, flashcards, drills, study notes,
and a progress dashboard. Success = users pass the real exam and trust that the
simulator matches it. All progress lives in localStorage; no accounts.

## Brand Personality

Warm, encouraging, practical. Amber/orange brand accent over slate neutrals;
friendly motion in small doses (logo signal pulse, drill card streaks). It is a
study companion, not a corporate LMS — but the study surfaces themselves stay
calm and data-forward.

## Anti-references

- Duolingo-level gamification pressure (gamification exists but is off by
  default and must stay optional-feeling)
- Corporate dashboard clichés: hero-metric grids, gradient stat cards
- Cluttered quiz-mill sites with ads and dense link farms

## Design Principles

- The exam is the anchor: numbers and flows mirror the real ANACOM exam (40
  questions, pass line at 20, penalty scoring)
- Weak areas first: surfaces should route users toward what they get wrong
- Works one-handed on a phone; sessions are short and interruptible
- Calm data density on study/progress surfaces; personality lives on the
  landing page and in small moments

## Accessibility & Inclusion

No formal WCAG target stated; aim for WCAG AA contrast, full keyboard
operability, and honoring `prefers-reduced-motion` (existing animations already
gate on it). Bilingual PT/EN via next-intl.
