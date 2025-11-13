// app/connect/links/page.tsx
import { getAuthInfo } from "@/actions/auth";
import CategoriesGrid from "@/components/cardholder/connect/links/categories-grid";

export const dynamic = "force-dynamic";

export default async function AddLinksHubPage() {
  const auth = await getAuthInfo();
  const isAuthed = !("error" in auth) && !auth.isExpired;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="px-5 pt-6 pb-3">
        <h1 className="text-2xl font-semibold">
          Which link would you love to add?
        </h1>
        <p className="text-white/60 text-sm mt-1">
          {` Choose a category — you’ll configure details in the next step.`}
        </p>
      </section>

      <section className="p-5">
        <CategoriesGrid isAuthed={isAuthed} />
      </section>
    </main>
  );
}
