"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, ChevronDown, User, ShoppingBag as Orders, Heart, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

function Initials({ name }: { name: string }) {
  const parts = name.split(" ").filter(Boolean);
  const letters = parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : name.slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold uppercase">
      {letters}
    </div>
  );
}

export default function Navbar() {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo size="md" />

        <div className="hidden md:flex items-center gap-8">
          <Link href="/menu" prefetch={true} className="font-body font-medium tracking-wide uppercase text-sm text-muted hover:text-white transition-colors">{t("menu")}</Link>
          <a href="#about" className="font-body font-medium tracking-wide uppercase text-sm text-muted hover:text-white transition-colors">{t("about")}</a>
          <a href="#contacts" className="font-body font-medium tracking-wide uppercase text-sm text-muted hover:text-white transition-colors">{t("contacts")}</a>
          {mounted && isLoggedIn && (
            <Link href="/profile/orders" prefetch={true} className="font-body font-medium tracking-wide uppercase text-sm text-muted hover:text-white transition-colors">{t("my_orders")}</Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {mounted && (
            isLoggedIn ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  <Initials name={user?.full_name || user?.email || "U"} />
                  <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl py-1 shadow-lg z-50">
                    <p className="px-4 py-2 text-xs text-muted truncate">{user?.email}</p>
                    <div className="border-t border-border my-1" />
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-background transition-colors" onClick={() => setDropdownOpen(false)}>
                      <User className="w-4 h-4" /> {t("profile") ?? "Profile"}
                    </Link>
                    <Link href="/profile/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-background transition-colors" onClick={() => setDropdownOpen(false)}>
                      <Orders className="w-4 h-4" /> {t("my_orders")}
                    </Link>
                    <Link href="/profile/favourites" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-background transition-colors" onClick={() => setDropdownOpen(false)}>
                      <Heart className="w-4 h-4" /> {t("favourites") ?? "Favourites"}
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-background w-full transition-colors">
                      <LogOut className="w-4 h-4" /> {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden md:block text-sm text-muted hover:text-white transition-colors">
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
          <Link href="/menu" prefetch={true} className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("menu")}</Link>
          <a href="#about" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("about")}</a>
          <a href="#contacts" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("contacts")}</a>
          {mounted && isLoggedIn && (
            <>
              <Link href="/profile" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("profile") ?? "Profile"}</Link>
              <Link href="/profile/orders" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("my_orders")}</Link>
              <Link href="/profile/favourites" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>{t("favourites") ?? "Favourites"}</Link>
              <button onClick={handleLogout} className="block text-red-400">{t("logout")}</button>
            </>
          )}
          {mounted && !isLoggedIn && (
            <Link href="/login" className="block text-accent" onClick={() => setMobileOpen(false)}>{t("login")}</Link>
          )}
        </div>
      )}
    </nav>
  );
}
