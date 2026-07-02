import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import Providers from "../providers";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sushi Garden",
  description: "Fresh sushi delivered to your door",
  icons: { icon: "/logo.jpg", apple: "/logo.jpg" },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${heading.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navbar />
            <CartDrawer />
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
