import { App } from '@baguettejs/core';
import { logRequest } from '@baguettejs/middlewares';

const port = Number(Bun.env.PORT ?? 3000);
const app = new App({ bodyLimit: 64 * 1024 })
    .use(logRequest)
    .swagger({
        title: 'BaguetteJS Users API',
        version: '1.0.0',
        description: 'Example CRUD API generated automatically from the controllers.',
    });

await app.bootstrap(`${import.meta.dir}/controllers`);
app.listen(port);
