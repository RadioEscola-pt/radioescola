import type { ReactNode } from "react";
import "./globals.css";
import NavBar from "../components/NavBar";
import CalculatorProvider from "../components/providers/CalculatorProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata = {
  title: "HamRadioStudy",
  description: "Study and prepare for ham radio exams with localized content.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CalculatorProvider>
            <NavBar />
            <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
          </CalculatorProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
