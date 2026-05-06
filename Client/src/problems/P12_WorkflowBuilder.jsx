/**
 * PROBLEM 12 — Visual Workflow Builder (ServiceNow specialty)
 * ─────────────────────────────────────────────────────────────
 * Asked at: ServiceNow, Zapier, Workato
 *
 * Requirements:
 * - Add/remove steps in a workflow
 * - Step types: Trigger, Action, Condition, Delay, Notification
 * - Drag to reorder steps
 * - Each step has configurable properties
 * - Validate workflow (must start with Trigger, no orphan conditions)
 * - Run simulation (steps execute with delay, show status)
 * - Export workflow as JSON
 */

import { useState, useRef, useCallback } from "react";

const STEP_TYPES = {
  trigger:      { label: "Trigger",      icon: "⚡", color: "#a78bfa", desc: "Starts the workflow" },
  condition:    { label: "Condition",    icon: "🔀", color: "#f59e0b", desc: "Branch based on logic" },
  action:       { label: "Action",       icon: "⚙️", color: "#22d3ee", desc: "Perform an operation" },
  delay:        { label: "Delay",        icon: "⏳", color: "#94a3b8", desc: "Wait before next step" },
  notification: { label: "Notification", icon: "🔔", color: "#10b981", desc: "Send alert or email" },
};

const STATUS_COLORS = {
  idle:    "var(--t3)",
  running: "var(--info)",
  done:    "var(--ok)",
  error:   "var(--err)",
};

let nextId = 1;

function makeStep(type) {
  return {
    id: nextId++, type,
    name: STEP_TYPES[type].label,
    config: type === "delay" ? { seconds: 2 } : { value: "" },
    status: "idle"
  };
}

