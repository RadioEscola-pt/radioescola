import type { Locale } from "./config";

type Messages = Record<string, unknown>;

const messageLoaders: Record<Locale, () => Promise<Messages>> = {
  en: () => import("../../messages/en.json").then((mod) => mod.default),
  pt: () => import("../../messages/pt.json").then((mod) => mod.default),
};

export async function loadMessages(locale: Locale): Promise<Messages> {
  const loader = messageLoaders[locale] ?? messageLoaders.en;
  return loader();
}
