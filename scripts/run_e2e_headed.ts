import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

async function runHeadedE2ETest() {
  console.log("\n================================================================");
  console.log("🚀 INICIANDO TESTES E2E EM BROWSER REAL - BROWSER VAI FICAR ABERTO");
  console.log("================================================================\n");

  const filePath = path.resolve(import.meta.dir, "../calculadoras_preview.html");
  const htmlContent = fs.readFileSync(filePath, "utf-8");

  // Start local server with Bun
  const server = Bun.serve({
    port: 4321,
    fetch(req) {
      return new Response(htmlContent, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  });

  const appUrl = `http://localhost:${server.port}`;
  console.log(`1. Servidor ativo em: ${appUrl}`);
  console.log("2. A abrir o Google Chrome / Edge no teu ecrã...");

  // Launch browser with generous slowMo so user sees every single keystroke and click
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    slowMo: 1200, // 1.2s per step so user clearly sees it
    args: ["--start-maximized", "--new-window"],
  }).catch(async () => {
    return await chromium.launch({
      headless: false,
      channel: "msedge",
      slowMo: 1200,
      args: ["--start-maximized", "--new-window"],
    });
  });

  const context = await browser.newContext({
    viewport: null,
  });

  const page = await context.newPage();
  await page.bringToFront();
  
  console.log(`3. A carregar aplicação: ${appUrl}`);
  await page.goto(appUrl);
  await page.waitForTimeout(1500);

  // -------------------------------------------------------------
  // TESTE 1: REATÂNCIA INDUTIVA
  // -------------------------------------------------------------
  console.log("\n⚡ [TESTE 1/5] Reatância Indutiva");
  console.log("   → A abrir calculadora 'Reatância'...");
  await page.click("#quick-rx-btn");
  await page.waitForTimeout(800);

  console.log("   → A digitar Frequência = 14.15 MHz...");
  await page.fill("#rx-freq", "14.15");

  console.log("   → A digitar Indutância = 10 µH...");
  await page.fill("#rx-comp", "10");

  console.log("   → A clicar no botão 'Calcular'...");
  await page.click("#rx-calc-btn");

  const rxIndVal = await page.textContent("#rx-result-val");
  console.log(`   ✓ Resultado na página: ${rxIndVal}`);
  await page.waitForTimeout(1500);

  // -------------------------------------------------------------
  // TESTE 2: REATÂNCIA CAPACITIVA
  // -------------------------------------------------------------
  console.log("\n⚡ [TESTE 2/5] Reatância Capacitiva");
  console.log("   → A mudar para modo 'Capacitiva (XC)'...");
  await page.click("#rx-mode-cap");

  console.log("   → A digitar Frequência = 7.1 MHz...");
  await page.fill("#rx-freq", "7.1");

  console.log("   → A digitar Capacitância = 100 pF...");
  await page.fill("#rx-comp", "100");

  console.log("   → A clicar em 'Calcular'...");
  await page.click("#rx-calc-btn");

  const rxCapVal = await page.textContent("#rx-result-val");
  console.log(`   ✓ Resultado na página: ${rxCapVal}`);
  await page.waitForTimeout(1500);

  // -------------------------------------------------------------
  // TESTE 3: FATOR Q E LARGURA DE BANDA
  // -------------------------------------------------------------
  console.log("\n📊 [TESTE 3/5] Fator Q e Largura de Banda");
  console.log("   → A abrir calculadora 'Fator Q'...");
  await page.click("#quick-q-btn");

  console.log("   → A digitar f0 = 7.0 MHz...");
  await page.fill("#q-freq", "7.0");

  console.log("   → A digitar BW = 140 kHz...");
  await page.fill("#q-bw", "140");

  console.log("   → A clicar em 'Calcular'...");
  await page.click("#q-calc-btn");

  const qVal = await page.textContent("#q-result-val");
  const qCutoff = await page.textContent("#q-cutoff-val");
  console.log(`   ✓ Resultado na página: ${qVal}`);
  console.log(`   ✓ ${qCutoff}`);
  await page.waitForTimeout(1500);

  // -------------------------------------------------------------
  // TESTE 4: COMPRIMENTO DE ONDA E ANTENAS
  // -------------------------------------------------------------
  console.log("\n📡 [TESTE 4/5] Comprimento de Onda & Antenas");
  console.log("   → A abrir calculadora 'Antenas / λ'...");
  await page.click("#quick-wave-btn");

  console.log("   → A digitar Frequência = 14.150 MHz...");
  await page.fill("#wave-freq", "14.150");

  console.log("   → A clicar em 'Calcular'...");
  await page.click("#wave-calc-btn");

  const waveLambda = await page.textContent("#wave-lambda-val");
  const waveDipole = await page.textContent("#wave-dipole-val");
  console.log(`   ✓ ${waveLambda}`);
  console.log(`   ✓ ${waveDipole}`);
  await page.waitForTimeout(1500);

  // -------------------------------------------------------------
  // TESTE 5: LEI DE OHM E POTÊNCIA
  // -------------------------------------------------------------
  console.log("\n🔌 [TESTE 5/5] Lei de Ohm & Potência");
  console.log("   → A abrir calculadora 'Lei de Ohm'...");
  await page.click("#quick-ohm-btn");

  console.log("   → A digitar Tensão = 12 V e Corrente = 0.5 A...");
  await page.fill("#ohm-v", "12");
  await page.fill("#ohm-i", "0.5");

  console.log("   → A clicar em 'Calcular'...");
  await page.click("#ohm-calc-btn");

  const ohmVal = await page.textContent("#ohm-result-val");
  console.log(`   ✓ Resultado na página: ${ohmVal}`);

  console.log("\n================================================================");
  console.log("🎉 TESTES CONCLUÍDOS! O NAVEGADOR VAI PERMANECER ABERTO NO ECRÃ.");
  console.log("================================================================\n");

  // Keep browser and server open permanently so user can view and interact
  await new Promise(() => {});
}

runHeadedE2ETest().catch((err) => {
  console.error("Erro na execução E2E:", err);
});
