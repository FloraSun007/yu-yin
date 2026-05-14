import { WebPagePlayer } from '../livevideo/WebPagePlayer';
import { NOVEL_SOURCES, useNovelState, NovelState } from './useNovelState';
import './novel.css';

interface NovelModuleProps {
  novel: NovelState;
}

export function NovelModule({ novel }: NovelModuleProps) {
  return (
    <div className="main-content">
      {novel.currentUrl ? (
        <div className="player-area">
          <WebPagePlayer src={novel.currentUrl} onFatalError={() => {}} />
        </div>
      ) : (
        <div className="source-home">
          <div className="source-home-scroll">
            <div className="source-section">
              <div className="source-section-title">小说源</div>
              {NOVEL_SOURCES.map((s) => (
                <div
                  key={s.id}
                  className="source-item"
                  onClick={() => novel.handleSelect(s.url)}
                >
                  <span className="source-name">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="source-home-footer">
            Ctrl+` 工作/观赛模式 &nbsp;|&nbsp; F8 老板键 &nbsp;|&nbsp; Ctrl+Shift+↑↓ 透明度
          </div>
        </div>
      )}
    </div>
  );
}
