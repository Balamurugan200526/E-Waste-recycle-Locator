import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { centersApi } from '../utils/api';
import { Link } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const greenIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44"><ellipse cx="16" cy="42" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/><path d="M16 0C9.37 0 4 5.37 4 12c0 9 12 30 12 30s12-21 12-30c0-6.63-5.37-12-12-12z" fill="#16a34a"/><circle cx="16" cy="12" r="5" fill="white" opacity="0.9"/></svg>`),
  iconSize: [32,44], iconAnchor: [16,44], popupAnchor: [0,-44],
});

const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32"><circle cx="16" cy="16" r="14" fill="#2563eb" stroke="white" stroke-width="3"/><circle cx="16" cy="16" r="6" fill="white"/></svg>`),
  iconSize: [32,32], iconAnchor: [16,16], popupAnchor: [0,-16],
});

const FlyToUser = ({ position }) => {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, 13, { duration: 1.5 }); }, [position, map]);
  return null;
};

const ITEMS = ['Smartphones','Laptops','Tablets','Computers','TVs','Batteries','Cameras'];

export default function MapPage() {
  const [centers, setCenters] = useState([]);
  const [userPos, setUserPos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');
  const [radius] = useState(50);

  useEffect(() => {
    setLoading(true);
    centersApi.getAll().then(r => setCenters(r.centers || [])).catch(() => setError('Failed to load centers')).finally(() => setLoading(false));
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return setError('Geolocation not supported by your browser');
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isSecure) return setError('Location requires localhost or HTTPS');
    setGpsLoading(true); setError('');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos([lat, lng]);
        try { const r = await centersApi.getNearby(lat, lng, radius); setCenters(r.centers || []); } catch {}
        setGpsLoading(false);
      },
      err => {
        const msgs = { 1:'Permission denied — allow location in address bar', 2:'Location unavailable — enable GPS in settings', 3:'Request timed out' };
        setError(msgs[err.code] || err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const filtered = filter ? centers.filter(c => c.acceptedItems?.some(i => i.toLowerCase().includes(filter.toLowerCase()))) : centers;

  return (
    <div style={{ animation:'fadeIn 0.35s ease-out both' }}>
      <div style={{ display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'1rem',marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:'1.75rem',color:'#0f172a',margin:'0 0 0.25rem' }}>E-Waste Center Map</h1>
          <p style={{ color:'#64748b',margin:0,fontSize:'0.9rem' }}>{filtered.length} certified recycling centers</p>
        </div>
        <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field" style={{ width:'auto',paddingTop:'0.5rem',paddingBottom:'0.5rem' }}>
            <option value="">All Types</option>
            {ITEMS.map(t => <option key={t}>{t}</option>)}
          </select>
          <button onClick={detectLocation} disabled={gpsLoading} className="btn-primary" style={{ padding:'0.55rem 1.25rem',fontSize:'0.875rem' }}>
            {gpsLoading ? '📡 Locating…' : '📍 Near Me'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:'1rem' }}><span>⚠️</span>{error}</div>}

      <div style={{ display:'grid',gridTemplateColumns:'1fr 320px',gap:'1.25rem',alignItems:'start' }} className="max-lg:!grid-cols-1">
        {/* Map */}
        <div style={{ background:'white',border:'1px solid #e2e8f0',borderRadius:16,overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',height:560 }}>
          {loading ? (
            <div style={{ height:'100%',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <div style={{ width:40,height:40,border:'3px solid #e2e8f0',borderTop:'3px solid #22c55e',borderRadius:99,animation:'spin 0.75s linear infinite' }} />
            </div>
          ) : (
            <MapContainer center={[20.5937,78.9629]} zoom={5} style={{ height:'100%',width:'100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
              {userPos && (
                <>
                  <FlyToUser position={userPos} />
                  <Marker position={userPos} icon={userIcon}>
                    <Popup><div style={{ fontWeight:600,color:'#0f172a' }}>📍 Your Location</div></Popup>
                  </Marker>
                  <Circle center={userPos} radius={radius * 1000} pathOptions={{ color:'#22c55e',fillColor:'#22c55e',fillOpacity:0.05,weight:1,dashArray:'6' }} />
                </>
              )}
              {filtered.map(c => (
                <Marker key={c._id} position={[c.location.coordinates[1], c.location.coordinates[0]]} icon={greenIcon} eventHandlers={{ click: () => setSelected(c) }}>
                  <Popup>
                    <div style={{ minWidth:180 }}>
                      <h3 style={{ fontFamily:'Outfit,sans-serif',fontWeight:700,fontSize:'0.95rem',color:'#0f172a',margin:'0 0 4px' }}>{c.name}</h3>
                      <p style={{ color:'#64748b',fontSize:'0.8rem',margin:'0 0 6px' }}>{c.address}</p>
                      <div style={{ color:'#16a34a',fontWeight:700,fontSize:'0.875rem',marginBottom:6 }}>🪙 {c.creditsPerKg} credits/kg</div>
                      {c.distance && <div style={{ color:'#94a3b8',fontSize:'0.75rem',marginBottom:6 }}>📏 {c.distance} km away</div>}
                      <Link to={`/recycle?centerId=${c._id}`} style={{ display:'block',textAlign:'center',background:'#22c55e',color:'white',fontSize:'0.8rem',fontWeight:700,padding:'6px 12px',borderRadius:8,textDecoration:'none',fontFamily:'Outfit' }}>Recycle Here →</Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Sidebar list */}
        <div style={{ display:'flex',flexDirection:'column',gap:10,maxHeight:560,overflowY:'auto',paddingRight:2 }}>
          {filtered.map(c => (
            <div key={c._id} onClick={() => setSelected(c)}
              style={{ background:'white',border: selected?._id===c._id ? '1.5px solid #22c55e' : '1px solid #e2e8f0',borderRadius:14,padding:'1rem',cursor:'pointer',transition:'all 0.18s ease',boxShadow: selected?._id===c._id ? '0 4px 16px rgba(34,197,94,0.15)' : '0 1px 4px rgba(0,0,0,0.04)' }}
              onMouseEnter={e => { if(selected?._id!==c._id){ e.currentTarget.style.borderColor='#bbf7d0'; e.currentTarget.style.boxShadow='0 4px 16px rgba(34,197,94,0.1)'; }}}
              onMouseLeave={e => { if(selected?._id!==c._id){ e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'; }}}>
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:6 }}>
                <div style={{ fontFamily:'Outfit,sans-serif',fontWeight:600,color:'#0f172a',fontSize:'0.875rem' }}>{c.name}</div>
                <span style={{ fontSize:'0.78rem',fontWeight:700,color:'#16a34a',background:'#f0fdf4',border:'1px solid #dcfce7',borderRadius:99,padding:'2px 8px',flexShrink:0 }}>{c.creditsPerKg}/kg</span>
              </div>
              <div style={{ color:'#94a3b8',fontSize:'0.78rem',marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{c.address}</div>
              {c.distance && <div style={{ color:'#64748b',fontSize:'0.75rem',marginBottom:6 }}>📏 {c.distance} km away</div>}
              <div style={{ display:'flex',flexWrap:'wrap',gap:4,marginBottom:8 }}>
                {c.acceptedItems?.slice(0,3).map(item => (
                  <span key={item} style={{ background:'#f0fdf4',color:'#16a34a',fontSize:'0.7rem',fontWeight:600,padding:'2px 8px',borderRadius:99 }}>{item}</span>
                ))}
                {c.acceptedItems?.length > 3 && <span style={{ color:'#94a3b8',fontSize:'0.7rem' }}>+{c.acceptedItems.length-3}</span>}
              </div>
              <Link to={`/recycle?centerId=${c._id}`} onClick={e => e.stopPropagation()}
                style={{ display:'block',textAlign:'center',border:'1.5px solid #bbf7d0',color:'#16a34a',fontSize:'0.8rem',fontWeight:600,padding:'6px',borderRadius:9,textDecoration:'none',background:'transparent',fontFamily:'Outfit',transition:'background 0.15s' }}>
                Recycle Here →
              </Link>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div style={{ textAlign:'center',padding:'2rem',color:'#94a3b8' }}>
              <div style={{ fontSize:'2.5rem',marginBottom:'0.5rem' }}>🗺️</div>
              <p style={{ fontWeight:600,margin:'0 0 0.25rem' }}>No centers found</p>
              <p style={{ fontSize:'0.8rem',margin:0 }}>Try changing the filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}