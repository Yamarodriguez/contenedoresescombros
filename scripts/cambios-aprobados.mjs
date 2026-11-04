// Cambios del original aprobados por Yama el 2026-11-03 (auditoría SEO/AEO):
//  - títulos de Google de más de 60 caracteres -> acortados (palabra clave y «precio» delante)
//  - H1 de las páginas de servicio -> descriptivos
//  - descripción para Google en las páginas que no la tenían
//  - (en src/lib/textos.mjs) encabezados en MAYÚSCULAS -> tipo frase, y texto
//    alternativo en las fotos que no lo tenían
// Escribe src/data/fallos-original.json, que leen la web y los comprobadores.
// Uso: node scripts/cambios-aprobados.mjs --seco   (solo enseña recuentos y ejemplos)
//      node scripts/cambios-aprobados.mjs         (escribe el fichero)
import fs from 'node:fs';
import path from 'node:path';
import { aplicarCambios, esMayusculas, nombresPropios, bloquesDeFila, normT } from '../src/lib/textos.mjs';

const SECO = process.argv.includes('--seco');
const seo = JSON.parse(fs.readFileSync('src/data/seo.json', 'utf8'));
const ciudades = JSON.parse(fs.readFileSync('src/data/ciudades.json', 'utf8'));
const paginas = fs.readdirSync('src/content/pages').map((f) => JSON.parse(fs.readFileSync(path.join('src/content/pages', f), 'utf8')));
const MAX = 60;

// --- Títulos ---
const titulosFijos = {
  index: 'Contenedores de escombros: precios, medidas y alquiler',
  precio: 'Precio contenedor de escombros: cuánto cuesta por tamaño',
  medidas: 'Medidas de los contenedores de escombros por tamaño',
  alquiler: 'Alquiler de contenedores de escombros y de obra',
  transporte: 'Transporte de contenedores de escombros y de obra',
  venta: 'Venta de contenedores de escombros',
  'camiones-portacontenedores': 'Venta de camiones portacontenedores',
  'contenedores-escombros-con-llave': 'Contenedores de escombros con llave (cerrados)',
  'contenedores-escombros-sevilla': 'Contenedores y cubas de escombros en Sevilla: precio',
};
for (const m of [3, 5, 9, 12, 20, 30]) titulosFijos[`contenedores-escombros-${m}-m3`] = `Contenedor de escombros de ${m} m3: medidas y precio`;
const nombreCiudad = (k) => (k === 'lleida' ? 'Lleida (Lérida)' : ciudades[k]?.nombre);
function tituloCiudad(x) {
  return [`Contenedores de escombros en ${x}: precio y alquiler`, `Contenedores de escombros en ${x}: precio`, `Contenedores de escombros en ${x}`].find((t) => t.length <= MAX);
}
const titulos = {};
for (const [k, s] of Object.entries(seo)) {
  if ((s.titulo || '').length <= MAX) continue;
  const nuevo = titulosFijos[k] || (nombreCiudad(k) ? tituloCiudad(nombreCiudad(k)) : null);
  if (nuevo) titulos[k] = nuevo; else console.log(`  AVISO sin regla para el título de ${k}`);
}

// Títulos cambiados aunque no pasen de 60 caracteres (Yama, 2026-11-03: SEO de Excavaciones).
Object.assign(titulos, { excavaciones: 'Excavaciones y movimiento de tierras: tipos y presupuesto', transporte: 'Transporte de escombros y de contenedores de obra' });

// --- H1 de las páginas de servicio ---
const h1 = {
  alquiler: 'Alquiler de contenedores de escombros',
  excavaciones: 'Excavaciones y movimiento de tierras',
  medidas: 'Medidas de los contenedores de escombros',
  precio: 'Precio de los contenedores de escombros',
  presupuesto: 'Presupuesto de contenedor de escombros',
  'recogida-escombros': 'Recogida y retirada de escombros',
  'sacos-para-escombros': 'Sacos para escombros (big bag)',
  transporte: 'Transporte de contenedores de escombros',
  venta: 'Venta de contenedores de escombros',
};

