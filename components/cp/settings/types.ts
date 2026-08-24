export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface BusinessHour {
  day: number
  open: string
  close: string
  isOpen: boolean
}

export interface Branding {
  primaryColor: string
  secondaryColor: string
  fontFamily: string
}

export interface AppointmentDefaults {
  duration: number
  gracePeriod: number
}

export interface BankDetails {
  bankName: string
  accountName: string
  accountNumber: string
}

export interface InvoiceDefaults {
  dueDays: number
  currency: string
  notes: string
  bankDetails: BankDetails
}

export interface NotificationPrefs {
  emailEnabled: boolean
  smsEnabled: boolean
}

export interface FullCompanyProfile {
  name: string
  logo: string
  description: string
  contactEmail: string
  contactPhone: string
  address: Address
  businessHours: BusinessHour[]
  branding: Branding
  appointmentDefaults: AppointmentDefaults
  invoiceDefaults: InvoiceDefaults
  notificationPrefs: NotificationPrefs
}

export const defaultHours: BusinessHour[] = [
  { day: 0, open: '09:00', close: '17:00', isOpen: false }, // Sun
  { day: 1, open: '08:00', close: '18:00', isOpen: true },  // Mon
  { day: 2, open: '08:00', close: '18:00', isOpen: true },  // Tue
  { day: 3, open: '08:00', close: '18:00', isOpen: true },  // Wed
  { day: 4, open: '08:00', close: '18:00', isOpen: true },  // Thu
  { day: 5, open: '08:00', close: '18:00', isOpen: true },  // Fri
  { day: 6, open: '09:00', close: '15:00', isOpen: true },  // Sat
]

export const emptyProfile: FullCompanyProfile = {
  name: '',
  logo: '',
  description: '',
  contactEmail: '',
  contactPhone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  },
  businessHours: defaultHours,
  branding: {
    primaryColor: '#10B981',
    secondaryColor: '#141414',
    fontFamily: 'Inter',
  },
  appointmentDefaults: {
    duration: 30,
    gracePeriod: 10,
  },
  invoiceDefaults: {
    dueDays: 14,
    currency: 'NGN',
    notes: '',
    bankDetails: {
      bankName: '',
      accountName: '',
      accountNumber: '',
    },
  },
  notificationPrefs: {
    emailEnabled: true,
    smsEnabled: true,
  },
}
