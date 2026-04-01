import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2, Target, TrendingUp, Award } from 'lucide-react';
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
    if (!newGoal.trim()) return;
    const goal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      text: newGoal,
      completed: false,
      month: new Date().getMonth()
    };
    setUserData((prev: UserData) => ({ ...prev, goals: [goal, ...prev.goals] }));
    setNewGoal('');
  };

  const toggleGoal = (id: string) => {
    setUserData((prev: UserData) => ({
      ...prev,
      goals: prev.goals.map((g: Goal) => g.id === id ? { ...g, completed: !g.completed } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setUserData((prev: UserData) => ({
      ...prev,
      goals: prev.goals.filter((g: Goal) => g.id !== id)
    }));
  };

  const completedCount = userData.goals.filter(g => g.completed).length;
  const totalCount = userData.goals.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
            {lang === 'fr' ? 'Mes Objectifs' : 'أهدافي'}
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? 'Planifiez votre réussite' : 'خطط لنجاحك'}
          </p>
        </div>

        {totalCount > 0 && (
          <div className="glass-card px-4 py-3 flex items-center gap-4">
            <div className="relative w-14 h-14">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="6" fill="transparent" style={{ color: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' }} />
                <circle cx="50%" cy="50%" r="40%" stroke="var(--brand-primary)" strokeWidth="6" fill="transparent" strokeDasharray="100 100" pathLength="1" style={{ pathLength: progress / 100 } as React.CSSProperties} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <TrendingUp size={16} style={{ color: 'var(--brand-primary)' }} />
              </div>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>{completedCount}/{totalCount}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'Complétés' : 'مكتمل'}
              </p>
            </div>
          </div>
        )}
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
          placeholder={lang === 'fr' ? 'Ajouter un objectif...' : 'أضف هدفاً جديداً...'}
          className="flex-1 bg-surface border-none rounded-2xl px-6 py-4 shadow-sm focus:ring-2 min-w-0 text-primary"
          style={{ backgroundColor: 'var(--brand-surface)', color: 'var(--brand-text-main)' }}
        />
        <motion.button
          onClick={addGoal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-white p-4 rounded-2xl shadow-lg flex justify-center items-center font-bold"
          style={{ backgroundColor: 'var(--brand-primary)' }}
        >
          <Plus size={24} />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {userData.goals.map((goal: Goal, index: number) => (
            <motion.div
              layout
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className={cn(
                "glass-card p-6 flex items-center gap-4 transition-all cursor-pointer",
                goal.completed ? "opacity-70" : "border-l-4"
              )}
              style={{
                borderLeftColor: goal.completed ? 'transparent' : 'var(--brand-secondary)',
                backgroundColor: goal.completed ? 'color-mix(in srgb, var(--brand-secondary) 8%, var(--brand-surface))' : 'var(--brand-surface)'
              }}
              onClick={() => toggleGoal(goal.id)}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); toggleGoal(goal.id); }}
                className="flex-shrink-0"
              >
                {goal.completed ? (
                  <CheckCircle2 size={28} style={{ color: 'var(--brand-secondary)' }} strokeWidth={2.5} />
                ) : (
                  <Circle size={28} style={{ color: 'var(--brand-text-muted)' }} strokeWidth={2} />
                )}
              </motion.button>

              <span
                className={cn("flex-1 text-lg", goal.completed && "line-through")}
                style={{ color: goal.completed ? 'var(--brand-text-muted)' : 'var(--brand-text-main)', fontWeight: goal.completed ? 400 : 500 }}
              >
                {goal.text}
              </span>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                className="flex-shrink-0 p-2 rounded-full transition-colors"
                style={{ color: 'var(--brand-text-muted)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--brand-text-muted)'; }}
              >
                <Trash2 size={20} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {userData.goals.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Target size={64} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--brand-primary)' }} />
          <p style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? 'Aucun objectif pour le moment. Commencez par en créer un !' : 'لا توجد أهداف حالياً. ابدأ بإنشاء واحد!'}
          </p>
        </motion.div>
      )}

      {completedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 flex items-center gap-4"
          style={{ backgroundColor: 'color-mix(in srgb, var(--brand-secondary) 10%, var(--brand-surface))' }}
        >
          <Award size={32} style={{ color: 'var(--brand-secondary)' }} />
          <div>
            <p className="font-bold" style={{ color: 'var(--brand-primary)' }}>
              {lang === 'fr' ? `Bravo ! Vous avez complété ${completedCount} objectif${completedCount > 1 ? 's' : ''} !` : `أحسنت! أكملت ${completedCount} هدفاً!`}
            </p>
            <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Continuez comme ça pour débloquer plus de badges.' : 'استمر هكذا لفتح المزيد من الشارات.'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
