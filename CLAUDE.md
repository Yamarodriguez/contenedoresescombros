# contenedoresescombros.com — migración de WordPress a Astro

## Quién manda
Yama, no técnico: castellano de España, de tú, sin jerga. Lo hace Claude.
Cada informe dice el estado (local / commit / main desplegado).

## Decisiones (valores por defecto del método; se confirman al tener el export)
- D1 Fuente: el XML de WordPress (`_elementor_data`), no la web en vivo.
- D2 Sube a main: Claude, con `npm run todo` y `todo:visual` a 0.
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
Tres palabras: [pendiente] · Referencias: [pendiente] · Diseño aprobado: [pendiente]

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
Fase 0 y Fase 1 HECHAS. Detalles en `informes/inventario.md` y `informes/fase1.md`.
Generado desde el `_elementor_data`: `src/content/pages/*.json` (95), `estructura-viva.json`,
`contenido-vivo.json`. Bajado: `public/img/` (201 imágenes), `referencia/` (95 HTML vivos).
Scripts propios en `scripts/`: extraer.mjs, bajar-imagenes.mjs, bajar-referencia.mjs.
2 páginas sin Elementor pendientes (personalizar-cookies, hola-mundo). Anuncios muertos (ca-pub-7650) quitados del contenido.
Pendiente de Yama: modelo de negocio (¿directorio o alquilas tú?), dirección legal completa, GA4, horario, diseño (3 palabras + webs de referencia), palabras a evitar.
Siguiente: Fase 2 (motor Astro: layout, rutas, SEO, menú, y `npm run todo` a 0). No necesita los datos pendientes.
