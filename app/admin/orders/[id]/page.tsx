"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, User } from "lucide-react";
import { useAdminOrder, useAdminUpdateOrderStatus } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import { clsx } from "clsx";
import { useQueryClient } from "@tanstack/react-query";

const allStatuses = [
  "pending",
  "confirmed",
  "cooking",
  "delivering",
  "completed",
  "cancelled",
];

const statusSteps = ["pending", "confirmed", "cooking", "delivering", "completed"];

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order } = useAdminOrder(id);
  const updateStatus = useAdminUpdateOrderStatus();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  if (!order) return null;

  const currentStepIndex = statusSteps.indexOf(order.status);
  const effectiveStatus = selectedStatus ?? order.status;

  const handleSave = () => {
    if (!selectedStatus || selectedStatus === order.status) return;
    updateStatus.mutate(
      { id, status: selectedStatus },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
          setSelectedStatus(null);
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">#{order.order_number}</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Status Timeline */}
      {order.status !== "cancelled" && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0",
                    i <= currentStepIndex
                      ? "bg-accent text-white"
                      : "bg-border text-muted"
                  )}
                >
                  {i + 1}
                </div>
                {i < statusSteps.length - 1 && (
                  <div
                    className={clsx(
                      "h-0.5 flex-1 mx-1",
                      i < currentStepIndex ? "bg-accent" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Клиент</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted" />
              {order.customer_name}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted" />
              <a href={`tel:${order.phone}`} className="text-accent">
                {order.phone}
              </a>
            </div>
            {order.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted" />
                {order.email}
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted mt-0.5" />
              {order.address}
            </div>
          </div>
          {order.notes && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted mb-1">Комментарий:</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Status Change */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Изменить статус</h2>
          <select
            value={effectiveStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={
              !selectedStatus ||
              selectedStatus === order.status ||
              updateStatus.isPending
            }
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium"
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">Состав заказа</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.product_name}{" "}
                <span className="text-muted">× {item.quantity}</span>
              </span>
              <span>{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-muted">
            <span>Подытог</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Доставка</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1">
            <span>Итого</span>
            <span className="text-accent">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted">
        Создан: {formatDate(order.created_at)} · Оплата: {order.payment_method === "cash" ? "Наличные" : "Картой курьеру"}
      </p>
    </div>
  );
}
