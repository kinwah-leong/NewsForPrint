import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".ico", "image/x-icon"]
]);

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    if (requestUrl.pathname === "/") {
      response.writeHead(302, { location: "/web/" });
      response.end();
      return;
    }

    const relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
    let filePath = path.resolve(root, relativePath);
    if (!filePath.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) filePath = path.join(filePath, "index.html");
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": mimeTypes.get(path.extname(filePath)) ?? "application/octet-stream",
      "cache-control": "no-store"
    });
    response.end(body);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500, { "content-type": "text/plain; charset=utf-8" });
    response.end(error.code === "ENOENT" ? "Not found" : error.message);
  }
});

server.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "<本机局域网IP>" : host;
  console.log(`NewsTime dashboard: http://${displayHost}:${port}/web/`);
});
