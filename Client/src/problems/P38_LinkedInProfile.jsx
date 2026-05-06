/**
 * PROBLEM 38 — LinkedIn-style Profile & Feed
 * Asked at: LinkedIn, Sprinklr
 *
 * Requirements:
 * - Profile card with edit mode
 * - Skills with endorsements
 * - Experience timeline (add/edit/delete)
 * - Connection suggestions with connect/ignore
 * - Post feed with like/comment/share
 * - Profile completion meter
 * - "Open to Work" toggle
 * - Recommendations section
 */

import { useState, useMemo } from "react";

const SKILLS_INIT = [
  { name:"React",       endorsements:42 },
  { name:"JavaScript",  endorsements:38 },
  { name:"TypeScript",  endorsements:29 },
  { name:"Node.js",     endorsements:24 },
  { name:"System Design",endorsements:18 },
  { name:"CSS",         endorsements:15 },
];

const EXPERIENCE_INIT = [
  { id:1, title:"Senior Frontend Engineer", company:"Flipkart",  duration:"2022–Present", desc:"Led React migration for checkout flow." },
  { id:2, title:"Frontend Developer",       company:"Freshworks", duration:"2020–2022",   desc:"Built CRM dashboard components." },
  { id:3, title:"Junior Developer",         company:"Startup",    duration:"2019–2020",   desc:"Full-stack development with MERN." },
];

const SUGGESTIONS = [
  { id:1, name:"Priya Sharma",   title:"SDE-2 at Amazon",    mutual:12, avatar:"👩‍💻" },
  { id:2, name:"Rahul Gupta",    title:"Frontend at Google",  mutual:8,  avatar:"👨‍💻" },
  { id:3, name:"Ananya Singh",   title:"UX Lead at Swiggy",   mutual:5,  avatar:"👩‍🎨" },
  { id:4, name:"Karthik Rajan",  title:"ML Engineer at Meta", mutual:15, avatar:"🧑‍🔬" },
];

const POSTS = [
  { id:1, text:"Just got promoted to Senior Engineer! 🎉 Grateful for the journey. #career #growth", likes:234, comments:45 },
  { id:2, text:"5 React patterns every developer should know in 2024. Thread 🧵 #ReactJS #webdev", likes:567, comments:89 },
];

let expId = 10;

