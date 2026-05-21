import { useState, useEffect, useCallback } from 'react';
import type { PointsStatus } from '../env';

export function usePointsState() {
  const [status, setStatus] = useState<PointsStatus>({
    balance: 0,
    authType: 'free',
    authExpireAt: null,
    isAuthorized: false,
    referralCode: '',
    guestId: '',
  });
  const [loading, setLoading] = useState(true);
  const [showReferralDialog, setShowReferralDialog] = useState(false);

  const init = useCallback(async (referralCode?: string) => {
    setLoading(true);
    const res = await window.api.pointsInit(referralCode);
    if ('error' in res) {
      setLoading(false);
      return;
    }
    setStatus(res as PointsStatus);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const res = await window.api.pointsGetStatus();
    setStatus(res);
  }, []);

  useEffect(() => {
    (async () => {
      const isFirst = await window.api.pointsIsFirstLaunch();
      if (isFirst) {
        setShowReferralDialog(true);
      } else {
        init();
      }
    })();
  }, [init]);

  const submitReferral = useCallback((code?: string) => {
    setShowReferralDialog(false);
    init(code || undefined);
  }, [init]);

  return { status, loading, init, refresh, showReferralDialog, submitReferral };
}
