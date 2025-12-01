"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { URLS } from "@/lib/const";
import EditProfileForm from "./cardholder/forms/editProfile-form";
import { EditProfileInput } from "@/schemas";
import { uploadImage } from "@/lib/client-upload";

export default function CreateProfileClient({
  defaultValues,
  accessToken,
}: {
  defaultValues?: Partial<EditProfileInput>;
  accessToken: string;
}) {
  const router = useRouter();

  async function createProfileFn(payload: any) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${URLS.profile.create}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();

    if (!res.ok) throw new Error(json.message || "Failed to create profile");
  }

  return (
    <EditProfileForm
      defaultValues={defaultValues}
      accessToken={accessToken}
      mode="create"
      onSubmit={async (data) => {
        try {
          let profilePhotoUrl: string | undefined;
          let coverPhotoUrl: string | undefined;

          if (data.profileImage instanceof File) {
            const up = await uploadImage(data.profileImage, "profiles");
            profilePhotoUrl = up.url;
          }

          if (data.coverImage instanceof File) {
            const up = await uploadImage(data.coverImage, "covers");
            coverPhotoUrl = up.url;
          }

          const structured = (data as any).structuredAddress;

          const payload: any = {
            name: data.name,
            position: data.position ?? "",
            description: data.bio ?? "",
            address: structured
              ? {
                  street: structured.street ?? "",
                  city: structured.city ?? "",
                  state: structured.state ?? "",
                  zipCode: structured.zipCode ?? "",
                  country: structured.country ?? "",
                }
              : { street: data.address ?? "" },

            location: structured
              ? [structured.city, structured.state, structured.country]
                  .filter(Boolean)
                  .join(", ")
              : data.address || "",
          };

          if (profilePhotoUrl) payload.profilePhoto = profilePhotoUrl;
          if (coverPhotoUrl) payload.coverPhoto = coverPhotoUrl;

          await createProfileFn(payload);

          toast.success("Profile created");
          router.push("/settings/account");
        } catch (e: any) {
          console.error(e);
          toast.error(e.message || "Failed to create");
        }
      }}
    />
  );
}
