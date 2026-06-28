import { clsx } from "clsx";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Новый", color: "bg-yellow-500/20 text-yellow-400" },
  confirmed: { label: "Подтверждён", color: "bg-blue-500/20 text-blue-400" },
  cooking: { label: "Готовится", color: "bg-orange-500/20 text-orange-400" },
  delivering: { label: "В пути", color: "bg-purple-500/20 text-purple-400" },
  completed: { label: "Выполнен", color: "bg-green-500/20 text-green-400" },
  cancelled: { label: "Отменён", color: "bg-red-500/20 text-red-400" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    color: "bg-gray-500/20 text-gray-400",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        config.color
      )}
    >
      {status === "pending" && (
        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1.5 animate-pulse" />
      )}
      {config.label}
    </span>
  );
}
