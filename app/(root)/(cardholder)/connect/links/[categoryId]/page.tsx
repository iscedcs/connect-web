import { notFound } from "next/navigation";
import { LINK_CATEGORIES } from "@/lib/connect-link-categories";

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const meta = LINK_CATEGORIES.find((c) => c.key === params.category);
  if (!meta) return notFound();

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <h1 className="text-2xl font-semibold">{meta.title}</h1>
      <p className="text-sm text-white/60 mt-1">
        Configure your {meta.title.toLowerCase()} link(s).
      </p>

      {/* TODO: mount the specific form component per category here */}
      <div className="mt-6 rounded-2xl border border-white/10 p-5">
        <p className="text-white/70 text-sm">
          {`  This is a placeholder. Next, we’ll drop in the exact form & wire the
          endpoints.`}
        </p>
      </div>
    </main>
  );
}
