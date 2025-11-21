"use client";

import Link from "next/link";
import { LINK_CATEGORIES } from "@/lib/connect-link-categories";
import CategoryCard from "./category-card";

export default function CategoriesGrid({ isAuthed }: { isAuthed: boolean }) {
  const disabled = !isAuthed;

  return (
    <div className="grid gap-4 max-w-md mx-auto mt-2">
      {LINK_CATEGORIES.map((c) => (
        <Link
          key={c.key}
          href={disabled ? "#" : c.href}
          aria-disabled={disabled}>
          <CategoryCard category={c} disabled={disabled} />
        </Link>
      ))}
    </div>
  );
}
