# Mishkat — Système de design (refonte 2025)

> Une lanterne pour la mémoire du cœur.

Ce document explique **comment le design fonctionne** et **comment ajouter une nouvelle section** en restant cohérent avec le reste de l'app.

---

## 1. Philosophie

Mishkat est une app de mémorisation du Coran. Le design suit 4 principes :

1. **Calme spirituel** — fond très sombre, beaucoup d'espace, ornements géométriques discrets en arrière-plan (pattern à 2.5% d'opacité). On ne décore pas, on encadre.
2. **La calligraphie arabe est l'œuvre d'art** — police Amiri Quran, taille généreuse (24-36px), traitée comme du contenu héros et non comme un détail.
3. **Hiérarchie éditoriale** — Fraunces (serif) en titres légers (font-weight 300), Inter (sans) pour l'UI. Les chiffres sont en serif, les labels en majuscules espacées.
4. **Une seule couleur d'accent par thème** — pas de gradient psychédélique, pas de salade de couleurs. Chaque thème a UN accent + UN accent vif, et tout le reste est dérivé.

---

## 2. Architecture des fichiers

```
Mishkat Refonte.html        → Entry point, monte tous les écrans dans un design canvas
tokens.jsx                  → window.THEMES = { gold, sakura, azur, emerald }
icons.jsx                   → window.Icon, window.Icons (paths SVG), window.LanternMark, window.Wordmark
sample-data.jsx             → window.SAMPLE (données réalistes pour les previews)
primitives.jsx              → AppFrame, AppSidebar, Card, Pill, PrimaryBtn, GhostBtn, SectionLabel, useT()
screen-dashboard.jsx        → DashboardScreen (+ Ring, Stat helpers)
screen-memo-cal.jsx         → MemorizationScreen, CalendarScreen
screen-goals-badges-tasbih.jsx
screen-coloring-diftar-kanban.jsx
screen-baqara-settings-admin-auth.jsx
```

Chaque fichier `screen-*.jsx` exporte ses composants sur `window` (Babel ne partage pas la portée entre tags `<script>`).

---

## 3. Tokens — les 4 thèmes

Tous les thèmes ont **la même structure** (cf. `tokens.jsx`). Pour en ajouter un, copier un objet existant et remplacer **uniquement** `accent`, `accentBright`, `accentSoft`, `glow` (et la teinte des fonds si besoin).

```js
{
  name: 'Sakura',
  bg: '#0e0709',          // fond le plus sombre (toute l'app)
  bgSoft: '#160a0e',      // sidebar, hero panels en retrait
  card: '#1d0e13',        // cards
  cardElev: '#241319',    // éléments dans une card
  ink: '#f7e3e6',         // texte principal
  inkDim: '#b08891',      // texte secondaire
  inkMute: '#5a3d44',     // labels, métadonnées
  line: '#2c1a20',        // borders normales
  lineSoft: '#22141a',    // borders subtiles (séparateurs intra-card)
  accent: '#d96b7a',      // couleur de marque
  accentBright: '#f08a99',// version vive (titres, hovers)
  accentSoft: '#7a2f3c',  // version sourde (ornements, barres)
  glow: 'rgba(217,107,122,0.18)',
}
```

**Règle d'or** : un nouveau composant ne hardcode JAMAIS `#d4a64a`. Il fait `const t = useT()` et utilise `t.accent`, `t.ink`, etc. Comme ça il fonctionne dans les 4 thèmes automatiquement.

### Les 4 thèmes inclus

| Clé        | Nom        | Accent  | Usage suggéré                          |
|------------|-----------|---------|----------------------------------------|
| `gold`     | Mishkat Or | `#d4a64a` | Thème par défaut, calme et spirituel  |
| `sakura`   | Sakura     | `#d96b7a` | Doux, féminin, Ramadan                 |
| `azur`     | Azur       | `#5b9bd5` | Nocturne, contemplatif (Layla al-Qadr) |
| `emerald`  | Émeraude   | `#5fb088` | Croissance, jardin, médine             |

---

## 4. Typographie

- **Fraunces** (serif éditoriale) — titres, chiffres, valeurs. Toujours `font-weight: 300` ou `400`. JAMAIS bold sauf accent rare.
- **Inter** (sans) — UI : boutons, labels, lignes de table, navigation.
- **Amiri Quran** (serif arabe avec ligatures) — uniquement pour les versets et phrases d'invocation. Direction `rtl`.

Échelles utilisées :
- Titre de page : `Fraunces 32 / 300 / -0.02em`
- Subtitle (au-dessus du titre) : `10.5 / inkMute / 0.18em uppercase`
- Section label : `10.5 / inkMute / 0.18em uppercase`
- Body : `13 / Inter`
- Stat (gros chiffre) : `Fraunces 22-30 / 300`
- Verset : `Amiri Quran 24-36 / line-height 1.7-2`

---

## 5. Composants partagés (`primitives.jsx`)

