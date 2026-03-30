import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr, ar } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export const CalendarSection = ({ userData, setUserData, lang }: { userData: any, setUserData: any, lang: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const locale = lang === 'fr' ? fr : ar;

  const togglePrayer = (date: Date, prayer: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setUserData((prev: any) => {
      const existing = prev.calendar.find((c: any) => c.date === dateStr);
      let newCalendar;
      if (existing) {
        const prayers = existing.prayers.includes(prayer) 
          ? existing.prayers.filter((p: string) => p !== prayer)
          : [...existing.prayers, prayer];
        newCalendar = prev.calendar.map((c: any) => c.date === dateStr ? { ...c, prayers } : c);
      } else {
        newCalendar = [...prev.calendar, { date: dateStr, prayers: [prayer], fasting: false, pagesRead: 0 }];
      }
      return { ...prev, calendar: newCalendar };
    });
  };

  const getDayData = (date: Date) => {
    return userData.calendar.find((c: any) => c.date === format(date, 'yyyy-MM-dd')) || { prayers: [], fasting: false, pagesRead: 0 };
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl text-primary">{lang === 'fr' ? 'Calendrier' : 'التقويم'}</h2>
          <p className="text-secondary opacity-60 font-bold uppercase tracking-widest text-xs mt-1">{format(currentDate, 'MMMM yyyy', { locale })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-primary/5 rounded-full text-primary transition-colors">
            <ChevronLeft />
          </button>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-primary/5 rounded-full text-primary transition-colors">
            <ChevronRight />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i} className="text-center text-[10px] sm:text-xs font-bold text-text-muted py-1 sm:py-2">{d}</div>
        ))}
        {days.map((day, i) => {
          const data = getDayData(day);
          return (
            <div key={i} className="glass-card p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] flex flex-col gap-1 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-bold text-primary">{format(day, 'd')}</span>
              <div className="flex flex-wrap gap-0.5 sm:gap-1">
                {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
                  <button 
                    key={p}
                    onClick={() => togglePrayer(day, p)}
                    className={cn(
                      "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                      data.prayers.includes(p) ? "bg-pastel-green" : "bg-primary/10"
                    )}
                    title={p}
                  />
                ))}
              </div>
              {data.pagesRead > 0 && (
                <div className="flex items-center gap-0.5 sm:gap-1 text-[6px] sm:text-[8px] text-secondary">
                  <BookOpen size={6} className="sm:w-2 sm:h-2" />
                  {data.pagesRead} {lang === 'fr' ? 'p.' : 'ص.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
