/**
 * PROBLEM 16 — IT Support Ticket System
 * ─────────────────────────────────────────────────────────────
 * Asked at: ServiceNow, VMware, Broadcom
 *
 * Requirements:
 * - Create tickets with priority, category, description
 * - Ticket states: Open → In Progress → Resolved → Closed
 * - Assign to agents
 * - Add comments/updates to ticket thread
 * - Filter by status / priority / assignee
 * - SLA timer (P1: 1hr, P2: 4hr, P3: 8hr) — shows time remaining
 * - Bulk actions (assign, close, delete)
 * - Dashboard summary
 */

import { useState, useMemo, useEffect } from "react";

const PRIORITIES = { P1:"Critical", P2:"High", P3:"Medium", P4:"Low" };
const PRIORITY_COLORS = { P1:"var(--err)", P2:"var(--warn)", P3:"var(--info)", P4:"var(--ok)" };
const SLA_HOURS = { P1:1, P2:4, P3:8, P4:24 };
const CATEGORIES = ["Network","Hardware","Software","Access","Email","Other"];
const AGENTS = ["Alice","Bob","Charlie","Diana","Unassigned"];
const STATUSES = ["Open","In Progress","Resolved","Closed"];
const STATUS_COLORS = { Open:"var(--err)", "In Progress":"var(--warn)", Resolved:"var(--ok)", Closed:"var(--t3)" };

let ticketId = 1000;

function makeTicket(overrides = {}) {
  const priority = overrides.priority || "P2";
  return {
    id: `TKT-${ticketId++}`,
    title: overrides.title || "Sample ticket",
    description: overrides.description || "",
    category: overrides.category || "Software",
    priority,
    status: "Open",
    assignee: "Unassigned",
    createdAt: Date.now() - Math.random() * 3600000 * 2,
    comments: [],
    ...overrides,
  };
}

const INITIAL_TICKETS = [
  makeTicket({ title:"VPN not connecting",       priority:"P1", category:"Network",  assignee:"Alice",     status:"In Progress" }),
  makeTicket({ title:"Laptop screen flickering", priority:"P2", category:"Hardware", assignee:"Bob",       status:"Open"        }),
  makeTicket({ title:"Can't access SharePoint",  priority:"P3", category:"Access",   assignee:"Unassigned",status:"Open"        }),
  makeTicket({ title:"Outlook keeps crashing",   priority:"P2", category:"Email",    assignee:"Charlie",   status:"Resolved"    }),
  makeTicket({ title:"Printer offline",          priority:"P4", category:"Hardware", assignee:"Diana",     status:"Open"        }),
];

function SLABadge({ priority, createdAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(t);
  }, []);
  const slaMs   = SLA_HOURS[priority] * 3600000;
  const elapsed = now - createdAt;
  const remaining = slaMs - elapsed;
  const pct = Math.min(100, (elapsed / slaMs) * 100);
  const hrs = Math.max(0, Math.floor(remaining / 3600000));
  const mins = Math.max(0, Math.floor((remaining % 3600000) / 60000));
  const breached = remaining <= 0;
  return (
    <div style={{ fontSize:"var(--xs)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2,
        color: breached ? "var(--err)" : pct > 75 ? "var(--warn)" : "var(--t3)" }}>
        <span>SLA</span>
        <span>{breached ? "BREACHED" : `${hrs}h ${mins}m`}</span>
      </div>
      <div style={{ height:3, background:"var(--gb)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:2, width:`${pct}%`,
          background: breached ? "var(--err)" : pct > 75 ? "var(--warn)" : "var(--ok)",
          transition:"width 1s linear" }} />
      </div>
    </div>
  );
}

