import SaveContactForm from "@/components/customer/save-contact-form";

export default async function SaveContactPage({ params }: any) {
  const { id } = await params;
  return (
    <main className="h-[100svh] bg-black">
      <SaveContactForm profileId={id} />
    </main>
  );
}
