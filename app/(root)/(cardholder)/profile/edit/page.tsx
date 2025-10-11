"use client";

import EditProfileForm from "@/components/cardholder/forms/editProfile-form";

export default function EditProfilePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <EditProfileForm
        onSubmit={(data) => {
          // For now, just show in console. You’ll plug API here later.
          // e.g., upload images then PATCH /profile
          console.log("EditProfile submit:", data);
        }}
      />
    </main>
  );
}
