import { fetchPublicProfile } from "@/lib/services/public-profile";
import { getFaviconFromUrl } from "@/lib/connect-links/get-favicon";
import Link from "next/link";
import { motion } from "framer-motion";
import SocialsMotion from "@/components/customer/socials/socials-motion";
import { LeftIcon, RightIcon } from "@/lib/icons";

export default async function PublicSocialsPage({ params }: any) {
  const { id } = await params;
  const profileData = await fetchPublicProfile(id);

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        Profile not found
      </div>
    );
  }

  const socials = profileData.socials ?? [];

  return (
    <main className="min-h-screen bg-black text-white px-4 pt-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/customer/${id}`} className="text-white/50 text-sm">
          <LeftIcon />
        </Link>

        <h1 className="text-3xl font-extrabold mt-2">Socials</h1>
        <p className="text-white/60 text-sm mt-1">
          Connect with {profileData.profile?.name}
        </p>
      </div>

      {/* Grid */}
      <SocialsMotion socials={socials} />
    </main>
  );
}
