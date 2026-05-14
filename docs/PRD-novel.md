# 小说阅读模块 PRD

> 版本: 0.3.0
> 更新日期: 2026-05-14
> 所属项目: 鱼隐 (YuYin)
> 状态: 已实现
> 主文档: [PRD.md](PRD.md)

---

## 1. 模块概述

小说阅读模块通过 Electron `<webview>` 嵌入主流小说网站，用户可在隐蔽窗口中在线阅读小说。模块采用与直播视频模块相同的 webview 架构，通过 CSS 注入优化小窗阅读体验。

---

## 2. 功能需求

### 2.1 内置小说源

| ID | 名称 | URL | 说明 |
|----|------|-----|------|
| `qidian` | 起点中文网 | `https://m.qidian.com` | 移动版，适合小窗阅读 |
| `qimao` | 七猫免费小说 | `https://www.qimao.com` | 免费小说平台 |

### 2.2 阅读功能

- 点击小说源后，在 webview 中打开对应网站
- 用户可在 webview 中正常浏览、搜索、阅读
- 返回按钮关闭 webview，回到小说源列表
- 返回时自动重置窗口尺寸为 600×450

### 2.3 伪装集成

- 阅读界面可被伪装主题覆盖，与其他模块共享主题系统
- 老板键（F8）对阅读模块同样有效
- Ctrl+` 切换工作/观赛模式

---

## 3. 模块结构

```
src/renderer/modules/novel/
├── NovelModule.tsx         # 模块根组件：源列表 + webview 阅读器
├── useNovelState.ts        # 状态管理：currentUrl、handleSelect、handleBack
└── novel.css               # 样式（复用 source-home 布局）
```

### 3.1 模块接口

```typescript
interface NovelModuleProps {
  novel: NovelState;  // useNovelState() 返回的状态对象
}
```

### 3.2 状态管理

| 状态 | 类型 | 说明 |
|------|------|------|
| `currentUrl` | `string` | 当前阅读的网页 URL，空字符串显示源列表 |
| `handleSelect` | `(url: string) => void` | 选择小说源 |
| `handleBack` | `() => void` | 返回源列表，重置窗口尺寸 |

---

## 4. 模块切换

App.tsx 中通过 Tab 切换直播/小说模块：

- 首页显示 "直播" / "小说" Tab 栏
- 点击 Tab 切换 `activeModule` 状态
- 有活跃内容（正在播放/阅读）时隐藏 Tab 栏
- 返回后重新显示 Tab 栏

---

## 5. 待扩展

- 自定义小说书源（用户添加 URL）
- CSS 注入优化阅读体验（隐藏广告、调整字号）
- 本地 TXT/EPUB 导入与解析
- 书架管理与阅读进度记忆
