export interface StudyGroup {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category: string;
  memberCount: number;
  maxMembers: number;
  isMember: boolean;
  myRole?: 'OWNER' | 'MODERATOR' | 'MEMBER' | null;
  createdAt: string;
}

export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: 'OWNER' | 'MODERATOR' | 'MEMBER';
  status: 'APPROVED' | 'PENDING';
  createdAt: string;
}

export interface CreateStudyGroupInput {
  name: string;
  description?: string;
  category?: string;
  isPrivate?: boolean;
  maxMembers?: number;
}

export interface UpdateStudyGroupInput {
  name?: string;
  description?: string;
  category?: string;
  isPrivate?: boolean;
  maxMembers?: number;
}
