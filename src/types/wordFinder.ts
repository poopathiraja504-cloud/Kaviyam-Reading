export type PuzzleDifficulty = "Easy" | "Medium" | "Hard" | "Expert";

export interface WordFinderPuzzle {
  id: string; // e.g. "wf_001"
  number: number; // 1 to 500
  titleTa: string;
  titleEn: string;
  categoryTa: string;
  categoryEn: string;
  categoryIcon: string;
  difficulty: PuzzleDifficulty;
  words: string[]; // Exactly 5 Tamil words
  wordsEn: string[]; // 5 English meanings/names
  hints: string[]; // At least 3 descriptive hints in Tamil
  descriptionTa: string;
  descriptionEn: string;
}

export interface PlacedWord {
  word: string;
  wordEn: string;
  graphemes: string[];
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: [number, number]; // [dRow, dCol]
  cells: [number, number][]; // Array of [row, col]
}

export interface GeneratedGrid {
  grid: string[][]; // 2D array of Tamil graphemes
  size: number;
  placedWords: PlacedWord[];
}

export interface WordFinderAttempt {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  puzzleId: string;
  puzzleNumber: number;
  puzzleTitleTa: string;
  foundWords: string[];
  totalWords: number; // 5
  hintsUsed: number;
  score: number; // Max 100
  timeTaken: number; // Seconds elapsed
  remainingTime: number; // Seconds left of 300
  completedAt: string;
  status: "completed" | "timed_out" | "abandoned";
  difficulty: PuzzleDifficulty;
}

export interface WordFinderProgress {
  userId: string;
  puzzleId: string;
  foundWords: string[];
  hintsUsed: number;
  elapsedSeconds: number;
  remainingSeconds: number;
  score: number;
  lastPlayedAt: string;
}

export interface WordFinderStats {
  totalPuzzles: number; // 500
  completedPuzzles: number;
  totalWordsFound: number;
  totalScore: number;
  bestScore: number;
  averageScore: number;
  hintsUsed: number;
  fastestCompletionSeconds: number | null;
}

export interface WordFinderLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userPhoto?: string;
  puzzlesCompleted: number;
  wordsFound: number;
  totalScore: number;
  bestScore: number;
}
