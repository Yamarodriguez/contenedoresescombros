// SEO: titulo y descripcion de cada pagina en dist/ iguales a los de la web viva
// (src/data/seo.json), og:image presente y todas las URL en sitemap.xml.
import fs from 'node:fs';
import path from 'node:path';

const seo = JSON.parse(fs.readFileSync('src/data/seo.json', 'utf8'));
// Títulos y descripciones cambiados con aprobación de Yama (2026-11-03).
const cambios = JSON.parse(fs.readFileSync('src/data/fallos-original.json', 'utf8'));
const DOM = 'https://contenedoresescombros.com';
const decode = (s = '') => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();

const distFile = (key) => path.join('dist', key === 'index' ? '' : key.replace(/__/g, '/'), 'index.html');
const rutaDe = (key) => (key === 'index' ? '/' : '/' + key.replace(/__/g, '/') + '/');

const dif = [];
let comparadas = 0;
const mapa = fs.existsSync('dist/sitemap.xml') ? fs.readFileSync('dist/sitemap.xml', 'utf8') : '';
if (!mapa) dif.push('no existe dist/sitemap.xml');

for (const [key, s] of Object.entries(seo)) {
  const f = distFile(key);
  if (!fs.existsSync(f)) { dif.push(`${key}: no existe en dist`); continue; }
  comparadas++;
  const html = fs.readFileSync(f, 'utf8');
  const titulo = decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || '');
  const tituloEsperado = cambios.titulos[key] || s.titulo;
  const descEsperada = cambios.descripciones[key] || s.descripcion || '';
  if (tituloEsperado && titulo !== tituloEsperado) dif.push(`${key}: titulo «${titulo}» != «${tituloEsperado}»`);
  if (descEsperada !== desc) dif.push(`${key}: descripcion «${desc.slice(0, 50)}» != «${descEsperada.slice(0, 50)}»`);
  const og = (html.match(/<meta property="og:image" content="([^"]*)"/i) || [])[1] || '';
  if (s.imagen && !og) dif.push(`${key}: sin og:image`);
  if (mapa && !mapa.includes(`<loc>${DOM}${rutaDe(key)}</loc>`)) dif.push(`${key}: no está en sitemap.xml`);
}

fs.mkdirSync('informes', { recursive: true });
fs.writeFileSync('informes/seo.json', JSON.stringify({ comparadas, diferencias: dif }, null, 1));
console.log(`SEO: ${comparadas} páginas comparadas, ${dif.length} diferencias`);
dif.slice(0, 20).forEach((x) => console.log('  ' + x));
process.exit(dif.length ? 1 : 0);
