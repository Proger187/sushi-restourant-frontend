"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard, ShoppingBag, Package, FolderOpen, Truck, Settings,
  LogOut, Menu, X, Loader2,
} from "lucide-react";
import api from "@/lib/api";
import Logo from "@/components/layout/Logo";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: t("nav_dashboard"), icon: LayoutDashboard },
    { href: "/admin/orders", label: t("nav_orders"), icon: ShoppingBag },
    { href: "/admin/products", label: t("nav_products"), icon: Package },
    { href: "/admin/categories", label: t("nav_categories"), icon: FolderOpen },
    { href: "/admin/delivery", label: t("nav_delivery"), icon: Truck },
    { href: "/admin/settings", label: t("nav_settings"), icon: Settings },
  ];

  useEffect(() => {
    if (pathname === "/admin/login") { setAuthState("authenticated"); return; }
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/admin/login"); setAuthState("unauthenticated"); return; }
    api.get("/api/admin/orders/", { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setAuthState("authenticated"))
      .catch(async () => {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) { localStorage.removeItem("token"); router.replace("/admin/login"); setAuthState("unauthenticated"); return; }
        try {
          const { data } = await api.post("/api/auth/token/refresh/", { refresh });
          localStorage.setItem("token", data.access);
          setAuthState("authenticated");
        } catch {
          localStorage.removeItem("token"); localStorage.removeItem("refresh_token");
          router.replace("/admin/login"); setAuthState("unauthenticated");
        }
      });
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (authState === "loading") return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>;
  if (authState === "unauthenticated") return null;

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("refresh_token");
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={clsx("fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col transition-transform lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Logo size="sm" />
          <button className="lg:hidden p-1 hover:bg-background rounded" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors", isActive ? "bg-accent/10 text-accent font-medium" : "text-muted hover:text-white hover:bg-background")}>
                <item.icon className="w-5 h-5" />{item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-background w-full transition-colors">
            <LogOut className="w-5 h-5" />{t("logout")}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-surface border-b border-border px-4 h-14 flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-background rounded-lg"><Menu className="w-5 h-5" /></button>
          <span className="ml-3 font-semibold">{t("title")}</span>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
