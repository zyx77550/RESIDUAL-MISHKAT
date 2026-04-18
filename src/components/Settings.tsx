import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Bell, Clock, Type, Palette, Languages,
  Trash2, Check, Moon, Sun, Coffee, ChevronRight, Flame, Download, Upload,
  Info, Eye, Zap, BookOpen, Volume2, ZoomIn, RefreshCw, Globe, Accessibility,
  Leaf, Waves, Star, Droplets
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserData, UserSettings } from '../types';

export const SettingsSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const settings = userData.settings;
  const [saved, setSaved] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setUserData((prev: UserData) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const exportData = () => {
    const json = JSON.stringify(userData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mishkat-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.surahs && parsed.settings) {
          setUserData(parsed);
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }
      } catch {}
    };
    reader.readAsText(file);
  };

  const themes = [
    { id: 'light',   icon: Sun,      labelFr: 'Clair',     labelAr: 'فاتح',    bg: '#F5F0E8', accent: '#8B2635' },
    { id: 'dark',    icon: Moon,     labelFr: 'Sombre',    labelAr: 'داكن',    bg: '#0C0806', accent: '#F4845F' },
    { id: 'sepia',   icon: Coffee,   labelFr: 'Sépia',     labelAr: 'سيبيا',   bg: '#F0E8CC', accent: '#6B4226' },
    { id: 'emerald', icon: Leaf,     labelFr: 'Émeraude',  labelAr: 'زمردي',   bg: '#E8F5E9', accent: '#2E7D32' },
    { id: 'azur',    icon: Waves,    labelFr: 'Azur',      labelAr: 'أزرق',    bg: '#E3F2FD', accent: '#1565C0' },
    { id: 'safran',  icon: Star,     labelFr: 'Safran',    labelAr: 'زعفران',  bg: '#FFF8E1', accent: '#BF360C' },
    { id: 'lilas',   icon: Droplets, labelFr: 'Lilas',     labelAr: 'بنفسجي',  bg: '#F3E5F5', accent: '#6A1B9A' },
    { id: 'ocean',   icon: Moon,     labelFr: 'Océan',     labelAr: 'المحيط',  bg: '#0D1B2A', accent: '#4DD0E1' },
  ];

  const fontSizes = [
    { id: 'small',  labelFr: 'Petit',  labelAr: 'صغير',  sample: 'text-xs'   },
    { id: 'medium', labelFr: 'Moyen',  labelAr: 'متوسط', sample: 'text-sm'   },
    { id: 'large',  labelFr: 'Grand',  labelAr: 'كبير',  sample: 'text-base' },
  ];

  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const completedGoals = userData.goals.filter(g => g.completed).length;

  const sl = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.07, ease: 'easeOut' as const },
  });

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
      style={{ background: value ? 'var(--brand-secondary)' : 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}
    >
      <motion.div
        animate={{ x: value ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );

  const ToggleRow = ({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl"
         style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' }}>
      <div>
        <p className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>{label}</p>
        {sub && <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>{sub}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">

      {/* Header */}
      <motion.div {...sl(0)} className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl sm:text-5xl text-primary leading-tight">
              {lang === 'fr' ? 'Paramètres' : 'الإعدادات'}
            </h2>
            <p className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] opacity-60 mt-1">
              {lang === 'fr' ? 'Personnalisez votre expérience' : 'خصص تجربتك'}
            </p>
          </div>
          <AnimatePresence>
            {saved && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: 'color-mix(in srgb, var(--brand-secondary) 15%, transparent)', color: 'var(--brand-secondary)' }}>
                <Check size={14} />
                <span className="text-xs font-black uppercase tracking-wide">
                  {lang === 'fr' ? 'Sauvegardé' : 'تم الحفظ'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div {...sl(1)} className="glass-card p-6 relative overflow-hidden">
        <div className="card-accent-bar" />
        <p className="text-[9px] uppercase tracking-widest font-black mb-4" style={{ color: 'var(--brand-text-muted)' }}>
          {lang === 'fr' ? 'Votre progression' : 'تقدمك'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: memorizedCount,          label: lang === 'fr' ? 'Sourates'     : 'السور',     color: '#A8DADC' },
            { value: completedGoals,           label: lang === 'fr' ? 'Objectifs'    : 'الأهداف',   color: '#B7E4C7' },
            { value: userData.badges.length,   label: lang === 'fr' ? 'Badges'       : 'الشارات',   color: '#D4AF37' },
            { value: userData.loginStreak || 1,label: lang === 'fr' ? 'Jours de suite': 'الأيام',   color: '#F4845F' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-gradient leading-none">{s.value}</p>
              <p className="text-[9px] uppercase tracking-wider font-bold mt-1" style={{ color: 'var(--brand-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile */}
        <motion.section {...sl(2)} className="glass-card p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
              <User size={17} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <h3 className="text-xl" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Profil' : 'الملف الشخصي'}</h3>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? "Nom d'utilisateur" : 'اسم المستخدم'}
            </label>
            <input type="text" value={settings.username} onChange={e => updateSettings({ username: e.target.value })}
              className="mishkat-input" placeholder={lang === 'fr' ? 'Votre nom…' : 'اسمك…'} />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Ville (horaires de prière)' : 'المدينة (مواقيت الصلاة)'}
            </label>
            <input type="text" value={settings.city ?? ''} onChange={e => updateSettings({ city: e.target.value })}
              className="mishkat-input" placeholder={lang === 'fr' ? 'Ex: Paris, Alger…' : 'مثال: الجزائر، باريس…'} />
          </div>
          {(userData.loginStreak || 1) > 1 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                 style={{ background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)', border: '1px solid var(--border-subtle)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-primary)' }}>
                <Flame size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-gradient">{userData.loginStreak} {lang === 'fr' ? 'jours de suite' : 'يوم متواصل'}</p>
                <p className="text-[9px] font-bold" style={{ color: 'var(--brand-text-muted)' }}>{lang === 'fr' ? 'Continuez !' : 'أحسنت!'}</p>
              </div>
            </div>
          )}
        </motion.section>

        {/* Appearance + Themes */}
        <motion.section {...sl(3)} className="glass-card p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
              <Palette size={17} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <h3 className="text-xl" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Apparence' : 'المظهر'}</h3>
          </div>

          {/* Theme grid */}
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Thème' : 'السمة'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {themes.map(t => {
                const isActive = settings.theme === t.id;
                return (
                  <button key={t.id} onClick={() => updateSettings({ theme: t.id as any })}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all"
                    style={{
                      background: isActive ? 'var(--brand-primary)' : 'color-mix(in srgb, var(--brand-primary) 4%, transparent)',
                      borderColor: isActive ? 'var(--brand-primary)' : 'var(--border-subtle)',
                      boxShadow: isActive ? '0 4px 16px color-mix(in srgb, var(--brand-primary) 25%, transparent)' : 'none',
                    }}>
                    <div className="w-6 h-6 rounded-lg border-2 shadow-sm" style={{ background: t.bg, borderColor: t.accent }} />
                    <span className="text-[8px] font-black uppercase tracking-wider leading-tight text-center"
                          style={{ color: isActive ? '#fff' : 'var(--brand-text-muted)' }}>
                      {lang === 'fr' ? t.labelFr : t.labelAr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font size */}
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Taille du texte' : 'حجم الخط'}
            </label>
            <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
              {fontSizes.map(f => (
                <button key={f.id} onClick={() => updateSettings({ fontSize: f.id as any })}
                  className={cn('flex-1 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all', f.sample)}
                  style={{
                    background: settings.fontSize === f.id ? 'var(--brand-surface)' : 'transparent',
                    color: settings.fontSize === f.id ? 'var(--brand-primary)' : 'var(--brand-text-muted)',
                    boxShadow: settings.fontSize === f.id ? 'var(--shadow-soft)' : 'none',
                  }}>
                  {lang === 'fr' ? f.labelFr : f.labelAr}
                </button>
              ))}
            </div>
          </div>

          {/* UI Zoom */}
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Zoom interface' : 'تكبير الواجهة'}
            </label>
            <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
              {([80, 100, 120] as const).map(z => (
                <button key={z} onClick={() => updateSettings({ uiZoom: z })}
                  className="flex-1 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                  style={{
                    background: (settings.uiZoom ?? 100) === z ? 'var(--brand-surface)' : 'transparent',
                    color: (settings.uiZoom ?? 100) === z ? 'var(--brand-primary)' : 'var(--brand-text-muted)',
                    boxShadow: (settings.uiZoom ?? 100) === z ? 'var(--shadow-soft)' : 'none',
                  }}>
                  {z}%
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Accessibility */}
        <motion.section {...sl(4)} className="glass-card p-7 space-y-4 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
              <Accessibility size={17} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <h3 className="text-xl" style={{ color: 'var(--brand-primary)' }}>
              {lang === 'fr' ? 'Accessibilité' : 'إمكانية الوصول'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToggleRow
              label={lang === 'fr' ? 'Réduire les animations' : 'تقليل الحركات'}
              sub={lang === 'fr' ? 'Désactive les transitions' : 'إيقاف الانتقالات'}
              value={settings.reduceAnimations ?? false}
              onChange={v => updateSettings({ reduceAnimations: v })}
            />
            <ToggleRow
              label={lang === 'fr' ? 'Police dyslexie' : 'خط عسر القراءة'}
              sub={lang === 'fr' ? 'OpenDyslexic' : 'OpenDyslexic'}
              value={settings.dyslexiaFont ?? false}
              onChange={v => updateSettings({ dyslexiaFont: v })}
            />
            <ToggleRow
              label={lang === 'fr' ? 'Contraste élevé' : 'تباين عالٍ'}
              sub={lang === 'fr' ? 'Améliore la lisibilité' : 'يحسن قابلية القراءة'}
              value={settings.highContrast ?? false}
              onChange={v => updateSettings({ highContrast: v })}
            />
            <ToggleRow
              label={lang === 'fr' ? 'Fond statique' : 'خلفية ثابتة'}
              sub={lang === 'fr' ? 'Désactive le fond animé' : 'إيقاف الخلفية المتحركة'}
              value={settings.staticBackground ?? false}
              onChange={v => updateSettings({ staticBackground: v })}
            />
            <ToggleRow
              label={lang === 'fr' ? 'Sons de navigation' : 'أصوات التنقل'}
              sub={lang === 'fr' ? 'Feedback sonore' : 'ردود فعل صوتية'}
              value={settings.soundEffects ?? false}
              onChange={v => updateSettings({ soundEffects: v })}
            />
            <ToggleRow
              label={lang === 'fr' ? 'Noms arabes des sourates' : 'الأسماء العربية للسور'}
              sub={lang === 'fr' ? 'Afficher dans la grille' : 'إظهار في الشبكة'}
              value={settings.showArabicNames}
              onChange={v => updateSettings({ showArabicNames: v })}
            />
            <ToggleRow
              label={lang === 'fr' ? 'Numéros de sourates' : 'أرقام السور'}
              sub={lang === 'fr' ? 'Afficher les numéros' : 'إظهار الأرقام'}
              value={settings.showSurahNumbers ?? true}
              onChange={v => updateSettings({ showSurahNumbers: v })}
            />
            <ToggleRow
              label={lang === 'fr' ? 'Confirmer avant suppression' : 'تأكيد الحذف'}
              sub={lang === 'fr' ? 'Toujours demander' : 'اسأل دائماً'}
              value={settings.confirmDelete ?? true}
              onChange={v => updateSettings({ confirmDelete: v })}
            />
          </div>

          {/* Line spacing */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Espacement des lignes' : 'تباعد الأسطر'}
            </label>
            <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
              {([
                { id: 'normal',      labelFr: 'Normal',       labelAr: 'عادي'    },
                { id: 'comfortable', labelFr: 'Confortable',  labelAr: 'مريح'    },
                { id: 'large',       labelFr: 'Large',        labelAr: 'واسع'    },
              ] as const).map(s => (
                <button key={s.id} onClick={() => updateSettings({ lineSpacing: s.id })}
                  className="flex-1 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                  style={{
                    background: (settings.lineSpacing ?? 'normal') === s.id ? 'var(--brand-surface)' : 'transparent',
                    color: (settings.lineSpacing ?? 'normal') === s.id ? 'var(--brand-primary)' : 'var(--brand-text-muted)',
                    boxShadow: (settings.lineSpacing ?? 'normal') === s.id ? 'var(--shadow-soft)' : 'none',
                  }}>
                  {lang === 'fr' ? s.labelFr : s.labelAr}
                </button>
              ))}
            </div>
          </div>

          {/* Text direction */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Direction du texte' : 'اتجاه النص'}
            </label>
            <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
              {([
                { id: 'auto', labelFr: 'Auto', labelAr: 'تلقائي' },
                { id: 'ltr',  labelFr: 'LTR ←', labelAr: 'يسار ←' },
                { id: 'rtl',  labelFr: '→ RTL', labelAr: '→ يمين' },
              ] as const).map(d => (
                <button key={d.id} onClick={() => updateSettings({ textDirection: d.id })}
                  className="flex-1 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                  style={{
                    background: (settings.textDirection ?? 'auto') === d.id ? 'var(--brand-surface)' : 'transparent',
                    color: (settings.textDirection ?? 'auto') === d.id ? 'var(--brand-primary)' : 'var(--brand-text-muted)',
                    boxShadow: (settings.textDirection ?? 'auto') === d.id ? 'var(--shadow-soft)' : 'none',
                  }}>
                  {lang === 'fr' ? d.labelFr : d.labelAr}
                </button>
              ))}
            </div>
          </div>

          {/* Color blind mode */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Mode daltonien' : 'وضع عمى الألوان'}
            </label>
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
              {([
                { id: 'none',         labelFr: 'Aucun',       labelAr: 'لا شيء'   },
                { id: 'deuteranopia', labelFr: 'Deutéranopie',labelAr: 'ديوترانوبيا' },
                { id: 'protanopia',   labelFr: 'Protanopie',  labelAr: 'بروتانوبيا' },
                { id: 'tritanopia',   labelFr: 'Tritanopie',  labelAr: 'تريتانوبيا' },
              ] as const).map(c => (
                <button key={c.id} onClick={() => updateSettings({ colorBlindMode: c.id })}
                  className="flex-1 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all min-w-[70px]"
                  style={{
                    background: (settings.colorBlindMode ?? 'none') === c.id ? 'var(--brand-primary)' : 'transparent',
                    color: (settings.colorBlindMode ?? 'none') === c.id ? '#fff' : 'var(--brand-text-muted)',
                  }}>
                  {lang === 'fr' ? c.labelFr : c.labelAr}
                </button>
              ))}
            </div>
          </div>

          {/* Auto save interval */}
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Sauvegarde automatique (Diftar)' : 'الحفظ التلقائي (الدفتر)'}
            </label>
            <div className="flex gap-2 p-1.5 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
              {([
                { v: 30,  labelFr: '30s',    labelAr: '30ث'   },
                { v: 60,  labelFr: '1 min',  labelAr: '1 د'   },
                { v: 300, labelFr: '5 min',  labelAr: '5 د'   },
                { v: 0,   labelFr: 'Manuel', labelAr: 'يدوي'  },
              ] as const).map(({ v, labelFr, labelAr }) => (
                <button key={v} onClick={() => updateSettings({ autoSaveInterval: v })}
                  className="flex-1 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                  style={{
                    background: (settings.autoSaveInterval ?? 300) === v ? 'var(--brand-surface)' : 'transparent',
                    color: (settings.autoSaveInterval ?? 300) === v ? 'var(--brand-primary)' : 'var(--brand-text-muted)',
                    boxShadow: (settings.autoSaveInterval ?? 300) === v ? 'var(--shadow-soft)' : 'none',
                  }}>
                  {lang === 'fr' ? labelFr : labelAr}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section {...sl(5)} className="glass-card p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
              <Bell size={17} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <h3 className="text-xl" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Notifications' : 'التنبيهات'}</h3>
          </div>

          <ToggleRow
            label={lang === 'fr' ? 'Rappels quotidiens' : 'تذكيرات يومية'}
            sub={lang === 'fr' ? 'Rappel de lecture' : 'تذكير بالقراءة'}
            value={settings.notifications}
            onChange={v => updateSettings({ notifications: v })}
          />

          <AnimatePresence>
            {settings.notifications && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden">
                <label className="text-[9px] uppercase tracking-widest font-black px-1" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? 'Heure du rappel' : 'وقت التذكير'}
                </label>
                <div className="relative">
                  <Clock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--brand-secondary)' }} />
                  <input type="time" value={settings.dailyReminder}
                    onChange={e => updateSettings({ dailyReminder: e.target.value })}
                    className="mishkat-input pl-11" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* General */}
        <motion.section {...sl(6)} className="glass-card p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
              <SettingsIcon size={17} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <h3 className="text-xl" style={{ color: 'var(--brand-primary)' }}>{lang === 'fr' ? 'Général' : 'عام'}</h3>
          </div>

          {/* Export */}
          <button onClick={exportData}
            className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all group"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)', borderColor: 'var(--border-subtle)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}>
            <div className="flex items-center gap-3">
              <Download size={16} style={{ color: 'var(--brand-secondary)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                {lang === 'fr' ? 'Exporter les données' : 'تصدير البيانات'}
              </span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--brand-text-muted)' }} />
          </button>

          {/* Import */}
          <button onClick={() => importRef.current?.click()}
            className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all group"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)', borderColor: 'var(--border-subtle)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}>
            <div className="flex items-center gap-3">
              <Upload size={16} style={{ color: 'var(--brand-secondary)' }} />
              <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                {lang === 'fr' ? 'Importer les données' : 'استيراد البيانات'}
              </span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--brand-text-muted)' }} />
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={importData} />

          {/* Reset */}
          <button
            onClick={() => {
              if (confirm(lang === 'fr' ? 'Voulez-vous vraiment tout réinitialiser ?' : 'هل تريد حقاً إعادة ضبط كل شيء؟')) {
                localStorage.removeItem('mishkat_user_data');
                window.location.reload();
              }
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all"
            style={{ background: 'var(--color-danger-subtle)', borderColor: 'var(--color-danger-border)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--color-danger) 12%, transparent)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-danger-subtle)')}>
            <div className="flex items-center gap-3">
              <Trash2 size={16} style={{ color: 'var(--color-danger)', opacity: 0.75 }} />
              <span className="text-sm font-bold" style={{ color: 'var(--color-danger)', opacity: 0.8 }}>
                {lang === 'fr' ? 'Réinitialiser les données' : 'إعادة ضبط البيانات'}
              </span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--color-danger)', opacity: 0.4 }} />
          </button>
        </motion.section>
      </div>

      {/* Footer */}
      <motion.div {...sl(7)} className="text-center pt-4 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.4em] font-black" style={{ color: 'var(--brand-text-muted)' }}>
          Mishkat v2.0 · {lang === 'fr' ? 'Fait avec amour ❤' : 'صنع بكل حب ❤'}
        </p>
        <p className="text-[9px]" style={{ color: 'var(--brand-text-muted)', opacity: 0.5 }}>
          Par Rahima &amp; hamda_wa_chakra
        </p>
      </motion.div>
    </div>
  );
};
