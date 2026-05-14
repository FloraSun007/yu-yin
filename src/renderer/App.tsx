import { useState } from 'react';
import { useShellState } from './shell/useShellState';
import { TopBarController } from './shell/TopBarController';
import { ThemeManager } from './shell/ThemeManager';
import { HoverZone } from './shell/HoverZone';
import { UnlockDialog } from './shell/UnlockDialog';
import { LiveVideoModule } from './modules/livevideo/LiveVideoModule';
import { NovelModule } from './modules/novel/NovelModule';
import { useVideoState } from './modules/livevideo/useVideoState';
import { useNovelState } from './modules/novel/useNovelState';
import './App.css';
import './shell/shell.css';

type ModuleId = 'livevideo' | 'novel';

const MODULES: { id: ModuleId; label: string }[] = [
  { id: 'livevideo', label: '直播' },
  { id: 'novel', label: '小说' },
];

export default function App() {
  const shell = useShellState();
  const video = useVideoState();
  const novel = useNovelState();
  const [activeModule, setActiveModule] = useState<ModuleId>('livevideo');

  const hasActiveContent = video.sourceUrl || novel.currentUrl;
  const currentBack = activeModule === 'livevideo' && video.sourceUrl
    ? video.handleBack
    : activeModule === 'novel' && novel.currentUrl
      ? novel.handleBack
      : undefined;

  return (
    <div className="app">
      <ThemeManager visible={shell.workMode} theme={shell.currentTheme} unlockedThemes={shell.unlockedThemes} />
      <HoverZone onHoverStart={shell.handleHoverStart} onHoverEnd={shell.handleHoverEnd} />

      <TopBarController
        workMode={shell.workMode}
        currentTheme={shell.currentTheme}
        unlockedThemes={shell.unlockedThemes}
        showLogo={!hasActiveContent}
        onClose={() => window.api.close()}
        onMinimize={() => window.api.minimize()}
        onToggleMode={() => shell.setWorkMode((p) => !p)}
        onThemeChange={shell.setCurrentTheme}
        onUnlockRequest={shell.handleUnlockRequest}
        onBack={currentBack}
      />

      {!hasActiveContent && (
        <div className="module-tabs">
          {MODULES.map((m) => (
            <button
              key={m.id}
              className={`module-tab ${m.id === activeModule ? 'active' : ''}`}
              onClick={() => setActiveModule(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {activeModule === 'livevideo' && <LiveVideoModule video={video} workMode={shell.workMode} />}
      {activeModule === 'novel' && <NovelModule novel={novel} />}

      {shell.showUnlockDialog && (
        <UnlockDialog
          theme={shell.showUnlockDialog}
          inputValue={shell.unlockInput}
          onInputChange={shell.setUnlockInput}
          onSubmit={shell.handleUnlockSubmit}
          onCancel={() => shell.setShowUnlockDialog(null)}
        />
      )}
    </div>
  );
}
