import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import puzzleRouter from './routes/puzzle';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:80', 'http://localhost'] }));
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/puzzle', puzzleRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Sudoku API listening on port ${PORT}`);
});

export default app;
