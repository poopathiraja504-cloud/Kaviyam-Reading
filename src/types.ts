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
  totalXP?: number;
  totalXp?: number;
  levelUpAlert?: {
    level: number;
    levelNameTa: string;
    xp: number;
  };
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

// Quiz System Interfaces
export interface QuizQuestion {
  questionId: string;
  quizId: string;
  question: string;
  questionTa?: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  optionsTa?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  explanationTa?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  marks: number;
}

export interface QuizSet {
  quizId: string;
  title: string;
  titleTa?: string;
  description: string;
  descriptionTa?: string;
  category: string;
  categoryTa?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  totalQuestions: number;
  marksPerQuestion: number;
  totalMarks: number;
  timeLimit: number; // in seconds (e.g. 600)
  associatedBookId?: string;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  title?: string;
  userId: string;
  username: string;
  answers: Record<string, "A" | "B" | "C" | "D">;
  score: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  timeUsed: number;
  startedAt: string;
  completedAt: string;
  status: "Completed" | "Failed" | "In-Progress";
}

export interface QuizUserStats {
  quizzesTaken: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  averageScore: number;
  highestScore: number;
  completionRate: number;
  quizStreak: number;
  totalXp: number;
}

export interface QuizAchievement {
  id: string;
  title: string;
  titleTa?: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}
