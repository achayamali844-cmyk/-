# DNS 记录清单：study.wo.weworld.games

## 部署平台

- 平台名称：Cloudflare Pages
- 项目部署 URL：Cloudflare Pages 首次部署后生成，格式通常类似 `https://<project-name>.pages.dev`。最终请以 Cloudflare Dashboard 显示为准。
- 自定义域名：`study.wo.weworld.games`

## DNS Record

| 字段 | 值 |
| --- | --- |
| DNS record type | `CNAME` |
| Name / Host | `study.wo`（如果 DNS 面板当前管理的是 `weworld.games`） |
| Name / Host | `study`（如果 DNS 面板当前管理的是 `wo.weworld.games`） |
| Value / Target | 先以 Cloudflare Pages 给出的值为准；常见值是 `<project-name>.pages.dev` |
| 是否需要 TXT 验证 | 通常子域名 CNAME 不需要 TXT；如果 Cloudflare Pages 页面提示 TXT 验证，请按页面给出的记录和值添加。 |
| 是否要求 Cloudflare Proxy | 不要求。首次验证建议关闭 Cloudflare Proxy，使用 DNS only / 灰云；验证成功后再按管理员策略决定是否开启。 |

## 验证步骤

1. 在 Cloudflare Pages 创建项目并确认默认 `pages.dev` 域名可打开。
2. 在 Cloudflare Pages 项目 Custom domains 里添加自定义域名：`study.wo.weworld.games`。
3. 复制 Cloudflare Pages 显示的 DNS 记录，发给域名管理员。
4. 管理员添加 CNAME；如果 Cloudflare Pages 额外要求 TXT 验证，也一起添加。
5. 等待 DNS 生效后，回到 Cloudflare Pages 点击 Check DNS / Verify。
6. Cloudflare Pages 显示域名 Active 且证书签发后，访问 `https://study.wo.weworld.games`。
7. 如果失败，检查是否有旧 CNAME/A 记录冲突、Cloudflare Proxy 是否影响验证、以及域名是否已被其他 Cloudflare Pages 项目占用。

## 给管理员的一句话

请只为 `study.wo.weworld.games` 添加 Cloudflare Pages 要求的 CNAME/TXT 记录。不要改 `weworld.games` 或 `wo.weworld.games` 的现有主站、API、数据库、Tunnel 或环境变量。
