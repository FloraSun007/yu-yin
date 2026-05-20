const { v4: uuidv4 } = require('uuid');

function generateGuestId() {
  return uuidv4().replace(/-/g, '');
}

function generateToken() {
  return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
}

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateTradeNo() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return 'YY' + ts + rand;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function success(data = {}) {
  return { code: 0, data, msg: 'ok' };
}

function error(code, msg) {
  return { code, data: null, msg };
}

module.exports = {
  generateGuestId, generateToken, generateReferralCode,
  generateTradeNo, today, success, error
};
