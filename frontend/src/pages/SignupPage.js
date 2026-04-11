import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try { await signup(form.name, form.email, form.password); }
    catch (err) { setError(err.message); setLoading(false); }
  };

  const strength = (() => {
    const p = form.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const SC = ['','#ef4444','#f97316','#eab308','#22c55e','#16a34a'];
  const SL = ['','Weak','Fair','Good','Strong','Very strong'];

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(170deg,#f0fdf4 0%,#fff 60%)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', fontFamily:'Plus Jakarta Sans,sans-serif', position:'relative', overflow:'hidden' }}>
      <div className="blob" style={{ top:'-60px', right:'8%', width:280, height:280, background:'radial-gradient(circle,rgba(34,197,94,.12),transparent 70%)' }} />

      <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }} className="animate-slide-up">
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <Link to="/" style={{ textDecoration:'none', display:'inline-flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div className="logo-icon" style={{ width:52, height:52, borderRadius:16, fontSize:24 }}>♻️</div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a' }}>E-CYCLE</span>
          </Link>
          <h1 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:24, color:'#0f172a', margin:'1rem 0 4px' }}>Create your account</h1>
          <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Start earning credits for recycling today</p>
        </div>

        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:'2rem', boxShadow:'0 8px 32px rgba(0,0,0,.08)' }}>
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'.75rem 1rem', color:'#dc2626', fontSize:13, marginBottom:'1.25rem' }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { name:'name',            label:'Full name',        type:'text',     placeholder:'Your name' },
              { name:'email',           label:'Email address',    type:'email',    placeholder:'you@example.com' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>{f.label}</label>
                <input type={f.type} name={f.name} required value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} className="input-field" />
              </div>
            ))}
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>Password</label>
              <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="Min. 6 chars with letters & numbers" className="input-field" />
              {form.password && (
                <div style={{ marginTop:6 }}>
                  <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ height:3, flex:1, borderRadius:2, background: i <= strength ? SC[strength] : '#e2e8f0', transition:'all .3s' }} />
                    ))}
                  </div>
                  {strength > 0 && <div style={{ fontSize:11, color:SC[strength], fontWeight:600 }}>{SL[strength]}</div>}
                </div>
              )}
            </div>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>Confirm password</label>
              <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn btn-green" style={{ width:'100%', padding:'.75rem', fontSize:15, marginTop:4 }}>
              {loading
                ? <span style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
                    <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTop:'2px solid #fff', borderRadius:'50%' }} className="animate-spin" />
                    Creating account...
                  </span>
                : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign:'center', fontSize:13, color:'#64748b', marginTop:'1.25rem', marginBottom:0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#16a34a', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
