const data = window.NEWS_TIME_DATA;
const state = { filter: "all", freshness: "latest", query: "", liveApps: null };

const filters = document.querySelector("#filters");
const freshnessFilters = document.querySelector("#freshnessFilters");
const signalList = document.querySelector("#signalList");
const playbookList = document.querySelector("#playbookList");
const appGrid = document.querySelector("#appGrid");
const hardwareGrid = document.querySelector("#hardwareGrid");
const aiProductGrid = document.querySelector("#aiProductGrid");
const aiSourceGrid = document.querySelector("#aiSourceGrid");
const searchInput = document.querySelector("#searchInput");

const asOfDate = parseISODate(data.asOf);
document.querySelector("#todayLabel").textContent = `${formatDate(data.asOf)} 数据截点`;

for (const option of [
  { key: "latest", label: `最新 · ${data.freshnessRules.latestDays}天内` },
  { key: "recent", label: `近期趋势 · ${data.freshnessRules.recentDays}天内` }
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
  button.addEventListener("click", () => {
    state.filter = filter.key;
    filters.querySelectorAll("button").forEach(item => item.classList.toggle("selected", item === button));
    renderSignals();
  });
  filters.append(button);
}

searchInput.addEventListener("input", event => {
  state.query = event.target.value.trim().toLowerCase();
  renderSignals();
  renderApps();
});

function ageInDays(dateString) {
  return Math.floor((asOfDate - parseISODate(dateString)) / 86400000);
}

function freshnessFor(signal) {
  const days = ageInDays(signal.firstPublishedAt);
  if (days <= data.freshnessRules.latestDays) return { key: "latest", label: "最新", days };
  if (days <= data.freshnessRules.recentDays) return { key: "recent", label: "近期趋势", days };
  return { key: "archive", label: "历史档案", days };
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
        <div class="signal-meta">
          <span class="product-badge">${productLabel(signal.productType)}</span>
          <span class="freshness-badge ${signal.freshness.key}">${signal.freshness.label} · ${signal.freshness.days}天</span>
          <span>${signal.app}</span><span class="verified">${signal.verification}</span>
        </div>
        <h3>${signal.title}</h3>
        <div class="analysis-block"><strong>情报解读</strong><p>${signal.summary}</p></div>
        <div class="source-proof">
          <strong>官方原文摘录</strong>
          <blockquote>${signal.originalExcerpt}</blockquote>
          <dl>
            <div><dt>版本/事件</dt><dd>${signal.version}</dd></div>
            <div><dt>首次公开</dt><dd>${signal.firstPublishedAt}</dd></div>
            <div><dt>适用地区</dt><dd>${signal.region}</dd></div>
            <div><dt>最近核验</dt><dd>${signal.checkedAt}</dd></div>
          </dl>
        </div>
        <div class="tags">${signal.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
        <div class="signal-footer"><span>${signal.company}</span><a href="${signal.source}" target="_blank" rel="noreferrer">${signal.evidence} · 查看原文</a></div>
      </div>
      <div class="importance ${signal.importance === "高" ? "high" : ""}">${signal.importance}关注</div>`;
    return article;
  }));

  document.querySelector("#signalCount").textContent = String(signals.length);
  document.querySelector("#signalCountLabel").textContent = state.freshness === "latest" ? "条14天内高价值信号" : "条90天内高价值信号";
  document.querySelector("#excludedCount").textContent = String(data.excludedActivity.length);

  if (!signals.length) signalList.innerHTML = `<div class="no-results"><strong>当前没有符合条件的高价值新情报</strong><span>系统不会用旧消息或“修复已知问题”填充结果。可切换到“近期趋势 · 90天内”查看。</span></div>`;
}

function renderPlaybook() {
  playbookList.replaceChildren(...data.playbook.map((item, index) => {
    const section = document.createElement("section");
    section.className = "playbook-item";
    const evidence = item.evidenceIds.map(id => findEvidence(id)).filter(Boolean);
    section.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><h3>${item.title}</h3><p>${item.detail}</p><small>分析研判 · 置信度 ${item.confidence} · ${evidence.length}条独立依据</small><div class="playbook-evidence">${evidence.map(source => `<a href="${source.source}" target="_blank" rel="noreferrer">${source.label}</a>`).join("")}</div>`;
    return section;
  }));
}

function renderHardware() {
  hardwareGrid.replaceChildren(...data.hardwareSignals.map(item => {
    const article = document.createElement("article");
    article.className = "hardware-card";
    article.innerHTML = `
      <div class="hardware-meta"><span>${item.category}</span><time>${item.firstPublishedAt}</time></div>
      <p class="hardware-brand">${item.brand} · ${item.product}</p>
      <h3>${item.title}</h3>
      <p>${item.keyChange}</p>
      <blockquote>${item.originalExcerpt}</blockquote>
      <div class="hardware-footer"><span>${item.region}</span><a href="${item.source}" target="_blank" rel="noreferrer">${item.sourceLabel} · 查看原文</a></div>`;
    return article;
  }));
}

