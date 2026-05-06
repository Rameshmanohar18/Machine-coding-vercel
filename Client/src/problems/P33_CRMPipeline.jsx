/**
 * PROBLEM 33 — CRM Sales Pipeline
 * Asked at: Freshworks (CRM), Zoho CRM, Salesforce, HubSpot
 *
 * Requirements:
 * - Kanban-style pipeline: Lead → Qualified → Proposal → Negotiation → Won/Lost
 * - Deal cards with value, company, contact, probability
 * - Drag deals between stages
 * - Pipeline value per stage
 * - Win/loss rate analytics
 * - Add/edit/delete deals
 * - Filter by owner / value range
 * - Forecast calculation (value × probability)
 */

import { useState, useMemo, useRef } from "react";

const STAGES = ["Lead","Qualified","Proposal","Negotiation","Won","Lost"];
const STAGE_COLORS = {
  Lead:"var(--t3)", Qualified:"var(--info)", Proposal:"var(--a2)",
  Negotiation:"var(--warn)", Won:"var(--ok)", Lost:"var(--err)"
};

const OWNERS = ["Alice","Bob","Charlie","Diana"];

let dealId = 1;
const mkDeal = (o) => ({
  id:`D-${String(dealId++).padStart(3,"0")}`,
  company:"", contact:"", value:0, probability:50, owner:"Alice",
  createdAt:new Date().toISOString().split("T")[0], ...o
});

const INIT = {
  Lead:        [ mkDeal({ company:"TechCorp",    contact:"John",  value:150000, probability:20, owner:"Alice"   }),
                 mkDeal({ company:"StartupXYZ",  contact:"Priya", value:80000,  probability:15, owner:"Bob"     }) ],
  Qualified:   [ mkDeal({ company:"MegaRetail",  contact:"Rahul", value:320000, probability:40, owner:"Charlie" }),
                 mkDeal({ company:"FinanceHub",  contact:"Ananya",value:200000, probability:35, owner:"Alice"   }) ],
  Proposal:    [ mkDeal({ company:"CloudSoft",   contact:"Kiran", value:450000, probability:60, owner:"Diana"   }) ],
  Negotiation: [ mkDeal({ company:"GlobalBank",  contact:"Suresh",value:750000, probability:75, owner:"Alice"   }) ],
  Won:         [ mkDeal({ company:"RetailGiant", contact:"Meera", value:280000, probability:100,owner:"Bob"     }) ],
  Lost:        [ mkDeal({ company:"OldCorp",     contact:"Raj",   value:120000, probability:0,  owner:"Charlie" }) ],
};

