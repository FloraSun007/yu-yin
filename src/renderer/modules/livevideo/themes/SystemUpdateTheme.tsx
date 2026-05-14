export function SystemUpdateTheme() {
  return (
    <div className="theme-system-update">
      <div className="su-overlay">
        <div className="su-dialog">
          <div className="su-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#0078d4">
              <path d="M0 0h11.5v11.5H0zm12.5 0H24v11.5H12.5zM0 12.5h11.5V24H0zm12.5 0H24V24H12.5z" />
            </svg>
          </div>

          <div className="su-title">Windows 正在更新</div>
          <div className="su-subtitle">请勿关闭计算机。这将需要一段时间。</div>
          <div className="su-subtitle">您的计算机将重启几次。</div>

          <div className="su-progress-container">
            <div className="su-progress-track">
              <div className="su-progress-fill" />
            </div>
            <div className="su-percent">35%</div>
          </div>

          <div className="su-status">正在安装更新 1284/3647...</div>
        </div>
      </div>
    </div>
  );
}
