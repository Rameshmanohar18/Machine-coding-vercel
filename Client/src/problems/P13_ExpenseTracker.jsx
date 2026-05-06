/**
 * PROBLEM 13 — Expense Tracker with Budget Alerts
 * ─────────────────────────────────────────────────────────────
 * Asked at: Intuit (TurboTax/QuickBooks team), JP Morgan, Wells Fargo
 *
 * Requirements:
 * - Add/edit/delete transactions (income & expense)
 * - Category tagging (Food, Travel, Bills, Salary, etc.)
 * - Monthly budget per category
 * - Visual budget usage bars — alert when >80%
 * - Running balance (income - expenses)
 * - Filter by month / category / type
 * - Summary cards: total income, total expense, net balance
 * - Sort by date / amount
 */

import { useState, useMemo } from "react";

const CATEGORIES = ["Salary","Freelance","Food","Travel","Bills","Shopping","Health","Entertainment","Other"];
const CAT_ICONS  = { Salary:"💼", Freelance:"💻", Food:"🍔", Travel:"✈️", Bills:"📄",
                     Shopping:"🛍", Health:"🏥", Entertainment:"🎬", Other:"📦" };

const BUDGETS_DEFAULT = { Food:5000, Travel:8000, Bills:3000, Shopping:4000,
                          Health:2000, Entertainment:2000, Other:1000 };

const INITIAL_TXN = [
  { id:1,  type:"income",  category:"Salary",        amount:80000, desc:"Monthly salary",    date:"2024-01-01" },
  { id:2,  type:"expense", category:"Food",           amount:3200,  desc:"Groceries",         date:"2024-01-03" },
  { id:3,  type:"expense", category:"Bills",          amount:2100,  desc:"Electricity bill",  date:"2024-01-05" },
  { id:4,  type:"income",  category:"Freelance",      amount:15000, desc:"Client project",    date:"2024-01-10" },
  { id:5,  type:"expense", category:"Travel",         amount:6500,  desc:"Weekend trip",      date:"2024-01-12" },
  { id:6,  type:"expense", category:"Shopping",       amount:3800,  desc:"Clothes",           date:"2024-01-15" },
  { id:7,  type:"expense", category:"Entertainment",  amount:1200,  desc:"Netflix + Spotify", date:"2024-01-18" },
  { id:8,  type:"expense", category:"Health",         amount:800,   desc:"Gym membership",    date:"2024-01-20" },
];

let nextId = 20;

const EMPTY_FORM = { type:"expense", category:"Food", amount:"", desc:"", date: new Date().toISOString().split("T")[0] };

