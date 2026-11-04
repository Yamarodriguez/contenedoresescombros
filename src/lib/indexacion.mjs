// Indexación por lotes de los lugares nuevos (Yama, 2026-11-04).
// Un lugar nuevo sale indexable solo si su clave está en src/data/indexacion.json («indexar»).
// Las páginas de WordPress y las de lugares ya existentes siempre se indexan.
export const nuevosSlugs = (lista) => new Set(lista.map((l) => l.clave));
export const indexable = (slug, nuevos, indexados) => !nuevos.has(slug) || indexados.includes(slug);
