import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Bell, Clock, Type, Palette, Languages,
  Trash2, Check, Moon, Sun, Coffee, ChevronRight, Flame, Download, Info
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserData, UserSettings } from '../types';

export const SettingsSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const settings = userData.settings;
  const [saved, setSaved] = useState(false);

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

  const themes = [
    { id: 'light', icon: Sun,     labelFr: 'Clair',  labelAr: 'فاتح',   bg: '#F5F0E8', accent: '#8B2635' },
    { id: 'dark',  icon: Moon,    labelFr: 'Sombre', labelAr: 'داكن',   bg: '#0C0806', accent: '#F4845F' },
    { id: 'sepia', icon: Coffee,  labelFr: 'Sépia',  labelAr: 'سيبيا',  bg: '#F0E8CC', accent: '#6B4226' },
  ];

  const fontSizes = [
    { id: 'small',  labelFr: 'Petit',  labelAr: 'صغير',    sample: 'text-xs' },
    { id: 'medium', labelFr: 'Moyen',  labelAr: 'متوسط',   sample: 'text-sm' },
    { id: 'large',  labelFr: 'Grand',  labelAr: 'كبير',    sample: 'text-base' },
  ];

  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const completedGoals = userData.goals.filter(g => g.completed).length;

  const stagger = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: i * 0.07, ease: 'easeOut' }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">

      {/* Header */}
      <motion.div {...stagger(0)} className="space-y-1">
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

      {/* Stats card */}
      <motion.div {...stagger(1)} className="glass-card p-6 relative overflow-hidden">
        <div className="card-accent-bar" />
        <p className="text-[9px] uppercase tracking-widest font-black mb-4"
           style={{ color: 'var(--brand-text-muted)' }}>
          {lang === 'fr' ? 'Votre progression' : 'تقدمك'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: memorizedCount, label: lang === 'fr' ? 'Sourates' : 'السور', color: '#A8DADC' },
            { value: completedGoals, label: lang === 'fr' ? 'Objectifs' : 'الأهداف', color: '#B7E4C7' },
            { value: userData.badges.length, label: lang === 'fr' ? 'Badges' : 'الشارات', color: '#D4AF37' },
            { value: userData.loginStreak || 1, label: lang === 'fr' ? 'Jours de suite' : 'الأيام', color: '#F4845F' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-gradient leading-none">{s.value}</p>
              <p className="text-[9px] uppercase tracking-wider font-bold mt-1"
                 style={{ color: 'var(--brand-text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profile */}
        <motion.section {...stagger(2)} className="glass-card p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
              <User size={17} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <h3 className="text-xl" style={{ color: 'var(--brand-primary)' }}>
              {lang === 'fr' ? 'Profil' : 'الملف الشخصي'}
            </h3>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest font-black px-1"
                   style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Nom d\'utilisateur' : 'اسم المستخدم'}
            </label>
            <input
              type="text"
              value={settings.username}
              onChange={e => updateSettings({ username: e.target.value })}
              className="mishkat-input"
              placeholder={lang === 'fr' ? 'Votre nom…' : 'اسمك…'}
            />
          </div>
          {/* Streak display */}
          {(userData.loginStreak || 1) > 1 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                 style={{ background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)', border: '1px solid var(--border-subtle)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: 'var(--brand-primary)' }}>
                <Flame size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-gradient">{userData.loginStreak} {lang === 'fr' ? 'jours de suite' : 'يوم متواصل'}</p>
                <p className="text-[9px] font-bold" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? 'Continuez comme ça !' : 'أحسنت، واصل!'}
                </p>
              </div>
            </div>
          )}
        </motion.section>

        {/* Appearance */}
        <motion.section {...stagger(3)} className="glass-card p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
              <Palette size={17} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <h3 className="text-xl" style={{ color: 'var(--brand-primary)' }}>
              {lang === 'fr' ? 'Apparence' : 'المظهر'}
            </h3>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-widest font-black px-1"
                   style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Thème' : 'السمة'}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {themes.map(t => {
                const isActive = settings.theme === t.id;
                return (
                  <button key={t.id} onClick={() => updateSettings({ theme: t.id as any })}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group"
                    style={{
                      background: isActive ? 'var(--brand-primary)' : 'color-mix(in srgb, var(--brand-primary) 4%, transparent)',
                      borderColor: isActive ? 'var(--brand-primary)' : 'var(--border-subtle)',
                      boxShadow: isActive ? '0 4px 16px color-mix(in srgb, var(--brand-primary) 25%, transparent)' : 'none',
                    }}>
                    <div className="w-8 h-8 rounded-xl border-2 shadow-sm" style={{ background: t.bg, borderColor: t.accent }} />
                    <t.icon size={14} style={{ color: isActive ? '#fff' : 'var(--brand-primary)', opacity: isActive ? 1 : 0.5 }} />
                    <span className="text-[9px] font-black uppercase tracking-wider"
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
            <label className="text-[9px] uppercase tracking-widest font-black px-1"
                   style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Taille du texte' : 'حجم الخط'}
            </label>
            <div className="flex gap-2 p-1.5 rounded-2xl"
                 style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}>
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
        </motion.section>

        {/* Notifications */}
        <motion.section {...stagger(4)} className="glass-card p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
              <Bell size={17} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <h3 className="text-xl" style={{ color: 'var(--brand-primary)' }}>
              {lang === 'fr' ? 'Notifications' : 'التنبيهات'}
            </h3>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl"
               style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' }}>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                {lang === 'fr' ? 'Rappels quotidiens' : 'تذكيرات يومية'}
              </p>
              <p className="text-[9px] uppercase tracking-wider mt-0.5"
                 style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'Rappel de lecture' : 'تذكير بالقراءة'}
              </p>
            </div>
            <button
              onClick={() => updateSettings({ notifications: !settings.notifications })}
              className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ background: settings.notifications ? 'var(--brand-secondary)' : 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}
            >
              <motion.div
                animate={{ x: settings.notifications ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>

          <AnimatePresence>
            {settings.notifications && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden">
                <label className="text-[9px] uppercase tracking-widest font-black px-1"
                       style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? 'Heure du rappel' : 'وقت التذكير'}
                </label>
                <div className="relative">
                  <Clock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                         style={{ color: 'var(--brand-secondary)' }} />
                  <input type="time" value={settings.dailyReminder}
                    onChange={e => updateSettings({ dailyReminder: e.target.value })}
                    className="mishkat-input pl-11" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* General */}
        <motion.section {...stagger(5)} className="glass-card p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' }}>
              <SettingsIcon size={17} style={{ color: 'var(--brand-secondary)' }} />
            </div>
            <h3 className="text-xl" style={{ color: 'var(--brand-primary)' }}>
              {lang === 'fr' ? 'Général' : 'عام'}
            </h3>
          </div>

          {/* Arabic names toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl"
               style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' }}>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                {lang === 'fr' ? 'Noms arabes' : 'الأسماء العربية'}
              </p>
              <p className="text-[9px] uppercase tracking-wider mt-0.5"
                 style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'Afficher les noms des sourates' : 'إظهار أسماء السور'}
              </p>
            </div>
            <button
              onClick={() => updateSettings({ showArabicNames: !settings.showArabicNames })}
              className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
              style={{ background: settings.showArabicNames ? 'var(--brand-secondary)' : 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}
            >
              <motion.div
                animate={{ x: settings.showArabicNames ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
              />
            </button>
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

          {/* Reset */}
          <button
            onClick={() => {
              if (confirm(lang === 'fr' ? 'Voulez-vous vraiment tout réinitialiser ?' : 'هل تريد حقاً إعادة ضبط كل شيء؟')) {
                localStorage.removeItem('mishkat_user_data');
                window.location.reload();
              }
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all group"
            style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.1)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.04)')}>
            <div className="flex items-center gap-3">
              <Trash2 size={16} style={{ color: 'rgba(239,68,68,0.6)' }} />
              <span className="text-sm font-bold" style={{ color: 'rgba(239,68,68,0.7)' }}>
                {lang === 'fr' ? 'Réinitialiser les données' : 'إعادة ضبط البيانات'}
              </span>
            </div>
            <ChevronRight size={16} style={{ color: 'rgba(239,68,68,0.3)' }} />
          </button>
        </motion.section>
      </div>

      {/* Footer */}
      <motion.div {...stagger(6)} className="text-center pt-4 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.4em] font-black"
           style={{ color: 'var(--brand-text-muted)' }}>
          Mishkat v2.0 · {lang === 'fr' ? 'Fait avec amour ❤' : 'صنع بكل حب ❤'}
        </p>
        <p className="text-[9px]" style={{ color: 'var(--brand-text-muted)', opacity: 0.5 }}>
          Par Rahima & hamda_wa_chakra
        </p>
      </motion.div>
    </div>
  );
};