function renderAIHardware() {
  aiProductGrid.replaceChildren(...data.aiHardwareProducts.map(item => {
    const article = document.createElement("article");
    article.className = "ai-product-card";
    article.innerHTML = `
      <div class="ai-product-meta"><span>${item.scene} · ${item.category}</span><time>${item.firstPublishedAt}</time></div>
      <p class="ai-product-name">${item.brand} · ${item.product}</p>
      <span class="launch-status">${item.status}</span>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <blockquote>${item.originalExcerpt}</blockquote>
      <a href="${item.source}" target="_blank" rel="noreferrer">${item.sourceLabel} · 查看原文 →</a>`;
    return article;
  }));

  aiSourceGrid.replaceChildren(...data.aiHardwareSources.map(item => {
    const article = document.createElement("article");
    article.className = "source-card";
    article.innerHTML = `
      <span>${item.tier}</span>
      <h4>${item.name}</h4>
      <p>${item.focus}</p>
      <small>${item.examples}</small>
      <a href="${item.url}" target="_blank" rel="noreferrer">打开网站 →</a>`;
    return article;
  }));
}

function renderCrowdfunding() {
  const summary = document.querySelector("#crowdfundingSummary");
  const grid = document.querySelector("#crowdfundingGrid");
  const liveCount = data.crowdfundingProjects.filter(item => item.state === "live").length;
  const printCount = data.crowdfundingProjects.filter(item => item.track === "打印科技").length;
  summary.innerHTML = `<strong>${data.crowdfundingProjects.length}</strong><span>条已核验项目</span><strong>${liveCount}</strong><span>个众筹中</span><strong>${printCount}</strong><span>条打印科技</span><small>最近扫描：${data.crowdfundingObservedAt}</small>`;
  grid.replaceChildren(...data.crowdfundingProjects.map(item => {
    const article = document.createElement("article");
    article.className = "crowdfunding-card";
    article.innerHTML = `
      <div class="crowdfunding-meta"><span>${item.track} · ${item.category}</span><time>${item.signalDate}</time></div>
      <p class="crowdfunding-name">${item.brand} · ${item.product}</p>
      <span class="crowdfunding-status ${item.state}">${item.status}</span>
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <blockquote>${item.originalExcerpt}</blockquote>
      <div class="crowdfunding-footer"><small>${item.snapshot}</small><a href="${item.source}" target="_blank" rel="noreferrer">Kickstarter项目原文 →</a></div>`;
    return article;
  }));
}

function renderApps() {
  const apps = data.apps.filter(app => !state.query || Object.values(app).join(" ").toLowerCase().includes(state.query));
  appGrid.replaceChildren(...apps.map(app => {
    const article = document.createElement("article");
    article.className = "app-card";
    article.innerHTML = `
      <div class="app-card-heading"><span class="app-monogram">${app.name.replace(/[^A-Za-z\u4e00-\u9fa5]/g, "").slice(0, 2)}</span><div><h3>${app.name}</h3><p>${app.category}</p><small>${app.company} · ${app.platform}</small></div><i title="正在监控"></i></div>
      <dl><div><dt>最新版本</dt><dd>${app.version}</dd></div><div><dt>发布日期</dt><dd>${app.latestDate}</dd></div><div><dt>近12月更新</dt><dd>${app.updates12m} 次</dd></div></dl>
      <div class="app-notes"><strong>官方更新说明</strong><p>${app.latestNotes}</p></div>
      <a class="app-source" href="${app.source}" target="_blank" rel="noreferrer">打开官方商店记录 →</a>`;
    return article;
  }));
}

function findEvidence(id) {
  const software = data.signals.find(item => item.id === id);
  if (software) return { label: software.app, source: software.source };
  const hardware = data.hardwareSignals.find(item => item.id === id);
  if (hardware) return { label: `${hardware.brand} ${hardware.product}`, source: hardware.source };
  return null;
}

function productLabel(key) {
  return data.filters.find(filter => filter.key === key)?.label ?? key;
}

function parseISODate(value) {
  return new Date(`${value}T00:00:00+08:00`);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "long", day: "numeric" }).format(parseISODate(value));
}

async function loadLiveSnapshots() {
  try {
    const response = await fetch("/data/app-updates/latest.json", { cache: "no-store" });
    if (!response.ok) return;
    state.liveApps = await response.json();
  } catch {
    state.liveApps = null;
  }
}

renderSignals();
renderPlaybook();
renderHardware();
renderAIHardware();
renderCrowdfunding();
renderApps();
loadLiveSnapshots();
