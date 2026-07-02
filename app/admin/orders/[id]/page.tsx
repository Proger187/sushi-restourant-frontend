"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, User, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useAdminOrder, useAdminUpdateOrderStatus } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/admin/StatusBadge";
import { clsx } from "clsx";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const TIMESTAMP_LABELS: [string, string][] = [
  ["confirmed_at", "Confirmed"],
  ["cooking_started_at", "Cooking"],
  ["ready_at", "Ready"],
  ["picked_up_at", "Picked up"],
  ["delivered_at", "Delivered"],
];

export default function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { data: order } = useAdminOrder(id);
  const updateStatus = useAdminUpdateOrderStatus();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const t = useTranslations("admin");

  if (!order) return null;

  const NEXT_ACTION: Record<string, { label: string; next: string; color: string }> = {
    pending: { label: t("action_confirm_order"), next: "confirmed", color: "bg-green-600 hover:bg-green-700" },
    confirmed: { label: t("action_start_cooking"), next: "cooking", color: "bg-orange-600 hover:bg-orange-700" },
    cooking: { label: t("action_ready_pickup"), next: "ready", color: "bg-blue-600 hover:bg-blue-700" },
    ready: { label: t("action_out_delivery"), next: "delivering", color: "bg-purple-600 hover:bg-purple-700" },
  };

  const statusHistory = order.status_history ?? [];
  const action = NEXT_ACTION[order.status];
  const canCancel = !["completed", "cancelled"].includes(order.status);

  const handleAction = (newStatus: string) => {
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
          queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
          toast.success(t("status_updated"));
          setNote("");
        },
        onError: () => toast.error(t("status_update_failed")),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">#{order.order_number}</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Timestamps row */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap gap-4 text-xs text-muted">
        <span><Clock className="w-3 h-3 inline mr-1" />{t("col_time")}: {formatDate(order.created_at)}</span>
        {TIMESTAMP_LABELS.map(([field, label]) => {
          const val = order[field as keyof typeof order] as string | null;
          return val ? (
            <span key={field}>{label}: {new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          ) : null;
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">{t("customer")}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted" />{order.customer_name}</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted" /><a href={`tel:${order.phone}`} className="text-accent">{order.phone}</a></div>
            <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-muted mt-0.5" />{order.address}</div>
          </div>
          {order.notes && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted mb-1">{t("notes")}:</p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Status actions */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold">{t("update_status")}</h2>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("note_placeholder")}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
          />
          {action && (
            <button
              onClick={() => handleAction(action.next)}
              disabled={updateStatus.isPending}
              className={clsx("w-full text-white py-3 rounded-xl font-semibold disabled:opacity-50", action.color)}
            >
              {action.label}
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => handleAction("cancelled")}
              disabled={updateStatus.isPending}
              className="w-full border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2.5 rounded-xl text-sm disabled:opacity-50"
            >
              {t("cancel_order")}
            </button>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <h2 className="font-semibold">{t("order_items")}</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.product_name} <span className="text-muted">× {item.quantity}</span></span>
            <span>{formatPrice(item.line_total)}</span>
          </div>
        ))}
        <div className="border-t border-border pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-muted"><span>{t("subtotal")}</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-muted"><span>{t("delivery")}</span><span>{formatPrice(order.delivery_fee)}</span></div>
          <div className="flex justify-between font-bold text-base pt-1"><span>{t("total")}</span><span className="text-accent">{formatPrice(order.total)}</span></div>
        </div>
      </div>

      {/* Status history */}
      {statusHistory.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">{t("status_history")}</h2>
          <div className="space-y-2">
            {statusHistory.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 text-sm">
                <StatusBadge status={entry.status} />
                <span className="text-muted">{formatDate(entry.changed_at)}</span>
                <span className="text-muted">{t("by")} {entry.changed_by}</span>
                {entry.note && <span className="text-white">— {entry.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted">
        {t("payment")}: {order.payment_method === "cash" ? t("cash") : t("card")}
      </p>
    </div>
  );
}
