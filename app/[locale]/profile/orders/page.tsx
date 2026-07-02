"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { useCustomerOrders } from "@/lib/queries";
import { formatPrice, formatDate, statusColors } from "@/lib/utils";

type Tab = "all" | "active" | "completed" | "cancelled";

const ACTIVE_STATUSES = ["pending", "confirmed", "cooking", "ready", "delivering"];

export default function ProfileOrdersPage() {
  const t = useTranslations("profile");
  const ts = useTranslations("status");
  const { data: orders = [], isLoading } = useCustomerOrders();
  const [tab, setTab] = useState<Tab>("all");

  const filtered = orders.filter((o) => {
    if (tab === "active") return ACTIVE_STATUSES.includes(o.status);
    if (tab === "completed") return o.status === "completed";
    if (tab === "cancelled") return o.status === "cancelled";
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: t("tab_all") },
    { key: "active", label: t("tab_active") },
    { key: "completed", label: t("tab_completed") },
    { key: "cancelled", label: t("tab_cancelled") },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={clsx(
              "px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              tab === key ? "bg-accent text-white" : "bg-surface text-muted hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <ShoppingBag className="w-12 h-12 text-muted mx-auto" />
          <p className="text-muted">{t("orders_empty")}</p>
          <Link href="/menu" className="inline-block mt-2 bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
            {t("orders_go_menu")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const preview = order.items.slice(0, 2).map((i) => `${i.product_name} ×${i.quantity}`).join(", ");
            const extra = order.items.length > 2 ? ` ${t("and_more", { count: order.items.length - 2 })}` : "";
            return (
              <div key={order.id} className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">#{order.order_number}</span>
                  <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", statusColors[order.status] ?? "bg-gray-500/20 text-gray-400")}>
                    {ts(order.status as "pending")}
                  </span>
                </div>
                <p className="text-sm text-muted">{preview}{extra}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">{formatDate(order.created_at)}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-accent">{formatPrice(order.total)}</span>
                    <Link href={`/order/${order.id}`} className="text-sm text-accent hover:underline">
                      {t("view_order")}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
