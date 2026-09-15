import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Clock,
  Sparkles,
  Lightbulb,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Award,
  AlertCircle,
  HelpCircle,
  Eye,
  ChevronRight,
  Flame,
  Star,
  Zap,
  Volume2,
  VolumeX,
  Send,
  Keyboard,
  X,
} from "lucide-react";
import { WordFinderPuzzle } from "../../types/wordFinder";
import { User } from "../../types";
import { Language } from "../../utils/i18n";
import { generateGridFromPuzzle, GeneratedGrid } from "../../utils/tamilWordFinder";
import {
  savePuzzleAttempt,
  savePuzzleProgress,
  getPuzzleProgress,
} from "../../services/wordFinderService";
import { WordFinderAttempt, WordFinderProgress } from "../../types/wordFinder";
import { playSound } from "../../utils/wordFinderAudio";

interface WordFinderGameProps {
  puzzle: WordFinderPuzzle;
  currentUser: User | null;
  lang: Language;
  onBack: () => void;
  onNextPuzzle?: () => void;
  onLevelUp?: (newLevel: number, levelName: string) => void;
}

// Color palettes for highlighting found words
const FOUND_PALETTES = [
  { bg: "bg-emerald-500/25", border: "border-emerald-500", text: "text-emerald-950 font-bold", chipBg: "bg-emerald-50 border-emerald-300 text-emerald-800" },
  { bg: "bg-amber-500/25", border: "border-amber-500", text: "text-amber-950 font-bold", chipBg: "bg-amber-50 border-amber-300 text-amber-800" },
  { bg: "bg-sky-500/25", border: "border-sky-500", text: "text-sky-950 font-bold", chipBg: "bg-sky-50 border-sky-300 text-sky-800" },
  { bg: "bg-rose-500/25", border: "border-rose-500", text: "text-rose-950 font-bold", chipBg: "bg-rose-50 border-rose-300 text-rose-800" },
  { bg: "bg-purple-500/25", border: "border-purple-500", text: "text-purple-950 font-bold", chipBg: "bg-purple-50 border-purple-300 text-purple-800" },
];

