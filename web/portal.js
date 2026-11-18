const data = window.NEWS_TIME_DATA;
const page = document.body.dataset.page || "overview";
const state = { filter: "all", freshness: "latest", query: "", appFilter: "all" };
const asOfDate = parseISODate(data.asOf);

const pages = {
  overview: { file: "overview.html", label: "热点", eyebrow: "DAILY BRIEF · 11月18日", title: "热点", desc: "集中查看近期最值得关注的竞品更新、功能变化和产品信号。所有信息均保留首次公开日期、官方原文与来源。" },
  trends: { file: "trends.html", label: "趋势研判", eyebrow: "ANALYST SYNTHESIS", title: "趋势研判", desc: "基于两条以上独立证据形成产品方向判断。研判不是官方原话，页面会同时显示置信度与证据链接。" },
  products: { file: "products.html", label: "功能玩法推荐", eyebrow: "FEATURE & PLAY PATTERNS", title: "功能玩法推荐", desc: "从近期官方更新和新品中提炼可借鉴的用户玩法，展示完整操作链路、适用场景、产品价值与原始证据。" },
  hardware: { file: "hardware.html", label: "硬件新品与更新", eyebrow: "HARDWARE LAUNCHES · 90 DAYS", title: "硬件新品与产品更新", desc: "收录近90天可由官方来源核验的硬件发布与产品更新。传统大厂仅跟踪硬件，不分析配套软件。" },
  technology: { file: "technology.html", label: "技术参数与路线", eyebrow: "TECHNOLOGY BENCHMARK", title: "技术参数与技术路线", desc: "把新品信息拆成可比较的打印技术、分辨率、速度、尺寸、介质和产品结构；官方未披露的参数明确标记，不用推测值补齐。" },
  intelligence: { file: "intelligence.html", label: "专利／认证／供应链", eyebrow: "IP · CERTIFICATION · SUPPLY CHAIN", title: "专利／认证／供应链", desc: "监控技术布局、上市前认证与关键供应变化。仅在申请人、产品或证书主体能够核验时进入正式情报池。" },
  apps: { file: "apps.html", label: "竞品 App 监控", eyebrow: "COMPETITOR APP WATCHLIST", title: "竞品 App 监控", desc: "持续记录最新版本、发布日期、官方更新说明和近12个月更新次数，识别真实功能变化与版本活跃度。" },
  ai: { file: "ai-hardware.html", label: "AI＋硬件观察", eyebrow: "AI-NATIVE DEVICES", title: "AI＋硬件观察", desc: "聚焦办公、学习、玩具和平板场景，跟踪AI录音卡、墨水屏、拍学机、学习机、陪伴玩具与AI平板。" },
  sources: { file: "sources.html", label: "长期关注网站", eyebrow: "SOURCE MAP", title: "值得长期关注的科技网站", desc: "媒体用于发现线索，品牌官网、官方Newsroom、应用商店和项目页用于核验发布时间、参数与状态。" },
  crowdfunding: { file: "crowdfunding.html", label: "Kickstarter 资讯", eyebrow: "OVERSEAS CROWDFUNDING", title: "Kickstarter 资讯", desc: "跟踪打印科技及办公、学习、玩具、平板类创新硬件。众筹成功不等于量产、上市或按期交付。" }
};

