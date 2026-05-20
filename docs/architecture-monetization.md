# 鱼隐商业化系统架构设计 v2（精简版）

> 版本: 2.0
> 日期: 2026-05-20
> 原则: 最小可用，逐步迭代

---

## 一、系统总览

```
┌──────────────────────────────────────┐
│          鱼隐客户端 (Electron)         │
│  ┌────────┐ ┌─────────┐ ┌─────────┐ │
│  │ Auth   │ │ Points  │ │ Pay UI  │ │
│  │ guest_id│ │ consume │ │ 购买页  │ │
│  └───┬────┘ └────┬────┘ └────┬────┘ │
│      └──────┬────┘──────────┘       │
│    %APPDATA%/yuyin/user.json (混淆) │
└─────────────┼───────────────────────┘
              │ HTTPS
┌─────────────┼───────────────────────┐
│        鱼隐后端 API (Node.js)        │
│        SQLite (单文件数据库)          │
│              │                      │
│       支付宝当面付 (扫码支付)         │
└─────────────────────────────────────┘
```

**核心原则：服务端余额是唯一权威，客户端只是缓存展示。**

---

## 二、数据库设计（SQLite，仅 2 张表）

### 2.1 accounts 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| guest_id | TEXT UNIQUE | 游客ID（客户端生成的UUID，去横线） |
| device_fp | TEXT | 设备指纹（SHA256） |
| points_balance | INTEGER DEFAULT 10000 | 点数余额（服务端权威） |
| auth_type | TEXT DEFAULT 'free' | 授权类型：free / half_year / permanent |
| auth_expire_at | TEXT NULL | 半年授权到期时间（ISO格式） |
| referral_code | TEXT UNIQUE | 专属推荐码（6位短码） |
| referrer_id | INTEGER NULL | 推荐人 account.id |
| daily_reward_date | TEXT NULL | 上次签到日期（YYYY-MM-DD） |
| created_at | TEXT | 创建时间 |

### 2.2 purchases 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER PK | 自增主键 |
| account_id | INTEGER | 关联 accounts.id |
| product_id | TEXT | 商品：energy_6 / half_year / permanent |
| amount_cents | INTEGER | 支付金额（分） |
| trade_no | TEXT UNIQUE | 支付宝订单号 |
| status | TEXT DEFAULT 'pending' | pending / paid / expired |
| paid_at | TEXT NULL | 支付完成时间 |
| created_at | TEXT | 创建时间 |

**不需要的表（延后到 v2）：**
- transactions（流水记录）→ v2 再做
- devices（多设备）→ v2 再做
- promotions（活动配置）→ MVP 活动价硬编码在客户端

---

## 三、API 接口设计（仅 6 个）

### 3.1 通用规范

- 基础路径: `https://api.yuyin.app/v1`
- 认证: 请求头 `X-Guest-ID` + `X-Token`（注册时服务端下发的简单随机 token）
- 响应格式: `{ code: 0, data: {...}, msg: "ok" }`
- 错误码: `0=成功, 1001=余额不足, 1002=无效参数, 1003=未授权, 2001=订单不存在`

### 3.2 接口详情

#### ① POST /init — 启动初始化（注册 + 同步 + 签到，三合一）

```
请求: { guest_id: string, device_fp: string, referral_code?: string }
响应: {
  guest_id, points_balance, auth_type, auth_expire_at,
  referral_code, daily_reward_claimed: boolean,
  token: string  // 后续请求用的认证 token（仅首次返回）
}

逻辑:
- guest_id 不存在 → 创建新账户（10000点），生成 referral_code
- guest_id 已存在 → 返回最新数据（同步余额）
- 同一请求内判断 daily_reward_date 是否为今天 → 自动发 50 点
- 若带 referral_code 且是新用户 → 给推荐人 +1000 点（同一 IP 每日限一次）
```

#### ② POST /consume — 上报消耗

```
请求: { duration_seconds: number }  // 本次使用秒数
响应: { balance: number }

逻辑:
- 每 10 分钟客户端上报一次
- 服务端计算: points = ceil(duration_seconds / 36)  // 100点/小时 = 100/3600点/秒
- auth_type != 'free' 的用户不扣点
- 余额不足时返回 code: 1001
```

#### ③ POST /purchase/create — 创建支付订单

