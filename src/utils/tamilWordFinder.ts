import { WordFinderPuzzle, GeneratedGrid, PlacedWord } from "../types/wordFinder";

/**
 * Splits a Tamil string into authentic grapheme clusters.
 * Example: "இந்தியா" -> ["இ", "ந்", "தி", "யா"]
 */
export function splitTamilGraphemes(text: string): string[] {
  if (!text) return [];
  const trimmed = text.trim();
  
  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    try {
      const segmenter = new (Intl as any).Segmenter("ta", { granularity: "grapheme" });
      const segments = segmenter.segment(trimmed);
      return Array.from(segments, (s: any) => s.segment);
    } catch (_) {
      // Fallback below
    }
  }

  // Regex matching base consonant/vowel followed by combining vowel marks, virama (pulli), or length marks
  const tamilRegex = /([\u0B85-\u0B94\u0B95-\u0BB9\u0BD0][\u0BBE-\u0BCD\u0BD7]*|.)/gu;
  const matches = trimmed.match(tamilRegex);
  return matches ? matches.filter(Boolean) : trimmed.split("");
}

// Common Tamil letters for natural filler in the word grid
export const TAMIL_FILLER_LETTERS: string[] = [
  "அ", "ஆ", "இ", "உ", "எ", "க", "கா", "கி", "கு", "கை", "கொ", "கோ",
  "ச", "சா", "சி", "சு", "சை", "ஞ", "ஞா",
  "த", "தா", "தி", "தீ", "து", "தூ", "தே", "தை",
  "ந", "நா", "நி", "நீ", "நு", "நே", "நை",
  "ப", "பா", "பி", "பீ", "பு", "பூ", "பெ", "பே", "பை",
  "ம", "மா", "மி", "மீ", "மு", "மே", "மை",
  "ய", "யா", "யி", "யு",
  "ர", "ரா", "ரி", "ரு", "ரே",
  "ல", "லா", "லி", "லீ", "லு", "லை",
  "வ", "வா", "வி", "வீ", "வெ", "வை",
  "ழ", "ழா", "ழி", "ழு",
  "ள", "ளா", "ளி", "ளு", "ளை",
  "ற", "றா", "றி", "று",
  "ன", "னா", "னி", "னு", "னை",
  "க்", "ங்", "ச்", "ஞ்", "ட்", "ண்", "த்", "ந்", "ப்", "ம்", "ய்", "ர்", "ல்", "வ்", "ழ்", "ள்", "ற்", "ன்"
];

