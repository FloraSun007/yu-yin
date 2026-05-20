const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'yuyin.db');

let db = null;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_id TEXT UNIQUE NOT NULL,
      device_fp TEXT NOT NULL,
      token TEXT NOT NULL,
      points_balance INTEGER DEFAULT 10000,
      auth_type TEXT DEFAULT 'free',
      auth_expire_at TEXT NULL,
      referral_code TEXT UNIQUE,
      referrer_id INTEGER NULL,
      daily_reward_date TEXT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      product_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      trade_no TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending',
      paid_at TEXT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  save();
  console.log('Database initialized');
  return db;
}

function save() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB, save };
