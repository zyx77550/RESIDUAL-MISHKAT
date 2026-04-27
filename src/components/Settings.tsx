import React, { useState, useRef } from 'react';
import { UserData, UserSettings } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';

export const SettingsSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();
  const settings = userData.settings;
  const [saved, setSaved] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const fr = lang === 'fr';

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
    { id: 'gold',    labelFr: 'Or',      labelAr: 'ذهبي',    bg: '#f8f3e9', accent: '#c8962a' },
    { id: 'sakura',  labelFr: 'Sakura',  labelAr: 'ساكورا',  bg: '#fdf0f4', accent: '#c85068' },
    { id: 'azur',    labelFr: 'Azur',    labelAr: 'أزرق',    bg: '#f0f5fa', accent: '#4580c0' },
    { id: 'emerald', labelFr: 'Émeraude',labelAr: 'زمردي',   bg: '#f0f8f2', accent: '#4a9870' },
  ];

  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const completedGoals = userData.goals.filter(g => g.completed).length;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', background: t.card, border: `1px solid ${t.line}`,
    borderRadius: 8, color: t.ink, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, padding: '20px 22px' };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12, position: 'relative', flexShrink: 0, cursor: 'pointer',
        background: value ? t.accent : t.cardElev, border: `1px solid ${value ? t.accent : t.line}`,
        transition: 'background 0.2s',
      }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 22 : 3, width: 16, height: 16, borderRadius: '50%',
        background: value ? '#1a0f00' : t.inkMute, transition: 'left 0.2s',
      }}/>
    </button>
  );

  const ToggleRow = ({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: t.cardElev }}>
      <div>
        <div style={{ fontSize: 13, color: t.ink, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{sub}</div>}
      </div>
      <Toggle value={value} onChange={onChange}/>
    </div>
  );

  const SegButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick}
      style={{
        flex: 1, padding: '9px', borderRadius: 8, cursor: 'pointer',
        background: active ? t.accent : 'transparent',
        color: active ? '#1a0f00' : t.inkMute,
        fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>
      {children}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 860, paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, color: t.ink }}>
            {fr ? 'Paramètres' : 'الإعدادات'}
          </div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 4 }}>
            {fr ? 'Personnalisez votre expérience' : 'خصص تجربتك'}
          </div>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: `${t.accentSoft}30`, color: t.accentBright, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Icon d={Icons.check} size={12} color={t.accentBright}/>
            {fr ? 'Sauvegardé' : 'تم الحفظ'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={card}>
        <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
          {fr ? 'Votre progression' : 'تقدمك'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16 }}>
          {[
            { value: memorizedCount,          label: fr ? 'Sourates'      : 'السور'    },
            { value: completedGoals,           label: fr ? 'Objectifs'     : 'الأهداف'  },
            { value: userData.badges.length,   label: fr ? 'Badges'        : 'الشارات'  },
            { value: userData.loginStreak || 1,label: fr ? 'Jours de suite': 'الأيام'   },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: t.accent, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

        {/* Profile */}
        <div style={card}>
          <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>
            {fr ? 'Profil' : 'الملف الشخصي'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                {fr ? "Nom d'utilisateur" : 'اسم المستخدم'}
              </div>
              <input type="text" value={settings.username} onChange={e => updateSettings({ username: e.target.value })}
                placeholder={fr ? 'Votre nom…' : 'اسمك…'} style={inputStyle}/>
            </div>
            <div>
              <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                {fr ? 'Ville (horaires de prière)' : 'المدينة (مواقيت الصلاة)'}
              </div>
              <input type="text" value={settings.city ?? ''} onChange={e => updateSettings({ city: e.target.value })}
                placeholder={fr ? 'Ex: Paris, Alger…' : 'مثال: الجزائر، باريس…'} style={inputStyle}/>
            </div>
            {(userData.loginStreak || 1) > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: t.cardElev, border: `1px solid ${t.line}` }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon d={Icons.flame} size={13} color="#1a0f00"/>
                </div>
                <div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: t.accent }}>{userData.loginStreak} {fr ? 'jours de suite' : 'يوم متواصل'}</div>
                  <div style={{ fontSize: 9.5, color: t.inkMute }}>{fr ? 'Continuez !' : 'أحسنت!'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Appearance */}
        <div style={card}>
          <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>
            {fr ? 'Apparence' : 'المظهر'}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              {fr ? 'Thème' : 'السمة'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {themes.map(theme => {
                const isActive = settings.theme === theme.id;
                return (
                  <button key={theme.id} onClick={() => updateSettings({ theme: theme.id as any })}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                      background: isActive ? `${t.accent}20` : t.cardElev,
                      border: `1.5px solid ${isActive ? t.accent : t.line}`,
                    }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: theme.bg, border: `2px solid ${theme.accent}` }}/>
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isActive ? t.accent : t.inkMute }}>
                      {fr ? theme.labelFr : theme.labelAr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              {fr ? 'Taille du texte' : 'حجم الخط'}
            </div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: t.cardElev, borderRadius: 10 }}>
              {[
                { id: 'small', labelFr: 'Petit', labelAr: 'صغير' },
                { id: 'medium', labelFr: 'Moyen', labelAr: 'متوسط' },
                { id: 'large', labelFr: 'Grand', labelAr: 'كبير' },
              ].map(f => (
                <SegButton key={f.id} active={settings.fontSize === f.id} onClick={() => updateSettings({ fontSize: f.id as any })}>
                  {fr ? f.labelFr : f.labelAr}
                </SegButton>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              {fr ? 'Zoom interface' : 'تكبير الواجهة'}
            </div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: t.cardElev, borderRadius: 10 }}>
              {([80, 100, 120] as const).map(z => (
                <SegButton key={z} active={(settings.uiZoom ?? 100) === z} onClick={() => updateSettings({ uiZoom: z })}>
                  {z}%
                </SegButton>
              ))}
            </div>
          </div>
        </div>

        {/* Accessibility */}
        <div style={{ ...card, gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>
            {fr ? 'Accessibilité' : 'إمكانية الوصول'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 14 }}>
            <ToggleRow label={fr ? 'Réduire les animations' : 'تقليل الحركات'} sub={fr ? 'Désactive les transitions' : 'إيقاف الانتقالات'} value={settings.reduceAnimations ?? false} onChange={v => updateSettings({ reduceAnimations: v })}/>
            <ToggleRow label={fr ? 'Police dyslexie' : 'خط عسر القراءة'} sub="OpenDyslexic" value={settings.dyslexiaFont ?? false} onChange={v => updateSettings({ dyslexiaFont: v })}/>
            <ToggleRow label={fr ? 'Contraste élevé' : 'تباين عالٍ'} sub={fr ? 'Améliore la lisibilité' : 'يحسن قابلية القراءة'} value={settings.highContrast ?? false} onChange={v => updateSettings({ highContrast: v })}/>
            <ToggleRow label={fr ? 'Sons de navigation' : 'أصوات التنقل'} sub={fr ? 'Feedback sonore' : 'ردود فعل صوتية'} value={settings.soundEffects ?? false} onChange={v => updateSettings({ soundEffects: v })}/>
            <ToggleRow label={fr ? 'Noms arabes des sourates' : 'الأسماء العربية للسور'} sub={fr ? 'Afficher dans la grille' : 'إظهار في الشبكة'} value={settings.showArabicNames} onChange={v => updateSettings({ showArabicNames: v })}/>
            <ToggleRow label={fr ? 'Numéros de sourates' : 'أرقام السور'} sub={fr ? 'Afficher les numéros' : 'إظهار الأرقام'} value={settings.showSurahNumbers ?? true} onChange={v => updateSettings({ showSurahNumbers: v })}/>
            <ToggleRow label={fr ? 'Confirmer avant suppression' : 'تأكيد الحذف'} sub={fr ? 'Toujours demander' : 'اسأل دائماً'} value={settings.confirmDelete ?? true} onChange={v => updateSettings({ confirmDelete: v })}/>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              {fr ? 'Espacement des lignes' : 'تباعد الأسطر'}
            </div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: t.cardElev, borderRadius: 10 }}>
              {([
                { id: 'normal', labelFr: 'Normal', labelAr: 'عادي' },
                { id: 'comfortable', labelFr: 'Confortable', labelAr: 'مريح' },
                { id: 'large', labelFr: 'Large', labelAr: 'واسع' },
              ] as const).map(s => (
                <SegButton key={s.id} active={(settings.lineSpacing ?? 'normal') === s.id} onClick={() => updateSettings({ lineSpacing: s.id })}>
                  {fr ? s.labelFr : s.labelAr}
                </SegButton>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              {fr ? 'Sauvegarde automatique (Diftar)' : 'الحفظ التلقائي (الدفتر)'}
            </div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: t.cardElev, borderRadius: 10, flexWrap: 'wrap' }}>
              {([
                { v: 30,  labelFr: '30s',    labelAr: '30ث'  },
                { v: 60,  labelFr: '1 min',  labelAr: '1 د'  },
                { v: 300, labelFr: '5 min',  labelAr: '5 د'  },
                { v: 0,   labelFr: 'Manuel', labelAr: 'يدوي' },
              ] as const).map(({ v, labelFr, labelAr }) => (
                <SegButton key={v} active={(settings.autoSaveInterval ?? 300) === v} onClick={() => updateSettings({ autoSaveInterval: v })}>
                  {fr ? labelFr : labelAr}
                </SegButton>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={card}>
          <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>
            {fr ? 'Notifications' : 'التنبيهات'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ToggleRow label={fr ? 'Rappels quotidiens' : 'تذكيرات يومية'} sub={fr ? 'Rappel de lecture' : 'تذكير بالقراءة'} value={settings.notifications} onChange={v => updateSettings({ notifications: v })}/>
            {settings.notifications && (
              <div>
                <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {fr ? 'Heure du rappel' : 'وقت التذكير'}
                </div>
                <input type="time" value={settings.dailyReminder}
                  onChange={e => updateSettings({ dailyReminder: e.target.value })}
                  style={inputStyle}/>
              </div>
            )}
          </div>
        </div>

        {/* General */}
        <div style={card}>
          <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>
            {fr ? 'Général' : 'عام'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={exportData}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: t.cardElev, border: `1px solid ${t.line}`, cursor: 'pointer', color: t.ink }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon d={Icons.download} size={15} color={t.accentBright}/>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{fr ? 'Exporter les données' : 'تصدير البيانات'}</span>
              </div>
              <Icon d={Icons.arrow} size={14} color={t.inkMute}/>
            </button>

            <button onClick={() => importRef.current?.click()}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: t.cardElev, border: `1px solid ${t.line}`, cursor: 'pointer', color: t.ink }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon d={Icons.upload} size={15} color={t.accentBright}/>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{fr ? 'Importer les données' : 'استيراد البيانات'}</span>
              </div>
              <Icon d={Icons.arrow} size={14} color={t.inkMute}/>
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importData}/>

            <button onClick={() => {
              if (confirm(fr ? 'Voulez-vous vraiment tout réinitialiser ?' : 'هل تريد حقاً إعادة ضبط كل شيء؟')) {
                localStorage.removeItem('mishkat_user_data');
                window.location.reload();
              }
            }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon d={Icons.trash} size={15} color="rgba(239,68,68,0.6)"/>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(239,68,68,0.75)' }}>
                  {fr ? 'Réinitialiser les données' : 'إعادة ضبط البيانات'}
                </span>
              </div>
              <Icon d={Icons.arrow} size={14} color="rgba(239,68,68,0.3)"/>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Mishkat v2.0 · {fr ? 'Fait avec amour' : 'صنع بكل حب'}
        </div>
        <div style={{ fontSize: 9, color: t.inkMute, opacity: 0.5, marginTop: 4 }}>
          Par Rahima &amp; hamda_wa_chakra
        </div>
      </div>
    </div>
  );
};
