import type { ReactNode } from "react";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CalculatorProvider from "@/components/providers/CalculatorProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata = {
  title: "Rádio Escola",
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
      <body className="flex min-h-screen flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <CalculatorProvider>
              <NavBar />
              <ErrorBoundary>
                <main className="mx-auto max-w-5xl px-4 py-6 flex-1">{children}</main>
              </ErrorBoundary>
              <Footer />
            </CalculatorProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
