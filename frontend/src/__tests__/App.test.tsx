import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import App from '../App';
import * as api from '../api';

vi.mock('../api');

// Known valid Sudoku solution.
const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// Near-complete puzzle: only cell (8,8) is blank — entering 9 completes the board.
const NEAR_COMPLETE = SOLUTION.map((row, r) =>
  row.map((v, c) => (r === 8 && c === 8 ? 0 : v))
);

// All-zeros puzzle: every cell is non-prefilled, useful for move + undo test.
const BLANK_PUZZLE = Array.from({ length: 9 }, () => Array(9).fill(0));

afterEach(() => {
  vi.resetAllMocks();
});

describe('Undo reverts the last move', () => {
  it(
    'cell B is cleared after undo; cell A retains its value',
    async () => {
      vi.mocked(api.generatePuzzle).mockResolvedValue(BLANK_PUZZLE);
      vi.mocked(api.validateSolution).mockResolvedValue(false);

      const user = userEvent.setup();
      render(<App />);

      // Start a new game and wait for the grid to appear.
      await user.click(screen.getByRole('button', { name: 'New Game' }));
      await screen.findAllByRole('gridcell');

      // Select cell A (Row 1, Col 1) and enter 5.
      await user.click(screen.getByRole('gridcell', { name: 'Row 1 Column 1 empty' }));
      await user.click(screen.getByRole('button', { name: 'Enter 5' }));

      // Select cell B (Row 1, Col 2) and enter 7.
      await user.click(screen.getByRole('gridcell', { name: 'Row 1 Column 2 empty' }));
      await user.click(screen.getByRole('button', { name: 'Enter 7' }));

      expect(
        screen.getByRole('gridcell', { name: 'Row 1 Column 1 value 5' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('gridcell', { name: 'Row 1 Column 2 value 7' })
      ).toBeInTheDocument();

      // Undo — reverts cell B; cell A must remain.
      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(
        screen.getByRole('gridcell', { name: 'Row 1 Column 2 empty' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('gridcell', { name: 'Row 1 Column 1 value 5' })
      ).toBeInTheDocument();
    },
    15_000
  );
});

describe('Victory state triggers on correct completion', () => {
  it(
    'entering the last correct value shows the victory dialog',
    async () => {
      vi.mocked(api.generatePuzzle).mockResolvedValue(NEAR_COMPLETE);
      vi.mocked(api.validateSolution).mockResolvedValue(true);

      const user = userEvent.setup();
      render(<App />);

      // Start a new game and wait for the grid.
      await user.click(screen.getByRole('button', { name: 'New Game' }));
      await screen.findAllByRole('gridcell');

      // Cell (8,8) is the only non-prefilled cell.
      await user.click(screen.getByRole('gridcell', { name: 'Row 9 Column 9 empty' }));
      await user.click(screen.getByRole('button', { name: 'Enter 9' }));

      // Win dispatch is async (awaits validateSolution mock), so poll.
      await waitFor(
        () => expect(screen.getByRole('dialog', { name: 'Puzzle solved' })).toBeInTheDocument(),
        { timeout: 5000 }
      );
      expect(screen.getByText('You solved it!')).toBeInTheDocument();
    },
    15_000
  );
});
