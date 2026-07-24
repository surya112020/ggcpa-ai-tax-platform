import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { getAiSuggestions, severityMeta, kindMeta } from '../data/aiData.js';
import { Pill, AiChip, Confidence, Toast } from '../components/atoms.jsx';
import { useRole } from '../App.jsx';

// resolution: undefined | 'accepted' | 'edited' | 'dismissed' | 'requested'
export default function TrustAI() {
  const { role } = useRole();
  const loc = useLocation();
  const [items, setItems] = useState(() => getAiSuggestions());
  const [activeId, setActiveId] = useState(loc.state?.focus || getAiSuggestions()[0].id);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (loc.state?.focus) setActiveId(loc.state.focus); }, [loc.state]);

  const active = items.find((i) => i.id === activeId);
  const open = items.filter((i) => !i.resolution);
  const allClear = open.length === 0;

  function resolve(id, resolution, finalValue) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, resolution, finalValue } : i)));
    setEditing(false);
    const labels = {
      accepted: 'Accepted — return updated',
      edited: 'Correction saved',
      dismissed: 'Dismissed with note',
      requested: 'Document request sent to client',
    };
    setToast(labels[resolution]);
  }

  // Simulate re-running the model. In a real build this would re-call the endpoint.
  function reRun() {
    setLoading(true);
    setToast(null);
    setTimeout(() => {
      setItems(getAiSuggestions());
      setLoading(false);
      setToast('AI re-run complete — 6 suggestions');
    }, 1300);
  }

  return (
    <div className="ai-layout">
      {/* LEFT — queue */}
      <div className="ai-queue">
        <div className="ai-queue-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AiChip /> <strong style={{ fontSize: 14 }}>AI Review</strong>
            <span className="right muted" style={{ fontSize: 12 }}>{loading ? '…' : `${open.length} open`}</span>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            Firm-wide worklist · suggestions the model wants a human to confirm.
          </div>
          {role === 'preparer' && (
            <button className="btn btn-sm" style={{ marginTop: 10 }} disabled={loading} onClick={reRun}>
              {loading ? 'Running…' : <><Icon name="refresh" size={13} /> Re-run AI</>}
            </button>
          )}
        </div>

        {loading
          ? [0, 1, 2, 3, 4].map((i) => (
              <div className="queue-item" key={i} style={{ pointerEvents: 'none' }}>
                <div className="skel skel-icon" />
                <div style={{ flex: 1 }}>
                  <div className="skel skel-line" style={{ width: '85%' }} />
                  <div className="skel skel-line" style={{ width: '55%', marginTop: 7 }} />
                </div>
              </div>
            ))
          : items.map((it) => {
              const k = kindMeta[it.kind];
              const sev = severityMeta[it.severity];
              return (
                <div
                  key={it.id}
                  className={`queue-item sev-${it.severity} ${it.id === activeId ? 'active' : ''} ${it.resolution ? 'resolved' : ''}`}
                  onClick={() => { setActiveId(it.id); setEditing(false); }}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveId(it.id); setEditing(false); } }}
                >
                  <div className="q-icon" style={{ background: k.bg, color: k.fg }}><Icon name={k.icon} /></div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="q-client">{it.client}</div>
                    <div className="q-title">{it.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      {it.resolution
                        ? <Pill cls="pill-ok">{resolvedLabel(it.resolution)}</Pill>
                        : <>
                            <Pill cls={sev.cls} dot={false}>{sev.label}</Pill>
                            {it.confidence != null && <Confidence value={it.confidence} />}
                          </>}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {/* RIGHT — detail */}
      <div className="ai-detail">
        {loading ? (
          <div className="ai-detail-inner">
            <div className="skel skel-line" style={{ width: 180, height: 14 }} />
            <div className="skel skel-line" style={{ width: '70%', height: 24, marginTop: 14 }} />
            <div className="skel" style={{ height: 90, borderRadius: 10, marginTop: 20 }} />
            <div className="skel" style={{ height: 140, borderRadius: 10, marginTop: 16 }} />
            <div className="muted" style={{ marginTop: 16, fontSize: 13 }}>Re-running the model against the latest documents…</div>
          </div>
        ) : active && (
          <div className="ai-detail-inner">
            {allClear && (
              <div className="allclear">
                <span className="allclear-badge"><Icon name="check" size={15} /></span>
                <div>
                  <strong>All caught up.</strong>{' '}
                  <span className="muted">Every AI suggestion in the firm-wide queue has been reviewed. New flags will appear here as documents arrive.</span>
                </div>
              </div>
            )}

            {(() => { const k = kindMeta[active.kind]; return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <span className="q-icon" style={{ background: k.bg, color: k.fg }}><Icon name={k.icon} /></span>
                <Pill cls={severityMeta[active.severity].cls} dot={false}>{severityMeta[active.severity].label}</Pill>
                <span className="ai-chip"><Icon name="sparkle" size={12} /> {k.label}</span>
              </div>
            ); })()}

            <h2 style={{ fontSize: 20, marginTop: 6 }}>{active.title}</h2>
            <div className="muted" style={{ marginTop: 2 }}>
              <span className="client-tag">{active.client}</span> · {active.field}
            </div>

            {/* Headline change */}
            <div className="card card-pad section-gap" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <div>
                <div className="chain-label">Current</div>
                <div className="mono" style={{ fontSize: 17, fontWeight: 700 }}>{active.current}</div>
              </div>
              <div style={{ fontSize: 22, color: 'var(--ink-300)' }}>→</div>
              <div>
                <div className="chain-label" style={{ color: 'var(--ai-600)' }}>{active.kind === 'blocked' ? 'AI status' : 'AI suggests'}</div>
                <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: 'var(--ai-600)' }}>
                  {active.resolution === 'edited' ? active.finalValue : active.suggested}
                </div>
              </div>
              <div className="right" style={{ textAlign: 'right' }}>
                <div className="chain-label">Confidence</div>
                {active.confidence != null
                  ? <Confidence value={active.confidence} />
                  : <span className="muted" style={{ fontSize: 13 }}>N/A — no estimate</span>}
              </div>
            </div>

            {/* What it did */}
            <div className="section-gap">
              <div className="chain-label" style={{ marginBottom: 6 }}>What the AI did</div>
              <p style={{ margin: 0 }}>{active.summary}</p>
            </div>

            {/* Why */}
            <div className="section-gap">
              <div className="chain-label" style={{ marginBottom: 6 }}>Why — the reasoning</div>
              <div className="reason-box">{active.reasoning}</div>
            </div>

            {/* Evidence */}
            <div className="section-gap">
              <div className="chain-label" style={{ marginBottom: 8 }}>Evidence it used</div>
              {active.evidence.map((e, i) => (
                <div className="evidence-row" key={i}>
                  <span className="ev-ico"><Icon name={e.icon} /></span>
                  <span style={{ flex: 1 }}>{e.label}</span>
                  <span className="mono" style={{ fontWeight: 600 }}>{e.value}</span>
                </div>
              ))}
            </div>

            {/* Uncertainty */}
            <div className="section-gap">
              <div className="chain-label" style={{ marginBottom: 6 }}>Where it's unsure</div>
              <div className="uncertainty-box">{active.uncertainty}</div>
            </div>

            {/* Recommended action */}
            <div className="section-gap">
              <div className="chain-label" style={{ marginBottom: 6 }}>Recommended next step</div>
              <p style={{ margin: 0 }}>{active.recommendedAction}</p>
            </div>

            {/* Correction workflow */}
            <div className="card card-pad section-gap">
              {active.resolution ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Pill cls="pill-ok">{resolvedLabel(active.resolution)}</Pill>
                  <span className="muted">{resolvedDetail(active)}</span>
                  <button className="btn btn-sm right" onClick={() => resolve(active.id, undefined)}>Undo</button>
                </div>
              ) : role !== 'preparer' ? (
                <div className="muted">Only a preparer can act on AI suggestions. You're viewing as the client.</div>
              ) : active.kind === 'blocked' ? (
                <div>
                  <div className="chain-label" style={{ marginBottom: 8 }}>Your decision</div>
                  <div className="action-bar">
                    <button className="btn btn-primary" onClick={() => resolve(active.id, 'requested')}><Icon name="mail" size={14} /> Request documents from client</button>
                    <button className="btn" onClick={() => resolve(active.id, 'dismissed')}>Dismiss</button>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                    The AI won't fabricate a number. It routes the gap back to the client instead of guessing.
                  </div>
                </div>
              ) : editing ? (
                <div>
                  <div className="chain-label" style={{ marginBottom: 6 }}>Enter the correct value</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input
                      autoFocus
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      placeholder={active.suggested}
                      className="mono"
                      style={{ flex: 1, minWidth: 160, padding: '9px 11px', border: '1px solid var(--brand-500)', borderRadius: 8, fontSize: 15 }}
                    />
                    <button className="btn btn-primary" onClick={() => resolve(active.id, 'edited', editVal || active.suggested)}>Save correction</button>
                    <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
                    Correcting the AI here records the right answer on the file — it doesn't just overwrite silently.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="chain-label" style={{ marginBottom: 8 }}>Your decision</div>
                  <div className="action-bar">
                    <button className="btn btn-ok" onClick={() => resolve(active.id, 'accepted')}><Icon name="check" size={14} /> Accept suggestion</button>
                    <button className="btn" onClick={() => { setEditing(true); setEditVal(''); }}><Icon name="edit" size={14} /> Edit value</button>
                    <button className="btn" onClick={() => resolve(active.id, 'dismissed')}>Dismiss</button>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                    Nothing changes on the return until you choose. The AI proposes; the preparer decides.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
    </div>
  );
}

function resolvedLabel(r) {
  return r === 'dismissed' ? 'Dismissed'
    : r === 'edited' ? 'Corrected'
    : r === 'requested' ? 'Docs requested'
    : 'Accepted';
}
function resolvedDetail(a) {
  if (a.resolution === 'edited') return <>Saved value <span className="mono">{a.finalValue}</span>.</>;
  if (a.resolution === 'accepted') return <>Return updated to <span className="mono">{a.suggested}</span>.</>;
  if (a.resolution === 'requested') return 'A document request was sent to the client.';
  return 'Left unchanged with a note for the file.';
}
