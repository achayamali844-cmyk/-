# 域名部署说明

这个项目不能直接把域名指向本机的 `localhost:3000`。正确流程是先部署到公网托管平台，再把域名 DNS 指向平台给出的地址。

## 推荐路线：Vercel

当前项目已适配 Vercel：前端使用 Vite 静态构建，后端接口位于 `api/` Serverless Functions。

1. 把项目推送到 GitHub。
2. 在 Vercel 新建 Project，导入这个 GitHub 仓库。
3. Vercel 设置：

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm ci
```

4. 在 Vercel Environment Variables 配置：

```env
GEMINI_API_KEY=你的 Gemini API Key
APP_URL=https://study.wo.weworld.games
NOTION_API_KEY=你的 Notion Token，可选
NOTION_DATABASE_ID=你的 Notion Database ID，可选
```

5. 先打开 Vercel 给你的 `vercel.app` 地址，确认页面能访问。
6. 在 Vercel 项目 Settings -> Domains 添加：

```text
study.wo.weworld.games
```

7. 把 Vercel 页面显示的 DNS 记录交给域名管理员。

常见子域名配置如下，但最终以 Vercel 页面显示为准：

```text
类型: CNAME
名称: study.wo
值: cname.vercel-dns.com
```

DNS 生效通常需要几分钟到 24 小时。SSL 证书由 Vercel 自动签发。

## 备用路线：Render Web Service

如果后续仍要用 Render，可以使用项目中的 [render.yaml](./render.yaml)。Render 构建命令应使用：

```bash
npm ci && npm run build:server
```

启动命令：

```bash
npm run start
```

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
1. Vercel 项目创建后的 vercel.app URL
2. Vercel Domains 页面显示的 CNAME target
3. 是否显示了 TXT verification 记录
4. 域名管理员是否管理 weworld.games 根域，还是只管理 wo.weworld.games 子区
```

不要把 `GEMINI_API_KEY`、域名账号密码或支付信息发在聊天里。密钥只应该填到托管平台的 Environment Variables / Secrets 面板。
