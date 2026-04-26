import React, { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isToday, addMonths, subMonths, getDay
} from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type Prayer = typeof PRAYERS[number];

const PRAYER_COLORS: Record<Prayer, string> = {
  Fajr:    '#a8dadc',
  Dhuhr:   '#d4a64a',
  Asr:     '#86efac',
  Maghrib: '#f59e0b',
  Isha:    '#818cf8',
};

export const CalendarSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const fr_lang = lang === 'fr';

  const locale = lang === 'fr' ? fr : ar;
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7;
  const paddingDays = Array.from({ length: firstDayOfWeek });

  const getDayData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return userData.calendar.find(c => c.date === dateStr) || { prayers: [], fasting: false, pagesRead: 0 };
  };

  const togglePrayer = (date: Date, prayer: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setUserData((prev: UserData) => {
      const existing = prev.calendar.find(c => c.date === dateStr);
      let newCalendar;
      if (existing) {
        const prayers = existing.prayers.includes(prayer)
          ? existing.prayers.filter(p => p !== prayer)
          : [...existing.prayers, prayer];
        newCalendar = prev.calendar.map(c => c.date === dateStr ? { ...c, prayers } : c);
      } else {
        newCalendar = [...prev.calendar, { date: dateStr, prayers: [prayer], fasting: false, pagesRead: 0 }];
      }
      return { ...prev, calendar: newCalendar };
    });
  };

  const toggleFasting = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setUserData((prev: UserData) => {
      const existing = prev.calendar.find(c => c.date === dateStr);
      let newCalendar;
      if (existing) {
        newCalendar = prev.calendar.map(c => c.date === dateStr ? { ...c, fasting: !c.fasting } : c);
      } else {
        newCalendar = [...prev.calendar, { date: dateStr, prayers: [], fasting: true, pagesRead: 0 }];
      }
      return { ...prev, calendar: newCalendar };
    });
  };

  const updatePages = (date: Date, pages: number) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setUserData((prev: UserData) => {
      const existing = prev.calendar.find(c => c.date === dateStr);
      let newCalendar;
      if (existing) {
        newCalendar = prev.calendar.map(c => c.date === dateStr ? { ...c, pagesRead: pages } : c);
      } else {
        newCalendar = [...prev.calendar, { date: dateStr, prayers: [], fasting: false, pagesRead: pages }];
      }
      return { ...prev, calendar: newCalendar };
    });
  };

  const monthStr = format(currentDate, 'yyyy-MM');
  const monthEntries = userData.calendar.filter(c => c.date.startsWith(monthStr));
  const totalPrayers5Days = monthEntries.filter(c => c.prayers.length === 5).length;
  const totalFastingDays = monthEntries.filter(c => c.fasting).length;
  const totalPages = monthEntries.reduce((sum, c) => sum + (c.pagesRead || 0), 0);
  const daysTracked = monthEntries.length;

  const selectedDayData = selectedDay ? getDayData(selectedDay) : null;

  const DAY_HEADERS = fr_lang
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['اث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'];

  const card = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 14 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, color: t.ink }}>
            {fr_lang ? 'Calendrier' : 'التقويم'}
          </div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>
            {format(currentDate, 'MMMM yyyy', { locale })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            style={{ width: 36, height: 36, borderRadius: 8, background: t.card, border: `1px solid ${t.line}`, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon d={Icons.arrowDown} size={14} color={t.ink} style={{ transform: 'rotate(90deg)' }}/>
          </button>
          <button onClick={() => setCurrentDate(new Date())}
            style={{ padding: '7px 12px', borderRadius: 8, background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkDim, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
            {fr_lang ? 'Auj.' : 'اليوم'}
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            style={{ width: 36, height: 36, borderRadius: 8, background: t.card, border: `1px solid ${t.line}`, color: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon d={Icons.arrow} size={14} color={t.ink}/>
          </button>
        </div>
      </div>

      {/* Monthly stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        {[
          { label: fr_lang ? 'Jours complets' : 'أيام كاملة', value: totalPrayers5Days, color: '#d4a64a' },
          { label: fr_lang ? 'Jours de jeûne' : 'أيام الصيام', value: totalFastingDays, color: '#818cf8' },
          { label: fr_lang ? 'Pages lues' : 'صفحات مقروءة', value: totalPages, color: '#60a5fa' },
          { label: fr_lang ? 'Jours suivis' : 'أيام متتبعة', value: daysTracked, color: '#4ade80' },
        ].map((stat, i) => (
          <div key={i} style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
          {DAY_HEADERS.map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 9, color: t.inkMute, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 0' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
          {paddingDays.map((_, i) => <div key={`pad-${i}`}/>)}
          {days.map((day) => {
            const data = getDayData(day);
            const prayerCount = data.prayers.length;
            const isSelected = selectedDay && format(selectedDay, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
            const isTodayDay = isToday(day);

            return (
              <button
                key={format(day, 'yyyy-MM-dd')}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{
                  aspectRatio: '1', borderRadius: 8, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2, padding: 3,
                  cursor: 'pointer',
                  background: prayerCount === 5 ? `${t.accent}22` : prayerCount > 0 ? `${t.accent}11` : 'transparent',
                  border: isTodayDay ? `2px solid ${t.accent}` : isSelected ? `2px solid ${t.accentBright}` : '2px solid transparent',
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: prayerCount === 5 ? t.accent : t.ink, lineHeight: 1 }}>
                  {format(day, 'd')}
                </span>
                <div style={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '100%' }}>
                  {PRAYERS.map(p => (
                    <div key={p} style={{ width: 4, height: 4, borderRadius: '50%', background: data.prayers.includes(p) ? PRAYER_COLORS[p] : `${t.inkMute}30` }}/>
                  ))}
                </div>
                {data.fasting && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#818cf8' }}/>}
                {data.pagesRead > 0 && <span style={{ fontSize: 6, color: t.accentBright, fontWeight: 700 }}>{data.pagesRead}p</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && selectedDayData && (
        <div style={{ ...card, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 18, color: t.ink }}>
              {format(selectedDay, 'EEEE d MMMM', { locale })}
            </div>
            <button onClick={() => setSelectedDay(null)}
              style={{ width: 26, height: 26, borderRadius: '50%', background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkMute, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>
              {fr_lang ? 'Prières' : 'الصلوات'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PRAYERS.map(prayer => {
                const done = selectedDayData.prayers.includes(prayer);
                return (
                  <button key={prayer} onClick={() => togglePrayer(selectedDay, prayer)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                      background: done ? `${PRAYER_COLORS[prayer]}22` : t.cardElev,
                      color: done ? PRAYER_COLORS[prayer] : t.inkDim,
                      border: `1.5px solid ${done ? PRAYER_COLORS[prayer] : t.line}`,
                      fontSize: 12, fontWeight: 600,
                    }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: done ? PRAYER_COLORS[prayer] : t.line }}/>
                    {prayer}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button onClick={() => toggleFasting(selectedDay)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                background: selectedDayData.fasting ? '#818cf822' : t.cardElev,
                color: selectedDayData.fasting ? '#818cf8' : t.inkDim,
                border: `1.5px solid ${selectedDayData.fasting ? '#818cf8' : t.line}`,
                fontSize: 12, fontWeight: 600,
              }}>
              {fr_lang ? 'Jeûne' : 'صيام'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, background: t.cardElev, border: `1.5px solid ${t.line}` }}>
              <Icon d={Icons.book} size={13} color={t.accent}/>
              <input
                type="number" min="0" max="604"
                value={selectedDayData.pagesRead || 0}
                onChange={e => updatePages(selectedDay, parseInt(e.target.value) || 0)}
                style={{ width: 44, background: 'transparent', fontSize: 12, fontWeight: 700, outline: 'none', color: t.ink, border: 'none' }}
              />
              <span style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {fr_lang ? 'pages' : 'صفحة'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: '0 4px' }}>
        {PRAYERS.map(p => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: PRAYER_COLORS[p] }}/>
            <span style={{ fontSize: 9, color: t.inkMute, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
