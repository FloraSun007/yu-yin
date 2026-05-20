import { useState, useEffect, useRef } from 'react';

interface PaymentModalProps {
  tradeNo: string;
  qrUrl: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ tradeNo, qrUrl, amount, onClose, onSuccess }: PaymentModalProps) {
  const [countdown, setCountdown] = useState(180);
  const [status, setStatus] = useState<'pending' | 'paid'>('pending');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    countRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(countRef.current!); onClose(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => { if (countRef.current) clearInterval(countRef.current); };
  }, [onClose]);

  // Poll payment status
  useEffect(() => {
    let tries = 0;
    pollRef.current = setInterval(async () => {
      tries++;
      if (tries > 60) { clearInterval(pollRef.current!); return; }
      try {
        const res = await window.api.pointsPurchaseStatus(tradeNo);
        if ('error' in res) return;
        if (res.status === 'paid') {
          setStatus('paid');
          clearInterval(pollRef.current!);
          clearInterval(countRef.current!);
          setTimeout(onSuccess, 1500);
        }
      } catch { /* ignore */ }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [tradeNo, onSuccess]);

  const min = Math.floor(countdown / 60);
  const sec = countdown % 60;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 28, width: 280, textAlign: 'center'
      }}>
        {status === 'paid' ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>支付成功</div>
            <div style={{ fontSize: 13, color: '#71717a' }}>正在刷新授权状态…</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', marginBottom: 4 }}>
              支付宝扫码支付
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 12 }}>
              ￥{amount}
            </div>
            <div style={{
              width: 180, height: 180, margin: '0 auto 12px',
              background: '#fff', borderRadius: 8, display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#333'
            }}>
              {/* MVP: 显示订单号代替真实二维码 */}
              <div style={{ fontSize: 10, color: '#666', wordBreak: 'break-all', padding: 8 }}>
                {qrUrl}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>
              请使用支付宝扫描二维码
            </div>
            <div style={{ fontSize: 11, color: countdown < 60 ? '#f87171' : '#484f58' }}>
              剩余 {min}:{sec.toString().padStart(2, '0')}
            </div>
          </>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: 16, padding: '6px 20px', fontSize: 12,
            background: 'rgba(255,255,255,0.06)', border: 'none',
            borderRadius: 6, color: '#888', cursor: 'pointer'
          }}
        >
          {status === 'paid' ? '完成' : '取消'}
        </button>
      </div>
    </div>
  );
}
