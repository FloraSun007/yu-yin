import * as crypto from 'crypto';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

const USER_DATA_PATH = path.join(process.env.APPDATA || os.homedir(), 'yuyin');
const USER_FILE = path.join(USER_DATA_PATH, 'user.json');

interface LocalUser {
  guest_id: string;
  device_fp: string;
  token: string;
  points_balance: number;
  auth_type: string;
  auth_expire_at: string | null;
  referral_code: string;
  last_sync_time: string;
}

function generateGuestId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

function generateFingerprint(): string {
  const hostname = os.hostname();
  const username = os.userInfo().username;
  const cpus = os.cpus().length;
  const platform = os.platform();
  const arch = os.arch();
  const raw = `${hostname}:${username}:${cpus}:${platform}:${arch}`;
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
}

function obfuscate(data: string): string {
  return Buffer.from(data).toString('base64');
}

function deobfuscate(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

function readLocalUser(): LocalUser | null {
  try {
    if (!fs.existsSync(USER_FILE)) return null;
    const raw = fs.readFileSync(USER_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const user: LocalUser = {
      guest_id: deobfuscate(parsed.g || ''),
      device_fp: deobfuscate(parsed.d || ''),
      token: deobfuscate(parsed.t || ''),
      points_balance: parseInt(deobfuscate(parsed.p || '0'), 10),
      auth_type: deobfuscate(parsed.a || 'free'),
      auth_expire_at: parsed.e ? deobfuscate(parsed.e) : null,
      referral_code: deobfuscate(parsed.r || ''),
      last_sync_time: deobfuscate(parsed.s || ''),
    };
    if (!user.guest_id) return null;
    return user;
  } catch {
    return null;
  }
}

function writeLocalUser(user: LocalUser): void {
  if (!fs.existsSync(USER_DATA_PATH)) {
    fs.mkdirSync(USER_DATA_PATH, { recursive: true });
  }
  const data = {
    g: obfuscate(user.guest_id),
    d: obfuscate(user.device_fp),
    t: obfuscate(user.token),
    p: obfuscate(String(user.points_balance)),
    a: obfuscate(user.auth_type),
    e: user.auth_expire_at ? obfuscate(user.auth_expire_at) : '',
    r: obfuscate(user.referral_code),
    s: obfuscate(user.last_sync_time),
  };
  fs.writeFileSync(USER_FILE, JSON.stringify(data), 'utf-8');
}

function getDeviceFp(): string {
  return generateFingerprint();
}

export {
  generateGuestId,
  getDeviceFp,
  readLocalUser,
  writeLocalUser,
};
export type { LocalUser };
