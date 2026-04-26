import React, { useState, useCallback } from 'react';
import { UserData } from '../types';
import { useT } from '../lib/theme';

interface DhikrOption {
  arabic: string;
  transliteration: string;
  fr: string;
  defaultTarget: number;
}

const DHIKR_OPTIONS: DhikrOption[] = [
  { arabic: 'سُبْحَانَ اللهِ',        transliteration: 'Subhânallah',    fr: 'Gloire à Allah',                 defaultTarget: 33  },
  { arabic: 'الْحَمْدُ لِلهِ',        transliteration: 'Alhamdulillâh',  fr: 'Louange à Allah',                defaultTarget: 33  },
  { arabic: 'اللهُ أَكْبَرُ',         transliteration: 'Allāhu Akbar',   fr: 'Allah est le plus Grand',        defaultTarget: 33  },
  { arabic: 'لَا إِلَهَ إِلَّا اللهُ',transliteration: 'Lā ilāha illallāh',fr: 'Pas de divinité sauf Allah',  defaultTarget: 100 },
  { arabic: 'أَسْتَغْفِرُ اللهَ',     transliteration: 'Astaghfirullāh', fr: 'Je demande pardon à Allah',      defaultTarget: 100 },
];

const TARGETS = [33, 99, 100];

export const TasbihSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [selectedDhikr, setSelectedDhikr] = useState(0);
  const fr = lang === 'fr';

  const progress = Math.min(count / target, 1);
  const currentDhikr = DHIKR_OPTIONS[selectedDhikr];

  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) navigator.vibrate(40);
  }, []);

  const increment = useCallback(() => {
    vibrate();
    if (count < target) {
      const newCount = count + 1;
      setCount(newCount);
      if (newCount === target) {
        setSessionComplete(true);
        setUserData((prev: UserData) => ({
          ...prev,
          tasbihCount: (prev.tasbihCount || 0) + target,
          tasbihSessionBest: Math.max(prev.tasbihSessionBest || 0, target),
        }));
        if ('vibrate' in navigator) navigator.vibrate([80, 50, 80]);
        setTimeout(() => setSessionComplete(false), 3000);
      }
    } else {
      setCount(0);
      setSessionComplete(false);
    }
  }, [count, target, setUserData, vibrate]);

  const handleTargetChange = (t: number) => {
    setTarget(t);
    setCount(0);
    setSessionComplete(false);
  };

  const handleDhikrChange = (idx: number) => {
    setSelectedDhikr(idx);
    setCount(0);
    setSessionComplete(false);
    setTarget(DHIKR_OPTIONS[idx].defaultTarget);
  };

  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '70vh', gap: 28, paddingTop: 16 }}>

      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontStyle: 'italic', fontSize: 40, color: t.ink }}>
          {fr ? 'Tasbih' : 'تَسْبِيح'}
        </div>
        <div style={{ fontSize: 10, color: t.accentBright, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 4 }}>
          أَذْكَارُ الْمُسْلِمِ
        </div>
        {userData.tasbihCount > 0 && (
          <div style={{ fontSize: 11, color: t.inkMute, marginTop: 8 }}>
            {fr ? `Total : ${userData.tasbihCount.toLocaleString()} dhikr` : `الإجمالي: ${userData.tasbihCount.toLocaleString()} ذكر`}
          </div>
        )}
      </div>

      {/* Dhikr selector */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, width: '100%', maxWidth: 520, justifyContent: 'center', flexWrap: 'wrap' }}>
        {DHIKR_OPTIONS.map((dhikr, idx) => (
          <button key={idx} onClick={() => handleDhikrChange(idx)}
            style={{
              padding: '10px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
              background: selectedDhikr === idx ? t.accent : t.card,
              border: `1px solid ${selectedDhikr === idx ? t.accent : t.line}`,
              flexShrink: 0,
            }}>
            <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 14, color: selectedDhikr === idx ? '#1a0f00' : t.ink, lineHeight: 1.8 }}>
              {dhikr.arabic}
            </div>
            <div style={{ fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: selectedDhikr === idx ? '#1a0f00' : t.inkMute, opacity: 0.8, marginTop: 2 }}>
              {dhikr.transliteration}
            </div>
          </button>
        ))}
      </div>

      {/* Selected dhikr display */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 24, color: t.ink, lineHeight: 2 }}>
          {currentDhikr.arabic}
        </div>
        {fr && (
          <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 13, color: t.inkDim, marginTop: 4 }}>
            « {currentDhikr.fr} »
          </div>
        )}
      </div>

      {/* Main counter button */}
      <div style={{ position: 'relative', width: 240, height: 240 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke={t.accent} strokeWidth="4" opacity={0.12}/>
          <circle cx="50" cy="50" r={r} fill="none" stroke={t.accent} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}/>
        </svg>

        <button onClick={increment}
          style={{
            position: 'absolute', inset: 28, borderRadius: '50%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            background: sessionComplete ? `${t.accentSoft}30` : t.card,
            border: `1px solid ${t.line}`,
            userSelect: 'none',
          }}>
          <span style={{
            fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(2.5rem, 8vw, 4rem)', color: t.accent, lineHeight: 1,
          }}>
            {count}
          </span>
          <span style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>/ {target}</span>
          {sessionComplete && (
            <span style={{ fontSize: 9, color: t.accentBright, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>
              {fr ? '✓ Terminé !' : '✓ أُنجِز!'}
            </span>
          )}
          {count === 0 && !sessionComplete && (
            <span style={{ fontSize: 8, color: t.inkMute, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 6, opacity: 0.5 }}>
              {fr ? 'Appuyez' : 'اضغط'}
            </span>
          )}
        </button>
      </div>

      {/* Session best */}
      {userData.tasbihSessionBest > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 20, background: `${t.accentSoft}20`, border: `1px solid ${t.accentSoft}` }}>
          <span style={{ fontSize: 9, color: t.accentBright, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
            {fr ? 'Meilleure session' : 'أفضل جلسة'}
          </span>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: t.accent }}>{userData.tasbihSessionBest}</span>
        </div>
      )}

      {/* Target selector */}
      <div style={{ display: 'flex', gap: 6, padding: 6, borderRadius: 24, background: t.card, border: `1px solid ${t.line}` }}>
        {TARGETS.map(tgt => (
          <button key={tgt} onClick={() => handleTargetChange(tgt)}
            style={{
              padding: '10px 28px', borderRadius: 18, cursor: 'pointer',
              background: target === tgt ? t.accent : 'transparent',
              color: target === tgt ? '#1a0f00' : t.inkDim,
              fontWeight: 700, fontSize: 13, letterSpacing: '0.08em',
            }}>
            {tgt}
          </button>
        ))}
      </div>
    </div>
  );
};
