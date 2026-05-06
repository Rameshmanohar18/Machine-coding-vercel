/**
 * PROBLEM 25 — Network / Infrastructure Monitor
 * Asked at: Cisco, Intel, VMware, Broadcom
 *
 * Requirements:
 * - Live server health grid (CPU, Memory, Disk, Network)
 * - Status: healthy / warning / critical / offline
 * - Click server to see detailed metrics
 * - Alert log with severity levels
 * - Topology map (SVG connections)
 * - Pause/resume monitoring
 * - Acknowledge alerts
 * - Uptime tracker per server
 */

import { useState, useEffect, useCallback, useRef } from "react";

const SERVERS = [
  { id:"web-01",  name:"Web Server 01",  role:"Web",      region:"US-East",  ip:"10.0.1.1"  },
  { id:"web-02",  name:"Web Server 02",  role:"Web",      region:"US-West",  ip:"10.0.1.2"  },
  { id:"api-01",  name:"API Gateway",    role:"API",      region:"US-East",  ip:"10.0.2.1"  },
  { id:"db-01",   name:"Primary DB",     role:"Database", region:"US-East",  ip:"10.0.3.1"  },
  { id:"db-02",   name:"Replica DB",     role:"Database", region:"EU-West",  ip:"10.0.3.2"  },
  { id:"cache-01",name:"Redis Cache",    role:"Cache",    region:"US-East",  ip:"10.0.4.1"  },
  { id:"lb-01",   name:"Load Balancer",  role:"LB",       region:"US-East",  ip:"10.0.0.1"  },
  { id:"mon-01",  name:"Monitoring",     role:"Monitor",  region:"US-East",  ip:"10.0.5.1"  },
];

const ROLE_ICONS = { Web:"🌐", API:"⚙️", Database:"🗄", Cache:"⚡", LB:"⚖️", Monitor:"📊" };

function genMetrics(prev) {
  const noise = (v, range) => Math.max(0, Math.min(100, v + (Math.random()-0.5)*range));
  return {
    cpu:    noise(prev?.cpu    ?? 40, 15),
    memory: noise(prev?.memory ?? 55, 10),
    disk:   noise(prev?.disk   ?? 60, 3),
    network:noise(prev?.network?? 30, 20),
  };
}

function getStatus(metrics) {
  const max = Math.max(metrics.cpu, metrics.memory, metrics.disk);
  if (max >= 90) return "critical";
  if (max >= 75) return "warning";
  return "healthy";
}

const STATUS_COLORS = { healthy:"var(--ok)", warning:"var(--warn)", critical:"var(--err)", offline:"var(--t3)" };
const STATUS_BG     = { healthy:"var(--ok-bg)", warning:"var(--warn-bg)", critical:"var(--err-bg)", offline:"var(--glass)" };

function MiniBar({ value, color }) {
  return (
    <div style={{ height:4, background:"var(--gb)", borderRadius:2, overflow:"hidden", marginTop:2 }}>
      <div style={{ height:"100%", width:`${value}%`, background:color,
        borderRadius:2, transition:"width .5s ease" }} />
    </div>
  );
}

let alertId = 1;