export default function CRMPipeline() {
  const [pipeline, setPipeline] = useState(INIT);
  const [filterOwner, setFilterOwner] = useState("All");
  const [minVal,      setMinVal]      = useState(0);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState({});
  const [adding,      setAdding]      = useState(null);
  const [newDeal,     setNewDeal]     = useState({ company:"", contact:"", value:"", probability:50, owner:"Alice" });
  const dragging = useRef(null);

  const onDragStart = (stage, id) => { dragging.current = { stage, id }; };
  const onDrop = (destStage) => {
    if (!dragging.current) return;
    const { stage:src, id } = dragging.current;
    if (src === destStage) return;
    const deal = pipeline[src].find(d => d.id===id);
    setPipeline(p => ({
      ...p,
      [src]:      p[src].filter(d => d.id!==id),
      [destStage]:[...p[destStage], deal],
    }));
    dragging.current = null;
  };

  const deleteDeal = (stage, id) => setPipeline(p => ({ ...p, [stage]:p[stage].filter(d=>d.id!==id) }));

  const saveEdit = () => {
    if (!editing) return;
    setPipeline(p => {
      const np = {};
      STAGES.forEach(s => { np[s] = p[s].map(d => d.id===editing.id ? { ...d, ...form, value:Number(form.value), probability:Number(form.probability) } : d); });
      return np;
    });
    setEditing(null);
  };

  const addDeal = (stage) => {
    if (!newDeal.company.trim()) return;
    setPipeline(p => ({ ...p, [stage]:[...p[stage], mkDeal({ ...newDeal, value:Number(newDeal.value) })] }));
    setNewDeal({ company:"", contact:"", value:"", probability:50, owner:"Alice" });
    setAdding(null);
  };

  const filtered = (deals) => deals.filter(d => {
    if (filterOwner !== "All" && d.owner !== filterOwner) return false;
    if (d.value < minVal) return false;
    return true;
  });

  const analytics = useMemo(() => {
    const allDeals = STAGES.flatMap(s => pipeline[s]);
    const won  = pipeline.Won.reduce((s,d)=>s+d.value,0);
    const lost = pipeline.Lost.reduce((s,d)=>s+d.value,0);
    const forecast = STAGES.filter(s=>!["Won","Lost"].includes(s))
      .flatMap(s=>pipeline[s]).reduce((s,d)=>s+d.value*(d.probability/100),0);
    return { won, lost, forecast, total:allDeals.reduce((s,d)=>s+d.value,0) };
  }, [pipeline]);

  return (
    <div className="card">
      <h2 className="card-title">💼 CRM Sales Pipeline</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Freshworks, Zoho CRM, Salesforce.</strong> Kanban pipeline with drag-and-drop,
        deal cards, stage values, win/loss analytics, forecast calculation.
      </p>

      {/* Analytics */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"var(--s3)", marginBottom:"var(--s5)" }}>
        {[
          { label:"Pipeline Value", val:`₹${(analytics.total/100000).toFixed(1)}L`, color:"var(--a2)"  },
          { label:"Won",            val:`₹${(analytics.won/100000).toFixed(1)}L`,   color:"var(--ok)"  },
          { label:"Lost",           val:`₹${(analytics.lost/100000).toFixed(1)}L`,  color:"var(--err)" },
          { label:"Forecast",       val:`₹${(analytics.forecast/100000).toFixed(1)}L`,color:"var(--warn)"},
        ].map(c => (
          <div key={c.label} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            <div className="label">{c.label}</div>
            <div style={{ fontSize:"var(--xl)", fontWeight:800, color:c.color }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s4)", flexWrap:"wrap", alignItems:"center" }}>
        <select className="select" style={{ width:"auto" }} value={filterOwner}
          onChange={e=>setFilterOwner(e.target.value)}>
          <option>All</option>
          {OWNERS.map(o=><option key={o}>{o}</option>)}
        </select>
        <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)" }}>
          <span style={{ fontSize:"var(--xs)", color:"var(--t2)" }}>Min value:</span>
          <input className="input" style={{ width:100 }} type="number" min={0} value={minVal}
            onChange={e=>setMinVal(Number(e.target.value))} placeholder="₹0" />
        </div>
      </div>

      {/* Pipeline board */}
      <div style={{ display:"flex", gap:"var(--s3)", overflowX:"auto", paddingBottom:"var(--s2)" }}>
        {STAGES.map(stage => {
          const deals = filtered(pipeline[stage]);
          const stageVal = deals.reduce((s,d)=>s+d.value,0);
          return (
            <div key={stage}
              onDragOver={e=>e.preventDefault()}
              onDrop={() => onDrop(stage)}
              style={{ minWidth:200, flex:"0 0 200px", background:"var(--glass)",
                border:"1px solid var(--gb)", borderRadius:"var(--r3)", padding:"var(--s3)" }}>

              {/* Stage header */}
              <div style={{ marginBottom:"var(--s3)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"var(--s1)" }}>
                  <span style={{ fontWeight:800, fontSize:"var(--xs)", textTransform:"uppercase",
                    letterSpacing:".08em", color:STAGE_COLORS[stage] }}>{stage}</span>
                  <span className="badge" style={{ background:STAGE_COLORS[stage]+"22",
                    color:STAGE_COLORS[stage], border:`1px solid ${STAGE_COLORS[stage]}44` }}>
                    {deals.length}
                  </span>
                </div>
                <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                  ₹{(stageVal/100000).toFixed(1)}L
                </div>
              </div>

              {/* Deals */}
              <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)", minHeight:60 }}>
                {deals.map(d => (
                  <div key={d.id}
                    draggable
                    onDragStart={() => onDragStart(stage, d.id)}
                    style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                      borderRadius:"var(--r2)", padding:"var(--s3)", cursor:"grab",
                      transition:"all var(--tr)" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gb2)"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="var(--gb)"}>
                    <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)",
                      marginBottom:"var(--s1)" }}>{d.company}</div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s2)" }}>
                      👤 {d.contact} · {d.owner}
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontWeight:800, color:"var(--ok)", fontSize:"var(--sm)" }}>
                        ₹{(d.value/1000).toFixed(0)}K
                      </span>
                      <span style={{ fontSize:"var(--xs)", color:"var(--a2)", fontWeight:700 }}>
                        {d.probability}%
                      </span>
                    </div>
                    {/* Probability bar */}
                    <div style={{ height:3, background:"var(--gb)", borderRadius:2, marginTop:"var(--s2)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${d.probability}%`,
                        background:STAGE_COLORS[stage], borderRadius:2 }} />
                    </div>
                    <div style={{ display:"flex", gap:"var(--s1)", marginTop:"var(--s2)" }}>
                      <button onClick={() => { setEditing(d); setForm({ company:d.company, contact:d.contact, value:d.value, probability:d.probability, owner:d.owner }); }}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:12 }}>✏</button>
                      <button onClick={() => deleteDeal(stage, d.id)}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:12 }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add deal */}
              {adding === stage ? (
                <div style={{ marginTop:"var(--s2)" }}>
                  {["company","contact"].map(f => (
                    <input key={f} className="input" style={{ marginBottom:"var(--s1)", fontSize:"var(--xs)", padding:"6px 8px" }}
                      placeholder={f.charAt(0).toUpperCase()+f.slice(1)}
                      value={newDeal[f]}
                      onChange={e=>setNewDeal(n=>({...n,[f]:e.target.value}))} />
                  ))}
                  <input className="input" style={{ marginBottom:"var(--s2)", fontSize:"var(--xs)", padding:"6px 8px" }}
                    type="number" placeholder="Value ₹"
                    value={newDeal.value}
                    onChange={e=>setNewDeal(n=>({...n,value:e.target.value}))} />
                  <div style={{ display:"flex", gap:"var(--s1)" }}>
                    <button className="btn btn-primary btn-sm" onClick={() => addDeal(stage)}>Add</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAdding(null)}>✕</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-ghost btn-sm" style={{ width:"100%", marginTop:"var(--s2)" }}
                  onClick={() => setAdding(stage)}>+ Add deal</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(7,9,26,.8)", backdropFilter:"blur(8px)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}
          onClick={() => setEditing(null)}>
          <div style={{ background:"rgba(13,16,37,.97)", border:"1px solid var(--gb2)",
            borderRadius:"var(--r4)", padding:"var(--s8)", width:380, animation:"slideUp .2s ease" }}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{ marginBottom:"var(--s5)" }}>Edit Deal</h3>
            {[
              { key:"company",     label:"Company",     type:"text"   },
              { key:"contact",     label:"Contact",     type:"text"   },
              { key:"value",       label:"Value (₹)",   type:"number" },
              { key:"probability", label:"Probability %",type:"number"},
              { key:"owner",       label:"Owner",       type:"select", opts:OWNERS },
            ].map(f => (
              <div key={f.key} className="form-row" style={{ marginBottom:"var(--s3)" }}>
                <label className="label">{f.label}</label>
                {f.type==="select"
                  ? <select className="select" value={form[f.key]}
                      onChange={e=>setForm(x=>({...x,[f.key]:e.target.value}))}>
                      {f.opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  : <input className="input" type={f.type} value={form[f.key]}
                      onChange={e=>setForm(x=>({...x,[f.key]:e.target.value}))} />
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
