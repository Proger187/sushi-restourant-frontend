"use client";

import { CheckCircle, Loader2, Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils";
import { StatusHistoryEntry } from "@/types";

type StatusKey = "pending" | "confirmed" | "cooking" | "ready" | "delivering" | "completed" | "cancelled";

const STATUSES_IN_ORDER = ["pending", "confirmed", "cooking", "ready", "delivering", "completed"];

const STATUS_KEYS: Record<string, string> = {
  pending: "pending",
  confirmed: "confirmed",
  cooking: "cooking",
  ready: "ready",
  delivering: "delivering",
  completed: "completed",
};

interface Props {
  currentStatus: string;
  statusHistory: StatusHistoryEntry[];
  estimatedMinutes?: number | null;
}

export default function StatusTimeline({ currentStatus, statusHistory, estimatedMinutes }: Props) {
  const t = useTranslations("status");
  const tOrder = useTranslations("order");

  if (currentStatus === "cancelled") {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
        <p className="text-red-400 font-semibold">{t("cancelled")}</p>
      </div>
    );
  }

  const currentIndex = STATUSES_IN_ORDER.indexOf(currentStatus);
  const historyMap = new Map<string, StatusHistoryEntry>();
  for (const entry of statusHistory) {
    if (!historyMap.has(entry.status)) {
      historyMap.set(entry.status, entry);
    }
  }

  return (
    <div className="space-y-0">
      {STATUSES_IN_ORDER.map((status, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const historyEntry = historyMap.get(status);
        const isLast = i === STATUSES_IN_ORDER.length - 1;

        return (
          <div key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-6 h-6 text-accent animate-spin flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-border flex-shrink-0" />
              )}
              {!isLast && (
                <div className={`w-0.5 h-8 ${isCompleted ? "bg-green-400" : "bg-border"}`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${isCompleted ? "text-green-400" : isCurrent ? "text-white" : "text-muted"}`}>
                {t(STATUS_KEYS[status] as StatusKey)}
              </p>
              {historyEntry && (
                <p className="text-xs text-muted mt-0.5">
                  {formatDate(historyEntry.changed_at)}
                </p>
              )}
              {isCurrent && status === "delivering" && (
                <p className="text-xs text-accent mt-1">🛵 {tOrder("on_the_way")}</p>
              )}
              {isCurrent && estimatedMinutes && status !== "completed" && (
                <p className="text-xs text-muted mt-0.5">~{estimatedMinutes} min</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
