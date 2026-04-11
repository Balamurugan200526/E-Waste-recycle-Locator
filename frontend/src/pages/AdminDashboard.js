import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../utils/api';
import { useSocket } from '../context/SocketContext';

const StatBox = ({ icon, value, label, color = 'var(--green-600)', bg = 'var(--green-50)', border = 'var(--green-200)' }) => (
  <div style={{ background: 'white', border: `1px solid ${border}`, borderRadius: 14, padding: '1.1rem 1.25rem', boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, opacity: 0.7 }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 24, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{label}</div>
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [creditModal, setCreditModal] = useState(null);
  const [creditForm, setCreditForm] = useState({ amount: '', action: 'add', reason: '' });
  const [creditMsg, setCreditMsg] = useState('');
  const [broadcast, setBroadcast] = useState({ title: '', message: '' });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const { isConnected } = useSocket();

  const loadStats = useCallback(async () => { try { const r = await adminApi.stats(); setStats(r); } catch {} }, []);
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try { const r = await adminApi.users(1, search); setUsers(r.users || []); } catch {}
    setLoading(false);
  }, [search]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);

  const handleCredits = async () => {
    setCreditMsg('');
    try {
      await adminApi.updateCredits(creditModal._id, parseFloat(creditForm.amount), creditForm.action, creditForm.reason);
      setCreditMsg('✅ Credits updated');
      loadUsers();
    } catch (err) { setCreditMsg('❌ ' + err.message); }
  };

  const handleBroadcast = async e => {
    e.preventDefault(); setBroadcastMsg('');
    try { const r = await adminApi.broadcast(broadcast.title, broadcast.message); setBroadcastMsg('✅ ' + r.message); setBroadcast({ title: '', message: '' }); }
    catch (err) { setBroadcastMsg('❌ ' + err.message); }
  };

  const TABS = ['overview', 'users', 'broadcast'];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--gray-900)', margin: '0 0 4px' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, margin: 0 }}>Manage users, credits, and analytics</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'white', border: `1px solid ${isConnected ? 'var(--green-200)' : 'var(--gray-200)'}`, borderRadius: 100, padding: '6px 14px', fontSize: 13, color: isConnected ? 'var(--green-600)' : 'var(--gray-400)', fontWeight: 600 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: isConnected ? 'var(--green-500)' : 'var(--gray-300)' }} />
          {isConnected ? 'Live' : 'Offline'}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', borderRadius: 12, padding: 4, width: 'fit-content', marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '0.5rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.15s', background: tab === t ? 'white' : 'transparent', color: tab === t ? 'var(--gray-800)' : 'var(--gray-500)', boxShadow: tab === t ? 'var(--shadow-sm)' : 'none' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 18 }}>
            <StatBox icon="👤" value={stats?.stats.totalUsers ?? '—'} label="Total Users" />
            <StatBox icon="♻️" value={stats?.stats.completedTransactions ?? '—'} label="Completed Recycles" color="#2563eb" bg="#eff6ff" border="#bfdbfe" />
            <StatBox icon="🪙" value={(stats?.stats.totalCreditsDistributed || 0).toLocaleString()} label="Credits Distributed" color="#d97706" bg="#fffbeb" border="#fde68a" />
            <StatBox icon="⚖️" value={`${(stats?.stats.totalWeightRecycled || 0).toFixed(1)}kg`} label="Weight Recycled" color="#7c3aed" bg="#f5f3ff" border="#ddd6fe" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Recent Users', data: stats?.recentUsers, renderRow: u => ({ left: u.name, sub: u.email, right: `${u.credits} pts` }) },
              { title: 'Recent Transactions', data: stats?.recentTransactions, renderRow: tx => ({ left: tx.user?.name || 'User', sub: `${tx.center?.name} · ${tx.totalWeight}kg`, right: `+${tx.creditsEarned}` }) }
            ].map(({ title, data, renderRow }) => (
              <div key={title} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>{title}</div>
                {(data || []).map((item, i) => { const r = renderRow(item); return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < data.length - 1 ? 10 : 0, marginBottom: i < data.length - 1 ? 10 : 0, borderBottom: i < data.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)' }}>{r.left}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{r.sub}</div>
                    </div>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--green-600)' }}>{r.right}</span>
                  </div>
                );})}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div>
          <input type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} className="input-field" style={{ maxWidth: 340, marginBottom: 14 }} />
          <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-clean">
                <thead><tr>{['User','Email','Credits','Recycled','Status','Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading…</td></tr>
                  : users.map(u => (
                    <tr key={u._id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, var(--green-400), var(--green-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, fontSize: 12, color: 'white' }}>{u.name[0]}</div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                      </div></td>
                      <td style={{ fontSize: 12, color: 'var(--gray-500)' }}>{u.email}</td>
                      <td><span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--green-600)', fontSize: 14 }}>{(u.credits||0).toLocaleString()}</span></td>
                      <td style={{ fontSize: 13 }}>{u.totalRecycled||0}</td>
                      <td><span className={u.isActive ? 'badge-green' : 'badge-red'}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td><div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setCreditModal(u); setCreditMsg(''); setCreditForm({ amount: '', action: 'add', reason: '' }); }} className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>Credits</button>
                        <button onClick={async () => { try { await adminApi.toggleUserStatus(u._id); loadUsers(); } catch {} }} style={{ fontSize: 11, padding: '4px 10px', border: `1px solid ${u.isActive ? '#fecaca' : 'var(--green-200)'}`, borderRadius: 8, background: 'transparent', color: u.isActive ? '#dc2626' : 'var(--green-600)', cursor: 'pointer', fontWeight: 600 }}>
                          {u.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'broadcast' && (
        <div style={{ maxWidth: 500 }}>
          <form onSubmit={handleBroadcast} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Send Broadcast</div>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginBottom: 16, marginTop: 4 }}>Send a real-time notification to all users.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Title</label>
                <input type="text" required value={broadcast.title} onChange={e => setBroadcast(b => ({ ...b, title: e.target.value }))} className="input-field" placeholder="Important update!" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Message</label>
                <textarea required rows={4} value={broadcast.message} onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))} className="input-field" style={{ resize: 'vertical' }} placeholder="Your message…" />
              </div>
            </div>
            {broadcastMsg && <div style={{ marginTop: 10, fontSize: 13, color: broadcastMsg.startsWith('✅') ? 'var(--green-600)' : '#dc2626' }}>{broadcastMsg}</div>}
            <button type="submit" className="btn-primary" style={{ marginTop: 14, width: '100%', padding: '0.625rem' }}>📡 Send to All Users</button>
          </form>
        </div>
      )}

      {/* Credits modal */}
      {creditModal && (
        <div onClick={() => setCreditModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 20, padding: '1.75rem', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--gray-900)', margin: '0 0 4px' }}>Manage Credits</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '0 0 18px' }}>User: <strong>{creditModal.name}</strong> · Current: <strong style={{ color: 'var(--green-600)' }}>{creditModal.credits}</strong></p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['add', 'remove'].map(a => (
                <button key={a} type="button" onClick={() => setCreditForm(f => ({ ...f, action: a }))} style={{ flex: 1, padding: '0.5rem', borderRadius: 10, border: `2px solid ${creditForm.action === a ? 'var(--green-500)' : 'var(--gray-200)'}`, background: creditForm.action === a ? 'var(--green-50)' : 'white', color: creditForm.action === a ? 'var(--green-700)' : 'var(--gray-500)', fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
                  {a} Credits
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="number" min="1" placeholder="Amount" value={creditForm.amount} onChange={e => setCreditForm(f => ({ ...f, amount: e.target.value }))} className="input-field" />
              <input type="text" placeholder="Reason (optional)" value={creditForm.reason} onChange={e => setCreditForm(f => ({ ...f, reason: e.target.value }))} className="input-field" />
            </div>
            {creditMsg && <div style={{ marginTop: 10, fontSize: 13, color: creditMsg.startsWith('✅') ? 'var(--green-600)' : '#dc2626' }}>{creditMsg}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleCredits} disabled={!creditForm.amount} className="btn-primary" style={{ flex: 1 }}>Confirm</button>
              <button onClick={() => setCreditModal(null)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
