import OtpClientSection from "@/components/pages/home/otpclientsection";
import { getAuthInfo } from "@/actions/auth";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    cardid?: string;
    type?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const authInfo = await getAuthInfo();
  if ("error" in authInfo) {
    redirect("/login?callbackUrl=/otp/idle");
  }
  const params = await searchParams;
  const user = authInfo.user;
  return (
    <OtpClientSection
      cardId={params.cardid}
      deviceType={params.type}
      user={user}
    />
  );
}
