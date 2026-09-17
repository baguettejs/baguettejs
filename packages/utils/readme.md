# 🧩 @baguettejs/utils

The `@baguettejs/utils` package provides low-level utilities shared across the **BaguetteJS** framework.  
It is designed to be lightweight, dependency-free, and focused on core features that other packages (`@baguettejs/core`, `@baguettejs/middlewares`, etc.) can rely on.

---

## 📦 Installation

```bash
bun add @baguettejs/utils
```

## Scanner

```ts
import { scanControllers } from '@baguettejs/utils';

await scanControllers('src/controllers');
```
