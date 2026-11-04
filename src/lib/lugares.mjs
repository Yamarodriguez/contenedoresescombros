// Lugares nuevos sacados de casascontenedores.es (Yama, 2026-11-04): pueblos y ciudades sin
// página de WordPress. Datos en src/data/lugares-nuevos.json. Cada uno tiene dos páginas:
// /contenedores-escombros-<lugar>/ (plantilla de aquí) y /excavaciones-<lugar>/ (src/lib/excavaciones.mjs).
// Textos neutros y sin precios: no dicen quién presta el servicio.

const MAX_TITULO = 60, MAX_DESC = 160;
const primero = (opciones, max) => opciones.find((t) => t.length <= max) || opciones[opciones.length - 1];

const sinAcentos = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '');
export const slugLugar = (nombre) => sinAcentos(nombre).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const claveLugar = (nombre) => `contenedores-escombros-${slugLugar(nombre)}`;

/** Lista plana: { clave, nombre, municipio, provinciaSlug, comunidad }. */
export function listaLugares(datos) {
  return datos.grupos.flatMap((g) => g.lugares.map((l) => {
    const [nombre, municipio] = Array.isArray(l) ? l : [l, l];
    return { clave: claveLugar(nombre), nombre, municipio, provinciaSlug: g.provincia, comunidad: g.comunidad };
  }));
}

const CIUDAD_AUTONOMA = new Set(['Ceuta', 'Melilla']);

