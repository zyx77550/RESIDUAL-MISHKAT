import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { UserData } from '../types';
import confetti from 'canvas-confetti';

const COLORING_PALETTE = [
  '#8B2635', '#D4AF37', '#A8DADC', '#B7E4C7', '#F4A261', '#E76F51',
  '#000000', '#ffffff', '#888888', '#1D3557', '#E63946', '#2A9D8F',
  '#FFD6E7', '#FFC9D0', '#D0D9FF', '#E8D5FF', '#C7ECEE', '#D1F5E0',
  '#7B2FBE', '#FB5607', '#FFBE0B', '#06D6A0', '#118AB2', '#8338EC',
  '#0f172a', '#1b4332', '#3d0000', '#4a1942', '#14213d', '#2d1b69',
];

export const ColoringGrid = ({ userData, setUserData, lang }: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const [selectedColor, setSelectedColor] = useState('#8B2635');
  const [filterJuz, setFilterJuz] = useState<number | null>(null);

  const updateSurahColor = (id: number) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: selectedColor, status: 'memorized' as const } : s),
    }));
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 }, colors: [selectedColor, '#D4AF37', '#ffffff'] });
  };

  const resetSurah = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: undefined, status: 'not_started' as const } : s),
    }));
  };

  const displayedSurahs = filterJuz !== null ? userData.surahs.filter(s => s.juz === filterJuz) : userData.surahs;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Grille des 114 Sourates' : 'شبكة الـ 114 سورة'}</h2>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--brand-text-muted)' }}>
            {userData.surahs.filter(s => s.color).length} / 114 {lang === 'fr' ? 'mémorisées' : 'محفوظة'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Juz filter */}
          <select
            value={filterJuz ?? ''}
            onChange={e => setFilterJuz(e.target.value === '' ? null : parseInt(e.target.value))}
            className="px-3 py-2 rounded-xl text-xs font-bold border bg-transparent focus:outline-none"
            style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)', color: 'var(--brand-primary)' }}
          >
            <option value="">{lang === 'fr' ? 'Tous les Juz' : 'كل الأجزاء'}</option>
            {[...Array(30)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{lang === 'fr' ? `Juz ${i + 1}` : `الجزء ${i + 1}`}</option>
            ))}
          </select>
          {/* Color palette */}
          <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl shadow-sm" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
            {COLORING_PALETTE.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className="rounded-full transition-all border"
                style={{
                  width: 24, height: 24,
                  background: c,
                  borderColor: selectedColor === c ? 'var(--brand-primary)' : 'rgba(139,38,53,0.1)',
                  transform: selectedColor === c ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: selectedColor === c ? '0 0 0 2px white, 0 0 0 3px var(--brand-primary)' : 'none',
                }}
              />
            ))}
            <input
              type="color"
              value={selectedColor.startsWith('#') ? selectedColor : '#8B2635'}
              onChange={e => setSelectedColor(e.target.value)}
              className="w-6 h-6 rounded-full cursor-pointer border-none"
              title={lang === 'fr' ? 'Couleur personnalisée' : 'لون مخصص'}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-1.5 p-4 glass-card arabesque-pattern max-h-[65vh] overflow-y-auto">
        {displayedSurahs.map(surah => (
          <motion.div
            key={surah.id}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            className="group relative"
          >
            <button
              onClick={() => updateSurahColor(surah.id)}
              className="w-full aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all shadow-sm"
              style={{
                backgroundColor: surah.color || 'white',
                borderColor: surah.color ? 'transparent' : 'rgba(139,38,53,0.08)',
                boxShadow: surah.color ? `0 4px 12px ${surah.color}40` : undefined,
              }}
              title={`${surah.id}. ${surah.arabicName} · ${surah.name}`}
            >
              <span className="text-[9px] sm:text-[10px] font-black leading-none" style={{ color: surah.color ? 'rgba(255,255,255,0.9)' : 'rgba(139,38,53,0.5)' }}>{surah.id}</span>
              <span className="text-[7px] sm:text-[8px] leading-tight text-center mt-0.5 font-arabic truncate w-full text-center" style={{ color: surah.color ? 'rgba(255,255,255,0.85)' : 'rgba(139,38,53,0.6)' }}>{surah.arabicName}</span>
            </button>
            {/* Reset button on hover */}
            {surah.color && (
              <button
                onClick={e => resetSurah(surah.id, e)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow-md items-center justify-center hidden group-hover:flex transition-all"
                style={{ color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <X size={8} />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};