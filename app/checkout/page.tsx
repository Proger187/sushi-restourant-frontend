"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import { useCreateOrder } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import AddressMap from "@/components/checkout/AddressMap";
import { DeliveryResult } from "@/types";

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Минимум 2 символа"),
  phone: z
    .string()
    .min(1, "Обязательное поле")
    .regex(/^\+?[\d\s\-()]{7,}$/, "Неверный формат телефона"),
  email: z.string().email("Неверный email").or(z.literal("")),
  address: z.string().min(1, "Укажите адрес"),
  payment_method: z.enum(["cash", "card_on_delivery"]),
  notes: z.string(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const createOrder = useCreateOrder();

  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(
    null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      address: "",
      payment_method: "cash",
      notes: "",
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/menu");
    }
  }, [items.length, router]);

  const handleAddressSelect = useCallback(
    (address: string, lat: number, lng: number) => {
      setValue("address", address, { shouldValidate: true });
      setCoords({ lat, lng });
    },
    [setValue]
  );

  const handleDeliveryResult = useCallback(
    (result: DeliveryResult | null) => {
      setDeliveryResult(result);
    },
    []
  );

  const deliveryFee = deliveryResult?.available
    ? parseFloat(deliveryResult.delivery_fee ?? "0")
    : 0;
  const total = subtotal + deliveryFee;
  const minOrder = parseFloat(deliveryResult?.min_order_amount ?? "0");
  const belowMinimum = deliveryResult?.available && subtotal < minOrder;

  const canSubmit =
    isValid &&
    deliveryResult?.available &&
    !belowMinimum &&
    !createOrder.isPending;

  const onSubmit = (data: CheckoutForm) => {
    if (!coords || !deliveryResult?.available) return;

    createOrder.mutate(
      {
        ...data,
        latitude: coords.lat,
        longitude: coords.lng,
        delivery_km: deliveryResult.distance_km,
        delivery_fee: deliveryResult.delivery_fee,
        items: items.map((i) => ({
          product: i.product.id,
          quantity: i.quantity,
        })),
      },
      {
        onSuccess: (response) => {
          clearCart();
          toast.success("Заказ оформлен!");
          router.push(`/order/${response.id}`);
        },
        onError: () => {
          toast.error("Ошибка при оформлении заказа");
        },
      }
    );
  };

  if (items.length === 0) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-8">
        Оформление заказа
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid lg:grid-cols-2 gap-8"
      >
        {/* Left — Address & Delivery */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Адрес доставки</h2>
            <AddressMap
              onDeliveryResult={handleDeliveryResult}
              onAddressSelect={handleAddressSelect}
              cartSubtotal={subtotal}
            />
            <div>
              <input
                {...register("address")}
                placeholder="Адрес (заполнится автоматически)"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              {errors.address && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Контактные данные</h2>

            <div>
              <input
                {...register("customer_name")}
                placeholder="Ваше имя *"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              {errors.customer_name && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.customer_name.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("phone")}
                placeholder="Телефон *"
                type="tel"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register("email")}
                placeholder="Email (необязательно)"
                type="email"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">
                Способ оплаты
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register("payment_method")}
                    type="radio"
                    value="cash"
                    className="accent-accent"
                  />
                  <span>Наличные</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register("payment_method")}
                    type="radio"
                    value="card_on_delivery"
                    className="accent-accent"
                  />
                  <span>Картой курьеру</span>
                </label>
              </div>
            </div>

            <div>
              <textarea
                {...register("notes")}
                placeholder="Комментарий к заказу"
                rows={3}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right — Order Summary */}
        <div>
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">Ваш заказ</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted">
                    {item.product.name}{" "}
                    <span className="text-white">× {item.quantity}</span>
                  </span>
                  <span>
                    {formatPrice(
                      parseFloat(item.product.price) * item.quantity
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Подытог</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Доставка</span>
                <span>
                  {deliveryResult?.available
                    ? deliveryFee === 0
                      ? "Бесплатно"
                      : formatPrice(deliveryFee)
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Итого</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>

            {createOrder.isError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                Ошибка при оформлении заказа. Попробуйте ещё раз.
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Оформляем...
                </>
              ) : (
                "Оформить заказ"
              )}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
