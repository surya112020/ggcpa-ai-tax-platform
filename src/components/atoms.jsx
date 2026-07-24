// Small shared UI atoms — the interaction/affordance vocabulary
// reused across both challenges so the product feels like one system.
import { useEffect } from 'react';
import Icon from './Icon.jsx';

export function Pill({ cls = 'pill-neutral', dot = true, children }) {
  return (
    <span className={`pill ${cls}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export function AiChip({ children = 'AI' }) {
  return <span className="ai-chip"><Icon name="sparkle" size={12} /> {children}</span>;
}

// Confidence meter — the single, consistent way we show model confidence
// everywhere in the app.
export function Confidence({ value }) {
  const pct = Math.round(value * 100);
  const color =
    value >= 0.85 ? 'var(--ok-600)' : value >= 0.65 ? 'var(--warn-600)' : 'var(--risk-600)';
  return (
    <span className="conf" title={`Model confidence: ${pct}%`}>
      <span className="conf-track">
        <span className="conf-fill" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="conf-num" style={{ color }}>{pct}%</span>
    </span>
  );
}

export function Toast({ children, onDone }) {
  useEffect(() => {
    if (!onDone) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast" role="status">
      <Icon name="check" size={14} />
      <span>{children}</span>
      {onDone && (
        <button className="btn btn-sm btn-ghost" style={{ color: '#fff' }} onClick={onDone}>
          Dismiss
        </button>
      )}
    </div>
  );
}
