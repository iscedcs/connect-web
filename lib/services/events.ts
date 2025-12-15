import { URLS } from "@/lib/const";
import { http } from "./http";

const EVENT_API = process.env.NEXT_PUBLIC_LIVE_EVENTS_BACKEND_URL;

// export async function fetchUserEvents(userId: string) {
//   try {
//     const url = `${EVENT_API}${URLS.events.public_user_events.replace(
//       "{userId}",
//       userId
//     )}`;

//     const res = await http.get(url);

//     return res.data?.data ?? [];
//   } catch (err: any) {
//     if (err?.response?.data?.message === "No events found") {
//       return [];
//     }
//     return [];
//   }
// }

export async function fetchUserEvents(userId: string) {
  try {
    const url = `${EVENT_API}${URLS.events.all}?userId=${userId}`;

    const res = await http.get(url);

    return res.data?.data?.events ?? [];
  } catch (err) {
    console.error("Events fetch failed →", err);
    return [];
  }
}