```
请求: { product_id: string }
响应: { trade_no: string, qr_url: string, expire_at: string }

商品定义（硬编码在服务端）:
- energy_6:     600分(￥6),  +6000点
- half_year:    4500分(￥45), 半年无限
- permanent:    9800分(￥98), 永久无限
```

#### ④ POST /purchase/callback — 支付宝异步回调

```
说明: 支付宝服务器回调，非客户端调用
逻辑:
- 验证支付宝签名
- 更新 purchase 状态为 paid
- 根据商品类型更新 account: 加点数或改 auth_type
```

#### ⑤ GET /purchase/status — 查询支付状态

```
参数: ?trade_no=xxx
响应: { status: "pending"|"paid", auth_type?, auth_expire_at?, points_added? }

逻辑: 客户端每 3 秒轮询，最多 60 次（3 分钟）
```

#### ⑥ POST /referral — 验证推荐码（新用户首次启动）

```
请求: { referrer_code: string, ip: string }
响应: { success: boolean, bonus_points: number }

逻辑:
- 同一 IP 每日限一次
- 给推荐人的 account.points_balance += 1000
```

---

## 四、客户端模块设计

### 4.1 新增文件

```
src/
  main/
    auth.ts               # 游客ID + 设备指纹 + 本地存储
    points.ts             # 点数消耗计时 + 服务端同步 + IPC 通信
  renderer/
    monetization/
      PointsDisplay.tsx    # 左下角余额 UI
      PointsDetail.tsx     # 点数详情弹窗
      PurchasePage.tsx     # 购买页（三档套餐）
      PaymentModal.tsx     # 支付二维码弹窗
      ReferralPanel.tsx    # 推荐分享面板
      PromotionBanner.tsx  # 活动横幅
      PointsGuard.tsx      # 点数守卫（拦截内容）
      usePointsState.ts    # 点数状态 hook
```

### 4.2 auth.ts（主进程）

```
职责:
- generateGuestId()  → UUID v4 去横线，32位字符串
- generateFingerprint()  → hostname + username + CPU核心数 → SHA256 取前16位
- getLocalUser()  → 读取 %APPDATA%/yuyin/user.json
- saveLocalUser(data)  → 写入 JSON（字段做简单 Base64 混淆，防普通用户改）

本地存储内容:
{
  guest_id, device_fp, token,
  points_balance (缓存), auth_type, auth_expire_at,
  referral_code, last_sync_time
}
```

### 4.3 points.ts（主进程）

```
职责:
- startTimer()  → 用户进入内容页时开始计时
- stopTimer()   → 用户返回主界面时停止计时
- reportConsumption()  → 每10分钟 POST /consume
- syncBalance()  → 启动时调用 POST /init 同步余额
- isAuthorized()  → auth_type != 'free' 且未过期

IPC 接口（供渲染进程调用）:
- points:get-balance → 返回当前余额
- points:get-status  → 返回 { balance, authType, isAuthorized }
- points:check-daily → 返回是否已签到
```

### 4.4 PointsGuard 组件逻辑

```
包裹 LiveVideoModule / NovelModule:

if (isAuthorized)         → 直接放行，不消耗点数
if (balance <= 0)         → 显示「点数不足」提示页（含购买入口）
if (balance <= 500)       → 正常放行 + 顶部显示「余额不足」警告条
if (balance > 500)        → 正常放行
```

### 4.5 点数显示 UI（左下角）

```
┌─────────────────┐
│ ⚡ 8,327         │  ← 常驻显示，点击展开
└─────────────────┘
        ↓
┌─────────────────────┐
│ ⚡ 余额: 8,327 点     │
│ ─────────────────── │
│ 💰 获取点数           │  ← 打开购买页
│ 🎁 每日签到 +50      │  ← 一键领取
│ 🔗 推荐好友 +1,000   │  ← 打开推荐面板
└─────────────────────┘
```

### 4.6 购买页三档套餐

```
┌──────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 能量加油包 │ │  半年授权包        │ │  永久VIP包        │
│   ￥6     │ │  🔥 前500名6折     │ │   ￥98           │
│  +6,000点 │ │   ￥27 (￥45)     │ │  永久无限点数      │
│           │ │  半年无限点数       │ │  移除推广元素      │
│  [购买]   │ │  [购买]           │ │  官网致谢          │
└──────────┘ └──────────────────┘ │  [购买]          │
                                └──────────────────┘
```

