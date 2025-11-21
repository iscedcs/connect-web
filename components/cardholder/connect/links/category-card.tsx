"use client";

import { cn } from "@/lib/utils";

export default function CategoryCard({
  category,
  disabled,
}: {
  category: { title: string; icon: React.ElementType; hint?: string };
  disabled?: boolean;
}) {
  const Icon = category.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-neutral-900/60 p-4",
        "flex items-center gap-3 transition-all",
        "hover:bg-neutral-900 hover:shadow-lg hover:shadow-primary/10",
        disabled && "opacity-50 pointer-events-none"
      )}>
      <div className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-white/80" />
      </div>

      <div className="min-w-0">
        <p className="font-medium">{category.title}</p>
        {category.hint && (
          <p className="text-xs text-white/50 truncate mt-0.5">
            {category.hint}
          </p>
        )}
      </div>
    </div>
  );
}
