import React, { useState } from 'react';
import { useT } from '../lib/theme';
import { LanternMark, Icon, Icons } from './ui';
import { signIn, signUp } from '../lib/supabase';

interface AuthProps {
  lang: string;
  onContinueLocal: () => void;
}

const REMEMBER_KEY = 'mishkat_remembered_email';

export const AuthScreen = ({ lang, onContinueLocal }: AuthProps) => {
  const t = useT();
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [email, setEmail]       = useState(() => localStorage.getItem(REMEMBER_KEY) ?? '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem(REMEMBER_KEY));
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const fr = lang === 'fr';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        if (rememberMe) localStorage.setItem(REMEMBER_KEY, email);
        else localStorage.removeItem(REMEMBER_KEY);
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess(fr ? 'Compte créé ! Vérifie ta boîte mail.' : 'تم إنشاء الحساب! تحقق من بريدك.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Invalid login')) setError(fr ? 'Email ou mot de passe incorrect.' : 'البريد أو كلمة المرور خاطئة.');
      else if (msg.includes('already registered')) setError(fr ? 'Cet email est déjà utilisé.' : 'هذا البريد مسجل مسبقاً.');
      else setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: t.bg, color: t.ink, display: 'flex', overflow: 'hidden', fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none' }}>
        <defs>
          <pattern id="auth-pat" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect x="20" y="20" width="40" height="40" fill="none" stroke={t.accent} strokeWidth="0.5"/>
            <rect x="20" y="20" width="40" height="40" fill="none" stroke={t.accent} strokeWidth="0.5" transform="rotate(45 40 40)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-pat)"/>
      </svg>

      {/* Left — hero */}
      <div className="hidden md:flex" style={{ flex: 1, padding: '60px 50px', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', borderRight: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <LanternMark size={42} color={t.accent}/>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: t.ink, fontWeight: 300 }}>Mishkat</div>
            <div style={{ fontSize: 9.5, color: t.inkMute, letterSpacing: '0.32em', textTransform: 'uppercase' }}>مِشْكَاة · حِفْظ القرآن</div>
          </div>
        </div>
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <svg width="420" height="420" viewBox="0 0 500 500" fill="none" style={{ position: 'absolute', left: -60, top: -60, opacity: 0.35, pointerEvents: 'none' }}>
            <circle cx="250" cy="250" r="200" stroke={t.accent} strokeWidth="0.4"/>
            <circle cx="250" cy="250" r="160" stroke={t.accent} strokeWidth="0.4"/>
            <circle cx="250" cy="250" r="120" stroke={t.accent} strokeWidth="0.4"/>
            <path d="M 250 50 L 290 130 L 380 130 L 320 190 L 350 280 L 250 220 L 150 280 L 180 190 L 120 130 L 210 130 Z" fill={t.accent} opacity="0.2"/>
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 30, color: t.ink, lineHeight: 1.8, direction: 'rtl', textAlign: 'right' }}>
              اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 300, fontSize: 15, color: t.inkDim, marginTop: 14, lineHeight: 1.6 }}>
              « Lis, au nom de ton Seigneur qui a créé. »
            </div>
            <div style={{ fontSize: 10, color: t.accentBright, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8 }}>
              Al-ʿAlaq · 96:1
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Une lanterne pour la mémoire du cœur
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: '100%', maxWidth: 440, padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: t.bgSoft, overflowY: 'auto' }}>
        <div style={{ fontSize: 11, color: t.inkMute, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
          {fr ? 'Bienvenue' : 'أهلاً وسهلاً'}
        </div>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 300, fontSize: 28, margin: '0 0 28px', color: t.ink, letterSpacing: '-0.02em' }}>
          {mode === 'login' ? (fr ? 'Reprenez votre mémorisation' : 'تابع حفظك') : (fr ? 'Créer votre compte' : 'إنشاء حساب')}
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 22, padding: 4, background: t.card, borderRadius: 10, border: `1px solid ${t.line}` }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null); }}
              style={{ flex: 1, padding: '9px', borderRadius: 7, background: mode === m ? t.accent : 'transparent', color: mode === m ? '#1a0f00' : t.inkDim, fontFamily: 'Inter', fontWeight: 600, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {m === 'login' ? (fr ? 'Connexion' : 'دخول') : (fr ? 'Inscription' : 'تسجيل')}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder={fr ? 'vous@exemple.com' : 'بريدك@مثال.com'}
              style={{ width: '100%', padding: '12px 14px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 8, color: t.ink, fontSize: 13, outline: 'none' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: t.inkMute, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
              {fr ? 'Mot de passe' : 'كلمة المرور'}
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 40px 12px 14px', background: t.card, border: `1px solid ${t.line}`, borderRadius: 8, color: t.ink, fontSize: 13, outline: 'none' }}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: t.inkMute }}>
                <Icon d={showPwd ? Icons.eye : Icons.lock} size={14}/>
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
              <div
                onClick={() => setRememberMe(v => !v)}
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  border: `1.5px solid ${rememberMe ? t.accent : t.line}`,
                  background: rememberMe ? t.accent : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                {rememberMe && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#1a0f00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 12, color: t.inkDim }}>
                {fr ? 'Se souvenir de moi' : 'تذكرني'}
              </span>
            </label>
          )}

          {(error || success) && (
            <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, background: error ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: error ? '#ef4444' : '#16a34a', border: `1px solid ${error ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}` }}>
              {error || success}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 10, background: loading ? t.accentSoft : t.accent, color: '#1a0f00', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            {loading ? (fr ? 'Chargement…' : 'جاري…') : mode === 'login' ? (fr ? 'Se connecter' : 'تسجيل الدخول') : (fr ? 'Créer mon compte' : 'إنشاء الحساب')}
            {!loading && <Icon d={Icons.arrow} size={14}/>}
          </button>
        </form>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: t.line }}/><span style={{ fontSize: 10, color: t.inkMute, letterSpacing: '0.18em' }}>ou</span><div style={{ flex: 1, height: 1, background: t.line }}/>
        </div>

        <button onClick={onContinueLocal}
          style={{ width: '100%', padding: '11px', borderRadius: 10, border: `1px solid ${t.line}`, background: 'transparent', color: t.inkDim, fontFamily: 'Inter', fontWeight: 500, fontSize: 12 }}>
          {fr ? 'Continuer sans compte (données locales)' : 'المتابعة بدون حساب'}
        </button>
      </div>
    </div>
  );
};
