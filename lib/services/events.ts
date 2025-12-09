import { URLS } from "@/lib/const";
import { http } from "./http";

const EVENT_API = process.env.NEXT_PUBLIC_LIVE_EVENTS_BACKEND_URL;

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
