import { Router, Request, Response } from 'express';
import { generatePuzzle, validateBoard, Difficulty } from '../services/sudoku';

const router = Router();

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

router.post('/generate', (req: Request, res: Response) => {
  const { difficulty } = req.body as { difficulty?: unknown };

  if (!difficulty || typeof difficulty !== 'string' || !VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
    res.status(400).json({
      error: 'Invalid input',
      details: `"difficulty" must be one of: ${VALID_DIFFICULTIES.join(', ')}`,
    });
    return;
  }

  const result = generatePuzzle(difficulty as Difficulty);
  res.json(result);
});

function parseBoardParam(raw: unknown): number[][] | null {
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(raw) || raw.length !== 9) return null;
  for (const row of raw) {
    if (!Array.isArray(row) || row.length !== 9) return null;
    for (const cell of row) {
      if (typeof cell !== 'number' || !Number.isInteger(cell) || cell < 1 || cell > 9) return null;
    }
  }
  return raw as number[][];
}

router.get('/validate', (req: Request, res: Response) => {
  const rawBoard = req.query.board ?? req.body?.board;

  const board = parseBoardParam(rawBoard);
  if (!board) {
    res.status(400).json({
      error: 'Invalid input',
      details: 'Provide "board" as a JSON-encoded 9×9 array of integers 1–9 (no empty cells)',
    });
    return;
  }

  const result = validateBoard(board);
  res.json(result);
});

export default router;
