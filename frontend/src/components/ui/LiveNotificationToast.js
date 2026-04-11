import React, { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';

const CFG = {
  success: { icon:'✅', left:'#22c55e' },
  warning: { icon:'⚠️', left:'#f59e0b' },
  info:    { icon:'ℹ️', left:'#3b82f6' },
  credit:  { icon:'🪙', left:'#22c55e' },
  error:   { icon:'❌', left:'#ef4444' },
};

export default function LiveNotificationToast() {
  const { liveNotification, clearLiveNotification } = useSocket();

  useEffect(() => {
    if (!liveNotification) return;
    const t = setTimeout(clearLiveNotification, 5000);
    return () => clearTimeout(t);
  }, [liveNotification, clearLiveNotification]);

  if (!liveNotification) return null;

  const { type = 'info', title, message } = liveNotification;
  const c = CFG[type] || CFG.info;

  return (
    <div style={{ position:'fixed', top:20, right:20, zIndex:9999, animation:'slideUp .3s ease-out' }}>
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderLeft:`4px solid ${c.left}`, borderRadius:14, padding:'.875rem 1rem', boxShadow:'0 10px 32px rgba(0,0,0,.12)', display:'flex', alignItems:'flex-start', gap:10, minWidth:300, maxWidth:380 }}>
        <span style={{ fontSize:20, flexShrink:0, lineHeight:1.2 }}>{c.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:14, color:'#0f172a', marginBottom: message ? 2 : 0 }}>{title}</div>
          {message && <div style={{ fontSize:12, color:'#64748b', lineHeight:1.4 }}>{message}</div>}
        </div>
        <button onClick={clearLiveNotification} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:2, fontSize:16, lineHeight:1, borderRadius:4 }}>✕</button>
      </div>
    </div>
  );
}
