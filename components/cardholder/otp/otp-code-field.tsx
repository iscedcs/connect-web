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
  const LENGTH = 6;
  const inputs = Array.from({ length: LENGTH });
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, LENGTH);
  }, []);

  const sanitizeChar = (ch: string) =>
    ch.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  const sanitizeText = (text: string) =>
    text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  const setAt = (i: number, d: string) => {
    const chars = (value || "").split("");
    chars[i] = d;
    onChange(chars.join("").padEnd(LENGTH, ""));
  };

  const focusAt = (i: number) => {
    if (i >= 0 && i < LENGTH) refs.current[i]?.focus();
  };

  return (
    <div className={cn("flex gap-4", className)}>
      {inputs.map((_, i) => {
        const ch = value?.[i] ?? "";
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="text"
            pattern="[A-Za-z0-9]*"
            maxLength={1}
            autoComplete="one-time-code"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            value={ch}
            disabled={disabled}
            onChange={(e) => {
              const v = sanitizeChar(e.target.value).slice(-1);
              if (!v) {
                setAt(i, "");
                return;
              }
              setAt(i, v);
              focusAt(i + 1);
            }}
            onKeyDown={(e) => {
              // Backspace: move left if this cell is already empty
              if (e.key === "Backspace") {
                if (!value?.[i]) focusAt(i - 1);
                return;
              }
              // Arrow navigation
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                focusAt(i - 1);
              }
              if (e.key === "ArrowRight") {
                e.preventDefault();
                focusAt(i + 1);
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = sanitizeText(
                e.clipboardData.getData("text") || ""
              ).slice(0, LENGTH);
              if (!pasted) return;

              const chars = (value || "").split("");
              let idx = i;
              for (const c of pasted) {
                if (idx >= LENGTH) break;
                chars[idx] = c;
                idx++;
              }
              onChange(chars.join("").padEnd(LENGTH, ""));
              focusAt(Math.min(idx, LENGTH - 1));
            }}
            className={cn(
              "w-8 pb-1 bg-transparent text-center text-lg caret-white",
              "border-b border-white/30 focus:border-white transition-colors",
              "outline-none rounded-none shadow-none",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
          />
        );
      })}
    </div>
  );
}
