export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  difficulty: number;
  status: 'not_started' | 'in_progress' | 'memorized';
  color?: string;
  juz?: number;
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
  svg: string;
  x: number;
  y: number;
  scale?: number;
}

export interface DiftarPage {
  id: string;
  title: string;
  type: 'revision' | 'tafsir' | 'dates' | 'objectives' | 'custom';
  strokes: Stroke[];
  stickers?: Sticker[];
  height?: number;
  paperStyle?: 'blank' | 'lines' | 'grid' | 'dots' | 'arabesque';
  paperColor?: string;
  lastSaved: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'sepia';
  notifications: boolean;
  dailyReminder: string;
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

// ═══════════════════════════════════════════════════════════════
// TOUTES LES 114 SOURATES DU CORAN — NOMS COMPLETS
// ═══════════════════════════════════════════════════════════════
export const SURAH_DATA: Omit<Surah, 'status' | 'color'>[] = [
  { id: 1,   name: "Al-Fatihah",      arabicName: "الفاتحة",    verses: 7,   difficulty: 1, juz: 1  },
  { id: 2,   name: "Al-Baqarah",      arabicName: "البقرة",     verses: 286, difficulty: 5, juz: 1  },
  { id: 3,   name: "Al-Imran",        arabicName: "آل عمران",   verses: 200, difficulty: 5, juz: 3  },
  { id: 4,   name: "An-Nisa",         arabicName: "النساء",     verses: 176, difficulty: 5, juz: 4  },
  { id: 5,   name: "Al-Maidah",       arabicName: "المائدة",    verses: 120, difficulty: 4, juz: 6  },
  { id: 6,   name: "Al-Anam",         arabicName: "الأنعام",    verses: 165, difficulty: 4, juz: 7  },
  { id: 7,   name: "Al-Araf",         arabicName: "الأعراف",    verses: 206, difficulty: 5, juz: 8  },
  { id: 8,   name: "Al-Anfal",        arabicName: "الأنفال",    verses: 75,  difficulty: 3, juz: 9  },
  { id: 9,   name: "At-Tawbah",       arabicName: "التوبة",     verses: 129, difficulty: 4, juz: 10 },
  { id: 10,  name: "Yunus",           arabicName: "يونس",       verses: 109, difficulty: 3, juz: 11 },
  { id: 11,  name: "Hud",             arabicName: "هود",        verses: 123, difficulty: 3, juz: 11 },
  { id: 12,  name: "Yusuf",           arabicName: "يوسف",       verses: 111, difficulty: 3, juz: 12 },
  { id: 13,  name: "Ar-Rad",          arabicName: "الرعد",      verses: 43,  difficulty: 3, juz: 13 },
  { id: 14,  name: "Ibrahim",         arabicName: "إبراهيم",    verses: 52,  difficulty: 3, juz: 13 },
  { id: 15,  name: "Al-Hijr",         arabicName: "الحجر",      verses: 99,  difficulty: 3, juz: 14 },
  { id: 16,  name: "An-Nahl",         arabicName: "النحل",      verses: 128, difficulty: 4, juz: 14 },
  { id: 17,  name: "Al-Isra",         arabicName: "الإسراء",    verses: 111, difficulty: 3, juz: 15 },
  { id: 18,  name: "Al-Kahf",         arabicName: "الكهف",      verses: 110, difficulty: 3, juz: 15 },
  { id: 19,  name: "Maryam",          arabicName: "مريم",       verses: 98,  difficulty: 3, juz: 16 },
  { id: 20,  name: "Ta-Ha",           arabicName: "طه",         verses: 135, difficulty: 3, juz: 16 },
  { id: 21,  name: "Al-Anbiya",       arabicName: "الأنبياء",   verses: 112, difficulty: 3, juz: 17 },
  { id: 22,  name: "Al-Hajj",         arabicName: "الحج",       verses: 78,  difficulty: 3, juz: 17 },
  { id: 23,  name: "Al-Muminun",      arabicName: "المؤمنون",   verses: 118, difficulty: 3, juz: 18 },
  { id: 24,  name: "An-Nur",          arabicName: "النور",      verses: 64,  difficulty: 3, juz: 18 },
  { id: 25,  name: "Al-Furqan",       arabicName: "الفرقان",    verses: 77,  difficulty: 3, juz: 18 },
  { id: 26,  name: "Ash-Shuara",      arabicName: "الشعراء",    verses: 227, difficulty: 4, juz: 19 },
  { id: 27,  name: "An-Naml",         arabicName: "النمل",      verses: 93,  difficulty: 3, juz: 19 },
  { id: 28,  name: "Al-Qasas",        arabicName: "القصص",      verses: 88,  difficulty: 3, juz: 20 },
  { id: 29,  name: "Al-Ankabut",      arabicName: "العنكبوت",   verses: 69,  difficulty: 3, juz: 20 },
  { id: 30,  name: "Ar-Rum",          arabicName: "الروم",      verses: 60,  difficulty: 3, juz: 21 },
  { id: 31,  name: "Luqman",          arabicName: "لقمان",      verses: 34,  difficulty: 2, juz: 21 },
  { id: 32,  name: "As-Sajdah",       arabicName: "السجدة",     verses: 30,  difficulty: 2, juz: 21 },
  { id: 33,  name: "Al-Ahzab",        arabicName: "الأحزاب",    verses: 73,  difficulty: 3, juz: 21 },
  { id: 34,  name: "Saba",            arabicName: "سبأ",        verses: 54,  difficulty: 3, juz: 22 },
  { id: 35,  name: "Fatir",           arabicName: "فاطر",       verses: 45,  difficulty: 3, juz: 22 },
  { id: 36,  name: "Ya-Sin",          arabicName: "يس",         verses: 83,  difficulty: 2, juz: 22 },
  { id: 37,  name: "As-Saffat",       arabicName: "الصافات",    verses: 182, difficulty: 4, juz: 23 },
  { id: 38,  name: "Sad",             arabicName: "ص",          verses: 88,  difficulty: 3, juz: 23 },
  { id: 39,  name: "Az-Zumar",        arabicName: "الزمر",      verses: 75,  difficulty: 3, juz: 23 },
  { id: 40,  name: "Ghafir",          arabicName: "غافر",       verses: 85,  difficulty: 3, juz: 24 },
  { id: 41,  name: "Fussilat",        arabicName: "فصلت",       verses: 54,  difficulty: 3, juz: 24 },
  { id: 42,  name: "Ash-Shura",       arabicName: "الشورى",     verses: 53,  difficulty: 3, juz: 25 },
  { id: 43,  name: "Az-Zukhruf",      arabicName: "الزخرف",     verses: 89,  difficulty: 3, juz: 25 },
  { id: 44,  name: "Ad-Dukhan",       arabicName: "الدخان",     verses: 59,  difficulty: 3, juz: 25 },
  { id: 45,  name: "Al-Jathiyah",     arabicName: "الجاثية",    verses: 37,  difficulty: 3, juz: 25 },
  { id: 46,  name: "Al-Ahqaf",        arabicName: "الأحقاف",    verses: 35,  difficulty: 3, juz: 26 },
  { id: 47,  name: "Muhammad",        arabicName: "محمد",       verses: 38,  difficulty: 3, juz: 26 },
  { id: 48,  name: "Al-Fath",         arabicName: "الفتح",      verses: 29,  difficulty: 2, juz: 26 },
  { id: 49,  name: "Al-Hujurat",      arabicName: "الحجرات",    verses: 18,  difficulty: 2, juz: 26 },
  { id: 50,  name: "Qaf",             arabicName: "ق",          verses: 45,  difficulty: 2, juz: 26 },
  { id: 51,  name: "Adh-Dhariyat",    arabicName: "الذاريات",   verses: 60,  difficulty: 3, juz: 26 },
  { id: 52,  name: "At-Tur",          arabicName: "الطور",      verses: 49,  difficulty: 2, juz: 27 },
  { id: 53,  name: "An-Najm",         arabicName: "النجم",      verses: 62,  difficulty: 2, juz: 27 },
  { id: 54,  name: "Al-Qamar",        arabicName: "القمر",      verses: 55,  difficulty: 2, juz: 27 },
  { id: 55,  name: "Ar-Rahman",       arabicName: "الرحمن",     verses: 78,  difficulty: 2, juz: 27 },
  { id: 56,  name: "Al-Waqiah",       arabicName: "الواقعة",    verses: 96,  difficulty: 2, juz: 27 },
  { id: 57,  name: "Al-Hadid",        arabicName: "الحديد",     verses: 29,  difficulty: 2, juz: 27 },
  { id: 58,  name: "Al-Mujadila",     arabicName: "المجادلة",   verses: 22,  difficulty: 2, juz: 28 },
  { id: 59,  name: "Al-Hashr",        arabicName: "الحشر",      verses: 24,  difficulty: 2, juz: 28 },
  { id: 60,  name: "Al-Mumtahanah",   arabicName: "الممتحنة",   verses: 13,  difficulty: 2, juz: 28 },
  { id: 61,  name: "As-Saf",          arabicName: "الصف",       verses: 14,  difficulty: 2, juz: 28 },
  { id: 62,  name: "Al-Jumuah",       arabicName: "الجمعة",     verses: 11,  difficulty: 1, juz: 28 },
  { id: 63,  name: "Al-Munafiqun",    arabicName: "المنافقون",  verses: 11,  difficulty: 2, juz: 28 },
  { id: 64,  name: "At-Taghabun",     arabicName: "التغابن",    verses: 18,  difficulty: 2, juz: 28 },
  { id: 65,  name: "At-Talaq",        arabicName: "الطلاق",     verses: 12,  difficulty: 2, juz: 28 },
  { id: 66,  name: "At-Tahrim",       arabicName: "التحريم",    verses: 12,  difficulty: 2, juz: 28 },
  { id: 67,  name: "Al-Mulk",         arabicName: "الملك",      verses: 30,  difficulty: 2, juz: 29 },
  { id: 68,  name: "Al-Qalam",        arabicName: "القلم",      verses: 52,  difficulty: 2, juz: 29 },
  { id: 69,  name: "Al-Haqqah",       arabicName: "الحاقة",     verses: 52,  difficulty: 2, juz: 29 },
  { id: 70,  name: "Al-Maarij",       arabicName: "المعارج",    verses: 44,  difficulty: 2, juz: 29 },
  { id: 71,  name: "Nuh",             arabicName: "نوح",        verses: 28,  difficulty: 2, juz: 29 },
  { id: 72,  name: "Al-Jinn",         arabicName: "الجن",       verses: 28,  difficulty: 2, juz: 29 },
  { id: 73,  name: "Al-Muzzammil",    arabicName: "المزمل",     verses: 20,  difficulty: 2, juz: 29 },
  { id: 74,  name: "Al-Muddathir",    arabicName: "المدثر",     verses: 56,  difficulty: 2, juz: 29 },
  { id: 75,  name: "Al-Qiyamah",      arabicName: "القيامة",    verses: 40,  difficulty: 2, juz: 29 },
  { id: 76,  name: "Al-Insan",        arabicName: "الإنسان",    verses: 31,  difficulty: 2, juz: 29 },
  { id: 77,  name: "Al-Mursalat",     arabicName: "المرسلات",   verses: 50,  difficulty: 2, juz: 29 },
  { id: 78,  name: "An-Naba",         arabicName: "النبأ",      verses: 40,  difficulty: 1, juz: 30 },
  { id: 79,  name: "An-Naziat",       arabicName: "النازعات",   verses: 46,  difficulty: 1, juz: 30 },
  { id: 80,  name: "Abasa",           arabicName: "عبس",        verses: 42,  difficulty: 1, juz: 30 },
  { id: 81,  name: "At-Takwir",       arabicName: "التكوير",    verses: 29,  difficulty: 1, juz: 30 },
  { id: 82,  name: "Al-Infitar",      arabicName: "الانفطار",   verses: 19,  difficulty: 1, juz: 30 },
  { id: 83,  name: "Al-Mutaffifin",   arabicName: "المطففين",   verses: 36,  difficulty: 1, juz: 30 },
  { id: 84,  name: "Al-Inshiqaq",     arabicName: "الانشقاق",   verses: 25,  difficulty: 1, juz: 30 },
  { id: 85,  name: "Al-Buruj",        arabicName: "البروج",     verses: 22,  difficulty: 1, juz: 30 },
  { id: 86,  name: "At-Tariq",        arabicName: "الطارق",     verses: 17,  difficulty: 1, juz: 30 },
  { id: 87,  name: "Al-Ala",          arabicName: "الأعلى",     verses: 19,  difficulty: 1, juz: 30 },
  { id: 88,  name: "Al-Ghashiyah",    arabicName: "الغاشية",    verses: 26,  difficulty: 1, juz: 30 },
  { id: 89,  name: "Al-Fajr",         arabicName: "الفجر",      verses: 30,  difficulty: 1, juz: 30 },
  { id: 90,  name: "Al-Balad",        arabicName: "البلد",      verses: 20,  difficulty: 1, juz: 30 },
  { id: 91,  name: "Ash-Shams",       arabicName: "الشمس",      verses: 15,  difficulty: 1, juz: 30 },
  { id: 92,  name: "Al-Layl",         arabicName: "الليل",      verses: 21,  difficulty: 1, juz: 30 },
  { id: 93,  name: "Ad-Duha",         arabicName: "الضحى",      verses: 11,  difficulty: 1, juz: 30 },
  { id: 94,  name: "Ash-Sharh",       arabicName: "الشرح",      verses: 8,   difficulty: 1, juz: 30 },
  { id: 95,  name: "At-Tin",          arabicName: "التين",      verses: 8,   difficulty: 1, juz: 30 },
  { id: 96,  name: "Al-Alaq",         arabicName: "العلق",      verses: 19,  difficulty: 1, juz: 30 },
  { id: 97,  name: "Al-Qadr",         arabicName: "القدر",      verses: 5,   difficulty: 1, juz: 30 },
  { id: 98,  name: "Al-Bayyinah",     arabicName: "البينة",     verses: 8,   difficulty: 1, juz: 30 },
  { id: 99,  name: "Az-Zalzalah",     arabicName: "الزلزلة",    verses: 8,   difficulty: 1, juz: 30 },
  { id: 100, name: "Al-Adiyat",       arabicName: "العاديات",   verses: 11,  difficulty: 1, juz: 30 },
  { id: 101, name: "Al-Qariah",       arabicName: "القارعة",    verses: 11,  difficulty: 1, juz: 30 },
  { id: 102, name: "At-Takathur",     arabicName: "التكاثر",    verses: 8,   difficulty: 1, juz: 30 },
  { id: 103, name: "Al-Asr",          arabicName: "العصر",      verses: 3,   difficulty: 1, juz: 30 },
  { id: 104, name: "Al-Humazah",      arabicName: "الهمزة",     verses: 9,   difficulty: 1, juz: 30 },
  { id: 105, name: "Al-Fil",          arabicName: "الفيل",      verses: 5,   difficulty: 1, juz: 30 },
  { id: 106, name: "Quraysh",         arabicName: "قريش",       verses: 4,   difficulty: 1, juz: 30 },
  { id: 107, name: "Al-Maun",         arabicName: "الماعون",    verses: 7,   difficulty: 1, juz: 30 },
  { id: 108, name: "Al-Kawthar",      arabicName: "الكوثر",     verses: 3,   difficulty: 1, juz: 30 },
  { id: 109, name: "Al-Kafirun",      arabicName: "الكافرون",   verses: 6,   difficulty: 1, juz: 30 },
  { id: 110, name: "An-Nasr",         arabicName: "النصر",      verses: 3,   difficulty: 1, juz: 30 },
  { id: 111, name: "Al-Masad",        arabicName: "المسد",      verses: 5,   difficulty: 1, juz: 30 },
  { id: 112, name: "Al-Ikhlas",       arabicName: "الإخلاص",    verses: 4,   difficulty: 1, juz: 30 },
  { id: 113, name: "Al-Falaq",        arabicName: "الفلق",      verses: 5,   difficulty: 1, juz: 30 },
  { id: 114, name: "An-Nas",          arabicName: "الناس",      verses: 6,   difficulty: 1, juz: 30 },
];

export const generateAllSurahs = (): Surah[] => {
  return SURAH_DATA.map(s => ({
    ...s,
    status: 'not_started' as const,
    color: undefined,
  }));
};
