import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Diftar } from './components/Diftar';
import { ColoringGrid } from './components/ColoringGrid';
import { GoalsSection } from './components/Goals';
import { TasbihSection } from './components/Tasbih';
import { MemorizationSection } from './components/Memorization';
import { CalendarSection } from './components/Calendar';
import { BadgesSection } from './components/Badges';
import { KanbanSection } from './components/Kanban';
import { SettingsSection } from './components/Settings';
import { AlBaqaraSection } from './components/AlBaqara';
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
import localforage from 'localforage';
import { cn } from './lib/utils';
import { Surah, DiftarPage, UserData, Badge, generateAllSurahs, Stroke, Shape, checkLoginStreak } from './types';
import confetti from 'canvas-confetti';
import { checkAndUnlockBadges, celebrateBadgeUnlock } from './lib/badgeEngine';

const Fireflies = memo(function Fireflies() {
  const flies = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: `${(i * 7.14) % 100}vw`,
      w: `${3 + (i % 2)}px`,
      dur: `${14 + (i * 1.5) % 10}s, ${2 + (i * 0.4) % 2}s`,
      del: `${(i * 0.71) % 10}s`,
    })), []);
  return (
    <div className="fireflies-container" aria-hidden="true">
      {flies.map(f => (
        <div key={f.id} className="firefly"
          style={{ left: f.left, width: f.w, height: f.w, animationDuration: f.dur, animationDelay: f.del }} />
      ))}
    </div>
  );
});

