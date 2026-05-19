import { app, BrowserWindow, ipcMain, screen, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { createTray } from './tray';
import { registerShortcuts, unregisterShortcuts } from './shortcuts';

app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'icon.ico');
  let appIcon: Electron.NativeImage | undefined;
  if (fs.existsSync(iconPath)) {
    appIcon = nativeImage.createFromBuffer(fs.readFileSync(iconPath));
  }

  mainWindow = new BrowserWindow({
    width: 600,
    height: 450,
    minWidth: 320,
    minHeight: 240,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    backgroundColor: '#00000000',
    icon: appIcon,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      webSecurity: false,
    },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow?.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
    });
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createTray(mainWindow);
  registerShortcuts(mainWindow);

  ipcMain.on('window:close', () => mainWindow?.close());
  ipcMain.on('window:minimize', () => mainWindow?.hide());
  ipcMain.on('window:set-opacity', (_e, opacity: number) => {
    mainWindow?.setOpacity(Math.max(0.05, Math.min(1, opacity)));
  });
  ipcMain.on('window:set-size', (_e, w: number, h: number) => {
    mainWindow?.setSize(w, h);
  });

  // ---- JS-based window drag ----
  let dragInterval: ReturnType<typeof setInterval> | null = null;
  ipcMain.on('window:start-drag', () => {
    if (!mainWindow || dragInterval) return;
    const startMouse = screen.getCursorScreenPoint();
    const winBounds = mainWindow.getBounds();
    const offsetX = startMouse.x - winBounds.x;
    const offsetY = startMouse.y - winBounds.y;
    const w = winBounds.width;
    const h = winBounds.height;
    dragInterval = setInterval(() => {
      if (!mainWindow) { clearInterval(dragInterval!); dragInterval = null; return; }
      const pos = screen.getCursorScreenPoint();
      mainWindow.setBounds({ x: pos.x - offsetX, y: pos.y - offsetY, width: w, height: h });
    }, 16);
  });
  ipcMain.on('window:stop-drag', () => {
    if (dragInterval) { clearInterval(dragInterval); dragInterval = null; }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  unregisterShortcuts();
  app.quit();
});

app.on('will-quit', () => {
  unregisterShortcuts();
});
