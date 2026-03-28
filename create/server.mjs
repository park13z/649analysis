import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const webRoot = path.join(root, "create");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".csv": "text/csv", ".png": "image/png", ".jpg": "image/jpeg" };

const send = (res, code, body, type = "text/plain") => { res.writeHead(code, { "Content-Type": type }); res.end(body); };

const runUpdate = () => new Promise((resolve, reject) => {
  const p = spawn("node", ["create/fetch_welovelotto_history.mjs"], { cwd: root });
  let out = "";
  p.stdout.on("data", (d) => { out += d.toString(); });
  p.stderr.on("data", (d) => { out += d.toString(); });
  p.on("close", (c) => (c === 0 ? resolve(out.trim()) : reject(new Error(out.trim()))));
});

http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/update-history") {
    try {
      const log = await runUpdate();
      return send(res, 200, JSON.stringify({ ok: true, log }), "application/json");
    } catch (e) {
      return send(res, 500, JSON.stringify({ ok: false, error: e.message }), "application/json");
    }
  }
  const reqPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = path.join(webRoot, reqPath);
  if (!filePath.startsWith(webRoot)) return send(res, 403, "forbidden");
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, mime[ext] || "application/octet-stream");
  } catch {
    send(res, 404, "not found");
  }
}).listen(5173, () => console.log("Open http://localhost:5173"));
