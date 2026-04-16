import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon, BookOpen, Target, Award,
  CheckCircle2, Circle, Flame, Sparkles, TrendingUp, ChevronRight, Clock, MapPin
} from 'lucide-react';
import { UserData } from '../types';
import { cn } from '../lib/utils';
import { getNextBadgeToUnlock, getBadgeProgress } from '../lib/badgeEngine';

interface PrayerTime { name: string; nameAr: string; time: string; }

async function fetchPrayerTimes(city: string): Promise<PrayerTime[]> {
  try {
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=&method=2`);
    const data = await res.json();
    if (data.code !== 200) return [];
    const t = data.data.timings;
    return [
      { name: 'Fajr',    nameAr: 'الفجر',   time: t.Fajr    },
      { name: 'Dhuhr',   nameAr: 'الظهر',   time: t.Dhuhr   },
      { name: 'Asr',     nameAr: 'العصر',   time: t.Asr     },
      { name: 'Maghrib', nameAr: 'المغرب',  time: t.Maghrib },
      { name: 'Isha',    nameAr: 'العشاء',  time: t.Isha    },
    ];
  } catch { return []; }
}

async function fetchVerseOfDay(): Promise<{ ar: string; fr: string; ref: string } | null> {
  try {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const verseNum = (dayOfYear % 6236) + 1;
    const [arRes, frRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${verseNum}/ar.alafasy`),
      fetch(`https://api.alquran.cloud/v1/ayah/${verseNum}/fr.hamidullah`),
    ]);
    const [arData, frData] = await Promise.all([arRes.json(), frRes.json()]);
    if (arData.code !== 200) return null;
    return {
      ar: arData.data.text,
      fr: frData.data.text,
      ref: `${arData.data.surah.englishName} ${arData.data.numberInSurah}:${arData.data.surah.number}`,
    };
  } catch { return null; }
}

