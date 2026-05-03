# Mishkat - Compagnon Spirituel

Mishkat est une application web immersive conçue pour accompagner les musulmans dans leur cheminement spirituel quotidien. Elle combine des outils de mémorisation du Coran, de suivi d'objectifs, de dhikr et un journal créatif (Diftar).

## Fonctionnalités

- **Tableau de Bord :** Vue d'ensemble de votre progression et citations inspirantes.
- **Mémorisation :** Suivi détaillé de la mémorisation des 114 sourates avec indicateurs de difficulté.
- **Diftar (Journal) :** Un espace de dessin et de prise de notes avec des outils variés (plume, surligneur, stickers).
- **Objectifs :** Gestionnaire de tâches pour vos ambitions spirituelles et personnelles.
- **Tasbih :** Compteur de dhikr interactif avec objectifs personnalisables.
- **Calendrier :** Suivi des prières quotidiennes et de la lecture du Coran.
- **Badges :** Système de récompenses pour célébrer vos étapes importantes.
- **Paramètres Personnalisés :** Thèmes (Clair, Sombre, Sépia), taille de police et rappels.

## Installation

1. Clonez le dépôt :
   ```bash
   git clone <votre-url-github>
   cd mishkat
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## Déploiement sur Vercel

Cette application est prête à être déployée sur [Vercel](https://vercel.com/).

1. Poussez votre code sur un dépôt GitHub.
2. Connectez votre compte GitHub à Vercel.
3. Importez le projet et déployez.

Le fichier `vercel.json` est déjà configuré pour gérer le routage SPA (Single Page Application).

## Technologies Utilisées

- **React 19**
- **Vite**
- **Tailwind CSS 4**
- **Framer Motion** (Animations)
- **Lucide React** (Icônes)
- **date-fns** (Gestion des dates)
- **jspdf** (Export PDF)

## Supabase — Coran

### Première installation

1. Dans le **SQL Editor** de ton dashboard Supabase, exécute `supabase/schema.sql`
2. Lance ensuite le seed :
   ```bash
   npm run seed
   ```
   Ce script télécharge le Coran complet (arabe Uthmani + traduction Hamidullah) et insère les ~6 236 versets dans la table `quran_verses`.

### Variables d'environnement (`.env.local`)
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## Roadmap — Section Coran

- [ ] **Recherche globale** — recherche dans toutes les sourates à la fois
- [ ] **Vue signets** — page dédiée listant tous les versets marqués (avec filtre par sourate)
- [ ] **Mode Hafiz** — lecture arabe seule sans traduction pour renforcer la mémorisation
- [ ] **Audio** — intégration de la récitation (API alquran.cloud audio ou EveryAyah)
- [ ] **Cache offline** — mise en cache IndexedDB des sourates déjà consultées
- [ ] **Partage** — exporter un verset en image (canvas → PNG)
- [ ] **Tafsir** — colonne tafsir optionnelle (Ibn Kathir FR)
- [ ] **Navigation par Juz** — vue par Juz en plus de la vue par sourate
- [ ] **Historique** — rouvrir automatiquement la dernière sourate consultée
- [ ] **Statistiques** — versets lus / favoris par semaine dans le dashboard

---

## Licence

Ce projet est sous licence MIT.
