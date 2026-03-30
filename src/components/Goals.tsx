import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { UserData } from '../types';
import { cn } from '../lib/utils';

export const GoalsSection = ({ userData, setUserData, lang }: { userData: any, setUserData: any, lang: string }) => {
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (!newGoal.trim()) return;
    const goal = {
      id: Math.random().toString(36).substr(2, 9),
      text: newGoal,
      completed: false,
      month: new Date().getMonth()
    };
    setUserData((prev: any) => ({
      ...prev,
      goals: [goal, ...prev.goals]
    }));
    setNewGoal('');
  };

  const toggleGoal = (id: string) => {
    setUserData((prev: any) => ({
      ...prev,
      goals: prev.goals.map((g: any) => g.id === id ? { ...g, completed: !g.completed } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setUserData((prev: any) => ({
      ...prev,
      goals: prev.goals.filter((g: any) => g.id !== id)
    }));
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl text-primary">{lang === 'fr' ? 'Mes Objectifs' : 'أهدافي'}</h2>
        <p className="text-secondary opacity-60 font-bold uppercase tracking-widest text-xs mt-1">{lang === 'fr' ? 'Planifiez votre réussite' : 'خطط لنجاحك'}</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder={lang === 'fr' ? 'Ajouter un objectif...' : 'أضف هدفاً جديداً...'}
          className="flex-1 bg-surface border-none rounded-2xl px-6 py-4 shadow-sm focus:ring-2 focus:ring-secondary min-w-0 text-primary"
        />
        <button 
          onClick={addGoal}
          className="bg-primary text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-transform flex justify-center items-center"
        >
          <Plus />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userData.goals.map((goal: any) => (
          <motion.div 
            layout
            key={goal.id}
            className={cn(
              "glass-card p-6 flex items-center gap-4 transition-all",
              goal.completed ? "opacity-60" : "border-l-4 border-secondary"
            )}
          >
            <button onClick={() => toggleGoal(goal.id)}>
              {goal.completed ? (
                <CheckCircle2 className="text-pastel-green" size={28} />
              ) : (
                <Circle className="text-text-muted" size={28} />
              )}
            </button>
            <span className={cn("flex-1 text-lg text-primary", goal.completed && "line-through text-text-muted")}>
              {goal.text}
            </span>
            <button onClick={() => deleteGoal(goal.id)} className="text-text-muted hover:text-red-500 transition-colors">
              <Trash2 size={20} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
