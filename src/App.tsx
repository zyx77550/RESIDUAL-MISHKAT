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
  Plus,
  Save,
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

const Sidebar = ({ activeTab, setActiveTab, lang, setLang }: any) => {
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
    <div className={cn(
      "fixed bottom-0 left-0 right-0 md:relative md:w-72 bg-surface/40 backdrop-blur-2xl border-t md:border-t-0 md:border-r border-primary/5 p-3 md:p-6 flex md:flex-col overflow-x-auto md:overflow-x-visible no-scrollbar justify-start md:justify-start gap-2 md:gap-4 z-50",
      lang === 'ar' ? "md:order-last" : ""
    )}>
      <div className="hidden md:block mb-12 text-center shrink-0">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl text-gradient"
        >
          Mishkat
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs uppercase tracking-[0.3em] text-secondary/60 font-bold mt-1"
        >
          مِشْكَاة
        </motion.p>
      </div>
      
      <div className="flex md:flex-col gap-2 flex-1">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-4 rounded-2xl transition-all shrink-0 min-w-[80px] md:min-w-0 group relative",
              activeTab === item.id ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105 md:scale-100" : "text-text-muted hover:bg-primary/5 hover:text-primary"
            )}
          >
            <item.icon size={20} className={cn("transition-transform duration-500 group-hover:scale-110", activeTab === item.id ? "text-white" : "text-secondary/60")} />
            <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider md:tracking-normal md:capitalize">{item.label}</span>
            {activeTab === item.id && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute inset-0 bg-primary rounded-2xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="hidden md:flex mt-auto flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-5 bg-primary/5 rounded-[2rem] text-[10px] text-text-muted space-y-3 border border-primary/5"
        >
          <p className="font-black uppercase tracking-tighter">Artisans du Savoir</p>
          <p className="font-medium">Rahima & hamda_wa_chakra</p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/hamda_wa_chakra" target="_blank" className="hover:text-secondary transition-colors font-bold">IG</a>
            <a href="https://www.tiktok.com/@hamda_wa_chakra" target="_blank" className="hover:text-secondary transition-colors font-bold">TK</a>
          </div>
        </motion.div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-4 p-4 rounded-2xl text-text-main/60 hover:bg-primary/5 transition-colors group"
          >
            <Languages size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">{lang === 'fr' ? 'العربية' : 'Français'}</span>
          </button>
          <button 
            onClick={() => {
              if (confirm(lang === 'fr' ? 'Voulez-vous vraiment tout réinitialiser ?' : 'هل تريد حقاً إعادة ضبط كل شيء؟')) {
                localStorage.removeItem('mishkat_user_data');
                window.location.reload();
              }
            }}
            className="flex items-center gap-4 p-4 rounded-2xl text-red-500/40 hover:bg-red-500/5 transition-colors group"
          >
            <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">{lang === 'fr' ? 'Réinitialiser' : 'إعادة ضبط'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sections ---

const Dashboard = ({ userData, lang }: { userData: UserData, lang: string }) => {
  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const progress = (memorizedCount / 114) * 100;
  const username = userData.settings?.username || 'Hafiz';

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-5xl text-primary leading-tight">
            {lang === 'fr' ? `Paix sur toi, ${username}` : `السلام عليك يا ${username}`}
          </h2>
          <p className="text-secondary font-bold tracking-[0.4em] uppercase text-xs mt-2 opacity-60">تَطْبِيقُ الحِفْظِ المِثَالِي</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-right hidden sm:block"
        >
          <p className="text-[10px] uppercase tracking-widest text-text-muted font-black">Curateurs de Lumière</p>
          <p className="text-sm text-secondary">Rahima & Hamda</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%" cy="50%" r="42%"
                stroke="currentColor" strokeWidth="8"
                fill="transparent"
                className="text-primary/5"
              />
              <motion.circle
                cx="50%" cy="50%" r="42%"
                stroke="currentColor" strokeWidth="8"
                fill="transparent"
                strokeDasharray="100 100"
                pathLength="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-primary"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl text-primary">{Math.round(progress)}%</span>
              <span className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black mt-1">{lang === 'fr' ? 'Accompli' : 'تم الإنجاز'}</span>
            </div>
          </div>
          <h3 className="mt-8 text-2xl text-primary">{lang === 'fr' ? 'Votre Voyage' : 'رحلتك'}</h3>
          <p className="text-xs text-text-muted mt-2 max-w-[200px] leading-relaxed">
            {lang === 'fr' ? 'Chaque verset est une lumière sur votre chemin.' : 'كل آية هي نور في طريقك.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 col-span-1 lg:col-span-2">
          {[
            { label: lang === 'fr' ? 'Sourates' : 'السور', value: memorizedCount, icon: BookOpen, color: 'from-accent/20 to-transparent' },
            { label: lang === 'fr' ? 'Objectifs' : 'الأهداف', value: userData.goals.filter(g => g.completed).length, icon: Target, color: 'from-pastel-green/20 to-transparent' },
            { label: lang === 'fr' ? 'Badges' : 'الأوسمة', value: userData.badges.length, icon: Award, color: 'from-secondary/10 to-transparent' },
            { label: lang === 'fr' ? 'Jours' : 'الأيام', value: userData.calendar.length, icon: CalendarIcon, color: 'from-primary/5 to-transparent' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn("glass-card p-8 flex flex-col justify-between group overflow-hidden relative")}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", stat.color)} />
              <stat.icon className="text-primary/20 group-hover:text-secondary/40 transition-colors duration-500 relative z-10" size={32} />
              <div className="relative z-10">
                <p className="text-4xl text-primary">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Target size={200} />
        </div>
        <h3 className="text-2xl text-primary mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Target size={20} className="text-secondary" />
          </div>
          {lang === 'fr' ? 'Intentions du mois' : 'نوايا الشهر'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userData.goals.slice(0, 3).map((goal, idx) => (
            <motion.div 
              key={goal.id}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-5 bg-secondary/5 rounded-[1.5rem] border border-primary/5 group transition-all"
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                goal.completed ? "bg-pastel-green text-white" : "bg-surface border border-primary/10 text-text-muted"
              )}>
                {goal.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              </div>
              <span className={cn("text-sm font-medium transition-all", goal.completed ? "line-through text-text-muted" : "text-text-main/70 group-hover:text-text-main")}>
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
  const [paperStyle, setPaperStyle] = useState<'blank' | 'lines' | 'grid' | 'dots'>('lines');
  const [canvasScale, setCanvasScale] = useState(1);
  const isDrawingRef = useRef(false);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const stickerCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [activeStickerSvg, setActiveStickerSvg] = useState<string | null>(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

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
  }, [currentStrokes, stickers, lang]);

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
    setUserData((prev: UserData) => ({
      ...prev,
      diftarPages: prev.diftarPages.map(p => 
        p.id === activePageId ? { ...p, strokes: currentStrokes, stickers, lastSaved: Date.now() } : p
      )
    }));
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
        <div className="flex-1 flex flex-col gap-4 relative">
          <div className="flex justify-between items-center bg-surface/95 backdrop-blur-sm p-3 rounded-2xl shadow-sm z-10 border border-primary/5">
            <button onClick={() => { savePage(); setActivePageId(null); }} className="p-2 hover:bg-primary/5 rounded-lg transition-colors">
              <ChevronLeft />
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
              className="font-serif italic text-xl text-primary bg-transparent border-none focus:ring-0 text-center flex-1"
            />
            <div className="flex gap-2">
              <div className="flex gap-1">
                <button onClick={undo} className="p-2 hover:bg-primary/5 rounded-lg transition-colors" title="Undo"><Undo size={18}/></button>
                <button onClick={redo} className="p-2 hover:bg-primary/5 rounded-lg transition-colors" title="Redo"><Redo size={18}/></button>
              </div>
              <div className="w-px h-6 bg-primary/10 mx-1" />
              <button onClick={exportPDF} className="p-2 hover:bg-primary/5 rounded-lg transition-colors" title="PDF"><Download size={18}/></button>
              <button onClick={savePage} className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 px-3">
                <Save size={16}/>
                <span className="text-xs font-bold">{lang === 'fr' ? 'Sauver' : 'حفظ'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-primary/10 group cursor-none transition-all duration-700">
            {/* Notebook Binding Effect */}
            <div className={cn(
              "absolute top-0 bottom-0 w-12 bg-gradient-to-r from-black/10 via-transparent to-transparent z-20 pointer-events-none",
              lang === 'ar' ? "right-0 rotate-180" : "left-0"
            )}>
              <div className="h-full w-full flex flex-col justify-around py-8 px-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-full h-2 bg-black/5 rounded-full shadow-inner" />
                ))}
              </div>
            </div>

            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            
            <canvas
              ref={canvasRef}
              width={1000}
              height={1400}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full touch-none"
            />
            
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

            {/* Immersive Dock (Variante 1) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6 w-full max-w-2xl px-6">
              {/* Sub-panels (Stickers, Tools, Customization) */}
              <AnimatePresence>
                {showStickerPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="bg-surface/90 backdrop-blur-3xl p-4 rounded-[2rem] shadow-2xl border border-white/40 w-[95vw] max-w-lg grid grid-cols-6 sm:grid-cols-8 gap-3 max-h-[250px] overflow-y-auto scrollbar-hide"
                  >
                    {QURAN_ICONS.map(icon => (
                      <button 
                        key={icon.id} 
                        onClick={() => { setActiveStickerSvg(icon.svg); setShowStickerPicker(false); }}
                        className="aspect-square hover:scale-110 transition-all duration-300 hover:rotate-6 flex items-center justify-center p-1.5 bg-primary/5 rounded-xl border border-transparent hover:border-secondary/30"
                        dangerouslySetInnerHTML={{ __html: icon.svg }}
                      />
                    ))}
                  </motion.div>
                )}

                {showToolsMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="bg-surface/90 backdrop-blur-3xl p-4 rounded-[2.5rem] shadow-2xl border border-white/40 w-[95vw] max-w-md flex justify-around items-center gap-2"
                  >
                    {[
                      { id: 'pen', icon: NotebookPen, label: lang === 'fr' ? 'Stylo' : 'قلم' },
                      { id: 'fountain-pen', icon: Pencil, label: lang === 'fr' ? 'Plume' : 'ريشة' },
                      { id: 'highlighter', icon: Highlighter, label: lang === 'fr' ? 'Surligneur' : 'قلم تحديد' },
                      { id: 'chalk', icon: Wind, label: lang === 'fr' ? 'Craie' : 'طبشور' },
                      { id: 'ruler', icon: Ruler, label: lang === 'fr' ? 'Règle' : 'مسطرة' },
                      { id: 'eraser', icon: Eraser, label: lang === 'fr' ? 'Gomme' : 'ممحاة' }
                    ].map((t, idx) => (
                      <motion.button
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => { setTool(t.id as any); setShowToolsMenu(false); }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all flex-1 min-w-[60px] group",
                          tool === t.id ? "bg-primary text-white shadow-xl scale-110" : "hover:bg-primary/5 text-text-muted hover:text-primary"
                        )}
                      >
                        <t.icon size={20} className={cn("transition-transform duration-500", tool === t.id ? "scale-110" : "group-hover:scale-110 group-hover:rotate-12")} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}

                {showCustomizationMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="bg-surface/90 backdrop-blur-3xl p-5 rounded-[2.5rem] shadow-2xl border border-white/40 w-[95vw] max-w-lg space-y-5 max-h-[60vh] overflow-y-auto scrollbar-hide"
                  >
                    {/* Colors */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] uppercase tracking-[0.2em] font-black text-text-muted px-1">{lang === 'fr' ? 'Couleurs' : 'الألوان'}</h4>
                      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
                        {PALETTE.map(c => (
                          <button 
                            key={c} 
                            onClick={() => setColor(c)} 
                            className={cn(
                              "w-6 h-6 rounded-full border border-white/40 transition-all hover:scale-125 shadow-sm",
                              color === c && "ring-2 ring-secondary ring-offset-2 scale-110 shadow-lg"
                            )}
                            style={{ 
                              background: c.startsWith('gradient:') ? 
                                (c === 'gradient:gold-red' ? 'linear-gradient(to bottom right, #D4AF37, #8B2635)' :
                                 c === 'gradient:blue-cyan' ? 'linear-gradient(to bottom right, #1D3557, #A8DADC)' :
                                 'linear-gradient(to bottom right, #6D597A, #FF99C8)') : 
                              c.startsWith('pattern:') ?
                                (c === 'pattern:dots' ? 'radial-gradient(#8B2635 2px, transparent 2px) 0 0 / 10px 10px' :
                                 'repeating-linear-gradient(45deg, #D4AF37, #D4AF37 2px, transparent 2px, transparent 10px)') :
                              c 
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Width */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] uppercase tracking-[0.2em] font-black text-bordeaux/30 px-1">{lang === 'fr' ? 'Épaisseur' : 'السمك'}</h4>
                      <div className="flex items-center gap-3 px-1">
                        <input 
                          type="range" min="1" max="25" value={width} 
                          onChange={(e) => setWidth(parseInt(e.target.value))}
                          className="flex-1 accent-bordeaux h-1 bg-beige rounded-full appearance-none cursor-pointer"
                        />
                        <span className="text-[10px] font-mono w-5 text-bordeaux/60 text-right">{width}</span>
                      </div>
                    </div>

                    {/* Paper Style */}
                    <div className="space-y-2">
                      <h4 className="text-[9px] uppercase tracking-[0.2em] font-black text-bordeaux/30 px-1">{lang === 'fr' ? 'Papier' : 'الورق'}</h4>
                      <div className="flex justify-around items-center gap-1.5">
                        {(['blank', 'lines', 'grid', 'dots'] as const).map(style => (
                          <button
                            key={style}
                            onClick={() => setPaperStyle(style)}
                            className={cn(
                              "flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all flex-1",
                              paperStyle === style ? "bg-bordeaux text-white shadow-md scale-105" : "hover:bg-beige text-bordeaux/60"
                            )}
                          >
                            <div className="w-7 h-7 rounded border border-current/20 flex items-center justify-center overflow-hidden mb-0.5">
                              {style === 'lines' && <div className="w-full h-full flex flex-col gap-0.5 p-1 opacity-40"><div className="h-px bg-current w-full"/><div className="h-px bg-current w-full"/><div className="h-px bg-current w-full"/></div>}
                              {style === 'grid' && <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5 p-1 opacity-40"><div className="border border-current"/><div className="border border-current"/><div className="border border-current"/><div className="border border-current"/></div>}
                              {style === 'dots' && <div className="w-full h-full grid grid-cols-2 grid-rows-2 p-1 opacity-40"><div className="w-0.5 h-0.5 bg-current rounded-full"/><div className="w-0.5 h-0.5 bg-current rounded-full"/><div className="w-0.5 h-0.5 bg-current rounded-full"/><div className="w-0.5 h-0.5 bg-current rounded-full"/></div>}
                              {style === 'blank' && <div className="w-full h-full bg-current/5"/>}
                            </div>
                            <span className="text-[7px] font-bold uppercase tracking-tighter">{style}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Dock */}
              <motion.div 
                layout
                className="bg-bordeaux/95 backdrop-blur-3xl p-2 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl border border-white/10 flex items-center justify-center gap-2 sm:gap-4"
              >
                <div className="flex items-center gap-1 sm:gap-2 px-2">
                  {/* Tools Menu Trigger */}
                  <button 
                    onClick={() => { setShowToolsMenu(!showToolsMenu); setShowCustomizationMenu(false); setShowStickerPicker(false); }} 
                    className={cn(
                      "p-3 sm:p-4 rounded-full transition-all duration-300 relative group", 
                      showToolsMenu ? "bg-white text-bordeaux shadow-xl scale-110" : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                    title={lang === 'fr' ? 'Outils' : 'أدوات'}
                  >
                    <Brush size={20} className="sm:w-6 sm:h-6"/>
                    {showToolsMenu && <motion.div layoutId="activeTool" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-bordeaux rounded-full" />}
                  </button>

                  {/* Customization Menu Trigger */}
                  <button 
                    onClick={() => { setShowCustomizationMenu(!showCustomizationMenu); setShowToolsMenu(false); setShowStickerPicker(false); }} 
                    className={cn(
                      "p-3 sm:p-4 rounded-full transition-all duration-300 relative group", 
                      showCustomizationMenu ? "bg-white text-bordeaux shadow-xl scale-110" : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                    title={lang === 'fr' ? 'Personnalisation' : 'تخصيص'}
                  >
                    <Palette size={20} className="sm:w-6 sm:h-6"/>
                    {showCustomizationMenu && <motion.div layoutId="activeTool" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-bordeaux rounded-full" />}
                  </button>

                  {/* Stickers Trigger */}
                  <button 
                    onClick={() => { setShowStickerPicker(!showStickerPicker); setShowToolsMenu(false); setShowCustomizationMenu(false); }} 
                    className={cn(
                      "p-3 sm:p-4 rounded-full transition-all duration-300 relative group", 
                      showStickerPicker ? "bg-white text-bordeaux shadow-xl scale-110" : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                    title={lang === 'fr' ? 'Stickers' : 'ملصقات'}
                  >
                    <Star size={20} className="sm:w-6 sm:h-6"/>
                    {showStickerPicker && <motion.div layoutId="activeTool" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-bordeaux rounded-full" />}
                  </button>
                </div>

                <div className="w-px h-8 sm:h-10 bg-white/10" />

                <div className="px-2">
                  <button 
                    onClick={clearCanvas} 
                    className="p-3 sm:p-4 rounded-full text-white/40 hover:bg-red-500 hover:text-white transition-all duration-300 group"
                    title={lang === 'fr' ? 'Effacer la page' : 'مسح الصفحة'}
                  >
                    <Trash2 size={20} className="sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </motion.div>
            </div>
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
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px] floating-element" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px] floating-element" style={{ animationDelay: '-2s' }} />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[150px] floating-element" style={{ animationDelay: '-4s' }} />
      </div>

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} setLang={setLang} />

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
            className="fixed inset-0 bg-bordeaux/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card p-10 max-w-lg text-center space-y-6"
            >
              <div className="w-24 h-24 bg-bordeaux rounded-full flex items-center justify-center mx-auto shadow-xl">
                <span className="text-4xl text-white font-bold">م</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-bordeaux">Mishkat (مِشْكَاة)</h2>
                <p className="text-gold text-lg">تَطْبِيقُ الحِفْظِ</p>
              </div>
              <p className="text-bordeaux/70">
                {lang === 'fr' 
                  ? "Bienvenue dans votre compagnon de mémorisation. Suivez vos progrès, coloriez vos réussites et écrivez vos notes dans votre Diftar numérique."
                  : "مرحباً بك في رفيقك في الحفظ. تتبع تقدمك، لون إنجازاتك، واكتب ملاحظاتك في دفترك الرقمي."}
              </p>
              <button 
                onClick={() => setShowOnboarding(false)}
                className="w-full bg-bordeaux text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-bordeaux/90 transition-colors"
              >
                {lang === 'fr' ? "Commencer l'aventure" : "ابدأ الرحلة"}
              </button>
              <p className="text-[10px] text-bordeaux/40">Par Rahima & hamda_wa_chakra</p>
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
