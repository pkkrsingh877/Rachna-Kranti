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
  commentsCount: number;
  wordCount?: number;
  readingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookItem {
  _id: string;
  title: string;
  slug: string;
  authorId: { _id: string; name: string; email: string; image?: string };
  type: string;
  subtitle?: string;
  description?: string;
  coverImage?: string;
  tags: string[];
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  chapterCount: number;
  subjectPerson?: string;
  birthDate?: string;
  deathDate?: string;
  timelineEnabled?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterItem {
  _id: string;
  bookId: string;
  title: string;
  order: number;
  content: any;
  wordCount: number;
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

export interface CommentItem {
  _id: string;
  contentId: string;
  authorId: { _id: string; name: string; image?: string };
  text: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  type: 'like' | 'comment' | 'follow' | 'reply';
  recipientId: string;
  senderId: { _id: string; name: string; image?: string };
  contentId?: string;
  read: boolean;
  createdAt: string;
}

export interface UserItem {
  _id: string;
  name: string;
  email: string;
  image?: string;
  username?: string;
  bio?: string;
}
