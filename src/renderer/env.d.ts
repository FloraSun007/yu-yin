export {};

declare global {
  interface Window {
    api: {
      close: () => void;
      minimize: () => void;
      setOpacity: (value: number) => void;
      setSize: (w: number, h: number) => void;
      startDrag: () => void;
      stopDrag: () => void;
      onToggleMode: (callback: () => void) => () => void;
      onOpacityChanged: (callback: (opacity: number) => void) => () => void;
    };
  }
}

export type ThemeId = 'vscode' | 'excel' | 'system-update' | 'email';

export interface PresetSource {
  id: string;
  name: string;
  urls: string[];
  note?: string;
}
