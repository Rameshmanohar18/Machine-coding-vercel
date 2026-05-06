/**
 * PROBLEM 34 — Live Code Playground
 * Asked at: Thoughtworks, Atlassian, Replit-style companies
 *
 * Requirements:
 * - HTML / CSS / JS tabs with code editors (textarea-based)
 * - Live preview in iframe (srcdoc)
 * - Auto-run on change (debounced 800ms)
 * - Preset templates (Hello World, Counter, Todo, Clock)
 * - Console output capture
 * - Error display
 * - Copy code button
 * - Fullscreen preview
 * - Line numbers
 */

import { useState, useEffect, useRef, useCallback } from "react";

const TEMPLATES = {
  "Hello World": {
    html:`<div class="container">
  <h1>Hello, World! 👋</h1>
  <p>Edit the code to see live changes.</p>
</div>`,
    css:`body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0; }
.container { text-align: center; padding: 40px; background: rgba(255,255,255,0.05); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
h1 { font-size: 2.5rem; background: linear-gradient(135deg, #a78bfa, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }`,
    js:`console.log("Hello from the playground!");`
  },
  "Counter": {
    html:`<div class="counter">
  <h2>Counter</h2>
  <div class="display" id="count">0</div>
  <div class="buttons">
    <button onclick="change(-1)">−</button>
    <button onclick="reset()">Reset</button>
    <button onclick="change(1)">+</button>
  </div>
</div>`,
    css:`body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0f172a;color:#e2e8f0}
.counter{text-align:center;padding:40px;background:rgba(255,255,255,.05);border-radius:16px;border:1px solid rgba(255,255,255,.1)}
.display{font-size:5rem;font-weight:800;color:#a78bfa;margin:20px 0}
.buttons{display:flex;gap:12px;justify-content:center}
button{padding:12px 24px;border:none;border-radius:8px;background:rgba(124,58,237,.3);color:#a78bfa;font-size:1.2rem;cursor:pointer;transition:all .2s}
button:hover{background:rgba(124,58,237,.6)}`,
    js:`let count = 0;
function change(n) { count += n; document.getElementById('count').textContent = count; }
function reset() { count = 0; document.getElementById('count').textContent = 0; }`
  },
  "Clock": {
    html:`<div class="clock">
  <div class="time" id="time">00:00:00</div>
  <div class="date" id="date"></div>
</div>`,
    css:`body{font-family:monospace;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0f172a;color:#e2e8f0}
.clock{text-align:center}
.time{font-size:4rem;font-weight:800;color:#22d3ee;letter-spacing:4px}
.date{font-size:1rem;color:#94a3b8;margin-top:8px}`,
    js:`function update() {
  const now = new Date();
  document.getElementById('time').textContent = now.toLocaleTimeString();
  document.getElementById('date').textContent = now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}
update();
setInterval(update, 1000);`
  },
  "Todo App": {
    html:`<div class="app">
  <h2>Todo List</h2>
  <div class="input-row">
    <input id="inp" placeholder="Add a task..." onkeydown="if(event.key==='Enter')add()"/>
    <button onclick="add()">Add</button>
  </div>
  <ul id="list"></ul>
</div>`,
    css:`body{font-family:sans-serif;display:flex;justify-content:center;padding:40px;margin:0;background:#0f172a;color:#e2e8f0}
.app{width:100%;max-width:400px}
h2{color:#a78bfa;margin-bottom:20px}
.input-row{display:flex;gap:8px;margin-bottom:16px}
input{flex:1;padding:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#e2e8f0;outline:none}
button{padding:10px 16px;background:linear-gradient(135deg,#7c3aed,#a78bfa);border:none;border-radius:8px;color:#fff;cursor:pointer}
ul{list-style:none;padding:0}
li{padding:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;cursor:pointer}
li.done{text-decoration:line-through;opacity:.5}`,
    js:`function add(){const inp=document.getElementById('inp');if(!inp.value.trim())return;const li=document.createElement('li');li.textContent=inp.value;li.onclick=()=>li.classList.toggle('done');inp.value='';document.getElementById('list').appendChild(li);}`
  }
};

function LineNumbers({ code }) {
  const lines = code.split("\n").length;
  return (
    <div style={{ padding:"12px 8px", background:"rgba(0,0,0,.3)", borderRight:"1px solid var(--gb)",
      textAlign:"right", userSelect:"none", minWidth:36, flexShrink:0 }}>
      {Array.from({length:lines},(_,i) => (
        <div key={i} style={{ fontSize:"var(--xs)", color:"var(--t3)", lineHeight:"1.6",
          fontFamily:"var(--mono)" }}>{i+1}</div>
      ))}
    </div>
  );
}

