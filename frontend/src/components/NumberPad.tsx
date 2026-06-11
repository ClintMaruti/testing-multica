import styles from './NumberPad.module.css';

type Props = {
  onNumber: (n: number) => void;
  disabled?: boolean;
};

export function NumberPad({ onNumber, disabled }: Props) {
  return (
    <div className={styles.pad} aria-label="Number input pad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          className={styles.btn}
          onClick={() => onNumber(n)}
          disabled={disabled}
          aria-label={`Enter ${n}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
