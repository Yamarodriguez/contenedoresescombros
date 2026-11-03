// Páginas de excavaciones por ciudad: /excavaciones/<ciudad>/ (Yama, 2026-11-03).
// Plantilla sacada del análisis de las páginas que salen arriba en Google
// (informes/analisis-google-excavaciones.md). Los datos locales están en
// src/data/excavaciones-ciudades.json; nombre y cercanas, en ciudades.json.
// Lo usan la página, el mapa del sitio, llms.txt y scripts/imagenes-principales.mjs.

const MAX_TITULO = 60, MAX_DESC = 160;

// Trabajos de excavación (H3). Textos neutros: no dicen quién hace el trabajo.
export const TIPOS = {
  vaciado: ['Vaciado de solares y sótanos', 'Se excava todo el volumen donde irá el sótano, el garaje o la planta baja, hasta la profundidad del proyecto.'],
  zanjas: ['Zanjas y cimentaciones', 'Zanjas para zapatas, vigas de cimentación y muros de la obra.'],
  canalizaciones: ['Canalizaciones y acometidas', 'Zanjas para tuberías de agua, saneamiento, riego o gas y para cables de luz y telecomunicaciones.'],
  piscinas: ['Excavación de piscinas', 'Se abre el hueco con la forma y la profundidad de la piscina, y se retira o se reutiliza la tierra.'],
  nivelacion: ['Nivelación y explanación de parcelas', 'Se rebaja o se rellena el terreno y se compacta para dejarlo a la altura y con la pendiente que hace falta.'],
  desbroce: ['Desbroce y limpieza de solares', 'Se retiran la vegetación, las raíces y la basura o los escombros antes de empezar a excavar.'],
  muros: ['Muros de contención y escolleras', 'Se excava la base de los muros que sujetan la tierra en los desniveles, o se colocan escolleras de piedra.'],
  agricolas: ['Transformaciones agrícolas', 'Se nivelan parcelas de cultivo, se hacen bancales y se prepara el terreno para el riego o para plantar.'],
};

const LICENCIA = {
  cv: (n) => ({
    html: `<p>En la Comunitat Valenciana, los <strong>movimientos de tierras y las explanaciones</strong> necesitan <strong>licencia urbanística</strong> del ayuntamiento (artículo 232 del TRLOTUP), salvo que formen parte de un proyecto de reparcelación. Otras obras que afectan al subsuelo se tramitan con <strong>declaración responsable</strong>, y las labores agrícolas normales no necesitan ninguna de las dos.</p><p>Antes de empezar, consulta en el <strong>Ayuntamiento de ${n}</strong> qué trámite corresponde a tu obra. Si el contenedor va en la calle, también hace falta autorización para ocupar la vía pública: mira la <a href="/habilitacion-contenedores-escombros-via-publica/">habilitación de contenedores en la vía pública</a>.</p>`,
    faq: `Normalmente sí. En la Comunitat Valenciana los movimientos de tierras y las explanaciones necesitan licencia urbanística (artículo 232 del TRLOTUP), salvo las labores agrícolas normales. Consulta en el Ayuntamiento de ${n} qué trámite corresponde a tu obra.`,
  }),
  madrid: (n) => ({
    html: `<p>En la Comunidad de Madrid, según la obra, hace falta <strong>licencia urbanística</strong> o <strong>declaración responsable</strong> del ayuntamiento.</p><p>Antes de empezar, consulta en el <strong>Ayuntamiento de ${n}</strong> qué trámite corresponde a tu obra. Si el contenedor va en la calle, también hace falta autorización para ocupar la vía pública: mira la <a href="/habilitacion-contenedores-escombros-via-publica/">habilitación de contenedores en la vía pública</a>.</p>`,
    faq: `Según la obra, hace falta licencia urbanística o declaración responsable. Consulta en el Ayuntamiento de ${n} qué trámite corresponde a tu obra.`,
  }),
};

const primero = (opciones, max) => opciones.find((t) => t.length <= max) || opciones[opciones.length - 1];

