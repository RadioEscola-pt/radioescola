/**
 * The facts the home page prints about each category.
 *
 * The category columns advertise the size of the bank and the reach of the
 * licence before anything is fetched, so both numbers are claims made at build
 * time with nothing at runtime to correct them. `QUESTION_COUNTS` is
 * hand-maintained and drifts the moment a question is added or withheld;
 * `bandReach` is derived, and the annex it derives from is explicitly
 * provisional for category 3. These tests are what stops either from going
 * quietly stale.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CATEGORIES, QUESTION_COUNTS } from '@/lib/config/categories';
import { BAND_PLAN, bandReach } from '@/lib/config/bands';

const ROOT = resolve(__dirname, '../../');

describe('QUESTION_COUNTS', () => {
  it.each(CATEGORIES)('matches the shipped artifact for cat%s', (cat) => {
    const data = JSON.parse(readFileSync(resolve(ROOT, `public/data/cat${cat}.json`), 'utf-8'));
    expect(QUESTION_COUNTS[cat]).toBe((data.questions as unknown[]).length);
  });
});

describe('bandReach', () => {
  const labels = BAND_PLAN.flatMap((row) => (row.band ? [row.band] : []));

  it.each(CATEGORIES)('gives cat%s one bar per band, in plan order', (cat) => {
    expect(bandReach(cat).bars.map((bar) => bar.band)).toEqual(labels);
  });

  it('reads the ceiling of the best segment in a band, not the first', () => {
    // 80 m is two segments: category 2 has no access to 3500-3700 and 200 W on
    // 3700-3800. Taking the first segment would report the band as barred.
    const eighty = bandReach('2').bars.find((bar) => bar.band === '80 m');
    expect(eighty?.power).toBe(200);
  });

  it('counts only the bands a category may transmit on', () => {
    for (const cat of CATEGORIES) {
      const { bars, bandCount } = bandReach(cat);
      expect(bandCount).toBe(bars.filter((bar) => bar.power !== null).length);
    }
  });

  it('widens with the licence: every band of a lower category is held by a higher one', () => {
    const [three, two, one] = [bandReach('3'), bandReach('2'), bandReach('1')];
    expect(three.bandCount).toBeLessThan(two.bandCount);
    expect(two.bandCount).toBeLessThan(one.bandCount);
    expect(three.maxPower).toBeLessThan(two.maxPower);
    expect(two.maxPower).toBeLessThan(one.maxPower);
  });

  it('never reports a ceiling of zero or a category with no reach at all', () => {
    for (const cat of CATEGORIES) {
      const { bars, maxPower } = bandReach(cat);
      expect(maxPower).toBeGreaterThan(0);
      expect(bars.every((bar) => bar.power === null || bar.power > 0)).toBe(true);
    }
  });
});
