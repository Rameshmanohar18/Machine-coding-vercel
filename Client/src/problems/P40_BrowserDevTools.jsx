/**
 * PROBLEM 40 — Browser DevTools Clone
 * Asked at: BrowserStack, Atlassian, Thoughtworks
 *
 * Requirements:
 * - Elements panel: DOM tree inspector
 * - Console panel: log/warn/error/info with filtering
 * - Network panel: request list with status, method, size, timing
 * - Performance panel: FPS meter + memory usage
 * - Sources panel: file tree + code viewer
 * - Resizable panels
 * - Search in console
 * - Clear console
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ── Mock data ────────────────────────────────────────────────
const DOM_TREE = {
  tag:"html", attrs:{lang:"en"}, children:[
    { tag:"head", attrs:{}, children:[
      { tag:"title", attrs:{}, text:"My App" },
      { tag:"meta",  attrs:{charset:"UTF-8"} },
    ]},
    { tag:"body", attrs:{class:"app"}, children:[
      { tag:"div", attrs:{id:"root", class:"container"}, children:[
        { tag:"header", attrs:{class:"header"}, children:[
          { tag:"h1", attrs:{}, text:"Hello World" },
          { tag:"nav", attrs:{class:"nav"}, children:[
            { tag:"a", attrs:{href:"/"}, text:"Home" },
            { tag:"a", attrs:{href:"/about"}, text:"About" },
          ]},
        ]},
        { tag:"main", attrs:{class:"main"}, children:[
          { tag:"p", attrs:{class:"text"}, text:"Welcome to the app" },
          { tag:"button", attrs:{id:"btn", class:"btn-primary"}, text:"Click me" },
        ]},
      ]},
    ]},
  ]
};

const NETWORK_REQUESTS = [
  { id:1, method:"GET",  url:"/api/users",    status:200, type:"fetch",  size:"2.4 KB", time:"45ms"  },
  { id:2, method:"POST", url:"/api/login",    status:200, type:"fetch",  size:"0.8 KB", time:"120ms" },
  { id:3, method:"GET",  url:"/static/app.js",status:200, type:"script", size:"245 KB", time:"380ms" },
  { id:4, method:"GET",  url:"/static/app.css",status:200,type:"style",  size:"18 KB",  time:"55ms"  },
  { id:5, method:"GET",  url:"/api/products", status:404, type:"fetch",  size:"0.2 KB", time:"32ms"  },
  { id:6, method:"PUT",  url:"/api/user/1",   status:500, type:"fetch",  size:"0.1 KB", time:"89ms"  },
];

const FILES = {
  "src": {
    "App.jsx":    `import React from 'react';\n\nexport default function App() {\n  return <div>Hello World</div>;\n}`,
    "index.css":  `body { margin: 0; font-family: sans-serif; }\n.container { max-width: 1200px; }`,
    "components": {
      "Button.jsx": `export const Button = ({ children, onClick }) => (\n  <button onClick={onClick}>{children}</button>\n);`,
    }
  }
};

let logId = 1;
const INIT_LOGS = [
  { id:logId++, type:"log",   msg:"App initialized",          time:"10:00:01" },
  { id:logId++, type:"info",  msg:"React version: 18.3.1",    time:"10:00:01" },
  { id:logId++, type:"warn",  msg:"useEffect missing deps",   time:"10:00:02" },
  { id:logId++, type:"error", msg:"Cannot read property 'id'",time:"10:00:03" },
  { id:logId++, type:"log",   msg:"Component mounted",        time:"10:00:04" },
];

// ── DOM Node component ───────────────────────────────────────
function DOMNode({ node, depth=0 }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;
  const indent = depth * 16;

  return (
    <div style={{ fontFamily:"var(--mono)", fontSize:"var(--xs)" }}>
      <div style={{ paddingLeft:indent, display:"flex", alignItems:"center", gap:4,
        padding:`2px 4px 2px ${indent+4}px`, borderRadius:3, cursor:"pointer",
        color:"var(--t1)" }}
        onClick={() => hasChildren && setOpen(o=>!o)}
        onMouseEnter={e=>e.currentTarget.style.background="var(--glass2)"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        {hasChildren && (
          <span style={{ color:"var(--t3)", width:10 }}>{open?"▼":"▶"}</span>
        )}
        {!hasChildren && <span style={{ width:10 }} />}
        <span style={{ color:"var(--err)" }}>&lt;</span>
        <span style={{ color:"var(--a2)" }}>{node.tag}</span>
        {Object.entries(node.attrs||{}).map(([k,v]) => (
          <span key={k}>
            <span style={{ color:"var(--ok)" }}> {k}</span>
            <span style={{ color:"var(--t3)" }}>="</span>
            <span style={{ color:"var(--warn)" }}>{v}</span>
            <span style={{ color:"var(--t3)" }}>"</span>
          </span>
        ))}
        {!hasChildren && !node.text && <span style={{ color:"var(--err)" }}>/&gt;</span>}
        {!hasChildren && node.text && (
          <>
            <span style={{ color:"var(--err)" }}>&gt;</span>
            <span style={{ color:"var(--t1)" }}>{node.text}</span>
            <span style={{ color:"var(--err)" }}>&lt;/{node.tag}&gt;</span>
          </>
        )}
        {hasChildren && !open && (
          <span style={{ color:"var(--t3)" }}>…&lt;/{node.tag}&gt;</span>
        )}
      </div>
      {open && hasChildren && (
        <>
          {node.children.map((c,i) => <DOMNode key={i} node={c} depth={depth+1} />)}
          <div style={{ paddingLeft:indent+4, fontFamily:"var(--mono)", fontSize:"var(--xs)",
            color:"var(--err)" }}>
            &lt;/{node.tag}&gt;
          </div>
        </>
      )}
    </div>
  );
}

// ── File tree ────────────────────────────────────────────────
function FileTree({ tree, path="", onSelect, selected }) {
  return (
    <div>
      {Object.entries(tree).map(([name, val]) => {
        const fullPath = path ? `${path}/${name}` : name;
        const isFile = typeof val === "string";
        return (
          <div key={name}>
            <div style={{ padding:"3px 8px", cursor:"pointer", fontSize:"var(--xs)",
              fontFamily:"var(--mono)", color:selected===fullPath?"var(--a2)":"var(--t2)",
              background:selected===fullPath?"var(--abg)":"transparent",
              borderRadius:3, display:"flex", alignItems:"center", gap:6 }}
              onClick={() => isFile && onSelect(fullPath, val)}
              onMouseEnter={e=>e.currentTarget.style.background=selected===fullPath?"var(--abg)":"var(--glass2)"}
              onMouseLeave={e=>e.currentTarget.style.background=selected===fullPath?"var(--abg)":"transparent"}>
              <span>{isFile?"📄":"📁"}</span>
              {name}
            </div>
            {!isFile && <div style={{ paddingLeft:12 }}>
              <FileTree tree={val} path={fullPath} onSelect={onSelect} selected={selected} />
            </div>}
          </div>
        );
      })}
    </div>
  );
}

export default function BrowserDevTools() {
  const [panel,    setPanel]    = useState("elements");
  const [logs,     setLogs]     = useState(INIT_LOGS);
  const [logFilter,setLogFilter]= useState("all");
  const [search,   setSearch]   = useState("");
  const [fps,      setFps]      = useState(60);
  const [memory,   setMemory]   = useState(45);
  const [fpsHistory,setFpsHistory]=useState(Array(30).fill(60));
  const [selFile,  setSelFile]  = useState(null);
  const [fileCode, setFileCode] = useState("");
  const [selRequest,setSelRequest]=useState(null);
  const [paused,   setPaused]   = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      const newFps = Math.max(30, Math.min(60, fps + (Math.random()-0.4)*8));
      setFps(Math.round(newFps));
      setFpsHistory(h => [...h.slice(1), newFps]);
      setMemory(m => Math.max(20, Math.min(90, m + (Math.random()-0.5)*3)));
    }, 500);
    return () => clearInterval(t);
  }, [fps, paused]);

  const addLog = (type) => {
    const msgs = {
      log:["Component re-rendered","State updated","Props changed"],
      warn:["Deprecated API used","Missing key prop","Large bundle size"],
      error:["Uncaught TypeError","Network request failed","Invalid hook call"],
      info:["Build completed","HMR update applied","Cache cleared"],
    };
    const msg = msgs[type][Math.floor(Math.random()*3)];
    setLogs(l => [...l, { id:logId++, type, msg, time:new Date().toLocaleTimeString() }]);
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter !== "all" && l.type !== logFilter) return false;
    if (search && !l.msg.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const LOG_COLORS = { log:"var(--t1)", info:"var(--info)", warn:"var(--warn)", error:"var(--err)" };
  const LOG_BG     = { log:"transparent", info:"var(--info-bg)", warn:"var(--warn-bg)", error:"var(--err-bg)" };
  const STATUS_COLOR = (s) => s>=500?"var(--err)":s>=400?"var(--warn)":"var(--ok)";

  const PANELS = ["elements","console","network","performance","sources"];

  return (
    <div className="card" style={{ padding:0, overflow:"hidden" }}>
      {/* DevTools chrome */}
      <div style={{ background:"rgba(13,16,37,.98)", borderBottom:"1px solid var(--gb)" }}>
        <div style={{ padding:"var(--s2) var(--s4)", borderBottom:"1px solid var(--gb)",
          fontSize:"var(--xs)", color:"var(--t3)", display:"flex", alignItems:"center", gap:"var(--s3)" }}>
          <span>🔧 DevTools</span>
          <span style={{ marginLeft:"auto" }}>localhost:5173</span>
        </div>
        <div style={{ display:"flex", gap:0, padding:"0 var(--s2)" }}>
          {PANELS.map(p => (
            <button key={p} onClick={() => setPanel(p)}
              style={{ padding:"8px 14px", background:"none", border:"none", cursor:"pointer",
                fontFamily:"var(--font)", fontSize:"var(--xs)", fontWeight:panel===p?700:400,
                color:panel===p?"var(--a2)":"var(--t3)",
                borderBottom:panel===p?"2px solid var(--a2)":"2px solid transparent",
                marginBottom:-1, transition:"all var(--tr)", textTransform:"capitalize" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"var(--s4)", minHeight:400 }}>

        {/* ELEMENTS */}
        {panel === "elements" && (
          <div>
            <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s3)" }}>
              DOM Inspector — click to expand/collapse nodes
            </div>
            <div style={{ background:"var(--glass)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s3)", maxHeight:400, overflowY:"auto" }}>
              <DOMNode node={DOM_TREE} />
            </div>
          </div>
        )}

        {/* CONSOLE */}
        {panel === "console" && (
          <div>
            <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s3)", flexWrap:"wrap" }}>
              <input className="input" style={{ flex:1, fontSize:"var(--xs)", padding:"6px 10px" }}
                placeholder="Filter console..." value={search}
                onChange={e=>setSearch(e.target.value)} />
              {["all","log","info","warn","error"].map(f => (
                <button key={f} className={`btn btn-sm ${logFilter===f?"btn-primary":"btn-ghost"}`}
                  onClick={() => setLogFilter(f)}>
                  {f}
                </button>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={() => setLogs([])}>🗑 Clear</button>
            </div>

            <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s3)" }}>
              {["log","info","warn","error"].map(t => (
                <button key={t} className="btn btn-ghost btn-sm" onClick={() => addLog(t)}>
                  + {t}
                </button>
              ))}
            </div>

            <div style={{ background:"var(--glass)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", maxHeight:300, overflowY:"auto" }}>
              {filteredLogs.map(l => (
                <div key={l.id} style={{ display:"flex", gap:"var(--s3)", padding:"4px 8px",
                  borderBottom:"1px solid var(--gb)", background:LOG_BG[l.type],
                  fontFamily:"var(--mono)", fontSize:"var(--xs)" }}>
                  <span style={{ color:"var(--t3)", minWidth:60 }}>{l.time}</span>
                  <span style={{ color:LOG_COLORS[l.type], fontWeight:l.type==="error"||l.type==="warn"?700:400 }}>
                    {l.type==="error"?"❌":l.type==="warn"?"⚠️":l.type==="info"?"ℹ️":">"} {l.msg}
                  </span>
                </div>
              ))}
              {filteredLogs.length===0 && (
                <div style={{ padding:"var(--s4)", color:"var(--t3)", fontSize:"var(--xs)", textAlign:"center" }}>
                  No console messages
                </div>
              )}
            </div>
          </div>
        )}

        {/* NETWORK */}
        {panel === "network" && (
          <div>
            <div style={{ overflowX:"auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Method</th><th>URL</th><th>Status</th>
                    <th>Type</th><th>Size</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {NETWORK_REQUESTS.map(r => (
                    <tr key={r.id} onClick={() => setSelRequest(selRequest?.id===r.id?null:r)}
                      style={{ cursor:"pointer",
                        background:selRequest?.id===r.id?"var(--abg)":"transparent" }}>
                      <td>
                        <span style={{ fontFamily:"var(--mono)", fontSize:"var(--xs)",
                          color:r.method==="GET"?"var(--ok)":r.method==="POST"?"var(--a2)":"var(--warn)",
                          fontWeight:700 }}>{r.method}</span>
                      </td>
                      <td style={{ fontFamily:"var(--mono)", fontSize:"var(--xs)",
                        maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {r.url}
                      </td>
                      <td>
                        <span style={{ color:STATUS_COLOR(r.status), fontWeight:700,
                          fontFamily:"var(--mono)", fontSize:"var(--xs)" }}>{r.status}</span>
                      </td>
                      <td style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{r.type}</td>
                      <td style={{ fontFamily:"var(--mono)", fontSize:"var(--xs)" }}>{r.size}</td>
                      <td style={{ fontFamily:"var(--mono)", fontSize:"var(--xs)", color:"var(--a2)" }}>{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selRequest && (
              <div style={{ marginTop:"var(--s4)", background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)", padding:"var(--s4)" }}>
                <div style={{ fontWeight:700, color:"var(--t1)", marginBottom:"var(--s3)" }}>
                  Request Details: {selRequest.url}
                </div>
                <div style={{ fontFamily:"var(--mono)", fontSize:"var(--xs)", color:"var(--t2)" }}>
                  {`Status: ${selRequest.status}\nMethod: ${selRequest.method}\nType: ${selRequest.type}\nSize: ${selRequest.size}\nTime: ${selRequest.time}`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PERFORMANCE */}
        {panel === "performance" && (
          <div>
            <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s5)", alignItems:"center" }}>
              <button className={`btn btn-sm ${paused?"btn-success":"btn-danger"}`}
                onClick={() => setPaused(p=>!p)}>
                {paused?"▶ Resume":"⏸ Pause"}
              </button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--s4)" }}>
              {/* FPS */}
              <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)", padding:"var(--s4)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s3)" }}>
                  <span className="label">FPS</span>
                  <span style={{ fontSize:"var(--xl)", fontWeight:800,
                    color:fps<30?"var(--err)":fps<50?"var(--warn)":"var(--ok)" }}>
                    {fps}
                  </span>
                </div>
                <svg width="100%" height={60}>
                  <polyline
                    points={fpsHistory.map((v,i) => `${(i/29)*100}%,${60-(v/60)*55}`).join(" ")}
                    fill="none" stroke="var(--ok)" strokeWidth={1.5} />
                </svg>
              </div>

              {/* Memory */}
              <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)", padding:"var(--s4)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s3)" }}>
                  <span className="label">JS Heap</span>
                  <span style={{ fontSize:"var(--xl)", fontWeight:800,
                    color:memory>80?"var(--err)":memory>60?"var(--warn)":"var(--a2)" }}>
                    {memory.toFixed(0)}%
                  </span>
                </div>
                <div style={{ height:8, background:"var(--gb)", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${memory}%`,
                    background:memory>80?"var(--err)":memory>60?"var(--warn)":"var(--a2)",
                    borderRadius:4, transition:"width .5s ease" }} />
                </div>
                <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginTop:"var(--s2)" }}>
                  {(memory*0.5).toFixed(1)} MB / 50 MB
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOURCES */}
        {panel === "sources" && (
          <div style={{ display:"flex", gap:"var(--s4)", height:400 }}>
            <div style={{ width:180, flexShrink:0, background:"var(--glass)",
              border:"1px solid var(--gb)", borderRadius:"var(--r2)", padding:"var(--s3)",
              overflowY:"auto" }}>
              <div className="label" style={{ marginBottom:"var(--s2)" }}>Files</div>
              <FileTree tree={FILES} onSelect={(path,code) => { setSelFile(path); setFileCode(code); }}
                selected={selFile} />
            </div>
            <div style={{ flex:1, background:"var(--glass)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", overflow:"hidden" }}>
              {selFile ? (
                <>
                  <div style={{ padding:"var(--s2) var(--s4)", borderBottom:"1px solid var(--gb)",
                    fontSize:"var(--xs)", color:"var(--a2)", fontFamily:"var(--mono)" }}>
                    {selFile}
                  </div>
                  <pre style={{ margin:0, padding:"var(--s4)", fontSize:"var(--xs)",
                    color:"var(--t1)", overflowY:"auto", height:"calc(100% - 32px)",
                    background:"transparent", border:"none" }}>
                    {fileCode}
                  </pre>
                </>
              ) : (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
                  height:"100%", color:"var(--t3)", fontSize:"var(--sm)" }}>
                  Select a file to view source
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
