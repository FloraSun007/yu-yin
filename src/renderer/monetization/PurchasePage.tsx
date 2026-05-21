import { useState } from 'react';

interface PurchasePageProps {
  onBack: () => void;
  onPay: (productId: string) => void;
}

const PRODUCTS = [
  {
    id: 'energy_6',
    name: '能量加油包',
    price: '￥6',
    desc: '获得 6,000 点数',
    color: '#3b82f6',
    cornerBadge: null as string | null,
  },
  {
    id: 'half_year',
    name: '半年授权包',
    price: '￥45',
    desc: '半年无限点数',
    color: '#8b5cf6',
    cornerBadge: '热卖' as string | null,
  },
  {
    id: 'permanent',
    name: '永久VIP包',
    price: '￥188',
    desc: '永久无限点数',
    color: '#f59e0b',
    cornerBadge: '即将涨价' as string | null,
    extra: '移除推广 · 官网致谢',
  },
];

export function PurchasePage({ onBack, onPay }: PurchasePageProps) {
  const [selected, setSelected] = useState<string>('half_year');

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      padding: 20, overflow: 'auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <button onClick={onBack} style={backBtnStyle}>← 返回</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginLeft: 12 }}>获取点数</span>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {PRODUCTS.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p.id)}
            style={{
              ...cardStyle,
              border: selected === p.id ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.06)',
              boxShadow: selected === p.id ? `0 0 20px ${p.color}33` : 'none',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{p.price}</div>
            <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>{p.desc}</div>
            {p.extra && <div style={{ fontSize: 11, color: '#484f58' }}>{p.extra}</div>}
            {p.cornerBadge && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                fontSize: 9, fontWeight: 700,
                color: p.cornerBadge === '热卖' ? '#fff' : '#fbbf24',
                background: p.cornerBadge === '热卖'
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'rgba(251,191,36,0.15)',
                border: p.cornerBadge === '即将涨价' ? '1px solid rgba(251,191,36,0.3)' : 'none',
                borderRadius: 4, padding: '2px 6px',
              }}>
                {p.cornerBadge}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => selected && onPay(selected)}
        style={{
          marginTop: 20, padding: '12px 40px', fontSize: 15, fontWeight: 700,
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
          border: 'none', borderRadius: 10, cursor: 'pointer', alignSelf: 'center'
        }}
      >
        立即购买
      </button>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  flex: '1 1 0', minWidth: 0, maxWidth: 180, padding: 20, borderRadius: 12,
  background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
  textAlign: 'center', transition: 'all 0.2s',
  position: 'relative',
};

const backBtnStyle: React.CSSProperties = {
  background: 'transparent', border: 'none', color: '#888',
  fontSize: 14, cursor: 'pointer', padding: '4px 8px'
};
