const data = window.NEWS_TIME_DATA;
const state = { filter: "all", freshness: "latest", query: "" };
const $ = selector => document.querySelector(selector);

const filters = $("#filters");
const freshnessFilters = $("#freshnessFilters");
const signalList = $("#signalList");
const playbookList = $("#playbookList");
const appGrid = $("#appGrid");
const hardwareGrid = $("#hardwareGrid");
const aiProductGrid = $("#aiProductGrid");
const aiSourceGrid = $("#aiSourceGrid");
const searchInput = $("#searchInput");
const productOverviewGrid = $("#productOverviewGrid");
const asOfDate = parseISODate(data.asOf);

const productTracks = [
  { key: "thermal-tattoo", label: "纹身打印", focus: "转印纸适配、图像处理、滤镜、镜像与新机型接入", appTerms: ["纹身"], filter: "thermal-tattoo" },
  { key: "thermal-a4", label: "A4 热敏", focus: "文档排版、扫描增强、多尺寸纸张与家庭办公", appTerms: ["A4"], filter: "thermal-a4" },
  { key: "thermal-mini", label: "热敏 Mini", focus: "手账素材、错题、便签、社区内容与AI生成", appTerms: ["Mini", "热敏Mini"], filter: "thermal-mini" },
  { key: "photo", label: "照片与贴纸", focus: "热升华照片、姓名贴、证件照、打印切割与分享", appTerms: ["照片", "贴纸", "热升华"], filter: "photo" },
  { key: "image-editor", label: "图片编辑能力", focus: "去背景、画质增强、AI人像、模板与打印预检", appTerms: ["照片", "打印切割"], filter: "image-editor" },
  { key: "emerging-print", label: "创新打印硬件", focus: "喷墨、UV、激光、3D打印与桌面制作设备", appTerms: [], filter: null }
];

$("#todayLabel").textContent = `${formatDate(data.asOf)} 数据截点`;

for (const option of [
  { key: "latest", label: `最新 · ${data.freshnessRules.latestDays}天内` },
  { key: "recent", label: `近期 · ${data.freshnessRules.recentDays}天内` }
]) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = option.label;
  button.className = option.key === state.freshness ? "selected" : "";
  button.addEventListener("click", () => {
    state.freshness = option.key;
    freshnessFilters.querySelectorAll("button").forEach(item => item.classList.toggle("selected", item === button));
    renderSignals();
  });
  freshnessFilters.append(button);
}

for (const filter of data.filters) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.filter = filter.key;
  button.textContent = filter.label;
  button.className = filter.key === state.filter ? "selected" : "";
  button.addEventListener("click", () => selectProductFilter(filter.key));
  filters.append(button);
}

searchInput.addEventListener("input", event => {
  state.query = event.target.value.trim().toLowerCase();
  renderAllContent();
});

document.addEventListener("keydown", event => {
  if (event.key === "/" && document.activeElement !== searchInput) {
    event.preventDefault();
    searchInput.focus();
  }
});

