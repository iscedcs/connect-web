interface DashboardWelcomeProps {
  firstName?: string | null;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardWelcome({ firstName }: DashboardWelcomeProps) {
  const greeting = getGreeting();
  const name = firstName ? `, ${firstName}` : "";
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {greeting}
          {name}
        </h1>
        <p className="text-sm text-white/40 mt-0.5">
          Here&apos;s what&apos;s happening on your card
        </p>
      </div>
      <p className="text-sm text-white/25 shrink-0 pt-1 tabular-nums">
        {dateLabel}
      </p>
    </div>
  );
}
