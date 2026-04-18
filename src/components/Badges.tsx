import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Star, Zap, BookOpen, Heart, Trophy, Medal, Crown, Gem,
  Target, Flag, ClipboardCheck, Flame, Moon, Sparkles,
  NotebookPen, BookText, Palette, Paintbrush, Calendar, CalendarDays,
  X, Lock, Unlock, TrendingUp, RotateCcw, Bookmark
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge, UserData, BADGE_DEFINITIONS, getRarityColor, getRarityLabel } from '../types';
import { getBadgeProgress, getBadgesByRarity, getTimeSinceUnlock, celebrateBadgeUnlock } from '../lib/badgeEngine';

const ICON_MAP: Record<string, React.ElementType> = {
  Star, Award, Trophy, Medal, Crown, Gem, BookOpen, Bookmark,
  Target, Flag, ClipboardCheck, Flame, Zap, Moon, Sparkles,
  Heart, NotebookPen, BookText, Palette, Paintbrush, Calendar, CalendarDays,
  RotateCcw, TrendingUp
};

interface BadgesSectionProps {
  userData: UserData;
  setUserData?: (updater: (prev: UserData) => UserData) => void;
  lang: 'fr' | 'ar';
  newlyUnlocked?: Badge[];
}

export const BadgesSection = ({ userData, lang, newlyUnlocked }: BadgesSectionProps) => {
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [currentUnlockIndex, setCurrentUnlockIndex] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState<(typeof BADGE_DEFINITIONS[0] & { unlockedAt?: number }) | null>(null);

  useEffect(() => {
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      setShowUnlockModal(true);
      setCurrentUnlockIndex(0);
      newlyUnlocked.forEach((badge, index) => {
        setTimeout(() => celebrateBadgeUnlock(badge), index * 800);
      });
    }
  }, [newlyUnlocked]);

  const unlockedIds = new Set(userData.badges.map(b => b.id));
  const allBadges = BADGE_DEFINITIONS.map(def => ({
    ...def,
    unlockedAt: userData.badges.find(b => b.id === def.id)?.unlockedAt
  }));

  const filteredBadges = selectedRarity ? allBadges.filter(b => b.rarity === selectedRarity) : allBadges;
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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl text-primary leading-tight">
            {lang === 'fr' ? 'Badges' : 'أوسمتي'}
          </h2>
          <p className="text-secondary font-bold tracking-[0.4em] uppercase text-[10px] opacity-60 mt-1">
            {lang === 'fr' ? 'Célébrez vos réussites' : 'احتفل بإنجازاتك'}
          </p>
        </div>

        {/* Progress compact */}
        <div className="glass-card px-4 py-3 flex items-center gap-3 self-start sm:self-auto">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent"
                style={{ color: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)' }} />
              <motion.circle cx="50%" cy="50%" r="40%" stroke="var(--brand-primary)" strokeWidth="8" fill="transparent"
                strokeDasharray="100 100" pathLength="1"
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold" style={{ color: 'var(--brand-primary)' }}>{progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-base sm:text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>{unlockedCount}/{totalBadges}</p>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: 'var(--brand-text-muted)' }}>
              {lang === 'fr' ? 'Débloqués' : 'مفتوحة'}
            </p>
          </div>
        </div>
      </header>

      {/* Filtres — scroll horizontal sur mobile */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setSelectedRarity(null)}
          className="flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all"
          style={{
            backgroundColor: selectedRarity === null ? 'var(--brand-primary)' : 'color-mix(in srgb, var(--brand-primary) 8%, transparent)',
            color: selectedRarity === null ? 'white' : 'var(--brand-text-main)',
            minHeight: '36px',
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
              className="flex-shrink-0 px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: selectedRarity === rarity
                  ? getRarityColor(rarity)
                  : `color-mix(in srgb, ${getRarityColor(rarity)} 15%, transparent)`,
                color: selectedRarity === rarity ? 'white' : getRarityColor(rarity),
                minHeight: '36px',
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selectedRarity === rarity ? 'white' : getRarityColor(rarity) }} />
              {getRarityLabel(rarity, lang)}
              <span>({count}/{totalOfRarity})</span>
            </button>
          );
        })}
      </div>

      {/* Grille — responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
        {filteredBadges.map((badge, index) => {
          const isUnlocked = unlockedIds.has(badge.id);
          const progressVal = getBadgeProgress(userData, badge.id);
          const IconComponent = ICON_MAP[badge.icon] || Award;

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.5) }}
              whileHover={isUnlocked ? { y: -4, scale: 1.02 } : { scale: 1.01 }}
              onClick={() => setSelectedBadge(badge)}
              className={cn(
                "relative glass-card p-3 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 transition-all cursor-pointer",
                !isUnlocked && "opacity-60 grayscale"
              )}
              style={{
                borderColor: isUnlocked ? getRarityColor(badge.rarity) : 'var(--border-subtle)',
                borderWidth: isUnlocked ? '2px' : '1px'
              }}
            >
              {/* Dot rareté */}
              <div
                className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getRarityColor(badge.rarity), boxShadow: `0 0 6px ${getRarityColor(badge.rarity)}66` }}
              />

              {/* Icône */}
              <div
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isUnlocked
                    ? `color-mix(in srgb, ${getRarityColor(badge.rarity)} 20%, transparent)`
                    : 'color-mix(in srgb, var(--brand-primary) 5%, transparent)',
                  color: isUnlocked ? getRarityColor(badge.rarity) : 'var(--brand-text-muted)'
                }}
              >
                <IconComponent size={20} className="sm:hidden" strokeWidth={isUnlocked ? 2 : 1.5} />
                <IconComponent size={28} className="hidden sm:block" strokeWidth={isUnlocked ? 2 : 1.5} />
              </div>

              {/* Titre */}
              <div className="w-full">
                <h4 className="font-bold text-xs sm:text-sm leading-tight" style={{ color: isUnlocked ? 'var(--brand-primary)' : 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? badge.title : badge.titleAr}
                </h4>
                <p className="text-[10px] sm:text-[11px] mt-0.5 sm:mt-1 leading-snug line-clamp-2" style={{ color: 'var(--brand-text-muted)' }}>
                  {lang === 'fr' ? badge.description : badge.descriptionAr}
                </p>
              </div>

              {/* Statut */}
              {isUnlocked ? (
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: getRarityColor(badge.rarity) }}>
                  <Unlock size={10} />
                  {lang === 'fr' ? 'Débloqué' : 'مفتوح'}
                </div>
              ) : (
                <div className="w-full space-y-1">
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider justify-center"
                    style={{ color: 'var(--brand-text-muted)' }}>
                    <Lock size={10} />
                    {lang === 'fr' ? 'Verrouillé' : 'مغلق'}
                  </div>
                  {progressVal > 0 && (
                    <div className="w-full">
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressVal}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          style={{ backgroundColor: getRarityColor(badge.rarity) }}
                        />
                      </div>
                      <p className="text-[10px] mt-0.5 text-center" style={{ color: 'var(--brand-text-muted)' }}>
                        {Math.round(progressVal)}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Modal détail badge */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="glass-card w-full sm:max-w-sm sm:rounded-[2rem] rounded-t-[2rem] p-6 sm:p-8 relative overflow-hidden"
              style={{ borderColor: getRarityColor(selectedBadge.rarity), borderWidth: '2px' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: getRarityColor(selectedBadge.rarity) }} />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: getRarityColor(selectedBadge.rarity) }} />
              <button onClick={() => setSelectedBadge(null)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--brand-text-muted)' }}>
                <X size={16} />
              </button>
              <div className="flex flex-col items-center text-center gap-4 relative z-10">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `color-mix(in srgb, ${getRarityColor(selectedBadge.rarity)} 20%, transparent)`, color: getRarityColor(selectedBadge.rarity) }}
                >
                  {(() => { const IC = ICON_MAP[selectedBadge.icon] || Award; return <IC size={32} />; })()}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider mb-2"
                    style={{ backgroundColor: `color-mix(in srgb, ${getRarityColor(selectedBadge.rarity)} 15%, transparent)`, color: getRarityColor(selectedBadge.rarity) }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getRarityColor(selectedBadge.rarity) }} />
                    {getRarityLabel(selectedBadge.rarity, lang)}
                  </span>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                    {lang === 'fr' ? selectedBadge.title : selectedBadge.titleAr}
                  </h3>
                  <p className="text-sm mt-2" style={{ color: 'var(--brand-text-muted)' }}>
                    {lang === 'fr' ? selectedBadge.description : selectedBadge.descriptionAr}
                  </p>
                </div>
                {unlockedIds.has(selectedBadge.id) ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: getRarityColor(selectedBadge.rarity) }}>
                      <Unlock size={12} /> {lang === 'fr' ? 'Débloqué' : 'مفتوح'}
                    </div>
                    {selectedBadge.unlockedAt && (
                      <p className="text-[10px]" style={{ color: 'var(--brand-text-muted)' }}>
                        {getTimeSinceUnlock(selectedBadge.unlockedAt, lang)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-1.5 text-xs font-bold justify-center mb-2" style={{ color: 'var(--brand-text-muted)' }}>
                      <Lock size={12} /> {lang === 'fr' ? 'Non débloqué' : 'غير مفتوح'}
                    </div>
                    {getBadgeProgress(userData, selectedBadge.id) > 0 && (
                      <>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${getBadgeProgress(userData, selectedBadge.id)}%`, backgroundColor: getRarityColor(selectedBadge.rarity) }} />
                        </div>
                        <p className="text-[10px] mt-1 text-center" style={{ color: 'var(--brand-text-muted)' }}>
                          {Math.round(getBadgeProgress(userData, selectedBadge.id))}% {lang === 'fr' ? 'accompli' : 'مكتمل'}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal unlock — cinematic, fully responsive ── */}
      <AnimatePresence>
        {showUnlockModal && currentUnlock && (() => {
          const rColor = getRarityColor(currentUnlock.rarity);
          const IC = ICON_MAP[currentUnlock.icon] || Award;
          const isLegendary = currentUnlock.rarity === 'legendary';
          return (
            <motion.div
              key="unlock-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
              style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px) saturate(160%)' }}
              onClick={() => setShowUnlockModal(false)}
            >
              {/* Animated background rays (legendary only) */}
              {isLegendary && (
                <motion.div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="absolute left-1/2 top-1/2 origin-bottom"
                      style={{
                        width: 3, height: '60vmax',
                        background: `linear-gradient(to top, ${rColor}55, transparent)`,
                        transform: `rotate(${i * 30}deg) translateX(-50%)`,
                        transformOrigin: '50% 100%',
                      }}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.08 }}
                    />
                  ))}
                </motion.div>
              )}

              <motion.div
                initial={{ scale: 0.4, y: 60, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.7, y: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className="relative w-full max-w-[92vw] sm:max-w-sm rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden text-center"
                style={{ border: `3px solid ${rColor}`, boxShadow: `0 0 60px ${rColor}55, 0 24px 60px rgba(0,0,0,0.5)` }}
                onClick={e => e.stopPropagation()}
              >
                {/* Card background with gradient */}
                <div
                  className="absolute inset-0 -z-10"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${rColor}28 0%, var(--brand-surface) 65%)` }}
                />

                {/* Decorative blobs */}
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: rColor, opacity: 0.25 }} />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: rColor, opacity: 0.25 }} />

                {/* Counter (multiple unlocks) */}
                {newlyUnlocked && newlyUnlocked.length > 1 && (
                  <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full text-[10px] font-black"
                    style={{ backgroundColor: rColor, color: 'white' }}>
                    {currentUnlockIndex + 1}/{newlyUnlocked.length}
                  </div>
                )}

                <div className="px-5 pt-8 pb-6 sm:px-8 sm:pt-10 sm:pb-8 flex flex-col items-center gap-4">

                  {/* Pulsing ring + icon */}
                  <div className="relative flex items-center justify-center">
                    {/* Outer pulse rings */}
                    <motion.div
                      className="absolute rounded-full"
                      style={{ width: 100, height: 100, border: `2px solid ${rColor}` }}
                      animate={{ scale: [1, 1.5, 1.5], opacity: [0.6, 0, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="absolute rounded-full"
                      style={{ width: 100, height: 100, border: `2px solid ${rColor}` }}
                      animate={{ scale: [1, 1.8, 1.8], opacity: [0.4, 0, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
                    />
                    {/* Icon container */}
                    <motion.div
                      initial={{ scale: 0, rotate: -200 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 16 }}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] flex items-center justify-center shadow-2xl z-10"
                      style={{ backgroundColor: rColor, boxShadow: `0 16px 40px ${rColor}60` }}
                    >
                      <IC size={36} color="white" strokeWidth={1.8} className="sm:w-10 sm:h-10" />
                      {/* Shine overlay */}
                      <div className="absolute inset-0 rounded-[1.5rem] overflow-hidden pointer-events-none">
                        <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-white opacity-15 blur-md" />
                      </div>
                    </motion.div>
                  </div>

                  {/* "Badge Débloqué" label */}
                  <motion.p
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
                    className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]"
                    style={{ color: rColor }}
                  >
                    {lang === 'fr' ? '✦ Badge débloqué ✦' : '✦ شارة جديدة ✦'}
                  </motion.p>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="text-xl sm:text-2xl font-black leading-tight"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    {lang === 'fr' ? currentUnlock.title : currentUnlock.titleAr}
                  </motion.h3>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ color: 'var(--brand-text-muted)' }}
                  >
                    {lang === 'fr' ? currentUnlock.description : currentUnlock.descriptionAr}
                  </motion.p>

                  {/* Rarity pill */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest"
                    style={{ backgroundColor: `${rColor}22`, border: `1px solid ${rColor}55`, color: rColor }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rColor }} />
                    {getRarityLabel(currentUnlock.rarity, lang)}
                  </motion.div>

                  {/* CTA button */}
                  <motion.button
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={handleNextUnlock}
                    className="w-full py-3.5 rounded-2xl font-black text-sm sm:text-base text-white transition-all"
                    style={{ background: `linear-gradient(135deg, ${rColor}, color-mix(in srgb, ${rColor} 70%, #000))`, boxShadow: `0 10px 28px ${rColor}55` }}
                  >
                    {newlyUnlocked && currentUnlockIndex < newlyUnlocked.length - 1
                      ? (lang === 'fr' ? 'Suivant →' : 'التالي →')
                      : (lang === 'fr' ? 'Excellent !' : 'ممتاز!')}
                  </motion.button>

                  {/* Tap-to-dismiss hint */}
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.2 }}
                    className="text-[8px] uppercase tracking-widest"
                    style={{ color: 'var(--brand-text-muted)' }}
                  >
                    {lang === 'fr' ? 'Tap en dehors pour fermer' : 'اضغط خارج للإغلاق'}
                  </motion.p>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};
