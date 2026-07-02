import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";
import Providers from "../providers";
import AdminShell from "./AdminShell";

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

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = "en";
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={`${heading.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            <AdminShell>{children}</AdminShell>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
