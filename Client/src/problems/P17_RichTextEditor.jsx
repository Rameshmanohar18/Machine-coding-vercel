/**
 * PROBLEM 17 — Rich Text Editor (No library)
 * ─────────────────────────────────────────────────────────────
 * Asked at: Intuit, ServiceNow, VMware, Broadcom
 *
 * Requirements:
 * - Bold, Italic, Underline, Strikethrough
 * - Headings (H1, H2, H3)
 * - Ordered / Unordered lists
 * - Text alignment (left, center, right)
 * - Text color picker
 * - Undo / Redo (browser native)
 * - Word count + character count
 * - Export as HTML
 * - Placeholder text
 */

import { useRef, useState, useCallback, useEffect } from "react";

const TOOLBAR = [
  { group:"format", items:[
    { cmd:"bold",          icon:"B",  title:"Bold",          style:{ fontWeight:"bold" } },
    { cmd:"italic",        icon:"I",  title:"Italic",        style:{ fontStyle:"italic" } },
    { cmd:"underline",     icon:"U",  title:"Underline",     style:{ textDecoration:"underline" } },
    { cmd:"strikeThrough", icon:"S̶",  title:"Strikethrough" },
  ]},
  { group:"heading", items:[
    { cmd:"formatBlock", val:"h1", icon:"H1", title:"Heading 1" },
    { cmd:"formatBlock", val:"h2", icon:"H2", title:"Heading 2" },
    { cmd:"formatBlock", val:"h3", icon:"H3", title:"Heading 3" },
    { cmd:"formatBlock", val:"p",  icon:"¶",  title:"Paragraph" },
  ]},
  { group:"list", items:[
    { cmd:"insertUnorderedList", icon:"• —", title:"Bullet List" },
    { cmd:"insertOrderedList",   icon:"1.",  title:"Numbered List" },
  ]},
  { group:"align", items:[
    { cmd:"justifyLeft",   icon:"⬅", title:"Align Left"   },
    { cmd:"justifyCenter", icon:"↔", title:"Align Center" },
    { cmd:"justifyRight",  icon:"➡", title:"Align Right"  },
  ]},
  { group:"history", items:[
    { cmd:"undo", icon:"↩", title:"Undo" },
    { cmd:"redo", icon:"↪", title:"Redo" },
  ]},
];

const COLORS = ["#f0f4ff","#ef4444","#f59e0b","#10b981","#3b82f6","#a78bfa","#ec4899","#6b7280"];

export default function RichTextEditor() {
  const editorRef = useRef(null);
  const [stats,   setStats]   = useState({ words:0, chars:0 });
  const [html,    setHtml]    = useState("");
  const [showHtml, setShowHtml] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const exec = useCallback((cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  }, []);

  const updateStats = useCallback(() => {
    const text = editorRef.current?.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setStats({ words, chars: text.length });
    setIsEmpty(!text.trim());
    setHtml(editorRef.current?.innerHTML || "");
  }, []);

  const exportHTML = () => {
    const blob = new Blob([`<!DOCTYPE html><html><body>${html}</body></html>`], { type:"text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href=url; a.download="document.html"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <h2 className="card-title">📝 Rich Text Editor</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Intuit, ServiceNow, VMware.</strong> Built with <code>contentEditable</code>
        + <code>document.execCommand</code>. No external library. Bold, italic, headings,
        lists, alignment, color, undo/redo, word count, HTML export.
      </p>

      <div style={{ border:"1px solid var(--gb)", borderRadius:"var(--r3)", overflow:"hidden" }}>
        {/* Toolbar */}
        <div style={{ background:"var(--glass2)", borderBottom:"1px solid var(--gb)",
          padding:"var(--s2) var(--s3)", display:"flex", gap:"var(--s3)", flexWrap:"wrap",
          alignItems:"center" }}>

          {TOOLBAR.map(group => (
            <div key={group.group} style={{ display:"flex", gap:"var(--s1)",
              paddingRight:"var(--s3)", borderRight:"1px solid var(--gb)" }}>
              {group.items.map(item => (
                <button key={item.cmd+item.val}
                  title={item.title}
                  onMouseDown={e => { e.preventDefault(); exec(item.cmd, item.val || null); }}
                  style={{
                    padding:"4px 8px", borderRadius:"var(--r1)",
                    border:"1px solid transparent", background:"transparent",
                    cursor:"pointer", fontFamily:"var(--font)", fontSize:"var(--sm)",
                    color:"var(--t1)", fontWeight:600, transition:"all var(--tr)",
                    ...item.style
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--glass3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          ))}

          {/* Color picker */}
          <div style={{ display:"flex", gap:"var(--s1)", paddingRight:"var(--s3)",
            borderRight:"1px solid var(--gb)", alignItems:"center" }}>
            <span style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>A</span>
            {COLORS.map(c => (
              <button key={c}
                onMouseDown={e => { e.preventDefault(); exec("foreColor", c); }}
                style={{ width:16, height:16, borderRadius:"50%", background:c,
                  border:"1px solid var(--gb)", cursor:"pointer", padding:0 }}
                title={c}
              />
            ))}
          </div>

          <button className="btn btn-ghost btn-sm" onClick={exportHTML}>⬇ HTML</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowHtml(s => !s)}>
            {showHtml ? "Editor" : "</>"}
          </button>
        </div>

        {/* Editor area */}
        {!showHtml ? (
          <div style={{ position:"relative" }}>
            {isEmpty && (
              <div style={{ position:"absolute", top:"var(--s4)", left:"var(--s4)",
                color:"var(--t3)", fontSize:"var(--md)", pointerEvents:"none", userSelect:"none" }}>
                Start typing your document...
              </div>
            )}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateStats}
              onKeyUp={updateStats}
              style={{
                minHeight:280, padding:"var(--s4)",
                outline:"none", color:"var(--t1)",
                fontSize:"var(--md)", lineHeight:1.8,
                fontFamily:"var(--font)",
              }}
            />
          </div>
        ) : (
          <textarea
            readOnly
            value={html}
            style={{ width:"100%", minHeight:280, padding:"var(--s4)",
              background:"var(--bg3)", border:"none", outline:"none",
              color:"var(--ok)", fontFamily:"var(--mono)", fontSize:"var(--xs)",
              lineHeight:1.6, resize:"vertical" }}
          />
        )}

        {/* Status bar */}
        <div style={{ background:"var(--glass2)", borderTop:"1px solid var(--gb)",
          padding:"var(--s2) var(--s4)", display:"flex", gap:"var(--s5)",
          fontSize:"var(--xs)", color:"var(--t3)" }}>
          <span>{stats.words} words</span>
          <span>{stats.chars} characters</span>
          <span style={{ marginLeft:"auto" }}>contentEditable + execCommand</span>
        </div>
      </div>
    </div>
  );
}
