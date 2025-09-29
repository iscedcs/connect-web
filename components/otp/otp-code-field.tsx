"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function OtpCodeField({
  value,
  onChange,
  disabled,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const inputs = Array.from({ length: 6 });
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, 6);
  }, []);

  const setAt = (i: number, d: string) => {
    const chars = value.split("");
    chars[i] = d;
    onChange(chars.join("").padEnd(6, ""));
  };

  return (
    <div className={cn("flex gap-4", className)}>
      {inputs.map((_, i) => {
        const ch = value[i] ?? "";
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete="one-time-code"
            value={ch}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(-1);
              if (!v) {
                setAt(i, "");
                return;
              }
              setAt(i, v);
              refs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !value[i])
                refs.current[i - 1]?.focus();
            }}
            className={cn(
              // underline-only style
              "w-8 pb-1 bg-transparent text-center text-lg caret-white",
              "border-b border-white/30 focus:border-white transition-colors",
              "outline-none rounded-none shadow-none",
              // remove iOS number appearance artifacts
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
          />
        );
      })}
    </div>
  );
}
