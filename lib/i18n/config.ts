export const LOCALE_COOKIE = "locale";

export const locales = ["en", "pt"] as const;
export const defaultLocale = "pt";

export type Locale = (typeof locales)[number];

export function isLocale(locale: string | undefined | null): locale is Locale {
  return Boolean(locale && locales.includes(locale as Locale));
}

/**
 * The locale to render for a request.
 *
 * Only an explicit choice counts: the cookie is written by the language
 * switcher and by nothing else. `Accept-Language` is deliberately ignored — a
 * visitor whose browser prefers English is still studying for a Portuguese
 * exam, so Portuguese is the right default until they say otherwise.
 */
export function resolveLocale(cookieValue: string | undefined | null): Locale {
  return isLocale(cookieValue) ? cookieValue : defaultLocale;
}
