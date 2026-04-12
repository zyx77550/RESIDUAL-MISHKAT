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

// Classic deep-dip heart — 800×700 viewBox
const HEART_PATH =
  'M400,675 C250,590 35,490 35,280 C35,130 130,70 240,70 C310,70 365,115 400,165 C435,115 490,70 560,70 C670,70 765,130 765,280 C765,490 550,590 400,675Z';

const H_W = 800;
const H_H = 700;
// Pointy-top hexagons (vertex at top & bottom)
const HEX_R = 30;
const HEX_COL_SPACING = HEX_R * Math.sqrt(3);   // ≈ 51.96 — horizontal gap between centres in a row
const HEX_ROW_SPACING = HEX_R * 1.5;             // = 45   — vertical gap between row centres

/** SVG path for a pointy-top hexagon centred at (cx, cy) with circumradius r */
const hexPath = (cx: number, cy: number, r: number): string => {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6; // 30°, 90°, 150°, 210°, 270°, 330°
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join('L')}Z`;
};

export const ColoringGrid = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const [selectedColor, setSelectedColor] = useState('#8B2635');
  const [filterJuz, setFilterJuz] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'grid' | 'heart'>('grid');
  const [heartCells, setHeartCells] = useState<Array<{ cx: number; cy: number }>>([]);

  // Compute which hex centres fall inside the heart (runs once)
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = H_W;
    canvas.height = H_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const path = new Path2D(HEART_PATH);
    const cells: { cx: number; cy: number }[] = [];

    const marginX = HEX_R * Math.sqrt(3) / 2; // ≈ 26
    const marginY = HEX_R;                      // = 30
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
        if (ctx.isPointInPath(path, x, y)) {
          cells.push({ cx: x, cy: y });
        }
      }
    }

    // Sort top-to-bottom (row bands), then left-to-right within each band
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
                  ? 'Un grand cœur divisé en 114 sections — une par sourate. Colorez chacune au fil de votre mémorisation.'
                  : 'قلب كبير مقسَّم إلى ١١٤ قطعة — كل قطعة تمثل سورة. لوّن كل قطعة بتقدم حفظك.'}
              </p>
            </div>

            <ColorPalette />

            {/* Heart SVG */}
            <div className="glass-card p-2 sm:p-4 overflow-auto flex justify-center">
              {heartCells.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 rounded-full border-4 animate-spin"
                       style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${H_W} ${H_H}`}
                  style={{ width: '100%', maxWidth: 720, minWidth: 320, display: 'block' }}
                  aria-label={lang === 'fr' ? 'Cœur du Coran' : 'قلب القرآن'}
                >
                  <defs>
                    <clipPath id="heart-clip">
                      <path d={HEART_PATH} />
                    </clipPath>
                    <radialGradient id="heart-bg-grad" cx="50%" cy="38%" r="65%">
                      <stop offset="0%" stopColor="#fff8f9" />
                      <stop offset="100%" stopColor="#ffe4ea" />
                    </radialGradient>
                    {/* Drop shadow around the whole heart */}
                    <filter id="heart-glow" x="-8%" y="-8%" width="116%" height="116%">
                      <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#D4AF37" floodOpacity="0.22" />
                    </filter>
                  </defs>

                  {/* Outer glow */}
                  <path d={HEART_PATH} fill="#ffe4ea" filter="url(#heart-glow)" opacity="0.7" />

                  {/* Heart background gradient */}
                  <path d={HEART_PATH} fill="url(#heart-bg-grad)" />

                  {/* ── Hex cells, clipped to heart ── */}
                  <g clipPath="url(#heart-clip)">
                    {heartCells.map(({ cx, cy }, idx) => {
                      const surah = userData.surahs[idx]; // undefined for cells beyond 114
                      const isColored = !!surah?.color;
                      const nameLen = surah?.arabicName.length ?? 0;
                      const nameFontSize = nameLen > 7 ? 6.5 : nameLen > 5 ? 7.5 : 9;

                      return (
                        <g
                          key={idx}
                          onClick={surah ? () => updateSurahColor(surah.id) : undefined}
                          style={{ cursor: surah ? 'pointer' : 'default' }}
                        >
                          {/* Hex fill */}
                          <path
                            d={hexPath(cx, cy, HEX_R - 1.2)}
                            fill={isColored ? surah!.color! : '#fff0f4'}
                            stroke={isColored ? 'rgba(255,255,255,0.30)' : '#f0b8c4'}
                            strokeWidth="0.9"
                          />
                          {/* Subtle inner shine for colored cells */}
                          {isColored && (
                            <path
                              d={hexPath(cx, cy - 4, HEX_R * 0.55)}
                              fill="rgba(255,255,255,0.10)"
                              stroke="none"
                              style={{ pointerEvents: 'none' }}
                            />
                          )}
                          {/* Only render text for the 114 surah cells */}
                          {surah && (
                            <>
                              <text
                                x={cx} y={cy - 9}
                                textAnchor="middle"
                                fontSize="5.5"
                                fontFamily="monospace"
                                fill={isColored ? 'rgba(255,255,255,0.60)' : '#c07080'}
                                style={{ pointerEvents: 'none' }}
                              >
                                {surah.id}
                              </text>
                              <text
                                x={cx} y={cy + 5}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={nameFontSize}
                                fontFamily="'Noto Naskh Arabic', 'Traditional Arabic', serif"
                                fontWeight="700"
                                fill={isColored ? 'rgba(255,255,255,0.93)' : '#8B2635'}
                                style={{ pointerEvents: 'none', direction: 'rtl' }}
                              >
                                {surah.arabicName}
                              </text>
                            </>
                          )}
                        </g>
                      );
                    })}
                  </g>

                  {/* ── Heart border — white mask + decorative lines ── */}
                  {/* White stroke hides partially clipped hexes at the edge */}
                  <path d={HEART_PATH} fill="none" stroke="white" strokeWidth="10" />
                  {/* Outer gold line */}
                  <path d={HEART_PATH} fill="none" stroke="#D4AF37" strokeWidth="2.8" strokeLinejoin="round" />
                  {/* Inner bordeaux line */}
                  <path d={HEART_PATH} fill="none" stroke="#8B2635" strokeWidth="1" strokeLinejoin="round" opacity="0.35" />

                  {/* ── Decorative sparkles (4-point stars) ── */}
                  {[
                    { x: 55,  y: 88,  s: 1.1, o: 0.55 },
                    { x: 735, y: 88,  s: 1.0, o: 0.5  },
                    { x: 28,  y: 240, s: 0.85,o: 0.4  },
                    { x: 762, y: 240, s: 0.85,o: 0.4  },
                    { x: 168, y: 662, s: 0.9, o: 0.45 },
                    { x: 625, y: 662, s: 0.9, o: 0.45 },
                    { x: 397, y: 16,  s: 0.75,o: 0.35 },
                    { x: 197, y: 48,  s: 0.65,o: 0.3  },
                    { x: 597, y: 48,  s: 0.65,o: 0.3  },
                  ].map((d, i) => (
                    <g key={`sp${i}`} transform={`translate(${d.x},${d.y}) scale(${d.s})`} opacity={d.o}>
                      <path d="M0,-11 L2.5,-2.5 L11,0 L2.5,2.5 L0,11 L-2.5,2.5 L-11,0 L-2.5,-2.5Z"
                            fill="#D4AF37" />
                    </g>
                  ))}

                  {/* ── Decorative 5-petal flowers ── */}
                  {[
                    { x: 46,  y: 148 },
                    { x: 748, y: 148 },
                    { x: 190, y: 668 },
                    { x: 605, y: 668 },
                    { x: 397, y: 690 },
                  ].map((d, i) => (
                    <g key={`fl${i}`} transform={`translate(${d.x},${d.y})`} opacity="0.55">
                      {[0, 72, 144, 216, 288].map(angle => (
                        <ellipse key={angle}
                          cx={Math.cos((angle * Math.PI) / 180) * 7}
                          cy={Math.sin((angle * Math.PI) / 180) * 7}
                          rx="4.5" ry="2.8"
                          transform={`rotate(${angle})`}
                          fill="#FFB3C1" />
                      ))}
                      <circle cx="0" cy="0" r="3.2" fill="#D4AF37" />
                    </g>
                  ))}

                  {/* ── Title at the very bottom outside the heart ── */}
                  <text
                    x={H_W / 2} y={H_H - 4}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="'Noto Naskh Arabic', serif"
                    fill="#8B2635"
                    opacity="0.5"
                  >
                    قلب القرآن الكريم
                  </text>
                </svg>
              )}
            </div>

            {heartCells.length > 0 && heartCells.length < 114 && (
              <p className="text-[9px] text-center text-amber-600 font-bold">
                {heartCells.length} / 114 sections affichées
              </p>
            )}

            <p className="text-[9px] text-center uppercase tracking-widest font-bold"
               style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>
              {lang === 'fr'
                ? 'Chaque hexagone = une sourate · Cliquez pour colorier · Partagé avec la Grille'
                : 'كل سداسي = سورة · انقر للتلوين · مشترك مع الشبكة'}
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
