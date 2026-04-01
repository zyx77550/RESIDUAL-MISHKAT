import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const TasbihSection = ({ userData, setUserData, lang }: { userData: any, setUserData: any, lang: string }) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [sessionComplete, setSessionComplete] = useState(false);

  const increment = () => {
    if (count < target) {
      const newCount = count + 1;
      setCount(newCount);

      // Session terminée → sauvegarder dans userData
      if (newCount === target) {
        setSessionComplete(true);
        setUserData((prev: any) => ({
          ...prev,
          tasbihCount: (prev.tasbihCount || 0) + target,
          tasbihSessionBest: Math.max(prev.tasbihSessionBest || 0, target)
        }));
        setTimeout(() => setSessionComplete(false), 2000);
      }
    } else {
      // Reset pour nouvelle session
      setCount(1);
      setSessionComplete(false);
    }
  };

  const handleTargetChange = (t: number) => {
    setTarget(t);
    setCount(0);
    setSessionComplete(false);
  };

  const progress = count / target;
  const progressPercent = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12 sm:gap-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-5xl" style={{ color: 'var(--brand-primary)', fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}>
          {lang === 'fr' ? 'Tasbih' : 'تَسْبِيح'}
        </h2>
        <p className="font-bold tracking-[0.4em] uppercase text-xs" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>
          أَذْكَارُ المُسْلِمِ
        </p>
        {userData.tasbihCount > 0 && (
          <p className="text-xs font-medium" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? `Total : ${userData.tasbihCount} dhikr` : `الإجمالي: ${userData.tasbihCount} ذكر`}
          </p>
        )}
      </motion.div>

      <div className="relative w-56 h-56 sm:w-80 sm:h-80 group">
        <div
          className="absolute inset-0 rounded-full blur-3xl transition-colors duration-700"
          style={{ background: sessionComplete ? 'radial-gradient(circle, color-mix(in srgb, var(--brand-secondary) 20%, transparent), transparent)' : 'color-mix(in srgb, var(--brand-secondary) 5%, transparent)' }}
        />
        <svg className="w-full h-full transform -rotate-90 relative z-10">
          <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="4" fill="transparent" style={{ color: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }} />
          <motion.circle
            cx="50%" cy="50%" r="42%"
            stroke="url(#tasbihGrad)"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray="100 100"
            pathLength="1"
            animate={{ pathLength: progress }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="tasbihGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-primary)" />
              <stop offset="100%" stopColor="var(--brand-secondary)" />
            </linearGradient>
          </defs>
        </svg>

        <motion.button
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.92 }}
          onClick={increment}
          animate={sessionComplete ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="absolute inset-8 flex flex-col items-center justify-center backdrop-blur-xl rounded-full shadow-lg border z-20 overflow-hidden group/btn"
          style={{
            background: sessionComplete
              ? 'color-mix(in srgb, var(--brand-secondary) 15%, var(--brand-surface))'
              : 'var(--brand-surface)',
            borderColor: 'rgba(255,255,255,0.2)'
          }}
        >
          <div className="absolute inset-0 rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity" style={{ background: 'color-mix(in srgb, var(--brand-secondary) 5%, transparent)' }} />
          <motion.span
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10"
            style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: sessionComplete ? 'var(--brand-secondary)' : 'var(--brand-primary)', fontWeight: 700 }}
          >
            {count}
          </motion.span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black mt-1 relative z-10" style={{ color: 'var(--brand-text-muted)' }}>
            / {target}
          </span>
          {sessionComplete && (
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[9px] font-black uppercase tracking-widest relative z-10"
              style={{ color: 'var(--brand-secondary)' }}
            >
              {lang === 'fr' ? '✓ Terminé !' : '✓ تم!'}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Stats rapides */}
      {userData.tasbihSessionBest > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-2xl"
          style={{ background: 'color-mix(in srgb, var(--brand-secondary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--brand-secondary) 15%, transparent)' }}
        >
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {lang === 'fr' ? 'Meilleure session' : 'أفضل جلسة'}
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
            {userData.tasbihSessionBest}
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 p-2 rounded-[2rem] border shadow-sm"
        style={{ background: 'color-mix(in srgb, var(--brand-surface) 80%, transparent)', borderColor: 'rgba(255,255,255,0.2)' }}
      >
        {[33, 99, 100].map(t => (
          <button
            key={t}
            onClick={() => handleTargetChange(t)}
            className="px-6 sm:px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
            style={target === t
              ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 16px color-mix(in srgb, var(--brand-primary) 25%, transparent)' }
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
