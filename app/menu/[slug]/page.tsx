"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useProduct, useProducts } from "@/lib/queries";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/menu/ProductCard";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: product, isLoading } = useProduct(slug);
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const [qty, setQty] = useState(1);

  const cartItem = product
    ? items.find((i) => i.product.id === product.id)
    : undefined;

  const { data: related } = useProducts(
    product?.category?.name ? undefined : undefined
  );
  const relatedProducts = related?.filter((p) => p.id !== product?.id && p.category.name === product?.category.name).slice(0, 4);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-surface rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-surface rounded w-3/4" />
            <div className="h-6 bg-surface rounded w-1/2" />
            <div className="h-24 bg-surface rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted">
        Товар не найден
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem(product);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад в меню
      </Link>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              🍣
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-sm text-muted bg-surface px-3 py-1 rounded-full">
              {product.category.name}
            </span>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold mt-3">
              {product.name}
            </h1>
          </div>

          <p className="text-2xl font-bold text-accent">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p className="text-muted leading-relaxed">{product.description}</p>
          )}

          <div className="flex gap-4 text-sm text-muted">
            {product.weight_g && (
              <span className="bg-surface px-3 py-1.5 rounded-lg">
                {product.weight_g} г
              </span>
            )}
            {product.pieces && (
              <span className="bg-surface px-3 py-1.5 rounded-lg">
                {product.pieces} шт
              </span>
            )}
          </div>

          {product.allergens.length > 0 && (
            <div>
              <p className="text-sm text-muted mb-2">Аллергены:</p>
              <div className="flex flex-wrap gap-2">
                {product.allergens.map((a) => (
                  <span
                    key={a}
                    className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            {cartItem ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    updateQuantity(product.id, cartItem.quantity - 1)
                  }
                  className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center hover:bg-border transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-lg font-medium w-8 text-center">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() =>
                    updateQuantity(product.id, cartItem.quantity + 1)
                  }
                  className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <span className="text-muted text-sm ml-2">в корзине</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 bg-surface rounded-xl">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-border rounded-l-xl transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-border rounded-r-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Добавить в корзину
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-6">
            Похожие товары
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
