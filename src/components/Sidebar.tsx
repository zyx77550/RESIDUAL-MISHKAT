import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Calendar as CalendarIcon, BookOpen, Target, Award, Palette, NotebookPen, Settings, ChevronRight, ChevronLeft, Languages, Trash2, Wind } from 'lucide-react';
import { cn } from '../lib/utils';

export const Sidebar = ({ activeTab, setActiveTab, lang, setLang, isCollapsed, setIsCollapsed }: { activeTab: string, setActiveTab: any, lang: string, setLang: any, isCollapsed: boolean, setIsCollapsed: any }) => {
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