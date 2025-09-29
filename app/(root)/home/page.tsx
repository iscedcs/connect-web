import MaxWidthWrapper from "@/components/maxwidth-wrapper";
import HomeClientSection from "@/components/pages/home/homesectionclient";

export default function HomePageTestSection() {
  return (
    <main className="bg-black text-white min-h-screen">
      <MaxWidthWrapper className="py-6 space-y-6">
        <HomeClientSection />
      </MaxWidthWrapper>
    </main>
  );
}
