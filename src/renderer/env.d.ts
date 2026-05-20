export {};

declare global {
  interface Window {
    api: {
      close: () => void;
      minimize: () => void;
      setOpacity: (value: number) => void;
      setSize: (w: number, h: number) => void;
      startDrag: () => void;
      stopDrag: () => void;
      onToggleMode: (callback: () => void) => () => void;
      onOpacityChanged: (callback: (opacity: number) => void) => () => void;

      pointsInit: () => Promise<PointsStatus | { error: string }>;
      pointsGetStatus: () => Promise<PointsStatus>;
      pointsStartConsume: () => void;
      pointsStopConsume: () => void;
      pointsPurchaseCreate: (productId: string) => Promise<{ trade_no: string; qr_url: string; amount: number } | { error: string }>;
      pointsPurchaseStatus: (tradeNo: string) => Promise<{ status: string; auth_type?: string; points_balance?: number } | { error: string }>;
    };
  }
}

export type ThemeId = 'vscode' | 'excel' | 'system-update' | 'email';

export interface PresetSource {
  id: string;
  name: string;
  urls: string[];
  note?: string;
}

export interface PointsStatus {
  balance: number;
  authType: string;
  authExpireAt: string | null;
  isAuthorized: boolean;
  referralCode: string;
  guestId: string;
}
