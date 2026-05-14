import { VideoPlayer } from './VideoPlayer';
import { WebPagePlayer } from './WebPagePlayer';
import { PlayerControls } from './PlayerControls';
import { SizePresets } from './SizePresets';
import { PRESET_SOURCES, isDirectVideoUrl } from './sources';
import { useVideoState, VideoState } from './useVideoState';
import './livevideo.css';

interface LiveVideoModuleProps {
  video: VideoState;
  workMode: boolean;
}

export function LiveVideoModule({ video, workMode }: LiveVideoModuleProps) {
  return (
    <div className="main-content">
      {video.sourceUrl ? (
        <div className="player-area">
          {isDirectVideoUrl(video.sourceUrl) ? (
            <VideoPlayer
              ref={video.playerRef}
              src={video.sourceUrl}
              playing={video.playing}
              volume={video.volume}
              onTimeUpdate={video.setCurrentTime}
              onDurationChange={video.setDuration}
              onPlay={() => video.setPlaying(true)}
              onPause={() => video.setPlaying(false)}
              onFatalError={video.handleFatalError}
            />
          ) : (
            <WebPagePlayer src={video.sourceUrl} onFatalError={video.handleFatalError} />
          )}
        </div>
      ) : (
        <div className="source-home">
          <div className="source-home-scroll">
            <div className="source-section">
              <div className="source-section-title">直播源</div>
              {PRESET_SOURCES.map((s) => (
                <div
                  key={s.id}
                  className="source-item"
                  onClick={() => s.urls[0] && video.handleSelectSource(s.urls[0])}
                >
                  <span className="source-name">{s.name}</span>
                  {s.urls.length > 1 && <span className="source-backup">{s.urls.length}源</span>}
                </div>
              ))}
            </div>
            <div className="source-section">
              <div className="source-section-title">自定义源</div>
              {video.customSources.map((url) => (
                <div key={url} className="source-item" onClick={() => video.handleSelectSource(url)}>
                  <span className="source-name url">{url.length > 40 ? url.slice(0, 40) + '...' : url}</span>
                  <span className="source-remove" onClick={(e) => { e.stopPropagation(); video.handleRemoveCustom(url); }}>×</span>
                </div>
              ))}
              <div className="source-add">
                <input
                  className="source-add-input"
                  placeholder="输入视频或网页 URL（m3u8/mp4/网页地址），回车添加"
                  onKeyDown={(e) => {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (e.key === 'Enter' && val) {
                      video.handleAddCustom(val);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="source-home-footer">
            Ctrl+` 工作/观赛模式 &nbsp;|&nbsp; F8 老板键 &nbsp;|&nbsp; Ctrl+Shift+↑↓ 透明度
          </div>
        </div>
      )}

      {video.sourceUrl && !workMode && isDirectVideoUrl(video.sourceUrl) && (
        <div className="controls-wrapper">
          <PlayerControls
            playing={video.playing}
            volume={video.volume}
            currentTime={video.currentTime}
            duration={video.duration}
            onPlayPause={() => video.setPlaying((p) => !p)}
            onVolumeChange={video.setVolume}
            onSeek={video.handleSeek}
          />
          <SizePresets onSetSize={video.handleSetSize} />
        </div>
      )}
    </div>
  );
}
