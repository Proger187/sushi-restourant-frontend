"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { clsx } from "clsx";

const locales = ["en", "ru"] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: "en" | "ru") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1 bg-surface rounded-lg p-0.5">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={clsx(
            "px-2 py-1 rounded text-xs font-medium transition-colors",
            locale === l
              ? "bg-accent text-white"
              : "text-muted hover:text-white"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
