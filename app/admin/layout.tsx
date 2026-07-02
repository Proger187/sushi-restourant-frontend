import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";
import Providers from "../providers";
import AdminShell from "./AdminShell";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = "en";
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body className={`${inter.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <AdminShell>{children}</AdminShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
