// Saca el SEO real de cada pagina del HTML vivo (referencia/) -> src/data/seo.json.
// Titulo, descripcion e imagen para compartir tal cual los conoce Google.
// La imagen og que apunte a /wp-content/uploads/ se reescribe a /img/ (misma foto, ya descargada).
import fs from 'node:fs';
import path from 'node:path';

const DOM = 'https://contenedoresescombros.com';
const decode = (s = '') => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
const meta = (h, attr, nombre) => {
  const m = h.match(new RegExp(`<meta[^>]+${attr}="${nombre}"[^>]*content="([^"]*)"`, 'i'))
    || h.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]*${attr}="${nombre}"`, 'i'));
  return m ? decode(m[1]) : '';
};
function aLocal(url) {
  if (!url) return '';
  const i = url.indexOf('/wp-content/uploads/');
  if (i < 0) return url;
  return DOM + '/img/' + url.slice(i + '/wp-content/uploads/'.length);
}

const salida = {}; const sinDesc = []; const imgFalta = [];
for (const f of fs.readdirSync('referencia').sort()) {
  if (!f.endsWith('.html')) continue;
  const h = fs.readFileSync(path.join('referencia', f), 'utf8');
  const key = f.replace(/\.html$/, '');
  const titulo = decode((h.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
  const descripcion = meta(h, 'name', 'description');
  const imagen = aLocal(meta(h, 'property', 'og:image'));
  salida[key] = {
    titulo,
    descripcion,
    imagen,
    ogTitulo: meta(h, 'property', 'og:title'),
    ogDescripcion: meta(h, 'property', 'og:description'),
  };
  if (!descripcion) sinDesc.push(key);
  if (imagen.startsWith(DOM + '/img/') && !fs.existsSync('public' + imagen.slice(DOM.length))) imgFalta.push(imagen.slice(DOM.length));
}
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/seo.json', JSON.stringify(salida, null, 1) + '\n');
console.log(`SEO: ${Object.keys(salida).length} paginas, ${sinDesc.length} sin descripcion, ${imgFalta.length} imagenes og que faltan`);
if (sinDesc.length) console.log('  sin descripcion: ' + sinDesc.join(', '));
if (imgFalta.length) console.log('  og que faltan (primeras): ' + imgFalta.slice(0, 10).join(', '));