---

## 五、安全设计（MVP 精简版）

### 5.1 本地存储

- 存储位置: `%APPDATA%/yuyin/user.json`
- 防护: JSON 字段 Base64 编码（防普通用户手动改，不防专业逆向）
- 关键数据: points_balance 只是缓存，以服务端 `/init` 返回值为准

### 5.2 API 通信

- HTTPS（服务端配置 SSL 证书）
- 请求头: `X-Guest-ID` + `X-Token`（注册时服务端下发的随机字符串）
- 无 HMAC 签名（v2 再加）
- 服务端校验 token 与 guest_id 匹配

### 5.3 点数防篡改

- 客户端上报消耗时长（秒），服务端计算扣减点数
- 服务端校验: 单次上报时长不超过 15 分钟（防恶意上报大数值）
- 服务端余额不低于 0

### 5.4 防刷机制

- 推荐奖励: 同一 IP 24 小时内限一次
- 每日签到: 服务端按 daily_reward_date 判断
- 支付: 支付宝回调验签

---

## 六、数据流

### 6.1 首次启动

```
启动 → 读取 %APPDATA%/yuyin/user.json
  → 不存在:
     → 生成 guest_id + device_fp
     → POST /init { guest_id, device_fp }
     → 服务端创建账户（10000点 + referral_code + token）
     → 保存到 user.json
  → 存在:
     → 读取 guest_id + token
     → POST /init { guest_id, device_fp }
     → 服务端返回最新余额 + 自动签到（如当天未签）
     → 更新本地缓存
```

### 6.2 内容消耗

```
用户进入直播/小说/网页
  → PointsGuard 检查 isAuthorized / balance
  → 通过 → 主进程 startTimer()
  
每 10 分钟:
  → 主进程 POST /consume { duration_seconds }
  → 服务端扣减，返回新余额
  → 更新本地缓存

用户返回主界面:
  → 主进程 stopTimer()
  → 上报最终消耗
```

### 6.3 购买流程

```
用户选择套餐 → POST /purchase/create
  → 返回 qr_url（支付宝收款码）
  → 显示 PaymentModal（二维码 + 3分钟倒计时）
  → 每 3 秒 GET /purchase/status 轮询
  → paid → 更新本地 auth_type / points
  → 刷新 UI
```

---

## 七、后端技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 运行时 | Node.js 20 | 与客户端统一 |
| 框架 | Fastify | 轻量高性能 |
| 数据库 | SQLite (better-sqlite3) | 单文件，零运维 |
| 部署 | 腾讯云/阿里云轻量服务器 | 2核2G 足够 |
| 支付 | 支付宝当面付 | 个体户可用，0.6%费率，有 Node SDK |
| 域名 | api.yuyin.app | + 免费 SSL (Let's Encrypt) |

---

## 八、开发阶段

### Phase 1: 后端 MVP（2-3 天）
- [ ] SQLite 数据库 + 2 张表
- [ ] POST /init 接口（注册 + 同步 + 签到）
- [ ] POST /consume 接口（消耗上报）
- [ ] POST /referral 接口（推荐验证）
- [ ] 部署到云服务器

### Phase 2: 客户端基础（2-3 天）
- [ ] auth.ts（游客ID + 设备指纹 + 本地存储）
- [ ] points.ts（消耗计时 + IPC）
- [ ] usePointsState hook
- [ ] PointsGuard 组件
- [ ] PointsDisplay 左下角 UI

### Phase 3: 支付系统（2-3 天）
- [ ] 支付宝当面付接入（沙箱环境调试）
- [ ] POST /purchase/create + callback + status
- [ ] PurchasePage 三档套餐 UI
- [ ] PaymentModal 二维码弹窗
- [ ] 授权状态更新逻辑

### Phase 4: 运营功能（2 天）
- [ ] ReferralPanel 推荐分享面板
- [ ] PromotionBanner 活动横幅
- [ ] PointsDetail 详情弹窗（签到 + 推荐 + 购买入口）

### Phase 5: 联调测试（2 天）
- [ ] 全流程联调
- [ ] 点数耗尽场景测试
- [ ] 支付流程测试
- [ ] 活动价测试

**总计约 10-13 天**
