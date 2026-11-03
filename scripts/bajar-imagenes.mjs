// FASE 1 — Baja TODAS las imagenes del sitio a public/img/, conservando la ruta
// de /wp-content/uploads/. Fuentes: los adjuntos del export y cualquier URL de
// uploads que aparezca en el _elementor_data (incluye fotos de fondo).
// Throttle + reintentos + salta las que ya existen. Solo lee del export y baja.
import fs from 'node:fs';
import path from 'node:path';

const ORIGEN = 'origen';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36';
const EXT = /\.(jpe?g|png|gif|webp|avif|svg)$/i;

// 1) recoger URLs
const urls = new Set();
for (const f of fs.readdirSync(ORIGEN).filter((x) => x.toLowerCase().endsWith('.xml'))) {
  const raw = fs.readFileSync(path.join(ORIGEN, f), 'utf8');
  for (const m of raw.matchAll(/<wp:attachment_url><!\[CDATA\[([^\]]+)\]\]><\/wp:attachment_url>/g)) urls.add(m[1]);
  const sinEscape = raw.replace(/\\\//g, '/');
  for (const m of sinEscape.matchAll(/https?:\/\/(?:www\.)?contenedoresescombros\.com\/wp-content\/uploads\/[^\s"'<>)\]]+/gi)) urls.add(m[0]);
}

// 2) normalizar -> {url, dest} por ruta de uploads, dedupe por dest (https gana)
const porDest = new Map();
for (const u0 of urls) {
  let u; try { u = new URL(u0.replace(/&amp;/g, '&')); } catch { continue; }
  const k = '/wp-content/uploads/';
  const i = u.pathname.indexOf(k);
  if (i < 0) continue;
  const rest = decodeURIComponent(u.pathname.slice(i + k.length));
  if (!EXT.test(rest)) continue;
  const dest = path.join('public/img', rest);
  const httpsUrl = 'https://contenedoresescombros.com' + k + rest;
  if (!porDest.has(dest)) porDest.set(dest, httpsUrl);
}

const trabajos = [...porDest.entries()].map(([dest, url]) => ({ dest, url }));
console.log(`Imagenes referenciadas: ${trabajos.length}`);

// 3) descargar con 2 hilos, 300 ms, 2 reintentos, saltando las que ya estan
let bajadas = 0, saltadas = 0; const fallos = [];
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
async function bajarUna(t) {
  if (fs.existsSync(t.dest) && fs.statSync(t.dest).size > 0) { saltadas++; return; }
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const res = await fetch(t.url, { headers: { 'user-agent': UA, accept: 'image/*,*/*' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) throw new Error('vacia (' + buf.length + 'b)');
      fs.mkdirSync(path.dirname(t.dest), { recursive: true });
      fs.writeFileSync(t.dest, buf);
      bajadas++; return;
    } catch (e) {
      if (intento === 3) { fallos.push({ url: t.url, error: e.message }); return; }
      await dormir(600 * intento);
    }
  }
}
async function run() {
  const cola = [...trabajos];
  async function hilo() { while (cola.length) { await bajarUna(cola.shift()); await dormir(300); } }
  await Promise.all([hilo(), hilo()]);
}
await run();

fs.mkdirSync('informes', { recursive: true });
fs.writeFileSync('informes/descarga-imagenes.json', JSON.stringify({ referenciadas: trabajos.length, bajadas, saltadas, fallos }, null, 1) + '\n');
console.log(`Bajadas: ${bajadas} · Ya estaban: ${saltadas} · Fallos: ${fallos.length}`);
fallos.slice(0, 15).forEach((x) => console.log('  ' + x.error + '  ' + x.url));
