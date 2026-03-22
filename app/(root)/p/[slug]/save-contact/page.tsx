import SaveContactForm from '@/components/customer/save-contact-form';
import { Suspense } from "react";

export default async function SlugSaveContactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="h-[100svh] bg-black">
      <Suspense>
        <SaveContactForm profileId={slug} lookupMode="slug" />
      </Suspense>
    </main>
  );
}
