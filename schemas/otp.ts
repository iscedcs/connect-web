import { z } from "zod";

export const otpSchema = z.object({
  code: z.string().regex(/^[A-Za-z0-9]{6}$/, "Enter your 6-character code"),
});

export type OtpInput = z.infer<typeof otpSchema>;
