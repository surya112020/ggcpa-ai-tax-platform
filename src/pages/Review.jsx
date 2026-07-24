import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import {
  client, returnFields, documents, docContent, statusMeta,
} from '../data/returnData.js';
import { Pill, AiChip, Confidence, Toast } from '../components/atoms.jsx';
import { useRole } from '../App.jsx';

// Group fields by section, preserving order.
function useGrouped() {
  return useMemo(() => {
    const order = [];
    const map = {};
    returnFields.forEach((f) => {
      if (!map[f.section]) { map[f.section] = []; order.push(f.section); }
      map[f.section].push(f);
    });
    return order.map((s) => ({ section: s, fields: map[s] }));
  }, []);
}

// ---- Fake document viewer: renders a W-2 / 1099 and highlights a box ----
function DocViewer({ docId, region }) {
  const doc = documents[docId];
  const content = docContent[docId];
  if (!doc || !content) return null;
  return (
    <div className="doc-viewer">
      <div className="doc-toolbar">
        <span className="mono">{doc.filename}</span>
        <span className="right">Page {content && 1} of {doc.pages} · uploaded {doc.uploaded}</span>
      </div>
      <div className="doc-page">
        <div className="doc-w2-head">
          <div>
            <div style={{ fontWeight: 700 }}>{doc.kind}</div>
            <div className="muted" style={{ fontSize: 12 }}>{content.employer}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12 }} className="muted">
            Employee<br /><strong style={{ color: 'var(--ink-900)' }}>{content.employee}</strong>
          </div>
        </div>
        <div className="w2-grid">
          {content.boxes.map((b) => {
            const active = b.region === region;
            return (
              <div key={b.region} className={`w2-box ${active ? 'highlight-box' : ''}`}>
                {active && <span className="hl-tag">source</span>}
                <div className="cap">{b.cap}</div>
                <div className="val">{b.val}</div>
              </div>
            );
          })}
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 14, textAlign: 'center' }}>
          Simulated document render · highlight marks the exact box this figure was pulled from
        </div>
      </div>
    </div>
  );
}

