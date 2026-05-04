import React, { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { List as VirtualList } from 'react-window';
import { usePinch } from '@use-gesture/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Copy, X,
  Bookmark, BookMarked, ChevronLeft, ChevronRight, ChevronUp, AlertCircle,
  LayoutList, BookText, Volume2, VolumeX, Share2, Minus, Plus, Globe,
} from 'lucide-react';
import { IslamicLoader } from './IslamicLoader';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { supabase, QuranVerse } from '../lib/supabase';
import { SURAH_DATA } from '../types';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { useIsNarrow } from './ui';
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
const VERSES_PER_PAGE = 12;

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

// ── Mushaf decorative SVG frame ──────────────────────────────────
function MushafFrame({ children, t, page, totalPages }: {
  children: React.ReactNode;
  t: ReturnType<typeof useT>;
  page?: number;
  totalPages?: number;
}) {
  const narrow = useIsNarrow();
  const a = t.accent;
  const ab = t.accentBright;
  const as_ = t.accentSoft;
  const bg = t.card;
  const ln = t.line;
  const pgNum = page !== undefined ? page + 1 : undefined;

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', minHeight: 200 }}>
      {/* SVG frame — preserveAspectRatio="none" stretches to fill any container */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 1200"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mfr-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={ab}/>
            <stop offset="25%" stopColor={a}/>
            <stop offset="50%" stopColor={ab}/>
            <stop offset="75%" stopColor={as_}/>
            <stop offset="100%" stopColor={a}/>
          </linearGradient>

          <pattern id="mfr-bp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="transparent"/>
            <path d="M0,0 L60,60 M60,0 L0,60" stroke={ln} strokeWidth="3"/>
            <g stroke={a} strokeWidth="1.5" fill="none">
              <polygon points="30,5 55,30 30,55 5,30"/>
              <polygon points="12,12 48,12 48,48 12,48"/>
            </g>
            <circle cx="30" cy="30" r="10" fill={a}/>
            <circle cx="30" cy="30" r="6" fill={bg}/>
            <circle cx="30" cy="30" r="2" fill={a}/>
            <path d="M30,0 L30,5 M30,55 L30,60 M0,30 L5,30 M55,30 L60,30" stroke={a} strokeWidth="2"/>
          </pattern>

          <g id="mfr-cb">
            <rect width="60" height="60" fill={bg}/>
            <rect x="2" y="2" width="56" height="56" fill="none" stroke={a} strokeWidth="1.5"/>
            <rect x="6" y="6" width="48" height="48" fill="none" stroke={a} strokeWidth="0.8"/>
            <g transform="translate(30,30)">
              <polygon points="0,-20 14,-14 20,0 14,14 0,20 -14,14 -20,0 -14,-14" fill={a}/>
              <circle cx="0" cy="0" r="8" fill={bg}/>
              <circle cx="0" cy="0" r="3" fill={a}/>
              <path d="M0,-20 L0,-26 M20,0 L26,0 M0,20 L0,26 M-20,0 L-26,0" stroke={a} strokeWidth="1.5"/>
              <path d="M14,-14 L18,-18 M14,14 L18,18 M-14,14 L-18,18 M-14,-14 L-18,-18" stroke={a} strokeWidth="1.5"/>
            </g>
          </g>

          <g id="mfr-ic">
            <path d="M0,60 A60 60 0 0 1 60,0 L0,0 Z" fill={a}/>
            <path d="M0,55 A55 55 0 0 1 55,0 L0,0 Z" fill={bg}/>
            <path d="M0,45 A45 45 0 0 1 45,0 L0,0 Z" fill="none" stroke={a} strokeWidth="1.5"/>
            <path d="M0,35 A35 35 0 0 1 35,0 L0,0 Z" fill={a}/>
            <circle cx="15" cy="15" r="4" fill={bg}/>
            <circle cx="25" cy="25" r="3" fill={bg}/>
            <circle cx="35" cy="10" r="2" fill={bg}/>
            <circle cx="10" cy="35" r="2" fill={bg}/>
          </g>

          <g id="mfr-med">
            <path d="M0,-60 C20,-60 50,-20 60,0 C50,20 20,60 0,60 Z" fill={bg} stroke={a} strokeWidth="2.5"/>
            <path d="M0,-50 C15,-50 40,-15 48,0 C40,15 15,50 0,50 Z" fill={a}/>
            <circle cx="15" cy="0" r="10" fill={bg}/>
            <circle cx="15" cy="0" r="5" fill={a}/>
          </g>
        </defs>

        {/* Watermark discret */}
        <g transform="translate(400,600) scale(4)" opacity="0.03">
          <rect x="-30" y="-30" width="60" height="60" fill={a}/>
          <rect x="-30" y="-30" width="60" height="60" fill={a} transform="rotate(45)"/>
          <circle cx="0" cy="0" r="15" fill={a}/>
        </g>

        {/* Lignes extérieures */}
        <rect x="26" y="46" width="748" height="1108" fill="none" stroke={a} strokeWidth="0.8"/>
        <rect x="30" y="50" width="740" height="1100" fill="none" stroke={ln} strokeWidth="2"/>
        <rect x="35" y="55" width="730" height="1090" fill="none" stroke={a} strokeWidth="0.8"/>
        <rect x="40" y="60" width="720" height="1080" fill="none" stroke={a} strokeWidth="3.5"/>

        {/* Bande géométrique */}
        <path d="M40,60 h720 v1080 h-720 v-1080 M100,120 v960 h600 v-960 h-600" fill="url(#mfr-bp)" fillRule="evenodd"/>

        {/* Blocs d'angle */}
        <use href="#mfr-cb" x={40} y={60}/>
        <use href="#mfr-cb" x={700} y={60}/>
        <use href="#mfr-cb" x={40} y={1080}/>
        <use href="#mfr-cb" x={700} y={1080}/>

        {/* Lignes intérieures */}
        <rect x="100" y="120" width="600" height="960" fill="none" stroke={a} strokeWidth="3.5"/>
        <rect x="105" y="125" width="590" height="950" fill="none" stroke={a} strokeWidth="0.8"/>
        <rect x="110" y="130" width="580" height="940" fill="none" stroke={ln} strokeWidth="1.5"/>
        <rect x="114" y="134" width="572" height="932" fill="none" stroke={a} strokeWidth="0.8"/>

        {/* Angles intérieurs tezhib */}
        <use href="#mfr-ic" transform="translate(114,134)"/>
        <use href="#mfr-ic" transform="translate(686,134) scale(-1,1)"/>
        <use href="#mfr-ic" transform="translate(114,1066) scale(1,-1)"/>
        <use href="#mfr-ic" transform="translate(686,1066) scale(-1,-1)"/>

        {/* Médaillons latéraux */}
        <use href="#mfr-med" transform="translate(760,600)"/>
        <use href="#mfr-med" transform="translate(40,600) scale(-1,1)"/>

        {/* Cartouche supérieur (décoratif) */}
        <g transform="translate(0,15)">
          <path d="M180,160 L620,160 L650,200 L620,240 L180,240 L150,200 Z" fill={bg} stroke={a} strokeWidth="3.5"/>
          <path d="M184,166 L616,166 L642,200 L616,234 L184,234 L158,200 Z" fill="none" stroke={a} strokeWidth="1.2"/>
          <circle cx="170" cy="200" r="4" fill={a}/>
          <circle cx="630" cy="200" r="4" fill={a}/>
        </g>

        {/* Cartouche inférieur — numéro de page */}
        <g>
          <path d="M320,1020 L480,1020 L500,1040 L480,1060 L320,1060 L300,1040 Z" fill={bg} stroke={a} strokeWidth="2.5"/>
          <path d="M324,1024 L476,1024 L492,1040 L476,1056 L324,1056 L308,1040 Z" fill="none" stroke={a} strokeWidth="0.8"/>
          {pgNum !== undefined && (
            <text x="400" y="1047" fontFamily="Fraunces, serif" fontSize="18" fill={a} textAnchor="middle" fontWeight="300">
              {totalPages ? `${pgNum} / ${totalPages}` : String(pgNum)}
            </text>
          )}
        </g>
      </svg>

      {/* Contenu — padding calibré sur l'espace intérieur du cadre */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: narrow ? '44px 24px 40px' : '52px 70px 48px',
      }}>
        {children}
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
  const fr = lang === 'fr';

  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [verses, setVerses]       = useState<QuranVerse[]>([]);
  const [loading, setLoading]     = useState(false);
  const [dbError, setDbError]     = useState<string | null>(null);
  const [surahSearch, setSurahSearch] = useState('');
  const [verseSearch, setVerseSearch] = useState('');
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<BookmarkKey>>(loadBookmarks);
  const [viewMode, setViewMode]   = useState<'list' | 'mushaf'>('list');
  const [mushafSelected, setMushafSelected] = useState<QuranVerse | null>(null);
  const [mushafPage, setMushafPage] = useState(0);
  const [readingMode, setReadingMode] = useState<'default' | 'night' | 'flare'>('default');
  const [fontSize, setFontSize]   = useState(24);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shareRef = useRef<HTMLDivElement | null>(null);

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
    if (first) baseFontRef.current = fontSize;
    setFontSize(Math.max(16, Math.min(42, Math.round(baseFontRef.current * scale))));
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
    setMushafSelected(null); setMushafPage(0);
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

  const mushafPageVerses = useMemo(() => {
    const start = mushafPage * VERSES_PER_PAGE;
    return filteredVerses.slice(start, start + VERSES_PER_PAGE);
  }, [filteredVerses, mushafPage]);
  const totalMushafPages = Math.ceil(filteredVerses.length / VERSES_PER_PAGE);

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
            <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 8, paddingBottom: 24 }}>
              {filteredSurahs.map(surah => {
                const status = userSurahStatus(surah.id);
                return (
                  <button
                    key={surah.id}
                    onClick={() => openSurah(surah.id)}
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

  // ── Verse view ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0, ...(readingBg ? { background: readingBg, color: readingInk } : {}) }}>
      <div style={{ flexShrink: 0, paddingBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            onClick={goBack}
            style={{ width: 34, height: 34, borderRadius: 8, background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkDim, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}
          >
            <ChevronLeft size={16}/>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 2 }}>
              {selectedSurah?.name} · {selectedSurah?.verses} {fr ? 'v.' : 'آية'} · Juz {selectedSurah?.juz}
            </div>
            <h2 style={{ fontFamily: 'Amiri Quran, serif', fontSize: 28, color: readingInk ?? t.ink, margin: 0, lineHeight: 1.3, direction: 'rtl' }}>
              {selectedSurah?.arabicName}
            </h2>
          </div>

          {/* View mode */}
          <div style={ctrlGroup}>
            {(['list', 'mushaf'] as const).map(mode => (
              <button key={mode} onClick={() => { setViewMode(mode); setMushafSelected(null); setMushafPage(0); }} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', borderRadius: 7,
                background: viewMode === mode ? t.accent : 'transparent',
                color: viewMode === mode ? '#1a0f00' : t.inkDim,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {mode === 'list' ? <LayoutList size={12}/> : <BookText size={12}/>}
                {!narrow && <span>{mode === 'list' ? (fr ? 'Liste' : 'قائمة') : 'Mushaf'}</span>}
              </button>
            ))}
          </div>

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

      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 24, touchAction: 'pan-y' }} className="no-scrollbar">
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
                  <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 26, color: t.accentBright, direction: 'rtl', lineHeight: 1.8 }}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                </div>
              </div>
            )}

            {filteredVerses.map(verse => {
              const key: BookmarkKey = `${verse.surah_number}:${verse.ayah_number}`;
              const isBookmarked = bookmarks.has(key);
              const isSelected = expandedId === verse.id;
              return (
                <div
                  id={`verse-${verse.ayah_number}`}
                  key={verse.id}
                  onClick={() => { setExpandedId(isSelected ? null : verse.id); saveQuranPosition(verse.surah_number, selectedSurah?.name ?? '', verse.ayah_number); }}
                  style={{ padding: '20px 20px 20px 26px', borderBottom: `1px solid ${t.lineSoft}`, background: isSelected ? `${t.accent}07` : 'transparent', position: 'relative', cursor: 'pointer', transition: 'background 0.15s' }}
                >
                  {/* Selected left bar */}
                  {isSelected && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: t.accent }}/>}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                    {/* Verse number */}
                    <div style={{ width: 30, height: 30, flexShrink: 0, borderRadius: '50%', border: `1px solid ${isSelected ? t.accent : t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 10, color: isSelected ? t.accentBright : t.inkDim, transition: 'border-color 0.15s, color 0.15s', background: isSelected ? `${t.accent}10` : 'transparent' }}>
                      {verse.ayah_number}
                    </div>

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

            <div style={{ textAlign: 'center', padding: '14px 0', fontSize: 9, color: t.inkMute, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.5 }}>
              — {fr ? `Fin · ${filteredVerses.length} versets` : `النهاية · ${filteredVerses.length} آية`} —
            </div>
          </motion.div>
        )}

        {/* ── MUSHAF MODE ── */}
        {viewMode === 'mushaf' && !loading && !dbError && filteredVerses.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <MushafFrame t={t} page={mushafPage} totalPages={totalMushafPages}>
              {/* Basmala inside frame */}
              {selectedSurahId !== 9 && !verseSearch && mushafPage === 0 && (
                <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${t.line}` }}>
                  <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: Math.round(fontSize * 1.1), color: t.accentBright, direction: 'rtl', lineHeight: 1.9 }}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                </div>
              )}

              {/* Verse text — continuous justified */}
              <div style={{
                direction: 'rtl', fontFamily: 'Amiri Quran, serif', fontSize: fontSize, lineHeight: '3.2',
                color: readingInk ?? t.ink, textAlign: 'justify',
              }}>
                {mushafPageVerses.map(verse => {
                  const isSelected = mushafSelected?.id === verse.id;
                  return (
                    <React.Fragment key={verse.id}>
                      <span
                        onClick={() => setMushafSelected(isSelected ? null : verse)}
                        style={{ cursor: 'pointer', color: isSelected ? t.accentBright : (readingInk ?? t.ink), background: isSelected ? `${t.accent}16` : 'transparent', borderRadius: 4, padding: '0 2px', transition: 'color 0.15s, background 0.15s' }}
                      >
                        {verse.arabic_text}
                      </span>
                      {'‏ '}
                      <span
                        onClick={() => setMushafSelected(isSelected ? null : verse)}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: isSelected ? t.accent : `${t.accent}18`, color: isSelected ? '#1a0f00' : t.accentBright, fontSize: 11, fontFamily: 'Amiri Quran, serif', verticalAlign: 'middle', margin: '0 3px', cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s, color 0.15s' }}
                      >
                        {toArabicNum(verse.ayah_number)}
                      </span>
                      {' '}
                    </React.Fragment>
                  );
                })}
              </div>
            </MushafFrame>

            {/* Mushaf pagination */}
            {totalMushafPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 0 8px' }}>
                <button
                  onClick={() => { setMushafPage(p => Math.max(0, p - 1)); setMushafSelected(null); listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={mushafPage === 0}
                  style={{ width: 34, height: 34, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.cardElev, border: `1px solid ${t.line}`, color: mushafPage === 0 ? t.inkMute : t.ink, cursor: mushafPage === 0 ? 'default' : 'pointer', opacity: mushafPage === 0 ? 0.4 : 1 }}
                >
                  <ChevronRight size={14}/>
                </button>
                <span style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', fontWeight: 700 }}>
                  {fr ? `${mushafPage + 1} / ${totalMushafPages}` : `${toArabicNum(totalMushafPages)} / ${toArabicNum(mushafPage + 1)}`}
                </span>
                <button
                  onClick={() => { setMushafPage(p => Math.min(totalMushafPages - 1, p + 1)); setMushafSelected(null); listRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  disabled={mushafPage >= totalMushafPages - 1}
                  style={{ width: 34, height: 34, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.cardElev, border: `1px solid ${t.line}`, color: mushafPage >= totalMushafPages - 1 ? t.inkMute : t.ink, cursor: mushafPage >= totalMushafPages - 1 ? 'default' : 'pointer', opacity: mushafPage >= totalMushafPages - 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={14}/>
                </button>
              </div>
            )}

            {/* Selected verse detail panel */}
            <AnimatePresence>
              {mushafSelected && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                  style={{ position: 'sticky', bottom: 0, marginTop: 12, background: t.card, border: `1px solid ${t.line}`, borderRadius: '14px 14px 8px 8px', padding: '16px 20px 18px', boxShadow: '0 -6px 24px rgba(0,0,0,0.12)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 10, color: t.accentBright, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                      {fr ? `${selectedSurah?.name} · Verset ${mushafSelected.ayah_number}` : `${selectedSurah?.arabicName} · آية ${toArabicNum(mushafSelected.ayah_number)}`}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* Action pills in panel */}
                      {[
                        { icon: playingId === mushafSelected.id ? <VolumeX size={12}/> : <Volume2 size={12}/>, fn: (e: React.MouseEvent) => playAudio(mushafSelected, e), active: playingId === mushafSelected.id },
                        { icon: <Copy size={12}/>, fn: (e: React.MouseEvent) => copyVerse(mushafSelected, e), active: false },
                        { icon: bookmarks.has(`${mushafSelected.surah_number}:${mushafSelected.ayah_number}` as BookmarkKey) ? <BookMarked size={12}/> : <Bookmark size={12}/>, fn: (e: React.MouseEvent) => toggleBookmark(mushafSelected.surah_number, mushafSelected.ayah_number, e), active: bookmarks.has(`${mushafSelected.surah_number}:${mushafSelected.ayah_number}` as BookmarkKey) },
                      ].map((btn, i) => (
                        <button key={i} onClick={btn.fn} style={{ width: 30, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: btn.active ? `${t.accent}18` : t.cardElev, border: `1px solid ${btn.active ? t.accent : t.line}`, color: btn.active ? t.accent : t.inkDim, cursor: 'pointer' }}>
                          {btn.icon}
                        </button>
                      ))}
                      <button onClick={() => setMushafSelected(null)} style={{ width: 30, height: 30, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkMute, cursor: 'pointer' }}><X size={13}/></button>
                    </div>
                  </div>
                  <p style={{ fontSize: 20, fontFamily: 'Amiri Quran, serif', direction: 'rtl', color: t.ink, lineHeight: '2.2', marginBottom: 10 }}>{mushafSelected.arabic_text}</p>
                  <p style={{ fontSize: 13, color: t.inkDim, lineHeight: '1.7', fontStyle: 'italic', fontFamily: 'Fraunces, serif' }}>{mushafSelected.french_text}</p>
                </motion.div>
              )}
            </AnimatePresence>
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
