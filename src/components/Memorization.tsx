import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Star, Search, Filter, ChevronDown, CheckCircle, Circle, Clock, RotateCcw } from 'lucide-react';
import { Surah, UserData } from '../types';
import { cn } from '../lib/utils';

type StatusFilter = 'all' | Surah['status'];

const STATUS_CONFIG = {
  not_started: { color: '#94a3b8', labelFr: 'Non commencé', labelAr: 'لم تبدأ' },
  in_progress:  { color: '#F4A261', labelFr: 'En cours',     labelAr: 'قيد الحفظ' },
  review:       { color: '#A8DADC', labelFr: 'En révision',  labelAr: 'مراجعة'   },
  memorized:    { color: '#B7E4C7', labelFr: 'Mémorisé',     labelAr: 'تم الحفظ' },
};

export const MemorizationSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [juzFilter, setJuzFilter] = useState<number | null>(null);

  const updateStatus = (id: number, status: Surah['status']) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map((s: Surah) => s.id === id ? { ...s, status } : s)
    }));
  };

  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const inProgressCount = userData.surahs.filter(s => s.status === 'in_progress').length;
  const reviewCount = userData.surahs.filter(s => s.status === 'review').length;

  const filtered = useMemo(() => {
    return userData.surahs.filter(s => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.arabicName.includes(search);
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesJuz = juzFilter === null || s.juz === juzFilter;
      return matchesSearch && matchesStatus && matchesJuz;
    });
  }, [userData.surahs, search, statusFilter, juzFilter]);

  const filterTabs: { id: StatusFilter; labelFr: string; labelAr: string; count: number; color: string }[] = [
    { id: 'all',         labelFr: 'Toutes', labelAr: 'الكل',      count: 114,           color: 'var(--brand-primary)' },
    { id: 'memorized',   labelFr: 'Mémo.',  labelAr: 'محفوظ',     count: memorizedCount, color: '#4CAF50' },
    { id: 'in_progress', labelFr: 'Cours',  labelAr: 'يُحفظ',     count: inProgressCount, color: '#F4A261' },
    { id: 'review',      labelFr: 'Révision',labelAr: 'مراجعة',   count: reviewCount,    color: '#A8DADC' },
    { id: 'not_started', labelFr: 'Non déb.',labelAr: 'لم يبدأ',  count: 114 - memorizedCount - inProgressCount - reviewCount, color: '#94a3b8' },
  ];

  const progressPct = Math.round((memorizedCount / 114) * 100);

  return (
    <div className="space-y-6 pb-4">

      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
        <h2 className="text-4xl sm:text-5xl text-primary leading-tight">
          {lang === 'fr' ? 'Mémorisation' : 'الحِفْظ'}
        </h2>
        <p className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] opacity-60">
          تَتَبُّعُ التَّقَدُّمِ فِي كُلِّ سُورَة
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-5 relative overflow-hidden">
        <div className="card-accent-bar" />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
              <BookOpen size={17} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <p className="font-black text-lg leading-none" style={{ color: 'var(--brand-primary)' }}>
                {memorizedCount} <span className="text-sm font-normal opacity-50">/ 114</span>
              </p>
              <p className="text-[9px] uppercase tracking-widest font-bold mt-0.5"
                 style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'Sourates mémorisées' : 'سورة محفوظة'}
              </p>
            </div>
          </div>
          <span className="text-3xl font-black text-gradient">{progressPct}%</span>
        </div>
        <div className="progress-bar">
          <motion.div className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1.8, ease: 'easeOut' }} />
        </div>
        {/* Mini stats */}
        <div className="flex gap-4 mt-3 flex-wrap">
          {[
            { count: inProgressCount, label: lang === 'fr' ? 'en cours' : 'قيد الحفظ', color: '#F4A261' },
            { count: reviewCount,     label: lang === 'fr' ? 'en révision' : 'مراجعة',  color: '#A8DADC' },
          ].filter(x => x.count > 0).map((x, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
                  style={{ color: x.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: x.color }} />
              {x.count} {x.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Search + Juz filter */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--brand-text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={lang === 'fr' ? 'Rechercher une sourate…' : 'ابحث عن سورة…'}
            className="mishkat-input pl-11"
          />
        </div>
        <div className="relative">
          <select
            value={juzFilter ?? ''}
            onChange={e => setJuzFilter(e.target.value === '' ? null : parseInt(e.target.value))}
            className="mishkat-input pr-8 appearance-none cursor-pointer min-w-[130px]"
            style={{ background: 'var(--custom-input-bg)' }}
          >
            <option value="">{lang === 'fr' ? 'Tous les Juz' : 'كل الأجزاء'}</option>
            {[...Array(30)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{lang === 'fr' ? `Juz ${i + 1}` : `الجزء ${i + 1}`}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                       style={{ color: 'var(--brand-text-muted)' }} />
        </div>
      </motion.div>

      {/* Status filter tabs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
            style={statusFilter === tab.id
              ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 14px color-mix(in srgb, var(--brand-primary) 30%, transparent)' }
              : { background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)', color: 'var(--brand-text-muted)' }
            }
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusFilter === tab.id ? '#fff' : tab.color }} />
            {lang === 'fr' ? tab.labelFr : tab.labelAr}
            <span className="ml-0.5 opacity-70">({tab.count})</span>
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={52} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--brand-primary)' }} />
          <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? 'Aucune sourate trouvée.' : 'لا توجد سورة.'}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((surah: Surah, idx: number) => {
              const cfg = STATUS_CONFIG[surah.status];
              return (
                <motion.div
                  key={surah.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(idx * 0.008, 0.4) }}
                  className="glass-card p-5 flex items-center gap-4 group relative overflow-hidden"
                >
                  {/* Status color strip */}
                  <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-all duration-300"
                       style={{ background: cfg.color, opacity: surah.status === 'not_started' ? 0.25 : 0.85 }} />

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                       style={{ background: `radial-gradient(circle at 20% 50%, color-mix(in srgb, ${cfg.color} 4%, transparent), transparent 70%)` }} />

                  {/* Number */}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-base shrink-0 transition-all duration-500 group-hover:scale-105 relative z-10"
                       style={{ background: surah.status === 'memorized' ? cfg.color : 'color-mix(in srgb, var(--brand-primary) 6%, transparent)', color: surah.status === 'memorized' ? '#fff' : 'var(--brand-primary)' }}>
                    <span className="font-black text-sm">{surah.id}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <h4 className="font-bold text-sm truncate" style={{ color: 'var(--brand-primary)' }}>
                        {surah.name}
                      </h4>
                      {userData.settings?.showArabicNames && (
                        <span className="text-base font-arabic flex-shrink-0" style={{ color: 'var(--brand-secondary)' }}>
                          {surah.arabicName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* Difficulty stars */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={9}
                                className={star <= surah.difficulty ? 'fill-current' : ''}
                                style={{ color: star <= surah.difficulty ? 'var(--brand-secondary)' : 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' }} />
                        ))}
                      </div>

                      {/* Status selector */}
                      <select
                        value={surah.status}
                        onChange={e => updateStatus(surah.id, e.target.value as Surah['status'])}
                        className="text-[9px] font-black uppercase tracking-widest rounded-lg px-2 py-1 border-none outline-none cursor-pointer transition-all"
                        style={{
                          background: `color-mix(in srgb, ${cfg.color} 14%, transparent)`,
                          color: cfg.color === '#94a3b8' ? 'var(--brand-text-muted)' : cfg.color,
                        }}
                      >
                        <option value="not_started">{lang === 'fr' ? 'Non commencé' : 'لم تبدأ'}</option>
                        <option value="in_progress">{lang === 'fr' ? 'En cours' : 'قيد الحفظ'}</option>
                        <option value="review">{lang === 'fr' ? 'En révision' : 'مراجعة'}</option>
                        <option value="memorized">{lang === 'fr' ? 'Mémorisé' : 'تم الحفظ'}</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};
