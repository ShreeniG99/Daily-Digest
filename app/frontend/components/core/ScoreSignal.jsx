import React from 'react';

/* Score signal: maps a raw relevance score to a 5-pip gold meter
   plus an optional numeric readout. `max` normalizes the score. */
export function ScoreSignal({ score = 0, max = 12, showNumber = true, showLabel = false, className = '', ...rest }) {
  const ratio = Math.max(0, Math.min(1, score / max));
  const on = Math.max(1, Math.round(ratio * 5));
  const cls = ['dd-score', className].filter(Boolean).join(' ');
  return (
    <span className={cls} title={`Relevance ${score.toFixed(1)}`} {...rest}>
      {showLabel && <span className="dd-score__label">Match</span>}
      <span className="dd-score__meter" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={'dd-score__pip' + (i < on ? ' dd-score__pip--on' : '')} />
        ))}
      </span>
      {showNumber && <span className="dd-score__num">{score.toFixed(1)}</span>}
    </span>
  );
}
