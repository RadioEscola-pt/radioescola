import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CalculatorProvider from "@/components/providers/CalculatorProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import ProgressProvider from "@/components/providers/ProgressProvider";
import PWAProvider from "@/components/providers/PWAProvider";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

// Portuguese, matching the site's default locale and the pt_PT already declared
// below — these strings are what search results and link previews show, and the
// audience is sitting the Portuguese ANACOM exam.
export const metadata: Metadata = {
  title: "Rádio Escola",
  description:
    "Prepare-se para os exames de radioamador da ANACOM: perguntas reais, simuladores de exame cronometrados e explicações em português.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rádio Escola",
  },
  openGraph: {
    title: "Rádio Escola — Exames de Radioamador",
    description:
      "Pratique com perguntas reais dos exames da ANACOM, faça simulações cronometradas e prepare-se para obter a sua licença de radioamador.",
    type: "website",
    locale: "pt_PT",
    siteName: "Rádio Escola",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
            <ProgressProvider>
              <CalculatorProvider>
                <PWAProvider>
                  <NavBar />
                  <ErrorBoundary>
                    <main className="mx-auto w-full max-w-5xl px-4 py-6 flex-1">{children}</main>
                  </ErrorBoundary>
                  <Footer />
                </PWAProvider>
              </CalculatorProvider>
            </ProgressProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
