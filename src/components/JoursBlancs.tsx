import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { useT } from '../lib/theme';
import { UserData } from '../types';

interface JoursBlancsProps {
  userData: UserData;
  setUserData: (updater: UserData | ((prev: UserData) => UserData)) => void;
  lang: 'fr' | 'ar';
}

// SVG path for each moon phase (0=nouvelle, 1=croissant, 2=gibbeuse, 3=pleine)
const MOON_PATHS = [
  'M 50 2 A 48 48 0 0 0 50 98 A 48 48 0 0 1 50 2',
  'M 50 2 A 48 48 0 0 0 50 98 A 20 48 0 0 1 50 2',
  'M 50 2 A 48 48 0 0 0 50 98 A 20 48 0 0 0 50 2',
  'M 50 2 A 48 48 0 0 0 50 98 A 48 48 0 0 0 50 2',
];

const monthKey = () => new Date().toISOString().slice(0, 7);

const EMPTY_DAYS = { 13: false, 14: false, 15: false };

export const JoursBlancsSection = ({ userData, setUserData, lang }: JoursBlancsProps) => {
  const t = useT();
  const fr = lang === 'fr';
  const [validated, setValidated] = useState(false);

  const key = monthKey();
  const fastedDays: { 13: boolean; 14: boolean; 15: boolean } =
    (userData.joursBlancs?.[key] as { 13: boolean; 14: boolean; 15: boolean }) ?? EMPTY_DAYS;

  const progress = (Object.values(fastedDays).filter(Boolean).length) as 0 | 1 | 2 | 3;
  const isComplete = progress === 3;

  const toggleDay = (day: 13 | 14 | 15) => {
    setValidated(false);
    setUserData(prev => ({
      ...prev,
      joursBlancs: {
        ...(prev.joursBlancs ?? {}),
        [key]: { ...(prev.joursBlancs?.[key] ?? EMPTY_DAYS), [day]: !fastedDays[day] },
      },
    }));
  };

  const validateMonth = () => {
    setValidated(true);
    setTimeout(() => setValidated(false), 3000);
  };

  const phaseLabel = fr
    ? ['Nouvelle Lune', 'Premier Jour Illuminé', 'Lune Gibbeuse', 'Pleine Lune'][progress]
    : ['القمر الجديد', 'اليوم الأول المضيء', 'القمر الأحدب', 'البدر'][progress];

  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 14 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 480 }}>

      {/* ── Header ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
            {fr ? 'Jeûne Lunaire' : 'الصيام القمري'}
          </span>
          <span style={{ padding: '3px 10px', borderRadius: 999, background: `${t.accent}22`, border: `1px solid ${t.accent}44`, fontSize: 9, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Ayyam Al-Bid
          </span>
        </div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 30, letterSpacing: '-0.02em', color: t.ink, margin: 0, lineHeight: 1.15 }}>
          {fr ? 'Jours Blancs' : 'الأيام البيض'}
        </h1>
      </div>

      {/* ── Day tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {([13, 14, 15] as const).map(day => {
          const active = fastedDays[day];
          return (
            <button key={day} onClick={() => toggleDay(day)}
              style={{
                background: active ? `${t.accent}14` : t.cardElev,
                border: `1px solid ${active ? t.accent + '66' : t.line}`,
                borderRadius: 12, padding: '18px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: 'pointer', transition: 'all 0.2s', outline: 'none',
              }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 26, color: active ? t.accentBright : t.ink, lineHeight: 1 }}>
                {day}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 10, color: active ? t.accent : t.inkMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                  {active ? (fr ? 'Fait' : 'تم') : (fr ? 'Jour' : 'يوم')}
                </span>
                {active && (
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l4 4 10-10"/>
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Moon visualizer ── */}
      <div style={{
        ...card,
        padding: '28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${t.accent}12, transparent 70%), ${t.card}`,
      }}>
        {isComplete && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 160, height: 160, background: `${t.accent}18`, filter: 'blur(42px)', borderRadius: '50%', pointerEvents: 'none' }}/>
        )}

        {/* Moon SVG */}
        <div style={{
          position: 'relative', width: 140, height: 140, borderRadius: '50%',
          boxShadow: progress > 0 ? `0 0 32px 2px ${t.accent}28` : 'none',
          transition: 'box-shadow 1s ease',
        }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', borderRadius: '50%' }}>
            <defs>
              <radialGradient id="jbGlow" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor={t.accentBright}/>
                <stop offset="100%" stopColor={t.accent}/>
              </radialGradient>
              <radialGradient id="jbDark" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stopColor={t.cardElev}/>
                <stop offset="100%" stopColor={t.card}/>
              </radialGradient>
            </defs>

            {/* Base sphere */}
            <circle cx="50" cy="50" r="48" fill="url(#jbDark)" stroke={t.line} strokeWidth="1"/>

            {/* Illuminated phase */}
            <path d={MOON_PATHS[progress]} fill="url(#jbGlow)"
              style={{ transition: 'd 1s cubic-bezier(0.4, 0, 0.2, 1)' }}/>

            {/* Craters */}
            <g fill="#000" opacity="0.12" style={{ mixBlendMode: 'multiply' } as React.CSSProperties}>
              <circle cx="35" cy="35" r="10"/>
              <circle cx="65" cy="40" r="8"/>
              <circle cx="55" cy="70" r="12"/>
              <circle cx="75" cy="60" r="6"/>
              <circle cx="25" cy="65" r="5"/>
            </g>

            {/* Inner rim for sphere depth */}
            <circle cx="50" cy="50" r="48" fill="none" stroke={t.bg} strokeWidth="2" opacity="0.4"/>
          </svg>
        </div>

        {/* Phase label + validation */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 300, color: t.ink, margin: '0 0 6px' }}>
            {phaseLabel}
          </p>
          <p style={{ fontSize: 12, color: t.inkDim, margin: 0 }}>
            {fr ? `${progress}/3 jours complétés` : `${progress}/3 أيام مكتملة`}
          </p>

          {validated && (
            <p style={{ fontSize: 12, color: t.accent, fontWeight: 600, marginTop: 12 }}>
              {fr ? '✓ Mois validé — Barak Allahu fik !' : '✓ تم تأكيد الشهر — بارك الله فيك!'}
            </p>
          )}

          {isComplete && !validated && (
            <button onClick={validateMonth}
              style={{ marginTop: 16, padding: '9px 20px', borderRadius: 8, background: t.accent, color: '#1a0f00', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer', boxShadow: `0 4px 12px ${t.accent}44`, transition: 'opacity 0.2s' }}>
              {fr ? 'Valider le mois' : 'تأكيد الشهر'}
            </button>
          )}
        </div>
      </div>

      {/* ── Info card ── */}
      <div style={{ ...card, background: t.cardElev, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Info size={15} color={t.inkDim}/>
            <span style={{ fontSize: 10, color: t.inkDim, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              {fr ? 'Rappel' : 'تذكير'}
            </span>
          </div>
          <span style={{ fontFamily: 'Amiri Quran, serif', fontSize: 26, color: t.ink, direction: 'rtl', lineHeight: 1.4 }}>
            الأيام البيض
          </span>
        </div>

        <p style={{ fontSize: 13, color: t.inkDim, lineHeight: 1.65, margin: 0 }}>
          {fr ? (
            <>
              Il est fortement recommandé de jeûner trois jours par mois, idéalement les{' '}
              <span style={{ color: t.accent, fontWeight: 600 }}>13ème, 14ème et 15ème</span>
              {' '}jours du mois lunaire.
            </>
          ) : (
            <>
              يُستحب صيام ثلاثة أيام من كل شهر، وهي{' '}
              <span style={{ color: t.accent, fontWeight: 600 }}>الثالث عشر والرابع عشر والخامس عشر</span>
              {' '}من الشهر القمري.
            </>
          )}
        </p>

        <div style={{ borderTop: `1px solid ${t.lineSoft}`, paddingTop: 12 }}>
          <p style={{ fontSize: 13, color: t.inkMute, fontStyle: 'italic', lineHeight: 1.65, margin: 0 }}>
            {fr
              ? '"Le jeûne de trois jours chaque mois est comme le jeûne continu."'
              : '"صيام ثلاثة أيام من كل شهر كصيام الدهر كله"'}
          </p>
        </div>
      </div>

    </div>
  );
};
