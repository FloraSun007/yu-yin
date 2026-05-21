import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  close: () => ipcRenderer.send('window:close'),
  minimize: () => ipcRenderer.send('window:minimize'),
  setOpacity: (value: number) => ipcRenderer.send('window:set-opacity', value),
  setSize: (w: number, h: number) => ipcRenderer.send('window:set-size', w, h),
  startDrag: () => ipcRenderer.send('window:start-drag'),
  stopDrag: () => ipcRenderer.send('window:stop-drag'),

  onToggleMode: (callback: () => void) => {
    ipcRenderer.on('shortcut:toggle-mode', callback);
    return () => ipcRenderer.removeListener('shortcut:toggle-mode', callback);
  },
  onOpacityChanged: (callback: (opacity: number) => void) => {
    const handler = (_e: any, opacity: number) => callback(opacity);
    ipcRenderer.on('opacity-changed', handler);
    return () => ipcRenderer.removeListener('opacity-changed', handler);
  },

  // Points & Auth
  pointsIsFirstLaunch: () => ipcRenderer.invoke('points:is-first-launch'),
  pointsInit: (referralCode?: string) => ipcRenderer.invoke('points:init', referralCode),
  pointsGetStatus: () => ipcRenderer.invoke('points:get-status'),
  pointsStartConsume: () => ipcRenderer.send('points:start-consume'),
  pointsStopConsume: () => ipcRenderer.send('points:stop-consume'),
  pointsPurchaseCreate: (productId: string) => ipcRenderer.invoke('points:purchase-create', productId),
  pointsPurchaseStatus: (tradeNo: string) => ipcRenderer.invoke('points:purchase-status', tradeNo),
});
