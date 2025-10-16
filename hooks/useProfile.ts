"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type Profile = {
  userId: string;
  profilePhoto?: string | null;
  coverPhoto?: string | null;
  name: string;
  position?: string;
  description?: string;
  location?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/connect/profile/me", { cache: "no-store" });

      if (res.status === 401 || res.status === 404) {
        setProfile(null);
      } else if (res.ok) {
        const json = await res.json().catch(() => null);
        const p = json?.data?.profile ?? null;
        setProfile(p);
      } else {
        console.error("Fetch profile failed", await res.text());
        setProfile(null);
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function createProfile(payload: any) {
    const res = await fetch("/api/connect/profile/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.userId || data?.data?.userId)) {
      toast.success("Profile created!");
      setProfile((data.userId ? data : data.data) as Profile);
    } else {
      toast.error(data?.message || "Failed to create profile");
    }
  }

  async function updateProfile(payload: any) {
    const res = await fetch("/api/connect/profile/update", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.userId || data?.data?.userId)) {
      toast.success("Profile updated!");
      setProfile((data.userId ? data : data.data) as Profile);
    } else {
      toast.error(data?.message || "Update failed");
    }
  }

  async function deleteProfile() {
    const res = await fetch("/api/connect/profile/delete", {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("Profile deleted.");
      setProfile(null);
    } else {
      toast.error(data?.message || "Failed to delete profile");
    }
  }

  return {
    profile,
    loading,
    refetch,
    createProfile,
    updateProfile,
    deleteProfile,
  };
}
