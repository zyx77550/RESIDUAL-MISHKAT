import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { UserData } from '../types';

interface DhikrOption {
  arabic: string;
  transliteration: string;
  fr: string;
  defaultTarget: number;
}

const DHIKR_OPTIONS: DhikrOption[] = [
  { arabic: 'سُبْحَانَ اللهِ',   transliteration: 'Subhânallah',   fr: 'Gloire à Allah',         defaultTarget: 33  },
  { arabic: 'الْحَمْدُ لِلهِ',   transliteration: 'Alhamdulillâh', fr: 'Louange à Allah',         defaultTarget: 33  },
  { arabic: 'اللهُ أَكْبَرُ',    transliteration: 'Allāhu Akbar',  fr: 'Allah est le plus Grand', defaultTarget: 33  },
  { arabic: 'لَا إِلَهَ إِلَّا اللهُ', transliteration: 'Lā ilāha illallāh', fr: 'Pas de divinité sauf Allah', defaultTarget: 100 },
  { arabic: 'أَسْتَغْفِرُ اللهَ', transliteration: 'Astaghfirullāh', fr: 'Je demande pardon à Allah', defaultTarget: 100 },
];

const TARGETS = [33, 99, 100];

export const TasbihSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [selectedDhikr, setSelectedDhikr] = useState(0);

  const progress = Math.min(count / target, 1);
  const progressDeg = progress * 360;

  const vibrate = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(40);
    }
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

  const currentDhikr = DHIKR_OPTIONS[selectedDhikr];

  return (
    <div className="flex flex-col items-center min-h-[70vh] gap-8 py-4">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-1.5">
        <h2 className="text-5xl" style={{ color: 'var(--brand-primary)', fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
          {lang === 'fr' ? 'Tasbih' : 'تَسْبِيح'}
        </h2>
        <p className="font-bold tracking-[0.4em] uppercase text-[10px]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>
          أَذْكَارُ الْمُسْلِمِ
        </p>
        {userData.tasbihCount > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-xs font-medium" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? `Total : ${userData.tasbihCount.toLocaleString()} dhikr` : `الإجمالي: ${userData.tasbihCount.toLocaleString()} ذكر`}
          </motion.p>
        )}
      </motion.div>

      {/* Dhikr selector */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full max-w-xl px-2">
        {DHIKR_OPTIONS.map((dhikr, idx) => (
          <button
            key={idx}
            onClick={() => handleDhikrChange(idx)}
            className="flex-shrink-0 px-4 py-2.5 rounded-2xl transition-all text-center"
            style={selectedDhikr === idx
              ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 16px color-mix(in srgb, var(--brand-primary) 30%, transparent)' }
              : { background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)', color: 'var(--brand-text-muted)' }
            }
          >
            <p className="text-sm font-arabic leading-none" style={{ color: selectedDhikr === idx ? '#fff' : 'var(--brand-primary)' }}>
              {dhikr.arabic}
            </p>
            <p className="text-[10px] font-bold mt-1 opacity-75">
              {dhikr.transliteration}
            </p>
          </button>
        ))}
      </motion.div>

      {/* Selected dhikr display */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedDhikr}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          className="text-center space-y-1">
          <p className="text-2xl font-arabic" style={{ color: 'var(--brand-primary)' }}>
            {currentDhikr.arabic}
          </p>
          {lang === 'fr' && (
            <p className="text-xs italic" style={{ color: 'var(--brand-text-muted)' }}>
              « {currentDhikr.fr} »
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Main counter button */}
      <div className="relative w-60 h-60 sm:w-72 sm:h-72">
        {/* Glow */}
        <div className="absolute inset-0 rounded-full blur-3xl transition-all duration-700 pointer-events-none"
             style={{ background: sessionComplete ? 'radial-gradient(circle, color-mix(in srgb, var(--brand-secondary) 25%, transparent), transparent)' : 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }} />

        {/* SVG ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" strokeWidth="4" fill="transparent"
                  stroke="color-mix(in srgb, var(--brand-primary) 8%, transparent)" />
          <motion.circle
            cx="50" cy="50" r="46"
            strokeWidth="5" fill="transparent"
            stroke="url(#tasbihRing)"
            strokeDasharray="289.0"
            strokeDashoffset={289.0 * (1 - progress)}
            animate={{ strokeDashoffset: 289.0 * (1 - progress) }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="tasbihRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-primary)" />
              <stop offset="100%" stopColor="var(--brand-secondary)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.91 }}
          animate={sessionComplete ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 0.4 }}
          onClick={increment}
          className="absolute inset-8 flex flex-col items-center justify-center rounded-full z-20 select-none"
          style={{
            background: sessionComplete
              ? 'color-mix(in srgb, var(--brand-secondary) 12%, var(--brand-surface))'
              : 'var(--brand-surface)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-gradient leading-none select-none"
              style={{
                fontSize: 'clamp(2.8rem, 9vw, 4.5rem)',
                fontFamily: 'Playfair Display, serif',
                fontStyle: 'italic',
                fontWeight: 700,
              }}
            >
              {count}
            </motion.span>
          </AnimatePresence>
          <span className="text-[9px] uppercase tracking-[0.2em] font-black mt-1"
                style={{ color: 'var(--brand-text-muted)' }}>/ {target}</span>
          {sessionComplete && (
            <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="text-[9px] font-black uppercase tracking-widest mt-1"
              style={{ color: 'var(--brand-secondary)' }}>
              {lang === 'fr' ? '✓ Terminé !' : '✓ أُنجِز!'}
            </motion.span>
          )}
          {count === 0 && !sessionComplete && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.5 }}
              className="text-[8px] font-bold uppercase tracking-wider mt-2"
              style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Appuyez' : 'اضغط'}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Session best */}
      {userData.tasbihSessionBest > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-2xl"
          style={{ background: 'color-mix(in srgb, var(--brand-secondary) 8%, transparent)', border: '1px solid var(--border-accent)' }}>
          <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {lang === 'fr' ? 'Meilleure session' : 'أفضل جلسة'}
          </span>
          <span className="text-base font-black text-gradient">{userData.tasbihSessionBest}</span>
        </motion.div>
      )}

      {/* Target selector */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="flex gap-2 p-1.5 rounded-[2rem]"
        style={{ background: 'color-mix(in srgb, var(--brand-surface) 85%, transparent)', border: '1px solid var(--border-subtle)' }}>
        {TARGETS.map(t => (
          <button
            key={t}
            onClick={() => handleTargetChange(t)}
            className="px-6 sm:px-9 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
            style={target === t
              ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 16px color-mix(in srgb, var(--brand-primary) 28%, transparent)' }
              : { color: 'var(--brand-text-muted)' }
            }
          >
            {t}
          </button>
        ))}
      </motion.div>
    </div>
  );
};
