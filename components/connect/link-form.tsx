"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { linkSchema, type LinkInput } from "@/schemas/link";
import { ArrowLeft, Link2, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LinkForm({
  backHref = "/connect/links",
  presetLabel,
  presetFavicon, // optional: prefill icon based on pick
  onSave,
}: {
  backHref?: string;
  presetLabel?: string;
  presetFavicon?: string;
  onSave?: (data: LinkInput) => Promise<void> | void;
}) {
  const [icon, setIcon] = useState<string>(presetFavicon || "");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<LinkInput>({
    resolver: zodResolver(linkSchema),
    defaultValues: { iconSrc: icon, label: presetLabel || "", url: "" },
    mode: "onChange",
  });

  const valid = form.formState.isValid;

  const handleFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      setIcon(src);
      form.setValue("iconSrc", src, { shouldValidate: true });
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="mx-auto w-full max-w-screen-sm px-4 pt-4">
        <Link href={backHref} className="text-white/90">
          <ArrowLeft />
        </Link>

        <div className="mt-3 flex items-center justify-center">
          <Link2 className="w-5 h-5" />
        </div>
        <h1 className="mt-2 text-center text-2xl font-semibold">
          Drop a link you wish to share
        </h1>

        {/* upload circle */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "w-20 h-20 rounded-full border border-dashed border-white/40 grid place-items-center overflow-hidden",
              icon && "border-white/20"
            )}
            aria-label="Upload icon">
            {icon ? (
              <img
                src={icon}
                alt="icon"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl leading-none">+</span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* delete icon button when uploaded */}
        {icon && (
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => {
                setIcon("");
                form.setValue("iconSrc", "");
              }}
              className="text-white/70 text-xs inline-flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        )}

        <Form {...form}>
          <form
            className="mt-6"
            onSubmit={form.handleSubmit(async (data) => {
              await onSave?.(data);
            })}>
            {/* Name */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Name your link"
                      className="w-full bg-transparent text-base outline-none
                                 border-b border-white/20 focus:border-white transition-colors pb-2"
                    />
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            {/* URL */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormControl>
                    <input
                      {...field}
                      inputMode="url"
                      placeholder="Enter link url"
                      className="w-full bg-transparent text-base outline-none
                                 border-b border-white/20 focus:border-white transition-colors pb-2 break-all"
                    />
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            {/* Spacer */}
            <div className="h-[48vh]" />

            {/* Button */}
            <div className="pb-6 ">
              <Button
                type="submit"
                disabled={!valid || form.formState.isSubmitting}
                className={cn(
                  "w-full rounded-2xl py-3 text-base font-medium shadow-sm",
                  valid ? "bg-white text-black" : "bg-white/30 text-black/60"
                )}>
                {presetLabel ? "Save" : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
