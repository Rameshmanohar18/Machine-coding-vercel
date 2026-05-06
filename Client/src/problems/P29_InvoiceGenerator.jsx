/**
 * PROBLEM 29 — Invoice Generator
 * Asked at: Intuit (QuickBooks), Zoho Books, Freshbooks, Walmart
 *
 * Requirements:
 * - Add line items (description, qty, rate, tax%)
 * - Auto-calculate subtotal, tax, discount, total
 * - Client info form
 * - Invoice number + date
 * - Multiple tax rates (GST, VAT)
 * - Discount (% or flat)
 * - Print / Download as HTML
 * - Invoice status: Draft / Sent / Paid / Overdue
 * - Due date with overdue detection
 */

import { useState, useMemo, useRef } from "react";

let lineId = 1;
const mkLine = () => ({ id:lineId++, desc:"", qty:1, rate:0, tax:18 });

const TAX_RATES = [0, 5, 12, 18, 28];

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState({
    number: `INV-${String(Date.now()).slice(-6)}`,
    date:   new Date().toISOString().split("T")[0],
    due:    new Date(Date.now()+30*86400000).toISOString().split("T")[0],
    status: "Draft",
    from:   { name:"Your Company", email:"billing@company.com", address:"123 Business St, City" },
    to:     { name:"", email:"", address:"" },
    lines:  [{ id:lineId++, desc:"Web Development Services", qty:10, rate:5000, tax:18 }],
    discount:     { type:"percent", value:0 },
    notes:        "Thank you for your business!",
    currency:     "₹",
  });

  const updateLine = (id, key, val) => {
    setInvoice(inv => ({
      ...inv,
      lines: inv.lines.map(l => l.id===id ? { ...l, [key]:val } : l)
    }));
  };

  const addLine    = () => setInvoice(inv => ({ ...inv, lines:[...inv.lines, mkLine()] }));
  const removeLine = (id) => setInvoice(inv => ({ ...inv, lines:inv.lines.filter(l=>l.id!==id) }));

  const calc = useMemo(() => {
    const subtotal = invoice.lines.reduce((s,l) => s + l.qty*l.rate, 0);
    const taxTotal = invoice.lines.reduce((s,l) => s + l.qty*l.rate*(l.tax/100), 0);
    const discAmt  = invoice.discount.type==="percent"
      ? subtotal * (invoice.discount.value/100)
      : invoice.discount.value;
    const total = subtotal + taxTotal - discAmt;
    return { subtotal, taxTotal, discAmt, total };
  }, [invoice.lines, invoice.discount]);

  const isOverdue = invoice.status !== "Paid" && new Date(invoice.due) < new Date();
  const STATUS_COLORS = { Draft:"var(--t3)", Sent:"var(--info)", Paid:"var(--ok)", Overdue:"var(--err)" };

  const printInvoice = () => {
    const w = window.open("","_blank");
    w.document.write(`<html><head><title>Invoice ${invoice.number}</title>
      <style>body{font-family:sans-serif;padding:40px;color:#111}
      table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;border:1px solid #ddd;text-align:left}
      th{background:#f5f5f5}.total{font-size:1.2em;font-weight:bold}</style></head><body>
      <h1>INVOICE</h1><p><strong>${invoice.number}</strong> | ${invoice.date}</p>
      <p>From: ${invoice.from.name}</p><p>To: ${invoice.to.name||"Client"}</p>
      <table><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Tax</th><th>Amount</th></tr>
      ${invoice.lines.map(l=>`<tr><td>${l.desc}</td><td>${l.qty}</td><td>${invoice.currency}${l.rate}</td>
        <td>${l.tax}%</td><td>${invoice.currency}${(l.qty*l.rate).toLocaleString()}</td></tr>`).join("")}
      </table><br>
      <p>Subtotal: ${invoice.currency}${calc.subtotal.toLocaleString()}</p>
      <p>Tax: ${invoice.currency}${calc.taxTotal.toLocaleString()}</p>
      <p class="total">Total: ${invoice.currency}${calc.total.toLocaleString()}</p>
      <p>${invoice.notes}</p></body></html>`);
    w.print();
  };

  return (
    <div className="card">
      <h2 className="card-title">🧾 Invoice Generator</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Intuit, Zoho, Freshbooks.</strong> Line items with auto-calculation,
        GST/tax rates, discount, client info, status tracking, print/download.
      </p>

      {/* Header row */}
      <div style={{ display:"flex", gap:"var(--s4)", marginBottom:"var(--s5)", flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ flex:1, minWidth:200 }}>
          <label className="label">Invoice #</label>
          <input className="input" value={invoice.number}
            onChange={e => setInvoice(i => ({ ...i, number:e.target.value }))} />
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={invoice.date}
            onChange={e => setInvoice(i => ({ ...i, date:e.target.value }))} />
        </div>
        <div>
          <label className="label">Due Date</label>
          <input className="input" type="date" value={invoice.due}
            onChange={e => setInvoice(i => ({ ...i, due:e.target.value }))} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="select" style={{ width:"auto" }}
            value={isOverdue && invoice.status!=="Paid" ? "Overdue" : invoice.status}
            onChange={e => setInvoice(i => ({ ...i, status:e.target.value }))}>
            {["Draft","Sent","Paid","Overdue"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <span className="badge" style={{
          background:STATUS_COLORS[isOverdue&&invoice.status!=="Paid"?"Overdue":invoice.status]+"22",
          color:STATUS_COLORS[isOverdue&&invoice.status!=="Paid"?"Overdue":invoice.status],
          border:`1px solid ${STATUS_COLORS[isOverdue&&invoice.status!=="Paid"?"Overdue":invoice.status]}44`,
          alignSelf:"flex-end", marginBottom:2
        }}>
          {isOverdue && invoice.status!=="Paid" ? "OVERDUE" : invoice.status.toUpperCase()}
        </span>
      </div>

      {/* From / To */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--s5)", marginBottom:"var(--s5)" }}>
        {[
          { key:"from", label:"From (Your Company)" },
          { key:"to",   label:"Bill To (Client)"    },
        ].map(({ key, label }) => (
          <div key={key} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>{label}</div>
            {["name","email","address"].map(f => (
              <input key={f} className="input" style={{ marginBottom:"var(--s2)" }}
                placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
                value={invoice[key][f]}
                onChange={e => setInvoice(i => ({ ...i, [key]:{ ...i[key], [f]:e.target.value } }))} />
            ))}
          </div>
        ))}
      </div>

      {/* Line items */}
      <div style={{ marginBottom:"var(--s5)" }}>
        <div className="label" style={{ marginBottom:"var(--s3)" }}>Line Items</div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"var(--sm)" }}>
            <thead>
              <tr>
                {["Description","Qty","Rate (₹)","Tax %","Amount",""].map(h => (
                  <th key={h} style={{ background:"rgba(124,58,237,.12)", padding:"8px 12px",
                    textAlign:"left", fontSize:"var(--xs)", fontWeight:700, letterSpacing:".06em",
                    textTransform:"uppercase", color:"var(--a2)", borderBottom:"1px solid var(--gb)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map(l => (
                <tr key={l.id}>
                  <td style={{ padding:"6px 8px", borderBottom:"1px solid var(--gb)" }}>
                    <input className="input" style={{ padding:"6px 10px" }} value={l.desc}
                      onChange={e => updateLine(l.id,"desc",e.target.value)} placeholder="Description" />
                  </td>
                  <td style={{ padding:"6px 8px", borderBottom:"1px solid var(--gb)", width:70 }}>
                    <input className="input" style={{ padding:"6px 10px" }} type="number" min={1} value={l.qty}
                      onChange={e => updateLine(l.id,"qty",Number(e.target.value))} />
                  </td>
                  <td style={{ padding:"6px 8px", borderBottom:"1px solid var(--gb)", width:110 }}>
                    <input className="input" style={{ padding:"6px 10px" }} type="number" min={0} value={l.rate}
                      onChange={e => updateLine(l.id,"rate",Number(e.target.value))} />
                  </td>
                  <td style={{ padding:"6px 8px", borderBottom:"1px solid var(--gb)", width:90 }}>
                    <select className="select" style={{ padding:"6px 10px" }} value={l.tax}
                      onChange={e => updateLine(l.id,"tax",Number(e.target.value))}>
                      {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td style={{ padding:"6px 12px", borderBottom:"1px solid var(--gb)",
                    fontWeight:700, color:"var(--ok)", fontFamily:"var(--mono)", width:110 }}>
                    ₹{(l.qty*l.rate).toLocaleString()}
                  </td>
                  <td style={{ padding:"6px 8px", borderBottom:"1px solid var(--gb)" }}>
                    <button className="btn btn-danger btn-sm" onClick={() => removeLine(l.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop:"var(--s3)" }} onClick={addLine}>
          + Add Line Item
        </button>
      </div>

      {/* Totals + notes */}
      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200 }}>
          <label className="label">Notes</label>
          <textarea className="textarea" style={{ minHeight:80 }} value={invoice.notes}
            onChange={e => setInvoice(i => ({ ...i, notes:e.target.value }))} />

          <div style={{ display:"flex", gap:"var(--s3)", marginTop:"var(--s4)" }}>
            <button className="btn btn-primary" onClick={printInvoice}>🖨 Print / Download</button>
            <button className="btn btn-ghost" onClick={() => setInvoice(i => ({ ...i, status:"Sent" }))}>
              📧 Mark as Sent
            </button>
          </div>
        </div>

        <div style={{ minWidth:220, flex:"0 0 220px" }}>
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            {/* Discount */}
            <div style={{ marginBottom:"var(--s4)" }}>
              <label className="label">Discount</label>
              <div style={{ display:"flex", gap:"var(--s2)" }}>
                <select className="select" style={{ width:"auto" }}
                  value={invoice.discount.type}
                  onChange={e => setInvoice(i => ({ ...i, discount:{ ...i.discount, type:e.target.value } }))}>
                  <option value="percent">%</option>
                  <option value="flat">₹ Flat</option>
                </select>
                <input className="input" type="number" min={0} value={invoice.discount.value}
                  onChange={e => setInvoice(i => ({ ...i, discount:{ ...i.discount, value:Number(e.target.value) } }))} />
              </div>
            </div>

            {[
              { label:"Subtotal", val:calc.subtotal, color:"var(--t1)" },
              { label:"Tax",      val:calc.taxTotal, color:"var(--warn)" },
              { label:"Discount", val:-calc.discAmt, color:"var(--ok)" },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
                padding:"var(--s2) 0", borderBottom:"1px solid var(--gb)", fontSize:"var(--sm)" }}>
                <span style={{ color:"var(--t2)" }}>{r.label}</span>
                <span style={{ color:r.color, fontWeight:600, fontFamily:"var(--mono)" }}>
                  {r.val < 0 ? "-" : ""}₹{Math.abs(r.val).toLocaleString()}
                </span>
              </div>
            ))}

            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"var(--s3)",
              marginTop:"var(--s2)" }}>
              <span style={{ fontWeight:800, color:"var(--t1)", fontSize:"var(--lg)" }}>Total</span>
              <span style={{ fontWeight:800, color:"var(--ok)", fontSize:"var(--xl)", fontFamily:"var(--mono)" }}>
                ₹{calc.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
