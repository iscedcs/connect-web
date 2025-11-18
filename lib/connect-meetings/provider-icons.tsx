// lib/connect-meetings/provider-icons.tsx
import { Video, Globe, Camera, Users } from "lucide-react";
import { MeetingProvider } from "./providers";

export function ProviderIcon({ provider }: { provider: MeetingProvider }) {
  switch (provider) {
    case "google_meet":
      return <Video className="w-5 h-5 text-green-400" />;
    case "zoom":
      return <Camera className="w-5 h-5 text-blue-400" />;
    case "teams":
      return <Users className="w-5 h-5 text-purple-400" />;
    case "webex":
      return <Video className="w-5 h-5 text-cyan-400" />;
    case "slack":
      return <Video className="w-5 h-5 text-cyan-600" />;
    case "discord":
      return <Video className="w-5 h-5 text-cyan-600" />;
    default:
      return <Globe className="w-5 h-5 text-white/70" />;
  }
}
