# 直播视频模块 PRD

> 版本: 0.2.0
> 更新日期: 2026-05-14
> 所属项目: 鱼隐 (YuYin)
> 主文档: [PRD.md](PRD.md)

---

## 1. 模块概述

直播视频模块是鱼隐的核心功能模块，负责视频播放、直播源管理、播放控制以及相关的 UI 页面（源列表页与播放页）。模块采用双播放器架构：`VideoPlayer` 用于直接视频流播放，`WebPagePlayer` 用于网页内嵌播放（如 CCTV 网页直播）。

---

## 2. 双播放器架构

模块根据源 URL 类型自动选择播放器：

- **直接视频 URL**（`.m3u8`、`.mp4`、`.webm`）→ 使用 `VideoPlayer`（hls.js + 原生 `<video>`）
- **网页 URL**（非直接视频格式）→ 使用 `WebPagePlayer`（Electron `<webview>` 加载网页）

判断函数 `isDirectVideoUrl(url)` 负责路由到正确的播放器。

### 2.1 VideoPlayer（直接视频播放）

#### 2.1.1 格式支持

| 格式 | 播放方式 | 说明 |
|------|----------|------|
| HLS (m3u8) | hls.js | 支持直播流和点播流，启用 Worker 和低延迟模式 |
| 原生 HLS (Safari) | 浏览器原生 | 当 hls.js 检测到浏览器原生支持时自动切换 |
| MP4 / WebM | 原生 `<video>` 标签 | 非 m3u8 链接直接使用 HTML5 Video |

#### 2.1.2 播放控制

- 播放/暂停按钮
- 可点击进度条 + 时间显示
- 音量滑块 + 静音切换
- 通过 `forwardRef` 暴露 `seek(time)` 方法

#### 2.1.3 错误处理与重试

- 网络错误：自动调用 `hls.startLoad()` 重试，最多 3 次
- 媒体错误：自动调用 `hls.recoverMediaError()` 重试，最多 3 次
- `FRAG_BUFFERED` 事件触发时重置重试计数
- 超过最大重试次数后触发 `onFatalError` 回调

#### 2.1.4 多源自动切换

当播放预设直播源（包含多个备用 URL）发生致命错误时：

1. 自动切换到当前预设的下一个 URL
2. 显示"切换中"状态指示（旋转动画）
3. 3 秒后自动清除切换状态
4. 所有 URL 均失败后停止尝试

### 2.2 WebPagePlayer（网页播放）

使用 Electron `<webview>` 标签嵌入网页，主要用于播放 CCTV 等网页直播源。

**核心功能：**

- 自动加载目标网页，全屏显示内容
- 针对央视 (`tv.cctv.com`) 域名自动注入 CSS：隐藏页面导航/侧边栏/广告等非视频元素，将播放器区域固定为全屏
- 加载失败时触发 `onFatalError` 回调
- 自定义 UserAgent 模拟标准浏览器

---

## 3. 直播源管理

### 3.1 预设直播源

内置 4 个直播源：

| ID | 名称 | 格式 | 说明 |
|----|------|------|------|
| `test-bbb` | 测试流 — Big Buck Bunny | HLS (m3u8) | 测试用，`https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8` |
| `cctv5` | CCTV5 体育 | 网页 | 通过 WebPagePlayer 加载 `https://tv.cctv.com/live/cctv5/` |
| `cctv5plus` | CCTV5+ 体育赛事 | 网页 | 通过 WebPagePlayer 加载 `https://tv.cctv.com/live/cctv5plus/` |
| `cctv16` | CCTV16 奥林匹克 | 网页 | 通过 WebPagePlayer 加载 `https://tv.cctv.com/live/cctv16/` |

> 注：当前版本预设源已精简为上述 4 个。早期版本包含更多测试流和海外体育频道。

每个预设源支持配置多个备用 URL（`urls[]`），用于自动故障切换。多源预设会显示"N源"标签。

### 3.2 自定义源

- 用户可输入任意视频或网页 URL 添加为自定义源
- 支持格式：m3u8、mp4、webm 以及网页地址等
- 自定义源持久化至 `localStorage('yuyin-sources')`
- 支持删除已添加的自定义源
- URL 超过 40 字符时自动截断显示

---

## 4. 用户界面

### 4.1 源列表页（主屏）

- 占据主内容区全部空间
- 分为两个区域：
  - **直播源**：列出所有预设直播源，点击即播放
  - **自定义源**：用户添加的 URL 列表 + 输入框（回车添加）
- 底部提示栏：快捷键说明

### 4.2 播放页

- 视频播放器占满主内容区
- 底部控制栏（仅 VideoPlayer 时显示）：播放/暂停、进度条、时间、音量、尺寸预设
- 控制栏仅在观赛模式下显示
- WebPagePlayer 模式下不显示本地控制栏（由网页自身提供控制）

---

## 5. 数据持久化

所有用户数据使用浏览器 `localStorage` 存储：

| Key | 类型 | 说明 |
|-----|------|------|
| `yuyin-sources` | `string[]` | 用户自定义直播源 URL 列表 |
| `yuyin-unlocked` | `ThemeId[]` | 已解锁的主题 ID 列表 |

免费主题 (`vscode`, `excel`) 始终包含在已解锁列表中，不受存储值影响。

---

## 6. 非功能需求

| 需求 | 指标 |
|------|------|
| HLS 重试 | 网络错误和媒体错误各最多 3 次自动重试 |
| 源切换延迟 | 切换指示 3 秒后自动清除 |
| WebPagePlayer CSS 注入 | 仅对 `tv.cctv.com` 域名生效 |

---

## 7. 已知限制

1. **CCTV 源依赖网页结构**：WebPagePlayer 注入的 CSS 选择器依赖央视网页 DOM 结构，页面改版可能导致失效
2. **WebPagePlayer 无本地控制**：网页播放模式下无法使用本地播放控制（进度条、音量等）
3. **预设源可用性**：CCTV 直播源可能因地区限制或服务变更而失效
