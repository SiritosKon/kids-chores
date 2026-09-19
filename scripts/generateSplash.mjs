import { deflateSync, inflateSync, crc32 } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const SOURCE_ICON = join(publicDir, 'pwa-512.png');
const BACKDROP = [0, 0, 0];
const ICON_SHARE = 0.28;
const CORNER_SHARE = 0.23;

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

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) {
    return a;
  }
  return pb <= pc ? b : c;
};

const decodePng = (file) => {
  const width = file.readUInt32BE(16);
  const height = file.readUInt32BE(20);
  const depth = file[24];
  const colorType = file[25];
  if (depth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported png: depth ${depth}, color type ${colorType}`);
  }
  const channels = colorType === 6 ? 4 : 3;

  const parts = [];
  let offset = 8;
  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') {
      parts.push(file.subarray(offset + 8, offset + 8 + length));
    }
    offset += length + 12;
  }

  const raw = inflateSync(Buffer.concat(parts));
  const stride = width * channels;
  const pixels = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const out = pixels.subarray(y * stride, (y + 1) * stride);
    const prior = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null;

    for (let index = 0; index < stride; index += 1) {
      const left = index >= channels ? out[index - channels] : 0;
      const up = prior ? prior[index] : 0;
      const upLeft = prior && index >= channels ? prior[index - channels] : 0;
      const value = line[index];
      if (filter === 1) {
        out[index] = (value + left) & 0xff;
      } else if (filter === 2) {
        out[index] = (value + up) & 0xff;
      } else if (filter === 3) {
        out[index] = (value + ((left + up) >> 1)) & 0xff;
      } else if (filter === 4) {
        out[index] = (value + paeth(left, up, upLeft)) & 0xff;
      } else {
        out[index] = value;
      }
    }
  }

  return { width, height, channels, pixels };
};

const encodePng = (width, height, pixels) => {
  const stride = width * 3;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 2;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const resize = (source, size) => {
  const out = Buffer.alloc(size * size * 3);
  const ratio = source.width / size;

  for (let y = 0; y < size; y += 1) {
    const fromY = Math.floor(y * ratio);
    const toY = Math.max(fromY + 1, Math.floor((y + 1) * ratio));
    for (let x = 0; x < size; x += 1) {
      const fromX = Math.floor(x * ratio);
      const toX = Math.max(fromX + 1, Math.floor((x + 1) * ratio));
      let red = 0;
      let green = 0;
      let blue = 0;
      let count = 0;
      for (let sy = fromY; sy < toY; sy += 1) {
        for (let sx = fromX; sx < toX; sx += 1) {
          const at = (sy * source.width + sx) * source.channels;
          red += source.pixels[at];
          green += source.pixels[at + 1];
          blue += source.pixels[at + 2];
          count += 1;
        }
      }
      const at = (y * size + x) * 3;
      out[at] = Math.round(red / count);
      out[at + 1] = Math.round(green / count);
      out[at + 2] = Math.round(blue / count);
    }
  }

  return out;
};

const insideRounded = (x, y, size, radius) => {
  const nearestX = Math.min(Math.max(x, radius), size - radius);
  const nearestY = Math.min(Math.max(y, radius), size - radius);
  const dx = x - nearestX;
  const dy = y - nearestY;
  return dx * dx + dy * dy <= radius * radius;
};

const compose = (icon, width, height) => {
  const size = Math.round(Math.min(width, height) * ICON_SHARE);
  const scaled = resize(icon, size);
  const radius = Math.round(size * CORNER_SHARE);
  const left = Math.round((width - size) / 2);
  const top = Math.round((height - size) / 2);

  const canvas = Buffer.alloc(width * height * 3);
  for (let index = 0; index < width * height; index += 1) {
    canvas[index * 3] = BACKDROP[0];
    canvas[index * 3 + 1] = BACKDROP[1];
    canvas[index * 3 + 2] = BACKDROP[2];
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!insideRounded(x, y, size, radius)) {
        continue;
      }
      const from = (y * size + x) * 3;
      const to = ((top + y) * width + left + x) * 3;
      canvas[to] = scaled[from];
      canvas[to + 1] = scaled[from + 1];
      canvas[to + 2] = scaled[from + 2];
    }
  }

  return encodePng(width, height, canvas);
};

const icon = decodePng(readFileSync(SOURCE_ICON));
mkdirSync(join(publicDir, 'splash'), { recursive: true });

for (const [width, height] of SPLASH_SIZES) {
  writeFileSync(join(publicDir, 'splash', `${width}x${height}.png`), compose(icon, width, height));
}

console.log(`${SPLASH_SIZES.length} splash screens drawn from ${SOURCE_ICON}`);
