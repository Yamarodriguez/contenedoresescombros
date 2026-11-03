// Capturas de revision: varias pantallas seguidas de cada tipo de pagina, a
// escritorio y movil, para ver la maquetacion de verdad (no solo la cabecera).
// Uso: node scripts/capturas-paginas.mjs [base|local] [carpeta]
//   base por defecto: la web en Netlify. «local» sirve dist/ con astro preview.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';

const ARG = process.argv[2] || 'https://contenedoresescombros.netlify.app';
const LOCAL = ARG === 'local';
const BASE = LOCAL ? 'http://localhost:4333' : ARG;
let servidor = null;
if (LOCAL) {
  servidor = spawn('npx', ['astro', 'preview', '--port', '4333'], { shell: true, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE + '/')).ok) break; } catch {} await new Promise((r) => setTimeout(r, 500)); }
}
const CARPETA = process.argv[3] || 'capturas/revision';
// 4.º argumento opcional: una sola ruta (p. ej. /excavaciones/), con más pantallas.
const RUTA = process.argv[4];
const PAGINAS = RUTA ? [[RUTA.replace(/\//g, '') || 'inicio', RUTA]] : [
  ['inicio', '/'], ['ciudad', '/valencia/'], ['tipo', '/contenedores-escombros-3-m3/'],
  ['servicio', '/precio/'], ['contacto', '/contacto/'], ['legal', '/aviso-legal/'],
];
const VISTAS = RUTA ? [['escritorio', 1440, 900, 6], ['movil', 390, 844, 10]] : [['escritorio', 1440, 900, 4], ['movil', 390, 844, 3]];

fs.mkdirSync(CARPETA, { recursive: true });
const nav = await chromium.launch();
for (const [nombre, ruta] of PAGINAS) {
  for (const [vista, ancho, alto, pantallas] of VISTAS) {
    const p = await nav.newPage({ viewport: { width: ancho, height: alto } });
    await p.goto(BASE + ruta, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
    await p.evaluate(async () => {
      document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      await Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))));
    });
    const altoTotal = await p.evaluate(() => document.body.scrollHeight);
    for (let i = 0; i < pantallas; i++) {
      await p.evaluate((y) => window.scrollTo(0, y), i * alto);
      await p.waitForTimeout(150);
      await p.screenshot({ path: `${CARPETA}/${nombre}-${vista}-${i + 1}.png` });
    }
    console.log(`${nombre} ${vista}: alto total ${altoTotal}px (${Math.round(altoTotal / alto)} pantallas)`);
    await p.close();
  }
}
await nav.close();
if (servidor) {
  servidor.kill();
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(servidor.pid), '/t', '/f'], { stdio: 'ignore' });
}
