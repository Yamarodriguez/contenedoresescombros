// npm run todo:visual: barrido de 404 (C5), contraste (C4) y capturas de cada tipo
// de pagina a 1400 y 390 px. Sirve dist/ con astro preview, asi que hace falta
// haber compilado antes (npm run todo lo hace).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';

const PUERTO = 4331;
const BASE = `http://localhost:${PUERTO}`;
// Un tipo de pagina de cada clase (el diseno se decide por tipo, no por pagina).
const TIPOS = [
  ['inicio', '/'], ['servicio', '/precio/'], ['tipo-contenedor', '/contenedores-escombros-3-m3/'],
  ['ciudad', '/valencia/'], ['provincia', '/madrid/'], ['contacto', '/contacto/'],
  ['legal', '/aviso-legal/'], ['privacidad', '/politica-de-privacidad/'], ['404', '/esta-pagina-no-existe/'],
];
const VISTAS = [['1400', 1400, 900], ['390', 390, 800]];

const servidor = spawn('npx', ['astro', 'preview', '--port', String(PUERTO)], { shell: true, stdio: 'ignore' });
const esperar = async () => { for (let i = 0; i < 60; i++) { try { const r = await fetch(BASE + '/'); if (r.ok) return; } catch {} await new Promise((r) => setTimeout(r, 500)); } throw new Error('El servidor no arrancó'); };

// Se ejecuta dentro de la pagina: contraste de cada texto visible.
const medirContraste = () => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(parseFloat); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mezcla = (f, d) => ({ r: f.r * f.a + d.r * (1 - f.a), g: f.g * f.a + d.g * (1 - f.a), b: f.b * f.a + d.b * (1 - f.a), a: 1 });
  const fondos = (el) => {
    let capa = [{ r: 255, g: 255, b: 255, a: 1 }]; const pila = [];
    for (let e = el; e; e = e.parentElement) pila.push(e);
    for (const e of pila.reverse()) {
      const cs = getComputedStyle(e);
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none') {
        if (/url\(/.test(bi)) return { foto: true };
        const cols = [...bi.matchAll(/rgba?\([^)]+\)/g)].map((m) => parse(m[0])).filter((c) => c && c.a > 0.3);
        if (cols.length) { capa = cols.map((c) => mezcla(c, capa[0])); continue; }
      }
      const bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0) capa = capa.map((c) => mezcla(bg, c));
    }
    return { capa };
  };
  const salida = [];
  const vistos = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const propio = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!propio) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.bottom < 0 || r.right < 0 || r.left > innerWidth + 50) continue;
    const fg = parse(cs.color); if (!fg) continue;
    const px = parseFloat(cs.fontSize), peso = parseInt(cs.fontWeight, 10);
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);
    const minimo = grande ? 3 : 4.5;
    const f = fondos(el);
    const clave = el.tagName + cs.color + cs.fontSize + (el.className || '') + (f.foto ? 'foto' : JSON.stringify(f.capa));
    if (vistos.has(clave)) continue; vistos.add(clave);
    if (f.foto) { salida.push({ tipo: 'foto', texto: el.textContent.trim().slice(0, 40), el: el.tagName + '.' + el.className }); continue; }
    const peor = Math.min(...f.capa.map((b) => ratio(mezcla(fg, b), b)));
    if (peor < minimo) salida.push({ tipo: 'bajo', ratio: +peor.toFixed(2), minimo, texto: el.textContent.trim().slice(0, 40), el: el.tagName + '.' + el.className });
  }
  return { lista: salida, medidos: vistos.size };
};

try {
  await esperar();
  const navegador = await chromium.launch();
  fs.mkdirSync('capturas/visual', { recursive: true });
  const informe = { fallos404: [], contraste: [], desborde: [], fotosAMano: [] };
  for (const [nombre, ruta] of TIPOS) {
    for (const [vista, ancho, alto] of VISTAS) {
      const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto } });
      const mal = [];
      pagina.on('response', (r) => { const u = r.url(); if (r.status() >= 400 && u.startsWith(BASE) && !(nombre === '404' && u === BASE + ruta)) mal.push(`${r.status()} ${u.replace(BASE, '')}`); });
      pagina.on('requestfailed', (r) => { if (r.url().startsWith(BASE)) mal.push(`fallo ${r.url().replace(BASE, '')}`); });
      await pagina.goto(BASE + ruta, { waitUntil: 'networkidle' });
      await pagina.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
      await pagina.evaluate(async () => { document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; }); for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
      await pagina.evaluate(async () => { await Promise.all([...document.images].map((i) => i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))); });
      await pagina.waitForTimeout(300);
      const rotas = await pagina.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')));
      rotas.forEach((r) => informe.fallos404.push(`${nombre} (${vista}): foto sin cargar ${r}`));
      mal.forEach((m) => informe.fallos404.push(`${nombre} (${vista}): ${m}`));
      const medida = await pagina.evaluate(medirContraste);
      informe.medidos = (informe.medidos || 0) + medida.medidos;
      for (const c of medida.lista) {
        if (c.tipo === 'foto') informe.fotosAMano.push(`${nombre} (${vista}): ${c.el} «${c.texto}»`);
        else informe.contraste.push(`${nombre} (${vista}): ${c.ratio}:1 (mín. ${c.minimo}) ${c.el} «${c.texto}»`);
      }
      const altoCab = await pagina.evaluate(() => Math.round(document.querySelector('.cabecera')?.getBoundingClientRect().height || 0));
      if (altoCab > (vista === '390' ? 140 : 170)) informe.desborde.push(`${nombre} (${vista}): la cabecera mide ${altoCab} px`);
      if (vista === '390' && await pagina.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) informe.desborde.push(`${nombre}: la página se sale de la pantalla a 390 px`);
      await pagina.addStyleTag({ content: '.cabecera { position: relative !important; top: auto !important; }' });
      await pagina.screenshot({ path: `capturas/visual/${nombre}-${vista}.png`, fullPage: true });
      await pagina.close();
    }
  }
  await navegador.close();
  fs.mkdirSync('informes', { recursive: true });
  fs.writeFileSync('informes/visual.json', JSON.stringify(informe, null, 1));
  const fallos = informe.fallos404.length + informe.contraste.length + informe.desborde.length;
  console.log(`Visual (${informe.medidos} grupos de texto medidos): ${informe.fallos404.length} 404, ${informe.contraste.length} de contraste, ${informe.desborde.length} desbordes; ${informe.fotosAMano.length} textos sobre foto a revisar a mano`);
  [...informe.fallos404, ...informe.contraste, ...informe.desborde].slice(0, 25).forEach((x) => console.log('  ' + x));
  process.exitCode = fallos ? 1 : 0;
} finally {
  servidor.kill();
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(servidor.pid), '/t', '/f'], { stdio: 'ignore' });
}
