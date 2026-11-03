// Capturas de una pagina con cada tema (para elegir diseno). Arranca astro preview,
// asi que hace falta haber compilado antes (npm run build).
// Uso: node scripts/capturas-temas.mjs /ruta/ a,b,c
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';

const PUERTO = 4332;
const BASE = `http://localhost:${PUERTO}`;
const ruta = process.argv[2] || '/';
const temas = (process.argv[3] || 'a,b,c').split(',');
const VISTAS = [['escritorio', 1440, 1000], ['movil', 390, 780]];

const servidor = spawn('npx', ['astro', 'preview', '--port', String(PUERTO)], { shell: true, stdio: 'ignore' });
const esperar = async () => { for (let i = 0; i < 60; i++) { try { const r = await fetch(BASE + '/'); if (r.ok) return; } catch {} await new Promise((r) => setTimeout(r, 500)); } throw new Error('El servidor no arrancó'); };

try {
  await esperar();
  const nav = await chromium.launch();
  fs.mkdirSync('capturas', { recursive: true });
  for (const t of temas) {
    for (const [nombre, ancho, alto] of VISTAS) {
      const p = await nav.newPage({ viewport: { width: ancho, height: alto } });
      await p.goto(`${BASE}${ruta}?tema=${t}`, { waitUntil: 'networkidle' });
      await p.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
      await p.evaluate(async () => {
        document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; });
        for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 150));
      });
      await p.evaluate(async () => { await Promise.all([...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))); });
      await p.waitForTimeout(300);
      await p.screenshot({ path: `capturas/tema-${t}-${nombre}.png`, fullPage: false });
      await p.close();
    }
  }
  await nav.close();
  console.log('Capturas hechas: ' + temas.map((t) => `tema-${t}`).join(', '));
} finally {
  servidor.kill();
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(servidor.pid), '/t', '/f'], { stdio: 'ignore' });
}
