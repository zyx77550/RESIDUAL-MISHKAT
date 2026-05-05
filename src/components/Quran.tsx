import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { List as VirtualList } from 'react-window';
import { usePinch } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Copy, X,
  Bookmark, BookMarked, ChevronLeft, ChevronRight, ChevronUp, AlertCircle,
  LayoutList, Volume2, VolumeX, Share2, Minus, Plus, Globe,
} from 'lucide-react';
import { IslamicLoader } from './IslamicLoader';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { supabase, QuranVerse } from '../lib/supabase';
import { SURAH_DATA } from '../types';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { useIsNarrow, useIsMobile } from './ui';
import { saveQuranPosition } from './Dashboard';

interface QuranProps {
  userData: UserData;
  lang: 'fr' | 'ar';
}

type BookmarkKey = `${number}:${number}`;

function loadBookmarks(): Set<BookmarkKey> {
  try {
    const raw = localStorage.getItem('mishkat_quran_bookmarks');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

const toArabicNum = (n: number) =>
  n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const GLOBAL_ITEM_HEIGHT = 114;

// Page de début dans le mushaf Madinah pour chaque sourate (1-114)
const SURAH_PAGES = [1, 2, 50, 77, 106, 128, 151, 177, 187, 208, 221, 235, 249, 255, 262, 267, 282, 293, 305, 312, 322, 332, 342, 350, 359, 367, 377, 385, 396, 404, 411, 415, 418, 428, 434, 440, 446, 453, 458, 467, 477, 483, 489, 496, 499, 502, 507, 511, 515, 518, 520, 523, 526, 528, 531, 534, 537, 542, 545, 549, 551, 553, 554, 556, 558, 560, 562, 564, 566, 568, 570, 572, 574, 575, 577, 578, 580, 582, 583, 585, 586, 587, 587, 589, 590, 591, 591, 592, 593, 594, 595, 595, 596, 596, 597, 597, 598, 598, 599, 599, 600, 600, 601, 601, 601, 602, 602, 602, 603, 603, 603, 604, 604, 604];
const surahPageStart = (id: number) => SURAH_PAGES[id - 1] ?? 1;
const surahPageEnd   = (id: number) => (id < 114 ? SURAH_PAGES[id] - 1 : 604);
const mushafSvgUrl   = (page: number) => `https://cdn.jsdelivr.net/gh/batoulapps/quran-svg@master/svg/${String(page).padStart(3, '0')}.svg`;

// ── Islamic SVG icon components ───────────────────────────────────

/** Marqueur de verset style étoile islamique à 8 branches — comme Quran.com / Tarteel */
function AyahBadge({ num, active, t, size = 34 }: {
  num: number; active?: boolean;
  t: ReturnType<typeof useT>; size?: number;
}) {
  // 8-pointed star polygon: two overlapping squares, r=46 outer, r=33 inner
  const pts = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * Math.PI) / 8 - Math.PI / 2;
    const r = i % 2 === 0 ? 46 : 33;
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(' ');
  const fill = active ? t.accent : 'none';
  const stroke = t.accent;
  const textColor = active ? '#1a0f00' : t.accent;
  const fs = num > 99 ? 22 : num > 9 ? 26 : 30;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} style={{ flexShrink: 0 }}>
      <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round"/>
      <text
        x="50" y="56"
        fontFamily="Amiri Quran, serif"
        fontSize={fs}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {toArabicNum(num)}
      </text>
    </svg>
  );
}

