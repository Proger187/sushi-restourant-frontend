"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());

  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Sushi
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/menu" className="text-muted hover:text-white transition-colors">{t("menu")}</Link>
          <a href="#about" className="text-muted hover:text-white transition-colors">{t("about")}</a>
          <a href="#contacts" className="text-muted hover:text-white transition-colors">{t("contacts")}</a>
          {mounted && isLoggedIn && (
            <Link href="/orders" className="text-muted hover:text-white transition-colors">{t("my_orders")}</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {mounted && (
            isLoggedIn ? (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {user?.name}
                </span>
                <button onClick={logout} className="p-1.5 text-muted hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="hidden md:block text-sm text-muted hover:text-white transition-colors">
                {t("login")}
              </Link>
            )
          )}

          <button
            onClick={() => document.dispatchEvent(new CustomEvent("toggle-cart"))}
            className="relative p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>

          <button className="md:hidden p-2 hover:bg-surface rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <Link href="/menu" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("menu")}</Link>
          <a href="#about" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("about")}</a>
          <a href="#contacts" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("contacts")}</a>
          {mounted && isLoggedIn && (
            <>
              <Link href="/orders" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("my_orders")}</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block text-red-400">{t("logout")}</button>
            </>
          )}
          {mounted && !isLoggedIn && (
            <Link href="/auth/login" className="block text-accent" onClick={() => setMobileOpen(false)}>{t("login")}</Link>
          )}
        </div>
      )}
    </nav>
  );
}
