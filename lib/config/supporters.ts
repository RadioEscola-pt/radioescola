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
