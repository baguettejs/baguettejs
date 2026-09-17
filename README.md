# 🥖 BaguetteJS

### Le backend TypeScript qui va droit au but.

BaguetteJS est un framework backend **Bun-first**, pensé pour créer des APIs TypeScript lisibles, rapides et agréables à maintenir.

Pas de module à configurer pendant une heure. Pas de décorateurs Swagger à recopier partout. Tu déclares tes routes avec `@Get`, `@Post`, `@Patch` et `@Delete`, tu écris des types TypeScript normaux, et le framework s’occupe du reste : routage, injection, validation, erreurs HTTP et documentation OpenAPI.

[![CI](https://github.com/baguettejs/baguettejs/actions/workflows/ci.yml/badge.svg)](https://github.com/baguettejs/baguettejs/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Une API propre commence par du code simple. BaguetteJS essaie de ne jamais te faire écrire deux fois la même information.

## Pourquoi BaguetteJS ?

- **Bun dès le départ** : démarrage rapide, installation rapide et APIs natives modernes.
- **Des contrôleurs lisibles** : les routes ressemblent à des méthodes TypeScript normales.
- **Swagger généré automatiquement** : les routes viennent de `@Get`, `@Post`, `@Patch`, etc. ; les modèles viennent de tes types TypeScript.
- **Validation sans usine à gaz** : les schémas `v.object(...)` valident les entrées et peuvent aussi alimenter OpenAPI.
- **Erreurs centralisées** : lance `NotFoundError` ou `BadRequestError`, le core renvoie une réponse JSON cohérente.
- **Injection de dépendances minimale** : un service, un constructeur, c’est tout.
- **Pensé pour la performance** : routage compilé, lookup direct des routes statiques et analyse TypeScript chargée seulement quand Swagger est activé.
- **Monorepo prêt à publier** : core, utilitaires, middlewares et SDK sont versionnés et publiés ensemble.

## En quelques lignes

Voici une vraie route typée. Le type `User` est utilisé par le service, la réponse HTTP et la documentation Swagger.

```ts
import 'reflect-metadata';
import {
  App,
  Body,
  Controller,
  Get,
  NotFoundError,
  Param,
  Post,
  Query,
  Service,
  v,
} from '@baguettejs/core';

export type User = {
  id: number;
  name: string;
  email: string;
};

const CreateUserSchema = v.object({
  name: v.string({ minLength: 2, trim: true }),
  email: v.string({ format: 'email', trim: true, lowercase: true }),
});

@Service()
class UserService {
  private readonly users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
  ];

  list(search?: string): User[] {
    if (!search) return this.users;
    const query = search.toLowerCase();
    return this.users.filter((user) => user.name.toLowerCase().includes(query));
  }

  findById(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(input: Omit<User, 'id'>): User {
    const user = { id: this.users.length + 1, ...input };
    this.users.push(user);
    return user;
  }
}

@Controller('/users')
class UsersController {
  constructor(private readonly users: UserService) {}

  @Get('/', { summary: 'List users', tags: ['Users'] })
  list(@Query('q') search?: string): { data: User[]; count: number } {
    const data = this.users.list(search);
    return { data, count: data.length };
  }

  @Get('/:id', { summary: 'Get one user', tags: ['Users'] })
  findOne(@Param('id') rawId: string): User {
    const user = this.users.findById(Number(rawId));
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  @Post('/', { summary: 'Create a user', tags: ['Users'] })
  create(@Body() body: Omit<User, 'id'>): User {
    return this.users.create(CreateUserSchema.parse(body));
  }
}

const app = new App().swagger({
  title: 'Users API',
  version: '1.0.0',
});

await app.bootstrap(`${import.meta.dir}/controllers`);
app.listen(3000);
```

Ce code donne immédiatement :

- `GET /users?q=alice` pour rechercher un utilisateur ;
- `GET /users/:id` avec gestion d’erreur `404` ;
- `POST /users` avec validation du body ;
- `GET /openapi.json` pour le document OpenAPI ;
- `GET /docs` pour Swagger UI.

## Installation

```bash
bun add @baguettejs/core reflect-metadata
```

Pour activer les décorateurs TypeScript, vérifie que ton `tsconfig.json` contient :

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true
  }
}
```

Puis importe les métadonnées une seule fois au démarrage :

```ts
import 'reflect-metadata';
```

## Swagger sans annotations supplémentaires

Les décorateurs de route acceptent seulement les informations utiles à l’équipe : résumé, description, tags, statut et réponses particulières.

```ts
@Patch('/:id', {
  summary: 'Update a user',
  tags: ['Users'],
  responses: {
    404: { description: 'User not found' },
  },
})
update(
  @Param('id') id: string,
  @Body() body: Partial<Omit<User, 'id'>>,
): User {
  // ...
}
```

Le core analyse la signature TypeScript pour générer les schémas OpenAPI : `User`, `Omit<User, 'id'>`, `Partial<User>`, les tableaux, les unions courantes et les types imbriqués sont pris en compte. Tu peux toujours fournir un `body.schema` ou un `response.schema` lorsqu’un cas très spécifique l’exige.

La génération des types est activée uniquement avec `.swagger()` ou `.openapi()`. Sans documentation, le runtime n’analyse pas ton projet TypeScript au démarrage.

## Validation et erreurs propres

La validation est explicite à l’endroit où les données entrent dans ton application, sans dépendance externe obligatoire :

```ts
import { NotFoundError, v } from '@baguettejs/core';

