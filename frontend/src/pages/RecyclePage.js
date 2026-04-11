import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { centersApi, recycleApi } from '../utils/api';

const CATEGORIES = ['Smartphones','Laptops','Tablets','Computers','Printers','Monitors','TVs','Batteries','Cables','Keyboards','Cameras','Gaming Consoles','Refrigerators','Washing Machines','Air Conditioners','Other'];
const CONDITIONS = ['Working','Broken','Damaged','Parts Only'];
const emptyItem = () => ({ name:'', category:'Smartphones', weight:'', condition:'Broken' });

export default function RecyclePage() {
  const [searchParams] = useSearchParams();
  const [centers, setCenters] = useState([]);
  const [centerId, setCenterId] = useState(searchParams.get('centerId') || '');
  const [items, setItems] = useState([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { centersApi.getAll().then(r => setCenters(r.centers || [])).catch(() => {}); }, []);

  const getLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); setLocating(false); },
      err => { const m = {1:'Permission denied.',2:'GPS unavailable.',3:'Timeout.'}; alert(m[err.code]||err.message); setLocating(false); },
      { enableHighAccuracy:true, timeout:15000, maximumAge:0 }
    );
  };

  const addItem    = () => setItems(p => [...p, emptyItem()]);
  const removeItem = i  => setItems(p => p.filter((_,idx) => idx !== i));
  const updateItem = (i,f,v) => setItems(p => p.map((item,idx) => idx===i ? {...item,[f]:v} : item));

  const totalWeight      = items.reduce((s,it) => s + (parseFloat(it.weight)||0), 0);
  const selectedCenter   = centers.find(c => c._id === centerId);
  const estimatedCredits = selectedCenter ? Math.floor(totalWeight * selectedCenter.creditsPerKg) : 0;

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (!centerId) return setError('Please select a recycling center');
    const validItems = items.filter(it => it.name && it.weight > 0);
    if (validItems.length === 0) return setError('Add at least one item with weight');
    setLoading(true);
    try {
      const res = await recycleApi.submit({ centerId, items: validItems.map(it => ({...it, weight: parseFloat(it.weight)})), userLocation });
      setResult(res.transaction);
      setItems([emptyItem()]);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const card = { background:'white', border:'1px solid #e2e8f0', borderRadius:16, padding:'1.5rem', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', marginBottom:'1.25rem' };

  if (result) {
    return (
      <div style={{ maxWidth:520, margin:'0 auto', animation:'slideUp 0.4s ease-out both' }}>
        <div style={{ ...card, padding:'2rem', textAlign:'center' }}>

          {/* Header */}
          <div style={{ fontSize:'3rem', marginBottom:'.75rem' }}>📱</div>
          <h2 style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.5rem', color:'#0f172a', margin:'0 0 .5rem' }}>QR Code Ready!</h2>
          <p style={{ color:'#64748b', fontSize:'.875rem', margin:'0 0 1.5rem' }}>
            Take this QR to the recycling center. Staff will scan it to award your credits.
          </p>

          {/* QR code */}
          {result.qrCode && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem' }}>
              <div style={{ background:'white', border:'3px solid #22c55e', borderRadius:18, padding:'1rem', position:'relative', overflow:'hidden', boxShadow:'0 4px 20px rgba(34,197,94,.15)' }} className="scan-wrap">
                <img src={result.qrCode} alt="QR Code" style={{ width:220, height:220, borderRadius:10, display:'block' }} />
              </div>
            </div>
          )}

          {/* Details */}
          <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:12, padding:'1rem', marginBottom:'1.25rem', textAlign:'left' }}>
            {[
              ['Center',          result.centerName || 'Selected Center'],
              ['Total Weight',    `${result.totalWeight} kg`],
              ['Credits to Earn', `+${result.creditsEarned} credits`],
              ['Valid Until',     '24 hours from now'],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'.375rem 0', borderBottom:'1px solid #f1f5f9', fontSize:'.875rem' }}>
                <span style={{ color:'#64748b' }}>{k}</span>
                <span style={{ fontWeight:700, color: k==='Credits to Earn' ? '#16a34a' : '#0f172a', fontSize: k==='Credits to Earn' ? '1rem' : '.875rem' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* How to use */}
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'1rem', marginBottom:'1.5rem', textAlign:'left' }}>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'.8rem', color:'#15803d', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>
              How to claim your credits
            </div>
            {[
              '1. Visit the recycling center physically',
              '2. Show this QR code to the staff',
              '3. Staff scans it and enters the company password',
              '4. Credits are instantly added to your account',
            ].map(s => (
              <div key={s} style={{ fontSize:'.8rem', color:'#16a34a', padding:'3px 0', display:'flex', alignItems:'flex-start', gap:6 }}>
                <span>•</span><span>{s}</span>
              </div>
            ))}
          </div>

          {/* GPS status */}
          {result.isLocationValid === true && (
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:'.75rem', fontSize:'.8rem', color:'#16a34a', marginBottom:'1rem' }}>
              ✅ GPS verified — you are near the center location
            </div>
          )}
          {result.isLocationValid === false && (
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:10, padding:'.75rem', fontSize:'.8rem', color:'#a16207', marginBottom:'1rem' }}>
              ⚠️ Visit the center in person to get QR scanned
            </div>
          )}

          <button onClick={() => setResult(null)} className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }}>
            Submit Another Item
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:640, animation:'fadeIn 0.35s ease-out both' }}>
      <div style={{ marginBottom:'1.75rem' }}>
        <h1 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:'1.75rem',color:'#0f172a',margin:'0 0 0.25rem' }}>Submit E-Waste</h1>
        <p style={{ color:'#64748b',margin:0 }}>Describe your items and get a QR code for drop-off</p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:'1.25rem' }}><span>⚠️</span>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Center selection */}
        <div style={card}>
          <h2 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'#0f172a',marginTop:0,marginBottom:'1rem',display:'flex',alignItems:'center',gap:8 }}>
            <span style={{ width:26,height:26,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:99,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:800,color:'#16a34a',flexShrink:0 }}>1</span>
            Choose Recycling Center
          </h2>
          <select value={centerId} onChange={e => setCenterId(e.target.value)} className="input-field" required>
            <option value="">Select a center…</option>
            {centers.map(c => <option key={c._id} value={c._id}>{c.name} — {c.creditsPerKg} credits/kg</option>)}
          </select>
          {selectedCenter && (
            <div style={{ marginTop:'0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'0.75rem',fontSize:'0.8rem',color:'#16a34a' }}>
              📍 {selectedCenter.address} · Accepts: {selectedCenter.acceptedItems?.slice(0,3).join(', ')}…
            </div>
          )}
        </div>

        {/* Items */}
        <div style={card}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem' }}>
            <h2 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'#0f172a',margin:0,display:'flex',alignItems:'center',gap:8 }}>
              <span style={{ width:26,height:26,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:99,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:800,color:'#16a34a',flexShrink:0 }}>2</span>
              Add Your Items
            </h2>
            <button type="button" onClick={addItem} className="btn-secondary" style={{ fontSize:'0.8rem',padding:'0.45rem 0.875rem' }}>+ Add Item</button>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:'0.875rem' }}>
            {items.map((item,i) => (
              <div key={i} style={{ background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:'1rem' }}>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem' }}>
                  <span style={{ fontSize:'0.75rem',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em' }}>Item #{i+1}</span>
                  {items.length > 1 && <button type="button" onClick={() => removeItem(i)} style={{ border:'none',background:'none',cursor:'pointer',color:'#ef4444',fontSize:'0.8rem',fontWeight:600,padding:0 }}>✕ Remove</button>}
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem' }}>
                  {[['name','Item Name','e.g. iPhone 12','text'],['weight','Weight (kg)','0.5','number']].map(([field,label,ph,type]) => (
                    <div key={field}>
                      <label style={{ display:'block',fontSize:'0.78rem',fontWeight:600,color:'#475569',marginBottom:4 }}>{label}</label>
                      <input type={type} placeholder={ph} value={item[field]} onChange={e => updateItem(i,field,e.target.value)} className="input-field" style={{ fontSize:'0.875rem',padding:'0.55rem 0.75rem' }} required={field==='name'} min={field==='weight'?0.01:undefined} step={field==='weight'?0.01:undefined} />
                    </div>
                  ))}
                  {[['category','Category',CATEGORIES],['condition','Condition',CONDITIONS]].map(([field,label,opts]) => (
                    <div key={field}>
                      <label style={{ display:'block',fontSize:'0.78rem',fontWeight:600,color:'#475569',marginBottom:4 }}>{label}</label>
                      <select value={item[field]} onChange={e => updateItem(i,field,e.target.value)} className="input-field" style={{ fontSize:'0.875rem',padding:'0.55rem 0.75rem' }}>
                        {opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GPS */}
        <div style={card}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem' }}>
            <div>
              <h2 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:'1.1rem',color:'#0f172a',margin:'0 0 0.25rem',display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ width:26,height:26,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:99,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:800,color:'#16a34a',flexShrink:0 }}>3</span>
                GPS Verification <span style={{ fontSize:'0.75rem',fontWeight:500,color:'#94a3b8' }}>(optional)</span>
              </h2>
              {userLocation ? (
                <p style={{ color:'#16a34a',fontSize:'0.78rem',margin:'0.25rem 0 0',fontFamily:'JetBrains Mono,monospace' }}>✅ {userLocation.latitude.toFixed(5)}°, {userLocation.longitude.toFixed(5)}°</p>
              ) : (
                <p style={{ color:'#94a3b8',fontSize:'0.8rem',margin:'0.25rem 0 0' }}>Enables fraud-proof location validation</p>
              )}
            </div>
            <button type="button" onClick={getLocation} disabled={locating} className={userLocation ? 'btn-primary' : 'btn-secondary'} style={{ fontSize:'0.875rem',padding:'0.55rem 1.125rem',flexShrink:0 }}>
              {locating ? '📡 Locating…' : userLocation ? '✅ Located' : '📍 Get GPS'}
            </button>
          </div>
        </div>

        {/* Summary */}
        {totalWeight > 0 && (
          <div style={{ ...card, background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',border:'1px solid #86efac' }}>
            <h2 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:'1rem',color:'#15803d',marginTop:0,marginBottom:'0.875rem' }}>Summary</h2>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.875rem',marginBottom:'0.5rem' }}>
              <span style={{ color:'#16a34a' }}>Total Weight</span>
              <span style={{ fontWeight:600,color:'#0f172a' }}>{totalWeight.toFixed(2)} kg</span>
            </div>
            <div style={{ display:'flex',justifyContent:'space-between',fontSize:'0.875rem' }}>
              <span style={{ color:'#16a34a' }}>Credits to Earn</span>
              <span style={{ fontFamily:'Outfit,sans-serif',fontWeight:800,color:'#16a34a',fontSize:'1.25rem' }}>+{estimatedCredits}</span>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary" style={{ width:'100%',justifyContent:'center',padding:'0.875rem',fontSize:'1rem' }}>
          {loading ? <><span style={{width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:99,animation:'spin 0.75s linear infinite',display:'inline-block'}}></span> Generating QR Code…</> : '📱 Generate QR Code'}
        </button>
      </form>
    </div>
  );
}