export default function NetworkMonitor() {
  const [metrics,  setMetrics]  = useState(
    Object.fromEntries(SERVERS.map(s => [s.id, genMetrics(null)]))
  );
  const [uptimes,  setUptimes]  = useState(
    Object.fromEntries(SERVERS.map(s => [s.id, Math.floor(Math.random()*720*60)]))
  );
  const [selected, setSelected] = useState(null);
  const [paused,   setPaused]   = useState(false);
  const [alerts,   setAlerts]   = useState([]);
  const [acked,    setAcked]    = useState(new Set());
  const prevMetrics = useRef({});

  const tick = useCallback(() => {
    setMetrics(prev => {
      const next = {};
      const newAlerts = [];
      SERVERS.forEach(s => {
        const m = genMetrics(prev[s.id]);
        next[s.id] = m;
        const status = getStatus(m);
        const prevStatus = getStatus(prev[s.id] || m);
        if (status === "critical" && prevStatus !== "critical") {
          newAlerts.push({ id:alertId++, server:s.name, msg:`CPU/Memory critical on ${s.name}`,
            severity:"critical", time:new Date().toLocaleTimeString() });
        } else if (status === "warning" && prevStatus === "healthy") {
          newAlerts.push({ id:alertId++, server:s.name, msg:`High load detected on ${s.name}`,
            severity:"warning", time:new Date().toLocaleTimeString() });
        }
      });
      if (newAlerts.length) setAlerts(a => [...newAlerts, ...a].slice(0, 20));
      prevMetrics.current = prev;
      return next;
    });
    setUptimes(u => Object.fromEntries(Object.entries(u).map(([k,v]) => [k, v+2])));
  }, []);

  useEffect(() => {
    if (!paused) {
      const t = setInterval(tick, 2000);
      return () => clearInterval(t);
    }
  }, [paused, tick]);

  const formatUptime = (secs) => {
    const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60);
    return `${h}h ${m}m`;
  };

  const sel = SERVERS.find(s => s.id === selected);
  const selMetrics = selected ? metrics[selected] : null;

  const summary = {
    healthy:  SERVERS.filter(s => getStatus(metrics[s.id]) === "healthy").length,
    warning:  SERVERS.filter(s => getStatus(metrics[s.id]) === "warning").length,
    critical: SERVERS.filter(s => getStatus(metrics[s.id]) === "critical").length,
  };

  return (
    <div className="card">
      <h2 className="card-title">🖥 Network Infrastructure Monitor</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Cisco, Intel, VMware.</strong> Live server health grid, metric bars,
        alert log with severity, uptime tracking, pause/resume, acknowledge alerts.
      </p>

      {/* Controls + summary */}
      <div style={{ display:"flex", gap:"var(--s4)", marginBottom:"var(--s5)", flexWrap:"wrap", alignItems:"center" }}>
        <button className={`btn btn-sm ${paused?"btn-success":"btn-danger"}`}
          onClick={() => setPaused(p => !p)}>
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
        {!paused && (
          <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)", color:"var(--t2)", fontSize:"var(--xs)" }}>
            <span className="spinner" style={{ width:10, height:10, borderWidth:1.5 }} /> Live
          </div>
        )}
        <div style={{ marginLeft:"auto", display:"flex", gap:"var(--s3)" }}>
          {Object.entries(summary).map(([status, count]) => (
            <div key={status} style={{ display:"flex", alignItems:"center", gap:"var(--s1)",
              fontSize:"var(--sm)" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:STATUS_COLORS[status] }} />
              <span style={{ color:STATUS_COLORS[status], fontWeight:700 }}>{count}</span>
              <span style={{ color:"var(--t3)", textTransform:"capitalize" }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:"var(--s5)", flexWrap:"wrap" }}>
        {/* Server grid */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"var(--s3)" }}>
            {SERVERS.map(s => {
              const m      = metrics[s.id];
              const status = getStatus(m);
              const isSel  = selected === s.id;
              return (
                <div key={s.id}
                  onClick={() => setSelected(isSel ? null : s.id)}
                  style={{
                    background: isSel ? STATUS_BG[status] : "var(--glass2)",
                    border:`1px solid ${isSel ? STATUS_COLORS[status] : "var(--gb)"}`,
                    borderRadius:"var(--r2)", padding:"var(--s4)", cursor:"pointer",
                    transition:"all var(--tr)"
                  }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s2)" }}>
                    <span style={{ fontSize:20 }}>{ROLE_ICONS[s.role]}</span>
                    <span style={{ width:8, height:8, borderRadius:"50%",
                      background:STATUS_COLORS[status], display:"inline-block",
                      boxShadow:`0 0 6px ${STATUS_COLORS[status]}` }} />
                  </div>
                  <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)", marginBottom:2 }}>{s.name}</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s3)" }}>{s.ip}</div>

                  {[
                    { label:"CPU",    val:m.cpu,    color:"var(--a2)"  },
                    { label:"MEM",    val:m.memory, color:"var(--info)" },
                    { label:"DISK",   val:m.disk,   color:"var(--warn)" },
                  ].map(metric => (
                    <div key={metric.label} style={{ marginBottom:"var(--s1)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--xs)" }}>
                        <span style={{ color:"var(--t3)" }}>{metric.label}</span>
                        <span style={{ color:metric.val>80?"var(--err)":metric.val>60?"var(--warn)":metric.color,
                          fontWeight:700 }}>{metric.val.toFixed(0)}%</span>
                      </div>
                      <MiniBar value={metric.val} color={metric.val>80?"var(--err)":metric.val>60?"var(--warn)":metric.color} />
                    </div>
                  ))}

                  <div style={{ marginTop:"var(--s2)", fontSize:"var(--xs)", color:"var(--t3)" }}>
                    ↑ {formatUptime(uptimes[s.id])}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right panel: detail + alerts */}
        <div style={{ minWidth:220, flex:"0 0 220px", display:"flex", flexDirection:"column", gap:"var(--s4)" }}>
          {/* Server detail */}
          {sel && selMetrics && (
            <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)" }}>
              <div style={{ fontWeight:700, color:"var(--t1)", marginBottom:"var(--s3)" }}>
                {ROLE_ICONS[sel.role]} {sel.name}
              </div>
              {[
                { label:"CPU",     val:selMetrics.cpu,     color:"var(--a2)"   },
                { label:"Memory",  val:selMetrics.memory,  color:"var(--info)"  },
                { label:"Disk",    val:selMetrics.disk,    color:"var(--warn)"  },
                { label:"Network", val:selMetrics.network, color:"var(--ok)"    },
              ].map(m => (
                <div key={m.label} style={{ marginBottom:"var(--s3)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--sm)",
                    marginBottom:"var(--s1)" }}>
                    <span style={{ color:"var(--t2)" }}>{m.label}</span>
                    <span style={{ color:m.color, fontWeight:800 }}>{m.val.toFixed(1)}%</span>
                  </div>
                  <div style={{ height:6, background:"var(--gb)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${m.val}%`, background:m.color,
                      borderRadius:3, transition:"width .5s ease" }} />
                  </div>
                </div>
              ))}
              <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                Region: {sel.region} · IP: {sel.ip}
              </div>
            </div>
          )}

          {/* Alert log */}
          <div>
            <div className="label" style={{ marginBottom:"var(--s2)" }}>
              Alert Log ({alerts.filter(a => !acked.has(a.id)).length} active)
            </div>
            <div style={{ maxHeight:300, overflowY:"auto", display:"flex", flexDirection:"column", gap:"var(--s1)" }}>
              {alerts.length === 0 && (
                <div style={{ color:"var(--t3)", fontSize:"var(--xs)", padding:"var(--s3)" }}>
                  No alerts
                </div>
              )}
              {alerts.map(a => (
                <div key={a.id} style={{
                  background: acked.has(a.id) ? "var(--glass)" : STATUS_BG[a.severity],
                  border:`1px solid ${acked.has(a.id)?"var(--gb)":STATUS_COLORS[a.severity]+"44"}`,
                  borderRadius:"var(--r1)", padding:"var(--s2) var(--s3)",
                  opacity: acked.has(a.id) ? 0.5 : 1
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                    <span style={{ fontSize:"var(--xs)", color:STATUS_COLORS[a.severity], fontWeight:700,
                      textTransform:"uppercase" }}>{a.severity}</span>
                    <span style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t1)", marginBottom:"var(--s1)" }}>{a.msg}</div>
                  {!acked.has(a.id) && (
                    <button onClick={() => setAcked(s => new Set([...s, a.id]))}
                      style={{ background:"none", border:"none", cursor:"pointer",
                        color:"var(--a2)", fontSize:"var(--xs)", padding:0 }}>
                      ✓ Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
