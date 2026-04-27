import React from 'react';

export interface Theme {
  name: string;
  bg: string;
  bgSoft: string;
  card: string;
  cardElev: string;
  ink: string;
  inkDim: string;
  inkMute: string;
  line: string;
  lineSoft: string;
  accent: string;
  accentBright: string;
  accentSoft: string;
  glow: string;
}

// ── Light variants ────────────────────────────────────────────────────────────
export const THEMES: Record<string, Theme> = {
  gold: {
    name: 'Mishkat Or',
    bg: '#f8f3e9',
    bgSoft: '#f2ead8',
    card: '#fdfaf3',
    cardElev: '#f5ecd8',
    ink: '#1c1409',
    inkDim: '#5a4628',
    inkMute: '#9a8060',
    line: '#e5d5b5',
    lineSoft: '#eee5ce',
    accent: '#c8962a',
    accentBright: '#d4a64a',
    accentSoft: '#f5e8c8',
    glow: 'rgba(200,150,42,0.14)',
  },
  sakura: {
    name: 'Sakura',
    bg: '#fdf0f4',
    bgSoft: '#f8e8ee',
    card: '#fff8fa',
    cardElev: '#f8ecf0',
    ink: '#1a080c',
    inkDim: '#5a2c38',
    inkMute: '#9a6070',
    line: '#e8c5cf',
    lineSoft: '#f2dce4',
    accent: '#c85068',
    accentBright: '#d96b7a',
    accentSoft: '#f8d8de',
    glow: 'rgba(200,80,104,0.14)',
  },
  azur: {
    name: 'Azur',
    bg: '#f0f5fa',
    bgSoft: '#e8f0f8',
    card: '#f8fbff',
    cardElev: '#edf3fa',
    ink: '#08101c',
    inkDim: '#2c4060',
    inkMute: '#607090',
    line: '#c5d5e8',
    lineSoft: '#dce8f5',
    accent: '#4580c0',
    accentBright: '#5b9bd5',
    accentSoft: '#d5e8f8',
    glow: 'rgba(69,128,192,0.14)',
  },
  emerald: {
    name: 'Émeraude',
    bg: '#f0f8f2',
    bgSoft: '#e8f4ec',
    card: '#f8fdf9',
    cardElev: '#edf7f1',
    ink: '#080f0c',
    inkDim: '#2c5040',
    inkMute: '#608070',
    line: '#c5e0d0',
    lineSoft: '#d8eee0',
    accent: '#4a9870',
    accentBright: '#5fb088',
    accentSoft: '#d0eee0',
    glow: 'rgba(74,152,112,0.14)',
  },
};

// ── Dark variants ─────────────────────────────────────────────────────────────
export const DARK_THEMES: Record<string, Theme> = {
  gold: {
    name: 'Mishkat Or',
    bg: '#0c0a08',
    bgSoft: '#13110d',
    card: '#1a1612',
    cardElev: '#211c16',
    ink: '#f5e9d0',
    inkDim: '#a89880',
    inkMute: '#5d5240',
    line: '#2a241c',
    lineSoft: '#1f1a14',
    accent: '#d4a64a',
    accentBright: '#f4c269',
    accentSoft: '#7a5a1f',
    glow: 'rgba(212,166,74,0.18)',
  },
  sakura: {
    name: 'Sakura',
    bg: '#0e0709',
    bgSoft: '#160a0e',
    card: '#1d0e13',
    cardElev: '#241319',
    ink: '#f7e3e6',
    inkDim: '#b08891',
    inkMute: '#5a3d44',
    line: '#2c1a20',
    lineSoft: '#22141a',
    accent: '#d96b7a',
    accentBright: '#f08a99',
    accentSoft: '#7a2f3c',
    glow: 'rgba(217,107,122,0.18)',
  },
  azur: {
    name: 'Azur',
    bg: '#070b10',
    bgSoft: '#0c1118',
    card: '#101720',
    cardElev: '#161e29',
    ink: '#dde9f5',
    inkDim: '#7e95ad',
    inkMute: '#3d4d61',
    line: '#1c2735',
    lineSoft: '#141d28',
    accent: '#5b9bd5',
    accentBright: '#7eb8ed',
    accentSoft: '#2c5478',
    glow: 'rgba(91,155,213,0.18)',
  },
  emerald: {
    name: 'Émeraude',
    bg: '#070d0a',
    bgSoft: '#0c1411',
    card: '#101a16',
    cardElev: '#16221d',
    ink: '#dceee4',
    inkDim: '#7ea495',
    inkMute: '#3d574b',
    line: '#1c2a23',
    lineSoft: '#142019',
    accent: '#5fb088',
    accentBright: '#82cca5',
    accentSoft: '#2d6347',
    glow: 'rgba(95,176,136,0.18)',
  },
};

export const ThemeContext = React.createContext<Theme>(THEMES.gold);
export const useT = () => React.useContext(ThemeContext);
