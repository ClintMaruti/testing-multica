import { useCallback, useEffect, useRef, useState } from 'react';
import { useSudoku } from './useSudoku';
import type { Difficulty } from './types';
import { SudokuGrid } from './components/SudokuGrid';
import { NumberPad } from './components/NumberPad';
import { GameControls } from './components/GameControls';
import { Timer } from './components/Timer';
import { VictoryModal } from './components/VictoryModal';
import styles from './App.module.css';

function formatSeconds(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function App() {
  const { state, newGame, selectCell, inputValue, undo, reset } = useSudoku();
  const { board, selected, status, difficulty, history, timerRunning, loading, error } = state;

  const [timerSeconds, setTimerSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Increment timer
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(
        () => setTimerSeconds((s) => s + 1),
        1000
      );
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning]);

  // Pause on page blur / resume on focus
  useEffect(() => {
    const pause = () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    const resume = () => {
      if (timerRunning) {
        intervalRef.current = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
      }
    };
    window.addEventListener('blur', pause);
    window.addEventListener('focus', resume);
    return () => {
      window.removeEventListener('blur', pause);
      window.removeEventListener('focus', resume);
    };
  }, [timerRunning]);

  const handleNewGame = useCallback(
    async (d?: Difficulty) => {
      setTimerSeconds(0);
      await newGame(d ?? difficulty);
    },
    [newGame, difficulty]
  );

  const handleDifficultyChange = useCallback(
    (d: Difficulty) => {
      handleNewGame(d);
    },
    [handleNewGame]
  );

  const handleNumberInput = useCallback(
    (n: number) => {
      if (!selected) return;
      inputValue(selected.row, selected.col, n);
    },
    [selected, inputValue]
  );

  const won = status === 'won';
  const playing = status === 'playing' || won;
  const gridDisabled = loading || won;

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Sudoku</h1>
        <p className={styles.subtitle}>
          Fill the grid — each row, column, and 3×3 box must contain 1–9
        </p>
      </header>

      <main className={styles.main}>
        <GameControls
          difficulty={difficulty}
          onDifficultyChange={handleDifficultyChange}
          onNewGame={() => handleNewGame()}
          onReset={reset}
          onUndo={undo}
          disabled={loading}
          canUndo={history.length > 0}
        />

        {error && <div className={styles.error}>{error}</div>}

        {loading && <div className={styles.loading}>Loading puzzle…</div>}

        {!loading && status === 'idle' && (
          <div className={styles.idle}>
            <p>
              Select a difficulty and click <strong>New Game</strong> to start.
            </p>
          </div>
        )}

        {!loading && playing && (
          <>
            <div className={styles.topBar}>
              <span className={styles.difficulty}>{difficulty}</span>
              <Timer seconds={timerSeconds} />
            </div>

            <SudokuGrid
              board={board}
              selected={selected}
              onSelect={selectCell}
              onInput={inputValue}
              disabled={gridDisabled}
            />

            <NumberPad onNumber={handleNumberInput} disabled={gridDisabled} />
          </>
        )}
      </main>

      {won && (
        <VictoryModal
          elapsed={formatSeconds(timerSeconds)}
          onNewGame={() => handleNewGame()}
        />
      )}
    </div>
  );
}
