# 鱼隐 (YuYin)

隐蔽观赛与阅读的 Windows 桌面应用。

## 功能

- **直播视频** — 内置 CCTV5/CCTV5+/CCTV16 体育频道，支持自定义 HLS/MP4/WebM 链接和任意网页 URL（B站等）
- **小说阅读** — 内置起点中文网、七猫免费小说，在窗口内直接浏览阅读
- **伪装主题** — 一键切换 VS Code / Excel / 系统更新 / 邮件客户端等办公界面
- **老板键** — F8 瞬间隐藏/显示窗口
- **透明度调节** — Ctrl+Shift+↑↓ 连续调节窗口透明度
- **工作模式** — Ctrl+` 在伪装界面和内容之间切换

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| F8 | 老板键：瞬间隐藏/显示窗口 |
| Ctrl+\` | 切换工作/观赛模式 |
| Ctrl+Shift+↑ | 增加透明度 |
| Ctrl+Shift+↓ | 降低透明度 |

## 开发

```bash
npm install
npm run dev
```

## 打包

```bash
npm run dist
```

输出 Portable .exe 到 `release/` 目录，双击即可运行，无需安装。

## 技术栈

Electron 33 · React 18 · TypeScript · Vite 6 · hls.js

## License

MIT
