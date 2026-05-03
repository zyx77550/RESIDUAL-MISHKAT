import React from 'react';
import { useT } from '../lib/theme';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export const Skeleton = ({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) => {
  const t = useT();
  return (
    <div style={{
      width, height, borderRadius,
      background: `linear-gradient(90deg, ${t.cardElev} 25%, ${t.line} 50%, ${t.cardElev} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.4s infinite',
      ...style,
    }}/>
  );
};

export const SkeletonCard = ({ lines = 3, style }: { lines?: number; style?: React.CSSProperties }) => {
  const t = useT();
  return (
    <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: 12, padding: '18px 22px', ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={i === 0 ? 14 : 11} width={i === 0 ? '60%' : i === lines - 1 ? '40%' : '85%'} style={{ marginBottom: i < lines - 1 ? 10 : 0 }} />
      ))}
    </div>
  );
};
