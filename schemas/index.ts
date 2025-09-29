import { z } from "zod";

export const editProfileSchema = z.object({
  fullName: z.string().min(2, "Name is too short"),
  bio: z
    .string()
    .max(160, "Bio should be short (≤160 characters)")
    .optional()
    .nullable(),
  address: z
    .string()
    .min(5, "Please provide a valid address")
    .max(200, "Address is too long"),
  // We’ll store images as File objects in the form; backend can handle uploads later
  profileImage: z.instanceof(File).optional().nullable(),
  coverImage: z.instanceof(File).optional().nullable(),
});

export type EditProfileInput = z.infer<typeof editProfileSchema>;