/** Lista de páginas de excavación por ciudad, con todo lo que hace falta para pintarlas. */
export function paginasExcavacion(datos, ciudades) {
  const slugs = Object.keys(datos).filter((s) => !s.startsWith('_') && ciudades[s]);
  return slugs.map((slug) => {
    const d = datos[slug], c = ciudades[slug], n = c.nombre;
    const conOtro = d.tambien ? `${n} (${d.tambien})` : n;
    const lic = LICENCIA[d.region](n);
    // Cercanas: su página de excavaciones si existe; si no, su página de contenedores.
    const cercanas = (c.cercanas || []).map((x) => (datos[x.slug]
      ? `<li><a href="/excavaciones/${x.slug}/">Excavaciones en ${x.nombre}</a></li>`
      : `<li><a href="/${x.slug}/">${x.nombre}</a></li>`)).join('');
    const faq = [
      { pregunta: `¿Hace falta licencia para excavar en ${n}?`, respuesta: lic.faq },
      { pregunta: `¿Cuánto cuesta una excavación en ${n}?`, respuesta: 'Depende del volumen de tierra, la profundidad, el tipo de terreno, el acceso para la máquina y la retirada de la tierra. Se presupuesta cada obra, normalmente por metro cúbico o por jornada de máquina.' },
      { pregunta: `¿Qué contenedor necesito para la tierra en ${n}?`, respuesta: 'Para tierra suele convenir un contenedor de 3 a 9 m³, porque la tierra pesa mucho y el límite lo marca el peso que puede llevar el camión. Si va limpia, mejor no mezclarla con escombros.' },
      { pregunta: `¿Puedo dejar el contenedor de tierra en la calle en ${n}?`, respuesta: `Solo con autorización del Ayuntamiento de ${n} para ocupar la vía pública. Si el contenedor va dentro de la parcela, no hace falta ese permiso.` },
      { pregunta: `¿Qué datos necesito para pedir presupuesto de excavación en ${n}?`, respuesta: 'La dirección de la obra, el tipo de trabajo (vaciado, zanja, piscina, nivelación), las medidas aproximadas (largo, ancho y profundidad), cómo es el acceso para la máquina y si hay que retirar la tierra.' },
    ];
    const contenido = {
      subtitulo: `Tipos de trabajo, contenedores para la tierra y licencia del ayuntamiento en ${n}. Presupuesto sin compromiso.`,
      entradilla: `<p>Las <strong>excavaciones y el movimiento de tierras en ${n}</strong> preparan el terreno para construir: vaciados de solares y sótanos, zanjas para cimientos y tuberías, piscinas y nivelación de parcelas. ${conOtro} ${d.situacion}. ${d.enfoque}</p><p>Aquí tienes los trabajos más habituales, qué contenedor usar para la tierra, qué licencia pide el ayuntamiento y cómo pedir presupuesto.</p>`,
      secciones: [
        {
          h2: `Excavaciones en ${n}: tipos de trabajo`,
          foto: { nombre: 'tipos-de-excavacion-y-movimiento-de-tierras' },
          html: `<p>Estos son los trabajos de excavación y movimiento de tierras más habituales en ${n}:</p>`,
          tarjetas: d.tipos.map((t) => ({ h3: TIPOS[t][0], html: `<p>${TIPOS[t][1]}</p>` })),
        },
        {
          h2: `Contenedores para la tierra en ${n}`,
          foto: { nombre: 'contenedores-para-tierras-y-residuos-de-excavacion' },
          html: `<p>La tierra de una excavación se carga en <strong>contenedores de tierra</strong> o de escombros y se lleva a un gestor autorizado. Para tierra suele convenir un contenedor de 3 a 9 m³, porque pesa mucho: aproximadamente entre 1,5 y 2 toneladas por metro cúbico. Si va limpia, sin escombros, se puede reutilizar en rellenos.</p><p>Consulta los <a href="/${slug}/">contenedores de escombros en ${n}</a> y las <a href="/medidas/">medidas de cada contenedor</a>.</p>`,
        },
        { h2: `Licencia para excavar en ${n}`, html: lic.html },
        {
          h2: `Precio de una excavación en ${n}`,
          html: '<p>El precio se calcula para cada obra, normalmente por metro cúbico o por jornada de máquina. Depende sobre todo de:</p><ul><li>El <strong>volumen</strong> de tierra y la profundidad.</li><li>El <strong>tipo de terreno</strong>: la roca necesita martillo hidráulico y más horas.</li><li>El <strong>acceso</strong> para la máquina: con poco espacio se trabaja con miniexcavadora.</li><li>La <strong>retirada de la tierra</strong>: cuántos contenedores o camiones hacen falta y la distancia al gestor autorizado.</li></ul><p>Más detalles en la guía de <a href="/excavaciones/">excavaciones y movimiento de tierras</a>.</p>',
        },
        { h2: `Excavaciones cerca de ${n}`, html: `<p>Si tu obra está en una zona cercana, consulta su página para ver los contenedores y servicios de allí:</p><ul class="enlaces-zona">${cercanas}</ul><p>Para el resto de España, mira la guía de <a href="/excavaciones/">excavaciones y movimiento de tierras</a>.</p>` },
        { h2: `Preguntas frecuentes sobre excavaciones en ${n}`, faq },
        {
          h2: `Pide presupuesto de excavación en ${n}`,
          html: `<p>Cuéntanos en qué parte de ${n} está la obra, qué hay que excavar y las medidas aproximadas, y te enviamos un presupuesto sin compromiso.</p>`,
          boton: { texto: 'Pide presupuesto', href: '/presupuesto/' },
        },
      ],
    };
    return {
      slug, nombre: n, ruta: `/excavaciones/${slug}/`,
      clave: `Excavaciones en ${n}`,
      h1: `Excavaciones y movimiento de tierras en ${n}`,
      titulo: primero([
        `Excavaciones en ${conOtro}: movimiento de tierras y contenedores`,
        `Excavaciones en ${conOtro}: movimiento de tierras`,
        `Excavaciones en ${n}: movimiento de tierras`,
        `Excavaciones en ${n}`,
      ], MAX_TITULO),
      descripcion: primero([
        `Excavaciones y movimiento de tierras en ${n}: vaciados, zanjas, piscinas y nivelación, contenedores para la tierra y licencia del ayuntamiento. Pide presupuesto.`,
        `Excavaciones y movimiento de tierras en ${n}: vaciados, zanjas, piscinas y nivelación, contenedores para la tierra y licencia del ayuntamiento.`,
      ], MAX_DESC),
      faq, contenido,
    };
  });
}
