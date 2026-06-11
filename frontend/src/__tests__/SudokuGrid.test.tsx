import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SudokuGrid } from '../components/SudokuGrid';
import { buildBoard, computeInvalid } from '../sudokuUtils';

const BLANK_PUZZLE = Array.from({ length: 9 }, () => Array(9).fill(0));

describe('SudokuGrid — 81 cells', () => {
  it('renders exactly 81 gridcell elements', () => {
    const board = buildBoard(BLANK_PUZZLE);
    render(
      <SudokuGrid board={board} selected={null} onSelect={() => {}} onInput={() => {}} />
    );
    expect(screen.getAllByRole('gridcell')).toHaveLength(81);
  });
});

describe('SudokuGrid — cell selection highlights peers', () => {
  it('selecting cell (0,0) marks it "selected" and highlights exactly 20 peer cells', () => {
    const board = buildBoard(BLANK_PUZZLE);
    render(
      <SudokuGrid
        board={board}
        selected={{ row: 0, col: 0 }}
        onSelect={() => {}}
        onInput={() => {}}
      />
    );

    const cells = screen.getAllByRole('gridcell');

    // The selected cell itself
    expect(cells[0]).toHaveClass('selected');

    // Peer count: 8 in same row + 8 in same col + 4 in same box only = 20
    const highlighted = cells.filter((cell) => cell.classList.contains('highlighted'));
    expect(highlighted).toHaveLength(20);
  });
});

describe('SudokuGrid — invalid entry', () => {
  it('cell with a row conflict gets the "invalid" class', () => {
    // Build a board with 5 at both (0,0) and (0,4) — same row, same value.
    let board = buildBoard(BLANK_PUZZLE);
    board = board.map((row, r) =>
      row.map((cell, c) => {
        if ((r === 0 && c === 0) || (r === 0 && c === 4)) return { ...cell, value: 5 };
        return cell;
      })
    );
    board = computeInvalid(board);

    render(
      <SudokuGrid board={board} selected={null} onSelect={() => {}} onInput={() => {}} />
    );

    const cells = screen.getAllByRole('gridcell');
    // Both conflicting cells should carry the "invalid" class.
    expect(cells[0]).toHaveClass('invalid');  // (0,0)
    expect(cells[4]).toHaveClass('invalid');  // (0,4)
  });
});
