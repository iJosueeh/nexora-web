export interface Trend {
  category: string;
  title: string;
  conversations: string;
}

export interface SuggestedUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isFollowing?: boolean;
}

export const DEFAULT_TREND_CATEGORY = 'TENDENCIAS EN CIENCIA';
