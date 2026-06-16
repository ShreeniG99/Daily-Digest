import styles from './DigestCard.module.css'

const KIND_EMOJI = {
  news: '📰', paper: '📄', repo: '🔧', youtube: '▶️', opportunity: '🎯',
}

const fmtDate = ts => {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const now = new Date()
  const diffH = (now - d) / 3600000
  if (diffH < 1)  return `${Math.round(diffH * 60)}m ago`
  if (diffH < 24) return `${Math.round(diffH)}h ago`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function DigestCard({ item, onMarkRead, onSpeak, isActive }) {
  const deadline = item.extra?.deadline
  const stars    = item.extra?.stars
  const isRead   = item.status === 'read'

  return (
    <article
      className={`${styles.card} ${styles[item.kind]} ${isRead ? styles.read : ''} ${isActive ? styles.speaking : ''}`}
    >
      {/* Kind badge + score */}
      <div className={styles.meta}>
        <span className={`${styles.kindBadge} ${styles[item.kind]}`}>
          {KIND_EMOJI[item.kind]} {item.kind}
        </span>
        <span className={styles.score}>★ {item.score}</span>
        {stars && <span className={styles.stars}>⭐ {stars >= 1000 ? `${(stars/1000).toFixed(1)}k` : stars}</span>}
      </div>

      {/* Title */}
      <h2 className={styles.title}>
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h2>

      {/* Source + date */}
      <div className={styles.sourceLine}>
        <span className={styles.source}>{item.source}</span>
        <span className={styles.date}>{fmtDate(item.published_ts)}</span>
        {deadline && <span className={styles.deadline}>⏰ {deadline}</span>}
      </div>

      {/* Snippet */}
      {item.raw_text && (
        <p className={styles.snippet}>
          {item.raw_text.length > 200 ? item.raw_text.slice(0, 200) + '…' : item.raw_text}
        </p>
      )}

      {/* Tags */}
      {item.tags?.length > 0 && (
        <div className={styles.tags}>
          {item.tags.slice(0, 4).map(t => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.btn}>
          Open ↗
        </a>
        <button
          className={`${styles.btn} ${isActive ? styles.btnActive : ''}`}
          onClick={() => onSpeak(item)}
          title="Read aloud"
        >
          {isActive ? '🔊 Reading…' : '🔊 Listen'}
        </button>
        {!isRead && (
          <button className={styles.btn} onClick={() => onMarkRead(item.id)}>
            ✓ Done
          </button>
        )}
        {isRead && <span className={styles.readBadge}>✓ Read</span>}
      </div>
    </article>
  )
}
