import { globalShortcut, BrowserWindow } from 'electron';

export function registerShortcuts(mainWindow: BrowserWindow) {
  // F8 — Boss key: instant hide/show
  globalShortcut.register('F8', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });

  // Ctrl+` — Toggle work/watch mode (notify renderer)
  globalShortcut.register('CommandOrControl+`', () => {
    mainWindow.webContents.send('shortcut:toggle-mode');
  });

  // Ctrl+Shift+Up — Increase opacity
  globalShortcut.register('CommandOrControl+Shift+Up', () => {
    const cur = mainWindow.getOpacity();
    const next = Math.min(1, cur + 0.05);
    mainWindow.setOpacity(next);
    mainWindow.webContents.send('opacity-changed', next);
  });

  // Ctrl+Shift+Down — Decrease opacity
  globalShortcut.register('CommandOrControl+Shift+Down', () => {
    const cur = mainWindow.getOpacity();
    const next = Math.max(0.05, cur - 0.05);
    mainWindow.setOpacity(next);
    mainWindow.webContents.send('opacity-changed', next);
  });
}

export function unregisterShortcuts() {
  globalShortcut.unregisterAll();
}
