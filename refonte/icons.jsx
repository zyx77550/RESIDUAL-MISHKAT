// ═══════════════════════════════════════════════════════════════
// ICONS — minimal stroke icons, all 1.6 stroke
// ═══════════════════════════════════════════════════════════════

const Icon = ({ d, size = 16, stroke = 1.6, fill = 'none', style, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color, ...style }}>{d}</svg>
);

const Icons = {
  book: <><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M4 16a4 4 0 0 1 4-4h12"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
  target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
  badge: <><circle cx="12" cy="9" r="6"/><path d="M8 14l-2 7 6-3 6 3-2-7"/></>,
  beads: <><circle cx="6" cy="12" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7.5 10.5l3-3M13.5 7.5l3 3M16.5 13.5l-3 3M10.5 16.5l-3-3"/></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2v-1a2 2 0 0 1 2-2h2a3 3 0 0 0 3-3 9 9 0 0 0-9-10z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="11" cy="7" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/></>,
  chart: <><path d="M4 20V8M10 20V4M16 20v-8M22 20H2"/></>,
  bookmark: <><path d="M6 3h12v18l-6-4-6 4z"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></>,
  flame: <><path d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-2-4 0 2-1 3-2 3-1 0-2-1-2-3 0-2 2-3 2-5z"/></>,
  moon: <><path d="M20 14a8 8 0 1 1-9-10 6 6 0 0 0 9 10z"/></>,
  sparkle: <><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/></>,
  check: <><path d="M5 12l4 4 10-10"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  arrow: <><path d="M5 12h14M13 5l7 7-7 7"/></>,
  arrowDown: <><path d="M12 5v14M5 13l7 7 7-7"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></>,
  filter: <><path d="M3 5h18M6 12h12M10 19h4"/></>,
  edit: <><path d="M16 3l5 5L8 21H3v-5z"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M5 6l1 14h12l1-14"/></>,
  play: <><path d="M6 4l14 8-14 8z" fill="currentColor"/></>,
  pause: <><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></>,
  rotate: <><path d="M3 12a9 9 0 1 0 3-7M3 5v5h5"/></>,
  more: <><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>,
  star: <><path d="M12 3l2.7 6 6.3.6-4.8 4.3 1.5 6.3L12 17l-5.7 3.2 1.5-6.3L3 9.6l6.3-.6z"/></>,
  trophy: <><path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 6H4v3a3 3 0 0 0 3 3M16 6h4v3a3 3 0 0 1-3 3M10 14h4v4l2 2H8l2-2z"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-7 8-7s7 2 8 7"/></>,
  bell: <><path d="M6 8a6 6 0 1 1 12 0c0 5 2 7 2 7H4s2-2 2-7zM10 20a2 2 0 0 0 4 0"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
  download: <><path d="M12 3v12M6 11l6 6 6-6M4 21h16"/></>,
  upload: <><path d="M12 21V9M6 13l6-6 6 6M4 3h16"/></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>,
  shield: <><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></>,
  refresh: <><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></>,
  pen: <><path d="M14 4l6 6L8 22H2v-6z"/></>,
  layers: <><path d="M12 2l10 6-10 6L2 8z"/><path d="M2 14l10 6 10-6M2 11l10 6 10-6"/></>,
  grid: <><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
  heart: <><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 7a5.5 5.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z"/></>,
  wind: <><path d="M3 8h12a3 3 0 1 0-3-3M3 12h17a3 3 0 1 1-3 3M3 16h10"/></>,
};

// Lantern logo (re-used in sidebar)
const LanternMark = ({ size = 32, color = '#d4a64a' }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <path d="M32 6 L32 12" stroke={color} strokeWidth="1.4" />
    <path d="M22 14 L42 14" stroke={color} strokeWidth="1.4" />
    <path d="M22 14 Q22 28 18 38 L46 38 Q42 28 42 14 Z" stroke={color} strokeWidth="1.4" fill={`${color}15`} />
    <path d="M32 18 L36 28 L46 28 L38 34 L41 44 L32 38 L23 44 L26 34 L18 28 L28 28 Z" fill={color} opacity="0.55" />
    <path d="M18 38 L46 38 L44 46 L20 46 Z" stroke={color} strokeWidth="1.4" />
    <path d="M28 46 L36 46 L34 54 L30 54 Z" stroke={color} strokeWidth="1.4" />
    <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="0.4" opacity="0.3" fill="none" />
  </svg>
);

// Wordmark Mishkat (reused in some headers)
const Wordmark = ({ size = 1, color = '#f5e9d0', accent = '#d4a64a' }) => (
  <svg width={140 * size} height={36 * size} viewBox="0 0 140 36" fill="none">
    <text x="0" y="22" fontFamily="Fraunces, serif" fontWeight="300" fontSize="22" fill={color} letterSpacing="-0.5">Mishkat</text>
    <circle cx="98" cy="13" r="2" fill={accent} />
    <text x="105" y="22" fontFamily="Fraunces, serif" fontStyle="italic" fontWeight="300" fontSize="14" fill={accent}>مِشكاة</text>
    <line x1="0" y1="28" x2="140" y2="28" stroke={accent} strokeWidth="0.4" opacity="0.4"/>
  </svg>
);

Object.assign(window, { Icon, Icons, LanternMark, Wordmark });
