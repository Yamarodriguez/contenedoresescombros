// C1: la secuencia de H1/H2/H3 de cada pagina en dist/ contra estructura-viva.json.
// Avanza con un puntero (hay titulos repetidos). Regla del H1 (D7): sin H1 en
// Elementor, el H1 es el titulo de la pagina.
// Cambios aprobados por Yama (src/data/fallos-original.json y src/lib/textos.mjs):
// H1 de servicio nuevos y encabezados de MAYÚSCULAS a tipo frase.
import fs from 'node:fs';
import path from 'node:path';
import { tipoFrase, nombresPropios, preguntasConvertidas } from '../src/lib/textos.mjs';

const cambios = JSON.parse(fs.readFileSync('src/data/fallos-original.json', 'utf8'));
const propios = nombresPropios(JSON.parse(fs.readFileSync('src/data/ciudades.json', 'utf8')));
const viva = JSON.parse(fs.readFileSync('estructura-viva.json', 'utf8'));
const paginas = Array.isArray(viva) ? viva : Object.values(viva);
const limpia = (s) =>
  s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

const diferencias = [];
let comparadas = 0;
for (const p of paginas) {
  const ruta = new URL(p.url).pathname.replace(/^\/|\/$/g, '');
  const f = path.join('dist', ruta, 'index.html');
  if (!fs.existsSync(f)) { diferencias.push(`${p.url}: no existe en dist`); continue; }
  const html = fs.readFileSync(f, 'utf8');
  const nuevos = [...html.matchAll(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => [m[1], limpia(m[2])]);
  const slug = ruta || 'index';
  // Bloque Medidas / Recogida convertido en preguntas frecuentes (cambio aprobado): su H2
  // pasa a H3 con la pregunta, bajo el H2 «Preguntas frecuentes de contenedores».
  const pag = JSON.parse(fs.readFileSync(path.join('src/content/pages', slug + '.json'), 'utf8'));
  const conv = preguntasConvertidas(pag.blocks, pag.filas, cambios.preguntas);
  const hb = pag.blocks.map((b, i) => (b.type === 'heading' ? i : -1)).filter((i) => i >= 0);
  if (hb.length !== p.headings.length) { diferencias.push(`${p.url}: la estructura viva y la página no tienen los mismos titulares`); continue; }
  let originales = []; let conTituloFaq = false;
  p.headings.forEach((h, k) => {
    const q = conv.get(hb[k]);
    if (q) { if (!conTituloFaq) { originales.push(['h2', limpia(cambios.tituloFaq)]); conTituloFaq = true; } originales.push(['h3', limpia(q)]); }
    else if (/^h[1-3]$/.test(h.tag)) originales.push([h.tag, limpia(tipoFrase(h.text, propios))]);
  });
  if (cambios.h1[slug]) originales = [['h1', limpia(cambios.h1[slug])], ...originales.filter(([t]) => t !== 'h1')];
  else if (!originales.some(([t]) => t === 'h1')) originales = [['h1', limpia(tipoFrase(p.title, propios))], ...originales];
  comparadas++;
  let k = 0;
  for (const [tag, texto] of originales) {
    while (k < nuevos.length && !(nuevos[k][0] === tag && nuevos[k][1] === texto)) k++;
    if (k >= nuevos.length) { diferencias.push(`${p.url}: falta ${tag} «${texto}»`); break; }
    k++;
  }
}

fs.mkdirSync('informes', { recursive: true });
fs.writeFileSync('informes/encabezados.json', JSON.stringify({ comparadas, diferencias }, null, 1));
console.log(`Encabezados: ${comparadas} páginas comparadas, ${diferencias.length} diferencias`);
diferencias.slice(0, 20).forEach((x) => console.log('  ' + x));
process.exit(diferencias.length ? 1 : 0);
