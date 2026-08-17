"use client";
import { useEffect, useMemo, useRef, useState } from "react";

const label = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#7f9c86",
};

// Declared at module scope: defining it inside the parent would make React see
// a new component type on every frame of the sweep loop, remounting the range
// inputs 60 times a second and breaking the drag.
function Slider({ name, value, min, max, step = 1, onChange, unit = "" }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ ...label, display: "flex", justifyContent: "space-between" }}>
        <span>{name}</span>
        <span style={{ color: "#c8f5cf" }}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#5cf07a", marginTop: 6 }}
      />
    </label>
  );
}

// Interactive Lissajous scope — drop into MDX with:
//   import Lissajous from '@/components/Lissajous'
//   <Lissajous />
export default function Lissajous({
  initialA = 1,
  initialB = 2,
  initialPhase = 90,
  size = 360,
}) {
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);
  const [phase, setPhase] = useState(initialPhase);
  const [sweep, setSweep] = useState(true);
  const [t, setT] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!sweep) return;
    let last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((v) => (v + dt * 0.35) % 1);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [sweep]);

  const N = 600;
  const R = size / 2 - 32;
  const c = size / 2;
  const phi = (phase * Math.PI) / 180;

  const path = useMemo(() => {
    let d = "";
    for (let i = 0; i <= N; i++) {
      const u = (2 * Math.PI * i) / N;
      const x = c + R * Math.sin(a * u + phi);
      const y = c - R * Math.sin(b * u);
      d += (i ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d;
  }, [a, b, phi, R, c]);

  const u = 2 * Math.PI * t;
  const dot = {
    x: c + R * Math.sin(a * u + phi),
    y: c - R * Math.sin(b * u),
  };

  const gcd = (p, q) => (q ? gcd(q, p % q) : p);
  const g = gcd(a, b);
  const ratio = `${a / g}:${b / g}`;
  const shape =
    a === b
      ? phase % 180 === 0
        ? "linha reta"
        : phase % 180 === 90
        ? "círculo"
        : "elipse"
      : "curva de Lissajous";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `minmax(0, ${size}px) minmax(200px, 1fr)`,
        gap: 24,
        padding: 20,
        borderRadius: 14,
        background: "#14181a",
        color: "#c8f5cf",
        maxWidth: 720,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* CRT */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        style={{
          borderRadius: 12,
          background: "#0b1a10",
          boxShadow: "inset 0 0 40px #041007",
          display: "block",
        }}
      >
        <g stroke="#1e3a26" strokeWidth="1">
          {[...Array(9)].map((_, i) => {
            const p = 16 + (i * (size - 32)) / 8;
            return (
              <g key={i}>
                <line x1={p} y1={16} x2={p} y2={size - 16} />
                <line x1={16} y1={p} x2={size - 16} y2={p} />
              </g>
            );
          })}
        </g>
        <line x1={c} y1={16} x2={c} y2={size - 16} stroke="#2c5236" strokeWidth="1.2" />
        <line x1={16} y1={c} x2={size - 16} y2={c} stroke="#2c5236" strokeWidth="1.2" />
        <path d={path} fill="none" stroke="#5cf07a" strokeWidth="6" opacity="0.18" strokeLinejoin="round" />
        <path d={path} fill="none" stroke="#5cf07a" strokeWidth="1.8" strokeLinejoin="round" />
        {sweep && (
          <>
            <circle cx={dot.x} cy={dot.y} r="7" fill="#5cf07a" opacity="0.25" />
            <circle cx={dot.x} cy={dot.y} r="3" fill="#e9ffee" />
          </>
        )}
      </svg>

      {/* Front panel */}
      <div>
        <div style={{ ...label, fontSize: 12, marginBottom: 18, color: "#c8f5cf" }}>
          Modo XY · fx:fy = {ratio} · {shape}
        </div>
        <Slider name="Frequência X (fx)" value={a} min={1} max={7} onChange={setA} />
        <Slider name="Frequência Y (fy)" value={b} min={1} max={7} onChange={setB} />
        <Slider name="Desfasamento φ" value={phase} min={0} max={180} step={5} onChange={setPhase} unit="°" />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          {[
            ["1:1 0°", 1, 1, 0],
            ["1:1 90°", 1, 1, 90],
            ["1:2", 1, 2, 90],
            ["2:3", 2, 3, 0],
            ["3:4", 3, 4, 90],
          ].map(([n, x, y, p]) => (
            <button
              key={n}
              onClick={() => {
                setA(x);
                setB(y);
                setPhase(p);
              }}
              style={{
                ...label,
                color: "#c8f5cf",
                background: "#1c2a20",
                border: "1px solid #2c5236",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setSweep((s) => !s)}
            style={{
              ...label,
              color: "#0b1a10",
              background: sweep ? "#5cf07a" : "#7f9c86",
              border: "none",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {sweep ? "Feixe: ligado" : "Feixe: parado"}
          </button>
        </div>

        <p style={{ fontSize: 12, lineHeight: 1.6, color: "#7f9c86", marginTop: 18 }}>
          x = sin(fx·t + φ), y = sin(fy·t). Conta os toques nos bordos horizontal e
          vertical para ler a razão de frequências; para 1:1 a forma revela a fase.
        </p>
      </div>
    </div>
  );
}
