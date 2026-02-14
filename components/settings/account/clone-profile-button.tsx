"use client";

import { Button } from "@/components/ui/button";
import { URLS } from "@/lib/const";
import { toast } from "sonner";

export default function CloneProfileButton({
  profileId,
  accessToken,
}: {
  profileId: string;
  accessToken: string;
}) {
  const handleClone = async () => {
    const url = `${
      process.env.NEXT_PUBLIC_CONNECT_API_URL
    }${URLS.multi_profile.clone_a_profile.replace("{profileId}", profileId)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const json = await res.json();

    if (res.ok) {
      toast.success("Profile cloned successfully");
      window.location.href = "/settings/account";
    } else {
      toast.error(json.message);
    }
  };

  return (
    <Button className="w-full mt-6" onClick={handleClone}>
      Clone this profile
    </Button>
  );
}
