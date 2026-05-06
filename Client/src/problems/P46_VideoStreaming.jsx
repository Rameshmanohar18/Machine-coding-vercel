/**
 * PROBLEM 46 — Video Streaming Platform (YouTube/Netflix clone)
 * Asked at: Hotstar, Netflix India, YouTube India
 */

import { useState, useMemo } from "react";

const VIDEOS = [
  { id:1,  title:"React 18 Deep Dive",           channel:"Fireship",      views:"2.4M", duration:"18:32", thumb:"🎬", category:"Tech",    likes:45000, subs:"1.2M" },
  { id:2,  title:"System Design Interview",       channel:"TechDummies",   views:"1.8M", duration:"45:12", thumb:"🏗",  category:"Tech",    likes:38000, subs:"890K" },
  { id:3,  title:"CSS Grid Masterclass",          channel:"KevinPowell",   views:"890K", duration:"32:45", thumb:"🎨", category:"Design",  likes:22000, subs:"650K" },
  { id:4,  title:"Node.js Crash Course",          channel:"TraversyMedia", views:"3.1M", duration:"1:24:00",thumb:"⚡",category:"Tech",    likes:67000, subs:"2.1M" },
  { id:5,  title:"TypeScript for Beginners",      channel:"NetNinja",      views:"1.2M", duration:"28:15", thumb:"📘", category:"Tech",    likes:31000, subs:"780K" },
  { id:6,  title:"UI/UX Design Principles",       channel:"DesignCourse",  views:"560K", duration:"22:40", thumb:"✏️", category:"Design",  likes:18000, subs:"420K" },
  { id:7,  title:"Docker & Kubernetes",           channel:"TechWorld",     views:"2.2M", duration:"1:12:30",thumb:"🐳",category:"DevOps",  likes:52000, subs:"1.5M" },
  { id:8,  title:"GraphQL Full Course",           channel:"Academind",     views:"780K", duration:"4:30:00",thumb:"🔗",category:"Tech",    likes:24000, subs:"560K" },
  { id:9,  title:"Figma Tutorial 2024",           channel:"DesignCourse",  views:"340K", duration:"1:05:20",thumb:"🖌",category:"Design",  likes:12000, subs:"420K" },
  { id:10, title:"AWS Solutions Architect",       channel:"ACloudGuru",    views:"1.5M", duration:"6:45:00",thumb:"☁️",category:"Cloud",   likes:41000, subs:"980K" },
];

const CATEGORIES = ["All", "Tech", "Design", "DevOps", "Cloud"];

