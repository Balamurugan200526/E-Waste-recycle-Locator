import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '🗺️', title: 'Smart GPS Locator',  desc: 'Find the nearest certified e-waste center in seconds using live GPS. Covers all 36 Indian states and UTs.', bg: '#f0fdf4' },
  { icon: '🪙', title: 'Credit Rewards',       desc: 'Earn points for every kilogram you recycle. Credits are instantly applied the moment your drop is verified.', bg: '#fffbeb' },
  { icon: '📱', title: 'QR Verification',      desc: 'Generate a QR code for your drop. Staff scan it at the center — fraud-proof, instant, no paperwork.',         bg: '#eff6ff' },
  { icon: '🏆', title: 'Live Leaderboard',     desc: 'Compete with recyclers nationwide. Watch your rank rise in real time as credits accumulate.',                  bg: '#fdf4ff' },
  { icon: '🛡️', title: 'GPS Anti-Fraud',       desc: '500m radius validation confirms you are physically at the center before any credits are awarded.',             bg: '#fff1f2' },
  { icon: '⚡', title: 'Real-Time Updates',    desc: 'Live WebSocket push notifications tell you the instant credits land — no refresh needed.',                     bg: '#f0fdf4' },
];

const STATS = [
  { val: '50K+', lbl: 'kg Recycled' },
  { val: '12K+', lbl: 'Active Users' },
  { val: '54',   lbl: 'Drop Centers' },
  { val: '5M+',  lbl: 'Credits Issued' },
];

