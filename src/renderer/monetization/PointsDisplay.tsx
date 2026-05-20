import { useState } from 'react';
import type { PointsStatus } from '../env';

interface PointsDisplayProps {
  status: PointsStatus;
  onPurchase: () => void;
  onRefresh: () => void;
}

export function PointsDisplay({ status, onPurchase, onRefresh }: PointsDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  if (status.isAuthorized) return null;

  return (
    <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 15 }}>
      {expanded && (
        <div style={{
          background: 'rgba(18,18,24,0.95)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10, padding: 14, width: 200, marginBottom: 4,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 600, marginBottom: 10 }}>
            ⚡ {status.balance.toLocaleString()} 点
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              onClick={() => { onPurchase(); setExpanded(false); }}
              style={btnStyle('#3b82f6')}
            >
              💰 获取点数
            </button>
            <button onClick={() => { onRefresh(); setExpanded(false); }} style={btnStyle('transparent')}>
              🔄 同步余额
            </button>
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: '#484f58', wordBreak: 'break-all' }}>
            推荐码: {status.referralCode}
          </div>
        </div>
      )}
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
    </div>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: '6px 10px', fontSize: 12, color: bg === 'transparent' ? '#a1a1aa' : '#fff',
    background: bg, border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 6, cursor: 'pointer', textAlign: 'left' as const
  };
}
