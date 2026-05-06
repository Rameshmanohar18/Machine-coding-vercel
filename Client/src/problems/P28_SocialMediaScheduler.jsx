/**
 * PROBLEM 28 — Social Media Post Scheduler
 * Asked at: Sprinklr, Hootsuite, Buffer
 *
 * Requirements:
 * - Compose post with character limits per platform
 * - Schedule date/time picker
 * - Multi-platform selection (Twitter, LinkedIn, Instagram, Facebook)
 * - Content calendar view (week grid)
 * - Draft / Schedule / Publish states
 * - Preview per platform
 * - Bulk reschedule
 * - Analytics summary (mock)
 */

import { useState, useMemo } from "react";

const PLATFORMS = {
  Twitter:   { icon:"🐦", limit:280,  color:"#1da1f2" },
  LinkedIn:  { icon:"💼", limit:3000, color:"#0077b5" },
  Instagram: { icon:"📸", limit:2200, color:"#e1306c" },
  Facebook:  { icon:"👥", limit:63206,color:"#1877f2" },
};

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

let postId = 1;
const now = new Date();

const INIT_POSTS = [
  { id:postId++, text:"🚀 Excited to announce our new product launch! #innovation #tech", platforms:["Twitter","LinkedIn"], scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 10, 0), status:"scheduled" },
  { id:postId++, text:"Behind the scenes of our team building event 🎉", platforms:["Instagram","Facebook"], scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate()+2, 14, 30), status:"scheduled" },
  { id:postId++, text:"Check out our latest blog post on React performance tips!", platforms:["Twitter","LinkedIn","Facebook"], scheduledAt: new Date(now.getFullYear(), now.getMonth(), now.getDate()-1, 9, 0), status:"published" },
  { id:postId++, text:"Draft post about Q4 results...", platforms:["LinkedIn"], scheduledAt:null, status:"draft" },
];

const STATUS_COLORS = { scheduled:"var(--info)", published:"var(--ok)", draft:"var(--t3)", failed:"var(--err)" };

