import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signIn, signUp } from '../lib/supabase';

interface AuthProps {
  lang: string;
  onContinueLocal: () => void;
}

export const AuthScreen = ({ lang, onContinueLocal }: AuthProps) => {
  const [mode,     setMode]     = useState<'login' | 'signup'>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState<string | null>(null);

  const fr = lang === 'fr';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess(fr
          ? 'Compte créé ! Vérifie ta boîte mail pour confirmer.'
          : 'تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Invalid login')) {
        setError(fr ? 'Email ou mot de passe incorrect.' : 'البريد أو كلمة المرور خاطئة.');
      } else if (msg.includes('already registered')) {
        setError(fr ? 'Cet email est déjà utilisé.' : 'هذا البريد مسجل مسبقاً.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--brand-bg)' }}
    >
      {/* Fond décoratif */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: 'var(--brand-primary)' }} />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-[0.04]"
          style={{ background: 'var(--brand-secondary)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-3xl mx-auto shadow-xl overflow-hidden">
            <img src="/icon-192.png" alt="Mishkat" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-serif italic" style={{ color: 'var(--brand-primary)' }}>
            مِشْكَاة
          </h1>
          <p className="text-xs uppercase tracking-[0.35em] font-bold"
            style={{ color: 'var(--brand-secondary)', opacity: 0.65 }}>
            {fr ? 'Votre compagnon de mémorisation' : 'رفيق حفظ القرآن'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-7 space-y-5">
          {/* Tabs */}
          <div className="flex rounded-2xl p-1 gap-1"
            style={{ background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)' }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                style={mode === m
                  ? { background: 'var(--brand-primary)', color: '#fff' }
                  : { color: 'var(--brand-text-muted)' }}
              >
                {m === 'login'
                  ? (fr ? 'Connexion' : 'تسجيل دخول')
                  : (fr ? 'Inscription' : 'إنشاء حساب')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--brand-primary)', opacity: 0.5 }} />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder={fr ? 'Adresse email' : 'البريد الإلكتروني'}
                className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm border bg-transparent focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                  color: 'var(--brand-primary)',
                  '--tw-ring-color': 'color-mix(in srgb, var(--brand-primary) 25%, transparent)',
                } as React.CSSProperties}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--brand-primary)', opacity: 0.5 }} />
              <input
                type={showPwd ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder={fr ? 'Mot de passe' : 'كلمة المرور'}
                minLength={6}
                className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm border bg-transparent focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                  color: 'var(--brand-primary)',
                } as React.CSSProperties}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--brand-primary)', opacity: 0.4 }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Erreur / Succès */}
            <AnimatePresence>
              {(error || success) && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs font-bold px-3 py-2 rounded-xl"
                  style={error
                    ? { background: 'rgba(239,68,68,0.08)', color: '#ef4444' }
                    : { background: 'rgba(34,197,94,0.08)', color: '#16a34a' }}
                >
                  {error || success}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="w-full py-3 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: loading ? 'color-mix(in srgb, var(--brand-primary) 60%, transparent)' : 'var(--brand-primary)' }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {mode === 'login'
                ? (fr ? 'Se connecter' : 'تسجيل الدخول')
                : (fr ? 'Créer mon compte' : 'إنشاء الحساب')}
            </motion.button>
          </form>
        </div>

        {/* Continuer sans compte */}
        <div className="text-center">
          <button
            onClick={onContinueLocal}
            className="text-xs font-bold underline underline-offset-4 opacity-50 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--brand-text-muted)' }}
          >
            {fr ? 'Continuer sans compte (données locales)' : 'المتابعة بدون حساب (بيانات محلية)'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
