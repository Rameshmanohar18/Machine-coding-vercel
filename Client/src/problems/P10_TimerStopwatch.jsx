/**
 * PROBLEM 10 — Timer + Stopwatch + Countdown
 * ─────────────────────────────────────────────────────────────
 * Asked at: Google, Amazon, Razorpay
 *
 * Requirements:
 * - Stopwatch: start/pause/reset, lap times
 * - Countdown timer: set duration, start/pause/reset, alert on finish
 * - Accurate timing using Date.now() (not setInterval drift)
 * - Lap history with fastest/slowest highlighted
 */

import { useState, useEffect, useRef, useCallback } from "react";

function formatTime(ms) {
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(cs).padStart(2,"0")}`;
}

// ── Stopwatch ────────────────────────────────────────────────
function Stopwatch() {
  const [elapsed,  setElapsed]  = useState(0);
  const [running,  setRunning]  = useState(false);
  const [laps,     setLaps]     = useState([]);
  const startRef = useRef(null);
  const rafRef   = useRef(null);
  const baseRef  = useRef(0); // accumulated time before last pause

  const tick = useCallback(() => {
    setElapsed(baseRef.current + (Date.now() - startRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = () => {
    startRef.current = Date.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  };

  const pause = () => {
    cancelAnimationFrame(rafRef.current);
    baseRef.current += Date.now() - startRef.current;
    setRunning(false);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false); setElapsed(0); setLaps([]);
    baseRef.current = 0;
  };

  const lap = () => setLaps(l => [...l, elapsed]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const minLap = laps.length > 1 ? Math.min(...laps.map((l,i) => i === 0 ? l : l - laps[i-1])) : null;
  const maxLap = laps.length > 1 ? Math.max(...laps.map((l,i) => i === 0 ? l : l - laps[i-1])) : null;

  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <div className="label" style={{ marginBottom: "var(--s4)" }}>⏱ Stopwatch</div>

      <div style={{ textAlign: "center", marginBottom: "var(--s5)" }}>
        <div style={{ fontSize: 48, fontWeight: 800, fontFamily: "var(--mono)",
          color: running ? "var(--ok)" : "var(--t1)", letterSpacing: 2 }}>
          {formatTime(elapsed)}
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--s2)", justifyContent: "center", marginBottom: "var(--s5)" }}>
        {!running
          ? <button className="btn btn-success" onClick={start}>▶ Start</button>
          : <button className="btn btn-warn"    onClick={pause}>⏸ Pause</button>
        }
        <button className="btn btn-ghost" onClick={lap} disabled={!running}>🏁 Lap</button>
        <button className="btn btn-danger btn-sm" onClick={reset}>↺</button>
      </div>

      {laps.length > 0 && (
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {[...laps].reverse().map((lapTime, ri) => {
            const i = laps.length - 1 - ri;
            const lapDiff = i === 0 ? lapTime : lapTime - laps[i - 1];
            const isFastest = laps.length > 1 && lapDiff === minLap;
            const isSlowest = laps.length > 1 && lapDiff === maxLap;
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "6px 0", borderBottom: "1px solid var(--gb)",
                fontSize: "var(--sm)",
                color: isFastest ? "var(--ok)" : isSlowest ? "var(--err)" : "var(--t2)"
              }}>
                <span>Lap {i + 1} {isFastest ? "🏆" : isSlowest ? "🐢" : ""}</span>
                <span style={{ fontFamily: "var(--mono)" }}>{formatTime(lapDiff)}</span>
                <span style={{ color: "var(--t3)", fontFamily: "var(--mono)" }}>{formatTime(lapTime)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Countdown ────────────────────────────────────────────────
function Countdown() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60000);
  const [running,   setRunning]   = useState(false);
  const [finished,  setFinished]  = useState(false);
  const endRef = useRef(null);
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    const left = endRef.current - Date.now();
    if (left <= 0) {
      setRemaining(0); setRunning(false); setFinished(true);
      cancelAnimationFrame(rafRef.current);
    } else {
      setRemaining(left);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const start = () => {
    endRef.current = Date.now() + remaining;
    setRunning(true); setFinished(false);
    rafRef.current = requestAnimationFrame(tick);
  };

  const pause = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
  };

  const reset = () => {
    cancelAnimationFrame(rafRef.current);
    setRunning(false); setFinished(false);
    setRemaining(duration * 1000);
  };

  useEffect(() => { setRemaining(duration * 1000); }, [duration]);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const pct = (remaining / (duration * 1000)) * 100;

  return (
    <div style={{ flex: 1, minWidth: 260 }}>
      <div className="label" style={{ marginBottom: "var(--s4)" }}>⏳ Countdown Timer</div>

      <div style={{ marginBottom: "var(--s4)" }}>
        <label className="label">Duration (seconds)</label>
        <input className="input" type="number" min={1} max={3600}
          value={duration} onChange={e => setDuration(Number(e.target.value))}
          disabled={running} />
      </div>

      <div style={{ textAlign: "center", marginBottom: "var(--s4)" }}>
        {/* Circular progress */}
        <svg width={140} height={140} style={{ display: "block", margin: "0 auto" }}>
          <circle cx={70} cy={70} r={60} fill="none" stroke="var(--gb)" strokeWidth={8} />
          <circle cx={70} cy={70} r={60} fill="none"
            stroke={finished ? "var(--err)" : remaining < 10000 ? "var(--warn)" : "var(--a2)"}
            strokeWidth={8} strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 60}`}
            strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
            transform="rotate(-90 70 70)"
            style={{ transition: "stroke-dashoffset .1s linear, stroke .3s" }}
          />
          <text x={70} y={70} textAnchor="middle" dominantBaseline="middle"
            style={{ fontFamily: "var(--mono)", fontSize: 22, fontWeight: 800,
              fill: finished ? "var(--err)" : "var(--t1)" }}>
            {formatTime(remaining)}
          </text>
        </svg>
      </div>

      {finished && (
        <div style={{ textAlign: "center", color: "var(--err)", fontWeight: 700,
          marginBottom: "var(--s3)", animation: "pulse 1s ease infinite" }}>
          🔔 Time's up!
        </div>
      )}

      <div style={{ display: "flex", gap: "var(--s2)", justifyContent: "center" }}>
        {!running
          ? <button className="btn btn-success" onClick={start} disabled={remaining === 0}>▶ Start</button>
          : <button className="btn btn-warn"    onClick={pause}>⏸ Pause</button>
        }
        <button className="btn btn-danger btn-sm" onClick={reset}>↺ Reset</button>
      </div>
    </div>
  );
}

export default function TimerStopwatch() {
  return (
    <div className="card">
      <h2 className="card-title">⏱ Timer + Stopwatch</h2>
      <p style={{ marginBottom: "var(--s6)" }}>
        <strong>Asked at Google, Amazon, Razorpay.</strong> Uses <code>requestAnimationFrame</code>
        + <code>Date.now()</code> for drift-free timing (not setInterval). Lap tracking with
        fastest/slowest highlighting. Circular SVG progress for countdown.
      </p>
      <div style={{ display: "flex", gap: "var(--s8)", flexWrap: "wrap" }}>
        <Stopwatch />
        <div style={{ width: 1, background: "var(--gb)", flexShrink: 0 }} />
        <Countdown />
      </div>
    </div>
  );
}
