"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { URLS } from "@/lib/const";
import { Copy, Eye, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Profile {
  id: string;
  name: string;
  position: string;
  profilePhoto?: string | null;
  slug?: string | null;
  is_default: boolean;
}

export default function ProfileCard({
  profile,
  accessToken,
  onUpdated,
}: {
  profile: Profile;
  accessToken: string;
  onUpdated: () => Promise<void>;
}) {
  const router = useRouter();

  const [isSettingDefault, setIsSettingDefault] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const handleSetDefault = async () => {
    if (isSettingDefault) return;

    setIsSettingDefault(true);

    try {
      const url = `${
        process.env.NEXT_PUBLIC_CONNECT_API_URL
      }${URLS.multi_profile.set_default_one.replace(
        "{profileId}",
        profile.id
      )}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Profile set as default");
      } else {
        toast.error(json.message);
      }

      await onUpdated();
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const url = `${
        process.env.NEXT_PUBLIC_CONNECT_API_URL
      }${URLS.multi_profile.delete_one.replace("{profileId}", profile.id)}`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (res.ok) toast.success("Profile deleted");
      else toast.error(json.message);

      router.refresh();
      await onUpdated();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClone = async () => {
    if (isCloning) return;

    setIsCloning(true);

    try {
      const url = `${
        process.env.NEXT_PUBLIC_CONNECT_API_URL
      }${URLS.multi_profile.clone_a_profile.replace(
        "{profileId}",
        profile.id
      )}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Profile cloned successfully");
        window.location.href = "/profiles";
      } else {
        toast.error(json.message);
      }
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 p-4 shadow-sm shadow-black/40 transition hover:border-white/20 hover:shadow-black/60">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <img
              src={profile.profilePhoto ?? "/assets/default-avatar.png"}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover ring-2 ring-white/10"
            />
            {profile.is_default && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-neutral-900" />
            )}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{profile.name}</p>
            <p className="text-white/50 text-sm truncate">
              {profile.position || "—"}
            </p>

            {profile.is_default && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300 border border-emerald-500/20">
                Default Profile
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-white/70 hover:text-white"
            onClick={() =>
              (window.location.href = `/settings/account/edit/${profile.id}`)
            }
            aria-label="Edit profile">
            <Pencil className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white/70 hover:text-white"
                aria-label="Profile actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {profile.slug && (
                <DropdownMenuItem
                  onClick={() => router.push(`/profiles/${profile.slug}/preview`)}
                >
                  <Eye className="h-4 w-4" />
                  Preview profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleClone} disabled={isCloning}>
                <Copy className="h-4 w-4" />
                {isCloning ? "Cloning..." : "Clone profile"}
              </DropdownMenuItem>
              {!profile.is_default && (
                <DropdownMenuItem
                  onClick={handleSetDefault}
                  disabled={isSettingDefault}>
                  <Star className="h-4 w-4" />
                  {isSettingDefault ? "Setting..." : "Set as default"}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete profile"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
