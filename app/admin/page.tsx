"use client";

import Link from "next/link";
import { ShoppingBag, TrendingUp, Clock, Package } from "lucide-react";
import { useAdminOrders } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";

export default function AdminDashboard() {
  const { data: orders = [] } = useAdminOrders();

  const today = new Date().toISOString().slice(0, 10);
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const todayOrders = orders.filter(
    (o) => o.created_at.slice(0, 10) === today
  );
  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + parseFloat(o.total), 0);

  const stats = [
    {
      label: "Новые заказы",
      value: pendingOrders.length,
      icon: Clock,
      pulse: pendingOrders.length > 0,
    },
    { label: "Заказов сегодня", value: todayOrders.length, icon: ShoppingBag },
    {
      label: "Выручка сегодня",
      value: formatPrice(todayRevenue),
      icon: TrendingUp,
    },
    { label: "Заказов всего", value: orders.length, icon: Package },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-xl p-4 space-y-2"
          >
            <div className="flex items-center gap-2 text-muted text-sm">
              <stat.icon className="w-4 h-4" />
              {stat.label}
              {stat.pulse && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-semibold">Последние заказы</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="px-4 py-3 font-medium">Заказ</th>
                <th className="px-4 py-3 font-medium">Время</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border/50 hover:bg-background/50"
                >
                  <td className="px-4 py-3 font-medium">
                    #{order.order_number}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-accent hover:underline text-xs"
                    >
                      Открыть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center text-muted py-8">Заказов пока нет</p>
          )}
        </div>
      </div>
    </div>
  );
}
