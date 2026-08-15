/**
 * Category configuration
 * Single source of truth for category IDs, colors, icons, and styling
 */
import type { LucideIcon } from 'lucide-react';
import { Sprout, Flame, Rocket } from 'lucide-react';

export const CATEGORIES = ['3', '2', '1'] as const;
export type CategoryId = (typeof CATEGORIES)[number];

export type CategoryConfig = {
  icon: LucideIcon;
  dot: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  /** Translucent fill + edge for badges that sit on a card as frosted glass. */
  badgeGlass: string;
  solidBtn: string;
  outlineBtn: string;
};

export const CATEGORY_CONFIG: Record<CategoryId, CategoryConfig> = {
  '3': {
    icon: Sprout,
    dot: 'bg-green-500',
    accent: 'bg-green-500',
    badgeBg: 'bg-green-100 dark:bg-green-900/40',
    badgeText: 'text-green-700 dark:text-green-300',
    badgeGlass: 'bg-green-500/15 border-green-500/30 dark:bg-green-400/10 dark:border-green-400/25',
    solidBtn: 'bg-green-600 text-white hover:bg-green-700',
    outlineBtn: 'border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400',
  },
  '2': {
    icon: Flame,
    dot: 'bg-amber-500',
    accent: 'bg-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeGlass: 'bg-amber-500/20 border-amber-500/30 dark:bg-amber-400/10 dark:border-amber-400/25',
    solidBtn: 'bg-amber-600 text-white hover:bg-amber-700',
    outlineBtn: 'border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-400',
  },
  '1': {
    icon: Rocket,
    dot: 'bg-rose-500',
    accent: 'bg-rose-500',
    badgeBg: 'bg-rose-100 dark:bg-rose-900/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeGlass: 'bg-rose-500/15 border-rose-500/30 dark:bg-rose-400/10 dark:border-rose-400/25',
    solidBtn: 'bg-rose-600 text-white hover:bg-rose-700',
    outlineBtn: 'border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-400',
  },
};

/** @deprecated Use CATEGORY_CONFIG instead */
export type CategoryStyle = Pick<CategoryConfig, 'badgeBg' | 'badgeText' | 'solidBtn' | 'outlineBtn'>;

/** @deprecated Use CATEGORY_CONFIG instead */
export const CATEGORY_STYLES: Record<CategoryId, CategoryStyle> = Object.fromEntries(
  CATEGORIES.map((id) => {
    const { badgeBg, badgeText, solidBtn, outlineBtn } = CATEGORY_CONFIG[id];
    return [id, { badgeBg, badgeText, solidBtn, outlineBtn }];
  })
) as Record<CategoryId, CategoryStyle>;

export const CATEGORY_IMAGES: Record<CategoryId, string> = {
  '3': '/images/cat3/cover.webp',
  '2': '/images/cat2/cover.webp',
  '1': '/images/cat1/cover.jpg',
};

/** Default category used when none specified */
export const DEFAULT_CATEGORY: CategoryId = '3';
