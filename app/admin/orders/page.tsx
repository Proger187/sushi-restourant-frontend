"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import { useAdminOrders, useAdminUpdateOrderStatus } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import { useQueryClient } from "@tanstack/react-query";

const tabs = [
  { label: "Все", value: "" },
  { label: "Новые", value: "pending" },
  { label: "Подтверждены", value: "confirmed" },
  { label: "Готовятся", value: "cooking" },
  { label: "В доставке", value: "delivering" },
  { label: "Выполнены", value: "completed" },
];

const nextAction: Record<string, { label: string; next: string }> = {
  pending: { label: "Подтвердить", next: "confirmed" },
  confirmed: { label: "Готовим", next: "cooking" },
  cooking: { label: "Передать курьеру", next: "delivering" },
  delivering: { label: "Выполнено", next: "completed" },
};

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState("");
  const { data: orders = [] } = useAdminOrders(filter || undefined);
  const updateStatus = useAdminUpdateOrderStatus();
  const queryClient = useQueryClient();

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          toast.success("Статус обновлён");
        },
        onError: () => toast.error("Ошибка обновления статуса"),
      }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Заказы</h1>

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
          return (
            <div
              key={order.id}
              className="bg-surface border border-border rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">#{order.order_number}</span>
                  <StatusBadge status={order.status} />
                </div>
                <span className="text-sm text-muted">
                  {formatDate(order.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span>{order.customer_name}</span>
                <a
                  href={`tel:${order.phone}`}
                  className="text-accent hover:underline"
                >
                  {order.phone}
                </a>
              </div>

              <p className="text-sm text-muted">
                {order.items
                  .map((i) => `${i.product_name} ×${i.quantity}`)
                  .join(", ")}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="text-sm space-x-3">
                  <span className="font-semibold">
                    {formatPrice(order.total)}
                  </span>
                  {parseFloat(order.delivery_fee) > 0 && (
                    <span className="text-muted">
                      (доставка {formatPrice(order.delivery_fee)})
                    </span>
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
                    Детали
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <p className="text-center text-muted py-12">Заказов не найдено</p>
        )}
      </div>
    </div>
  );
}
