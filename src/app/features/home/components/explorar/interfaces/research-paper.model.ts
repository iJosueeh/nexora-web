export interface ResearchPaper {
  id: string;
  slug: string;
  title: string;
  summary: string;
  faculty: string;
  views: number;
  author: {
    id: string;
    username?: string;
    fullName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  pdfUrl?: string;
  isFeatured?: boolean;
}

export interface CreateResearchPaperInput {
  title: string;
  summary: string;
  faculty: string;
  pdfUrl?: string;
}

export interface UpdateResearchPaperInput {
  title?: string;
  summary?: string;
  faculty?: string;
  pdfUrl?: string;
}
