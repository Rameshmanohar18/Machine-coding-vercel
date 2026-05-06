/**
 * PROBLEM 43 — Job Board / Applicant Tracker
 * Asked at: LinkedIn, Naukri, Codenation (Coding Ninjas)
 *
 * Requirements:
 * - Job listings with search + multi-filter
 * - Apply flow with resume upload simulation
 * - Application tracker (Kanban: Applied → Screening → Interview → Offer → Rejected)
 * - Save/bookmark jobs
 * - Job detail modal
 * - Salary range filter
 * - Skills match indicator
 * - Application count per job
 */

import { useState, useMemo } from "react";

const JOBS = [
  { id:1,  title:"Senior Frontend Engineer", company:"Flipkart",   location:"Bangalore", type:"Full-time", salary:[25,45], skills:["React","TypeScript","Node.js"],    posted:"2d ago",  applicants:234 },
  { id:2,  title:"React Developer",          company:"Meesho",     location:"Bangalore", type:"Full-time", salary:[15,30], skills:["React","JavaScript","CSS"],         posted:"1d ago",  applicants:189 },
  { id:3,  title:"Full Stack Engineer",      company:"Razorpay",   location:"Bangalore", type:"Full-time", salary:[20,40], skills:["React","Node.js","PostgreSQL"],     posted:"3d ago",  applicants:312 },
  { id:4,  title:"Frontend Lead",            company:"Groww",      location:"Bangalore", type:"Full-time", salary:[30,55], skills:["React","Redux","Performance"],      posted:"5d ago",  applicants:156 },
  { id:5,  title:"UI Engineer",              company:"PhonePe",    location:"Bangalore", type:"Full-time", salary:[18,35], skills:["React","TypeScript","GraphQL"],     posted:"1d ago",  applicants:278 },
  { id:6,  title:"Frontend Developer",       company:"Freshworks", location:"Chennai",   type:"Full-time", salary:[12,25], skills:["React","JavaScript","REST APIs"],   posted:"4d ago",  applicants:445 },
  { id:7,  title:"React Native Developer",   company:"Dream11",    location:"Mumbai",    type:"Full-time", salary:[20,38], skills:["React Native","JavaScript","iOS"],  posted:"2d ago",  applicants:198 },
  { id:8,  title:"Senior UI Developer",      company:"Paytm",      location:"Noida",     type:"Full-time", salary:[22,42], skills:["React","Redux","Webpack"],          posted:"6d ago",  applicants:267 },
  { id:9,  title:"Frontend Intern",          company:"Zoho",       location:"Chennai",   type:"Internship",salary:[3,6],   skills:["HTML","CSS","JavaScript"],          posted:"1d ago",  applicants:892 },
  { id:10, title:"Staff Engineer",           company:"LinkedIn",   location:"Bangalore", type:"Full-time", salary:[50,90], skills:["React","System Design","TypeScript"],posted:"7d ago", applicants:89  },
];

const MY_SKILLS = ["React","TypeScript","JavaScript","Node.js","CSS"];

const STAGES = ["Applied","Screening","Interview","Offer","Rejected"];
const STAGE_COLORS = {
  Applied:"var(--info)", Screening:"var(--a2)", Interview:"var(--warn)",
  Offer:"var(--ok)", Rejected:"var(--err)"
};

let appId = 1;

