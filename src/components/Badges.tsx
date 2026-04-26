import React, { useState, useEffect } from 'react';
import { Badge, UserData, BADGE_DEFINITIONS, getRarityColor, getRarityLabel } from '../types';
import { getBadgeProgress, getBadgesByRarity, getTimeSinceUnlock, celebrateBadgeUnlock } from '../lib/badgeEngine';
import { useT } from '../lib/theme';

interface BadgesSectionProps {
  userData: UserData;
  setUserData?: (updater: (prev: UserData) => UserData) => void;
  lang: 'fr' | 'ar';
  newlyUnlocked?: Badge[];
}

export const BadgesSection = ({ userData, lang, newlyUnlocked }: BadgesSectionProps) => {
  const t = useT();
  const [selectedRarity, setSelectedRarity] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [currentUnlockIndex, setCurrentUnlockIndex] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState<(typeof BADGE_DEFINITIONS[0] & { unlockedAt?: number }) | null>(null);
  const fr = lang === 'fr';

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
  const card = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 14 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, color: t.ink }}>
            {fr ? 'Mes Badges' : 'أوسمتي'}
          </div>
          <div style={{ fontSize: 10, color: t.inkMute, marginTop: 4 }}>
            {fr ? 'Célébrez vos réussites' : 'احتفل بإنجازاتك'}
          </div>
        </div>

        <div style={{ ...card, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="19" fill="none" stroke={t.accent} strokeWidth="4" opacity={0.15}/>
              <circle cx="24" cy="24" r="19" fill="none" stroke={t.accent} strokeWidth="4"
                strokeDasharray={2 * Math.PI * 19}
                strokeDashoffset={2 * Math.PI * 19 * (1 - progress / 100)}
                strokeLinecap="round"/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: t.accent }}>
              {progress}%
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: t.ink }}>{unlockedCount}/{totalBadges}</div>
            <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {fr ? 'Débloqués' : 'مفتوحة'}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <button onClick={() => setSelectedRarity(null)}
          style={{
            flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            background: selectedRarity === null ? t.accent : t.card,
            color: selectedRarity === null ? '#1a0f00' : t.inkDim,
            border: `1px solid ${selectedRarity === null ? t.accent : t.line}`,
          }}>
          {fr ? 'Tous' : 'الكل'} ({totalBadges})
        </button>
        {rarities.map(rarity => {
          const count = badgesByRarity[rarity]?.length || 0;
          const totalOfRarity = BADGE_DEFINITIONS.filter(b => b.rarity === rarity).length;
          const rColor = getRarityColor(rarity);
          const isActive = selectedRarity === rarity;
          return (
            <button key={rarity} onClick={() => setSelectedRarity(rarity)}
              style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                background: isActive ? rColor : `${rColor}20`,
                color: isActive ? '#fff' : rColor,
                border: `1px solid ${rColor}44`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#fff' : rColor, display: 'inline-block' }}/>
              {getRarityLabel(rarity, lang)} ({count}/{totalOfRarity})
            </button>
          );
        })}
      </div>

      {/* Badge grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {filteredBadges.map((badge) => {
          const isUnlocked = unlockedIds.has(badge.id);
          const progressVal = getBadgeProgress(userData, badge.id);
          const rColor = getRarityColor(badge.rarity);

          return (
            <div key={badge.id} onClick={() => setSelectedBadge(badge)}
              style={{
                ...card, padding: '16px 14px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', gap: 10, cursor: 'pointer',
                opacity: isUnlocked ? 1 : 0.55,
                filter: isUnlocked ? 'none' : 'grayscale(60%)',
                borderColor: isUnlocked ? rColor : t.line,
                borderWidth: isUnlocked ? 2 : 1,
                position: 'relative',
              }}>
              <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%', background: rColor }}/>

              <div style={{
                width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isUnlocked ? `${rColor}22` : t.cardElev,
                fontSize: 24,
              }}>
                {badge.emoji || '🏅'}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: isUnlocked ? t.ink : t.inkMute, lineHeight: 1.3, marginBottom: 4 }}>
                  {fr ? badge.title : badge.titleAr}
                </div>
                <div style={{ fontSize: 9, color: t.inkMute, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {fr ? badge.description : badge.descriptionAr}
                </div>
              </div>

              {isUnlocked ? (
                <div style={{ fontSize: 9, fontWeight: 700, color: rColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {fr ? '✓ Débloqué' : '✓ مفتوح'}
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {fr ? 'Verrouillé' : 'مغلق'}
                  </div>
                  {progressVal > 0 && (
                    <>
                      <div style={{ height: 3, borderRadius: 2, background: t.cardElev, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressVal}%`, background: rColor, borderRadius: 2 }}/>
                      </div>
                      <div style={{ fontSize: 8, color: t.inkMute, marginTop: 3 }}>{Math.round(progressVal)}%</div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Badge detail modal */}
      {selectedBadge && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 0 0', background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSelectedBadge(null)}>
          <div style={{
            ...card, width: '100%', maxWidth: 420, borderRadius: '20px 20px 0 0', padding: '28px 24px',
            borderColor: getRarityColor(selectedBadge.rarity), borderWidth: 2, position: 'relative',
          }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedBadge(null)}
              style={{ position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: '50%', background: t.cardElev, border: `1px solid ${t.line}`, color: t.inkMute, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
              ✕
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${getRarityColor(selectedBadge.rarity)}22`,
                fontSize: 30,
              }}>
                {selectedBadge.emoji || '🏅'}
              </div>

              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: `${getRarityColor(selectedBadge.rarity)}20`, color: getRarityColor(selectedBadge.rarity) }}>
                {getRarityLabel(selectedBadge.rarity, lang)}
              </span>

              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, color: t.ink }}>
                {fr ? selectedBadge.title : selectedBadge.titleAr}
              </div>
              <div style={{ fontSize: 13, color: t.inkDim, lineHeight: 1.6 }}>
                {fr ? selectedBadge.description : selectedBadge.descriptionAr}
              </div>

              {unlockedIds.has(selectedBadge.id) ? (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: getRarityColor(selectedBadge.rarity) }}>
                    {fr ? 'Débloqué' : 'مفتوح'}
                  </div>
                  {selectedBadge.unlockedAt && (
                    <div style={{ fontSize: 10, color: t.inkMute, marginTop: 3 }}>
                      {getTimeSinceUnlock(selectedBadge.unlockedAt, lang)}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: 10, color: t.inkMute, marginBottom: 8 }}>{fr ? 'Non débloqué' : 'غير مفتوح'}</div>
                  {getBadgeProgress(userData, selectedBadge.id) > 0 && (
                    <>
                      <div style={{ height: 5, borderRadius: 3, background: t.cardElev, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${getBadgeProgress(userData, selectedBadge.id)}%`, background: getRarityColor(selectedBadge.rarity), borderRadius: 3 }}/>
                      </div>
                      <div style={{ fontSize: 10, color: t.inkMute, marginTop: 5 }}>
                        {Math.round(getBadgeProgress(userData, selectedBadge.id))}% {fr ? 'accompli' : 'مكتمل'}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unlock modal */}
      {showUnlockModal && currentUnlock && (() => {
        const rColor = getRarityColor(currentUnlock.rarity);
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowUnlockModal(false)}>
            <div style={{
              background: t.bgSoft, border: `3px solid ${rColor}`, borderRadius: 32, padding: '36px 28px',
              maxWidth: 360, width: '100%', textAlign: 'center',
              boxShadow: `0 0 60px ${rColor}44`,
            }}
              onClick={e => e.stopPropagation()}>

              {newlyUnlocked && newlyUnlocked.length > 1 && (
                <div style={{ position: 'absolute', top: 14, right: 14, padding: '3px 10px', borderRadius: 20, background: rColor, color: '#fff', fontSize: 10, fontWeight: 700 }}>
                  {currentUnlockIndex + 1}/{newlyUnlocked.length}
                </div>
              )}

              <div style={{ width: 80, height: 80, borderRadius: 22, background: rColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36, boxShadow: `0 16px 40px ${rColor}60` }}>
                {currentUnlock.emoji || '🏅'}
              </div>

              <div style={{ fontSize: 9, color: rColor, letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
                {fr ? '✦ Badge débloqué ✦' : '✦ شارة جديدة ✦'}
              </div>

              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: t.ink, marginBottom: 10 }}>
                {fr ? currentUnlock.title : currentUnlock.titleAr}
              </div>

              <div style={{ fontSize: 13, color: t.inkDim, lineHeight: 1.6, marginBottom: 14 }}>
                {fr ? currentUnlock.description : currentUnlock.descriptionAr}
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: `${rColor}20`, border: `1px solid ${rColor}44`, color: rColor, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: rColor, display: 'inline-block' }}/>
                {getRarityLabel(currentUnlock.rarity, lang)}
              </div>

              <button onClick={handleNextUnlock}
                style={{ display: 'block', width: '100%', padding: '14px', borderRadius: 16, background: rColor, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 10px 28px ${rColor}55` }}>
                {newlyUnlocked && currentUnlockIndex < newlyUnlocked.length - 1
                  ? (fr ? 'Suivant →' : 'التالي →')
                  : (fr ? 'Excellent !' : 'ممتاز!')}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
