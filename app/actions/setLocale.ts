"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, locales, defaultLocale, type Locale } from "@/lib/i18n/config";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function setLocale(locale: string) {
  const normalized = locale.toLowerCase();
  const fallback = locales.includes(normalized as Locale) ? (normalized as Locale) : defaultLocale;

  const cookieStore = await cookies();
  cookieStore.set({
    name: LOCALE_COOKIE,
    value: fallback,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}
