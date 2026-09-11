import type { AuditLog } from "@/lib/types/cp";

// â”€â”€ Fallback dashboard activities (shown while audit logs load or if empty) â”€â”€
export const FALLBACK_ACTIVITIES: Array<{ title: string; time: string }> = [
  { title: "Invoice #1234587 paid", time: "2 hours ago" },
  { title: "New team member added: Donna...", time: "5 hours ago" },
  { title: "Product 'Apple iMac 27\"' updated", time: "1 day ago" },
  { title: "Appointment with Ralph Edwards", time: "2 days ago" },
  { title: "Invoice #1846320 sent to Flowbite...", time: "3 days ago" },
];

// â”€â”€ Format an audit log entry into a human-readable activity title â”€â”€
export function formatAuditAction(
  log: Partial<AuditLog> & Record<string, any>,
): string {
  // 1. If backend provides explicit title, description, or summary
  if (log.title) return log.title;
  if (log.description) return log.description;
  if (log.message) return log.message;
  if (log.summary) return log.summary;

  // 2. Extract eventType or action (backend uses eventType like "COMPANY_PROFILE_UPDATED", "WORKSPACE_CREATED")
  const event = (log.eventType || log.event || log.action || "")
    .toUpperCase()
    .trim();
  const target =
    log.targetResource ||
    log.targetName ||
    log.resourceName ||
    log.target ||
    log.resource ||
    "";
  const entity = log.targetEntity || "";
  const actor = log.actor || log.actorName || log.performedBy || "";

  switch (event) {
    // â”€â”€ Organization & Workspaces â”€â”€
    case "COMPANY_PROFILE_UPDATED":
    case "PROFILE_UPDATED":
      return "Company profile updated";
    case "WORKSPACE_CREATED":
      return target ? `Workspace '${target}' created` : "Workspace created";
    case "WORKSPACE_UPDATED":
      return target ? `Workspace '${target}' updated` : "Workspace updated";
    case "ORG_CREATED":
    case "ORGANIZATION_CREATED":
      return target
        ? `Organization '${target}' created`
        : "Organization created";
    case "SUBSCRIPTION_CREATE":
    case "SUBSCRIPTION_CREATED":
      return "Subscription activated";
    case "SUBSCRIPTION_UPGRADED":
      return "Subscription upgraded";

    // â”€â”€ Invoices â”€â”€
    case "INVOICE_PAID":
      return target ? `Invoice ${target} paid` : "Invoice paid";
    case "INVOICE_SENT":
      return target ? `Invoice ${target} sent` : "Invoice sent";
    case "INVOICE_CREATED":
      return target ? `Invoice ${target} created` : "New invoice created";
    case "INVOICE_CANCELLED":
      return target ? `Invoice ${target} cancelled` : "Invoice cancelled";

    // â”€â”€ Staff â”€â”€
    case "STAFF_INVITED":
    case "STAFF_JOINED":
    case "MEMBER_ADDED":
      return target
        ? `New team member added: ${target}`
        : "New team member added";
    case "STAFF_ROLE_CHANGED":
      return target ? `Role updated: ${target}` : "Staff role updated";
    case "STAFF_REMOVED":
      return target ? `Staff removed: ${target}` : "Staff member removed";

    // â”€â”€ Appointments â”€â”€
    case "APPOINTMENT_BOOKED":
    case "APPOINTMENT_CONFIRMED":
    case "APPOINTMENT_CREATED":
      return target ? `Appointment with ${target}` : "Appointment scheduled";
    case "APPOINTMENT_CANCELLED":
      return target
        ? `Appointment cancelled: ${target}`
        : "Appointment cancelled";
    case "APPOINTMENT_RESCHEDULED":
      return target
        ? `Appointment rescheduled: ${target}`
        : "Appointment rescheduled";

    // â”€â”€ Leads â”€â”€
    case "LEAD_CAPTURED":
    case "LEAD_ADDED":
      return target ? `Lead captured: ${target}` : "New lead captured";
    case "LEAD_VALIDATED":
      return target ? `Lead validated: ${target}` : "Lead validated";
    case "LEAD_REJECTED":
      return target ? `Lead rejected: ${target}` : "Lead rejected";
    case "LEAD_ASSIGNED":
      return target ? `Lead assigned: ${target}` : "Lead assigned to staff";

    // â”€â”€ Products â”€â”€
    case "PRODUCT_UPDATED":
      return target ? `Product '${target}' updated` : "Product updated";
    case "PRODUCT_CREATED":
      return target ? `Product '${target}' created` : "New product added";

    // â”€â”€ Attendance â”€â”€
    case "ATTENDANCE_CHECKED_IN":
    case "CHECK_IN":
      return actor ? `${actor} checked in` : "Staff check-in recorded";
    case "ATTENDANCE_CHECKED_OUT":
    case "CHECK_OUT":
      return actor ? `${actor} checked out` : "Staff check-out recorded";

    // â”€â”€ Generic fallback â”€â”€
    case "UPDATE":
      if (entity) {
        const cleanEntity = entity
          .replace(/^Cp/, "")
          .replace(/([A-Z])/g, " $1")
          .trim();
        return `${cleanEntity} updated`;
      }
      return "Settings updated";
    case "CREATE":
      if (entity) {
        const cleanEntity = entity
          .replace(/^Cp/, "")
          .replace(/([A-Z])/g, " $1")
          .trim();
        return `${cleanEntity} created`;
      }
      return "Resource created";
    case "DELETE":
      if (entity) {
        const cleanEntity = entity
          .replace(/^Cp/, "")
          .replace(/([A-Z])/g, " $1")
          .trim();
        return `${cleanEntity} deleted`;
      }
      return "Resource deleted";

    default: {
      if (!event)
        return target || actor ? `Activity by ${actor}` : "Recent activity";
      const clean = event
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/^\w/, (c: any) => c.toUpperCase());
      return target ? `${clean}: ${target}` : clean;
    }
  }
}

// â”€â”€ Format ISO timestamp to human-readable relative time â”€â”€
export function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "recently";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) return "Just now";
  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7)
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 5)
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// â”€â”€ Map raw audit log array to dashboard activity items â”€â”€
export function mapAuditLogsToActivities(
  rawLogs: any[],
  limit = 5,
): Array<{ title: string; time: string }> {
  return rawLogs.slice(0, limit).map((log: any) => ({
    title: formatAuditAction(log),
    time: formatRelativeTime(
      log.createdAt || log.timestamp || log.date || log.updatedAt,
    ),
  }));
}
