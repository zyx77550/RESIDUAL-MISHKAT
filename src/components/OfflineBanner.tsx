import React, { useState, useEffect } from 'react';
import { useT } from '../lib/theme';

export const OfflineBanner = ({ lang }: { lang: string }) => {
  const t = useT();
  const [online, setOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const on = () => {
      setOnline(true);
      if (wasOffline) { setShowBack(true); setTimeout(() => setShowBack(false), 3000); }
    };
    const off = () => { setOnline(false); setWasOffline(true); };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [wasOffline]);

  if (online && !showBack) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      padding: '9px 16px', textAlign: 'center',
      fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
      background: online ? '#16a34a' : '#1a0f00',
      color: online ? '#fff' : t.accent,
      transition: 'background 0.4s',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
    }}>
      {online
        ? (lang === 'fr' ? '✓ Connexion rétablie' : '✓ تمت استعادة الاتصال')
        : (lang === 'fr' ? '📡 Hors-ligne — données locales disponibles' : '📡 دون إنترنت — البيانات المحلية متاحة')}
    </div>
  );
};
