import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE, detectLocale, isLocale, defaultLocale, type Locale } from "../lib/i18n/config";
import { loadMessages } from "../lib/i18n/messages";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");

  const locale: Locale = isLocale(fromCookie)
    ? fromCookie
    : detectLocale(acceptLanguage) ?? defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
