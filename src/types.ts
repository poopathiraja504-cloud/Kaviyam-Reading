export interface UserProfile {
  username: string;
  bio: string;
  profilePhoto: string;
  phoneNumber?: string;
  dob?: string;
  gender?: string;
  privacy: {
    publicBookshelf: boolean;
    showActivity: boolean;
  };
}

export interface User {
  id: string;
  uid?: string;
  name?: string;
  email: string;
  username: string;
  avatarUrl?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  isVerified: boolean;
  role?: string;
  photoFileName?: string;
  bio?: string;
  updatedAt?: string;
  profile?: UserProfile;
  security?: {
    is2FAEnabled: boolean;
    isBlocked: boolean;
    loginAttempts: number;
    lockedUntil?: string;
  };
  createdAt: string;
}

export interface Chapter {
  id?: string;
  number?: number;
  chapterNumber?: number;
  title?: string;
  chapterTitle?: string;
  content: string;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  userPhoto: string;
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
  reviews: Review[];
  isCustomAI?: boolean;
}

export interface SecurityLog {
  id: string;
  action: string;
  timestamp: string;
  device: string;
  ip: string;
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

export interface ProjectLink {
  id: string;
  title: string;
  titleTa?: string;
  url: string;
  category: string;
  description?: string;
  descriptionTa?: string;
  tags?: string[];
  addedBy?: string;
  createdAt?: string;
  uploadedAt?: string;
  isSystem?: boolean;
  isVerified?: boolean;
}

export interface TemplateItem {
  id: string;
  title?: string;
  name?: string;
  nameTa?: string;
  titleTa?: string;
  category: string;
  previewUrl?: string;
  previewImage?: string;
  description: string;
  descriptionTa?: string;
  themeClass?: string;
  bgColor?: string;
  accentColor?: string;
  isPopular?: boolean;
  likes?: number;
}

export interface WallpaperItem {
  id: string;
  title: string;
  titleTa?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  category: string;
  resolution?: string;
  downloads: number;
}

export interface AppNotification {
  id: string;
  title: string;
  titleTa?: string;
  message: string;
  messageTa?: string;
  timestamp?: string;
  time?: string;
  read: boolean;
  category?: string;
  type?: "info" | "warning" | "success";
}