/** Páginas de contenedores de escombros de los lugares nuevos. */
export function paginasContenedores(datos, ciudades) {
  return listaLugares(datos).filter((l) => ciudades[l.clave]).map((l) => {
    const n = l.nombre;
    const ayto = `Ayuntamiento de ${l.municipio}`;
    const prov = ciudades[l.clave].provincia;
    const situacion = CIUDAD_AUTONOMA.has(n) ? `${n} es una ciudad autónoma.` : `${n} está en la provincia de ${prov}.`;
    const faq = [
      { pregunta: `¿Cuánto cuesta un contenedor de escombros en ${n}?`, respuesta: 'Depende del tamaño, de los días que lo necesites, de la distancia y del tipo de residuo. Lo mejor es pedir presupuesto indicando la dirección de la obra.' },
      { pregunta: `¿Hace falta permiso para dejar un contenedor en la calle en ${n}?`, respuesta: `Sí, hay que comunicarlo o pedir permiso al ${ayto}. Si el contenedor va dentro de la parcela o de la obra, ese permiso no hace falta.` },
      { pregunta: `¿Qué tamaño de contenedor necesito para una reforma en ${n}?`, respuesta: 'Para una reforma en casa suele bastar uno de 3 o 5 m³. Para obras grandes o demoliciones se usan los de 20 o 30 m³.' },
      { pregunta: '¿Qué no se puede echar en un contenedor de escombros?', respuesta: 'Residuos peligrosos, como el amianto (uralita), las pinturas, los disolventes o los aceites, ni basura doméstica.' },
    ];
    const contenido = {
      subtitulo: `Tamaños, de qué depende el precio y qué permiso necesitas en ${n}. Presupuesto sin compromiso.`,
      entradilla: `<p>Un <strong>contenedor de escombros en ${n}</strong>, también llamado cuba o contenedor de obra, sirve para retirar los residuos de una obra o una reforma y llevarlos a un gestor autorizado. ${situacion}</p><p>Aquí tienes los tamaños, qué se puede echar, de qué depende el precio y qué permiso hace falta en ${n}.</p>`,
      secciones: [
        {
          h2: `Tamaños de contenedores de escombros en ${n}`,
          foto: { nombre: 'tamanos-de-cubas-de-escombros' },
          html: '<p>El tamaño se elige según la cantidad de residuos, lo que pesan y el sitio donde va a quedar el contenedor.</p>',
          tarjetas: [
            { h3: 'Sacos para escombros', html: '<p>Para poca cantidad o calles estrechas. Mira los <a href="/sacos-para-escombros/">sacos para escombros</a>.</p>' },
            { h3: 'Contenedores de 3 y 5 m³', html: '<p>Para reformas y materiales pesados. Mira los de <a href="/contenedores-escombros-3-m3/">3 m³</a> y <a href="/contenedores-escombros-5-m3/">5 m³</a>.</p>' },
            { h3: 'Contenedores de 9 y 12 m³', html: '<p>Para reformas grandes y material ligero. Mira los de <a href="/contenedores-escombros-9-m3/">9 m³</a> y <a href="/contenedores-escombros-12-m3/">12 m³</a>.</p>' },
            { h3: 'Contenedores de 20 y 30 m³', html: '<p>Para obras grandes y demoliciones. Mira los de <a href="/contenedores-escombros-20-m3/">20 m³</a> y <a href="/contenedores-escombros-30-m3/">30 m³</a>.</p>' },
          ],
        },
        {
          h2: `Qué se puede echar en un contenedor en ${n}`,
          html: '<p>Tierra, escombros, hormigón, ladrillos, tejas y materiales cerámicos, además de madera, vidrio, plástico, metales y cartón. No se admiten residuos peligrosos. Para la tierra, mira los <a href="/contenedores-de-tierra/">contenedores de tierra</a>; para una obra en casa, los <a href="/contenedores-para-reformas/">contenedores para reformas</a>.</p>',
        },
        {
          h2: `Precio de un contenedor de escombros en ${n}`,
          html: '<p>Se calcula para cada obra. Depende del <strong>tamaño</strong> del contenedor, de los <strong>días</strong> que lo tengas, de la <strong>distancia</strong> y del <strong>tipo de residuo</strong>. Mira los <a href="/precio/">precios orientativos de los contenedores</a>.</p>',
        },
        {
          h2: `Permiso para el contenedor en la calle en ${n}`,
          html: `<p>Si el contenedor va en la vía pública, hay que comunicarlo o pedir permiso al <strong>${ayto}</strong>. Si va dentro de la parcela o de la obra, ese permiso no hace falta. Mira cómo funciona la <a href="/habilitacion-contenedores-escombros-via-publica/">habilitación de contenedores en la vía pública</a>.</p>`,
        },
        {
          h2: `Recogida y transporte de escombros en ${n}`,
          html: '<p>Cuando el contenedor está lleno, el camión lo retira y los residuos van a un gestor autorizado. Mira la <a href="/recogida-escombros/">recogida de escombros</a> y el <a href="/transporte/">transporte de escombros</a>.</p>',
        },
        { h2: `Preguntas frecuentes sobre contenedores en ${n}`, faq },
        {
          h2: `Pide presupuesto de contenedor en ${n}`,
          html: `<p>Cuéntanos dónde está la obra en ${n}, qué tamaño necesitas y cuántos días, y te enviamos un presupuesto sin compromiso.</p>`,
          boton: { texto: 'Pide presupuesto', href: '/presupuesto/' },
        },
      ],
    };
    return {
      slug: l.clave, ruta: `/${l.clave}/`, nombre: n,
      clave: `Contenedores de escombros en ${n}`,
      h1: `Contenedores de escombros en ${n}`,
      titulo: primero([`Contenedores de escombros en ${n}: precio y alquiler`, `Contenedores de escombros en ${n}: precio`, `Contenedores de escombros en ${n}`], MAX_TITULO),
      descripcion: primero([
        `Contenedores de escombros en ${n}: tamaños, qué se puede echar, de qué depende el precio y qué permiso hace falta. Pide presupuesto sin compromiso.`,
        `Contenedores de escombros en ${n}: tamaños, precio y permiso del ayuntamiento. Pide presupuesto sin compromiso.`,
      ], MAX_DESC),
      faq, contenido,
    };
  });
}