export default function VideoStreaming() {
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");
  const [playing,   setPlaying]   = useState(null);
  const [liked,     setLiked]     = useState([]);
  const [saved,     setSaved]     = useState([]);
  const [subscribed,setSubscribed]= useState([]);
  const [progress,  setProgress]  = useState({});
  const [comments,  setComments]  = useState({});
  const [newComment,setNewComment]= useState("");

  const filtered = useMemo(() => VIDEOS.filter(v => {
    if (search && !v.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "All" && v.category !== category) return false;
    return true;
  }), [search, category]);

  const video = VIDEOS.find(v=>v.id===playing);

  const toggleLike = (id) => setLiked(l=>l.includes(id)?l.filter(x=>x!==id):[...l,id]);
  const toggleSave = (id) => setSaved(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
  const toggleSub  = (ch) => setSubscribed(s=>s.includes(ch)?s.filter(x=>x!==ch):[...s,ch]);

  const addComment = (id) => {
    if (!newComment.trim()) return;
    setComments(c => ({ ...c, [id]:[...(c[id]||[]), { text:newComment, user:"You", time:"Just now" }] }));
    setNewComment("");
  };

  if (playing && video) {
    return (
      <div className="card">
        <button className="btn btn-ghost btn-sm" style={{ marginBottom:"var(--s4)" }}
          onClick={() => setPlaying(null)}>← Back</button>

        <div style={{ display:"flex", gap:"var(--s5)", flexWrap:"wrap" }}>
          <div style={{ flex:2, minWidth:300 }}>
            {/* Video player */}
            <div style={{ background:"#000", borderRadius:"var(--r2)", aspectRatio:"16/9",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:80, marginBottom:"var(--s4)", position:"relative", overflow:"hidden" }}>
              {video.thumb}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4,
                background:"rgba(255,255,255,.2)" }}>
                <div style={{ height:"100%", width:`${progress[video.id]||0}%`,
                  background:"var(--err)", transition:"width .3s" }} />
              </div>
              <input type="range" min={0} max={100} value={progress[video.id]||0}
                onChange={e=>setProgress(p=>({...p,[video.id]:Number(e.target.value)}))}
                style={{ position:"absolute", bottom:0, left:0, right:0, opacity:0,
                  cursor:"pointer", width:"100%", height:20 }} />
            </div>

            <h2 style={{ marginBottom:"var(--s2)" }}>{video.title}</h2>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              marginBottom:"var(--s4)", flexWrap:"wrap", gap:"var(--s3)" }}>
              <div style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>
                {video.views} views · {video.duration}
              </div>
              <div style={{ display:"flex", gap:"var(--s2)" }}>
                <button className={`btn btn-sm ${liked.includes(video.id)?"btn-primary":"btn-ghost"}`}
                  onClick={() => toggleLike(video.id)}>
                  👍 {(video.likes + (liked.includes(video.id)?1:0)).toLocaleString()}
                </button>
                <button className={`btn btn-sm ${saved.includes(video.id)?"btn-warn":"btn-ghost"}`}
                  onClick={() => toggleSave(video.id)}>
                  {saved.includes(video.id)?"🔖 Saved":"📌 Save"}
                </button>
                <button className="btn btn-ghost btn-sm">🔗 Share</button>
              </div>
            </div>

            {/* Channel */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              background:"var(--glass2)", border:"1px solid var(--gb)", borderRadius:"var(--r2)",
              padding:"var(--s3) var(--s4)", marginBottom:"var(--s5)" }}>
              <div style={{ display:"flex", gap:"var(--s3)", alignItems:"center" }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--abg)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                  📺
                </div>
                <div>
                  <div style={{ fontWeight:700, color:"var(--t1)" }}>{video.channel}</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{video.subs} subscribers</div>
                </div>
              </div>
              <button className={`btn btn-sm ${subscribed.includes(video.channel)?"btn-danger":"btn-primary"}`}
                onClick={() => toggleSub(video.channel)}>
                {subscribed.includes(video.channel)?"Subscribed ✓":"Subscribe"}
              </button>
            </div>

            {/* Comments */}
            <div>
              <h3 style={{ marginBottom:"var(--s4)" }}>
                Comments ({(comments[video.id]||[]).length})
              </h3>
              <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s4)" }}>
                <input className="input" placeholder="Add a comment..."
                  value={newComment} onChange={e=>setNewComment(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&addComment(video.id)} />
                <button className="btn btn-primary btn-sm" onClick={() => addComment(video.id)}>Post</button>
              </div>
              {(comments[video.id]||[]).map((c,i) => (
                <div key={i} style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s3)" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--abg)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>
                    👤
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>
                      {c.user} <span style={{ color:"var(--t3)", fontWeight:400 }}>{c.time}</span>
                    </div>
                    <div style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ flex:1, minWidth:220 }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>Up Next</div>
            {VIDEOS.filter(v=>v.id!==playing).slice(0,5).map(v => (
              <div key={v.id} onClick={() => setPlaying(v.id)}
                style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s3)", cursor:"pointer",
                  padding:"var(--s2)", borderRadius:"var(--r2)", transition:"all var(--tr)" }}
                onMouseEnter={e=>e.currentTarget.style.background="var(--glass2)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{ width:80, height:50, background:"var(--glass2)", borderRadius:"var(--r1)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                  {v.thumb}
                </div>
                <div>
                  <div style={{ fontWeight:600, color:"var(--t1)", fontSize:"var(--xs)",
                    lineHeight:1.4, marginBottom:2 }}>{v.title}</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{v.channel}</div>
                  <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{v.views} · {v.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">▶️ Video Streaming Platform</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Hotstar, Netflix India.</strong> Video grid with search/filter, player with
        progress bar, like/save/subscribe, comments, up-next sidebar.
      </p>

      <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s5)", flexWrap:"wrap" }}>
        <input className="input" style={{ flex:1 }} placeholder="Search videos..."
          value={search} onChange={e=>setSearch(e.target.value)} />
        {CATEGORIES.map(c => (
          <button key={c} className={`btn btn-sm ${category===c?"btn-primary":"btn-ghost"}`}
            onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"var(--s4)" }}>
        {filtered.map(v => (
          <div key={v.id} onClick={() => setPlaying(v.id)}
            style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", overflow:"hidden", cursor:"pointer", transition:"all var(--tr)" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.borderColor="var(--a)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor="var(--gb)"; }}>
            <div style={{ height:130, background:"var(--glass)", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:56, position:"relative" }}>
              {v.thumb}
              <span style={{ position:"absolute", bottom:8, right:8, background:"rgba(0,0,0,.8)",
                color:"#fff", fontSize:"var(--xs)", padding:"2px 6px", borderRadius:4 }}>
                {v.duration}
              </span>
              {progress[v.id] > 0 && (
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3,
                  background:"rgba(255,255,255,.2)" }}>
                  <div style={{ height:"100%", width:`${progress[v.id]}%`, background:"var(--err)" }} />
                </div>
              )}
            </div>
            <div style={{ padding:"var(--s3)" }}>
              <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)", lineHeight:1.4,
                marginBottom:"var(--s1)", overflow:"hidden", display:"-webkit-box",
                WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                {v.title}
              </div>
              <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{v.channel}</div>
              <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{v.views} views</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
