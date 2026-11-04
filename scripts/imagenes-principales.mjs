// Imagen principal de cada página (petición de Yama, 2026-11-03): una foto de la
// propia web con la palabra clave escrita en una franja verde y el logo. El fichero
// se llama como la palabra clave (p. ej. contenedores-escombros-valencia.jpg) y el
// texto alternativo es la palabra clave. 1200x630: sirve también para compartir.
// Salida: public/img/principal/*.jpg y src/data/principales.json
// Uso: node scripts/imagenes-principales.mjs [slug]   (con slug: solo esa, para probar)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { tipoFrase, nombresPropios } from '../src/lib/textos.mjs';
import { paginasExcavacion } from '../src/lib/excavaciones.mjs';
import { paginasContenedores } from '../src/lib/lugares.mjs';

const SOLO = process.argv[2];
const ANCHO = 1200, ALTO = 630, FRANJA = 150;
const pages = fs.readdirSync('src/content/pages').map((f) => JSON.parse(fs.readFileSync(path.join('src/content/pages', f), 'utf8')));
const ciudades = JSON.parse(fs.readFileSync('src/data/ciudades.json', 'utf8'));
const cambios = JSON.parse(fs.readFileSync('src/data/fallos-original.json', 'utf8'));
const seo = JSON.parse(fs.readFileSync('src/data/seo.json', 'utf8'));
const propios = nombresPropios(ciudades);

const F = '/img/2021/06/';
const FOTO = { // [foto, ¿es foto real (rellena) o recorte sobre blanco?]
  'contenedores-escombros-con-llave': [F + 'contenedores-escombros-cerrados.jpg'],
  'sacos-para-escombros': [F + 'sacos-de-escombros.jpg'],
  poda: [F + 'contenedor-de-poda.jpg'],
  transporte: [F + 'transporte-contenedores-escombros.jpg'],
  'recogida-escombros': [F + 'retirada-de-escombros.jpg', true],
  excavaciones: [F + 'excavaciones.jpg', true],
  'camiones-portacontenedores': [F + 'Camiones-portacontenedores.jpg'],
  venta: [F + 'venta-contenedores.jpg'],
  precio: [F + 'precios-contenedores-escombros.jpg'],
  medidas: [F + 'medidas-contenedores-Escombros.jpg'],
  'habilitacion-contenedores-escombros-via-publica': [F + 'habilitacion-de-contenedores-escombros-via-publica.jpg'],
  'alquiler-de-cubas': ['/img/2021/06/alquiler-contenedores-escombros.jpg'],
  'contenedores-para-reformas': ['/img/2021/06/contenedor-escombro-3-m3.jpg'],
  'contenedores-industriales': ['/img/2021/06/contenedor-escombro-30-m3.jpg'],
  'demoliciones': ['/img/2021/06/excavaciones.jpg', true],
  'contenedores-para-chatarra': ['/img/2021/06/contenedores-escombros-cerrados.jpg'],
  'casetas-de-obra': ['/img/2021/06/contenedores-maritimos.jpg'],
  'desescombro': ['/img/2021/06/retirada-de-escombros.jpg', true],
};
for (const m of [3, 5, 9, 12, 20, 30]) FOTO[`contenedores-escombros-${m}-m3`] = [`${F}contenedor-escombro-${m}-m3.jpg`];
const PORDEFECTO = [F + 'alquiler-contenedores-escombros.jpg'];

const PARADAS = new Set('de del la las los el en y para con por a al'.split(' '));
const fichero = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter((w) => w && !PARADAS.has(w)).join('-');
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const CLAVE_FIJA = {
  poda: 'Contenedores de poda',
  empresa: 'Empresas de contenedores de escombros',
  'habilitacion-contenedores-escombros-via-publica': 'Habilitación de contenedores de escombros en la vía pública',
  contacto: 'Contacto para contenedores de escombros',
};
function palabraClave(p) {
  if (/^(aviso-legal|politica-de-)/.test(p.slug)) return '';
  if (CLAVE_FIJA[p.slug]) return CLAVE_FIJA[p.slug];
  const m3 = p.slug.match(/^contenedores-escombros-(\d+)-m3$/);
  if (m3) return `Contenedor de escombros de ${m3[1]} m3`;
  if (ciudades[p.slug]) return `Contenedores de escombros en ${ciudades[p.slug].nombre}`;
  if (cambios.h1[p.slug]) return cambios.h1[p.slug];
  const clave = new URL(p.url).pathname.replace(/^\/|\/$/g, '') || 'index';
  const base = cambios.titulos[clave] || seo[clave]?.titulo || p.title;
  return tipoFrase(base.split(/:| - | \| /)[0].trim(), propios);
}

