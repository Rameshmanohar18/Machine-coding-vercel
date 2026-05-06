/**
 * PROBLEM 39 — Fantasy Sports Team Builder
 * Asked at: Dream11, MPL, My11Circle
 *
 * Requirements:
 * - Pick 11 players from a pool (cricket)
 * - Role constraints: 1-4 WK, 3-6 BAT, 1-4 AR, 3-6 BOWL
 * - Max 7 players from one team
 * - Credit budget (100 credits)
 * - Captain (2x) and Vice-Captain (1.5x) selection
 * - Player stats (avg points, form, selection%)
 * - Team preview with formation
 * - Multiple team creation
 */

import { useState, useMemo } from "react";

const ROLES = { WK:"Wicket Keeper", BAT:"Batsman", AR:"All Rounder", BOWL:"Bowler" };
const ROLE_COLORS = { WK:"var(--info)", BAT:"var(--ok)", AR:"var(--warn)", BOWL:"var(--a2)" };

const PLAYERS = [
  // Team A (India)
  { id:1,  name:"Rohit Sharma",    role:"BAT",  team:"IND", credits:10.5, avgPts:68, form:8.5, sel:82 },
  { id:2,  name:"Virat Kohli",     role:"BAT",  team:"IND", credits:11.0, avgPts:72, form:9.2, sel:91 },
  { id:3,  name:"KL Rahul",        role:"WK",   team:"IND", credits:10.0, avgPts:58, form:7.8, sel:74 },
  { id:4,  name:"Hardik Pandya",   role:"AR",   team:"IND", credits:9.5,  avgPts:62, form:8.0, sel:68 },
  { id:5,  name:"Ravindra Jadeja", role:"AR",   team:"IND", credits:9.0,  avgPts:55, form:7.5, sel:61 },
  { id:6,  name:"Jasprit Bumrah",  role:"BOWL", team:"IND", credits:9.5,  avgPts:65, form:9.0, sel:88 },
  { id:7,  name:"Mohammed Shami",  role:"BOWL", team:"IND", credits:8.5,  avgPts:52, form:7.2, sel:55 },
  { id:8,  name:"Shubman Gill",    role:"BAT",  team:"IND", credits:9.0,  avgPts:60, form:8.3, sel:72 },
  // Team B (Australia)
  { id:9,  name:"David Warner",    role:"BAT",  team:"AUS", credits:10.0, avgPts:65, form:8.0, sel:78 },
  { id:10, name:"Steve Smith",     role:"BAT",  team:"AUS", credits:10.5, avgPts:70, form:8.8, sel:85 },
  { id:11, name:"Pat Cummins",     role:"BOWL", team:"AUS", credits:9.5,  avgPts:63, form:8.5, sel:80 },
  { id:12, name:"Mitchell Starc",  role:"BOWL", team:"AUS", credits:9.0,  avgPts:58, form:7.8, sel:65 },
  { id:13, name:"Glenn Maxwell",   role:"AR",   team:"AUS", credits:9.5,  avgPts:60, form:8.2, sel:70 },
  { id:14, name:"Alex Carey",      role:"WK",   team:"AUS", credits:8.5,  avgPts:48, form:7.0, sel:52 },
  { id:15, name:"Travis Head",     role:"BAT",  team:"AUS", credits:9.0,  avgPts:62, form:8.4, sel:75 },
  { id:16, name:"Adam Zampa",      role:"BOWL", team:"AUS", credits:8.0,  avgPts:50, form:7.5, sel:58 },
];

const CONSTRAINTS = {
  WK:  { min:1, max:4 },
  BAT: { min:3, max:6 },
  AR:  { min:1, max:4 },
  BOWL:{ min:3, max:6 },
};

