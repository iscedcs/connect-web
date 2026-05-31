import { getAuthInfo } from "@/actions/auth";
import {
  getArtisanRequirements,
  getMyArtisanProfile,
} from "@/lib/services/artisan";
import { getConnectProfile } from "@/lib/services/profile";
import { redirect } from "next/navigation";
import Link from "next/link";
import ArtisanSetupWizard from "@/components/cardholder/artisan/setup/artisan-setup-wizard";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Become an Artisan",
  description:
    "Set up your artisan profile on ISCE Connect and start offering your services.",
  keywords: ["artisan", "setup", "register", "services"],
});

export default async function ArtisanSetupPage() {
  const [authInfo, connectProfile] = await Promise.all([
    getAuthInfo(),
    getConnectProfile(),
  ]);

  const isAuthed = !("error" in authInfo) && !authInfo.isExpired;
  if (!isAuthed) {
    redirect("/dashboard");
  }

  // No connect profile — show a clear error instead of silently looping back
  if (!connectProfile?.id) {
    return (
      <main className="relative bg-black text-white min-h-screen flex items-center justify-center">
        <div className="max-w-sm mx-auto p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Connect profile required</h2>
          <p className="text-sm text-white/60">
            You need to set up your Connect profile before becoming an Artisan.
            Go to your dashboard and set up your profile first.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // If already an artisan, redirect to artisan dashboard
  const existingArtisan = await getMyArtisanProfile(connectProfile.id);
  if (existingArtisan) {
    redirect("/connect/artisan");
  }

  const requirements = await getArtisanRequirements();

  return (
    <main className="relative bg-black text-white min-h-screen">
      <div className="p-4 pt-6">
        <ArtisanSetupWizard
          profileId={connectProfile.id}
          accessToken={authInfo.accessToken}
          categories={requirements?.categories ?? []}
          requirements={requirements}
        />
      </div>
    </main>
  );
}
