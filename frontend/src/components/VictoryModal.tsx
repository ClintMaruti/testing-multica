import styles from './VictoryModal.module.css';

type Props = {
  elapsed: string;
  onNewGame: () => void;
};

export function VictoryModal({ elapsed, onNewGame }: Props) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Puzzle solved">
      <div className={styles.modal}>
        <h2 className={styles.title}>You solved it!</h2>
        <p className={styles.subtitle}>Congratulations — puzzle complete.</p>
        <div className={styles.time}>{elapsed}</div>
        <button className={styles.btn} onClick={onNewGame} autoFocus>
          Play Again
        </button>
      </div>
    </div>
  );
}
