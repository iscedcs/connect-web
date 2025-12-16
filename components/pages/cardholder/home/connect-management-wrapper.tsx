"use client";

import { useEffect, useState } from "react";
import ConnectManagement from "./contact-management";
import { getConnectModules } from "@/lib/services/connect-modules";
import ConnectManagementList from "./filled-state/connect-management-list";

export default function ConnectManagementWrapper({
  initialModules,
}: {
  initialModules: any;
}) {
  if (!initialModules) return <ConnectManagement />;

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const preparedRows: any[] = [];

      if (initialModules.contact?.contacts?.length)
        preparedRows.push({
          id: "contact",
          iconSrc: "/assets/Vector.svg",
          title: "Contact Card",
          subtitle: "Your personal contact info",
          href: "/connect/links/contact",
        });

      // LINKS
      if (initialModules.links?.links?.length)
        preparedRows.push({
          id: "links",
          iconSrc: "/assets/336333cb08daaa72b8ac20c655e5f8de719c62f0.png",
          title: "Links",
          subtitle: "Your external links",
          href: "/connect/links/links",
        });

      // SOCIALS
      if (initialModules.socials?.socials?.length)
        preparedRows.push({
          id: "socials",
          iconSrc: "/assets/entypo_email.svg",
          title: "Social Profiles",
          subtitle: "Your social media links",
          href: "/connect/links/socials",
        });

      // VIDEOS
      if (initialModules.videos?.videos?.length)
        preparedRows.push({
          id: "videos",
          iconSrc: "/assets/logos_youtube-icon.svg",
          title: "YouTube",
          subtitle: "Your YouTube videos",
          href: "/connect/links/videos",
        });

      // FILES
      if (initialModules.files?.files?.length)
        preparedRows.push({
          id: "files",
          iconSrc: "/assets/bi_filetype-pdf.svg",
          title: "Files",
          subtitle: "Your file uploads",
          href: "/connect/links/files",
        });

      // FORMS
      if (initialModules.forms?.forms?.length)
        preparedRows.push({
          id: "forms",
          iconSrc: "/assets/forms_2020q4_48dp.png",
          title: "Forms",
          subtitle: "Custom forms you created",
          href: "/connect/links/forms",
        });

      // MEETINGS
      if (initialModules.meetings?.meetings?.length)
        preparedRows.push({
          id: "meetings",
          iconSrc: "/assets/Ellipse9.svg",
          title: "Calendly / Meetings",
          subtitle: "Your meeting schedules",
          href: "/connect/links/meetings",
        });

      // SPOTIFY
      if (initialModules.spotify?.items?.length)
        preparedRows.push({
          id: "spotify",
          iconSrc: "/assets/logos_spotify-icon.svg",
          title: "Spotify",
          subtitle: "Your Spotify profile",
          href: "/connect/links/spotify",
        });
      //APPOINTMENTS
      if (initialModules.appointments?.appointments?.length)
        preparedRows.push({
          id: "appointments",
          iconSrc: "/assets/calendar_5264073.png",
          title: "Appointment",
          subtitle: "Your appointment bookings",
          href: "/connect/links/appointments",
        });

      setRows(preparedRows);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return null;

  // Empty → show icons carousel
  if (rows.length === 0) return <ConnectManagement />;

  // Filled → show list
  return <ConnectManagementList title="Connect management" rows={rows} />;
}
