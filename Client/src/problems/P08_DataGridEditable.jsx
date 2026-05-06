/**
 * PROBLEM 8 — Editable Data Grid (like AG Grid lite)
 * ─────────────────────────────────────────────────────────────
 * Asked at: ServiceNow, Salesforce, Intuit
 *
 * Requirements:
 * - Click cell to edit inline
 * - Column sorting (asc/desc)
 * - Column-level search/filter
 * - Row selection (checkbox + select all)
 * - Delete selected rows
 * - Add new row
 * - Undo last delete
 * - Export to CSV
 */

import { useState, useMemo, useRef } from "react";

const COLUMNS = [
  { key: "name",    label: "Name",       type: "text"   },
  { key: "email",   label: "Email",      type: "email"  },
  { key: "role",    label: "Role",       type: "select",
    options: ["Engineer", "Designer", "PM", "QA", "DevOps"] },
  { key: "salary",  label: "Salary (₹)", type: "number" },
  { key: "active",  label: "Active",     type: "bool"   },
];

const INITIAL_DATA = [
  { id:1, name:"Alice Johnson",  email:"alice@co.com",  role:"Engineer", salary:120000, active:true  },
  { id:2, name:"Bob Smith",      email:"bob@co.com",    role:"Designer", salary:95000,  active:true  },
  { id:3, name:"Charlie Brown",  email:"charlie@co.com",role:"PM",       salary:140000, active:false },
  { id:4, name:"Diana Prince",   email:"diana@co.com",  role:"QA",       salary:85000,  active:true  },
  { id:5, name:"Edward Norton",  email:"ed@co.com",     role:"DevOps",   salary:130000, active:true  },
];

let nextId = 10;