const productTracks = [
  { key: "thermal-tattoo", label: "纹身打印", focus: "转印纸适配、镜像、滤镜、图像处理与新机型接入", terms: ["纹身"], filter: "thermal-tattoo", watch: ["滤镜/裁切/镜像", "转印纸与机型适配", "图案素材工作流"], opportunity: "通用打印App开始接入纹身纸，说明连接、图像处理和打印链路正在跨品类复用。" },
  { key: "thermal-a4", label: "A4 热敏", focus: "文档排版、扫描增强、多尺寸纸张与家庭办公", terms: ["A4"], filter: "thermal-a4", watch: ["PDF/Office文档处理", "扫描与画质增强", "纸张尺寸及裁切"], opportunity: "目前更新频率高，但高价值功能披露偏少；应重点观察文档预处理和家庭办公闭环。" },
  { key: "thermal-mini", label: "热敏 Mini", focus: "手账、便签、错题、内容社区与AI生成", terms: ["Mini", "热敏Mini"], filter: "thermal-mini", watch: ["手账与错题模板", "社区/素材供给", "AI画板与内容生成"], opportunity: "爱印已尝试AI画板、AR图片和作品社区，内容生产与分享可能成为硬件之外的差异点。" },
  { key: "photo", label: "照片与贴纸", focus: "热升华照片、姓名贴、证件照、打印切割与分享", terms: ["照片", "贴纸", "热升华"], filter: "photo", watch: ["姓名贴/证件照场景", "打印覆膜与切割", "照片分享与批量创作"], opportunity: "近期有效信号最集中，产品正在从单纯照片输出扩展到贴纸、姓名标识和现场分享。" },
  { key: "image-editor", label: "图片编辑能力", focus: "去背景、画质增强、AI人像、模板与打印预检", terms: ["照片", "打印切割"], filter: "image-editor", watch: ["去背景/清晰化", "AI人像与多结果", "打印前质量预检"], opportunity: "图像能力正从独立工具转向打印前流程，价值点是减少失败打印并提高成品确定性。" },
  { key: "emerging-print", label: "创新打印硬件", focus: "喷墨、UV、激光、3D打印与桌面制作设备", terms: [], filter: null, watch: ["桌面化与低门槛", "多材料/立体纹理", "AI监控和自动对位"], opportunity: "Kickstarter显示UV和多工具头3D打印热度较高，但应把筹款热度与交付、维护成本分开判断。" }
];

const recentPlayPatterns = [
  { evidenceId: "liene-name-sticker-26020", scene: "儿童标识 / 收纳", title: "用头像快速制作个性化姓名贴", flow: ["选择头像", "输入姓名", "套用姓名贴模板", "直接打印"], why: "把照片打印转化为返校、物品标记和家庭收纳的明确任务，入口更轻、结果更可预期。" },
  { evidenceId: "cricut-dtf-upscaler-1011", scene: "图片编辑 / 打印预检", title: "发现低清图片后直接一键增强再打印", flow: ["上传图片", "检测分辨率", "Boost Resolution", "继续制作"], why: "用户不用先离开打印软件寻找修图工具，图片质量判断和修复被嵌入打印前流程。" },
  { evidenceId: "hanin-multi-reference-ai", scene: "AI照片 / 人像创作", title: "用多张参考图生成并比较多个人像结果", flow: ["选择多张参考图", "设置生成数量", "生成背景", "批量保存结果"], why: "AI照片从一次生成升级为可比较、可挑选的批量创作，更接近真实照片消费决策。" },
  { evidenceId: "aiyin-ai-community-ar", scene: "热敏Mini / 内容社区", title: "AI画板创作后打印，再进入社区分享", flow: ["AI画板或涂鸦", "生成/编辑内容", "打印作品", "社区或AR展示"], why: "玩法从单机打印扩展到创作—输出—分享链路，内容供给和社区互动开始成为产品能力。" }
];

document.querySelector("#app").innerHTML = shellTemplate();
const content = document.querySelector("#pageContent");
renderCurrentPage();
setupCommonEvents();

function shellTemplate() {
  const cfg = pages[page];
  return `<div class="app-shell">
    <aside class="sidebar" id="sidebar">
      <a class="brand" href="overview.html"><span class="brand-mark">NT</span><span><strong>NewsTime</strong><small>打印行业情报站</small></span></a>
      <nav class="side-nav" aria-label="情报站导航">
        <section><p>竞品及行业</p>
          ${navLink("overview", "⌁", "热点", `<b>${latestSignals().length}</b>`)}
          ${navLink("trends", "↗", "趋势研判")}
          ${navLink("products", "▦", "功能玩法推荐")}
          ${navLink("hardware", "◇", "硬件新品与更新")}
          ${navLink("technology", "⌗", "技术参数与路线")}
          ${navLink("intelligence", "◉", "专利／认证／供应链")}
          ${navLink("apps", "◫", "竞品 App 监控")}
        </section>
        <section><p>AI 硬件</p>${navLink("ai", "✦", "AI＋硬件观察")}${navLink("sources", "◎", "长期关注网站")}</section>
        <section><p>海外众筹雷达</p>${navLink("crowdfunding", "K", "Kickstarter 资讯", "<em>NEW</em>")}</section>
      </nav>
      <div class="sidebar-foot"><span><i></i>数据监控运行中</span><small>数据截点：${data.asOf}</small><a href="../docs/data-quality.md">数据质量规则 →</a></div>
    </aside>
    <div class="workspace">
      <header class="workspace-header"><button class="menu-toggle" id="menuToggle" type="button">☰</button><div><p class="eyebrow">PRODUCT INTELLIGENCE</p><h1>${cfg.label}</h1></div><label class="global-search"><span>⌕</span><input id="searchInput" type="search" placeholder="搜索当前模块" /><kbd>/</kbd></label></header>
      <main class="page-main"><div class="page-hero"><div><p class="eyebrow">${cfg.eyebrow}</p><h2>${cfg.title}</h2><p class="page-hero-copy">${cfg.desc}</p></div>${metricsTemplate()}</div><div class="page-content" id="pageContent"></div></main>
      <footer><span>NewsTime · 打印行业产品情报试行版</span><span>数据范围：公开商店、官网、帮助中心、公开社媒与Kickstarter</span></footer>
    </div></div>`;
}

