import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Search, BookOpen,
  Copy, Check, X, Bookmark, BookMarked, AlignLeft
} from 'lucide-react';
import { AL_BAQARA, Verse } from '../data/alBaqaraData';
import { UserData } from '../types';

const VERSES_PER_PAGE = 15;
const MAX_W = '820px';

interface AlBaqaraProps {
  userData: UserData;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  lang: 'fr' | 'ar';
  onBack?: () => void;
}

export const AlBaqaraSection = ({ userData, setUserData, lang }: AlBaqaraProps) => {
  const [search, setSearch]                   = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const [copied, setCopied]                   = useState(false);
  const [showExplications, setShowExplications] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedVerse, setSelectedVerse]     = useState<Verse | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    try {
      const s = localStorage.getItem('mishkat_albaqara_bookmarks');
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch { return new Set(); }
  });

  const filtered = useMemo(() => {
    let list = AL_BAQARA;
    if (showBookmarksOnly) list = list.filter(v => bookmarks.has(v.id));
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(v =>
        v.arabic.includes(search) ||
        v.explication.toLowerCase().includes(q) ||
        String(v.id) === q
      );
    }
    return list;
  }, [search, showBookmarksOnly, bookmarks]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / VERSES_PER_PAGE));
  const safePage    = Math.min(currentPage, totalPages);
  const pageVerses  = filtered.slice((safePage - 1) * VERSES_PER_PAGE, safePage * VERSES_PER_PAGE);

  const goTo = (p: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, p)));
    setTimeout(() => pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    setSelectedVerse(null);
  };

  const toggleBookmark = useCallback((id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('mishkat_albaqara_bookmarks', JSON.stringify([...next]));
      return next;
    });
  }, []);

  const copyVerse = async (verse: Verse, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${verse.arabic}\n\n${verse.explication}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  /* ─── sub-components ─── */

  const PageNav = ({ pos }: { pos: 'top' | 'bottom' }) => (
    <div className={`flex items-center justify-between gap-3 ${pos === 'top' ? 'mb-3' : 'mt-5'}`}
         style={{ maxWidth: MAX_W, marginLeft: 'auto', marginRight: 'auto' }}>
      <button
        onClick={() => goTo(safePage - 1)} disabled={safePage <= 1}
        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all disabled:opacity-30"
        style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}
      >
        <ChevronLeft size={14} />
        <span className="hidden sm:inline">{lang === 'fr' ? 'Précédent' : 'السابق'}</span>
      </button>

      {/* Dots: desktop only, max 10 visible */}
      <div className="hidden sm:flex gap-1.5 items-center flex-wrap justify-center">
        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => goTo(p)}
            className="rounded-full transition-all"
            style={{
              width: p === safePage ? '24px' : '8px',
              height: '8px',
              background: p === safePage ? 'var(--brand-primary)' : 'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
            }}
          />
        ))}
        {totalPages > 10 && (
          <span className="text-[10px] font-bold" style={{ color: 'var(--brand-text-muted)' }}>
            …{totalPages}
          </span>
        )}
      </div>

      {/* Counter: mobile */}
      <span className="sm:hidden text-sm font-black" style={{ color: 'var(--brand-primary)' }}>
        {safePage} / {totalPages}
      </span>

      <button
        onClick={() => goTo(safePage + 1)} disabled={safePage >= totalPages}
        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all disabled:opacity-30"
        style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}
      >
        <span className="hidden sm:inline">{lang === 'fr' ? 'Suivant' : 'التالي'}</span>
        <ChevronRight size={14} />
      </button>
    </div>
  );

  /* ─── verse number badge (inline, preserves RTL flow) ─── */
  const VerseBadge = ({ id }: { id: number }) => {
    const marked = bookmarks.has(id);
    return (
      <span
        onClick={e => toggleBookmark(id, e)}
        title={marked ? (lang === 'fr' ? 'Retirer le signet' : 'إزالة العلامة') : (lang === 'fr' ? 'Marquer' : 'وضع علامة')}
        style={{
          display: 'inline-block',
          width: '24px',
          height: '24px',
          lineHeight: '24px',
          textAlign: 'center',
          verticalAlign: 'middle',
          borderRadius: '50%',
          fontSize: '10px',
          fontWeight: 900,
          fontFamily: 'Inter, sans-serif',
          cursor: 'pointer',
          margin: '0 4px',
          flexShrink: 0,
          background: marked
            ? 'color-mix(in srgb, var(--brand-secondary) 28%, transparent)'
            : 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)',
          color: 'var(--brand-secondary)',
          border: `1.5px solid color-mix(in srgb, var(--brand-secondary) ${marked ? 50 : 22}%, transparent)`,
          transition: 'all 0.2s ease',
        }}
      >
        {id}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 pb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div>
            <h2 className="text-4xl sm:text-5xl leading-tight"
                style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif' }}>
              سورة البقرة
            </h2>
            <p className="text-xs sm:text-sm font-bold mt-1" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
              {lang === 'fr'
                ? `Al-Baqarah · ${filtered.length} versets · Page ${safePage}/${totalPages}`
                : `البقرة · ${filtered.length} آية · صفحة ${safePage}/${totalPages}`}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setShowExplications(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
              style={showExplications
                ? { background: 'var(--brand-primary)', color: '#fff' }
                : { background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}
            >
              <AlignLeft size={13} />
              <span>{lang === 'fr' ? 'Tafsir' : 'تفسير'}</span>
            </button>
            <button
              onClick={() => { setShowBookmarksOnly(v => !v); setCurrentPage(1); setSelectedVerse(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all"
              style={showBookmarksOnly
                ? { background: 'var(--brand-secondary)', color: '#fff' }
                : { background: 'color-mix(in srgb, var(--brand-secondary) 10%, transparent)', color: 'var(--brand-secondary)' }}
            >
              <Bookmark size={13} />
              <span>{lang === 'fr' ? `Signets${bookmarks.size > 0 ? ` (${bookmarks.size})` : ''}` : `علامات`}</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--brand-text-muted)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); setSelectedVerse(null); }}
            placeholder={lang === 'fr' ? 'Verset, explication, numéro…' : 'ابحث في الآيات…'}
            className="mishkat-input pl-10 text-sm"
          />
          {search && (
            <button onClick={() => { setSearch(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full"
              style={{ color: 'var(--brand-text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <BookOpen size={44} style={{ color: 'var(--brand-primary)', opacity: 0.2 }} />
          <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? 'Aucun verset trouvé.' : 'لا توجد آية.'}
          </p>
        </div>
      )}

      {/* ── Content ── */}
      {filtered.length > 0 && (
        <div ref={pageRef} className="flex-1 overflow-y-auto pb-8">

          {totalPages > 1 && <PageNav pos="top" />}

          {/* The page */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${safePage}-${search}-${showBookmarksOnly}-${showExplications}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="mx-auto rounded-2xl sm:rounded-3xl overflow-hidden"
              style={{
                maxWidth: MAX_W,
                background: 'var(--brand-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-medium)',
              }}
            >
              {/* Top rainbow bar */}
              <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary), var(--brand-primary))' }} />

              {/* Bismillah — page 1 only, no search active */}
              {safePage === 1 && !search && !showBookmarksOnly && (
                <div className="text-center pt-6 pb-3 px-4">
                  <p className="text-2xl sm:text-3xl"
                     style={{ color: 'var(--brand-secondary)', fontFamily: 'Amiri, serif', lineHeight: 2 }}>
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                  </p>
                  <div className="h-px mx-8 mt-3"
                       style={{ background: 'linear-gradient(90deg, transparent, var(--border-accent), transparent)' }} />
                </div>
              )}

              {/* Verses body */}
              <div className="px-4 sm:px-8 md:px-12 py-5 sm:py-8">

                {showExplications ? (
                  /* ── Tafsir mode: verse + explanation per row ── */
                  <div className="space-y-5 sm:space-y-7">
                    {pageVerses.map(verse => {
                      const marked = bookmarks.has(verse.id);
                      return (
                        <div key={verse.id} className="relative">
                          {marked && (
                            <div className="absolute -left-2 sm:-left-5 top-1 bottom-1 w-0.5 rounded-full"
                                 style={{ background: 'var(--brand-secondary)' }} />
                          )}
                          <div dir="rtl" className="flex items-start gap-2 mb-2">
                            <p className="flex-1 text-lg sm:text-xl md:text-2xl text-right"
                               style={{ fontFamily: 'Amiri, serif', color: 'var(--brand-primary)', lineHeight: 2.2 }}>
                              {verse.arabic}
                            </p>
                            <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] font-black"
                                   style={{
                                     background: 'color-mix(in srgb, var(--brand-secondary) 15%, transparent)',
                                     color: 'var(--brand-secondary)',
                                     border: '1.5px solid color-mix(in srgb, var(--brand-secondary) 30%, transparent)',
                                   }}>
                                {verse.id}
                              </div>
                              <button
                                onClick={e => toggleBookmark(verse.id, e)}
                                className="p-1 rounded transition-all"
                                style={{ color: marked ? 'var(--brand-secondary)' : 'var(--brand-text-muted)', opacity: marked ? 1 : 0.4 }}
                              >
                                {marked ? <BookMarked size={11} /> : <Bookmark size={11} />}
                              </button>
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed italic pl-2 border-l-2"
                             style={{ color: 'var(--brand-text-muted)', borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' }}>
                            {verse.explication}
                          </p>
                          <div className="mt-5 h-px"
                               style={{ background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ── Continuous page mode ── */
                  <p dir="rtl" className="text-right"
                     style={{
                       fontFamily: 'Amiri, serif',
                       fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
                       lineHeight: 2.6,
                       color: 'var(--brand-primary)',
                     }}>
                    {pageVerses.map(verse => (
                      <React.Fragment key={verse.id}>
                        <span
                          onClick={() => setSelectedVerse(selectedVerse?.id === verse.id ? null : verse)}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '3px',
                            padding: '0 2px',
                            transition: 'background 0.15s',
                            background: selectedVerse?.id === verse.id
                              ? 'color-mix(in srgb, var(--brand-secondary) 14%, transparent)'
                              : 'transparent',
                          }}
                        >
                          {verse.arabic}
                        </span>
                        <VerseBadge id={verse.id} />
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </div>

              {/* Page footer */}
              <div className="flex items-center justify-between px-5 sm:px-8 py-3 border-t"
                   style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[9px] uppercase tracking-widest font-black"
                      style={{ color: 'var(--brand-text-muted)', opacity: 0.5 }}>
                  {lang === 'fr' ? `Page ${safePage}` : `صفحة ${safePage}`}
                </span>
                <div className="flex gap-1 items-center">
                  {pageVerses.map(v => (
                    <div key={v.id} className="rounded-full transition-all"
                         style={{
                           width: '5px', height: '5px',
                           background: bookmarks.has(v.id) ? 'var(--brand-secondary)' : 'var(--border-subtle)',
                         }} />
                  ))}
                </div>
                <span className="text-[9px] uppercase tracking-widest font-black"
                      style={{ color: 'var(--brand-text-muted)', opacity: 0.5 }}>
                  {pageVerses[0]?.id}–{pageVerses[pageVerses.length - 1]?.id}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Selected verse detail (continuous mode) ── */}
          <AnimatePresence>
            {selectedVerse && !showExplications && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="mx-auto mt-4 glass-card p-4 sm:p-5 relative overflow-hidden"
                style={{ maxWidth: MAX_W }}
              >
                <div className="card-accent-bar" />
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                         style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
                      {selectedVerse.id}
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--brand-text-muted)' }}>
                      {lang === 'fr' ? `Verset ${selectedVerse.id}` : `الآية ${selectedVerse.id}`}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={e => copyVerse(selectedVerse, e)}
                      className="p-2 rounded-lg transition-all"
                      style={{ color: 'var(--brand-text-muted)', background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}>
                      <Copy size={13} />
                    </button>
                    <button onClick={e => toggleBookmark(selectedVerse.id, e)}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        color: bookmarks.has(selectedVerse.id) ? 'var(--brand-secondary)' : 'var(--brand-text-muted)',
                        background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)',
                      }}>
                      {bookmarks.has(selectedVerse.id) ? <BookMarked size={13} /> : <Bookmark size={13} />}
                    </button>
                    <button onClick={() => setSelectedVerse(null)}
                      className="p-2 rounded-lg transition-all"
                      style={{ color: 'var(--brand-text-muted)', background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}>
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <p dir="rtl" className="text-right text-lg sm:text-xl mb-3"
                   style={{ fontFamily: 'Amiri, serif', color: 'var(--brand-primary)', lineHeight: 2.2 }}>
                  {selectedVerse.arabic}
                </p>
                <p className="text-xs sm:text-sm leading-relaxed italic pt-3 border-t"
                   style={{ color: 'var(--brand-text-muted)', borderColor: 'var(--border-subtle)' }}>
                  {selectedVerse.explication}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {totalPages > 1 && <PageNav pos="bottom" />}
        </div>
      )}

      {/* ── Copy toast ── */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl pointer-events-none"
            style={{ background: 'var(--brand-primary)', color: '#fff' }}
          >
            <Check size={14} />
            <span className="text-xs font-bold">{lang === 'fr' ? 'Copié !' : 'تم النسخ!'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
