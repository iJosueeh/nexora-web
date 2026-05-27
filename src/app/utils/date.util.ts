export function formatRelativeTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Reciente';

  const diffMs = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < 60_000) return 'Hace segundos';
  if (diffMs < hour) return `Hace ${Math.floor(diffMs / minute)}m`;
  if (diffMs < day) return `Hace ${Math.floor(diffMs / hour)}h`;
  
  if (diffMs < 7 * day) {
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    });
  }

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
