"use client";
import React from 'react';

type ColorDef = {
  key: string;
  label: string;
  tailwind?: string; // bg-* class for the stripe
  hex?: string; // fallback for special colors
};

const digitColors: ColorDef[] = [
  { key: 'black', label: 'Black', tailwind: 'bg-black' },
  { key: 'brown', label: 'Brown', tailwind: 'bg-amber-900' },
  { key: 'red', label: 'Red', tailwind: 'bg-red-600' },
  { key: 'orange', label: 'Orange', tailwind: 'bg-orange-500' },
  { key: 'yellow', label: 'Yellow', tailwind: 'bg-yellow-400' },
  { key: 'green', label: 'Green', tailwind: 'bg-green-600' },
  { key: 'blue', label: 'Blue', tailwind: 'bg-blue-600' },
  { key: 'violet', label: 'Violet', tailwind: 'bg-violet-600' },
  { key: 'grey', label: 'Grey', tailwind: 'bg-gray-500' },
  { key: 'white', label: 'White', tailwind: 'bg-white' },
];

const multiplierColors: (ColorDef & { factor: number })[] = [
  { key: 'silver', label: 'Silver (×0.01)', factor: 0.01, hex: '#C0C0C0' },
  { key: 'gold', label: 'Gold (×0.1)', factor: 0.1, hex: '#D4AF37' },
  { key: 'black', label: 'Black (×1)', factor: 1, tailwind: 'bg-black' },
  { key: 'brown', label: 'Brown (×10)', factor: 10, tailwind: 'bg-amber-900' },
  { key: 'red', label: 'Red (×100)', factor: 100, tailwind: 'bg-red-600' },
  { key: 'orange', label: 'Orange (×1k)', factor: 1_000, tailwind: 'bg-orange-500' },
  { key: 'yellow', label: 'Yellow (×10k)', factor: 10_000, tailwind: 'bg-yellow-400' },
  { key: 'green', label: 'Green (×100k)', factor: 100_000, tailwind: 'bg-green-600' },
  { key: 'blue', label: 'Blue (×1M)', factor: 1_000_000, tailwind: 'bg-blue-600' },
  { key: 'violet', label: 'Violet (×10M)', factor: 10_000_000, tailwind: 'bg-violet-600' },
  { key: 'grey', label: 'Grey (×100M)', factor: 100_000_000, tailwind: 'bg-gray-500' },
  { key: 'white', label: 'White (×1G)', factor: 1_000_000_000, tailwind: 'bg-white' },
];

const toleranceColors: (ColorDef & { tol?: number })[] = [
  { key: 'none', label: 'None (±20%)', tol: 20 },
  { key: 'silver', label: 'Silver (±10%)', tol: 10, hex: '#C0C0C0' },
  { key: 'gold', label: 'Gold (±5%)', tol: 5, hex: '#D4AF37' },
  { key: 'brown', label: 'Brown (±1%)', tol: 1, tailwind: 'bg-amber-900' },
  { key: 'red', label: 'Red (±2%)', tol: 2, tailwind: 'bg-red-600' },
  { key: 'green', label: 'Green (±0.5%)', tol: 0.5, tailwind: 'bg-green-600' },
  { key: 'blue', label: 'Blue (±0.25%)', tol: 0.25, tailwind: 'bg-blue-600' },
  { key: 'violet', label: 'Violet (±0.1%)', tol: 0.1, tailwind: 'bg-violet-600' },
  { key: 'grey', label: 'Grey (±0.05%)', tol: 0.05, tailwind: 'bg-gray-500' },
];

const tempcoColors: (ColorDef & { ppm: number })[] = [
  { key: 'black', label: 'Black (250 ppm/K)', ppm: 250, tailwind: 'bg-black' },
  { key: 'brown', label: 'Brown (100 ppm/K)', ppm: 100, tailwind: 'bg-amber-900' },
  { key: 'red', label: 'Red (50 ppm/K)', ppm: 50, tailwind: 'bg-red-600' },
  { key: 'orange', label: 'Orange (15 ppm/K)', ppm: 15, tailwind: 'bg-orange-500' },
  { key: 'yellow', label: 'Yellow (25 ppm/K)', ppm: 25, tailwind: 'bg-yellow-400' },
  { key: 'blue', label: 'Blue (10 ppm/K)', ppm: 10, tailwind: 'bg-blue-600' },
  { key: 'violet', label: 'Violet (5 ppm/K)', ppm: 5, tailwind: 'bg-violet-600' },
];

const digitValue: Record<string, number> = {
  black: 0, brown: 1, red: 2, orange: 3, yellow: 4,
  green: 5, blue: 6, violet: 7, grey: 8, white: 9,
};

function getMultiplier(color: string): number {
  const m = multiplierColors.find((c) => c.key === color);
  return m ? m.factor : 1;
}

function getTolerance(color: string | undefined): number | undefined {
  if (!color) return undefined;
  const t = toleranceColors.find((c) => c.key === color);
  return t?.tol;
}

function getTempco(color: string | undefined): number | undefined {
  if (!color) return undefined;
  const t = tempcoColors.find((c) => c.key === color);
  return t?.ppm;
}

