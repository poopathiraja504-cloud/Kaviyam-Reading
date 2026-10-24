export interface WordFinderPuzzle {
  id: string;
  number: number;
  title: string;
  titleTa: string;
  titleEn?: string;
  category: string;
  categoryTa?: string;
  categoryEn?: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  gridSize: number;
  words: string[];
  wordsEn?: string[];
  hints?: string[];
  descriptionTa?: string;
  descriptionEn?: string;
  timeLimit?: number;
}

export interface WordPlacement {
  word: string;
  wordEn?: string;
  positions: [number, number][];
  startRow?: number;
  startCol?: number;
  endRow?: number;
  endCol?: number;
  direction?: string;
}

export interface WordFinderAttempt {
  id: string;
  puzzleId: string;
  puzzleNumber?: number;
  puzzleTitleTa?: string;
  title?: string;
  titleTa?: string;
  userId: string;
  username?: string;
  userName?: string;
  userPhoto?: string;
  status: "completed" | "timed_out" | "abandoned";
  wordsFound?: number;
  totalWords?: number;
  foundWords?: string[];
  timeTakenSeconds?: number;
  timeTaken?: number;
  durationSeconds?: number;
  remainingTime?: number;
  hintsUsed: number;
  score: number;
  percentage?: number;
  difficulty: string;
  completedAt: string;
  certificateId?: string;
}

export interface WordFinderProgress {
  userId: string;
  puzzleId: string;
  foundWords: string[];
  hintsUsed: number;
  timeLeft?: number;
  remainingSeconds?: number;
  elapsedSeconds?: number;
  score?: number;
  lastPlayedAt?: string;
  updatedAt?: string;
}

export interface WordFinderStats {
  totalPlayed: number;
  totalCompleted: number;
  totalWordsFound: number;
  totalTimeSpentSeconds: number;
  averageTimeSeconds: number;
  perfectCompletions: number;
  hintsUsed: number;
  streak: number;
}

export interface WordFinderLeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  puzzlesCompleted: number;
  totalScore: number;
  fastestTimeSeconds: number;
  rank: number;
}
