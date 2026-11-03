import type { APIRoute } from 'astro';
import site from '../data/site.json';
import ciudades from '../data/ciudades.json';
import datosExcavacion from '../data/excavaciones-ciudades.json';
import { paginasExcavacion } from '../lib/excavaciones.mjs';

const files = import.meta.glob('../content/pages/*.json', { eager: true });

export const GET: APIRoute = () => {
  const urls = [
    ...Object.values(files).map((m: any) => m.default.url as string),
    // Páginas de excavaciones por ciudad (nuevas, no vienen de WordPress).
    ...paginasExcavacion(datosExcavacion, ciudades).map((p: any) => `https://${site.dominio}${p.ruta}`),
  ].sort();
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
