import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar as CalendarIcon, BookOpen, Target, Award,
  Palette, NotebookPen, Settings, ChevronRight, ChevronLeft, Languages,
  Trash2, Wind, Kanban, Flame, Moon, Sun
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: string;
  setLang: (l: 'fr' | 'ar') => void;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  loginStreak?: number;
  theme?: string;
  onThemeToggle?: () => void;
}

export const Sidebar = ({
  activeTab, setActiveTab, lang, setLang,
  isCollapsed, setIsCollapsed, loginStreak = 1, theme = 'light', onThemeToggle
}: SidebarProps) => {

  const menuItems = [
    { id: 'dashboard',    icon: LayoutDashboard, labelFr: 'Tableau de bord', labelAr: 'لوحة التحكم' },
    { id: 'calendar',     icon: CalendarIcon,    labelFr: 'Calendrier',       labelAr: 'التقويم'     },
    { id: 'memorization', icon: BookOpen,         labelFr: 'Mémorisation',     labelAr: 'الحفظ'       },
    { id: 'goals',        icon: Target,           labelFr: 'Objectifs',        labelAr: 'الأهداف'     },
    { id: 'badges',       icon: Award,            labelFr: 'Badges',           labelAr: 'الإنجازات'   },
    { id: 'tasbih',       icon: Wind,             labelFr: 'Tasbih',           labelAr: 'تسبيح'       },
    { id: 'coloring',     icon: Palette,          labelFr: 'Coloriage',        labelAr: 'التلوين'     },
    { id: 'diftar',       icon: NotebookPen,      labelFr: 'Diftar',           labelAr: 'الدفتر'      },
    { id: 'kanban',       icon: Kanban,           labelFr: 'Suivi',            labelAr: 'المتابعة'    },
    { id: 'quran',        icon: BookOpen,         labelFr: 'Coran',            labelAr: 'القرآن'    },
    { id: 'settings',     icon: Settings,         labelFr: 'Réglages',         labelAr: 'الإعدادات'   },
  ];

  const isRtl = lang === 'ar';

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? '78px' : '280px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'fixed bottom-0 left-0 right-0 md:relative md:h-screen',
        'backdrop-blur-2xl border-t md:border-t-0 md:border-r',
        'p-2 md:p-4 flex md:flex-col overflow-x-auto md:overflow-hidden',
        'no-scrollbar justify-start gap-1 md:gap-1.5 z-50 shrink-0',
        isRtl ? 'md:order-last md:border-r-0 md:border-l' : ''
      )}
      style={{
        background: 'var(--brand-surface)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* ── Logo (desktop) ── */}
      <div className="hidden md:flex items-center justify-between mb-6 shrink-0 pt-1 px-1">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <div className="relative inline-block">
                <h1 className="text-3xl text-gradient" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Mishkat
                </h1>
                <div className="absolute -bottom-0.5 left-0 right-4 h-px"
                     style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary), transparent)', opacity: 0.35 }} />
              </div>
              <p className="text-[9px] uppercase tracking-[0.36em] mt-1.5 font-bold"
                 style={{ color: 'var(--brand-secondary)', opacity: 0.65 }}>
                مِشْكَاة · حِفْظ القرآن
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl transition-all hover:scale-105 flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Streak (desktop, expanded) ── */}
      <AnimatePresence>
        {!isCollapsed && loginStreak >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="hidden md:flex items-center gap-3 px-3 py-2.5 rounded-xl overflow-hidden"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--brand-primary)' }}>
              <Flame size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-gradient leading-none">{loginStreak} jours</p>
              <p className="text-[9px] uppercase tracking-widest font-bold mt-0.5"
                 style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'de suite' : 'متواصل'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Menu items ── */}
      <div className="flex md:flex-col gap-1 flex-1">
        {menuItems.map((item, idx) => {
          const label = lang === 'fr' ? item.labelFr : item.labelAr;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => setActiveTab(item.id)}
              title={isCollapsed ? label : ''}
              className={cn(
                'flex flex-col md:flex-row items-center gap-1.5 md:gap-3',
                'px-2 md:px-3 py-2 md:py-2.5 rounded-xl transition-all shrink-0',
                'min-w-[60px] md:min-w-0 relative group',
                isCollapsed ? 'md:justify-center' : ''
              )}
              style={isActive
                ? { background: 'var(--brand-primary)', color: '#fff', boxShadow: '0 4px 18px color-mix(in srgb, var(--brand-primary) 32%, transparent)' }
                : { color: 'color-mix(in srgb, var(--brand-primary) 55%, transparent)' }
              }
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div layoutId="sidebar-pill"
                  className="absolute inset-0 rounded-xl -z-10"
                  style={{ background: 'var(--brand-primary)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
              )}
              {/* Hover bg */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                     style={{ background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }} />
              )}

              <item.icon
                size={17}
                className="transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                style={isActive ? { color: '#fff' } : { color: 'var(--brand-primary)', opacity: 0.55 }}
              />

              {/* Label desktop */}
              {!isCollapsed && (
                <span className={cn(
                  'text-[12px] whitespace-nowrap leading-none hidden md:block',
                  isActive ? 'text-white font-semibold' : 'font-medium'
                )}
                style={isActive ? {} : { color: 'color-mix(in srgb, var(--brand-primary) 65%, transparent)' }}>
                  {label}
                </span>
              )}

              {/* Label mobile */}
              <span className="text-[8px] md:hidden whitespace-nowrap leading-none font-bold"
                    style={{ color: isActive ? '#fff' : 'color-mix(in srgb, var(--brand-primary) 50%, transparent)' }}>
                {label.slice(0, 6)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Bottom actions (desktop expanded) ── */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden md:flex mt-auto flex-col gap-3 pt-3 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            {/* Credits */}
            <div className="px-3 py-3 rounded-xl relative overflow-hidden"
                 style={{ background: 'color-mix(in srgb, var(--brand-secondary) 7%, transparent)', border: '1px solid var(--border-accent)' }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1"
                 style={{ color: 'var(--brand-secondary)' }}>Artisans du Savoir</p>
              <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--brand-text-muted)' }}>
                Rahima & hamda_wa_chakra
              </p>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/hamda_wa_chakra" target="_blank" rel="noopener noreferrer"
                   className="text-[10px] font-black hover:scale-105 transition-transform"
                   style={{ color: 'var(--brand-primary)' }}>Instagram</a>
                <a href="https://www.tiktok.com/@hamda_wa_chakra" target="_blank" rel="noopener noreferrer"
                   className="text-[10px] font-black hover:scale-105 transition-transform"
                   style={{ color: 'var(--brand-primary)' }}>TikTok</a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                style={{ color: 'var(--brand-text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--brand-primary) 5%, transparent)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Languages size={15} className="group-hover:rotate-12 transition-transform flex-shrink-0"
                           style={{ color: 'var(--brand-secondary)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {lang === 'fr' ? 'العربية' : 'Français'}
                </span>
              </button>

              <button
                onClick={() => {
                  if (confirm(lang === 'fr' ? 'Voulez-vous vraiment tout réinitialiser ?' : 'هل تريد حقاً إعادة ضبط كل شيء؟')) {
                    localStorage.removeItem('mishkat_user_data');
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                style={{ color: 'rgba(239,68,68,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Trash2 size={15} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {lang === 'fr' ? 'Réinitialiser' : 'إعادة ضبط'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
