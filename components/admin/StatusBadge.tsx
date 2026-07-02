"use client";

import { clsx } from "clsx";
import { useTranslations } from "next-intl";
import { statusColors } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("status");
  const color = statusColors[status] ?? "bg-gray-500/20 text-gray-400";
  const label = statusColors[status] ? t(status as "pending" | "confirmed" | "cooking" | "ready" | "delivering" | "completed" | "cancelled") : status;

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        color
      )}
    >
      {status === "pending" && (
        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1.5 animate-pulse" />
      )}
      {label}
    </span>
  );
}
