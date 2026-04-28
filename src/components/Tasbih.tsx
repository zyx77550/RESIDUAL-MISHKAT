import React, { useState, useCallback } from 'react';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons, useIsNarrow } from './ui';
import { playTasbihTap } from '../lib/sounds';

const DHIKR: { ar: string; tr: string; fr: string; target: number }[] = [
  { ar: 'سُبْحَانَ اللهِ',         tr: 'Subhânallah',     fr: 'Gloire à Allah',              target: 33  },
  { ar: 'الْحَمْدُ لِلهِ',         tr: 'Alhamdulillâh',   fr: 'Louange à Allah',             target: 33  },
  { ar: 'اللهُ أَكْبَرُ',          tr: 'Allāhu Akbar',    fr: 'Allah est le plus Grand',     target: 33  },
  { ar: 'لَا إِلَهَ إِلَّا اللهُ', tr: 'Lā ilāha illallāh', fr: 'Pas de divinité sauf Allah', target: 100 },
  { ar: 'أَسْتَغْفِرُ اللهَ',      tr: 'Astaghfirullāh',  fr: 'Je demande pardon à Allah',   target: 100 },
];

export const TasbihSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();
  const narrow = useIsNarrow();
  const fr = lang === 'fr';

  const [idx, setIdx]       = useState(0);
  const [count, setCount]   = useState(0);
  const [done, setDone]     = useState(false);

  const dhikr  = DHIKR[idx];
  const target = dhikr.target;
  const ticks  = target <= 33 ? 33 : target <= 99 ? 99 : 100;

  const svgSize = narrow ? 200 : 240;
  const r = narrow ? 88 : 110;
  const cx = svgSize / 2, cy = svgSize / 2;
  const circ = 2 * Math.PI * r;

  const vibrate = useCallback(() => { if ('vibrate' in navigator) navigator.vibrate(40); }, []);

  const increment = useCallback(() => {
    vibrate();
    playTasbihTap();
    if (count >= target) {
      setCount(0); setDone(false); return;
    }
    const next = count + 1;
    setCount(next);
    if (next === target) {
      setDone(true);
      setUserData((prev: UserData) => ({
        ...prev,
        tasbihCount: (prev.tasbihCount || 0) + target,
        tasbihSessionBest: Math.max(prev.tasbihSessionBest || 0, target),
      }));
      if ('vibrate' in navigator) navigator.vibrate([80, 50, 80]);
      setTimeout(() => setDone(false), 3000);
    }
  }, [count, target, setUserData, vibrate]);

  const reset = () => { setCount(0); setDone(false); };

  const next = () => {
    setIdx((idx + 1) % DHIKR.length);
    setCount(0); setDone(false);
  };

  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 12 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
            {fr ? 'Dhikr & contemplation' : 'ذِكْر وتأمل'}
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, margin: 0, color: t.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {fr ? 'Tasbih' : 'تَسْبِيح'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={reset}
            style={{ padding: '8px 14px', borderRadius: 8, background: t.card, border: `1px solid ${t.line}`, color: t.inkDim, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Icon d={Icons.rotate} size={12}/> {fr ? 'Réinitialiser' : 'إعادة'}
          </button>
          <button
            style={{ padding: '8px 14px', borderRadius: 8, background: t.card, border: `1px solid ${t.line}`, color: t.inkDim, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <Icon d={Icons.list} size={12}/> {fr ? 'Historique' : 'السجل'}
          </button>
        </div>
      </div>

      {/* ── 2-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 1fr', gap: 14 }}>

        {/* ── LEFT : Compteur ── */}
        <div style={{ ...card, minHeight: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '28px 20px', overflow: 'hidden', position: 'relative' }}>

          {/* Phrase actuelle */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
              {fr ? 'Phrase actuelle' : 'الذكر الحالي'}
            </div>
            <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 34, color: t.ink, direction: 'rtl', lineHeight: 1.6 }}>
              {dhikr.ar}
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 13, color: t.inkDim, marginTop: 6 }}>
              {dhikr.tr} · {fr ? dhikr.fr : ''}
            </div>
          </div>

          {/* Counter ring with tick marks */}
          <div style={{ position: 'relative', width: svgSize, height: svgSize }}>
            <svg width={svgSize} height={svgSize} style={{ transform: 'rotate(-90deg)' }}>
              {/* Background track */}
              <circle cx={cx} cy={cy} r={r} stroke={t.line} strokeWidth="2" fill="none"/>
              {/* Progress arc */}
              <circle cx={cx} cy={cy} r={r} stroke={t.accent} strokeWidth="3" fill="none"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - count / target)} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.2s ease' }}/>
              {/* Tick marks */}
              {Array.from({ length: Math.min(ticks, 33) }).map((_, i) => {
                const angle = (i / Math.min(ticks, 33)) * Math.PI * 2;
                const x1 = cx + Math.cos(angle) * (r + 10);
                const y1 = cy + Math.sin(angle) * (r + 10);
                const x2 = cx + Math.cos(angle) * (r + 16);
                const y2 = cy + Math.sin(angle) * (r + 16);
                const filled = i < (count / target) * Math.min(ticks, 33);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={filled ? t.accent : t.line} strokeWidth="1.5" strokeLinecap="round"/>;
              })}
            </svg>

            {/* Center count */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 72, color: done ? t.accentBright : t.ink, lineHeight: 1, transition: 'color 0.3s' }}>
                {count}
              </span>
              <span style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>
                / {target}
              </span>
              {done && (
                <span style={{ fontSize: 9, color: t.accentBright, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6 }}>
                  {fr ? '✓ Terminé !' : '✓ أُنجِز!'}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={reset}
              style={{ width: 40, height: 40, borderRadius: 10, background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkDim, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon d={Icons.rotate} size={14}/>
            </button>
            <button onClick={increment}
              style={{ padding: '14px 36px', borderRadius: 12, background: t.accent, color: '#1a0f00', fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon d={Icons.plus} size={16} color="#1a0f00"/> {fr ? 'Tap' : 'نقر'}
            </button>
            <button onClick={next}
              style={{ width: 40, height: 40, borderRadius: 10, background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkDim, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon d={Icons.arrow} size={14}/>
            </button>
          </div>
        </div>

        {/* ── RIGHT : Stats + Phrases ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Stats card */}
          <div style={{ ...card, padding: '16px 18px' }}>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>
              {fr ? 'Stats' : 'الإحصاء'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { value: count,                             label: fr ? "Session"          : 'الجلسة'   },
                { value: (userData.tasbihCount || 0).toLocaleString(), label: fr ? 'Total' : 'الإجمالي' },
                { value: userData.tasbihSessionBest || 0,  label: fr ? 'Meilleure session': 'أفضل جلسة' },
                { value: target,                           label: fr ? 'Objectif'          : 'الهدف'    },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: i === 2 ? t.accentBright : t.ink, fontWeight: 300, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phrases card */}
          <div style={{ ...card, padding: '16px 18px', flex: 1 }}>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
              {fr ? 'Phrases' : 'الأذكار'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {DHIKR.map((d, i) => (
                <button key={i} onClick={() => { setIdx(i); setCount(0); setDone(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderBottom: i < DHIKR.length - 1 ? `1px solid ${t.line}` : 'none', background: 'transparent', border: 'none', borderBottomWidth: i < DHIKR.length - 1 ? 1 : 0, borderBottomStyle: 'solid', borderBottomColor: t.line, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 11,
                    background: i === idx ? t.accent : t.cardElev,
                    border: i === idx ? 'none' : `1px solid ${t.line}`,
                    color: i === idx ? '#1a0f00' : t.inkDim,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: t.ink, fontWeight: 500 }}>{d.tr}</div>
                    <div style={{ fontSize: 10, color: t.inkMute, marginTop: 1 }}>{fr ? d.fr : ''}</div>
                  </div>
                  <span style={{ fontFamily: 'Amiri Quran, serif', fontSize: 16, color: t.accentBright, flexShrink: 0 }}>{d.ar}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
