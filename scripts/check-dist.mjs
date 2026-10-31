// Fails when a package's committed dist/ no longer matches a fresh tsc build.
// Usage: node scripts/check-dist.mjs <package-dir>
import { execFileSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const PKG = path.resolve(process.argv[2] ?? '.');
const NAME = path.basename(PKG);
const DIST = path.join(PKG, 'dist');
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');

const fresh = await mkdtemp(path.join(os.tmpdir(), `${NAME}-`));
try {
  execFileSync(process.execPath, [tsc, '-p', path.join(PKG, 'tsconfig.json'), '--outDir', fresh], { stdio: 'inherit' });
  const expected = (await readdir(fresh)).sort();
  const actual = (await readdir(DIST).catch(() => [])).sort();
  const stale = expected.filter((file) => !actual.includes(file));
  for (const file of expected) {
    if (stale.includes(file)) continue;
    const [a, b] = await Promise.all([readFile(path.join(fresh, file), 'utf8'), readFile(path.join(DIST, file), 'utf8')]);
    if (a !== b) stale.push(file);
  }
  stale.push(...actual.filter((file) => !expected.includes(file)));
  if (stale.length) {
    console.error(`[${NAME}] stale dist: ${stale.join(', ')}. Run npm run build --workspace=${NAME}.`);
    process.exit(1);
  }
  console.log(`[${NAME}] dist is up to date`);
} finally {
  await rm(fresh, { recursive: true, force: true });
}
