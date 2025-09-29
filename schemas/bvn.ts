import { z } from "zod";

export const bvnSchema = z.object({
  bvn: z
    .string()
    .transform((s) => s.replace(/\D/g, "")) // keep digits
    .refine((digits) => digits.length === 11, {
      message: "BVN must be 11 digits",
    }),
});

export type BvnInput = z.infer<typeof bvnSchema>;
