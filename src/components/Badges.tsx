import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Star, Zap, BookOpen, Heart, Trophy, Medal, Crown, Gem,
  Target, Flag, ClipboardCheck, Flame, Moon, Sparkles, Infinity,
  NotebookPen, BookText, Palette, Paintbrush, Calendar, CalendarDays,
  X, Lock, Unlock, TrendingUp, RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge, UserData, BADGE_DEFINITIONS, getRarityColor, getRarityLabel, getBadgeProgress } from '../types';
import { formatUnlockDate, getTimeSinceUnlock, getBadgesByRarity, celebrateBadgeUnlock } from '../lib/badgeEngine';

// Mapping des icônes pour les badges
const ICON_MAP: Record<string, React.ElementType> = {
  Star, Award, Trophy, Medal, Crown, Gem, BookOpen, BookMarked,
  Target, Flag, ClipboardCheck, Flame, Zap, Moon, Sparkles, Infinity,
  Heart, NotebookPen, BookText, Palette, Paintbrush, Calendar, CalendarDays,
  RotateCcw
};

interface BadgesSectionProps {
  userData: UserData;
  setUserData?: (updater: (prev: UserData) => UserData) => void;
  lang: 'fr' | 'ar';
  newlyUnlocked?: Badge[];
}

export const BadgesSection = ({ userData, setUserData, lang, newlyUnlocked }: BadgesSectionProps) => {
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [currentUnlockIndex, setCurrentUnlockIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Afficher les badges nouvellement débloqués
  useEffect(() => {
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      setShowUnlockModal(true);
      setCurrentUnlockIndex(0);

      // Célébrer chaque badge avec un délai
      newlyUnlocked.forEach((badge, index) => {
        setTimeout(() => {
          celebrateBadgeUnlock(badge);
        }, index * 800);
      });
    }
  }, [newlyUnlocked]);

  const unlockedIds = new Set(userData.badges.map(b => b.id));
  const allBadges = BADGE_DEFINITIONS.map(def => ({
    ...def,
    unlockedAt: userData.badges.find(b => b.id === def.id)?.unlockedAt
  }));

  const filteredBadges = selectedRarity 
    ? allBadges.filter(b => b.rarity === selectedRarity)
    : allBadges;

  const badgesByRarity = getBadgesByRarity(userData.badges);
  const totalBadges = BADGE_DEFINITIONS.length;
  const unlockedCount = userData.badges.length;
  const progress = Math.round((unlockedCount / totalBadges) * 100);

  const rarities = ['common', 'rare', 'epic', 'legendary'];

  const handleNextUnlock = () => {
    if (newlyUnlocked && currentUnlockIndex < newlyUnlocked.length - 1) {
      setCurrentUnlockIndex(prev => prev + 1);
    } else {
      setShowUnlockModal(false);
    }
  };

  const currentUnlock = newlyUnlocked?.[currentUnlockIndex];

  return (
    <div className="space-y-8">
      {/* Header avec statistiques */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
            {lang === 'fr' ? 'Mes Badges' : 'أوسمتي'}
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--brand-text-muted)' }}>
            {lang === 'fr' ? 'Célébrez vos réussites' : 'احتفل بإنجازاتك'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-card px-4 py-2 flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" style={{ color: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' }} />
                <circle cx="50%" cy="50%" r="40%" stroke="var(--brand-primary)" strokeWidth="8" fill="transparent" strokeDasharray="100 100" pathLength="1" style={{ pathLength: progress / 100 }} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold" style={{ color: 'var(--brand-primary)' }}>{progress}%</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>{unlockedCount}/{totalBadges}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--brand-text-muted)' }}>
                {lang === 'fr' ? 'Débloqués' : 'مفتوحة'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Filtres par rareté */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedRarity(null)}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
            selectedRarity === null 
              ? "bg-primary text-white" 
              : "bg-surface text-text-muted hover:bg-primary/10"
          )}
          style={{ 
            backgroundColor: selectedRarity === null ? 'var(--brand-primary)' : undefined,
            color: selectedRarity === null ? 'white' : undefined
          }}
        >
          {lang === 'fr' ? 'Tous' : 'الكل'} ({totalBadges})
        </button>
        {rarities.map(rarity => {
          const count = badgesByRarity[rarity]?.length || 0;
          const totalOfRarity = BADGE_DEFINITIONS.filter(b => b.rarity === rarity).length;
          return (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                selectedRarity === rarity 
                  ? "text-white" 
                  : "text-text-muted hover:opacity-80"
              )}
              style={{ 
                backgroundColor: selectedRarity === rarity 
                  ? getRarityColor(rarity) 
                  : 'color-mix(in srgb, ' + getRarityColor(rarity) + ' 15%, transparent)',
                color: selectedRarity === rarity ? 'white' : getRarityColor(rarity)
              }}
            >
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getRarityColor(rarity) }}
              />
              {getRarityLabel(rarity, lang)} ({count}/{totalOfRarity})
            </button>
          );
        })}
      </div>

      {/* Grille des badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredBadges.map((badge, index) => {
          const isUnlocked = unlockedIds.has(badge.id);
          const progress = getBadgeProgress(userData, badge.id);
          const IconComponent = ICON_MAP[badge.icon] || Award;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={isUnlocked ? { y: -8, scale: 1.02 } : {}}
              className={cn(
                "relative glass-card p-6 flex flex-col items-center text-center gap-3 transition-all cursor-pointer",
                !isUnlocked && "opacity-60 grayscale"
              )}
              style={{
                borderColor: isUnlocked 
                  ? getRarityColor(badge.rarity) 
                  : 'var(--border-subtle)',
                borderWidth: isUnlocked ? '2px' : '1px'
              }}
            >
              {/* Badge de rareté */}
              <div 
                className="absolute top-2 right-2 w-3 h-3 rounded-full"
                style={{ backgroundColor: getRarityColor(badge.rarity) }}
                title={getRarityLabel(badge.rarity, lang)}
              />

              {/* Icône */}
              <div 
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                  isUnlocked ? "shadow-lg" : "bg-surface"
                )}
                style={{ 
                  backgroundColor: isUnlocked 
                    ? 'color-mix(in srgb, ' + getRarityColor(badge.rarity) + ' 20%, transparent)' 
                    : undefined,
                  color: isUnlocked ? getRarityColor(badge.rarity) : 'var(--brand-text-muted)'
                }}
              >
                <IconComponent size={32} strokeWidth={isUnlocked ? 2 : 1.5} />
              </div>

              {/* Titre */}
              <div>
                <h4 className="font-bold text-sm" style={{ color: isUnlocked ? 'var(--brand-primary)' : 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? badge.title : badge.titleAr}
                </h4>
                <p className="text-[10px] mt-1" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? badge.description : badge.descriptionAr}
                </p>
              </div>

              {/* Status */}
              {isUnlocked ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: getRarityColor(badge.rarity) }}>
                    <Unlock size={10} />
                    {lang === 'fr' ? 'Débloqué' : 'مفتوح'}
                  </div>
                  {badge.unlockedAt && (
                    <p className="text-[9px]" style={{ color: 'var(--brand-text-muted)' }}>
                      {getTimeSinceUnlock(badge.unlockedAt, lang)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--brand-text-muted)' }}>
                    <Lock size={10} />
                    {lang === 'fr' ? 'Verrouillé' : 'مغلق'}
                  </div>
                  {/* Barre de progression */}
                  {progress > 0 && (
                    <div className="w-full">
                      <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: getRarityColor(badge.rarity)
                          }}
                        />
                      </div>
                      <p className="text-[9px] mt-1" style={{ color: 'var(--brand-text-muted)' }}>
                        {Math.round(progress)}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Modal de déblocage */}
      <AnimatePresence>
        {showUnlockModal && currentUnlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowUnlockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden"
              style={{ borderColor: getRarityColor(currentUnlock.rarity), borderWidth: '3px' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Effet de glow */}
              <div 
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 blur-3xl"
                style={{ backgroundColor: getRarityColor(currentUnlock.rarity) }}
              />
              <div 
                className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-30 blur-3xl"
                style={{ backgroundColor: getRarityColor(currentUnlock.rarity) }}
              />

              {/* Compteur si plusieurs badges */}
              {newlyUnlocked && newlyUnlocked.length > 1 && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: getRarityColor(currentUnlock.rarity), color: 'white' }}>
                  {currentUnlockIndex + 1} / {newlyUnlocked.length}
                </div>
              )}

              {/* Icône animée */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                style={{ 
                  backgroundColor: getRarityColor(currentUnlock.rarity),
                  boxShadow: `0 20px 40px ${getRarityColor(currentUnlock.rarity)}40`
                }}
              >
                {(() => {
                  const IconComponent = ICON_MAP[currentUnlock.icon] || Award;
                  return <IconComponent size={48} color="white" strokeWidth={2} />;
                })()}
              </motion.div>

              {/* Titre */}
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--brand-primary)' }}
              >
                {lang === 'fr' ? 'Nouveau Badge Débloqué !' : 'شارة جديدة مفتوحة!'}
              </motion.h3>

              {/* Nom du badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-4"
              >
                <h4 className="text-xl font-bold" style={{ color: getRarityColor(currentUnlock.rarity) }}>
                  {lang === 'fr' ? currentUnlock.title : currentUnlock.titleAr}
                </h4>
                <p className="text-sm mt-2" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? currentUnlock.description : currentUnlock.descriptionAr}
                </p>
              </motion.div>

              {/* Rareté */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
                style={{ 
                  backgroundColor: 'color-mix(in srgb, ' + getRarityColor(currentUnlock.rarity) + ' 20%, transparent)',
                  color: getRarityColor(currentUnlock.rarity)
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getRarityColor(currentUnlock.rarity) }}
                />
                {getRarityLabel(currentUnlock.rarity, lang)}
              </motion.div>

              {/* Bouton */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={handleNextUnlock}
                className="w-full py-3 rounded-2xl font-bold text-white transition-all hover:scale-105"
                style={{ 
                  backgroundColor: getRarityColor(currentUnlock.rarity),
                  boxShadow: `0 8px 24px ${getRarityColor(currentUnlock.rarity)}60`
                }}
              >
                {newlyUnlocked && currentUnlockIndex < newlyUnlocked.length - 1 
                  ? (lang === 'fr' ? 'Suivant →' : 'التالي →')
                  : (lang === 'fr' ? 'Super ! 🎉' : 'رائع! 🎉')
                }
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
