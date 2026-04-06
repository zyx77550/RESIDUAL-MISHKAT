import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Clock, 
  Type, 
  Palette, 
  Languages,
  Trash2,
  Check,
  Moon,
  Sun,
  Coffee,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserData, UserSettings } from '../types';

export const SettingsSection = ({ userData, setUserData, lang }: { userData: UserData, setUserData: React.Dispatch<React.SetStateAction<UserData>>, lang: string }) => {
  const settings = userData.settings;

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setUserData((prev: UserData) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const themes = [
    { id: 'light', icon: Sun, label: lang === 'fr' ? 'Clair' : 'فاتح', color: 'bg-[#F5F0E8]' },
    { id: 'dark', icon: Moon, label: lang === 'fr' ? 'Sombre' : 'داكن', color: 'bg-[#0f172a]' },
    { id: 'sepia', icon: Coffee, label: lang === 'fr' ? 'Sépia' : 'سيبيا', color: 'bg-[#f4ecd8]' },
  ];

  const fontSizes = [
    { id: 'small', label: lang === 'fr' ? 'Petit' : 'صغير' },
    { id: 'medium', label: lang === 'fr' ? 'Moyen' : 'متوسط' },
    { id: 'large', label: lang === 'fr' ? 'Grand' : 'كبير' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-5xl text-primary leading-tight">
          {lang === 'fr' ? 'Paramètres' : 'الإعدادات'}
        </h2>
        <p className="text-secondary font-bold tracking-[0.4em] uppercase text-xs opacity-60">
          {lang === 'fr' ? 'Personnalisez votre expérience' : 'خصص تجربتك'}
        </p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="flex items-center gap-4 text-primary">
            <User size={24} className="text-secondary" />
            <h3 className="text-xl">{lang === 'fr' ? 'Profil' : 'الملف الشخصي'}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-black text-text-muted px-1">
                {lang === 'fr' ? 'Nom d\'utilisateur' : 'اسم المستخدم'}
              </label>
              <input 
                type="text"
                value={settings.username}
                onChange={(e) => updateSettings({ username: e.target.value })}
                className="w-full bg-primary/5 border-none rounded-2xl px-5 py-4 text-primary font-medium focus:ring-2 focus:ring-secondary transition-all"
                placeholder={lang === 'fr' ? 'Votre nom...' : 'اسمك...'}
              />
            </div>
          </div>
        </motion.section>

        {/* Appearance Section */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="flex items-center gap-4 text-primary">
            <Palette size={24} className="text-secondary" />
            <h3 className="text-xl">{lang === 'fr' ? 'Apparence' : 'المظهر'}</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-black text-text-muted px-1">
                {lang === 'fr' ? 'Thème' : 'السمة'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateSettings({ theme: t.id as any })}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group",
                      settings.theme === t.id 
                        ? "bg-primary text-white border-primary shadow-lg scale-105" 
                        : "bg-surface/50 border-primary/5 text-text-muted hover:bg-surface hover:border-secondary/30"
                    )}
                  >
                    <t.icon size={20} className={cn("transition-transform group-hover:scale-110", settings.theme === t.id ? "text-secondary" : "text-primary/20")} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-black text-text-muted px-1">
                {lang === 'fr' ? 'Taille du texte' : 'حجم الخط'}
              </label>
              <div className="flex gap-2 p-1 bg-primary/5 rounded-2xl">
                {fontSizes.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateSettings({ fontSize: f.id as any })}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      settings.fontSize === f.id 
                        ? "bg-surface text-primary shadow-sm" 
                        : "text-text-muted hover:text-primary"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Notifications Section */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="flex items-center gap-4 text-primary">
            <Bell size={24} className="text-secondary" />
            <h3 className="text-xl">{lang === 'fr' ? 'Notifications' : 'التنبيهات'}</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary">{lang === 'fr' ? 'Activer les rappels' : 'تفعيل التذكيرات'}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{lang === 'fr' ? 'Rappels quotidiens de lecture' : 'تذكيرات يومية للقراءة'}</p>
              </div>
              <button 
                onClick={() => updateSettings({ notifications: !settings.notifications })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.notifications ? "bg-pastel-green" : "bg-primary/10"
                )}
              >
                <motion.div 
                  animate={{ x: settings.notifications ? 26 : 2 }}
                  className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            {settings.notifications && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-[10px] uppercase tracking-widest font-black text-text-muted px-1">
                  {lang === 'fr' ? 'Heure du rappel' : 'وقت التذكير'}
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary" />
                  <input 
                    type="time"
                    value={settings.dailyReminder}
                    onChange={(e) => updateSettings({ dailyReminder: e.target.value })}
                    className="w-full bg-primary/5 border-none rounded-2xl pl-12 pr-5 py-4 text-primary font-medium focus:ring-2 focus:ring-secondary transition-all"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* General Section */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="flex items-center gap-4 text-primary">
            <Languages size={24} className="text-secondary" />
            <h3 className="text-xl">{lang === 'fr' ? 'Général' : 'عام'}</h3>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
              <div className="space-y-1">
                <p className="text-sm font-bold text-primary">{lang === 'fr' ? 'Noms en arabe' : 'الأسماء بالعربية'}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{lang === 'fr' ? 'Afficher les noms des sourates' : 'إظهار أسماء السور'}</p>
              </div>
              <button 
                onClick={() => updateSettings({ showArabicNames: !settings.showArabicNames })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  settings.showArabicNames ? "bg-pastel-green" : "bg-primary/10"
                )}
              >
                <motion.div 
                  animate={{ x: settings.showArabicNames ? 26 : 2 }}
                  className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('mishkatUpdateAvailable', { detail: { reg: null } }))}
              className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-2xl border border-primary/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <SettingsIcon size={18} className="text-secondary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-primary">{lang === 'fr' ? 'Tester la mise à jour' : 'اختبار التحديث'}</span>
              </div>
              <ChevronRight size={16} className="text-primary/20" />
            </button>

            <button
              className="w-full flex items-center justify-between p-4 bg-red-500/5 hover:bg-red-500/10 rounded-2xl border border-red-500/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-red-500/60 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-red-500/60">{lang === 'fr' ? 'Réinitialiser les données' : 'إعادة ضبط البيانات'}</span>
              </div>
              <ChevronRight size={16} className="text-red-500/20" />
            </button>
          </div>
        </motion.section>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center pt-8"
      >
        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-text-muted">
          Mishkat v1.0 • {lang === 'fr' ? 'Fait avec amour' : 'صنع بكل حب'}
        </p>
      </motion.div>
    </div>
  );
};
