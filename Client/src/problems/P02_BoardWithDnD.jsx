/**
 * PROBLEM 2 — Trello-style Board (No external DnD library)
 * ─────────────────────────────────────────────────────────────
 * Asked at: Atlassian, ServiceNow, Intuit
 *
 * Requirements:
 * - Multiple columns (Todo, In Progress, Review, Done)
 * - Add cards to any column
 * - Drag cards between columns using native HTML5 DnD API
 * - Delete cards
 * - Card count per column
 * - Persist to localStorage
 */

import { useState, useRef } from "react";

const COLS = ["Todo", "In Progress", "Review", "Done"];
const COL_COLORS = {
  "Todo":        "var(--t3)",
  "In Progress": "var(--warn)",
  "Review":      "var(--info)",
  "Done":        "var(--ok)",
};

const INITIAL = {
  "Todo":        [{ id: 1, text: "Design system audit", priority: "high" },
                  { id: 2, text: "Write unit tests",    priority: "med"  }],
  "In Progress": [{ id: 3, text: "Build auth flow",     priority: "high" }],
  "Review":      [{ id: 4, text: "API integration",     priority: "low"  }],
  "Done":        [{ id: 5, text: "Setup CI/CD",         priority: "med"  }],
};

const PRIORITY_COLORS = { high: "var(--err)", med: "var(--warn)", low: "var(--ok)" };

let nextId = 10;

export default function TrelloBoard() {
  const [board,    setBoard]    = useState(INITIAL);
  const [inputs,   setInputs]   = useState(Object.fromEntries(COLS.map(c => [c, ""])));
  const [priority, setPriority] = useState(Object.fromEntries(COLS.map(c => [c, "med"])));
  const [dragOver, setDragOver] = useState(null);
  const dragging = useRef(null); // { col, id }

  const addCard = (col) => {
    if (!inputs[col].trim()) return;
    setBoard(b => ({
      ...b,
      [col]: [...b[col], { id: nextId++, text: inputs[col].trim(), priority: priority[col] }]
    }));
    setInputs(i => ({ ...i, [col]: "" }));
  };

  const deleteCard = (col, id) => {
    setBoard(b => ({ ...b, [col]: b[col].filter(c => c.id !== id) }));
  };

  const onDragStart = (col, id) => { dragging.current = { col, id }; };

  const onDrop = (destCol) => {
    if (!dragging.current) return;
    const { col: srcCol, id } = dragging.current;
    if (srcCol === destCol) return;
    const card = board[srcCol].find(c => c.id === id);
    setBoard(b => ({
      ...b,
      [srcCol]: b[srcCol].filter(c => c.id !== id),
      [destCol]: [...b[destCol], card],
    }));
    dragging.current = null;
    setDragOver(null);
  };

  return (
    <div className="card">
      <h2 className="card-title">📋 Trello Board (Native HTML5 DnD)</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at Atlassian, ServiceNow.</strong> No external library —
        uses native <code>draggable</code>, <code>onDragStart</code>, <code>onDrop</code>.
        Add cards, set priority, drag between columns.
      </p>

      <div style={{ display: "flex", gap: "var(--s4)", overflowX: "auto", paddingBottom: "var(--s2)" }}>
        {COLS.map(col => (
          <div
            key={col}
            onDragOver={e => { e.preventDefault(); setDragOver(col); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => onDrop(col)}
            style={{
              minWidth: 220, flex: "0 0 220px",
              background: dragOver === col ? "rgba(124,58,237,0.12)" : "var(--glass)",
              border: `1px solid ${dragOver === col ? "var(--a)" : "var(--gb)"}`,
              borderRadius: "var(--r3)", padding: "var(--s4)",
              transition: "all var(--tr)"
            }}
          >
            {/* Column header */}
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "var(--s4)" }}>
              <span style={{ fontWeight: 800, fontSize: "var(--sm)",
                textTransform: "uppercase", letterSpacing: ".08em",
                color: COL_COLORS[col] }}>
                {col}
              </span>
              <span className="badge badge-a">{board[col].length}</span>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s2)",
              minHeight: 60, marginBottom: "var(--s4)" }}>
              {board[col].map(card => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => onDragStart(col, card.id)}
                  style={{
                    background: "var(--glass2)", border: "1px solid var(--gb)",
                    borderLeft: `3px solid ${PRIORITY_COLORS[card.priority]}`,
                    borderRadius: "var(--r2)", padding: "10px 12px",
                    cursor: "grab", transition: "all var(--tr)",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gb2)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--gb)"}
                >
                  <span style={{ fontSize: "var(--sm)", color: "var(--t1)", flex: 1 }}>
                    {card.text}
                  </span>
                  <button
                    onClick={() => deleteCard(col, card.id)}
                    style={{ background: "none", border: "none", color: "var(--t3)",
                      cursor: "pointer", fontSize: 14, padding: "0 0 0 8px", lineHeight: 1 }}
                  >✕</button>
                </div>
              ))}
            </div>

            {/* Add card */}
            <input
              className="input"
              style={{ marginBottom: "var(--s2)", fontSize: "var(--sm)", padding: "8px 10px" }}
              placeholder="Add a card..."
              value={inputs[col]}
              onChange={e => setInputs(i => ({ ...i, [col]: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && addCard(col)}
            />
            <div style={{ display: "flex", gap: "var(--s2)" }}>
              <select className="select" style={{ flex: 1, fontSize: "var(--xs)", padding: "6px 8px" }}
                value={priority[col]}
                onChange={e => setPriority(p => ({ ...p, [col]: e.target.value }))}>
                <option value="high">🔴 High</option>
                <option value="med">🟡 Med</option>
                <option value="low">🟢 Low</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => addCard(col)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