const QUOTES = [
  { ar: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ', fr: 'Nous faisons descendre du Coran ce qui est une guérison et une miséricorde.' },
  { ar: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ', fr: 'Certes ce Coran guide vers ce qui est le plus droit.' },
  { ar: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ', fr: 'Nous avons facilité le Coran pour la méditation. Y a-t-il quelqu\'un pour réfléchir?' },
  { ar: 'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ', fr: 'Ceux qui croient et dont les cœurs se tranquillisent au souvenir d\'Allah.' },
  { ar: 'فَاقْرَءُوا مَا تَيَسَّرَ مِنَ الْقُرْآنِ', fr: 'Récitez ce qui vous est facile du Coran.' },
  { ar: 'كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ', fr: 'Un Livre béni que Nous t\'avons révélé, afin qu\'ils méditent ses versets.' },
  { ar: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا', fr: 'Et récite le Coran lentement et distinctement.' },
];

export const Dashboard = ({ userData, lang }: { userData: UserData; lang: string }) => {
  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const inProgressCount = userData.surahs.filter(s => s.status === 'in_progress').length;
  const reviewCount = userData.surahs.filter(s => s.status === 'review').length;
  const progress = (memorizedCount / 114) * 100;
  const username = userData.settings?.username || 'Hafiz';
  const streak = userData.loginStreak || 1;
  const city = userData.settings?.city;

  const [apiVerse, setApiVerse] = useState<{ ar: string; fr: string; ref: string } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    fetchVerseOfDay().then(v => { if (v) setApiVerse(v); });
  }, []);

  useEffect(() => {
    if (!city) return;
    fetchPrayerTimes(city).then(setPrayerTimes);
  }, [city]);

  useEffect(() => {
    const t = setInterval(() => setNowTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const nextPrayer = useMemo(() => {
    if (!prayerTimes.length) return null;
    const now = nowTime.getHours() * 60 + nowTime.getMinutes();
    for (const p of prayerTimes) {
      const [h, m] = p.time.split(':').map(Number);
      const mins = h * 60 + m;
      if (mins > now) return { ...p, minsLeft: mins - now };
    }
    return { ...prayerTimes[0], minsLeft: 24 * 60 - now + parseInt(prayerTimes[0].time.split(':')[0]) * 60 + parseInt(prayerTimes[0].time.split(':')[1]) };
  }, [prayerTimes, nowTime]);

  const todayQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  const nextBadge = useMemo(() => getNextBadgeToUnlock(userData), [userData]);
  const nextBadgeProgress = nextBadge ? getBadgeProgress(userData, nextBadge.id) : 0;

  const completedGoals = userData.goals.filter(g => g.completed).length;
  const calendarDays = userData.calendar.length;

  const dateStr = lang === 'fr'
    ? new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

  const greeting = lang === 'fr'
    ? (username === 'Rahima' ? 'Bienvenue,' : 'As-salāmu ʿalaykum,')
    : 'السلام عليك،';

  const stagger = (i: number) => ({ initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, ease: 'easeOut' } });

  return (
    <div className="space-y-7 pb-4">

      {/* ── Header ── */}
      <header className="flex flex-wrap justify-between items-end gap-4">
        <motion.div {...stagger(0)}>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mb-2"
             style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>{dateStr}</p>
          <h2 className="text-4xl sm:text-5xl leading-tight" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{greeting}</h2>
          <h2 className="text-4xl sm:text-5xl leading-tight text-gradient" style={{ fontWeight: 700 }}>
            {lang === 'fr' ? username : `يا ${username}`}
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-px w-8" style={{ background: 'var(--brand-secondary)', opacity: 0.4 }} />
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase"
               style={{ color: 'var(--brand-secondary)', opacity: 0.55 }}>تَطْبِيقُ الحِفْظِ المِثَالِي</p>
            <div className="h-px w-8" style={{ background: 'var(--brand-secondary)', opacity: 0.4 }} />
          </div>
        </motion.div>

        {/* Streak badge */}
        <motion.div {...stagger(1)}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl relative overflow-hidden"
          style={{ background: `color-mix(in srgb, var(--brand-primary) 8%, transparent)`, border: '1px solid var(--border-subtle)' }}>
          <div className="absolute inset-0 shimmer opacity-50 pointer-events-none" />
          <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10"
               style={{ background: 'var(--brand-primary)' }}>
            <Flame size={18} className="text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-2xl font-black text-gradient leading-none">{streak}</p>
            <p className="text-[9px] uppercase tracking-widest font-bold mt-0.5"
               style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'jours de suite' : 'يوم متواصل'}
            </p>
          </div>
        </motion.div>
      </header>

      {/* ── Main grid: progress + stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Circular progress */}
        <motion.div {...stagger(2)}
          className="glass-card p-10 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="card-accent-bar" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
               style={{ background: 'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--brand-secondary) 6%, transparent), transparent 70%)' }} />

          <div className="relative w-44 h-44">
            <div className="absolute inset-0 rounded-full animate-ping-slow"
                 style={{ border: '1px dashed var(--border-accent)', opacity: 0.4 }} />
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="5" fill="transparent"
                      style={{ color: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }} />
              <motion.circle cx="50" cy="50" r="42" stroke="url(#progressGrad)" strokeWidth="6"
                fill="transparent" strokeDasharray="263.9" strokeDashoffset={263.9 * (1 - progress / 100)}
                initial={{ strokeDashoffset: 263.9 }}
                animate={{ strokeDashoffset: 263.9 * (1 - progress / 100) }}
                transition={{ duration: 2.4, ease: 'easeOut' }}
                strokeLinecap="round" />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--brand-primary)" />
                  <stop offset="100%" stopColor="var(--brand-secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span className="text-5xl text-gradient" style={{ fontWeight: 700 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                {Math.round(progress)}%
              </motion.span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-black mt-1"
                    style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'Accompli' : 'تم الإنجاز'}
              </span>
            </div>
          </div>

          <h3 className="mt-6 text-2xl" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
            {lang === 'fr' ? 'Votre Voyage' : 'رحلتك'}
          </h3>
          <p className="text-sm mt-2 max-w-[190px] leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? `${memorizedCount} / 114 sourates mémorisées` : `${memorizedCount} / 114 سورة محفوظة`}
          </p>

          {/* Mini status pills */}
          <div className="mt-4 flex gap-2 flex-wrap justify-center">
            {inProgressCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                    style={{ background: 'color-mix(in srgb, var(--brand-accent) 18%, transparent)', color: 'var(--brand-primary)' }}>
                {inProgressCount} {lang === 'fr' ? 'en cours' : 'قيد الحفظ'}
              </span>
            )}
            {reviewCount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                    style={{ background: 'color-mix(in srgb, var(--brand-secondary) 18%, transparent)', color: 'var(--brand-secondary)' }}>
                {reviewCount} {lang === 'fr' ? 'en révision' : 'مراجعة'}
              </span>
            )}
          </div>
        </motion.div>

        {/* 4 stat cards */}
        <div className="grid grid-cols-2 gap-4 col-span-1 lg:col-span-2">
          {[
            {
              label: lang === 'fr' ? 'Sourates' : 'السور',
              value: memorizedCount,
              icon: BookOpen,
              sub: lang === 'fr' ? 'mémorisées' : 'محفوظة',
              grad: 'from-[#A8DADC]/12 to-transparent',
              accent: '#A8DADC',
            },
            {
              label: lang === 'fr' ? 'Objectifs' : 'الأهداف',
              value: completedGoals,
              icon: Target,
              sub: lang === 'fr' ? `sur ${userData.goals.length}` : `من ${userData.goals.length}`,
              grad: 'from-[#B7E4C7]/12 to-transparent',
              accent: '#B7E4C7',
            },
            {
              label: lang === 'fr' ? 'Badges' : 'الأوسمة',
              value: userData.badges.length,
              icon: Award,
              sub: lang === 'fr' ? 'débloqués' : 'مفتوحة',
              grad: 'from-[#D4AF37]/10 to-transparent',
              accent: '#D4AF37',
            },
            {
              label: lang === 'fr' ? 'Jours' : 'الأيام',
              value: calendarDays,
              icon: CalendarIcon,
              sub: lang === 'fr' ? 'enregistrés' : 'مسجلة',
              grad: 'from-[#8B2635]/6 to-transparent',
              accent: '#8B2635',
            },
          ].map((stat, i) => (
            <motion.div key={i} {...stagger(i + 3)}
              className="glass-card p-6 flex flex-col justify-between group overflow-hidden relative cursor-default">
              <div className="card-accent-bar" />
              <div className={cn('absolute inset-0 bg-gradient-to-br opacity-80', stat.grad)} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-all duration-500 group-hover:scale-110"
                   style={{ background: `color-mix(in srgb, ${stat.accent} 15%, transparent)` }}>
                <stat.icon size={20} style={{ color: stat.accent }} />
              </div>
              <div className="relative z-10 mt-5">
                <motion.p className="text-4xl text-gradient leading-none" style={{ fontWeight: 700 }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                  {stat.value}
                </motion.p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-black mt-1.5"
                   style={{ color: 'var(--brand-text-muted)' }}>{stat.label}</p>
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--brand-text-muted)', opacity: 0.7 }}>{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Verse du jour ── */}
      <motion.div {...stagger(7)}
        className="glass-card p-7 relative overflow-hidden group">
        <div className="card-accent-bar" />
        <div className="absolute top-0 right-0 p-8 opacity-[0.04] pointer-events-none select-none">
          <Sparkles size={160} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ background: 'color-mix(in srgb, var(--brand-secondary) 14%, transparent)' }}>
                <Sparkles size={15} style={{ color: 'var(--brand-secondary)' }} />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-black"
                 style={{ color: 'var(--brand-secondary)', opacity: 0.75 }}>
                {lang === 'fr' ? 'Verset du jour' : 'آية اليوم'}
              </p>
            </div>
            {apiVerse && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                    style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-text-muted)' }}>
                {apiVerse.ref}
              </span>
            )}
          </div>
          <p className="text-xl text-right font-arabic leading-loose" style={{ color: 'var(--brand-primary)' }}>
            {apiVerse ? apiVerse.ar : todayQuote.ar}
          </p>
          {lang === 'fr' && (
            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--brand-text-muted)' }}>
              « {apiVerse ? apiVerse.fr : todayQuote.fr} »
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Prayer Times ── */}
      {prayerTimes.length > 0 && (
        <motion.div {...stagger(8)}
          className="glass-card p-6 relative overflow-hidden group">
          <div className="card-accent-bar" />
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                   style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                <Clock size={15} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-black"
                 style={{ color: 'var(--brand-primary)', opacity: 0.75 }}>
                {lang === 'fr' ? 'Horaires de prière' : 'مواقيت الصلاة'}
              </p>
            </div>
            {city && (
              <div className="flex items-center gap-1.5">
                <MapPin size={10} style={{ color: 'var(--brand-text-muted)' }} />
                <span className="text-[10px] font-bold" style={{ color: 'var(--brand-text-muted)' }}>{city}</span>
              </div>
            )}
          </div>

          {nextPrayer && (
            <div className="mb-4 px-4 py-3 rounded-2xl flex items-center justify-between"
                 style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', border: '1px solid var(--border-accent)' }}>
              <div>
                <p className="text-[9px] uppercase tracking-widest font-black mb-0.5" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? 'Prochaine prière' : 'الصلاة القادمة'}
                </p>
                <p className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>
                  {lang === 'fr' ? nextPrayer.name : nextPrayer.nameAr}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gradient">{nextPrayer.time}</p>
                <p className="text-[9px] font-bold mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
                  {nextPrayer.minsLeft >= 60
                    ? `${Math.floor(nextPrayer.minsLeft / 60)}h ${nextPrayer.minsLeft % 60}min`
                    : `${nextPrayer.minsLeft} min`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2">
            {prayerTimes.map((p) => {
              const isNext = nextPrayer?.name === p.name;
              return (
                <div key={p.name}
                     className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl transition-all"
                     style={{
                       background: isNext
                         ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)'
                         : 'color-mix(in srgb, var(--brand-primary) 4%, transparent)',
                       border: `1px solid ${isNext ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                     }}>
                  <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: isNext ? 'var(--brand-primary)' : 'var(--brand-text-muted)' }}>
                    {lang === 'fr' ? p.name : p.nameAr}
                  </p>
                  <p className="text-xs font-bold" style={{ color: isNext ? 'var(--brand-primary)' : 'var(--brand-text-main)' }}>
                    {p.time}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Bottom row: next badge + goals ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Next badge */}
        {nextBadge && (
          <motion.div {...stagger(9)}
            className="glass-card p-6 relative overflow-hidden group">
            <div className="card-accent-bar" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                <TrendingUp size={17} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--brand-primary)' }}>
                {lang === 'fr' ? 'Prochain badge' : 'الشارة التالية'}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                   style={{ background: 'color-mix(in srgb, var(--brand-secondary) 14%, transparent)' }}>
                <Award size={22} style={{ color: 'var(--brand-secondary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: 'var(--brand-primary)' }}>
                  {lang === 'fr' ? nextBadge.title : nextBadge.titleAr}
                </p>
                <div className="progress-bar mt-2">
                  <motion.div className="progress-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${nextBadgeProgress}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }} />
                </div>
                <p className="text-[10px] mt-1 font-black" style={{ color: 'var(--brand-text-muted)' }}>
                  {Math.round(nextBadgeProgress)}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Goals preview */}
        <motion.div {...stagger(10)}
          className="glass-card p-6 relative overflow-hidden">
          <div className="card-accent-bar" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: 'color-mix(in srgb, var(--brand-secondary) 14%, transparent)' }}>
                <Target size={17} style={{ color: 'var(--brand-secondary)' }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--brand-primary)' }}>
                {lang === 'fr' ? 'Intentions du mois' : 'نوايا الشهر'}
              </h3>
            </div>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}>
              {completedGoals}/{userData.goals.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {userData.goals.slice(0, 3).map((goal) => (
              <div key={goal.id}
                   className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                   style={{
                     background: goal.completed
                       ? 'color-mix(in srgb, var(--brand-secondary) 8%, transparent)'
                       : 'color-mix(in srgb, var(--brand-primary) 3%, transparent)',
                     border: '1px solid var(--border-subtle)'
                   }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ background: goal.completed ? 'var(--brand-secondary)' : 'transparent', border: goal.completed ? 'none' : '1.5px solid var(--border-subtle)' }}>
                  {goal.completed
                    ? <CheckCircle2 size={13} style={{ color: '#fff' }} />
                    : <Circle size={13} style={{ color: 'var(--brand-text-muted)' }} />}
                </div>
                <span className={cn('text-xs font-medium flex-1 truncate leading-snug', goal.completed && 'line-through')}
                      style={{ color: goal.completed ? 'var(--brand-text-muted)' : 'var(--brand-text-main)', opacity: goal.completed ? 0.6 : 1 }}>
                  {goal.text}
                </span>
              </div>
            ))}
            {userData.goals.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'Aucun objectif — créez-en un !' : 'لا أهداف — أنشئ هدفاً!'}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
