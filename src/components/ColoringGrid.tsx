import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, RotateCcw, Grid, Heart } from 'lucide-react';
import { UserData } from '../types';
import confetti from 'canvas-confetti';

const PALETTE_GROUPS = [
  {
    name: 'Classiques',
    nameAr: 'كلاسيكية',
    colors: ['#8B2635', '#D4AF37', '#A8DADC', '#B7E4C7', '#1D3557', '#E63946'],
  },
  {
    name: 'Pastels',
    nameAr: 'باستيل',
    colors: ['#FFD6E7', '#FFC9D0', '#D0D9FF', '#E8D5FF', '#C7ECEE', '#D1F5E0'],
  },
  {
    name: 'Vibrants',
    nameAr: 'زاهية',
    colors: ['#F4A261', '#E76F51', '#2A9D8F', '#7B2FBE', '#06D6A0', '#118AB2'],
  },
  {
    name: 'Profonds',
    nameAr: 'عميقة',
    colors: ['#0f172a', '#1b4332', '#3d0000', '#4a1942', '#14213d', '#2d1b69'],
  },
];

// Heart SVG path — fits in 800×700 viewBox
const HEART_PATH = "M400,660 C140,520 25,340 25,200 C25,85 115,20 235,20 C315,20 375,60 400,105 C425,60 485,20 565,20 C685,20 775,85 775,200 C775,340 660,520 400,660Z";
const H_COLS = 16;
const H_ROWS = 14;
const H_W = 800;
const H_H = 700;
const CW = H_W / H_COLS; // 50px
const CH = H_H / H_ROWS; // 50px

