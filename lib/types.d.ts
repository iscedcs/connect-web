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
