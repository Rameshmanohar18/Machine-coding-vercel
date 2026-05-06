/**
 * PROBLEM 4 — Dynamic Form Builder with Validation
 * ─────────────────────────────────────────────────────────────
 * Asked at: ServiceNow, Intuit, Salesforce
 *
 * Requirements:
 * - Add/remove/reorder fields dynamically
 * - Field types: text, email, number, select, checkbox, textarea
 * - Per-field validation rules (required, minLength, pattern)
 * - Real-time validation on blur
 * - Submit shows collected data
 * - Field labels are editable
 */

import { useState, useCallback } from "react";

const FIELD_TYPES = ["text", "email", "number", "select", "checkbox", "textarea"];

const VALIDATORS = {
  required: (v) => (!v && v !== false) ? "This field is required" : null,
  email:    (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Invalid email" : null,
  minLen:   (v, n) => v && v.length < n ? `Min ${n} characters` : null,
};

function validate(field, value) {
  if (field.required && VALIDATORS.required(value)) return VALIDATORS.required(value);
  if (field.type === "email" && VALIDATORS.email(value)) return VALIDATORS.email(value);
  if (field.minLen && VALIDATORS.minLen(value, field.minLen)) return VALIDATORS.minLen(value, field.minLen);
  return null;
}

let nextId = 1;

export default function FormBuilder() {
  const [fields,  setFields]  = useState([
    { id: nextId++, label: "Full Name",    type: "text",     required: true,  minLen: 2, options: [] },
    { id: nextId++, label: "Email",        type: "email",    required: true,  minLen: 0, options: [] },
    { id: nextId++, label: "Experience",   type: "select",   required: false, minLen: 0,
      options: ["0-1 years", "1-3 years", "3-5 years", "5+ years"] },
  ]);
  const [values,  setValues]  = useState({});
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const addField = (type) => {
    const id = nextId++;
    setFields(f => [...f, {
      id, label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      type, required: false, minLen: 0,
      options: type === "select" ? ["Option 1", "Option 2"] : []
    }]);
  };

  const removeField = (id) => {
    setFields(f => f.filter(x => x.id !== id));
    setValues(v => { const n = {...v}; delete n[id]; return n; });
    setErrors(e => { const n = {...e}; delete n[id]; return n; });
  };

  const moveField = (idx, dir) => {
    setFields(f => {
      const arr = [...f];
      const swap = idx + dir;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr;
    });
  };

  const updateField = (id, key, val) => {
    setFields(f => f.map(x => x.id === id ? { ...x, [key]: val } : x));
  };

  const handleChange = (id, value) => {
    setValues(v => ({ ...v, [id]: value }));
    if (touched[id]) {
      const field = fields.find(f => f.id === id);
      setErrors(e => ({ ...e, [id]: validate(field, value) }));
    }
  };

  const handleBlur = (id) => {
    setTouched(t => ({ ...t, [id]: true }));
    const field = fields.find(f => f.id === id);
    setErrors(e => ({ ...e, [id]: validate(field, values[id]) }));
  };

  const handleSubmit = () => {
    const newErrors = {};
    let valid = true;
    fields.forEach(f => {
      const err = validate(f, values[f.id]);
      if (err) { newErrors[f.id] = err; valid = false; }
    });
    setErrors(newErrors);
    setTouched(Object.fromEntries(fields.map(f => [f.id, true])));
    if (valid) setSubmitted(Object.fromEntries(fields.map(f => [f.label, values[f.id] ?? ""])));
  };

  const renderInput = (field) => {
    const val = values[field.id] ?? (field.type === "checkbox" ? false : "");
    const err = errors[field.id];
    const baseStyle = {
      borderColor: err ? "var(--err)" : undefined,
      boxShadow: err ? "0 0 0 3px rgba(239,68,68,.2)" : undefined
    };

    if (field.type === "textarea")
      return <textarea className="textarea" style={baseStyle} value={val}
        onChange={e => handleChange(field.id, e.target.value)}
        onBlur={() => handleBlur(field.id)} />;

    if (field.type === "select")
      return (
        <select className="select" style={baseStyle} value={val}
          onChange={e => handleChange(field.id, e.target.value)}
          onBlur={() => handleBlur(field.id)}>
          <option value="">Select...</option>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );

    if (field.type === "checkbox")
      return (
        <label style={{ display: "flex", alignItems: "center", gap: "var(--s2)", cursor: "pointer" }}>
          <input type="checkbox" checked={val}
            onChange={e => handleChange(field.id, e.target.checked)}
            style={{ accentColor: "var(--a2)", width: 16, height: 16 }} />
          <span style={{ fontSize: "var(--sm)", color: "var(--t2)" }}>Yes</span>
        </label>
      );

    return <input className="input" style={baseStyle} type={field.type} value={val}
      onChange={e => handleChange(field.id, e.target.value)}
      onBlur={() => handleBlur(field.id)} />;
  };

  return (
    <div className="card">
      <h2 className="card-title">🏗 Dynamic Form Builder</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at ServiceNow, Intuit, Salesforce.</strong> Add/remove/reorder fields,
        edit labels, set validation rules, real-time error display on blur.
      </p>

      <div style={{ display: "flex", gap: "var(--s8)", flexWrap: "wrap" }}>
        {/* ── Builder ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="label" style={{ marginBottom: "var(--s3)" }}>Add Field Type</div>
          <div style={{ display: "flex", gap: "var(--s2)", flexWrap: "wrap", marginBottom: "var(--s6)" }}>
            {FIELD_TYPES.map(t => (
              <button key={t} className="btn btn-ghost btn-sm" onClick={() => addField(t)}>+ {t}</button>
            ))}
          </div>

          {fields.map((field, idx) => (
            <div key={field.id} style={{
              background: "var(--glass2)", border: "1px solid var(--gb)",
              borderRadius: "var(--r2)", padding: "var(--s4)", marginBottom: "var(--s3)"
            }}>
              <div style={{ display: "flex", gap: "var(--s2)", marginBottom: "var(--s3)", alignItems: "center" }}>
                <input
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none",
                    color: "var(--t1)", fontWeight: 700, fontSize: "var(--sm)", fontFamily: "var(--font)" }}
                  value={field.label}
                  onChange={e => updateField(field.id, "label", e.target.value)}
                />
                <span className="badge badge-a">{field.type}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => moveField(idx, -1)} disabled={idx === 0}>↑</button>
                <button className="btn btn-ghost btn-sm" onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1}>↓</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeField(field.id)}>✕</button>
              </div>
              <div style={{ display: "flex", gap: "var(--s3)", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "var(--s1)",
                  fontSize: "var(--xs)", color: "var(--t2)", cursor: "pointer" }}>
                  <input type="checkbox" checked={field.required}
                    onChange={e => updateField(field.id, "required", e.target.checked)}
                    style={{ accentColor: "var(--a2)" }} />
                  Required
                </label>
                {["text","email","textarea"].includes(field.type) && (
                  <label style={{ display: "flex", alignItems: "center", gap: "var(--s1)",
                    fontSize: "var(--xs)", color: "var(--t2)" }}>
                    Min length:
                    <input type="number" min={0} max={100} value={field.minLen}
                      onChange={e => updateField(field.id, "minLen", Number(e.target.value))}
                      style={{ width: 50, background: "var(--glass)", border: "1px solid var(--gb)",
                        borderRadius: "var(--r1)", color: "var(--t1)", padding: "2px 6px",
                        fontSize: "var(--xs)", outline: "none" }} />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Preview ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="label" style={{ marginBottom: "var(--s3)" }}>Form Preview</div>
          {fields.map(field => (
            <div key={field.id} className="form-row">
              <label className="label">
                {field.label}
                {field.required && <span style={{ color: "var(--err)", marginLeft: 4 }}>*</span>}
              </label>
              {renderInput(field)}
              {errors[field.id] && (
                <span style={{ color: "var(--err)", fontSize: "var(--xs)" }}>
                  ⚠ {errors[field.id]}
                </span>
              )}
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSubmit}>
            Submit Form
          </button>

          {submitted && (
            <div style={{ marginTop: "var(--s4)", background: "var(--ok-bg)",
              border: "1px solid rgba(16,185,129,.3)", borderRadius: "var(--r2)", padding: "var(--s4)" }}>
              <div style={{ color: "var(--ok)", fontWeight: 700, marginBottom: "var(--s2)" }}>
                ✅ Submitted!
              </div>
              <pre style={{ fontSize: "var(--xs)", color: "var(--t2)", whiteSpace: "pre-wrap" }}>
                {JSON.stringify(submitted, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
