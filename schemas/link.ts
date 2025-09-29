import { z } from "zod";

export const linkSchema = z.object({
  iconSrc: z.string().url().optional().or(z.literal("")),
  label: z.string().min(2, "Name is too short").max(40),
  url: z.string().url("Enter a valid URL (https://...)"),
});
export type LinkInput = z.infer<typeof linkSchema>;
