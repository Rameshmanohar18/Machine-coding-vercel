/**
 * PROBLEM 41 — Data Backup & Recovery Manager
 * Asked at: Rubrik, Cohesity, Veeam
 *
 * Requirements:
 * - Backup jobs list with schedule, status, size
 * - Create/edit/delete backup policies
 * - Backup progress simulation
 * - Recovery point timeline
 * - Storage usage donut chart (SVG)
 * - Alert on backup failure
 * - Retention policy settings
 * - Restore simulation
 */

import { useState, useEffect, useCallback } from "react";

const POLICIES = [
  { id:1, name:"Daily Full Backup",    schedule:"Daily 2:00 AM",  retention:30, type:"Full",        size:"245 GB" },
  { id:2, name:"Hourly Incremental",   schedule:"Every 1 hour",   retention:7,  type:"Incremental", size:"12 GB"  },
  { id:3, name:"Weekly Archive",       schedule:"Sunday 11 PM",   retention:365,type:"Archive",     size:"1.2 TB" },
];

const RECOVERY_POINTS = [
  { id:1, time:"Today 02:00",    type:"Full",        size:"245 GB", status:"verified" },
  { id:2, time:"Today 01:00",    type:"Incremental", size:"8 GB",   status:"verified" },
  { id:3, time:"Yesterday 02:00",type:"Full",        size:"242 GB", status:"verified" },
  { id:4, time:"Yesterday 01:00",type:"Incremental", size:"11 GB",  status:"failed"   },
  { id:5, time:"2 days ago",     type:"Full",        size:"240 GB", status:"verified" },
];

const STORAGE = [
  { label:"Used",      value:68, color:"var(--a2)"  },
  { label:"Available", value:32, color:"var(--glass2)" },
];

function DonutChart({ data, size=120 }) {
  let angle = -90;
  const r = size/2 - 12, cx = size/2, cy = size/2;
  return (
    <svg width={size} height={size}>
      {data.map((d,i) => {
        const sweep = (d.value/100)*360;
        const r1 = angle*Math.PI/180, r2 = (angle+sweep)*Math.PI/180;
        const x1=cx+r*Math.cos(r1), y1=cy+r*Math.sin(r1);
        const x2=cx+r*Math.cos(r2), y2=cy+r*Math.sin(r2);
        const large = sweep>180?1:0;
        const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
        angle += sweep;
        return <path key={i} d={path} fill={d.color} opacity={0.85}><title>{d.label}: {d.value}%</title></path>;
      })}
      <circle cx={cx} cy={cy} r={r*0.55} fill="var(--bg2)" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize:14, fontWeight:800, fill:"var(--t1)", fontFamily:"var(--font)" }}>
        68%
      </text>
    </svg>
  );
}

let jobId = 10;