export default function SocialMediaScheduler() {
  const [posts,    setPosts]    = useState(INIT_POSTS);
  const [compose,  setCompose]  = useState({ text:"", platforms:["Twitter"], date:"", time:"09:00" });
  const [preview,  setPreview]  = useState("Twitter");
  const [tab,      setTab]      = useState("compose"); // compose | calendar | analytics
  const [selected, setSelected] = useState([]);

  const charCount = compose.text.length;
  const minLimit  = Math.min(...compose.platforms.map(p => PLATFORMS[p].limit));
  const overLimit = charCount > minLimit;

  const togglePlatform = (p) => {
    setCompose(c => ({
      ...c,
      platforms: c.platforms.includes(p) ? c.platforms.filter(x=>x!==p) : [...c.platforms, p]
    }));
  };

  const schedule = (status) => {
    if (!compose.text.trim()) return;
    const scheduledAt = compose.date
      ? new Date(`${compose.date}T${compose.time}`)
      : null;
    setPosts(p => [...p, {
      id:postId++, text:compose.text, platforms:compose.platforms,
      scheduledAt, status: status === "draft" ? "draft" : "scheduled"
    }]);
    setCompose({ text:"", platforms:["Twitter"], date:"", time:"09:00" });
  };

  const deletePost = (id) => setPosts(p => p.filter(x => x.id!==id));

  const bulkReschedule = () => {
    const newDate = new Date(Date.now() + 86400000 * 2);
    setPosts(p => p.map(x => selected.includes(x.id) ? { ...x, scheduledAt:newDate } : x));
    setSelected([]);
  };

  // Build week calendar
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekDays = Array.from({ length:7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const postsByDay = useMemo(() => {
    const map = {};
    posts.filter(p => p.scheduledAt).forEach(p => {
      const key = p.scheduledAt.toDateString();
      map[key] = [...(map[key]||[]), p];
    });
    return map;
  }, [posts]);

  const analytics = {
    scheduled: posts.filter(p=>p.status==="scheduled").length,
    published:  posts.filter(p=>p.status==="published").length,
    drafts:     posts.filter(p=>p.status==="draft").length,
    platforms:  Object.fromEntries(Object.keys(PLATFORMS).map(p => [p, posts.filter(x=>x.platforms.includes(p)).length])),
  };

  return (
    <div className="card">
      <h2 className="card-title">📅 Social Media Scheduler</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Sprinklr, Hootsuite.</strong> Multi-platform post composer with character limits,
        schedule picker, content calendar, draft/schedule/publish states, analytics.
      </p>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--gb)", marginBottom:"var(--s5)" }}>
        {[["compose","✏️ Compose"],["calendar","📅 Calendar"],["analytics","📊 Analytics"]].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:"8px 16px", background:"none", border:"none", cursor:"pointer",
              fontFamily:"var(--font)", fontSize:"var(--sm)", fontWeight:tab===t?700:400,
              color:tab===t?"var(--a2)":"var(--t3)",
              borderBottom:tab===t?"2px solid var(--a2)":"2px solid transparent",
              marginBottom:-1, transition:"all var(--tr)" }}>
            {l}
          </button>
        ))}
      </div>

      {/* Compose tab */}
      {tab === "compose" && (
        <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:280 }}>
            {/* Platform selector */}
            <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)", flexWrap:"wrap" }}>
              {Object.entries(PLATFORMS).map(([p, meta]) => (
                <button key={p}
                  onClick={() => togglePlatform(p)}
                  style={{
                    padding:"6px 12px", borderRadius:"var(--r2)", cursor:"pointer",
                    fontFamily:"var(--font)", fontSize:"var(--sm)", fontWeight:600,
                    border:`2px solid ${compose.platforms.includes(p) ? meta.color : "var(--gb)"}`,
                    background: compose.platforms.includes(p) ? meta.color+"22" : "transparent",
                    color: compose.platforms.includes(p) ? meta.color : "var(--t3)",
                    transition:"all var(--tr)"
                  }}>
                  {meta.icon} {p}
                </button>
              ))}
            </div>

            {/* Text area */}
            <div style={{ position:"relative", marginBottom:"var(--s4)" }}>
              <textarea className="textarea" style={{ minHeight:140,
                borderColor: overLimit ? "var(--err)" : undefined }}
                placeholder="What do you want to share?"
                value={compose.text}
                onChange={e => setCompose(c => ({ ...c, text:e.target.value }))} />
              <div style={{ position:"absolute", bottom:8, right:12, fontSize:"var(--xs)",
                color: overLimit ? "var(--err)" : "var(--t3)", fontWeight:overLimit?700:400 }}>
                {charCount}/{minLimit}
              </div>
            </div>

            {/* Schedule */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"var(--s3)", marginBottom:"var(--s5)" }}>
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" value={compose.date}
                  onChange={e => setCompose(c => ({ ...c, date:e.target.value }))} />
              </div>
              <div>
                <label className="label">Time</label>
                <input className="input" type="time" value={compose.time}
                  onChange={e => setCompose(c => ({ ...c, time:e.target.value }))} />
              </div>
            </div>

            <div style={{ display:"flex", gap:"var(--s3)" }}>
              <button className="btn btn-ghost" onClick={() => schedule("draft")}>Save Draft</button>
              <button className="btn btn-primary" style={{ flex:1 }}
                onClick={() => schedule("schedule")}
                disabled={!compose.text.trim() || overLimit || compose.platforms.length===0}>
                {compose.date ? "📅 Schedule" : "🚀 Publish Now"}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div style={{ minWidth:240, flex:"0 0 240px" }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>Preview</div>
            <div style={{ display:"flex", gap:"var(--s1)", marginBottom:"var(--s3)" }}>
              {compose.platforms.map(p => (
                <button key={p} className={`btn btn-sm ${preview===p?"btn-primary":"btn-ghost"}`}
                  onClick={() => setPreview(p)}>
                  {PLATFORMS[p].icon}
                </button>
              ))}
            </div>
            <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)" }}>
              <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s3)" }}>
                <div style={{ width:36, height:36, borderRadius:"50%",
                  background:"linear-gradient(135deg,var(--a),var(--a2))",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                  {PLATFORMS[preview]?.icon}
                </div>
                <div>
                  <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>Your Brand</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>@yourbrand · Just now</div>
                </div>
              </div>
              <p style={{ color:"var(--t1)", fontSize:"var(--sm)", lineHeight:1.6, minHeight:60 }}>
                {compose.text || <span style={{ color:"var(--t3)" }}>Your post preview...</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar tab */}
      {tab === "calendar" && (
        <div>
          {selected.length > 0 && (
            <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s4)", alignItems:"center",
              background:"var(--abg)", border:"1px solid rgba(124,58,237,.3)",
              borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)" }}>
              <span style={{ color:"var(--a2)", fontWeight:700, fontSize:"var(--sm)" }}>
                {selected.length} selected
              </span>
              <button className="btn btn-primary btn-sm" onClick={bulkReschedule}>
                Reschedule +2 days
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Cancel</button>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"var(--s2)" }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign:"center", fontSize:"var(--xs)", fontWeight:700,
                color:"var(--t3)", padding:"var(--s1)", textTransform:"uppercase", letterSpacing:".06em" }}>
                {d}
              </div>
            ))}
            {weekDays.map((day, i) => {
              const key   = day.toDateString();
              const dayPosts = postsByDay[key] || [];
              const isToday  = day.toDateString() === now.toDateString();
              return (
                <div key={i} style={{ minHeight:100, background:"var(--glass)",
                  border:`1px solid ${isToday?"var(--a)":"var(--gb)"}`,
                  borderRadius:"var(--r2)", padding:"var(--s2)" }}>
                  <div style={{ fontWeight:isToday?800:400, color:isToday?"var(--a2)":"var(--t2)",
                    fontSize:"var(--sm)", marginBottom:"var(--s1)" }}>
                    {day.getDate()}
                  </div>
                  {dayPosts.map(p => (
                    <div key={p.id}
                      onClick={() => setSelected(s => s.includes(p.id) ? s.filter(x=>x!==p.id) : [...s,p.id])}
                      style={{ background: selected.includes(p.id) ? "var(--abg)" : STATUS_COLORS[p.status]+"22",
                        border:`1px solid ${STATUS_COLORS[p.status]}44`,
                        borderRadius:"var(--r1)", padding:"2px 4px", marginBottom:2,
                        fontSize:"var(--xs)", color:STATUS_COLORS[p.status], cursor:"pointer",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {p.platforms.map(pl => PLATFORMS[pl].icon).join("")} {p.text.slice(0,20)}...
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics tab */}
      {tab === "analytics" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"var(--s3)", marginBottom:"var(--s6)" }}>
            {[
              { label:"Scheduled", val:analytics.scheduled, color:"var(--info)" },
              { label:"Published",  val:analytics.published,  color:"var(--ok)"   },
              { label:"Drafts",     val:analytics.drafts,     color:"var(--t3)"   },
              { label:"Total",      val:posts.length,         color:"var(--a2)"   },
            ].map(c => (
              <div key={c.label} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)", padding:"var(--s4)", textAlign:"center" }}>
                <div style={{ fontSize:"var(--2xl)", fontWeight:800, color:c.color }}>{c.val}</div>
                <div className="label" style={{ marginTop:"var(--s1)" }}>{c.label}</div>
              </div>
            ))}
          </div>

          <div className="label" style={{ marginBottom:"var(--s3)" }}>Posts per Platform</div>
          {Object.entries(analytics.platforms).map(([p, count]) => (
            <div key={p} style={{ marginBottom:"var(--s3)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"var(--sm)",
                marginBottom:"var(--s1)" }}>
                <span style={{ color:"var(--t1)" }}>{PLATFORMS[p].icon} {p}</span>
                <span style={{ color:"var(--t2)", fontWeight:700 }}>{count} posts</span>
              </div>
              <div style={{ height:6, background:"var(--gb)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(count/posts.length)*100}%`,
                  background:PLATFORMS[p].color, borderRadius:3, transition:"width .4s ease" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
