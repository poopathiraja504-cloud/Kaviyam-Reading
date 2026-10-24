import { WordFinderPuzzle } from "../types/wordFinder";
import { Language } from "./i18n";

export interface WordPlacement {
  word: string;
  wordEn?: string;
  cells: [number, number][];
  direction: "H" | "V" | "D" | string;
  startRow?: number;
  startCol?: number;
}

export interface GeneratedGrid {
  grid: string[][];
  size: number;
  placedWords: WordPlacement[];
}

// Split Tamil text into actual rendered grapheme clusters (Uyirmei letters together)
export function splitGraphemes(text: string, isTamil: boolean): string[] {
  if (!isTamil) {
    return text.toUpperCase().replace(/[^A-Z]/g, "").split("");
  }
  if (typeof Intl !== "undefined" && (Intl as any).Segmenter) {
    const segmenter = new (Intl as any).Segmenter("ta", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text)).map((s: any) => s.segment.trim()).filter(Boolean);
  }
  // Fallback regex for Tamil kombu and pulli characters
  const graphemes: string[] = [];
  const chars = Array.from(text.replace(/\s+/g, ""));
  let current = "";

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const code = ch.charCodeAt(0);
    // Tamil vowel signs, pulli, au-sign range (0x0B80 - 0x0BFF)
    const isModifier = (code >= 0x0BBE && code <= 0x0BCD) || code === 0x0BD7;
    if (isModifier && current) {
      current += ch;
    } else {
      if (current) graphemes.push(current);
      current = ch;
    }
  }
  if (current) graphemes.push(current);
  return graphemes;
}

const TAMIL_FILLERS = [
  "க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன",
  "கா", "கி", "கு", "கை", "கோ", "தா", "தி", "து", "தை", "நா", "நி", "பா", "பி", "பு", "மா", "மி", "மு",
  "வா", "வி", "ரா", "ரி", "லா", "லி", "சா", "சி", "சு", "அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"
];

const ENGLISH_FILLERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function generateGridFromPuzzle(puzzle: WordFinderPuzzle, lang: Language): GeneratedGrid {
  const isTamil = lang === "ta";
  const size = puzzle.gridSize || 10;
  const grid: string[][] = Array(size).fill("").map(() => Array(size).fill(""));
  const placedWords: WordPlacement[] = [];

  const rawWords = isTamil ? puzzle.words : (puzzle.wordsEn || puzzle.words);
  const targetWords = rawWords.map((w) => {
    return {
      original: w,
      graphemes: splitGraphemes(w, isTamil),
    };
  });

  // Directions: Horizontal (0,1), Vertical (1,0), Diagonal (1,1)
  const directions: [number, number, "H" | "V" | "D"][] = [
    [0, 1, "H"],
    [1, 0, "V"],
    [1, 1, "D"],
  ];

  targetWords.forEach(({ original, graphemes }) => {
    const len = graphemes.length;
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      attempts++;
      const [dr, dc, dirKey] = directions[Math.floor(Math.random() * directions.length)];
      const maxR = size - (dr ? len : 1);
      const maxC = size - (dc ? len : 1);

      if (maxR < 0 || maxC < 0) continue;

      const startR = Math.floor(Math.random() * (maxR + 1));
      const startC = Math.floor(Math.random() * (maxC + 1));

      // Check collision
      let canPlace = true;
      for (let i = 0; i < len; i++) {
        const r = startR + i * dr;
        const c = startC + i * dc;
        if (grid[r][c] !== "" && grid[r][c] !== graphemes[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        const cells: [number, number][] = [];
        for (let i = 0; i < len; i++) {
          const r = startR + i * dr;
          const c = startC + i * dc;
          grid[r][c] = graphemes[i];
          cells.push([r, c]);
        }
        placedWords.push({
          word: original,
          cells,
          direction: dirKey,
          startRow: cells[0][0],
          startCol: cells[0][1],
        });
        placed = true;
      }
    }
  });

  // Fill remaining empty cells with random filler letters
  const fillers = isTamil ? TAMIL_FILLERS : ENGLISH_FILLERS;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = fillers[Math.floor(Math.random() * fillers.length)];
      }
    }
  }

  return {
    grid,
    size,
    placedWords,
  };
}
