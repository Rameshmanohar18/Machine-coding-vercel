/**
 * PROBLEM 6 — Fully Accessible Modal (WCAG 2.1 AA)
 * ─────────────────────────────────────────────────────────────
 * Asked at: Google, Meta, Microsoft (accessibility focus)
 *
 * Requirements:
 * - Focus trap inside modal (Tab/Shift+Tab cycles within)
 * - Return focus to trigger button on close
 * - Escape key closes modal
 * - aria-modal, role="dialog", aria-labelledby, aria-describedby
 * - Backdrop click closes modal
 * - Scroll lock on body when open
 * - Portal rendering
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// All focusable elements selector
const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

function Modal({ isOpen, onClose, title, children, id }) {
  const overlayRef = useRef(null);
  const firstRef   = useRef(null);
  const triggerRef = useRef(null);

  // Store trigger to restore focus on close
  useEffect(() => {
    if (isOpen) triggerRef.current = document.activeElement;
  }, [isOpen]);

  // Focus first element + scroll lock
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const el = overlayRef.current?.querySelector(FOCUSABLE);
    el?.focus();
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Restore focus on close
  useEffect(() => {
    if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Focus trap
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key !== "Tab") return;

    const focusable = [...overlayRef.current.querySelectorAll(FOCUSABLE)];
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }, [onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="presentation"
      style={{
        position: "fixed", inset: 0,
        background: "rgba(7,9,26,0.80)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: "var(--s4)",
        animation: "fadeIn .2s ease"
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
        style={{
          background: "rgba(13,16,37,0.95)",
          backdropFilter: "blur(28px)",
          border: "1px solid var(--gb2)",
          borderRadius: "var(--r4)",
          padding: "var(--s8)",
          width: "100%", maxWidth: 500,
          boxShadow: "var(--sh3), var(--shg)",
          animation: "slideUp .25s ease",
          position: "relative", overflow: "hidden"
        }}
      >
        {/* Top shimmer */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, var(--a2), transparent)" }} />

        <h2 id={`${id}-title`} style={{ marginBottom: "var(--s3)" }}>{title}</h2>
        <div id={`${id}-desc`}>{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default function AccessibleModalDemo() {
  const [modal1, setModal1] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [name,   setName]   = useState("");

  return (
    <div className="card">
      <h2 className="card-title">♿ Accessible Modal (WCAG 2.1 AA)</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at Google, Meta, Microsoft.</strong> Full accessibility:
        focus trap, Escape to close, aria attributes, scroll lock, focus restoration,
        backdrop click, portal rendering.
      </p>

      <div style={{ display: "flex", gap: "var(--s3)", flexWrap: "wrap", marginBottom: "var(--s5)" }}>
        <button className="btn btn-primary" onClick={() => setModal1(true)}
          aria-haspopup="dialog">
          Open Info Modal
        </button>
        <button className="btn btn-success" onClick={() => setModal2(true)}
          aria-haspopup="dialog">
          Open Form Modal
        </button>
      </div>

      {/* Accessibility checklist */}
      <div style={{ background: "var(--glass2)", border: "1px solid var(--gb)",
        borderRadius: "var(--r2)", padding: "var(--s4)" }}>
        <div className="label" style={{ marginBottom: "var(--s3)" }}>Accessibility Features</div>
        {[
          ["✅", "role=\"dialog\" + aria-modal=\"true\""],
          ["✅", "aria-labelledby + aria-describedby"],
          ["✅", "Focus trap (Tab/Shift+Tab cycles inside)"],
          ["✅", "Escape key closes modal"],
          ["✅", "Focus returns to trigger button on close"],
          ["✅", "Body scroll locked when open"],
          ["✅", "Backdrop click closes modal"],
          ["✅", "Rendered via createPortal"],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: "flex", gap: "var(--s2)", marginBottom: "var(--s1)",
            fontSize: "var(--sm)", color: "var(--t2)" }}>
            <span>{icon}</span><span>{text}</span>
          </div>
        ))}
      </div>

      {/* Modal 1 — Info */}
      <Modal isOpen={modal1} onClose={() => setModal1(false)} title="ℹ️ Information" id="modal1">
        <p style={{ marginBottom: "var(--s6)" }}>
          This modal is fully accessible. Try pressing <kbd style={{ background: "var(--glass2)",
            border: "1px solid var(--gb)", borderRadius: 4, padding: "1px 6px", fontSize: "var(--xs)" }}>Tab</kbd> —
          focus stays inside. Press <kbd style={{ background: "var(--glass2)",
            border: "1px solid var(--gb)", borderRadius: 4, padding: "1px 6px", fontSize: "var(--xs)" }}>Esc</kbd> to close.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--s3)" }}>
          <button className="btn btn-ghost" onClick={() => setModal1(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => setModal1(false)}>Got it</button>
        </div>
      </Modal>

      {/* Modal 2 — Form */}
      <Modal isOpen={modal2} onClose={() => setModal2(false)} title="📝 Enter Your Name" id="modal2">
        <div className="form-row">
          <label className="label" htmlFor="modal-name">Full Name</label>
          <input id="modal-name" className="input" placeholder="Enter name..."
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--s3)" }}>
          <button className="btn btn-ghost" onClick={() => setModal2(false)}>Cancel</button>
          <button className="btn btn-success" onClick={() => { alert(`Hello, ${name}!`); setModal2(false); }}>
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
}
