"use client";

import Link from "next/link";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { useOrder, useConfirmDelivery } from "@/lib/queries";
import { formatPrice, formatDate, statusColors } from "@/lib/utils";
import StatusTimeline from "@/components/order/StatusTimeline";
import { useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import Logo from "@/components/layout/Logo";

export default function OrderStatusPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const t = useTranslations("order");
  const ts = useTranslations("status");
  const { data: order, isLoading } = useOrder(id);
  const confirmDelivery = useConfirmDelivery();
  const queryClient = useQueryClient();

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
        {t("not_found")}
      </div>
    );
  }

  const isDelivered = order.status === "completed";
  const isCancelled = order.status === "cancelled";
  const isDelivering = order.status === "delivering";

  let totalTimeMinutes: number | null = null;
  if (isDelivered && order.delivered_at) {
    totalTimeMinutes = Math.round(
      (new Date(order.delivered_at).getTime() - new Date(order.created_at).getTime()) / 60000
    );
  }

  const handleConfirmDelivery = () => {
    confirmDelivery.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["order", id] });
        toast.success(t("enjoy"));
      },
    });
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center space-y-4 mb-10">
        {isDelivered ? (
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-accent" />
          </div>
        )}
        <h1 className="font-heading text-3xl font-bold">
          {isDelivered ? t("enjoy") : t("confirmed_title")}
        </h1>
        {isDelivered && order.delivered_at && (
          <p className="text-muted">
            {t("delivered_at", { time: formatDate(order.delivered_at) })}
            {totalTimeMinutes != null && ` · ${t("total_time", { minutes: String(totalTimeMinutes) })}`}
          </p>
        )}
        {!isDelivered && !isCancelled && (
          <p className="text-muted">{t("confirmed_subtitle")}</p>
        )}
      </div>

      {isDelivering && (
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6 mb-6 text-center space-y-4">
          <p className="text-lg font-semibold">{t("on_the_way")}</p>
          <button
            onClick={handleConfirmDelivery}
            disabled={confirmDelivery.isPending}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            {confirmDelivery.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t("confirming")}</>
            ) : (
              <><CheckCircle className="w-5 h-5" />{t("confirm_delivery")}</>
            )}
          </button>
        </div>
      )}

      <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">{t("order_number")}</p>
            <p className="text-xl font-bold">#{order.order_number}</p>
          </div>
          <span className={clsx(
            "px-3 py-1.5 rounded-full text-sm font-medium",
            statusColors[order.status] ?? "bg-gray-500/20 text-gray-400"
          )}>
            {ts(order.status as "pending")}
          </span>
        </div>

        {!isDelivered && !isCancelled && order.estimated_delivery_minutes && (
          <div className="bg-accent/10 border border-accent/20 rounded-xl p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-sm">{t("estimated")}</span>
          </div>
        )}

        {order.status_history && (
          <StatusTimeline
            currentStatus={order.status}
            statusHistory={order.status_history}
            estimatedMinutes={order.estimated_delivery_minutes}
          />
        )}

        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="font-semibold">{t("items_title")}</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted">{item.product_name} <span className="text-white">× {item.quantity}</span></span>
              <span>{formatPrice(item.line_total)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">{t("delivery")}</span>
            <span>{parseFloat(order.delivery_fee) === 0 ? t("free") : formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>{t("total")}</span>
            <span className="text-accent">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="text-xs text-muted text-center">
          {formatDate(order.created_at)} · {t("auto_refresh")}
        </div>
      </div>

      <div className="text-center mt-8 space-y-4">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <Link href="/menu" className="inline-block bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
          {t("back_to_menu")}
        </Link>
      </div>
    </main>
  );
}
