// Fotos de los H2 del contenido nuevo (src/data/contenido-nuevo.json): una copia de una
// foto de la web con la palabra clave del H2 en el nombre del fichero (decisión D8).
// Salida: public/img/nuevas/<nombre>.jpg (1200 px de ancho como máximo).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const datos = JSON.parse(fs.readFileSync('src/data/contenido-nuevo.json', 'utf8'));
fs.mkdirSync('public/img/nuevas', { recursive: true });
let n = 0;
for (const [slug, pag] of Object.entries(datos)) {
  if (slug.startsWith('_')) continue;
  for (const s of pag.secciones || []) {
    if (!s.foto) continue;
    const destino = path.join('public/img/nuevas', s.foto.nombre + '.jpg');
    await sharp(path.join('public', s.foto.de)).flatten({ background: '#ffffff' }).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(destino);
    n++;
  }
}
console.log(`Fotos nuevas: ${n}`);
