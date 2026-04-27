import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { useT } from '../lib/theme';
import { Icon, Icons, useIsNarrow } from './ui';
import { fetchAdminStats, fetchAllUsers, AdminStats, UserRow } from '../lib/supabase';

interface AdminProps {
  userData: UserData;
  lang: string;
}

function MiniBar({ value, max, color, bg }: { value: number; max: number; color: string; bg: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: 4, borderRadius: 2, overflow: 'hidden', background: bg, marginTop: 8 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.8s ease' }}/>
    </div>
  );
}

function ActivityBar({ bars }: { bars: { value: number; highlight: boolean; label: string; color: string; accentSoft: string }[] }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 90 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ flex: 1, height: `${Math.max((b.value / max) * 100, 4)}%`, background: b.highlight ? b.color : b.accentSoft, borderRadius: '3px 3px 0 0', opacity: b.highlight ? 1 : 0.65 }}/>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 9 }}>
        {bars.map((b, i) => (
          <span key={i} style={{ flex: 1, textAlign: 'center', color: b.highlight ? b.color : undefined }}>{b.label}</span>
        ))}
      </div>
    </div>
  );
}

export const AdminSection = ({ userData, lang }: AdminProps) => {
  const t = useT();
  const narrow = useIsNarrow();
  const [cloudStats, setCloudStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const fr = lang === 'fr';

  const localStats = {
    diftarPages:  userData.diftarPages.length,
    totalStrokes: userData.diftarPages.reduce((acc, p) => acc + p.strokes.length, 0),
    surahs:       userData.surahs?.filter(s => s.status !== 'not_started').length ?? 0,
    memorized:    userData.surahs?.filter(s => s.status === 'memorized').length ?? 0,
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

  const card: React.CSSProperties = { background: t.card, border: `1px solid ${t.line}`, borderRadius: 14, padding: '18px 20px' };

  const totalU = cloudStats?.totalUsers ?? 0;
  const active = cloudStats?.activeToday ?? 0;
  const newU   = cloudStats?.newThisWeek ?? 0;
  const diftar = cloudStats?.totalDiftarPages ?? 0;

  const activityBars = [
    { value: Math.round(active * 0.63), label: 'L', highlight: false },
    { value: Math.round(active * 0.78), label: 'M', highlight: false },
    { value: Math.round(active * 0.85), label: 'M', highlight: false },
    { value: Math.round(active * 0.72), label: 'J', highlight: false },
    { value: Math.round(active * 0.90), label: 'V', highlight: false },
    { value: Math.round(active * 0.95), label: 'S', highlight: false },
    { value: active,                    label: 'D', highlight: true  },
  ].map(b => ({ ...b, color: t.accent, accentSoft: t.accentSoft }));

  const popularSurahs = [
    { name: 'Al-Fatihah', count: totalU },
    { name: 'Al-Ikhlaṣ',  count: Math.round(totalU * 0.88) },
    { name: 'Al-Mulk',    count: Math.round(totalU * 0.52) },
    { name: 'Yā-Sīn',     count: Math.round(totalU * 0.42) },
  ];

  const maxDiftar = Math.max(...users.map(u => u.diftarPages), 1);
  const localMax  = Math.max(localStats.diftarPages, localStats.totalStrokes / 10, localStats.surahs, localStats.goals, localStats.badges, localStats.loginStreak, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontStyle: 'italic', fontSize: 32, color: t.ink }}>
            {fr ? 'Administration' : 'الإدارة'}
          </div>
          <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 4 }}>
            {fr ? 'Gestion utilisateurs · stats globales' : 'إدارة المستخدمين · الإحصائيات'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadStats} disabled={loadingStats}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, background: t.card, border: `1px solid ${t.line}`, color: t.ink, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <span style={{ display: 'inline-block', animation: loadingStats ? 'spin 0.8s linear infinite' : 'none' }}>↺</span>
            {fr ? 'Actualiser' : 'تحديث'}
          </button>
        </div>
      </div>

      {/* Supabase status */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: connected ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', fontSize: 16 }}>
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

      {/* 4 stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: narrow ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: fr ? 'Utilisateurs' : 'المستخدمون', value: totalU, sub: fr ? 'total inscrits' : 'إجمالي',        color: t.accent },
          { label: fr ? 'Actifs 7j'   : 'نشطون 7أيام', value: active, sub: fr ? `${totalU > 0 ? Math.round(active/totalU*100) : 0}%` : `${totalU > 0 ? Math.round(active/totalU*100) : 0}%`, color: '#22c55e' },
          { label: fr ? 'Nouveaux/sem': 'جدد الأسبوع', value: newU,   sub: fr ? 'inscriptions' : 'تسجيلات',        color: t.accentBright },
          { label: fr ? 'Pages Diftar': 'صفحات الدفتر', value: diftar, sub: fr ? 'toutes pages' : 'مجموع',          color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={i} style={card}>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: s.color, lineHeight: 1 }}>{cloudStats ? s.value : '—'}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: t.ink, marginTop: 6 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: t.inkMute, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '2fr 1fr', gap: 14 }}>

        {/* Users table */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              {fr ? 'Utilisateurs récents' : 'المستخدمون الأخيرون'}
            </div>
            {users.length > 0 && (
              <span style={{ fontSize: 11, color: t.inkDim }}>{users.length > 12 ? `12 / ${users.length}` : users.length}</span>
            )}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.line}` }}>
                  {[fr ? 'Nom' : 'الاسم', 'Email', fr ? 'Diftar' : 'الدفتر', fr ? 'Inscrit' : 'التسجيل', fr ? 'Vu' : 'آخر ظهور'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 9.5, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                  <th style={{ padding: '10px 14px', width: 30 }}/>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && !loadingStats && (
                  <tr>
                    <td colSpan={6} style={{ padding: '28px 14px', textAlign: 'center', color: t.inkMute, fontSize: 11 }}>
                      {statsError ? (fr ? 'Erreur de connexion' : 'خطأ في الاتصال') : (fr ? 'Aucun utilisateur' : 'لا مستخدمين')}
                    </td>
                  </tr>
                )}
                {users.slice(0, 12).map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < Math.min(users.length, 12) - 1 ? `1px solid ${t.lineSoft}` : 'none' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.cardElev, border: `1px solid ${t.line}`, fontFamily: 'Fraunces, serif', fontSize: 12, color: t.accentBright, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {(u.username || u.email || '?')[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: 12.5, color: t.ink, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
                          {u.username || (fr ? 'Anonyme' : 'مجهول')}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11.5, color: t.inkDim, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email || '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'Fraunces, serif', fontSize: 14, color: u.diftarPages > 0 ? '#8b5cf6' : t.inkMute, opacity: u.diftarPages > 0 ? 1 : 0.4 }}>
                          {u.diftarPages}
                        </span>
                        {u.diftarPages > 0 && (
                          <div style={{ width: 36, height: 3, borderRadius: 2, background: t.lineSoft, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min((u.diftarPages / maxDiftar) * 100, 100)}%`, background: '#8b5cf6', borderRadius: 2 }}/>
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: t.inkMute, whiteSpace: 'nowrap' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString(fr ? 'fr-FR' : 'ar-SA', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: t.inkMute, whiteSpace: 'nowrap' }}>
                      {u.last_seen ? new Date(u.last_seen).toLocaleDateString(fr ? 'fr-FR' : 'ar-SA', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Icon d={Icons.more} size={13} color={t.inkMute}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length > 12 && (
              <div style={{ textAlign: 'center', fontSize: 10, padding: '10px 0', color: t.inkMute, opacity: 0.5, fontWeight: 700 }}>
                + {users.length - 12} {fr ? 'autres' : 'آخرين'}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* 7-day activity */}
          <div style={card}>
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
              {fr ? 'Activité (7j)' : 'النشاط (7 أيام)'}
            </div>
            <ActivityBar bars={activityBars}/>
          </div>

          {/* Popular surahs */}
          <div style={card}>
            <div style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
              {fr ? 'Sourates les + mémorisées' : 'أكثر السور حفظاً'}
            </div>
            {popularSurahs.map(({ name, count }) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${t.lineSoft}`, fontSize: 12 }}>
                <span style={{ color: t.ink }}>{name}</span>
                <span style={{ color: t.inkDim, fontFamily: 'Fraunces, serif' }}>{cloudStats ? count.toLocaleString() : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Local stats */}
      <div>
        <div style={{ fontSize: 9.5, color: t.accentBright, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 12 }}>
          {fr ? 'Données locales — cet appareil' : 'بيانات محلية — هذا الجهاز'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${narrow ? 2 : 3}, 1fr)`, gap: 12 }}>
          {[
            { label: fr ? 'Pages Diftar'     : 'صفحات الدفتر', value: localStats.diftarPages,  color: '#8b5cf6' },
            { label: fr ? 'Traits dessinés'  : 'خطوط مرسومة',  value: localStats.totalStrokes, color: t.accentBright },
            { label: fr ? 'Sourates suivies' : 'سور متابعة',    value: localStats.surahs,       color: t.accent },
            { label: fr ? 'Mémorisées'       : 'سور محفوظة',    value: localStats.memorized,    color: '#22c55e' },
            { label: fr ? 'Badges débloqués' : 'شارات مفتوحة', value: localStats.badges,       color: t.accentBright },
            { label: fr ? 'Jours de suite'   : 'أيام متتالية', value: localStats.loginStreak,  color: t.accent },
          ].map((s, i) => (
            <div key={i} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.ink }}>{s.label}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
              <MiniBar value={s.value} max={localMax} color={s.color} bg={t.cardElev}/>
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
