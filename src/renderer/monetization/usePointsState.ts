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

  const init = useCallback(async () => {
    setLoading(true);
    const res = await window.api.pointsInit();
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
    init();
  }, [init]);

  return { status, loading, init, refresh };
}