export default function CodePlayground() {
  const [tab,      setTab]      = useState("html");
  const [html,     setHtml]     = useState(TEMPLATES["Hello World"].html);
  const [css,      setCss]      = useState(TEMPLATES["Hello World"].css);
  const [js,       setJs]       = useState(TEMPLATES["Hello World"].js);
  const [preview,  setPreview]  = useState("");
  const [fullscreen,setFullscreen]=useState(false);
  const [copied,   setCopied]   = useState(false);
  const [template, setTemplate] = useState("Hello World");
  const timerRef = useRef(null);

  const buildPreview = useCallback((h, c, j) => {
    return `<!DOCTYPE html><html><head><style>${c}</style></head><body>${h}<script>
try { ${j} } catch(e) { document.body.innerHTML += '<div style="position:fixed;bottom:0;left:0;right:0;background:#ef4444;color:#fff;padding:8px 16px;font-family:monospace;font-size:12px">Error: '+e.message+'</div>'; }
</script></body></html>`;
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPreview(buildPreview(html, css, js));
    }, 800);
    return () => clearTimeout(timerRef.current);
  }, [html, css, js, buildPreview]);

  const loadTemplate = (name) => {
    const t = TEMPLATES[name];
    setHtml(t.html); setCss(t.css); setJs(t.js);
    setTemplate(name);
  };

  const copyCode = () => {
    const code = tab==="html"?html:tab==="css"?css:js;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentCode = tab==="html"?html:tab==="css"?css:js;
  const setCurrentCode = tab==="html"?setHtml:tab==="css"?setCss:setJs;

  const TAB_COLORS = { html:"#f97316", css:"#3b82f6", js:"#f59e0b" };

  return (
    <div className="card">
      <h2 className="card-title">⚡ Live Code Playground</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Thoughtworks, Atlassian, Replit-style.</strong> HTML/CSS/JS editor with
        live iframe preview (debounced), preset templates, line numbers, copy, fullscreen.
      </p>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s4)", flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", gap:"var(--s1)" }}>
          {Object.keys(TEMPLATES).map(t => (
            <button key={t} className={`btn btn-sm ${template===t?"btn-primary":"btn-ghost"}`}
              onClick={() => loadTemplate(t)}>
              {t}
            </button>
          ))}
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:"var(--s2)" }}>
          <button className="btn btn-ghost btn-sm" onClick={copyCode}>
            {copied ? "✓ Copied!" : "📋 Copy"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setFullscreen(f=>!f)}>
            {fullscreen ? "⊡ Exit" : "⊞ Fullscreen"}
          </button>
        </div>
      </div>

      <div style={{ display:"flex", gap:"var(--s4)", flexWrap:"wrap" }}>
        {/* Editor */}
        <div style={{ flex:1, minWidth:280 }}>
          {/* Language tabs */}
          <div style={{ display:"flex", gap:0, marginBottom:0 }}>
            {["html","css","js"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding:"6px 16px", background:tab===t?TAB_COLORS[t]+"22":"var(--glass)",
                  border:`1px solid ${tab===t?TAB_COLORS[t]:"var(--gb)"}`,
                  borderBottom:tab===t?"1px solid transparent":"1px solid var(--gb)",
                  borderRadius:"var(--r1) var(--r1) 0 0",
                  cursor:"pointer", fontFamily:"var(--mono)", fontSize:"var(--xs)",
                  fontWeight:tab===t?700:400, color:tab===t?TAB_COLORS[t]:"var(--t3)",
                  marginRight:2, transition:"all var(--tr)" }}>
                .{t}
              </button>
            ))}
          </div>

          {/* Code area */}
          <div style={{ display:"flex", border:"1px solid var(--gb)", borderRadius:"0 var(--r1) var(--r1) var(--r1)",
            overflow:"hidden", background:"rgba(0,0,0,.4)" }}>
            <LineNumbers code={currentCode} />
            <textarea
              value={currentCode}
              onChange={e => setCurrentCode(e.target.value)}
              spellCheck={false}
              style={{
                flex:1, padding:"12px", background:"transparent", border:"none", outline:"none",
                color:"var(--t1)", fontFamily:"var(--mono)", fontSize:"var(--sm)",
                lineHeight:1.6, resize:"none", minHeight:300, tabSize:2
              }}
            />
          </div>
        </div>

        {/* Preview */}
        <div style={{ flex:1, minWidth:280 }}>
          <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s2)",
            textTransform:"uppercase", letterSpacing:".08em", fontWeight:700 }}>
            Preview
          </div>
          <div style={{
            border:"1px solid var(--gb)", borderRadius:"var(--r2)", overflow:"hidden",
            height: fullscreen ? "80vh" : 340,
            position: fullscreen ? "fixed" : "relative",
            ...(fullscreen ? { inset:20, zIndex:200, height:"auto" } : {})
          }}>
            <iframe
              srcDoc={preview}
              title="preview"
              sandbox="allow-scripts"
              style={{ width:"100%", height:"100%", border:"none", background:"#fff" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
