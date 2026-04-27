import React, { useState, useRef } from 'react';
import { UserData, UserSettings } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons, useIsNarrow } from './ui';

export const SettingsSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();
  const narrow = useIsNarrow();
  const settings = userData.settings;
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const importRef = useRef<HTMLInputElement>(null);
  const fr = lang === 'fr';

  const NAV_SECTIONS = [
    { id: 'profile',       labelFr: 'Profil',          labelAr: 'الملف الشخصي' },
    { id: 'appearance',    labelFr: 'Apparence',        labelAr: 'المظهر'       },
    { id: 'notifications', labelFr: 'Notifications',    labelAr: 'التنبيهات'    },
    { id: 'accessibility', labelFr: 'Accessibilité',    labelAr: 'إمكانية الوصول'},
    { id: 'data',          labelFr: 'Données',          labelAr: 'البيانات'     },
    { id: 'about',         labelFr: 'À propos',         labelAr: 'حول التطبيق'  },
  ];

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
    { id: 'gold',    labelFr: 'Or',       labelAr: 'ذهبي',   bg: '#f8f3e9', accent: '#c8962a', accentBright: '#d4a64a' },
    { id: 'sakura',  labelFr: 'Sakura',   labelAr: 'ساكورا', bg: '#fdf0f4', accent: '#c85068', accentBright: '#d96b7a' },
    { id: 'azur',    labelFr: 'Azur',     labelAr: 'أزرق',   bg: '#f0f5fa', accent: '#4580c0', accentBright: '#5b9bd5' },
    { id: 'emerald', labelFr: 'Émeraude', labelAr: 'زمردي',  bg: '#f0f8f2', accent: '#4a9870', accentBright: '#5fb088' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, color: t.ink }}>
            {fr ? 'Paramètres' : 'الإعدادات'}
          </div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 4 }}>
            {fr ? 'Personnalisation · accessibilité · données' : 'تخصيص · وصول · بيانات'}
          </div>
        </div>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: `${t.accentSoft}30`, color: t.accentBright, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Icon d={Icons.check} size={12} color={t.accentBright}/>
            {fr ? 'Sauvegardé' : 'تم الحفظ'}
          </div>
        )}
      </div>

      {/* Nav pills (mobile) ou sidebar nav (desktop) */}
      {narrow ? (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {NAV_SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: active ? 600 : 400, cursor: 'pointer', background: active ? `${t.accent}18` : t.bgSoft, border: `1px solid ${active ? `${t.accent}44` : t.line}`, color: active ? t.ink : t.inkDim }}>
                {fr ? s.labelFr : s.labelAr}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* 2-column grid: sidebar + content */}
      <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '200px 1fr', gap: 14, alignItems: 'start' }}>

        {/* Sidebar nav — desktop only */}
        {!narrow && (
          <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, padding: '14px 4px', position: 'sticky', top: 16 }}>
            {NAV_SECTIONS.map(s => {
              const active = activeSection === s.id;
              return (
                <div key={s.id} onClick={() => setActiveSection(s.id)}
                  style={{ padding: '9px 16px', fontSize: 12.5, cursor: 'pointer', color: active ? t.ink : t.inkDim, fontWeight: active ? 500 : 400, borderLeft: `2px solid ${active ? t.accent : 'transparent'}`, background: active ? `${t.accent}10` : 'transparent', transition: 'all 0.15s' }}>
                  {fr ? s.labelFr : s.labelAr}
                </div>
              );
            })}
          </div>
        )}

        {/* Content area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

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
        {(activeSection === 'profile' || narrow) && (
        <div style={card}>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
            {fr ? 'Profil' : 'الملف الشخصي'}
          </div>
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${t.accent}, ${t.accentBright})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 26, color: '#1a0f00', fontWeight: 500, flexShrink: 0 }}>
              {(settings.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 19, color: t.ink, fontWeight: 300 }}>{settings.username || (fr ? 'Anonyme' : 'مجهول')}</div>
              <div style={{ fontSize: 11, color: t.inkDim, marginTop: 2 }}>{fr ? 'Mishkat · حِفْظ القرآن' : 'مشكاة · حِفْظ القرآن'}</div>
              {(userData.loginStreak || 1) > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, padding: '3px 10px', borderRadius: 999, background: `${t.accent}18`, fontSize: 11, color: t.accent }}>
                  <Icon d={Icons.flame} size={11} color={t.accent}/> {userData.loginStreak} {fr ? 'jours' : 'يوم'}
                </div>
              )}
            </div>
          </div>
          {/* Field rows */}
          {[
            { label: fr ? "Nom d'utilisateur" : 'اسم المستخدم', value: settings.username, onChange: (v: string) => updateSettings({ username: v }), placeholder: fr ? 'Votre nom…' : 'اسمك…' },
            { label: fr ? 'Ville (prière)' : 'المدينة (الصلاة)', value: settings.city ?? '', onChange: (v: string) => updateSettings({ city: v }), placeholder: fr ? 'Ex: Paris, Alger…' : 'مثال: الجزائر…' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${t.lineSoft}`, gap: 12 }}>
              <span style={{ fontSize: 12, color: t.inkDim, flexShrink: 0 }}>{f.label}</span>
              <input type="text" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 12.5, color: t.ink, textAlign: 'right', width: '100%', fontFamily: 'inherit' }}/>
            </div>
          ))}
        </div>
        )}

        {/* Appearance */}
        {(activeSection === 'appearance' || narrow) && (
        <div style={card}>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
            {fr ? 'Apparence' : 'المظهر'}
          </div>

          {/* Dark / Light mode */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: t.inkDim, marginBottom: 8 }}>{fr ? 'Mode' : 'الوضع'}</div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: t.cardElev, borderRadius: 10 }}>
              <SegButton active={!(settings.darkMode ?? false)} onClick={() => updateSettings({ darkMode: false })}>
                ☀ {fr ? 'Clair' : 'فاتح'}
              </SegButton>
              <SegButton active={settings.darkMode === true} onClick={() => updateSettings({ darkMode: true })}>
                ☾ {fr ? 'Sombre' : 'داكن'}
              </SegButton>
            </div>
          </div>

          {/* Theme swatches — 3 color dots */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: t.inkDim, marginBottom: 10 }}>{fr ? 'Thème' : 'السمة'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {themes.map(theme => {
                const isActive = settings.theme === theme.id;
                return (
                  <button key={theme.id} onClick={() => updateSettings({ theme: theme.id as any })}
                    style={{ padding: 10, background: isActive ? `${t.accent}10` : t.cardElev, border: `1px solid ${isActive ? t.accent : t.line}`, borderRadius: 8, cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: theme.accent }}/>
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: theme.accentBright }}/>
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: theme.bg, border: `1px solid ${theme.accent}44` }}/>
                    </div>
                    <div style={{ fontSize: 11, color: isActive ? t.accent : t.ink, fontWeight: isActive ? 600 : 400 }}>
                      {fr ? theme.labelFr : theme.labelAr}
                    </div>
                    {isActive && <div style={{ fontSize: 9, color: t.accent, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3 }}>{fr ? 'Actuel' : 'الحالي'}</div>}
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
        )} {/* end Appearance conditional */}

        {/* Accessibility */}
        {(activeSection === 'accessibility' || narrow) && (
        <div style={card}>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
            {fr ? 'Accessibilité' : 'إمكانية الوصول'}
          </div>
          {[
            { label: fr ? 'Réduire les animations' : 'تقليل الحركات',           value: settings.reduceAnimations ?? false, key: 'reduceAnimations' as const },
            { label: fr ? 'Police dyslexie (OpenDyslexic)' : 'خط عسر القراءة', value: settings.dyslexiaFont ?? false,     key: 'dyslexiaFont'     as const },
            { label: fr ? 'Contraste élevé' : 'تباين عالٍ',                    value: settings.highContrast ?? false,     key: 'highContrast'     as const },
            { label: fr ? 'Effets sonores' : 'أصوات التنقل',                   value: settings.soundEffects ?? false,     key: 'soundEffects'     as const },
            { label: fr ? 'Noms arabes des sourates' : 'الأسماء العربية',       value: settings.showArabicNames,           key: 'showArabicNames'  as const },
            { label: fr ? 'Numéros de sourates' : 'أرقام السور',               value: settings.showSurahNumbers ?? true,  key: 'showSurahNumbers' as const },
            { label: fr ? 'Confirmer avant suppression' : 'تأكيد الحذف',       value: settings.confirmDelete ?? true,     key: 'confirmDelete'    as const },
          ].map(row => (
            <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${t.lineSoft}` }}>
              <span style={{ fontSize: 12, color: t.ink }}>{row.label}</span>
              <Toggle value={row.value} onChange={v => updateSettings({ [row.key]: v })}/>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: t.inkDim, marginBottom: 8 }}>{fr ? 'Taille de police' : 'حجم الخط'}</div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: t.cardElev, borderRadius: 10 }}>
              {[{ id: 'small', fr: 'Petit' }, { id: 'medium', fr: 'Moyen' }, { id: 'large', fr: 'Grand' }].map(f => (
                <SegButton key={f.id} active={settings.fontSize === f.id} onClick={() => updateSettings({ fontSize: f.id as any })}>{f.fr}</SegButton>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: t.inkDim, marginBottom: 8 }}>{fr ? 'Espacement des lignes' : 'تباعد الأسطر'}</div>
            <div style={{ display: 'flex', gap: 4, padding: 4, background: t.cardElev, borderRadius: 10 }}>
              {[{ id: 'normal', fr: 'Normal' }, { id: 'comfortable', fr: 'Confortable' }, { id: 'large', fr: 'Large' }].map(s => (
                <SegButton key={s.id} active={(settings.lineSpacing ?? 'normal') === s.id} onClick={() => updateSettings({ lineSpacing: s.id as any })}>{s.fr}</SegButton>
              ))}
            </div>
          </div>
        </div>
        )} {/* end Accessibility conditional */}

        {/* Notifications — placeholder, real logic in Phase 4 */}
        {(activeSection === 'notifications' || narrow) && (
        <div style={card}>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
            {fr ? 'Notifications' : 'التنبيهات'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${t.lineSoft}` }}>
            <span style={{ fontSize: 12, color: t.ink }}>{fr ? 'Rappels quotidiens' : 'تذكيرات يومية'}</span>
            <Toggle value={settings.notifications} onChange={v => updateSettings({ notifications: v })}/>
          </div>
          {settings.notifications && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: t.inkDim, marginBottom: 8 }}>{fr ? 'Heure du rappel' : 'وقت التذكير'}</div>
              <input type="time" value={settings.dailyReminder} onChange={e => updateSettings({ dailyReminder: e.target.value })} style={inputStyle}/>
            </div>
          )}
        </div>
        )} {/* end Notifications conditional */}

        {/* General / Données */}
        {(activeSection === 'data' || narrow) && (
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
        )} {/* end data conditional */}
      </div> {/* end repeat-auto-fit cards grid */}

        </div> {/* end content area */}
      </div> {/* end 2-column grid */}

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
