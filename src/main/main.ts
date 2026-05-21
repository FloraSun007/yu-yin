import { app, BrowserWindow, ipcMain, screen, nativeImage, shell, protocol } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { createTray } from './tray';
import { registerShortcuts, unregisterShortcuts } from './shortcuts';
import * as points from './points';

app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

// Register local-file protocol for assets
protocol.registerSchemesAsPrivileged([
  { scheme: 'local-assets', privileges: { bypassCSP: true, stream: true, supportFetchAPI: true } },
]);

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Register local-assets protocol for serving files from resources
  protocol.registerFileProtocol('local-assets', (_request, callback) => {
    const assetsDir = app.isPackaged
      ? process.resourcesPath
      : path.join(__dirname, '..', '..', 'assets');
    const fileName = path.basename(_request.url.replace('local-assets://', ''));
    callback(path.join(assetsDir, fileName));
  });

  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.ico')
    : path.join(__dirname, '..', '..', 'assets', 'icon.ico');
  let appIcon: Electron.NativeImage | undefined;
  if (fs.existsSync(iconPath)) {
    appIcon = nativeImage.createFromBuffer(fs.readFileSync(iconPath));
  }

  mainWindow = new BrowserWindow({
    width: 600,
    height: 450,
    minWidth: 100,
    minHeight: 60,
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

  // ---- Points & Auth IPC ----
  ipcMain.handle('points:is-first-launch', () => {
    return !fs.existsSync(path.join(process.env.APPDATA || os.homedir(), 'yuyin', 'user.json'));
  });

  ipcMain.handle('points:init', async (_e, referralCode?: string) => {
    try {
      await points.initOrSync(referralCode);
      return points.getStatus();
    } catch (e: any) {
      return { error: e.message };
    }
  });

  ipcMain.handle('points:get-status', () => points.getStatus());

  ipcMain.on('points:start-consume', () => points.startConsumption());
  ipcMain.on('points:stop-consume', () => points.stopConsumption());

  ipcMain.handle('points:purchase-create', async (_e, productId: string) => {
    try {
      return await points.createPurchase(productId);
    } catch (e: any) {
      return { error: e.message };
    }
  });

  ipcMain.handle('points:purchase-status', async (_e, tradeNo: string) => {
    try {
      return await points.checkPurchaseStatus(tradeNo);
    } catch (e: any) {
      return { error: e.message };
    }
  });

  ipcMain.handle('points:purchase-claim', async (_e, tradeNo: string) => {
    try {
      return await points.claimPurchase(tradeNo);
    } catch (e: any) {
      return { error: e.message };
    }
  });
}

function createDesktopShortcut() {
  if (!app.isPackaged) return;
  const desktop = path.join(os.homedir(), 'Desktop');
  const shortcutPath = path.join(desktop, '鱼隐.lnk');
  if (fs.existsSync(shortcutPath)) return;

  const exePath = app.getPath('exe');
  const iconPath = path.join(process.resourcesPath, 'icon.ico');

  shell.writeShortcutLink(shortcutPath, {
    target: exePath,
    icon: fs.existsSync(iconPath) ? iconPath : exePath,
    iconIndex: 0,
    appUserModelId: 'com.yuyin.app',
    description: '鱼隐 - 工位摸鱼神器',
  });
}

app.whenReady().then(() => {
  createDesktopShortcut();
  createWindow();
});

app.on('window-all-closed', () => {
  unregisterShortcuts();
  app.quit();
});

app.on('will-quit', () => {
  unregisterShortcuts();
});
