# DNS 记录清单：study.wo.weworld.games

## 部署平台

- 平台名称：Render Web Service
- 项目服务名：academic-brainstorm-os-study
- 项目部署 URL：部署创建后由 Render 分配，预期格式为 `https://academic-brainstorm-os-study.onrender.com`
- 自定义域名：`study.wo.weworld.games`

## DNS Record

| 字段 | 值 |
| --- | --- |
| DNS record type | `CNAME` |
| Name / Host | `study.wo`（如果 DNS 面板当前管理的是 `weworld.games`） |
| Name / Host | `study`（如果 DNS 面板当前管理的是 `wo.weworld.games`） |
| Value / Target | Render 服务的 `onrender.com` 子域名，例如 `academic-brainstorm-os-study.onrender.com` |
| 是否需要 TXT 验证 | 通常不需要。普通单一子域名一般只需要 CNAME；如果 Render Dashboard 额外显示 TXT 验证，请按 Render 显示值追加。 |
| 是否要求 Cloudflare Proxy | 不要求。初次验证必须使用 DNS only / 灰云；证书签发完成后才可考虑开启代理。 |

## 验证步骤

1. 在 Render Dashboard 创建 Web Service，并确认 `https://academic-brainstorm-os-study.onrender.com` 或 Render 实际分配的 URL 能打开。
2. 在 Render 服务的 Custom Domains 添加：`study.wo.weworld.games`。
3. 将 Render 显示的 CNAME Target 发给域名管理员；管理员添加上方 CNAME 记录。
4. 如果域名使用 Cloudflare，Proxy status 先设置为 DNS only / 灰云。
5. 等待 DNS 生效后，在 Render Custom Domains 点击 Verify。
6. Render 显示 Verified / Certificate Issued 后，访问 `https://study.wo.weworld.games`。
7. 如果出现 502，等待几分钟后重试；如果一直失败，检查 Render 服务日志和 DNS CNAME 是否指向正确的 `onrender.com` 域名。

## 给管理员的一句话

请为 `study.wo.weworld.games` 添加一条 CNAME 到 Render 服务的 `onrender.com` 地址。不要改 `weworld.games` 或 `wo.weworld.games` 的现有主站、API、数据库、Tunnel 或环境变量。
