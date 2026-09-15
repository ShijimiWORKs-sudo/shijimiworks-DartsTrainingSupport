// vite (via vite.singlefile.config.ts) always emits the built HTML using the
// source file's name, i.e. static/index.html. Rename it to embed.html so
// streamlit_app.py has a stable, obviously-named file to reference.
import { existsSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';

const outDir = resolve(import.meta.dirname, '..', 'static');
const from = resolve(outDir, 'index.html');
const to = resolve(outDir, 'embed.html');

if (!existsSync(from)) {
  console.error(`Expected ${from} to exist after \`vite build --config vite.singlefile.config.ts\`.`);
  process.exit(1);
}

renameSync(from, to);
console.log(`Wrote ${to}`);
