import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../utils/api';

const NAV = [
  { path:'/dashboard',  emoji:'⚡', label:'Dashboard',      roles:['user','admin'] },
  { path:'/map',        emoji:'🗺️', label:'Find Centers',   roles:['user','admin'] },
  { path:'/recycle',    emoji:'♻️', label:'Submit Recycle', roles:['user'] },
  { path:'/rewards',    emoji:'🎁', label:'Rewards Store',  roles:['user'] },
  { path:'/leaderboard',emoji:'🏆', label:'Leaderboard',    roles:['user','admin'] },
  { path:'/admin',      emoji:'🛡️', label:'Admin Panel',    roles:['admin'] },
  { path:'/profile',    emoji:'👤', label:'Profile',         roles:['user','admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread]   = useState(0);
  const [credits, setCredits] = useState(user?.credits ?? 0);

  useEffect(() => {
    notificationsApi.getAll(1).then(r => setUnread(r.unreadCount || 0)).catch(() => {});
  }, []);

  useEffect(() => { setCredits(user?.credits ?? 0); }, [user?.credits]);

  useEffect(() => {
    const h = e => { if (e.detail?.credits != null) setCredits(e.detail.credits); setUnread(n => n + 1); };
    window.addEventListener('credits:updated', h);
    return () => window.removeEventListener('credits:updated', h);
  }, []);

  const navItems = NAV.filter(n => n.roles.includes(user?.role));

  const SidebarContent = () => (
    <div style={{ width:256, background:'#fff', borderRight:'1px solid #e2e8f0', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0 }}>

      {/* Logo */}
      <div style={{ padding:'1.25rem 1.25rem', borderBottom:'1px solid #f1f5f9' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div className="logo-icon">♻️</div>
          <div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:17, color:'#0f172a', lineHeight:1 }}>E-CYCLE</div>
            <div style={{ fontSize:10, color:'#22c55e', fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase' }}>Smart E-Waste</div>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f1f5f9', background:'#f8fafc' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="avatar" style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#22c55e,#15803d)', fontSize:15, fontFamily:'Outfit,sans-serif', fontWeight:700 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontWeight:600, fontSize:13, color:'#1e293b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
            <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'#16a34a', fontWeight:600 }}>🪙 {(credits ?? 0).toLocaleString()} pts</div>
          </div>
          {user?.role === 'admin' && <span className="badge badge-green">Admin</span>}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'.75rem', overflowY:'auto' }}>
        <div style={{ fontSize:'.65rem', fontWeight:700, color:'#94a3b8', letterSpacing:'.1em', textTransform:'uppercase', padding:'.25rem .75rem .5rem' }}>Navigation</div>
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              onClick={() => setMobileOpen(false)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'.6rem .875rem', borderRadius:10, marginBottom:2, textDecoration:'none', transition:'all .15s', background: active ? '#f0fdf4' : 'transparent', color: active ? '#15803d' : '#475569', fontWeight: active ? 600 : 500, fontSize:13.5, borderRight: active ? '3px solid #22c55e' : '3px solid transparent' }}>
              <span style={{ fontSize:16 }}>{item.emoji}</span>
              <span style={{ flex:1 }}>{item.label}</span>
              {item.path === '/profile' && unread > 0 && (
                <span style={{ background:'#22c55e', color:'#fff', fontSize:10, fontWeight:700, width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Credits widget */}
      <div style={{ margin:'0 .75rem .75rem' }}>
        <div className="credits-display">
          <div className="credits-label">Your Credits</div>
          <div className="credits-value">{(credits ?? 0).toLocaleString()}</div>
          <Link to="/recycle" style={{ fontSize:12, color:'#16a34a', fontWeight:600, textDecoration:'none', display:'block', marginTop:4 }}>Earn more →</Link>
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding:'0 .75rem 1rem' }}>
        <button onClick={() => { logout(); }}
          style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'.6rem .875rem', borderRadius:10, background:'transparent', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:13.5, fontWeight:500, transition:'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background='#fee2e2'; e.currentTarget.style.color='#dc2626'; }}
          onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#94a3b8'; }}>
          <span style={{ fontSize:16 }}>🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#f8fafc' }}>
      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.3)', zIndex:40, backdropFilter:'blur(4px)' }} />}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex"><SidebarContent /></div>

      {/* Mobile sidebar */}
      {mobileOpen && <div style={{ position:'fixed', top:0, left:0, zIndex:50, height:'100vh' }}><SidebarContent /></div>}

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Mobile topbar */}
        <header className="lg:hidden" style={{ background:'#fff', borderBottom:'1px solid #e2e8f0', padding:'.875rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30, boxShadow:'0 1px 4px rgba(0,0,0,.07)' }}>
          <button onClick={() => setMobileOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', padding:6, borderRadius:8, color:'#64748b' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>♻️</div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:15, color:'#0f172a' }}>E-CYCLE</span>
          </div>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'#16a34a', fontWeight:600, background:'#f0fdf4', padding:'4px 10px', borderRadius:100 }}>
            🪙 {(credits ?? 0).toLocaleString()}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, padding:'1.5rem', maxWidth:1280, width:'100%', margin:'0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
