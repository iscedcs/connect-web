"use client";

import EditProfileForm from "@/components/cardholder/forms/editProfile-form";
import ProfileSkeleton from "@/components/shared/skeleton/profile-skeleton";
import { uploadImage } from "@/lib/client-upload";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { URLS } from "@/lib/const";
import { useRouter } from "next/navigation";

export default function ProfileClient({
  connectProfile,
  authUser,
  profileId,
  accessToken,
}: any) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(connectProfile);
  const router = useRouter();

  async function refetch() {
    if (!profileId || !accessToken) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_CONNECT_API_URL
        }${URLS.multi_profile.one.replace("{profileId}", profileId)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const json = await res.json();
      setProfile(json.data?.profile ?? null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to refresh profile");
    } finally {
      setLoading(false);
    }
  }

  const mode: "create" | "update" = profile ? "update" : "create";

  if (loading) return <ProfileSkeleton />;

  const defaults = profile
    ? {
        name: profile?.name ?? "",
        position: profile?.position ?? "",
        bio: profile?.description ?? "",
        address:
          profile?.address?.street ??
          profile?.address ??
          profile?.location ??
          "",
        profileImage: profile?.profilePhoto ?? null,
        coverImage: profile?.coverPhoto ?? null,
      }
    : {
        name:
          [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") ||
          "",
        position: authUser?.position || "",
        bio: authUser?.description || "",
        address: authUser?.address || "",
        profileImage: null,
        coverImage: null,
      };

  async function updateProfileFn(payload: any) {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_CONNECT_API_URL
      }${URLS.multi_profile.update_one.replace("{profileId}", profileId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
  }

  async function deleteProfileFn() {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_CONNECT_API_URL
      }${URLS.multi_profile.delete_one.replace("{profileId}", profileId)}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) throw new Error("Failed to delete profile");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <EditProfileForm
        defaultValues={defaults}
        accessToken={accessToken}
        mode={mode}
        onSubmit={async (data: any) => {
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

            if (mode === "update") {
              await updateProfileFn(payload);
              toast.success("Profile updated");
              router.push("/settings/account");
            }
            await refetch();
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Save error");
          }
        }}
      />

      <div className="px-4 pb-3">
        <button
          className="mt-4 text-red-400 underline cursor-pointer"
          onClick={async () => {
            try {
              await deleteProfileFn();
              toast.success("Profile deleted");
              window.location.href = "/settings/account";
            } catch {
              toast.error("Delete failed");
            }
          }}>
          Delete profile
        </button>
      </div>
    </main>
  );
}
