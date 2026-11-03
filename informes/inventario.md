# Inventario Fase 0 — contenedoresescombros.com

Generado el 2026-11-03 desde el export de WordPress (carpeta `origen/`).
Datos completos en `informes/inventario.json`.

## Ficheros del export
- `contenedoresescombros.WordPress.2026-11-03.xml` — 10,98 MB, 302 items (export COMPLETO).
- `contenedoresescombros.WordPress.2026-11-03 (1).xml` — 10,48 MB, 212 items (copia parcial).
- `(3).xml` — 0,49 MB, 121 items (copia parcial). · `(2).xml` — 0,02 MB (copia).
- 637 items en bruto → **302 únicos** (335 eran duplicados de exportar varias veces).
- `https___..._Performance-on-Search-2026-11-03.zip` — datos de tráfico de Search Console (para Fase 4/8).

## Resumen
- **96 páginas + 1 entrada** publicadas (97 en total). 95 están hechas con **Elementor**.
- **121 imágenes** (attachments). Todas las páginas usan la plantilla por defecto (diseño uniforme).
- **Plugins detectados:** Elementor, Yoast SEO (95 páginas con SEO), Contact Form 7, Essential Addons (widget `eael-contact-form-7`).
- **Mapas de Google:** 70 bloques `google_maps` repartidos por las páginas de ciudad.
- Sin páginas de otros países: **todo son provincias y ciudades de España**.

## Menús
- `menu-principal`: 56 entradas.
- `menu-dos-sin-provincias`: 21 entradas (versión del menú sin las provincias).
- `aviso`: 3 entradas (barra de aviso legal/cookies).

## Formularios (Contact Form 7)
- **Formulario de contacto 1** → avisa a **yamandu_5@hotmail.com**
- **formulario empresas** → avisa a **yamandu_5@hotmail.com**
- Campos vistos: nombre, email, teléfono, asunto, mensaje, aceptación de privacidad.

## Datos de contacto y marketing (sacados del export)
- **WhatsApp:** 666171391 (aparece 84 veces).
- **Correo de avisos:** yamandu_5@hotmail.com.
- **AdSense:** ¡OJO, hay DOS códigos distintos!
  - En la cabecera del tema (script activo de anuncios): `ca-pub-7333712322602518`.
  - Dentro del contenido de las páginas: `ca-pub-7650076729483434` (24 veces).
  - Son dos cuentas distintas → hay que confirmar con Yama cuál es la buena (la que cobra).
- **Verificación de Google Search Console** (meta en el head): `g1g7IoC0cXJ4TwTp3n7KE_QzUOn7-M6PGEDLzI-DwaA` → mantenerla al lanzar para no perder la verificación.
- **Tema actual:** Astra + Elementor.
- **Google Analytics:** NO hay (ni G-, ni gtag, ni UA, ni GTM) → hay que ponerlo. (El código de verificación de arriba NO es analítica.)
- **Teléfono fijo:** no aparece como enlace `tel:` → confirmar con Yama.
- **Datos legales (NIF, dirección):** no aparecen en el export → pedir a Yama.

## Mapa de páginas (las URL NO cambian)

### Portada
- `/`

### Servicios (12)
`/presupuesto/` · `/precio/` · `/alquiler/` · `/transporte/` · `/medidas/` ·
`/recogida-escombros/` · `/venta/` · `/camiones-portacontenedores/` ·
`/sacos-para-escombros/` · `/excavaciones/` · `/habilitacion-contenedores-escombros-via-publica/` · `/poda/`

### Tipos de contenedor (7)
`/contenedores-escombros-con-llave/` · `/contenedores-escombros-3-m3/` · `/-5-m3/` ·
`/-9-m3/` · `/-12-m3/` · `/-20-m3/` · `/-30-m3/`

### Páginas de ciudad / provincia (70)
valencia, barcelona, madrid, gandia, **contenedores-escombros-malaga**,
**contenedores-escombros-alicante**, **contenedores-escombros-sevilla**, murcia, cadiz,
vizcaya, coruna, asturias, girona, tarragona, granada, pontevedra, zaragoza, cordoba,
almeria, guipuzcoa, toledo, badajoz, huelva, cantabria, castellon, jaen, navarra, lliria,
cullera, sueca, sagunto, burgos, albacete, caceres, lleida, ciudad-real, leon, valladolid,
guadalajara, huesca, lugo, cuenca, ourense, palencia, las-palmas, la-rioja, salamanca,
tenerife, avila, alava, baleares, segovia, soria, teruel, zamora, ibiza, moncada,
pobla-de-vallbona, paterna, requena, ribarroja-del-turia, torrent, betera, paiporta,
algemesi, carcaixent, ontinyent, alboraya, xativa, puerto-de-sagunto.

> Tres usan otro formato de URL (`contenedores-escombros-malaga/-alicante/-sevilla`); el
> resto es `/ciudad/`. Es así en el original: se respeta, no se cambia (D6).

### Legales (4)
`/aviso-legal/` · `/politica-de-privacidad/` · `/politica-de-cookies/` · `/personalizar-cookies/`

### Otras (4)
`/contacto/` · `/empresa/` · `/hola-mundo/` (entrada de ejemplo de WordPress «Hola mundo») ·
(la portada ya contada arriba)

## Cosas a decidir / avisar
1. **Google Analytics:** no hay ninguno. Hay que crear uno (GA4) y poner el ID `G-…`, o lanzar sin analítica (no recomendado).
2. **`/hola-mundo/`:** es la entrada de ejemplo que crea WordPress sola. No aporta nada. Decidir si se deja, se oculta de buscadores o se redirige.
3. **Comentarios de spam:** el export trae bastantes comentarios basura (correos tipo `admin@pornmate.com`, etc.). NO se migran (la web nueva no lleva comentarios); no afectan, pero conviene limpiarlos en el WordPress viejo.
4. **Legales:** el texto puede estar dentro de Elementor; se lee en Fase 1 y se completan con datos reales en Fase 4 (hace falta titular, NIF y dirección).
5. **Teléfono:** confirmar si se muestra un fijo o solo el WhatsApp 666 17 13 91.
6. **Países:** todo es España → se trabaja solo para España (D5 = sin subcarpetas de país).

## Estado
Solo lectura. No se ha creado ni modificado nada de la web. Export guardado en `origen/`
(fuera de Git). Siguiente: Fase 1 (bajar contenido e imágenes) cuando Yama confirme el inventario y dé los datos pendientes.
