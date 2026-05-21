import * as http from 'http';
import { readLocalUser, writeLocalUser, getDeviceFp, generateGuestId } from './auth';
import type { LocalUser } from './auth';

const API_BASE = 'http://localhost:3001/v1';

let currentUser: LocalUser | null = null;
let consumeTimer: ReturnType<typeof setInterval> | null = null;
let consumeSeconds = 0;
let isConsuming = false;

function apiRequest(method: string, path: string, body?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (currentUser) {
      (options.headers as Record<string, string>)['X-Guest-ID'] = currentUser.guest_id;
      (options.headers as Record<string, string>)['X-Token'] = currentUser.token;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid response')); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function initOrSync(referralCode?: string): Promise<LocalUser> {
  const local = readLocalUser();
  const deviceFp = getDeviceFp();

  const body: any = {
    guest_id: local ? local.guest_id : generateGuestId(),
    device_fp: deviceFp,
  };

  // Only pass referral_code for new users (no local data)
  if (!local && referralCode) {
    body.referral_code = referralCode;
  }

  const res = await apiRequest('POST', '/init', body);

  if (res.code !== 0) {
    throw new Error(res.msg || 'Init failed');
  }

  const d = res.data;
  const user: LocalUser = {
    guest_id: d.guest_id,
    device_fp: deviceFp,
    token: d.token || (local ? local.token : ''),
    points_balance: d.points_balance,
    auth_type: d.auth_type,
    auth_expire_at: d.auth_expire_at,
    referral_code: d.referral_code,
    last_sync_time: new Date().toISOString(),
  };

  writeLocalUser(user);
  currentUser = user;
  return user;
}

function getBalance(): number {
  return currentUser?.points_balance ?? 0;
}

function isAuthorized(): boolean {
  if (!currentUser) return false;
  if (currentUser.auth_type === 'permanent') return true;
  if (currentUser.auth_type === 'half_year' && currentUser.auth_expire_at) {
    return new Date(currentUser.auth_expire_at) > new Date();
  }
  return false;
}

function getReferralCode(): string {
  return currentUser?.referral_code ?? '';
}

function startConsumption(): void {
  if (isAuthorized()) return;
  if (isConsuming) return;
  isConsuming = true;
  consumeSeconds = 0;

  consumeTimer = setInterval(async () => {
    consumeSeconds += 600; // 10 minutes
    try {
      const res = await apiRequest('POST', '/consume', { duration_seconds: consumeSeconds });
      if (res.code === 0 && currentUser) {
        currentUser.points_balance = res.data.balance;
        writeLocalUser(currentUser);
      }
      consumeSeconds = 0; // reset after successful report
    } catch {
      // keep consumeSeconds for next retry
    }
  }, 600_000); // every 10 minutes
}

function stopConsumption(): void {
  if (!isConsuming) return;
  isConsuming = false;

  if (consumeTimer) {
    clearInterval(consumeTimer);
    consumeTimer = null;
  }

  // Report final consumption
  if (consumeSeconds > 0 && currentUser) {
    apiRequest('POST', '/consume', { duration_seconds: consumeSeconds })
      .then((res) => {
        if (res.code === 0 && currentUser) {
          currentUser.points_balance = res.data.balance;
          writeLocalUser(currentUser);
        }
      })
      .catch(() => {});
    consumeSeconds = 0;
  }
}

async function createPurchase(productId: string): Promise<{ trade_no: string; qr_url: string; amount: number }> {
  const res = await apiRequest('POST', '/purchase/create', { product_id: productId });
  if (res.code !== 0) throw new Error(res.msg);
  return res.data;
}

async function checkPurchaseStatus(tradeNo: string): Promise<{ status: string; auth_type?: string; points_balance?: number }> {
  const res = await apiRequest('GET', `/purchase/status?trade_no=${tradeNo}`);
  if (res.code !== 0) throw new Error(res.msg);

  if (res.data.status === 'paid' && currentUser) {
    await initOrSync(); // refresh all data from server
  }
  return res.data;
}

async function verifyReferral(code: string): Promise<boolean> {
  const res = await apiRequest('POST', '/referral', { referrer_code: code });
  return res.code === 0;
}

function getStatus() {
  return {
    balance: getBalance(),
    authType: currentUser?.auth_type ?? 'free',
    authExpireAt: currentUser?.auth_expire_at ?? null,
    isAuthorized: isAuthorized(),
    referralCode: getReferralCode(),
    guestId: currentUser?.guest_id ?? '',
  };
}

export {
  initOrSync,
  startConsumption,
  stopConsumption,
  getBalance,
  isAuthorized,
  createPurchase,
  checkPurchaseStatus,
  verifyReferral,
  getStatus,
};
