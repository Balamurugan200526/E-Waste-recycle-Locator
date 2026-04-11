import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../utils/api';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handleSave = async e => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      const res = await authApi.updateProfile({ name });
      updateUser(res.user);
      setMsg('✅ Profile updated!');
    } catch (err) { setMsg('❌ ' + err.message); }
    setSaving(false);
  };

  const handlePw = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return setPwMsg('❌ Passwords do not match');
    setPwLoading(true); setPwMsg('');
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('✅ Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setPwMsg('❌ ' + err.message); }
    setPwLoading(false);
  };

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
  const PROFILE_STATS = [
    { label: 'Credits',  value: (user?.credits ?? 0).toLocaleString(), color: 'var(--green-600)' },
    { label: 'Recycled', value: user?.totalRecycled || 0,              color: '#2563eb' },
    { label: 'kg Total', value: (user?.totalItemsWeight || 0).toFixed(1), color: '#7c3aed' },
  ];

  return (
    <div style={{ maxWidth: 580, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--gray-900)', margin: '0 0 4px' }}>Profile</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, margin: 0 }}>Manage your account details</p>
      </div>

      {/* Avatar & stats */}
      <div style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, padding: '1.5rem', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, var(--green-400), var(--green-600))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 28, color: 'white', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--gray-900)' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{user?.email}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Member since {memberSince}</div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {PROFILE_STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <form onSubmit={handleSave} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, padding: '1.5rem', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Edit Profile</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Display Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required minLength={2} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>Email</label>
            <input type="email" value={user?.email} disabled className="input-field" />
          </div>
        </div>
        {msg && <div style={{ marginTop: 10, fontSize: 13, color: msg.startsWith('✅') ? 'var(--green-600)' : '#dc2626' }}>{msg}</div>}
        <button type="submit" disabled={saving} className="btn-primary" style={{ marginTop: 14, width: '100%', padding: '0.625rem' }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={handlePw} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: 16, padding: '1.5rem', boxShadow: 'var(--shadow-sm)', marginBottom: 16 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Change Password</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm New Password']].map(([field, label]) => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 6 }}>{label}</label>
              <input type="password" value={pwForm[field]} onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))} className="input-field" required />
            </div>
          ))}
        </div>
        {pwMsg && <div style={{ marginTop: 10, fontSize: 13, color: pwMsg.startsWith('✅') ? 'var(--green-600)' : '#dc2626' }}>{pwMsg}</div>}
        <button type="submit" disabled={pwLoading} className="btn-secondary" style={{ marginTop: 14, width: '100%', padding: '0.625rem' }}>
          {pwLoading ? 'Changing…' : 'Change Password'}
        </button>
      </form>

      {/* Danger zone */}
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Account</div>
        <button onClick={logout} style={{ background: 'white', border: '1px solid #fecaca', borderRadius: 10, padding: '0.5rem 1.25rem', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
