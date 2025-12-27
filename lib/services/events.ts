import { URLS } from "@/lib/const";

/** ---------------------------------------
 * FETCH A DEVICE HOLDER PUBLIC EVENT 
 -----------------------------------------*/
export async function fetchPublicUserEvent(userId: string) {
  if (!userId) return [];

  const baseUrl = process.env.NEXT_PUBLIC_LIVE_EVENTS_BACKEND_URL;
  const path = URLS.events.public_user_events.replace("{userId}", userId);
  const url = `${baseUrl}${path}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const payload = await res.json();

    if (!res.ok) {
      if (payload?.message === "No events found") {
        return [];
      }

      console.error("Failed to fetch public events", payload);
      return [];
    }

    return payload?.data ?? [];
  } catch (error) {
    console.error("Public events fetch error:", error);
    return [];
  }
}

// export async function fetchUserEvents(userId: string) {
//   try {
//     const url = `${EVENT_API}${URLS.events.all}?userId=${userId}`;

//     const res = await http.get(url);

//     return res.data?.data?.events ?? [];
//   } catch (err) {
//     console.error("Events fetch failed →", err);
//     return [];
//   }
// }
