# Academic Brainstorm OS

AI Studio app source:
https://ai.studio/apps/7f7ea154-7792-4246-b785-f90d46ac5a43

## 本轮优化

- 模型列表对齐 Google AI Studio / Gemini API 当前模型代码。
- 默认模型改为稳定版 `gemini-3.5-flash`。
- 保留可选高阶模型 `gemini-3.1-pro-preview`、`gemini-3-flash-preview`、`gemini-3.1-flash-lite`。
- 重写学术系统提示词：保留 A-Level / IB 学术共创定位，但不再声称内置官方真题库或官方 Mark Scheme。
- 移除 `<think>` 输出要求，改为要求可见的简明依据。
- 增强 JSON 解析与学习打卡验证的容错。
- 会话历史、当前会话和设置会保存在浏览器 localStorage。

## Google AI Studio 配置

在 AI Studio 或部署平台的 Secrets / Environment Variables 面板配置 `GEMINI_API_KEY`。当前版本的 Gemini 调用走服务端 API，密钥只应存在于服务端环境变量中，不应写进前端代码或公开仓库。

```env
GEMINI_API_KEY="你的 Gemini API Key"
NOTION_API_KEY=""
NOTION_DATABASE_ID=""
```

`GEMINI_API_KEY` 是聊天、任务提取和学习打卡验证的必填项。`.env.example` 里的 `MY_GEMINI_API_KEY` 只是占位符，不能用于真实调用。

`NOTION_API_KEY` 和 `NOTION_DATABASE_ID` 只在使用“同步到 Notion”时需要。

本地运行时，在 `.env.local` 中配置同名变量：

```env
GEMINI_API_KEY="你的 Gemini API Key"
```

## 本地运行

需要 Node.js。

```bash
npm install
cp .env.example .env.local
npm run dev
```

然后打开：

```text
http://localhost:3000
```

## 部署和绑定域名

公网域名不能直接指向本机 `localhost:3000`。先把项目部署到 Cloudflare Pages 等公网平台，再按平台提示添加 DNS 记录。

详细步骤见：[DEPLOYMENT.md](./DEPLOYMENT.md)。

当前推荐使用 Cloudflare Pages。项目已提供 Cloudflare Pages Functions 目录：[functions](./functions)，并通过 [public/_redirects](./public/_redirects) 支持 SPA fallback。当前目标自定义域名是：

```text
study.wo.weworld.games
```

发给域名管理员的 DNS 记录清单见：[DNS_HANDOFF_study.wo.weworld.games.md](./DNS_HANDOFF_study.wo.weworld.games.md)。

## 验证

```bash
npm run lint
npm run build
```

本地验证 Express 生产服务时使用：

```bash
npm run build:server
npm run start
```

不需要真实 `GEMINI_API_KEY` 的验证：

- TypeScript 检查：`npm run lint`
- 生产构建：`npm run build`
- 缺少 key 或仍使用占位符时的错误提示路径

需要真实 `GEMINI_API_KEY` 的验证：

- 聊天流式回复
- 从聊天记录中提取任务
- 学习打卡 AI 验证与评分
- 不同 Gemini 模型在当前账号和地区下的端到端可用性

## 参考

- Gemini model list: https://ai.google.dev/gemini-api/docs/models
- Gemini text generation: https://ai.google.dev/gemini-api/docs/text-generation
