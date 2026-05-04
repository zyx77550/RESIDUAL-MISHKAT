import React, { useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '../lib/theme';

interface Dhikr {
  id: string;
  ar: string;
  tr: string;
  fr: string;
  count: number;
  source?: string;
}

const MORNING: Dhikr[] = [
  {
    id: 'm1',
    ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    tr: 'Aṣbaḥnā wa aṣbaḥa al-mulku lillāh',
    fr: 'Nous voici au matin, et la royauté appartient à Allah seul',
    count: 1,
    source: 'Abū Dāwūd',
  },
  {
    id: 'm2',
    ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    tr: 'Allāhumma bika aṣbaḥnā wa bika amsaynā',
    fr: 'Ô Allah, c\'est grâce à Toi que nous entrons dans le matin et dans le soir, que nous vivons et mourons',
    count: 1,
    source: 'Tirmidhī',
  },
  {
    id: 'm3',
    ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
    tr: 'Allāhumma anta rabbī lā ilāha illā anta',
    fr: 'Ô Allah, Tu es mon Seigneur, nul dieu sinon Toi. Tu m\'as créé et je suis Ton serviteur',
    count: 1,
    source: 'Bukhārī',
  },
  {
    id: 'm4',
    ar: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    tr: 'Raḍītu billāhi rabban wa bil-islāmi dīnan',
    fr: 'Je me suis satisfait d\'Allah comme Seigneur, de l\'Islam comme religion, et de Muhammad ﷺ comme prophète',
    count: 3,
    source: 'Abū Dāwūd',
  },
  {
    id: 'm5',
    ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    tr: 'Subḥānallāhi wa biḥamdih',
    fr: 'Gloire à Allah et à Sa louange',
    count: 100,
    source: 'Muslim',
  },
  {
    id: 'm6',
    ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    tr: 'Lā ilāha illallāhu waḥdahu lā sharīka lah',
    fr: 'Il n\'y a de dieu qu\'Allah, seul, sans associé. À Lui la royauté et la louange',
    count: 10,
    source: 'Bukhārī / Muslim',
  },
  {
    id: 'm7',
    ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    tr: 'Bismillāhil-ladhī lā yaḍurru ma\'a ismihi shay\'',
    fr: 'Au nom d\'Allah, avec Son nom rien ne peut causer de tort, ni sur terre ni dans le ciel',
    count: 3,
    source: 'Abū Dāwūd / Tirmidhī',
  },
  {
    id: 'm8',
    ar: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    tr: 'Ḥasbiyallāhu lā ilāha illā hū',
    fr: 'Allah me suffit, nul dieu sinon Lui. En Lui je place ma confiance',
    count: 7,
    source: 'Abū Dāwūd',
  },
];

const EVENING: Dhikr[] = [
  {
    id: 'e1',
    ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    tr: 'Amsaynā wa amsal-mulku lillāh',
    fr: 'Nous voici au soir, et la royauté appartient à Allah seul',
    count: 1,
    source: 'Abū Dāwūd',
  },
  {
    id: 'e2',
    ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
    tr: 'Allāhumma bika amsaynā wa bika aṣbaḥnā',
    fr: 'Ô Allah, c\'est grâce à Toi que nous entrons dans le soir et dans le matin',
    count: 1,
    source: 'Tirmidhī',
  },
  {
    id: 'e3',
    ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
    tr: 'Allāhumma anta rabbī lā ilāha illā anta',
    fr: 'Ô Allah, Tu es mon Seigneur, nul dieu sinon Toi. Tu m\'as créé et je suis Ton serviteur',
    count: 1,
    source: 'Bukhārī',
  },
  {
    id: 'e4',
    ar: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    tr: 'Raḍītu billāhi rabban wa bil-islāmi dīnan',
    fr: 'Je me suis satisfait d\'Allah comme Seigneur, de l\'Islam comme religion',
    count: 3,
    source: 'Abū Dāwūd',
  },
  {
    id: 'e5',
    ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    tr: 'Subḥānallāhi wa biḥamdih',
    fr: 'Gloire à Allah et à Sa louange',
    count: 100,
    source: 'Muslim',
  },
  {
    id: 'e6',
    ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    tr: 'A\'ūdhu bikalimātillāhit-tāmmāti min sharri mā khalaq',
    fr: 'Je cherche refuge dans les paroles parfaites d\'Allah contre le mal de Sa création',
    count: 3,
    source: 'Muslim',
  },
  {
    id: 'e7',
    ar: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ',
    tr: 'Allāhumma innī amsaytu ush\'hiduka',
    fr: 'Ô Allah, je T\'atteste au soir, ainsi que les porteurs de Ton Trône, que Tu es Allah, nul dieu sinon Toi',
    count: 4,
    source: 'Abū Dāwūd',
  },
  {
    id: 'e8',
    ar: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    tr: 'Ḥasbiyallāhu lā ilāha illā hū',
    fr: 'Allah me suffit, nul dieu sinon Lui. En Lui je place ma confiance',
    count: 7,
    source: 'Abū Dāwūd',
  },
];

const STORAGE_KEY = 'mishkat_adhkar_progress';

function loadProgress(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProgress(p: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

interface AdhkarProps {
  lang: 'fr' | 'ar';
}

export const AdhkarSection = ({ lang }: AdhkarProps) => {
  const t = useT();
  const fr = lang === 'fr';
  const [session, setSession] = useState<'morning' | 'evening'>('morning');
  const [progress, setProgress] = useState<Record<string, number>>(loadProgress);
  const [activeIndex, setActiveIndex] = useState(0);

  const list = session === 'morning' ? MORNING : EVENING;
  const completed = list.filter(d => (progress[d.id] ?? 0) >= d.count).length;

  const tap = useCallback((dhikr: Dhikr) => {
    if ('vibrate' in navigator) navigator.vibrate(30);
    setProgress(prev => {
      const current = prev[dhikr.id] ?? 0;
      if (current >= dhikr.count) return prev;
      const next = { ...prev, [dhikr.id]: current + 1 };
      saveProgress(next);
      return next;
    });
  }, []);

  const reset = () => {
    const cleared = { ...progress };
    list.forEach(d => { delete cleared[d.id]; });
    saveProgress(cleared);
    setProgress(cleared);
  };

  const switchSession = (s: 'morning' | 'evening') => {
    setSession(s);
    setActiveIndex(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* Header */}
      <div style={{ flexShrink: 0, paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
              {fr ? 'Invocations quotidiennes' : 'أذكار اليومية'}
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, margin: 0, color: t.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {fr ? 'Adhkar' : 'أَذْكَار'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Progress pill */}
            <div style={{ padding: '6px 12px', borderRadius: 20, background: completed === list.length ? t.accentBright : t.cardElev, border: `1px solid ${t.line}`, fontSize: 11, fontWeight: 700, color: completed === list.length ? '#1a0f00' : t.inkDim }}>
              {completed}/{list.length}
            </div>
            <button onClick={reset} style={{ padding: '6px 12px', borderRadius: 8, background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkDim, fontSize: 11, cursor: 'pointer' }}>
              {fr ? '↺ Réinit.' : '↺ إعادة'}
            </button>
          </div>
        </div>

        {/* Session tabs */}
        <div style={{ display: 'flex', gap: 6, background: t.cardElev, borderRadius: 12, padding: 4 }}>
          {(['morning', 'evening'] as const).map(s => (
            <button key={s} onClick={() => switchSession(s)} style={{
              flex: 1, padding: '9px 12px', borderRadius: 9, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: session === s ? t.accent : 'transparent',
              color: session === s ? '#1a0f00' : t.inkDim,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <span>{s === 'morning' ? '🌅' : '🌙'}</span>
              <span>{s === 'morning' ? (fr ? 'Matin' : 'الصباح') : (fr ? 'Soir' : 'المساء')}</span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 12, height: 4, background: t.cardElev, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: `linear-gradient(90deg, ${t.accent}, ${t.accentBright})`,
            borderRadius: 99,
            width: `${(completed / list.length) * 100}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: t.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>{fr ? `${activeIndex + 1} / ${list.length}` : `${list.length} / ${activeIndex + 1}`}</span>
          <span>{fr ? `${completed} terminé${completed > 1 ? 's' : ''}` : `${completed} مُنجَز`}</span>
        </div>
      </div>

      {/* Swiper */}
      <AnimatePresence mode="wait">
        <motion.div
          key={session}
          initial={{ opacity: 0, x: session === 'morning' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ flex: 1, minHeight: 0 }}
        >
          <Swiper
            spaceBetween={16}
            slidesPerView={1}
            onSlideChange={sw => setActiveIndex(sw.activeIndex)}
            style={{ height: '100%', paddingBottom: 8 }}
          >
            {list.map((dhikr, i) => {
              const done = (progress[dhikr.id] ?? 0) >= dhikr.count;
              const tapped = progress[dhikr.id] ?? 0;
              return (
                <SwiperSlide key={dhikr.id} style={{ height: 'auto' }}>
                  <DhikrCard
                    dhikr={dhikr}
                    tapped={tapped}
                    done={done}
                    fr={fr}
                    t={t}
                    onTap={() => tap(dhikr)}
                    index={i}
                    total={list.length}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface DhikrCardProps {
  dhikr: Dhikr;
  tapped: number;
  done: boolean;
  fr: boolean;
  t: ReturnType<typeof useT>;
  onTap: () => void;
  index: number;
  total: number;
}

function DhikrCard({ dhikr, tapped, done, fr, t, onTap, index, total }: DhikrCardProps) {
  const pct = Math.min(tapped / dhikr.count, 1);

  return (
    <div style={{
      background: t.card,
      border: `1px solid ${done ? t.accentBright : t.line}`,
      borderRadius: 20,
      padding: '28px 24px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      minHeight: 380,
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.3s',
    }}>
      {/* Done glow */}
      {done && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 20,
          background: `radial-gradient(ellipse at center, ${t.accent}0f 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Index pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {fr ? `${index + 1} / ${total}` : `${total} / ${index + 1}`}
        </span>
        {done && (
          <span style={{ fontSize: 11, color: t.accentBright, fontWeight: 700, letterSpacing: '0.12em' }}>
            {fr ? '✓ Terminé' : '✓ أُنجِز'}
          </span>
        )}
      </div>

      {/* Arabic text */}
      <p style={{
        fontFamily: 'Amiri Quran, serif',
        fontSize: 22,
        direction: 'rtl',
        textAlign: 'right',
        color: done ? t.accentBright : t.ink,
        lineHeight: '2.2',
        flex: 1,
        margin: 0,
        transition: 'color 0.3s',
      }}>
        {dhikr.ar}
      </p>

      {/* Transliteration */}
      <div>
        <p style={{ fontSize: 13, fontStyle: 'italic', color: t.inkDim, margin: '0 0 4px', lineHeight: 1.5 }}>
          {dhikr.tr}
        </p>
        <p style={{ fontSize: 12, color: t.inkMute, margin: 0, lineHeight: 1.5 }}>
          {fr ? dhikr.fr : dhikr.fr}
        </p>
        {dhikr.source && (
          <p style={{ fontSize: 10, color: t.inkMute, margin: '6px 0 0', opacity: 0.6, letterSpacing: '0.06em' }}>
            — {dhikr.source}
          </p>
        )}
      </div>

      {/* Counter progress bar */}
      {dhikr.count > 1 && (
        <div>
          <div style={{ height: 5, background: t.cardElev, borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{
              height: '100%',
              background: done ? t.accentBright : t.accent,
              borderRadius: 99,
              width: `${pct * 100}%`,
              transition: 'width 0.2s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.inkMute }}>
            <span>{tapped} / {dhikr.count}</span>
            <span style={{ fontFamily: 'Amiri Quran, serif', fontSize: 12 }}>×{dhikr.count}</span>
          </div>
        </div>
      )}

      {/* Tap button */}
      <button
        onClick={onTap}
        disabled={done}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 14,
          border: 'none',
          background: done ? `${t.accent}18` : t.accent,
          color: done ? t.inkMute : '#1a0f00',
          fontWeight: 700,
          fontSize: 15,
          cursor: done ? 'default' : 'pointer',
          transition: 'all 0.2s',
          letterSpacing: '0.05em',
        }}
      >
        {done
          ? (fr ? '✓ Fait' : '✓ تم')
          : dhikr.count === 1
            ? (fr ? 'Réciter' : 'اقرأ')
            : (fr ? `+1 · ${dhikr.count - tapped} restant${dhikr.count - tapped > 1 ? 's' : ''}` : `+١ · ${dhikr.count - tapped} متبقٍّ`)}
      </button>
    </div>
  );
}