/** Séparateur décoratif islamique horizontal */
function OrnamentSeparator({ t }: { t: ReturnType<typeof useT> }) {
  const a = t.accent;
  const ab = t.accentBright;
  const bg = t.card;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 40" width="100%" height="28"
      style={{ display: 'block', overflow: 'visible' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="mf-sep-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={a} stopOpacity="0"/>
          <stop offset="25%" stopColor={a}/>
          <stop offset="50%" stopColor={ab}/>
          <stop offset="75%" stopColor={a}/>
          <stop offset="100%" stopColor={a} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <g transform="translate(150,20)">
        <rect x="-140" y="-1" width="280" height="2" fill="url(#mf-sep-g)"/>
        <path d="M-20,0 C-10,-11 10,-11 20,0 C10,11 -10,11 -20,0 Z" fill={bg} stroke={a} strokeWidth="1.5"/>
        <circle cx="0" cy="0" r="3.5" fill={a}/>
        <path d="M-40,0 L-30,-5 L-25,0 L-30,5 Z" fill={a}/>
        <path d="M40,0 L30,-5 L25,0 L30,5 Z" fill={a}/>
        <circle cx="-58" cy="0" r="2" fill={a}/>
        <circle cx="58" cy="0" r="2" fill={a}/>
        <circle cx="-74" cy="0" r="1.5" fill={a} opacity="0.55"/>
        <circle cx="74" cy="0" r="1.5" fill={a} opacity="0.55"/>
      </g>
    </svg>
  );
}


// ── GlobalRow ──────────────────────────────────────────────────────
interface GlobalRowProps {
  results: QuranVerse[];
  lang: 'fr' | 'ar';
  t: ReturnType<typeof useT>;
  onOpen: (surahId: number, ayahNumber: number) => void;
}

function GlobalRow({
  index, style, results, lang, t, onOpen,
}: { index: number; style: React.CSSProperties; ariaAttributes?: unknown } & GlobalRowProps) {
  const verse = results[index];
  const surah = SURAH_DATA.find(s => s.id === verse.surah_number);
  return (
    <div style={{ ...style, paddingBottom: 8, boxSizing: 'border-box' }}>
      <button
        onClick={() => onOpen(verse.surah_number, verse.ayah_number)}
        style={{
          width: '100%', height: GLOBAL_ITEM_HEIGHT - 10,
          background: t.card, border: `1px solid ${t.line}`, borderRadius: 12,
          padding: '10px 14px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: 4,
          overflow: 'hidden', textAlign: 'left', boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: t.accentBright, fontWeight: 700, letterSpacing: '0.1em' }}>
            {surah?.name} · {lang === 'fr' ? `v.${verse.ayah_number}` : `آية ${toArabicNum(verse.ayah_number)}`}
          </span>
          <span style={{ fontSize: 13, color: t.ink, fontFamily: 'Amiri Quran, serif' }}>
            {surah?.arabicName}
          </span>
        </div>
        <p style={{
          fontFamily: 'Amiri Quran, serif', fontSize: 16, direction: 'rtl', textAlign: 'right',
          color: t.ink, lineHeight: '1.7', overflow: 'hidden',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, flex: 1,
        }}>
          {verse.arabic_text}
        </p>
        <p style={{ fontSize: 11, color: t.inkDim, fontStyle: 'italic', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flexShrink: 0 }}>
          {verse.french_text}
        </p>
      </button>
    </div>
  );
}

// ── Surah nameplate using authentic frame SVG + decorative font ──
function SurahNameplate({ surahId, surahName, t }: {
  surahId: number; surahName: string; t: ReturnType<typeof useT>;
}) {
  const fontCode = `surah${String(surahId).padStart(3, '0')}`;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
    <div style={{ position: 'relative', width: '100%', maxWidth: 260 }}>
      <img
        src="/surah-frame.svg"
        alt=""
        aria-hidden="true"
        style={{
          width: '100%', display: 'block',
          filter: 'invert(1) sepia(1) saturate(3) hue-rotate(3deg) brightness(0.85)',
          mixBlendMode: 'screen',
          opacity: 0.88,
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        <div style={{
          fontFamily: '"SurahNameFont", "Amiri Quran", serif',
          fontSize: 18, color: t.accentBright, lineHeight: 1,
        }}>
          {fontCode}
        </div>
        <div style={{ fontSize: 7.5, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {surahName}
        </div>
      </div>
    </div>
    </div>
  );
}


// ── Surah prev / next navigation ─────────────────────────────────
function VerseNav({ currentSurahId, onNavigate, fr, t }: {
  currentSurahId: number;
  onNavigate: (id: number) => void;
  fr: boolean;
  t: ReturnType<typeof useT>;
}) {
  const prev = SURAH_DATA.find(s => s.id === currentSurahId - 1);
  const next = SURAH_DATA.find(s => s.id === currentSurahId + 1);
  if (!prev && !next) return null;
  const btnBase: React.CSSProperties = {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', borderRadius: 999,
    background: 'transparent', border: `1px solid ${t.line}`,
    cursor: 'pointer',
  };
  return (
    <div style={{ display: 'flex', gap: 8, paddingTop: 14 }}>
      {prev ? (
        <button onClick={() => onNavigate(prev.id)} style={btnBase}>
          <ChevronLeft size={13} style={{ color: t.accent, flexShrink: 0 }}/>
          <div style={{ minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontSize: 8.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 1 }}>
              {fr ? 'Précédent' : 'السابق'}
            </div>
            <div style={{ fontSize: 11, color: t.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {prev.name}
            </div>
          </div>
        </button>
      ) : <div style={{ flex: 1 }}/>}
      {next ? (
        <button onClick={() => onNavigate(next.id)} style={{ ...btnBase, justifyContent: 'flex-end' }}>
          <div style={{ minWidth: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 8.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 1 }}>
              {fr ? 'Suivant' : 'التالي'}
            </div>
            <div style={{ fontSize: 11, color: t.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {next.name}
            </div>
          </div>
          <ChevronRight size={13} style={{ color: t.accent, flexShrink: 0 }}/>
        </button>
      ) : <div style={{ flex: 1 }}/>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export const QuranSection = ({ userData, lang }: QuranProps) => {
  const t = useT();
  const narrow = useIsNarrow();
  const isMobile = useIsMobile();
  const fr = lang === 'fr';

  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [verses, setVerses]       = useState<QuranVerse[]>([]);
  const [loading, setLoading]     = useState(false);
  const [dbError, setDbError]     = useState<string | null>(null);
  const [surahSearch, setSurahSearch] = useState('');
  const [verseSearch, setVerseSearch] = useState('');
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<BookmarkKey>>(loadBookmarks);
  const [viewMode, setViewMode]   = useState<'list' | 'authentic'>('list');
  const [authenticPage, setAuthenticPage] = useState(1);
  const [readProgress, setReadProgress] = useState(0);
  const [mushafSelected, setMushafSelected] = useState<QuranVerse | null>(null);
  const [readingMode, setReadingMode] = useState<'default' | 'night' | 'flare'>('default');
  const [fontSize, setFontSize]   = useState(24);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shareRef = useRef<HTMLDivElement | null>(null);
  const [imgScale, setImgScale] = useState(1);

  const [globalMode, setGlobalMode] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<QuranVerse[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalSearched, setGlobalSearched] = useState(false);
  const [scrollToAyah, setScrollToAyah] = useState<number | null>(null);
  const [globalListHeight, setGlobalListHeight] = useState(500);
  const globalListContainerRef = useRef<HTMLDivElement>(null);

  const cache   = useRef<Map<number, QuranVerse[]>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);
  const baseFontRef = useRef(24);

  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 12 };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 14px 9px 36px',
    background: t.cardElev, border: `1px solid ${t.line}`,
    borderRadius: 10, color: t.ink, fontSize: 13, outline: 'none',
    boxSizing: 'border-box' as const,
  };
  const ctrlGroup: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 2,
    background: t.cardElev, border: `1px solid ${t.line}`,
    borderRadius: 9, padding: 3, flexShrink: 0,
  };

  const pinchBind = usePinch(({ offset: [scale], first }) => {
    if (viewMode === 'authentic') {
      setImgScale(Math.max(1, Math.min(2.5, scale)));
    } else {
      if (first) baseFontRef.current = fontSize;
      setFontSize(Math.max(16, Math.min(42, Math.round(baseFontRef.current * scale))));
    }
  }, { target: listRef, eventOptions: { passive: false } });

  const selectedSurah = selectedSurahId != null
    ? SURAH_DATA.find(s => s.id === selectedSurahId) ?? null
    : null;

  const fetchVerses = useCallback(async (surahId: number) => {
    if (cache.current.has(surahId)) { setVerses(cache.current.get(surahId)!); return; }
    setLoading(true); setDbError(null);
    const { data, error } = await supabase.from('quran_verses').select('*').eq('surah_number', surahId).order('ayah_number');
    setLoading(false);
    if (error) { setDbError(error.message); return; }
    cache.current.set(surahId, data ?? []);
    setVerses(data ?? []);
  }, []);

  useEffect(() => {
    if (!globalMode || globalQuery.trim().length < 2) { setGlobalResults([]); setGlobalSearched(false); return; }
    const q = globalQuery.trim();
    const timer = setTimeout(async () => {
      setGlobalLoading(true);
      const { data, error } = await supabase.from('quran_verses').select('*').or(`arabic_text.like.%${q}%,french_text.ilike.%${q}%`).limit(200);
      setGlobalLoading(false); setGlobalSearched(true);
      if (!error && data) setGlobalResults(data);
    }, 350);
    return () => clearTimeout(timer);
  }, [globalQuery, globalMode]);

  useLayoutEffect(() => {
    if (!globalMode) return;
    const el = globalListContainerRef.current;
    if (!el) return;
    const update = () => { const h = el.getBoundingClientRect().height; if (h > 0) setGlobalListHeight(h); };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [globalMode]);

  useEffect(() => {
    if (loading || scrollToAyah === null || verses.length === 0) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`verse-${scrollToAyah}`);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setScrollToAyah(null); }
    }, 200);
    return () => clearTimeout(timer);
  }, [loading, scrollToAyah, verses.length]);

  const openSurah = useCallback((id: number) => {
    setSelectedSurahId(id); setVerseSearch(''); setExpandedId(null);
    setMushafSelected(null); setAuthenticPage(surahPageStart(id)); setImgScale(1);
    fetchVerses(id); listRef.current?.scrollTo({ top: 0 });
    const s = SURAH_DATA.find(x => x.id === id);
    if (s) saveQuranPosition(id, s.name, 1);
  }, [fetchVerses]);

  const openSurahAtVerse = useCallback((surahId: number, ayahNumber: number) => {
    setScrollToAyah(ayahNumber); openSurah(surahId); setGlobalMode(false); setGlobalQuery('');
  }, [openSurah]);

  const goBack = () => { setSelectedSurahId(null); setVerses([]); setDbError(null); setVerseSearch(''); };

  const toggleBookmark = (surahNum: number, ayahNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const key: BookmarkKey = `${surahNum}:${ayahNum}`;
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      localStorage.setItem('mishkat_quran_bookmarks', JSON.stringify([...next]));
      return next;
    });
  };

  const copyVerse = async (v: QuranVerse, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(`${v.arabic_text}\n\n${v.french_text}`); toast.success(fr ? 'Verset copié !' : 'تم نسخ الآية!'); } catch {}
  };

  const playAudio = (v: QuranVerse, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === v.id) { audioRef.current?.pause(); setPlayingId(null); return; }
    if (audioRef.current) audioRef.current.pause();
    const prev = SURAH_DATA.slice(0, v.surah_number - 1).reduce((acc, s) => acc + s.verses, 0);
    const audio = new Audio(`https://cdn.islamic.network/quran/audio/128/ar.alafasy/${prev + v.ayah_number}.mp3`);
    audioRef.current = audio;
    audio.play().then(() => setPlayingId(v.id)).catch(() => toast.error('Audio indisponible'));
    audio.onended = () => setPlayingId(null);
  };

  const shareVerse = async (v: QuranVerse, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!shareRef.current) return;
    setMushafSelected(v);
    await new Promise(r => setTimeout(r, 100));
    try {
      const canvas = await html2canvas(shareRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      canvas.toBlob(blob => {
        if (!blob) return;
        if (navigator.share) { navigator.share({ files: [new File([blob], 'verse.png', { type: 'image/png' })] }).catch(() => {}); }
        else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'verse-mishkat.png'; a.click(); }
      });
      toast.success(fr ? 'Image générée !' : 'تم إنشاء الصورة!');
    } catch { toast.error('Erreur génération'); }
  };

  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return SURAH_DATA;
    const q = surahSearch.toLowerCase();
    return SURAH_DATA.filter(s => s.name.toLowerCase().includes(q) || s.arabicName.includes(surahSearch) || s.id.toString() === q);
  }, [surahSearch]);

  const filteredVerses = useMemo(() => {
    if (!verseSearch.trim()) return verses;
    const q = verseSearch.toLowerCase();
    return verses.filter(v => v.arabic_text.includes(verseSearch) || v.french_text.toLowerCase().includes(q) || v.ayah_number.toString() === q);
  }, [verseSearch, verses]);

  const globalRowData = useMemo<GlobalRowProps>(() => ({
    results: globalResults, lang, t, onOpen: openSurahAtVerse,
  }), [globalResults, lang, t, openSurahAtVerse]);

  const bookmarkCount = bookmarks.size;
  const userSurahStatus = (id: number) => userData.surahs.find(s => s.id === id)?.status ?? 'not_started';
  const statusColor: Record<string, string> = {
    memorized: t.accent, review: t.accentBright, in_progress: t.accentSoft, not_started: 'transparent',
  };

  // ── Surah list ────────────────────────────────────────────────────
  if (selectedSurahId === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
        <div style={{ flexShrink: 0, paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
                {fr ? '114 sourates · Hamidullah' : '١١٤ سورة · حميد الله'}
              </div>
              <h1 style={{ fontFamily: 'Amiri Quran, serif', fontSize: 38, color: t.ink, margin: 0, lineHeight: 1.2, direction: 'rtl' }}>
                القرآن الكريم
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <div style={{ ...card, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: t.accent, fontWeight: 300, lineHeight: 1 }}>{bookmarkCount}</div>
                <div style={{ fontSize: 9, color: t.inkMute, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 3 }}>{fr ? 'signets' : 'علامات'}</div>
              </div>
              <div style={{ ...card, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: t.accent, fontWeight: 300, lineHeight: 1 }}>
                  {userData.surahs.filter(s => s.status === 'memorized').length}
                </div>
                <div style={{ fontSize: 9, color: t.inkMute, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 3 }}>{fr ? 'mémorisées' : 'محفوظ'}</div>
              </div>
            </div>
          </div>

          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 4, background: t.cardElev, borderRadius: 10, padding: 3, marginBottom: 10 }}>
            {[
              { mode: false, icon: <BookOpen size={11}/>, label: fr ? 'Sourates' : 'السور' },
              { mode: true,  icon: <Globe size={11}/>,    label: fr ? 'Rechercher' : 'البحث' },
            ].map(({ mode, icon, label }) => (
              <button key={String(mode)} onClick={() => setGlobalMode(mode)} style={{
                flex: 1, padding: '8px 10px', borderRadius: 8,
                background: globalMode === mode ? t.accent : 'transparent',
                color: globalMode === mode ? '#1a0f00' : t.inkDim,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: t.inkMute, pointerEvents: 'none' }}/>
            <input
              value={globalMode ? globalQuery : surahSearch}
              onChange={e => globalMode ? setGlobalQuery(e.target.value) : setSurahSearch(e.target.value)}
              placeholder={globalMode
                ? (fr ? 'Rechercher dans les 6 236 versets…' : 'ابحث في ٦٢٣٦ آية…')
                : (fr ? 'Rechercher une sourate…' : 'ابحث عن سورة…')}
              style={inputStyle}
            />
            {(globalMode ? globalQuery : surahSearch) && (
              <button onClick={() => globalMode ? setGlobalQuery('') : setSurahSearch('')}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: t.inkMute, cursor: 'pointer', padding: 4 }}>
                <X size={12}/>
              </button>
            )}
          </div>
        </div>

        {/* Surah grid */}
        {!globalMode && (
          <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
            <div className="focus-container" style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 8, paddingBottom: 24 }}>
              {filteredSurahs.map(surah => {
                const status = userSurahStatus(surah.id);
                return (
                  <button
                    key={surah.id}
                    onClick={() => openSurah(surah.id)}
                    className="anim-border-draw focus-line"
                    style={{
                      ...card, padding: '12px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                      position: 'relative', overflow: 'hidden', transition: 'background 0.15s',
                    }}
                  >
                    {status !== 'not_started' && (
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: statusColor[status] }}/>
                    )}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Fraunces, serif', fontSize: 12, fontWeight: 300,
                      background: `${t.accent}14`, color: t.accent,
                    }}>
                      {surah.id}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 16, color: t.ink, direction: 'rtl', textAlign: 'right', lineHeight: 1.4 }}>
                        {surah.arabicName}
                      </div>
                      <div style={{ fontSize: 10, color: t.accentBright, fontWeight: 600, marginTop: 1 }}>
                        {surah.name}
                      </div>
                      <div style={{ fontSize: 9, color: t.inkMute, marginTop: 1 }}>
                        {surah.verses} {fr ? 'v.' : 'آية'} · Juz {surah.juz}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredSurahs.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
                  <BookOpen size={40} style={{ color: t.accent, opacity: 0.2, margin: '0 auto 12px', display: 'block' }}/>
                  <p style={{ fontSize: 13, color: t.inkMute }}>{fr ? 'Aucune sourate.' : 'لا توجد سورة.'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global search */}
        {globalMode && (
          <div ref={globalListContainerRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            {globalLoading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
                <IslamicLoader size={40} label={fr ? 'Recherche…' : 'جارٍ البحث…'} />
              </div>
            )}
            {!globalLoading && !globalSearched && globalQuery.trim().length < 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, textAlign: 'center', padding: '0 24px' }}>
                <Globe size={44} style={{ color: t.accent, opacity: 0.18 }} />
                <p style={{ fontSize: 13, color: t.inkMute, lineHeight: 1.6 }}>
                  {fr ? 'Tapez 2 caractères minimum pour chercher dans tout le Coran' : 'اكتب حرفين على الأقل للبحث في القرآن الكريم'}
                </p>
              </div>
            )}
            {!globalLoading && globalSearched && globalResults.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, gap: 10 }}>
                <AlertCircle size={40} style={{ color: t.accent, opacity: 0.2 }} />
                <p style={{ fontSize: 13, color: t.inkMute }}>{fr ? 'Aucun verset trouvé.' : 'لم يُعثر على آية.'}</p>
              </div>
            )}
            {!globalLoading && globalResults.length > 0 && (
              <>
                <p style={{ fontSize: 10, color: t.inkMute, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                  {fr
                    ? `${globalResults.length} résultat${globalResults.length > 1 ? 's' : ''}${globalResults.length === 200 ? ' (200 max)' : ''}`
                    : `${toArabicNum(globalResults.length)} نتيجة`}
                </p>
                <VirtualList<GlobalRowProps>
                  style={{ height: Math.max(globalListHeight - 26, 100) }}
                  rowCount={globalResults.length}
                  rowHeight={GLOBAL_ITEM_HEIGHT}
                  rowComponent={GlobalRow}
                  rowProps={globalRowData}
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Reading mode colours ──────────────────────────────────────────
  const readingBg    = readingMode === 'night' ? '#0d0b08' : readingMode === 'flare' ? '#fff8ee' : undefined;
  const readingInk   = readingMode === 'night' ? '#e8d8a0' : readingMode === 'flare' ? '#2a1800' : undefined;
  const readingMuted = readingMode === 'night' ? '#8a7a5a' : readingMode === 'flare' ? '#7a5830' : undefined;

  const onListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const pct = el.scrollHeight > el.clientHeight
      ? (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100 : 100;
    setReadProgress(Math.round(pct));
  };

  // ── Verse view ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0, ...(readingBg ? { background: readingBg, color: readingInk } : {}) }}>
      <div style={{ flexShrink: 0, paddingBottom: 14 }}>
        {/* Ligne 1 : retour + identité de la sourate */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button
            onClick={goBack}
            style={{ width: 34, height: 34, borderRadius: 8, background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ChevronLeft size={16}/>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedSurah?.name} · {selectedSurah?.verses} {fr ? 'v.' : 'آية'} · Juz {selectedSurah?.juz}
            </div>
            <h2 style={{ fontFamily: 'Amiri Quran, serif', fontSize: isMobile ? 24 : 28, color: readingInk ?? t.ink, margin: 0, lineHeight: 1.3, direction: 'rtl', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedSurah?.arabicName}
            </h2>
          </div>
        </div>

        {/* Ligne 2 : contrôles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {/* View mode */}
          <div style={ctrlGroup}>
            {([
              { mode: 'list',      label: fr ? 'Liste' : 'قائمة', icon: <LayoutList size={12}/> },
              { mode: 'authentic', label: fr ? 'Pages' : 'مصحف',  icon: <BookOpen size={12}/> },
            ] as const).map(({ mode, label, icon }) => (
              <button key={mode} onClick={() => {
                setViewMode(mode); setMushafSelected(null); setImgScale(1);
                if (mode === 'authentic' && selectedSurahId) setAuthenticPage(surahPageStart(selectedSurahId));
              }} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 7,
                background: viewMode === mode ? t.accent : 'transparent',
                color: viewMode === mode ? '#1a0f00' : t.inkDim,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {icon}
                {!narrow && <span>{label}</span>}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }}/>
          {/* Font size */}
          <div style={ctrlGroup}>
            <button onClick={() => setFontSize(s => Math.max(16, s - 2))} style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: t.inkDim, cursor: 'pointer', display: 'flex' }}><Minus size={11}/></button>
            <span style={{ fontSize: 10, fontWeight: 700, color: t.accent, minWidth: 18, textAlign: 'center' }}>{fontSize}</span>
            <button onClick={() => setFontSize(s => Math.min(42, s + 2))} style={{ padding: '4px 6px', background: 'transparent', border: 'none', color: t.inkDim, cursor: 'pointer', display: 'flex' }}><Plus size={11}/></button>
          </div>
          {/* Reading mode */}
          <div style={ctrlGroup}>
            {([['default','☀'], ['night','🌙'], ['flare','✨']] as const).map(([m, icon]) => (
              <button key={m} onClick={() => setReadingMode(m)} style={{
                width: 26, height: 26, borderRadius: 6,
                background: readingMode === m ? t.accent : 'transparent',
                border: 'none', cursor: 'pointer', fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }} title={m}>{icon}</button>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: t.inkMute, pointerEvents: 'none' }}/>
          <input value={verseSearch} onChange={e => setVerseSearch(e.target.value)}
            placeholder={fr ? 'Rechercher un verset, une traduction…' : 'ابحث في الآيات…'}
            style={inputStyle}/>
          {verseSearch && (
            <button onClick={() => setVerseSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: t.inkMute, cursor: 'pointer', padding: 4 }}>
              <X size={12}/>
            </button>
          )}
        </div>
      </div>

      {/* Guide de lecture + liste des versets */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 8 }}>
        {/* Barre de progression verticale */}
        <div className="anim-guide-track" style={{ height: 'auto', alignSelf: 'stretch', margin: '6px 0' }}>
          <div className="anim-guide-fill" style={{ height: `${readProgress}%` }}/>
        </div>

      <div ref={listRef} onScroll={onListScroll} style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 24, touchAction: 'pan-y' }} className="no-scrollbar">
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <IslamicLoader size={52} label={fr ? 'Chargement…' : 'جارٍ التحميل…'} />
          </div>
        )}
        {!loading && !dbError && verses.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12, textAlign: 'center' }}>
            <AlertCircle size={44} style={{ color: t.accent, opacity: 0.3 }}/>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>{fr ? 'Base de données vide' : 'قاعدة البيانات فارغة'}</p>
              <p style={{ fontSize: 11, color: t.inkMute, marginTop: 4 }}>{fr ? 'Lance npm run seed pour importer le Coran.' : 'شغّل npm run seed لاستيراد القرآن.'}</p>
            </div>
          </div>
        )}
        {!loading && dbError && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10 }}>
            <AlertCircle size={44} style={{ color: '#ef4444', opacity: 0.5 }}/>
            <p style={{ fontSize: 12, color: '#ef4444' }}>{dbError}</p>
          </div>
        )}

        {/* ── LIST MODE ── */}
        {viewMode === 'list' && !loading && !dbError && filteredVerses.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
            style={{ background: readingBg ?? t.card, border: `1px solid ${t.line}`, borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}
          >
            {/* List header */}
            <div style={{ padding: '14px 22px', borderBottom: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(180deg, ${t.accent}08, transparent)` }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 17, color: readingInk ?? t.ink, fontWeight: 300 }}>
                {verseSearch
                  ? (fr ? `${filteredVerses.length} résultat${filteredVerses.length > 1 ? 's' : ''}` : `${filteredVerses.length} نتيجة`)
                  : (fr ? `${filteredVerses.length} versets` : `${filteredVerses.length} آية`)}
              </span>
              <span style={{ fontSize: 11, color: readingMuted ?? t.inkDim }}>Juz {selectedSurah?.juz}</span>
            </div>

            {/* Basmala */}
            {selectedSurahId !== 9 && !verseSearch && (
              <div style={{ padding: '20px 36px 16px', textAlign: 'center', borderBottom: `1px solid ${t.line}` }}>
                <div style={{
                  display: 'inline-block', padding: '10px 28px',
                  border: `1px solid ${t.line}`, borderRadius: 10,
                  background: `${t.accent}07`,
                }}>
                  <div className="anim-reading" style={{ fontFamily: 'Amiri Quran, serif', fontSize: 26, direction: 'rtl', lineHeight: 1.8 }}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                </div>
              </div>
            )}

            {filteredVerses.map((verse, vIdx) => {
              const key: BookmarkKey = `${verse.surah_number}:${verse.ayah_number}`;
              const isBookmarked = bookmarks.has(key);
              const isSelected = expandedId === verse.id;
              const delayClass = vIdx < 6 ? `anim-d${vIdx + 1}` : '';
              return (
                <div
                  id={`verse-${verse.ayah_number}`}
                  key={verse.id}
                  className={`anim-materialise ${delayClass}`}
                  onClick={() => { setExpandedId(isSelected ? null : verse.id); saveQuranPosition(verse.surah_number, selectedSurah?.name ?? '', verse.ayah_number); }}
                  style={{ padding: '20px 20px 20px 26px', borderBottom: `1px solid ${t.lineSoft}`, background: isSelected ? `${t.accent}07` : 'transparent', position: 'relative', cursor: 'pointer', transition: 'background 0.15s' }}
                >
                  {/* Selected left bar */}
                  {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: t.accent }}/>}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                    {/* Verse number — AyahBadge */}
                    <AyahBadge num={verse.ayah_number} active={isSelected} t={t} size={32}/>

                    {/* Text content */}
                    <div style={{ flex: 1, textAlign: 'right', direction: 'rtl' }}>
                      <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: fontSize, lineHeight: 2.2, color: readingInk ?? t.ink }}>
                        {verse.arabic_text}
                      </div>
                      {isSelected && (
                        <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 13, color: readingMuted ?? t.inkDim, marginTop: 10, lineHeight: 1.7, direction: 'ltr', textAlign: 'left' }}>
                          {verse.french_text}
                        </div>
                      )}
                    </div>

                    {/* Bookmark indicator (always) */}
                    {!isSelected && (
                      <div style={{ opacity: isBookmarked ? 0.55 : 0, transition: 'opacity 0.15s', flexShrink: 0, paddingTop: 4 }}>
                        <BookMarked size={12} style={{ color: t.accentBright }}/>
                      </div>
                    )}
                  </div>

                  {/* Action pills — shown only when selected */}
                  {isSelected && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.lineSoft}` }}>
                      {([
                        { icon: playingId === verse.id ? <VolumeX size={13}/> : <Volume2 size={13}/>, fn: (e: React.MouseEvent) => playAudio(verse, e), active: playingId === verse.id },
                        { icon: <Copy size={13}/>, fn: (e: React.MouseEvent) => copyVerse(verse, e), active: false },
                        { icon: <Share2 size={13}/>, fn: (e: React.MouseEvent) => shareVerse(verse, e), active: false },
                        { icon: isBookmarked ? <BookMarked size={13}/> : <Bookmark size={13}/>, fn: (e: React.MouseEvent) => toggleBookmark(verse.surah_number, verse.ayah_number, e), active: isBookmarked },
                      ] as const).map((btn, i) => (
                        <button
                          key={i}
                          onClick={btn.fn}
                          className={btn.active && i === 0 ? 'anim-pulse' : ''}
                          style={{
                            width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: btn.active ? `${t.accent}18` : t.cardElev,
                            border: `1px solid ${btn.active ? t.accent : t.line}`,
                            color: btn.active ? t.accent : t.inkDim,
                            cursor: 'pointer',
                          }}
                        >
                          {btn.icon}
                        </button>
                      ))}
                      <div style={{ flex: 1 }}/>
                      <span style={{ fontSize: 9.5, color: t.inkMute, alignSelf: 'center', letterSpacing: '0.1em' }}>
                        {selectedSurah?.name} · {fr ? `v.${verse.ayah_number}` : `آية ${toArabicNum(verse.ayah_number)}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            <div style={{ padding: '8px 24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <OrnamentSeparator t={t}/>
              <span style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.5 }}>
                {fr ? `${filteredVerses.length} versets` : `${filteredVerses.length} آية`}
              </span>
            </div>
          </motion.div>
        )}

        {/* ── AUTHENTIC MUSHAF MODE ── */}
        {viewMode === 'authentic' && selectedSurahId !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>

            {/* Surah nameplate */}
            {selectedSurah && (
              <SurahNameplate surahId={selectedSurah.id} surahName={selectedSurah.name} t={t}/>
            )}

            {/* Page image — full width */}
            <div style={{
              position: 'relative', borderRadius: 12, overflow: 'hidden',
              width: '100%',
              boxShadow: '0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,166,74,0.2)',
            }}>
              <div
                style={{ background: '#f5efe0', borderRadius: 12, overflow: 'hidden' }}
                onDoubleClick={() => setImgScale(1)}
              >
                <img
                  src={mushafSvgUrl(authenticPage)}
                  alt={`Mushaf page ${authenticPage}`}
                  style={{
                    width: '100%', height: 'auto', display: 'block',
                    transform: `scale(${imgScale})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease',
                    touchAction: 'none',
                  }}
                  loading="eager"
                />
              </div>
              {/* Page number */}
              <div style={{
                position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(26,15,0,0.82)', borderRadius: 99,
                padding: '3px 14px', fontSize: 11, color: '#d4a64a',
                fontFamily: 'Fraunces, serif', letterSpacing: '0.14em', whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}>
                {fr ? `Page ${authenticPage}` : `صفحة ${toArabicNum(authenticPage)}`}
              </div>
              {/* Zoom hint */}
              {imgScale > 1 && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(26,15,0,0.75)', borderRadius: 99,
                  padding: '3px 10px', fontSize: 10, color: '#d4a64a',
                  fontFamily: 'Fraunces, serif',
                }}>
                  ×{imgScale.toFixed(1)}
                </div>
              )}
            </div>

            {/* Navigation page */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <button
                onClick={() => { setAuthenticPage(p => Math.max(surahPageStart(selectedSurahId), p - 1)); setImgScale(1); listRef.current?.scrollTo({ top: 0 }); }}
                disabled={authenticPage <= surahPageStart(selectedSurahId)}
                style={{ width: 40, height: 40, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.cardElev, border: `1px solid ${t.line}`, color: authenticPage <= surahPageStart(selectedSurahId) ? t.inkMute : t.ink, cursor: authenticPage <= surahPageStart(selectedSurahId) ? 'default' : 'pointer', opacity: authenticPage <= surahPageStart(selectedSurahId) ? 0.35 : 1 }}
              >
                <ChevronLeft size={16}/>
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: t.accent, fontFamily: 'Fraunces, serif', fontWeight: 300 }}>
                  {authenticPage} / {surahPageEnd(selectedSurahId)}
                </div>
                <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.1em', marginTop: 2 }}>
                  {fr ? 'Complexe du Roi Fahd · Médine' : 'مجمع الملك فهد · المدينة'}
                </div>
              </div>
              <button
                onClick={() => { setAuthenticPage(p => Math.min(surahPageEnd(selectedSurahId), p + 1)); setImgScale(1); listRef.current?.scrollTo({ top: 0 }); }}
                disabled={authenticPage >= surahPageEnd(selectedSurahId)}
                style={{ width: 40, height: 40, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.cardElev, border: `1px solid ${t.line}`, color: authenticPage >= surahPageEnd(selectedSurahId) ? t.inkMute : t.ink, cursor: authenticPage >= surahPageEnd(selectedSurahId) ? 'default' : 'pointer', opacity: authenticPage >= surahPageEnd(selectedSurahId) ? 0.35 : 1 }}
              >
                <ChevronRight size={16}/>
              </button>
            </div>

            {/* Versets de la sourate — accessibles depuis ce mode */}
            {!loading && !dbError && verses.length > 0 && (
              <div style={{ ...card, overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    {fr ? `${verses.length} versets` : `${toArabicNum(verses.length)} آية`}
                  </span>
                  <span style={{ fontFamily: 'Amiri Quran, serif', fontSize: 15, color: t.accentBright }}>
                    {selectedSurah?.arabicName}
                  </span>
                </div>
                {verses.map((verse, idx) => {
                  const isExp = expandedId === verse.id;
                  return (
                    <div key={verse.id}
                      onClick={() => setExpandedId(isExp ? null : verse.id)}
                      style={{ padding: '14px 18px', borderBottom: idx < verses.length - 1 ? `1px solid ${t.lineSoft}` : 'none', cursor: 'pointer', background: isExp ? `${t.accent}06` : 'transparent', transition: 'background 0.15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <AyahBadge num={verse.ayah_number} active={isExp} t={t} size={28}/>
                        <div style={{ flex: 1, fontFamily: 'Amiri Quran, serif', fontSize: Math.max(fontSize, 20), color: isExp ? t.accentBright : t.ink, direction: 'rtl', textAlign: 'right', lineHeight: 1.9 }}>
                          {verse.arabic_text}
                        </div>
                      </div>
                      {isExp && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.lineSoft}` }}>
                          <p style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 13, color: t.inkDim, lineHeight: 1.75 }}>
                            {verse.french_text}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Surah navigation */}
        {!loading && !dbError && selectedSurahId !== null && (
          <VerseNav
            currentSurahId={selectedSurahId}
            onNavigate={openSurah}
            fr={fr}
            t={t}
          />
        )}
      </div>
      {/* Fin guide-track + listRef wrapper */}
      </div>

      {/* Hidden share card */}
      <div ref={shareRef} style={{ position: 'fixed', top: -9999, left: -9999, zIndex: -1, width: 480, padding: '32px 36px', background: readingBg ?? t.card, borderRadius: 20, fontFamily: 'Amiri Quran, serif' }}>
        {mushafSelected && (
          <>
            <p style={{ fontSize: 11, color: t.accentBright, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
              {selectedSurah?.name} · {fr ? `Verset ${mushafSelected.ayah_number}` : `آية ${toArabicNum(mushafSelected.ayah_number)}`}
            </p>
            <p style={{ fontSize: 26, direction: 'rtl', textAlign: 'right', color: readingInk ?? t.ink, lineHeight: '2.2', marginBottom: 20 }}>{mushafSelected.arabic_text}</p>
            <p style={{ fontSize: 14, color: readingMuted ?? t.inkDim, lineHeight: '1.7', fontStyle: 'italic', fontFamily: 'Fraunces, serif' }}>« {mushafSelected.french_text} »</p>
            <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: t.inkMute, fontFamily: 'Inter, sans-serif', letterSpacing: '0.15em' }}>مِشْكَاة · mishkat</span>
              <span style={{ fontSize: 14, color: t.accent, fontFamily: 'Amiri Quran, serif' }}>القرآن الكريم</span>
            </div>
          </>
        )}
      </div>

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ position: 'fixed', bottom: 84, right: 14, zIndex: 40, width: 36, height: 36, borderRadius: '50%', background: t.accent, color: '#1a0f00', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        title={fr ? 'Haut de page' : 'أعلى الصفحة'}
      >
        <ChevronUp size={16}/>
      </motion.button>
    </div>
  );
};
