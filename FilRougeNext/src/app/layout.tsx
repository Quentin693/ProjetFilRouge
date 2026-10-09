import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: {
    default: "Voyage Luxe — Destinations d'Exception",
    template: "%s | Voyage Luxe",
  },
  description:
    "Découvrez des voyages d'exception dans les destinations les plus luxueuses du monde. Réservez votre expérience sur mesure avec Voyage Luxe.",
  keywords: ["voyage luxe", "destinations luxueuses", "voyages d'exception"],
  openGraph: {
    title: "Voyage Luxe — Destinations d'Exception",
    description: "Voyages d'exception dans les plus belles destinations du monde.",
    type: "website",
    locale: "fr_FR",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SessionProvider>
            {children}
            <Toaster richColors position="top-right" />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
