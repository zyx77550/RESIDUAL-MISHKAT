import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Activity, BookOpen, Target, Database, Wifi, WifiOff,
  TrendingUp, Shield, Clock, FileText, Layers, RefreshCw, User,
} from 'lucide-react';
import { UserData } from '../types';
import { fetchAdminStats, fetchAllUsers, AdminStats, UserRow } from '../lib/supabase';

interface AdminProps {
  userData: UserData;
  lang: string;
}

// ── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ pct, label, value, color }: { pct: number; label: string; value: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
          <motion.circle
            cx="48" cy="48" r={r} fill="none"
            stroke={color} strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${circ}`}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ transformOrigin: '48px 48px', transform: 'rotate(-90deg)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black leading-none" style={{ color }}>{value}</span>
          <span className="text-[9px] font-bold opacity-60 leading-none mt-0.5" style={{ color: 'var(--brand-text-muted)' }}>
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider text-center" style={{ color: 'var(--brand-text-muted)' }}>
        {label}
      </span>
    </div>
  );
}

// ── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ bars }: { bars: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  const h = 80;
  return (
    <div className="flex items-end gap-3 h-28 w-full justify-around pt-2">
      {bars.map((b, i) => {
        const barH = Math.max((b.value / max) * h, 4);
        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-[10px] font-black" style={{ color: b.color }}>{b.value}</span>
            <div className="w-full relative rounded-t-lg overflow-hidden" style={{ height: h }}>
              <div className="absolute inset-x-0 bottom-0 rounded-t-lg"
                style={{ background: 'rgba(255,255,255,0.04)', height: h }} />
              <motion.div
                className="absolute inset-x-0 bottom-0 rounded-t-lg"
                style={{ background: b.color, opacity: 0.85 }}
                initial={{ height: 0 }}
                animate={{ height: barH }}
                transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[8px] font-bold text-center leading-tight" style={{ color: 'var(--brand-text-muted)', opacity: 0.7 }}>
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Mini Progress Bar ────────────────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export const AdminSection = ({ userData, lang }: AdminProps) => {
  const [cloudStats, setCloudStats] = useState<AdminStats | null>(null);
  const [users, setUsers]           = useState<UserRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const localStats = {
    diftarPages:  userData.diftarPages.length,
    totalStrokes: userData.diftarPages.reduce((acc, p) => acc + p.strokes.length, 0),
    surahs:       userData.surahs?.filter(s => s.status !== 'not_started').length ?? 0,
    goals:        userData.goals?.length ?? 0,
    badges:       userData.badges?.filter(b => b.unlocked).length ?? 0,
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

  const fr = lang === 'fr';
  const connected = cloudStats !== null && !statsError;

  const activePct  = cloudStats && cloudStats.totalUsers > 0 ? (cloudStats.activeToday / cloudStats.totalUsers) * 100 : 0;
  const newPct     = cloudStats && cloudStats.totalUsers > 0 ? (cloudStats.newThisWeek / cloudStats.totalUsers) * 100 : 0;

  const localMax = Math.max(
    localStats.diftarPages, localStats.totalStrokes / 10,
    localStats.surahs, localStats.goals, localStats.badges, localStats.loginStreak, 1
  );

  return (
    <div className="space-y-7 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-4xl sm:text-5xl font-serif italic leading-tight" style={{ color: 'var(--brand-primary)' }}>
            {fr ? 'Administration' : 'الإدارة'}
          </h2>
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold mt-1.5" style={{ color: 'var(--brand-secondary)', opacity: 0.65 }}>
            {fr ? 'Tableau de bord admin' : 'لوحة تحكم المشرف'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={loadStats} disabled={loadingStats}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm border transition-all"
          style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', color: 'var(--brand-primary)', background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}
        >
          <motion.div animate={{ rotate: loadingStats ? 360 : 0 }} transition={{ duration: 0.8, ease: 'linear', repeat: loadingStats ? Infinity : 0 }}>
            <RefreshCw size={14} />
          </motion.div>
          {fr ? 'Actualiser' : 'تحديث'}
        </motion.button>
      </div>

      {/* ── Supabase status ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: connected ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)' }}>
          {connected ? <Wifi size={20} style={{ color: '#22c55e' }} /> : <WifiOff size={20} style={{ color: '#ef4444' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--brand-primary)' }}>
            Supabase — {connected ? (fr ? 'Connecté' : 'متصل') : (fr ? 'Non connecté' : 'غير متصل')}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--brand-text-muted)', opacity: 0.7 }}>
            {statsError || (connected
              ? (fr ? 'Données en temps réel disponibles' : 'البيانات الفورية متاحة')
              : (fr ? 'Chargement…' : 'جاري التحميل…'))}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0"
          style={{ background: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)', color: connected ? '#22c55e' : '#ef4444' }}>
          {connected ? 'LIVE' : loadingStats ? '…' : 'ERR'}
        </div>
      </motion.div>

      {/* ── Cloud stats tiles ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Database size={13} style={{ color: 'var(--brand-secondary)', opacity: 0.7 }} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {fr ? 'Statistiques cloud' : 'إحصائيات السحابة'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users,      label: fr ? 'Utilisateurs'  : 'المستخدمون',      value: cloudStats?.totalUsers       ?? 0, sub: fr ? 'total inscrits'  : 'إجمالي المسجلين',   color: 'var(--brand-primary)'   },
            { icon: Activity,   label: fr ? 'Actifs auj.'   : 'نشطون اليوم',     value: cloudStats?.activeToday      ?? 0, sub: fr ? 'dernières 24 h'  : 'آخر 24 ساعة',        color: '#22c55e'                 },
            { icon: TrendingUp, label: fr ? 'Nouveaux/sem.' : 'جدد هذا الأسبوع', value: cloudStats?.newThisWeek      ?? 0, sub: fr ? 'inscriptions'    : 'تسجيلات جديدة',      color: 'var(--brand-secondary)' },
            { icon: FileText,   label: fr ? 'Pages Diftar'  : 'صفحات الدفتر',    value: cloudStats?.totalDiftarPages ?? 0, sub: fr ? 'toutes pages'    : 'مجموع الصفحات',     color: '#8b5cf6'                 },
          ].map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}>
                  <stat.icon size={15} style={{ color: stat.color }} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)', color: 'var(--brand-text-muted)' }}>
                  {fr ? 'cloud' : 'سحابة'}
                </span>
              </div>
              <p className="text-2xl font-black" style={{ color: stat.color }}>
                {cloudStats ? stat.value : '—'}
              </p>
              <div>
                <p className="text-[11px] font-bold" style={{ color: 'var(--brand-primary)' }}>{stat.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Charts row: Bar + Donuts ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {fr ? 'Vue d\'ensemble' : 'نظرة عامة'}
          </p>
          <BarChart bars={[
            { label: fr ? 'Total'    : 'الكل',     value: cloudStats?.totalUsers       ?? 0, color: 'var(--brand-primary)'   },
            { label: fr ? 'Actifs'   : 'نشطون',    value: cloudStats?.activeToday      ?? 0, color: '#22c55e'                 },
            { label: fr ? 'Nouveaux' : 'جدد',      value: cloudStats?.newThisWeek      ?? 0, color: 'var(--brand-secondary)' },
            { label: fr ? 'Diftar'   : 'الدفتر',   value: cloudStats?.totalDiftarPages ?? 0, color: '#8b5cf6'                 },
          ]} />
        </motion.div>

        {/* Donut charts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {fr ? 'Taux d\'activité' : 'معدلات النشاط'}
          </p>
          <div className="flex justify-around items-center h-28 mt-2">
            <DonutChart
              pct={activePct}
              label={fr ? 'Actifs auj.' : 'نشطون اليوم'}
              value={cloudStats?.activeToday ?? 0}
              color="#22c55e"
            />
            <div className="w-px h-16 opacity-10" style={{ background: 'var(--brand-primary)' }} />
            <DonutChart
              pct={newPct}
              label={fr ? 'Nouveaux/sem.' : 'جدد الأسبوع'}
              value={cloudStats?.newThisWeek ?? 0}
              color="var(--brand-secondary)"
            />
          </div>
        </motion.div>
      </div>

      {/* ── Users table ── */}
      {users.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card overflow-hidden">
          <div className="flex items-center gap-2 p-5 pb-3">
            <Users size={13} style={{ color: 'var(--brand-secondary)', opacity: 0.7 }} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
              {fr ? `Utilisateurs (${users.length})` : `المستخدمون (${users.length})`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {[
                    fr ? 'Email'        : 'البريد',
                    fr ? 'Inscription'  : 'التسجيل',
                    fr ? 'Vu'           : 'آخر ظهور',
                    fr ? 'Diftar'       : 'الدفتر',
                  ].map((h, i) => (
                    <th key={i} className="text-left px-5 py-2.5 font-black text-[9px] uppercase tracking-wider"
                      style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 12).map((u, i) => (
                  <motion.tr key={u.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.04 }}
                    className="border-b transition-colors"
                    style={{ borderColor: 'var(--border-subtle)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--brand-primary) 4%, transparent)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)' }}>
                          <User size={11} style={{ color: 'var(--brand-primary)' }} />
                        </div>
                        <span className="font-medium truncate max-w-[140px]" style={{ color: 'var(--brand-text-main)' }}>
                          {u.email || u.username || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--brand-text-muted)' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString(fr ? 'fr-FR' : 'ar-SA', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--brand-text-muted)' }}>
                      {u.last_seen ? new Date(u.last_seen).toLocaleDateString(fr ? 'fr-FR' : 'ar-SA', { day: '2-digit', month: 'short' }) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm" style={{ color: u.diftarPages > 0 ? '#8b5cf6' : 'var(--brand-text-muted)', opacity: u.diftarPages > 0 ? 1 : 0.4 }}>
                          {u.diftarPages}
                        </span>
                        {u.diftarPages > 0 && (
                          <div className="w-12">
                            <MiniBar value={u.diftarPages} max={Math.max(...users.map(x => x.diftarPages), 1)} color="#8b5cf6" />
                          </div>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {users.length > 12 && (
              <p className="text-center text-[10px] py-3 font-bold" style={{ color: 'var(--brand-text-muted)', opacity: 0.5 }}>
                {fr ? `+ ${users.length - 12} autres utilisateurs` : `+ ${users.length - 12} مستخدمين آخرين`}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Local stats ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers size={13} style={{ color: 'var(--brand-secondary)', opacity: 0.7 }} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {fr ? 'Données locales — cet appareil' : 'بيانات محلية — هذا الجهاز'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: FileText,   label: fr ? 'Pages Diftar'    : 'صفحات الدفتر', value: localStats.diftarPages,  color: '#8b5cf6'                 },
            { icon: Activity,   label: fr ? 'Traits dessinés' : 'خطوط مرسومة',  value: localStats.totalStrokes, color: 'var(--brand-secondary)' },
            { icon: BookOpen,   label: fr ? 'Sourates suivies': 'سور متابعة',    value: localStats.surahs,       color: 'var(--brand-primary)'   },
            { icon: Target,     label: fr ? 'Objectifs'       : 'الأهداف',       value: localStats.goals,        color: '#22c55e'                 },
            { icon: Shield,     label: fr ? 'Badges débloqués': 'شارات مفتوحة', value: localStats.badges,       color: 'var(--brand-secondary)' },
            { icon: TrendingUp, label: fr ? 'Jours de suite'  : 'أيام متتالية', value: localStats.loginStreak,  color: 'var(--brand-primary)'   },
          ].map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              className="glass-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${stat.color} 12%, transparent)` }}>
                  <stat.icon size={15} style={{ color: stat.color }} />
                </div>
                <span className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--brand-primary)' }}>{stat.label}</p>
                <MiniBar value={stat.value} max={localMax} color={stat.color} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Migration note ── */}
      <div className="p-4 rounded-2xl border flex items-start gap-3"
        style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', background: 'color-mix(in srgb, var(--brand-primary) 3%, transparent)' }}>
        <Shield size={15} style={{ color: 'var(--brand-primary)', opacity: 0.6, flexShrink: 0, marginTop: 2 }} />
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
          {fr
            ? 'Migration sans perte : au 1er login Supabase, les données localforage de l\'utilisateur sont automatiquement copiées vers sa table user_data.'
            : 'ترحيل آمن: عند أول تسجيل دخول Supabase، تُنسخ بيانات localforage تلقائياً إلى جدول user_data. لا فقدان للبيانات.'}
        </p>
      </div>

    </div>
  );
};
