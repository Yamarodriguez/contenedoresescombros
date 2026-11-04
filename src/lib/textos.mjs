// Reglas de texto aprobadas por Yama el 2026-11-03 (auditoría SEO/AEO). Se aplican
// al pintar la página y en los comprobadores; el contenido original
// (src/content/pages, contenido-vivo.json) no se toca. Lo puntual (títulos, H1,
// descripciones) va en src/data/fallos-original.json.

const letras = (t) => (t.match(/\p{L}/gu) || []).length;
const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** ¿Está escrito todo en MAYÚSCULAS? (al menos 4 letras) */
export function esMayusculas(t = '') {
  return letras(t) >= 4 && t === t.toLocaleUpperCase('es') && t !== t.toLocaleLowerCase('es');
}

/** MAYÚSCULAS -> tipo frase, devolviendo su forma a los nombres propios. */
export function tipoFrase(t = '', propios = []) {
  if (!esMayusculas(t)) return t;
  let s = t.toLocaleLowerCase('es');
  s = s.replace(/\p{L}/u, (c) => c.toLocaleUpperCase('es'));
  for (const p of [...propios].sort((a, b) => b.length - a.length)) {
    if (!p) continue;
    const re = new RegExp(`(?<!\\p{L})${escapar(p.toLocaleLowerCase('es'))}(?!\\p{L})`, 'gu');
    s = s.replace(re, p);
  }
  return s;
}

const limpiarAlt = (t = '') => t.replace(/^[¿¡\s]+/, '').replace(/[?!.:;,\s]+$/, '').replace(/\s+/g, ' ').trim();

/**
 * Texto alternativo para una foto que no lo tiene, sacado del contenido de la
 * propia página (sin inventar): el titular enlazado a lo mismo que la foto (fichas
 * de tipos), si no el último titular anterior, y si no el título de la página.
 */
export function altPara(bloques, i, porDefecto = '', propios = []) {
  const img = bloques[i];
  const sig = bloques[i + 1], ant = bloques[i - 1];
  let t = '';
  if (img.href && sig && sig.type === 'heading' && sig.href === img.href) t = sig.text;
  else if (img.href && ant && ant.type === 'heading' && ant.href === img.href) t = ant.text;
  else {
    for (let k = i - 1; k >= 0; k--) {
      const b = bloques[k];
      if (b.type === 'heading' && /^h[1-4]$/.test(b.tag)) { t = b.text; break; }
    }
  }
  return limpiarAlt(tipoFrase(t || porDefecto, propios));
}

/** Aplica las reglas a los bloques de una página: encabezados en tipo frase y alt de las fotos. */
export function aplicarCambios(bloques, { titulo = '', propios = [], encabezados = {} } = {}) {
  return bloques.map((b, i) => {
    if (b.type === 'heading') return { ...b, text: encabezados[normT(b.text)] || tipoFrase(b.text, propios) };
    if (b.type === 'image' && !(b.alt || '').trim()) return { ...b, alt: altPara(bloques, i, titulo, propios) };
    return b;
  });
}

export const normT = (t = '') => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[.\s]+$/, '').replace(/\s+/g, ' ').trim();

/**
 * Fichas de «Otros servicios de contenedores» (Yama, 2026-11-04): el titular y la foto de cada
 * ficha enlazan a su servicio. Excavaciones va a la página de excavaciones de ese lugar si la
 * tiene. Una ficha no enlaza a la página en la que está. También corrige los textos de las
 * fichas que estaban mal en el original (texto de otra ficha, erratas y acentos).
 */
