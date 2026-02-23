"use client";

import Image from "next/image";

export default function ContactCard({
  contact,
  onClick,
}: {
  contact: any;
  onClick?: () => void;
}) {
  const profile = contact.contactProfile;
  const isLinked = !!profile;

  const displayName = isLinked
    ? profile.name || "Unnamed"
    : [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      "Unnamed Contact";

  const subtitle = isLinked
    ? profile.position || profile.location || null
    : contact.email || contact.phone || null;

  const avatarUrl = isLinked ? profile.profilePhoto : null;

  return (
    <button
      onClick={onClick}
      className="
        w-full text-left
        bg-neutral-900/80 border border-white/10
        rounded-2xl p-4
        transition hover:bg-neutral-800/80 hover:border-white/20
      ">
      <div className="flex items-center gap-3">
        {/* Avatar or initials */}
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-white/60 text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white truncate">{displayName}</p>
            {isLinked && (
              <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                Connected
              </span>
            )}
            {!isLinked && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                Guest
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-sm text-white/60 truncate">{subtitle}</p>
          )}

          {/* Show phone as second line if email is already shown as subtitle */}
          {!isLinked && contact.phone && contact.email && (
            <p className="text-sm text-white/60">{contact.phone}</p>
          )}

          {contact.note && (
            <p className="text-xs italic text-white/40 mt-0.5 line-clamp-1">
              &ldquo;{contact.note}&rdquo;
            </p>
          )}
        </div>
      </div>

      <p className="text-[11px] text-white/30 mt-2">
        Received {new Date(contact.createdAt).toLocaleString()}
      </p>
    </button>
  );
}
