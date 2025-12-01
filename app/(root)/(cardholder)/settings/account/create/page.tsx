import { getAuthInfo } from "@/actions/auth";
import CreateProfileClient from "@/components/create-profile-client";

export default async function CreateProfilePage() {
  const auth = await getAuthInfo();
  const accessToken = auth?.accessToken;

  return (
    <main className="min-h-screen bg-black text-white p-4 pt-24">
      <h1 className="text-2xl font-bold">Create a new profile</h1>
      <p className="text-white/50 text-sm mt-1 mb-6">
        Set up a new public contact profile for your ISCE Connect account.
      </p>

      <CreateProfileClient
        accessToken={accessToken!}
        defaultValues={{
          name: "",
          position: "",
          bio: "",
          address: "",
          profileImage: null,
          coverImage: null,
        }}
      />
    </main>
  );
}
