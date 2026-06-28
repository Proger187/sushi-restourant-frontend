"use client";

import { clsx } from "clsx";
import { Category } from "@/types";

interface Props {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
          selected === null
            ? "bg-accent text-white"
            : "bg-surface text-muted hover:text-white border border-border"
        )}
      >
        Все
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={clsx(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            selected === cat.slug
              ? "bg-accent text-white"
              : "bg-surface text-muted hover:text-white border border-border"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
