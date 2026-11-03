# Prompt para migrar una web de WordPress a Astro (versión 7)

Sale de la migración de **contenedoresmaritimos.net** (oct. 2026: 195 páginas de
WordPress + Elementor → más de 350 en Astro + Netlify, con una sección de
Argentina en /ar/). Recoge lo que funcionó y, sobre todo, **lo que costó rondas
de más**, para no repetirlo. Es independiente: no hace falta el V6 ni el kit de
casascontenedores (en esta migración no los tuvimos y se hizo igual).

---

## PARA TI, YAMA: cómo se usa

1. Crea una carpeta vacía para la web nueva (p. ej. `D:\web\midominio`).
2. Copia dentro **este fichero** y, de `D:\web\contenedoresmaritimos`, la carpeta
   `scripts` → pégala como `kit\scripts`, y la carpeta `src` → como `kit\src`.
   Son las herramientas que ya funcionan: Claude las adapta en vez de escribirlas
   de cero (es lo que más tokens ahorra).
3. Crea una subcarpeta `origen\` y mete ahí el export XML de WordPress (todos los
   ficheros si hay varios) y el ZIP de Search Console. **No los dejes sueltos en la
   carpeta principal.**
4. Si tienes logo bueno (SVG o PNG grande) y fotos propias, en `marca\`.
5. Rellena la **lista de antes de empezar** (más abajo). Cada dato que falta a
   mitad de trabajo es una ronda perdida.
6. Abre Claude Code en la carpeta y pega el mensaje de la primera sesión.

### Mensaje para la primera sesión

```
Quiero migrar [DOMINIO] (WordPress con [Elementor / otro]) a Astro en Netlify,
conservando todas las URL y el posicionamiento. No soy técnico: háblame en
castellano de España, de tú y sin jerga, y hazlo tú.

Lee PROMPT-MIGRACION-V7.md: secciones 0, A y la Fase 0. El resto, al llegar a
cada fase. kit/ son las herramientas de una migración anterior: adáptalas, no
las leas enteras (usa el mapa de la sección B). origen/ tiene el export.

Datos: AdSense [ca-pub-… / no], GA4 [G-… / no], WhatsApp [nº], teléfono [nº],
correo [@], horario [..], titular [nombre, NIF, dirección]. Dominio en [OVH /
otro]. Registros de correo (zona DNS completa): [pegados / captura en origen/].
GitHub: [URL / créalo tú]. Netlify: [sitio / todavía no].
Países o zonas con páginas propias: [solo España / España y Argentina / ..].
Diseño: me dedico a [..], vendo a [..], quiero que se sienta [3 palabras],
webs que me gustan: [URL — qué me gusta]. Lo que NO quiero: [..].