// --- Descripciones que faltaban ---
const descripciones = {
  contacto: 'Contacta con Contenedores Escombros por WhatsApp o teléfono (666 17 13 91) o con el formulario. Te informamos y te damos presupuesto sin compromiso.',
  presupuesto: 'Pide presupuesto sin compromiso para un contenedor de escombros: indica el tamaño, la dirección de entrega y los días que lo necesitas.',
  'aviso-legal': 'Aviso legal de contenedoresescombros.com: titular del sitio web, condiciones de uso, propiedad intelectual y legislación aplicable.',
  'politica-de-privacidad': 'Política de privacidad de contenedoresescombros.com: qué datos personales se recogen, para qué se usan y cómo ejercer tus derechos.',
  'politica-de-cookies': 'Política de cookies de contenedoresescombros.com: qué cookies usa la web, para qué sirven y cómo configurarlas o desactivarlas.',
  excavaciones: 'Excavaciones y movimiento de tierras: vaciado, zanjas, piscinas y nivelación, maquinaria, contenedores de tierra y de qué depende el precio. Pide presupuesto.',
};

// --- Bloque «Medidas / Recogida» (4 columnas, 90 páginas) -> «Preguntas frecuentes de contenedores» ---
// Petición de Yama (2026-11-03, captura). Claves: titular H2 original sin acentos y en minúsculas.
const tituloFaq = 'Preguntas frecuentes de contenedores';
const preguntas = {
  'medidas de los contenedores de escombros': '¿Qué medidas tienen los contenedores de escombros?',
  'medidas de contenedores de escombros': '¿Qué medidas tienen los contenedores de escombros?',
  'recogida de escombros': '¿Se puede contratar la recogida de escombros?',
  'retirada de escombros y residuos': '¿Se puede contratar la retirada de escombros y residuos?',
};

// --- Partes del original que se quitan ---
// Yama (2026-11-03): en Excavaciones, quitar lo repetido de contenedores y dejar los tipos de
// contenedores de escombros y «Otros servicios de contenedores». Se conservan las filas
// principales cuyo primer titular está en la lista; el resto de filas se quita.
const conservar = {
  excavaciones: ['contenedores escombros y residuos', 'otros servicios de contenedores', 'venta de contenedores'],
};
const errores = [];
const quitar = {};
const resumenQuitar = [];
const titular = (p, f) => normT((bloquesDeFila(f).map((i) => p.blocks[i]).find((b) => b.type === 'heading') || {}).text || '');
const anotar = (slug, filas) => { quitar[slug] = [...new Set([...(quitar[slug] || []), ...filas.flatMap(bloquesDeFila)])].sort((a, b) => a - b); };
for (const [slug, lista] of Object.entries(conservar)) {
  const p = paginas.find((x) => x.slug === slug);
  for (const t of lista) if (!p.filas.some((f) => titular(p, f) === t)) errores.push(`${slug}: no hay ninguna fila que empiece por «${t}»`);
  const quitadas = p.filas.filter((f) => !lista.includes(titular(p, f)));
  anotar(slug, quitadas);
  resumenQuitar.push(`${slug}: se quitan ${quitadas.length} filas: ${quitadas.map((f) => titular(p, f) || '(sin titular)').join(' · ')}`);
}
// Yama (2026-11-03): la lista de enlaces a provincias «Nuestra Area de trabajo» solo en la
// página de inicio. En las demás se quita su titular y la fila de enlaces que va detrás.
const listaProvincias = [];
for (const p of paginas) {
  if (p.slug === 'index') continue;
  const k = (p.filas || []).findIndex((f) => titular(p, f) === 'nuestra area de trabajo');
  if (k < 0) continue;
  const sig = p.filas[k + 1];
  // En inicio son enlaces; en el resto, el mismo texto sin enlazar.
  const esLista = sig && bloquesDeFila(sig).every((i) => p.blocks[i].type === 'text' && /^(?:\s*Contenedores [^\n]+\n?){5,}$/.test(p.blocks[i].text || ''));
  if (!esLista) { errores.push(`${p.slug}: tras «Nuestra Area de trabajo» no va la lista de provincias`); continue; }
  anotar(p.slug, [p.filas[k], sig]);
  listaProvincias.push(p.slug);
}
resumenQuitar.push(`lista de provincias quitada en ${listaProvincias.length} páginas (se queda en inicio): ${listaProvincias.join(', ')}`);