$("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
document.querySelectorAll(".side-nav a").forEach(link => link.addEventListener("click", () => $("#sidebar").classList.remove("open")));

function selectProductFilter(key) {
  state.filter = key;
  filters.querySelectorAll("button").forEach(item => item.classList.toggle("selected", item.dataset.filter === key));
  renderSignals();
}

function renderHotspots() {
  const items = [
    ...data.signals.map(item => ({ title: item.title, date: item.firstPublishedAt, category: productLabel(item.productType), source: item.source })),
    ...data.hardwareSignals.map(item => ({ title: item.title, date: item.firstPublishedAt, category: item.category, source: item.source }))
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  $("#hotspotList").replaceChildren(...items.map((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${index + 1}</strong><a href="${item.source}" target="_blank" rel="noreferrer">${item.title}</a><span>${item.category}</span><time>${item.date.slice(5)}</time>`;
    return li;
  }));
}

function renderProductOverview() {
  productOverviewGrid.replaceChildren(...productTracks.map(track => {
    const signals = data.signals.filter(item => track.filter ? item.productType === track.filter : false);
    const apps = data.apps.filter(app => track.appTerms.some(term => app.category.includes(term)));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "product-track";
    button.innerHTML = `
      <div class="product-track-head"><span>${track.key === "emerging-print" ? "硬件拓展" : "核心产品线"}</span><b>查看资讯 →</b></div>
      <h3>${track.label}</h3><p>${track.focus}</p>
      <dl><div><dt>监控 App</dt><dd>${apps.length || "—"}</dd></div><div><dt>有效信号</dt><dd>${track.filter ? signals.length : data.crowdfundingProjects.filter(item => item.track === "打印科技").length}</dd></div></dl>`;
    button.addEventListener("click", () => {
      if (track.filter) {
        selectProductFilter(track.filter);
        location.hash = "updates";
      } else {
        location.hash = "crowdfunding";
      }
    });
    return button;
  }));
}

function renderSignals() {
  const signals = data.signals
    .map(signal => ({ ...signal, freshness: freshnessFor(signal) }))
    .filter(signal => signal.freshness.key !== "archive")
    .filter(signal => state.freshness === "recent" || signal.freshness.key === "latest")
    .filter(signal => {
      const matchesFilter = state.filter === "all" || signal.productType === state.filter;
      const haystack = [signal.app, signal.company, signal.title, signal.summary, signal.signalType, ...signal.tags].join(" ").toLowerCase();
      return matchesFilter && (!state.query || haystack.includes(state.query));
    })
    .sort((a, b) => b.firstPublishedAt.localeCompare(a.firstPublishedAt));

  signalList.replaceChildren(...signals.map((signal, index) => {
    const article = document.createElement("article");
    article.className = "signal-card";
    article.innerHTML = `
      <div class="signal-index">${String(index + 1).padStart(2, "0")}</div>
      <div class="signal-body">
        <div class="signal-meta"><span class="product-badge">${productLabel(signal.productType)}</span><span class="freshness-badge">${signal.freshness.label} · ${signal.freshness.days}天</span><span>${signal.app}</span><span class="verified">${signal.verification}</span></div>
        <h3>${signal.title}</h3>
        <div class="analysis-block"><strong>情报解读</strong><p>${signal.summary}</p></div>
        <div class="source-proof"><strong>官方原文摘录</strong><blockquote>${signal.originalExcerpt}</blockquote><dl><div><dt>版本/事件</dt><dd>${signal.version}</dd></div><div><dt>首次公开</dt><dd>${signal.firstPublishedAt}</dd></div><div><dt>地区</dt><dd>${signal.region}</dd></div><div><dt>核验</dt><dd>${signal.checkedAt}</dd></div></dl></div>
        <div class="tags">${signal.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
        <div class="signal-footer"><span>${signal.company}</span><a href="${signal.source}" target="_blank" rel="noreferrer">${signal.evidence} · 查看原文</a></div>
      </div><div class="importance ${signal.importance === "高" ? "high" : ""}">${signal.importance}关注</div>`;
    return article;
  }));
  $("#signalCount").textContent = String(signals.length);
  $("#navSignalCount").textContent = String(signals.length);
  $("#signalCountLabel").textContent = state.freshness === "latest" ? "14天内信号" : "90天内信号";
  $("#excludedCount").textContent = String(data.excludedActivity.length);
  if (!signals.length) signalList.innerHTML = `<div class="no-results"><strong>当前没有符合条件的高价值新情报</strong><span>系统不会用旧消息或常规修复填充结果。可调整产品类型、时间范围或搜索词。</span></div>`;
}

function renderPlaybook() {
  playbookList.replaceChildren(...data.playbook.map((item, index) => {
    const section = document.createElement("section");
    section.className = "playbook-item";
    const evidence = item.evidenceIds.map(id => findEvidence(id)).filter(Boolean);
    section.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><h3>${item.title}</h3><p>${item.detail}</p><small>置信度 ${item.confidence} · ${evidence.length}条独立依据</small><div class="playbook-evidence">${evidence.map(source => `<a href="${source.source}" target="_blank" rel="noreferrer">${source.label}</a>`).join("")}</div>`;
    return section;
  }));
}

function renderHardware() {
  const items = data.hardwareSignals.filter(item => matchesQuery(item));
  hardwareGrid.replaceChildren(...items.map(item => {
    const article = document.createElement("article");
    article.className = "hardware-card";
    article.innerHTML = `<div class="hardware-meta"><span>${item.category}</span><time>${item.firstPublishedAt}</time></div><p class="hardware-brand">${item.brand} · ${item.product}</p><h3>${item.title}</h3><p>${item.keyChange}</p><blockquote>${item.originalExcerpt}</blockquote><div class="hardware-footer"><span>${item.region}</span><a href="${item.source}" target="_blank" rel="noreferrer">${item.sourceLabel} · 查看原文</a></div>`;
    return article;
  }));
}

function renderAIHardware() {
  aiProductGrid.replaceChildren(...data.aiHardwareProducts.filter(item => matchesQuery(item)).map(item => {
    const article = document.createElement("article");
    article.className = "ai-product-card";
    article.innerHTML = `<div class="ai-product-meta"><span>${item.scene} · ${item.category}</span><time>${item.firstPublishedAt}</time></div><p class="ai-product-name">${item.brand} · ${item.product}</p><span class="launch-status">${item.status}</span><h3>${item.title}</h3><p>${item.summary}</p><blockquote>${item.originalExcerpt}</blockquote><a href="${item.source}" target="_blank" rel="noreferrer">${item.sourceLabel} · 查看原文 →</a>`;
    return article;
  }));
  aiSourceGrid.replaceChildren(...data.aiHardwareSources.map(item => {
    const article = document.createElement("article");
    article.className = "source-card";
    article.innerHTML = `<span>${item.tier}</span><h4>${item.name}</h4><p>${item.focus}</p><small>${item.examples}</small><a href="${item.url}" target="_blank" rel="noreferrer">打开网站 →</a>`;
    return article;
  }));
}

function renderCrowdfunding() {
  const items = data.crowdfundingProjects.filter(item => matchesQuery(item));
  const liveCount = data.crowdfundingProjects.filter(item => item.state === "live").length;
  const printCount = data.crowdfundingProjects.filter(item => item.track === "打印科技").length;
  $("#crowdfundingSummary").innerHTML = `<strong>${data.crowdfundingProjects.length}</strong><span>条已核验项目</span><strong>${liveCount}</strong><span>个众筹中</span><strong>${printCount}</strong><span>条打印科技</span><small>最近扫描：${data.crowdfundingObservedAt}</small>`;
  $("#crowdfundingGrid").replaceChildren(...items.map(item => {
    const article = document.createElement("article");
    article.className = "crowdfunding-card";
    article.innerHTML = `<div class="crowdfunding-meta"><span>${item.track} · ${item.category}</span><time>${item.signalDate}</time></div><p class="crowdfunding-name">${item.brand} · ${item.product}</p><span class="crowdfunding-status ${item.state}">${item.status}</span><h3>${item.title}</h3><p>${item.summary}</p><blockquote>${item.originalExcerpt}</blockquote><div class="crowdfunding-footer"><small>${item.snapshot}</small><a href="${item.source}" target="_blank" rel="noreferrer">项目原文 →</a></div>`;
    return article;
  }));
}

function renderApps() {
  const apps = data.apps.filter(app => matchesQuery(app));
  appGrid.replaceChildren(...apps.map(app => {
    const article = document.createElement("article");
    article.className = "app-card";
    article.innerHTML = `<div class="app-card-heading"><span class="app-monogram">${app.name.replace(/[^A-Za-z\u4e00-\u9fa5]/g, "").slice(0, 2)}</span><div><h3>${app.name}</h3><p>${app.category}</p><small>${app.company} · ${app.platform}</small></div><i title="正在监控"></i></div><dl><div><dt>最新版本</dt><dd>${app.version}</dd></div><div><dt>发布日期</dt><dd>${app.latestDate}</dd></div><div><dt>近12月更新</dt><dd>${app.updates12m} 次</dd></div></dl><div class="app-notes"><strong>官方更新说明</strong><p>${app.latestNotes}</p></div><a class="app-source" href="${app.source}" target="_blank" rel="noreferrer">打开官方商店记录 →</a>`;
    return article;
  }));
}

function setupSectionTracking() {
  const links = [...document.querySelectorAll(".side-nav a")];
  const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-15% 0px -70% 0px", threshold: [0, .1, .3] });
  sections.forEach(section => observer.observe(section));
}

function renderAllContent() {
  renderSignals();
  renderHardware();
  renderAIHardware();
  renderCrowdfunding();
  renderApps();
}

function matchesQuery(item) {
  return !state.query || Object.values(item).join(" ").toLowerCase().includes(state.query);
}
function ageInDays(dateString) { return Math.floor((asOfDate - parseISODate(dateString)) / 86400000); }
function freshnessFor(signal) {
  const days = ageInDays(signal.firstPublishedAt);
  if (days <= data.freshnessRules.latestDays) return { key: "latest", label: "最新", days };
  if (days <= data.freshnessRules.recentDays) return { key: "recent", label: "近期", days };
  return { key: "archive", label: "历史", days };
}
function findEvidence(id) {
  const software = data.signals.find(item => item.id === id);
  if (software) return { label: software.app, source: software.source };
  const hardware = data.hardwareSignals.find(item => item.id === id);
  return hardware ? { label: `${hardware.brand} ${hardware.product}`, source: hardware.source } : null;
}
function productLabel(key) { return data.filters.find(filter => filter.key === key)?.label ?? key; }
function parseISODate(value) { return new Date(`${value}T00:00:00+08:00`); }
function formatDate(value) { return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "long", day: "numeric" }).format(parseISODate(value)); }

renderHotspots();
renderProductOverview();
renderPlaybook();
renderAllContent();
setupSectionTracking();
