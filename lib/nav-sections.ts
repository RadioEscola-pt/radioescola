/**
 * Which top-level nav section a pathname belongs to, and which category it
 * names. Both bars ask the same question, so they ask it in one place: the
 * desktop bar tints its current entry amber and the mobile drawer draws the
 * same rail, and a route added to one must not silently miss the other.
 */
import { CATEGORIES, type CategoryId } from '@/lib/config/categories';

export type NavSection = 'home' | 'study' | 'exams' | 'nation' | 'becomeHam';

export function navSections(pathname: string): Record<NavSection, boolean> {
  return {
    home: pathname === '/',
    study: ['/browse', '/aprender', '/drill'].some((p) => pathname.startsWith(p)),
    exams: pathname.startsWith('/exam') || pathname.startsWith('/submit-exam'),
    nation: pathname.startsWith('/estado-da-nacao'),
    becomeHam: pathname.startsWith('/ser-radioamador'),
  };
}

function isCategoryId(value: string | undefined): value is CategoryId {
  return value !== undefined && (CATEGORIES as readonly string[]).includes(value);
}

/** Routes whose next segment is a category id. */
const CATEGORY_ROUTES = ['/browse/', '/exam/'] as const;

/**
 * The category the visitor is currently in, or `null` off those routes — what
 * the mobile drawer's category picker opens on, so the menu agrees with the
 * page behind it.
 */
export function categoryFromPathname(pathname: string): CategoryId | null {
  for (const prefix of CATEGORY_ROUTES) {
    if (!pathname.startsWith(prefix)) continue;
    const segment = pathname.slice(prefix.length).split('/')[0];
    if (isCategoryId(segment)) return segment;
  }
  return null;
}
