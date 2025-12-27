"use client";

import Link from "next/link";
import { LINK_CATEGORIES } from "@/lib/connect-link-categories";
import CategoryCard from "./category-card";
import { useRouter } from "next/navigation";
import { LeftIcon } from "@/lib/icons";

export default function CategoriesGrid({ isAuthed }: { isAuthed: boolean }) {
  const disabled = !isAuthed;
  const router = useRouter();
  return (
    <>
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => router.back()}>
        <LeftIcon />
      </button>
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
    </>
  );
}
