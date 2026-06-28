import { AlertTriangle, CheckCircle, MapPin } from "lucide-react";
import { DeliveryResult } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  result: DeliveryResult;
  cartSubtotal: number;
}

export default function DeliveryInfoPanel({ result, cartSubtotal }: Props) {
  if (!result.available) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-red-400">
          {result.message ?? "Адрес вне зоны доставки"}
        </p>
      </div>
    );
  }

  const minOrder = parseFloat(result.min_order_amount ?? "0");
  const belowMinimum = cartSubtotal < minOrder;
  const isFreeDelivery = parseFloat(result.delivery_fee ?? "0") === 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Доставка доступна</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            Расстояние
          </span>
          <span>{result.distance_km} км</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Стоимость доставки</span>
          <span className={isFreeDelivery ? "text-green-400" : ""}>
            {isFreeDelivery ? "Бесплатно" : formatPrice(result.delivery_fee!)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Минимальный заказ</span>
          <span>{formatPrice(result.min_order_amount!)}</span>
        </div>
      </div>

      {belowMinimum && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-amber-400 text-sm">
            Минимальный заказ не выполнен. Добавьте ещё на{" "}
            {formatPrice(minOrder - cartSubtotal)}
          </p>
        </div>
      )}
    </div>
  );
}
