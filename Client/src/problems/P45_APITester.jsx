/**
 * PROBLEM 45 — API Tester (Postman Clone)
 * Asked at: BrowserStack, Thoughtworks, Atlassian
 */

import { useState, useCallback } from "react";

const METHODS = ["GET","POST","PUT","PATCH","DELETE"];
const METHOD_COLORS = { GET:"var(--ok)", POST:"var(--a2)", PUT:"var(--warn)", PATCH:"var(--info)", DELETE:"var(--err)" };

const PRESETS = [
  { name:"Get Users",    method:"GET",  url:"https://jsonplaceholder.typicode.com/users",    body:"" },
  { name:"Get Post",     method:"GET",  url:"https://jsonplaceholder.typicode.com/posts/1",  body:"" },
  { name:"Create Post",  method:"POST", url:"https://jsonplaceholder.typicode.com/posts",
    body:'{\n  "title": "Test Post",\n  "body": "Hello World",\n  "userId": 1\n}' },
  { name:"Update Post",  method:"PUT",  url:"https://jsonplaceholder.typicode.com/posts/1",
    body:'{\n  "id": 1,\n  "title": "Updated",\n  "body": "Updated body",\n  "userId": 1\n}' },
];

let histId = 1;

export default function APITester() {
  const [method,   setMethod]   = useState("GET");
  const [url,      setUrl]      = useState("https://jsonplaceholder.typicode.com/users");
  const [body,     setBody]     = useState("");
  const [headers,  setHeaders]  = useState([{ key:"Content-Type", value:"application/json" }]);
  const [response, setResponse] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [history,  setHistory]  = useState([]);
  const [tab,      setTab]      = useState("body"); // body | headers | response
  const [resTab,   setResTab]   = useState("pretty"); // pretty | raw | headers

  const sendRequest = useCallback(async () => {
    setLoading(true); setError(null); setResponse(null);
    const start = Date.now();
    try {
      const opts = {
        method,
        headers: Object.fromEntries(headers.filter(h=>h.key).map(h=>[h.key,h.value])),
      };
      if (["POST","PUT","PATCH"].includes(method) && body) opts.body = body;
      const res = await fetch(url, opts);
      const data = await res.json();
      const time = Date.now() - start;
      const resp = {
        status:res.status, statusText:res.statusText,
        data, time, size:JSON.stringify(data).length,
        headers:Object.fromEntries(res.headers.entries())
      };
      setResponse(resp);
      setHistory(h => [{ id:histId++, method, url, status:res.status, time }, ...h].slice(0,10));
      setTab("response");
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [method, url, body, headers]);

  const addHeader = () => setHeaders(h => [...h, { key:"", value:"" }]);
  const updateHeader = (i, k, v) => setHeaders(h => h.map((x,idx) => idx===i ? { ...x, [k]:v } : x));
  const removeHeader = (i) => setHeaders(h => h.filter((_,idx) => idx!==i));

  return (
    <div className="card">
      <h2 className="card-title">🔌 API Tester (Postman Clone)</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at BrowserStack, Thoughtworks.</strong> HTTP client with method selector,
        headers, request body, response viewer, history, presets.
      </p>

      {/* Presets */}
      <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)", flexWrap:"wrap" }}>
        {PRESETS.map(p => (
          <button key={p.name} className="btn btn-ghost btn-sm"
            onClick={() => { setMethod(p.method); setUrl(p.url); setBody(p.body); }}>
            {p.name}
          </button>
        ))}
      </div>

      {/* URL bar */}
      <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)" }}>
        <select className="select" style={{ width:"auto" }} value={method}
          onChange={e=>setMethod(e.target.value)}>
          {METHODS.map(m => (
            <option key={m} value={m} style={{ color:METHOD_COLORS[m] }}>{m}</option>
          ))}
        </select>
        <input className="input" style={{ flex:1 }} placeholder="Enter URL..."
          value={url} onChange={e=>setUrl(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&sendRequest()} />
        <button className="btn btn-primary" onClick={sendRequest} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width:14,height:14,borderWidth:2 }} /> Sending</> : "Send"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--gb)", marginBottom:"var(--s4)" }}>
        {[["body","Body"],["headers","Headers"],["response","Response"]].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:"6px 14px", background:"none", border:"none", cursor:"pointer",
              fontFamily:"var(--font)", fontSize:"var(--sm)", fontWeight:tab===t?700:400,
              color:tab===t?"var(--a2)":"var(--t3)",
              borderBottom:tab===t?"2px solid var(--a2)":"2px solid transparent",
              marginBottom:-1, transition:"all var(--tr)" }}>
            {l}
            {t==="response"&&response&&(
              <span style={{ marginLeft:"var(--s2)", color:response.status<400?"var(--ok)":"var(--err)",
                fontWeight:800 }}>{response.status}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "body" && (
        <textarea className="textarea" style={{ minHeight:160, fontFamily:"var(--mono)", fontSize:"var(--xs)" }}
          placeholder='{\n  "key": "value"\n}'
          value={body} onChange={e=>setBody(e.target.value)} />
      )}

      {tab === "headers" && (
        <div>
          {headers.map((h,i) => (
            <div key={i} style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s2)" }}>
              <input className="input" placeholder="Header name" value={h.key}
                onChange={e=>updateHeader(i,"key",e.target.value)} />
              <input className="input" placeholder="Value" value={h.value}
                onChange={e=>updateHeader(i,"value",e.target.value)} />
              <button className="btn btn-danger btn-sm" onClick={() => removeHeader(i)}>✕</button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={addHeader}>+ Add Header</button>
        </div>
      )}

      {tab === "response" && (
        <div>
          {error && (
            <div style={{ background:"var(--err-bg)", border:"1px solid rgba(239,68,68,.3)",
              borderRadius:"var(--r2)", padding:"var(--s4)", color:"var(--err)", fontSize:"var(--sm)" }}>
              ❌ {error}
            </div>
          )}
          {response && (
            <div>
              <div style={{ display:"flex", gap:"var(--s4)", marginBottom:"var(--s3)", flexWrap:"wrap" }}>
                <span style={{ color:response.status<400?"var(--ok)":"var(--err)", fontWeight:800 }}>
                  {response.status} {response.statusText}
                </span>
                <span style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>{response.time}ms</span>
                <span style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>
                  {(response.size/1024).toFixed(1)} KB
                </span>
              </div>
              <div style={{ display:"flex", gap:"var(--s1)", marginBottom:"var(--s3)" }}>
                {["pretty","raw"].map(t => (
                  <button key={t} className={`btn btn-sm ${resTab===t?"btn-primary":"btn-ghost"}`}
                    onClick={() => setResTab(t)}>{t}</button>
                ))}
              </div>
              <pre style={{ background:"var(--glass)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)", padding:"var(--s4)", maxHeight:300, overflowY:"auto",
                fontSize:"var(--xs)", color:"var(--t1)", fontFamily:"var(--mono)" }}>
                {resTab==="pretty"
                  ? JSON.stringify(response.data, null, 2)
                  : JSON.stringify(response.data)
                }
              </pre>
            </div>
          )}
          {!response && !error && !loading && (
            <div style={{ textAlign:"center", color:"var(--t3)", padding:"var(--s8)" }}>
              Send a request to see the response
            </div>
          )}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div style={{ marginTop:"var(--s5)" }}>
          <div className="label" style={{ marginBottom:"var(--s2)" }}>History</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s1)" }}>
            {history.map(h => (
              <div key={h.id}
                onClick={() => { setMethod(h.method); setUrl(h.url); }}
                style={{ display:"flex", gap:"var(--s3)", alignItems:"center",
                  padding:"4px 8px", borderRadius:"var(--r1)", cursor:"pointer",
                  fontSize:"var(--xs)", fontFamily:"var(--mono)" }}
                onMouseEnter={e=>e.currentTarget.style.background="var(--glass2)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{ color:METHOD_COLORS[h.method], fontWeight:700, minWidth:50 }}>{h.method}</span>
                <span style={{ color:"var(--t2)", flex:1, overflow:"hidden", textOverflow:"ellipsis",
                  whiteSpace:"nowrap" }}>{h.url}</span>
                <span style={{ color:h.status<400?"var(--ok)":"var(--err)", fontWeight:700 }}>{h.status}</span>
                <span style={{ color:"var(--t3)" }}>{h.time}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