// ---- The traceability chain for a selected field ----
function TracePanel({ field, srcIdx, setSrcIdx }) {
  const { role } = useRole();
  const s = statusMeta[field.status];
  const t = field.trace;
  const src = t.sources[srcIdx] || null;

  return (
    <div className="review-inner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span className="field-line">{field.line}</span>
        <h3 style={{ fontSize: 16 }}>{field.label}</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{field.value}</span>
        <Pill cls={s.cls}>{s.label}</Pill>
        {field.status !== 'locked' && field.status !== 'verified' && role === 'preparer' && (
          <Confidence value={field.confidence} />
        )}
      </div>

      {/* The chain */}
      <div className="chain-label" style={{ marginBottom: 10 }}>Traceability</div>
      <div className="trace-chain">
        <div className="chain-step">
          <span className="chain-dot"><i /></span>
          <div className="chain-label">Return field</div>
          <div className="chain-body">{field.line} — {field.label} <span className="muted">· {field.sublabel}</span></div>
        </div>

        <div className="chain-step">
          <span className="chain-dot"><i /></span>
          <div className="chain-label">Extracted value</div>
          <div className="chain-body mono" style={{ fontWeight: 600 }}>{field.value}</div>
        </div>

        <div className="chain-step">
          <span className="chain-dot"><i /></span>
          <div className="chain-label">
            {field.origin === 'manual' ? 'Origin' : field.origin === 'calculated' ? 'Inputs' : `Source document${t.sources.length > 1 ? 's' : ''}`}
          </div>
          <div className="chain-body">
            {t.sources.length === 0 && <span className="muted">{t.summary}</span>}
            {t.sources.map((sc, i) => {
              const doc = documents[sc.docId];
              const active = i === srcIdx;
              return (
                <button
                  key={i}
                  onClick={() => setSrcIdx(i)}
                  className="btn btn-sm"
                  style={{
                    display: 'flex', gap: 8, width: '100%', textAlign: 'left', marginBottom: 6,
                    borderColor: active ? 'var(--brand-500)' : 'var(--line)',
                    background: active ? 'var(--brand-50)' : '#fff',
                  }}
                >
                  <Icon name="file" size={15} />
                  <span style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{doc?.title || sc.docId}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{sc.region} · page {sc.page}</div>
                  </span>
                  <span className="mono" style={{ alignSelf: 'center' }}>{sc.raw}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="chain-step">
          <span className="chain-dot"><i /></span>
          <div className="chain-label">Transformation</div>
          <div className="chain-body">
            <div className="mono" style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
              {t.transformation}
            </div>
          </div>
        </div>
      </div>

      {/* Contextual note / warning */}
      {t.warning && (
        <div className="uncertainty-box" style={{ marginTop: 8 }}>
          <strong><Icon name="warning" size={13} style={{ marginRight: 4 }} /> Preparer attention:</strong> {t.warning}
        </div>
      )}
      {t.note && role === 'preparer' && (
        <div className="card card-pad" style={{ marginTop: 12, fontSize: 13 }}>
          <div className="chain-label" style={{ marginBottom: 4 }}>Note</div>
          {t.note}
          {t.verifiedBy && <div className="muted" style={{ marginTop: 6 }}>Verified by {t.verifiedBy}</div>}
        </div>
      )}

      {/* Document viewer */}
      {src && (
        <div style={{ marginTop: 20 }}>
          <div className="chain-label" style={{ marginBottom: 8 }}>Source document</div>
          <DocViewer docId={src.docId} region={src.region} />
        </div>
      )}
    </div>
  );
}

export default function Review() {
  const grouped = useGrouped();
  const loc = useLocation();
  const [selectedId, setSelectedId] = useState(loc.state?.focus || 'f-wages');
  const [srcIdx, setSrcIdx] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => { if (loc.state?.focus) setSelectedId(loc.state.focus); }, [loc.state]);

  const field = returnFields.find((f) => f.id === selectedId);
  const select = (id) => { setSelectedId(id); setSrcIdx(0); };

  return (
    <div className="review-layout">
      {/* LEFT — the return */}
      <div className="review-col left">
        <div className="review-inner">
          <div className="form1040">
            <div className="form-band">
              <h3>Form 1040 — U.S. Individual Income Tax Return</h3>
              <div className="sub">{client.name} · TY{client.taxYear} · {client.returnId}</div>
            </div>
            {grouped.map((g) => (
              <div key={g.section}>
                <div className="form-section-label">{g.section}</div>
                {g.fields.map((f) => {
                  const s = statusMeta[f.status];
                  return (
                    <div
                      key={f.id}
                      className={`field-row ${f.id === selectedId ? 'selected' : ''}`}
                      onClick={() => select(f.id)}
                      role="button" tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(f.id); } }}
                    >
                      <span className="field-line">{f.line.replace('Line ', 'L')}</span>
                      <span>
                        <span className="field-label">{f.label}</span>
                        <div className="field-sub">{f.sublabel}</div>
                      </span>
                      <span>
                        <div className="field-value">{f.value}</div>
                        <div className="field-meta">
                          {f.status === 'ai' && <AiChip />}
                          <Pill cls={s.cls} dot={false}>{s.label}</Pill>
                        </div>
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Click any line to trace it back to its source. Values are simulated — no real parsing.
          </p>
        </div>
      </div>

      {/* RIGHT — traceability + document */}
      <div className="review-col right">
        {field ? (
          <>
            <TracePanel field={field} srcIdx={srcIdx} setSrcIdx={setSrcIdx} />
            <div className="review-inner" style={{ paddingTop: 0 }}>
              {field.status !== 'locked' && (
                <div className="action-bar">
                  <button className="btn btn-ok" onClick={() => setToast(`${field.label} marked verified`)}><Icon name="check" size={14} /> Verify this figure</button>
                  <button className="btn" onClick={() => setToast('Flagged for a second look')}>Flag</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="trace-empty">Select a field to trace it back to its source.</div>
        )}
      </div>

      {toast && <Toast onDone={() => setToast(null)}>{toast}</Toast>}
    </div>
  );
}