function navLink(key, icon, label, extra = "") {
  return `<a class="${page === key ? "active" : ""}" href="${pages[key].file}"><i>${icon}</i><span>${label}</span>${extra}</a>`;
}

function metricsTemplate() {
  const map = {
    overview: [[latestSignals().length, "14天有效信号"], [data.excludedActivity.length, "已降级活动"], [data.apps.length, "监控App"]],
    trends: [[data.playbook.length, "趋势判断"], [new Set(data.playbook.flatMap(x => x.evidenceIds)).size, "独立证据"], ["2+", "最低证据数"]],
    products: [[recentPlayPatterns.length, "近期玩法"], [new Set(recentPlayPatterns.map(x=>x.scene)).size, "应用场景"], [recentPlayPatterns.length, "官方证据"]],
    hardware: [[data.hardwareSignals.length, "硬件信号"], ["90", "默认天数"], [new Set(data.hardwareSignals.map(x => x.category)).size, "产品类型"]],
    technology: [[data.technologyProfiles.length, "已核验产品"], [new Set(data.technologyProfiles.map(x => x.route)).size, "技术路线"], [data.technologyProfiles.filter(x => x.formInnovation).length, "结构创新"]],
    intelligence: [[data.intelligenceEvents.length, "首批专利事件"], [data.intelligenceEntityCoverage.filter(x=>x.state==="found").length, "已覆盖主体"], [data.intelligenceEntityCoverage.length, "监控主体"]],
    apps: [[data.apps.length, "监控App"], [data.apps.filter(x => x.latestDate >= "2026-11-01").length, "本月有更新"], [data.apps.filter(x => String(x.updates12m).includes("25")).length, "高频更新"]],
    ai: [[data.aiHardwareProducts.length, "产品样本"], [4, "核心场景"], [3, "排除品类"]],
    sources: [[data.aiHardwareSources.length, "长期来源"], [3, "核验层级"], ["90天", "默认窗口"]],
    crowdfunding: [[data.crowdfundingProjects.length, "核验项目"], [data.crowdfundingProjects.filter(x => x.state === "live").length, "众筹中"], [data.crowdfundingProjects.filter(x => x.track === "打印科技").length, "打印科技"]]
  };
  return `<div class="page-metrics">${map[page].map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("")}</div>`;
}

function renderCurrentPage() {
  if (page === "overview") renderOverview();
  if (page === "trends") renderTrends();
  if (page === "products") renderProducts();
  if (page === "hardware") renderHardware();
  if (page === "technology") renderTechnology();
  if (page === "intelligence") renderIntelligence();
  if (page === "apps") renderApps();
  if (page === "ai") renderAI();
  if (page === "sources") renderSources();
  if (page === "crowdfunding") renderCrowdfunding();
}

function renderOverview() {
  content.innerHTML = `<div class="hotspot-panel"><div class="panel-title"><span><i></i>当前热点</span><small>${formatDate(data.asOf)} 数据截点</small></div><ol id="hotspotList"></ol></div><div class="toolbar"><div class="filter-groups"><div class="filters freshness-filters" id="freshnessFilters"></div><div class="filters" id="filters"></div></div><span class="quality-note">仅保留高价值且可核验资讯</span></div><div class="section-heading"><div><p class="eyebrow">LATEST SIGNALS</p><h2>竞品更新与功能信号</h2></div><p>原文、时间、解读与来源集中展示。</p></div><div class="signal-list" id="signalList"></div>`;
  renderHotspots();
  renderOverviewFilters();
  renderSignals();
}

