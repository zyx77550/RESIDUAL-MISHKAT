import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { Surah, UserData } from '../types';
import { cn } from '../lib/utils';

export const KanbanSection = ({ userData, setUserData, lang }: { userData: UserData, setUserData: React.Dispatch<React.SetStateAction<UserData>>, lang: string }) => {
  const columns = [
    { id: 'not_started', title: lang === 'fr' ? 'Non commencé' : 'لم يبدأ' },
    { id: 'in_progress', title: lang === 'fr' ? 'En apprentissage' : 'قيد الحفظ' },
    { id: 'review', title: lang === 'fr' ? 'En révision' : 'قيد المراجعة' },
    { id: 'memorized', title: lang === 'fr' ? 'Maîtrisé' : 'تم الحفظ' },
  ];

  const updateStatus = (id: number, status: string) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map((s: Surah) => s.id === id ? { ...s, status } : s)
    }));
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <header>
        <h2 className="text-3xl text-primary">{lang === 'fr' ? 'Tableau de Suivi' : 'جدول المتابعة'}</h2>
        <p className="text-secondary opacity-60 font-bold uppercase tracking-widest text-xs mt-1">Kanban Style</p>
      </header>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 min-w-[250px] bg-primary/5 rounded-3xl p-4 flex flex-col gap-4">
            <h3 className="font-bold text-primary px-2 flex justify-between items-center">
              {col.title}
              <span className="text-[10px] bg-surface text-primary px-2 py-1 rounded-full shadow-sm">
                {userData.surahs.filter((s: Surah) => s.status === col.id).length}
              </span>
            </h3>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2">
              {userData.surahs.filter((s: Surah) => s.status === col.id).map((surah: Surah) => (
                <motion.div 
                  layoutId={surah.id.toString()}
                  key={surah.id} 
                  className="glass-card p-4 cursor-pointer hover:border-secondary transition-all"
                  onClick={() => {
                    const nextStatus = columns[(columns.findIndex(c => c.id === col.id) + 1) % columns.length].id;
                    updateStatus(surah.id, nextStatus);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-text-muted">#{surah.id}</span>
                    <span className="font-arabic text-secondary">{surah.arabicName}</span>
                  </div>
                  <h4 className="font-bold text-sm mt-1 text-primary">{surah.name}</h4>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
