/**
 * Category configuration
 * Defines the available exam categories and their styling
 */
export const CATEGORIES = ['3', '2', '1'] as const;
export type CategoryId = (typeof CATEGORIES)[number];

export type CategoryStyle = {
  badgeBg: string;
  badgeText: string;
  solidBtn: string;
  outlineBtn: string;
};

export const CATEGORY_STYLES: Record<CategoryId, CategoryStyle> = {
  '3': {
    badgeBg: 'bg-green-100 dark:bg-green-900/40',
    badgeText: 'text-green-700 dark:text-green-300',
    solidBtn: 'bg-green-600 text-white hover:bg-green-700',
    outlineBtn: 'border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-400',
  },
  '2': {
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    solidBtn: 'bg-amber-600 text-white hover:bg-amber-700',
    outlineBtn: 'border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-400',
  },
  '1': {
    badgeBg: 'bg-rose-100 dark:bg-rose-900/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    solidBtn: 'bg-rose-600 text-white hover:bg-rose-700',
    outlineBtn: 'border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-400',
  },
};

export const CATEGORY_IMAGES: Record<CategoryId, string> = {
  '3': '/images/cat3/cover.webp',
  '2': '/images/cat2/cover.webp',
  '1': '/images/cat1/cover.jpg',
};

/** Default category used when none specified */
export const DEFAULT_CATEGORY: CategoryId = '3';
