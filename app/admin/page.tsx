"use client";

import Link from "next/link";
import { ShoppingBag, TrendingUp, Clock, Package, Timer } from "lucide-react";
import { useAdminOrders } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import { useTranslations } from "next-intl";

import { Order } from "@/types";

function avgMinutes(orders: Order[], startField: keyof Order, endField: keyof Order): number | null {
  const valid = orders.filter((o) => o[startField] && o[endField]);
  if (valid.length === 0) return null;
  const totalMs = valid.reduce((sum, o) => {
    return sum + (new Date(o[endField] as string).getTime() - new Date(o[startField] as string).getTime());
  }, 0);
  return Math.round(totalMs / valid.length / 60000);
}

export default function AdminDashboard() {
  const { data: orders = [] } = useAdminOrders();
  const t = useTranslations("admin");

  const today = new Date().toISOString().slice(0, 10);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const todayOrders = orders.filter((o) => o.created_at.slice(0, 10) === today);
  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);

  const todayCompleted = todayOrders.filter((o) => o.status === "completed");
  const avgCooking = avgMinutes(todayCompleted, "cooking_started_at", "ready_at");
  const avgDelivery = avgMinutes(todayCompleted, "picked_up_at", "delivered_at");
  const avgTotal = avgMinutes(todayCompleted, "created_at", "delivered_at");

  const stats = [
    { label: t("stat_pending"), value: pendingOrders.length, icon: Clock, pulse: pendingOrders.length > 0 },
    { label: t("stat_today"), value: todayOrders.length, icon: ShoppingBag },
    { label: t("stat_revenue"), value: formatPrice(todayRevenue), icon: TrendingUp },
    { label: t("stat_total"), value: orders.length, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard_title")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-muted text-sm">
              <stat.icon className="w-4 h-4" />
              {stat.label}
              {stat.pulse && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {todayCompleted.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Timer className="w-4 h-4 text-muted" /> {t("performance")}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted">{t("avg_cooking")}</p>
              <p className="font-semibold">{avgCooking ?? "—"} {t("min")}</p>
            </div>
            <div>
              <p className="text-muted">{t("avg_delivery")}</p>
              <p className="font-semibold">{avgDelivery ?? "—"} {t("min")}</p>
            </div>
            <div>
              <p className="text-muted">{t("avg_total")}</p>
              <p className="font-semibold">{avgTotal ?? "—"} {t("min")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-semibold">{t("recent_orders")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="px-4 py-3 font-medium">{t("col_order")}</th>
                <th className="px-4 py-3 font-medium">{t("col_time")}</th>
                <th className="px-4 py-3 font-medium">{t("col_customer")}</th>
                <th className="px-4 py-3 font-medium">{t("col_total")}</th>
                <th className="px-4 py-3 font-medium">{t("col_status")}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="border-b border-border/50 hover:bg-background/50">
                  <td className="px-4 py-3 font-medium">#{order.order_number}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-accent hover:underline text-xs">{t("open")}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center text-muted py-8">{t("no_orders")}</p>}
        </div>
      </div>
    </div>
  );
}
