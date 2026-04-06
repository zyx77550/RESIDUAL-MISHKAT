import React from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, BookOpen, Target, Award, CheckCircle2, Circle } from 'lucide-react';
import { UserData } from '../types';
import { cn } from '../lib/utils';

export const Dashboard = ({ userData, lang }: { userData: UserData; lang: string }) => {
  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const progress = (memorizedCount / 114) * 100;
  const username = userData.settings?.username || 'Hafiz';

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {lang === 'fr' ? new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="text-3xl sm:text-5xl leading-tight" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{username === 'Rahima' ? (lang === 'fr' ? 'Bienvenue,' : 'مرحباً،') : (lang === 'fr' ? 'Paix sur toi,' : 'السلام عليك')}</h2>
          <h2 className="text-3xl sm:text-5xl leading-tight text-gradient" style={{ fontWeight: 700 }}>{lang === 'fr' ? username : `يا ${username}`}</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-8" style={{ background: 'var(--brand-secondary)', opacity: 0.4 }} />
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: 'var(--brand-secondary)', opacity: 0.55 }}>تَطْبِيقُ الحِفْظِ المِثَالِي</p>
            <div className="h-px w-8" style={{ background: 'var(--brand-secondary)', opacity: 0.4 }} />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-right hidden sm:block">
          <p className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'var(--brand-text-muted)' }}>Pensée et Dévloppée par</p>
          <p className="text-base font-semibold mt-0.5" style={{ color: 'var(--brand-secondary)' }}>Rahima @Hamda_wa_chakra</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--brand-secondary) 6%, transparent), transparent 70%)' }} />
          <div className="card-accent-bar" />
          <div className="relative w-44 h-44">
            <div className="absolute inset-0 rounded-full" style={{ border: '1px dashed var(--border-accent)', opacity: 0.5, animation: 'spin 30s linear infinite' }} />
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="6" fill="transparent" style={{ color: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }} />
              <motion.circle cx="50%" cy="50%" r="42%" stroke="url(#progressGrad)" strokeWidth="6" fill="transparent" strokeDasharray="100 100" pathLength="1" initial={{ pathLength: 0 }} animate={{ pathLength: progress / 100 }} transition={{ duration: 2.2, ease: 'easeOut' }} strokeLinecap="round" />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--brand-primary)" />
                  <stop offset="100%" stopColor="var(--brand-secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl text-gradient" style={{ fontWeight: 700 }}>{Math.round(progress)}%</span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-black mt-1" style={{ color: 'var(--brand-text-muted)' }}>{lang === 'fr' ? 'Accompli' : 'تم الإنجاز'}</span>
            </div>
          </div>
          <h3 className="mt-7 text-2xl" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{lang === 'fr' ? 'Votre Voyage' : 'رحلتك'}</h3>
          <p className="text-sm mt-2 max-w-[180px] leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>{lang === 'fr' ? 'Chaque verset est une lumière sur votre chemin.' : 'كل آية هي نور في طريقك.'}</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 col-span-1 lg:col-span-2">
          {[
            { label: lang === 'fr' ? 'Sourates' : 'السور',   value: memorizedCount,                                    icon: BookOpen,    grad: 'from-[#A8DADC]/15' },
            { label: lang === 'fr' ? 'Objectifs' : 'الأهداف', value: userData.goals.filter(g => g.completed).length,   icon: Target,      grad: 'from-[#B7E4C7]/15' },
            { label: lang === 'fr' ? 'Badges' : 'الأوسمة',   value: userData.badges.length,                            icon: Award,       grad: 'from-[#D4AF37]/10' },
            { label: lang === 'fr' ? 'Jours' : 'الأيام',     value: userData.calendar.length,                          icon: CalendarIcon, grad: 'from-[#8B2635]/8'  },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.1 }} className="glass-card p-7 flex flex-col justify-between group overflow-hidden relative">
              <div className="card-accent-bar" />
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-60', stat.grad)} />
              <stat.icon className="relative z-10 transition-all duration-500 group-hover:scale-110" size={28} style={{ color: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)' }} />
              <div className="relative z-10 mt-4">
                <p className="text-5xl text-gradient" style={{ fontWeight: 700 }}>{stat.value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black mt-1" style={{ color: 'var(--brand-text-muted)' }}>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-8 relative overflow-hidden">
        <div className="card-accent-bar" />
        <div className="absolute top-0 right-0 p-8 opacity-[0.025] pointer-events-none"><Target size={180} /></div>
        <h3 className="text-2xl mb-7 flex items-center gap-4" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}><Target size={17} style={{ color: 'var(--brand-secondary)' }} /></div>
          {lang === 'fr' ? 'Intentions du mois' : 'نوايا الشهر'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userData.goals.slice(0, 3).map((goal) => (
            <motion.div key={goal.id} whileHover={{ scale: 1.02 }} className="flex items-center gap-4 p-4 rounded-xl border transition-all group" style={{ background: goal.completed ? 'color-mix(in srgb, var(--brand-secondary) 6%, transparent)' : 'color-mix(in srgb, var(--brand-primary) 3%, transparent)', borderColor: goal.completed ? 'var(--border-accent)' : 'var(--border-subtle)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: goal.completed ? 'var(--brand-secondary)' : 'var(--brand-surface)', border: goal.completed ? 'none' : '1.5px solid var(--border-subtle)' }}>
                {goal.completed ? <CheckCircle2 size={14} style={{ color: '#fff' }} /> : <Circle size={14} style={{ color: 'var(--brand-text-muted)' }} />}
              </div>
              <span className={cn('text-sm font-medium leading-snug', goal.completed ? 'line-through' : '')} style={{ color: goal.completed ? 'var(--brand-text-muted)' : 'var(--brand-text-main)', opacity: goal.completed ? 0.6 : 1 }}>{goal.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};