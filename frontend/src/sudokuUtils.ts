import type { Board, CellState } from './types';

export function buildBoard(puzzle: number[][]): Board {
  return puzzle.map((row) =>
    row.map((val) => ({
      value: val === 0 ? null : val,
      prefilled: val !== 0,
      invalid: false,
    }))
  );
}

export function computeInvalid(board: Board): Board {
  return board.map((row, r) =>
    row.map((cell, c) => {
      if (cell.value === null) return { ...cell, invalid: false };
      const invalid = isConflict(board, r, c, cell.value);
      return { ...cell, invalid };
    })
  );
}

function isConflict(board: Board, row: number, col: number, val: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i].value === val) return true;
    if (i !== row && board[i][col].value === val) return true;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c].value === val) return true;
    }
  }
  return false;
}

export function isBoardComplete(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (cell.value === null || cell.invalid) return false;
    }
  }
  return true;
}

export function isRowComplete(board: Board, row: number): boolean {
  const vals = board[row].map((c) => c.value);
  return (
    vals.every((v) => v !== null && !board[row][vals.indexOf(v)].invalid) &&
    new Set(vals).size === 9
  );
}

export function isColComplete(board: Board, col: number): boolean {
  const vals = board.map((row) => row[col].value);
  return vals.every((v) => v !== null) && new Set(vals).size === 9;
}

export function isBoxComplete(board: Board, boxRow: number, boxCol: number): boolean {
  const vals: (number | null)[] = [];
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      vals.push(board[r][c].value);
    }
  }
  return vals.every((v) => v !== null) && new Set(vals).size === 9;
}

export function boardToSolution(board: Board): number[][] {
  return board.map((row) => row.map((cell) => cell.value ?? 0));
}

export type CompletionSet = {
  rows: Set<number>;
  cols: Set<number>;
  boxes: Set<string>;
};

export function computeCompletionSets(board: Board): CompletionSet {
  const rows = new Set<number>();
  const cols = new Set<number>();
  const boxes = new Set<string>();

  for (let i = 0; i < 9; i++) {
    if (isRowComplete(board, i)) rows.add(i);
    if (isColComplete(board, i)) cols.add(i);
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      if (isBoxComplete(board, br * 3, bc * 3)) boxes.add(`${br}-${bc}`);
    }
  }
  return { rows, cols, boxes };
}

export function getCellClasses(
  r: number,
  c: number,
  cell: CellState,
  selected: { row: number; col: number } | null,
  completion: CompletionSet
): string[] {
  const classes: string[] = ['cell'];
  if (cell.prefilled) classes.push('prefilled');
  if (cell.invalid) classes.push('invalid');
  if (cell.value !== null && !cell.invalid) {
    const boxKey = `${Math.floor(r / 3)}-${Math.floor(c / 3)}`;
    if (completion.rows.has(r) || completion.cols.has(c) || completion.boxes.has(boxKey)) {
      classes.push('complete');
    }
  }
  if (selected) {
    if (selected.row === r && selected.col === c) {
      classes.push('selected');
    } else if (selected.row === r || selected.col === c) {
      classes.push('highlighted');
    } else if (
      Math.floor(selected.row / 3) === Math.floor(r / 3) &&
      Math.floor(selected.col / 3) === Math.floor(c / 3)
    ) {
      classes.push('highlighted');
    }
  }
  return classes;
}
