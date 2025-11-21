export type AppointmentProvider =
  | "Calendly"
  | "Cal.com"
  | "TidyCal"
  | "Zoho"
  | "Acuity"
  | "Google"
  | "Other";

const PROVIDER_PATTERNS: Record<AppointmentProvider, RegExp[]> = {
  Calendly: [/calendly\.com/],
  "Cal.com": [/cal\.com/],
  TidyCal: [/tidycal\.com/],
  Zoho: [/zoho\.(com|eu)\/bookings/],
  Acuity: [/acuityscheduling\.com/],
  Google: [/calendar\.google\.com/],
  Other: [/./],
};

export function detectAppointmentProvider(url: string): AppointmentProvider {
  const clean = url.toLowerCase();

  for (const provider in PROVIDER_PATTERNS) {
    const patterns = PROVIDER_PATTERNS[provider as AppointmentProvider];
    if (patterns.some((p) => p.test(clean))) {
      return provider as AppointmentProvider;
    }
  }
  return "Other";
}
