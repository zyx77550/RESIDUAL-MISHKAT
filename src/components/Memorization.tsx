import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, ChevronRight } from 'lucide-react';
import { Surah } from '../types';
import { cn } from '../lib/utils';

export const MemorizationSection = ({ userData, setUserData, lang }: { userData: any, setUserData: any, lang: string }) => {
  const updateStatus = (id: number, status: Surah['status']) => {
    setUserData((prev: any) => ({
      ...prev,
      surahs: prev.surahs.map((s: any) => s.id === id ? { ...s, status } : s)
    }));
  };

  return (
    <div className="space-y-12">
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <h2 className="text-5xl text-primary leading-tight">{lang === 'fr' ? 'Mémorisation' : 'الحِفْظ'}</h2>
        <p className="text-secondary font-bold tracking-[0.4em] uppercase text-xs opacity-60">تَتَبُّعُ التَّقَدُّمِ فِي كُلِّ سُورَة</p>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {userData.surahs.slice(0, 114).map((surah: any, idx: number) => (
          <motion.div 
            key={surah.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.01 }}
            className="glass-card p-6 flex items-center gap-5 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-serif italic text-xl shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
              {surah.id}
            </div>
            
            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-primary text-base truncate group-hover:text-secondary transition-colors">{surah.name}</h4>
                {userData.settings?.showArabicNames && (
                  <span className="text-xl font-arabic text-secondary whitespace-nowrap">{surah.arabicName}</span>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={10} 
                      className={cn(star <= surah.difficulty ? "text-secondary fill-secondary" : "text-primary/10")} 
                    />
                  ))}
                </div>
                
                <select 
                  value={surah.status}
                  onChange={(e) => updateStatus(surah.id, e.target.value as any)}
                  className={cn(
                    "bg-primary/5 border-none rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-secondary px-3 py-1.5 transition-all cursor-pointer",
                    surah.status === 'memorized' ? "text-pastel-green" : "text-text-muted"
                  )}
                >
                  <option value="not_started">{lang === 'fr' ? 'Non commencé' : 'لم تبدأ'}</option>
                  <option value="in_progress">{lang === 'fr' ? 'En cours' : 'قيد الحفظ'}</option>
                  <option value="memorized">{lang === 'fr' ? 'Mémorisé' : 'تم الحفظ'}</option>
                </select>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
