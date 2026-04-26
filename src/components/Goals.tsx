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

  const [showInput, setShowInput] = useState(false);
  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 12 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>
            {fr
              ? `${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} · ${totalCount} objectifs`
              : `${totalCount} هدف`}
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 32, margin: 0, color: t.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {fr ? 'Objectifs' : 'الأهداف'}
          </h1>
        </div>
        <button
          onClick={() => setShowInput(v => !v)}
          style={{ marginTop: 4, padding: '8px 16px', borderRadius: 8, background: t.accent, color: '#1a0f00', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none' }}>
          <Icon d={Icons.plus} size={13} color="#1a0f00"/>
          {fr ? 'Nouvel objectif' : 'هدف جديد'}
        </button>
      </div>

      {/* ── 3 stat tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: fr ? 'Complétés'        : 'مكتملة',    value: completedCount, sub: `/ ${totalCount} ${fr ? 'objectifs' : 'هدف'}` },
          { label: fr ? 'En cours'          : 'قيد التنفيذ', value: pending.length,  sub: fr ? 'à poursuivre' : 'للمتابعة' },
          { label: fr ? 'Taux de complétion': 'نسبة الإنجاز', value: `${progress}%`, sub: fr ? 'ce mois' : 'هذا الشهر' },
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

      {/* ── Inline add goal ── */}
      {showInput && (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            autoFocus
            value={newGoal}
            onChange={e => setNewGoal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { addGoal(); setShowInput(false); } if (e.key === 'Escape') setShowInput(false); }}
            placeholder={fr ? 'Écrire un objectif ou une intention…' : 'اكتب هدفاً أو نية…'}
            style={{ flex: 1, padding: '10px 14px', background: t.card, border: `1px solid ${t.accent}66`, borderRadius: 8, color: t.ink, fontSize: 13, outline: 'none' }}
          />
          <button onClick={() => { addGoal(); setShowInput(false); }} disabled={!newGoal.trim()}
            style={{ padding: '10px 16px', borderRadius: 8, background: newGoal.trim() ? t.accent : t.cardElev, color: newGoal.trim() ? '#1a0f00' : t.inkMute, fontWeight: 600, fontSize: 12, cursor: newGoal.trim() ? 'pointer' : 'default', border: 'none' }}>
            {fr ? 'Ajouter' : 'إضافة'}
          </button>
        </div>
      )}

      {/* ── Section label ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          {fr ? 'Liste des objectifs' : 'قائمة الأهداف'}
        </div>
        <button style={{ padding: '4px 12px', borderRadius: 7, background: t.card, border: `1px solid ${t.line}`, color: t.inkDim, fontSize: 11, cursor: 'pointer' }}>
          {fr ? 'Filtrer' : 'تصفية'}
        </button>
      </div>

      {/* ── Goals list (vertical) ── */}
      {totalCount === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Icon d={Icons.target} size={40} color={t.inkMute}/>
          <div style={{ fontSize: 13, color: t.inkMute, marginTop: 12 }}>
            {fr ? "Aucun objectif pour l'instant." : 'لا توجد أهداف بعد.'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...pending, ...completed].map(goal => (
            <div key={goal.id} style={{ ...card, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Square checkbox */}
                <button onClick={() => toggleGoal(goal.id)}
                  style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                    background: goal.completed ? t.accent : 'transparent',
                    border: `1.5px solid ${goal.completed ? t.accent : t.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {goal.completed && <Icon d={Icons.check} size={11} color="#1a0f00" stroke={2.4}/>}
                </button>

                {/* Text + progress */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, color: goal.completed ? t.inkDim : t.ink, fontWeight: 500, textDecoration: goal.completed ? 'line-through' : 'none' }}>
                    {goal.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <div style={{ flex: 1, height: 3, background: t.cardElev, borderRadius: 3 }}>
                      <div style={{ height: '100%', width: goal.completed ? '100%' : '0%', background: goal.completed ? t.accentSoft ?? t.accent : t.accent, borderRadius: 3, transition: 'width 0.3s' }}/>
                    </div>
                    <span style={{ fontSize: 10.5, color: t.inkMute, fontFamily: 'Fraunces, serif', minWidth: 32, textAlign: 'right' }}>
                      {goal.completed ? '100%' : '0%'}
                    </span>
                  </div>
                </div>

                {/* Delete */}
                <button onClick={() => deleteGoal(goal.id)}
                  style={{ padding: 6, borderRadius: 6, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: t.inkMute, border: 'none' }}>
                  <Icon d={Icons.more} size={14} color={t.inkMute}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Celebration */}
      {completedCount > 0 && completedCount === totalCount && totalCount > 0 && (
        <div style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, background: `${t.accent}0a` }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon d={Icons.sparkle} size={16} color="#1a0f00"/>
          </div>
          <div>
            <div style={{ fontSize: 13, color: t.ink, fontWeight: 600 }}>
              {fr ? 'Tous les objectifs accomplis !' : 'كل الأهداف مكتملة!'}
            </div>
            <div style={{ fontSize: 11, color: t.inkDim, marginTop: 2 }}>
              {fr ? 'Continuez pour débloquer des badges.' : 'استمر لفتح المزيد من الشارات.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