function renderHotspots() {
  const items = [...data.signals.map(x => ({ ...x, category: productLabel(x.productType), date: x.firstPublishedAt })), ...data.hardwareSignals.map(x => ({ ...x, category: x.category, date: x.firstPublishedAt }))].sort((a,b) => b.date.localeCompare(a.date)).slice(0,5);
  document.querySelector("#hotspotList").innerHTML = items.map((x,i) => `<li><strong>${i+1}</strong><a href="${x.source}" target="_blank">${x.title}</a><span>${x.category}</span><time>${x.date.slice(5)}</time></li>`).join("");
}

function renderOverviewFilters() {
  const freshness = document.querySelector("#freshnessFilters");
  [{key:"latest",label:"最新 · 14天内"},{key:"recent",label:"近期 · 90天内"}].forEach(x => freshness.append(makeFilter(x.key,x.label,"freshness")));
  const filters = document.querySelector("#filters");
  data.filters.forEach(x => filters.append(makeFilter(x.key,x.label,"filter")));
}

function makeFilter(key, label, type) {
  const button = document.createElement("button");
  button.textContent = label;
  button.className = state[type] === key ? "selected" : "";
  button.onclick = () => { state[type] = key; button.parentElement.querySelectorAll("button").forEach(x => x.classList.toggle("selected", x === button)); renderSignals(); };
  return button;
}

function renderSignals() {
  const items = data.signals.map(x => ({...x,freshness:freshnessFor(x)})).filter(x => x.freshness.key !== "archive").filter(x => state.freshness === "recent" || x.freshness.key === "latest").filter(x => state.filter === "all" || x.productType === state.filter).filter(matchesQuery).sort((a,b)=>b.firstPublishedAt.localeCompare(a.firstPublishedAt));
  const root = document.querySelector("#signalList");
  root.innerHTML = items.length ? items.map((x,i) => `<article class="signal-card"><div class="signal-index">${String(i+1).padStart(2,"0")}</div><div class="signal-body"><div class="signal-meta"><span class="product-badge">${productLabel(x.productType)}</span><span class="freshness-badge">${x.freshness.label} · ${x.freshness.days}天</span><span>${x.app}</span><span class="verified">${x.verification}</span></div><h3>${x.title}</h3><div class="analysis-block"><strong>情报解读</strong><p>${x.summary}</p></div><div class="source-proof"><strong>官方原文摘录</strong><blockquote>${x.originalExcerpt}</blockquote><dl><div><dt>版本/事件</dt><dd>${x.version}</dd></div><div><dt>首次公开</dt><dd>${x.firstPublishedAt}</dd></div><div><dt>地区</dt><dd>${x.region}</dd></div><div><dt>核验</dt><dd>${x.checkedAt}</dd></div></dl></div><div class="tags">${x.tags.map(t=>`<span>${t}</span>`).join("")}</div><div class="signal-footer"><span>${x.company}</span><a href="${x.source}" target="_blank">${x.evidence} · 查看原文</a></div></div><div class="importance high">${x.importance}关注</div></article>`).join("") : emptyState();
}

function renderTrends() {
  content.innerHTML = `<div class="playbook-grid">${data.playbook.map((x,i) => { const evidence=x.evidenceIds.map(findEvidence).filter(Boolean); return `<section class="playbook-item"><span>${String(i+1).padStart(2,"0")}</span><h3>${x.title}</h3><p>${x.detail}</p><small>置信度 ${x.confidence} · ${evidence.length}条独立依据</small><div class="playbook-evidence">${evidence.map(e=>`<a href="${e.source}" target="_blank">${e.label}</a>`).join("")}</div></section>`; }).join("")}</div><div class="method-grid"><article class="method-card"><span>01</span><h3>证据门槛</h3><p>至少两条相互独立的官方或高可信来源，才进入趋势研判。</p></article><article class="method-card"><span>02</span><h3>时间窗口</h3><p>默认使用近90天信号；旧信息只有出现新交付或重大变化才重新进入。</p></article><article class="method-card"><span>03</span><h3>表达边界</h3><p>趋势结论明确标记为分析，不会伪装成品牌官方表述。</p></article></div>`;
}