export default function SupportTicketSystem() {
  const [tickets,  setTickets]  = useState(INITIAL_TICKETS);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState({ title:"", category:"Software", priority:"P2", description:"" });
  const [comment,  setComment]  = useState("");
  const [filterStatus,   setFilterStatus]   = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterAssignee, setFilterAssignee] = useState("All");
  const [bulkSelected,   setBulkSelected]   = useState([]);
  const [bulkAssignee,   setBulkAssignee]   = useState("Alice");

  const submit = () => {
    if (!form.title.trim()) return;
    setTickets(t => [makeTicket(form), ...t]);
    setForm({ title:"", category:"Software", priority:"P2", description:"" });
  };

  const updateTicket = (id, changes) => {
    setTickets(t => t.map(x => x.id === id ? { ...x, ...changes } : x));
  };

  const addComment = (id) => {
    if (!comment.trim()) return;
    setTickets(t => t.map(x => x.id === id
      ? { ...x, comments: [...x.comments, { text:comment, at:new Date().toLocaleTimeString(), by:"You" }] }
      : x
    ));
    setComment("");
  };

  const bulkAction = (action) => {
    setTickets(t => t.map(x => {
      if (!bulkSelected.includes(x.id)) return x;
      if (action === "assign")  return { ...x, assignee: bulkAssignee };
      if (action === "close")   return { ...x, status: "Closed" };
      return x;
    }));
    if (action === "delete") setTickets(t => t.filter(x => !bulkSelected.includes(x.id)));
    setBulkSelected([]);
  };

  const filtered = useMemo(() => tickets.filter(t => {
    if (filterStatus   !== "All" && t.status   !== filterStatus)   return false;
    if (filterPriority !== "All" && t.priority !== filterPriority) return false;
    if (filterAssignee !== "All" && t.assignee !== filterAssignee) return false;
    return true;
  }), [tickets, filterStatus, filterPriority, filterAssignee]);

  const summary = useMemo(() => ({
    open:       tickets.filter(t => t.status === "Open").length,
    inProgress: tickets.filter(t => t.status === "In Progress").length,
    resolved:   tickets.filter(t => t.status === "Resolved").length,
    p1:         tickets.filter(t => t.priority === "P1" && t.status !== "Closed").length,
  }), [tickets]);

  const sel = tickets.find(t => t.id === selected);

  return (
    <div className="card">
      <h2 className="card-title">🎫 IT Support Ticket System</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at ServiceNow, VMware, Broadcom.</strong> Full ticket lifecycle,
        SLA timers, bulk actions, comment threads, priority/status/assignee filters.
      </p>

      {/* Summary */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"var(--s3)", marginBottom:"var(--s5)" }}>
        {[
          { label:"Open",        value:summary.open,       color:"var(--err)"  },
          { label:"In Progress", value:summary.inProgress, color:"var(--warn)" },
          { label:"Resolved",    value:summary.resolved,   color:"var(--ok)"   },
          { label:"P1 Active",   value:summary.p1,         color:"var(--err)"  },
        ].map(c => (
          <div key={c.label} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)", textAlign:"center" }}>
            <div style={{ fontSize:"var(--2xl)", fontWeight:800, color:c.color }}>{c.value}</div>
            <div style={{ fontSize:"var(--xs)", color:"var(--t3)", textTransform:"uppercase",
              letterSpacing:".06em" }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* ── Create ticket ── */}
        <div style={{ minWidth:240, flex:"0 0 240px" }}>
          <div className="label" style={{ marginBottom:"var(--s3)" }}>New Ticket</div>
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)", display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
            <input className="input" placeholder="Title..." value={form.title}
              onChange={e => setForm(f => ({ ...f, title:e.target.value }))} />
            <select className="select" value={form.category}
              onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="select" value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority:e.target.value }))}>
              {Object.entries(PRIORITIES).map(([k,v]) => <option key={k} value={k}>{k} — {v}</option>)}
            </select>
            <textarea className="textarea" style={{ minHeight:70 }} placeholder="Description..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description:e.target.value }))} />
            <button className="btn btn-primary" onClick={submit}>Create Ticket</button>
          </div>
        </div>

        {/* ── Ticket list ── */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Filters */}
          <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s3)", flexWrap:"wrap" }}>
            {[
              { label:"Status",   val:filterStatus,   set:setFilterStatus,   opts:["All",...STATUSES] },
              { label:"Priority", val:filterPriority, set:setFilterPriority, opts:["All","P1","P2","P3","P4"] },
              { label:"Assignee", val:filterAssignee, set:setFilterAssignee, opts:["All",...AGENTS] },
            ].map(f => (
              <select key={f.label} className="select" style={{ width:"auto" }}
                value={f.val} onChange={e => f.set(e.target.value)}>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            ))}
          </div>

          {/* Bulk actions */}
          {bulkSelected.length > 0 && (
            <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s3)",
              background:"var(--abg)", border:"1px solid rgba(124,58,237,.3)",
              borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)", flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:"var(--sm)", color:"var(--a2)", fontWeight:700 }}>
                {bulkSelected.length} selected
              </span>
              <select className="select" style={{ width:"auto" }} value={bulkAssignee}
                onChange={e => setBulkAssignee(e.target.value)}>
                {AGENTS.filter(a => a !== "Unassigned").map(a => <option key={a}>{a}</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => bulkAction("assign")}>Assign</button>
              <button className="btn btn-warn btn-sm"    onClick={() => bulkAction("close")}>Close</button>
              <button className="btn btn-danger btn-sm"  onClick={() => bulkAction("delete")}>Delete</button>
              <button className="btn btn-ghost btn-sm"   onClick={() => setBulkSelected([])}>Cancel</button>
            </div>
          )}

          {/* Tickets */}
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)" }}>
            {filtered.map(t => (
              <div key={t.id}>
                <div style={{
                  background: selected===t.id ? "rgba(124,58,237,0.08)" : "var(--glass2)",
                  border:`1px solid ${selected===t.id?"var(--a)":bulkSelected.includes(t.id)?"var(--a2)":"var(--gb)"}`,
                  borderLeft:`4px solid ${PRIORITY_COLORS[t.priority]}`,
                  borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)",
                  cursor:"pointer", transition:"all var(--tr)"
                }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"var(--s3)" }}>
                    <input type="checkbox" checked={bulkSelected.includes(t.id)}
                      onChange={e => { e.stopPropagation();
                        setBulkSelected(b => b.includes(t.id) ? b.filter(x=>x!==t.id) : [...b,t.id]); }}
                      style={{ accentColor:"var(--a2)", marginTop:3 }} />

                    <div style={{ flex:1, minWidth:0 }} onClick={() => setSelected(selected===t.id?null:t.id)}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s1)" }}>
                        <span style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{t.title}</span>
                        <div style={{ display:"flex", gap:"var(--s2)", flexShrink:0 }}>
                          <span className="badge" style={{ background:PRIORITY_COLORS[t.priority]+"22",
                            color:PRIORITY_COLORS[t.priority], border:`1px solid ${PRIORITY_COLORS[t.priority]}44` }}>
                            {t.priority}
                          </span>
                          <span className="badge" style={{ background:STATUS_COLORS[t.status]+"22",
                            color:STATUS_COLORS[t.status], border:`1px solid ${STATUS_COLORS[t.status]}44` }}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:"var(--s4)", fontSize:"var(--xs)", color:"var(--t3)",
                        marginBottom:"var(--s2)" }}>
                        <span>{t.id}</span>
                        <span>{t.category}</span>
                        <span>👤 {t.assignee}</span>
                        <span>💬 {t.comments.length}</span>
                      </div>
                      {t.status !== "Closed" && t.status !== "Resolved" && (
                        <SLABadge priority={t.priority} createdAt={t.createdAt} />
                      )}
                    </div>
                  </div>

                  {/* Expanded */}
                  {selected === t.id && (
                    <div style={{ marginTop:"var(--s4)", borderTop:"1px solid var(--gb)", paddingTop:"var(--s4)" }}
                      onClick={e => e.stopPropagation()}>
                      {t.description && (
                        <p style={{ marginBottom:"var(--s4)", fontSize:"var(--sm)" }}>{t.description}</p>
                      )}

                      <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s4)", flexWrap:"wrap" }}>
                        <select className="select" style={{ width:"auto" }} value={t.status}
                          onChange={e => updateTicket(t.id, { status:e.target.value })}>
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <select className="select" style={{ width:"auto" }} value={t.assignee}
                          onChange={e => updateTicket(t.id, { assignee:e.target.value })}>
                          {AGENTS.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </div>

                      {/* Comments */}
                      {t.comments.map((c, i) => (
                        <div key={i} style={{ background:"var(--glass)", border:"1px solid var(--gb)",
                          borderRadius:"var(--r1)", padding:"var(--s2) var(--s3)", marginBottom:"var(--s2)",
                          fontSize:"var(--xs)" }}>
                          <span style={{ color:"var(--a2)", fontWeight:700 }}>{c.by}</span>
                          <span style={{ color:"var(--t3)", marginLeft:"var(--s2)" }}>{c.at}</span>
                          <div style={{ color:"var(--t1)", marginTop:2 }}>{c.text}</div>
                        </div>
                      ))}

                      <div style={{ display:"flex", gap:"var(--s2)" }}>
                        <input className="input" placeholder="Add comment..."
                          value={comment} onChange={e => setComment(e.target.value)}
                          onKeyDown={e => e.key==="Enter" && addComment(t.id)} />
                        <button className="btn btn-primary btn-sm" onClick={() => addComment(t.id)}>Post</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
