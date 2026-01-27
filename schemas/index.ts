import { z } from "zod";

export const editProfileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  position: z.string().optional(),
  bio: z
    .string()
    .max(160, "Bio should be short (≤160 characters)")
    .optional()
    .nullable(),
  description: z.string().optional(),
  address: z
    .string()
    .trim()
    .min(5, "Please provide a valid address")
    .max(200, "Address is too long")
    .or(z.literal("")),
  structuredAddress: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  // We’ll store images as File objects in the form; backend can handle uploads later
  profileImage: z
    .union([z.instanceof(File), z.string().min(1)])
    .optional()
    .nullable(),
  coverImage: z
    .union([z.instanceof(File), z.string().min(1)])
    .optional()
    .nullable(),
});

export type EditProfileInput = z.infer<typeof editProfileSchema>;
