interface Slide {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
}

// USER AND AUTHENTICATION
interface UserInfo {
  id?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  displayPicture?: string;
  userType?: string;
  iat?: number;
  exp?: number;
  profileId?: string;
}

interface AuthInfo {
  accessToken: string;
  user: UserInfo;
  expiresAt: number;
  isExpired: boolean;
  willExpireAt: string | null;
}

interface AuthError {
  error: string;
  accessToken?: never;
  user?: never;
}

interface ConnectProfile {
  id: string;
  userId: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
  name: string | null;
  position: string | null;
  description: string | null;
  address?: { street?: string | null };
}

interface DeviceInterface {
  id: string;
  userId: string;
  label?: string | null;
  isActive: boolean;
  isPrimary: boolean;
  assignedAt?: string | null;
  lastUsedAt?: string | null;
  productId: string;
  type: "6214bdef7dbcb" | "6214bdef6dbcb" | "6214bdef5dbcb" | "6214bdef4dbcb";
}
