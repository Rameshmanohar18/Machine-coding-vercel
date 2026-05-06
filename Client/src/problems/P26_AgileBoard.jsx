/**
 * PROBLEM 26 — Agile Sprint Board
 * Asked at: Atlassian (Jira team), Thoughtworks, ServiceNow
 *
 * Requirements:
 * - Sprint backlog + active sprint board
 * - Story points, priority, assignee per ticket
 * - Drag tickets between columns (native DnD)
 * - Burndown chart (SVG)
 * - Sprint velocity tracker
 * - Create / edit / delete tickets
 * - Epic grouping
 * - Filter by assignee / priority
 */

import { useState, useMemo, useRef } from "react";

const COLS   = ["Backlog","To Do","In Progress","Review","Done"];
const PRIOS  = { Critical:"var(--err)", High:"var(--warn)", Medium:"var(--info)", Low:"var(--ok)" };
const EPICS  = ["Auth","Dashboard","Payments","Notifications","Settings"];
const TEAM   = ["Alice","Bob","Charlie","Diana","Unassigned"];

let tid = 100;
const mk = (o) => ({ id:`T-${tid++}`, priority:"Medium", points:3, assignee:"Unassigned", epic:"Dashboard", ...o });

const INIT = {
  Backlog:      [ mk({title:"Setup CI/CD pipeline",       priority:"High",     points:5, epic:"Auth",          assignee:"Bob"     }),
                  mk({title:"Write API documentation",    priority:"Low",      points:2, epic:"Dashboard",     assignee:"Unassigned"}),
                  mk({title:"Add dark mode support",      priority:"Medium",   points:3, epic:"Settings",      assignee:"Diana"   }) ],
  "To Do":      [ mk({title:"Implement OAuth login",      priority:"Critical", points:8, epic:"Auth",          assignee:"Alice"   }),
                  mk({title:"Build notification service", priority:"High",     points:5, epic:"Notifications", assignee:"Charlie" }) ],
  "In Progress":[ mk({title:"Payment gateway integration",priority:"Critical", points:13,epic:"Payments",      assignee:"Alice"   }),
                  mk({title:"Dashboard analytics charts", priority:"High",     points:8, epic:"Dashboard",     assignee:"Bob"     }) ],
  Review:       [ mk({title:"User profile page",          priority:"Medium",   points:3, epic:"Auth",          assignee:"Diana"   }) ],
  Done:         [ mk({title:"Project scaffolding",        priority:"High",     points:5, epic:"Dashboard",     assignee:"Alice"   }),
                  mk({title:"Database schema design",     priority:"High",     points:5, epic:"Auth",          assignee:"Bob"     }) ],
};

const BURNDOWN = [
  { day:1, ideal:55, actual:55 }, { day:2, ideal:50, actual:52 },
  { day:3, ideal:45, actual:48 }, { day:4, ideal:40, actual:44 },
  { day:5, ideal:35, actual:38 }, { day:6, ideal:30, actual:35 },
  { day:7, ideal:25, actual:28 }, { day:8, ideal:20, actual:22 },
  { day:9, ideal:15, actual:null}, { day:10,ideal:0,  actual:null},
];

function BurndownChart({ data, w=280, h=120 }) {
  const maxY = 60;
  const pts = (key) => data.filter(d => d[key]!==null).map((d,i) => {
    const x = (d.day-1)/(data.length-1)*w;
    const y = h - (d[key]/maxY)*h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display:"block" }}>
      <polyline points={pts("ideal")} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="4,3" />
      <polyline points={pts("actual")} fill="none" stroke="var(--a2)" strokeWidth={2} strokeLinejoin="round" />
      {data.filter(d=>d.actual!==null).map((d,i) => {
        const x = (d.day-1)/(data.length-1)*w;
        const y = h - (d.actual/maxY)*h;
        return <circle key={i} cx={x} cy={y} r={3} fill="var(--a2)" />;
      })}
    </svg>
  );
}