export default function DataBackupManager() {
  const [jobs,      setJobs]      = useState(POLICIES);
  const [running,   setRunning]   = useState(null);
  const [progress,  setProgress]  = useState(0);
  const [restoring, setRestoring] = useState(null);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [alerts,    setAlerts]    = useState([]);
  const [form,      setForm]      = useState({ name:"", schedule:"", retention:30, type:"Full" });
  const [adding,    setAdding]    = useState(false);

  const runBackup = useCallback((id) => {
    setRunning(id); setProgress(0);
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(t);
          setRunning(null);
          const failed = Math.random() < 0.1;
          if (failed) setAlerts(a => [`❌ Backup job failed: ${jobs.find(j=>j.id===id)?.name}`, ...a].slice(0,5));
          return 0;
        }
        return p + Math.random()*8 + 2;
      });
    }, 200);
  }, [jobs]);

  const restore = (rp) => {
    setRestoring(rp.id); setRestoreProgress(0);
    const t = setInterval(() => {
      setRestoreProgress(p => {
        if (p >= 100) { clearInterval(t); setRestoring(null); return 0; }
        return p + Math.random()*6 + 2;
      });
    }, 200);
  };

  const addJob = () => {
    if (!form.name.trim()) return;
    setJobs(j => [...j, { id:jobId++, ...form, size:"—" }]);
    setForm({ name:"", schedule:"", retention:30, type:"Full" });
    setAdding(false);
  };

  return (
    <div className="card">
      <h2 className="card-title">💾 Data Backup Manager</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Rubrik, Cohesity.</strong> Backup policies, job simulation with progress,
        recovery point timeline, storage donut chart, restore simulation, failure alerts.
      </p>

      {alerts.map((a,i) => (
        <div key={i} style={{ background:"var(--err-bg)", border:"1px solid rgba(239,68,68,.3)",
          borderRadius:"var(--r1)", padding:"6px 12px", marginBottom:"var(--s2)",
          fontSize:"var(--xs)", color:"var(--err)" }}>{a}</div>
      ))}

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* Backup policies */}
        <div style={{ flex:2, minWidth:280 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:"var(--s4)" }}>
            <div className="label">Backup Policies</div>
            <button className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>+ New Policy</button>
          </div>

          {adding && (
            <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s4)" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--s3)" }}>
                <input className="input" placeholder="Policy name" value={form.name}
                  onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                <input className="input" placeholder="Schedule" value={form.schedule}
                  onChange={e=>setForm(f=>({...f,schedule:e.target.value}))} />
                <select className="select" value={form.type}
                  onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  {["Full","Incremental","Archive"].map(t=><option key={t}>{t}</option>)}
                </select>
                <input className="input" type="number" placeholder="Retention (days)"
                  value={form.retention} onChange={e=>setForm(f=>({...f,retention:Number(e.target.value)}))} />
              </div>
              <div style={{ display:"flex", gap:"var(--s2)", marginTop:"var(--s3)" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={addJob}>Save</button>
              </div>
            </div>
          )}

          {jobs.map(job => (
            <div key={job.id} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s3)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s2)" }}>
                <div>
                  <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{job.name}</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                    {job.schedule} · Retain {job.retention} days · {job.size}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"var(--s2)", alignItems:"center" }}>
                  <span className="badge badge-a">{job.type}</span>
                  <button className="btn btn-success btn-sm"
                    onClick={() => runBackup(job.id)}
                    disabled={running===job.id}>
                    {running===job.id ? "Running..." : "▶ Run"}
                  </button>
                  <button className="btn btn-danger btn-sm"
                    onClick={() => setJobs(j=>j.filter(x=>x.id!==job.id))}>✕</button>
                </div>
              </div>
              {running===job.id && (
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--xs)",
                    color:"var(--t2)", marginBottom:"var(--s1)" }}>
                    <span>Backing up...</span>
                    <span>{Math.min(100,progress).toFixed(0)}%</span>
                  </div>
                  <div style={{ height:4, background:"var(--gb)", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${Math.min(100,progress)}%`,
                      background:"var(--a2)", borderRadius:2, transition:"width .2s ease" }} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Recovery points */}
          <div className="label" style={{ marginBottom:"var(--s3)", marginTop:"var(--s5)" }}>
            Recovery Points
          </div>
          {RECOVERY_POINTS.map(rp => (
            <div key={rp.id} style={{ display:"flex", alignItems:"center", gap:"var(--s3)",
              background:"var(--glass2)", border:"1px solid var(--gb)",
              borderLeft:`3px solid ${rp.status==="verified"?"var(--ok)":"var(--err)"}`,
              borderRadius:"var(--r2)", padding:"10px 14px", marginBottom:"var(--s2)" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--sm)" }}>{rp.time}</div>
                <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{rp.type} · {rp.size}</div>
              </div>
              <span className={`badge badge-${rp.status==="verified"?"ok":"err"}`}>{rp.status}</span>
              {rp.status==="verified" && (
                <button className="btn btn-info btn-sm"
                  onClick={() => restore(rp)}
                  disabled={restoring===rp.id}>
                  {restoring===rp.id ? `${restoreProgress.toFixed(0)}%` : "Restore"}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Storage */}
        <div style={{ minWidth:180, flex:"0 0 180px" }}>
          <div className="label" style={{ marginBottom:"var(--s3)" }}>Storage Usage</div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s5)" }}>
            <DonutChart data={STORAGE} />
            <div style={{ marginTop:"var(--s4)", width:"100%" }}>
              {[
                { label:"Used",      val:"3.4 TB", color:"var(--a2)"  },
                { label:"Available", val:"1.6 TB", color:"var(--t3)"  },
                { label:"Total",     val:"5.0 TB", color:"var(--t1)"  },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
                  fontSize:"var(--xs)", padding:"var(--s1) 0", borderBottom:"1px solid var(--gb)" }}>
                  <span style={{ color:"var(--t2)" }}>{r.label}</span>
                  <span style={{ color:r.color, fontWeight:700 }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
