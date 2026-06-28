export interface ResourceRating {
  id: string;
  resourceId: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  rating: number;
  createdAt: string;
}

export interface ResourceRatingPayload {
  averageRating: number;
  ratingsCount: number;
  userRating: number;
}
