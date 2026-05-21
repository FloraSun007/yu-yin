const { generateGuestId, generateToken, generateReferralCode, today, success, error } = require('../lib/utils');
const { save } = require('../db');

function queryOne(db, sql, params) {
  const stmt = db.prepare(sql);
  stmt.bind(params || []);
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

function runAll(db, sql, params) {
  db.run(sql, params || []);
  save();
}

// POST /init — 注册 + 同步 + 签到（三合一）
function handleInit(db, body) {
  const { guest_id, device_fp, referral_code } = body;

  if (!guest_id || !device_fp) {
    return error(1002, '参数缺失');
  }

  // 查找已有账户
  let account = queryOne(db, 'SELECT * FROM accounts WHERE guest_id = ?', [guest_id]);

  if (!account) {
    // 新用户注册
    const refCode = generateReferralCode();
    const token = generateToken();

    // 处理推荐码
    let referrerId = null;
    if (referral_code) {
      const referrer = queryOne(db, 'SELECT id FROM accounts WHERE referral_code = ?', [referral_code]);
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    db.run(
      `INSERT INTO accounts (guest_id, device_fp, token, points_balance, referral_code, referrer_id)
       VALUES (?, ?, ?, 10000, ?, ?)`,
      [guest_id, device_fp, token, refCode, referrerId]
    );

    // 给推荐人加1000点
    if (referrerId) {
      db.run('UPDATE accounts SET points_balance = points_balance + 1000 WHERE id = ?', [referrerId]);
    }

    save();

    account = queryOne(db, 'SELECT * FROM accounts WHERE guest_id = ?', [guest_id]);
  }

  // 每日签到（首次注册当天不额外加，从第二天起每天+50）
  let dailyRewardClaimed = false;
  const todayStr = today();
  const isNewDay = account.daily_reward_date !== todayStr;
  const hasPreviousLogin = account.daily_reward_date != null && account.daily_reward_date !== '';
  if (isNewDay && hasPreviousLogin) {
    // 非首次登录的新一天，发放每日奖励
    db.run('UPDATE accounts SET points_balance = points_balance + 50, daily_reward_date = ? WHERE id = ?',
      [todayStr, account.id]);
    account.points_balance += 50;
    dailyRewardClaimed = true;
    save();
    account.daily_reward_date = todayStr;
  } else if (isNewDay && !hasPreviousLogin) {
    // 首次注册，只标记日期，不加50
    db.run('UPDATE accounts SET daily_reward_date = ? WHERE id = ?', [todayStr, account.id]);
    save();
    account.daily_reward_date = todayStr;
  }

  return success({
    guest_id: account.guest_id,
    points_balance: account.points_balance,
    auth_type: account.auth_type,
    auth_expire_at: account.auth_expire_at,
    referral_code: account.referral_code,
    daily_reward_claimed: dailyRewardClaimed,
    token: account.token
  });
}

// POST /consume — 上报消耗
function handleConsume(db, body, guestId) {
  const { duration_seconds } = body;

  if (!duration_seconds || duration_seconds <= 0) {
    return error(1002, '无效的消耗时长');
  }

  // 单次上报不超过15分钟
  const capped = Math.min(duration_seconds, 900);

  const account = queryOne(db, 'SELECT * FROM accounts WHERE guest_id = ?', [guestId]);
  if (!account) {
    return error(1003, '账户不存在');
  }

  // 已授权用户不扣点
  if (account.auth_type === 'permanent' ||
      (account.auth_type === 'half_year' && account.auth_expire_at && new Date(account.auth_expire_at) > new Date())) {
    return success({ balance: account.points_balance });
  }

  // 计算消耗: 100点/小时 = 100/3600 点/秒
  const cost = Math.ceil(capped * 100 / 3600);
  const newBalance = Math.max(0, account.points_balance - cost);

  db.run('UPDATE accounts SET points_balance = ? WHERE id = ?', [newBalance, account.id]);
  save();

  return success({ balance: newBalance });
}

// POST /referral — 验证推荐码
function handleReferral(db, body) {
  const { referrer_code } = body;

  if (!referrer_code) {
    return error(1002, '推荐码缺失');
  }

  const referrer = queryOne(db, 'SELECT * FROM accounts WHERE referral_code = ?', [referrer_code]);
  if (!referrer) {
    return error(1002, '推荐码无效');
  }

  db.run('UPDATE accounts SET points_balance = points_balance + 1000 WHERE id = ?', [referrer.id]);
  save();

  return success({ success: true, bonus_points: 1000 });
}

// POST /purchase/create — 创建支付订单
function handlePurchaseCreate(db, body, guestId) {
  const { product_id } = body;

  const products = {
    energy_6: { cents: 600, points: 6000 },
    half_year: { cents: 4500, days: 183 },
    permanent: { cents: 18800, permanent: true },
  };

  const product = products[product_id];
  if (!product) {
    return error(1002, '无效的商品');
  }

  const account = queryOne(db, 'SELECT * FROM accounts WHERE guest_id = ?', [guestId]);
  if (!account) {
    return error(1003, '账户不存在');
  }

  const { generateTradeNo } = require('../lib/utils');
  const tradeNo = generateTradeNo();

  db.run(
    `INSERT INTO purchases (account_id, product_id, amount_cents, trade_no) VALUES (?, ?, ?, ?)`,
    [account.id, product_id, product.cents, tradeNo]
  );
  save();

  // TODO: 调用支付宝API生成真实二维码URL
  // MVP阶段返回模拟数据
  const qrUrl = `https://qr.alipay.com/${tradeNo}`;

  return success({
    trade_no: tradeNo,
    qr_url: qrUrl,
    amount: product.cents / 100,
    expire_at: new Date(Date.now() + 3 * 60 * 1000).toISOString()
  });
}

// GET /purchase/status — 查询支付状态
function handlePurchaseStatus(db, tradeNo) {
  const purchase = queryOne(db, 'SELECT * FROM purchases WHERE trade_no = ?', [tradeNo]);
  if (!purchase) {
    return error(2001, '订单不存在');
  }

  const result = { status: purchase.status };

  if (purchase.status === 'paid') {
    const account = queryOne(db, 'SELECT * FROM accounts WHERE id = ?', [purchase.account_id]);
    if (account) {
      result.auth_type = account.auth_type;
      result.auth_expire_at = account.auth_expire_at;
      result.points_balance = account.points_balance;
    }
  }

  return success(result);
}

module.exports = {
  handleInit, handleConsume, handleReferral,
  handlePurchaseCreate, handlePurchaseStatus, queryOne
};
