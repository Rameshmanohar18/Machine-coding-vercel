/**
 * PROBLEM 14 — Multi-Level Approval Workflow
 * ─────────────────────────────────────────────────────────────
 * Asked at: ServiceNow, VMware, Broadcom, JP Morgan
 *
 * Requirements:
 * - Submit a request (title, type, amount, justification)
 * - Multi-level approval chain: Manager → Director → CFO (based on amount)
 * - Each approver can Approve / Reject with comments
 * - Status timeline showing each step
 * - Escalation: auto-escalate if pending > 3s (demo)
 * - Email notification simulation
 * - Full audit trail
 */

import { useState, useEffect, useCallback } from "react";

const APPROVAL_LEVELS = [
  { role:"Manager",  threshold:0,      color:"var(--info)" },
  { role:"Director", threshold:50000,  color:"var(--a2)"   },
  { role:"CFO",      threshold:200000, color:"var(--warn)"  },
];

const REQUEST_TYPES = ["Software License","Hardware Purchase","Travel","Training","Vendor Contract","Other"];

const STATUS_COLORS = {
  pending:  "var(--warn)",
  approved: "var(--ok)",
  rejected: "var(--err)",
  escalated:"var(--a2)",
};

let reqId = 100;

function getRequiredLevels(amount) {
  return APPROVAL_LEVELS.filter(l => amount >= l.threshold);
}