export default function EditableDataGrid() {
  const [rows,      setRows]      = useState(INITIAL_DATA);
  const [selected,  setSelected]  = useState([]);
  const [editing,   setEditing]   = useState(null); // { rowId, col }
  const [editVal,   setEditVal]   = useState("");
  const [sortCol,   setSortCol]   = useState(null);
  const [sortDir,   setSortDir]   = useState("asc");
  const [filters,   setFilters]   = useState({});
  const [deleted,   setDeleted]   = useState(null); // for undo
  const inputRef = useRef(null);

  // Filtered + sorted rows
  const displayed = useMemo(() => {
    let list = rows.filter(row =>
      COLUMNS.every(col => {
        const f = filters[col.key]?.toLowerCase();
        if (!f) return true;
        return String(row[col.key]).toLowerCase().includes(f);
      })
    );
    if (sortCol) {
      list = [...list].sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol];
        const diff = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? diff : -diff;
      });
    }
    return list;
  }, [rows, filters, sortCol, sortDir]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const startEdit = (rowId, col, val) => {
    setEditing({ rowId, col });
    setEditVal(String(val));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (!editing) return;
    setRows(prev => prev.map(r => {
      if (r.id !== editing.rowId) return r;
      const col = COLUMNS.find(c => c.key === editing.col);
      let val = editVal;
      if (col.type === "number") val = Number(editVal);
      if (col.type === "bool")   val = editVal === "true";
      return { ...r, [editing.col]: val };
    }));
    setEditing(null);
  };

  const toggleSelect = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll    = () => setSelected(s => s.length === displayed.length ? [] : displayed.map(r => r.id));

  const deleteSelected = () => {
    setDeleted(rows.filter(r => selected.includes(r.id)));
    setRows(prev => prev.filter(r => !selected.includes(r.id)));
    setSelected([]);
  };

  const undo = () => {
    if (!deleted) return;
    setRows(prev => [...prev, ...deleted]);
    setDeleted(null);
  };

  const addRow = () => {
    setRows(prev => [...prev, {
      id: nextId++, name: "New Employee", email: "new@co.com",
      role: "Engineer", salary: 80000, active: true
    }]);
  };

  const exportCSV = () => {
    const header = COLUMNS.map(c => c.label).join(",");
    const body   = rows.map(r => COLUMNS.map(c => r[c.key]).join(",")).join("\n");
    const blob   = new Blob([header + "\n" + body], { type: "text/csv" });
    const url    = URL.createObjectURL(blob);
    const a      = document.createElement("a"); a.href = url; a.download = "data.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const renderCell = (row, col) => {
    const isEditing = editing?.rowId === row.id && editing?.col === col.key;
    const val = row[col.key];

    if (isEditing) {
      if (col.type === "select")
        return (
          <select ref={inputRef} className="select" style={{ padding: "4px 8px", fontSize: "var(--sm)" }}
            value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={commitEdit}>
            {col.options.map(o => <option key={o}>{o}</option>)}
          </select>
        );
      if (col.type === "bool")
        return (
          <select ref={inputRef} className="select" style={{ padding: "4px 8px", fontSize: "var(--sm)" }}
            value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={commitEdit}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      return (
        <input ref={inputRef} className="input" style={{ padding: "4px 8px", fontSize: "var(--sm)" }}
          type={col.type} value={editVal}
          onChange={e => setEditVal(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={e => e.key === "Enter" && commitEdit()} />
      );
    }

    if (col.type === "bool")
      return <span className={`badge ${val ? "badge-ok" : "badge-err"}`}>{val ? "Yes" : "No"}</span>;
    if (col.key === "salary")
      return <span style={{ color: "var(--ok)", fontWeight: 700 }}>₹{Number(val).toLocaleString()}</span>;
    return <span>{String(val)}</span>;
  };

  return (
    <div className="card">
      <h2 className="card-title">📋 Editable Data Grid</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at ServiceNow, Salesforce, Intuit.</strong> Inline cell editing,
        column sort, per-column filter, row selection, delete with undo, add row, CSV export.
      </p>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: "var(--s2)", marginBottom: "var(--s4)", flexWrap: "wrap" }}>
        <button className="btn btn-primary btn-sm" onClick={addRow}>+ Add Row</button>
        {selected.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={deleteSelected}>
            🗑 Delete ({selected.length})
          </button>
        )}
        {deleted && (
          <button className="btn btn-warn btn-sm" onClick={undo}>↩ Undo Delete</button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={exportCSV} style={{ marginLeft: "auto" }}>
          ⬇ Export CSV
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox"
                  checked={selected.length === displayed.length && displayed.length > 0}
                  onChange={toggleAll}
                  style={{ accentColor: "var(--a2)", cursor: "pointer" }} />
              </th>
              {COLUMNS.map(col => (
                <th key={col.key}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--s1)" }}>
                    <button onClick={() => toggleSort(col.key)}
                      style={{ background: "none", border: "none", cursor: "pointer",
                        color: sortCol === col.key ? "var(--a2)" : "var(--t2)",
                        fontWeight: 700, fontSize: "var(--xs)", letterSpacing: ".08em",
                        textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                      {col.label}
                      {sortCol === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"}
                    </button>
                    <input
                      style={{ background: "var(--glass)", border: "1px solid var(--gb)",
                        borderRadius: "var(--r1)", padding: "3px 6px", fontSize: "var(--xs)",
                        color: "var(--t1)", outline: "none", width: "100%" }}
                      placeholder="Filter..."
                      value={filters[col.key] || ""}
                      onChange={e => setFilters(f => ({ ...f, [col.key]: e.target.value }))}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map(row => (
              <tr key={row.id} style={{ background: selected.includes(row.id) ? "var(--abg)" : "transparent" }}>
                <td>
                  <input type="checkbox" checked={selected.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    style={{ accentColor: "var(--a2)", cursor: "pointer" }} />
                </td>
                {COLUMNS.map(col => (
                  <td key={col.key}
                    onDoubleClick={() => startEdit(row.id, col.key, row[col.key])}
                    style={{ cursor: "cell" }}
                    title="Double-click to edit">
                    {renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "var(--s3)", fontSize: "var(--xs)", color: "var(--t3)" }}>
        {displayed.length} of {rows.length} rows · Double-click any cell to edit
      </div>
    </div>
  );
}
