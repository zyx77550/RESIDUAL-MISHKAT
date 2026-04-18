import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2, Target, TrendingUp, Award, Sparkles } from 'lucide-react';
import { UserData, Goal } from '../types';
import { cn } from '../lib/utils';

interface GoalsSectionProps {
  userData: UserData;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  lang: 'fr' | 'ar';
}

export const GoalsSection = ({ userData, setUserData, lang }: GoalsSectionProps) => {
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    const text = newGoal.trim();
    if (!text) return;
    const goal: Goal = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      text,
      completed: false,
      month: new Date().getMonth(),
    };
    setUserData(prev => ({ ...prev, goals: [goal, ...prev.goals] }));
    setNewGoal('');
  };

  const toggleGoal = (id: string) => {
    setUserData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setUserData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  const completedCount = userData.goals.filter(g => g.completed).length;
  const totalCount = userData.goals.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const pending = userData.goals.filter(g => !g.completed);
  const completed = userData.goals.filter(g => g.completed);

  return (
    <div className="space-y-7 pb-4">

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl text-primary leading-tight">
            {lang === 'fr' ? 'Objectifs' : 'الأهداف'}
          </h2>
          <p className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] opacity-60 mt-1">
            {lang === 'fr' ? 'Intentions & réussites' : 'النوايا والإنجازات'}
          </p>
        </div>

        {totalCount > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card px-5 py-4 flex items-center gap-4 flex-shrink-0">
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent"
                        style={{ color: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' }} />
                <motion.circle cx="50" cy="50" r="42" stroke="url(#goalGrad)" strokeWidth="8" fill="transparent"
                  strokeDasharray="263.9"
                  strokeDashoffset={263.9 * (1 - progress / 100)}
                  initial={{ strokeDashoffset: 263.9 }}
                  animate={{ strokeDashoffset: 263.9 * (1 - progress / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--brand-primary)" />
                    <stop offset="100%" stopColor="var(--brand-secondary)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp size={14} style={{ color: 'var(--brand-primary)' }} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-black text-gradient leading-none">{completedCount}</p>
              <p className="text-[9px] uppercase tracking-widest font-bold mt-0.5"
                 style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? `/ ${totalCount} complétés` : `/ ${totalCount} مكتمل`}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Add goal */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex gap-3">
        <input
          value={newGoal}
          onChange={e => setNewGoal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addGoal()}
          placeholder={lang === 'fr' ? 'Ajouter un objectif ou une intention…' : 'أضف هدفاً أو نية…'}
          className="mishkat-input flex-1"
        />
        <motion.button
          onClick={addGoal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="premium-button px-5 flex items-center gap-2 flex-shrink-0"
          disabled={!newGoal.trim()}
        >
          <Plus size={18} />
          <span className="hidden sm:inline text-sm">{lang === 'fr' ? 'Ajouter' : 'إضافة'}</span>
        </motion.button>
      </motion.div>

      {/* Progress bar (if has goals) */}
      {totalCount > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="glass-card px-5 py-4 relative overflow-hidden">
          <div className="card-accent-bar" />
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] uppercase tracking-widest font-black"
               style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Progression globale' : 'التقدم العام'}
            </p>
            <p className="text-base font-black text-gradient">{progress}%</p>
          </div>
          <div className="progress-bar">
            <motion.div className="progress-bar-fill"
              initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }} />
          </div>
        </motion.div>
      )}

      {/* Pending goals */}
      {pending.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-widest font-black mb-3 px-1"
             style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? 'En cours' : 'قيد التنفيذ'} ({pending.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {pending.map((goal, idx) => (
                <motion.div
                  layout key={goal.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, x: -20 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -3 }}
                  className="glass-card p-5 flex items-center gap-4 cursor-pointer group"
                  style={{ borderLeft: '3px solid var(--brand-secondary)' }}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={e => { e.stopPropagation(); toggleGoal(goal.id); }}
                    className="flex-shrink-0 transition-all"
                  >
                    <Circle size={24} style={{ color: 'var(--brand-text-muted)' }} strokeWidth={1.5} />
                  </motion.button>

                  <span className="flex-1 text-sm font-medium leading-snug"
                        style={{ color: 'var(--brand-text-main)' }}>
                    {goal.text}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={e => { e.stopPropagation(); deleteGoal(goal.id); }}
                    className="danger-btn flex-shrink-0"
                    style={{ opacity: 0.5 }}
                    aria-label={lang === 'fr' ? 'Supprimer' : 'حذف'}
                  >
                    <Trash2 size={15} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Completed goals */}
      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3 px-1">
            <p className="text-[11px] uppercase tracking-widest font-black"
               style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Complétés' : 'مكتملة'} ({completed.length})
            </p>
            <Award size={14} style={{ color: 'var(--brand-secondary)' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {completed.map((goal, idx) => (
                <motion.div
                  layout key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -2 }}
                  className="glass-card p-5 flex items-center gap-4 cursor-pointer group opacity-70 hover:opacity-90 transition-opacity"
                  onClick={() => toggleGoal(goal.id)}
                >
                  <CheckCircle2 size={24} style={{ color: 'var(--brand-secondary)' }} strokeWidth={2} className="flex-shrink-0" />

                  <span className="flex-1 text-sm line-through leading-snug"
                        style={{ color: 'var(--brand-text-muted)' }}>
                    {goal.text}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={e => { e.stopPropagation(); deleteGoal(goal.id); }}
                    className="danger-btn flex-shrink-0"
                    style={{ opacity: 0.45 }}
                    aria-label={lang === 'fr' ? 'Supprimer' : 'حذف'}
                  >
                    <Trash2 size={15} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Celebration */}
      {completedCount > 0 && completedCount === totalCount && totalCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-center gap-4 relative overflow-hidden"
          style={{ background: 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-surface))' }}>
          <div className="card-accent-bar" />
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'var(--brand-secondary)' }}>
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: 'var(--brand-primary)' }}>
              {lang === 'fr' ? '🎉 Tous les objectifs accomplis !' : '🎉 كل الأهداف مكتملة!'}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Continuez pour débloquer des badges.' : 'استمر لفتح المزيد من الشارات.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Target size={64} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--brand-primary)' }} />
          <p className="text-base font-medium" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? 'Aucun objectif pour l\'instant.' : 'لا توجد أهداف بعد.'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>
            {lang === 'fr' ? 'Commencez par en créer un ci-dessus !' : 'ابدأ بإنشاء هدف أعلاه!'}
          </p>
        </motion.div>
      )}
    </div>
  );
};
