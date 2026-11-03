// Para cada imagen de public/img:
//  - mide su tamano real -> src/data/imagenes.json (el navegador reserva el hueco
//    justo y el validador exige width/height)
//  - de los jpg/png genera versiones webp a 400 y 800 px (nunca mas grandes que el
//    original) junto al fichero, con sufijo -400.webp / -800.webp. El original se
//    conserva como src del <img>; el webp va en <picture> (mas ligero, carga antes).
import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';
import sharp from 'sharp';

const ANCHOS = [400, 800];
function ficheros(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? ficheros(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

const salida = {}; const fallos = []; let creadas = 0;
for (const f of ficheros('public/img')) {
  if (!/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(f)) continue;
  try {
    const { width, height } = imageSize(fs.readFileSync(f));
    const clave = '/' + path.relative('public', f).split(path.sep).join('/');
    if (!/\.(jpe?g|png)$/i.test(f)) { salida[clave] = { w: width, h: height, ws: [] }; continue; }
    const anchos = ANCHOS.filter((a) => a < width);
    if (!anchos.length || anchos[anchos.length - 1] < width * 0.9) anchos.push(width);
    const base = f.replace(/\.(jpe?g|png)$/i, '');
    for (const a of anchos) {
      const destino = `${base}-${a}.webp`;
      if (!fs.existsSync(destino) || fs.statSync(destino).mtimeMs < fs.statSync(f).mtimeMs) {
        await sharp(f).resize({ width: a, withoutEnlargement: true }).webp({ quality: 80 }).toFile(destino);
        creadas++;
      }
    }
    salida[clave] = { w: width, h: height, ws: anchos };
  } catch (e) { fallos.push(f + ' (' + e.message + ')'); }
}
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/imagenes.json', JSON.stringify(salida, null, 1) + '\n');
console.log(`Medidas: ${Object.keys(salida).length} imagenes, ${creadas} webp nuevos, ${fallos.length} sin medir`);
fallos.slice(0, 10).forEach((f) => console.log('  ' + f));
process.exit(fallos.length ? 1 : 0);