export default function ExpenseTracker() {
  const [txns,    setTxns]    = useState(INITIAL_TXN);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [errors,  setErrors]  = useState({});
  const [filterCat,  setFilterCat]  = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [sortBy,     setSortBy]     = useState("date");
  const [budgets,    setBudgets]    = useState(BUDGETS_DEFAULT);

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    if (!form.desc.trim()) e.desc = "Description required";
    if (!form.date) e.date = "Date required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    if (editing) {
      setTxns(t => t.map(x => x.id === editing ? { ...x, ...form, amount: Number(form.amount) } : x));
      setEditing(null);
    } else {
      setTxns(t => [...t, { ...form, id: nextId++, amount: Number(form.amount) }]);
    }
    setForm(EMPTY_FORM);
  };

  const startEdit = (txn) => {
    setEditing(txn.id);
    setForm({ type: txn.type, category: txn.category, amount: String(txn.amount), desc: txn.desc, date: txn.date });
  };

  const deleteTxn = (id) => setTxns(t => t.filter(x => x.id !== id));

  const filtered = useMemo(() => {
    let list = txns.filter(t => {
      if (filterCat  !== "All" && t.category !== filterCat)  return false;
      if (filterType !== "All" && t.type     !== filterType) return false;
      return true;
    });
    list.sort((a, b) => sortBy === "date"
      ? new Date(b.date) - new Date(a.date)
      : b.amount - a.amount
    );
    return list;
  }, [txns, filterCat, filterType, sortBy]);

  const totalIncome  = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance      = totalIncome - totalExpense;

  const catSpend = useMemo(() => {
    const map = {};
    txns.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [txns]);

  return (
    <div className="card">
      <h2 className="card-title">💰 Expense Tracker</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Intuit, JP Morgan, Wells Fargo.</strong> Add/edit/delete transactions,
        category budgets with alert bars, summary cards, filter + sort.
      </p>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"var(--s3)", marginBottom:"var(--s6)" }}>
        {[
          { label:"Total Income",  value:`₹${totalIncome.toLocaleString()}`,  color:"var(--ok)"  },
          { label:"Total Expense", value:`₹${totalExpense.toLocaleString()}`, color:"var(--err)" },
          { label:"Net Balance",   value:`₹${balance.toLocaleString()}`,      color: balance >= 0 ? "var(--ok)" : "var(--err)" },
        ].map(c => (
          <div key={c.label} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            <div className="label">{c.label}</div>
            <div style={{ fontSize:"var(--xl)", fontWeight:800, color:c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* ── Left: Form + Budget ── */}
        <div style={{ minWidth:260, flex:"0 0 260px" }}>
          {/* Form */}
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s5)" }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>
              {editing ? "Edit Transaction" : "Add Transaction"}
            </div>

            <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s3)" }}>
              {["income","expense"].map(t => (
                <button key={t}
                  className={`btn btn-sm ${form.type === t ? (t==="income"?"btn-success":"btn-danger") : "btn-ghost"}`}
                  onClick={() => setForm(f => ({ ...f, type:t }))}>
                  {t === "income" ? "💚 Income" : "🔴 Expense"}
                </button>
              ))}
            </div>

            {[
              { key:"category", label:"Category", type:"select" },
              { key:"amount",   label:"Amount (₹)", type:"number" },
              { key:"desc",     label:"Description", type:"text" },
              { key:"date",     label:"Date", type:"date" },
            ].map(f => (
              <div key={f.key} className="form-row" style={{ marginBottom:"var(--s3)" }}>
                <label className="label">{f.label}</label>
                {f.type === "select"
                  ? <select className="select" value={form[f.key]}
                      onChange={e => setForm(x => ({ ...x, [f.key]:e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  : <input className="input" type={f.type} value={form[f.key]}
                      onChange={e => setForm(x => ({ ...x, [f.key]:e.target.value }))} />
                }
                {errors[f.key] && <span style={{ color:"var(--err)", fontSize:"var(--xs)" }}>{errors[f.key]}</span>}
              </div>
            ))}

            <div style={{ display:"flex", gap:"var(--s2)" }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={submit}>
                {editing ? "Update" : "Add"}
              </button>
              {editing && <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(null); setForm(EMPTY_FORM); }}>Cancel</button>}
            </div>
          </div>

          {/* Budget bars */}
          <div className="label" style={{ marginBottom:"var(--s3)" }}>Budget Usage</div>
          {Object.entries(BUDGETS_DEFAULT).map(([cat, budget]) => {
            const spent = catSpend[cat] || 0;
            const pct   = Math.min(100, (spent / budget) * 100);
            const over  = pct >= 80;
            return (
              <div key={cat} style={{ marginBottom:"var(--s3)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--xs)",
                  color: over ? "var(--warn)" : "var(--t2)", marginBottom:4 }}>
                  <span>{CAT_ICONS[cat]} {cat}</span>
                  <span>₹{spent.toLocaleString()} / ₹{budget.toLocaleString()}</span>
                </div>
                <div style={{ height:6, background:"var(--gb)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, width:`${pct}%`,
                    background: pct >= 100 ? "var(--err)" : pct >= 80 ? "var(--warn)" : "var(--ok)",
                    transition:"width .4s ease" }} />
                </div>
                {over && <div style={{ fontSize:"var(--xs)", color:"var(--warn)", marginTop:2 }}>
                  ⚠ {pct >= 100 ? "Over budget!" : "Near limit"}
                </div>}
              </div>
            );
          })}
        </div>

        {/* ── Right: Transaction list ── */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)", flexWrap:"wrap" }}>
            <select className="select" style={{ width:"auto" }} value={filterType}
              onChange={e => setFilterType(e.target.value)}>
              <option>All</option><option value="income">Income</option><option value="expense">Expense</option>
            </select>
            <select className="select" style={{ width:"auto" }} value={filterCat}
              onChange={e => setFilterCat(e.target.value)}>
              <option>All</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <div style={{ display:"flex", gap:"var(--s1)", marginLeft:"auto" }}>
              {["date","amount"].map(s => (
                <button key={s} className={`btn btn-sm ${sortBy===s?"btn-primary":"btn-ghost"}`}
                  onClick={() => setSortBy(s)}>
                  Sort: {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)" }}>
            {filtered.map(t => (
              <div key={t.id} style={{
                display:"flex", alignItems:"center", gap:"var(--s3)",
                background:"var(--glass2)", border:"1px solid var(--gb)",
                borderLeft:`3px solid ${t.type==="income"?"var(--ok)":"var(--err)"}`,
                borderRadius:"var(--r2)", padding:"10px 14px"
              }}>
                <span style={{ fontSize:20 }}>{CAT_ICONS[t.category]}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {t.desc}
                  </div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                    {t.category} · {t.date}
                  </div>
                </div>
                <span style={{ fontWeight:800, color:t.type==="income"?"var(--ok)":"var(--err)",
                  fontSize:"var(--md)", flexShrink:0 }}>
                  {t.type==="income"?"+":"-"}₹{t.amount.toLocaleString()}
                </span>
                <div style={{ display:"flex", gap:"var(--s1)" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => startEdit(t)}>✏</button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteTxn(t.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
