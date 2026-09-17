import type { MiddlewareHandler } from '@baguettejs/core';

export const logRequest: MiddlewareHandler = async (req, res: any, next) => {
    const start = performance.now();
    try {
        await next();
    } finally {
        const durationMs = performance.now() - start;
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.url} → ${res.statusCode} (${durationMs.toFixed(1)}ms)`
        );
    }
};
