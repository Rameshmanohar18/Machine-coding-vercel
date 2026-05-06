/**
 * PROBLEM 44 — Mutual Fund SIP Calculator & Explorer
 * Asked at: Groww, Zerodha Coin, Paytm Money, Fidelity
 */

import { useState, useMemo } from "react";

const FUNDS = [
  { id:1, name:"Axis Bluechip Fund",       category:"Large Cap",  returns:{ 1:12.4, 3:15.2, 5:14.8 }, risk:"Low",    minSIP:500  },
  { id:2, name:"Mirae Asset Emerging",     category:"Mid Cap",    returns:{ 1:18.6, 3:22.1, 5:19.4 }, risk:"High",   minSIP:1000 },
  { id:3, name:"Parag Parikh Flexi Cap",   category:"Flexi Cap",  returns:{ 1:16.2, 3:19.8, 5:18.1 }, risk:"Medium", minSIP:1000 },
  { id:4, name:"HDFC Index Fund Nifty 50", category:"Index",      returns:{ 1:11.8, 3:14.5, 5:13.9 }, risk:"Low",    minSIP:500  },
  { id:5, name:"Quant Small Cap Fund",     category:"Small Cap",  returns:{ 1:28.4, 3:35.2, 5:28.7 }, risk:"Very High",minSIP:1000},
  { id:6, name:"SBI Debt Fund",            category:"Debt",       returns:{ 1:7.2,  3:7.8,  5:7.5  }, risk:"Very Low",minSIP:500  },
];

const RISK_COLORS = { "Very Low":"var(--ok)", Low:"var(--info)", Medium:"var(--warn)", High:"var(--err)", "Very High":"#dc2626" };

function calcSIP(monthly, rate, years) {
  const r = rate / 12 / 100;
  const n = years * 12;
  return monthly * ((Math.pow(1+r, n) - 1) / r) * (1+r);
}