export default function App() {
  const [activeTab, setActiveTab]           = useState('dashboard');
  const [lang, setLang]                     = useState<'fr' | 'ar'>('fr');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData]             = useState<UserData | null>(null);
  const [newlyUnlocked, setNewlyUnlocked]   = useState<Badge[]>([]);
  const [updateWorker, setUpdateWorker]     = useState<ServiceWorker | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

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
    const load = async () => {
    try {
      // Try localforage first (IndexedDB), fallback to localStorage for migration
      let parsed: UserData | null = await localforage.getItem<UserData>('mishkat_user_data');
      if (!parsed) {
        const lsRaw = localStorage.getItem('mishkat_user_data');
        if (lsRaw) {
          try { parsed = JSON.parse(lsRaw); } catch {}
        }
      }
      const today = new Date().toISOString().split('T')[0];

      if (parsed) {
        if (!parsed.surahs || !Array.isArray(parsed.surahs)) parsed.surahs = generateAllSurahs();
        if (!parsed.diftarPages || !Array.isArray(parsed.diftarPages)) parsed.diftarPages = [];
        if (!parsed.goals || !Array.isArray(parsed.goals)) parsed.goals = [];
        if (!parsed.badges || !Array.isArray(parsed.badges)) parsed.badges = [];
        if (!parsed.calendar || !Array.isArray(parsed.calendar)) parsed.calendar = [];
        if (!parsed.settings) parsed.settings = { theme: 'light', notifications: true, dailyReminder: '20:00', fontSize: 'medium', showArabicNames: true, username: 'Hafiz' };

        if (typeof parsed.tasbihCount !== 'number') parsed.tasbihCount = 0;
        if (typeof parsed.loginStreak !== 'number') parsed.loginStreak = 1;
        if (typeof parsed.tasbihSessionBest !== 'number') parsed.tasbihSessionBest = 0;
        if (typeof parsed.onboarded !== 'boolean') parsed.onboarded = false;

        if (parsed.surahs && parsed.surahs[0]?.name === 'Surah 1') {
          const freshSurahs = generateAllSurahs();
          parsed.surahs = freshSurahs.map((fresh: any, i: number) => ({
            ...fresh,
            status: parsed!.surahs[i]?.status || 'not_started',
            color: parsed!.surahs[i]?.color,
          }));
        }

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
    } catch (error) {
      console.error('Fatal error loading user data:', error);
      const today = new Date().toISOString().split('T')[0];
      const initial: UserData = {
        surahs: generateAllSurahs(),
        diftarPages: [],
        goals: [],
        badges: [], calendar: [], tasbihCount: 0, onboarded: true,
        loginStreak: 1,
        lastLoginDate: today,
        tasbihSessionBest: 0,
        settings: { theme: 'light', notifications: true, dailyReminder: '20:00', fontSize: 'medium', showArabicNames: true, username: 'Hafiz' },
      };
      setUserData(initial);
    }
    };
    load();
  }, []);

  // ─── CRITICAL: save userData to localforage (IndexedDB) whenever it changes ───
  useEffect(() => {
    if (userData) {
      localforage.setItem('mishkat_user_data', userData).catch(err => {
        console.error('Mishkat: failed to save data', err);
      });
    }
  }, [userData]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setUpdateWorker(e.detail.waiting);
      setShowUpdatePrompt(true);
    };
    window.addEventListener('mishkatUpdateAvailable', handleUpdate);
    return () => window.removeEventListener('mishkatUpdateAvailable', handleUpdate);
  }, []);

  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (userData?.settings?.reduceAnimations || userData?.settings?.staticBackground || isMobileView) return;
    const handleMouseMove = (e: MouseEvent) => {
      document.querySelectorAll<HTMLElement>('.glass-card').forEach(card => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - r.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - r.top}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [userData?.settings?.reduceAnimations, userData?.settings?.staticBackground, isMobileView]);

  const applyUpdate = () => {
    if (updateWorker) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
      updateWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  if (!userData) return null;

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500',
        userData.settings?.theme === 'dark' ? 'dark'
          : userData.settings?.theme === 'sepia' ? 'sepia'
          : userData.settings?.theme === 'emerald' ? 'emerald'
          : userData.settings?.theme === 'azur' ? 'azur'
          : userData.settings?.theme === 'safran' ? 'safran'
          : userData.settings?.theme === 'lilas' ? 'lilas'
          : userData.settings?.theme === 'ocean' ? 'ocean'
          : '',
        userData.settings?.fontSize === 'small' ? 'text-xs' : userData.settings?.fontSize === 'large' ? 'text-lg' : 'text-base',
        lang === 'ar' ? 'rtl' : 'ltr'
      )}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[12%] w-[60%] h-[60%] rounded-full floating-element" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-secondary) 24%, transparent), transparent 70%)', filter: 'blur(120px)', animationDelay: '0s' }} />
        <div className="absolute top-[25%] -right-[10%] w-[45%] h-[45%] rounded-full floating-element" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-primary) 18%, transparent), transparent 70%)', filter: 'blur(100px)', animationDelay: '-3s' }} />
        <div className="absolute -bottom-[20%] left-[10%] w-[65%] h-[65%] rounded-full floating-element" style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--brand-accent) 20%, transparent), transparent 70%)', filter: 'blur(140px)', animationDelay: '-6s' }} />
        <div className="absolute inset-0 geometric-pattern opacity-40" style={{ color: 'var(--brand-primary)' }} />
      </div>

      {/* Fireflies */}
      {!userData?.settings?.reduceAnimations && !userData?.settings?.staticBackground && <Fireflies />}

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} setLang={setLang} isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} loginStreak={userData.loginStreak} theme={userData.settings?.theme} />

      <main
        className={cn('flex-1 relative z-10 transition-[margin] duration-500',
          activeTab === 'diftar' ? 'overflow-hidden p-1 md:p-2' : 'overflow-y-auto p-4 md:p-8 pb-[120px] md:pb-8',
          lang === 'ar' ? 'text-right' : 'text-left'
        )}
        style={!isMobileView ? (lang === 'ar'
          ? { marginRight: isSidebarCollapsed ? 'calc(78px + 3rem)' : 'calc(280px + 3rem)' }
          : { marginLeft:  isSidebarCollapsed ? 'calc(78px + 3rem)' : 'calc(280px + 3rem)' }
        ) : undefined}
      >
        <div className={cn('h-full', activeTab !== 'diftar' && 'max-w-7xl mx-auto')}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
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
                {activeTab === 'albaqara'     && <AlBaqaraSection userData={userData} setUserData={updateUserDataWithBadges} lang={lang} />}
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
                {lang === 'fr' ? 'Bienvenue dans votre compagnon de mémorisation. Suivez vos progrès, coloriez vos réussites et écrivez vos notes dans votre Diftar numérique.' : 'مرحباً بك في رفيقك في الحفظ. تتبع تقدمك، لون إنجaserاتك، واكتب ملاحظاتك في دفترك الرقمي.'}
              </p>
              <button onClick={() => setShowOnboarding(false)} className="premium-button w-full text-lg">
                {lang === 'fr' ? "Commencer l'aventure ✦" : 'ابدأ الرحلة ✦'}
              </button>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>Par Rahima & hamda_wa_chakra</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] w-[calc(100%-3rem)] max-w-sm"
          >
            <div className="glass-card p-4 flex items-center justify-between gap-4 shadow-2xl border-white/20 bg-white/5 backdrop-blur-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#8B2635] text-white shadow-lg">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#8B2635]">Mise à jour</p>
                  <p className="text-[10px] text-muted-foreground">{lang === 'fr' ? 'Nouvelle version disponible !' : 'إصدار جديد متاح !'}</p>
                </div>
              </div>
              <button 
                onClick={applyUpdate}
                className="px-4 py-2 rounded-xl bg-[#8B2635] text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                {lang === 'fr' ? 'Actualiser' : 'تحديث'}
              </button>
            </div>
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