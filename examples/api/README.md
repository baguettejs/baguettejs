# BaguetteJS — exemple d'API réelle

Cette application montre une API REST CRUD complète avec :

- injection de `UserService` dans `UsersController` ;
- recherche avec `GET /users?q=alice` ;
- création et modification avec validation JSON ;
- paramètres dynamiques (`/users/:id`) ;
- réponses `201`, `204`, `400` et `404` ;
- validation centralisée avec les schémas `v.object(...)` du core ;
- middleware de journalisation ;
- serveur lancé directement avec Bun.

## Lancer

Depuis la racine du projet :

```bash
bun install
bun run build
bun run --cwd examples/api dev
```

L'API est disponible sur `http://localhost:3000`.

La documentation est disponible sur [`/docs`](http://localhost:3000/docs) et le document OpenAPI brut sur [`/openapi.json`](http://localhost:3000/openapi.json). Les routes sont découvertes automatiquement depuis `@Get`, `@Post`, `@Patch`, etc. Le deuxième argument optionnel de ces décorateurs permet de décrire le résumé, les tags et les réponses, sans annotation Swagger supplémentaire. Les modèles de réponse et les bodies sont générés depuis les types TypeScript des signatures ; les schémas runtime servent à valider les données.

## Essayer

```bash
curl http://localhost:3000/users
curl 'http://localhost:3000/users?q=alice'

curl -X POST http://localhost:3000/users \
  -H 'content-type: application/json' \
  -d '{"name":"Charlie","email":"charlie@example.com"}'

curl -X PATCH http://localhost:3000/users/1 \
  -H 'content-type: application/json' \
  -d '{"name":"Alice Updated"}'

curl -i -X DELETE http://localhost:3000/users/2
```
