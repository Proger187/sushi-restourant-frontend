"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/store/auth";
import { useCustomerOrders } from "@/lib/queries";
import { formatPrice, formatDate, statusColors } from "@/lib/utils";
import { clsx } from "clsx";

export default function OrdersPage() {
  const t = useTranslations("orders");
  const ts = useTranslations("status");
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.replace("/auth/login?redirect=/orders");
    }
  }, [mounted, isLoggedIn, router]);

  const { data: orders = [], isLoading } = useCustomerOrders();

  if (!mounted || !isLoggedIn) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">
        {t("title")}
      </h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <ShoppingBag className="w-12 h-12 text-muted mx-auto" />
          <p className="text-lg text-muted">{t("empty")}</p>
          <p className="text-sm text-muted">{t("empty_desc")}</p>
          <Link href="/menu" className="inline-block mt-4 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            {t("go_to_menu")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order/${order.id}`}
              className="block bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">#{order.order_number}</span>
                <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", statusColors[order.status] ?? "bg-gray-500/20 text-gray-400")}>
                  {ts(order.status as "pending")}
                </span>
              </div>
              <p className="text-sm text-muted">
                {order.items.slice(0, 3).map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}
                {order.items.length > 3 && ` +${order.items.length - 3}`}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{formatDate(order.created_at)}</span>
                <span className="font-semibold text-accent">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
