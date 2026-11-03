// npm run todo: compila, valida y compara. Anuncia [n/N] y, si algo falla,
// dice "SE HA PARADO EN: <paso>". Cada paso deja su informe en informes/.
import { spawnSync } from 'node:child_process';

const pasos = [
  ['Medidas de imagen', 'node', ['scripts/medidas-imagenes.mjs']],
  ['Compilar', 'npx', ['astro', 'build']],
  ['Validar (C3)', 'node', ['scripts/validar.mjs']],
  ['Encabezados (C1)', 'node', ['scripts/comparar-encabezados.mjs']],
  ['Contenido (C2)', 'node', ['scripts/comparar-contenido.mjs']],
  ['SEO (títulos, descripciones, mapa)', 'node', ['scripts/comparar-seo.mjs']],
];

pasos.forEach(([nombre, cmd, args], i) => {
  console.log(`[${i + 1}/${pasos.length}] ${nombre}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`\nSE HA PARADO EN: ${nombre}`);
    process.exit(r.status || 1);
  }
});
console.log('\nTODO A 0');
