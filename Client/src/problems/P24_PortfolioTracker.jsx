/**
 * PROBLEM 24 — Investment Portfolio Tracker
 * Asked at: Fidelity Investments, JP Morgan, Zerodha, Groww
 *
 * Requirements:
 * - Add/remove holdings (stock, qty, buy price)
 * - Live price simulation with P&L calculation
 * - Portfolio allocation pie chart (SVG)
 * - Sector-wise breakdown
 * - Total invested vs current value
 * - Gain/loss per holding with % change
 * - Sort by gain%, value, name
 * - Export holdings as CSV
 */

import { useState, useEffect, useMemo } from "react";

const STOCKS = {
  RELIANCE: { name:"Reliance Industries", sector:"Energy",    base:2800 },
  TCS:      { name:"TCS",                 sector:"IT",        base:3900 },
  INFY:     { name:"Infosys",             sector:"IT",        base:1600 },
  HDFC:     { name:"HDFC Bank",           sector:"Finance",   base:1700 },
  ICICI:    { name:"ICICI Bank",          sector:"Finance",   base:1100 },
  WIPRO:    { name:"Wipro",               sector:"IT",        base:480  },
  TATAMOTORS:{ name:"Tata Motors",        sector:"Auto",      base:950  },
  BAJFINANCE:{ name:"Bajaj Finance",      sector:"Finance",   base:7200 },
};

const INITIAL_HOLDINGS = [
  { id:1, symbol:"TCS",       qty:10, buyPrice:3750 },
  { id:2, symbol:"HDFC",      qty:20, buyPrice:1650 },
  { id:3, symbol:"RELIANCE",  qty:15, buyPrice:2700 },
  { id:4, symbol:"INFY",      qty:25, buyPrice:1550 },
];

let hId = 10;

function PieChart({ data, size=180 }) {
  const total = data.reduce((s,d) => s+d.value, 0);
  if (!total) return null;
  let angle = -90;
  const cx = size/2, cy = size/2, r = size/2 - 10;
  const COLORS = ["#a78bfa","#22d3ee","#10b981","#f59e0b","#ef4444","#ec4899","#6366f1","#14b8a6"];

  return (
    <svg width={size} height={size}>
      {data.map((d, i) => {
        const pct   = d.value / total;
        const sweep = pct * 360;
        const start = angle;
        angle += sweep;
        const r1 = (start * Math.PI) / 180;
        const r2 = (angle  * Math.PI) / 180;
        const x1 = cx + r * Math.cos(r1), y1 = cy + r * Math.sin(r1);
        const x2 = cx + r * Math.cos(r2), y2 = cy + r * Math.sin(r2);
        const large = sweep > 180 ? 1 : 0;
        return (
          <path key={i}
            d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
            fill={COLORS[i % COLORS.length]} opacity={0.85}
          >
            <title>{d.label}: {(pct*100).toFixed(1)}%</title>
          </path>
        );
      })}
      <circle cx={cx} cy={cy} r={r*0.45} fill="var(--bg2)" />
    </svg>
  );
}

