import React, { useState, useEffect, useCallback } from 'react';
import { ThemeContext, THEMES, Theme } from './lib/theme';
import { AppSidebar, LanternMark } from './components/ui';
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
import { AdminSection } from './components/Admin';
import localforage from 'localforage';
import { UserData, Badge, generateAllSurahs, checkLoginStreak } from './types';
import { checkAndUnlockBadges, celebrateBadgeUnlock } from './lib/badgeEngine';
import { supabase, loadUserData, saveUserData, migrateLocalToSupabase, isAdminEmail } from './lib/supabase';
import { AuthScreen } from './components/Auth';

// Map old theme name → new token key
const mapTheme = (old?: string): string => {
  if (old === 'sakura') return 'sakura';
  if (old === 'azur') return 'azur';
  if (old === 'emerald') return 'emerald';
  return 'gold';
};

export default function App() {
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [lang, setLang]             = useState<'fr' | 'ar'>('fr');
  const [userData, setUserData]     = useState<UserData | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Badge[]>([]);
  const [updateWorker, setUpdateWorker]   = useState<ServiceWorker | null>(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [showAuth,  setShowAuth]    = useState(false);
  const [localOnly, setLocalOnly]   = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const theme: Theme = THEMES[mapTheme(userData?.settings?.theme)] ?? THEMES.gold;

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

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUserId(session.user.id);
        setShowAuth(false);
      } else if (!localOnly) {
        setShowAuth(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUserId(session.user.id);
        setShowAuth(false);
        if (_event === 'SIGNED_IN') {
          try {
            let cloudData = await migrateLocalToSupabase(session.user.id);
            if (!cloudData) cloudData = await loadUserData(session.user.id);
            if (cloudData) {
              if (!cloudData.surahs || !Array.isArray(cloudData.surahs)) cloudData.surahs = generateAllSurahs();
              if (!cloudData.diftarPages) cloudData.diftarPages = [];
              if (!cloudData.goals) cloudData.goals = [];
              if (!cloudData.badges) cloudData.badges = [];
              if (!cloudData.calendar) cloudData.calendar = [];
              if (!cloudData.settings) cloudData.settings = { theme: 'gold', notifications: true, dailyReminder: '20:00', fontSize: 'medium', showArabicNames: true, username: 'Hafiz' };
              if (typeof cloudData.tasbihCount !== 'number') cloudData.tasbihCount = 0;
              if (typeof cloudData.loginStreak !== 'number') cloudData.loginStreak = 1;
              cloudData.settings = { ...cloudData.settings, isAdmin: isAdminEmail(session.user.email) };
              setUserData(cloudData);
              return;
            }
          } catch {}
        }
        setUserData(prev => prev ? {
          ...prev,
          settings: { ...prev.settings, isAdmin: isAdminEmail(session.user.email) },
        } : prev);
      } else if (!localOnly) {
        setSupabaseUserId(null);
        setShowAuth(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [localOnly]);

  // ── Load data ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let parsed: UserData | null = null;

        if (session?.user) {
          parsed = await migrateLocalToSupabase(session.user.id);
          if (!parsed) parsed = await loadUserData(session.user.id);
        }
        if (!parsed) {
          parsed = await localforage.getItem<UserData>('mishkat_user_data');
          if (!parsed) {
            const lsRaw = localStorage.getItem('mishkat_user_data');
            if (lsRaw) { try { parsed = JSON.parse(lsRaw); } catch {} }
          }
        }

        const today = new Date().toISOString().split('T')[0];

        if (parsed) {
          if (!parsed.surahs || !Array.isArray(parsed.surahs)) parsed.surahs = generateAllSurahs();
          if (!parsed.diftarPages || !Array.isArray(parsed.diftarPages)) parsed.diftarPages = [];
          if (!parsed.goals || !Array.isArray(parsed.goals)) parsed.goals = [];
          if (!parsed.badges || !Array.isArray(parsed.badges)) parsed.badges = [];
          if (!parsed.calendar || !Array.isArray(parsed.calendar)) parsed.calendar = [];
          if (!parsed.settings) parsed.settings = { theme: 'gold', notifications: true, dailyReminder: '20:00', fontSize: 'medium', showArabicNames: true, username: 'Hafiz' };
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
          if (!parsed.settings.settingsVersion) {
            parsed.settings.settingsVersion = 1;
          }
          if (session?.user) {
            parsed.settings = { ...parsed.settings, isAdmin: isAdminEmail(session.user.email) };
          }
          setUserData(parsed);
        } else {
          const initial: UserData = {
            surahs: generateAllSurahs(), diftarPages: [],
            goals: [
              { id: '1', text: 'Mémoriser Sourate Al-Mulk', completed: false, month: 3 },
              { id: '2', text: 'Lire 5 pages par jour', completed: true, month: 3 },
            ],
            badges: [], calendar: [], tasbihCount: 0, onboarded: false,
            loginStreak: 1, lastLoginDate: today, tasbihSessionBest: 0,
            settings: { theme: 'gold', notifications: true, dailyReminder: '20:00', fontSize: 'medium', showArabicNames: true, username: 'Hafiz' },
          };
          setUserData(initial);
          setShowOnboarding(true);
        }
      } catch {
        const today = new Date().toISOString().split('T')[0];
        setUserData({
          surahs: generateAllSurahs(), diftarPages: [], goals: [], badges: [],
          calendar: [], tasbihCount: 0, onboarded: true, loginStreak: 1,
          lastLoginDate: today, tasbihSessionBest: 0,
          settings: { theme: 'gold', notifications: true, dailyReminder: '20:00', fontSize: 'medium', showArabicNames: true, username: 'Hafiz' },
        });
      }
    };
    load();
  }, []);

  // ── Save ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (userData) {
      localforage.setItem('mishkat_user_data', userData).catch(() => {});
      if (supabaseUserId) saveUserData(supabaseUserId, userData).catch(() => {});
    }
  }, [userData, supabaseUserId]);

  // ── SW update ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleUpdate = (e: any) => {
      setUpdateWorker(e.detail.waiting);
      setShowUpdatePrompt(true);
    };
    window.addEventListener('mishkatUpdateAvailable', handleUpdate);
    return () => window.removeEventListener('mishkatUpdateAvailable', handleUpdate);
  }, []);

  const applyUpdate = () => {
    if (updateWorker) {
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return; refreshing = true; window.location.reload();
      });
      updateWorker.postMessage({ type: 'SKIP_WAITING' });
    } else window.location.reload();
  };

  // ── Auth screen ──────────────────────────────────────────────────────────
  if (showAuth && !localOnly) {
    return (
      <ThemeContext.Provider value={theme}>
        <AuthScreen lang={lang} onContinueLocal={() => { setLocalOnly(true); setShowAuth(false); }}/>
      </ThemeContext.Provider>
    );
  }

  if (!userData) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#0c0a08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LanternMark size={48} color="#d4a64a"/>
      </div>
    );
  }

  const t = theme;
  const commonProps = { userData, setUserData: updateUserDataWithBadges, lang };

  return (
    <ThemeContext.Provider value={t}>
      {/* SVG colour-blind filters */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="deuteranopia"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/></filter>
          <filter id="protanopia"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/></filter>
          <filter id="tritanopia"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/></filter>
        </defs>
      </svg>

      {/* Full-screen layout */}
      <div style={{ width: '100vw', height: '100vh', background: t.bg, display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif', color: t.ink, position: 'relative' }}>
        {/* Geometric background pattern */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none', zIndex: 0 }}>
          <defs>
            <pattern id="app-pat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect x="20" y="20" width="40" height="40" fill="none" stroke={t.accent} strokeWidth="0.5"/>
              <rect x="20" y="20" width="40" height="40" fill="none" stroke={t.accent} strokeWidth="0.5" transform="rotate(45 40 40)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#app-pat)"/>
        </svg>

        {/* Sidebar — desktop */}
        <div className="hidden md:block" style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <AppSidebar
            active={activeTab}
            onNavigate={setActiveTab}
            streak={userData.loginStreak}
            isAdmin={userData.settings?.isAdmin}
            lang={lang}
          />
        </div>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }} className="no-scrollbar">
          {activeTab === 'dashboard'    && <Dashboard {...commonProps}/>}
          {activeTab === 'diftar'       && <Diftar userData={userData} setUserData={updateUserDataWithBadges} lang={lang}/>}
          {activeTab === 'coloring'     && <ColoringGrid {...commonProps}/>}
          {activeTab === 'goals'        && <GoalsSection {...commonProps}/>}
          {activeTab === 'tasbih'       && <TasbihSection {...commonProps}/>}
          {activeTab === 'memorization' && <MemorizationSection {...commonProps}/>}
          {activeTab === 'calendar'     && <CalendarSection {...commonProps}/>}
          {activeTab === 'badges'       && <BadgesSection userData={userData} lang={lang} newlyUnlocked={newlyUnlocked}/>}
          {activeTab === 'kanban'       && <KanbanSection {...commonProps}/>}
          {activeTab === 'albaqara'     && <AlBaqaraSection {...commonProps}/>}
          {activeTab === 'settings'     && <SettingsSection userData={userData} setUserData={updateUserDataWithBadges} lang={lang}/>}
          {activeTab === 'admin'        && userData.settings?.isAdmin && <AdminSection userData={userData} lang={lang}/>}
        </main>

        {/* Mobile bottom nav */}
        <div className="md:hidden" style={{ position: 'relative', zIndex: 1 }}>
          <AppSidebar active={activeTab} onNavigate={setActiveTab} streak={userData.loginStreak} isAdmin={userData.settings?.isAdmin} lang={lang}/>
        </div>
      </div>

      {/* Onboarding modal */}
      {showOnboarding && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 16, padding: '48px 40px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
            <LanternMark size={64} color={t.accent}/>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, color: t.ink, margin: '20px 0 8px', letterSpacing: '-0.02em' }}>Mishkat</h2>
            <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 20, color: t.accentBright, marginBottom: 16 }}>مِشْكَاة</div>
            <p style={{ fontSize: 13, color: t.inkDim, lineHeight: 1.7, marginBottom: 28 }}>
              {lang === 'fr'
                ? 'Bienvenue dans votre compagnon de mémorisation. Suivez vos progrès et écrivez vos notes.'
                : 'مرحباً بك في رفيقك في الحفظ.'}
            </p>
            <button
              onClick={() => setShowOnboarding(false)}
              style={{ width: '100%', padding: '13px', borderRadius: 10, background: t.accent, color: '#1a0f00', fontFamily: 'Inter', fontWeight: 600, fontSize: 14 }}
            >
              {lang === 'fr' ? 'Commencer' : 'ابدأ'}
            </button>
            <div style={{ marginTop: 16, fontSize: 10, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              Artisans du Savoir · Rahima & hamda_wa_chakra
            </div>
          </div>
        </div>
      )}

      {/* Update prompt */}
      {showUpdatePrompt && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 110, width: 'calc(100% - 48px)', maxWidth: 360 }}>
          <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: t.accent, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
                {lang === 'fr' ? 'Mise à jour disponible' : 'تحديث متاح'}
              </div>
              <div style={{ fontSize: 11, color: t.inkDim, marginTop: 2 }}>
                {lang === 'fr' ? 'Nouvelle version de Mishkat !' : 'إصدار جديد من مشكاة!'}
              </div>
            </div>
            <button onClick={applyUpdate} style={{ padding: '8px 14px', borderRadius: 8, background: t.accent, color: '#1a0f00', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
              {lang === 'fr' ? 'Actualiser' : 'تحديث'}
            </button>
          </div>
        </div>
      )}
    </ThemeContext.Provider>
  );
}
