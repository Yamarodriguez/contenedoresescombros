// C2: cada texto, titular, boton, enlace e imagen de la extraccion fiel
// (contenido-vivo.json, cuyos recuentos cuadran con el original) tiene que estar
// en dist/, en el mismo orden. Se normaliza lo que cambia al publicar.
import fs from 'node:fs';
import path from 'node:path';
import { preguntasConvertidas } from '../src/lib/textos.mjs';

// Cambio aprobado: el titular del bloque Medidas / Recogida pasa a ser su pregunta.
const cambios = JSON.parse(fs.readFileSync('src/data/fallos-original.json', 'utf8'));
const contenido = JSON.parse(fs.readFileSync('contenido-vivo.json', 'utf8'));
const paginas = Object.values(contenido);
const DOM = /^https?:\/\/(?:www\.)?contenedoresescombros\.com/i;

const norm = (s = '') => s.replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/[«»“”„"]/g, '"').replace(/[‘’´`]/g, "'").replace(/…/g, '...').replace(/[–—]/g, '-')
  .replace(/\s+/g, ' ').trim().toLowerCase();

const relUrl = (h = '') => h.replace(DOM, '').replace(/#.*$/, '');
const internos = (hrefs) => hrefs.filter((h) => h && !/^(#|tel:|mailto:|javascript:)/i.test(h)).map(relUrl).filter((h) => h.startsWith('/'));

function zonaNueva(html) { const m = html.match(/<section class="heroe">[\s\S]*?<footer/i); return m ? m[0] : html; }
function textoUnidades(frag) {
  const c = frag.replace(/<form[\s\S]*?<\/form>/gi, '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  return [...c.matchAll(/<(p|h[1-6]|li|summary)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((x) => norm(x[2])).filter((t) => t.length > 1);
}

function viejoTextos(blocks) {
  const out = [];
  for (const b of blocks) {
    if (b.type === 'heading') { const t = norm(b.text); if (t.length > 1) out.push(t); }
    else if (b.type === 'text') { const u = textoUnidades(b.html || ''); out.push(...(u.length ? u : [norm(b.text)].filter((t) => t.length > 1))); }
    else if (b.type === 'toggle') { for (const it of b.items) { const t = norm(it.title); if (t.length > 1) out.push(t); out.push(...textoUnidades(it.html || '')); } }
  }
  return out;
}
const viejoBotones = (blocks) => blocks.filter((b) => b.type === 'button').map((b) => norm(b.text)).filter((t) => t.length > 0);
const viejoEnlaces = (blocks) => {
  const hrefs = [];
  for (const b of blocks) {
    if ((b.type === 'heading' || b.type === 'image' || b.type === 'button') && b.href) hrefs.push(b.href);
    if (b.type === 'text' && b.html) for (const m of b.html.matchAll(/href="([^"]+)"/g)) hrefs.push(m[1]);
  }
  return internos(hrefs);
};
// Imágenes: misma foto y en el mismo orden. El texto alternativo se compara solo si el
// original ya tenía uno (cambio aprobado: alt añadido a las fotos que no lo tenían).
const viejoImagenes = (blocks) => blocks.filter((b) => b.type === 'image').map((b) => ({ f: decodeURI(b.src.split('?')[0].split('/').pop()), alt: norm(b.alt || '') }));

const nuevoBotones = (html) => [...zonaNueva(html).matchAll(/<a[^>]*class="[^"]*boton[^"]*"[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => norm(m[1])).filter((t) => t.length > 0);
const nuevoEnlaces = (html) => internos([...zonaNueva(html).matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map((m) => m[1]));
const nuevoImagenes = (html) => [...zonaNueva(html).matchAll(/<img\b[^>]*>/gi)].map((m) => {
  const s = (m[0].match(/src="([^"]+)"/i) || [])[1] || ''; const a = (m[0].match(/alt="([^"]*)"/i) || [])[1] || '';
  return { f: decodeURI(s.split('?')[0].split('/').pop()), alt: norm(a) };
});
function subImg(viejo, nuevo, p, dif) {
  let k = 0;
  for (const v of viejo) {
    const i = nuevo.findIndex((x, j) => j >= k && x.f === v.f && (!v.alt || x.alt === v.alt));
    if (i < 0) dif.push(`${p.url}: falta imagen ${v.f}${v.alt ? ' | ' + v.alt : ''}`); else k = i + 1;
  }
}

function subTxt(viejo, nuevoStr, et, p, dif) { let pos = 0; for (const t of viejo) { const i = nuevoStr.indexOf(t, pos); if (i < 0) dif.push(`${p.url}: falta ${et} «${t.slice(0, 70)}»`); else pos = i + t.length; } }
function subArr(viejo, nuevo, et, p, dif) { let k = 0; for (const t of viejo) { const i = nuevo.indexOf(t, k); if (i < 0) dif.push(`${p.url}: falta ${et} ${String(t).slice(0, 70)}`); else k = i + 1; } }

const dif = [];
let comparadas = 0;
for (const p of paginas) {
  const ruta = new URL(p.url).pathname.replace(/^\/|\/$/g, '');
  const f = path.join('dist', ruta, 'index.html');
  if (!fs.existsSync(f)) { dif.push(`${p.url}: no existe en dist`); continue; }
  comparadas++;
  const html = fs.readFileSync(f, 'utf8');
  const zona = zonaNueva(html);
  const pag = JSON.parse(fs.readFileSync(path.join('src/content/pages', (ruta || 'index') + '.json'), 'utf8'));
  const conv = preguntasConvertidas(pag.blocks, pag.filas, cambios.preguntas);
  const bl = p.blocks.map((b, i) => (conv.has(i) ? { ...b, text: conv.get(i) } : b));
  subTxt(viejoTextos(bl), textoUnidades(zona).join(' || '), 'texto', p, dif);
  subArr(viejoBotones(p.blocks), nuevoBotones(html), 'boton', p, dif);
  subArr(viejoEnlaces(p.blocks), nuevoEnlaces(html), 'enlace', p, dif);
  subImg(viejoImagenes(p.blocks), nuevoImagenes(html), p, dif);
}

fs.mkdirSync('informes', { recursive: true });
fs.writeFileSync('informes/contenido.json', JSON.stringify({ comparadas, diferencias: dif }, null, 1));
console.log(`Contenido: ${comparadas} páginas comparadas, ${dif.length} diferencias`);
dif.slice(0, 20).forEach((x) => console.log('  ' + x));
process.exit(dif.length ? 1 : 0);
