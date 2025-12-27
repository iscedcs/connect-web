"use client";

export default function ContactCard({
  contact,
  onClick,
}: {
  contact: any;
  onClick?: () => void;
}) {
  const fullName =
    [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
    "Unnamed Contact";

  return (
    <button
      onClick={onClick}
      className="
        w-full text-left
        bg-neutral-900/80 border border-white/10
        rounded-2xl p-4
        transition hover:bg-neutral-800/80 hover:border-white/20
      ">
      <p className="font-semibold text-white">{fullName}</p>

      {contact.email && (
        <p className="text-sm text-white/60 truncate">{contact.email}</p>
      )}

      {contact.phone && (
        <p className="text-sm text-white/60">{contact.phone}</p>
      )}

      {contact.note && (
        <p className="text-xs italic text-white/40 mt-1 line-clamp-1">
          “{contact.note}”
        </p>
      )}

      <p className="text-[11px] text-white/30 mt-2">
        Received {new Date(contact.createdAt).toLocaleString()}
      </p>
    </button>
  );
}