export default function WordFinderGame({
  puzzle,
  currentUser,
  lang,
  onBack,
  onNextPuzzle,
  onLevelUp,
}: WordFinderGameProps) {
  // Generate letter grid based on puzzle seed
  const generatedGrid: GeneratedGrid = useMemo(() => {
    return generateGridFromPuzzle(puzzle);
  }, [puzzle]);

  // Normalized target words with English names and hints
  const targetWords = useMemo(() => {
    return puzzle.words.map((w, idx) => ({
      tamil: w,
      english: puzzle.wordsEn?.[idx] || w,
      hint: puzzle.hints?.[idx] || puzzle.descriptionTa,
    }));
  }, [puzzle]);

  const MAX_HINTS = 5;

  // Game state
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes = 300 seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundWordCells, setFoundWordCells] = useState<{ [word: string]: [number, number][] }>({});
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [activeHint, setActiveHint] = useState<{ word: string; clue: string; startCell?: [number, number] } | null>(null);
  const [selectedCells, setSelectedCells] = useState<[number, number][]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartCell, setDragStartCell] = useState<[number, number] | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Direct word answer input box state
  const [inputAnswer, setInputAnswer] = useState<string>("");
  const [inputFeedback, setInputFeedback] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Result dialog state
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [isTimeOut, setIsTimeOut] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(0);
  const [completionMessage, setCompletionMessage] = useState<string>("");

  const gridRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load in-progress saved state on initial mount
  useEffect(() => {
    if (!currentUser) return;
    getPuzzleProgress(currentUser.id, puzzle.id).then((progress) => {
      if (progress) {
        const loadedWords = progress.foundWords || [];
        setFoundWords(loadedWords);
        setHintsUsed(progress.hintsUsed || 0);
        if (progress.remainingSeconds > 0) {
          setTimeLeft(progress.remainingSeconds);
        }
        // Also restore highlighted cells on grid for found words
        if (loadedWords.length > 0) {
          const cellsMap: { [word: string]: [number, number][] } = {};
          loadedWords.forEach((w) => {
            const placement = generatedGrid.placedWords.find((p) => p.word === w);
            if (placement) {
              cellsMap[w] = placement.cells;
            }
          });
          setFoundWordCells(cellsMap);
        }
      }
    }).catch(() => {});
  }, [puzzle.id, currentUser, generatedGrid]);

  // 5-minute Countdown Timer
  useEffect(() => {
    if (!isTimerRunning || isGameCompleted || isTimeOut) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isGameCompleted, isTimeOut]);

  // Periodic progress saving (every 5 seconds)
  useEffect(() => {
    if (!currentUser || isGameCompleted || isTimeOut) return;
    const saveInterval = setInterval(() => {
      savePuzzleProgress(currentUser.id, {
        userId: currentUser.id,
        puzzleId: puzzle.id,
        foundWords,
        hintsUsed,
        elapsedSeconds: 300 - timeLeft,
        remainingSeconds: timeLeft,
        score: Math.max(10, foundWords.length * 20 - hintsUsed * 5),
        lastPlayedAt: new Date().toISOString(),
      });
    }, 5000);

    return () => clearInterval(saveInterval);
  }, [puzzle.id, currentUser, foundWords, hintsUsed, timeLeft, isGameCompleted, isTimeOut]);

  // Format time MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [timeLeft]);

  // Formed word from currently selected cells
  const currentFormedWord = useMemo(() => {
    return selectedCells
      .map(([r, c]) => generatedGrid.grid[r]?.[c] || "")
      .join("");
  }, [selectedCells, generatedGrid]);

  // Check if cell is in selectedCells
  const isCellSelected = useCallback(
    (row: number, col: number) => {
      return selectedCells.some(([r, c]) => r === row && c === col);
    },
    [selectedCells]
  );

  // Check if cell is in any found word
  const getCellFoundInfo = useCallback(
    (row: number, col: number) => {
      for (let i = 0; i < targetWords.length; i++) {
        const word = targetWords[i].tamil;
        const cells = foundWordCells[word];
        if (cells && cells.some(([r, c]) => r === row && c === col)) {
          return {
            isFound: true,
            palette: FOUND_PALETTES[i % FOUND_PALETTES.length],
            word,
          };
        }
      }
      return null;
    },
    [foundWordCells, targetWords]
  );

  // Helper to determine straight line cells between start and end
  const getLineCells = (
    start: [number, number],
    end: [number, number]
  ): [number, number][] => {
    const dRow = end[0] - start[0];
    const dCol = end[1] - start[1];
    const absRow = Math.abs(dRow);
    const absCol = Math.abs(dCol);

    if (dRow === 0 && dCol === 0) {
      return [start];
    }
    if (dRow === 0) {
      // Horizontal
      const step = dCol > 0 ? 1 : -1;
      const cells: [number, number][] = [];
      for (let c = start[1]; step > 0 ? c <= end[1] : c >= end[1]; c += step) {
        cells.push([start[0], c]);
      }
      return cells;
    }
    if (dCol === 0) {
      // Vertical
      const step = dRow > 0 ? 1 : -1;
      const cells: [number, number][] = [];
      for (let r = start[0]; step > 0 ? r <= end[0] : r >= end[0]; r += step) {
        cells.push([r, start[1]]);
      }
      return cells;
    }
    if (absRow === absCol) {
      // Diagonal
      const rStep = dRow > 0 ? 1 : -1;
      const cStep = dCol > 0 ? 1 : -1;
      const cells: [number, number][] = [];
      let r = start[0];
      let c = start[1];
      while (rStep > 0 ? r <= end[0] : r >= end[0]) {
        cells.push([r, c]);
        r += rStep;
        c += cStep;
      }
      return cells;
    }

    return [start];
  };

  // Selection start
  const handleCellPointerDown = (row: number, col: number) => {
    if (isGameCompleted || isTimeOut) return;
    setIsDragging(true);
    setDragStartCell([row, col]);
    setSelectedCells([[row, col]]);
    if (soundEnabled) playSound.letterTap();
  };

  // Selection move
  const handleCellPointerEnter = (row: number, col: number) => {
    if (!isDragging || !dragStartCell) return;
    const line = getLineCells(dragStartCell, [row, col]);
    setSelectedCells(line);
    if (soundEnabled && line.length > selectedCells.length) {
      playSound.letterTap();
    }
  };

  // Selection end / Word verification
  const handlePointerUpOrLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStartCell(null);

    if (selectedCells.length <= 1) {
      setSelectedCells([]);
      return;
    }

    // Evaluate formed word (both forward and backward reading)
    const forwardWord = selectedCells
      .map(([r, c]) => generatedGrid.grid[r]?.[c] || "")
      .join("");
    const backwardWord = [...selectedCells]
      .reverse()
      .map(([r, c]) => generatedGrid.grid[r]?.[c] || "")
      .join("");

    const matchedTarget = targetWords.find(
      (w) => w.tamil === forwardWord || w.tamil === backwardWord
    );

    if (matchedTarget && !foundWords.includes(matchedTarget.tamil)) {
      // Success! Word found!
      if (soundEnabled) playSound.wordFound();
      const newFoundWords = [...foundWords, matchedTarget.tamil];
      const newFoundCells = {
        ...foundWordCells,
        [matchedTarget.tamil]: [...selectedCells],
      };

      setFoundWords(newFoundWords);
      setFoundWordCells(newFoundCells);
      setSelectedCells([]);
      setActiveHint(null);

      // Check for complete puzzle win!
      if (newFoundWords.length === targetWords.length) {
        handlePuzzleComplete(newFoundWords, newFoundCells);
      }
    } else {
      // Invalid selection
      if (soundEnabled) playSound.invalidWord();
      setSelectedCells([]);
    }
  };

  // Handle successful completion
  const handlePuzzleComplete = async (
    allFoundWords: string[],
    allFoundCells: { [word: string]: [number, number][] }
  ) => {
    setIsTimerRunning(false);
    setIsGameCompleted(true);
    if (soundEnabled) playSound.victory();

    const timeTaken = 300 - timeLeft;
    // Score calculation
    let score = 100 - hintsUsed * 5;
    if (timeTaken < 120) score += 5; // Fast completion bonus
    score = Math.max(25, Math.min(100, score));
    setFinalScore(score);

    // Save attempt to service & Firestore
    if (currentUser) {
      try {
        const attempt: WordFinderAttempt = {
          id: `wfa_${Date.now()}_${puzzle.id}`,
          userId: currentUser.id,
          userName: currentUser.name || currentUser.username || "வாசகர்",
          userPhoto: currentUser.photoFileName || currentUser.avatarUrl,
          puzzleId: puzzle.id,
          puzzleNumber: puzzle.number,
          puzzleTitleTa: puzzle.titleTa,
          foundWords: allFoundWords,
          totalWords: targetWords.length,
          hintsUsed,
          score,
          timeTaken,
          remainingTime: timeLeft,
          completedAt: new Date().toISOString(),
          status: "completed",
          difficulty: puzzle.difficulty,
        };

        const res = await savePuzzleAttempt(currentUser, attempt, (newLvl, name) => {
          if (onLevelUp) onLevelUp(newLvl, name);
        });

        setEarnedXp(res.xpAwarded);
      } catch (err) {
        console.error("Error saving puzzle attempt:", err);
      }
    }

    setCompletionMessage(
      lang === "ta"
        ? `அருமை! நீங்கள் அனைத்து 5 சொற்களையும் ${Math.floor(timeTaken / 60)} நிமிடம் ${timeTaken % 60} வினாடிகளில் கண்டறிந்துவிட்டீர்கள்!`
        : `Magnificent! You discovered all 5 words in ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s!`
    );
  };

  // Handle timeout (300 seconds elapsed)
  const handleTimeOut = async () => {
    setIsTimerRunning(false);
    setIsTimeOut(true);
    const timeTaken = 300;
    const score = Math.max(10, foundWords.length * 15 - hintsUsed * 5);
    setFinalScore(score);

    if (currentUser) {
      try {
        const attempt: WordFinderAttempt = {
          id: `wfa_${Date.now()}_${puzzle.id}`,
          userId: currentUser.id,
          userName: currentUser.name || currentUser.username || "வாசகர்",
          userPhoto: currentUser.photoFileName || currentUser.avatarUrl,
          puzzleId: puzzle.id,
          puzzleNumber: puzzle.number,
          puzzleTitleTa: puzzle.titleTa,
          foundWords,
          totalWords: targetWords.length,
          hintsUsed,
          score,
          timeTaken,
          remainingTime: 0,
          completedAt: new Date().toISOString(),
          status: "timed_out",
          difficulty: puzzle.difficulty,
        };

        const res = await savePuzzleAttempt(currentUser, attempt);
        setEarnedXp(res.xpAwarded);
      } catch (err) {
        console.error("Error saving timeout attempt:", err);
      }
    }
  };

  // Handle direct answer submission via Answer Input Box
  const handleAnswerSubmit = (wordToVerify?: string) => {
    if (isGameCompleted || isTimeOut) return;

    const rawInput = (wordToVerify ?? inputAnswer).trim();
    if (!rawInput) return;

    // Clean and normalize input (remove spaces, punctuation, lowercase for phonetic/English comparison)
    const normalizedInput = rawInput.toLowerCase().replace(/[\s\-_.,/]/g, "");

    // Look for match in targetWords
    const matchedTarget = targetWords.find((tw) => {
      const tamilClean = tw.tamil.trim().toLowerCase().replace(/[\s\-_.,/]/g, "");
      const englishClean = tw.english.trim().toLowerCase().replace(/[\s\-_.,/]/g, "");

      if (tamilClean === normalizedInput || englishClean === normalizedInput) {
        return true;
      }

      // Transliteration helper for common Tamil district/place/general names
      const knownAliases: Record<string, string[]> = {
        "சென்னை": ["chennai", "madras"],
        "மதுரை": ["madurai", "madura"],
        "கோவை": ["kovai", "coimbatore"],
        "திருச்சி": ["trichy", "tiruchi", "tiruchirappalli"],
        "சேலம்": ["salem"],
        "தஞ்சை": ["thanjai", "thanjavur"],
        "நெல்லை": ["nellai", "tirunelveli"],
        "ஈரோடு": ["erode"],
        "வேலூர்": ["vellore"],
        "கரூர்": ["karur"],
      };

      if (knownAliases[tw.tamil]?.includes(normalizedInput)) {
        return true;
      }

      return false;
    });

    if (!matchedTarget) {
      if (soundEnabled) playSound.invalidWord();
      setInputFeedback({
        type: "error",
        message:
          lang === "ta"
            ? `❌ '${rawInput}' தவறான விடை. பட்டியலில் உள்ள சொல்லை உள்ளிடவும்.`
            : `❌ '${rawInput}' is not in the target list. Try again.`,
      });
      setTimeout(() => setInputFeedback(null), 3500);
      return;
    }

    // Check if already found
    if (foundWords.includes(matchedTarget.tamil)) {
      if (soundEnabled) playSound.invalidWord();
      setInputFeedback({
        type: "warning",
        message:
          lang === "ta"
            ? `⚠️ '${matchedTarget.tamil}' ஏற்கனவே கண்டுபிடிக்கப்பட்டுவிட்டது!`
            : `⚠️ '${matchedTarget.tamil}' (${matchedTarget.english}) is already found!`,
      });
      setTimeout(() => setInputFeedback(null), 3000);
      setInputAnswer("");
      return;
    }

    // New valid word found!
    if (soundEnabled) playSound.wordFound();

    const placement = generatedGrid.placedWords.find(
      (p) => p.word === matchedTarget.tamil
    );
    const cells: [number, number][] = placement ? placement.cells : [];

    const newFoundWords = [...foundWords, matchedTarget.tamil];
    const newFoundCells = {
      ...foundWordCells,
      [matchedTarget.tamil]: cells,
    };

    setFoundWords(newFoundWords);
    setFoundWordCells(newFoundCells);
    setInputAnswer("");
    setSelectedCells([]);
    setActiveHint(null);

    setInputFeedback({
      type: "success",
      message:
        lang === "ta"
          ? `✓ '${matchedTarget.tamil}' (${matchedTarget.english}) சரியாகக் கண்டறியப்பட்டது!`
          : `✓ '${matchedTarget.tamil}' (${matchedTarget.english}) correctly found!`,
    });
    setTimeout(() => setInputFeedback(null), 3500);

    // Check for win
    if (newFoundWords.length === targetWords.length) {
      handlePuzzleComplete(newFoundWords, newFoundCells);
    }
  };

  // Hint button clicked (Max 5 hints)
  const handleUseHint = () => {
    if (hintsUsed >= MAX_HINTS) return;

    // Find first target word not yet found
    const remainingWords = targetWords.filter(
      (w) => !foundWords.includes(w.tamil)
    );
    if (remainingWords.length === 0) return;

    const nextTarget = remainingWords[0];
    const placement = generatedGrid.placedWords.find(
      (p) => p.word === nextTarget.tamil
    );

    const startCell: [number, number] | undefined = placement
      ? [placement.startRow, placement.startCol]
      : undefined;

    setHintsUsed((prev) => prev + 1);
    setActiveHint({
      word: nextTarget.tamil,
      clue: `${nextTarget.hint} (${nextTarget.english})`,
      startCell,
    });

    if (soundEnabled) playSound.hint();
  };

  // Replay puzzle
  const handleReplay = () => {
    setTimeLeft(300);
    setIsTimerRunning(true);
    setFoundWords([]);
    setFoundWordCells({});
    setHintsUsed(0);
    setActiveHint(null);
    setSelectedCells([]);
    setInputAnswer("");
    setInputFeedback(null);
    setIsGameCompleted(false);
    setIsTimeOut(false);
    setFinalScore(0);
    setEarnedXp(0);
  };

  return (
    <div
      className="max-w-4xl mx-auto space-y-4 font-sans select-none pb-12"
      onPointerUp={handlePointerUpOrLeave}
      onMouseUp={handlePointerUpOrLeave}
    >
      {/* HEADER BAR */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-[#E2DDD5] shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-stone-600 hover:text-[#5C121E] hover:bg-amber-50 border border-stone-200 transition-all cursor-pointer"
            title={lang === "ta" ? "புதிர்கள் பட்டியலுக்குத் திரும்பு" : "Back to Puzzles"}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#5C121E]/10 text-[#5C121E]">
                #{String(puzzle.number).padStart(3, "0")}
              </span>
              <span className="text-xs font-bold text-stone-500">
                {lang === "ta" ? puzzle.categoryTa : puzzle.categoryEn}
              </span>
            </div>
            <h1 className="font-serif font-extrabold text-base sm:text-lg text-[#3B0B12] leading-tight mt-0.5">
              {lang === "ta" ? puzzle.titleTa : puzzle.titleEn}
            </h1>
          </div>
        </div>

        {/* CONTROLS: Timer, Hints, Sound */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-all cursor-pointer"
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>

          {/* 5-Minute Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              timeLeft <= 60
                ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                : "bg-amber-50/70 border-amber-200 text-amber-900"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${timeLeft <= 60 ? "text-rose-600" : "text-amber-700"}`} />
            <span className="font-mono text-sm tracking-wider">{formattedTime}</span>
          </div>

          {/* Hint Button (Max 5) */}
          <button
            onClick={handleUseHint}
            disabled={hintsUsed >= MAX_HINTS || isGameCompleted || isTimeOut}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              hintsUsed >= MAX_HINTS
                ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                : "bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 shadow-xs"
            }`}
            title={
              hintsUsed >= MAX_HINTS
                ? "அனைத்து 5 உதவிகளும் பயன்படுத்தப்பட்டுவிட்டன"
                : `உதவி பெறு (-5 புள்ளிகள்). மீதம்: ${MAX_HINTS - hintsUsed}`
            }
          >
            <Lightbulb className={`w-3.5 h-3.5 ${hintsUsed < MAX_HINTS ? "text-amber-600" : "text-stone-400"}`} />
            <span>{lang === "ta" ? "உதவி" : "Hint"}</span>
            <span className="bg-amber-200/80 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
              {MAX_HINTS - hintsUsed}
            </span>
          </button>
        </div>
      </div>

      {/* ACTIVE HINT NOTIFICATION BANNER */}
      {activeHint && (
        <div className="flex items-start justify-between gap-3 p-3 bg-amber-50 border border-amber-300/80 rounded-xl text-xs text-amber-950 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-900">
                {lang === "ta" ? "குறிப்பு:" : "Clue:"}{" "}
              </span>
              <span>{activeHint.clue}</span>
              {activeHint.startCell && (
                <span className="block mt-0.5 text-[11px] text-amber-800 font-medium">
                  {lang === "ta"
                    ? `முதல் எழுத்து அமைவிடம்: வரிசை ${activeHint.startCell[0] + 1}, நெடுவரிசை ${activeHint.startCell[1] + 1}`
                    : `Starting letter at: Row ${activeHint.startCell[0] + 1}, Col ${activeHint.startCell[1] + 1}`}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setActiveHint(null)}
            className="text-amber-700 hover:text-amber-950 font-bold px-1.5 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* TARGET WORDS TO FIND (5 Words) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E2DDD5] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {lang === "ta" ? "கண்டுபிடிக்க வேண்டிய 5 சொற்கள்" : "5 Words to Find"}
          </span>
          <span className="text-xs font-bold text-amber-800 font-mono">
            {foundWords.length} / {targetWords.length}{" "}
            {lang === "ta" ? "கண்டுபிடிக்கப்பட்டது" : "Found"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {targetWords.map((tw, idx) => {
            const isFound = foundWords.includes(tw.tamil);
            const palette = FOUND_PALETTES[idx % FOUND_PALETTES.length];

            return (
              <div
                key={tw.tamil}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isFound
                    ? `${palette.chipBg} shadow-xs font-bold scale-[0.98]`
                    : "bg-stone-50/80 border-stone-200/80 text-stone-700"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {isFound && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  <span className={`text-xs sm:text-sm font-serif font-bold ${isFound ? "line-through opacity-80" : ""}`}>
                    {tw.tamil}
                  </span>
                </div>
                <div className="text-[10px] text-stone-500 font-sans truncate mt-0.5">
                  {tw.english}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CURRENT SELECTION PREVIEW (Floating pill) */}
      <div className="h-6 flex items-center justify-center">
        {currentFormedWord ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#5C121E] text-amber-100 text-xs font-bold font-serif shadow-md animate-in fade-in">
            <span>{currentFormedWord}</span>
          </div>
        ) : (
          <span className="text-[11px] text-stone-400 font-medium">
            {lang === "ta"
              ? "எழுத்துக்களை தொடர்ச்சியாக தொட்டு/இழுத்து சொல்லை உருவாக்குக"
              : "Drag or tap letters in a straight line to form a word"}
          </span>
        )}
      </div>

      {/* LETTER GRID BOARD */}
      <div className="bg-[#FDFBF7] p-2.5 sm:p-5 rounded-3xl border border-[#E2DDD5] shadow-sm max-w-xl mx-auto touch-none">
        <div
          ref={gridRef}
          className="grid gap-1.5 sm:gap-2 justify-center mx-auto"
          style={{
            gridTemplateColumns: `repeat(${generatedGrid.size}, minmax(0, 1fr))`,
          }}
        >
          {generatedGrid.grid.map((row, rIdx) =>
            row.map((grapheme, cIdx) => {
              const isSelected = isCellSelected(rIdx, cIdx);
              const foundInfo = getCellFoundInfo(rIdx, cIdx);
              const isHintStart =
                activeHint?.startCell?.[0] === rIdx &&
                activeHint?.startCell?.[1] === cIdx;

              let cellStyle = "bg-white border-stone-200 text-stone-800 hover:border-amber-400 hover:bg-amber-50/50";

              if (isSelected) {
                cellStyle = "bg-[#5C121E] border-[#5C121E] text-white font-bold scale-105 shadow-sm";
              } else if (foundInfo) {
                cellStyle = `${foundInfo.palette.bg} ${foundInfo.palette.border} ${foundInfo.palette.text}`;
              } else if (isHintStart) {
                cellStyle = "bg-amber-200 border-amber-500 text-amber-950 animate-pulse font-extrabold ring-2 ring-amber-400";
              }

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleCellPointerDown(rIdx, cIdx);
                  }}
                  onPointerEnter={(e) => {
                    e.preventDefault();
                    handleCellPointerEnter(rIdx, cIdx);
                  }}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border text-sm sm:text-base font-serif font-bold transition-transform select-none flex items-center justify-center cursor-pointer shadow-xs ${cellStyle}`}
                  style={{ userSelect: "none", touchAction: "none" }}
                >
                  {grapheme}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* GAME COMPLETED VICTORY MODAL */}
      {isGameCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#D4AF37] max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center shadow-md text-amber-700">
              <Trophy className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                {lang === "ta" ? "வெற்றி விழா!" : "Victory!"}
              </span>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#3B0B12]">
                {lang === "ta" ? "புதிர் நிறைவடைந்தது!" : "Puzzle Completed!"}
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed px-2">
                {completionMessage}
              </p>
            </div>

            {/* Score & Stats breakdown */}
            <div className="grid grid-cols-3 gap-2 bg-[#FDFBF7] p-3 rounded-2xl border border-[#E2DDD5]">
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block">
                  {lang === "ta" ? "மதிப்பெண்" : "Score"}
                </span>
                <span className="text-lg font-serif font-bold text-[#5C121E]">
                  {finalScore}/100
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block">
                  {lang === "ta" ? "நேரம்" : "Time Taken"}
                </span>
                <span className="text-lg font-serif font-bold text-stone-800">
                  {300 - timeLeft}s
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold uppercase block">
                  XP
                </span>
                <span className="text-lg font-serif font-bold text-amber-600 flex items-center justify-center gap-0.5">
                  <Zap className="w-3.5 h-3.5" />
                  +{earnedXp || finalScore}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {onNextPuzzle && (
                <button
                  onClick={onNextPuzzle}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#5C121E] hover:bg-[#3B0B12] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{lang === "ta" ? "அடுத்த புதிர்" : "Next Puzzle"}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleReplay}
                className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? "மீண்டும்" : "Replay"}</span>
              </button>
              <button
                onClick={onBack}
                className="py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs transition-all cursor-pointer"
              >
                <span>{lang === "ta" ? "பட்டியல்" : "Catalog"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TIMEOUT MODAL */}
      {isTimeOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-rose-300 max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-100 border border-rose-300 mx-auto flex items-center justify-center shadow-md text-rose-700">
              <Clock className="w-8 h-8 text-rose-600" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif font-black text-2xl text-[#3B0B12]">
                {lang === "ta" ? "நேரம் முடிந்துவிட்டது!" : "Time's Up!"}
              </h2>
              <p className="text-xs text-stone-600">
                {lang === "ta"
                  ? `5 நிமிடங்கள் நிறைவடைந்தன. நீங்கள் 5 இல் ${foundWords.length} சொற்களைக் கண்டறிந்தீர்கள்.`
                  : `5 minutes elapsed. You found ${foundWords.length} of 5 words.`}
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={handleReplay}
                className="py-2.5 px-5 rounded-xl bg-[#5C121E] hover:bg-[#3B0B12] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{lang === "ta" ? "மீண்டும் முயற்சி செய்" : "Try Again"}</span>
              </button>
              <button
                onClick={onBack}
                className="py-2.5 px-5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs transition-all cursor-pointer"
              >
                <span>{lang === "ta" ? "புதிர்கள் பட்டியல்" : "Back to Catalog"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
