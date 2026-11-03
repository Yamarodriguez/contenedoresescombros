// Mide el tamaño real de cada imagen de public/img -> src/data/imagenes.json
// (el navegador reserva el hueco justo y el validador exige width/height).
// Nota: los webp a 400/800 px con <picture> se hacen en la Fase 6.
import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';

function ficheros(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? ficheros(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

const salida = {}; const fallos = [];
for (const f of ficheros('public/img')) {
  if (!/\.(jpe?g|png|gif|webp|avif|svg)$/i.test(f)) continue;
  try {
    const { width, height } = imageSize(fs.readFileSync(f));
    const clave = '/' + path.relative('public', f).split(path.sep).join('/');
    salida[clave] = { w: width, h: height, ws: [] };
  } catch (e) { fallos.push(f + ' (' + e.message + ')'); }
}
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/imagenes.json', JSON.stringify(salida, null, 1) + '\n');
console.log(`Medidas: ${Object.keys(salida).length} imagenes, ${fallos.length} sin medir`);
fallos.slice(0, 10).forEach((f) => console.log('  ' + f));
process.exit(fallos.length ? 1 : 0);
