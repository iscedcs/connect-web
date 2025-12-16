import { http } from "@/lib/services/http";
import { URLS } from "@/lib/const";

export async function fetchReceivedContacts({
  accessToken,
  page = 1,
  limit = 10,
}: {
  accessToken: string;
  page?: number;
  limit?: number;
}) {
  try {
    const res = await http.get(
      `${process.env.NEXT_PUBLIC_LIVE_ISCECONNECT_BACKEND_URL}${URLS.contact.recieved}`,
      {
        params: { page, limit },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log({ res });

    return res.data?.data ?? [];
  } catch (err: any) {
    throw err;
  }
}