function renderProducts() {
  content.innerHTML = `<section class="play-pattern-section standalone"><div class="section-heading"><div><p class="eyebrow">RECENT USER PLAY PATTERNS</p><h2>用户最近出现了哪些新玩法</h2></div><p>仅整理近90天官方更新或产品发布中明确出现的用户操作链路。</p></div><div class="play-pattern-grid">${recentPlayPatterns.map(playPatternCard).join("")}</div></section>`;
}

function playPatternCard(item) { const evidence=data.signals.find(x=>x.id===item.evidenceId); return `<article class="play-pattern-card"><div class="play-pattern-meta"><span>${item.scene}</span><time>${evidence.firstPublishedAt}</time></div><h3>${item.title}</h3><div class="play-flow">${item.flow.map((step,index)=>`<span>${step}${index<item.flow.length-1?"<i>→</i>":""}</span>`).join("")}</div><p>${item.why}</p><div class="play-pattern-source"><span>${evidence.app} · ${evidence.version}</span><a href="${evidence.source}" target="_blank">${evidence.evidence} · 查看原文</a></div></article>`; }

function trackCard(t) { const apps=appsFor(t), signals=signalsFor(t); return `<a class="product-track" href="#${t.key}"><div class="product-track-head"><span>${t.filter?"核心产品线":"硬件拓展"}</span><b>查看详情 ↓</b></div><h3>${t.label}</h3><p>${t.focus}</p><dl><div><dt>监控 App</dt><dd>${apps.length||"—"}</dd></div><div><dt>有效信号</dt><dd>${t.filter?signals.length:data.crowdfundingProjects.filter(x=>x.track==="打印科技").length}</dd></div></dl></a>`; }
function productDetail(t) { const apps=appsFor(t), signals=signalsFor(t); const latest=signals.sort((a,b)=>b.firstPublishedAt.localeCompare(a.firstPublishedAt))[0]; return `<article class="product-detail intelligence" id="${t.key}"><div class="product-identity"><p class="eyebrow">PRODUCT TRACK</p><h3>${t.label}</h3><p>${t.focus}</p><div class="product-detail-stats"><div><strong>${apps.length||"—"}</strong><span>监控App</span></div><div><strong>${t.filter?signals.length:data.hardwareSignals.length}</strong><span>有效信号</span></div></div></div><div><h4>主要竞品 / 监控对象</h4><ul>${(apps.length?apps.map(x=>x.name):["Kickstarter打印科技","品牌官方新品"]).map(x=>`<li>${x}</li>`).join("")}</ul><h4 class="detail-gap">重点能力维度</h4><ul>${t.watch.map(x=>`<li>${x}</li>`).join("")}</ul></div><div class="product-insight"><h4>当前产品判断</h4><p>${t.opportunity}</p><h4 class="detail-gap">最近有效信号</h4><p>${latest?`<a href="${latest.source}" target="_blank">${latest.title}</a><small>${latest.firstPublishedAt} · ${latest.app}</small>`:"当前缺少可核验的新功能信号，继续监控官方版本记录与硬件发布。"}</p></div></article>`; }

