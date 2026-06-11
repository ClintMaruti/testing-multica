import styles from './Timer.module.css';

type Props = {
  seconds: number;
};

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Timer({ seconds }: Props) {
  return (
    <div className={styles.timer} aria-label={`Timer: ${formatTime(seconds)}`}>
      {formatTime(seconds)}
    </div>
  );
}
