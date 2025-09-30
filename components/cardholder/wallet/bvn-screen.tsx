"use client";

import Link from "next/link";
import { ArrowLeft, ScanLine } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { bvnSchema, type BvnInput } from "@/schemas/bvn";
import { useState } from "react";
import { cn } from "@/lib/utils";

// helper: format "XXXXXXXXXXX" -> "XXXX-XXXX-XXX"
function formatBVN(digits: string) {
  const d = digits.slice(0, 11);
  const a = d.slice(0, 4);
  const b = d.slice(4, 8);
  const c = d.slice(8, 11);
  return [a, b, c].filter(Boolean).join("-");
}

export default function BvnScreen({
  backHref = "/",
  onContinue,
  onScan, // optional: if you later add camera/ocr scan
}: {
  backHref?: string;
  onContinue?: (bvnDigits: string) => Promise<void> | void;
  onScan?: () => void;
}) {
  const form = useForm<BvnInput>({
    resolver: zodResolver(bvnSchema),
    defaultValues: { bvn: "" },
    mode: "onChange",
  });

  // store the display value separately so we can keep hyphens
  const [displayBVN, setDisplayBVN] = useState("");

  const handleInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    setDisplayBVN(formatBVN(digits));
    // push digits (no dashes) to RHF
    form.setValue("bvn", digits, { shouldValidate: true });
  };

  const isValid =
    form.formState.isValid && displayBVN.replace(/\D/g, "").length === 11;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* top bar */}
      <div className="mx-auto w-full max-w-screen-sm px-4 pt-3">
        <Link href={backHref} className="inline-block text-xl text-white/90">
          <ArrowLeft />
        </Link>
      </div>

      {/* body */}
      <div className="mx-auto w-full max-w-screen-sm px-4 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={onScan}
            className="p-1 rounded-md hover:bg-white/10"
            aria-label="Scan BVN">
            <ScanLine className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">What’s your BVN?</h1>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              await onContinue?.(data.bvn); // pass 11-digit string
            })}>
            <FormField
              control={form.control}
              name="bvn"
              render={() => (
                <FormItem>
                  <FormControl>
                    {/* underline-only input */}
                    <input
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      value={displayBVN}
                      onChange={(e) => handleInput(e.target.value)}
                      placeholder="0192-3848-233"
                      className={cn(
                        "mt-2 w-full bg-transparent text-base outline-none",
                        "border-b border-white/20 focus:border-white transition-colors",
                        "pb-2 placeholder-white/40"
                      )}
                    />
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            {/* Spacer to push button down on tall screens */}
            <div className="h-[58vh]" />

            {/* bottom button (safe-area aware) */}
            <div className="pb-6 ">
              <Button
                type="submit"
                disabled={!isValid || form.formState.isSubmitting}
                className={cn(
                  "w-full rounded-2xl py-3 text-base font-medium shadow-sm",
                  isValid ? "bg-white text-black" : "bg-white/30 text-black/60"
                )}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
