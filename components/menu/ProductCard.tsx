"use client";

import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const t = useTranslations("menu");
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const cartItem = items.find((i) => i.product.id === product.id);

  return (
    <div className="group bg-surface rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-300 hover:scale-[1.02]">
      <div className="relative aspect-square overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-border flex items-center justify-center text-muted text-3xl">
            🍣
          </div>
        )}
        <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-xs px-2.5 py-1 rounded-full text-muted">
          {product.category.name}
        </span>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <div className="flex items-center gap-2 text-sm text-muted">
          {product.weight_g && <span>{product.weight_g} {t("grams")}</span>}
          {product.weight_g && product.pieces && <span>·</span>}
          {product.pieces && <span>{product.pieces} {t("pieces")}</span>}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-accent">{formatPrice(product.price)}</span>
          {cartItem ? (
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="w-8 h-8 rounded-lg bg-background flex items-center justify-center hover:bg-border transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-medium">{cartItem.quantity}</span>
              <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                addItem(product);
                toast.success(`${product.name} ${t("added")}`);
              }}
              className="bg-accent hover:bg-accent/80 text-white text-sm px-4 py-2 rounded-xl font-medium transition-colors"
            >
              {t("add_to_cart")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
