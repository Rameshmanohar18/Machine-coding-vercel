/**
 * PROBLEM 19 — Interactive Network / Dependency Diagram
 * ─────────────────────────────────────────────────────────────
 * Asked at: VMware, Broadcom, ServiceNow (infrastructure teams)
 *
 * Requirements:
 * - SVG-based node graph (no library)
 * - Drag nodes to reposition
 * - Add/remove nodes and edges
 * - Node types: Server, Database, Service, Client, Load Balancer
 * - Click node to see details
 * - Highlight connected nodes on hover
 * - Status indicators (healthy/warning/down)
 * - Auto-layout button
 */

import { useState, useRef, useCallback, useEffect } from "react";

const NODE_TYPES = {
  Server:       { icon:"🖥",  color:"#a78bfa" },
  Database:     { icon:"🗄",  color:"#22d3ee" },
  Service:      { icon:"⚙️",  color:"#10b981" },
  Client:       { icon:"💻",  color:"#f59e0b" },
  LoadBalancer: { icon:"⚖️",  color:"#ef4444" },
};

const STATUS_COLORS = { healthy:"#10b981", warning:"#f59e0b", down:"#ef4444" };

let nodeId = 10;

const INITIAL_NODES = [
  { id:1, label:"Load Balancer", type:"LoadBalancer", x:350, y:60,  status:"healthy" },
  { id:2, label:"Web Server 1",  type:"Server",       x:180, y:180, status:"healthy" },
  { id:3, label:"Web Server 2",  type:"Server",       x:520, y:180, status:"warning" },
  { id:4, label:"API Gateway",   type:"Service",      x:350, y:180, status:"healthy" },
  { id:5, label:"Auth Service",  type:"Service",      x:180, y:300, status:"healthy" },
  { id:6, label:"Main DB",       type:"Database",     x:350, y:300, status:"healthy" },
  { id:7, label:"Cache",         type:"Database",     x:520, y:300, status:"down"    },
  { id:8, label:"Client App",    type:"Client",       x:350, y:420, status:"healthy" },
];

const INITIAL_EDGES = [
  [1,2],[1,3],[1,4],[4,5],[4,6],[4,7],[2,6],[3,6],[8,4]
];

