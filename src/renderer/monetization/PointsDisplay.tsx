import { useState, useEffect, useRef } from 'react';
import type { PointsStatus } from '../env';

interface PointsDisplayProps {
  status: PointsStatus;
  onPurchase: () => void;
  onRefresh: () => void;
  hasActiveContent?: boolean;
}

export function PointsDisplay({ status, onPurchase, onRefresh, hasActiveContent }: PointsDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (status.isAuthorized || hasActiveContent) return null;

  const handleCopy = () => {
    const text = `鱼隐 - 工位摸鱼神器，低调看直播看小说！下载地址：https://yuyinmoyu.com 推荐码：${status.referralCode}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div ref={containerRef} style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 15 }}>
      {expanded && <ClickOutsideCloser containerRef={containerRef} onClose={() => setExpanded(false)} />}
      {expanded && (
        <div style={{
          background: 'rgba(18,18,24,0.95)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: 14, width: 220, marginBottom: 4,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 600, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚡ {status.balance.toLocaleString()} 点</span>
            <span style={{ fontSize: 9, fontWeight: 400, color: '#71717a' }}>每日登录 +50 点</span>
          </div>
          <button
            onClick={() => { onPurchase(); setExpanded(false); }}
            style={{
              padding: '6px 10px', fontSize: 12, color: '#fff',
              background: '#3b82f6', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 6, cursor: 'pointer', textAlign: 'left' as const, width: '100%'
            }}
          >
            💰 获取点数
          </button>
          <div style={{ marginTop: 10, fontSize: 10, color: '#71717a', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>推荐码: {status.referralCode}</span>
            <button
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: copied ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
                borderRadius: 4, padding: '1px 4px', fontSize: 10, lineHeight: 1,
                color: copied ? '#4ade80' : '#71717a', cursor: 'pointer'
              }}
              title="复制分享链接"
            >
              {copied ? '✓' : '分享'}
            </button>
          </div>
          <div style={{ marginTop: 4, fontSize: 9, color: '#fbbf24' }}>
            邀请好友下载各得 1000 点
          </div>
        </div>
      )}
      <div
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: expanded ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
            padding: '4px 10px', fontSize: 11, color: status.balance <= 500 ? '#fbbf24' : '#a1a1aa',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          ⚡ {status.balance.toLocaleString()}
        </button>
        <button
          onClick={onRefresh}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6,
            padding: '3px 6px', fontSize: 11, color: '#71717a',
            cursor: 'pointer', lineHeight: 1
          }}
          title="同步余额"
        >
          ↻
        </button>
        {tooltipVisible && !expanded && (
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
            background: 'rgba(18,18,24,0.95)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, padding: '8px 10px', fontSize: 10, color: '#a1a1aa',
            lineHeight: 1.5, whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>
            点击查看详情
          </div>
        )}
      </div>
    </div>
  );
}

function ClickOutsideCloser({ containerRef, onClose }: {
  containerRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [containerRef, onClose]);
  return null;
}
