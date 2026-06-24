/**
 * Admin dashboard domain models.
 */

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export interface GrowthMetric {
  label: string;
  value: number;
}

export interface DistributionMetric {
  category: string;
  count: number;
  percentage: number;
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  activeEvents: number;
  recentActivity: RecentActivity[];
  userGrowth: GrowthMetric[];
  careerDistribution: DistributionMetric[];
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  career: string;
  avatarUrl?: string;
  profileComplete: boolean;
}

export interface Faculty { id: string; name: string; }
export interface Course { id: string; name: string; faculty: Faculty; }
export interface AcademicInterest { id: string; name: string; }

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  image?: string;
  attendeesCount: number;
  communityLinks?: {
    whatsapp?: string;
    telegram?: string;
    discord?: string;
  };
}
