/**
 * GraphQL response shape for UPDATE_PROFILE_MUTATION.
 * Matches the backend Profile type in schema.graphqls.
 */
export interface UpdateProfileResponse {
  actualizarPerfil: {
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
    profileComplete?: boolean;
  };
}
