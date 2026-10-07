import { deflateSync, inflateSync, crc32 } from 'node:zlib';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(rootDir, 'public');
const INDEX_HTML = join(rootDir, 'index.html');
const ART_DIR = join(rootDir, 'art');
const SOURCES = {
  portrait: join(ART_DIR, 'splash-portrait.png'),
  landscape: join(ART_DIR, 'splash-landscape.png'),
};
const BACKDROP = [0, 0, 0];

const BASE_PATH = '/kids-chores/';

const DEVICES = [
  [375, 667, 2],
  [414, 896, 2],
  [375, 812, 3],
  [390, 844, 3],
  [393, 852, 3],
  [402, 874, 3],
  [414, 896, 3],
  [428, 926, 3],
  [430, 932, 3],
  [440, 956, 3],
  [744, 1133, 2],
  [768, 1024, 2],
  [810, 1080, 2],
  [820, 1180, 2],
  [834, 1112, 2],
  [834, 1194, 2],
  [834, 1210, 2],
  [1024, 1366, 2],
  [1032, 1376, 2],
];

const SCREENS = DEVICES.flatMap(([width, height, ratio]) => [
  { width, height, ratio, orientation: 'portrait', pixels: [width * ratio, height * ratio] },
  { width, height, ratio, orientation: 'landscape', pixels: [height * ratio, width * ratio] },
]);

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

const resize = (source, width, height) => {
  const out = Buffer.alloc(width * height * 3);
  const ratioX = source.width / width;
  const ratioY = source.height / height;

  for (let y = 0; y < height; y += 1) {
    const fromY = Math.floor(y * ratioY);
    const toY = Math.max(fromY + 1, Math.floor((y + 1) * ratioY));
    for (let x = 0; x < width; x += 1) {
      const fromX = Math.floor(x * ratioX);
      const toX = Math.max(fromX + 1, Math.floor((x + 1) * ratioX));
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
      const at = (y * width + x) * 3;
      out[at] = Math.round(red / count);
      out[at + 1] = Math.round(green / count);
      out[at + 2] = Math.round(blue / count);
    }
  }

  return out;
};

const compose = (art, width, height) => {
  const scale = Math.min(width / art.width, height / art.height, 1);
  const artWidth = Math.round(art.width * scale);
  const artHeight = Math.round(art.height * scale);
  const scaled = resize(art, artWidth, artHeight);
  const left = Math.round((width - artWidth) / 2);
  const top = Math.round((height - artHeight) / 2);

  const canvas = Buffer.alloc(width * height * 3);
  for (let index = 0; index < width * height; index += 1) {
    canvas[index * 3] = BACKDROP[0];
    canvas[index * 3 + 1] = BACKDROP[1];
    canvas[index * 3 + 2] = BACKDROP[2];
  }

  for (let y = 0; y < artHeight; y += 1) {
    scaled.copy(canvas, ((top + y) * width + left) * 3, y * artWidth * 3, (y + 1) * artWidth * 3);
  }

  return encodePng(width, height, canvas);
};

const fileName = ({ pixels: [width, height] }) => `${width}x${height}.png`;

const linkTag = (screen) =>
  `    <link rel="apple-touch-startup-image" href="${BASE_PATH}splash/${fileName(screen)}" media="(device-width: ${screen.width}px) and (device-height: ${screen.height}px) and (-webkit-device-pixel-ratio: ${screen.ratio}) and (orientation: ${screen.orientation})" />`;

const writeLinks = () => {
  const lines = readFileSync(INDEX_HTML, 'utf8').split('\n');
  const kept = lines.filter((line) => !line.includes('rel="apple-touch-startup-image"'));
  const titleAt = kept.findIndex((line) => line.includes('<title>'));
  kept.splice(titleAt, 0, ...SCREENS.map(linkTag));
  writeFileSync(INDEX_HTML, kept.join('\n'));
};

const art = {
  portrait: decodePng(readFileSync(SOURCES.portrait)),
  landscape: decodePng(readFileSync(SOURCES.landscape)),
};
const splashDir = join(publicDir, 'splash');
rmSync(splashDir, { recursive: true, force: true });
mkdirSync(splashDir, { recursive: true });

for (const screen of SCREENS) {
  const [width, height] = screen.pixels;
  writeFileSync(join(splashDir, fileName(screen)), compose(art[screen.orientation], width, height));
}

writeLinks();

console.log(`${SCREENS.length} splash screens drawn from ${ART_DIR}`);
