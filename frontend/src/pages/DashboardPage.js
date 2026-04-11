import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recycleApi, notificationsApi } from '../utils/api';

const STATUS = {
  pending:      { lbl:'Pending',   cls:'badge-yellow' },
  qr_generated: { lbl:'QR Ready',  cls:'badge-blue' },
  verified:     { lbl:'Verified',  cls:'badge-green' },
  completed:    { lbl:'Completed', cls:'badge-green' },
  rejected:     { lbl:'Rejected',  cls:'badge-red' },
};

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [unread,  setUnread]  = useState(0);

  const load = useCallback(async () => {
    try {
      const [t, n] = await Promise.all([recycleApi.myTransactions(1), notificationsApi.getAll(1)]);
      setTxns(t.transactions?.slice(0,5) || []);
      setUnread(n.unreadCount || 0);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const h = async () => { await refreshUser(); await load(); };
    window.addEventListener('credits:updated', h);
    return () => window.removeEventListener('credits:updated', h);
  }, []); // eslint-disable-line

  const credits = user?.credits ?? 0;
  const rank = credits >= 1000 ? '🥇 Gold' : credits >= 500 ? '🥈 Silver' : '🥉 Bronze';

  const STATS = [
    { icon:'🪙', lbl:'Total Credits',   val:(credits).toLocaleString(),               sub:'Available',   color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
    { icon:'♻️', lbl:'Items Recycled',  val: user?.totalRecycled || 0,                sub:'Total drops', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe' },
    { icon:'⚖️', lbl:'Weight Recycled', val:`${(user?.totalItemsWeight||0).toFixed(1)} kg`, sub:'kg total',color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
    { icon:'🏅', lbl:'Your Rank',       val: rank,                                    sub:'By credits',  color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom:'1.75rem', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:26, color:'#0f172a', margin:'0 0 4px' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Your e-waste recycling dashboard</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          {unread > 0 && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:100, padding:'6px 14px', fontSize:13, color:'#15803d', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              🔔 {unread} new
            </div>
          )}
          <Link to="/recycle" className="btn btn-green">+ Submit Recycling</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:'1.75rem' }}>
        {STATS.map(s => (
          <div key={s.lbl} style={{ background:'#fff', border:`1px solid ${s.border}`, borderRadius:16, padding:'1.25rem 1.5rem', boxShadow:'0 1px 4px rgba(0,0,0,.06)', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.color, opacity:.7 }} />
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>{s.lbl}</div>
                <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:24, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>{s.sub}</div>
              </div>
              <div style={{ width:42, height:42, borderRadius:11, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom:'1.75rem' }}>
        <div className="section-tag" style={{ marginBottom:12 }}>Quick Actions</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
          {[
            { to:'/map',        icon:'🗺️', title:'Find Centers',  desc:'Locate nearest drop-off', color:'#2563eb', bg:'#eff6ff' },
            { to:'/recycle',    icon:'♻️', title:'Submit E-Waste', desc:'Get a QR code for drop',  color:'#16a34a', bg:'#f0fdf4' },
            { to:'/leaderboard',icon:'🏆', title:'Leaderboard',   desc:'See your global ranking', color:'#d97706', bg:'#fffbeb' },
          ].map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration:'none' }}>
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:12, transition:'all .2s', cursor:'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#86efac'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(34,197,94,.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ width:40, height:40, borderRadius:10, background:a.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{a.icon}</div>
                <div>
                  <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:2 }}>{a.title}</div>
                  <div style={{ fontSize:12, color:'#94a3b8' }}>{a.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div className="section-tag">Recent Activity</div>
          <Link to="/recycle" style={{ fontSize:13, color:'#16a34a', fontWeight:600, textDecoration:'none' }}>View all →</Link>
        </div>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.06)' }}>
          {loading ? (
            <div style={{ padding:'1.5rem' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:52, marginBottom:8 }} />)}
            </div>
          ) : txns.length === 0 ? (
            <div style={{ padding:'3rem', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>♻️</div>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:16, color:'#334155', marginBottom:6 }}>No activity yet</div>
              <p style={{ fontSize:13, color:'#94a3b8', marginBottom:'1rem' }}>Submit your first e-waste drop to get started</p>
              <Link to="/recycle" className="btn btn-green" style={{ fontSize:13 }}>Start Recycling</Link>
            </div>
          ) : txns.map((tx, i) => {
            const st = STATUS[tx.status] || STATUS.pending;
            return (
              <div key={tx._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.875rem 1.25rem', borderBottom: i < txns.length-1 ? '1px solid #f1f5f9' : 'none', transition:'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background='#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background: tx.status==='completed'?'#f0fdf4': tx.status==='rejected'?'#fef2f2':'#eff6ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                    {tx.status==='completed'?'✅':tx.status==='rejected'?'❌':'⏳'}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13, color:'#1e293b' }}>{tx.center?.name || 'Recycling Center'}</div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>{tx.totalWeight}kg · {tx.items?.length} item(s)</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span className={`badge ${st.cls}`}>{st.lbl}</span>
                  <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:15, color:'#16a34a' }}>+{tx.creditsEarned}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
