# contenedoresescombros.com — migración de WordPress a Astro

## Quién manda
Yama, no técnico: castellano de España, de tú, sin jerga. Lo hace Claude.
Cada informe dice el estado (local / commit / main desplegado).

## Decisiones (valores por defecto del método; se confirman al tener el export)
- D1 Fuente: el XML de WordPress (`_elementor_data`), no la web en vivo.
- D2 Sube a main: SOLO cuando Yama lo confirme en el chat (cambiado el 2026-11-03). Antes, `todo` y `todo:visual` a 0. Netlify publica en cada push.
- D3 Diseño: 2-3 propuestas (`?tema=a|b|c`) desde webs de referencia; se elige una y se prueba por tipos.
- D4 DNS: se quedan en el registrador; si van a Netlify, copiar antes los registros de correo.
- D5 Países: cada país no principal en su subcarpeta (/ar/, /mx/…) desde el principio.
- D6 Páginas de ciudad: no se fusionan ni se redirigen; solo se añade información propia.
- D7 Regla del H1: si Elementor no trae H1, el H1 es el título de la página.
- D8 Fotos: mover a `/img/` solo con 301; palabra clave en nombre de fichero y en `alt`.

## Marca y diseño
Sector: contenedores de escombros / residuos de obra (base en Valencia).
MODELO DE NEGOCIO (confirmar con Yama): parece un DIRECTORIO que recomienda/anuncia empresas de
contenedores y se monetiza con AdSense + empresas anunciadas (ver /empresa/ «anuncie su empresa aquí»
y el aviso legal: «muestra de publicidad y recomendación de empresas»). No parece que Yama alquile él
los contenedores. Clave para el diseño y los textos.
Diseño APROBADO por Yama: paleta VERDE (verde residuos). Eligió entre 3 propuestas (naranja/azul/verde).
Colores en `:root` de `src/styles/global.css`: --marca #2f8f54 (acentos), --marca2 #236f41 (botones y enlaces del cuerpo),
héroe degradado #163520→#26502f, botón WhatsApp #0b7a39. Héroe con CTA (Presupuesto + WhatsApp), secciones alternas, WhatsApp flotante.

## Datos (sacados del export salvo donde diga pendiente)
AdSense: `ca-pub-7333712322602518` (CONFIRMADO por Yama con captura de AdSense; el `ca-pub-7650076729483434` del contenido es antiguo, se descarta) · ads.txt: `google.com, pub-7333712322602518, DIRECT, f08c47fec0942fa0` (crear en public/ads.txt en Fase 7) · GA4 NO hay (pendiente de crear) · WhatsApp 666171391 ·
teléfono 666171391 (mismo que WhatsApp; los botones usan tel:) · correo yamandu_5@hotmail.com · horario [pendiente] ·
formulario (CF7) avisa a yamandu_5@hotmail.com · DNS en [pendiente] · repositorio https://github.com/Yamarodriguez/contenedoresescombros.git · Netlify [pendiente]
Verificación Google Search Console (meta): `g1g7IoC0cXJ4TwTp3n7KE_QzUOn7-M6PGEDLzI-DwaA` (mantener en el head al lanzar) · Tema actual: Astra + Elementor
Titular legal (del aviso legal, CONFIRMAR): Yamandu rodriguez · NIE Y8543818E · Calle de finestrat, Valencia (falta nº y CP) · yamandu_5@hotmail.com · Países: solo España (D5 sin subcarpetas) ·
Palabras que NO se quieren [pendiente] · Páginas con tráfico [en origen/, ZIP de Search Console]

## Entorno (revisado 2026-11-03)
Node 24.18 · git 2.54 · `gh` (GitHub) NO instalado, pendiente para las fases de subida ·
Playwright/Chrome por comprobar · aún no es repositorio git · la web funciona (un 503 puntual al revisar).

## Reglas
Método: PROMPT-MIGRACION-V7.md. Contenido original intocable salvo petición de Yama.
Nada inventado. Lo nuevo desde `src/data/`. `npm run todo` y `todo:visual` a 0.
Regenerar: `npm run generar`. Agentes: PROHIBIDO escribir ficheros.
`kit/` = herramientas de contenedoresmaritimos (adaptar, no leer enteras; ver sección B del método).

