import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { detectLocale, isLocale, LOCALE_COOKIE, type Locale } from "./lib/i18n/config";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function resolveLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) {
    return fromCookie;
  }
  return detectLocale(request.headers.get("accept-language"));
}

export function middleware(request: NextRequest) {
  const locale = resolveLocale(request);
  const response = NextResponse.next();

  response.cookies.set({
    name: LOCALE_COOKIE,
    value: locale,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });

  response.headers.set("x-next-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/|.*\\.).*)"],
};
