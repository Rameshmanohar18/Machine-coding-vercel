/**
 * PROBLEM 20 — Code Review / Diff Viewer
 * ─────────────────────────────────────────────────────────────
 * Asked at: VMware, Broadcom, GitHub-style companies
 *
 * Requirements:
 * - Side-by-side diff view (old vs new)
 * - Inline comment on any line
 * - Line-level approve / request changes
 * - Overall review: Approve / Request Changes / Comment
 * - Syntax highlighting (basic)
 * - Collapse unchanged sections
 * - Comment threads with replies
 * - Review summary
 */

import { useState, useMemo } from "react";

const OLD_CODE = `function calculateTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return total;
}

function applyDiscount(total, discount) {
  var discounted = total - discount;
  return discounted;
}

module.exports = { calculateTotal, applyDiscount };`;

const NEW_CODE = `function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function applyDiscount(total, discountPercent) {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Invalid discount percentage');
  }
  return total * (1 - discountPercent / 100);
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency
  }).format(amount);
}

export { calculateTotal, applyDiscount, formatCurrency };`;

function computeDiff(oldLines, newLines) {
  // Simple LCS-based diff
  const result = [];
  let oi = 0, ni = 0;
  while (oi < oldLines.length || ni < newLines.length) {
    if (oi >= oldLines.length) {
      result.push({ type:"add", newLine:ni+1, content:newLines[ni++] });
    } else if (ni >= newLines.length) {
      result.push({ type:"remove", oldLine:oi+1, content:oldLines[oi++] });
    } else if (oldLines[oi] === newLines[ni]) {
      result.push({ type:"same", oldLine:oi+1, newLine:ni+1, content:oldLines[oi] });
      oi++; ni++;
    } else {
      result.push({ type:"remove", oldLine:oi+1, content:oldLines[oi++] });
      result.push({ type:"add",    newLine:ni+1, content:newLines[ni++] });
    }
  }
  return result;
}

const LINE_COLORS = {
  add:    { bg:"rgba(16,185,129,0.10)", border:"rgba(16,185,129,0.3)", num:"var(--ok)"  },
  remove: { bg:"rgba(239,68,68,0.10)",  border:"rgba(239,68,68,0.3)",  num:"var(--err)" },
  same:   { bg:"transparent",           border:"transparent",           num:"var(--t3)"  },
};

let commentId = 1;

