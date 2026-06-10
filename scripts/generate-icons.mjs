// Генерирует PNG-иконки из SVG для PWA.
// Запуск: node scripts/generate-icons.mjs
// Требует sharp (devDependency). Файлы пишутся в /public.

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const pub = resolve(root, "public");

const TARGETS = [
  { src: "icon.svg", out: "icon-192.png", size: 192 },
  { src: "icon.svg", out: "icon-512.png", size: 512 },
  { src: "icon-maskable.svg", out: "icon-maskable-512.png", size: 512 },
  { src: "icon.svg", out: "apple-touch-icon.png", size: 180 },
  { src: "icon.svg", out: "favicon-32.png", size: 32 },
  { src: "icon.svg", out: "favicon-16.png", size: 16 },
];

const results = [];
for (const t of TARGETS) {
  const svgBuf = await readFile(resolve(pub, t.src));
  const png = await sharp(svgBuf, { density: 600 })
    .resize(t.size, t.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(resolve(pub, t.out), png);
  results.push(`${t.out} (${png.length} bytes, ${t.size}x${t.size})`);
}

console.log("Generated:");
for (const r of results) console.log("  " + r);
