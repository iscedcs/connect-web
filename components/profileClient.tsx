"use client";

import EditProfileForm from "@/components/cardholder/forms/editProfile-form";
import ProfileSkeleton from "@/components/shared/skeleton/profile-skeleton";
import { useProfile } from "@/hooks/useProfile";
import { uploadImage } from "@/lib/client-upload";
import { toast } from "sonner";

export default function ProfileClient({ connectProfile, authUser }: any) {
  const {
    profile,
    loading,
    deleteProfile,
    refetch,
    createProfile,
    updateProfile,
  } = useProfile();

  if (loading) return <ProfileSkeleton />;

  const hasConnect = !!profile || !!connectProfile;

  const defaults = hasConnect
    ? {
        name: (profile ?? connectProfile)?.name ?? "",
        position: (profile ?? connectProfile)?.position ?? "",
        bio: (profile ?? connectProfile)?.description ?? "",
        address: (profile ?? connectProfile)?.address?.street ?? "",
        profileImage: null,
        coverImage: null,
      }
    : {
        name:
          [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") ||
          "",
        postion: authUser?.postion || "",
        bio: authUser?.description || "",
        address: authUser?.address || "",
        profileImage: null,
        coverImage: null,
      };

  const mode: "create" | "update" = hasConnect ? "update" : "create";

  return (
    <main className="min-h-screen bg-black text-white">
      {!hasConnect && (
        <p className="px-4 pt-4 text-xs text-white/60">
          No Connect profile yet. We prefilled details from your Auth account.
        </p>
      )}
      <EditProfileForm
        defaultValues={defaults}
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

            if (mode === "create") await createProfile(payload);
            else await updateProfile(payload);

            await refetch();
          } catch (e: any) {
            console.error(e);
            toast.error(e?.message || "Failed to save profile");
          }
        }}
      />

      {hasConnect && (
        <div className="px-4">
          <button
            className="mt-4 text-red-400 underline"
            onClick={async () => {
              await deleteProfile();
              await refetch();
            }}>
            Delete profile
          </button>
        </div>
      )}
    </main>
  );
}
