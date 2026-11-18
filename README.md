# NewsForPrint · 打印行业产品情报站

NewsForPrint 是面向打印机产品、软件和行业研究的轻量情报站，当前以 NewsTime 为产品界面。

项目聚焦热敏打印、热升华照片打印、纹身转印、A4 热敏打印、Mini 打印、照片贴纸、打印切割，以及与办公、学习、玩具和平板相关的 AI 硬件。目标是把分散在应用商店、品牌官网、帮助中心、专利数据库和众筹平台中的公开信息，整理成可核验、可追溯的产品情报。

> 当前为阶段性试行版本。页面主体已完成，App Store 基础采集脚本可以独立运行；完整的多来源自动采集、审核和动态发布流水线仍在建设中。

## 当前能力

- 热点：展示近 14 天高价值更新和产品信号。
- 趋势研判：至少使用两条独立证据形成方向判断，并与官方事实分开呈现。
- 功能玩法推荐：整理近期出现的用户操作链路、使用场景和产品价值。
- 硬件新品与更新：跟踪打印硬件、介质、结构与上市信息。
- 技术参数与路线：比较热升华、UV、3D 打印等技术路线及关键参数。
- 专利／认证／供应链：展示竞品主体覆盖进度、近三年首批专利事件和核验状态。
- 竞品 App 监控：按纹身、A4、Mini、贴纸和图片分类，记录版本、更新说明和近 12 个月更新次数。
- AI＋硬件：关注办公、学习、玩具和平板场景。
- Kickstarter 雷达：跟踪打印科技和代表性创新硬件项目。
- 原始证据：正式情报保留首次公开日期、原文摘录、来源链接与核验状态。

## 监控范围

当前重点产品方向包括：

- 热敏纹身打印机
- A4 热敏打印机
- 热敏 Mini 打印机
- 热升华照片打印机
- 黑白照片打印机
- AI 智能热敏打印机
- 迷你喷墨打印机
- 水转印贴纸打印机
- 照片贴纸与打印切割设备

竞品 App 池包含 FlashToy、Fun Tattoo、Tattoo Go、Nada Print、Jadens Printer、AiYin、RONGTA、知无涯、Fun Print、HereLabel、汉印美照、极印 Photo 和 Cricut Design Space。

Phomemo App 不纳入外部竞品监控。Canon、Kodak 等传统大厂目前只跟踪硬件产品，不分析其软件功能。

## 数据准确性原则

项目遵循“宁缺毋滥、原文可查”的原则：

- 使用首次公开时间判断新鲜度，不使用抓取时间刷新消息年龄。
- 官方事实、原文摘录和分析解读分区展示。
- 常规修复、模糊的“体验优化”和重复更新文案不会进入主情报流。
- 未披露的参数明确显示为“未披露”，不使用推测值补齐。
- Kickstarter 众筹成功不等于量产、上市或按时交付。
- 专利按专利族合并，避免把公开文本、授权文本和多国申请重复统计。
- 聚合专利数据库用于发现，重要法律状态仍需回到 CNIPA、WIPO、EPO 或对应国家官方数据库核验。
- 趋势判断至少需要两条相互独立的已核验证据。

完整规则见 [docs/data-quality.md](docs/data-quality.md)。

## 技术结构

项目当前采用无构建步骤的轻量方案：

- 原生 HTML、CSS、JavaScript
- Node.js 静态文件服务
- Node.js App Store 采集脚本
- JSON 配置和本地历史快照

不依赖前端框架和数据库，适合先在单机或局域网中试运行。

## 目录结构

```text
NewsForPrint/
├─ config/
│  └─ competitor-apps.json       # 竞品 App 配置
├─ docs/
│  └─ data-quality.md            # 准确性、时效性和发布规则
├─ scripts/
│  ├─ serve-dashboard.mjs        # 本地/局域网页面服务
│  ├─ fetch-app-updates.mjs      # Apple Lookup API 采集
│  └─ audit-app-store.ps1        # App Store 辅助审计
├─ web/
│  ├─ overview.html              # 热点入口
│  ├─ products.html              # 功能玩法推荐
│  ├─ apps.html                  # 竞品 App 监控
│  ├─ technology.html            # 技术参数与路线
│  ├─ intelligence.html          # 专利/认证/供应链
│  ├─ ai-hardware.html           # AI 硬件
│  ├─ crowdfunding.html          # Kickstarter 雷达
│  ├─ portal.js                  # 多页面渲染逻辑
│  ├─ portal.css                 # 多页面公共样式
│  └─ sample-data.js             # 当前审核后展示数据
├─ package.json
└─ README.md
```

`data/` 和 `reports/` 属于本机运行产物，默认不提交到 Git。

## 环境要求

- Node.js 20 或更高版本
- 可访问 Apple Lookup API（运行 App 更新采集时需要）
- Windows、macOS 或 Linux

## 本地运行

```bash
npm run dashboard
```

浏览器访问：

```text
http://127.0.0.1:4173/web/
```

首页会自动跳转到 `overview.html`。

## 局域网运行

PowerShell：

```powershell
$env:HOST="0.0.0.0"
$env:PORT="4173"
npm run dashboard
```

查看部署电脑的局域网 IPv4 地址后，其他设备可访问：

```text
http://<部署电脑局域网IP>:4173/web/
```

需要在 Windows 防火墙中允许 TCP 4173，并建议仅允许专用网络或本地子网访问。部署电脑应使用固定 IP 或 DHCP 地址保留，并关闭自动休眠。

## App Store 更新采集

```bash
npm run fetch-apps
```

脚本读取 [config/competitor-apps.json](config/competitor-apps.json)，并生成：

```text
data/app-updates/latest.json
data/app-updates/<本轮时间>.json
reports/app-updates-latest.md
```

首次运行会把所有 App 视为首次收录；后续运行只记录版本号、发布时间或更新说明发生变化的 App。抓取失败时会保留上一轮快照并写入失败记录。

## 当前数据状态

页面目前主要读取 `web/sample-data.js` 中经过人工核验的展示数据。`fetch-app-updates.mjs` 生成的最新 JSON 尚未自动合并到页面，因此运行采集脚本后不会立即改变网页内容。

下一阶段会迁移为：

```text
公开来源
  → 原始快照 data/raw
  → 标准化与去重 data/normalized
  → 自动校验/人工审核
  → web/data/dashboard.json
  → 页面动态加载
```

客观字段可以在校验后自动发布，例如版本号、发布日期、官方更新说明和专利公开编号；趋势判断、产品解读、专利归属及社媒玩法仍需要人工审核。

## 后续计划

- 将 App Store 采集结果接入正式页面数据。
- 增加 Google Play 版本历史和官方更新日志监控。
- 建立品牌官网、帮助中心、Newsroom 和官方社媒采集器。
- 增加 Kickstarter 状态与项目更新定时扫描。
- 建立竞品法人别名字典和专利增量监控。
- 增加待审核队列、采集运行状态和失败告警。
- 支持 Windows 任务计划程序或容器化定时运行。
- 根据需要接入 AIHOT 的聚类、摘要和日报能力。

## 使用边界

本项目用于内部产品研究和公开信息整理。第三方商标、产品名称和原始内容归各自权利人所有。采集和使用数据时应遵守来源网站的服务条款、访问频率限制及适用法律法规。

