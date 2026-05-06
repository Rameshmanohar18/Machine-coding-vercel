/**
 * PROBLEM 9 — Notification Center (like GitHub/Slack)
 * ─────────────────────────────────────────────────────────────
 * Asked at: Meta, Slack, ServiceNow
 *
 * Requirements:
 * - Bell icon with unread badge count
 * - Dropdown panel with notification list
 * - Mark individual as read / mark all as read
 * - Filter by type (all, unread, mentions, system)
 * - Delete notifications
 * - Relative timestamps ("2 min ago")
 * - Close on outside click
 */

import { useState, useRef, useEffect, useCallback } from "react";

const TYPES = ["mention", "system", "update", "alert"];
const TYPE_ICONS = { mention: "💬", system: "⚙️", update: "🔄", alert: "🚨" };
const TYPE_COLORS = { mention: "var(--a2)", system: "var(--info)", update: "var(--ok)", alert: "var(--err)" };

function timeAgo(date) {
  const diff = (Date.now() - date) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const INITIAL = [
  { id:1, type:"mention", title:"Alice mentioned you",    body:"Hey, can you review my PR?",          read:false, time: Date.now() - 120000  },
  { id:2, type:"alert",   title:"Build failed",           body:"main branch CI failed on step 3",     read:false, time: Date.now() - 300000  },
  { id:3, type:"system",  title:"Scheduled maintenance",  body:"System downtime on Sunday 2–4 AM",    read:false, time: Date.now() - 600000  },
  { id:4, type:"update",  title:"New version available",  body:"v2.4.0 is ready to deploy",           read:true,  time: Date.now() - 3600000 },
  { id:5, type:"mention", title:"Bob replied to you",     body:"Looks good! Merging now.",             read:true,  time: Date.now() - 7200000 },
  { id:6, type:"alert",   title:"High memory usage",      body:"Server memory at 92% — check now",    read:false, time: Date.now() - 900000  },
];

export default function NotificationCenter() {
  const [notifs,  setNotifs]  = useState(INITIAL);
  const [open,    setOpen]    = useState(false);
  const [filter,  setFilter]  = useState("all");
  const panelRef = useRef(null);
  const btnRef   = useRef(null);

  const unread = notifs.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (open && !panelRef.current?.contains(e.target) && !btnRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const markRead    = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const markAllRead = ()   => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const remove      = (id) => setNotifs(n => n.filter(x => x.id !== id));

  const filtered = notifs.filter(n => {
    if (filter === "unread")   return !n.read;
    if (filter === "mentions") return n.type === "mention";
    if (filter === "system")   return n.type === "system" || n.type === "alert";
    return true;
  });

  return (
    <div className="card">
      <h2 className="card-title">🔔 Notification Center</h2>
      <p style={{ marginBottom: "var(--s5)" }}>
        <strong>Asked at Meta, Slack, ServiceNow.</strong> Bell with unread badge,
        dropdown panel, filter tabs, mark read, delete, relative timestamps, outside-click close.
      </p>

      <div style={{ position: "relative", display: "inline-block" }}>
        {/* Bell button */}
        <button
          ref={btnRef}
          className="btn btn-ghost"
          onClick={() => setOpen(o => !o)}
          aria-label={`Notifications, ${unread} unread`}
          aria-haspopup="true"
          aria-expanded={open}
          style={{ position: "relative", fontSize: "var(--xl)" }}
        >
          🔔
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              background: "var(--err)", color: "#fff",
              borderRadius: "var(--pill)", fontSize: 10, fontWeight: 800,
              minWidth: 18, height: 18, display: "flex", alignItems: "center",
              justifyContent: "center", padding: "0 4px", lineHeight: 1
            }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {/* Panel */}
        {open && (
          <div
            ref={panelRef}
            style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 380, maxHeight: 520,
              background: "rgba(13,16,37,0.97)", backdropFilter: "blur(24px)",
              border: "1px solid var(--gb2)", borderRadius: "var(--r3)",
              boxShadow: "var(--sh3)", zIndex: 200,
              display: "flex", flexDirection: "column",
              animation: "slideUp .2s ease"
            }}
          >
            {/* Header */}
            <div style={{ padding: "var(--s4) var(--s5)", borderBottom: "1px solid var(--gb)",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: "var(--t1)" }}>
                Notifications {unread > 0 && <span className="badge badge-err" style={{ marginLeft: 6 }}>{unread}</span>}
              </span>
              {unread > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--gb)", padding: "0 var(--s3)" }}>
              {["all","unread","mentions","system"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: "8px 12px", background: "none", border: "none",
                    cursor: "pointer", fontFamily: "var(--font)", fontSize: "var(--xs)",
                    fontWeight: filter === f ? 700 : 400,
                    color: filter === f ? "var(--a2)" : "var(--t3)",
                    borderBottom: filter === f ? "2px solid var(--a2)" : "2px solid transparent",
                    marginBottom: -1, transition: "all var(--tr)", textTransform: "capitalize"
                  }}>
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtered.length === 0 && (
                <div style={{ padding: "var(--s8)", textAlign: "center", color: "var(--t3)", fontSize: "var(--sm)" }}>
                  No notifications
                </div>
              )}
              {filtered.map(n => (
                <div key={n.id}
                  style={{
                    padding: "var(--s3) var(--s5)",
                    borderBottom: "1px solid var(--gb)",
                    background: n.read ? "transparent" : "rgba(124,58,237,0.06)",
                    display: "flex", gap: "var(--s3)", alignItems: "flex-start",
                    transition: "background var(--tr)"
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{TYPE_ICONS[n.type]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontWeight: n.read ? 400 : 700, color: "var(--t1)",
                        fontSize: "var(--sm)", overflow: "hidden", textOverflow: "ellipsis",
                        whiteSpace: "nowrap", maxWidth: "75%" }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: "var(--xs)", color: "var(--t3)", flexShrink: 0 }}>
                        {timeAgo(n.time)}
                      </span>
                    </div>
                    <div style={{ fontSize: "var(--xs)", color: "var(--t2)", marginBottom: "var(--s2)" }}>
                      {n.body}
                    </div>
                    <div style={{ display: "flex", gap: "var(--s2)" }}>
                      <span style={{ fontSize: "var(--xs)", color: TYPE_COLORS[n.type],
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                        {n.type}
                      </span>
                      {!n.read && (
                        <button onClick={() => markRead(n.id)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "var(--a2)", fontSize: "var(--xs)", padding: 0 }}>
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => remove(n.id)}
                    style={{ background: "none", border: "none", cursor: "pointer",
                      color: "var(--t3)", fontSize: 14, padding: 0, flexShrink: 0 }}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
