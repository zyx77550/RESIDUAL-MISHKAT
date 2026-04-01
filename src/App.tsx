import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { GoalsSection } from './components/Goals';
import { TasbihSection } from './components/Tasbih';
import { MemorizationSection } from './components/Memorization';
import { CalendarSection } from './components/Calendar';
import { BadgesSection } from './components/Badges';
import { KanbanSection } from './components/Kanban';
import { SettingsSection } from './components/Settings';
import { jsPDF } from 'jspdf';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  BookOpen,
  Target,
  Award,
  Palette,
  NotebookPen,
  Edit2,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Save,
  Check,
  Undo,
  Redo,
  Trash2,
  Eraser,
  Ruler,
  Download,
  X,
  CheckCircle2,
  Circle,
  Languages,
  Wind,
  Star,
  Highlighter,
  Pencil,
  Brush,
  Settings2,
} from 'lucide-react';
import { cn } from './lib/utils';
import { Surah, DiftarPage, UserData, Badge, generateAllSurahs, Stroke, checkLoginStreak } from './types';
import confetti from 'canvas-confetti';
import { checkAndUnlockBadges, celebrateBadgeUnlock } from './lib/badgeEngine';

// ═══════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════

const Sidebar = ({ activeTab, setActiveTab, lang, setLang, isCollapsed, setIsCollapsed }: any) => {
  const menuItems = [
    { id: 'dashboard',    icon: LayoutDashboard, label: lang === 'fr' ? 'Tableau de bord' : 'لوحة التحكم' },
    { id: 'calendar',     icon: CalendarIcon,    label: lang === 'fr' ? 'Calendrier'       : 'التقويم'     },
    { id: 'memorization', icon: BookOpen,         label: lang === 'fr' ? 'Mémorisation'     : 'الحفظ'       },
    { id: 'goals',        icon: Target,           label: lang === 'fr' ? 'Objectifs'        : 'الأهداف'     },
    { id: 'badges',       icon: Award,            label: lang === 'fr' ? 'Badges'           : 'الإنجازات'   },
    { id: 'tasbih',       icon: Wind,             label: lang === 'fr' ? 'Tasbih'           : 'تسبيح'       },
    { id: 'coloring',     icon: Palette,          label: lang === 'fr' ? 'Coloriage'        : 'التلوين'     },
    { id: 'diftar',       icon: NotebookPen,      label: lang === 'fr' ? 'Diftar'           : 'الدفتر'      },
    { id: 'kanban',       icon: LayoutDashboard,  label: lang === 'fr' ? 'Suivi'            : 'المتابعة'    },
    { id: 'settings',     icon: Settings,         label: lang === 'fr' ? 'Réglages'         : 'الإعدادات'   },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '288px' }}
      className={cn(
        'fixed bottom-0 left-0 right-0 md:relative backdrop-blur-2xl border-t md:border-t-0 md:border-r p-3 md:p-5 flex md:flex-col overflow-x-auto md:overflow-x-hidden no-scrollbar justify-start gap-1.5 md:gap-2 z-50 transition-all duration-500',
        lang === 'ar' ? 'md:order-last md:border-r-0 md:border-l' : ''
      )}
      style={{
        background: 'var(--brand-surface)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="hidden md:flex items-center justify-between mb-8 shrink-0 pt-2">
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 pl-1">
            <div className="relative inline-block">
              <h1 className="text-4xl text-gradient" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>Mishkat</h1>
              <div className="absolute -bottom-0.5 left-0 right-4 h-px" style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary), transparent)', opacity: 0.35 }} />
            </div>
            <p className="text-[9px] uppercase tracking-[0.38em] mt-2 font-bold" style={{ color: 'var(--brand-secondary)', opacity: 0.65 }}>مِشْكَاة · حِفْظ القرآن</p>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2.5 rounded-xl transition-all hover:scale-105 flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)', color: 'var(--brand-primary)' }}
        >
          {isCollapsed ? (lang === 'ar' ? <ChevronLeft size={17} /> : <ChevronRight size={17} />) : (lang === 'ar' ? <ChevronRight size={17} /> : <ChevronLeft size={17} />)}
        </button>
      </div>

      <div className="flex md:flex-col gap-1 flex-1">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              'flex flex-col md:flex-row items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl transition-all shrink-0 min-w-[68px] md:min-w-0 group relative',
              isCollapsed ? 'md:justify-center' : ''
            )}
            style={activeTab === item.id ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 18px color-mix(in srgb, var(--brand-primary) 32%, transparent)' } : { color: 'color-mix(in srgb, var(--brand-primary) 65%, transparent)' }}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon size={18} className="transition-all duration-300 group-hover:scale-110 flex-shrink-0" style={activeTab === item.id ? { color: '#fff' } : { color: 'var(--brand-primary)', opacity: 0.6 }} />
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className={cn('text-[10px] md:text-[13px] whitespace-nowrap transition-colors leading-none', activeTab === item.id ? 'text-white font-semibold' : 'font-medium')} style={activeTab === item.id ? {} : { color: 'color-mix(in srgb, var(--brand-primary) 65%, transparent)' }}>
                {item.label}
              </motion.span>
            )}
            {activeTab === item.id && <motion.div layoutId="sidebar-active" className="absolute inset-0 rounded-xl -z-10" style={{ background: 'var(--brand-primary)' }} transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }} />}
            {activeTab !== item.id && <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }} />}
          </motion.button>
        ))}
      </div>

      {!isCollapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden md:flex mt-auto flex-col gap-4">
          <div className="p-4 rounded-2xl text-[10px] space-y-2.5 relative overflow-hidden" style={{ background: 'color-mix(in srgb, var(--brand-secondary) 7%, transparent)', border: '1px solid var(--border-accent)' }}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, var(--brand-secondary), transparent)' }} />
            <p className="font-bold uppercase tracking-widest" style={{ color: 'var(--brand-secondary)' }}>Artisans du Savoir</p>
            <p className="font-medium" style={{ color: 'var(--brand-text-muted)' }}>Rahima & hamda_wa_chakra</p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/hamda_wa_chakra" target="_blank" className="transition-all font-bold hover:scale-105" style={{ color: 'var(--brand-primary)' }}>IG</a>
              <a href="https://www.tiktok.com/@hamda_wa_chakra" target="_blank" className="transition-all font-bold hover:scale-105" style={{ color: 'var(--brand-primary)' }}>TK</a>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-3 p-3 rounded-xl transition-all group"
              style={{ color: 'var(--brand-text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--brand-primary) 5%, transparent)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Languages size={16} className="group-hover:rotate-12 transition-transform flex-shrink-0" style={{ color: 'var(--brand-secondary)' }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest">{lang === 'fr' ? 'العربية' : 'Français'}</span>
            </button>
            <button
              onClick={() => { if (confirm(lang === 'fr' ? 'Voulez-vous vraiment tout réinitialiser ?' : 'هل تريد حقاً إعادة ضبط كل شيء؟')) { localStorage.removeItem('mishkat_user_data'); window.location.reload(); } }}
              className="flex items-center gap-3 p-3 rounded-xl transition-all group"
              style={{ color: 'rgba(239,68,68,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Trash2 size={16} className="group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="text-[11px] font-semibold uppercase tracking-widest">{lang === 'fr' ? 'Réinitialiser' : 'إعادة ضبط'}</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════

const Dashboard = ({ userData, lang }: { userData: UserData; lang: string }) => {
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
          <h2 className="text-3xl sm:text-5xl leading-tight" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{lang === 'fr' ? 'Paix sur toi,' : 'السلام عليك'}</h2>
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

// ═══════════════════════════════════════════════════════
// DIFTAR — NOTEBOOK
// ═══════════════════════════════════════════════════════

// All stickers, organized by category
const STICKER_CATEGORIES = [
  {
    label: { fr: 'Islamique', ar: 'إسلامي' },
    icons: [
      { id: 'crescent',   svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>' },
      { id: 'star',       svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
      { id: 'mosque',     svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M4 20v-7c0-2 1-4 3-4s3 2 3 4v7M14 20v-7c0-2 1-4 3-4s3 2 3 4v7M12 9V3m0 0-2 2m2-2 2 2"/></svg>' },
      { id: 'lantern',    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8M12 2v3M7 5h10l1 3H6l1-3zM6 8h12v10H6V8zM8 18l-1 4h10l-1-4H8zM12 8v10M9 11h6M9 15h6"/></svg>' },
      { id: 'book',       svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v15H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>' },
      { id: 'prayer',     svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v2H9V6z"/><path d="M7 8h10l1 8H6L7 8z"/><path d="M10 16v4m4-4v4"/></svg>' },
      { id: 'tasbih',     svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><path d="M12 7v10"/><circle cx="12" cy="19" r="2"/><path d="M8 12h8"/><circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/></svg>' },
      { id: 'quran-open', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h9a1 1 0 0 1 1 1v16a1 1 0 0 0-1-1H2V3z"/><path d="M22 3h-9a1 1 0 0 0-1 1v16a1 1 0 0 1 1-1h9V3z"/></svg>' },
    ],
  },
  {
    label: { fr: 'Nature', ar: 'طبيعة' },
    icons: [
      { id: 'flower', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0a4.5 4.5 0 1 1-4.5 4.5M16.5 12H12m-4.5 0a4.5 4.5 0 1 0 4.5 4.5M7.5 12H12m0 0v4.5"/></svg>' },
      { id: 'leaf',   svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>' },
      { id: 'sun',    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>' },
      { id: 'moon',   svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4M17 5h4M15 10v2M14 11h2"/></svg>' },
      { id: 'cloud',  svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>' },
      { id: 'tree',   svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V12"/><path d="m4 12 8-8 8 8"/><path d="m2 17 10-10 10 10"/></svg>' },
      { id: 'wave',   svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>' },
      { id: 'rain',   svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M16 14v6M8 14v6M12 16v6"/></svg>' },
    ],
  },
  {
    label: { fr: 'Étoiles & Joie', ar: 'نجوم وفرح' },
    icons: [
      { id: 'sparkles',  svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 1.91 5.81L20 10.72l-4.5 4.38 1.06 6.19L12 18.37l-4.56 2.92 1.06-6.19L4 10.72l6.09-1.91L12 3z"/><path d="M5 3v4M3 5h4M21 17v4M19 19h4"/></svg>' },
      { id: 'star-fill', svg: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
      { id: 'heart',     svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' },
      { id: 'trophy',    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>' },
      { id: 'check-ok',  svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>' },
      { id: 'confetti',  svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m14.5 4 3 3"/><path d="m8 5 1.5 1.5"/><path d="M13 20 4 4l16 4-7 7"/><path d="m8.5 14.5 3.5 5"/></svg>' },
      { id: 'crown',     svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L20.07 6.31a.5.5 0 0 1 .782.498l-2.074 9.061a1 1 0 0 1-.966.765H6.188a1 1 0 0 1-.966-.765L3.148 6.808a.5.5 0 0 1 .782-.498l3.162 2.854a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/></svg>' },
      { id: 'gift',      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>' },
    ],
  },
  {
    label: { fr: 'Géométrie', ar: 'هندسة' },
    icons: [
      { id: 'geo-diamond',  svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 12l10 10 10-10L12 2z"/><path d="M12 6l6 6-6 6-6-6 6-6z"/></svg>' },
      { id: 'geo-compass',  svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>' },
      { id: 'geo-hexagon',  svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 8.5 16 2 8 2 2 8.5 2 15.5 8 22 16 22 22 15.5 22 8.5"/></svg>' },
      { id: 'geo-target',   svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>' },
      { id: 'geo-ornament', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
      { id: 'geo-crosshair',svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6"/></svg>' },
      { id: 'geo-infinity', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4zm0 0c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z"/></svg>' },
      { id: 'geo-octagram', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7z"/></svg>' },
    ],
  },
  {
    label: { fr: 'Écriture', ar: 'كتابة' },
    icons: [
      { id: 'pen-tool', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 5 5"/><path d="m11 8 2 2"/></svg>' },
      { id: 'feather',  svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>' },
      { id: 'bookmark', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>' },
      { id: 'anchor',   svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/></svg>' },
      { id: 'tag',      svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>' },
      { id: 'scroll',   svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-2M2 9V6a2 2 0 0 1 2-2h14M2 9v7a2 2 0 0 0 2 2h1"/><path d="M8 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v5"/></svg>' },
      { id: 'note',     svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>' },
      { id: 'award',    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>' },
    ],
  },
];

// Color palette organized by category
const COLOR_PALETTE = {
  classiques: [
    '#000000', '#1a1a1a', '#4a4a4a', '#888888', '#cccccc', '#ffffff',
    '#8B2635', '#D4AF37', '#1D3557', '#2A9D8F', '#264653', '#5f4339',
  ],
  pastels: [
    '#FFD6E7', '#FFC9D0', '#FFDAB9', '#FFF3CD', '#D1F5E0', '#C7ECEE',
    '#D0D9FF', '#E8D5FF', '#FFE4E1', '#F0E6FF', '#E0F4FF', '#F5F5DC',
  ],
  vives: [
    '#E63946', '#F4722B', '#F9C74F', '#43AA8B', '#00B4D8', '#7B2FBE',
    '#FF006E', '#FB5607', '#FFBE0B', '#06D6A0', '#118AB2', '#8338EC',
  ],
  sombres: [
    '#0f172a', '#1e293b', '#2d1b69', '#14213d', '#1b4332', '#3d0000',
    '#4a1942', '#7c3f00', '#1a3c1a', '#002855', '#4b0082', '#660000',
  ],
  speciaux: [
    'gradient:gold-red', 'gradient:blue-cyan', 'gradient:purple-pink',
    'gradient:green-teal', 'gradient:sunset', 'gradient:ocean',
    'pattern:dots', 'pattern:stripes', 'pattern:crosses',
  ],
};

const Diftar = ({ userData, setUserData, lang }: { userData: UserData; setUserData: any; lang: string }) => {
  const [activePageId, setActivePageId]     = useState<string | null>(null);
  const [editingPageId, setEditingPageId]   = useState<string | null>(null);
  const [tool, setTool]                     = useState<'pen' | 'highlighter' | 'fountain-pen' | 'chalk' | 'eraser' | 'ruler'>('pen');
  const [showToolsMenu, setShowToolsMenu]           = useState(false);
  const [showCustomizationMenu, setShowCustomizationMenu] = useState(false);
  const [color, setColor]                   = useState('#8B2635');
  const [colorTab, setColorTab]             = useState<keyof typeof COLOR_PALETTE>('classiques');
  const [width, setWidth]                   = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [undoStack, setUndoStack]           = useState<{ strokes: Stroke[]; stickers: any[] }[]>([]);
  const [redoStack, setRedoStack]           = useState<{ strokes: Stroke[]; stickers: any[] }[]>([]);
  const [currentStrokes, setCurrentStrokes] = useState<Stroke[]>([]);
  const [stickers, setStickers]             = useState<any[]>([]);
  const [showStickerPicker, setShowStickerPicker]   = useState(false);
  const [stickerCategory, setStickerCategory]       = useState(0);
  const [showPaperSettings, setShowPaperSettings]   = useState(false);
  const [isSaving, setIsSaving]             = useState(false);
  const [paperStyle, setPaperStyle]         = useState<'blank' | 'lines' | 'grid' | 'dots' | 'arabesque'>('lines');
  const [paperColor, setPaperColor]         = useState('#fdfcf8');
  const [pageHeight, setPageHeight]         = useState(5000);
  const [canvasScale, setCanvasScale]       = useState(1);
  const isDrawingRef    = useRef(false);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const stickerCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [activeStickerSvg, setActiveStickerSvg] = useState<string | null>(null);
  const activeStickerSvgRef = useRef<string | null>(null);
  const setActiveStickerSvgWithRef = useCallback((val: string | null) => {
    activeStickerSvgRef.current = val;
    setActiveStickerSvg(val);
  }, []);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear]   = useState(false);
  const [isDrawing, setIsDrawing]           = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activePage = userData.diftarPages.find(p => p.id === activePageId);

  const SIZE_PRESETS = [
    { label: lang === 'fr' ? 'Fin' : 'رفيع',    value: 1  },
    { label: lang === 'fr' ? 'Normal' : 'عادي',  value: 3  },
    { label: lang === 'fr' ? 'Épais' : 'سميك',   value: 8  },
    { label: lang === 'fr' ? 'Gros' : 'كبير',    value: 15 },
    { label: lang === 'fr' ? 'XL' : 'ضخم',       value: 25 },
  ];

  const PAPER_COLORS = [
    { label: lang === 'fr' ? 'Crème' : 'كريم',   value: '#fdfcf8' },
    { label: lang === 'fr' ? 'Blanc' : 'أبيض',   value: '#ffffff' },
    { label: lang === 'fr' ? 'Sépia' : 'بني',    value: '#f4ecd8' },
    { label: lang === 'fr' ? 'Bleu nuit' : 'ليلي', value: '#0f172a' },
    { label: lang === 'fr' ? 'Vert sage' : 'أخضر',value: '#f0f7f0' },
    { label: lang === 'fr' ? 'Rose pâle' : 'وردي', value: '#fff0f3' },
  ];

  const getBrandColorForPaper = (pc: string) => {
    // For dark paper, use gold; for light papers use the brand primary red
    if (pc === '#0f172a') return '#D4AF37';
    return '#8B2635';
  };

  const getColoredStickerSvg = (svg: string, pc: string) => {
    const brandColor = getBrandColorForPaper(pc);
    // Inject explicit dimensions and replace currentColor with brand color
    let colored = svg
      .replace('<svg ', `<svg width="60" height="60" `)
      .replace(/currentColor/g, brandColor);
    return colored;
  };

  const getStrokeStyle = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.color === 'pattern:dots') {
      const pc = document.createElement('canvas'); pc.width = 10; pc.height = 10;
      const pctx = pc.getContext('2d')!;
      pctx.fillStyle = '#8B2635'; pctx.beginPath(); pctx.arc(5, 5, 2, 0, Math.PI * 2); pctx.fill();
      return ctx.createPattern(pc, 'repeat') || '#8B2635';
    }
    if (stroke.color === 'pattern:stripes') {
      const pc = document.createElement('canvas'); pc.width = 10; pc.height = 10;
      const pctx = pc.getContext('2d')!;
      pctx.strokeStyle = '#D4AF37'; pctx.lineWidth = 2; pctx.beginPath(); pctx.moveTo(0, 0); pctx.lineTo(10, 10); pctx.stroke();
      return ctx.createPattern(pc, 'repeat') || '#D4AF37';
    }
    if (stroke.color === 'pattern:crosses') {
      const pc = document.createElement('canvas'); pc.width = 12; pc.height = 12;
      const pctx = pc.getContext('2d')!;
      pctx.strokeStyle = '#2A9D8F'; pctx.lineWidth = 1.5;
      pctx.beginPath(); pctx.moveTo(6, 0); pctx.lineTo(6, 12);
      pctx.moveTo(0, 6); pctx.lineTo(12, 6); pctx.stroke();
      return ctx.createPattern(pc, 'repeat') || '#2A9D8F';
    }
    const gradients: Record<string, [string, string]> = {
      'gradient:gold-red':    ['#D4AF37', '#8B2635'],
      'gradient:blue-cyan':   ['#1D3557', '#A8DADC'],
      'gradient:purple-pink': ['#6D597A', '#FF99C8'],
      'gradient:green-teal':  ['#2D6A4F', '#95D5B2'],
      'gradient:sunset':      ['#F4A261', '#E76F51'],
      'gradient:ocean':       ['#03045E', '#90E0EF'],
    };
    if (gradients[stroke.color]) {
      const [c1, c2] = gradients[stroke.color];
      const grad = ctx.createLinearGradient(0, 0, 1000, 1400);
      grad.addColorStop(0, c1); grad.addColorStop(1, c2);
      return grad;
    }
    return stroke.color;
  };

  useEffect(() => {
    if (activePage) {
      setCurrentStrokes(activePage.strokes || []);
      setStickers((activePage.stickers as any) || []);
      setPageHeight(activePage.height || 5000);
      setPaperStyle(activePage.paperStyle || 'lines');
      setPaperColor((activePage as any).paperColor || '#fdfcf8');
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [activePageId]);

  const drawPaperLines = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (paperStyle === 'blank') return;
    const isDark = paperColor === '#0f172a';
    const lineColor = isDark ? 'rgba(255,255,255,0.08)' : '#8B263512';
    const marginColor = isDark ? 'rgba(255,255,255,0.15)' : '#8B263528';

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;

    if (paperStyle === 'lines' || paperStyle === 'grid') {
      for (let y = 60; y < h; y += 32) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    }
    if (paperStyle === 'grid') {
      for (let x = 0; x < w; x += 32) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    }
    if (paperStyle === 'dots') {
      for (let x = 32; x < w; x += 32) {
        for (let y = 32; y < h; y += 32) { ctx.moveTo(x, y); ctx.arc(x, y, 0.7, 0, Math.PI * 2); }
      }
    }
    if (paperStyle === 'arabesque') {
      for (let y = 60; y < h; y += 32) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      // decorative side patterns
      for (let y = 80; y < h; y += 96) {
        ctx.save();
        ctx.strokeStyle = isDark ? 'rgba(212,175,55,0.15)' : '#D4AF3720';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < w; x += 20) {
          ctx.moveTo(x, y); ctx.lineTo(x + 10, y - 10); ctx.lineTo(x + 20, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.stroke();

    if (paperStyle !== 'blank') {
      ctx.beginPath();
      ctx.strokeStyle = marginColor;
      ctx.lineWidth = 1.5;
      const marginX = lang === 'ar' ? w - 80 : 80;
      ctx.moveTo(marginX, 0); ctx.lineTo(marginX, h);
      ctx.stroke();
    }
    ctx.restore();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = paperColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPaperLines(ctx, canvas.width, canvas.height);

    const renderStroke = (stroke: Stroke) => {
      if (stroke.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = getStrokeStyle(ctx, stroke);
      ctx.lineJoin = 'round';

      if (stroke.type === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 0.4;
        ctx.lineCap = 'square';
        ctx.lineWidth = stroke.width * 2.5;
      } else if (stroke.type === 'fountain-pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'butt';
        ctx.lineWidth = stroke.width * 1.2;
        ctx.setTransform(1, 0, 0.4, 1, 0, 0);
      } else if (stroke.type === 'chalk') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.75;
        ctx.lineCap = 'round';
        ctx.lineWidth = stroke.width * 2;
        ctx.setLineDash([2, 3]);
        ctx.shadowBlur = 4;
        ctx.shadowColor = stroke.color;
      } else if (stroke.type === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.lineWidth = stroke.width * 4;
      } else if (stroke.type === 'ruler') {
        ctx.lineCap = 'butt';
        ctx.lineWidth = stroke.width;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineWidth = stroke.width;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      if (stroke.type === 'ruler') {
        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.x, last.y);
      } else {
        for (let i = 1; i < stroke.points.length - 1; i++) {
          const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
          const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
        }
        const last = stroke.points[stroke.points.length - 1];
        ctx.lineTo(last.x, last.y);
      }
      ctx.stroke();
      ctx.restore();
    };

    currentStrokes.forEach(renderStroke);

    stickers.forEach((sticker: any) => {
      const coloredSvg = getColoredStickerSvg(sticker.svg, paperColor);
      const cachedImg = stickerCacheRef.current.get(coloredSvg);
      if (cachedImg) {
        ctx.drawImage(cachedImg, sticker.x - 30, sticker.y - 30, 60, 60);
      } else {
        const img = new Image();
        const svgBlob = new Blob([coloredSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.onload = () => {
          stickerCacheRef.current.set(coloredSvg, img);
          ctx.drawImage(img, sticker.x - 30, sticker.y - 30, 60, 60);
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    });
  };

  useEffect(() => { redrawCanvas(); }, [currentStrokes, stickers, lang, pageHeight, paperStyle, paperColor]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = ('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = ('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeStickerSvgRef.current) {
      const { x, y } = getCoords(e);
      setUndoStack(prev => [...prev, { strokes: currentStrokes, stickers }]);
      setRedoStack([]);
      setStickers(prev => [...prev, { id: Date.now().toString(), svg: activeStickerSvgRef.current!, x, y }]);
      setActiveStickerSvgWithRef(null);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeStickerSvgRef.current) { handleCanvasClick(e); return; }
    const { x, y } = getCoords(e);
    if (tool === 'eraser') {
      const idx = stickers.findIndex((s: any) => Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2)) < 30);
      if (idx !== -1) {
        setUndoStack(prev => [...prev, { strokes: currentStrokes, stickers }]);
        setRedoStack([]);
        setStickers(prev => prev.filter((_, i) => i !== idx));
        return;
      }
    }
    isDrawingRef.current = true;
    setIsDrawing(true);
    activeStrokeRef.current = {
      points: [{ x, y }],
      color: tool === 'eraser' ? '#ffffff' : color,
      width: tool === 'highlighter' ? width * 5 : width,
      type: tool,
      timestamp: Date.now(),
    };
    setUndoStack(prev => [...prev, { strokes: currentStrokes, stickers }]);
    setRedoStack([]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    const { x, y } = getCoords(e);
    if (activeStrokeRef.current.type === 'ruler') {
      const start = activeStrokeRef.current.points[0];
      const dx = Math.abs(x - start.x), dy = Math.abs(y - start.y);
      activeStrokeRef.current.points = dx > dy ? [start, { x, y: start.y }] : [start, { x: start.x, y }];
      redrawCanvas();
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = getStrokeStyle(ctx, activeStrokeRef.current);
      ctx.lineWidth = activeStrokeRef.current.width;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(activeStrokeRef.current.points[1].x, activeStrokeRef.current.points[1].y);
      ctx.stroke(); ctx.restore();
      return;
    }
    activeStrokeRef.current.points.push({ x, y });
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const stroke = activeStrokeRef.current;
    const points = stroke.points;
    if (points.length < 2) return;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = getStrokeStyle(ctx, stroke);
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (stroke.type === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.4;
      ctx.lineCap = 'square'; ctx.lineWidth = stroke.width * 2.5;
    } else if (stroke.type === 'chalk') {
      ctx.globalAlpha = 0.75; ctx.lineWidth = stroke.width * 2;
      ctx.setLineDash([2, 3]); ctx.shadowBlur = 4; ctx.shadowColor = stroke.color;
    } else if (stroke.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = stroke.width * 4;
    }
    const p1 = points[points.length - 2], p2 = points[points.length - 1];
    ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); ctx.restore();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current || !activeStrokeRef.current) { isDrawingRef.current = false; setIsDrawing(false); return; }
    isDrawingRef.current = false; setIsDrawing(false);
    const finishedStroke = activeStrokeRef.current;
    setCurrentStrokes(prev => [...prev, finishedStroke]);
    activeStrokeRef.current = null;
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(s => [...s, { strokes: currentStrokes, stickers }]);
    setUndoStack(s => s.slice(0, -1));
    setCurrentStrokes(prev.strokes); setStickers(prev.stickers);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(s => [...s, { strokes: currentStrokes, stickers }]);
    setRedoStack(s => s.slice(0, -1));
    setCurrentStrokes(next.strokes); setStickers(next.stickers);
  };

  const exportPDF = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save(`${activePage?.title || 'diftar'}.pdf`);
  };

  const savePage = () => {
    if (!activePageId) return;
    setIsSaving(true);
    setUserData((prev: UserData) => ({
      ...prev,
      diftarPages: prev.diftarPages.map(p =>
        p.id === activePageId
          ? { ...p, strokes: currentStrokes, stickers, height: pageHeight, paperStyle, paperColor: paperColor, lastSaved: Date.now() }
          : p
      ),
    }));
    setTimeout(() => setIsSaving(false), 1000);
  };

  useEffect(() => {
    const timer = setInterval(() => { if (activePageId) savePage(); }, 5000);
    return () => clearInterval(timer);
  }, [currentStrokes, stickers, activePageId]);

  const createPage = () => {
    const newPage: DiftarPage = {
      id: Math.random().toString(36).substr(2, 9),
      title: lang === 'fr' ? 'Nouvelle Page' : 'صفحة جديدة',
      type: 'custom', strokes: [], stickers: [], height: 5000, paperStyle: 'lines', lastSaved: Date.now(),
    };
    setUserData((prev: UserData) => ({ ...prev, diftarPages: [newPage, ...prev.diftarPages] }));
    setActivePageId(newPage.id);
  };

  const renamePage = (id: string, newTitle: string) => {
    setUserData((prev: UserData) => ({ ...prev, diftarPages: prev.diftarPages.map(p => p.id === id ? { ...p, title: newTitle } : p) }));
  };

  useEffect(() => {
    const updateScale = () => {
      const canvas = canvasRef.current;
      if (canvas) { const rect = canvas.getBoundingClientRect(); setCanvasScale(rect.width / canvas.width); }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [activePageId]);

  const cursorX = useMotionValue(0), cursorY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig), cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const container = scrollContainerRef.current; if (!container || !activePageId) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 800) setPageHeight(prev => prev + 1000);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activePageId]);

  useEffect(() => {
    const handle = (e: MouseEvent) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  const closeAllPanels = () => { setShowToolsMenu(false); setShowCustomizationMenu(false); setShowStickerPicker(false); setShowPaperSettings(false); setActiveStickerSvgWithRef(null); };

  // ──────────────────────────────────
  // PAGE LIST VIEW (Gallery)
  // ──────────────────────────────────
  if (!activePageId) {
    return (
      <div className="flex-1 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Mon Diftar' : 'دفتري'}</h2>
            <p className="text-sm mt-1 font-medium" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Vos notes et réflexions' : 'ملاحظاتك وتأملاتك'}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
            onClick={createPage}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white shadow-lg transition-all"
            style={{ background: 'var(--brand-primary)', boxShadow: '0 8px 24px color-mix(in srgb, var(--brand-primary) 35%, transparent)' }}
          >
            <Plus size={20} />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Nouvelle Page' : 'صفحة جديدة'}</span>
          </motion.button>
        </div>

        {userData.diftarPages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-40 py-24">
            <NotebookPen size={64} style={{ color: 'var(--brand-primary)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--brand-text-muted)' }}>{lang === 'fr' ? 'Aucune page pour l\'instant' : 'لا توجد صفحات بعد'}</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {userData.diftarPages.map((page) => (
            <motion.div
              key={page.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -8 }}
              className="group flex flex-col gap-0"
            >
              {/* Notebook cover */}
              <div
                className="relative aspect-[3/4] cursor-pointer rounded-r-2xl shadow-lg border-l-[10px] overflow-hidden transition-all group-hover:shadow-2xl"
                style={{ background: '#ffffff', borderLeftColor: 'var(--brand-primary)' }}
                onClick={() => setActivePageId(page.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />
                {/* Spiral holes */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-around py-4 px-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: 'var(--brand-primary)', background: 'var(--brand-page)', opacity: 0.6 }} />
                  ))}
                </div>
                <div className="p-5 h-full flex flex-col justify-between ml-3">
                  <div className="space-y-3">
                    {editingPageId === page.id ? (
                      <div onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          className="w-full bg-transparent border-b-2 px-1 py-0.5 text-base font-serif italic focus:outline-none"
                          style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)' }}
                          value={page.title}
                          onChange={e => renamePage(page.id, e.target.value)}
                          onBlur={() => setEditingPageId(null)}
                          onKeyDown={e => e.key === 'Enter' && setEditingPageId(null)}
                        />
                      </div>
                    ) : (
                      <h3 className="text-lg font-serif italic leading-tight transition-colors" style={{ color: 'var(--brand-primary)' }}>{page.title}</h3>
                    )}
                    <div className="w-8 h-0.5 rounded-full" style={{ background: 'var(--brand-secondary)', opacity: 0.4 }} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--brand-primary)', opacity: 0.35 }}>
                      {new Date(page.lastSaved).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-SA')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons — ALWAYS VISIBLE (tablet + desktop) */}
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => setActivePageId(page.id)}
                  className="flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{ background: 'var(--brand-primary)', color: '#fff' }}
                >
                  {lang === 'fr' ? 'Ouvrir' : 'فتح'}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setEditingPageId(editingPageId === page.id ? null : page.id); }}
                  className="px-3 py-2 rounded-xl text-[10px] transition-all"
                  style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)', color: 'var(--brand-primary)' }}
                  title={lang === 'fr' ? 'Renommer' : 'تسمية'}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setShowConfirmDelete(page.id); }}
                  className="px-3 py-2 rounded-xl text-[10px] transition-all"
                  style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.7)' }}
                  title={lang === 'fr' ? 'Supprimer' : 'حذف'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Confirm delete modal */}
        <AnimatePresence>
          {showConfirmDelete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-md z-[200] flex items-center justify-center p-6" style={{ background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-sm w-full text-center space-y-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto"><Trash2 size={32} className="text-red-500" /></div>
                <h3 className="text-2xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Supprimer la page ?' : 'حذف الصفحة؟'}</h3>
                <div className="flex gap-3">
                  <button onClick={() => setShowConfirmDelete(null)} className="flex-1 py-3 rounded-2xl border font-bold text-xs uppercase tracking-widest" style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', opacity: 0.4 }}>{lang === 'fr' ? 'Annuler' : 'إلغاء'}</button>
                  <button onClick={() => { setUserData((prev: UserData) => ({ ...prev, diftarPages: prev.diftarPages.filter(p => p.id !== showConfirmDelete) })); setShowConfirmDelete(null); }} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-xs uppercase tracking-widest">{lang === 'fr' ? 'Supprimer' : 'حذف'}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ──────────────────────────────────
  // CANVAS / EDITOR VIEW
  // ──────────────────────────────────
  return (
    <div className="flex-1 flex flex-col gap-3 relative h-full overflow-hidden">
      {/* Top Toolbar */}
      <div className="w-full flex flex-col gap-3 z-50">
        <div
          className="backdrop-blur-2xl rounded-[2rem] shadow-xl border p-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar"
          style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}
        >
          {/* Left: back + title */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => { savePage(); setActivePageId(null); }} className="p-2.5 rounded-full transition-all hover:scale-105" style={{ color: 'var(--brand-primary)', background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}>
              <ChevronLeft size={20} />
            </button>
            <input
              value={activePage?.title}
              onChange={e => setUserData((prev: UserData) => ({ ...prev, diftarPages: prev.diftarPages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) }))}
              className="font-serif italic text-base w-28 sm:w-40 bg-transparent border-none focus:ring-0 focus:outline-none"
              style={{ color: 'var(--brand-primary)' }}
            />
          </div>

          {/* Center: tool buttons */}
          <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
            {[
              { id: 'tools',    icon: Pencil,    title: lang === 'fr' ? 'Outils' : 'أدوات',       active: showToolsMenu,          action: () => { closeAllPanels(); setShowToolsMenu(v => !v); } },
              { id: 'colors',   icon: Palette,   title: lang === 'fr' ? 'Couleurs' : 'الألوان',    active: showCustomizationMenu,  action: () => { closeAllPanels(); setShowCustomizationMenu(v => !v); } },
              { id: 'stickers', icon: Star,      title: lang === 'fr' ? 'Stickers' : 'ملصقات',    active: showStickerPicker,      action: () => { closeAllPanels(); setShowStickerPicker(v => !v); } },
              { id: 'paper',    icon: Settings2, title: lang === 'fr' ? 'Papier' : 'الورق',        active: showPaperSettings,      action: () => { closeAllPanels(); setShowPaperSettings(v => !v); } },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={btn.action}
                title={btn.title}
                className="p-2.5 rounded-full transition-all"
                style={btn.active ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 2px 12px color-mix(in srgb, var(--brand-primary) 30%, transparent)' } : { color: 'var(--brand-primary)' }}
              >
                <btn.icon size={16} />
              </button>
            ))}
          </div>

          {/* Right: undo/redo + save */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex rounded-full p-1" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
              <button onClick={undo} className="p-2.5 rounded-full transition-all hover:scale-110" style={{ color: 'var(--brand-primary)' }} title="Annuler"><Undo size={16} /></button>
              <button onClick={redo} className="p-2.5 rounded-full transition-all hover:scale-110" style={{ color: 'var(--brand-primary)' }} title="Refaire"><Redo size={16} /></button>
            </div>
            <button onClick={() => setShowConfirmClear(true)} className="p-2.5 rounded-full transition-all" style={{ color: 'rgba(239,68,68,0.6)' }} title="Effacer"><Trash2 size={16} /></button>
            <button onClick={exportPDF} className="p-2.5 rounded-full transition-all hidden sm:block" style={{ color: 'var(--brand-primary)' }} title="Exporter"><Download size={16} /></button>
            <button
              onClick={savePage}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-white shadow-md transition-all active:scale-95"
              style={{ background: isSaving ? '#22c55e' : 'var(--brand-primary)' }}
            >
              {isSaving ? <Check size={15} /> : <Save size={15} />}
              <span className="text-xs hidden sm:inline">{isSaving ? (lang === 'fr' ? 'Sauvegardé' : 'تم') : (lang === 'fr' ? 'Sauvegarder' : 'حفظ')}</span>
            </button>
          </div>
        </div>

        {/* Floating Panels */}
        <AnimatePresence>
          {(showToolsMenu || showCustomizationMenu || showStickerPicker || showPaperSettings) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-2xl mx-auto">

              {/* TOOLS PANEL */}
              {showToolsMenu && (
                <div className="backdrop-blur-3xl rounded-[2rem] shadow-2xl border p-5 space-y-4" style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Outil' : 'الأداة'}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { id: 'pen',          icon: Pencil,      label: lang === 'fr' ? 'Stylo'      : 'قلم'          },
                      { id: 'fountain-pen', icon: Brush,       label: lang === 'fr' ? 'Plume'      : 'ريشة'         },
                      { id: 'highlighter',  icon: Highlighter, label: lang === 'fr' ? 'Surligneur' : 'تحديد'        },
                      { id: 'chalk',        icon: Edit2,       label: lang === 'fr' ? 'Craie'      : 'طباشير'       },
                      { id: 'ruler',        icon: Ruler,       label: lang === 'fr' ? 'Règle'      : 'مسطرة'        },
                      { id: 'eraser',       icon: Eraser,      label: lang === 'fr' ? 'Gomme'      : 'ممحاة'        },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setTool(t.id as any); setShowToolsMenu(false); }}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all font-bold text-[9px] uppercase tracking-wider"
                        style={tool === t.id ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 14px color-mix(in srgb, var(--brand-primary) 30%, transparent)' } : { background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', color: 'var(--brand-text-muted)' }}
                      >
                        <t.icon size={20} />
                        <span>{t.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Taille' : 'الحجم'}</p>
                    <div className="flex flex-wrap gap-2">
                      {SIZE_PRESETS.map(p => (
                        <button
                          key={p.value}
                          onClick={() => setWidth(p.value)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all font-bold text-[10px]"
                          style={width === p.value ? { background: 'var(--brand-primary)', color: '#fff' } : { background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)', color: 'var(--brand-text-muted)' }}
                        >
                          <div className="rounded-full bg-current" style={{ width: `${Math.min(p.value, 16)}px`, height: `${Math.min(p.value, 16)}px` }} />
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="range" min="1" max="50" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="flex-1 accent-primary" style={{ accentColor: 'var(--brand-primary)' }} />
                      <span className="text-xs font-mono w-10 text-right" style={{ color: 'var(--brand-text-muted)' }}>{width}px</span>
                    </div>
                  </div>
                </div>
              )}

              {/* COLOR PANEL */}
              {showCustomizationMenu && (
                <div className="backdrop-blur-3xl rounded-[2rem] shadow-2xl border p-5 space-y-4" style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                  {/* Preview of current color */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 shadow-inner" style={{ background: color, borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }} />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Couleur active' : 'اللون المحدد'}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--brand-text-muted)' }}>{color}</p>
                    </div>
                  </div>

                  {/* Category tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(COLOR_PALETTE) as (keyof typeof COLOR_PALETTE)[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setColorTab(cat)}
                        className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all"
                        style={colorTab === cat ? { background: 'var(--brand-primary)', color: '#fff' } : { background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)', color: 'var(--brand-text-muted)' }}
                      >
                        {cat === 'classiques' ? (lang === 'fr' ? 'Classiques' : 'كلاسيك')
                          : cat === 'pastels' ? (lang === 'fr' ? 'Pastels' : 'باستيل')
                          : cat === 'vives' ? (lang === 'fr' ? 'Vives' : 'زاهية')
                          : cat === 'sombres' ? (lang === 'fr' ? 'Sombres' : 'داكنة')
                          : (lang === 'fr' ? 'Spéciaux' : 'خاصة')}
                      </button>
                    ))}
                  </div>

                  {/* Color swatches */}
                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                    {COLOR_PALETTE[colorTab].map(c => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className="aspect-square rounded-xl border-2 transition-all hover:scale-110"
                        style={{
                          background: c.startsWith('gradient:')
                            ? { 'gradient:gold-red': 'linear-gradient(135deg,#D4AF37,#8B2635)', 'gradient:blue-cyan': 'linear-gradient(135deg,#1D3557,#A8DADC)', 'gradient:purple-pink': 'linear-gradient(135deg,#6D597A,#FF99C8)', 'gradient:green-teal': 'linear-gradient(135deg,#2D6A4F,#95D5B2)', 'gradient:sunset': 'linear-gradient(135deg,#F4A261,#E76F51)', 'gradient:ocean': 'linear-gradient(135deg,#03045E,#90E0EF)' }[c] || '#888'
                            : c.startsWith('pattern:') ? '#f5f5f5' : c,
                          borderColor: color === c ? 'var(--brand-primary)' : 'transparent',
                          boxShadow: color === c ? '0 0 0 3px color-mix(in srgb, var(--brand-primary) 25%, transparent)' : 'none',
                        }}
                      >
                        {c.startsWith('pattern:') && (
                          <span className="text-[8px] font-bold" style={{ color: '#888' }}>
                            {c === 'pattern:dots' ? '•••' : c === 'pattern:stripes' ? '///' : '+++'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom hex input */}
                  <div className="flex items-center gap-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] flex-shrink-0" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>HEX</label>
                    <input
                      type="color"
                      value={color.startsWith('#') ? color : '#8B2635'}
                      onChange={e => setColor(e.target.value)}
                      className="w-10 h-8 rounded-lg cursor-pointer border-none"
                    />
                    <input
                      type="text"
                      value={color.startsWith('#') ? color : ''}
                      onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setColor(e.target.value); }}
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs font-mono bg-transparent border focus:outline-none"
                      style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', color: 'var(--brand-text-muted)' }}
                      placeholder="#8B2635"
                    />
                  </div>
                </div>
              )}

              {/* STICKER PANEL */}
              {showStickerPicker && (
                <div className="backdrop-blur-3xl rounded-[2rem] shadow-2xl border p-5 space-y-4" style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                  {/* Category tabs */}
                  <div className="flex flex-wrap gap-1.5">
                    {STICKER_CATEGORIES.map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => setStickerCategory(i)}
                        className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all"
                        style={stickerCategory === i ? { background: 'var(--brand-primary)', color: '#fff' } : { background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)', color: 'var(--brand-text-muted)' }}
                      >
                        {cat.label[lang as 'fr' | 'ar']}
                      </button>
                    ))}
                  </div>
                  {/* Icons grid */}
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                    {STICKER_CATEGORIES[stickerCategory].icons.map(icon => (
                      <button
                        key={icon.id}
                        onClick={() => { setActiveStickerSvgWithRef(icon.svg); setShowStickerPicker(false); }}
                        className="aspect-square flex items-center justify-center p-2 rounded-2xl border transition-all hover:scale-110"
                        style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', borderColor: 'transparent', color: 'var(--brand-primary)' }}
                        dangerouslySetInnerHTML={{ __html: icon.svg }}
                      />
                    ))}
                  </div>
                  {activeStickerSvg && (
                    <div className="text-center text-xs font-bold animate-pulse" style={{ color: 'var(--brand-secondary)' }}>
                      {lang === 'fr' ? 'Cliquez sur la page pour placer le sticker' : 'انقر على الصفحة لوضع الملصق'}
                    </div>
                  )}
                </div>
              )}

              {/* PAPER PANEL */}
              {showPaperSettings && (
                <div className="backdrop-blur-3xl rounded-[2rem] shadow-2xl border p-5 space-y-4" style={{ background: 'var(--brand-surface)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Style de papier' : 'نوع الورق'}</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'blank',      label: lang === 'fr' ? 'Blanc'       : 'أبيض'   },
                        { id: 'lines',      label: lang === 'fr' ? 'Lignes'      : 'سطور'   },
                        { id: 'grid',       label: lang === 'fr' ? 'Grille'      : 'شبكة'   },
                        { id: 'dots',       label: lang === 'fr' ? 'Points'      : 'نقاط'   },
                        { id: 'arabesque',  label: lang === 'fr' ? 'Arabesque'   : 'عربسك'  },
                      ].map(s => (
                        <button
                          key={s.id}
                          onClick={() => setPaperStyle(s.id as any)}
                          className="px-4 py-2 rounded-2xl font-bold text-[10px] uppercase tracking-wider transition-all border"
                          style={paperStyle === s.id ? { background: 'var(--brand-primary)', color: '#fff', borderColor: 'var(--brand-primary)' } : { background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)', color: 'var(--brand-text-muted)', borderColor: 'transparent' }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.6 }}>{lang === 'fr' ? 'Couleur de papier' : 'لون الورق'}</p>
                    <div className="flex flex-wrap gap-2">
                      {PAPER_COLORS.map(pc => (
                        <button
                          key={pc.value}
                          onClick={() => setPaperColor(pc.value)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all"
                          style={{ background: pc.value, borderColor: paperColor === pc.value ? 'var(--brand-primary)' : 'rgba(139,38,53,0.15)', color: pc.value === '#0f172a' ? '#fff' : 'var(--brand-primary)', boxShadow: paperColor === pc.value ? '0 0 0 2px var(--brand-primary)' : 'none' }}
                        >
                          {pc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Canvas area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 rounded-[2rem] shadow-2xl overflow-y-auto relative border group cursor-none custom-scrollbar"
        style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }}
      >
        {/* Scroll buttons */}
        <div className="fixed right-4 md:right-20 bottom-36 md:bottom-8 z-50 flex flex-col gap-2">
          <button onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })} className="p-3 rounded-full shadow-lg border transition-all hover:scale-105" style={{ background: 'var(--brand-surface)', color: 'var(--brand-primary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}><ChevronUp size={18} /></button>
          <button onClick={() => scrollContainerRef.current?.scrollTo({ top: pageHeight, behavior: 'smooth' })} className="p-3 rounded-full shadow-lg border transition-all hover:scale-105" style={{ background: 'var(--brand-surface)', color: 'var(--brand-primary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}><ChevronDown size={18} /></button>
        </div>

        {/* Binding */}
        <div
          className={cn('absolute top-0 w-10 z-20 pointer-events-none', lang === 'ar' ? 'right-0' : 'left-0')}
          style={{ height: `${pageHeight}px`, background: 'linear-gradient(to right, rgba(0,0,0,0.06), transparent)' }}
        >
          <div className="h-full flex flex-col justify-around py-8 px-2">
            {[...Array(Math.ceil(pageHeight / 120))].map((_, i) => (
              <div key={i} className="w-full h-2 rounded-full shadow-inner" style={{ background: 'rgba(0,0,0,0.05)' }} />
            ))}
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={1000}
          height={pageHeight}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={e => { e.preventDefault(); startDrawing(e); }}
          onTouchMove={e => { e.preventDefault(); draw(e); }}
          onTouchEnd={stopDrawing}
          className="w-full touch-none"
        />

        <div className="flex justify-center py-10" style={{ background: paperColor }}>
          <button onClick={() => setPageHeight(prev => prev + 2000)} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold uppercase tracking-wider text-xs border transition-all hover:scale-105" style={{ color: 'var(--brand-primary)', borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
            <Plus size={15} />
            {lang === 'fr' ? "Ajouter de l'espace" : 'إضافة مساحة'}
          </button>
        </div>

        {/* Custom cursor */}
        <motion.div
          className="fixed pointer-events-none z-[60] -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center"
          style={{ left: cursorXSpring, top: cursorYSpring }}
        >
          <motion.div
            layout initial={false}
            animate={{
              width: activeStickerSvg ? 60 : (tool === 'highlighter' ? width * 6 : width + 16) * canvasScale,
              height: activeStickerSvg ? 60 : (tool === 'highlighter' ? width * 5 : width + 16) * canvasScale,
              borderRadius: tool === 'highlighter' ? '4px' : '50%',
              backgroundColor: activeStickerSvg ? 'transparent' : (tool === 'eraser' ? 'rgba(255,255,255,0.4)' : color),
              opacity: tool === 'highlighter' ? 0.35 : 0.85,
              border: activeStickerSvg ? '2px dashed var(--brand-secondary)' : '1px solid rgba(255,255,255,0.8)',
              scale: isDrawing ? 0.8 : 1,
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative flex items-center justify-center shadow-lg"
          >
            {activeStickerSvg ? (
              <div className="w-full h-full opacity-60 animate-pulse" dangerouslySetInnerHTML={{ __html: activeStickerSvg }} />
            ) : (
              <span className="text-white/50">
                {tool === 'pen' && <Pencil size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'fountain-pen' && <Brush size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'highlighter' && <Highlighter size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'chalk' && <Edit2 size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'eraser' && <Eraser size={Math.max(10, 12 * canvasScale)} />}
                {tool === 'ruler' && <Ruler size={Math.max(10, 12 * canvasScale)} />}
              </span>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Confirm clear */}
      <AnimatePresence>
        {showConfirmClear && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-md z-[200] flex items-center justify-center p-6" style={{ background: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-10 rounded-[2rem] shadow-2xl max-w-sm w-full text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto"><Wind size={32} className="text-red-500" /></div>
              <h3 className="text-2xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Effacer la page ?' : 'مسح الصفحة؟'}</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmClear(false)} className="flex-1 py-3 rounded-2xl border font-bold text-xs uppercase" style={{ borderColor: 'var(--brand-primary)', color: 'var(--brand-primary)', opacity: 0.4 }}>{lang === 'fr' ? 'Annuler' : 'إلغاء'}</button>
                <button onClick={() => { setUndoStack(prev => [...prev, { strokes: currentStrokes, stickers }]); setCurrentStrokes([]); setStickers([]); setShowConfirmClear(false); }} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-xs uppercase">{lang === 'fr' ? 'Effacer' : 'مسح'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// COLORING GRID
// ═══════════════════════════════════════════════════════

const COLORING_PALETTE = [
  '#8B2635', '#D4AF37', '#A8DADC', '#B7E4C7', '#F4A261', '#E76F51',
  '#000000', '#ffffff', '#888888', '#1D3557', '#E63946', '#2A9D8F',
  '#FFD6E7', '#FFC9D0', '#D0D9FF', '#E8D5FF', '#C7ECEE', '#D1F5E0',
  '#7B2FBE', '#FB5607', '#FFBE0B', '#06D6A0', '#118AB2', '#8338EC',
  '#0f172a', '#1b4332', '#3d0000', '#4a1942', '#14213d', '#2d1b69',
];

const ColoringGrid = ({ userData, setUserData, lang }: { userData: UserData; setUserData: any; lang: string }) => {
  const [selectedColor, setSelectedColor] = useState('#8B2635');
  const [filterJuz, setFilterJuz] = useState<number | null>(null);

  const updateSurahColor = (id: number) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: selectedColor, status: 'memorized' as const } : s),
    }));
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 }, colors: [selectedColor, '#D4AF37', '#ffffff'] });
  };

  const resetSurah = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: undefined, status: 'not_started' as const } : s),
    }));
  };

  const displayedSurahs = filterJuz !== null ? userData.surahs.filter(s => s.juz === filterJuz) : userData.surahs;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Grille des 114 Sourates' : 'شبكة الـ 114 سورة'}</h2>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--brand-text-muted)' }}>
            {userData.surahs.filter(s => s.color).length} / 114 {lang === 'fr' ? 'mémorisées' : 'محفوظة'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Juz filter */}
          <select
            value={filterJuz ?? ''}
            onChange={e => setFilterJuz(e.target.value === '' ? null : parseInt(e.target.value))}
            className="px-3 py-2 rounded-xl text-xs font-bold border bg-transparent focus:outline-none"
            style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)', color: 'var(--brand-primary)' }}
          >
            <option value="">{lang === 'fr' ? 'Tous les Juz' : 'كل الأجزاء'}</option>
            {[...Array(30)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{lang === 'fr' ? `Juz ${i + 1}` : `الجزء ${i + 1}`}</option>
            ))}
          </select>
          {/* Color palette */}
          <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl shadow-sm" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
            {COLORING_PALETTE.map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className="rounded-full transition-all border"
                style={{
                  width: 24, height: 24,
                  background: c,
                  borderColor: selectedColor === c ? 'var(--brand-primary)' : 'rgba(139,38,53,0.1)',
                  transform: selectedColor === c ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: selectedColor === c ? '0 0 0 2px white, 0 0 0 3px var(--brand-primary)' : 'none',
                }}
              />
            ))}
            <input
              type="color"
              value={selectedColor.startsWith('#') ? selectedColor : '#8B2635'}
              onChange={e => setSelectedColor(e.target.value)}
              className="w-6 h-6 rounded-full cursor-pointer border-none"
              title={lang === 'fr' ? 'Couleur personnalisée' : 'لون مخصص'}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-1.5 p-4 glass-card arabesque-pattern max-h-[65vh] overflow-y-auto">
        {displayedSurahs.map(surah => (
          <motion.div
            key={surah.id}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            className="group relative"
          >
            <button
              onClick={() => updateSurahColor(surah.id)}
              className="w-full aspect-square rounded-xl border flex flex-col items-center justify-center p-1 transition-all shadow-sm"
              style={{
                backgroundColor: surah.color || 'white',
                borderColor: surah.color ? 'transparent' : 'rgba(139,38,53,0.08)',
                boxShadow: surah.color ? `0 4px 12px ${surah.color}40` : undefined,
              }}
              title={`${surah.id}. ${surah.arabicName} · ${surah.name}`}
            >
              <span className="text-[9px] sm:text-[10px] font-black leading-none" style={{ color: surah.color ? 'rgba(255,255,255,0.9)' : 'rgba(139,38,53,0.5)' }}>{surah.id}</span>
              <span className="text-[7px] sm:text-[8px] leading-tight text-center mt-0.5 font-arabic truncate w-full text-center" style={{ color: surah.color ? 'rgba(255,255,255,0.85)' : 'rgba(139,38,53,0.6)' }}>{surah.arabicName}</span>
            </button>
            {/* Reset button on hover */}
            {surah.color && (
              <button
                onClick={e => resetSurah(surah.id, e)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow-md items-center justify-center hidden group-hover:flex transition-all"
                style={{ color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <X size={8} />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════

export default function App() {
  const [activeTab, setActiveTab]           = useState('dashboard');
  const [lang, setLang]                     = useState<'fr' | 'ar'>('fr');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData]             = useState<UserData | null>(null);
  const [newlyUnlocked, setNewlyUnlocked]   = useState<Badge[]>([]);

  const updateUserDataWithBadges = useCallback((updater: UserData | ((prev: UserData) => UserData)) => {
    setUserData(prev => {
      if (!prev) return prev;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const { newBadges } = checkAndUnlockBadges(next);
      if (newBadges.length > 0) {
        const updated = { ...next, badges: [...next.badges, ...newBadges] };
        setNewlyUnlocked(newBadges);
        newBadges.forEach((badge, i) => {
          setTimeout(() => celebrateBadgeUnlock(badge), i * 800);
        });
        return updated;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('mishkat_user_data');
    const today = new Date().toISOString().split('T')[0];

    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.settings) parsed.settings = { theme: 'light', notifications: true, dailyReminder: '20:00', fontSize: 'medium', showArabicNames: true, username: 'Hafiz' };
      // Migrate surahs to add real names if they're missing
      if (parsed.surahs && parsed.surahs[0]?.name === 'Surah 1') {
        const { generateAllSurahs } = require('./types');
        const freshSurahs = generateAllSurahs();
        parsed.surahs = freshSurahs.map((fresh: any, i: number) => ({
          ...fresh,
          status: parsed.surahs[i]?.status || 'not_started',
          color: parsed.surahs[i]?.color,
        }));
      }
      // Migrate missing fields
      if (parsed.loginStreak === undefined) parsed.loginStreak = 1;
      if (parsed.tasbihSessionBest === undefined) parsed.tasbihSessionBest = 0;

      // Update login streak via the canonical helper
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastLoginDate !== today) {
        const { newStreak } = checkLoginStreak(parsed);
        parsed.loginStreak = newStreak;
        parsed.lastLoginDate = today;
      }

      setUserData(parsed);
    } else {
      const initial: UserData = {
        surahs: generateAllSurahs(),
        diftarPages: [],
        goals: [
          { id: '1', text: 'Mémoriser Sourate Al-Mulk', completed: false, month: 3 },
          { id: '2', text: 'Lire 5 pages par jour', completed: true, month: 3 },
        ],
        badges: [], calendar: [], tasbihCount: 0, onboarded: false,
        loginStreak: 1,
        lastLoginDate: today,
        tasbihSessionBest: 0,
        settings: { theme: 'light', notifications: true, dailyReminder: '20:00', fontSize: 'medium', showArabicNames: true, username: 'Hafiz' },
      };
      setUserData(initial);
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    if (userData) localStorage.setItem('mishkat_user_data', JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      const timer = setTimeout(() => setNewlyUnlocked([]), 10000);
      return () => clearTimeout(timer);
    }
  }, [newlyUnlocked]);

  if (!userData) return null;

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500',
        userData.settings?.theme === 'dark' ? 'dark' : userData.settings?.theme === 'sepia' ? 'sepia' : '',
        userData.settings?.fontSize === 'small' ? 'text-xs' : userData.settings?.fontSize === 'large' ? 'text-lg' : 'text-base',
        lang === 'ar' ? 'rtl' : 'ltr'
      )}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] rounded-full floating-element" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-secondary) 8%, transparent), transparent 70%)', filter: 'blur(80px)', animationDelay: '0s' }} />
        <div className="absolute top-[30%] -right-[8%] w-[35%] h-[35%] rounded-full floating-element" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 6%, transparent), transparent 70%)', filter: 'blur(100px)', animationDelay: '-2.5s' }} />
        <div className="absolute -bottom-[15%] left-[15%] w-[55%] h-[55%] rounded-full floating-element" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-accent) 7%, transparent), transparent 70%)', filter: 'blur(120px)', animationDelay: '-5s' }} />
        <div className="absolute inset-0 geometric-pattern opacity-40" style={{ color: 'var(--brand-primary)' }} />
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} setLang={setLang} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      <main className={cn('flex-1 p-4 md:p-12 overflow-y-auto pb-24 md:pb-12 relative z-10', lang === 'ar' ? 'text-right' : 'text-left')}>
        <div className="max-w-7xl mx-auto h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="h-full"
            >
              {activeTab === 'dashboard'    && <Dashboard userData={userData} lang={lang} />}
              {activeTab === 'diftar'       && <Diftar userData={userData} setUserData={updateUserDataWithBadges} lang={lang} />}
              {activeTab === 'coloring'     && <ColoringGrid userData={userData} setUserData={updateUserDataWithBadges} lang={lang} />}
              {activeTab === 'goals'        && <GoalsSection userData={userData} setUserData={updateUserDataWithBadges} lang={lang} />}
              {activeTab === 'tasbih'       && <TasbihSection userData={userData} setUserData={updateUserDataWithBadges} lang={lang} />}
              {activeTab === 'memorization' && <MemorizationSection userData={userData} setUserData={updateUserDataWithBadges} lang={lang} />}
              {activeTab === 'calendar'     && <CalendarSection userData={userData} setUserData={updateUserDataWithBadges} lang={lang} />}
              {activeTab === 'badges'       && <BadgesSection userData={userData} lang={lang} newlyUnlocked={newlyUnlocked} />}
              {activeTab === 'kanban'       && <KanbanSection userData={userData} setUserData={updateUserDataWithBadges} lang={lang} />}
              {activeTab === 'settings'     && <SettingsSection userData={userData} setUserData={updateUserDataWithBadges} lang={lang} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-sm z-[100] flex items-center justify-center p-6" style={{ background: 'color-mix(in srgb, var(--brand-primary) 35%, transparent)' }}>
            <motion.div initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', bounce: 0.3 }} className="glass-card p-12 max-w-md text-center space-y-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary), var(--brand-primary))' }} />
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-2xl relative" style={{ background: 'var(--brand-primary)' }}>
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
                <span className="text-4xl text-white" style={{ fontFamily: 'Amiri, serif', fontWeight: 700 }}>م</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>Mishkat</h2>
                <p className="text-lg mt-1" style={{ color: 'var(--brand-secondary)', fontFamily: 'Amiri, serif' }}>مِشْكَاة · تَطْبِيقُ الحِفْظِ</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'Bienvenue dans votre compagnon de mémorisation. Suivez vos progrès, coloriez vos réussites et écrivez vos notes dans votre Diftar numérique.' : 'مرحباً بك في رفيقك في الحفظ. تتبع تقدمك، لون إنجازاتك، واكتب ملاحظاتك في دفترك الرقمي.'}
              </p>
              <button onClick={() => setShowOnboarding(false)} className="premium-button w-full text-lg">
                {lang === 'fr' ? "Commencer l'aventure ✦" : 'ابدأ الرحلة ✦'}
              </button>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>Par Rahima & hamda_wa_chakra</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-ring { 0%,100% { transform: scale(1); opacity: 0.2; } 50% { transform: scale(1.1); opacity: 0.05; } }
      `}</style>
    </div>
  );
}
