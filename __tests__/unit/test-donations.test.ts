import { describe, it, expect } from 'vitest';
import {
  DONATION_TIERS,
  EXPENSES,
  FUNDING,
  annualCost,
  expenseShare,
  formatEuros,
  fundingPercent,
  fundingUpdatedDate,
  yearlyCost,
} from '@/lib/config/donations';

describe('donation costs', () => {
  it('bills a monthly expense twelve times a year', () => {
    expect(yearlyCost({ nameKey: 'x', provider: 'y', amount: 5.58, period: 'month', segment: '' })).toBeCloseTo(66.96, 2);
    expect(yearlyCost({ nameKey: 'x', provider: 'y', amount: 32.37, period: 'year', segment: '' })).toBe(32.37);
  });

  it('adds the lines up into the year the page asks visitors to cover', () => {
    expect(annualCost()).toBeCloseTo(99.33, 2);
  });

  it('splits the proportion bar by yearly cost, not by billed amount', () => {
    // The server bills less per charge than the domain but far more per year.
    const [hosting, domain] = EXPENSES;
    expect(Math.round(expenseShare(hosting!))).toBe(67);
    expect(Math.round(expenseShare(domain!))).toBe(33);
    expect(EXPENSES.reduce((sum, e) => sum + expenseShare(e), 0)).toBeCloseTo(100, 6);
  });
});

describe('funding progress', () => {
  it('clamps at 100 once the year is funded — the bar fills, it never overflows', () => {
    expect(FUNDING.received).toBeGreaterThan(annualCost());
    expect(fundingPercent()).toBe(100);
  });

  it('reads the updated month as a local date', () => {
    const date = fundingUpdatedDate();
    expect(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`).toBe(FUNDING.updated);
  });
});

describe('formatEuros', () => {
  it("writes Portugal's euro, not Brazil's", () => {
    // `pt` is Brazilian in CLDR, which would render "€ 190,00".
    expect(formatEuros(190, 'pt')).toBe('190,00 €');
    expect(formatEuros(99.33, 'pt')).toBe('99,33 €');
  });

  it('puts the sign first in English', () => {
    expect(formatEuros(190, 'en')).toBe('€190.00');
  });
});

describe('donation tiers', () => {
  it('keeps amounts whole, because they go into the PayPal link as-is', () => {
    for (const tier of DONATION_TIERS) expect(Number.isInteger(tier.amount)).toBe(true);
  });

  it('badges at most one tier', () => {
    expect(DONATION_TIERS.filter((tier) => tier.recommended)).toHaveLength(1);
  });
});
