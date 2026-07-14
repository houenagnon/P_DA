---
description: Vérifie la cohérence des contrats API entre le backend et le frontend (routes, méthodes HTTP, payloads, types, formats de réponse).
---

Tu es en train de vérifier la cohérence front/back du projet Data Afrique Hub.

## Étape 1 — Cartographier les endpoints backend réels

Inspecte les fichiers de routes du backend actif :
- Si Django : cherche tous les `urls.py` dans `backend/` et liste chaque route avec sa méthode HTTP, son viewset/view et ses serializers associés.
- Si Node.js (prototype) : lis `backend/Routers/routesGenerale.js` et chaque fichier de routeur enfant.

Pour chaque endpoint, note : `MÉTHODE /chemin/` → champs attendus en entrée + champs retournés en sortie (d'après le serializer ou le controller).

## Étape 2 — Cartographier les appels API côté frontend

Cherche tous les endroits où le frontend appelle l'API :
- `frontend/services/*.service.ts` (nouvelle version)
- `frontend/lib/axios.ts` ou tout fichier configurant Axios
- `front/src/fetchData.js`, `front/src/scripts/*.js` (prototype)

Pour chaque appel, note : `MÉTHODE URL` → champs envoyés + champs lus dans la réponse.

## Étape 3 — Comparer et identifier les écarts

Compare les deux cartographies et identifie :
1. **Routes manquantes** : un appel frontend pointe vers un endpoint qui n'existe pas côté backend.
2. **Méthode HTTP incorrecte** : le frontend utilise `POST` alors que le backend attend `PUT`, etc.
3. **Champs manquants ou mal nommés** : le frontend envoie `firstName` mais le backend attend `first_name`.
4. **Types incohérents** : le backend renvoie une date ISO string, le frontend attend un objet `Date`.
5. **Format de réponse divergent** : le backend enveloppe dans `{ data: [...] }`, le frontend lit directement `[...]`.
6. **Endpoints backend non consommés** : endpoints disponibles mais jamais appelés côté frontend.

## Étape 4 — Proposer le plan correctif minimal

Pour chaque écart identifié, propose **la correction la plus petite possible** :
- Côté frontend uniquement si c'est une erreur de mapping triviale.
- Côté backend uniquement si le frontend a raison et le backend est le problème.
- Les deux si c'est un désaccord de conception.

Ne propose pas de refactoring au-delà de ce qui est nécessaire pour corriger les écarts.

## Format de sortie attendu

```
## Résumé des écarts

| # | Type d'écart | Frontend | Backend | Correction proposée |
|---|-------------|----------|---------|---------------------|
| 1 | Route manquante | GET /api/v1/members/me/ | ❌ non défini | Créer la route dans accounts/urls.py |
| 2 | Champ mal nommé | envoie `firstName` | attend `first_name` | Corriger le serializer ou le service TS |

## Aucun écart détecté
(si tout est cohérent)
```

Exécute uniquement les vérifications pertinentes en fonction de ce qui est réellement présent dans le projet. Si une partie (frontend ou backend) n'est pas encore implémentée, signale-le clairement sans bloquer.
