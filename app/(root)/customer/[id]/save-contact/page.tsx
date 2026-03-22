import SaveContactForm from '@/components/customer/save-contact-form';
import { Suspense } from "react";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SaveContactPage({ params }: any) {
  const { id } = await params;
  const lookupMode = UUID_RE.test(id) ? "device" : "slug";

  return (
    <main className="h-[100svh] bg-black">
      <Suspense>
        <SaveContactForm
          profileId={id}
          lookupMode={lookupMode as "device" | "slug"}
        />
      </Suspense>
    </main>
  );
}
