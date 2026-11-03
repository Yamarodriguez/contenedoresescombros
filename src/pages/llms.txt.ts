import type { APIRoute } from 'astro';
import site from '../data/site.json';

const files = import.meta.glob('../content/pages/*.json', { eager: true });

export const GET: APIRoute = () => {
  const pages = Object.values(files).map((m: any) => m.default).sort((a: any, b: any) => a.url.localeCompare(b.url));
  const linea = (p: any) => `- [${p.title}](${p.url})`;
  const body = `# ${site.nombre}

> ${site.descripcion}

Contacto: WhatsApp y teléfono ${site.telefono} · correo ${site.correo}.

## Páginas
${pages.map(linea).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
