// ═══════════════════════════════════════════════════════════════
// SHARED PRIMITIVES — work in any theme via the `t` prop
// ═══════════════════════════════════════════════════════════════

const ThemeContext = React.createContext(THEMES.gold);
const useT = () => React.useContext(ThemeContext);

// Geometric ornament
const Geo = ({ size = 60, t, sw = 0.8, opacity = 1 }) => {
  const theme = t || useT();
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" stroke={theme.accentSoft} strokeWidth={sw} style={{ opacity }}>
      <rect x="10" y="10" width="40" height="40" />
      <rect x="10" y="10" width="40" height="40" transform="rotate(45 30 30)" />
      <circle cx="30" cy="30" r="14" />
    </svg>
  );
};

// Sidebar — réutilisé sur tous les écrans
const AppSidebar = ({ active = 'dashboard' }) => {
  const t = useT();
  const items = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <Icon d={<><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></>} /> },
    { id: 'memo', label: 'Mémorisation', icon: <Icon d={Icons.book} /> },
    { id: 'cal', label: 'Calendrier', icon: <Icon d={Icons.calendar} /> },
    { id: 'goals', label: 'Objectifs', icon: <Icon d={Icons.target} /> },
    { id: 'badges', label: 'Badges', icon: <Icon d={Icons.badge} /> },
    { id: 'tasbih', label: 'Tasbih', icon: <Icon d={Icons.beads} /> },
    { id: 'coloring', label: 'Coloriage', icon: <Icon d={Icons.palette} /> },
    { id: 'diftar', label: 'Diftar', icon: <Icon d={<><path d="M5 4h14v16H5z"/><path d="M9 8h6M9 12h6M9 16h4"/></>} /> },
    { id: 'kanban', label: 'Suivi', icon: <Icon d={Icons.chart} /> },
    { id: 'albaqara', label: 'Al-Baqarah', icon: <Icon d={Icons.bookmark} /> },
    { id: 'settings', label: 'Réglages', icon: <Icon d={Icons.settings} /> },
    { id: 'admin', label: 'Admin', icon: <Icon d={<><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></>} /> },
  ];
  return (
    <aside style={{
      width: 220, padding: '20px 12px', background: t.bgSoft,
      borderRight: `1px solid ${t.line}`, display: 'flex', flexDirection: 'column', gap: 18,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px' }}>
        <LanternMark size={30} color={t.accent} />
        <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 12, color: t.ink, letterSpacing: '0.32em', textTransform: 'uppercase' }}>Mishkat</div>
      </div>
      <div style={{
        margin: '0 2px', padding: '10px 12px', borderRadius: 9,
        background: `linear-gradient(140deg, ${t.accent}1a, ${t.accent}08)`,
        border: `1px solid ${t.accent}33`, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <Icon d={Icons.flame} size={17} stroke={1.8} fill={t.accent} style={{ color: t.accent }} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontFamily: 'Fraunces', fontWeight: 400, fontSize: 19, color: t.ink, letterSpacing: '-0.02em' }}>{SAMPLE.streak}</div>
          <div style={{ fontSize: 9, color: t.inkDim, marginTop: 2, letterSpacing: '0.14em', textTransform: 'uppercase' }}>jours de suite</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }} className="artboard-scroll">
        {items.map(it => {
          const on = it.id === active;
          return (
            <div key={it.id} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '8px 11px', borderRadius: 7,
              background: on ? `${t.accent}14` : 'transparent',
              color: on ? t.ink : t.inkDim,
              fontFamily: 'Inter', fontSize: 12.5, fontWeight: on ? 500 : 400,
              position: 'relative', cursor: 'pointer',
            }}>
              {on && <div style={{ position: 'absolute', left: -12, top: 8, bottom: 8, width: 2, background: t.accent, borderRadius: 2 }} />}
              <span style={{ color: on ? t.accent : t.inkMute, display: 'inline-flex' }}>{it.icon}</span>
              {it.label}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

// Frame: full screen with sidebar + content area
const AppFrame = ({ active, title, subtitle, headerRight, children }) => {
  const t = useT();
  return (
    <div style={{ width: 1280, height: 820, background: t.bg, color: t.ink, display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none' }}>
        <defs>
          <pattern id={`pat-${t.name}`} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect x="20" y="20" width="40" height="40" fill="none" stroke={t.accent} strokeWidth="0.5" />
            <rect x="20" y="20" width="40" height="40" fill="none" stroke={t.accent} strokeWidth="0.5" transform="rotate(45 40 40)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#pat-${t.name})`} />
      </svg>
      <AppSidebar active={active} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '26px 34px 36px', position: 'relative' }} className="artboard-scroll">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
          <div>
            {subtitle && <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>{subtitle}</div>}
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, margin: 0, color: t.ink, letterSpacing: '-0.02em' }}>{title}</h1>
          </div>
          {headerRight}
        </div>
        {children}
      </main>
    </div>
  );
};

// Card primitive
const Card = ({ children, padding = '20px 22px', style }) => {
  const t = useT();
  return <div style={{ padding, background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, ...style }}>{children}</div>;
};

const Pill = ({ children, style }) => {
  const t = useT();
  return <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: `${t.accent}18`, border: `1px solid ${t.accent}33`, borderRadius: 999, fontSize: 10.5, color: t.accentBright, fontFamily: 'Inter', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, ...style }}>{children}</div>;
};

const PrimaryBtn = ({ children, icon, style }) => {
  const t = useT();
  return <button style={{ padding: '11px 20px', borderRadius: 10, border: 'none', background: t.accent, color: '#1a0f00', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>{children}{icon}</button>;
};

const GhostBtn = ({ children, icon, style }) => {
  const t = useT();
  return <button style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${t.line}`, background: 'transparent', color: t.ink, fontFamily: 'Inter', fontWeight: 500, fontSize: 12.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>{icon}{children}</button>;
};

const SectionLabel = ({ children, right }) => {
  const t = useT();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{children}</div>
      {right}
    </div>
  );
};

Object.assign(window, { ThemeContext, useT, Geo, AppSidebar, AppFrame, Card, Pill, PrimaryBtn, GhostBtn, SectionLabel });
