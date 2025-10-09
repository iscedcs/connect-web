import OtpClientSection from "@/components/pages/cardholder/home/otpclientsection";

interface PageProps {
  searchParams: Promise<{
    cardid?: string;
    type?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  return <OtpClientSection cardId={params.cardid} deviceType={params.type} />;
}
