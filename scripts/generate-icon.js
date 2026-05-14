const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const SIZE = 256;

// Blue circle with subtle gradient
const pixels = Buffer.alloc(SIZE * SIZE * 4);
const cx = SIZE / 2, cy = SIZE / 2;
const r = SIZE * 0.42;

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const idx = (y * SIZE + x) * 4;
    const dx = x - cx, dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= r + 0.5) {
      // Gradient: lighter at top-left, darker at bottom-right
      const t = ((dx / r) + (dy / r)) / 2; // -1..1
      const base = 66, sat = 133, bright = 244; // #4285f4
      pixels[idx]     = Math.max(0, Math.min(255, base + t * -20));   // R
      pixels[idx + 1] = Math.max(0, Math.min(255, sat + t * -15));   // G
      pixels[idx + 2] = Math.max(0, Math.min(255, bright + t * -10));// B
      // Anti-aliasing at edges
      pixels[idx + 3] = dist <= r - 0.5 ? 255 : Math.round((r + 0.5 - dist) * 255);
    }
  }
}

// CRC32
function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crcBuf]);
}

// IHDR
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA

// Scanlines
const raw = Buffer.alloc(SIZE * (1 + SIZE * 4));
for (let y = 0; y < SIZE; y++) {
  const off = y * (1 + SIZE * 4);
  raw[off] = 0; // filter: none
  pixels.copy(raw, off + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
}

const compressed = zlib.deflateSync(raw);
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const png = Buffer.concat([
  sig,
  pngChunk('IHDR', ihdr),
  pngChunk('IDAT', compressed),
  pngChunk('IEND', Buffer.alloc(0))
]);

// ICO wrapper (single 256x256 PNG entry)
const hdr = Buffer.alloc(6);
hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);

const entry = Buffer.alloc(16);
entry[0] = 0; entry[1] = 0; // 0 = 256
entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png.length, 8); entry.writeUInt32LE(22, 12);

const ico = Buffer.concat([hdr, entry, png]);

const dir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon.ico'), ico);
console.log('Generated assets/icon.ico (' + ico.length + ' bytes)');
