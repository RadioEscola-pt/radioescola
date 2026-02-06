import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CalculatorProvider from "@/components/providers/CalculatorProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import ProgressProvider from "@/components/providers/ProgressProvider";
import PWAProvider from "@/components/providers/PWAProvider";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: "Rádio Escola",
  description: "Study and prepare for ham radio exams with localized content.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rádio Escola",
  },
  openGraph: {
    title: "Rádio Escola - Ham Radio Study",
    description: "Practice with real questions, take timed exams, and become a licensed ham radio operator.",
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
