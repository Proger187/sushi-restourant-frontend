"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useCreateOrder, useProfile } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import AddressMap from "@/components/checkout/AddressMap";
import { DeliveryResult } from "@/types";

const checkoutSchema = z.object({
  customer_name: z.string().min(2, "min 2"),
  phone: z.string().min(1, "required").regex(/^\+?[\d\s\-()]{7,}$/, "invalid"),
  address: z.string().min(1, "required"),
  payment_method: z.enum(["cash", "card_on_delivery"]),
  notes: z.string(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const tErr = useTranslations("errors");
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);
  const createOrder = useCreateOrder();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const { data: profile } = useProfile(isLoggedIn);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.replace("/login?next=/checkout");
    }
  }, [mounted, isLoggedIn, router]);

  useEffect(() => {
    if (mounted && items.length === 0 && isLoggedIn) {
      router.replace("/menu");
    }
  }, [mounted, items.length, isLoggedIn, router]);

  const { register, handleSubmit, setValue, formState: { errors, isValid } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      customer_name: "",
      phone: "",
      address: "",
      payment_method: "cash",
      notes: "",
    },
  });

  useEffect(() => {
    if (user?.full_name) {
      setValue("customer_name", user.full_name, { shouldValidate: true });
    }
  }, [user, setValue]);

  useEffect(() => {
    if (profile?.phone) {
      setValue("phone", profile.phone, { shouldValidate: true });
    }
  }, [profile, setValue]);

  const handleAddressSelect = useCallback((address: string, lat: number, lng: number) => {
    setValue("address", address, { shouldValidate: true });
    setCoords({ lat, lng });
  }, [setValue]);

  const handleDeliveryResult = useCallback((result: DeliveryResult | null) => {
    setDeliveryResult(result);
  }, []);

  const deliveryFee = deliveryResult?.available ? parseFloat(deliveryResult.delivery_fee ?? "0") : 0;
  const total = subtotal + deliveryFee;
  const minOrder = parseFloat(deliveryResult?.min_order_amount ?? "0");
  const belowMinimum = deliveryResult?.available && subtotal < minOrder;
  const canSubmit = isValid && deliveryResult?.available && !belowMinimum && !createOrder.isPending;

  const onSubmit = (data: CheckoutForm) => {
    if (!coords || !deliveryResult?.available) return;
    createOrder.mutate(
      {
        ...data,
        latitude: coords.lat, longitude: coords.lng,
        delivery_km: deliveryResult.distance_km, delivery_fee: deliveryResult.delivery_fee,
        estimated_delivery_minutes: deliveryResult.estimated_minutes,
        items: items.map((i) => ({ product: i.product.id, quantity: i.quantity })),
      },
      {
        onSuccess: (response) => { clearCart(); toast.success(t("success")); router.push(`/order/${response.id}`); },
        onError: () => { toast.error(t("error")); },
      }
    );
  };

  if (!mounted || !isLoggedIn || items.length === 0) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-8">{t("title")}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("address_title")}</h2>
            <AddressMap onDeliveryResult={handleDeliveryResult} onAddressSelect={handleAddressSelect} cartSubtotal={subtotal} />
            <div>
              <input {...register("address")} placeholder={t("address_placeholder")} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors" />
              {errors.address && <p className="text-red-400 text-sm mt-1">{tErr("required")}</p>}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("contact_title")}</h2>
            <div>
              <input {...register("customer_name")} placeholder={t("name_placeholder")} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors" />
              {errors.customer_name && <p className="text-red-400 text-sm mt-1">{tErr("required")}</p>}
            </div>
            <div>
              <input {...register("phone")} placeholder={t("phone_placeholder")} type="tel" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors" />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{tErr("invalid_phone")}</p>}
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">{t("payment_label")}</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input {...register("payment_method")} type="radio" value="cash" className="accent-accent" /><span>{t("cash")}</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input {...register("payment_method")} type="radio" value="card_on_delivery" className="accent-accent" /><span>{t("card")}</span></label>
              </div>
            </div>
            <textarea {...register("notes")} placeholder={t("notes_placeholder")} rows={3} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none" />
          </div>
        </div>
        <div>
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">{t("order_title")}</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted">{item.product.name} <span className="text-white">× {item.quantity}</span></span>
                  <span>{formatPrice(parseFloat(item.product.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted">{t("subtotal")}</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">{t("delivery_fee")}</span><span>{deliveryResult?.available ? deliveryFee === 0 ? t("free") : formatPrice(deliveryFee) : "—"}</span></div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border"><span>{t("total")}</span><span className="text-accent">{formatPrice(total)}</span></div>
              {deliveryResult?.available && deliveryResult.estimated_minutes && (
                <div className="flex justify-between text-sm pt-1"><span className="text-muted">{t("est_time")}</span><span>~{deliveryResult.estimated_minutes} min</span></div>
              )}
            </div>
            {createOrder.isError && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{t("error")}</div>}
            <button type="submit" disabled={!canSubmit} className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {createOrder.isPending ? (<><Loader2 className="w-5 h-5 animate-spin" />{t("submitting")}</>) : `${t("submit")} · ${formatPrice(total)}`}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
