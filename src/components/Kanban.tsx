import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Surah, UserData } from '../types';
import { BookOpen, Clock, RotateCcw, CheckCircle, ChevronRight, Star } from 'lucide-react';

const COLUMN_CONFIG = [
  {
    id: 'not_started' as const,
    labelFr: 'Non commencé',
    labelAr: 'لم يبدأ',
    color: 'var(--status-not-started)',
    bgOpacity: 6,
    icon: BookOpen,
  },
  {
    id: 'in_progress' as const,
    labelFr: 'En apprentissage',
    labelAr: 'قيد الحفظ',
    color: 'var(--status-in-progress)',
    bgOpacity: 8,
    icon: Clock,
  },
  {
    id: 'review' as const,
    labelFr: 'En révision',
    labelAr: 'مراجعة',
    color: 'var(--status-review)',
    bgOpacity: 8,
    icon: RotateCcw,
  },
  {
    id: 'memorized' as const,
    labelFr: 'Maîtrisé',
    labelAr: 'تم الحفظ',
    color: 'var(--status-memorized)',
    bgOpacity: 8,
    icon: CheckCircle,
  },
];

export const KanbanSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {

  const updateStatus = (id: number, status: Surah['status']) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map((s: Surah) => s.id === id ? { ...s, status } : s)
    }));
  };

  const advanceStatus = (surah: Surah) => {
    const order: Surah['status'][] = ['not_started', 'in_progress', 'review', 'memorized'];
    const idx = order.indexOf(surah.status);
    const next = order[(idx + 1) % order.length];
    updateStatus(surah.id, next);
  };

  return (
    <div className="space-y-6 h-full flex flex-col pb-4">
      <header>
        <h2 className="text-4xl sm:text-5xl text-primary leading-tight">
          {lang === 'fr' ? 'Tableau de Suivi' : 'جدول المتابعة'}
        </h2>
        <p className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] opacity-60 mt-1">
          Kanban · {lang === 'fr' ? 'Cliquez pour avancer une étape' : 'انقر للتقدم خطوة'}
        </p>
      </header>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {COLUMN_CONFIG.map(col => {
          const surahs = userData.surahs.filter(s => s.status === col.id);
          const ColIcon = col.icon;
          return (
            <div key={col.id}
              className="flex-1 min-w-[230px] flex flex-col gap-3 rounded-3xl p-4"
              style={{ background: `color-mix(in srgb, ${col.color} ${col.bgOpacity}%, transparent)` }}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-1 pb-2 border-b"
                   style={{ borderColor: `color-mix(in srgb, ${col.color} 22%, transparent)` }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                       style={{ background: `color-mix(in srgb, ${col.color} 18%, transparent)` }}>
                    <ColIcon size={14} style={{ color: col.color }} />
                  </div>
                  <h3 className="font-black text-sm" style={{ color: 'var(--brand-primary)' }}>
                    {lang === 'fr' ? col.labelFr : col.labelAr}
                  </h3>
                </div>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full"
                      style={{ background: `color-mix(in srgb, ${col.color} 18%, transparent)`, color: col.color }}>
                  {surahs.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[55vh] pr-1">
                <AnimatePresence>
                  {surahs.map((surah: Surah) => (
                    <motion.div
                      key={surah.id}
                      layoutId={`surah-${surah.id}`}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="glass-card p-3.5 cursor-pointer group relative overflow-hidden"
                      onClick={() => advanceStatus(surah)}
                    >
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                           style={{ background: col.color, opacity: 0.7 }} />

                      <div className="flex items-start justify-between gap-2 pl-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                                  style={{ background: `color-mix(in srgb, ${col.color} 12%, transparent)`, color: col.color }}>
                              #{surah.id}
                            </span>
                            {/* Difficulty */}
                            <div className="flex gap-px">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={7}
                                  className={s <= surah.difficulty ? 'fill-current' : ''}
                                  style={{ color: s <= surah.difficulty ? 'var(--brand-secondary)' : 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }} />
                              ))}
                            </div>
                          </div>
                          <h4 className="font-bold text-sm leading-tight" style={{ color: 'var(--brand-primary)' }}>
                            {surah.name}
                          </h4>
                          <span className="text-base font-arabic leading-none block mt-0.5"
                                style={{ color: 'var(--brand-secondary)' }}>
                            {surah.arabicName}
                          </span>
                        </div>

                        {/* Advance arrow */}
                        {surah.status !== 'memorized' && (
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                               style={{ background: `color-mix(in srgb, ${col.color} 15%, transparent)` }}>
                            <ChevronRight size={12} style={{ color: col.color }} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {surahs.length === 0 && (
                  <div className="text-center py-8 opacity-40">
                    <ColIcon size={28} className="mx-auto mb-2" style={{ color: col.color }} />
                    <p className="text-[9px] font-bold uppercase tracking-wider"
                       style={{ color: 'var(--brand-text-muted)' }}>
                      {lang === 'fr' ? 'Vide' : 'فارغ'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
