"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { otpSchema, type OtpInput } from "@/schemas/otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import OtpCodeField from "./otp-code-field";

type OtpState = "idle" | "success" | "error" | "resending";

export default function OtpScreen({
  state = "idle",
  onBackHref = "/",
  onResend,
  onVerify,
  onVerified,
  enableCreateAfterSuccess,
  onCreateDevice,
}: {
  state?: OtpState;
  onBackHref?: string;
  onResend?: () => Promise<void> | void;
  onVerify?: (code: string) => Promise<"success" | "error"> | void;
  onVerified?: (token: string) => void;
  enableCreateAfterSuccess?: boolean;
  onCreateDevice?: (
    token: string
  ) => Promise<{ ok: boolean; message?: string }>;
  cardId?: string;
  deviceType?: string;
  userId?: string;
}) {
  const [lastCode, setLastCode] = useState("");

  const form = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });

  const isVerifying = form.formState.isSubmitting;
  const code = form.watch("code");

  useEffect(() => {
    if (!onVerify) return;
    if (isVerifying) return;
    if (!code || code.length !== 6) return;

    (async () => {
      const valid = await form.trigger("code");
      if (!valid) return;

      const result = await onVerify(code);
      if (result === "success") {
        setLastCode(code);
        onVerified?.(code);
      }
    })();
  }, [code, isVerifying, onVerify, onVerified, form]);

  return (
    <div className="min-h-dvh  bg-black text-white flex flex-col">
      {/* Banner */}
      <div className="w-full bg-white/10 text-xs backdrop-blur">
        <div className="mx-auto max-w-screen-sm px-3 py-2 flex items-center gap-2">
          <span></span>
          {state === "resending" ? (
            <span>Recheck your email</span>
          ) : (
            <>
              <span>{`Don't have your code?`}</span>
              <button
                onClick={async () => {
                  if (onResend) await onResend();
                }}
                disabled
                className="underline">
                Kindly check your mail
              </button>
            </>
          )}
          <div className="ml-auto">
            {/* top-right spinner like the mock when resending */}
            {state === "resending" && (
              <RefreshCw className="w-4 h-4 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Back */}
      <div className="mx-auto w-full max-w-screen-sm px-4 py-3">
        <Link href={onBackHref} className="text-xl text-white/90">
          <ArrowLeft />
        </Link>
      </div>

      <div className="mx-auto w-full max-w-screen-sm px-4">
        <h1 className="text-2xl font-semibold">Enter Token</h1>
        <p className="text-xs text-white/70 mt-1">
          If you purchased a device, you should have a token that was sent to
          your email.
        </p>

        {/* {(cardId || deviceType) && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <h3 className="text-sm font-medium text-white mb-2">
              Device Information
            </h3>
            {cardId && (
              <p className="text-xs text-white/80">
                <span className="font-medium">Card ID:</span> {cardId}
              </p>
            )}
            {deviceType && (
              <p className="text-xs text-white/80 mt-1">
                <span className="font-medium">Device Type:</span> {deviceType}
              </p>
            )}
            {userId && (
              <p className="text-xs text-white/80 mt-1">
                <span className="font-medium">User ID:</span> {userId}
              </p>
            )}
          </div>
        )} */}

        <Form {...form}>
          <form className="mt-4" onSubmit={(e) => e.preventDefault()}>
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <OtpCodeField
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isVerifying}
                    />
                  </FormControl>
                  <FormMessage className="mt-2" />
                </FormItem>
              )}
            />

            {/* feedback rows */}
          </form>
        </Form>
        {state === "success" && (
          <div className="mt-3 text-xs text-green-400 flex items-center gap-2">
            <Check className="w-3.5 h-3.5" />
            <span>OTP is verified and correct</span>
          </div>
        )}
        {state === "error" && (
          <div className="mt-3 text-xs text-red-400 flex items-center gap-2">
            <X className="w-3.5 h-3.5" />
            <span>OTP is wrong, kindly confirm the code you entered.</span>
          </div>
        )}
      </div>
    </div>
  );
}