function LineChart({ data, w=300, h=80, color="var(--a2)" }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max-min||1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id="sipGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

export default function MutualFundSIP() {
  const [monthly,   setMonthly]   = useState(5000);
  const [years,     setYears]     = useState(10);
  const [selFund,   setSelFund]   = useState(FUNDS[0]);
  const [period,    setPeriod]    = useState(5);
  const [watchlist, setWatchlist] = useState([1,4]);
  const [tab,       setTab]       = useState("calculator");

  const invested = monthly * years * 12;
  const returns  = calcSIP(monthly, selFund.returns[5]||selFund.returns[3], years);
  const gain     = returns - invested;

  const chartData = useMemo(() => {
    return Array.from({length:years*12+1},(_,i) => {
      const r = selFund.returns[5]/12/100;
      return monthly * ((Math.pow(1+r,i)-1)/r) * (1+r);
    });
  }, [monthly, years, selFund]);

  const fmt = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` :
    n >= 100000 ? `₹${(n/100000).toFixed(2)}L` : `₹${Math.round(n).toLocaleString()}`;

  return (
    <div className="card">
      <h2 className="card-title">📊 Mutual Fund SIP Calculator</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Groww, Zerodha, Paytm Money.</strong> SIP calculator with growth chart,
        fund explorer with risk/return, watchlist, comparison.
      </p>

      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--gb)", marginBottom:"var(--s5)" }}>
        {[["calculator","🧮 Calculator"],["explore","🔍 Explore Funds"],["watchlist",`🔖 Watchlist (${watchlist.length})`]].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:"8px 14px", background:"none", border:"none", cursor:"pointer",
              fontFamily:"var(--font)", fontSize:"var(--sm)", fontWeight:tab===t?700:400,
              color:tab===t?"var(--a2)":"var(--t3)",
              borderBottom:tab===t?"2px solid var(--a2)":"2px solid transparent",
              marginBottom:-1, transition:"all var(--tr)" }}>
            {l}
          </button>
        ))}
      </div>

      {tab === "calculator" && (
        <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:260 }}>
            <div style={{ marginBottom:"var(--s4)" }}>
              <label className="label">Fund: {selFund.name}</label>
              <select className="select" value={selFund.id}
                onChange={e=>setSelFund(FUNDS.find(f=>f.id===Number(e.target.value)))}>
                {FUNDS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            {[
              { label:`Monthly SIP: ₹${monthly.toLocaleString()}`, min:500, max:100000, step:500, val:monthly, set:setMonthly },
              { label:`Investment Period: ${years} years`,          min:1,   max:30,     step:1,   val:years,   set:setYears   },
            ].map(f => (
              <div key={f.label} style={{ marginBottom:"var(--s4)" }}>
                <label className="label">{f.label}</label>
                <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                  onChange={e=>f.set(Number(e.target.value))}
                  style={{ width:"100%", accentColor:"var(--a)" }} />
              </div>
            ))}

            <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)" }}>
              {[
                { label:"Invested",       val:fmt(invested), color:"var(--t1)"  },
                { label:"Est. Returns",   val:fmt(returns),  color:"var(--ok)"  },
                { label:"Wealth Gained",  val:fmt(gain),     color:"var(--a2)"  },
                { label:"XIRR",           val:`${selFund.returns[5]}%`, color:"var(--warn)" },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
                  padding:"var(--s2) 0", borderBottom:"1px solid var(--gb)" }}>
                  <span style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>{r.label}</span>
                  <span style={{ color:r.color, fontWeight:800, fontSize:"var(--md)" }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex:1, minWidth:260 }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>Growth Projection</div>
            <LineChart data={chartData} w={300} h={120} color="var(--ok)" />
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--xs)",
              color:"var(--t3)", marginTop:"var(--s1)" }}>
              <span>Now</span><span>{years} years</span>
            </div>

            <div style={{ marginTop:"var(--s5)" }}>
              <div className="label" style={{ marginBottom:"var(--s3)" }}>Returns Comparison</div>
              {[1,3,5].map(y => (
                <div key={y} style={{ marginBottom:"var(--s3)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--sm)",
                    marginBottom:"var(--s1)" }}>
                    <span style={{ color:"var(--t2)" }}>{y} Year</span>
                    <span style={{ color:"var(--ok)", fontWeight:700 }}>{selFund.returns[y]}%</span>
                  </div>
                  <div style={{ height:6, background:"var(--gb)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${(selFund.returns[y]/40)*100}%`,
                      background:"var(--ok)", borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "explore" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
          {FUNDS.map(f => (
            <div key={f.id} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s2)" }}>
                <div>
                  <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{f.name}</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                    {f.category} · Min SIP ₹{f.minSIP}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"var(--s2)", alignItems:"center" }}>
                  <span style={{ fontSize:"var(--xs)", color:RISK_COLORS[f.risk], fontWeight:700 }}>
                    {f.risk} Risk
                  </span>
                  <button className={`btn btn-sm ${watchlist.includes(f.id)?"btn-warn":"btn-ghost"}`}
                    onClick={() => setWatchlist(w=>w.includes(f.id)?w.filter(x=>x!==f.id):[...w,f.id])}>
                    {watchlist.includes(f.id)?"🔖":"📌"}
                  </button>
                  <button className="btn btn-primary btn-sm"
                    onClick={() => { setSelFund(f); setTab("calculator"); }}>
                    Invest
                  </button>
                </div>
              </div>
              <div style={{ display:"flex", gap:"var(--s4)" }}>
                {[1,3,5].map(y => (
                  <div key={y} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{y}Y</div>
                    <div style={{ fontWeight:800, color:"var(--ok)", fontSize:"var(--sm)" }}>
                      {f.returns[y]}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "watchlist" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
          {watchlist.length===0 ? (
            <div style={{ textAlign:"center", color:"var(--t3)", padding:"var(--s10)" }}>
              No funds in watchlist. Explore funds and add them.
            </div>
          ) : FUNDS.filter(f=>watchlist.includes(f.id)).map(f => (
            <div key={f.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              background:"var(--glass2)", border:"1px solid var(--gb)", borderRadius:"var(--r2)",
              padding:"var(--s4)" }}>
              <div>
                <div style={{ fontWeight:700, color:"var(--t1)" }}>{f.name}</div>
                <div style={{ fontSize:"var(--sm)", color:"var(--ok)", fontWeight:700 }}>
                  5Y: {f.returns[5]}% · {f.risk} Risk
                </div>
              </div>
              <div style={{ display:"flex", gap:"var(--s2)" }}>
                <button className="btn btn-primary btn-sm"
                  onClick={() => { setSelFund(f); setTab("calculator"); }}>Invest</button>
                <button className="btn btn-danger btn-sm"
                  onClick={() => setWatchlist(w=>w.filter(x=>x!==f.id))}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