export const ColoringGrid = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const [selectedColor, setSelectedColor] = useState('#8B2635');
  const [filterJuz, setFilterJuz] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'heart'>('grid');
  // Ordered list of cell indices (row*H_COLS+col) that fall inside the heart
  const [heartCells, setHeartCells] = useState<number[]>([]);

  // Compute which grid cells fall inside the heart shape (runs once)
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = H_W;
    canvas.height = H_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const path = new Path2D(HEART_PATH);
    const inside: number[] = [];
    for (let r = 0; r < H_ROWS; r++) {
      for (let c = 0; c < H_COLS; c++) {
        const cx = c * CW + CW / 2;
        const cy = r * CH + CH / 2;
        if (ctx.isPointInPath(path, cx, cy)) {
          inside.push(r * H_COLS + c);
        }
      }
    }
    setHeartCells(inside);
  }, []);

  const coloredCount = userData.surahs.filter(s => s.color).length;
  const progressPct = Math.round((coloredCount / 114) * 100);

  const updateSurahColor = (id: number) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: selectedColor, status: 'memorized' as const } : s),
    }));
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.65 },
      colors: [selectedColor, '#D4AF37', '#ffffff'],
      disableForReducedMotion: true,
    });
  };

  const resetSurah = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: undefined, status: 'not_started' as const } : s),
    }));
  };

  const resetAll = () => {
    if (!confirm(lang === 'fr' ? 'Réinitialiser tout le coloriage ?' : 'إعادة ضبط كل الألوان؟')) return;
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => ({ ...s, color: undefined })),
    }));
  };

  const displayedSurahs = filterJuz !== null
    ? userData.surahs.filter(s => s.juz === filterJuz)
    : userData.surahs;

  const ColorPalette = () => (
    <div className="flex flex-wrap gap-2">
      {PALETTE_GROUPS.map(group => (
        <div key={group.name} className="flex items-center gap-1 p-1.5 rounded-2xl"
             style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' }}>
          {group.colors.map(c => (
            <button key={c} onClick={() => setSelectedColor(c)}
              className="rounded-full transition-all"
              style={{
                width: 22, height: 22,
                background: c,
                transform: selectedColor === c ? 'scale(1.3)' : 'scale(1)',
                boxShadow: selectedColor === c ? `0 0 0 2px white, 0 0 0 3.5px ${c}` : 'none',
                transition: 'all 0.15s ease',
              }} />
          ))}
        </div>
      ))}
      <div className="flex items-center gap-1 p-1.5 rounded-2xl"
           style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' }}>
        <div className="relative">
          <input type="color"
            value={selectedColor.startsWith('#') ? selectedColor : '#8B2635'}
            onChange={e => setSelectedColor(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            title={lang === 'fr' ? 'Couleur personnalisée' : 'لون مخصص'} />
          <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
               style={{ background: selectedColor }}>
            <Palette size={10} className="text-white mix-blend-difference" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-4">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl text-primary leading-tight">
            {lang === 'fr' ? 'Grille de Coloriage' : 'شبكة التلوين'}
          </h2>
          <p className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] opacity-60 mt-1">
            {lang === 'fr' ? '114 Sourates à colorier' : '١١٤ سورة للتلوين'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2.5 text-center">
            <p className="text-2xl font-black text-gradient leading-none">{coloredCount}</p>
            <p className="text-[8px] uppercase tracking-widest font-bold mt-0.5"
               style={{ color: 'var(--brand-text-muted)' }}>/ 114</p>
          </div>
          {coloredCount > 0 && (
            <button onClick={resetAll}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.6)' }}
              title={lang === 'fr' ? 'Tout réinitialiser' : 'إعادة ضبط الكل'}>
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {coloredCount > 0 && (
        <div className="glass-card px-5 py-3 relative overflow-hidden">
          <div className="card-accent-bar" />
          <div className="flex justify-between items-center mb-2">
            <p className="text-[9px] uppercase tracking-widest font-black"
               style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Progression' : 'التقدم'}
            </p>
            <p className="text-sm font-black text-gradient">{progressPct}%</p>
          </div>
          <div className="progress-bar">
            <motion.div className="progress-bar-fill"
              initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('grid')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all"
          style={activeTab === 'grid'
            ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 14px color-mix(in srgb, var(--brand-primary) 25%, transparent)' }
            : { background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-text-muted)' }}>
          <Grid size={15} />
          {lang === 'fr' ? 'Grille' : 'شبكة'}
        </button>
        <button
          onClick={() => setActiveTab('heart')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all"
          style={activeTab === 'heart'
            ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 14px color-mix(in srgb, var(--brand-primary) 25%, transparent)' }
            : { background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-text-muted)' }}>
          <Heart size={15} />
          {lang === 'fr' ? 'Cœur du Coran' : 'قلب القرآن'}
        </button>
      </div>

      <AnimatePresence mode="wait">

        {/* ── GRILLE tab ── */}
        {activeTab === 'grid' && (
          <motion.div key="grid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
              <div className="relative">
                <select
                  value={filterJuz ?? ''}
                  onChange={e => setFilterJuz(e.target.value === '' ? null : parseInt(e.target.value))}
                  className="mishkat-input pr-8 appearance-none cursor-pointer text-sm"
                  style={{ background: 'var(--custom-input-bg)', minWidth: '150px' }}
                >
                  <option value="">{lang === 'fr' ? 'Tous les Juz' : 'كل الأجزاء'}</option>
                  {[...Array(30)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {lang === 'fr' ? `Juz ${i + 1}` : `الجزء ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              <ColorPalette />
            </div>

            <div className="glass-card p-4 arabesque-pattern max-h-[60vh] overflow-y-auto relative"
                 style={{ color: 'var(--brand-primary)' }}>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-1.5">
                {displayedSurahs.map(surah => (
                  <motion.div key={surah.id} whileHover={{ scale: 1.12, zIndex: 20 }} whileTap={{ scale: 0.93 }} className="group relative">
                    <button
                      onClick={() => updateSurahColor(surah.id)}
                      className="w-full aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all"
                      style={{
                        backgroundColor: surah.color || 'color-mix(in srgb, var(--brand-surface) 95%, transparent)',
                        borderColor: surah.color ? 'transparent' : 'var(--border-subtle)',
                        boxShadow: surah.color ? `0 4px 14px ${surah.color}50` : 'var(--shadow-soft)',
                      }}
                      title={`${surah.id}. ${surah.arabicName} · ${surah.name}`}
                    >
                      <span className="text-[8px] sm:text-[9px] font-black leading-none"
                            style={{ color: surah.color ? 'rgba(255,255,255,0.9)' : 'color-mix(in srgb, var(--brand-primary) 55%, transparent)' }}>
                        {surah.id}
                      </span>
                      <span className="text-[6px] sm:text-[7px] leading-none text-center font-arabic truncate w-full mt-0.5"
                            style={{ color: surah.color ? 'rgba(255,255,255,0.8)' : 'color-mix(in srgb, var(--brand-primary) 40%, transparent)' }}>
                        {surah.arabicName}
                      </span>
                    </button>
                    {surah.color && (
                      <button onClick={e => resetSurah(surah.id, e)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow-lg items-center justify-center hidden group-hover:flex z-10"
                        style={{ color: 'rgba(239,68,68,0.75)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <X size={8} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <p className="text-[9px] text-center uppercase tracking-widest font-bold"
               style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>
              {lang === 'fr'
                ? 'Cliquez sur une sourate pour la colorier • Survolez pour réinitialiser'
                : 'انقر على السورة لتلوينها • حوّم لإعادة الضبط'}
            </p>
          </motion.div>
        )}

        {/* ── CŒUR tab ── */}
        {activeTab === 'heart' && (
          <motion.div key="heart" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">

            <div className="glass-card px-5 py-3 relative overflow-hidden">
              <div className="card-accent-bar" />
              <p className="text-xs font-medium" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr'
                  ? 'Colorez chaque sourate dans le cœur au rythme de votre mémorisation.'
                  : 'لوّن كل سورة في القلب بتقدم حفظك للقرآن الكريم.'}
              </p>
            </div>

            <ColorPalette />

            {/* Heart SVG coloring */}
            <div className="glass-card p-3 overflow-auto">
              {heartCells.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                       style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${H_W} ${H_H}`}
                  className="w-full mx-auto"
                  style={{ minWidth: '360px', maxWidth: '720px', display: 'block' }}
                >
                  <defs>
                    <clipPath id="heart-clip">
                      <path d={HEART_PATH} />
                    </clipPath>
                    {/* Subtle inner shadow filter */}
                    <filter id="inner-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#00000015" />
                    </filter>
                  </defs>

                  {/* Heart background fill */}
                  <path d={HEART_PATH} fill="#fff5f7" />

                  {/* Surah cells — clipped to heart shape */}
                  <g clipPath="url(#heart-clip)">
                    {heartCells.slice(0, userData.surahs.length).map((cellIdx, surahIdx) => {
                      const surah = userData.surahs[surahIdx];
                      if (!surah) return null;
                      const row = Math.floor(cellIdx / H_COLS);
                      const col = cellIdx % H_COLS;
                      const x = col * CW;
                      const y = row * CH;
                      const isColored = !!surah.color;

                      return (
                        <g key={surah.id} onClick={() => updateSurahColor(surah.id)}
                           style={{ cursor: 'pointer' }}>
                          <rect
                            x={x + 0.5} y={y + 0.5}
                            width={CW - 1} height={CH - 1}
                            rx={3}
                            fill={isColored ? surah.color! : '#fff0f3'}
                            stroke={isColored ? 'rgba(255,255,255,0.35)' : '#f5c8d0'}
                            strokeWidth="0.8"
                            filter={isColored ? undefined : 'url(#inner-shadow)'}
                          />
                          {/* Surah number (small, top-left) */}
                          <text
                            x={x + 3} y={y + 9}
                            fontSize="6"
                            fill={isColored ? 'rgba(255,255,255,0.55)' : '#c4879a'}
                            fontFamily="monospace"
                          >
                            {surah.id}
                          </text>
                          {/* Arabic name — centered */}
                          <text
                            x={x + CW / 2} y={y + CH / 2 + 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={surah.arabicName.length > 6 ? '7.5' : '9'}
                            fontFamily="'Noto Naskh Arabic', 'Traditional Arabic', serif"
                            fontWeight="600"
                            fill={isColored ? 'rgba(255,255,255,0.93)' : '#8B2635'}
                            style={{ direction: 'rtl' }}
                          >
                            {surah.arabicName}
                          </text>
                        </g>
                      );
                    })}
                  </g>

                  {/* Heart border */}
                  <path d={HEART_PATH} fill="none" stroke="#E8A4B0" strokeWidth="2.5" strokeLinejoin="round" />

                  {/* Decorative sparkles around the heart */}
                  {[
                    { x: 58,  y: 80,  s: 1.1, op: 0.55 },
                    { x: 730, y: 80,  s: 1.0, op: 0.5  },
                    { x: 30,  y: 230, s: 0.85,op: 0.4  },
                    { x: 755, y: 230, s: 0.85,op: 0.4  },
                    { x: 160, y: 660, s: 0.9, op: 0.45 },
                    { x: 630, y: 660, s: 0.9, op: 0.45 },
                    { x: 395, y: 12,  s: 0.75,op: 0.35 },
                  ].map((d, i) => (
                    <g key={i} transform={`translate(${d.x},${d.y}) scale(${d.s})`} opacity={d.op}>
                      <path d="M0,-10 L2,-2 L10,0 L2,2 L0,10 L-2,2 L-10,0 L-2,-2Z"
                            fill="#E8A4B0" />
                    </g>
                  ))}
                  {/* Small flower decorations */}
                  {[
                    { x: 48,  y: 130 },
                    { x: 745, y: 130 },
                    { x: 180, y: 668 },
                    { x: 615, y: 668 },
                  ].map((d, i) => (
                    <g key={`fl${i}`} transform={`translate(${d.x},${d.y})`} opacity="0.5">
                      {[0,72,144,216,288].map(a => (
                        <ellipse key={a}
                          cx={Math.cos(a * Math.PI / 180) * 7}
                          cy={Math.sin(a * Math.PI / 180) * 7}
                          rx="4.5" ry="3"
                          transform={`rotate(${a})`}
                          fill="#FFB3C1" />
                      ))}
                      <circle cx="0" cy="0" r="3.5" fill="#FFD700" />
                    </g>
                  ))}
                </svg>
              )}
            </div>

            <p className="text-[9px] text-center uppercase tracking-widest font-bold"
               style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>
              {lang === 'fr'
                ? 'Chaque section = une sourate · Cliquez pour colorier · Les couleurs sont partagées avec la Grille'
                : 'كل قطعة = سورة · انقر للتلوين · الألوان مشتركة مع الشبكة'}
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
