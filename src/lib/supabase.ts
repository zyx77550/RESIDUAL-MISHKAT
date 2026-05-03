/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

export interface QuranVerse {
  id: number;
  surah_number: number;
  ayah_number: number;
  arabic_text: string;
  french_text: string;
}
