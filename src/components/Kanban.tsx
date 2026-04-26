import React from 'react';
import { Surah, UserData } from '../types';
import { useT } from '../lib/theme';

const COLUMN_CONFIG_BASE = [
  { id: 'not_started' as const, labelFr: 'Non commencé',    labelAr: 'لم يبدأ',    color: null as null | string },
  { id: 'in_progress' as const, labelFr: 'En apprentissage',labelAr: 'قيد الحفظ',  color: null as null | string },
  { id: 'review'      as const, labelFr: 'En révision',     labelAr: 'مراجعة',     color: '#a78bdb' },
  { id: 'memorized'   as const, labelFr: 'Maîtrisé',        labelAr: 'تم الحفظ',   color: '#5fb088' },
];

export const KanbanSection = ({
  userData, setUserData, lang
}: { userData: UserData; setUserData: React.Dispatch<React.SetStateAction<UserData>>; lang: string }) => {
  const t = useT();
  const fr = lang === 'fr';

  const COLUMN_CONFIG = COLUMN_CONFIG_BASE.map(col => ({
    ...col,
    color: col.color ?? (col.id === 'not_started' ? t.inkMute : t.accent),
  }));

  const updateStatus = (id: number, status: Surah['status']) => {
    setUserData((prev: UserData) => ({
      ...prev,
      surahs: prev.surahs.map((s: Surah) => s.id === id ? { ...s, status } : s)
    }));
  };

  const advanceStatus = (surah: Surah) => {
    const order: Surah['status'][] = ['not_started', 'in_progress', 'review', 'memorized'];
    const idx = order.indexOf(surah.status);
    const next = order[(idx + 1) % order.length];
    updateStatus(surah.id, next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20, paddingBottom: 16 }}>
      <div>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, color: t.ink }}>
          {fr ? 'Tableau de Suivi' : 'جدول المتابعة'}
        </div>
        <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 4 }}>
          Kanban · {fr ? 'Cliquez pour avancer une étape' : 'انقر للتقدم خطوة'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', flex: 1, paddingBottom: 8 }}>
        {COLUMN_CONFIG.map(col => {
          const surahs = userData.surahs.filter(s => s.status === col.id);
          return (
            <div key={col.id} style={{
              flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10,
              borderRadius: 14, padding: 14,
              background: `${col.color}10`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: `1px solid ${col.color}30` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: col.color }}/>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.ink }}>
                    {fr ? col.labelFr : col.labelAr}
                  </span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: `${col.color}22`, color: col.color }}>
                  {surahs.length}
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '55vh', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {surahs.map((surah: Surah) => (
                  <div key={surah.id} onClick={() => advanceStatus(surah)}
                    style={{
                      background: t.card, border: `1px solid ${t.line}`, borderRadius: 10,
                      padding: '12px 14px', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    }}>
                    <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, borderRadius: '0 2px 2px 0', background: col.color, opacity: 0.7 }}/>
                    <div style={{ paddingLeft: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: `${col.color}18`, color: col.color }}>
                          #{surah.id}
                        </span>
                        <div style={{ display: 'flex', gap: 1 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: 7, color: s <= surah.difficulty ? t.accent : `${t.inkMute}40` }}>★</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.ink }}>{surah.name}</div>
                      <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 14, color: t.accentBright, marginTop: 2 }}>{surah.arabicName}</div>
                    </div>
                  </div>
                ))}

                {surahs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 0', opacity: 0.4 }}>
                    <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                      {fr ? 'Vide' : 'فارغ'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
