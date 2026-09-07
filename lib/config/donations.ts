/**
 * The donations page's data: what has come in, who sent it, and what it pays
 * for. These are the numbers that change every few weeks — everything else on
 * the site changes when the code does.
 *
 * Amounts are plain numbers in euros, formatted per locale at render time.
 * They deliberately do **not** live in `messages/{en,pt}.json`: an amount is a
 * fact, not copy, and writing it there meant writing it four times — formatted
 * for pt, formatted for en, and a raw copy of each so the progress bar could do
 * arithmetic — with nothing to catch the one you forgot.
 */

/** What has been received, and when it was last checked. Update after a batch. */
export const FUNDING = {
  /** Donations received during `year`, in euros */
  received: 195,
  /** The year the total covers — the "Donativos em 2026" heading */
  year: 2026,
  /** When `received` was last reconciled against PayPal, `YYYY-MM` */
  updated: '2026-08',
} as const;

export interface Expense {
  /** Key under the `Donate` messages namespace for the line's name */
  nameKey: string;
  /** Who is billing us, shown next to the name */
  provider: string;
  /** What is charged each `period`, in euros */
  amount: number;
  period: 'month' | 'year';
  /** Tailwind class for this line's slice of the proportion bar, and its dot */
  segment: string;
}

/** What a year of Rádio Escola costs. The sum is also the year's funding goal. */
export const EXPENSES: Expense[] = [
  { nameKey: 'expenseHosting', provider: 'Euronodes', amount: 5.58, period: 'month', segment: 'bg-amber-500' },
  { nameKey: 'expenseDomain', provider: 'radioescola.pt', amount: 32.37, period: 'year', segment: 'bg-amber-500/40' },
];

export interface DonationTier {
  /** Key under the `Donate` messages namespace for the button's label */
  labelKey: string;
  /** Euros. Also the amount in the PayPal deep link, so keep it a whole number */
  amount: number;
  /** The one carrying the "most popular" badge — at most one */
  recommended?: boolean;
}

export const DONATION_TIERS: DonationTier[] = [
  { labelKey: 'coffee', amount: 5 },
  { labelKey: 'hosting10', amount: 10, recommended: true },
  { labelKey: 'sponsor', amount: 25 },
];

/** A line's cost over a year — a monthly charge is what it bills twelve times. */
export function yearlyCost(expense: Expense): number {
  return expense.period === 'month' ? expense.amount * 12 : expense.amount;
}

/** The year's total cost, and therefore the goal the hero counts towards. */
export function annualCost(expenses: Expense[] = EXPENSES): number {
  return expenses.reduce((total, expense) => total + yearlyCost(expense), 0);
}

/** A line's slice of the annual cost, as a percentage — the proportion bar. */
export function expenseShare(expense: Expense, expenses: Expense[] = EXPENSES): number {
  return (yearlyCost(expense) / annualCost(expenses)) * 100;
}

/**
 * How far the year's donations go towards its costs, clamped to 100 — the bar
 * fills, it does not overflow. Going past the goal is a good problem, and the
 * page says what the excess buys rather than drawing a longer bar.
 */
export function fundingPercent(): number {
  return Math.min(100, Math.round((FUNDING.received / annualCost()) * 100));
}

/**
 * Portugal's euro, not Brazil's. The site's locale code is `pt`, which CLDR
 * treats as pt-BR — `Intl` renders "€ 190,00" for it, where Portugal writes
 * "190,00 €". Only the currency needs the correction; month names agree.
 */
const CURRENCY_LOCALES: Record<string, string> = { pt: 'pt-PT' };

export function formatEuros(amount: number, locale: string): string {
  return new Intl.NumberFormat(CURRENCY_LOCALES[locale] ?? locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/** `FUNDING.updated` as a local Date, for locale-aware month formatting. */
export function fundingUpdatedDate(): Date {
  const [year, month] = FUNDING.updated.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, 1);
}

/**
 * The people who have donated to Rádio Escola.
 *
 * Deliberately **no amounts**: the wall thanks the gesture, not the sum, and
 * ranking donors by what they gave is the one thing that would make appearing
 * here uncomfortable. Order is chronological, oldest first.
 */
export interface Supporter {
  /** Full name, as the person wants to be thanked */
  name: string;
  /** Amateur callsign, if licensed — rendered as the QSL card's call plate */
  callsign?: string;
  /** Month of the first donation, `YYYY-MM`. Drives the timeline grouping */
  since: string;
}

export const SUPPORTERS: Supporter[] = [
  { name: 'Pedro Caria', callsign: 'CR7BYT', since: '2026-08' },
  { name: 'Carlos Francisco', callsign: 'CR7CAN', since: '2026-08' },
  { name: 'José Ribeiro', callsign: 'CT7BAS', since: '2026-08' },
  { name: 'Francisco São Bento', callsign: 'CS7BIO', since: '2026-08' },
  { name: 'Paulo Viegas', callsign: 'CR7BSO', since: '2026-08' },
  { name: 'Joana Silva', callsign: 'CR7BZG', since: '2026-08' },
  { name: 'Filipe Lopes', callsign: 'CT1ILT', since: '2026-08' },
];

export interface SupporterYear {
  year: number;
  supporters: Supporter[];
}

/** The `YYYY-MM` string as a local Date, for locale-aware month formatting */
export function supporterDate(supporter: Supporter): Date {
  const [year, month] = supporter.since.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, 1);
}

/**
 * Chronological, oldest year first, and oldest supporter first inside each
 * year — the wall reads as a history, so the earliest believers come first.
 */
export function supportersByYear(supporters: Supporter[] = SUPPORTERS): SupporterYear[] {
  const years = new Map<number, Supporter[]>();

  for (const supporter of [...supporters].sort((a, b) => a.since.localeCompare(b.since))) {
    const year = supporterDate(supporter).getFullYear();
    const bucket = years.get(year);
    if (bucket) bucket.push(supporter);
    else years.set(year, [supporter]);
  }

  return [...years.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, list]) => ({ year, supporters: list }));
}

/** The year the first donation arrived — the "since" in the hero */
export function firstSupportYear(supporters: Supporter[] = SUPPORTERS): number | null {
  const years = supportersByYear(supporters);
  return years[0]?.year ?? null;
}
