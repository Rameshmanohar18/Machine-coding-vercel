/**
 * PROBLEM 7 — File Uploader with Progress
 * ─────────────────────────────────────────────────────────────
 * Asked at: Dropbox, Google Drive team, ServiceNow
 *
 * Requirements:
 * - Drag & drop zone + click to browse
 * - Multiple file support
 * - File type validation (images, PDFs only)
 * - File size validation (max 5MB)
 * - Simulated upload progress per file
 * - Cancel individual uploads
 * - Preview images inline
 * - Show file size, type, status
 */

import { useState, useRef, useCallback } from "react";

const MAX_SIZE  = 5 * 1024 * 1024; // 5MB
const ALLOWED   = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let nextId = 1;

export default function FileUploader() {
  const [files,    setFiles]    = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const timers   = useRef({});

  const processFiles = useCallback((rawFiles) => {
    const newFiles = [...rawFiles].map(file => {
      let error = null;
      if (!ALLOWED.includes(file.type)) error = "File type not allowed";
      else if (file.size > MAX_SIZE)    error = "File exceeds 5MB limit";

      const id = nextId++;
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;

      return { id, name: file.name, size: file.size, type: file.type,
               preview, error, progress: 0, status: error ? "error" : "pending" };
    });

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload for valid files
    newFiles.filter(f => !f.error).forEach(f => {
      let progress = 0;
      timers.current[f.id] = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(timers.current[f.id]);
          setFiles(prev => prev.map(x => x.id === f.id ? { ...x, progress: 100, status: "done" } : x));
        } else {
          setFiles(prev => prev.map(x => x.id === f.id ? { ...x, progress, status: "uploading" } : x));
        }
      }, 200);
    });
  }, []);

  const cancel = (id) => {
    clearInterval(timers.current[id]);
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "cancelled", progress: 0 } : f));
  };

  const remove = (id) => {
    clearInterval(timers.current[id]);
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const STATUS_COLORS = {
    pending:    "var(--t3)",
    uploading:  "var(--info)",
    done:       "var(--ok)",
    error:      "var(--err)",
    cancelled:  "var(--warn)",
  };

  return (
    <div className="card">
      <h2 className="card-title">📁 File Uploader with Progress</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at Dropbox, Google, ServiceNow.</strong> Drag & drop, file validation,
        simulated upload progress per file, image previews, cancel support.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--a)" : "var(--gb2)"}`,
          borderRadius: "var(--r3)",
          padding: "var(--s10)",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "var(--abg)" : "var(--glass)",
          transition: "all var(--tr)",
          marginBottom: "var(--s5)"
        }}
      >
        <div style={{ fontSize: 40, marginBottom: "var(--s3)" }}>📂</div>
        <div style={{ fontWeight: 700, color: "var(--t1)", marginBottom: "var(--s1)" }}>
          Drop files here or click to browse
        </div>
        <div style={{ fontSize: "var(--xs)", color: "var(--t3)" }}>
          Images & PDFs only · Max 5MB per file
        </div>
        <input ref={inputRef} type="file" multiple accept={ALLOWED.join(",")}
          style={{ display: "none" }}
          onChange={e => processFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s3)" }}>
          {files.map(f => (
            <div key={f.id} style={{
              background: "var(--glass2)", border: "1px solid var(--gb)",
              borderRadius: "var(--r2)", padding: "var(--s4)",
              display: "flex", gap: "var(--s4)", alignItems: "flex-start"
            }}>
              {/* Preview */}
              {f.preview
                ? <img src={f.preview} alt={f.name} style={{ width: 56, height: 56,
                    objectFit: "cover", borderRadius: "var(--r1)", flexShrink: 0 }} />
                : <div style={{ width: 56, height: 56, background: "var(--glass)",
                    borderRadius: "var(--r1)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📄</div>
              }

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--s1)" }}>
                  <span style={{ fontWeight: 600, color: "var(--t1)", fontSize: "var(--sm)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                    {f.name}
                  </span>
                  <span style={{ fontSize: "var(--xs)", color: STATUS_COLORS[f.status],
                    fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                    {f.status}
                  </span>
                </div>

                <div style={{ fontSize: "var(--xs)", color: "var(--t3)", marginBottom: "var(--s2)" }}>
                  {formatSize(f.size)} · {f.type.split("/")[1]?.toUpperCase()}
                </div>

                {f.error && (
                  <div style={{ color: "var(--err)", fontSize: "var(--xs)" }}>⚠ {f.error}</div>
                )}

                {!f.error && f.status !== "cancelled" && (
                  <div style={{ height: 4, background: "var(--gb)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${f.progress}%`,
                      background: f.status === "done" ? "var(--ok)" : "var(--a2)",
                      transition: "width .2s ease"
                    }} />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "var(--s1)", flexShrink: 0 }}>
                {f.status === "uploading" && (
                  <button className="btn btn-warn btn-sm" onClick={() => cancel(f.id)}>⏸</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => remove(f.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
