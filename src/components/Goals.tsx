import React, { useState } from 'react';
import { UserData, Goal } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';

interface GoalsSectionProps {
  userData: UserData;
  setUserData: (updater: (prev: UserData) => UserData) => void;
  lang: 'fr' | 'ar';
}

export const GoalsSection = ({ userData, setUserData, lang }: GoalsSectionProps) => {
  const t = useT();
  const [newGoal, setNewGoal] = useState('');
  const fr = lang === 'fr';

  const addGoal = () => {
    const text = newGoal.trim();
    if (!text) return;
    const goal: Goal = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      text,
      completed: false,
      month: new Date().getMonth(),
    };
    setUserData(prev => ({ ...prev, goals: [goal, ...prev.goals] }));
    setNewGoal('');
  };

  const toggleGoal = (id: string) => {
    setUserData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    }));
  };

  const deleteGoal = (id: string) => {
    setUserData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  };

  const completedCount = userData.goals.filter(g => g.completed).length;
  const totalCount = userData.goals.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const pending = userData.goals.filter(g => !g.completed);
  const completed = userData.goals.filter(g => g.completed);

  const card = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 14 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, color: t.ink }}>
            {fr ? 'Objectifs' : 'الأهداف'}
          </div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 4 }}>
            {fr ? 'Intentions & réussites' : 'النوايا والإنجازات'}
          </div>
        </div>

        {totalCount > 0 && (
          <div style={{ ...card, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: t.accent, lineHeight: 1 }}>{completedCount}</div>
            <div>
              <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                / {totalCount} {fr ? 'complétés' : 'مكتمل'}
              </div>
              <div style={{ marginTop: 6, height: 3, width: 80, borderRadius: 2, background: t.cardElev, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: t.accent, borderRadius: 2 }}/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add goal */}
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={newGoal}
          onChange={e => setNewGoal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addGoal()}
          placeholder={fr ? 'Ajouter un objectif ou une intention…' : 'أضف هدفاً أو نية…'}
          style={{ flex: 1, padding: '11px 14px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 8, color: t.ink, fontSize: 13, outline: 'none' }}
        />
        <button onClick={addGoal} disabled={!newGoal.trim()}
          style={{
            padding: '11px 18px', borderRadius: 8, background: newGoal.trim() ? t.accent : t.cardElev,
            color: newGoal.trim() ? '#1a0f00' : t.inkMute, cursor: newGoal.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, flexShrink: 0,
          }}>
          <Icon d={Icons.plus} size={14} color={newGoal.trim() ? '#1a0f00' : t.inkMute}/>
          <span>{fr ? 'Ajouter' : 'إضافة'}</span>
        </button>
      </div>

      {/* Pending goals */}
      {pending.length > 0 && (
        <div>
          <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
            {fr ? 'En cours' : 'قيد التنفيذ'} ({pending.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {pending.map(goal => (
              <div key={goal.id} onClick={() => toggleGoal(goal.id)}
                style={{
                  ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', borderLeft: `3px solid ${t.accent}`,
                }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${t.inkMute}`, flexShrink: 0 }}/>
                <span style={{ flex: 1, fontSize: 13, color: t.ink, lineHeight: 1.4 }}>{goal.text}</span>
                <button onClick={e => { e.stopPropagation(); deleteGoal(goal.id); }}
                  style={{ padding: 6, borderRadius: 6, background: 'transparent', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon d={Icons.trash} size={13} color="rgba(239,68,68,0.5)"/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed goals */}
      {completed.length > 0 && (
        <div>
          <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            {fr ? 'Complétés' : 'مكتملة'} ({completed.length})
            <Icon d={Icons.badge} size={11} color={t.accentBright}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {completed.map(goal => (
              <div key={goal.id} onClick={() => toggleGoal(goal.id)}
                style={{
                  ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', opacity: 0.65,
                }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: t.accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon d={Icons.check} size={10} color="#1a0f00"/>
                </div>
                <span style={{ flex: 1, fontSize: 13, color: t.inkMute, textDecoration: 'line-through', lineHeight: 1.4 }}>{goal.text}</span>
                <button onClick={e => { e.stopPropagation(); deleteGoal(goal.id); }}
                  style={{ padding: 6, borderRadius: 6, background: 'transparent', color: 'rgba(239,68,68,0.4)', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon d={Icons.trash} size={13} color="rgba(239,68,68,0.4)"/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Celebration */}
      {completedCount > 0 && completedCount === totalCount && totalCount > 0 && (
        <div style={{ ...card, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, background: `${t.accentSoft}20` }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon d={Icons.sparkle} size={18} color="#1a0f00"/>
          </div>
          <div>
            <div style={{ fontSize: 14, color: t.ink, fontWeight: 600 }}>
              {fr ? 'Tous les objectifs accomplis !' : 'كل الأهداف مكتملة!'}
            </div>
            <div style={{ fontSize: 12, color: t.inkDim, marginTop: 3 }}>
              {fr ? 'Continuez pour débloquer des badges.' : 'استمر لفتح المزيد من الشارات.'}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalCount === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Icon d={Icons.target} size={48} color={t.inkMute}/>
          <div style={{ fontSize: 14, color: t.inkMute, marginTop: 12 }}>
            {fr ? "Aucun objectif pour l'instant." : 'لا توجد أهداف بعد.'}
          </div>
          <div style={{ fontSize: 12, color: t.inkMute, opacity: 0.6, marginTop: 4 }}>
            {fr ? 'Commencez par en créer un ci-dessus !' : 'ابدأ بإنشاء هدف أعلاه!'}
          </div>
        </div>
      )}
    </div>
  );
};