## Estado
Fases 0, 1 y 2 HECHAS. Detalles en `informes/inventario.md`, `fase1.md`, `fase2.md`.
Motor Astro funcionando: layout con head/SEO/datos estructurados/AdSense, cabecera con menú real,
pie, render de cada bloque (texto, foto, botón, mapa, acordeón, formulario), rutas, sitemap, 404, gracias.
`npm run todo` A 0 (compila 97 páginas + C3 validador + C1 encabezados + C2 contenido + SEO, todo a 0).
Datos en `src/data/`: site.json, seo.json (de referencia), menus.json, imagenes.json (201 medidas).
Git: repo local iniciado, rama `main`, 1 commit, remoto `origin` puesto. SIN subir aún (primer push tras Fase 3, con `todo:visual` a 0 — D2 — y con GitHub autenticado).
Fase 3 (diseño) HECHA: paleta verde aplicada, `npm run todo` a 0 y `npm run todo:visual` a 0 (0 de 404, contraste y desbordes en 9 tipos × escritorio/móvil).
Scripts visuales: `scripts/visual.mjs` (todo:visual) y `scripts/capturas-temas.mjs`. Playwright + Chromium instalados.
Pendiente de Yama: modelo de negocio (¿directorio o alquilas tú?), dirección legal completa, GA4, horario, palabras a evitar.
2 páginas sin Elementor pendientes (personalizar-cookies, hola-mundo) para Fase 4.
AdSense en la cabecera: no se puede probar en local (solo sirve en el dominio aprobado); revisar en el preview de Netlify (Fase 7).
Fase 4 EN CURSO. Hecho: FAQ con datos estructurados (FAQPage) en index/medidas/precio/alquiler/recogida + `llms.txt`.
Enlazado entre ciudades HECHO: cada página de ciudad enlaza su provincia y 6 localidades cercanas (`src/data/ciudades.json`, geo de OpenStreetMap vía `scripts/geo-ciudades.mjs`, cache en informes/geo-cache.json). Componente `Zona.astro`.
Regenerar todo en orden: `npm run generar` (extraer → geo → medidas → seo → menus). todo y todo:visual a 0, subido a GitHub.
Pendiente Fase 4: legales reescritas (necesita dirección legal completa y confirmar modelo de negocio); decidir hola-mundo y personalizar-cookies; (opcional) tablas de medidas, más FAQ.
Fase 5 (formulario) HECHA: Netlify Forms con envío sin recargar (fetch), aviso de enviado/error, honeypot anti-spam, /gracias/. Avisa a yamandu_5@hotmail.com (se activa en el panel de Netlify, Fase 7). Prueba real de envío: solo con el sitio ya en Netlify.
Fase 6 (velocidad) HECHA: webp 400/800 con `<picture>` (470 webp), tipografía Inter local (fontsource), todas las imágenes con medidas. sharp funciona (devDependency).
Diseño rehecho (2026-11-03): filas y columnas de Elementor (`filas` en cada JSON, `Fila.astro`), fichas en tarjetas, héroe con foto. Capturas: `node scripts/capturas-paginas.mjs local <carpeta>`.
Auditoría SEO/AEO en `informes/auditoria-seo-aeo.md`. Cambios aprobados por Yama en `src/data/fallos-original.json` (títulos, H1, descripciones) y `src/lib/textos.mjs` (mayúsculas -> tipo frase, alt de fotos); los comprobadores los aplican. Regla: `node scripts/cambios-aprobados.mjs --seco`.
Miniaturas de WordPress: `public/_redirects` (scripts/redirecciones-wp.mjs).
Logo «Contenedores» (2026-11-03, petición de Yama): `src/components/Logo.astro`, `public/favicon.svg`, PNG con `scripts/logo.mjs`.
Imagen principal por página con la palabra clave escrita, en el fichero y en el alt: `scripts/imagenes-principales.mjs` -> `public/img/principal/` y `src/data/principales.json` (también og:image).
Contenido NUEVO encima del original (2026-11-03, petición de Yama, empezando por Excavaciones): `src/data/contenido-nuevo.json` (subtítulo, entradilla, secciones H2 con tarjetas H3, FAQ al FAQPage), `Anadido.astro`, fotos con la palabra clave en `public/img/nuevas/` (`scripts/fotos-nuevas.mjs`). Del original de Excavaciones solo quedan «Contenedores escombros y residuos» (tipos) y «Otros servicios de contenedores»; lo demás se quitó a petición de Yama (`quitar` en fallos-original.json, regla `conservar` en cambios-aprobados.mjs; los comprobadores lo saltan). Neutro: no promete quién hace las excavaciones.
Excavaciones reescrita tras analizar las páginas que salen arriba en Google (Valencia y Madrid): `informes/analisis-google-excavaciones.md` (estructura H1/H2/H3, palabras clave, plantilla para las páginas de ciudad). Sin precios en euros hasta tener los reales de Yama.
Páginas NUEVAS /excavaciones-<ciudad>/ (Yama: una por cada ciudad o provincia con página de contenedores, 70; dirección con guion, no /excavaciones/<ciudad>/, que redirige con 301 en netlify.toml para las 7 primeras). Datos locales en `src/data/excavaciones-ciudades.json`, plantilla en `src/lib/excavaciones.mjs` (`paginasExcavacion`, `rutaExcavacion`; la usan `src/pages/excavaciones-[ciudad].astro`, el mapa del sitio, llms.txt, `imagenes-principales.mjs`, `Anadido.astro` y Zona). En /excavaciones/ la lista «Excavaciones por lugares» es igual que la de inicio (5 columnas, mismos 50 lugares y orden, sale de index.json), SOLO enlaza a páginas de excavaciones y va AL FINAL de la página (`ListaExcavaciones.astro`, `listaAlFinal` en contenido-nuevo.json). Las páginas de ciudad NO llevan bloque de cercanas; solo /excavaciones-valencia/ lleva lista, de sus pueblos, con el mismo formato (4 columnas) y al final (`listaPueblos`; Yama, 2026-11-03). Licencia en la C. Valenciana: art. 232 TRLOTUP (comprobado); fuera, solo «licencia o declaración responsable». Los comprobadores C1/C2/SEO no las miran (no vienen de WordPress); el validador sí.
Páginas NUEVAS sueltas (no de WordPress): `src/data/paginas-nuevas.json` + `src/pages/[nueva].astro` (mapa del sitio, llms.txt, imagen principal y fotos las recogen solas). Primera: /contenedores-de-tierra/ (Yama, 2026-11-03; búsqueda con 375 apariciones en Search Console), enlazada desde el pie, /excavaciones/ y las 70 de excavaciones. Tierra = contenedores de 3 o 5 m³ (lo dice el original: «para materiales pesados como la tierra»); 1 m³ de tierra ≈ 1,5-2 t.
`geo-ciudades.mjs`: `CONSULTA` para nombres repetidos (Torrent -> Torrent, Valencia).
Lista de provincias (50 enlaces): SOLO en inicio, con el titular «Contenedores por lugares» (Yama, 2026-11-03; regla `encabezados` en cambios-aprobados.mjs, la aplican la web y C1/C2); quitada de las otras 11 páginas con la misma regla `quitar`.
/contenedores-de-tierra/ lleva debajo la home adaptada a tierra (Yama, 2026-11-04): `src/data/como-inicio.json` (`cambios` por número de bloque de index.json, `omitir` quita 9-30 m³, poda y con llave, que no son para tierra), pintada en `[nueva].astro`. El precio es el orientativo del original, sin inventar uno de tierra. No hay páginas de tierra por lugar: la lista enlaza a las de contenedores.
Franja final encima del pie por página: `src/data/cierres.json` y prop `cierre` de Base (excavaciones y las 70, contenedores de tierra).
«Otros servicios de contenedores»: enlaces y textos corregidos de las fichas con `enlazarOtrosServicios` (textos.mjs; Excavaciones va a /excavaciones-<ciudad>/ si existe; C2 lo aplica). Análisis e ideas de servicios: `informes/otros-servicios.md`.
Servicios nuevos (Yama, 2026-11-04; datos de Search Console en informes/otros-servicios.md): 7 páginas en paginas-nuevas.json (alquiler-de-cubas, contenedores-para-reformas, contenedores-industriales, demoliciones, contenedores-para-chatarra, casetas-de-obra, desescombro) y /transporte/ reforzada en contenido-nuevo.json. Informativas y neutras, sin precios: falta saber quién presta cada servicio. Normas citadas comprobadas: separación de residuos de obra desde 2022 y demolición selectiva desde 2024 (Ley 7/2022), amianto con RERA y plan de trabajo (RD 396/2006), aseos y vestuarios en obra (RD 1627/1997).
Lugares nuevos de casascontenedores.es (Yama, 2026-11-04): 202 en `src/data/lugares-nuevos.json` (lugar, provincia, comunidad y municipio si no lo es), plantilla en `src/lib/lugares.mjs` y `contenedores-escombros-[pueblo].astro`, excavaciones en excavaciones-ciudades.json. Provincias con lista de sus pueblos al final. `geo-ciudades.mjs` los suma a ciudades.json. Páginas muy parecidas entre sí: vigilar en Search Console.
Menú: entradas nuevas en `ANADIDOS` de `scripts/menus-desde-referencia.mjs` («Contenedores de tierra» en «Medidas y tipos»).
Bloque Medidas/Recogida (90 páginas) -> «Preguntas frecuentes de contenedores» (`FaqBloque.astro`, `detectarFaq` en textos.mjs, preguntas en fallos-original.json). Pendiente de Yama: subir (push), Bing, dirección, modelo de negocio, precios reales, robots de entrenamiento.
LANZAMIENTO (2026-11-03): Yama cambió los NS del dominio en OVH a Netlify DNS (dns1-4.p05.nsone.net); propagación en curso (Quad9 ya, Google/Cloudflare aún OVH). Netlify sirve el dominio pero SIN certificado aún (da *.netlify.app). En Netlify DNS NO están los registros de correo de OVH: MX mx4.mail.ovh.net (1) y mx3.mail.ovh.net (10), CNAME autodiscover -> mailconfig.ovh.net, TXT openai-domain-verification=dv-I5JRonW7jrfAgQz2UlCsLdhx (los tiene que añadir Yama). Comprobado: 165 URL del mapa y las 108 de Search Console responden. Pendiente tras el certificado: redirigir contenedoresescombros.netlify.app al dominio (netlify.toml).
Siguiente: legales (Fase 4, pendiente de tus datos) y Fase 7 (lanzamiento: conectar Netlify, DNS y correo, GA4, redirecciones wp-content/Yoast, ads.txt, Search Console). Netlix/DNS necesitan a Yama.
Las FAQ son factuales y neutras (no dicen quién presta el servicio) hasta confirmar si es directorio o alquiler propio.
