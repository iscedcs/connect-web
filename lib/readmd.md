We have work to do..

We have bunch of task that was assigned via linear but I intend to start the project again because I don't like what the backend guy did on the Ui and the project arrangement.

We're starting the business part of connect called connect + (connect plus) and it's for business owners.

This is the normal one: https://isce.app/
A documentation was drafted.
But it's against what's on the UI:
web:
https://www.figma.com/design/yQnElDPbA4xGhBWL48Mkop/Ecosystem-Isce?node-id=2219-7601

mobile:
https://www.figma.com/design/gpPkBMWVxtmIHIyyPc6N8u/ISCE--Copy-?node-id=681-12680&t=wR4muDU3D4GeGygl-0

So what I want to do now it look at what's on the UI and compare that to what's on the prd; include/adjust what's missing Ui to the prd.

The idea is the person that handed over the project didn't consider what was on the Ui before preparing the documentations.

These are all the endpoints we're to integrate for the business.

I've been able to organise them in my const.ts
//BUSINESS ENDPOINTS
organization: {
create: "/api/cp/organizations",
one: "/api/cp/organizations/me",
update: "/api/cp/organizations/me",
archive: "/api/cp/organizations/me",
analytics: "/api/cp/organizations/me/analytics",
},
organization_audit_log: {
all: "/api/cp/audit-logs",
my_logs: "/api/cp/audit-logs/me",
all_org_audit_logs: "/api/cp/audit-logs/org",
export: "/api/cp/audit-logs/export",
verify: "/api/cp/audit-logs/verify",
},
organization_analytics: {
summary: "/api/cp/analytics/attendance",
clients: "/api/cp/analytics/clients",
invoices: "/api/cp/analytics/invoices",
staff: "/api/cp/analytics/staff/{staffId}",
},
organization_subscriptions: {
active: "/api/cp/organizations/me/subscription",
upgrade: "/api/cp/organizations/me/subscription/upgrade",
},
workspaces: {
create: "/api/cp/workspaces",
all: "/api/cp/workspaces",
get_one: "/api/cp/workspaces/{id}",
update: "/api/cp/workspaces/{id}",
status: "/api/cp/workspaces/{id}/status",
invite: "/api/cp/workspaces/{id}/invite-admin",
my_workspaces: "/api/cp/my-workspaces",
},
notifications: {
all: "/api/cp/notifications",
read_all: "/api/cp/notifications/read-all",
read_one: "/api/cp/notifications/{id}/read",
},
chat: {
my_chat: "/api/cp/conversations",
direct_chat: "/api/cp/conversations/direct",
send_message: "/api/cp/conversations/{convId}/messages",
get_message: "/api/cp/conversations/{convId}/messages",
mark_as_read: "/api/cp/conversations/{convId}/messages/read",
},
company_profile: {
get: "/api/cp/company-profile",
update: "/api/cp/company-profile",
},
staffs: {
invite: "/api/cp/staff/invite",
all: "/api/cp/staff/invites",
staff: "/api/cp/staff",
one_staff: "/api/cp/staff/{staffId}",
update_staff_status: "/api/cp/staff/{staffId}/status",
update_staff: "/api/cp/staff/{staffId}",
update_role: "/api/cp/staff/{staffId}/role",
},
invites: {
send: "/api/cp/invites",
all: "/api/cp/invites",
one: "/api/cp/invites/{inviteId}",
revoke: "/api/cp/invites/{inviteId}",
resend: "/api/cp/invites/{inviteId}/resend",
},
attendance: {
check_in: "/api/cp/attendance/check-in",
check_out: "/api/cp/attendance/check-out",
my_history: "/api/cp/attendance/me",
all: "/api/cp/attendance",
one: "/api/cp/attendance/{staffId}",
update: "/api/cp/attendance/{recordId}/override",
},
leads: {
all: "/api/cp/leads",
one: "/api/cp/leads/{leadId}",
temporal_delete: "/api/cp/leads/{leadId}",
assign: "/api/cp/leads/{leadId}/assign",
validate: "/api/cp/leads/{leadId}/validate",
reject: "/api/cp/leads/{leadId}/reject",
},
clients: {
my_client: "/api/cp/clients/me",
all: "/api/cp/clients",
assigned: "/api/cp/clients/assigned",
one_client: "/api/cp/clients/{clientId}",
reassign: "/api/cp/clients/{clientId}/assign",
invite: "/api/cp/clients/{clientId}/invite",
},
appoinments: {
my_appointment: "/api/cp/appointments/me",
create_my_appointment: "/api/cp/appointments/me",
reschedule_my_appointment: "/api/cp/appointments/me/{id}",
cancel_my_appointment: "/api/cp/appointments/me/{id}",
assigned: "/api/cp/appointments/assigned",
all: "/api/cp/appointments",
create: "/api/cp/appointments",
one: "/api/cp/appointments/{id}",
update: "/api/cp/appointments/{id}",
cancel: "/api/cp/appointments/{id}/cancel",
update_appointment_status: "/api/cp/appointments/{id}/status",
},
invoices: {
create: "/api/cp/invoices",
all: "/api/cp/invoices",
assigned: "/api/cp/invoices/assigned",
my_invoices: "/api/cp/invoices/me",
export: "/api/cp/invoices/export",
download: "/api/cp/invoices/{invoiceId}/download",
send: "/api/cp/invoices/{invoiceId}/send",
paid: "/api/cp/invoices/{invoiceId}/mark-paid",
cancel: "/api/cp/invoices/{invoiceId}/cancel",
update: "/api/cp/invoices/{invoiceId}",
one: "/api/cp/invoices/{invoiceId}",
},
company: {
one: "/api/cp/public/{workspaceSlug}",
public: "/api/cp/public/{workspaceSlug}/appointments}",
save: "/api/cp/public/{workspaceSlug}/contacts/save",
},
webhooks: {
handle_invite_accepted: "/api/cp/webhooks/invite-accepted",
handle_paystack_payment: "/api/cp/webhooks/paystack",
},
jobs: {
create: "/api/cp/jobs",
all: "/api/cp/jobs",
one_application: "/api/cp/jobs/{jobId}/applications",
one: "/api/cp/jobs/{id}",
apply: "/api/cp/jobs/{id}/apply",
},
talent: {
search: "/api/cp/talent/search",
invite_artisan: "/api/cp/talent/{artisanId}/invite/{jobId}",
saved_talent: "/api/cp/talent/saved",
save_artisan: "/api/cp/talent/saved/{artisanId}",
remove_artisan: "/api/cp/talent/saved/{artisanId}",
},
