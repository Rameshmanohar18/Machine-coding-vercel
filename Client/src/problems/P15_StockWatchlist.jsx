/**
 * PROBLEM 15 — Stock Watchlist with Live Prices
 * ─────────────────────────────────────────────────────────────
 * Asked at: JP Morgan, Wells Fargo, Goldman Sachs, Broadcom
 *
 * Requirements:
 * - Watchlist of stocks with simulated live price updates
 * - Add/remove stocks from watchlist
 * - Price change % with color (green/red)
 * - Mini sparkline per stock (SVG)
 * - Set price alerts (notify when price crosses threshold)
 * - Sort by name / price / change%
 * - Portfolio value tracker
 * - Pause/resume live feed
 */

import { useState, useEffect, useRef, useCallback } from "react";

const ALL_STOCKS = [
  { symbol:"AAPL",  name:"Apple Inc.",         sector:"Tech"    },
  { symbol:"MSFT",  name:"Microsoft Corp.",     sector:"Tech"    },
  { symbol:"GOOGL", name:"Alphabet Inc.",       sector:"Tech"    },
  { symbol:"AMZN",  name:"Amazon.com Inc.",     sector:"Retail"  },
  { symbol:"TSLA",  name:"Tesla Inc.",          sector:"Auto"    },
  { symbol:"NVDA",  name:"NVIDIA Corp.",        sector:"Tech"    },
  { symbol:"JPM",   name:"JPMorgan Chase",      sector:"Finance" },
  { symbol:"WFC",   name:"Wells Fargo",         sector:"Finance" },
  { symbol:"META",  name:"Meta Platforms",      sector:"Tech"    },
  { symbol:"NFLX",  name:"Netflix Inc.",        sector:"Media"   },
];

const BASE_PRICES = { AAPL:185, MSFT:380, GOOGL:140, AMZN:178, TSLA:245,
                      NVDA:620, JPM:195, WFC:52, META:490, NFLX:610 };

