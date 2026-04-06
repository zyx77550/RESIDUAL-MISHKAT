import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Surah, DiftarPage, UserData, Badge, generateAllSurahs, Stroke, Shape, checkLoginStreak } from './types';
import confetti from 'canvas-confetti';
import { checkAndUnlockBadges, celebrateBadgeUnlock } from './lib/badgeEngine';

// ═══════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════

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
  const [updateWorker, setUpdateWorker]     = useState<ServiceWorker | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [pendingUpdateUsername, setPendingUpdateUsername] = useState('');

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
    try {
      const saved = localStorage.getItem('mishkat_user_data');
      const today = new Date().toISOString().split('T')[0];

      if (saved) {
        let parsed: UserData;
        try {
          parsed = JSON.parse(saved);
        } catch (parseError) {
          console.error('Failed to parse user data from localStorage, creating fresh data:', parseError);
          // If localStorage is corrupted, create new data
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
          return;
        }

        // Ensure all required fields exist
        if (!parsed.surahs || !Array.isArray(parsed.surahs)) parsed.surahs = generateAllSurahs();
        if (!parsed.diftarPages || !Array.isArray(parsed.diftarPages)) parsed.diftarPages = [];
        if (!parsed.goals || !Array.isArray(parsed.goals)) parsed.goals = [];
        if (!parsed.badges || !Array.isArray(parsed.badges)) parsed.badges = [];
        if (!parsed.calendar || !Array.isArray(parsed.calendar)) parsed.calendar = [];
        if (!parsed.settings) parsed.settings = { theme: 'light', notifications: true, dailyReminder: '20:00', fontSize: 'medium', showArabicNames: true, username: 'Hafiz' };

        // Validate critical fields
        if (typeof parsed.tasbihCount !== 'number') parsed.tasbihCount = 0;
        if (typeof parsed.loginStreak !== 'number') parsed.loginStreak = 1;
        if (typeof parsed.tasbihSessionBest !== 'number') parsed.tasbihSessionBest = 0;
        if (typeof parsed.onboarded !== 'boolean') parsed.onboarded = false;

        // Migrate surahs to add real names if they're missing
        if (parsed.surahs && parsed.surahs[0]?.name === 'Surah 1') {
          const freshSurahs = generateAllSurahs();
          parsed.surahs = freshSurahs.map((fresh: any, i: number) => ({
            ...fresh,
            status: parsed.surahs[i]?.status || 'not_started',
            color: parsed.surahs[i]?.color,
          }));
        }

        // Update login streak via the canonical helper
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
      // Emergency fallback
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

  useEffect(() => {
    const handleUpdateAvailable = (event: any) => {
      const worker = event.detail?.waiting || event.detail?.installing || null;
      if (!worker) return;
      setUpdateWorker(worker);
      setPendingUpdateUsername(userData?.settings?.username || '');
      setShowUpdatePrompt(true);
    };

    window.addEventListener('mishkatUpdateAvailable', handleUpdateAvailable);
    return () => window.removeEventListener('mishkatUpdateAvailable', handleUpdateAvailable);
  }, [userData]);

  const applyUpdate = () => {
    const trimmedUsername = pendingUpdateUsername.trim();
    if (!trimmedUsername) {
      alert(lang === 'fr' ? 'Veuillez saisir votre nom avant de mettre à jour.' : 'يرجى إدخال اسمك قبل التحديث.');
      return;
    }
    if (userData) {
      setUserData({ ...userData, settings: { ...userData.settings, username: trimmedUsername } });
    }
    if (updateWorker) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
      updateWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdatePrompt(false);
  };

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
          {!userData ? (
            // Loading state
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 rounded-full border-4 mx-auto"
                  style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }}
                />
                <p style={{ color: 'var(--brand-text-muted)' }}>Chargement...</p>
              </div>
            </div>
          ) : (
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
          )}
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