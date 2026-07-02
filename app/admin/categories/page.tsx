"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useAdminCategories } from "@/lib/queries";
import { Category } from "@/types";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export default function AdminCategoriesPage() {
  const { data: categories = [] } = useAdminCategories();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const t = useTranslations("admin");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const openCreate = () => {
    setEditCategory(null);
    setName("");
    setSlug("");
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    if (imageFile) formData.append("image", imageFile);

    if (editCategory) {
      await api.patch(`/api/admin/categories/${editCategory.slug}/`, formData);
    } else {
      await api.post("/api/admin/categories/", formData);
    }
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    setShowForm(false);
  };

  const handleDelete = async (categorySlug: string) => {
    if (!confirm(t("delete_category"))) return;
    await api.delete(`/api/admin/categories/${categorySlug}/`);
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  const handleToggleActive = async (cat: Category) => {
    await api.patch(`/api/admin/categories/${cat.slug}/`, {
      is_active: !cat.is_active,
    });
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("categories_title")}</h1>
        <button
          onClick={openCreate}
          className="bg-accent hover:bg-accent/90 text-white text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("add")}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="space-y-0">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 px-4 py-3 border-b border-border/50 hover:bg-background/50"
            >
              <GripVertical className="w-4 h-4 text-muted/40 cursor-grab" />
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-border flex-shrink-0">
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{cat.name}</p>
                <p className="text-xs text-muted">{cat.slug}</p>
              </div>
              <button
                onClick={() => handleToggleActive(cat)}
                className={`text-xs px-2.5 py-1 rounded-full ${
                  cat.is_active
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {cat.is_active ? t("active") : t("hidden")}
              </button>
              <button
                onClick={() => openEdit(cat)}
                className="p-1.5 text-muted hover:text-white"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.slug)}
                className="p-1.5 text-muted hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-center text-muted py-8">
              {t("no_categories")}
            </p>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-border rounded-2xl w-full max-w-sm p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold">
              {editCategory ? t("edit") : t("new_category")}
            </h2>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editCategory) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-zа-яё0-9]+/gi, "-")
                      .replace(/^-|-$/g, "")
                  );
                }
              }}
              placeholder={t("name_label")}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t("slug_label")}
              required
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-accent file:text-white file:text-sm"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-border text-muted py-2.5 rounded-xl text-sm"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="flex-1 bg-accent text-white py-2.5 rounded-xl text-sm font-medium"
              >
                {editCategory ? t("save") : t("create")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