function Sparkline({ data, color, width=80, height=30 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function StockWatchlist() {
  const [watchlist, setWatchlist] = useState(["AAPL","MSFT","NVDA","JPM"]);
  const [prices,    setPrices]    = useState(
    Object.fromEntries(Object.entries(BASE_PRICES).map(([k,v]) => [k, v]))
  );
  const [history,   setHistory]   = useState(
    Object.fromEntries(Object.keys(BASE_PRICES).map(k => [k, [BASE_PRICES[k]]]))
  );
  const [prevPrices, setPrevPrices] = useState({ ...BASE_PRICES });
  const [paused,    setPaused]    = useState(false);
  const [sortBy,    setSortBy]    = useState("symbol");
  const [alerts,    setAlerts]    = useState({}); // { symbol: threshold }
  const [alertInput, setAlertInput] = useState({});
  const [firedAlerts, setFiredAlerts] = useState([]);
  const [holdings,  setHoldings]  = useState(
    Object.fromEntries(watchlist.map(s => [s, 0]))
  );
  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    setPrevPrices(p => ({ ...p, ...prices }));
    setPrices(prev => {
      const next = {};
      Object.keys(prev).forEach(sym => {
        const change = (Math.random() - 0.48) * prev[sym] * 0.015;
        next[sym] = Math.max(1, prev[sym] + change);
      });
      // Check alerts
      Object.entries(alerts).forEach(([sym, threshold]) => {
        if (threshold && prev[sym] < threshold && next[sym] >= threshold) {
          setFiredAlerts(a => [`🔔 ${sym} crossed ₹${threshold}!`, ...a].slice(0, 5));
        }
      });
      setHistory(h => {
        const nh = {};
        Object.keys(next).forEach(sym => {
          nh[sym] = [...(h[sym] || []), next[sym]].slice(-30);
        });
        return nh;
      });
      return next;
    });
  }, [prices, alerts]);

  useEffect(() => {
    if (!paused) intervalRef.current = setInterval(tick, 1500);
    return () => clearInterval(intervalRef.current);
  }, [paused, tick]);

  const toggleWatch = (sym) => {
    setWatchlist(w => w.includes(sym) ? w.filter(s => s !== sym) : [...w, sym]);
    setHoldings(h => ({ ...h, [sym]: h[sym] || 0 }));
  };

  const portfolioValue = watchlist.reduce((sum, sym) => sum + (holdings[sym] || 0) * prices[sym], 0);

  const sorted = [...watchlist].sort((a, b) => {
    if (sortBy === "price")  return prices[b] - prices[a];
    if (sortBy === "change") return ((prices[b]-prevPrices[b])/prevPrices[b]) - ((prices[a]-prevPrices[a])/prevPrices[a]);
    return a.localeCompare(b);
  });

  return (
    <div className="card">
      <h2 className="card-title">📈 Stock Watchlist</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at JP Morgan, Wells Fargo, Goldman Sachs.</strong> Live price feed,
        sparklines, price alerts, portfolio value, sort, add/remove stocks.
      </p>

      {/* Fired alerts */}
      {firedAlerts.length > 0 && (
        <div style={{ marginBottom:"var(--s4)", display:"flex", flexDirection:"column", gap:"var(--s1)" }}>
          {firedAlerts.map((a, i) => (
            <div key={i} style={{ background:"var(--warn-bg)", border:"1px solid rgba(245,158,11,.3)",
              borderRadius:"var(--r1)", padding:"6px 12px", fontSize:"var(--xs)", color:"var(--warn)" }}>
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s5)", flexWrap:"wrap", alignItems:"center" }}>
        <button className={`btn btn-sm ${paused?"btn-success":"btn-danger"}`}
          onClick={() => setPaused(p => !p)}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
        {["symbol","price","change"].map(s => (
          <button key={s} className={`btn btn-sm ${sortBy===s?"btn-primary":"btn-ghost"}`}
            onClick={() => setSortBy(s)}>
            Sort: {s}
          </button>
        ))}
        <div style={{ marginLeft:"auto", background:"var(--glass2)", border:"1px solid var(--gb)",
          borderRadius:"var(--r2)", padding:"var(--s2) var(--s4)", fontSize:"var(--sm)" }}>
          Portfolio: <strong style={{ color:"var(--ok)" }}>${portfolioValue.toFixed(2)}</strong>
        </div>
      </div>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* ── Watchlist ── */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)" }}>
            {sorted.map(sym => {
              const price  = prices[sym];
              const prev   = prevPrices[sym] || price;
              const change = price - prev;
              const changePct = ((change / prev) * 100);
              const isUp   = change >= 0;
              return (
                <div key={sym} style={{
                  background:"var(--glass2)", border:"1px solid var(--gb)",
                  borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)",
                  display:"flex", alignItems:"center", gap:"var(--s4)", flexWrap:"wrap"
                }}>
                  <div style={{ minWidth:60 }}>
                    <div style={{ fontWeight:800, color:"var(--t1)", fontSize:"var(--md)" }}>{sym}</div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                      {ALL_STOCKS.find(s => s.symbol===sym)?.sector}
                    </div>
                  </div>

                  <Sparkline data={history[sym] || []} color={isUp?"var(--ok)":"var(--err)"} />

                  <div style={{ flex:1, textAlign:"right" }}>
                    <div style={{ fontWeight:800, fontSize:"var(--lg)", color:"var(--t1)",
                      fontFamily:"var(--mono)" }}>
                      ${price.toFixed(2)}
                    </div>
                    <div style={{ fontSize:"var(--sm)", fontWeight:700,
                      color: isUp ? "var(--ok)" : "var(--err)" }}>
                      {isUp?"+":""}{changePct.toFixed(2)}%
                    </div>
                  </div>

                  {/* Holdings */}
                  <div style={{ display:"flex", alignItems:"center", gap:"var(--s1)" }}>
                    <input type="number" min={0} value={holdings[sym]||0}
                      onChange={e => setHoldings(h => ({ ...h, [sym]:Number(e.target.value) }))}
                      style={{ width:60, background:"var(--glass)", border:"1px solid var(--gb)",
                        borderRadius:"var(--r1)", color:"var(--t1)", padding:"4px 6px",
                        fontSize:"var(--xs)", outline:"none", textAlign:"center" }} />
                    <span style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>shares</span>
                  </div>

                  {/* Alert */}
                  <div style={{ display:"flex", alignItems:"center", gap:"var(--s1)" }}>
                    <input type="number" placeholder="Alert $"
                      value={alertInput[sym]||""}
                      onChange={e => setAlertInput(a => ({ ...a, [sym]:e.target.value }))}
                      style={{ width:70, background:"var(--glass)", border:"1px solid var(--gb)",
                        borderRadius:"var(--r1)", color:"var(--t1)", padding:"4px 6px",
                        fontSize:"var(--xs)", outline:"none" }} />
                    <button className="btn btn-warn btn-sm"
                      onClick={() => setAlerts(a => ({ ...a, [sym]:Number(alertInput[sym]) }))}>
                      🔔
                    </button>
                  </div>

                  <button className="btn btn-danger btn-sm" onClick={() => toggleWatch(sym)}>✕</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Add stocks ── */}
        <div style={{ minWidth:180, flex:"0 0 180px" }}>
          <div className="label" style={{ marginBottom:"var(--s3)" }}>Add to Watchlist</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)" }}>
            {ALL_STOCKS.filter(s => !watchlist.includes(s.symbol)).map(s => (
              <button key={s.symbol} className="btn btn-ghost btn-sm"
                style={{ justifyContent:"flex-start", gap:"var(--s2)" }}
                onClick={() => toggleWatch(s.symbol)}>
                <span style={{ fontWeight:700, color:"var(--a2)" }}>{s.symbol}</span>
                <span style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{s.sector}</span>
              </button>
            ))}
            {ALL_STOCKS.every(s => watchlist.includes(s.symbol)) && (
              <div style={{ color:"var(--t3)", fontSize:"var(--xs)" }}>All stocks added</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
