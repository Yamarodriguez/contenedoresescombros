import type { APIRoute } from 'astro';
import site from '../data/site.json';
import seo from '../data/seo.json';
import ciudades from '../data/ciudades.json';
import cambiosData from '../data/fallos-original.json';
import { tipoFrase, nombresPropios } from '../lib/textos.mjs';

// llms.txt: resumen de la web para asistentes de IA (qué es, datos clave y
// enlaces agrupados con una línea de descripción). Solo datos que ya están en la web.
const files = import.meta.glob('../content/pages/*.json', { eager: true });
const cambios = cambiosData as any;
const propios = nombresPropios(ciudades);
const ciudadesData = ciudades as Record<string, any>;
const seoData = seo as Record<string, any>;

const SERVICIOS = ['precio', 'medidas', 'alquiler', 'transporte', 'recogida-escombros', 'habilitacion-contenedores-escombros-via-publica', 'sacos-para-escombros', 'poda', 'venta', 'excavaciones', 'camiones-portacontenedores', 'presupuesto', 'contacto', 'empresa'];
const LEGALES = ['aviso-legal', 'politica-de-privacidad', 'politica-de-cookies'];

const limpia = (t = '') => t.replace(/\p{Extended_Pictographic}/gu, '').replace(/️/g, '').replace(/\s+/g, ' ').trim();

export const GET: APIRoute = () => {
  const pages = Object.values(files).map((m: any) => m.default);
  const porSlug = new Map(pages.map((p: any) => [p.slug, p]));
  const clave = (p: any) => new URL(p.url).pathname.replace(/^\/|\/$/g, '') || 'index';
  const nombre = (p: any) => cambios.h1[p.slug] || tipoFrase(p.title, propios);
  const desc = (p: any) => limpia(cambios.descripciones[clave(p)] || seoData[clave(p)]?.descripcion || '');
  const linea = (p: any) => `- [${nombre(p)}](${p.url})${desc(p) ? ': ' + desc(p) : ''}`;

  const servicios = SERVICIOS.map((s) => porSlug.get(s)).filter(Boolean);
  const tamanos = pages.filter((p: any) => /^contenedores-escombros-(\d+-m3|con-llave)$/.test(p.slug)).sort((a: any, b: any) => (parseInt(a.slug.match(/\d+/)?.[0] || '999') - parseInt(b.slug.match(/\d+/)?.[0] || '999')));
  const lugares = pages.filter((p: any) => ciudadesData[p.slug]).sort((a: any, b: any) => ciudadesData[a.slug].nombre.localeCompare(ciudadesData[b.slug].nombre, 'es'));
  const legales = LEGALES.map((s) => porSlug.get(s)).filter(Boolean);

  const body = `# ${site.nombre}

> Web sobre contenedores de escombros (también llamados contenedores de obra, cubas o cubetas) en España: tamaños de 3 a 30 m³, medidas, materiales que se pueden echar, permiso para la vía pública, precios orientativos y presupuesto sin compromiso. Tiene páginas para ${lugares.length} provincias y localidades; su titular está en Valencia.

Contacto: WhatsApp y teléfono ${site.telefono} · ${site.correo} · ${site.dominio ? `https://${site.dominio}/contacto/` : ''}

## Datos clave
- Tamaños: saco para escombros (big bag), contenedores de 3, 5, 9, 12, 20 y 30 m³, contenedor con llave y contenedor de poda.
- Materiales que se admiten: tierra, escombros, hormigón, ladrillos, tejas y materiales cerámicos, madera, vidrio, plástico, metales, cartón y materiales de aislamiento sin sustancias peligrosas.
- Precio orientativo publicado en esta web: un contenedor de 5 a 6 m³ puede costar aproximadamente entre 80 y 170 € por semana, y unos 250 € con transporte, recogida y descarga. Depende del tamaño, la zona y los días.
- Vía pública: para dejar el contenedor en la calle hace falta autorización del ayuntamiento.

## Servicios
${servicios.map(linea).join('\n')}

## Tamaños de contenedor
${tamanos.map(linea).join('\n')}

## Provincias y localidades
${lugares.map((p: any) => `- [${nombre(p)}](${p.url})${ciudadesData[p.slug].provincia ? ` (provincia de ${ciudadesData[p.slug].provincia})` : ''}`).join('\n')}

## Información legal
${legales.map(linea).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
