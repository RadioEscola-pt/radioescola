# 📖 Guia de Testes End‑to‑End para Radio Escola

---

## 🎯 Objetivo
Este documento descreve, de forma detalhada e visualmente agradável, como **executar** e **entender** a suíte de testes E2E da aplicação Radio Escola. Ele cobre:
- Pré‑requisitos de ambiente
- Como usar o script `scripts/test.sh`
- O papel do `run_e2e.ts`
- Modos **headless** e **headed**
- Execução em CI (GitHub Actions, GitLab CI, etc.)
- Solução de problemas comuns

---

## 💻 Pré‑requisitos
| Ferramenta | Versão mínima | Como instalar |
|------------|---------------|----------------|
| **Node.js** (ou **Bun**) | `>=18` | Baixe de https://nodejs.org ou use o instalador do Bun. |
| **Playwright** | `^1.62.1` (já listado nas devDependencies) | `bun playwright install` ou `npm run playwright install` (o script já cuida disso). |
| **Git Bash** (para usar `./test.sh`) | — | Instalado com Git for Windows. |
| **PowerShell** (opcional) | — | Já vem com Windows. |

> **Dica premium:** Adicione o diretório `C:\Program Files\Git\usr\bin` ao seu `PATH` para chamar `bash` diretamente.

---

## 📂 Estrutura de arquivos
```
radioescola/
│
├─ scripts/
│   ├─ test.sh               # Orquestra os testes
│   ├─ run_e2e.ts            # Runner único (headless/headed)
│   └─ static_server.js      # Servidor estático usado internamente pelo runner
│
├─ docs/
│   └─ testing_guide.md      # <--- Este documento
│
└─ package.json               # Scripts npm/bun
```

---

## ⚙️ Como executar os testes
### 1️⃣ Pelo **Git Bash** (recomendado)
```bash
cd /c/Users/pc/radioescola/scripts   # ou simplesmente abra o terminal na raiz do projeto
./test.sh calculators headed   # modo UI (headed)
./test.sh calculators          # modo padrão (headless)
```
- **`calculators`** é apenas um rótulo informativo; o script aceita qualquer palavra.
- **`headed`** (ou `--headed`) abre o navegador para inspeção manual.

### 2️⃣ Pelo **PowerShell**
```powershell
& "C:\Program Files\Git\usr\bin\bash.exe" -c "./test.sh calculators headed"
```
O `-c` indica ao Bash que tudo após ele deve ser tratado como um comando Bash.

### 3️⃣ Via **npm** (funciona mesmo sem Bun no PATH)
```bash
npm run test:sh -- calculators headed
```
O `--` faz o npm passar os argumentos subsequentes diretamente ao script.

---

## 🏃‍♂️ O que acontece internamente?
1. **Detecção do runner** – O script escolhe **Bun** (ou o caminho padrão) e falha rapidamente se não estiver presente.
2. **Análise dos argumentos** – Converte `calculators headed` em `MODE="headed"` (ou `all`, `integration`, `unit`, `all-project`).
3. **Chamado ao runner** – Executa `bun run scripts/run_e2e.ts` (ou `npm run …`).
4. **`run_e2e.ts`**
   - Inicia um **servidor HTTP** simples que serve `calculadoras_preview.html`.
   - Detecta `--headed` e configura o Playwright:
     ```ts
     const browser = await chromium.launch({ headless: !isHeaded, slowMo: isHeaded ? 1200 : undefined })
     ```
   - Executa os cinco fluxos de teste (Indutivo, Capacitivo, Q‑Factor, Onda/Antena, Lei de Ohm).
   - Em modo **headless** fecha o browser ao final; em **headed** deixa o navegador aberto para inspeção (loop infinito).  
   - Sempre encerra o servidor ao terminar.
5. **Finalização** – O script `test.sh` exibe um resumo de sucesso.

---

## 📦 Integração contínua (CI)
- **Modo padrão** = *headless* → perfeito para pipelines automatizadas.
- **Variável de ambiente** `TEST_MODE` pode ser exportada para sobrescrever o modo:
  ```bash
  export TEST_MODE=headed   # para depuração em CI (não recomendado em produção)
  ./test.sh
  ```
- **Exemplo de GitHub Actions**
  ```yaml
  jobs:
    e2e:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Install Bun
          run: curl https://bun.sh/install | bash
        - name: Install deps
          run: bun install
        - name: Install Playwright browsers
          run: bun playwright install
        - name: Run tests (headless)
          run: ./scripts/test.sh calculators
  ```

---

## 🛠️ Solução de problemas
| Problema | Causa provável | Como resolver |
|----------|----------------|--------------|
| `node: command not found` | O script ainda tentava iniciar `static_server.js` via Node. | Remova a linha (já feita). |
| `bun: command not found` | Bun não está no `PATH`. | Instale Bun ou ajuste `RUNNER` para usar o caminho completo. |
| `chmod: command not found` (em Git Bash) | O terminal está usando PowerShell. | Use Git Bash ou prefira `npm run test:sh`. |
| Playwright falha ao encontrar `chrome.exe` | Browsers não instalados. | Rode `bun playwright install` (ou `npm run playwright install`). |
| O navegador abre e imediatamente fecha | O modo está em *headless*; use `headed` para ver a UI. |

---

## 📚 recursos adicionais
- **Tutorial passo‑a‑passo** para testes *headed*: [tutorial_headed_tests.md](file:///C:/Users/pc/.gemini/antigravity-ide/brain/3035da36-c4a7-47ed-9df5-c079f84814ed/docs/tutorial_headed_tests.md)
- **Playwright documentation**: https://playwright.dev/docs/intro
- **Bun documentation**: https://bun.sh/docs

---

## ✅ Checklist rápido antes de commitar
- [ ] `bun` ou `npm` está disponível (`bun -v` ou `npm -v`).
- [ ] Navegador Playwright instalado (`bun playwright install`).
- [ ] `scripts/run_e2e.ts` funciona sem erros (execute `bun run scripts/run_e2e.ts` primeiro). 
- [ ] `./test.sh` executa sem `node` ou `sleep` erros.
- [ ] Documentação revisada e links corretos.

---

*Este guia foi criado com foco em design premium: tipografia clara, seções bem demarcadas, emojis para visualização rápida e tabelas para fácil leitura.*
