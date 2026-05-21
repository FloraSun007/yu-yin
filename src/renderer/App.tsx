import { useState, useCallback } from 'react';
import { useShellState } from './shell/useShellState';
import { TopBarController } from './shell/TopBarController';
import { ThemeManager } from './shell/ThemeManager';
import { HoverZone } from './shell/HoverZone';
import { UnlockDialog } from './shell/UnlockDialog';
import { LiveVideoModule } from './modules/livevideo/LiveVideoModule';
import { NovelModule } from './modules/novel/NovelModule';
import { useVideoState } from './modules/livevideo/useVideoState';
import { useNovelState } from './modules/novel/useNovelState';
import { usePointsState } from './monetization/usePointsState';
import { PointsGuard } from './monetization/PointsGuard';
import { PointsDisplay } from './monetization/PointsDisplay';
import { PurchasePage } from './monetization/PurchasePage';
import { PaymentModal } from './monetization/PaymentModal';
import './App.css';
import './shell/shell.css';

type ModuleId = 'livevideo' | 'novel';

const MODULES: { id: ModuleId; label: string }[] = [
  { id: 'livevideo', label: '直播' },
  { id: 'novel', label: '小说' },
];

export default function App() {
  const shell = useShellState();
  const video = useVideoState();
  const novel = useNovelState();
  const points = usePointsState();
  const [activeModule, setActiveModule] = useState<ModuleId>('livevideo');
  const [showPurchase, setShowPurchase] = useState(false);
  const [paymentData, setPaymentData] = useState<{ tradeNo: string; amount: number } | null>(null);

  const hasActiveContent = !!(video.sourceUrl || novel.currentUrl);
  const currentBack = activeModule === 'livevideo' && video.sourceUrl
    ? video.handleBack
    : activeModule === 'novel' && novel.currentUrl
      ? novel.handleBack
      : undefined;

  const handlePurchase = useCallback(async (productId: string) => {
    const res = await window.api.pointsPurchaseCreate(productId);
    if ('error' in res) return;
    setPaymentData({ tradeNo: res.trade_no, amount: res.amount });
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    await points.init();
    setPaymentData(null);
    setShowPurchase(false);
  }, [points]);

  return (
    <div className="app">
      <ThemeManager visible={shell.workMode} theme={shell.currentTheme} unlockedThemes={shell.unlockedThemes} />
      <HoverZone onHoverStart={shell.handleHoverStart} onHoverEnd={shell.handleHoverEnd} />

      <TopBarController
        hasActiveContent={hasActiveContent}
        workMode={shell.workMode}
        currentTheme={shell.currentTheme}
        unlockedThemes={shell.unlockedThemes}
        showLogo={!hasActiveContent}
        onClose={() => window.api.close()}
        onMinimize={() => window.api.minimize()}
        onToggleMode={() => shell.setWorkMode((p) => !p)}
        onThemeChange={shell.setCurrentTheme}
        onUnlockRequest={shell.handleUnlockRequest}
        onBack={currentBack}
      />

      {showPurchase ? (
        <PurchasePage
          onBack={() => setShowPurchase(false)}
          onPay={handlePurchase}
        />
      ) : (
        <>
          {!hasActiveContent && (
            <div className="module-tabs">
              {MODULES.map((m) => (
                <button
                  key={m.id}
                  className={`module-tab ${m.id === activeModule ? 'active' : ''}`}
                  onClick={() => setActiveModule(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {hasActiveContent && (
            <PointsGuard status={points.status} onPurchase={() => setShowPurchase(true)}>
              {activeModule === 'livevideo' && <LiveVideoModule video={video} workMode={shell.workMode} />}
              {activeModule === 'novel' && <NovelModule novel={novel} />}
            </PointsGuard>
          )}

          {!hasActiveContent && (
            <>
              {activeModule === 'livevideo' && <LiveVideoModule video={video} workMode={shell.workMode} />}
              {activeModule === 'novel' && <NovelModule novel={novel} />}
            </>
          )}
        </>
      )}

      <PointsDisplay status={points.status} onPurchase={() => setShowPurchase(true)} onRefresh={points.refresh} hasActiveContent={hasActiveContent} />

      {shell.showUnlockDialog && (
        <UnlockDialog
          theme={shell.showUnlockDialog}
          inputValue={shell.unlockInput}
          onInputChange={shell.setUnlockInput}
          onSubmit={shell.handleUnlockSubmit}
          onCancel={() => shell.setShowUnlockDialog(null)}
        />
      )}

      {points.showReferralDialog && <ReferralDialog onSubmit={points.submitReferral} />}

      {paymentData && (
        <PaymentModal
          tradeNo={paymentData.tradeNo}
          amount={paymentData.amount}
          onClose={() => setPaymentData(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

function ReferralDialog({ onSubmit }: { onSubmit: (code?: string) => void }) {
  const [code, setCode] = useState('');
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 28, width: 280, textAlign: 'center'
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>欢迎来到鱼隐</div>
        <div style={{ fontSize: 12, color: '#71717a', marginBottom: 20 }}>输入推荐码，你和推荐人各得 1000 点</div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="选填，没有可跳过"
          maxLength={6}
          style={{
            width: '100%', padding: '10px 14px', fontSize: 14,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, color: '#e4e4e7', outline: 'none', marginBottom: 16,
            textAlign: 'center', letterSpacing: 2,
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => onSubmit()}
            style={{
              flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
              background: 'transparent', color: '#71717a',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer'
            }}
          >
            跳过
          </button>
          <button
            onClick={() => onSubmit(code.trim() || undefined)}
            style={{
              flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer'
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
