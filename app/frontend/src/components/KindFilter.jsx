import styles from './KindFilter.module.css'

const LABELS = {
  all: 'All',
  news: 'News',
  paper: 'Papers',
  repo: 'Repos',
  youtube: 'Videos',
  opportunity: 'Opportunities',
}

export default function KindFilter({ kinds, active, counts, onChange }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {kinds.map(k => (
          <button
            key={k}
            className={`${styles.tab} ${active === k ? styles.active : ''} ${styles[k]}`}
            onClick={() => onChange(k)}
          >
            {LABELS[k]}
            {counts[k] > 0 && <span className={styles.badge}>{counts[k]}</span>}
          </button>
        ))}
      </div>
    </nav>
  )
}
