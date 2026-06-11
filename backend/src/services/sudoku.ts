export type Difficulty = 'easy' | 'medium' | 'hard';

const REVEALED_CELLS: Record<Difficulty, number> = {
  easy: 36,
  medium: 27,
  hard: 20,
};

// Returns true if placing `num` at (row, col) is valid under current board state.
function isValid(board: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

// Fills the board in-place using backtracking.
// `rng` allows a seeded shuffle so generated boards are varied.
function fillBoard(board: number[][], rng: () => number): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) continue;
      const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
      for (const num of digits) {
        if (isValid(board, row, col, num)) {
          board[row][col] = num;
          if (fillBoard(board, rng)) return true;
          board[row][col] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

// Counts solutions up to a limit (2) — stops early once we know it's not unique.
function countSolutions(board: number[][], limit: number): number {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0) continue;
      let count = 0;
      for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
          board[row][col] = num;
          count += countSolutions(board, limit - count);
          board[row][col] = 0;
          if (count >= limit) return count;
        }
      }
      return count;
    }
  }
  return 1; // no empty cell found — fully filled
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function deepCopy(board: number[][]): number[][] {
  return board.map((row) => [...row]);
}

// Simple xorshift RNG seeded with a number so the generator is deterministic per call.
function makeRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: number[][]; solution: number[][] } {
  const rng = makeRng(Date.now() ^ (Math.random() * 0xffffffff));

  // Build a fully solved board.
  const solution: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(solution, rng);

  const revealCount = REVEALED_CELLS[difficulty];
  const totalCells = 81;
  const toRemove = totalCells - revealCount;

  // Shuffle cell positions and remove cells one by one, only keeping the
  // board if the remaining puzzle still has exactly one solution.
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffled = shuffle(positions, rng);

  const puzzle = deepCopy(solution);
  let removed = 0;

  for (const [r, c] of shuffled) {
    if (removed >= toRemove) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    const copy = deepCopy(puzzle);
    if (countSolutions(copy, 2) === 1) {
      removed++;
    } else {
      puzzle[r][c] = backup; // restore — would create multiple solutions
    }
  }

  return { puzzle, solution };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateBoard(board: number[][]): ValidationResult {
  const errors: string[] = [];

  for (let i = 0; i < 9; i++) {
    // Row check
    const rowSet = new Set(board[i]);
    if (rowSet.size !== 9 || rowSet.has(0)) {
      errors.push(`Row ${i + 1} does not contain digits 1–9 exactly once`);
    }

    // Column check
    const colSet = new Set<number>();
    for (let r = 0; r < 9; r++) colSet.add(board[r][i]);
    if (colSet.size !== 9 || colSet.has(0)) {
      errors.push(`Column ${i + 1} does not contain digits 1–9 exactly once`);
    }

    // 3×3 box check
    const boxRow = Math.floor(i / 3) * 3;
    const boxCol = (i % 3) * 3;
    const boxSet = new Set<number>();
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        boxSet.add(board[r][c]);
      }
    }
    if (boxSet.size !== 9 || boxSet.has(0)) {
      errors.push(`Box at row ${boxRow + 1}–${boxRow + 3}, col ${boxCol + 1}–${boxCol + 3} does not contain digits 1–9 exactly once`);
    }
  }

  return { valid: errors.length === 0, errors };
}
