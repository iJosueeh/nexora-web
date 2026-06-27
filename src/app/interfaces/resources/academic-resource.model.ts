import { ResourceCategory } from './resource-category.model';
import { ResourceType } from './resource-type.enum';

export interface AcademicResource {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  category: ResourceCategory;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
  };
  fileUrl: string;
  fileSize: number;
  fileFormat: string;
  averageRating: number;
  ratingsCount: number;
  userRating: number | null;
  downloadCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ResourceFilter {
  careerId?: string;
  categoryId?: string;
  type?: ResourceType;
  authorId?: string;
  minRating?: number;
  query?: string;
}

export interface CreateResourceInput {
  title: string;
  description?: string;
  categoryId: string;
  type: ResourceType;
}

export interface UpdateResourceInput {
  title?: string;
  description?: string;
  categoryId?: string;
  type?: ResourceType;
}
