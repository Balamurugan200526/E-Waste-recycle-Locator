import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(form.email, form.password); }
    catch (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(170deg,#f0fdf4 0%,#fff 60%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', fontFamily:'Plus Jakarta Sans,sans-serif', position:'relative', overflow:'hidden' }}>
      <div className="blob" style={{ top:'-60px', right:'8%', width:280, height:280, background:'radial-gradient(circle,rgba(34,197,94,.12),transparent 70%)' }} />
      <div className="blob" style={{ bottom:'-30px', left:'5%', width:200, height:200, background:'radial-gradient(circle,rgba(34,197,94,.08),transparent 70%)' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }} className="animate-slide-up">
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div className="logo-icon" style={{ width:52, height:52, borderRadius:16, fontSize:24 }}>♻️</div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a' }}>E-CYCLE</span>
          </Link>
          <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:24, color:'#0f172a', margin:'1rem 0 4px' }}>Welcome back</h1>
          <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Sign in to continue recycling</p>
        </div>

        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:'2rem', boxShadow:'0 8px 32px rgba(0,0,0,.08)' }}>
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'.75rem 1rem', color:'#dc2626', fontSize:13, marginBottom:'1.25rem' }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>Email address</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>Password</label>
              <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" className="input-field" />
            </div>
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'.75rem', fontSize:12, color:'#15803d' }}>
              <strong>Demo:</strong> demo@ecycle.com / Demo@123456<br />
              <strong>Admin:</strong> admin@ecycle.com / Admin@123456
            </div>
            <button type="submit" disabled={loading} className="btn btn-green" style={{ width:'100%', padding:'.75rem', fontSize:15 }}>
              {loading
                ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                    <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTop:'2px solid #fff', borderRadius:'50%' }} className="animate-spin" />
                    Signing in...
                  </span>
                : 'Sign In →'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:13, color:'#64748b', marginTop:'1.25rem', marginBottom:0 }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color:'#16a34a', fontWeight:600, textDecoration:'none' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
