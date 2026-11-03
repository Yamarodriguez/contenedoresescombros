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

const ICONO = `<g transform="scale(0.6875)">
  <path d="M19 24 L26 14 L31 24 Z M29 24 L36 11 L43 24 Z M41 24 L46 17 L50 24 Z" fill="#d99a4e"/>
  <rect x="9" y="23" width="46" height="7" rx="2.5" fill="#1b5733"/>
  <path d="M13 30 H51 L45 51 H19 Z" fill="#2f8f54"/>
  <rect x="24" y="37" width="16" height="3.5" rx="1.75" fill="#fff" opacity=".9"/></g>`;

async function generar(p, texto, destino) {
  const [foto, rellena] = FOTO[p.slug] || PORDEFECTO;
  const origen = path.join('public', foto);
  const altoFoto = ALTO - FRANJA;
  const imgFoto = rellena
    ? await sharp(origen).resize(ANCHO, altoFoto, { fit: 'cover' }).toBuffer()
    : await sharp(await sharp(origen).flatten({ background: '#ffffff' }).trim({ threshold: 18 }).toBuffer())
      .resize(ANCHO - 160, altoFoto - 130, { fit: 'contain', background: '#ffffff' }).toBuffer();
  const meta = await sharp(imgFoto).metadata();
  const visible = texto.replace(/(\d+) m3\b/g, '$1 m³');
  const tam = Math.min(58, Math.floor((ANCHO - 120) / (visible.length * 0.56)));
  const capa = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}">
    <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#163520"/><stop offset="1" stop-color="#26502f"/></linearGradient></defs>
    <rect x="0" y="${ALTO - FRANJA}" width="${ANCHO}" height="${FRANJA}" fill="url(#g)"/>
    <rect x="0" y="${ALTO - FRANJA}" width="${ANCHO}" height="6" fill="#2f8f54"/>
    <text x="60" y="${ALTO - FRANJA / 2 + tam * 0.36}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="${tam}" fill="#ffffff">${esc(visible)}</text>
    <rect x="36" y="30" width="250" height="62" rx="31" fill="#ffffff" opacity=".96"/>
    <g transform="translate(52 39)">${ICONO}</g>
    <text x="104" y="72" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="30" fill="#1b2430">Contenedores</text>
  </svg>`);
  await sharp({ create: { width: ANCHO, height: ALTO, channels: 3, background: '#ffffff' } })
    .composite([
      { input: imgFoto, left: Math.round((ANCHO - meta.width) / 2), top: rellena ? 0 : 110 + Math.round((altoFoto - 130 - meta.height) / 2) },
      { input: capa, left: 0, top: 0 },
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
if (!SOLO) fs.writeFileSync('src/data/principales.json', JSON.stringify(salida, null, 1) + '\n');
console.log(`Imágenes principales: ${Object.keys(salida).length}${SOLO ? ' (prueba, sin escribir el índice)' : ''}`);
for (const [k, v] of Object.entries(salida).slice(0, 4)) console.log(`  ${k}: ${v.src} | «${v.alt}»`);
