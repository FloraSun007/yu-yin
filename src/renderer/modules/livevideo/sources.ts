import type { ThemeId, PresetSource } from '../env';

export const UNLOCK_CODE = 'yuyin2026';

export const PRESET_SOURCES: PresetSource[] = [
  {
    id: 'test-bbb',
    name: '测试流 — Big Buck Bunny',
    urls: [
      'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    ],
  },
  {
    id: 'cctv5',
    name: 'CCTV5 体育',
    urls: [
      'https://tv.cctv.com/live/cctv5/',
    ],
  },
  {
    id: 'cctv5plus',
    name: 'CCTV5+ 体育赛事',
    urls: [
      'https://tv.cctv.com/live/cctv5plus/',
    ],
  },
  {
    id: 'cctv16',
    name: 'CCTV16 奥林匹克',
    urls: [
      'https://tv.cctv.com/live/cctv16/',
    ],
  },
];

export function isDirectVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('.m3u8') || lower.endsWith('.mp4') || lower.endsWith('.webm');
}

export function loadUnlocked(): ThemeId[] {
  try {
    const saved = JSON.parse(localStorage.getItem('yuyin-unlocked') || '[]');
    const free: ThemeId[] = ['vscode', 'excel'];
    return [...new Set([...free, ...saved])];
  } catch {
    return ['vscode', 'excel'];
  }
}
