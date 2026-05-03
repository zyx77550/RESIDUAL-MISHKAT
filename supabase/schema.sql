-- Run this once in your Supabase SQL editor before seeding

CREATE TABLE IF NOT EXISTS quran_verses (
  id BIGSERIAL PRIMARY KEY,
  surah_number SMALLINT NOT NULL,
  ayah_number SMALLINT NOT NULL,
  arabic_text TEXT NOT NULL,
  french_text TEXT NOT NULL,
  UNIQUE (surah_number, ayah_number)
);

ALTER TABLE quran_verses DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_quran_verses_surah ON quran_verses (surah_number);