function renderHardware() { content.innerHTML = `<div class="hardware-grid">${data.hardwareSignals.filter(matchesQuery).map(x=>`<article class="hardware-card"><div class="hardware-meta"><span>${x.category}</span><time>${x.firstPublishedAt}</time></div><p class="hardware-brand">${x.brand} · ${x.product}</p><h3>${x.title}</h3><p>${x.keyChange}</p><blockquote>${x.originalExcerpt}</blockquote><div class="hardware-footer"><span>${x.region}</span><a href="${x.source}" target="_blank">${x.sourceLabel} · 查看原文</a></div></article>`).join("")}</div>`; }
function renderTechnology() {
  const routeOrder=["全部",...new Set(data.technologyProfiles.map(x=>x.route))];
  const items=data.technologyProfiles.filter(matchesQuery);
  content.innerHTML = `<div class="tech-route-strip">${routeOrder.map((route,index)=>`<span class="${index===0?"active":""}">${route}<b>${route==="全部"?items.length:items.filter(x=>x.route===route).length}</b></span>`).join("")}</div><div class="tech-table-wrap"><table class="tech-table"><thead><tr><th>产品 / 定位</th><th>技术路线</th><th>核心规格</th><th>介质与尺寸</th><th>结构创新</th><th>上市信息</th></tr></thead><tbody>${items.map(x=>`<tr><td><strong>${x.brand} ${x.product}</strong><span>${x.positioning}</span></td><td><em>${x.route}</em><span>${x.printMethod}</span></td><td>${specLines(x.specs)}</td><td>${specLines(x.media)}</td><td><span>${x.formInnovation||"未发现明确结构创新"}</span></td><td><span>${x.launch}</span><a href="${x.source}" target="_blank">${x.sourceLabel} →</a></td></tr>`).join("")}</tbody></table></div><div class="section-heading tech-gap"><div><p class="eyebrow">ROUTE SIGNALS</p><h2>当前技术路线判断</h2></div><p>结论只使用本页已核验样本，不外推为全行业定论。</p></div><div class="route-analysis-grid">${data.technologyRouteAnalysis.map(x=>`<article><span>${x.route}</span><h3>${x.title}</h3><p>${x.analysis}</p><small>依据：${x.evidence}</small></article>`).join("")}</div>`;
}
function specLines(value){return Object.entries(value).map(([key,val])=>`<span><b>${key}</b>${val||"未披露"}</span>`).join("");}
function renderIntelligence() {
  const events=data.intelligenceEvents.filter(matchesQuery).sort((a,b)=>b.publicationDate.localeCompare(a.publicationDate));
  content.innerHTML = `<div class="intelligence-status"><div><span>数据状态 · ${data.intelligenceCollection.stateLabel}</span><strong>${data.intelligenceCollection.label}</strong><p>${data.intelligenceCollection.note}</p></div><time>公开日时间窗 ${data.intelligenceCollection.window}</time></div><div class="entity-coverage"><div class="section-heading"><div><p class="eyebrow">ENTITY COVERAGE</p><h2>竞品主体覆盖进度</h2></div><p>“初筛未发现”不等于无专利，仍需CNIPA批量复核。</p></div><div class="entity-coverage-grid">${data.intelligenceEntityCoverage.map(x=>`<article><span class="coverage-state ${x.state}">${x.status}</span><h3>${x.brand}</h3><p>${x.entity}</p><small>${x.note}</small></article>`).join("")}</div></div>${events.length?`<div class="section-heading patent-heading"><div><p class="eyebrow">PATENT BACKFILL</p><h2>近三年首批高置信专利事件</h2></div><p>按专利族或独立外观设计入库，不把A/B文本重复计数。</p></div><div class="intelligence-event-list">${events.map(intelligenceEventCard).join("")}</div>`:""}<div class="section-heading tech-gap"><div><p class="eyebrow">MONITORING MAP</p><h2>三类监控入口与判断标准</h2></div><p>先发现线索，再回到官方数据库或企业披露核验。</p></div><div class="intelligence-source-grid">${data.intelligenceSources.map(x=>`<article><div class="source-type">${x.type}</div><h3>${x.name}</h3><p>${x.purpose}</p><dl><div><dt>重点检索</dt><dd>${x.queries.join(" · ")}</dd></div><div><dt>进入情报池</dt><dd>${x.acceptance}</dd></div></dl><div class="source-links">${x.links.map(link=>`<a href="${link.url}" target="_blank">${link.label} →</a>`).join("")}</div></article>`).join("")}</div><div class="section-heading tech-gap"><div><p class="eyebrow">WATCH QUEUE</p><h2>优先监控对象</h2></div><p>用于后续定期检索，不代表这些对象已发生新变化。</p></div><div class="watch-queue">${data.intelligenceWatchlist.map(x=>`<article><span>${x.group}</span><h3>${x.targets}</h3><p>${x.focus}</p></article>`).join("")}</div>`;
}
function intelligenceEventCard(x){return `<article class="patent-card"><div class="patent-card-head"><div><span>${x.type} · ${x.category}</span><h3>${x.title}</h3><p>${x.applicant}</p></div><time>${x.publicationDate}</time></div><div class="patent-facts"><div><b>公开/授权号</b><span>${x.identifier}</span></div><div><b>最早优先权</b><span>${x.priorityDate}</span></div><div><b>专利族</b><span>${x.family}</span></div><div><b>状态</b><span>${x.status}</span></div></div><div class="patent-analysis"><strong>产品情报解读</strong><p>${x.summary}</p></div><div class="patent-footer"><small>${x.verification}</small><a href="${x.source}" target="_blank">查看专利原文与著录信息 →</a></div></article>`;}
function renderApps() { const tabs=[{key:"all",label:"全部"},{key:"tattoo",label:"纹身"},{key:"a4",label:"A4"},{key:"mini",label:"Mini"},{key:"sticker",label:"贴纸"},{key:"image",label:"图片"}]; const items=data.apps.filter(x=>appMatchesTab(x,state.appFilter)).filter(matchesQuery); content.innerHTML = `<div class="module-tabs" id="appTabs">${tabs.map(x=>`<button class="${state.appFilter===x.key?"selected":""}" data-key="${x.key}">${x.label}<span>${data.apps.filter(app=>appMatchesTab(app,x.key)).length}</span></button>`).join("")}</div><div class="app-results-note">当前展示 <strong>${items.length}</strong> 个竞品 App；分类按照产品场景，可同时出现在多个栏目。</div><div class="app-grid">${items.map(x=>`<article class="app-card"><div class="app-card-heading"><span class="app-monogram">${x.name.replace(/[^A-Za-z\u4e00-\u9fa5]/g,"").slice(0,2)}</span><div><h3>${x.name}</h3><p>${x.category}</p><small>${x.company} · ${x.platform}</small></div><i></i></div><dl><div><dt>最新版本</dt><dd>${x.version}</dd></div><div><dt>发布日期</dt><dd>${x.latestDate}</dd></div><div><dt>近12月更新</dt><dd>${x.updates12m} 次</dd></div></dl><div class="app-notes"><strong>官方更新说明</strong><p>${x.latestNotes}</p></div><a class="app-source" href="${x.source}" target="_blank">打开官方商店记录 →</a></article>`).join("")}</div><section class="app-product-landscape"><div class="section-heading"><div><p class="eyebrow">PRODUCT LANDSCAPE</p><h2>各类型产品信息</h2></div><p>按产品类型查看监控对象、重点能力和有效信号。</p></div><div class="product-overview-grid">${productTracks.map(trackCard).join("")}</div><div class="section-heading product-detail-heading"><div><p class="eyebrow">PRODUCT INTELLIGENCE</p><h2>分产品线监控详情</h2></div><p>竞品对象、重点能力、当前判断与最近证据。</p></div><div class="product-detail-list">${productTracks.map(productDetail).join("")}</div></section>`; document.querySelectorAll("#appTabs button").forEach(button=>button.onclick=()=>{state.appFilter=button.dataset.key;renderApps();}); }
function renderAI() { content.innerHTML = `<div class="scope-strip"><span>办公</span><span>学习</span><span>玩具</span><span>平板</span><small>排除：AI眼镜 · AI耳机 · 安防</small></div><div class="ai-product-grid">${data.aiHardwareProducts.filter(matchesQuery).map(x=>`<article class="ai-product-card"><div class="ai-product-meta"><span>${x.scene} · ${x.category}</span><time>${x.firstPublishedAt}</time></div><p class="ai-product-name">${x.brand} · ${x.product}</p><span class="launch-status">${x.status}</span><h3>${x.title}</h3><p>${x.summary}</p><blockquote>${x.originalExcerpt}</blockquote><a href="${x.source}" target="_blank">${x.sourceLabel} · 查看原文 →</a></article>`).join("")}</div>`; }
function renderSources() { content.innerHTML = `<div class="source-grid">${data.aiHardwareSources.filter(matchesQuery).map(x=>`<article class="source-card"><span>${x.tier}</span><h4>${x.name}</h4><p>${x.focus}</p><small>${x.examples}</small><a href="${x.url}" target="_blank">打开网站 →</a></article>`).join("")}</div><div class="method-grid"><article class="method-card"><span>发现</span><h3>媒体与展会</h3><p>用于发现新品、创业项目、演示机和潜在线索。</p></article><article class="method-card"><span>核验</span><h3>品牌与官方页面</h3><p>核对首次发布时间、参数、上市地区和真实状态。</p></article><article class="method-card"><span>降级</span><h3>爆料与认证线索</h3><p>未经品牌确认的信息只作线索，不进入正式新品卡片。</p></article></div>`; }
function renderCrowdfunding() { const items=data.crowdfundingProjects.filter(matchesQuery); content.innerHTML = `<div class="crowdfunding-summary"><strong>${data.crowdfundingProjects.length}</strong><span>条已核验项目</span><strong>${data.crowdfundingProjects.filter(x=>x.state==="live").length}</strong><span>个众筹中</span><strong>${data.crowdfundingProjects.filter(x=>x.track==="打印科技").length}</strong><span>条打印科技</span><small>最近扫描：${data.crowdfundingObservedAt}</small></div><div class="crowdfunding-list">${items.map(x=>`<article class="crowdfunding-report"><div class="crowdfunding-report-head"><div><div class="crowdfunding-meta"><span>${x.track} · ${x.category}</span><time>${x.signalDate}</time></div><h3>${x.originalTitle}</h3><p>${x.brand} · ${x.product}</p></div><span class="crowdfunding-status ${x.state}">${x.status}</span></div><div class="crowdfunding-facts"><strong>官方项目内容</strong><ul>${x.officialDetails.map(detail=>`<li>${detail}</li>`).join("")}</ul><blockquote>${x.originalExcerpt}</blockquote></div><div class="crowdfunding-analysis"><section><strong>为什么值得关注</strong><p>${x.valueAnalysis}</p></section><section><strong>风险与待验证项</strong><p>${x.watchRisks}</p></section></div><div class="crowdfunding-footer"><small>${x.snapshot}</small><a href="${x.source}" target="_blank">打开Kickstarter项目原文 →</a></div></article>`).join("")}</div>`; }