| Composant | Usage |
|-----------|-------|
| `<AppFrame active={id} subtitle title headerRight>` | Cadre 1280×820 avec sidebar + header + zone de contenu. **Tout écran principal commence par AppFrame.** |
| `<AppSidebar active={id}>` | Sidebar avec lanterne + streak chip + 12 items de menu. Géré par AppFrame. |
| `<Card padding style>` | Carte standard sur fond `t.card` avec border `t.line` et radius 12. |
| `<Pill>` | Petit chip d'état (en cours, mémorisé…). |
| `<PrimaryBtn icon>` | CTA, fond `t.accent`. |
| `<GhostBtn icon>` | Action secondaire, fond transparent, border `t.line`. |
| `<SectionLabel right>` | Le label majuscule au-dessus d'une zone. |
| `useT()` | Hook qui rend le thème courant. |

---

## 6. Comment ajouter une nouvelle section

Mettons que tu veux ajouter un écran "Hadith" qui montre 40 hadiths à apprendre.

### Étape 1 — Ajouter l'item dans la sidebar

Ouvrir `primitives.jsx`, dans `AppSidebar`, ajouter une entrée à `items` :

```js
{ id: 'hadith', label: 'Hadith', icon: <Icon d={Icons.book} /> },
```

### Étape 2 — Créer le fichier `screen-hadith.jsx`

```jsx
const HadithScreen = () => {
  const t = useT();
  return (
    <AppFrame
      active="hadith"
      subtitle="40 hadiths · An-Nawawi"
      title="Hadith"
      headerRight={<PrimaryBtn icon={<Icon d={Icons.plus} size={13}/>}>Ajouter</PrimaryBtn>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {hadiths.map(h => (
          <Card key={h.id}>
            <SectionLabel>Hadith {h.id}</SectionLabel>
            <div style={{ fontFamily: 'Amiri Quran, serif', fontSize: 22, color: t.ink, direction: 'rtl', lineHeight: 1.8, marginTop: 8 }}>{h.ar}</div>
            <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 13, color: t.inkDim, marginTop: 10 }}>« {h.fr} »</div>
            <div style={{ fontSize: 10.5, color: t.accentBright, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 8 }}>Rapporté par {h.source}</div>
          </Card>
        ))}
      </div>
    </AppFrame>
  );
};

window.HadithScreen = HadithScreen;
```

### Étape 3 — Monter l'écran dans `Mishkat Refonte.html`

Ajouter le tag de script :
```html
<script type="text/babel" src="screen-hadith.jsx"></script>
```

Et dans `<App>`, ajouter un artboard :
```jsx
<DCArtboard id="hadith" label="Hadith" width={1280} height={820}><HadithScreen/></DCArtboard>
```

### Étape 4 — (Optionnel) Ajouter des données dans `sample-data.jsx`

```js
SAMPLE.hadiths = [
  { id: 1, ar: '...', fr: '...', source: 'Boukhari & Muslim' },
  ...
];
```

C'est tout. Le nouvel écran fonctionne automatiquement dans les 4 thèmes.

---

## 7. Règles à respecter quand tu ajoutes un écran

1. **Toujours `AppFrame`** comme conteneur racine — pour la sidebar, le pattern de fond, et la cohérence du header.
2. **Toujours `useT()`** pour les couleurs. Aucun hex en dur.
3. **Pas de gradient violent** — un gradient subtil sur 8% d'opacité max sur les hero panels, c'est tout.
4. **Pas d'emoji** — ils sont incohérents entre OS et cassent l'aspect spirituel. Utiliser les icônes de `Icons` ou un placeholder SVG.
5. **Espace** — paddings de 14-22px sur les cards, gaps de 10-14px entre les cards. Ne jamais coller les éléments.
6. **Hiérarchie** — un seul élément "héros" par écran (le mihrab sur le dashboard, le compteur sur le tasbih, le verset 4 sur Al-Baqarah). Le reste sert le héros.
7. **Texte arabe** — toujours `direction: rtl`, `Amiri Quran`, `line-height >= 1.6`.
8. **Datas** — utiliser `SAMPLE` plutôt que d'inventer. Si tu inventes, mets des nombres réalistes (pas que des 0).

---

## 8. Migration depuis le code existant

Le repo `RESIDUAL-MISHKAT` utilise actuellement Tailwind avec des variables CSS (`var(--brand-primary)`, etc.). Pour migrer :

1. Remplacer les variables CSS par les tokens de `tokens.jsx` (mapper `--brand-primary` → `t.accent`).
2. Remplacer les composants Sidebar et Header existants par `AppFrame` (qui les inclut).
3. Garder la logique (état, supabase, badges engine) — c'est uniquement le **layer de présentation** qui change.
4. Le sélecteur de thème dans `Settings.tsx` doit être mis à jour pour exposer les 4 thèmes (gold, sakura, azur, emerald) au lieu des 14 actuels.

---

## 9. Ce qui reste à designer

Si l'app évolue, voici les écrans qu'il faudra ajouter avec ces règles :
- **Onboarding** (3-4 écrans) — accueil, choix de niveau, premier objectif, c'est parti
- **Détail sourate** — vue plein écran d'une sourate avec tous les versets en mode lecture
- **Profil public** — partage de progression
- **Stats avancées** — graphes par mois, par juz
- **Mode hors-ligne** — état déconnecté

Suivre la même structure : `screen-*.jsx`, `useT()`, `AppFrame`, monter dans le canvas.

---

**Artisans du savoir** : Rahima & hamda_wa_chakra
