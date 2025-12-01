"use client";

import { useEffect, useState } from "react";
import ConnectManagement from "./contact-management";
import { getConnectModules } from "@/lib/services/connect-modules";
import ConnectManagementList from "./filled-state/connect-management-list";

export default function ConnectManagementWrapper({
  profileId,
  accessToken,
}: {
  profileId: string;
  accessToken: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId || !accessToken) return;
    async function load() {
      const modules = await getConnectModules(profileId, accessToken);

      console.log("🔥 CONNECT MODULE DEBUG:", modules);

      const preparedRows: any[] = [];

      if (modules.contact?.contacts?.length)
        preparedRows.push({
          id: "contact",
          iconSrc: "/assets/Vector.svg",
          title: "Contact Card",
          subtitle: "Your personal contact info",
          href: "/connect/links/contact",
        });

      // LINKS
      if (modules.links?.links?.length)
        preparedRows.push({
          id: "links",
          iconSrc: "/assets/336333cb08daaa72b8ac20c655e5f8de719c62f0.png",
          title: "Links",
          subtitle: "Your external links",
          href: "/connect/links",
        });

      // SOCIALS
      if (modules.socials?.socials?.length)
        preparedRows.push({
          id: "socials",
          iconSrc: "/assets/entypo_email.svg",
          title: "Social Profiles",
          subtitle: "Your social media links",
          href: "/connect/links/socials",
        });

      // VIDEOS
      if (modules.videos?.videos?.length)
        preparedRows.push({
          id: "videos",
          iconSrc: "/assets/logos_youtube-icon.svg",
          title: "YouTube",
          subtitle: "Your YouTube videos",
          href: "/connect/links/videos",
        });

      // FILES
      if (modules.files?.files?.length)
        preparedRows.push({
          id: "files",
          iconSrc: "/assets/bi_filetype-pdf.svg",
          title: "Files",
          subtitle: "Your file uploads",
          href: "/connect/links/files",
        });

      // FORMS
      if (modules.forms?.forms?.length)
        preparedRows.push({
          id: "forms",
          iconSrc: "/assets/forms_2020q4_48dp.png",
          title: "Forms",
          subtitle: "Custom forms you created",
          href: "/connect/links/forms",
        });

      // MEETINGS
      if (modules.meetings?.meetings?.length)
        preparedRows.push({
          id: "meetings",
          iconSrc: "/assets/Ellipse9.svg",
          title: "Calendly / Meetings",
          subtitle: "Your meeting schedules",
          href: "/connect/links/meetings",
        });

      // SPOTIFY
      if (modules.spotify?.items?.length)
        preparedRows.push({
          id: "spotify",
          iconSrc: "/assets/logos_spotify-icon.svg",
          title: "Spotify",
          subtitle: "Your Spotify profile",
          href: "/connect/links/spotify",
        });

      setRows(preparedRows);
      setLoading(false);
    }

    load();
  }, [profileId, accessToken]);

  if (loading) return null;

  // Empty → show icons carousel
  if (rows.length === 0) return <ConnectManagement />;

  // Filled → show list
  return <ConnectManagementList title="Connect management" rows={rows} />;
}
