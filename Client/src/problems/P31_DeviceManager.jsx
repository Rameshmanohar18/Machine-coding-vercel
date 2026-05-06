/**
 * PROBLEM 31 — IoT Device Manager
 * Asked at: Cisco, Intel, Broadcom, VMware
 *
 * Requirements:
 * - Device grid with live status (online/offline/warning)
 * - Toggle device on/off
 * - Device types: sensor, camera, thermostat, switch, gateway
 * - Live telemetry per device (temperature, humidity, power)
 * - Group devices by room/zone
 * - Bulk actions (restart, update firmware, decommission)
 * - Alert when device goes offline
 * - Device detail panel with history chart
 */

import { useState, useEffect, useCallback } from "react";

const DEVICE_TYPES = {
  sensor:     { icon:"🌡", label:"Sensor"     },
  camera:     { icon:"📷", label:"Camera"     },
  thermostat: { icon:"🌡", label:"Thermostat" },
  switch:     { icon:"💡", label:"Switch"     },
  gateway:    { icon:"📡", label:"Gateway"    },
};

const ROOMS = ["Living Room","Bedroom","Kitchen","Office","Garage","Outdoor"];

let devId = 1;
const mkDev = (o) => ({
  id:`DEV-${String(devId++).padStart(3,"0")}`,
  status:"online", power:true,
  telemetry:{ temp:22+Math.random()*8, humidity:45+Math.random()*20, power:Math.random()*100 },
  history:Array.from({length:20},()=>20+Math.random()*15),
  firmware:"v2.1.0", lastSeen:new Date().toLocaleTimeString(),
  ...o
});

const INIT_DEVICES = [
  mkDev({ name:"Living Room Sensor",  type:"sensor",     room:"Living Room" }),
  mkDev({ name:"Front Door Camera",   type:"camera",     room:"Outdoor"     }),
  mkDev({ name:"Bedroom Thermostat",  type:"thermostat", room:"Bedroom"     }),
  mkDev({ name:"Kitchen Light",       type:"switch",     room:"Kitchen"     }),
  mkDev({ name:"Main Gateway",        type:"gateway",    room:"Office"      }),
  mkDev({ name:"Office Sensor",       type:"sensor",     room:"Office"      }),
  mkDev({ name:"Garage Camera",       type:"camera",     room:"Garage"      }),
  mkDev({ name:"Bedroom Light",       type:"switch",     room:"Bedroom"     }),
];

