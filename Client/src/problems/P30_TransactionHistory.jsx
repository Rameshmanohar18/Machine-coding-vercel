/**
 * PROBLEM 30 — Transaction History & Analytics
 * Asked at: Visa, Mastercard, PayPal, Walmart Pay, Fidelity
 *
 * Requirements:
 * - Transaction list with search + filter (type, date range, amount range, status)
 * - Spending by category (bar chart SVG)
 * - Monthly trend line chart (SVG)
 * - Export to CSV
 * - Fraud flag simulation
 * - Dispute transaction flow
 * - Pagination
 * - Summary: total spent, avg transaction, largest transaction
 */

import { useState, useMemo } from "react";

const CATEGORIES = ["Food","Shopping","Travel","Bills","Entertainment","Health","Transfer","ATM"];
const CAT_ICONS  = { Food:"🍔",Shopping:"🛍",Travel:"✈️",Bills:"📄",Entertainment:"🎬",Health:"🏥",Transfer:"💸",ATM:"🏧" };
const CAT_COLORS = { Food:"#f59e0b",Shopping:"#a78bfa",Travel:"#22d3ee",Bills:"#ef4444",
                     Entertainment:"#ec4899",Health:"#10b981",Transfer:"#6366f1",ATM:"#94a3b8" };

const MERCHANTS = {
  Food:["Swiggy","Zomato","McDonald's","Starbucks","Domino's"],
  Shopping:["Amazon","Flipkart","Myntra","Meesho","Nykaa"],
  Travel:["MakeMyTrip","Uber","Ola","IRCTC","IndiGo"],
  Bills:["Airtel","Jio","BESCOM","BWSSB","LIC"],
  Entertainment:["Netflix","Spotify","BookMyShow","Hotstar","Amazon Prime"],
  Health:["Apollo","Practo","PharmEasy","1mg","Cult.fit"],
  Transfer:["NEFT","IMPS","UPI","RTGS","Cheque"],
  ATM:["SBI ATM","HDFC ATM","ICICI ATM","Axis ATM","PNB ATM"],
};

function genTxns(count) {
  const txns = [];
  for (let i = 0; i < count; i++) {
    const cat  = CATEGORIES[Math.floor(Math.random()*CATEGORIES.length)];
    const merch= MERCHANTS[cat][Math.floor(Math.random()*MERCHANTS[cat].length)];
    const amt  = Math.floor(Math.random()*9900)+100;
    const daysAgo = Math.floor(Math.random()*90);
    const date = new Date(Date.now() - daysAgo*86400000);
    txns.push({
      id:`TXN${String(i+1).padStart(6,"0")}`,
      merchant:merch, category:cat, amount:amt,
      type: Math.random()>0.3 ? "debit" : "credit",
      status: Math.random()>0.05 ? "success" : Math.random()>0.5 ? "pending" : "failed",
      flagged: Math.random() < 0.04,
      date, dateStr:date.toISOString().split("T")[0],
      disputed:false,
    });
  }
  return txns.sort((a,b) => b.date-a.date);
}

const ALL_TXNS = genTxns(80);

