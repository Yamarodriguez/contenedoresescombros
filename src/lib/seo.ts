import seo from '../data/seo.json';

export function seoDe(key: string) {
  const s = (seo as Record<string, any>)[key] || {};
  return {
    titulo: s.titulo || '',
    descripcion: s.descripcion || '',
    imagen: s.imagen || '',
    ogTitulo: s.ogTitulo || '',
    ogDescripcion: s.ogDescripcion || '',
  };
}
