import { getAuthInfo } from "@/actions/auth";
import CategoriesGrid from "@/components/cardholder/connect/links/categories-grid";

export const dynamic = "force-dynamic";

export default async function AddLinksHubPage() {
  const auth = await getAuthInfo();
  const isAuthed = !("error" in auth) && !auth.isExpired;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-5 pt-10 pb-4 relative">
        {/* Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="w-40 h-40 bg-primary/25 blur-[90px] absolute top-0 left-0 opacity-40"></div>
          <div className="w-28 h-28 bg-white/10 blur-2xl absolute bottom-6 right-6 opacity-25"></div>
        </div>

        <h1 className="text-3xl font-semibold leading-snug tracking-tight">
          Add a
          <span className="ml-1 bg-gradient-to-r from-primary/80 to-white/90 bg-clip-text text-transparent">
            New Link
          </span>
        </h1>

        <p className="text-white/60 mt-3 text-sm max-w-md leading-relaxed">
          Choose a link category to get started. You’ll customise the details in
          the next step — simple and seamless.
        </p>

        <div className="mt-6 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
      </section>

      <section className="p-5">
        <CategoriesGrid isAuthed={isAuthed} />
      </section>
    </main>
  );
}