function BarChart({ data, maxVal, w=300, h=120 }) {
  const barW = w / data.length - 4;
  return (
    <svg width={w} height={h}>
      {data.map((d, i) => {
        const barH = (d.value/maxVal)*h;
        const x = i*(w/data.length) + 2;
        const y = h - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barW} height={barH} rx={3}
              fill={d.color} opacity={0.8} />
            <text x={x+barW/2} y={h+12} textAnchor="middle"
              style={{ fontSize:9, fill:"var(--t3)", fontFamily:"var(--font)" }}>
              {d.label.slice(0,4)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function TransactionHistory() {
  const [txns,    setTxns]    = useState(ALL_TXNS);
  const [search,  setSearch]  = useState("");
  const [filterCat,  setFilterCat]  = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus,setFilterStatus]=useState("All");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,  setDateTo]  = useState("");
  const [page,    setPage]    = useState(1);
  const [disputing,setDisputing]=useState(null);
  const [disputeReason,setDisputeReason]=useState("");
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => txns.filter(t => {
    if (search && !t.merchant.toLowerCase().includes(search.toLowerCase()) &&
        !t.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat    !== "All" && t.category !== filterCat)    return false;
    if (filterType   !== "All" && t.type     !== filterType)   return false;
    if (filterStatus !== "All" && t.status   !== filterStatus) return false;
    if (dateFrom && t.dateStr < dateFrom) return false;
    if (dateTo   && t.dateStr > dateTo)   return false;
    return true;
  }), [txns, search, filterCat, filterType, filterStatus, dateFrom, dateTo]);

  const paginated = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length/PAGE_SIZE);

  const debits = txns.filter(t=>t.type==="debit"&&t.status==="success");
  const totalSpent = debits.reduce((s,t)=>s+t.amount,0);
  const avgTxn     = debits.length ? totalSpent/debits.length : 0;
  const maxTxn     = debits.length ? Math.max(...debits.map(t=>t.amount)) : 0;

  const catSpend = useMemo(() => {
    const map = {};
    debits.forEach(t => { map[t.category]=(map[t.category]||0)+t.amount; });
    return CATEGORIES.map(c => ({ label:c, value:map[c]||0, color:CAT_COLORS[c] }));
  }, []);

  const maxCat = Math.max(...catSpend.map(c=>c.value));

  const exportCSV = () => {
    const rows = [["ID","Date","Merchant","Category","Type","Amount","Status"]];
    filtered.forEach(t => rows.push([t.id,t.dateStr,t.merchant,t.category,t.type,t.amount,t.status]));
    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="transactions.csv"; a.click();
  };

  const submitDispute = (id) => {
    setTxns(t => t.map(x => x.id===id ? { ...x, disputed:true } : x));
    setDisputing(null); setDisputeReason("");
  };

  const STATUS_COLORS = { success:"var(--ok)", pending:"var(--warn)", failed:"var(--err)" };

  return (
    <div className="card">
      <h2 className="card-title">💳 Transaction History</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Visa, Mastercard, PayPal, Walmart.</strong> Transaction list with multi-filter,
        spending charts, fraud flags, dispute flow, CSV export, pagination.
      </p>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"var(--s3)", marginBottom:"var(--s5)" }}>
        {[
          { label:"Total Spent",   val:`₹${totalSpent.toLocaleString()}`,  color:"var(--err)" },
          { label:"Avg Transaction",val:`₹${avgTxn.toFixed(0)}`,           color:"var(--warn)" },
          { label:"Largest",       val:`₹${maxTxn.toLocaleString()}`,      color:"var(--a2)"  },
          { label:"Transactions",  val:txns.length,                        color:"var(--ok)"  },
        ].map(c => (
          <div key={c.label} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            <div className="label">{c.label}</div>
            <div style={{ fontSize:"var(--xl)", fontWeight:800, color:c.color }}>{c.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap", marginBottom:"var(--s5)" }}>
        {/* Bar chart */}
        <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
          borderRadius:"var(--r2)", padding:"var(--s4)", flex:1, minWidth:280 }}>
          <div className="label" style={{ marginBottom:"var(--s3)" }}>Spending by Category</div>
          <BarChart data={catSpend} maxVal={maxCat} w={320} h={100} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)", flexWrap:"wrap" }}>
        <input className="input" style={{ width:180 }} placeholder="Search merchant / ID..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        {[
          { val:filterCat,    set:setFilterCat,    opts:["All",...CATEGORIES], label:"Category" },
          { val:filterType,   set:setFilterType,   opts:["All","debit","credit"], label:"Type" },
          { val:filterStatus, set:setFilterStatus, opts:["All","success","pending","failed"], label:"Status" },
        ].map(f => (
          <select key={f.label} className="select" style={{ width:"auto" }} value={f.val}
            onChange={e => { f.set(e.target.value); setPage(1); }}>
            {f.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <input className="input" style={{ width:130 }} type="date" value={dateFrom}
          onChange={e => setDateFrom(e.target.value)} />
        <input className="input" style={{ width:130 }} type="date" value={dateTo}
          onChange={e => setDateTo(e.target.value)} />
        <button className="btn btn-ghost btn-sm" onClick={exportCSV} style={{ marginLeft:"auto" }}>
          ⬇ CSV
        </button>
      </div>

      {/* Transaction list */}
      <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)", marginBottom:"var(--s4)" }}>
        {paginated.map(t => (
          <div key={t.id} style={{
            display:"flex", alignItems:"center", gap:"var(--s3)",
            background: t.flagged ? "rgba(239,68,68,0.06)" : "var(--glass2)",
            border:`1px solid ${t.flagged?"rgba(239,68,68,.3)":t.disputed?"rgba(245,158,11,.3)":"var(--gb)"}`,
            borderRadius:"var(--r2)", padding:"10px 14px", flexWrap:"wrap"
          }}>
            <span style={{ fontSize:24 }}>{CAT_ICONS[t.category]}</span>
            <div style={{ flex:1, minWidth:120 }}>
              <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)" }}>
                {t.merchant}
                {t.flagged && <span style={{ marginLeft:"var(--s2)", fontSize:"var(--xs)",
                  color:"var(--err)", fontWeight:700 }}>⚠ Suspicious</span>}
                {t.disputed && <span style={{ marginLeft:"var(--s2)", fontSize:"var(--xs)",
                  color:"var(--warn)", fontWeight:700 }}>🔄 Disputed</span>}
              </div>
              <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                {t.id} · {t.dateStr} · {t.category}
              </div>
            </div>
            <span className="badge" style={{
              background:STATUS_COLORS[t.status]+"22", color:STATUS_COLORS[t.status],
              border:`1px solid ${STATUS_COLORS[t.status]}44` }}>
              {t.status}
            </span>
            <span style={{ fontWeight:800, fontFamily:"var(--mono)", fontSize:"var(--md)",
              color:t.type==="credit"?"var(--ok)":"var(--t1)", minWidth:80, textAlign:"right" }}>
              {t.type==="credit"?"+":"-"}₹{t.amount.toLocaleString()}
            </span>
            {!t.disputed && t.status==="success" && (
              <button className="btn btn-ghost btn-sm" onClick={() => setDisputing(t.id)}>
                Dispute
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)", flexWrap:"wrap" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setPage(p=>p-1)} disabled={page===1}>← Prev</button>
        <span style={{ fontSize:"var(--sm)", color:"var(--t2)" }}>Page {page} of {totalPages} · {filtered.length} results</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setPage(p=>p+1)} disabled={page>=totalPages}>Next →</button>
      </div>

      {/* Dispute modal */}
      {disputing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(7,9,26,.8)", backdropFilter:"blur(8px)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}
          onClick={() => setDisputing(null)}>
          <div style={{ background:"rgba(13,16,37,.97)", border:"1px solid var(--gb2)",
            borderRadius:"var(--r4)", padding:"var(--s8)", width:400, animation:"slideUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:"var(--s4)" }}>🔄 Dispute Transaction</h3>
            <p style={{ marginBottom:"var(--s4)" }}>Transaction: <strong>{disputing}</strong></p>
            <div className="form-row">
              <label className="label">Reason for Dispute</label>
              <select className="select" value={disputeReason} onChange={e=>setDisputeReason(e.target.value)}>
                <option value="">Select reason...</option>
                {["Unauthorized transaction","Duplicate charge","Item not received","Wrong amount","Merchant fraud"].map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:"var(--s3)", justifyContent:"flex-end", marginTop:"var(--s4)" }}>
              <button className="btn btn-ghost" onClick={() => setDisputing(null)}>Cancel</button>
              <button className="btn btn-warn" onClick={() => submitDispute(disputing)}
                disabled={!disputeReason}>Submit Dispute</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
