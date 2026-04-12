# Donations Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/donativos` donations page with PayPal.me integration, suggested amounts, and discrete CTAs in the footer, about page, and homepage.

**Architecture:** New page route at `app/donativos/page.tsx` (server component using `getTranslations`). PayPal integration is link-only (no SDK). Donation amounts are appended to the PayPal.me URL. All text is i18n'd via `next-intl`.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, next-intl, Lucide icons

---

### Task 1: Add PayPal link to external-links config

**Files:**
- Modify: `lib/config/external-links.ts`

- [ ] **Step 1: Add PAYPAL_DONATE to EXTERNAL_LINKS**

In `lib/config/external-links.ts`, add the PayPal.me link after the GOOGLE_PLAY entry:

```ts
  /** PayPal.me donation link */
  PAYPAL_DONATE: 'https://www.paypal.me/radioescola',
```

- [ ] **Step 2: Commit**

```bash
git add lib/config/external-links.ts
git commit -m "feat: add PayPal donation link to external links config"
```

---

### Task 2: Add i18n translations

**Files:**
- Modify: `messages/pt.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add Donate section and Footer/Home keys to pt.json**

Add a new `"Donate"` top-level section after the `"Home"` section (after line 126). Also add `"donate": "Apoiar"` to the `"Footer"` section, and add `"donatePrompt"` and `"donateButton"` keys to the `"Home"` section.

Footer addition (inside `"Footer"` object):
```json
"donate": "Apoiar"
```

Home additions (inside `"Home"` object, after `"studyLibraryDescription"`):
```json
"donatePrompt": "Gostaste? Ajuda-nos a continuar",
"donateButton": "Apoiar"
```

New Donate section:
```json
"Donate": {
  "title": "Ajuda-nos a manter o Rádio Escola no ar",
  "subtitle": "O Rádio Escola é um projeto gratuito, open-source e mantido por voluntários. As tuas contribuições ajudam-nos a manter a plataforma online e a continuar a desenvolver novas funcionalidades.",
  "whatHelps": "Para onde vai o teu apoio",
  "hosting": "Alojamento",
  "hostingDesc": "Servidores, domínio e infraestrutura para manter a plataforma online e rápida.",
  "development": "Desenvolvimento",
  "developmentDesc": "Tempo dedicado a criar novas funcionalidades e melhorar a experiência.",
  "community": "Comunidade",
  "communityDesc": "Manter a plataforma gratuita e acessível para todos os aspirantes a radioamador.",
  "chooseAmount": "Escolhe como apoiar",
  "coffee": "Um café para a equipa",
  "coffeeAmount": "5",
  "hosting10": "Ajuda com o hosting",
  "hosting10Amount": "10",
  "sponsor": "Patrocina um mês",
  "sponsorAmount": "25",
  "otherAmount": "Outro valor",
  "otherAmountDesc": "Escolhe o teu próprio valor",
  "donateVia": "Doar via PayPal",
  "thankYou": "Obrigado!",
  "thankYouText": "Cada contribuição, por mais pequena que seja, faz a diferença. Obrigado por apoiares o radioamadorismo em Portugal."
}
```

- [ ] **Step 2: Add matching keys to en.json**

Footer addition:
```json
"donate": "Support"
```

Home additions:
```json
"donatePrompt": "Enjoying it? Help us keep going",
"donateButton": "Support"
```

New Donate section:
```json
"Donate": {
  "title": "Help us keep Rádio Escola online",
  "subtitle": "Rádio Escola is a free, open-source project maintained by volunteers. Your contributions help us keep the platform running and continue developing new features.",
  "whatHelps": "Where your support goes",
  "hosting": "Hosting",
  "hostingDesc": "Servers, domain, and infrastructure to keep the platform online and fast.",
  "development": "Development",
  "developmentDesc": "Time dedicated to building new features and improving the experience.",
  "community": "Community",
  "communityDesc": "Keeping the platform free and accessible for all aspiring radio amateurs.",
  "chooseAmount": "Choose how to support",
  "coffee": "A coffee for the team",
  "coffeeAmount": "5",
  "hosting10": "Help with hosting",
  "hosting10Amount": "10",
  "sponsor": "Sponsor a month",
  "sponsorAmount": "25",
  "otherAmount": "Other amount",
  "otherAmountDesc": "Choose your own amount",
  "donateVia": "Donate via PayPal",
  "thankYou": "Thank you!",
  "thankYouText": "Every contribution, no matter how small, makes a difference. Thank you for supporting amateur radio in Portugal."
}
```

- [ ] **Step 3: Commit**

```bash
git add messages/pt.json messages/en.json
git commit -m "feat: add i18n translations for donations page"
```

---

### Task 3: Create the donations page

**Files:**
- Create: `app/donativos/page.tsx`

- [ ] **Step 1: Create `app/donativos/page.tsx`**

Server component using `getTranslations('Donate')`. Structure:

```tsx
import React from 'react';
import { Heart, Server, Code, Users, ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { EXTERNAL_LINKS } from '@/lib/config';

const DONATION_TIERS = [
  { amountKey: 'coffeeAmount', labelKey: 'coffee', icon: '☕' },
  { amountKey: 'hosting10Amount', labelKey: 'hosting10', icon: '🖥️' },
  { amountKey: 'sponsorAmount', labelKey: 'sponsor', icon: '⭐' },
] as const;

const WHAT_HELPS = [
  { icon: Server, titleKey: 'hosting', descKey: 'hostingDesc' },
  { icon: Code, titleKey: 'development', descKey: 'developmentDesc' },
  { icon: Users, titleKey: 'community', descKey: 'communityDesc' },
] as const;

export default async function DonativosPage() {
  const t = await getTranslations('Donate');

  return (
    <main className="-mx-4 sm:mx-0 pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-4 sm:px-8 py-10 sm:rounded-2xl mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/20">
            <Heart className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">{t('title')}</h1>
        </div>
        <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
          {t('subtitle')}
        </p>
      </div>

      {/* What donations help with */}
      <div className="px-4 sm:px-0 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('whatHelps')}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {WHAT_HELPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.titleKey}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5"
              >
                <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{t(item.titleKey)}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t(item.descKey)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested amounts */}
      <div className="px-4 sm:px-0 mb-10">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{t('chooseAmount')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DONATION_TIERS.map((tier) => {
            const amount = t(tier.amountKey);
            return (
              <a
                key={tier.amountKey}
                href={`${EXTERNAL_LINKS.PAYPAL_DONATE}/${amount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all"
              >
                <span className="text-3xl">{tier.icon}</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{amount}€</span>
                <span className="text-sm text-slate-600 dark:text-slate-400 text-center">{t(tier.labelKey)}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
                  {t('donateVia')}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            );
          })}
          {/* Other amount */}
          <a
            href={EXTERNAL_LINKS.PAYPAL_DONATE}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 p-6 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all"
          >
            <span className="text-3xl">💛</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">…€</span>
            <span className="text-sm text-slate-600 dark:text-slate-400 text-center">{t('otherAmount')}</span>
            <span className="text-xs text-slate-500 dark:text-slate-500">{t('otherAmountDesc')}</span>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
              {t('donateVia')}
              <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </div>
      </div>

      {/* Thank you */}
      <div className="px-4 sm:px-0">
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('thankYou')}</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">{t('thankYouText')}</p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify it renders**

Run: `bun run build` or visit `http://localhost:3000/donativos` in dev mode.
Expected: Page renders with hero, 3 info cards, 4 donation tier cards, thank you section.

- [ ] **Step 3: Commit**

```bash
git add app/donativos/page.tsx
git commit -m "feat: add donations page at /donativos"
```

---

### Task 4: Add donate link to footer

**Files:**
- Modify: `components/Footer.tsx`

- [ ] **Step 1: Add Heart import and donate link**

In `components/Footer.tsx`, add `Heart` to the lucide-react import:

```ts
import { Github, MessageCircle, Smartphone, Bug, Info, Radio, Zap, BarChart3, GraduationCap, School, TrendingUp, Heart } from "lucide-react";
```

Add to the `internalLinks` array (after the `about` entry):

```ts
  { href: "/donativos", icon: Heart, labelKey: "donate" },
```

- [ ] **Step 2: Verify footer renders with new link**

Run dev server, check footer shows "Apoiar" link with heart icon. Click it, navigates to `/donativos`.

- [ ] **Step 3: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: add donate link to footer"
```

---

### Task 5: Add donate card to about page

**Files:**
- Modify: `app/about/page.tsx`

- [ ] **Step 1: Add donate card in Links Úteis section**

In `app/about/page.tsx`, add `Link` import from `next/link` at the top. Inside the "Links Úteis" section's grid (`<div className="grid gap-3 sm:grid-cols-2">`), add a third card after the GitHub link (before the closing `</div>` of the grid):

```tsx
            <Link
              href="/donativos"
              className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Apoiar o Projeto</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ajuda-nos a manter a plataforma</p>
              </div>
            </Link>
```

Note: The about page is not i18n'd (it uses hardcoded Portuguese), so hardcoded text is consistent here.

- [ ] **Step 2: Verify about page shows the card**

Visit `/about`, scroll to "Links Úteis". Should show the new donate card alongside Telegram and GitHub.

- [ ] **Step 3: Commit**

```bash
git add app/about/page.tsx
git commit -m "feat: add donate card to about page"
```

---

### Task 6: Add discrete CTA to homepage

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add donate CTA section**

In `app/page.tsx`, add `Heart` to the lucide-react import.

Add a new section at the very end, just before the closing `</div>` of the main wrapper (after the process section, around line 203):

```tsx
      {/* Donate CTA */}
      <section className="mt-12 md:mt-16">
        <Link
          href="/donativos"
          className="flex items-center gap-4 px-5 py-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 dark:bg-slate-800/40 dark:border-slate-700/40 dark:hover:bg-slate-800/70 transition-all duration-200 group"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
            <Heart className="h-4 w-4 text-rose-500 dark:text-rose-400" />
          </div>
          <p className="flex-1 text-sm text-slate-600 dark:text-slate-400">
            {t("donatePrompt")}
          </p>
          <span className="shrink-0 text-sm font-medium text-amber-600 dark:text-amber-400 group-hover:underline">
            {t("donateButton")}
          </span>
        </Link>
      </section>
```

- [ ] **Step 2: Verify homepage CTA renders**

Visit `/`, scroll to bottom. Should see a subtle, low-contrast bar with heart icon and "Gostaste? Ajuda-nos a continuar" text with "Apoiar" link.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add discrete donate CTA to homepage"
```

---

### Task 7: Build verification

- [ ] **Step 1: Run production build**

```bash
bun run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run linter**

```bash
bun run lint
```

Expected: No new lint errors.

- [ ] **Step 3: Run type-check**

```bash
bun run type-check
```

Expected: No type errors.

- [ ] **Step 4: Run tests**

```bash
bun run test
```

Expected: All existing tests pass.
