import { useState, useCallback } from 'react';

export interface NovelSource {
  id: string;
  name: string;
  url: string;
}

export const NOVEL_SOURCES: NovelSource[] = [
  { id: 'qidian', name: '起点中文网', url: 'https://m.qidian.com' },
  { id: 'qimao', name: '七猫免费小说', url: 'https://www.qimao.com' },
];

export type NovelState = ReturnType<typeof useNovelState>;

export function useNovelState() {
  const [currentUrl, setCurrentUrl] = useState('');

  const handleSelect = useCallback((url: string) => {
    setCurrentUrl(url);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentUrl('');
    window.api.setSize(600, 450);
  }, []);

  return { currentUrl, handleSelect, handleBack };
}
