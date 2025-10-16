import { cookies } from "next/headers";

function decodeJwtPayload<T = any>(jwt: string): T | null {
  try {
    const base64 = jwt.split(".")[1];
    return JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function getBearerAndUserId(): Promise<{
  token?: string;
  userId?: string;
  error?: Response;
}> {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token) {
    return {
      error: new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    };
  }

  const payload = decodeJwtPayload<any>(token);
  const userId = payload?.id || payload?.sub || payload?.userId;

  if (!userId) {
    return {
      error: new Response(
        JSON.stringify({ message: "User id missing in token" }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      ),
    };
  }

  return { token, userId };
}
