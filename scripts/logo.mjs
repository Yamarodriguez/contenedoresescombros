// Genera los PNG del logo a partir de public/favicon.svg: icono para móviles
// (apple-touch-icon 180 px), icono 192/512 y logo cuadrado para los datos
// estructurados (public/img/logo.png). Se ejecuta una vez o al cambiar el logo.
import fs from 'node:fs';
import sharp from 'sharp';

const svg = fs.readFileSync('public/favicon.svg');
await sharp(svg, { density: 600 }).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(svg, { density: 600 }).resize(192, 192).png().toFile('public/favicon-192.png');
await sharp(svg, { density: 600 }).resize(512, 512).png().toFile('public/img/logo.png');
console.log('Logo: apple-touch-icon.png, favicon-192.png, img/logo.png');
