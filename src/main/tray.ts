import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import { readFileSync } from 'fs';
import { join } from 'path';

// --- Tray icon from assets/icon.ico ---

function createIcon(): Electron.NativeImage {
  const icoPath = join(__dirname, '../../assets/icon.ico');
  try {
    const buf = readFileSync(icoPath);
    return nativeImage.createFromBuffer(buf, {
      width: 16,
      height: 16,
    });
  } catch {
    // Fallback: small blue circle
    return nativeImage.createFromBuffer(createFallbackPng());
  }
}

function createFallbackPng(): Buffer {
  const { deflateSync } = require('zlib');
  const w = 16, h = 16;
  const raw = Buffer.alloc(h * (1 + w * 4));

  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 4);
    raw[row] = 0;
    for (let x = 0; x < w; x++) {
      const px = row + 1 + x * 4;
      const dx = x - 7.5, dy = y - 7.5;
      if (Math.sqrt(dx * dx + dy * dy) < 6.5) {
        raw[px] = 59;
        raw[px + 1] = 130;
        raw[px + 2] = 246;
        raw[px + 3] = 255;
      }
    }
  }

  function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function pngChunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type, 'ascii');
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
    return Buffer.concat([len, typeB, data, crcB]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- Tray management ---

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow) {
  tray = new Tray(createIcon());
  tray.setToolTip('鱼隐');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示 / 隐藏',
      click: () => toggleWindow(mainWindow),
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        mainWindow.destroy();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindow(mainWindow));
}

function toggleWindow(mainWindow: BrowserWindow) {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}
