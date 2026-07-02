"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  useAdminProducts,
  useAdminCategories,
  useAdminDeleteProduct,
} from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";
import ProductFormModal from "@/components/admin/ProductFormModal";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export default function AdminProductsPage() {
  const { data: products = [] } = useAdminProducts();
  const { data: categories = [] } = useAdminCategories();
  const deleteProduct = useAdminDeleteProduct();
  const queryClient = useQueryClient();
  const t = useTranslations("admin");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.category.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (slug: string) => {
    if (!confirm(t("delete_product"))) return;
    deleteProduct.mutate(slug, {
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("products_title")}</h1>
        <button
          onClick={() => {
            setModalProduct(null);
            setShowModal(true);
          }}
          className="bg-accent hover:bg-accent/90 text-white text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("add")}
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
        >
          <option value="">{t("all_categories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="px-4 py-3 font-medium w-12" />
                <th className="px-4 py-3 font-medium">{t("col_name")}</th>
                <th className="px-4 py-3 font-medium">{t("col_category")}</th>
                <th className="px-4 py-3 font-medium">{t("col_price")}</th>
                <th className="px-4 py-3 font-medium">{t("col_weight")}</th>
                <th className="px-4 py-3 font-medium text-center">
                  {t("col_available")}
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border/50 hover:bg-background/50"
                >
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-border">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 text-muted">
                    {product.weight_g ? `${product.weight_g}г` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={
                        product.is_available
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {product.is_available ? t("yes") : t("no")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => {
                          setModalProduct(product);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-muted hover:text-white rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.slug)}
                        className="p-1.5 text-muted hover:text-red-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-muted py-8">{t("no_products")}</p>
          )}
        </div>
      </div>

      {showModal && (
        <ProductFormModal
          product={modalProduct}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
