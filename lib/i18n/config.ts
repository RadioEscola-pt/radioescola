export const LOCALE_COOKIE = "locale";

export const locales = ["en", "pt"] as const;
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

export function isLocale(locale: string | undefined | null): locale is Locale {
  return Boolean(locale && locales.includes(locale as Locale));
}

export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const candidates = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean) as string[];

  for (const candidate of candidates) {
    const normalized = candidate.split("-")[0];
    if (isLocale(candidate.toLowerCase())) {
      return candidate.toLowerCase() as Locale;
    }
    if (isLocale(normalized)) {
      return normalized as Locale;
    }
  }

  return defaultLocale;
}
