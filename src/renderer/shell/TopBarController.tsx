import type { ThemeId } from '../env';
import { THEME_LIST } from './ThemeManager';

interface TopBarControllerProps {
  workMode: boolean;
  currentTheme: ThemeId;
  unlockedThemes: ThemeId[];
  showLogo: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMode: () => void;
  onThemeChange: (theme: ThemeId) => void;
  onUnlockRequest: (theme: ThemeId) => void;
  onBack?: () => void;
}

export function TopBarController({
  workMode, currentTheme, unlockedThemes, showLogo,
  onClose, onMinimize, onToggleMode, onThemeChange, onUnlockRequest, onBack,
}: TopBarControllerProps) {
  return (
    <div className="top-bar" onDoubleClick={onMinimize}>
      <div className="top-bar-left">
        {showLogo && <span className="app-logo">鱼隐</span>}
        {onBack && (
          <button className="top-bar-btn back-btn" onClick={onBack} title="返回直播源列表">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
        )}
        {workMode && (
          <span className="mode-badge work">工作中</span>
        )}
      </div>
      <div className="top-bar-spacer"
        onMouseDown={() => window.api.startDrag()}
      />
      <div className="top-bar-buttons">
        {workMode && (
          <div className="theme-selector">
            {THEME_LIST.map((t) => {
              const locked = !unlockedThemes.includes(t.id);
              return (
                <button
                  key={t.id}
                  className={`theme-btn ${t.id === currentTheme ? 'active' : ''} ${locked ? 'locked' : ''}`}
                  onClick={() => locked ? onUnlockRequest(t.id) : onThemeChange(t.id)}
                  title={locked ? `${t.label} (未解锁)` : t.label}
                >
                  {locked ? '🔒' : ''}{t.label}
                </button>
              );
            })}
          </div>
        )}
        <button className="top-bar-btn mode-toggle" onClick={onToggleMode} title="Ctrl+` 切换模式">
          {workMode ? '👁' : '🔒'}
        </button>
        <button className="top-bar-btn" onClick={onMinimize} title="最小化到托盘">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="11" width="16" height="2" rx="1" />
          </svg>
        </button>
        <button className="top-bar-btn close" onClick={onClose} title="关闭">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
