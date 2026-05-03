import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

interface AlquranAyah {
  numberInSurah: number;
  text: string;
}

interface AlquranSurah {
  number: number;
  ayahs: AlquranAyah[];
}

async function seed() {
  console.log('Fetching Quran data from alquran.cloud...');

  const [arabicRes, frenchRes] = await Promise.all([
    fetch('https://api.alquran.cloud/v1/quran/quran-uthmani'),
    fetch('https://api.alquran.cloud/v1/quran/fr.hamidullah'),
  ]);

  if (!arabicRes.ok || !frenchRes.ok) {
    console.error('API fetch failed');
    process.exit(1);
  }

  const [arabicJson, frenchJson] = await Promise.all([
    arabicRes.json(),
    frenchRes.json(),
  ]);

  const arabicSurahs: AlquranSurah[] = arabicJson.data.surahs;
  const frenchSurahs: AlquranSurah[] = frenchJson.data.surahs;

  const rows: { surah_number: number; ayah_number: number; arabic_text: string; french_text: string }[] = [];

  for (let i = 0; i < arabicSurahs.length; i++) {
    const arabic = arabicSurahs[i];
    const french = frenchSurahs[i];
    for (let j = 0; j < arabic.ayahs.length; j++) {
      rows.push({
        surah_number: arabic.number,
        ayah_number: arabic.ayahs[j].numberInSurah,
        arabic_text: arabic.ayahs[j].text,
        french_text: french.ayahs[j].text,
      });
    }
  }

  console.log(`Inserting ${rows.length} verses in batches...`);

  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('quran_verses').upsert(batch, {
      onConflict: 'surah_number,ayah_number',
    });
    if (error) {
      console.error('Batch error:', error.message);
      process.exit(1);
    }
    console.log(`  ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }

  console.log('Seed complete.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
