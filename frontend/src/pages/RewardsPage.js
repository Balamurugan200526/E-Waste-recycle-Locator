import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { rewardsApi } from '../utils/api';

const CATEGORIES = ['All', 'Shopping', 'Food', 'Electronics', 'Fashion', 'Travel', 'Entertainment', 'Other'];

const CAT_COLORS = {
  Shopping:      { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Food:          { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  Electronics:   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  Fashion:       { bg: '#fdf4ff', color: '#7e22ce', border: '#e9d5ff' },
  Travel:        { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  Entertainment: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  Other:         { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
};

export default function RewardsPage() {
  const { user, refreshUser } = useAuth();
  const [rewards, setRewards]         = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [category, setCategory]       = useState('All');
  const [tab, setTab]                 = useState('store'); // store | history
  const [redeeming, setRedeeming]     = useState(null); // rewardId being redeemed
  const [success, setSuccess]         = useState(null); // successful redemption result
  const [error, setError]             = useState('');
  const [credits, setCredits]         = useState(user?.credits ?? 0);

  const loadRewards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rewardsApi.getAll(category);
      setRewards(res.rewards || []);
    } catch { setError('Failed to load rewards'); }
    setLoading(false);
  }, [category]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await rewardsApi.myRedemptions();
      setMyRedemptions(res.redemptions || []);
    } catch {}
  }, []);

  useEffect(() => { loadRewards(); }, [loadRewards]);
  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab, loadHistory]);
  useEffect(() => { setCredits(user?.credits ?? 0); }, [user?.credits]);

  useEffect(() => {
    const h = async () => { const u = await refreshUser(); if (u) setCredits(u.credits ?? 0); };
    window.addEventListener('credits:updated', h);
    return () => window.removeEventListener('credits:updated', h);
  }, []); // eslint-disable-line

  const handleRedeem = async (reward) => {
    if (credits < reward.creditCost) {
      setError(`You need ${reward.creditCost} credits but only have ${credits}.`);
      setTimeout(() => setError(''), 4000);
      return;
    }
    setRedeeming(reward._id);
    setError('');
    try {
      const res = await rewardsApi.redeem(reward._id);
      setSuccess(res.redemption);
      setCredits(res.redemption.remainingCredits);
      await refreshUser();
      loadRewards(); // refresh stock counts
    } catch (err) {
      setError(err.message || 'Failed to redeem');
      setTimeout(() => setError(''), 4000);
    }
    setRedeeming(null);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      const el = document.getElementById(`copy-${code}`);
      if (el) { el.textContent = '✅ Copied!'; setTimeout(() => { el.textContent = '📋 Copy'; }, 2000); }
    });
  };

  // ── Success modal ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', animation: 'slideUp .4s ease-out both' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '2.5rem', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 24, color: '#0f172a', margin: '0 0 8px' }}>Coupon Unlocked!</h2>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px' }}>Your coupon code is ready to use</p>

          {/* Coupon code box */}
          <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '2px dashed #22c55e', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
              {success.platform} · {success.discountValue}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, fontSize: 26, color: '#0f172a', letterSpacing: '.1em', marginBottom: 12 }}>
              {success.couponCode}
            </div>
            <button
              id={`copy-${success.couponCode}`}
              onClick={() => copyCode(success.couponCode)}
              style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit,sans-serif' }}>
              📋 Copy
            </button>
          </div>

          {/* Details */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            {[
              ['Credits Spent', `-${success.creditsSpent} pts`],
              ['Remaining Credits', `${(success.remainingCredits ?? credits).toLocaleString()} pts`],
              ['Valid Until', new Date(success.expiresAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '.375rem 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{k}</span>
                <span style={{ fontWeight: 700, color: k === 'Credits Spent' ? '#dc2626' : k === 'Remaining Credits' ? '#16a34a' : '#0f172a' }}>{v}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: '1.5rem' }}>
            You can also find this code in <strong>My Coupons</strong> tab anytime
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setSuccess(null); setTab('history'); }} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              View My Coupons
            </button>
            <button onClick={() => setSuccess(null)} className="btn btn-green" style={{ flex: 1, justifyContent: 'center' }}>
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 26, color: '#0f172a', margin: '0 0 4px' }}>
          🎁 Rewards Store
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Spend your credits on real discounts at top e-commerce platforms</p>
      </div>

      {/* Credits banner */}
      <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', borderRadius: 16, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '.05em' }}>Available Credits</div>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 32, color: '#15803d', lineHeight: 1 }}>
            {(credits ?? 0).toLocaleString()} <span style={{ fontSize: 16, fontWeight: 500, color: '#4ade80' }}>pts</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#16a34a', background: '#fff', border: '1px solid #bbf7d0', borderRadius: 100, padding: '6px 16px', fontWeight: 600 }}>
          🪙 Recycle more to earn more →
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '.875rem 1rem', color: '#dc2626', fontSize: 13, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4, width: 'fit-content', marginBottom: '1.5rem' }}>
        {[['store','🛍️ Store'], ['history','🎟️ My Coupons']].map(([t, lbl]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 13,
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#0f172a' : '#64748b',
            boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
            transition: 'all .15s'
          }}>{lbl}</button>
        ))}
      </div>

      {/* ── STORE TAB ── */}
      {tab === 'store' && (
        <>
          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                padding: '6px 16px', borderRadius: 100, border: '1.5px solid',
                borderColor: category === cat ? '#22c55e' : '#e2e8f0',
                background: category === cat ? '#22c55e' : '#fff',
                color: category === cat ? '#fff' : '#475569',
                fontFamily: 'Outfit,sans-serif', fontWeight: 600, fontSize: 12,
                cursor: 'pointer', transition: 'all .15s'
              }}>{cat}</button>
            ))}
          </div>

          {/* Rewards grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 220, borderRadius: 16 }} />)}
            </div>
          ) : rewards.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎁</div>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, color: '#334155', marginBottom: 6 }}>No rewards in this category</div>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Check back soon or try another category</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {rewards.map(reward => {
                const catStyle = CAT_COLORS[reward.category] || CAT_COLORS.Other;
                const canAfford = credits >= reward.creditCost;
                const isRedeeming = redeeming === reward._id;

                return (
                  <div key={reward._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.05)', transition: 'all .2s', display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#86efac'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,197,94,.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.05)'; }}>

                    {/* Card header */}
                    <div style={{ background: catStyle.bg, borderBottom: `1px solid ${catStyle.border}`, padding: '1.25rem 1.25rem 1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff', border: `1px solid ${catStyle.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                          {reward.platformLogo}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 15, color: '#0f172a', lineHeight: 1.2 }}>{reward.platform}</div>
                          <span style={{ background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}`, borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
                            {reward.category}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 18, color: '#16a34a', lineHeight: 1 }}>{reward.discountValue}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{reward.availableStock} left</div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '1rem 1.25rem', flex: 1 }}>
                      <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 6 }}>{reward.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 10 }}>{reward.description}</div>
                      {reward.minOrderValue && (
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Min. order: {reward.minOrderValue}</div>
                      )}
                    </div>

                    {/* Card footer */}
                    <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: 16, color: canAfford ? '#16a34a' : '#94a3b8' }}>
                          🪙 {reward.creditCost.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>credits</div>
                      </div>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canAfford || isRedeeming}
                        style={{
                          background: canAfford ? '#22c55e' : '#e2e8f0',
                          color: canAfford ? '#fff' : '#94a3b8',
                          border: 'none', borderRadius: 10,
                          padding: '9px 20px',
                          fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 13,
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          transition: 'all .2s',
                          display: 'flex', alignItems: 'center', gap: 6,
                          boxShadow: canAfford ? '0 2px 8px rgba(34,197,94,.25)' : 'none'
                        }}>
                        {isRedeeming
                          ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> Redeeming…</>
                          : canAfford ? 'Redeem Now' : 'Need More Credits'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === 'history' && (
        <div>
          {myRedemptions.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎟️</div>
              <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 16, color: '#334155', marginBottom: 6 }}>No coupons yet</div>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: '1rem' }}>Redeem your credits to get discount coupons</p>
              <button onClick={() => setTab('store')} className="btn btn-green" style={{ fontSize: 13 }}>Browse Rewards</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myRedemptions.map(r => {
                const catStyle = CAT_COLORS[r.reward?.category] || CAT_COLORS.Other;
                const isExpired = new Date(r.expiresAt) < new Date();
                return (
                  <div key={r._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)', opacity: isExpired ? .6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', flexWrap: 'wrap' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: catStyle.bg, border: `1px solid ${catStyle.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {r.reward?.platformLogo || '🛍️'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{r.platform} — {r.discountValue}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          Redeemed {new Date(r.createdAt).toLocaleDateString('en-IN')} · {r.creditsSpent} credits spent
                        </div>
                      </div>

                      {/* Coupon code */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ background: isExpired ? '#f1f5f9' : 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: `1px dashed ${isExpired ? '#cbd5e1' : '#22c55e'}`, borderRadius: 10, padding: '6px 14px' }}>
                          <span style={{ fontFamily: 'JetBrains Mono,monospace', fontWeight: 700, fontSize: 14, color: isExpired ? '#94a3b8' : '#0f172a', letterSpacing: '.05em' }}>{r.couponCode}</span>
                        </div>
                        {!isExpired && (
                          <button
                            id={`copy-${r.couponCode}`}
                            onClick={() => copyCode(r.couponCode)}
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#16a34a', cursor: 'pointer', fontFamily: 'Outfit,sans-serif', whiteSpace: 'nowrap' }}>
                            📋 Copy
                          </button>
                        )}
                        {isExpired && <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', borderRadius: 100, padding: '4px 10px' }}>Expired</span>}
                      </div>
                    </div>
                    {!isExpired && (
                      <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '6px 1.25rem', fontSize: 11, color: '#94a3b8' }}>
                        Valid until {new Date(r.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