export default function NetworkDiagram() {
  const [nodes,    setNodes]    = useState(INITIAL_NODES);
  const [edges,    setEdges]    = useState(INITIAL_EDGES);
  const [selected, setSelected] = useState(null);
  const [hovered,  setHovered]  = useState(null);
  const [dragging, setDragging] = useState(null); // { id, offsetX, offsetY }
  const [addEdge,  setAddEdge]  = useState(null); // first node of new edge
  const [newNode,  setNewNode]  = useState({ label:"New Node", type:"Server" });
  const svgRef = useRef(null);

  const onMouseDown = useCallback((e, id) => {
    e.stopPropagation();
    if (addEdge !== null) {
      if (addEdge !== id) {
        setEdges(ed => [...ed, [addEdge, id]]);
      }
      setAddEdge(null);
      return;
    }
    const node = nodes.find(n => n.id === id);
    const rect = svgRef.current.getBoundingClientRect();
    setDragging({ id, offsetX: e.clientX - rect.left - node.x, offsetY: e.clientY - rect.top - node.y });
    setSelected(id);
  }, [nodes, addEdge]);

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragging.offsetX;
    const y = e.clientY - rect.top  - dragging.offsetY;
    setNodes(prev => prev.map(n => n.id === dragging.id ? { ...n, x, y } : n));
  }, [dragging]);

  const onMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  const addNode = () => {
    setNodes(n => [...n, { id:nodeId++, ...newNode, x:200+Math.random()*300, y:200+Math.random()*200, status:"healthy" }]);
  };

  const removeNode = (id) => {
    setNodes(n => n.filter(x => x.id !== id));
    setEdges(e => e.filter(([a,b]) => a !== id && b !== id));
    if (selected === id) setSelected(null);
  };

  const toggleStatus = (id) => {
    const cycle = { healthy:"warning", warning:"down", down:"healthy" };
    setNodes(n => n.map(x => x.id === id ? { ...x, status:cycle[x.status] } : x));
  };

  const autoLayout = () => {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    setNodes(n => n.map((node, i) => ({
      ...node,
      x: 100 + (i % cols) * 160,
      y: 80  + Math.floor(i / cols) * 140,
    })));
  };

  const connectedTo = (id) => {
    const connected = new Set();
    edges.forEach(([a,b]) => {
      if (a === id) connected.add(b);
      if (b === id) connected.add(a);
    });
    return connected;
  };

  const selNode = nodes.find(n => n.id === selected);
  const hovConnected = hovered ? connectedTo(hovered) : new Set();

  return (
    <div className="card">
      <h2 className="card-title">🕸 Network Dependency Diagram</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at VMware, Broadcom, ServiceNow.</strong> SVG node graph with drag,
        add/remove nodes & edges, status indicators, hover highlighting. No library.
      </p>

      {/* Controls */}
      <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s4)", flexWrap:"wrap", alignItems:"center" }}>
        <input className="input" style={{ width:160 }} placeholder="Node label"
          value={newNode.label} onChange={e => setNewNode(n => ({ ...n, label:e.target.value }))} />
        <select className="select" style={{ width:"auto" }} value={newNode.type}
          onChange={e => setNewNode(n => ({ ...n, type:e.target.value }))}>
          {Object.keys(NODE_TYPES).map(t => <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={addNode}>+ Node</button>
        <button className={`btn btn-sm ${addEdge!==null?"btn-warn":"btn-ghost"}`}
          onClick={() => setAddEdge(addEdge!==null ? null : -1)}>
          {addEdge!==null ? "Cancel Edge" : "➕ Add Edge"}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={autoLayout}>⚡ Auto Layout</button>
        {addEdge !== null && addEdge !== -1 && (
          <span style={{ fontSize:"var(--xs)", color:"var(--warn)" }}>
            Click second node to connect
          </span>
        )}
      </div>

      <div style={{ display:"flex", gap:"var(--s4)", flexWrap:"wrap" }}>
        {/* SVG Canvas */}
        <div style={{ flex:1, minWidth:400, border:"1px solid var(--gb)",
          borderRadius:"var(--r2)", overflow:"hidden", background:"var(--glass)" }}>
          <svg ref={svgRef} width="100%" height={500}
            style={{ cursor: addEdge!==null ? "crosshair" : "default" }}>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.3)" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map(([a,b], i) => {
              const na = nodes.find(n => n.id===a);
              const nb = nodes.find(n => n.id===b);
              if (!na || !nb) return null;
              const isHighlighted = hovered && (hovConnected.has(a)||hovConnected.has(b)||hovered===a||hovered===b);
              return (
                <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={isHighlighted ? "var(--a2)" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  markerEnd="url(#arrow)"
                  style={{ transition:"stroke .2s" }}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const meta = NODE_TYPES[node.type];
              const isSelected   = selected === node.id;
              const isHovered    = hovered  === node.id;
              const isConnected  = hovConnected.has(node.id);
              const isAddingEdge = addEdge === node.id;
              const opacity = hovered && !isHovered && !isConnected ? 0.4 : 1;

              return (
                <g key={node.id} transform={`translate(${node.x},${node.y})`}
                  style={{ cursor:"grab", opacity, transition:"opacity .2s" }}
                  onMouseDown={e => onMouseDown(e, node.id)}
                  onMouseEnter={() => setHovered(node.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Glow ring */}
                  {(isSelected||isAddingEdge) && (
                    <circle r={32} fill="none" stroke={meta.color} strokeWidth={2} opacity={0.5} />
                  )}
                  {/* Node circle */}
                  <circle r={26}
                    fill={isSelected ? meta.color+"44" : "rgba(13,16,37,0.9)"}
                    stroke={isSelected||isHovered ? meta.color : "rgba(255,255,255,0.15)"}
                    strokeWidth={isSelected||isHovered ? 2 : 1}
                  />
                  {/* Status dot */}
                  <circle cx={18} cy={-18} r={6}
                    fill={STATUS_COLORS[node.status]}
                    stroke="var(--bg)" strokeWidth={2}
                  />
                  {/* Icon */}
                  <text textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize:18, userSelect:"none" }}>
                    {meta.icon}
                  </text>
                  {/* Label */}
                  <text y={38} textAnchor="middle"
                    style={{ fontSize:10, fill:"var(--t2)", userSelect:"none", fontFamily:"var(--font)" }}>
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node detail panel */}
        <div style={{ minWidth:180, flex:"0 0 180px" }}>
          {selNode ? (
            <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)" }}>
              <div style={{ fontSize:32, textAlign:"center", marginBottom:"var(--s2)" }}>
                {NODE_TYPES[selNode.type].icon}
              </div>
              <div style={{ fontWeight:700, color:"var(--t1)", textAlign:"center",
                marginBottom:"var(--s1)" }}>{selNode.label}</div>
              <div style={{ fontSize:"var(--xs)", color:"var(--t3)", textAlign:"center",
                marginBottom:"var(--s4)" }}>{selNode.type}</div>

              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s3)",
                fontSize:"var(--sm)" }}>
                <span style={{ color:"var(--t2)" }}>Status</span>
                <span style={{ color:STATUS_COLORS[selNode.status], fontWeight:700 }}>
                  {selNode.status}
                </span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s4)",
                fontSize:"var(--sm)" }}>
                <span style={{ color:"var(--t2)" }}>Connections</span>
                <span style={{ color:"var(--a2)", fontWeight:700 }}>
                  {connectedTo(selNode.id).size}
                </span>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)" }}>
                <button className="btn btn-warn btn-sm" onClick={() => toggleStatus(selNode.id)}>
                  Toggle Status
                </button>
                <button className="btn btn-info btn-sm"
                  onClick={() => { setAddEdge(selNode.id); }}>
                  Connect to...
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => removeNode(selNode.id)}>
                  Remove Node
                </button>
              </div>
            </div>
          ) : (
            <div style={{ color:"var(--t3)", fontSize:"var(--sm)", textAlign:"center",
              padding:"var(--s8)" }}>
              Click a node to inspect
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
