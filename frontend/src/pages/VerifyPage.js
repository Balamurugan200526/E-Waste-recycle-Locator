/**
 * VerifyPage — QR Scan Landing Page
 * Works on localhost (same browser tab) AND on phones (same WiFi)
 * No login required — protected by company password only
 * Uses /api proxy so works on any port/host
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

export default function VerifyPage() {
  const { token } = useParams();

  const [preview, setPreview]       = useState(null);
  const [loadingPreview, setLoading] = useState(true);
  const [previewError, setPreviewErr]= useState('');
  const [codeword, setCodeword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [verifying, setVerifying]   = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');
  const inputRef = useRef(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!token || hasFetched.current) return;
    hasFetched.current = true;

    fetch(`${process.env.REACT_APP_API_URL || "https://ecycle-backend-lue6.onrender.com/api"}/recycle/scan/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setPreviewErr(data.error);
        else setPreview(data);
      })
      .catch(() => setPreviewErr('Cannot reach server. Make sure backend is running on port 5000.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleVerify = async e => {
    e.preventDefault();
    if (!codeword.trim()) return setError('Please enter the company password');
    setError(''); setVerifying(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "https://ecycle-backend-lue6.onrender.com/api"}/recycle/verify-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, codeword: codeword.trim() })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed'); setVerifying(false); return; }
      setResult(data);
    } catch {
      setError('Cannot reach server. Check connection.');
    }
    setVerifying(false);
  };

  const card  = { background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:'2rem', boxShadow:'0 8px 32px rgba(0,0,0,.09)', width:'100%', maxWidth:420 };
  const page  = { minHeight:'100vh', background:'linear-gradient(170deg,#f0fdf4 0%,#fff 60%)', fontFamily:'Plus Jakarta Sans,sans-serif', padding:'1.5rem 1rem', display:'flex', alignItems:'center', justifyContent:'center' };
  const logo  = { display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:'1.5rem' };
  const row   = { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.4rem 0', borderBottom:'1px solid #f1f5f9', fontSize:13 };

  // ── Success ─────────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div style={page}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <div style={{ ...card, textAlign:'center', animation:'slideUp .4s ease-out' }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 1rem', boxShadow:'0 4px 14px rgba(34,197,94,.3)' }}>♻️</div>
          <div style={{ fontSize:48, marginBottom:8 }}>🎉</div>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:22, color:'#0f172a', margin:'0 0 6px' }}>Credits Awarded!</h2>
          <p style={{ color:'#64748b', fontSize:13, margin:'0 0 1.5rem' }}>Transaction verified successfully</p>

          <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1px solid #86efac', borderRadius:16, padding:'1.25rem', marginBottom:'1.25rem' }}>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'2.5rem', color:'#16a34a', lineHeight:1 }}>+{result.creditsEarned}</div>
            <div style={{ color:'#16a34a', fontWeight:600, fontSize:12, marginTop:4 }}>credits added to account</div>
          </div>

          <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:'1rem', marginBottom:'1.25rem', textAlign:'left' }}>
            {[['User', result.userName],['Center', result.centerName],['Weight', `${result.totalWeight} kg`],['Total Credits', result.totalCredits?.toLocaleString()]].map(([k,v]) => (
              <div key={k} style={row}>
                <span style={{ color:'#94a3b8' }}>{k}</span>
                <span style={{ fontWeight:700, color: k==='Total Credits'?'#16a34a':'#0f172a' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'.75rem', fontSize:12, color:'#16a34a', marginBottom:'.75rem' }}>
            ✅ User notified in real time via the app
          </div>
          <p style={{ fontSize:11, color:'#cbd5e1', margin:0 }}>You can close this tab now</p>
        </div>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loadingPreview) {
    return (
      <div style={{ ...page, flexDirection:'column', gap:16 }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width:44, height:44, border:'4px solid #bbf7d0', borderTop:'4px solid #22c55e', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Loading QR details…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (previewError) {
    return (
      <div style={page}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ ...card, textAlign:'center' }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, margin:'0 auto 1.5rem' }}>♻️</div>
          <div style={{ fontSize:40, marginBottom:10 }}>❌</div>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:20, color:'#0f172a', margin:'0 0 10px' }}>QR Error</h2>
          <p style={{ fontSize:13, color:'#dc2626', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'.75rem', margin:'0 0 1rem' }}>{previewError}</p>
          <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>Ask the user to generate a fresh QR code</p>
        </div>
      </div>
    );
  }

  const { preview: p, alreadyVerified, expired } = preview || {};
  const blocked = alreadyVerified || expired;

  // ── Main form ────────────────────────────────────────────────────────────────
  return (
    <div style={page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

      <div style={{ ...card, animation:'slideUp .4s ease-out' }}>
        {/* Logo */}
        <div style={logo}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 2px 10px rgba(34,197,94,.3)' }}>♻️</div>
          <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:19, color:'#0f172a' }}>E-CYCLE</span>
        </div>

        <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:20, color:'#0f172a', margin:'0 0 4px', textAlign:'center' }}>QR Verification</h2>
        <p style={{ fontSize:12, color:'#94a3b8', textAlign:'center', margin:'0 0 1.25rem' }}>Recycling center staff portal</p>

        {/* Transaction preview */}
        {p && (
          <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, padding:'1rem', marginBottom:'1.25rem' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Transaction Details</div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, paddingBottom:10, borderBottom:'1px solid #f1f5f9' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:15, color:'#fff', flexShrink:0 }}>
                {p.userName?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:'#0f172a' }}>{p.userName}</div>
                <div style={{ fontSize:11, color:'#94a3b8' }}>Recycling user</div>
              </div>
            </div>
            {[['Center', p.centerName],['Items', `${p.itemCount} item(s) · ${p.totalWeight} kg`],['Credits to Award', `+${p.creditsEarned}`],['Expires', new Date(p.expiresAt).toLocaleString()]].map(([k,v]) => (
              <div key={k} style={row}>
                <span style={{ color:'#94a3b8' }}>{k}</span>
                <span style={{ fontWeight:700, color: k==='Credits to Award'?'#16a34a':'#0f172a', fontSize: k==='Credits to Award'?15:13 }}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Status banners */}
        {alreadyVerified && (
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'.75rem', fontSize:13, color:'#16a34a', textAlign:'center', marginBottom:'1rem' }}>
            ✅ Already verified — credits were awarded
          </div>
        )}
        {expired && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'.75rem', fontSize:13, color:'#dc2626', textAlign:'center', marginBottom:'1rem' }}>
            ⏰ QR expired — ask user to generate a new one
          </div>
        )}

        {/* Password form */}
        {!blocked && (
          <form onSubmit={handleVerify}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 }}>
              🔐 Company Password
            </label>
            <div style={{ position:'relative', marginBottom:'1rem' }}>
              <input
                ref={inputRef}
                type={showPw ? 'text' : 'password'}
                value={codeword}
                onChange={e => { setCodeword(e.target.value); setError(''); }}
                placeholder="Enter staff password"
                autoComplete="off"
                autoFocus
                required
                style={{ width:'100%', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:12, padding:'11px 42px 11px 14px', fontFamily:'Plus Jakarta Sans,sans-serif', fontSize:16, color:'#0f172a', outline:'none', boxSizing:'border-box', transition:'border-color .18s' }}
                onFocus={e => e.target.style.borderColor='#22c55e'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'}
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#94a3b8', padding:2 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            <p style={{ fontSize:11, color:'#94a3b8', margin:'-10px 0 14px' }}>Only authorized staff can verify recycling drops</p>

            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'.75rem', color:'#dc2626', fontSize:13, marginBottom:'1rem' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={verifying || !codeword.trim()}
              style={{ width:'100%', padding:'.875rem', fontSize:15, fontFamily:'Outfit,sans-serif', fontWeight:700, background: verifying || !codeword.trim() ? '#e2e8f0' : '#22c55e', color: verifying || !codeword.trim() ? '#94a3b8' : '#fff', border:'none', borderRadius:12, cursor: verifying || !codeword.trim() ? 'not-allowed' : 'pointer', transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow: codeword.trim() && !verifying ? '0 2px 10px rgba(34,197,94,.28)' : 'none' }}>
              {verifying
                ? <><span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,.3)', borderTop:'2.5px solid #fff', borderRadius:'50%', animation:'spin .7s linear infinite', display:'inline-block' }} /> Verifying…</>
                : `✅ Award +${p?.creditsEarned || '?'} Credits`}
            </button>
          </form>
        )}

        <p style={{ textAlign:'center', fontSize:11, color:'#e2e8f0', marginTop:'1.25rem', marginBottom:0 }}>
          E-CYCLE Staff Portal · Authorized use only
        </p>
      </div>
    </div>
  );
}