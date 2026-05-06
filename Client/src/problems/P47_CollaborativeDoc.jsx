/**
 * PROBLEM 47 — Collaborative Document Editor
 * Asked at: Atlassian (Confluence), Notion, Google Docs team
 *
 * Requirements:
 * - Rich text editing with toolbar
 * - Multiple cursors simulation (other users)
 * - Comment threads on selected text
 * - Version history
 * - Real-time "user is typing" indicator
 * - Share with permissions (view/edit)
 * - Table of contents auto-generation
 * - Word count + reading time
 */

import { useState, useRef, useEffect, useCallback } from "react";

const COLLABORATORS = [
  { id:1, name:"Alice",   color:"#a78bfa", cursor:{ line:3, col:15 } },
  { id:2, name:"Bob",     color:"#22d3ee", cursor:{ line:7, col:8  } },
  { id:3, name:"Charlie", color:"#10b981", cursor:{ line:12,col:22 } },
];

const VERSIONS = [
  { id:1, label:"v1.0 — Initial draft",    time:"2 hours ago",  author:"Alice"   },
  { id:2, label:"v1.1 — Added intro",      time:"1 hour ago",   author:"Bob"     },
  { id:3, label:"v1.2 — Updated sections", time:"30 min ago",   author:"Charlie" },
  { id:4, label:"v1.3 — Current",          time:"Just now",     author:"You"     },
];

const INIT_CONTENT = `# React Machine Coding Guide

## Introduction
This document covers the most important React concepts for machine coding interviews at top product companies.

## Core Hooks
Understanding hooks is fundamental to modern React development. The most commonly tested hooks include useState, useEffect, useMemo, useCallback, and useRef.

## Performance Optimization
Performance is a key concern in production applications. Techniques include memoization, code splitting, and virtual scrolling.

## Design Patterns
Common patterns include compound components, render props, custom hooks, and the provider pattern.

## Interview Tips
- Always clarify requirements before coding
- Think about edge cases
- Write clean, readable code
- Consider performance implications`;

