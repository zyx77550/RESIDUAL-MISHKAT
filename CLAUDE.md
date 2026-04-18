# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mishkat (مِشْكَاة)** is a bilingual (French/Arabic) Islamic learning PWA built with React 19, Vite 6, and Tailwind CSS 4. It is fully client-side — no backend, data persists to IndexedDB via `localforage`. Deployed on Vercel as a static SPA.

Core features: Quran memorization tracking, a canvas-based drawing journal (Diftar), dhikr counter (Tasbih), prayer calendar, goal/kanban board, 45+ gamified badges, and 8 UI themes.

---

## Commands

```bash
npm run dev        # Dev server on port 3000
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # TypeScript type-check only (tsc --noEmit)
npm run clean      # Remove dist/
```

There are **no automated tests** in this project.

---

## Architecture

### State & Persistence

All application state lives in a single `UserData` object (defined in `src/types.ts`) managed in `App.tsx`. It is loaded from IndexedDB on mount and saved back on every change:

```
localforage key: mishkat_user_data
```

There is no context API, Redux, or Zustand — state flows down from `App.tsx` via props. The central update function `updateUserDataWithBadges` (in `App.tsx`) wraps every state mutation to trigger badge evaluation after each change.

### Routing

No router library is used. Navigation is tab-based: `App.tsx` holds an `activeTab` state string and conditionally renders one of 11 section components. The URL does not reflect active tab state.

### Badge System

`src/lib/badgeEngine.ts` exports `checkAndUnlockBadges(userData)`, which evaluates 45+ badge conditions against the full `UserData` snapshot. Called inside `updateUserDataWithBadges` on every state update. Badge unlock triggers confetti via `canvas-confetti` with rarity-based colors (common → legendary).

### Diftar (Drawing App)

`src/components/Diftar.tsx` (~2400 lines) is the most complex component. It implements a canvas drawing app with:
- Multiple brush types using `perfect-freehand` for stroke smoothing
- Pressure/stylus support with palm rejection
- Shape tools, emoji stamps, text layers
- Pinch-to-zoom and panning
- PDF export via `jspdf`
- Per-page stroke history for undo

### External APIs (Dashboard only)

- **Prayer times:** `https://api.aladhan.com/v1/timingsByCity` — fetches 5 daily prayers by city/country
- **Verse of the Day:** `https://api.alquran.cloud/v1/ayah/{n}/ar.alafasy` and `.../fr.hamidullah` — maps day-of-year to one of 6236 verses

### Theming & Bilingual UI

Eight themes are defined as CSS custom property sets in `src/index.css` (e.g., `--brand-primary`, `--brand-surface`, `--brand-text-main`). The active theme is applied via a `data-theme` attribute on `<html>`.

RTL support for Arabic is toggled via a `lang` prop passed through the tree. Components use `dir="rtl"` and conditional `font-family: Amiri` for Arabic text. Fonts loaded from Google Fonts in `index.html`: Amiri (Arabic), Inter (UI), Playfair Display (headers).

### TypeScript Path Alias

`@/*` resolves to the project root (configured in both `tsconfig.json` and `vite.config.ts`).

---

## Key Files

| File | Role |
|---|---|
| `src/types.ts` | All TypeScript interfaces — `UserData`, `Surah`, `Badge`, `DiftarPage`, `Stroke`, `UserSettings` |
| `src/components/App.tsx` | Root: state management, tab routing, badge orchestration, theme/lang toggle |
| `src/lib/badgeEngine.ts` | Badge unlock logic and confetti celebrations |
| `src/data/alBaqaraData.ts` | Al-Baqarah verse data (Arabic + French for 80 verses) |
| `public/sw.js` | Service worker: network-first for HTML, cache-first for assets, cache version `mishkat-cache-v5` |
| `src/index.css` | Tailwind imports + all 8 theme variable definitions + custom animations |

---

## Conventions

- **No comments by default.** The codebase has minimal inline comments.
- **Tailwind CSS 4** via `@tailwindcss/vite` — no `tailwind.config.js`; config is inline via CSS `@theme`.
- **Framer Motion** (`framer-motion` / `motion`) is used for all transitions and animated presence.
- **`clsx` + `tailwind-merge`** via `src/lib/utils.ts` `cn()` helper for conditional class names.
- **Arabic numerals** for Islamic content; `Intl` or `date-fns` for date formatting elsewhere.
- The `express` package in dependencies is unused in the SPA — do not add a server unless explicitly requested.
- When modifying badge logic, all 45 badge IDs are defined in `src/types.ts` and evaluated in `badgeEngine.ts`; keep them in sync.
- When adding a new tab/section, register it in the `activeTab` union type in `src/types.ts` and add the nav entry in `Sidebar.tsx`.
