# Sudoku API

Node.js + TypeScript + Express REST API for the Sudoku web app.

## Requirements

- Node.js ≥ 18
- npm ≥ 9

## Setup

```bash
cd backend
npm install
```

## Running

### Production

```bash
npm start
```

`npm start` runs `tsc` (compiles to `dist/`) then starts `node dist/index.js`.

### Development (hot-reload via ts-node)

```bash
npm run dev
```

### Port

Default port is **3001**. Override with the `PORT` environment variable:

```bash
PORT=4000 npm start
```

## Endpoints

### `POST /puzzle/generate`

Generate a new Sudoku puzzle.

**Request body:**
```json
{ "difficulty": "easy" | "medium" | "hard" }
```

**Response:**
```json
{
  "puzzle":   [[number, ...], ...],  // 9×9, 0 = empty cell
  "solution": [[number, ...], ...]   // 9×9, fully solved
}
```

Revealed cell counts by difficulty: Easy ~36 · Medium ~27 · Hard ~20.
Every puzzle is guaranteed to have exactly one solution (verified by the backtracking solver before the response is sent).

**Errors:** `400` if `difficulty` is missing or invalid.

---

### `GET /puzzle/validate`

Validate a completed 9×9 board.

**Query parameter:** `board` — JSON-encoded 9×9 array of integers 1–9 (no zeros).

Example:
```
GET /puzzle/validate?board=[[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]]
```

Alternatively, send as a request body:
```json
{ "board": [[...], ...] }
```

**Response:**
```json
{ "valid": true, "errors": [] }
```
or
```json
{ "valid": false, "errors": ["Row 3 does not contain digits 1–9 exactly once", ...] }
```

**Errors:** `400` if `board` is missing, not a 9×9 array, or contains values outside 1–9.

## CORS

The server allows requests from `http://localhost:3000` and `http://localhost:80` (React dev server and production).
