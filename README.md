# BaguetteJS

Monorepo Bun/TypeScript de BaguetteJS :

- `packages/utils` — utilitaires et scanner de contrôleurs ;
- `packages/core` — runtime HTTP, DI, routing, validation et OpenAPI ;
- `packages/middlewares` — middlewares prêts à l'emploi ;
- `packages/sdk` — génération de SDK ;
- `examples/api` — exemple d'API CRUD complète.

## Développement

```bash
bun install
bun run check
bun run build
bun run --cwd examples/api dev
```

Les packages internes utilisent des versions semver compatibles pendant le développement ; Bun les lie localement quand elles correspondent aux versions du workspace, et npm reçoit des dépendances publiables.

## Release npm

Les versions sont maintenues ensemble avec Changesets :

```bash
bun run changeset
bun run version-packages
git add .
git commit -m "chore: release packages"
git tag 1.0.0 # `v1.0.0` fonctionne aussi
git push origin main --tags
```

La CI publie les packages avec `NPM_TOKEN` dès qu'un tag `X.Y.Z` ou `vX.Y.Z` est poussé. Le tag doit correspondre à la version de tous les packages. Le dépôt GitHub doit être configuré avec ce secret et le compte npm doit avoir accès à l'organisation `@baguettejs`.
