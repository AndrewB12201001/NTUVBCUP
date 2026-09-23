import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const allowed = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.woff', '.woff2']);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
async function copy(relative) {
  const target = join(output, relative);
  await mkdir(dirname(target), { recursive: true });
  await cp(join(root, relative), target);
}
async function walk(relative) {
  for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
    const path = join(relative, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && allowed.has(extname(entry.name))) await copy(path);
  }
}
for (const file of ['index.html', 'login.html', '404.html', '_headers', '_routes.json']) await copy(file);
await walk('src');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const tournamentSlug = process.env.NTUCUP_TOURNAMENT_SLUG || 'ntu-cup';
const runtimeConfig = `window.NTUCUP_CONFIG = Object.freeze(${JSON.stringify({
  supabaseUrl,
  supabasePublishableKey,
  tournamentSlug
}, null, 2)});\n`;
await writeFile(join(output, 'src/utility/runtime-config.js'), runtimeConfig, 'utf8');

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn('Supabase runtime configuration is empty. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Cloudflare Pages.');
}
console.log('Static website ready in dist/ (JSON backups and repository files excluded).');
