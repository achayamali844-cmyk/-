# 域名部署说明

这个项目不能直接把域名指向本机的 `localhost:3000`。正确流程是先部署到公网托管平台，再把域名 DNS 指向平台给出的地址。

## 推荐路线：Render Web Service

这个项目是 React + Vite + Express，包含 `/api/notion/sync` 服务端接口，所以推荐用 Web Service，而不是纯静态站点。

1. 把项目上传到 GitHub。
2. 在 Render 新建 Web Service 或 Blueprint，选择这个 GitHub 仓库。
3. 如果不用 Blueprint，手动设置构建和启动命令：

```bash
npm ci && npm run build
```

```bash
npm run start
```

4. 在 Render 的 Environment Variables 配置：

```env
GEMINI_API_KEY=你的 Gemini API Key
NOTION_API_KEY=你的 Notion Token，可选
NOTION_DATABASE_ID=你的 Notion Database ID，可选
APP_URL=https://study.wo.weworld.games
```

5. 先打开 Render 给你的 `onrender.com` 地址，确认页面能访问。
6. 在 Render 服务的 Custom Domains 里添加你的域名，例如：

```text
study.wo.weworld.games
```

7. 回到域名 DNS 管理后台，按 Render 页面提示添加 `CNAME` 或 `A` 记录。

常见子域名配置：

```text
类型: CNAME
名称: study.wo
值: Render 提供的目标地址
```

常见根域名配置：

```text
类型: A 或 ALIAS/ANAME
名称: @
值: Render 提供的目标地址
```

DNS 生效通常需要几分钟到 24 小时。SSL 证书一般由托管平台自动签发。

## Google Cloud Run 路线

如果你想走 Google 生态，也可以把这个 Express 服务部署到 Cloud Run，然后在 Cloud Run 或负载均衡/Firebase Hosting 里绑定自定义域名。

部署时同样需要配置这些环境变量：

```env
GEMINI_API_KEY=你的 Gemini API Key
NOTION_API_KEY=你的 Notion Token，可选
NOTION_DATABASE_ID=你的 Notion Database ID，可选
APP_URL=https://你的域名
```

## 需要你提供的信息

要真正帮你完成域名绑定，我还需要你告诉我：

```text
1. Render 服务创建后的 onrender.com URL
2. Render Custom Domain 页面显示的 CNAME target
3. 域名管理员是否管理 weworld.games 根域，还是只管理 wo.weworld.games 子区
```

不要把 `GEMINI_API_KEY`、域名账号密码或支付信息发在聊天里。密钥只应该填到托管平台的 Environment Variables / Secrets 面板。
