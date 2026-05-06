/**
 * PROBLEM 5 — Real-Time Metrics Dashboard
 * ─────────────────────────────────────────────────────────────
 * Asked at: ServiceNow, Datadog, New Relic, Intuit
 *
 * Requirements:
 * - Live updating metrics (CPU, Memory, Requests, Errors)
 * - Sparkline chart per metric (SVG, no library)
 * - Pause/resume live updates
 * - Alert when metric exceeds threshold
 * - Time window selector (last 30s / 60s / 120s)
 */

import { useState, useEffect, useRef, useCallback } from "react";

const METRICS = [
  { key: "cpu",      label: "CPU Usage",    unit: "%",   max: 100, threshold: 80, color: "#a78bfa" },
  { key: "memory",   label: "Memory",       unit: "%",   max: 100, threshold: 85, color: "#22d3ee" },
  { key: "requests", label: "Req/sec",      unit: "rps", max: 500, threshold: 400, color: "#10b981" },
  { key: "errors",   label: "Error Rate",   unit: "%",   max: 20,  threshold: 5,  color: "#ef4444" },
];

function generateValue(key, prev) {
  const base = { cpu: 45, memory: 60, requests: 200, errors: 2 };
  const noise = { cpu: 15, memory: 8, requests: 80, errors: 3 };
  const b = prev ?? base[key];
  return Math.max(0, Math.min(
    key === "errors" ? 20 : key === "requests" ? 500 : 100,
    b + (Math.random() - 0.5) * noise[key]
  ));
}

// SVG sparkline
function Sparkline({ data, color, max, width = 200, height = 50 }) {
  if (data.length < 2) return null;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  });
  const area = `M${pts[0]} L${pts.join(" L")} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`g-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color.replace("#","")})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function RealTimeDashboard() {
  const [history, setHistory] = useState(
    Object.fromEntries(METRICS.map(m => [m.key, [generateValue(m.key, null)]]))
  );
  const [paused,  setPaused]  = useState(false);
  const [window_, setWindow_] = useState(30); // seconds shown
  const [alerts,  setAlerts]  = useState([]);
  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    setHistory(prev => {
      const next = {};
      const newAlerts = [];
      METRICS.forEach(m => {
        const last = prev[m.key].at(-1);
        const val  = generateValue(m.key, last);
        next[m.key] = [...prev[m.key], val].slice(-120); // keep 120 ticks max
        if (val > m.threshold) newAlerts.push(`⚠ ${m.label} at ${val.toFixed(1)}${m.unit} (threshold: ${m.threshold})`);
      });
      if (newAlerts.length) setAlerts(a => [...newAlerts, ...a].slice(0, 5));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!paused) intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [paused, tick]);

  const current = Object.fromEntries(
    METRICS.map(m => [m.key, history[m.key].at(-1) ?? 0])
  );

  const windowedHistory = Object.fromEntries(
    METRICS.map(m => [m.key, history[m.key].slice(-window_)])
  );

  return (
    <div className="card">
      <h2 className="card-title">📊 Real-Time Metrics Dashboard</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at ServiceNow, Datadog, Intuit.</strong> Live metrics with SVG sparklines,
        threshold alerts, pause/resume, and time window selector. No charting library.
      </p>

      {/* Controls */}
      <div style={{ display: "flex", gap: "var(--s3)", marginBottom: "var(--s5)", flexWrap: "wrap", alignItems: "center" }}>
        <button className={`btn btn-sm ${paused ? "btn-success" : "btn-danger"}`}
          onClick={() => setPaused(p => !p)}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
        <div style={{ display: "flex", gap: "var(--s1)" }}>
          {[30, 60, 120].map(w => (
            <button key={w} className={`btn btn-sm ${window_ === w ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setWindow_(w)}>
              {w}s
            </button>
          ))}
        </div>
        {!paused && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)",
            color: "var(--t2)", fontSize: "var(--xs)" }}>
            <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
            Live
          </div>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: "var(--s5)", display: "flex", flexDirection: "column", gap: "var(--s1)" }}>
          {alerts.slice(0, 3).map((a, i) => (
            <div key={i} style={{ background: "var(--err-bg)", border: "1px solid rgba(239,68,68,.3)",
              borderRadius: "var(--r1)", padding: "6px 12px", fontSize: "var(--xs)", color: "var(--err)" }}>
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--s4)" }}>
        {METRICS.map(m => {
          const val = current[m.key];
          const isAlert = val > m.threshold;
          return (
            <div key={m.key} style={{
              background: "var(--glass2)",
              border: `1px solid ${isAlert ? "rgba(239,68,68,.4)" : "var(--gb)"}`,
              borderRadius: "var(--r2)", padding: "var(--s4)",
              transition: "border-color var(--tr)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--s2)" }}>
                <span style={{ fontSize: "var(--xs)", fontWeight: 700, color: "var(--t3)",
                  textTransform: "uppercase", letterSpacing: ".08em" }}>
                  {m.label}
                </span>
                {isAlert && <span className="badge badge-err">Alert</span>}
              </div>
              <div style={{ fontSize: "var(--2xl)", fontWeight: 800, color: m.color, marginBottom: "var(--s3)" }}>
                {val.toFixed(1)}<span style={{ fontSize: "var(--sm)", color: "var(--t3)", marginLeft: 4 }}>{m.unit}</span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 4, background: "var(--gb)", borderRadius: 2, marginBottom: "var(--s3)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${(val / m.max) * 100}%`,
                  background: isAlert ? "var(--err)" : m.color,
                  transition: "width .5s ease"
                }} />
              </div>
              <Sparkline data={windowedHistory[m.key]} color={m.color} max={m.max} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