function formatOhms(value: number): string {
  const units = [
    { v: 1e9, s: 'GΩ' },
    { v: 1e6, s: 'MΩ' },
    { v: 1e3, s: 'kΩ' },
  ];
  for (const u of units) {
    if (value >= u.v) return `${(value / u.v).toFixed(value / u.v >= 100 ? 0 : value / u.v >= 10 ? 1 : 2)} ${u.s}`;
  }
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} Ω`;
}

function stripeClassOrStyle(color: string): { className?: string; style?: React.CSSProperties } {
  const all = [...digitColors, ...multiplierColors, ...toleranceColors, ...tempcoColors];
  const c = all.find((x) => x.key === color);
  if (!c) return { className: 'bg-gray-200' };
  if (c.tailwind) return { className: c.tailwind };
  if (c.hex) return { style: { backgroundColor: c.hex } };
  return { className: 'bg-gray-200' };
}

export default function ResistorCalculator() {
  const [bands, setBands] = React.useState<4 | 5 | 6>(4);
  const [b1, setB1] = React.useState('brown');
  const [b2, setB2] = React.useState('black');
  const [b3, setB3] = React.useState('black'); // used for 5/6 bands
  const [mult, setMult] = React.useState('red');
  const [tol, setTol] = React.useState('gold');
  const [tc, setTc] = React.useState('brown');

  // Compute value
  const digits = bands === 4 ? [b1, b2] : [b1, b2, b3];
  const sig = Number(digits.map((d, i) => String(Math.max(0, Math.min(9, digitValue[d] ?? 0)))).join(''));
  const value = sig * getMultiplier(mult);
  const tolerance = getTolerance(tol);
  const tempco = bands === 6 ? getTempco(tc) : undefined;

  const stripes = (
    bands === 4
      ? [b1, b2, mult, tol]
      : bands === 5
        ? [b1, b2, b3, mult, tol]
        : [b1, b2, b3, mult, tol, tc]
  );

  const firstDigitOptions = digitColors.filter((c) => c.key !== 'black');
  const otherDigitOptions = digitColors;

  return (
    <div className="rounded-xl border bg-white p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-3">Resistor Color Code Calculator</h3>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* Visual resistor */}
        <div className="flex-1">
          <div className="mx-auto my-4 h-16 w-full max-w-xl rounded-full bg-amber-200 relative shadow-inner">
            {/* leads */}
            <div className="absolute left-0 top-1/2 h-1 w-10 -translate-y-1/2 bg-gray-400" />
            <div className="absolute right-0 top-1/2 h-1 w-10 -translate-y-1/2 bg-gray-400" />
            {/* body */}
            <div className="absolute left-10 right-10 top-1/2 h-10 -translate-y-1/2 rounded-full bg-amber-300 shadow" />
            {/* stripes */}
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              {stripes.map((c, idx) => {
                const s = stripeClassOrStyle(c);
                return (
                  <div
                    key={idx}
                    className={`h-12 w-3 rounded ${s.className ?? ''}`}
                    style={s.style}
                    title={c}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-700">
            <div className="font-medium">Value</div>
            <div>{formatOhms(value)}{typeof tolerance === 'number' ? ` ±${tolerance}%` : ''}{typeof tempco === 'number' ? `, ${tempco} ppm/K` : ''}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full md:w-80">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bands</label>
            <div className="flex gap-2">
              {[4,5,6].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`px-3 py-1.5 rounded border text-sm ${bands===n? 'bg-indigo-600 text-white border-indigo-600':'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'}`}
                  onClick={() => setBands(n as 4|5|6)}
                >{n} bands</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Selector label={bands===4? 'Band 1':'Band 1'} value={b1} onChange={setB1} options={firstDigitOptions} />
            <Selector label={bands===4? 'Band 2':'Band 2'} value={b2} onChange={setB2} options={otherDigitOptions} />
            {bands > 4 && (
              <Selector label="Band 3" value={b3} onChange={setB3} options={otherDigitOptions} />
            )}
            <Selector label="Multiplier" value={mult} onChange={setMult} options={multiplierColors} />
            <Selector label="Tolerance" value={tol} onChange={setTol} options={toleranceColors} />
            {bands === 6 && (
              <Selector label="Tempco" value={tc} onChange={setTc} options={tempcoColors} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type AnyColor = ColorDef & { factor?: number; tol?: number; ppm?: number };

function Selector({ label, value, onChange, options }:{ label: string; value: string; onChange: (v: string)=>void; options: AnyColor[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select
          className="w-full appearance-none rounded border bg-white px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={value}
          onChange={(e)=>onChange(e.target.value)}
        >
          {options.map((o)=> (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
        {/* color swatch */}
        <div className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded border" style={swatchStyle(value)} />
      </div>
    </div>
  );
}

function swatchStyle(color: string): React.CSSProperties {
  const all = [...digitColors, ...multiplierColors, ...toleranceColors, ...tempcoColors];
  const c = all.find((x) => x.key === color);
  if (c?.hex) return { backgroundColor: c.hex };
  // Approximate tailwind class to hex via a map for stable swatch color
  const map: Record<string, string> = {
    'bg-black': '#000000',
    'bg-amber-900': '#78350f',
    'bg-red-600': '#dc2626',
    'bg-orange-500': '#f97316',
    'bg-yellow-400': '#facc15',
    'bg-green-600': '#16a34a',
    'bg-blue-600': '#2563eb',
    'bg-violet-600': '#7c3aed',
    'bg-gray-500': '#6b7280',
    'bg-white': '#ffffff',
  };
  const hex = map[(c?.tailwind ?? '')];
  return { backgroundColor: hex ?? '#e5e7eb' };
}