function setupCommonEvents() {
  const input=document.querySelector("#searchInput");
  input.addEventListener("input",e=>{state.query=e.target.value.trim().toLowerCase();renderCurrentPage();});
  document.addEventListener("keydown",e=>{if(e.key==="/"&&document.activeElement!==input){e.preventDefault();input.focus();}});
  document.querySelector("#menuToggle").onclick=()=>document.querySelector("#sidebar").classList.toggle("open");
  document.querySelectorAll(".side-nav a").forEach(x=>x.onclick=()=>document.querySelector("#sidebar").classList.remove("open"));
}

function latestSignals(){return data.signals.filter(x=>ageInDays(x.firstPublishedAt)<=data.freshnessRules.latestDays);}
function appMatchesTab(app,key){if(key==="all")return true;const value=`${app.category} ${app.name}`.toLowerCase();const terms={tattoo:["纹身","tattoo"],a4:["a4"],mini:["mini"],sticker:["贴纸","标签","label"],image:["照片","图片","photo","打印切割"]}[key]||[];return terms.some(term=>value.includes(term));}
function appsFor(t){return data.apps.filter(x=>t.terms.some(term=>x.category.includes(term)));}
function signalsFor(t){return t.filter?data.signals.filter(x=>x.productType===t.filter):[];}
function matchesQuery(item){return !state.query||Object.values(item).join(" ").toLowerCase().includes(state.query);}
function ageInDays(date){return Math.floor((asOfDate-parseISODate(date))/86400000);}
function freshnessFor(x){const days=ageInDays(x.firstPublishedAt);if(days<=14)return{key:"latest",label:"最新",days};if(days<=90)return{key:"recent",label:"近期",days};return{key:"archive",label:"历史",days};}
function findEvidence(id){const s=data.signals.find(x=>x.id===id);if(s)return{label:s.app,source:s.source};const h=data.hardwareSignals.find(x=>x.id===id);return h?{label:`${h.brand} ${h.product}`,source:h.source}:null;}
function productLabel(key){return data.filters.find(x=>x.key===key)?.label||key;}
function parseISODate(value){return new Date(`${value}T00:00:00+08:00`);}
function formatDate(value){return new Intl.DateTimeFormat("zh-CN",{timeZone:"Asia/Shanghai",month:"long",day:"numeric"}).format(parseISODate(value));}
function emptyState(){return `<div class="empty-state">当前模块没有符合搜索条件的内容。</div>`;}