export function enlazarOtrosServicios(bloques, { slug = '', excavacion = '/excavaciones/' } = {}) {
  const k = bloques.findIndex((b) => b.type === 'heading' && /^otros servicios/.test(normT(b.text)));
  if (k < 0) return bloques;
  const destino = (t) => {
    const n = normT(t);
    if (/^(venta|comprar) de? ?contenedores/.test(n) || n === 'comprar contenedores') return '/venta/';
    if (/^excavaciones/.test(n)) return excavacion;
    if (/^contenedores maritimos/.test(n)) return 'https://contenedoresmaritimos.net/';
    if (/^casas contenedores/.test(n)) return 'https://casascontenedores.es/';
    if (/^camiones portacontenedores/.test(n)) return '/camiones-portacontenedores/';
    return null;
  };
  const textoCorregido = (ficha, t) => {
    if (/^venta de contenedores/.test(ficha) && /^si tienes un contenedor/.test(t)) return 'Si tienes un contenedor y quieres venderlo, estás en el sitio adecuado.';
    if (/^comprar contenedores/.test(ficha) && /^quieres comprar/.test(t)) return '¿Quieres comprar un contenedor y conocer sus precios? Consulta más.';
    if (/^contenedores maritimos/.test(ficha) && /^quieres comprar/.test(t)) return 'Conoce todas nuestras opciones en contenedores marítimos; contenedores para transporte, casas, oficinas, etc.';
    if (/^excavaciones/.test(ficha) && /construcciones de oficinas/.test(t)) return 'Realizamos todo tipo de excavaciones y movimiento de tierra. Contáctanos y te asesoramos.';
    if (/^camiones portacontenedores/.test(ficha) && /^venta de camiones/.test(t)) return 'Venta de camiones portacontenedores. Si necesitas un camión, no dudes en consultarnos. Precios y garantías.';
    return null;
  };
  let act = null; let ficha = '';
  return bloques.map((b, i) => {
    if (i <= k) return b;
    if (b.type === 'heading') { act = destino(b.text); ficha = normT(b.text); }
    if (b.type === 'text') {
      const nuevo = textoCorregido(ficha, normT(b.text));
      return nuevo ? { ...b, text: nuevo, html: `<p>${nuevo}</p>` } : b;
    }
    if (!act || act === `/${slug}/` || (b.type !== 'heading' && b.type !== 'image')) return b;
    return { ...b, href: act };
  });
}

/** Índices de todos los bloques de una fila, con sus filas anidadas. */
export function bloquesDeFila(fila) {
  return fila.columnas.flatMap((c) => c.items.flatMap((it) => (it.fila ? bloquesDeFila(it.fila) : [it.b])));
}

/**
 * Bloque de 4 columnas «titular H2 + texto | foto + botón | titular H2 + texto | foto + botón»
 * (Medidas / Recogida) -> preguntas frecuentes. Devuelve null si la fila no es ese bloque o
 * si algún titular no tiene pregunta aprobada en `preguntas`.
 */
export function detectarFaq(fila, bloques, preguntas = {}) {
  const cols = fila && fila.columnas;
  if (!cols || cols.length !== 4) return null;
  const tipos = (c) => c.items.map((it) => (it.fila ? 'fila' : (bloques[it.b] || {}).type)).join(',');
  const items = [];
  for (const [a, b] of [[cols[0], cols[1]], [cols[2], cols[3]]]) {
    if (tipos(a) !== 'heading,text' || tipos(b) !== 'image,button') return null;
    const h = a.items[0].b;
    const q = preguntas[normT(bloques[h].text)];
    if (!q || bloques[h].tag !== 'h2') return null;
    items.push({ q, h, t: a.items[1].b, img: b.items[0].b, btn: b.items[1].b });
  }
  return { items };
}

/** Índice del titular original -> pregunta, para todas las filas convertidas de una página. */
export function preguntasConvertidas(bloques, filas, preguntas = {}) {
  const m = new Map();
  for (const f of filas || []) { const d = detectarFaq(f, bloques, preguntas); if (d) for (const it of d.items) m.set(it.h, it.q); }
  return m;
}

/** Nombres propios que hay que respetar al quitar las mayúsculas. */
export function nombresPropios(ciudades = {}) {
  const s = new Set(['España', 'Comunidad Valenciana', 'Canarias', 'Cataluña']);
  for (const c of Object.values(ciudades)) { if (c.nombre) s.add(c.nombre); if (c.provincia) s.add(c.provincia); }
  return [...s];
}
