import type { APIRoute } from 'astro';
import site from '../data/site.json';
import ciudades from '../data/ciudades.json';
import datosExcavacion from '../data/excavaciones-ciudades.json';
import { paginasExcavacion } from '../lib/excavaciones.mjs';
import lugares from '../data/lugares-nuevos.json';
import { paginasContenedores } from '../lib/lugares.mjs';
import { listaLugares } from "../lib/lugares.mjs";
import paginasNuevas from '../data/paginas-nuevas.json';
import indexacion from "../data/indexacion.json";
import { indexable, nuevosSlugs } from "../lib/indexacion.mjs";

const nuevos = nuevosSlugs(listaLugares(lugares));
const files = import.meta.glob('../content/pages/*.json', { eager: true });

export const GET: APIRoute = () => {
  const urls = [
    // Las legales llevan «noindex» y no van en el mapa (Yama, 2026-11-03).
    ...Object.values(files).map((m: any) => m.default).filter((d: any) => !/^(aviso-legal|politica-de-)/.test(d.slug)).map((d: any) => d.url as string),
    // Páginas de excavaciones por ciudad (nuevas, no vienen de WordPress).
    ...paginasExcavacion(datosExcavacion, ciudades).filter((p: any) => indexable(p.slug, nuevos, indexacion.indexar)).map((p: any) => `https://${site.dominio}${p.ruta}`),
    ...paginasContenedores(lugares, ciudades).filter((p: any) => indexable(p.slug, nuevos, indexacion.indexar)).map((p: any) => `https://${site.dominio}${p.ruta}`),
    // Otras páginas nuevas (src/data/paginas-nuevas.json), p. ej. /contenedores-de-tierra/.
    ...Object.keys(paginasNuevas).filter((k) => !k.startsWith('_')).map((k) => `https://${site.dominio}/${k}/`),
  ].sort();
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
