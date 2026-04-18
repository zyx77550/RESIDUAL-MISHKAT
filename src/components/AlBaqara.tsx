import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Search, BookOpen,
  Copy, Check, X, Bookmark, BookMarked, Languages, AlignLeft
} from 'lucide-react';
import { AL_BAQARA, Verse } from '../data/alBaqaraData';
import { UserData } from '../types';

const VERSES_PER_PAGE = 15;

interface AlBaqaraProps {
  userData: UserData;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  lang: 'fr' | 'ar';
  onBack?: () => void;
}

export const AlBaqaraSection = ({ userData, setUserData, lang, onBack }: AlBaqaraProps) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showExplications, setShowExplications] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('mishkat_albaqara_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const pageRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let list = AL_BAQARA;
    if (showBookmarksOnly) list = list.filter(v => bookmarks.has(v.id));
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(v =>
        v.arabic.includes(search) ||
        v.explication.toLowerCase().includes(q) ||
        v.id.toString() === q
      );
    }
    return list;
  }, [search, showBookmarksOnly, bookmarks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / VERSES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageVerses = filtered.slice((safePage - 1) * VERSES_PER_PAGE, safePage * VERSES_PER_PAGE);

  const goTo = (p: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, p)));
    pageRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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

  const isSearchMode = search.trim().length > 0 || showBookmarksOnly;

  return (
    <div className="flex flex-col h-full gap-0 relative">

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 pb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div>
            <h2 className="text-4xl sm:text-5xl leading-tight" style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif' }}>
              سورة البقرة
            </h2>
            <p className="text-sm font-bold mt-1" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
              {lang === 'fr' ? `Al-Baqarah · 286 versets · Page ${safePage} / ${totalPages}` : `البقرة · ٢٨٦ آية · صفحة ${safePage} من ${totalPages}`}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Bookmarks count */}
            {bookmarks.size > 0 && (
              <div className="glass-card px-3 py-2 text-center flex-shrink-0">
                <p className="text-lg font-black text-gradient leading-none">{bookmarks.size}</p>
                <p className="text-[8px] uppercase tracking-widest font-bold mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? 'signets' : 'علامات'}
                </p>
              </div>
            )}

            {/* Toggle: explications */}
            <button
              onClick={() => setShowExplications(v => !v)}
              className="px-3 py-2 rounded-2xl transition-all flex items-center gap-2 flex-shrink-0 font-bold text-[10px] uppercase tracking-wider"
              style={showExplications
                ? { background: 'var(--brand-primary)', color: '#fff' }
                : { background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }
              }
              title={lang === 'fr' ? 'Afficher / masquer les explications' : 'إظهار / إخفاء التفسير'}
            >
              <AlignLeft size={13} />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Tafsir' : 'تفسير'}</span>
            </button>

            {/* Toggle: bookmarks only */}
            <button
              onClick={() => { setShowBookmarksOnly(v => !v); setCurrentPage(1); }}
              className="px-3 py-2 rounded-2xl transition-all flex items-center gap-2 flex-shrink-0 font-bold text-[10px] uppercase tracking-wider"
              style={showBookmarksOnly
                ? { background: 'var(--brand-secondary)', color: '#fff' }
                : { background: 'color-mix(in srgb, var(--brand-secondary) 10%, transparent)', color: 'var(--brand-secondary)' }
              }
            >
              <Bookmark size={13} />
              <span className="hidden sm:inline">{lang === 'fr' ? 'Signets' : 'علامات'}</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--brand-text-muted)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder={lang === 'fr' ? 'Rechercher un verset, une explication, un numéro…' : 'ابحث في الآيات…'}
            className="mishkat-input pl-11"
          />
          {search && (
            <button onClick={() => { setSearch(''); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full" style={{ color: 'var(--brand-text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <BookOpen size={48} className="opacity-20" style={{ color: 'var(--brand-primary)' }} />
          <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? 'Aucun verset trouvé.' : 'لا توجد آية.'}
          </p>
        </div>
      )}

      {/* ── Page navigation (top) ── */}
      {filtered.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mb-3 flex-shrink-0">
          <button
            onClick={() => goTo(safePage - 1)}
            disabled={safePage <= 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => goTo(p)}
                className="w-7 h-7 rounded-lg text-[11px] font-black transition-all"
                style={p === safePage
                  ? { background: 'var(--brand-primary)', color: '#fff' }
                  : { background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)', color: 'var(--brand-text-muted)' }
                }
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => goTo(safePage + 1)}
            disabled={safePage >= totalPages}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Quran Page ── */}
      {filtered.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${safePage}-${search}-${showBookmarksOnly}`}
            ref={pageRef}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-1 overflow-y-auto pb-6"
          >
            {/* The page itself */}
            <div
              className="relative mx-auto rounded-3xl overflow-hidden"
              style={{
                background: 'var(--brand-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-medium)',
                maxWidth: '820px',
              }}
            >
              {/* Top accent line */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--brand-primary), var(--brand-secondary), var(--brand-primary))' }} />

              {/* Bismillah (first page only) */}
              {safePage === 1 && !isSearchMode && (
                <div className="text-center pt-8 pb-2 px-8">
                  <p className="text-3xl font-arabic" style={{ color: 'var(--brand-secondary)', fontFamily: 'Amiri, serif', lineHeight: '2' }}>
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                  </p>
                  <div className="h-px mx-12 mt-4" style={{ background: 'linear-gradient(90deg, transparent, var(--border-accent), transparent)' }} />
                </div>
              )}

              {/* Verses */}
              <div className="px-6 sm:px-10 py-6">
                {showExplications ? (
                  /* Explications mode: verse-by-verse with tafsir */
                  <div className="space-y-6">
                    {pageVerses.map(verse => {
                      const isBookmarked = bookmarks.has(verse.id);
                      return (
                        <motion.div
                          key={verse.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="group relative"
                        >
                          {/* Bookmark indicator bar */}
                          {isBookmarked && (
                            <div className="absolute -left-4 top-0 bottom-0 w-0.5 rounded-full" style={{ background: 'var(--brand-secondary)' }} />
                          )}

                          {/* Arabic verse + number */}
                          <div dir="rtl" className="flex items-start gap-3 mb-2">
                            <p className="flex-1 text-xl sm:text-2xl leading-loose text-right"
                               style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif', lineHeight: '2.2' }}>
                              {verse.arabic}
                            </p>
                            <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black"
                                   style={{ background: 'color-mix(in srgb, var(--brand-secondary) 15%, transparent)', color: 'var(--brand-secondary)', border: '1.5px solid color-mix(in srgb, var(--brand-secondary) 30%, transparent)' }}>
                                {verse.id}
                              </div>
                              <button
                                onClick={e => toggleBookmark(verse.id, e)}
                                className="p-1 rounded transition-all opacity-0 group-hover:opacity-100"
                                style={{ color: isBookmarked ? 'var(--brand-secondary)' : 'var(--brand-text-muted)' }}
                              >
                                {isBookmarked ? <BookMarked size={11} /> : <Bookmark size={11} />}
                              </button>
                            </div>
                          </div>

                          {/* French explication */}
                          <div className="pl-2 pr-12 border-l-2 ml-1" style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' }}>
                            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--brand-text-muted)' }}>
                              {verse.explication}
                            </p>
                          </div>

                          <div className="h-px mt-5" style={{ background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }} />
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  /* Continuous page mode: all verses flow as one text block */
                  <div dir="rtl" className="text-right select-text">
                    <p style={{ fontFamily: 'Amiri, serif', lineHeight: '2.6', color: 'var(--brand-primary)' }}
                       className="text-xl sm:text-2xl">
                      {pageVerses.map((verse, idx) => {
                        const isBookmarked = bookmarks.has(verse.id);
                        return (
                          <React.Fragment key={verse.id}>
                            <span
                              onClick={() => setSelectedVerse(selectedVerse?.id === verse.id ? null : verse)}
                              className="cursor-pointer transition-all rounded-sm hover:bg-[color-mix(in_srgb,var(--brand-secondary)_10%,transparent)] px-0.5"
                              title={lang === 'fr' ? 'Voir explication' : 'عرض التفسير'}
                              style={selectedVerse?.id === verse.id
                                ? { background: 'color-mix(in srgb, var(--brand-secondary) 15%, transparent)', borderRadius: '4px' }
                                : {}
                              }
                            >
                              {verse.arabic}
                            </span>
                            {/* Verse end marker */}
                            <span
                              className="inline-flex items-center justify-center rounded-full font-black cursor-pointer mx-1.5 align-middle transition-all"
                              style={{
                                fontSize: '11px',
                                width: '26px',
                                height: '26px',
                                background: isBookmarked
                                  ? 'color-mix(in srgb, var(--brand-secondary) 25%, transparent)'
                                  : 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)',
                                color: 'var(--brand-secondary)',
                                border: `1.5px solid color-mix(in srgb, var(--brand-secondary) ${isBookmarked ? '50' : '22'}%, transparent)`,
                                flexShrink: 0,
                              }}
                              onClick={e => toggleBookmark(verse.id, e)}
                              title={isBookmarked
                                ? (lang === 'fr' ? 'Retirer le signet' : 'إزالة العلامة')
                                : (lang === 'fr' ? 'Marquer le verset' : 'وضع علامة')
                              }
                            >
                              {verse.id}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Page number footer */}
              <div className="flex items-center justify-between px-8 py-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>
                  {lang === 'fr' ? `Page ${safePage}` : `صفحة ${safePage}`}
                </span>
                <div className="flex gap-1.5">
                  {pageVerses.map(v => (
                    <div
                      key={v.id}
                      className="w-1 h-1 rounded-full transition-all"
                      style={{ background: bookmarks.has(v.id) ? 'var(--brand-secondary)' : 'var(--border-subtle)' }}
                    />
                  ))}
                </div>
                <span className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>
                  {lang === 'fr' ? `${filtered.length} versets` : `${filtered.length} آية`}
                </span>
              </div>
            </div>

            {/* ── Selected verse detail card ── */}
            <AnimatePresence>
              {selectedVerse && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  className="mx-auto mt-4 glass-card p-5 relative overflow-hidden"
                  style={{ maxWidth: '820px' }}
                >
                  <div className="card-accent-bar" />
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                           style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
                        {selectedVerse.id}
                      </div>
                      <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--brand-text-muted)' }}>
                        {lang === 'fr' ? `Verset ${selectedVerse.id}` : `الآية ${selectedVerse.id}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={e => copyVerse(selectedVerse, e)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ color: 'var(--brand-text-muted)', background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={e => toggleBookmark(selectedVerse.id, e)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{
                          color: bookmarks.has(selectedVerse.id) ? 'var(--brand-secondary)' : 'var(--brand-text-muted)',
                          background: bookmarks.has(selectedVerse.id) ? 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' : 'color-mix(in srgb, var(--brand-primary) 6%, transparent)'
                        }}
                      >
                        {bookmarks.has(selectedVerse.id) ? <BookMarked size={12} /> : <Bookmark size={12} />}
                      </button>
                      <button
                        onClick={() => setSelectedVerse(null)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ color: 'var(--brand-text-muted)', background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  <p dir="rtl" className="text-xl leading-loose text-right mb-3"
                     style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif', lineHeight: '2.2' }}>
                    {selectedVerse.arabic}
                  </p>
                  <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    <p className="text-sm leading-relaxed italic" style={{ color: 'var(--brand-text-muted)' }}>
                      {selectedVerse.explication}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Bottom navigation ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mx-auto mt-5 px-2" style={{ maxWidth: '820px' }}>
                <button
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage <= 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all disabled:opacity-30"
                  style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}
                >
                  <ChevronLeft size={15} />
                  {lang === 'fr' ? 'Précédent' : 'السابق'}
                </button>

                <span className="text-xs font-black" style={{ color: 'var(--brand-text-muted)' }}>
                  {safePage} / {totalPages}
                </span>

                <button
                  onClick={() => goTo(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all disabled:opacity-30"
                  style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}
                >
                  {lang === 'fr' ? 'Suivant' : 'التالي'}
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Copy toast ── */}
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
    </div>
  );
};
