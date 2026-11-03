// Reconstruye src/data/menus.json desde el menu que pinto WordPress (referencia/),
// con su orden y anidado reales. Tema Astra: menu principal en el nav
// "primary-site-navigation-desktop" y pie en "footer-site-navigation".
// Se usa el menu mas completo para todas las paginas (contiene a los demas).
import fs from 'node:fs';
import path from 'node:path';

const decode = (s) => s.replace(/&amp;|&#038;/g, '&').replace(/&#8211;/g, '–').replace(/&#039;|&#8217;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const rel = (u) => u.replace(/^https?:\/\/(?:www\.)?contenedoresescombros\.com(?=\/)/i, '').replace(/^https?:\/\/(?:www\.)?contenedoresescombros\.com$/i, '/');

function arbol(nav) {
  const raiz = { hijos: [] }; const pila = [raiz];
  const re = /<li\b[^>]*>|<\/li>|<ul\b[^>]*>|<\/ul>|<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const m of nav.matchAll(re)) {
    const t = m[0].toLowerCase();
    if (t.startsWith('<li')) { const n = { hijos: [] }; pila[pila.length - 1].hijos.push(n); pila.push(n); }
    else if (t.startsWith('</li')) pila.pop();
    else if (t.startsWith('<a')) { const n = pila[pila.length - 1]; if (n && !n.label) { n.url = rel(m[1]); n.label = decode(m[2].replace(/<[^>]+>/g, '')); } }
  }
  const limpia = (n) => ({ label: n.label, url: n.url, children: n.hijos.filter((h) => h.label).map(limpia) });
  return raiz.hijos.filter((h) => h.label).map(limpia);
}
const contar = (arr) => arr.reduce((n, x) => n + 1 + contar(x.children || []), 0);
function navDe(html, id) {
  const re = new RegExp(`<nav[^>]*id="${id}"[\\s\\S]*?</nav>`, 'i');
  const m = html.match(re);
  return m ? arbol(m[0]) : null;
}

const variantes = []; const pies = [];
for (const f of fs.readdirSync('referencia')) {
  if (!f.endsWith('.html')) continue;
  const h = fs.readFileSync(path.join('referencia', f), 'utf8');
  const p = navDe(h, 'primary-site-navigation-desktop');
  if (p) variantes.push(p);
  const pie = navDe(h, 'footer-site-navigation');
  if (pie) pies.push(pie);
}
const mejor = (lista) => lista.sort((a, b) => contar(b) - contar(a))[0] || [];
const principal = mejor(variantes);
const pie = mejor(pies);
// Entradas nuevas que no vienen de WordPress (páginas de src/data/paginas-nuevas.json).
// Yama (2026-11-03): «Contenedores de tierra» en «Medidas y tipos», detrás de la de poda.
const ANADIDOS = [
  { dentro: 'Medidas y tipos', despues: '/poda/', label: 'Contenedores de tierra', url: '/contenedores-de-tierra/' },
];
for (const a of ANADIDOS) {
  const padre = principal.find((e) => e.label === a.dentro);
  if (!padre) throw new Error(`Menú: no está «${a.dentro}»`);
  if (padre.children.some((c) => c.url === a.url)) continue;
  const k = padre.children.findIndex((c) => c.url === a.despues);
  padre.children.splice(k < 0 ? padre.children.length : k + 1, 0, { label: a.label, url: a.url, children: [] });
}
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/menus.json', JSON.stringify({ principal, pie }, null, 1) + '\n');
console.log(`Menu principal: ${contar(principal)} entradas (${principal.length} arriba). Pie: ${contar(pie)} entradas. Variantes vistas: ${new Set(variantes.map((v) => JSON.stringify(v))).size}`);
console.log('Arriba: ' + principal.map((e) => e.label).join(' · '));
