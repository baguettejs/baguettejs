import { scanControllers } from '@baguettejs/utils';
import { getParamsMetadata, getRegisteredControllers, getRoutes } from '@baguettejs/core';
import * as path from 'node:path';
import { mkdir } from 'node:fs/promises';

export interface SdkGenerationOptions {
    controllersPath?: string;
    outputDir?: string;
}

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function routeMethodName(handler: string | symbol, method: string, used: Set<string>): string {
    const base = `${method.toLowerCase()}${capitalize(String(handler))}`.replace(/[^a-zA-Z0-9_$]/g, '');
    let name = base || method.toLowerCase();
    let suffix = 2;
    while (used.has(name)) name = `${base}${suffix++}`;
    used.add(name);
    return name;
}

export async function generateSdk(options: SdkGenerationOptions = {}): Promise<void> {
    const controllersPath = options.controllersPath ?? 'src/controllers';
    const outputDir = path.resolve(options.outputDir ?? 'src/generated');
    await scanControllers(controllersPath);

    const routes = getRegisteredControllers().flatMap((controller) => {
        const prefix = Reflect.getMetadata('prefix', controller.constructor) || '';
        return getRoutes(controller.constructor).map((route) => ({
            ...route,
            path: `/${prefix}/${route.path}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/',
            params: getParamsMetadata(controller, route.handler),
        }));
    });

    const usedNames = new Set<string>();
    let clientCode = `// AUTO-GENERATED FILE - DO NOT EDIT\nexport class ApiClient {\n  constructor(private readonly baseUrl: string) {}\n`;

    for (const route of routes) {
        const methodName = routeMethodName(route.handler, route.method, usedNames);
        const pathParams = route.params
            .filter((param) => param.type === 'param' && param.name)
            .map((param) => param.name!);
        const hasBody = route.params.some((param) => param.type === 'body');
        const paramsType = pathParams.length
            ? `{ ${pathParams.map((name) => `${name}: string`).join('; ')} }`
            : 'Record<string, never>';
        const signature = pathParams.length
            ? `params: ${paramsType}${hasBody ? ', body?: unknown' : ''}`
            : hasBody ? 'body?: unknown' : '';
        const url = route.path.replace(/:([A-Za-z0-9_]+)/g, (_, name: string) => `\${encodeURIComponent(params.${name})}`);
        const requestUrl = pathParams.length
            ? `\`${'${this.baseUrl}'}${url}\``
            : `\`${'${this.baseUrl}'}${route.path}\``;

        clientCode += `
  async ${methodName}(${signature}): Promise<unknown> {
    const res = await fetch(${requestUrl}, {
      method: '${route.method}',
      headers: ${hasBody ? "{ 'Content-Type': 'application/json' }" : '{}'},
      ${hasBody ? 'body: JSON.stringify(body),' : ''}
    });
    if (!res.ok) throw new Error(\`Request failed: \${res.status}\`);
    if (res.status === 204) return undefined;
    return res.json();
  }\n`;
    }

    clientCode += '}\n';

    await mkdir(outputDir, { recursive: true });
    await Bun.write(path.join(outputDir, 'client.ts'), clientCode);
}
