import React, { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isToday, addMonths, subMonths, getDay, startOfWeek, endOfWeek
} from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Sun, Moon, BookOpen, Droplets } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserData } from '../types';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type Prayer = typeof PRAYERS[number];

const PRAYER_COLORS: Record<Prayer, string> = {
  Fajr:    'var(--prayer-fajr)',
  Dhuhr:   'var(--prayer-dhuhr)',
  Asr:     'var(--prayer-asr)',
  Maghrib: 'var(--prayer-maghrib)',
  Isha:    'var(--prayer-isha)',
};

export const CalendarSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const locale = lang === 'fr' ? fr : ar;
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start: days of week before first
  const firstDayOfWeek = (getDay(monthStart) + 6) % 7; // Mon=0
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

  // Monthly stats
  const monthStr = format(currentDate, 'yyyy-MM');
  const monthEntries = userData.calendar.filter(c => c.date.startsWith(monthStr));
  const totalPrayers5Days = monthEntries.filter(c => c.prayers.length === 5).length;
  const totalFastingDays = monthEntries.filter(c => c.fasting).length;
  const totalPages = monthEntries.reduce((sum, c) => sum + (c.pagesRead || 0), 0);
  const daysTracked = monthEntries.length;

  const selectedDayData = selectedDay ? getDayData(selectedDay) : null;

  const DAY_HEADERS = lang === 'fr'
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['اث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'];

  return (
    <div className="space-y-6 pb-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl sm:text-5xl text-primary leading-tight">
            {lang === 'fr' ? 'Calendrier' : 'التقويم'}
          </h2>
          <p className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] opacity-60 mt-1">
            {format(currentDate, 'MMMM yyyy', { locale })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setCurrentDate(new Date())}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
            style={{ background: 'color-mix(in srgb, var(--brand-secondary) 10%, transparent)', color: 'var(--brand-secondary)' }}>
            {lang === 'fr' ? "Auj." : 'اليوم'}
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-primary)' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Sun,      label: lang === 'fr' ? 'Jours complets' : 'أيام كاملة',    value: totalPrayers5Days, color: 'var(--brand-secondary)'     },
          { icon: Moon,     label: lang === 'fr' ? 'Jours de jeûne' : 'أيام الصيام',   value: totalFastingDays,  color: 'var(--brand-primary)'       },
          { icon: BookOpen, label: lang === 'fr' ? 'Pages lues' : 'صفحات مقروءة',      value: totalPages,        color: 'var(--brand-accent)'        },
          { icon: Droplets, label: lang === 'fr' ? 'Jours suivis' : 'أيام متتبعة',     value: daysTracked,       color: 'var(--status-memorized)'    },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}>
              <stat.icon size={16} style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-xl font-black text-gradient leading-none">{stat.value}</p>
              <p className="text-[8px] uppercase tracking-wider font-bold mt-0.5"
                 style={{ color: 'var(--brand-text-muted)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="glass-card p-4 relative overflow-hidden">
        <div className="card-accent-bar" />

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_HEADERS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-black uppercase tracking-wider py-2"
                 style={{ color: 'var(--brand-text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const data = getDayData(day);
            const prayerCount = data.prayers.length;
            const isSelected = selectedDay && format(selectedDay, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
            const isTodayDay = isToday(day);

            // Color intensity based on prayer count
            const bgOpacity = prayerCount === 0 ? 0 : prayerCount === 5 ? 1 : 0.15 + prayerCount * 0.14;

            return (
              <button
                key={format(day, 'yyyy-MM-dd')}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={cn(
                  'relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all p-1',
                  isTodayDay ? 'ring-2' : '',
                  isSelected ? 'scale-95' : 'hover:scale-95'
                )}
                style={{
                  background: prayerCount === 5
                    ? 'color-mix(in srgb, var(--brand-secondary) 20%, transparent)'
                    : prayerCount > 0
                      ? `color-mix(in srgb, var(--brand-accent) ${Math.round(bgOpacity * 18)}%, transparent)`
                      : 'color-mix(in srgb, var(--brand-primary) 3%, transparent)',
                  ringColor: isTodayDay ? 'var(--brand-primary)' : 'transparent',
                  outline: isTodayDay ? '2px solid var(--brand-primary)' : isSelected ? '2px solid var(--brand-secondary)' : 'none',
                }}
              >
                <span className="text-xs sm:text-[13px] font-black leading-none"
                      style={{ color: prayerCount === 5 ? 'var(--brand-secondary)' : 'var(--brand-primary)' }}>
                  {format(day, 'd')}
                </span>

                {/* Prayer dots */}
                <div className="flex gap-px flex-wrap justify-center max-w-full">
                  {PRAYERS.map(p => (
                    <div key={p} className="w-1 h-1 rounded-full transition-all"
                         style={{ background: data.prayers.includes(p) ? PRAYER_COLORS[p] : 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }} />
                  ))}
                </div>

                {/* Fasting dot */}
                {data.fasting && (
                  <div className="w-1 h-1 rounded-full" style={{ background: 'var(--brand-primary)' }} />
                )}

                {/* Pages */}
                {data.pagesRead > 0 && (
                  <span className="text-[6px] font-black" style={{ color: 'var(--brand-accent)' }}>
                    {data.pagesRead}p
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      {selectedDay && selectedDayData && (
        <div className="glass-card p-6 relative overflow-hidden space-y-5">
          <div className="card-accent-bar" />
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold" style={{ color: 'var(--brand-primary)' }}>
              {format(selectedDay, 'EEEE d MMMM', { locale })}
            </h3>
            <button onClick={() => setSelectedDay(null)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-text-muted)' }}>
              ✕
            </button>
          </div>

          {/* Prayers */}
          <div>
            <p className="text-[9px] uppercase tracking-widest font-black mb-3"
               style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Prières' : 'الصلوات'}
            </p>
            <div className="flex flex-wrap gap-2">
              {PRAYERS.map(prayer => {
                const done = selectedDayData.prayers.includes(prayer);
                return (
                  <button
                    key={prayer}
                    onClick={() => togglePrayer(selectedDay, prayer)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm"
                    style={{
                      background: done ? `color-mix(in srgb, ${PRAYER_COLORS[prayer]} 18%, transparent)` : 'color-mix(in srgb, var(--brand-primary) 5%, transparent)',
                      color: done ? PRAYER_COLORS[prayer] : 'var(--brand-text-muted)',
                      border: `1.5px solid ${done ? PRAYER_COLORS[prayer] : 'var(--border-subtle)'}`,
                      minHeight: '40px',
                    }}
                  >
                    <div className={cn('w-2.5 h-2.5 rounded-full transition-all')}
                         style={{ background: done ? PRAYER_COLORS[prayer] : 'var(--border-subtle)' }} />
                    {prayer}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fasting + pages */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => toggleFasting(selectedDay)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all font-bold text-sm"
              style={{
                background: selectedDayData.fasting ? 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' : 'color-mix(in srgb, var(--brand-primary) 5%, transparent)',
                color: selectedDayData.fasting ? 'var(--brand-primary)' : 'var(--brand-text-muted)',
                border: `1.5px solid ${selectedDayData.fasting ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                minHeight: '44px',
              }}
            >
              <Moon size={15} />
              {lang === 'fr' ? 'Jeûne' : 'صيام'}
            </button>

            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
                 style={{ background: 'var(--custom-input-bg)', border: '1.5px solid var(--border-subtle)', minHeight: '44px' }}>
              <BookOpen size={14} style={{ color: 'var(--brand-accent)' }} />
              <input
                type="number" min="0" max="604"
                value={selectedDayData.pagesRead || 0}
                onChange={e => updatePages(selectedDay, parseInt(e.target.value) || 0)}
                className="w-14 bg-transparent text-sm font-black outline-none"
                style={{ color: 'var(--brand-primary)' }}
              />
              <span className="text-xs font-bold"
                    style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'pages' : 'صفحة'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {PRAYERS.map(p => (
          <div key={p} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PRAYER_COLORS[p] }} />
            <span className="text-[11px] font-bold"
                  style={{ color: 'var(--brand-text-muted)' }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
