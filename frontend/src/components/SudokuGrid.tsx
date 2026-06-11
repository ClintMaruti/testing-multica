import { useCallback, useEffect, useRef } from 'react';
import type { Board, Position } from '../types';
import { computeCompletionSets, getCellClasses } from '../sudokuUtils';
import styles from './SudokuGrid.module.css';

type Props = {
  board: Board;
  selected: Position | null;
  onSelect: (pos: Position) => void;
  onInput: (row: number, col: number, value: number | null) => void;
  disabled?: boolean;
};

export function SudokuGrid({ board, selected, onSelect, onInput, disabled }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  const completion = computeCompletionSets(board);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!disabled) onSelect({ row, col });
    },
    [disabled, onSelect]
  );

  const moveFocus = useCallback(
    (dRow: number, dCol: number) => {
      if (!selected) return;
      const newRow = Math.max(0, Math.min(8, selected.row + dRow));
      const newCol = Math.max(0, Math.min(8, selected.col + dCol));
      onSelect({ row: newRow, col: newCol });
    },
    [selected, onSelect]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled || !selected) return;

      if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1, 0); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1, 0); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(0, -1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); moveFocus(0, 1); return; }

      if (e.key === 'Tab') {
        e.preventDefault();
        const delta = e.shiftKey ? -1 : 1;
        const flat = selected.row * 9 + selected.col + delta;
        const clamped = Math.max(0, Math.min(80, flat));
        onSelect({ row: Math.floor(clamped / 9), col: clamped % 9 });
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        const cell = board[selected.row][selected.col];
        if (!cell.prefilled) onInput(selected.row, selected.col, null);
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        const cell = board[selected.row][selected.col];
        if (!cell.prefilled) onInput(selected.row, selected.col, num);
      }
    },
    [disabled, selected, moveFocus, onSelect, board, onInput]
  );

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus the grid div whenever a cell is selected so keyboard events fire
  useEffect(() => {
    if (selected && gridRef.current) {
      gridRef.current.focus({ preventScroll: true });
    }
  }, [selected]);

  return (
    <div
      ref={gridRef}
      className={styles.grid}
      tabIndex={0}
      aria-label="Sudoku grid"
      role="grid"
    >
      {board.map((row, r) =>
        row.map((cell, c) => {
          const classes = getCellClasses(r, c, cell, selected, completion);
          const classNames = classes.map((cls) => styles[cls] ?? cls).join(' ');
          return (
            <div
              key={`${r}-${c}`}
              className={classNames}
              role="gridcell"
              aria-label={`Row ${r + 1} Column ${c + 1}${cell.value ? ` value ${cell.value}` : ' empty'}`}
              aria-selected={selected?.row === r && selected?.col === c}
              onClick={() => handleCellClick(r, c)}
            >
              {cell.value ?? ''}
            </div>
          );
        })
      )}
    </div>
  );
}
