import { deflateSync, crc32 } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const BRAND = [245, 124, 0];
const BACKDROP = [0, 0, 0];

const SPLASH_SIZES = [
  [750, 1334],
  [828, 1792],
  [1125, 2436],
  [1170, 2532],
  [1179, 2556],
  [1242, 2688],
  [1284, 2778],
  [1290, 2796],
  [1536, 2048],
  [1620, 2160],
  [1668, 2224],
  [1668, 2388],
  [2048, 2732],
];

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])) >>> 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
};

const encodePng = (width, height, paint) => {
  const stride = width * 3 + 1;
  const raw = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * stride;
    for (let x = 0; x < width; x += 1) {
      const [red, green, blue] = paint(x, y);
      const pixel = rowStart + 1 + x * 3;
      raw[pixel] = red;
      raw[pixel + 1] = green;
      raw[pixel + 2] = blue;
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const insideRoundedSquare = (x, y, left, top, size, radius) => {
  const right = left + size;
  const bottom = top + size;
  if (x < left || x >= right || y < top || y >= bottom) {
    return false;
  }

  const nearestX = Math.min(Math.max(x, left + radius), right - radius);
  const nearestY = Math.min(Math.max(y, top + radius), bottom - radius);
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy <= radius * radius;
};

const solid = (size, color) => encodePng(size, size, () => color);

const splash = (width, height) => {
  const size = Math.round(Math.min(width, height) * 0.28);
  const left = Math.round((width - size) / 2);
  const top = Math.round((height - size) / 2);
  const radius = Math.round(size * 0.23);

  return encodePng(width, height, (x, y) =>
    insideRoundedSquare(x, y, left, top, size, radius) ? BRAND : BACKDROP
  );
};

mkdirSync(join(publicDir, 'splash'), { recursive: true });

writeFileSync(join(publicDir, 'pwa-192.png'), solid(192, BRAND));
writeFileSync(join(publicDir, 'pwa-512.png'), solid(512, BRAND));
writeFileSync(join(publicDir, 'apple-touch-icon.png'), solid(180, BRAND));

for (const [width, height] of SPLASH_SIZES) {
  writeFileSync(join(publicDir, 'splash', `${width}x${height}.png`), splash(width, height));
}

console.log(`icons + ${SPLASH_SIZES.length} splash screens written to public/`);
