"use client";
import { useRouter } from "next/navigation";

export default function ContactCard({ contact }: { contact: any }) {
  const router = useRouter();
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-xl p-4">
      <p className="font-medium">{contact.name || "Unnamed Contact"}</p>

      {contact.email && (
        <p className="text-sm text-white/60">{contact.email}</p>
      )}

      {contact.phone && (
        <p className="text-sm text-white/60">{contact.phone}</p>
      )}

      <p className="text-xs text-white/40 mt-2">
        Received {new Date(contact.createdAt).toLocaleString()}
      </p>
    </div>
  );
}
