import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recycleApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const GRADIENTS = [
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#94a3b8,#64748b)',
  'linear-gradient(135deg,#cd7c2f,#a16207)',
];
const MEDAL = ['🥇','🥈','🥉'];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = () => {
      setLoading(true);
      recycleApi.leaderboard().then(r => setLeaders(r.leaderboard || [])).catch(() => {}).finally(() => setLoading(false));
    };
    load();
    window.addEventListener('credits:updated', load);
    return () => window.removeEventListener('credits:updated', load);
  }, []);

  const myRank = leaders.findIndex(u => u._id === user?._id) + 1;

  const colors = ['linear-gradient(135deg,#22c55e,#15803d)','linear-gradient(135deg,#8b5cf6,#6d28d9)','linear-gradient(135deg,#38bdf8,#0284c7)','linear-gradient(135deg,#f87171,#dc2626)','linear-gradient(135deg,#fb923c,#ea580c)'];

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(170deg,#f0fdf4 0%,#f8fafc 100%)', fontFamily:'Plus Jakarta Sans,sans-serif' }}>
      <div className="blob" style={{ position:'fixed', top:'-60px', right:'8%', width:280, height:280, background:'radial-gradient(circle,rgba(34,197,94,.10),transparent 70%)', pointerEvents:'none' }} />

      {/* Sticky top nav */}
      <div style={{ background:'rgba(255,255,255,.95)', borderBottom:'1px solid #e2e8f0', padding:'14px 5%', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, backdropFilter:'blur(10px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="logo-icon">♻️</div>
          <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:18, color:'#0f172a' }}>E-CYCLE</span>
        </div>
        {user
          ? <Link to="/dashboard" className="btn btn-outline" style={{ fontSize:13 }}>← Dashboard</Link>
          : <Link to="/login"     className="btn btn-green"   style={{ fontSize:13 }}>Join Now</Link>
        }
      </div>

      <div style={{ maxWidth:600, margin:'0 auto', padding:'2.5rem 1rem' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🏆</div>
          <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:28, color:'#0f172a', margin:'0 0 8px' }}>Leaderboard</h1>
          <p style={{ fontSize:14, color:'#64748b', margin:0 }}>Top recyclers making a difference</p>
          {myRank > 0 && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:100, padding:'6px 16px', fontSize:13, fontWeight:600, color:'#15803d', marginTop:12 }}>
              Your rank: <strong>#{myRank}</strong>
            </div>
          )}
        </div>

        {/* Top 3 podium */}
        {!loading && leaders.length >= 3 && (
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:12, marginBottom:24 }}>
            {[leaders[1], leaders[0], leaders[2]].map((u, i) => {
              const actualRank = [2,1,3][i];
              const heights = [80, 104, 68];
              return (
                <div key={u._id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ fontSize:22 }}>{MEDAL[actualRank-1]}</div>
                  <div className="avatar" style={{ width:40, height:40, borderRadius:'50%', background: GRADIENTS[actualRank-1], fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:14 }}>
                    {u.name[0].toUpperCase()}
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px 10px 0 0', width:96, height:heights[i], display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', paddingBottom:10, boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
                    <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:12, color:'#0f172a', textAlign:'center', padding:'0 4px', lineHeight:1.2 }}>{u.name.split(' ')[0]}</div>
                    <div style={{ fontSize:11, color:'#16a34a', fontWeight:700, fontFamily:'JetBrains Mono,monospace' }}>{u.credits.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,.06)' }}>
          {loading
            ? Array.from({length:6}).map((_,i) => <div key={i} className="skeleton" style={{ height:60, margin:'8px 16px', borderRadius:10 }} />)
            : leaders.map((u, i) => (
              <div key={u._id} className="leader-row" style={{ background: u._id === user?._id ? '#f0fdf4' : 'transparent' }}>
                <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:16, width:28, textAlign:'center', color: i===0?'#d97706':i===1?'#64748b':i===2?'#b45309':'#94a3b8' }}>
                  {i < 3 ? MEDAL[i] : `#${i+1}`}
                </span>
                <div className="avatar" style={{ background: colors[i % colors.length], fontFamily:'Outfit,sans-serif', fontWeight:700 }}>
                  {u.name[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:'#1e293b', display:'flex', alignItems:'center', gap:6 }}>
                    {u.name}
                    {u._id === user?._id && <span className="badge badge-green">you</span>}
                  </div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{u.totalRecycled} items · {(u.totalItemsWeight||0).toFixed(1)} kg</div>
                </div>
                <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:16, color:'#16a34a' }}>
                  {u.credits.toLocaleString()} <span style={{ fontSize:11, color:'#94a3b8', fontWeight:400 }}>pts</span>
                </div>
              </div>
            ))
          }
          {!loading && leaders.length === 0 && (
            <div style={{ padding:'3rem', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🏆</div>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:16, color:'#334155' }}>No entries yet</div>
              <p style={{ fontSize:13, color:'#94a3b8', marginTop:6 }}>Be the first to recycle!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
