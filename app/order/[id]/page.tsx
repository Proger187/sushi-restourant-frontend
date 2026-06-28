"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { useOrder } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import { clsx } from "clsx";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидает подтверждения", color: "bg-yellow-500/20 text-yellow-400" },
  confirmed: { label: "Подтверждён", color: "bg-blue-500/20 text-blue-400" },
  cooking: { label: "Готовится", color: "bg-orange-500/20 text-orange-400" },
  delivering: { label: "В пути", color: "bg-purple-500/20 text-purple-400" },
  completed: { label: "Доставлен", color: "bg-green-500/20 text-green-400" },
  cancelled: { label: "Отменён", color: "bg-red-500/20 text-red-400" },
};

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted">
        Заказ не найден
      </div>
    );
  }

  const status = statusLabels[order.status] ?? {
    label: order.status,
    color: "bg-gray-500/20 text-gray-400",
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center space-y-4 mb-10">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
          Заказ принят!
        </h1>
        <p className="text-muted">Спасибо за ваш заказ</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Номер заказа</p>
            <p className="text-xl font-bold">#{order.order_number}</p>
          </div>
          <span
            className={clsx(
              "px-3 py-1.5 rounded-full text-sm font-medium",
              status.color
            )}
          >
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-2 text-muted text-sm">
          <Clock className="w-4 h-4" />
          <span>Ожидаемое время: 30–45 минут</span>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="font-semibold">Состав заказа</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted">
                {item.product_name}{" "}
                <span className="text-white">× {item.quantity}</span>
              </span>
              <span>{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Доставка</span>
            <span>
              {parseFloat(order.delivery_fee) === 0
                ? "Бесплатно"
                : formatPrice(order.delivery_fee)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Итого</span>
            <span className="text-accent">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="text-xs text-muted text-center">
          {formatDate(order.created_at)} · Статус обновляется автоматически
        </div>
      </div>

      <div className="text-center mt-8">
        <Link
          href="/menu"
          className="inline-block bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Вернуться в меню
        </Link>
      </div>
    </main>
  );
}
