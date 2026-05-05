import React from 'react';
import { useT } from '../lib/theme';

interface IslamicLoaderProps {
  size?: number;
  label?: string;
  style?: React.CSSProperties;
}

export const IslamicLoader = ({ size = 48, label, style }: IslamicLoaderProps) => {
  const t = useT();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, ...style }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ color: 'var(--brand-primary)' }}>
        {/* Outer track */}
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
        {/* Rotating arc */}
        <circle
          cx="24" cy="24" r="20"
          stroke="currentColor" strokeWidth="2.5" fill="none"
          strokeDasharray="28 97" strokeLinecap="round"
          style={{
            animation: 'islamic-spin 1.3s linear infinite',
            transformOrigin: '24px 24px',
          }}
        />
        {/* Crescent — mirrored to face right (hilal orientation) */}
        <g transform="matrix(-1,0,0,1,48,0)">
          <path
            d="M29 17a9 9 0 1 1-9 16 7 7 0 0 0 0-16 9 9 0 0 1 9 0z"
            fill="currentColor"
            opacity="0.65"
            style={{ animation: 'islamic-pulse 1.3s ease-in-out infinite' }}
          />
        </g>
      </svg>
      {label && (
        <span style={{ fontSize: 10, color: t.inkMute, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          {label}
        </span>
      )}
    </div>
  );
};
