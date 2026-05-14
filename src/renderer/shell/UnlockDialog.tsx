import type { ThemeId } from '../env';
import { THEME_LIST } from './ThemeManager';

interface UnlockDialogProps {
  theme: ThemeId;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function UnlockDialog({ theme, inputValue, onInputChange, onSubmit, onCancel }: UnlockDialogProps) {
  return (
    <div className="unlock-overlay" onClick={onCancel}>
      <div className="unlock-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="unlock-title">解锁主题</div>
        <div className="unlock-desc">
          解锁「{THEME_LIST.find(t => t.id === theme)?.label}」主题
        </div>
        <input
          className="unlock-input"
          type="text"
          placeholder="请输入解锁码"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          autoFocus
        />
        <div className="unlock-actions">
          <button className="unlock-btn" onClick={onSubmit}>解锁</button>
          <button className="unlock-btn cancel" onClick={onCancel}>取消</button>
        </div>
      </div>
    </div>
  );
}
