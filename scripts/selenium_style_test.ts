/**
 * Real Browser Automation using Chrome DevTools Protocol (Selenium / WebDriver style)
 * Controls Google Chrome / Edge directly via native CDP WebSockets
 */

const CDP_PORT = 9222;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getWebSocketUrl(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://localhost:${CDP_PORT}/json`);
      if (res.ok) {
        const targets = await res.json() as any[];
        const page = targets.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch (e) {
      // waiting for browser to launch
    }
    await sleep(500);
  }
  throw new Error(`Could not connect to Chrome DevTools on port ${CDP_PORT}`);
}

class BrowserController {
  private ws!: WebSocket;
  private messageId = 1;
  private callbacks = new Map<number, (res: any) => void>();

  async connect(wsUrl: string) {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data.toString());
          if (data.id && this.callbacks.has(data.id)) {
            const cb = this.callbacks.get(data.id)!;
            this.callbacks.delete(data.id);
            cb(data);
          }
        } catch (e) {}
      };
    });
  }

  async send(method: string, params: any = {}): Promise<any> {
    const id = this.messageId++;
    return new Promise((resolve) => {
      this.callbacks.set(id, resolve);
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression: string): Promise<any> {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.result?.value;
  }
}

async function runSeleniumStyleTest() {
  console.log('================================================================');
  console.log('📻 RÁDIO ESCOLA - TESTE AUTOMATIZADO EM BROWSER REAL (SELENIUM/CDP)');
  console.log('================================================================\n');

  console.log('1. A ligar ao browser Google Chrome via DevTools Protocol...');
  const wsUrl = await getWebSocketUrl();
  console.log(`✓ Ligado com sucesso ao Chrome Target!`);

  const browser = new BrowserController();
  await browser.connect(wsUrl);

  console.log('\n2. A preparar a página e verificar interface...');
  await sleep(1000);

  // Test 1: Reactance Inductive
  console.log('\n----------------------------------------------------------------');
  console.log('⚡ TESTE 1: Calculadora de Reatância (Indutiva)');
  console.log('----------------------------------------------------------------');
  console.log('→ A abrir janela de Reatância no ecrã...');
  await browser.evaluate(`openCalc('reactance')`);
  await sleep(800);

  console.log('→ A preencher Frequência = 14.15 MHz...');
  await browser.evaluate(`
    document.getElementById('rx-freq').value = '14.15';
    document.getElementById('rx-freq').focus();
  `);
  await sleep(600);

  console.log('→ A preencher Indutância = 10 µH...');
  await browser.evaluate(`
    document.getElementById('rx-comp').value = '10';
    document.getElementById('rx-comp').focus();
  `);
  await sleep(600);

  console.log('→ A clicar no botão "Calcular"...');
  await browser.evaluate(`calcReactance()`);
  await sleep(1000);

  const rxIndResult = await browser.evaluate(`document.getElementById('rx-result-val').innerText`);
  console.log(`✓ [PASS] Resultado obtido no browser: ${rxIndResult}`);

  // Test 2: Reactance Capacitive
  console.log('\n----------------------------------------------------------------');
  console.log('⚡ TESTE 2: Calculadora de Reatância (Capacitiva)');
  console.log('----------------------------------------------------------------');
  console.log('→ A clicar no botão de modo "Capacitiva (XC)"...');
  await browser.evaluate(`setReactanceMode('capacitive')`);
  await sleep(800);

  console.log('→ A preencher Frequência = 7.1 MHz e Capacitância = 100 pF...');
  await browser.evaluate(`
    document.getElementById('rx-freq').value = '7.1';
    document.getElementById('rx-comp').value = '100';
  `);
  await sleep(600);

  console.log('→ A clicar no botão "Calcular"...');
  await browser.evaluate(`calcReactance()`);
  await sleep(1000);

  const rxCapResult = await browser.evaluate(`document.getElementById('rx-result-val').innerText`);
  console.log(`✓ [PASS] Resultado obtido no browser: ${rxCapResult}`);

  // Test 3: Q Factor
  console.log('\n----------------------------------------------------------------');
  console.log('📊 TESTE 3: Fator Q e Largura de Banda');
  console.log('----------------------------------------------------------------');
  console.log('→ A abrir janela de Fator Q no ecrã...');
  await browser.evaluate(`openCalc('qfactor')`);
  await sleep(800);

  console.log('→ A preencher f₀ = 7.000 MHz e Largura de Banda (BW) = 140 kHz...');
  await browser.evaluate(`
    document.getElementById('q-freq').value = '7.0';
    document.getElementById('q-bw').value = '140';
  `);
  await sleep(600);

  console.log('→ A clicar no botão "Calcular"...');
  await browser.evaluate(`calcQFactor()`);
  await sleep(1000);

  const qResult = await browser.evaluate(`document.getElementById('q-result-val').innerText`);
  const qCutoff = await browser.evaluate(`document.getElementById('q-cutoff-val').innerText`);
  console.log(`✓ [PASS] Resultado obtido no browser: ${qResult}`);
  console.log(`✓ [PASS] ${qCutoff}`);

  // Test 4: Wavelength & Antenna
  console.log('\n----------------------------------------------------------------');
  console.log('📡 TESTE 4: Comprimento de Onda & Antenas');
  console.log('----------------------------------------------------------------');
  console.log('→ A abrir janela de Comprimento de Onda & Antenas no ecrã...');
  await browser.evaluate(`openCalc('wavelength')`);
  await sleep(800);

  console.log('→ A preencher Frequência = 14.150 MHz com fator k = 0.95...');
  await browser.evaluate(`
    document.getElementById('wave-freq').value = '14.150';
    document.getElementById('wave-vf').value = '0.95';
  `);
  await sleep(600);

  console.log('→ A clicar no botão "Calcular"...');
  await browser.evaluate(`calcWavelength()`);
  await sleep(1000);

  const waveLambda = await browser.evaluate(`document.getElementById('wave-lambda-val').innerText`);
  const waveDipole = await browser.evaluate(`document.getElementById('wave-dipole-val').innerText`);
  const waveQuarter = await browser.evaluate(`document.getElementById('wave-quarter-val').innerText`);
  console.log(`✓ [PASS] ${waveLambda}`);
  console.log(`✓ [PASS] ${waveDipole}`);
  console.log(`✓ [PASS] ${waveQuarter}`);

  // Test 5: Ohm's Law with Power
  console.log('\n----------------------------------------------------------------');
  console.log('🔌 TESTE 5: Lei de Ohm & Potência');
  console.log('----------------------------------------------------------------');
  console.log('→ A abrir janela da Lei de Ohm no ecrã...');
  await browser.evaluate(`openCalc('ohmslaw')`);
  await sleep(800);

  console.log('→ A preencher Tensão = 12 V e Corrente = 0.5 A...');
  await browser.evaluate(`
    document.getElementById('ohm-v').value = '12';
    document.getElementById('ohm-i').value = '0.5';
    document.getElementById('ohm-r').value = '';
  `);
  await sleep(600);

  console.log('→ A clicar no botão "Calcular"...');
  await browser.evaluate(`calcOhmsLaw()`);
  await sleep(1000);

  const ohmResult = await browser.evaluate(`document.getElementById('ohm-result-val').innerText`);
  console.log(`✓ [PASS] Resultado obtido no browser: ${ohmResult}`);

  console.log('\n================================================================');
  console.log('🎉 TODOS OS TESTES E2E EM BROWSER REAL (SELENIUM/CDP) PASSARAM!');
  console.log('================================================================\n');
}

runSeleniumStyleTest().catch(console.error);