export default function JobBoard() {
  const [search,    setSearch]    = useState("");
  const [filterLoc, setFilterLoc] = useState("All");
  const [filterType,setFilterType]= useState("All");
  const [minSalary, setMinSalary] = useState(0);
  const [saved,     setSaved]     = useState([]);
  const [applied,   setApplied]   = useState([]);
  const [applications, setApplications] = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [tab,       setTab]       = useState("jobs"); // jobs | tracker | saved
  const [applying,  setApplying]  = useState(null);
  const [applyStep, setApplyStep] = useState(0);

  const locations = ["All", ...new Set(JOBS.map(j=>j.location))];

  const filtered = useMemo(() => JOBS.filter(j => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) &&
        !j.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterLoc  !== "All" && j.location !== filterLoc)  return false;
    if (filterType !== "All" && j.type     !== filterType) return false;
    if (j.salary[0] < minSalary) return false;
    return true;
  }), [search, filterLoc, filterType, minSalary]);

  const skillMatch = (job) => {
    const matched = job.skills.filter(s => MY_SKILLS.includes(s));
    return Math.round((matched.length / job.skills.length) * 100);
  };

  const applyToJob = (job) => {
    if (applied.includes(job.id)) return;
    setApplied(a => [...a, job.id]);
    setApplications(a => [...a, {
      id:appId++, jobId:job.id, title:job.title, company:job.company,
      stage:"Applied", appliedAt:new Date().toLocaleDateString()
    }]);
    setApplying(null); setApplyStep(0);
  };

  const moveStage = (appId, stage) => {
    setApplications(a => a.map(x => x.id===appId ? { ...x, stage } : x));
  };

  const sel = JOBS.find(j=>j.id===selected);

  return (
    <div className="card">
      <h2 className="card-title">💼 Job Board</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at LinkedIn, Naukri, Codenation.</strong> Job listings with multi-filter,
        apply flow, application tracker (Kanban), save jobs, skills match indicator.
      </p>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--gb)", marginBottom:"var(--s5)" }}>
        {[["jobs",`💼 Jobs (${filtered.length})`],["tracker",`📋 Tracker (${applications.length})`],["saved",`🔖 Saved (${saved.length})`]].map(([t,l]) => (
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

      {/* JOBS TAB */}
      {tab === "jobs" && (
        <div style={{ display:"flex", gap:"var(--s5)", flexWrap:"wrap" }}>
          {/* Filters */}
          <div style={{ minWidth:200, flex:"0 0 200px" }}>
            <div className="form-row">
              <label className="label">Search</label>
              <input className="input" placeholder="Job title or company..."
                value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <div className="form-row">
              <label className="label">Location</label>
              <select className="select" value={filterLoc} onChange={e=>setFilterLoc(e.target.value)}>
                {locations.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="label">Type</label>
              <select className="select" value={filterType} onChange={e=>setFilterType(e.target.value)}>
                {["All","Full-time","Internship","Contract"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Min Salary: ₹{minSalary}L</label>
              <input type="range" min={0} max={50} step={5} value={minSalary}
                onChange={e=>setMinSalary(Number(e.target.value))}
                style={{ width:"100%", accentColor:"var(--a)" }} />
            </div>
          </div>

          {/* Job list */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
              {filtered.map(job => {
                const match = skillMatch(job);
                const isSaved   = saved.includes(job.id);
                const isApplied = applied.includes(job.id);
                return (
                  <div key={job.id} style={{
                    background:"var(--glass2)", border:`1px solid ${selected===job.id?"var(--a)":"var(--gb)"}`,
                    borderRadius:"var(--r2)", padding:"var(--s4)", transition:"all var(--tr)"
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"var(--s2)" }}>
                      <div>
                        <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--md)",
                          cursor:"pointer" }} onClick={() => setSelected(selected===job.id?null:job.id)}>
                          {job.title}
                        </div>
                        <div style={{ color:"var(--t2)", fontSize:"var(--sm)" }}>
                          {job.company} · {job.location} · {job.type}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:"var(--s2)", alignItems:"flex-start" }}>
                        <button onClick={() => setSaved(s=>s.includes(job.id)?s.filter(x=>x!==job.id):[...s,job.id])}
                          style={{ background:"none", border:"none", cursor:"pointer", fontSize:18 }}>
                          {isSaved?"🔖":"📌"}
                        </button>
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:"var(--s3)", flexWrap:"wrap", marginBottom:"var(--s3)" }}>
                      <span style={{ color:"var(--ok)", fontWeight:700, fontSize:"var(--sm)" }}>
                        ₹{job.salary[0]}–{job.salary[1]}L
                      </span>
                      <span style={{ color:"var(--t3)", fontSize:"var(--xs)" }}>{job.posted}</span>
                      <span style={{ color:"var(--t3)", fontSize:"var(--xs)" }}>{job.applicants} applicants</span>
                      <div style={{ display:"flex", alignItems:"center", gap:"var(--s1)" }}>
                        <div style={{ height:4, width:60, background:"var(--gb)", borderRadius:2, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${match}%`,
                            background:match>70?"var(--ok)":match>40?"var(--warn)":"var(--err)",
                            borderRadius:2 }} />
                        </div>
                        <span style={{ fontSize:"var(--xs)", color:"var(--t2)" }}>{match}% match</span>
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:"var(--s1)", flexWrap:"wrap", marginBottom:"var(--s3)" }}>
                      {job.skills.map(s => (
                        <span key={s} style={{
                          padding:"2px 8px", borderRadius:"var(--pill)", fontSize:"var(--xs)",
                          background:MY_SKILLS.includes(s)?"var(--ok-bg)":"var(--glass)",
                          color:MY_SKILLS.includes(s)?"var(--ok)":"var(--t3)",
                          border:`1px solid ${MY_SKILLS.includes(s)?"rgba(16,185,129,.3)":"var(--gb)"}`
                        }}>{s}</span>
                      ))}
                    </div>

                    {selected===job.id && (
                      <div style={{ background:"var(--glass)", borderRadius:"var(--r1)",
                        padding:"var(--s3)", marginBottom:"var(--s3)", fontSize:"var(--sm)",
                        color:"var(--t2)" }}>
                        We are looking for a passionate {job.title} to join our team at {job.company}.
                        You will work on cutting-edge products used by millions of users.
                        Strong knowledge of {job.skills.join(", ")} required.
                      </div>
                    )}

                    <button
                      className={`btn btn-sm ${isApplied?"btn-success":"btn-primary"}`}
                      onClick={() => !isApplied && applyToJob(job)}
                      disabled={isApplied}>
                      {isApplied?"✓ Applied":"Apply Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TRACKER TAB */}
      {tab === "tracker" && (
        <div>
          {applications.length===0 ? (
            <div style={{ textAlign:"center", color:"var(--t3)", padding:"var(--s10)" }}>
              No applications yet. Apply to jobs to track them here.
            </div>
          ) : (
            <div style={{ display:"flex", gap:"var(--s3)", overflowX:"auto", paddingBottom:"var(--s2)" }}>
              {STAGES.map(stage => (
                <div key={stage} style={{ minWidth:180, flex:"0 0 180px", background:"var(--glass)",
                  border:"1px solid var(--gb)", borderRadius:"var(--r3)", padding:"var(--s3)" }}>
                  <div style={{ fontWeight:800, fontSize:"var(--xs)", textTransform:"uppercase",
                    letterSpacing:".08em", color:STAGE_COLORS[stage], marginBottom:"var(--s3)" }}>
                    {stage} ({applications.filter(a=>a.stage===stage).length})
                  </div>
                  {applications.filter(a=>a.stage===stage).map(app => (
                    <div key={app.id} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
                      borderRadius:"var(--r2)", padding:"var(--s3)", marginBottom:"var(--s2)" }}>
                      <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--xs)",
                        marginBottom:2 }}>{app.title}</div>
                      <div style={{ fontSize:"var(--xs)", color:"var(--t3)", marginBottom:"var(--s2)" }}>
                        {app.company} · {app.appliedAt}
                      </div>
                      <select className="select" style={{ fontSize:"var(--xs)", padding:"4px 6px" }}
                        value={app.stage} onChange={e=>moveStage(app.id,e.target.value)}>
                        {STAGES.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAVED TAB */}
      {tab === "saved" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"var(--s3)" }}>
          {saved.length===0 ? (
            <div style={{ textAlign:"center", color:"var(--t3)", padding:"var(--s10)" }}>
              No saved jobs. Click 📌 on any job to save it.
            </div>
          ) : JOBS.filter(j=>saved.includes(j.id)).map(job => (
            <div key={job.id} style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)" }}>
              <div>
                <div style={{ fontWeight:700, color:"var(--t1)" }}>{job.title}</div>
                <div style={{ fontSize:"var(--sm)", color:"var(--t2)" }}>{job.company} · {job.location}</div>
                <div style={{ fontSize:"var(--sm)", color:"var(--ok)", fontWeight:700 }}>
                  ₹{job.salary[0]}–{job.salary[1]}L
                </div>
              </div>
              <div style={{ display:"flex", gap:"var(--s2)" }}>
                <button className="btn btn-primary btn-sm"
                  onClick={() => applyToJob(job)}
                  disabled={applied.includes(job.id)}>
                  {applied.includes(job.id)?"Applied":"Apply"}
                </button>
                <button className="btn btn-danger btn-sm"
                  onClick={() => setSaved(s=>s.filter(x=>x!==job.id))}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
