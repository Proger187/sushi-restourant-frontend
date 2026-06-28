"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useCategories, useProducts } from "@/lib/queries";
import CategoryFilter from "@/components/menu/CategoryFilter";
import ProductCard from "@/components/menu/ProductCard";
import ProductCardSkeleton from "@/components/menu/ProductCardSkeleton";

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategory = searchParams.get("category");

  const { data: categories = [] } = useCategories();
  const { data: products, isLoading } = useProducts(
    selectedCategory ?? undefined
  );

  const handleCategorySelect = (slug: string | null) => {
    if (slug) {
      router.push(`/menu?category=${slug}`, { scroll: false });
    } else {
      router.push("/menu", { scroll: false });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold mb-6">
        Меню
      </h1>

      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md py-2 -mx-4 px-4 mb-6">
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted">
          <p className="text-xl">Нет товаров в этой категории</p>
        </div>
      )}
    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense>
      <MenuContent />
    </Suspense>
  );
}
