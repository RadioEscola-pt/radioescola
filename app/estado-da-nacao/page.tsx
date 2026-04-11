"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronDown, ExternalLink } from "lucide-react";

const YEARS = ["2025", "2024", "2023"] as const;
type Year = (typeof YEARS)[number];

const YEAR_CHARTS: Record<Year, { src: string; alt: string }[]> = {
  "2025": [
    { src: "/images/edn/2025.png", alt: "Evolução mensal do número de radioamadores ativos por categoria em 2025" },
    { src: "/images/edn/suspensos_2025.png", alt: "Radioamadores com licença suspensa em 2025" },
    { src: "/images/edn/acores_2025.png", alt: "Radioamadores ativos na Região Autónoma dos Açores em 2025" },
    { src: "/images/edn/madeira_2025.png", alt: "Radioamadores ativos na Região Autónoma da Madeira em 2025" },
  ],
  "2024": [
    { src: "/images/edn/2024.png", alt: "Evolução mensal do número de radioamadores ativos por categoria em 2024" },
    { src: "/images/edn/continente.png", alt: "Radioamadores ativos em Portugal Continental em 2024" },
    { src: "/images/edn/acores.png", alt: "Radioamadores ativos na Região Autónoma dos Açores em 2024" },
    { src: "/images/edn/madeira.png", alt: "Radioamadores ativos na Região Autónoma da Madeira em 2024" },
  ],
  "2023": [],
};

const YEAR_IFRAMES: Record<Year, { src: string; title: string }[]> = {
  "2025": [
    {
      src: "https://docs.google.com/spreadsheets/d/e/2PACX-1vR3MNbYQr5WZwoflp08j5376UdnlMV-0Xgd-zotx5sq38YPT1TjFYKokdztWP4EsNHUNRgX_YRthIpC/pubhtml?gid=677334600&pid=explorer&a=v&chrome=false&embedded=true",
      title: "Totais e entradas/saídas por categoria",
    },
  ],
  "2024": [
    {
      src: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrVjXWCfTosvC6BZqLb5eSCTjOGmL5AaoVfnfAm-GcC_PC33k_BMzRxDYtoUCbt5VZjAi1s_kwJCDR/pubhtml?gid=677334600&pid=explorer&a=v&chrome=false&embedded=true",
      title: "Totais e entradas/saídas por categoria",
    },
    {
      src: "https://docs.google.com/spreadsheets/d/e/2PACX-1vREKf5ssUJP1xKJwbqQ--MOxEvW6y4J9tCGANIjp8uvERvTFW6__AExi2iTOzdcw6FSAZ9hVZxLqhP5/pubhtml?gid=677334600&pid=explorer&a=v&chrome=false&embedded=true",
      title: "Indicativos alterados por mês",
    },
    {
      src: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTHxTwssR7UFM_0Ke3OoeW1Vlg17NcVU2Fc-44WNFgNw6zagyiPkepFSgZEMmcWBwoQOy4jKYeHtxH5/pubhtml?gid=677334600&pid=explorer&a=v&chrome=false&embedded=true",
      title: "Distribuição por região (Continente, Açores, Madeira)",
    },
  ],
  "2023": [
    {
      src: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRQiPdGp3l1Zqhg7eKr8F13ON0OAQxNb57aSaMX9AwbHiIwyDpsWeAXkXr91YyrS4HlKzfDpvJyWn43/pubhtml?gid=677334600&pid=explorer&a=v&chrome=false&embedded=true",
      title: "Totais e entradas/saídas por categoria",
    },
    {
      src: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSOJjfsTtR3CC1RnQpqdWNGwh_Znjzg9nNWGf84O9Gdm8yGFxSuNiSwmLXvgohiLQpdkUy6yxuVrtZs/pubhtml?gid=677334600&pid=explorer&a=v&chrome=false&embedded=true",
      title: "Indicativos alterados por mês",
    },
    {
      src: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSoy2lFWo___AJW-EpN5M2MEs0dsaFI8kOIqg5UazWlrbFWPFIpJnx4mFvnbwxawFrxumrutnGGo5V2/pubhtml?gid=677334600&pid=explorer&a=v&chrome=false&embedded=true",
      title: "Distribuição por região (Continente, Açores, Madeira)",
    },
    {
      src: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs8lwT6H5FYgMchdMn4pVMc9ThHqy2sH2SHPVm3aXZT2rNOJaivpLx4hQghiQWVngBi76v-58xxbPF/pubhtml?gid=677334600&pid=explorer&a=v&chrome=false&embedded=true",
      title: "Resumo anual por categoria",
    },
  ],
};

function DataToggle({ children, label, id }: { children: React.ReactNode; label: string; id: string }) {
  const [open, setOpen] = useState(false);
  const panelId = `${id}-panel`;
  const triggerId = `${id}-trigger`;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <h3>
        <button
          id={triggerId}
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {label}
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </h3>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="border-t border-slate-200 dark:border-slate-700"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function EstadoDaNacaoPage() {
  const [activeYear, setActiveYear] = useState<Year>("2025");
  const tablistRef = useRef<HTMLDivElement>(null);

  const charts = YEAR_CHARTS[activeYear];
  const iframes = YEAR_IFRAMES[activeYear];

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = YEARS.indexOf(activeYear);
      let next: number | null = null;

      if (e.key === "ArrowRight") next = (idx + 1) % YEARS.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + YEARS.length) % YEARS.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = YEARS.length - 1;

      if (next !== null) {
        e.preventDefault();
        const year = YEARS[next];
        if (year) {
          setActiveYear(year);
          const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
          buttons?.[next]?.focus();
        }
      }
    },
    [activeYear],
  );

  return (
    <section className="py-8">
      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
        Radioamadores em Portugal
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Quantos radioamadores ativos existem, por categoria e região.
        Dados extraídos mensalmente da{" "}
        <a
          href="https://www.anacom.pt/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
        >
          ANACOM
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
        .
      </p>

      {/* Scope note */}
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
        Inclui estações individuais ativas em Portugal Continental, Açores e Madeira.
        Exclui indicativos adicionais (/1). A Rádio Escola não controla as entradas e saídas registadas pela ANACOM.
      </p>

      {/* Year tabs */}
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Ano"
        className="flex gap-1 mb-8 border-b border-slate-200 dark:border-slate-700"
        onKeyDown={handleTabKeyDown}
      >
        {YEARS.map((year) => {
          const isActive = activeYear === year;
          return (
            <button
              key={year}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${year}`}
              id={`tab-${year}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveYear(year)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {year}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeYear}`}
        aria-labelledby={`tab-${activeYear}`}
      >
        {/* Charts */}
        {charts.length > 0 ? (
          <div className="space-y-6 mb-8">
            {charts.map((chart) => (
              <div key={chart.src} className="rounded-lg overflow-hidden bg-white">
                <Image
                  src={chart.src}
                  alt={chart.alt}
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Não foram gerados gráficos para {activeYear}. Os dados completos estão nas tabelas abaixo.
          </p>
        )}

        {/* Spreadsheet data — collapsed */}
        {iframes.length > 0 && (
          <div className="space-y-3">
            {iframes.map((iframe, i) => (
              <DataToggle
                key={iframe.src}
                label={iframe.title}
                id={`data-${activeYear}-${i}`}
              >
                <iframe
                  src={iframe.src}
                  className="w-full border-0"
                  style={{ height: "500px" }}
                  title={iframe.title}
                  loading="lazy"
                />
              </DataToggle>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
