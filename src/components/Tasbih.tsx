import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export const TasbihSection = ({ userData, setUserData, lang }: { userData: any, setUserData: any, lang: string }) => {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);

  const increment = () => {
    if (count < target) {
      setCount(count + 1);
    } else {
      setCount(1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-16">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-5xl text-primary">{lang === 'fr' ? 'Tasbih' : 'تَسْبِيح'}</h2>
        <p className="text-secondary font-bold tracking-[0.4em] uppercase text-xs opacity-60">أَذْكَارُ المُسْلِمِ</p>
      </motion.div>

      <div className="relative w-64 h-64 sm:w-80 sm:h-80 group">
        <div className="absolute inset-0 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors duration-700" />
        <svg className="w-full h-full transform -rotate-90 relative z-10">
          <circle
            cx="50%" cy="50%" r="42%"
            stroke="currentColor" strokeWidth="4"
            fill="transparent"
            className="text-primary/5"
          />
          <motion.circle
            cx="50%" cy="50%" r="42%"
            stroke="currentColor" strokeWidth="6"
            fill="transparent"
            strokeDasharray="100 100"
            pathLength="1"
            animate={{ pathLength: count / target }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="text-secondary"
            strokeLinecap="round"
          />
        </svg>
        
        <motion.button 
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.92 }}
          onClick={increment}
          className="absolute inset-8 flex flex-col items-center justify-center bg-surface/80 backdrop-blur-xl rounded-full shadow-lg border border-white/20 z-20 overflow-hidden group/btn"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          <motion.span 
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl sm:text-8xl font-serif italic text-primary relative z-10"
          >
            {count}
          </motion.span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted mt-2 relative z-10">/ {target}</span>
        </motion.button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4 p-2 bg-surface/40 backdrop-blur-md rounded-[2rem] border border-white/20 shadow-sm"
      >
        {[33, 99, 100].map(t => (
          <button 
            key={t}
            onClick={() => { setTarget(t); setCount(0); }}
            className={cn(
              "px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
              target === t ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:bg-primary/5 hover:text-primary"
            )}
          >
            {t}
          </button>
        ))}
      </motion.div>
    </div>
  );
};
