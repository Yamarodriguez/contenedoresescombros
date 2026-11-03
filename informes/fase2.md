# Informe Fase 2 — Motor Astro (contenedoresescombros.com)

Estado: **en local, commit hecho, SIN subir a GitHub** (el primer envío va tras la Fase 3,
cuando pasen también las comprobaciones visuales, y con tu cuenta de GitHub conectada).

## Qué funciona
- **Astro compila las 97 páginas** (95 de contenido + inicio + gracias + 404) sin errores.
- Cada página se genera desde su JSON (`src/content/pages/`), respetando el contenido original.
- **Cabecera con tu menú real** (Inicio, Precios, Medidas y tipos, Alquiler, Recogida, Venta,
  Transporte, Habilitación, Provincias, Excavaciones, Empresas, Contacto) y su submenú.
- **SEO conservado**: cada página mantiene el título y la descripción que Google ya conoce.
- **Datos estructurados** (empresa, web, página y migas), AdSense en la cabecera, verificación
  de Google, mapa del sitio (`sitemap.xml`), 404 y página de gracias.
- Render de todos los tipos de bloque: texto (con negritas y enlaces), fotos con medidas,
  botones, mapas, acordeones y formulario de contacto.

## Comprobaciones: `npm run todo` A 0
1. Medidas de imagen — 201 imágenes medidas.
2. Compilar — 97 páginas.
3. Validador (C3) — 0 fallos (1 solo H1 por página, canónica correcta, imágenes con medidas, datos estructurados…).
4. Encabezados (C1) — 95 páginas, 0 diferencias (misma secuencia de H1/H2/H3 que el original).
5. Contenido (C2) — 95 páginas, 0 diferencias (cada texto, botón, enlace e imagen está, en orden).
6. SEO — 95 páginas, 0 diferencias (títulos y descripciones iguales a los de la web viva).

## Nota sobre el diseño
Lo que se ve ahora es **provisional y sencillo** (sirve para comprobar que todo está y funciona).
El diseño bonito es la **Fase 3**, y para no dar palos de ciego necesito tus referencias.

## Pendiente de Yama para la Fase 3 (diseño)
1. ¿La web es un **directorio** que anuncia/recomienda empresas, o **alquilas tú** los contenedores?
2. **2-3 webs que te gusten** (y qué te gusta de cada una) y **3 palabras** de cómo quieres que se sienta.
3. ¿Alguna **palabra que no quieras** que aparezca?
Y para más adelante: dirección legal completa, Google Analytics (`G-…`) y horario.
