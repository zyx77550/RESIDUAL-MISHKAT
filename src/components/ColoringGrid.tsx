import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { useIsNarrow } from './ui';
import confetti from 'canvas-confetti';

const PALETTE_GROUPS = [
  { name: 'Classiques', nameAr: 'كلاسيكية', colors: ['#8B2635', '#D4AF37', '#A8DADC', '#B7E4C7', '#1D3557', '#E63946'] },
  { name: 'Pastels',    nameAr: 'باستيل',   colors: ['#FFD6E7', '#FFC9D0', '#D0D9FF', '#E8D5FF', '#C7ECEE', '#D1F5E0'] },
  { name: 'Vibrants',   nameAr: 'زاهية',   colors: ['#F4A261', '#E76F51', '#2A9D8F', '#7B2FBE', '#06D6A0', '#118AB2'] },
  { name: 'Profonds',   nameAr: 'عميقة',   colors: ['#0f172a', '#1b4332', '#3d0000', '#4a1942', '#14213d', '#2d1b69'] },
];

const HEART_PATH =
  'M400,675 C250,590 35,490 35,280 C35,130 130,70 240,70 C310,70 365,115 400,165 C435,115 490,70 560,70 C670,70 765,130 765,280 C765,490 550,590 400,675Z';

const H_W = 800;
const H_H = 700;
const HEX_R = 30;
const HEX_COL_SPACING = HEX_R * Math.sqrt(3);
const HEX_ROW_SPACING = HEX_R * 1.5;

