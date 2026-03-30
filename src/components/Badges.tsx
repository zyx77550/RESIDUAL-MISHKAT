import React from 'react';
import { Award, Star, Zap, Book, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

const BADGES = [
  { id: 'first_surah', icon: Star, title: 'Première Sourate', titleAr: 'أول سورة', desc: 'Mémorisez votre première sourate', color: 'text-secondary' },
  { id: 'streak_7', icon: Zap, title: 'Assiduité', titleAr: 'المداومة', desc: '7 jours consécutifs d\'activité', color: 'text-orange-500' },
  { id: 'juz_amma', icon: Book, title: 'Juz Amma', titleAr: 'جزء عم', desc: 'Complétez le 30ème Juz', color: 'text-accent' },
  { id: 'tasbih_100', icon: Heart, title: 'Dhikr Master', titleAr: 'سيد الذكر', desc: 'Atteignez 100 Tasbih en une session', color: 'text-pastel-green' },
];

export const BadgesSection = ({ userData, lang }: { userData: any, lang: string }) => {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl text-primary">{lang === 'fr' ? 'Mes Badges' : 'أوسمتي'}</h2>
        <p className="text-secondary opacity-60 font-bold uppercase tracking-widest text-xs mt-1">{lang === 'fr' ? 'Célébrez vos réussites' : 'احتفل بإنجازاتك'}</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {BADGES.map((badge) => {
          const isUnlocked = userData.badges.includes(badge.id);
          return (
            <div 
              key={badge.id} 
              className={cn(
                "glass-card p-8 flex flex-col items-center text-center gap-4 transition-all",
                !isUnlocked && "grayscale opacity-40"
              )}
            >
              <div className={cn("w-16 h-16 rounded-full bg-surface shadow-inner flex items-center justify-center", badge.color)}>
                <badge.icon size={32} />
              </div>
              <div>
                <h4 className="font-bold text-primary">{lang === 'fr' ? badge.title : badge.titleAr}</h4>
                <p className="text-xs text-text-muted mt-1">{badge.desc}</p>
              </div>
              {!isUnlocked && (
                <div className="mt-2 text-[10px] uppercase tracking-widest font-bold text-text-muted">
                  {lang === 'fr' ? 'Verrouillé' : 'مغلق'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
