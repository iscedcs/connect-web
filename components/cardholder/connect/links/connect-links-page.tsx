"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { URLS } from "@/lib/const";
import LinkList from "./connect-links-list";
import LinkModal from "./connect-links-modal";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  image: string;
  order: number;
  isVisible: boolean;
}

export default function LinkPage({
  accessToken,
  profileId,
  isAuthed,
}: {
  accessToken?: string;
  profileId?: string;
  isAuthed?: boolean;
}) {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLinks = async () => {
    if (!profileId || !accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL
        }${URLS.links.all.replace(
          "{profileId}",
          profileId
        )}?page=1&per_page=25&include_deleted=true`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const json = await res.json();
      console.log("✅ Full response:", json);
      const formatted = (json?.data?.links ?? []).map((l: any) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        image: l.image,
        order: l.order,
        isVisible: l.is_visible,
      }));

      setLinks(formatted);
      console.log("Fetched Links:", json?.data?.links);

      setLinks(formatted);
      console.log("Fetched Links:", json.data?.links);

      setLinks(formatted);
    } catch (err) {
      toast.error("Failed to fetch links");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) fetchLinks();
  }, [isAuthed]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Your Links</h2>
        <Button
          className="rounded-full"
          variant="secondary"
          onClick={() => setModalOpen(true)}>
          Add new
        </Button>
      </div>

      <LinkList
        links={links}
        loading={loading}
        profileId={profileId!}
        accessToken={accessToken!}
        onUpdated={fetchLinks}
      />

      {modalOpen && (
        <LinkModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profileId={profileId!}
          accessToken={accessToken!}
          onUpdated={fetchLinks}
        />
      )}
    </div>
  );
}
