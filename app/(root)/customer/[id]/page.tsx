import { EventCard } from "@/components/customer/event-card";
import PublicProfileTabs from "@/components/customer/public-profile-tabs";
import { URLS } from "@/lib/const";
import { CartIcon, EmailIcon, PhoneIcon, RightIcon } from "@/lib/icons";
import { fetchUserEvents } from "@/lib/services/events";
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

  if (!profileData)
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Profile not found.</p>
      </main>
    );

  const { profile, contact, device } = profileData;

  const events = await fetchUserEvents(device?.userId);
  const connectItems = buildConnectList(profileData);

  return (
    <main className="min-h-screen bg-black text-white pb-16">
      <section>
        <img
          src={profile.coverPhoto}
          className="w-full h-44 md:h-64 object-cover"
        />

        <div className="px-4 -mt-14 md:-mt-20 flex items-end gap-2">
          <img
            src={profile.profilePhoto}
            className="w-20 h-20  rounded-full border-4 border-black object-cover"
          />

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              {profile.name}
            </h1>
            <p className="text-white -mt-1">{profile.position}</p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="px-4 mt-4 flex items-center font-medium gap-3 flex-wrap">
          <button className="px-5 py-2 cursor-pointer bg-white text-black rounded-full text-xs">
            Send money
          </button>

          <button className="px-5 py-2 cursor-pointer bg-white/5 border-[0.5px] border-[#868686] rounded-full text-xs">
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
            {/* <button>
              <CartIcon />
            </button> */}
          </div>
        </div>
      </section>

      {/* TABS */}
      <PublicProfileTabs connectItems={connectItems} events={events} />

      {/* <section className="px-4 mt-6">
        {events.length === 0 && (
          <p className="text-white/40 text-sm">No events found</p>
        )}

        {events.map((event: any) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section> */}
      {/* <section className="mt-6 px-4">
        <div className="bg-[#151515]  rounded-[22px] rounded-b-none p-4 pt-1">
          {connectItems.map((item, index) => (
            <div key={item.id}>
              <a
                href={item.url}
                target="_blank"
                className="flex items-center justify-between py-4 group">
                <div className="flex items-start gap-4 flex-1">
                  <span className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={item.icon}
                      alt=""
                      className="w-6 h-6 object-contain"
                    />
                  </span>

                  <div className="flex-1">
                    <p className="text-sm text-white">{item.title}</p>
                    <p className="text-[10px] text-white/50 mt-[2px] truncate max-w-[180px] block">
                      {item.url}
                    </p>
                  </div>
                </div>

                <span className="text-3xl text-white/60 group-hover:text-white transition ml-4">
                  <RightIcon />
                </span>
              </a>
              {index !== connectItems.length - 1 && (
                <div className="border-b border-white/10 flex-1 ml-[56px] " />
              )}
            </div>
          ))}
        </div>
      </section> */}
    </main>
  );
}