export default function CollaborativeDoc() {
  const [content,  setContent]  = useState(INIT_CONTENT);
  const [tab,      setTab]      = useState("editor"); // editor | history | share
  const [comments, setComments] = useState([
    { id:1, text:"Great intro!", author:"Alice", line:3, resolved:false },
    { id:2, text:"Add more examples here", author:"Bob", line:8, resolved:false },
  ]);
  const [newComment, setNewComment] = useState("");
  const [typing,   setTyping]   = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [shared,   setShared]   = useState([
    { email:"alice@co.com", role:"edit" },
    { email:"bob@co.com",   role:"view" },
  ]);
  const editorRef = useRef(null);
  const typingTimer = useRef(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime  = Math.ceil(wordCount / 200);

  const headings = content.split("\n")
    .filter(l => l.startsWith("#"))
    .map(l => ({ level:l.match(/^#+/)[0].length, text:l.replace(/^#+\s/,"") }));

  const handleChange = (e) => {
    setContent(e.target.value);
    setTyping("You");
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(null), 1500);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments(c => [...c, { id:Date.now(), text:newComment, author:"You",
      line:Math.floor(Math.random()*15)+1, resolved:false }]);
    setNewComment("");
  };

  const resolveComment = (id) => setComments(c => c.map(x => x.id===id?{...x,resolved:true}:x));

  const addShare = () => {
    if (!shareEmail.trim()) return;
    setShared(s => [...s, { email:shareEmail, role:"view" }]);
    setShareEmail("");
  };

  return (
    <div className="card">
      <h2 className="card-title">📄 Collaborative Document Editor</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Atlassian, Notion.</strong> Rich text editor, multi-user cursors,
        comment threads, version history, share permissions, table of contents.
      </p>

      {/* Toolbar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:"var(--s4)", flexWrap:"wrap", gap:"var(--s3)" }}>
        <div style={{ display:"flex", gap:"var(--s2)", alignItems:"center" }}>
          {/* Collaborator avatars */}
          {COLLABORATORS.map(c => (
            <div key={c.id} title={`${c.name} is editing`}
              style={{ width:28, height:28, borderRadius:"50%", background:c.color,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:800, color:"#fff", cursor:"default" }}>
              {c.name[0]}
            </div>
          ))}
          {typing && (
            <span style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
              {typing} is typing...
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:"var(--s2)", fontSize:"var(--xs)", color:"var(--t3)" }}>
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--gb)", marginBottom:"var(--s4)" }}>
        {[["editor","✏️ Editor"],["history","🕐 History"],["share","🔗 Share"]].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:"8px 14px", background:"none", border:"none", cursor:"pointer",
              fontFamily:"var(--font)", fontSize:"var(--sm)", fontWeight:tab===t?700:400,
              color:tab===t?"var(--a2)":"var(--t3)",
              borderBottom:tab===t?"2px solid var(--a2)":"2px solid transparent",
              marginBottom:-1, transition:"all var(--tr)" }}>
            {l}
          </button>
        ))}
      </div>

      {tab === "editor" && (
        <div style={{ display:"flex", gap:"var(--s5)", flexWrap:"wrap" }}>
          {/* Editor */}
          <div style={{ flex:2, minWidth:300 }}>
            <textarea
              ref={editorRef}
              className="textarea"
              style={{ minHeight:400, fontFamily:"var(--mono)", fontSize:"var(--sm)",
                lineHeight:1.8, resize:"vertical" }}
              value={content}
              onChange={handleChange}
            />

            {/* Comments */}
            <div style={{ marginTop:"var(--s5)" }}>
              <h3 style={{ marginBottom:"var(--s4)" }}>
                Comments ({comments.filter(c=>!c.resolved).length} open)
              </h3>
              <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)" }}>
                <input className="input" placeholder="Add a comment..."
                  value={newComment} onChange={e=>setNewComment(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addComment()} />
                <button className="btn btn-primary btn-sm" onClick={addComment}>Post</button>
              </div>
              {comments.map(c => (
                <div key={c.id} style={{
                  background:c.resolved?"var(--glass)":"var(--glass2)",
                  border:"1px solid var(--gb)", borderRadius:"var(--r2)",
                  padding:"var(--s3) var(--s4)", marginBottom:"var(--s2)",
                  opacity:c.resolved?0.5:1
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s1)" }}>
                    <span style={{ fontWeight:700, color:"var(--a2)", fontSize:"var(--sm)" }}>{c.author}</span>
                    <span style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>Line {c.line}</span>
                  </div>
                  <div style={{ color:"var(--t1)", fontSize:"var(--sm)", marginBottom:"var(--s2)" }}>{c.text}</div>
                  {!c.resolved && (
                    <button className="btn btn-success btn-sm" onClick={() => resolveComment(c.id)}>
                      ✓ Resolve
                    </button>
                  )}
                  {c.resolved && <span style={{ fontSize:"var(--xs)", color:"var(--ok)" }}>✓ Resolved</span>}
                </div>
              ))}
            </div>
          </div>

          {/* TOC */}
          <div style={{ minWidth:180, flex:"0 0 180px" }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>Table of Contents</div>
            <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)" }}>
              {headings.map((h,i) => (
                <div key={i} style={{ paddingLeft:(h.level-1)*12, marginBottom:"var(--s2)",
                  fontSize:"var(--xs)", color:h.level===1?"var(--a2)":"var(--t2)",
                  fontWeight:h.level===1?700:400, cursor:"pointer" }}
                  onMouseEnter={e=>e.currentTarget.style.color="var(--a2)"}
                  onMouseLeave={e=>e.currentTarget.style.color=h.level===1?"var(--a2)":"var(--t2)"}>
                  {h.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div>
          {VERSIONS.map((v,i) => (
            <div key={v.id} style={{ display:"flex", gap:"var(--s4)", alignItems:"center",
              background:i===VERSIONS.length-1?"var(--abg)":"var(--glass2)",
              border:`1px solid ${i===VERSIONS.length-1?"var(--a)":"var(--gb)"}`,
              borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s3)" }}>
              <div style={{ width:8, height:8, borderRadius:"50%",
                background:i===VERSIONS.length-1?"var(--a2)":"var(--t3)", flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{v.label}</div>
                <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{v.author} · {v.time}</div>
              </div>
              {i < VERSIONS.length-1 && (
                <button className="btn btn-ghost btn-sm"
                  onClick={() => alert(`Restored to ${v.label}`)}>
                  Restore
                </button>
              )}
              {i === VERSIONS.length-1 && (
                <span className="badge badge-ok">Current</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "share" && (
        <div style={{ maxWidth:480 }}>
          <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s5)" }}>
            <input className="input" placeholder="Add email address..."
              value={shareEmail} onChange={e=>setShareEmail(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addShare()} />
            <button className="btn btn-primary" onClick={addShare}>Invite</button>
          </div>

          <div className="label" style={{ marginBottom:"var(--s3)" }}>People with access</div>
          {shared.map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"var(--s3)",
              padding:"var(--s3) var(--s4)", background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", marginBottom:"var(--s2)" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--abg)",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
                👤
              </div>
              <span style={{ flex:1, color:"var(--t1)", fontSize:"var(--sm)" }}>{s.email}</span>
              <select className="select" style={{ width:"auto" }} value={s.role}
                onChange={e=>setShared(sh=>sh.map((x,j)=>j===i?{...x,role:e.target.value}:x))}>
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </select>
              <button className="btn btn-danger btn-sm"
                onClick={() => setShared(sh=>sh.filter((_,j)=>j!==i))}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
