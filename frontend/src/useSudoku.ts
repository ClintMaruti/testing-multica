import { useCallback, useReducer } from 'react';
import type { Board, Difficulty, GameStatus, HistoryEntry, Position } from './types';
import { buildBoard, boardToSolution, computeInvalid, isBoardComplete } from './sudokuUtils';
import { generatePuzzle, validateSolution } from './api';

type State = {
  board: Board;
  original: Board;
  selected: Position | null;
  status: GameStatus;
  difficulty: Difficulty;
  history: HistoryEntry[];
  timerRunning: boolean;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_PUZZLE'; board: Board; difficulty: Difficulty }
  | { type: 'SELECT'; pos: Position }
  | { type: 'INPUT'; row: number; col: number; value: number | null }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'WIN' }
  | { type: 'TIMER_START' }
  | { type: 'TIMER_STOP' }
  | { type: 'LOADING'; value: boolean }
  | { type: 'ERROR'; msg: string | null };

const emptyBoard: Board = Array.from({ length: 9 }, () =>
  Array.from({ length: 9 }, () => ({ value: null, prefilled: false, invalid: false }))
);

const initialState: State = {
  board: emptyBoard,
  original: emptyBoard,
  selected: null,
  status: 'idle',
  difficulty: 'easy',
  history: [],
  timerRunning: false,
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PUZZLE': {
      return {
        ...state,
        board: action.board,
        original: action.board,
        difficulty: action.difficulty,
        history: [],
        status: 'playing',
        timerRunning: false,
        selected: null,
        loading: false,
        error: null,
      };
    }
    case 'SELECT':
      return { ...state, selected: action.pos };
    case 'INPUT': {
      const { row, col, value } = action;
      if (state.board[row][col].prefilled) return state;
      const prev = state.board[row][col].value;
      if (prev === value) return state;
      const newBoard = state.board.map((r, ri) =>
        r.map((cell, ci) => (ri === row && ci === col ? { ...cell, value } : cell))
      );
      const validated = computeInvalid(newBoard);
      const timerRunning = state.timerRunning || value !== null;
      return {
        ...state,
        board: validated,
        timerRunning,
        history: [...state.history, { row, col, prev }],
        error: null,
      };
    }
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      const newBoard = state.board.map((r, ri) =>
        r.map((cell, ci) =>
          ri === last.row && ci === last.col ? { ...cell, value: last.prev } : cell
        )
      );
      return {
        ...state,
        board: computeInvalid(newBoard),
        history: state.history.slice(0, -1),
      };
    }
    case 'RESET': {
      return {
        ...state,
        board: state.original,
        history: [],
        timerRunning: false,
        status: 'playing',
        error: null,
      };
    }
    case 'WIN':
      return { ...state, status: 'won', timerRunning: false };
    case 'TIMER_START':
      return { ...state, timerRunning: true };
    case 'TIMER_STOP':
      return { ...state, timerRunning: false };
    case 'LOADING':
      return { ...state, loading: action.value };
    case 'ERROR':
      return { ...state, error: action.msg, loading: false };
    default:
      return state;
  }
}

export function useSudoku() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const newGame = useCallback(async (difficulty: Difficulty) => {
    dispatch({ type: 'LOADING', value: true });
    try {
      const puzzle = await generatePuzzle(difficulty);
      const board = buildBoard(puzzle);
      dispatch({ type: 'SET_PUZZLE', board, difficulty });
    } catch {
      dispatch({ type: 'ERROR', msg: 'Failed to load puzzle. Is the backend running?' });
    }
  }, []);

  const selectCell = useCallback((pos: Position) => {
    dispatch({ type: 'SELECT', pos });
  }, []);

  const inputValue = useCallback(
    async (row: number, col: number, value: number | null) => {
      dispatch({ type: 'INPUT', row, col, value });
      // Check completion after state settles via the updated board
      // We compute a temporary board to check
      const tempBoard = state.board.map((r, ri) =>
        r.map((cell, ci) => (ri === row && ci === col ? { ...cell, value } : cell))
      );
      if (value !== null && isBoardComplete(computeInvalid(tempBoard))) {
        const solution = boardToSolution(tempBoard);
        try {
          const valid = await validateSolution(solution);
          if (valid) dispatch({ type: 'WIN' });
        } catch {
          // If server validation fails silently, still show win for a locally complete board
          if (isBoardComplete(computeInvalid(tempBoard))) dispatch({ type: 'WIN' });
        }
      }
    },
    [state.board]
  );

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const stopTimer = useCallback(() => dispatch({ type: 'TIMER_STOP' }), []);
  const startTimer = useCallback(() => dispatch({ type: 'TIMER_START' }), []);

  return { state, newGame, selectCell, inputValue, undo, reset, stopTimer, startTimer };
}
