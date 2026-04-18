import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Search, BookOpen, ChevronUp, ChevronDown,
  Copy, Check, X, Bookmark, BookMarked
} from 'lucide-react';
import { AL_BAQARA, Verse } from '../data/alBaqaraData';
import { UserData } from '../types';

interface AlBaqaraProps {
  userData: UserData;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  lang: 'fr' | 'ar';
  onBack?: () => void;
}

export const AlBaqaraSection = ({ userData, setUserData, lang, onBack }: AlBaqaraProps) => {
  const [search, setSearch] = useState('');
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [copied, setCopied] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('mishkat_albaqara_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);
  const loaderRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setVisibleCount(c => Math.min(c + 30, AL_BAQARA.length)); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, []);

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

  const visible = filtered.slice(0, visibleCount);

  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('mishkat_albaqara_bookmarks', JSON.stringify([...next]));
      return next;
    });
  };

  const copyVerse = async (verse: Verse) => {
    try {
      await navigator.clipboard.writeText(`${verse.arabic}\n\n${verse.explication}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const scrollToVerse = (id: number) => {
    const el = document.getElementById(`verse-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col h-full gap-0 relative">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 pb-5"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-4xl sm:text-5xl leading-tight" style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif' }}>
              سورة البقرة
            </h2>
            <p className="text-sm font-bold mt-1" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
              {lang === 'fr' ? 'Al-Baqarah · 286 versets · Juz 1-3' : 'البقرة · ٢٨٦ آية · الأجزاء ١-٣'}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-2 flex-wrap">
            <div className="glass-card px-4 py-2.5 text-center flex-shrink-0">
              <p className="text-xl font-black text-gradient leading-none">{bookmarks.size}</p>
              <p className="text-[8px] uppercase tracking-widest font-bold mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'signets' : 'علامات'}
              </p>
            </div>
            <div className="glass-card px-4 py-2.5 text-center flex-shrink-0">
              <p className="text-xl font-black text-gradient leading-none">{filtered.length}</p>
              <p className="text-[8px] uppercase tracking-widest font-bold mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'versets' : 'آيات'}
              </p>
            </div>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--brand-text-muted)' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(40); }}
              placeholder={lang === 'fr' ? 'Rechercher un verset, une explication…' : 'ابحث في الآيات…'}
              className="mishkat-input pl-11"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full" style={{ color: 'var(--brand-text-muted)' }}>
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowBookmarksOnly(v => !v)}
            className="px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 flex-shrink-0 font-bold text-[10px] uppercase tracking-wider"
            style={showBookmarksOnly
              ? { background: 'var(--brand-secondary)', color: '#fff' }
              : { background: 'color-mix(in srgb, var(--brand-secondary) 10%, transparent)', color: 'var(--brand-secondary)' }
            }
          >
            <Bookmark size={14} />
            <span className="hidden sm:inline">{lang === 'fr' ? 'Signets' : 'علامات'}</span>
          </button>
        </div>
      </motion.div>

      {/* ── Verses list ── */}
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1 pb-6 custom-scrollbar">
        {visible.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={52} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--brand-primary)' }} />
            <p className="text-sm" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Aucun verset trouvé.' : 'لا توجد آية.'}
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {visible.map((verse, idx) => {
            const isBookmarked = bookmarks.has(verse.id);
            return (
              <motion.div
                id={`verse-${verse.id}`}
                key={verse.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: Math.min(idx * 0.01, 0.3) }}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedVerse(selectedVerse?.id === verse.id ? null : verse)}
                className="glass-card p-5 cursor-pointer group relative overflow-hidden"
                style={{ borderLeft: isBookmarked ? '3px solid var(--brand-secondary)' : '3px solid transparent' }}
              >
                <div className="card-accent-bar" />

                {/* Verse number + actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                         style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}>
                      {verse.id}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--brand-text-muted)' }}>
                      {lang === 'fr' ? `Verset ${verse.id}` : `آية ${verse.id}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); copyVerse(verse); }}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{ color: 'var(--brand-text-muted)', background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}
                      title={lang === 'fr' ? 'Copier' : 'نسخ'}
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={e => toggleBookmark(verse.id, e)}
                      className="p-1.5 rounded-lg transition-all hover:scale-110"
                      style={{
                        color: isBookmarked ? 'var(--brand-secondary)' : 'var(--brand-text-muted)',
                        background: isBookmarked ? 'color-mix(in srgb, var(--brand-secondary) 12%, transparent)' : 'color-mix(in srgb, var(--brand-primary) 6%, transparent)'
                      }}
                      title={lang === 'fr' ? (isBookmarked ? 'Retirer le signet' : 'Ajouter un signet') : (isBookmarked ? 'إزالة العلامة' : 'إضافة علامة')}
                    >
                      {isBookmarked ? <BookMarked size={12} /> : <Bookmark size={12} />}
                    </button>
                  </div>
                </div>

                {/* Arabic text */}
                <p className="text-right text-xl leading-loose font-arabic mb-3"
                   style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif', lineHeight: '2.2' }}>
                  {verse.arabic}
                </p>

                {/* Explication (expandable) */}
                <AnimatePresence>
                  {(selectedVerse?.id === verse.id || search) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <p className="text-sm leading-relaxed italic" style={{ color: 'var(--brand-text-muted)' }}>
                          {verse.explication}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expand indicator */}
                {selectedVerse?.id !== verse.id && !search && (
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-60 transition-opacity"
                       style={{ color: 'var(--brand-text-muted)' }}>
                    <ChevronDown size={10} />
                    {lang === 'fr' ? 'Voir explication' : 'عرض التفسير'}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Infinite scroll trigger */}
        {visible.length < filtered.length && (
          <div ref={loaderRef} className="flex justify-center py-6">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--brand-primary)', opacity: 0.3 }}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </div>
        )}

        {/* End of list */}
        {visible.length > 0 && visible.length >= filtered.length && (
          <div className="text-center py-8 space-y-2">
            <p className="text-[9px] uppercase tracking-widest font-black" style={{ color: 'var(--brand-text-muted)', opacity: 0.5 }}>
              {lang === 'fr' ? `— Fin des ${filtered.length} versets —` : `— نهاية الآيات (${filtered.length}) —`}
            </p>
          </div>
        )}
      </div>

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

      {/* ── Scroll to top ── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 md:bottom-8 right-4 z-40 w-10 h-10 rounded-full shadow-xl flex items-center justify-center"
        style={{ background: 'var(--brand-primary)', color: '#fff' }}
        title={lang === 'fr' ? 'Haut de page' : 'أعلى الصفحة'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronUp size={18} />
      </motion.button>
    </div>
  );
};
