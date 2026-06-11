import type { Difficulty } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function generatePuzzle(difficulty: Difficulty): Promise<number[][]> {
  const res = await fetch(`${BASE_URL}/puzzle/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty }),
  });
  if (!res.ok) throw new Error(`Generate puzzle failed: ${res.status}`);
  const data = await res.json();
  // Accept either { puzzle: number[][] } or number[][] directly
  return Array.isArray(data) ? data : data.puzzle;
}

export async function validateSolution(solution: number[][]): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/puzzle/validate`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ solution }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.valid === true || data.success === true;
}
