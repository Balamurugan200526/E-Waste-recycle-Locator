import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <div>
        <div style={{ fontSize: 72, marginBottom: 16 }} className="animate-float">♻️</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 80, color: 'var(--gray-100)', margin: '0 0 8px', lineHeight: 1 }}>404</h1>
        <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 22, color: 'var(--gray-700)', margin: '0 0 8px' }}>This page has been recycled.</p>
        <p style={{ color: 'var(--gray-400)', fontSize: 15, marginBottom: '2rem' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary" style={{ fontSize: 15, padding: '0.75rem 2rem' }}>← Back to Home</Link>
      </div>
    </div>
  );
}
