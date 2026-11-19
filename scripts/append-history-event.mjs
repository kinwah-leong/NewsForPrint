import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npm run archive-event -- <event.json>");
  process.exitCode = 1;
} else {
  const absoluteInput = path.resolve(process.cwd(), inputPath);
  const input = JSON.parse(await readFile(absoluteInput, "utf8"));
  const events = Array.isArray(input) ? input : [input];
  const historyDir = path.join(process.cwd(), "data", "history");
  const historyPath = path.join(historyDir, "events.ndjson");
  await mkdir(historyDir, { recursive: true });

  for (const event of events) {
    validate(event);
    const now = new Date().toISOString();
    await appendFile(historyPath, `${JSON.stringify({ schemaVersion: 1, discoveredAt: now, checkedAt: now, status: "current", ...event })}\n`, "utf8");
  }
  console.log(`Archived ${events.length} event(s) to ${historyPath}`);
}

function validate(event) {
  for (const field of ["id", "module", "title"]) {
    if (!event?.[field]) throw new Error(`Missing required field: ${field}`);
  }
}
