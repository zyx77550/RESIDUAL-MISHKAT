import React, { useState, useMemo } from 'react';
import { Surah, UserData } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';

type StatusFilter = 'all' | Surah['status'];

const STATUS_CONFIG = {
  not_started: { color: '#64748b', labelFr: 'Non commencé', labelAr: 'لم تبدأ' },
  in_progress:  { color: '#f59e0b', labelFr: 'En cours',     labelAr: 'قيد الحفظ' },
  review:       { color: '#60a5fa', labelFr: 'En révision',  labelAr: 'مراجعة'   },
  memorized:    { color: '#4ade80', labelFr: 'Mémorisé',     labelAr: 'تم الحفظ' },
};

export const MemorizationSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [juzFilter, setJuzFilter] = useState<number | null>(null);
  const fr = lang === 'fr';

  const updateStatus = (id: number, status: Surah['status']) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map((s: Surah) => s.id === id ? { ...s, status } : s)
    }));
  };

  const memorizedCount = userData.surahs.filter(s => s.status === 'memorized').length;
  const inProgressCount = userData.surahs.filter(s => s.status === 'in_progress').length;
  const reviewCount = userData.surahs.filter(s => s.status === 'review').length;

  const filtered = useMemo(() => {
    return userData.surahs.filter(s => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.arabicName.includes(search);
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesJuz = juzFilter === null || s.juz === juzFilter;
      return matchesSearch && matchesStatus && matchesJuz;
    });
  }, [userData.surahs, search, statusFilter, juzFilter]);

  const filterTabs: { id: StatusFilter; labelFr: string; labelAr: string; count: number }[] = [
    { id: 'all',         labelFr: 'Toutes',   labelAr: 'الكل',   count: 114 },
    { id: 'memorized',   labelFr: 'Mémo.',    labelAr: 'محفوظ',  count: memorizedCount },
    { id: 'in_progress', labelFr: 'En cours', labelAr: 'يُحفظ',  count: inProgressCount },
    { id: 'review',      labelFr: 'Révision', labelAr: 'مراجعة', count: reviewCount },
    { id: 'not_started', labelFr: 'Non déb.', labelAr: 'لم يبدأ',count: 114 - memorizedCount - inProgressCount - reviewCount },
  ];

  const progressPct = Math.round((memorizedCount / 114) * 100);
  const inputStyle = { width: '100%', padding: '11px 14px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 8, color: t.ink, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, color: t.ink }}>
          {fr ? 'Mémorisation' : 'الحِفْظ'}
        </div>
        <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 4 }}>
          تَتَبُّعُ التَّقَدُّمِ فِي كُلِّ سُورَة
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, padding: '18px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: t.ink }}>{memorizedCount}</span>
            <span style={{ fontSize: 12, color: t.inkMute }}> / 114</span>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
              {fr ? 'Sourates mémorisées' : 'سورة محفوظة'}
            </div>
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: t.accent }}>{progressPct}%</div>
        </div>
        <div style={{ height: 4, background: t.cardElev, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: t.accent, borderRadius: 2 }}/>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          {inProgressCount > 0 && (
            <span style={{ fontSize: 9, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}/>
              {inProgressCount} {fr ? 'en cours' : 'قيد الحفظ'}
            </span>
          )}
          {reviewCount > 0 && (
            <span style={{ fontSize: 9, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }}/>
              {reviewCount} {fr ? 'en révision' : 'مراجعة'}
            </span>
          )}
        </div>
      </div>

      {/* Search + Juz filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon d={Icons.search} size={14} color={t.inkMute}/>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={fr ? 'Rechercher une sourate…' : 'ابحث عن سورة…'}
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
        <select
          value={juzFilter ?? ''}
          onChange={e => setJuzFilter(e.target.value === '' ? null : parseInt(e.target.value))}
          style={{ ...inputStyle, width: 'auto', cursor: 'pointer', minWidth: 130 }}
        >
          <option value="">{fr ? 'Tous les Juz' : 'كل الأجزاء'}</option>
          {[...Array(30)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{fr ? `Juz ${i + 1}` : `الجزء ${i + 1}`}</option>
          ))}
        </select>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {filterTabs.map(tab => (
          <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
            style={{
              flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              background: statusFilter === tab.id ? t.accent : t.card,
              color: statusFilter === tab.id ? '#1a0f00' : t.inkDim,
              border: `1px solid ${statusFilter === tab.id ? t.accent : t.line}`,
            }}>
            {fr ? tab.labelFr : tab.labelAr} ({tab.count})
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Icon d={Icons.book} size={48} color={t.inkMute}/>
          <div style={{ fontSize: 13, color: t.inkMute, marginTop: 12 }}>
            {fr ? 'Aucune sourate trouvée.' : 'لا توجد سورة.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {filtered.map((surah: Surah) => {
            const cfg = STATUS_CONFIG[surah.status];
            return (
              <div key={surah.id} style={{
                background: t.card, border: `1px solid ${t.line}`, borderRadius: 12,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, borderRadius: '0 2px 2px 0', background: cfg.color, opacity: surah.status === 'not_started' ? 0.25 : 0.85 }}/>

                <div style={{
                  width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: surah.status === 'memorized' ? cfg.color : t.cardElev,
                  color: surah.status === 'memorized' ? '#fff' : t.ink,
                  fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 500,
                }}>
                  {surah.id}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 13, color: t.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {surah.name}
                    </div>
                    {userData.settings?.showArabicNames && (
                      <span style={{ fontFamily: 'Amiri Quran, serif', fontSize: 16, color: t.accentBright, flexShrink: 0 }}>
                        {surah.arabicName}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ fontSize: 9, color: star <= surah.difficulty ? t.accent : t.cardElev }}>★</span>
                      ))}
                    </div>

                    <select
                      value={surah.status}
                      onChange={e => updateStatus(surah.id, e.target.value as Surah['status'])}
                      style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        borderRadius: 6, padding: '4px 8px', outline: 'none', cursor: 'pointer',
                        background: `${cfg.color}22`, color: cfg.color, border: `1px solid ${cfg.color}44`,
                      }}
                    >
                      <option value="not_started">{fr ? 'Non commencé' : 'لم تبدأ'}</option>
                      <option value="in_progress">{fr ? 'En cours' : 'قيد الحفظ'}</option>
                      <option value="review">{fr ? 'En révision' : 'مراجعة'}</option>
                      <option value="memorized">{fr ? 'Mémorisé' : 'تم الحفظ'}</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