export default function PortfolioTracker() {
  const [holdings, setHoldings] = useState(INITIAL_HOLDINGS);
  const [prices,   setPrices]   = useState(
    Object.fromEntries(Object.entries(STOCKS).map(([k,v]) => [k, v.base]))
  );
  const [form,     setForm]     = useState({ symbol:"TCS", qty:"", buyPrice:"" });
  const [sortBy,   setSortBy]   = useState("gainPct");

  // Simulate live prices
  useEffect(() => {
    const t = setInterval(() => {
      setPrices(prev => Object.fromEntries(
        Object.entries(prev).map(([k,v]) => [k, Math.max(1, v + (Math.random()-0.49)*v*0.008)])
      ));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const addHolding = () => {
    if (!form.qty || !form.buyPrice) return;
    setHoldings(h => [...h, { id:hId++, symbol:form.symbol, qty:Number(form.qty), buyPrice:Number(form.buyPrice) }]);
    setForm(f => ({ ...f, qty:"", buyPrice:"" }));
  };

  const removeHolding = (id) => setHoldings(h => h.filter(x => x.id!==id));

  const enriched = useMemo(() => holdings.map(h => {
    const cur    = prices[h.symbol] || STOCKS[h.symbol]?.base || 0;
    const invested = h.qty * h.buyPrice;
    const current  = h.qty * cur;
    const gain     = current - invested;
    const gainPct  = (gain / invested) * 100;
    return { ...h, currentPrice:cur, invested, current, gain, gainPct };
  }), [holdings, prices]);

  const sorted = [...enriched].sort((a,b) => {
    if (sortBy === "gainPct") return b.gainPct - a.gainPct;
    if (sortBy === "value")   return b.current - a.current;
    return a.symbol.localeCompare(b.symbol);
  });

  const totalInvested = enriched.reduce((s,h) => s+h.invested, 0);
  const totalCurrent  = enriched.reduce((s,h) => s+h.current,  0);
  const totalGain     = totalCurrent - totalInvested;
  const totalGainPct  = totalInvested ? (totalGain/totalInvested)*100 : 0;

  const sectorData = useMemo(() => {
    const map = {};
    enriched.forEach(h => {
      const sector = STOCKS[h.symbol]?.sector || "Other";
      map[sector] = (map[sector]||0) + h.current;
    });
    return Object.entries(map).map(([label,value]) => ({ label, value }));
  }, [enriched]);

  const exportCSV = () => {
    const rows = [["Symbol","Qty","Buy Price","Current","Invested","Current Value","Gain","Gain%"]];
    enriched.forEach(h => rows.push([h.symbol,h.qty,h.buyPrice.toFixed(2),h.currentPrice.toFixed(2),
      h.invested.toFixed(2),h.current.toFixed(2),h.gain.toFixed(2),h.gainPct.toFixed(2)+"%"]));
    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")], { type:"text/csv" });
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="portfolio.csv"; a.click();
  };

  return (
    <div className="card">
      <h2 className="card-title">📈 Investment Portfolio Tracker</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Fidelity, JP Morgan, Zerodha.</strong> Live P&L, SVG pie chart,
        sector breakdown, add/remove holdings, sort, CSV export.
      </p>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"var(--s3)", marginBottom:"var(--s6)" }}>
        {[
          { label:"Invested",      val:`₹${totalInvested.toLocaleString("en-IN",{maximumFractionDigits:0})}`, color:"var(--t1)" },
          { label:"Current Value", val:`₹${totalCurrent.toLocaleString("en-IN",{maximumFractionDigits:0})}`,  color:"var(--a2)" },
          { label:"Total P&L",     val:`${totalGain>=0?"+":""}₹${totalGain.toLocaleString("en-IN",{maximumFractionDigits:0})}`, color:totalGain>=0?"var(--ok)":"var(--err)" },
          { label:"Return",        val:`${totalGainPct>=0?"+":""}${totalGainPct.toFixed(2)}%`, color:totalGainPct>=0?"var(--ok)":"var(--err)" },
        ].map(c => (
          <div key={c.label} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            <div className="label">{c.label}</div>
            <div style={{ fontSize:"var(--xl)", fontWeight:800, color:c.color }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* Holdings table */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"var(--s3)" }}>
            <div className="label">Holdings</div>
            <div style={{ display:"flex", gap:"var(--s2)" }}>
              {["gainPct","value","name"].map(s => (
                <button key={s} className={`btn btn-sm ${sortBy===s?"btn-primary":"btn-ghost"}`}
                  onClick={() => setSortBy(s)}>
                  {s==="gainPct"?"P&L%":s==="value"?"Value":"Name"}
                </button>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={exportCSV}>⬇ CSV</button>
            </div>
          </div>

          <div style={{ overflowX:"auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Stock</th><th>Qty</th><th>Buy</th><th>LTP</th>
                  <th>Invested</th><th>Value</th><th>P&L</th><th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(h => (
                  <tr key={h.id}>
                    <td>
                      <div style={{ fontWeight:700, color:"var(--t1)" }}>{h.symbol}</div>
                      <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{STOCKS[h.symbol]?.sector}</div>
                    </td>
                    <td style={{ fontFamily:"var(--mono)" }}>{h.qty}</td>
                    <td style={{ fontFamily:"var(--mono)" }}>₹{h.buyPrice.toFixed(0)}</td>
                    <td style={{ fontFamily:"var(--mono)", color:"var(--a2)" }}>₹{h.currentPrice.toFixed(0)}</td>
                    <td style={{ fontFamily:"var(--mono)" }}>₹{h.invested.toLocaleString("en-IN",{maximumFractionDigits:0})}</td>
                    <td style={{ fontFamily:"var(--mono)", fontWeight:700 }}>₹{h.current.toLocaleString("en-IN",{maximumFractionDigits:0})}</td>
                    <td>
                      <div style={{ color:h.gain>=0?"var(--ok)":"var(--err)", fontWeight:700, fontFamily:"var(--mono)" }}>
                        {h.gain>=0?"+":""}₹{h.gain.toFixed(0)}
                      </div>
                      <div style={{ fontSize:"var(--xs)", color:h.gainPct>=0?"var(--ok)":"var(--err)" }}>
                        {h.gainPct>=0?"+":""}{h.gainPct.toFixed(2)}%
                      </div>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => removeHolding(h.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add holding */}
          <div style={{ display:"flex", gap:"var(--s2)", marginTop:"var(--s4)", flexWrap:"wrap" }}>
            <select className="select" style={{ width:"auto" }} value={form.symbol}
              onChange={e => setForm(f => ({ ...f, symbol:e.target.value }))}>
              {Object.keys(STOCKS).map(s => <option key={s}>{s}</option>)}
            </select>
            <input className="input" style={{ width:80 }} type="number" placeholder="Qty"
              value={form.qty} onChange={e => setForm(f => ({ ...f, qty:e.target.value }))} />
            <input className="input" style={{ width:100 }} type="number" placeholder="Buy ₹"
              value={form.buyPrice} onChange={e => setForm(f => ({ ...f, buyPrice:e.target.value }))} />
            <button className="btn btn-primary btn-sm" onClick={addHolding}>+ Add</button>
          </div>
        </div>

        {/* Pie chart */}
        <div style={{ minWidth:200, flex:"0 0 200px", display:"flex", flexDirection:"column", alignItems:"center" }}>
          <div className="label" style={{ marginBottom:"var(--s3)", alignSelf:"flex-start" }}>Sector Allocation</div>
          <PieChart data={sectorData} />
          <div style={{ marginTop:"var(--s3)", width:"100%" }}>
            {sectorData.map((d, i) => {
              const COLORS = ["#a78bfa","#22d3ee","#10b981","#f59e0b","#ef4444","#ec4899"];
              const pct = ((d.value/totalCurrent)*100).toFixed(1);
              return (
                <div key={d.label} style={{ display:"flex", justifyContent:"space-between",
                  fontSize:"var(--xs)", marginBottom:"var(--s1)", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:COLORS[i%COLORS.length] }} />
                    <span style={{ color:"var(--t2)" }}>{d.label}</span>
                  </div>
                  <span style={{ color:"var(--t1)", fontWeight:700 }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
