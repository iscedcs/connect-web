"use client";

import { useRef } from "react";
import clsx from "clsx";

type Props = {
  value?: File | null;
  onChange: (file: File | null) => void;
  variant?: "profile" | "cover";
  className?: string;
  placeholder?: React.ReactNode;
};

export default function ImagePicker({
  value,
  onChange,
  variant = "profile",
  className,
  placeholder,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pick = () => inputRef.current?.click();

  const url = value ? URL.createObjectURL(value) : null;

  // profile: tall small box; cover: wide box
  const base = variant === "profile" ? "w-28 h-40" : "w-full h-32";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={pick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pick()}
      className={clsx(
        base,
        "rounded-xl border border-dashed border-white/20 bg-white/5",
        "flex items-center justify-center text-center cursor-pointer",
        className
      )}>
      {url ? (
        // preview
        <img
          src={url}
          alt="Selected image preview"
          className="w-full h-full object-cover rounded-xl"
        />
      ) : (
        placeholder ?? (
          <span className="text-white/70 text-2xl select-none">+</span>
        )
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
