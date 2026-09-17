import { Glob } from 'bun';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * Scanne automatiquement les controllers à partir du rootDir défini dans tsconfig.json
 */
export async function scanControllersFromTsConfig(): Promise<string[]> {
    const tsconfigPath = path.resolve("tsconfig.json");

    if (!(await Bun.file(tsconfigPath).exists())) {
        throw new Error("❌ Fichier tsconfig.json introuvable à la racine du projet");
    }

    const tsconfig = JSON.parse(await readFile(tsconfigPath, 'utf8'));
    const rootDir = tsconfig.compilerOptions?.rootDir || "src";
    const baseDir = path.resolve(rootDir, "controllers");

    return scanControllers(baseDir);
}

/**
 * Scanne récursivement un dossier pour importer tous les fichiers *.controller.ts/js
 */
export async function scanControllers(baseDir: string): Promise<string[]> {
    const absoluteBaseDir = path.resolve(baseDir);
    try {
        if (!(await stat(absoluteBaseDir)).isDirectory()) return [];
    } catch {
        return [];
    }
    const files = Array.from(new Glob('**/*.controller.{ts,js}').scanSync({
        cwd: absoluteBaseDir,
        absolute: true,
        onlyFiles: true,
    })).sort();

    // Deterministic loading makes route precedence predictable, while imports stay parallel.
    await Promise.all(files.map(async (filePath) => {
        await import(filePath);
        console.log(`Controller loaded: ${path.basename(filePath)}`);
    }));
    return files;
}
