// Geolocaliza las paginas de ciudad con OpenStreetMap (Nominatim) y calcula,
// para cada una, su provincia y las 6 localidades mas cercanas (de entre las
// nuestras). Salida: src/data/ciudades.json. Cache en informes/geo-cache.json.
// Respeta la norma de Nominatim: 1 peticion/seg y User-Agent con contacto.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'src/content/pages';
const CACHE = 'informes/geo-cache.json';
const UA = 'contenedoresescombros-migracion/1.0 (yamandu_5@hotmail.com)';

const NONCITY = new Set([
  'index', 'contacto', 'empresa', 'presupuesto',
  'precio', 'alquiler', 'transporte', 'medidas', 'recogida-escombros', 'venta',
  'camiones-portacontenedores', 'sacos-para-escombros', 'excavaciones',
  'habilitacion-contenedores-escombros-via-publica', 'poda',
  'contenedores-escombros-con-llave', 'contenedores-escombros-3-m3', 'contenedores-escombros-5-m3',
  'contenedores-escombros-9-m3', 'contenedores-escombros-12-m3', 'contenedores-escombros-20-m3', 'contenedores-escombros-30-m3',
  'aviso-legal', 'politica-de-privacidad', 'politica-de-cookies',
]);

const norm = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const nombreDe = (title) => title.replace(/^contenedores(\s+escombros)?\s+/i, '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();

const pages = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const ciudades = pages.filter((p) => !NONCITY.has(p.slug));

fs.mkdirSync('informes', { recursive: true });
let cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function geo(nombre) {
  if (cache[nombre]) return cache[nombre];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=es&q=${encodeURIComponent(nombre)}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es' } });
    const j = await r.json();
    if (j && j[0]) { const a = j[0].address || {}; cache[nombre] = { lat: +j[0].lat, lon: +j[0].lon, provincia: a.province || a.state || a.county || '' }; }
    else cache[nombre] = null;
  } catch (e) { cache[nombre] = null; }
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
  await dormir(1100);
  return cache[nombre];
}

const info = {};
for (const p of ciudades) { info[p.slug] = { nombre: nombreDe(p.title), geo: await geo(nombreDe(p.title)) }; }

const porNombre = new Map();
for (const p of ciudades) porNombre.set(norm(info[p.slug].nombre), p.slug);

const hav = (a, b) => {
  const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLon = (b.lon - a.lon) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const salida = {};
for (const p of ciudades) {
  const me = info[p.slug]; if (!me.geo) continue;
  const provBruta = me.geo.provincia || '';
  const mismaProv = norm(provBruta) === norm(me.nombre);
  const provincia = mismaProv ? '' : provBruta;
  const provSlug = porNombre.get(norm(provBruta));
  const cercanas = ciudades
    .filter((q) => q.slug !== p.slug && info[q.slug].geo)
    .map((q) => ({ slug: q.slug, nombre: info[q.slug].nombre, d: hav(me.geo, info[q.slug].geo) }))
    .sort((a, b) => a.d - b.d).slice(0, 6).map(({ slug, nombre }) => ({ slug, nombre }));
  salida[p.slug] = { nombre: me.nombre, provincia, provinciaSlug: (provSlug && provSlug !== p.slug) ? provSlug : '', cercanas };
}

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/ciudades.json', JSON.stringify(salida, null, 1) + '\n');
const sinGeo = ciudades.filter((p) => !info[p.slug].geo).map((p) => p.slug);
console.log(`Ciudades: ${ciudades.length}, geolocalizadas ${Object.keys(salida).length}. Sin geo: ${sinGeo.join(', ') || 'ninguna'}`);
console.log('Ejemplo valencia: ' + JSON.stringify(salida['valencia']));
