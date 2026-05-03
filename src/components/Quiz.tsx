import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, RotateCcw, ChevronLeft, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import { IslamicLoader } from './IslamicLoader';
import { supabase, QuranVerse } from '../lib/supabase';
import { SURAH_DATA } from '../types';
import { useT } from '../lib/theme';

interface QuizProps {
  lang: 'fr' | 'ar';
}

type Mode = 'ar_to_fr' | 'fr_to_ar';
type Result = 'known' | 'again';

interface CardResult {
  verse: QuranVerse;
  result: Result;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const QuizSection = ({ lang }: QuizProps) => {
  const t = useT();
  const fr = lang === 'fr';

  const [phase, setPhase] = useState<'select' | 'quiz' | 'done'>('select');
  const [surahId, setSurahId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('ar_to_fr');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<QuranVerse[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<CardResult[]>([]);
  const [surahSearch, setSurahSearch] = useState('');

  const filteredSurahs = useMemo(() => {
    if (!surahSearch.trim()) return SURAH_DATA;
    const q = surahSearch.toLowerCase();
    return SURAH_DATA.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.arabicName.includes(surahSearch) ||
      s.id.toString() === q
    );
  }, [surahSearch]);

  const startQuiz = useCallback(async (id: number) => {
    setSurahId(id);
    setLoading(true);
    const { data, error } = await supabase
      .from('quran_verses')
      .select('*')
      .eq('surah_number', id)
      .order('ayah_number');
    setLoading(false);
    if (error || !data?.length) return;
    setCards(shuffle(data));
    setCardIdx(0);
    setFlipped(false);
    setResults([]);
    setPhase('quiz');
  }, []);

  const answer = useCallback((result: Result) => {
    const verse = cards[cardIdx];
    const newResults = [...results, { verse, result }];
    setResults(newResults);
    if (cardIdx + 1 >= cards.length) {
      setPhase('done');
    } else {
      setCardIdx(i => i + 1);
      setFlipped(false);
    }
  }, [cards, cardIdx, results]);

  const restart = () => {
    setCards(shuffle(cards));
    setCardIdx(0);
    setFlipped(false);
    setResults([]);
    setPhase('quiz');
  };

  const goToSelect = () => {
    setPhase('select');
    setSurahId(null);
    setSurahSearch('');
  };

  const currentCard = cards[cardIdx];
  const surah = surahId ? SURAH_DATA.find(s => s.id === surahId) : null;
  const knownCount = results.filter(r => r.result === 'known').length;

  // ── Select phase ─────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="flex flex-col h-full gap-0">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 pb-5">
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
              {fr ? 'Mémorisation' : 'حفظ'}
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, margin: 0, color: t.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {fr ? 'Quiz Coran' : 'اختبار القرآن'}
            </h1>
          </div>

          {/* Mode selector */}
          <div style={{ display: 'flex', gap: 6, background: t.cardElev, borderRadius: 12, padding: 4, marginBottom: 14 }}>
            {([['ar_to_fr', fr ? 'Arabe → Français' : 'عربي → فرنسي'], ['fr_to_ar', fr ? 'Français → Arabe' : 'فرنسي → عربي']] as const).map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px 10px', borderRadius: 9, fontSize: 11, fontWeight: 700,
                letterSpacing: '0.08em',
                background: mode === m ? 'var(--brand-primary)' : 'transparent',
                color: mode === m ? '#fff' : t.inkDim,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {label}
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
              <IslamicLoader size={20} />
              <span style={{ fontSize: 12, color: t.inkMute }}>{fr ? 'Chargement…' : 'جارٍ التحميل…'}</span>
            </div>
          )}

          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.inkMute }} />
            <input
              value={surahSearch}
              onChange={e => setSurahSearch(e.target.value)}
              placeholder={fr ? 'Choisir une sourate…' : 'اختر سورة…'}
              className="mishkat-input pl-11"
            />
            {surahSearch && (
              <button onClick={() => setSurahSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                <X size={13} style={{ color: t.inkMute }} />
              </button>
            )}
          </div>
        </motion.div>

        <div className="flex-1 overflow-y-auto pr-1 pb-6 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSurahs.map(s => (
              <motion.button
                key={s.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startQuiz(s.id)}
                className="glass-card p-4 text-left flex items-center gap-4 group relative overflow-hidden"
              >
                <div className="card-accent-bar" />
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm"
                  style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)' }}
                >
                  {s.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold truncate" style={{ color: 'var(--brand-primary)', fontFamily: 'Amiri, serif', direction: 'rtl' }}>
                    {s.arabicName}
                  </p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--brand-secondary)' }}>
                    {s.name} · {s.verses} {fr ? 'v.' : 'آية'}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Done phase ───────────────────────────────────────────────
  if (phase === 'done') {
    const total = results.length;
    const pct = Math.round((knownCount / total) * 100);
    return (
      <div className="flex flex-col h-full items-center justify-center gap-6 text-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: pct >= 80 ? t.accentBright : pct >= 50 ? t.accent : t.cardElev,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 40, margin: '0 auto',
          }}>
            {pct >= 80 ? '🌟' : pct >= 50 ? '✨' : '📚'}
          </div>
        </motion.div>
        <div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 28, color: t.ink, margin: '0 0 8px' }}>
            {fr ? 'Session terminée !' : 'انتهت الجلسة!'}
          </h2>
          <p style={{ fontSize: 48, fontFamily: 'Fraunces, serif', fontWeight: 300, color: pct >= 80 ? t.accentBright : t.ink, lineHeight: 1, margin: '0 0 6px' }}>
            {pct}%
          </p>
          <p style={{ fontSize: 14, color: t.inkDim }}>
            {fr ? `${knownCount} connu${knownCount > 1 ? 's' : ''} sur ${total}` : `${knownCount} من ${total} محفوظ`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={restart} style={{
            padding: '12px 24px', borderRadius: 12, background: 'var(--brand-primary)',
            color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <RotateCcw size={16}/> {fr ? 'Rejouer' : 'إعادة'}
          </button>
          <button onClick={goToSelect} style={{
            padding: '12px 24px', borderRadius: 12, background: t.cardElev,
            border: `1px solid ${t.line}`, color: t.inkDim, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <ChevronLeft size={16}/> {fr ? 'Sourates' : 'السور'}
          </button>
        </div>

        {/* Review list */}
        <div style={{ width: '100%', maxWidth: 480, maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {results.map(({ verse, result }, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 10,
              background: result === 'known' ? `color-mix(in srgb, var(--brand-primary) 8%, transparent)` : t.cardElev,
              border: `1px solid ${result === 'known' ? 'var(--brand-primary)' : t.line}`,
            }}>
              {result === 'known'
                ? <CheckCircle2 size={14} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                : <XCircle size={14} style={{ color: t.inkMute, flexShrink: 0 }} />}
              <span style={{ fontSize: 13, fontFamily: 'Amiri, serif', direction: 'rtl', color: t.inkDim, flex: 1, textAlign: 'right', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {verse.arabic_text.slice(0, 40)}…
              </span>
              <span style={{ fontSize: 10, color: t.inkMute, flexShrink: 0 }}>
                {verse.surah_number}:{verse.ayah_number}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Quiz phase ───────────────────────────────────────────────
  if (!currentCard) return null;

  const question = mode === 'ar_to_fr' ? currentCard.arabic_text : currentCard.french_text;
  const answer_  = mode === 'ar_to_fr' ? currentCard.french_text : currentCard.arabic_text;
  const questionIsAr = mode === 'ar_to_fr';
  const progress = (cardIdx / cards.length) * 100;

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Header */}
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={goToSelect} style={{ padding: '8px', borderRadius: 10, background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkDim, cursor: 'pointer' }}>
            <ChevronLeft size={16}/>
          </button>
          <div className="flex-1">
            <p style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', margin: 0 }}>
              {surah?.name} · {fr ? `${cardIdx + 1} / ${cards.length}` : `${cards.length} / ${cardIdx + 1}`}
            </p>
          </div>
          <span style={{ fontSize: 11, color: t.accentBright, fontWeight: 700 }}>
            {knownCount} ✓
          </span>
        </div>
        <div style={{ height: 4, background: t.cardElev, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--brand-primary)', borderRadius: 99, width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={cardIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', maxWidth: 520 }}
          >
            <div
              onClick={() => !flipped && setFlipped(true)}
              style={{
                background: t.card,
                border: `1px solid ${t.line}`,
                borderRadius: 20,
                padding: '36px 28px',
                minHeight: 280,
                cursor: flipped ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--brand-primary) 2%, transparent)', borderRadius: 20 }} />

              {/* Question */}
              <div style={{ width: '100%', textAlign: questionIsAr ? 'right' : 'left' }}>
                <p style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
                  {fr ? 'Question' : 'السؤال'}
                </p>
                <p style={{
                  fontFamily: questionIsAr ? 'Amiri, serif' : 'Fraunces, serif',
                  fontSize: questionIsAr ? 26 : 18,
                  direction: questionIsAr ? 'rtl' : 'ltr',
                  color: t.ink,
                  lineHeight: questionIsAr ? 2 : 1.6,
                  margin: 0,
                  fontStyle: !questionIsAr ? 'italic' : 'normal',
                }}>
                  {question}
                </p>
              </div>

              {/* Divider + answer */}
              <AnimatePresence>
                {flipped && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ width: '100%', overflow: 'hidden' }}
                  >
                    <div style={{ height: 1, background: t.line, margin: '8px 0 16px' }} />
                    <p style={{ fontSize: 9, color: t.accentBright, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
                      {fr ? 'Réponse' : 'الجواب'}
                    </p>
                    <p style={{
                      fontFamily: !questionIsAr ? 'Amiri, serif' : 'Fraunces, serif',
                      fontSize: !questionIsAr ? 24 : 16,
                      direction: !questionIsAr ? 'rtl' : 'ltr',
                      color: t.accentBright,
                      lineHeight: !questionIsAr ? 2 : 1.7,
                      margin: 0,
                      textAlign: !questionIsAr ? 'right' : 'left',
                      fontStyle: questionIsAr ? 'italic' : 'normal',
                    }}>
                      {answer_}
                    </p>
                    <p style={{ fontSize: 10, color: t.inkMute, marginTop: 8 }}>
                      {surah?.name} · {fr ? `Verset ${currentCard.ayah_number}` : `آية ${currentCard.ayah_number}`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tap to reveal hint */}
              {!flipped && (
                <p style={{ fontSize: 11, color: t.inkMute, fontStyle: 'italic', position: 'absolute', bottom: 16 }}>
                  {fr ? 'Appuyer pour révéler' : 'انقر للكشف'}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
        <AnimatePresence>
          {flipped && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 520 }}
            >
              <button
                onClick={() => answer('again')}
                style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  background: t.cardElev, border: `1px solid ${t.line}`,
                  color: t.inkDim, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <RotateCcw size={16}/> {fr ? 'À revoir' : 'مراجعة'}
              </button>
              <button
                onClick={() => answer('known')}
                style={{
                  flex: 1, padding: '14px', borderRadius: 14,
                  background: 'var(--brand-primary)',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <CheckCircle2 size={16}/> {fr ? 'Je sais' : 'أعرفه'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
