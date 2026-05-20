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
  const [paymentData, setPaymentData] = useState<{ tradeNo: string; qrUrl: string; amount: number } | null>(null);

  const hasActiveContent = video.sourceUrl || novel.currentUrl;
  const currentBack = activeModule === 'livevideo' && video.sourceUrl
    ? video.handleBack
    : activeModule === 'novel' && novel.currentUrl
      ? novel.handleBack
      : undefined;

  const handlePurchase = useCallback(async (productId: string) => {
    const res = await window.api.pointsPurchaseCreate(productId);
    if ('error' in res) return;
    setPaymentData({ tradeNo: res.trade_no, qrUrl: res.qr_url, amount: res.amount });
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

      <PointsDisplay status={points.status} onPurchase={() => setShowPurchase(true)} onRefresh={points.refresh} />

      {shell.showUnlockDialog && (
        <UnlockDialog
          theme={shell.showUnlockDialog}
          inputValue={shell.unlockInput}
          onInputChange={shell.setUnlockInput}
          onSubmit={shell.handleUnlockSubmit}
          onCancel={() => shell.setShowUnlockDialog(null)}
        />
      )}

      {paymentData && (
        <PaymentModal
          tradeNo={paymentData.tradeNo}
          qrUrl={paymentData.qrUrl}
          amount={paymentData.amount}
          onClose={() => setPaymentData(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
