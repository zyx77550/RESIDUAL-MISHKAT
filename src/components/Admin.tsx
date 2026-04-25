import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Activity, BookOpen, Target, Database, Wifi, WifiOff,
  TrendingUp, Shield, Clock, FileText, Layers, RefreshCw,
} from 'lucide-react';
import { UserData } from '../types';
import { fetchAdminStats, AdminStats } from '../lib/supabase';

interface AdminProps {
  userData: UserData;
  lang: string;
}

export const AdminSection = ({ userData, lang }: AdminProps) => {
  const [cloudStats, setCloudStats]   = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError]   = useState<string | null>(null);

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
      const stats = await fetchAdminStats();
      setCloudStats(stats);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const fr = lang === 'fr';
  const connected = cloudStats !== null && !statsError;

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
          onClick={loadStats}
          disabled={loadingStats}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm border transition-all"
          style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)', color: 'var(--brand-primary)', background: 'color-mix(in srgb, var(--brand-primary) 5%, transparent)' }}
        >
          <motion.div animate={{ rotate: loadingStats ? 360 : 0 }} transition={{ duration: 0.8, ease: 'linear', repeat: loadingStats ? Infinity : 0 }}>
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
          style={{ background: connected ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)' }}>
          {connected
            ? <Wifi size={20} style={{ color: '#22c55e' }} />
            : <WifiOff size={20} style={{ color: '#ef4444' }} />}
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm" style={{ color: 'var(--brand-primary)' }}>
            Supabase — {connected ? (fr ? 'Connecté' : 'متصل') : (fr ? 'Non connecté' : 'غير متصل')}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--brand-text-muted)', opacity: 0.7 }}>
            {statsError
              ? statsError
              : connected
                ? (fr ? 'Données en temps réel disponibles' : 'البيانات الفورية متاحة')
                : (fr ? 'Chargement…' : 'جاري التحميل…')}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
          style={{
            background: connected ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)',
            color: connected ? '#22c55e' : '#ef4444',
          }}>
          {connected ? 'LIVE' : loadingStats ? '…' : 'ERR'}
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
            { icon: Users,      label: fr ? 'Utilisateurs'  : 'المستخدمون',     value: cloudStats?.totalUsers       ?? '—', sub: fr ? 'total inscrits'  : 'إجمالي المسجلين'  },
            { icon: Activity,   label: fr ? 'Actifs auj.'   : 'نشطون اليوم',    value: cloudStats?.activeToday      ?? '—', sub: fr ? 'dernières 24 h'  : 'آخر 24 ساعة'       },
            { icon: TrendingUp, label: fr ? 'Nouveaux/sem.' : 'جدد هذا الأسبوع',value: cloudStats?.newThisWeek      ?? '—', sub: fr ? 'inscriptions'   : 'تسجيلات جديدة'     },
            { icon: FileText,   label: fr ? 'Pages Diftar'  : 'صفحات الدفتر',   value: cloudStats?.totalDiftarPages ?? '—', sub: fr ? 'toutes pages'    : 'مجموع الصفحات'    },
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

      {/* Stats locales */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={14} style={{ color: 'var(--brand-secondary)', opacity: 0.7 }} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--brand-secondary)', opacity: 0.7 }}>
            {fr ? 'Données locales — cet appareil' : 'بيانات محلية — هذا الجهاز'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: FileText,   label: fr ? 'Pages Diftar'    : 'صفحات الدفتر',  value: localStats.diftarPages,  color: 'var(--brand-primary)'   },
            { icon: Activity,   label: fr ? 'Traits dessinés' : 'خطوط مرسومة',   value: localStats.totalStrokes, color: 'var(--brand-secondary)' },
            { icon: BookOpen,   label: fr ? 'Sourates suivies': 'سور متابعة',     value: localStats.surahs,       color: 'var(--brand-primary)'   },
            { icon: Target,     label: fr ? 'Objectifs'       : 'الأهداف',        value: localStats.goals,        color: 'var(--brand-secondary)' },
            { icon: Shield,     label: fr ? 'Badges débloqués': 'شارات مفتوحة',  value: localStats.badges,       color: 'var(--brand-primary)'   },
            { icon: TrendingUp, label: fr ? 'Jours de suite'  : 'أيام متتالية',  value: localStats.loginStreak,  color: 'var(--brand-secondary)' },
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

      {/* Migration note */}
      <div className="p-4 rounded-2xl border flex items-start gap-3"
        style={{ borderColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', background: 'color-mix(in srgb, var(--brand-primary) 3%, transparent)' }}>
        <Shield size={16} style={{ color: 'var(--brand-primary)', opacity: 0.6, flexShrink: 0, marginTop: 2 }} />
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--brand-text-muted)' }}>
          {fr
            ? 'Migration sans perte : au 1er login Supabase, les données localforage de l\'utilisateur sont automatiquement copiées vers sa table user_data. Aucune donnée perdue.'
            : 'ترحيل آمن: عند أول تسجيل دخول Supabase، تُنسخ بيانات localforage تلقائياً إلى جدول user_data. لا فقدان للبيانات.'}
        </p>
      </div>
    </div>
  );
};