// Simple seeded PRNG for consistent puzzle grids
class Mulberry32 {
  private s: number;
  constructor(seed: number) {
    this.s = seed;
  }
  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

/**
 * Returns permissible directions based on puzzle difficulty
 */
function getDirectionsForDifficulty(difficulty: string): [number, number][] {
  switch (difficulty) {
    case "Easy":
      // Horizontal right, Vertical down
      return [
        [0, 1], // Right
        [1, 0], // Down
      ];
    case "Medium":
      // Horizontal right, Vertical down, Diagonal down-right, Diagonal down-left
      return [
        [0, 1],  // Right
        [1, 0],  // Down
        [1, 1],  // Diagonal down-right
        [1, -1], // Diagonal down-left
      ];
    case "Hard":
      // Right, Down, Diagonals, plus Reverse Horizontal
      return [
        [0, 1],   // Right
        [0, -1],  // Left (reverse)
        [1, 0],   // Down
        [1, 1],   // Diagonal down-right
        [1, -1],  // Diagonal down-left
        [-1, 1],  // Diagonal up-right
      ];
    case "Expert":
      // All 8 directions
      return [
        [0, 1],   // Right
        [0, -1],  // Left
        [1, 0],   // Down
        [-1, 0],  // Up
        [1, 1],   // Down-Right
        [1, -1],  // Down-Left
        [-1, 1],  // Up-Right
        [-1, -1], // Up-Left
      ];
    default:
      return [
        [0, 1],
        [1, 0],
        [1, 1],
      ];
  }
}

/**
 * Determines grid size based on difficulty and longest word
 */
function getRecommendedGridSize(words: string[], difficulty: string): number {
  let maxWordLength = 0;
  for (const w of words) {
    const len = splitTamilGraphemes(w).length;
    if (len > maxWordLength) maxWordLength = len;
  }

  let baseSize = 8;
  if (difficulty === "Easy") baseSize = 8;
  else if (difficulty === "Medium") baseSize = 9;
  else if (difficulty === "Hard") baseSize = 10;
  else if (difficulty === "Expert") baseSize = 11;

  return Math.max(baseSize, maxWordLength + 1);
}

/**
 * Generates an authentic word finder grid with all 5 words placed.
 */
export function generateWordGrid(puzzle: WordFinderPuzzle): GeneratedGrid {
  const seed = puzzle.number * 7919 + 104729;
  const rng = new Mulberry32(seed);

  let gridSize = getRecommendedGridSize(puzzle.words, puzzle.difficulty);
  const allowedDirections = getDirectionsForDifficulty(puzzle.difficulty);

  // Attempt generation; if placement of all 5 words fails, increase grid size and retry
  for (let attempt = 0; attempt < 5; attempt++) {
    const grid: (string | null)[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(null)
    );
    const placedWords: PlacedWord[] = [];
    let allPlaced = true;

    // Process longer words first for cleaner placement
    const wordEntries = puzzle.words.map((w, idx) => ({
      word: w,
      wordEn: puzzle.wordsEn[idx] || w,
      graphemes: splitTamilGraphemes(w),
    })).sort((a, b) => b.graphemes.length - a.graphemes.length);

    for (const entry of wordEntries) {
      const gList = entry.graphemes;
      const gLen = gList.length;
      let placed = false;

      // Try random positions and directions
      const shuffledDirections = rng.shuffle(allowedDirections);
      const possiblePositions: [number, number][] = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          possiblePositions.push([r, c]);
        }
      }
      const shuffledPositions = rng.shuffle(possiblePositions);

      for (const [r, c] of shuffledPositions) {
        if (placed) break;

        for (const [dRow, dCol] of shuffledDirections) {
          const endRow = r + dRow * (gLen - 1);
          const endCol = c + dCol * (gLen - 1);

          // Boundary check
          if (endRow < 0 || endRow >= gridSize || endCol < 0 || endCol >= gridSize) {
            continue;
          }

          // Collision check: cell must be empty or contain identical grapheme
          let canPlace = true;
          for (let step = 0; step < gLen; step++) {
            const checkR = r + dRow * step;
            const checkC = c + dCol * step;
            const currentCell = grid[checkR][checkC];
            if (currentCell !== null && currentCell !== gList[step]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            const cells: [number, number][] = [];
            for (let step = 0; step < gLen; step++) {
              const placeR = r + dRow * step;
              const placeC = c + dCol * step;
              grid[placeR][placeC] = gList[step];
              cells.push([placeR, placeC]);
            }

            placedWords.push({
              word: entry.word,
              wordEn: entry.wordEn,
              graphemes: gList,
              startRow: r,
              startCol: c,
              endRow,
              endCol,
              direction: [dRow, dCol],
              cells,
            });

            placed = true;
            break;
          }
        }
      }

      if (!placed) {
        allPlaced = false;
        break;
      }
    }

    if (allPlaced) {
      // Fill remaining null cells with high-frequency Tamil letters
      const finalGrid: string[][] = grid.map((row) =>
        row.map((cell) => (cell !== null ? cell : rng.pick(TAMIL_FILLER_LETTERS)))
      );

      return {
        grid: finalGrid,
        size: gridSize,
        placedWords,
      };
    }

    // Expand size slightly if needed
    gridSize += 1;
  }

  // Guaranteed fallback: create grid with direct placement
  const fallbackGrid: string[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => rng.pick(TAMIL_FILLER_LETTERS))
  );
  const fallbackPlaced: PlacedWord[] = [];

  puzzle.words.forEach((w, idx) => {
    const gList = splitTamilGraphemes(w);
    const r = Math.min(idx * 2, gridSize - 1);
    const maxCol = Math.max(0, gridSize - gList.length);
    const c = Math.min(idx, maxCol);

    const cells: [number, number][] = [];
    for (let i = 0; i < gList.length; i++) {
      if (c + i < gridSize) {
        fallbackGrid[r][c + i] = gList[i];
        cells.push([r, c + i]);
      }
    }
    fallbackPlaced.push({
      word: w,
      wordEn: puzzle.wordsEn[idx] || w,
      graphemes: gList,
      startRow: r,
      startCol: c,
      endRow: r,
      endCol: c + gList.length - 1,
      direction: [0, 1],
      cells,
    });
  });

  return {
    grid: fallbackGrid,
    size: gridSize,
    placedWords: fallbackPlaced,
  };
}

/**
 * Calculates straight line cells between a start cell and an end cell.
 * Returns null if the cells do not form a valid straight line (horizontal, vertical, or diagonal).
 */
export function getLineCells(
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): [number, number][] | null {
  const dRow = endRow - startRow;
  const dCol = endCol - startCol;

  const stepRow = dRow === 0 ? 0 : dRow > 0 ? 1 : -1;
  const stepCol = dCol === 0 ? 0 : dCol > 0 ? 1 : -1;

  const absRow = Math.abs(dRow);
  const absCol = Math.abs(dCol);

  // Must be horizontal, vertical, or 45-degree diagonal
  if (absRow !== 0 && absCol !== 0 && absRow !== absCol) {
    return null;
  }

  const length = Math.max(absRow, absCol) + 1;
  const cells: [number, number][] = [];

  for (let i = 0; i < length; i++) {
    cells.push([startRow + stepRow * i, startCol + stepCol * i]);
  }

  return cells;
}

/**
 * Assembles a word string from grid cells
 */
export function getWordFromCells(grid: string[][], cells: [number, number][]): string {
  return cells.map(([r, c]) => grid[r]?.[c] || "").join("");
}

export { generateWordGrid as generateGridFromPuzzle };
export type { GeneratedGrid };
