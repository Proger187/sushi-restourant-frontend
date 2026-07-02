import { AlertTriangle, CheckCircle, MapPin, Clock, Truck, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { DeliveryResult } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  result: DeliveryResult;
  cartSubtotal: number;
}

export default function DeliveryInfoPanel({ result, cartSubtotal }: Props) {
  const t = useTranslations("checkout");

  if (!result.available) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-2">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-400 font-medium">{result.message ?? t("out_of_zone")}</p>
        </div>
        {result.distance_km != null && (
          <p className="text-red-400/70 text-sm pl-8">{result.distance_km} km</p>
        )}
      </div>
    );
  }

  const minOrder = parseFloat(result.min_order_amount ?? "0");
  const belowMinimum = cartSubtotal < minOrder;
  const isFreeDelivery = parseFloat(result.delivery_fee ?? "0") === 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-green-400 mb-1">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">{t("available")}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted flex-shrink-0" />
          <span>{result.distance_km} km</span>
          <span className="text-muted">· {result.zone_name}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted flex-shrink-0" />
          <span>~{result.estimated_minutes} min</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Truck className="w-4 h-4 text-muted flex-shrink-0" />
          <span className={isFreeDelivery ? "text-green-400" : ""}>
            {t("delivery_fee")}: {isFreeDelivery ? t("free") : formatPrice(result.delivery_fee!)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Check className="w-4 h-4 text-muted flex-shrink-0" />
          <span>{t("min_order")}: {formatPrice(result.min_order_amount!)}</span>
        </div>
      </div>

      {belowMinimum ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-amber-400 text-sm">
            {t("min_not_met", { amount: formatPrice(minOrder - cartSubtotal) })}
          </p>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2.5 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{t("min_order")} ✓</p>
        </div>
      )}
    </div>
  );
}
