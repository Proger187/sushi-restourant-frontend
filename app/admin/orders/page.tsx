"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useAdminOrders, useAdminUpdateOrderStatus } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

function urgencyBorder(status: string, createdAt: string, cookingStartedAt?: string | null): string {
  const now = Date.now();
  if (status === "pending") {
    const mins = (now - new Date(createdAt).getTime()) / 60000;
    if (mins > 10) return "border-l-4 border-l-red-500";
    if (mins > 5) return "border-l-4 border-l-yellow-500";
  }
  if (status === "cooking" && cookingStartedAt) {
    const mins = (now - new Date(cookingStartedAt).getTime()) / 60000;
    if (mins > 30) return "border-l-4 border-l-orange-500";
  }
  return "";
}

export default function AdminOrdersPage() {
  const t = useTranslations("admin");
  const [filter, setFilter] = useState("");
  const { data: orders = [] } = useAdminOrders(filter || undefined);
  const updateStatus = useAdminUpdateOrderStatus();
  const queryClient = useQueryClient();

  const tabs = [
    { label: t("tab_all"), value: "" },
    { label: t("tab_pending"), value: "pending" },
    { label: t("tab_confirmed"), value: "confirmed" },
    { label: t("tab_cooking"), value: "cooking" },
    { label: t("tab_ready"), value: "ready" },
    { label: t("tab_delivering"), value: "delivering" },
    { label: t("tab_completed"), value: "completed" },
  ];

  const nextAction: Record<string, { label: string; next: string }> = {
    pending: { label: t("action_confirm"), next: "confirmed" },
    confirmed: { label: t("action_cooking"), next: "cooking" },
    cooking: { label: t("action_ready"), next: "ready" },
    ready: { label: t("action_send_out"), next: "delivering" },
  };

  function timeAgo(dateStr: string): string {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return t("just_now");
    if (mins < 60) return `${mins} ${t("min_ago")}`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  }

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          toast.success(t("status_updated"));
        },
        onError: () => toast.error(t("status_update_failed")),
      }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("orders_title")}</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              filter === tab.value
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:text-white border border-border"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const action = nextAction[order.status];
          const border = urgencyBorder(
            order.status,
            order.created_at,
            order.cooking_started_at,
          );

          return (
            <div
              key={order.id}
              className={clsx("bg-surface border border-border rounded-xl p-4 space-y-3", border)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">#{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <span className="text-sm text-muted">{timeAgo(order.created_at)}</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span>{order.customer_name}</span>
                <a href={`tel:${order.phone}`} className="text-accent hover:underline">{order.phone}</a>
              </div>

              <p className="text-sm text-muted">
                {order.items.map((i) => `${i.product_name} ×${i.quantity}`).join(", ")}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="text-sm space-x-3">
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                  {parseFloat(order.delivery_fee) > 0 && (
                    <span className="text-muted">({t("delivery")} {formatPrice(order.delivery_fee)})</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {action && (
                    <button
                      onClick={() => handleStatusChange(order.id, action.next)}
                      disabled={updateStatus.isPending}
                      className="bg-accent hover:bg-accent/90 text-white text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-50"
                    >
                      {action.label}
                    </button>
                  )}
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="border border-border text-muted hover:text-white text-xs px-3 py-1.5 rounded-lg"
                  >
                    {t("details")}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <p className="text-center text-muted py-12">{t("no_orders_found")}</p>
        )}
      </div>
    </div>
  );
}
