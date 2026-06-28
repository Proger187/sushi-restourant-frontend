"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          🍣 Sushi
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/menu" className="text-muted hover:text-white transition-colors">
            Меню
          </Link>
          <a href="#about" className="text-muted hover:text-white transition-colors">
            О нас
          </a>
          <a href="#contacts" className="text-muted hover:text-white transition-colors">
            Контакты
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              document.dispatchEvent(new CustomEvent("toggle-cart"))
            }
            className="relative p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>

          <button
            className="md:hidden p-2 hover:bg-surface rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <Link
            href="/menu"
            className="block text-muted hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            Меню
          </Link>
          <a href="#about" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>
            О нас
          </a>
          <a href="#contacts" className="block text-muted hover:text-white" onClick={() => setMobileOpen(false)}>
            Контакты
          </a>
        </div>
      )}
    </nav>
  );
}
