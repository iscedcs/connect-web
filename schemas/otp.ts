import { z } from "zod";

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter your 6-digit code"),
});

export type OtpInput = z.infer<typeof otpSchema>;
