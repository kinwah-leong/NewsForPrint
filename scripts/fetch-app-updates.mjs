import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "config", "competitor-apps.json");
const dataDir = path.join(root, "data", "app-updates");
const reportDir = path.join(root, "reports");
const latestPath = path.join(dataDir, "latest.json");

const config = JSON.parse(await readFile(configPath, "utf8"));
const previous = await readJson(latestPath, { generatedAt: null, apps: {} });
const generatedAt = new Date().toISOString();
const current = { generatedAt, apps: {} };
const changes = [];
const failures = [];

for (const app of config.apps) {
  try {
    const url = new URL("https://itunes.apple.com/lookup");
    url.searchParams.set("id", app.ios.id);
    url.searchParams.set("country", app.ios.country);
    url.searchParams.set("entity", "software");

    const response = await fetch(url, {
      headers: { "user-agent": "NewsTime-App-Radar/0.1" },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    const result = payload.results?.[0];
    if (!result) throw new Error("App Store lookup returned no app");

    const snapshot = {
      key: app.key,
      name: result.trackName ?? app.name,
      configuredName: app.name,
      developer: result.sellerName ?? app.developer,
      productTypes: app.productTypes,
      models: app.models ?? [],
      priority: app.priority,
      iosAppId: app.ios.id,
      country: app.ios.country,
      bundleId: result.bundleId ?? null,
      version: result.version ?? null,
      releasedAt: result.currentVersionReleaseDate ?? null,
      releaseNotes: normalizeText(result.releaseNotes),
      description: normalizeText(result.description),
      appStoreUrl: result.trackViewUrl ?? null,
      artworkUrl: result.artworkUrl100 ?? null,
      minimumOsVersion: result.minimumOsVersion ?? null,
      rating: result.averageUserRating ?? null,
      ratingCount: result.userRatingCount ?? null,
      android: app.android
    };

    current.apps[app.key] = snapshot;
    const before = previous.apps?.[app.key];
    if (!before || hasChanged(before, snapshot)) {
      changes.push({ before: before ?? null, after: snapshot });
    }
  } catch (error) {
    if (previous.apps?.[app.key]) {
      current.apps[app.key] = previous.apps[app.key];
    }
    failures.push({ key: app.key, name: app.name, error: error.message });
  }
}

await mkdir(dataDir, { recursive: true });
await mkdir(reportDir, { recursive: true });
await writeFile(latestPath, `${JSON.stringify(current, null, 2)}\n`, "utf8");
await writeFile(
  path.join(dataDir, `${generatedAt.replaceAll(":", "-")}.json`),
  `${JSON.stringify({ generatedAt, changes, failures }, null, 2)}\n`,
  "utf8"
);
await writeFile(
  path.join(reportDir, "app-updates-latest.md"),
  renderReport({ generatedAt, changes, failures }),
  "utf8"
);

console.log(`Checked ${Object.keys(current.apps).length} apps.`);
console.log(`Detected ${changes.length} new or changed versions.`);
if (failures.length) console.log(`Failed ${failures.length} lookups; see the report.`);

function hasChanged(before, after) {
  return before.version !== after.version
    || before.releasedAt !== after.releasedAt
    || before.releaseNotes !== after.releaseNotes;
}

function normalizeText(value) {
  if (typeof value !== "string") return null;
  return value.replace(/\r\n/g, "\n").trim() || null;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

function renderReport({ generatedAt, changes, failures }) {
  const lines = [
    "# 竞品 App 更新雷达",
    "",
    `生成时间：${generatedAt}`,
    "",
    `本次发现 ${changes.length} 个首次收录或版本变化。`,
    ""
  ];

  for (const change of changes) {
    const app = change.after;
    lines.push(
      `## ${app.configuredName}`,
      "",
      `- 产品类型：${app.productTypes.join("、")}`,
      `- 版本：${app.version ?? "未知"}`,
      `- 发布时间：${app.releasedAt ?? "未知"}`,
      `- 上一版本：${change.before?.version ?? "首次收录"}`,
      `- 开发者：${app.developer}`,
      `- App Store：${app.appStoreUrl ?? "未返回"}`,
      "",
      "### 更新内容",
      "",
      app.releaseNotes ?? "商店未提供具体更新说明。",
      ""
    );
  }

  if (failures.length) {
    lines.push("## 抓取失败", "");
    for (const failure of failures) {
      lines.push(`- ${failure.name}：${failure.error}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}
