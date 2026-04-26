import React, { useState, useRef, useMemo, useCallback } from 'react';
import { AL_BAQARA, Verse } from '../data/alBaqaraData';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';

const VERSES_PER_PAGE = 15;
const MAX_W = '820px';

interface AlBaqaraProps {
  userData: UserData;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  lang: 'fr' | 'ar';
  onBack?: () => void;
}

export const AlBaqaraSection = ({ userData, setUserData, lang }: AlBaqaraProps) => {
  const t = useT();
  const [search, setSearch]                     = useState('');
  const [currentPage, setCurrentPage]           = useState(1);
  const [copied, setCopied]                     = useState(false);
  const [showExplications, setShowExplications] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedVerse, setSelectedVerse]       = useState<Verse | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const fr = lang === 'fr';

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
        v.arabic.includes(search) || v.explication.toLowerCase().includes(q) || String(v.id) === q
      );
    }
    return list;
  }, [search, showBookmarksOnly, bookmarks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / VERSES_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const pageVerses = filtered.slice((safePage - 1) * VERSES_PER_PAGE, safePage * VERSES_PER_PAGE);

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

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
  };

  const PageNav = ({ pos }: { pos: 'top' | 'bottom' }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, maxWidth: MAX_W, margin: '0 auto', marginBottom: pos === 'top' ? 12 : 0, marginTop: pos === 'bottom' ? 20 : 0 }}>
      <button onClick={() => goTo(safePage - 1)} disabled={safePage <= 1}
        style={{ ...btnBase, background: t.card, border: `1px solid ${t.line}`, color: t.ink, opacity: safePage <= 1 ? 0.3 : 1 }}>
        <Icon d={Icons.arrow} size={13} color={t.ink} style={{ transform: 'rotate(180deg)' } as React.CSSProperties}/>
        <span style={{ display: 'none' }}>{fr ? 'Précédent' : 'السابق'}</span>
      </button>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => goTo(p)}
            style={{
              borderRadius: '50%', height: 8, transition: 'all 0.2s', cursor: 'pointer',
              width: p === safePage ? 24 : 8,
              background: p === safePage ? t.accent : `${t.inkMute}50`,
              border: 'none',
            }}/>
        ))}
        {totalPages > 10 && <span style={{ fontSize: 10, fontWeight: 700, color: t.inkMute }}>…{totalPages}</span>}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: t.ink }}>{safePage} / {totalPages}</div>

      <button onClick={() => goTo(safePage + 1)} disabled={safePage >= totalPages}
        style={{ ...btnBase, background: t.card, border: `1px solid ${t.line}`, color: t.ink, opacity: safePage >= totalPages ? 0.3 : 1 }}>
        <span style={{ display: 'none' }}>{fr ? 'Suivant' : 'التالي'}</span>
        <Icon d={Icons.arrow} size={13} color={t.ink}/>
      </button>
    </div>
  );

  const VerseBadge = ({ id }: { id: number }) => {
    const marked = bookmarks.has(id);
    return (
      <span onClick={e => toggleBookmark(id, { stopPropagation: e.stopPropagation } as React.MouseEvent)}
        style={{
          display: 'inline-block', width: 24, height: 24, lineHeight: '24px', textAlign: 'center',
          verticalAlign: 'middle', borderRadius: '50%', fontSize: 10, fontWeight: 900,
          fontFamily: 'Inter, sans-serif', cursor: 'pointer', margin: '0 4px', flexShrink: 0,
          background: marked ? `${t.accentBright}44` : `${t.accentBright}18`,
          color: t.accentBright,
          border: `1.5px solid ${marked ? `${t.accentBright}80` : `${t.accentBright}30`}`,
        }}>
        {id}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ flexShrink: 0, paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 36, color: t.ink, lineHeight: 1.4 }}>سورة البقرة</div>
            <div style={{ fontSize: 11, color: t.accentBright, marginTop: 4 }}>
              {fr
                ? `Al-Baqarah · ${filtered.length} versets · Page ${safePage}/${totalPages}`
                : `البقرة · ${filtered.length} آية · صفحة ${safePage}/${totalPages}`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setShowExplications(v => !v)}
              style={{ ...btnBase, background: showExplications ? t.accent : t.card, border: `1px solid ${showExplications ? t.accent : t.line}`, color: showExplications ? '#1a0f00' : t.inkDim }}>
              <Icon d={Icons.list} size={13} color={showExplications ? '#1a0f00' : t.inkDim}/>
              {fr ? 'Tafsir' : 'تفسير'}
            </button>
            <button onClick={() => { setShowBookmarksOnly(v => !v); setCurrentPage(1); setSelectedVerse(null); }}
              style={{ ...btnBase, background: showBookmarksOnly ? t.accent : t.card, border: `1px solid ${showBookmarksOnly ? t.accent : t.line}`, color: showBookmarksOnly ? '#1a0f00' : t.inkDim }}>
              <Icon d={Icons.bookmark} size={13} color={showBookmarksOnly ? '#1a0f00' : t.inkDim}/>
              {fr ? `Signets${bookmarks.size > 0 ? ` (${bookmarks.size})` : ''}` : 'علامات'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon d={Icons.search} size={13} color={t.inkMute}/>
          </div>
          <input value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); setSelectedVerse(null); }}
            placeholder={fr ? 'Verset, explication, numéro…' : 'ابحث في الآيات…'}
            style={{ width: '100%', padding: '11px 36px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 8, color: t.ink, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}/>
          {search && (
            <button onClick={() => { setSearch(''); setCurrentPage(1); }}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: t.inkMute, cursor: 'pointer', background: 'none', border: 'none', fontSize: 14 }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Icon d={Icons.book} size={44} color={t.inkMute}/>
          <div style={{ fontSize: 13, color: t.inkMute }}>{fr ? 'Aucun verset trouvé.' : 'لا توجد آية.'}</div>
        </div>
      )}

      {/* Content */}
      {filtered.length > 0 && (
        <div ref={pageRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>

          {totalPages > 1 && <PageNav pos="top"/>}

          {/* Page container */}
          <div style={{ maxWidth: MAX_W, margin: '0 auto', background: t.bgSoft, border: `1px solid ${t.line}`, borderRadius: 20, overflow: 'hidden' }}>
            {/* top bar */}
            <div style={{ height: 3, background: `linear-gradient(90deg, ${t.accent}, ${t.accentBright}, ${t.accent})` }}/>

            {/* Bismillah */}
            {safePage === 1 && !search && !showBookmarksOnly && (
              <div style={{ textAlign: 'center', padding: '24px 16px 12px' }}>
                <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 26, color: t.accentBright, lineHeight: 2 }}>
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </div>
                <div style={{ height: 1, margin: '10px 48px 0', background: `linear-gradient(90deg, transparent, ${t.accent}60, transparent)` }}/>
              </div>
            )}

            {/* Verses */}
            <div style={{ padding: '20px 32px 32px' }}>
              {showExplications ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {pageVerses.map(verse => {
                    const marked = bookmarks.has(verse.id);
                    return (
                      <div key={verse.id} style={{ position: 'relative' }}>
                        {marked && <div style={{ position: 'absolute', left: -8, top: 2, bottom: 2, width: 2, borderRadius: 2, background: t.accent }}/>}
                        <div dir="rtl" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                          <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 22, color: t.ink, lineHeight: 2.2, flex: 1, textAlign: 'right' }}>{verse.arabic}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingTop: 4, flexShrink: 0 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, background: `${t.accentBright}22`, color: t.accentBright, border: `1.5px solid ${t.accentBright}44` }}>
                              {verse.id}
                            </div>
                            <button onClick={e => toggleBookmark(verse.id, e)}
                              style={{ padding: 4, cursor: 'pointer', color: marked ? t.accent : t.inkMute, opacity: marked ? 1 : 0.4, background: 'none', border: 'none', fontSize: 12 }}>
                              {marked ? '🔖' : '📄'}
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.7, fontStyle: 'italic', color: t.inkDim, paddingLeft: 8, borderLeft: `2px solid ${t.line}` }}>
                          {verse.explication}
                        </div>
                        <div style={{ marginTop: 20, height: 1, background: `${t.line}80` }}/>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p dir="rtl" style={{ textAlign: 'right', fontFamily: 'Amiri Quran, serif', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', lineHeight: 2.6, color: t.ink }}>
                  {pageVerses.map(verse => (
                    <React.Fragment key={verse.id}>
                      <span onClick={() => setSelectedVerse(selectedVerse?.id === verse.id ? null : verse)}
                        style={{
                          cursor: 'pointer', borderRadius: 3, padding: '0 2px', transition: 'background 0.15s',
                          background: selectedVerse?.id === verse.id ? `${t.accentBright}20` : 'transparent',
                        }}>
                        {verse.arabic}
                      </span>
                      <VerseBadge id={verse.id}/>
                    </React.Fragment>
                  ))}
                </p>
              )}
            </div>

            {/* Page footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', borderTop: `1px solid ${t.line}` }}>
              <span style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: t.inkMute, opacity: 0.5 }}>
                {fr ? `Page ${safePage}` : `صفحة ${safePage}`}
              </span>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                {pageVerses.map(v => (
                  <div key={v.id} style={{ width: 5, height: 5, borderRadius: '50%', background: bookmarks.has(v.id) ? t.accent : t.line }}/>
                ))}
              </div>
              <span style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, color: t.inkMute, opacity: 0.5 }}>
                {pageVerses[0]?.id}–{pageVerses[pageVerses.length - 1]?.id}
              </span>
            </div>
          </div>

          {/* Selected verse detail */}
          {selectedVerse && !showExplications && (
            <div style={{ maxWidth: MAX_W, margin: '14px auto 0', background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, padding: '16px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: t.cardElev, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: t.ink }}>
                    {selectedVerse.id}
                  </div>
                  <span style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkMute }}>
                    {fr ? `Verset ${selectedVerse.id}` : `الآية ${selectedVerse.id}`}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={e => copyVerse(selectedVerse, e)}
                    style={{ padding: 8, borderRadius: 8, background: t.cardElev, border: `1px solid ${t.line}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {copied ? <Icon d={Icons.check} size={13} color={t.accent}/> : <Icon d={Icons.layers} size={13} color={t.inkMute}/>}
                  </button>
                  <button onClick={e => toggleBookmark(selectedVerse.id, e)}
                    style={{ padding: 8, borderRadius: 8, background: t.cardElev, border: `1px solid ${t.line}`, cursor: 'pointer', color: bookmarks.has(selectedVerse.id) ? t.accent : t.inkMute, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d={Icons.bookmark} size={13} color={bookmarks.has(selectedVerse.id) ? t.accent : t.inkMute}/>
                  </button>
                  <button onClick={() => setSelectedVerse(null)}
                    style={{ padding: 8, borderRadius: 8, background: t.cardElev, border: `1px solid ${t.line}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: t.inkMute }}>
                    ✕
                  </button>
                </div>
              </div>
              <p dir="rtl" style={{ textAlign: 'right', fontFamily: 'Amiri Quran, serif', fontSize: 20, color: t.ink, lineHeight: 2.2, marginBottom: 12 }}>
                {selectedVerse.arabic}
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.7, fontStyle: 'italic', color: t.inkDim, paddingTop: 12, borderTop: `1px solid ${t.line}` }}>
                {selectedVerse.explication}
              </p>
            </div>
          )}

          {totalPages > 1 && <PageNav pos="bottom"/>}
        </div>
      )}

      {/* Copy toast */}
      {copied && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 20, background: t.accent, color: '#1a0f00', pointerEvents: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontWeight: 700, fontSize: 12 }}>
          <Icon d={Icons.check} size={14} color="#1a0f00"/>
          {fr ? 'Copié !' : 'تم النسخ!'}
        </div>
      )}
    </div>
  );
};
