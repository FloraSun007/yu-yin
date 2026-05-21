const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { initDB, getDB } = require('./db');
const {
  handleInit, handleConsume, handleReferral,
  handlePurchaseCreate, handlePurchaseStatus
} = require('./lib/points');

const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: true });

// Auth middleware: extract guest_id from header
fastify.addHook('preHandler', (req, reply, done) => {
  req.guestId = req.headers['x-guest-id'] || null;
  req.token = req.headers['x-token'] || null;
  done();
});

// POST /init
fastify.post('/v1/init', async (req) => {
  return handleInit(getDB(), req.body);
});

// POST /consume
fastify.post('/v1/consume', async (req, reply) => {
  if (!req.guestId) {
    reply.code(401);
    return { code: 1003, msg: '未提供 guest_id' };
  }
  return handleConsume(getDB(), req.body, req.guestId);
});

// POST /referral
fastify.post('/v1/referral', async (req) => {
  return handleReferral(getDB(), req.body);
});

// POST /purchase/create
fastify.post('/v1/purchase/create', async (req, reply) => {
  if (!req.guestId) {
    reply.code(401);
    return { code: 1003, msg: '未提供 guest_id' };
  }
  return handlePurchaseCreate(getDB(), req.body, req.guestId);
});

// GET /purchase/status
fastify.get('/v1/purchase/status', async (req) => {
  return handlePurchaseStatus(getDB(), req.query.trade_no);
});

// POST /purchase/callback (支付宝回调，MVP暂用模拟)
fastify.post('/v1/purchase/callback', async (req) => {
  const { trade_no } = req.body;
  const db = getDB();
  const { queryOne } = require('./lib/points');
  const { save } = require('./db');

  const purchase = queryOne(db, 'SELECT * FROM purchases WHERE trade_no = ?', [trade_no]);
  if (!purchase || purchase.status === 'paid') {
    return { code: 1, msg: '订单不存在或已支付' };
  }

  // 模拟支付成功：更新订单状态
  db.run("UPDATE purchases SET status = 'paid', paid_at = datetime('now') WHERE id = ?", [purchase.id]);

  // 根据商品类型更新账户
  if (purchase.product_id === 'energy_6') {
    db.run('UPDATE accounts SET points_balance = points_balance + 6000 WHERE id = ?', [purchase.account_id]);
  } else if (purchase.product_id === 'half_year') {
    db.run("UPDATE accounts SET auth_type = 'half_year', auth_expire_at = datetime('now', '+183 days') WHERE id = ?", [purchase.account_id]);
  } else if (purchase.product_id === 'permanent') {
    db.run("UPDATE accounts SET auth_type = 'permanent' WHERE id = ?", [purchase.account_id]);
  }

  save();
  return { code: 0, msg: 'ok' };
});

// POST /purchase/claim — 用户自报已支付（个人收款码模式）
fastify.post('/v1/purchase/claim', async (req) => {
  const { trade_no } = req.body;
  const db = getDB();
  const { queryOne } = require('./lib/points');
  const { save } = require('./db');

  const purchase = queryOne(db, 'SELECT * FROM purchases WHERE trade_no = ?', [trade_no]);
  if (!purchase) {
    return { code: 2001, msg: '订单不存在' };
  }
  if (purchase.status === 'paid' || purchase.status === 'claimed') {
    return { code: 1, msg: '订单已处理' };
  }

  // 标记为 claimed（待人工核实），先发放权益
  db.run("UPDATE purchases SET status = 'claimed', paid_at = datetime('now') WHERE id = ?", [purchase.id]);

  // 根据商品类型更新账户（先发放，后核实）
  if (purchase.product_id === 'energy_6') {
    db.run('UPDATE accounts SET points_balance = points_balance + 6000 WHERE id = ?', [purchase.account_id]);
  } else if (purchase.product_id === 'half_year') {
    db.run("UPDATE accounts SET auth_type = 'half_year', auth_expire_at = datetime('now', '+183 days') WHERE id = ?", [purchase.account_id]);
  } else if (purchase.product_id === 'permanent') {
    db.run("UPDATE accounts SET auth_type = 'permanent' WHERE id = ?", [purchase.account_id]);
  }

  save();
  return { code: 0, msg: 'ok' };
});

// Start
async function start() {
  await initDB();
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('YuYin API server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
