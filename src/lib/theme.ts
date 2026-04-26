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

export const THEMES: Record<string, Theme> = {
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
