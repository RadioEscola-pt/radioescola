import type { FullResult, Reporter } from "@playwright/test/reporter";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Prints the screenshot output directory and file listing at the end of every
 * Playwright E2E run (both local and inside Docker).
 */
class ScreenshotDirectoryReporter implements Reporter {
  onEnd(_result: FullResult) {
    const relDir = join("test-results", "screenshots");
    const absDir = resolve(process.cwd(), relDir);

    if (!existsSync(absDir)) return;

    const files = readdirSync(absDir)
      .filter((f) => f.endsWith(".png"))
      .sort();

    if (files.length === 0) return;

    const inDocker = existsSync("/.dockerenv");
    console.log("\n======================================================================");
    console.log(`📸 E2E Screenshots gerados (${files.length} imagens)`);
    console.log(`📂 Diretório local: ./${relDir.replace(/\\/g, "/")}`);
    if (inDocker) {
      console.log(`🐳 Diretório no container: ${absDir}`);
      console.log(`💻 Diretório mapeado no host: ./test-results/screenshots/`);
    } else {
      console.log(`💻 Caminho absoluto: ${absDir}`);
    }
    console.log("----------------------------------------------------------------------");
    for (const file of files) {
      const sizeKb = Math.round(statSync(join(absDir, file)).size / 1024);
      console.log(`  • ${file} (${sizeKb} KB)`);
    }
    console.log("======================================================================\n");
  }
}

export default ScreenshotDirectoryReporter;