Empieza por la FASE 0 y no cambies nada hasta que te confirme el inventario.
```

### Mensaje para las sesiones siguientes (una por fase)

```
Lee CLAUDE.md y empieza la Fase [N].
```

### Lista de antes de empezar (lo que en contenedoresmaritimos faltó)

- [ ] **Zona DNS completa de hoy** (MX, SPF, DKIM, autodiscover, TXT, A de ftp…).
      En contenedoresmaritimos se pasaron los DNS a Netlify sin copiarla antes y
      el correo se quedó pendiente de arreglar con urgencia.
- [ ] **ID de GA4** (G-…). El antiguo UA-… ya no funciona; se lanzó sin analítica.
- [ ] **Webs de referencia de diseño.** Se hicieron 3 propuestas, se aprobó una y
      luego se rediseñó dos veces más hasta tomar casascontenedores.es de
      modelo. Con las referencias desde el día 1 eso son 2 rondas, no 6.
- [ ] **Qué países o zonas** tienen páginas propias (Argentina hubo que moverla
      a /ar/ después del lanzamiento, con 20 redirecciones).
- [ ] **Qué palabras no quieres** en la web (se quitó «Fabricación» de 173
      páginas a posteriori).
- [ ] Permiso del dominio en el navegador de Claude (ver A1).
- [ ] Datos legales del titular: las páginas de Privacidad y Cookies venían
      vacías en el export y hubo que redactarlas.

---

## 0. DECISIONES (se apuntan en CLAUDE.md en la Fase 0)

| Decisión | Por defecto |
|---|---|
| **D1 — Fuente del contenido** | El XML de WordPress (`_elementor_data`), no la web en vivo. La web en vivo solo para el HTML final (títulos, descripciones, menú) |
| **D2 — Quién sube a main** | Claude, cuando `npm run todo` y `todo:visual` salen a 0 |
| **D3 — Diseño** | 2-3 propuestas sobre la misma página (`?tema=a|b|c`) partiendo de las webs de referencia; se elige una y se prueba en una página de cada tipo antes de extenderla |
| **D4 — DNS** | Se quedan en el registrador (el correo no se toca). Si se pasan a Netlify: **antes**, copiar y comprobar todos los registros de correo |
| **D5 — Países** | Cada país que no sea el principal, en su subcarpeta (/ar/, /mx/…) **desde el principio**, con `lang` propio y hreflang solo entre páginas equivalentes de verdad |
| **D6 — Páginas de ciudad** | No se fusionan ni se redirigen, aunque tengan poco tráfico; las duplicadas se quedan las dos. Solo se **añade** información propia |
| **D7 — Regla del H1** | Si Elementor no tiene H1, el H1 es el título de la página |
| **D8 — Fotos** | Se pueden mover de `/wp-content/uploads/` a `/img/` **solo con redirección 301** de la ruta vieja. Foto principal y fotos de H2 con la palabra clave en el nombre del fichero y en el `alt` |

---

## A. CÓMO TRABAJAMOS

### A1. Entorno (lo primero de la Fase 0)

Comprobar y apuntar en `informes/inventario.md`: Node 22, git, `gh` con sesión,
Playwright con Chrome, y si llega al dominio.

- **El navegador de Claude puede estar bloqueado** por los permisos de sitio de
  la cuenta. Pedir a Yama que permita el dominio *antes* de empezar.
- **WebFetch tiene límite** de URL nuevas por sesión (se agotó a las ~155
  páginas). No usarlo para bajar la web entera: para eso `bajar-referencia.mjs`
  (2 hilos, 400 ms entre peticiones, reintentos, descarta respuestas de menos de
  5.000 caracteres porque WordPress devuelve errores 500 sueltos).
- **Windows PowerShell 5.1 lee mal los ficheros UTF-8 sin BOM** (salen «Ã³» en
  vez de «ó»). Para leer: la herramienta Read o `Get-Content -Encoding UTF8`.
  Los mensajes de commit, sin tildes ni eñes. El código con `\n`, `\s` o `\b`, en
  ficheros con las herramientas de edición, nunca con `node -e`.

### A2. Cómo se habla a Yama

- No técnico: castellano de España, de tú, sin jerga ni comandos que interpretar.
- **Cada informe termina con el estado**: solo en local / commit sin subir / en
  main y desplegado (comprobado abriendo la URL).
- Decirle siempre dónde mirarlo (URL de Netlify o de la web).
- **Las decisiones, todas juntas y numeradas**: analizar sin tocar → lista →
  Yama contesta en un mensaje («el 1 y el 3 sí, el 2 no»).

### A3. Reglas de oro

1. **El contenido original no se toca** (texto, títulos, nivel de encabezado,
   enlaces, orden). Si Yama pide cambiarlo: regla en un fichero de datos + script
   repetible con `--seco` (recuento y 5 ejemplos) + commit propio «a petición de
   Yama» + anotado en `src/data/fallos-original.json` para que los comprobadores
   lo acepten.
2. **Los fallos del original se enseñan y Yama decide.** En contenedoresmaritimos:
   77 enlaces sin la barra final, 168 botones «Precios» que llevaban a /tipos/,
   191 botones «Presupuesto» a /comprar/, euros en páginas de Argentina, un Aviso
   Legal con otro dominio y la LOPD antigua. Todos al mismo fichero de erratas.
3. **Lo nuevo se añade alrededor o al final**, desde `src/data/*.json`.
   Menú, pie y listas de páginas se generan de esos datos: una página nueva
   aparece sola en el menú y en el pie.
4. **Nada inventado**: precios, plazos, normativa, testimonios. Los datos
   geográficos de ciudades, de OpenStreetMap; las cifras, las del original o las
   que dé Yama.
5. **Las URL no cambian.** Si algo se mueve (fotos, un país), 301 en
   `netlify.toml` el mismo día.
6. **Nada se da por bueno sin `npm run todo` a 0** (y desde la Fase 3 también
   `npm run todo:visual`).
7. **Agentes: PROHIBIDO escribir ficheros.** Devuelven datos; los cambios los
   hace la sesión principal.

### A4. Gastar menos tokens

1. **Reutilizar `kit/`** (sección B): adaptar un script cuesta una fracción de
   escribirlo.
2. **CLAUDE.md corto**: decisiones, datos y estado en viñetas de una línea. El de
   contenedoresmaritimos llegó a ~120 líneas que se leen en cada sesión; lo
   histórico va a `informes/`, no a CLAUDE.md.
3. **Una sesión por fase**; las tandas grandes (ciudades nuevas, un país), una
   sesión cada una.
4. **Informes a disco** (`informes/*.json|md`) y en consola solo el resumen.
   Luego se busca en el informe con grep, sin volver a ejecutar.
5. **No listar carpetas enormes** (`public/`, `dist/`, `node_modules/`,
   `referencia/`, `kit/`): recuentos o patrones.
6. **Probar una página de cada tipo** (portada, tipo de producto, ciudad,
   servicio, contacto, legal, 404) a 1400 y 390 px; después, todo.
7. **Un solo script que regenera todo en orden** (`npm run generar`). En
   contenedoresmaritimos el orden era ciudades-nuevas → geo-ciudades →
   mover-argentina → argentina-equivalentes, y rehacer `menus.json` obligaba a
   repetir pasos a mano: fuente de errores y de rondas.
8. **«Sigue igual» → mirar antes de preguntar**: `git status`, fecha de `dist/`,
   servidor de desarrollo reiniciado, caché, último despliegue.

### A5. Git

- `.gitignore` antes del primer `git add`: `node_modules/ dist/ .astro/ *.log
  referencia/ informes/*.json capturas/ .claude/ origen/ kit/ marca/`.
- **Nunca `git add .` ni `-A`**: rutas concretas.
- Sí suben `estructura-viva.json`, `contenido-vivo.json` y `legales-vivos.json`
  (tras el cambio de DNS la web vieja ya no se puede volver a bajar).
- Hook `pre-push` que ejecuta `npm run todo`. Antes de subir ficheros de datos
  nuevos, compilar desde un clon limpio (Netlify falla con ENOENT si falta uno).

---

## B. MAPA DE `kit/` (lo que se reutiliza de contenedoresmaritimos)

Abrir solo el fichero que toca y adaptarlo. Lo específico de contenedores
(Argentina, «Fabricación», tipos de contenedor) solo si la web nueva tiene algo
equivalente.

| Fichero | Para qué | Fase |
|---|---|---|
| `scripts/bajar-referencia.mjs` | HTML vivo de cada página a `referencia/` | 1 |
| `scripts/html-elementor.mjs`, `enlaces-elementor.mjs` | Recuperan el HTML de los textos (negritas, listas, enlaces) y los enlaces de titulares e imágenes (`settings.link.url`). **Integrarlos en la primera extracción**: aquí se hicieron después y costó una ronda | 1 |
| `scripts/menus-desde-referencia.mjs` | Menú con su orden y anidado reales | 2 |
| `scripts/seo-desde-referencia.mjs` | Título, descripción e imagen para compartir de cada URL | 2 |
| `scripts/medidas-imagenes.mjs` | Medidas reales + webp a 400 y 800 px | 2 / 6 |
| `scripts/todo.mjs` | Encadena: medidas → compilar → validar → encabezados → contenido → SEO, y dice «SE HA PARADO EN» | 2 |
| `scripts/validar.mjs`, `comparar-encabezados.mjs`, `comparar-contenido.mjs`, `comparar-seo.mjs` | Las comprobaciones (ver C) | 2 |
| `scripts/erratas.mjs` + `src/data/fallos-original.json` | Cambios del original aprobados; los comprobadores los aplican antes de comparar | 2 |
| `scripts/visual.mjs`, `capturas.mjs` | 404, contraste, desbordes, fotos que cargan, altura de cabecera; capturas por tema | 3 |
| `scripts/generar-legales.py` | Privacidad y cookies desde datos reales, con marcadores de `site.json` | 4 |
| `scripts/paginas-temas.mjs`, `nueva-pagina-servicios.mjs`, `lib-contenido.mjs` | Páginas nuevas desde JSON: H1 palabra clave, H2, FAQ con datos estructurados, fotos con nombre del H2, negritas en palabras clave | 4 |
| `scripts/geo-ciudades.mjs` | Información propia de cada ciudad (provincia, cercanas, puerto, costa o interior) desde OpenStreetMap | 4 |
| `scripts/ciudades-nuevas.mjs` | Tandas de ubicaciones nuevas + página /ubicaciones/ | 4 |
| `scripts/mover-argentina.mjs`, `rutas-ar.mjs`, `argentina-equivalentes.mjs` | Un país a subcarpeta con 301, y versiones equivalentes con hreflang. Si D5 se decide en la Fase 0, no hace falta mover nada | 4 |
| `src/layouts/Base.astro`, `src/components/*` | Cabecera, pie, formulario, foto, bloques | 2-3 |
| `src/lib/seo.ts`, `migas.ts`, `rutas.ts` | Datos estructurados, migas, hreflang | 4 |
| `src/pages/sitemap.xml.ts`, `llms.txt.ts`, `404.astro`, `gracias.astro` | Mapa del sitio, archivo para buscadores de IA, 404 y gracias | 4-5 |
| `netlify.toml` | Redirecciones de WordPress (wp-content, sitemaps de Yoast, feed) y de netlify.app al dominio | 7 |

---

## C. LAS COMPROBACIONES (`npm run todo` y `todo:visual`)

- **C1 Encabezados**: la secuencia H1/H2/H3 de cada página igual que en
  `estructura-viva.json` (con puntero: hay títulos repetidos).
- **C2 Contenido**: cada párrafo, titular y botón del original está en la nueva,
  en el mismo orden (normalizando lo que WordPress cambia: comillas «», `…`,
  `http`→`https`).
- **C3 Validador**: enlaces internos que existen, imágenes que existen y con
  medidas, sin shortcodes publicados como texto, sin restos del original,
  datos estructurados válidos, webp presentes.
- **SEO**: título y descripción iguales a los de la web viva, etiquetas para
  compartir y todas las URL en `sitemap.xml`; `noindex` solo en /gracias/ y 404.
- **Visual**: 404 en ningún enlace, contraste suficiente (si una foto no cargó,
  se arregla la foto, no el color), sin desbordes a 390 px, fotos cargadas y
  cabecera con altura controlada.
- Los cambios del original pedidos por Yama no son fallos: se anotan en
  `fallos-original.json` y el comprobador los acepta.

---

## D. EL PASO A PASO (como se hizo, corregido)

**Fase 0 — Reconocimiento.** Entorno (A1). Del XML: páginas, plantillas,
cabeceras, plugins y shortcodes, formularios (campos y a qué correo avisan),
menús. Inventario en `informes/inventario.md`. CLAUDE.md con las decisiones de la
sección 0. Lista numerada de dudas para Yama. **No se toca nada más.**

**Fase 1 — Bajar todo.** `estructura-viva.json` y `contenido-vivo.json` desde
`_elementor_data` (nunca desde `content:encoded`, que pierde bloques), con el
HTML de los textos, los enlaces de titulares e imágenes y las fotos de fondo.
`referencia/` con el HTML vivo. Todas las imágenes a `public/img/`. Legales
vacías en el export: apuntarlas para la Fase 4.

**Fase 2 — Motor.** Astro con las páginas desde los JSON, menú real, SEO
original, mapas de Google que tenía cada página, medidas de imagen.
`npm run todo` a 0. Las erratas del original, a la lista para Yama.

**Fase 3 — Diseño.** Propuestas `?tema=a|b|c` sobre la misma página, basadas en
las webs de referencia y en el logo. Yama elige; se prueba en una página de cada
tipo; se extiende. Colores como variables en `:root` de `global.css`, apuntados
en CLAUDE.md. **Probar ya con AdSense puesto**: los anuncios automáticos se
metían entre el logo y el menú y hubo que rehacer la cabecera en shadow DOM
declarativo. **Menú móvil con muchas entradas**: limitado al alto de pantalla y
con scroll en el menú, no en cada submenú. `todo:visual` a 0.

**Fase 4 — Contenido nuevo y SEO.** Siempre añadido, nunca sustituyendo:
- datos estructurados (Organization, WebSite, WebPage, BreadcrumbList, FAQPage),
  migas visibles, `llms.txt`;
- resúmenes y preguntas frecuentes en las páginas principales; tablas (medidas,
  precios aprobados por Yama encima de la lista original);
- páginas nuevas sin canibalizar: antes de crear una, comprobar que no hay otra
  que ataque la misma búsqueda (no se creó «Región de Murcia» porque ya estaba
  /murcia/, ni ciudades con el mismo nombre que su provincia);
- ciudades: información propia de OpenStreetMap; las duplicadas, redacción
  distinta en lo añadido; enlaces a cercanas y a su provincia en una sección al
  final;
- ubicaciones nuevas por tandas, con demanda real;
- legales redactadas desde datos reales.

**Fase 5 — Formulario.** Netlify Forms con envío sin salir de la página, aviso
de enviado o error, campo anti-spam y /gracias/ con `noindex`. **Prueba real**:
enviar uno y comprobar que llega el aviso.

**Fase 6 — Velocidad.** webp 400/800 en `<picture>` con la foto original en
`<img>`, medidas en todas las imágenes, tipografías locales (fontsource).

**Fase 7 — Lanzamiento, en este orden:**
1. Si los DNS van a Netlify: **copiar todos los registros de correo y
   comprobarlos en Netlify DNS antes de cambiar los servidores de nombres.**
   Sin esto no se pasa al punto 2.
2. Quitar `noindex` (salvo /gracias/ y 404) y abrir `robots.txt` con el sitemap.
3. Redirecciones: netlify.app y www al dominio, `/wp-content/uploads/*`,
   sitemaps de Yoast, feed.
4. AdSense + `ads.txt`; GA4; verificación de Bing.
5. Cambiar DNS; comprobar el dominio y el correo (enviar y recibir uno).
6. Enviar `sitemap.xml` en Search Console y Bing.
7. El hosting viejo, un mes más.

**Fase 8 — Revisión.** Solo lee: enlaces, 404, Search Console a las dos
semanas (páginas con tráfico antes y después).

---

## E. ERRORES QUE NOS PASARON EN CONTENEDORESMARITIMOS

| Qué pasó | Regla |
|---|---|
| Se pasaron los DNS a Netlify sin los registros de correo | Fase 7, paso 1: el correo primero |
| Se lanzó sin analítica (el UA había caducado) | Pedir el G-… en la Fase 0 |
| El navegador de Claude bloqueado para el dominio | Permiso antes de empezar |
| WebFetch agotado a las ~155 páginas | Bajar con script, no con WebFetch |
| La primera extracción aplanó negritas, listas y enlaces | Extraer el HTML y `settings.link.url` desde el principio |
| 3 rediseños después de aprobar uno | Webs de referencia en el primer mensaje |
| AdSense metía anuncios en la cabecera | Probar el diseño con AdSense activo |
| Argentina movida a /ar/ después del lanzamiento | Decidir países en la Fase 0 (D5) |
| Rehacer un JSON obligaba a repetir scripts a mano y en orden | `npm run generar` con todo en orden |
| «Fabricación» quitada de 173 páginas al final | Preguntar en la Fase 0 qué palabras no se quieren |
| Botones del original que llevaban a la página equivocada | Revisar destinos de botones en el inventario |
| Legales vacías en el export | Apuntarlas en la Fase 1 y redactarlas con datos reales |
| Menú móvil sin scroll con muchas entradas | Altura máxima de pantalla y scroll en el menú |
| Textos con tildes rotas al leer en PowerShell | `-Encoding UTF8` o la herramienta Read |
| Exports y ZIP sueltos en la carpeta principal | Todo lo de origen en `origen/`, fuera de Git |
| CLAUDE.md demasiado largo | Viñetas cortas; la historia, en `informes/` |

---

## F. PLANTILLA DE CLAUDE.md (corta)

```
# [DOMINIO] — migración de WordPress a Astro

## Quién manda
[Nombre], no técnico: castellano de España, de tú, sin jerga. Lo hace Claude.
Cada informe dice el estado (local / commit / main desplegado).

## Decisiones
D1 … D8: [la opción elegida, una línea cada una]. Regla del H1: [..].

## Marca y diseño
Sector: [..] · Tres palabras: [..] · Referencias: [..] · Diseño aprobado: [..]

## Datos
AdSense [..] · GA4 [..] · WhatsApp [..] · teléfono [..] · correo [..] ·
horario [..] · formulario [..] · DNS [..] · repositorio [..] · Netlify [..]
Páginas con tráfico: [..]

## Reglas
Método: PROMPT-MIGRACION-V7.md. Contenido original intocable salvo petición.
Nada inventado. Lo nuevo desde src/data/. `npm run todo` y `todo:visual` a 0.
Regenerar: `npm run generar`. Agentes: PROHIBIDO escribir ficheros.

## Estado
Fase actual: [N]. Hecho: [..]. Pendiente de [nombre]: [..].
```
