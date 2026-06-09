# DNS 记录清单：study.wo.weworld.games

## 部署平台

- 平台名称：Vercel
- 项目部署 URL：Vercel 首次部署后生成，格式通常类似 `https://<project-name>-<team>.vercel.app`。最终请以 Vercel Dashboard 显示为准。
- 自定义域名：`study.wo.weworld.games`

## DNS Record

| 字段 | 值 |
| --- | --- |
| DNS record type | `CNAME` |
| Name / Host | `study.wo`（如果 DNS 面板当前管理的是 `weworld.games`） |
| Name / Host | `study`（如果 DNS 面板当前管理的是 `wo.weworld.games`） |
| Value / Target | 先以 Vercel Dashboard 给出的值为准；常见值是 `cname.vercel-dns.com` 或项目专属 `*.vercel-dns-*.com` |
| 是否需要 TXT 验证 | 只有当 Vercel 页面提示 Domain Verification / TXT record 时才需要。若出现，请添加 Vercel 给出的 `_vercel` TXT 记录和值。 |
| 是否要求 Cloudflare Proxy | 不要求。首次验证建议关闭 Cloudflare Proxy，使用 DNS only / 灰云；验证成功后再按管理员策略决定是否开启。 |

## 验证步骤

1. 在 Vercel 创建项目并确认默认 `vercel.app` 域名可打开。
2. 在 Vercel 项目设置里添加自定义域名：`study.wo.weworld.games`。
3. 复制 Vercel 显示的 DNS 记录，发给域名管理员。
4. 管理员添加 CNAME；如果 Vercel 额外要求 TXT 验证，也一起添加。
5. 等待 DNS 生效后，回到 Vercel 点击 Verify / Refresh / Check DNS。
6. Vercel 显示 Valid Configuration 且证书签发后，访问 `https://study.wo.weworld.games`。
7. 如果失败，检查是否有旧 CNAME/A 记录冲突、Cloudflare Proxy 是否影响验证、以及域名是否已被其他 Vercel 项目占用。

## 给管理员的一句话

请只为 `study.wo.weworld.games` 添加 Vercel 要求的 CNAME/TXT 记录。不要改 `weworld.games` 或 `wo.weworld.games` 的现有主站、API、数据库、Tunnel 或环境变量。
