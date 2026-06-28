import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

export default function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={clsx("animate-spin text-muted", className ?? "w-6 h-6")} />
  );
}
