import PublicProfileTabs from "@/components/customer/public-profile-tabs";
import { EmailIcon, PhoneIcon } from "@/lib/icons";
import { fetchPublicUserEvent } from "@/lib/services/events";
import { fetchPublicProfile } from "@/lib/services/public-profile";
import Link from "next/link";

/** ---------------------------------------
 * ICON MAPS
 -----------------------------------------*/
const ICONS: Record<string, string> = {
  spotify: "/assets/logos_spotify-icon.svg",
  calendly: "/assets/Ellipse9.svg",
  youtube: "/assets/logos_youtube-icon.svg",
  file: "/assets/bi_filetype-pdf.svg",
  socials: "/assets/entypo_email.svg",
  google_forms: "/assets/forms_2020q4_48dp.png",
  appointments: "/assets/calendar_5264073.png",
  // crypto: "/assets/icons/crypto.svg",
  link: "/assets/336333cb08daaa72b8ac20c655e5f8de719c62f0.png",
};

/** ---------------------------------------
 * BUILD UNIFIED FIGMA CONNECT LIST
 -----------------------------------------*/
function buildConnectList(data: any) {
  const list: any[] = [];

  data.spotify?.forEach((item: any) =>
    list.push({
      id: item.id,
      title: item.title,
      url: item.url,
      icon: ICONS.spotify,
    })
  );

  data.meetings?.forEach((m: any) =>
    list.push({
      id: m.id,
      title: "Calendly",
      url: m.url,
      icon: ICONS.calendly,
    })
  );

  data.videos?.forEach((v: any) =>
    list.push({
      id: v.id,
      title: v.title,
      url: v.url,
      icon: ICONS.youtube,
    })
  );

  data.files?.forEach((f: any) =>
    list.push({
      id: f.id,
      title: f.title,
      url: f.url,
      icon: ICONS.file,
    })
  );

  data.socials?.forEach((s: any) =>
    list.push({
      id: s.id,
      title: s.platform,
      url: s.url,
      icon: ICONS.socials,
    })
  );

  data.links?.forEach((l: any) =>
    list.push({
      id: l.id,
      title: l.title,
      url: l.url,
      icon: ICONS.link,
    })
  );

  data.forms?.forEach((f: any) =>
    list.push({
      id: f.id,
      title: f.title,
      url: f.url,
      icon: ICONS.google_forms,
    })
  );
  data.appointments?.forEach((a: any) =>
    list.push({
      id: a.id,
      type: "appointment", // 👈 add type (important)
      title: a.label || "Book An Appointment With me", // 👈 user-facing label
      url: a.url,
      icon: ICONS.appointments,
    })
  );

  data.wallets?.forEach((w: any) =>
    list.push({
      id: w.id,
      title: w.network || "Crypto Wallet",
      url: w.address,
      icon: ICONS.crypto,
    })
  );

  return list;
}

/** ---------------------------------------
 * MAIN PAGE
 -----------------------------------------*/
export default async function CustomerProfilePage({ params }: any) {
  const { id } = await params;
  const profileData = await fetchPublicProfile(id);

  const userId = profileData?.profile?.userId;
  const events = await fetchPublicUserEvent(userId);

  if (!profileData)
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Profile not found.</p>
      </main>
    );

  const { profile, contact, device } = profileData;

  console.log("PUBLIC PROFILE USERID:", userId, events);

  const connectItems = buildConnectList(profileData);

  return (
    <main className="min-h-screen bg-black text-white pb-16">
      <section>
        {/* COVER */}
        <img
          src={profile.coverPhoto}
          className="w-full h-44 md:h-64 object-cover"
        />

        {/* PROFILE IDENTITY */}
        <div className="px-4 -mt-14 md:-mt-20 flex items-end gap-3">
          <img
            src={profile.profilePhoto}
            className="w-20 h-20 rounded-full border-4 border-black object-cover"
          />

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              {profile.name}
            </h1>
            <p className="text-sm text-white/80 -mt-0.5">{profile.position}</p>
          </div>
        </div>

        {/* ABOUT (new block, same header context) */}
        {profile.bio && (
          <div className="px-4 mt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-px w-6 bg-white/20" />
              <span className="text-[10px] uppercase tracking-wider text-white/50">
                Bio
              </span>
            </div>

            <p className="max-w-md text-xs leading-relaxed text-white/70">
              {profile.bio}
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="px-4 mt-4 flex items-center font-medium gap-3 flex-wrap">
          <button className="px-5 py-2 bg-white/5 border border-[#868686] rounded-full text-xs">
            <Link href={`/customer/${id}/save-contact`}>Save contact</Link>
          </button>

          <div className="flex items-center gap-4 text-xl ml-auto">
            {contact?.primary?.phone_number && (
              <a href={`tel:${contact.primary.phone_number}`}>
                <PhoneIcon />
              </a>
            )}
            {contact?.primary?.email && (
              <a href={`mailto:${contact.primary.email}`}>
                <EmailIcon />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* TABS */}
      <PublicProfileTabs connectItems={connectItems} events={events!} id={id} />
    </main>
  );
}
