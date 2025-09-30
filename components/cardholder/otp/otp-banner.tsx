"use client";

export default function OtpBanner({
  state, // "idle" | "resending"
  onResend,
}: {
  state: "idle" | "resending";
  onResend?: () => void;
}) {
  return (
    <div className="w-full bg-white/10 text-xs text-white backdrop-blur">
      <div className="mx-auto max-w-screen-sm px-3 py-2 flex items-center gap-2">
        <span>ℹ️</span>
        {state === "idle" ? (
          <span>
            Didn’t receive it?{" "}
            <button onClick={onResend} className="underline">
              Click here to resend now
            </button>
          </span>
        ) : (
          <span>Resending link now</span>
        )}
      </div>
    </div>
  );
}
