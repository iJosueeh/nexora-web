import { AuthTokens } from '../../../interfaces/auth';

export function mapSupabaseSessionToTokens(session: any): AuthTokens {
  const expiresAt = session.expires_at 
    ? new Date(session.expires_at * 1000).toISOString() 
    : undefined;

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    tokenType: 'Bearer',
    expiresAt,
  };
}

export function isTokenExpired(expiresAtUnix: number | null | undefined): boolean {
  if (typeof expiresAtUnix !== 'number') return false;
  // Expired if less than 30 seconds left
  return Date.now() >= (expiresAtUnix * 1000) - 30_000;
}
