export interface UserProfile {
  username: string;
  bio: string;
  profilePhoto: string;
  phoneNumber?: string;
  dob: string;
  gender: string;
  privacy: {
    publicBookshelf: boolean;
    showActivity: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  profile: UserProfile;
  security: {
    is2FAEnabled: boolean;
    isBlocked: boolean;
    loginAttempts: number;
    lockedUntil?: string;
  };
  createdAt: string;
}

export interface Chapter {
  chapterNumber: number;
  chapterTitle: string;
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
  action: string; // e.g. "Login", "Sign Up", "Password Reset", "Change Email"
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
