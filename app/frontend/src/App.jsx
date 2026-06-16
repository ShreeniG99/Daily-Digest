import { useState, useEffect, useRef, useCallback } from 'react'
import KindFilter from './components/KindFilter.jsx'
import DigestCard from './components/DigestCard.jsx'
import TTSBar from './components/TTSBar.jsx'
import styles from './App.module.css'

const KINDS = ['all', 'news', 'paper', 'repo', 'youtube', 'opportunity']

export default function App() {
  const [items, setItems]           = useState([])
  const [generatedAt, setGenAt]    = useState(null)
  const [activeKind, setActiveKind] = useState('all')
  const [speaking, setSpeaking]     = useState(null) // { index, items }
  const [notifPerm, setNotifPerm]   = useState(Notification.permission)
  const [toast, setToast]           = useState(null)
  const esRef = useRef(null)

  // ── Fetch items ────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/items')
      const data = await res.json()
      setItems(data.items || [])
      setGenAt(data.generated_at)
    } catch {
      // server not running yet — try items.json directly
      try {
        const res = await fetch('/items.json')
        const data = await res.json()
        setItems(data.items || [])
        setGenAt(data.generated_at)
      } catch { /* no data yet */ }
    }
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  // ── SSE for real-time notifications ───────────────────────────────────────
  useEffect(() => {
    const connect = () => {
      const es = new EventSource('/api/events')
      es.onmessage = e => {
        const data = JSON.parse(e.data)
        if (data.type === 'digest_ready') {
          showToast(data.body || 'Digest updated!')
          if (notifPerm === 'granted') {
            new Notification(data.title || 'Daily Digest', { body: data.body })
          }
          fetchItems()
        }
      }
      es.onerror = () => { es.close(); setTimeout(connect, 5000) }
      esRef.current = es
    }
    connect()
    return () => esRef.current?.close()
  }, [fetchItems, notifPerm])

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  // ── Notification permission ───────────────────────────────────────────────
  const requestNotif = async () => {
    const perm = await Notification.requestPermission()
    setNotifPerm(perm)
  }

  // ── Mark read ─────────────────────────────────────────────────────────────
  const markRead = async id => {
    await fetch(`/api/mark/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'read' }),
    }).catch(() => {})
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: 'read' } : it))
  }

  // ── TTS ───────────────────────────────────────────────────────────────────
  const speakItem = useCallback((item, onEnd) => {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(
      `${item.title}. From ${item.source}. ${item.raw_text || ''}`
    )
    utt.rate = 0.95
    utt.onend = onEnd || null
    window.speechSynthesis.speak(utt)
  }, [])

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setSpeaking(null)
  }

  // Auto-advance TTS
  useEffect(() => {
    if (!speaking) return
    const { index, items: queue } = speaking
    if (index >= queue.length) { setSpeaking(null); return }
    speakItem(queue[index], () =>
      setSpeaking(prev => prev ? { ...prev, index: prev.index + 1 } : null)
    )
    return () => window.speechSynthesis.cancel()
  }, [speaking, speakItem])

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = activeKind === 'all'
    ? items
    : items.filter(it => it.kind === activeKind)

  const readAll = useCallback(() => {
    const visible = filtered.filter(it => it.status !== 'read')
    if (!visible.length) return
    setSpeaking({ index: 0, items: visible })
  }, [filtered])

  const counts = KINDS.reduce((acc, k) => {
    acc[k] = k === 'all' ? items.length : items.filter(i => i.kind === k).length
    return acc
  }, {})

  const speakingItem = speaking ? speaking.items[speaking.index] : null

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span>📰</span>
            <span>Daily Digest</span>
          </div>
          <div className={styles.headerRight}>
            {generatedAt && (
              <span className={styles.updated}>
                Updated {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {notifPerm !== 'granted' && (
              <button className={styles.notifBtn} onClick={requestNotif}>
                🔔 Enable notifications
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Kind filter */}
      <KindFilter kinds={KINDS} active={activeKind} counts={counts} onChange={setActiveKind} />

      {/* TTS bar */}
      <TTSBar
        onReadAll={readAll}
        onStop={stopSpeaking}
        speaking={!!speakingItem}
        currentTitle={speakingItem?.title}
      />

      {/* Cards */}
      <main className={styles.grid}>
        {filtered.length === 0 && (
          <div className={styles.empty}>
            {items.length === 0
              ? 'Run the ingestion pipeline first: python -m scripts.run all'
              : `No ${activeKind} items`}
          </div>
        )}
        {filtered.map(item => (
          <DigestCard
            key={item.id}
            item={item}
            onMarkRead={markRead}
            onSpeak={it => speakItem(it)}
            isActive={speakingItem?.id === item.id}
          />
        ))}
      </main>

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
