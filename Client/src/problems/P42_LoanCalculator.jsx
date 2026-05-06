/**
 * PROBLEM 42 — Loan / EMI Calculator
 * Asked at: Citibank, Paytm Money, BankBazaar, Groww
 *
 * Requirements:
 * - EMI calculation (principal, rate, tenure)
 * - Amortization schedule table
 * - Pie chart: principal vs interest
 * - Compare multiple loan options
 * - Prepayment impact calculator
 * - Different loan types: Home, Car, Personal, Education
 * - Monthly/yearly toggle
 * - Export amortization as CSV
 */

import { useState, useMemo } from "react";

const LOAN_TYPES = {
  Home:      { rate:8.5,  maxTenure:30, icon:"🏠" },
  Car:       { rate:9.5,  maxTenure:7,  icon:"🚗" },
  Personal:  { rate:14.0, maxTenure:5,  icon:"💳" },
  Education: { rate:10.5, maxTenure:15, icon:"🎓" },
};

function calcEMI(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / tenureMonths;
  return (principal * r * Math.pow(1+r, tenureMonths)) / (Math.pow(1+r, tenureMonths) - 1);
}

function buildSchedule(principal, annualRate, tenureMonths) {
  const r = annualRate / 12 / 100;
  const emi = calcEMI(principal, annualRate, tenureMonths);
  let balance = principal;
  const rows = [];
  for (let m = 1; m <= tenureMonths; m++) {
    const interest = balance * r;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    rows.push({ month:m, emi, principal:principalPaid, interest, balance:Math.max(0,balance) });
  }
  return rows;
}

function PieChart({ principal, interest, size=140 }) {
  const total = principal + interest;
  const pPct  = principal / total;
  const r = size/2 - 10, cx = size/2, cy = size/2;
  const angle = pPct * 360 - 90;
  const r1 = -90 * Math.PI/180;
  const r2 = angle * Math.PI/180;
  const x1 = cx + r*Math.cos(r1), y1 = cy + r*Math.sin(r1);
  const x2 = cx + r*Math.cos(r2), y2 = cy + r*Math.sin(r2);
  const large = pPct > 0.5 ? 1 : 0;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="var(--err)" opacity={0.8} />
      <path d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
        fill="var(--a2)" opacity={0.85} />
      <circle cx={cx} cy={cy} r={r*0.5} fill="var(--bg2)" />
    </svg>
  );
}

