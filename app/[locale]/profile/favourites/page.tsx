"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useFavourites, useRemoveFavourite } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

export default function FavouritesPage() {
  const t = useTranslations("profile");
  const { data: favourites = [], isLoading } = useFavourites();
  const remove = useRemoveFavourite();
  const queryClient = useQueryClient();

  const handleRemove = (productId: string) => {
    // Optimistic update
    queryClient.setQueryData(["favourites"], (old: typeof favourites) =>
      old?.filter((f) => f.product.id !== productId) ?? []
    );
    remove.mutate(productId, {
      onError: () => queryClient.invalidateQueries({ queryKey: ["favourites"] }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  if (favourites.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <Heart className="w-12 h-12 text-muted mx-auto" />
        <p className="text-muted">{t("fav_empty")}</p>
        <p className="text-sm text-muted">{t("fav_empty_desc")}</p>
        <Link href="/menu" className="inline-block mt-2 bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
          {t("fav_go_menu")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {favourites.map(({ product }) => (
        <div key={product.id} className="group bg-surface rounded-2xl overflow-hidden border border-border hover:border-accent/30 transition-all">
          <div className="relative aspect-square overflow-hidden">
            <Link href={`/menu/${product.slug}`}>
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-border flex items-center justify-center text-3xl">🍣</div>
              )}
            </Link>
            <button
              onClick={() => handleRemove(product.id)}
              className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
            >
              <Heart className="w-4 h-4 fill-current" />
            </button>
          </div>
          <div className="p-3 space-y-1">
            <h3 className="font-heading text-sm font-semibold truncate">{product.name}</h3>
            <p className="text-accent font-semibold text-sm">{formatPrice(product.price)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