const LEADERS = [
  { rank: '🥇', initials: 'AR', name: 'Arjun R.',      city: 'Chennai',   drops: 18, pts: 2840, bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { rank: '🥈', initials: 'PS', name: 'Priya S.',      city: 'Bengaluru', drops: 14, pts: 2210, bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { rank: '🥉', initials: 'MK', name: 'Mohammed K.',   city: 'Mumbai',    drops: 11, pts: 1760, bg: 'linear-gradient(135deg,#22c55e,#15803d)' },
  { rank: '#4',  initials: 'DV', name: 'Deepa V.',      city: 'Hyderabad', drops:  9, pts: 1350, bg: 'linear-gradient(135deg,#38bdf8,#0284c7)' },
  { rank: '#5',  initials: 'RN', name: 'Rahul N.',      city: 'Delhi',     drops:  8, pts: 1120, bg: 'linear-gradient(135deg,#f87171,#dc2626)' },
];

const S = {
  nav: { background:'rgba(255,255,255,.96)', borderBottom:'1px solid #e2e8f0', padding:'14px 5%', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:99, backdropFilter:'blur(10px)' },
  logoText: { fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:19, color:'#0f172a' },
  navLinks: { display:'flex', alignItems:'center', gap:8 },
  navLink: { fontSize:13, fontWeight:600, color:'#64748b', textDecoration:'none', padding:'8px 14px' },

  hero: { background:'linear-gradient(170deg,#f0fdf4 0%,#fff 60%)', padding:'80px 5% 70px', textAlign:'center', position:'relative', overflow:'hidden' },
  h1: { fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'clamp(2.2rem,5vw,3.8rem)', lineHeight:1.08, color:'#0f172a', marginBottom:18 },
  heroSub: { fontSize:17, color:'#64748b', lineHeight:1.7, maxWidth:520, margin:'0 auto 34px' },
  heroBtn: { display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' },

  stats: { background:'#fff', borderTop:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0', padding:'28px 5%' },
  statsGrid: { maxWidth:900, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 },
  statBox: { textAlign:'center', padding:12 },
  statVal: { fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'2rem', color:'#16a34a', lineHeight:1 },
  statLbl: { fontSize:12, color:'#94a3b8', fontWeight:500, marginTop:5 },

  features: { background:'#f8fafc', padding:'72px 5%' },
  featGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:18, maxWidth:1100, margin:'0 auto' },
  featCard: { background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:26, transition:'all .22s', cursor:'default' },
  featTitle: { fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:15, color:'#0f172a', marginBottom:7 },
  featDesc: { fontSize:13, color:'#64748b', lineHeight:1.6 },

  how: { background:'#fff', padding:'72px 5%' },
  steps: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:0, maxWidth:900, margin:'0 auto', position:'relative' },
  stepBox: { textAlign:'center', padding:'24px 20px', position:'relative' },
  stepTitle: { fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:7 },
  stepDesc: { fontSize:12, color:'#64748b', lineHeight:1.6 },

  leader: { background:'#f0fdf4', padding:'64px 5%' },
  leaderCard: { background:'#fff', border:'1px solid #bbf7d0', borderRadius:20, overflow:'hidden', maxWidth:520, margin:'0 auto', boxShadow:'0 4px 24px rgba(34,197,94,.10)' },
  leaderHead: { background:'linear-gradient(135deg,#22c55e,#15803d)', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' },

  cta: { background:'#fff', padding:'72px 5%' },
  ctaBox: { background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1.5px solid #bbf7d0', borderRadius:24, padding:'56px 40px', textAlign:'center', maxWidth:760, margin:'0 auto', position:'relative', overflow:'hidden' },
  ctaH: { fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'clamp(1.4rem,3vw,2rem)', color:'#0f172a', marginBottom:12 },

  footer: { background:'#f8fafc', borderTop:'1px solid #e2e8f0', padding:'24px 5%', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 },
};

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ fontFamily:'Plus Jakarta Sans,sans-serif', background:'#fff', color:'#1e293b', overflowX:'hidden' }}>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="logo-icon">♻️</div>
          <span style={S.logoText}>E-CYCLE</span>
        </div>
        <div style={S.navLinks}>
          <Link to="/leaderboard" style={S.navLink}>Leaderboard</Link>
          <Link to="/map"         style={S.navLink}>Map</Link>
          {isAuthenticated
            ? <Link to="/dashboard" className="btn btn-green">Dashboard →</Link>
            : <>
                <Link to="/login"  className="btn btn-outline">Login</Link>
                <Link to="/signup" className="btn btn-green">Get Started</Link>
              </>
          }
        </div>
      </nav>

      {/* Hero */}
      <section style={S.hero}>
        <div className="blob blob-hero-r" />
        <div className="blob blob-hero-l" />
        <div className="pill-live" style={{ marginBottom:26 }}>
          <span className="pill-dot" />
          Real-time tracking · India-wide network
        </div>
        <h1 style={S.h1}>Recycle E-Waste.<br /><span className="text-gradient">Earn Real Rewards.</span></h1>
        <p style={S.heroSub}>Drop off your old phones, laptops and appliances at certified centers across India. Get credits instantly, track your impact live.</p>
        <div style={S.heroBtn}>
          <Link to="/signup" className="btn btn-green btn-lg">Start Recycling Free →</Link>
          <Link to="/map"    className="btn btn-outline btn-lg">🗺️ Find Centers</Link>
        </div>
      </section>

      {/* Stats */}
      <section style={S.stats}>
        <div style={S.statsGrid}>
          {STATS.map(s => (
            <div key={s.lbl} style={S.statBox}>
              <div style={S.statVal}>{s.val}</div>
              <div style={S.statLbl}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={S.features}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <span className="section-tag">Features</span>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'clamp(1.6rem,3.5vw,2.4rem)', color:'#0f172a', marginBottom:14 }}>Everything you need to go green</h2>
          <p style={{ fontSize:15, color:'#64748b', maxWidth:480, margin:'0 auto' }}>A complete platform for responsible e-waste disposal and community rewards.</p>
        </div>
        <div style={S.featGrid}>
          {FEATURES.map(f => (
            <div key={f.title} style={S.featCard}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#86efac'; e.currentTarget.style.boxShadow='0 6px 24px rgba(34,197,94,.14)'; e.currentTarget.style.transform='translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; }}>
              <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
              <div style={S.featTitle}>{f.title}</div>
              <div style={S.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={S.how}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <span className="section-tag">How it works</span>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'clamp(1.6rem,3.5vw,2.4rem)', color:'#0f172a' }}>Four simple steps</h2>
        </div>
        <div style={S.steps}>
          {[
            { n:1, title:'Find a center',  desc:'Use the GPS map to locate the nearest certified drop point' },
            { n:2, title:'Submit items',   desc:'List your devices and get a QR code generated instantly' },
            { n:3, title:'Drop & scan',    desc:'Visit the center, staff scan your QR — verified in seconds' },
            { n:4, title:'Earn credits',   desc:'Credits land instantly. Track your rank on the leaderboard' },
          ].map((step, i, arr) => (
            <div key={step.n} style={S.stepBox}>
              <div className="step-num">{step.n}</div>
              <div style={S.stepTitle}>{step.title}</div>
              <div style={S.stepDesc}>{step.desc}</div>
              {i < arr.length - 1 && (
                <div style={{ position:'absolute', top:24, left:'calc(50% + 24px)', width:'calc(100% - 48px)', height:2, background:'linear-gradient(90deg,#22c55e,#bbf7d0)' }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      <section style={S.leader}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <span className="section-tag">Community</span>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'clamp(1.6rem,3.5vw,2.4rem)', color:'#0f172a' }}>Top recyclers this month</h2>
        </div>
        <div style={S.leaderCard}>
          <div style={S.leaderHead}>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:15, color:'#fff' }}>🏆 Leaderboard</span>
            <span style={{ background:'rgba(255,255,255,.2)', borderRadius:100, padding:'4px 12px', fontSize:11, fontWeight:700, color:'#fff' }}>Live</span>
          </div>
          {LEADERS.map(l => (
            <div key={l.name} className="leader-row">
              <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:15, width:28, textAlign:'center' }}>{l.rank}</span>
              <div className="avatar" style={{ background: l.bg }}>{l.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'#1e293b' }}>{l.name}</div>
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>{l.city} · {l.drops} drops</div>
              </div>
              <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:15, color:'#16a34a' }}>{l.pts.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:22 }}>
          <Link to="/leaderboard" className="btn btn-green">View full leaderboard →</Link>
        </div>
      </section>

      {/* CTA */}
      <section style={S.cta}>
        <div style={S.ctaBox}>
          <div className="blob blob-cta-r" />
          <div className="blob blob-cta-l" />
          <div style={{ position:'relative' }}>
            <div style={{ fontSize:44, marginBottom:18 }}>🌍</div>
            <h2 style={S.ctaH}>Your old phone is worth more than you think.</h2>
            <p style={{ fontSize:15, color:'#4b5563', marginBottom:28 }}>Join 12,000+ recyclers already earning credits for a greener India.</p>
            <Link to="/signup" className="btn btn-green btn-lg">Join E-CYCLE Today →</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>♻️</div>
          <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:15, color:'#0f172a' }}>E-CYCLE</span>
          <span style={{ fontSize:12, color:'#94a3b8' }}>© 2026</span>
        </div>
        <div style={{ display:'flex', gap:20 }}>
          {['About','Privacy','Terms','Contact'].map(l => (
            <button key={l} onClick={() => {}} style={{ fontSize:12, color:'#64748b', background:'none', border:'none', cursor:'pointer', padding:0 }}>{l}</button>
          ))}
        </div>
        <span style={{ fontSize:12, color:'#94a3b8' }}>Built for a sustainable India 🌿</span>
      </footer>
    </div>
  );
}
