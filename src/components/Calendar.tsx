import React, { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isToday, addMonths, subMonths, getDay
} from 'date-fns';
import { fr as frLocale, ar as arLocale } from 'date-fns/locale';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type Prayer = typeof PRAYERS[number];

export const CalendarSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();
  const [currentDate, setCurrentDate] = useState(new Date());
  const fr = lang === 'fr';

  const locale = lang === 'fr' ? frLocale : arLocale;
  const monthStart   = startOfMonth(currentDate);
  const monthEnd     = endOfMonth(currentDate);
  const days         = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7;
  const paddingDays  = Array.from({ length: firstDayOfWeek });

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return userData.calendar.find(c => c.date === dateStr) ?? { prayers: [], fasting: false, pagesRead: 0 };
  };

  const togglePrayer = (dateStr: string, prayer: string) => {
    setUserData((prev: UserData) => {
      const existing = prev.calendar.find(c => c.date === dateStr);
      if (existing) {
        const prayers = existing.prayers.includes(prayer)
          ? existing.prayers.filter(p => p !== prayer)
          : [...existing.prayers, prayer];
        return { ...prev, calendar: prev.calendar.map(c => c.date === dateStr ? { ...c, prayers } : c) };
      }
      return { ...prev, calendar: [...prev.calendar, { date: dateStr, prayers: [prayer], fasting: false, pagesRead: 0 }] };
    });
  };

  const toggleFasting = (dateStr: string) => {
    setUserData((prev: UserData) => {
      const existing = prev.calendar.find(c => c.date === dateStr);
      if (existing) {
        return { ...prev, calendar: prev.calendar.map(c => c.date === dateStr ? { ...c, fasting: !c.fasting } : c) };
      }
      return { ...prev, calendar: [...prev.calendar, { date: dateStr, prayers: [], fasting: true, pagesRead: 0 }] };
    });
  };

  const updatePages = (dateStr: string, pages: number) => {
    setUserData((prev: UserData) => {
      const existing = prev.calendar.find(c => c.date === dateStr);
      if (existing) {
        return { ...prev, calendar: prev.calendar.map(c => c.date === dateStr ? { ...c, pagesRead: pages } : c) };
      }
      return { ...prev, calendar: [...prev.calendar, { date: dateStr, prayers: [], fasting: false, pagesRead: pages }] };
    });
  };

  const monthStr      = format(currentDate, 'yyyy-MM');
  const monthEntries  = userData.calendar.filter(c => c.date.startsWith(monthStr));
  const totalPrayers  = monthEntries.reduce((sum, c) => sum + c.prayers.length, 0);
  const totalPossible = days.filter(d => !isToday(d) || true).length * 5;
  const fastingDays   = monthEntries.filter(c => c.fasting).length;
  const totalPages    = monthEntries.reduce((sum, c) => sum + (c.pagesRead || 0), 0);
  const streak        = userData.loginStreak || 0;

  const todayData = getDayData(today);

  const DAY_HEADERS = fr
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['اث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'];

  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 12 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
            {fr ? 'Mois en cours' : 'الشهر الحالي'} · {format(currentDate, 'MMMM yyyy', { locale })}
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, margin: 0, color: t.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {fr ? 'Calendrier' : 'التقويم'}
          </h1>
        </div>

        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            style={{ width: 34, height: 34, borderRadius: 8, background: t.card, border: `1px solid ${t.line}`, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon d={Icons.arrow} size={13} style={{ transform: 'rotate(180deg)' }}/>
          </button>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: t.ink, padding: '0 8px', minWidth: 110, textAlign: 'center' }}>
            {format(currentDate, 'MMM yyyy', { locale })}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            style={{ width: 34, height: 34, borderRadius: 8, background: t.card, border: `1px solid ${t.line}`, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon d={Icons.arrow} size={13}/>
          </button>
        </div>
      </div>

      {/* ── 2-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>

        {/* ── LEFT : Calendar card ── */}
        <div style={{ ...card, padding: '14px 14px 10px' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {DAY_HEADERS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 9.5, color: t.inkMute, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 0 6px' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {paddingDays.map((_, i) => (
              <div key={`pad-${i}`} style={{ aspectRatio: '1', background: t.bg, borderRadius: 7, opacity: 0.3 }}/>
            ))}
            {days.map(day => {
              const data  = getDayData(day);
              const has   = data.prayers.length > 0 || data.fasting || (data.pagesRead || 0) > 0;
              const isNow = isToday(day);
              return (
                <div key={format(day, 'yyyy-MM-dd')} style={{
                  aspectRatio: '1', borderRadius: 7, padding: '7px 8px', position: 'relative',
                  background: isNow ? `${t.accent}22` : has ? t.cardElev : t.bg,
                  border: isNow ? `1.5px solid ${t.accent}` : `1px solid ${has ? t.line : t.lineSoft ?? t.line}`,
                }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 14, color: isNow ? t.accentBright : t.ink, fontWeight: 300, lineHeight: 1 }}>
                    {format(day, 'd')}
                  </div>
                  <div style={{ position: 'absolute', bottom: 5, left: 6, right: 6, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 1.5 }}>
                      {Array.from({ length: 5 }).map((_, k) => (
                        <span key={k} style={{ width: 3, height: 3, borderRadius: '50%', background: k < data.prayers.length ? t.accent : `${t.inkMute}25` }}/>
                      ))}
                    </div>
                    {data.fasting && (
                      <span style={{ fontSize: 8, color: t.accentBright, marginLeft: 'auto' }}>◐</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT : Today + Monthly summary ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Today card */}
          <div style={{ ...card, padding: '16px 18px' }}>
            <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
              {fr ? `Aujourd'hui · ${format(today, 'd MMM', { locale })}` : `اليوم · ${format(today, 'd MMM', { locale })}`}
            </div>

            {/* Prayers */}
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              {fr ? 'Prières' : 'الصلوات'}
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
              {PRAYERS.map(p => {
                const done = todayData.prayers.includes(p);
                const shortName: Record<string, string> = { Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Mag', Isha: 'Isha' };
                return (
                  <button key={p} onClick={() => togglePrayer(todayStr, p)}
                    style={{ flex: 1, padding: '8px 2px', borderRadius: 7, textAlign: 'center', cursor: 'pointer',
                      background: done ? `${t.accent}22` : t.cardElev,
                      border: `1px solid ${done ? `${t.accent}55` : t.line}` }}>
                    <div style={{ fontSize: 8, color: done ? t.accent : t.inkDim, marginBottom: 4, fontWeight: 600 }}>{shortName[p]}</div>
                    {done
                      ? <Icon d={Icons.check} size={10} color={t.accent}/>
                      : <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: t.line }}/>}
                  </button>
                );
              })}
            </div>

            {/* Lecture */}
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
              {fr ? 'Lecture' : 'قراءة'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: t.ink, fontWeight: 300 }}>
                {todayData.pagesRead || 0}
              </span>
              <span style={{ fontSize: 11, color: t.inkDim }}>{fr ? 'versets aujourd\'hui' : 'آية اليوم'}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 7, background: t.cardElev, border: `1px solid ${t.line}` }}>
                <span style={{ fontSize: 10, color: t.inkMute }}>+</span>
                <input
                  type="number" min="0" max="604"
                  value={todayData.pagesRead || 0}
                  onChange={e => updatePages(todayStr, parseInt(e.target.value) || 0)}
                  style={{ width: 40, background: 'transparent', fontSize: 12, fontWeight: 700, outline: 'none', color: t.ink, border: 'none' }}
                />
                <span style={{ fontSize: 9, color: t.inkMute }}>{fr ? 'versets' : 'آية'}</span>
              </div>
              <button onClick={() => toggleFasting(todayStr)}
                style={{ padding: '6px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: todayData.fasting ? '#818cf822' : t.cardElev,
                  color: todayData.fasting ? '#818cf8' : t.inkDim,
                  border: `1px solid ${todayData.fasting ? '#818cf8' : t.line}` }}>
                {fr ? '◐ Jeûne' : '◐ صيام'}
              </button>
            </div>
          </div>

          {/* Monthly summary */}
          <div style={{ ...card, padding: '16px 18px', flex: 1 }}>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 14 }}>
              {fr ? 'Mois — résumé' : 'ملخص الشهر'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Icons.flame, value: streak,                                         label: fr ? "jours d'affilée"  : 'يوم متواصل' },
                { icon: Icons.moon,  value: fastingDays,                                    label: fr ? 'jours de jeûne'   : 'يوم صيام'   },
                { icon: Icons.book,  value: totalPages,                                     label: fr ? 'pages ce mois'    : 'صفحة هذا الشهر' },
                { icon: Icons.check, value: `${totalPrayers}/${totalPossible}`,             label: fr ? 'prières faites'   : 'صلاة مؤداة' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${t.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon d={s.icon} size={13} color={t.accent}/>
                  </div>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, color: t.ink, fontWeight: 300, minWidth: 36 }}>{s.value}</span>
                  <span style={{ fontSize: 10, color: t.inkDim }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
