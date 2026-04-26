import React, { useState, useEffect } from 'react';
import { Badge, UserData, BADGE_DEFINITIONS, getRarityColor, getRarityLabel } from '../types';
import { getBadgeProgress, getBadgesByRarity, getTimeSinceUnlock, celebrateBadgeUnlock } from '../lib/badgeEngine';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';

const ICON_MAP: Record<string, React.ReactNode> = {
  // lowercase
  star: Icons.star, flame: Icons.flame, sparkle: Icons.sparkle, moon: Icons.moon,
  book: Icons.book, beads: Icons.beads, pen: Icons.pen, palette: Icons.palette,
  badge: Icons.badge, trophy: Icons.trophy, heart: Icons.heart, check: Icons.check,
  // PascalCase (from BADGE_DEFINITIONS)
  Star: Icons.star, Flame: Icons.flame, Sparkles: Icons.sparkle, Moon: Icons.moon,
  BookOpen: Icons.book, BookText: Icons.book, Bookmark: Icons.bookmark,
  Trophy: Icons.trophy, Award: Icons.badge, Medal: Icons.badge, Crown: Icons.sparkle,
  Gem: Icons.sparkle, Heart: Icons.heart, Flag: Icons.target, Target: Icons.target,
  ClipboardCheck: Icons.check, NotebookPen: Icons.pen, Palette: Icons.palette,
  Paintbrush: Icons.palette, Zap: Icons.flame, Calendar: Icons.calendar,
  CalendarDays: Icons.calendar,
};

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
  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 12 };
  const unlocked = allBadges.filter(b => unlockedIds.has(b.id));
  const locked   = allBadges.filter(b => !unlockedIds.has(b.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
            {fr ? `${unlockedCount} sur ${totalBadges} débloqués` : `${unlockedCount} من ${totalBadges} مفتوح`}
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, margin: 0, color: t.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {fr ? 'Badges' : 'الشارات'}
          </h1>
        </div>
        <button
          onClick={() => setSelectedRarity(selectedRarity ? null : 'rare')}
          style={{ marginTop: 4, padding: '8px 14px', borderRadius: 8, background: t.card, border: `1px solid ${t.line}`, color: t.inkDim, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <Icon d={Icons.filter} size={12}/> {fr ? 'Toutes les raretés' : 'كل الندرات'}
        </button>
      </div>

      {/* ── 4 rarity tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {rarities.map(rarity => {
          const rColor = getRarityColor(rarity);
          const count = badgesByRarity[rarity]?.length || 0;
          const label = fr
            ? { common: 'Communs', rare: 'Rares', epic: 'Épiques', legendary: 'Légendaires' }[rarity]
            : { common: 'عادي', rare: 'نادر', epic: 'ملحمي', legendary: 'أسطوري' }[rarity];
          return (
            <div key={rarity} style={{ ...card, padding: '14px 16px', cursor: 'pointer' }} onClick={() => setSelectedRarity(selectedRarity === rarity ? null : rarity)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: rColor, display: 'inline-block' }}/>
                <span style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: t.ink, fontWeight: 300 }}>{count}</span>
                <span style={{ fontSize: 11, color: t.inkDim }}>{fr ? 'débloqués' : 'مفتوح'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Débloqués récemment ── */}
      {unlocked.length > 0 && (
        <>
          <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            {fr ? 'Débloqués récemment' : 'المفتوحة مؤخراً'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {(selectedRarity ? unlocked.filter(b => b.rarity === selectedRarity) : unlocked).map(badge => {
              const rColor = getRarityColor(badge.rarity);
              return (
                <div key={badge.id} onClick={() => setSelectedBadge(badge)}
                  style={{ padding: '18px 14px', background: t.card, border: `1px solid ${rColor}33`, borderRadius: 12, textAlign: 'center', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${rColor}22, transparent 70%)` }}/>
                  <div style={{ width: 44, height: 44, margin: '0 auto', borderRadius: '50%', background: t.cardElev, border: `1px solid ${rColor}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                    <Icon d={ICON_MAP[badge.icon] ?? Icons.star} size={20} color={rColor} stroke={1.5}/>
                  </div>
                  <div style={{ fontSize: 11.5, color: t.ink, fontWeight: 500, marginTop: 10, position: 'relative', zIndex: 1 }}>
                    {fr ? badge.title : badge.titleAr}
                  </div>
                  <div style={{ fontSize: 9, color: rColor, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4, position: 'relative', zIndex: 1 }}>
                    {getRarityLabel(badge.rarity, lang)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── À débloquer ── */}
      {locked.length > 0 && (
        <>
          <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            {fr ? 'À débloquer' : 'للفتح'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
            {(selectedRarity ? locked.filter(b => b.rarity === selectedRarity) : locked).map(badge => {
              const rColor = getRarityColor(badge.rarity);
              const progressVal = getBadgeProgress(userData, badge.id);
              return (
                <div key={badge.id} onClick={() => setSelectedBadge(badge)}
                  style={{ padding: '18px 14px', background: t.card, border: `1px dashed ${t.line}`, borderRadius: 12, textAlign: 'center', opacity: 0.55, cursor: 'pointer' }}>
                  <div style={{ width: 44, height: 44, margin: '0 auto', borderRadius: '50%', background: t.cardElev, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d={Icons.lock} size={16} color={t.inkMute}/>
                  </div>
                  <div style={{ fontSize: 11.5, color: t.inkDim, fontWeight: 500, marginTop: 10 }}>
                    {fr ? badge.title : badge.titleAr}
                  </div>
                  <div style={{ fontSize: 9, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>
                    {getRarityLabel(badge.rarity, lang)}
                  </div>
                  {progressVal > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 2, borderRadius: 2, background: t.cardElev }}>
                        <div style={{ height: '100%', width: `${progressVal}%`, background: rColor, borderRadius: 2 }}/>
                      </div>
                      <div style={{ fontSize: 8, color: t.inkMute, marginTop: 3 }}>{Math.round(progressVal)}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

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
              }}>
                <Icon d={ICON_MAP[selectedBadge.icon] ?? Icons.star} size={28} color={getRarityColor(selectedBadge.rarity)} stroke={1.5}/>
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

              <div style={{ width: 80, height: 80, borderRadius: 22, background: rColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 16px 40px ${rColor}60` }}>
                <Icon d={ICON_MAP[currentUnlock.icon] ?? Icons.star} size={36} color="#fff" stroke={1.5}/>
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
