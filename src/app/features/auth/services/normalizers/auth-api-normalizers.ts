import {
  ApiEnvelopeDto,
  AuthResponseDto,
  LoginResponse,
  RegisterCatalogsResponse,
  RegisterResponse,
} from '../../../../interfaces/auth';

export function normalizeAuthResponse(rawResponse: unknown): RegisterResponse {
  const responseRecord = toRecord(rawResponse);
  const payload = resolvePayload(responseRecord);

  const email = getString(payload, 'email');
  const user = resolveUser(payload, email);
  const tokens = resolveTokens(payload);

  return {
    email,
    user,
    tokens,
  };
}

export function normalizeCatalogsResponse(rawResponse: unknown): RegisterCatalogsResponse {
  const responseRecord = toRecord(rawResponse);
  const payload = resolvePayload(responseRecord);

  return {
    careers: getStringArray(payload, 'careers'),
    academicInterests: getStringArray(payload, 'academicInterests'),
  };
}

function resolvePayload(responseRecord: Record<string, unknown>): Record<string, unknown> {
  const envelope = responseRecord as ApiEnvelopeDto<AuthResponseDto>;
  const dataCandidate = envelope.data;
  if (isObject(dataCandidate)) {
    return dataCandidate as Record<string, unknown>;
  }

  return responseRecord;
}

function resolveUser(payload: Record<string, unknown>, fallbackEmail: string): LoginResponse['user'] {
  const nestedUser = toRecord(payload['user']);
  const email = getString(nestedUser, 'email') || getString(payload, 'email') || fallbackEmail;
  if (!email) return undefined;

  const profileComplete = resolveProfileComplete(payload, nestedUser);
  const roles = resolveRoles(payload, nestedUser);
  const username = getString(nestedUser, 'username') || getString(payload, 'username');
  const fullName = getString(nestedUser, 'fullName') || getString(payload, 'fullName');
  const id = getString(nestedUser, 'id') || getString(payload, 'userId');
  const bio = getString(nestedUser, 'bio') || getString(payload, 'bio');
  const career = getString(nestedUser, 'career') || getString(payload, 'career');
  const avatarUrl = getString(nestedUser, 'avatarUrl') || getString(payload, 'avatarUrl');
  const bannerUrl = getString(nestedUser, 'bannerUrl') || getString(payload, 'bannerUrl');
  const followersCount = getNumber(nestedUser, 'followersCount') ?? getNumber(payload, 'followersCount');
  const followingCount = getNumber(nestedUser, 'followingCount') ?? getNumber(payload, 'followingCount');
  const isFollowing = getBoolean(nestedUser, 'isFollowing') ?? getBoolean(payload, 'isFollowing');
  const academicInterests = getStringArray(nestedUser, 'academicInterests').length > 0
    ? getStringArray(nestedUser, 'academicInterests')
    : getStringArray(payload, 'academicInterests');

  return {
    id: id || undefined,
    email,
    username: username || undefined,
    fullName: fullName || undefined,
    bio: bio || undefined,
    career: career || undefined,
    avatarUrl: avatarUrl || undefined,
    bannerUrl: bannerUrl || undefined,
    followersCount: followersCount ?? undefined,
    followingCount: followingCount ?? undefined,
    isFollowing: isFollowing ?? undefined,
    academicInterests: academicInterests.length > 0 ? academicInterests : undefined,
    roles,
    profileComplete,
  };
}

function resolveTokens(payload: Record<string, unknown>): RegisterResponse['tokens'] {
  const nestedTokens = toRecord(payload['tokens']);

  const accessToken = getString(nestedTokens, 'accessToken')
    || getString(payload, 'accessToken')
    || getString(payload, 'access_token');

  const refreshToken = getString(nestedTokens, 'refreshToken')
    || getString(payload, 'refreshToken')
    || getString(payload, 'refresh_token');

  const tokenType = getString(nestedTokens, 'tokenType')
    || getString(payload, 'tokenType')
    || getString(payload, 'token_type');

  if (!accessToken && !refreshToken && !tokenType) {
    return undefined;
  }

  return {
    accessToken: accessToken || undefined,
    refreshToken: refreshToken || undefined,
    tokenType: tokenType || undefined,
  };
}

function resolveProfileComplete(
  payload: Record<string, unknown>,
  nestedUser: Record<string, unknown>
): boolean | undefined {
  const direct = getBoolean(payload, 'profileComplete');
  if (direct !== undefined) return direct;

  const snake = getBoolean(payload, 'profile_complete');
  if (snake !== undefined) return snake;

  const nestedDirect = getBoolean(nestedUser, 'profileComplete');
  if (nestedDirect !== undefined) return nestedDirect;

  const nestedSnake = getBoolean(nestedUser, 'profile_complete');
  if (nestedSnake !== undefined) return nestedSnake;

  const username = getString(nestedUser, 'username') || getString(payload, 'username');
  const fullName = getString(nestedUser, 'fullName') || getString(payload, 'fullName');

  if (!username && !fullName) return false;
  return undefined;
}

function resolveRoles(payload: Record<string, unknown>, nestedUser: Record<string, unknown>): string[] | undefined {
  const roles = nestedUser['roles'];
  if (Array.isArray(roles)) {
    return roles
      .filter((role): role is string => typeof role === 'string' && !!role.trim())
      .map((role) => role.trim().toUpperCase());
  }

  const role = getString(payload, 'role') || getString(nestedUser, 'role');
  return role ? [role.trim().toUpperCase()] : undefined;
}

function normalizeRoleLabel(role: string): string {
  const trimmed = role.trim();
  if (!trimmed) return trimmed;

  const normalized = trimmed.toUpperCase();
  const roleMap: Record<string, string> = {
    ROLE_STUDENT: 'Estudiante',
    ROLE_TEACHER: 'Docente',
    ROLE_ADMIN: 'Administrador',
    ROLE_MODERATOR: 'Moderador',
    ROLE_RESEARCHER: 'Investigador',
  };

  if (normalized in roleMap) {
    return roleMap[normalized];
  }

  return trimmed
    .replace(/^ROLE_/, '')
    .toLowerCase()
    .split('_')
    .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : part)
    .join(' ');
}

function toRecord(value: unknown): Record<string, unknown> {
  return isObject(value) ? (value as Record<string, unknown>) : {};
}

function isObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function getBoolean(record: Record<string, unknown>, key: string): boolean | undefined {
  const value = record[key];
  return typeof value === 'boolean' ? value : undefined;
}

function getNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' ? value : undefined;
}

function getStringArray(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  if (!Array.isArray(value)) return [];

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}
