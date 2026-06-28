"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  useAdminCategories,
  useAdminCreateProduct,
  useAdminUpdateProduct,
} from "@/lib/queries";
import { Product } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

const ALLERGEN_OPTIONS = ["Рыба", "Глютен", "Соя", "Молоко", "Яйца", "Орехи", "Кунжут"];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function ProductFormModal({ product, onClose }: Props) {
  const { data: categories = [] } = useAdminCategories();
  const createProduct = useAdminCreateProduct();
  const updateProduct = useAdminUpdateProduct();
  const queryClient = useQueryClient();

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category?.id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [weightG, setWeightG] = useState(product?.weight_g?.toString() ?? "");
  const [pieces, setPieces] = useState(product?.pieces?.toString() ?? "");
  const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [allergens, setAllergens] = useState<string[]>(product?.allergens ?? []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [autoSlug, setAutoSlug] = useState(!product);

  useEffect(() => {
    if (autoSlug) setSlug(slugify(name));
  }, [name, autoSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("category", categoryId);
    formData.append("description", description);
    formData.append("price", price);
    if (weightG) formData.append("weight_g", weightG);
    if (pieces) formData.append("pieces", pieces);
    formData.append("is_available", String(isAvailable));
    formData.append("is_featured", String(isFeatured));
    formData.append("allergens", JSON.stringify(allergens));
    if (imageFile) formData.append("image", imageFile);

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      onClose();
    };

    if (product) {
      updateProduct.mutate({ slug: product.slug, data: formData }, { onSuccess });
    } else {
      createProduct.mutate(formData, { onSuccess });
    }
  };

  const toggleAllergen = (a: string) => {
    setAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {product ? "Редактировать" : "Новый товар"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-background rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Изображение</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-accent file:text-white file:text-sm file:cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Название *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Slug</label>
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoSlug(false);
              }}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Категория *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            >
              <option value="">Выберите...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1">Цена *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Вес (г)</label>
              <input
                type="number"
                value={weightG}
                onChange={(e) => setWeightG(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Штук</label>
              <input
                type="number"
                value={pieces}
                onChange={(e) => setPieces(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="accent-accent"
              />
              Доступен
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-accent"
              />
              В избранном
            </label>
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Аллергены</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAllergen(a)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    allergens.includes(a)
                      ? "bg-accent/20 border-accent text-accent"
                      : "border-border text-muted hover:text-white"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white py-3 rounded-xl font-semibold"
          >
            {isPending
              ? "Сохранение..."
              : product
                ? "Сохранить"
                : "Создать"}
          </button>
        </form>
      </div>
    </div>
  );
}