export default function AgileBoard() {
  const [board,    setBoard]    = useState(INIT);
  const [filterA,  setFilterA]  = useState("All");
  const [filterP,  setFilterP]  = useState("All");
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({});
  const [newTitle, setNewTitle] = useState("");
  const [addCol,   setAddCol]   = useState(null);
  const dragging = useRef(null);

  const onDragStart = (col, id) => { dragging.current = { col, id }; };
  const onDrop = (destCol) => {
    if (!dragging.current) return;
    const { col:src, id } = dragging.current;
    if (src === destCol) return;
    const ticket = board[src].find(t => t.id===id);
    setBoard(b => ({
      ...b,
      [src]:     b[src].filter(t => t.id!==id),
      [destCol]: [...b[destCol], ticket],
    }));
    dragging.current = null;
  };

  const addTicket = (col) => {
    if (!newTitle.trim()) return;
    setBoard(b => ({ ...b, [col]: [...b[col], mk({ title:newTitle })] }));
    setNewTitle(""); setAddCol(null);
  };

  const deleteTicket = (col, id) => setBoard(b => ({ ...b, [col]:b[col].filter(t=>t.id!==id) }));

  const saveEdit = () => {
    if (!editing) return;
    setBoard(b => {
      const nb = {};
      COLS.forEach(col => { nb[col] = b[col].map(t => t.id===editing.id ? { ...t, ...form } : t); });
      return nb;
    });
    setEditing(null);
  };

  const allTickets = COLS.flatMap(c => board[c]);
  const donePoints = board.Done.reduce((s,t) => s+t.points, 0);
  const totalPoints = allTickets.reduce((s,t) => s+t.points, 0);

  const filtered = (tickets) => tickets.filter(t => {
    if (filterA !== "All" && t.assignee !== filterA) return false;
    if (filterP !== "All" && t.priority !== filterP) return false;
    return true;
  });

  return (
    <div className="card">
      <h2 className="card-title">🏃 Agile Sprint Board</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Atlassian, Thoughtworks, ServiceNow.</strong> Sprint board with native DnD,
        story points, burndown chart, epic grouping, filter by assignee/priority.
      </p>

      {/* Sprint stats */}
      <div style={{ display:"flex", gap:"var(--s4)", marginBottom:"var(--s5)", flexWrap:"wrap", alignItems:"flex-start" }}>
        <div style={{ display:"flex", gap:"var(--s3)", flexWrap:"wrap" }}>
          {[
            { label:"Total Points", val:totalPoints, color:"var(--t1)"  },
            { label:"Done",         val:donePoints,  color:"var(--ok)"  },
            { label:"Remaining",    val:totalPoints-donePoints, color:"var(--warn)" },
            { label:"Velocity",     val:`${Math.round((donePoints/totalPoints)*100)}%`, color:"var(--a2)" },
          ].map(c => (
            <div key={c.label} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)", minWidth:100 }}>
              <div className="label">{c.label}</div>
              <div style={{ fontSize:"var(--xl)", fontWeight:800, color:c.color }}>{c.val}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
          borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)" }}>
          <div className="label" style={{ marginBottom:"var(--s2)" }}>Burndown</div>
          <BurndownChart data={BURNDOWN} />
          <div style={{ display:"flex", gap:"var(--s4)", marginTop:"var(--s1)", fontSize:"var(--xs)" }}>
            <span style={{ color:"rgba(255,255,255,0.3)" }}>— Ideal</span>
            <span style={{ color:"var(--a2)" }}>— Actual</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)", flexWrap:"wrap" }}>
        <select className="select" style={{ width:"auto" }} value={filterA} onChange={e=>setFilterA(e.target.value)}>
          <option>All</option>
          {TEAM.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="select" style={{ width:"auto" }} value={filterP} onChange={e=>setFilterP(e.target.value)}>
          <option>All</option>
          {Object.keys(PRIOS).map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Board */}
      <div style={{ display:"flex", gap:"var(--s3)", overflowX:"auto", paddingBottom:"var(--s2)" }}>
        {COLS.map(col => (
          <div key={col}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(col)}
            style={{ minWidth:200, flex:"0 0 200px", background:"var(--glass)",
              border:"1px solid var(--gb)", borderRadius:"var(--r3)", padding:"var(--s3)" }}>

            {/* Column header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              marginBottom:"var(--s3)" }}>
              <span style={{ fontWeight:800, fontSize:"var(--xs)", textTransform:"uppercase",
                letterSpacing:".08em", color:"var(--t2)" }}>{col}</span>
              <span className="badge badge-a">{filtered(board[col]).length}</span>
            </div>

            {/* Tickets */}
            <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)", minHeight:60 }}>
              {filtered(board[col]).map(t => (
                <div key={t.id}
                  draggable
                  onDragStart={() => onDragStart(col, t.id)}
                  style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                    borderLeft:`3px solid ${PRIOS[t.priority]}`,
                    borderRadius:"var(--r2)", padding:"var(--s3)", cursor:"grab",
                    transition:"all var(--tr)" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="var(--gb2)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="var(--gb)"}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s1)" }}>
                    <span style={{ fontSize:"var(--xs)", color:"var(--t3)", fontFamily:"var(--mono)" }}>{t.id}</span>
                    <span style={{ fontSize:"var(--xs)", background:"var(--abg)", color:"var(--a2)",
                      padding:"1px 6px", borderRadius:"var(--pill)" }}>{t.epic}</span>
                  </div>
                  <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)",
                    marginBottom:"var(--s2)", lineHeight:1.4 }}>{t.title}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>👤 {t.assignee}</span>
                    <div style={{ display:"flex", gap:"var(--s1)", alignItems:"center" }}>
                      <span style={{ background:"var(--glass)", border:"1px solid var(--gb)",
                        borderRadius:"var(--pill)", padding:"1px 6px", fontSize:"var(--xs)",
                        color:"var(--t2)", fontWeight:700 }}>{t.points}pt</span>
                      <button onClick={() => { setEditing(t); setForm({ title:t.title, priority:t.priority, points:t.points, assignee:t.assignee, epic:t.epic }); }}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:12 }}>✏</button>
                      <button onClick={() => deleteTicket(col, t.id)}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:12 }}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add ticket */}
            {addCol === col ? (
              <div style={{ marginTop:"var(--s2)" }}>
                <input className="input" style={{ marginBottom:"var(--s2)", fontSize:"var(--sm)" }}
                  placeholder="Ticket title..." value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && addTicket(col)} autoFocus />
                <div style={{ display:"flex", gap:"var(--s1)" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => addTicket(col)}>Add</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAddCol(null)}>✕</button>
                </div>
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm" style={{ width:"100%", marginTop:"var(--s2)" }}
                onClick={() => setAddCol(col)}>+ Add ticket</button>
            )}
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(7,9,26,.8)", backdropFilter:"blur(8px)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}
          onClick={() => setEditing(null)}>
          <div style={{ background:"rgba(13,16,37,.97)", border:"1px solid var(--gb2)",
            borderRadius:"var(--r4)", padding:"var(--s8)", width:400,
            boxShadow:"var(--sh3)", animation:"slideUp .2s ease" }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom:"var(--s5)" }}>Edit Ticket</h3>
            {[
              { key:"title",    label:"Title",    type:"text"   },
              { key:"priority", label:"Priority", type:"select", opts:Object.keys(PRIOS) },
              { key:"points",   label:"Points",   type:"number" },
              { key:"assignee", label:"Assignee", type:"select", opts:TEAM },
              { key:"epic",     label:"Epic",     type:"select", opts:EPICS },
            ].map(f => (
              <div key={f.key} className="form-row" style={{ marginBottom:"var(--s3)" }}>
                <label className="label">{f.label}</label>
                {f.type==="select"
                  ? <select className="select" value={form[f.key]}
                      onChange={e => setForm(x => ({ ...x, [f.key]:e.target.value }))}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  : <input className="input" type={f.type} value={form[f.key]}
                      onChange={e => setForm(x => ({ ...x, [f.key]:f.type==="number"?Number(e.target.value):e.target.value }))} />
                }
              </div>
            ))}
            <div style={{ display:"flex", gap:"var(--s3)", justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
