export interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  photoFileName: string;
  username?: string;
  role?: "admin" | "reader" | "author" | "guest";
  isVerified?: boolean;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  dob?: string;
  gender?: string;
  profile?: {
    dob?: string;
    gender?: string;
    bio?: string;
    favoriteGenres?: string[];
  };
  security?: {
    twoFactorEnabled?: boolean;
    lastLogin?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  content: string;
  wordCount?: number;
  releaseDate?: string;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  genre: string;
  chapters: Chapter[];
  rating: number;
  ratingCount: number;
  reviews?: Review[];
  isCustomAI?: boolean;
  language?: string;
  views?: number;
}

export interface Bookmark {
  userId: string;
  bookId: string;
  savedAt: string;
}

export interface SecurityLog {
  id: string;
  action: string;
  timestamp: string;
  device?: string;
  ip?: string;
  status: "Success" | "Failed" | "Blocked";
}

export interface SimulatedEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: string;
  category: "auth" | "security" | "newsletter" | "announcement";
  read: boolean;
}
