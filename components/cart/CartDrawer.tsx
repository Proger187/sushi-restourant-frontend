"use client";

import { useEffect, useState } from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal());

  useEffect(() => {
    const handler = () => setOpen((prev) => !prev);
    document.addEventListener("toggle-cart", handler);
    return () => document.removeEventListener("toggle-cart", handler);
  }, []);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-border z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Корзина</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-background rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted">
              <p>Корзина пуста</p>
              <Link
                href="/menu"
                className="text-accent hover:underline"
                onClick={() => setOpen(false)}
              >
                Перейти в меню
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 bg-background rounded-xl p-3"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-border flex-shrink-0">
                      {item.product.image && (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-accent font-bold text-sm">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                          className="w-6 h-6 rounded bg-surface flex items-center justify-center hover:bg-border"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                          className="w-6 h-6 rounded bg-surface flex items-center justify-center hover:bg-border"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-auto p-1 text-muted hover:text-accent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border space-y-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Итого</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="block w-full bg-accent hover:bg-accent/90 text-white text-center py-3 rounded-xl font-semibold transition-colors"
                >
                  Перейти к оформлению
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full text-center text-sm text-muted hover:text-white transition-colors"
                >
                  Очистить корзину
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
