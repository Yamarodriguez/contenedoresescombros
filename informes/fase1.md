# Informe Fase 1 — Bajar todo (contenedoresescombros.com)

Estado: **solo en local** (nada subido todavía; aún no es repositorio git).

## Lo que se ha generado (todo desde el `_elementor_data`, sin tocar la web)
- **95 páginas** como JSON en `src/content/pages/` (la fuente que renderizará Astro),
  con encabezados, textos (con negritas y enlaces), botones, imágenes, mapas,
  acordeones (toggle) y formularios, en el orden original.
- **`estructura-viva.json`** — los encabezados (H1/H2/H3…) de cada página, para comprobar luego.
- **`contenido-vivo.json`** — todos los bloques de cada página con las URL originales.
- **`public/img/`** — **201 imágenes** descargadas (galería completa + fotos de fondo), 0 fallos.
- **`referencia/`** — **95 HTML vivos** de WordPress descargados, 0 fallos (para comparar en Fase 2).
- Informes: `extraccion.json`, `imagenes-a-bajar.json`, `descarga-imagenes.json`, `fallos-descarga.json`.

## Scripts propios creados (en `scripts/`)
- `extraer.mjs` — extractor único: lee el export y genera las tres fuentes de datos.
- `bajar-imagenes.mjs` — baja todas las imágenes conservando la ruta de `/wp-content/uploads/`.
- `bajar-referencia.mjs` — baja el HTML vivo de cada página (adaptado del kit).

## Recuento de bloques
heading: 2665 · image: 1733 · text: 1450 · button: 852 · toggle (acordeón): 90 ·
map (Google Maps): 70 · contact_form: 3 (en contacto, presupuesto y empresa).
Los recuentos cuadran exactamente con los widgets del original: no se ha perdido nada.

## 2 páginas sin Elementor (se ven en Fase 4)
- `/hola-mundo/` — la entrada de ejemplo de WordPress. Propuesta: no indexarla o redirigirla.
- `/personalizar-cookies/` — página del gestor de cookies (es un plugin). Se rehará con el nuevo aviso de cookies.

## Hallazgos a tener en cuenta
- **Datos legales recuperados** del propio Aviso Legal: Yamandu rodriguez · NIE Y8543818E ·
  «Calle de finestrat - Valencia» (falta número y código postal) · yamandu_5@hotmail.com.
  El Aviso Legal está **copiado de otra web** (aparece «barbacoas.online») y cita la **LOPD de 1999**,
  que ya no está vigente. En Fase 4 se reescriben los legales con tus datos reales y la ley actual.
- **Modelo de negocio:** la web parece un **directorio** que recomienda y anuncia empresas de
  contenedores (apartado «anuncie su empresa aquí») y gana con AdSense y con empresas anunciadas,
  no un servicio propio de alquiler. **Hay que confirmarlo** porque cambia el diseño y los textos.
- **Anuncios muertos quitados:** el contenido traía iframes de AdSense del código antiguo
  (`ca-pub-7650076729483434`); se han limpiado. El AdSense bueno (`…2602518`) va en la cabecera.
- **Teléfono/WhatsApp:** los botones llaman al **666 17 13 91** (tel: y WhatsApp).
- **SEO:** se han guardado las meta descripciones de Yoast; los títulos finales se tomarán del
  HTML vivo en Fase 2.

## Pendiente de Yama (no frena la Fase 2)
1. ¿La web es un directorio que anuncia/recomienda empresas, o alquilas tú los contenedores?
2. Dirección legal completa (calle, número y código postal) y confirmar el NIE.
3. Google Analytics (GA4): ¿creamos uno y me pasas el `G-…`, o se lanza sin analítica?
4. Horario de atención.
5. Diseño (para Fase 3): 3 palabras de cómo quieres que se sienta y 2-3 webs que te gusten.
6. ¿Alguna palabra que NO quieras que aparezca?