export default function Fantasy11() {
  const [selected, setSelected] = useState([]);
  const [captain,  setCaptain]  = useState(null);
  const [viceCap,  setViceCap]  = useState(null);
  const [filterRole, setFilterRole] = useState("All");
  const [filterTeam, setFilterTeam] = useState("All");
  const [teams,    setTeams]    = useState([]);
  const [tab,      setTab]      = useState("players"); // players | team | teams

  const selectedPlayers = PLAYERS.filter(p => selected.includes(p.id));
  const credits = selectedPlayers.reduce((s,p) => s+p.credits, 0);
  const creditsLeft = 100 - credits;

  const roleCounts = useMemo(() => {
    const c = { WK:0, BAT:0, AR:0, BOWL:0 };
    selectedPlayers.forEach(p => c[p.role]++);
    return c;
  }, [selectedPlayers]);

  const teamCounts = useMemo(() => {
    const c = {};
    selectedPlayers.forEach(p => { c[p.team]=(c[p.team]||0)+1; });
    return c;
  }, [selectedPlayers]);

  const canAdd = (player) => {
    if (selected.includes(player.id)) return true; // can always deselect
    if (selected.length >= 11) return false;
    if (creditsLeft < player.credits) return false;
    if ((teamCounts[player.team]||0) >= 7) return false;
    const roleCount = roleCounts[player.role];
    if (roleCount >= CONSTRAINTS[player.role].max) return false;
    return true;
  };

  const togglePlayer = (id) => {
    if (selected.includes(id)) {
      setSelected(s => s.filter(x=>x!==id));
      if (captain===id) setCaptain(null);
      if (viceCap===id) setViceCap(null);
    } else {
      if (canAdd(PLAYERS.find(p=>p.id===id))) setSelected(s=>[...s,id]);
    }
  };

  const isValid = useMemo(() => {
    if (selected.length !== 11) return false;
    return Object.entries(CONSTRAINTS).every(([role,{min}]) => roleCounts[role] >= min);
  }, [selected, roleCounts]);

  const saveTeam = () => {
    if (!isValid || !captain || !viceCap) return;
    setTeams(t => [...t, { id:Date.now(), players:selectedPlayers, captain, viceCap }]);
    setSelected([]); setCaptain(null); setViceCap(null);
    setTab("teams");
  };

  const filtered = PLAYERS.filter(p => {
    if (filterRole !== "All" && p.role !== filterRole) return false;
    if (filterTeam !== "All" && p.team !== filterTeam) return false;
    return true;
  });

  const POSITIONS = {
    WK:  [{ x:50, y:85 }],
    BAT: [{ x:20,y:65},{x:40,y:65},{x:60,y:65},{x:80,y:65},{x:50,y:55}],
    AR:  [{ x:30,y:40},{x:50,y:40},{x:70,y:40}],
    BOWL:[{ x:20,y:20},{x:40,y:20},{x:60,y:20},{x:80,y:20}],
  };

  return (
    <div className="card">
      <h2 className="card-title">🏏 Fantasy Team Builder</h2>
      <p style={{ marginBottom:"var(--s5)" }}>
        <strong>Asked at Dream11, MPL.</strong> Pick 11 players with role/team/credit constraints,
        captain/vice-captain selection, team preview, save multiple teams.
      </p>

      {/* Stats bar */}
      <div style={{ display:"flex", gap:"var(--s4)", marginBottom:"var(--s5)", flexWrap:"wrap" }}>
        {[
          { label:"Players",  val:`${selected.length}/11`, color:selected.length===11?"var(--ok)":"var(--a2)" },
          { label:"Credits",  val:`${creditsLeft.toFixed(1)} left`, color:creditsLeft<10?"var(--err)":"var(--ok)" },
          ...Object.entries(roleCounts).map(([role,count]) => ({
            label:role, val:`${count}/${CONSTRAINTS[role].max}`,
            color:count<CONSTRAINTS[role].min?"var(--err)":"var(--ok)"
          })),
        ].map(c => (
          <div key={c.label} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
            borderRadius:"var(--r2)", padding:"var(--s2) var(--s4)", textAlign:"center" }}>
            <div className="label">{c.label}</div>
            <div style={{ fontWeight:800, color:c.color, fontSize:"var(--md)" }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid var(--gb)", marginBottom:"var(--s4)" }}>
        {[["players","👥 Players"],["team","🏟 My Team"],["teams",`📋 Saved (${teams.length})`]].map(([t,l]) => (
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

      {/* PLAYERS TAB */}
      {tab === "players" && (
        <div>
          <div style={{ display:"flex", gap:"var(--s2)", marginBottom:"var(--s4)", flexWrap:"wrap" }}>
            {["All",...Object.keys(ROLES)].map(r => (
              <button key={r} className={`btn btn-sm ${filterRole===r?"btn-primary":"btn-ghost"}`}
                onClick={() => setFilterRole(r)}>{r}</button>
            ))}
            <div style={{ marginLeft:"auto", display:"flex", gap:"var(--s1)" }}>
              {["All","IND","AUS"].map(t => (
                <button key={t} className={`btn btn-sm ${filterTeam===t?"btn-primary":"btn-ghost"}`}
                  onClick={() => setFilterTeam(t)}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"var(--s2)" }}>
            {filtered.map(p => {
              const isSel = selected.includes(p.id);
              const isCap = captain===p.id;
              const isVC  = viceCap===p.id;
              const canSelect = canAdd(p);
              return (
                <div key={p.id} style={{
                  display:"flex", alignItems:"center", gap:"var(--s3)",
                  background:isSel?"var(--abg)":"var(--glass2)",
                  border:`1px solid ${isSel?"var(--a)":"var(--gb)"}`,
                  borderRadius:"var(--r2)", padding:"10px 14px",
                  opacity:!isSel&&!canSelect?0.4:1, transition:"all var(--tr)"
                }}>
                  <div style={{ width:36, height:36, borderRadius:"50%",
                    background:ROLE_COLORS[p.role]+"22", border:`1px solid ${ROLE_COLORS[p.role]}44`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"var(--xs)", fontWeight:800, color:ROLE_COLORS[p.role] }}>
                    {p.role}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, color:"var(--t1)", fontSize:"var(--sm)" }}>
                      {p.name}
                      {isCap && <span style={{ marginLeft:"var(--s2)", background:"var(--warn)",
                        color:"#000", borderRadius:"var(--pill)", padding:"1px 6px", fontSize:"var(--xs)" }}>C</span>}
                      {isVC && <span style={{ marginLeft:"var(--s2)", background:"var(--info)",
                        color:"#000", borderRadius:"var(--pill)", padding:"1px 6px", fontSize:"var(--xs)" }}>VC</span>}
                    </div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>
                      {p.team} · Avg {p.avgPts}pts · {p.sel}% selected
                    </div>
                  </div>
                  <div style={{ textAlign:"right", marginRight:"var(--s2)" }}>
                    <div style={{ fontWeight:700, color:"var(--a2)" }}>{p.credits}cr</div>
                    <div style={{ fontSize:"var(--xs)", color:"var(--t3)" }}>Form: {p.form}</div>
                  </div>
                  {isSel && (
                    <div style={{ display:"flex", gap:"var(--s1)" }}>
                      <button className={`btn btn-sm ${isCap?"btn-warn":"btn-ghost"}`}
                        onClick={() => { setCaptain(isCap?null:p.id); if(viceCap===p.id)setViceCap(null); }}>
                        C
                      </button>
                      <button className={`btn btn-sm ${isVC?"btn-info":"btn-ghost"}`}
                        onClick={() => { setViceCap(isVC?null:p.id); if(captain===p.id)setCaptain(null); }}>
                        VC
                      </button>
                    </div>
                  )}
                  <button
                    className={`btn btn-sm ${isSel?"btn-danger":"btn-primary"}`}
                    onClick={() => togglePlayer(p.id)}
                    disabled={!isSel&&!canSelect}>
                    {isSel?"−":"+"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TEAM TAB */}
      {tab === "team" && (
        <div>
          {/* Cricket field */}
          <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,.2)",
            borderRadius:"var(--r3)", padding:"var(--s4)", marginBottom:"var(--s5)",
            position:"relative", minHeight:300 }}>
            <div style={{ textAlign:"center", color:"rgba(16,185,129,.3)", fontSize:"var(--xs)",
              position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
              width:120, height:120, borderRadius:"50%", border:"2px solid rgba(16,185,129,.2)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              PITCH
            </div>
            {Object.entries(POSITIONS).map(([role, positions]) => {
              const rolePlayers = selectedPlayers.filter(p=>p.role===role);
              return rolePlayers.map((p, i) => {
                const pos = positions[i] || positions[0];
                const isCap = captain===p.id;
                const isVC  = viceCap===p.id;
                return (
                  <div key={p.id} style={{
                    position:"absolute", left:`${pos.x}%`, top:`${pos.y}%`,
                    transform:"translate(-50%,-50%)", textAlign:"center"
                  }}>
                    <div style={{ width:40, height:40, borderRadius:"50%",
                      background:ROLE_COLORS[p.role], display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:18, margin:"0 auto",
                      border:isCap?"3px solid #f59e0b":isVC?"3px solid var(--info)":"none",
                      position:"relative" }}>
                      🏏
                      {isCap && <span style={{ position:"absolute", top:-8, right:-8,
                        background:"#f59e0b", color:"#000", borderRadius:"50%",
                        width:16, height:16, fontSize:9, fontWeight:800,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>C</span>}
                    </div>
                    <div style={{ fontSize:9, color:"var(--t1)", fontWeight:700, marginTop:2,
                      maxWidth:60, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {p.name.split(" ")[1]||p.name}
                    </div>
                  </div>
                );
              });
            })}
          </div>

          {!isValid && (
            <div style={{ background:"var(--warn-bg)", border:"1px solid rgba(245,158,11,.3)",
              borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)", marginBottom:"var(--s4)",
              fontSize:"var(--sm)", color:"var(--warn)" }}>
              ⚠ {selected.length<11 ? `Select ${11-selected.length} more players` : "Check role constraints"}
            </div>
          )}

          {isValid && (!captain || !viceCap) && (
            <div style={{ background:"var(--info-bg)", border:"1px solid rgba(34,211,238,.3)",
              borderRadius:"var(--r2)", padding:"var(--s3) var(--s4)", marginBottom:"var(--s4)",
              fontSize:"var(--sm)", color:"var(--info)" }}>
              ℹ Select Captain (C) and Vice-Captain (VC) from the Players tab
            </div>
          )}

          <button className="btn btn-primary" style={{ width:"100%" }}
            onClick={saveTeam} disabled={!isValid||!captain||!viceCap}>
            Save Team
          </button>
        </div>
      )}

      {/* SAVED TEAMS */}
      {tab === "teams" && (
        <div>
          {teams.length===0 ? (
            <div style={{ textAlign:"center", color:"var(--t3)", padding:"var(--s10)" }}>
              No teams saved yet. Build and save a team first.
            </div>
          ) : teams.map((t,i) => (
            <div key={t.id} style={{ background:"var(--glass2)", border:"1px solid var(--gb)",
              borderRadius:"var(--r2)", padding:"var(--s4)", marginBottom:"var(--s3)" }}>
              <div style={{ fontWeight:700, color:"var(--t1)", marginBottom:"var(--s3)" }}>
                Team {i+1}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"var(--s2)" }}>
                {t.players.map(p => (
                  <span key={p.id} style={{
                    padding:"2px 8px", borderRadius:"var(--pill)", fontSize:"var(--xs)",
                    background:ROLE_COLORS[p.role]+"22", color:ROLE_COLORS[p.role],
                    border:`1px solid ${ROLE_COLORS[p.role]}44`, fontWeight:600
                  }}>
                    {p.id===t.captain?"👑 ":p.id===t.viceCap?"⭐ ":""}{p.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
