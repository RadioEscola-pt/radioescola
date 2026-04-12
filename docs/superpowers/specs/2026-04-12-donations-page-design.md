# Donations Page Design

## Overview

A donations page at `/donativos` that explains the project's volunteer nature and costs, offers suggested donation amounts via PayPal.me links, and is surfaced discretely through the footer, about page, and a subtle homepage CTA.

## PayPal Integration

No SDK or backend required. Uses PayPal.me URL with amount suffix:
- Base: `https://www.paypal.me/radioescola`
- With amount: `https://www.paypal.me/radioescola/5` (appending the euro amount)

Add to `EXTERNAL_LINKS` in `lib/config/external-links.ts`:
```ts
PAYPAL_DONATE: 'https://www.paypal.me/radioescola',
```

## Route: `/donativos`

File: `app/donativos/page.tsx` (server component, no client-side state needed)

### Sections

**1. Hero** — gradient header matching about page style (slate-800 → slate-900). Heart icon with heading "Ajuda-nos a manter o Radio Escola no ar" and a paragraph about the project being free, open-source, and volunteer-run.

**2. What donations help with** — 3 cards in a responsive grid:
- Server/hosting icon — "Alojamento e infraestrutura"
- Code/development icon — "Tempo de desenvolvimento"
- Users/community icon — "Manter a plataforma gratuita para todos"

Each card has an icon, title, and one-line description.

**3. Suggested amounts** — 3 tier cards + 1 custom amount option, in a responsive grid:
- 5€ — "Um cafe para a equipa" — links to `/radioescola/5`
- 10€ — "Ajuda com o hosting" — links to `/radioescola/10`
- 25€ — "Patrocina um mes" — links to `/radioescola/25`
- "Outro valor" (other amount) — links to base PayPal.me URL

Each card is an `<a>` tag opening in a new tab. Cards show the amount prominently, a label underneath, and a PayPal icon or button-like treatment. All link externally to PayPal.me.

**4. Thank you** — small closing text thanking supporters, mentioning that every contribution helps.

### Visual Style

Follows existing page patterns (about page as reference):
- `-mx-4 sm:mx-0 pb-8` main wrapper
- Section icons in colored rounded backgrounds
- Cards with `bg-white dark:bg-slate-800 rounded-xl border` treatment
- Amber accent color for CTAs (consistent with site theme)

## Touchpoints

### Footer (`components/Footer.tsx`)

Add to `internalLinks` array:
```ts
{ href: "/donativos", icon: Heart, labelKey: "donate" },
```

Add `"donate": "Apoiar"` / `"Support"` to Footer i18n section.

### About Page (`app/about/page.tsx`)

Add a card in the "Links Uteis" section linking to `/donativos` with Heart icon, "Apoiar o projeto" label, and "Ajuda-nos a manter a plataforma" description.

### Homepage (`app/page.tsx`)

A discrete CTA near the bottom of the page. Small card or banner with soft styling (not a loud alert). Something like:
- Subtle background (slate-100 / slate-800 dark)
- Heart icon + "Gostaste? Ajuda-nos a continuar" text
- Small "Apoiar" button linking to `/donativos`
- Not dismissable (keep it simple), just visually understated

## i18n

Add a `"Donate"` section to both `messages/pt.json` and `messages/en.json`:

### Portuguese (pt.json)
```json
"Donate": {
  "title": "Ajuda-nos a manter o Radio Escola no ar",
  "subtitle": "O Radio Escola e um projeto gratuito, open-source e mantido por voluntarios. As tuas contribuicoes ajudam-nos a manter a plataforma online e a continuar a desenvolver novas funcionalidades.",
  "whatHelps": "Para onde vai o teu apoio",
  "hosting": "Alojamento",
  "hostingDesc": "Servidores, dominio e infraestrutura para manter a plataforma online e rapida.",
  "development": "Desenvolvimento",
  "developmentDesc": "Tempo dedicado a criar novas funcionalidades e melhorar a experiencia.",
  "community": "Comunidade",
  "communityDesc": "Manter a plataforma gratuita e acessivel para todos os aspirantes a radioamador.",
  "chooseAmount": "Escolhe como apoiar",
  "coffee": "Um cafe para a equipa",
  "hosting10": "Ajuda com o hosting",
  "sponsor": "Patrocina um mes",
  "otherAmount": "Outro valor",
  "otherAmountDesc": "Escolhe o teu proprio valor",
  "donate": "Doar via PayPal",
  "thankYou": "Obrigado!",
  "thankYouText": "Cada contribuicao, por mais pequena que seja, faz a diferenca. Obrigado por apoiares o radioamadorismo em Portugal."
}
```

### English (en.json)
```json
"Donate": {
  "title": "Help us keep Radio Escola online",
  "subtitle": "Radio Escola is a free, open-source project maintained by volunteers. Your contributions help us keep the platform running and continue developing new features.",
  "whatHelps": "Where your support goes",
  "hosting": "Hosting",
  "hostingDesc": "Servers, domain, and infrastructure to keep the platform online and fast.",
  "development": "Development",
  "developmentDesc": "Time dedicated to building new features and improving the experience.",
  "community": "Community",
  "communityDesc": "Keeping the platform free and accessible for all aspiring radio amateurs.",
  "chooseAmount": "Choose how to support",
  "coffee": "A coffee for the team",
  "hosting10": "Help with hosting",
  "sponsor": "Sponsor a month",
  "otherAmount": "Other amount",
  "otherAmountDesc": "Choose your own amount",
  "donate": "Donate via PayPal",
  "thankYou": "Thank you!",
  "thankYouText": "Every contribution, no matter how small, makes a difference. Thank you for supporting amateur radio in Portugal."
}
```

Also add Footer translations:
- pt: `"donate": "Apoiar"`
- en: `"donate": "Support"`

And homepage CTA translations under a `"Home"` or `"HomeDonateCTA"` section:
- pt: `"donatePrompt": "Gostaste? Ajuda-nos a continuar"`, `"donateButton": "Apoiar"`
- en: `"donatePrompt": "Enjoying it? Help us keep going"`, `"donateButton": "Support"`

## Files to Create

- `app/donativos/page.tsx`

## Files to Modify

- `lib/config/external-links.ts` — add PAYPAL_DONATE
- `components/Footer.tsx` — add donate link
- `app/about/page.tsx` — add donate card in Links Uteis
- `app/page.tsx` — add subtle CTA
- `messages/pt.json` — add Donate section + footer/home keys
- `messages/en.json` — add Donate section + footer/home keys

## Out of Scope

- PayPal SDK integration or server-side payment processing
- Donation tracking or receipts
- Recurring donations / subscriptions
- Donor wall or public recognition
