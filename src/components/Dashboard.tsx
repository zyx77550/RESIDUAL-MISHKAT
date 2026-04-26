import React, { useMemo, useState, useEffect } from 'react';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';
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

const Ring = ({ pct, size = 140, stroke = 7, color }: { pct: number; size?: number; stroke?: number; color: string }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} opacity={0.12}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
    </svg>
  );
};

export const Dashboard = ({ userData, lang }: { userData: UserData; lang: string }) => {
  const t = useT();
  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const inProgressCount = userData.surahs.filter(s => s.status === 'in_progress').length;
  const reviewCount = userData.surahs.filter(s => s.status === 'review').length;
  const memoPct = Math.round((memorizedCount / 114) * 100);
  const username = userData.settings?.username || 'Hafiz';
  const streak = userData.loginStreak || 1;
  const city = userData.settings?.city;
  const fr = lang === 'fr';

  const [apiVerse, setApiVerse] = useState<{ ar: string; fr: string; ref: string } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => { fetchVerseOfDay().then(v => { if (v) setApiVerse(v); }); }, []);
  useEffect(() => { if (!city) return; fetchPrayerTimes(city).then(setPrayerTimes); }, [city]);
  useEffect(() => {
    const tid = setInterval(() => setNowTime(new Date()), 30000);
    return () => clearInterval(tid);
  }, []);

  const nextPrayer = useMemo(() => {
    if (!prayerTimes.length) return null;
    const now = nowTime.getHours() * 60 + nowTime.getMinutes();
    for (const p of prayerTimes) {
      const [h, m] = p.time.split(':').map(Number);
      const mins = h * 60 + m;
      if (mins > now) return { ...p, minsLeft: mins - now };
    }
    const [h, m] = prayerTimes[0].time.split(':').map(Number);
    return { ...prayerTimes[0], minsLeft: 24 * 60 - now + h * 60 + m };
  }, [prayerTimes, nowTime]);

  const todayQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  const nextBadge = useMemo(() => getNextBadgeToUnlock(userData), [userData]);
  const nextBadgeProgress = nextBadge ? getBadgeProgress(userData, nextBadge.id) : 0;
  const completedGoals = userData.goals.filter(g => g.completed).length;

  const dateStr = fr
    ? new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

  const card = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, padding: '22px 24px' };

  const statItems = [
    { label: fr ? 'Mémorisées' : 'محفوظة', value: memorizedCount, icon: Icons.book, sub: '/ 114' },
    { label: fr ? 'Objectifs' : 'الأهداف', value: completedGoals, icon: Icons.target, sub: `/ ${userData.goals.length}` },
    { label: fr ? 'Badges' : 'الأوسمة', value: userData.badges.length, icon: Icons.badge, sub: fr ? 'débloqués' : 'مفتوحة' },
    { label: fr ? 'Sessions' : 'الأيام', value: userData.calendar.length, icon: Icons.calendar, sub: fr ? 'enregistrées' : 'مسجلة' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 6 }}>{dateStr}</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, color: t.ink, lineHeight: 1.2 }}>
            {fr ? 'As-salāmu ʿalaykum,' : 'السلام عليك،'}
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 400, fontSize: 32, color: t.accent, lineHeight: 1.2 }}>
            {fr ? username : `يا ${username}`}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={Icons.flame} size={14} color="#1a0f00"/>
          </div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: t.accent, lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              {fr ? 'jours de suite' : 'يوم متواصل'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress + stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

        {/* Ring progress card */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px 24px', position: 'relative' }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <Ring pct={memoPct} color={t.accent}/>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 34, color: t.accent, lineHeight: 1 }}>{memoPct}%</div>
              <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>
                {fr ? 'Accompli' : 'تم الإنجاز'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 18, color: t.ink }}>
              {fr ? 'Votre Voyage' : 'رحلتك'}
            </div>
            <div style={{ fontSize: 12, color: t.inkDim, marginTop: 6 }}>
              {memorizedCount} / 114 {fr ? 'sourates mémorisées' : 'سورة محفوظة'}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {inProgressCount > 0 && (
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: `${t.accentSoft}40`, color: t.accent }}>
                  {inProgressCount} {fr ? 'en cours' : 'قيد الحفظ'}
                </span>
              )}
              {reviewCount > 0 && (
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: `${t.accentSoft}30`, color: t.accentBright }}>
                  {reviewCount} {fr ? 'en révision' : 'مراجعة'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 4 stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {statItems.map((s, i) => (
            <div key={i} style={{ ...card, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: t.cardElev, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={s.icon} size={13} color={t.accent}/>
              </div>
              <div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: t.ink, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>{s.label}</div>
                <div style={{ fontSize: 9, color: t.inkMute, opacity: 0.7 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verse of the day */}
      <div style={{ ...card, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 9, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          {apiVerse?.ref}
        </div>
        <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
          {fr ? 'Verset du jour' : 'آية اليوم'}
        </div>
        <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 22, color: t.ink, lineHeight: 2, direction: 'rtl', textAlign: 'right' }}>
          {apiVerse ? apiVerse.ar : todayQuote.ar}
        </div>
        {fr && (
          <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 13, color: t.inkDim, marginTop: 10, lineHeight: 1.7 }}>
            « {apiVerse ? apiVerse.fr : todayQuote.fr} »
          </div>
        )}
      </div>

      {/* Prayer times */}
      {prayerTimes.length > 0 && (
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              {fr ? 'Horaires de prière' : 'مواقيت الصلاة'}
            </div>
            {city && (
              <div style={{ fontSize: 10, color: t.inkMute }}>{city}</div>
            )}
          </div>

          {nextPrayer && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: t.cardElev, border: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 3 }}>
                  {fr ? 'Prochaine prière' : 'الصلاة القادمة'}
                </div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: t.ink }}>
                  {fr ? nextPrayer.name : nextPrayer.nameAr}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: t.accent }}>{nextPrayer.time}</div>
                <div style={{ fontSize: 9, color: t.inkMute, marginTop: 2 }}>
                  {nextPrayer.minsLeft >= 60
                    ? `${Math.floor(nextPrayer.minsLeft / 60)}h ${nextPrayer.minsLeft % 60}min`
                    : `${nextPrayer.minsLeft} min`}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {prayerTimes.map(p => {
              const isNext = nextPrayer?.name === p.name;
              return (
                <div key={p.name} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 4px', borderRadius: 8,
                  background: isNext ? t.cardElev : 'transparent',
                  border: `1px solid ${isNext ? t.accent : t.line}`,
                }}>
                  <div style={{ fontSize: 9, color: isNext ? t.accent : t.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                    {fr ? p.name : p.nameAr}
                  </div>
                  <div style={{ fontSize: 11, color: isNext ? t.ink : t.inkDim, fontFamily: 'Fraunces, serif' }}>{p.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom row: next badge + goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>

        {nextBadge && (
          <div style={card}>
            <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 16 }}>
              {fr ? 'Prochain badge' : 'الشارة التالية'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: t.cardElev, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d={Icons.badge} size={18} color={t.accent}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: t.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fr ? nextBadge.title : nextBadge.titleAr}
                </div>
                <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: t.cardElev, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${nextBadgeProgress}%`, background: t.accent, borderRadius: 2 }}/>
                </div>
                <div style={{ fontSize: 10, color: t.inkMute, marginTop: 4 }}>{Math.round(nextBadgeProgress)}%</div>
              </div>
            </div>
          </div>
        )}

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              {fr ? 'Intentions du mois' : 'نوايا الشهر'}
            </div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: t.cardElev, color: t.inkDim }}>
              {completedGoals}/{userData.goals.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {userData.goals.slice(0, 3).map(goal => (
              <div key={goal.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
                background: goal.completed ? `${t.accentSoft}20` : t.cardElev,
                border: `1px solid ${t.line}`,
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: goal.completed ? t.accent : 'transparent',
                  border: goal.completed ? 'none' : `1.5px solid ${t.inkMute}`,
                }}>
                  {goal.completed && <Icon d={Icons.check} size={10} color="#1a0f00"/>}
                </div>
                <span style={{
                  fontSize: 12, color: goal.completed ? t.inkMute : t.ink, flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textDecoration: goal.completed ? 'line-through' : 'none', opacity: goal.completed ? 0.6 : 1,
                }}>
                  {goal.text}
                </span>
              </div>
            ))}
            {userData.goals.length === 0 && (
              <div style={{ fontSize: 12, color: t.inkMute, textAlign: 'center', padding: '16px 0' }}>
                {fr ? 'Aucun objectif — créez-en un !' : 'لا أهداف — أنشئ هدفاً!'}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
