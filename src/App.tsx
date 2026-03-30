import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  X,
  CheckCircle2,
  Circle,
  Moon,
  Sun,
  Languages,
  Wind,
  Star,
  Highlighter,
  Pencil,
  Brush,
  Settings2,
  Wrench,
  Sliders
} from 'lucide-react';
import { cn } from './lib/utils';
import { Surah, DiftarPage, UserData, generateAllSurahs, Stroke } from './types';
import confetti from 'canvas-confetti';

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab, lang, setLang, isCollapsed, setIsCollapsed }: any) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: lang === 'fr' ? 'Tableau de bord' : 'لوحة التحكم' },
    { id: 'calendar', icon: CalendarIcon, label: lang === 'fr' ? 'Calendrier' : 'التقويم' },
    { id: 'memorization', icon: BookOpen, label: lang === 'fr' ? 'Mémorisation' : 'الحفظ' },
    { id: 'goals', icon: Target, label: lang === 'fr' ? 'Objectifs' : 'الأهداف' },
    { id: 'badges', icon: Award, label: lang === 'fr' ? 'Badges' : 'الإنجازات' },
    { id: 'tasbih', icon: Wind, label: lang === 'fr' ? 'Tasbih' : 'تسبيح' },
    { id: 'coloring', icon: Palette, label: lang === 'fr' ? 'Coloriage' : 'التلوين' },
    { id: 'diftar', icon: NotebookPen, label: lang === 'fr' ? 'Diftar' : 'الدفتر' },
    { id: 'kanban', icon: LayoutDashboard, label: lang === 'fr' ? 'Suivi' : 'المتابعة' },
    { id: 'settings', icon: Settings, label: lang === 'fr' ? 'Réglages' : 'الإعدادات' },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isCollapsed ? '80px' : '288px',
      }}
      className={cn(
        "fixed bottom-0 left-0 right-0 md:relative backdrop-blur-2xl border-t md:border-t-0 md:border-r p-3 md:p-5 flex md:flex-col overflow-x-auto md:overflow-x-hidden no-scrollbar justify-start md:justify-start gap-1.5 md:gap-2 z-50 transition-all duration-500",
        lang === 'ar' ? "md:order-last md:border-r-0 md:border-l" : ""
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 pl-1"
          >
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
              "flex flex-col md:flex-row items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl transition-all shrink-0 min-w-[68px] md:min-w-0 group relative",
              isCollapsed ? "md:justify-center" : ""
            )}
            style={activeTab === item.id ? {
              background: 'var(--brand-primary)',
              color: '#fff',
              boxShadow: '0 4px 18px color-mix(in srgb, var(--brand-primary) 32%, transparent)',
            } : {
              color: 'var(--brand-text-muted)',
            }}
            title={isCollapsed ? item.label : ""}
          >
            <item.icon size={18} className={cn("transition-all duration-300 group-hover:scale-110 flex-shrink-0")} style={activeTab === item.id ? { color: '#fff' } : { color: 'var(--brand-secondary)', opacity: 0.75 }} />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn("text-[10px] md:text-[13px] whitespace-nowrap transition-colors leading-none", activeTab === item.id ? "text-white font-semibold" : "font-medium")}
              >
                {item.label}
              </motion.span>
            )}
            {activeTab === item.id && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl -z-10"
                style={{ background: 'var(--brand-primary)' }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            )}
            {activeTab !== item.id && (
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }} />
            )}
          </motion.button>
        ))}
      </div>

      {!isCollapsed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden md:flex mt-auto flex-col gap-4"
        >
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
              onClick={() => {
                if (confirm(lang === 'fr' ? 'Voulez-vous vraiment tout réinitialiser ?' : 'هل تريد حقاً إعادة ضبط كل شيء؟')) {
                  localStorage.removeItem('mishkat_user_data');
                  window.location.reload();
                }
              }}
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

// --- Sections ---

const Dashboard = ({ userData, lang }: { userData: UserData, lang: string }) => {
  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const progress = (memorizedCount / 114) * 100;
  const username = userData.settings?.username || 'Hafiz';

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-3" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {lang === 'fr' ? new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="text-5xl leading-tight" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
            {lang === 'fr' ? `Paix sur toi,` : `السلام عليك`}
          </h2>
          <h2 className="text-5xl leading-tight text-gradient" style={{ fontWeight: 700 }}>
            {lang === 'fr' ? username : `يا ${username}`}
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-8" style={{ background: 'var(--brand-secondary)', opacity: 0.4 }} />
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: 'var(--brand-secondary)', opacity: 0.55 }}>تَطْبِيقُ الحِفْظِ المِثَالِي</p>
            <div className="h-px w-8" style={{ background: 'var(--brand-secondary)', opacity: 0.4 }} />
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-right hidden sm:block"
        >
          <p className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'var(--brand-text-muted)' }}>Curateurs de Lumière</p>
          <p className="text-base font-semibold mt-0.5" style={{ color: 'var(--brand-secondary)' }}>Rahima & Hamda</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--brand-secondary) 6%, transparent), transparent 70%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--brand-secondary), transparent)', opacity: 0 }} />
          <div className="card-accent-bar" />
          <div className="relative w-44 h-44">
            {/* Decorative outer ring */}
            <div className="absolute inset-0 rounded-full" style={{ border: '1px dashed var(--border-accent)', opacity: 0.5, animation: 'spin 30s linear infinite' }} />
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="6" fill="transparent" style={{ color: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }} />
              <motion.circle
                cx="50%" cy="50%" r="42%"
                stroke="url(#progressGrad)" strokeWidth="6"
                fill="transparent"
                strokeDasharray="100 100"
                pathLength="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 2.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
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
          <p className="text-sm mt-2 max-w-[180px] leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? 'Chaque verset est une lumière sur votre chemin.' : 'كل آية هي نور في طريقك.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 col-span-1 lg:col-span-2">
          {[
            { label: lang === 'fr' ? 'Sourates' : 'السور', value: memorizedCount, icon: BookOpen, grad: 'from-[#A8DADC]/15' },
            { label: lang === 'fr' ? 'Objectifs' : 'الأهداف', value: userData.goals.filter(g => g.completed).length, icon: Target, grad: 'from-[#B7E4C7]/15' },
            { label: lang === 'fr' ? 'Badges' : 'الأوسمة', value: userData.badges.length, icon: Award, grad: 'from-[#D4AF37]/10' },
            { label: lang === 'fr' ? 'Jours' : 'الأيام', value: userData.calendar.length, icon: CalendarIcon, grad: 'from-[#8B2635]/8' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.1 }}
              className={cn("glass-card p-7 flex flex-col justify-between group overflow-hidden relative")}
            >
              <div className="card-accent-bar" />
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", stat.grad)} />
              <stat.icon className="relative z-10 transition-all duration-500 group-hover:scale-110" size={28} style={{ color: 'color-mix(in srgb, var(--brand-primary) 25%, transparent)' }} />
              <div className="relative z-10 mt-4">
                <p className="text-5xl text-gradient" style={{ fontWeight: 700 }}>{stat.value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black mt-1" style={{ color: 'var(--brand-text-muted)' }}>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-8 relative overflow-hidden"
      >
        <div className="card-accent-bar" />
        <div className="absolute top-0 right-0 p-8 opacity-[0.025] pointer-events-none">
          <Target size={180} />
        </div>
        <h3 className="text-2xl mb-7 flex items-center gap-4" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
            <Target size={17} style={{ color: 'var(--brand-secondary)' }} />
          </div>
          {lang === 'fr' ? 'Intentions du mois' : 'نوايا الشهر'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userData.goals.slice(0, 3).map((goal, idx) => (
            <motion.div 
              key={goal.id}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-4 rounded-xl border transition-all group"
              style={{
                background: goal.completed 
                  ? 'color-mix(in srgb, var(--brand-secondary) 6%, transparent)' 
                  : 'color-mix(in srgb, var(--brand-primary) 3%, transparent)',
                borderColor: goal.completed ? 'var(--border-accent)' : 'var(--border-subtle)',
              }}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
              )} style={{
                background: goal.completed ? 'var(--brand-secondary)' : 'var(--brand-surface)',
                border: goal.completed ? 'none' : '1.5px solid var(--border-subtle)',
              }}>
                {goal.completed 
                  ? <CheckCircle2 size={14} style={{ color: '#fff' }} /> 
                  : <Circle size={14} style={{ color: 'var(--brand-text-muted)' }} />
                }
              </div>
              <span className={cn("text-sm font-medium leading-snug transition-all", goal.completed ? "line-through" : "")} style={{ color: goal.completed ? 'var(--brand-text-muted)' : 'var(--brand-text-main)', opacity: goal.completed ? 0.6 : 1 }}>
                {goal.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const Diftar = ({ userData, setUserData, lang }: { userData: UserData, setUserData: any, lang: string }) => {
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'fountain-pen' | 'chalk' | 'eraser' | 'ruler'>('pen');
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showCustomizationMenu, setShowCustomizationMenu] = useState(false);
  const [color, setColor] = useState('#8B2635');
  const [width, setWidth] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [undoStack, setUndoStack] = useState<{ strokes: Stroke[], stickers: any[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ strokes: Stroke[], stickers: any[] }[]>([]);
  const [currentStrokes, setCurrentStrokes] = useState<Stroke[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showPaperSettings, setShowPaperSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paperStyle, setPaperStyle] = useState<'blank' | 'lines' | 'grid' | 'dots'>('lines');
  const [pageHeight, setPageHeight] = useState(5000);
  const [canvasScale, setCanvasScale] = useState(1);
  const isDrawingRef = useRef(false);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const stickerCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [activeStickerSvg, setActiveStickerSvg] = useState<string | null>(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activePage = userData.diftarPages.find(p => p.id === activePageId);

  const PALETTE = [
    '#8B2635', '#D4AF37', '#2A9D8F', '#264653', '#E76F51', '#000000', '#FFFFFF',
    '#F4A261', '#E9C46A', '#A8DADC', '#457B9D', '#1D3557', '#E63946', '#6D597A',
    '#B56576', '#E56B6F', '#EAAC8B', '#355070', '#6B705C', '#A5A58D', '#FF99C8',
    '#FCF6BD', '#D0F4DE', '#A9DEF9', '#E4C1F9', '#FFD6A5', '#FDFFB6', '#70D6FF',
    '#FF70A6', '#FF9770', '#FFD670', '#E9FF70', '#00B4D8', '#90E0EF', '#03045E',
    'gradient:gold-red', 'gradient:blue-cyan', 'gradient:purple-pink',
    'pattern:dots', 'pattern:stripes'
  ];

  const getStrokeStyle = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.color === 'pattern:dots') {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 10;
      patternCanvas.height = 10;
      const pctx = patternCanvas.getContext('2d')!;
      pctx.fillStyle = '#8B2635';
      pctx.beginPath();
      pctx.arc(5, 5, 2, 0, Math.PI * 2);
      pctx.fill();
      return ctx.createPattern(patternCanvas, 'repeat') || '#8B2635';
    }
    if (stroke.color === 'pattern:stripes') {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = 10;
      patternCanvas.height = 10;
      const pctx = patternCanvas.getContext('2d')!;
      pctx.strokeStyle = '#D4AF37';
      pctx.lineWidth = 2;
      pctx.beginPath();
      pctx.moveTo(0, 0);
      pctx.lineTo(10, 10);
      pctx.stroke();
      return ctx.createPattern(patternCanvas, 'repeat') || '#D4AF37';
    }
    if (stroke.color === 'gradient:gold-red') {
      const grad = ctx.createLinearGradient(0, 0, 1000, 1400);
      grad.addColorStop(0, '#D4AF37');
      grad.addColorStop(1, '#8B2635');
      return grad;
    }
    if (stroke.color === 'gradient:blue-cyan') {
      const grad = ctx.createLinearGradient(0, 0, 1000, 1400);
      grad.addColorStop(0, '#1D3557');
      grad.addColorStop(1, '#A8DADC');
      return grad;
    }
    if (stroke.color === 'gradient:purple-pink') {
      const grad = ctx.createLinearGradient(0, 0, 1000, 1400);
      grad.addColorStop(0, '#6D597A');
      grad.addColorStop(1, '#FF99C8');
      return grad;
    }
    return stroke.color;
  };

  const QURAN_ICONS = [
    { id: 'crescent', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>' },
    { id: 'star', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
    { id: 'mosque', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M4 20v-7c0-2 1-4 3-4s3 2 3 4v7M14 20v-7c0-2 1-4 3-4s3 2 3 4v7M12 9V3m0 0-2 2m2-2 2 2"/></svg>' },
    { id: 'lantern', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 2h8M12 2v3M7 5h10l1 3H6l1-3zM6 8h12v10H6V8zM8 18l-1 4h10l-1-4H8zM12 8v10M9 11h6M9 15h6"/></svg>' },
    { id: 'book', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2H20v15H6.5a2.5 2.5 0 0 0-2.5 2.5z"/></svg>' },
    { id: 'heart', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' },
    { id: 'flower', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V12m4.5 0a4.5 4.5 0 1 1-4.5 4.5M16.5 12H12m-4.5 0a4.5 4.5 0 1 0 4.5 4.5M7.5 12H12m0 0v4.5"/></svg>' },
    { id: 'leaf', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>' },
    { id: 'sun', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>' },
    { id: 'cloud', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19x0a7 7 0 1 1-6.71-9h1.71a4.5 4.5 0 1 1 4.5 4.5v.5Z"/></svg>' },
    { id: 'moon-stars', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M19 3v4M17 5h4M15 10v2M14 11h2"/></svg>' },
    { id: 'geometric-1', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.5 3.5L19 2l-3.5 3.5L19 9l-3.5-3.5L12 9l3.5-3.5L12 2zM5 2l3.5 3.5L12 2l-3.5 3.5L12 9l-3.5-3.5L5 9l3.5-3.5L5 2z"/></svg>' },
    { id: 'geometric-2', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 12l10 10 10-10L12 2zM12 6l6 6-6 6-6-6 6-6z"/></svg>' },
    { id: 'geometric-3', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6"/></svg>' },
    { id: 'ornament-1', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c0 5-4 9-4 13s1.8 7 4 7 4-3 4-7-4-8-4-13z"/></svg>' },
    { id: 'ornament-2', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
    { id: 'check', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>' },
    { id: 'bookmark', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>' },
    { id: 'sparkles', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 1.91 5.81L20 10.72l-4.5 4.38 1.06 6.19L12 18.37l-4.56 2.92 1.06-6.19L4 10.72l6.09-1.91L12 3z"/><path d="M5 3v4M3 5h4M21 17v4M19 19h4"/></svg>' },
    { id: 'coffee', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 2v4M10 2v4M14 2v4"/></svg>' },
    { id: 'pen-tool', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 5 5"/><path d="m11 8 2 2"/></svg>' },
    { id: 'feather', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>' },
    { id: 'compass', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>' },
    { id: 'anchor', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><path d="M12 22V8M5 12H2a10 10 0 0 0 20 0h-3"/></svg>' },
  ];

  useEffect(() => {
    if (activePage) {
      setCurrentStrokes(activePage.strokes || []);
      setStickers(activePage.stickers || []);
      setPageHeight(activePage.height || 5000);
      setPaperStyle(activePage.paperStyle || 'lines');
      setUndoStack([]);
      setRedoStack([]);
    }
  }, [activePageId]);

  const drawLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (paperStyle === 'blank') return;
    
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#8B263515';
    ctx.lineWidth = 1;

    if (paperStyle === 'lines' || paperStyle === 'grid') {
      for (let y = 60; y < height; y += 32) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
    }

    if (paperStyle === 'grid') {
      for (let x = 0; x < width; x += 32) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
    }

    if (paperStyle === 'dots') {
      for (let x = 32; x < width; x += 32) {
        for (let y = 32; y < height; y += 32) {
          ctx.moveTo(x, y);
          ctx.arc(x, y, 0.5, 0, Math.PI * 2);
        }
      }
    }

    ctx.stroke();

    // Margin line
    if (paperStyle !== 'blank') {
      ctx.beginPath();
      ctx.strokeStyle = '#8B263530';
      ctx.lineWidth = 1.5;
      const marginX = lang === 'ar' ? width - 80 : 80;
      ctx.moveTo(marginX, 0);
      ctx.lineTo(marginX, height);
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
    ctx.fillStyle = '#fdfcf8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLines(ctx, canvas.width, canvas.height);

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
        ctx.globalAlpha = 1.0;
        ctx.lineCap = 'butt';
        ctx.lineWidth = stroke.width * 1.2;
        ctx.setTransform(1, 0, 0.4, 1, 0, 0); 
      } else if (stroke.type === 'chalk') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.8;
        ctx.lineCap = 'round';
        ctx.lineWidth = stroke.width * 1.5;
        ctx.setLineDash([1, 2]); 
      } else if (stroke.type === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.lineWidth = stroke.width * 4;
      } else if (stroke.type === 'ruler') {
        ctx.globalCompositeOperation = 'source-over';
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

    stickers.forEach(sticker => {
      const cachedImg = stickerCacheRef.current.get(sticker.svg);
      if (cachedImg) {
        ctx.drawImage(cachedImg, sticker.x - 25, sticker.y - 25, 50, 50);
      } else {
        const img = new Image();
        const svgBlob = new Blob([sticker.svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        img.onload = () => {
          stickerCacheRef.current.set(sticker.svg, img);
          ctx.drawImage(img, sticker.x - 25, sticker.y - 25, 50, 50);
          URL.revokeObjectURL(url);
        };
        img.src = url;
      }
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [currentStrokes, stickers, lang, pageHeight, paperStyle]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = ('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = ('touches' in e) ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeStickerSvg) {
      const { x, y } = getCoords(e);
      setUndoStack(prev => [...prev, { strokes: currentStrokes, stickers }]);
      setRedoStack([]);
      setStickers(prev => [...prev, { id: Date.now().toString(), svg: activeStickerSvg, x, y }]);
      setActiveStickerSvg(null);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeStickerSvg) {
      handleCanvasClick(e);
      return;
    }
    const { x, y } = getCoords(e);

    // Sticker deletion logic
    if (tool === 'eraser') {
      const clickedStickerIndex = stickers.findIndex(s => {
        const dist = Math.sqrt(Math.pow(s.x - x, 2) + Math.pow(s.y - y, 2));
        return dist < 30; // 30px radius for deletion
      });
      if (clickedStickerIndex !== -1) {
        setUndoStack(prev => [...prev, { strokes: currentStrokes, stickers }]);
        setRedoStack([]);
        setStickers(prev => prev.filter((_, i) => i !== clickedStickerIndex));
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
      timestamp: Date.now()
    };
    setUndoStack(prev => [...prev, { strokes: currentStrokes, stickers }]);
    setRedoStack([]);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    const { x, y } = getCoords(e);
    
    if (activeStrokeRef.current.type === 'ruler') {
      const start = activeStrokeRef.current.points[0];
      const dx = Math.abs(x - start.x);
      const dy = Math.abs(y - start.y);
      if (dx > dy) {
        activeStrokeRef.current.points = [start, { x, y: start.y }];
      } else {
        activeStrokeRef.current.points = [start, { x: start.x, y }];
      }
      redrawCanvas();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = getStrokeStyle(ctx, activeStrokeRef.current);
      ctx.lineWidth = activeStrokeRef.current.width;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(activeStrokeRef.current.points[1].x, activeStrokeRef.current.points[1].y);
      ctx.stroke();
      ctx.restore();
      return;
    }

    activeStrokeRef.current.points.push({ x, y });
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.4;
      ctx.lineCap = 'square';
      ctx.lineWidth = stroke.width * 2.5;
    } else if (stroke.type === 'fountain-pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'butt';
      ctx.lineWidth = stroke.width * 1.2;
      // Slanted nib effect
      ctx.setTransform(1, 0, 0.4, 1, 0, 0); 
    } else if (stroke.type === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = stroke.width * 4;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = stroke.width;
    }

    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];

    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current || !activeStrokeRef.current) {
      isDrawingRef.current = false;
      setIsDrawing(false);
      return;
    }
    isDrawingRef.current = false;
    setIsDrawing(false);
    const finishedStroke = activeStrokeRef.current;
    setCurrentStrokes(prev => [...prev, finishedStroke]);
    activeStrokeRef.current = null;
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(stack => [...stack, { strokes: currentStrokes, stickers }]);
    setUndoStack(stack => stack.slice(0, -1));
    setCurrentStrokes(prev.strokes);
    setStickers(prev.stickers);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(stack => [...stack, { strokes: currentStrokes, stickers }]);
    setRedoStack(stack => stack.slice(0, -1));
    setCurrentStrokes(next.strokes);
    setStickers(next.stickers);
  };

  const exportPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${activePage?.title || 'diftar'}.pdf`);
  };

  const savePage = () => {
    if (!activePageId) return;
    setIsSaving(true);
    setUserData((prev: UserData) => ({
      ...prev,
      diftarPages: prev.diftarPages.map(p => 
        p.id === activePageId ? { ...p, strokes: currentStrokes, stickers, height: pageHeight, paperStyle, lastSaved: Date.now() } : p
      )
    }));
    setTimeout(() => setIsSaving(false), 1000);
  };

  const clearCanvas = () => {
    setShowConfirmClear(true);
  };

  const confirmClear = () => {
    setUndoStack(prev => [...prev, { strokes: currentStrokes, stickers }]);
    setCurrentStrokes([]);
    setStickers([]);
    setShowConfirmClear(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (activePageId) savePage();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentStrokes, stickers, activePageId]);

  const createPage = () => {
    const newPage: DiftarPage = {
      id: Math.random().toString(36).substr(2, 9),
      title: lang === 'fr' ? 'Nouvelle Page' : 'صفحة جديدة',
      type: 'custom',
      strokes: [],
      stickers: [],
      height: 5000,
      paperStyle: 'lines',
      lastSaved: Date.now()
    };
    setUserData((prev: UserData) => ({
      ...prev,
      diftarPages: [newPage, ...prev.diftarPages]
    }));
    setActivePageId(newPage.id);
  };

  const deletePage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(id);
  };

  const confirmDelete = () => {
    if (showConfirmDelete) {
      setUserData((prev: UserData) => ({
        ...prev,
        diftarPages: prev.diftarPages.filter(p => p.id !== showConfirmDelete)
      }));
      setShowConfirmDelete(null);
    }
  };

  const renamePage = (id: string, newTitle: string) => {
    setUserData((prev: UserData) => ({
      ...prev,
      diftarPages: prev.diftarPages.map(p => p.id === id ? { ...p, title: newTitle } : p)
    }));
  };

  useEffect(() => {
    const updateScale = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setCanvasScale(rect.width / canvas.width);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [activePageId]);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Automatic Infinite Scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !activePageId) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 800) {
        setPageHeight(prev => prev + 1000);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activePageId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      {!activePageId ? (
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-serif italic text-bordeaux">{lang === 'fr' ? 'Mon Diftar' : 'دفتري'}</h2>
              <p className="text-gold/60 text-sm mt-1">{lang === 'fr' ? 'Vos notes et réflexions' : 'ملاحظاتك وتأملاتك'}</p>
            </div>
            <button 
              onClick={createPage}
              className="bg-bordeaux text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg hover:shadow-bordeaux/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              <Plus size={20} />
              <span className="font-medium">{lang === 'fr' ? 'Nouvelle Page' : 'صفحة جديدة'}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {userData.diftarPages.map((page) => (
              <motion.div
                key={page.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -12 }}
                className="group relative aspect-[3/4] cursor-pointer"
              >
                {/* Notebook Cover */}
                <div 
                  onClick={() => setActivePageId(page.id)}
                  className="absolute inset-0 bg-white rounded-r-2xl shadow-xl border-l-[12px] border-bordeaux overflow-hidden transition-all group-hover:shadow-2xl"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
                  
                  <div className="p-6 h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      {editingPageId === page.id ? (
                        <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                          <input
                            autoFocus
                            className="w-full bg-beige/80 border-b-2 border-bordeaux px-2 py-1 text-xl font-serif italic focus:outline-none rounded-t-lg"
                            value={page.title}
                            onChange={(e) => renamePage(page.id, e.target.value)}
                            onBlur={() => setEditingPageId(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingPageId(null)}
                          />
                        </div>
                      ) : (
                        <h3 className="text-2xl font-serif italic text-bordeaux leading-tight group-hover:text-gold transition-colors">
                          {page.title}
                        </h3>
                      )}
                      <div className="w-12 h-1 bg-gold/30 rounded-full" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-bordeaux/40 font-bold">
                        {new Date(page.lastSaved).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'ar-SA')}
                      </p>
                    </div>
                  </div>

                  {/* Corner Decoration */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 opacity-5">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-bordeaux">
                      <path d="M100 0 L100 100 L0 100 Z" />
                    </svg>
                  </div>
                </div>

                {/* Management Overlay (Glassmorphism) */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className={cn(
                    "absolute inset-0 z-10 bg-bordeaux/60 backdrop-blur-sm rounded-r-2xl flex flex-col items-center justify-center gap-4 transition-opacity duration-300",
                    "opacity-0 group-hover:opacity-100 md:opacity-0" // On mobile, show on group hover (tap)
                  )}
                >
                  <button
                    onClick={() => setActivePageId(page.id)}
                    className="w-32 py-2 bg-white text-bordeaux rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gold hover:text-white transition-all transform hover:scale-105 shadow-lg"
                  >
                    {lang === 'fr' ? 'Ouvrir' : 'فتح'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingPageId(page.id); }}
                    className="w-32 py-2 bg-white/20 text-white border border-white/30 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/40 transition-all transform hover:scale-105"
                  >
                    {lang === 'fr' ? 'Renommer' : 'تسمية'}
                  </button>
                  <button
                    onClick={(e) => deletePage(page.id, e)}
                    className="w-32 py-2 bg-red-500/80 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    {lang === 'fr' ? 'Supprimer' : 'حذف'}
                  </button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 relative h-full overflow-hidden">
          {/* Top Bar - Fixed at top of view */}
          <div className="w-full px-6 py-4 flex flex-col gap-4 z-50">
            <div className="bg-surface/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-primary/10 p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { savePage(); setActivePageId(null); }}
                  className="p-3 hover:bg-primary/5 rounded-full text-primary transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <input 
                  value={activePage?.title} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserData((prev: UserData) => ({
                      ...prev,
                      diftarPages: prev.diftarPages.map(p => p.id === activePageId ? { ...p, title: val } : p)
                    }));
                  }}
                  className="font-serif italic text-xl text-primary bg-transparent border-none focus:ring-0 text-left flex-1 min-w-[150px] ml-2"
                />
                <div className="w-px h-6 bg-primary/10 mx-1" />
                
                {/* Tools Group */}
                <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-full">
                  <button 
                    onClick={() => { setShowToolsMenu(!showToolsMenu); setShowCustomizationMenu(false); setShowStickerPicker(false); setShowPaperSettings(false); }}
                    className={cn(
                      "p-2.5 rounded-full transition-all",
                      showToolsMenu ? "bg-primary text-white shadow-lg" : "text-primary hover:bg-primary/10"
                    )}
                    title={lang === 'fr' ? 'Outils' : 'أدوات'}
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => { setShowCustomizationMenu(!showCustomizationMenu); setShowToolsMenu(false); setShowStickerPicker(false); setShowPaperSettings(false); }}
                    className={cn(
                      "p-2.5 rounded-full transition-all",
                      showCustomizationMenu ? "bg-primary text-white shadow-lg" : "text-primary hover:bg-primary/10"
                    )}
                    title={lang === 'fr' ? 'Couleurs' : 'الألوان'}
                  >
                    <Palette size={18} />
                  </button>
                  <button 
                    onClick={() => { setShowStickerPicker(!showStickerPicker); setShowToolsMenu(false); setShowCustomizationMenu(false); setShowPaperSettings(false); }}
                    className={cn(
                      "p-2.5 rounded-full transition-all",
                      showStickerPicker ? "bg-primary text-white shadow-lg" : "text-primary hover:bg-primary/10"
                    )}
                    title={lang === 'fr' ? 'Stickers' : 'ملصقات'}
                  >
                    <Star size={18} />
                  </button>
                  <button 
                    onClick={() => { setShowPaperSettings(!showPaperSettings); setShowToolsMenu(false); setShowCustomizationMenu(false); setShowStickerPicker(false); }}
                    className={cn(
                      "p-2.5 rounded-full transition-all",
                      showPaperSettings ? "bg-primary text-white shadow-lg" : "text-primary hover:bg-primary/10"
                    )}
                    title={lang === 'fr' ? 'Papier' : 'الورق'}
                  >
                    <Settings2 size={18} />
                  </button>
                </div>
              </div>

              {/* Center: Undo/Redo */}
              <div className="hidden sm:flex items-center gap-2 bg-primary/5 p-1 rounded-full">
                <button onClick={undo} className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors" title="Undo"><Undo size={18}/></button>
                <button onClick={redo} className="p-2.5 text-primary hover:bg-primary/10 rounded-full transition-colors" title="Redo"><Redo size={18}/></button>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button onClick={clearCanvas} className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Clear"><Trash2 size={18}/></button>
                <div className="w-px h-6 bg-primary/10 mx-1" />
                <button onClick={exportPDF} className="p-3 text-primary hover:bg-primary/5 rounded-full transition-colors" title="Export"><Download size={18}/></button>
                <button 
                  onClick={savePage} 
                  disabled={isSaving}
                  className={cn(
                    "rounded-full transition-all flex items-center gap-2 px-5 py-2.5 shadow-lg active:scale-95",
                    isSaving ? "bg-green-500 text-white shadow-green-500/20" : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                  )}
                >
                  <motion.div
                    animate={isSaving ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    {isSaving ? <Check size={18}/> : <Save size={18}/>}
                  </motion.div>
                  <span className="text-sm font-bold hidden sm:inline">
                    {isSaving ? (lang === 'fr' ? 'Sauvé' : 'تم الحفظ') : (lang === 'fr' ? 'Sauver' : 'حفظ')}
                  </span>
                </button>
              </div>
            </div>

            {/* Floating Popups below Top Bar */}
            <AnimatePresence>
              {(showToolsMenu || showCustomizationMenu || showStickerPicker || showPaperSettings) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full max-w-2xl mx-auto"
                >
                  {showToolsMenu && (
                    <motion.div className="bg-surface/95 backdrop-blur-3xl p-4 rounded-[2.5rem] shadow-2xl border border-primary/10 flex justify-around items-center gap-2">
                      {[
                        { id: 'pen', icon: Pencil, label: lang === 'fr' ? 'Stylo' : 'قلم' },
                        { id: 'fountain-pen', icon: Brush, label: lang === 'fr' ? 'Plume' : 'ريشة' },
                        { id: 'highlighter', icon: Highlighter, label: lang === 'fr' ? 'Surligneur' : 'قلم تحديد' },
                        { id: 'eraser', icon: Eraser, label: lang === 'fr' ? 'Gomme' : 'ممحاة' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => { setTool(t.id as any); setShowToolsMenu(false); }}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all flex-1",
                            tool === t.id ? "bg-primary text-white shadow-lg" : "hover:bg-primary/5 text-primary/60"
                          )}
                        >
                          <t.icon size={20} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {showCustomizationMenu && (
                    <motion.div className="bg-surface/95 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-2xl border border-primary/10 space-y-6">
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/40 px-1">{lang === 'fr' ? 'Couleurs' : 'الألوان'}</h4>
                        <div className="grid grid-cols-10 gap-2">
                          {PALETTE.map(c => (
                            <button 
                              key={c} 
                              onClick={() => setColor(c)} 
                              className={cn(
                                "w-6 h-6 rounded-full border border-primary/10 transition-all hover:scale-125",
                                color === c && "ring-2 ring-primary ring-offset-2 scale-110 shadow-lg"
                              )}
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/40 px-1">{lang === 'fr' ? 'Épaisseur' : 'السمك'}</h4>
                        <div className="flex items-center gap-4 px-1">
                          <input 
                            type="range" min="1" max="50" value={width} 
                            onChange={(e) => setWidth(parseInt(e.target.value))}
                            className="flex-1 accent-primary h-1.5 bg-primary/10 rounded-full appearance-none cursor-pointer"
                          />
                          <span className="text-xs font-mono w-8 text-primary/60 text-right">{width}px</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {showStickerPicker && (
                    <motion.div className="bg-surface/95 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-2xl border border-primary/10 grid grid-cols-6 sm:grid-cols-8 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {QURAN_ICONS.map(icon => (
                        <button 
                          key={icon.id} 
                          onClick={() => { setActiveStickerSvg(icon.svg); setShowStickerPicker(false); }}
                          className="aspect-square hover:scale-110 transition-all flex items-center justify-center p-2 bg-primary/5 rounded-2xl border border-transparent hover:border-primary/20"
                          dangerouslySetInnerHTML={{ __html: icon.svg }}
                        />
                      ))}
                    </motion.div>
                  )}

                  {showPaperSettings && (
                    <motion.div className="bg-surface/95 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-2xl border border-primary/10 flex justify-around gap-4">
                      {[
                        { id: 'blank', label: lang === 'fr' ? 'Blanc' : 'أبيض' },
                        { id: 'lines', label: lang === 'fr' ? 'Lignes' : 'سطور' },
                        { id: 'grid', label: lang === 'fr' ? 'Grille' : 'شبكة' },
                        { id: 'dots', label: lang === 'fr' ? 'Points' : 'نقاط' }
                      ].map(style => (
                        <button
                          key={style.id}
                          onClick={() => { setPaperStyle(style.id as any); setShowPaperSettings(false); }}
                          className={cn(
                            "flex-1 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all border",
                            paperStyle === style.id ? "bg-primary text-white border-primary shadow-lg" : "bg-primary/5 text-primary border-transparent hover:bg-primary/10"
                          )}
                        >
                          {style.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div 
            ref={scrollContainerRef}
              className="flex-1 bg-surface rounded-[2.5rem] shadow-2xl overflow-y-auto relative border border-primary/10 group cursor-none transition-all duration-700 custom-scrollbar"
            >
            {/* Scroll Navigation Buttons */}
            <div className="fixed right-20 bottom-32 z-50 flex flex-col gap-2">
              <button 
                onClick={() => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                className="p-3 bg-surface/80 backdrop-blur-md rounded-full shadow-lg border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                title="Top"
              >
                <ChevronUp size={20} />
              </button>
              <button 
                onClick={() => scrollContainerRef.current?.scrollTo({ top: pageHeight, behavior: 'smooth' })}
                className="p-3 bg-surface/80 backdrop-blur-md rounded-full shadow-lg border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                title="Bottom"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Notebook Binding Effect */}
            <div className={cn(
              "absolute top-0 w-12 bg-gradient-to-r from-black/10 via-transparent to-transparent z-20 pointer-events-none",
              lang === 'ar' ? "right-0 rotate-180" : "left-0"
            )} style={{ height: `${pageHeight}px` }}>
              <div className="h-full w-full flex flex-col justify-around py-8 px-2">
                {[...Array(Math.ceil(pageHeight / 100))].map((_, i) => (
                  <div key={i} className="w-full h-2 bg-black/5 rounded-full shadow-inner mb-4" />
                ))}
              </div>
            </div>

            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-10" style={{ height: `${pageHeight}px` }} />
            
            <canvas
              ref={canvasRef}
              width={1000}
              height={pageHeight}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full touch-none bg-[#fdfcf8]"
            />

            {/* Add more space button at the bottom */}
            <div className="flex justify-center py-12 bg-[#fdfcf8] relative z-20">
              <button 
                onClick={() => setPageHeight(prev => prev + 2000)}
                className="flex items-center gap-2 px-6 py-3 bg-primary/5 text-primary rounded-full hover:bg-primary/10 transition-all border border-primary/10 font-bold uppercase tracking-widest text-xs"
              >
                <Plus size={16} />
                {lang === 'fr' ? "Ajouter de l'espace" : "إضافة مساحة"}
              </button>
            </div>
            
            {/* Custom Cursor */}
            <motion.div 
              className="fixed pointer-events-none z-[60] -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center"
              style={{ 
                left: cursorXSpring,
                top: cursorYSpring,
              }}
            >
              <motion.div
                layout
                initial={false}
                animate={{
                  width: activeStickerSvg ? 60 : (tool === 'highlighter' ? width * 6 : width + 16) * canvasScale,
                  height: activeStickerSvg ? 60 : (tool === 'highlighter' ? width * 5 : width + 16) * canvasScale,
                  borderRadius: tool === 'highlighter' ? '4px' : '50%',
                  backgroundColor: activeStickerSvg ? 'transparent' : (tool === 'eraser' ? 'var(--brand-page)' : color),
                  opacity: tool === 'highlighter' ? 0.3 : 0.8,
                  border: activeStickerSvg ? '2px dashed var(--brand-secondary)' : '1px solid rgba(255,255,255,0.8)',
                  backdropFilter: tool === 'eraser' ? 'blur(4px)' : 'none',
                  scale: isDrawing ? 0.8 : 1,
                  rotate: isDrawing ? -15 : 0,
                }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="relative flex items-center justify-center shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.2)]"
              >
                {activeStickerSvg ? (
                  <div className="w-full h-full opacity-60 animate-pulse" dangerouslySetInnerHTML={{ __html: activeStickerSvg }} />
                ) : (
                  <div className="text-white/40">
                    {tool === 'pen' && <Pencil size={12 * canvasScale} />}
                    {tool === 'fountain-pen' && <Brush size={12 * canvasScale} />}
                    {tool === 'highlighter' && <Highlighter size={12 * canvasScale} />}
                    {tool === 'eraser' && <Eraser size={12 * canvasScale} className="text-primary/40" />}
                    {tool === 'ruler' && <Ruler size={12 * canvasScale} />}
                  </div>
                )}
              </motion.div>
            </motion.div>


          </div>
        </div>
      )}

      <AnimatePresence>
        {(showConfirmDelete || showConfirmClear) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bordeaux/20 backdrop-blur-md z-[200] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-8 border border-bordeaux/5"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                {showConfirmClear ? <Wind size={40} /> : <Trash2 size={40} />}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic text-bordeaux">
                  {showConfirmClear 
                    ? (lang === 'fr' ? 'Purifier la page ?' : 'تطهير الصفحة؟')
                    : (lang === 'fr' ? 'Supprimer la page ?' : 'حذف الصفحة؟')}
                </h3>
                <p className="text-sm text-bordeaux/50 leading-relaxed">
                  {showConfirmClear
                    ? (lang === 'fr' ? 'Tous vos traits et stickers seront effacés. Cette action est irréversible.' : 'سيتم مسح جميع الخطوط والملصقات. هذا الإجراء لا يمكن التراجع عنه.')
                    : (lang === 'fr' ? 'Cette action est irréversible. Voulez-vous continuer ?' : 'هذا الإجراء لا يمكن التراجع عنه. هل تريد الاستمرار؟')}
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => { setShowConfirmDelete(null); setShowConfirmClear(false); }}
                  className="flex-1 py-4 rounded-2xl border border-bordeaux/10 hover:bg-beige transition-all font-bold text-bordeaux/40 text-xs uppercase tracking-widest"
                >
                  {lang === 'fr' ? 'Annuler' : 'إلغاء'}
                </button>
                <button
                  onClick={showConfirmClear ? confirmClear : confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white hover:bg-red-600 hover:scale-105 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-200"
                >
                  {showConfirmClear ? (lang === 'fr' ? 'Effacer' : 'مسح') : (lang === 'fr' ? 'Supprimer' : 'حذف')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ColoringGrid = ({ userData, setUserData, lang }: { userData: UserData, setUserData: any, lang: string }) => {
  const [selectedColor, setSelectedColor] = useState('#8B2635');
  
  const updateSurahColor = (id: number) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map(s => s.id === id ? { ...s, color: selectedColor, status: 'memorized' } : s)
    }));
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: [selectedColor, '#D4AF37']
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-bordeaux">{lang === 'fr' ? 'Grille des 114 Sourates' : 'شبكة الـ 114 سورة'}</h2>
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm">
          {['#8B2635', '#D4AF37', '#A8DADC', '#B7E4C7', '#F4A261', '#E76F51'].map(c => (
            <button 
              key={c} 
              onClick={() => setSelectedColor(c)} 
              className={cn("w-8 h-8 rounded-full transition-transform", selectedColor === c && "scale-125 ring-2 ring-offset-2 ring-bordeaux")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-2 sm:gap-3 p-4 sm:p-6 glass-card arabesque-pattern max-h-[70vh] overflow-y-auto">
        {userData.surahs.map((surah) => (
          <button
            key={surah.id}
            onClick={() => updateSurahColor(surah.id)}
            className={cn(
              "aspect-square rounded-lg border border-bordeaux/10 flex flex-col items-center justify-center transition-all hover:scale-110 shadow-sm p-1",
              surah.color ? "text-white" : "bg-white text-bordeaux/40"
            )}
            style={{ backgroundColor: surah.color || 'white' }}
          >
            <span className="text-[8px] sm:text-[10px] font-bold">{surah.id}</span>
            <span className="text-[6px] sm:text-[8px] opacity-60 truncate w-full text-center">{surah.arabicName}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem('mishkat_user_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration for settings
      if (!parsed.settings) {
        parsed.settings = {
          theme: 'light',
          notifications: true,
          dailyReminder: '20:00',
          fontSize: 'medium',
          showArabicNames: true,
          username: 'Hafiz',
        };
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
        badges: [],
        calendar: [],
        tasbihCount: 0,
        onboarded: false,
        settings: {
          theme: 'light',
          notifications: true,
          dailyReminder: '20:00',
          fontSize: 'medium',
          showArabicNames: true,
          username: 'Hafiz',
        }
      };
      setUserData(initial);
      setShowOnboarding(true);
    }
  }, []);

  // Save Data
  useEffect(() => {
    if (userData) {
      localStorage.setItem('mishkat_user_data', JSON.stringify(userData));
    }
  }, [userData]);

  if (!userData) return null;

  return (
    <div className={cn(
      "min-h-screen flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500",
      userData.settings?.theme === 'dark' ? "dark" : 
      userData.settings?.theme === 'sepia' ? "sepia" : "",
      userData.settings?.fontSize === 'small' ? "text-xs" : 
      userData.settings?.fontSize === 'large' ? "text-lg" : "text-base",
      lang === 'ar' ? "rtl" : "ltr"
    )} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] rounded-full floating-element" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-secondary) 8%, transparent), transparent 70%)', filter: 'blur(80px)', animationDelay: '0s' }} />
        <div className="absolute top-[30%] -right-[8%] w-[35%] h-[35%] rounded-full floating-element" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 6%, transparent), transparent 70%)', filter: 'blur(100px)', animationDelay: '-2.5s' }} />
        <div className="absolute -bottom-[15%] left-[15%] w-[55%] h-[55%] rounded-full floating-element" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-accent) 7%, transparent), transparent 70%)', filter: 'blur(120px)', animationDelay: '-5s' }} />
        {/* Geometric subtle overlay */}
        <div className="absolute inset-0 geometric-pattern opacity-40" style={{ color: 'var(--brand-primary)' }} />
      </div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        lang={lang} 
        setLang={setLang} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className={cn(
        "flex-1 p-4 md:p-12 overflow-y-auto pb-24 md:pb-12 relative z-10",
        lang === 'ar' ? "text-right" : "text-left"
      )}>
        <div className="max-w-7xl mx-auto h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="h-full"
            >
              {activeTab === 'dashboard' && <Dashboard userData={userData} lang={lang} />}
              {activeTab === 'diftar' && <Diftar userData={userData} setUserData={setUserData} lang={lang} />}
              {activeTab === 'coloring' && <ColoringGrid userData={userData} setUserData={setUserData} lang={lang} />}
              {activeTab === 'goals' && <GoalsSection userData={userData} setUserData={setUserData} lang={lang} />}
              {activeTab === 'tasbih' && <TasbihSection userData={userData} setUserData={setUserData} lang={lang} />}
              {activeTab === 'memorization' && <MemorizationSection userData={userData} setUserData={setUserData} lang={lang} />}
              {activeTab === 'calendar' && <CalendarSection userData={userData} setUserData={setUserData} lang={lang} />}
              {activeTab === 'badges' && <BadgesSection userData={userData} lang={lang} />}
              {activeTab === 'kanban' && <KanbanSection userData={userData} setUserData={setUserData} lang={lang} />}
              {activeTab === 'settings' && <SettingsSection userData={userData} setUserData={setUserData} lang={lang} />}
              
              {/* Placeholder for other sections to be implemented */}
              {activeTab === 'none' && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                  <Settings size={64} className="animate-spin-slow mb-4" />
                  <h2 className="text-2xl font-bold">{lang === 'fr' ? 'En construction' : 'قيد الإنشاء'}</h2>
                  <p>{lang === 'fr' ? 'Cette section arrive bientôt !' : 'هذا القسم سيتوفر قريباً!'}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Onboarding / Welcome Popup */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 35%, transparent)' }}
          >
            <motion.div 
              initial={{ scale: 0.88, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="glass-card p-12 max-w-md text-center space-y-7 relative overflow-hidden"
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary), var(--brand-primary))' }} />
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, var(--brand-secondary), transparent)' }} />
              
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-2xl relative" style={{ background: 'var(--brand-primary)' }}>
                  <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
                  <span className="text-4xl text-white" style={{ fontFamily: 'Amiri, serif', fontWeight: 700 }}>م</span>
                </div>
                {/* Pulsing ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-28 h-28 rounded-2xl opacity-20" style={{ border: '1px solid var(--brand-primary)', animation: 'pulse-ring 2.5s ease-in-out infinite' }} />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>Mishkat</h2>
                <p className="text-lg mt-1" style={{ color: 'var(--brand-secondary)', fontFamily: 'Amiri, serif' }}>مِشْكَاة · تَطْبِيقُ الحِفْظِ</p>
              </div>
              
              <p className="text-sm leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' 
                  ? "Bienvenue dans votre compagnon de mémorisation. Suivez vos progrès, coloriez vos réussites et écrivez vos notes dans votre Diftar numérique."
                  : "مرحباً بك في رفيقك في الحفظ. تتبع تقدمك، لون إنجازاتك، واكتب ملاحظاتك في دفترك الرقمي."}
              </p>
              
              <button 
                onClick={() => setShowOnboarding(false)}
                className="premium-button w-full text-lg"
              >
                {lang === 'fr' ? "Commencer l'aventure ✦" : "ابدأ الرحلة ✦"}
              </button>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>Par Rahima & hamda_wa_chakra</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
