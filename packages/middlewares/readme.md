# ⚙️ @baguettejs/middlewares

The `@baguettejs/middlewares` package provides middleware utilities and decorators for the **BaguetteJS** framework.  
It allows developers to easily define, register, and execute middlewares at both **global** and **route** levels.

---

## 📦 Installation

```bash
bun add @baguettejs/middlewares
```

or

```bash
bun add @baguettejs/middlewares
```

---

## 🧠 Features

### 🧩 Middleware Decorator

Use the `@Middleware()` decorator to attach middleware functions to controllers or specific routes.  
A middleware can modify the request, perform checks, or log information before a controller executes.

#### Example

```ts
import { Controller, Get, Middleware } from '@baguettejs/core';

function logger(req: any, res: any, next: Function) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

@Controller('/users')
export class UserController {
  @Get('/')
  @Middleware(logger)
  getAll() {
    return [{ name: 'Alice' }, { name: 'Bob' }];
  }
}
```

🧩 Result:
- Every request to `/users` will trigger the `logger` middleware before executing the controller.

---

### 🌍 Global Middlewares

You can also register global middlewares that run before every route:

```ts
import { App } from '@baguettejs/core';

function cors(req: any, res: any, next: Function) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}

const app = new App();
app.use(cors);
await app.bootstrap('src/controllers');
app.listen(3000);
app.bootstrap('src/controllers');
```

---

## ⚙️ Middleware Signature

```ts
export type NextFunction = () => Promise<void> | void;

export type MiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;
```

Each middleware receives:
- `req` — the request object
- `res` — the response object
- `next()` — a function to call the next middleware (or continue to the controller)

---

## 🔗 Related Packages

- [`@baguettejs/core`](https://github.com/baguettejs/core) — Main framework runtime and routing.
- [`@baguettejs/utils`](https://github.com/baguettejs/utils) — Shared reflection and scanning utilities.

---

## 🧑‍💻 Contributing

Pull requests are welcome!  
If you’d like to contribute a custom middleware (e.g. logging, auth, CORS, body parsing), feel free to open an issue or PR.

---

## 🪪 License

MIT © 2025 [BaguetteJS](https://github.com/baguettejs)
