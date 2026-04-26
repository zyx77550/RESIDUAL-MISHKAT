import React, { useState, useMemo } from 'react';
import { Surah, UserData } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';

type StatusFilter = 'all' | Surah['status'] | 'juz_amma' | 'tabarak';

export const MemorizationSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();

  const STATUS_CONFIG = {
    not_started: { color: t.inkMute,  labelFr: 'Non commencé', labelAr: 'لم تبدأ' },
    in_progress:  { color: t.accent,   labelFr: 'En cours',     labelAr: 'قيد الحفظ' },
    review:       { color: '#a78bdb',  labelFr: 'En révision',  labelAr: 'مراجعة'   },
    memorized:    { color: '#5fb088',  labelFr: 'Mémorisé',     labelAr: 'تم الحفظ' },
  };

  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [juzFilter, setJuzFilter] = useState<number | null>(null);
  const fr = lang === 'fr';

  const updateStatus = (id: number, status: Surah['status']) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map((s: Surah) => s.id === id ? { ...s, status } : s)
    }));
  };

  const advanceStatus = (surah: Surah) => {
    const order: Surah['status'][] = ['not_started', 'in_progress', 'review', 'memorized'];
    const idx = order.indexOf(surah.status);
    updateStatus(surah.id, order[(idx + 1) % order.length]);
  };

  const memorizedCount   = userData.surahs.filter(s => s.status === 'memorized').length;
  const inProgressCount  = userData.surahs.filter(s => s.status === 'in_progress').length;
  const reviewCount      = userData.surahs.filter(s => s.status === 'review').length;
  const totalVersets     = userData.surahs.filter(s => s.status === 'memorized').reduce((acc, s) => acc + s.verses, 0);

  const filtered = useMemo(() => {
    return userData.surahs.filter(s => {
      const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.arabicName.includes(search);
      const matchesStatus =
        statusFilter === 'all'       ? true :
        statusFilter === 'juz_amma'  ? s.juz === 30 :
        statusFilter === 'tabarak'   ? s.juz === 29 :
        s.status === statusFilter;
      const matchesJuz = juzFilter === null || s.juz === juzFilter;
      return matchesSearch && matchesStatus && matchesJuz;
    });
  }, [userData.surahs, search, statusFilter, juzFilter]);

  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 10 };

  const filterTabs: { id: StatusFilter; labelFr: string; labelAr: string }[] = [
    { id: 'all',         labelFr: 'Toutes',     labelAr: 'الكل'    },
    { id: 'memorized',   labelFr: 'Mémorisées', labelAr: 'محفوظ'   },
    { id: 'in_progress', labelFr: 'En cours',   labelAr: 'يُحفظ'   },
    { id: 'review',      labelFr: 'Révision',   labelAr: 'مراجعة'  },
    { id: 'juz_amma',    labelFr: 'Juz Amma',   labelAr: 'جزء عم'  },
    { id: 'tabarak',     labelFr: 'Tabarak',     labelAr: 'تبارك'  },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
            {fr
              ? `114 sourates · Juz ${juzFilter ?? '1 — 30'}`
              : `١١٤ سورة · الجزء ${juzFilter ?? '١ — ٣٠'}`}
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, margin: 0, color: t.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {fr ? 'Mémorisation' : 'الحِفْظ'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <select
            value={juzFilter ?? ''}
            onChange={e => setJuzFilter(e.target.value === '' ? null : parseInt(e.target.value))}
            style={{ padding: '7px 12px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 8, color: t.inkDim, fontSize: 11, cursor: 'pointer', outline: 'none' }}
          >
            <option value="">{fr ? 'Tous les Juz' : 'كل الأجزاء'}</option>
            {[...Array(30)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{fr ? `Juz ${i + 1}` : `الجزء ${i + 1}`}</option>
            ))}
          </select>
          <button
            style={{ padding: '7px 14px', borderRadius: 8, background: t.card, border: `1px solid ${t.line}`, color: t.inkDim, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <Icon d={Icons.filter} size={12}/> {fr ? 'Filtrer' : 'تصفية'}
          </button>
          <button
            style={{ padding: '7px 16px', borderRadius: 8, background: t.accent, border: 'none', color: '#1a0f00', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
          >
            <Icon d={Icons.play} size={11}/> {fr ? 'Reprendre' : 'متابعة'}
          </button>
        </div>
      </div>

      {/* ── 4 stat tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: fr ? 'Mémorisées' : 'محفوظة',   value: memorizedCount,  sub: '/114' },
          { label: fr ? 'En cours'   : 'قيد الحفظ', value: inProgressCount, sub: fr ? 'sourates' : 'سور' },
          { label: fr ? 'En révision': 'مراجعة',    value: reviewCount,     sub: fr ? 'à consolider' : 'للمراجعة' },
          { label: fr ? 'Versets'    : 'آيات',      value: totalVersets,    sub: fr ? 'acquis au total' : 'محفوظة' },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: t.ink, fontWeight: 300 }}>{s.value}</span>
              <span style={{ fontSize: 11, color: t.inkDim }}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '10px 14px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 10 }}>
        <span style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', flexShrink: 0, marginRight: 6 }}>
          {fr ? 'Filtre' : 'تصفية'}
        </span>
        {filterTabs.map(tab => (
          <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
            style={{
              padding: '4px 12px', borderRadius: 999, fontSize: 11.5, flexShrink: 0,
              fontWeight: statusFilter === tab.id ? 500 : 400,
              color: statusFilter === tab.id ? t.ink : t.inkDim,
              background: statusFilter === tab.id ? `${t.accent}18` : 'transparent',
              border: statusFilter === tab.id ? `1px solid ${t.accent}33` : '1px solid transparent',
              cursor: 'pointer',
            }}>
            {fr ? tab.labelFr : tab.labelAr}
          </button>
        ))}
        <div style={{ position: 'relative', marginLeft: 6 }}>
          <Icon d={Icons.search} size={12} color={t.inkMute} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={fr ? 'Rechercher…' : 'بحث…'}
            style={{ width: 140, padding: '5px 8px 5px 26px', background: t.cardElev, border: `1px solid ${t.line}`, borderRadius: 7, color: t.ink, fontSize: 11, outline: 'none' }}
          />
        </div>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 11, color: t.inkMute, flexShrink: 0 }}>
          {fr ? `Tri : N° de sourate ↓` : `ترتيب: رقم السورة ↓`}
        </span>
      </div>

      {/* ── Compact grid ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Icon d={Icons.book} size={40} color={t.inkMute}/>
          <div style={{ fontSize: 13, color: t.inkMute, marginTop: 12 }}>
            {fr ? 'Aucune sourate trouvée.' : 'لا توجد سورة.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
          {filtered.map((surah: Surah) => {
            const isMemo = surah.status === 'memorized';
            const isProg = surah.status === 'in_progress';
            const isRev  = surah.status === 'review';
            const borderColor = isProg ? t.accent : isRev ? '#a78bdb' : isMemo ? `${t.accent}44` : t.line;
            return (
              <div
                key={surah.id}
                onClick={() => advanceStatus(surah)}
                title={fr ? STATUS_CONFIG[surah.status].labelFr : STATUS_CONFIG[surah.status].labelAr}
                style={{
                  padding: '12px 10px', borderRadius: 9, cursor: 'pointer',
                  background: isMemo ? `${t.accent}12` : t.card,
                  border: `1px solid ${borderColor}`,
                  position: 'relative', minHeight: 88,
                  transition: 'opacity 0.15s',
                }}
              >
                {/* Top row: ID + status icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Fraunces, serif', fontSize: 10, color: t.inkMute }}>
                    {String(surah.id).padStart(3, '0')}
                  </span>
                  {isMemo && <Icon d={Icons.check}  size={11} color={t.accent}/>}
                  {isProg  && <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.accent, display: 'inline-block' }}/>}
                  {isRev   && <Icon d={Icons.rotate} size={10} color="#a78bdb"/>}
                </div>

                {/* Arabic name */}
                <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 17, color: isMemo ? t.accentBright : t.ink, direction: 'rtl', lineHeight: 1.2 }}>
                  {surah.arabicName}
                </div>

                {/* French name */}
                <div style={{ fontSize: 10, color: t.inkDim, marginTop: 4, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {surah.name}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 4 }}>
        {[
          { color: `${t.accent}44`,  label: fr ? 'Mémorisé'     : 'محفوظ',    border: `${t.accent}44` },
          { color: t.accent,         label: fr ? 'En cours'      : 'قيد الحفظ', border: t.accent },
          { color: '#a78bdb',        label: fr ? 'En révision'   : 'مراجعة',   border: '#a78bdb' },
          { color: t.line,           label: fr ? 'Non commencé'  : 'لم يبدأ',   border: t.line },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: 'transparent', border: `1.5px solid ${item.border}` }}/>
            <span style={{ fontSize: 10, color: t.inkMute }}>{item.label}</span>
          </div>
        ))}
        <span style={{ fontSize: 10, color: t.inkMute, marginLeft: 'auto', fontStyle: 'italic' }}>
          {fr ? 'Cliquez pour avancer' : 'انقر للتقدم'}
        </span>
      </div>
    </div>
  );
};
