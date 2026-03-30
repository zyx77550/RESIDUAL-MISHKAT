export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  difficulty: number;
  status: 'not_started' | 'in_progress' | 'memorized';
  color?: string;
}

export interface Stroke {
  points: { x: number; y: number; p?: number }[];
  color: string;
  width: number;
  type: 'pen' | 'fountain-pen' | 'highlighter' | 'chalk' | 'eraser' | 'ruler';
  timestamp: number;
}

export interface Sticker {
  id: string;
  type: string;
  x: number;
  y: number;
  scale: number;
}

export interface DiftarPage {
  id: string;
  title: string;
  type: 'revision' | 'tafsir' | 'dates' | 'objectives' | 'custom';
  strokes: Stroke[];
  stickers?: Sticker[];
  lastSaved: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'sepia';
  notifications: boolean;
  dailyReminder: string; // "HH:mm"
  fontSize: 'small' | 'medium' | 'large';
  showArabicNames: boolean;
  username: string;
  avatar?: string;
}

export interface UserData {
  surahs: Surah[];
  diftarPages: DiftarPage[];
  goals: { id: string; text: string; completed: boolean; month: number }[];
  badges: string[];
  calendar: { date: string; prayers: string[]; fasting: boolean; pagesRead: number }[];
  tasbihCount: number;
  onboarded: boolean;
  settings: UserSettings;
}

export const INITIAL_SURAH_DATA: Surah[] = [
  { id: 1, name: "Al-Fatihah", arabicName: "الفاتحة", verses: 7, difficulty: 1, status: 'not_started' },
  { id: 2, name: "Al-Baqarah", arabicName: "البقرة", verses: 286, difficulty: 5, status: 'not_started' },
  // ... will add more or generate programmatically
];

// Helper to generate all 114 surahs for the grid
export const generateAllSurahs = (): Surah[] => {
  const surahs: Surah[] = [];
  for (let i = 1; i <= 114; i++) {
    surahs.push({
      id: i,
      name: `Surah ${i}`,
      arabicName: `سورة ${i}`,
      verses: 0,
      difficulty: 3,
      status: 'not_started'
    });
  }
  return surahs;
};
