import type { ThemeId } from '../env';
import { VSCodeTheme } from '../modules/livevideo/themes/VSCodeTheme';
import { ExcelTheme } from '../modules/livevideo/themes/ExcelTheme';
import { SystemUpdateTheme } from '../modules/livevideo/themes/SystemUpdateTheme';
import { EmailTheme } from '../modules/livevideo/themes/EmailTheme';

interface ThemeManagerProps {
  visible: boolean;
  theme: ThemeId;
  unlockedThemes: ThemeId[];
}

const THEMES: Record<ThemeId, React.FC> = {
  vscode: VSCodeTheme,
  excel: ExcelTheme,
  'system-update': SystemUpdateTheme,
  email: EmailTheme,
};

export function ThemeManager({ visible, theme, unlockedThemes }: ThemeManagerProps) {
  const ThemeComponent = THEMES[theme];
  const isLocked = !unlockedThemes.includes(theme);

  return (
    <div className={`theme-overlay ${visible ? 'theme-visible' : 'theme-hidden'}`}>
      <ThemeComponent />
      {isLocked && visible && (
        <div className="theme-lock-overlay">
          <div className="theme-lock-dialog">
            <div className="theme-lock-icon">🔒</div>
            <div className="theme-lock-title">主题未解锁</div>
            <div className="theme-lock-desc">该主题需要解锁后才能使用</div>
          </div>
        </div>
      )}
    </div>
  );
}

export const THEME_LIST: { id: ThemeId; label: string; locked: boolean }[] = [
  { id: 'vscode', label: 'VS Code', locked: false },
  { id: 'excel', label: 'Excel', locked: false },
  { id: 'system-update', label: '系统更新', locked: true },
  { id: 'email', label: '邮件', locked: true },
];
