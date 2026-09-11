import { NextResponse } from "next/server";
import { getAuthInfo } from "@/actions/auth";

export async function GET() {
  const authInfo = await getAuthInfo();

  if ("error" in authInfo) {
    return NextResponse.json({ error: authInfo.error }, { status: 401 });
  }

  return NextResponse.json({
    accessToken: authInfo.accessToken,
    bearerToken: `Bearer ${authInfo.accessToken}`,
    user: authInfo.user,
    willExpireAt: authInfo.willExpireAt,
  });
}
