// scripts/run_e2e_headless.ts
import { chromium } from "playwright-core";
import http from "http";
import fs from "fs";
import path from "path";

const PORT = 4322;
const SERVER_ROOT = path.resolve(__dirname, "../");
const server = http.createServer((req, res) => {
  let filePath = path.join(SERVER_ROOT, req.url ?? "");
  if (filePath.endsWith("/")) filePath += "calculadoras_preview.html";
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
      }[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": mime });
      res.end(content);
    }
  });
});

(async () => {
  server.listen(PORT, async () => {
    console.log("================================================================");
    console.log("🚀 INICIANDO TESTES E2E EM BROWSER HEADLESS - BROWSER NÃO VAI FICAR ABERTO");
    console.log("================================================================");
    console.log(`\n1. Servidor ativo em: http://localhost:${PORT}`);
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/calculadoras_preview.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#quick-rx-btn', { timeout: 60000 });
    // The page's script auto‑runs visual tests on load.
    // Wait sufficient time for all steps to finish (30 s).
    await new Promise(r => setTimeout(r, 30000));
    await browser.close();
    server.close();
  });
})();