const hexPath = (cx: number, cy: number, r: number): string => {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join('L')}Z`;
};

export const ColoringGrid = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();
  const narrow = useIsNarrow();
  const [selectedColor, setSelectedColor] = useState('#8B2635');
  const [filterJuz, setFilterJuz] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'heart'>('grid');
  const [heartCells, setHeartCells] = useState<Array<{ cx: number; cy: number }>>([]);
  const fr = lang === 'fr';

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = H_W;
    canvas.height = H_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const path = new Path2D(HEART_PATH);
    const cells: { cx: number; cy: number }[] = [];
    const marginX = HEX_R * Math.sqrt(3) / 2;
    const marginY = HEX_R;
    const numRows = Math.ceil((H_H - marginY) / HEX_ROW_SPACING) + 2;
    for (let row = 0; row < numRows; row++) {
      const y = marginY + row * HEX_ROW_SPACING;
      if (y > H_H + HEX_R) break;
      const xOffset = row % 2 === 1 ? HEX_COL_SPACING / 2 : 0;
      const xStart = marginX + xOffset;
      const numCols = Math.ceil((H_W - xStart) / HEX_COL_SPACING) + 2;
      for (let col = 0; col < numCols; col++) {
        const x = xStart + col * HEX_COL_SPACING;
        if (x > H_W + HEX_R) break;
        if (ctx.isPointInPath(path, x, y)) cells.push({ cx: x, cy: y });
      }
    }
    cells.sort((a, b) => {
      const ba = Math.round(a.cy / HEX_ROW_SPACING);
      const bb = Math.round(b.cy / HEX_ROW_SPACING);
      if (ba !== bb) return ba - bb;
      return a.cx - b.cx;
    });
    setHeartCells(cells);
  }, []);

  const coloredCount = userData.surahs.filter(s => s.color).length;
  const progressPct = Math.round((coloredCount / 114) * 100);

  const updateSurahColor = (id: number) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: selectedColor, status: 'memorized' as const } : s),
    }));
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.65 }, colors: [selectedColor, '#D4AF37', '#ffffff'], disableForReducedMotion: true });
  };

  const resetSurah = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: undefined, status: 'not_started' as const } : s),
    }));
  };

  const resetAll = () => {
    if (!confirm(fr ? 'Réinitialiser tout le coloriage ?' : 'إعادة ضبط كل الألوان؟')) return;
    setUserData((prev: UserData) => ({ ...prev, surahs: prev.surahs.map(s => ({ ...s, color: undefined })) }));
  };

  const displayedSurahs = filterJuz !== null ? userData.surahs.filter(s => s.juz === filterJuz) : userData.surahs;

  const ColorPalette = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {PALETTE_GROUPS.map(group => (
        <div key={group.name} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', borderRadius: 10, background: t.cardElev }}>
          {group.colors.map(c => (
            <button key={c} onClick={() => setSelectedColor(c)}
              style={{
                width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer',
                transform: selectedColor === c ? 'scale(1.35)' : 'scale(1)',
                boxShadow: selectedColor === c ? `0 0 0 2px ${t.bg}, 0 0 0 3.5px ${c}` : 'none',
                transition: 'all 0.15s ease',
              }}/>
          ))}
        </div>
      ))}
      <div style={{ padding: '6px 8px', borderRadius: 10, background: t.cardElev, position: 'relative' }}>
        <input type="color" value={selectedColor.startsWith('#') ? selectedColor : '#8B2635'}
          onChange={e => setSelectedColor(e.target.value)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}/>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: selectedColor, border: '2px solid rgba(255,255,255,0.6)' }}/>
      </div>
    </div>
  );

  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 12 };
  const allColors = PALETTE_GROUPS.flatMap(g => g.colors);
  const usedColors = new Set(userData.surahs.filter(s => s.color).map(s => s.color));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
            {fr ? `${coloredCount} sur 114 colorées` : `${coloredCount} من ١١٤ ملوّنة`}
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, margin: 0, color: t.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {fr ? 'Coloriage' : 'التلوين'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={() => setActiveTab(activeTab === 'heart' ? 'grid' : 'heart')}
            style={{ padding: '8px 14px', borderRadius: 8, background: activeTab === 'heart' ? `${t.accent}18` : t.card, border: `1px solid ${activeTab === 'heart' ? t.accent : t.line}`, color: activeTab === 'heart' ? t.accent : t.inkDim, fontSize: 11, cursor: 'pointer' }}>
            {fr ? 'Cœur du Coran' : 'قلب القرآن'}
          </button>
          <button onClick={resetAll}
            style={{ padding: '8px 14px', borderRadius: 8, background: t.card, border: `1px solid ${t.line}`, color: t.inkDim, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            ↺ {fr ? 'Réinit.' : 'إعادة'}
          </button>
        </div>
      </div>

      {/* ── Grid tab: 2-column layout ── */}
      {activeTab === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1fr 220px', gap: 14, direction: narrow ? 'ltr' : undefined }}>

          {/* Left: surah grid */}
          <div style={{ ...card, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                {fr ? 'Coran complet · 114 sourates' : 'القرآن الكريم · ١١٤ سورة'}
              </div>
              <select value={filterJuz ?? ''} onChange={e => setFilterJuz(e.target.value === '' ? null : parseInt(e.target.value))}
                style={{ padding: '4px 8px', background: t.cardElev, border: `1px solid ${t.line}`, borderRadius: 6, color: t.inkDim, fontSize: 10, outline: 'none', cursor: 'pointer' }}>
                <option value="">{fr ? 'Tous' : 'الكل'}</option>
                {[...Array(30)].map((_, i) => <option key={i+1} value={i+1}>{fr ? `Juz ${i+1}` : `${i+1}`}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 4 }}>
              {displayedSurahs.map(surah => (
                <div key={surah.id} style={{ position: 'relative' }}>
                  <button onClick={() => updateSurahColor(surah.id)}
                    title={`${surah.id}. ${surah.name}`}
                    style={{
                      width: '100%', aspectRatio: '1', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: surah.color || t.bg,
                      border: `1px solid ${surah.color ? 'transparent' : t.line}`,
                      fontFamily: 'Fraunces, serif', fontSize: 9, fontWeight: 300,
                      color: surah.color ? '#1a0f00' : t.inkMute,
                      cursor: 'pointer',
                    }}>
                    {surah.id}
                  </button>
                  {surah.color && (
                    <button onClick={e => resetSurah(surah.id, e)}
                      style={{ position: 'absolute', top: -3, right: -3, width: 13, height: 13, borderRadius: '50%', background: '#fff', border: '1px solid rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.8)', fontSize: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, lineHeight: 1 }}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: palette + stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Palette */}
            <div style={{ ...card, padding: '14px 16px' }}>
              <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
                {fr ? 'Palette' : 'الألوان'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 7 }}>
                {allColors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)}
                    style={{
                      aspectRatio: '1', borderRadius: 7, background: c, cursor: 'pointer',
                      border: selectedColor === c ? `2.5px solid ${t.ink}` : '2px solid transparent',
                      transform: selectedColor === c ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.12s',
                    }}/>
                ))}
                {/* Custom color */}
                <div style={{ aspectRatio: '1', borderRadius: 7, position: 'relative', border: `2px solid ${t.line}`, overflow: 'hidden' }}>
                  <input type="color" value={selectedColor.startsWith('#') ? selectedColor : '#8B2635'}
                    onChange={e => setSelectedColor(e.target.value)}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}/>
                  <div style={{ width: '100%', height: '100%', background: selectedColor }}/>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ ...card, padding: '14px 16px', flex: 1 }}>
              <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
                {fr ? 'Statistiques' : 'الإحصاء'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: `${t.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12 }}>🎨</span>
                  </div>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: t.ink, fontWeight: 300 }}>{coloredCount}</span>
                  <span style={{ fontSize: 10, color: t.inkDim }}>{fr ? 'sourates colorées' : 'سور ملوّنة'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: `${t.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12 }}>✦</span>
                  </div>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: t.ink, fontWeight: 300 }}>{usedColors.size}</span>
                  <span style={{ fontSize: 10, color: t.inkDim }}>{fr ? 'couleurs utilisées' : 'ألوان مستخدمة'}</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                    {fr ? 'Progression' : 'التقدم'}
                  </div>
                  <div style={{ height: 4, background: t.cardElev, borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${progressPct}%`, background: `linear-gradient(90deg, ${t.accent}, ${t.accentBright})`, borderRadius: 4 }}/>
                  </div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 13, color: t.inkDim, marginTop: 6 }}>{progressPct}% {fr ? 'du Coran' : 'من القرآن'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Heart tab */}
      {activeTab === 'heart' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...card, padding: '12px 18px' }}>
            <div style={{ fontSize: 12, color: t.inkDim, lineHeight: 1.6 }}>
              {fr
                ? 'Un grand cœur divisé en 114 sections — une par sourate. Colorez chacune au fil de votre mémorisation.'
                : 'قلب كبير مقسَّم إلى ١١٤ قطعة — كل قطعة تمثل سورة. لوّن كل قطعة بتقدم حفظك.'}
            </div>
          </div>

          <ColorPalette/>

          <div style={{ ...card, padding: 12, overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
            {heartCells.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${t.accent}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}/>
              </div>
            ) : (
              <svg viewBox={`0 0 ${H_W} ${H_H}`} style={{ width: '100%', maxWidth: 720, minWidth: 300, display: 'block' }}>
                <defs>
                  <clipPath id="heart-clip"><path d={HEART_PATH}/></clipPath>
                  <radialGradient id="heart-bg-grad" cx="50%" cy="38%" r="65%">
                    <stop offset="0%" stopColor="#fff8f9"/>
                    <stop offset="100%" stopColor="#ffe4ea"/>
                  </radialGradient>
                  <filter id="heart-glow" x="-8%" y="-8%" width="116%" height="116%">
                    <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#D4AF37" floodOpacity="0.22"/>
                  </filter>
                </defs>
                <path d={HEART_PATH} fill="#ffe4ea" filter="url(#heart-glow)" opacity="0.7"/>
                <path d={HEART_PATH} fill="url(#heart-bg-grad)"/>
                <g clipPath="url(#heart-clip)">
                  {heartCells.map(({ cx, cy }, idx) => {
                    const surah = userData.surahs[idx];
                    const isColored = !!surah?.color;
                    const nameLen = surah?.arabicName.length ?? 0;
                    const nameFontSize = nameLen > 7 ? 6.5 : nameLen > 5 ? 7.5 : 9;
                    return (
                      <g key={idx} onClick={surah ? () => updateSurahColor(surah.id) : undefined} style={{ cursor: surah ? 'pointer' : 'default' }}>
                        <path d={hexPath(cx, cy, HEX_R - 1.2)} fill={isColored ? surah!.color! : '#fff0f4'} stroke={isColored ? 'rgba(255,255,255,0.30)' : '#f0b8c4'} strokeWidth="0.9"/>
                        {isColored && <path d={hexPath(cx, cy - 4, HEX_R * 0.55)} fill="rgba(255,255,255,0.10)" stroke="none" style={{ pointerEvents: 'none' }}/>}
                        {surah && <>
                          <text x={cx} y={cy - 9} textAnchor="middle" fontSize="5.5" fontFamily="monospace" fill={isColored ? 'rgba(255,255,255,0.60)' : '#c07080'} style={{ pointerEvents: 'none' }}>{surah.id}</text>
                          <text x={cx} y={cy + 5} textAnchor="middle" dominantBaseline="middle" fontSize={nameFontSize} fontFamily="'Noto Naskh Arabic', serif" fontWeight="700" fill={isColored ? 'rgba(255,255,255,0.93)' : '#8B2635'} style={{ pointerEvents: 'none', direction: 'rtl' }}>{surah.arabicName}</text>
                        </>}
                      </g>
                    );
                  })}
                </g>
                <path d={HEART_PATH} fill="none" stroke="white" strokeWidth="10"/>
                <path d={HEART_PATH} fill="none" stroke="#D4AF37" strokeWidth="2.8" strokeLinejoin="round"/>
                <path d={HEART_PATH} fill="none" stroke="#8B2635" strokeWidth="1" strokeLinejoin="round" opacity="0.35"/>
                {[{x:55,y:88,s:1.1,o:.55},{x:735,y:88,s:1.0,o:.5},{x:28,y:240,s:.85,o:.4},{x:762,y:240,s:.85,o:.4},{x:168,y:662,s:.9,o:.45},{x:625,y:662,s:.9,o:.45},{x:397,y:16,s:.75,o:.35}].map((d, i) => (
                  <g key={`sp${i}`} transform={`translate(${d.x},${d.y}) scale(${d.s})`} opacity={d.o}>
                    <path d="M0,-11 L2.5,-2.5 L11,0 L2.5,2.5 L0,11 L-2.5,2.5 L-11,0 L-2.5,-2.5Z" fill="#D4AF37"/>
                  </g>
                ))}
                <text x={H_W/2} y={H_H-4} textAnchor="middle" fontSize="11" fontFamily="'Noto Naskh Arabic', serif" fill="#8B2635" opacity="0.5">قلب القرآن الكريم</text>
              </svg>
            )}
          </div>

          <div style={{ fontSize: 9, color: t.inkMute, textAlign: 'center', letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.6 }}>
            {fr ? 'Chaque hexagone = une sourate · Cliquez pour colorier' : 'كل سداسي = سورة · انقر للتلوين'}
          </div>
        </div>
      )}
    </div>
  );
};
