import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons } from './ui';
import { fetchAdminStats, fetchAllUsers, AdminStats, UserRow } from '../lib/supabase';

interface AdminProps {
  userData: UserData;
  lang: string;
}

function DonutChart({ pct, label, value, color, inkMute }: { pct: number; label: string; value: number; color: string; inkMute: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 96, height: 96 }}>
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9"/>
          <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="9"
            strokeLinecap="round" strokeDasharray={`${circ}`}
            strokeDashoffset={circ - dash}
            style={{ transformOrigin: '48px 48px', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 1.2s ease' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{value}</span>
          <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.6, color: inkMute, marginTop: 2 }}>{pct.toFixed(0)}%</span>
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center', color: inkMute }}>
        {label}
      </span>
    </div>
  );
}

function BarChart({ bars, inkMute }: { bars: { label: string; value: number; color: string }[]; inkMute: string }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  const h = 80;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 112, width: '100%', justifyContent: 'space-around', paddingTop: 8 }}>
      {bars.map((b, i) => {
        const barH = Math.max((b.value / max) * h, 4);
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: b.color }}>{b.value}</span>
            <div style={{ width: '100%', height: h, position: 'relative', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.04)' }}/>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: b.color, opacity: 0.85, height: barH, borderRadius: '4px 4px 0 0', transition: 'height 0.9s ease' }}/>
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, textAlign: 'center', lineHeight: 1.3, color: inkMute, opacity: 0.7 }}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MiniBar({ value, max, color, cardElev }: { value: number; max: number; color: string; cardElev: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', background: cardElev }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.8s ease' }}/>
    </div>
  );
}

