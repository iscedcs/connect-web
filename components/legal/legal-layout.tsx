"use client";
import { LeftIcon } from "@/lib/icons";
import { useRouter } from "next/navigation";

export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => router.back()}>
        <LeftIcon />
      </button>
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {lastUpdated && (
            <p className="text-xs text-white/50 mt-1">
              Last updated: {lastUpdated}
            </p>
          )}
        </header>

        <section className="prose prose-invert prose-sm max-w-none">
          {children}
        </section>
      </div>
    </main>
  );
}
