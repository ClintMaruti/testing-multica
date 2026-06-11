import type { Difficulty } from '../types';
import styles from './GameControls.module.css';

type Props = {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onNewGame: () => void;
  onReset: () => void;
  onUndo: () => void;
  disabled?: boolean;
  canUndo?: boolean;
};

export function GameControls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onReset,
  onUndo,
  disabled,
  canUndo,
}: Props) {
  return (
    <div className={styles.controls}>
      <select
        className={styles.select}
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
        aria-label="Difficulty"
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <button className={styles.btn} onClick={onNewGame} disabled={disabled} aria-label="New Game">
        New Game
      </button>

      <button
        className={`${styles.btn} ${styles.btnSecondary}`}
        onClick={onReset}
        disabled={disabled}
        aria-label="Reset"
      >
        Reset
      </button>

      <button
        className={`${styles.btn} ${styles.btnSecondary}`}
        onClick={onUndo}
        disabled={disabled || !canUndo}
        aria-label="Undo"
      >
        Undo
      </button>
    </div>
  );
}
