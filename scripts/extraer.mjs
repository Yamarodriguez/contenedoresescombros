// FASE 1 — Extractor unico del contenido desde el _elementor_data del export.
// Genera, respetando el orden original y sin inventar nada:
//   - src/content/pages/<slug>.json  (fuente editable de Astro; imagenes en /img/)
//   - estructura-viva.json           (encabezados por pagina, para comparar)
//   - contenido-vivo.json            (bloques por pagina con las URL originales)
//   - informes/extraccion.json       (informe) y una lista de imagenes a bajar
// No toca la web ni descarga nada: solo lee el XML de origen/.
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://contenedoresescombros.com';
const ORIGEN = 'origen';
const DIR_PAGES = 'src/content/pages';

// ---------- utilidades XML ----------
function stripCdata(s) {
  if (s == null) return '';
  const m = s.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return (m ? m[1] : s);
}
function tag(block, name) {
  const m = block.match(new RegExp('<' + name + '>([\\s\\S]*?)</' + name + '>'));
  return m ? stripCdata(m[1]) : '';
}
function sliceAll(xml, open, close) {
  const out = []; let i = 0;
  while (true) { const s = xml.indexOf(open, i); if (s < 0) break; const e = xml.indexOf(close, s); if (e < 0) break; out.push(xml.slice(s + open.length, e)); i = e + close.length; }
  return out;
}
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ntilde: 'ñ', Ntilde: 'Ñ', aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', uuml: 'ü', iexcl: '¡', iquest: '¿', ordf: 'ª', ordm: 'º', hellip: '…', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', mdash: '—', ndash: '–', deg: '°', middot: '·', euro: '€' };
function decode(s = '') {
  return s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&([a-z]+);/gi, (m, n) => (n in NAMED ? NAMED[n] : m));
}
const stripTags = (s = '') => decode(String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')).replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/ *\n */g, ' ').trimEnd().replace(/^\s+/, '');

// Limpia restos de anuncios de AdSense/DoubleClick y envoltorios vacios que
// WordPress dejo incrustados en el editor (no son contenido real).
function limpiarHtml(h = '') {
  let t = h;
  t = t.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  t = t.replace(/<ins\b[^>]*adsbygoogle[\s\S]*?<\/ins>/gi, '');
  t = t.replace(/<iframe\b[^>]*(?:googlesyndication|doubleclick|googleads)[\s\S]*?<\/iframe>/gi, '');
  t = t.replace(/<div\b[^>]*(?:title|aria-label)="Advertisement"[^>]*>\s*<\/div>/gi, '');
  for (let i = 0; i < 5; i++) {
    t = t.replace(/<p>(?:\s|&nbsp;| )*<\/p>/gi, '')
      .replace(/<div>\s*<\/div>/gi, '')
      .replace(/<div>\s*<div>\s*<\/div>\s*<\/div>/gi, '');
  }
  return t.trim();
}

// ---------- imagenes: url original -> ruta local /img/ ----------
const descargas = new Map(); // dest -> url
function aLocal(url) {
  if (!url) return { local: url };
  try {
    const u = new URL(url, SITE);
    const k = '/wp-content/uploads/';
    const i = u.pathname.indexOf(k);
    if (i >= 0) {
      const rest = decodeURIComponent(u.pathname.slice(i + k.length));
      const dest = 'public/img/' + rest;
      descargas.set(dest, u.href);
      return { local: '/img/' + rest };
    }
  } catch {}
  return { local: url };
}

// ---------- recorrido del arbol de Elementor -> bloques ----------
const widgetsVistos = {};
const tiposEl = {};
function anadirWidget(e, bloques) {
      if (e.elType === 'widget') {
        const s = e.settings || {};
        widgetsVistos[e.widgetType] = (widgetsVistos[e.widgetType] || 0) + 1;
        switch (e.widgetType) {
          case 'heading': {
            const text = stripTags(s.title);
            if (text) { const b = { type: 'heading', tag: (s.header_size || 'h2'), text }; if (s.link?.url) b.href = s.link.url; bloques.push(b); }
            break;
          }
          case 'text-editor': {
            const html0 = (s.editor || '').trim();
            const cf = html0.match(/\[contact-form-7[^\]]*id=["']?(\d+)/i);
            if (cf) { bloques.push({ type: 'contact_form', form_id: cf[1] }); }
            const limpio = limpiarHtml(html0.replace(/\[contact-form-7[^\]]*\]/gi, ''));
            const text = stripTags(limpio);
            if (text) bloques.push({ type: 'text', text, html: limpio });
            break;
          }
          case 'image': {
            const url = s.image?.url || '';
            if (url) {
              const { local } = aLocal(url);
              const b = { type: 'image', src: local, alt: stripTags(s.image?.alt || s.alt || '') };
              if (s.link?.url && s.link_to === 'custom') b.href = s.link.url;
              bloques.push(b);
            }
            break;
          }
          case 'button': {
            const text = stripTags(s.text);
            if (text || s.link?.url) bloques.push({ type: 'button', text, href: s.link?.url || '' });
            break;
          }
          case 'google_maps': {
            bloques.push({ type: 'map', address: stripTags(s.address || ''), zoom: s.zoom?.size ?? s.zoom ?? 14 });
            break;
          }
          case 'toggle': {
            const items = (s.tabs || []).map((t) => ({ title: stripTags(t.tab_title), text: stripTags(limpiarHtml(t.tab_content || '')), html: limpiarHtml(t.tab_content || '') })).filter((x) => x.title || x.text);
            if (items.length) bloques.push({ type: 'toggle', items });
            break;
          }
          case 'eael-contact-form-7': {
            bloques.push({ type: 'contact_form', form_id: String(s.eael_contact_form_list_7 || s.eael_contact_form_list || s.form_list || '') });
            break;
          }
          case 'shortcode': {
            const sc = s.shortcode || '';
            const cf = sc.match(/\[contact-form-7[^\]]*id=["']?(\d+)/i);
            if (cf) bloques.push({ type: 'contact_form', form_id: cf[1] });
            else if (stripTags(sc)) bloques.push({ type: 'shortcode', text: sc.trim() });
            break;
          }
          // spacer, divider, menu-anchor, etc.: solo visual, se ignoran
        }
      }
}

// Recorre el arbol respetando las filas y columnas de Elementor. Devuelve los
// bloques en el mismo orden de siempre y, aparte, las filas con indices a esos
// bloques (para pintar la maquetacion original: texto al lado de la foto, etc.).
function construirBloques(arbol) {
  const bloques = [];
  const ancho = (c) => {
    const s = c.settings || {};
    const v = +(s._inline_size || s._column_size || (s.width && s.width.unit === '%' ? s.width.size : 0));
    return v > 0 ? v : null;
  };
  function itemsDe(c) {
    const items = [];
    for (const h of c.elements || []) {
      if (h.elType === 'widget') { const i0 = bloques.length; anadirWidget(h, bloques); for (let i = i0; i < bloques.length; i++) items.push({ b: i }); }
      else if (h.elType === 'section' || h.elType === 'container') { const f = filaDe(h); if (f) items.push({ fila: f }); }
      else if (h.elType === 'column') items.push(...itemsDe(h));
    }
    return items;
  }
  function filaDe(e) {
    tiposEl[e.elType] = (tiposEl[e.elType] || 0) + 1;
    const hijos = e.elements || [];
    let cols;
    if (hijos.length && hijos.every((h) => h.elType === 'column')) cols = hijos;
    else if (e.elType === 'container' && String(e.settings?.flex_direction || '').startsWith('row') && hijos.length > 1 && hijos.every((h) => h.elType === 'container')) cols = hijos;
    else cols = [{ elements: hijos, settings: {} }];
    const columnas = cols.map((c) => ({ ancho: cols.length > 1 ? ancho(c) : null, items: itemsDe(c) })).filter((c) => c.items.length);
    return columnas.length ? { columnas } : null;
  }
  const filas = [];
  for (const e of arbol || []) {
    if (e.elType === 'widget') {
      const i0 = bloques.length; anadirWidget(e, bloques);
      const items = []; for (let i = i0; i < bloques.length; i++) items.push({ b: i });
      if (items.length) filas.push({ columnas: [{ ancho: null, items }] });
    } else { const f = filaDe(e); if (f) filas.push(f); }
  }
  return { bloques, filas };
}

// ---------- leer items del export (dedupe por slug, el de _elementor_data mas largo) ----------
const mejores = new Map(); // key -> { slug, title, link, elData, meta }
for (const f of fs.readdirSync(ORIGEN).filter((x) => x.toLowerCase().endsWith('.xml'))) {
  const xml = fs.readFileSync(path.join(ORIGEN, f), 'utf8');
  for (const it of sliceAll(xml, '<item>', '</item>')) {
    const tipo = tag(it, 'wp:post_type');
    const status = tag(it, 'wp:status');
    if (!(tipo === 'page' || tipo === 'post') || status !== 'publish') continue;
    const meta = {};
    for (const pm of sliceAll(it, '<wp:postmeta>', '</wp:postmeta>')) {
      const k = tag(pm, 'wp:meta_key'); if (k) meta[k] = tag(pm, 'wp:meta_value');
    }
    const elData = meta['_elementor_data'] || '';
    const slug = tag(it, 'wp:post_name');
    const link = tag(it, 'link');
    const titleRaw = (it.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
    const title = decode(stripCdata(titleRaw)).trim();
    let pathUrl = '/';
    try { pathUrl = new URL(link).pathname; } catch {}
    const key = slug || (pathUrl === '/' ? 'index' : pathUrl.replace(/^\/|\/$/g, '').replace(/\//g, '-'));
    const prev = mejores.get(key);
    if (!prev || elData.length > prev.elData.length) mejores.set(key, { slug: slug || key, title, link, elData, meta, pathUrl });
  }
}

// ---------- generar ----------
fs.mkdirSync(DIR_PAGES, { recursive: true });
const estructura = {}, contenido = {};
const informe = { paginas: 0, sinElementor: [], errores: [], vacias: [], porTipo: {} };

for (const [key, p] of mejores) {
  const fileSlug = (p.pathUrl === '/' ? 'index' : key);
  if (!p.elData) { informe.sinElementor.push(p.link); continue; }
  let arbol;
  try { arbol = JSON.parse(p.elData); } catch (e) { informe.errores.push(`${p.link}: ${e.message}`); continue; }

  const { bloques, filas } = construirBloques(arbol);
  for (const b of bloques) informe.porTipo[b.type] = (informe.porTipo[b.type] || 0) + 1;
  if (!bloques.length) informe.vacias.push(p.link);

  const headings = bloques.filter((b) => b.type === 'heading').map((b) => ({ tag: b.tag, text: b.text }));

  estructura[key] = { title: p.title, url: p.link, headings };
  contenido[key] = { title: p.title, url: p.link, blocks: bloques };

  const pagina = {
    slug: fileSlug,
    title: p.title,
    url: p.link,
    meta_description: (p.meta['_yoast_wpseo_metadesc'] || '').trim(),
    blocks: bloques,
    filas,
  };
  fs.writeFileSync(path.join(DIR_PAGES, fileSlug + '.json'), JSON.stringify(pagina, null, 1) + '\n');
  informe.paginas++;
}

fs.writeFileSync('estructura-viva.json', JSON.stringify(estructura, null, 1) + '\n');
fs.writeFileSync('contenido-vivo.json', JSON.stringify(contenido, null, 1) + '\n');
fs.mkdirSync('informes', { recursive: true });
const imgs = [...descargas.entries()].map(([dest, url]) => ({ dest, url }));
fs.writeFileSync('informes/imagenes-a-bajar.json', JSON.stringify(imgs, null, 1) + '\n');
fs.writeFileSync('informes/extraccion.json', JSON.stringify({ ...informe, widgetsVistos, imagenes: imgs.length }, null, 1) + '\n');

// ---------- resumen ----------
console.log(`Paginas generadas: ${informe.paginas}`);
console.log('Bloques por tipo: ' + Object.entries(informe.porTipo).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}:${n}`).join('  '));
console.log('Filas/columnas: ' + Object.entries(tiposEl).map(([t, n]) => `${t}:${n}`).join('  '));
console.log('Widgets vistos: ' + Object.entries(widgetsVistos).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}:${n}`).join('  '));
console.log(`Imagenes a bajar: ${imgs.length}`);
if (informe.sinElementor.length) console.log(`Sin Elementor (${informe.sinElementor.length}): ` + informe.sinElementor.join(', '));
if (informe.vacias.length) console.log(`Sin bloques (${informe.vacias.length}): ` + informe.vacias.join(', '));
if (informe.errores.length) { console.log(`ERRORES (${informe.errores.length}):`); informe.errores.forEach((e) => console.log('  ' + e)); }