export default function LinkedInProfile() {
  const [profile, setProfile] = useState({
    name:"Ramesh Kumar", title:"Senior Frontend Engineer", company:"Flipkart",
    location:"Bangalore, India", about:"Passionate frontend engineer with 5+ years building scalable React applications.",
    openToWork:false, connections:847
  });
  const [editing,    setEditing]    = useState(false);
  const [editForm,   setEditForm]   = useState({});
  const [skills,     setSkills]     = useState(SKILLS_INIT);
  const [experience, setExperience] = useState(EXPERIENCE_INIT);
  const [connected,  setConnected]  = useState([]);
  const [ignored,    setIgnored]    = useState([]);
  const [posts,      setPosts]      = useState(POSTS);
  const [newSkill,   setNewSkill]   = useState("");
  const [addingExp,  setAddingExp]  = useState(false);
  const [newExp,     setNewExp]     = useState({ title:"", company:"", duration:"", desc:"" });

  const completion = useMemo(() => {
    let score = 0;
    if (profile.name)     score += 20;
    if (profile.title)    score += 20;
    if (profile.about)    score += 20;
    if (skills.length>0)  score += 20;
    if (experience.length>0) score += 20;
    return score;
  }, [profile, skills, experience]);

  const startEdit = () => { setEditForm({ ...profile }); setEditing(true); };
  const saveEdit  = () => { setProfile(editForm); setEditing(false); };

  const endorseSkill = (name) => {
    setSkills(s => s.map(x => x.name===name ? { ...x, endorsements:x.endorsements+1 } : x));
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills(s => [...s, { name:newSkill.trim(), endorsements:0 }]);
    setNewSkill("");
  };

  const removeSkill = (name) => setSkills(s => s.filter(x=>x.name!==name));

  const addExp = () => {
    if (!newExp.title.trim()) return;
    setExperience(e => [{ id:expId++, ...newExp }, ...e]);
    setNewExp({ title:"", company:"", duration:"", desc:"" });
    setAddingExp(false);
  };

  const deleteExp = (id) => setExperience(e => e.filter(x=>x.id!==id));

  const toggleLike = (id) => setPosts(p => p.map(x => x.id===id ? { ...x, likes:x.likes+1 } : x));

  const suggestions = SUGGESTIONS.filter(s => !connected.includes(s.id) && !ignored.includes(s.id));

  return (
    <div className="card">
      <h2 className="card-title">💼 LinkedIn Profile</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at LinkedIn, Sprinklr.</strong> Editable profile, skills with endorsements,
        experience timeline, connection suggestions, post feed, profile completion meter.
      </p>

      <div style={{ display:"flex", gap:"var(--s6)", flexWrap:"wrap" }}>
        {/* Left column */}
        <div style={{ flex:2, minWidth:280 }}>
          {/* Profile card */}
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r3)", overflow:"hidden", marginBottom:"var(--s4)" }}>
            {/* Cover */}
            <div style={{ height:80, background:"linear-gradient(135deg,var(--a),var(--a3))" }} />
            <div style={{ padding:"0 var(--s5) var(--s5)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
                marginTop:-30, marginBottom:"var(--s3)" }}>
                <div style={{ width:72, height:72, borderRadius:"50%",
                  background:"var(--bg2)", border:"3px solid var(--bg2)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>
                  👨‍💻
                </div>
                <div style={{ display:"flex", gap:"var(--s2)", marginTop:36 }}>
                  <button className={`btn btn-sm ${profile.openToWork?"btn-success":"btn-ghost"}`}
                    onClick={() => setProfile(p=>({...p,openToWork:!p.openToWork}))}>
                    {profile.openToWork?"✅ Open to Work":"Set Open to Work"}
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={startEdit}>Edit</button>
                </div>
              </div>

              {editing ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
                  {["name","title","company","location"].map(f => (
                    <input key={f} className="input" placeholder={f}
                      value={editForm[f]||""} onChange={e=>setEditForm(x=>({...x,[f]:e.target.value}))} />
                  ))}
                  <textarea className="textarea" style={{ minHeight:80 }} placeholder="About"
                    value={editForm.about||""} onChange={e=>setEditForm(x=>({...x,about:e.target.value}))} />
                  <div style={{ display:"flex", gap:"var(--s2)" }}>
                    <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={saveEdit}>Save</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 style={{ marginBottom:"var(--s1)" }}>{profile.name}</h2>
                  <div style={{ color:"var(--t1)", fontWeight:600, marginBottom:"var(--s1)" }}>{profile.title}</div>
                  <div style={{ color:"var(--t2)", fontSize:"var(--sm)", marginBottom:"var(--s1)" }}>{profile.company}</div>
                  <div style={{ color:"var(--t3)", fontSize:"var(--sm)", marginBottom:"var(--s3)" }}>📍 {profile.location}</div>
                  <p style={{ fontSize:"var(--sm)", marginBottom:"var(--s3)" }}>{profile.about}</p>
                  <div style={{ fontSize:"var(--sm)", color:"var(--a2)", fontWeight:700 }}>
                    🔗 {profile.connections} connections
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Experience */}
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r3)", padding:"var(--s5)", marginBottom:"var(--s4)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              marginBottom:"var(--s4)" }}>
              <h3 style={{ margin:0 }}>Experience</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setAddingExp(true)}>+ Add</button>
            </div>

            {addingExp && (
              <div style={{ background:"var(--glass)", border:"1px solid var(--gb)",
                borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s4)" }}>
                {[
                  { key:"title",    placeholder:"Job Title"    },
                  { key:"company",  placeholder:"Company"      },
                  { key:"duration", placeholder:"2022–Present" },
                  { key:"desc",     placeholder:"Description"  },
                ].map(f => (
                  <input key={f.key} className="input" style={{ marginBottom:"var(--s2)" }}
                    placeholder={f.placeholder} value={newExp[f.key]}
                    onChange={e=>setNewExp(x=>({...x,[f.key]:e.target.value}))} />
                ))}
                <div style={{ display:"flex", gap:"var(--s2)" }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAddingExp(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={addExp}>Save</button>
                </div>
              </div>
            )}

            {experience.map((e, i) => (
              <div key={e.id} style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s4)",
                paddingBottom:"var(--s4)", borderBottom:i<experience.length-1?"1px solid var(--gb)":"none" }}>
                <div style={{ width:44, height:44, borderRadius:"var(--r1)", background:"var(--abg)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                  🏢
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{e.title}</div>
                  <div style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>{e.company}</div>
                  <div style={{ color:"var(--t3)", fontSize:"var(--xs)", marginBottom:"var(--s1)" }}>{e.duration}</div>
                  <div style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>{e.desc}</div>
                </div>
                <button onClick={() => deleteExp(e.id)}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:14 }}>✕</button>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r3)", padding:"var(--s5)", marginBottom:"var(--s4)" }}>
            <h3 style={{ marginBottom:"var(--s4)" }}>Skills</h3>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"var(--s2)", marginBottom:"var(--s4)" }}>
              {skills.map(s => (
                <div key={s.name} style={{ display:"flex", alignItems:"center", gap:"var(--s2)",
                  background:"var(--glass)", border:"1px solid var(--gb)", borderRadius:"var(--r2)",
                  padding:"var(--s2) var(--s3)" }}>
                  <span style={{ fontSize:"var(--sm)", color:"var(--t1)", fontWeight:600 }}>{s.name}</span>
                  <button onClick={() => endorseSkill(s.name)}
                    style={{ background:"none", border:"none", cursor:"pointer",
                      color:"var(--a2)", fontSize:"var(--xs)", fontWeight:700 }}>
                    👍 {s.endorsements}
                  </button>
                  <button onClick={() => removeSkill(s.name)}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"var(--t3)", fontSize:10 }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"var(--s2)" }}>
              <input className="input" placeholder="Add a skill..." value={newSkill}
                onChange={e=>setNewSkill(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addSkill()} />
              <button className="btn btn-primary btn-sm" onClick={addSkill}>Add</button>
            </div>
          </div>

          {/* Feed */}
          <div>
            <h3 style={{ marginBottom:"var(--s4)" }}>Activity</h3>
            {posts.map(p => (
              <div key={p.id} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                borderRadius:"var(--r3)", padding:"var(--s4)", marginBottom:"var(--s3)" }}>
                <div style={{ display:"flex", gap:"var(--s3)", marginBottom:"var(--s3)" }}>
                  <span style={{ fontSize:32 }}>👨‍💻</span>
                  <div>
                    <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{profile.name}</div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{profile.title}</div>
                  </div>
                </div>
                <p style={{ color:"var(--t1)", fontSize:"var(--sm)", lineHeight:1.6, marginBottom:"var(--s3)" }}>
                  {p.text}
                </p>
                <div style={{ display:"flex", gap:"var(--s4)", borderTop:"1px solid var(--gb)", paddingTop:"var(--s3)" }}>
                  <button onClick={() => toggleLike(p.id)}
                    style={{ background:"none", border:"none", cursor:"pointer",
                      color:"var(--t2)", fontSize:"var(--sm)", display:"flex", alignItems:"center", gap:"var(--s1)" }}>
                    👍 {p.likes}
                  </button>
                  <button style={{ background:"none", border:"none", cursor:"pointer",
                    color:"var(--t2)", fontSize:"var(--sm)" }}>
                    💬 {p.comments}
                  </button>
                  <button style={{ background:"none", border:"none", cursor:"pointer",
                    color:"var(--t2)", fontSize:"var(--sm)" }}>
                    🔁 Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ flex:1, minWidth:220 }}>
          {/* Profile completion */}
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s4)" }}>
            <div className="label" style={{ marginBottom:"var(--s2)" }}>Profile Strength</div>
            <div style={{ fontSize:"var(--xl)", fontWeight:800, color:"var(--a2)", marginBottom:"var(--s2)" }}>
              {completion}%
            </div>
            <div style={{ height:6, background:"var(--gb)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${completion}%`,
                background:"linear-gradient(90deg,var(--a),var(--a2))",
                borderRadius:3, transition:"width .4s ease" }} />
            </div>
            <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginTop:"var(--s2)" }}>
              {completion<100 ? "Add more details to strengthen your profile" : "All Star profile! 🌟"}
            </div>
          </div>

          {/* Connection suggestions */}
          <div style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s4)" }}>
            <div className="label" style={{ marginBottom:"var(--s3)" }}>People You May Know</div>
            {suggestions.map(s => (
              <div key={s.id} style={{ marginBottom:"var(--s4)", paddingBottom:"var(--s4)",
                borderBottom:"1px solid var(--gb)" }}>
                <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s2)" }}>
                  <span style={{ fontSize:28 }}>{s.avatar}</span>
                  <div>
                    <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>{s.name}</div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t2)" }}>{s.title}</div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>{s.mutual} mutual connections</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"var(--s2)" }}>
                  <button className="btn btn-primary btn-sm" style={{ flex:1 }}
                    onClick={() => setConnected(c=>[...c,s.id])}>
                    Connect
                  </button>
                  <button className="btn btn-ghost btn-sm"
                    onClick={() => setIgnored(i=>[...i,s.id])}>
                    Ignore
                  </button>
                </div>
              </div>
            ))}
            {suggestions.length===0 && (
              <div style={{ color:"var(--t3)", fontSize:"var(--sm)", textAlign:"center" }}>
                No more suggestions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
