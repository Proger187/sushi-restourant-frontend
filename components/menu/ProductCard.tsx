"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Heart } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { useFavourites, useAddFavourite, useRemoveFavourite, FavouriteItem } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const t = useTranslations("menu");
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const queryClient = useQueryClient();

  const { data: favourites = [] } = useFavourites(isLoggedIn);
  const addFav = useAddFavourite();
  const removeFav = useRemoveFavourite();

  const cartItem = items.find((i) => i.product.id === product.id);
  const isFav = favourites.some((f) => f.product.id === product.id);

  const toggleFavourite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push(`/login?next=/menu`);
      return;
    }
    if (isFav) {
      queryClient.setQueryData(["favourites"], (old: FavouriteItem[] = []) =>
        old.filter((f) => f.product.id !== product.id)
      );
      removeFav.mutate(product.id, {
        onError: () => queryClient.invalidateQueries({ queryKey: ["favourites"] }),
      });
    } else {
      queryClient.setQueryData(["favourites"], (old: FavouriteItem[] = []) => [
        ...old,
        { product, added_at: new Date().toISOString() } as FavouriteItem,
      ]);
      addFav.mutate(product.id, {
        onError: () => queryClient.invalidateQueries({ queryKey: ["favourites"] }),
        onSuccess: (data) => {
          queryClient.setQueryData(["favourites"], (old: FavouriteItem[] = []) =>
            old.map((f) => (f.product.id === product.id ? data : f))
          );
        },
      });
    }
  };

  return (
    <div className="group bg-surface rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all duration-300 hover:scale-[1.02]">
      <Link href={`/menu/${product.slug}`} prefetch={true} className="block">
        <div className="relative aspect-square overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
          <button
            onClick={toggleFavourite}
            className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors hover:bg-background"
            aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFav ? "fill-red-500 text-red-500" : "text-white/70"
              }`}
            />
          </button>
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <h3 className="font-heading text-lg font-semibold truncate">{product.name}</h3>
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
