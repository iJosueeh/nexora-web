export function extractTags(content?: string): string[] {
  if (!content) return [];
  const tags = content.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  return [...new Set(tags.map((tag) => tag.slice(1).toLowerCase()))].slice(0, 5);
}

export function normalizeTag(tag: string): string {
  return tag.replace(/^#/, '').trim().toLowerCase();
}

export function normalizeRoleLabel(role: string): string {
  const normalized = role.trim().toUpperCase();
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

  return role
    .replace(/^ROLE_/, '')
    .toLowerCase()
    .split('_')
    .map((part) => part ? part.charAt(0).toUpperCase() + part.slice(1) : part)
    .join(' ');
}

export function buildAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function createLocalPostId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `publication-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