// --- Titulares del original cambiados a petición de Yama ---
// Página -> { titular original (sin acentos, minúsculas): titular nuevo }.
// Yama (2026-11-03): en inicio, «Nuestra Area de trabajo» -> «Contenedores por lugares».
const encabezados = {
  index: { 'nuestra area de trabajo': 'Contenedores por lugares' },
};
for (const [slug, m] of Object.entries(encabezados)) {
  const p = paginas.find((x) => x.slug === slug);
  for (const t of Object.keys(m)) if (!p.blocks.some((b) => b.type === 'heading' && normT(b.text) === t)) errores.push(`${slug}: no hay ningún titular «${t}»`);
}

// --- Comprobaciones de las reglas ---
for (const [k, t] of Object.entries(titulos)) if (t.length > MAX) errores.push(`título de ${k} con ${t.length} caracteres`);
const repetidos = Object.values(titulos).filter((t, i, a) => a.indexOf(t) !== i);
if (repetidos.length) errores.push('títulos repetidos: ' + repetidos.join(' | '));
for (const [k, d] of Object.entries(descripciones)) if (d.length > 160) errores.push(`descripción de ${k} con ${d.length} caracteres`);

// --- Recuento de las reglas generales (mayúsculas y fotos) ---
const propios = nombresPropios(ciudades);
let mayus = 0, alts = 0; const ejMayus = new Map(), ejAlt = [];
for (const p of paginas) {
  const nuevos = aplicarCambios(p.blocks, { titulo: h1[p.slug] || p.title, propios });
  p.blocks.forEach((b, i) => {
    if (b.type === 'heading' && esMayusculas(b.text)) { mayus++; ejMayus.set(b.text, nuevos[i].text); }
    if (b.type === 'image' && !(b.alt || '').trim()) { alts++; if (p.slug === 'valencia' && ejAlt.length < 8) ejAlt.push(`valencia: ${b.src.split('/').pop()} -> «${nuevos[i].alt}»`); }
  });
}

const ej = (o, n = 5) => Object.entries(o).slice(0, n).map(([k, v]) => `    ${k}: «${seo[k]?.titulo ?? ''}» -> «${v}»`).join('\n');
console.log(`Títulos acortados: ${Object.keys(titulos).length}\n${ej(titulos)}`);
console.log(`H1 nuevos: ${Object.keys(h1).length} (${Object.entries(h1).map(([k, v]) => `${k} -> «${v}»`).slice(0, 3).join(' · ')} …)`);
console.log(`Descripciones nuevas: ${Object.keys(descripciones).length} (${Object.keys(descripciones).join(', ')})`);
console.log(`Encabezados de MAYÚSCULAS a tipo frase: ${mayus} (${ejMayus.size} textos distintos)\n${[...ejMayus].slice(0, 5).map(([a, b]) => `    «${a}» -> «${b}»`).join('\n')}`);
console.log(`Fotos que reciben texto alternativo: ${alts}\n${ejAlt.map((e) => '    ' + e).join('\n')}`);
console.log(`Titulares cambiados: ${Object.entries(encabezados).map(([s, m]) => Object.entries(m).map(([a, b]) => `${s}: «${a}» -> «${b}»`).join(' · ')).join(' · ')}`);
console.log(`Partes quitadas:\n${resumenQuitar.map((e) => '    ' + e).join('\n')}`);
if (errores.length) { console.log('ERRORES:\n  ' + errores.join('\n  ')); process.exit(1); }
if (SECO) { console.log('\n(--seco: no se ha escrito nada)'); process.exit(0); }

fs.writeFileSync('src/data/fallos-original.json', JSON.stringify({
  aprobado: 'Yama, 2026-11-03 (auditoría SEO/AEO)',
  reglas: ['Encabezados en MAYÚSCULAS -> tipo frase', 'Fotos sin texto alternativo -> alt del titular de su ficha o sección (src/lib/textos.mjs)', 'Bloque Medidas/Recogida de 4 columnas -> «Preguntas frecuentes de contenedores» (src/lib/textos.mjs: detectarFaq)', 'quitar: índices de bloques del original que no se pintan (Excavaciones: lo repetido de contenedores)', 'encabezados: titulares del original cambiados a petición de Yama'],
  titulos, h1, descripciones, tituloFaq, preguntas, quitar, encabezados,
}, null, 1) + '\n');
console.log('\nEscrito src/data/fallos-original.json');
