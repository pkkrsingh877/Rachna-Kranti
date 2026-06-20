export interface PaginatedResponse<T> {
  count: number;
  previous: string | null;
  next: string | null;
  results: T[];
}

export interface ContentItem {
  _id: string;
  title: string;
  slug: string;
  authorId: { _id: string; name: string; email: string; image?: string };
  contentType: string;
  content: any;
  tags: string[];
  description?: string;
  excerpt?: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  aiGenerated: boolean;
  likesCount: number;
  wordCount?: number;
  readingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  _id: string;
  name: string;
  email: string;
  image?: string;
  username?: string;
  role: string;
  bio?: string;
  preferences?: {
    theme: string;
    fontSize: string;
    autoSave: boolean;
  };
}
