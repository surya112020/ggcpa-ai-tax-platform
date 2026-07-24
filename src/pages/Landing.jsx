import { Link } from 'react-router-dom';
import { client, returnFields, statusMeta } from '../data/returnData.js';
import { getAiSuggestions, severityMeta } from '../data/aiData.js';
import { Pill, AiChip, Confidence } from '../components/atoms.jsx';
import { useRole } from '../App.jsx';

export default function Landing() {
  const { role } = useRole();
  const ai = getAiSuggestions();
  const needsReview = returnFields.filter((f) => f.status === 'review' || f.status === 'ai');
  const openHigh = ai.filter((a) => a.severity === 'high').length;

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1>Return Overview</h1>
              <Pill cls="pill-ondark">In review</Pill>
            </div>
            <div className="hero-sub">
              {client.name} · {client.entity} · Tax year {client.taxYear} · Prepared by {client.preparer}
            </div>
          </div>
          <span className="hero-badge">TY{client.taxYear}</span>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hs-ico"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>
            <div className="n">4</div><div className="l">Source documents</div>
          </div>
          <div className="hero-stat">
            <span className="hs-ico"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>
            <div className="n">{returnFields.length}</div><div className="l">Return fields extracted</div>
          </div>
          <div className="hero-stat warn">
            <span className="hs-ico"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg></span>
            <div className="n">{needsReview.length}</div><div className="l">Fields needing review</div>
          </div>
          <div className="hero-stat risk">
            <span className="hs-ico"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"/></svg></span>
            <div className="n">{openHigh}</div><div className="l">High-priority AI flags</div>
          </div>
        </div>
      </div>

      <div className="split-2">
        {/* Challenge 1 entry */}
        <div className="card">
          <div className="card-head">
            <span className="card-title">Fields to review</span>
            <Link to="/review" className="link right">Open Return Review →</Link>
          </div>
          <table className="table">
            <thead>
              <tr><th>Line</th><th>Field</th><th>Value</th><th>Status</th></tr>
            </thead>
            <tbody>
              {returnFields.slice(0, 5).map((f) => {
                const s = statusMeta[f.status];
                return (
                  <tr key={f.id}>
                    <td className="muted mono" style={{ fontSize: 12 }}>{f.line}</td>
                    <td>
                      <Link to="/review" state={{ focus: f.id }} className="link">{f.label}</Link>
                      {f.origin === 'derived' && <span className="muted" style={{ fontSize: 11 }}> · from {f.trace.sources.length} docs</span>}
                    </td>
                    <td className="mono">{f.value}</td>
                    <td><Pill cls={s.cls}>{s.label}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Challenge 10 entry */}
        <div className="card">
          <div className="card-head">
            <span className="card-title"><AiChip /> &nbsp;AI needs your input</span>
            <Link to="/ai-review" className="link right">Open AI Review →</Link>
          </div>
          <div style={{ padding: '6px 0' }}>
            {ai.slice(0, 4).map((a) => {
              const sev = severityMeta[a.severity];
              return (
                <Link
                  to="/ai-review"
                  state={{ focus: a.id }}
                  key={a.id}
                  style={{ display: 'block', padding: '11px 16px', borderBottom: '1px solid var(--line-soft)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Pill cls={sev.cls} dot={false}>{sev.label}</Pill>
                    <Confidence value={a.confidence} />
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 6 }}>{a.title}</div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{a.field}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {role === 'client' && (
        <div className="card card-pad" style={{ marginTop: 16, borderLeft: '3px solid var(--info-600)' }}>
          <strong>You're viewing as the client.</strong>{' '}
          <span className="muted">Internal preparer notes and raw AI confidence details are hidden in this view. Switch back to “Preparer (CPA)” in the top-right to see the full workspace.</span>
        </div>
      )}
    </div>
  );
}
