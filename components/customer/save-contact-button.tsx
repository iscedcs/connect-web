"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckIcon } from "@/lib/icons";
import { fetchPublicProfileBySlug } from "@/lib/services/public-profile";
import { saveContactFlow } from "@/lib/services/save-contact";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

function ExchangeContactForm({
  slug,
  ownerName,
  onSuccess,
}: {
  slug: string;
  ownerName: string;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [realProfileId, setRealProfileId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const result = await fetchPublicProfileBySlug(slug);
      if (result.data?.profile?.id) {
        setRealProfileId(result.data.profile.id);
      }
    }
    loadProfile();
  }, [slug]);

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    phone.trim() &&
    agree &&
    !loading;

  async function submit() {
    if (!realProfileId) return;
    setLoading(true);

    const res = await saveContactFlow({
      profileId: realProfileId,
      firstName,
      lastName,
      email,
      phone: `${countryCode}${phone}`,
      note,
    });

    setLoading(false);

    if (!res.success) {
      return toast.error(res.error);
    }

    toast.success(`You've successfully shared your contact with ${ownerName}`);
    onSuccess();
  }

  return (
    <div className="space-y-4 px-1">
      <input
        type="email"
        placeholder="Enter your email address"
        className="bg-transparent border-b border-white/20 w-full py-2 text-[15px] text-white outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="First name"
        className="bg-transparent border-b border-white/20 w-full py-2 text-[15px] text-white outline-none"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last name"
        className="bg-transparent border-b border-white/20 w-full py-2 text-[15px] text-white outline-none"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <select
          title="country code"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="bg-transparent border-b border-white/20 py-2 text-[15px] text-white outline-none"
        >
          <option value="+234">🇳🇬 +234</option>
        </select>
        <input
          type="tel"
          placeholder="Phone number"
          className="flex-1 bg-transparent border-b border-white/20 py-2 text-[15px] text-white outline-none"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <input
        type="text"
        placeholder="Leave a note (optional)"
        className="bg-transparent border-b border-white/20 w-full py-2 text-[15px] text-white outline-none"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <label className="flex text-[#868686] items-center gap-2 text-xs pt-2">
        <button
          type="button"
          onClick={() => setAgree(!agree)}
          className={`w-4 h-4 rounded-[6px] border flex items-center justify-center ${
            agree ? "bg-white border-white" : "bg-white border-white"
          }`}
        >
          {agree && <CheckIcon className="pointer-events-none" />}
        </button>
        I have read and understood the{" "}
        <span className="underline text-white">terms & conditions</span>
      </label>
      <button
        disabled={!canSubmit}
        onClick={submit}
        className={`w-full py-3 rounded-xl text-black text-[15px] font-medium ${
          canSubmit
            ? "bg-white"
            : "bg-white/20 text-white/50 cursor-not-allowed"
        }`}
      >
        {loading ? "Saving..." : "Share your contact"}
      </button>
    </div>
  );
}

export default function SaveContactButton({
  slug,
  ownerName,
}: {
  slug: string;
  ownerName: string;
}) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  async function handleClick() {
    try {
      const res = await fetch(`/api/vcf/p/${slug}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${ownerName || "contact"}.vcf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download contact");
    }

    setOpen(true);
  }

  const formContent = (
    <ExchangeContactForm
      slug={slug}
      ownerName={ownerName}
      onSuccess={() => setOpen(false)}
    />
  );

  if (isDesktop) {
    return (
      <>
        <button
          onClick={handleClick}
          className="px-5 py-2 bg-white/5 border border-[#868686] rounded-full text-xs cursor-pointer"
        >
          Save Contact
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-black border-white/10 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-extrabold text-white">
                Exchange your contact with {ownerName}
              </DialogTitle>
              <DialogDescription className="text-white/60 text-sm">
                Share your details so {ownerName} can reach you too.
              </DialogDescription>
            </DialogHeader>
            <div className="pt-2">{formContent}</div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="px-5 py-2 bg-white/5 border border-[#868686] rounded-full text-xs cursor-pointer"
      >
        Save Contact
      </button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-black border-white/10 text-white px-4 pb-6">
          <DrawerHeader className="text-left px-0">
            <DrawerTitle className="text-lg font-extrabold text-white">
              Exchange your contact with {ownerName}
            </DrawerTitle>
            <DrawerDescription className="text-white/60 text-sm">
              Share your details so {ownerName} can reach you too.
            </DrawerDescription>
          </DrawerHeader>
          {formContent}
        </DrawerContent>
      </Drawer>
    </>
  );
}
