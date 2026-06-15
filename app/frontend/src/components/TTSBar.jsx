import styles from './TTSBar.module.css'

export default function TTSBar({ onReadAll, onStop, speaking, currentTitle }) {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {!speaking ? (
          <button className={styles.readAll} onClick={onReadAll}>
            🔊 Read All Unread
          </button>
        ) : (
          <>
            <div className={styles.nowReading}>
              <span className={styles.pulse} />
              <span className={styles.nowLabel}>Now reading:</span>
              <span className={styles.title}>{currentTitle}</span>
            </div>
            <button className={styles.stop} onClick={onStop}>
              ⏹ Stop
            </button>
          </>
        )}
      </div>
    </div>
  )
}
