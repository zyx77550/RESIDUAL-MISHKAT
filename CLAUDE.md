# CLAUDE.md — Instructions permanentes pour Claude Code

## Git : commit + push après chaque phase

**RÈGLE OBLIGATOIRE** : après chaque modification de fichier(s), toujours :
1. `git add <fichiers modifiés>`
2. `git commit -m "message descriptif"`
3. `git push -u origin claude/diftar-scroll-helper-IzyZ6`

Ne jamais laisser des changements non commités entre deux phases de travail.
Le stop-hook bloque la session si des changements sont non commités ou non pushés.

## Branche de développement

Toujours travailler sur : `claude/diftar-scroll-helper-IzyZ6`

## Stack technique

- React + TypeScript PWA
- Thème via `useT()` — tokens : `t.bg`, `t.bgSoft`, `t.card`, `t.cardElev`, `t.ink`, `t.inkDim`, `t.inkMute`, `t.accent`, `t.accentBright`, `t.accentSoft`, `t.line`, `t.lineSoft`
- Hook responsive : `useIsNarrow()` (< 900px) depuis `./ui`
- Hook mobile : `useIsMobile()` (< 768px) depuis `./ui`
- Référence HTML : `/home/user/RESIDUAL-MISHKAT/refonte/`
