import { createContext, useContext, useState } from 'react';
import { Routes, Route, NavLink, Link, useLocation, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Review from './pages/Review.jsx';
import TrustAI from './pages/TrustAI.jsx';
import { client, returnFields } from './data/returnData.js';
import Icon from './components/Icon.jsx';
import { getAiSuggestions } from './data/aiData.js';

// ---- Role context (Challenge 5 flavor, kept light) --------------------
// Two roles switchable from the top bar. The client role sees a reduced
// surface; the preparer sees everything. Demonstrates one shell adapting.
const RoleCtx = createContext(null);
export const useRole = () => useContext(RoleCtx);

const ROLES = {
  preparer: { name: 'Daniel Okafor', initials: 'DO', label: 'Preparer · CPA' },
  client: { name: 'Priya Raman', initials: 'PR', label: 'Client' },
};

function Sidebar() {
  const { role } = useRole();
  const reviewCount = returnFields.filter((f) => f.status === 'review' || f.status === 'ai').length;
  const aiCount = getAiSuggestions().length;
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">GG</div>
        <div>
          <div className="brand-name">GreenGrowth</div>
          <div className="brand-sub">Tax Platform</div>
        </div>
      </div>

      <div className="nav-section-label">Workspace</div>
      <NavLink to="/" end className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
        <span className="ico"><Icon name="grid" /></span> Overview
      </NavLink>
      <NavLink to="/review" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
        <span className="ico"><Icon name="fileCheck" /></span> Return Review
        {reviewCount > 0 && <span className="nav-badge">{reviewCount}</span>}
      </NavLink>
      <NavLink to="/ai-review" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
        <span className="ico"><Icon name="sparkle" /></span> AI Review
        {aiCount > 0 && <span className="nav-badge">{aiCount}</span>}
      </NavLink>

      <div className="nav-section-label">Client</div>
      <div className="nav-item" style={{ cursor: 'default' }}>
        <span className="ico"><Icon name="user" /></span> {client.name}
      </div>
      <div className="nav-item" style={{ cursor: 'default', opacity: role === 'client' ? 1 : 0.75 }}>
        <span className="ico"><Icon name="folder" /></span> Documents <span className="nav-badge" style={{ background: '#2b4a45' }}>4</span>
      </div>

      <div className="sidebar-foot">
        {client.returnId} · TY{client.taxYear}
        <br />Prototype · fake data only
      </div>
    </aside>
  );
}

function Crumbs() {
  const loc = useLocation();
  const map = {
    '/': ['Overview'],
    '/review': ['Return Review', client.name],
    '/ai-review': ['AI Review', 'Firm-wide'],
  };
  const trail = map[loc.pathname] || ['Overview'];
  return (
    <div className="crumbs">
      <Link to="/">GreenGrowth</Link>
      <span className="sep">/</span>
      {trail.map((t, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <span className="sep">/</span>}
          <span className={i === trail.length - 1 ? 'current' : ''}>{t}</span>
        </span>
      ))}
    </div>
  );
}

function TopBar() {
  const { role, setRole } = useRole();
  const r = ROLES[role];
  return (
    <header className="topbar">
      <Crumbs />
      <div className="topbar-spacer" />
      <div className="role-switch">
        <span className="muted" style={{ fontSize: 12 }}>Viewing as</span>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="preparer">Preparer (CPA)</option>
          <option value="client">Client</option>
        </select>
      </div>
      <div className="avatar" title={r.label}>{r.initials}</div>
    </header>
  );
}

function Layout({ children }) {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <TopBar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState('preparer');
  return (
    <RoleCtx.Provider value={{ role, setRole }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/review" element={<Review />} />
          <Route path="/ai-review" element={<TrustAI />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </RoleCtx.Provider>
  );
}
