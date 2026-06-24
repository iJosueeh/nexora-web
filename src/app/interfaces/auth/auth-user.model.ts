export interface AuthUser {
	id: string;
	email: string;
	username?: string;
	fullName?: string;
	bio?: string;
	career?: string;
	avatarUrl?: string;
	bannerUrl?: string;
	followersCount?: number;
	followingCount?: number;
	academicInterests?: string[];
	roles?: string[];
	profileComplete?: boolean;
	isFollowing?: boolean;
}
