// scripts/run_e2e.ts
import { chromium } from "playwright-core";
import http from "http";
import fs from "fs";
import path from "path";

const PORT = 4322;
const SERVER_ROOT = path.resolve(__dirname, "../");

// Simple static file server for the preview page
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
    };
  });
});

// Detect if the user wants a headed run (browser UI visible).
// CI environments will run in headless mode by default.
const args = process.argv.slice(2);
const isHeaded = args.includes("--headed");

(async () => {
  server.listen(PORT, async () => {
    console.log("================================================================");
    console.log(
      isHeaded
        ? "🚀 INICIANDO TESTES E2E EM BROWSER REAL - BROWSER VAI FICAR ABERTO"
        : "🚀 INICIANDO TESTES E2E EM BROWSER HEADLESS - BROWSER NÃO VAI FICAR ABERTO"
    );
    console.log("================================================================");
    console.log(`\n1. Servidor ativo em: http://localhost:${PORT}`);

    const browser = await chromium.launch({
      headless: !isHeaded,
      slowMo: isHeaded ? 1200 : undefined,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/calculadoras_preview.html`);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#quick-rx-btn", { timeout: 60000 });

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const typeInto = async (selector: string, text: string) => {
      await page.focus(selector);
      await page.fill(selector, "");
      for (const ch of text) {
        await page.type(selector, ch);
        await sleep(75);
      }
    };
    const click = async (selector: string) => {
      await page.waitForSelector(selector, { timeout: 60000 });
      await page.click(selector);
      await sleep(500);
    };

    // Step 1 – Reactance Inductive
    console.log("⚡ [TESTE 1/5] Reatância Indutiva");
    await click("#quick-rx-btn");
    await click("#rx-mode-ind");
    await typeInto("#rx-freq", "14.15");
    await typeInto("#rx-comp", "10");
    await click("#rx-calc-btn");
    await sleep(1500);

    // Step 2 – Reactance Capacitive
    console.log("⚡ [TESTE 2/5] Reatância Capacitiva");
    await click("#rx-mode-cap");
    await typeInto("#rx-freq", "7.1");
    await typeInto("#rx-comp", "100");
    await click("#rx-calc-btn");
    await sleep(1500);

    // Step 3 – Q Factor
    console.log("📊 [TESTE 3/5] Fator Q e Largura de Banda");
    await click("#quick-q-btn");
    await typeInto("#q-freq", "7.0");
    await typeInto("#q-bw", "140");
    await click("#q-calc-btn");
    await sleep(1500);

    // Step 4 – Wavelength & Antenna
    console.log("📡 [TESTE 4/5] Comprimento de Onda & Antenas");
    await click("#quick-wave-btn");
    await typeInto("#wave-freq", "14.150");
    await click("#wave-calc-btn");
    await sleep(1500);

    // Step 5 – Ohm's Law
    console.log("🔌 [TESTE 5/5] Lei de Ohm & Potência");
    await click("#quick-ohm-btn");
    await typeInto("#ohm-v", "12");
    await typeInto("#ohm-i", "0.5");
    await click("#ohm-calc-btn");
    await sleep(1500);

    console.log("================================================================");
    console.log(
      isHeaded
        ? "🎉 TESTES CONCLUÍDOS! O NAVEGADOR VAI PERMANECER ABERTO NO ECRÃ."
        : "✅ TESTES CONCLUÍDOS – EXECUTADO EM HEADLESS"
    );
    console.log("================================================================");

    if (isHeaded) {
      await new Promise(() => {});
    } else {
      await browser.close();
    }
    server.close();
  });
})();
