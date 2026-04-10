import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, RotateCcw, Grid } from 'lucide-react';
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

export const ColoringGrid = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const [selectedColor, setSelectedColor] = useState('#8B2635');
  const [filterJuz, setFilterJuz] = useState<number | null>(null);

  const coloredCount = userData.surahs.filter(s => s.color).length;

  const updateSurahColor = (id: number) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: selectedColor, status: 'memorized' as const } : s),
    }));
    confetti({
      particleCount: 55,
      spread: 75,
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

  const progressPct = Math.round((coloredCount / 114) * 100);

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

        {/* Progress + Reset */}
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        {/* Juz filter */}
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

        {/* Color palette */}
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

          {/* Custom color */}
          <div className="flex items-center gap-1 p-1.5 rounded-2xl"
               style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' }}>
            <div className="relative">
              <input
                type="color"
                value={selectedColor.startsWith('#') ? selectedColor : '#8B2635'}
                onChange={e => setSelectedColor(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                title={lang === 'fr' ? 'Couleur personnalisée' : 'لون مخصص'}
              />
              <div className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
                   style={{ background: selectedColor }}>
                <Palette size={10} className="text-white mix-blend-difference" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="glass-card p-4 arabesque-pattern max-h-[60vh] overflow-y-auto relative"
           style={{ color: 'var(--brand-primary)' }}>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-1.5">
          {displayedSurahs.map(surah => (
            <motion.div
              key={surah.id}
              whileHover={{ scale: 1.12, zIndex: 20 }}
              whileTap={{ scale: 0.93 }}
              className="group relative"
            >
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

              {/* Reset on hover */}
              {surah.color && (
                <button
                  onClick={e => resetSurah(surah.id, e)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow-lg items-center justify-center hidden group-hover:flex z-10"
                  style={{ color: 'rgba(239,68,68,0.75)', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  <X size={8} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info */}
      <p className="text-[9px] text-center uppercase tracking-widest font-bold"
         style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>
        {lang === 'fr'
          ? 'Cliquez sur une sourate pour la colorier • Survolez pour réinitialiser'
          : 'انقر على السورة لتلوينها • حوّم لإعادة الضبط'}
      </p>
    </div>
  );
};
