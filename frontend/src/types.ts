export type Difficulty = 'easy' | 'medium' | 'hard';

export type CellState = {
  value: number | null;
  prefilled: boolean;
  invalid: boolean;
};

export type Board = CellState[][];

export type Position = { row: number; col: number };

export type GameStatus = 'idle' | 'playing' | 'won';

export type HistoryEntry = {
  row: number;
  col: number;
  prev: number | null;
};