function MiniLine({ data, color, w=80, h=30 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max-min||1;
  const pts = data.map((v,i) => `${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

const STATUS_COLORS = { online:"var(--ok)", offline:"var(--err)", warning:"var(--warn)" };

export default function DeviceManager() {
  const [devices,  setDevices]  = useState(INIT_DEVICES);
  const [selected, setSelected] = useState(null);
  const [bulk,     setBulk]     = useState([]);
  const [filterRoom, setFilterRoom] = useState("All");
  const [filterStatus,setFilterStatus]=useState("All");
  const [alerts,   setAlerts]   = useState([]);
  const [paused,   setPaused]   = useState(false);

  // Simulate telemetry updates
  const tick = useCallback(() => {
    setDevices(prev => prev.map(d => {
      if (!d.power) return d;
      const newStatus = Math.random() < 0.03 ? "offline" : Math.random() < 0.05 ? "warning" : "online";
      if (newStatus === "offline" && d.status !== "offline") {
        setAlerts(a => [`⚠ ${d.name} went offline`, ...a].slice(0,5));
      }
      const newTemp = Math.max(15, Math.min(40, d.telemetry.temp + (Math.random()-0.5)*0.5));
      return {
        ...d, status:newStatus,
        lastSeen:new Date().toLocaleTimeString(),
        telemetry:{ ...d.telemetry, temp:newTemp, humidity:Math.max(20,Math.min(90,d.telemetry.humidity+(Math.random()-0.5)*1)) },
        history:[...d.history.slice(1), newTemp],
      };
    }));
  }, []);

  useEffect(() => {
    if (!paused) {
      const t = setInterval(tick, 2500);
      return () => clearInterval(t);
    }
  }, [paused, tick]);

  const togglePower = (id) => {
    setDevices(d => d.map(x => x.id===id ? { ...x, power:!x.power, status:x.power?"offline":"online" } : x));
  };

  const bulkAction = (action) => {
    setDevices(d => d.map(x => {
      if (!bulk.includes(x.id)) return x;
      if (action==="restart")  return { ...x, status:"online", lastSeen:new Date().toLocaleTimeString() };
      if (action==="update")   return { ...x, firmware:"v2.2.0" };
      if (action==="decommission") return { ...x, power:false, status:"offline" };
      return x;
    }));
    setBulk([]);
  };

  const filtered = devices.filter(d => {
    if (filterRoom   !== "All" && d.room   !== filterRoom)   return false;
    if (filterStatus !== "All" && d.status !== filterStatus) return false;
    return true;
  });

  const sel = devices.find(d => d.id===selected);

  const summary = {
    online:  devices.filter(d=>d.status==="online").length,
    offline: devices.filter(d=>d.status==="offline").length,
    warning: devices.filter(d=>d.status==="warning").length,
  };

  return (
    <div className="card">
      <h2 className="card-title">📡 IoT Device Manager</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Cisco, Intel, Broadcom.</strong> Live device grid, telemetry updates,
        toggle power, bulk actions, room grouping, offline alerts, history sparklines.
      </p>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom:"var(--s4)", display:"flex", flexDirection:"column", gap:"var(--s1)" }}>
          {alerts.map((a,i) => (
            <div key={i} style={{ background:"var(--err-bg)", border:"1px solid rgba(239,68,68,.3)",
              borderRadius:"var(--r1)", padding:"6px 12px", fontSize:"var(--xs)", color:"var(--err)" }}>
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s5)", flexWrap:"wrap", alignItems:"center" }}>
        <button className={`btn btn-sm ${paused?"btn-success":"btn-danger"}`}
          onClick={() => setPaused(p=>!p)}>
          {paused?"▶ Resume":"⏸ Pause"}
        </button>
        <select className="select" style={{ width:"auto" }} value={filterRoom}
          onChange={e=>setFilterRoom(e.target.value)}>
          <option>All</option>
          {ROOMS.map(r=><option key={r}>{r}</option>)}
        </select>
        <select className="select" style={{ width:"auto" }} value={filterStatus}
          onChange={e=>setFilterStatus(e.target.value)}>
          <option>All</option>
          <option>online</option><option>offline</option><option>warning</option>
        </select>
        <div style={{ marginLeft:"auto", display:"flex", gap:"var(--s3)" }}>
          {Object.entries(summary).map(([s,c]) => (
            <span key={s} style={{ fontSize:"var(--sm)", color:STATUS_COLORS[s], fontWeight:700 }}>
              {c} {s}
            </span>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {bulk.length > 0 && (
        <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)", alignItems:"center",
          background:"var(--abg)", border:"1px solid rgba(124,58,237,.3)",
          borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)" }}>
          <span style={{ color:"var(--a2)", fontWeight:700, fontSize:"var(--sm)" }}>{bulk.length} selected</span>
          <button className="btn btn-info btn-sm"    onClick={() => bulkAction("restart")}>↺ Restart</button>
          <button className="btn btn-success btn-sm" onClick={() => bulkAction("update")}>⬆ Update FW</button>
          <button className="btn btn-danger btn-sm"  onClick={() => bulkAction("decommission")}>🗑 Decommission</button>
          <button className="btn btn-ghost btn-sm"   onClick={() => setBulk([])}>Cancel</button>
        </div>
      )}

      <div style={{ display:"flex", gap:"var(--s5)", flexWrap:"wrap" }}>
        {/* Device grid */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"var(--s3)" }}>
            {filtered.map(d => {
              const meta = DEVICE_TYPES[d.type];
              const isSel = selected===d.id;
              return (
                <div key={d.id}
                  onClick={() => setSelected(isSel?null:d.id)}
                  style={{ background:isSel?"var(--abg)":"var(--glass2)",
                    border:`1px solid ${isSel?"var(--a)":bulk.includes(d.id)?"var(--a2)":"var(--gb)"}`,
                    borderRadius:"var(--r2)", padding:"var(--s4)", cursor:"pointer",
                    transition:"all var(--tr)", opacity:d.power?1:0.5 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s2)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)" }}>
                      <input type="checkbox" checked={bulk.includes(d.id)}
                        onChange={e => { e.stopPropagation();
                          setBulk(b => b.includes(d.id)?b.filter(x=>x!==d.id):[...b,d.id]); }}
                        style={{ accentColor:"var(--a2)" }} onClick={e=>e.stopPropagation()} />
                      <span style={{ fontSize:20 }}>{meta.icon}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"var(--s2)" }}>
                      <div style={{ width:8, height:8, borderRadius:"50%",
                        background:STATUS_COLORS[d.status],
                        boxShadow:`0 0 6px ${STATUS_COLORS[d.status]}` }} />
                      <button onClick={e => { e.stopPropagation(); togglePower(d.id); }}
                        style={{ background:"none", border:"none", cursor:"pointer",
                          fontSize:16, color:d.power?"var(--ok)":"var(--t3)" }}>
                        {d.power?"🟢":"⚫"}
                      </button>
                    </div>
                  </div>
                  <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)", marginBottom:2 }}>{d.name}</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s3)" }}>
                    {d.room} · {meta.label}
                  </div>
                  {d.power && (
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--xs)" }}>
                      <span style={{ color:"var(--warn)" }}>🌡 {d.telemetry.temp.toFixed(1)}°C</span>
                      <span style={{ color:"var(--info)" }}>💧 {d.telemetry.humidity.toFixed(0)}%</span>
                    </div>
                  )}
                  <MiniLine data={d.history} color={STATUS_COLORS[d.status]} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        {sel && (
          <div style={{ minWidth:220, flex:"0 0 220px" }}>
            <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)" }}>
              <div style={{ fontWeight:700, color:"var(--t1)", marginBottom:"var(--s4)" }}>
                {DEVICE_TYPES[sel.type].icon} {sel.name}
              </div>
              {[
                { label:"Status",    val:sel.status,   color:STATUS_COLORS[sel.status] },
                { label:"Room",      val:sel.room,     color:"var(--t1)" },
                { label:"Firmware",  val:sel.firmware, color:"var(--a2)" },
                { label:"Last Seen", val:sel.lastSeen, color:"var(--t3)" },
              ].map(r => (
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
                  fontSize:"var(--sm)", padding:"var(--s1) 0", borderBottom:"1px solid var(--gb)" }}>
                  <span style={{ color:"var(--t2)" }}>{r.label}</span>
                  <span style={{ color:r.color, fontWeight:600, textTransform:"capitalize" }}>{r.val}</span>
                </div>
              ))}
              <div style={{ marginTop:"var(--s4)" }}>
                <div className="label" style={{ marginBottom:"var(--s2)" }}>Temp History</div>
                <MiniLine data={sel.history} color="var(--a2)" w={180} h={50} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