export const AdminSection = ({ userData, lang }: AdminProps) => {
  const t = useT();
  const [cloudStats, setCloudStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const fr = lang === 'fr';

  const localStats = {
    diftarPages:  userData.diftarPages.length,
    totalStrokes: userData.diftarPages.reduce((acc, p) => acc + p.strokes.length, 0),
    surahs:       userData.surahs?.filter(s => s.status !== 'not_started').length ?? 0,
    goals:        userData.goals?.length ?? 0,
    badges:       userData.badges?.filter(b => b.unlockedAt).length ?? 0,
    loginStreak:  userData.loginStreak ?? 1,
  };

  const loadStats = async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const [stats, userList] = await Promise.all([fetchAdminStats(), fetchAllUsers()]);
      setCloudStats(stats);
      setUsers(userList);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const connected = cloudStats !== null && !statsError;
  const activePct = cloudStats && cloudStats.totalUsers > 0 ? (cloudStats.activeToday / cloudStats.totalUsers) * 100 : 0;
  const newPct    = cloudStats && cloudStats.totalUsers > 0 ? (cloudStats.newThisWeek / cloudStats.totalUsers) * 100 : 0;
  const localMax  = Math.max(localStats.diftarPages, localStats.totalStrokes / 10, localStats.surahs, localStats.goals, localStats.badges, localStats.loginStreak, 1);

  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, padding: '18px 20px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontStyle: 'italic', fontSize: 32, color: t.ink }}>
            {fr ? 'Administration' : 'الإدارة'}
          </div>
          <div style={{ fontSize: 10, color: t.accentBright, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 4 }}>
            {fr ? 'Tableau de bord admin' : 'لوحة تحكم المشرف'}
          </div>
        </div>
        <button onClick={loadStats} disabled={loadingStats}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, background: t.card, border: `1px solid ${t.line}`, color: t.ink, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          <span style={{ display: 'inline-block', animation: loadingStats ? 'spin 0.8s linear infinite' : 'none' }}>↺</span>
          {fr ? 'Actualiser' : 'تحديث'}
        </button>
      </div>

      {/* Supabase status */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: connected ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', fontSize: 18 }}>
          {connected ? '🟢' : '🔴'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>
            Supabase — {connected ? (fr ? 'Connecté' : 'متصل') : (fr ? 'Non connecté' : 'غير متصل')}
          </div>
          <div style={{ fontSize: 11, color: t.inkMute, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {statsError || (connected
              ? (fr ? 'Données en temps réel disponibles' : 'البيانات الفورية متاحة')
              : (fr ? 'Chargement…' : 'جاري التحميل…'))}
          </div>
        </div>
        <div style={{ padding: '3px 10px', borderRadius: 20, fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', background: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)', color: connected ? '#22c55e' : '#ef4444', flexShrink: 0 }}>
          {connected ? 'LIVE' : loadingStats ? '…' : 'ERR'}
        </div>
      </div>

      {/* Cloud stats tiles */}
      <div>
        <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>
          {fr ? 'Statistiques cloud' : 'إحصائيات السحابة'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: fr ? 'Utilisateurs' : 'المستخدمون',      value: cloudStats?.totalUsers ?? 0,       sub: fr ? 'total inscrits' : 'إجمالي', color: t.accent },
            { label: fr ? 'Actifs auj.'  : 'نشطون اليوم',     value: cloudStats?.activeToday ?? 0,      sub: fr ? 'dernières 24h' : 'آخر 24 ساعة', color: '#22c55e' },
            { label: fr ? 'Nouveaux/sem.': 'جدد هذا الأسبوع', value: cloudStats?.newThisWeek ?? 0,      sub: fr ? 'inscriptions' : 'تسجيلات', color: t.accentBright },
            { label: fr ? 'Pages Diftar' : 'صفحات الدفتر',    value: cloudStats?.totalDiftarPages ?? 0, sub: fr ? 'toutes pages' : 'مجموع', color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} style={card}>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: s.color, lineHeight: 1 }}>{cloudStats ? s.value : '—'}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.ink, marginTop: 6 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: t.inkMute, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        <div style={card}>
          <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
            {fr ? "Vue d'ensemble" : 'نظرة عامة'}
          </div>
          <BarChart inkMute={t.inkMute} bars={[
            { label: fr ? 'Total'    : 'الكل',   value: cloudStats?.totalUsers ?? 0,       color: t.accent },
            { label: fr ? 'Actifs'   : 'نشطون',  value: cloudStats?.activeToday ?? 0,      color: '#22c55e' },
            { label: fr ? 'Nouveaux' : 'جدد',    value: cloudStats?.newThisWeek ?? 0,      color: t.accentBright },
            { label: fr ? 'Diftar'   : 'الدفتر', value: cloudStats?.totalDiftarPages ?? 0, color: '#8b5cf6' },
          ]}/>
        </div>
        <div style={card}>
          <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14 }}>
            {fr ? "Taux d'activité" : 'معدلات النشاط'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 112, marginTop: 8 }}>
            <DonutChart pct={activePct} label={fr ? 'Actifs auj.' : 'نشطون اليوم'} value={cloudStats?.activeToday ?? 0} color="#22c55e" inkMute={t.inkMute}/>
            <div style={{ width: 1, height: 64, background: t.line }}/>
            <DonutChart pct={newPct} label={fr ? 'Nouveaux/sem.' : 'جدد الأسبوع'} value={cloudStats?.newThisWeek ?? 0} color={t.accentBright} inkMute={t.inkMute}/>
          </div>
        </div>
      </div>

      {/* Users table */}
      {users.length > 0 && (
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px 10px', fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            {fr ? `Utilisateurs (${users.length})` : `المستخدمون (${users.length})`}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.line}` }}>
                  {[fr?'Email':'البريد', fr?'Inscription':'التسجيل', fr?'Vu':'آخر ظهور', fr?'Diftar':'الدفتر'].map((h,i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.inkMute }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 12).map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${t.line}` }}>
                    <td style={{ padding: '10px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: t.cardElev, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon d={Icons.user} size={11} color={t.ink}/>
                        </div>
                        <span style={{ color: t.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                          {u.email || u.username || '—'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 20px', color: t.inkMute }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString(fr ? 'fr-FR' : 'ar-SA', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '10px 20px', color: t.inkMute }}>
                      {u.last_seen ? new Date(u.last_seen).toLocaleDateString(fr ? 'fr-FR' : 'ar-SA', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '10px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 900, fontSize: 14, color: u.diftarPages > 0 ? '#8b5cf6' : t.inkMute, opacity: u.diftarPages > 0 ? 1 : 0.4 }}>{u.diftarPages}</span>
                        {u.diftarPages > 0 && (
                          <div style={{ width: 48 }}>
                            <MiniBar value={u.diftarPages} max={Math.max(...users.map(x => x.diftarPages), 1)} color="#8b5cf6" cardElev={t.cardElev}/>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length > 12 && (
              <div style={{ textAlign: 'center', fontSize: 10, padding: '10px 0', color: t.inkMute, opacity: 0.5, fontWeight: 700 }}>
                {fr ? `+ ${users.length - 12} autres utilisateurs` : `+ ${users.length - 12} مستخدمين آخرين`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Local stats */}
      <div>
        <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>
          {fr ? 'Données locales — cet appareil' : 'بيانات محلية — هذا الجهاز'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: fr ? 'Pages Diftar'     : 'صفحات الدفتر', value: localStats.diftarPages,  color: '#8b5cf6' },
            { label: fr ? 'Traits dessinés'  : 'خطوط مرسومة',  value: localStats.totalStrokes, color: t.accentBright },
            { label: fr ? 'Sourates suivies' : 'سور متابعة',    value: localStats.surahs,       color: t.accent },
            { label: fr ? 'Objectifs'        : 'الأهداف',       value: localStats.goals,        color: '#22c55e' },
            { label: fr ? 'Badges débloqués' : 'شارات مفتوحة', value: localStats.badges,       color: t.accentBright },
            { label: fr ? 'Jours de suite'   : 'أيام متتالية', value: localStats.loginStreak,  color: t.accent },
          ].map((s, i) => (
            <div key={i} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.ink }}>{s.label}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
              <MiniBar value={s.value} max={localMax} color={s.color} cardElev={t.cardElev}/>
            </div>
          ))}
        </div>
      </div>

      {/* Migration note */}
      <div style={{ padding: '14px 18px', borderRadius: 12, border: `1px solid ${t.line}`, background: `${t.accentSoft}10`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Icon d={Icons.shield} size={14} color={t.inkMute} style={{ marginTop: 2, flexShrink: 0 } as React.CSSProperties}/>
        <div style={{ fontSize: 11, color: t.inkDim, lineHeight: 1.6 }}>
          {fr
            ? "Migration sans perte : au 1er login Supabase, les données localforage de l'utilisateur sont automatiquement copiées vers sa table user_data."
            : 'ترحيل آمن: عند أول تسجيل دخول Supabase، تُنسخ بيانات localforage تلقائياً إلى جدول user_data. لا فقدان للبيانات.'}
        </div>
      </div>
    </div>
  );
};