async function generar(p, texto, destino) {
  const [foto, rellena] = FOTO[p.slug] || PORDEFECTO;
  const origen = path.join('public', foto);
  const altoFoto = ALTO - FRANJA;
  const imgFoto = rellena
    ? await sharp(origen).resize(ANCHO, altoFoto, { fit: 'cover' }).toBuffer()
    : await sharp(await sharp(origen).flatten({ background: '#ffffff' }).trim({ threshold: 18 }).toBuffer())
      .resize(ANCHO - 160, altoFoto - 140, { fit: 'contain', background: '#ffffff' }).toBuffer();
  const meta = await sharp(imgFoto).metadata();
  const visible = texto.replace(/(\d+) m3\b/g, '$1 m³');
  const tam = Math.min(58, Math.floor((ANCHO - 120) / (visible.length * 0.56)));
  const capa = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#163520"/><stop offset="1" stop-color="#26502f"/></linearGradient></defs>
    <rect x="0" y="${ALTO - FRANJA}" width="${ANCHO}" height="${FRANJA}" fill="url(#g)"/>
    <rect x="0" y="${ALTO - FRANJA}" width="${ANCHO}" height="6" fill="#2f8f54"/>
    <text x="60" y="${ALTO - FRANJA / 2 + tam * 0.36}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="${tam}" fill="#ffffff">${esc(visible)}</text>
    <rect x="34" y="26" width="300" height="82" rx="41" fill="#ffffff" opacity=".96"/>
    <text x="114" y="62" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="29" fill="#12301d">Contenedores</text>
    <rect x="114" y="70" width="186" height="3" fill="#f2b01e"/>
    <text x="114" y="91" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="13" letter-spacing="5.6" fill="#236f41">ESCOMBROS</text>
  </svg>`);
  const logo = await sharp(fs.readFileSync('public/img/logo-contenedores.svg'), { density: 400 }).resize(64, 64).png().toBuffer();
  await sharp({ create: { width: ANCHO, height: ALTO, channels: 3, background: '#ffffff' } })
    .composite([
      { input: imgFoto, left: Math.round((ANCHO - meta.width) / 2), top: rellena ? 0 : 120 + Math.round((altoFoto - 140 - meta.height) / 2) },
      { input: capa, left: 0, top: 0 },
      { input: logo, left: 43, top: 35 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(destino);
}

fs.mkdirSync('public/img/principal', { recursive: true });
const salida = {}; const usados = new Set();
for (const p of pages) {
  if (SOLO && p.slug !== SOLO) continue;
  const texto = palabraClave(p);
  if (!texto) continue;
  let nombre = fichero(texto);
  if (usados.has(nombre)) nombre = `${nombre}-${p.slug}`;
  usados.add(nombre);
  const src = `/img/principal/${nombre}.jpg`;
  await generar(p, texto, path.join('public', src));
  salida[p.slug] = { src, alt: texto };
}
// Páginas de excavaciones por ciudad (src/lib/excavaciones.mjs): «Excavaciones en {ciudad}».
const datosExcavacion = JSON.parse(fs.readFileSync('src/data/excavaciones-ciudades.json', 'utf8'));
for (const e of paginasExcavacion(datosExcavacion, ciudades)) {
  const clave = e.id;
  if (SOLO && clave !== SOLO) continue;
  let nombre = fichero(e.clave);
  if (usados.has(nombre)) nombre = `${nombre}-${e.slug}`;
  usados.add(nombre);
  const src = `/img/principal/${nombre}.jpg`;
  await generar({ slug: 'excavaciones' }, e.clave, path.join('public', src));
  salida[clave] = { src, alt: e.clave };
}
// Lugares nuevos: «Contenedores de escombros en {lugar}».
for (const e of paginasContenedores(JSON.parse(fs.readFileSync('src/data/lugares-nuevos.json', 'utf8')), ciudades)) {
  if (SOLO && e.slug !== SOLO) continue;
  let nombre = fichero(e.clave);
  if (usados.has(nombre)) nombre = `${nombre}-${e.slug}`;
  usados.add(nombre);
  const src = `/img/principal/${nombre}.jpg`;
  await generar({ slug: e.slug }, e.clave, path.join('public', src));
  salida[e.slug] = { src, alt: e.clave };
}
// Otras páginas nuevas (src/data/paginas-nuevas.json): la palabra clave es su «clave».
const paginasNuevas = JSON.parse(fs.readFileSync('src/data/paginas-nuevas.json', 'utf8'));
for (const [slug, p] of Object.entries(paginasNuevas)) {
  if (slug.startsWith('_') || (SOLO && slug !== SOLO)) continue;
  let nombre = fichero(p.clave);
  if (usados.has(nombre)) nombre = `${nombre}-${slug}`;
  usados.add(nombre);
  const src = `/img/principal/${nombre}.jpg`;
  await generar({ slug }, p.clave, path.join('public', src));
  salida[slug] = { src, alt: p.clave };
}
if (!SOLO) fs.writeFileSync('src/data/principales.json', JSON.stringify(salida, null, 1) + '\n');
console.log(`Imágenes principales: ${Object.keys(salida).length}${SOLO ? ' (prueba, sin escribir el índice)' : ''}`);
for (const [k, v] of Object.entries(salida).slice(0, 4)) console.log(`  ${k}: ${v.src} | «${v.alt}»`);
