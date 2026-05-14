import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';

export interface VideoPlayerHandle {
  seek: (time: number) => void;
}

interface VideoPlayerProps {
  src: string;
  playing: boolean;
  volume: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onFatalError: () => void;
}

const MAX_RETRIES = 3;

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ src, playing, volume, onTimeUpdate, onDurationChange, onPlay, onPause, onFatalError }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const retryCount = useRef(0);

    useImperativeHandle(ref, () => ({
      seek: (time: number) => {
        if (videoRef.current) videoRef.current.currentTime = time;
      },
    }));

    // Load source
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !src) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      retryCount.current = 0;

      const isHls = src.includes('.m3u8') || src.includes('m3u8');

      if (isHls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1024 * 1024,
          fragLoadingMaxRetry: 6,
          manifestLoadingMaxRetry: 4,
          levelLoadingMaxRetry: 4,
        });
        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          console.log('[HLS] manifest parsed, levels:', data.levels.length);
          data.levels.forEach((l: any, i: number) => {
            console.log(`[HLS] level ${i}: ${l.width}x${l.height}, codecs: ${l.codecSet}, bitrate: ${l.bitrate}`);
          });
          retryCount.current = 0;
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.FRAG_LOADED, (_e, data) => {
          console.log(`[HLS] frag loaded: ${data.frag.sn}, size: ${data.frag.stats?.total}`);
        });
        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          retryCount.current = 0;
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.log(`[HLS] error: type=${data.type} fatal=${data.fatal} details=${data.details}`, data);
          if (data.fatal) {
            retryCount.current++;
            if (retryCount.current > MAX_RETRIES) {
              onFatalError();
              return;
            }
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('[HLS] retrying network error...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('[HLS] retrying media error...');
                hls.recoverMediaError();
                break;
              default:
                onFatalError();
                break;
            }
          }
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (isHls && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.play().catch(() => {});
      } else {
        video.src = src;
        video.play().catch(() => {});
        const handleError = () => {
          retryCount.current++;
          if (retryCount.current > MAX_RETRIES) {
            onFatalError();
          }
        };
        video.addEventListener('error', handleError);
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }, [src, onFatalError]);

    // Play / Pause sync
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      if (playing) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, [playing]);

    // Volume sync
    useEffect(() => {
      if (videoRef.current) videoRef.current.volume = volume;
    }, [volume]);

    return (
      <video
        ref={videoRef}
        onTimeUpdate={() => onTimeUpdate(videoRef.current?.currentTime ?? 0)}
        onDurationChange={() => onDurationChange(videoRef.current?.duration ?? 0)}
        onPlay={onPlay}
        onPause={onPause}
        playsInline
        preload="auto"
      />
    );
  }
);
