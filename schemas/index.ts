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
    .min(5, "Please provide a valid address")
    .max(200, "Address is too long"),
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
  profileImage: z.instanceof(File).optional().nullable(),
  coverImage: z.instanceof(File).optional().nullable(),
});

export type EditProfileInput = z.infer<typeof editProfileSchema>;
