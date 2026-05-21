import { useState, useEffect, useRef } from 'react';

interface PaymentModalProps {
  tradeNo: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ tradeNo, amount, onClose, onSuccess }: PaymentModalProps) {
  const [phase, setPhase] = useState<'pay' | 'confirm' | 'verifying' | 'done'>('pay');
  const [verifyCountdown, setVerifyCountdown] = useState(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleClaimPaid = () => {
    setPhase('verifying');
    setVerifyCountdown(10);
    timerRef.current = setInterval(() => {
      setVerifyCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          doClaim();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const doClaim = async () => {
    try {
      const res = await window.api.pointsPurchaseClaim(tradeNo);
      if ('error' in res) {
        setPhase('pay');
        return;
      }
    } catch {
      setPhase('pay');
      return;
    }
    setPhase('done');
    setTimeout(onSuccess, 1500);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: 28, width: 300, textAlign: 'center'
      }}>

        {phase === 'pay' && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7', marginBottom: 4 }}>支付宝扫码支付</div>
            <div style={{ fontSize: 11, color: '#71717a', marginBottom: 16 }}>请使用支付宝扫描下方二维码</div>
            <div style={{
              width: 200, height: 200, margin: '0 auto 12px',
              borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <img src="local-assets://alipay-qr.png" alt="收款码"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div style={{
              fontSize: 28, fontWeight: 900, color: '#fbbf24', marginBottom: 6,
              background: 'rgba(251,191,36,0.06)', borderRadius: 8, padding: '8px 0'
            }}>
              ￥{amount.toFixed(2)}
            </div>
            <div style={{ fontSize: 10, color: '#f87171', marginBottom: 12, lineHeight: 1.5 }}>
              请支付以上精确金额（含随机尾数）<br/>便于我们核实到账
            </div>
            <div style={{
              fontSize: 10, color: '#484f58', marginBottom: 16,
              background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px 10px'
            }}>
              订单号：{tradeNo}<br/>
              支付备注可填：{tradeNo.slice(-6)}
            </div>
            <button
              onClick={() => setPhase('confirm')}
              style={{
                width: '100%', padding: '12px 0', fontSize: 15, fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
                border: 'none', borderRadius: 10, cursor: 'pointer'
              }}
            >
              我已完成支付
            </button>
            <button
              onClick={onClose}
              style={{
                marginTop: 10, padding: '6px 20px', fontSize: 12,
                background: 'transparent', border: 'none',
                color: '#71717a', cursor: 'pointer'
              }}
            >
              取消
            </button>
          </>
        )}

        {phase === 'confirm' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>
              请确认已完成支付
            </div>
            <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 6, lineHeight: 1.6 }}>
              支付金额：<span style={{ color: '#fbbf24', fontWeight: 700 }}>￥{amount.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 11, color: '#f87171', marginBottom: 20, lineHeight: 1.6 }}>
              未实际支付却点击确认将被系统记录<br/>
              异常账户将被限制使用
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setPhase('pay')}
                style={{
                  flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
                  background: 'transparent', color: '#71717a',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer'
                }}
              >
                返回支付
              </button>
              <button
                onClick={handleClaimPaid}
                style={{
                  flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
                  background: '#3b82f6', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer'
                }}
              >
                确认已支付
              </button>
            </div>
          </>
        )}

        {phase === 'verifying' && (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>
              正在验证支付
            </div>
            <div style={{ fontSize: 13, color: '#71717a', marginBottom: 20 }}>
              请稍候 {verifyCountdown}s ...
            </div>
            <div style={{
              width: '60%', height: 4, margin: '0 auto',
              background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden'
            }}>
              <div style={{
                width: `${((10 - verifyCountdown) / 10) * 100}%`, height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                borderRadius: 2, transition: 'width 1s linear'
              }} />
            </div>
          </>
        )}

        {phase === 'done' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399', marginBottom: 4 }}>支付成功</div>
            <div style={{ fontSize: 13, color: '#71717a' }}>正在刷新授权状态…</div>
          </>
        )}
      </div>
    </div>
  );
}
