"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { User, ShoppingBag, Heart, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth";

const tabs = [
  { href: "/profile", icon: User, key: "title" },
  { href: "/profile/orders", icon: ShoppingBag, key: "orders_tab" },
  { href: "/profile/favourites", icon: Heart, key: "favourites_tab" },
  { href: "/profile/change-password", icon: Lock, key: "change_password_tab" },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("profile");
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.replace("/login?next=/profile");
    }
  }, [mounted, isLoggedIn, router]);

  if (!mounted || !isLoggedIn) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-semibold mb-8">{t("title")}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-56 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {tabs.map(({ href, icon: Icon, key }) => {
              const isActive = href === "/profile"
                ? pathname === "/profile" || pathname.endsWith("/profile")
                : pathname.includes(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-muted hover:text-white hover:bg-surface"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {t(key as "title")}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
