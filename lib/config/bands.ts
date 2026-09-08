/**
 * Frequency bands and power ceilings
 *
 * Source: Anexo 6 of the QNAF — "Utilização de frequências pelos serviços de
 * amador e de amador por satélite" (ANACOM, September 2013), read against the
 * columns `1 e A`, `B`, `2` and `C`.
 *
 * That annex predates Lei n.º 22/2026 and **has no column for category 3**,
 * because under the previous regime a category 3 holder could not transmit at
 * all. The category 3 figures here are provisional: they follow the legacy `C`
 * column on 10 m, 6 m, 2 m and 70 cm, plus the 10 W HF access the new regime
 * grants on the three segments category 2 already held. Revisit once ANACOM
 * reissues the annex.
 *
 * Segments are stored as numbers so they can be formatted per locale — a
 * Portuguese reader expects `29,7` and `10 100`, an English one `29.7` and
 * `10,100`. Only the band label ("80 m") is locale-independent.
 */
import type { CategoryId } from './categories';

export type BandUnit = 'kHz' | 'MHz';

export type BandRow = {
  /** Wavelength label, e.g. "80 m". Empty when this row continues the band above. */
  band: string;
  from: number;
  to: number;
  unit: BandUnit;
  /** Peak power ceiling in watts; null where the category has no access. */
  power: Record<CategoryId, number | null>;
  /** Segment reserved to the amateur-satellite service. */
  satellite?: boolean;
};

const p = (c3: number | null, c2: number | null, c1: number | null) =>
  ({ '3': c3, '2': c2, '1': c1 }) satisfies Record<CategoryId, number | null>;

/**
 * The bands a Portuguese amateur uses day to day. The annex also covers
 * 2200 m, 630 m, 4 m and microwave allocations up to 250 GHz, all of them
 * category 1 only, which is why they are left to the footnote rather than
 * doubling the length of the table.
 */
export const BAND_PLAN: readonly BandRow[] = [
  { band: '160 m', from: 1810, to: 1830, unit: 'kHz', power: p(null, null, 200) },
  { band: '', from: 1830, to: 1850, unit: 'kHz', power: p(null, null, 1500) },
  { band: '80 m', from: 3500, to: 3700, unit: 'kHz', power: p(null, null, 1500) },
  { band: '', from: 3700, to: 3800, unit: 'kHz', power: p(10, 200, 1500) },
  { band: '40 m', from: 7000, to: 7100, unit: 'kHz', power: p(null, null, 1500) },
  { band: '', from: 7100, to: 7200, unit: 'kHz', power: p(10, 200, 1500) },
  { band: '30 m', from: 10100, to: 10150, unit: 'kHz', power: p(null, null, 750) },
  { band: '20 m', from: 14000, to: 14125, unit: 'kHz', power: p(null, null, 1500) },
  { band: '', from: 14125, to: 14250, unit: 'kHz', power: p(null, 200, 1500) },
  { band: '', from: 14250, to: 14350, unit: 'kHz', power: p(10, 200, 1500) },
  { band: '17 m', from: 18068, to: 18168, unit: 'kHz', power: p(null, null, 1500) },
  { band: '15 m', from: 21000, to: 21151, unit: 'kHz', power: p(null, null, 1500) },
  { band: '', from: 21151, to: 21450, unit: 'kHz', power: p(null, 200, 1500) },
  { band: '12 m', from: 24890, to: 24990, unit: 'kHz', power: p(null, null, 1500) },
  { band: '10 m', from: 28, to: 29.7, unit: 'MHz', power: p(100, 200, 1500) },
  { band: '6 m', from: 50, to: 50.5, unit: 'MHz', power: p(null, 150, 300) },
  { band: '', from: 51, to: 52, unit: 'MHz', power: p(50, 150, 300) },
  { band: '2 m', from: 144, to: 145.806, unit: 'MHz', power: p(50, 150, 300) },
  { band: '', from: 145.806, to: 146, unit: 'MHz', power: p(null, 150, 300), satellite: true },
  { band: '70 cm', from: 430, to: 435, unit: 'MHz', power: p(50, 150, 300) },
  { band: '', from: 435, to: 438, unit: 'MHz', power: p(null, null, 300), satellite: true },
  { band: '', from: 438, to: 440, unit: 'MHz', power: p(50, 150, 300) },
];

/** Formats a segment as "3700 – 3800 kHz" in the reader's locale. */
export function formatSegment(row: BandRow, locale: string): string {
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return `${n.format(row.from)} – ${n.format(row.to)} ${row.unit}`;
}

/** One band's ceiling for a single category. `null` where there is no access. */
export type BandBar = { band: string; power: number | null };

export type BandReach = {
  /** One entry per band, in BAND_PLAN order: long wave to short. */
  bars: readonly BandBar[];
  /** How many bands the category may transmit on. */
  bandCount: number;
  /** The highest ceiling it holds on any band, in watts. */
  maxPower: number;
};

/**
 * Collapses BAND_PLAN into one bar per band for a category: the best ceiling it
 * holds anywhere in that band, or `null` if it holds none of the segments.
 *
 * This is what makes the three licences comparable at a glance, so it is derived
 * rather than written down. The annex is provisional for category 3 (see the
 * note at the top of this file) and will be reissued; a hardcoded "7 faixas"
 * would quietly go stale the day the table changes.
 */
export function bandReach(id: CategoryId): BandReach {
  const bars: BandBar[] = [];

  for (const row of BAND_PLAN) {
    const power = row.power[id];
    if (row.band) {
      bars.push({ band: row.band, power });
      continue;
    }
    // An empty label continues the band above, so widen that bar instead.
    const current = bars[bars.length - 1];
    if (current && power !== null && (current.power === null || power > current.power)) {
      current.power = power;
    }
  }

  const powers = bars.flatMap((bar) => (bar.power === null ? [] : [bar.power]));
  return { bars, bandCount: powers.length, maxPower: Math.max(...powers) };
}
