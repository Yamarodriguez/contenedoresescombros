// Redirecciones 301 de las miniaturas de WordPress (foto-1024x1024.jpg, foto-300x300.jpg,
// y sus copias .webp) a la foto original en /img/. WordPress apunta en el export
// (_wp_attachment_metadata) qué tamaños creó de cada foto. Salida: public/_redirects,
// que Netlify lee ANTES que netlify.toml (asi la regla general /wp-content/uploads/*
// no las manda a una miniatura que no existe).
import fs from 'node:fs';
import path from 'node:path';

const ORIGEN = 'origen';
const reglas = new Map();
for (const f of fs.readdirSync(ORIGEN).filter((x) => x.toLowerCase().endsWith('.xml'))) {
  const xml = fs.readFileSync(path.join(ORIGEN, f), 'utf8');
  for (const m of xml.matchAll(/<wp:meta_key><!\[CDATA\[_wp_attachment_metadata\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>/g)) {
    const meta = m[1];
    const principal = (meta.match(/"file";s:\d+:"([^"]+)"/) || [])[1];
    if (!principal || !/\.(jpe?g|png|gif|webp)$/i.test(principal)) continue;
    const carpeta = path.posix.dirname(principal);
    const destino = `/img/${principal}`;
    if (!fs.existsSync(path.join('public', destino))) continue;
    const tamanos = [...meta.matchAll(/"file";s:\d+:"([^"\/]+)"/g)].map((x) => x[1]).filter((x) => x !== path.posix.basename(principal));
    for (const t of tamanos) {
      const viejo = `/wp-content/uploads/${carpeta}/${t}`;
      reglas.set(viejo, destino);
      reglas.set(`${viejo}.webp`, destino);
    }
    reglas.set(`/wp-content/uploads/${principal}.webp`, destino);
  }
}
const lineas = [...reglas.entries()].sort().map(([de, a]) => `${de}  ${a}  301`);
fs.writeFileSync('public/_redirects', '# Miniaturas de WordPress -> foto original (generado por scripts/redirecciones-wp.mjs)\n' + lineas.join('\n') + '\n');
console.log(`Redirecciones de miniaturas: ${lineas.length}`);
