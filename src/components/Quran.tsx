import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, ChevronDown, Copy, Check, X,
  Bookmark, BookMarked, ChevronLeft, ChevronUp, AlertCircle, Loader2,
} from 'lucide-react';
import { supabase, QuranVerse } from '../lib/supabase';
import { SURAH_DATA } from '../types';
import { UserData } from '../types';

interface QuranProps {
  userData: UserData;
  lang: 'fr' | 'ar';
}

type BookmarkKey = `${number}:${number}`;

function loadBookmarks(): Set<BookmarkKey> {
  try {
    const raw = localStorage.getItem('mishkat_quran_bookmarks');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export const QuranSection = ({ userData, lang }: QuranProps) => {
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [verses, setVerses]       = useState<QuranVerse[]>([]);
  const [loading, setLoading]     = useState(false);
  const [dbError, setDbError]     = useState<string | null>(null);
  const [surahSearch, setSurahSearch] = useState('');
  const [verseSearch, setVerseSearch] = useState('');
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [copied, setCopied]       = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<BookmarkKey>>(loadBookmarks);

  const cache   = useRef<Map<number, QuranVerse[]>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);

  const selectedSurah = selectedSurahId != null
    ? SURAH_DATA.find(s => s.id === selectedSurahId) ?? null
    : null;

  const fetchVerses = useCallback(async (surahId: number) => {
    if (cache.current.has(surahId)) {
      setVerses(cache.current.get(surahId)!);
      return;
    }
    setLoading(true);
    setDbError(null);
    const { data, error } = await supabase
      .from('quran_verses')
      .select('*')
      .eq('surah_number', surahId)
      .order('ayah_number');
    setLoading(false);
    if (error) { setDbError(error.message); return; }
    cache.current.set(surahId, data ?? []);
    setVerses(data ?? []);
  }, []);

  const openSurah = (id: number) => {
    setSelectedSurahId(id);
    setVerseSearch('');
    setExpandedId(null);
    fetchVerses(id);
    listRef.current?.scrollTo({ top: 0 });
  };

  const goBack = () => {
    setSelectedSurahId(null);
    setVerses([]);
    setDbError(null);
    setVerseSearch('');
  };

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
    try {
      await navigator.clipboard.writeText(`${v.arabic_text}\n\n${v.french_text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return SURAH_DATA;
    const q = surahSearch.toLowerCase();
    return SURAH_DATA.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.arabicName.includes(surahSearch) ||
      s.id.toString() === q
    );
  }, [surahSearch]);

  const filteredVerses = useMemo(() => {
    if (!verseSearch.trim()) return verses;
    const q = verseSearch.toLowerCase();
    return verses.filter(v =>
      v.arabic_text.includes(verseSearch) ||
      v.french_text.toLowerCase().includes(q) ||
      v.ayah_number.toString() === q
    );
  }, [verseSearch, verses]);

  const bookmarkCount = bookmarks.size;
  const userSurahStatus = (id: number) =>
    userData.surahs.find(s => s.id === id)?.status ?? 'not_started';

  const statusDot: Record<string, string> = {
    memorized:    'var(--brand-primary)',
    review:       'var(--brand-secondary)',
    in_progress:  'var(--brand-accent)',
    not_started:  'transparent',
  };

  // ── Surah list ──────────────────────────────────────────────────
  if (selectedSurahId === null) {
    return (
      <div className="flex flex-col h-full gap-0 relative">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 pb-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2
                className="text-4xl sm:text-5xl leading-tight"
                style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif' }}
              >
                القرآن الكريم
              </h2>
              <p className="text-sm font-bold mt-1" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
                {lang === 'fr' ? '114 sourates · Traduction Hamidullah' : '١١٤ سورة · ترجمة حميد الله'}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="glass-card px-4 py-2.5 text-center flex-shrink-0">
                <p className="text-xl font-black text-gradient leading-none">{bookmarkCount}</p>
                <p className="text-[8px] uppercase tracking-widest font-bold mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? 'signets' : 'علامات'}
                </p>
              </div>
              <div className="glass-card px-4 py-2.5 text-center flex-shrink-0">
                <p className="text-xl font-black text-gradient leading-none">
                  {userData.surahs.filter(s => s.status === 'memorized').length}
                </p>
                <p className="text-[8px] uppercase tracking-widest font-bold mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? 'mémorisées' : 'محفوظ'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-4">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--brand-text-muted)' }} />
            <input
              value={surahSearch}
              onChange={e => setSurahSearch(e.target.value)}
              placeholder={lang === 'fr' ? 'Rechercher une sourate…' : 'ابحث عن سورة…'}
              className="mishkat-input pl-11"
            />
            {surahSearch && (
              <button onClick={() => setSurahSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full" style={{ color: 'var(--brand-text-muted)' }}>
                <X size={13} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Surah grid */}
        <div className="flex-1 overflow-y-auto pr-1 pb-6 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredSurahs.map((surah, idx) => {
                const status = userSurahStatus(surah.id);
                return (
                  <motion.button
                    key={surah.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: Math.min(idx * 0.008, 0.25) }}
                    whileHover={{ y: -2 }}
                    onClick={() => openSurah(surah.id)}
                    className="glass-card p-4 text-left group relative overflow-hidden flex items-center gap-4"
                  >
                    <div className="card-accent-bar" />

                    {/* Surah number */}
                    <div
                      className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm relative"
                      style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}
                    >
                      {surah.id}
                      {status !== 'not_started' && (
                        <span
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                          style={{ background: statusDot[status] }}
                        />
                      )}
                    </div>

                    {/* Names */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-lg leading-tight font-bold truncate"
                        style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif', direction: 'rtl' }}
                      >
                        {surah.arabicName}
                      </p>
                      <p className="text-[11px] font-semibold truncate mt-0.5" style={{ color: 'var(--brand-secondary)' }}>
                        {surah.name}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
                        {surah.verses} {lang === 'fr' ? 'versets' : 'آية'} · Juz {surah.juz}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {filteredSurahs.length === 0 && (
              <div className="col-span-full text-center py-20">
                <BookOpen size={52} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--brand-primary)' }} />
                <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? 'Aucune sourate trouvée.' : 'لا توجد سورة.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Verse view ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full gap-0 relative">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 pb-5">
        <div className="flex items-start gap-3 flex-wrap">
          <button
            onClick={goBack}
            className="p-2.5 rounded-xl flex-shrink-0 mt-1 transition-all hover:scale-105"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <h2
              className="text-4xl sm:text-5xl leading-tight"
              style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif' }}
            >
              {selectedSurah?.arabicName}
            </h2>
            <p className="text-sm font-bold mt-1" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
              {selectedSurah?.name} · {selectedSurah?.verses} {lang === 'fr' ? 'versets' : 'آية'} · Juz {selectedSurah?.juz}
            </p>
          </div>
          <div className="glass-card px-4 py-2.5 text-center flex-shrink-0">
            <p className="text-xl font-black text-gradient leading-none">{filteredVerses.length}</p>
            <p className="text-[8px] uppercase tracking-widest font-bold mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'versets' : 'آيات'}
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--brand-text-muted)' }} />
          <input
            value={verseSearch}
            onChange={e => setVerseSearch(e.target.value)}
            placeholder={lang === 'fr' ? 'Rechercher un verset, une traduction…' : 'ابحث في الآيات…'}
            className="mishkat-input pl-11"
          />
          {verseSearch && (
            <button onClick={() => setVerseSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full" style={{ color: 'var(--brand-text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </motion.div>

      {/* Verse list */}
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1 pb-6 custom-scrollbar">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-primary)', opacity: 0.5 }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Chargement…' : 'جارٍ التحميل…'}
            </p>
          </div>
        )}

        {/* DB not seeded yet */}
        {!loading && !dbError && verses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <AlertCircle size={48} className="opacity-30" style={{ color: 'var(--brand-primary)' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>
                {lang === 'fr' ? 'Base de données vide' : 'قاعدة البيانات فارغة'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr'
                  ? 'Lance npm run seed pour importer le Coran.'
                  : 'شغّل npm run seed لاستيراد القرآن.'}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && dbError && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <AlertCircle size={48} style={{ color: '#ef4444', opacity: 0.5 }} />
            <p className="text-xs" style={{ color: '#ef4444' }}>{dbError}</p>
          </div>
        )}

        {/* Verses */}
        {!loading && !dbError && filteredVerses.length > 0 && (
          <AnimatePresence mode="popLayout">
            {filteredVerses.map((verse, idx) => {
              const key: BookmarkKey = `${verse.surah_number}:${verse.ayah_number}`;
              const isBookmarked = bookmarks.has(key);
              const isExpanded = expandedId === verse.id || !!verseSearch;
              return (
                <motion.div
                  id={`verse-${verse.ayah_number}`}
                  key={verse.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: Math.min(idx * 0.008, 0.25) }}
                  whileHover={{ y: -2 }}
                  onClick={() => setExpandedId(expandedId === verse.id ? null : verse.id)}
                  className="glass-card p-5 cursor-pointer group relative overflow-hidden"
                  style={{ borderLeft: isBookmarked ? '3px solid var(--brand-secondary)' : '3px solid transparent' }}
                >
                  <div className="card-accent-bar" />

                  {/* Verse number + actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                        style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}
                      >
                        {verse.ayah_number}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--brand-text-muted)' }}>
                        {lang === 'fr' ? `Verset ${verse.ayah_number}` : `آية ${verse.ayah_number}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={e => copyVerse(verse, e)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ color: 'var(--brand-text-muted)', background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}
                        title={lang === 'fr' ? 'Copier' : 'نسخ'}
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={e => toggleBookmark(verse.surah_number, verse.ayah_number, e)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{
                          color: isBookmarked ? 'var(--brand-secondary)' : 'var(--brand-text-muted)',
                          background: isBookmarked
                            ? 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)'
                            : 'color-mix(in srgb, var(--brand-primary) 6%, transparent)',
                        }}
                        title={lang === 'fr' ? (isBookmarked ? 'Retirer' : 'Marquer') : (isBookmarked ? 'إزالة' : 'تعليم')}
                      >
                        {isBookmarked ? <BookMarked size={12} /> : <Bookmark size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Arabic */}
                  <p
                    className="text-right text-xl leading-loose"
                    style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif', lineHeight: '2.2' }}
                  >
                    {verse.arabic_text}
                  </p>

                  {/* French translation (expandable) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                          <p className="text-sm leading-relaxed italic" style={{ color: 'var(--brand-text-muted)' }}>
                            {verse.french_text}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isExpanded && (
                    <div
                      className="flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-60 transition-opacity"
                      style={{ color: 'var(--brand-text-muted)' }}
                    >
                      <ChevronDown size={10} />
                      {lang === 'fr' ? 'Voir traduction' : 'عرض الترجمة'}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && filteredVerses.length > 0 && (
          <p className="text-center text-[9px] uppercase tracking-widest font-black py-8" style={{ color: 'var(--brand-text-muted)', opacity: 0.5 }}>
            — {lang === 'fr' ? `Fin · ${filteredVerses.length} versets` : `النهاية · ${filteredVerses.length} آية`} —
          </p>
        )}
      </div>

      {/* Copy toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl"
            style={{ background: 'var(--brand-primary)', color: '#fff' }}
          >
            <Check size={14} />
            <span className="text-xs font-bold">{lang === 'fr' ? 'Copié !' : 'تم النسخ!'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 md:bottom-8 right-4 z-40 w-10 h-10 rounded-full shadow-xl flex items-center justify-center"
        style={{ background: 'var(--brand-primary)', color: '#fff' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={lang === 'fr' ? 'Haut de page' : 'أعلى الصفحة'}
      >
        <ChevronUp size={18} />
      </motion.button>
    </div>
  );
};