const UserPatchSchema = v.object({
  name: v.string({ minLength: 2, trim: true }).optional(),
  email: v.string({ format: 'email', trim: true, lowercase: true }).optional(),
});

const input = UserPatchSchema.parse(body);
if (!user) throw new NotFoundError('User not found');
```

Les erreurs sont capturées par `App` et renvoyées avec un format stable :

```json
{
  "status": 400,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": []
}
```

Tu peux donc garder tes contrôleurs concentrés sur le métier, sans répéter des blocs `try/catch` dans chaque méthode.

## Les packages

| Package | Rôle |
| --- | --- |
| `@baguettejs/core` | Application HTTP, contrôleurs, DI, routing, validation et OpenAPI |
| `@baguettejs/utils` | Scanner de contrôleurs et utilitaires internes |
| `@baguettejs/middlewares` | Middlewares réutilisables, dont le logger de requêtes |
| `@baguettejs/sdk` | Génération de SDK TypeScript à partir d’une API BaguetteJS |

Le dossier [`examples/api`](examples/api) contient une API CRUD complète avec `User`, service, validation, recherche, erreurs `404`, middleware de logs et Swagger.

## Démarrer l’exemple réel

```bash
git clone https://github.com/baguettejs/baguettejs.git
cd baguettejs
bun install
bun run build
bun run --cwd examples/api dev
```

Ensuite ouvre :

- [`http://localhost:3000/docs`](http://localhost:3000/docs) pour essayer l’API dans Swagger UI ;
- [`http://localhost:3000/openapi.json`](http://localhost:3000/openapi.json) pour voir le document brut ;
- [`examples/api/README.md`](examples/api/README.md) pour les commandes `curl`.

## Développement du monorepo

```bash
bun install
bun run check
bun run build
```

Les workspaces Bun relient automatiquement les packages locaux pendant le développement, tout en conservant des dépendances semver publiables dans les manifests npm.

## Publier une version

Les quatre packages sont versionnés ensemble avec Changesets :

```bash
bun run changeset
bun run version-packages
git add .
git commit -m "chore: release packages"
git tag 1.0.0 # v1.0.0 fonctionne aussi
git push origin main --tags
```

La CI vérifie que le tag correspond à la version des packages, construit le projet et publie les versions non présentes sur npm avec provenance GitHub. Le dépôt doit contenir le secret GitHub `NPM_TOKEN` avec les droits de publication sur l’organisation `baguettejs`.

## Philosophie

BaguetteJS ne cherche pas à cacher TypeScript derrière une montagne d’abstractions. L’objectif est plus simple : fournir les briques essentielles d’un backend moderne, avec une expérience suffisamment légère pour passer de zéro à une API fonctionnelle sans perdre le contrôle de son code.

**Écris tes types. Déclare tes routes. Lance ton serveur.**

## Licence

MIT © Cyprien Tertrais