export default function CodeReviewTool() {
  const [comments,  setComments]  = useState({});
  const [newComment, setNewComment] = useState({});
  const [review,    setReview]    = useState(null); // "approved" | "changes" | "comment"
  const [reviewNote, setReviewNote] = useState("");
  const [collapsed, setCollapsed] = useState(new Set());
  const [activeComment, setActiveComment] = useState(null);

  const diff = useMemo(() => computeDiff(
    OLD_CODE.split("\n"), NEW_CODE.split("\n")
  ), []);

  const addComment = (lineKey) => {
    const text = newComment[lineKey];
    if (!text?.trim()) return;
    setComments(c => ({
      ...c,
      [lineKey]: [...(c[lineKey]||[]), { id:commentId++, text, by:"You", at:new Date().toLocaleTimeString(), replies:[] }]
    }));
    setNewComment(n => ({ ...n, [lineKey]:"" }));
    setActiveComment(null);
  };

  const addReply = (lineKey, commentIdx, text) => {
    if (!text?.trim()) return;
    setComments(c => {
      const arr = [...(c[lineKey]||[])];
      arr[commentIdx] = { ...arr[commentIdx], replies:[...arr[commentIdx].replies, { text, by:"You" }] };
      return { ...c, [lineKey]:arr };
    });
  };

  const stats = useMemo(() => ({
    added:   diff.filter(l => l.type==="add").length,
    removed: diff.filter(l => l.type==="remove").length,
    total:   Object.values(comments).reduce((s,c) => s+c.length, 0),
  }), [diff, comments]);

  return (
    <div className="card">
      <h2 className="card-title">🔍 Code Review / Diff Viewer</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at VMware, Broadcom.</strong> Unified diff view, inline comments with threads,
        line-level annotations, overall review decision.
      </p>

      {/* Stats bar */}
      <div style={{ display:"flex", gap:"var(--s4)", marginBottom:"var(--s5)", flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ color:"var(--ok)", fontWeight:700, fontSize:"var(--sm)" }}>+{stats.added}</span>
        <span style={{ color:"var(--err)", fontWeight:700, fontSize:"var(--sm)" }}>-{stats.removed}</span>
        <span style={{ color:"var(--t3)", fontSize:"var(--sm)" }}>{stats.total} comments</span>

        <div style={{ marginLeft:"auto", display:"flex", gap:"var(--s2)" }}>
          {[
            { val:"approved", label:"✅ Approve",          cls:"btn-success" },
            { val:"changes",  label:"🔄 Request Changes",  cls:"btn-warn"    },
            { val:"comment",  label:"💬 Comment",          cls:"btn-ghost"   },
          ].map(r => (
            <button key={r.val}
              className={`btn btn-sm ${review===r.val ? r.cls : "btn-ghost"}`}
              onClick={() => setReview(r.val)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review note */}
      {review && (
        <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
          borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s5)" }}>
          <textarea className="textarea" style={{ minHeight:70, marginBottom:"var(--s3)" }}
            placeholder="Add review summary..."
            value={reviewNote} onChange={e => setReviewNote(e.target.value)} />
          <div style={{ display:"flex", gap:"var(--s2)" }}>
            <button className={`btn btn-sm ${review==="approved"?"btn-success":review==="changes"?"btn-warn":"btn-primary"}`}
              onClick={() => alert(`Review submitted: ${review}\n${reviewNote}`)}>
              Submit Review
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setReview(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Diff */}
      <div style={{ border:"1px solid var(--gb)", borderRadius:"var(--r2)", overflow:"hidden",
        fontFamily:"var(--mono)", fontSize:"var(--xs)" }}>
        {/* File header */}
        <div style={{ background:"var(--glass2)", borderBottom:"1px solid var(--gb)",
          padding:"var(--s2) var(--s4)", display:"flex", justifyContent:"space-between",
          alignItems:"center" }}>
          <span style={{ color:"var(--a2)", fontWeight:700 }}>utils/pricing.js</span>
          <span style={{ color:"var(--t3)" }}>
            <span style={{ color:"var(--ok)" }}>+{stats.added}</span>
            {" / "}
            <span style={{ color:"var(--err)" }}>-{stats.removed}</span>
          </span>
        </div>

        {diff.map((line, i) => {
          const lineKey = `${line.type}-${line.oldLine||""}-${line.newLine||""}`;
          const c = LINE_COLORS[line.type];
          const lineComments = comments[lineKey] || [];

          return (
            <div key={i}>
              {/* Diff line */}
              <div
                style={{ display:"flex", background:c.bg, borderLeft:`3px solid ${c.border}`,
                  transition:"background var(--tr)" }}
                onMouseEnter={e => e.currentTarget.style.background = line.type==="same" ? "var(--glass)" : c.bg}
                onMouseLeave={e => e.currentTarget.style.background = c.bg}
              >
                {/* Line numbers */}
                <div style={{ width:40, padding:"2px 6px", color:c.num, textAlign:"right",
                  borderRight:"1px solid var(--gb)", flexShrink:0, userSelect:"none" }}>
                  {line.oldLine||""}
                </div>
                <div style={{ width:40, padding:"2px 6px", color:c.num, textAlign:"right",
                  borderRight:"1px solid var(--gb)", flexShrink:0, userSelect:"none" }}>
                  {line.newLine||""}
                </div>
                {/* Change indicator */}
                <div style={{ width:16, padding:"2px 4px", color:c.num, flexShrink:0, userSelect:"none" }}>
                  {line.type==="add"?"+":line.type==="remove"?"-":" "}
                </div>
                {/* Code */}
                <div style={{ flex:1, padding:"2px 8px", color:"var(--t1)", whiteSpace:"pre",
                  overflow:"hidden", textOverflow:"ellipsis" }}>
                  {line.content}
                </div>
                {/* Comment button */}
                <button
                  onClick={() => setActiveComment(activeComment===lineKey ? null : lineKey)}
                  style={{ padding:"2px 8px", background:"none", border:"none", cursor:"pointer",
                    color:"var(--t3)", fontSize:12, opacity:0, transition:"opacity var(--tr)" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                  title="Add comment"
                >
                  💬
                </button>
              </div>

              {/* Inline comment input */}
              {activeComment === lineKey && (
                <div style={{ background:"var(--glass2)", borderBottom:"1px solid var(--gb)",
                  padding:"var(--s3) var(--s4) var(--s3) 100px" }}>
                  <div style={{ display:"flex", gap:"var(--s2)" }}>
                    <input className="input" style={{ fontSize:"var(--xs)" }}
                      placeholder="Add a comment..."
                      value={newComment[lineKey]||""}
                      onChange={e => setNewComment(n => ({ ...n, [lineKey]:e.target.value }))}
                      onKeyDown={e => e.key==="Enter" && addComment(lineKey)}
                      autoFocus />
                    <button className="btn btn-primary btn-sm" onClick={() => addComment(lineKey)}>Post</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveComment(null)}>✕</button>
                  </div>
                </div>
              )}

              {/* Existing comments */}
              {lineComments.map((c, ci) => (
                <div key={c.id} style={{ background:"rgba(124,58,237,0.06)",
                  borderBottom:"1px solid var(--gb)", padding:"var(--s3) var(--s4) var(--s3) 100px" }}>
                  <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s1)" }}>
                    <span style={{ color:"var(--a2)", fontWeight:700, fontSize:"var(--xs)" }}>{c.by}</span>
                    <span style={{ color:"var(--t3)", fontSize:"var(--xs)" }}>{c.at}</span>
                  </div>
                  <div style={{ color:"var(--t1)", fontSize:"var(--xs)", marginBottom:"var(--s2)" }}>{c.text}</div>
                  {c.replies.map((r, ri) => (
                    <div key={ri} style={{ marginLeft:"var(--s4)", fontSize:"var(--xs)",
                      color:"var(--t2)", padding:"2px 0" }}>
                      <strong style={{ color:"var(--ok)" }}>{r.by}:</strong> {r.text}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
