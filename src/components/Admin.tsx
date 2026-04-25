import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Activity, BookOpen, Target, Database, Wifi, WifiOff,
  TrendingUp, Shield, Clock, FileText, Layers, RefreshCw,
} from 'lucide-react';
import { UserData } from '../types';

interface AdminProps {
  userData: UserData;
  lang: string;
}

// ─── Types pour les futures données Supabase ────────────────────────────────
interface SupabaseStats {
  totalUsers: number;
  activeToday: number;
  newThisWeek: number;
  totalSessions: number;
}

// Placeholder — sera remplacé par un appel Supabase
const SUPABASE_CONNECTED = false;
const MOCK_STATS: SupabaseStats = {
  totalUsers: 0,
  activeToday: 0,
  newThisWeek: 0,
  totalSessions: 0,
};

export const AdminSection = ({ userData, lang }: AdminProps) => {
  const [refreshing, setRefreshing] = useState(false);

  // Stats locales (disponibles dès maintenant)
  const localStats = {
    diftarPages:  userData.diftarPages.length,
    totalStrokes: userData.diftarPages.reduce((acc, p) => acc + p.strokes.length, 0),
    surahs:       userData.surahs?.filter(s => s.status !== 'not_started').length ?? 0,
    goals:        userData.goals?.length ?? 0,
    badges:       userData.badges?.filter(b => b.unlocked).length ?? 0,
    loginStreak:  userData.loginStreak ?? 1,
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const fr = lang === 'fr';

  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
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
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm border transition-all"
          style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', color: 'var(--brand-primary)', background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}
        >
          <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8, ease: 'linear' }}>
            <RefreshCw size={14} />
          </motion.div>
          {fr ? 'Actualiser' : 'تحديث'}
        </motion.button>
      </div>

      {/* Statut Supabase */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: SUPABASE_CONNECTED ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)' }}>
          {SUPABASE_CONNECTED
            ? <Wifi size={20} style={{ color: '#22c55e' }} />
            : <WifiOff size={20} style={{ color: '#ef4444' }} />}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: 'var(--brand-primary)' }}>
            Supabase — {SUPABASE_CONNECTED ? (fr ? 'Connecté' : 'متصل') : (fr ? 'Non connecté' : 'غير متصل')}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--brand-text-muted)', opacity: 0.7 }}>
            {SUPABASE_CONNECTED
              ? (fr ? 'Données en temps réel disponibles' : 'البيانات الفورية متاحة')
              : (fr ? 'Configurer VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY pour activer' : 'أضف متغيرات Supabase للتفعيل')}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
          style={{
            background: SUPABASE_CONNECTED ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
            color: SUPABASE_CONNECTED ? '#22c55e' : '#ef4444',
          }}>
          {SUPABASE_CONNECTED ? 'LIVE' : 'OFFLINE'}
        </div>
      </motion.div>

      {/* Stats Supabase (cloud) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database size={14} style={{ color: 'var(--brand-secondary)', opacity: 0.7 }} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {fr ? 'Données cloud — Supabase' : 'بيانات السحابة'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users,     label: fr ? 'Utilisateurs'    : 'المستخدمون',    value: SUPABASE_CONNECTED ? MOCK_STATS.totalUsers    : '—', sub: fr ? 'total inscrits'    : 'إجمالي المسجلين'   },
            { icon: Activity,  label: fr ? 'Actifs auj.'     : 'نشطون اليوم',   value: SUPABASE_CONNECTED ? MOCK_STATS.activeToday   : '—', sub: fr ? 'dernières 24 h'    : 'آخر 24 ساعة'        },
            { icon: TrendingUp,label: fr ? 'Nouveaux/sem.'   : 'جدد هذا الأسبوع',value: SUPABASE_CONNECTED ? MOCK_STATS.newThisWeek  : '—', sub: fr ? 'inscriptions'     : 'تسجيلات جديدة'      },
            { icon: Clock,     label: fr ? 'Sessions'        : 'الجلسات',       value: SUPABASE_CONNECTED ? MOCK_STATS.totalSessions : '—', sub: fr ? 'toutes sessions'   : 'كل الجلسات'         },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <stat.icon size={16} style={{ color: 'var(--brand-primary)', opacity: 0.7 }} />
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: 'color-mix(in srgb, var(--brand-primary) 7%, transparent)', color: 'var(--brand-text-muted)' }}>
                  {fr ? 'cloud' : 'سحابة'}
                </span>
              </div>
              <p className="text-2xl font-black" style={{ color: 'var(--brand-primary)' }}>{stat.value}</p>
              <div>
                <p className="text-[11px] font-bold" style={{ color: 'var(--brand-primary)' }}>{stat.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--brand-text-muted)', opacity: 0.6 }}>{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats locales (disponibles maintenant) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} style={{ color: 'var(--brand-secondary)', opacity: 0.7 }} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {fr ? 'Données locales — cet appareil' : 'بيانات محلية — هذا الجهاز'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: FileText, label: fr ? 'Pages Diftar'    : 'صفحات الدفتر',    value: localStats.diftarPages,  color: 'var(--brand-primary)'   },
            { icon: Activity, label: fr ? 'Traits dessinés' : 'خطوط مرسومة',     value: localStats.totalStrokes, color: 'var(--brand-secondary)' },
            { icon: BookOpen, label: fr ? 'Sourates suivies': 'سور متابعة',       value: localStats.surahs,       color: 'var(--brand-primary)'   },
            { icon: Target,   label: fr ? 'Objectifs'       : 'الأهداف',          value: localStats.goals,        color: 'var(--brand-secondary)' },
            { icon: Shield,   label: fr ? 'Badges débloqués': 'شارات مفتوحة',    value: localStats.badges,       color: 'var(--brand-primary)'   },
            { icon: TrendingUp,label:fr ? 'Jours de suite'  : 'أيام متتالية',    value: localStats.loginStreak,  color: 'var(--brand-secondary)' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 + i * 0.05 }}
              className="glass-card p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)' }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] font-bold leading-tight" style={{ color: 'var(--brand-text-muted)' }}>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Schéma Supabase planifié */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database size={16} style={{ color: 'var(--brand-primary)' }} />
          <h3 className="font-bold text-sm" style={{ color: 'var(--brand-primary)' }}>
            {fr ? 'Schéma Supabase — à implémenter' : 'مخطط Supabase — للتطبيق'}
          </h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { table: 'users',        cols: 'id, email, username, avatar, created_at, last_seen',       status: fr ? 'À créer' : 'للإنشاء'   },
            { table: 'user_data',    cols: 'user_id, surahs, goals, badges, calendar, settings',       status: fr ? 'À créer' : 'للإنشاء'   },
            { table: 'diftar_pages', cols: 'id, user_id, title, type, strokes, shapes, paper_*',       status: fr ? 'À créer' : 'للإنشاء'   },
            { table: 'sessions',     cols: 'id, user_id, started_at, ended_at, device',                status: fr ? 'À créer' : 'للإنشاء'   },
            { table: 'analytics',    cols: 'event, user_id, payload, timestamp',                       status: fr ? 'À créer' : 'للإنشاء'   },
          ].map((t, i) => (
            <div key={i} className="p-3 rounded-2xl" style={{ background: 'color-mix(in srgb, var(--brand-primary) 4%, transparent)' }}>
              <div className="flex items-center gap-2 mb-1">
                <code className="text-[11px] font-black" style={{ color: 'var(--brand-primary)' }}>{t.table}</code>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>{t.status}</span>
              </div>
              <p className="text-[10px] font-mono leading-relaxed" style={{ color: 'var(--brand-text-muted)', opacity: 0.7 }}>{t.cols}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Migration note */}
      <div className="p-4 rounded-2xl border flex items-start gap-3"
        style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', background: 'color-mix(in srgb, var(--brand-primary) 3%, transparent)' }}>
        <Shield size={16} style={{ color: 'var(--brand-primary)', opacity: 0.6, flexShrink: 0, marginTop: 2 }} />
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
          {fr
            ? 'Migration sans perte : au 1er login Supabase, les données localforage de l\'utilisateur seront automatiquement copiées vers sa table user_data. Aucune donnée perdue.'
            : 'ترحيل آمن: عند أول تسجيل دخول Supabase، تُنسخ بيانات localforage تلقائياً إلى جدول user_data. لا فقدان للبيانات.'}
        </p>
      </div>
    </div>
  );
};