export default function WorkflowBuilder() {
  const [steps,    setSteps]    = useState([makeStep("trigger"), makeStep("action")]);
  const [running,  setRunning]  = useState(false);
  const [errors,   setErrors]   = useState([]);
  const [log,      setLog]      = useState([]);
  const dragIdx = useRef(null);

  const addStep = (type) => setSteps(s => [...s, makeStep(type)]);
  const removeStep = (id) => setSteps(s => s.filter(x => x.id !== id));

  const updateStep = (id, key, val) => {
    setSteps(s => s.map(x => x.id === id ? { ...x, [key]: val } : x));
  };

  const updateConfig = (id, key, val) => {
    setSteps(s => s.map(x => x.id === id ? { ...x, config: { ...x.config, [key]: val } } : x));
  };

  // Drag to reorder
  const onDragStart = (idx) => { dragIdx.current = idx; };
  const onDrop = (idx) => {
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setSteps(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIdx.current, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });
    dragIdx.current = null;
  };

  // Validate
  const validate = useCallback(() => {
    const errs = [];
    if (steps.length === 0) errs.push("Workflow is empty");
    if (steps[0]?.type !== "trigger") errs.push("First step must be a Trigger");
    if (steps.filter(s => s.type === "trigger").length > 1) errs.push("Only one Trigger allowed");
    steps.forEach((s, i) => {
      if (!s.name.trim()) errs.push(`Step ${i + 1} has no name`);
    });
    setErrors(errs);
    return errs.length === 0;
  }, [steps]);

  // Simulate run
  const runWorkflow = async () => {
    if (!validate()) return;
    setRunning(true);
    setLog([]);
    setSteps(s => s.map(x => ({ ...x, status: "idle" })));

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const delay = step.type === "delay" ? (step.config.seconds || 1) * 1000 : 800;

      setSteps(s => s.map(x => x.id === step.id ? { ...x, status: "running" } : x));
      setLog(l => [...l, `▶ Running: ${step.name} (${STEP_TYPES[step.type].label})`]);

      await new Promise(r => setTimeout(r, delay));

      // Simulate occasional error on condition
      const failed = step.type === "condition" && Math.random() < 0.2;
      setSteps(s => s.map(x => x.id === step.id ? { ...x, status: failed ? "error" : "done" } : x));
      setLog(l => [...l, failed
        ? `❌ ${step.name} — condition not met`
        : `✅ ${step.name} — completed`
      ]);

      if (failed) break;
    }

    setRunning(false);
  };

  const exportJSON = () => {
    const data = JSON.stringify(steps.map(({ id, type, name, config }) => ({ id, type, name, config })), null, 2);
    const blob  = new Blob([data], { type: "application/json" });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement("a"); a.href = url; a.download = "workflow.json"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <h2 className="card-title">🔧 Visual Workflow Builder</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at ServiceNow, Zapier.</strong> Add/reorder/configure steps,
        validate workflow rules, simulate execution with status tracking, export JSON.
      </p>

      <div style={{ display: "flex", gap: "var(--s6)", flexWrap: "wrap" }}>
        {/* ── Canvas ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          {/* Add step buttons */}
          <div style={{ display: "flex", gap: "var(--s2)", flexWrap: "wrap", marginBottom: "var(--s5)" }}>
            {Object.entries(STEP_TYPES).map(([type, meta]) => (
              <button key={type} className="btn btn-ghost btn-sm"
                onClick={() => addStep(type)}
                style={{ borderColor: meta.color, color: meta.color }}>
                {meta.icon} {meta.label}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s2)" }}>
            {steps.map((step, idx) => {
              const meta = STEP_TYPES[step.type];
              return (
                <div key={step.id}>
                  {/* Connector */}
                  {idx > 0 && (
                    <div style={{ display: "flex", justifyContent: "center", height: 20,
                      alignItems: "center", color: "var(--t3)", fontSize: 18 }}>↓</div>
                  )}

                  <div
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop(idx)}
                    style={{
                      background: "var(--glass2)",
                      border: `1px solid ${step.status === "running" ? meta.color : step.status === "done" ? "var(--ok)" : step.status === "error" ? "var(--err)" : "var(--gb)"}`,
                      borderLeft: `4px solid ${meta.color}`,
                      borderRadius: "var(--r2)", padding: "var(--s3) var(--s4)",
                      cursor: "grab", transition: "all var(--tr)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--s3)", marginBottom: "var(--s2)" }}>
                      <span style={{ fontSize: 18 }}>{meta.icon}</span>
                      <input
                        style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                          color: "var(--t1)", fontWeight: 700, fontSize: "var(--sm)", fontFamily: "var(--font)" }}
                        value={step.name}
                        onChange={e => updateStep(step.id, "name", e.target.value)}
                      />
                      <span style={{ fontSize: "var(--xs)", color: STATUS_COLORS[step.status],
                        fontWeight: 700, textTransform: "uppercase" }}>
                        {step.status}
                      </span>
                      <button className="btn btn-danger btn-sm"
                        onClick={() => removeStep(step.id)}
                        disabled={running}>✕</button>
                    </div>

                    {step.type === "delay" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", fontSize: "var(--xs)" }}>
                        <span style={{ color: "var(--t3)" }}>Wait</span>
                        <input type="number" min={1} max={10} value={step.config.seconds}
                          onChange={e => updateConfig(step.id, "seconds", Number(e.target.value))}
                          style={{ width: 50, background: "var(--glass)", border: "1px solid var(--gb)",
                            borderRadius: "var(--r1)", color: "var(--t1)", padding: "2px 6px",
                            fontSize: "var(--xs)", outline: "none" }} />
                        <span style={{ color: "var(--t3)" }}>seconds</span>
                      </div>
                    )}

                    {["action","condition","notification"].includes(step.type) && (
                      <input className="input"
                        style={{ fontSize: "var(--xs)", padding: "6px 10px" }}
                        placeholder={`Configure ${meta.label.toLowerCase()}...`}
                        value={step.config.value}
                        onChange={e => updateConfig(step.id, "value", e.target.value)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ marginTop: "var(--s4)", display: "flex", flexDirection: "column", gap: "var(--s1)" }}>
              {errors.map((e, i) => (
                <div key={i} style={{ background: "var(--err-bg)", border: "1px solid rgba(239,68,68,.3)",
                  borderRadius: "var(--r1)", padding: "6px 12px", fontSize: "var(--xs)", color: "var(--err)" }}>
                  ⚠ {e}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "var(--s3)", marginTop: "var(--s5)" }}>
            <button className="btn btn-primary" onClick={runWorkflow} disabled={running}>
              {running ? <><span className="spinner" style={{ width:14,height:14,borderWidth:2 }} /> Running...</> : "▶ Run Workflow"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={exportJSON}>⬇ Export JSON</button>
          </div>
        </div>

        {/* ── Execution Log ── */}
        <div style={{ minWidth: 220, flex: "0 0 220px" }}>
          <div className="label" style={{ marginBottom: "var(--s3)" }}>Execution Log</div>
          <div style={{
            background: "var(--glass)", border: "1px solid var(--gb)",
            borderRadius: "var(--r2)", padding: "var(--s3)",
            fontFamily: "var(--mono)", fontSize: "var(--xs)",
            minHeight: 200, maxHeight: 400, overflowY: "auto"
          }}>
            {log.length === 0
              ? <span style={{ color: "var(--t3)" }}>Run the workflow to see logs...</span>
              : log.map((entry, i) => (
                <div key={i} style={{
                  color: entry.includes("❌") ? "var(--err)" : entry.includes("✅") ? "var(--ok)" : "var(--info)",
                  padding: "2px 0", borderBottom: "1px solid var(--gb)"
                }}>
                  {entry}
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