export default function LoanCalculator() {
  const [loanType,  setLoanType]  = useState("Home");
  const [principal, setPrincipal] = useState(5000000);
  const [rate,      setRate]      = useState(LOAN_TYPES.Home.rate);
  const [tenure,    setTenure]    = useState(20);
  const [prepay,    setPrepay]    = useState(0);
  const [view,      setView]      = useState("summary"); // summary | schedule | compare
  const [scheduleView, setScheduleView] = useState("monthly");

  const emi = useMemo(() => calcEMI(principal, rate, tenure*12), [principal, rate, tenure]);
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - principal;

  const schedule = useMemo(() => buildSchedule(principal, rate, tenure*12), [principal, rate, tenure]);

  // Prepayment impact
  const newPrincipal = Math.max(0, principal - prepay);
  const newEmi = useMemo(() => calcEMI(newPrincipal, rate, tenure*12), [newPrincipal, rate, tenure]);
  const newTotal = newEmi * tenure * 12;
  const savings = totalPayment - newTotal;

  const yearlySchedule = useMemo(() => {
    const yearly = [];
    for (let y = 0; y < tenure; y++) {
      const months = schedule.slice(y*12, (y+1)*12);
      yearly.push({
        year: y+1,
        principal: months.reduce((s,m)=>s+m.principal,0),
        interest:  months.reduce((s,m)=>s+m.interest,0),
        balance:   months[months.length-1]?.balance || 0,
      });
    }
    return yearly;
  }, [schedule, tenure]);

  const exportCSV = () => {
    const rows = [["Month","EMI","Principal","Interest","Balance"]];
    schedule.forEach(r => rows.push([r.month,r.emi.toFixed(0),r.principal.toFixed(0),r.interest.toFixed(0),r.balance.toFixed(0)]));
    const blob = new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="amortization.csv"; a.click();
  };

  const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

  return (
    <div className="card">
      <h2 className="card-title">🏦 Loan / EMI Calculator</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Citibank, Paytm Money, Groww.</strong> EMI calculation, amortization schedule,
        principal vs interest pie chart, prepayment impact, loan type comparison.
      </p>

      {/* Loan type */}
      <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s5)", flexWrap:"wrap" }}>
        {Object.entries(LOAN_TYPES).map(([type, meta]) => (
          <button key={type}
            className={`btn btn-sm ${loanType===type?"btn-primary":"btn-ghost"}`}
            onClick={() => { setLoanType(type); setRate(meta.rate); setTenure(Math.min(tenure,meta.maxTenure)); }}>
            {meta.icon} {type}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* Inputs */}
        <div style={{ flex:1, minWidth:260 }}>
          {[
            { label:`Loan Amount: ${fmt(principal)}`, key:"principal", min:100000, max:50000000, step:100000, val:principal, set:setPrincipal },
            { label:`Interest Rate: ${rate}% p.a.`,   key:"rate",      min:5,      max:25,       step:0.1,    val:rate,      set:setRate      },
            { label:`Tenure: ${tenure} years`,         key:"tenure",    min:1,      max:LOAN_TYPES[loanType].maxTenure, step:1, val:tenure, set:setTenure },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:"var(--s4)" }}>
              <label className="label">{f.label}</label>
              <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                onChange={e=>f.set(Number(e.target.value))}
                style={{ width:"100%", accentColor:"var(--a)" }} />
            </div>
          ))}

          {/* Summary */}
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            {[
              { label:"Monthly EMI",    val:fmt(emi),          color:"var(--a2)",  size:"var(--2xl)" },
              { label:"Total Payment",  val:fmt(totalPayment), color:"var(--t1)"  },
              { label:"Total Interest", val:fmt(totalInterest),color:"var(--err)" },
              { label:"Principal",      val:fmt(principal),    color:"var(--ok)"  },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
                padding:"var(--s2) 0", borderBottom:"1px solid var(--gb)" }}>
                <span style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>{r.label}</span>
                <span style={{ color:r.color, fontWeight:800, fontSize:r.size||"var(--md)" }}>{r.val}</span>
              </div>
            ))}
          </div>

          {/* Prepayment */}
          <div style={{ marginTop:"var(--s5)" }}>
            <label className="label">Prepayment: {fmt(prepay)}</label>
            <input type="range" min={0} max={principal*0.5} step={50000} value={prepay}
              onChange={e=>setPrepay(Number(e.target.value))}
              style={{ width:"100%", accentColor:"var(--ok)" }} />
            {prepay > 0 && (
              <div style={{ background:"var(--ok-bg)", border:"1px solid rgba(16,185,129,.3)",
                borderRadius:"var(--r2)", padding:"var(--s3)", marginTop:"var(--s2)",
                fontSize:"var(--sm)", color:"var(--ok)" }}>
                💰 Savings with prepayment: <strong>{fmt(savings)}</strong>
                <br />New EMI: <strong>{fmt(newEmi)}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Chart + schedule */}
        <div style={{ flex:1, minWidth:260 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"var(--s5)", marginBottom:"var(--s5)" }}>
            <PieChart principal={principal} interest={totalInterest} />
            <div>
              {[
                { label:"Principal", val:fmt(principal),    color:"var(--a2)" },
                { label:"Interest",  val:fmt(totalInterest),color:"var(--err)" },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", alignItems:"center", gap:"var(--s2)",
                  marginBottom:"var(--s2)" }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:r.color }} />
                  <span style={{ fontSize:"var(--xs)", color:"var(--t2)" }}>{r.label}</span>
                  <span style={{ fontSize:"var(--sm)", color:r.color, fontWeight:700 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginTop:"var(--s2)" }}>
                Interest: {((totalInterest/totalPayment)*100).toFixed(1)}% of total
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:"var(--s3)" }}>
            <div className="label">Amortization</div>
            <div style={{ display:"flex", gap:"var(--s2)" }}>
              {["monthly","yearly"].map(v => (
                <button key={v} className={`btn btn-sm ${scheduleView===v?"btn-primary":"btn-ghost"}`}
                  onClick={() => setScheduleView(v)}>
                  {v}
                </button>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={exportCSV}>⬇ CSV</button>
            </div>
          </div>

          <div style={{ maxHeight:280, overflowY:"auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{scheduleView==="yearly"?"Year":"Month"}</th>
                  <th>Principal</th><th>Interest</th><th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {(scheduleView==="yearly"?yearlySchedule:schedule.slice(0,24)).map((r,i) => (
                  <tr key={i}>
                    <td style={{ fontFamily:"var(--mono)", fontSize:"var(--xs)" }}>
                      {scheduleView==="yearly"?`Year ${r.year}`:`Month ${r.month}`}
                    </td>
                    <td style={{ color:"var(--ok)", fontFamily:"var(--mono)", fontSize:"var(--xs)" }}>
                      {fmt(r.principal)}
                    </td>
                    <td style={{ color:"var(--err)", fontFamily:"var(--mono)", fontSize:"var(--xs)" }}>
                      {fmt(r.interest)}
                    </td>
                    <td style={{ fontFamily:"var(--mono)", fontSize:"var(--xs)" }}>
                      {fmt(r.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