export default function ApprovalWorkflow() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ title:"", type:"Software License", amount:"", justification:"" });
  const [errors, setErrors] = useState({});
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((msg) => {
    const id = Date.now();
    setNotifications(n => [{ id, msg }, ...n].slice(0, 5));
    setTimeout(() => setNotifications(n => n.filter(x => x.id !== id)), 4000);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim())        e.title = "Required";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Enter valid amount";
    if (!form.justification.trim()) e.justification = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submitRequest = () => {
    if (!validate()) return;
    const amount = Number(form.amount);
    const levels = getRequiredLevels(amount);
    const req = {
      id: reqId++,
      ...form, amount,
      status: "pending",
      createdAt: new Date().toISOString(),
      levels: levels.map(l => ({ ...l, status:"pending", comment:"", decidedAt:null })),
      currentLevel: 0,
      auditTrail: [{ action:"Submitted", by:"You", at: new Date().toLocaleTimeString(), comment:"" }],
    };
    setRequests(r => [req, ...r]);
    setForm({ title:"", type:"Software License", amount:"", justification:"" });
    notify(`📨 Request "${req.title}" submitted — awaiting ${levels[0].role} approval`);
  };

  const decide = (reqId, decision) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== reqId) return req;
      const levels = [...req.levels];
      const ci = req.currentLevel;
      levels[ci] = { ...levels[ci], status: decision, comment, decidedAt: new Date().toLocaleTimeString() };

      const trail = [...req.auditTrail, {
        action: decision === "approved" ? "Approved" : "Rejected",
        by: levels[ci].role, at: new Date().toLocaleTimeString(), comment
      }];

      let newStatus = req.status;
      let nextLevel = ci;

      if (decision === "rejected") {
        newStatus = "rejected";
        notify(`❌ Request "${req.title}" rejected by ${levels[ci].role}`);
      } else if (ci + 1 < levels.length) {
        nextLevel = ci + 1;
        newStatus = "pending";
        notify(`✅ Approved by ${levels[ci].role} → now with ${levels[ci+1].role}`);
      } else {
        newStatus = "approved";
        notify(`🎉 Request "${req.title}" fully approved!`);
      }

      return { ...req, levels, currentLevel: nextLevel, status: newStatus, auditTrail: trail };
    }));
    setComment("");
    setSelected(null);
  };

  const sel = requests.find(r => r.id === selected);

  return (
    <div className="card">
      <h2 className="card-title">✅ Multi-Level Approval Workflow</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at ServiceNow, VMware, JP Morgan.</strong> Submit requests with dynamic
        approval chains based on amount. Each level approves/rejects with comments. Full audit trail.
      </p>

      {/* Notifications */}
      <div style={{ position:"fixed", top:20, right:20, zIndex:9999,
        display:"flex", flexDirection:"column", gap:"var(--s2)", pointerEvents:"none" }}>
        {notifications.map(n => (
          <div key={n.id} style={{ background:"rgba(13,16,37,.95)", backdropFilter:"blur(16px)",
            border:"1px solid var(--gb2)", borderRadius:"var(--r2)", padding:"10px 16px",
            fontSize:"var(--sm)", color:"var(--t1)", boxShadow:"var(--sh2)",
            animation:"slideUp .2s ease" }}>
            {n.msg}
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* ── Submit form ── */}
        <div style={{ minWidth:280, flex:"0 0 280px" }}>
          <div className="label" style={{ marginBottom:"var(--s3)" }}>New Request</div>
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            {[
              { key:"title",         label:"Request Title",   type:"text"   },
              { key:"type",          label:"Type",            type:"select" },
              { key:"amount",        label:"Amount (₹)",      type:"number" },
              { key:"justification", label:"Justification",   type:"textarea"},
            ].map(f => (
              <div key={f.key} className="form-row" style={{ marginBottom:"var(--s3)" }}>
                <label className="label">{f.label}</label>
                {f.type === "select"
                  ? <select className="select" value={form[f.key]}
                      onChange={e => setForm(x => ({ ...x, [f.key]:e.target.value }))}>
                      {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  : f.type === "textarea"
                    ? <textarea className="textarea" style={{ minHeight:80 }} value={form[f.key]}
                        onChange={e => setForm(x => ({ ...x, [f.key]:e.target.value }))} />
                    : <input className="input" type={f.type} value={form[f.key]}
                        onChange={e => setForm(x => ({ ...x, [f.key]:e.target.value }))} />
                }
                {errors[f.key] && <span style={{ color:"var(--err)", fontSize:"var(--xs)" }}>{errors[f.key]}</span>}
              </div>
            ))}

            {form.amount && Number(form.amount) > 0 && (
              <div style={{ background:"var(--abg)", border:"1px solid rgba(124,58,237,.3)",
                borderRadius:"var(--r1)", padding:"var(--s3)", marginBottom:"var(--s3)",
                fontSize:"var(--xs)", color:"var(--a2)" }}>
                Approval chain: {getRequiredLevels(Number(form.amount)).map(l => l.role).join(" → ")}
              </div>
            )}

            <button className="btn btn-primary" style={{ width:"100%" }} onClick={submitRequest}>
              Submit Request
            </button>
          </div>
        </div>

        {/* ── Request list ── */}
        <div style={{ flex:1, minWidth:0 }}>
          <div className="label" style={{ marginBottom:"var(--s3)" }}>
            Requests ({requests.length})
          </div>

          {requests.length === 0 && (
            <div style={{ color:"var(--t3)", fontSize:"var(--sm)", padding:"var(--s6)", textAlign:"center" }}>
              No requests yet. Submit one to get started.
            </div>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
            {requests.map(req => (
              <div key={req.id} style={{
                background:"var(--glass2)", border:`1px solid ${selected===req.id?"var(--a)":"var(--gb)"}`,
                borderRadius:"var(--r2)", padding:"var(--s4)", cursor:"pointer",
                transition:"all var(--tr)"
              }} onClick={() => setSelected(selected===req.id ? null : req.id)}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s2)" }}>
                  <span style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{req.title}</span>
                  <span className={`badge badge-${req.status==="approved"?"ok":req.status==="rejected"?"err":"warn"}`}>
                    {req.status}
                  </span>
                </div>
                <div style={{ display:"flex", gap:"var(--s4)", fontSize:"var(--xs)", color:"var(--t3)" }}>
                  <span>{req.type}</span>
                  <span style={{ color:"var(--ok)", fontWeight:700 }}>₹{req.amount.toLocaleString()}</span>
                </div>

                {/* Level progress */}
                <div style={{ display:"flex", gap:"var(--s2)", marginTop:"var(--s3)" }}>
                  {req.levels.map((l, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:"var(--s1)" }}>
                      {i > 0 && <span style={{ color:"var(--t3)", fontSize:10 }}>→</span>}
                      <span style={{
                        padding:"2px 8px", borderRadius:"var(--pill)", fontSize:"var(--xs)", fontWeight:700,
                        background: l.status==="approved" ? "var(--ok-bg)" : l.status==="rejected" ? "var(--err-bg)" : "var(--glass2)",
                        color: l.status==="approved" ? "var(--ok)" : l.status==="rejected" ? "var(--err)" : l.color,
                        border:`1px solid ${l.status==="approved"?"rgba(16,185,129,.3)":l.status==="rejected"?"rgba(239,68,68,.3)":"var(--gb)"}`
                      }}>
                        {l.role} {l.status==="approved"?"✓":l.status==="rejected"?"✗":"…"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Expanded: action panel */}
                {selected === req.id && req.status === "pending" && (
                  <div style={{ marginTop:"var(--s4)", borderTop:"1px solid var(--gb)", paddingTop:"var(--s4)" }}
                    onClick={e => e.stopPropagation()}>
                    <div className="label" style={{ marginBottom:"var(--s2)" }}>
                      Acting as: {req.levels[req.currentLevel]?.role}
                    </div>
                    <textarea className="textarea" style={{ minHeight:60, marginBottom:"var(--s3)" }}
                      placeholder="Add comment (optional)..."
                      value={comment} onChange={e => setComment(e.target.value)} />
                    <div style={{ display:"flex", gap:"var(--s2)" }}>
                      <button className="btn btn-success" onClick={() => decide(req.id, "approved")}>
                        ✅ Approve
                      </button>
                      <button className="btn btn-danger" onClick={() => decide(req.id, "rejected")}>
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Audit trail */}
                {selected === req.id && (
                  <div style={{ marginTop:"var(--s4)", borderTop:"1px solid var(--gb)", paddingTop:"var(--s3)" }}
                    onClick={e => e.stopPropagation()}>
                    <div className="label" style={{ marginBottom:"var(--s2)" }}>Audit Trail</div>
                    {req.auditTrail.map((a, i) => (
                      <div key={i} style={{ display:"flex", gap:"var(--s3)", fontSize:"var(--xs)",
                        color:"var(--t2)", padding:"4px 0", borderBottom:"1px solid var(--gb)" }}>
                        <span style={{ color:"var(--t3)", minWidth:60 }}>{a.at}</span>
                        <span style={{ color:"var(--a2)", fontWeight:700 }}>{a.by}</span>
                        <span>{a.action}</span>
                        {a.comment && <span style={{ color:"var(--t3)" }}>"{a.comment}"</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
