---
description: Inspecte le diff Git actuel, vérifie la cohérence des changements et propose un message de commit conforme à Conventional Commits — sans jamais créer le commit.
---

Tu vas préparer un commit pour le projet Data Afrique Hub. Tu ne crées **jamais** le commit automatiquement.

## Étape 1 — Inspecter l'état Git

Exécute les commandes suivantes et analyse leur sortie :
```bash
git status
git diff --staged
git diff
```

Note séparément :
- Les fichiers **stagés** (prêts à committer)
- Les fichiers **modifiés non stagés**
- Les fichiers **non suivis**

## Étape 2 — Vérifier la cohérence thématique

Analyse si les changements stagés forment un ensemble **cohérent et atomique** :
- Appartiennent-ils tous au même sujet fonctionnel ou technique ?
- Y a-t-il un mélange de sujets sans lien (ex. : fix d'un bug + nouvelle feature + refactoring de style) ?

**Si les changements sont mélangés** : refuse de proposer un message unique. Suggère à la place comment les découper en plusieurs commits, en indiquant quels fichiers vont dans quel commit.

**Si aucun fichier n'est stagé** : préviens que `git add` est nécessaire avant de continuer. Tu peux suggérer quels fichiers stager selon les changements visibles.

## Étape 3 — Proposer un message de commit Conventional Commits

Si les changements sont cohérents, propose un message suivant ce format strict :

```
<type>(<scope>): <description courte en français>

[corps optionnel : explication du pourquoi si non évident]
```

**Types autorisés** :
- `feat` — nouvelle fonctionnalité
- `fix` — correction de bug
- `refactor` — restructuration sans changement de comportement
- `style` — mise en forme, espaces (sans impact logique)
- `test` — ajout ou modification de tests
- `docs` — documentation uniquement
- `chore` — tâches de maintenance (deps, config, CI)
- `perf` — amélioration de performance

**Scope** : nom de l'app ou module concerné (`accounts`, `events`, `members`, `auth`, `frontend`, `docker`, etc.)

**Règles de la description** :
- En français, impératif présent (`ajoute`, `corrige`, `supprime`, `refactorise`)
- Maximum 72 caractères sur la première ligne
- Pas de point final

## Étape 4 — Rappel des conventions du projet

Rappelle brièvement les conventions définies dans `CLAUDE.md` qui sont pertinentes pour ce commit :
- Validation uniquement dans les serializers Django (pas dans les views)
- Services métier dans `apps/<module>/services.py`
- TanStack Query côté frontend (pas de `useState` + `useEffect` pour les données API)
- Types TypeScript stricts

Si le diff contient du code qui viole une de ces conventions, signale-le avant de proposer le message.

## Format de sortie attendu

```
## Analyse du diff

**Fichiers stagés** : [liste]
**Cohérence** : ✅ Atomique / ⚠️ Mélangé (voir suggestion de découpage)

## Message de commit proposé

feat(accounts): ajoute l'endpoint de vérification d'email

[corps si nécessaire]

## Commande à exécuter (à toi de la lancer)

git commit -m "feat(accounts): ajoute l'endpoint de vérification d'email"
```

Tu proposes, tu n'exécutes jamais.
