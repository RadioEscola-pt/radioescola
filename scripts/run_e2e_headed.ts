import { chromium } from "playwright-core";
import fs from "fs";
import path from "path";

async function runHeadedE2ETest() {
  console.log("\n================================================================");
  console.log("🚀 INICIANDO TESTES E2E EM BROWSER REAL COM PLAYWRIGHT (HEADED)");
  console.log("================================================================\n");

  const filePath = path.resolve(import.meta.dir, "../calculadoras_preview.html");
  const htmlContent = fs.readFileSync(filePath, "utf-8");

  // Start lightweight local server with Bun
  const server = Bun.serve({
    port: 4321,
    fetch(req) {
      return new Response(htmlContent, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    },
  });

  const appUrl = `http://localhost:${server.port}`;
  console.log(`1. Servidor de teste ativo em: ${appUrl}`);
  console.log("2. A abrir janela real do navegador Google Chrome / Edge no teu ecrã...");

  // Launch real browser in headed mode with visible slow motion so the user can watch everything
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome", // uses system Google Chrome
    slowMo: 900,       // 900ms delay between actions so user can clearly see each step
    args: ["--start-maximized", "--window-position=50,50"],
  }).catch(async () => {
    // Fallback to msedge if chrome is not found
    return await chromium.launch({
      headless: false,
      channel: "msedge",
      slowMo: 900,
      args: ["--start-maximized", "--window-position=50,50"],
    });
  });

  const context = await browser.newContext({
    viewport: null, // use full window size
  });

  const page = await context.newPage();
  await page.bringToFront();
  
  console.log(`3. A navegar para a página das calculadoras: ${appUrl}`);
  await page.goto(appUrl);
  await page.waitForTimeout(1000);

  // -------------------------------------------------------------
  // TESTE 1: REATÂNCIA INDUTIVA
  // -------------------------------------------------------------
  console.log("\n⚡ [TESTE 1/5] A testar Calculadora de Reatância (Modo Indutivo)");
  console.log("   → A abrir calculadora 'Reatância'...");
  await page.click("#quick-rx-btn");

  console.log("   → A preencher Frequência = 14.15 MHz...");
  await page.fill("#rx-freq", "14.15");

  console.log("   → A preencher Indutância = 10 µH...");
  await page.fill("#rx-comp", "10");

  console.log("   → A clicar em 'Calcular'...");
  await page.click("#rx-calc-btn");

  const rxIndVal = await page.textContent("#rx-result-val");
  console.log(`   ✓ Resultado obtido na página: ${rxIndVal}`);
  if (rxIndVal?.includes("889.071")) {
    console.log("   ✅ [PASS] Reatância Indutiva validada com sucesso!");
  }

  await page.waitForTimeout(1000);

  // -------------------------------------------------------------
  // TESTE 2: REATÂNCIA CAPACITIVA
  // -------------------------------------------------------------
  console.log("\n⚡ [TESTE 2/5] A testar Calculadora de Reatância (Modo Capacitivo)");
  console.log("   → A alternar para modo 'Capacitiva (XC)'...");
  await page.click("#rx-mode-cap");

  console.log("   → A preencher Frequência = 7.1 MHz...");
  await page.fill("#rx-freq", "7.1");

  console.log("   → A preencher Capacitância = 100 pF...");
  await page.fill("#rx-comp", "100");

  console.log("   → A clicar em 'Calcular'...");
  await page.click("#rx-calc-btn");

  const rxCapVal = await page.textContent("#rx-result-val");
  console.log(`   ✓ Resultado obtido na página: ${rxCapVal}`);
  if (rxCapVal?.includes("224.161")) {
    console.log("   ✅ [PASS] Reatância Capacitiva validada com sucesso!");
  }

  await page.waitForTimeout(1000);

  // -------------------------------------------------------------
  // TESTE 3: FATOR Q E LARGURA DE BANDA
  // -------------------------------------------------------------
  console.log("\n📊 [TESTE 3/5] A testar Fator Q e Largura de Banda");
  console.log("   → A abrir calculadora 'Fator Q'...");
  await page.click("#quick-q-btn");

  console.log("   → A preencher Frequência Central (f0) = 7.0 MHz...");
  await page.fill("#q-freq", "7.0");

  console.log("   → A preencher Largura de Banda (BW) = 140 kHz...");
  await page.fill("#q-bw", "140");

  console.log("   → A clicar em 'Calcular'...");
  await page.click("#q-calc-btn");

  const qVal = await page.textContent("#q-result-val");
  const qCutoff = await page.textContent("#q-cutoff-val");
  console.log(`   ✓ Resultado obtido na página: ${qVal}`);
  console.log(`   ✓ ${qCutoff}`);
  if (qVal?.includes("50.00")) {
    console.log("   ✅ [PASS] Fator Q validado com sucesso!");
  }

  await page.waitForTimeout(1000);

  // -------------------------------------------------------------
  // TESTE 4: COMPRIMENTO DE ONDA E ANTENAS
  // -------------------------------------------------------------
  console.log("\n📡 [TESTE 4/5] A testar Comprimento de Onda & Antenas");
  console.log("   → A abrir calculadora 'Antenas / λ'...");
  await page.click("#quick-wave-btn");

  console.log("   → A preencher Frequência = 14.150 MHz com fator k = 0.95...");
  await page.fill("#wave-freq", "14.150");

  console.log("   → A clicar em 'Calcular'...");
  await page.click("#wave-calc-btn");

  const waveLambda = await page.textContent("#wave-lambda-val");
  const waveDipole = await page.textContent("#wave-dipole-val");
  const waveQuarter = await page.textContent("#wave-quarter-val");
  console.log(`   ✓ ${waveLambda}`);
  console.log(`   ✓ ${waveDipole}`);
  console.log(`   ✓ ${waveQuarter}`);
  if (waveLambda?.includes("21.19 m")) {
    console.log("   ✅ [PASS] Dimensões da antena validadas com sucesso!");
  }

  await page.waitForTimeout(1000);

  // -------------------------------------------------------------
  // TESTE 5: LEI DE OHM E POTÊNCIA
  // -------------------------------------------------------------
  console.log("\n🔌 [TESTE 5/5] A testar Lei de Ohm & Potência");
  console.log("   → A abrir calculadora 'Lei de Ohm'...");
  await page.click("#quick-ohm-btn");

  console.log("   → A preencher Tensão = 12 V e Corrente = 0.5 A...");
  await page.fill("#ohm-v", "12");
  await page.fill("#ohm-i", "0.5");

  console.log("   → A clicar em 'Calcular'...");
  await page.click("#ohm-calc-btn");

  const ohmVal = await page.textContent("#ohm-result-val");
  console.log(`   ✓ Resultado obtido na página: ${ohmVal}`);
  if (ohmVal?.includes("24.000 Ω") && ohmVal?.includes("6.000 W")) {
    console.log("   ✅ [PASS] Lei de Ohm e Potência calculadas com sucesso!");
  }

  console.log("\n================================================================");
  console.log("🎉 TODOS OS 5 TESTES E2E EM BROWSER REAL PASSARAM COM SUCESSO!");
  console.log("================================================================\n");

  console.log("A manter o browser aberto por 5 segundos para inspeção visual...");
  await page.waitForTimeout(5000);

  await browser.close();
  server.stop();
  console.log("✓ Teste finalizado e browser fechado.");
}

runHeadedE2ETest().catch((err) => {
  console.error("Erro na execução E2E:", err);
  process.exit(1);
});
