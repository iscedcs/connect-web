// ── Connect Plus shared types ──

export type CpRole = 'CREATOR' | 'WORKSPACE_ADMIN' | 'STAFF' | 'CLIENT'

export interface CpContext {
  workspaceId: string
  workspaceSlug: string
  organizationId: string
  role: CpRole
  memberId: string
  staffProfileId?: string
  clientId?: string
}

export interface CpWorkspace {
  id: string
  slug: string
  name: string
  logo?: string
  category?: string
  address?: string
  phone?: string
  email?: string
  naicsCode?: string
  description?: string
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED'
  organizationId: string
  role?: CpRole
  memberId?: string
  createdAt: string
  updatedAt: string
}

export interface CpStaffMember {
  id: string
  workspaceId?: string
  userId?: string
  name: string
  email: string
  avatar?: string
  jobTitle?: string
  department?: string
  role: CpRole
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  joinedAt?: string
  createdAt?: string
}

export interface CpInvoice {
  id: string
  workspaceId?: string
  invoiceNumber: string
  clientId?: string
  clientName?: string
  clientEmail?: string
  lineItems: CpLineItem[]
  subtotal: number
  tax: number
  discount?: number
  shipping?: number
  total: number
  status: 'DRAFT' | 'SENT' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate?: string
  instructions?: string
  payTo?: string
  createdById?: string
  createdByName?: string
  createdAt: string
  updatedAt?: string
}

export interface CpLineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export type AppointmentType = 'ONSITE' | 'REMOTE'
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export interface CpAppointment {
  id: string
  workspaceId?: string
  title: string
  clientId?: string
  clientName: string
  clientEmail?: string
  staffId?: string
  staffName?: string
  staffAvatar?: string
  type: AppointmentType
  status: AppointmentStatus
  scheduledAt: string
  durationMinutes?: number
  duration?: number
  location?: string
  meetingUrl?: string
  meetingLink?: string
  platform?: 'GOOGLE_MEET' | 'ZOOM' | 'CUSTOM'
  notes?: string
  createdAt: string
}

export interface CpLead {
  id: string
  workspaceId?: string
  name: string
  email?: string
  phone?: string
  source?: 'CARD_TAP' | 'FORM_SUBMIT' | 'MANUAL' | 'NFC Tap' | 'Public Booking' | string
  status: 'NEW' | 'CONTACTED' | 'VALIDATED' | 'REJECTED'
  assignedStaffId?: string
  assignedStaffName?: string
  assignedStaffAvatar?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface CpClient {
  id: string
  workspaceId?: string
  name: string
  email?: string
  phone?: string
  company?: string
  avatar?: string
  assignedStaffId?: string
  assignedStaffName?: string
  assignedStaffAvatar?: string
  status?: 'ACTIVE' | 'INACTIVE'
  clientSince?: string
  createdAt: string
  appointments?: CpAppointment[]
  invoices?: CpInvoice[]
}

export interface CpAttendanceRecord {
  id: string
  workspaceId?: string
  staffId?: string
  staffName: string
  staffAvatar?: string
  date?: string
  checkIn: string
  checkOut?: string
  hoursWorked?: number
  overtime?: number
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'ON_TIME' | 'LATE' | 'ABSENT' | 'AUTO'
  overriddenBy?: string
  overriddenAt?: string
  overrideReason?: string
}

export interface CpConnectCard {
  id: string
  workspaceId: string
  cardCode: string
  status: 'ACTIVE' | 'UNASSIGNED' | 'SUSPENDED' | 'LOST'
  assignedToId?: string
  assignedToName?: string
  pairedById?: string
  pairedByName?: string
  pairedAt?: string
  tapConfig?: {
    enableBook: boolean
    enableSave: boolean
    enableView: boolean
  }
  deviceId?: string
}

export interface CpConversation {
  id: string
  workspaceId?: string
  type?: 'WORKSPACE_GROUP' | 'DIRECT' | 'CLIENT_STAFF'
  isGroup?: boolean
  name: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
  participants?: CpConversationParticipant[]
  isPinned?: boolean
  updatedAt: string
}

export interface CpConversationParticipant {
  id: string
  name: string
  avatar?: string
  role?: CpRole
}

export interface CpMessage {
  id: string
  conversationId: string
  senderId?: string
  senderName: string
  senderAvatar?: string
  type?: 'TEXT' | 'IMAGE' | 'AUDIO' | 'FILE' | 'SYSTEM'
  content: string
  fileUrl?: string
  createdAt: string
  readBy?: string[]
}

export interface CpNotification {
  id: string
  workspaceId: string
  type: 'LEAD_ADDED' | 'INVOICE_SENT' | 'APPOINTMENT_BOOKED' | 'STAFF_JOINED' | 'PAYMENT_RECEIVED'
  title: string
  body?: string
  source?: string
  read: boolean
  actionUrl?: string
  createdAt: string
}

export interface CpAnalytics {
  profileViews: number
  followers?: number
  taps?: number
  tapCount?: number
  leadsCaptured?: number
  activeDevices?: number
  activeStaff?: number
  trends?: {
    profileViews: number
    followers: number
    tapCount: number
  }
}

export interface CpInvite {
  id: string
  email: string
  role: CpRole
  token?: string
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
  expiresAt?: string
  createdAt: string
  workspaceName?: string
  workspaceLogo?: string
}

export interface CpJob {
  id: string
  title: string
  description?: string
  location?: string
  salaryRange?: string
  applicationsCount?: number
  createdAt: string
}

export interface CpApplication {
  id: string
  jobId: string
  applicantName: string
  applicantEmail: string
  coverLetter?: string
  status?: string
  createdAt: string
}

export interface CpTalent {
  id: string
  name: string
  title: string
  skills: string[]
  location?: string
  rating?: number
  avatar?: string
}
