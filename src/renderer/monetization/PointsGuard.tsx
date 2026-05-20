import { useEffect } from 'react';
import type { PointsStatus } from '../env';

interface PointsGuardProps {
  status: PointsStatus;
  children: React.ReactNode;
  onPurchase: () => void;
}

export function PointsGuard({ status, children, onPurchase }: PointsGuardProps) {
  const isAuthorized = status.isAuthorized;
  const balance = status.balance;

  useEffect(() => {
    if (!isAuthorized && balance > 0) {
      window.api.pointsStartConsume();
    }
    return () => {
      window.api.pointsStopConsume();
    };
  }, [isAuthorized, balance]);

  if (isAuthorized) {
    return <>{children}</>;
  }

  if (balance <= 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: '#a1a1aa', gap: 16, padding: 32, textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, opacity: 0.5 }}>⚡</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e4e4e7' }}>点数不足</div>
        <div style={{ fontSize: 14, color: '#71717a', maxWidth: 260 }}>
          你的点数余额已用完，获取更多点数继续使用
        </div>
        <button
          onClick={onPurchase}
          style={{
            padding: '10px 32px', fontSize: 14, fontWeight: 600,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer'
          }}
        >
          获取点数
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      {balance <= 500 && (
        <div style={{
          padding: '4px 12px', fontSize: 11, color: '#fbbf24',
          background: 'rgba(251,191,36,0.08)', textAlign: 'center',
          borderBottom: '1px solid rgba(251,191,36,0.1)', flexShrink: 0
        }}>
          ⚡ 余额不足 {balance} 点，即将用完
        </div>
      )}
      {children}
    </div>
  );
}
