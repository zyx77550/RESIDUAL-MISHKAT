// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA — used across all screens for realistic previews
// ═══════════════════════════════════════════════════════════════

const SAMPLE = {
  username: 'Nour',
  streak: 12,
  todayAyat: 5,
  totalAyat: 384,
  weekTotal: 23,
  goalMonth: 30,
  goalProgress: 23,
  surahsMemorized: 8,
  surahsInProgress: 2,
  badges: 14,
  tasbihToday: 132,
  tasbihTotal: 4280,
  tasbihBest: 333,
  // current
  currentSurah: { id: 67, name: 'Al-Mulk', arabic: 'الملك', verses: 30, done: 18 },
  currentVerse: { id: 19, surah: 'Al-Mulk', arabic: 'أَوَلَمْ يَرَوْا إِلَى الطَّيْرِ فَوْقَهُمْ صَافَّاتٍ وَيَقْبِضْنَ ۚ مَا يُمْسِكُهُنَّ إِلَّا الرَّحْمَٰنُ ۚ إِنَّهُ بِكُلِّ شَيْءٍ بَصِيرٌ', translit: 'Awalam yaraw ilaṭ-ṭayri fawqahum ṣāffātin wayaqbiḍn', fr: "N'ont-ils pas vu les oiseaux au-dessus d'eux, déployant et repliant leurs ailes tour à tour ? Seul le Tout-Miséricordieux les soutient." },
  // memorized
  memorized: [
    { id: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', verses: 7 },
    { id: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', verses: 4 },
    { id: 113, name: 'Al-Falaq', arabic: 'الفلق', verses: 5 },
    { id: 114, name: 'An-Nas', arabic: 'الناس', verses: 6 },
    { id: 110, name: 'An-Nasr', arabic: 'النصر', verses: 3 },
    { id: 108, name: 'Al-Kawthar', arabic: 'الكوثر', verses: 3 },
    { id: 109, name: 'Al-Kafirun', arabic: 'الكافرون', verses: 6 },
    { id: 111, name: 'Al-Masad', arabic: 'المسد', verses: 5 },
  ],
  // 7 days
  weekDays: [
    { day: 'L', n: 18, p: 5, fast: false, read: 4 },
    { day: 'M', n: 19, p: 5, fast: false, read: 6 },
    { day: 'M', n: 20, p: 5, fast: true, read: 3 },
    { day: 'J', n: 21, p: 5, fast: false, read: 5 },
    { day: 'V', n: 22, p: 5, fast: false, read: 8 },
    { day: 'S', n: 23, p: 4, fast: false, read: 2 },
    { day: 'D', n: 24, p: 5, fast: false, read: 5, today: true },
  ],
  // goals
  goals: [
    { text: 'Terminer Al-Mulk avant la fin du mois', done: false, progress: 0.6 },
    { text: 'Réviser le Juz Amma 3x par semaine', done: true, progress: 1 },
    { text: 'Lire Sourate Al-Kahf chaque vendredi', done: true, progress: 1 },
    { text: 'Faire 100 tasbih après chaque salat', done: false, progress: 0.4 },
    { text: 'Apprendre la traduction de 5 versets/sem.', done: false, progress: 0.2 },
  ],
  // badges
  badgesEarned: [
    { id: 'first', title: 'Première Sourate', rarity: 'common', icon: 'star' },
    { id: 'streak7', title: 'Semaine de Foi', rarity: 'rare', icon: 'flame' },
    { id: 'fatiha', title: 'La Lumière', rarity: 'common', icon: 'sparkle' },
    { id: 'mulk', title: 'La Protectrice', rarity: 'rare', icon: 'moon' },
    { id: 'juzAmma', title: 'Juz Amma', rarity: 'rare', icon: 'book' },
    { id: 'tasbih100', title: 'Dhikr Master', rarity: 'rare', icon: 'beads' },
    { id: 'first_note', title: 'Première Note', rarity: 'common', icon: 'pen' },
    { id: 'artist', title: 'Artiste', rarity: 'rare', icon: 'palette' },
  ],
  badgesLocked: [
    { id: 'hafiz', title: 'Hafiz Complet', rarity: 'legendary' },
    { id: 'streak30', title: 'Mois de Dévotion', rarity: 'epic' },
    { id: 'yaseen', title: 'Cœur du Coran', rarity: 'epic' },
    { id: 'rahman', title: 'La Miséricorde', rarity: 'rare' },
  ],
  // tasbih phrases
  tasbihPhrases: [
    { ar: 'سُبْحَانَ اللَّه', tr: 'SubhanAllah', fr: 'Gloire à Allah' },
    { ar: 'الْحَمْدُ لِلَّه', tr: 'Alhamdulillah', fr: 'Louange à Allah' },
    { ar: 'اللَّهُ أَكْبَر', tr: 'Allahu Akbar', fr: 'Allah est le plus grand' },
    { ar: 'لَا إِلَهَ إِلَّا اللَّه', tr: 'La ilaha illa Allah', fr: "Il n'y a de dieu qu'Allah" },
  ],
  // diftar pages
  diftarPages: [
    { title: "Tafsir d'Al-Mulk verset 1-5", type: 'tafsir', updated: '2j' },
    { title: 'Vocabulaire — sourates de la fin', type: 'vocab', updated: '5j' },
    { title: 'Dua du matin', type: 'dua', updated: 'Hier' },
    { title: 'Notes — règles de tajweed', type: 'tajweed', updated: '1sem' },
    { title: 'Schéma : structure d\'Al-Baqarah', type: 'schema', updated: '3sem' },
    { title: 'Objectifs Ramadan', type: 'objectives', updated: '1mois' },
  ],
  // kanban
  kanban: {
    todo: ['Al-Insan', 'Al-Qiyamah', 'Al-Muddathir', 'Al-Muzzammil'],
    progress: ['Al-Mulk', 'Al-Qalam'],
    review: ['Ya-Sin', 'Ar-Rahman', 'Al-Waqiah'],
    done: ['Al-Fatihah', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas', 'An-Nasr', 'Al-Kawthar'],
  },
  // baqara — verse list excerpt
  baqaraVerses: [
    { n: 1, ar: 'الم', fr: 'Alif Lam Mim', read: true },
    { n: 2, ar: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ', fr: "Voici le Livre au sujet duquel il n'y a aucun doute, c'est un guide pour les pieux,", read: true },
    { n: 3, ar: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ', fr: "qui croient à l'invisible et accomplissent la Salat, et qui dépensent [dans l'obéissance à Allah], de ce que Nous leur avons attribué.", read: true },
    { n: 4, ar: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ', fr: "Ceux qui croient à ce qui t'a été descendu (révélé) et à ce qui a été descendu avant toi et qui croient fermement à la vie future.", read: false, current: true },
    { n: 5, ar: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ', fr: "Ceux-là sont sur le bon chemin de leur Seigneur, et ce sont eux qui réussissent.", read: false },
    { n: 6, ar: 'إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ', fr: "[Mais] certes les infidèles que tu les avertisses ou que tu ne les avertisses pas, ils ne croient pas.", read: false },
  ],
  // admin / users
  adminUsers: [
    { name: 'Aisha B.', email: 'aisha@…', surahs: 23, streak: 41, role: 'user', joined: '2024' },
    { name: 'Yusuf K.', email: 'yusuf@…', surahs: 11, streak: 7, role: 'user', joined: '2025' },
    { name: 'Fatima R.', email: 'fatima@…', surahs: 67, streak: 124, role: 'admin', joined: '2023' },
    { name: 'Idris M.', email: 'idris@…', surahs: 4, streak: 2, role: 'user', joined: '2025' },
    { name: 'Maryam S.', email: 'maryam@…', surahs: 33, streak: 19, role: 'user', joined: '2024' },
  ],
  // calendar — 35 cells (5 weeks Nov)
  calMonth: 'Novembre 2025',
  // coloring — 114 surah grid mini
  coloringPalette: ['#d4a64a', '#5fb088', '#5b9bd5', '#d96b7a', '#a78bdb', '#e89460', '#8da4c0', '#bfa97a'],
};

window.SAMPLE = SAMPLE;
